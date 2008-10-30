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

	ZmImService.INSTANCE._roster = this;

	this._notificationBuffer = [];
	this._imApp = imApp;
	this._privacyList = new ZmImPrivacyList(this);

	this._idleTimer = new DwtIdleTimer(appCtxt.get(ZmSetting.IM_PREF_IDLE_TIMEOUT) * 60 * 1000 /* minutes */,
									   new AjxCallback(this, this.setIdle));
	if (!appCtxt.get(ZmSetting.IM_PREF_REPORT_IDLE)) {
		this._idleTimer.kill();
	}
};

ZmRoster.prototype = new ZmModel;
ZmRoster.prototype.constructor = ZmRoster;

ZmRoster.F_PRESENCE = "ZmRoster.presence";

ZmRoster.NOTIFICATION_FOO_TIMEOUT = 10000; // 10 sec.

ZmRoster.GATEWAY_EVENT = "gateway list";

ZmRoster.prototype.toString =
function() {
	return "ZmRoster";
};

// Creates a roster asyncronously without a busy overlay so that the user can get on with
// reading his mail or whatever while logging into im.
ZmRoster.createInBackground =
function(callback) {
	var args = {
		asyncMode: true,
		noBusyOverlay: true
	};
	var serviceCallback = new AjxCallback(null, ZmRoster._backgroundGatewayCallback, [callback]);
	ZmImService.INSTANCE.getGateways(serviceCallback, args)
};

ZmRoster._backgroundGatewayCallback =
function(callback, gateways) {
	var roster = new ZmRoster(ZmImApp.INSTANCE);
	roster._handleRequestGateways(null, gateways);
	if (callback) {
		callback.run(roster);
	}
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
	return ZmImService.INSTANCE.getMyAddress();
};

