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
* @class
* This mostly abstract class provides constants and a few utility functions for widgets that
* provide the user with access to various operations (such as tagging, deletion, etc).
* The two primary clients of this class are ZmButtonToolBar and ZmActionMenu. Clients 
* should support createOp() and getOp() methods. See the two aforementioned clients for
* examples.
*/
function ZmOperation() {
}

// Operations
ZmOperation.NONE 					= -2;		// no operations or menu items
ZmOperation.SEP 					= -1;		// separator
var i = 1;
// !! PLEASE ADD IN ALPHA ORDER !!
ZmOperation.ADD_FILTER_RULE			= i++;
ZmOperation.ADD_SIGNATURE			= i++;
ZmOperation.ATTACHMENT				= i++;
ZmOperation.BROWSE					= i++;
ZmOperation.CAL_VIEW_MENU			= i++;
ZmOperation.CALL					= i++;
ZmOperation.CANCEL					= i++;
ZmOperation.CLOSE					= i++;
ZmOperation.COLOR_MENU				= i++;
ZmOperation.COMPOSE_FORMAT 			= i++;
ZmOperation.CONTACT					= i++; 		// (placeholder) add or edit contact
ZmOperation.DAY_VIEW				= i++;
ZmOperation.DELETE					= i++;
ZmOperation.DELETE_CONV				= i++;
ZmOperation.DELETE_MENU				= i++;
ZmOperation.DETACH_COMPOSE 			= i++;
ZmOperation.DRAFT 					= i++;
ZmOperation.EDIT 					= i++;
ZmOperation.EDIT_CONTACT			= i++;
ZmOperation.EDIT_FILTER_RULE		= i++;
ZmOperation.EDIT_REPLY_ACCEPT		= i++;
ZmOperation.EDIT_REPLY_DECLINE		= i++;
ZmOperation.EDIT_REPLY_TENTATIVE	= i++;
ZmOperation.EXPAND_ALL				= i++;
ZmOperation.FORWARD					= i++;
ZmOperation.GO_TO_URL				= i++;
ZmOperation.IM						= i++;
ZmOperation.INVITE_REPLY_MENU		= i++;
ZmOperation.MARK_ALL_READ			= i++;
ZmOperation.MARK_READ				= i++;
ZmOperation.MARK_UNREAD				= i++;
ZmOperation.MODIFY_SEARCH			= i++;
ZmOperation.MONTH_VIEW				= i++;
ZmOperation.MOVE					= i++;
ZmOperation.MOVE_UP_FILTER_RULE		= i++;
ZmOperation.MOVE_DOWN_FILTER_RULE	= i++;
ZmOperation.NEW_APPT				= i++;
ZmOperation.NEW_CONTACT				= i++;
ZmOperation.NEW_FOLDER				= i++;
ZmOperation.NEW_MENU				= i++;
ZmOperation.NEW_MESSAGE				= i++;
ZmOperation.NEW_TAG					= i++;
ZmOperation.PAGE_BACK				= i++;
ZmOperation.PAGE_DBL_BACK 			= i++;
ZmOperation.PAGE_DBL_FORW			= i++;
ZmOperation.PAGE_FORWARD			= i++;
ZmOperation.PRINT					= i++;
ZmOperation.REMOVE_FILTER_RULE		= i++;
ZmOperation.RENAME_FOLDER			= i++;
ZmOperation.RENAME_SEARCH			= i++;
ZmOperation.RENAME_TAG				= i++;
ZmOperation.REPLY					= i++;
ZmOperation.REPLY_ACCEPT			= i++;
ZmOperation.REPLY_ALL				= i++;
ZmOperation.REPLY_DECLINE			= i++;
ZmOperation.REPLY_MENU				= i++;
ZmOperation.REPLY_NEW_TIME		    = i++;
ZmOperation.REPLY_TENTATIVE			= i++;
ZmOperation.SAVE					= i++;
ZmOperation.SAVE_DRAFT				= i++;
ZmOperation.SEARCH					= i++;
ZmOperation.SEND					= i++;
ZmOperation.SHOW_ORIG				= i++;
ZmOperation.SPAM 					= i++;
ZmOperation.TAG_MENU				= i++;
ZmOperation.TAG						= i++;
ZmOperation.TEXT 					= i++;
ZmOperation.TODAY					= i++;
ZmOperation.TODAY_GOTO				= i++;
ZmOperation.VIEW					= i++;
ZmOperation.VIEW_APPOINTMENT		= i++;
ZmOperation.VIEW_APPT_INSTANCE		= i++;
ZmOperation.VIEW_APPT_SERIES		= i++;
ZmOperation.WEEK_VIEW				= i++;
ZmOperation.WORK_WEEK_VIEW			= i++;

