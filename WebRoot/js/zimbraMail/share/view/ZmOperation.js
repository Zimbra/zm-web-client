/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2004, 2005, 2006 Zimbra, Inc.
 * 
 * The contents of this file are subject to the Yahoo! Public License
 * Version 1.0 ("License"); you may not use this file except in
 * compliance with the License.  You may obtain a copy of the License at
 * http://www.zimbra.com/license.
 * 
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied.
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
	textKey:	"newFilter",
	image:		"Plus"
};

ZmOperation.ADD_SIGNATURE = i++;
ZmOperation.SETUP[ZmOperation.ADD_SIGNATURE] = {
	textKey:	"addSignature"
};

ZmOperation.ATTACHMENT = i++;
ZmOperation.SETUP[ZmOperation.ATTACHMENT] = {
	textKey:	"addAttachment",
	tooltipKey:	"attachmentTooltip",
	image:		"Attachment"
};

ZmOperation.BROWSE = i++;
ZmOperation.SETUP[ZmOperation.BROWSE] = {
	textKey:	"advancedSearch",
	image:		"SearchBuilder"
};

ZmOperation.CALL = i++;
ZmOperation.SETUP[ZmOperation.CALL] = {
	image:		"Telephone"
};

ZmOperation.CAL_REFRESH = i++;
ZmOperation.SETUP[ZmOperation.CAL_REFRESH] = {
	textKey:	"refresh",
	tooltipKey:	"calRefreshTooltip",
	image:		"Refresh"
};

ZmOperation.CAL_VIEW_MENU = i++;
ZmOperation.SETUP[ZmOperation.CAL_VIEW_MENU] = {
	textKey:	"view",
	image:		"Appointment"
};

ZmOperation.CANCEL = i++;
ZmOperation.SETUP[ZmOperation.CANCEL] = {
	textKey:	"cancel",
	tooltipKey:	"cancelTooltip",
	image:		"Cancel"
};

ZmOperation.CHECK_ALL = i++;
ZmOperation.SETUP[ZmOperation.CHECK_ALL] = {
	textKey:	"checkAll",
	image:		"Check"
};

ZmOperation.CHECK_MAIL = i++;
ZmOperation.SETUP[ZmOperation.CHECK_MAIL] = {
	textKey:	"checkMail",
	tooltipKey:	"checkMailTooltip",
	image:		"Refresh"
};

ZmOperation.CLEAR_ALL = i++;
ZmOperation.SETUP[ZmOperation.CLEAR_ALL] = {
	textKey:	"clearAll",
	image:		"Cancel"
};

ZmOperation.CLOSE = i++;
ZmOperation.SETUP[ZmOperation.CLOSE] = {
	textKey:	"close",
	tooltipKey:	"closeTooltip",
	image:		"Close"
};

ZmOperation.COLOR_MENU = i++;
ZmOperation.SETUP[ZmOperation.COLOR_MENU] = {
	textKey:	"tagColor"
};

ZmOperation.COMPOSE_FORMAT = i++;
ZmOperation.SETUP[ZmOperation.COMPOSE_FORMAT] = {
	textKey:	"format",
	tooltipKey:	"formatTooltip",
	image:		"SwitchFormat"
};

ZmOperation.COMPOSE_OPTIONS = i++;
ZmOperation.SETUP[ZmOperation.COMPOSE_OPTIONS] = {
	textKey:	"options",
	image:		"Preferences"
};

ZmOperation.CONTACT = i++;
ZmOperation.SETUP[ZmOperation.CONTACT] = {
};

ZmOperation.DAY_VIEW = i++;
ZmOperation.SETUP[ZmOperation.DAY_VIEW] = {
	textKey:	"viewDay",
	tooltipKey:	"viewDayTooltip",
	image:		"DayView"
};

ZmOperation.DELETE = i++;
ZmOperation.SETUP[ZmOperation.DELETE] = {
	textKey:	"del",
	tooltipKey:	"deleteTooltip",
	image:		"Delete"
};

ZmOperation.DELETE_CONV = i++;
ZmOperation.SETUP[ZmOperation.DELETE_CONV] = {
	textKey:	"delConv",
	image:		"DeleteConversation"
};

ZmOperation.DELETE_MENU = i++;
ZmOperation.SETUP[ZmOperation.DELETE_MENU] = {
	tooltipKey:	"deleteTooltip",
	image:		"Delete"
};

