/*
 * ***** BEGIN LICENSE BLOCK *****
 *
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2005, 2006, 2007 Zimbra, Inc.
 *
 * The contents of this file are subject to the Yahoo! Public License
 * Version 1.0 ("License"); you may not use this file except in
 * compliance with the License.  You may obtain a copy of the License at
 * http://www.zimbra.com/license.
 *
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied.
 *
 * ***** END LICENSE BLOCK *****
 */
ZmChatList = function(roster) {
	ZmList.call(this, ZmItem.CHAT);
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

ZmChatList.prototype.getChatByRosterItem = function(item, autoCreate) {
        var addr = item.getAddress();
        if (!item.isDefaultBuddy())
                return this.getChatByRosterAddr(addr, autoCreate);
        var list = this.getArray();
        var chat;
	for (var i = 0; i < list.length; i++) {
		chat = list[i];
		if (chat.getRosterSize() == 1 && chat.hasRosterAddr(addr))
                        return chat;
	}
        if (!autoCreate)
                return null;
        chat = new ZmChat(Dwt.getNextId(), item.getDisplayName(), this);
        chat.addRosterItem(item);
        this.addChat(chat);
        return chat;
};

ZmChatList.prototype.getChatByRosterAddr = function(addr, autoCreate) {
	var list = this.getArray();
        var chat;
	for (var i=0; i < list.length; i++) {
		chat = list[i];
		if (chat.getRosterSize() == 1 && chat.hasRosterAddr(addr)) return chat;
	}
	if (!autoCreate)
		return null;

	var item = this._roster.getRosterItem(addr);
	if (item == null) {
		// not in our buddy list, create temp
		var presence = new ZmRosterPresence(ZmRosterPresence.SHOW_UNKNOWN);
		item = new ZmRosterItem(addr, this, addr, presence, null);
	}
	chat = new ZmChat(Dwt.getNextId(), item.getDisplayName(), this);
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
