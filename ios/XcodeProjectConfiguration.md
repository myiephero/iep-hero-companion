# Xcode Project Configuration for My IEP Hero

## Project Settings Summary

### General Configuration
- **Product Name**: My IEP Hero
- **Bundle Identifier**: com.myiephero.app
- **Version**: 1.0.0
- **Build**: Auto-generated timestamp
- **Team**: [To be configured in Xcode]
- **Deployment Target**: iOS 13.0
- **Supported Devices**: Universal (iPhone and iPad)

### Signing & Capabilities

#### Automatic vs Manual Signing
- **Recommended**: Manual Signing for production
- **Development**: Can use Automatic Signing
- **Distribution**: Must use Manual with Distribution Certificate

#### Required Capabilities
1. **Push Notifications**
   - Development: Sandbox environment
   - Production: Production environment

2. **Background Modes**
   - Remote notifications
   - Background app refresh
   - Background processing

3. **App Groups**
   - Group ID: `group.com.myiephero.app`
   - Used for: Widget extensions, shared data

4. **Keychain Sharing**
   - Access Group: `$(AppIdentifierPrefix)com.myiephero.app`
   - Used for: Secure credential storage

5. **Associated Domains**
   - Domain: `applinks:myiephero.com`
   - Domain: `applinks:www.myiephero.com`
   - Used for: Deep linking (future feature)

### Build Settings Configuration

#### Debug Configuration
```
ASSETCATALOG_COMPILER_APPICON_NAME = AppIcon
CODE_SIGN_STYLE = Automatic (or Manual for production)
CURRENT_PROJECT_VERSION = 1
DEVELOPMENT_TEAM = [Your Team ID]
INFOPLIST_FILE = App/Info.plist
IPHONEOS_DEPLOYMENT_TARGET = 13.0
LD_RUNPATH_SEARCH_PATHS = $(inherited) @executable_path/Frameworks
MARKETING_VERSION = 1.0.0
PRODUCT_BUNDLE_IDENTIFIER = com.myiephero.app
PRODUCT_NAME = $(TARGET_NAME)
SWIFT_VERSION = 5.0
TARGETED_DEVICE_FAMILY = 1,2
```

#### Release Configuration
```
ASSETCATALOG_COMPILER_APPICON_NAME = AppIcon
CODE_SIGN_STYLE = Manual
CODE_SIGN_IDENTITY = iPhone Distribution
PROVISIONING_PROFILE_SPECIFIER = [Your Distribution Profile]
CURRENT_PROJECT_VERSION = [Auto-generated]
DEVELOPMENT_TEAM = [Your Team ID]
INFOPLIST_FILE = App/Info.plist
IPHONEOS_DEPLOYMENT_TARGET = 13.0
LD_RUNPATH_SEARCH_PATHS = $(inherited) @executable_path/Frameworks
MARKETING_VERSION = 1.0.0
PRODUCT_BUNDLE_IDENTIFIER = com.myiephero.app
PRODUCT_NAME = $(TARGET_NAME)
SWIFT_VERSION = 5.0
TARGETED_DEVICE_FAMILY = 1,2
VALIDATE_PRODUCT = YES
COPY_PHASE_STRIP = YES
DEBUG_INFORMATION_FORMAT = dwarf-with-dsym
ENABLE_NS_ASSERTIONS = NO
SWIFT_OPTIMIZATION_LEVEL = -Owholemodule
```

### Info.plist Key Configuration

#### App Identity
- `CFBundleDisplayName`: My IEP Hero
- `CFBundleIdentifier`: $(PRODUCT_BUNDLE_IDENTIFIER)
- `CFBundleName`: $(PRODUCT_NAME)
- `CFBundleShortVersionString`: 1.0.0
- `CFBundleVersion`: [Auto-generated]

#### Permissions and Privacy
- `NSCameraUsageDescription`: Camera access for document capture
- `NSPhotoLibraryUsageDescription`: Photo library access for document selection
- `NSPhotoLibraryAddUsageDescription`: Saving captured photos
- `NSUserNotificationsUsageDescription`: Important IEP updates and reminders
- `NSMicrophoneUsageDescription`: Voice notes and accessibility
- `NSContactsUsageDescription`: Connecting with advocates
- `NSCalendarsUsageDescription`: IEP meeting scheduling
- `NSRemindersUsageDescription`: IEP deadline reminders

