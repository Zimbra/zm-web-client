/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2009, 2010 Zimbra, Inc.
 * 
 * The contents of this file are subject to the Zimbra Public License
 * Version 1.3 ("License"); you may not use this file except in
 * compliance with the License.  You may obtain a copy of the License at
 * http://www.zimbra.com/license.
 * 
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * ***** END LICENSE BLOCK *****
 */

ZmDocsEditApp = function(){

    appCtxt.setAppController(this);

    this._init();
    this.startup();

    window.app = this;

};

ZmDocsEditApp.prototype.constructor = ZmDocsEditApp;
ZmDocsEditApp.APP_ZIMBRA_DOC = "application/x-zimbra-doc";
ZmDocsEditApp._controller = null;

ZmDocsEditApp.prototype.toString = function(){
    return "ZmDocsEditApp";
};

ZmDocsEditApp.prototype._init = function(){
    ZmDocsEditApp._controller = this._controller = new ZmDocsEditController(appCtxt.getShell());
    appCtxt.setAppController(this._controller);    
};

ZmDocsEditApp.prototype.startup = function(){
    this._controller.show();
};


ZmDocsEditApp.launch = function(){

    window.appCtxt = new ZmAppCtxt();

    appCtxt.rememberMe = false;

    window.skin = null;

    // Create and initialize settings
    var settings = new ZmSettings();
    appCtxt.setSettings(settings);

    var shell = new DwtShell({className:"MainShell", userShell: document.getElementById("main_shell"), id:ZmId.SHELL});
    appCtxt.setShell(shell);

    shell.getKeyboardMgr().registerKeyMap(new DwtKeyMap(true));

    //Removing all the arguments
    var rest = location.href;
    ZmDocsEditApp.restUrl = rest.replace(/\?.*/,'');

    new ZmDocsEditApp();

};

ZmDocsEditApp.setItemInfo = function(item){
    ZmDocsEditApp.fileInfo = item;
    ZmDocsEditApp.fileInfo.loaded = true;
};

ZmDocsEditApp.setFile = function(fileId, fileName, folderId){

    if(!fileId || fileId == ""){
       fileId = null;
   }

   if(!fileName || fileName == ""){
       fileName = fileId ? null : ZmMsg.untitled
   }

   folderId = (!folderId || folderId == "") ? ZmOrganizer.ID_BRIEFCASE : folderId;

   ZmDocsEditApp.fileInfo = {
       folderId: folderId,
       contentType: ZmDocsEditApp.APP_ZIMBRA_DOC,
       name:    fileName,
       id:      fileId,
       version: 1
   };
};

ZmDocsEditApp._createDBG = function(devMode){

    var isDevMode = /^(1|true|on|yes)$/i.test(devMode);

    if(isDevMode){
        AjxDispatcher.require("Debug");
        window.DBG = new AjxDebug(AjxDebug.NONE, null, false);
    }else {
        window.AjxDebug = function() {};
        window.AjxDebug.prototype.toString		= function() { return "dummy DBG class"};
        window.AjxDebug.prototype.display		= function() {};
        window.AjxDebug.prototype.dumpObj		= function() {};
        window.AjxDebug.prototype.getDebugLevel	= function() {};
        window.AjxDebug.prototype.isDisabled	= function() {};
        window.AjxDebug.prototype.println		= function() {};
        window.AjxDebug.prototype.printRaw		= function() {};
        window.AjxDebug.prototype.printXML		= function() {};
        window.AjxDebug.prototype.setDebugLevel	= function() {};
        window.AjxDebug.prototype.setTitle		= function() {};
        window.AjxDebug.prototype.showTiming	= function() {};
        window.AjxDebug.prototype._getTimeStamp	= function() {};
        window.AjxDebug.prototype.timePt		= function() {};
        window.DBG = new window.AjxDebug();
    }
};

ZmDocsEditApp._beforeUnload =
function(){
    var appCtrl = appCtxt.getAppController();
    return appCtrl.exit();
};

window.onload = function() {
    setTimeout(function() {
            ZmDocsEditApp.launch();
            window.onbeforeunload = ZmDocsEditApp._beforeUnload;
    }, 200);
};