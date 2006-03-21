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
 * The Original Code is: Zimbra Collaboration Suite Web Client
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
ZmOperation.NONE 					= -1;		// no operations or menu items
ZmOperation.SEP 					= -2;		// separator
ZmOperation.SPACER 					= -3;		// spacer (toolbar)
ZmOperation.FILLER 					= -4;		// filler (toolbar)

var i = 1;
// !! PLEASE ADD IN ALPHA ORDER !!
ZmOperation.ADD_FILTER_RULE			= i++;
ZmOperation.ADD_SIGNATURE			= i++;
ZmOperation.ATTACHMENT				= i++;
ZmOperation.BROWSE					= i++;
ZmOperation.CAL_REFRESH				= i++;
ZmOperation.CAL_VIEW_MENU			= i++;
ZmOperation.CALL					= i++;
ZmOperation.CANCEL					= i++;
ZmOperation.CHECK_ALL				= i++;
ZmOperation.CHECK_MAIL				= i++;
ZmOperation.CLEAR_ALL				= i++;
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
ZmOperation.EDIT_PROPS				= i++;
ZmOperation.EDIT_REPLY_ACCEPT		= i++;
ZmOperation.EDIT_REPLY_CANCEL		= i++;
ZmOperation.EDIT_REPLY_DECLINE		= i++;
ZmOperation.EDIT_REPLY_TENTATIVE	= i++;
ZmOperation.EXPAND_ALL				= i++;
ZmOperation.FORWARD					= i++;
ZmOperation.FORWARD_ATT 			= i++;
ZmOperation.FORWARD_INLINE			= i++;
ZmOperation.FORWARD_MENU 			= i++;
ZmOperation.GO_TO_URL				= i++;
ZmOperation.IM						= i++;
ZmOperation.IM_NEW_CHAT  			= i++;
ZmOperation.IM_NEW_GROUP_CHAT		= i++;
ZmOperation.IM_PRESENCE_AWAY    	= i++;
ZmOperation.IM_PRESENCE_CHAT    	= i++;
ZmOperation.IM_PRESENCE_DND			= i++;
ZmOperation.IM_PRESENCE_INVISIBLE	= i++;
ZmOperation.IM_PRESENCE_MENU		= i++;
ZmOperation.IM_PRESENCE_OFFLINE  	= i++;
ZmOperation.IM_PRESENCE_ONLINE   	= i++;
ZmOperation.IM_PRESENCE_XA			= i++;
ZmOperation.INVITE_REPLY_MENU		= i++;
ZmOperation.INVITE_REPLY_ACCEPT		= i++;
ZmOperation.INVITE_REPLY_DECLINE	= i++;
ZmOperation.INVITE_REPLY_TENTATIVE	= i++;
ZmOperation.MARK_ALL_READ			= i++;
ZmOperation.MARK_READ				= i++;
ZmOperation.MARK_UNREAD				= i++;
ZmOperation.MODIFY_SEARCH			= i++;
ZmOperation.MONTH_VIEW				= i++;
ZmOperation.MOUNT_CALENDAR			= i++;
ZmOperation.MOVE					= i++;
ZmOperation.MOVE_UP_FILTER_RULE		= i++;
ZmOperation.MOVE_DOWN_FILTER_RULE	= i++;
ZmOperation.NEW_APPT				= i++;
ZmOperation.NEW_ALLDAY_APPT			= i++;
ZmOperation.NEW_CONTACT				= i++;
ZmOperation.NEW_FOLDER				= i++;
ZmOperation.NEW_CALENDAR			= i++;
ZmOperation.NEW_MENU				= i++;
ZmOperation.NEW_MESSAGE				= i++;
ZmOperation.NEW_ROSTER_ITEM			= i++;
ZmOperation.NEW_TAG					= i++;
ZmOperation.PAGE_BACK				= i++;
ZmOperation.PAGE_DBL_BACK 			= i++;
ZmOperation.PAGE_DBL_FORW			= i++;
ZmOperation.PAGE_FORWARD			= i++;
ZmOperation.PRINT					= i++;
ZmOperation.PRINT_CONTACTLIST 		= i++;
ZmOperation.PRINT_MENU 				= i++;
ZmOperation.REFRESH					= i++;
ZmOperation.REMOVE_FILTER_RULE		= i++;
ZmOperation.RENAME_FOLDER			= i++;
ZmOperation.RENAME_SEARCH			= i++;
ZmOperation.RENAME_TAG				= i++;
ZmOperation.REPLY					= i++;
ZmOperation.REPLY_ACCEPT			= i++;
ZmOperation.REPLY_CANCEL			= i++;
ZmOperation.REPLY_ALL				= i++;
ZmOperation.REPLY_DECLINE			= i++;
ZmOperation.REPLY_MENU				= i++;
ZmOperation.REPLY_NEW_TIME		    = i++;
ZmOperation.REPLY_TENTATIVE			= i++;
ZmOperation.SAVE					= i++;
ZmOperation.SAVE_DRAFT				= i++;
ZmOperation.SCHEDULE_VIEW			= i++;
ZmOperation.SEARCH					= i++;
ZmOperation.SEARCH_MAIL    			= i++;
ZmOperation.SEND					= i++;
ZmOperation.SHARE					= i++;
ZmOperation.SHARE_CALENDAR			= i++;
ZmOperation.SHARE_ACCEPT			= i++;
ZmOperation.SHARE_DECLINE			= i++;
ZmOperation.SHOW_ORIG				= i++;
ZmOperation.SPAM 					= i++;
ZmOperation.SPELL_CHECK 			= i++;
ZmOperation.SYNC	 				= i++;
ZmOperation.TAG_MENU				= i++;
ZmOperation.TAG						= i++;
ZmOperation.TEXT 					= i++;
ZmOperation.TODAY					= i++;
ZmOperation.TODAY_GOTO				= i++;
ZmOperation.UNDELETE 				= i++;
ZmOperation.VIEW					= i++;
ZmOperation.VIEW_APPOINTMENT		= i++;
ZmOperation.VIEW_APPT_INSTANCE		= i++;
ZmOperation.VIEW_APPT_SERIES		= i++;
ZmOperation.WEEK_VIEW				= i++;
ZmOperation.WORK_WEEK_VIEW			= i++;
ZmOperation.ZIMLET					= i++;

