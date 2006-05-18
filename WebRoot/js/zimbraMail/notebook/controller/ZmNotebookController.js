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
 * Portions created by Zimbra are Copyright (C) 2005 Zimbra, Inc.
 * All Rights Reserved.
 * 
 * Contributor(s):
 * 
 * ***** END LICENSE BLOCK *****
 */

function ZmNotebookController(appCtxt, container, app) {
	ZmListController.call(this, appCtxt, container, app);

	this._listeners[ZmOperation.REFRESH] = new AjxListener(this, this._refreshListener);
	this._listeners[ZmOperation.EDIT] = new AjxListener(this, this._editListener);
	this._listeners[ZmOperation.ATTACHMENT] = new AjxListener(this, this._uploadListener);
	this._listeners[ZmOperation.SEND_PAGE] = new AjxListener(this, this._sendPageListener);
	this._listeners[ZmOperation.DETACH] = new AjxListener(this, this._detachListener);
	this._listeners[ZmOperation.PAGE_BACK] = new AjxListener(this, this._pageBackListener);
	this._listeners[ZmOperation.PAGE_DBL_BACK] = new AjxListener(this, this._homeListener);
	this._listeners[ZmOperation.PAGE_FORWARD] = new AjxListener(this, this._pageForwardListener);
	
	this._history = [];
}
ZmNotebookController.prototype = new ZmListController;
ZmNotebookController.prototype.constructor = ZmNotebookController;

ZmNotebookController.prototype.toString = function() {
	return "ZmNotebookController";
};

// Constants

ZmNotebookController._VIEWS = {};
ZmNotebookController._VIEWS[ZmController.NOTEBOOK_PAGE_VIEW] = ZmNotebookPageView;
ZmNotebookController._VIEWS[ZmController.NOTEBOOK_FILE_VIEW] = ZmPageEditView;

// Data

ZmNotebookController.prototype._object;
ZmNotebookController.prototype._folderId;

ZmNotebookController.prototype._place = -1;
ZmNotebookController.prototype._history;

//
// Public methods
//

// page

ZmNotebookController.prototype.gotoPage = function(pageRef) {
	this._enableNaviButtons();

	var cache = this._app.getNotebookCache();
	var page = cache.getPageByName(pageRef.folderId, pageRef.name);
	this._listView[this._currentView].set(this._object = page);
};

ZmNotebookController.prototype.getPage = function() {
	return this._object;
};

// view management

ZmNotebookController.prototype.show = function(pageOrFolderId, force) {
	if (force || !(pageOrFolderId instanceof ZmPage)) {
		this._showIndex(pageOrFolderId || ZmPage.DEFAULT_FOLDER);
		return;
	}

	// are we already showing this note?
	var shownPage = this._object;
	var currentPage = pageOrFolderId;
	if (shownPage && shownPage.name == currentPage.name && 
		shownPage.folderId == currentPage.folderId) {
		return;
	}

	// update history
	this._object = currentPage;
	this._folderId = null;
	if (this._object) {
		this._folderId = this._object.folderId;
		for (var i = this._place + 1; i < this._history.length; i++) {
			this._history[i] = null;
		}
		this._history.length = ++this._place;
		var pageRef = { folderId: this._object.folderId, name: this._object.name };
		this._history[this._place] = pageRef;
	}
	
	// REVISIT: Need to do proper list management! For now we fake
	//          a list of a single item so that operations like
	//          tagging and delete work.
	this._list = new ZmList(ZmItem.PAGE, this._appCtxt);
	if (this._object) {
		this._list.add(this._object);
	}
	
	// switch view
	var view = this._currentView;
	if (!view) {
		view = this._defaultView();
		force = true;
	}
	this.switchView(view, force);

	// show this page
	this._listView[this._currentView].set(this._object);
};

ZmNotebookController.prototype.switchView = function(view, force) {
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
	Dwt.setTitle(this.getCurrentView().getTitle());
};

//
// Protected methods
//

// initialization

