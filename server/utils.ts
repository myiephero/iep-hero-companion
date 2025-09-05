import express from 'express';

// Middleware to extract user ID from authenticated session
export function getUserId(req: express.Request): string {
  // First check for token-based auth (custom login system)
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (token && global.activeTokens && global.activeTokens[token]) {
    const tokenData = global.activeTokens[token];
    // Check if token is not expired (24 hours)
    if (Date.now() - tokenData.createdAt < 24 * 60 * 60 * 1000) {
      return tokenData.userId;
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