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
 * This file contains the operation class.
 * 
 */

/**
 * Creates the operation object.
 * @class
 * This class provides the idea of an "operation", which is a user-initiated action
 * exposed through a button or menu item. Many operations (such as Delete) are shared
 * across applications/controllers. An operation gets defined by specifying its name,
 * tool tip, and image. Then controllers can simply select which operations they'd like
 * to support.
 * <br/>
 * <br/>
 * The two primary clients of this class are {@link ZmButtonToolBar} and {@link ZmActionMenu}. Clients 
 * should support {@link #createOp} and {@link #getOp} methods. See the two aforementioned clients for
 * examples.
 * 
 * @author Conrad Damon
 */
ZmOperation = function() {};

// Special operations
ZmOperation.NONE 					= "NONE";		// no operations or menu items
ZmOperation.SEP 					= "SEP";		// separator
ZmOperation.SPACER 					= "SPACER";		// spacer (toolbar)
ZmOperation.FILLER 					= "FILLER";		// filler (toolbar)

// suffix for disabled image
ZmOperation.DIS = "Dis";

// text and icons displayed for operation
ZmOperation.SETUP = {};

// special-purpose operations
ZmOperation.SETUP[ZmOperation.NONE]		= {};	// means no operations (as opposed to a default set)
ZmOperation.SETUP[ZmOperation.SEP]		= {};	// a thin vertical or horizontal bar
ZmOperation.SETUP[ZmOperation.SPACER]	= {};	// empty space of a given size
ZmOperation.SETUP[ZmOperation.FILLER]	= {};	// expandable space (for right-align in toolbars)

// preconditions for operations - no automatic checking is done, so a client
// of this class has to check them on its own if it wants
ZmOperation.SETTING = {};

// code to run after an operation has been created - typically used to create
// a menu for a button
ZmOperation.CALLBACK = {};

/**
 * Defines the aspects of an operation, and the ID that refers to it.
 * 
 * @param {String}	op		the name of the operation
 * @param {String}	text		the msg key for button or menu item text
 * @param {String}	tooltip	the msg key for tooltip text
 * @param {String}	image		the icon class for the button or menu item
 * @param {String}	disImage	the disabled version of image; defaults to image + "Dis"
 * @param {constant}	setting	the setting which acts as a precondition for this operation
 * @param {AjxCallback}	callback	the callback to run after this operation has been created
 */
ZmOperation.registerOp =
function(op, params, setting, callback) {
	ZmOperation[op] = op;
	ZmOperation.SETUP[op] = params || {};
	if (setting)	{ ZmOperation.SETTING[op]	= setting; }
	if (callback)	{ ZmOperation.CALLBACK[op]	= callback; }
};


ZmOperation.KEY_ID		= "_opId";
ZmOperation.MENUITEM_ID	= "_menuItemId";

ZmOperation.NEW_ITEM_OPS	= [];
ZmOperation.NEW_ITEM_KEY	= {};
ZmOperation.NEW_ORG_OPS		= [];
ZmOperation.NEW_ORG_KEY		= {};

// Static hash of operation IDs ad descriptors
ZmOperation._operationDesc = {};

/**
 * Initializes and creates standard operations.
 * 
 */
