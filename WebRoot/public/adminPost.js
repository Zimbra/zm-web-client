// NOTE: This code launches the administration application after
//       everything is loaded and initialized. This is needed
//       because of Zimlets. If there are Zimlets that load JS
//       dynamically and that code modifies the application
//       code, then the app needs to launch *after* that. But
//       since the browser doesn't execute the JS referenced
//       by <script> tags that are added dynamically until after
//       the current thread of control returns, we need to hook
//       into this after *that* in order to ensure that the app
//       is properly initialized before launch.
//
// NOTE: This post processing code cannot be included as the
//       text body of the dynamically created <script> tag
//       because IE doesn't allow that. Hence, it's in this
//       file.

ZaSettings.postInit();

var shell = DwtShell.getShell(window);
var appCtxt = ZaAppCtxt.getFromShell(shell);
var appController = appCtxt.getAppController();

appController._launchApp();