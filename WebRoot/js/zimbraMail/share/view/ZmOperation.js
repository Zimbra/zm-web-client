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
ZmOperation.NONE 					= -1;		// no operations or menu items
ZmOperation.SEP 					= -2;		// separator
ZmOperation.SPACER 					= -3;		// spacer (toolbar)
ZmOperation.FILLER 					= -4;		// filler (toolbar)

// suffix for disabled image
ZmOperation.DIS = "Dis";

var i = 1;
ZmOperation.SETUP = {};

ZmOperation.SETUP[ZmOperation.NONE]		= {};
ZmOperation.SETUP[ZmOperation.SEP]		= {};
ZmOperation.SETUP[ZmOperation.SPACER]	= {};
ZmOperation.SETUP[ZmOperation.FILLER]	= {};

// Alphabetical list of operations and their definitions
//
// Each definition has zero or more of the following properties:
//		text		label for the button or menu item
//		tooltip		tooltip text
//		image		icon for the button or menu item
//		disImage	disabled version of image; if not present, defaults
//					to image name plus "Dis"

ZmOperation.ADD_FILTER_RULE = i++;
ZmOperation.SETUP[ZmOperation.ADD_FILTER_RULE] = {
	text:		"newFilter",
	image:		"Plus"
};

ZmOperation.ADD_SIGNATURE = i++;
ZmOperation.SETUP[ZmOperation.ADD_SIGNATURE] = {
	text:		"addSignature"
};

ZmOperation.ATTACHMENT = i++;
ZmOperation.SETUP[ZmOperation.ATTACHMENT] = {
	text:		"addAttachment",
	tooltip:	"attachmentTooltip",
	image:		"Attachment"
};

ZmOperation.BROWSE = i++;
ZmOperation.SETUP[ZmOperation.BROWSE] = {
	text:		"advancedSearch",
	image:		"SearchBuilder"
};

ZmOperation.CALL = i++;
ZmOperation.SETUP[ZmOperation.CALL] = {
	image:		"Telephone"
};

ZmOperation.CAL_REFRESH = i++;
ZmOperation.SETUP[ZmOperation.CAL_REFRESH] = {
	text:		"refresh",
	tooltip:	"calRefreshTooltip",
	image:		"SendRecieve"			// sic
};

ZmOperation.CAL_VIEW_MENU = i++;
ZmOperation.SETUP[ZmOperation.CAL_VIEW_MENU] = {
	text:		"view",
	image:		"Appointment"
};

ZmOperation.CANCEL = i++;
ZmOperation.SETUP[ZmOperation.CANCEL] = {
	text:		"cancel",
	tooltip:	"cancelTooltip",
	image:		"Cancel"
};

ZmOperation.CHECK_ALL = i++;
ZmOperation.SETUP[ZmOperation.CHECK_ALL] = {
	text:		"checkAll",
	image:		"Check"
};

ZmOperation.CHECK_MAIL = i++;
ZmOperation.SETUP[ZmOperation.CHECK_MAIL] = {
	text:		"checkMail",
	tooltip:	"checkMailTooltip",
	image:		"SendRecieve"		// sic
};

ZmOperation.CLEAR_ALL = i++;
ZmOperation.SETUP[ZmOperation.CLEAR_ALL] = {
	text:		"clearAll",
	image:		"Cancel"
};

ZmOperation.CLOSE = i++;
ZmOperation.SETUP[ZmOperation.CLOSE] = {
	text:		"close",
	tooltip:	"closeTooltip",
	image:		"Close"
};

ZmOperation.COLOR_MENU = i++;
ZmOperation.SETUP[ZmOperation.COLOR_MENU] = {
	text:		"tagColor"
};

ZmOperation.COMPOSE_FORMAT = i++;
ZmOperation.SETUP[ZmOperation.COMPOSE_FORMAT] = {
	text:		"format",
	tooltip:	"formatTooltip",
	image:		"SwitchFormat"
};

ZmOperation.COMPOSE_OPTIONS = i++;
ZmOperation.SETUP[ZmOperation.COMPOSE_OPTIONS] = {
	text:		"options"
};

ZmOperation.CONTACT = i++;
ZmOperation.SETUP[ZmOperation.CONTACT] = {
};

