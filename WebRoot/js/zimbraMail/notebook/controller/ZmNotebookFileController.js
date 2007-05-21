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

/**
* @param appCtxt		app context
* @param container		containing shell
* @param app			containing app
*/
ZmNotebookFileController = function(appCtxt, container, app) {
	ZmNotebookController.call(this, appCtxt, container, app);

	this._dragSrc = new DwtDragSource(Dwt.DND_DROP_MOVE);
	this._dragSrc.addDragListener(new AjxListener(this, this._dragListener));

	this._listeners[ZmOperation.UNDELETE] = new AjxListener(this, this._undeleteListener);
}

ZmNotebookFileController.prototype = new ZmNotebookController;
ZmNotebookFileController.prototype.constructor = ZmNotebookFileController;

ZmNotebookFileController.prototype.toString = function() {
	return "ZmNotebookFileController";
};

// Public methods

ZmNotebookFileController.prototype.show = function(searchResults, fromUserSearch) {
	ZmListController.prototype.show.call(this, searchResults);

	this._fromSearch = fromUserSearch;
	this._currentView = ZmController.NOTEBOOK_FILE_VIEW;
	this._setup(this._currentView);

	this._list = searchResults.getResults(ZmItem.MIXED);
	if (this._activeSearch) {
		if (this._list)
			this._list.setHasMore(this._activeSearch.getAttribute("more"));

		var newOffset = parseInt(this._activeSearch.getAttribute("offset"));
		if (this._listView[this._currentView])
			this._listView[this._currentView].setOffset(newOffset);
	}

	var elements = new Object();
	elements[ZmAppViewMgr.C_TOOLBAR_TOP] = this._toolbar[this._currentView];
	elements[ZmAppViewMgr.C_APP_CONTENT] = this._listView[this._currentView];
	this._setView(this._currentView, elements, true);
	this._resetNavToolBarButtons(this._currentView);

	// always set the selection to the first item in the list
	var list = this._listView[this._currentView].getList();
	if (list && list.size() > 0) {
		this._listView[this._currentView].setSelection(list.get(0));
	}

	// reset the filter drop down per type of results returned
	/*** TODO
	var op = ZmOperation.SHOW_ALL_ITEM_TYPES;
	if (searchResults.type == ZmItem.CONV || searchResults.type == ZmItem.MSG) {
		op = ZmOperation.SHOW_ONLY_MAIL;
	} else if (searchResults.type == ZmItem.CONTACT) {
		op = ZmOperation.SHOW_ONLY_CONTACTS;
	}
	this._setFilterButtonProps(op, true);
	/***/
};

// Resets the available options on a toolbar or action menu.
ZmNotebookFileController.prototype._resetOperations =
function(parent, num) {
	ZmListController.prototype._resetOperations.call(this, parent, num);
	/***
	parent.enable(ZmOperation.SHOW_ALL_MENU, true);
	/***/

	var toolbar = this._toolbar[this._currentView];
	var buttonIds = [ ZmOperation.SEND, ZmOperation.DETACH ];
	toolbar.enable(buttonIds, true);
};


// Private and protected methods

ZmNotebookFileController.prototype._getToolBarOps = function() {
	var list = [];
	// shared items
	list.push(
		ZmOperation.NEW_MENU, /*ZmOperation.REFRESH,*/ ZmOperation.EDIT,
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
		//ZmOperation.SEP,
		//ZmOperation.ATTACHMENT,
		ZmOperation.FILLER,
		ZmOperation.SEND_PAGE,
		ZmOperation.SEP,
		ZmOperation.DETACH
	);
	return list;
};

ZmNotebookFileController.prototype._initializeToolBar =
function(view) {
	if (this._toolbar[view]) return;

	ZmNotebookController.prototype._initializeToolBar.call(this, view);
	this._toolbar[view].addFiller();

	var tb = new ZmNavToolBar(this._toolbar[view], DwtControl.STATIC_STYLE, null, ZmNavToolBar.SINGLE_ARROWS, true);
	this._setNavToolBar(tb, view);

	this._setNewButtonProps(view, ZmMsg.compose, "NewPage", "NewPageDis", ZmOperation.NEW_PAGE);

	var toolbar = this._toolbar[view];
	var button = toolbar.getButton(ZmOperation.EDIT);
	button.setEnabled(false);

	/*** TODO
	var button = this._toolbar[view].getButton(ZmOperation.SHOW_ALL_MENU);
	var menu = new ZmPopupMenu(button);
	button.setMenu(menu);
	button.noMenuBar = true;
	var ops = [ZmOperation.SHOW_ALL_ITEM_TYPES, ZmOperation.SEP, ZmOperation.SHOW_ONLY_CONTACTS, ZmOperation.SHOW_ONLY_MAIL];
	var listener = new AjxListener(this, this._showAllListener);
	for (var i = 0; i < ops.length; i++) {
		var op = ops[i];
		if (op == ZmOperation.SEP) {
			menu.createSeparator();
			continue;
		}
		var icon = ZmOperation.getProp(op, "image");
		var text = ZmMsg[ZmOperation.getProp(op, "textKey")];
		var mi = menu.createMenuItem(op, {image:icon, text:text, style:DwtMenuItem.RADIO_STYLE}, 1);
		mi.setData(ZmOperation.KEY_ID, op);
		mi.addSelectionListener(listener);
	}
	/***/
};

ZmNotebookFileController.prototype._initializeActionMenu =
function() {
	ZmListController.prototype._initializeActionMenu.call(this);

	// based on current search, show/hide undelete menu option
	var showUndelete = false;
	var folderId = this._activeSearch ? this._activeSearch.search.folderId : null;
	if (folderId) {
		var folder = this._appCtxt.getById(folderId);
		showUndelete = folder && folder.isInTrash();
	}
	var actionMenu = this._actionMenu;
	var mi = actionMenu.getMenuItem(ZmOperation.UNDELETE);
	mi.setVisible(showUndelete);
};

