/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2006, 2007, 2008, 2009, 2010 Zimbra, Inc.
 * 
 * The contents of this file are subject to the Zimbra Public License
 * Version 1.3 ("License"); you may not use this file except in
 * compliance with the License.  You may obtain a copy of the License at
 * http://www.zimbra.com/license.
 * 
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * ***** END LICENSE BLOCK *****
 */

ZmPageEditController = function(container, app) {
	ZmListController.call(this, container, app);

	ZmPageEditController.RADIO_GROUP = {};
	ZmPageEditController.RADIO_GROUP[ZmOperation.FORMAT_HTML_SOURCE]	= 1;
	ZmPageEditController.RADIO_GROUP[ZmOperation.FORMAT_MEDIA_WIKI]		= 1;
	ZmPageEditController.RADIO_GROUP[ZmOperation.FORMAT_RICH_TEXT]		= 1;
	ZmPageEditController.RADIO_GROUP[ZmOperation.FORMAT_TWIKI]			= 1;

	this._listeners[ZmOperation.SAVE] = new AjxListener(this, this._saveListener);
	this._listeners[ZmOperation.CLOSE] = new AjxListener(this, this._closeListener);
	this._listeners[ZmOperation.SPELL_CHECK] = new AjxListener(this, this._spellCheckListener);
	this._listeners[ZmOperation.COMPOSE_FORMAT] = new AjxListener(this, this._formatListener);
	this._listeners[ZmOperation.NOTIFY] = new AjxListener(this, this._notifyListener);

	// data
	this._page = null;
	this._wikletParamDialog = null;
	this._uploadCallback = null;
	this._pageEditView = null;
	this._popViewWhenSaved = null;
};

ZmPageEditController.prototype = new ZmListController;
ZmPageEditController.prototype.constructor = ZmPageEditController;

ZmPageEditController.prototype.toString =
function() {
	return "ZmPageEditController";
};


// Public methods

ZmPageEditController.prototype.show =
function(page) {
	// NOTE: Need to protect against changes happening behind our backs
	this._page = AjxUtil.createProxy(page);
	this._page.version = page.version;

	var elements;
	if (!this._currentView) {
		this._currentView = this._defaultView();
		this._setup(this._currentView);

		elements = new Object();
		elements[ZmAppViewMgr.C_TOOLBAR_TOP] = this._toolbar[this._currentView];
		elements[ZmAppViewMgr.C_APP_CONTENT] = this._listView[this._currentView];
	}

	this._resetOperations(this._toolbar[this._currentView], 1); // enable all buttons
	this._setView({view:this._currentView, elements:elements, isTransient:true});
};

ZmPageEditController.prototype.getPage =
function() {
	return this._page;
};

ZmPageEditController.prototype.getKeyMapName =
function() {
	return "ZmPageEditController";
};

ZmPageEditController.prototype.handleKeyAction =
function(actionCode) {
	DBG.println(AjxDebug.DBG2, "ZmPageEditController.handleKeyAction");
	switch (actionCode) {

		case ZmKeyMap.SAVE:
			this._saveListener();
			break;

		case ZmKeyMap.CANCEL:
			this._closeListener();
			break;
	}
	return true;
};


// Protected methods

ZmPageEditController.prototype._getToolBarOps =
function() {
	var list = [ZmOperation.SAVE, ZmOperation.CLOSE, ZmOperation.SEP];

	if (!appCtxt.isOffline) {
		list.push(ZmOperation.SPELL_CHECK);
	}

	list.push(ZmOperation.FILLER);

	if (appCtxt.get(ZmSetting.HTML_COMPOSE_ENABLED)) {
		list.push(ZmOperation.COMPOSE_FORMAT);
	}

    list.push(ZmOperation.NOTIFY);

	return list;
};

ZmPageEditController.prototype._initializeToolBar =
function(view) {
	if (this._toolbar[view]) { return; }

	ZmListController.prototype._initializeToolBar.call(this, view);

	var toolbar = this._toolbar[view];

	var spellCheckButton = toolbar.getButton(ZmOperation.SPELL_CHECK);
	if (spellCheckButton) {
		spellCheckButton.setAlign(DwtLabel.IMAGE_LEFT | DwtButton.TOGGLE_STYLE);
	}

	// NOTE: probably cleaner to use ZmActionMenu, which knows about operations
	if (appCtxt.get(ZmSetting.HTML_COMPOSE_ENABLED)) {
		var button = toolbar.getButton(ZmOperation.COMPOSE_FORMAT);
		var menu = new ZmPopupMenu(button);
		var items = [
			{ op: ZmOperation.FORMAT_RICH_TEXT, format: ZmPageEditor.RICH_TEXT },
			{ op: ZmOperation.FORMAT_HTML_SOURCE, format: ZmPageEditor.HTML_SOURCE }
		];

		for (var i = 0; i < items.length; i++) {
			var item = items[i];
			var op = item.op;

			var icon = ZmOperation.getProp(op, "image");
			var text = ZmMsg[ZmOperation.getProp(op, "textKey")];
			var style = DwtMenuItem.RADIO_STYLE;
			var group = ZmPageEditController.RADIO_GROUP[op];

			var menuItem = menu.createMenuItem(op, {image:icon, text:text, style:style, radioGroupId:group});
			menuItem.setData(ZmOperation.KEY_ID, op);
			menuItem.setData(ZmPageEditor.KEY_FORMAT, item.format);
			menuItem.addSelectionListener(this._listeners[ZmOperation.COMPOSE_FORMAT]);
		}

		button.setMenu(menu);
	}
};

