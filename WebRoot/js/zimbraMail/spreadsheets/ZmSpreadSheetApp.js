ZmSpreadSheetApp = function(){
    this._init();
    this.startup();
};

ZmSpreadSheetApp.prototype.constructor = ZmSpreadSheetApp;

ZmSpreadSheetApp.prototype.toString = function(){
    return "ZmSpreadSheetApp";
};

ZmSpreadSheetApp.prototype._init = function(){
    this._controller = new ZmSpreadSheetController(appCtxt.getShell());  
};

ZmSpreadSheetApp.prototype.startup = function(){
    this._controller.show();  
};

ZmSpreadSheetApp.launch = function(){

    window.appCtxt = new ZmAppCtxt();
    appCtxt.rememberMe = false;

    // Create and initialize settings
    var settings = new ZmSettings();
    appCtxt.setSettings(settings);

    shell = new DwtShell({className:"MainShell"});
    appCtxt.setShell(shell);

    shell.getKeyboardMgr().registerKeyMap(new DwtKeyMap(true));

    appCtxt.setItemCache(new AjxCache());

    new ZmSpreadSheetApp();

};

window.onload = function() {
    setTimeout(function() {
            ZmSpreadSheetApp.launch();
    }, 200);
};