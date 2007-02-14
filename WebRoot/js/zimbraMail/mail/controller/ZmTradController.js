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
* Creates a new, empty "traditional view" controller.
* @constructor
* @class
* This class manages the two-pane message view. The top pane contains a list
* view of the messages in the conversation, and the bottom pane contains the current
* message.
*
* @author Parag Shah
* @param appCtxt	app context
* @param container	containing shell
* @param mailApp	containing app
*/
function ZmTradController(appCtxt, container, mailApp) {
	ZmDoublePaneController.call(this, appCtxt, container, mailApp);
};

ZmTradController.prototype = new ZmDoublePaneController;
ZmTradController.prototype.constructor = ZmTradController;


// Public methods

ZmTradController.prototype.toString = 
function() {
	return "ZmTradController";
};

/**
* Displays the given conversation in a two-pane view. The view is actually
* created in _loadItem(), since it is a scheduled method and must execute
* last.
*
* @param search		[ZmSearchResult]	the current search results
*/
ZmTradController.prototype.show =
function(search) {
	this._list = search.getResults(ZmItem.MSG);

	// call base class
	ZmDoublePaneController.prototype.show.call(this, search, this._list);
	this._setGroupMailBy(ZmItem.MSG);
	this._resetNavToolBarButtons(ZmController.TRAD_VIEW);
};

ZmTradController.prototype.switchView =
function(view, toggle) {
	if (view == ZmController.READING_PANE_VIEW) {
		ZmDoublePaneController.prototype.switchView.call(this, view, toggle);
	} else if (view == ZmController.CONVLIST_VIEW) {
		var sc = this._appCtxt.getSearchController();
		var sortBy = this._appCtxt.get(ZmSetting.SORTING_PREF, ZmController.CONVLIST_VIEW);
		var limit = this._appCtxt.get(ZmSetting.PAGE_SIZE); // bug fix #3365
		sc.redoSearch(this._appCtxt.getCurrentSearch(), null, {types: [ZmItem.CONV], offset: 0, sortBy: sortBy, limit: limit});
	}
};

// Private methods

ZmTradController.prototype._createDoublePaneView = 
function() {
	return (new ZmTradView(this._container, null, Dwt.ABSOLUTE_STYLE, this, this._dropTgt));
};

ZmTradController.prototype._getViewType =
function() {
	return ZmController.TRAD_VIEW;
};

ZmTradController.prototype._getItemType =
function() {
	return ZmItem.MSG;
};

ZmTradController.prototype._defaultView =
function() {
	return ZmController.TRAD_VIEW;
};

ZmTradController.prototype._setupViewMenu =
function(view) {
	if (this._appCtxt.get(ZmSetting.CONVERSATIONS_ENABLED)) {
		var menu = this._setupGroupByMenuItems(this, view);
		new DwtMenuItem(menu, DwtMenuItem.SEPARATOR_STYLE);
	}
	this._setupReadingPaneMenuItem(view, menu, this._appCtxt.get(ZmSetting.READING_PANE_ENABLED));
};

ZmTradController.prototype._paginate = 
function(view, bPageForward, convIdx) {
	view = view ? view : this._currentView;
	return ZmDoublePaneController.prototype._paginate.call(this, view, bPageForward, convIdx);
};

ZmTradController.prototype._resetNavToolBarButtons = 
function(view) {
	ZmDoublePaneController.prototype._resetNavToolBarButtons.call(this, view);
	this._navToolBar[view].setToolTip(ZmOperation.PAGE_BACK, ZmMsg.previous + " " + ZmMsg.page);
	this._navToolBar[view].setToolTip(ZmOperation.PAGE_FORWARD, ZmMsg.next + " " + ZmMsg.page);
};

ZmTradController.prototype._getMoreSearchParams = 
function(params) {
	// OPTIMIZATION: find out if we need to pre-fetch the first hit message
	params.fetch = this._readingPaneOn;
	params.markRead = true;
};

// Callbacks

ZmTradController.prototype._processPrePopView = 
function(view) {
	this._resetNavToolBarButtons(view);
};

ZmTradController.prototype._handleResponsePaginate = 
function(view, saveSelection, loadIndex, offset, result, ignoreResetSelection) {
	// bug fix #5134 - overload to ignore resetting the selection since it is handled by setView
	ZmListController.prototype._handleResponsePaginate.call(this, view, saveSelection, loadIndex, offset, result, true);
};
