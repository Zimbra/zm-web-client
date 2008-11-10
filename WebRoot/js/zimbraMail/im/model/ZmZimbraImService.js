/*
 * ***** BEGIN LICENSE BLOCK *****
 *
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2008 Zimbra, Inc.
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

/**
 * Creates the Zimbra IM service.
 * @constructor
 * @class
 * This service communicates with the Zimbra IM server.
 *
 */
ZmZimbraImService = function() {
	ZmImService.call(this, true);

	this._loggedIn = false;

	this._newRosterItemtoastFormatter = new AjxMessageFormat(ZmMsg.imNewRosterItemToast);
	this._leftChatFormatter = new AjxMessageFormat(ZmMsg.imLeftChat);
	this._enteredChatFormatter = new AjxMessageFormat(ZmMsg.imEnteredChat);
	this._removeRosterItemToastFormatter = new AjxMessageFormat(ZmMsg.imRemoveRosterItemToast);
}

ZmZimbraImService.prototype = new ZmImService;
ZmZimbraImService.prototype.constructor = ZmZimbraImService;

// Public methods

ZmZimbraImService.prototype.toString =
function() {
	return "ZmZimbraImService";
};

ZmZimbraImService.prototype.isLoggedIn =
function() {
	return this._loggedIn;
};

ZmZimbraImService.prototype.login =
function(params) {
	this._loggedIn = true;
	this._roster.setIsLoggedIn(params);
};

ZmZimbraImService.prototype.getMyAddress =
function() {
    if (this._myAddress == null)
		this._myAddress = appCtxt.get(ZmSetting.USERNAME);
    return this._myAddress;
};

ZmZimbraImService.prototype.getGateways =
function(callback, params) {
	var soapDoc = AjxSoapDoc.create("IMGatewayListRequest", "urn:zimbraIM");
	var responseCallback = new AjxCallback(this, this._handleResponseGetGateways, [callback]);
	return this._send(params, soapDoc, responseCallback);
};

ZmZimbraImService.prototype._handleResponseGetGateways =
function(callback, response) {
	var responseJson = response.getResponse();
	var gateways = responseJson.IMGatewayListResponse.service;
	gateways = gateways || [];
	gateways.unshift({ type   : "XMPP", domain : "XMPP" });
	if (callback) {
		callback.run(gateways);
	}
	return gateways;
};

ZmZimbraImService.prototype.reconnectGateway =
function(gw) {
	var sd = AjxSoapDoc.create("IMGatewayRegisterRequest", "urn:zimbraIM");
	var method = sd.getMethod();
	method.setAttribute("op", "reconnect");
	method.setAttribute("service", gw.type);
	appCtxt.getAppController().sendRequest({ soapDoc: sd, asyncMode: true });
};

ZmZimbraImService.prototype.unregisterGateway =
function(service, batchCmd) {
	var sd = AjxSoapDoc.create("IMGatewayRegisterRequest", "urn:zimbraIM");
	var method = sd.getMethod();
	method.setAttribute("op", "unreg");
	method.setAttribute("service", service);
	if (batchCmd) {
		batchCmd.addNewRequestParams(sd);
	} else {
		appCtxt.getAppController().sendRequest({
			soapDoc: sd,
			asyncMode: true
		});
	}
};

ZmZimbraImService.prototype.registerGateway =
function(service, screenName, password, batchCmd) {
	var sd = AjxSoapDoc.create("IMGatewayRegisterRequest", "urn:zimbraIM");
	var method = sd.getMethod();
	method.setAttribute("op", "reg");
	method.setAttribute("service", service);
	method.setAttribute("name", screenName);
	method.setAttribute("password", password);
	if (batchCmd) {
		batchCmd.addNewRequestParams(sd);
		batchCmd.setSensitive(true);
	} else {
		appCtxt.getAppController().sendRequest({
			soapDoc: sd,
			asyncMode: true,
			sensitive: true
		});
	}
};

ZmZimbraImService.prototype.getRoster =
function(callback, params) {
	var soapDoc = AjxSoapDoc.create("IMGetRosterRequest", "urn:zimbraIM");
	var responseCallback = new AjxCallback(this, this._handleResponseGetRoster, [callback]);
	return this._send(params, soapDoc, responseCallback);
};

ZmZimbraImService.prototype._handleResponseGetRoster =
function(callback, response) {
	var responseJson = response.getResponse();
	var roster = responseJson ? responseJson.IMGetRosterResponse : null;
	if (callback) {
		callback.run(roster);
	}
	return roster;
};

ZmZimbraImService.prototype.initializePresence =
function(presence) {
	if (presence) {
		this.setPresence(presence.show, null, presence.customStatusMsg);
	}
	// else initial presence comes back from a notification.
};

