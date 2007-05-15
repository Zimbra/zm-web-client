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
 * Portions created by Zimbra are Copyright (C) 2006 Zimbra, Inc.
 * All Rights Reserved.
 * 
 * Contributor(s):
 * 
 * ***** END LICENSE BLOCK *****
 */

/**
 * Creates a key map for the ZCS application.
 * @constructor
 * @class
 * This class maps keys to actions for the ZCS application. There is a global key map
 * with bindings that apply to any key not handled by the current controller; these
 * global bindings apply across applications (mail, contacts, etc). Key bindings that
 * are context-dependent are tied to a particular controller. If that controller has
 * control, then those bindings will be used.
 * <p>
 * Bindings are passed in via the ZmKeys object, which is populated from a properties
 * file. The identifiers used in the properties file must match those used here.
 * 
 * @author Ross Dargahi
 * @author Conrad Damon
 * 
 * @param appCtxt		[ZmAppCtxt]		the app context
 */
function ZmKeyMap(appCtxt) {
	
	this._appCtxt = appCtxt;
	ZmKeyMap._setPreconditions();
	DwtKeyMap.call(this);
	this._load(this._map, ZmKeys, ZmKeyMap.MAP_NAME);

	this._map["Global"]["Alt+Shift+D,0"] = ZmKeyMap.DBG_NONE;
	this._map["Global"]["Alt+Shift+D,1"] = ZmKeyMap.DBG_1;
	this._map["Global"]["Alt+Shift+D,2"] = ZmKeyMap.DBG_2;
	this._map["Global"]["Alt+Shift+D,3"] = ZmKeyMap.DBG_3;
	this._map["Global"]["Alt+Shift+D,T"] = ZmKeyMap.DBG_TIMING;
};

ZmKeyMap.prototype = new DwtKeyMap(true);
ZmKeyMap.prototype.constructor = ZmKeyMap;

// translations for map names used in properties file
ZmKeyMap.MAP_NAME = {};
ZmKeyMap.MAP_NAME["global"]				= "Global";
ZmKeyMap.MAP_NAME["compose"]			= "ZmComposeController";
ZmKeyMap.MAP_NAME["mail"]				= "ZmMailListController";
ZmKeyMap.MAP_NAME["conversationList"]	= "ZmConvListController";
ZmKeyMap.MAP_NAME["conversation"]		= "ZmConvController";
ZmKeyMap.MAP_NAME["message"]			= "ZmMsgController";
ZmKeyMap.MAP_NAME["contacts"]			= "ZmContactListController";
ZmKeyMap.MAP_NAME["editContact"]		= "ZmContactController";
ZmKeyMap.MAP_NAME["calendar"]			= "ZmCalViewController";
ZmKeyMap.MAP_NAME["editAppointment"]	= "ZmApptComposeController";
ZmKeyMap.MAP_NAME["options"]			= "ZmPrefController";
ZmKeyMap.MAP_NAME["mixed"]				= "ZmMixedController";
ZmKeyMap.MAP_NAME["notebook"]			= "ZmNotebookPageController";
ZmKeyMap.MAP_NAME["tasks"]				= "ZmTaskListController";
ZmKeyMap.MAP_NAME["editTask"]			= "ZmTaskController";
ZmKeyMap.MAP_NAME["tabView"]			= "DwtTabView";
ZmKeyMap.MAP_NAME["voicemail"]			= "ZmVoicemailListController";
ZmKeyMap.MAP_NAME["call"]				= "ZmCallListController";

