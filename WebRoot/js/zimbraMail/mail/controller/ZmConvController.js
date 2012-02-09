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
 * Creates a new, empty conversation controller.
 * @constructor
 * @class
 * This class manages the two-pane conversation view. The top pane contains a list
 * view of the messages in the conversation, and the bottom pane contains the current
 * message.
 *
 * @author Conrad Damon
 *
 * @param {DwtControl}		container			the containing shell
 * @param {ZmApp}			mailApp				the containing application
 * @param {constant}		type				type of controller
 * @param {string}			sessionId			the session id
 *
 * @extends		ZmMailListController
 */
ZmConvController = function(container, mailApp, type, sessionId) {

	ZmMailListController.apply(this, arguments);
	this._elementsToHide = ZmAppViewMgr.LEFT_NAV;
};

ZmConvController.prototype = new ZmMailListController;
ZmConvController.prototype.constructor = ZmConvController;

ZmConvController.prototype.isZmConvController = true;
ZmConvController.prototype.toString = function() { return "ZmConvController"; };

ZmMailListController.GROUP_BY_ICON[ZmId.VIEW_CONV] = "ConversationView";

ZmConvController.viewToTab = {};

ZmConvController.DEFAULT_TAB_TEXT = ZmMsg.conversation;

/**
 * Displays the given conversation in a two-pane view.
 *
 * @param {ZmSearch}			activeSearch		the current search results
 * @param {ZmConv}				conv				a conversation
 * @param {ZmListController}	parentController	the controller that called this method
 * @param {AjxCallback}			callback			the client callback
 * @param {Boolean}				markRead		if <code>true</code>, mark msg read
 */
ZmConvController.prototype.show =
function(activeSearch, conv, parentController, callback, markRead) {

	this._conv = conv;

	this._parentController = parentController;

	this._setup(this._currentViewId);

	if (!conv._loaded) {
		var respCallback = this._handleResponseLoadConv.bind(this, conv, callback);
		markRead = markRead || (appCtxt.get(ZmSetting.MARK_MSG_READ) == ZmSetting.MARK_READ_NOW);
		conv.load({getUnreadOrFirstMsg:true, markRead:markRead}, respCallback);
	} else {
		this._handleResponseLoadConv(conv, callback, conv._createResult());
	}
};

ZmConvController.prototype._handleResponseLoadConv =
function(conv, callback, result) {

	var searchResult = result.getResponse();
	var list = searchResult.getResults(ZmItem.MSG);
	if (list && list.isZmList) {
		this.setList(list);
		this._activeSearch = searchResult;
	}

	this._showConv();

	if (callback) {
		callback.run();
	}
};

ZmConvController.prototype._tabCallback =
function(oldView, newView) {
	return (appCtxt.getViewTypeFromId(oldView) == ZmId.VIEW_CONV);
};


ZmConvController.prototype._showConv =
function() {
	//for now it's straight forward but I keep this layer, if only for clarity of purpose by the name _showConv.
	this._showMailItem();
};

ZmConvController.prototype._resetNavToolBarButtons =
function(view) {
	//overide to do nothing.
};

ZmConvController.prototype._getTabParams =
function(tabId, tabCallback) {
	return {
		id:				tabId,
		image:			"ConvView",
		textPrecedence:	85,
		tooltip:		ZmDoublePaneController.DEFAULT_TAB_TEXT,
		tabCallback:	tabCallback
	};
};

ZmConvController.prototype._getActionMenuOps =
function() {
	return ZmDoublePaneController.prototype._getActionMenuOps.call(this);
};


ZmConvController.prototype._setViewContents =
function(view) {
	this._view[view].set(this._conv);
};

ZmConvController.prototype.getConv =
function() {
	return this._conv;
};


// Private and protected methods

ZmConvController.prototype._getReadingPanePref =
function() {
	return (this._readingPaneLoc || appCtxt.get(ZmSetting.READING_PANE_LOCATION_CV));
};

ZmConvController.prototype._setReadingPanePref =
function(value) {
	if (this.isSearchResults) {
		this._readingPaneLoc = value;
	}
	else {
		appCtxt.set(ZmSetting.READING_PANE_LOCATION_CV, value);
	}
};

ZmConvController.prototype._initializeView =
function(view) {
	if (!this._view[view]) {
		var params = {
			parent:		this._container,
			id:			ZmId.getViewId(ZmId.VIEW_CONV2, null, view),
			posStyle:	Dwt.ABSOLUTE_STYLE,
			mode:		ZmId.VIEW_CONV2,
			standalone:	true, //double-clicked stand-alone view of the conv (not within the double pane)
			controller:	this
		};
		this._view[view] = new ZmConvView2(params);
		this._view[view].addInviteReplyListener(this._inviteReplyListener);
		this._view[view].addShareListener(this._shareListener);
		this._view[view].addSubscribeListener(this._subscribeListener);
	}
};

ZmConvController.prototype._getToolBarOps =
function() {
	var list = [ZmOperation.CLOSE, ZmOperation.SEP];
	list = list.concat(ZmMailListController.prototype._getToolBarOps.call(this, true));
	return list;
};


ZmConvController.prototype._initializeToolBar = 
function(view) {
	if (!this._toolbar[view]) {
		ZmMailListController.prototype._initializeToolBar.call(this, view);
	}
	this._setupSpamButton(this._toolbar[view]);
};

// conv view has arrows to go to prev/next conv, so needs regular nav toolbar
ZmConvController.prototype._initializeNavToolBar =
function(view) {
//	ZmMailListController.prototype._initializeNavToolBar.apply(this, arguments);
//	this._itemCountText[ZmSetting.RP_BOTTOM] = this._navToolBar[view]._textButton;
};

