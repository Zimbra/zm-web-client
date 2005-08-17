/**
* @class
* This mostly abstract class provides constants and a few utility functions for widgets that
* provide the user with access to various operations (such as tagging, deletion, etc).
* The two primary clients of this class are LmButtonToolBar and LmActionMenu. Clients 
* should support createOp() and getOp() methods. See the two aforementioned clients for
* examples.
*/
function LmOperation() {
}

// Operations
LmOperation.NONE 					= -2;		// no operations or menu items
LmOperation.SEP 					= -1;		// separator
var i = 1;
// !! PLEASE ADD IN ALPHA ORDER !!
LmOperation.ADD_FILTER_RULE			= i++;
LmOperation.ADD_SIGNATURE			= i++;
LmOperation.ATTACHMENT				= i++;
LmOperation.BROWSE					= i++;
LmOperation.CALL					= i++;
LmOperation.CANCEL					= i++;
LmOperation.CLOSE					= i++;
LmOperation.COLOR_MENU				= i++;
LmOperation.COMPOSE_FORMAT 			= i++;
LmOperation.CONTACT					= i++; 		// (placeholder) add or edit contact
LmOperation.DAY_VIEW				= i++;
LmOperation.DELETE					= i++;
LmOperation.DELETE_CONV				= i++;
LmOperation.DELETE_MENU				= i++;
LmOperation.DETACH_COMPOSE 			= i++;
LmOperation.DRAFT 					= i++;
LmOperation.EDIT 					= i++;
LmOperation.EDIT_CONTACT			= i++;
LmOperation.EDIT_FILTER_RULE		= i++;
LmOperation.EXPAND_ALL				= i++;
LmOperation.FORWARD					= i++;
LmOperation.IM						= i++;
LmOperation.MARK_ALL_READ			= i++;
LmOperation.MARK_READ				= i++;
LmOperation.MARK_UNREAD				= i++;
LmOperation.MODIFY_SEARCH			= i++;
LmOperation.MONTH_VIEW				= i++;
LmOperation.MOVE					= i++;
LmOperation.MOVE_UP_FILTER_RULE		= i++;
LmOperation.MOVE_DOWN_FILTER_RULE	= i++;
LmOperation.NEW_APPT				= i++;
LmOperation.NEW_CONTACT				= i++;
LmOperation.NEW_FOLDER				= i++;
LmOperation.NEW_MENU				= i++;
LmOperation.NEW_MESSAGE				= i++;
LmOperation.NEW_TAG					= i++;
LmOperation.PAGE_BACK				= i++;
LmOperation.PAGE_DBL_BACK 			= i++;
LmOperation.PAGE_DBL_FORW			= i++;
LmOperation.PAGE_FORWARD			= i++;
LmOperation.PRINT					= i++;
LmOperation.REMOVE_FILTER_RULE		= i++;
LmOperation.RENAME_FOLDER			= i++;
LmOperation.RENAME_SEARCH			= i++;
LmOperation.RENAME_TAG				= i++;
LmOperation.REPLY					= i++;
LmOperation.REPLY_ACCEPT			= i++;
LmOperation.REPLY_ALL				= i++;
LmOperation.REPLY_DECLINE			= i++;
LmOperation.REPLY_MENU				= i++;
LmOperation.REPLY_NEW_TIME		    = i++;
LmOperation.REPLY_TENTATIVE			= i++;
LmOperation.SAVE					= i++;
LmOperation.SAVE_DRAFT				= i++;
LmOperation.SEARCH					= i++;
LmOperation.SEND					= i++;
LmOperation.SHOW_ORIG				= i++;
LmOperation.SPAM 					= i++;
LmOperation.TAG_MENU				= i++;
LmOperation.TAG						= i++;
LmOperation.TEXT 					= i++;
LmOperation.TODAY					= i++;
LmOperation.VIEW					= i++;
LmOperation.WEEK_VIEW				= i++;
LmOperation.WORK_WEEK_VIEW			= i++;

