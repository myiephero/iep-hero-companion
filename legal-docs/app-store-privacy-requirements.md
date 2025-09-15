# App Store Privacy Requirements for My IEP Hero

**Last Updated:** September 15, 2025  
**Document Version:** 1.0  
**Next Review Date:** March 15, 2026

## iOS App Store Privacy Requirements

### App Privacy Labels Configuration

#### Data Types Collected - Required Declarations

**Contact Info:**
- ✅ Name
- ✅ Email Address  
- ✅ Phone Number
- ❌ Physical Address
- ❌ Other User Contact Info

**Health & Fitness:**
- ✅ Health (Medical information related to educational services)
- ❌ Fitness

**Financial Info:**
- ✅ Payment Info (Processed by Stripe - not stored by app)
- ❌ Credit Info
- ❌ Other Financial Info

**Location:**
- ✅ Coarse Location (City/State level for advocate matching)
- ❌ Precise Location

**Sensitive Info:**
- ✅ Sensitive Info (Educational records, disability information, health data)

**Contacts:**
- ❌ Contacts

**User Content:**
- ✅ Photos or Videos (Document uploads, profile photos)
- ✅ Audio Data (Voice messages in communications)
- ✅ Other User Content (IEP documents, educational records, messages)

**Browsing History:**
- ❌ Browsing History

**Search History:**
- ❌ Search History

**Identifiers:**
- ✅ User ID (Account identifiers)
- ✅ Device ID (For push notifications and security)

**Usage Data:**
- ✅ Product Interaction (App usage analytics)
- ✅ Advertising Data (Marketing campaign effectiveness)
- ❌ Other Usage Data

**Diagnostics:**
- ✅ Crash Data
- ✅ Performance Data
- ❌ Other Diagnostic Data

#### Data Use Purposes

**For each data type collected, specify purposes:**

**Third-Party Advertising:** ❌ NO
- We do not use data for third-party advertising

**Developer's Advertising or Marketing:** ✅ YES
- Email addresses for service communications
- Usage data for improving marketing

**Analytics:** ✅ YES
- Usage data for app improvement
- Performance analytics for optimization

**Product Personalization:** ✅ YES
- User preferences for customized experience
- Student profiles for personalized recommendations

**App Functionality:** ✅ YES
- All data types necessary for core educational advocacy services
- Communication features
- Document management
- Advocate matching

#### Data Linking to User Identity

**Linked to User:** ✅ YES
- Contact Info: Name, Email, Phone
- Health & Fitness: Medical information
- Financial Info: Payment information
- Location: Coarse location
- Sensitive Info: Educational records
- User Content: Documents, photos, messages
- Identifiers: User ID, Device ID
- Usage Data: Product interaction data
- Diagnostics: Crash and performance data

**Not Linked to User:** ❌ NONE
- All data we collect is necessarily linked to user accounts for educational advocacy services

#### Data Used for Tracking

**Used for Tracking:** ❌ NO
- We do not track users across apps and websites owned by other companies

### iOS Privacy Manifest Requirements

#### Required Privacy Manifest Entries

