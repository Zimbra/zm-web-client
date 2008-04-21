/*
 * ***** BEGIN LICENSE BLOCK *****
 * 
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2005, 2006, 2007 Zimbra, Inc.
 * 
 * The contents of this file are subject to the Yahoo! Public License
 * Version 1.0 ("License"); you may not use this file except in
 * compliance with the License.  You may obtain a copy of the License at
 * http://www.zimbra.com/license.
 * 
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * 
 * ***** END LICENSE BLOCK *****
 */

/**
 * Creates an empty mixed view controller.
 * @constructor
 * @class
 * This class manages a view of heterogeneous items.
 *
 * @author Conrad Damon
 * 
 * @param container		containing shell
 * @param mixedApp		containing app
 */
ZmMixedController = function(container, mixedApp) {

	ZmMailListController.call(this, container, mixedApp);

	this._dragSrc = new DwtDragSource(Dwt.DND_DROP_MOVE);
	this._dragSrc.addDragListener(new AjxListener(this, this._dragListener));
	
	this._listeners[ZmOperation.UNDELETE] = new AjxListener(this, this._undeleteListener);
};

ZmMixedController.prototype = new ZmMailListController;
ZmMixedController.prototype.constructor = ZmMixedController;

ZmMixedController.prototype.toString = 
function() {
	return "ZmMixedController";
};

// Public methods

ZmMixedController.prototype.show =
function(searchResults) {
	ZmListController.prototype.show.call(this, searchResults);
	
	this._setup(this._currentView);

	this._list = searchResults.getResults(ZmItem.MIXED);
	var lv = this._listView[this._currentView];
	if (this._activeSearch) {
		if (this._list) {
			this._list.setHasMore(this._activeSearch.getAttribute("more"));
		}
		if (lv) {
			lv.offset = parseInt(this._activeSearch.getAttribute("offset"));;
		}
	}

	var elements = {};
	elements[ZmAppViewMgr.C_TOOLBAR_TOP] = this._toolbar[this._currentView];
	elements[ZmAppViewMgr.C_APP_CONTENT] = lv;
	this._setView(this._currentView, elements, true);
	this._resetNavToolBarButtons(this._currentView);

	// always set the selection to the first item in the list
	var list = lv.getList();
	if (list && list.size() > 0) {
		lv.setSelection(list.get(0));
	}
};

// Resets the available options on a toolbar or action menu.
ZmMixedController.prototype._resetOperations =
function(parent, num) {
	ZmListController.prototype._resetOperations.call(this, parent, num);
	parent.enable(ZmOperation.CHECK_MAIL, true);
	
	// Disallow printing of ZmDocuments.
	if (num == 1) {
		var selectedItem = this.getCurrentView().getSelection()[0];
		if (selectedItem.toString() == "ZmDocument") {
			parent.enable(ZmOperation.PRINT, false);
		}
	}
};

ZmMixedController.prototype.getKeyMapName =
function() {
	return "ZmMixedController";
};

// Private and protected methods

ZmMixedController.prototype._initializeToolBar = 
function(view) {
	if (this._toolbar[view]) return;

	ZmListController.prototype._initializeToolBar.call(this, view);
	this._toolbar[view].addFiller();

	var tb = new ZmNavToolBar({parent:this._toolbar[view], context:view});
	this._setNavToolBar(tb, view);

	this._setNewButtonProps(view, ZmMsg.compose, "NewMessage", "NewMessageDis", ZmOperation.NEW_MESSAGE);
};

ZmMixedController.prototype._initializeActionMenu = 
function() {
	ZmListController.prototype._initializeActionMenu.call(this);

	// based on current search, show/hide undelete menu option
	var showUndelete = false;
	var folderId = this._getSearchFolderId();
	if (folderId) {
		var folder = appCtxt.getById(folderId);
		showUndelete = folder && folder.isInTrash();
	}
	var actionMenu = this._actionMenu;
	var mi = actionMenu.getMenuItem(ZmOperation.UNDELETE);
	mi.setVisible(showUndelete);
};

