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

// key map names not tied to controllers
ZmKeyMap.GLOBAL_KEYMAP	= "Global";
ZmKeyMap.TABVIEW_KEYMAP	= "TabView";

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
ZmKeyMap.GOTO_IM			= "GoToIm";
ZmKeyMap.GOTO_INBOX			= "GoToInbox";
ZmKeyMap.GOTO_MAIL			= "GoToMail";
ZmKeyMap.GOTO_NEXT_TAB		= "NextTab";
ZmKeyMap.GOTO_NOTEBOOK		= "GoToNotebook";
ZmKeyMap.GOTO_OPTIONS		= "GoToOptions";
ZmKeyMap.GOTO_PREV_TAB		= "PrevTab";
ZmKeyMap.GOTO_SENT			= "GoToSent";
ZmKeyMap.GOTO_TAB1			= "GoToTab1";
ZmKeyMap.GOTO_TAB2			= "GoToTab2";
ZmKeyMap.GOTO_TAB3			= "GoToTab3";
ZmKeyMap.GOTO_TAB4			= "GoToTab4";
ZmKeyMap.GOTO_TAB5			= "GoToTab5";
ZmKeyMap.GOTO_TRASH			= "GoToTrash";
ZmKeyMap.HTML_FORMAT		= "HtmlFormat";
ZmKeyMap.LOGOFF				= "LogOff";
ZmKeyMap.MARK_READ			= "MarkRead";
ZmKeyMap.MARK_UNREAD		= "MarkUnread";
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
ZmKeyMap.SEND				= "Send";
ZmKeyMap.SHOW_FRAGMENT		= "ShowFragment";
ZmKeyMap.SPAM				= "Spam";
ZmKeyMap.SPELLCHECK			= "Spellcheck";
ZmKeyMap.TAG1				= "ToggleTag1";
ZmKeyMap.TAG2				= "ToggleTag2";
ZmKeyMap.TAG3				= "ToggleTag3";
ZmKeyMap.TAG4				= "ToggleTag4";
ZmKeyMap.TAG5				= "ToggleTag5";
ZmKeyMap.TAG6				= "ToggleTag6";
ZmKeyMap.TAG7				= "ToggleTag7";
ZmKeyMap.TAG8				= "ToggleTag8";
ZmKeyMap.TAG9				= "ToggleTag9";
ZmKeyMap.TODAY				= "Today";
ZmKeyMap.UNTAG				= "Untag";
ZmKeyMap.VIEW_BY_CONV		= "ViewByConversation";
ZmKeyMap.VIEW_BY_MSG		= "ViewByMessage";
