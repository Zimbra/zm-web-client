/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2010, 2013, 2014, 2016 Synacor, Inc.
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
 * All portions of the code are Copyright (C) 2010, 2013, 2014, 2016 Synacor, Inc. All Rights Reserved.
 * ***** END LICENSE BLOCK *****
 */
ZmCheckinDialog = function(parent, controller, className) {
	if (arguments.length == 0) return;
	DwtDialog.call(this, {parent:parent, className:className, title:ZmMsg.checkInFileToBriefcase});

    this._controller = controller;

    this._createUploadHtml();

    this.getButton(DwtDialog.OK_BUTTON).setText(ZmMsg.checkIn);
    this.setButtonListener(DwtDialog.OK_BUTTON, new AjxListener(this, this._upload));
};

ZmCheckinDialog.prototype = new DwtDialog;
ZmCheckinDialog.prototype.constructor = ZmCheckinDialog;

ZmCheckinDialog.prototype.popup =
function(item, callback){

    this._item = item;
    this._uploadCallback = callback;
    //this._uploadFolder = appCtxt.get(item.folderId);    

    this._verDiv.innerHTML = Number(item.version) + 1;
    this._fileTD.innerHTML = "";
    this._fileTD.innerHTML = [
        '<input type="file" name="file" id="',this._templateId,'_file" size="35"/>'
    ].join('');
    this._notes.value = "";

    DwtDialog.prototype.popup.call(this);
};

ZmCheckinDialog.prototype._createUploadHtml =
function(){
    this._templateId = Dwt.getNextId();
    var uri = appCtxt.get(ZmSetting.CSFE_UPLOAD_URI);
    this.setContent(AjxTemplate.expand("briefcase.Briefcase#CheckinDialog", {id: this._templateId, uri:uri}));
    this._verDiv = document.getElementById(this._templateId+"_version");
    this._fileTD = document.getElementById(this._templateId+"_fileTD");
    this._notes = document.getElementById(this._templateId+"_notes");
};

ZmCheckinDialog.prototype._upload = function(){
    var fileInput = document.getElementById(this._templateId+"_file");
    if(!fileInput.value) return;
    var item = this._item;
    var file = {
        fullname: fileInput.value,
        name: fileInput.value.replace(/^.*[\\\/:]/, ""),
        id: item.id,
        version: item.version,
        folder: item.folderId,
        notes: this._notes.value
    };

    var callback = new AjxCallback(this, this._uploadSaveDocs, file);

    this._initiateUpload(this._templateId+"_form", callback)

};

ZmCheckinDialog.prototype._initiateUpload =
function(formId, callback){

    this.setButtonEnabled(DwtDialog.OK_BUTTON, false);
	this.setButtonEnabled(DwtDialog.CANCEL_BUTTON, false);

	var uploadForm = document.getElementById(formId);

	var uploadMgr = appCtxt.getUploadManager();
	window._uploadManager = uploadMgr;
	try {
		uploadMgr.execute(callback, uploadForm);
	} catch (ex) {
		if (ex.msg) {
			this._popupErrorDialog(ex.msg);
		} else {
			this._popupErrorDialog(ZmMsg.unknownError);
		}
	}
};

ZmCheckinDialog.prototype._uploadSaveDocs = function(file, status, guid) {
	if (status != AjxPost.SC_OK) {
		appCtxt.getAppController().popupUploadErrorDialog(ZmItem.BRIEFCASE,
		                                                  status);
		this.setButtonEnabled(DwtDialog.OK_BUTTON, true );
		this.setButtonEnabled(DwtDialog.CANCEL_BUTTON, true);
	} else {

        file.guid = guid;
		this._uploadSaveDocs2(file, status, guid);

	}
};

ZmCheckinDialog.prototype._uploadSaveDocs2 =
function(file, status, guid) {

    var json = {
		SaveDocumentRequest: {
			_jsns: "urn:zimbraMail",
			doc: {
				id:	    file.id,
                ver:    file.version,
                l:      file.folderId,
                name:   file.name,
                desc:   file.notes,
                upload: {
                    id: file.guid
                }
			}
		}
	};

    var callback = new AjxCallback(this, this._uploadSaveDocsResponse, [ file, status, guid ]);
    var params = {
        jsonObj:    json,
        asyncMode:  true,
        callback:   callback,
        errorCallback: new AjxCallback(this, this._handleSaveDocError, [file, status, guid])
    };
    appCtxt.getAppController().sendRequest(params);    
};

ZmCheckinDialog.prototype._handleSaveDocError =
function(file, status, guid, ex){

    this.setButtonEnabled(DwtDialog.OK_BUTTON, true );
    this.setButtonEnabled(DwtDialog.CANCEL_BUTTON, true);

    if(ex.code == ZmCsfeException.MAIL_ALREADY_EXISTS){
        //Warning Message
        var warning = appCtxt.getMsgDialog();
        warning.reset();
        warning.setMessage(AjxMessageFormat.format(ZmMsg.itemWithFileNameExits, file.name), DwtMessageDialog.CRITICAL_STYLE, ZmMsg.briefcase);
        warning.popup();
        //Error Handled
        return true;
    }

    return false;
};        

ZmCheckinDialog.prototype._uploadSaveDocsResponse =
function(file, status, guid, response) {

    var resp = response && response._data;
    var saveDocResp = resp && resp.SaveDocumentResponse;

    if(saveDocResp){
        saveDocResp = saveDocResp.doc[0];
        file.done     = true;
        file.name     = saveDocResp.name;
        file.version  = saveDocResp.ver;

        this._finishUpload(file);
    }

    this.popdown();

    if (resp && resp.Fault) {
        var fault = resp.Fault;
        var error = fault.Detail.Error;
        var code = error.Code;
        //Handle Mailbox Exceeded Exception
        if(code == ZmCsfeException.MAIL_QUOTA_EXCEEDED){
            this._popupErrorDialog(ZmMsg.errorQuotaExceeded);
        }
    }

};

ZmCheckinDialog.prototype._finishUpload = function(file) {
	if(this._uploadCallback)
	    this._uploadCallback.run([file]);
};

ZmCheckinDialog.prototype._popupErrorDialog = function(message) {
	this.setButtonEnabled(DwtDialog.OK_BUTTON, true);
	this.setButtonEnabled(DwtDialog.CANCEL_BUTTON, true);

	var dialog = appCtxt.getMsgDialog();
	dialog.setMessage(message, DwtMessageDialog.CRITICAL_STYLE, this._title);
	dialog.popup();
};
