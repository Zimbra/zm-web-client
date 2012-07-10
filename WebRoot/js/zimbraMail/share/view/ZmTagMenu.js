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
 */

/**
 * Creates an empty tag menu.
 * @class
 * This class represents a menu structure of tags that can be added to or removed
 * from item(s). Based on the items passed in when it renders, it presents a 
 * list of tags that can be added (any tag all the items don't already have), and a
 * list of tags that can be removed (tags that any of the items have).
 * <p>
 * Since the content is set every time it is displayed, the tag menu doesn't need
 * a change listener.</p>
 *
 * @param {DwtControl}	parent		the parent widget
 * @param {ZmController}	controller	the owning controller
 * 
 * @extends		ZmPopupMenu
 */
ZmTagMenu = function(parent, controller) {

	// create a menu (though we don't put anything in it yet) so that parent widget shows it has one
	ZmPopupMenu.call(this, parent, null, parent.getHTMLElId() + "|MENU", controller);

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
		parent.setHoverDelay(ZmTagMenu._HOVER_TIME);
	}
};

ZmTagMenu.prototype = new ZmPopupMenu;
ZmTagMenu.prototype.constructor = ZmTagMenu;

ZmTagMenu.KEY_TAG_EVENT		= "_tagEvent_";
ZmTagMenu.KEY_TAG_ADDED		= "_tagAdded_";
ZmTagMenu.MENU_ITEM_ADD_ID	= "tag_add";
ZmTagMenu.MENU_ITEM_REM_ID	= "tag_remove";

ZmTagMenu._HOVER_TIME = 200;

ZmTagMenu.prototype.toString =
function() {
	return "ZmTagMenu";
};

ZmTagMenu.prototype.addSelectionListener = 
function(listener) {
	this._evtMgr.addListener(DwtEvent.SELECTION, listener);
};

ZmTagMenu.prototype.removeSelectionListener = 
function(listener) {
	this._evtMgr.removeListener(DwtEvent.SELECTION, listener);    	
};

ZmTagMenu.prototype.setEnabled =
function(enabled) {
	// If there are no tags, then enable later
	this._desiredState = enabled;
	if (enabled && !this._tagList) { return; }

	this.parent.setEnabled(enabled);
};

// Dynamically set the list of tags that can be added/removed based on the given list of items.
ZmTagMenu.prototype.set =
function(items, tagList) {
	DBG.println(AjxDebug.DBG3, "set tag menu");
	this._tagList = tagList;
	this._items = items;
	this._dirty = true;

	//commented out since in ZmMailMsgCapsuleView.prototype._resetOperations we call resetOperations of the ctrlr before this set. And I don't think this should enable the button anyway - this should be done elsewhere like it is.
	//another option would have been to reorder but I think this one is the safer one.
	//this.parent.setEnabled(true);

	// Turn on the hover delay.
	if (this.parent instanceof DwtMenuItem) {
		this.parent.setHoverDelay(ZmTagMenu._HOVER_TIME);
	}
};

ZmTagMenu.prototype._doPopup =
function(x, y, kbGenerated) {
	if (this._dirty) {
		// reset the menu
		this.removeChildren();

		if (this._tagList) {
			var rootTag = this._tagList.root;
			var addRemove = this._getAddRemove(this._items, rootTag);
			this._render(rootTag, addRemove);
		}
		this._dirty = false;

		// Remove the hover delay to prevent flicker when mousing around.
		if (this.parent instanceof DwtMenuItem) {
			this.parent.setHoverDelay(0);
		}
	}
	ZmPopupMenu.prototype._doPopup.call(this, x, y, kbGenerated);
};


// Given a list of items, produce two lists: one of tags that could be added (any tag
// that the entire list doesn't have), and one of tags that could be removed (any tag
// that any item has).
ZmTagMenu.prototype._getAddRemove = 
function(items, tagList) {
	// find out how many times each tag shows up in the items
	var tagCount = {};
	for (var i = 0; i < items.length; i++) {
		var item = items[i];
		if (!item || !item.tags || !item.tags.length) {
			continue;
		}
		for (var j = 0; j < item.tags.length; j++) {
			var tagName = item.tags[j];
			tagCount[tagName] = tagCount[tagName] || 0;
			tagCount[tagName] += 1;
		}
	}
	var add = {};
	var remove = [];
	// any tag held by fewer than all the items can be added
	var a = tagList.children.getArray();
	for (var i = 0; i < a.length; i++) {
		var tagName = a[i].name;
		if (!tagCount[tagName] || (tagCount[tagName] < items.length)) {
			add[tagName] = true;
		}
	}
	// any tag we saw can be removed
	for (var tagName in tagCount) {
		remove.push(tagName);
	}

	return {add: add, remove: remove};
};