ZmOperation.DETACH = i++;
ZmOperation.SETUP[ZmOperation.DETACH] = {
	textKey:	"detach",
	tooltipKey:	"detachTT",
	image:		"OpenInNewWindow"
};

ZmOperation.DETACH_COMPOSE = i++;
ZmOperation.SETUP[ZmOperation.DETACH_COMPOSE] = {
	tooltipKey:	"detachTooltip",
	image:		"OpenInNewWindow"
};

ZmOperation.DRAFT = i++;
ZmOperation.SETUP[ZmOperation.DRAFT] = {
};

ZmOperation.EDIT = i++;
ZmOperation.SETUP[ZmOperation.EDIT] = {
	textKey:	"edit",
	tooltipKey:	"editTooltip",
	image:		"Edit"
};

ZmOperation.EDIT_CONTACT = i++;
ZmOperation.SETUP[ZmOperation.EDIT_CONTACT] = {
	textKey:	"AB_EDIT_CONTACT",
	image:		"Edit"
};

ZmOperation.EDIT_FILTER_RULE = i++;
ZmOperation.SETUP[ZmOperation.EDIT_FILTER_RULE] = {
	textKey:	"filterEdit",
	image:		"Edit"
};

ZmOperation.EDIT_NOTEBOOK_CHROME = i++;
ZmOperation.SETUP[ZmOperation.EDIT_NOTEBOOK_CHROME] = {
	textKey:	"editNotebookChrome",
	image:		"Edit"
};

ZmOperation.EDIT_NOTEBOOK_INDEX = i++;
ZmOperation.SETUP[ZmOperation.EDIT_NOTEBOOK_INDEX] = {
	textKey:	"editNotebookIndex",
	image:		"Edit"
};

ZmOperation.EDIT_NOTEBOOK_STYLES = i++;
ZmOperation.SETUP[ZmOperation.EDIT_NOTEBOOK_STYLES] = {
	textKey:	"editNotebookStyles",
	image:		"Edit"
};

ZmOperation.EDIT_NOTEBOOK_HEADER = i++;
ZmOperation.SETUP[ZmOperation.EDIT_NOTEBOOK_HEADER] = {
	textKey:	"editNotebookHeader",
	image:		"Edit"
};

ZmOperation.EDIT_NOTEBOOK_FOOTER = i++;
ZmOperation.SETUP[ZmOperation.EDIT_NOTEBOOK_FOOTER] = {
	textKey:	"editNotebookFooter",
	image:		"Edit"
};

ZmOperation.EDIT_NOTEBOOK_SIDE_BAR = i++;
ZmOperation.SETUP[ZmOperation.EDIT_NOTEBOOK_SIDE_BAR] = {
	textKey:	"editNotebookSideBar",
	image:		"Edit"
};


ZmOperation.EDIT_PROPS = i++;
ZmOperation.SETUP[ZmOperation.EDIT_PROPS] = {
	textKey:	"editProperties",
	tooltipKey:	"editPropertiesTooltip",
	image:		"Properties"
};

ZmOperation.EDIT_REPLY_ACCEPT = i++;
ZmOperation.SETUP[ZmOperation.EDIT_REPLY_ACCEPT] = {
	textKey:	"replyAccept",
	image:		"Check"
};

ZmOperation.EDIT_REPLY_CANCEL = i++;
ZmOperation.SETUP[ZmOperation.EDIT_REPLY_CANCEL] = {
};

ZmOperation.EDIT_REPLY_DECLINE = i++;
ZmOperation.SETUP[ZmOperation.EDIT_REPLY_DECLINE] = {
	textKey:	"replyDecline",
	image:		"Cancel"
};

ZmOperation.EDIT_REPLY_TENTATIVE = i++;
ZmOperation.SETUP[ZmOperation.EDIT_REPLY_TENTATIVE] = {
	textKey:	"replyTentative",
	image:		"QuestionMark"
};

ZmOperation.EXPAND_ALL = i++;
ZmOperation.SETUP[ZmOperation.EXPAND_ALL] = {
	textKey:	"expandAll",
	image:		"Plus"
};

ZmOperation.FORMAT_HTML = i++;
ZmOperation.SETUP[ZmOperation.FORMAT_HTML] = {
	textKey:	"formatAsHtml",
	image:		"HtmlDoc"
};