ZmOperation.initialize =
function() {
	ZmOperation.registerOp(ZmId.OP_ATTACHMENT, {textKey:"addAttachment", tooltipKey:"attachmentTooltip", image:"Attachment", shortcut:ZmKeyMap.ATTACHMENT});
	ZmOperation.registerOp(ZmId.OP_BROWSE, {textKey:"advancedSearch", image:"SearchBuilder", tooltipKey: "advancedSearchTooltip"}, ZmSetting.BROWSE_ENABLED);
	ZmOperation.registerOp(ZmId.OP_CALL, {image:"Telephone"});
	ZmOperation.registerOp(ZmId.OP_CANCEL, {textKey:"cancel", tooltipKey:"cancelTooltip", image:"Cancel", shortcut:ZmKeyMap.CANCEL});
	ZmOperation.registerOp(ZmId.OP_CHECK_ALL, {textKey:"checkAll", image:"Check"});
	ZmOperation.registerOp(ZmId.OP_CLEAR_ALL, {textKey:"clearAll", image:"Cancel"});
	ZmOperation.registerOp(ZmId.OP_CLOSE, {textKey:"close", tooltipKey:"closeTooltip", image:"Close", shortcut:ZmKeyMap.CANCEL});
	ZmOperation.registerOp(ZmId.OP_COMPOSE_FORMAT, {textKey:"format", tooltipKey:"formatTooltip", image:"SwitchFormat", shortcut:ZmKeyMap.HTML_FORMAT}, ZmSetting.HTML_COMPOSE_ENABLED);
	ZmOperation.registerOp(ZmId.OP_DELETE, {textKey:"del", tooltipKey:"deleteTooltip", image:"Delete", shortcut:ZmKeyMap.DEL, textPrecedence:60});
	ZmOperation.registerOp(ZmId.OP_DETACH, {tooltipKey:"detachTT", image:"OpenInNewWindow"});
    ZmOperation.registerOp(ZmId.OP_DETACH_WIN, {textKey:"detachTT", tooltipKey:"detachTT", image:"OpenInNewWindow"});
    ZmOperation.registerOp(ZmId.OP_EDIT, {textKey:"edit", tooltipKey:"editTooltip", image:"Edit", shortcut:ZmKeyMap.EDIT});
	ZmOperation.registerOp(ZmId.OP_EDIT_PROPS, {textKey:"editProperties", tooltipKey:"editPropertiesTooltip", image:"Properties"});
	ZmOperation.registerOp(ZmId.OP_EXPAND_ALL, {textKey:"expandAll", image:"Plus"});
//	ZmOperation.registerOp(ZmId.OP_EXPORT_FOLDER, {textKey:"exportFolder", image:"MailExport"});
	ZmOperation.registerOp(ZmId.OP_EMPTY_FOLDER,{textKey:"emptyFolder",image:"EmptyFolder"});
	ZmOperation.registerOp(ZmId.OP_FORMAT_HTML, {textKey:"formatAsHtml", image:"HtmlDoc"}, ZmSetting.HTML_COMPOSE_ENABLED);
	ZmOperation.registerOp(ZmId.OP_FORMAT_TEXT, {textKey:"formatAsText", image:"GenericDoc"}, ZmSetting.HTML_COMPOSE_ENABLED);
	ZmOperation.registerOp(ZmId.OP_GO_TO_URL, {image:"URL"});
//	ZmOperation.registerOp(ZmId.OP_IMPORT_FOLDER, {textKey:"importFolder", image:"MailImport"});
	ZmOperation.registerOp(ZmId.OP_MARK_ALL_READ, {textKey:"markAllRead", image:"ReadMessage"});
	ZmOperation.registerOp(ZmId.OP_MOUNT_FOLDER, {textKey:"mountFolder", image:"Folder"});
	ZmOperation.registerOp(ZmId.OP_MOVE, {textKey:"move", tooltipKey:"moveTooltip", image:"MoveToFolder", textPrecedence:40});
	ZmOperation.registerOp(ZmId.OP_NEW_FOLDER, {textKey:"newFolder", tooltipKey:"newFolderTooltip", image:"NewFolder", shortcut:ZmKeyMap.NEW_FOLDER}, ZmSetting.USER_FOLDERS_ENABLED);
	ZmOperation.registerOp(ZmId.OP_NEW_MENU, {textKey:"_new", shortcut:ZmKeyMap.NEW, textPrecedence:100}, null,
		AjxCallback.simpleClosure(function(parent) {
			ZmOperation.addDeferredMenu(ZmOperation.addNewMenu, parent);
		}));
	ZmOperation.registerOp(ZmId.OP_NEW_TAG, {textKey:"newTag", tooltipKey:"newTagTooltip", image:"NewTag", shortcut:ZmKeyMap.NEW_TAG}, ZmSetting.TAGGING_ENABLED);
    ZmOperation.registerOp(ZmId.OP_NOTIFY, {textKey: "notify", image:"Feedback"});
	ZmOperation.registerOp(ZmId.OP_PAGE_BACK, {image:"LeftArrow", shortcut:ZmKeyMap.PREV_PAGE});
	ZmOperation.registerOp(ZmId.OP_PAGE_FORWARD, {image:"RightArrow", shortcut:ZmKeyMap.NEXT_PAGE});
	ZmOperation.registerOp(ZmId.OP_PRINT, {textKey:"print", tooltipKey:"printTooltip", image:"Print", shortcut:ZmKeyMap.PRINT, textPrecedence:30}, ZmSetting.PRINT_ENABLED);
    ZmOperation.registerOp(ZmId.OP_REFRESH, {textKey:"refresh", tooltipKey:"refreshTooltip"});
	ZmOperation.registerOp(ZmId.OP_RENAME_FOLDER, {textKey:"renameFolder", image:"Rename"});
	ZmOperation.registerOp(ZmId.OP_RENAME_SEARCH, {textKey:"renameSearch", image:"Rename"});
	ZmOperation.registerOp(ZmId.OP_RENAME_TAG, {textKey:"renameTag", image:"Rename"}, ZmSetting.TAGGING_ENABLED);
	ZmOperation.registerOp(ZmId.OP_SAVE, {textKey:"save", image:"Save", shortcut:ZmKeyMap.SAVE});
	ZmOperation.registerOp(ZmId.OP_SEARCH, {textKey:"search", image:"Search"}, ZmSetting.SEARCH_ENABLED);
	ZmOperation.registerOp(ZmId.OP_SEND, {textKey:"send", tooltipKey:"sendTooltip", image:"Send", shortcut:ZmKeyMap.SEND});
    ZmOperation.registerOp(ZmId.OP_FREE_BUSY_LINK, {textKey:"freeBusyLink", tooltipKey:"freeBusyLinkTooltip", image:"Send"});
    ZmOperation.registerOp(ZmId.OP_SHARE, {textKey:"share", tooltipKey:"shareTooltip"}, ZmSetting.SHARING_ENABLED);
	ZmOperation.registerOp(ZmId.OP_SHARE_ACCEPT, {textKey:"acceptShare", image:"Check"}, ZmSetting.SHARING_ENABLED);
	ZmOperation.registerOp(ZmId.OP_SHARE_DECLINE, {textKey:"declineShare", image:"Cancel"}, ZmSetting.SHARING_ENABLED);
	ZmOperation.registerOp(ZmId.OP_SHARE_FOLDER, {textKey:"shareFolder", image:"SharedMailFolder"});
	ZmOperation.registerOp(ZmId.OP_SHOW_ALL_ITEM_TYPES, {textKey:"showAllItemTypes", image:"Globe"});
	ZmOperation.registerOp(ZmId.OP_SPELL_CHECK, {textKey:"spellCheck", image:"SpellCheck", tooltipKey:"spellCheckTooltip", shortcut:ZmKeyMap.SPELLCHECK}, ZmSetting.SPELL_CHECK_ENABLED);
	ZmOperation.registerOp(ZmId.OP_SYNC, {textKey:"reload", image:"Refresh", shortcut:ZmKeyMap.REFRESH});
    ZmOperation.registerOp(ZmId.OP_SYNC_ALL, {textKey:"checkAllFeed", image:"Refresh"});
	ZmOperation.registerOp(ZmId.OP_SYNC_OFFLINE_FOLDER, {textKey:"syncOfflineFolderOff", image:"Refresh"}, ZmSetting.OFFLINE_ENABLED); /* offline only */
	ZmOperation.registerOp(ZmId.OP_TAG, null, ZmSetting.TAGGING_ENABLED);
	ZmOperation.registerOp(ZmId.OP_TAG_COLOR_MENU, {textKey:"tagColor", image:"TagStack"}, ZmSetting.TAGGING_ENABLED,
		AjxCallback.simpleClosure(function(parent) {
			ZmOperation.addDeferredMenu(ZmOperation.addColorMenu, parent);
		}));
	ZmOperation.registerOp(ZmId.OP_TAG_MENU, {tooltipKey:"tagTooltip", image:"Tag"}, ZmSetting.TAGGING_ENABLED,
		AjxCallback.simpleClosure(function(parent) {
			ZmOperation.addDeferredMenu(ZmOperation.addTagMenu, parent, true);
		}));
	// placeholder for toolbar text
	ZmOperation.registerOp(ZmId.OP_TEXT);
	// XXX: need new icon? -
	//      Undelete is stupid. We should either add it for all items types (not just contacts) or just kill it
	ZmOperation.registerOp(ZmId.OP_UNDELETE, {textKey:"undelete", tooltipKey:"undelete", image:"MoveToFolder"});
	ZmOperation.registerOp(ZmId.OP_VIEW, {textKey:"view", image:"SplitView"});
	ZmOperation.registerOp(ZmId.OP_VIEW_MENU, {tooltipKey:"viewTooltip", textKey:"view", image:"SplitPane", textPrecedence:80});
	ZmOperation.registerOp(ZmId.OP_ZIMLET, {image:"ZimbraIcon"});

	ZmOperation.NEW_ORG_OPS.push(ZmOperation.NEW_FOLDER, ZmOperation.NEW_TAG);
	ZmOperation.NEW_ORG_KEY[ZmOperation.NEW_FOLDER]	= "folder";
	ZmOperation.NEW_ORG_KEY[ZmOperation.NEW_TAG]	= "tag";
};

