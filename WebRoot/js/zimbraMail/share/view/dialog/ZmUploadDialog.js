/*
 * ***** BEGIN LICENSE BLOCK *****
 * Version: ZPL 1.1
 * 
 * The contents of this file are subject to the Zimbra Public License
 * Version 1.1 ("License"); you may not use this file except in
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

ZmUploadDialog.prototype._uploadFolderId;
ZmUploadDialog.prototype._uploadCallback;

// Public methods

ZmUploadDialog.prototype.setFolderId = function(folderId) {
	this._uploadFolderId = folderId;
};
ZmUploadDialog.prototype.setCallback = function(callback) {
	this._uploadCallback = callback;
};

ZmUploadDialog.prototype.popup = function(loc) {
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
	this._uploadFolderId = null;
	this._uploadCallback = null;
	ZmDialog.prototype.popdown.call(this);
};

// Protected methods

ZmUploadDialog.prototype._upload = function(){ 
	var form = document.getElementById(this._formId);
	var filenames = [];
	for (var i in form.elements) {
		var element = form.elements[i];
		if (element.name != ZmUploadDialog.UPLOAD_FIELD_NAME) continue;
		filenames.push(element.value);
	}
	if (filenames.length == 0) {
		return;
	}

	this.setButtonEnabled(DwtDialog.OK_BUTTON, false);
	this.setButtonEnabled(DwtDialog.CANCEL_BUTTON, false);
	
	var callback = new AjxCallback(this, this._uploadSaveDocs, [filenames]);
	var uploadForm = document.getElementById(this._formId);

	var uploadMgr = this._appCtxt.getUploadManager();
	window._uploadManager = uploadMgr;
	uploadMgr.execute(callback, uploadForm);
};
ZmUploadDialog.prototype._uploadSaveDocs = function(filenames, status, guids) {
	var tree = this._appCtxt.getTree(ZmOrganizer.NOTEBOOK);
	var notebook = tree.getById(this._uploadFolderId);

	// REVISIT: For now, we overwrite existing docs w/o warning !!!
	var soapDoc = AjxSoapDoc.create("SearchRequest", "urn:zimbraMail");
	soapDoc.setMethodAttribute("types", "document");
	soapDoc.set("query", "in:\""+notebook.getSearchPath()+"\"");

	var args = [notebook.getPath(), filenames, status, guids];
	var handleResponse = new AjxCallback(this, this._uploadSaveDocs2, args);	
	var params = {
		soapDoc: soapDoc,
		asyncMode: true,
		callback: handleResponse
	};
	var appController = this._appCtxt.getAppController();
	appController.sendRequest(params);
};

ZmUploadDialog.prototype._uploadSaveDocs2 = 
function(path, filenames, status, guids, response) {
	// handle response
	var docs = {};
	if (response._data && response._data.SearchResponse) {
		var searchResp = response._data.SearchResponse;
		if (searchResp.doc) {
			for (var i = 0; i < searchResp.doc.length; i++) {
				var doc = searchResp.doc[i];
				docs[doc.name] = doc;
			}
		}
	}
	
	// create document wrappers
	guids = guids.split(",");
	var soapDoc = AjxSoapDoc.create("BatchRequest", "urn:zimbra", null);
	for (var i = 0; i < filenames.length; i++) {
		var filename = filenames[i] = filenames[i].replace(/^.*[\\\/:]/, "");
		var guid = guids[i];
		
		var saveDocNode = soapDoc.set("SaveDocumentRequest");
		saveDocNode.setAttribute("xmlns", "urn:zimbraMail");
		
		var docNode = soapDoc.set("doc", null, saveDocNode);
		var doc = docs[filename];
		if (doc) {
			docNode.setAttribute("id", doc.id);
			docNode.setAttribute("ver", doc.ver);
			// REVISIT: The name is also required because of a bug
			//          in the backend.
			docNode.setAttribute("name", doc.name);
		}
		else {
			docNode.setAttribute("l", this._uploadFolderId);
		}
		
		var uploadNode = soapDoc.set("upload", null, docNode);
		uploadNode.setAttribute("id", guid);
	}
	
	var params = {
		soapDoc: soapDoc,
		asyncMode: true,
		callback: new AjxCallback(this, this._uploadSaveDocsResponse, [path, filenames]),
		errorCallback: null,
		execFrame: null
	};	
	var appController = this._appCtxt.getAppController();
	appController.sendRequest(params);
};

ZmUploadDialog.prototype._uploadSaveDocsResponse = function(path, filenames, response) {
	if (this._uploadCallback) {
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
		this._uploadCallback.run(path, filenames);
		/***/
	}
	
	this.popdown();
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