// Action codes
ZmKeyMap.ADDRESS_PICKER		= "AddressPicker";
ZmKeyMap.ALL_DAY			= "AllDay";
ZmKeyMap.ASSISTANT			= "Assistant";
ZmKeyMap.ATTACHMENT			= "Attachment";
ZmKeyMap.CAL_DAY_VIEW		= "DayView";
ZmKeyMap.CAL_MONTH_VIEW		= "MonthView";
ZmKeyMap.CAL_SCHEDULE_VIEW	= "ScheduleView";
ZmKeyMap.CAL_WEEK_VIEW		= "WeekView";
ZmKeyMap.CAL_WORK_WEEK_VIEW	= "WorkWeekView";
ZmKeyMap.CANCEL				= "Cancel";
ZmKeyMap.DBG_NONE			= "DebugNone";
ZmKeyMap.DBG_1				= "DebugLevel1";
ZmKeyMap.DBG_2				= "DebugLevel2";
ZmKeyMap.DBG_3				= "DebugLevel3";
ZmKeyMap.DBG_TIMING			= "ToggleDebugTiming";
ZmKeyMap.DEL				= "Delete";
ZmKeyMap.EDIT				= "Edit";
ZmKeyMap.EXPAND				= "Expand";
ZmKeyMap.FLAG				= "Flag";
ZmKeyMap.FOCUS_CONTENT_PANE	= "FocusContentPane";
ZmKeyMap.FOCUS_SEARCH_BOX	= "FocusSearchBox";
ZmKeyMap.FORWARD			= "Forward";
ZmKeyMap.FORWARD_ATT		= "ForwardAsAttachment";
ZmKeyMap.FORWARD_INLINE		= "ForwardInline";
ZmKeyMap.GOTO_CALENDAR		= "GoToCalendar";
ZmKeyMap.GOTO_CONTACTS		= "GoToContacts";
ZmKeyMap.GOTO_DRAFTS		= "GoToDrafts";
ZmKeyMap.GOTO_FOLDER		= "GoToFolder";		// takes NNN
ZmKeyMap.GOTO_IM			= "GoToIm";
ZmKeyMap.GOTO_INBOX			= "GoToInbox";
ZmKeyMap.GOTO_MAIL			= "GoToMail";
ZmKeyMap.GOTO_NOTEBOOK		= "GoToNotebook";
ZmKeyMap.GOTO_OPTIONS		= "GoToOptions";
ZmKeyMap.GOTO_VOICE			= "GoToVoice";
ZmKeyMap.GOTO_SENT			= "GoToSent";
ZmKeyMap.GOTO_TAG			= "GoToTag";		// takes NNN
ZmKeyMap.GOTO_TASKS			= "GoToTasks";
ZmKeyMap.GOTO_TRASH			= "GoToTrash";
ZmKeyMap.HTML_FORMAT		= "HtmlFormat";
ZmKeyMap.LOGOFF				= "LogOff";
ZmKeyMap.MARK_COMPLETE		= "MarkComplete";
ZmKeyMap.MARK_HEARD			= "MarkHeard";
ZmKeyMap.MARK_READ			= "MarkRead";
ZmKeyMap.MARK_UNCOMPLETE	= "MarkUncomplete";
ZmKeyMap.MARK_UNHEARD		= "MarkUnheard";
ZmKeyMap.MARK_UNREAD		= "MarkUnread";
ZmKeyMap.MOVE_TO_FOLDER		= "MoveToFolder";	// takes NNN
ZmKeyMap.MOVE_TO_INBOX		= "MoveToInbox";
ZmKeyMap.MOVE_TO_JUNK		= "MoveToJunk";
ZmKeyMap.MOVE_TO_TRASH		= "MoveToTrash";
ZmKeyMap.NEW				= "New";
ZmKeyMap.NEW_APPT			= "NewAppointment";
ZmKeyMap.NEW_CALENDAR		= "NewCalendar";
ZmKeyMap.NEW_CONTACT		= "NewContact";
ZmKeyMap.NEW_FOLDER			= "NewFolder";
ZmKeyMap.NEW_MESSAGE		= "NewMessage";
ZmKeyMap.NEW_MESSAGE_WIN	= "NewMessageWindow";
ZmKeyMap.NEW_NOTEBOOK		= "NewNotebook";
ZmKeyMap.NEW_PAGE			= "NewPage";
ZmKeyMap.NEW_TAG			= "NewTag";
ZmKeyMap.NEW_TASK			= "NewTask";
ZmKeyMap.NEW_WINDOW			= "NewWindow";
ZmKeyMap.NEXT_CONV			= "NextConversation";
ZmKeyMap.NEXT_PAGE			= "NextPage";
ZmKeyMap.NEXT_UNREAD		= "NextUnread";
ZmKeyMap.PLAY				= "Play";
ZmKeyMap.PLAY_ALL			= "PlayAll";
ZmKeyMap.PREV_CONV			= "PreviousConversation";
ZmKeyMap.PREV_PAGE			= "PreviousPage";
ZmKeyMap.PREV_UNREAD		= "PreviousUnread";
ZmKeyMap.PRINT				= "Print";
ZmKeyMap.PRINT_ALL			= "PrintAll";
ZmKeyMap.QUICK_ADD			= "QuickAdd";
ZmKeyMap.READING_PANE		= "ReadingPane";
ZmKeyMap.REFRESH			= "Refresh";
ZmKeyMap.REPLY				= "Reply";
ZmKeyMap.REPLY_ALL			= "ReplyAll";
ZmKeyMap.SAVE				= "Save";
ZmKeyMap.SAVED_SEARCH		= "SavedSearch";	// takes NNN
ZmKeyMap.SEND				= "Send";
ZmKeyMap.SHOW_FRAGMENT		= "ShowFragment";
ZmKeyMap.SPAM				= "Spam";
ZmKeyMap.SPELLCHECK			= "Spellcheck";
ZmKeyMap.TAG				= "Tag";			// takes NNN
ZmKeyMap.TODAY				= "Today";
ZmKeyMap.UNTAG				= "Untag";
ZmKeyMap.VIEW_BY_CONV		= "ViewByConversation";
ZmKeyMap.VIEW_BY_MSG		= "ViewByMessage";

