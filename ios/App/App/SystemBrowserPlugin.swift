import Foundation
import Capacitor

@objc(SystemBrowserPlugin)
public class SystemBrowserPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "SystemBrowserPlugin"
    public let jsName = "SystemBrowser"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "open", returnType: CAPPluginReturnPromise)
    ]

    @objc func open(_ call: CAPPluginCall) {
        guard let urlString = call.getString("url"), let url = URL(string: urlString) else {
            call.reject("Must provide a valid URL to open")
            return
        }

        DispatchQueue.main.async {
            UIApplication.shared.open(url, options: [:]) { success in
                if success {
                    call.resolve()
                } else {
                    call.reject("Unable to open URL in system browser")
                }
            }
        }
    }
}
