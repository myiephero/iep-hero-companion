/**
 * Mobile detection utilities for iOS authentication fix
 * Prevents Safari redirects by detecting mobile environments
 */

import { Capacitor } from '@capacitor/core';

/**
 * Detect if running in a mobile WebView environment
 * Used to avoid OAuth flows that cause Safari redirects
 */
export function isMobileWebView(): boolean {
  try {
    // Check if we're in Capacitor environment
    if (Capacitor.isNativePlatform()) {
      return true;
    }
    
    // Check for mobile protocols
    if (typeof window !== 'undefined') {
      const protocol = window.location.protocol;
      if (protocol === 'capacitor:' || protocol === 'file:') {
        return true;
      }
      
      // Check for Capacitor global object
      if ((window as any).Capacitor !== undefined) {
        return true;
      }
    }
    
    return false;
  } catch (error) {
    // Default to false if detection fails
    return false;
  }
}

/**
 * Get the appropriate authentication URL for the environment
 * Avoids OAuth flows on mobile to prevent Safari redirects
 */
export function getAuthUrl(): string {
  if (isMobileWebView()) {
    // Use mobile custom login page to avoid OAuth Safari redirect
    return '/m/auth';
  } else {
    // Web can use either OAuth or custom login
    return '/auth'; // Prefer custom login for consistency
  }
}

/**
 * Perform navigation that stays within WebView on mobile
 * Uses window.location.replace to avoid Safari redirects
 */
export function navigateInApp(url: string): void {
  if (isMobileWebView()) {
    // Use replace to stay within WebView
    window.location.replace(url);
  } else {
    // Web can use normal navigation
    window.location.replace(url);
  }
}

/**
 * Check if URL is an external redirect that could cause Safari issues
 */
export function isExternalRedirect(url: string): boolean {
  if (!url) return false;
  
  // OAuth endpoints that cause external redirects
  const externalPatterns = [
    '/api/login',    // Replit OAuth
    '/oauth/',       // Generic OAuth
    'auth.replit.com', // Replit auth domain
  ];
  
  return externalPatterns.some(pattern => url.includes(pattern));
}

/**
 * Handle deep link navigation for Universal Links
 * Routes email links (verify-email, reset-password) to correct mobile paths
 */
export function handleDeepLink(url: string): string {
  console.log('🔗 Processing deep link:', url);
  
  // Convert web email links to mobile-compatible paths
  if (url.includes('/verify-email')) {
    const mobileUrl = url.replace('/verify-email', '/m/verify-email');
    console.log('🔗 Email verification deep link → mobile path:', mobileUrl);
    return mobileUrl;
  }
  
  if (url.includes('/reset-password')) {
    const mobileUrl = url.replace('/reset-password', '/m/reset-password'); 
    console.log('🔗 Password reset deep link → mobile path:', mobileUrl);
    return mobileUrl;
  }
  
  // Default mobile path handling
  if (!url.includes('/m/') && isMobileWebView()) {
    const mobilePath = '/m' + new URL(url).pathname + new URL(url).search;
    console.log('🔗 Generic deep link → mobile path:', mobilePath);
    return mobilePath;
  }
  
  return url;
}