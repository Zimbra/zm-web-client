/*
 * ***** BEGIN LICENSE BLOCK *****
 * 
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2006, 2007 Zimbra, Inc.
 * 
 * The contents of this file are subject to the Yahoo! Public License
 * Version 1.0 ("License"); you may not use this file except in
 * compliance with the License.  You may obtain a copy of the License at
 * http://www.zimbra.com/license.
 * 
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * 
 * ***** END LICENSE BLOCK *****
 */

ZmUploadDialog = function(shell, className) {
	className = className || "ZmUploadDialog";
	var title = ZmMsg.uploadDocs;
	DwtDialog.call(this, {parent:shell, className:className, title:title});
	this.setButtonListener(DwtDialog.OK_BUTTON, new AjxListener(this, this._upload));
	this._createUploadHtml();
}

ZmUploadDialog.prototype = new DwtDialog;
ZmUploadDialog.prototype.constructor = ZmUploadDialog;

// Constants

ZmUploadDialog.ACTION_KEEP_MINE = "mine";
ZmUploadDialog.ACTION_KEEP_THEIRS = "theirs";
ZmUploadDialog.ACTION_ASK = "ask";

ZmUploadDialog.UPLOAD_FIELD_NAME = "uploadFile";

// Data

ZmUploadDialog.prototype._formId;
ZmUploadDialog.prototype._tableId;

ZmUploadDialog.prototype._selector;

ZmUploadDialog.prototype._uploadFolder;
ZmUploadDialog.prototype._uploadCallback;

// Public methods

ZmUploadDialog.prototype.popup = function(folder, callback, title, loc) {
	this._uploadFolder = folder;
	this._uploadCallback = callback;

	this.setTitle(title || ZmMsg.uploadDocs);

	// reset input fields
	var table = document.getElementById(this._tableId);
	var rows = table.rows;
	while (rows.length) {
		table.deleteRow(rows.length - 1);
	}
	this._addFileInputRow();
	
	// enable buttons
	this.setButtonEnabled(DwtDialog.OK_BUTTON, true);
	this.setButtonEnabled(DwtDialog.CANCEL_BUTTON, true);
	
	// show
	DwtDialog.prototype.popup.call(this, loc);
};

ZmUploadDialog.prototype.popdown = function() {
	/***
	// NOTE: Do NOT set these values to null! The conflict dialog will
	//       call back to this dialog after it's hidden to process the
	//       files that should be replaced.
	this._uploadFolder = null;
	this._uploadCallback = null;
	/***/
	ZmDialog.prototype.popdown.call(this);
};

