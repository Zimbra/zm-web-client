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
 * Portions created by Zimbra are Copyright (C) 2005 Zimbra, Inc.
 * All Rights Reserved.
 * 
 * Contributor(s):
 * 
 * ***** END LICENSE BLOCK *****
 */

function ZmNoteController(appCtxt, container, app) {
	ZmListController.call(this, appCtxt, container, app);

	this._listeners[ZmOperation.REFRESH] = new AjxListener(this, this._refreshListener);
	this._listeners[ZmOperation.EDIT] = new AjxListener(this, this._editListener);
	this._listeners[ZmOperation.ATTACHMENT] = new AjxListener(this, this._uploadListener);
	this._listeners[ZmOperation.DETACH] = new AjxListener(this, this._detachListener);
	this._listeners[ZmOperation.PAGE_BACK] = new AjxListener(this, this._pageBackListener);
	this._listeners[ZmOperation.PAGE_DBL_BACK] = new AjxListener(this, this._homeListener);
	this._listeners[ZmOperation.PAGE_FORWARD] = new AjxListener(this, this._pageForwardListener);
	
	this._history = [];
	this._cachedFolders = {};
}
ZmNoteController.prototype = new ZmListController;
ZmNoteController.prototype.constructor = ZmNoteController;

ZmNoteController.prototype.toString = function() {
	return "ZmNoteController";
};

// Constants

ZmNoteController._VIEWS = {};
ZmNoteController._VIEWS[ZmController.NOTE_VIEW] = ZmNoteView;
ZmNoteController._VIEWS[ZmController.NOTE_FILE_VIEW] = ZmNoteFileView;

// Data

ZmNoteController.prototype._object;
ZmNoteController.prototype._folderId;

ZmNoteController.prototype._place = -1;
ZmNoteController.prototype._history;

//
// Public methods
//

// note

ZmNoteController.prototype.gotoNote = function(noteRef) {
	this._enableNaviButtons();

	var cache = this._app.getNoteCache();
	var note = cache.getNoteByName(noteRef.folderId, noteRef.name);
	this._listView[this._currentView].set(this._object = note);
};

ZmNoteController.prototype.getNote = function() {
	return this._object;
};

// view management

ZmNoteController.prototype.show = function(noteOrFolderId, force) {
	if (force || !(noteOrFolderId instanceof ZmNote)) {
		this._showIndex(noteOrFolderId || ZmNote.DEFAULT_FOLDER);
		return;
	}

	this._object = noteOrFolderId;
	this._folderId = null;
	if (this._object) {
		this._folderId = this._object.folderId;
		for (var i = this._place + 1; i < this._history.length; i++) {
			this._history[i] = null;
		}
		this._history.length = ++this._place;
		var noteRef = { folderId: this._object.folderId, name: this._object.name };
		this._history[this._place] = noteRef;
	}
	
	var view = this._currentView;
	if (!view) {
		view = this._defaultView();
		force = true;
	}
	this.switchView(view, force);

	this._listView[this._currentView].set(this._object);
};

ZmNoteController.prototype.switchView = function(view, force) {
	var viewChanged = force || view != this._currentView;

	if (viewChanged) {	
		this._currentView = view;
		this._setup(view);
	}
	this._resetOperations(this._toolbar[view], 1);

	if (viewChanged) {
		var elements = {};
		elements[ZmAppViewMgr.C_TOOLBAR_TOP] = this._toolbar[this._currentView];
		elements[ZmAppViewMgr.C_APP_CONTENT] = this._listView[this._currentView];

		var ok = this._setView(view, elements, true);
		if (ok) {
			this._setViewMenu(view);
		}
	}
};

//
// Protected methods
//

// initialization

