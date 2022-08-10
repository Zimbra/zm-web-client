/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016 Synacor, Inc.
 *
 * The contents of this file are subject to the Common Public Attribution License Version 1.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at: https://www.zimbra.com/license
 * The License is based on the Mozilla Public License Version 1.1 but Sections 14 and 15
 * have been added to cover use of software over a computer network and provide for limited attribution
 * for the Original Developer. In addition, Exhibit A has been modified to be consistent with Exhibit B.
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * See the License for the specific language governing rights and limitations under the License.
 * The Original Code is Zimbra Open Source Web Client.
 * The Initial Developer of the Original Code is Zimbra, Inc.  All rights to the Original Code were
 * transferred by Zimbra, Inc. to Synacor, Inc. on September 14, 2015.
 *
 * All portions of the code are Copyright (C) 2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016 Synacor, Inc. All Rights Reserved.
 * ***** END LICENSE BLOCK *****
 */

/**
 * Creates a new, empty "traditional view" controller.
 * @constructor
 * @class
 * This class manages the two-pane message view. The top pane contains a list
 * view of the messages in the conversation, and the bottom pane contains the current
 * message.
 *
 * @author Parag Shah
 * 
 * @param {DwtControl}					container					the containing shell
 * @param {ZmApp}						mailApp						the containing application
 * @param {constant}					type						type of controller
 * @param {string}						sessionId					the session id
 * @param {ZmSearchResultsController}	searchResultsController		containing controller
 * 
 * @extends		ZmDoublePaneController
 * 
 * @private
 */
ZmTradController = function(container, mailApp, type, sessionId, searchResultsController) {
	ZmDoublePaneController.apply(this, arguments);

	this._listeners[ZmOperation.SHOW_CONV] = this._showConvListener.bind(this);
};

ZmTradController.prototype = new ZmDoublePaneController;
ZmTradController.prototype.constructor = ZmTradController;

ZmTradController.prototype.isZmTradController = true;
ZmTradController.prototype.toString = function() { return "ZmTradController"; };

ZmMailListController.GROUP_BY_ITEM[ZmId.VIEW_TRAD]		= ZmItem.MSG;
ZmMailListController.GROUP_BY_SETTING[ZmId.VIEW_TRAD]	= ZmSetting.GROUP_BY_MESSAGE;

// view menu
ZmMailListController.GROUP_BY_ICON[ZmId.VIEW_TRAD]		= "MessageView";
ZmMailListController.GROUP_BY_MSG_KEY[ZmId.VIEW_TRAD]	= "byMessage";
ZmMailListController.GROUP_BY_SHORTCUT[ZmId.VIEW_TRAD]	= ZmKeyMap.VIEW_BY_MSG;
ZmMailListController.GROUP_BY_VIEWS.push(ZmId.VIEW_TRAD);

// Public methods

ZmTradController.getDefaultViewType =
function() {
	return ZmId.VIEW_TRAD;
};
ZmTradController.prototype.getDefaultViewType = ZmTradController.getDefaultViewType;

/**
 * Displays the given message list in a two-pane view.
 *
 * @param {ZmSearchResult}	searchResults		the current search results
 */
ZmTradController.prototype.show =
function(searchResults) {
	ZmDoublePaneController.prototype.show.call(this, searchResults, searchResults.getResults(ZmItem.MSG));
	if (!appCtxt.isExternalAccount() && !this.isSearchResults && !(searchResults && searchResults.search && searchResults.search.isDefaultToMessageView)) {
		appCtxt.set(ZmSetting.GROUP_MAIL_BY, ZmSetting.GROUP_BY_MESSAGE);
	}
	this._resetNavToolBarButtons(ZmId.VIEW_TRAD);
};

ZmTradController.prototype.handleKeyAction =
function(actionCode, ev) {

	DBG.println(AjxDebug.DBG3, "ZmTradController.handleKeyAction");

	switch (actionCode) {
		case ZmKeyMap.KEEP_READING:
			return this._keepReading(false, ev);
			break;

		default:
			return ZmDoublePaneController.prototype.handleKeyAction.apply(this, arguments);
	}
};

// Private methods

ZmTradController.prototype._createDoublePaneView = 
function() {
	return (new ZmTradView({parent:this._container, posStyle:Dwt.ABSOLUTE_STYLE,
							controller:this, dropTgt:this._dropTgt}));
};

ZmTradController.prototype._resetOperations = 
function(parent, num) {
	ZmDoublePaneController.prototype._resetOperations.apply(this, arguments);
	parent.enable(ZmOperation.SHOW_CONV, (num == 1) && !appCtxt.isWebClientOffline());
};

ZmTradController.prototype._paginate = 
function(view, bPageForward, convIdx, limit) {
	view = view || this._currentViewId;
	return ZmDoublePaneController.prototype._paginate.call(this, view, bPageForward, convIdx, limit);
};

ZmTradController.prototype._resetNavToolBarButtons = 
function(view) {

	view = view || this.getCurrentViewId();
	ZmDoublePaneController.prototype._resetNavToolBarButtons.call(this, view);
	if (!this._navToolBar[view]) { return; }

	this._navToolBar[view].setToolTip(ZmOperation.PAGE_BACK, ZmMsg.previousPage);
	this._navToolBar[view].setToolTip(ZmOperation.PAGE_FORWARD, ZmMsg.nextPage);
};

ZmTradController.prototype._keepReading = 
function(check, ev) {
	
	if (!this.isReadingPaneOn() || !this._itemViewCurrent()) { return false; }
	var mlv = this._mailListView;
	if (!mlv || mlv.getSelectionCount() != 1) { return false; }
	
	var itemView = this.getItemView();
	var result = itemView && itemView._keepReading(check);
	if (check) {
		result = result || !!(this._getUnreadItem(DwtKeyMap.SELECT_NEXT));
	}
	else {
		result = result || this.handleKeyAction(ZmKeyMap.NEXT_UNREAD, ev);
		if (result) {
			this._checkKeepReading();
		}
	}
	return result;
};

ZmTradController.prototype._showConvListener =
function() {
	var msg = this.getMsg();
	if (!msg) { return; }

	var list = new ZmMailList(ZmItem.CONV);
	list.search = msg.list.search;
	var conv = ZmConv.createFromMsg(msg, {list: list});
	AjxDispatcher.run("GetConvController").show(conv, this, null, null, msg);
};

// Callbacks

ZmTradController.prototype._handleResponsePaginate = 
function(view, saveSelection, loadIndex, offset, result, ignoreResetSelection) {
	// bug fix #5134 - overload to ignore resetting the selection since it is handled by setView
	ZmMailListController.prototype._handleResponsePaginate.call(this, view, saveSelection, loadIndex, offset, result, true);
};
