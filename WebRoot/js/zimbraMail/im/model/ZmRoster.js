/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2005, 2006 Zimbra, Inc.
 * 
 * The contents of this file are subject to the Yahoo! Public License
 * Version 1.0 ("License"); you may not use this file except in
 * compliance with the License.  You may obtain a copy of the License at
 * http://www.zimbra.com/license.
 * 
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * ***** END LICENSE BLOCK *****
 */

/**
* Create a new, empty appt list.
* @constructor
* @class
* This class represents a list of appts.
*
*/
function ZmRoster(appCtxt, imApp) {
	ZmModel.call(this, ZmEvent.S_ROSTER);
	
	this._appCtxt = appCtxt;
	this.getRosterItemTree(); // pre-create
	this._newRosterItemtoastFormatter = new AjxMessageFormat(ZmMsg.imNewRosterItemToast);	
	this._presenceToastFormatter = new AjxMessageFormat(ZmMsg.imStatusToast);   	
	this._leftChatFormatter = new AjxMessageFormat(ZmMsg.imLeftChat);
	this._imApp = imApp;
}

ZmRoster.prototype = new ZmModel;
ZmRoster.prototype.constructor = ZmRoster;

ZmRoster.F_PRESENCE = "ZmRoster.presence";

ZmRoster.prototype.toString = 
function() {
	return "ZmRoster";
}

ZmRoster.prototype.getChatList =
function() {
	if (!this._chatList)
		this._chatList = new ZmChatList(this._appCtxt, this);
	return this._chatList;
};

ZmRoster.prototype.getMyAddress =
function() {
    if (this._myAddress == null)
		this._myAddress = this._appCtxt.get(ZmSetting.USERNAME);
    return this._myAddress;
};
    
ZmRoster.prototype.getRosterItemTree =
function() {
	if (!this._rosterItemTree) {
		this._rosterItemTree = new ZmFolderTree(this._appCtxt, ZmOrganizer.ROSTER_TREE_ITEM);
		this._appCtxt.setTree(ZmOrganizer.ROSTER_TREE_ITEM, this._rosterItemTree);
	}
	return this._rosterItemTree;
};

ZmRoster.prototype.getRosterItem =
function(addr) {
	return this.getRosterItemList().getByAddr(addr);
}

ZmRoster.prototype.getRosterItemList =
function() {
	if (!this._rosterItemList) {
		this._rosterItemList = new ZmRosterItemList(this._appCtxt);
	}
	return this._rosterItemList;
};

ZmRoster.prototype.getPresence =
function() {
	if (!this._rosterPresence) {
		this._rosterPresence = new ZmRosterPresence();
	}
	return this._rosterPresence;
};

ZmRoster.prototype._notifyPresence =
function() {
	var fields = {};
	fields[ZmRoster.F_PRESENCE] = this.getPresence();
	this._notify(ZmEvent.E_MODIFY, {fields: fields});
};

ZmRoster.prototype.reload =
function() {
	this.getRosterItemList().removeAllItems();
	var soapDoc = AjxSoapDoc.create("IMGetRosterRequest", "urn:zimbraIM");
	var respCallback = new AjxCallback(this, this._handleResponseReload);
	this._appCtxt.getAppController().sendRequest({soapDoc: soapDoc, asyncMode: true, callback: respCallback});
};

ZmRoster.prototype._handleResponseReload =
function(args) {
	var resp = args.getResponse()
	if (!resp || !resp.IMGetRosterResponse) return;
	var roster = resp.IMGetRosterResponse;
	var list = this.getRosterItemList();
	if (roster.items && roster.items.item) {
		var items = roster.items.item;
		for (var i = 0; i < items.length; i++) {
			var item = items[i];
			if (item.subscription == "TO" || item.subscription == "BOTH") {
				var rp = new ZmRosterPresence();
				rp.setFromJS(item.presence);
				var rosterItem = new ZmRosterItem(item.addr, list, this._appCtxt, item.name, rp, item.groups);
				list.addItem(rosterItem);
			}
		}        
	}
	if (roster.presence) {
		this.getPresence().setFromJS(roster.presence);
		this._notifyPresence();
	}
};

/**
 * create item on server.
 */
