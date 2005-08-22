/*
***** BEGIN LICENSE BLOCK *****
Version: ZPL 1.1

The contents of this file are subject to the Zimbra Public License Version 1.1 ("License");
You may not use this file except in compliance with the License. You may obtain a copy of
the License at http://www.zimbra.com/license

Software distributed under the License is distributed on an "AS IS" basis, WITHOUT WARRANTY
OF ANY KIND, either express or implied. See the License for the specific language governing
rights and limitations under the License.

The Original Code is: Zimbra Collaboration Suite.

The Initial Developer of the Original Code is Zimbra, Inc.
Portions created by Zimbra are Copyright (C) 2005 Zimbra, Inc.
All Rights Reserved.
Contributor(s): ______________________________________.

***** END LICENSE BLOCK *****
*/

/**
* Creates an empty mixed view controller.
* @constructor
* @class
* This class manages a view of heterogeneous items.
*
* @author Conrad Damon
* @param appCtxt		app context
* @param container		containing shell
* @param mixedApp		containing app
*/
function ZmMixedController(appCtxt, container, mixedApp) {

	ZmListController.call(this, appCtxt, container, mixedApp);

	this._dragSrc = new DwtDragSource(Dwt.DND_DROP_MOVE);
	this._dragSrc.addDragListener(new AjxListener(this, this._dragListener));
}

ZmMixedController.prototype = new ZmListController;
ZmMixedController.prototype.constructor = ZmMixedController;

ZmMixedController.prototype.toString = 
function() {
	return "ZmMixedController";
}

// Public methods

ZmMixedController.prototype.show =
function(searchResults, searchString) {
	ZmListController.prototype.show.call(this, searchResults, searchString);
	
	this._setup(this._currentView);

	this._list = searchResults.getResults(ZmList.MIXED);
	var elements = new Object();
	elements[ZmAppViewMgr.C_TOOLBAR_TOP] = this._toolbar[this._currentView];
	elements[ZmAppViewMgr.C_APP_CONTENT] = this._listView[this._currentView];
	this._setView(this._currentView, elements, true);
}

// Private and protected methods

ZmMixedController.prototype._getToolBarOps =
function() {
	return this._standardToolBarOps();
}

ZmMixedController.prototype._getActionMenuOps =
function() {
	return this._standardActionMenuOps();
}

ZmMixedController.prototype._getViewType = 
function() {
	return ZmController.MIXED_VIEW;
}

ZmMixedController.prototype._defaultView =
function() {
	return ZmController.MIXED_VIEW;
}

ZmMixedController.prototype._createNewView = 
function(view) {
	var mv = new ZmMixedView(this._container, null, DwtControl.ABSOLUTE_STYLE, this, this._dropTgt);
	mv.setDragSource(this._dragSrc);
	return mv;
}

ZmMixedController.prototype._getTagMenuMsg = 
function(num) {
	return (num == 1) ? ZmMsg.tagItem : ZmMsg.tagItems;
}

ZmMixedController.prototype._getMoveDialogTitle = 
function(num) {
	return (num == 1) ? ZmMsg.moveItem : ZmMsg.moveItems;
}

ZmMixedController.prototype._setViewContents =
function(view) {
	this._listView[view].set(this._list);
}

// List listeners

// Double click displays an item.
ZmMixedController.prototype._listSelectionListener =
function(ev) {
	ZmListController.prototype._listSelectionListener.call(this, ev);
	if (ev.detail == DwtListView.ITEM_DBL_CLICKED) {
		if (ev.item.type == ZmItem.CONTACT)
			this._appCtxt.getApp(ZmZimbraMail.CONTACTS_APP).getContactController().show(ev.item, this._isGalSearch);
		else if (ev.item.type == ZmItem.CONV)
			this._appCtxt.getApp(ZmZimbraMail.MAIL_APP).getConvController().show(null, this._searchString, ev.item);
		else if (ev.item.type == ZmItem.MSG)
			this._appCtxt.getApp(ZmZimbraMail.MAIL_APP).getMsgController().show(ev.item);
	}
}

ZmMixedController.prototype._listActionListener =
function(ev) {
	ZmListController.prototype._listActionListener.call(this, ev);
	this._actionMenu.popup(0, ev.docX, ev.docY);
}