/**
 * Creates operation descriptors for the given operation IDs,
 * then creates the appropriate widget for each operation based on the type of
 * the parent. If it's a toolbar, then buttons are created. If it's a menu, menu items are
 * created.
 * <p>
 * To override or add properties to a particular operation, pass in a hash of properties and
 * values as a value in overrides, with the operation ID as the key.
 * </p>
 *
 * @param {DwtComposite}	parent		the containing widget (toolbar or menu)
 * @param {Array}	operations	a list of operation IDs
 * @param {Hash}	overrides		a hash of overrides by op ID
 *
 * @returns	{Hash}	a hash of operations by ID
 */
ZmOperation.createOperations =
function(parent, operations, overrides) {
	var obj = new ZmOperation();
	return obj._createOperations(parent, operations, overrides);
}

/**
 * Done through an object so that we can have more than one invocation going
 * without sharing memory (eg, creating New submenu).
 * 
 * @private
 */
ZmOperation.prototype._createOperations =
function(parent, operations, overrides) {
	if (operations == ZmOperation.NONE) {
		operations = null;
	}
	overrides = overrides || {};

	var opHash = {};
	if (operations && operations.length) {
		for (var i = 0; i < operations.length; i++) {
			var id = operations[i];
			ZmOperation.defineOperation(id, overrides[id]);
			ZmOperation.addOperation(parent, id, opHash);
		}
	}

	return opHash;
};

