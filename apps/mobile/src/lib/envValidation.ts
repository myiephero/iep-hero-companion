// Environment variable validation utility for secure configuration
// Ensures proper setup for both development and production environments

/**
 * Validates that required environment variables are properly configured
 * for mobile app integration
 */
export interface EnvironmentConfig {
  apiDomain: string;
  isDevelopment: boolean;
  isMobile: boolean;
}

/**
 * Environment validation errors for better debugging
 */
export class EnvironmentValidationError extends Error {
  constructor(message: string, public details?: Record<string, any>) {
    super(message);
    this.name = 'EnvironmentValidationError';
  }
}

/**
 * Validates and returns environment configuration
 * Fails fast with clear error messages instead of using dangerous fallbacks
 */
export function validateEnvironment(): EnvironmentConfig {
  const isDevelopment = typeof import.meta !== 'undefined' && import.meta.env?.DEV;
  const isMobile = checkMobileEnvironment();
  
  // For mobile environments, check if using remote URL (Capacitor server.url) or require explicit config
  if (isMobile) {
    // If mobile app is loading from a remote URL (not localhost or file://), use that domain
    if (typeof window !== 'undefined') {
      const currentHost = window.location.host;
      if (currentHost && currentHost !== 'localhost' && !currentHost.includes('capacitor')) {
        return {
          apiDomain: currentHost,
          isDevelopment,
          isMobile: true
        };
      }
    }
    
    // Otherwise require explicit API domain configuration
    const apiDomain = getRequiredEnvVar('VITE_REPLIT_DEV_DOMAIN');
    
    if (!isValidDomain(apiDomain)) {
      throw new EnvironmentValidationError(
        'Invalid API domain configuration for mobile app',
        {
          providedDomain: apiDomain,
          requirement: 'Must be a valid domain without protocol (e.g., "your-app.replit.dev")',
          environment: 'mobile'
        }
      );
    }
    
    return {
      apiDomain,
      isDevelopment,
      isMobile: true
    };
  }
  
  // For web environments, use current host or environment variable
  let apiDomain: string;
  
  if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_REPLIT_DEV_DOMAIN) {
    apiDomain = import.meta.env.VITE_REPLIT_DEV_DOMAIN;
  } else if (typeof window !== 'undefined') {
    apiDomain = window.location.host;
  } else {
    throw new EnvironmentValidationError(
      'Unable to determine API domain for web environment',
      {
        requirement: 'Either set VITE_REPLIT_DEV_DOMAIN or run in browser environment',
        environment: 'web'
      }
    );
  }
  
  return {
    apiDomain,
    isDevelopment,
    isMobile: false
  };
}

/**
 * Checks if running in a mobile (Capacitor) environment
 */
function checkMobileEnvironment(): boolean {
  try {
    return (
      typeof window !== 'undefined' && 
      (
        window.location.protocol === 'capacitor:' ||
        window.location.protocol === 'file:' ||
        (window as any).Capacitor !== undefined ||
        (window.location.hostname === 'localhost' && !['http:', 'https:'].includes(window.location.protocol))
      )
    );
  } catch (error) {
    return false;
  }
}

/**
 * Gets required environment variable with validation
 */
function getRequiredEnvVar(name: string): string {
  const value = typeof import.meta !== 'undefined' ? import.meta.env?.[name] : undefined;
  
  if (!value || typeof value !== 'string' || value.trim().length === 0) {
    throw new EnvironmentValidationError(
      `Required environment variable ${name} is missing or empty`,
      {
        variable: name,
        requirement: 'Must be set to a valid non-empty string',
        suggestion: `Add ${name}=your-domain.replit.dev to your environment configuration`
      }
    );
  }
  
  return value.trim();
}

/**
 * Validates domain format
 */
function isValidDomain(domain: string): boolean {
  // Basic domain validation - should not include protocol
  const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9]*\..*$/;
  return domainRegex.test(domain) && !domain.includes('://') && !domain.includes(' ');
}

/**
 * Development helper for environment debugging
 */
export function debugEnvironment(): void {
  const isDevelopment = typeof import.meta !== 'undefined' && import.meta.env?.DEV;
  
  if (!isDevelopment) {
    return;
  }
  
  try {
    const config = validateEnvironment();
    console.log('Environment Configuration:', {
      apiDomain: config.apiDomain,
      isDevelopment: config.isDevelopment,
      isMobile: config.isMobile,
      status: 'valid'
    });
  } catch (error) {
    console.error('Environment Validation Failed:', {
      error: error.message,
      details: error instanceof EnvironmentValidationError ? error.details : undefined
    });
  }
}