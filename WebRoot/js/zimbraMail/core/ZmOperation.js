/*
 * ***** BEGIN LICENSE BLOCK *****
 * 
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2004, 2005, 2006, 2007 Zimbra, Inc.
 * 
 * The contents of this file are subject to the Yahoo! Public License
 * Version 1.0 ("License"); you may not use this file except in
 * compliance with the License.  You may obtain a copy of the License at
 * http://www.zimbra.com/license.
 * 
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * 
 * ***** END LICENSE BLOCK *****
 */

/**
 * @class
 * This class provides the idea of an "operation", which is a user-initiated action
 * exposed through a button or menu item. Many operations (such as Delete) are shared
 * across applications/controllers. An operation gets defined by specifying its name,
 * tooltip, and image. Then controllers can simply select which operations they'd like
 * to support.
 * <p>
 * The two primary clients of this class are ZmButtonToolBar and ZmActionMenu. Clients 
 * should support createOp() and getOp() methods. See the two aforementioned clients for
 * examples.</p>
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
 * @param op		[string]		name of the operation
 * @param text		[string]*		msg key for button or menu item text
 * @param tooltip	[string]*		msg key for tooltip text
 * @param image		[string]*		icon class for the button or menu item
 * @param disImage	[string]*		disabled version of image; defaults to image + "Dis"
 * @param setting	[constant]*		setting which acts as a precondition for this operation
 * @param callback	[AjxCallback]*	additional code to run after this operation has been created
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
ZmOperation.NEW_ORG_OPS		= [ZmOperation.NEW_FOLDER, ZmOperation.NEW_TAG];
ZmOperation.NEW_ORG_KEY		= {};
ZmOperation.NEW_ORG_KEY[ZmOperation.NEW_FOLDER]	= "folder";
ZmOperation.NEW_ORG_KEY[ZmOperation.NEW_TAG]	= "tag";


// Static hash of operation IDs ad descriptors
ZmOperation._operationDesc = {};

/**
 * Creates standard operations.
 */