ZmOperation.DAY_VIEW = i++;
ZmOperation.SETUP[ZmOperation.DAY_VIEW] = {
	text:		"viewDay",
	tooltip:	"viewDayTooltip",
	image:		"DayView"
};

ZmOperation.DELETE = i++;
ZmOperation.SETUP[ZmOperation.DELETE] = {
	text:		"del",
	tooltip:	"deleteTooltip",
	image:		"Delete"
};

ZmOperation.DELETE_CONV = i++;
ZmOperation.SETUP[ZmOperation.DELETE_CONV] = {
	text:		"delConv",
	image:		"DeleteConversation"
};

ZmOperation.DELETE_MENU = i++;
ZmOperation.SETUP[ZmOperation.DELETE_MENU] = {
	tooltip:	"deleteTooltip",
	image:		"Delete"
};

ZmOperation.DETACH = i++;
ZmOperation.SETUP[ZmOperation.DETACH] = {
	text:		"detach",
	tooltip:	"detachTT",
	image:		"OpenInNewWindow"
};

ZmOperation.DETACH_COMPOSE = i++;
ZmOperation.SETUP[ZmOperation.DETACH_COMPOSE] = {
	text:		"detach",
	tooltip:	"detachTooltip",
	image:		"OpenInNewWindow"
};

ZmOperation.DRAFT = i++;
ZmOperation.SETUP[ZmOperation.DRAFT] = {
};

ZmOperation.EDIT = i++;
ZmOperation.SETUP[ZmOperation.EDIT] = {
	text:		"edit",
	tooltip:	"editTooltip",
	image:		"Edit"
};

ZmOperation.EDIT_CONTACT = i++;
ZmOperation.SETUP[ZmOperation.EDIT_CONTACT] = {
	text:		"AB_EDIT_CONTACT",
	image:		"Edit"
};

ZmOperation.EDIT_FILTER_RULE = i++;
ZmOperation.SETUP[ZmOperation.EDIT_FILTER_RULE] = {
	text:		"filterEdit",
	image:		"Edit"
};

ZmOperation.EDIT_NOTEBOOK_CHROME = i++;
ZmOperation.SETUP[ZmOperation.EDIT_NOTEBOOK_CHROME] = {
	text:		"editNotebookChrome",
	image:		"Edit"
};

ZmOperation.EDIT_NOTEBOOK_INDEX = i++;
ZmOperation.SETUP[ZmOperation.EDIT_NOTEBOOK_INDEX] = {
	text:		"editNotebookIndex",
	image:		"Edit"
};

ZmOperation.EDIT_PROPS = i++;
ZmOperation.SETUP[ZmOperation.EDIT_PROPS] = {
	text:		"editProperties",
	tooltip:	"editPropertiesTooltip",
	image:		"Properties"
};

ZmOperation.EDIT_REPLY_ACCEPT = i++;
ZmOperation.SETUP[ZmOperation.EDIT_REPLY_ACCEPT] = {
	text:		"replyAccept",
	image:		"Check"
};

ZmOperation.EDIT_REPLY_CANCEL = i++;
ZmOperation.SETUP[ZmOperation.EDIT_REPLY_CANCEL] = {
};

ZmOperation.EDIT_REPLY_DECLINE = i++;
ZmOperation.SETUP[ZmOperation.EDIT_REPLY_DECLINE] = {
	text:		"replyDecline",
	image:		"Cancel"
};

ZmOperation.EDIT_REPLY_TENTATIVE = i++;
ZmOperation.SETUP[ZmOperation.EDIT_REPLY_TENTATIVE] = {
	text:		"replyTentative",
	image:		"QuestionMark"
};

ZmOperation.EXPAND_ALL = i++;
ZmOperation.SETUP[ZmOperation.EXPAND_ALL] = {
	text:		"expandAll",
	image:		"Plus"
};

ZmOperation.FORMAT_HTML = i++;
ZmOperation.SETUP[ZmOperation.FORMAT_HTML] = {
	text:		"formatAsHtml",
	image:		"HtmlDoc"
};

ZmOperation.FORMAT_HTML_SOURCE = i++;
ZmOperation.SETUP[ZmOperation.FORMAT_HTML_SOURCE] = {
	text:		"formatHtmlSource"
};

ZmOperation.FORMAT_MEDIA_WIKI = i++;
ZmOperation.SETUP[ZmOperation.FORMAT_MEDIA_WIKI] = {
	text:		"formatMediaWiki"
};

