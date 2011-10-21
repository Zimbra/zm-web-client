/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2004, 2005, 2006, 2007, 2008, 2009, 2010 Zimbra, Inc.
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

/**
 * Creates a new, empty conversation list controller.
 * @constructor
 * @class
 * This class manages the conversations mail view. Conversations are listed, and any
 * conversation with more than one message is expandable. Expanding a conversation
 * shows its messages in the list just below it.
 *
 * @author Conrad Damon
 *
 * @param {DwtControl}					container					the containing shell
 * @param {ZmApp}						mailApp						the containing application
 * @param {constant}					type						type of controller
 * @param {string}						sessionId					the session id
 * @param {ZmSearchResultsController}	searchResultsController		containing controller
 * 
 * @extends		ZmDoublePaneController
 */
ZmConvListController = function(container, mailApp, type, sessionId, searchResultsController) {
	ZmDoublePaneController.apply(this, arguments);

	this._msgControllerMode = this.getDefaultViewType();
};

ZmConvListController.prototype = new ZmDoublePaneController;
ZmConvListController.prototype.constructor = ZmConvListController;

ZmConvListController.prototype.isZmConvListController = true;
ZmConvListController.prototype.toString = function() { return "ZmConvListController"; };

ZmMailListController.ACTION_CODE_WHICH[ZmKeyMap.FIRST_UNREAD_MSG]	= DwtKeyMap.SELECT_FIRST;
ZmMailListController.ACTION_CODE_WHICH[ZmKeyMap.LAST_UNREAD_MSG]	= DwtKeyMap.SELECT_LAST;
ZmMailListController.ACTION_CODE_WHICH[ZmKeyMap.NEXT_UNREAD_MSG]	= DwtKeyMap.SELECT_NEXT;
ZmMailListController.ACTION_CODE_WHICH[ZmKeyMap.PREV_UNREAD_MSG]	= DwtKeyMap.SELECT_PREV;

ZmMailListController.GROUP_BY_SETTING[ZmId.VIEW_CONVLIST]	= ZmSetting.GROUP_BY_CONV;
ZmMailListController.GROUP_BY_SETTING[ZmId.VIEW_CONVLIST2]	= ZmSetting.GROUP_BY_CONV;

// view menu
ZmMailListController.GROUP_BY_ICON[ZmId.VIEW_CONVLIST]		= "ConversationView";
ZmMailListController.GROUP_BY_ICON[ZmId.VIEW_CONVLIST2]		= "ConversationView";
ZmMailListController.GROUP_BY_MSG_KEY[ZmId.VIEW_CONVLIST]	= "byConversation";
ZmMailListController.GROUP_BY_MSG_KEY[ZmId.VIEW_CONVLIST2]	= "byConversation";
ZmMailListController.GROUP_BY_SHORTCUT[ZmId.VIEW_CONVLIST]	= ZmKeyMap.VIEW_BY_CONV;
ZmMailListController.GROUP_BY_SHORTCUT[ZmId.VIEW_CONVLIST2]	= ZmKeyMap.VIEW_BY_CONV;
ZmMailListController.GROUP_BY_VIEWS.push(ZmId.VIEW_CONVLIST);
ZmMailListController.GROUP_BY_VIEWS.push(ZmId.VIEW_CONVLIST2);


// Public methods

ZmConvListController.getDefaultViewType =
function() {
	return appCtxt.get(ZmSetting.CONV_MODE);
};
ZmConvListController.prototype.getDefaultViewType = ZmConvListController.getDefaultViewType;

/**
 * Displays the given conversation in a two-pane view.
 *
 * @param {ZmSearchResult}	search		the current search results
 */
ZmConvListController.prototype.show =
function(search) {
	ZmDoublePaneController.prototype.show.call(this, search, search.getResults(ZmItem.CONV));
	appCtxt.set(ZmSetting.GROUP_MAIL_BY, ZmSetting.GROUP_BY_CONV);
};

/**
 * Handles switching the order of messages within expanded convs.
 *
 * @param view		[constant]*		the id of the new order
 * @param force		[boolean]		if true, always redraw view
 */