// Labels
// !! PLEASE ADD IN ALPHA ORDER !!
ZmOperation.MSG_KEY = new Object();
ZmOperation.MSG_KEY[ZmOperation.ADD_FILTER_RULE]		= "filterAdd";
ZmOperation.MSG_KEY[ZmOperation.ADD_SIGNATURE]			= "addSignature";
ZmOperation.MSG_KEY[ZmOperation.ATTACHMENT]				= "addAttachment";
ZmOperation.MSG_KEY[ZmOperation.BROWSE]					= "advancedSearch";
ZmOperation.MSG_KEY[ZmOperation.CAL_VIEW_MENU]			= "view";
ZmOperation.MSG_KEY[ZmOperation.CANCEL]					= "cancel";
ZmOperation.MSG_KEY[ZmOperation.COLOR_MENU]				= "tagColor";
ZmOperation.MSG_KEY[ZmOperation.COMPOSE_FORMAT] 		= "format";
ZmOperation.MSG_KEY[ZmOperation.CLOSE]					= "close";
ZmOperation.MSG_KEY[ZmOperation.DETACH_COMPOSE] 		= "detach";
ZmOperation.MSG_KEY[ZmOperation.EDIT] 					= "edit";
ZmOperation.MSG_KEY[ZmOperation.EDIT_REPLY_ACCEPT]		= "replyAccept";
ZmOperation.MSG_KEY[ZmOperation.EDIT_REPLY_DECLINE]		= "replyDecline";
ZmOperation.MSG_KEY[ZmOperation.EDIT_REPLY_TENTATIVE]   = "replyTentative";
ZmOperation.MSG_KEY[ZmOperation.EDIT_CONTACT]			= "AB_EDIT_CONTACT";
ZmOperation.MSG_KEY[ZmOperation.EXPAND_ALL]				= "expandAll";
ZmOperation.MSG_KEY[ZmOperation.DAY_VIEW]				= "viewDay";
ZmOperation.MSG_KEY[ZmOperation.DELETE]					= "del";
ZmOperation.MSG_KEY[ZmOperation.DELETE_CONV]			= "delConv";
//ZmOperation.MSG_KEY[ZmOperation.DELETE_MENU]			= "del";
ZmOperation.MSG_KEY[ZmOperation.EDIT_FILTER_RULE]		= "filterEdit";
ZmOperation.MSG_KEY[ZmOperation.FORWARD]				= "forward";
ZmOperation.MSG_KEY[ZmOperation.IM]						= "newIM";
ZmOperation.MSG_KEY[ZmOperation.INVITE_REPLY_MENU]		= "editReply";
ZmOperation.MSG_KEY[ZmOperation.MARK_ALL_READ]			= "markAllRead";
ZmOperation.MSG_KEY[ZmOperation.MARK_READ]				= "markAsRead";
ZmOperation.MSG_KEY[ZmOperation.MARK_UNREAD]			= "markAsUnread";
ZmOperation.MSG_KEY[ZmOperation.MODIFY_SEARCH]			= "modifySearch";
ZmOperation.MSG_KEY[ZmOperation.MONTH_VIEW]				= "viewMonth";
ZmOperation.MSG_KEY[ZmOperation.MOVE]					= "move";
ZmOperation.MSG_KEY[ZmOperation.MOVE_UP_FILTER_RULE]	= "filterMoveUp";
ZmOperation.MSG_KEY[ZmOperation.MOVE_DOWN_FILTER_RULE]	= "filterMoveDown";
ZmOperation.MSG_KEY[ZmOperation.NEW_APPT]				= "newAppt";
ZmOperation.MSG_KEY[ZmOperation.NEW_CONTACT]			= "newContact";
ZmOperation.MSG_KEY[ZmOperation.NEW_FOLDER]				= "newFolder";
ZmOperation.MSG_KEY[ZmOperation.NEW_MENU]				= "_new";
ZmOperation.MSG_KEY[ZmOperation.NEW_MESSAGE]			= "newEmail";
ZmOperation.MSG_KEY[ZmOperation.NEW_TAG]				= "newTag";
ZmOperation.MSG_KEY[ZmOperation.PRINT]					= "print";
ZmOperation.MSG_KEY[ZmOperation.REMOVE_FILTER_RULE]		= "filterRemove";
ZmOperation.MSG_KEY[ZmOperation.RENAME_FOLDER]			= "renameFolder";
ZmOperation.MSG_KEY[ZmOperation.RENAME_SEARCH]			= "renameSearch";
ZmOperation.MSG_KEY[ZmOperation.RENAME_TAG]				= "renameTag";
ZmOperation.MSG_KEY[ZmOperation.REPLY]					= "reply";
ZmOperation.MSG_KEY[ZmOperation.REPLY_ACCEPT]			= "replyAccept";
ZmOperation.MSG_KEY[ZmOperation.REPLY_ALL]				= "replyAll";
ZmOperation.MSG_KEY[ZmOperation.REPLY_MENU]				= "reply";
ZmOperation.MSG_KEY[ZmOperation.REPLY_TENTATIVE]        = "replyTentative";
ZmOperation.MSG_KEY[ZmOperation.REPLY_NEW_TIME]		    = "replyNewTime";
ZmOperation.MSG_KEY[ZmOperation.REPLY_DECLINE]			= "replyDecline";
ZmOperation.MSG_KEY[ZmOperation.SAVE]					= "save";
ZmOperation.MSG_KEY[ZmOperation.SAVE_DRAFT]				= "saveDraft";
ZmOperation.MSG_KEY[ZmOperation.SEARCH]					= "search";
ZmOperation.MSG_KEY[ZmOperation.SEND]					= "send";
ZmOperation.MSG_KEY[ZmOperation.SHOW_ORIG]				= "showOrig";
ZmOperation.MSG_KEY[ZmOperation.SPAM] 					= "junk";
ZmOperation.MSG_KEY[ZmOperation.TAG_MENU]				= "tag";
ZmOperation.MSG_KEY[ZmOperation.TODAY]					= "today";
ZmOperation.MSG_KEY[ZmOperation.TODAY_GOTO]			= "todayGoto";
ZmOperation.MSG_KEY[ZmOperation.VIEW]					= "view";
ZmOperation.MSG_KEY[ZmOperation.VIEW_APPOINTMENT]		= "viewAppointment";
ZmOperation.MSG_KEY[ZmOperation.VIEW_APPT_INSTANCE]		= "viewAppointmentInstance";
ZmOperation.MSG_KEY[ZmOperation.VIEW_APPT_SERIES]		= "viewAppointmentSeries";
ZmOperation.MSG_KEY[ZmOperation.WEEK_VIEW]				= "viewWeek";
ZmOperation.MSG_KEY[ZmOperation.WORK_WEEK_VIEW]			= "viewWorkWeek";

