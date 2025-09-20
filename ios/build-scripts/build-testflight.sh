#!/bin/bash

#
# My IEP Hero - iOS TestFlight Build Script
# This script builds and prepares the app for TestFlight distribution
#

set -e

# Configuration
APP_NAME="My IEP Hero"
SCHEME="App"
WORKSPACE="ios/App/App.xcworkspace"
CONFIGURATION="Release"
ARCHIVE_PATH="build/MyIEPHero.xcarchive"
EXPORT_PATH="build/export"
BUILD_NUMBER=$(date +%Y%m%d%H%M)

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Starting TestFlight build for ${APP_NAME}${NC}"

# Step 1: Clean previous builds
echo -e "${YELLOW}🧹 Cleaning previous builds...${NC}"
rm -rf build/
mkdir -p build

# Step 2: Update build number
echo -e "${YELLOW}📝 Updating build number to ${BUILD_NUMBER}...${NC}"
/usr/libexec/PlistBuddy -c "Set :CFBundleVersion ${BUILD_NUMBER}" ios/App/App/Info.plist

# Step 3: Install dependencies
echo -e "${YELLOW}📦 Installing dependencies...${NC}"
npm ci
cd ios/App && pod install --repo-update && cd ../..

# Step 4: Build web assets
echo -e "${YELLOW}🌐 Building web assets...${NC}"
npm run build

# Step 5: Sync Capacitor
echo -e "${YELLOW}⚡ Syncing Capacitor...${NC}"
npx cap sync ios

# Step 6: Create archive
echo -e "${YELLOW}📱 Creating iOS archive...${NC}"
xcodebuild -workspace "$WORKSPACE" \
  -scheme "$SCHEME" \
  -configuration "$CONFIGURATION" \
  -destination "generic/platform=iOS" \
  -archivePath "$ARCHIVE_PATH" \
  archive

# Step 7: Export for TestFlight
echo -e "${YELLOW}📤 Exporting for TestFlight...${NC}"
xcodebuild -exportArchive \
  -archivePath "$ARCHIVE_PATH" \
  -exportPath "$EXPORT_PATH" \
  -exportOptionsPlist ios/build-scripts/ExportOptions.plist

# Step 8: Upload to TestFlight (optional - requires API key)
if [ ! -z "$TESTFLIGHT_API_KEY" ]; then
    echo -e "${YELLOW}🚀 Uploading to TestFlight...${NC}"
    xcrun altool --upload-app \
      --type ios \
      --file "$EXPORT_PATH/My IEP Hero.ipa" \
      --apiKey "$TESTFLIGHT_API_KEY" \
      --apiIssuer "$TESTFLIGHT_ISSUER_ID"
else
    echo -e "${BLUE}ℹ️  TestFlight API key not provided. Manual upload required.${NC}"
    echo -e "${BLUE}📁 IPA location: $EXPORT_PATH/My IEP Hero.ipa${NC}"
fi

echo -e "${GREEN}✅ TestFlight build completed successfully!${NC}"
echo -e "${GREEN}📱 App version: $(grep -A1 CFBundleShortVersionString ios/App/App/Info.plist | tail -1 | sed 's/.*<string>\(.*\)<\/string>.*/\1/')${NC}"
echo -e "${GREEN}🏗️  Build number: ${BUILD_NUMBER}${NC}"

# Create build summary
cat > build/build-summary.txt << EOF
My IEP Hero - TestFlight Build Summary
=====================================

Build Date: $(date)
App Version: $(grep -A1 CFBundleShortVersionString ios/App/App/Info.plist | tail -1 | sed 's/.*<string>\(.*\)<\/string>.*/\1/')
Build Number: ${BUILD_NUMBER}
Configuration: ${CONFIGURATION}
Archive Path: ${ARCHIVE_PATH}
Export Path: ${EXPORT_PATH}

Files Generated:
- ${ARCHIVE_PATH}
- ${EXPORT_PATH}/My IEP Hero.ipa
- build/build-summary.txt

Next Steps:
1. Test the .ipa file on device using Xcode or Simulator
2. Upload to TestFlight via Xcode or App Store Connect
3. Configure TestFlight beta testing groups
4. Send invitations to beta testers

EOF

echo -e "${BLUE}📋 Build summary saved to build/build-summary.txt${NC}"