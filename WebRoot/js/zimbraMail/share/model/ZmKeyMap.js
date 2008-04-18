/*
 * ***** BEGIN LICENSE BLOCK *****
 * 
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2006, 2007 Zimbra, Inc.
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
ZmKeyMap.MAP_NAME["briefcase"]			= "ZmBriefcaseController";
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
ZmKeyMap.CALL_MANAGER       = "CallManager";
ZmKeyMap.CANCEL				= "Cancel";
ZmKeyMap.COLLAPSE_ALL		= "CollapseAll";
ZmKeyMap.DBG_NONE			= "DebugNone";
ZmKeyMap.DBG_1				= "DebugLevel1";
ZmKeyMap.DBG_2				= "DebugLevel2";
ZmKeyMap.DBG_3				= "DebugLevel3";
ZmKeyMap.DBG_TIMING			= "ToggleDebugTiming";
ZmKeyMap.DEL				= "Delete";
ZmKeyMap.DOWNLOAD           = "Download";
ZmKeyMap.EDIT				= "Edit";
ZmKeyMap.EXPAND				= "Expand";
ZmKeyMap.EXPAND_ALL			= "ExpandAll";
ZmKeyMap.FLAG				= "Flag";
ZmKeyMap.FOCUS_CONTENT_PANE	= "FocusContentPane";
ZmKeyMap.FOCUS_SEARCH_BOX	= "FocusSearchBox";
ZmKeyMap.FORWARD			= "Forward";
ZmKeyMap.FORWARD_ATT		= "ForwardAsAttachment";
ZmKeyMap.FORWARD_INLINE		= "ForwardInline";
ZmKeyMap.GOTO_CALENDAR		= "GoToCalendar";
ZmKeyMap.GOTO_CONTACTS		= "GoToContacts";
ZmKeyMap.GOTO_DRAFTS		= "GoToDrafts";
ZmKeyMap.GOTO_JUNK			= "GoToJunk";
ZmKeyMap.GOTO_FOLDER		= "GoToFolder";		// takes NNN
ZmKeyMap.GOTO_IM			= "GoToIm";
ZmKeyMap.GOTO_INBOX			= "GoToInbox";
ZmKeyMap.GOTO_MAIL			= "GoToMail";
ZmKeyMap.GOTO_NOTEBOOK		= "GoToNotebook";
ZmKeyMap.GOTO_BRIEFCASE		= "GoToBriefcase";
ZmKeyMap.GOTO_OPTIONS		= "GoToOptions";
ZmKeyMap.GOTO_VOICE			= "GoToVoice";
ZmKeyMap.GOTO_SENT			= "GoToSent";
ZmKeyMap.GOTO_TAG			= "GoToTag";		// takes NNN
ZmKeyMap.GOTO_TASKS			= "GoToTasks";
ZmKeyMap.GOTO_TRASH			= "GoToTrash";
ZmKeyMap.HIGH_PRIORITY		= "HighPriority";
ZmKeyMap.HTML_FORMAT		= "HtmlFormat";
ZmKeyMap.LOGOFF				= "LogOff";
ZmKeyMap.LOW_PRIORITY		= "LowPriority";
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
ZmKeyMap.NEW_BRIEFCASEITEM	= "NewBriefcase";
ZmKeyMap.NEW_CALENDAR		= "NewCalendar";
ZmKeyMap.NEW_CHAT			= "NewChat";
ZmKeyMap.NEW_CONTACT		= "NewContact";
ZmKeyMap.NEW_FILE			= "NewFile";
ZmKeyMap.NEW_FOLDER			= "NewFolder";
ZmKeyMap.NEW_MESSAGE		= "NewMessage";
ZmKeyMap.NEW_MESSAGE_WIN	= "NewMessageWindow";
ZmKeyMap.NEW_NOTEBOOK		= "NewNotebook";
ZmKeyMap.NEW_PAGE			= "NewPage";
ZmKeyMap.NEW_ROSTER_ITEM	= "NewRosterItem";
ZmKeyMap.NEW_TAG			= "NewTag";
ZmKeyMap.NEW_TASK			= "NewTask";
ZmKeyMap.NEW_WINDOW			= "NewWindow";
ZmKeyMap.NEXT_CONV			= "NextConversation";
ZmKeyMap.NEXT_PAGE			= "NextPage";
ZmKeyMap.NEXT_UNREAD		= "NextUnread";
ZmKeyMap.NORMAL_PRIORITY	= "NormalPriority";
ZmKeyMap.PLAY				= "Play";
ZmKeyMap.PRESENCE_MENU		= "PresenceMenu";
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
	ZmKeyMap.ACTION_PRECONDITION["Global"][ZmKeyMap.GOTO_BRIEFCASE]		= ZmSetting.BRIEFCASE_ENABLED;
	ZmKeyMap.ACTION_PRECONDITION["Global"][ZmKeyMap.NEW_FILE]			= ZmSetting.BRIEFCASE_ENABLED;
	ZmKeyMap.ACTION_PRECONDITION["Global"][ZmKeyMap.NEW_BRIEFCASEITEM]	= ZmSetting.BRIEFCASE_ENABLED;
	ZmKeyMap.ACTION_PRECONDITION["Global"][ZmKeyMap.GOTO_CALENDAR]		= ZmSetting.CALENDAR_ENABLED;
	ZmKeyMap.ACTION_PRECONDITION["Global"][ZmKeyMap.NEW_APPT]			= ZmSetting.CALENDAR_ENABLED;
	ZmKeyMap.ACTION_PRECONDITION["Global"][ZmKeyMap.NEW_CALENDAR]		= ZmSetting.CALENDAR_ENABLED;
	ZmKeyMap.ACTION_PRECONDITION["Global"][ZmKeyMap.GOTO_CONTACTS]		= ZmSetting.CONTACTS_ENABLED;
	ZmKeyMap.ACTION_PRECONDITION["Global"][ZmKeyMap.NEW_CONTACT]		= ZmSetting.CONTACTS_ENABLED;
	ZmKeyMap.ACTION_PRECONDITION["Global"][ZmKeyMap.GOTO_IM]			= ZmSetting.IM_ENABLED;
	ZmKeyMap.ACTION_PRECONDITION["Global"][ZmKeyMap.GOTO_MAIL]			= ZmSetting.MAIL_ENABLED;
	ZmKeyMap.ACTION_PRECONDITION["Global"][ZmKeyMap.NEW_MESSAGE]		= ZmSetting.MAIL_ENABLED;
	ZmKeyMap.ACTION_PRECONDITION["Global"][ZmKeyMap.NEW_MESSAGE_WIN]	= ZmSetting.MAIL_ENABLED;
	ZmKeyMap.ACTION_PRECONDITION["Global"][ZmKeyMap.NEW_FOLDER]			= ZmSetting.MAIL_ENABLED;
	ZmKeyMap.ACTION_PRECONDITION["Global"][ZmKeyMap.GOTO_NOTEBOOK]		= ZmSetting.NOTEBOOK_ENABLED;
	ZmKeyMap.ACTION_PRECONDITION["Global"][ZmKeyMap.NEW_NOTEBOOK]		= ZmSetting.NOTEBOOK_ENABLED;
	ZmKeyMap.ACTION_PRECONDITION["Global"][ZmKeyMap.NEW_PAGE]			= ZmSetting.NOTEBOOK_ENABLED;
	ZmKeyMap.ACTION_PRECONDITION["Global"][ZmKeyMap.NEW_CHAT]			= ZmSetting.IM_ENABLED;
	ZmKeyMap.ACTION_PRECONDITION["Global"][ZmKeyMap.NEW_ROSTER_ITEM]	= ZmSetting.IM_ENABLED;
	ZmKeyMap.ACTION_PRECONDITION["Global"][ZmKeyMap.GOTO_OPTIONS]		= ZmSetting.OPTIONS_ENABLED;
	ZmKeyMap.ACTION_PRECONDITION["Global"][ZmKeyMap.SAVED_SEARCH]		= ZmSetting.SAVED_SEARCHES_ENABLED;
	ZmKeyMap.ACTION_PRECONDITION["Global"][ZmKeyMap.FOCUS_SEARCH_BOX]	= ZmSetting.SEARCH_ENABLED;
	ZmKeyMap.ACTION_PRECONDITION["Global"][ZmKeyMap.GOTO_TAG]			= ZmSetting.TAGGING_ENABLED;
	ZmKeyMap.ACTION_PRECONDITION["Global"][ZmKeyMap.NEW_TAG]			= ZmSetting.TAGGING_ENABLED;
	ZmKeyMap.ACTION_PRECONDITION["Global"][ZmKeyMap.TAG]				= ZmSetting.TAGGING_ENABLED;
	ZmKeyMap.ACTION_PRECONDITION["Global"][ZmKeyMap.UNTAG]				= ZmSetting.TAGGING_ENABLED;
	ZmKeyMap.ACTION_PRECONDITION["Global"][ZmKeyMap.GOTO_TASKS]			= ZmSetting.TASKS_ENABLED;
	ZmKeyMap.ACTION_PRECONDITION["Global"][ZmKeyMap.NEW_TASK]			= ZmSetting.TASKS_ENABLED;
	ZmKeyMap.ACTION_PRECONDITION["Global"][ZmKeyMap.GOTO_VOICE]			= ZmSetting.VOICE_ENABLED;
	ZmKeyMap.ACTION_PRECONDITION["Global"][ZmKeyMap.PRESENCE_MENU]		= ZmSetting.IM_ENABLED;
	ZmKeyMap.ACTION_PRECONDITION["ZmComposeController"] = {};
	ZmKeyMap.ACTION_PRECONDITION["ZmComposeController"][ZmKeyMap.ADDRESS_PICKER]	= ZmSetting.CONTACTS_ENABLED;
	ZmKeyMap.ACTION_PRECONDITION["ZmComposeController"][ZmKeyMap.HTML_FORMAT]		= ZmSetting.HTML_COMPOSE_ENABLED;
	ZmKeyMap.ACTION_PRECONDITION["ZmComposeController"][ZmKeyMap.NEW_WINDOW]		= ZmSetting.NEW_WINDOW_COMPOSE;
	ZmKeyMap.ACTION_PRECONDITION["ZmComposeController"][ZmKeyMap.SAVE]				= ZmSetting.SAVE_DRAFT_ENABLED;
	ZmKeyMap.ACTION_PRECONDITION["ZmComposeController"][ZmKeyMap.HIGH_PRIORITY]		= ZmSetting.MAIL_PRIORITY_ENABLED;
	ZmKeyMap.ACTION_PRECONDITION["ZmComposeController"][ZmKeyMap.NORMAL_PRIORITY]		= ZmSetting.MAIL_PRIORITY_ENABLED;
	ZmKeyMap.ACTION_PRECONDITION["ZmComposeController"][ZmKeyMap.LOW_PRIORITY]		= ZmSetting.MAIL_PRIORITY_ENABLED;
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
 * Returns true if this action is valid. A map or an action may have a precondition,
 * which is either a setting that must be true, or a function that returns
 * true.
 *
 * @param mapName	[string]	name of map
 * @param action	[string]	action to check
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

/**
 * Creates a shortcut
 * @constructor
 * @class
 * This class represents a keyboard shortcut that can be saved with a user's
 * preferences. The saved preference takes one of two forms:
 * 
 *    OLD: [mapName].[action].[arg]=[keySequence]
 *    NEW: [orgType],[arg],[alias]
 * 
 * See the parsing functions below for examples.
 * 
 * @author Conrad Damon
 * 
 * @param params		[hash]		hash of params:
 *        mapName		[string]	name of map that contains this shortcut's key mapping
 *        keySequence	[string]	key sequence
 *        action		[string]	custom action triggered by this shortcut (eg GoToFolder1)
 *        arg			[string]	ID of organizer tied to this shortcut
 *        baseAction	[constant]	action without num appended
 *        num			[int]		numeric alias
 *        orgType		[constant]	type of organizer
 */
