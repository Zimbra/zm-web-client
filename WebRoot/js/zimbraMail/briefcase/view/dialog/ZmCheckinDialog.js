/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2010, 2013, 2014 Zimbra, Inc.
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
 * All portions of the code are Copyright (C) 2010, 2013, 2014 Zimbra, Inc. All Rights Reserved. 
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

	var file = fileInput.files[0];
    file.fullname    = fileInput.value;
	file.name        = file.fullname.replace(/^.*[\\\/:]/, "");
	file.id          = item.id;
	file.version     = item.version;
	file.preventDuplicate = true;

	this.setButtonEnabled(DwtDialog.OK_BUTTON, false);
	this.setButtonEnabled(DwtDialog.CANCEL_BUTTON, false);
	var popDownCallback = this.popdown.bind(this);

	var cFolder = appCtxt.getById(item.folderId);
	var briefcaseApp = appCtxt.getApp(ZmApp.BRIEFCASE);
	var uploadParams = {
		uploadFolder: cFolder,
		files: [file],
		notes: this._notes.value,
		start: 0,
		conflictAction:             ZmBriefcaseApp.ACTION_KEEP_THEIRS,
		completeAllCallback:        briefcaseApp.uploadSaveDocs.bind(briefcaseApp),
		completeDocSaveCallback:    briefcaseApp._finishUpload.bind(briefcaseApp, this._finishUpload.bind(this)),
		errorCallback:              this._handleError.bind(this)
	};
	var uploadManager = appCtxt.getZmUploadManager();
	uploadManager.upload(uploadParams);
};

ZmCheckinDialog.prototype._finishUpload = function(docFiles){
	this.popdown();
	if (this._uploadCallback) {
		this._uploadCallback(docFiles);
	}
}

ZmCheckinDialog.prototype._handleError = function() {
	this.setButtonEnabled(DwtDialog.OK_BUTTON, true);
	this.setButtonEnabled(DwtDialog.CANCEL_BUTTON, true);
};