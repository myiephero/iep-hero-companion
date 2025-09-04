import * as client from "openid-client";
import { Strategy, type VerifyFunction } from "openid-client/passport";
import passport from "passport";
import session from "express-session";
import type { Express, RequestHandler } from "express";
import memoize from "memoizee";
import connectPg from "connect-pg-simple";
import { storage } from "./storage";

// Extend Express Request type for auth
declare global {
  namespace Express {
    interface User {
      claims?: any;
      access_token?: string;
      refresh_token?: string;
      expires_at?: number;
    }
    interface Request {
      user?: User;
      isAuthenticated(): boolean;
      logout(callback: (err?: any) => void): void;
    }
  }
}

if (!process.env.REPLIT_DOMAINS) {
  throw new Error("Environment variable REPLIT_DOMAINS not provided");
}

const getOidcConfig = memoize(
  async () => {
    return await client.discovery(
      new URL(process.env.ISSUER_URL ?? "https://replit.com/oidc"),
      process.env.REPL_ID!
    );
  },
  { maxAge: 3600 * 1000 }
);

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: false,
    ttl: sessionTtl,
    tableName: "sessions",
  });
  return session({
    secret: process.env.SESSION_SECRET || 'dev-secret-key-change-in-production',
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false, // Set to false for development
      maxAge: sessionTtl,
    },
  });
}

function updateUserSession(
  user: any,
  tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers
) {
  user.claims = tokens.claims();
  user.access_token = tokens.access_token;
  user.refresh_token = tokens.refresh_token;
  user.expires_at = user.claims?.exp;
}

async function upsertUser(
  claims: any,
) {
  await storage.upsertUser({
    id: claims["sub"],
    email: claims["email"],
    firstName: claims["first_name"],
    lastName: claims["last_name"],
    profileImageUrl: claims["profile_image_url"],
  });
}

export async function setupAuth(app: Express) {
  try {
    app.set("trust proxy", 1);
    app.use(getSession());
    app.use(passport.initialize());
    app.use(passport.session());

    console.log('Setting up Replit Auth...');
    const config = await getOidcConfig();
    console.log('OIDC config loaded successfully');

  const verify: VerifyFunction = async (
    tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers,
    verified: passport.AuthenticateCallback
  ) => {
    const user = {};
    updateUserSession(user, tokens);
    await upsertUser(tokens.claims());
    verified(null, user);
  };

  for (const domain of process.env
    .REPLIT_DOMAINS!.split(",")) {
    console.log(`Setting up auth strategy for domain: ${domain}`);
    const strategy = new Strategy(
      {
        name: `replitauth:${domain}`,
        config,
        scope: "openid email profile offline_access",
        callbackURL: `https://${domain}/api/callback`,
      },
      verify,
    );
    passport.use(strategy);
    console.log(`Auth strategy registered: replitauth:${domain}`);
  }

  passport.serializeUser((user: Express.User, cb) => cb(null, user));
  passport.deserializeUser((user: Express.User, cb) => cb(null, user));

  app.get("/api/login", (req, res, next) => {
    // Use the actual Replit domain instead of localhost
    const domain = process.env.REPLIT_DOMAINS!.split(",")[0];
    passport.authenticate(`replitauth:${domain}`, {
      prompt: "login consent",
      scope: ["openid", "email", "profile", "offline_access"],
    })(req, res, next);
  });

  app.get("/api/callback", (req, res, next) => {
    // Use the actual Replit domain instead of localhost
    const domain = process.env.REPLIT_DOMAINS!.split(",")[0];
    passport.authenticate(`replitauth:${domain}`, {
      failureRedirect: "/api/login",
    })(req, res, (err) => {
      if (err) {
        return next(err);
      }
      
      // Check for subscription intent after successful login
      const subscriptionIntent = (req.session as any)?.subscriptionIntent;
      if (subscriptionIntent) {
        // Clear the intent from session
        delete (req.session as any).subscriptionIntent;
        
        // Redirect to subscription completion flow
        const params = new URLSearchParams({
          priceId: subscriptionIntent.priceId,
          planName: subscriptionIntent.planName,
          planId: subscriptionIntent.planId,
          role: subscriptionIntent.role
        });
        
        return res.redirect(`/subscription-setup?${params.toString()}`);
      }
      
      // Default redirect
      res.redirect("/");
    });
  });

  app.get("/api/logout", (req, res) => {
    req.logout(() => {
      // Use the actual Replit domain instead of localhost for logout redirect
      const domain = process.env.REPLIT_DOMAINS!.split(",")[0];
      res.redirect(
        client.buildEndSessionUrl(config, {
          client_id: process.env.REPL_ID!,
          post_logout_redirect_uri: `https://${domain}/`,
        }).href
      );
    });
  });
  
  console.log('Replit Auth setup completed successfully');
  
  } catch (error) {
    console.error('Error setting up Replit Auth:', error);
    throw error;
  }
}

export const isAuthenticated: RequestHandler = async (req, res, next) => {
  // First check for custom token-based auth (My IEP Hero users)
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (token && (global as any).activeTokens && (global as any).activeTokens[token]) {
    const tokenData = (global as any).activeTokens[token];
    // Check if token is not expired (24 hours)
    if (Date.now() - tokenData.createdAt < 24 * 60 * 60 * 1000) {
      // Add user info to request for consistency
      (req as any).user = {
        claims: {
          sub: tokenData.userId
        },
        role: tokenData.userRole
      };
      return next();
    }
  }

  // Fallback to Replit Auth
  const user = req.user as any;

  if (!req.isAuthenticated() || !user.expires_at) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const now = Math.floor(Date.now() / 1000);
  if (now <= user.expires_at) {
    return next();
  }

  const refreshToken = user.refresh_token;
  if (!refreshToken) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  try {
    const config = await getOidcConfig();
    const tokenResponse = await client.refreshTokenGrant(config, refreshToken);
    updateUserSession(user, tokenResponse);
    return next();
  } catch (error) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }
};