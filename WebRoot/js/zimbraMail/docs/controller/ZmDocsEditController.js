/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2008, 2009, 2010 Zimbra, Inc.
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

ZmDocsEditController = 	function(shell) {
   if(arguments.length == 0) return;
    ZmController.call(this, shell);

    this._docsEdit = null;
    this._toolbar = null;

    this._docMgr = new ZmDocletMgr();
    this._requestMgr = new ZmRequestMgr(this);
    appCtxt.getShell().addControlListener(new AjxListener(this, this.resize));
};

ZmDocsEditController.prototype = new ZmController();
ZmDocsEditController.prototype.constructor = ZmDocsEditController;
ZmDocsEditController.savedDoc = null;

ZmDocsEditController.prototype.toString = function() {
    return "ZmDocsEditController";
};

ZmDocsEditController.prototype._initDocsEdit = function(){
    if(this._docsEdit) return;
    this._docsEdit = new ZmDocsEditView(this._container, null, DwtControl.ABSOLUTE_STYLE, this, "absolute");
};

ZmDocsEditController.prototype.show = function(data){

    this._initDocsEdit(); 

    var docsEdit = this._docsEdit;

    docsEdit.setZIndex(Dwt.Z_VIEW);

    this.resize();

    this._initModel();
    
};

ZmDocsEditController.prototype.resize = function(ev){

    var docsEdit = this._docsEdit;

    if(!docsEdit) return;

    docsEdit.setDisplay("none");
    var w = document.body.clientWidth;
    var h = document.body.clientHeight;
    if (!AjxEnv.isIE) {
        w += 2;
        h -= 2;
    }
    docsEdit.setDisplay("block");
    docsEdit.setBounds(0, 0, w, h);

};

ZmDocsEditController.prototype.setCurrentView = function(view) {
    this._currentView = view;
};

ZmDocsEditController.prototype.loadData =
function(id) {
    return this._docMgr.getItemInfo({id:id});
};

ZmDocsEditController.prototype.loadDocument = function(item) {
    var content = this._docMgr.fetchDocumentContent(item);
    if(content) {
        if(window.isTinyMCE) {
            this._docsEdit.setPendingContent(content);            
        }else {
            this._docsEdit._editor.setContent(content);
        }
        ZmDocsEditController.savedDoc = content;
    }
};

ZmDocsEditController.prototype._initModel = function(){
    if(ZmDocsEditApp.fileInfo && ZmDocsEditApp.fileInfo.id) {
        var item = ZmDocsEditApp.fileInfo.loaded ? ZmDocsEditApp.fileInfo : this.loadData(ZmDocsEditApp.fileInfo.id);
        if(!item.rest){    //TODO: Change this code to construct a rest url
            item.rest = ZmDocsEditApp.restUrl;
        }
        if(item != null) {
            ZmDocsEditApp.fileInfo = item;
            this._docsEdit._buttons.fileName.setValue(item.name);
            this.loadDocument(item);
            this._docsEdit.setFooterInfo(item);
        }

    }
};

ZmDocsEditController.prototype.sendRequest = function(params) {
    params.noSession = true;
    this._requestMgr.sendRequest(params);
};

ZmDocsEditController.prototype._kickPolling =
function(resetBackoff) {

};

ZmDocsEditController.prototype.setStatusMsg =
function(){
    if(!this.statusView){
        this.statusView = new ZmStatusView(appCtxt.getShell(), "ZmStatus", Dwt.ABSOLUTE_STYLE, ZmId.STATUS_VIEW);
    }
    params = Dwt.getParams(arguments, ZmStatusView.MSG_PARAMS);
    params.transitions = ZmToast.DEFAULT_TRANSITIONS;
	this.statusView.setStatusMsg(params);
};

window.onbeforeunload = function() {
    return ZmDocsEditApp._controller.checkForChanges();
};

ZmDocsEditController.prototype.checkForChanges = function() {
   var curDoc = null;
   var controller = ZmDocsEditApp._controller;
   if(window.isTinyMCE) {
     var ed = tinyMCE.get('tiny_mce_content');
     curDoc = ed.getContent();
   } else {
     curDoc = controller._docsEdit._editor.getContent();  
   }
   /*if(!ZmDocsEditApp.fileInfo.id) {
     return ZmMsg.exitDocNotSaved;
   }*/
   if(curDoc == '<html><body><br></body></html>') {
        return;     
   } else if(curDoc != ZmDocsEditController.savedDoc) {
        return ZmMsg.exitDocUnSavedChanges;
   } 
};

ZmDocsEditController.prototype.exit = function(){
    if(ZmDocsEditApp.fileInfo.locked){
        this._docMgr.unlock(ZmDocsEditApp.fileInfo);
    }
};