/**
* Creates an operation descriptor. The ID of an existing operation can be passed
* in to use as a base, with overridden properties passed in a hash. A new operation
* can be defined by passing its properties in a hash.
*
* @param {String}	baseId		the ID of an existing operation
* @param {Hash}	overrides	the property overrides for the operation
*/
ZmOperation.defineOperation =
function(baseId, overrides) {
	var id = (overrides && overrides.id) || (baseId && baseId.id) || baseId || Dwt.getNextId();
	var textKey = (overrides && overrides.textKey) || ZmOperation.getProp(baseId, "textKey");
	var text = textKey && ZmMsg[textKey];
	var tooltipKey = (overrides && overrides.tooltipKey) || ZmOperation.getProp(baseId, "tooltipKey");
	var tooltip = tooltipKey && ZmMsg[tooltipKey];
	var image = ZmOperation.getProp(baseId, "image");
	var disImage = ZmOperation.getProp(baseId, "disImage");
	var enabled = (overrides && (overrides.enabled !== false));
	var style = ZmOperation.getProp(baseId, "style");
	var shortcut = ZmOperation.getProp(baseId, "shortcut");

    var opDesc = {id:id, text:text, image:image, disImage:disImage, enabled:enabled,
				  tooltip:tooltip, style:style, shortcut:shortcut};
	if (overrides) {
		for (var i in overrides) {
			opDesc[i] = overrides[i];
		}
	}

	ZmOperation._operationDesc[id] = opDesc;
	
	return opDesc;
};

