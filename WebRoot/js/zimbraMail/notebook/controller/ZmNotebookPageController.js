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

function ZmNotebookPageController(appCtxt, container, app) {
	ZmNotebookController.call(this, appCtxt, container, app);

	this._listeners[ZmOperation.PAGE_BACK] = new AjxListener(this, this._pageBackListener);
	this._listeners[ZmOperation.PAGE_DBL_BACK] = new AjxListener(this, this._homeListener);
	this._listeners[ZmOperation.PAGE_FORWARD] = new AjxListener(this, this._pageForwardListener);

	this._history = [];
}
ZmNotebookPageController.prototype = new ZmNotebookController;
ZmNotebookPageController.prototype.constructor = ZmNotebookPageController;

ZmNotebookPageController.prototype.toString = function() {
	return "ZmNotebookPageController";
};

// Data

ZmNotebookPageController.prototype._object;
ZmNotebookPageController.prototype._folderId;

ZmNotebookPageController.prototype._place = -1;
ZmNotebookPageController.prototype._history;

//
// Public methods
//

// page

ZmNotebookPageController.prototype.gotoPage = function(pageRef) {
	this._enableNaviButtons();

	var cache = this._app.getNotebookCache();
	var page = cache.getPageByName(pageRef.folderId, pageRef.name);
	this._listView[this._currentView].set(this._object = page);
};

ZmNotebookPageController.prototype.getPage = function() {
	return this._object;
};

// view management

ZmNotebookPageController.prototype.show = function(pageOrFolderId, force, fromSearch) {
	if (/*force ||*/ !(pageOrFolderId instanceof ZmPage)) {
		this._showIndex(pageOrFolderId || ZmPage.DEFAULT_FOLDER);
		return;
	}

	// save state
	this._fromSearch = fromSearch;

	var shownPage = this._object;
	var currentPage = pageOrFolderId;
	this._object = currentPage;

	// switch view
	var view = this._currentView;
	if (!view) {
		view = this._defaultView();
		force = true;
	}
	this.switchView(view, force);

	// are we already showing this note?
	if (shownPage && shownPage.name == currentPage.name &&
		shownPage.folderId == currentPage.folderId) {
		return;
	}

	// update history
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
	this._enableNaviButtons();

	// REVISIT: Need to do proper list management! For now we fake
	//          a list of a single item so that operations like
	//          tagging and delete work.
	this._list = new ZmList(ZmItem.PAGE, this._appCtxt);
	if (this._object) {
		this._list.add(this._object);
	}

	// show this page
	this._listView[this._currentView].set(this._object);
};

//
// Protected methods
//

// initialization

ZmNotebookPageController.prototype._getNaviToolBarOps = function() {
	var list = ZmNotebookController.prototype._getNaviToolBarOps.call(this);
	list = list.concat(
		ZmOperation.SEP,
		ZmOperation.PAGE_BACK, ZmOperation.PAGE_DBL_BACK, ZmOperation.PAGE_FORWARD,
		ZmOperation.CLOSE
	);
	return list;
};
ZmNotebookPageController.prototype._initializeToolBar = function(view) {
	ZmNotebookController.prototype._initializeToolBar.call(this, view);

	var toolbar = this._toolbar[this._currentView];
	var button = toolbar.getButton(ZmOperation.CLOSE);
	button.setVisible(this._fromSearch);

	var button = toolbar.getButton(ZmOperation.PAGE_BACK);
	button.setToolTipContent("");

	var button = toolbar.getButton(ZmOperation.PAGE_DBL_BACK);
	button.setImage("UpArrow");
	button.setDisabledImage("UpArrowDis");
	button.setToolTipContent("");

	var button = toolbar.getButton(ZmOperation.PAGE_FORWARD);
	button.setToolTipContent("");
};

ZmNotebookPageController.prototype._resetOperations =
function(toolbarOrActionMenu, num) {
	if (!toolbarOrActionMenu) return;
	ZmNotebookController.prototype._resetOperations.call(this, toolbarOrActionMenu, num);
	if (toolbarOrActionMenu instanceof ZmToolBar) {
		this._enableNaviButtons();
	}
};

ZmNotebookPageController.prototype._enableNaviButtons = function() {
	var enabled = this._currentView == ZmController.NOTEBOOK_PAGE_VIEW;

	var toolbar = this._toolbar[this._currentView];
	var button = toolbar.getButton(ZmOperation.PAGE_BACK);
	button.setEnabled(enabled && this._place > 0);
	ZmNotebookPageController.__setButtonToolTip(this._appCtxt, button, this._history[this._place - 1]);

	var button = toolbar.getButton(ZmOperation.PAGE_DBL_BACK);
	button.setEnabled(enabled && this._place > 0);
	ZmNotebookPageController.__setButtonToolTip(this._appCtxt, button, this._history[0]);

	var button = toolbar.getButton(ZmOperation.PAGE_FORWARD);
	button.setEnabled(enabled && this._place + 1 < this._history.length);
	ZmNotebookPageController.__setButtonToolTip(this._appCtxt, button, this._history[this._place + 1]);
};

// listeners

ZmNotebookPageController.prototype._pageBackListener = function(event) {
	if (this._place > 0) {
		this.gotoPage(this._history[--this._place]);
	}
};
ZmNotebookPageController.prototype._homeListener = function(event) {
	if (this._place > 0) {
		this.gotoPage(this._history[this._place = 0]);
	}
};
ZmNotebookPageController.prototype._pageForwardListener = function(event) {
	if (this._place + 1 < this._history.length) {
		this.gotoPage(this._history[++this._place]);
	}
};

ZmNotebookPageController.prototype._dropListener =
function(ev) {
	// only tags can be dropped on us
	if (ev.action == DwtDropEvent.DRAG_ENTER) {
		ev.doIt = true;
	} else if (ev.action == DwtDropEvent.DRAG_DROP) {
		var tag = ev.srcData;
		this._doTag([this._object], tag, true);
	}
};

// notebook page view

ZmNotebookPageController.prototype._showIndex = function(folderId) {
	var cache = this._app.getNotebookCache();
	var index = cache.getPageByName(folderId, ZmNotebook.PAGE_INDEX, true);
	this.show(index);
};

//
// Private functions
//

ZmNotebookPageController.__setButtonToolTip = function(appCtxt, button, pageRef) {
	var text = pageRef ? pageRef.name : "";
	if (text == ZmNotebook.PAGE_INDEX) {
		var notebook = appCtxt.getTree(ZmOrganizer.NOTEBOOK).getById(pageRef.folderId);
		if (notebook) {
			text = notebook.getName();
		}
		else {
			/*** REVISIT ***/
			// Get the remote notebook name. Or save the remote name in the pageRef.
		}
	}
	button.setToolTipContent(text);
};
