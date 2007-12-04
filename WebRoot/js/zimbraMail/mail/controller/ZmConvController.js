/*
 * ***** BEGIN LICENSE BLOCK *****
 * 
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2004, 2005, 2006, 2007 Zimbra, Inc.
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
 * Creates a new, empty conversation controller.
 * @constructor
 * @class
 * This class manages the two-pane conversation view. The top pane contains a list
 * view of the messages in the conversation, and the bottom pane contains the current
 * message.
 *
 * @author Conrad Damon
 * 
 * @param container	containing shell
 * @param mailApp	containing app
 */
ZmConvController = function(container, mailApp) {

	ZmDoublePaneController.call(this, container, mailApp);

	this._convDeleteListener = new AjxListener(this, this._deleteListener);
	this._listeners[ZmOperation.DELETE_MENU] = this._convDeleteListener;
	this._readingPaneOn = true;	// always start with reading pane on
	this._msgControllerMode = ZmController.CONV_VIEW;
}

ZmConvController.prototype = new ZmDoublePaneController;
ZmConvController.prototype.constructor = ZmConvController;

// Public methods

ZmConvController.prototype.toString = 
function() {
	return "ZmConvController";
}

/**
* Displays the given conversation in a two-pane view. The view is actually
* created in _loadConv(), since it is a scheduled method and must execute
* last.
*
* @param activeSearch		[ZmSearch]				the current search results
* @param conv				[ZmConv]				a conversation
* @param parentController	[ZmMailController]*		controller that called this method
* @param callback			[AjxCallback]*			client callback
*/
ZmConvController.prototype.show =
function(activeSearch, conv, parentController, callback) {
	this._conv = conv;
	// always reset offset & sortby to asc.
	if (this._listView[this._currentView]) {
		this._listView[this._currentView].setOffset(0);	
		this._listView[this._currentView].setSortByAsc(ZmItem.F_DATE, false);
	}
	this._parentController = parentController;

	// this._list will be set when conv is loaded
	ZmDoublePaneController.prototype.show.call(this, activeSearch, conv, callback);
}

ZmConvController.prototype.getConv =
function() {
	return this._conv;
}

/**
 * Returns the list from the view (CLV) that we came from.
 */
ZmConvController.prototype.getUnderlyingList =
function() {
	if (this._parentController) {
		return this._parentController.getList();
	}
};

// Private and protected methods

ZmConvController.prototype._createDoublePaneView = 
function() {
	return (new ZmConvView(this._container, this, this._dropTgt));
}

// Creates the conv view, which is not a standard list view (it's a two-pane sort of thing).
ZmConvController.prototype._initialize =
function(view) {
	ZmDoublePaneController.prototype._initialize.call(this, view);
	
	// set up custom listeners for this view 
	if (this._doublePaneView)
		this._doublePaneView.addTagClickListener(new AjxListener(this, ZmConvController.prototype._convTagClicked));
}

ZmConvController.prototype._initializeToolBar = 
function(view) {
	if (!this._toolbar[view]) {
		// nuke the double arrows for 800x600 resolutions or lower
		var navArrows = AjxEnv.is800x600orLower ? ZmNavToolBar.SINGLE_ARROWS : ZmNavToolBar.ALL_ARROWS;

		ZmDoublePaneController.prototype._initializeToolBar.call(this, view, navArrows);
	}
	this._setupDeleteMenu(view);	// ALWAYS call setup to turn delete menu on/off
}

ZmConvController.prototype._setupViewMenu =
function(view) {
	this._setupReadingPaneMenuItem(view, null, true);
}

ZmConvController.prototype._setupDeleteMenu =
function(view) {
	var delButton = this._toolbar[view].getButton(ZmOperation.DELETE_MENU);
	if (this._conv.numMsgs > 1) {
		var menu = new ZmPopupMenu(delButton);
		delButton.setMenu(menu);
		delButton.noMenuBar = true;

		var id = ZmOperation.DELETE_MSG;
		var mi = menu.createMenuItem(id, {image:ZmOperation.getProp(id, "image"), text:ZmMsg[ZmOperation.getProp(id, "textKey")]});
		mi.setData(ZmOperation.MENUITEM_ID, ZmOperation.DELETE_MSG);
		mi.addSelectionListener(this._listeners[ZmOperation.DELETE]);

		id = ZmOperation.DELETE_CONV;
		mi = menu.createMenuItem(id, {image:ZmOperation.getProp(id, "image"), text:ZmMsg[ZmOperation.getProp(id, "textKey")]});
		mi.setData(ZmOperation.MENUITEM_ID, ZmOperation.DELETE_CONV);
		mi.addSelectionListener(this._listeners[ZmOperation.DELETE]);
	}
	else if (delButton.getMenu()) {
		delButton.setMenu(null);
	}
};