// Labels
// !! PLEASE ADD IN ALPHA ORDER !!
LmOperation.MSG_KEY = new Object();
LmOperation.MSG_KEY[LmOperation.ADD_FILTER_RULE]		= "filterAdd";
LmOperation.MSG_KEY[LmOperation.ADD_SIGNATURE]			= "addSignature";
LmOperation.MSG_KEY[LmOperation.ATTACHMENT]				= "addAttachment";
LmOperation.MSG_KEY[LmOperation.BROWSE]					= "advancedSearch";
LmOperation.MSG_KEY[LmOperation.CANCEL]					= "cancel";
LmOperation.MSG_KEY[LmOperation.COLOR_MENU]				= "tagColor";
LmOperation.MSG_KEY[LmOperation.COMPOSE_FORMAT] 		= "format";
LmOperation.MSG_KEY[LmOperation.CLOSE]					= "close";
LmOperation.MSG_KEY[LmOperation.DETACH_COMPOSE] 		= "detach";
LmOperation.MSG_KEY[LmOperation.EDIT] 					= "edit";
LmOperation.MSG_KEY[LmOperation.EDIT_CONTACT]			= "AB_EDIT_CONTACT";
LmOperation.MSG_KEY[LmOperation.EXPAND_ALL]				= "expandAll";
LmOperation.MSG_KEY[LmOperation.DAY_VIEW]				= "viewDay";
LmOperation.MSG_KEY[LmOperation.DELETE]					= "del";
LmOperation.MSG_KEY[LmOperation.DELETE_CONV]			= "delConv";
//LmOperation.MSG_KEY[LmOperation.DELETE_MENU]			= "del";
LmOperation.MSG_KEY[LmOperation.EDIT_FILTER_RULE]		= "filterEdit";
LmOperation.MSG_KEY[LmOperation.FORWARD]				= "forward";
LmOperation.MSG_KEY[LmOperation.IM]						= "newIM";
LmOperation.MSG_KEY[LmOperation.MARK_ALL_READ]			= "markAllRead";
LmOperation.MSG_KEY[LmOperation.MARK_READ]				= "markAsRead";
LmOperation.MSG_KEY[LmOperation.MARK_UNREAD]			= "markAsUnread";
LmOperation.MSG_KEY[LmOperation.MODIFY_SEARCH]			= "modifySearch";
LmOperation.MSG_KEY[LmOperation.MONTH_VIEW]				= "viewMonth";
LmOperation.MSG_KEY[LmOperation.MOVE]					= "move";
LmOperation.MSG_KEY[LmOperation.MOVE_UP_FILTER_RULE]	= "filterMoveUp";
LmOperation.MSG_KEY[LmOperation.MOVE_DOWN_FILTER_RULE]	= "filterMoveDown";
LmOperation.MSG_KEY[LmOperation.NEW_APPT]				= "newAppt";
LmOperation.MSG_KEY[LmOperation.NEW_CONTACT]			= "newContact";
LmOperation.MSG_KEY[LmOperation.NEW_FOLDER]				= "newFolder";
LmOperation.MSG_KEY[LmOperation.NEW_MENU]				= "_new";
LmOperation.MSG_KEY[LmOperation.NEW_MESSAGE]			= "newEmail";
LmOperation.MSG_KEY[LmOperation.NEW_TAG]				= "newTag";
LmOperation.MSG_KEY[LmOperation.PRINT]					= "print";
LmOperation.MSG_KEY[LmOperation.REMOVE_FILTER_RULE]		= "filterRemove";
LmOperation.MSG_KEY[LmOperation.RENAME_FOLDER]			= "renameFolder";
LmOperation.MSG_KEY[LmOperation.RENAME_SEARCH]			= "renameSearch";
LmOperation.MSG_KEY[LmOperation.RENAME_TAG]				= "renameTag";
LmOperation.MSG_KEY[LmOperation.REPLY]					= "reply";
LmOperation.MSG_KEY[LmOperation.REPLY_ACCEPT]			= "replyAccept";
LmOperation.MSG_KEY[LmOperation.REPLY_ALL]				= "replyAll";
LmOperation.MSG_KEY[LmOperation.REPLY_MENU]				= "reply";
LmOperation.MSG_KEY[LmOperation.REPLY_TENTATIVE]        = "replyTentative";
LmOperation.MSG_KEY[LmOperation.REPLY_NEW_TIME]		    = "replyNewTime";
LmOperation.MSG_KEY[LmOperation.REPLY_DECLINE]			= "replyDecline";
LmOperation.MSG_KEY[LmOperation.SAVE]					= "save";
LmOperation.MSG_KEY[LmOperation.SAVE_DRAFT]				= "saveDraft";
LmOperation.MSG_KEY[LmOperation.SEARCH]					= "search";
LmOperation.MSG_KEY[LmOperation.SEND]					= "send";
LmOperation.MSG_KEY[LmOperation.SHOW_ORIG]				= "showOrig";
LmOperation.MSG_KEY[LmOperation.SPAM] 					= "junk";
LmOperation.MSG_KEY[LmOperation.TAG_MENU]				= "tag";
LmOperation.MSG_KEY[LmOperation.TODAY]					= "today";
LmOperation.MSG_KEY[LmOperation.VIEW]					= "view";
LmOperation.MSG_KEY[LmOperation.WEEK_VIEW]				= "viewWeek";
LmOperation.MSG_KEY[LmOperation.WORK_WEEK_VIEW]			= "viewWorkWeek";