ZmOperation.FORMAT_HTML_SOURCE = i++;
ZmOperation.SETUP[ZmOperation.FORMAT_HTML_SOURCE] = {
	textKey:	"formatHtmlSource"
};

ZmOperation.FORMAT_MEDIA_WIKI = i++;
ZmOperation.SETUP[ZmOperation.FORMAT_MEDIA_WIKI] = {
	textKey:	"formatMediaWiki"
};

ZmOperation.FORMAT_RICH_TEXT = i++;
ZmOperation.SETUP[ZmOperation.FORMAT_RICH_TEXT] = {
	textKey:	"formatRichText"
};

ZmOperation.FORMAT_TEXT = i++;
ZmOperation.SETUP[ZmOperation.FORMAT_TEXT] = {
	textKey:	"formatAsText",
	image:		"GenericDoc"
};

ZmOperation.FORMAT_TWIKI = i++;
ZmOperation.SETUP[ZmOperation.FORMAT_TWIKI] = {
	textKey:	"formatTWiki"
};

ZmOperation.FORWARD = i++;
ZmOperation.SETUP[ZmOperation.FORWARD] = {
	textKey:	"forward",
	tooltipKey:	"forwardTooltip",
	image:		"Forward"
};

ZmOperation.FORWARD_ATT = i++;
ZmOperation.SETUP[ZmOperation.FORWARD_ATT] = {
	textKey:	"forwardAtt",
	tooltipKey:	"forwardAtt",
	image:		"Forward"
};

ZmOperation.FORWARD_INLINE = i++;
ZmOperation.SETUP[ZmOperation.FORWARD_INLINE] = {
	textKey:	"forwardInline",
	tooltipKey:	"forwardTooltip",
	image:		"Forward"
};

ZmOperation.FORWARD_MENU = i++;
ZmOperation.SETUP[ZmOperation.FORWARD_MENU] = {
	textKey:	"forward",
	tooltipKey:	"forwardTooltip",
	image:		"Forward"
};

ZmOperation.GO_TO_URL = i++;
ZmOperation.SETUP[ZmOperation.GO_TO_URL] = {
	image:		"URL"
};

ZmOperation.IM = i++;
ZmOperation.SETUP[ZmOperation.IM] = {
	textKey:	"newIM",
	image:		"ImStartChat"
};

ZmOperation.IM_NEW_CHAT = i++;
ZmOperation.SETUP[ZmOperation.IM_NEW_CHAT] = {
	textKey:	"imNewChat",
	image:		"ImFree2Chat"
};

ZmOperation.IM_NEW_GROUP_CHAT = i++;
ZmOperation.SETUP[ZmOperation.IM_NEW_GROUP_CHAT] = {
	textKey:	"imNewGroupChat",
	image:		"ImFree2Chat"
};

ZmOperation.IM_PRESENCE_AWAY = i++;
ZmOperation.SETUP[ZmOperation.IM_PRESENCE_AWAY] = {
	textKey:	"imStatusAway",
	image:		"ImAway"
};

ZmOperation.IM_PRESENCE_CHAT = i++;
ZmOperation.SETUP[ZmOperation.IM_PRESENCE_CHAT] = {
	textKey:	"imStatusChat",
	image:		"ImFree2Chat"
};

ZmOperation.IM_PRESENCE_DND = i++;
ZmOperation.SETUP[ZmOperation.IM_PRESENCE_DND] = {
	textKey:	"imStatusDND",
	image:		"ImDnd"
};

ZmOperation.IM_PRESENCE_INVISIBLE = i++;
ZmOperation.SETUP[ZmOperation.IM_PRESENCE_INVISIBLE] = {
	textKey:	"imStatusInvisible",
	image:		"ImInvisible"
};

ZmOperation.IM_PRESENCE_MENU = i++;
ZmOperation.SETUP[ZmOperation.IM_PRESENCE_MENU] = {
	textKey:	"imPresence"
};

ZmOperation.IM_PRESENCE_OFFLINE = i++;
ZmOperation.SETUP[ZmOperation.IM_PRESENCE_OFFLINE] = {
	textKey:	"imStatusOffline",
	image:		"RoundMinusDis"			// need new one
};