ZmConvListController.prototype.switchView =
function(view, force) {

	if (view == ZmSearch.DATE_DESC || view == ZmSearch.DATE_ASC) {
		if ((appCtxt.get(ZmSetting.CONVERSATION_ORDER) != view) || force) {
			appCtxt.set(ZmSetting.CONVERSATION_ORDER, view);
			if (this._currentViewType == ZmId.VIEW_CONVLIST) {
				this._mailListView.redoExpansion();
			}
			else if (this._currentViewType == ZmId.VIEW_CONVLIST2) {
				var cv = this._doublePaneView._itemView;
				cv.set(cv._conv, true);
			}
		}
		if (this._toolbar && this._toolbar[this._currentViewId]) {
			this._toolbar[this._currentViewId].adjustSize();
		}
	} else {
		ZmDoublePaneController.prototype.switchView.apply(this, arguments);
	}
};

// Internally we manage two maps, one for CLV and one for CV2 (if applicable)
ZmConvListController.prototype.getKeyMapName =
function() {
	return this._convViewHasFocus ? "ZmConvView2" : "ZmConvListController";
};

ZmConvListController.prototype.handleKeyAction =
function(actionCode) {

	DBG.println(AjxDebug.DBG3, "ZmConvListController.handleKeyAction");
	
	if (this._convViewHasFocus) {
		// hand off to ZmConvView2
		return this._doublePaneView._itemView.handleKeyAction(actionCode);
	}

	var mlv = this._mailListView;
	
	switch (actionCode) {

		case ZmKeyMap.EXPAND:
			if (this._currentViewType == ZmId.VIEW_CONVLIST2) {
				this._doublePaneView._mailListView._blur();
				this._doublePaneView._itemView._focus();
				break;
			}
			// EXPAND continues below if we are using hybrid view
		case ZmKeyMap.COLLAPSE:
			if (mlv.getSelectionCount() != 1) { return false; }
			var item = mlv.getItemFromElement(mlv._kbAnchor);
			if (!item) { return false; }
			if ((actionCode == ZmKeyMap.EXPAND) != mlv.isExpanded(item)) {
				mlv._expandItem(item);
			}
			break;

		case ZmKeyMap.TOGGLE:
			if (mlv.getSelectionCount() != 1) { return false; }
			var item = mlv.getItemFromElement(mlv._kbAnchor);
			if (!item) { return false; }
			if (item.type == ZmItem.CONV && !mlv._isExpandable(item)) {
				return DwtListView.prototype.handleKeyAction.call(mlv, DwtKeyMap.DBLCLICK);
			} else {
				mlv._expandItem(item);
			}
			break;

		case ZmKeyMap.EXPAND_ALL:
			mlv._expandAll(true);
			break;

		case ZmKeyMap.COLLAPSE_ALL:
			mlv._expandAll(false);
			break;

		case ZmKeyMap.NEXT_UNREAD_MSG:
		case ZmKeyMap.PREV_UNREAD_MSG:
			this.lastListAction = actionCode;
			var selItem, noBump = false;
			if (mlv.getSelectionCount() == 1) {
				var sel = mlv.getSelection();
				selItem = sel[0];
				if (selItem && mlv._isExpandable(selItem)) {
					noBump = true;
				}
			}

		case ZmKeyMap.FIRST_UNREAD_MSG:
		case ZmKeyMap.LAST_UNREAD_MSG:
			var item = (selItem && selItem.type == ZmItem.MSG && noBump) ? selItem :
					   this._getUnreadItem(ZmMailListController.ACTION_CODE_WHICH[actionCode], null, noBump);
			if (!item) { return; }
			if (!mlv.isExpanded(item) && mlv._isExpandable(item)) {
				var callback = new AjxCallback(this, this._handleResponseExpand, [actionCode]);
				if (item.type == ZmItem.MSG) {
					this._expand({conv:appCtxt.getById(item.cid), msg:item, offset:mlv._msgOffset[item.id], callback:callback});
				} else {
					this._expand({conv:item, callback:callback});
				}
			} else if (item) {
				this._selectItem(mlv, item);
			}
			break;

		// need to invoke DwtListView method directly since our list view no-ops DBLCLICK
		case DwtKeyMap.DBLCLICK:
			return DwtListView.prototype.handleKeyAction.apply(mlv, arguments);

		default:
			return ZmDoublePaneController.prototype.handleKeyAction.call(this, actionCode);
	}
	return true;
};

