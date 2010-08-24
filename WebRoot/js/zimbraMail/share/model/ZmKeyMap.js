/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2006, 2007, 2008, 2009, 2010 Zimbra, Inc.
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
 * This file defines the key map.
 */

/**
 * Creates a key map for the ZCS application.
 * @class
 * This class maps keys to actions for the ZCS application. There is a global key map
 * with bindings that apply to any key not handled by the current controller; these
 * global bindings apply across applications (mail, contacts, etc). Key bindings that
 * are context-dependent are tied to a particular controller. If that controller has
 * control, then those bindings will be used.
 * <br/>
 * <br/>
 * Bindings are passed in via the <code>ZmKeys</code> object, which is populated from a properties
 * file. The identifiers used in the properties file must match those used here.
 * 
 * @author Ross Dargahi
 * @author Conrad Damon
 * 
 * @extends		DwtKeyMap
 */
ZmKeyMap = function() {
	
	ZmKeyMap._setPreconditions();
	DwtKeyMap.call(this);
	this._load(this._map, ZmKeys, ZmKeyMap.MAP_NAME);

	if (appCtxt.get(ZmSetting.DEV)) {
		this._map["Global"]["Alt+Shift+D,0"] = ZmKeyMap.DBG_NONE;
		this._map["Global"]["Alt+Shift+D,1"] = ZmKeyMap.DBG_1;
		this._map["Global"]["Alt+Shift+D,2"] = ZmKeyMap.DBG_2;
		this._map["Global"]["Alt+Shift+D,3"] = ZmKeyMap.DBG_3;
		this._map["Global"]["Alt+Shift+D,T"] = ZmKeyMap.DBG_TIMING;
	}
};

ZmKeyMap.prototype = new DwtKeyMap(true);
ZmKeyMap.prototype.constructor = ZmKeyMap;


// translations for map names used in properties file
ZmKeyMap.MAP_NAME = {};

ZmKeyMap.MAP_NAME["briefcase"]			= "ZmBriefcaseController";
ZmKeyMap.MAP_NAME["calendar"]			= "ZmCalViewController";
ZmKeyMap.MAP_NAME["call"]				= "ZmCallListController";
ZmKeyMap.MAP_NAME["compose"]			= "ZmComposeController";
ZmKeyMap.MAP_NAME["contacts"]			= "ZmContactListController";
ZmKeyMap.MAP_NAME["conversation"]		= "ZmConvController";
ZmKeyMap.MAP_NAME["conversationList"]	= "ZmConvListController";
ZmKeyMap.MAP_NAME["editAppointment"]	= "ZmApptComposeController";
ZmKeyMap.MAP_NAME["editContact"]		= "ZmContactController";
ZmKeyMap.MAP_NAME["editPage"]			= "ZmPageEditController";
ZmKeyMap.MAP_NAME["editTask"]			= "ZmTaskController";
ZmKeyMap.MAP_NAME["global"]				= "Global";
ZmKeyMap.MAP_NAME["mail"]				= "ZmMailListController";
ZmKeyMap.MAP_NAME["message"]			= "ZmMsgController";
ZmKeyMap.MAP_NAME["mixed"]				= "ZmMixedController";
ZmKeyMap.MAP_NAME["notebook"]			= "ZmNotebookPageController";
ZmKeyMap.MAP_NAME["options"]			= "ZmPrefController";
ZmKeyMap.MAP_NAME["tasks"]				= "ZmTaskListController";
ZmKeyMap.MAP_NAME["voicemail"]			= "ZmVoicemailListController";

// reverse map of above
ZmKeyMap.MAP_NAME_R = {};
(function() {
    for (var i in ZmKeyMap.MAP_NAME) {
        ZmKeyMap.MAP_NAME_R[ZmKeyMap.MAP_NAME[i]] = i;
    }
})();

