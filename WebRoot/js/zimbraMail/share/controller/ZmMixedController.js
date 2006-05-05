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
 * Portions created by Zimbra are Copyright (C) 2005 Zimbra, Inc.
 * All Rights Reserved.
 * 
 * Contributor(s):
 * 
 * ***** END LICENSE BLOCK *****
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
	
	this._listeners[ZmOperation.UNDELETE] = new AjxListener(this, this._undeleteListener);
};

ZmMixedController.prototype = new ZmListController;
ZmMixedController.prototype.constructor = ZmMixedController;

ZmMixedController.prototype.toString = 
function() {
	return "ZmMixedController";
};

// Public methods

ZmMixedController.prototype.show =
function(searchResults) {
	ZmListController.prototype.show.call(this, searchResults);
	
	this._setup(this._currentView);

	this._list = searchResults.getResults(ZmList.MIXED);
	if (this._activeSearch) {
		if (this._list)
			this._list.setHasMore(this._activeSearch.getAttribute("more"));

		var newOffset = parseInt(this._activeSearch.getAttribute("offset"));
		if (this._listView[this._currentView])
			this._listView[this._currentView].setOffset(newOffset);
	}

	var elements = new Object();
	elements[ZmAppViewMgr.C_TOOLBAR_TOP] = this._toolbar[this._currentView];
	elements[ZmAppViewMgr.C_APP_CONTENT] = this._listView[this._currentView];
	this._setView(this._currentView, elements, true);
	this._resetNavToolBarButtons(this._currentView);
};

// Private and protected methods

ZmMixedController.prototype._initializeToolBar = 
function(view) {
	if (this._toolbar[view]) return;

	ZmListController.prototype._initializeToolBar.call(this, view);
	this._toolbar[view].addFiller();
	var tb = new ZmNavToolBar(this._toolbar[view], DwtControl.STATIC_STYLE, null, ZmNavToolBar.SINGLE_ARROWS, true);
	this._setNavToolBar(tb);
};

ZmMixedController.prototype._initializeActionMenu = 
function() {
	ZmListController.prototype._initializeActionMenu.call(this);
	// based on current search, show/hide undelete menu option
	var showUndelete = false;
	var folderId = this._activeSearch ? this._activeSearch.search.folderId : null;
	if (folderId) {
		var folderTree = this._appCtxt.getTree(ZmOrganizer.FOLDER);
		var folder = folderTree ? folderTree.getById(folderId) : null;
		showUndelete = folder && folder.isInTrash();
	}
	var mi = this._actionMenu.getMenuItem(ZmOperation.UNDELETE);
	mi.setVisible(showUndelete);
};

ZmMixedController.prototype._getToolBarOps =
function() {
	return this._standardToolBarOps();
};

ZmMixedController.prototype._getActionMenuOps =
function() {
	var list = this._standardActionMenuOps();
	list.push(ZmOperation.UNDELETE);
	return list;
};

ZmMixedController.prototype._getViewType = 
function() {
	return ZmController.MIXED_VIEW;
};

ZmMixedController.prototype._getItemType =
function() {
	return ZmList.MIXED;
};

ZmMixedController.prototype._defaultView =
function() {
	return ZmController.MIXED_VIEW;
};

ZmMixedController.prototype._createNewView = 
function(view) {
	var mv = new ZmMixedView(this._container, null, DwtControl.ABSOLUTE_STYLE, this, this._dropTgt);
	mv.setDragSource(this._dragSrc);
	return mv;
};

ZmMixedController.prototype._getTagMenuMsg = 
function(num) {
	return (num == 1) ? ZmMsg.tagItem : ZmMsg.tagItems;
};

ZmMixedController.prototype._getMoveDialogTitle = 
function(num) {
	return (num == 1) ? ZmMsg.moveItem : ZmMsg.moveItems;
};

ZmMixedController.prototype._setViewContents =
function(view) {
	this._listView[view].set(this._list);
};