ZmPageEditController.prototype._defaultView =
function() {
	return ZmId.VIEW_NOTEBOOK_PAGE_EDIT;
};

ZmPageEditController.prototype._createNewView =
function(view) {
	if (!this._pageEditView) {
		this._pageEditView = new ZmPageEditView(this._container, this);
	}
	return this._pageEditView;
};

/**
 * Creates the desired application view.
 *
 * @param params		[hash]			hash of params:
 *        view			[constant]		view ID
 *        elements		[array]			array of view components
 *        isAppView		[boolean]*		this view is a top-level app view
 *        clear			[boolean]*		if true, clear the hidden stack of views
 *        pushOnly		[boolean]*		don't reset the view's data, just swap the view in
 *        isTransient	[boolean]*		this view doesn't go on the hidden stack
 *        stageView		[boolean]*		stage the view rather than push it
 *        tabParams		[hash]*			button params; view is opened in app tab instead of being stacked
 */
ZmPageEditController.prototype._setView =
function(params) {
	ZmListController.prototype._setView.apply(this, arguments);

	this._format = this._format || ZmPageEditor.DEFAULT;

	if (appCtxt.get(ZmSetting.HTML_COMPOSE_ENABLED)) {
		var toolbar = this._toolbar[params.view];
		var button = toolbar.getButton(ZmOperation.COMPOSE_FORMAT);
		var menu = button.getMenu();
		menu.checkItem(ZmPageEditor.KEY_FORMAT, this._format, true);
	}
    //Dwt.setTitle(this._listView[view].getTitle());
    if(!this._page || !this._page.name){
        Dwt.setTitle(ZmMsg.zimbraTitle);        
    }else{
        Dwt.setTitle([ZmMsg.zimbraTitle, this._page.name].join(": "));
    }
};

ZmPageEditController.prototype._setViewContents =
function(view) {
	this._listView[view].set(this._page);
};

ZmPageEditController.prototype._getTagMenuMsg =
function() {
	return ZmMsg.tagPage;
};

ZmPageEditController.prototype._saveListener =
function(ev) {
	this._doSave(false);
};

ZmPageEditController.INVALID_DOC_NAME_CHARS = "[\\|]";
ZmPageEditController.INVALID_DOC_NAME_RE = new RegExp(ZmPageEditController.INVALID_DOC_NAME_CHARS);

ZmPageEditController.prototype._doSave =
function(popViewWhenSaved) {
	var name = this._pageEditView.getPageName();
	name = name.replace(/^\s+/,"").replace(/\s+$/,"");
	var message;
	if (name == "") {
		message = ZmMsg.errorSavingPageNameRequired;
	} else if (!ZmOrganizer.VALID_NAME_RE.test(name) || !ZmOrganizer.VALID_NAME_RE.test(unescape(name)) || !ZmOrganizer.VALID_NAME_RE.test(decodeURI(name)) || ZmPageEditController.INVALID_DOC_NAME_RE.test(name)) {
		message = AjxMessageFormat.format(ZmMsg.errorInvalidName, AjxStringUtil.htmlEncode(name));
	} else if ( name.length > ZmOrganizer.MAX_NAME_LENGTH){
        message = AjxMessageFormat.format(ZmMsg.nameTooLong, ZmOrganizer.MAX_NAME_LENGTH);
    }

	// bug: 9406 (short term fix, waiting for backend support)
	var notebook = appCtxt.getById(this._page.folderId || ZmOrganizer.ID_NOTEBOOK);
	if (notebook && notebook.getChild(name)) {
		message = AjxMessageFormat.format(ZmMsg.errorInvalidPageOrSectionName, name);
	}

	if (message) {
		var style = DwtMessageDialog.WARNING_STYLE;
		var dialog = this.warngDlg = appCtxt.getMsgDialog();
		dialog.setMessage(message, style);
		dialog.popup();
	    dialog.registerCallback(DwtDialog.OK_BUTTON, this._focusPageInput, this);
		this._pageEditView.focus();
		return false;
	}

	this._filterScripts();

	// set fields on page object
	var content = this._pageEditView.getContent(true);
	this._page.name = name;
	this._page.setContent(content);

	// save
	this._popViewWhenSaved = popViewWhenSaved;
	var saveCallback = new AjxCallback(this, this._saveResponseHandler, [content]);
	var saveErrorCallback = new AjxCallback(this, this._saveErrorResponseHandler, [content]);
	this._page.save(saveCallback, saveErrorCallback);
	return true;
};

