# Android Keystore Management for My IEP Hero

## Overview
This directory contains keystore management for My IEP Hero Android app production builds and Play Console distribution.

## Keystore Setup

### Step 1: Generate Production Keystore
```bash
# Navigate to the keystore directory
cd android/keystore

# Generate production keystore (run this once)
keytool -genkey -v -keystore myiephero-release-key.keystore -alias myiephero -keyalg RSA -keysize 2048 -validity 10000

# You will be prompted for:
# - Keystore password (save this securely!)
# - Key password (can be same as keystore password)
# - Your name and organization details
```

### Step 2: Configure Environment Variables
Create `android/keystore/keystore.properties` file:
```properties
MYAPP_RELEASE_STORE_FILE=../keystore/myiephero-release-key.keystore
MYAPP_RELEASE_STORE_PASSWORD=YOUR_KEYSTORE_PASSWORD
MYAPP_RELEASE_KEY_ALIAS=myiephero
MYAPP_RELEASE_KEY_PASSWORD=YOUR_KEY_PASSWORD
```

### Step 3: Security Best Practices
- ✅ Never commit keystore files to version control
- ✅ Store keystore and passwords securely (password manager)
- ✅ Create backup of keystore file (required for Play Store updates)
- ✅ Use different passwords for keystore and key
- ✅ Store keystore.properties in secure location

## Directory Structure
```
android/keystore/
├── README.md                          # This file
├── .gitignore                         # Ignore sensitive files
├── keystore.properties.template       # Template for configuration
├── myiephero-release-key.keystore     # Production keystore (NEVER COMMIT)
└── generate-keystore.sh               # Keystore generation script
```

## Play Console Upload Key
When uploading to Google Play Console for the first time:
1. Upload the APK/AAB signed with your upload key
2. Google Play will generate an app signing key
3. Future updates must be signed with the same upload key

## Troubleshooting
- If you lose the keystore, you cannot update the app on Play Store
- Keep multiple secure backups of the keystore file
- Test signing process before production deployment
- Verify keystore integrity: `keytool -list -v -keystore myiephero-release-key.keystore`

## Build Commands
```bash
# Debug build (using debug keystore)
./gradlew assembleDebug

# Release build (using production keystore)
./gradlew assembleRelease

# Android App Bundle for Play Console
./gradlew bundleRelease
```