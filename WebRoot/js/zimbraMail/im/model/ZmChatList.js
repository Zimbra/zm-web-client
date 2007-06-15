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
 * Portions created by Zimbra are Copyright (C) 2005, 2006 Zimbra, Inc.
 * All Rights Reserved.
 * 
 * Contributor(s):
 * 
 * ***** END LICENSE BLOCK *****
 */
ZmChatList = function(appCtxt, roster) {
	ZmList.call(this, ZmItem.CHAT, appCtxt);
	this._roster = roster;
};

ZmChatList.prototype = new ZmList;
ZmChatList.prototype.constructor = ZmChatList;

ZmChatList.prototype.toString = 
function() {
	return "ZmChatList";
};

// ZmList.prototype.add(chat);
// ZmList.prototype.remove(chat);

ZmChatList.prototype.addChat =
function(chat) {
	this.add(chat); // , this._sortIndex(item));
	this._notify(ZmEvent.E_CREATE, {items: [chat]});
};

ZmChatList.prototype.removeChat =
function(chat) {
	this.remove(chat); // , this._sortIndex(item));
	this._notify(ZmEvent.E_DELETE, {items: [chat]});
};

ZmChatList.prototype.getChatByRosterAddr = function(addr, autoCreate) {
	var list = this.getArray();
	for (var i=0; i < list.length; i++) {
		var chat = list[i];
		if (chat.getRosterSize() == 1 && chat.hasRosterAddr(addr)) return chat;
	}
	if (!autoCreate)
		return null;

	var item = this._roster.getRosterItem(addr);
	if (item == null) {
		// not in our buddy list, create temp
		var presence = new ZmRosterPresence(ZmRosterPresence.SHOW_UNKNOWN);
		item = new ZmRosterItem(addr, this, this._appCtxt, addr, presence, null);
	}
	chat = new ZmChat(Dwt.getNextId(), item.getDisplayName(), this._appCtxt, this);
	chat.addRosterItem(item);
	// listeners take care of rest...
	this.addChat(chat);
	return chat;
};

ZmChatList.prototype.getChatsByRosterAddr = function(addr) {
	var results = [];
	var list = this.getArray();
	for (var i=0; i < list.length; i++) {
		var chat = list[i];
		if (chat.hasRosterAddr(addr)) results.push(chat);
	}
	return results;
};

ZmChatList.prototype.getChatByThread =
function(thread) {
    var list = this.getArray();
	for (var i=0; i < list.length; i++) {
	    var chat = list[i];
	    if (chat.getThread() == thread) return chat;
	}
	return null;
};