// Labels
// !! PLEASE ADD IN ALPHA ORDER !!
ZmOperation.MSG_KEY = new Object();
ZmOperation.MSG_KEY[ZmOperation.ADD_FILTER_RULE]		= "newFilter";
ZmOperation.MSG_KEY[ZmOperation.ADD_SIGNATURE]			= "addSignature";
ZmOperation.MSG_KEY[ZmOperation.ATTACHMENT]				= "addAttachment";
ZmOperation.MSG_KEY[ZmOperation.BROWSE]					= "advancedSearch";
ZmOperation.MSG_KEY[ZmOperation.CAL_REFRESH]			= "refresh";
ZmOperation.MSG_KEY[ZmOperation.CAL_VIEW_MENU]			= "view";
ZmOperation.MSG_KEY[ZmOperation.CANCEL]					= "cancel";
ZmOperation.MSG_KEY[ZmOperation.CHECK_ALL]				= "checkAll";
ZmOperation.MSG_KEY[ZmOperation.CHECK_MAIL]				= "checkMail";
ZmOperation.MSG_KEY[ZmOperation.CLEAR_ALL]				= "clearAll";
ZmOperation.MSG_KEY[ZmOperation.CLOSE]					= "close";
ZmOperation.MSG_KEY[ZmOperation.COLOR_MENU]				= "tagColor";
ZmOperation.MSG_KEY[ZmOperation.COMPOSE_FORMAT] 		= "format";
ZmOperation.MSG_KEY[ZmOperation.DAY_VIEW]				= "viewDay";
ZmOperation.MSG_KEY[ZmOperation.DELETE]					= "del";
ZmOperation.MSG_KEY[ZmOperation.DELETE_CONV]			= "delConv";
ZmOperation.MSG_KEY[ZmOperation.DETACH_COMPOSE] 		= "detach";
ZmOperation.MSG_KEY[ZmOperation.EDIT] 					= "edit";
ZmOperation.MSG_KEY[ZmOperation.EDIT_CONTACT]			= "AB_EDIT_CONTACT";
ZmOperation.MSG_KEY[ZmOperation.EDIT_FILTER_RULE]		= "filterEdit";
ZmOperation.MSG_KEY[ZmOperation.EDIT_PROPS]				= "editProperties";
ZmOperation.MSG_KEY[ZmOperation.EDIT_REPLY_ACCEPT]		= "replyAccept";
ZmOperation.MSG_KEY[ZmOperation.EDIT_REPLY_DECLINE]		= "replyDecline";
ZmOperation.MSG_KEY[ZmOperation.EDIT_REPLY_TENTATIVE]   = "replyTentative";
ZmOperation.MSG_KEY[ZmOperation.EXPAND_ALL]				= "expandAll";
ZmOperation.MSG_KEY[ZmOperation.FORWARD]				= "forward";
ZmOperation.MSG_KEY[ZmOperation.FORWARD_ATT] 			= "forwardAtt";
ZmOperation.MSG_KEY[ZmOperation.FORWARD_INLINE] 		= "forwardInline";
ZmOperation.MSG_KEY[ZmOperation.FORWARD_MENU] 			= "forward";
ZmOperation.MSG_KEY[ZmOperation.IM]						= "newIM";
ZmOperation.MSG_KEY[ZmOperation.IM_NEW_CHAT]			= "imNewChat";
ZmOperation.MSG_KEY[ZmOperation.IM_NEW_GROUP_CHAT]		= "imNewGroupChat";
ZmOperation.MSG_KEY[ZmOperation.IM_PRESENCE_AWAY]		= "imStatusAway";
ZmOperation.MSG_KEY[ZmOperation.IM_PRESENCE_CHAT]		= "imStatusChat";
ZmOperation.MSG_KEY[ZmOperation.IM_PRESENCE_DND]		= "imStatusDND";
ZmOperation.MSG_KEY[ZmOperation.IM_PRESENCE_INVISIBLE]	= "imStatusInvisible";
ZmOperation.MSG_KEY[ZmOperation.IM_PRESENCE_MENU]		= "imPresence";
ZmOperation.MSG_KEY[ZmOperation.IM_PRESENCE_OFFLINE]	= "imStatusOffline";
ZmOperation.MSG_KEY[ZmOperation.IM_PRESENCE_ONLINE]		= "imStatusOnline";
ZmOperation.MSG_KEY[ZmOperation.IM_PRESENCE_XA]			= "imStatusExtAway";
ZmOperation.MSG_KEY[ZmOperation.INVITE_REPLY_MENU]		= "editReply";
ZmOperation.MSG_KEY[ZmOperation.INVITE_REPLY_ACCEPT]	= "editReply";
ZmOperation.MSG_KEY[ZmOperation.INVITE_REPLY_DECLINE]	= "editReply";
ZmOperation.MSG_KEY[ZmOperation.INVITE_REPLY_TENTATIVE]	= "editReply";
ZmOperation.MSG_KEY[ZmOperation.MARK_ALL_READ]			= "markAllRead";
ZmOperation.MSG_KEY[ZmOperation.MARK_READ]				= "markAsRead";
ZmOperation.MSG_KEY[ZmOperation.MARK_UNREAD]			= "markAsUnread";
ZmOperation.MSG_KEY[ZmOperation.MODIFY_SEARCH]			= "modifySearch";
ZmOperation.MSG_KEY[ZmOperation.MONTH_VIEW]				= "viewMonth";
ZmOperation.MSG_KEY[ZmOperation.MOUNT_CALENDAR]			= "mountCalendar";
ZmOperation.MSG_KEY[ZmOperation.MOVE]					= "move";
ZmOperation.MSG_KEY[ZmOperation.MOVE_UP_FILTER_RULE]	= "filterMoveUp";
ZmOperation.MSG_KEY[ZmOperation.MOVE_DOWN_FILTER_RULE]	= "filterMoveDown";
ZmOperation.MSG_KEY[ZmOperation.NEW_APPT]				= "newAppt";
ZmOperation.MSG_KEY[ZmOperation.NEW_ALLDAY_APPT]		= "newAllDayAppt";
ZmOperation.MSG_KEY[ZmOperation.NEW_CONTACT]			= "newContact";
ZmOperation.MSG_KEY[ZmOperation.NEW_FOLDER]				= "newFolder";
ZmOperation.MSG_KEY[ZmOperation.NEW_CALENDAR]			= "newCalendar";
ZmOperation.MSG_KEY[ZmOperation.NEW_MENU]				= "_new";
ZmOperation.MSG_KEY[ZmOperation.NEW_MESSAGE]			= "newEmail";
ZmOperation.MSG_KEY[ZmOperation.NEW_ROSTER_ITEM]		= "newRosterItem";
ZmOperation.MSG_KEY[ZmOperation.NEW_TAG]				= "newTag";
ZmOperation.MSG_KEY[ZmOperation.PRINT]					= "print";
ZmOperation.MSG_KEY[ZmOperation.PRINT_CONTACTLIST] 		= "printContactListTooltip";
ZmOperation.MSG_KEY[ZmOperation.REFRESH]			    = "refresh";
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
ZmOperation.MSG_KEY[ZmOperation.SCHEDULE_VIEW]			= "viewSchedule";
ZmOperation.MSG_KEY[ZmOperation.SEARCH]					= "search";
ZmOperation.MSG_KEY[ZmOperation.SEARCH_MAIL]				= "searchMail";
ZmOperation.MSG_KEY[ZmOperation.SEND]					= "send";
ZmOperation.MSG_KEY[ZmOperation.SHARE]					= "share";
ZmOperation.MSG_KEY[ZmOperation.SHARE_ACCEPT]			= "acceptShare";
ZmOperation.MSG_KEY[ZmOperation.SHARE_CALENDAR]			= "shareCalendar";
ZmOperation.MSG_KEY[ZmOperation.SHARE_DECLINE]			= "declineShare";
ZmOperation.MSG_KEY[ZmOperation.SHOW_ORIG]				= "showOrig";
ZmOperation.MSG_KEY[ZmOperation.SPAM] 					= "junk";
ZmOperation.MSG_KEY[ZmOperation.SPELL_CHECK] 			= "spellCheck";
ZmOperation.MSG_KEY[ZmOperation.SYNC]		 			= "reload";
ZmOperation.MSG_KEY[ZmOperation.TAG_MENU]				= "tag";
//ZmOperation.MSG_KEY[ZmOperation.TODAY]					= "today";
ZmOperation.MSG_KEY[ZmOperation.TODAY_GOTO]				= "todayGoto";
ZmOperation.MSG_KEY[ZmOperation.UNDELETE] 				= "undelete";
ZmOperation.MSG_KEY[ZmOperation.VIEW]					= "view";
ZmOperation.MSG_KEY[ZmOperation.VIEW_APPOINTMENT]		= "viewAppointment";
ZmOperation.MSG_KEY[ZmOperation.VIEW_APPT_INSTANCE]		= "apptInstance";
ZmOperation.MSG_KEY[ZmOperation.VIEW_APPT_SERIES]		= "apptSeries";
ZmOperation.MSG_KEY[ZmOperation.WEEK_VIEW]				= "viewWeek";
ZmOperation.MSG_KEY[ZmOperation.WORK_WEEK_VIEW]			= "viewWorkWeek";

