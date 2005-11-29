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
*
*/
function ZmChat(buddy, appCtxt, id, list) {
	if (id == null) id = buddy.getAddress() + "_chat";
	var chatList = appCtxt.getApp(ZmZimbraMail.IM_APP).getChatList();
	list = list ? list : chatList;
	ZmItem.call(this, appCtxt, ZmItem.CHAT, id, list);
	this._evt = new ZmEvent(ZmEvent.S_CHAT);
	this._chatEntries = [];
	this.buddy = buddy;
}

ZmChat.prototype = new ZmItem;
ZmChat.prototype.constructor = ZmChat;

ZmChat.prototype.toString = 
function() {
	return "ZmChat: id = " + this.id;
}

ZmChat.idFromBuddy =
function(buddy) {
    return buddy.getAddress() + "_chat";
}

// Public methods
ZmChat.prototype.getBuddy =
function() {
    return this.buddy;
}