ZmMixedController.prototype._getToolBarOps =
function() {
	var list = this._standardToolBarOps();
	list.push(ZmOperation.SEP, ZmOperation.TAG_MENU);
	return list;
};

ZmMixedController.prototype._getActionMenuOps =
function() {
	var list = this._standardActionMenuOps();
	list.push(ZmOperation.UNDELETE);
	return list;
};

ZmMixedController.prototype._getViewType = 
function() {
	return ZmController.MIXED_VIEW;
};

ZmMixedController.prototype._getItemType =
function() {
	return ZmItem.MIXED;
};

ZmMixedController.prototype._createNewView = 
function(view) {
	var mv = new ZmMixedView({parent:this._container, posStyle:DwtControl.ABSOLUTE_STYLE,
							  controller:this, dropTgt:this._dropTgt});
	mv.setDragSource(this._dragSrc);
	return mv;
};

ZmMixedController.prototype._getTagMenuMsg = 
function(num) {
	return (num == 1) ? ZmMsg.tagItem : ZmMsg.tagItems;
};

ZmMixedController.prototype._getMoveDialogTitle = 
function(num) {
	return (num == 1) ? ZmMsg.moveItem : ZmMsg.moveItems;
};

ZmMixedController.prototype._setViewContents =
function(view) {
	this._listView[view].set(this._list);
};

ZmMixedController.prototype._getTrashViewOps =
function() {
	var list = [];
	for (var i = 0; i < ZmApp.APPS.length; i++) {
		var op = ZmApp.TRASH_VIEW_OP[ZmApp.APPS[i]];
		if (op) {
			list.push(op);
		}
	}
	return list;
};

// List listeners

// Double click displays an item.
ZmMixedController.prototype._listSelectionListener =
function(ev) {
	ZmListController.prototype._listSelectionListener.call(this, ev);
	if (ev.detail == DwtListView.ITEM_DBL_CLICKED) {
		if (ev.item.type == ZmItem.CONTACT || ev.item.type == ZmItem.GROUP) {
			AjxDispatcher.run("GetContactController").show(ev.item);
		} else if (ev.item.type == ZmItem.CONV) {
			var mailApp = appCtxt.getApp(ZmApp.MAIL);
			if (ev.item.isDraft) {
				AjxDispatcher.run("GetConvListController")._doAction({ev:ev, action:ZmOperation.DRAFT});
			} else {
				AjxDispatcher.run("GetConvController").show(this._activeSearch, ev.item);
			}
		} else if (ev.item.type == ZmItem.MSG) {
			var mailApp = appCtxt.getApp(ZmApp.MAIL);
			if (ev.item.isDraft) {
				AjxDispatcher.run("GetTradController")._doAction({ev:ev, action:ZmOperation.DRAFT});
			} else {
				AjxDispatcher.run("GetMsgController").show(ev.item);
			}
		} else if (ev.item.type == ZmItem.TASK) {
			var app = appCtxt.getApp(ZmApp.TASKS);
			// XXX: prompt user if task is recurring!
			AjxDispatcher.run("GetTaskController").show(ev.item, ZmCalItem.MODE_EDIT);
		} else if (ev.item.type == ZmItem.PAGE || ev.item.type == ZmItem.DOCUMENT) {
			appCtxt.getApp(ZmApp.NOTEBOOK).getFileController()._doSelectDblClicked(ev.item, true);
		}
	}
};

