/*
 * ***** BEGIN LICENSE BLOCK *****
 * Version: ZPL 1.1
 * 
 * The contents of this file are subject to the Zimbra Public License
 * Version 1.1 ("License"); you may not use this file except in
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
 * Portions created by Zimbra are Copyright (C) 2005 Zimbra, Inc.
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
	
	this._map["GLOBAL"] = {
			"Alt+Shift+D,0": ZmKeyMap.DBG_NONE,
			"Alt+Shift+D,1": ZmKeyMap.DBG_1,
			"Alt+Shift+D,2": ZmKeyMap.DBG_2,
			"Alt+Shift+D,3": ZmKeyMap.DBG_3,
			"Alt+Shift+D,t": ZmKeyMap.DBG_TIMING,
			"Alt+N,A": ZmKeyMap.NEW_APPT,
			"Alt+N,L": ZmKeyMap.NEW_CALENDAR,
			"Alt+N,C": ZmKeyMap.NEW_CONTACT,
			"Alt+N,F": ZmKeyMap.NEW_FOLDER,
			"Alt+N,M": ZmKeyMap.NEW_MESSAGE,
			"Alt+N,T": ZmKeyMap.NEW_TAG,
			"Alt+S":   ZmKeyMap.SAVE,
			"Del":     ZmKeyMap.DEL,
			"Esc":     ZmKeyMap.CANCEL,
			"ArrowRight": ZmKeyMap.NEXT_PAGE,
			"ArrowLeft":  ZmKeyMap.PREV_PAGE
	};
	
	this._map["ZmComposeController"] = {
			"Alt+Shift+S": ZmKeyMap.SEND
	};
	
	this._map["ZmConvListController"] = {
		"Alt+R": ZmKeyMap.REPLY,
		"R": ZmKeyMap.REPLY,
		"Alt+Shift+R": ZmKeyMap.REPLY_ALL,
		"A": ZmKeyMap.REPLY_ALL,
	};
	
	this._map["ZmConvController"] = {
		"Alt+R": ZmKeyMap.REPLY,
		"R": ZmKeyMap.REPLY,
		"Alt+Shift+R": ZmKeyMap.REPLY_ALL,
		"A": ZmKeyMap.REPLY_ALL,
		"R": ZmKeyMap.REPLY,
		"Shift+ArrowRight": ZmKeyMap.NEXT_CONV,
		"Shift+ArrowLeft": ZmKeyMap.PREV_CONV
	};
	
	this._map["ZmConvListView"] = {"ALIAS": "DwtListView"};
	this._map["ZmConvView"] = {"ALIAS": "DwtListView"};
};

ZmKeyMap.prototype = new DwtKeyMap(true);
ZmKeyMap.prototype.constructor = ZmKeyMap;

// Key map action code contants
var i = 0;

ZmKeyMap.CANCEL = i++;
ZmKeyMap.DBG_NONE = i++;
ZmKeyMap.DBG_1 = i++;
ZmKeyMap.DBG_2 = i++;
ZmKeyMap.DBG_3 = i++;
ZmKeyMap.DBG_TIMING = i++;
ZmKeyMap.DEL = i++;
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

