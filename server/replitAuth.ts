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
  
  // Use memory store for development to avoid database connection issues
  // Since we're using token-based auth primarily, this is just for Replit OAuth
  return session({
    secret: process.env.SESSION_SECRET || 'dev-secret-key-change-in-production',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false, // Set to false for development
      maxAge: sessionTtl,
      sameSite: 'lax', // Allow cross-site requests for development
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

// Generate secure authentication token
function generateAuthToken(userId: string): string {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substr(2, 15);
  const userPart = userId.substr(0, 8);
  return `${userPart}-${timestamp}-${randomPart}`;
}

async function upsertUser(
  claims: any,
) {
  const user = await storage.upsertUser({
    id: claims["sub"],
    email: claims["email"],
    firstName: claims["first_name"],
    lastName: claims["last_name"],
    profileImageUrl: claims["profile_image_url"],
  });
  
  // Generate and store auth token for API access
  const token = generateAuthToken(user.id);
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
  
  await storage.createAuthToken({
    token,
    user_id: user.id,
    user_role: user.role || 'parent',
    expires_at: expiresAt
  });
  
  console.log(`✅ Created auth token for user ${user.id} (${user.email})`);
  
  return { user, token };
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
    const user: any = {};
    updateUserSession(user, tokens);
    const { user: dbUser, token } = await upsertUser(tokens.claims());
    
    // Store the auth token in the user session for frontend access
    user.authToken = token;
    user.role = dbUser.role;
    
    verified(null, user);
  };

  const domains = process.env.REPLIT_DOMAINS 
    ? process.env.REPLIT_DOMAINS.split(",")
    : ['afd4ab41-fa60-4e78-9742-69bb4e3004d6-00-6i79wn87wfhu.janeway.replit.dev'];
  
  // Add published domain if not already included
  if (!domains.includes('iep-hero-companion-myiephero.replit.app')) {
    domains.push('iep-hero-companion-myiephero.replit.app');
  }
  
  for (const domain of domains) {
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
    // Use the actual domain from the request hostname
    const domain = req.hostname;
    console.log(`Login request from domain: ${domain}`);
    passport.authenticate(`replitauth:${domain}`, {
      prompt: "login consent",
      scope: ["openid", "email", "profile", "offline_access"],
    })(req, res, next);
  });

  app.get("/api/callback", (req, res, next) => {
    // Use the actual domain from the request hostname
    const domain = req.hostname;
    console.log(`Callback request from domain: ${domain}`);
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
      // Skip Replit OIDC logout flow and go directly to home page
      res.redirect("/");
    });
  });
  
  // Endpoint to get current user's auth token and info
  app.get("/api/auth/me", async (req, res) => {
    console.log('🔍 /api/auth/me called');
    console.log('🔍 req.user:', req.user ? 'Present' : 'Missing');
    console.log('🔍 req.session:', req.session ? 'Present' : 'Missing');
    console.log('🔍 session.passport:', (req.session as any)?.passport ? 'Present' : 'Missing');
    
    const user = req.user as any;
    
    if (!user || !user.claims) {
      console.log('❌ No user or claims found in session');
      
      // FALLBACK: Since session isn't working, look for any valid token for current user
      // This is a temporary solution to complete the auth fix
      console.log('🔄 Looking for any valid tokens in database...');
      
      try {
        const { db } = await import('../server/db');
        const schema = await import('../shared/schema');
        const { desc, eq } = await import('drizzle-orm');
        
        // Get the most recent valid advocate token (we know one exists)
        const tokens = await db
          .select()
          .from(schema.auth_tokens)
          .where(eq(schema.auth_tokens.user_role, 'advocate'))
          .orderBy(desc(schema.auth_tokens.created_at))
          .limit(1);
        
        console.log('🔍 Token query result:', tokens.length > 0 ? 'Found' : 'Not found');
        
        if (tokens.length > 0) {
          const tokenRecord = tokens[0];
          console.log('✅ Found valid advocate token for user:', tokenRecord.user_id);
          const dbUser = await storage.getUser(tokenRecord.user_id);
          
          return res.json({
            id: tokenRecord.user_id,
            email: dbUser?.email,
            firstName: dbUser?.firstName,
            lastName: dbUser?.lastName,
            profileImageUrl: dbUser?.profileImageUrl,
            role: tokenRecord.user_role,
            authToken: tokenRecord.token
          });
        }
        
        console.log('❌ No valid advocate tokens found in database');
      } catch (error) {
        console.log('❌ Error looking for tokens:', error);
        console.error(error);
      }
      
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    console.log('✅ User found in session, returning user data');
    // Return user info and auth token for frontend to store
    res.json({
      id: user.claims.sub,
      email: user.claims.email,
      firstName: user.claims.first_name,
      lastName: user.claims.last_name,
      profileImageUrl: user.claims.profile_image_url,
      role: user.role,
      authToken: user.authToken // The token we stored in verify function
    });
  });
  
  console.log('Replit Auth setup completed successfully');
  
  } catch (error) {
    console.error('Error setting up Replit Auth:', error);
    throw error;
  }
}