**NSPrivacyCollectedDataTypes:** 
```json
[
  {
    "NSPrivacyCollectedDataType": "NSPrivacyCollectedDataTypeEmailAddress",
    "NSPrivacyCollectedDataTypeLinked": true,
    "NSPrivacyCollectedDataTypeTracking": false,
    "NSPrivacyCollectedDataTypePurposes": ["NSPrivacyCollectedDataTypePurposeAppFunctionality", "NSPrivacyCollectedDataTypePurposeDeveloperAdvertising"]
  },
  {
    "NSPrivacyCollectedDataType": "NSPrivacyCollectedDataTypeName",
    "NSPrivacyCollectedDataTypeLinked": true,
    "NSPrivacyCollectedDataTypeTracking": false,
    "NSPrivacyCollectedDataTypePurposes": ["NSPrivacyCollectedDataTypePurposeAppFunctionality"]
  },
  {
    "NSPrivacyCollectedDataType": "NSPrivacyCollectedDataTypePhoneNumber",
    "NSPrivacyCollectedDataTypeLinked": true,
    "NSPrivacyCollectedDataTypeTracking": false,
    "NSPrivacyCollectedDataTypePurposes": ["NSPrivacyCollectedDataTypePurposeAppFunctionality"]
  },
  {
    "NSPrivacyCollectedDataType": "NSPrivacyCollectedDataTypeHealth",
    "NSPrivacyCollectedDataTypeLinked": true,
    "NSPrivacyCollectedDataTypeTracking": false,
    "NSPrivacyCollectedDataTypePurposes": ["NSPrivacyCollectedDataTypePurposeAppFunctionality"]
  },
  {
    "NSPrivacyCollectedDataType": "NSPrivacyCollectedDataTypePaymentInfo",
    "NSPrivacyCollectedDataTypeLinked": true,
    "NSPrivacyCollectedDataTypeTracking": false,
    "NSPrivacyCollectedDataTypePurposes": ["NSPrivacyCollectedDataTypePurposeAppFunctionality"]
  },
  {
    "NSPrivacyCollectedDataType": "NSPrivacyCollectedDataTypeCoarseLocation",
    "NSPrivacyCollectedDataTypeLinked": true,
    "NSPrivacyCollectedDataTypeTracking": false,
    "NSPrivacyCollectedDataTypePurposes": ["NSPrivacyCollectedDataTypePurposeAppFunctionality"]
  },
  {
    "NSPrivacyCollectedDataType": "NSPrivacyCollectedDataTypeSensitiveInfo",
    "NSPrivacyCollectedDataTypeLinked": true,
    "NSPrivacyCollectedDataTypeTracking": false,
    "NSPrivacyCollectedDataTypePurposes": ["NSPrivacyCollectedDataTypePurposeAppFunctionality"]
  },
  {
    "NSPrivacyCollectedDataType": "NSPrivacyCollectedDataTypePhotos",
    "NSPrivacyCollectedDataTypeLinked": true,
    "NSPrivacyCollectedDataTypeTracking": false,
    "NSPrivacyCollectedDataTypePurposes": ["NSPrivacyCollectedDataTypePurposeAppFunctionality"]
  },
  {
    "NSPrivacyCollectedDataType": "NSPrivacyCollectedDataTypeAudioData",
    "NSPrivacyCollectedDataTypeLinked": true,
    "NSPrivacyCollectedDataTypeTracking": false,
    "NSPrivacyCollectedDataTypePurposes": ["NSPrivacyCollectedDataTypePurposeAppFunctionality"]
  },
  {
    "NSPrivacyCollectedDataType": "NSPrivacyCollectedDataTypeOtherUserContent",
    "NSPrivacyCollectedDataTypeLinked": true,
    "NSPrivacyCollectedDataTypeTracking": false,
    "NSPrivacyCollectedDataTypePurposes": ["NSPrivacyCollectedDataTypePurposeAppFunctionality"]
  },
  {
    "NSPrivacyCollectedDataType": "NSPrivacyCollectedDataTypeUserID",
    "NSPrivacyCollectedDataTypeLinked": true,
    "NSPrivacyCollectedDataTypeTracking": false,
    "NSPrivacyCollectedDataTypePurposes": ["NSPrivacyCollectedDataTypePurposeAppFunctionality"]
  },
  {
    "NSPrivacyCollectedDataType": "NSPrivacyCollectedDataTypeDeviceID",
    "NSPrivacyCollectedDataTypeLinked": true,
    "NSPrivacyCollectedDataTypeTracking": false,
    "NSPrivacyCollectedDataTypePurposes": ["NSPrivacyCollectedDataTypePurposeAppFunctionality"]
  },
  {
    "NSPrivacyCollectedDataType": "NSPrivacyCollectedDataTypeProductInteraction",
    "NSPrivacyCollectedDataTypeLinked": true,
    "NSPrivacyCollectedDataTypeTracking": false,
    "NSPrivacyCollectedDataTypePurposes": ["NSPrivacyCollectedDataTypePurposeAnalytics", "NSPrivacyCollectedDataTypePurposeAppFunctionality"]
  },
  {
    "NSPrivacyCollectedDataType": "NSPrivacyCollectedDataTypeCrashData",
    "NSPrivacyCollectedDataTypeLinked": true,
    "NSPrivacyCollectedDataTypeTracking": false,
    "NSPrivacyCollectedDataTypePurposes": ["NSPrivacyCollectedDataTypePurposeAnalytics"]
  },
  {
    "NSPrivacyCollectedDataType": "NSPrivacyCollectedDataTypePerformanceData",
    "NSPrivacyCollectedDataTypeLinked": true,
    "NSPrivacyCollectedDataTypeTracking": false,
    "NSPrivacyCollectedDataTypePurposes": ["NSPrivacyCollectedDataTypePurposeAnalytics"]
  }
]
```

