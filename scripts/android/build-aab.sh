#!/bin/bash

# My IEP Hero - Android App Bundle (AAB) Build Script
# Generates production-ready AAB for Google Play Console internal testing

set -e  # Exit on any error

echo "🚀 My IEP Hero - Android App Bundle Builder"
echo "=========================================="

# Configuration
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
ANDROID_DIR="$PROJECT_ROOT/android"
KEYSTORE_DIR="$PROJECT_ROOT/android/keystore"
OUTPUT_DIR="$PROJECT_ROOT/dist/android"
BUILD_TYPE="release"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
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

# Check dependencies
check_dependencies() {
    log_info "Checking build dependencies..."
    
    # Check if Node.js is available
    if ! command -v node &> /dev/null; then
        log_error "Node.js not found. Please install Node.js."
        exit 1
    fi
    
    # Check if npm is available
    if ! command -v npm &> /dev/null; then
        log_error "npm not found. Please install npm."
        exit 1
    fi
    
    # Check if Java is available
    if ! command -v java &> /dev/null; then
        log_error "Java not found. Please install Java JDK."
        exit 1
    fi
    
    # Check if Android project exists
    if [ ! -d "$ANDROID_DIR" ]; then
        log_error "Android project directory not found: $ANDROID_DIR"
        exit 1
    fi
    
    log_success "All dependencies found"
}

# Validate keystore configuration
validate_keystore() {
    log_info "Validating keystore configuration..."
    
    if [ ! -f "$KEYSTORE_DIR/keystore.properties" ]; then
        log_warning "Production keystore not configured"
        log_info "Using debug keystore for build"
        log_info "For production builds, run: $KEYSTORE_DIR/generate-keystore.sh"
        return 0
    fi
    
    # Source keystore properties
    source "$KEYSTORE_DIR/keystore.properties"
    
    # Check if keystore file exists
    KEYSTORE_FILE="$PROJECT_ROOT/android/$MYAPP_RELEASE_STORE_FILE"
    if [ ! -f "$KEYSTORE_FILE" ]; then
        log_error "Keystore file not found: $KEYSTORE_FILE"
        log_error "Please generate keystore first: $KEYSTORE_DIR/generate-keystore.sh"
        exit 1
    fi
    
    log_success "Keystore configuration validated"
}

# Build web assets
build_web_assets() {
    log_info "Building web assets..."
    
    cd "$PROJECT_ROOT"
    
    # Install dependencies if needed
    if [ ! -d "node_modules" ]; then
        log_info "Installing npm dependencies..."
        npm install
    fi
    
    # Build production web assets
    log_info "Building production web assets..."
    npm run build
    
    if [ $? -eq 0 ]; then
        log_success "Web assets built successfully"
    else
        log_error "Failed to build web assets"
        exit 1
    fi
}

# Sync Capacitor
sync_capacitor() {
    log_info "Syncing Capacitor with Android project..."
    
    cd "$PROJECT_ROOT"
    
    # Sync Capacitor Android
    npx cap sync android
    
    if [ $? -eq 0 ]; then
        log_success "Capacitor sync completed"
    else
        log_error "Failed to sync Capacitor"
        exit 1
    fi
}

# Build Android App Bundle
build_aab() {
    log_info "Building Android App Bundle (AAB)..."
    
    cd "$ANDROID_DIR"
    
    # Clean previous builds
    log_info "Cleaning previous builds..."
    ./gradlew clean
    
    # Build the AAB
    log_info "Generating AAB for $BUILD_TYPE build..."
    ./gradlew bundle${BUILD_TYPE^}
    
    if [ $? -eq 0 ]; then
        log_success "AAB built successfully"
    else
        log_error "Failed to build AAB"
        exit 1
    fi
}

# Copy and organize output files
organize_output() {
    log_info "Organizing output files..."
    
    # Create output directory
    mkdir -p "$OUTPUT_DIR"
    
    # Find the generated AAB
    AAB_SOURCE="$ANDROID_DIR/app/build/outputs/bundle/release/app-release.aab"
    AAB_TARGET="$OUTPUT_DIR/MyIEPHero-$(date +%Y%m%d-%H%M%S).aab"
    
    if [ -f "$AAB_SOURCE" ]; then
        cp "$AAB_SOURCE" "$AAB_TARGET"
        log_success "AAB copied to: $AAB_TARGET"
        
        # Generate metadata
        generate_build_metadata "$AAB_TARGET"
    else
        log_error "Generated AAB not found: $AAB_SOURCE"
        exit 1
    fi
    
    # Copy mapping files for crash reporting
    MAPPING_SOURCE="$ANDROID_DIR/app/build/outputs/mapping/release/mapping.txt"
    if [ -f "$MAPPING_SOURCE" ]; then
        MAPPING_TARGET="$OUTPUT_DIR/mapping-$(date +%Y%m%d-%H%M%S).txt"
        cp "$MAPPING_SOURCE" "$MAPPING_TARGET"
        log_success "ProGuard mapping file copied to: $MAPPING_TARGET"
    fi
}