// !! PLEASE ADD IN ALPHA ORDER !!
LmOperation.MSG_KEY_TT = new Object();
LmOperation.MSG_KEY_TT[LmOperation.ATTACHMENT]			= "attachmentTooltip";
LmOperation.MSG_KEY_TT[LmOperation.CANCEL]				= "cancelTooltip";
LmOperation.MSG_KEY_TT[LmOperation.CLOSE]				= "closeTooltip";
LmOperation.MSG_KEY_TT[LmOperation.COMPOSE]				= "newMessageTooltip";
LmOperation.MSG_KEY_TT[LmOperation.COMPOSE_FORMAT] 		= "formatTooltip";
LmOperation.MSG_KEY_TT[LmOperation.DAY_VIEW]			= "viewDayTooltip";
LmOperation.MSG_KEY_TT[LmOperation.DELETE]				= "deleteTooltip";
LmOperation.MSG_KEY_TT[LmOperation.DELETE_MENU]			= "deleteTooltip";
LmOperation.MSG_KEY_TT[LmOperation.DETACH_COMPOSE] 		= "detachTooltip";
LmOperation.MSG_KEY_TT[LmOperation.EDIT]				= "editTooltip";
LmOperation.MSG_KEY_TT[LmOperation.FORWARD]				= "forwardTooltip";
LmOperation.MSG_KEY_TT[LmOperation.MONTH_VIEW]			= "viewMonthTooltip";
LmOperation.MSG_KEY_TT[LmOperation.MOVE]				= "moveTooltip";
LmOperation.MSG_KEY_TT[LmOperation.NEW_APPT]			= "newApptTooltip";
LmOperation.MSG_KEY_TT[LmOperation.NEW_CONTACT]			= "newContactTooltip";
LmOperation.MSG_KEY_TT[LmOperation.NEW_FOLDER]			= "newFolderTooltip";
LmOperation.MSG_KEY_TT[LmOperation.NEW_MESSAGE]			= "newMessageTooltip";
LmOperation.MSG_KEY_TT[LmOperation.NEW_TAG]				= "newTagTooltip";
LmOperation.MSG_KEY_TT[LmOperation.PRINT]				= "printTooltip";
LmOperation.MSG_KEY_TT[LmOperation.REPLY]				= "replyTooltip";
LmOperation.MSG_KEY_TT[LmOperation.REPLY_ALL]			= "replyAllTooltip";
LmOperation.MSG_KEY_TT[LmOperation.SAVE_DRAFT]			= "saveDraftTooltip";
LmOperation.MSG_KEY_TT[LmOperation.SEND]				= "sendTooltip";
LmOperation.MSG_KEY_TT[LmOperation.SPAM]				= "junkTooltip";
LmOperation.MSG_KEY_TT[LmOperation.TAG_MENU]			= "tagTooltip";
LmOperation.MSG_KEY_TT[LmOperation.TODAY]				= "todayTooltip";
LmOperation.MSG_KEY_TT[LmOperation.WEEK_VIEW]			= "viewWeekTooltip";
LmOperation.MSG_KEY_TT[LmOperation.WORK_WEEK_VIEW]		= "viewWorkWeekTooltip";