ZmConvListController.prototype._handleResponseExpand =
function(actionCode) {
	var unreadItem = this._getUnreadItem(ZmMailListController.ACTION_CODE_WHICH[actionCode], ZmItem.MSG);
	if (unreadItem) {
		this._selectItem(this._mailListView, unreadItem);
	}
};

/**
 * Override to handle paging among msgs within an expanded conv.
 * 
 * TODO: handle msg paging (current item is expandable msg)
 * 
 * @private
 */
ZmConvListController.prototype.pageItemSilently =
function(currentItem, forward) {
	if (!currentItem) { return; }
	if (currentItem.type == ZmItem.CONV) {
		ZmMailListController.prototype.pageItemSilently.apply(this, arguments);
		return;
	}
	
	var conv = appCtxt.getById(currentItem.cid);
	if (!(conv && conv.msgs)) { return; }
	var found = false;
	var list = conv.msgs.getArray();
	for (var i = 0, count = list.length; i < count; i++) {
		if (list[i] == currentItem) {
			found = true;
			break;
		}
	}
	if (!found) { return; }
	
	var msgIdx = forward ? i + 1 : i - 1;
	if (msgIdx >= 0 && msgIdx < list.length) {
		var msg = list[msgIdx];
		var clv = this._listView[this._currentViewId];
		clv.emulateDblClick(msg);
	}
};

// Private methods

ZmConvListController.prototype._createDoublePaneView = 
function() {
	if (appCtxt.get(ZmSetting.CONV_MODE) == ZmId.VIEW_CONVLIST2) {
		return new ZmConvDoublePaneView2({parent:this._container, posStyle:Dwt.ABSOLUTE_STYLE,
										  controller:this, dropTgt:this._dropTgt});
	} else {
		return new ZmConvDoublePaneView({parent:this._container, posStyle:Dwt.ABSOLUTE_STYLE,
										 controller:this, dropTgt:this._dropTgt});
	}
};

ZmConvListController.prototype._paginate = 
function(view, bPageForward, convIdx, limit) {
	view = view || this._currentViewId;
	return ZmDoublePaneController.prototype._paginate.call(this, view, bPageForward, convIdx, limit);
};

ZmConvListController.prototype._resetNavToolBarButtons =
function(view) {
	view = view || this.getCurrentViewId();
	ZmDoublePaneController.prototype._resetNavToolBarButtons.call(this, view);
	if (!this._navToolBar[view]) { return; }
	this._navToolBar[view].setToolTip(ZmOperation.PAGE_BACK, ZmMsg.previousPage);
	this._navToolBar[view].setToolTip(ZmOperation.PAGE_FORWARD, ZmMsg.nextPage);
};

ZmConvListController.prototype._setupConvOrderMenuItems =
function(view, menu) {

	if (menu.getItemCount() > 0) {
		new DwtMenuItem({parent:menu, style:DwtMenuItem.SEPARATOR_STYLE});
	}

	var ids = [ZmMailListController.CONV_ORDER_DESC, ZmMailListController.CONV_ORDER_ASC];
	var setting = appCtxt.get(ZmSetting.CONVERSATION_ORDER);
	var miParams = {style:DwtMenuItem.RADIO_STYLE, radioGroupId:"CO"};
	for (var i = 0; i < ids.length; i++) {
		var id = ids[i];
		if (!menu._menuItems[id]) {
			miParams.text = ZmMailListController.CONV_ORDER_TEXT[id];
			var mi = menu.createMenuItem(id, miParams);
			mi.setData(ZmOperation.MENUITEM_ID, id);
			mi.addSelectionListener(this._listeners[ZmOperation.VIEW]);
			mi.setChecked((setting == id), true);
		}
	}
};

