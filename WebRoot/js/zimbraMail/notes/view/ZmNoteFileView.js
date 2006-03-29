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

function ZmNoteFileView(parent, appCtxt, controller) {
	DwtComposite.call(this, parent, "ZmNoteFileView", DwtControl.ABSOLUTE_STYLE);
	
	this._appCtxt = appCtxt;
	this._controller = controller;

	this._createHtml();	
}
ZmNoteFileView.prototype = new DwtComposite;
ZmNoteFileView.prototype.constructor = ZmNoteFileView;

ZmNoteFileView.prototype.toString =
function() {
	return "ZmNoteFileView";
};

// Constants

ZmNoteFileView.COLWIDTH_ICON 			= 20;
ZmNoteFileView.COLWIDTH_NAME			= 105;
ZmNoteFileView.COLWIDTH_TYPE			= 47;
ZmNoteFileView.COLWIDTH_SIZE 			= 45;
ZmNoteFileView.COLWIDTH_DATE 			= 75;
ZmNoteFileView.COLWIDTH_OWNER			= 105;

// Data

ZmNoteFileView.prototype._appCtxt;
ZmNoteFileView.prototype._controller;

ZmNoteFileView.prototype._fileListView;

// Public methods

ZmNoteFileView.prototype.getController =
function() {
	return this._controller;
};

ZmNoteFileView.prototype.set =
function(note) {
	debugger;
};

ZmNoteFileView.prototype.getSelection =
function() {
	return this._controller.getNote();
};


ZmNoteFileView.prototype.addSelectionListener = function(listener) { /*TODO*/ };
ZmNoteFileView.prototype.addActionListener = function(listener) { /*TODO*/ };

// Protected methods

ZmNoteFileView.prototype._createHtml = function() {
	var parent = this;
	var className = null;
	var posStyle = null;
	var view = null; // ???
	var type = null; // ???
	var controller = this._controller;
	var headerList = this._createHeaderList();
	var dropTgt = null; // ???
	this._fileListView = new ZmListView(parent, className, posStyle, view, type, controller, headerList, dropTgt);

	var element = this.getHtmlElement();
	Dwt.setScrollStyle(element, Dwt.SCROLL);
	element.appendChild(this._fileListView.getHtmlElement());
};

ZmNoteFileView.prototype._createHeaderList = function() {
	// Columns: tag, name, type, size, date, owner
	return [
		// new DwtListHeaderItem(id, label, icon, width, sortable, resizeable, visible, tt)
		new DwtListHeaderItem(ZmListView.FIELD_PREFIX[ZmItem.F_TAG], null, "Tag", ZmNoteFileView.COLWIDTH_ICON, null, null, null, ZmMsg.tag),
		new DwtListHeaderItem(ZmListView.FIELD_PREFIX[ZmItem.F_SUBJECT], ZmMsg._name, null, ZmNoteFileView.COLWIDTH_NAME, true, true, null, null),
		new DwtListHeaderItem(ZmListView.FIELD_PREFIX[ZmItem.F_ITEM_TYPE], ZmMsg.type, null, ZmNoteFileView.COLWIDTH_TYPE, true, null, null, null),
		new DwtListHeaderItem(ZmListView.FIELD_PREFIX[ZmItem.F_SIZE], ZmMsg.size, null, ZmNoteFileView.COLWIDTH_SIZE, true, null, null, null),
		new DwtListHeaderItem(ZmListView.FIELD_PREFIX[ZmItem.F_DATE], ZmMsg.date, null, ZmNoteFileView.COLWIDTH_DATE, true, null, null, null),
		new DwtListHeaderItem(ZmListView.FIELD_PREFIX[ZmItem.F_FROM], ZmMsg.owner, null, ZmNoteFileView.COLWIDTH_OWNER, true, null, null, null)
	];
};