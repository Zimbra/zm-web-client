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

function ZmChat(id, chatName, appCtxt, chatList) {
//	if (id == null) id = rosterItem.getAddress() + "_chat";
	if (chatList == null) chatList = appCtxt.getApp(ZmApp.IM).getRoster().getChatList();
	ZmItem.call(this, appCtxt, ZmItem.CHAT, id, chatList);
	this._sendMessageCallbackObj = new AjxCallback(this, this._sendMessageCallback);
	this._messages = [];
	this._rosterItemList = new ZmRosterItemList(appCtxt);
	this._isGroupChat = false;
	this._chatName = chatName;
	this._thread = null;
	this._unread = 0;
	this._historyIndex = 0;
};

ZmChat.prototype = new ZmItem;
ZmChat.prototype.constructor = ZmChat;

ZmChat.F_MESSAGE = "ZmChat.message";

ZmChat.prototype.toString =
function() {
	return "ZmChat: id = " + this.id;
};

ZmChat.prototype._getRosterItemList =
function() {
    return this._rosterItemList;
};

ZmChat.prototype.addRosterItem =
function(item) {
    this._rosterItemList.addItem(item);
    this._isGroupChat = this._isGroupChat || (this.getRosterSize() > 1);
};

ZmChat.prototype.getRosterSize =
function() {
    return this._rosterItemList.size();
};

ZmChat.prototype.getName =
function() {
    return this._chatName;
};

ZmChat.prototype.getThread =
function() {
    return this._thread;
};

ZmChat.prototype.setThread =
function(thread) {
    this._thread = thread;
};

// TODO: listeners
ZmChat.prototype.setName =
function(chatName) {
    this._chatName = chatName;
};

// get the display name for a roster item on the list
ZmChat.prototype.getDisplayName =
function(addr, isMe) {
	if (!addr)
		return ZmMsg.imSystem;
	try {
		var buddies = AjxDispatcher.run("GetRoster");
		return buddies.getRosterItem(addr).getDisplayName();
	} catch (ex) {
		var ri = isMe ? null : this._rosterItemList.getByAddr(addr);
		var dname = ri ? ri.getDisplayName() : addr;
		if (isMe || this._rosterItemList.size() == 1) {
			var i = dname.indexOf("@");
			if (i != -1) dname = dname.substring(0, i);
		}
		return dname;
	}
};

ZmChat.prototype.isGroupChat =
function() {
	return this._isGroupChat;
};

ZmChat.prototype.hasRosterAddr =
function(addr) {
	return this._rosterItemList.getByAddr(addr);
};

// TODO: remove suport for index being null!
ZmChat.prototype.getRosterItem =
function(index) {
	if (index == null) index = 0;
	return this._rosterItemList.getArray()[index];
};

ZmChat.prototype.isZimbraAssistant = function() {
	return (this._rosterItemList.size() == 1 &&
		this.getRosterItem(0).getAddress() == ZmAssistantBuddy.ADDR);
};

ZmChat.prototype.getIcon =
function() {
	return this.getRosterItem().getPresence().getIcon();
};

ZmChat.prototype.getTitle =
function() {
	// return this.getRosterItem(0).getDisplayName(); // XXX
	return AjxMessageFormat.format(ZmMsg.chatWith, [ this.getRosterItem(0).getDisplayName() ]);
};

ZmChat.prototype.getStatusTitle =
function() {

};

// add message from notification...
ZmChat.prototype.addMessage =
function(msg) {
	this._messages.push(msg);
	this._historyIndex = this._messages.length;
	var fields = {};
	fields[ZmChat.F_MESSAGE] = msg;
	this._notify(ZmEvent.E_MODIFY, {fields: fields});
	// list notify as well?
};

ZmChat.prototype.resetUnread = function() {
	this._unread = 0;
	if (this.getRosterSize() == 1) {
		this.getRosterItem(0).setUnread(0);
	}
};

ZmChat.prototype.getUnread = function() {
	return this._unread;
};

// can't increment in addMessage because this chat might be visible
// and active, so the message is "instantly read".
ZmChat.prototype.incUnread = function() {
	++this._unread;
	if (this.getRosterSize() == 1) {
		this.getRosterItem(0).setUnread(this._unread);
	}
	return this._unread;
};

/**
 * notify server of a chat close
 */
ZmChat.prototype.sendClose =
function(text) {
	var thread = this.getThread();
	if (!thread) return;
	var soapDoc = AjxSoapDoc.create("IMModifyChatRequest", "urn:zimbraIM");
	var method = soapDoc.getMethod();
	method.setAttribute("thread", thread);
	method.setAttribute("op", "close");
	// TODO: error handling
	this._appCtxt.getAppController().sendRequest({soapDoc: soapDoc, asyncMode: true});
};

/**
 * create item on server.
 */
ZmChat.prototype.sendMessage =
function(text) {
	var soapDoc = AjxSoapDoc.create("IMSendMessageRequest", "urn:zimbraIM");
	var method = soapDoc.getMethod();
	var message = soapDoc.set("message");
	var thread = this.getThread();
	if (thread) 	message.setAttribute("thread", thread);
	message.setAttribute("addr", this.getRosterItem(0).getAddress());
	var body = soapDoc.set("body", text, message);
	// TODO: error handling
	this._appCtxt.getAppController().sendRequest({soapDoc: soapDoc, asyncMode: true, callback: this._sendMessageCallbackObj});
};

ZmChat.prototype.sendByEmail = function() {
	var emails = this._rosterItemList.getVector()
		.map("getContact")
		.map("getEmail")
		.join(AjxEmailAddress.SEPARATOR);
	AjxDispatcher.run("Compose", { action	     : ZmOperation.NEW_MESSAGE,
				       toOverride    : emails,
				       subjOverride  : this.getTitle(),
				       extraBodyText : AjxVector.fromArray(this._messages).map("toText").join("\n")
				     });
};

ZmChat.prototype.getHistory = function(dir) {
	while (true) {
		this._historyIndex += dir;
		if (this._historyIndex < 0)
			this._historyIndex = -1;
		if (this._historyIndex >= this._messages.length)
			this._historyIndex = this._messages.length;
		var msg = this._messages[this._historyIndex];
		if (!msg || msg.fromMe)
			break;
	}
	return msg && msg.body;
};

// stash the thread
ZmChat.prototype._sendMessageCallback =
function(result) {
	try {
		var response = result.getResponse();
		this.setThread(response.IMSendMessageResponse.thread);
	} catch (ex) {
		// TODO: better handling
		this._appCtxt.setStatusMsg(ex, ZmStatusView.LEVEL_CRITICAL, null, null, ZmStatusView.TRANSITION_SLIDE_LEFT);
	}
};
