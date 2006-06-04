/*
 * ***** BEGIN LICENSE BLOCK *****
 * Version: ZPL 1.2
 *
 * The contents of this file are subject to the Zimbra Public License
 * Version 1.2 ("License"); you may not use this file except in
 * compliance with the License. You may obtain a copy of the License at
 * http://www.zimbra.com/license
 * 
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied. See
 * the License for the specific language governing rights and limitations
 * under the License.
 * 
 * The Original Code is: Zimbra Collaboration Suite Web Client
 * 
 * The Initial Developer of the Original Code is Zimbra, Inc.
 * Portions created by Zimbra are Copyright (C) 2006 Zimbra, Inc.
 * All Rights Reserved.
 * 
 * Contributor(s):
 * 
 * ***** END LICENSE BLOCK *****
 */

function ZmUploadDialog(appCtxt, shell, className) {
	className = className || "ZmUploadDialog";
	var title = ZmMsg.uploadDocs;
	DwtDialog.call(this, shell, className, title);
	this.setButtonListener(DwtDialog.OK_BUTTON, new AjxListener(this, this._upload));
	this._appCtxt = appCtxt;
	this._createUploadHtml();
}
ZmUploadDialog.prototype = new DwtDialog;
ZmUploadDialog.prototype.constructor = ZmUploadDialog;

// Constants

ZmUploadDialog.UPLOAD_FIELD_NAME = "uploadFile";

// Data

ZmUploadDialog.prototype._formId;
ZmUploadDialog.prototype._tableId;

ZmUploadDialog.prototype._uploadFolder;
ZmUploadDialog.prototype._uploadCallback;

// Public methods

ZmUploadDialog.prototype.popup = function(folder, callback, title, loc) {
	this._uploadFolder = folder;
	this._uploadCallback = callback;

	this.setTitle(title || ZmMsg.uploadDocs);

	// reset input fields
	var table = document.getElementById(this._tableId);
	table.innerHTML = "";
	this._addFileInputRow();
	
	// enable buttons
	this.setButtonEnabled(DwtDialog.OK_BUTTON, true);
	this.setButtonEnabled(DwtDialog.CANCEL_BUTTON, true);
	
	// show
	DwtDialog.prototype.popup.call(this, loc);
};

ZmUploadDialog.prototype.popdown = function() {
	/***
	// NOTE: Do NOT set these values to null! The upload conflict will
	//       call back to this dialog after it's hidden to process the
	//       files that should be replaced.
	this._uploadFolder = null;
	this._uploadCallback = null;
	/***/
	ZmDialog.prototype.popdown.call(this);
};

// Protected methods