**NSPrivacyAccessedAPITypes:**
```json
[
  {
    "NSPrivacyAccessedAPIType": "NSPrivacyAccessedAPICategoryFileTimestamp",
    "NSPrivacyAccessedAPITypeReasons": ["C617.1"]
  },
  {
    "NSPrivacyAccessedAPIType": "NSPrivacyAccessedAPICategoryUserDefaults", 
    "NSPrivacyAccessedAPITypeReasons": ["CA92.1"]
  },
  {
    "NSPrivacyAccessedAPIType": "NSPrivacyAccessedAPICategoryDiskSpace",
    "NSPrivacyAccessedAPITypeReasons": ["E174.1"]
  }
]
```

### iOS App Store Connect Configuration

#### App Information Privacy Section
- **Privacy Policy URL:** https://myiephero.com/privacy-policy
- **Privacy Contact Information:** privacy@myiephero.com
- **Age Rating:** 4+ (Educational content suitable for all ages)
- **Content Descriptions:** Educational, Medical/Treatment Information

#### App Review Notes for Privacy
```
PRIVACY REVIEW NOTES:

My IEP Hero is an educational advocacy platform that processes sensitive educational records and health information under the following legal frameworks:

1. FERPA Compliance: Educational records processed under Family Educational Rights and Privacy Act
2. HIPAA Compliance: Health information protected under HIPAA security standards
3. COPPA Compliance: Enhanced protections for children under 13

The app requires collection of sensitive information including:
- Student educational records (IEP documents, evaluations)
- Health information related to educational services
- Personal contact information for advocacy services

All data collection is necessary for the core educational advocacy functionality and is processed with appropriate safeguards including:
- End-to-end encryption for all sensitive data
- Role-based access controls
- Audit logging for all data access
- Regular security assessments

No data is used for advertising or tracking purposes. Data sharing only occurs with explicit user consent for educational advocacy services.

Privacy Policy: https://myiephero.com/privacy-policy
Contact: privacy@myiephero.com
```

## Google Play Store Privacy Requirements

### Data Safety Section Configuration

#### Data Collection Declaration

**Personal Info:**
- ✅ Name: Collected, Shared, Required
- ✅ Email address: Collected, Shared, Required  
- ✅ Phone number: Collected, Shared, Required
- ❌ User IDs
- ❌ Address
- ❌ Other info

**Financial Info:**
- ✅ User payment info: Collected, Not Shared, Required
- ❌ Purchase history
- ❌ Credit score
- ❌ Other financial info

**Health and Fitness:**
- ✅ Health info: Collected, Shared, Required
- ❌ Fitness info

**Messages:**
- ✅ Emails: Collected, Shared, Required
- ✅ SMS or MMS: Collected, Shared, Required
- ✅ Other in-app messages: Collected, Shared, Required

**Photos and Videos:**
- ✅ Photos: Collected, Shared, Optional
- ✅ Videos: Collected, Shared, Optional

**Audio Files:**
- ✅ Voice or sound recordings: Collected, Shared, Optional
- ❌ Music files
- ❌ Other audio files

**Files and Docs:**
- ✅ Files and docs: Collected, Shared, Required

**Calendar:**
- ❌ Calendar events

**Contacts:**
- ❌ Contacts