// shifted chars
ZmKeyMap.SHIFT = {};
ZmKeyMap.SHIFT["`"] = "~";
ZmKeyMap.SHIFT["1"] = "!";
ZmKeyMap.SHIFT["2"] = "@";
ZmKeyMap.SHIFT["3"] = "#";
ZmKeyMap.SHIFT["4"] = "$";
ZmKeyMap.SHIFT["5"] = "%";
ZmKeyMap.SHIFT["6"] = "^";
ZmKeyMap.SHIFT["7"] = "&";
ZmKeyMap.SHIFT["8"] = "*";
ZmKeyMap.SHIFT["9"] = "(";
ZmKeyMap.SHIFT["0"] = ")";
ZmKeyMap.SHIFT["-"] = "_";
ZmKeyMap.SHIFT["="] = "+";
ZmKeyMap.SHIFT["["] = "{";
ZmKeyMap.SHIFT["]"] = "}";
ZmKeyMap.SHIFT[";"] = ":";
ZmKeyMap.SHIFT["'"] = "\"";
ZmKeyMap.SHIFT["."] = ">";
ZmKeyMap.SHIFT["/"] = "?";
ZmKeyMap.SHIFT[DwtKeyMap.COMMA]		= "<";
ZmKeyMap.SHIFT[DwtKeyMap.SEMICOLON]	= ":";
ZmKeyMap.SHIFT[DwtKeyMap.BACKSLASH] = "|";

// HTML entities (used to display keys)
ZmKeyMap.ENTITY = {};
ZmKeyMap.ENTITY[DwtKeyMap.ARROW_LEFT]	= "&larr;"
ZmKeyMap.ENTITY[DwtKeyMap.ARROW_RIGHT]	= "&rarr;"
ZmKeyMap.ENTITY[DwtKeyMap.ARROW_UP]		= "&uarr;"
ZmKeyMap.ENTITY[DwtKeyMap.ARROW_DOWN]	= "&darr;"
ZmKeyMap.ENTITY['"'] = "&quot;"
ZmKeyMap.ENTITY['&'] = "&amp;"
ZmKeyMap.ENTITY['<'] = "&lt;"
ZmKeyMap.ENTITY['>'] = "&gt;"
ZmKeyMap.ENTITY[DwtKeyMap.COMMA]		= ",";
ZmKeyMap.ENTITY[DwtKeyMap.SEMICOLON]	= ";";
ZmKeyMap.ENTITY[DwtKeyMap.BACKSLASH] 	= "\\";

// preconditions for maps
ZmKeyMap.MAP_PRECONDITION = {};

// preconditions for specific shortcuts
ZmKeyMap.ACTION_PRECONDITION = {};

