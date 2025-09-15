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
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: "#ffffff",
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_CROP",
      showSpinner: true,
      androidSpinnerStyle: "large",
      iosSpinnerStyle: "small",
      spinnerColor: "#999999"
    },
    Camera: {
      permissions: ['camera', 'photos']
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
    }
  },
  // iOS specific configuration for offline support
  ios: {
    scheme: 'My IEP Hero',
    allowsBackupToiCloud: true,
    preferences: {
      'DisallowOverscroll': 'true',
      'WebKitDisallowOverscroll': 'true',
      'UIWebViewBounce': 'false',
      'ScrollEnabled': 'false',
      'BackupWebStorage': 'local',
      'KeyboardDisplayRequiresUserAction': 'false'
    }
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
    webContentsDebuggingEnabled: true,
    preferences: {
      'android-allow-backup': 'true',
      'android-installLocation': 'auto'
    }
  }
};

export default config;