// no support for showing total items, which are msgs
ZmConvListController.prototype._getNumTotal = function() { return null; }

ZmConvListController.prototype._getMoreSearchParams = 
function(params) {
	// OPTIMIZATION: find out if we need to pre-fetch the first hit message
	params.fetch = this.isReadingPaneOn();
	params.markRead = true;
};

ZmConvListController.prototype._listSelectionListener =
function(ev) {

	var item = ev.item;
	if (!item) { return; }
	if (ev.field == ZmItem.F_EXPAND && this._mailListView._isExpandable(item)) {
		this._toggle(item, false);
	} else {
		var handled = ZmDoublePaneController.prototype._listSelectionListener.apply(this, arguments);
		if (!handled) {
			if (ev.detail == DwtListView.ITEM_DBL_CLICKED) {
				var respCallback = new AjxCallback(this, this._handleResponseListSelectionListener, item);
				if (item.type == ZmItem.MSG) {
					AjxDispatcher.run("GetMsgController", item && item.nId).show(item, this._msgControllerMode, respCallback, true);
				} else {
					AjxDispatcher.run("GetConvController").show(this._activeSearch, item, this, respCallback, true);
				}
			}
		}
	}
};

ZmConvListController.prototype._handleResponseListSelectionListener =
function(item) {
	// make sure correct msg is displayed in msg pane when user returns
	if (this.isReadingPaneOn()) {
		this._setSelectedItem();
	}
};

ZmConvListController.prototype._setSelectedItem =
function() {
	
	if (this._currentViewType == ZmId.VIEW_CONVLIST2) {
		var selCnt = this._listView[this._currentViewId].getSelectionCount();
		if (selCnt == 1) {
			var sel = this._listView[this._currentViewId].getSelection();
			var conv = (sel && sel.length) ? sel[0] : null;
			var respCallback = this._handleResponseSetSelectedItem.bind(this, conv);
			conv.load({getUnreadOrFirstMsg:true, markRead:false}, respCallback);
		}
	} else {
		ZmDoublePaneController.prototype._setSelectedItem.apply(this, arguments);
	}
};

ZmConvListController.prototype._handleResponseSetSelectedItem =
function(item) {

	if (this._currentViewType == ZmId.VIEW_CONVLIST2) {
		// make sure list view has this msg
		var lv = this._listView[this._currentViewId];
		if (lv.hasItem(item.id)) {
			this._displayItem(item);
		}
	}
	else {
		ZmDoublePaneController.prototype._handleResponseSetSelectedItem.call(this, item);
	}
};

/**
 * Returns the first matching msg in the conv, if available. No request will
 * be made to the server if the conv has not been loaded.
 */
ZmConvListController.prototype.getMsg =
function(params) {
	var sel = this._listView[this._currentViewId].getSelection();
	var item = (sel && sel.length) ? sel[0] : null;
	if (item) {
		if (item.type == ZmItem.CONV) {
			return item.getFirstHotMsg(params);
		} else if (item.type == ZmItem.MSG) {
			return ZmDoublePaneController.prototype.getMsg.apply(this, arguments);
		}
	}
	return null;
};

/**
 * Returns the first matching msg in the conv. The conv will be loaded if necessary.
 */
ZmConvListController.prototype._getLoadedMsg =
function(params, callback) {
	params = params || {};
	var sel = this._listView[this._currentViewId].getSelection();
	var item = (sel && sel.length) ? sel[0] : null;
	if (item) {
		params.markRead = (appCtxt.get(ZmSetting.MARK_MSG_READ) == ZmSetting.MARK_READ_NOW);
		if (item.type == ZmItem.CONV) {
			var respCallback = new AjxCallback(this, this._handleResponseGetLoadedMsg, callback);
			item.getFirstHotMsg(params, respCallback);
		} else if (item.type == ZmItem.MSG) {
			ZmDoublePaneController.prototype._getLoadedMsg.apply(this, arguments);
		}
	} else {
		callback.run();
	}
};

