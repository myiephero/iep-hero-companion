import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { useToast } from '@/hooks/use-toast';

/**
 * PushNotificationProvider - Global component that manages push notification setup
 * This component automatically handles:
 * - Initial permission requests for logged-in users
 * - Token registration and server sync
 * - Background notification handling
 */
export function PushNotificationProvider() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const {
    isSupported,
    permissionState,
    isRegistered,
    requestPermission,
  } = usePushNotifications();

  // Auto-request permissions for authenticated users on supported platforms
  useEffect(() => {
    const handleInitialPermissionRequest = async () => {
      // Only proceed if:
      // 1. User is authenticated
      // 2. Platform supports push notifications (mobile)
      // 3. Permission hasn't been explicitly denied
      // 4. Permission hasn't been granted yet
      if (
        isAuthenticated && 
        user && 
        isSupported && 
        !permissionState.granted && 
        !permissionState.denied &&
        permissionState.prompt
      ) {
        
        // Wait a bit after login to avoid overwhelming the user
        const timeoutId = setTimeout(async () => {
          try {
            console.log('Auto-requesting push notification permissions for authenticated user');
            await requestPermission();
          } catch (error) {
            console.error('Error auto-requesting push notification permission:', error);
            // Don't show toast for auto-request failures as they're not user-initiated
          }
        }, 2000); // 2 second delay after authentication

        return () => clearTimeout(timeoutId);
      }
    };

    handleInitialPermissionRequest();
  }, [isAuthenticated, user, isSupported, permissionState, requestPermission]);

  // Log permission status changes for debugging
  useEffect(() => {
    if (isSupported && isAuthenticated) {
      console.log('Push notification status:', {
        granted: permissionState.granted,
        denied: permissionState.denied,
        prompt: permissionState.prompt,
        registered: isRegistered,
        platform: 'mobile'
      });
    }
  }, [permissionState, isRegistered, isSupported, isAuthenticated]);

  // This component doesn't render anything - it's purely for side effects
  return null;
}

export default PushNotificationProvider;