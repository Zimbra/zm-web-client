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
 * Creates an empty message controller.
 * @constructor
 * @class
 * This class controls the display and management of a single message in the content area. Since it
 * needs to handle pretty much the same operations as a list, it extends ZmMailListController.
 *
 * @author Parag Shah
 * @author Conrad Damon
 * 
 * @param {DwtControl}	container		the containing shell
 * @param {constant}	type			type of controller
 * @param {ZmApp}		mailApp			the containing application
 * @param {string}		sessionId		the session id
 * 
 * @extends		ZmMailListController
 */
ZmMsgController = function(container, mailApp, type, sessionId) {

    if (arguments.length == 0) { return; }
	ZmMailListController.apply(this, arguments);
	this._elementsToHide = ZmAppViewMgr.LEFT_NAV;
};

ZmMsgController.prototype = new ZmMailListController;
ZmMsgController.prototype.constructor = ZmMsgController;

ZmMsgController.MODE_TO_CONTROLLER = {};
ZmMsgController.MODE_TO_CONTROLLER[ZmId.VIEW_TRAD]		= "GetTradController";
ZmMsgController.MODE_TO_CONTROLLER[ZmId.VIEW_CONV]		= "GetConvController";
ZmMsgController.MODE_TO_CONTROLLER[ZmId.VIEW_CONVLIST]	= "GetConvListController";

ZmMsgController.DEFAULT_TAB_TEXT = ZmMsg.message;

ZmMsgController.viewToTab = {};

ZmMsgController.prototype.isZmMsgController = true;
ZmMsgController.prototype.toString = function() { return "ZmMsgController"; };

// Public methods

ZmMsgController.getDefaultViewType =
function() {
	return ZmId.VIEW_MSG;
};
ZmMsgController.prototype.getDefaultViewType = ZmMsgController.getDefaultViewType;

/**
 * Displays a message in the single-pane view.
 *
 * @param {ZmMailMsg}			msg					the message to display
 * @param {ZmListController}	parentController	the controller that called this method
 * @param {AjxCallback}			callback			the client callback
 * @param {Boolean}				markRead			if <code>true</code>, mark msg read
 * @param {Boolean}				hidePagination		if <code>true</code>, hide the pagination buttons
 */
ZmMsgController.prototype.show = 
function(msg, parentController, callback, markRead, hidePagination, forceLoad, noTruncate) {
	this.setMsg(msg);
	this._parentController = parentController;
	//if(msg.list) {
        this.setList(msg.list);
    //}
	if (!msg._loaded || forceLoad) {
		var respCallback = new AjxCallback(this, this._handleResponseShow, [callback, hidePagination]);
		if (msg._loadPending) {
			// override any local callback if we're being launched by double-pane view,
			// so that multiple GetMsgRequest's aren't made
			msg._loadCallback = respCallback;
		} else {
			markRead = markRead || (appCtxt.get(ZmSetting.MARK_MSG_READ) == ZmSetting.MARK_READ_NOW);
			msg.load({callback:respCallback, markRead:markRead, forceLoad:forceLoad, noTruncate:noTruncate});
		}
	} else {
		// May have been explicitly marked as unread
		var marked = false;
		if (!msg.isReadOnly() && msg.isUnread && (appCtxt.get(ZmSetting.MARK_MSG_READ) != ZmSetting.MARK_READ_NONE)) {
			if (msg.list) {
				// Need to mark it on the server
				marked = true;
				var markCallback =  this._handleResponseShow.bind(this, callback, hidePagination);
				msg.list.markRead({items: msg, value: true, callback: markCallback, noBusyOverlay: true});
			}  else {
				msg.markRead();
			}
		}
		if (!marked) {
			this._handleResponseShow(callback, hidePagination);
		}
	}
};

ZmMsgController.prototype._handleResponseShow = 
function(callback, hidePagination, result) {
	this._showMsg();
	this._showNavToolBarButtons(this._currentViewId, !hidePagination);
	if (callback && callback.run) {
		callback.run(this, this._view[this._currentViewId]);
	}
};


/**
 * can't repro bug 77538 - but since the exception happens in ZmListController.prototype._setupContinuation if lastItem is not set, let's set it here to be on the safe side.
 */