ZmOperation.IM_PRESENCE_ONLINE = i++;
ZmOperation.SETUP[ZmOperation.IM_PRESENCE_ONLINE] = {
	textKey:	"imStatusOnline",
	image:		"ImAvailable"
};

ZmOperation.IM_PRESENCE_XA = i++;
ZmOperation.SETUP[ZmOperation.IM_PRESENCE_XA] = {
	textKey:	"imStatusExtAway",
	image:		"ImExtendedAway"
};

ZmOperation.INC_ATTACHMENT = i++;
ZmOperation.SETUP[ZmOperation.INC_ATTACHMENT] = {
	textKey:	"includeMenuAttachment"
};

ZmOperation.INC_NONE = i++;
ZmOperation.SETUP[ZmOperation.INC_NONE] = {
	textKey:	"includeMenuNone"
};

ZmOperation.INC_NO_PREFIX = i++;
ZmOperation.SETUP[ZmOperation.INC_NO_PREFIX] = {
	textKey:	"includeMenuNoPrefix"
};

ZmOperation.INC_PREFIX = i++;
ZmOperation.SETUP[ZmOperation.INC_PREFIX] = {
	textKey:	"includeMenuPrefix"
};

ZmOperation.INC_SMART = i++;
ZmOperation.SETUP[ZmOperation.INC_SMART] = {
	textKey:	"includeMenuSmart"
};

ZmOperation.INVITE_REPLY_ACCEPT = i++;
ZmOperation.SETUP[ZmOperation.INVITE_REPLY_ACCEPT] = {
	textKey:	"editReply",
	image:		"Check"
};

ZmOperation.INVITE_REPLY_DECLINE = i++;
ZmOperation.SETUP[ZmOperation.INVITE_REPLY_DECLINE] = {
	textKey:	"editReply",
	image:		"Cancel"
};

ZmOperation.INVITE_REPLY_MENU = i++;
ZmOperation.SETUP[ZmOperation.INVITE_REPLY_MENU] = {
	textKey:	"editReply",
	image:		"Reply"
};

ZmOperation.INVITE_REPLY_TENTATIVE = i++;
ZmOperation.SETUP[ZmOperation.INVITE_REPLY_TENTATIVE] = {
	textKey:	"editReply",
	image:		"QuestionMark"
};

ZmOperation.MARK_ALL_READ = i++;
ZmOperation.SETUP[ZmOperation.MARK_ALL_READ] = {
	textKey:	"markAllRead",
	image:		"ReadMessage"
};

ZmOperation.MARK_READ = i++;
ZmOperation.SETUP[ZmOperation.MARK_READ] = {
	textKey:	"markAsRead",
	image:		"ReadMessage"
};

ZmOperation.MARK_UNREAD = i++;
ZmOperation.SETUP[ZmOperation.MARK_UNREAD] = {
	textKey:	"markAsUnread",
	image:		"UnreadMessage"
};

ZmOperation.MODIFY_SEARCH = i++;
ZmOperation.SETUP[ZmOperation.MODIFY_SEARCH] = {
	textKey:	"modifySearch",
	image:		"SearchFolder"
};

ZmOperation.MONTH_VIEW = i++;
ZmOperation.SETUP[ZmOperation.MONTH_VIEW] = {
	textKey:	"viewMonth",
	tooltipKey:	"viewMonthTooltip",
	image:		"MonthView"
};

ZmOperation.MOUNT_ADDRBOOK = i++;
ZmOperation.SETUP[ZmOperation.MOUNT_ADDRBOOK] = {
	textKey:	"mountAddrBook",
	image:		"ContactsFolder"
};

ZmOperation.MOUNT_CALENDAR = i++;
ZmOperation.SETUP[ZmOperation.MOUNT_CALENDAR] = {
	textKey:	"mountCalendar",
	image:		"GroupSchedule"
};

ZmOperation.MOUNT_FOLDER = i++;
ZmOperation.SETUP[ZmOperation.MOUNT_FOLDER] = {
	textKey:	"mountFolder",
	image:		"Folder"
};

ZmOperation.MOUNT_NOTEBOOK = i++;
ZmOperation.SETUP[ZmOperation.MOUNT_NOTEBOOK] = {
	textKey:	"mountNotebook",
	image:		"Notebook"
};

ZmOperation.MOVE = i++;
ZmOperation.SETUP[ZmOperation.MOVE] = {
	textKey:	"move",
	tooltipKey:	"moveTooltip",
	image:		"MoveToFolder"
};

