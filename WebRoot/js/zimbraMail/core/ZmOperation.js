/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016 Synacor, Inc.
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
 * All portions of the code are Copyright (C) 2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016 Synacor, Inc. All Rights Reserved.
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
ZmOperation.PRECONDITION = {};

// code to run after an operation has been created - typically used to create
// a menu for a button
ZmOperation.CALLBACK = {};

/**
 * Defines the aspects of an operation, and the ID that refers to it.
 * 
 * @param {String}	op		the name of the operation
 * @param {hash}	params:
 *      @param {String}	text		the msg key for button or menu item text
 *      @param {String}	tooltip	the msg key for tooltip text
 *      @param {String}	image		the icon class for the button or menu item
 *      @param {String}	disImage	the disabled version of image; defaults to image + "Dis"
 *      @param {Boolean|String|Function}    precondition (overrides setting if present)
 * @param {constant}	precondition	must evaluate to true for this operation not to be filtered out
 * @param {AjxCallback}	callback	the callback to run after this operation has been created
 */
ZmOperation.registerOp = function(op, params, precondition, callback) {

	ZmOperation[op] = op;
	ZmOperation.SETUP[op] = params || {};
	if (precondition)	{ ZmOperation.PRECONDITION[op]	= precondition; }
	if (callback)	    { ZmOperation.CALLBACK[op]	    = callback; }
};


ZmOperation.KEY_ID		= "opId";
ZmOperation.MENUITEM_ID	= "menuItemId";

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
	ZmOperation.registerOp(ZmId.OP_ACTIONS_MENU, {textKey:"actions", image:"MoreVertical", tooltipKey:"", textPrecedence:40, showImageInToolbar: true, showTextInToolbar: true});
	
	ZmOperation.registerOp(ZmId.OP_ATTACHMENT, {textKey:"addAttachment", tooltipKey:"attachmentTooltip", image:"Attachment", shortcut:ZmKeyMap.ATTACHMENT, showImageInToolbar: true});
	ZmOperation.registerOp(ZmId.OP_CALL, {image:"Telephone"});
	ZmOperation.registerOp(ZmId.OP_CANCEL, {textKey:"cancel", tooltipKey:"cancelTooltip", image:"Cancel", shortcut:ZmKeyMap.CANCEL});
	ZmOperation.registerOp(ZmId.OP_CHECK_ALL, {textKey:"checkAll", image:"Check"});
	ZmOperation.registerOp(ZmId.OP_CLEAR_ALL, {textKey:"clearAll", image:"Cancel"});
	ZmOperation.registerOp(ZmId.OP_CLOSE, {textKey:"close", tooltipKey:"closeTooltip", image:"Close", shortcut:ZmKeyMap.CANCEL});
	ZmOperation.registerOp(ZmId.OP_COMPOSE_FORMAT, {textKey:"format", tooltipKey:"formatTooltip", image:"SwitchFormat", shortcut:ZmKeyMap.HTML_FORMAT}, ZmSetting.HTML_COMPOSE_ENABLED);
	ZmOperation.registerOp(ZmId.OP_CONTACTGROUP_MENU, {textKey: "AB_CONTACT_GROUP", tooltipKey:"contactGroupTooltip", image:"Group"}, null,
		AjxCallback.simpleClosure(function(parent) {
			ZmOperation.addDeferredMenu(ZmOperation.addContactGroupMenu, parent, true);
	}));
	ZmOperation.registerOp(ZmId.OP_COPY, {textKey:"copy", image:"Copy"});
	ZmOperation.registerOp(ZmId.OP_DELETE, {textKey:"del", tooltipKey:"deleteTooltip", shortcut:ZmKeyMap.DEL, textPrecedence:60, image:"Delete", showImageInToolbar: true, showTextInToolbar: true});
	ZmOperation.registerOp(ZmId.OP_DELETE_WITHOUT_SHORTCUT, {textKey:"del", tooltipKey:"deleteTooltip", textPrecedence:60});
	ZmOperation.registerOp(ZmId.OP_DETACH, {textKey:"detach", tooltipKey:"detach", showImageInToolbar: true});
    ZmOperation.registerOp(ZmId.OP_DETACH_WIN, {textKey:"detach", image:"OpenInNewWindow"});
	ZmOperation.registerOp(ZmId.OP_EDIT, {textKey:"edit", tooltipKey:"editTooltip", shortcut:ZmKeyMap.EDIT});
	ZmOperation.registerOp(ZmId.OP_EDIT_AS_NEW, {textKey:"editAsNew", tooltipKey:"editTooltip", shortcut:ZmKeyMap.EDIT});
	ZmOperation.registerOp(ZmId.OP_EDIT_PROPS, {textKey:"editProperties", tooltipKey:"editPropertiesTooltip"});
	ZmOperation.registerOp(ZmId.OP_EXPAND, {textKey:"expand"});
	ZmOperation.registerOp(ZmId.OP_EXPAND_ALL, {textKey:"expandAll"});