#### App Transport Security
```xml
<key>NSAppTransportSecurity</key>
<dict>
    <key>NSAllowsArbitraryLoads</key>
    <false/>
    <key>NSExceptionDomains</key>
    <dict>
        <key>localhost</key>
        <dict>
            <key>NSExceptionAllowsInsecureHTTPLoads</key>
            <true/>
        </dict>
    </dict>
</dict>
```

#### Background Modes
```xml
<key>UIBackgroundModes</key>
<array>
    <string>remote-notification</string>
    <string>background-fetch</string>
    <string>background-processing</string>
</array>
```

### Scheme Configuration

#### App Scheme
- **Name**: App
- **Shared**: Yes
- **Container**: App.xcworkspace

#### Build Configuration
- **Run**: Debug
- **Test**: Debug
- **Profile**: Release
- **Analyze**: Debug
- **Archive**: Release

### CocoaPods Integration

#### Podfile Configuration
```ruby
platform :ios, '13.0'
use_frameworks!

def capacitor_pods
  pod 'Capacitor', :path => '../../node_modules/@capacitor/ios'
  pod 'CapacitorCordova', :path => '../../node_modules/@capacitor/ios'
  pod 'CapacitorCamera', :path => '../../node_modules/@capacitor/camera'
  pod 'CapacitorPushNotifications', :path => '../../node_modules/@capacitor/push-notifications'
  # ... other plugins
end

target 'App' do
  capacitor_pods
end
```

#### Pod Installation
```bash
cd ios/App
pod install --repo-update
```

### Asset Configuration

#### App Icons
- **Required Sizes**: 
  - 1024x1024 (App Store)
  - 180x180 (iPhone 6 Plus)
  - 167x167 (iPad Pro)
  - 152x152 (iPad)
  - 120x120 (iPhone)
  - 87x87 (iPhone Settings)
  - 80x80 (iPad Settings)
  - 76x76 (iPad)
  - 60x60 (iPhone)
  - 58x58 (iPhone Settings)
  - 40x40 (iPad Spotlight)
  - 29x29 (Settings)
  - 20x20 (Notification)

#### Launch Images
- **Splash Screen**: Configured via Capacitor
- **LaunchScreen.storyboard**: iOS native launch screen
- **Splash.imageset**: Capacitor splash screen assets

### Archive and Distribution

#### Archive Settings
- **Build Configuration**: Release
- **Code Signing**: Distribution Certificate
- **Provisioning Profile**: App Store Distribution Profile
- **Include Symbols**: Yes
- **Bitcode**: No (disabled for modern iOS)

#### Export Options
- **Method**: App Store
- **Team**: [Your Development Team]
- **Upload Symbols**: Yes
- **Upload Bitcode**: No
- **Strip Swift Symbols**: Yes
- **Thinning**: None (for TestFlight)

### Xcode Cloud Configuration (Optional)

#### Workflow Configuration
```yaml
name: My IEP Hero iOS Build
trigger:
  - branch: main
    changes:
      - ios/**
      - capacitor.config.ts
      - package.json

workflow:
  - step: Install Dependencies
    actions:
      - npm ci
      - npm run build
      - npx cap sync ios
      - cd ios/App && pod install

  - step: Xcode Build
    actions:
      - xcode_build:
          scheme: App
          configuration: Release
          destination: generic/platform=iOS

  - step: Distribute
    actions:
      - testflight_distribute:
          group: Internal Testing
```

### Common Xcode Tasks

#### Opening Project
```bash
npx cap open ios
```

#### Cleaning Build
1. Product → Clean Build Folder
2. Derived Data → Delete (Xcode Preferences → Locations)

#### Creating Archive
1. Product → Archive
2. Organizer → Distribute App
3. App Store Connect → Upload

#### Testing on Device
1. Connect device via USB
2. Select device in Xcode
3. Product → Run
4. Trust developer certificate on device

### Troubleshooting

#### Code Signing Issues
1. Check certificate validity in Keychain Access
2. Verify provisioning profile includes device UDID
3. Ensure bundle ID matches provisioning profile
4. Check team membership and roles

#### Build Failures
1. Clean build folder and derived data
2. Update CocoaPods: `pod repo update`
3. Reset Capacitor: `npx cap clean ios && npx cap sync ios`
4. Check for Xcode and iOS SDK updates

#### Archive Validation Issues
1. Verify all required entitlements are present
2. Check for deprecated APIs
3. Ensure all linked frameworks are valid
4. Verify Info.plist configuration

---

**Note**: This configuration assumes Xcode 14+ and iOS 16+ SDK. Some settings may need adjustment for different Xcode versions.