ZmPageEditController.prototype._filterScripts =
function() {
	var view = this._pageEditView;
	var editor = view._pageEditor;
	if (editor && (editor._mode == DwtHtmlEditor.HTML)) {
		var doc = editor._getIframeDoc();
		this.removeComponent(doc, "script");
		this.removeComponent(doc, "object");
		this.removeComponent(doc, "embed");
		this.removeComponent(doc, "applet");
	}
};

ZmPageEditController.prototype.removeComponent =
function(doc, tagName) {
	if (!tagName) { return; }

	var elements = doc.getElementsByTagName(tagName);
	if (!elements) { return; }

	for (var i = 0; i < elements.length; ++i) {
		if (elements[i].parentNode) {
			DBG.dumpObj(elements[i].innerHTML);
			elements[i].parentNode.removeChild(elements[i]);
		}
	}
};

ZmPageEditController.prototype._focusPageInput =
function() {
	if (this.warngDlg) {
		this.warngDlg.popdown();
	}
	this._pageEditView._pageNameInput.focus();
};

ZmPageEditController.prototype._showCurrentPage =
function() {
	if (this._page && this._page.id) {
		this._showPage(this._page.id);
	}
};

ZmPageEditController.prototype._showPage =
function(id) {
	var notebookController = this._app.getNotebookController();
	if (notebookController.getCurrentView()) {
		var cache = this._app.getNotebookCache();
		var page = cache.getPageById(id);
		notebookController.gotoPage(page);
	}
};

ZmPageEditController.prototype._saveResponseHandler =
function(content, response) {
	var saveResp = response._data && response._data.SaveWikiResponse;
	if (saveResp) {
		var data = saveResp.w[0];
		if (!this._page.id) {
			this._page.set(data);
		}
		else {
			this._page.version = data.ver;
		}
	}

	// Update the cache if the page name changed.
	var cache = this._app.getNotebookCache();
	var cachedPage = cache.getPageById(this._page.id);
	if (cachedPage && (cachedPage.name != this._page.name)) {
		cache.renamePage(cachedPage, this._page.name);
	}

	this._pageEditView.pageSaved(content);
	appCtxt.setStatusMsg(ZmMsg.pageSaved);

	var popViewWhenSaved = this._popViewWhenSaved;

	var saveResp = response._data && response._data.SaveWikiResponse;
	var wiki = saveResp && saveResp.w && saveResp.w[0];
	var isRemote = /:/.test(wiki.id);
	if (isRemote) {
		wiki.l = this._page.folderId;
		wiki.name = this._page.name;
	}

	//Temporary Fix: currently we don't get notification header for
	//operations on remote folder, this fix will avoid some nasty bugs
	var item = cache.getItemInfo({id:this._page.id},true);
	cache.putPage(item);
	var pageEditor = this._pageEditView.getPageEditor();
	pageEditor.setFooterInfo(item);

	var nbController = this._app.getNotebookController();
	var vPage = nbController.getPage();
	if (vPage && (vPage.id == item.id)) {
		nbController._object = item;
	}

	if (popViewWhenSaved) {
		this._popViewWhenSaved = false;

		// NOTE: Need to let this call stack return and process the notifications.
		if (!isRemote) {
			var args = [ wiki.id ];
			var action = new AjxTimedAction(this, this._saveResponseHandlerShowNote, args);
			AjxTimedAction.scheduleAction(action, 0);
		}
		// NOTE: We don't get create notifications for remote items, so we force
		// it to load and display.
		else {
			var args = [ wiki.id ];
			var callback = new AjxCallback(this, this._saveResponseHandlerShowNote, args);
			page.load(null, callback);
		}
	}
};

ZmPageEditController.prototype._saveResponseHandlerShowNote =
function(id) {
	this._showPage(id);
	appCtxt.getAppViewMgr().showPendingView(true);
};

ZmPageEditController.prototype._saveErrorResponseHandler =
function(content, response) {
	var code = response.code;
	if (code == ZmCsfeException.MAIL_ALREADY_EXISTS ||
		code == ZmCsfeException.MODIFY_CONFLICT) {
		var data = response.data;
		var conflict = {
			page: this._page,
			id: data["id"][0],
			version: data["ver"][0]
		};

		var dialog = appCtxt.getPageConflictDialog();
		var conflictCallback = new AjxCallback(this, this._saveConflictHandler, [content]);
		dialog.popup(conflict, conflictCallback);

		// tell app we've handled the error
		return true;
	}

	// let app handle other kinds of errors
	return false;
};

