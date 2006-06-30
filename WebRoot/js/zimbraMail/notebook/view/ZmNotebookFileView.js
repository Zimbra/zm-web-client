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

function ZmNotebookFileView(parent, appCtxt, controller) {
	DwtComposite.call(this, parent, "ZmNotebookFileView", DwtControl.ABSOLUTE_STYLE);
	
	this._appCtxt = appCtxt;
	this._controller = controller;

	this._createHtml();	
}
ZmNotebookFileView.prototype = new DwtComposite;
ZmNotebookFileView.prototype.constructor = ZmNotebookFileView;

ZmNotebookFileView.prototype.toString = function() {
	return "ZmNotebookFileView";
};

//
// Data
//

ZmNotebookFileView.prototype._appCtxt;
ZmNotebookFileView.prototype._controller;

ZmNotebookFileView.prototype._fileListView;

//
// Public methods
//

ZmNotebookFileView.prototype.getController =
function() {
	return this._controller;
};

/***
ZmNotebookFileView.prototype.set =
function(page) {
	var folderId = page ? page.folderId : ZmPage.DEFAULT_FOLDER;
	
	var soapDoc = AjxSoapDoc.create("SearchRequest", "urn:zimbraMail");
	soapDoc.setMethodAttribute("types", "wiki,document");
	var queryNode = soapDoc.set("query", "is:anywhere"); // REVISIT
	
	var params = {
		soapDoc: soapDoc,
		asyncMode: false,
		callback: null,
		errorCallback: null,
		execFrame: null
	};
	var appController = this._appCtxt.getAppController();
	var response = appController.sendRequest(params);
	
	var list = new AjxVector();
	if (response.SearchResponse) {
		var words = response.SearchResponse.w || [];
		ZmNotebookFileView.__typify(words, "wiki");
		var docs = response.SearchResponse.doc || [];
		ZmNotebookFileView.__typify(docs, "document");
		var items = words.concat(docs).sort(ZmWiklet.__byItemName);
		for (var i = 0; i < items.length; i++) {
			list.add(items[i]);
		}
	}
	this._fileListView.set(list);
};
/***/
ZmNotebookFileView.prototype.set = function(list) {
	this._fileListView.set(list);
};
/***/

// methods delegated to internal list view

ZmNotebookFileView.prototype.addSelectionListener = function(listener) {
	this._fileListView.addSelectionListener(listener);
};
ZmNotebookFileView.prototype.addActionListener = function(listener) {
	this._fileListView.addActionListener(listener);
};

ZmNotebookFileView.prototype.handleActionPopdown = function(ev) { /*TODO*/ };

ZmNotebookFileView.prototype.getSelection =
function() {
	return this._fileListView.getSelection();
};
ZmNotebookFileView.prototype.getSelectedItems =
function() {
	return this._fileListView.getSelectedItems();
};
ZmNotebookFileView.prototype.getSelectionCount = function() {
	return this._fileListView.getSelectionCount();
};

ZmNotebookFileView.prototype.setOffset = function(offset) {
	this._fileListView.setOffset(offset);
};
ZmNotebookFileView.prototype.getOffset = function() {
	return this._fileListView.getOffset();
};
ZmNotebookFileView.prototype.getLimit = function() {
	return this._fileListView.getLimit();
};
ZmNotebookFileView.prototype.getList = function() {
	return this._fileListView.getList();
};
ZmNotebookFileView.prototype.setSelection = function(item) {
	this._fileListView.setSelection(item);
};

//
// Protected methods
//

ZmNotebookFileView.prototype._createHtml = function() {
	var parent = this;
	var className = null;
	var posStyle = null;
	var mode = null; // ???
	var controller = this._controller;
	var dropTgt = null; // ???
	this._fileListView = new ZmFileListView(parent, className, posStyle, mode, controller, dropTgt);

	var element = this.getHtmlElement();
	Dwt.setScrollStyle(element, Dwt.SCROLL);
	element.appendChild(this._fileListView.getHtmlElement());
};