// !! PLEASE ADD IN ALPHA ORDER !!
ZmOperation.MSG_KEY_TT = new Object();
ZmOperation.MSG_KEY_TT[ZmOperation.ATTACHMENT]			= "attachmentTooltip";
ZmOperation.MSG_KEY_TT[ZmOperation.CANCEL]				= "cancelTooltip";
ZmOperation.MSG_KEY_TT[ZmOperation.CAL_REFRESH]			= "calRefreshTooltip";
ZmOperation.MSG_KEY_TT[ZmOperation.CHECK_MAIL]			= "checkMailTooltip";
ZmOperation.MSG_KEY_TT[ZmOperation.CLOSE]				= "closeTooltip";
ZmOperation.MSG_KEY_TT[ZmOperation.COMPOSE]				= "newMessageTooltip";
ZmOperation.MSG_KEY_TT[ZmOperation.COMPOSE_FORMAT] 		= "formatTooltip";
ZmOperation.MSG_KEY_TT[ZmOperation.DAY_VIEW]			= "viewDayTooltip";
ZmOperation.MSG_KEY_TT[ZmOperation.DELETE]				= "deleteTooltip";
ZmOperation.MSG_KEY_TT[ZmOperation.DELETE_MENU]			= "deleteTooltip";
ZmOperation.MSG_KEY_TT[ZmOperation.DETACH_COMPOSE] 		= "detachTooltip";
ZmOperation.MSG_KEY_TT[ZmOperation.EDIT]				= "editTooltip";
ZmOperation.MSG_KEY_TT[ZmOperation.EDIT_PROPS]			= "editPropertiesTooltip";
ZmOperation.MSG_KEY_TT[ZmOperation.FORWARD]				= "forwardTooltip";
ZmOperation.MSG_KEY_TT[ZmOperation.FORWARD_ATT]			= "forwardAtt";
ZmOperation.MSG_KEY_TT[ZmOperation.FORWARD_INLINE]		= "forwardTooltip";
ZmOperation.MSG_KEY_TT[ZmOperation.FORWARD_MENU]		= "forwardTooltip";
ZmOperation.MSG_KEY_TT[ZmOperation.MONTH_VIEW]			= "viewMonthTooltip";
ZmOperation.MSG_KEY_TT[ZmOperation.MOVE]				= "moveTooltip";
ZmOperation.MSG_KEY_TT[ZmOperation.NEW_APPT]			= "newApptTooltip";
ZmOperation.MSG_KEY_TT[ZmOperation.NEW_ALLDAY_APPT]		= "newAllDayApptTooltip";
ZmOperation.MSG_KEY_TT[ZmOperation.NEW_CONTACT]			= "newContactTooltip";
ZmOperation.MSG_KEY_TT[ZmOperation.NEW_FOLDER]			= "newFolderTooltip";
ZmOperation.MSG_KEY_TT[ZmOperation.NEW_MESSAGE]			= "newMessageTooltip";
ZmOperation.MSG_KEY_TT[ZmOperation.NEW_TAG]				= "newTagTooltip";
ZmOperation.MSG_KEY_TT[ZmOperation.PRINT]				= "printTooltip";
ZmOperation.MSG_KEY_TT[ZmOperation.PRINT_MENU]	 		= "printTooltip";
ZmOperation.MSG_KEY_TT[ZmOperation.REPLY]				= "replyTooltip";
ZmOperation.MSG_KEY_TT[ZmOperation.REPLY_ALL]			= "replyAllTooltip";
ZmOperation.MSG_KEY_TT[ZmOperation.SCHEDULE_VIEW]		= "viewScheduleTooltip";
ZmOperation.MSG_KEY_TT[ZmOperation.SHARE]				= "shareTooltip";
ZmOperation.MSG_KEY_TT[ZmOperation.SAVE_DRAFT]			= "saveDraftTooltip";
ZmOperation.MSG_KEY_TT[ZmOperation.SEND]				= "sendTooltip";
ZmOperation.MSG_KEY_TT[ZmOperation.SPAM]				= "junkTooltip";
ZmOperation.MSG_KEY_TT[ZmOperation.TAG_MENU]			= "tagTooltip";
ZmOperation.MSG_KEY_TT[ZmOperation.TODAY]				= "todayTooltip";
ZmOperation.MSG_KEY_TT[ZmOperation.UNDELETE] 			= "undelete";
ZmOperation.MSG_KEY_TT[ZmOperation.WEEK_VIEW]			= "viewWeekTooltip";
ZmOperation.MSG_KEY_TT[ZmOperation.WORK_WEEK_VIEW]		= "viewWorkWeekTooltip";

