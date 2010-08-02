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
 * @overview
 * This file defines the tag tree controller.
 *
 */

/**
 * Creates a tag tree controller.
 * @class
 * This class controls a tree display of tags.
 *
 * @extends	ZmTreeController
 */
ZmTagTreeController = function() {

	ZmTreeController.call(this, ZmOrganizer.TAG);

	this._listeners[ZmOperation.NEW_TAG] = new AjxListener(this, this._newListener);
	this._listeners[ZmOperation.RENAME_TAG] = new AjxListener(this, this._renameListener);
	this._listeners[ZmOperation.TAG_COLOR_MENU] = new AjxListener(this, this._colorListener);
	this._listeners[ZmOperation.BROWSE] = new AjxListener(this, this._browseListener);
};

ZmTagTreeController.prototype = new ZmTreeController;
ZmTagTreeController.prototype.constructor = ZmTagTreeController;

// Public methods

/**
 * Returns a string representation of the object.
 * 
 * @return		{String}		a string representation of the object
 */
ZmTagTreeController.prototype.toString = 
function() {
	return "ZmTagTreeController";
};

/**
 * Adds listeners for the color change menu items.
 * 
 * @return	{ZmActionMenu}		the action menu
 * 
 * @private
 */
ZmTagTreeController.prototype._getActionMenu =
function() {
	var menu = ZmTreeController.prototype._getActionMenu.call(this);
	if (menu && !menu._initialized) {
		var mi = menu.getMenuItem(ZmOperation.TAG_COLOR_MENU);
		if (mi) {
			var items = mi.getMenu().getItems();
			for (var i = 0; i < items.length; i++) {
				items[i].addSelectionListener(this._listeners[ZmOperation.TAG_COLOR_MENU]);
			}
		}
		menu._initialized = true;
	}
	return menu;
};

/**
* Resets and enables/disables operations based on context.
*
* @param {Object}		parent		the widget that contains the operations
* @param {String}		id			the currently selected/activated organizer
*/
ZmTagTreeController.prototype.resetOperations = 
function(parent, type, id) {
	var tag = appCtxt.getById(id);
	parent.enableAll(true);
	if (tag.isSystem()) {
		parent.enable([ZmOperation.RENAME_TAG, 
					   ZmOperation.TAG_COLOR_MENU, ZmOperation.DELETE], false);
	}
	parent.enable(ZmOperation.MARK_ALL_READ, (tag && (tag.numUnread > 0)));
//	this._resetOperation(parent, ZmOperation.EXPORT_FOLDER, ZmMsg.exportTag);
};

// Private/protected methods

/**
 * Returns ops available for "Tags" container.
 * 
 * @private
 */
ZmTagTreeController.prototype._getHeaderActionMenuOps =
function() {
	return [ZmOperation.NEW_TAG, ZmOperation.BROWSE];
};

/**
 * Returns ops available for tags.
 * 
 * @private
 */
ZmTagTreeController.prototype._getActionMenuOps =
function() {
	return [
		ZmOperation.NEW_TAG,
		ZmOperation.MARK_ALL_READ,
		ZmOperation.RENAME_TAG,
		ZmOperation.DELETE,
		ZmOperation.TAG_COLOR_MENU
	];
};

/**
 * Returns a "New Tag" dialog.
 * 
 * @private
 */
ZmTagTreeController.prototype._getNewDialog =
function() {
	return appCtxt.getNewTagDialog();
};

/**
 * Returns a "Rename Tag" dialog.
 * 
 * @private
 */
ZmTagTreeController.prototype._getRenameDialog =
function() {
	return appCtxt.getRenameTagDialog();
};

// Actions

/**
 * Called when a left click occurs (by the tree view listener). A search for items with
 * the tag will be performed.
 *
 * @param {ZmTag}	tag		the tag that was clicked
 * 
 * @private
 */
ZmTagTreeController.prototype._itemClicked =
function(tag) {
	var searchFor;
	switch (appCtxt.getCurrentAppName()) {
		case ZmApp.CONTACTS:    searchFor = ZmItem.CONTACT; break;
		case ZmApp.NOTEBOOK:    searchFor = ZmItem.PAGE; break;
		case ZmApp.CALENDAR:    searchFor = ZmItem.APPT; break;
		case ZmApp.BRIEFCASE:   searchFor = ZmItem.BRIEFCASE_ITEM; break;
		case ZmApp.TASKS:       searchFor = ZmItem.TASK; break;
		default:                searchFor = ZmId.SEARCH_MAIL; break;
	}

	var params = {
		query: tag.createQuery(),
		searchFor: searchFor,
		getHtml: appCtxt.get(ZmSetting.VIEW_AS_HTML),
		accountName: (appCtxt.multiAccounts ? tag.getAccount().name : null)
	};
    //Bug:45878 Don't do a multi-account search for tags
    var sc = appCtxt.getSearchController();
	sc.searchAllAccounts = false;
	sc.search(params);
};