// Action codes
ZmKeyMap.ADDRESS_PICKER			= "AddressPicker";
ZmKeyMap.ASSISTANT				= "Assistant";
ZmKeyMap.ATTACHMENT				= "Attachment";
ZmKeyMap.CAL_DAY_VIEW			= "DayView";
ZmKeyMap.CAL_LIST_VIEW			= "CalListView";
ZmKeyMap.CAL_MONTH_VIEW			= "MonthView";
ZmKeyMap.CAL_SCHEDULE_VIEW		= "ScheduleView";
ZmKeyMap.CAL_WEEK_VIEW			= "WeekView";
ZmKeyMap.CAL_WORK_WEEK_VIEW		= "WorkWeekView";
ZmKeyMap.CALL_MANAGER       	= "CallManager";
ZmKeyMap.CANCEL					= "Cancel";
ZmKeyMap.COLLAPSE_ALL			= "CollapseAll";
ZmKeyMap.DBG_NONE				= "DebugNone";
ZmKeyMap.DBG_1					= "DebugLevel1";
ZmKeyMap.DBG_2					= "DebugLevel2";
ZmKeyMap.DBG_3					= "DebugLevel3";
ZmKeyMap.DBG_TIMING				= "ToggleDebugTiming";
ZmKeyMap.DEL					= "Delete";
ZmKeyMap.DOWNLOAD           	= "Download";
ZmKeyMap.EDIT					= "Edit";
ZmKeyMap.EXPAND					= "Expand";
ZmKeyMap.EXPAND_ALL				= "ExpandAll";
ZmKeyMap.FIRST_UNREAD			= "FirstUnread";
ZmKeyMap.FIRST_UNREAD_MSG		= "FirstUnreadMsg";
ZmKeyMap.FLAG					= "Flag";
ZmKeyMap.FOCUS_CONTENT_PANE		= "FocusContentPane";
ZmKeyMap.FOCUS_SEARCH_BOX		= "FocusSearchBox";
ZmKeyMap.FOCUS_TOOLBAR			= "FocusToolbar";
ZmKeyMap.FORWARD				= "Forward";
ZmKeyMap.GET_MAIL				= "GetMail";
ZmKeyMap.GOTO_BRIEFCASE			= "GoToBriefcase";
ZmKeyMap.GOTO_CALENDAR			= "GoToCalendar";
ZmKeyMap.GOTO_CONTACTS			= "GoToContacts";
ZmKeyMap.GOTO_DRAFTS			= "GoToDrafts";
ZmKeyMap.GOTO_JUNK				= "GoToJunk";
ZmKeyMap.GOTO_INBOX				= "GoToInbox";
ZmKeyMap.GOTO_MAIL				= "GoToMail";
ZmKeyMap.GOTO_NOTEBOOK			= "GoToNotebook";
ZmKeyMap.GOTO_OPTIONS			= "GoToOptions";
ZmKeyMap.GOTO_SENT				= "GoToSent";
ZmKeyMap.GOTO_TASKS				= "GoToTasks";
ZmKeyMap.GOTO_TRASH				= "GoToTrash";
ZmKeyMap.GOTO_VOICE				= "GoToVoice";
ZmKeyMap.HTML_FORMAT			= "HtmlFormat";
ZmKeyMap.LAST_UNREAD			= "LastUnread";
ZmKeyMap.LAST_UNREAD_MSG		= "LastUnreadMsg";
ZmKeyMap.LOGOFF					= "LogOff";
ZmKeyMap.MARK_COMPLETE			= "MarkComplete";
ZmKeyMap.MARK_HEARD				= "MarkHeard";
ZmKeyMap.MARK_READ				= "MarkRead";
ZmKeyMap.MARK_UNCOMPLETE		= "MarkUncomplete";
ZmKeyMap.MARK_UNHEARD			= "MarkUnheard";
ZmKeyMap.MARK_UNREAD			= "MarkUnread";
ZmKeyMap.MOVE					= "Move";
ZmKeyMap.MOVE_TO_INBOX			= "MoveToInbox";
ZmKeyMap.MOVE_TO_JUNK			= "MoveToJunk";
ZmKeyMap.MOVE_TO_TRASH			= "MoveToTrash";
ZmKeyMap.NEW					= "New";
ZmKeyMap.NEW_APPT				= "NewAppointment";
ZmKeyMap.NEW_BRIEFCASE			= "NewBriefcase";
ZmKeyMap.NEW_CALENDAR			= "NewCalendar";
ZmKeyMap.NEW_CHAT				= "NewChat";
ZmKeyMap.NEW_CONTACT			= "NewContact";
ZmKeyMap.NEW_DOC    			= "NewDocument";
ZmKeyMap.NEW_FILE				= "NewFile";
ZmKeyMap.NEW_FOLDER				= "NewFolder";
ZmKeyMap.NEW_MESSAGE			= "NewMessage";
ZmKeyMap.NEW_MESSAGE_WIN		= "NewMessageWindow";
ZmKeyMap.NEW_NOTEBOOK			= "NewNotebook";
ZmKeyMap.NEW_PAGE				= "NewPage";
ZmKeyMap.NEW_PRESENTATION		= "NewPresentation";
ZmKeyMap.NEW_ROSTER_ITEM		= "NewRosterItem";
ZmKeyMap.NEW_SPREADSHEET        = "NewSpreadsheet";
ZmKeyMap.NEW_TAG				= "NewTag";
ZmKeyMap.NEW_TASK				= "NewTask";
ZmKeyMap.NEW_WINDOW				= "NewWindow";
ZmKeyMap.NEXT_CONV				= "NextConversation";
ZmKeyMap.NEXT_PAGE				= "NextPage";
ZmKeyMap.NEXT_UNREAD			= "NextUnread";
ZmKeyMap.NEXT_UNREAD_MSG		= "NextUnreadMsg";
ZmKeyMap.PLAY					= "Play";
ZmKeyMap.PRESENCE_MENU			= "PresenceMenu";
ZmKeyMap.PREV_CONV				= "PreviousConversation";
ZmKeyMap.PREV_PAGE				= "PreviousPage";
ZmKeyMap.PREV_UNREAD			= "PreviousUnread";
ZmKeyMap.PREV_UNREAD_MSG		= "PreviousUnreadMsg";
ZmKeyMap.PRINT					= "Print";
ZmKeyMap.PRINT_ALL				= "PrintAll";
ZmKeyMap.QUICK_ADD				= "QuickAdd";
ZmKeyMap.QUICK_REMINDER 	    = "QuickReminder";
ZmKeyMap.READING_PANE_BOTTOM	= "ReadingPaneAtBottom";
ZmKeyMap.READING_PANE_OFF		= "ReadingPaneOff";
ZmKeyMap.READING_PANE_RIGHT		= "ReadingPaneOnRight";
ZmKeyMap.REFRESH				= "Refresh";
ZmKeyMap.REPLY					= "Reply";
ZmKeyMap.REPLY_ALL				= "ReplyAll";
ZmKeyMap.SAVE					= "Save";
ZmKeyMap.SAVED_SEARCH			= "SavedSearch";
ZmKeyMap.SELECT_ALL				= "SelectAll";
ZmKeyMap.SEND					= "Send";
ZmKeyMap.SHORTCUTS				= "Shortcuts";
ZmKeyMap.SHOW_FRAGMENT			= "ShowFragment";
ZmKeyMap.SPAM					= "Spam";
ZmKeyMap.SPELLCHECK				= "Spellcheck";
ZmKeyMap.TAG					= "Tag";
ZmKeyMap.TODAY					= "Today";
ZmKeyMap.UNDO					= "Undo";
ZmKeyMap.UNTAG					= "Untag";
ZmKeyMap.VIEW_BY_CONV			= "ViewByConversation";
ZmKeyMap.VIEW_BY_MSG			= "ViewByMessage";
ZmKeyMap.VISIT					= "Visit";
ZmKeyMap.VISIT_TAG				= "VisitTag";

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
	ZmKeyMap.MAP_PRECONDITION["ZmConvListController"]		= ZmSetting.MAIL_ENABLED;
	ZmKeyMap.MAP_PRECONDITION["ZmConvController"]			= ZmSetting.MAIL_ENABLED;
	ZmKeyMap.MAP_PRECONDITION["ZmMsgController"]			= ZmSetting.MAIL_ENABLED;
	ZmKeyMap.MAP_PRECONDITION["ZmContactListController"]	= ZmSetting.CONTACTS_ENABLED;
	ZmKeyMap.MAP_PRECONDITION["ZmContactController"]		= ZmSetting.CONTACTS_ENABLED;
	ZmKeyMap.MAP_PRECONDITION["ZmCalViewController"]		= ZmSetting.CALENDAR_ENABLED;
	ZmKeyMap.MAP_PRECONDITION["ZmApptComposeController"]	= ZmSetting.CALENDAR_ENABLED;
	ZmKeyMap.MAP_PRECONDITION["ZmMixedController"]			= ZmSetting.MIXED_VIEW_ENABLED;
	ZmKeyMap.MAP_PRECONDITION["ZmPrefController"]			= ZmSetting.OPTIONS_ENABLED;
	ZmKeyMap.MAP_PRECONDITION["ZmNotebookPageController"]	= ZmSetting.NOTEBOOK_ENABLED;
	ZmKeyMap.MAP_PRECONDITION["ZmBriefcaseController"]		= ZmSetting.BRIEFCASE_ENABLED;
	ZmKeyMap.MAP_PRECONDITION["ZmTaskListController"]		= ZmSetting.TASKS_ENABLED;
	ZmKeyMap.MAP_PRECONDITION["ZmTaskController"]			= ZmSetting.TASKS_ENABLED;
	ZmKeyMap.MAP_PRECONDITION["ZmVoicemailListController"]	= ZmSetting.VOICE_ENABLED;
	ZmKeyMap.MAP_PRECONDITION["ZmCallListController"]		= ZmSetting.VOICE_ENABLED;
	
	ZmKeyMap.ACTION_PRECONDITION["Global"] = {};
	ZmKeyMap.ACTION_PRECONDITION["Global"][ZmKeyMap.FOCUS_SEARCH_BOX]	= ZmSetting.SEARCH_ENABLED;
	ZmKeyMap.ACTION_PRECONDITION["Global"][ZmKeyMap.GOTO_BRIEFCASE]		= ZmSetting.BRIEFCASE_ENABLED;
	ZmKeyMap.ACTION_PRECONDITION["Global"][ZmKeyMap.GOTO_CALENDAR]		= ZmSetting.CALENDAR_ENABLED;
	ZmKeyMap.ACTION_PRECONDITION["Global"][ZmKeyMap.GOTO_CONTACTS]		= ZmSetting.CONTACTS_ENABLED;
	ZmKeyMap.ACTION_PRECONDITION["Global"][ZmKeyMap.GOTO_MAIL]			= ZmSetting.MAIL_ENABLED;
	ZmKeyMap.ACTION_PRECONDITION["Global"][ZmKeyMap.GOTO_NOTEBOOK]		= ZmSetting.NOTEBOOK_ENABLED;
	ZmKeyMap.ACTION_PRECONDITION["Global"][ZmKeyMap.GOTO_OPTIONS]		= ZmSetting.OPTIONS_ENABLED;
	ZmKeyMap.ACTION_PRECONDITION["Global"][ZmKeyMap.GOTO_TASKS]			= ZmSetting.TASKS_ENABLED;
	ZmKeyMap.ACTION_PRECONDITION["Global"][ZmKeyMap.GOTO_VOICE]			= ZmSetting.VOICE_ENABLED;
	ZmKeyMap.ACTION_PRECONDITION["Global"][ZmKeyMap.NEW_APPT]			= ZmSetting.CALENDAR_ENABLED;
	ZmKeyMap.ACTION_PRECONDITION["Global"][ZmKeyMap.NEW_BRIEFCASEITEM]	= ZmSetting.BRIEFCASE_ENABLED;
	ZmKeyMap.ACTION_PRECONDITION["Global"][ZmKeyMap.NEW_CALENDAR]		= ZmSetting.CALENDAR_ENABLED;
	ZmKeyMap.ACTION_PRECONDITION["Global"][ZmKeyMap.NEW_CHAT]			= ZmSetting.IM_ENABLED;
	ZmKeyMap.ACTION_PRECONDITION["Global"][ZmKeyMap.NEW_CONTACT]		= ZmSetting.CONTACTS_ENABLED;
	ZmKeyMap.ACTION_PRECONDITION["Global"][ZmKeyMap.NEW_FILE]			= ZmSetting.BRIEFCASE_ENABLED;
    ZmKeyMap.ACTION_PRECONDITION["Global"][ZmKeyMap.NEW_DOC]			= ZmSetting.DOCS_ENABLED;    
	ZmKeyMap.ACTION_PRECONDITION["Global"][ZmKeyMap.NEW_FOLDER]			= ZmSetting.MAIL_ENABLED;
	ZmKeyMap.ACTION_PRECONDITION["Global"][ZmKeyMap.NEW_MESSAGE]		= ZmSetting.MAIL_ENABLED;
	ZmKeyMap.ACTION_PRECONDITION["Global"][ZmKeyMap.NEW_MESSAGE_WIN]	= ZmSetting.MAIL_ENABLED;
	ZmKeyMap.ACTION_PRECONDITION["Global"][ZmKeyMap.NEW_NOTEBOOK]		= ZmSetting.NOTEBOOK_ENABLED;
	ZmKeyMap.ACTION_PRECONDITION["Global"][ZmKeyMap.NEW_PAGE]			= ZmSetting.NOTEBOOK_ENABLED;
	ZmKeyMap.ACTION_PRECONDITION["Global"][ZmKeyMap.NEW_ROSTER_ITEM]	= ZmSetting.IM_ENABLED;
	ZmKeyMap.ACTION_PRECONDITION["Global"][ZmKeyMap.NEW_TAG]			= ZmSetting.TAGGING_ENABLED;
	ZmKeyMap.ACTION_PRECONDITION["Global"][ZmKeyMap.NEW_TASK]			= ZmSetting.TASKS_ENABLED;
	ZmKeyMap.ACTION_PRECONDITION["Global"][ZmKeyMap.PRESENCE_MENU]		= ZmSetting.IM_ENABLED;
	ZmKeyMap.ACTION_PRECONDITION["Global"][ZmKeyMap.SAVED_SEARCH]		= ZmSetting.SAVED_SEARCHES_ENABLED;
	ZmKeyMap.ACTION_PRECONDITION["Global"][ZmKeyMap.TAG]				= ZmSetting.TAGGING_ENABLED;
	ZmKeyMap.ACTION_PRECONDITION["Global"][ZmKeyMap.UNTAG]				= ZmSetting.TAGGING_ENABLED;
	ZmKeyMap.ACTION_PRECONDITION["ZmComposeController"] = {};
	ZmKeyMap.ACTION_PRECONDITION["ZmComposeController"][ZmKeyMap.ADDRESS_PICKER]	= ZmSetting.CONTACTS_ENABLED;
	ZmKeyMap.ACTION_PRECONDITION["ZmComposeController"][ZmKeyMap.HTML_FORMAT]		= ZmSetting.HTML_COMPOSE_ENABLED;
	ZmKeyMap.ACTION_PRECONDITION["ZmComposeController"][ZmKeyMap.NEW_WINDOW]		= ZmSetting.NEW_WINDOW_COMPOSE;
	ZmKeyMap.ACTION_PRECONDITION["ZmComposeController"][ZmKeyMap.SAVE]				= ZmSetting.SAVE_DRAFT_ENABLED;
	ZmKeyMap.ACTION_PRECONDITION["ZmApptComposeController"] = {};
	ZmKeyMap.ACTION_PRECONDITION["ZmApptComposeController"][ZmKeyMap.HTML_FORMAT]	= ZmSetting.HTML_COMPOSE_ENABLED;
};