ZmOperation.MOVE_DOWN_FILTER_RULE = i++;
ZmOperation.SETUP[ZmOperation.MOVE_DOWN_FILTER_RULE] = {
	textKey:	"filterMoveDown",
	image:		"DownArrow"
};

ZmOperation.MOVE_UP_FILTER_RULE = i++;
ZmOperation.SETUP[ZmOperation.MOVE_UP_FILTER_RULE] = {
	textKey:	"filterMoveUp",
	image:		"UpArrow"
};

ZmOperation.NEW_ADDRBOOK = i++;
ZmOperation.SETUP[ZmOperation.NEW_ADDRBOOK] = {
	textKey:	"newAddrBook",
	tooltipKey:	"newAddrBookTooltip",
	image:		"NewContact"
};

ZmOperation.NEW_ALLDAY_APPT = i++;
ZmOperation.SETUP[ZmOperation.NEW_ALLDAY_APPT] = {
	textKey:	"newAllDayAppt",
	tooltipKey:	"newAllDayApptTooltip",
	image:		"NewAppointment"
};

ZmOperation.NEW_APPT = i++;
ZmOperation.SETUP[ZmOperation.NEW_APPT] = {
	textKey:	"newAppt",
	tooltipKey:	"newApptTooltip",
	image:		"NewAppointment"
};

ZmOperation.NEW_CALENDAR = i++;
ZmOperation.SETUP[ZmOperation.NEW_CALENDAR] = {
	textKey:	"newCalendar",
	image:		"NewAppointment"
};

ZmOperation.NEW_CONTACT = i++;
ZmOperation.SETUP[ZmOperation.NEW_CONTACT] = {
	textKey:	"newContact",
	tooltipKey:	"newContactTooltip",
	image:		"NewContact"
};

ZmOperation.NEW_FOLDER = i++;
ZmOperation.SETUP[ZmOperation.NEW_FOLDER] = {
	textKey:	"newFolder",
	tooltipKey:	"newFolderTooltip",
	image:		"NewFolder"
};

ZmOperation.NEW_GROUP = i++;
ZmOperation.SETUP[ZmOperation.NEW_GROUP] = {
	textKey:	"newGroup",
	tooltipKey:	"newGroupTooltip",
	image:		"NewGroup"
};

ZmOperation.NEW_MENU = i++;
ZmOperation.SETUP[ZmOperation.NEW_MENU] = {
	textKey:	"_new"
};

ZmOperation.NEW_MESSAGE = i++;
ZmOperation.SETUP[ZmOperation.NEW_MESSAGE] = {
	textKey:	"newEmail",
	tooltipKey:	"newMessageTooltip",
	image:		"NewMessage"
};

ZmOperation.NEW_PAGE = i++;
ZmOperation.SETUP[ZmOperation.NEW_PAGE] = {
	textKey:	"newPage",
	tooltipKey:	"createNewPage",
	image:		"NewPage"
};

ZmOperation.NEW_NOTEBOOK = i++;
ZmOperation.SETUP[ZmOperation.NEW_NOTEBOOK] = {
	textKey:	"newNotebook",
	image:		"NewNotebook"
};

ZmOperation.NEW_ROSTER_ITEM = i++;
ZmOperation.SETUP[ZmOperation.NEW_ROSTER_ITEM] = {
	textKey:	"newRosterItem",
	image:		"ImBuddy"
};

ZmOperation.NEW_TAG = i++;
ZmOperation.SETUP[ZmOperation.NEW_TAG] = {
	textKey:	"newTag",
	tooltipKey:	"newTagTooltip",
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
	textKey:	"print",
	tooltipKey:	"printTooltip",
	image:		"Print"
};

ZmOperation.PRINT_CONTACTLIST = i++;
ZmOperation.SETUP[ZmOperation.PRINT_CONTACTLIST] = {
	textKey:	"printAddrBook",
	image:		"Print" 				// XXX: new icon?
};

ZmOperation.PRINT_MENU = i++;
ZmOperation.SETUP[ZmOperation.PRINT_MENU] = {
	tooltipKey:	"printTooltip",
	image:		"Print"
};