ZmShortcut = function(params) {
	this.mapName = params.mapName;
	this.keySequence = params.keySequence;
	this.action = params.action;
	this.arg = params.arg;
	this.num = params.num;
	this.baseAction = params.baseAction;
	this.orgType = params.orgType;
}

// Key mappings that are custom shortcuts
ZmShortcut._shortcuts;
ZmShortcut._shortcutsCulled = false;

// placeholder for numeric alias
ZmShortcut.ALIAS = "NNN";

// map letter to org type
ZmShortcut.ORG_TYPE = {};

// map org type to letter
ZmShortcut.ORG_KEY = {};

// map org key to substring as it appears in actions
ZmShortcut.ACTION_KEY = {};
ZmShortcut.ACTION_KEY["F"] = "Folder";
ZmShortcut.ACTION_KEY["S"] = "SavedSearch";
ZmShortcut.ACTION_KEY["T"] = "Tag";

/**
 * Takes an encoded list of user aliases or shortcuts, and returns a list of
 * ZmShortcut objects.
 * 
 * @param str	[string]			a |-separated list of shortcuts or aliases
 * @param kmm	[DwtKeyMapMgr]		key map mgr
 */
ZmShortcut.parse =
function(str, kmm) {
	var shortcuts = [];
	if (!str) { return shortcuts; }
	var chunks = str.split("|");
	if (!(chunks && chunks.length)) { return shortcuts; }
	
	for (var i = 0, count = chunks.length; i < count; i++) {
		var chunk = chunks[i];
		var result = ZmShortcut._parse(chunks[i], kmm);
		if (result instanceof Array) {
			shortcuts = shortcuts.concat(result);
		} else if (result) {
			shortcuts.push(result);
		}
	}
	
	return shortcuts;
};

