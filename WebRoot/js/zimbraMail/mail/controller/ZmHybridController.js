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
 * Portions created by Zimbra are Copyright (C) 2005, 2006 Zimbra, Inc.
 * All Rights Reserved.
 * 
 * Contributor(s):
 * 
 * ***** END LICENSE BLOCK *****
 */

/**
 * Creates a new, empty "hybrid view" controller.
 * @constructor
 * @class
 * This class manages the hybrid mail view. Conversations are listed, and any
 * conversation with more than one message is expandable. Expanding a conversation
 * shows its messages in the list just below it.
 *
 * @author Conrad Damon
 *
 * @param appCtxt	app context
 * @param container	containing shell
 * @param mailApp	containing app
 */
function ZmHybridController(appCtxt, container, mailApp) {
	ZmDoublePaneController.call(this, appCtxt, container, mailApp);
};

ZmHybridController.prototype = new ZmDoublePaneController;
ZmHybridController.prototype.constructor = ZmHybridController;

ZmMailListController.GROUP_BY_ITEM[ZmController.HYBRID_VIEW]	= ZmItem.CONV;
ZmMailListController.GROUP_BY_SETTING[ZmController.HYBRID_VIEW]	= ZmSetting.GROUP_BY_HYBRID;

// view menu
ZmMailListController.GROUP_BY_ICON[ZmController.HYBRID_VIEW]		= "ConversationView";
ZmMailListController.GROUP_BY_MSG_KEY[ZmController.HYBRID_VIEW]		= "hybrid";
ZmMailListController.GROUP_BY_VIEWS.push(ZmController.HYBRID_VIEW);

// Public methods

ZmHybridController.prototype.toString = 
function() {
	return "ZmHybridController";
};

/**
* Displays the given conversation in a two-pane view. The view is actually
* created in _loadItem(), since it is a scheduled method and must execute
* last.
*
* @param search		[ZmSearchResult]	the current search results
*/
ZmHybridController.prototype.show =
function(search) {
	this._expanded = {};	// all convs start out collapsed
	this._list = search.getResults(ZmItem.CONV);

	// call base class
	ZmDoublePaneController.prototype.show.call(this, search, this._list);
	this._appCtxt.set(ZmSetting.GROUP_MAIL_BY, ZmSetting.GROUP_BY_HYBRID);
//	this._resetNavToolBarButtons(ZmController.HYBRID_VIEW);
};

// Private methods

ZmHybridController.prototype._createDoublePaneView = 
function() {
	return (new ZmHybridView(this._container, null, Dwt.ABSOLUTE_STYLE, this, this._dropTgt));
};

ZmHybridController.prototype._getViewType =
function() {
	return ZmController.HYBRID_VIEW;
};

ZmHybridController.prototype._getItemType =
function() {
	return ZmItem.CONV;
};

ZmHybridController.prototype._paginate = 
function(view, bPageForward, convIdx) {
	view = view ? view : this._currentView;
	return ZmDoublePaneController.prototype._paginate.call(this, view, bPageForward, convIdx);
};

ZmHybridController.prototype._resetNavToolBarButtons = 
function(view) {
	ZmDoublePaneController.prototype._resetNavToolBarButtons.call(this, view);
	this._navToolBar[view].setToolTip(ZmOperation.PAGE_BACK, ZmMsg.previous + " " + ZmMsg.page);
	this._navToolBar[view].setToolTip(ZmOperation.PAGE_FORWARD, ZmMsg.next + " " + ZmMsg.page);
};

ZmHybridController.prototype._getMoreSearchParams = 
function(params) {
	// OPTIMIZATION: find out if we need to pre-fetch the first hit message
	params.fetch = this._readingPaneOn;
	params.markRead = true;
};

ZmHybridController.prototype._listSelectionListener =
function(ev) {
	var item = ev.item;
	if (ev.field == ZmListView.FIELD_PREFIX[ZmItem.F_EXPAND]) {
		if (!item) { return; }
		var mlv = this._doublePaneView.getMailListView();
		if (mlv._expandable[item.id]) {
			this._toggle(item);
		} else {
			ZmDoublePaneController.prototype._listSelectionListener.apply(this, arguments);
		}
	} else if (ev.detail == DwtListView.ITEM_DBL_CLICKED) {
		if (!item) { return; }
		if (this._readingPaneOn) {
			this._toggle(item);
		} else {
			if (item.type == ZmItem.CONV) {
				AjxDispatcher.run("GetConvController").show(this._activeSearch, item);
			} else if (item.type == ZmItem.MSG) {
				AjxDispatcher.run("GetMsgController").show(item);
			}
		}
	} else {
		ZmDoublePaneController.prototype._listSelectionListener.apply(this, arguments);
	}
};