//	ZmOperation.registerOp(ZmId.OP_EXPORT_FOLDER, {textKey:"exportFolder", image:"MailExport"});
	ZmOperation.registerOp(ZmId.OP_EMPTY_FOLDER,{textKey:"emptyFolder"});
	ZmOperation.registerOp(ZmId.OP_FORMAT_HTML, {textKey: "formatAsHtml"}, ZmSetting.HTML_COMPOSE_ENABLED);
	ZmOperation.registerOp(ZmId.OP_FORMAT_TEXT, {textKey: "formatAsText"}, ZmSetting.HTML_COMPOSE_ENABLED);
	ZmOperation.registerOp(ZmId.OP_FORMAT_MORE_OPTIONS, {textKey: "moreComposeOptions"});
    ZmOperation.registerOp(ZmId.OP_GROUPBY, {textKey:"groupBy"});
    ZmOperation.registerOp(ZmId.OP_GROUPBY_NONE, {textKey:"groupByNone"});
    ZmOperation.registerOp(ZmId.OP_GROUPBY_DATE, {textKey:"groupByDate"});
    ZmOperation.registerOp(ZmId.OP_GROUPBY_FROM, {textKey:"groupByFrom"});
    ZmOperation.registerOp(ZmId.OP_GROUPBY_PRIORITY, {textKey:"groupByPriority"});
    ZmOperation.registerOp(ZmId.OP_GROUPBY_SIZE, {textKey:"groupBySize"});
    ZmOperation.registerOp(ZmId.OP_GROUPBY_TAG,  {textKey:"groupByTag"});
	ZmOperation.registerOp(ZmId.OP_GO_TO_URL, {image:"URL", textKey:"goToUrlAlt"});
//	ZmOperation.registerOp(ZmId.OP_IMPORT_FOLDER, {textKey:"importFolder", image:"MailImport"});
	ZmOperation.registerOp(ZmId.OP_MARK_ALL_READ, {textKey:"markAllRead"});