/*
* Override to replace DELETE with DELETE_MENU
*/
ZmConvController.prototype._standardToolBarOps =
function() {
	return [ZmOperation.NEW_MENU,
			ZmOperation.SEP,
			ZmOperation.CHECK_MAIL,
			ZmOperation.SEP,
			ZmOperation.DELETE_MENU, ZmOperation.MOVE, ZmOperation.PRINT_ONE];
}

ZmConvController.prototype._getViewType =
function() {
	return ZmController.CONV_VIEW;
}

ZmConvController.prototype._getItemType =
function() {
	return ZmItem.MSG;
}

ZmConvController.prototype._setActiveSearch =
function(view) {
	// bug fix #7389 - do nothing!
}

// Operation listeners

// Delete one or more items.
ZmConvController.prototype._deleteListener =
function(ev) {
	if (ev.item.getData(ZmOperation.MENUITEM_ID) == ZmOperation.DELETE_CONV) {
		// use conv list controller to delete conv
		var clc = AjxDispatcher.run("GetConvListController");
		clc._doDelete([this._conv]);
		this._app.popView();
	}
	else if (ev.item.getMenu() == null) {
		var items = this._listView[this._currentView].getSelection();
		var delItems = [];
		for (var i = 0; i < items.length; i++) {
			var item = items[i];
			var folder = item.folderId ? appCtxt.getById(item.folderId) : null;
			var canDelete = (!folder || (folder && !folder.isInTrash()));
			if (canDelete) {
				delItems.push(item);
			}
		}
		if (delItems.length) {
			this._doDelete(delItems);
		}
	} else {
		ev.item.popup();
	}
};

// If one or more messages have been moved/deleted, and the CLV from which we came represents
// folder contents, see if this conv still belongs in that folder. It does if it has at least
// one message still in that folder. Note that the conv item in the CLV isn't physically moved
// or deleted, it's just removed from the view and its underlying list.
ZmConvController.prototype._checkConvLocation =
function() {
	var clc = AjxDispatcher.run("GetConvListController");
	var list = clc.getList();
	var folderId = list.search.folderId;
	if (folderId || (this._conv.numMsgs == 1)) {
		if (this._conv.checkMoved(folderId)) { // view notif happens here
			list.remove(this._conv);
			var clv = clc.getCurrentView();
			var respCallback = new AjxCallback(clv, clv._handleResponseCheckReplenish);
			clc._checkReplenish(respCallback);
		}
	}
}

// Tag in the summary area clicked, do a tag search.
ZmConvController.prototype._convTagClicked =
function(tagId) {
	var tag = appCtxt.getById(tagId);
	var query = 'tag:"' + tag.name + '"';
	var searchController = appCtxt.getSearchController();
	searchController.search({query: query});
}

// Handle DnD tagging (can only add a tag to a single item) - if a tag got dropped onto
// a msg, we need to update its conv
ZmConvController.prototype._dropListener =
function(ev) {
	ZmListController.prototype._dropListener.call(this, ev);
	// need to check to make sure tagging actually happened
	if (ev.action == DwtDropEvent.DRAG_DROP) {
		var div = Dwt.getAttr(ev.uiEvent.target, "_itemIndex", true);
		if (div) {
			var tag = ev.srcData;
			if (!this._conv.hasTag(tag.id)) {
				this._doublePaneView._setTags(this._conv); 	// update tag summary
			}
		}
	}
}

// same as for ZmTradController
ZmConvController.prototype._listSelectionListener =
function(ev) {
	var item = ev.item;
	if (!item) { return; }
	var handled = ZmDoublePaneController.prototype._listSelectionListener.apply(this, arguments);
	if (!handled && ev.detail == DwtListView.ITEM_DBL_CLICKED) {
		var respCallback = new AjxCallback(this, this._handleResponseListSelectionListener, item);
		AjxDispatcher.run("GetMsgController").show(item, this._msgControllerMode, respCallback);
	}
};

// Miscellaneous

// Called after a delete/move notification has been received.
// Return value indicates whether view was popped as a result of a delete.
ZmConvController.prototype.handleDelete =
function() {

	var popView = true;

	if (this._conv.numMsgs > 1) {
		// get the search folder if one exists
		var clc = AjxDispatcher.run("GetConvListController");
		var search = clc.getList().search;
		var folderId = search.folderId ? (parseInt(search.folderId)) : null;
		if (folderId && this._conv.msgs) {
			// search all msgs in conv to see if at least one is in search folder
			var msgs = this._conv.msgs.getArray();
			for (var i = 0; i < msgs.length; i++) {
				if (msgs[i].folderId == folderId) {
					popView = false;
					break;
				}
			}
		} else {
			// must be custom/saved search, don't pop!
			popView = false;
		}
	}

	// Don't pop unless we're currently visible!
	var currViewId = appCtxt.getCurrentViewId();

	// bug fix #4356 - if currViewId is compose (among other restrictions) then still pop
	var popAnyway = false;
	if (currViewId == ZmController.COMPOSE_VIEW && this._conv.numMsgs == 1 && this._conv.msgs) {
		var msg = this._conv.msgs.getArray()[0];
		popAnyway = msg.isInvite() && msg.folderId == ZmFolder.ID_TRASH;
	}

	popView = popView && ((currViewId == this._currentView) || popAnyway);

	if (popView) {
		this._checkConvLocation();
		this._app.popView();
	} else {
		var delButton = this._toolbar[this._currentView].getButton(ZmOperation.DELETE_MENU);
		var delMenu = delButton ? delButton.getMenu() : null;
		if (delMenu) {
			delMenu.enable(ZmOperation.DELETE_MSG, false);
		}
	}

	return popView;
}