ZmMsgController.prototype._setupContinuation =
function() {
	this._continuation.lastItem = true; //just a dummy value.  I could use this._msg but afraid that in the case of the bug (77538) - that I can't repro - this._msg might be empty.
	this._continuation.totalItems = 1;
	ZmListController.prototype._setupContinuation.apply(this, arguments);
};


/**
 * Called by ZmNewWindow.unload to remove tag list listener (which resides in 
 * the parent window). Otherwise, after the child window is closed, the parent 
 * window is still referencing the child window's msg controller, which has
 * been unloaded!!
 * 
 * @private
 */
ZmMsgController.prototype.dispose = 
function() {
	this._tagList.removeChangeListener(this._tagChangeListener);
};

ZmMsgController.prototype._showMsg = 
function() {
	this._showMailItem();
};

ZmMsgController.prototype._getTabParams =
function(tabId, tabCallback) {
	return {
		id:				tabId,
		textPrecedence:	85,
        image:          "CloseGray",
        hoverImage:     "Close",
        style:          DwtLabel.IMAGE_RIGHT,
		tooltip:		ZmMsgController.DEFAULT_TAB_TEXT,
		tabCallback:	tabCallback
	};
};

ZmMsgController.prototype.getKeyMapName =
function() {
	return ZmKeyMap.MAP_MESSAGE;
};

ZmMsgController.prototype.handleKeyAction =
function(actionCode) {
	DBG.println(AjxDebug.DBG3, "ZmMsgController.handleKeyAction");
	
	switch (actionCode) {
		case ZmKeyMap.CANCEL:
			this._backListener();
			break;

		case ZmKeyMap.NEXT_PAGE:
			this._goToMsg(this._currentViewId, true);
			break;

		case ZmKeyMap.PREV_PAGE:
			this._goToMsg(this._currentViewId, false);
			break;

		// switching view not supported here
		case ZmKeyMap.VIEW_BY_CONV:
		case ZmKeyMap.VIEW_BY_MSG:
			break;
		
		default:
			if (ZmMsgController.ALLOWED_SHORTCUT[actionCode]) {
				return ZmMailListController.prototype.handleKeyAction.call(this, actionCode);
			}
	}
	return true;
};

ZmMsgController.prototype.mapSupported =
function(map) {
	return false;
};

// Private methods (mostly overrides of ZmListController protected methods)

ZmMsgController.prototype._getToolBarOps = 
function() {
	var list = [ZmOperation.CLOSE, ZmOperation.SEP];
	list = list.concat(ZmMailListController.prototype._getToolBarOps.call(this));
	return list;
};

ZmMsgController.prototype._getRightSideToolBarOps =
function() {
	if (appCtxt.isChildWindow || !appCtxt.get(ZmSetting.DETACH_MAILVIEW_ENABLED) || appCtxt.isExternalAccount()) {
		return [];
	}
	return [ZmOperation.DETACH];
};


ZmMsgController.prototype._showDetachInSecondary =
function() {
	return false;
};

ZmMsgController.prototype._initializeToolBar =
function(view) {
	var className = appCtxt.isChildWindow ? "ZmMsgViewToolBar_cw" : null;

	ZmMailListController.prototype._initializeToolBar.call(this, view, className);
};

ZmMsgController.prototype._navBarListener =
function(ev) {
	var op = ev.item.getData(ZmOperation.KEY_ID);
	if (op == ZmOperation.PAGE_BACK || op == ZmOperation.PAGE_FORWARD) {
		this._goToMsg(this._currentViewId, (op == ZmOperation.PAGE_FORWARD));
	}
};

// message view has no view menu button
ZmMsgController.prototype._setupViewMenu = function(view, firstTime) {};

ZmMsgController.prototype._getActionMenuOps =
function() {
	return null;
};