ZmNotebookFileController.prototype._getActionMenuOps =
function() {
	var list = this._standardActionMenuOps();
	list.push(ZmOperation.UNDELETE);
	return list;
};

ZmNotebookFileController.prototype._getViewType =
function() {
	return ZmController.NOTEBOOK_FILE_VIEW;
};

ZmNotebookFileController.prototype._getItemType =
function() {
	return ZmItem.PAGE;
};

ZmNotebookFileController.prototype._createNewView =
function(viewType) {
	var parent = this._container;
	var className = null;
	var posStyle = Dwt.ABSOLUTE_STYLE;
	var mode = null; // ???
	var controller = this;
	var dropTgt = this._dropTgt;
	var result = new ZmFileListView(parent, className, posStyle, mode, controller, dropTgt);
	result.setDragSource(this._dragSrc);
	return result;
};

ZmNotebookFileController.prototype._getTagMenuMsg =
function(num) {
	return (num == 1) ? ZmMsg.tagItem : ZmMsg.tagItems;
};

ZmNotebookFileController.prototype._getMoveDialogTitle =
function(num) {
	return (num == 1) ? ZmMsg.moveItem : ZmMsg.moveItems;
};

ZmNotebookFileController.prototype._setViewContents =
function(view) {
	this._listView[view].set(this._list);
};

ZmNotebookFileController.prototype._setFilterButtonProps =
function(op, setChecked) {
	var icon = ZmOperation.getProp(op, "image");
	var text = ZmMsg[ZmOperation.getProp(op, "textKey")];
	var button = this._toolbar[this._currentView].getButton(ZmOperation.SHOW_ALL_MENU);
	button.setImage(icon);
	button.setText(text);
	if (setChecked)
		button.getMenu().checkItem(ZmOperation.KEY_ID, op, true);
};


// List listeners

ZmNotebookFileController.prototype._editListener = function(event) {
	var pageEditController = this._app.getPageEditController();
	var page = this._listView[this._currentView].getSelection()[0];
	pageEditController.show(page);
};
ZmNotebookFileController.prototype._resetOperations =
function(toolbarOrActionMenu, num) {
	if (!toolbarOrActionMenu) return;
	ZmNotebookController.prototype._resetOperations.call(this, toolbarOrActionMenu, num);

	var selection = this._listView[this._currentView].getSelection();

	var buttons = [ZmOperation.TAG_MENU, ZmOperation.DELETE];
	var enabled = selection.length > 0;
	toolbarOrActionMenu.enable(buttons, enabled);

	var buttons = [ZmOperation.EDIT];
	var enabled = selection.length == 1 && selection[0].type == ZmItem.PAGE;
	toolbarOrActionMenu.enable(buttons, enabled);
};

// Double click displays an item.
ZmNotebookFileController.prototype._listSelectionListener =
function(ev) {
	ZmListController.prototype._listSelectionListener.call(this, ev);
	if (ev.detail == DwtListView.ITEM_DBL_CLICKED) {
		this._doSelectDblClicked(ev.item);
	}
};
ZmNotebookFileController.prototype._doSelectDblClicked = function(item, fromSearch) {
	item.type = item instanceof ZmPage ? ZmItem.PAGE : ZmItem.DOCUMENT;
	if (item.type == ZmItem.PAGE) {
		var controller = this._app.getNotebookController();
		controller.show(item, true, this._fromSearch || fromSearch);
	}
	else if (item.type == ZmItem.DOCUMENT) {
		var url = item.getRestUrl();
		// TODO: popup window w/ REST URL
		var win = open(url, "_new", "");
	}
};

ZmNotebookFileController.prototype._listActionListener =
function(ev) {
	ZmListController.prototype._listActionListener.call(this, ev);
	var actionMenu = this.getActionMenu();
	actionMenu.popup(0, ev.docX, ev.docY);
	if (ev.ersatz) {
		// menu popped up via keyboard nav
		actionMenu.setSelectedItem(0);
	}
};

ZmNotebookFileController.prototype._undeleteListener =
function(ev) {
	var items = this._listView[this._currentView].getSelection();

	/*** TODO
	// figure out the default for this item should be moved to
	var folder = null;
	if (items[0] instanceof ZmContact) {
		folder = new ZmFolder({id: ZmOrganizer.ID_ADDRBOOK});
	} else if (items[0] instanceof ZmAppt) {
		folder = new ZmFolder({id: ZmOrganizer.ID_CALENDAR});
	} else {
		var folderId = items[0].isDraft ? ZmFolder.ID_DRAFTS : ZmFolder.ID_INBOX;
		folder = this._appCtxt.getById(folderId);
	}

	if (folder)
		this._doMove(items, folder);
	/***/
};

ZmNotebookFileController.prototype._showAllListener =
function(ev) {
	if (!ev.item.getChecked()) return;

	/*** TODO
	var op = ev.item.getData(ZmOperation.KEY_ID);
	this._setFilterButtonProps(op);

	var searchFor = null;
	if (op == ZmOperation.SHOW_ONLY_CONTACTS) {
		searchFor = ZmItem.CONTACT;
	} else if (op == ZmOperation.SHOW_ONLY_MAIL) {
		searchFor = ZmSearchToolBar.FOR_MAIL_MI;
	} else {
		searchFor = ZmSearchToolBar.FOR_ANY_MI;
	}

	var sc = this._appCtxt.getSearchController();
	var types = sc.getTypes(searchFor);
	sc.redoSearch(this._appCtxt.getCurrentSearch(), null, {types:types, offset:0});
	/***/
};