ZmOperation.FORMAT_RICH_TEXT = i++;
ZmOperation.SETUP[ZmOperation.FORMAT_RICH_TEXT] = {
	text:		"formatRichText"
};

ZmOperation.FORMAT_TEXT = i++;
ZmOperation.SETUP[ZmOperation.FORMAT_TEXT] = {
	text:		"formatAsText",
	image:		"GenericDoc"
};

ZmOperation.FORMAT_TWIKI = i++;
ZmOperation.SETUP[ZmOperation.FORMAT_TWIKI] = {
	text:		"formatTWiki"
};

ZmOperation.FORWARD = i++;
ZmOperation.SETUP[ZmOperation.FORWARD] = {
	text:		"forward",
	tooltip:	"forwardTooltip",
	image:		"Forward"
};

ZmOperation.FORWARD_ATT = i++;
ZmOperation.SETUP[ZmOperation.FORWARD_ATT] = {
	text:		"forwardAtt",
	tooltip:	"forwardAtt",
	image:		"Forward"
};

ZmOperation.FORWARD_INLINE = i++;
ZmOperation.SETUP[ZmOperation.FORWARD_INLINE] = {
	text:		"forwardInline",
	tooltip:	"forwardTooltip",
	image:		"Forward"
};

ZmOperation.FORWARD_MENU = i++;
ZmOperation.SETUP[ZmOperation.FORWARD_MENU] = {
	text:		"forward",
	tooltip:	"forwardTooltip",
	image:		"Forward"
};

ZmOperation.GO_TO_URL = i++;
ZmOperation.SETUP[ZmOperation.GO_TO_URL] = {
	image:		"URL"
};

ZmOperation.IM = i++;
ZmOperation.SETUP[ZmOperation.IM] = {
	text:		"newIM",
	image:		"ImStartChat"
};

ZmOperation.IM_NEW_CHAT = i++;
ZmOperation.SETUP[ZmOperation.IM_NEW_CHAT] = {
	text:		"imNewChat",
	image:		"ImFree2Chat"
};

ZmOperation.IM_NEW_GROUP_CHAT = i++;
ZmOperation.SETUP[ZmOperation.IM_NEW_GROUP_CHAT] = {
	text:		"imNewGroupChat",
	image:		"ImFree2Chat"
};

ZmOperation.IM_PRESENCE_AWAY = i++;
ZmOperation.SETUP[ZmOperation.IM_PRESENCE_AWAY] = {
	text:		"imStatusAway",
	image:		"ImAway"
};

ZmOperation.IM_PRESENCE_CHAT = i++;
ZmOperation.SETUP[ZmOperation.IM_PRESENCE_CHAT] = {
	text:		"imStatusChat",
	image:		"ImFree2Chat"
};

ZmOperation.IM_PRESENCE_DND = i++;
ZmOperation.SETUP[ZmOperation.IM_PRESENCE_DND] = {
	text:		"imStatusDND",
	image:		"ImDnd"
};

ZmOperation.IM_PRESENCE_INVISIBLE = i++;
ZmOperation.SETUP[ZmOperation.IM_PRESENCE_INVISIBLE] = {
	text:		"imStatusInvisible",
	image:		"ImInvisible"
};

ZmOperation.IM_PRESENCE_MENU = i++;
ZmOperation.SETUP[ZmOperation.IM_PRESENCE_MENU] = {
	text:		"imPresence"
};

ZmOperation.IM_PRESENCE_OFFLINE = i++;
ZmOperation.SETUP[ZmOperation.IM_PRESENCE_OFFLINE] = {
	text:		"imStatusOffline",
	image:		"RoundMinusDis"			// need new one
};

ZmOperation.IM_PRESENCE_ONLINE = i++;
ZmOperation.SETUP[ZmOperation.IM_PRESENCE_ONLINE] = {
	text:		"imStatusOnline",
	image:		"ImAvailable"
};

ZmOperation.IM_PRESENCE_XA = i++;
ZmOperation.SETUP[ZmOperation.IM_PRESENCE_XA] = {
	text:		"imStatusExtAway",
	image:		"ImExtendedAway"
};