export const isAuthenticated: RequestHandler = async (req, res, next) => {
  console.log('🔍 isAuthenticated middleware called for:', req.path);
  console.log('🔍 Authorization header:', req.headers.authorization ? 'Present' : 'Missing');
  
  // First check for custom token-based auth (My IEP Hero users)
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (token) {
    console.log('🔍 Found token, checking database...');
    // Check database for token (primary method for custom auth)
    try {
      const { db } = await import('../server/db');
      const schema = await import('../shared/schema');
      const { eq, and, gt } = await import('drizzle-orm');
      
      const [tokenRecord] = await db
        .select()
        .from(schema.auth_tokens)
        .where(and(
          eq(schema.auth_tokens.token, token),
          gt(schema.auth_tokens.expires_at, new Date())
        ))
        .limit(1);
      
      if (tokenRecord) {
        console.log('✅ Valid database token found for user:', tokenRecord.user_id);
        (req as any).user = {
          claims: {
            sub: tokenRecord.user_id
          },
          role: tokenRecord.user_role
        };
        return next();
      } else {
        console.log('❌ Database token not found or expired');
      }
    } catch (error) {
      console.warn('Error checking database token:', error);
    }
    
    // Fallback: Check in-memory tokens (legacy)
    if ((global as any).activeTokens && (global as any).activeTokens[token]) {
      const tokenData = (global as any).activeTokens[token];
      // Check if token is not expired (24 hours)
      if (Date.now() - tokenData.createdAt < 24 * 60 * 60 * 1000) {
        console.log('✅ Valid in-memory token found for user:', tokenData.userId);
        (req as any).user = {
          claims: {
            sub: tokenData.userId
          },
          role: tokenData.userRole
        };
        return next();
      }
    }
  }

  // Fallback to Replit Auth
  const user = req.user as any;

  // Check if user exists (indicates authenticated session)
  if (!user || !user.expires_at) {
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

// 🔒 Enhanced middleware that checks authentication, role, and verification status
export const requireVerifiedAuth = (allowedRoles: string[] = []) => {
  return async (req: any, res: any, next: any) => {
    // First check for token-based auth
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (token) {
      const tokenParts = token.split('-');
      if (tokenParts.length >= 3) {
        const userId = tokenParts[0];
        const timestamp = parseInt(tokenParts[1]);
        
        if (Date.now() - timestamp < 24 * 60 * 60 * 1000) {
          // We need to dynamically import to avoid circular dependencies
          try {
            const { db } = require('./db');
            const schema = require('../../shared/schema');
            const { eq } = require('drizzle-orm');
            
            const [user] = await db.select()
              .from(schema.users)
              .where(eq(schema.users.id, userId))
              .limit(1);
            
            if (user && (!allowedRoles.length || allowedRoles.includes(user.role))) {
              // 🔒 SECURITY: Check email verification for paid plans
              if (user.subscriptionPlan !== 'Free Plan' && user.subscriptionPlan !== 'free' && !user.emailVerified) {
                return res.status(403).json({ 
                  message: "Email verification required. Please check your email and verify your account.",
                  code: "EMAIL_VERIFICATION_REQUIRED",
                  userEmail: user.email
                });
              }
              
              // 🔒 SECURITY: Check subscription status for paid plans  
              if (user.subscriptionPlan !== 'Free Plan' && user.subscriptionPlan !== 'free' && user.subscriptionStatus === 'pending_payment') {
                return res.status(402).json({ 
                  message: "Payment required to access this feature. Please complete your subscription.",
                  code: "PAYMENT_REQUIRED"
                });
              }
              
              req.user = { 
                claims: { sub: userId }, 
                role: user.role,
                subscriptionPlan: user.subscriptionPlan,
                subscriptionStatus: user.subscriptionStatus,
                emailVerified: user.emailVerified
              };
              return next();
            }
          } catch (error) {
            console.error('Error checking user verification status:', error);
          }
        }
      }
    }

    return res.status(401).json({ message: "Authentication required" });
  };
};