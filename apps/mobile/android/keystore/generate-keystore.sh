#!/bin/bash

# Generate Android Keystore for My IEP Hero Production Builds
# This script creates a production keystore for Google Play Console distribution

set -e  # Exit on any error

echo "=================================="
echo "My IEP Hero - Android Keystore Generator"
echo "=================================="
echo ""

# Check if keytool is available
if ! command -v keytool &> /dev/null; then
    echo "Error: keytool not found. Please ensure Java JDK is installed and in PATH."
    exit 1
fi

# Define keystore details
KEYSTORE_NAME="myiephero-release-key.keystore"
KEY_ALIAS="myiephero"
KEY_SIZE=2048
VALIDITY=10000  # ~27 years

echo "🔐 Generating production keystore..."
echo "Keystore: $KEYSTORE_NAME"
echo "Alias: $KEY_ALIAS"
echo "Key Size: $KEY_SIZE bits"
echo "Validity: $VALIDITY days"
echo ""

# Check if keystore already exists
if [ -f "$KEYSTORE_NAME" ]; then
    echo "⚠️  Warning: Keystore '$KEYSTORE_NAME' already exists!"
    echo "Creating a backup and generating a new one could break app updates."
    read -p "Do you want to continue? (y/N): " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "❌ Keystore generation cancelled."
        exit 1
    fi
    
    # Create backup
    echo "📦 Creating backup of existing keystore..."
    cp "$KEYSTORE_NAME" "${KEYSTORE_NAME}.backup.$(date +%Y%m%d_%H%M%S)"
fi

echo "📝 You will be prompted for the following information:"
echo "  - Keystore password (remember this!)"
echo "  - Key password (can be same as keystore password)"
echo "  - Your name and organization details"
echo ""

# Generate the keystore
keytool -genkey -v \
    -keystore "$KEYSTORE_NAME" \
    -alias "$KEY_ALIAS" \
    -keyalg RSA \
    -keysize $KEY_SIZE \
    -validity $VALIDITY

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Keystore generated successfully!"
    echo ""
    echo "🔒 Security checklist:"
    echo "  □ Save keystore password in password manager"
    echo "  □ Create secure backup of $KEYSTORE_NAME"
    echo "  □ Never commit keystore to version control"
    echo "  □ Set up keystore.properties file"
    echo ""
    
    # Set secure permissions
    chmod 600 "$KEYSTORE_NAME"
    echo "🔐 Keystore permissions set to 600 (owner read/write only)"
    
    # Generate keystore info
    echo ""
    echo "📋 Keystore Information:"
    keytool -list -v -keystore "$KEYSTORE_NAME"
    
    echo ""
    echo "📁 Next steps:"
    echo "  1. Copy keystore.properties.template to keystore.properties"
    echo "  2. Fill in your actual passwords in keystore.properties"
    echo "  3. Test release build: cd ../.. && ./gradlew bundleRelease"
    echo "  4. Upload the generated AAB to Play Console internal testing"
    
else
    echo ""
    echo "❌ Keystore generation failed!"
    exit 1
fi

echo ""
echo "=================================="
echo "Keystore Generation Complete!"
echo "=================================="