/**
 * Gets the value of a given property for a given operation.
 *
 * @param {String}	id		the operation ID
 * @param {String}	prop	the name of an operation property
 * 
 * @return	{Object}	the value
 */
ZmOperation.getProp =
function(id, prop) {
	var value = null;
	var setup = ZmOperation.SETUP[id];
	if (setup) {
		value = setup[prop];
		if (!value && (prop == "disImage") && setup.image) {
			value = setup.image;
		}
	}

	return value;
};

/**
 * Checks if the operation is a separator or spacer.
 * 
 * @param	{String}	id		the id
 * @return	{Boolean}	<code>true</code> if the operation is a spacer
 */
ZmOperation.isSep =
function(id) {
	return (id == ZmOperation.SEP || id == ZmOperation.SPACER || id == ZmOperation.FILLER);
};

/**
 * Adds the operation.
 * 
 * @param {DwtComposite}	parent		the containing widget (toolbar or menu)
 * @param	{String}		id		the id
 * @param	{Hash}		opHash		a hash
 * @param	{String}	[index]		the index
 */
ZmOperation.addOperation =
function(parent, id, opHash, index) {

	var opDesc = ZmOperation._operationDesc[id] || ZmOperation.defineOperation(id);

	if (id == ZmOperation.SEP) {
        if (parent instanceof DwtMenu) {
            parent.createSeparator(index);
        }
        else {
            parent.addSeparator(null, index);
        }
    } else if (id == ZmOperation.SPACER) {	// toolbar only
		parent.addSpacer(null, index);
	} else if (id == ZmOperation.FILLER) {	// toolbar only
		parent.addFiller(null, index);
	} else {
		if (index) {
			opDesc.index = index;
		}
		opHash[id] = parent.createOp(id, opDesc);
	}
	var callback = ZmOperation.CALLBACK[id];
	if (callback) {
		if (callback.run) {
			callback.run(opHash[id]);
		} else {
			callback(opHash[id]);
		}
	}
};

/**
 * Adds a deferred menu.
 * 
 * @param	{function}	addMenuFunc		the add menu function
 * @param {DwtComposite}	parent		the containing widget (toolbar or menu)
 */
ZmOperation.addDeferredMenu =
function(addMenuFunc, parent /* ... */) {
    var args = [parent];
    for (var i = 2; i < arguments.length; i++) {
        args.push(arguments[i]);
    }
	var callback = new AjxCallback(null, addMenuFunc, args);
	parent.setMenu(callback);
};

/**
 * Removes the operation.
 * 
 * @param {DwtComposite}	parent		the containing widget (toolbar or menu)
 * @param	{String}	id		the id
 * @param	{Hash}	opHash		a hash
 */
ZmOperation.removeOperation =
function(parent, id, opHash) {
	parent.getOp(id).dispose();
	delete opHash[id];
}

/**
 * Replaces the attributes of one operation with those of another, wholly or in part.
 *
 * @param {DwtComposite}	parent		the parent widget
 * @param {String}	oldOp		the ID of operation to replace
 * @param {String}	newOp		the ID of new operation to get replacement attributes from
 * @param {String}	text		the new text (overrides text of newOp)
 * @param {String}	image		the new image (overrides image of newOp)
 * @param {String}	disImage	the new disabled image (overrides that of newOp)
 */
ZmOperation.setOperation =
function(parent, oldOp, newOp, text, image, disImage) {
	var op = parent.getOp(oldOp);
	if (!op) return;

	op.setText(text ? text : ZmMsg[ZmOperation.getProp(newOp, "textKey")]);
	op.setImage(image ? image : ZmOperation.getProp(newOp, "image"));
};