ZmPageEditController.prototype._saveConflictHandler =
function(content, mineOrTheirs, conflict) {
	if (mineOrTheirs == ZmPageConflictDialog.KEEP_MINE) {
		var page = conflict.page;
		page.id = ZmItem.getItemId(conflict.id);
		page.version = conflict.version;
		var saveCallback = new AjxCallback(this, this._saveResponseHandler, [content]);
		var saveErrorCallback = new AjxCallback(this, this._saveErrorResponseHandler, [content]);
		page.save(saveCallback, saveErrorCallback);
	}
};

ZmPageEditController.prototype._closeListener =
function(ev) {
    var treeController = appCtxt.getOverviewController().getTreeController(ZmOrganizer.NOTEBOOK);
    var treeView = treeController.getTreeView(this._app.getOverviewId());
    var selNotebook = treeView.getSelected();

    treeController._itemClicked(selNotebook);

};

ZmPageEditController.prototype._notifyListener =
function(ev){
    var folderNotifyDlg = appCtxt.getFolderNotifyDialog();
    folderNotifyDlg.popup(this.getPage().getNotebook());
};

ZmPageEditController.prototype._spellCheckListener =
function(ev) {
	var toolbar = this._toolbar[this._currentView];
	var spellCheckButton = toolbar.getButton(ZmOperation.SPELL_CHECK);
	var pageEditor = this._pageEditView.getPageEditor();

	if (spellCheckButton.isToggled()) {
		var callback = new AjxCallback(this, this.toggleSpellCheckButton);
		if (!pageEditor.spellCheck(callback)) {
			this.toggleSpellCheckButton(false);
		}
	} else {
		pageEditor.discardMisspelledWords();
	}
};
ZmPageEditController.prototype.toggleSpellCheckButton =
function(selected) {
	var toolbar = this._toolbar[this._currentView];
	var spellCheckButton = toolbar.getButton(ZmOperation.SPELL_CHECK);
	if (spellCheckButton) {
		spellCheckButton.setSelected((selected || false));
	}
};

ZmPageEditController.prototype._formatListener =
function(ev) {
	// popup menu
	var op = ev.item.getData(ZmOperation.KEY_ID);
	if (op == ZmOperation.COMPOSE_FORMAT) {
		var toolbar = this._toolbar[this._currentView];
		var button = toolbar.getButton(ZmOperation.COMPOSE_FORMAT);
		button.popup();
		return;
	}

	// ignore de-selection
	if (!ev.item.getChecked()) {
		return;
	}

	// handle selection
	var content = this._pageEditView.getContent();
	this._format = ev.item.getData(ZmPageEditor.KEY_FORMAT);
	this._pageEditView.setFormat(this._format);
	this._pageEditView.setContent(content);
};

ZmPageEditController.prototype._preHideCallback =
function(view, force) {
	ZmController.prototype._preHideCallback.call(this);

	if (!this._pageEditView.isDirty() || force) {
		var notebookController = this._app.getNotebookController();
		if (notebookController.isIframeEnabled()) {
			notebookController.refreshCurrentPage();
		} else {
			this._showCurrentPage();
		}
		return true;
	}

	var ps = this._popShield = appCtxt.getYesNoCancelMsgDialog();
	ps.reset();
	ps.setMessage(ZmMsg.askToSave, DwtMessageDialog.WARNING_STYLE);
	ps.registerCallback(DwtDialog.YES_BUTTON, this._popShieldYesCallback, this);
	ps.registerCallback(DwtDialog.NO_BUTTON, this._popShieldNoCallback, this);
	ps.registerCallback(DwtDialog.CANCEL_BUTTON, this._popShieldDismissCallback, this);
	ps.popup(this._pageEditView._getDialogXY());
	return false;
};

ZmPageEditController.prototype._preUnloadCallback =
function(view) {
	return !this._pageEditView.isDirty();
};

ZmPageEditController.prototype._popShieldYesCallback =
function() {
	this._popShield.popdown();
	if (this._doSave()) {
		appCtxt.getAppViewMgr().showPendingView(true);
	}
};

ZmPageEditController.prototype._popShieldNoCallback =
function() {
	this._popShield.popdown();
	appCtxt.getAppViewMgr().showPendingView(true);
};

ZmPageEditController.prototype._popShieldDismissCallback =
function() {
	this._popShield.popdown();
	appCtxt.getAppViewMgr().showPendingView(false);
};

ZmPageEditController.prototype.updatePageInfo =
function(page){
	this._pageEditView.getPageEditor().setFooterInfo(page);
};