ZmConvController.prototype.getKeyMapName =
function() {
	return "ZmConvController";
};

ZmConvController.prototype.handleKeyAction =
function(actionCode) {
	DBG.println(AjxDebug.DBG3, "ZmConvController.handleKeyAction");

	switch (actionCode) {
		case ZmKeyMap.CANCEL:
			this._backListener();
			break;

		case ZmKeyMap.NEXT_CONV:
			if (this._navToolBar[this._currentView].getButton(ZmOperation.PAGE_DBL_FORW).getEnabled()) {
				this._paginateDouble(true);
			}
			break;

		case ZmKeyMap.PREV_CONV:
			if (this._navToolBar[this._currentView].getButton(ZmOperation.PAGE_DBL_BACK).getEnabled()) {
				this._paginateDouble(false);
			}
			break;

		default:
			return ZmMailListController.prototype.handleKeyAction.call(this, actionCode);
			break;
	}
	return true;
};


ZmConvController.prototype._resetOperations =
function(parent, num) {
	ZmDoublePaneController.prototype._resetOperations.call(this, parent, num);

	var canDelete = false;
	var items = this._doublePaneView.getSelection();
	for (var i = 0; i < items.length; i++) {
		var item = items[i];
		var folder = item.folderId ? appCtxt.getById(item.folderId) : null;
		canDelete = (!folder || (folder && !folder.isInTrash()));
		if (canDelete) {
			break;
		}
	}

	parent.enable(ZmOperation.DELETE, canDelete);

	if (parent instanceof ZmButtonToolBar) {
		parent.enable(ZmOperation.DELETE_MENU, true);
		var delButton = parent.getButton(ZmOperation.DELETE_MENU);
		var delMenu = delButton ? delButton.getMenu() : null;
		if (delMenu) {
			delMenu.enable(ZmOperation.DELETE_MSG, canDelete);
		}
	}
};

ZmConvController.prototype._resetNavToolBarButtons =
function(view) {
	ZmDoublePaneController.prototype._resetNavToolBarButtons.call(this, view);

	var list = this._conv.list.getVector();

	// enable/disable up/down buttons per conversation index
	var first = list.get(0);
	this._navToolBar[view].enable(ZmOperation.PAGE_DBL_BACK, (first && first != this._conv));
	var enablePgDn = this._conv.list.hasMore() || (list.getLast() != this._conv);
	this._navToolBar[view].enable(ZmOperation.PAGE_DBL_FORW, enablePgDn);

	this._navToolBar[view].setToolTip(ZmOperation.PAGE_BACK, ZmMsg.previous + " " + ZmMsg.page);
	this._navToolBar[view].setToolTip(ZmOperation.PAGE_FORWARD, ZmMsg.next + " " + ZmMsg.page);
	this._navToolBar[view].setToolTip(ZmOperation.PAGE_DBL_BACK, ZmMsg.previous + " " + ZmMsg.conversation);
	this._navToolBar[view].setToolTip(ZmOperation.PAGE_DBL_FORW, ZmMsg.next + " " + ZmMsg.conversation);
};

ZmConvController.prototype._getNumTotal =
function() {
	return this._conv.numMsgs;
};

// overloaded...
ZmConvController.prototype._search = 
function(view, offset, limit, callback) {
	var sortby = appCtxt.get(ZmSetting.SORTING_PREF, view);
	this._conv.load({sortBy:sortby, offset:offset, limit:limit, getFirstMsg:this._readingPaneOn}, callback);
}

ZmConvController.prototype._paginateDouble = 
function(bDoubleForward) {
	var ctlr = this._parentController || AjxDispatcher.run("GetConvListController");
	if (ctlr) {
		ctlr.pageItemSilently(this._conv, bDoubleForward);
	}
};

ZmConvController.prototype._getSearchFolderId = 
function() {
	return this._conv.list.search.folderId;
}

// top level view means this view is allowed to get shown when user clicks on 
// app icon in app toolbar - we dont want conv view to be top level (always show CLV)
ZmConvController.prototype._isTopLevelView = 
function() {
	return false;
}
