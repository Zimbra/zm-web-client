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

ZmRoster = function(imApp) {
	ZmModel.call(this, ZmEvent.S_ROSTER);

        this._notificationBuffer = [];
	this._newRosterItemtoastFormatter = new AjxMessageFormat(ZmMsg.imNewRosterItemToast);
	this._presenceToastFormatter = new AjxMessageFormat(ZmMsg.imStatusToast);
	this._leftChatFormatter = new AjxMessageFormat(ZmMsg.imLeftChat);
        this._enteredChatFormatter = new AjxMessageFormat(ZmMsg.imEnteredChat);
        this._removeRosterItemToastFormatter = new AjxMessageFormat(ZmMsg.imRemoveRosterItemToast);
	this._imApp = imApp;
        this._privacyList = new ZmImPrivacyList(this);

        this._idleTimer = new DwtIdleTimer(appCtxt.get(ZmSetting.IM_PREF_IDLE_TIMEOUT) * 60 * 1000 /* minutes */,
                                           new AjxCallback(this, this.setIdle));
        if (!appCtxt.get(ZmSetting.IM_PREF_REPORT_IDLE))
                this._idleTimer.kill();

        this.refresh();
};

ZmRoster.prototype = new ZmModel;
ZmRoster.prototype.constructor = ZmRoster;

ZmRoster.F_PRESENCE = "ZmRoster.presence";

ZmRoster.NOTIFICATION_FOO_TIMEOUT = 10000; // 10 sec.

ZmRoster.prototype.toString =
function() {
	return "ZmRoster";
};

ZmRoster.prototype.getPrivacyList = function() {
        return this._privacyList;
};

ZmRoster.prototype.getChatList =
function() {
	if (!this._chatList)
		this._chatList = new ZmChatList(this);
	return this._chatList;
};

ZmRoster.prototype.getMyAddress =
function() {
    if (this._myAddress == null)
		this._myAddress = appCtxt.get(ZmSetting.USERNAME);
    return this._myAddress;
};

ZmRoster.prototype.getRosterItem =
function(addr, isGenericAddr) {
        if (isGenericAddr) {
                addr = ZmImAddress.parse(addr);
                if (addr)
                        addr = this.makeServerAddress(addr.screenName, addr.service);
        }
        if (addr)
	        return this.getRosterItemList().getByAddr(addr);
};

ZmRoster.prototype.getRosterItemList =
function() {
	if (!this._rosterItemList) {
		this._rosterItemList = new ZmRosterItemList();
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
	this._imApp.getChatListController().updatePresenceMenu();
};

ZmRoster.prototype.reload =
function() {
	this.getRosterItemList().removeAllItems();
	var soapDoc = AjxSoapDoc.create("IMGetRosterRequest", "urn:zimbraIM");
	var respCallback = new AjxCallback(this, this._handleResponseReload);
	appCtxt.getAppController().sendRequest({soapDoc: soapDoc, asyncMode: true, callback: respCallback});
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
				var rosterItem = new ZmRosterItem(item.addr, list, item.name, rp, item.groups);
				list.addItem(rosterItem);
			}
		}
	}
	if (roster.presence) {
		this.getPresence().setFromJS(roster.presence);
		this._notifyPresence();
	}
	this.__avoidNotifyTimeout = new Date().getTime();
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
	appCtxt.getAppController().sendRequest({soapDoc: soapDoc, asyncMode: true});
};

/**
 * set presence on the server
 */
ZmRoster.prototype.setPresence =
function(show, priority, customStatusMsg) {
	var soapDoc = AjxSoapDoc.create("IMSetPresenceRequest", "urn:zimbraIM");
	var presence = soapDoc.set("presence");
	if(show) presence.setAttribute("show", show);
	if (priority) presence.setAttribute("priority", priority);
	if (customStatusMsg) presence.setAttribute("status",customStatusMsg); //soapDoc.set("status", customStatus, presence);
	appCtxt.getAppController().sendRequest({soapDoc: soapDoc, asyncMode: true});
	this.__avoidNotifyTimeout = new Date().getTime();
};

/**
 * Pass in an array of SUBSCRIBED items
 */
