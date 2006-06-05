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

	// Note that FF on the mac has an issue reporting the ALT+<keycode> it
	// always ends up reporting undefined for the <keycode>. For this reason I
	// have added Ctrl analogs below	
	this._map["ZmGlobal"] = {
			"Ctrl+Q": ZmKeyMap.ASSISTANT,

			"Alt+Shift+D,0": ZmKeyMap.DBG_NONE,
			"Ctrl+Shift+D,0": ZmKeyMap.DBG_NONE, // Mac issue with Alt+Key

			"Alt+Shift+D,1": ZmKeyMap.DBG_1,
			"Ctrl+Shift+D,1": ZmKeyMap.DBG_1,

			"Alt+Shift+D,2": ZmKeyMap.DBG_2,
			"Ctrl+Shift+D,2": ZmKeyMap.DBG_2,

			"Alt+Shift+D,3": ZmKeyMap.DBG_3,
			"Ctrl+Shift+D,3": ZmKeyMap.DBG_3,

			"Alt+Shift+D,t": ZmKeyMap.DBG_TIMING,
			"Ctrl+Shift+D,t": ZmKeyMap.DBG_TIMING,

			"Alt+N": ZmKeyMap.NEW,
			"Ctrl+N": ZmKeyMap.NEW,
			
			"Alt+N,A": ZmKeyMap.NEW_APPT,
			"Ctrl+N,A": ZmKeyMap.NEW_APPT,

			"Alt+N,L": ZmKeyMap.NEW_CALENDAR,
			"Ctrl+N,L": ZmKeyMap.NEW_CALENDAR,

			"Alt+N,C": ZmKeyMap.NEW_CONTACT,
			"Ctrl+N,C": ZmKeyMap.NEW_CONTACT,

			"Alt+N,F": ZmKeyMap.NEW_FOLDER,
			"Ctrl+N,F": ZmKeyMap.NEW_FOLDER,

			"Alt+N,M": ZmKeyMap.NEW_MESSAGE,
			"Ctrl+N,M": ZmKeyMap.NEW_MESSAGE,

			"Alt+N,T": ZmKeyMap.NEW_TAG,
			"Ctrl+N,T": ZmKeyMap.NEW_TAG,

			"Alt+S":   ZmKeyMap.SAVE,
			"Ctrl+S": ZmKeyMap.SAVE,

			"Del":        ZmKeyMap.DEL,
			"Backspace":  ZmKeyMap.DEL, // MacBook keyboard
			"Esc":        ZmKeyMap.CANCEL,
			"ArrowRight": ZmKeyMap.NEXT_PAGE,
			"ArrowLeft":  ZmKeyMap.PREV_PAGE
	};
	
	this._map["ZmComposeController"] = {
			"Alt+Shift+S": ZmKeyMap.SEND,
			"Ctrl+Shift+S": ZmKeyMap.SEND // Mac
	};
	
	this._map["ZmConvListController"] = {
			"INHERIT": "ZmGlobal",
		"R": ZmKeyMap.REPLY,
		"A": ZmKeyMap.REPLY_ALL,
		"M,R": ZmKeyMap.MARK_READ,
		"M,U": ZmKeyMap.MARK_UNREAD
	};
	
	this._map["ZmConvController"] = {
		"INHERIT": "ZmConvListController",
		"Shift+ArrowRight": ZmKeyMap.NEXT_CONV,
		"Shift+ArrowLeft": ZmKeyMap.PREV_CONV
	};
	
	this._map["ZmTradController"] = {
		"INHERIT": "ZmConvListController"
	};
	
	this._map["ZmDialog"] = {"INHERIT": "DwtDialog"};
	this._map["ZmChangePasswordDialog"] = {"INHERIT": "ZmDialog"};
	this._map["ZmNewTagDialog"] = {"INHERIT": "ZmDialog"};
	
	this._map["ZmConvListView"] = {"INHERIT": "DwtListView"};
	this._map["ZmMailMsgListView"] = {"INHERIT": "DwtListView"};
	this._map["ZmTradView"] = {"INHERIT": "DwtListView"};

	this._map["ZmPopupMenu"] = {"INHERIT": "DwtMenu"};
	this._map["ZmActionMenu"] = {"INHERIT": "DwtMenu"};
	this._map["ZmTagMenu"] = {"INHERIT": "DwtMenu"};
	//this._map["ActionMenu"] = {"INHERIT": "DwtMenu"};
};

ZmKeyMap.prototype = new DwtKeyMap(true);
ZmKeyMap.prototype.constructor = ZmKeyMap;

// Key map action code contants
var i = 0;

ZmKeyMap.ASSISTANT = i++;
ZmKeyMap.CANCEL = i++;
ZmKeyMap.DBG_NONE = i++;
ZmKeyMap.DBG_1 = i++;
ZmKeyMap.DBG_2 = i++;
ZmKeyMap.DBG_3 = i++;
ZmKeyMap.DBG_TIMING = i++;
ZmKeyMap.DEL = i++;
ZmKeyMap.MARK_READ = i++;
ZmKeyMap.MARK_UNREAD = i++;
ZmKeyMap.NEW = i++;
ZmKeyMap.NEW_APPT = i++;
ZmKeyMap.NEW_CALENDAR = i++;
ZmKeyMap.NEW_CONTACT = i++;
ZmKeyMap.NEW_FOLDER = i++;
ZmKeyMap.NEW_MESSAGE = i++;
ZmKeyMap.NEW_TAG = i++;
ZmKeyMap.NEXT_CONV = i++;
ZmKeyMap.NEXT_PAGE = i++;
ZmKeyMap.PREV_CONV = i++;
ZmKeyMap.PREV_PAGE = i++;
ZmKeyMap.SAVE = i++;

ZmKeyMap.REPLY = i++;
ZmKeyMap.REPLY_ALL = i++;
ZmKeyMap.SEND = i++;

delete i;