// Create the list of tags that can be added, and the submenu with the list of
// tags that can be removed.
ZmTagMenu.prototype._render =
function(tagList, addRemove) {

	var sz = tagList.size();
	var a = tagList.children.getArray();
	for (var i = 0; i < sz; i++) {
		var tag = a[i];
		var tagName = tag.name;
		if (addRemove.add[tagName]) {
			this._addNewTag(this, tag, true, null, this._addHash);
		}
	}

	if (this._tagList.size()) {
		new DwtMenuItem({parent:this, style:DwtMenuItem.SEPARATOR_STYLE});
	}

	// add static "New Tag" menu item
	var map = appCtxt.getCurrentController() && appCtxt.getCurrentController().getKeyMapName();
	var addid = map ? (map + "_newtag"):this._htmlElId + "|NEWTAG";
	var removeid = map ? (map + "_removetag"):this._htmlElId + "|REMOVETAG";

	var miNew = this._menuItems[ZmTagMenu.MENU_ITEM_ADD_ID] = new DwtMenuItem({parent:this, id: addid});
	miNew.setText(AjxStringUtil.htmlEncode(ZmMsg.newTag));
	miNew.setImage("NewTag");
	miNew.setShortcut(appCtxt.getShortcutHint(this._keyMap, ZmKeyMap.NEW_TAG));
	miNew.setData(ZmTagMenu.KEY_TAG_EVENT, ZmEvent.E_CREATE);
	miNew.addSelectionListener(new AjxListener(this, this._menuItemSelectionListener), 0);

	// add static "Remove Tag" menu item
	var miRemove = this._menuItems[ZmTagMenu.MENU_ITEM_REM_ID] = new DwtMenuItem({parent:this, id: removeid});
	miRemove.setEnabled(false);
	miRemove.setText(AjxStringUtil.htmlEncode(ZmMsg.removeTag));
	miRemove.setImage("DeleteTag");

	var removeList = addRemove.remove;
	if (removeList.length > 0) {
		miRemove.setEnabled(true);
		var removeMenu = null;
		if (removeList.length > 1) {
			for (i = 0; i < removeList.length; i++) {
				if (!removeMenu) {
					removeMenu = new DwtMenu({parent:miRemove, className:this._className});
					miRemove.setMenu(removeMenu);
                    removeMenu.setHtmlElementId('REMOVE_TAG_MENU_' + this.getHTMLElId());
				}
				var tag = tagList.getByNameOrRemote(removeList[i]);
                var tagHtmlId = 'Remove_tag_' + i;
				this._addNewTag(removeMenu, tag, false, null, this._removeHash, tagHtmlId);
			}
			// if multiple removable tags, offer "Remove All"
			new DwtMenuItem({parent:removeMenu, style:DwtMenuItem.SEPARATOR_STYLE});
			var mi = new DwtMenuItem({parent:removeMenu, id:"REMOVE_ALL_TAGS"});
			mi.setText(ZmMsg.allTags);
			mi.setImage("TagStack");
			mi.setShortcut(appCtxt.getShortcutHint(this._keyMap, ZmKeyMap.UNTAG));
			mi.setData(ZmTagMenu.KEY_TAG_EVENT, ZmEvent.E_REMOVE_ALL);
			mi.setData(Dwt.KEY_OBJECT, removeList);
			mi.addSelectionListener(new AjxListener(this, this._menuItemSelectionListener), 0);
		}
		else {
			var tag = tagList.getByNameOrRemote(removeList[0]);
			miRemove.setData(ZmTagMenu.KEY_TAG_EVENT, ZmEvent.E_TAGS);
			miRemove.setData(ZmTagMenu.KEY_TAG_ADDED, false);
			miRemove.setData(Dwt.KEY_OBJECT, tag);
			miRemove.addSelectionListener(new AjxListener(this, this._menuItemSelectionListener), 0);
		}		

	}
};

ZmTagMenu.tagNameLength = 20;
ZmTagMenu.prototype._addNewTag =
function(menu, newTag, add, index, tagHash, tagHtmlId) {
	var mi = new DwtMenuItem({parent:menu, index:index, id:tagHtmlId});
    var tagName = AjxStringUtil.clipByLength(newTag.getName(false),ZmTagMenu.tagNameLength);
	var nameText = newTag.notLocal ? AjxMessageFormat.format(ZmMsg.tagNotLocal, tagName) : tagName;
    mi.setText(nameText);
    mi.setImage(newTag.getIconWithColor());
	mi.setData(ZmTagMenu.KEY_TAG_EVENT, ZmEvent.E_TAGS);
	mi.setData(ZmTagMenu.KEY_TAG_ADDED, add);
	mi.setData(Dwt.KEY_OBJECT, newTag);
	mi.addSelectionListener(new AjxListener(this, this._menuItemSelectionListener), 0);
	mi.setShortcut(appCtxt.getShortcutHint(null, ZmKeyMap.TAG));
	tagHash[newTag.id] = mi;
};

ZmTagMenu.prototype._menuItemSelectionListener =
function(ev) {
	// Only notify if the node is one of our nodes
	if (ev.item.getData(ZmTagMenu.KEY_TAG_EVENT)) {
		this._evtMgr.notifyListeners(DwtEvent.SELECTION, ev);
	}
};