// Icons (when enabled)
// !! PLEASE ADD IN ALPHA ORDER !!
ZmOperation.IMAGE = new Object();
ZmOperation.IMAGE[ZmOperation.ADD_FILTER_RULE]			= "Plus";
ZmOperation.IMAGE[ZmOperation.ATTACHMENT]				= "Attachment";
ZmOperation.IMAGE[ZmOperation.BROWSE]					= "SearchBuilder";
ZmOperation.IMAGE[ZmOperation.CAL_REFRESH]				= "SendRecieve"; // [sic]
ZmOperation.IMAGE[ZmOperation.CAL_VIEW_MENU]			= "Appointment";
ZmOperation.IMAGE[ZmOperation.CALL]						= "Telephone";
ZmOperation.IMAGE[ZmOperation.CANCEL]					= "Cancel";
ZmOperation.IMAGE[ZmOperation.CHECK_ALL]				= "Check";
ZmOperation.IMAGE[ZmOperation.CHECK_MAIL]				= "SendRecieve"; //SIC!
ZmOperation.IMAGE[ZmOperation.CLEAR_ALL]				= "Cancel";
ZmOperation.IMAGE[ZmOperation.CLOSE]					= "Close";
ZmOperation.IMAGE[ZmOperation.COMPOSE_FORMAT] 			= "SwitchFormat";
ZmOperation.IMAGE[ZmOperation.DAY_VIEW]					= "DayView";
ZmOperation.IMAGE[ZmOperation.DELETE]					= "Delete";
ZmOperation.IMAGE[ZmOperation.DELETE_CONV]				= "DeleteConversation";
ZmOperation.IMAGE[ZmOperation.DELETE_MENU]				= "Delete";
ZmOperation.IMAGE[ZmOperation.DETACH_COMPOSE] 			= "OpenInNewWindow";
ZmOperation.IMAGE[ZmOperation.EDIT] 					= "Edit";
ZmOperation.IMAGE[ZmOperation.EDIT_CONTACT]				= "Edit";
ZmOperation.IMAGE[ZmOperation.EDIT_FILTER_RULE] 		= "Edit";
ZmOperation.IMAGE[ZmOperation.EDIT_PROPS]				= "Properties";
ZmOperation.IMAGE[ZmOperation.EDIT_REPLY_ACCEPT]		= "Check";
ZmOperation.IMAGE[ZmOperation.EDIT_REPLY_DECLINE]		= "Cancel";
ZmOperation.IMAGE[ZmOperation.EDIT_REPLY_TENTATIVE]		= "QuestionMark";
ZmOperation.IMAGE[ZmOperation.EXPAND_ALL]				= "Plus";
ZmOperation.IMAGE[ZmOperation.FORWARD]					= "Forward";
ZmOperation.IMAGE[ZmOperation.FORWARD_ATT]				= "Forward";
ZmOperation.IMAGE[ZmOperation.FORWARD_INLINE] 			= "Forward";
ZmOperation.IMAGE[ZmOperation.FORWARD_MENU]				= "Forward";
ZmOperation.IMAGE[ZmOperation.GO_TO_URL]				= "URL";
ZmOperation.IMAGE[ZmOperation.IM]						= "ImStartChat";
ZmOperation.IMAGE[ZmOperation.IM_NEW_CHAT]				= "ImFree2Chat";
ZmOperation.IMAGE[ZmOperation.IM_NEW_GROUP_CHAT]		= "ImFree2Chat";
ZmOperation.IMAGE[ZmOperation.IM_PRESENCE_AWAY]			= "ImAway";
ZmOperation.IMAGE[ZmOperation.IM_PRESENCE_CHAT]			= "ImFree2Chat";
ZmOperation.IMAGE[ZmOperation.IM_PRESENCE_DND]			= "ImDnd";
ZmOperation.IMAGE[ZmOperation.IM_PRESENCE_INVISIBLE]	= "ImInvisible";
ZmOperation.IMAGE[ZmOperation.IM_PRESENCE_OFFLINE]		= "RoundMinusDis"; // need new one
ZmOperation.IMAGE[ZmOperation.IM_PRESENCE_ONLINE]		= "ImAvailable";
ZmOperation.IMAGE[ZmOperation.IM_PRESENCE_XA]			= "ImExtendedAway";
ZmOperation.IMAGE[ZmOperation.INVITE_REPLY_MENU]		= "Reply";
ZmOperation.IMAGE[ZmOperation.INVITE_REPLY_ACCEPT]		= "Check";
ZmOperation.IMAGE[ZmOperation.INVITE_REPLY_DECLINE]		= "Cancel";
ZmOperation.IMAGE[ZmOperation.INVITE_REPLY_TENTATIVE]	= "QuestionMark";
ZmOperation.IMAGE[ZmOperation.MARK_ALL_READ]			= "ReadMessage";
ZmOperation.IMAGE[ZmOperation.MARK_READ]				= "ReadMessage";
ZmOperation.IMAGE[ZmOperation.MARK_UNREAD]				= "UnreadMessage";
ZmOperation.IMAGE[ZmOperation.MODIFY_SEARCH]			= "SearchFolder";
ZmOperation.IMAGE[ZmOperation.MONTH_VIEW]				= "MonthView";
ZmOperation.IMAGE[ZmOperation.MOUNT_CALENDAR]			= "GroupSchedule";
ZmOperation.IMAGE[ZmOperation.MOVE]						= "MoveToFolder";
ZmOperation.IMAGE[ZmOperation.MOVE_DOWN_FILTER_RULE]	= "DownArrow";
ZmOperation.IMAGE[ZmOperation.MOVE_UP_FILTER_RULE]		= "UpArrow";
ZmOperation.IMAGE[ZmOperation.NEW_APPT]					= "NewAppointment";
ZmOperation.IMAGE[ZmOperation.NEW_ALLDAY_APPT]			= "NewAppointment";
ZmOperation.IMAGE[ZmOperation.NEW_CALENDAR]				= "NewAppointment";
ZmOperation.IMAGE[ZmOperation.NEW_CONTACT]				= "NewContact";
ZmOperation.IMAGE[ZmOperation.NEW_FOLDER]				= "NewFolder";
ZmOperation.IMAGE[ZmOperation.NEW_MESSAGE]				= "NewMessage";
ZmOperation.IMAGE[ZmOperation.NEW_ROSTER_ITEM]			= "ImBuddy"; //"HappyEmoticon";
ZmOperation.IMAGE[ZmOperation.NEW_TAG]					= "NewTag";
ZmOperation.IMAGE[ZmOperation.PAGE_BACK]				= "LeftArrow";
ZmOperation.IMAGE[ZmOperation.PAGE_DBL_BACK]			= "LeftDoubleArrow";
ZmOperation.IMAGE[ZmOperation.PAGE_DBL_FORW]			= "RightDoubleArrow";
ZmOperation.IMAGE[ZmOperation.PAGE_FORWARD]				= "RightArrow";
ZmOperation.IMAGE[ZmOperation.PRINT]					= "Print";
ZmOperation.IMAGE[ZmOperation.PRINT_CONTACTLIST] 		= "Print"; 				// XXX: new icon?
ZmOperation.IMAGE[ZmOperation.PRINT_MENU]				= "Print";
ZmOperation.IMAGE[ZmOperation.REMOVE_FILTER_RULE]		= "Delete";
ZmOperation.IMAGE[ZmOperation.RENAME_FOLDER]			= "Rename";
ZmOperation.IMAGE[ZmOperation.RENAME_SEARCH]			= "Rename";
ZmOperation.IMAGE[ZmOperation.RENAME_TAG]				= "Rename";
ZmOperation.IMAGE[ZmOperation.REPLY]					= "Reply";
ZmOperation.IMAGE[ZmOperation.REPLY_ACCEPT]			    = "Check";
ZmOperation.IMAGE[ZmOperation.REPLY_ALL]				= "ReplyAll";
ZmOperation.IMAGE[ZmOperation.REPLY_DECLINE]			= "Cancel";
ZmOperation.IMAGE[ZmOperation.REPLY_MENU]				= "Reply";
ZmOperation.IMAGE[ZmOperation.REPLY_NEW_TIME]		    = "NewTime";
ZmOperation.IMAGE[ZmOperation.REPLY_TENTATIVE]          = "QuestionMark";
ZmOperation.IMAGE[ZmOperation.SAVE]						= "Save";
ZmOperation.IMAGE[ZmOperation.SAVE_DRAFT]				= "DraftFolder";
ZmOperation.IMAGE[ZmOperation.SCHEDULE_VIEW]			= "GroupSchedule";
ZmOperation.IMAGE[ZmOperation.SEARCH]					= "Search";
ZmOperation.IMAGE[ZmOperation.SEARCH_MAIL]				= "SearchMail";
ZmOperation.IMAGE[ZmOperation.SEND]						= "Send";
ZmOperation.IMAGE[ZmOperation.SHARE_ACCEPT]			    = "Check";
ZmOperation.IMAGE[ZmOperation.SHARE_CALENDAR]			= "CalendarFolder";
ZmOperation.IMAGE[ZmOperation.SHARE_DECLINE]			= "Cancel";
ZmOperation.IMAGE[ZmOperation.SHOW_ORIG]				= "Message";
ZmOperation.IMAGE[ZmOperation.SPAM] 					= "SpamFolder";
ZmOperation.IMAGE[ZmOperation.SPELL_CHECK] 				= "SpellCheck";
ZmOperation.IMAGE[ZmOperation.SYNC]		 				= "redo";
ZmOperation.IMAGE[ZmOperation.TAG_MENU]					= "Tag";
ZmOperation.IMAGE[ZmOperation.TODAY]				= "Date";
ZmOperation.IMAGE[ZmOperation.TODAY_GOTO]				= "Date";
ZmOperation.IMAGE[ZmOperation.UNDELETE]					= "MoveToFolder"; 		// XXX: need new icon?
ZmOperation.IMAGE[ZmOperation.VIEW]						= "SplitView";
ZmOperation.IMAGE[ZmOperation.VIEW_APPOINTMENT]			= "Appointment";
ZmOperation.IMAGE[ZmOperation.VIEW_APPT_INSTANCE]		= "Appointment";
ZmOperation.IMAGE[ZmOperation.VIEW_APPT_SERIES]			= "ApptRecur";
ZmOperation.IMAGE[ZmOperation.WEEK_VIEW]				= "WeekView";
ZmOperation.IMAGE[ZmOperation.WORK_WEEK_VIEW]			= "WorkWeekView";
ZmOperation.IMAGE[ZmOperation.ZIMLET]					= "ZimbraIcon";

