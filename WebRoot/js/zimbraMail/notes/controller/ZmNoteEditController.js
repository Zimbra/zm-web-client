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

function ZmNoteEditController(appCtxt, container, app) {
	ZmListController.call(this, appCtxt, container, app);
	this._listeners[ZmOperation.SAVE] = new AjxListener(this, this._saveListener);
	this._listeners[ZmOperation.CANCEL] = new AjxListener(this, this._cancelListener);
}
ZmNoteEditController.prototype = new ZmListController;
ZmNoteEditController.prototype.constructor = ZmNoteEditController;

ZmNoteEditController.prototype.toString =
function() {
	return "ZmNoteEditController";
};

// Data

ZmNoteEditController.prototype._note;

// Public methods

ZmNoteEditController.prototype.show =
function(note) {
	this._note = note;

	var elements;
	if (!this._currentView) {
		this._currentView = this._defaultView();
		this._setup(this._currentView);
		
		elements = new Object();
		elements[ZmAppViewMgr.C_TOOLBAR_TOP] = this._toolbar[this._currentView];
		elements[ZmAppViewMgr.C_APP_CONTENT] = this._listView[this._currentView];
	}

	this._resetOperations(this._toolbar[this._currentView], 1); // enable all buttons
	this._setView(this._currentView, elements, false);
};

ZmNoteEditController.prototype.getNote = 
function() {
	return this._note;
};

// Protected methods

ZmNoteEditController.prototype._getToolBarOps = 
function() {
	var list = [ZmOperation.SAVE];
	list.push(ZmOperation.CANCEL);
	/***
	list.push(ZmOperation.SEP);
	if (this._appCtxt.get(ZmSetting.TAGGING_ENABLED))
		list.push(ZmOperation.TAG_MENU);
	if (this._appCtxt.get(ZmSetting.PRINT_ENABLED))
		list.push(ZmOperation.PRINT);
	list.push(ZmOperation.DELETE);
	/***/
	return list;
};

ZmNoteEditController.prototype._defaultView =
function() {
	return ZmController.NOTE_EDIT_VIEW;
};

ZmNoteEditController.prototype._getViewType = 
function() {
	return ZmItem.NOTE;
};

ZmNoteEditController.prototype._createNewView =
function(view) {
	if (!this._noteView) {
		this._noteView = new ZmNoteEditView(this._container, this._appCtxt, this); 
	}
	return this._noteView;
};

ZmNoteEditController.prototype._setViewContents =
function(view) {
	this._listView[view].set(this._note);
};

ZmNoteEditController.prototype._getTagMenuMsg = 
function() {
	return ZmMsg.tagNote;
};

ZmNoteEditController.prototype._saveListener =
function(ev) {
	// set fields on note object
	this._note.name = this._noteView.getTitle();
	this._note.setContent(this._noteView.getContent());
	
	// save
	var callback = new AjxCallback(this._app, this._app.popView);
	this._note.save(callback);
};

ZmNoteEditController.prototype._cancelListener =
function(ev) {
	this._app.popView();
};