ZmRoster.prototype.createRosterItem =
function(addr, name, groups) {
    var soapDoc = AjxSoapDoc.create("IMSubscribeRequest", "urn:zimbraIM");
    var method = soapDoc.getMethod();
	method.setAttribute("addr", addr);    
	if (name) method.setAttribute("name", name);
	if (groups) method.setAttribute("groups", groups);
	method.setAttribute("op", "add");
	this._appCtxt.getAppController().sendRequest({soapDoc: soapDoc, asyncMode: true});
};

/**
 * set presence on the server
 */
ZmRoster.prototype.setPresence =
function(show, priority, showStatus) {
	var soapDoc = AjxSoapDoc.create("IMSetPresenceRequest", "urn:zimbraIM");
	var presence = soapDoc.set("presence");
	presence.setAttribute("show", show);
	if (priority) presence.setAttribute("priority", priority);
	if (showStatus) soapDoc.set("status", showStatus, presence);	
	this._appCtxt.getAppController().sendRequest({soapDoc: soapDoc, asyncMode: true});
};

/**
 * handle async notifications. we might need to queue this with timed action and return
 * immediately, since this is happening as a result of a notify header in a response, and
 * we probably don't want to trigger more requests while handling a response.
 */
ZmRoster.prototype.handleNotification =
function(im) {
// do subscribes/unsubscribes before presence...
	if (im.subscribed) {
		for (var i=0; i < im.subscribed.length; i++) {
			var sub = im.subscribed[i];
			if (sub.to) {
				var list = this.getRosterItemList();
				var item = list.getByAddr(sub.to);
				if (item) {
					if (sub.groups) item._notifySetGroups(sub.groups); // should optimize
					if (sub.name && sub.name != item.getName()) item._notifySetName(sub.name);
					// mod
				} else {
					// create
					var item = new ZmRosterItem(sub.to, list, this._appCtxt, sub.name, null, sub.groups);
					list.addItem(item);
					var toast = this._newRosterItemtoastFormatter.format([item.getDisplayName()]);
					this._appCtxt.setStatusMsg(toast, null, null, null, ZmStatusView.TRANSITION_SLIDE_LEFT);
				}
			} else if (sub.from) {
			    // toast, should we user if they want to add user if they aren't in buddy list?
			}
		}
	}
	if (im.unsubscribed) {
		for (var i=0; i < im.unsubscribed.length; i++) {
			var unsub = im.unsubscribed[i];
			if (unsub.to) {
				var list = this.getRosterItemList();
				var item = list.getByAddr(unsub.to);
				if (item) list.removeItem(item);
			}
		}
	}
	if (im.presence) {
		for (var i=0; i < im.presence.length; i++) {
			var p = im.presence[i];
			if (p.from == this.getMyAddress()) {
				if (this.getPresence().setFromJS(p)) this._notifyPresence();            
			} else {
				var ri = this.getRosterItemList().getByAddr(p.from);
				if (ri) {
					if (ri.getPresence().setFromJS(p)) {
						ri._notifyPresence();
						var toast = this._presenceToastFormatter.format([ri.getDisplayName(), ri.getPresence().getShowText()]);
						this._appCtxt.setStatusMsg(toast, null, null, null, ZmStatusView.TRANSITION_SLIDE_LEFT);
					}
				}
			}
		}
	}
	if (im.message) {
		for (var i=0; i < im.message.length; i++) {
			var msg = im.message[i];
			var chatMessage = new ZmChatMessage(msg, msg.from == this.getMyAddress());
			var cl = this.getChatList();
			var chat = cl.getChatByThread(chatMessage.thread);
			if (chat == null && !chatMessage.fromMe) {
				chat = cl.getChatByRosterAddr(chatMessage.from, true);
				if (chat) chat.setThread(chatMessage.thread);
			}
			if (chat) {
				chat.addMessage(chatMessage);
				if (!this._imApp.isActive()) this._appCtxt.setStatusIconVisible(ZmStatusView.ICON_IM, true);
			}
		}
	}
	if (im.leftchat) {
		for (var i=0; i < im.leftchat.length; i++) {
			var lc = im.leftchat[i];
			var chat = this.getChatList().getChatByThread(lc.thread);
			if (chat) {
				chat.addMessage(ZmChatMessage.system(this._leftChatFormatter.format([lc.addr])));
				chat.setThread(null);
			}
		}
	}
};