/**
 * Checks if this map is valid. A map may have a precondition,
 * which is either a setting that must be true, or a function that returns
 * true.
 *
 * @param {String}	mapName	the name of map
 * @return	{Boolean}	<code>true</code> if the map is valid
 * 
 * @private
 */
ZmKeyMap.prototype._checkMap =
function(mapName) {
	var result;
	var mapPre = ZmKeyMap.MAP_PRECONDITION[mapName];
	if (!mapPre) {
		result = true;
	} else if (typeof mapPre == "string" || typeof mapPre == "number") {
		result = appCtxt.get(mapPre);
	} else if (typeof mapPre == "function") {
		result = mapPre();
	}
	this._checkedMap[mapName] = result;
	return result;
};

/**
 * Checks if this action is valid. A map or an action may have a precondition,
 * which is either a setting that must be true, or a function that returns
 * true.
 *
 * @param {String} mapName	the name of map
 * @param {String} action	the action to check
 * @return	{Boolean}	<code>true</code> if the action is valid
 * 
 * @private
 */
ZmKeyMap.prototype._checkAction =
function(mapName, action) {
	if ((this._checkedMap[mapName] === false) ||
		(!this._checkedMap[mapName] && !this._checkMap(mapName))) { return false; }
	var mapPre = ZmKeyMap.ACTION_PRECONDITION[mapName];
	if (!mapPre) { return true; }
	var pre = mapPre[action];
	if (!pre) { return true; }
	if (typeof pre == "string" || typeof pre == "number") {
		return appCtxt.get(pre);
	} else if (typeof pre == "function") {
		return pre();
	}
	return true;
};
