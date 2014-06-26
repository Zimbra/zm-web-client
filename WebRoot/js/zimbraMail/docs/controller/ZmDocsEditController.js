/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2008, 2009, 2010, 2011, 2012, 2013, 2014 Zimbra, Inc.
 * 
 * The contents of this file are subject to the Common Public Attribution License Version 1.0 (the "License");
 * you may not use this file except in compliance with the License. 
 * You may obtain a copy of the License at: http://www.zimbra.com/license
 * The License is based on the Mozilla Public License Version 1.1 but Sections 14 and 15 
 * have been added to cover use of software over a computer network and provide for limited attribution 
 * for the Original Developer. In addition, Exhibit A has been modified to be consistent with Exhibit B. 
 * 
 * Software distributed under the License is distributed on an "AS IS" basis, 
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. 
 * See the License for the specific language governing rights and limitations under the License. 
 * The Original Code is Zimbra Open Source Web Client. 
 * The Initial Developer of the Original Code is Zimbra, Inc. 
 * All portions of the code are Copyright (C) 2008, 2009, 2010, 2011, 2012, 2013, 2014 Zimbra, Inc. All Rights Reserved. 
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

ZmDocsEditController.prototype.isZmDocsEditController = true;
ZmDocsEditController.prototype.toString = function() { return "ZmDocsEditController"; };

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

ZmDocsEditController.prototype.loadData =
function(id) {
    return this._docMgr.getItemInfo({id:id});
};

ZmDocsEditController.prototype.loadDocument = function(item) {
    this._docsEdit.loadDoc(item);
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
            this._docsEdit.enableVersionNotes(item.descEnabled);
        }
    }else if (ZmDocsEditApp.fileInfo){
        this._docsEdit.enableVersionNotes(ZmDocsEditApp.fileInfo.descEnabled);
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

ZmDocsEditController.prototype.checkForChanges = function() {
    if (this._docsEdit.isDirty()) {
        return ZmMsg.exitDocUnSavedChanges;
    }
};

/**
* return boolean  - Check if document has any changes to be saved
* */
ZmDocsEditController.prototype._isDirty = function() {
    return this._docsEdit.isDirty();
}

ZmDocsEditController.prototype.exit = function(){
    if(ZmDocsEditApp.fileInfo.locked){
        this._docMgr.unlock(ZmDocsEditApp.fileInfo);
    }
};