ZmKeyMap._setPreconditions =
function() {
	ZmKeyMap.MAP_PRECONDITION["ZmComposeController"]		= ZmSetting.MAIL_ENABLED;
	ZmKeyMap.MAP_PRECONDITION["ZmMailListController"]		= ZmSetting.MAIL_ENABLED;
	ZmKeyMap.MAP_PRECONDITION["ZmConvController"]			= ZmSetting.MAIL_ENABLED;
	ZmKeyMap.MAP_PRECONDITION["ZmMsgController"]			= ZmSetting.MAIL_ENABLED;
	ZmKeyMap.MAP_PRECONDITION["ZmContactListController"]	= ZmSetting.CONTACTS_ENABLED;
	ZmKeyMap.MAP_PRECONDITION["ZmContactController"]		= ZmSetting.CONTACTS_ENABLED;
	ZmKeyMap.MAP_PRECONDITION["ZmCalViewController"]		= ZmSetting.CALENDAR_ENABLED;
	ZmKeyMap.MAP_PRECONDITION["ZmApptComposeController"]	= ZmSetting.CALENDAR_ENABLED;
	ZmKeyMap.MAP_PRECONDITION["ZmPrefController"]			= ZmSetting.OPTIONS_ENABLED;
	ZmKeyMap.MAP_PRECONDITION["ZmNotebookPageController"]	= ZmSetting.NOTEBOOK_ENABLED;
	ZmKeyMap.MAP_PRECONDITION["ZmTaskListController"]		= ZmSetting.TASKS_ENABLED;
	ZmKeyMap.MAP_PRECONDITION["ZmTaskController"]			= ZmSetting.TASKS_ENABLED;
	
	ZmKeyMap.ACTION_PRECONDITION["Global"] = {};
	ZmKeyMap.ACTION_PRECONDITION["Global"][ZmKeyMap.GOTO_CALENDAR]		= ZmSetting.CALENDAR_ENABLED;
	ZmKeyMap.ACTION_PRECONDITION["Global"][ZmKeyMap.NEW_APPT]			= ZmSetting.CALENDAR_ENABLED;
	ZmKeyMap.ACTION_PRECONDITION["Global"][ZmKeyMap.NEW_CALENDAR]		= ZmSetting.CALENDAR_ENABLED;
	ZmKeyMap.ACTION_PRECONDITION["Global"][ZmKeyMap.GOTO_CONTACTS]		= ZmSetting.CONTACTS_ENABLED;
	ZmKeyMap.ACTION_PRECONDITION["Global"][ZmKeyMap.NEW_CONTACT]		= ZmSetting.CONTACTS_ENABLED;
	ZmKeyMap.ACTION_PRECONDITION["Global"][ZmKeyMap.GOTO_MAIL]			= ZmSetting.MAIL_ENABLED;
	ZmKeyMap.ACTION_PRECONDITION["Global"][ZmKeyMap.NEW_MESSAGE]		= ZmSetting.MAIL_ENABLED;
	ZmKeyMap.ACTION_PRECONDITION["Global"][ZmKeyMap.NEW_MESSAGE_WIN]	= ZmSetting.MAIL_ENABLED;
	ZmKeyMap.ACTION_PRECONDITION["Global"][ZmKeyMap.GOTO_OPTIONS]		= ZmSetting.OPTIONS_ENABLED;
	ZmKeyMap.ACTION_PRECONDITION["Global"][ZmKeyMap.GOTO_NOTEBOOK]		= ZmSetting.NOTEBOOK_ENABLED;
	ZmKeyMap.ACTION_PRECONDITION["Global"][ZmKeyMap.NEW_NOTEBOOK]		= ZmSetting.NOTEBOOK_ENABLED;
	ZmKeyMap.ACTION_PRECONDITION["Global"][ZmKeyMap.NEW_PAGE]			= ZmSetting.NOTEBOOK_ENABLED;
	ZmKeyMap.ACTION_PRECONDITION["Global"][ZmKeyMap.GOTO_IM]			= ZmSetting.IM_ENABLED;
	ZmKeyMap.ACTION_PRECONDITION["Global"][ZmKeyMap.GOTO_TASK]			= ZmSetting.TASKS_ENABLED;
	ZmKeyMap.ACTION_PRECONDITION["Global"][ZmKeyMap.NEW_TASK]			= ZmSetting.TASKS_ENABLED;
	ZmKeyMap.ACTION_PRECONDITION["Global"][ZmKeyMap.GOTO_TAG]			= ZmSetting.TAGGING_ENABLED;
	ZmKeyMap.ACTION_PRECONDITION["Global"][ZmKeyMap.NEW_TAG]			= ZmSetting.TAGGING_ENABLED;
	ZmKeyMap.ACTION_PRECONDITION["Global"][ZmKeyMap.TAG]				= ZmSetting.TAGGING_ENABLED;
	ZmKeyMap.ACTION_PRECONDITION["Global"][ZmKeyMap.UNTAG]				= ZmSetting.TAGGING_ENABLED;
	ZmKeyMap.ACTION_PRECONDITION["Global"][ZmKeyMap.SAVED_SEARCH]		= ZmSetting.SAVED_SEARCHES_ENABLED;
	ZmKeyMap.ACTION_PRECONDITION["Global"][ZmKeyMap.GOTO_VOICE]			= ZmSetting.VOICE_ENABLED;
	ZmKeyMap.ACTION_PRECONDITION["ZmComposeController"] = {};
	ZmKeyMap.ACTION_PRECONDITION["ZmComposeController"][ZmKeyMap.SAVE]				= ZmSetting.SAVE_DRAFT_ENABLED;
	ZmKeyMap.ACTION_PRECONDITION["ZmComposeController"][ZmKeyMap.HTML_FORMAT]		= ZmSetting.HTML_COMPOSE_ENABLED;
	ZmKeyMap.ACTION_PRECONDITION["ZmComposeController"][ZmKeyMap.NEW_WINDOW]		= ZmSetting.NEW_WINDOW_COMPOSE;
	ZmKeyMap.ACTION_PRECONDITION["ZmComposeController"][ZmKeyMap.ADDRESS_PICKER]	= ZmSetting.CONTACTS_ENABLED;
	ZmKeyMap.ACTION_PRECONDITION["ZmApptComposeController"] = {};
	ZmKeyMap.ACTION_PRECONDITION["ZmApptComposeController"][ZmKeyMap.HTML_FORMAT]	= ZmSetting.HTML_COMPOSE_ENABLED;
};

