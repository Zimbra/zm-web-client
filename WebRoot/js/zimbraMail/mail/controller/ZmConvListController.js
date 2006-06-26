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
* Creates a new, empty conversation list controller.
* @constructor
* @class
* This class manages the conversation list view.
*
* @author Conrad Damon
* @param appCtxt	app context
* @param container	containing shell
* @param mailApp	containing app
*/
function ZmConvListController(appCtxt, container, mailApp) {

	ZmMailListController.call(this, appCtxt, container, mailApp);

	this._dragSrc = new DwtDragSource(Dwt.DND_DROP_MOVE);
	this._dragSrc.addDragListener(new AjxListener(this, this._dragListener));
};

ZmConvListController.prototype = new ZmMailListController;
ZmConvListController.prototype.constructor = ZmConvListController;

// Public methods

ZmConvListController.prototype.toString = 
function() {
	return "ZmConvListController";
};

/**
* Displays the given search results as a list of conversations.
*
* @param search		search results (which should contain a list of conversations)
*/
ZmConvListController.prototype.show =
function(searchResult) {
	
	// save previous offset and folder Id
	var oldOffset = this._listView[this._currentView] ? this._listView[this._currentView].getOffset() : 0;
	var oldFolderId = null;
	if (this._activeSearch && this._activeSearch.search)
		oldFolderId = this._activeSearch.search.folderId;

	ZmMailListController.prototype.show.call(this, searchResult);
	
	this._list = searchResult.getResults(ZmItem.CONV);
	this._setup(this._currentView);

	// if folders match and we're on the first page
	var selectedIdx = 0;
	if (oldFolderId && searchResult.search && searchResult.search.folderId && 
		oldFolderId == searchResult.search.folderId && oldOffset == 0)
	{
		// save first selected index if applicable
		var selectedItem = this._listView[this._currentView].getSelection()[0];
		if (selectedItem)
			selectedIdx = this._listView[this._currentView]._getItemIndex(selectedItem);
	}
	var elements = new Object();
	elements[ZmAppViewMgr.C_TOOLBAR_TOP] = this._toolbar[this._currentView];
	elements[ZmAppViewMgr.C_APP_CONTENT] = this._listView[this._currentView];
	this._setView(this._currentView, elements, true);
	this._setViewMenu(ZmController.CONVLIST_VIEW);
	this._setGroupMailBy(ZmItem.CONV);

	// reset selected index prior to resetting new list items
	var list = this._listView[this._currentView].getList();
	if (list) {
		var selectedItem = list.get(selectedIdx);
		if (!selectedItem && list.size() > 0)
			selectedItem = list.get(0);
		if (selectedItem)
			this._listView[this._currentView].setSelection(selectedItem);
	}
	
	this._resetNavToolBarButtons(this._currentView);
};

ZmConvListController.prototype.handleKeyAction =
function(actionCode) {
	DBG.println(AjxDebug.DBG3, "ZmConvListController.handleKeyAction");
	
	switch (actionCode) {
		case ZmKeyMap.DELETE:
			hardDelete = (this._list.search.folderId == ZmFolder.ID_TRASH);
			ZmMailListController.prototype._doDelete.call(this, items, hardDelete, attrs);
			break;
			
		default:
			return ZmMailListController.prototype.handleKeyAction.call(this, actionCode);
			break;
	}
	return true;
};

// Private and protected methods

// Custom tooltips for Reply/Reply All/Forward
ZmConvListController.prototype._initializeToolBar = 
function(view, arrowStyle) {
	ZmMailListController.prototype._initializeToolBar.call(this, view, arrowStyle);
	var buttons = [ZmOperation.REPLY, ZmOperation.REPLY_ALL];
	if (this._appCtxt.get(ZmSetting.FORWARD_MENU_ENABLED)) {
		buttons.push(ZmOperation.FORWARD_MENU);
	} else {
		buttons.push(ZmOperation.FORWARD);
	}
	for (var i = 0; i < buttons.length; i++) {
		var b = this._toolbar[view].getButton(buttons[i]);
		var key = ZmOperation.getProp(buttons[i], "tooltipKey") + "Conv";
		if (b) {
			b.setToolTipContent(ZmMsg[key]);
		}
	}
};