ZmShortcut._parse =
function(str, kmm) {
	return (str.indexOf("=") != -1) ? ZmShortcut._parseOld(str) : ZmShortcut._parseNew(str, kmm);
};

/**
 * The given string represents one key mapping that we need to add. All necessary information
 * is already encoded in the string. For example:
 * 
 *     mail.MoveToFolder4.538=M,4
 * 
 * @param str	[string]	a shortcut encoded as above
 */
ZmShortcut._parseOld =
function(str) {
	if (!str) { return null; }
	var p = str.split("=");
	var p1 = p[0].split(".");
	var action = p1[1];
	var m = action.match(/([a-zA-Z]+)(\d+)$/);
	var num, baseAction;
	if (m && m.length) {
		baseAction = m[1];
		num = m[2];
	}
	var params = {mapName:ZmKeyMap.MAP_NAME[p1[0]], keySequence:p[1], action:action, arg:p1[2],
				  baseAction:baseAction, num:num, orgType:ZmShortcut._getOrgType(baseAction)};
	return new ZmShortcut(params);
};

/**
 * All we get here is the organizer type, ID, and numeric alias:
 * 
 *     F,538,1
 * 
 * We need to apply that to all aliases related to the organizer type (in this case,
 * folders), so we have a one-to-many situation.
 * 
 * @param str	[string]	a shortcut encoded as above
 */
