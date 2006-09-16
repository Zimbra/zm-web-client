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
 * Creates a key mapping for the ZCS application.
 * @constructor
 * @class
 * This class maps keys to actions for the ZCS application. There is a global key map
 * with bindings that apply to any key not handled by the current controller; these
 * global bindings apply across applications (mail, contacts, etc). Key bindings that
 * are context-dependent are tied to a particular controller. If that controller has
 * control, then those bindings will be used.
 * 
 * @author Ross Dargahi
 */
function ZmKeyMap() {
	DwtKeyMap.call(this);

	this._map[ZmKeyMap.GLOBAL_KEYMAP] = {
		
			"`":					ZmKeyMap.ASSISTANT,
			"Shift+`":				ZmKeyMap.ASSISTANT,
			
//			"Alt+Shift+Esc":		ZmKeyMap.LOGOFF,

			"Alt+Shift+D,0":		ZmKeyMap.DBG_NONE,
			"Alt+Shift+D,1":		ZmKeyMap.DBG_1,
			"Alt+Shift+D,2":		ZmKeyMap.DBG_2,
			"Alt+Shift+D,3":		ZmKeyMap.DBG_3,
			"Alt+Shift+D,t":		ZmKeyMap.DBG_TIMING,

			"N":					ZmKeyMap.NEW,
			"N,A":					ZmKeyMap.NEW_APPT,
			"N,L":					ZmKeyMap.NEW_CALENDAR,
			"N,C":					ZmKeyMap.NEW_CONTACT,
			"N,F":					ZmKeyMap.NEW_FOLDER,
			"N,M":					ZmKeyMap.NEW_MESSAGE,
			"N,P":					ZmKeyMap.NEW_PAGE,
			"N,T":					ZmKeyMap.NEW_TAG,
			"N,W":					ZmKeyMap.NEW_NOTEBOOK,

			"G,M":					ZmKeyMap.GOTO_MAIL,
			"G,A":					ZmKeyMap.GOTO_CONTACTS,
			"G,C":					ZmKeyMap.GOTO_CALENDAR,
			"G,I":					ZmKeyMap.GOTO_IM,
			"G,N":					ZmKeyMap.GOTO_NOTEBOOK,
			"G,O":					ZmKeyMap.GOTO_OPTIONS,

			"P":					ZmKeyMap.PRINT,
			"P,A":					ZmKeyMap.PRINT_ALL,
			"S":					ZmKeyMap.SAVE,

			"Del":					ZmKeyMap.DEL,
			"Esc":					ZmKeyMap.CANCEL,

			"ArrowRight":			ZmKeyMap.NEXT_PAGE,
			"ArrowLeft":			ZmKeyMap.PREV_PAGE,
			
			"G,1":					ZmKeyMap.TAG1,
			"G,2":					ZmKeyMap.TAG2,
			"G,3":					ZmKeyMap.TAG3,
			"G,4":					ZmKeyMap.TAG4,
			"G,5":					ZmKeyMap.TAG5,
			"G,6":					ZmKeyMap.TAG6,
			"G,7":					ZmKeyMap.TAG7,
			"G,8":					ZmKeyMap.TAG8,
			"G,9":					ZmKeyMap.TAG9,
			"U":					ZmKeyMap.UNTAG
	};
	
	if (AjxEnv.isMac) {
		this._map[ZmKeyMap.GLOBAL_KEYMAP]["Backspace"] = ZmKeyMap.DEL;	// MacBook keyboard
	}
	
	// for these to work, controller must implement getTabView()
	this._map[ZmKeyMap.TABVIEW_KEYMAP] = {
			"Alt+ArrowRight":		ZmKeyMap.GOTO_NEXT_TAB,
			"Alt+ArrowLeft":		ZmKeyMap.GOTO_PREV_TAB,
			"Alt+1":				ZmKeyMap.GOTO_TAB1,
			"Alt+2":				ZmKeyMap.GOTO_TAB2,
			"Alt+3":				ZmKeyMap.GOTO_TAB3,
			"Alt+4":				ZmKeyMap.GOTO_TAB4,
			"Alt+5":				ZmKeyMap.GOTO_TAB5,
			"Alt+6":				ZmKeyMap.GOTO_TAB6,
			"Alt+7":				ZmKeyMap.GOTO_TAB7,
			"Alt+8":				ZmKeyMap.GOTO_TAB8,
			"Alt+9":				ZmKeyMap.GOTO_TAB9
	};
	
	this._map["ZmComposeController"] = {
			"Esc":					ZmKeyMap.CANCEL,
			"Alt+A":				ZmKeyMap.ATTACHMENT,
			"Alt+S":				ZmKeyMap.SEND,
			"Alt+D":				ZmKeyMap.SAVE,
			"Alt+H":				ZmKeyMap.HTML_FORMAT,
			"Alt+L":				ZmKeyMap.SPELLCHECK,
			"Alt+W":				ZmKeyMap.NEW_WINDOW,
			"Alt+T":				ZmKeyMap.ADDRESS_PICKER
	};
	
	this._map["ZmMailListController"] = {

			"INHERIT": ZmKeyMap.GLOBAL_KEYMAP,

			"R":					ZmKeyMap.REPLY,
			"A":					ZmKeyMap.REPLY_ALL,
			"R,S":					ZmKeyMap.REPLY,
			"R,A":					ZmKeyMap.REPLY_ALL,

			"F":					ZmKeyMap.FORWARD,
			"F,I":					ZmKeyMap.FORWARD_INLINE,
			"F,A":					ZmKeyMap.FORWARD_ATT,

			"M,R":					ZmKeyMap.MARK_READ,
			"M,U":					ZmKeyMap.MARK_UNREAD,
			"M,F":					ZmKeyMap.FLAG,

			"I":					ZmKeyMap.GOTO_INBOX,
			"D":					ZmKeyMap.GOTO_DRAFTS,
			"S":					ZmKeyMap.GOTO_SENT,
			"T":					ZmKeyMap.GOTO_TRASH,
			
			"O":					DwtKeyMap.DBLCLICK,
			
			"Shift+1":				ZmKeyMap.SPAM,

			".,I":					ZmKeyMap.MOVE_TO_INBOX,
			".,T":					ZmKeyMap.MOVE_TO_TRASH,
			".,J":					ZmKeyMap.MOVE_TO_JUNK,
			"Shift+.,I":			ZmKeyMap.MOVE_TO_INBOX,
			"Shift+.,T":			ZmKeyMap.MOVE_TO_TRASH,
			"Shift+.,J":			ZmKeyMap.MOVE_TO_JUNK,
			
			"V,C":					ZmKeyMap.VIEW_BY_CONV,
			"V,M":					ZmKeyMap.VIEW_BY_MSG,
			"R,P":					ZmKeyMap.READING_PANE
	};
	
	this._map["ZmConvController"] = {

			"INHERIT": "ZmMailListController",

			"Shift+ArrowRight":		ZmKeyMap.NEXT_CONV,
			"Shift+ArrowLeft":		ZmKeyMap.PREV_CONV
	};
	
	this._map["ZmMsgController"] = {

			"INHERIT": "ZmMailListController"
	};
		
	this._map["ZmContactListController"] = {

			"INHERIT": ZmKeyMap.GLOBAL_KEYMAP,
			
			"E":					ZmKeyMap.EDIT
	};

	this._map["ZmContactController"] = {

			"Esc":					ZmKeyMap.CANCEL,
			"Alt+S":				ZmKeyMap.SAVE
	};

	this._map["ZmCalViewController"] = {

			"INHERIT": ZmKeyMap.GLOBAL_KEYMAP,
			
			"D":					ZmKeyMap.CAL_DAY_VIEW,
			"1":					ZmKeyMap.CAL_DAY_VIEW,
			"W":					ZmKeyMap.CAL_WEEK_VIEW,
			"7":					ZmKeyMap.CAL_WEEK_VIEW,
			"W,W":					ZmKeyMap.CAL_WORK_WEEK_VIEW,
			"5":					ZmKeyMap.CAL_WORK_WEEK_VIEW,
			"M":					ZmKeyMap.CAL_MONTH_VIEW,
			"3":					ZmKeyMap.CAL_MONTH_VIEW,
			"S":					ZmKeyMap.CAL_SCHEDULE_VIEW,
			"0":					ZmKeyMap.CAL_SCHEDULE_VIEW,
			
			"E":					ZmKeyMap.EDIT,
			"Q":					ZmKeyMap.QUICK_ADD,
			"R":					ZmKeyMap.REFRESH,
			"T":					ZmKeyMap.TODAY
	};

	this._map["ZmApptComposeController"] = {

			"INHERIT": ZmKeyMap.TABVIEW_KEYMAP,

			"Esc":					ZmKeyMap.CANCEL,
			"Alt+A":				ZmKeyMap.ALL_DAY,
			"Alt+S":				ZmKeyMap.SAVE
	};

	this._map["ZmPrefController"] = {

			"INHERIT": ZmKeyMap.TABVIEW_KEYMAP,

			"Esc":					ZmKeyMap.CANCEL
	};

	this._map["ZmMixedController"] = {

			"INHERIT": ZmKeyMap.GLOBAL_KEYMAP,

			"R":					ZmKeyMap.REPLY,
			"A":					ZmKeyMap.REPLY_ALL,
			"R,S":					ZmKeyMap.REPLY,
			"R,A":					ZmKeyMap.REPLY_ALL,

			"F":					ZmKeyMap.FORWARD,
			"F,I":					ZmKeyMap.FORWARD_INLINE,
			"F,A":					ZmKeyMap.FORWARD_ATT,

			"M,F":					ZmKeyMap.FLAG,

			"I":					ZmKeyMap.GOTO_INBOX,
			"D":					ZmKeyMap.GOTO_DRAFTS,
			"S":					ZmKeyMap.GOTO_SENT,
			"T":					ZmKeyMap.GOTO_TRASH,
			
			"O":					DwtKeyMap.DBLCLICK,
			
			".,I":					ZmKeyMap.MOVE_TO_INBOX,
			".,T":					ZmKeyMap.MOVE_TO_TRASH,
			".,J":					ZmKeyMap.MOVE_TO_JUNK,
			"Shift+.,I":			ZmKeyMap.MOVE_TO_INBOX,
			"Shift+.,T":			ZmKeyMap.MOVE_TO_TRASH,
			"Shift+.,J":			ZmKeyMap.MOVE_TO_JUNK
	};

	this._map["ZmNotebookPageController"] = {
			"INHERIT": ZmKeyMap.GLOBAL_KEYMAP,

			"E":					ZmKeyMap.EDIT,
			"R":					ZmKeyMap.REFRESH	
	};
};

