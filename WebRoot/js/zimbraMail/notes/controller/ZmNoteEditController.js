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
	this._listeners[ZmOperation.ATTACHMENT] = new AjxListener(this, this._addDocsListener);
	this._listeners[ZmOperation.COMPOSE_FORMAT] = new AjxListener(this, this._formatListener);
}
ZmNoteEditController.prototype = new ZmListController;
ZmNoteEditController.prototype.constructor = ZmNoteEditController;

ZmNoteEditController.prototype.toString =
function() {
	return "ZmNoteEditController";
};

// Constants

ZmNoteEditController.RADIO_GROUP = {};
ZmNoteEditController.RADIO_GROUP[ZmOperation.FORMAT_HTML_SOURCE]	= 1;
ZmNoteEditController.RADIO_GROUP[ZmOperation.FORMAT_MEDIA_WIKI]		= 1;
ZmNoteEditController.RADIO_GROUP[ZmOperation.FORMAT_RICH_TEXT]		= 1;
ZmNoteEditController.RADIO_GROUP[ZmOperation.FORMAT_TWIKI]			= 1;

// Data

ZmNoteEditController.prototype._note;

ZmNoteEditController.prototype._uploadCallback;

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
	var list = [];
	list.push(
		ZmOperation.SAVE, ZmOperation.CANCEL,
		ZmOperation.SEP
	);
	/***
	if (this._appCtxt.get(ZmSetting.TAGGING_ENABLED)) {
		list.push(
			ZmOperation.TAG_MENU,
			ZmOperation.SEP
		);
	}
	if (this._appCtxt.get(ZmSetting.PRINT_ENABLED))
		list.push(ZmOperation.PRINT);
	list.push(
		ZmOperation.DELETE,
		ZmOperation.SEP
	);
	/***/
	list.push(
		ZmOperation.ATTACHMENT,
		ZmOperation.FILLER,
		ZmOperation.COMPOSE_FORMAT
	);
	return list;
};
ZmNoteEditController.prototype._initializeToolBar =
function(view) {
	if (this._toolbar[view]) return;
	
	ZmListController.prototype._initializeToolBar.call(this, view);

	var toolbar = this._toolbar[view];
	var button = toolbar.getButton(ZmOperation.ATTACHMENT);
	button.setText(ZmMsg.addDocuments);
	button.setToolTipContent(ZmMsg.addDocumentsTT);
	
	var button = toolbar.getButton(ZmOperation.COMPOSE_FORMAT);
	var menu = new ZmPopupMenu(button);
	var items = [
		{ op: ZmOperation.FORMAT_RICH_TEXT, format: ZmNoteEditor.RICH_TEXT },
		{ op: ZmOperation.FORMAT_HTML_SOURCE, format: ZmNoteEditor.HTML_SOURCE },
		{ op: ZmOperation.FORMAT_MEDIA_WIKI, format: ZmNoteEditor.MEDIA_WIKI },
		{ op: ZmOperation.FORMAT_TWIKI, format: ZmNoteEditor.TWIKI }
	];
	for (var i = 0; i < items.length; i++) {
		var item = items[i];
		var op = item.op;

		var icon = ZmOperation.IMAGE[op];
		var text = ZmMsg[ZmOperation.MSG_KEY[op]];
		var style = DwtMenuItem.RADIO_STYLE;
		var group = ZmNoteEditController.RADIO_GROUP[op];

		var menuItem = menu.createMenuItem(op, icon, text, null, true, style, group);
		menuItem.setData(ZmOperation.KEY_ID, op);		
		menuItem.setData(ZmNoteEditor.KEY_FORMAT, item.format);		
		menuItem.addSelectionListener(this._listeners[ZmOperation.COMPOSE_FORMAT]);
	}
	
	button.setMenu(menu);
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
	if (!this._noteEditView) {
		this._noteEditView = new ZmNoteEditView(this._container, this._appCtxt, this); 
	}
	return this._noteEditView;
};

ZmNoteEditController.prototype._setView = 
function(view, elements, isAppView, clear, pushOnly, isPoppable) {
	ZmListController.prototype._setView.apply(this, arguments);
	//this._app._setViewMenu(view);

	this._format = this._format || ZmNoteEditor.RICH_TEXT;
	
	var toolbar = this._toolbar[view];
	var button = toolbar.getButton(ZmOperation.COMPOSE_FORMAT);
	var menu = button.getMenu();
	menu.checkItem(ZmNoteEditor.KEY_FORMAT, this._format, true);
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
	this._note.name = this._noteEditView.getTitle();
	this._note.setContent(this._noteEditView.getContent());
	
	// save
	var callback = new AjxCallback(this._app, this._app.popView);
	this._note.save(callback);
};

ZmNoteEditController.prototype._cancelListener =
function(ev) {
	this._app.popView();
};

ZmNoteEditController.prototype._addDocsListener =
function(ev) {
	var dialog = this._appCtxt.getUploadDialog();
	dialog.setFolderId(this._note.folderId || ZmNote.DEFAULT_FOLDER);
	dialog.popup();
};

ZmNoteEditController.prototype._formatListener = function(ev) {
	// popup menu
	var op = ev.item.getData(ZmOperation.KEY_ID);
	if (op == ZmOperation.COMPOSE_FORMAT) {
		var toolbar = this._toolbar[this._currentView];
		var button = toolbar.getButton(ZmOperation.COMPOSE_FORMAT);
		/***/
		button.popup();
		/***
		var menu = button.getMenu();
		if (menu.isPoppedup()) {
			menu.popdown();
		}
		else {
			button.popup();
		}
		/***/
		return;
	}

	// ignore de-selection
	if (ev.item.getChecked() == false) {
		return;
	}
	
	// handle selection
	var content = this._noteEditView.getContent();
	var format = ev.item.getData(ZmNoteEditor.KEY_FORMAT);
	this._noteEditView.setFormat(format);
	this._noteEditView.setContent(content);
};
