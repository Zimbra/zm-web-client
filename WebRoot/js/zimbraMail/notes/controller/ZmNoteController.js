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
	this._history = [];
	this._listeners[ZmOperation.EDIT] = new AjxListener(this, this._editListener);
	this._listeners[ZmOperation.REFRESH] = new AjxListener(this, this._refreshListener);
	this._listeners[ZmOperation.PAGE_BACK] = new AjxListener(this, this._pageBackListener);
	this._listeners[ZmOperation.PAGE_DBL_BACK] = new AjxListener(this, this._homeListener);
	this._listeners[ZmOperation.PAGE_FORWARD] = new AjxListener(this, this._pageForwardListener);
}
ZmNoteController.prototype = new ZmListController;
ZmNoteController.prototype.constructor = ZmNoteController;

ZmNoteController.prototype.toString =
function() {
	return "ZmNoteController";
};

// Data

ZmNoteController.prototype._note;

ZmNoteController.prototype._place = -1;
ZmNoteController.prototype._history;

// Public methods

ZmNoteController.prototype.show =
function(noteOrFolderId, force) {
	if (!(noteOrFolderId instanceof ZmNote)) {
		noteOrFolderId = noteOrFolderId || ZmNote.DEFAULT_FOLDER;
		this._generateIndex(noteOrFolderId);
		return;
	}

	var elements;
	if (!this._currentView) {
		this._currentView = this._defaultView();
		this._setup(this._currentView);

		elements = new Object();
		elements[ZmAppViewMgr.C_TOOLBAR_TOP] = this._toolbar[this._currentView];
		elements[ZmAppViewMgr.C_APP_CONTENT] = this._listView[this._currentView];
	}
	
	this._resetOperations(this._toolbar[this._currentView], 1); // enable all buttons

	this._note = noteOrFolderId;
	if (this._note) {
		for (var i = this._place + 1; i < this._history.length; i++) {
			this._history[i] = null;
		}
		this._history.length = ++this._place;
		var noteRef = { folderId: this._note.folderId, name: this._note.name };
		this._history[this._place] = noteRef;
	}
	this._enableNaviButtons();
	this._setView(this._currentView, elements, true);
};

ZmNoteController.prototype.gotoNote =
function(noteRef) {
	this._enableNaviButtons();

	var cache = this._app.getNoteCache();
	var note = cache.getNoteByName(noteRef.folderId, noteRef.name);
	this._listView[this._currentView].set(this._note = note);
};

ZmNoteController.prototype.getNote = 
function() {
	return this._note;
};

// Protected methods

ZmNoteController.prototype._getToolBarOps = 
function() {
	var list = [];
	list.push(ZmOperation.NEW_MENU, ZmOperation.EDIT, ZmOperation.SEP);
	/***
	if (this._appCtxt.get(ZmSetting.TAGGING_ENABLED))
		list.push(ZmOperation.TAG_MENU);
	if (this._appCtxt.get(ZmSetting.PRINT_ENABLED))
		list.push(ZmOperation.PRINT);
	/***/
	list.push(
		ZmOperation.REFRESH, ZmOperation.SEP,
		ZmOperation.DELETE, 
		ZmOperation.FILLER, 
		ZmOperation.PAGE_BACK, ZmOperation.PAGE_DBL_BACK, ZmOperation.PAGE_FORWARD
	);
	return list;
};
ZmNoteController.prototype._initializeToolBar =
function(view) {
	ZmListController.prototype._initializeToolBar.call(this, view);

	this._setNewButtonProps(view, ZmMsg.createNewNote, "NewNote", "NewNoteDis", ZmOperation.NEW_NOTE);

	var toolbar = this._toolbar[this._currentView];
	var button = toolbar.getButton(ZmOperation.PAGE_BACK);
	button.setToolTipContent("");

	var button = toolbar.getButton(ZmOperation.PAGE_DBL_BACK);
	button.setImage("UpArrow");
	button.setDisabledImage("UpArrowDis");
	button.setToolTipContent("");

	var button = toolbar.getButton(ZmOperation.PAGE_FORWARD);
	button.setToolTipContent("");
};

ZmNoteController.prototype._defaultView =
function() {
	return ZmController.NOTE_VIEW;
};

ZmNoteController.prototype._getViewType = 
function() {
	return ZmItem.NOTE;
};

ZmNoteController.prototype._createNewView =
function(view) {
	if (!this._noteView) {
		this._noteView = new ZmNoteView(this._container, this._appCtxt, this); 
	}
	return this._noteView;
};

ZmNoteController.prototype._setViewContents =
function(view) {
	this._listView[view].set(this._note);
};

ZmNoteController.prototype._getTagMenuMsg = 
function() {
	return ZmMsg.tagNote;
};

