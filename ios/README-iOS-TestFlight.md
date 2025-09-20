# My IEP Hero - iOS TestFlight Configuration Guide

## Overview

This guide provides comprehensive instructions for configuring and building My IEP Hero for iOS TestFlight distribution. The app is built using React with Capacitor for native iOS functionality.

## Prerequisites

### Development Environment
- **macOS**: Required for iOS builds (Monterey 12.0 or later recommended)
- **Xcode**: Version 14.0 or later with iOS 16.0 SDK
- **Node.js**: Version 18.0 or later
- **CocoaPods**: Latest version (`sudo gem install cocoapods`)
- **Capacitor CLI**: Latest version (`npm install -g @capacitor/cli`)

### Apple Developer Account
- Active Apple Developer Program membership
- Team ID and certificates configured
- App Store Connect access with TestFlight permissions
- iOS Distribution Certificate
- iOS Provisioning Profile for App Store distribution

## Project Configuration

### 1. Bundle Identifier
```
Bundle ID: com.myiephero.app
App Name: My IEP Hero
```

### 2. Version Information
```
Marketing Version: 1.0.0
Current Project Version: [Auto-generated timestamp]
Minimum iOS Version: 13.0
```

### 3. Key Files Configured
- `ios/App/App/Info.plist` - App metadata and permissions
- `ios/App/App/Config.xcconfig` - Build configuration
- `ios/App/App/App.entitlements` - App capabilities and entitlements
- `capacitor.config.ts` - Capacitor iOS configuration
- `ios/App/Podfile` - Native dependency management

## Build Process

### Quick Build Commands

```bash
# Development build
npm run ios:build:dev

# Production TestFlight build
npm run ios:build:prod

# Prepare iOS dependencies
npm run ios:prepare
```

### Manual Build Process

#### 1. Prepare Web Assets
```bash
npm ci
npm run build
```

#### 2. Sync Capacitor
```bash
npx cap sync ios
```

#### 3. Install iOS Dependencies
```bash
cd ios/App
pod install --repo-update
cd ../..
```

#### 4. Open Xcode Project
```bash
npx cap open ios
```

#### 5. Configure Signing
In Xcode:
1. Select the App target
2. Go to "Signing & Capabilities"
3. Select your Team
4. Choose "Manual" signing
5. Select your Distribution Certificate
6. Select your Provisioning Profile

#### 6. Archive for Distribution
1. Product → Archive
2. Distribute App → App Store Connect
3. Upload to TestFlight

### Automated Build Script

Use the automated build script for consistent builds:

```bash
./ios/build-scripts/build-testflight.sh
```

## Capacitor Plugin Configuration

### Installed Plugins
- **Camera**: Document capture and photo selection
- **Push Notifications**: Meeting reminders and updates
- **Network**: Connection status monitoring
- **App**: App state management
- **Status Bar**: iOS status bar customization
- **Splash Screen**: App launch experience
- **Keyboard**: Input handling
- **Haptics**: Touch feedback

### Plugin Permissions
All necessary permissions are configured in `Info.plist`:
- Camera access for document capture
- Photo library access for document selection
- Push notifications for reminders
- Background modes for offline sync

## App Store Connect Configuration

### App Information
- **Name**: My IEP Hero
- **Category**: Education
- **Content Rating**: 4+ (Educational content)
- **Privacy Policy**: Required URL
- **Support URL**: Required URL

### TestFlight Configuration
1. Upload build via Xcode or build script
2. Configure Test Information
3. Add Beta App Description
4. Set up Internal Testing groups
5. Configure External Testing (if needed)
6. Submit for Beta App Review (for external testing)

### Build Settings
- **Bitcode**: Disabled (not required for iOS 14+)
- **Symbols**: Upload enabled for crash reporting
- **App Thinning**: Enabled for optimal download sizes

## Privacy and Compliance

### Privacy Information
The app requests the following permissions:
- **Camera**: "This app needs access to camera to capture documents and photos for IEP management."
- **Photo Library**: "This app needs access to photo library to select images for documents and profiles."
- **Notifications**: "This app uses notifications to alert you about important IEP updates, meeting reminders, and messages from your advocacy team."
- **Microphone**: "This app may use the microphone for voice notes and accessibility features."
- **Contacts**: "This app may access contacts to help connect with advocates and support teams."
- **Calendar**: "This app accesses your calendar to schedule IEP meetings and important appointments."

### Data Protection
- All data encrypted in transit and at rest
- COPPA compliant for educational use
- FERPA compliant for educational records
- No personal data shared with third parties without consent

## Testing Guidelines

### Pre-Submission Testing
1. **Fresh Install**: Test on devices without previous app versions
2. **Permissions**: Verify all permissions work correctly
3. **Core Workflows**: Test key user journeys
4. **Offline Functionality**: Test without internet connection
5. **Push Notifications**: Verify notifications are received
6. **Camera Integration**: Test document capture
7. **Performance**: Check app launch time and responsiveness

### TestFlight Beta Testing
1. **Internal Testing**: Team members and stakeholders
2. **External Testing**: Limited group of target users
3. **Feedback Collection**: Use TestFlight feedback and external channels
4. **Iteration**: Regular updates based on feedback

## Troubleshooting

### Common Build Issues

#### 1. Code Signing Errors
- Verify Apple Developer account status
- Check certificate expiration dates
- Ensure provisioning profile includes all devices
- Update team settings in Xcode

#### 2. Pod Installation Issues
```bash
cd ios/App
pod repo update
pod deintegrate
pod install
```

#### 3. Capacitor Sync Issues
```bash
npx cap clean ios
npm run build
npx cap sync ios
```

#### 4. Build Script Permissions
```bash
chmod +x ios/build-scripts/build-testflight.sh
```

### Common Runtime Issues

#### 1. Camera Not Working
- Check camera permissions in device settings
- Verify Info.plist contains camera usage descriptions
- Test on physical device (camera doesn't work in simulator)

#### 2. Push Notifications Not Received
- Verify push notification entitlements
- Check notification permissions in device settings
- Ensure app is configured for production push environment

#### 3. App Crashes on Launch
- Check console logs in Xcode
- Verify all required frameworks are linked
- Check for missing native dependencies

## File Structure

```
ios/
├── App/
│   ├── App/
│   │   ├── AppDelegate.swift
│   │   ├── Info.plist          # App metadata and permissions
│   │   ├── Config.xcconfig     # Build configuration
│   │   ├── App.entitlements    # App capabilities
│   │   └── Assets.xcassets/    # App icons and images
│   ├── App.xcodeproj/          # Xcode project file
│   ├── App.xcworkspace/        # Xcode workspace
│   └── Podfile                 # CocoaPods dependencies
├── build-scripts/
│   ├── build-testflight.sh     # Automated build script
│   └── ExportOptions.plist     # Export configuration
└── testflight-metadata/
    ├── TestFlight-Notes.md     # Release notes for TestFlight
    └── TestFlight-Description.txt # App description
```

## Support and Resources

### Documentation
- [Capacitor iOS Documentation](https://capacitorjs.com/docs/ios)
- [Apple TestFlight Documentation](https://developer.apple.com/testflight/)
- [App Store Connect Guide](https://help.apple.com/app-store-connect/)

### Contact
- **Technical Support**: dev@myiephero.com
- **Beta Testing**: beta@myiephero.com
- **General Inquiries**: support@myiephero.com

---

**Last Updated**: September 15, 2025
**Version**: 1.0.0