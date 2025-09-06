import express from 'express';
import { db } from './db';
import * as schema from '../shared/schema';
import { eq, gt, and } from 'drizzle-orm';

// Middleware to extract user ID from authenticated session
export async function getUserId(req: express.Request): Promise<string> {
  // First check for token-based auth (custom login system) - DATABASE VERSION
  const authHeader = req.headers.authorization;
  const token = authHeader?.replace('Bearer ', '');
  console.log('getUserId: Auth header:', authHeader ? 'Present: ' + authHeader.substring(0, 15) + '...' : 'Missing');
  console.log('getUserId: Extracted token:', token ? 'Present: ' + token.substring(0, 15) + '...' : 'Missing or empty');
  if (token && token.trim()) {
    try {
      console.log('getUserId: Checking token in database:', token.substring(0, 20) + '...');
      const [tokenRecord] = await db.select()
        .from(schema.auth_tokens)
        .where(and(
          eq(schema.auth_tokens.token, token),
          gt(schema.auth_tokens.expires_at, new Date())
        ))
        .limit(1);
      
      console.log('getUserId: Database lookup result:', tokenRecord ? 'Found user: ' + tokenRecord.user_id : 'No matching token found');
      if (tokenRecord) {
        return tokenRecord.user_id;
      }
    } catch (error) {
      console.warn('Error checking auth token in database:', error);
      // If the table doesn't exist, we'll fall through to other auth methods
      // The table will be created when the first user logs in via custom-login
    }
  }
  
  // Check for Replit Auth session
  const user = (req as any).user;
  if (user && user.claims && user.claims.sub) {
    return user.claims.sub;
  }
  
  // Log when we can't find user ID to debug authentication issues
  console.warn('getUserId: Could not extract user ID from request. Session authenticated:', !!(req as any).isAuthenticated?.());
  console.warn('getUserId: Headers:', req.headers.authorization ? 'Bearer token present' : 'No auth header');
  console.warn('getUserId: User object:', user ? 'User object exists' : 'No user object');
  
  // Default fallback - but this should rarely be used in production
  return 'anonymous-user';
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