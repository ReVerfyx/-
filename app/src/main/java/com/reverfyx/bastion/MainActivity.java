package com.reverfyx.bastion;
import android.app.Activity;
import android.os.Bundle;
import android.view.View;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.webkit.WebChromeClient;
import android.webkit.JsResult;
import android.app.AlertDialog;
public class MainActivity extends Activity {
 private WebView game;
 @Override public void onCreate(Bundle saved) {
  super.onCreate(saved);
  getWindow().getDecorView().setSystemUiVisibility(View.SYSTEM_UI_FLAG_FULLSCREEN|View.SYSTEM_UI_FLAG_HIDE_NAVIGATION|View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY|View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION|View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN|View.SYSTEM_UI_FLAG_LAYOUT_STABLE);
  game=new WebView(this);
  game.setBackgroundColor(0xff182d2e);
  game.getSettings().setJavaScriptEnabled(true);
  game.getSettings().setDomStorageEnabled(true);
  game.getSettings().setAllowFileAccess(true);
  game.getSettings().setAllowContentAccess(false);
  game.setWebViewClient(new WebViewClient());
  game.setWebChromeClient(new WebChromeClient(){
   @Override public boolean onJsConfirm(WebView view,String url,String message,JsResult result){
    new AlertDialog.Builder(MainActivity.this).setMessage(message).setPositiveButton("Начать",(d,w)->result.confirm()).setNegativeButton("Отмена",(d,w)->result.cancel()).setOnCancelListener(d->result.cancel()).show();return true;
   }
  });
  setContentView(game);game.loadUrl("file:///android_asset/index.html");
 }
 @Override protected void onPause(){game.evaluateJavascript("paused=true;save();ui();",null);game.onPause();super.onPause();}
 @Override protected void onResume(){super.onResume();if(game!=null)game.onResume();}
 @Override public void onBackPressed(){game.evaluateJavascript("document.getElementById('options').click()",null);}
 @Override protected void onDestroy(){game.destroy();super.onDestroy();}
}