//to give explicitly the uploadForm, files to upload and folderId used for breifcase
ZmUploadDialog.prototype.uploadFiles = function(files,uploadForm,folder) {

    if (files.length == 0) {
		return;
	}
    this._uploadFolder = folder;
    var callback = new AjxCallback(this, this._uploadSaveDocs, [files]);

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

// Protected methods
ZmUploadDialog.prototype._upload = function(){ 
	var form = document.getElementById(this._formId);
	var files = [];
	
	var elements = form.elements;
	for (var i = 0; i < elements.length; i++) {
		var element = form.elements[i];
		if (element.name != ZmUploadDialog.UPLOAD_FIELD_NAME) continue;
		if (!element.value) continue;
		var file = {
			fullname: element.value,
			name: element.value.replace(/^.*[\\\/:]/, "")
		};
		files.push(file);
	}
	if (files.length == 0) {
		return;
	}

	this.setButtonEnabled(DwtDialog.OK_BUTTON, false);
	this.setButtonEnabled(DwtDialog.CANCEL_BUTTON, false);

	var callback = new AjxCallback(this, this._uploadSaveDocs, [files]);
	var uploadForm = document.getElementById(this._formId);

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

ZmUploadDialog.prototype._popupErrorDialog = function(message) {
	this.setButtonEnabled(DwtDialog.OK_BUTTON, true);
	this.setButtonEnabled(DwtDialog.CANCEL_BUTTON, true);

	var dialog = appCtxt.getMsgDialog();
	dialog.setMessage(message, DwtMessageDialog.CRITICAL_STYLE, this._title);
	dialog.popup();
};

ZmUploadDialog.prototype._uploadSaveDocs = function(files, status, guids) {
	if (status != AjxPost.SC_OK) {
		var message = AjxMessageFormat.format(ZmMsg.uploadError, status);
		this._popupErrorDialog(message);
	} else {
		guids = guids.split(",");
		for (var i = 0; i < files.length; i++) {
			DBG.println("guids["+i+"]: "+guids[i]+", files["+i+"]: "+files[i]);
			files[i].guid = guids[i];
		}
		this._uploadSaveDocs2(files, status, guids);
	}
};

ZmUploadDialog.prototype._uploadSaveDocs2 = 
function(files, status, guids) {
	// create document wrappers
	var soapDoc = AjxSoapDoc.create("BatchRequest", "urn:zimbra", null);
	soapDoc.setMethodAttribute("onerror", "continue");
	for (var i = 0; i < files.length; i++) {
		var file = files[i];
		if (file.done) continue;

		var saveDocNode = soapDoc.set("SaveDocumentRequest", null, null, "urn:zimbraMail");
		saveDocNode.setAttribute("requestId", i);
		
		var docNode = soapDoc.set("doc", null, saveDocNode);
		if (file.id) {
			docNode.setAttribute("id", file.id);
			docNode.setAttribute("ver", file.version);
		}
		else {
			docNode.setAttribute("l", this._uploadFolder.id);
		}
		
		var uploadNode = soapDoc.set("upload", null, docNode);
		uploadNode.setAttribute("id", file.guid);
	}

	var args = [ files, status, guids ];
	var callback = new AjxCallback(this, this._uploadSaveDocsResponse, args);
	var params = {
		soapDoc:soapDoc,
		asyncMode:true,
		callback:callback
	};	
	var appController = appCtxt.getAppController();
	appController.sendRequest(params);
};

ZmUploadDialog.prototype._uploadSaveDocsResponse =
function(files, status, guids, response) {
	var resp = response && response._data && response._data.BatchResponse;

	// mark successful uploads
	if (resp && resp.SaveDocumentResponse) {
		for (var i = 0; i < resp.SaveDocumentResponse.length; i++) {
			var saveDocResp = resp.SaveDocumentResponse[i];
			files[saveDocResp.requestId].done = true;
			files[saveDocResp.requestId].rest = saveDocResp.doc[0].rest;
		}
	}

	// check for conflicts
	var conflicts = [];
	if (resp && resp.Fault) {
		var errors = [];
		for (var i = 0; i < resp.Fault.length; i++) {
			var fault = resp.Fault[i];
			var error = fault.Detail.Error;
			var code = error.Code;
			var attrs = error.a;
			if (code == ZmCsfeException.MAIL_ALREADY_EXISTS ||
				code == ZmCsfeException.MODIFY_CONFLICT) {
				var file = files[fault.requestId];
				for (var p in attrs) {
					var attr = attrs[p];
					switch (attr.n) {
						case "id": { file.id = attr._content; break; }
						case "ver": { file.version = attr._content; break; }
						case "rest": { file.rest = attr._content; break; }
					}
				}
				conflicts.push(file);
			}
			else {
				DBG.println("Unknown error occurred: "+code);
				errors[fault.requestId] = fault;
			}
		}
		// TODO: What to do about other errors?
	}

	// dismiss dialog
	this.popdown();

	// resolve conflicts
	var conflictCount = conflicts.length;
	var action = this._selector.getValue();
	if (conflictCount > 0 && action == ZmUploadDialog.ACTION_ASK) {
		var dialog = appCtxt.getUploadConflictDialog();
		if (!this._conflictCallback) {
			this._conflictCallback = new AjxCallback(this, this._uploadSaveDocs2);
		}
		this._conflictCallback.args = [ files, status, guids ];
		dialog.popup(this._uploadFolder, conflicts, this._conflictCallback);
	}

	// keep mine
	else if (conflictCount > 0 && action == ZmUploadDialog.ACTION_KEEP_MINE) {
		this._uploadSaveDocs2(files, status, guids);
	}

	// perform callback
	else if (this._uploadCallback) {
		var filenames = [];
		for (var i = 0; i < files.length; i++) {
			filenames.push(files[i].rest);
		}
		this._uploadCallback.run(this._uploadFolder, filenames);
	}
};

ZmUploadDialog.prototype._addFileInputRow = function() {
	var id = Dwt.getNextId();
	var inputId = id + "_input";
	var removeId = id + "_remove";
	var addId = id + "_add";

	var table = document.getElementById(this._tableId);
	var row = table.insertRow(-1);	

	var cell = row.insertCell(-1);
	cell.innerHTML = [
		"<input id='",inputId,"' type='file' name='",ZmUploadDialog.UPLOAD_FIELD_NAME,"' size=30>"
	].join("");

	var cell = row.insertCell(-1);
	cell.innerHTML = "&nbsp;";
	var cell = row.insertCell(-1);
	cell.innerHTML = [
		"<span ",
			"id='",removeId,"' ",
			"onmouseover='this.style.cursor=\"pointer\"' ",
			"onmouseout='this.style.cursor=\"default\"' ",
			"style='color:blue;text-decoration:underline;'",
		">", ZmMsg.remove, "</span>"
	].join("");	
	var removeSpan = document.getElementById(removeId);
	Dwt.setHandler(removeSpan, DwtEvent.ONCLICK, ZmUploadDialog._removeHandler);
	
	var cell = row.insertCell(-1);
	cell.innerHTML = "&nbsp;";
	var cell = row.insertCell(-1);
	cell.innerHTML = [
		"<span ",
			"id='",addId,"' ",
			"onmouseover='this.style.cursor=\"pointer\"' ",
			"onmouseout='this.style.cursor=\"default\"' ",
			"style='color:blue;text-decoration:underline;'",
		">", ZmMsg.add, "</span>"
	].join("");	
	var addSpan = document.getElementById(addId);
	Dwt.setHandler(addSpan, DwtEvent.ONCLICK, ZmUploadDialog._addHandler);
};

ZmUploadDialog._removeHandler = function(event) {
	var span = DwtUiEvent.getTarget(event || window.event);
	var cell = span.parentNode;
	var row = cell.parentNode;
	if (row.prevSibling == null && row.nextSibling == null) {
		var compElem = DwtControl.findControl(span);
		var comp = Dwt.getObjectFromElement(compElem);
		comp._addFileInputRow();
	}
	row.parentNode.removeChild(row);
};

ZmUploadDialog._addHandler = function(event) {
	var span = DwtUiEvent.getTarget(event || window.event);
	var compElem = DwtControl.findControl(span);
	var comp = Dwt.getObjectFromElement(compElem);
	comp._addFileInputRow();
};

ZmUploadDialog.prototype._createUploadHtml = function() {
	this._formId = Dwt.getNextId();
	this._tableId = Dwt.getNextId();

	this._selector = new DwtSelect({parent:this});
	this._selector.addOption(ZmMsg.uploadActionKeepMine, false, ZmUploadDialog.ACTION_KEEP_MINE);
	this._selector.addOption(ZmMsg.uploadActionKeepTheirs, false, ZmUploadDialog.ACTION_KEEP_THEIRS);
	this._selector.addOption(ZmMsg.uploadActionAsk, true, ZmUploadDialog.ACTION_ASK);

	var label = document.createElement("DIV");
	label.style.marginBottom = "0.5em";
	label.innerHTML = ZmMsg.uploadChoose;

	var container = document.createElement("DIV");
	/***
	container.style.position = "relative";
	container.style.height = "7em";
	container.style.overflow = "auto";
	/***/
	container.style.marginLeft = "1em";
	container.style.marginBottom = "0.5em";
	
	var uri = appCtxt.get(ZmSetting.CSFE_UPLOAD_URI);
	container.innerHTML = [
		"<form id='",this._formId,"' method='POST' action='",uri,"' enctype='multipart/form-data'>",
			"<table id='",this._tableId,"' cellspacing=4 cellpadding=0 border=0>",
			"</table>",
		"</form>"
	].join("");

	var table = document.createElement("TABLE");
	table.border = 0;
	table.cellPadding = 0;
	table.cellSpacing = 4;

	var row = table.insertRow(-1);
	var cell = row.insertCell(-1);
	cell.innerHTML = ZmMsg.uploadAction;

	var cell = row.insertCell(-1);
	cell.appendChild(this._selector.getHtmlElement());

	var element = this._getContentDiv();
	element.appendChild(label);
	element.appendChild(container);
	element.appendChild(table);
};