// Icons (when enabled)
// !! PLEASE ADD IN ALPHA ORDER !!
LmOperation.IMAGE = new Object();
LmOperation.IMAGE[LmOperation.ADD_FILTER_RULE]			= LmImg.I_PLUS;
LmOperation.IMAGE[LmOperation.ATTACHMENT]				= LmImg.I_ATTACHMENT;
LmOperation.IMAGE[LmOperation.BROWSE]					= LmImg.I_BROWSE;
LmOperation.IMAGE[LmOperation.CALL]						= LmImg.I_TELEPHONE;
LmOperation.IMAGE[LmOperation.CANCEL]					= LmImg.I_RED_X;
LmOperation.IMAGE[LmOperation.CLOSE]					= LmImg.I_UNDO;
LmOperation.IMAGE[LmOperation.COMPOSE_FORMAT] 			= LmImg.I_FORMAT;
LmOperation.IMAGE[LmOperation.DAY_VIEW]					= LmImg.I_DAY_VIEW;
LmOperation.IMAGE[LmOperation.DELETE]					= LmImg.I_DELETE;
LmOperation.IMAGE[LmOperation.DELETE_CONV]				= LmImg.I_DELETE_CONV;
LmOperation.IMAGE[LmOperation.DELETE_MENU]				= LmImg.I_DELETE;
LmOperation.IMAGE[LmOperation.DETACH_COMPOSE] 			= LmImg.I_DETACH;
LmOperation.IMAGE[LmOperation.EDIT] 					= LmImg.I_FORMAT;
LmOperation.IMAGE[LmOperation.EDIT_CONTACT]				= LmImg.I_FORMAT;
LmOperation.IMAGE[LmOperation.EDIT_FILTER_RULE] 		= LmImg.I_FORMAT;
LmOperation.IMAGE[LmOperation.EXPAND_ALL]				= LmImg.I_PLUS;
LmOperation.IMAGE[LmOperation.FORWARD]					= LmImg.I_FORWARD;
LmOperation.IMAGE[LmOperation.IM]						= LmImg.I_IM;
LmOperation.IMAGE[LmOperation.MARK_ALL_READ]			= LmImg.I_READ_MSG;
LmOperation.IMAGE[LmOperation.MARK_READ]				= LmImg.I_READ_MSG;
LmOperation.IMAGE[LmOperation.MARK_UNREAD]				= LmImg.I_ENVELOPE;
LmOperation.IMAGE[LmOperation.MODIFY_SEARCH]			= LmImg.I_SEARCH_FOLDER;
LmOperation.IMAGE[LmOperation.MONTH_VIEW]				= LmImg.I_MONTH_VIEW;
LmOperation.IMAGE[LmOperation.MOVE]						= LmImg.I_MOVE;
LmOperation.IMAGE[LmOperation.MOVE_DOWN_FILTER_RULE]	= LmImg.I_DOWN_ARROW;
LmOperation.IMAGE[LmOperation.MOVE_UP_FILTER_RULE]		= LmImg.I_UP_ARROW;
LmOperation.IMAGE[LmOperation.NEW_APPT]					= LmImg.I_APPT;
LmOperation.IMAGE[LmOperation.NEW_CONTACT]				= LmImg.I_CONTACT;
LmOperation.IMAGE[LmOperation.NEW_FOLDER]				= LmImg.I_NEW_FOLDER;
LmOperation.IMAGE[LmOperation.NEW_MESSAGE]				= LmImg.I_MAIL_MSG;
LmOperation.IMAGE[LmOperation.NEW_TAG]					= LmImg.I_TAG;
LmOperation.IMAGE[LmOperation.PAGE_BACK]				= LmImg.I_BACK_ARROW;
LmOperation.IMAGE[LmOperation.PAGE_DBL_BACK]			= LmImg.I_DBL_BACK_ARROW;
LmOperation.IMAGE[LmOperation.PAGE_DBL_FORW]			= LmImg.I_DBL_FORW_ARROW;
LmOperation.IMAGE[LmOperation.PAGE_FORWARD]				= LmImg.I_FORWARD_ARROW;
LmOperation.IMAGE[LmOperation.PRINT]					= LmImg.I_PRINTER;
LmOperation.IMAGE[LmOperation.REMOVE_FILTER_RULE]		= LmImg.I_DELETE;
LmOperation.IMAGE[LmOperation.RENAME_FOLDER]			= LmImg.I_RENAME;
LmOperation.IMAGE[LmOperation.RENAME_SEARCH]			= LmImg.I_RENAME;
LmOperation.IMAGE[LmOperation.RENAME_TAG]				= LmImg.I_RENAME;
LmOperation.IMAGE[LmOperation.REPLY]					= LmImg.I_REPLY;
LmOperation.IMAGE[LmOperation.REPLY_ACCEPT]			    = LmImg.I_CHECK;
LmOperation.IMAGE[LmOperation.REPLY_ALL]				= LmImg.I_REPLY_ALL;
LmOperation.IMAGE[LmOperation.REPLY_DECLINE]			= LmImg.I_RED_X;
LmOperation.IMAGE[LmOperation.REPLY_MENU]				= LmImg.I_REPLY;
LmOperation.IMAGE[LmOperation.REPLY_NEW_TIME]		    = LmImg.I_NEW_TIME;
LmOperation.IMAGE[LmOperation.REPLY_TENTATIVE]          = LmImg.I_QUESTION_MARK;
LmOperation.IMAGE[LmOperation.SAVE]						= LmImg.I_SAVE;
LmOperation.IMAGE[LmOperation.SAVE_DRAFT]				= LmImg.I_DRAFT_FOLDER;
LmOperation.IMAGE[LmOperation.SEARCH]					= LmImg.I_SEARCH;
LmOperation.IMAGE[LmOperation.SEND]						= LmImg.I_MAIL;
LmOperation.IMAGE[LmOperation.SHOW_ORIG]				= LmImg.I_MAIL;
LmOperation.IMAGE[LmOperation.SPAM] 					= LmImg.I_SPAM_FOLDER;
LmOperation.IMAGE[LmOperation.TAG_MENU]					= LmImg.I_TAG;
LmOperation.IMAGE[LmOperation.VIEW]						= LmImg.I_PANE_DOUBLE;
LmOperation.IMAGE[LmOperation.WEEK_VIEW]				= LmImg.I_WEEK_VIEW;
LmOperation.IMAGE[LmOperation.WORK_WEEK_VIEW]			= LmImg.I_WORK_WEEK_VIEW;