ZmNoteController.prototype._getToolBarOps = function() {
	var list = [];
	// shared items
	list.push(ZmOperation.NEW_MENU, ZmOperation.REFRESH);
	/***
	if (this._appCtxt.get(ZmSetting.TAGGING_ENABLED))
		list.push(ZmOperation.TAG_MENU);
	/***/
	list.push(ZmOperation.EDIT, ZmOperation.SEP);
	/***
	if (this._appCtxt.get(ZmSetting.PRINT_ENABLED))
		list.push(ZmOperation.PRINT);
	/***/
	list.push(
		ZmOperation.DELETE,
		ZmOperation.SEP,
		ZmOperation.ATTACHMENT,
		ZmOperation.FILLER, 
		ZmOperation.DETACH
	);
	// NOTE_VIEW items
	list.push(
		ZmOperation.SEP,
		ZmOperation.PAGE_BACK, ZmOperation.PAGE_DBL_BACK, ZmOperation.PAGE_FORWARD
	);
	return list;
};
ZmNoteController.prototype._initializeToolBar = function(view) {
	ZmListController.prototype._initializeToolBar.call(this, view);

	this._setNewButtonProps(view, ZmMsg.createNewNote, "NewPage", "NewPageDis", ZmOperation.NEW_NOTE);

	var toolbar = this._toolbar[this._currentView];
	var button = toolbar.getButton(ZmOperation.REFRESH);
	button.setImage("SendRecieve");
	button.setDisabledImage("SendRecieveDis");

	var button = toolbar.getButton(ZmOperation.ATTACHMENT);
	button.setText(ZmMsg.addDocuments);
	button.setToolTipContent(ZmMsg.addDocumentsTT);

	var button = toolbar.getButton(ZmOperation.PAGE_BACK);
	button.setToolTipContent("");

	var button = toolbar.getButton(ZmOperation.PAGE_DBL_BACK);
	button.setImage("UpArrow");
	button.setDisabledImage("UpArrowDis");
	button.setToolTipContent("");

	var button = toolbar.getButton(ZmOperation.PAGE_FORWARD);
	button.setToolTipContent("");
};

ZmNoteController.prototype._resetOperations = function(toolbarOrActionMenu, num) {
	if (!toolbarOrActionMenu) return;
	ZmListController.prototype._resetOperations.call(this, toolbarOrActionMenu, num);
	toolbarOrActionMenu.enable([ZmOperation.REFRESH, ZmOperation.ATTACHMENT], true);
	toolbarOrActionMenu.enable(ZmOperation.DETACH, false);
	if (toolbarOrActionMenu instanceof ZmToolBar) {
		this._enableNaviButtons();
	}
};

ZmNoteController.prototype._getTagMenuMsg = function() {
	return ZmMsg.tagNote;
};

ZmNoteController.prototype._doDelete = function(items) {
	var ids = ZmNoteController.__itemize(items);
	if (!ids) return;
	
	var soapDoc = AjxSoapDoc.create("ItemActionRequest", "urn:zimbraMail");
	var actionNode = soapDoc.set("action");
	actionNode.setAttribute("id", ids);
	actionNode.setAttribute("op", "delete");
	
	var responseHandler = this._current == ZmController.NOTE_VIEW ? this._listeners[ZmOperation.PAGE_BACK] : null;
	var params = {
		soapDoc: soapDoc,
		asyncMode: true,
		callback: responseHandler,
		errorCallback: null,
		noBusyOverlay: false
	};
	
	var appController = this._appCtxt.getAppController();
	var response = appController.sendRequest(params);
	return response;
};

// view management

ZmNoteController.prototype._getViewType = function() {
	return ZmItem.NOTE;
};

ZmNoteController.prototype._defaultView = function() {
	return ZmController.NOTE_VIEW;
};

ZmNoteController.prototype._createNewView = function(view) {
	if (!this._listView[view]) {
		var viewCtor = ZmNoteController._VIEWS[view];
		this._listView[view] = new viewCtor(this._container, this._appCtxt, this); 
	}
	return this._listView[view];
};

ZmNoteController.prototype._setViewContents = function(view) {
	this._listView[view].set(this._object);
};

