// API Configuration utility for handling different environments
// Handles both web (relative URLs) and mobile (absolute URLs) environments

// Environment detection and validation
const isDevelopment = typeof import.meta !== 'undefined' && import.meta.env?.DEV;

/**
 * Detects if the app is running in a Capacitor (mobile) environment
 */
export function isCapacitorEnvironment(): boolean {
  try {
    // Check if we're running in a Capacitor environment
    return (
      typeof window !== 'undefined' && 
      (
        window.location.protocol === 'capacitor:' ||
        window.location.protocol === 'file:' ||
        // Also check for the presence of Capacitor global object
        (window as any).Capacitor !== undefined ||
        // Check if hostname is localhost but protocol is not http/https (mobile webview)
        (window.location.hostname === 'localhost' && !['http:', 'https:'].includes(window.location.protocol))
      )
    );
  } catch (error) {
    // Only log in development
    if (isDevelopment) {
      console.warn('Error detecting Capacitor environment:', error);
    }
    return false;
  }
}

/**
 * Gets the API domain with proper validation and no dangerous fallbacks
 */
function getApiDomain(): string {
  // Try Vite environment variable first (client-side, accessible in browser)
  if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_REPLIT_DEV_DOMAIN) {
    const domain = import.meta.env.VITE_REPLIT_DEV_DOMAIN;
    if (isDevelopment) {
      console.log('API Config - Using configured domain from environment');
    }
    return domain;
  }
  
  // For web environment, use current host if not mobile
  if (typeof window !== 'undefined' && !isCapacitorEnvironment()) {
    const currentHost = window.location.host;
    if (currentHost && currentHost !== 'localhost') {
      if (isDevelopment) {
        console.log('API Config - Using current window host for web');
      }
      return currentHost;
    }
  }
  
  // For mobile environments, we require explicit configuration
  if (isCapacitorEnvironment()) {
    throw new Error(
      'Mobile app requires VITE_REPLIT_DEV_DOMAIN environment variable to be set. ' +
      'Please configure your API domain in the environment variables before building the mobile app.'
    );
  }
  
  // For localhost development, return localhost
  if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
    return window.location.host;
  }
  
  // No fallback - require explicit configuration
  throw new Error(
    'API domain configuration is required. Please set VITE_REPLIT_DEV_DOMAIN environment variable ' +
    'or ensure the app is running in a proper web environment.'
  );
}

/**
 * Gets the appropriate API base URL based on current environment
 */
export function getApiBaseUrl(): string {
  const isMobile = isCapacitorEnvironment();
  
  // Only log detailed info in development
  if (isDevelopment) {
    console.log('API Config - Environment Detection:', {
      isMobile,
      protocol: typeof window !== 'undefined' ? window.location.protocol : 'unknown',
      hostname: typeof window !== 'undefined' ? window.location.hostname : 'unknown'
    });
  }
  
  if (isMobile) {
    // Mobile environment - use absolute URL with proper validation
    try {
      const domain = getApiDomain();
      const apiUrl = `https://${domain}/api`;
      if (isDevelopment) {
        console.log('API Config - Using mobile API URL');
      }
      return apiUrl;
    } catch (error) {
      console.error('Failed to configure API for mobile environment:', error.message);
      throw error;
    }
  } else {
    // Web environment - use relative URL
    if (isDevelopment) {
      console.log('API Config - Using web API URL: /api');
    }
    return '/api';
  }
}

/**
 * Resolves a URL to be absolute if needed for mobile environments
 */
export function resolveApiUrl(relativeUrl: string): string {
  // If the URL is already absolute, return as-is
  if (relativeUrl.startsWith('http://') || relativeUrl.startsWith('https://')) {
    return relativeUrl;
  }
  
  const baseUrl = getApiBaseUrl();
  
  // Handle relative URLs that start with /api
  if (relativeUrl.startsWith('/api')) {
    if (isCapacitorEnvironment()) {
      // For mobile, replace '/api' with full base URL
      return relativeUrl.replace('/api', baseUrl);
    } else {
      // For web, keep as-is
      return relativeUrl;
    }
  }
  
  // Handle URLs that don't start with /api
  if (relativeUrl.startsWith('/')) {
    return `${baseUrl}${relativeUrl}`;
  } else {
    return `${baseUrl}/${relativeUrl}`;
  }
}

// Export environment detection for other modules that might need it
export { isCapacitorEnvironment as isMobile };