ZmShortcut._parseNew =
function(str, kmm) {

	if (kmm && !ZmShortcut._shortcutsCulled) {
		ZmShortcut._getShortcuts(kmm);
	}

	var shortcuts = [];
	if (!str) { return shortcuts; }
	var p = str.split(",");
	var key = p[0];
	var actionKey = ZmShortcut.ACTION_KEY[key];
	var arg = p[1];
	var alias = p[2];
	var mappings = ZmShortcut._shortcuts || kmm._map;
	for (var mapName in mappings) {
		var map = mappings[mapName];
		for (var keySequence in map) {
			if (keySequence.indexOf(ZmShortcut.ALIAS) == -1) { continue; }
			var action = map[keySequence];
			if (action.indexOf(actionKey) != -1) {
				keySequence = keySequence.replace(ZmShortcut.ALIAS, alias);
				var fullAction = [action, alias].join("");
				var params = {mapName:mapName, keySequence:keySequence, action:fullAction, arg:arg,
							  baseAction:action, num:alias, orgType:ZmShortcut.ORG_TYPE[key]};
				shortcuts.push(new ZmShortcut(params));
			}
		}
	}
	
	return shortcuts;
};

ZmShortcut.parseAction =
function(mapName, action) {
	var kmm = appCtxt.getAppController().getKeyMapMgr();
	var m = action.match(/([a-zA-Z]+)(\d+)/);
	if (m && m.length) {
		var arg = kmm.getArg(mapName, action);
		return new ZmShortcut({mapName:mapName, action:action, arg:arg, baseAction:m[1], num:m[2],
							   orgType:ZmShortcut._getOrgType(action)});
	} else {
		return null;
	}
};

/**
 * Cull the key mappings that are shortcuts (mappings with a user-configurable
 * numeric alias). This is so we don't have to go through all the mappings for
 * every alias when we parse shortcuts.
 */
ZmShortcut._getShortcuts =
function(kmm) {
	for (var mapName in kmm._map) {
		if (mapName.indexOf("Dwt") == 0) { continue; }
		var map = kmm._map[mapName];
		for (var keySequence in map) {
			if (keySequence.indexOf(ZmKeyMap.ALIAS) != -1) {
				if (!ZmShortcut._shortcuts[mapName]) {
					ZmShortcut._shortcuts[mapName] = {};
				}
				ZmShortcut._shortcuts[mapName][keySequence] = map[keySequence];
			}
		}
	}
	ZmShortcut._shortcutsCulled = true;
};

ZmShortcut._getOrgType =
function(action) {
	if (!action) { return null; }
	var orgType;
	for (var key in ZmShortcut.ACTION_KEY) {
		var s = ZmShortcut.ACTION_KEY[key];
		if (action.indexOf(s) != -1) {
			orgType = ZmShortcut.ORG_TYPE[key];
			break;
		}
	}
	return orgType;
};

ZmShortcut.prototype.toString =
function() {
	return "ZmShortcut";
};
