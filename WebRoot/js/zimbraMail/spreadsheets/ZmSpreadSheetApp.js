/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2009 Zimbra, Inc.
 * 
 * The contents of this file are subject to the Yahoo! Public License
 * Version 1.0 ("License"); you may not use this file except in
 * compliance with the License.  You may obtain a copy of the License at
 * http://www.zimbra.com/license.
 * 
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * ***** END LICENSE BLOCK *****
 */

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

    new ZmSpreadSheetApp();

};

window.onload = function() {
    setTimeout(function() {
            ZmSpreadSheetApp.launch();
    }, 200);
};