ZmMsgController.prototype._initializeView =
function(view) {
	if (!this._view[view]) {
		var params = {
			parent:		this._container,
			id:			ZmId.getViewId(ZmId.VIEW_MSG, null, view),
			posStyle:	Dwt.ABSOLUTE_STYLE,
			mode:		ZmId.VIEW_MSG,
			controller:	this
		};
		this._view[view] = new ZmMailMsgView(params);
		this._view[view].addInviteReplyListener(this._inviteReplyListener);
		this._view[view].addShareListener(this._shareListener);
		this._view[view].addSubscribeListener(this._subscribeListener);
	}
};

ZmMsgController.prototype._initializeTabGroup =
function(view) {
	if (this._tabGroups[view]) { return; }

	ZmMailListController.prototype._initializeTabGroup.apply(this, arguments);

	this._tabGroups[view].removeMember(this._view[view]);
};

ZmMsgController.prototype._getSearchFolderId =
function() {
	return this._msg.folderId ? this._msg.folderId : (this._msg.list && this._msg.list.search) ?
		this._msg.list.search.folderId : null;
};

ZmMsgController.prototype._getTagMenuMsg =
function() {
	return ZmMsg.tagMessage;
};

ZmMsgController.prototype._getMoveDialogTitle =
function() {
	return ZmMsg.moveMessage;
};

ZmMsgController.prototype._setViewContents =
function(view) {
	this._view[view].set(this._msg);
};

ZmMsgController.prototype._resetNavToolBarButtons =
function(view) {
	view = view || this.getCurrentViewId();
	if (!this._navToolBar[view]) { return; }
	// NOTE: we purposely do not call base class here!
	if (!appCtxt.isChildWindow) {
		var list = this._msg.list && this._msg.list.getVector();

		this._navToolBar[view].enable(ZmOperation.PAGE_BACK, (list && (list.get(0) != this._msg)));

		var bEnableForw = list && (this._msg.list.hasMore() || (list.getLast() != this._msg));
		this._navToolBar[view].enable(ZmOperation.PAGE_FORWARD, bEnableForw);

		this._navToolBar[view].setToolTip(ZmOperation.PAGE_BACK, ZmMsg.previousMessage);
		this._navToolBar[view].setToolTip(ZmOperation.PAGE_FORWARD, ZmMsg.nextMessage);
	}
};

ZmMsgController.prototype._showNavToolBarButtons =
function(view, show) {
	var toolbar = this._navToolBar[view];
	if (!toolbar) { return; }
	if (!appCtxt.isChildWindow) {
		toolbar.getButton(ZmOperation.PAGE_BACK).setVisible(show);
		toolbar.getButton(ZmOperation.PAGE_FORWARD).setVisible(show);
	}
};

ZmMsgController.prototype._goToMsg =
function(view, next) {
	var controller = this._parentController;
	if (controller && controller.pageItemSilently) {
		controller.pageItemSilently(this._msg, next, this);
	}
};

ZmMsgController.prototype._selectNextItemInParentListView =
function() {
	var controller = this._parentController;
	if (controller && controller._getNextItemToSelect) {
		controller._view[controller._currentViewId]._itemToSelect = controller._getNextItemToSelect();
	}
};

ZmMsgController.prototype._doDelete =
function() {
	this._selectNextItemInParentListView();
	ZmMailListController.prototype._doDelete.apply(this, arguments);
};

ZmMsgController.prototype._doMove =
function() {
	this._selectNextItemInParentListView();
	ZmMailListController.prototype._doMove.apply(this, arguments);
};

ZmMsgController.prototype._doSpam =
function() {
	this._selectNextItemInParentListView();
	ZmMailListController.prototype._doSpam.apply(this, arguments);
};

ZmMsgController.prototype._menuPopdownActionListener =
function(ev) {
	// dont do anything since msg view has no action menus
};

// Miscellaneous

ZmMsgController.prototype.getMsg =
function(params) {
	return this._msg;
};

ZmMsgController.prototype.getItems =
function() {
	return [this._msg];
};

ZmMsgController.prototype._getLoadedMsg =
function(params, callback) {
	callback.run(this._msg);
};

ZmMsgController.prototype._getSelectedMsg =
function() {
	return this._msg;
};

ZmMsgController.prototype.setMsg = function (msg) {
	this._msg = msg;
    msg.refCount++
};

ZmMsgController.prototype.getItemView = function() {
	return this._view[this._currentViewId];
};