ZmOperation.INC_ATTACHMENT = i++;
ZmOperation.SETUP[ZmOperation.INC_ATTACHMENT] = {
	text:		"includeMenuAttachment"
};

ZmOperation.INC_NONE = i++;
ZmOperation.SETUP[ZmOperation.INC_NONE] = {
	text:		"includeMenuNone"
};

ZmOperation.INC_NO_PREFIX = i++;
ZmOperation.SETUP[ZmOperation.INC_NO_PREFIX] = {
	text:		"includeMenuNoPrefix"
};

ZmOperation.INC_PREFIX = i++;
ZmOperation.SETUP[ZmOperation.INC_PREFIX] = {
	text:		"includeMenuPrefix"
};

ZmOperation.INC_SMART = i++;
ZmOperation.SETUP[ZmOperation.INC_SMART] = {
	text:		"includeMenuSmart"
};

ZmOperation.INVITE_REPLY_ACCEPT = i++;
ZmOperation.SETUP[ZmOperation.INVITE_REPLY_ACCEPT] = {
	text:		"editReply",
	image:		"Check"
};

ZmOperation.INVITE_REPLY_DECLINE = i++;
ZmOperation.SETUP[ZmOperation.INVITE_REPLY_DECLINE] = {
	text:		"editReply",
	image:		"Cancel"
};

ZmOperation.INVITE_REPLY_MENU = i++;
ZmOperation.SETUP[ZmOperation.INVITE_REPLY_MENU] = {
	text:		"editReply",
	image:		"Reply"
};

ZmOperation.INVITE_REPLY_TENTATIVE = i++;
ZmOperation.SETUP[ZmOperation.INVITE_REPLY_TENTATIVE] = {
	text:		"editReply",
	image:		"QuestionMark"
};

ZmOperation.MARK_ALL_READ = i++;
ZmOperation.SETUP[ZmOperation.MARK_ALL_READ] = {
	text:		"markAllRead",
	image:		"ReadMessage"
};

ZmOperation.MARK_READ = i++;
ZmOperation.SETUP[ZmOperation.MARK_READ] = {
	text:		"markAsRead",
	image:		"ReadMessage"
};

ZmOperation.MARK_UNREAD = i++;
ZmOperation.SETUP[ZmOperation.MARK_UNREAD] = {
	text:		"markAsUnread",
	image:		"UnreadMessage"
};

ZmOperation.MODIFY_SEARCH = i++;
ZmOperation.SETUP[ZmOperation.MODIFY_SEARCH] = {
	text:		"modifySearch",
	image:		"SearchFolder"
};

ZmOperation.MONTH_VIEW = i++;
ZmOperation.SETUP[ZmOperation.MONTH_VIEW] = {
	text:		"viewMonth",
	tooltip:	"viewMonthTooltip",
	image:		"MonthView"
};

ZmOperation.MOUNT_CALENDAR = i++;
ZmOperation.SETUP[ZmOperation.MOUNT_CALENDAR] = {
	text:		"mountCalendar",
	image:		"GroupSchedule"
};

ZmOperation.MOVE = i++;
ZmOperation.SETUP[ZmOperation.MOVE] = {
	text:		"move",
	tooltip:	"moveTooltip",
	image:		"MoveToFolder"
};

ZmOperation.MOVE_DOWN_FILTER_RULE = i++;
ZmOperation.SETUP[ZmOperation.MOVE_DOWN_FILTER_RULE] = {
	text:		"filterMoveDown",
	image:		"DownArrow"
};

ZmOperation.MOVE_UP_FILTER_RULE = i++;
ZmOperation.SETUP[ZmOperation.MOVE_UP_FILTER_RULE] = {
	text:		"filterMoveUp",
	image:		"UpArrow"
};

ZmOperation.NEW_ADDRBOOK = i++;
ZmOperation.SETUP[ZmOperation.NEW_ADDRBOOK] = {
	text:		"newAddrBook",
	tooltip:	"newAddrBookTooltip",
	image:		"NewContact"
};

ZmOperation.NEW_ALLDAY_APPT = i++;
ZmOperation.SETUP[ZmOperation.NEW_ALLDAY_APPT] = {
	text:		"newAllDayAppt",
	tooltip:	"newAllDayApptTooltip",
	image:		"NewAppointment"
};

