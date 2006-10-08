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
 */
function ZmKeyMap() {
	
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
ZmKeyMap.MAP_NAME["conversation"]		= "ZmConvController";
ZmKeyMap.MAP_NAME["message"]			= "ZmMsgController";
ZmKeyMap.MAP_NAME["contacts"]			= "ZmContactListController";
ZmKeyMap.MAP_NAME["editContact"]		= "ZmContactController";
ZmKeyMap.MAP_NAME["calendar"]			= "ZmCalViewController";
ZmKeyMap.MAP_NAME["editAppointment"]	= "ZmApptComposeController";
ZmKeyMap.MAP_NAME["options"]			= "ZmPrefController";
ZmKeyMap.MAP_NAME["mixed"]				= "ZmMixedController";
ZmKeyMap.MAP_NAME["notebook"]			= "ZmNotebookPageController";
ZmKeyMap.MAP_NAME["tabView"]			= "DwtTabView";

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
ZmKeyMap.FLAG				= "Flag";
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
ZmKeyMap.GOTO_SENT			= "GoToSent";
ZmKeyMap.GOTO_TAG			= "GoToTag";		// takes NNN
ZmKeyMap.GOTO_TRASH			= "GoToTrash";
ZmKeyMap.HTML_FORMAT		= "HtmlFormat";
ZmKeyMap.LOGOFF				= "LogOff";
ZmKeyMap.MARK_READ			= "MarkRead";
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
ZmKeyMap.NEW_NOTEBOOK		= "NewNotebook";
ZmKeyMap.NEW_PAGE			= "NewPage";
ZmKeyMap.NEW_TAG			= "NewTag";
ZmKeyMap.NEW_WINDOW			= "NewWindow";
ZmKeyMap.NEXT_CONV			= "NextConversation";
ZmKeyMap.NEXT_PAGE			= "NextPage";
ZmKeyMap.NEXT_UNREAD		= "NextUnread";
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

/**
 * Creates a shortcut.
 * @constructor
 * @class
 * This class represents a keyboard shortcut that can be saved with a user's
 * preferences. The saved preference takes the form:
 * 
 *     [mapNameA].[actionA].[argA]=[keySequenceA]|[mapNameB].[actionB].[argB]=[keySequenceB]...
 * 
 * For example:
 * 
 *     mail.MoveToFolder4.538=M,4
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