ZmMixedController.prototype._listActionListener = 
function(ev) {
	ZmListController.prototype._listActionListener.call(this, ev);
	
	// based on the items selected, enable/disable and/or show/hide appropriate menu items
	var selItems = this._listView[this._currentView].getSelection();
	var selTypes = {};
	var numTypes = 0;
	for (var i = 0; i < selItems.length; i++) {
		// bug fix #11577 - if we get GROUP type, just treat it as a contact
		var t = selItems[i].type == ZmItem.GROUP ? ZmItem.CONTACT : selItems[i].type;
		if (!selTypes[t]) {
			selTypes[t] = true;
			numTypes++;
		}
	}

	var actionMenu = this.getActionMenu();
	var miUndelete = actionMenu.getMenuItem(ZmOperation.UNDELETE);
	var miMoveTo = actionMenu.getMenuItem(ZmOperation.MOVE);
	var folderId = this._getSearchFolderId();
	var folder = appCtxt.getById(folderId);

	if (folder && folder.isInTrash()) {
		// only want to show Undelete menu item if contact(s) is selected
		var showUndelete = numTypes == 1 && selTypes[ZmItem.CONTACT] === true;
		var showMoveTo = numTypes == 1 && (selTypes[ZmItem.CONV] === true || selTypes[ZmItem.MSG] === true);
		var showBoth = selItems.length > 1 && numTypes > 1;
		var isDraft = numTypes == 1 && selItems[0].isDraft;
		
		miUndelete.setVisible(showUndelete || showBoth || isDraft);
		miMoveTo.setVisible((showMoveTo || showBoth) && !isDraft);
	
		// if >1 item is selected and they're not all the same type, disable both menu items
		actionMenu.enable([ZmOperation.UNDELETE, ZmOperation.MOVE], numTypes == 1);
	} else {
 		miUndelete.setVisible(false);	// never show Undelete option when not in Trash
 		miMoveTo.setVisible(true);		// always show Move To option
 		// show MoveTo only if one type has been selected and its not contacts or wiki thing
		var enableMoveTo = numTypes == 1 && selItems[0].type != ZmItem.CONTACT && 
			selItems[0].type != ZmItem.PAGE && selItems[0].type != ZmItem.DOCUMENT;
		actionMenu.enable(ZmOperation.MOVE, enableMoveTo);
	}
	actionMenu.popup(0, ev.docX, ev.docY);
	if (ev.ersatz) {
		// menu popped up via keyboard nav
		actionMenu.setSelectedItem(0);
	}
};

ZmMixedController.prototype._undeleteListener = 
function(ev) {
	var items = this._listView[this._currentView].getSelection();

	// figure out the default for this item should be moved to
	var folder;
	if (items[0] instanceof ZmContact) {
		folder = new ZmFolder({id: ZmOrganizer.ID_ADDRBOOK});
	} else if (items[0] instanceof ZmAppt) {
		folder = new ZmFolder({id: ZmOrganizer.ID_CALENDAR});
	} else {
		var folderId = items[0].isDraft ? ZmFolder.ID_DRAFTS : ZmFolder.ID_INBOX;
		folder = appCtxt.getById(folderId);
	}

	if (folder) {
		this._doMove(items, folder);
	}
};

ZmMixedController.prototype._deleteListener =
function(ev) {
	// Disallow my card delete.
	var items = this._listView[this._currentView].getSelection();
	for (var i = 0, count = items.length; i < count; i++) {
		var item = items[i];
		if ((item instanceof ZmContact) && item.isMyCard()) {
			appCtxt.setStatusMsg(ZmMsg.errorMyCardDelete, ZmStatusView.LEVEL_WARNING);
			return;
		}
	}

	ZmMailListController.prototype._deleteListener.call(this, ev);
};

ZmMixedController.prototype._moveListener =
function(ev) {
	// Disallow my card move.
	var items = this._listView[this._currentView].getSelection();
	for (var i = 0, count = items.length; i < count; i++) {
		var item = items[i];
		if ((item instanceof ZmContact) && item.isMyCard()) {
			appCtxt.setStatusMsg(ZmMsg.errorMyCardMove, ZmStatusView.LEVEL_WARNING);
			return;
		}
	}

	ZmMailListController.prototype._moveListener.call(this, ev);
};