ZmOperation.NEW_APPT = i++;
ZmOperation.SETUP[ZmOperation.NEW_APPT] = {
	text:		"newAppt",
	tooltip:	"newApptTooltip",
	image:		"NewAppointment"
};

ZmOperation.NEW_CALENDAR = i++;
ZmOperation.SETUP[ZmOperation.NEW_CALENDAR] = {
	text:		"newCalendar",
	image:		"NewAppointment"
};

ZmOperation.NEW_CONTACT = i++;
ZmOperation.SETUP[ZmOperation.NEW_CONTACT] = {
	text:		"newContact",
	tooltip:	"newContactTooltip",
	image:		"NewContact"
};

ZmOperation.NEW_FOLDER = i++;
ZmOperation.SETUP[ZmOperation.NEW_FOLDER] = {
	text:		"newFolder",
	tooltip:	"newFolderTooltip",
	image:		"NewFolder"
};

ZmOperation.NEW_MENU = i++;
ZmOperation.SETUP[ZmOperation.NEW_MENU] = {
	text:		"_new"
};

ZmOperation.NEW_MESSAGE = i++;
ZmOperation.SETUP[ZmOperation.NEW_MESSAGE] = {
	text:		"newEmail",
	tooltip:	"newMessageTooltip",
	image:		"NewMessage"
};

ZmOperation.NEW_PAGE = i++;
ZmOperation.SETUP[ZmOperation.NEW_PAGE] = {
	text:		"newPage",
	tooltip:	"createNewPage",
	image:		"NewPage"
};

ZmOperation.NEW_NOTEBOOK = i++;
ZmOperation.SETUP[ZmOperation.NEW_NOTEBOOK] = {
	text:		"newNotebook",
	image:		"NewNotebook"
};

ZmOperation.NEW_ROSTER_ITEM = i++;
ZmOperation.SETUP[ZmOperation.NEW_ROSTER_ITEM] = {
	text:		"newRosterItem",
	image:		"ImBuddy"
};

ZmOperation.NEW_TAG = i++;
ZmOperation.SETUP[ZmOperation.NEW_TAG] = {
	text:		"newTag",
	tooltip:	"newTagTooltip",
	image:		"NewTag"
};

ZmOperation.PAGE_BACK = i++;
ZmOperation.SETUP[ZmOperation.PAGE_BACK] = {
	image:		"LeftArrow"
};

ZmOperation.PAGE_DBL_BACK = i++;
ZmOperation.SETUP[ZmOperation.PAGE_DBL_BACK] = {
	image:		"LeftDoubleArrow"
};

ZmOperation.PAGE_DBL_FORW = i++;
ZmOperation.SETUP[ZmOperation.PAGE_DBL_FORW] = {
	image:		"RightDoubleArrow"
};

ZmOperation.PAGE_FORWARD = i++;
ZmOperation.SETUP[ZmOperation.PAGE_FORWARD] = {
	image:		"RightArrow"
};

ZmOperation.PRINT = i++;
ZmOperation.SETUP[ZmOperation.PRINT] = {
	text:		"print",
	tooltip:	"printTooltip",
	image:		"Print"
};

ZmOperation.PRINT_CONTACTLIST = i++;
ZmOperation.SETUP[ZmOperation.PRINT_CONTACTLIST] = {
	text:		"printContactListTooltip",
	image:		"Print" 				// XXX: new icon?
};

ZmOperation.PRINT_MENU = i++;
ZmOperation.SETUP[ZmOperation.PRINT_MENU] = {
	tooltip:	"printTooltip",
	image:		"Print"
};

ZmOperation.REFRESH = i++;
ZmOperation.SETUP[ZmOperation.REFRESH] = {
	text:		"refresh"
};

ZmOperation.REMOVE_FILTER_RULE = i++;
ZmOperation.SETUP[ZmOperation.REMOVE_FILTER_RULE] = {
	text:		"filterRemove",
	image:		"Delete"
};

ZmOperation.RENAME_FOLDER = i++;
ZmOperation.SETUP[ZmOperation.RENAME_FOLDER] = {
	text:		"renameFolder",
	image:		"Rename"
};

ZmOperation.RENAME_SEARCH = i++;
ZmOperation.SETUP[ZmOperation.RENAME_SEARCH] = {
	text:		"renameSearch",
	image:		"Rename"
};

