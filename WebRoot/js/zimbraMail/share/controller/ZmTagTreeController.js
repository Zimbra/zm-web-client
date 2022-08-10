/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2016 Synacor, Inc.
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
 * All portions of the code are Copyright (C) 2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2016 Synacor, Inc. All Rights Reserved.
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

	this._listeners[ZmOperation.NEW_TAG]		= this._newListener.bind(this);
	this._listeners[ZmOperation.RENAME_TAG]		= this._renameListener.bind(this);
	this._listeners[ZmOperation.TAG_COLOR_MENU]	= this._colorListener.bind(this);
};

ZmTagTreeController.prototype = new ZmTreeController;
ZmTagTreeController.prototype.constructor = ZmTagTreeController;

ZmTagTreeController.prototype.isZmTagTreeController = true;
ZmTagTreeController.prototype.toString = function() { return "ZmTagTreeController"; };

// Public methods

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
            mi.getMenu().addSelectionListener(this._listeners[ZmOperation.TAG_COLOR_MENU]);
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
					   ZmOperation.TAG_COLOR_MENU, ZmOperation.DELETE_WITHOUT_SHORTCUT], false);
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
	return [ZmOperation.NEW_TAG];
};

/**
 * Returns ops available for tags.
 * 
 * @private
 */
ZmTagTreeController.prototype._getActionMenuOps = function() {

	return [
		ZmOperation.NEW_TAG,
		ZmOperation.MARK_ALL_READ,
		ZmOperation.DELETE_WITHOUT_SHORTCUT,
		ZmOperation.RENAME_TAG,
		ZmOperation.TAG_COLOR_MENU,
		ZmOperation.OPEN_IN_TAB
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
ZmTagTreeController.prototype._itemClicked = function(tag, openInTab) {

	var searchFor;
	switch (appCtxt.getCurrentAppName()) {
		case ZmApp.CONTACTS:    searchFor = ZmItem.CONTACT; break;
		case ZmApp.CALENDAR:    searchFor = ZmItem.APPT; break;
		case ZmApp.BRIEFCASE:   searchFor = ZmItem.BRIEFCASE_ITEM; break;
		case ZmApp.TASKS:       searchFor = ZmItem.TASK; break;
		default:                searchFor = ZmId.SEARCH_MAIL; break;
	}

	var params = {
		query:              tag.createQuery(),
		searchFor:          searchFor,
		noGal:              true,
		inclSharedItems:    true,
		getHtml:            appCtxt.get(ZmSetting.VIEW_AS_HTML),
		accountName:        appCtxt.multiAccounts ? tag.getAccount().name : null,
		userInitiated:      openInTab
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
	var ds = this._deleteShield = appCtxt.getYesNoMsgDialog();
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
        var color = ev.item.getData(ZmOperation.MENUITEM_ID);
        if (String(color).match(/^#/)) {
            tag.setRGB(color);
        }
        else {
            tag.setColor(color);
        }
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
		} else if (sample instanceof ZmItem && sample.isReadOnly()) {
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
