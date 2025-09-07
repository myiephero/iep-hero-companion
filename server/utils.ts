import express from 'express';
import { db } from './db';
import * as schema from '../shared/schema';
import { eq, gt, and } from 'drizzle-orm';

// Middleware to extract user ID from authenticated session
export async function getUserId(req: express.Request): Promise<string> {
  // First check for token-based auth (custom login system) - DATABASE VERSION
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (token && token.trim()) {
    try {
      const [tokenRecord] = await db.select()
        .from(schema.auth_tokens)
        .where(and(
          eq(schema.auth_tokens.token, token),
          gt(schema.auth_tokens.expires_at, new Date())
        ))
        .limit(1);
      
      if (tokenRecord) {
        return tokenRecord.user_id;
      }
    } catch (error) {
      console.warn('Error checking auth token in database:', error);
    }
  }
  
  // Check for Replit Auth session
  const user = (req as any).user;
  
  if (user && user.claims && user.claims.sub) {
    return user.claims.sub;
  }
  
  // Enhanced session debugging for main endpoints
  const session = (req as any).session;
  console.log('getUserId: Full session object:', JSON.stringify(session, null, 2));
  console.log('getUserId: Request headers:', JSON.stringify(req.headers, null, 2));
  
  if (!user && session && session.passport && session.passport.user) {
    console.log('getUserId: Found session user:', session.passport.user.claims?.sub);
    return session.passport.user.claims?.sub;
  }
  
  // Try direct session access
  if (!user && session) {
    console.log('getUserId: Checking all session keys:', Object.keys(session));
    for (const key of Object.keys(session)) {
      console.log(`getUserId: Session[${key}]:`, session[key]);
    }
  }
  
  // CRITICAL: Don't return a default fallback - throw error to force proper authentication
  throw new Error('Authentication required - no valid user ID found');
}

// Synchronous version for backward compatibility (tries token check without database)
export function getUserIdSync(req: express.Request): string {
  // Check for Replit Auth session first (most reliable)
  const user = (req as any).user;
  if (user && user.claims && user.claims.sub) {
    return user.claims.sub;
  }
  
  // Return anonymous for token-based auth since we can't do async DB check
  return 'anonymous-user';
}