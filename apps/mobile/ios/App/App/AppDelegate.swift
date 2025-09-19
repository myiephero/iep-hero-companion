import UIKit
import Capacitor
import WebKit

@UIApplicationMain
class AppDelegate: UIResponder, UIApplicationDelegate, WKNavigationDelegate, WKUIDelegate {

    var window: UIWindow?

    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        // 🔒 CRITICAL FIX: Attach to the LIVE WebView, not a new instance
        guard let bridgeVC = window?.rootViewController as? CAPBridgeViewController,
              let webView = bridgeVC.bridge?.webView else { 
            print("[ERROR] Could not find live Capacitor WebView")
            return true 
        }
        
        webView.navigationDelegate = self
        webView.uiDelegate = self
        webView.configuration.preferences.javaScriptCanOpenWindowsAutomatically = true
        
        print("[SUCCESS] WebView delegates attached to live Capacitor instance")
        return true
    }
    
    func webView(_ webView: WKWebView, decidePolicyFor navigationAction: WKNavigationAction,
                 decisionHandler: @escaping (WKNavigationActionPolicy) -> Void) {

        let url = navigationAction.request.url
        print("[WKWebView] Navigation attempt:", url?.absoluteString ?? "")

        if let urlStr = url?.absoluteString {
            if urlStr.starts(with: "http://") || urlStr.starts(with: "https://") {
                if urlStr.contains("replit.dev") || urlStr.contains("myiephero://") {
                    decisionHandler(.allow)
                    return
                } else {
                    decisionHandler(.cancel)
                    print("[WKWebView] Blocked external navigation:", urlStr)
                    return
                }
            }
        }
        decisionHandler(.allow)
    }
    
    // 🔒 CRITICAL: Capture popup/new window requests and keep them in-app
    func webView(_ webView: WKWebView, createWebViewWith configuration: WKWebViewConfiguration, 
                 for navigationAction: WKNavigationAction, windowFeatures: WKWindowFeatures) -> WKWebView? {
        
        print("[WKUIDelegate] Popup request - Target frame:", navigationAction.targetFrame?.description ?? "nil")
        print("[WKUIDelegate] Popup URL:", navigationAction.request.url?.absoluteString ?? "")
        
        // For target=_blank or window.open with no target frame, load in existing WebView
        if navigationAction.targetFrame == nil {
            print("[WKUIDelegate] Loading popup in existing WebView instead of Safari")
            webView.load(navigationAction.request)
            return nil
        }
        return nil
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