// Icons (when disabled)
// !! PLEASE ADD IN ALPHA ORDER !!
ZmOperation.DIS_IMAGE = new Object();
ZmOperation.DIS_IMAGE[ZmOperation.ATTACHMENT]			= "AttachmentDis";
ZmOperation.DIS_IMAGE[ZmOperation.BROWSE]				= "SearchBuilderDis";
ZmOperation.DIS_IMAGE[ZmOperation.DAY_VIEW]				= "DayViewDis";
ZmOperation.DIS_IMAGE[ZmOperation.DELETE]				= "DeleteDis";
ZmOperation.DIS_IMAGE[ZmOperation.DELETE_MENU]			= "DeleteDis";
ZmOperation.DIS_IMAGE[ZmOperation.DETACH_COMPOSE] 		= "OpenInNewWindowDis";
ZmOperation.DIS_IMAGE[ZmOperation.EDIT] 				= "EditDis";
ZmOperation.DIS_IMAGE[ZmOperation.EDIT_FILTER_RULE] 	= "EditDis";
ZmOperation.DIS_IMAGE[ZmOperation.EDIT_PROPS]			= "PropertiesDis";
ZmOperation.DIS_IMAGE[ZmOperation.FORWARD]				= "ForwardDis";
ZmOperation.DIS_IMAGE[ZmOperation.FORWARD_ATT]			= "ForwardDis";
ZmOperation.DIS_IMAGE[ZmOperation.FORWARD_INLINE]		= "ForwardDis";
ZmOperation.DIS_IMAGE[ZmOperation.FORWARD_MENU]			= "ForwardDis";
ZmOperation.DIS_IMAGE[ZmOperation.IM]					= "ImStartChatDis";
ZmOperation.DIS_IMAGE[ZmOperation.MONTH_VIEW]			= "MonthViewDis";
ZmOperation.DIS_IMAGE[ZmOperation.MOVE]					= "MoveToFolderDis";
ZmOperation.DIS_IMAGE[ZmOperation.NEW_MESSAGE]			= "NewMessageDis";
ZmOperation.DIS_IMAGE[ZmOperation.NEW_TAG]				= "NewTagDis";
ZmOperation.DIS_IMAGE[ZmOperation.PAGE_BACK]			= "LeftArrowDis";
ZmOperation.DIS_IMAGE[ZmOperation.PAGE_DBL_BACK]		= "LeftDoubleArrowDis";
ZmOperation.DIS_IMAGE[ZmOperation.PAGE_DBL_FORW]		= "RightDoubleArrowDis";
ZmOperation.DIS_IMAGE[ZmOperation.PAGE_FORWARD]			= "RightArrowDis";
ZmOperation.DIS_IMAGE[ZmOperation.PRINT]				= "PrintDis";
ZmOperation.DIS_IMAGE[ZmOperation.PRINT_MENU]			= "PrintDis";
ZmOperation.DIS_IMAGE[ZmOperation.REPLY]				= "ReplyDis";
ZmOperation.DIS_IMAGE[ZmOperation.REPLY_ALL]			= "ReplyAllDis";
ZmOperation.DIS_IMAGE[ZmOperation.REPLY_MENU]			= "ReplyDis";
ZmOperation.DIS_IMAGE[ZmOperation.SAVE]					= "SaveDis";
ZmOperation.DIS_IMAGE[ZmOperation.SEARCH]				= "SearchDis";
ZmOperation.DIS_IMAGE[ZmOperation.SEND]					= "SendDis";
ZmOperation.DIS_IMAGE[ZmOperation.SHOW_ORIG]			= "MessageDis";
ZmOperation.DIS_IMAGE[ZmOperation.SPAM] 				= "SpamFolderDis";
ZmOperation.DIS_IMAGE[ZmOperation.SPELL_CHECK] 			= "SpellCheckDis";
ZmOperation.DIS_IMAGE[ZmOperation.TAG_MENU]				= "TagDis";
ZmOperation.DIS_IMAGE[ZmOperation.UNDELETE]				= "MoveToFolderDis"; 	// XXX: need new icon?
ZmOperation.DIS_IMAGE[ZmOperation.WEEK_VIEW]			= "WeekViewDis";
ZmOperation.DIS_IMAGE[ZmOperation.WORK_WEEK_VIEW]		= "WorkWeekViewDis";