// Icons (when disabled)
// !! PLEASE ADD IN ALPHA ORDER !!
LmOperation.DIS_IMAGE = new Object();
LmOperation.DIS_IMAGE[LmOperation.ATTACHMENT]			= LmImg.ID_ATTACHMENT;
LmOperation.DIS_IMAGE[LmOperation.BROWSE]				= LmImg.ID_BROWSE;
LmOperation.DIS_IMAGE[LmOperation.DAY_VIEW]				= LmImg.ID_DAY_VIEW;
LmOperation.DIS_IMAGE[LmOperation.DELETE]				= LmImg.ID_DELETE;
LmOperation.DIS_IMAGE[LmOperation.DELETE_MENU]			= LmImg.ID_DELETE;
LmOperation.DIS_IMAGE[LmOperation.EDIT] 				= LmImg.ID_FORMAT;
LmOperation.DIS_IMAGE[LmOperation.EDIT_FILTER_RULE] 	= LmImg.ID_FORMAT;
LmOperation.DIS_IMAGE[LmOperation.FORWARD]				= LmImg.ID_FORWARD;
LmOperation.DIS_IMAGE[LmOperation.IM]					= LmImg.ID_IM;
LmOperation.DIS_IMAGE[LmOperation.MONTH_VIEW]			= LmImg.ID_MONTH_VIEW;
LmOperation.DIS_IMAGE[LmOperation.MOVE]					= LmImg.ID_MOVE;
LmOperation.DIS_IMAGE[LmOperation.NEW_MESSAGE]			= LmImg.ID_MAIL_MSG;
LmOperation.DIS_IMAGE[LmOperation.NEW_TAG]				= LmImg.ID_TAG;
LmOperation.DIS_IMAGE[LmOperation.PAGE_BACK]			= LmImg.ID_BACK_ARROW;
LmOperation.DIS_IMAGE[LmOperation.PAGE_DBL_BACK]		= LmImg.ID_DBL_BACK_ARROW;
LmOperation.DIS_IMAGE[LmOperation.PAGE_DBL_FORW]		= LmImg.ID_DBL_FORW_ARROW;
LmOperation.DIS_IMAGE[LmOperation.PAGE_FORWARD]			= LmImg.ID_FORWARD_ARROW;
LmOperation.DIS_IMAGE[LmOperation.PRINT]				= LmImg.ID_PRINTER;
LmOperation.DIS_IMAGE[LmOperation.REPLY]				= LmImg.ID_REPLY;
LmOperation.DIS_IMAGE[LmOperation.REPLY_ALL]			= LmImg.ID_REPLY_ALL;
LmOperation.DIS_IMAGE[LmOperation.REPLY_MENU]			= LmImg.ID_REPLY;
LmOperation.DIS_IMAGE[LmOperation.SAVE]					= LmImg.ID_SAVE;
LmOperation.DIS_IMAGE[LmOperation.SEARCH]				= LmImg.ID_SEARCH;
LmOperation.DIS_IMAGE[LmOperation.SEND]					= LmImg.ID_MAIL;
LmOperation.DIS_IMAGE[LmOperation.SHOW_ORIG]			= LmImg.ID_MAIL;
LmOperation.DIS_IMAGE[LmOperation.SPAM] 				= LmImg.ID_SPAM_FOLDER;
LmOperation.DIS_IMAGE[LmOperation.TAG_MENU]				= LmImg.ID_TAG;
LmOperation.DIS_IMAGE[LmOperation.WEEK_VIEW]			= LmImg.ID_WEEK_VIEW;
LmOperation.DIS_IMAGE[LmOperation.WORK_WEEK_VIEW]		= LmImg.ID_WORK_WEEK_VIEW;

