/*
 * ***** BEGIN LICENSE BLOCK *****
 * Version: ZPL 1.1
 * 
 * The contents of this file are subject to the Zimbra Public License
 * Version 1.1 ("License"); you may not use this file except in
 * compliance with the License. You may obtain a copy of the License at
 * http://www.zimbra.com/license
 * 
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied. See
 * the License for the specific language governing rights and limitations
 * under the License.
 * 
 * The Original Code is: Zimbra Collaboration Suite.
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
* Creates a tag tree controller.
* @constructor
* @class
* This class controls a tree display of tags.
*
* @author Conrad Damon
* @param appCtxt	[ZmAppCtxt]		app context
*/
function ZmTagTreeController(appCtxt) {

	var dropTgt = new DwtDropTarget(ZmConv, ZmMailMsg, ZmContact);
	ZmTreeController.call(this, appCtxt, ZmOrganizer.TAG, dropTgt);

	this._listeners[ZmOperation.NEW_TAG] = new AjxListener(this, this._newListener);
	this._listeners[ZmOperation.RENAME_TAG] = new AjxListener(this, this._renameListener);
	this._listeners[ZmOperation.COLOR_MENU] = new AjxListener(this, this._colorListener);
}

ZmTagTreeController.prototype = new ZmTreeController;
ZmTagTreeController.prototype.constructor = ZmTagTreeController;

// Public methods

ZmTagTreeController.prototype.toString = 
function() {
	return "ZmTagTreeController";
}

/*
* Adds listeners for the color change menu items.
*/
ZmTagTreeController.prototype._initializeActionMenus = 
function() {
	ZmTreeController.prototype._initializeActionMenus.call(this);
	var mi = this._actionMenu.getMenuItem(ZmOperation.COLOR_MENU);
	if (mi) {
		var items = mi.getMenu().getItems();
		for (var i = 0; i < items.length; i++)
			items[i].addSelectionListener(this._listeners[ZmOperation.COLOR_MENU]);
	}
}

/**
* Enables/disables operations based on context.
*
* @param parent		the widget that contains the operations
* @param id			the currently selected/activated organizer
*/
ZmTagTreeController.prototype.resetOperations = 
function(parent, type, id) {
	var tag = this._appCtxt.getTagList().getById(id);
	parent.enableAll(true);
	if (id < ZmTag.FIRST_USER_ID) // system tag
		parent.enable([ZmOperation.RENAME_TAG, 
					   ZmOperation.COLOR_MENU, ZmOperation.DELETE], false);
	parent.enable(ZmOperation.MARK_ALL_READ, (tag && (tag.numUnread > 0)));
}

// Private/protected methods

/*
* Returns ops available for "Tags" container.
*/
ZmTagTreeController.prototype._getHeaderActionMenuOps =
function() {
	return [ZmOperation.NEW_TAG];
}

/*
* Returns ops available for tags.
*/
ZmTagTreeController.prototype._getActionMenuOps =
function() {
	var list = new Array();
	list.push(ZmOperation.NEW_TAG,
			  ZmOperation.MARK_ALL_READ,
			  ZmOperation.RENAME_TAG,
			  ZmOperation.DELETE,
			  ZmOperation.COLOR_MENU);
	return list;
}

/*
* Underlying model is a tag list (tag trees are flat).
*/
ZmTagTreeController.prototype._getData =
function() {
	return this._appCtxt.getTagList();
}

/*
* Returns a "New Tag" dialog.
*/
ZmTagTreeController.prototype._getNewDialog =
function() {
	return this._appCtxt.getNewTagDialog();
}

/*
* Returns a "Rename Folder" dialog.
*/
ZmTagTreeController.prototype._getRenameDialog =
function() {
	return this._appCtxt.getRenameTagDialog();
}

// Actions

/*
* Changes a tag's color.
*
* @param tag	[ZmTag]		a tag
* @param color	[constant]	its new color
*/
ZmTagTreeController.prototype._doColorTag =
function(params) {
	try {
		params.tag.setColor(params.color);
	} catch (ex) {
		this._handleException(ex, this._doColorTag, params, false);
	}
}

/*
* Called when a left click occurs (by the tree view listener). A search for
* the tag will be performed.
*
* @param tag		ZmTag		tag that was clicked
*/
ZmTagTreeController.prototype._itemClicked =
function(tag) {
	var searchController = this._appCtxt.getSearchController();
	var types = searchController.getTypes(ZmSearchToolBar.FOR_ANY_MI);
	searchController.search('tag:"' + tag.name + '"', types);
}

// Listeners