ZmRoster.prototype.handleSubscribedRosterItems =
function(subscribed) {
	for (var i=0; i < subscribed.length; i++) {
		var sub = subscribed[i];
		if (sub.to) {
			var list = this.getRosterItemList();
			var item = list.getByAddr(sub.to);
			if (item) {
				if (sub.groups) item._notifySetGroups(sub.groups); // should optimize
				if (sub.name && sub.name != item.getName()) item._notifySetName(sub.name);
				// mod
			} else {
				// create
				var item = new ZmRosterItem(sub.to, list, sub.name, null, sub.groups);
				list.addItem(item);
				var toast = this._newRosterItemtoastFormatter.format([item.getDisplayName()]);
				appCtxt.setStatusMsg(toast);
			}
		}
	}
};

ZmRoster.prototype.pushNotification = function(im) {
        if (!this._gateways) {
                this._notificationBuffer.push(im);
        } else
                this.handleNotification(im);
};

ZmRoster.prototype.refresh = function() {
        this._requestGateways();
        this.reload();
};

/**
 * handle async notifications. we might need to queue this with timed action and return
 * immediately, since this is happening as a result of a notify header in a response, and
 * we probably don't want to trigger more requests while handling a response.
 */
ZmRoster.prototype.handleNotification =
function(im) {
	if (im.n) {
		// console.log(im.n);
		var notifications = !this.__avoidNotifyTimeout ||
			(new Date().getTime() - this.__avoidNotifyTimeout > ZmRoster.NOTIFICATION_FOO_TIMEOUT);
		var cl = this.getChatList();
		for (var curNot=0; curNot < im.n.length; curNot++) {
			var not = im.n[curNot];
			if (not.type == "roster") {
				this.getRosterItemList().removeAllItems();
				var list = this.getRosterItemList();
				if (not.n) {
					for (var rosterNum=0; rosterNum < not.n.length; rosterNum++) {
						var rosterItem = not.n[rosterNum];
						if (rosterItem.type == "subscribed" && rosterItem.to.indexOf("@") >= 0) {
							var item = new ZmRosterItem(rosterItem.to, list, rosterItem.name, null, rosterItem.groups);
							list.addItem(item);
						}
					}
				}
				// ignore unsubscribed entries for now (TODO FIXME)
			} else if (not.type == "subscribe") {
				var view = ZmChatMultiWindowView.getInstance();
				// it should always be instantiated by this time, but whatever.
				if (view) {
                                        var item = this.getRosterItem(not.from);
					ZmImSubscribeAuth.show(view.getActiveWM(), not.from, item);
				}
                        } else if (not.ask && /^(un)?subscribed$/.test(not.type)) {
                                if (not.ask == "subscribe" && not.to) {
                                        var list = this.getRosterItemList();
                                        var item = list.getByAddr(not.to);
                                        if (!item) {
                                                // create him in offline state
                                                item = new ZmRosterItem(not.to, list, not.to, null, not.groups);
                                                list.addItem(item);
                                                if (notifications) {
                                                        appCtxt.setStatusMsg("Waiting for " + not.to + " to accept your request");
                                                }
                                        }
                                } else if (not.ask == "unsubscribe" && not.to) {
                                        // should we do anything here?
                                        // Do we need to ask buddy's
                                        // permission for us to remove
                                        // him from our list? :-)
                                }
			} else if (not.type == "subscribed") {
				var sub = not;
				if (sub.to) {
					var list = this.getRosterItemList();
					var item = list.getByAddr(sub.to);
					if (item) {
						if (sub.groups) item._notifySetGroups(sub.groups); // should optimize
						if (sub.name && sub.name != item.getName()) item._notifySetName(sub.name);
						// mod
					} else if (sub.to.indexOf("@") >= 0) {
						// create
						var item = new ZmRosterItem(sub.to, list, sub.name, null, sub.groups);
						list.addItem(item);
						if (notifications) {
							var toast = this._newRosterItemtoastFormatter.format([item.getDisplayName()]);
							appCtxt.setStatusMsg(toast);
						}
					}
				} else if (sub.from) {
				    // toast, should we user if they want to add user if they aren't in buddy list?
				}
			} else if (not.type == "unsubscribed") {
				var unsub = not;
				if (unsub.to) {
					var list = this.getRosterItemList();
					var item = list.getByAddr(unsub.to);
                                        if (item) {
					        var displayName = item.getDisplayName();
                                                list.removeItem(item);
					        if (notifications) {
						        appCtxt.setStatusMsg(this._removeRosterItemToastFormatter.format([displayName]));
					        }
                                        }
				}
			} else if (not.type == "presence") {
				var p = not;
				if (p.from == this.getMyAddress()) {
					if (this.getPresence().setFromJS(p))
						this._notifyPresence();
				}
				var ri = this.getRosterItemList().getByAddr(p.from);
				if (ri) {
					var old_pres = ri.getPresence().getShow();
					if (ri.getPresence().setFromJS(p)) {
						ri._notifyPresence();
						var toast = this._presenceToastFormatter.format([ri.getDisplayName(), ri.getPresence().getShowText()]);
						var is_status = old_pres == ri.getPresence().getShow();
						if (notifications && ( (!is_status && appCtxt.get(ZmSetting.IM_PREF_NOTIFY_PRESENCE)) ||
								       (is_status && appCtxt.get(ZmSetting.IM_PREF_NOTIFY_STATUS)) ) ) {
							appCtxt.setStatusMsg(toast);
							var chat = cl.getChatByRosterAddr(p.from);
							if (chat)
								chat.addMessage(ZmChatMessage.system(toast));
						}
					}
				}
			} else if (not.type == "message") {
				appCtxt.getApp(ZmApp.IM).prepareVisuals();
				var msg = not;
				var buddy = this.getRosterItem(msg.from);
				if (msg.body == null || msg.body.length == 0) {
					// typing notification
					if (buddy)
						buddy._notifyTyping(msg.typing);
				} else {
					// clear any previous typing notification, since it looks
					// like we don't receive this when a message gets in.
					if (buddy)
						buddy._notifyTyping(false);

					var chatMessage = new ZmChatMessage(msg, msg.from == this.getMyAddress());
					var chat = cl.getChatByThread(chatMessage.thread);
					if (chat == null) {
						if (!chatMessage.fromMe) {
							chat = cl.getChatByRosterAddr(chatMessage.from, true);
						} else {
							chat = cl.getChatByRosterAddr(chatMessage.to, false);
						}
						if (chat) chat.setThread(chatMessage.thread);
					}
					if (chat) {
						if (!this._imApp.isActive()) {
							this.startFlashingIcon();
						}
						chat.addMessage(chatMessage);
					}
				}
                        } else if (not.type == "enteredchat") {
                                // console.log("JOIN: %o", not);
                                appCtxt.getApp(ZmApp.IM).prepareVisuals(); // not sure we want this here but whatever
                                var chat = this.getChatList().getChatByThread(not.thread);
                                if (chat) {
                                        chat.addMessage(ZmChatMessage.system(this._enteredChatFormatter.format([not.addr])));
                                        chat.addRosterItem(this.getRosterItem(not.addr));
                                }
			} else if (not.type == "leftchat") {
                                // console.log("LEFT: %o", not);
				appCtxt.getApp(ZmApp.IM).prepareVisuals(); // not sure we want this here but whatever
				var chat = this.getChatList().getChatByThread(not.thread);
				if (chat) {
					chat.addMessage(ZmChatMessage.system(this._leftChatFormatter.format([not.addr])));
                                        chat.removeRosterItem(this.getRosterItem(not.addr));
					// chat.setThread(null); // ?
				}
			} else if (not.type == "otherLocation") {
				var gw = this.getGatewayByType(not.service);
				gw.setState(not.username, ZmImGateway.STATE.BOOTED_BY_OTHER_LOGIN);
			} else if (not.type == "gwStatus") {
				var gw = this.getGatewayByType(not.service);
				gw.setState(not.name || null, not.state);
				if (not.state == ZmImGateway.STATE.BAD_AUTH) {
					appCtxt.setStatusMsg(ZmMsg.errorNotAuthenticated, ZmStatusView.LEVEL_WARNING);
				}
			} else if (not.type == "invited") {
                                var view = ZmChatMultiWindowView.getInstance();
				// it should always be instantiated by this time, but whatever.
				if (view) {
                                        new ZmImInviteNotification(view.getActiveWM(), not).popup();
				}
			} else if (not.type == "privacy") {
                                // console.log("Received privacy list: %o", not);
                                this._privacyList.reset(not.list[0].item);
                        }
		}
	}

};