ZmOperation.RENAME_TAG = i++;
ZmOperation.SETUP[ZmOperation.RENAME_TAG] = {
	text:		"renameTag",
	image:		"Rename"
};

ZmOperation.REPLY = i++;
ZmOperation.SETUP[ZmOperation.REPLY] = {
	text:		"reply",
	tooltip:	"replyTooltip",
	image:		"Reply"
};

ZmOperation.REPLY_ACCEPT = i++;
ZmOperation.SETUP[ZmOperation.REPLY_ACCEPT] = {
	text:		"replyAccept",
	image:		"Check"
};

ZmOperation.REPLY_ALL = i++;
ZmOperation.SETUP[ZmOperation.REPLY_ALL] = {
	text:		"replyAll",
	tooltip:	"replyAllTooltip",
	image:		"ReplyAll"
};

ZmOperation.REPLY_CANCEL = i++;
ZmOperation.SETUP[ZmOperation.REPLY_CANCEL] = {
};

ZmOperation.REPLY_DECLINE = i++;
ZmOperation.SETUP[ZmOperation.REPLY_DECLINE] = {
	text:		"replyDecline",
	image:		"Cancel"
};

ZmOperation.REPLY_MENU = i++;
ZmOperation.SETUP[ZmOperation.REPLY_MENU] = {
	text:		"reply",
	tooltip:	"replyTooltip",
	image:		"Reply"
};

ZmOperation.REPLY_NEW_TIME = i++;
ZmOperation.SETUP[ZmOperation.REPLY_NEW_TIME] = {
	text:		"replyNewTime",
	image:		"NewTime"
};

ZmOperation.REPLY_TENTATIVE = i++;
ZmOperation.SETUP[ZmOperation.REPLY_TENTATIVE] = {
	text:		"replyTentative",
	image:		"QuestionMark"
};

ZmOperation.SAVE = i++;
ZmOperation.SETUP[ZmOperation.SAVE] = {
	text:		"save",
	image:		"Save"
};

ZmOperation.SAVE_DRAFT = i++;
ZmOperation.SETUP[ZmOperation.SAVE_DRAFT] = {
	text:		"saveDraft",
	tooltip:	"saveDraftTooltip",
	image:		"DraftFolder"
};

ZmOperation.SCHEDULE_VIEW = i++;
ZmOperation.SETUP[ZmOperation.SCHEDULE_VIEW] = {
	text:		"viewSchedule",
	tooltip:	"viewScheduleTooltip",
	image:		"GroupSchedule"
};

ZmOperation.SEARCH = i++;
ZmOperation.SETUP[ZmOperation.SEARCH] = {
	text:		"search",
	image:		"Search"
};

ZmOperation.SEARCH_MAIL = i++;
ZmOperation.SETUP[ZmOperation.SEARCH_MAIL] = {
	text:		"searchMail",
	image:		"SearchMail"
};

ZmOperation.SEND = i++;
ZmOperation.SETUP[ZmOperation.SEND] = {
	text:		"send",
	tooltip:	"sendTooltip",
	image:		"Send"
};

ZmOperation.SHARE = i++;
ZmOperation.SETUP[ZmOperation.SHARE] = {
	text:		"share",
	tooltip:	"shareTooltip"
};

ZmOperation.SHARE_ACCEPT = i++;
ZmOperation.SETUP[ZmOperation.SHARE_ACCEPT] = {
	text:		"acceptShare",
	image:		"Check"
};

ZmOperation.SHARE_CALENDAR = i++;
ZmOperation.SETUP[ZmOperation.SHARE_CALENDAR] = {
	text:		"shareCalendar",
	image:		"CalendarFolder"
};

ZmOperation.SHARE_DECLINE = i++;
ZmOperation.SETUP[ZmOperation.SHARE_DECLINE] = {
	text:		"declineShare",
	image:		"Cancel"
};

ZmOperation.SHARE_NOTEBOOK = i++;
ZmOperation.SETUP[ZmOperation.SHARE_NOTEBOOK] = {
	text:		"shareNotebook",
	image:		"Notebook"
};

ZmOperation.SHOW_BCC = i++;
ZmOperation.SETUP[ZmOperation.SHOW_BCC] = {
	text:		"showBcc"
};

ZmOperation.SHOW_CC = i++;
ZmOperation.SETUP[ZmOperation.SHOW_CC] = {
	text:		"showCc"
};