// No-op replenishment
ZmMsgController.prototype._checkReplenish =
function(params) {
	// XXX: remove this when replenishment is fixed for msg controller!
	DBG.println(AjxDebug.DBG1, "SORRY. NO REPLENISHMENT FOR YOU.");
};

ZmMsgController.prototype._checkItemCount =
function() {
	if (!appCtxt.isChildWindow) {
		this._backListener();
	}
};

ZmMsgController.prototype._getDefaultFocusItem = 
function() {
	return this._toolbar[this._currentViewId];
};

ZmMsgController.prototype._backListener =
function(ev) {
	// bug fix #30835 - prism triggers this listener twice for some reason :/
	if (appCtxt.isOffline && (this._currentViewId != appCtxt.getCurrentViewId())) {
		return;
	}
	var isChildWindow = appCtxt.isChildWindow;
	if (!this._app.popView() && !isChildWindow) {
		this._app.mailSearch();
	}
};

ZmMsgController.prototype.isTransient =
function(oldView, newView) {
	return (appCtxt.getViewTypeFromId(newView) != ZmId.VIEW_COMPOSE);
};

ZmMsgController.prototype._tabCallback =
function(oldView, newView) {
	return (appCtxt.getViewTypeFromId(oldView) == ZmId.VIEW_MSG);
};

ZmMsgController.prototype._printListener =
function(ev) {
    var ids = [];
    var item = this._msg;
    var id;
    var showImages;
    // always extract out the msg ids from the conv
    if (item.toString() == "ZmConv") {
        // get msg ID in case of virtual conv.
        // item.msgIds.length is inconsistent, so checking if conv id is negative.
        if (appCtxt.isOffline && item.id.split(":")[1]<0) {
            id = item.msgIds[0];
        } else {
            id = "C:" + item.id;
        }
        var msgList = item.getMsgList();
        for(var j=0; j<msgList.length; j++) {
            if(msgList[j].showImages) {
                showImages = true;
                break;
            }
        }
    } else {
        id = item.id;
        // Fix for bug: 84261, bug: 85363. partId is present if original message is present as an attachment.
        var part = item.partId;
        if (part) {
            id += "&part=" + part;
        }

        if (item.showImages) {
            showImages = true;
        }
    }
    var url = "/h/printmessage?id=" + id + "&tz=" + AjxTimezone.getServerId(AjxTimezone.DEFAULT);
    if (appCtxt.get(ZmSetting.DISPLAY_EXTERNAL_IMAGES) || showImages) {
        url += "&xim=1";
    }
    if (appCtxt.isOffline) {
        var acctName = item.getAccount().name;
        url+="&acct=" + acctName ;
    }
    window.open(appContextPath+url, "_blank");
};

ZmMsgController.prototype._subscribeResponseHandler =
function(statusMsg, ev) {
    ZmMailListController.prototype._subscribeResponseHandler.call(this, statusMsg, ev);
    //Close View
    appCtxt.getAppViewMgr().popView();
};

ZmMsgController.prototype._acceptShareHandler =
function(ev) {
    ZmMailListController.prototype._acceptShareHandler.call(this, ev);
	//Close View
	if (!appCtxt.isChildWindow) {
		appCtxt.getAppViewMgr().popView();
	}
};

ZmMsgController.prototype._setStatics = function() {

	if (!ZmMsgController.ALLOWED_SHORTCUT) {
		ZmMsgController.ALLOWED_SHORTCUT = AjxUtil.arrayAsHash([
			ZmKeyMap.FORWARD,
			ZmKeyMap.MOVE,
			ZmKeyMap.PRINT,
			ZmKeyMap.TAG,
			ZmKeyMap.UNTAG,
			ZmKeyMap.REPLY,
			ZmKeyMap.REPLY_ALL,
			ZmKeyMap.SPAM,
			ZmKeyMap.MARK_READ,
			ZmKeyMap.MARK_UNREAD,
			ZmKeyMap.FLAG
		]);
	}

	ZmMailListController.prototype._setStatics();
};

ZmMsgController.prototype._postRemoveCallback = function() {
    this._msg.refCount--;
};