**Location:**
- ✅ Approximate location: Collected, Shared, Required
- ❌ Precise location

**Web Browsing:**
- ❌ Web browsing history

**App Activity:**
- ✅ App interactions: Collected, Not Shared, Optional
- ✅ In-app search history: Collected, Not Shared, Optional
- ✅ Installed apps: Not Collected
- ❌ Other user-generated content
- ❌ Other actions

**App Info and Performance:**
- ✅ Crash logs: Collected, Not Shared, Optional
- ✅ Diagnostics: Collected, Not Shared, Optional
- ❌ Other app performance data

**Device or Other IDs:**
- ✅ Device or other IDs: Collected, Not Shared, Optional

#### Data Use Purposes

**For each data type, specify all applicable purposes:**

**Account Management:**
- Personal info (Name, Email, Phone)
- Financial info (Payment information)
- Health info (Medical information)
- Messages (All types)
- Location (Approximate)
- Files and docs
- Device IDs

**Analytics:**
- App interactions
- Crash logs
- Diagnostics
- Device IDs

**Developer Communications:**
- Personal info (Email)
- Messages (For support and service communications)

**Fraud Prevention, Security, and Compliance:**
- Personal info (All types)
- Financial info
- Health info
- Messages
- Photos and videos
- Audio files
- Files and docs
- Location
- App interactions
- Device IDs

**Personalization:**
- Personal info (Name, preferences)
- Health info (Student profiles)
- Location (Advocate matching)
- App interactions
- In-app search history

**App Functionality:**
- ALL collected data types (Required for core educational advocacy services)

#### Data Sharing

**Third Parties Data is Shared With:**

**Educational Advocates (Service Providers):**
- Personal info: Name, Email, Phone
- Health info: Medical information relevant to educational services
- Messages: Platform communications
- Photos and videos: Educational documents
- Audio files: Voice messages
- Files and docs: IEP documents, evaluations
- Location: General location for matching

**Payment Processors (Stripe):**
- Personal info: Name, Email
- Financial info: Payment information

**Cloud Storage Providers:**
- Files and docs: Encrypted document storage
- Photos and videos: Encrypted media storage

**Analytics Providers (Google Analytics):**
- App interactions: Aggregated usage data
- Crash logs: Error reporting
- Diagnostics: Performance data

#### Data Security

**Data Encryption:**
- ✅ Data in transit: All data encrypted using TLS 1.3
- ✅ Data at rest: All stored data encrypted using AES-256

**Data Deletion:**
- ✅ Users can request data deletion through app settings and customer support
- Data retention follows educational record requirements (3-7 years for educational records)

### Google Play Console Configuration

#### App Content Declarations

**Target Audience:**
- Primary: Parents (Ages 18-64)
- Secondary: Educational Professionals (Ages 25-64)

**Content Rating:**
- ESRB: Everyone
- PEGI: 3
- Content suitable for all ages with parental guidance for account setup

**Government App:**
- ❌ No - Not a government application

**COVID-19 Contact Tracing and Status Apps:**
- ❌ No - Not related to COVID-19 contact tracing

**DataSafety Additional Information:**
```
ADDITIONAL INFORMATION:

Educational Advocacy Platform: My IEP Hero processes sensitive educational records under federal privacy laws including FERPA (Family Educational Rights and Privacy Act) and HIPAA (Health Insurance Portability and Accountability Act).

Data Collection Necessity: All collected data is essential for providing educational advocacy services, including IEP document analysis, advocate matching, and secure communication between parents and certified educational advocates.

Enhanced Security: Due to the sensitive nature of educational and health information, we implement enhanced security measures including:
- End-to-end encryption for all communications
- Multi-factor authentication for all accounts
- Regular security audits and penetration testing
- HIPAA-level security safeguards

Children's Privacy: Special protections implemented for children under 13 in compliance with COPPA (Children's Online Privacy Protection Act).

Professional Standards: All advocates verified and bound by professional ethical standards and confidentiality requirements.

Contact: privacy@myiephero.com for privacy questions
```

## Cross-Platform Privacy Implementation