//	ZmOperation.registerOp(ZmId.OP_MOUNT_FOLDER, {textKey:"mountFolder", image:"Folder"});
	ZmOperation.registerOp(ZmId.OP_MOVE, {textKey:"move", image:"MoveToFolder", tooltipKey:"moveTooltip", textPrecedence:40}); //Operation to move message to given folder. todo - remove
	ZmOperation.registerOp(ZmId.OP_MOVE_FOLDER, {textKey:"move", tooltipKey:"moveTooltip", textPrecedence:40}); //operation to move folder from folder tree
	ZmOperation.registerOp(ZmId.OP_MOVE_MENU, {textKey: "move", image:"MoveToFolder", tooltipKey:"moveTooltip", showImageInToolbar: true, showTextInToolbar: true}, null,
		AjxCallback.simpleClosure(function(parent) {
			ZmOperation.addDeferredMenu(ZmOperation.addMoveMenu, parent, true);
		})); //Operation for move menu dropdown

    ZmOperation.registerOp(ZmId.OP_MUTE_CONV, {textKey:"muteConv", tooltipKey:"muteConvTooltip", image:"Mute", shortcut:ZmKeyMap.MUTE_UNMUTE_CONV});
	ZmOperation.registerOp(ZmId.OP_NEW_FOLDER, {textKey:"newFolder", tooltipKey:"newFolderTooltip", shortcut:ZmKeyMap.NEW_FOLDER}, ZmSetting.USER_FOLDERS_ENABLED);
	ZmOperation.registerOp(ZmId.OP_NEW_MENU, {textKey:"_new", shortcut:ZmKeyMap.NEW, textPrecedence:100}, null,
		AjxCallback.simpleClosure(function(parent) {
			ZmOperation.addDeferredMenu(ZmOperation.addNewMenu, parent);
		}));
	ZmOperation.registerOp(ZmId.OP_NEW_TAG, {textKey:"newTag", tooltipKey:"newTagTooltip", shortcut:ZmKeyMap.NEW_TAG}, ZmSetting.TAGGING_ENABLED);
    ZmOperation.registerOp(ZmId.OP_NOTIFY, {textKey: "notify", image:"Feedback"});
	ZmOperation.registerOp(ZmId.OP_OPEN_IN_TAB, {textKey:"openInTab"});
	ZmOperation.registerOp(ZmId.OP_OPTS, {textKey:"options", tooltipKey:"options", image:"ContextMenu"});
	ZmOperation.registerOp(ZmId.OP_PAGE_BACK, {image:"LeftArrow", shortcut:ZmKeyMap.PREV_PAGE});
	ZmOperation.registerOp(ZmId.OP_PAGE_FORWARD, {image:"RightArrow", shortcut:ZmKeyMap.NEXT_PAGE});
	ZmOperation.registerOp(ZmId.OP_PRINT, {textKey:"print", tooltipKey:"printTooltip", image:"Print", shortcut:ZmKeyMap.PRINT, textPrecedence:30, showImageInToolbar: true}, ZmSetting.PRINT_ENABLED);
    ZmOperation.registerOp(ZmId.OP_PRIORITY_FILTER, {textKey:"activityStream"}, ZmSetting.PRIORITY_INBOX_ENABLED);
	ZmOperation.registerOp(ZmId.OP_FIND_SHARES, {textKey:"findShares"}, ZmSetting.SHARING_ENABLED);

	//ZmOperation.registerOp(ZmId.OP_QUICK_COMMANDS, {textKey:"quickCommands", image:"QuickCommand"});
	ZmOperation.registerOp(ZmId.OP_RECOVER_DELETED_ITEMS, {textKey:"recoverDeletedItems", tooltipKey:"recoverDeletedItems"}, ZmSetting.DUMPSTER_ENABLED);
    ZmOperation.registerOp(ZmId.OP_REFRESH, {textKey:"refresh", tooltipKey:"refreshTooltip"});
	ZmOperation.registerOp(ZmId.OP_RENAME_FOLDER, {textKey:"renameFolder"});
	ZmOperation.registerOp(ZmId.OP_RENAME_SEARCH, {textKey:"renameSearch"});
	ZmOperation.registerOp(ZmId.OP_RENAME_TAG, {textKey:"renameTag"}, ZmSetting.TAGGING_ENABLED);
	ZmOperation.registerOp(ZmId.OP_SAVE, {textKey:"save", image:"Save", shortcut:ZmKeyMap.SAVE});
	ZmOperation.registerOp(ZmId.OP_SEARCH, {textKey:"findEmailFromSender", image:"Search"}, ZmSetting.SEARCH_ENABLED);
    ZmOperation.registerOp(ZmId.OP_SEARCH_TO, {textKey:"findEmailToSender", image:"Search"}, ZmSetting.SEARCH_ENABLED);
    ZmOperation.registerOp(ZmId.OP_SEARCH_MENU, {textKey:"findEmails", image:"Search"}, ZmSetting.SEARCH_ENABLED,
		AjxCallback.simpleClosure(function(parent) {
			ZmOperation.addDeferredMenu(ZmOperation.addSearchMenu, parent, true);
		}));
	ZmOperation.registerOp(ZmId.OP_SEND, {textKey:"send", tooltipKey:"sendTooltip", image:"Send", shortcut:ZmKeyMap.SEND});
    ZmOperation.registerOp(ZmId.OP_FREE_BUSY_LINK, {textKey:"freeBusyLink", tooltipKey:"freeBusyLinkTooltip", image:"Send"});
    ZmOperation.registerOp(ZmId.OP_SEND_FB_HTML, {textKey:"sendHTMLLink", tooltipKey:"freeBusyLinkTooltip"});
    ZmOperation.registerOp(ZmId.OP_SEND_FB_ICS, {textKey:"sendICSLink", tooltipKey:"freeBusyLinkTooltip"});
    ZmOperation.registerOp(ZmId.OP_SEND_FB_ICS_EVENT, {textKey:"sendICSEventLink", tooltipKey:"freeBusyLinkTooltip"});
    ZmOperation.registerOp(ZmId.OP_SHARE, {textKey:"share", tooltipKey:"shareTooltip"}, ZmSetting.SHARING_ENABLED);
	ZmOperation.registerOp(ZmId.OP_SHARE_ACCEPT, {textKey:"acceptShare", image:"Check"}, ZmSetting.SHARING_ENABLED);
	ZmOperation.registerOp(ZmId.OP_SHARE_DECLINE, {textKey:"declineShare", image:"Cancel"}, ZmSetting.SHARING_ENABLED);
	ZmOperation.registerOp(ZmId.OP_SUBSCRIBE_APPROVE, {textKey:"dlApprove", image:"Check"});
	ZmOperation.registerOp(ZmId.OP_SUBSCRIBE_REJECT, {textKey:"dlReject", image:"Cancel"});
	ZmOperation.registerOp(ZmId.OP_SHARE_FOLDER, {textKey:"shareFolder"});
	ZmOperation.registerOp(ZmId.OP_SHOW_ALL_ITEM_TYPES, {textKey:"showAllItemTypes", image:"Globe"});
    ZmOperation.registerOp(ZmId.OP_SORT_ASC, {textKey:"sortAscending"});
    ZmOperation.registerOp(ZmId.OP_SORT_DESC, {textKey:"sortDescending"});
	ZmOperation.registerOp(ZmId.OP_SPELL_CHECK, {textKey:"spellCheck", image:"SpellCheck", tooltipKey:"spellCheckTooltip", shortcut:ZmKeyMap.SPELLCHECK, showImageInToolbar: true}, ZmSetting.SPELL_CHECK_ENABLED);
	ZmOperation.registerOp(ZmId.OP_SYNC, {textKey:"reload", shortcut:ZmKeyMap.REFRESH});
    ZmOperation.registerOp(ZmId.OP_SYNC_ALL, {textKey:"checkAllFeed"});
	ZmOperation.registerOp(ZmId.OP_SYNC_OFFLINE_FOLDER, {textKey:"syncOfflineFolderOff"}, ZmSetting.OFFLINE_ENABLED); /* offline only */
	ZmOperation.registerOp(ZmId.OP_TAG, null, ZmSetting.TAGGING_ENABLED);
	ZmOperation.registerOp(ZmId.OP_TAG_COLOR_MENU, {textKey:"tagColor"}, ZmSetting.TAGGING_ENABLED,
		AjxCallback.simpleClosure(function(parent) {
			ZmOperation.addDeferredMenu(ZmOperation.addColorMenu, parent);
		}));
	ZmOperation.registerOp(ZmId.OP_TAG_MENU, {textKey: "tag", tooltipKey:"tagTooltip", image:"Tag", showImageInToolbar: true }, ZmSetting.TAGGING_ENABLED,
		AjxCallback.simpleClosure(function(parent) {
			ZmOperation.addDeferredMenu(ZmOperation.addTagMenu, parent, true);
		}));
	// placeholder for toolbar text
	ZmOperation.registerOp(ZmId.OP_TEXT);
	// XXX: need new icon? -
	//      Undelete is stupid. We should either add it for all items types (not just contacts) or just kill it
    ZmOperation.registerOp(ZmId.OP_UNDELETE, {textKey:"undelete", tooltipKey:"undelete", image:"MoveToFolder"});
    ZmOperation.registerOp(ZmId.OP_UNMUTE_CONV, {textKey:"unmuteConv", tooltipKey:"unmuteConvTooltip", image:"Unmute", shortcut:ZmKeyMap.MUTE_UNMUTE_CONV});
	ZmOperation.registerOp(ZmId.OP_VIEW, {textKey:"view", image:"SplitView"});
	ZmOperation.registerOp(ZmId.OP_VIEW_MENU, {tooltipKey:"viewTooltip", textKey:"view", textPrecedence:80, showImageInToolbar: true, showTextInToolbar: true});
	ZmOperation.registerOp(ZmId.OP_ZIMLET, {image:"ZimbraIcon"});

	// invites - needed for both Mail and Calendar
	ZmOperation.registerOp(ZmId.OP_ACCEPT_PROPOSAL, {textKey:"replyAccept", image:"Check"});
	ZmOperation.registerOp(ZmId.OP_DECLINE_PROPOSAL, {textKey:"replyDecline", image:"Cancel"});
	ZmOperation.registerOp(ZmId.OP_CAL_REPLY, {textKey:"reply", tooltipKey:"replyTooltip", image:"Reply", shortcut:ZmKeyMap.REPLY});
	ZmOperation.registerOp(ZmId.OP_CAL_REPLY_ALL, {textKey:"replyAll", tooltipKey:"replyAllTooltip", image:"ReplyAll", shortcut:ZmKeyMap.REPLY_ALL});
	ZmOperation.registerOp(ZmId.OP_REPLY_ACCEPT, {textKey:"replyAccept", image:"Check", showTextInToolbar: true, showImageInToolbar: true});
	ZmOperation.registerOp(ZmId.OP_REPLY_ACCEPT_NOTIFY, {textKey:"notifyOrganizerLabel", image:"Check"});
	ZmOperation.registerOp(ZmId.OP_REPLY_ACCEPT_IGNORE, {textKey:"dontNotifyOrganizerLabel", image:"Check"});
	ZmOperation.registerOp(ZmId.OP_REPLY_CANCEL);
	ZmOperation.registerOp(ZmId.OP_REPLY_DECLINE, {textKey:"replyDecline", image:"Cancel", showTextInToolbar: true, showImageInToolbar: true});
	ZmOperation.registerOp(ZmId.OP_REPLY_DECLINE_NOTIFY, {textKey:"notifyOrganizerLabel", image:"Cancel"});
	ZmOperation.registerOp(ZmId.OP_REPLY_DECLINE_IGNORE, {textKey:"dontNotifyOrganizerLabel", image:"Cancel"});
	ZmOperation.registerOp(ZmId.OP_REPLY_MODIFY);
	ZmOperation.registerOp(ZmId.OP_REPLY_NEW_TIME, {textKey:"replyNewTime", image:"NewTime"});
	ZmOperation.registerOp(ZmId.OP_REPLY_TENTATIVE, {textKey:"replyTentative", image:"QuestionMark", showTextInToolbar: true, showImageInToolbar: true});
	ZmOperation.registerOp(ZmId.OP_REPLY_TENTATIVE_NOTIFY, {textKey:"notifyOrganizerLabel", image:"QuestionMark"});
	ZmOperation.registerOp(ZmId.OP_REPLY_TENTATIVE_IGNORE, {textKey:"dontNotifyOrganizerLabel", image:"QuestionMark"});

	// Compose Options - used by Calendar and Mail
	ZmOperation.registerOp(ZmId.OP_COMPOSE_OPTIONS, {textKey:"options", image:"Preferences"});

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
			ZmOperation.addOperation(parent, id, opHash, null, overrides[id] && overrides[id].htmlElId);
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
	var showImageInToolbar = ZmOperation.getProp(baseId, "showImageInToolbar");
	var showTextInToolbar = ZmOperation.getProp(baseId, "showTextInToolbar");
	var disImage = ZmOperation.getProp(baseId, "disImage");
	var enabled = (overrides && (overrides.enabled !== false));
	var style = ZmOperation.getProp(baseId, "style");
	var shortcut = ZmOperation.getProp(baseId, "shortcut");

    var opDesc = {id:id, text:text, image:image, showImageInToolbar:showImageInToolbar, showTextInToolbar:showTextInToolbar, disImage:disImage, enabled:enabled,
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
function(parent, id, opHash, index, htmlElId) {

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
		if (index != null) {
			opDesc.index = index;
		}
		opHash[id] = parent.createOp(id, opDesc, htmlElId);
	}
	var callback = ZmOperation.CALLBACK[id];
	if (callback) {
		callback.run(opHash[id]);
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
	var op = parent.getOp(id);
	if (op) {
		op.dispose();
		delete opHash[id];
	}
};

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
		if (!op) {
			continue;
		}
		if (appCtxt.checkPrecondition(ZmOperation.PRECONDITION[op])) {
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
		var htmlElId = parent._htmlElId + "_" + op;
		overrides[op] = {htmlElId: htmlElId};
		var textKey = ZmOperation.NEW_ITEM_KEY[op] || ZmOperation.NEW_ORG_KEY[op];
		if (textKey) {
			overrides[op].textKey = textKey;
		}
	}

	var menu = new ZmActionMenu({parent:parent, menuItems:list, overrides:overrides, className: "ActionMenu MinSizeActionMenu"});
	parent.setMenu(menu);

	return menu;
};

