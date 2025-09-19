import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.myiephero.app',
  appName: 'My IEP Hero',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    // Production: Restrict navigation for security
    allowNavigation: [
      "https://api.myiephero.com",
      "https://myiephero.com",
      "https://firebaseapp.com",
      "https://googleapis.com"
    ],
    // Production: Disable cleartext for security
    cleartext: false,
    // Production: Error page for offline
    errorPath: "error.html"
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: "#0066CC",
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_CROP",
      showSpinner: false,
      androidSpinnerStyle: "large",
      iosLaunchImageName: "Splash",
      iosSpinnerStyle: "small",
      spinnerColor: "#FFFFFF",
      splashFullScreen: true,
      splashImmersive: true,
      // Educational app branding
      splashFadeOutDuration: 300
    },
    Camera: {
      permissions: ['camera', 'photos'],
      // Educational app: Document scanning optimization
      quality: 90,
      allowEditing: false,
      resultType: 'uri',
      saveToGallery: false,
      // Privacy: Prompt for permissions each time
      promptLabelHeader: 'Camera Access',
      promptLabelCancel: 'Cancel',
      promptLabelPhoto: 'From Photos',
      promptLabelPicture: 'Take Picture'
    },
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"],
      // Educational app: Respectful notifications
      defaultChannelId: "iep-hero-notifications",
      defaultChannelName: "IEP Hero Notifications",
      defaultChannelDescription: "Important updates about your IEP and educational advocacy",
      defaultChannelImportance: 3,  // Default importance
      requestPermissions: true
    },
    // Network status monitoring
    Network: {
      enabled: true
    },
    // Background tasks for offline sync
    BackgroundTask: {
      enabled: true
    },
    // App state management
    App: {
      enabled: true
    },
    // Local Notifications for educational reminders
    LocalNotifications: {
      smallIcon: "ic_notification",
      iconColor: "#0066CC",
      sound: "default",
      channelId: "iep-reminders",
      channelName: "IEP Reminders",
      channelDescription: "Important reminders about IEP meetings and deadlines"
    },
    // Keyboard configuration
    Keyboard: {
      resize: "body",
      style: "dark",
      resizeOnFullScreen: true
    }
  },
  // iOS specific configuration for TestFlight and production
  ios: {
    scheme: 'MyIEPHero',
    path: 'ios'
  },
  // Android specific configuration for production
  android: {
    buildOptions: {
      keystorePath: undefined,  // Handled by gradle
      keystorePassword: undefined,  // Handled by gradle
      keystoreAlias: undefined,  // Handled by gradle
      keystoreAliasPassword: undefined,  // Handled by gradle
      releaseType: 'AAB'  // Android App Bundle for Play Console
    },
    allowMixedContent: false,  // Production: Enhanced security
    captureInput: true,  // Educational app: Capture form inputs
    webContentsDebuggingEnabled: false,  // Production: Disable debugging
    // Educational app optimizations
    loggingBehavior: 'production',
    // Network security
    appendUserAgent: 'MyIEPHero/1.0',
    // Performance optimizations
    hideLogs: true
  }
};

export default config;