ZmConvController.prototype._navBarListener =
function(ev) {
	var op = ev.item.getData(ZmOperation.KEY_ID);
	if (op == ZmOperation.PAGE_BACK || op == ZmOperation.PAGE_FORWARD) {
		this._goToConv(op == ZmOperation.PAGE_FORWARD);
	}
};

ZmConvController.prototype._setupViewMenuItems =
function(view, btn) {

	var menu = new ZmPopupMenu(btn);
	btn.setMenu(menu);

	this._setupReadingPaneMenuItems(view, menu, this.isReadingPaneOn());

	return menu;
};


ZmConvController.getDefaultViewType =
function() {
	return ZmId.VIEW_CONV;
};
ZmConvController.prototype.getDefaultViewType = ZmConvController.getDefaultViewType;

ZmConvController.prototype._setActiveSearch =
function(view) {
	// bug fix #7389 - do nothing!
};

// Operation listeners


// Handle DnD tagging (can only add a tag to a single item) - if a tag got dropped onto
// a msg, we need to update its conv
ZmConvController.prototype._dropListener =
function(ev) {
	ZmListController.prototype._dropListener.call(this, ev);
	// need to check to make sure tagging actually happened
	if (ev.action == DwtDropEvent.DRAG_DROP) {
		var div = this._listView[this._currentViewId].getTargetItemDiv(ev.uiEvent);
		if (div) {
			var tag = ev.srcData;
			if (!this._conv.hasTag(tag.id)) {
//				this._doublePaneView._setTags(this._conv); 	// update tag summary
			}
		}
	}
};


// Miscellaneous

// Called after a delete/move notification has been received.
// Return value indicates whether view was popped as a result of a delete.
ZmConvController.prototype.handleDelete =
function() {

	var popView = true;

	if (this._conv.numMsgs > 1) {
		popView = !this._conv.hasMatchingMsg(AjxDispatcher.run("GetConvListController").getList().search, true);
	}

	// Don't pop unless we're currently visible!
	var currViewId = appCtxt.getCurrentViewId();

	// bug fix #4356 - if currViewId is compose (among other restrictions) then still pop
	var popAnyway = false;
	if (currViewId == ZmId.VIEW_COMPOSE && this._conv.numMsgs == 1 && this._conv.msgs) {
		var msg = this._conv.msgs.getArray()[0];
		popAnyway = (msg.isInvite() && msg.folderId == ZmFolder.ID_TRASH);
	}

	popView = popView && ((currViewId == this._currentViewId) || popAnyway);

	if (popView) {
		this._app.popView();
	} else {
		var delButton = this._toolbar[this._currentViewId].getButton(ZmOperation.DELETE_MENU);
		var delMenu = delButton ? delButton.getMenu() : null;
		if (delMenu) {
			delMenu.enable(ZmOperation.DELETE_MSG, false);
		}
	}

	return popView;
};

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
			if (this._navToolBar[this._currentViewId].getButton(ZmOperation.PAGE_FORWARD).getEnabled()) {
				this._goToConv(true);
			}
			break;

		case ZmKeyMap.PREV_CONV:
			if (this._navToolBar[this._currentViewId].getButton(ZmOperation.PAGE_BACK).getEnabled()) {
				this._goToConv(false);
			}
			break;

		default:
			return ZmMailListController.prototype.handleKeyAction.call(this, actionCode);
	}
	return true;
};


ZmConvController.prototype._getNumTotal =
function() {
	return this._conv.numMsgs;
};

/**
 * Gets the selected message.
 *
 * @param	{Hash}	params		a hash of parameters
 * @return	{ZmMailMsg}		the selected message
 */
ZmConvController.prototype.getMsg =
function(params) {
	return ZmConvListController.prototype.getMsg.call(this, params); //we need to get the first hot message from the conv.
};

// overloaded...
ZmConvController.prototype._search =
function(view, offset, limit, callback) {
	var params = {
		sortBy: appCtxt.get(ZmSetting.SORTING_PREF, view),
		offset: offset,
		limit: limit,
		getFirstMsg: this.isReadingPaneOn()
	};
	this._conv.load(params, callback);
};

ZmConvController.prototype._goToConv =
function(next) {
	var ctlr = this._parentController || AjxDispatcher.run("GetConvListController");
	if (ctlr) {
		ctlr.pageItemSilently(this._conv, next);
	}
};

ZmConvController.prototype._getSearchFolderId =
function() {
	return this._conv.list.search.folderId;
};

// top level view means this view is allowed to get shown when user clicks on
// app icon in app toolbar - we dont want conv view to be top level (always show CLV)
ZmConvController.prototype._isTopLevelView =
function() {
	return false;
};

// don't preserve selection in CV, just select first hot msg as usual
ZmConvController.prototype._resetSelection = function() {};

ZmConvController.prototype._selectNextItemInParentListView =
function() {
	var controller = this._parentController || AjxDispatcher.run("GetConvListController");
	if (controller) {
		controller._listView[controller._currentViewId]._itemToSelect = controller._getNextItemToSelect();
	}
};

ZmConvController.prototype._checkItemCount =
function() {
	if (this._view[this._currentViewId]._selectedMsg) {
		return; //just a message was deleted, not the entire conv. Do nothing else.
	}
	this._backListener();
};

ZmConvController.prototype._doMove =
function() {
	this._selectNextItemInParentListView();
	ZmMailListController.prototype._doMove.apply(this, arguments);
};

ZmConvController.prototype._doSpam =
function() {
	this._selectNextItemInParentListView();
	ZmMailListController.prototype._doSpam.apply(this, arguments);
};

ZmConvController.prototype._msgViewCurrent =
function() {
	return true;
};
