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
	this._list = search.getResults(ZmItem.CONV);

	// call base class
	ZmDoublePaneController.prototype.show.call(this, search, this._list);
	this._appCtxt.set(ZmSetting.GROUP_MAIL_BY, ZmSetting.GROUP_BY_HYBRID);
//	this._resetNavToolBarButtons(ZmController.HYBRID_VIEW);
};

// Private methods

ZmHybridController.prototype._createDoublePaneView = 
function() {
	return new ZmHybridView(this._container, null, Dwt.ABSOLUTE_STYLE, this, this._dropTgt);
};

ZmHybridController.prototype._getViewType =
function() {
	return ZmController.HYBRID_VIEW;
};

ZmHybridController.prototype._getItemType =
function() {
	return ZmItem.CONV;
};

ZmHybridController.prototype._initializeTabGroup =
function(view) {
	if (this._tabGroups[view]) return;

	ZmListController.prototype._initializeTabGroup.apply(this, arguments);
	if (!AjxEnv.isIE) {
		this._tabGroups[view].addMember(this.getReferenceView().getMsgView());
	}
};

ZmHybridController.prototype._setViewContents =
function(view) {
	this._mailListView._resetExpansion();
	ZmDoublePaneController.prototype._setViewContents.apply(this, arguments);
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

// no support for showing total items, which are msgs
ZmHybridController.prototype._getNumTotal = function() { return null; }

ZmHybridController.prototype._getMoreSearchParams = 
function(params) {
	// OPTIMIZATION: find out if we need to pre-fetch the first hit message
	params.fetch = this._readingPaneOn;
	params.markRead = true;
};

ZmHybridController.prototype._listSelectionListener =
function(ev) {
	var item = ev.item;
	if (!item) { return; }
	if (ev.field == ZmItem.F_EXPAND && (this._mailListView._expandable[item.id])) {
		this._toggle(item);
	} else {
		ZmDoublePaneController.prototype._listSelectionListener.apply(this, arguments);
	}
};

ZmHybridController.prototype._toggle =
function(item) {
	if (this._mailListView._expanded[item.id]) {
		this._collapse(item);
	} else {
		var conv = item, msg = null, offset = 0;
		if (item.type == ZmItem.MSG) {
			conv = this._appCtxt.getById(item.cid);
			msg = item;
			offset = this._mailListView._msgOffset[item.id];
		}
		this._expand(conv, msg, offset);
	}
};

ZmHybridController.prototype._expand =
function(conv, msg, offset) {
	offset = offset || 0;
	var respCallback = new AjxCallback(this, this._handleResponseLoadItem, [conv, msg, offset]);
	var pageWasCached = false;
	if (offset) {
		if (this._paginateConv(conv, offset, respCallback)) {
			// page was cached, callback won't be run
			this._handleResponseLoadItem(conv, msg, offset, new ZmCsfeResult(conv.msgs));
		}
	} else if (!conv.isLoaded()) {
		// no msgs have been loaded yet
		conv.load({query:this.getSearchString(), callback:respCallback});
	} else {
		// re-expanding first page of msgs
		this._handleResponseLoadItem(conv, msg, offset, new ZmCsfeResult(conv.msgs));
	}
};

ZmHybridController.prototype._handleResponseLoadItem =
function(conv, msg, offset, result) {
	if (!result) { return; }
	this._mailListView._expand(conv, msg, offset);
};

/**
 * Adapted from ZmListController::_paginate
 */
ZmHybridController.prototype._paginateConv =
function(conv, offset, callback) {
	var list = conv.msgs;
	// see if we're out of msgs and the server has more
	var limit = this._appCtxt.get(ZmSetting.PAGE_SIZE);
	if (offset && ((offset + limit > list.size()) && list.hasMore())) {
		// figure out how many items we need to fetch
		var delta = (offset + limit) - list.size();
		var max = delta < limit && delta > 0 ? delta : limit;
		if (max < limit) {
			offset = ((offset + limit) - max) + 1;
		}
		var respCallback = new AjxCallback(this, this._handleResponsePaginateConv, [conv, offset, callback]);
		conv.load({query:this.getSearchString(), offset:offset, callback:respCallback});
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
	if (this._mailListView._rowsArePresent(item)) {	
		this._mailListView._collapse(item);
	} else {
		// reset state and expand instead
		this._toggle(item);
	}
};

// Actions
//
// Since a selection might contain both convs and msgs, we need to split them up and
// invoke the action for each type separately.

/**
 * Takes the given list of items (convs and msgs) and splits it into one list of each
 * type. Since an action applied to a conv is also applied to its msgs, we remove any
 * msgs whose owning conv is also in the list.
 */
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

/**
 * Splits the given items into two lists, one of convs and one of msgs, and
 * applies the given method and args to each.
 *
 * @param items		[array]		list of convs and/or msgs
 * @param method	[string]	name of function to call in parent class
 * @param args		[array]		additional args to pass to function
 */
ZmHybridController.prototype._applyAction =
function(items, method, args) {
	args = args ? args : [];
	var lists = this._divvyItems(items);
	var hasMsgs = false;
	if (lists[ZmItem.MSG] && lists[ZmItem.MSG].length) {
		args.unshift(lists[ZmItem.MSG]);
		ZmDoublePaneController.prototype[method].apply(this, args);
		hasMsgs = true;
	}
	if (lists[ZmItem.CONV] && lists[ZmItem.CONV].length) {
		hasMsgs ? args[0] = lists[ZmItem.CONV] : args.unshift(lists[ZmItem.CONV])
		ZmDoublePaneController.prototype[method].apply(this, args);
	}
};

ZmHybridController.prototype._doFlag =
function(items) {
	var on = !items[0].isFlagged;
	this._applyAction(items, "_doFlag", [on]);
};

ZmHybridController.prototype._doTag =
function(items, tag, doTag) {
	this._applyAction(items, "_doTag", [tag, doTag]);
};

ZmHybridController.prototype._doRemoveAllTags =
function(items) {
	this._applyAction(items, "_doRemoveAllTags");
};

ZmHybridController.prototype._doDelete =
function(items, hardDelete, attrs) {
	this._applyAction(items, "_doDelete", [hardDelete, attrs]);
};

ZmHybridController.prototype._doMove =
function(items, folder, attrs, force) {
	this._applyAction(items, "_doMove", [folder, attrs, force]);
};

ZmHybridController.prototype._doMarkRead =
function(items, on) {
	this._applyAction(items, "_doMarkRead", [on]);
};

ZmHybridController.prototype._doSpam =
function(items, markAsSpam, folder) {
	this._applyAction(items, "_doSpam", [markAsSpam, folder]);
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
