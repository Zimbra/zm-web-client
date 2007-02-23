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
*/
function ZmOperation() {};

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

/**
 * Defines the aspects of an operation, and the ID that refers to it.
 * 
 * @param op		[string]	name of the operation
 * @param text		[string]*	msg key for button or menu item text
 * @param tooltip	[string]*	msg key for tooltip text
 * @param image		[string]*	icon class for the button or menu item
 * @param disImage	[string]*	disabled version of image; defaults to image + "Dis"
 * @param setting	[constant]*	setting which acts as a precondition for this operation
 */
ZmOperation.registerOp =
function(op, params, setting) {
	ZmOperation[op] = op;
	ZmOperation.SETUP[op] = params || {};
	if (setting) {
		ZmOperation.SETTING[op] = setting;
	}
};

ZmOperation.registerOp("ATTACHMENT", {textKey:"addAttachment", tooltipKey:"attachmentTooltip", image:"Attachment"});
ZmOperation.registerOp("BROWSE", {textKey:"advancedSearch", image:"SearchBuilder"}, ZmSetting.BROWSE_ENABLED);
ZmOperation.registerOp("CALL", {image:"Telephone"});
ZmOperation.registerOp("CANCEL", {textKey:"cancel", tooltipKey:"cancelTooltip", image:"Cancel"});
ZmOperation.registerOp("CHECK_ALL", {textKey:"checkAll", image:"Check"});
ZmOperation.registerOp("CLEAR_ALL", {textKey:"clearAll", image:"Cancel"});
ZmOperation.registerOp("CLOSE", {textKey:"close", tooltipKey:"closeTooltip", image:"Close"});
ZmOperation.registerOp("COMPOSE_FORMAT", {textKey:"format", tooltipKey:"formatTooltip", image:"SwitchFormat"}, ZmSetting.HTML_COMPOSE_ENABLED);
ZmOperation.registerOp("DELETE", {textKey:"del", tooltipKey:"deleteTooltip", image:"Delete"});
ZmOperation.registerOp("DETACH", {textKey:"detach", tooltipKey:"detachTT", image:"OpenInNewWindow"});
ZmOperation.registerOp("EDIT", {textKey:"edit", tooltipKey:"editTooltip", image:"Edit"});
ZmOperation.registerOp("EDIT_PROPS", {textKey:"editProperties", tooltipKey:"editPropertiesTooltip", image:"Properties"});
ZmOperation.registerOp("EXPAND_ALL", {textKey:"expandAll", image:"Plus"});
ZmOperation.registerOp("FORMAT_HTML", {textKey:"formatAsHtml", image:"HtmlDoc"}, ZmSetting.HTML_COMPOSE_ENABLED);
ZmOperation.registerOp("FORMAT_TEXT", {textKey:"formatAsText", image:"GenericDoc"}, ZmSetting.HTML_COMPOSE_ENABLED);
ZmOperation.registerOp("GO_TO_URL", {image:"URL"});
ZmOperation.registerOp("MARK_ALL_READ", {textKey:"markAllRead", image:"ReadMessage"});
ZmOperation.registerOp("MODIFY_SEARCH", {textKey:"modifySearch", image:"SearchFolder"}, ZmSetting.SEARCH_ENABLED);
ZmOperation.registerOp("MOUNT_FOLDER", {textKey:"mountFolder", image:"Folder"}, ZmSetting.SHARING_ENABLED);
ZmOperation.registerOp("MOVE", {textKey:"move", tooltipKey:"moveTooltip", image:"MoveToFolder"});
ZmOperation.registerOp("NEW_FOLDER", {textKey:"newFolder", tooltipKey:"newFolderTooltip", image:"NewFolder"}, ZmSetting.USER_FOLDERS_ENABLED);
ZmOperation.registerOp("NEW_MENU", {textKey:"_new"});
ZmOperation.registerOp("NEW_TAG", {textKey:"newTag", tooltipKey:"newTagTooltip", image:"NewTag"}, ZmSetting.TAGGING_ENABLED);
ZmOperation.registerOp("PAGE_BACK", {image:"LeftArrow"});
ZmOperation.registerOp("PAGE_DBL_BACK", {image:"LeftDoubleArrow"});
ZmOperation.registerOp("PAGE_DBL_FORW", {image:"RightDoubleArrow"});
ZmOperation.registerOp("PAGE_FORWARD", {image:"RightArrow"});
ZmOperation.registerOp("PRINT", {textKey:"print", tooltipKey:"printTooltip", image:"Print"}, ZmSetting.PRINT_ENABLED);
ZmOperation.registerOp("PRINT_MENU", {tooltipKey:"printTooltip", image:"Print"}, ZmSetting.PRINT_ENABLED);
ZmOperation.registerOp("REFRESH", {textKey:"refresh", tooltipKey:"refreshTooltip", image:"Refresh"});
ZmOperation.registerOp("RENAME_FOLDER", {textKey:"renameFolder", image:"Rename"});
ZmOperation.registerOp("RENAME_SEARCH", {textKey:"renameSearch", image:"Rename"});
ZmOperation.registerOp("RENAME_TAG", {textKey:"renameTag", image:"Rename"}, ZmSetting.TAGGING_ENABLED);
ZmOperation.registerOp("SAVE", {textKey:"save", image:"Save"});
ZmOperation.registerOp("SEARCH", {textKey:"search", image:"Search"}, ZmSetting.SEARCH_ENABLED);
ZmOperation.registerOp("SEND", {textKey:"send", tooltipKey:"sendTooltip", image:"Send"});
ZmOperation.registerOp("SHARE", {textKey:"share", tooltipKey:"shareTooltip"}, ZmSetting.SHARING_ENABLED);
ZmOperation.registerOp("SHARE_ACCEPT", {textKey:"acceptShare", image:"Check"}, ZmSetting.SHARING_ENABLED);
ZmOperation.registerOp("SHARE_DECLINE", {textKey:"declineShare", image:"Cancel"}, ZmSetting.SHARING_ENABLED);
ZmOperation.registerOp("SHARE_FOLDER", {textKey:"shareFolder", image:"Folder"}, ZmSetting.SHARING_ENABLED);
ZmOperation.registerOp("SHOW_ALL_ITEM_TYPES", {textKey:"showAllItemTypes", image:"Globe"});
ZmOperation.registerOp("SHOW_ALL_MENU", {textKey:"showAllItemTypes", image:"Globe"});
ZmOperation.registerOp("SPELL_CHECK", {textKey:"spellCheck", image:"SpellCheck"});
ZmOperation.registerOp("SYNC", {textKey:"reload", image:"Refresh"});
ZmOperation.registerOp("TAG", null, ZmSetting.TAGGING_ENABLED);
ZmOperation.registerOp("TAG_COLOR_MENU", {textKey:"tagColor"}, ZmSetting.TAGGING_ENABLED);
ZmOperation.registerOp("TAG_MENU", {textKey:"tag", tooltipKey:"tagTooltip", image:"Tag"}, ZmSetting.TAGGING_ENABLED);
// placeholder for toolbar text
ZmOperation.registerOp("TEXT");
// XXX: need new icon?
ZmOperation.registerOp("UNDELETE", {textKey:"undelete", tooltipKey:"undelete", image:"MoveToFolder"});
ZmOperation.registerOp("VIEW", {textKey:"view", image:"SplitView"});
ZmOperation.registerOp("ZIMLET", {image:"ZimbraIcon"});