ZmNoteController.prototype._doDelete =
function(note) {
	debugger;
	
	var soapDoc = AjxSoapDoc.create("DeleteWikiRequest", "urn:zimbraMail");
	var wordNode = soapDoc.set("w");
	wordNode.setAttribute("name", note.name);
	
	var params = {
		soapDoc: soapDoc,
		asyncMode: true,
		callback: new AjxCallback(this, this._pageBackListener),
		errorCallback: null,
		noBusyOverlay: false
	};
	
	var appController = this._appCtxt.getAppController();
	appController.sendRequest(params);
};

ZmNoteController.prototype._editListener =
function(ev) {
	var noteEditController = this._app.getNoteEditController();
	noteEditController.show(this._note);
};

ZmNoteController.prototype._refreshListener =
function(ev) {
	var noteRef = this._history[this._place];
	if (noteRef) {
		if (this._place == 0) {
			this._generateIndex(noteRef.folderId);
		}
		else {
			var cache = this._app.getNoteCache();
			var note = cache.getNoteByName(noteRef.folderId, noteRef.name);
			note.load();
			this._listView[this._currentView].set(note);
		}
	}
};

ZmNoteController.prototype._pageBackListener = 
function(ev) {
	if (this._place > 0) {
		this.gotoNote(this._history[--this._place]);
	}
};
ZmNoteController.prototype._homeListener =
function(ev) {
	if (this._place > 0) {
		this.gotoNote(this._history[this._place = 0]);
	}
};
ZmNoteController.prototype._pageForwardListener =
function(ev) {
	if (this._place + 1 < this._history.length) {
		this.gotoNote(this._history[++this._place]);
	}
};

ZmNoteController.prototype._generateIndex = function(folderId, callback) {
	var cache = this._app.getNoteCache();
	var index = cache.getNoteByName(folderId, "_INDEX_");
	if (!index) {
		var responseHandler = new AjxCallback(this, this._generateIndexResponse, [folderId, callback]);
		cache.fillCache(folderId, responseHandler);
		return;
	}
	this.show(index);
};
ZmNoteController.prototype._generateIndexResponse = 
function(folderId, callback, response) {
	var cache = this._app.getNoteCache();
	var index = cache.getNoteByName(folderId, "_INDEX_");
	if (!index) {
		index = new ZmNote(this._appCtxt);
		index.folderId = folderId;
		index.name = "_INDEX_";
		index.setContent( [
			"<H1>{{MSG|wikiToc}}</H1>",
			"<H2>{{MSG|wikiUserPages}}</H2>",
			"<P>",
				"{{TOC}}",
			"<H2>{{MSG|wikiSpecialPages}}</H2>",
			"<P>",
				"{{TOC|name='_*_'}}"
		].join("") );
		cache.putNote(index);
	}
	
	var chrome = cache.getNoteByName(folderId, "_CHROME_");
	if (!chrome) {
		chrome = new ZmNote(this._appCtxt);
		chrome.folderId = folderId;
		chrome.name = "_CHROME_";
		chrome.setContent( [
			"<H1>{{PAGENAME}}</H1>",
			"<DIV>",
				"{{CONTENT}}"
		].join("") );
		cache.putNote(chrome);
	}
	
	this.show(index);
	
	if (callback) {
		callback.run(index);
	}
};
/***/

ZmNoteController.__byWord = function(a, b) {
	var ac = a.name.toLowerCase();
	var bc = b.name.toLowerCase();
	if (ac < bc) return -1;
	if (ac > bc) return 1;
	return 0;
};

ZmNoteController.prototype._enableNaviButtons =
function() {
	var toolbar = this._toolbar[this._currentView];
	/***
	var button = toolbar.getButton(ZmOperation.EDIT);
	button.setEnabled(this._place > 0);
	
	var button = toolbar.getButton(ZmOperation.DELETE);
	button.setEnabled(this._note && !this._note._topPage);
	/***/
	
	var button = toolbar.getButton(ZmOperation.REFRESH);
	button.setEnabled(Boolean(this._history[this._place]));
	
	var button = toolbar.getButton(ZmOperation.PAGE_BACK);
	button.setEnabled(this._place > 0);
	this.__setButtonToolTip(button, this._history[this._place - 1]);
	
	var button = toolbar.getButton(ZmOperation.PAGE_DBL_BACK);
	button.setEnabled(this._place > 0);
	this.__setButtonToolTip(button, this._history[0]);

	var button = toolbar.getButton(ZmOperation.PAGE_FORWARD);
	button.setEnabled(this._place + 1 < this._history.length);
	this.__setButtonToolTip(button, this._history[this._place + 1]);
};

// Private methods

ZmNoteController.prototype.__setButtonToolTip = 
function(button, noteRef) {
	var text = noteRef ? noteRef.name : "";
	button.setToolTipContent(text);
};