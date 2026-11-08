package uz.ekrantv.android;

import android.app.Activity;
import android.os.Bundle;
import android.content.Intent;
import android.content.ActivityNotFoundException;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.graphics.Color;
import android.view.View;
import android.view.KeyEvent;
import android.view.WindowManager;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.CookieManager;
import android.widget.FrameLayout;
import java.io.InputStream;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.util.Locale;

public class MainActivity extends Activity {
  private final String ORIGIN="https://appassets.androidplatform.net";
  private FrameLayout root;
  private WebView web;
  private View full;
  private WebChromeClient.CustomViewCallback fullCallback;
  private boolean tv;
  private boolean closing=false;
  @Override public void onCreate(Bundle state) {
    super.onCreate(state);
    getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
    tv=getPackageManager().hasSystemFeature(PackageManager.FEATURE_LEANBACK) ||
       getPackageManager().hasSystemFeature("android.hardware.type.television");
    if(tv) getWindow().getDecorView().setSystemUiVisibility(
       View.SYSTEM_UI_FLAG_FULLSCREEN|View.SYSTEM_UI_FLAG_HIDE_NAVIGATION|View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY);
    root=new FrameLayout(this);
    root.setBackgroundColor(Color.rgb(14,12,24));
    web=new WebView(this);
    web.setBackgroundColor(Color.rgb(14,12,24));
    web.setFocusable(true);
    web.setFocusableInTouchMode(true);
    WebSettings settings=web.getSettings();
    settings.setJavaScriptEnabled(true);
    settings.setDomStorageEnabled(true);
    settings.setMediaPlaybackRequiresUserGesture(false);
    settings.setAllowFileAccess(false);
    settings.setAllowContentAccess(false);
    settings.setAllowFileAccessFromFileURLs(false);
    settings.setAllowUniversalAccessFromFileURLs(false);
    settings.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
    settings.setSupportZoom(false);
    CookieManager.getInstance().setAcceptCookie(true);
    CookieManager.getInstance().setAcceptThirdPartyCookies(web,false);
    web.setWebViewClient(new WebViewClient() {
      @Override public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
        Uri u=request.getUrl();
        if(!"https".equals(u.getScheme())||!"appassets.androidplatform.net".equals(u.getHost()))return null;
        String path=u.getPath();
        if(path==null||!path.startsWith("/assets/"))return null;
        String relative=path.substring(8);
        if(relative.isEmpty())relative="index.html";
        if(relative.contains("..")||relative.startsWith("/"))return null;
        try {
          InputStream in=getAssets().open("site/"+relative);
          String mime=getMime(relative);
          String encoding=(mime.startsWith("text/")||mime.contains("javascript")||mime.contains("json"))?"UTF-8":null;
          return new WebResourceResponse(mime,encoding,in);
        }catch(IOException e){
          return new WebResourceResponse("text/plain","UTF-8",404,"Not found",null,new ByteArrayInputStream(new byte[0]));
        }
      }
      @Override public boolean shouldOverrideUrlLoading(WebView view,WebResourceRequest req){
        if(!req.isForMainFrame())return false;
        Uri uri=req.getUrl();
        if(ORIGIN.equals(uri.getScheme()+"://"+uri.getAuthority()))return false;
        if(!"https".equals(uri.getScheme()))return true;
        try{startActivity(new Intent(Intent.ACTION_VIEW,uri));}catch(ActivityNotFoundException ignored){}
        return true;
      }
      @Override public void onPageFinished(WebView view,String url){
        if(tv) view.evaluateJavascript(remoteScript(),null);
      }
    });
    web.setWebChromeClient(new WebChromeClient(){
      @Override public void onShowCustomView(View v,CustomViewCallback cb){
        if(full!=null){cb.onCustomViewHidden();return;}
        full=v;fullCallback=cb;web.setVisibility(View.GONE);
        root.addView(v,new FrameLayout.LayoutParams(-1,-1));
      }
      @Override public void onHideCustomView(){
        if(full==null)return;
        root.removeView(full);full=null;
        if(fullCallback!=null)fullCallback.onCustomViewHidden();
        fullCallback=null;web.setVisibility(View.VISIBLE);
      }
    });
    root.addView(web,new FrameLayout.LayoutParams(-1,-1));
    setContentView(root);
    web.loadUrl(ORIGIN+"/assets/index.html"+(tv?"?tv=1":""));
  }
  private String getMime(String path){
    String p=path.toLowerCase(Locale.US);
    if(p.endsWith(".js"))return "text/javascript";
    if(p.endsWith(".css"))return "text/css";
    if(p.endsWith(".html"))return "text/html";
    if(p.endsWith(".json")||p.endsWith(".webmanifest"))return "application/json";
    if(p.endsWith(".svg"))return "image/svg+xml";
    if(p.endsWith(".png"))return "image/png";
    if(p.endsWith(".jpg")||p.endsWith(".jpeg"))return "image/jpeg";
    if(p.endsWith(".webp"))return "image/webp";
    return "application/octet-stream";
  }
  private String remoteScript() {
    return "(function(){if(window.__ekranRemote)return;window.__ekranRemote=true;"
      +"var st=document.createElement('style');st.textContent='a:focus,button:focus,input:focus,select:focus,[tabindex]:focus{outline:4px solid #ffcc42!important;outline-offset:4px!important}';document.head.appendChild(st);"
      +"var sel='a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),[tabindex]';"
      +"function opts(){return Array.from(document.querySelectorAll(sel)).filter(function(el){var r=el.getBoundingClientRect();return r.width>3&&r.height>3&&el.getAttribute('tabindex')!=='-1'&&getComputedStyle(el).visibility!=='hidden'&&!el.closest('[hidden]')});}"
      +"function p(e){var r=e.getBoundingClientRect();return{x:(r.left+r.right)/2,y:(r.top+r.bottom)/2};}"
      +"document.addEventListener('keydown',function(e){if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key))return;"
      +"if(document.activeElement&&/^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement.tagName))return;"
      +"var arr=opts(),old=arr.includes(document.activeElement)?document.activeElement:null;"
      +"if(!old){e.preventDefault();if(arr.length)arr[0].focus();return;}"
      +"var q=p(old),best=null,sc=1e8;"
      +"arr.forEach(function(a){if(a===old)return;var t=p(a),dx=t.x-q.x,dy=t.y-q.y;"
      +"var primary=e.key==='ArrowLeft'?-dx:e.key==='ArrowRight'?dx:e.key==='ArrowUp'?-dy:dy;"
      +"var cross=e.key==='ArrowLeft'||e.key==='ArrowRight'?Math.abs(dy):Math.abs(dx);var score=primary+cross*2.2;"
      +"if(primary>3&&score<sc){best=a;sc=score;}});"
      +"if(best){e.preventDefault();best.focus();best.scrollIntoView({block:'center',inline:'nearest'});}},true);"
      +"setTimeout(function(){var a=opts();if(a.length)a[0].focus()},250);})()";
  }
  @Override @Deprecated public void onBackPressed(){
    if(full!=null){root.removeView(full);full=null;if(fullCallback!=null)fullCallback.onCustomViewHidden();fullCallback=null;web.setVisibility(View.VISIBLE);return;}
    if(web==null){finish();return;}
    web.evaluateJavascript("(function(){if(window.EKRAN_FILM_PLAYER&&window.EKRAN_FILM_PLAYER.isOpen()){window.EKRAN_FILM_PLAYER.close();return true;}if(window.EKRAN_FILM_PLAYER&&window.EKRAN_FILM_PLAYER.isOpen()){window.EKRAN_FILM_PLAYER.close();return true;}if(window.EKRAN_TV_PLAYER&&window.EKRAN_TV_PLAYER.isOpen()){window.EKRAN_TV_PLAYER.close();return true;}var m=document.getElementById('modal');if(m&&!m.hidden){var c=document.getElementById('pClose');if(c)c.click();return true;}return false;})()",r->{
      if(!"true".equals(r)){if(web.canGoBack())web.goBack();else finish();}
    });
  }
  @Override protected void onDestroy(){if(web!=null){web.loadUrl("about:blank");web.stopLoading();root.removeView(web);web.destroy();web=null;}super.onDestroy();}
}