ZmOperation.KEY_ID		= "_opId";
ZmOperation.MENUITEM_ID	= "_menuItemId";

// Static hash of operation IDs and descriptors
ZmOperation._operationDesc = {};

/**
 * Merges the lists of standard and extra operations (creating operation descriptors for the
 * standard ops), then creates the appropriate widget for each operation based on the type of
 * the parent. If it's a toolbar, then buttons are created. If it's a menu, menu items are
 * created.
 * <p>
 * To add a custom operation, use extraOperations and pass a list of operation descriptors.
 * To override or add properties of a particular operation, pass in a hash of properties and
 * values as a value in overrides, with the operation ID as the key.</p>
 *
 * @param parent				[DwtComposite]		the containing widget (toolbar or menu)
 * @param standardOperations	[array]*			a list of operation IDs
 * @param extraOperations		[array]*			a list of custom operation descriptors
 * @param overrides				[hash]*				hash of overrides by op ID
 *
 * @returns						a hash of operations by ID
 */
ZmOperation.createOperations =
function(parent, standardOperations, extraOperations, overrides) {
	var obj = new ZmOperation();
	return obj._createOperations(parent, standardOperations, extraOperations, overrides);
}

// Done through an object so that we can have more than one invocation going without
// sharing memory (eg, creating New submenu).
ZmOperation.prototype._createOperations =
function(parent, standardOperations, extraOperations, overrides) {
	if (standardOperations == ZmOperation.NONE) {
		standardOperations = null;
	}
	overrides = overrides || {};
	// assemble the list of operation IDs, and the list of operation descriptors
	var operationList = [];
	if (standardOperations && standardOperations.length) {
		for (var i = 0; i < standardOperations.length; i++) {
			var id = standardOperations[i];
			operationList.push(id);
			ZmOperation.defineOperation(id, overrides[id]);
		}
	}
	if (extraOperations && extraOperations.length) {
		for (var i = 0; i < extraOperations.length; i++) {
			operationList.push(extraOperations[i].id);
		}
	}

	var operations = {};
	for (var i = 0; i < operationList.length; i++) {
		ZmOperation.addOperation(parent, operationList[i], operations);
	}

	return operations;
};

