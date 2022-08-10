/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2011, 2012, 2013, 2014, 2016 Synacor, Inc.
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
 * All portions of the code are Copyright (C) 2011, 2012, 2013, 2014, 2016 Synacor, Inc. All Rights Reserved.
 * ***** END LICENSE BLOCK *****
 */

/**
 * @overview
 */

/**
 * Creates an empty contact menu.
 * @class
 * This class represents a menu structure of contact groups that to which
 * contacts can be added. It also provides ability for user to create a new
 * contact group.
 *
 * @param {DwtControl}	parent		the parent widget
 * @param {ZmController}	controller	the owning controller
 * 
 * @extends		ZmPopupMenu
 */
ZmContactGroupMenu = function(parent, controller) {

	// create a menu (though we don't put anything in it yet) so that parent widget shows it has one
	ZmPopupMenu.call(this, parent, null, parent.getHTMLElId() + "|GROUP_MENU", controller);

	parent.setMenu(this);
	this._addHash = {};
	this._removeHash = {};
	this._evtMgr = new AjxEventMgr();
	this._desiredState = true;
	this._items = null;
	this._dirty = true;

	// Use a delay to make sure our slow popup operation isn't called when someone
	// is just rolling over a menu item to get somewhere else.
	if (parent instanceof DwtMenuItem) {
		parent.setHoverDelay(ZmContactGroupMenu._HOVER_TIME);
	}
};

ZmContactGroupMenu.prototype = new ZmPopupMenu;
ZmContactGroupMenu.prototype.constructor = ZmContactGroupMenu;

ZmContactGroupMenu.KEY_GROUP_EVENT		= "_contactGroupEvent_";
ZmContactGroupMenu.KEY_GROUP_ADDED		= "_contactGroupAdded_";
ZmContactGroupMenu.MENU_ITEM_ADD_ID	    = "group_add";

ZmContactGroupMenu._HOVER_TIME = 200;

ZmContactGroupMenu.prototype.toString =
function() {
	return "ZmContactGroupMenu";
};

ZmContactGroupMenu.prototype.addSelectionListener = 
function(listener) {
	this._evtMgr.addListener(DwtEvent.SELECTION, listener);
};

ZmContactGroupMenu.prototype.removeSelectionListener = 
function(listener) {
	this._evtMgr.removeListener(DwtEvent.SELECTION, listener);    	
};

ZmContactGroupMenu.prototype.setEnabled =
function(enabled) {
	this._desiredState = enabled;
	if (enabled && !this._contactGroupList) { return; }

	this.parent.setEnabled(enabled);
};

// Dynamically set the list of contact groups that can be added/removed based on the given list of items.
ZmContactGroupMenu.prototype.set =
function(items, contactGroupList, newDisabled) {
	DBG.println(AjxDebug.DBG3, "set contact group menu");
	this._contactGroupList = contactGroupList;
	this._items = items;
	this._dirty = true;
	this._newDisabled = newDisabled;

	this.parent.setEnabled(true);

	// Turn on the hover delay.
	if (this.parent instanceof DwtMenuItem) {
		this.parent.setHoverDelay(ZmContactGroupMenu._HOVER_TIME);
	}
};

ZmContactGroupMenu.prototype._doPopup =
function(x, y, kbGenerated) {
	if (this._dirty) {
		// reset the menu
		this.removeChildren();

		if (this._contactGroupList) {
			var groupNames = [];
			for (var i=0; i<this._contactGroupList.length; i++) {
				var contact = ZmContact.getContactFromCache(this._contactGroupList[i].id);
				if (contact && !ZmContact.isInTrash(contact)) {
					groupNames.push(ZmContact.getAttr(this._contactGroupList[i], "nickname"));
				}
				else {
					this._contactGroupList[i] = {id: false};
				}
			}
			this._render(groupNames);
		}
		this._dirty = false;

		// Remove the hover delay to prevent flicker when mousing around.
		if (this.parent instanceof DwtMenuItem) {
			this.parent.setHoverDelay(0);
		}
	}
	ZmPopupMenu.prototype._doPopup.call(this, x, y, kbGenerated);
};

ZmContactGroupMenu.prototype._render =
function(groupNames, addRemove) {

	for (var i = 0; i < this._contactGroupList.length; i++) {
		this._addNewGroup(this, this._contactGroupList[i], true, null, this._addHash);
	}

	if (this._contactGroupList.length) {
		new DwtMenuItem({parent:this, style:DwtMenuItem.SEPARATOR_STYLE});
	}

	// add static "New Contact Group" menu item
	var miNew = this._menuItems[ZmContactGroupMenu.MENU_ITEM_ADD_ID] = new DwtMenuItem({parent:this, id: this._htmlElId + "|NEWGROUP"});
	miNew.setText(ZmMsg.newGroup);
	miNew.setImage("NewGroup");
	if (this._newDisabled) {
		miNew.setEnabled(false);
	}
	else {
		miNew.setData(ZmContactGroupMenu.KEY_GROUP_EVENT, ZmEvent.E_CREATE);
		miNew.addSelectionListener(this._menuItemSelectionListener.bind(this), 0);
	}
};

ZmContactGroupMenu.groupNameLength = 20;
ZmContactGroupMenu.prototype._addNewGroup =
function(menu, group, add, index, groupHash) {
	var nickName = ZmContact.getAttr(group, "nickname") || group.fileAsStr;
	if (nickName) {
		var mi = new DwtMenuItem({parent:menu, index:index});
		var groupName = AjxStringUtil.clipByLength(nickName, ZmContactGroupMenu.groupNameLength);
		mi.setText(groupName);
		mi.setImage("Group");
		mi.addSelectionListener(this._menuItemSelectionListener.bind(this), 0);
		mi.setData(ZmContactGroupMenu.KEY_GROUP_EVENT, ZmEvent.E_MODIFY);
		mi.setData(ZmContactGroupMenu.KEY_GROUP_ADDED, add);
		mi.setData(Dwt.KEY_OBJECT, group);
	}
};

ZmContactGroupMenu.prototype._menuItemSelectionListener =
function(ev) {
	// Only notify if the node is one of our nodes
	if (ev.item.getData(ZmContactGroupMenu.KEY_GROUP_EVENT)) {
		this._evtMgr.notifyListeners(DwtEvent.SELECTION, ev.item);
	}
};

/**
 * Sets "New Contact Group" to be enabled/disabled
 * @param {Boolean} disabled true to set disabled
 */
ZmContactGroupMenu.prototype.setNewDisabled = 
function(disabled) {
	this._newDisabled = disabled;	
};