ZmOperation.KEY_ID = "_opId";

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
	} else if (id == ZmOperation.SPACER) {
		parent.addSpacer();
	} else if (id == ZmOperation.FILLER) {
		parent.addFiller();
	} else {
		var label = ZmOperation._operationDesc[id].label;
		var image = ZmOperation._operationDesc[id].image;
		var disImage = ZmOperation._operationDesc[id].disImage;
		var enabled = ZmOperation._operationDesc[id].enabled;
		var toolTip = ZmOperation._operationDesc[id].toolTip;
		opHash[id] = parent.createOp(id, label, image, disImage, enabled, toolTip);
	}
	if (id == ZmOperation.NEW_MENU) {
		ZmOperation.addDeferredMenu(ZmOperation.addNewMenu, opHash[id]);
	} else if (id == ZmOperation.TAG_MENU) {
		ZmOperation.addDeferredMenu(ZmOperation.addTagMenu, opHash[id]);
	} else if (id == ZmOperation.COLOR_MENU) {
		ZmOperation.addDeferredMenu(ZmOperation.addColorMenu, opHash[id]);
	} else if (id == ZmOperation.IM_PRESENCE_MENU) {
		ZmOperation.addImPresenceMenu(parent, opHash);
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
	if (appCtxt.get(ZmSetting.USER_FOLDERS_ENABLED) || appCtxt.get(ZmSetting.TAGGING_ENABLED) || appCtxt.get(ZmSetting.CALENDAR_ENABLED)) {
		list.push(new ZmOperation_Descriptor(ZmOperation.SEP, Dwt.DEFAULT, Dwt.DEFAULT, Dwt.DEFAULT));
		if (appCtxt.get(ZmSetting.USER_FOLDERS_ENABLED))
			list.push(new ZmOperation_Descriptor(ZmOperation.NEW_FOLDER, ZmMsg.folder, Dwt.DEFAULT, Dwt.DEFAULT));
		if (appCtxt.get(ZmSetting.TAGGING_ENABLED))
			list.push(new ZmOperation_Descriptor(ZmOperation.NEW_TAG, ZmMsg.tag, Dwt.DEFAULT, Dwt.DEFAULT));
		if (appCtxt.get(ZmSetting.CALENDAR_ENABLED))
			list.push(new ZmOperation_Descriptor(ZmOperation.NEW_CALENDAR, ZmMsg.calendar, Dwt.DEFAULT, Dwt.DEFAULT));
	}
	var menu = new ZmActionMenu(parent, ZmOperation.NONE, list);
	parent.setMenu(menu);
	return menu;
}

