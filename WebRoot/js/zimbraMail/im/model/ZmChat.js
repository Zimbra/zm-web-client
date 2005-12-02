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

function ZmChat(id, appCtxt, chatList) {
//	if (id == null) id = rosterItem.getAddress() + "_chat";
	if (chatList == null) chatList = appCtxt.getApp(ZmZimbraMail.IM_APP).getChatList();
	ZmItem.call(this, appCtxt, ZmItem.CHAT, id, chatList);
	this._evt = new ZmEvent(ZmEvent.S_CHAT);
	this._chatEntries = [];
	this._rosterItemList = new ZmRosterItemList(appCtxt);
	this._isGroupChat = false;
}

ZmChat.prototype = new ZmItem;
ZmChat.prototype.constructor = ZmChat;

ZmChat.prototype.toString = 
function() {
	return "ZmChat: id = " + this.id;
}

ZmChat.prototype._getRosterItemList =
function() {
    return this._rosterItemList;
};

ZmChat.prototype.addRosterItem =
function(item) {
    this._rosterItemList.addItem(item);
};

ZmChat.prototype.getRosterSize = 
function() {
    return this._rosterItemList.size();
};

ZmChat.prototype.isGroupChat =
function() {
    return this._isGroupChat;
};

ZmChat.prototype.setGroupChat =
function(groupChat) {
    this._isGroupChat = groupChat;
};

ZmChat.prototype.hasRosterItem = 
function(item) {
    return this._rosterItemList.getByAddr(item.getAddress());
};

// TODO: remove!
ZmChat.prototype.getRosterItem = 
function() {
    return this._rosterItemList.getArray()[0];
};

ZmChat.prototype.getIcon =
function() {
    
};

ZmChat.prototype.getTitle =
function() {
    
};

ZmChat.prototype.getStatusTitle =
function() {
    
};
