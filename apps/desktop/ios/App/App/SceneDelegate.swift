import UIKit
import Capacitor
import WebKit

class SceneDelegate: UIResponder, UIWindowSceneDelegate, WKNavigationDelegate, WKUIDelegate {

    var window: UIWindow?

    func scene(_ scene: UIScene, willConnectTo session: UISceneSession, options connectionOptions: UIScene.ConnectionOptions) {
        guard let windowScene = (scene as? UIWindowScene) else { return }
        
        print("🎯 [SceneDelegate] Scene connecting - this WILL run on iOS 13+")
        
        // Create window
        let window = UIWindow(windowScene: windowScene)
        self.window = window
        
        // Create and set root view controller
        let bridgeViewController = CAPBridgeViewController()
        window.rootViewController = bridgeViewController
        window.makeKeyAndVisible()
        
        // Attach delegates after a delay to ensure WebView is ready
        DispatchQueue.main.asyncAfter(deadline: .now() + 1.0) {
            self.attachWebViewDelegates(to: bridgeViewController)
        }
    }
    
    private func attachWebViewDelegates(to bridgeVC: CAPBridgeViewController) {
        guard let webView = bridgeVC.bridge?.webView else {
            print("🎯 [ERROR] Could not find live Capacitor WebView in SceneDelegate")
            return
        }
        
        webView.navigationDelegate = self
        webView.uiDelegate = self
        webView.configuration.preferences.javaScriptCanOpenWindowsAutomatically = true
        
        print("🎯 [SUCCESS] WebView delegates attached in SceneDelegate")
    }
    
    // MARK: - WKNavigationDelegate
    
    func webView(_ webView: WKWebView, decidePolicyFor navigationAction: WKNavigationAction,
                 decisionHandler: @escaping (WKNavigationActionPolicy) -> Void) {

        let url = navigationAction.request.url
        print("🎯 [WKWebView] Navigation attempt:", url?.absoluteString ?? "")

        if let urlStr = url?.absoluteString {
            if urlStr.starts(with: "http://") || urlStr.starts(with: "https://") {
                if urlStr.contains("replit.dev") || urlStr.contains("myiephero://") {
                    print("🎯 [WKWebView] ALLOWING internal navigation:", urlStr)
                    decisionHandler(.allow)
                    return
                } else {
                    print("🎯 [WKWebView] BLOCKED external navigation:", urlStr)
                    decisionHandler(.cancel)
                    return
                }
            }
        }
        decisionHandler(.allow)
    }
    
    // MARK: - WKUIDelegate (CRITICAL for blocking Safari)
    
    func webView(_ webView: WKWebView, createWebViewWith configuration: WKWebViewConfiguration, 
                 for navigationAction: WKNavigationAction, windowFeatures: WKWindowFeatures) -> WKWebView? {
        
        print("🎯 [WKUIDelegate] Popup request - Target frame:", navigationAction.targetFrame?.description ?? "nil")
        print("🎯 [WKUIDelegate] Popup URL:", navigationAction.request.url?.absoluteString ?? "")
        
        // For target=_blank or window.open with no target frame, load in existing WebView
        if navigationAction.targetFrame == nil {
            print("🎯 [WKUIDelegate] Loading popup in existing WebView instead of Safari")
            webView.load(navigationAction.request)
            return nil
        }
        return nil
    }

    func sceneDidDisconnect(_ scene: UIScene) {
        // Called as the scene is being released by the system.
    }

    func sceneDidBecomeActive(_ scene: UIScene) {
        // Called when the scene has moved from an inactive state to an active state.
    }

    func sceneWillResignActive(_ scene: UIScene) {
        // Called when the scene will move from an active state to an inactive state.
    }

    func sceneWillEnterForeground(_ scene: UIScene) {
        // Called as the scene transitions from the background to the foreground.
    }

    func sceneDidEnterBackground(_ scene: UIScene) {
        // Called as the scene transitions from the foreground to the background.
    }
}