/**
* Adds a "Tag" submenu for tagging items.
*
* @param parent		parent widget (a toolbar or action menu)
*/
ZmOperation.addTagMenu =
function(parent) {
	var tagMenu = new ZmTagMenu(parent, null);
	parent.setMenu(tagMenu);
	return tagMenu;
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
	var menu = new ZmActionMenu(parent, list, null);
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
	var menu = new ZmActionMenu(parent, list, null);
	parent.setMenu(menu);
	return menu;
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
	var menu = new ZmActionMenu(parent, list, null);
	parent.setMenu(menu);
	return menu;
};

ZmOperation.addImPresenceMenu =
function(parent, opHash) {
	var list = [ZmOperation.IM_PRESENCE_OFFLINE, ZmOperation.IM_PRESENCE_ONLINE, ZmOperation.IM_PRESENCE_CHAT,
                ZmOperation.IM_PRESENCE_DND, ZmOperation.IM_PRESENCE_AWAY, ZmOperation.IM_PRESENCE_XA,
                ZmOperation.IM_PRESENCE_INVISIBLE];
    var button = opHash[ZmOperation.IM_PRESENCE_MENU];
	var menu = new ZmPopupMenu(button, null, null);
	
	for (var i = 0; i < list.length; i++) {
		var op = list[i];
		var mi = menu.createMenuItem(op, ZmOperation.IMAGE[op], ZmMsg[ZmOperation.MSG_KEY[op]], null, true, DwtMenuItem.RADIO_STYLE);
		mi.setData(ZmOperation.MENUITEM_ID, op);
		mi.setData(ZmOperation.KEY_ID, op);		
		if (op == ZmOperation.IM_PRESENCE_OFFLINE) mi.setChecked(true, true);
	}
	button.setMenu(menu, false, DwtMenuItem.RADIO_STYLE);
	return menu;
};
