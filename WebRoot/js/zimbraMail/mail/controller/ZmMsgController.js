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
 * Creates an empty message controller.
 * @constructor
 * @class
 * This class controls the display and management of a single message in the content area. Since it
 * needs to handle pretty much the same operations as a list, it extends ZmMailListController.
 *
 * @author Parag Shah
 * @author Conrad Damon
 * 
 * @param container	containing shell
 * @param mailApp	containing app 
 */
ZmMsgController = function(container, mailApp) {

	ZmMailListController.call(this, container, mailApp);
};

ZmMsgController.MODE_TO_CONTROLLER = {};
ZmMsgController.MODE_TO_CONTROLLER[ZmController.TRAD_VIEW]		= "GetTradController";
ZmMsgController.MODE_TO_CONTROLLER[ZmController.CONV_VIEW]		= "GetConvController";
ZmMsgController.MODE_TO_CONTROLLER[ZmController.CONVLIST_VIEW]	= "GetConvListController";

ZmMsgController.prototype = new ZmMailListController;
ZmMsgController.prototype.constructor = ZmMsgController;

// Public methods

ZmMsgController.prototype.toString = 
function() {
	return "ZmMsgController";
};

/**
* Displays a message in the single-pane view.
*
* @param msg		the message to display
* @param conv		the conv to which the message belongs, if any
* @param callback	client callback
*/
ZmMsgController.prototype.show = 
function(msg, mode, callback) {
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
			msg.load(appCtxt.get(ZmSetting.VIEW_AS_HTML), false, respCallback);
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
*/
ZmMsgController.prototype.dispose = 
function() {
	this._tagList.removeChangeListener(this._tagChangeLstnr);
};

ZmMsgController.prototype._showMsg = 
function() {
	this._setup(this._currentView);
	this._resetOperations(this._toolbar[this._currentView], 1); // enable all buttons
	var elements = {};
	elements[ZmAppViewMgr.C_TOOLBAR_TOP] = this._toolbar[this._currentView];
	elements[ZmAppViewMgr.C_APP_CONTENT] = this._listView[this._currentView];
	this._setView(this._currentView, elements, false, appCtxt.isChildWindow);
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

// Private methods (mostly overrides of ZmListController protected methods)

ZmMsgController.prototype._getToolBarOps = 
function() {
	if (appCtxt.isChildWindow) {
		return [ZmOperation.PRINT, ZmOperation.CLOSE];
	} else {
		var list = this._standardToolBarOps();
		list.push(ZmOperation.SEP);
		list = list.concat(this._msgOps());
		list.push(ZmOperation.SEP,
					ZmOperation.SPAM,
					ZmOperation.SEP,
					ZmOperation.TAG_MENU,
					ZmOperation.SEP);
        if(appCtxt.get(ZmSetting.DETACH_MAILVIEW_ENABLED))  list.push(ZmOperation.DETACH);
        return list;
	}
};

ZmMsgController.prototype._initializeToolBar =
function(view, arrowStyle) {
	if (!appCtxt.isChildWindow) {
		ZmMailListController.prototype._initializeToolBar.call(this, view, arrowStyle);
	} else {
		var buttons = this._getToolBarOps();
		if (!buttons) return;
		this._toolbar[view] = new ZmButtonToolBar({parent:this._container, buttons:buttons, className:"ZmMsgViewToolBar_cw",
												   context:this._getViewType()});

		buttons = this._toolbar[view].opList;
		for (var i = 0; i < buttons.length; i++) {
			var button = buttons[i];
			if (this._listeners[button]) {
				this._toolbar[view].addSelectionListener(button, this._listeners[button]);
			}
		}
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
	return ZmController.MSG_VIEW;
};

ZmMsgController.prototype._initializeListView =
function(view) {
	if (!this._listView[view]) {
		var params = {
			parent: this._container,
			posStyle: Dwt.ABSOLUTE_STYLE,
			mode: ZmController.MSG_VIEW,  // XXX: we should consolidate these
			view: ZmController.MSG_VIEW,  //      two settings
			controller: this
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
	// NOTE: we purposely do not call base class here!
	if (!appCtxt.isChildWindow) {
		var list = this._msg.list.getVector();

		this._navToolBar[view].enable(ZmOperation.PAGE_BACK, list.get(0) != this._msg);

		var bEnableForw = this._msg.list.hasMore() || (list.getLast() != this._msg);
		this._navToolBar[view].enable(ZmOperation.PAGE_FORWARD, bEnableForw);

		this._navToolBar[view].setToolTip(ZmOperation.PAGE_BACK, ZmMsg.previous + " " + ZmMsg.message);
		this._navToolBar[view].setToolTip(ZmOperation.PAGE_FORWARD, ZmMsg.next + " " + ZmMsg.message);
	}
};

ZmMsgController.prototype._paginate =
function(view, bPageForward) {
	// NOTE: do not call base class
	var controller = AjxDispatcher.run(ZmMsgController.MODE_TO_CONTROLLER[this._mode]);
	if (controller) {
		controller.pageItemSilently(this._msg, bPageForward);
		this._resetNavToolBarButtons(view);
	}
};

ZmMsgController.prototype._processPrePopView =
function(view) {
	this._resetNavToolBarButtons(view);
}

ZmMsgController.prototype._menuPopdownActionListener =
function(ev) {
	// dont do anything since msg view has no action menus
};

// Miscellaneous

ZmMsgController.prototype._getMsg =
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
	DBG.println("SORRY. NO REPLENISHMENT FOR YOU.");
};

ZmMsgController.prototype._getDefaultFocusItem = 
function() {
	return this._toolbar[this._currentView];
};