ZmRoster.prototype.startFlashingIcon = function() {
	this._imApp.startFlashingIcon();
};

ZmRoster.prototype.stopFlashingIcon = function() {
	this._imApp.stopFlashingIcon();
};

ZmRoster.prototype.joinChatRequest = function(thread, addr) {
        var sd = AjxSoapDoc.create("IMJoinChatRequest", "urn:zimbraIM");
        var method = sd.getMethod();
        method.setAttribute("thread", thread);
        method.setAttribute("addr", addr);
        appCtxt.getAppController().sendRequest({ soapDoc: sd, asyncMode: true });

//         // WORKAROUND: send "/join " + thread
// 	var soapDoc = AjxSoapDoc.create("IMSendMessageRequest", "urn:zimbraIM");
// 	var method = soapDoc.getMethod();
// 	var message = soapDoc.set("message");
// 	message.setAttribute("thread", thread);
// 	message.setAttribute("addr", thread);
// 	soapDoc.set("body", "/join " + thread, message);
// 	appCtxt.getAppController().sendRequest({ soapDoc: soapDoc, asyncMode: true });
};

ZmRoster.prototype.modifyChatRequest = function(thread, op, addr, message) {
	var sd = AjxSoapDoc.create("IMModifyChatRequest", "urn:zimbraIM");
	var method = sd.getMethod();
	method.setAttribute("thread", thread);
	method.setAttribute("op", op);
	if (op = "adduser") {
		method.setAttribute("addr", addr);
		if (message) {
			var txt = sd.getDoc().createTextNode(message);
			method.appendChild(txt);
		}
	}
	appCtxt.getAppController().sendRequest({ soapDoc: sd, asyncMode: true });
};