// !! PLEASE ADD IN ALPHA ORDER !!
ZmOperation.MSG_KEY_TT = new Object();
ZmOperation.MSG_KEY_TT[ZmOperation.ATTACHMENT]			= "attachmentTooltip";
ZmOperation.MSG_KEY_TT[ZmOperation.CANCEL]				= "cancelTooltip";
ZmOperation.MSG_KEY_TT[ZmOperation.CLOSE]				= "closeTooltip";
ZmOperation.MSG_KEY_TT[ZmOperation.COMPOSE]				= "newMessageTooltip";
ZmOperation.MSG_KEY_TT[ZmOperation.COMPOSE_FORMAT] 		= "formatTooltip";
ZmOperation.MSG_KEY_TT[ZmOperation.DAY_VIEW]			= "viewDayTooltip";
ZmOperation.MSG_KEY_TT[ZmOperation.DELETE]				= "deleteTooltip";
ZmOperation.MSG_KEY_TT[ZmOperation.DELETE_MENU]			= "deleteTooltip";
ZmOperation.MSG_KEY_TT[ZmOperation.DETACH_COMPOSE] 		= "detachTooltip";
ZmOperation.MSG_KEY_TT[ZmOperation.EDIT]				= "editTooltip";
ZmOperation.MSG_KEY_TT[ZmOperation.FORWARD]				= "forwardTooltip";
ZmOperation.MSG_KEY_TT[ZmOperation.MONTH_VIEW]			= "viewMonthTooltip";
ZmOperation.MSG_KEY_TT[ZmOperation.MOVE]				= "moveTooltip";
ZmOperation.MSG_KEY_TT[ZmOperation.NEW_APPT]			= "newApptTooltip";
ZmOperation.MSG_KEY_TT[ZmOperation.NEW_CONTACT]			= "newContactTooltip";
ZmOperation.MSG_KEY_TT[ZmOperation.NEW_FOLDER]			= "newFolderTooltip";
ZmOperation.MSG_KEY_TT[ZmOperation.NEW_MESSAGE]			= "newMessageTooltip";
ZmOperation.MSG_KEY_TT[ZmOperation.NEW_TAG]				= "newTagTooltip";
ZmOperation.MSG_KEY_TT[ZmOperation.PRINT]				= "printTooltip";
ZmOperation.MSG_KEY_TT[ZmOperation.REPLY]				= "replyTooltip";
ZmOperation.MSG_KEY_TT[ZmOperation.REPLY_ALL]			= "replyAllTooltip";
ZmOperation.MSG_KEY_TT[ZmOperation.SAVE_DRAFT]			= "saveDraftTooltip";
ZmOperation.MSG_KEY_TT[ZmOperation.SEND]				= "sendTooltip";
ZmOperation.MSG_KEY_TT[ZmOperation.SPAM]				= "junkTooltip";
ZmOperation.MSG_KEY_TT[ZmOperation.TAG_MENU]			= "tagTooltip";
ZmOperation.MSG_KEY_TT[ZmOperation.TODAY]				= "todayTooltip";
ZmOperation.MSG_KEY_TT[ZmOperation.WEEK_VIEW]			= "viewWeekTooltip";
ZmOperation.MSG_KEY_TT[ZmOperation.WORK_WEEK_VIEW]		= "viewWorkWeekTooltip";

