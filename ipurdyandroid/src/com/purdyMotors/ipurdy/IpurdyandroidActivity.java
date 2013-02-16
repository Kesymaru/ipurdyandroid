package com.purdyMotors.ipurdy;

import org.apache.cordova.DroidGap;
import android.os.Bundle;

public class IpurdyandroidActivity extends DroidGap {
    /** Called when the activity is first created. */
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        super.setIntegerProperty("loadUrlTimeoutValue", 70000);
        super.setIntegerProperty("splashscreen", R.drawable.splash);
        super.loadUrl("file:///android_asset/www/index.html", 70000);
    }
}