ZmOperation.SHOW_ORIG = i++;
ZmOperation.SETUP[ZmOperation.SHOW_ORIG] = {
	text:		"showOrig",
	image:		"Message"
};

ZmOperation.SPAM = i++;
ZmOperation.SETUP[ZmOperation.SPAM] = {
	text:		"junk",
	tooltip:	"junkTooltip",
	image:		"SpamFolder"
};

ZmOperation.SPELL_CHECK = i++;
ZmOperation.SETUP[ZmOperation.SPELL_CHECK] = {
	text:		"spellCheck",
	image:		"SpellCheck"
};

ZmOperation.SYNC = i++;
ZmOperation.SETUP[ZmOperation.SYNC] = {
	text:		"reload",
	image:		"redo"
};

ZmOperation.TAG = i++;
ZmOperation.SETUP[ZmOperation.TAG] = {
};

ZmOperation.TAG_MENU = i++;
ZmOperation.SETUP[ZmOperation.TAG_MENU] = {
	text:		"tag",
	tooltip:	"tagTooltip",
	image:		"Tag"
};

ZmOperation.TEXT = i++;
ZmOperation.SETUP[ZmOperation.TEXT] = {
};

ZmOperation.TODAY = i++;
ZmOperation.SETUP[ZmOperation.TODAY] = {
	tooltip:	"todayTooltip",
	image:		"Date"
};

ZmOperation.TODAY_GOTO = i++;
ZmOperation.SETUP[ZmOperation.TODAY_GOTO] = {
	text:		"todayGoto",
	image:		"Date"
};

ZmOperation.UNDELETE = i++;
ZmOperation.SETUP[ZmOperation.UNDELETE] = {
	text:		"undelete",
	tooltip:	"undelete",
	image:		"MoveToFolder" 		// XXX: need new icon?
};

ZmOperation.VIEW = i++;
ZmOperation.SETUP[ZmOperation.VIEW] = {
	text:		"view",
	image:		"SplitView"
};

ZmOperation.VIEW_APPOINTMENT = i++;
ZmOperation.SETUP[ZmOperation.VIEW_APPOINTMENT] = {
	text:		"viewAppointment",
	image:		"Appointment"
};

ZmOperation.VIEW_APPT_INSTANCE = i++;
ZmOperation.SETUP[ZmOperation.VIEW_APPT_INSTANCE] = {
	text:		"apptInstance",
	image:		"Appointment"
};

ZmOperation.VIEW_APPT_SERIES = i++;
ZmOperation.SETUP[ZmOperation.VIEW_APPT_SERIES] = {
	text:		"apptSeries",
	image:		"ApptRecur"
};

ZmOperation.WEEK_VIEW = i++;
ZmOperation.SETUP[ZmOperation.WEEK_VIEW] = {
	text:		"viewWeek",
	tooltip:	"viewWeekTooltip",
	image:		"WeekView"
};

ZmOperation.WORK_WEEK_VIEW = i++;
ZmOperation.SETUP[ZmOperation.WORK_WEEK_VIEW] = {
	text:		"viewWorkWeek",
	tooltip:	"viewWorkWeekTooltip",
	image:		"WorkWeekView"
};

ZmOperation.ZIMLET = i++;
ZmOperation.SETUP[ZmOperation.ZIMLET] = {
	image:		"ZimbraIcon"
};

delete i;

ZmOperation.KEY_ID = "_opId";
ZmOperation.MENUITEM_ID = "_menuItemId";

function ZmOperation_Descriptor(id, label, image, disImage, enabled, toolTip) {
	this.id = id;
	this.label = label ? label : ZmMsg[ZmOperation.SETUP[id].text];
	this.image = image ? image : ZmOperation.SETUP[id].image;
	this.disImage = disImage ? disImage : ZmOperation.SETUP[id].disImage ?
						ZmOperation.SETUP[id].disImage : ZmOperation.SETUP[id].image + ZmOperation.DIS;
	this.enabled = (enabled !== false);
	this.toolTip = toolTip ? toolTip : ZmMsg[ZmOperation.SETUP[id].tooltip];
	this.toolTip = toolTip ? toolTip : this.label;
};

// Static hash of operation IDs and descriptors
ZmOperation._operationDesc = {};

