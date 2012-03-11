/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2005, 2006, 2007, 2008, 2009, 2010 Zimbra, Inc.
 * 
 * The contents of this file are subject to the Zimbra Public License
 * Version 1.3 ("License"); you may not use this file except in
 * compliance with the License.  You may obtain a copy of the License at
 * http://www.zimbra.com/license.
 * 
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * ***** END LICENSE BLOCK *****
 */

ZmRoster = function(imApp) {
	ZmModel.call(this, ZmEvent.S_ROSTER);

	this._gateways = {
		byService : {},
		byDomain  : {},
		array	 : []
	};
	
	this._notificationBuffer = [];
	this._imApp = imApp;
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

ZmRoster.prototype.getPrivacyList = function() {
	return this._privacyList = this._privacyList || new ZmImPrivacyList(this);
};

ZmRoster.prototype.getChatList =
function() {
	if (!this._chatList)
		this._chatList = new ZmChatList(this);
	return this._chatList;
};

ZmRoster.prototype.getMyAddress =
function() {
	return ZmImApp.INSTANCE.getService().getMyAddress();
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
	ZmImApp.INSTANCE.getService().getRoster(callback, args);
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
	ZmImApp.INSTANCE.getService().startIgnoreNotify();
};

/**
 * create item on server.
 */
ZmRoster.prototype.createRosterItem =
function(addr, name, groups) {
	ZmImApp.INSTANCE.getService().createRosterItem(addr, name, groups);
};

/**
 * set presence on the server
 */
ZmRoster.prototype.setPresence =
function(show, priority, customStatusMsg, batchCommand) {
	ZmImApp.INSTANCE.getService().setPresence(show, priority, customStatusMsg, batchCommand);
	ZmImApp.INSTANCE.getService().startIgnoreNotify();
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
	ZmImApp.INSTANCE.getService().handleNotification(im);
};

ZmRoster.prototype.getConferenceTree =
function() {
	AjxDispatcher.require([ "IMConference" ]);
	if (!this._conferenceTree) {
		this._conferenceTree = new ZmTree(ZmOrganizer.CONFERENCE_ITEM);
		this._conferenceTree.root = new ZmOrganizer({ tree: this._conferenceTree });
	}
	return this._conferenceTree;
};

ZmRoster.prototype.getConferenceServices =
function(callback, force) {
	var tree = this.getConferenceTree();
	if (!tree.root.children.size() || force) {
		var responseCallback = new AjxCallback(this, this._handleResponceGetConferenceServices, [callback]);
		ZmImApp.INSTANCE.getService().getConferenceServices(responseCallback);
	} else {
		callback.run(tree.root.children.getArray());
	}
};

ZmRoster.prototype._handleResponceGetConferenceServices =
function(callback, services) {
	var tree = this.getConferenceTree();
	var root = tree.root;
	for (var i = 0, count = services.length; i < count; i++) {
		var args = {
			id: services[i].addr,
			tree: tree, 
			name: services[i].name,
			parent: root
		};
		var service = new ZmConferenceService(args);
		root.children.add(service);
	}
	callback.run(root.children.getArray());
};

ZmRoster.prototype.joinChatRequest = function(thread, addr) {
        var sd = AjxSoapDoc.create("IMJoinConferenceRoomRequest", "urn:zimbraIM");
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
	ZmImApp.INSTANCE.getService().sendSubscribeAuthorization(accept, add, addr);
};

ZmRoster.prototype.addGatewayListListener = function(listener) {
	this._evtMgr.addListener(ZmRoster.GATEWAY_EVENT, listener);
};

ZmRoster.prototype.reconnectGateway = function(gw) {
	ZmImApp.INSTANCE.getService().reconnectGateway(gw);
	ZmImApp.INSTANCE.getService().startIgnoreNotify();
};

ZmRoster.prototype.unregisterGateway = function(service, batchCmd) {
	ZmImApp.INSTANCE.getService().unregisterGateway(service, batchCmd);
	ZmImApp.INSTANCE.getService().startIgnoreNotify();
};

ZmRoster.prototype.registerGateway = function(service, screenName, password, batchCmd) {
	ZmImApp.INSTANCE.getService().registerGateway(service, screenName, password, batchCmd);
	ZmImApp.INSTANCE.getService().startIgnoreNotify();
	
	// since it's not returned by a gwStatus notification, let's
	// set a nick here so the icon becomes "online" if a
	// corresponding gwStatus notification gets in.
	this.getGatewayByType(service).nick = screenName;
};

ZmRoster.prototype._requestGateways = function(callback) {
	ZmImApp.INSTANCE.getService().getGateways(new AjxCallback(this, this._handleRequestGateways, [callback]));
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
	return ZmImApp.INSTANCE.getService().makeServerAddress(addr, type);
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
	if (ZmImApp.INSTANCE.getService().isLoggedIn()) {
		ZmImApp.INSTANCE.getService().setIdle(idle, this._idleTimer.timeout);
	}
};

ZmRoster.prototype.onServiceAddChatMessage =
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
			chat = chatList.getChatByRosterAddr(chatMessage.from, true, true);
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
			if (appCtxt.get(ZmSetting.IM_PREF_DESKTOP_ALERT))  {
				AjxDispatcher.require("Alert");
				ZmDesktopAlert.getInstance().start(ZmMsg.newInstantMessage, chatMessage.getTextBody());
			}
		}
		chat.addMessage(chatMessage);
	}
};