LmOperation.KEY_ID = "_opId";
LmOperation.KEY_TAG_MENU = "_tagMenu";

function LmOperation_Descriptor(id, label, image, disImage, enabled, toolTip) {
	this.id = id;
	this.label = label ? label : LmMsg[LmOperation.MSG_KEY[id]];
	this.image = image ? image : LmOperation.IMAGE[id];
	this.disImage = disImage ? disImage : LmOperation.DIS_IMAGE[id];
	this.enabled = (enabled !== false);
	this.toolTip = toolTip ? toolTip : LmMsg[LmOperation.MSG_KEY_TT[id]];
	this.toolTip = toolTip ? toolTip : this.label;
}

// Static hash of operation IDs and descriptors
LmOperation._operationDesc = new Object();

LmOperation._createOperationDesc =
function(id) {
	return new LmOperation_Descriptor(id, LmMsg[LmOperation.MSG_KEY[id]],
				LmOperation.IMAGE[id], LmOperation.DIS_IMAGE[id], true, LmMsg[LmOperation.MSG_KEY_TT[id]]);
}

/**
* Merges the lists of standard and extra operations (creating operation descriptors for the
* standard ops), then creates the appropriate widget for each operation based on the type of
* the parent. If it's a toolbar, then buttons are created. If it's a menu, menu items are
* created.
* <p>
* Descriptors for the extra operations may contain a value of Dwt.DEFAULT for the label,
* image, or disabled image. In that case, the standard value will be used.</p>
*
* @param parent					the containing widget (toolbar or menu)
* @param standardOperations		a list of operation constants
* @param extraOperations		a list of custom operation descriptors
* @returns						a hash of operation IDs / operations
*
* TODO: allow for ordered mixing of standard and extra ops  (add index to descriptor)
*/
LmOperation.createOperations =
function(parent, standardOperations, extraOperations) {
	var obj = new LmOperation();
	return obj._createOperations(parent, standardOperations, extraOperations);
}