ZmOperation._createOperationDesc =
function(id) {
	return new ZmOperation_Descriptor(id, ZmMsg[ZmOperation.SETUP[id].text],
				ZmOperation.SETUP[id].image, ZmOperation.SETUP[id].disImage, true, ZmMsg[ZmOperation.SETUP[id].tooltip]);
};

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
				extra.label = (extra.label && extra.label != Dwt.DEFAULT) ? extra.label : ZmMsg[ZmOperation.SETUP[id].text];
				extra.image = (extra.image && extra.image != Dwt.DEFAULT) ? extra.image : ZmOperation.SETUP[id].image;
				extra.disImage = (extra.disImage && extra.disImage != Dwt.DEFAULT) ? extra.disImage : ZmOperation.SETUP[id].disImage ?
									ZmOperation.SETUP[id].disImage : ZmOperation.SETUP[id].image + ZmOperation.DIS;
				extra.toolTip = (extra.toolTip && extra.toolTip != Dwt.DEFAULT) ? extra.toolTip : ZmMsg[ZmOperation.SETUP[id].tooltip];
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
};

ZmOperation.addOperation =
function(parent, id, opHash) {
	if (!ZmOperation._operationDesc[id]) {
		ZmOperation._operationDesc[id] = ZmOperation._createOperationDesc(id);
	}
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

	op.setText(text ? text : ZmMsg[ZmOperation.SETUP[newOp].text]);
	op.setImage(image ? image : ZmOperation.SETUP[newOp].image);
	op.setDisabledImage(disImage ? disImage : ZmOperation.SETUP[newOp].image + ZmOperation.DIS);
};

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
	var notebookEnabled = appCtxt.get(ZmSetting.NOTEBOOK_ENABLED);
	
	var list = new Array();
	list.push(new ZmOperation_Descriptor(ZmOperation.NEW_MESSAGE, ZmMsg.message, Dwt.DEFAULT, Dwt.DEFAULT));
	if (contactsEnabled)
		list.push(new ZmOperation_Descriptor(ZmOperation.NEW_CONTACT, ZmMsg.contact, Dwt.DEFAULT, Dwt.DEFAULT));
	if (calendarEnabled)
		list.push(new ZmOperation_Descriptor(ZmOperation.NEW_APPT, ZmMsg.appointment, Dwt.DEFAULT, Dwt.DEFAULT));
	if (notebookEnabled)
		list.push(new ZmOperation_Descriptor(ZmOperation.NEW_PAGE, ZmMsg.page, Dwt.DEFAULT, Dwt.DEFAULT));

	if (foldersEnabled || taggingEnabled || calendarEnabled || notebookEnabled) {
		list.push(new ZmOperation_Descriptor(ZmOperation.SEP, Dwt.DEFAULT, Dwt.DEFAULT, Dwt.DEFAULT));
	}

	if (foldersEnabled)
		list.push(new ZmOperation_Descriptor(ZmOperation.NEW_FOLDER, ZmMsg.folder, Dwt.DEFAULT, Dwt.DEFAULT));
	if (taggingEnabled)
		list.push(new ZmOperation_Descriptor(ZmOperation.NEW_TAG, ZmMsg.tag, Dwt.DEFAULT, Dwt.DEFAULT));
	if (calendarEnabled)
		list.push(new ZmOperation_Descriptor(ZmOperation.NEW_CALENDAR, ZmMsg.calendar, Dwt.DEFAULT, Dwt.DEFAULT));
	if (notebookEnabled)
		list.push(new ZmOperation_Descriptor(ZmOperation.NEW_NOTEBOOK, ZmMsg.notebook, Dwt.DEFAULT, Dwt.DEFAULT));

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

	for (var i = 0; i < list.length; i++) {
		var op = list[i];
		var mi = menu.createMenuItem(op, ZmOperation.SETUP[op].image, ZmMsg[ZmOperation.SETUP[op].text], null, true, DwtMenuItem.RADIO_STYLE);
		mi.setData(ZmOperation.MENUITEM_ID, op);
		mi.setData(ZmOperation.KEY_ID, op);		
		if (op == ZmOperation.IM_PRESENCE_OFFLINE) mi.setChecked(true, true);
	}
	button.setMenu(menu, false, DwtMenuItem.RADIO_STYLE);
	return menu;
};