ZmMixedController.prototype._resetNavToolBarButtons = 
function(view) {
	ZmListController.prototype._resetNavToolBarButtons.call(this, view);
	this._showListRange(view);
};

// List listeners

// Double click displays an item.
ZmMixedController.prototype._listSelectionListener =
function(ev) {
	ZmListController.prototype._listSelectionListener.call(this, ev);
	if (ev.detail == DwtListView.ITEM_DBL_CLICKED) {
		if (ev.item.type == ZmItem.CONTACT)
			this._appCtxt.getApp(ZmZimbraMail.CONTACTS_APP).getContactController().show(ev.item, this._isGalSearch);
		else if (ev.item.type == ZmItem.CONV)
			this._appCtxt.getApp(ZmZimbraMail.MAIL_APP).getConvController().show(this._activeSearch, ev.item);
		else if (ev.item.type == ZmItem.MSG)
			this._appCtxt.getApp(ZmZimbraMail.MAIL_APP).getMsgController().show(ev.item);
	}
};

ZmMixedController.prototype._listActionListener = 
function(ev) {
	ZmListController.prototype._listActionListener.call(this, ev);
	
	// based on the items selected, enable/disable and/or show/hide appropriate menu items
	var selItems = this._listView[this._currentView].getSelection();
	var selTypes = new Object();
	var numTypes = 0;
	for (var i = 0; i < selItems.length; i++) {
		if (!selTypes[selItems[i].type]) {
			selTypes[selItems[i].type] = true;
			numTypes++;
		}
	}
	
	var miUndelete = this._actionMenu.getMenuItem(ZmOperation.UNDELETE);
	var miMoveTo = this._actionMenu.getMenuItem(ZmOperation.MOVE);
	var folderId = this._activeSearch ? this._activeSearch.search.folderId : null;
	var folderTree = this._appCtxt.getTree(ZmOrganizer.FOLDER);
	var folder = folderTree && folderId ? folderTree.getById(folderId) : null;

	if (folder && folder.isInTrash()) {
		// only want to show Undelete menu item if contact(s) is selected
		var showUndelete = numTypes == 1 && selTypes[ZmItem.CONTACT] === true;
		var showMoveTo = numTypes == 1 && (selTypes[ZmItem.CONV] === true || selTypes[ZmItem.MSG] === true);
		var showBoth = selItems.length > 1 && numTypes > 1;
		var isDraft = numTypes == 1 && selItems[0].isDraft;
		
		miUndelete.setVisible(showUndelete || showBoth || isDraft);
		miMoveTo.setVisible((showMoveTo || showBoth) && !isDraft);
	
		// if >1 item is selected and they're not all the same type, disable both menu items
		this._actionMenu.enable([ZmOperation.UNDELETE, ZmOperation.MOVE], numTypes == 1);
	} else {
 		miUndelete.setVisible(false);	// never show Undelete option when not in Trash
 		miMoveTo.setVisible(true);		// always show Move To option
 		// show MoveTo only if one type has been selected and its not contacts
		var enableMoveTo = numTypes == 1 && selItems[0].type != ZmItem.CONTACT;
		this._actionMenu.enable(ZmOperation.MOVE, enableMoveTo);
	}
	this._actionMenu.popup(0, ev.docX, ev.docY);
};

ZmMixedController.prototype._undeleteListener = 
function(ev) {
	var items = this._listView[this._currentView].getSelection();

	// figure out the default for this item should be moved to
	var folder = null;
	if (items[0] instanceof ZmContact) {
		folder = new ZmFolder(ZmFolder.ID_CONTACTS);
	} else if (items[0] instanceof ZmAppt) {
		folder = new ZmFolder(ZmFolder.ID_CALENDAR);
	} else {
		var folderTree = this._appCtxt.getTree(ZmOrganizer.FOLDER);
		var folderId = items[0].isDraft ? ZmFolder.ID_DRAFTS : ZmFolder.ID_INBOX;
		folder = folderTree.getById(folderId);
	}

	if (folder)
		this._doMove(items, folder);
};