// Done through an object so that we can have more than one invocation going without 
// sharing memory (eg, creating New submenu).
LmOperation.prototype._createOperations =
function(parent, standardOperations, extraOperations) {
	if (standardOperations == LmOperation.NONE) {
		standardOperations = null;
	}
	// assemble the list of operation IDs, and the list of operation descriptors
	var operationList = new Array();
	if (standardOperations || extraOperations) {
		if (standardOperations && standardOperations.length) {
			for (var i = 0; i < standardOperations.length; i++) {
				var id = standardOperations[i];
				operationList.push(id);
				LmOperation._operationDesc[id] = LmOperation._createOperationDesc(id);
			}
		}
		if (extraOperations && extraOperations.length) {
			for (var i = 0; i < extraOperations.length; i++) {
				var extra = extraOperations[i];
				var id = extra.id;
				extra.label = (extra.label == Dwt.DEFAULT) ? LmMsg[LmOperation.MSG_KEY[id]] : extra.label;
				extra.image = (extra.image == Dwt.DEFAULT) ? LmOperation.IMAGE[id] : extra.image;
				extra.disImage = (extra.disImage == Dwt.DEFAULT) ? LmOperation.DIS_IMAGE[id] : extra.disImage;
				extra.toolTip = (extra.toolTip == Dwt.DEFAULT) ? LmMsg[LmOperation.MSG_KEY_TT[id]] : extra.toolTip;
				operationList.push(id);
				LmOperation._operationDesc[id] = extra;
			}
		}
	}

	var operations = new Object();
	for (var i = 0; i < operationList.length; i++) {
		LmOperation.addOperation(parent, operationList[i], operations);
	}
	
	return operations;
}

LmOperation.addOperation =
function(parent, id, opHash) {
	if (!LmOperation._operationDesc[id])
		LmOperation._operationDesc[id] = LmOperation._createOperationDesc(id);
	if (id == LmOperation.SEP) {
		parent.createSeparator();
	} else {
		var label = LmOperation._operationDesc[id].label;
		var image = LmOperation._operationDesc[id].image;
		var disImage = LmOperation._operationDesc[id].disImage;
		var enabled = LmOperation._operationDesc[id].enabled;
		var toolTip = LmOperation._operationDesc[id].toolTip;
		opHash[id] = parent.createOp(id, label, image, disImage, enabled, toolTip);
	}
	if (id == LmOperation.NEW_MENU) {
		LmOperation.addNewMenu(opHash[id]);
	} else if (id == LmOperation.TAG_MENU) {
		LmOperation.addTagMenu(opHash[id]);
	} else if (id == LmOperation.COLOR_MENU) {
		LmOperation.addColorMenu(opHash[id]);
	} else if (id == LmOperation.REPLY_MENU) {
		LmOperation.addReplyMenu(opHash[id]);
	}
}