/**
* Creates an operation descriptor. The ID of an existing operation can be passed
* in to use as a base, with overridden properties passed in a hash. A new operation
* can be defined by passing its properties in a hash.
*
* @param baseId		[string]*		ID of an existing operation
* @param op			[hash]*			properties for the new operation
*/
ZmOperation.defineOperation =
function(baseId, op) {
	var id = (op && op.id) ? op.id : baseId ? baseId : Dwt.getNextId();
	op = op ? op : {};
	var textKey = ZmOperation.getProp(baseId, "textKey", op);
	var text = textKey ? ZmMsg[textKey] : null;
	var tooltipKey = ZmOperation.getProp(baseId, "tooltipKey", op);
	var tooltip = tooltipKey ? ZmMsg[tooltipKey] : null;
	var image = ZmOperation.getProp(baseId, "image", op);
	var disImage = ZmOperation.getProp(baseId, "disImage", op);
	var enabled = (op.enabled !== false);

	var opDesc = {id:id, text:text, image:image, disImage:disImage, enabled:enabled, tooltip:tooltip};
	ZmOperation._operationDesc[id] = opDesc;
	
	return opDesc;
};

/**
* Returns the value of a given property for a given operation.
*
* @param id		[string]		operation ID
* @param prop	[string]		name of an operation property
* @param op		[hash]*			operation property overrides
*/
ZmOperation.getProp =
function(id, prop, op) {
	var value = null;
	if (op && (op[prop] == ZmOperation.NONE)) {
		return null;
	}
	value = op ? op[prop] : null;
	if (!value) {
		var setup = ZmOperation.SETUP[id];
		if (setup) {
			value = setup[prop];
			if (!value && (prop == "disImage") && setup.image) {
				value = setup.image + ZmOperation.DIS;
			}
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
		parent.createSeparator(index);
	} else if (id == ZmOperation.SPACER) {	// toolbar only
		parent.addSpacer(null, index);
	} else if (id == ZmOperation.FILLER) {	// toolbar only
		parent.addFiller(null, index);
	} else {
		opHash[id] = parent.createOp(id, opDesc.text, opDesc.image, opDesc.disImage, opDesc.enabled, opDesc.tooltip, index);
	}
	if (id == ZmOperation.NEW_MENU) {
		ZmOperation.addDeferredMenu(ZmOperation.addNewMenu, opHash[id]);
	} else if (id == ZmOperation.TAG_MENU) {
		ZmOperation.addDeferredMenu(ZmOperation.addTagMenu, opHash[id]);
	} else if (id == ZmOperation.TAG_COLOR_MENU) {
		ZmOperation.addDeferredMenu(ZmOperation.addColorMenu, opHash[id]);
	} else if (id == ZmOperation.IM_PRESENCE_MENU) {
		ZmOperation.addImPresenceMenu(parent, opHash);
//		ZmOperation.addDeferredMenu(ZmOperation.addImPresenceMenu, opHash[id]);
	} else if (id == ZmOperation.REPLY_MENU) {
		ZmOperation.addDeferredMenu(ZmOperation.addReplyMenu, opHash[id]);
	} else if (id == ZmOperation.FORWARD_MENU) {
		ZmOperation.addDeferredMenu(ZmOperation.addForwardMenu, opHash[id]);
	} else if (id == ZmOperation.INVITE_REPLY_MENU) {
		ZmOperation.addDeferredMenu(ZmOperation.addInviteReplyMenu, opHash[id]);
	} else if (id == ZmOperation.CAL_VIEW_MENU) {
		ZmOperation.addDeferredMenu(ZmOperation.addCalViewMenu, opHash[id]);
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
	op.setDisabledImage(disImage ? disImage : ZmOperation.getProp(newOp, "disImage"));
};

/**
 * Takes a list of operations and removes any who have a corresponding setting that's
 * not set. Also deals with the fact that you don't want a separator or a spacer unless
 * there's stuff on either side of it.
 */
ZmOperation.filterOperations =
function(appCtxt, list) {
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

// everything below here should be moved

/**
* Adds a "New" submenu. Custom descriptors are used because we don't want "New" at the
* beginning of each label.
*
* @param parent		parent widget
*/
ZmOperation.addNewMenu =
function(parent) {
	var appCtxt = parent.shell.getData(ZmAppCtxt.LABEL);
	var foldersEnabled = appCtxt.get(ZmSetting.USER_FOLDERS_ENABLED);
	var taggingEnabled = appCtxt.get(ZmSetting.TAGGING_ENABLED);
	var contactsEnabled = appCtxt.get(ZmSetting.CONTACTS_ENABLED);
	var calendarEnabled = appCtxt.get(ZmSetting.CALENDAR_ENABLED);
	var tasksEnabled = appCtxt.get(ZmSetting.TASKS_ENABLED);
	var notebookEnabled = appCtxt.get(ZmSetting.NOTEBOOK_ENABLED);

	var list = [];
	list.push(ZmOperation.defineOperation(ZmOperation.NEW_MESSAGE, {id: ZmOperation.NEW_MESSAGE, textKey: "message"}));
	if (contactsEnabled) {
		list.push(ZmOperation.defineOperation(ZmOperation.NEW_CONTACT, {id: ZmOperation.NEW_CONTACT, textKey: "contact"}));
		list.push(ZmOperation.defineOperation(ZmOperation.NEW_GROUP, {id: ZmOperation.NEW_GROUP, textKey: "group"}));
	}
	if (calendarEnabled) {
		list.push(ZmOperation.defineOperation(ZmOperation.NEW_APPT, {id: ZmOperation.NEW_APPT, textKey: "appointment"}));
	}
	if (tasksEnabled) {
		list.push(ZmOperation.defineOperation(ZmOperation.NEW_TASK, {id: ZmOperation.NEW_TASK, textKey: "task"}));
	}
	if (notebookEnabled) {
		list.push(ZmOperation.defineOperation(ZmOperation.NEW_PAGE, {id: ZmOperation.NEW_PAGE, textKey: "page"}));
	}

	if (foldersEnabled || taggingEnabled || calendarEnabled || notebookEnabled || tasksEnabled) {
		list.push(ZmOperation.defineOperation(ZmOperation.SEP));
	}

	if (foldersEnabled) {
		list.push(ZmOperation.defineOperation(ZmOperation.NEW_FOLDER, {id: ZmOperation.NEW_FOLDER, textKey: "folder"}));
	}
	if (taggingEnabled) {
		list.push(ZmOperation.defineOperation(ZmOperation.NEW_TAG, {id: ZmOperation.NEW_TAG, textKey: "tag"}));
	}
	if (contactsEnabled) {
		list.push(ZmOperation.defineOperation(ZmOperation.NEW_ADDRBOOK, {id: ZmOperation.NEW_ADDRBOOK, textKey: "addressBook"}));
	}
	if (calendarEnabled) {
		list.push(ZmOperation.defineOperation(ZmOperation.NEW_CALENDAR, {id: ZmOperation.NEW_CALENDAR, textKey: "calendar"}));
	}
	if (tasksEnabled) {
		list.push(ZmOperation.defineOperation(ZmOperation.NEW_TASK_FOLDER, {id: ZmOperation.NEW_TASK_FOLDER, textKey: "taskFolder"}));
	}
	if (notebookEnabled) {
		list.push(ZmOperation.defineOperation(ZmOperation.NEW_NOTEBOOK, {id: ZmOperation.NEW_NOTEBOOK, textKey: "notebook"}));
	}

	var menu = new ZmActionMenu(parent, ZmOperation.NONE, list);
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
		var mi = menu.createMenuItem(color, ZmTag.COLOR_ICON[color], ZmOrganizer.COLOR_TEXT[color]);
		mi.setData(ZmOperation.MENUITEM_ID, color);
	}
	return menu;
}

/**
* Adds a "Reply" submenu for replying to sender or all.
*
* @param parent		parent widget (a toolbar or action menu)
*/
ZmOperation.addReplyMenu =
function(parent) {
	var list = [ZmOperation.REPLY, ZmOperation.REPLY_ALL];
	var menu = new ZmActionMenu(parent, list);
	parent.setMenu(menu);
	return menu;
}

/**
* Adds a "Forward" submenu for forwarding inline or as attachment
*
* @param parent		parent widget (a toolbar or action menu)
*/
ZmOperation.addForwardMenu =
function(parent) {
	var list = [ZmOperation.FORWARD_INLINE, ZmOperation.FORWARD_ATT];
	var menu = new ZmActionMenu(parent, list);
	parent.setMenu(menu);
	return menu;
};

/**
 * Adds an invite actions submenu for accept/decline/tentative.
 *
 * @param parent		parent widget (a toolbar or action menu)
 */
ZmOperation.addInviteReplyMenu =
function(parent) {
	var list = [ZmOperation.EDIT_REPLY_ACCEPT, ZmOperation.EDIT_REPLY_DECLINE, ZmOperation.EDIT_REPLY_TENTATIVE];
	var menu = new ZmActionMenu(parent, list);
	parent.setMenu(menu);
	return menu;
};


/**
 * Adds an invite actions submenu for accept/decline/tentative.
 *
 * @param parent		parent widget (a toolbar or action menu)
 */
ZmOperation.addCalViewMenu =
function(parent) {
	var list = [ZmOperation.DAY_VIEW, ZmOperation.WORK_WEEK_VIEW, ZmOperation.WEEK_VIEW, ZmOperation.MONTH_VIEW, ZmOperation.SCHEDULE_VIEW];
	var menu = new ZmActionMenu(parent, list);
	parent.setMenu(menu);
	return menu;
};

ZmOperation.addImPresenceMenu =
function(parent, opHash) {
	var list = [ZmOperation.IM_PRESENCE_OFFLINE, ZmOperation.IM_PRESENCE_ONLINE, ZmOperation.IM_PRESENCE_CHAT,
                ZmOperation.IM_PRESENCE_DND, ZmOperation.IM_PRESENCE_AWAY, ZmOperation.IM_PRESENCE_XA,
                ZmOperation.IM_PRESENCE_INVISIBLE];

    var button = opHash[ZmOperation.IM_PRESENCE_MENU];
	var menu = new ZmPopupMenu(button);
//	var menu = new ZmPopupMenu(parent);
//	var menu = new ZmActionMenu(parent, list);


	for (var i = 0; i < list.length; i++) {
		var op = list[i];
		var mi = menu.createMenuItem(op, ZmOperation.getProp(op, "image"), ZmMsg[ZmOperation.getProp(op, "textKey")], null, true, DwtMenuItem.RADIO_STYLE);
		mi.setData(ZmOperation.MENUITEM_ID, op);
		mi.setData(ZmOperation.KEY_ID, op);		
		if (op == ZmOperation.IM_PRESENCE_OFFLINE) mi.setChecked(true, true);
	}

//	parent.setMenu(menu, false, DwtMenuItem.RADIO_STYLE);
	button.setMenu(menu, false, DwtMenuItem.RADIO_STYLE);
	return menu;
};