### Unified Privacy Controls

#### In-App Privacy Settings
```
Privacy Dashboard Features:
- Data Download (Export all user data)
- Account Deletion (Complete data removal)
- Communication Preferences (Email, SMS, Push notifications)
- Data Sharing Controls (Advocate sharing permissions)
- Marketing Preferences (Service communications only)
- Two-Factor Authentication (Enhanced security)
- Login Activity (View recent account access)
- Connected Services (Manage third-party integrations)
```

#### Consent Management
```
Required Consent Types:
1. Account Creation Consent
   - Service Terms acceptance
   - Privacy Policy acknowledgment
   - Age verification (18+ or parental consent)

2. Educational Records Consent (FERPA)
   - Student information collection
   - Educational document processing
   - Advocate sharing permissions

3. Health Information Consent (HIPAA)
   - Medical information collection
   - Health data processing for educational purposes
   - Provider sharing authorization

4. Children's Data Consent (COPPA - if applicable)
   - Verifiable parental consent for children under 13
   - Limited data collection acknowledgment
   - Enhanced security notification

5. Marketing Communications Consent
   - Service-related communications (required)
   - Product updates and features (optional)
   - Educational resources and tips (optional)

6. Analytics and Improvement Consent
   - Usage analytics (optional)
   - Crash reporting (recommended)
   - Feature usage tracking (optional)
```

### Technical Implementation

#### iOS Privacy Integration
```swift
// Privacy manifest integration
import AppTrackingTransparency
import AdSupport

// Request tracking authorization (not needed - we don't track)
// ATTrackingManager.requestTrackingAuthorization { status in ... }

// Privacy-safe analytics
struct PrivacyAnalytics {
    static func trackEvent(_ event: String, parameters: [String: Any]? = nil) {
        // Only track anonymized, aggregated data
        // No personally identifiable information
    }
}
```

#### Android Privacy Integration
```kotlin
// Privacy controls implementation
class PrivacyManager {
    fun requestDataDeletion() {
        // Implement complete account and data deletion
    }
    
    fun exportUserData(): File {
        // Generate complete data export in machine-readable format
    }
    
    fun updatePrivacyPreferences(preferences: PrivacyPreferences) {
        // Update user privacy preferences
    }
}
```

### Regular Compliance Monitoring

#### Monthly Privacy Audits
- Review data collection practices
- Verify consent mechanisms
- Test privacy controls
- Update privacy labels if needed

#### Quarterly Legal Reviews
- Review regulatory changes
- Update privacy policies
- Assess new features for privacy impact
- Conduct privacy impact assessments

#### Annual Privacy Assessments
- Comprehensive privacy program review
- Third-party privacy audit
- Security assessment
- Regulatory compliance verification

## Privacy Policy Integration

### App Store Requirement Compliance
Both iOS and Google Play require the privacy policy to be:
- Accessible within the app
- Available at a public URL
- Written in clear, understandable language
- Comprehensive in covering all data practices
- Regularly updated to reflect current practices

### In-App Privacy Policy Access
```
Implementation Requirements:
1. Privacy Policy link in app settings
2. Privacy Policy acceptance during onboarding
3. Privacy Policy updates notification system
4. Easy access from account management screens
5. Downloadable PDF version available
6. Version history accessible
```

## Contact Information

### Privacy Support
- **Privacy Team**: privacy@myiephero.com
- **Data Protection Officer**: dpo@myiephero.com
- **Customer Support**: support@myiephero.com
- **Emergency Privacy Contact**: 1-800-IEP-HERO

### Developer Contact (For App Stores)
- **Developer Email**: developer@myiephero.com
- **Technical Support**: support@myiephero.com
- **Business Contact**: business@myiephero.com

---

**Document Classification:** Public  
**Approval Required:** Legal Team, Privacy Officer, Development Team  
**Distribution:** Development Team, Product Team, Legal Team, Marketing Team  
**Next Review:** March 15, 2026

This document provides the specific privacy declarations and configurations required for successful app store submission and ongoing compliance with iOS App Store and Google Play Store privacy requirements.