/**
 * Returns true if this map is valid. A map may have a precondition,
 * which is either a setting that must be true, or a function that returns
 * true.
 *
 * @param mapName	[string]	name of map
 */
ZmKeyMap.prototype._checkMap =
function(mapName) {
	var mapPre = ZmKeyMap.MAP_PRECONDITION[mapName];
	if (!mapPre) { return true; }
	if (typeof mapPre == "string" || typeof mapPre == "number") {
		return this._appCtxt.get(mapPre)
	} else if (typeof mapPre == "function") {
		return mapPre();
	}
	return true;
};

/**
 * Returns true if this action is valid. A map or an action may have a precondition,
 * which is either a setting that must be true, or a function that returns
 * true.
 *
 * @param mapName	[string]	name of map
 * @param action	[string]	action to check
 */
ZmKeyMap.prototype._checkAction =
function(mapName, action) {
	if (!this._checkMap(mapName)) { return false; }
	var mapPre = ZmKeyMap.ACTION_PRECONDITION[mapName];
	if (!mapPre) { return true; }
	var pre = mapPre[action];
	if (!pre) { return true; }
	if (typeof pre == "string" || typeof pre == "number") {
		return this._appCtxt.get(pre);
	} else if (typeof pre == "function") {
		return pre();
	}
	return true;
};

/**
 * Creates a shortcut
 * @cnstructor
 * @class
 * This class represents a keyboard shortcut that can be saved with a user's
 * preferences. The saved preference takes the form:
 * 
 *     [mapNameA].[actionA].[argA]=[keySequenceA]|[mapNameB].[actionB].[argB]=[keySequenceB]...
 * 
 * For example:
 * 
 *     mail.MoveToFolder4.538=M,4
 * 
 * @author Conrad Damon
 */
function ZmShortcut(mapName, keySequence, action, arg, baseAction, num) {
	this.mapName = mapName;
	this.keySequence = keySequence;
	this.action = action;
	this.arg = arg;
	this.num = num;
	this.baseAction = baseAction;
}

ZmShortcut.parse =
function(str) {
	var p = str.split("=");
	var p1 = p[0].split(".");
	var action = p1[1];
	var m = action.match(/([a-zA-Z]+)(\d+)$/);
	var num, baseAction;
	if (m && m.length) {
		baseAction = m[1];
		num = m[2];
	}

	return new ZmShortcut(ZmKeyMap.MAP_NAME[p1[0]], p[1], action, p1[2], baseAction, num);
};

ZmShortcut.parseAction =
function(appCtxt, mapName, action) {
	var kmm = appCtxt.getKeyboardMgr().__keyMapMgr;	
	var m = action.match(/([a-zA-Z]+)(\d+)/);
	if (m && m.length) {
		var arg = kmm.getArg(mapName, action);
		return new ZmShortcut(mapName, null, action, arg, m[1], m[2]);
	} else {
		return null;
	}
};
