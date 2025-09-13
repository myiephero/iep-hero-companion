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
      // 🔒 CRITICAL SECURITY FIX: Validate token format before database lookup
      const tokenParts = token.split('-');
      if (tokenParts.length < 3 || tokenParts[0].length < 8) {
        console.warn('🚨 SECURITY: Invalid token format detected in getUserId - rejecting authentication');
        throw new Error('Authentication required');
      }
      
      const [tokenRecord] = await db.select()
        .from(schema.auth_tokens)
        .where(and(
          eq(schema.auth_tokens.token, token),
          gt(schema.auth_tokens.expires_at, new Date())
        ))
        .limit(1);
      
      if (tokenRecord) {
        // 🔒 CRITICAL SECURITY FIX: Validate token ownership matches database
        const tokenUserId = tokenParts[0];
        const dbUserId = tokenRecord.user_id; // Remove substring - use full user ID
        
        if (tokenUserId !== dbUserId || !token.startsWith(dbUserId + '-')) {
          console.error('🚨 SECURITY ALERT: Token ownership mismatch in getUserId!');
          console.error(`🚨 Token claims user: ${tokenUserId}, but DB shows: ${dbUserId}`);
          console.error('🚨 This indicates authentication bypass attempt - rejecting');
          throw new Error('Authentication required');
        }
        
        console.log(`✅ Server-side token ownership validated: ${tokenUserId} matches ${dbUserId}`);
        return tokenRecord.user_id;
      }
    } catch (error) {
      if (error instanceof Error && error.message === 'Authentication required') {
        throw error; // Re-throw authentication errors
      }
      console.warn('Error checking auth token in database:', error);
    }
  }
  
  // Check for Replit Auth session
  const user = (req as any).user;
  
  if (user && user.claims && user.claims.sub) {
    return user.claims.sub;
  }
  
  // Check for session-based authentication (Replit Auth fallback)
  const session = (req as any).session;
  
  if (!user && session && session.passport && session.passport.user) {
    console.log('getUserId: Found session user:', session.passport.user.claims?.sub);
    return session.passport.user.claims?.sub;
  }
  
  // No authenticated user found - SECURITY FIX: Throw error instead of returning anonymous
  console.log('❌ No authenticated user found');
  throw new Error('Authentication required');
}

// Synchronous version for backward compatibility (tries token check without database)
export function getUserIdSync(req: express.Request): string {
  // Check for Replit Auth session first (most reliable)
  const user = (req as any).user;
  if (user && user.claims && user.claims.sub) {
    return user.claims.sub;
  }
  
  // SECURITY FIX: Throw error for token-based auth since we can't do async DB check
  throw new Error('Authentication required');
}