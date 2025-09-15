# Firebase Cloud Messaging (FCM) Setup for My IEP Hero

## Overview
This directory contains the Firebase Cloud Messaging configuration for My IEP Hero educational advocacy app to support push notifications for IEP meeting reminders, important updates, and educational content alerts.

## FCM Setup Steps

### Step 1: Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" or use existing project
3. Project name: "My IEP Hero"
4. Enable Google Analytics (recommended for educational apps)
5. Select analytics account or create new one

### Step 2: Add Android App to Firebase Project
1. In Firebase console, click "Add app" → Android
2. **Android package name**: `com.myiephero.app`
3. **App nickname**: "My IEP Hero Android"
4. **Debug signing certificate SHA-1**: [Get from debug keystore]
5. **Release signing certificate SHA-1**: [Get from production keystore]

### Step 3: Download Configuration Files
1. Download `google-services.json` file
2. Place in `android/app/google-services.json`
3. **IMPORTANT**: Never commit this file to version control
4. Add to `.gitignore` if not already present

### Step 4: Configure FCM Permissions
The following permissions are already configured in AndroidManifest.xml:
- `android.permission.POST_NOTIFICATIONS` (Android 13+)
- `android.permission.WAKE_LOCK`
- `android.permission.RECEIVE_BOOT_COMPLETED`
- `android.permission.VIBRATE`
- `com.google.android.c2dm.permission.RECEIVE`

### Step 5: Notification Channels (Educational App Specific)

#### Channel Configuration:
- **IEP Reminders**: High importance, sound enabled
- **Meeting Notifications**: High importance, vibration + sound
- **Document Updates**: Medium importance, silent
- **Educational Content**: Low importance, badge only

### Step 6: Testing FCM Setup

#### Debug Testing:
```bash
# Test FCM token generation
adb logcat | grep FCM

# Test notification delivery
# Use Firebase Console → Cloud Messaging → Send test message
```

#### Production Testing:
1. Upload APK/AAB to Play Console internal testing
2. Install app on test device
3. Verify FCM token registration
4. Test notification delivery through Firebase Console

## Educational App Notification Strategy

### Notification Types:
1. **IEP Meeting Reminders** (24 hours, 1 hour before)
2. **Document Deadline Alerts** (1 week, 24 hours before)
3. **Educational Content Updates** (Weekly digest)
4. **Advocacy Tool Updates** (As needed)
5. **Emergency Notifications** (Rare, high priority)

### Privacy Considerations (COPPA Compliance):
- All notifications respect educational privacy laws
- No personal student information in notification content
- Opt-in required for all notification types
- Easy unsubscribe mechanism
- Parental consent integration where applicable

## File Structure
```
android/fcm-setup/
├── README.md                    # This file
├── .gitignore                   # Ignore sensitive FCM files
├── google-services.json         # FCM config (DO NOT COMMIT)
├── fcm-token-helper.js          # Token management utilities
└── notification-channels.json   # Channel configuration
```

## Security Best Practices
- ✅ Never commit `google-services.json` to version control
- ✅ Use separate Firebase projects for dev/staging/production
- ✅ Implement notification token refresh handling
- ✅ Validate notification payloads server-side
- ✅ Use topics for group notifications (by school district, etc.)
- ✅ Implement notification analytics tracking

## Integration with Capacitor
The app uses `@capacitor/push-notifications` plugin with the following configuration:
- Android-specific notification channels
- Custom notification icons and colors
- Deep linking from notifications
- Background notification handling

## Troubleshooting

### Common Issues:
1. **FCM token not generated**: Check Google Play Services
2. **Notifications not received**: Verify app not in battery optimization
3. **Silent notifications**: Check notification channel importance
4. **Token refresh failures**: Implement token refresh listener

### Debug Commands:
```bash
# Check FCM setup
cd android && ./gradlew app:dependencies | grep firebase

# Validate google-services.json
firebase projects:list

# Test notification
firebase messaging:test --token [FCM_TOKEN]
```

## Play Console Integration
- FCM configuration is automatically included in AAB builds
- Firebase services are whitelisted in network security config
- Notification permissions properly declared for Play Store review
- Educational app content rating includes notification usage

## Next Steps
1. Set up Firebase project and download `google-services.json`
2. Configure notification server backend
3. Test FCM integration with internal testing builds
4. Configure notification topics for different user types
5. Implement analytics for notification effectiveness