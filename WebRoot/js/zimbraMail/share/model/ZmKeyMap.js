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
* Creates a key mapping.
* @constructor
* @class
* 
* @author Ross Dargahi
*/
function ZmKeyMap() {
	DwtKeyMap.call(this);

	this._map["ZmGlobal"] = {
		
			"Ctrl+Q":				ZmKeyMap.ASSISTANT,
			
//			"Alt+Shift+Esc":		ZmKeyMap.LOGOFF,

			"Shift+D,0":			ZmKeyMap.DBG_NONE,
			"Shift+D,1":			ZmKeyMap.DBG_1,
			"Shift+D,2":			ZmKeyMap.DBG_2,
			"Shift+D,3":			ZmKeyMap.DBG_3,
			"Shift+D,t":			ZmKeyMap.DBG_TIMING,

			"N":					ZmKeyMap.NEW,
			"N,A":					ZmKeyMap.NEW_APPT,
			"N,L":					ZmKeyMap.NEW_CALENDAR,
			"N,C":					ZmKeyMap.NEW_CONTACT,
			"N,F":					ZmKeyMap.NEW_FOLDER,
			"N,M":					ZmKeyMap.NEW_MESSAGE,
			"N,T":					ZmKeyMap.NEW_TAG,

			"S":					ZmKeyMap.SAVE,

			"Del":					ZmKeyMap.DEL,
			"Backspace":			ZmKeyMap.DEL, // MacBook keyboard

			"Esc":					ZmKeyMap.CANCEL,

			"ArrowRight":			ZmKeyMap.NEXT_PAGE,
			"ArrowLeft":			ZmKeyMap.PREV_PAGE
	};
	
	this._map["ZmComposeView"] = {
			"Esc":					ZmKeyMap.CANCEL,
			"Shift+S":				ZmKeyMap.SEND
	};
	
	this._map["ZmMailListView"] = {
			"INHERIT": "DwtListView, ZmGlobal",
			"R":					ZmKeyMap.REPLY,
			"A":					ZmKeyMap.REPLY_ALL,
			"M,R":					ZmKeyMap.MARK_READ,
			"M,U":					ZmKeyMap.MARK_UNREAD
	};
	
	this._map["ZmConvView"] = {
			"INHERIT": "ZmMailListView",
			"Shift+ArrowRight":		ZmKeyMap.NEXT_CONV,
			"Shift+ArrowLeft":		ZmKeyMap.PREV_CONV
	};
};

ZmKeyMap.prototype = new DwtKeyMap(true);
ZmKeyMap.prototype.constructor = ZmKeyMap;

// Action codes
var i = 1;

ZmKeyMap.ASSISTANT		= i++;
ZmKeyMap.CANCEL			= i++;
ZmKeyMap.DBG_NONE		= i++;
ZmKeyMap.DBG_1			= i++;
ZmKeyMap.DBG_2			= i++;
ZmKeyMap.DBG_3			= i++;
ZmKeyMap.DBG_TIMING		= i++;
ZmKeyMap.DEL			= i++;
ZmKeyMap.LOGOFF			= i++;
ZmKeyMap.MARK_READ		= i++;
ZmKeyMap.MARK_UNREAD	= i++;
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
ZmKeyMap.REPLY			= i++;
ZmKeyMap.REPLY_ALL		= i++;
ZmKeyMap.SAVE			= i++;
ZmKeyMap.SEND			= i++;

delete i;