ZmZimbraImService.prototype.setPresence =
function(show, priority, customStatusMsg, batchCommand) {
	var soapDoc = AjxSoapDoc.create("IMSetPresenceRequest", "urn:zimbraIM");
	var presence = soapDoc.set("presence");
	if (show) {
		presence.setAttribute("show", show);
	}
	if (priority) {
		presence.setAttribute("priority", priority);
	}
	if (customStatusMsg) {
		presence.setAttribute("status",customStatusMsg);
	}
	if (batchCommand) {
		batchCommand.addNewRequestParams(soapDoc);
	} else {
		appCtxt.getAppController().sendRequest({ soapDoc: soapDoc, asyncMode: true });
	}
};

ZmZimbraImService.prototype.setIdle =
function(idle, idleTime) {
	this._idlePresenceErrorCallbackObj = this._idlePresenceErrorCallbackObj || new AjxCallback(this, this._idlePresenceErrorCallback);
	var requestParams = { errorCallback: this._idlePresenceErrorCallbackObj };
	var jsonObj = {
		IMSetIdleRequest: {
			_jsns: "urn:zimbraIM",
			isIdle: idle ? "1" : "0",
			idleTime: idleTime / 1000
		}
	};
	var args = {
		jsonObj: jsonObj,
		asyncMode: true,
		noBusyOverlay: true,
		errorCallback: this._idlePresenceErrorCallbackObj
	};
	appCtxt.getAppController().sendRequest(args);
};

ZmZimbraImService.prototype._idlePresenceErrorCallback =
function(ex) {
	// Return true (meaning we handled the exception) if the response was empty because we don't want
	// to display an error message if this idle request happens while the network connection is down.
	return ex.code == ZmCsfeException.EMPTY_RESPONSE;
};

ZmZimbraImService.prototype.createRosterItem =
function(addr, name, groups, params) {
	var soapDoc = AjxSoapDoc.create("IMSubscribeRequest", "urn:zimbraIM");
	var method = soapDoc.getMethod();
	method.setAttribute("addr", addr);
	if (name) {
		method.setAttribute("name", name);
	}
	if (groups) {
		method.setAttribute("groups", groups);
	}
	method.setAttribute("op", "add");
	return this._send(params, soapDoc);
};

ZmZimbraImService.prototype.deleteRosterItem =
function(rosterItem, params) {
	var soapDoc = AjxSoapDoc.create("IMSubscribeRequest", "urn:zimbraIM");
	var method = soapDoc.getMethod();
	method.setAttribute("addr", rosterItem.id);
	method.setAttribute("op", "remove");
	return this._send(params, soapDoc);
};

ZmZimbraImService.prototype.sendSubscribeAuthorization =
function(accept, add, addr) {
	var sd = AjxSoapDoc.create("IMAuthorizeSubscribeRequest", "urn:zimbraIM");
	var method = sd.getMethod();
	method.setAttribute("addr", addr);
	method.setAttribute("authorized", accept ? "true" : "false");
	method.setAttribute("add", add ? "true" : "false");
	appCtxt.getAppController().sendRequest({ soapDoc: sd, asyncMode: true });
};

ZmZimbraImService.prototype.sendMessage =
function(chat, text, html, typing, params) {
	var soapDoc = AjxSoapDoc.create("IMSendMessageRequest", "urn:zimbraIM");
	var message = soapDoc.set("message");
	if (typing) {
		soapDoc.set("typing", null, message);
	}
	var thread = chat.getThread();
	if (thread)
		message.setAttribute("thread", thread);
	message.setAttribute("addr", chat.getRosterItem(0).getAddress());
    if (text || html) {
        var bodyNode = soapDoc.set("body", null, message);
        if (text) {
            soapDoc.set("text", text, bodyNode);
        }
        if (html) {
            soapDoc.set("html", html, bodyNode);
        }
    }
	return this._send(params, soapDoc);
};

ZmZimbraImService.prototype.closeChat =
function(chat, params) {
	var soapDoc = AjxSoapDoc.create("IMModifyChatRequest", "urn:zimbraIM");
	var method = soapDoc.getMethod();
	method.setAttribute("thread", chat.getThread());
	method.setAttribute("op", "close");
	return this._send(params, soapDoc);
};