// Icons (when enabled)
// !! PLEASE ADD IN ALPHA ORDER !!
ZmOperation.IMAGE = new Object();
ZmOperation.IMAGE[ZmOperation.ADD_FILTER_RULE]			= ZmImg.I_PLUS;
ZmOperation.IMAGE[ZmOperation.ATTACHMENT]				= ZmImg.I_ATTACHMENT;
ZmOperation.IMAGE[ZmOperation.BROWSE]					= ZmImg.I_BROWSE;
//ZmOperation.IMAGE[ZmOperation.CAL_VIEW_MENU]			= ZmImg.I_APPT;
ZmOperation.IMAGE[ZmOperation.CALL]						= ZmImg.I_TELEPHONE;
ZmOperation.IMAGE[ZmOperation.CANCEL]					= ZmImg.I_RED_X;
ZmOperation.IMAGE[ZmOperation.CLOSE]					= ZmImg.I_UNDO;
ZmOperation.IMAGE[ZmOperation.COMPOSE_FORMAT] 			= ZmImg.I_FORMAT;
ZmOperation.IMAGE[ZmOperation.DAY_VIEW]					= ZmImg.I_DAY_VIEW;
ZmOperation.IMAGE[ZmOperation.DELETE]					= ZmImg.I_DELETE;
ZmOperation.IMAGE[ZmOperation.DELETE_CONV]				= ZmImg.I_DELETE_CONV;
ZmOperation.IMAGE[ZmOperation.DELETE_MENU]				= ZmImg.I_DELETE;
ZmOperation.IMAGE[ZmOperation.DETACH_COMPOSE] 			= ZmImg.I_DETACH;
ZmOperation.IMAGE[ZmOperation.EDIT] 					= ZmImg.I_FORMAT;
ZmOperation.IMAGE[ZmOperation.EDIT_CONTACT]				= ZmImg.I_FORMAT;
ZmOperation.IMAGE[ZmOperation.EDIT_FILTER_RULE] 		= ZmImg.I_FORMAT;
ZmOperation.IMAGE[ZmOperation.EDIT_REPLY_ACCEPT]		= ZmImg.I_CHECK;
ZmOperation.IMAGE[ZmOperation.EDIT_REPLY_DECLINE]		= ZmImg.I_RED_X;
ZmOperation.IMAGE[ZmOperation.EDIT_REPLY_TENTATIVE]		= ZmImg.I_QUESTION_MARK;
ZmOperation.IMAGE[ZmOperation.EXPAND_ALL]				= ZmImg.I_PLUS;
ZmOperation.IMAGE[ZmOperation.FORWARD]					= ZmImg.I_FORWARD;
ZmOperation.IMAGE[ZmOperation.GO_TO_URL]				= ZmImg.I_HTML;
ZmOperation.IMAGE[ZmOperation.IM]						= ZmImg.I_IM;
ZmOperation.IMAGE[ZmOperation.INVITE_REPLY_MENU]		= ZmImg.I_REPLY;
ZmOperation.IMAGE[ZmOperation.MARK_ALL_READ]			= ZmImg.I_READ_MSG;
ZmOperation.IMAGE[ZmOperation.MARK_READ]				= ZmImg.I_READ_MSG;
ZmOperation.IMAGE[ZmOperation.MARK_UNREAD]				= ZmImg.I_ENVELOPE;
ZmOperation.IMAGE[ZmOperation.MODIFY_SEARCH]			= ZmImg.I_SEARCH_FOLDER;
ZmOperation.IMAGE[ZmOperation.MONTH_VIEW]				= ZmImg.I_MONTH_VIEW;
ZmOperation.IMAGE[ZmOperation.MOVE]						= ZmImg.I_MOVE;
ZmOperation.IMAGE[ZmOperation.MOVE_DOWN_FILTER_RULE]	= ZmImg.I_DOWN_ARROW;
ZmOperation.IMAGE[ZmOperation.MOVE_UP_FILTER_RULE]		= ZmImg.I_UP_ARROW;
ZmOperation.IMAGE[ZmOperation.NEW_APPT]					= ZmImg.I_APPT;
ZmOperation.IMAGE[ZmOperation.NEW_CONTACT]				= ZmImg.I_CONTACT;
ZmOperation.IMAGE[ZmOperation.NEW_FOLDER]				= ZmImg.I_NEW_FOLDER;
ZmOperation.IMAGE[ZmOperation.NEW_MESSAGE]				= ZmImg.I_MAIL_MSG;
ZmOperation.IMAGE[ZmOperation.NEW_TAG]					= ZmImg.I_TAG;
ZmOperation.IMAGE[ZmOperation.PAGE_BACK]				= ZmImg.I_BACK_ARROW;
ZmOperation.IMAGE[ZmOperation.PAGE_DBL_BACK]			= ZmImg.I_DBL_BACK_ARROW;
ZmOperation.IMAGE[ZmOperation.PAGE_DBL_FORW]			= ZmImg.I_DBL_FORW_ARROW;
ZmOperation.IMAGE[ZmOperation.PAGE_FORWARD]				= ZmImg.I_FORWARD_ARROW;
ZmOperation.IMAGE[ZmOperation.PRINT]					= ZmImg.I_PRINTER;
ZmOperation.IMAGE[ZmOperation.REMOVE_FILTER_RULE]		= ZmImg.I_DELETE;
ZmOperation.IMAGE[ZmOperation.RENAME_FOLDER]			= ZmImg.I_RENAME;
ZmOperation.IMAGE[ZmOperation.RENAME_SEARCH]			= ZmImg.I_RENAME;
ZmOperation.IMAGE[ZmOperation.RENAME_TAG]				= ZmImg.I_RENAME;
ZmOperation.IMAGE[ZmOperation.REPLY]					= ZmImg.I_REPLY;
ZmOperation.IMAGE[ZmOperation.REPLY_ACCEPT]			    = ZmImg.I_CHECK;
ZmOperation.IMAGE[ZmOperation.REPLY_ALL]				= ZmImg.I_REPLY_ALL;
ZmOperation.IMAGE[ZmOperation.REPLY_DECLINE]			= ZmImg.I_RED_X;
ZmOperation.IMAGE[ZmOperation.REPLY_MENU]				= ZmImg.I_REPLY;
ZmOperation.IMAGE[ZmOperation.REPLY_NEW_TIME]		    = ZmImg.I_NEW_TIME;
ZmOperation.IMAGE[ZmOperation.REPLY_TENTATIVE]          = ZmImg.I_QUESTION_MARK;
ZmOperation.IMAGE[ZmOperation.SAVE]						= ZmImg.I_SAVE;
ZmOperation.IMAGE[ZmOperation.SAVE_DRAFT]				= ZmImg.I_DRAFT_FOLDER;
ZmOperation.IMAGE[ZmOperation.SEARCH]					= ZmImg.I_SEARCH;
ZmOperation.IMAGE[ZmOperation.SEND]						= ZmImg.I_MAIL;
ZmOperation.IMAGE[ZmOperation.SHOW_ORIG]				= ZmImg.I_MAIL;
ZmOperation.IMAGE[ZmOperation.SPAM] 					= ZmImg.I_SPAM_FOLDER;
ZmOperation.IMAGE[ZmOperation.TAG_MENU]					= ZmImg.I_TAG;
//ZmOperation.IMAGE[ZmOperation.TODAY_GOTO]					= ZmImg.I_DATE;
ZmOperation.IMAGE[ZmOperation.VIEW]						= ZmImg.I_PANE_DOUBLE;
ZmOperation.IMAGE[ZmOperation.WEEK_VIEW]				= ZmImg.I_WEEK_VIEW;
ZmOperation.IMAGE[ZmOperation.WORK_WEEK_VIEW]			= ZmImg.I_WORK_WEEK_VIEW;