ZmOperation.REFRESH = i++;
ZmOperation.SETUP[ZmOperation.REFRESH] = {
	textKey:	"refresh",
	tooltipKey:	"refreshTooltip",
	img:		"Refresh"
};

ZmOperation.REMOVE_FILTER_RULE = i++;
ZmOperation.SETUP[ZmOperation.REMOVE_FILTER_RULE] = {
	textKey:	"filterRemove",
	image:		"Delete"
};

ZmOperation.RENAME_FOLDER = i++;
ZmOperation.SETUP[ZmOperation.RENAME_FOLDER] = {
	textKey:	"renameFolder",
	image:		"Rename"
};

ZmOperation.RENAME_SEARCH = i++;
ZmOperation.SETUP[ZmOperation.RENAME_SEARCH] = {
	textKey:	"renameSearch",
	image:		"Rename"
};

ZmOperation.RENAME_TAG = i++;
ZmOperation.SETUP[ZmOperation.RENAME_TAG] = {
	textKey:	"renameTag",
	image:		"Rename"
};

ZmOperation.REPLY = i++;
ZmOperation.SETUP[ZmOperation.REPLY] = {
	textKey:	"reply",
	tooltipKey:	"replyTooltip",
	image:		"Reply"
};

ZmOperation.REPLY_ACCEPT = i++;
ZmOperation.SETUP[ZmOperation.REPLY_ACCEPT] = {
	textKey:	"replyAccept",
	image:		"Check"
};

ZmOperation.REPLY_ALL = i++;
ZmOperation.SETUP[ZmOperation.REPLY_ALL] = {
	textKey:	"replyAll",
	tooltipKey:	"replyAllTooltip",
	image:		"ReplyAll"
};

ZmOperation.REPLY_CANCEL = i++;
ZmOperation.SETUP[ZmOperation.REPLY_CANCEL] = {
};

ZmOperation.REPLY_DECLINE = i++;
ZmOperation.SETUP[ZmOperation.REPLY_DECLINE] = {
	textKey:	"replyDecline",
	image:		"Cancel"
};

ZmOperation.REPLY_MENU = i++;
ZmOperation.SETUP[ZmOperation.REPLY_MENU] = {
	textKey:	"reply",
	tooltipKey:	"replyTooltip",
	image:		"Reply"
};

ZmOperation.REPLY_MODIFY = i++;
ZmOperation.SETUP[ZmOperation.REPLY_MODIFY] = {};

ZmOperation.REPLY_NEW_TIME = i++;
ZmOperation.SETUP[ZmOperation.REPLY_NEW_TIME] = {
	textKey:	"replyNewTime",
	image:		"NewTime"
};

ZmOperation.REPLY_TENTATIVE = i++;
ZmOperation.SETUP[ZmOperation.REPLY_TENTATIVE] = {
	textKey:	"replyTentative",
	image:		"QuestionMark"
};

ZmOperation.SAVE = i++;
ZmOperation.SETUP[ZmOperation.SAVE] = {
	textKey:	"save",
	image:		"Save"
};

ZmOperation.SAVE_DRAFT = i++;
ZmOperation.SETUP[ZmOperation.SAVE_DRAFT] = {
	textKey:	"saveDraft",
	tooltipKey:	"saveDraftTooltip",
	image:		"DraftFolder"
};

ZmOperation.SCHEDULE_VIEW = i++;
ZmOperation.SETUP[ZmOperation.SCHEDULE_VIEW] = {
	textKey:	"viewSchedule",
	tooltipKey:	"viewScheduleTooltip",
	image:		"GroupSchedule"
};

ZmOperation.SEARCH = i++;
ZmOperation.SETUP[ZmOperation.SEARCH] = {
	textKey:	"search",
	image:		"Search"
};

ZmOperation.SEARCH_MAIL = i++;
ZmOperation.SETUP[ZmOperation.SEARCH_MAIL] = {
	textKey:	"searchMail",
	image:		"SearchMail"
};

ZmOperation.SEND = i++;
ZmOperation.SETUP[ZmOperation.SEND] = {
	textKey:	"send",
	tooltipKey:	"sendTooltip",
	image:		"Send"
};

ZmOperation.SEND_PAGE = i++;
ZmOperation.SETUP[ZmOperation.SEND_PAGE] = {
	textKey:	"send",
	tooltipKey:	"sendPageTT",
	image:		"Send"
};