// Listeners

/**
 * Deletes a tag. A dialog will first be displayed asking the user if they
 * are sure they want to delete the tag.
 *
 * @param {DwtUiEvent}	ev		the UI event
 * 
 * @private
 */
ZmTagTreeController.prototype._deleteListener = 
function(ev) {
	var organizer = this._pendingActionData = this._getActionedOrganizer(ev);
	var ds = this._deleteShield = appCtxt.getYesNoCancelMsgDialog();
	ds.reset();
	ds.registerCallback(DwtDialog.NO_BUTTON, this._clearDialog, this, this._deleteShield);
	ds.registerCallback(DwtDialog.YES_BUTTON, this._deleteShieldYesCallback, this, organizer);
	var msg = AjxMessageFormat.format(ZmMsg.askDeleteTag, organizer.getName(false, ZmOrganizer.MAX_DISPLAY_NAME_LENGTH));
	ds.setMessage(msg, DwtMessageDialog.WARNING_STYLE);
	ds.popup();
};

/**
 * Changes the color of a tag.
 *
 * @param {DwtUiEvent}	ev		the UI event
 * 
 * @private
 */
ZmTagTreeController.prototype._colorListener = 
function(ev) {
	var tag = this._getActionedOrganizer(ev);
	if (tag) {
		tag.setColor(ev.item.getData(ZmOperation.MENUITEM_ID));
	}
};

/**
 * @private
 */
ZmTagTreeController.prototype._browseListener =
function(ev){
	var folder = this._getActionedOrganizer(ev);
	if (folder) {
		AjxDispatcher.require("Browse");
		appCtxt.getSearchController().showBrowsePickers([ZmPicker.TAG]);
	}
};

/**
 * Handles the potential drop of something onto a tag. Only items may be dropped.
 * The source data is not the items themselves, but an object with the items (data)
 * and their controller, so they can be moved appropriately. Dropping an item onto
 * a tag causes the item to be tagged.
 *
 * @param {DwtDropEvent}	ev		the drop event
 * 
 * @private
 */
ZmTagTreeController.prototype._dropListener =
function(ev) {
	var data = ev.srcData.data;
	if (ev.action == DwtDropEvent.DRAG_ENTER) {
		var sample = (data instanceof Array) ? data[0] : data;
		var tag = ev.targetControl.getData(Dwt.KEY_OBJECT);
		if (tag.id == ZmOrganizer.ID_ROOT) {
			ev.doIt = false;
		} else if (sample instanceof ZmContact && (sample.isGal || sample.isShared())) {
			ev.doIt = false;
		} else if (sample && (sample instanceof ZmItem) && sample.isShared()) {
			ev.doIt = false;
		} else if (appCtxt.multiAccounts && tag.getAccount() != sample.account) {
			ev.doIt = false;
		} else {
			ev.doIt = this._dropTgt.isValidTarget(data);
		}
	} else if (ev.action == DwtDropEvent.DRAG_DROP) {
		var ctlr = ev.srcData.controller;
		var items = (data instanceof Array) ? data : [data];
		ctlr._doTag(items, ev.targetControl.getData(Dwt.KEY_OBJECT), true);
	}
};

/**
 * Handles a color change event.
 *
 * @param {ZmEvent}		ev				the change event
 * @param {ZmTreeView}	treeView		the tree view
 * @param {constant}	overviewId		the overview ID
 * 
 * @private
 */
ZmTagTreeController.prototype._changeListener =
function(ev, treeView, overviewId) {
	var fields = ev.getDetail("fields");
	var organizers = ev.getDetail("organizers");
	for (var i = 0; i < organizers.length; i++) {
		var tag = organizers[i];
		if (ev.event == ZmEvent.E_MODIFY && ((fields && fields[ZmOrganizer.F_COLOR]))) {
			var node = treeView.getTreeItemById(tag.id);
			if (node)
				node.setImage(tag.getIconWithColor());
		} else {
			ZmTreeController.prototype._changeListener.call(this, ev, treeView, overviewId);
		}
	}
};

/**
 * @private
 */
ZmTagTreeController.prototype._setTreeItemColor =
function(treeItem, organizer) {
};
