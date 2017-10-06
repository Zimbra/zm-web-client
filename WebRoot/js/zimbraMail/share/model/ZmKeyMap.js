/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016 Synacor, Inc.
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
 * All portions of the code are Copyright (C) 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016 Synacor, Inc. All Rights Reserved.
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
	this._load(this._map, ZmKeys);
};

ZmKeyMap.prototype = new DwtKeyMap(true);
ZmKeyMap.prototype.constructor = ZmKeyMap;

ZmKeyMap.prototype.isZmKeyMap = true;
ZmKeyMap.prototype.toString = function() { return "ZmKeyMap"; };


// Map names (must match those in the key properties file ZmKeys.properties)
ZmKeyMap.MAP_ADDRESS			= "address";
ZmKeyMap.MAP_BRIEFCASE			= "briefcase";
ZmKeyMap.MAP_CALENDAR			= "calendar";
ZmKeyMap.MAP_CALL				= "call";
ZmKeyMap.MAP_COMPOSE			= "compose";
ZmKeyMap.MAP_CONTACTS			= "contacts";
ZmKeyMap.MAP_CONVERSATION		= "conversation";
ZmKeyMap.MAP_CONVERSATION_LIST	= "conversationList";
ZmKeyMap.MAP_DL_ADDRESS_LIST	= "dlAddressList";
ZmKeyMap.MAP_EDIT_APPOINTMENT	= "editAppointment";
ZmKeyMap.MAP_EDIT_CONTACT		= "editContact";
ZmKeyMap.MAP_EDIT_TASK			= "editTask";
ZmKeyMap.MAP_GLOBAL				= "global";
ZmKeyMap.MAP_MAIL				= "mail";
ZmKeyMap.MAP_MESSAGE			= "message";
ZmKeyMap.MAP_QUICK_REPLY		= "quickReply";
ZmKeyMap.MAP_OPTIONS			= "options";
ZmKeyMap.MAP_TASKS				= "tasks";
ZmKeyMap.MAP_VIEW_APPOINTMENT	= "viewAppointment";
ZmKeyMap.MAP_VOICEMAIL			= "voicemail";