// Icons (when disabled)
// !! PLEASE ADD IN ALPHA ORDER !!
ZmOperation.DIS_IMAGE = new Object();
ZmOperation.DIS_IMAGE[ZmOperation.ATTACHMENT]			= ZmImg.ID_ATTACHMENT;
ZmOperation.DIS_IMAGE[ZmOperation.BROWSE]				= ZmImg.ID_BROWSE;
ZmOperation.DIS_IMAGE[ZmOperation.DAY_VIEW]				= ZmImg.ID_DAY_VIEW;
ZmOperation.DIS_IMAGE[ZmOperation.DELETE]				= ZmImg.ID_DELETE;
ZmOperation.DIS_IMAGE[ZmOperation.DELETE_MENU]			= ZmImg.ID_DELETE;
ZmOperation.DIS_IMAGE[ZmOperation.EDIT] 				= ZmImg.ID_FORMAT;
ZmOperation.DIS_IMAGE[ZmOperation.EDIT_FILTER_RULE] 	= ZmImg.ID_FORMAT;
ZmOperation.DIS_IMAGE[ZmOperation.FORWARD]				= ZmImg.ID_FORWARD;
ZmOperation.DIS_IMAGE[ZmOperation.IM]					= ZmImg.ID_IM;
ZmOperation.DIS_IMAGE[ZmOperation.MONTH_VIEW]			= ZmImg.ID_MONTH_VIEW;
ZmOperation.DIS_IMAGE[ZmOperation.MOVE]					= ZmImg.ID_MOVE;
ZmOperation.DIS_IMAGE[ZmOperation.NEW_MESSAGE]			= ZmImg.ID_MAIL_MSG;
ZmOperation.DIS_IMAGE[ZmOperation.NEW_TAG]				= ZmImg.ID_TAG;
ZmOperation.DIS_IMAGE[ZmOperation.PAGE_BACK]			= ZmImg.ID_BACK_ARROW;
ZmOperation.DIS_IMAGE[ZmOperation.PAGE_DBL_BACK]		= ZmImg.ID_DBL_BACK_ARROW;
ZmOperation.DIS_IMAGE[ZmOperation.PAGE_DBL_FORW]		= ZmImg.ID_DBL_FORW_ARROW;
ZmOperation.DIS_IMAGE[ZmOperation.PAGE_FORWARD]			= ZmImg.ID_FORWARD_ARROW;
ZmOperation.DIS_IMAGE[ZmOperation.PRINT]				= ZmImg.ID_PRINTER;
ZmOperation.DIS_IMAGE[ZmOperation.REPLY]				= ZmImg.ID_REPLY;
ZmOperation.DIS_IMAGE[ZmOperation.REPLY_ALL]			= ZmImg.ID_REPLY_ALL;
ZmOperation.DIS_IMAGE[ZmOperation.REPLY_MENU]			= ZmImg.ID_REPLY;
ZmOperation.DIS_IMAGE[ZmOperation.SAVE]					= ZmImg.ID_SAVE;
ZmOperation.DIS_IMAGE[ZmOperation.SEARCH]				= ZmImg.ID_SEARCH;
ZmOperation.DIS_IMAGE[ZmOperation.SEND]					= ZmImg.ID_MAIL;
ZmOperation.DIS_IMAGE[ZmOperation.SHOW_ORIG]			= ZmImg.ID_MAIL;
ZmOperation.DIS_IMAGE[ZmOperation.SPAM] 				= ZmImg.ID_SPAM_FOLDER;
ZmOperation.DIS_IMAGE[ZmOperation.TAG_MENU]				= ZmImg.ID_TAG;
ZmOperation.DIS_IMAGE[ZmOperation.WEEK_VIEW]			= ZmImg.ID_WEEK_VIEW;
ZmOperation.DIS_IMAGE[ZmOperation.WORK_WEEK_VIEW]		= ZmImg.ID_WORK_WEEK_VIEW;