LmOperation.removeOperation =
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
LmOperation.setOperation =
function(parent, oldOp, newOp, text, image, disImage) {
	var op = parent.getOp(oldOp);
	if (op) {
		op.setText(text || LmMsg[LmOperation.MSG_KEY[newOp]]);
		op.setImage(image || LmOperation.IMAGE[newOp]);
		op.setDisabledImage(disImage || LmOperation.DIS_IMAGE[newOp]);
	}
}

/**
* Adds a "New" submenu. Custom descriptors are used because we don't want "New" at the
* beginning of each label.
*
* @param parent		parent widget
*/
LmOperation.addNewMenu =
function(parent) {
	var appCtxt = parent.shell.getData(LmAppCtxt.LABEL);
	var list = new Array();
	list.push(new LmOperation_Descriptor(LmOperation.NEW_MESSAGE, LmMsg.message, Dwt.DEFAULT, Dwt.DEFAULT));
	list.push(new LmOperation_Descriptor(LmOperation.NEW_CONTACT, LmMsg.contact, Dwt.DEFAULT, Dwt.DEFAULT));
	if (appCtxt.get(LmSetting.CALENDAR_ENABLED))
		list.push(new LmOperation_Descriptor(LmOperation.NEW_APPT, LmMsg.appointment, Dwt.DEFAULT, Dwt.DEFAULT));
	if (appCtxt.get(LmSetting.USER_FOLDERS_ENABLED) || appCtxt.get(LmSetting.TAGGING_ENABLED)) {
		list.push(new LmOperation_Descriptor(LmOperation.SEP, Dwt.DEFAULT, Dwt.DEFAULT, Dwt.DEFAULT));
		if (appCtxt.get(LmSetting.USER_FOLDERS_ENABLED))
			list.push(new LmOperation_Descriptor(LmOperation.NEW_FOLDER, LmMsg.folder, Dwt.DEFAULT, Dwt.DEFAULT));
		if (appCtxt.get(LmSetting.TAGGING_ENABLED))
			list.push(new LmOperation_Descriptor(LmOperation.NEW_TAG, LmMsg.tag, Dwt.DEFAULT, Dwt.DEFAULT));
	}
	var menu = new LmActionMenu(parent, LmOperation.NONE, list);
	parent.setMenu(menu);
}

/**
* Adds a "Tag" submenu for tagging items.
*
* @param parent		parent widget (a toolbar or action menu)
*/
LmOperation.addTagMenu =
function(parent) {
	var tagMenu = new LmTagMenu(parent, null);
	parent.setData(LmOperation.KEY_TAG_MENU, tagMenu);
}

/**
* Adds a color submenu for choosing tag color.
*
* @param parent		parent widget (a toolbar or action menu)
* @param dialog		containing dialog, if any
*/
LmOperation.addColorMenu =
function(parent, dialog) {
	var menu = new LmPopupMenu(parent, null, dialog);
	parent.setMenu(menu);
	var list = LmTagTree.COLOR_LIST;
	for (var i = 0; i < list.length; i++) {
		var color = list[i];
		var mi = menu.createMenuItem(color, LmTag.COLOR_ICON[color], LmTag.COLOR_TEXT[color]);
		mi.setData(LmOperation.MENUITEM_ID, color);
	}
}

/**
* Adds a "Reply" submenu for replying to sender or all.
*
* @param parent		parent widget (a toolbar or action menu)
*/
LmOperation.addReplyMenu =
function(parent) {
	var list = [LmOperation.REPLY, LmOperation.REPLY_ALL];
	var menu = new LmActionMenu(parent, list, null);
	parent.setMenu(menu);
}