ZmHybridController.prototype._setSelectedMsg =
function() {
	var selCnt = this._listView[this._currentView].getSelectionCount();
	if (selCnt == 1) {
		// Check if currently displaying selected element in message view
		var item = this._listView[this._currentView].getSelection()[0];
		var msg = (item instanceof ZmConv) ? item.getFirstMsg() : item;
		if (!msg.isLoaded()) {
			this._appCtxt.getSearchController().setEnabled(false);
			this._doGetMsg(msg);
		} else {
			this._doublePaneView.setMsg(msg);
			if (msg.isUnread) {
				// msg was cached, then marked unread
				this._list.markRead([msg], true);
			}
		}
	}
};

ZmHybridController.prototype._toggle =
function(item) {
	if (this._expanded[item.id]) {
		this._collapse(item);
	} else {
		var conv = (item.type == ZmItem.MSG) ? this._appCtxt.getById(item.cid) : item;
		var msg = (item.type == ZmItem.MSG) ? item : null;
		this._expand(conv, msg, item.offset);
	}
};

ZmHybridController.prototype._expand =
function(conv, msg, offset) {
	offset = offset || 0;
	var limit = this._appCtxt.get(ZmSetting.PAGE_SIZE);
	var respCallback = new AjxCallback(this, this._handleResponseLoadItem, [conv, msg, offset, limit]);
	var pageWasCached = false;
	if (offset) {
		if (this._paginateConv(conv, offset, limit, respCallback)) {
			// page was cached, callback won't be run
			this._handleResponseLoadItem(conv, msg, offset, limit, new ZmCsfeResult(conv.msgs));
		}
	} else if (!conv.isLoaded()) {
		// no msgs have been loaded yet
		conv.load(this.getSearchString(), null, null, limit, null, respCallback, false);
	} else {
		// re-expanding first page of msgs
		this._handleResponseLoadItem(conv, msg, offset, limit, new ZmCsfeResult(conv.msgs));
	}
};

ZmHybridController.prototype._handleResponseLoadItem =
function(conv, msg, offset, limit, result) {
	if (!result) { return; }
	var mlv = this._doublePaneView.getMailListView();
	mlv._expand(conv, msg, offset, limit);
	var expandedId = msg ? msg.id : conv.id;
	this._expanded[expandedId] = true;
};

/**
 * Adapted from ZmListController::_paginate
 */
ZmHybridController.prototype._paginateConv =
function(conv, offset, limit, callback) {
	var list = conv.msgs;
	// see if we're out of msgs and the server has more
	if (offset && ((offset + limit > list.size()) && list.hasMore())) {
		// figure out how many items we need to fetch
		var delta = (offset + limit) - list.size();
		var max = delta < limit && delta > 0 ? delta : limit;
		if (max < limit) {
			offset = ((offset + limit) - max) + 1;
		}
		var respCallback = new AjxCallback(this, this._handleResponsePaginateConv, [conv, offset, callback]);
		conv.load(this.getSearchString(), null, offset, limit, respCallback, null, false);
		return false;
	} else {
		return true;
	}
};

ZmHybridController.prototype._handleResponsePaginateConv =
function(conv, offset, callback, result) {
	var searchResult = result.getResponse();
	conv.msgs.setHasMore(searchResult.getAttribute("more"));
	var newList = searchResult.getResults(ZmItem.MSG).getVector();
	conv.msgs.cache(offset, newList);
	if (callback) {
		callback.run(result);
	}
};

ZmHybridController.prototype._collapse =
function(item) {
	var mlv = this._doublePaneView.getMailListView();
	if (mlv._rowsArePresent(item)) {	
		mlv._collapse(item);
		this._expanded[item.id] = false;
	} else {
		// reset state and expand instead
		this._expanded[item.id] = false;
		this._toggle(item);
	}
};

// Actions
//
// Since a selection might contain both convs and msgs, we need to split them up and
// invoke the action for each type separately.

ZmHybridController.prototype._doFlag =
function(items) {
	var lists = this._divvyItems(items);
	var on = !items[0].isFlagged;
	if (lists[ZmItem.MSG] && lists[ZmItem.MSG].length) {
		ZmDoublePaneController.prototype._doFlag.call(this, lists[ZmItem.MSG], on);
	}
	if (lists[ZmItem.CONV] && lists[ZmItem.CONV].length) {
		ZmDoublePaneController.prototype._doFlag.call(this, lists[ZmItem.CONV], on);
	}
};