ZmConvListController.prototype._handleResponseGetLoadedMsg =
function(callback, msg) {
	callback.run(msg);
};

ZmConvListController.prototype._getSelectedMsg =
function(callback) {
	var item = this._listView[this._currentViewId].getSelection()[0];
	if (!item) { return null; }
	
	return (item.type == ZmItem.CONV) ? item.getFirstHotMsg(null, callback) : item;
};

ZmConvListController.prototype._displayItem =
function(item) {
	this._doublePaneView.setItem(item);
	this._handleMarkRead(item);
};

ZmConvListController.prototype._handleMarkRead =
function(msg) {
	
	if (appCtxt.get(ZmSetting.CONV_MODE) == ZmId.VIEW_CONVLIST2) {
		var markRead = appCtxt.get(ZmSetting.MARK_MSG_READ);
		if (markRead == ZmSetting.MARK_READ_NOW) {
			this._doMarkRead([msg], true);
		} else if (markRead > 0) {
			if (!appCtxt.markReadAction) {
				appCtxt.markReadAction = new AjxTimedAction(this, this._markReadAction);
			}
			appCtxt.markReadAction.args = [ msg ];
			appCtxt.markReadActionId = AjxTimedAction.scheduleAction(appCtxt.markReadAction, markRead * 1000);
		}
	}
	else {
		ZmDoublePaneController.prototype._handleMarkRead.apply(this, arguments);
	}
};

ZmConvListController.prototype._toggle =
function(item, getFirstMsg) {
	if (this._mailListView.isExpanded(item)) {
		this._collapse(item);
	} else {
		var conv = item, msg = null, offset = 0;
		if (item.type == ZmItem.MSG) {
			conv = appCtxt.getById(item.cid);
			msg = item;
			offset = this._mailListView._msgOffset[item.id];
		}
		this._expand({conv:conv, msg:msg, offset:offset, getFirstMsg:getFirstMsg});
	}
};

/**
 * Expands the given conv or msg, performing a search to get items if necessary.
 *
 * @param params		[hash]			hash of params:
 *        conv			[ZmConv]		conv to expand
 *        msg			[ZmMailMsg]		msg to expand (get next page of msgs for conv)
 *        offset		[int]			index of msg in conv
 *        getFirstMsg	[boolean]		if true, fetch body of first msg
 *        callback		[AjxCallback]	callback to run when done
 */
ZmConvListController.prototype._expand =
function(params) {

	var conv = params.conv;
	var offset = params.offset || 0;
	var respCallback = new AjxCallback(this, this._handleResponseLoadItem, [params]);
	var pageWasCached = false;
	if (offset) {
		if (this._paginateConv(conv, offset, respCallback)) {
			// page was cached, callback won't be run
			this._handleResponseLoadItem(params, new ZmCsfeResult(conv.msgs));
		}
	} else if (!conv._loaded) {
		// no msgs have been loaded yet
		var getFirstMsg = (params.getFirstMsg === false) ? false : this.isReadingPaneOn();
		conv.load({getFirstMsg:getFirstMsg}, respCallback);
	} else {
		// re-expanding first page of msgs
		this._handleResponseLoadItem(params, new ZmCsfeResult(conv.msgs));
	}
};

ZmConvListController.prototype._handleResponseLoadItem =
function(params, result) {
	if (result) {
		this._mailListView._expand(params.conv, params.msg);
	}
	if (params.callback) {
		params.callback.run();
	}
};

/**
 * Adapted from ZmListController::_paginate
 */
ZmConvListController.prototype._paginateConv =
function(conv, offset, callback) {

	var list = conv.msgs;
	// see if we're out of msgs and the server has more
	var limit = appCtxt.get(ZmSetting.CONVERSATION_PAGE_SIZE);
	if (offset && list && ((offset + limit > list.size()) && list.hasMore())) {
		// figure out how many items we need to fetch
		var delta = (offset + limit) - list.size();
		var max = delta < limit && delta > 0 ? delta : limit;
		if (max < limit) {
			offset = ((offset + limit) - max) + 1;
		}
		var respCallback = new AjxCallback(this, this._handleResponsePaginateConv, [conv, offset, callback]);
		var getFirstMsg = this.isReadingPaneOn();
		conv.load({offset:offset, limit:limit, getFirstMsg:getFirstMsg}, respCallback);
		return false;
	} else {
		return true;
	}
};