ZmOperation.SHARE = i++;
ZmOperation.SETUP[ZmOperation.SHARE] = {
	textKey:	"share",
	tooltipKey:	"shareTooltip"
};

ZmOperation.SHARE_ACCEPT = i++;
ZmOperation.SETUP[ZmOperation.SHARE_ACCEPT] = {
	textKey:	"acceptShare",
	image:		"Check"
};

ZmOperation.SHARE_ADDRBOOK = i++;
ZmOperation.SETUP[ZmOperation.SHARE_ADDRBOOK] = {
	textKey:	"shareAddrBook",
	image:		"SharedContactsFolder"
};

ZmOperation.SHARE_CALENDAR = i++;
ZmOperation.SETUP[ZmOperation.SHARE_CALENDAR] = {
	textKey:	"shareCalendar",
	image:		"CalendarFolder"
};

ZmOperation.SHARE_DECLINE = i++;
ZmOperation.SETUP[ZmOperation.SHARE_DECLINE] = {
	textKey:	"declineShare",
	image:		"Cancel"
};

ZmOperation.SHARE_FOLDER = i++;
ZmOperation.SETUP[ZmOperation.SHARE_FOLDER] = {
	textKey:	"shareFolder",
	image:		"Folder"
};

ZmOperation.SHARE_NOTEBOOK = i++;
ZmOperation.SETUP[ZmOperation.SHARE_NOTEBOOK] = {
	textKey:	"shareNotebook",
	image:		"Notebook"
};

ZmOperation.SHOW_ALL_MENU = i++;
ZmOperation.SETUP[ZmOperation.SHOW_ALL_MENU] = {
	textKey:	"showAllItemTypes",
	image:		"Globe"
};

ZmOperation.SHOW_ALL_ITEM_TYPES = i++;
ZmOperation.SETUP[ZmOperation.SHOW_ALL_ITEM_TYPES] = {
	textKey:	"showAllItemTypes",
	image:		"Globe"
};

ZmOperation.SHOW_BCC = i++;
ZmOperation.SETUP[ZmOperation.SHOW_BCC] = {
	textKey:	"showBcc"
};

ZmOperation.SHOW_ONLY_CONTACTS = i++;
ZmOperation.SETUP[ZmOperation.SHOW_ONLY_CONTACTS] = {
	textKey:	"showOnlyContacts",
	image:		"Contact"
};

ZmOperation.SHOW_ONLY_MAIL = i++;
ZmOperation.SETUP[ZmOperation.SHOW_ONLY_MAIL] = {
	textKey:	"showOnlyMail",
	image:		"Conversation"
};

ZmOperation.SHOW_ORIG = i++;
ZmOperation.SETUP[ZmOperation.SHOW_ORIG] = {
	textKey:	"showOrig",
	image:		"Message"
};

ZmOperation.SPAM = i++;
ZmOperation.SETUP[ZmOperation.SPAM] = {
	textKey:	"junk",
	tooltipKey:	"junkTooltip",
	image:		"SpamFolder"
};

ZmOperation.SPELL_CHECK = i++;
ZmOperation.SETUP[ZmOperation.SPELL_CHECK] = {
	textKey:	"spellCheck",
	image:		"SpellCheck"
};

ZmOperation.SYNC = i++;
ZmOperation.SETUP[ZmOperation.SYNC] = {
	textKey:	"reload",
	image:		"Refresh"
};

ZmOperation.TAG = i++;
ZmOperation.SETUP[ZmOperation.TAG] = {
};

ZmOperation.TAG_MENU = i++;
ZmOperation.SETUP[ZmOperation.TAG_MENU] = {
	textKey:	"tag",
	tooltipKey:	"tagTooltip",
	image:		"Tag"
};

ZmOperation.TEXT = i++;
ZmOperation.SETUP[ZmOperation.TEXT] = {
};

ZmOperation.TODAY = i++;
ZmOperation.SETUP[ZmOperation.TODAY] = {
	tooltipKey:	"todayTooltip",
	image:		"Date"
};

ZmOperation.TODAY_GOTO = i++;
ZmOperation.SETUP[ZmOperation.TODAY_GOTO] = {
	textKey:	"todayGoto",
	image:		"Date"
};

ZmOperation.UNDELETE = i++;
ZmOperation.SETUP[ZmOperation.UNDELETE] = {
	textKey:	"undelete",
	tooltipKey:	"undelete",
	image:		"MoveToFolder" 		// XXX: need new icon?
};