ZmHybridController.prototype._doTag =
function(items, tag, doTag) {
	var lists = this._divvyItems(items);
	if (lists[ZmItem.MSG] && lists[ZmItem.MSG].length) {
		ZmDoublePaneController.prototype._doTag.call(this, lists[ZmItem.MSG], tag, doTag);
	}
	if (lists[ZmItem.CONV] && lists[ZmItem.CONV].length) {
		ZmDoublePaneController.prototype._doTag.call(this, lists[ZmItem.CONV], tag, doTag);
	}
};

ZmHybridController.prototype._doRemoveAllTags =
function(items) {
	var lists = this._divvyItems(items);
	if (lists[ZmItem.MSG] && lists[ZmItem.MSG].length) {
		ZmDoublePaneController.prototype._doRemoveAllTags.call(this, lists[ZmItem.MSG]);
	}
	if (lists[ZmItem.CONV] && lists[ZmItem.CONV].length) {
		ZmDoublePaneController.prototype._doRemoveAllTags.call(this, lists[ZmItem.CONV]);
	}
};

ZmHybridController.prototype._doDelete =
function(items, hardDelete, attrs) {
	var lists = this._divvyItems(items);
	if (lists[ZmItem.MSG] && lists[ZmItem.MSG].length) {
		ZmDoublePaneController.prototype._doDelete.call(this, lists[ZmItem.MSG], hardDelete, attrs);
	}
	if (lists[ZmItem.CONV] && lists[ZmItem.CONV].length) {
		ZmDoublePaneController.prototype._doDelete.call(this, lists[ZmItem.CONV], hardDelete, attrs);
	}
};

ZmHybridController.prototype._doMove =
function(items, folder, attrs, force) {
	var lists = this._divvyItems(items);
	if (lists[ZmItem.MSG] && lists[ZmItem.MSG].length) {
		ZmDoublePaneController.prototype._doMove.call(this, lists[ZmItem.MSG], folder, attrs, force);
	}
	if (lists[ZmItem.CONV] && lists[ZmItem.CONV].length) {
		ZmDoublePaneController.prototype._doMove.call(this, lists[ZmItem.CONV], folder, attrs, force);
	}
};

ZmHybridController.prototype._doMarkRead =
function(items, on) {
	var lists = this._divvyItems(items);
	if (lists[ZmItem.MSG] && lists[ZmItem.MSG].length) {
		ZmDoublePaneController.prototype._doMarkRead.call(this, lists[ZmItem.MSG], on);
	}
	if (lists[ZmItem.CONV] && lists[ZmItem.CONV].length) {
		ZmDoublePaneController.prototype._doMarkRead.call(this, lists[ZmItem.CONV], on);
	}
};

ZmHybridController.prototype._doSpam =
function(items, markAsSpam, folder) {
	var lists = this._divvyItems(items);
	if (lists[ZmItem.MSG] && lists[ZmItem.MSG].length) {
		ZmDoublePaneController.prototype._doSpam.call(this, lists[ZmItem.MSG], markAsSpam, folder);
	}
	if (lists[ZmItem.CONV] && lists[ZmItem.CONV].length) {
		ZmDoublePaneController.prototype._doSpam.call(this, lists[ZmItem.CONV], markAsSpam, folder);
	}
};

ZmHybridController.prototype._divvyItems =
function(items) {
	var convs = [], msgs = [];
	var convIds = {};
	for (var i = 0; i < items.length; i++) {
		var item = items[i];
		if (item.type == ZmItem.CONV) {
			convs.push(item);
			convIds[item.id] = true;
		} else {
			msgs.push(item);
		}
	}
	var msgs1 = [];
	for (var i = 0; i < msgs.length; i++) {
		if (!convIds[msgs[i].cid]) {
			msgs1.push(msgs[i]);
		}
	}
	var lists = {};
	lists[ZmItem.MSG] = msgs1;	
	lists[ZmItem.CONV] = convs;
	
	return lists;
};

// Callbacks

ZmHybridController.prototype._processPrePopView = 
function(view) {
	this._resetNavToolBarButtons(view);
};

ZmHybridController.prototype._handleResponsePaginate = 
function(view, saveSelection, loadIndex, offset, result, ignoreResetSelection) {
	// bug fix #5134 - overload to ignore resetting the selection since it is handled by setView
	ZmListController.prototype._handleResponsePaginate.call(this, view, saveSelection, loadIndex, offset, result, true);
};