ZmNotebookController.prototype._getToolBarOps = function() {
	var list = [];
	// shared items
	list.push(
		ZmOperation.NEW_MENU, ZmOperation.REFRESH, ZmOperation.EDIT,
		ZmOperation.SEP
	);
	if (this._appCtxt.get(ZmSetting.TAGGING_ENABLED))
		list.push(ZmOperation.TAG_MENU, ZmOperation.SEP);
	/***
	if (this._appCtxt.get(ZmSetting.PRINT_ENABLED))
		list.push(ZmOperation.PRINT);
	/***/
	list.push(
		ZmOperation.DELETE,
		ZmOperation.SEP,
		ZmOperation.ATTACHMENT,
		ZmOperation.FILLER,
		ZmOperation.SEND_PAGE,
		ZmOperation.SEP,
		ZmOperation.DETACH
	);
	// NOTE_VIEW items
	list.push(
		ZmOperation.SEP,
		ZmOperation.PAGE_BACK, ZmOperation.PAGE_DBL_BACK, ZmOperation.PAGE_FORWARD
	);
	return list;
};
ZmNotebookController.prototype._initializeToolBar = function(view) {
	ZmListController.prototype._initializeToolBar.call(this, view);

	this._setNewButtonProps(view, ZmMsg.createNewPage, "NewPage", "NewPageDis", ZmOperation.NEW_PAGE);

	var toolbar = this._toolbar[this._currentView];
	var button = toolbar.getButton(ZmOperation.REFRESH);
	button.setImage("SendReceive");
	button.setDisabledImage("SendReceiveDis");

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

ZmNotebookController.prototype._resetOperations = function(toolbarOrActionMenu, num) {
	if (!toolbarOrActionMenu) return;
	ZmListController.prototype._resetOperations.call(this, toolbarOrActionMenu, num);
	toolbarOrActionMenu.enable([ZmOperation.REFRESH, ZmOperation.ATTACHMENT], true);
	//toolbarOrActionMenu.enable(ZmOperation.DETACH, false);
	if (toolbarOrActionMenu instanceof ZmToolBar) {
		this._enableNaviButtons();
	}
};

ZmNotebookController.prototype._getTagMenuMsg = function() {
	return ZmMsg.tagPage;
};

ZmNotebookController.prototype._doDelete = function(items) {
	var ids = ZmNotebookController.__itemize(items);
	if (!ids) return;
	
	var soapDoc = AjxSoapDoc.create("ItemActionRequest", "urn:zimbraMail");
	var actionNode = soapDoc.set("action");
	actionNode.setAttribute("id", ids);
	actionNode.setAttribute("op", "delete");
	
	var responseHandler = this._current == ZmController.NOTEBOOK_PAGE_VIEW ? this._listeners[ZmOperation.PAGE_BACK] : null;
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

ZmNotebookController.prototype._getViewType = function() {
	return this._currentView;
};

ZmNotebookController.prototype._defaultView = function() {
	return ZmController.NOTEBOOK_PAGE_VIEW;
};

ZmNotebookController.prototype._createNewView = function(view) {
	if (!this._listView[view]) {
		var viewCtor = ZmNotebookController._VIEWS[view];
		this._listView[view] = new viewCtor(this._container, this._appCtxt, this); 
	}
	return this._listView[view];
};

ZmNotebookController.prototype._setViewContents = function(view) {
	this._listView[view].set(this._object);
};

/*** REVISIT: This will be exposed later.
ZmNotebookController.prototype._setViewMenu = function(view) {
	var appToolbar = this._appCtxt.getCurrentAppToolbar();
	var menu = appToolbar.getViewMenu(view);
	if (!menu) {
		var listener = this._listeners[ZmOperation.VIEW];
		
		menu = new ZmPopupMenu(appToolbar.getViewButton());

		var item = menu.createMenuItem(ZmNotebookApp.NOTEBOOK, "Page", ZmMsg.notebookPageView, null, true, DwtMenuItem.RADIO_STYLE);
		item.setData(ZmOperation.MENUITEM_ID, ZmController.NOTEBOOK_PAGE_VIEW);
		item.addSelectionListener(listener);
		
		var item = menu.createMenuItem(ZmNotebookApp.FILE, "Folder", ZmMsg.notebookFileView, null, true, DwtMenuItem.RADIO_STYLE);
		item.setData(ZmOperation.MENUITEM_ID, ZmController.NOTEBOOK_FILE_VIEW);
		item.addSelectionListener(listener);
	}

	var item = menu.getItemById(ZmOperation.MENUITEM_ID, view);
	item.setChecked(true, true);

	appToolbar.setViewMenu(view, menu);
};
/***/

ZmNotebookController.prototype._enableNaviButtons = function() {
	var enabled = this._currentView == ZmController.NOTEBOOK_PAGE_VIEW;

	var toolbar = this._toolbar[this._currentView];
	var button = toolbar.getButton(ZmOperation.PAGE_BACK);
	button.setEnabled(enabled && this._place > 0);
	ZmNotebookController.__setButtonToolTip(button, this._history[this._place - 1]);
	
	var button = toolbar.getButton(ZmOperation.PAGE_DBL_BACK);
	button.setEnabled(enabled && this._place > 0);
	ZmNotebookController.__setButtonToolTip(button, this._history[0]);

	var button = toolbar.getButton(ZmOperation.PAGE_FORWARD);
	button.setEnabled(enabled && this._place + 1 < this._history.length);
	ZmNotebookController.__setButtonToolTip(button, this._history[this._place + 1]);
};

// listeners

ZmNotebookController.prototype._refreshListener = function(event) {
	var pageRef = this._history[this._place];
	if (pageRef) {
		if (this._place == 0) {
			this._showIndex(pageRef.folderId);
		}
		else {
			var cache = this._app.getNotebookCache();
			var page = cache.getPageByName(pageRef.folderId, pageRef.name);
			page.load();
			this._listView[this._currentView].set(page);
		}
	}
};

ZmNotebookController.prototype._editListener = function(event) {
	var pageEditController = this._app.getPageEditController();
	var page = this._listView[this._currentView].getSelection();
	pageEditController.show(page);
};

ZmNotebookController.prototype._uploadListener = function(event) {
	var dialog = this._appCtxt.getUploadDialog();
	dialog.setFolderId(this._folderId || ZmPage.DEFAULT_FOLDER);
	dialog.popup();
};

ZmNotebookController.prototype._sendPageListener = function(event) {
	var view = this._listView[this._currentView];
	var page = view.getSelection();
	var url = page.getUrl();

	var app = this._appCtxt.getApp(ZmZimbraMail.MAIL_APP);
	var controller = app.getComposeController();

	var content = "<wiklet class='NAME'/>";

	var action = ZmOperation.NEW_MESSAGE;
	var inNewWindow = this._appCtxt.get(ZmSetting.NEW_WINDOW_COMPOSE);
	var msg = new ZmMailMsg(this._appCtxt);
	var toOverride = null;
	var subjOverride = ZmWikletProcessor.process(this._appCtxt, page, content);
	var extraBodyText = url;

	controller.doAction(action, inNewWindow, msg, toOverride, subjOverride, extraBodyText);
};

ZmNotebookController.prototype._detachListener = function(event) {
	var view = this._listView[this._currentView];
	var page = view.getSelection();

	var winurl = page.getUrl();
	var winname = "newwin"+Math.random();
	var winfeatures = [
		"width=",(window.outerWidth || 640),",",
		"height=",(window.outerHeight || 480),",",
		"location,menubar,",
		"resizable,scrollbars,status,toolbar"
	].join("");
	
	var win = open(winurl, winname, winfeatures);
};


ZmNotebookController.prototype._pageBackListener = function(event) {
	if (this._place > 0) {
		this.gotoPage(this._history[--this._place]);
	}
};
ZmNotebookController.prototype._homeListener = function(event) {
	if (this._place > 0) {
		this.gotoPage(this._history[this._place = 0]);
	}
};
ZmNotebookController.prototype._pageForwardListener = function(event) {
	if (this._place + 1 < this._history.length) {
		this.gotoPage(this._history[++this._place]);
	}
};

// notebook page view

ZmNotebookController.prototype._showIndex = function(folderId) {
	var cache = this._app.getNotebookCache();
	var index = cache.getPageByName(folderId, ZmNotebook.PAGE_INDEX, true);
	this.show(index);
};

//
// Private functions
//

ZmNotebookController.__setButtonToolTip = function(button, pageRef) {
	var text = pageRef ? pageRef.name : "";
	button.setToolTipContent(text);
};

ZmNotebookController.__itemize = function(objects) {
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
