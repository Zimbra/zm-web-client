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
 * Creates an empty message controller.
 * @constructor
 * @class
 * This class controls the display and management of a single message in the content area. Since it
 * needs to handle pretty much the same operations as a list, it extends ZmMailListController.
 *
 * @author Parag Shah
 * @author Conrad Damon
 * 
 * @param {ZmComposite}	container	the containing shell
 * @param {ZmMailApp}	mailApp			the containing app
 * 
 * @extends		ZmMailListController
 */
ZmMsgController = function(container, mailApp) {

	ZmMailListController.call(this, container, mailApp);
};

ZmMsgController.prototype = new ZmMailListController;
ZmMsgController.prototype.constructor = ZmMsgController;

ZmMsgController.MODE_TO_CONTROLLER = {};
ZmMsgController.MODE_TO_CONTROLLER[ZmId.VIEW_TRAD]		= "GetTradController";
ZmMsgController.MODE_TO_CONTROLLER[ZmId.VIEW_CONV]		= "GetConvController";
ZmMsgController.MODE_TO_CONTROLLER[ZmId.VIEW_CONVLIST]	= "GetConvListController";

ZmMsgController.DEFAULT_TAB_TEXT = ZmMsg.message;

ZmMsgController.viewToTab = {};

// Public methods

ZmMsgController.prototype.toString = 
function() {
	return "ZmMsgController";
};

/**
 * Displays a message in the single-pane view.
 *
 * @param {ZmMailMsg}	msg		the message to display
 * @param {constant}	mode		the owning view ID
 * @param {AjxCallback}	callback	the client callback
 * @param {Boolean}	markRead	if <code>true</code>, mark msg read
 */
ZmMsgController.prototype.show = 
function(msg, mode, callback, markRead) {
	this.setMsg(msg);
	this._mode = mode;
	this._currentView = this._getViewType();
	this._list = msg.list;
	if (!msg._loaded) {
		var respCallback = new AjxCallback(this, this._handleResponseShow, callback);
		if (msg._loadPending) {
			// override any local callback if we're being launched by double-pane view,
			// so that multiple GetMsgRequest's aren't made
			msg._loadCallback = respCallback;
		} else {
			markRead = markRead || (appCtxt.get(ZmSetting.MARK_MSG_READ) == ZmSetting.MARK_READ_NOW);
			msg.load({callback:respCallback, markRead:markRead});
		}
	} else {
		this._handleResponseShow(callback);
	}
};

ZmMsgController.prototype._handleResponseShow = 
function(callback, result) {
	this._showMsg();
	if (callback) {
		callback.run();
	}
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
	this._tagList.removeChangeListener(this._tagChangeLstnr);
};

ZmMsgController.prototype._showMsg = 
function() {
	var avm = appCtxt.getAppViewMgr();
	this._setup(this._currentView);
	var elements = {};
	elements[ZmAppViewMgr.C_TOOLBAR_TOP] = this._toolbar[this._currentView];
	elements[ZmAppViewMgr.C_APP_CONTENT] = this._listView[this._currentView];
	var curView = avm.getCurrentViewId();
	var tabId = (curView && curView.indexOf(ZmId.VIEW_MSG) == 0) ? ZmMsgController.viewToTab[curView] : Dwt.getNextId();
	ZmMsgController.viewToTab[this.viewId] = tabId;
	var viewParams = {view:this._currentView, elements:elements, clear:appCtxt.isChildWindow, tabParams:this._getTabParams(tabId, new AjxCallback(this, this._tabCallback))};
	var buttonText = (this._msg && this._msg.subject) ? AjxStringUtil.htmlEncode(this._msg.subject.substr(0, ZmAppViewMgr.TAB_BUTTON_MAX_TEXT)) : ZmMsgController.DEFAULT_TAB_TEXT;
	this._setView(viewParams);
	avm.setTabTitle(this.viewId, buttonText);
	this._resetOperations(this._toolbar[this._currentView], 1); // enable all buttons
	this._resetNavToolBarButtons(this._currentView);
	this._toolbar[this._currentView].adjustSize();
};

ZmMsgController.prototype._getTabParams =
function(tabId, tabCallback) {
	return {id:tabId, image:"MessageView", textPrecedence:85, tooltip:ZmMsgController.DEFAULT_TAB_TEXT, tabCallback: tabCallback};
};

ZmMsgController.prototype.getKeyMapName =
function() {
	return "ZmMsgController";
};

