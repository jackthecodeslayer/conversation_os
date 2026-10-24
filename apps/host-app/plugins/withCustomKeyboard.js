const { withAndroidManifest, withDangerousMod, createRunOncePlugin } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

const pkg = require('../package.json');

/**
 * Injects the custom InputMethodService declaration into AndroidManifest.xml
 */
const withAndroidKeyboardManifest = (config) => {
    return withAndroidManifest(config, async (config) => {
        const manifest = config.modResults.manifest;
        const mainApplication = manifest.application[0];

        // Ensure service isn't duplicated
        if (!mainApplication.service) {
            mainApplication.service = [];
        }

        const existingService = mainApplication.service.find(
            (s) => s.$ && s.$['android:name'] === '.CvosKeyboardService'
        );

        if (!existingService) {
            mainApplication.service.push({
                $: {
                    'android:name': '.CvosKeyboardService',
                    'android:label': 'Conversation OS Keyboard',
                    'android:permission': 'android.permission.BIND_INPUT_METHOD',
                    'android:exported': 'true'
                },
                'intent-filter': [
                    {
                        action: [{ $: { 'android:name': 'android.view.InputMethod' } }]
                    }
                ],
                'meta-data': [
                    {
                        $: {
                            'android:name': 'android.view.im',
                            'android:resource': '@xml/method'
                        }
                    }
                ]
            });
        }

        return config;
    });
};

/**
 * Copies native Java/XML resources (CvosKeyboardService.java, method.xml, keyboard_view.xml)
 * into the generated Android project directory during `expo prebuild`.
 */
const withAndroidKeyboardFiles = (config) => {
    return withDangerousMod(config, [
        'android',
        async (config) => {
            const projectRoot = config.modRequest.projectRoot;
            const androidAppDir = path.join(projectRoot, 'android', 'app');
            
            // 1. Target directories in the generated android build
            const javaDir = path.join(androidAppDir, 'src', 'main', 'java', 'com', 'astuteweb', 'cvos');
            const resXmlDir = path.join(androidAppDir, 'src', 'main', 'res', 'xml');
            const resLayoutDir = path.join(androidAppDir, 'src', 'main', 'res', 'layout');

            fs.mkdirSync(javaDir, { recursive: true });
            fs.mkdirSync(resXmlDir, { recursive: true });
            fs.mkdirSync(resLayoutDir, { recursive: true });

            // 2. Source templates directory
            const templatesDir = path.join(projectRoot, 'plugins', 'android', 'templates');

            // 3. Write CvosKeyboardService.java
            const serviceContent = `package com.astuteweb.cvos;

import android.inputmethodservice.InputMethodService;
import android.view.View;
import android.view.inputmethod.InputConnection;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.webkit.JavascriptInterface;

public class CvosKeyboardService extends InputMethodService {

    private WebView keyboardWebView;

    @Override
    public View onCreateInputView() {
        View keyboardView = getLayoutInflater().inflate(R.layout.keyboard_view, null);
        keyboardWebView = keyboardView.findViewById(R.id.keyboard_webview);
        setupWebView();
        return keyboardView;
    }

    private void setupWebView() {
        WebSettings webSettings = keyboardWebView.getSettings();
        webSettings.setJavaScriptEnabled(true);
        webSettings.setDomStorageEnabled(true);

        keyboardWebView.addJavascriptInterface(new WebAppInterface(), "CVOSAndroidNative");

        keyboardWebView.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, String url) {
                view.loadUrl(url);
                return true;
            }
        });

        // Points to our live conversational play dock
        keyboardWebView.loadUrl("https://cvos-backend.onrender.com/keyboard");
    }

    public class WebAppInterface {
        @JavascriptInterface
        public void commitText(String text) {
            InputConnection ic = getCurrentInputConnection();
            if (ic != null) {
                ic.commitText(text, 1);
            }
        }

        @JavascriptInterface
        public void deleteSurroundingText(int beforeLength, int afterLength) {
            InputConnection ic = getCurrentInputConnection();
            if (ic != null) {
                ic.deleteSurroundingText(beforeLength, afterLength);
            }
        }
    }
}
`;
            fs.writeFileSync(path.join(javaDir, 'CvosKeyboardService.java'), serviceContent, 'utf8');

            // 4. Write method.xml (IME descriptor)
            const methodContent = `<?xml version="1.0" encoding="utf-8"?>
<input-method xmlns:android="http://schemas.android.com/apk/res/android"
    android:settingsActivity="com.astuteweb.cvos.MainActivity">
    <subtype
        android:imeSubtypeLocale="en_US"
        android:imeSubtypeMode="keyboard"
        android:label="@string/app_name" />
</input-method>
`;
            fs.writeFileSync(path.join(resXmlDir, 'method.xml'), methodContent, 'utf8');

            // 5. Write keyboard_view.xml layout
            const layoutContent = `<?xml version="1.0" encoding="utf-8"?>
<LinearLayout xmlns:android="http://schemas.android.com/apk/res/android"
    android:layout_width="match_parent"
    android:layout_height="wrap_content"
    android:orientation="vertical"
    android:background="#0F172A">

    <WebView
        android:id="@+id/keyboard_webview"
        android:layout_width="match_parent"
        android:layout_height="320dp" />

</LinearLayout>
`;
            fs.writeFileSync(path.join(resLayoutDir, 'keyboard_view.xml'), layoutContent, 'utf8');

            return config;
        }
    ]);
};

const withCustomKeyboard = (config) => {
    config = withAndroidKeyboardManifest(config);
    config = withAndroidKeyboardFiles(config);
    return config;
};

module.exports = createRunOncePlugin(withCustomKeyboard, pkg.name, pkg.version);
