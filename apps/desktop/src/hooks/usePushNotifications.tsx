import { useState, useEffect, useCallback } from 'react';
import { PushNotifications, PushNotificationSchema, Token, ActionPerformed } from '@capacitor/push-notifications';
import { Capacitor } from '@capacitor/core';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

export interface NotificationPermissionState {
  granted: boolean;
  denied: boolean;
  prompt: boolean;
}

export interface PushNotificationHook {
  isSupported: boolean;
  permissionState: NotificationPermissionState;
  isRegistered: boolean;
  token: string | null;
  requestPermission: () => Promise<boolean>;
  registerForNotifications: () => Promise<void>;
  unregisterFromNotifications: () => Promise<void>;
  sendTokenToServer: (token: string) => Promise<void>;
}

export const usePushNotifications = (): PushNotificationHook => {
  const [permissionState, setPermissionState] = useState<NotificationPermissionState>({
    granted: false,
    denied: false,
    prompt: true,
  });
  const [isRegistered, setIsRegistered] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  // Check if push notifications are supported
  const isSupported = Capacitor.isNativePlatform();

  // Initialize push notifications
  useEffect(() => {
    if (!isSupported) return;

    const initializePushNotifications = async () => {
      try {
        // Check current permission status
        const permResult = await PushNotifications.checkPermissions();
        setPermissionState({
          granted: permResult.receive === 'granted',
          denied: permResult.receive === 'denied',
          prompt: permResult.receive === 'prompt',
        });

        // If permission is already granted, register for notifications
        if (permResult.receive === 'granted') {
          await registerForNotifications();
        }
      } catch (error) {
        console.error('Error initializing push notifications:', error);
      }
    };

    initializePushNotifications();
  }, [isSupported]);

  // Set up notification listeners
  useEffect(() => {
    if (!isSupported) return;

    // Listen for registration success
    const registrationListener = PushNotifications.addListener('registration', (token: Token) => {
      console.log('Push registration success, token: ' + token.value);
      setToken(token.value);
      setIsRegistered(true);
      sendTokenToServer(token.value);
    });

    // Listen for registration errors
    const registrationErrorListener = PushNotifications.addListener('registrationError', (err) => {
      console.error('Registration error: ', err.error);
      toast({
        title: "Notification Setup Error",
        description: "Failed to register for push notifications. Please try again.",
        variant: "destructive",
      });
    });

    // Listen for incoming notifications (when app is open)
    const notificationListener = PushNotifications.addListener('pushNotificationReceived', (notification: PushNotificationSchema) => {
      console.log('Push notification received: ', notification);
      
      // Show in-app notification
      toast({
        title: notification.title || "New Notification",
        description: notification.body || "You have received a new notification.",
      });
    });

    // Listen for notification actions (when notification is tapped)
    const actionListener = PushNotifications.addListener('pushNotificationActionPerformed', (notification: ActionPerformed) => {
      console.log('Push notification action performed', notification.actionId, notification.inputValue);
      
      // Handle notification tap - you can add navigation logic here
      const data = notification.notification.data;
      if (data?.route) {
        // Navigate to specific route based on notification data
        window.location.href = data.route;
      }
    });

    // Cleanup listeners
    return () => {
      registrationListener.then(listener => listener.remove());
      registrationErrorListener.then(listener => listener.remove());
      notificationListener.then(listener => listener.remove());
      actionListener.then(listener => listener.remove());
    };
  }, [isSupported, toast]);

  // Request notification permission
  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!isSupported) {
      console.log('Push notifications not supported on this platform');
      return false;
    }

    try {
      const permResult = await PushNotifications.requestPermissions();
      const granted = permResult.receive === 'granted';
      
      setPermissionState({
        granted,
        denied: permResult.receive === 'denied',
        prompt: permResult.receive === 'prompt',
      });

      if (granted) {
        toast({
          title: "Notifications Enabled",
          description: "You will now receive important updates and reminders.",
        });
        await registerForNotifications();
      } else {
        toast({
          title: "Notifications Disabled",
          description: "You can enable notifications later in your device settings.",
          variant: "destructive",
        });
      }

      return granted;
    } catch (error) {
      console.error('Error requesting permission:', error);
      toast({
        title: "Permission Error",
        description: "Failed to request notification permission. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  }, [isSupported, toast]);

  // Register for push notifications
  const registerForNotifications = useCallback(async (): Promise<void> => {
    if (!isSupported) return;

    try {
      await PushNotifications.register();
    } catch (error) {
      console.error('Error registering for notifications:', error);
      throw error;
    }
  }, [isSupported]);

  // Unregister from push notifications
  const unregisterFromNotifications = useCallback(async (): Promise<void> => {
    if (!isSupported) return;

    try {
      await PushNotifications.removeAllListeners();
      setIsRegistered(false);
      setToken(null);
      
      // Also remove token from server
      if (user) {
        await sendTokenToServer(''); // Send empty token to remove
      }

      toast({
        title: "Notifications Disabled",
        description: "You have been unregistered from push notifications.",
      });
    } catch (error) {
      console.error('Error unregistering from notifications:', error);
      toast({
        title: "Error",
        description: "Failed to disable notifications. Please try again.",
        variant: "destructive",
      });
    }
  }, [isSupported, user, toast]);

  // Send token to server for storage
  const sendTokenToServer = useCallback(async (pushToken: string): Promise<void> => {
    if (!user) return;

    try {
      const authToken = localStorage.getItem('authToken');
      const response = await fetch('/api/auth/update-push-token', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(authToken && { 'Authorization': `Bearer ${authToken}` }),
        },
        credentials: 'include',
        body: JSON.stringify({ 
          pushNotificationToken: pushToken,
          platform: Capacitor.getPlatform(),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update push notification token');
      }

      console.log('Push notification token updated successfully');
    } catch (error) {
      console.error('Error sending token to server:', error);
      // Don't show toast for this error as it's not user-facing
    }
  }, [user]);

  return {
    isSupported,
    permissionState,
    isRegistered,
    token,
    requestPermission,
    registerForNotifications,
    unregisterFromNotifications,
    sendTokenToServer,
  };
};