ZmConvListController.prototype._getToolBarOps =
function() {
	var list = this._standardToolBarOps();
	list.push(ZmOperation.SEP);
	list = list.concat(this._msgOps());
	list.push(ZmOperation.SEP);
	list.push(ZmOperation.SPAM);
	return list;
};

ZmConvListController.prototype._getActionMenuOps =
function() {
	var list = this._flagOps();
	list.push(ZmOperation.SEP);
	list = list.concat(this._msgOps());
	list.push(ZmOperation.SEP);
	list = list.concat(this._standardActionMenuOps());
	return list;
};

ZmConvListController.prototype._getViewType = 
function() {
	return ZmController.CONVLIST_VIEW;
};

ZmConvListController.prototype._getItemType =
function() {
	return ZmItem.CONV;
};

ZmConvListController.prototype._defaultView = 
function() {
	return ZmController.CONVLIST_VIEW;
};

ZmConvListController.prototype._createNewView = 
function(view) {
	var clv = new ZmConvListView(this._container, null, Dwt.ABSOLUTE_STYLE, this, this._dropTgt);
	clv.setDragSource(this._dragSrc);
	return clv;
};

ZmConvListController.prototype._setupViewMenu =
function(view) {
	ZmMailListController.prototype._setupGroupByMenuItems.call(this, view);
};

ZmConvListController.prototype.switchView =
function(view) {
	if (view == ZmController.TRAD_VIEW) {
		var sc = this._appCtxt.getSearchController();
		var sortBy = this._appCtxt.get(ZmSetting.SORTING_PREF, ZmController.TRAD_VIEW);
		var limit = this._appCtxt.get(ZmSetting.PAGE_SIZE); // bug fix #3365
		sc.redoSearch(this._appCtxt.getCurrentSearch(), null, {types: [ZmItem.MSG], offset: 0, sortBy: sortBy, limit: limit});
	}
};

ZmConvListController.prototype._getTagMenuMsg = 
function(num) {
	return (num == 1) ? ZmMsg.tagConversation : ZmMsg.tagConversations;
};

ZmConvListController.prototype._getMoveDialogTitle = 
function(num) {
	return (num == 1) ? ZmMsg.moveConversation : ZmMsg.moveConversations;
};

ZmConvListController.prototype._setViewContents =
function(view) {
	this._listView[view].set(this._list, ZmItem.F_DATE);
};

// List listeners

// Show conversation on double-click
ZmConvListController.prototype._listSelectionListener =
function(ev) {
	ZmMailListController.prototype._listSelectionListener.call(this, ev);
	if (ev.detail == DwtListView.ITEM_DBL_CLICKED) {
		if (ev.item.isDraft) {
			this._doAction(ev, ZmOperation.DRAFT);
		} else {
			this._app.getConvController().show(this._activeSearch, ev.item);
		}
	}
};

// Miscellaneous

// If we're viewing the Trash folder, do a hard delete of the selected convs
ZmConvListController.prototype._doDelete = 
function(items, hardDelete, attrs) {
	hardDelete = (this._list.search.folderId == ZmFolder.ID_TRASH);
	ZmMailListController.prototype._doDelete.call(this, items, hardDelete, attrs);
};

ZmConvListController.prototype._resetNavToolBarButtons = 
function(view) {
	ZmMailListController.prototype._resetNavToolBarButtons.call(this, view);
	this._navToolBar[view].setToolTip(ZmOperation.PAGE_BACK, ZmMsg.previous + " " + ZmMsg.page);
	this._navToolBar[view].setToolTip(ZmOperation.PAGE_FORWARD, ZmMsg.next + " " + ZmMsg.page);
};

ZmConvListController.prototype._processPrePopView = 
function(view) {
	this._resetNavToolBarButtons(view);
};