/**
 * Adds a "Search" submenu for searching from/to sender/recipient.
 *
 * @param {DwtComposite}	parent		parent widget (a toolbar or action menu)
 * @return	{ZmActionMenu}	the menu
 */
ZmOperation.addSearchMenu =
function(parent) {
	var list = [ZmOperation.SEARCH, ZmOperation.SEARCH_TO];

	var menu = new ZmActionMenu({parent:parent, menuItems:list});
	parent.setMenu(menu);

	return menu;
};

/**
 * Adds a contact group menu for creating a contacts from the contact list
 * @param {DwtComposite}    parent  parent widget (a toolbar or action menu)
 * @return {ZmActionMenu) the menu
 */
ZmOperation.addContactGroupMenu =
function(parent) {
	var contactGroupMenu = new ZmContactGroupMenu(parent);
	parent.setMenu(contactGroupMenu);
	return contactGroupMenu;
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
* Adds a "Move" submenu for tagging items.
*
* @param {DwtComposite}	parent		parent widget (a toolbar or action menu)
* @return	{ZmTagMenu}	the menu
*/
ZmOperation.addMoveMenu =
function(parent) {
	var moveMenu = new DwtMenu(parent); //this is a dummy menu just so the drop-down would appear
	parent.setMenu(moveMenu);
	return moveMenu;
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
