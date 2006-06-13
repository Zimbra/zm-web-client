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

	this._map["ZmGlobal"] = {
		
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
			"N,T":					ZmKeyMap.NEW_TAG,

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
			"Backspace":			ZmKeyMap.DEL, // MacBook keyboard

			"Esc":					ZmKeyMap.CANCEL,

			"ArrowRight":			ZmKeyMap.NEXT_PAGE,
			"ArrowLeft":			ZmKeyMap.PREV_PAGE
	};
	
	this._map["ZmComposeController"] = {
			"Esc":					ZmKeyMap.CANCEL,
			"Alt+A":				ZmKeyMap.ATTACHMENT,
			"Alt+S":				ZmKeyMap.SEND,
			"Alt+D":				ZmKeyMap.SAVE,
			"Alt+H":				ZmKeyMap.HTML_FORMAT,
			"Alt+L":				ZmKeyMap.SPELLCHECK
	};
	
	this._map["ZmMailListController"] = {

			"INHERIT": "ZmGlobal",

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
			"Shift+.,J":			ZmKeyMap.MOVE_TO_JUNK
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

			"INHERIT": "ZmGlobal",
			
			"E":					ZmKeyMap.EDIT
	};
	
	this._map["ZmMixedController"] = {
			"INHERIT": "ZmMailListController"
	};
};

ZmKeyMap.prototype = new DwtKeyMap(true);
ZmKeyMap.prototype.constructor = ZmKeyMap;

// Action codes
var i = 1;

ZmKeyMap.ASSISTANT		= i++;
ZmKeyMap.ATTACHMENT		= i++;
ZmKeyMap.CANCEL			= i++;
ZmKeyMap.DBG_NONE		= i++;
ZmKeyMap.DBG_1			= i++;
ZmKeyMap.DBG_2			= i++;
ZmKeyMap.DBG_3			= i++;
ZmKeyMap.DBG_TIMING		= i++;
ZmKeyMap.DEL			= i++;
ZmKeyMap.EDIT			= i++;
ZmKeyMap.FLAG			= i++;
ZmKeyMap.FORWARD		= i++;
ZmKeyMap.FORWARD_ATT	= i++;
ZmKeyMap.FORWARD_INLINE	= i++;
ZmKeyMap.GOTO_CALENDAR	= i++;
ZmKeyMap.GOTO_CONTACTS	= i++;
ZmKeyMap.GOTO_DRAFTS	= i++;
ZmKeyMap.GOTO_IM		= i++;
ZmKeyMap.GOTO_INBOX		= i++;
ZmKeyMap.GOTO_MAIL		= i++;
ZmKeyMap.GOTO_NOTEBOOK	= i++;
ZmKeyMap.GOTO_OPTIONS	= i++;
ZmKeyMap.GOTO_SENT		= i++;
ZmKeyMap.GOTO_TRASH		= i++;
ZmKeyMap.HTML_FORMAT	= i++;
ZmKeyMap.LOGOFF			= i++;
ZmKeyMap.MARK_READ		= i++;
ZmKeyMap.MARK_UNREAD	= i++;
ZmKeyMap.MOVE_TO_INBOX	= i++;
ZmKeyMap.MOVE_TO_JUNK	= i++;
ZmKeyMap.MOVE_TO_TRASH	= i++;
ZmKeyMap.NEW			= i++;
ZmKeyMap.NEW_APPT		= i++;
ZmKeyMap.NEW_CALENDAR	= i++;
ZmKeyMap.NEW_CONTACT	= i++;
ZmKeyMap.NEW_FOLDER		= i++;
ZmKeyMap.NEW_MESSAGE	= i++;
ZmKeyMap.NEW_TAG		= i++;
ZmKeyMap.NEXT_CONV		= i++;
ZmKeyMap.NEXT_PAGE		= i++;
ZmKeyMap.PREV_CONV		= i++;
ZmKeyMap.PREV_PAGE		= i++;
ZmKeyMap.PRINT			= i++;
ZmKeyMap.PRINT_ALL		= i++;
ZmKeyMap.REPLY			= i++;
ZmKeyMap.REPLY_ALL		= i++;
ZmKeyMap.SAVE			= i++;
ZmKeyMap.SEND			= i++;
ZmKeyMap.SPAM			= i++;
ZmKeyMap.SPELLCHECK		= i++;

delete i;