// Action codes
ZmKeyMap.ADDRESS_PICKER			= "AddressPicker";
ZmKeyMap.ADD_EXTERNAL_CALENDAR	= "AddExternalCalendar";
ZmKeyMap.ATTACHMENT				= "Attachment";
ZmKeyMap.CAL_DAY_VIEW			= "DayView";
ZmKeyMap.CAL_FB_VIEW			= "FBView";
ZmKeyMap.CAL_LIST_VIEW			= "CalListView";
ZmKeyMap.CAL_MONTH_VIEW			= "MonthView";
ZmKeyMap.CAL_WEEK_VIEW			= "WeekView";
ZmKeyMap.CAL_WORK_WEEK_VIEW		= "WorkWeekView";
ZmKeyMap.CALL_MANAGER       	= "CallManager";
ZmKeyMap.CANCEL					= "Cancel";
ZmKeyMap.COLLAPSE				= "Collapse";
ZmKeyMap.COLLAPSE_ALL			= "CollapseAll";
ZmKeyMap.DEL					= "Delete";
ZmKeyMap.SHIFT_DEL				= "ShiftDelete";
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
ZmKeyMap.GOTO_OPTIONS			= "GoToOptions";
ZmKeyMap.GOTO_SENT				= "GoToSent";
ZmKeyMap.GOTO_TASKS				= "GoToTasks";
ZmKeyMap.GOTO_TRASH				= "GoToTrash";
ZmKeyMap.GOTO_VOICE				= "GoToVoice";
ZmKeyMap.HTML_FORMAT			= "HtmlFormat";
//ZmKeyMap.KEEP_READING			= "KeepReading";
ZmKeyMap.LAST_UNREAD			= "LastUnread";
ZmKeyMap.LAST_UNREAD_MSG		= "LastUnreadMsg";
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
ZmKeyMap.MUTE_UNMUTE_CONV	    = "MuteUnmuteConv";
ZmKeyMap.NEW					= "New";
ZmKeyMap.NEW_APPT				= "NewAppointment";
ZmKeyMap.NEW_BRIEFCASE			= "NewBriefcase";
ZmKeyMap.NEW_CALENDAR			= "NewCalendar";
ZmKeyMap.NEW_CONTACT			= "NewContact";
ZmKeyMap.NEW_DOC    			= "NewDocument";
ZmKeyMap.NEW_FILE				= "NewFile";
ZmKeyMap.NEW_FOLDER				= "NewFolder";
ZmKeyMap.NEW_MESSAGE			= "NewMessage";
ZmKeyMap.NEW_MESSAGE_WIN		= "NewMessageWindow";
ZmKeyMap.NEW_SEARCH				= "NewSearch";
ZmKeyMap.NEW_TAG				= "NewTag";
ZmKeyMap.NEW_TASK				= "NewTask";
ZmKeyMap.NEW_WINDOW				= "NewWindow";
ZmKeyMap.NEXT_APPT				= "NextAppointment";
ZmKeyMap.NEXT_CONV				= "NextConversation";
ZmKeyMap.NEXT_DAY				= "NextDay";
ZmKeyMap.NEXT_MSG				= "NextMessage";
ZmKeyMap.NEXT_PAGE				= "NextPage";
ZmKeyMap.NEXT_UNREAD			= "NextUnread";
ZmKeyMap.NEXT_UNREAD_MSG		= "NextUnreadMsg";
ZmKeyMap.PLAY					= "Play";
ZmKeyMap.PRESENCE_MENU			= "PresenceMenu";
ZmKeyMap.PREV_APPT				= "PreviousAppointment";
ZmKeyMap.PREV_CONV				= "PreviousConversation";
ZmKeyMap.PREV_DAY				= "PreviousDay";
ZmKeyMap.PREV_MSG				= "PreviousMessage";
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
ZmKeyMap.TOGGLE					= "Toggle";
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
	ZmKeyMap.MAP_PRECONDITION[ZmKeyMap.MAP_COMPOSE]				= ZmSetting.MAIL_ENABLED;
	ZmKeyMap.MAP_PRECONDITION[ZmKeyMap.MAP_MAIL]				= ZmSetting.MAIL_ENABLED;
	ZmKeyMap.MAP_PRECONDITION[ZmKeyMap.MAP_CONVERSATION_LIST]	= ZmSetting.MAIL_ENABLED;
	ZmKeyMap.MAP_PRECONDITION[ZmKeyMap.MAP_CONVERSATION]		= ZmSetting.MAIL_ENABLED;
	ZmKeyMap.MAP_PRECONDITION[ZmKeyMap.MAP_DL_ADDRESS_LIST]		= ZmSetting.CONTACTS_ENABLED;
	ZmKeyMap.MAP_PRECONDITION[ZmKeyMap.MAP_MESSAGE]				= ZmSetting.MAIL_ENABLED;
	ZmKeyMap.MAP_PRECONDITION[ZmKeyMap.MAP_CONTACTS]			= ZmSetting.CONTACTS_ENABLED;
	ZmKeyMap.MAP_PRECONDITION[ZmKeyMap.MAP_EDIT_CONTACT]		= ZmSetting.CONTACTS_ENABLED;
	ZmKeyMap.MAP_PRECONDITION[ZmKeyMap.MAP_CALENDAR]			= ZmSetting.CALENDAR_ENABLED;
	ZmKeyMap.MAP_PRECONDITION[ZmKeyMap.MAP_EDIT_APPOINTMENT]	= ZmSetting.CALENDAR_ENABLED;
	ZmKeyMap.MAP_PRECONDITION[ZmKeyMap.MAP_OPTIONS]				= ZmSetting.OPTIONS_ENABLED;
	ZmKeyMap.MAP_PRECONDITION[ZmKeyMap.MAP_BRIEFCASE]			= ZmSetting.BRIEFCASE_ENABLED;
	ZmKeyMap.MAP_PRECONDITION[ZmKeyMap.MAP_TASKS]				= ZmSetting.TASKS_ENABLED;
	ZmKeyMap.MAP_PRECONDITION[ZmKeyMap.MAP_EDIT_TASK]			= ZmSetting.TASKS_ENABLED;
	ZmKeyMap.MAP_PRECONDITION[ZmKeyMap.MAP_VOICEMAIL]			= ZmSetting.VOICE_ENABLED;
	ZmKeyMap.MAP_PRECONDITION[ZmKeyMap.MAP_CALL]				= ZmSetting.VOICE_ENABLED;
	
	ZmKeyMap.ACTION_PRECONDITION[ZmKeyMap.MAP_GLOBAL] = {};
	ZmKeyMap.ACTION_PRECONDITION[ZmKeyMap.MAP_GLOBAL][ZmKeyMap.FOCUS_SEARCH_BOX]	= ZmSetting.SEARCH_ENABLED;
	ZmKeyMap.ACTION_PRECONDITION[ZmKeyMap.MAP_GLOBAL][ZmKeyMap.GOTO_BRIEFCASE]		= ZmSetting.BRIEFCASE_ENABLED;
	ZmKeyMap.ACTION_PRECONDITION[ZmKeyMap.MAP_GLOBAL][ZmKeyMap.GOTO_CALENDAR]		= ZmSetting.CALENDAR_ENABLED;
	ZmKeyMap.ACTION_PRECONDITION[ZmKeyMap.MAP_GLOBAL][ZmKeyMap.GOTO_CONTACTS]		= ZmSetting.CONTACTS_ENABLED;
	ZmKeyMap.ACTION_PRECONDITION[ZmKeyMap.MAP_GLOBAL][ZmKeyMap.GOTO_MAIL]			= ZmSetting.MAIL_ENABLED;
	ZmKeyMap.ACTION_PRECONDITION[ZmKeyMap.MAP_GLOBAL][ZmKeyMap.GOTO_OPTIONS]		= ZmSetting.OPTIONS_ENABLED;
	ZmKeyMap.ACTION_PRECONDITION[ZmKeyMap.MAP_GLOBAL][ZmKeyMap.GOTO_TASKS]			= ZmSetting.TASKS_ENABLED;
	ZmKeyMap.ACTION_PRECONDITION[ZmKeyMap.MAP_GLOBAL][ZmKeyMap.GOTO_VOICE]			= ZmSetting.VOICE_ENABLED;
	ZmKeyMap.ACTION_PRECONDITION[ZmKeyMap.MAP_GLOBAL][ZmKeyMap.NEW_APPT]			= ZmSetting.CALENDAR_ENABLED;
	ZmKeyMap.ACTION_PRECONDITION[ZmKeyMap.MAP_GLOBAL][ZmKeyMap.NEW_BRIEFCASEITEM]	= ZmSetting.BRIEFCASE_ENABLED;
	ZmKeyMap.ACTION_PRECONDITION[ZmKeyMap.MAP_GLOBAL][ZmKeyMap.NEW_CALENDAR]		= ZmSetting.CALENDAR_ENABLED;
	ZmKeyMap.ACTION_PRECONDITION[ZmKeyMap.MAP_GLOBAL][ZmKeyMap.NEW_CONTACT]			= ZmSetting.CONTACTS_ENABLED;
	ZmKeyMap.ACTION_PRECONDITION[ZmKeyMap.MAP_GLOBAL][ZmKeyMap.NEW_FILE]			= ZmSetting.BRIEFCASE_ENABLED;
    ZmKeyMap.ACTION_PRECONDITION[ZmKeyMap.MAP_GLOBAL][ZmKeyMap.NEW_DOC]				= ZmSetting.DOCS_ENABLED;    
	ZmKeyMap.ACTION_PRECONDITION[ZmKeyMap.MAP_GLOBAL][ZmKeyMap.NEW_FOLDER]			= ZmSetting.MAIL_ENABLED;
	ZmKeyMap.ACTION_PRECONDITION[ZmKeyMap.MAP_GLOBAL][ZmKeyMap.NEW_MESSAGE]			= ZmSetting.MAIL_ENABLED;
	ZmKeyMap.ACTION_PRECONDITION[ZmKeyMap.MAP_GLOBAL][ZmKeyMap.NEW_MESSAGE_WIN]		= ZmSetting.MAIL_ENABLED;
	ZmKeyMap.ACTION_PRECONDITION[ZmKeyMap.MAP_GLOBAL][ZmKeyMap.NEW_TAG]				= ZmSetting.TAGGING_ENABLED;
	ZmKeyMap.ACTION_PRECONDITION[ZmKeyMap.MAP_GLOBAL][ZmKeyMap.NEW_TASK]			= ZmSetting.TASKS_ENABLED;
	ZmKeyMap.ACTION_PRECONDITION[ZmKeyMap.MAP_GLOBAL][ZmKeyMap.SAVED_SEARCH]		= ZmSetting.SAVED_SEARCHES_ENABLED;
	ZmKeyMap.ACTION_PRECONDITION[ZmKeyMap.MAP_GLOBAL][ZmKeyMap.TAG]					= ZmSetting.TAGGING_ENABLED;
	ZmKeyMap.ACTION_PRECONDITION[ZmKeyMap.MAP_GLOBAL][ZmKeyMap.UNTAG]				= ZmSetting.TAGGING_ENABLED;

	ZmKeyMap.ACTION_PRECONDITION[ZmKeyMap.MAP_COMPOSE] = {};
	ZmKeyMap.ACTION_PRECONDITION[ZmKeyMap.MAP_COMPOSE][ZmKeyMap.ADDRESS_PICKER]		= ZmSetting.CONTACTS_ENABLED;
	ZmKeyMap.ACTION_PRECONDITION[ZmKeyMap.MAP_COMPOSE][ZmKeyMap.HTML_FORMAT]		= ZmSetting.HTML_COMPOSE_ENABLED;
	ZmKeyMap.ACTION_PRECONDITION[ZmKeyMap.MAP_COMPOSE][ZmKeyMap.NEW_WINDOW]			= ZmSetting.NEW_WINDOW_COMPOSE;
	ZmKeyMap.ACTION_PRECONDITION[ZmKeyMap.MAP_COMPOSE][ZmKeyMap.SAVE]				= ZmSetting.SAVE_DRAFT_ENABLED;

	ZmKeyMap.ACTION_PRECONDITION[ZmKeyMap.MAP_EDIT_APPOINTMENT] = {};
	ZmKeyMap.ACTION_PRECONDITION[ZmKeyMap.MAP_EDIT_APPOINTMENT][ZmKeyMap.HTML_FORMAT]	= ZmSetting.HTML_COMPOSE_ENABLED;

    ZmKeyMap.ACTION_PRECONDITION[ZmKeyMap.MAP_CALENDAR] = {};
	ZmKeyMap.ACTION_PRECONDITION[ZmKeyMap.MAP_CALENDAR][ZmKeyMap.CAL_FB_VIEW]		= ZmSetting.FREE_BUSY_VIEW_ENABLED;
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
ZmKeyMap.prototype._checkMap = function(mapName) {

	var result = this._checkedMap[mapName] = appCtxt.checkPrecondition(ZmKeyMap.MAP_PRECONDITION[mapName]);
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
ZmKeyMap.prototype._checkAction = function(mapName, action) {

	if (this._checkedMap[mapName] === false || (!this._checkedMap[mapName] && !this._checkMap(mapName))) {
		return false;
	}

	var mapPre = ZmKeyMap.ACTION_PRECONDITION[mapName];
	return appCtxt.checkPrecondition(mapPre && mapPre[action]);
};