ZmOperation.KEY_ID = "_opId";
ZmOperation.KEY_TAG_MENU = "_tagMenu";

function ZmOperation_Descriptor(id, label, image, disImage, enabled, toolTip) {
	this.id = id;
	this.label = label ? label : ZmMsg[ZmOperation.MSG_KEY[id]];
	this.image = image ? image : ZmOperation.IMAGE[id];
	this.disImage = disImage ? disImage : ZmOperation.DIS_IMAGE[id];
	this.enabled = (enabled !== false);
	this.toolTip = toolTip ? toolTip : ZmMsg[ZmOperation.MSG_KEY_TT[id]];
	this.toolTip = toolTip ? toolTip : this.label;
}

// Static hash of operation IDs and descriptors
ZmOperation._operationDesc = new Object();

ZmOperation._createOperationDesc =
function(id) {
	return new ZmOperation_Descriptor(id, ZmMsg[ZmOperation.MSG_KEY[id]],
				ZmOperation.IMAGE[id], ZmOperation.DIS_IMAGE[id], true, ZmMsg[ZmOperation.MSG_KEY_TT[id]]);
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
ZmOperation.createOperations =
function(parent, standardOperations, extraOperations) {
	var obj = new ZmOperation();
	return obj._createOperations(parent, standardOperations, extraOperations);
}

// Done through an object so that we can have more than one invocation going without 
// sharing memory (eg, creating New submenu).
ZmOperation.prototype._createOperations =
function(parent, standardOperations, extraOperations) {
	if (standardOperations == ZmOperation.NONE) {
		standardOperations = null;
	}
	// assemble the list of operation IDs, and the list of operation descriptors
	var operationList = new Array();
	if (standardOperations || extraOperations) {
		if (standardOperations && standardOperations.length) {
			for (var i = 0; i < standardOperations.length; i++) {
				var id = standardOperations[i];
				operationList.push(id);
				ZmOperation._operationDesc[id] = ZmOperation._createOperationDesc(id);
			}
		}
		if (extraOperations && extraOperations.length) {
			for (var i = 0; i < extraOperations.length; i++) {
				var extra = extraOperations[i];
				var id = extra.id;
				extra.label = (extra.label == Dwt.DEFAULT) ? ZmMsg[ZmOperation.MSG_KEY[id]] : extra.label;
				extra.image = (extra.image == Dwt.DEFAULT) ? ZmOperation.IMAGE[id] : extra.image;
				extra.disImage = (extra.disImage == Dwt.DEFAULT) ? ZmOperation.DIS_IMAGE[id] : extra.disImage;
				extra.toolTip = (extra.toolTip == Dwt.DEFAULT) ? ZmMsg[ZmOperation.MSG_KEY_TT[id]] : extra.toolTip;
				operationList.push(id);
				ZmOperation._operationDesc[id] = extra;
			}
		}
	}

	var operations = new Object();
	for (var i = 0; i < operationList.length; i++) {
		ZmOperation.addOperation(parent, operationList[i], operations);
	}
	
	return operations;
}

ZmOperation.addOperation =
function(parent, id, opHash) {
	if (!ZmOperation._operationDesc[id])
		ZmOperation._operationDesc[id] = ZmOperation._createOperationDesc(id);
	if (id == ZmOperation.SEP) {
		parent.createSeparator();
	} else {
		var label = ZmOperation._operationDesc[id].label;
		var image = ZmOperation._operationDesc[id].image;
		var disImage = ZmOperation._operationDesc[id].disImage;
		var enabled = ZmOperation._operationDesc[id].enabled;
		var toolTip = ZmOperation._operationDesc[id].toolTip;
		opHash[id] = parent.createOp(id, label, image, disImage, enabled, toolTip);
	}
	if (id == ZmOperation.NEW_MENU) {
		ZmOperation.addNewMenu(opHash[id]);
	} else if (id == ZmOperation.TAG_MENU) {
		ZmOperation.addTagMenu(opHash[id]);
	} else if (id == ZmOperation.COLOR_MENU) {
		ZmOperation.addColorMenu(opHash[id]);
	} else if (id == ZmOperation.REPLY_MENU) {
		ZmOperation.addReplyMenu(opHash[id]);
	} else if (id == ZmOperation.INVITE_REPLY_MENU) {
		ZmOperation.addInviteReplyMenu(opHash[id]);
	} else if (id == ZmOperation.CAL_VIEW_MENU) {
		ZmOperation.addCalViewMenu(opHash[id]);
	}

}

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
	
	op.setText(text || ZmMsg[ZmOperation.MSG_KEY[newOp]]);
	op.setImage(image || ZmOperation.IMAGE[newOp]);
	op.setDisabledImage(disImage || ZmOperation.DIS_IMAGE[newOp]);
}

