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
* Creates an empty message controller.
* @constructor
* @class
* This class controls the display and management of a single message in the content area. Since it
* needs to handle pretty much the same operations as a list, it extends ZmMailListController.
*
* @author Parag Shah
* @author Conrad Damon
* @param appCtxt	app context
* @param container	containing shell
* @param mailApp	containing app
*/
function ZmMsgController(appCtxt, container, mailApp) {

	ZmMailListController.call(this, appCtxt, container, mailApp);
};

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
*/
ZmMsgController.prototype.show = 
function(msg, mode) {
	this.setMsg(msg);
	this._mode = mode;
	this._currentView = this._getViewType();
	this._list = msg.list;
	if (!msg.isLoaded()) {
		var respCallback = new AjxCallback(this, this._handleResponseShow);
		msg.load(this._appCtxt.get(ZmSetting.VIEW_AS_HTML), false, respCallback);
	} else {
		this._showMsg();	
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

ZmMsgController.prototype._handleResponseShow = 
function(result) {
	this._showMsg();
};

ZmMsgController.prototype._showMsg = 
function() {
	this._setup(this._currentView);
	this._resetOperations(this._toolbar[this._currentView], 1); // enable all buttons
	var elements = new Object();
	elements[ZmAppViewMgr.C_TOOLBAR_TOP] = this._toolbar[this._currentView];
	elements[ZmAppViewMgr.C_APP_CONTENT] = this._listView[this._currentView];
	this._setView(this._currentView, elements, false, this.isChildWindow);
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
	if (this.isChildWindow) {
		return [ZmOperation.PRINT, ZmOperation.CLOSE];
	} else {
		var list = this._standardToolBarOps();
		list.push(ZmOperation.SEP);
		list = list.concat(this._msgOps());
		list.push(ZmOperation.SEP);
		list.push(ZmOperation.SPAM);
		list.push(ZmOperation.DETACH);
		return list;
	}
};

ZmMsgController.prototype._initializeToolBar = 
function(view, arrowStyle) {
	if (!this.isChildWindow) {
		ZmMailListController.prototype._initializeToolBar.call(this, view, arrowStyle);
	} else {
		var buttons = this._getToolBarOps();
		if (!buttons) return;
		this._toolbar[view] = new ZmButtonToolBar({parent:this._container, standardButtons:buttons, className:"ZmMsgViewToolBar_cw"});

		buttons = this._toolbar[view].opList;
		for (var i = 0; i < buttons.length; i++) {
			var button = buttons[i];
			if (this._listeners[button]) {
				this._toolbar[view].addSelectionListener(button, this._listeners[button]);
			}
		}
	}
};

ZmMsgController.prototype._getActionMenuOps =
function() {
	return null;
};

ZmMsgController.prototype._getViewType = 
function() {
	return ZmController.MSG_VIEW;
};

ZmMsgController.prototype._defaultView = 
function() {
	return ZmController.MSG_VIEW;
};

ZmMsgController.prototype._initializeListView = 
function(view) {
	if (!this._listView[view]) {
		this._listView[view] = new ZmMailMsgView(this._container, null, Dwt.ABSOLUTE_STYLE, ZmController.MSG_VIEW, this);
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
	return this._msg.list ? this._msg.list.search.folderId : null;
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
	if (!this.isChildWindow) {
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
	// NOTE: do not call base class.
	var controller = AjxDispatcher.run((this._mode == ZmController.TRAD_VIEW) ? "GetTradController" :
																				"GetConvController");

	if (controller) {
		controller.pageItemSilently(this._msg, bPageForward);
		this._resetNavToolBarButtons(view);
	}
};

ZmMsgController.prototype._processPrePopView = 
function(view) {
	this._resetNavToolBarButtons(view);
}

ZmMsgController.prototype._popdownActionListener = 
function(ev) {
	// dont do anything since msg view has no action menus
};

// Actions

// Override so we can pop view
ZmMsgController.prototype._doDelete = 
function(items, hardDelete, attrs) {
	ZmMailListController.prototype._doDelete.call(this, items, hardDelete, attrs);
	// XXX: async
	this._app.popView();
};

// Override so we can pop view
ZmMsgController.prototype._doMove = 
function(items, folder, attrs) {
	ZmMailListController.prototype._doMove.call(this, items, folder, attrs);
	// XXX: async
	this._app.popView();
};

// Override so we can pop view
ZmMsgController.prototype._doSpam = 
function(items, markAsSpam, folder) {
	ZmMailListController.prototype._doSpam.call(this, items, markAsSpam, folder);
	// XXX: async
	this._app.popView();
};

// Miscellaneous

// Returns the message currently being displayed.
ZmMsgController.prototype._getMsg =
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