/**
 * Takes a list of operations and removes any who have a corresponding setting that's
 * not set. Also deals with the fact that you don't want a separator or a spacer unless
 * there's stuff on either side of it.
 * 
 * @param	{Array}	list		a list of {ZmOperation} objects
 * @return	{Array}		a list of {ZmOperation} objects
 */
ZmOperation.filterOperations =
function(list) {
	var newList = [];
	if (!(list && list.length)) { return newList; }
	
	// remove disabled operations
	for (var i = 0; i < list.length; i++) {
		var op = list[i];
		if (!op) { continue; }
		var setting = ZmOperation.SETTING[op];
		if (!setting || appCtxt.get(setting)) {
			newList.push(op);
		}
	}
	// reduce multiple consecutive separators to the first one
	var newList1 = [];
	var gotSep = false;
	for (var i = 0; i < newList.length; i++) {
		var op = newList[i];
		if (op == ZmOperation.SEP || op == ZmOperation.SPACER) {
			if (!gotSep) {
				newList1.push(op);
			}
			gotSep = true;
		} else {
			newList1.push(op);
			gotSep = false;
		}
	}
	// remove separator at beginning or end
	if (newList1 && newList1.length) {
		if (newList1[0] == ZmOperation.SEP || newList1[0] == ZmOperation.SPACER) {
			newList1.shift();
		}
		var i = newList1.length - 1;
		if (newList1[i] == ZmOperation.SEP || newList1[i] == ZmOperation.SPACER || newList1[i] == ZmOperation.FILLER) {
			newList1.pop();
		}
	}
	
	return newList1;
};

/**
 * Adds a "New" submenu. Overrides are used because we don't want "New" at the
 * beginning of each label.
 *
 * @param {DwtComposite}		parent		the parent widget
 * @return	{ZmActionMenu}	the menu
 */
ZmOperation.addNewMenu =
function(parent) {
	var list = ZmOperation.NEW_ITEM_OPS;
	list.push(ZmOperation.SEP);
	list = list.concat(ZmOperation.NEW_ORG_OPS);

	var overrides = {};
	for (var i = 0; i < list.length; i++) {
		var op = list[i];
		var textKey = ZmOperation.NEW_ITEM_KEY[op] || ZmOperation.NEW_ORG_KEY[op];
		if (textKey) {
			overrides[op] = {textKey:textKey};
		}
	}

	var menu = new ZmActionMenu({parent:parent, menuItems:list, overrides:overrides});
	parent.setMenu(menu);

	return menu;
};

/**
 * Adds a "Tag" submenu for tagging items.
 *
 * @param {DwtComposite}	parent		parent widget (a toolbar or action menu)
 * @return	{ZmTagMenu}	the menu
 */
ZmOperation.addTagMenu =
function(parent) {
	var tagMenu = new ZmTagMenu(parent);
	parent.setMenu(tagMenu);
	return tagMenu;
};

/**
 * Adds a color submenu for choosing tag color.
 *
 * @param {DwtComposite}	parent		parent widget (a toolbar or action menu)
 * @param {boolean} hideNoFill True to hide the no-fill/use-default option.
 * @return	{ZmPopupMenu}	the menu
 */
ZmOperation.addColorMenu =
function(parent, hideNoFill) {
    var menu = new ZmColorMenu({parent:parent,image:"Tag",hideNone:true,hideNoFill:hideNoFill});
    parent.setMenu(menu);
    return menu;
};

/**
 * Gets the tooltip for the operation with the given ID. If the operation has a shortcut associated
 * with it, a shortcut hint is appended to the end of the tooltip.
 *
 * @param {String}	id		the operation ID
 * @param {String}	keyMap	the key map (for resolving shortcut)
 * @param {String}	tooltip	the tooltip override
 * @return	{String}	the tool tip
 */
ZmOperation.getToolTip =
function(id, keyMap, tooltip) {
	var opDesc = ZmOperation._operationDesc[id] || ZmOperation.defineOperation(id);
	tooltip = tooltip || opDesc.tooltip;
	var sc = tooltip && opDesc.shortcut && appCtxt.getShortcutHint(keyMap, opDesc.shortcut);
	return sc ? [tooltip, sc].join("") : tooltip;
};
