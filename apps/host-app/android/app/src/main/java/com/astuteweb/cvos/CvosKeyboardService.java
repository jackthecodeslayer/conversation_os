package com.astuteweb.cvos;

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
        // Inflate the keyboard layout
        View keyboardView = getLayoutInflater().inflate(R.layout.keyboard_view, null);
        
        keyboardWebView = keyboardView.findViewById(R.id.keyboard_webview);
        setupWebView();

        return keyboardView;
    }

    private void setupWebView() {
        WebSettings webSettings = keyboardWebView.getSettings();
        webSettings.setJavaScriptEnabled(true);
        webSettings.setDomStorageEnabled(true);

        // Add a Javascript interface to allow the WebView to send text to the input field
        keyboardWebView.addJavascriptInterface(new WebAppInterface(), "CVOSAndroidNative");

        keyboardWebView.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, String url) {
                view.loadUrl(url);
                return true;
            }
        });

        // Load the hosted Keyboard UI
        // In production, this would be https://play.cvos.app/keyboard
        keyboardWebView.loadUrl("https://cvos-backend.onrender.com/keyboard"); 
    }

    /**
     * JavaScript Interface to bridge the React Web App to the Android InputConnection
     */
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