ZmRoster.prototype.sendSubscribeAuthorization = function(accept, add, addr) {
	var sd = AjxSoapDoc.create("IMAuthorizeSubscribeRequest", "urn:zimbraIM");
	var method = sd.getMethod();
	method.setAttribute("addr", addr);
	method.setAttribute("authorized", accept ? "true" : "false");
	method.setAttribute("add", add ? "true" : "false");
	appCtxt.getAppController().sendRequest({ soapDoc: sd, asyncMode: true });
};

ZmRoster.prototype.reconnectGateway = function(gw) {
	var sd = AjxSoapDoc.create("IMGatewayRegisterRequest", "urn:zimbraIM");
	var method = sd.getMethod();
	method.setAttribute("op", "reconnect");
	method.setAttribute("service", gw.type);
	appCtxt.getAppController().sendRequest({ soapDoc: sd, asyncMode: true });
	this.__avoidNotifyTimeout = new Date().getTime();
};

ZmRoster.prototype.unregisterGateway = function(service, screenName) {
	var sd = AjxSoapDoc.create("IMGatewayRegisterRequest", "urn:zimbraIM");
	var method = sd.getMethod();
	method.setAttribute("op", "unreg");
	method.setAttribute("service", service);
	appCtxt.getAppController().sendRequest({ soapDoc	 : sd,
						       asyncMode : true });
	this.__avoidNotifyTimeout = new Date().getTime();
};

ZmRoster.prototype.registerGateway = function(service, screenName, password) {
	var sd = AjxSoapDoc.create("IMGatewayRegisterRequest", "urn:zimbraIM");
	var method = sd.getMethod();
	method.setAttribute("op", "reg");
	method.setAttribute("service", service);
	method.setAttribute("name", screenName);
	method.setAttribute("password", password);
	appCtxt.getAppController().sendRequest({ soapDoc	 : sd,
						       asyncMode : true
						     });
	this.__avoidNotifyTimeout = new Date().getTime();
	// since it's not returned by a gwStatus notification, let's
	// set a nick here so the icon becomes "online" if a
	// corresponding gwStatus notification gets in.
	this.getGatewayByType(service).nick = screenName;
};

ZmRoster.prototype._requestGateways = function() {
	var sd = AjxSoapDoc.create("IMGatewayListRequest", "urn:zimbraIM");
	var response = appCtxt.getAppController().sendRequest(
		{ soapDoc   : sd,
		  asyncMode : false
		}
	);
        this._handleRequestGateways(response);
};