ZmKeyMap.prototype = new DwtKeyMap(true);
ZmKeyMap.prototype.constructor = ZmKeyMap;

// key map names not tied to controllers
ZmKeyMap.GLOBAL_KEYMAP	= "Global";
ZmKeyMap.TABVIEW_KEYMAP	= "TabView";

// Action codes
ZmKeyMap.ADDRESS_PICKER		= "ShowAddressPicker";
ZmKeyMap.ALL_DAY			= "ToggleAllDay";
ZmKeyMap.ASSISTANT			= "ShowAssistant";
ZmKeyMap.ATTACHMENT			= "AddAttachment";
ZmKeyMap.CAL_DAY_VIEW		= "CalendarDayView";
ZmKeyMap.CAL_MONTH_VIEW		= "CalendarMonthView";
ZmKeyMap.CAL_SCHEDULE_VIEW	= "CalendarScheduleView";
ZmKeyMap.CAL_WEEK_VIEW		= "CalendarWeekView";
ZmKeyMap.CAL_WORK_WEEK_VIEW	= "CalendarWorkWeekView";
ZmKeyMap.CANCEL				= "Cancel";
ZmKeyMap.DBG_NONE			= "DebugNone";
ZmKeyMap.DBG_1				= "DebugLevel1";
ZmKeyMap.DBG_2				= "DebugLevel2";
ZmKeyMap.DBG_3				= "DebugLevel3";
ZmKeyMap.DBG_TIMING			= "ToggleDebugTiming";
ZmKeyMap.DEL				= "Delete";
ZmKeyMap.EDIT				= "Edit";
ZmKeyMap.FLAG				= "ToggleFlag";
ZmKeyMap.FORWARD			= "Forward";
ZmKeyMap.FORWARD_ATT		= "ForwardAsAttachment";
ZmKeyMap.FORWARD_INLINE		= "ForwardInline";
ZmKeyMap.GOTO_CALENDAR		= "GoToCalendar";
ZmKeyMap.GOTO_CONTACTS		= "GoToContacts";
ZmKeyMap.GOTO_DRAFTS		= "GoToDraftsFolder";
ZmKeyMap.GOTO_IM			= "GoToIM";
ZmKeyMap.GOTO_INBOX			= "GoToInboxFolder";
ZmKeyMap.GOTO_MAIL			= "GoToMail";
ZmKeyMap.GOTO_NEXT_TAB		= "NextTab";
ZmKeyMap.GOTO_NOTEBOOK		= "GoToNotebook";
ZmKeyMap.GOTO_OPTIONS		= "GoToOptions";
ZmKeyMap.GOTO_PREV_TAB		= "PrevTab";
ZmKeyMap.GOTO_SENT			= "GoToSentFolder";
ZmKeyMap.GOTO_TRASH			= "GoToTrashFolder";
ZmKeyMap.HTML_FORMAT		= "ToggleHTMLCompose";
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
ZmKeyMap.NEW_WINDOW			= "OpenInNewWindow";
ZmKeyMap.NEXT_CONV			= "NextConversation";
ZmKeyMap.NEXT_PAGE			= "NextPage";
ZmKeyMap.GOTO_TAB1			= "GoToTab1";
ZmKeyMap.GOTO_TAB2			= "GoToTab2";
ZmKeyMap.GOTO_TAB3			= "GoToTab3";
ZmKeyMap.GOTO_TAB4			= "GoToTab4";
ZmKeyMap.GOTO_TAB5			= "GoToTab5";
ZmKeyMap.PREV_CONV			= "PreviousConversation";
ZmKeyMap.PREV_PAGE			= "PreviousPage";
ZmKeyMap.PRINT				= "Print";
ZmKeyMap.PRINT_ALL			= "PrintAll";
ZmKeyMap.QUICK_ADD			= "QuickAddAppointment";
ZmKeyMap.READING_PANE		= "ToggleReadingPane";
ZmKeyMap.REFRESH			= "Refresh";
ZmKeyMap.REPLY				= "ReplyToSender";
ZmKeyMap.REPLY_ALL			= "ReplyToAll";
ZmKeyMap.SAVE				= "Save";
ZmKeyMap.SEND				= "Send";
ZmKeyMap.SPAM				= "MarkAsSpam";
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
ZmKeyMap.TODAY				= "GoToToday";
ZmKeyMap.UNTAG				= "Untag";
ZmKeyMap.VIEW_BY_CONV		= "ViewByConversation";
ZmKeyMap.VIEW_BY_MSG		= "ViewByMessage";
