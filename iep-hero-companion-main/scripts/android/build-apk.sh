#!/bin/bash

# My IEP Hero - APK Build Script for Testing
# Generates APK files for local testing and debugging

set -e  # Exit on any error

echo "📱 My IEP Hero - APK Builder (Testing)"
echo "====================================="

# Configuration
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
ANDROID_DIR="$PROJECT_ROOT/android"
OUTPUT_DIR="$PROJECT_ROOT/dist/android"
BUILD_TYPE="debug"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --release)
            BUILD_TYPE="release"
            shift
            ;;
        --help)
            echo "Usage: $0 [--release] [--help]"
            echo ""
            echo "Options:"
            echo "  --release  Build release APK (requires keystore)"
            echo "  --help     Show this help message"
            echo ""
            echo "Default: Builds debug APK"
            exit 0
            ;;
        *)
            log_warning "Unknown option: $1"
            shift
            ;;
    esac
done

# Build web assets and sync
log_info "Building web assets..."
cd "$PROJECT_ROOT"
npm run build

log_info "Syncing Capacitor..."
npx cap sync android

# Build APK
log_info "Building $BUILD_TYPE APK..."
cd "$ANDROID_DIR"

# Clean and build
./gradlew clean
./gradlew assemble${BUILD_TYPE^}

# Copy APK to output directory
mkdir -p "$OUTPUT_DIR"

APK_SOURCE="$ANDROID_DIR/app/build/outputs/apk/$BUILD_TYPE/app-$BUILD_TYPE.apk"
APK_TARGET="$OUTPUT_DIR/MyIEPHero-$BUILD_TYPE-$(date +%Y%m%d-%H%M%S).apk"

if [ -f "$APK_SOURCE" ]; then
    cp "$APK_SOURCE" "$APK_TARGET"
    log_success "APK built: $APK_TARGET"
    
    # Show APK info
    local file_size=$(ls -lh "$APK_TARGET" | awk '{print $5}')
    echo ""
    echo "📦 APK Info:"
    echo "   File: $(basename "$APK_TARGET")"
    echo "   Size: $file_size"
    echo "   Type: $BUILD_TYPE"
    echo "   Location: $APK_TARGET"
    echo ""
    echo "🔧 Install with ADB:"
    echo "   adb install \"$APK_TARGET\""
    echo ""
else
    log_error "APK build failed - file not found: $APK_SOURCE"
    exit 1
fi