ZmRoster.prototype.onServiceAddBuddy =
function(addr, name, presence, groups, notifications) {
	var list = this.getRosterItemList();
	var item = new ZmRosterItem(addr, list, name, presence, groups);
	list.addItem(item);
	if (notifications) {
		this._newRosterItemtoastFormatter = this._newRosterItemtoastFormatter || new AjxMessageFormat(ZmMsg.imNewRosterItemToast);
		var toast = this._newRosterItemtoastFormatter.format([item.getDisplayName()]);
		ZmTaskbarController.INSTANCE.setMessage(toast);
	}
};

ZmRoster.prototype.onServiceRemoveBuddy =
function(addr, notifications) {
	var list = this.getRosterItemList();
	var item = list.getByAddr(addr);
	if (item) {
		var displayName = item.getDisplayName();
		list.removeItem(item);
		if (notifications) {
			this._removeRosterItemToastFormatter = this._removeRosterItemToastFormatter || new AjxMessageFormat(ZmMsg.imRemoveRosterItemToast);
			ZmTaskbarController.INSTANCE.setMessage(this._removeRosterItemToastFormatter.format([displayName]));
		}
	}
};

ZmRoster.prototype.onServiceRequestBuddyAuth =
function(addr) {
	var buddy = this.getRosterItem(addr);
	ZmTaskbarController.INSTANCE.showSubscribeRequest(addr, buddy);
};

ZmRoster.prototype.onServiceSetBuddyPresence =
function(rosterItem, jsonObj, doNotifications) {
	var old_pres = rosterItem.getPresence().getShow();
	if (rosterItem.getPresence().setFromJS(jsonObj)) {
		rosterItem._notifyPresence();
		if (old_pres != ZmRosterPresence.SHOW_UNKNOWN) {
			this._presenceToastFormatter = this._presenceToastFormatter || new AjxMessageFormat(ZmMsg.imStatusToast);
			var toast = this._presenceToastFormatter.format([rosterItem.getDisplayName(), AjxStringUtil.htmlEncode(rosterItem.getPresence().getShowText())]);
			var is_status = old_pres == rosterItem.getPresence().getShow();
			if (doNotifications && ( (!is_status && appCtxt.get(ZmSetting.IM_PREF_NOTIFY_PRESENCE)) ||
								   (is_status && appCtxt.get(ZmSetting.IM_PREF_NOTIFY_STATUS)) ) ) {
				ZmTaskbarController.INSTANCE.setMessage(toast);
				var chat = this.getChatList().getChatByRosterAddr(jsonObj.from);
				if (chat)
					chat.addMessage(ZmChatMessage.system(toast));
			}
		}
	}
};

// Creates a roster asyncronously without a busy overlay so that the user can get on with
// reading his mail or whatever while logging into im.
ZmRoster.prototype.onServiceLoggedIn =
function(params) {
	if (!this._idleTimer) {
		this._idleTimer = new DwtIdleTimer(appCtxt.get(ZmSetting.IM_PREF_IDLE_TIMEOUT) * 60 * 1000 /* minutes */,
										   new AjxCallback(this, this.setIdle));
		if (!appCtxt.get(ZmSetting.IM_PREF_REPORT_IDLE)) {
			this._idleTimer.kill();
		}
	}


	this._notify(ZmEvent.E_LOAD, { loggedIn: true });
	var serviceCallback = new AjxCallback(this, this._loggedInGatewayCallback, [params]);
	var args = {
		asyncMode: true,
		noBusyOverlay: true
	};
	ZmImApp.INSTANCE.getService().getGateways(serviceCallback, args);
};

ZmRoster.prototype._loggedInGatewayCallback =
function(params, gateways) {
	this._handleRequestGateways(null, gateways);
    ZmImApp.INSTANCE.getService().initializePresence(params ? params.presence : null);
	this.reload();
    if (params && params.callback) {
        params.callback.run(this);
	}
};

ZmRoster.prototype.onServiceLoggedOut =
function() {
	if (this.getPresence().setFromJS({ show: ZmRosterPresence.SHOW_OFFLINE })) {
		this.notifyPresence();
	}
	this.getRosterItemList().removeAllItems();

	this._notify(ZmEvent.E_LOAD, { loggedIn: false });
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

ZmRosterTreeGroups.prototype.getArray = function() {
        return this._groups;
};
