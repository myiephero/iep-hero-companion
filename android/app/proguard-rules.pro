# Add project specific ProGuard rules here.
# Optimized for My IEP Hero Capacitor app with Play Store distribution

# === CAPACITOR SPECIFIC RULES ===
# Keep Capacitor core classes
-keep class com.getcapacitor.** { *; }
-keep class com.capacitorjs.** { *; }
-keep @com.getcapacitor.annotation.CapacitorPlugin class * {
    @com.getcapacitor.annotation.PermissionCallback <methods>;
    @com.getcapacitor.annotation.ActivityCallback <methods>;
    @com.getcapacitor.PluginMethod public <methods>;
}

# Keep WebView JavaScript interface classes
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}

# === WEB CONTENT OPTIMIZATION ===
# Keep JavaScript interface for WebView
-keepclassmembers class fqcn.of.javascript.interface.for.webview {
   public *;
}

# Keep WebView related classes
-keep class android.webkit.** { *; }
-keep class androidx.webkit.** { *; }

# === CAMERA PLUGIN RULES ===
-keep class com.capacitorjs.plugins.camera.** { *; }

# === PUSH NOTIFICATIONS RULES ===
-keep class com.capacitorjs.plugins.pushnotifications.** { *; }
-keep class com.google.firebase.** { *; }
-keep class com.google.android.gms.** { *; }

# === ANDROIDX RULES ===
-keep class androidx.core.content.** { *; }
-keep class androidx.appcompat.** { *; }

# === REFLECTION SUPPORT ===
# Keep attributes for reflection
-keepattributes Signature,RuntimeVisibleAnnotations,AnnotationDefault
-keepattributes SourceFile,LineNumberTable
-keepattributes *Annotation*

# === CRASH REPORTING OPTIMIZATION ===
# Keep line numbers for crash reports but rename source files
-renamesourcefileattribute SourceFile

# === SERIALIZATION SUPPORT ===
# Keep serialization support for data classes
-keepclassmembers class * implements java.io.Serializable {
    static final long serialVersionUID;
    private static final java.io.ObjectStreamField[] serialPersistentFields;
    private void writeObject(java.io.ObjectOutputStream);
    private void readObject(java.io.ObjectInputStream);
    java.lang.Object writeReplace();
    java.lang.Object readResolve();
}

# === GENERIC OPTIMIZATION ===
# Remove logging in production
-assumenosideeffects class android.util.Log {
    public static boolean isLoggable(java.lang.String, int);
    public static int v(...);
    public static int i(...);
    public static int w(...);
    public static int d(...);
    public static int e(...);
}

# === EDUCATIONAL APP SPECIFIC ===
# Keep any classes related to educational content processing
-keep class **.model.** { *; }
-keep class **.data.** { *; }

# === PLAY SERVICES COMPATIBILITY ===
-dontwarn com.google.android.gms.**
-dontwarn com.google.common.**

# === OKHTTP/RETROFIT (if used by plugins) ===
-dontwarn okhttp3.**
-dontwarn retrofit2.**

# === MULTIDEX SUPPORT ===
-keep class androidx.multidex.** { *; }

# === CAPACITOR COMMUNITY PLUGINS ===
-keep class com.capacitorjs.community.** { *; }
