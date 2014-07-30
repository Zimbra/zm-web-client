/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2005, 2006, 2007, 2009, 2010, 2013, 2014 Zimbra, Inc.
 * 
 * The contents of this file are subject to the Common Public Attribution License Version 1.0 (the "License");
 * you may not use this file except in compliance with the License. 
 * You may obtain a copy of the License at: http://www.zimbra.com/license
 * The License is based on the Mozilla Public License Version 1.1 but Sections 14 and 15 
 * have been added to cover use of software over a computer network and provide for limited attribution 
 * for the Original Developer. In addition, Exhibit A has been modified to be consistent with Exhibit B. 
 * 
 * Software distributed under the License is distributed on an "AS IS" basis, 
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. 
 * See the License for the specific language governing rights and limitations under the License. 
 * The Original Code is Zimbra Open Source Web Client. 
 * The Initial Developer of the Original Code is Zimbra, Inc. 
 * All portions of the code are Copyright (C) 2005, 2006, 2007, 2009, 2010, 2013, 2014 Zimbra, Inc. All Rights Reserved. 
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
function(chat, background) {
	this.add(chat); // , this._sortIndex(item));
	this._notify(ZmEvent.E_CREATE, {items: [chat], background: background});
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

ZmChatList.prototype.getChatByRosterAddr = function(addr, autoCreate, background) {
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
	this.addChat(chat, background);
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
