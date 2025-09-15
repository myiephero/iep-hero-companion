import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.myiephero.app',
  appName: 'My IEP Hero',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    // Enable offline support
    allowNavigation: ["*"],
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2500,
      launchAutoHide: true,
      backgroundColor: "#0066CC",
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_CROP",
      showSpinner: false,
      iosLaunchImageName: "Splash",
      iosSpinnerStyle: "small",
      spinnerColor: "#FFFFFF",
      splashFullScreen: true,
      splashImmersive: true
    },
    Camera: {
      permissions: ['camera', 'photos']
    },
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"]
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
    // Local Notifications
    LocalNotifications: {
      smallIcon: "ic_stat_icon_config_sample",
      iconColor: "#0066CC",
      sound: "beep.wav"
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
  // Android specific configuration for offline support
  android: {
    buildOptions: {
      keystorePath: undefined,
      keystorePassword: undefined,
      keystoreAlias: undefined,
      keystoreAliasPassword: undefined,
      releaseType: 'APK'
    },
    allowMixedContent: true,
    captureInput: true,
    webContentsDebuggingEnabled: true
  }
};

export default config;