ZmOperation.initialize =
function() {
	ZmOperation.registerOp("ATTACHMENT", {textKey:"addAttachment", tooltipKey:"attachmentTooltip", image:"Attachment"});
	ZmOperation.registerOp("BROWSE", {textKey:"advancedSearch", image:"SearchBuilder"}, ZmSetting.BROWSE_ENABLED);
	ZmOperation.registerOp("CALL", {image:"Telephone"});
	ZmOperation.registerOp("CANCEL", {textKey:"cancel", tooltipKey:"cancelTooltip", image:"Cancel"});
	ZmOperation.registerOp("CHECK_ALL", {textKey:"checkAll", image:"Check"});
	ZmOperation.registerOp("CLEAR_ALL", {textKey:"clearAll", image:"Cancel"});
	ZmOperation.registerOp("CLOSE", {textKey:"close", tooltipKey:"closeTooltip", image:"Close"});
	ZmOperation.registerOp("COMPOSE_FORMAT", {textKey:"format", tooltipKey:"formatTooltip", image:"SwitchFormat"}, ZmSetting.HTML_COMPOSE_ENABLED);
	ZmOperation.registerOp("DELETE", {textKey:"del", tooltipKey:"deleteTooltip", image:"Delete"});
	ZmOperation.registerOp("DETACH", {tooltipKey:"detachTT", image:"OpenInNewWindow"});
	ZmOperation.registerOp("EDIT", {textKey:"edit", tooltipKey:"editTooltip", image:"Edit"});
	ZmOperation.registerOp("EDIT_PROPS", {textKey:"editProperties", tooltipKey:"editPropertiesTooltip", image:"Properties"});
	ZmOperation.registerOp("EXPAND_ALL", {textKey:"expandAll", image:"Plus"});
	ZmOperation.registerOp("EMPTY_FOLDER",{textKey:"emptyFolder",image:"EmptyFolder"});
	ZmOperation.registerOp("FORMAT_HTML", {textKey:"formatAsHtml", image:"HtmlDoc"}, ZmSetting.HTML_COMPOSE_ENABLED);
	ZmOperation.registerOp("FORMAT_TEXT", {textKey:"formatAsText", image:"GenericDoc"}, ZmSetting.HTML_COMPOSE_ENABLED);
	ZmOperation.registerOp("GO_TO_URL", {image:"URL"});
	ZmOperation.registerOp("MARK_ALL_READ", {textKey:"markAllRead", image:"ReadMessage"});
	ZmOperation.registerOp("MOUNT_FOLDER", {textKey:"mountFolder", image:"Folder"}, ZmSetting.SHARING_ENABLED);
	ZmOperation.registerOp("MOVE", {textKey:"move", tooltipKey:"moveTooltip", image:"MoveToFolder"});
	ZmOperation.registerOp("NEW_FOLDER", {textKey:"newFolder", tooltipKey:"newFolderTooltip", image:"NewFolder"}, ZmSetting.USER_FOLDERS_ENABLED);
	ZmOperation.registerOp("NEW_MENU", {textKey:"_new"}, null,
		AjxCallback.simpleClosure(function(parent) {
			ZmOperation.addDeferredMenu(ZmOperation.addNewMenu, parent);
		}));
	ZmOperation.registerOp("NEW_TAG", {textKey:"newTag", tooltipKey:"newTagTooltip", image:"NewTag"}, ZmSetting.TAGGING_ENABLED);
	ZmOperation.registerOp("PAGE_BACK", {image:"LeftArrow"});
	ZmOperation.registerOp("PAGE_DBL_BACK", {image:"LeftDoubleArrow"});
	ZmOperation.registerOp("PAGE_DBL_FORW", {image:"RightDoubleArrow"});
	ZmOperation.registerOp("PAGE_FORWARD", {image:"RightArrow"});
	ZmOperation.registerOp("PRINT", {textKey:"print", tooltipKey:"printTooltip", image:"Print"}, ZmSetting.PRINT_ENABLED);
	ZmOperation.registerOp("REFRESH", {textKey:"refresh", tooltipKey:"refreshTooltip"});
	ZmOperation.registerOp("RENAME_FOLDER", {textKey:"renameFolder", image:"Rename"});
	ZmOperation.registerOp("RENAME_SEARCH", {textKey:"renameSearch", image:"Rename"});
	ZmOperation.registerOp("RENAME_TAG", {textKey:"renameTag", image:"Rename"}, ZmSetting.TAGGING_ENABLED);
	ZmOperation.registerOp("SAVE", {textKey:"save", image:"Save"});
	ZmOperation.registerOp("SEARCH", {textKey:"search", image:"Search"}, ZmSetting.SEARCH_ENABLED);
	ZmOperation.registerOp("SEND", {textKey:"send", tooltipKey:"sendTooltip", image:"Send"});
	ZmOperation.registerOp("SHARE", {textKey:"share", tooltipKey:"shareTooltip"}, ZmSetting.SHARING_ENABLED);
	ZmOperation.registerOp("SHARE_ACCEPT", {textKey:"acceptShare", image:"Check"}, ZmSetting.SHARING_ENABLED);
	ZmOperation.registerOp("SHARE_DECLINE", {textKey:"declineShare", image:"Cancel"}, ZmSetting.SHARING_ENABLED);
	ZmOperation.registerOp("SHARE_FOLDER", {textKey:"shareFolder", image:"SharedMailFolder"}, ZmSetting.SHARING_ENABLED);
	ZmOperation.registerOp("SHOW_ALL_ITEM_TYPES", {textKey:"showAllItemTypes", image:"Globe"});
	ZmOperation.registerOp("SPELL_CHECK", {textKey:"spellCheck", image:"SpellCheck", tooltipKey:"spellCheckTooltip"});
	ZmOperation.registerOp("SYNC", {textKey:"reload", image:"Refresh"});
	ZmOperation.registerOp("SYNC_OFFLINE", {textKey:"checkMail", tooltipKey:"syncTooltip", image:"Refresh"});
	ZmOperation.registerOp("TAG", null, ZmSetting.TAGGING_ENABLED);
	ZmOperation.registerOp("TAG_COLOR_MENU", {textKey:"tagColor"}, ZmSetting.TAGGING_ENABLED,
		AjxCallback.simpleClosure(function(parent) {
			ZmOperation.addDeferredMenu(ZmOperation.addColorMenu, parent);
		}));
	ZmOperation.registerOp("TAG_MENU", {tooltipKey:"tagTooltip", image:"Tag"}, ZmSetting.TAGGING_ENABLED,
		AjxCallback.simpleClosure(function(parent) {
			ZmOperation.addDeferredMenu(ZmOperation.addTagMenu, parent);
		}));
	// placeholder for toolbar text
	ZmOperation.registerOp("TEXT");
	// XXX: need new icon? -
	//      Undelete is stupid. We should either add it for all items types (not just contacts) or just kill it
	ZmOperation.registerOp("UNDELETE", {textKey:"undelete", tooltipKey:"undelete", image:"MoveToFolder"});
	ZmOperation.registerOp("VIEW", {textKey:"view", image:"SplitView"});
	ZmOperation.registerOp("VIEW_MENU", {tooltipKey:"viewTooltip", textKey:"view", image:"SplitPane"});
	ZmOperation.registerOp("ZIMLET", {image:"ZimbraIcon"});
};