ZmNoteController.prototype._setViewMenu = function(view) {
	var appToolbar = this._appCtxt.getCurrentAppToolbar();
	var menu = appToolbar.getViewMenu(view);
	if (!menu) {
		var listener = this._listeners[ZmOperation.VIEW];
		
		menu = new ZmPopupMenu(appToolbar.getViewButton());

		var item = menu.createMenuItem(ZmNotesApp.NOTE, "Page", ZmMsg.noteView, null, true, DwtMenuItem.RADIO_STYLE);
		item.setData(ZmOperation.MENUITEM_ID, ZmController.NOTE_VIEW);
		item.addSelectionListener(listener);
		
		var item = menu.createMenuItem(ZmNotesApp.FILE, "Folder", ZmMsg.noteFileView, null, true, DwtMenuItem.RADIO_STYLE);
		item.setData(ZmOperation.MENUITEM_ID, ZmController.NOTE_FILE_VIEW);
		item.addSelectionListener(listener);
	}

	var item = menu.getItemById(ZmOperation.MENUITEM_ID, view);
	item.setChecked(true, true);

	appToolbar.setViewMenu(view, menu);
};

ZmNoteController.prototype._enableNaviButtons = function() {
	var enabled = this._currentView == ZmController.NOTE_VIEW;

	var toolbar = this._toolbar[this._currentView];
	var button = toolbar.getButton(ZmOperation.PAGE_BACK);
	button.setEnabled(enabled && this._place > 0);
	ZmNoteController.__setButtonToolTip(button, this._history[this._place - 1]);
	
	var button = toolbar.getButton(ZmOperation.PAGE_DBL_BACK);
	button.setEnabled(enabled && this._place > 0);
	ZmNoteController.__setButtonToolTip(button, this._history[0]);

	var button = toolbar.getButton(ZmOperation.PAGE_FORWARD);
	button.setEnabled(enabled && this._place + 1 < this._history.length);
	ZmNoteController.__setButtonToolTip(button, this._history[this._place + 1]);
};

// listeners

ZmNoteController.prototype._refreshListener = function(event) {
	var noteRef = this._history[this._place];
	if (noteRef) {
		if (this._place == 0) {
			this._showIndex(noteRef.folderId);
		}
		else {
			var cache = this._app.getNoteCache();
			var note = cache.getNoteByName(noteRef.folderId, noteRef.name);
			note.load();
			this._listView[this._currentView].set(note);
		}
	}
};

ZmNoteController.prototype._editListener = function(event) {
	var noteEditController = this._app.getNoteEditController();
	var note = this._listView[this._currentView].getSelection();
	noteEditController.show(note);
};

ZmNoteController.prototype._uploadListener = function(event) {
	var dialog = this._appCtxt.getUploadDialog();
	dialog.setFolderId(this._folderId || ZmNote.DEFAULT_FOLDER);
	dialog.popup();
};

ZmNoteController.prototype._detachListener = function(event) {
	alert("TODO: _detachListener");	
};


ZmNoteController.prototype._pageBackListener = function(event) {
	if (this._place > 0) {
		this.gotoNote(this._history[--this._place]);
	}
};
ZmNoteController.prototype._homeListener = function(event) {
	if (this._place > 0) {
		this.gotoNote(this._history[this._place = 0]);
	}
};
ZmNoteController.prototype._pageForwardListener = function(event) {
	if (this._place + 1 < this._history.length) {
		this.gotoNote(this._history[++this._place]);
	}
};

// note view

ZmNoteController.prototype._showIndex = function(folderId) {
	var cache = this._app.getNoteCache();
	if (!this._cachedFolders[folderId]) {
		// NOTE: Only need to fill the cache for each folder once
		//       because it will automatically be updated via the
		//       notifications in the app controller.
		this._cachedFolders[folderId] = true;
		var responseHandler = new AjxCallback(this, this._showIndex, [folderId]);
		cache.fillCache(folderId, responseHandler);
		return;
	}
	var index = cache.getNoteByName(folderId, "_INDEX_");
	this.show(index);
};

//
// Private functions
//

ZmNoteController.__setButtonToolTip = function(button, noteRef) {
	var text = noteRef ? noteRef.name : "";
	button.setToolTipContent(text);
};

ZmNoteController.__itemize = function(objects) {
	if (objects instanceof Array) {
		var ids = [];
		for (var i = 0; i < objects.length; i++) {
			var object = objects[i];
			if (object.id) {
				ids.push(object.id);
			}
		}
		return ids.join();
	}
	return objects.id;
};