# Generate build metadata
generate_build_metadata() {
    local aab_file="$1"
    local metadata_file="${aab_file%.aab}-metadata.json"
    
    log_info "Generating build metadata..."
    
    # Extract version information
    local version_name=$(grep "versionName" "$ANDROID_DIR/app/build.gradle" | sed 's/.*versionName "\(.*\)".*/\1/')
    local version_code=$(grep "versionCode" "$ANDROID_DIR/app/build.gradle" | sed 's/.*versionCode \(.*\)/\1/')
    
    cat > "$metadata_file" << EOF
{
    "app_name": "My IEP Hero",
    "package_name": "com.myiephero.app",
    "version_name": "$version_name",
    "version_code": $version_code,
    "build_type": "$BUILD_TYPE",
    "build_timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
    "build_machine": "$(uname -n)",
    "aab_file": "$(basename "$aab_file")",
    "file_size": "$(ls -lh "$aab_file" | awk '{print $5}')",
    "git_commit": "$(git rev-parse HEAD 2>/dev/null || echo 'unknown')",
    "git_branch": "$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo 'unknown')",
    "capacitor_version": "$(npx cap --version 2>/dev/null || echo 'unknown')",
    "build_tools": {
        "node": "$(node --version)",
        "npm": "$(npm --version)",
        "java": "$(java -version 2>&1 | head -1 | cut -d'\"' -f2)"
    },
    "play_console": {
        "format": "AAB",
        "target_track": "internal",
        "ready_for_upload": true
    }
}
EOF

    log_success "Build metadata generated: $metadata_file"
}

# Validate AAB with bundletool (if available)
validate_aab() {
    local aab_file="$1"
    
    log_info "Validating AAB file..."
    
    if command -v bundletool &> /dev/null; then
        log_info "Running bundletool validation..."
        bundletool validate --bundle="$aab_file"
        
        if [ $? -eq 0 ]; then
            log_success "AAB validation passed"
        else
            log_warning "AAB validation failed, but AAB may still be uploadable"
        fi
    else
        log_warning "bundletool not found. Skipping AAB validation."
        log_info "Install bundletool for AAB validation: https://github.com/google/bundletool"
    fi
    
    # Basic file checks
    if [ -f "$aab_file" ]; then
        local file_size=$(ls -lh "$aab_file" | awk '{print $5}')
        log_success "AAB file size: $file_size"
        
        # Check if file is too large for Play Console
        local size_bytes=$(stat -c%s "$aab_file" 2>/dev/null || stat -f%z "$aab_file" 2>/dev/null)
        local max_size=$((200 * 1024 * 1024))  # 200MB limit for Play Console
        
        if [ "$size_bytes" -gt "$max_size" ]; then
            log_warning "AAB file is larger than 200MB. This may cause issues with Play Console."
        fi
    fi
}

# Display build summary
display_summary() {
    local aab_file="$1"
    
    echo ""
    echo "🎉 Build Complete!"
    echo "=================="
    echo ""
    echo "📱 App: My IEP Hero"
    echo "📦 Format: Android App Bundle (AAB)"
    echo "🎯 Target: Google Play Console Internal Testing"
    echo "📄 File: $(basename "$aab_file")"
    echo "📁 Location: $aab_file"
    echo ""
    echo "📋 Next Steps:"
    echo "1. Upload AAB to Google Play Console"
    echo "2. Configure internal testing track"
    echo "3. Add internal testers"
    echo "4. Publish to internal testing"
    echo ""
    echo "🔗 Play Console: https://play.google.com/console"
    echo "📖 Documentation: $PROJECT_ROOT/docs/android-build.md"
    echo ""
}

# Main execution flow
main() {
    log_info "Starting Android App Bundle build process..."
    
    # Parse command line arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            --debug)
                BUILD_TYPE="debug"
                shift
                ;;
            --clean)
                log_info "Performing clean build..."
                cd "$ANDROID_DIR" && ./gradlew clean
                shift
                ;;
            --help)
                echo "Usage: $0 [--debug] [--clean] [--help]"
                echo ""
                echo "Options:"
                echo "  --debug  Build debug AAB instead of release"
                echo "  --clean  Clean build artifacts before building"
                echo "  --help   Show this help message"
                exit 0
                ;;
            *)
                log_warning "Unknown option: $1"
                shift
                ;;
        esac
    done
    
    # Execute build steps
    check_dependencies
    validate_keystore
    build_web_assets
    sync_capacitor
    build_aab
    organize_output
    
    # Find the generated AAB
    AAB_FILE=$(find "$OUTPUT_DIR" -name "MyIEPHero-*.aab" | head -1)
    
    if [ -n "$AAB_FILE" ]; then
        validate_aab "$AAB_FILE"
        display_summary "$AAB_FILE"
        
        # Set exit code based on success
        log_success "Android App Bundle build completed successfully! 🎉"
        exit 0
    else
        log_error "Failed to locate generated AAB file"
        exit 1
    fi
}

# Run main function with all arguments
main "$@"