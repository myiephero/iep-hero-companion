import UIKit
import Capacitor
import WebKit

@UIApplicationMain
class AppDelegate: UIResponder, UIApplicationDelegate, WKNavigationDelegate {

    var window: UIWindow?

    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        // 🔒 CRITICAL iOS SAFARI FIX: Configure WebView to keep all navigation in-app
        if let bridge = CAPBridge.getLastCreatedBridge() {
            if let webView = bridge.webView {
                // Allow JavaScript to open windows in-place instead of Safari
                webView.configuration.preferences.javaScriptCanOpenWindowsAutomatically = true
                
                // Set navigation delegate to control redirects
                webView.navigationDelegate = self
                
                // Disable external link detection
                webView.configuration.dataDetectorTypes = []
                
                // Ensure all navigation stays in WebView
                webView.configuration.preferences.javaScriptEnabled = true
                
                print("🔒 WebView configured to prevent Safari redirects")
            }
        }
        
        // Override point for customization after application launch.
        return true
    }
    
    // 🔒 CRITICAL: Control navigation to prevent Safari redirects
    func webView(_ webView: WKWebView, decidePolicyFor navigationAction: WKNavigationAction, decisionHandler: @escaping (WKNavigationActionPolicy) -> Void) {
        guard let url = navigationAction.request.url else {
            decisionHandler(.allow)
            return
        }
        
        let urlString = url.absoluteString
        print("🔒 Navigation request: \(urlString)")
        
        // Allow all internal navigation (Replit domains and relative paths)
        if url.scheme == "file" || 
           url.scheme == "capacitor" ||
           urlString.contains("replit.dev") ||
           urlString.contains("replit.com") ||
           urlString.hasPrefix("/") ||
           url.host == navigationAction.request.url?.host {
            print("🔒 ALLOWING internal navigation: \(urlString)")
            decisionHandler(.allow)
        } else {
            print("🔒 BLOCKING external navigation: \(urlString)")
            // For truly external URLs, we could open in Safari if needed
            // UIApplication.shared.open(url)
            decisionHandler(.cancel)
        }
    }

    func applicationWillResignActive(_ application: UIApplication) {
        // Sent when the application is about to move from active to inactive state. This can occur for certain types of temporary interruptions (such as an incoming phone call or SMS message) or when the user quits the application and it begins the transition to the background state.
        // Use this method to pause ongoing tasks, disable timers, and invalidate graphics rendering callbacks. Games should use this method to pause the game.
    }

    func applicationDidEnterBackground(_ application: UIApplication) {
        // Use this method to release shared resources, save user data, invalidate timers, and store enough application state information to restore your application to its current state in case it is terminated later.
        // If your application supports background execution, this method is called instead of applicationWillTerminate: when the user quits.
    }

    func applicationWillEnterForeground(_ application: UIApplication) {
        // Called as part of the transition from the background to the active state; here you can undo many of the changes made on entering the background.
    }

    func applicationDidBecomeActive(_ application: UIApplication) {
        // Restart any tasks that were paused (or not yet started) while the application was inactive. If the application was previously in the background, optionally refresh the user interface.
    }

    func applicationWillTerminate(_ application: UIApplication) {
        // Called when the application is about to terminate. Save data if appropriate. See also applicationDidEnterBackground:.
    }

    func application(_ app: UIApplication, open url: URL, options: [UIApplication.OpenURLOptionsKey: Any] = [:]) -> Bool {
        // Called when the app was launched with a url. Feel free to add additional processing here,
        // but if you want the App API to support tracking app url opens, make sure to keep this call
        return ApplicationDelegateProxy.shared.application(app, open: url, options: options)
    }

    func application(_ application: UIApplication, continue userActivity: NSUserActivity, restorationHandler: @escaping ([UIUserActivityRestoring]?) -> Void) -> Bool {
        // Called when the app was launched with an activity, including Universal Links.
        // Feel free to add additional processing here, but if you want the App API to support
        // tracking app url opens, make sure to keep this call
        return ApplicationDelegateProxy.shared.application(application, continue: userActivity, restorationHandler: restorationHandler)
    }

}