ZmUploadDialog.prototype._upload = function(){ 
	var form = document.getElementById(this._formId);
	var files = [];
	for (var i in form.elements) {
		var element = form.elements[i];
		if (element.name != ZmUploadDialog.UPLOAD_FIELD_NAME) continue;
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

	var uploadMgr = this._appCtxt.getUploadManager();
	window._uploadManager = uploadMgr;
	uploadMgr.execute(callback, uploadForm);
};

/***
ZmUploadDialog.prototype._uploadSaveDocs = function(filenames, status, guids) {
	// REVISIT: For now, we overwrite existing docs w/o warning !!!
	var soapDoc = AjxSoapDoc.create("SearchRequest", "urn:zimbraMail");
	soapDoc.setMethodAttribute("types", "document");
	soapDoc.set("query", "in:\""+this._uploadFolder.getSearchPath()+"\"");

	var args = [this._uploadFolder.getPath(), filenames, status, guids];
	var handleResponse = new AjxCallback(this, this._uploadSaveDocs2, args);	
	var params = {
		soapDoc: soapDoc,
		asyncMode: true,
		callback: handleResponse
	};
	var appController = this._appCtxt.getAppController();
	appController.sendRequest(params);
};
/***/
ZmUploadDialog.prototype._uploadSaveDocs = function(files, status, guids) {
	guids = guids.split(",");
	for (var i = 0; i < files.length; i++) {
		files[i].guid = guids[i];
	}
	this._uploadSaveDocs2(files, status, guids);
};
/***/

ZmUploadDialog.prototype._uploadSaveDocs2 = 
function(files, status, guids) {
	// create document wrappers
	var soapDoc = AjxSoapDoc.create("BatchRequest", "urn:zimbra", null);
	soapDoc.setMethodAttribute("onerror", "continue");
	for (var i = 0; i < files.length; i++) {
		var file = files[i];
		if (file.done) continue;

		var saveDocNode = soapDoc.set("SaveDocumentRequest");
		saveDocNode.setAttribute("xmlns", "urn:zimbraMail");
		saveDocNode.setAttribute("id", i);
		
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
		soapDoc: soapDoc,
		asyncMode: true,
		callback: callback,
		errorCallback: null,
		execFrame: null
	};	
	var appController = this._appCtxt.getAppController();
	appController.sendRequest(params);
};

ZmUploadDialog.prototype._uploadSaveDocsResponse =
function(files, status, guids, response) {
	var resp = response && response._data && response._data.BatchResponse;

	// mark successful uploads
	if (resp && resp.SaveDocumentResponse) {
		for (var i = 0; i < resp.SaveDocumentResponse.length; i++) {
			var saveDocResp = resp.SaveDocumentResponse[i];
			files[saveDocResp.id].done = true;
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
				var file = files[fault.id];
				for (var p in attrs) {
					var attr = attrs[p];
					switch (attr.n) {
						case "id": { file.id = attr._content; break; }
						case "ver": { file.version = attr._content; break; }
					}
				}
				conflicts.push(file);
			}
			else {
				DBG.println("Unknown error occurred: "+code);
				errors[fault.id] = fault;
			}
		}
		// TODO: What to do about other errors?
	}

	// dismiss dialog
	this.popdown();

	// resolve conflicts
	if (conflicts.length > 0) {
		var dialog = this._appCtxt.getUploadConflictDialog();
		if (!this._conflictCallback) {
			this._conflictCallback = new AjxCallback(this, this._uploadConflict);
		}
		this._conflictCallback.args = [ files, status, guids ];
		dialog.popup(this._uploadFolder, conflicts, this._conflictCallback);
	}

	// perform callback
	else if (this._uploadCallback) {
		/***
		var items = []
		if (response._data && response._data.BatchResponse) {
			var docs = response._data.BatchResponse.SaveDocumentResponse;
			if (docs) {
				for (var i = 0; i < docs.length; i++) {
					var doc = docs[i].doc[0];
					items.push(doc);
				}
			}
		}
		this._uploadCallback.run(path, items);
		/***/
		var filenames = [];
		for (var i = 0; i < files.length; i++) {
			filenames.push(files[i].name);
		}
		this._uploadCallback.run(this._uploadFolder, filenames);
		/***/
	}
};

ZmUploadDialog.prototype._uploadConflict =
function(files, status, guids) {
	this._uploadSaveDocs2(files, status, guids);
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
		var compElem = Dwt.findAncestor(span, "dwtObj");
		var comp = Dwt.getObjectFromElement(compElem);
		comp._addFileInputRow();
	}
	row.parentNode.removeChild(row);
};

ZmUploadDialog._addHandler = function(event) {
	var span = DwtUiEvent.getTarget(event || window.event);
	var compElem = Dwt.findAncestor(span, "dwtObj");
	var comp = Dwt.getObjectFromElement(compElem);
	comp._addFileInputRow();
};

ZmUploadDialog.prototype._createUploadHtml = function() {
	this._formId = Dwt.getNextId();
	this._tableId = Dwt.getNextId();

	var container = document.createElement("DIV");
	container.style.position = "relative";
	container.style.height = "7em";
	container.style.overflow = "auto";
	
	var uri = location.protocol + "//" + document.domain + this._appCtxt.get(ZmSetting.CSFE_UPLOAD_URI);
	container.innerHTML = [
		"<form id='",this._formId,"' method='POST' action='",uri,"' enctype='multipart/form-data'>",
			"<table id='",this._tableId," cellspacing=2 cellpadding=0 border=0>",
			"</table>",
		"</form>"
	].join("");

	var element = this._getContentDiv();
	element.appendChild(container);
};

ZmUploadDialog.prototype._getSeparatorTemplate = function() {
	return "";
};