/*
* Deletes a tag. A dialog will first be displayed asking the user if they
* are sure they want to delete the tag.
*
* @param ev		[DwtUiEvent]	the UI event
*/
ZmTagTreeController.prototype._deleteListener = 
function(ev) {
	var organizer = this._pendingActionData = this._getActionedOrganizer(ev);
	if (!this._deleteShield) {
		this._deleteShield = new DwtMessageDialog(this._shell, null, [DwtDialog.YES_BUTTON, DwtDialog.NO_BUTTON]);
		this._deleteShield.registerCallback(DwtDialog.NO_BUTTON, this._clearDialog, this, this._deleteShield);
	}
	this._deleteShield.registerCallback(DwtDialog.YES_BUTTON, this._deleteShieldYesCallback, this, organizer);
	var msg = AjxStringUtil.resolve(ZmMsg.askDeleteTag, organizer.getName(false, ZmOrganizer.MAX_DISPLAY_NAME_LENGTH));
	this._deleteShield.setMessage(msg, DwtMessageDialog.WARNING_STYLE);
	this._deleteShield.popup();
}

/*
* Changes a tag's color.
*
* @param ev		[DwtUiEvent]	the UI event
*/
ZmTagTreeController.prototype._colorListener = 
function(ev) {
	this._schedule(this._doColorTag, {tag: this._getActionedOrganizer(ev), color: ev.item.getData(ZmOperation.MENUITEM_ID)});
}

/*
* Handles the potential drop of something onto a tag. Only items may be dropped.
* The source data is not the items themselves, but an object with the items (data)
* and their controller, so they can be moved appropriately. Dropping an item onto
* a tag causes the item to be tagged.
*
* @param ev		[DwtDropEvent]		the drop event
*/
ZmTagTreeController.prototype._dropListener =
function(ev) {
	if (ev.action == DwtDropEvent.DRAG_ENTER) {
		var data = ev.srcData.data;
		var sample = (data instanceof Array) ? data[0] : data;
		var tag = ev.targetControl.getData(Dwt.KEY_OBJECT);
		if (tag.id == ZmOrganizer.ID_ROOT) {
			ev.doIt = false;
		} else if (sample instanceof ZmContact && sample.isGal) {
			ev.doIt = false;
		} else {
			ev.doIt = this._dropTgt.isValidTarget(data);
		}
	} else if (ev.action == DwtDropEvent.DRAG_DROP) {
		var data = ev.srcData.data;
		var ctlr = ev.srcData.controller;
		var items = (data instanceof Array) ? data : [data];
		ctlr._schedule(ctlr._doTag, {items: items, tag: ev.targetControl.getData(Dwt.KEY_OBJECT), bTag: true});
	}
}

/*
* Handles a color change event.
*
* @param ev			[ZmEvent]		a change event
* @param treeView	[ZmTreeView]	a tree view
*/
ZmTagTreeController.prototype._changeListener =
function(ev, treeView) {
	var fields = ev.getDetail("fields");
	if (ev.event == ZmEvent.E_MODIFY && ((fields && fields[ZmOrganizer.F_COLOR]))) {
		var tag = ev.source;
		var node = treeView.getTreeItemById(tag.id);
		if (node)
			node.setImage(ZmTag.COLOR_ICON[tag.color]);
	} else {
		ZmTreeController.prototype._changeListener.call(this, ev, treeView);
	}
}

// Callbacks

/*
* Called when a "New Tag" dialog is submitted. This override is necessary because we
* need to pass the tag color to _doCreate().
* 
* @param 0	[string]	name of the new tag
* @param 1	[constant]	color of the new tag
*/
ZmTagTreeController.prototype._newCallback =
function(args) {
	this._schedule(this._doCreate, {name: args[0], color: args[1]});
	this._clearDialog(this._getNewDialog());
}

// Actions

/*
* Creates a new tag.
*
* @param name	[string]	name of the new tag
* @param color	[constant]	color of the new tag
*/
ZmTagTreeController.prototype._doCreate =
function(params) {
	try {
		var parent = this._appCtxt.getTagList().root;
		parent.create(params.name, params.color);
	} catch (ex) {
		if (ex.code == ZmCsfeException.MAIL_INVALID_NAME) {
			var msg = AjxStringUtil.resolve(ZmMsg.errorInvalidName, params.name);
			this._msgDialog.setMessage(msg, DwtMessageDialog.CRITICAL_STYLE);
			this._msgDialog.popup();
		} else {
			this._handleException(ex, ZmTagTreeController.prototype._doCreate, params, false);
		}
	}
}