ZmZimbraImService.prototype.handleNotification =
function(im) {
	if (im.n) {
		var notifications = this.getShowNotify();
		var cl = this._roster.getChatList();
		for (var curNot=0; curNot < im.n.length; curNot++) {
			var not = im.n[curNot];
			if (not.type == "roster") {
				this._roster.getRosterItemList().removeAllItems();
				var list = this._roster.getRosterItemList();
				if (not.n && not.n.length) {
					var rosterItems = [];
					for (var rosterNum=0; rosterNum < not.n.length; rosterNum++) {
						var rosterItem = not.n[rosterNum];
						if (rosterItem.type == "subscribed" && rosterItem.to.indexOf("@") >= 0) {
							rosterItems.push(new ZmRosterItem(rosterItem.to, list, rosterItem.name, null, rosterItem.groups));
						}
					}
					if (rosterItems.length) {
						list.addItems(rosterItems);
					}
				}
				// ignore unsubscribed entries for now (TODO FIXME)
			} else if (not.type == "subscribe") {
				appCtxt.getApp(ZmApp.IM).prepareVisuals();
				var view = ZmChatMultiWindowView.getInstance();
				// it should always be instantiated by this time, but whatever.
				if (view) {
					var item = this._roster.getRosterItem(not.from);
					ZmImSubscribeAuth.show(view.getActiveWM(), not.from, item);
				}
			} else if (not.ask && /^(un)?subscribed$/.test(not.type)) {
				if (not.ask == "subscribe" && not.to) {
					var list = this._roster.getRosterItemList();
					var item = list.getByAddr(not.to);
					if (!item) {
						// create him in offline state
						item = new ZmRosterItem(not.to, list, ( not.name || not.to ), null, not.groups);
                        list.addItem(item);
						if (notifications) {
							this._watingFormatter = this._watingFormatter || new AjxMessageFormat(ZmMsg.imSubscribeAuthRequest_waiting);
							appCtxt.setStatusMsg(this._watingFormatter.format(not.to));
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
					var list = this._roster.getRosterItemList();
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
					var list = this._roster.getRosterItemList();
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
					if (this._roster.getPresence().setFromJS(p))
						this._roster.notifyPresence();
				}
				var ri = this._roster.getRosterItemList().getByAddr(p.from);
				if (ri) {
					this._roster.setRosterItemPresence(ri, p, notifications);
				}
			} else if (not.type == "message") {
				appCtxt.getApp(ZmApp.IM).prepareVisuals();
				var msg = not;
				if (msg.body == null || msg.body.length == 0) {
					// typing notification
					var buddy = this._roster.getRosterItem(msg.from);
					if (buddy)
						buddy._notifyTyping(msg.typing);
				} else {
					var chatMessage = new ZmChatMessage(msg, msg.from == this.getMyAddress());
					this._roster.addChatMessage(chatMessage);
				}
			} else if (not.type == "enteredchat") {
				// console.log("JOIN: %o", not);
				appCtxt.getApp(ZmApp.IM).prepareVisuals(); // not sure we want this here but whatever
				var chat = this._roster.getChatList().getChatByThread(not.thread);
				if (chat) {
					chat.addMessage(ZmChatMessage.system(this._enteredChatFormatter.format([not.addr])));
					chat.addRosterItem(this._roster.getRosterItem(not.addr));
				}
			} else if (not.type == "leftchat") {
				// console.log("LEFT: %o", not);
				appCtxt.getApp(ZmApp.IM).prepareVisuals(); // not sure we want this here but whatever
				var chat = this._roster.getChatList().getChatByThread(not.thread);
				if (chat) {
					chat.addMessage(ZmChatMessage.system(this._leftChatFormatter.format([not.addr])));
					chat.removeRosterItem(this._roster.getRosterItem(not.addr));
					// chat.setThread(null); // ?
				}
			} else if (not.type == "otherLocation") {
				var gw = this._roster.getGatewayByType(not.service);
				gw.setState(not.username, ZmImGateway.STATE.BOOTED_BY_OTHER_LOGIN);
			} else if (not.type == "gwStatus") {
				var gw = this._roster.getGatewayByType(not.service);
				gw.setState(not.name || null, not.state);
				var message,
					level = ZmStatusView.LEVEL_INFO;
				switch (not.state) {
				case ZmImGateway.STATE.BAD_AUTH:
					message = ZmMsg.errorNotAuthenticated;
					level = ZmStatusView.LEVEL_WARNING;
					break;
				case ZmImGateway.STATE.ONLINE:
					this._gatewayOnlineFormat = this._gatewayOnlineFormat || new AjxMessageFormat(ZmMsg.imToastGwOnline);
					message = this._gatewayOnlineFormat.format(ZmMsg["imGateway_" + not.service]);
					break;
				case ZmImGateway.STATE.SHUTDOWN:
					this._gatewayOfflineFormat = this._gatewayOfflineFormat || new AjxMessageFormat(ZmMsg.imToastGwOffline);
					message = this._gatewayOfflineFormat.format(ZmMsg["imGateway_" + not.service]);
					break;
				}
				if (message) {
					appCtxt.setStatusMsg(message, level);
				}
			} else if (not.type == "invited") {
				appCtxt.getApp(ZmApp.IM).prepareVisuals();
				var view = ZmChatMultiWindowView.getInstance();
				// it should always be instantiated by this time, but whatever.
				if (view) {
					new ZmImInviteNotification(view.getActiveWM(), not).popup();
				}
			} else if (not.type == "privacy") {
				// console.log("Received privacy list: %o", not);
				this._roster.getPrivacyList().reset(not.list[0].item);
			}
		}
	}
};

ZmZimbraImService.prototype._send =
function(params, soapDoc, callback) {
	params = params || { };
	params.asyncMode = true;
	params.soapDoc = soapDoc;
	params.callback = callback;
	appCtxt.getAppController().sendRequest(params);
};