/**
 * Creates operation descriptors for the given operation IDs,
 * then creates the appropriate widget for each operation based on the type of
 * the parent. If it's a toolbar, then buttons are created. If it's a menu, menu items are
 * created.
 * <p>
 * To override or add properties to a particular operation, pass in a hash of properties and
 * values as a value in overrides, with the operation ID as the key.</p>
 *
 * @param parent		[DwtComposite]		the containing widget (toolbar or menu)
 * @param operations	[array]*			a list of operation IDs
 * @param overrides		[hash]*				hash of overrides by op ID
 *
 * @returns						a hash of operations by ID
 */
ZmOperation.createOperations =
function(parent, operations, overrides) {
	var obj = new ZmOperation();
	return obj._createOperations(parent, operations, overrides);
}

// Done through an object so that we can have more than one invocation going without
// sharing memory (eg, creating New submenu).
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
* @param baseId		[string]*		ID of an existing operation
* @param overrides	[hash]*			property overrides for the operation
*/
ZmOperation.defineOperation =
function(baseId, overrides) {
	var id = (overrides && overrides.id) ? overrides.id : baseId ? baseId : Dwt.getNextId();
	var textKey = ZmOperation.getProp(baseId, "textKey");
	var text = textKey ? ZmMsg[textKey] : null;
	var tooltipKey = ZmOperation.getProp(baseId, "tooltipKey");
	var tooltip = tooltipKey ? ZmMsg[tooltipKey] : null;
	var image = ZmOperation.getProp(baseId, "image");
	var disImage = ZmOperation.getProp(baseId, "disImage");
	var enabled = (overrides && (overrides.enabled !== false));
    var style = ZmOperation.getProp(baseId, "style");

    var opDesc = {id:id, text:text, image:image, disImage:disImage, enabled:enabled, tooltip:tooltip, style:style};
	if (overrides) {
		for (var i in overrides) {
			opDesc[i] = overrides[i];
		}
	}
	ZmOperation._operationDesc[id] = opDesc;
	
	return opDesc;
};

/**
* Returns the value of a given property for a given operation.
*
* @param id		[string]		operation ID
* @param prop	[string]		name of an operation property
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

ZmOperation.addOperation =
function(parent, id, opHash, index) {
	var opDesc = ZmOperation._operationDesc[id];
	if (!opDesc) {
		opDesc = ZmOperation.defineOperation({id: id});
	}

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
		if(index) opDesc.index = index;
		opHash[id] = parent.createOp(id, opDesc );
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

ZmOperation.addDeferredMenu =
function(addMenuFunc, parent) {
	var callback = new AjxCallback(null, addMenuFunc, parent);
	parent.setMenu(callback);
};

ZmOperation.removeOperation =
function(parent, id, opHash) {
	parent.getOp(id).dispose();
	delete opHash[id];
}

/**
* Replaces the attributes of one operation with those of another, wholly or in part.
*
* @param parent		parent widget
* @param oldOp		ID of operation to replace
* @param newOp		ID of new operation to get replacement attributes from
* @param text		new text (overrides text of newOp)
* @param image		new image (overrides image of newOp)
* @param disImage	new disabled image (overrides that of newOp)
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
* @param parent		parent widget
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
* @param parent		parent widget (a toolbar or action menu)
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
* @param parent		parent widget (a toolbar or action menu)
* @param dialog		containing dialog, if any
*/
ZmOperation.addColorMenu =
function(parent, dialog) {
	var menu = new ZmPopupMenu(parent, null, dialog);
	parent.setMenu(menu);
	var list = ZmTagTree.COLOR_LIST;
	for (var i = 0; i < list.length; i++) {
		var color = list[i];
		var mi = menu.createMenuItem(color, {image:ZmTag.COLOR_ICON[color], text:ZmOrganizer.COLOR_TEXT[color]});
		mi.setData(ZmOperation.MENUITEM_ID, color);
	}
	return menu;
};