ZmOperation.VIEW = i++;
ZmOperation.SETUP[ZmOperation.VIEW] = {
	textKey:	"view",
	image:		"SplitView"
};

ZmOperation.VIEW_APPOINTMENT = i++;
ZmOperation.SETUP[ZmOperation.VIEW_APPOINTMENT] = {
	textKey:	"viewAppointment",
	image:		"Appointment"
};

ZmOperation.VIEW_APPT_INSTANCE = i++;
ZmOperation.SETUP[ZmOperation.VIEW_APPT_INSTANCE] = {
	textKey:	"apptInstance",
	image:		"Appointment"
};

ZmOperation.VIEW_APPT_SERIES = i++;
ZmOperation.SETUP[ZmOperation.VIEW_APPT_SERIES] = {
	textKey:	"apptSeries",
	image:		"ApptRecur"
};

ZmOperation.WEEK_VIEW = i++;
ZmOperation.SETUP[ZmOperation.WEEK_VIEW] = {
	textKey:	"viewWeek",
	tooltipKey:	"viewWeekTooltip",
	image:		"WeekView"
};

ZmOperation.WORK_WEEK_VIEW = i++;
ZmOperation.SETUP[ZmOperation.WORK_WEEK_VIEW] = {
	textKey:	"viewWorkWeek",
	tooltipKey:	"viewWorkWeekTooltip",
	image:		"WorkWeekView"
};

ZmOperation.ZIMLET = i++;
ZmOperation.SETUP[ZmOperation.ZIMLET] = {
	image:		"ZimbraIcon"
};

delete i;

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
* Extra operations can be used to override properties of existing operations, or to define new
* operations.</p>
*
* @param parent					[DwtComposite]		the containing widget (toolbar or menu)
* @param standardOperations		[array]*			a list of operation IDs
* @param extraOperations		[array]*			a list of custom operations
*
* @returns						a hash of operations by ID
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
	var operationList = [];
	if (standardOperations || extraOperations) {
		if (standardOperations && standardOperations.length) {
			for (var i = 0; i < standardOperations.length; i++) {
				var id = standardOperations[i];
				operationList.push(id);
				ZmOperation.defineOperation(id);
			}
		}
		if (extraOperations && extraOperations.length) {
			for (var i = 0; i < extraOperations.length; i++) {
				operationList.push(extraOperations[i].id);
			}
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
	var id = (baseId && !op) ? baseId : (op && op.id) ? op.id : Dwt.getNextId();
	op = op ? op : {};
	var textKey = ZmOperation.getProp(baseId, "textKey", op);
	var text = textKey ? ZmMsg[textKey] : null;
	var tooltipKey = ZmOperation.getProp(baseId, "tooltipKey", op);
	var tooltip = tooltipKey ? ZmMsg[tooltipKey] : null;
	var image = ZmOperation.getProp(baseId, "image", op);
	var disImage = ZmOperation.getProp(baseId, "disImage", op);
	var enabled = (op.enabled !== false);

	var opDesc = {id: id, text: text, image: image, disImage: disImage, enabled: enabled, tooltip: tooltip};
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
	} else if (id == ZmOperation.COLOR_MENU) {
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
	
	var list = [];
	list.push(ZmOperation.defineOperation(ZmOperation.NEW_MESSAGE, {id: ZmOperation.NEW_MESSAGE, textKey: "message"}));
	if (contactsEnabled) {
		list.push(ZmOperation.defineOperation(ZmOperation.NEW_CONTACT, {id: ZmOperation.NEW_CONTACT, textKey: "contact"}));
		list.push(ZmOperation.defineOperation(ZmOperation.NEW_GROUP, {id: ZmOperation.NEW_GROUP, textKey: "group"}));
	}
	if (calendarEnabled) {
		list.push(ZmOperation.defineOperation(ZmOperation.NEW_APPT, {id: ZmOperation.NEW_APPT, textKey: "appointment"}));
	}
	if (notebookEnabled) {
		list.push(ZmOperation.defineOperation(ZmOperation.NEW_PAGE, {id: ZmOperation.NEW_PAGE, textKey: "page"}));
	}

	if (foldersEnabled || taggingEnabled || calendarEnabled || notebookEnabled) {
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