ZmConvListController.prototype._handleResponsePaginateConv =
function(conv, offset, callback, result) {

	if (!conv.msgs) { return; }

	var searchResult = result.getResponse();
	conv.msgs.setHasMore(searchResult.getAttribute("more"));
	var newList = searchResult.getResults(ZmItem.MSG).getVector();
	conv.msgs.cache(offset, newList);
	if (callback) {
		callback.run(result);
	}
};

ZmConvListController.prototype._collapse =
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
ZmConvListController.prototype._divvyItems =
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
 * Need to make sure conv's msg list has current copy of draft.
 * 
 * @param msg	[ZmMailMsg]		saved draft
 */
ZmConvListController.prototype._draftSaved =
function(msg, resp) {

    if (resp) {
        msg = msg || new ZmMailMsg();
        msg._loadFromDom(resp);
    }
    var conv = appCtxt.getById(msg.cid);
	if (conv && conv.msgs && conv.msgs.size()) {
		var a = conv.msgs.getArray();
		for (var i = 0; i < a.length; i++) {
			if (a[i].id == msg.id) {
				a[i] = msg;
			}
		}
	}
	ZmDoublePaneController.prototype._draftSaved.apply(this, [msg]);
};

ZmConvListController.prototype._redrawDraftItemRows =
function(msg) {
	var lv = this._listView[this._currentViewId];
	var conv = appCtxt.getById(msg.cid);
	if (conv) {
		conv._loadFromMsg(msg);	// update conv
		lv.redrawItem(conv);
		lv.setSelection(conv, true);
	}
	// don't think a draft conv is ever expandable, but try anyway
	lv.redrawItem(msg);
};

/**
 * Splits the given items into two lists, one of convs and one of msgs, and
 * applies the given method and args to each.
 *
 * @param items		[array]			list of convs and/or msgs
 * @param method	[string]		name of function to call in parent class
 * @param args		[array]			additional args to pass to function
 */
ZmConvListController.prototype._applyAction =
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

ZmConvListController.prototype._doFlag =
function(items) {
	var on = !items[0].isFlagged;
	this._applyAction(items, "_doFlag", [on]);
};

ZmConvListController.prototype._doMsgPriority = 
function(items) {
	var on = !items[0].isPriority;
	this._applyAction(items, "_doMsgPriority", [on]);
};

ZmConvListController.prototype._doTag =
function(items, tag, doTag) {
	this._applyAction(items, "_doTag", [tag, doTag]);
};

ZmConvListController.prototype._doRemoveAllTags =
function(items) {
	this._applyAction(items, "_doRemoveAllTags");
};

ZmConvListController.prototype._doDelete =
function(items, hardDelete, attrs) {
	this._applyAction(items, "_doDelete", [hardDelete, attrs]);
};

ZmConvListController.prototype._doMove =
function(items, folder, attrs, isShiftKey) {
	this._applyAction(items, "_doMove", [folder, attrs, isShiftKey]);
};

ZmConvListController.prototype._doMarkRead =
function(items, on, callback, forceCallback) {
	this._applyAction(items, "_doMarkRead", [on, callback, forceCallback]);
};

ZmConvListController.prototype._doSpam =
function(items, markAsSpam, folder) {
	this._applyAction(items, "_doSpam", [markAsSpam, folder]);
};

// Callbacks

ZmConvListController.prototype._handleResponsePaginate = 
function(view, saveSelection, loadIndex, offset, result, ignoreResetSelection) {
	// bug fix #5134 - overload to ignore resetting the selection since it is handled by setView
	ZmListController.prototype._handleResponsePaginate.call(this, view, saveSelection, loadIndex, offset, result, true);
};