// {"IMGatewayListResponse": {"service": [
// 				   {"type":"msn","domain":"msn.ibm"},
// 				   {"type":"aol","domain":"aol.ibm"},
// 				   {"registration": [
// 					    {"state":"online","name":"mihai_bazon2"}
// 				    ],
// 				    "type":"yahoo",
// 				    "domain":"yahoo.ibm"
// 				   }],
// 			   "_jsns":"urn:zimbraIM"}
// };

ZmRoster.prototype._handleRequestGateways = function(resp) {
// 	var resp = resp.getResponse();
// 	if (!resp || !resp.IMGatewayListResponse)
// 		return;
 	var a = resp.IMGatewayListResponse.service;
        if (!a)
                a = [];
	a.unshift({ type   : "XMPP",
		    domain : "XMPP" });
	var byService = {};
	var byDomain = {};
	for (var i = 0; i < a.length; ++i) {
		var gw = a[i] = new ZmImGateway(a[i]);
		byService[a[i].type.toLowerCase()] = gw;
		byDomain[a[i].domain.toLowerCase()] = gw;
	}
	this._gateways = { byService : byService,
			   byDomain  : byDomain,
			   array     : a
			 };
        for (var i = 0; i < this._notificationBuffer.length; ++i)
                this.handleNotification(this._notificationBuffer[i]);
        this._notificationBuffer = [];
};

ZmRoster.prototype.getGatewayByType = function(type) {
	return this._gateways.byService[type.toLowerCase()];
};

ZmRoster.prototype.getGatewayByDomain = function(domain) {
	return this._gateways.byDomain[domain.toLowerCase()];
};

ZmRoster.prototype.getGateways = function() {
	return this._gateways.array;
};

ZmRoster.prototype.makeServerAddress = function(addr, type) {
	if (type == null || /^(xmpp|local)$/i.test(type))
		return addr;
	return addr + "@" + this.getGatewayByType(type).domain;
};

ZmRoster.prototype.makeGenericAddress = function(addr) {
        addr = this.breakDownAddress(addr);
        if (addr.type.toLowerCase() == "xmpp") // XXX
                addr.type = "local";
        return ZmImAddress.make(addr.type, addr.addr);
};

ZmRoster.prototype.breakDownAddress = function(addr) {
	var re = /@(.*)$/;
	var m = re.exec(addr);
	if (m) {
		var gw = this.getGatewayByDomain(m[1]);
		if (gw) {
			return { type	 : gw.type,
				 addr	 : addr.substr(0, m.index),
				 gateway : gw
			       };
		}
	}
	return { type: "XMPP",
		 addr: addr };
};

ZmRoster.prototype.getGroups = function() {
	return AjxVector.fromArray(this.getRosterItemList().getGroupsArray());
};

ZmRoster.prototype.setIdle = function(idle) {
        if (idle) {
                if (!this._presenceBeforeIdle) {
                        this._presenceBeforeIdle = this.getPresence().getShow();
                }
                // WARNING: assuming the same text as in ZmRosterPresence.SHOW_* constants,
                //          only lowercase.
                var idlePresence = appCtxt.get(ZmSetting.IM_PREF_IDLE_STATUS).toUpperCase();
                if (this._presenceBeforeIdle != idlePresence) {
                        this.setPresence(idlePresence);
                }
        } else {
                // back
                if (this._presenceBeforeIdle != this.getPresence().getShow()) {
                        this.setPresence(this._presenceBeforeIdle);
                }
        }
};



//------------------------------------------
// for autocomplete
//------------------------------------------

ZmRosterTreeGroups = function(roster) {
	this._groups = roster.getGroups();
};

ZmRosterTreeGroups.prototype.constructor = ZmRosterTreeGroups;

/**
 * Returns a list of matching groups for a given string
 */
ZmRosterTreeGroups.prototype.autocompleteMatch = function(str, callback) {
	str = str.toLowerCase();
	var result = [];

	var a = this._groups;
	var sz = a.size();
	for (var i = 0; i < sz; i++) {
		var g = a.get(i);
		if (g.toLowerCase().indexOf(str) == 0)
			result.push({ data: g, text: g });
	}
	callback.run(result);
};

ZmRosterTreeGroups.prototype.isUniqueValue =
function(str) {
	return false;
};

ZmRosterTreeGroups.prototype.getArray = function() {
        return this._groups;
};