/**
* Adds a "New" submenu. Custom descriptors are used because we don't want "New" at the
* beginning of each label.
*
* @param parent		parent widget
*/
ZmOperation.addNewMenu =
function(parent) {
	var appCtxt = parent.shell.getData(ZmAppCtxt.LABEL);
	var list = new Array();
	list.push(new ZmOperation_Descriptor(ZmOperation.NEW_MESSAGE, ZmMsg.message, Dwt.DEFAULT, Dwt.DEFAULT));
	if (appCtxt.get(ZmSetting.CONTACTS_ENABLED))
		list.push(new ZmOperation_Descriptor(ZmOperation.NEW_CONTACT, ZmMsg.contact, Dwt.DEFAULT, Dwt.DEFAULT));
	if (appCtxt.get(ZmSetting.CALENDAR_ENABLED))
		list.push(new ZmOperation_Descriptor(ZmOperation.NEW_APPT, ZmMsg.appointment, Dwt.DEFAULT, Dwt.DEFAULT));
	if (appCtxt.get(ZmSetting.USER_FOLDERS_ENABLED) || appCtxt.get(ZmSetting.TAGGING_ENABLED)) {
		list.push(new ZmOperation_Descriptor(ZmOperation.SEP, Dwt.DEFAULT, Dwt.DEFAULT, Dwt.DEFAULT));
		if (appCtxt.get(ZmSetting.USER_FOLDERS_ENABLED))
			list.push(new ZmOperation_Descriptor(ZmOperation.NEW_FOLDER, ZmMsg.folder, Dwt.DEFAULT, Dwt.DEFAULT));
		if (appCtxt.get(ZmSetting.TAGGING_ENABLED))
			list.push(new ZmOperation_Descriptor(ZmOperation.NEW_TAG, ZmMsg.tag, Dwt.DEFAULT, Dwt.DEFAULT));
	}
	var menu = new ZmActionMenu(parent, ZmOperation.NONE, list);
	parent.setMenu(menu);
}