ZmMsgController.prototype.handleKeyAction =
function(actionCode) {
	DBG.println(AjxDebug.DBG3, "ZmMsgController.handleKeyAction");
	
	switch (actionCode) {
		case ZmKeyMap.CANCEL:
			this._backListener();
			break;
			
		default:
			return ZmMailListController.prototype.handleKeyAction.call(this, actionCode);
			break;
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
	var list;
	if (appCtxt.isChildWindow) {
		list = [ZmOperation.CLOSE, ZmOperation.SEP, ZmOperation.PRINT, ZmOperation.DELETE];
		list.push(ZmOperation.SEP);
		list = list.concat(this._msgOps());
		list.push(ZmOperation.SEP, ZmOperation.SPAM, ZmOperation.SEP, ZmOperation.TAG_MENU);
	}
	else {
		list = this._standardToolBarOps();
		list.push(ZmOperation.SEP);
		list = list.concat(this._msgOps());
		list.push(ZmOperation.SEP,
					ZmOperation.SPAM,
					ZmOperation.SEP,
					ZmOperation.TAG_MENU,
					ZmOperation.SEP);
		if (appCtxt.get(ZmSetting.DETACH_MAILVIEW_ENABLED)) {
			list.push(ZmOperation.DETACH);
		}
	}
	return list;
};

ZmMsgController.prototype._initializeToolBar =
function(view) {
	if (!appCtxt.isChildWindow) {
		ZmMailListController.prototype._initializeToolBar.call(this, view);
	} else {
		var buttons = this._getToolBarOps();
		if (!buttons) return;
		var params = {
			parent:this._container,
			buttons:buttons,
			className:"ZmMsgViewToolBar_cw",
			context:this._getViewType(),
			controller:this
		};
		var tb = this._toolbar[view] = new ZmButtonToolBar(params);

		buttons = tb.opList;
		for (var i = 0; i < buttons.length; i++) {
			var button = buttons[i];
			if (this._listeners[button]) {
				tb.addSelectionListener(button, this._listeners[button]);
			}
		}

		this._setupSpamButton(tb);
		button = tb.getButton(ZmOperation.TAG_MENU);
		if (button) {
			button.noMenuBar = true;
			this._setupTagMenu(tb);
		}
	}
};

ZmMsgController.prototype._navBarListener =
function(ev) {
	var op = ev.item.getData(ZmOperation.KEY_ID);
	if (op == ZmOperation.PAGE_BACK || op == ZmOperation.PAGE_FORWARD) {
		this._goToMsg(this._currentView, (op == ZmOperation.PAGE_FORWARD));
	}
};

// message view has no view menu button
ZmMsgController.prototype._setupViewMenu = function(view, firstTime) {};

ZmMsgController.prototype._getActionMenuOps =
function() {
	return null;
};

ZmMsgController.prototype._getViewType =
function() {
	return this.viewId;
};

ZmMsgController.prototype._initializeListView =
function(view) {
	if (!this._listView[view]) {
		var params = {
			parent:		this._container,
			id:			ZmId.getViewId(ZmId.VIEW_MSG, null, view),
			posStyle:	Dwt.ABSOLUTE_STYLE,
			mode:		ZmId.VIEW_MSG,
			controller:	this
		};
		this._listView[view] = new ZmMailMsgView(params);
		this._listView[view].addInviteReplyListener(this._inviteReplyListener);
		this._listView[view].addShareListener(this._shareListener);
	}
};

ZmMsgController.prototype.getReferenceView =
function () {
	return this._listView[this._currentView];
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
	this._listView[view].set(this._msg);
};

ZmMsgController.prototype._resetNavToolBarButtons =
function(view) {
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

ZmMsgController.prototype._goToMsg =
function(view, next) {
	var controller = this._getParentListController();
	if (controller) {
		controller.pageItemSilently(this._msg, next);
	}
};

ZmMsgController.prototype._selectNextItemInParentListView =
function() {
	var controller = this._getParentListController();
	if (controller) {
		controller._listView[controller._currentView]._itemToSelect = controller._getNextItemToSelect();
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

ZmMsgController.prototype._getLoadedMsg =
function(params, callback) {
	callback.run(this._msg);
};

ZmMsgController.prototype._getSelectedMsg =
function() {
	return this._msg;
};

ZmMsgController.prototype.setMsg =
function (msg) {
	this._msg = msg;
};

// No-op replenishment
ZmMsgController.prototype._checkReplenish =
function(params) {
	// XXX: remove this when replenishment is fixed for msg controller!
	DBG.println(AjxDebug.DBG1, "SORRY. NO REPLENISHMENT FOR YOU.");
};

ZmMsgController.prototype._checkItemCount =
function() {
	this._backListener();
};

ZmMsgController.prototype._getDefaultFocusItem = 
function() {
	return this._toolbar[this._currentView];
};

ZmMsgController.prototype._backListener =
function(ev) {
	var isChildWindow = appCtxt.isChildWindow;
	if (!this._app.popView() && !isChildWindow) {
		this._app.mailSearch();
	}
};

ZmMsgController.prototype.isTransient =
function(oldView, newView) {
	return (newView && newView.indexOf(ZmId.VIEW_COMPOSE) != 0);
};

ZmMsgController.prototype._tabCallback =
function(oldView, newView) {
	return (oldView && oldView.indexOf(ZmId.VIEW_MSG) == 0);
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
        if (item._part) { id+= "&part=" + item._part; }
        if (item.showImages) {
            showImages = true;
        }
    }
    var url = "/h/printmessage?id=" + id;
    if (appCtxt.get(ZmSetting.DISPLAY_EXTERNAL_IMAGES) || showImages) {
        url += "&xim=1";
    }
    if (appCtxt.isOffline) {
        var acctName = items[0].getAccount().name;
        url+="&acct=" + acctName ;
    }
    window.open(appContextPath+url, "_blank");
};

/**
 * Returns the parent list controller (TV, CLV, or CV)
 *
 * @private
 */
ZmMsgController.prototype._getParentListController =
function() {
	var ac = appCtxt.isChildWindow ? parentAppCtxt : appCtxt;
	var mailApp = ac.getApp(ZmApp.MAIL);
	if (this._mode == ZmId.VIEW_TRAD) {
		return mailApp.getTradController();
	} else if (this._mode == ZmId.VIEW_CONV) {
		return mailApp.getConvController();
	} else if (this._mode == ZmId.VIEW_CONVLIST) {
		return mailApp.getConvListController();
	}
};
