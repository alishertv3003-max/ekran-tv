package uz.ekrantv.android;

import android.app.Activity;
import android.content.ActivityNotFoundException;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.graphics.Color;
import android.os.Bundle;
import android.net.Uri;
import android.view.View;
import android.view.WindowManager;
import android.webkit.CookieManager;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.FrameLayout;

public class MainActivity extends Activity {
    private static final String URL="https://alishertv3003-max.github.io/ekran-tv/";
    private FrameLayout root;
    private WebView web;
    private View fullView;
    private WebChromeClient.CustomViewCallback fullCallback;

    @Override public void onCreate(Bundle saved) {
        super.onCreate(saved);
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
        boolean tv=getPackageManager().hasSystemFeature(PackageManager.FEATURE_LEANBACK)
              || getPackageManager().hasSystemFeature("android.hardware.type.television");
        if (tv) getWindow().getDecorView().setSystemUiVisibility(
            View.SYSTEM_UI_FLAG_FULLSCREEN|View.SYSTEM_UI_FLAG_HIDE_NAVIGATION|View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY);
        root=new FrameLayout(this);
        root.setBackgroundColor(Color.rgb(14,12,24));
        web=new WebView(this);
        web.setBackgroundColor(Color.rgb(14,12,24));
        web.setFocusable(true);
        web.setFocusableInTouchMode(true);
        WebSettings s=web.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setMediaPlaybackRequiresUserGesture(false);
        s.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
        s.setSupportZoom(false);
        s.setBuiltInZoomControls(false);
        CookieManager.getInstance().setAcceptCookie(true);
        CookieManager.getInstance().setAcceptThirdPartyCookies(web,true);
        web.setWebViewClient(new WebViewClient(){
            @Override public boolean shouldOverrideUrlLoading(WebView v, WebResourceRequest request){
                if (!request.isForMainFrame()) return false;
                Uri u=request.getUrl();
                if ("alishertv3003-max.github.io".equals(u.getHost())) return false;
                if (!"https".equals(u.getScheme())) return true;
                try {startActivity(new Intent(Intent.ACTION_VIEW,u));}
                catch(ActivityNotFoundException ignored){}
                return true;
            }
            @Override public void onPageFinished(WebView v, String url){
                if(tv) injectTvNavigation();
            }
        });
        web.setWebChromeClient(new WebChromeClient(){
            @Override public void onShowCustomView(View v,CustomViewCallback callback){
                if(fullView!=null){callback.onCustomViewHidden();return;}
                fullView=v;fullCallback=callback;
                web.setVisibility(View.GONE);
                root.addView(v,new FrameLayout.LayoutParams(-1,-1));
            }
            @Override public void onHideCustomView(){
                if(fullView==null)return;
                root.removeView(fullView);
                fullView=null;
                if(fullCallback!=null)fullCallback.onCustomViewHidden();
                fullCallback=null;
                web.setVisibility(View.VISIBLE);
            }
        });
        root.addView(web,new FrameLayout.LayoutParams(-1,-1));
        setContentView(root);
        web.loadUrl(URL);
    }
    private void injectTvNavigation(){
        String js="(function(){if(window.__ekranRemote)return;window.__ekranRemote=true;"
            +"var style=document.createElement('style');style.innerHTML='a:focus,button:focus,input:focus,select:focus{outline:4px solid #ffd44a!important;outline-offset:4px!important}';document.head.appendChild(style);"
            +"var sel='a[href],button:not([disabled]),input:not([disabled]),select:not([disabled])';"
            +"function options(){return Array.from(document.querySelectorAll(sel)).filter(function(el){var r=el.getBoundingClientRect();return r.width>4&&r.height>4&&!el.closest('[hidden]')});}"
            +"function pos(el){var r=el.getBoundingClientRect();return{x:(r.left+r.right)/2,y:(r.top+r.bottom)/2}}"
            +"document.addEventListener('keydown',function(e){if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key))return;"
            +"if(document.activeElement&&/^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement.tagName))return;"
            +"var a=options();if(!a.length)return;var old=a.includes(document.activeElement)?document.activeElement:null;"
            +"if(!old){e.preventDefault();a[0].focus();return}var p=pos(old),best=null,score=1e8;"
            +"a.forEach(function(el){if(el===old)return;var q=pos(el),dx=q.x-p.x,dy=q.y-p.y;"
            +"var m=e.key==='ArrowLeft'?-dx:e.key==='ArrowRight'?dx:e.key==='ArrowUp'?-dy:dy;"
            +"var cross=e.key==='ArrowLeft'||e.key==='ArrowRight'?Math.abs(dy):Math.abs(dx);var s=m+cross*2.2;"
            +"if(m>4&&s<score){score=s;best=el}});if(best){e.preventDefault();best.focus();best.scrollIntoView({block:'center',behavior:'smooth'})}},true);"
            +"setTimeout(function(){var a=options();if(a.length)a[0].focus()},400)})()";
        web.evaluateJavascript(js,null);
    }
    @Override @Deprecated public void onBackPressed(){
        if(fullView!=null){root.removeView(fullView);fullView=null;if(fullCallback!=null)fullCallback.onCustomViewHidden();fullCallback=null;web.setVisibility(View.VISIBLE);return;}
        if(web.canGoBack())web.goBack();else finish();
    }
    @Override protected void onDestroy(){
        if(web!=null){web.loadUrl("about:blank");web.stopLoading();root.removeView(web);web.destroy();web=null;}
        super.onDestroy();
    }
}