/**
* Adds a "Tag" submenu for tagging items.
*
* @param parent		parent widget (a toolbar or action menu)
*/
ZmOperation.addTagMenu =
function(parent) {
	var tagMenu = new ZmTagMenu(parent, null);
	parent.setData(ZmOperation.KEY_TAG_MENU, tagMenu);
}

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
		var mi = menu.createMenuItem(color, ZmTag.COLOR_ICON[color], ZmTag.COLOR_TEXT[color]);
		mi.setData(ZmOperation.MENUITEM_ID, color);
	}
}

/**
* Adds a "Reply" submenu for replying to sender or all.
*
* @param parent		parent widget (a toolbar or action menu)
*/
ZmOperation.addReplyMenu =
function(parent) {
	var list = [ZmOperation.REPLY, ZmOperation.REPLY_ALL];
	var menu = new ZmActionMenu(parent, list, null);
	parent.setMenu(menu);
}

/**
 * Adds an invite actions submenu for accept/decline/tentative.
 *
 * @param parent		parent widget (a toolbar or action menu)
 */
ZmOperation.addInviteReplyMenu =
function(parent) {
	var list = [ZmOperation.EDIT_REPLY_ACCEPT, ZmOperation.EDIT_REPLY_DECLINE, ZmOperation.EDIT_REPLY_TENTATIVE];
	var menu = new ZmActionMenu(parent, list, null);
	parent.setMenu(menu);
};


/**
 * Adds an invite actions submenu for accept/decline/tentative.
 *
 * @param parent		parent widget (a toolbar or action menu)
 */
ZmOperation.addCalViewMenu =
function(parent) {
	var list = [ZmOperation.DAY_VIEW, ZmOperation.WORK_WEEK_VIEW, ZmOperation.WEEK_VIEW, ZmOperation.MONTH_VIEW];
	var menu = new ZmActionMenu(parent, list, null);
	parent.setMenu(menu);
};