ZmRoster.prototype.getRosterItem =
function(addr, isGenericAddr) {
	if (!addr) {
		return null;
	}
	
	addr = addr.toLowerCase();
	var item = this.getRosterItemList().getByAddr(addr);
	if (item) {
		return item;
	}
	if (isGenericAddr) {
		addr = ZmImAddress.parse(addr);
		item = addr ? this.getRosterItemList().getByAddr(addr.screenName) : null;
		if (item) {
			return item;
		}
		if (addr) {
			addr = this.makeServerAddress(addr.screenName, addr.service);
			if (addr) {
				return this.getRosterItemList().getByAddr(addr);
			}
		}
	}
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

ZmRoster.prototype.notifyPresence =
function() {
	var fields = {};
	fields[ZmRoster.F_PRESENCE] = this.getPresence();
	this._notify(ZmEvent.E_MODIFY, { fields: fields });
};

ZmRoster.prototype.reload =
function(noBusyOverlay) {
	this.getRosterItemList().removeAllItems();
	var callback = new AjxCallback(this, this._handleResponseReload);
	var args = {
		asyncMode: true,
		noBusyOverlay: noBusyOverlay
	};
	ZmImService.INSTANCE.getRoster(callback, args);
};

ZmRoster.prototype._handleResponseReload =
function(roster) {
	if (!roster) {
		return;
	}
	var list = this.getRosterItemList();
	if (roster.items && roster.items.item) {
		var items = roster.items.item;
		if (items.length) {
			var rosterItems = new Array(items.length);
			for (var i = 0; i < items.length; i++) {
				var item = items[i];
				if (item.subscription == "TO" || item.subscription == "BOTH") {
					var rp = new ZmRosterPresence();
					rp.setFromJS(item.presence);
					rosterItems[i] = new ZmRosterItem(item.addr, list, item.name, rp, item.groups);
				}
			}
			list.addItems(rosterItems);
		}
	}
	if (roster.presence) {
		// <temporary> hack for bug 21442
		// remove when a proper fix is available!
		if (/XA|AWAY/.test(roster.presence.show)) {
			roster.presence.show = "ONLINE";
			this.setPresence("ONLINE");
		}
                // </temporary>
		this.getPresence().setFromJS(roster.presence);
		this.notifyPresence();
	}
	ZmImService.INSTANCE.startIgnoreNotify();
};

/**
 * create item on server.
 */
ZmRoster.prototype.createRosterItem =
function(addr, name, groups) {
	ZmImService.INSTANCE.createRosterItem(addr, name, groups);
};

/**
 * set presence on the server
 */
ZmRoster.prototype.setPresence =
function(show, priority, customStatusMsg, batchCommand) {
	ZmImService.INSTANCE.setPresence(show, priority, customStatusMsg, batchCommand);
	ZmImService.INSTANCE.startIgnoreNotify();
};

ZmRoster.prototype.pushNotification = function(im) {
        if (!this._gateways) {
                this._notificationBuffer.push(im);
        } else
                this.handleNotification(im);
};

ZmRoster.prototype.refresh = function() {
	this._requestGateways(new AjxCallback(this, this.reload));
};

/**
 * handle async notifications. we might need to queue this with timed action and return
 * immediately, since this is happening as a result of a notify header in a response, and
 * we probably don't want to trigger more requests while handling a response.
 */
ZmRoster.prototype.handleNotification =
function(im) {
	ZmImService.INSTANCE.handleNotification(im);
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

ZmRoster.prototype.sendSubscribeAuthorization = function(accept, add, addr) {
	ZmImService.INSTANCE.sendSubscribeAuthorization(accept, add, addr);
};

ZmRoster.prototype.addGatewayListListener = function(listener) {
	this._evtMgr.addListener(ZmRoster.GATEWAY_EVENT, listener);
};

ZmRoster.prototype.reconnectGateway = function(gw) {
	ZmImService.INSTANCE.reconnectGateway(gw);
	ZmImService.INSTANCE.startIgnoreNotify();
};

ZmRoster.prototype.unregisterGateway = function(service, batchCmd) {
	ZmImService.INSTANCE.unregisterGateway(service, batchCmd);
	ZmImService.INSTANCE.startIgnoreNotify();
};

ZmRoster.prototype.registerGateway = function(service, screenName, password, batchCmd) {
	ZmImService.INSTANCE.registerGateway(service, screenName, password, batchCmd);
	ZmImService.INSTANCE.startIgnoreNotify();
	
	// since it's not returned by a gwStatus notification, let's
	// set a nick here so the icon becomes "online" if a
	// corresponding gwStatus notification gets in.
	this.getGatewayByType(service).nick = screenName;
};

ZmRoster.prototype._requestGateways = function(callback) {
	ZmImService.INSTANCE.getGateways(new AjxCallback(this, this._handleRequestGateways, [callback]));
};

ZmRoster.prototype._handleRequestGateways = function(callback, gateways) {
	var byService = {};
	var byDomain = {};
	for (var i = 0; i < gateways.length; ++i) {
		var gw = gateways[i] = new ZmImGateway(gateways[i]);
		byService[gateways[i].type.toLowerCase()] = gw;
		byDomain[gateways[i].domain.toLowerCase()] = gw;
	}
	this._gateways = { byService : byService,
		byDomain  : byDomain,
		array	 : gateways
	};
	for (var i = 0; i < this._notificationBuffer.length; ++i)
		this.handleNotification(this._notificationBuffer[i]);
	this._notificationBuffer = [];

	this._evtMgr.notifyListeners(ZmRoster.GATEWAY_EVENT, { roster: this });
	if (callback) {
		callback.run();
	}
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
	var gw = this.getGatewayByType(type);
	if (gw)
		return addr + "@" + gw.domain;
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
	ZmImService.INSTANCE.setIdle(idle, this._idleTimer.timeout);
};

ZmRoster.prototype.addChatMessage =
function(chatMessage) {
	appCtxt.getApp(ZmApp.IM).prepareVisuals();

	var buddy = this.getRosterItem(chatMessage.from);
	// clear any previous typing notification, since it looks
	// like we don't receive this when a message gets in.
	if (buddy) {
		buddy._notifyTyping(false);
	}

	var chatList = this.getChatList();
	var chat = chatList.getChatByThread(chatMessage.thread);
	if (chat == null) {
		if (!chatMessage.fromMe) {
			chat = chatList.getChatByRosterAddr(chatMessage.from, true);
		} else {
			chat = chatList.getChatByRosterAddr(chatMessage.to, false);
		}
		if (chat) chat.setThread(chatMessage.thread);
	}
	if (chat) {
		if (!chatMessage.fromMe) {
			if (appCtxt.get(ZmSetting.IM_PREF_FLASH_BROWSER))  {
				AjxDispatcher.require("Alert");
				ZmBrowserAlert.getInstance().start(ZmMsg.newInstantMessage);
			}
		}
		chat.addMessage(chatMessage);
	}
};

ZmRoster.prototype.setRosterItemPresence =
function(rosterItem, jsonObj, doNotifications) {
	var old_pres = rosterItem.getPresence().getShow();
	if (rosterItem.getPresence().setFromJS(jsonObj)) {
		rosterItem._notifyPresence();
		this._presenceToastFormatter = this._presenceToastFormatter || new AjxMessageFormat(ZmMsg.imStatusToast);
		var toast = this._presenceToastFormatter.format([rosterItem.getDisplayName(), AjxStringUtil.htmlEncode(rosterItem.getPresence().getShowText())]);
		var is_status = old_pres == rosterItem.getPresence().getShow();
		if (doNotifications && ( (!is_status && appCtxt.get(ZmSetting.IM_PREF_NOTIFY_PRESENCE)) ||
							   (is_status && appCtxt.get(ZmSetting.IM_PREF_NOTIFY_STATUS)) ) ) {
			appCtxt.setStatusMsg(toast);
			var chat = this.getChatList().getChatByRosterAddr(jsonObj.from);
			if (chat)
				chat.addMessage(ZmChatMessage.system(toast));
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
