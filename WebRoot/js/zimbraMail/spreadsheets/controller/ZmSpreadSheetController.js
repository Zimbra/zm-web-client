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

ZmSpreadSheetController = function(shell){

    if(arguments.length == 0) return;
    ZmController.call(this, shell);

    this._spreadSheet = null;
    this._toolbar = null;

    this._docMgr = new ZmDocletMgr();

    appCtxt.getShell().addControlListener(new AjxListener(this, this.resize));

};

ZmSpreadSheetController.prototype = new ZmController();
ZmSpreadSheetController.prototype.constructor = ZmSpreadSheetController;


ZmSpreadSheetController.prototype.save = function(){

    var fileInfo = ZmSpreadSheetApp.fileInfo;
    var fileName = this._toolbar.get("fileName").getValue();
    
    if(!fileInfo.id){
       if(fileName == ""){
           appCtxt.setStatusMsg(ZmMsg.emptyDocName);
           return;
       }
    }
    //if(this._spreadSheet._model != null) {
        ZmSpreadSheetApp.fileInfo.name    = fileName;
        ZmSpreadSheetApp.fileInfo.content = this._spreadSheet.getXml();
        ZmSpreadSheetApp.fileInfo.contentType = ZmSpreadSheetApp.APP_ZIMBRA_XLS;

        this._docMgr.setSaveCallback(new AjxCallback(this, this._postSaveHandler));
        this._docMgr.saveDocument(ZmSpreadSheetApp.fileInfo);
    //}
};

ZmSpreadSheetController.prototype._postSaveHandler =
function(files) {
    if(files && files.length > 0) {
        ZmSpreadSheetApp.fileInfo.id = files[0].id;
        ZmSpreadSheetApp.fileInfo.version = files[0].ver;
    }
};

ZmSpreadSheetController.prototype._initToolbar = function(){
    if(!this._toolbar){
        this._toolbar = new ZmSpreadSheetToolbars(this._spreadSheet, this._spreadSheet, this);
    }
    this._toolbar._buttons.fileName.setValue(ZmSpreadSheetApp.fileInfo.name);
};

ZmSpreadSheetController.prototype._initSpreadSheet = function(){
    if(this._spreadSheet) return;

    this._spreadSheet = new ZmSpreadSheet(this._container, this, null, "absolute");

};

ZmSpreadSheetController.prototype.loadData =
function(id) {
    return this._docMgr.getItemInfo({id:id});
};

ZmSpreadSheetController.prototype.loadSheet =
function(item) {
    var content = this._docMgr.fetchDocumentContent(item);
    if(content) {
        var model = new ZmSpreadSheetModel(0, 0);
        model.loadFromXml(content);
        this._spreadSheet.setModel(model);
    }
};


ZmSpreadSheetController.prototype._initModel = function(){

    if(ZmSpreadSheetApp.fileInfo && ZmSpreadSheetApp.fileInfo.id) {
        var item = this.loadData(ZmSpreadSheetApp.fileInfo.id);
        if(item != null) {
            ZmSpreadSheetApp.fileInfo = item;
            this.loadSheet(item);
        }
    }else{
        //approx rows & cols such that it fills all whole browser area
        var w = document.body.clientWidth;
	    var h = document.body.clientHeight;
        var cols = Math.ceil( w / ZmSpreadSheetModel.getDefaultColProp().width) + 2;
        var rows = Math.ceil( h / ZmSpreadSheetModel.getDefaultRowProp().height) - 5;

		this._spreadSheet.setModel(new ZmSpreadSheetModel(rows || 40, cols || 15));
    }

};

ZmSpreadSheetController.prototype.show = function(data){

    this._initSpreadSheet();

    this._initModel();
    
    var spreadSheet = this._spreadSheet;

    this._initToolbar();

    spreadSheet._selectedCell = null;

    spreadSheet.setZIndex(Dwt.Z_VIEW);

    this.resize();

    spreadSheet.focus();
};

ZmSpreadSheetController.prototype.resize = function(ev){

    var spreadSheet = this._spreadSheet;

    if(!spreadSheet) return;

    spreadSheet.setDisplay("none");
	var w = document.body.clientWidth;
	var h = document.body.clientHeight;
	if (!AjxEnv.isIE) {
		w -= 2;
		h -= 2;
	}
	spreadSheet.setDisplay("block");
	spreadSheet.setBounds(0, 0, w, h);
};

ZmSpreadSheetController.prototype.toString =
function() {
	return "ZmSpreadSheetController";
};