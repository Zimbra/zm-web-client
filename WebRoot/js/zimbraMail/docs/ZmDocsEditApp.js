/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2009, 2010, 2011, 2013, 2014, 2016 Synacor, Inc.
 *
 * The contents of this file are subject to the Common Public Attribution License Version 1.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at: https://www.zimbra.com/license
 * The License is based on the Mozilla Public License Version 1.1 but Sections 14 and 15
 * have been added to cover use of software over a computer network and provide for limited attribution
 * for the Original Developer. In addition, Exhibit A has been modified to be consistent with Exhibit B.
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * See the License for the specific language governing rights and limitations under the License.
 * The Original Code is Zimbra Open Source Web Client.
 * The Initial Developer of the Original Code is Zimbra, Inc.  All rights to the Original Code were
 * transferred by Zimbra, Inc. to Synacor, Inc. on September 14, 2015.
 *
 * All portions of the code are Copyright (C) 2009, 2010, 2011, 2013, 2014, 2016 Synacor, Inc. All Rights Reserved.
 * ***** END LICENSE BLOCK *****
 */

ZmDocsEditApp = function(){

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
    this._controller =
        ZmDocsEditApp._controller || new ZmDocsEditController(appCtxt.getShell());

    if (!ZmDocsEditApp._controller) {
        ZmDocsEditApp._controller = this._controller;
    }

    if (!appCtxt.getAppController()) {
        appCtxt.setAppController(this._controller);
    }
};

ZmDocsEditApp.prototype.startup = function(){
    this._controller.show();
};


ZmDocsEditApp.launch = function(){

    window.appCtxt = new ZmAppCtxt();

    appCtxt.rememberMe = false;

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
       version: 1,
       descEnabled: true
   };
};
