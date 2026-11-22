package com.marketpoas.app;

import android.app.Activity;
import android.content.Intent;
import android.net.Uri;
import android.webkit.GeolocationPermissions;
import android.webkit.PermissionRequest;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebView;
import android.widget.ProgressBar;
import android.view.View;

public class AppWebChromeClient extends WebChromeClient {
    private Activity activity;
    private ProgressBar progressBar;
    public ValueCallback<Uri[]> filePathCallback;

    public AppWebChromeClient(Activity activity, ProgressBar progressBar) {
        this.activity = activity;
        this.progressBar = progressBar;
    }

    @Override
    public void onGeolocationPermissionsShowPrompt(String origin, GeolocationPermissions.Callback callback) {
        callback.invoke(origin, true, false);
    }

    @Override
    public void onPermissionRequest(PermissionRequest request) {
        request.grant(request.getResources());
    }

    @Override
    public boolean onShowFileChooser(WebView webView, ValueCallback<Uri[]> callback, FileChooserParams params) {
        if (filePathCallback != null) {
            filePathCallback.onReceiveValue(null);
        }
        filePathCallback = callback;
        Intent intent = params.createIntent();
        try {
            activity.startActivityForResult(intent, 100);
        } catch (Exception e) {
            filePathCallback = null;
            return false;
        }
        return true;
    }

    @Override
    public void onProgressChanged(WebView view, int progress) {
        if (progress < 100) {
            progressBar.setVisibility(View.VISIBLE);
            progressBar.setProgress(progress);
        } else {
            progressBar.setVisibility(View.GONE);
        }
    }
}
