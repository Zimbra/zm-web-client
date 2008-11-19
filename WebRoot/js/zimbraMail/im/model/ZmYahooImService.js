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

ZmYahooImService = function(roster, loadCallback, loadErrorCallback) {
	ZmImService.call(this, roster);

	this._visible = false;
	this._userId = null;
	this._loggedIn = false;
	this._loadCallback = loadCallback;
	this._loadErrorCallback = loadErrorCallback;

	// Setup maps of cloud ids and domain names.
	this._cloudToDomains = {};
	this._domainToCloud = {};
	var data = [
		{ cloud: ZmYahooImService.YAHOO_CLOUD, domains: ["yahoo.com", "ymail.com", "rocketmail.com"] },
		{ cloud: ZmYahooImService.GOOGLE_CLOUD, domains: ["gmail.com"] },
		{ cloud: ZmYahooImService.MSN_CLOUD, domains: ["msn.com"] },
	];
	for (var i = 0, dataCount = data.length; i < dataCount; i++) {
		var cloud = data[i].cloud;
		var domains = data[i].domains;
		this._cloudToDomains[cloud] = domains;
		for (var j = 0, domainCount = domains.length; j < domainCount; j++) {
			this._domainToCloud[domains[j]] = cloud;
		}
	}
};

ZmYahooImService.prototype = new ZmImService;
ZmYahooImService.prototype.constructor = ZmYahooImService;

ZmYahooImService.YAHOO_CLOUD = 0;
ZmYahooImService.MSN_CLOUD = 2;
ZmYahooImService.GOOGLE_CLOUD = 4;

// Public methods

ZmYahooImService.prototype.toString =
function() {
	return "ZmYahooImService";
};

ZmYahooImService.prototype.isLoggedIn =
function() {
	return this._loggedIn;
};

ZmYahooImService.prototype.login =
function(cookie, loginParams) {
	this._loginParams = loginParams;

// TODO: Clean up all these params....
	var params = {
//		servers: [{host: "webcs.msg.yahoo.com", port: 5050}, {host: "httpcs.msg.yahoo.com", port: 80}],
		cookie: cookie,
//		cookie: "Y=v=1&n=bja0geghk49rg&l=362j4ij/o&p=m272s2v012000000&r=jl&lg=en-US&intl=us; T=z=Mxh/IBMFJEJBS7w9UUk0DufNDU0BjQyMTIzMzQxTzQ-&a=QAE&sk=DAAyHwyz5.2/zi&ks=EAAAFaoIZvMCdMGPsBajCR3Cw--~C&d=c2wBTXpJekFUTTFOalUwTkRNMk9ETS0BYQFRQUUBZwFFT0lRNTdHUUg1WElaR1M1VldWSlZHQzZYWQF0aXABUlBvUHhCAXp6AU14aC9JQkE3RQ--",
//		userId: null,                             	
		vendorId: 415
//		countryCode: "us",
//		weight: 6,
//		visible: true
	};

	this._callSdk("login", [params]);
};

ZmYahooImService.prototype.logout =
function() {
	this._callSdk("logoff");
};

ZmYahooImService.prototype.getMyAddress =
function() {
	return this._userId;
};

ZmYahooImService.prototype.getGateways =
function(callback, params) {
	var gateways = [{
		type: "YAHOO",
		domain: "YAHOO",
		registration: [ { state: ZmImGateway.STATE.ONLINE, name: this._userId } ]
	}];
	if (callback) {
		callback.run(gateways);
	}
	return gateways;
};

ZmYahooImService.prototype.reconnectGateway =
function(gw) {
};

ZmYahooImService.prototype.unregisterGateway =
function(service, batchCmd) {
};

ZmYahooImService.prototype.registerGateway =
function(service, screenName, password, batchCmd) {
};

ZmYahooImService.prototype.getRoster =
function(callback, params) {
};

ZmYahooImService.prototype.initializePresence =
function(presence) {
	if (presence) {
		this.setPresence(presence.show, null, presence.customStatusMsg);
	} else {
		this.setPresence(ZmRosterPresence.SHOW_ONLINE);
	}
};

ZmYahooImService.prototype.setPresence =
function(show, priority, customStatusMsg, batchCommand) {
	this._lastStatus = { show: show, customStatusMsg: customStatusMsg };
	this._setPresence(show, customStatusMsg);
};

ZmYahooImService.prototype.setIdle =
function(idle, idleTime) {
	if (idle) {
		this._callSdk("setStatus", [YMSGR.CONST.YMSG_Idle, true]);
	} else if (this._lastStatus) {
		this._setPresence(this._lastStatus.show, this._lastStatus.customStatusMsg);
	} else {
		DBG.println("ym", "Idle ended without a previous status to set.");
	}
};

ZmYahooImService.prototype.createRosterItem =
function(addr, name, groups, params) {
	var data = this._addressToYahooServiceId(addr);
	this._callSdk("addBuddyToGroup", [ this.getMyAddress(), [data.buddy], data.cloud]);
};

ZmYahooImService.prototype.deleteRosterItem =
function(rosterItem, params) {
	var data = this._rosterItemToYahooServiceId(rosterItem);
	this._callSdk("removeBuddy", [ this.getMyAddress(), [data.buddy], data.cloud]);
};

ZmYahooImService.prototype.sendSubscribeAuthorization =
function(accept, add, addr) {
	this._callSdk("sendSubscribe", [ [addr], accept]);
	if (add) {
		this.createRosterItem(addr);
	}
};

ZmYahooImService.prototype.sendMessage =
function(chat, text, html, typing, params) {
	var msg;
	if (html) {
		this._htmlDiv = this._htmlDiv || document.createElement("DIV");
		this._htmlDiv.innerHTML = html;
		msg = YMSGR.YMLUtil.domToYmlRaw(this._htmlDiv);
	} else {
		msg = text;
	}
	var args = {
		current_id: this._userId,
		target_user: this._rosterItemToYahooServiceId(chat.getRosterItem(0)).buddy,
		msg: msg
	};
	if (typing) {
		args.appname = "TYPING";
		args.flag = "0";
	}
	var payload = YMSGR.j2x(args);
	var type = typing ? "typingIndicator" : "im";
	this._callSdk("send", [type, payload]);
};

ZmYahooImService.prototype.closeChat =
function(chat, params) {
};

ZmYahooImService.prototype.handleNotification =
function(im) {
	// No-op.
};

ZmYahooImService.prototype._mapEventToName =
function(id) {
	for (var name in YMSGR.CONST) {
		if ( (YMSGR.CONST[name]==id) && (name.indexOf("YES_")==0) ) {
			return "YMSGR.CONST." + name;
		}
	}
	return id;
};

ZmYahooImService.prototype._showToYConst =
function(show) {
	switch(show) {
	case ZmRosterPresence.SHOW_UNKNOWN: return YMSGR.CONST.YMSG_Unknown;
	case ZmRosterPresence.SHOW_OFFLINE: return YMSGR.CONST.YMSG_Offline;
	case ZmRosterPresence.SHOW_CHAT: return YMSGR.CONST.YMSG_Available;
	case ZmRosterPresence.SHOW_AWAY: return YMSGR.CONST.YMSG_BeRightBack;
	case ZmRosterPresence.SHOW_EXT_AWAY: return YMSGR.CONST.YMSG_SteppedOut;
	case ZmRosterPresence.SHOW_DND: return YMSGR.CONST.YMSG_Busy;
	default: return YMSGR.CONST.YMSG_Available;
	}
};

ZmYahooImService.prototype._yConstToShow =
function(yConst, customDndStatus) {
	switch (parseInt(yConst)) {
	case YMSGR.CONST.YMSG_Unknown: return ZmRosterPresence.SHOW_UNKNOWN;
	case YMSGR.CONST.YMSG_Offline: return ZmRosterPresence.SHOW_OFFLINE;
	case YMSGR.CONST.YMSG_Available: return ZmRosterPresence.SHOW_CHAT;
	case YMSGR.CONST.YMSG_BeRightBack: return ZmRosterPresence.SHOW_AWAY;
	case YMSGR.CONST.YMSG_SteppedOut: return ZmRosterPresence.SHOW_EXT_AWAY;
	case YMSGR.CONST.YMSG_Busy: return ZmRosterPresence.SHOW_DND;
	case YMSGR.CONST.YMSG_Custom:
		return (customDndStatus == YMSGR.CONST.YMSG_Available) ? ZmRosterPresence.SHOW_CHAT : ZmRosterPresence.SHOW_AWAY;
	default: return ZmRosterPresence.SHOW_CHAT;
	}
};

/**
 * Converts a buddy & cloud id to an id that we can use as the buddy id.
 * This is done so buddy ids for this service look like the ones in the
 * Zimbra service, and enables us to look up buddies by email address.
 *
 * @param buddy			[String]	The buddy id given to us by the ym sdk.
 * @param cloud         [Number]	The cloud ID.
 */
ZmYahooImService.prototype._getBuddyId =
function(buddy, cloud) {
	var buddyLower = buddy.toLowerCase();
	if (buddyLower.indexOf('@') != -1) {
		return buddyLower;
	}
	var domains = this._cloudToDomains[cloud || 0];
	return domains ? [buddyLower, domains[0]].join('@') : buddyLower;
};

/**
 * Takes the given roster item and returns a { buddy, cloud_id } pair
 * that can be passed to the yahoo service.
 *
 * @param rosterItem	[ZmRosterItem]	The roster item.
 */
ZmYahooImService.prototype._rosterItemToYahooServiceId =
function(rosterItem) {
	if (rosterItem._yahooServiceId) {
		return {
			buddy: rosterItem._yahooServiceId.buddy,
			cloud: rosterItem._yahooServiceId.cloud || 0
		};
	} else {
		return this._addressToYahooServiceId(rosterItem.id);
	}
};

/**
 * Takes the given email address and returns a { buddy, cloud_id } pair
 * that can be passed to the yahoo service. If the address contains a
 * domain name we don't recognize, then we default to the yahoo cloud.
 *
 * @param addr	[String]	The email address.
 */
ZmYahooImService.prototype._addressToYahooServiceId =
function(addr) {
	if (!this._cloudRegExp) {
		// Create a Regexp that is something like: /([\w\d_\.]+)@(gmail.com|google.com|msn.com)/i
		var buffer = ["([\\w\\d_\.]+)@("];
		var gotOne = false;
		for (var domain in this._domainToCloud) {
			if (gotOne) {
				buffer.push("|");
			}
			buffer.push(domain);
			gotOne = true;
		}
		buffer.push(")");
		this._cloudRegExp = new RegExp(buffer.join(""), "i");
	}

	var match = this._cloudRegExp.exec(addr);
	if (match) {
		return {
			buddy: match[1],
			cloud: this._domainToCloud[match[2]] || ZmYahooImService.YAHOO_CLOUD
		};
	} else {
		return {
			buddy: addr,
			cloud: ZmYahooImService.YAHOO_CLOUD
		};
	}
};

ZmYahooImService.prototype._setPresence =
function(show, customStatusMsg) {
	if (customStatusMsg) {
		this._callSdk("setCustomStatus", [0, 0, customStatusMsg]);
	} else {
		var ymStatus = this._showToYConst(show);
		this._callSdk("setStatus", [ymStatus, false]);
	}

	var visible = show != ZmRosterPresence.SHOW_OFFLINE;
	if (visible != this._visible) {
		this._callSdk("setVisibility", [visible]);
		this._visible = visible;
	}
	if (this._roster.getPresence().setFromJS({ show: show, status: customStatusMsg })) {
		this._roster.notifyPresence();
	}
};

/**
 * This callback is called when an event is sent to the sdk.
 */
ZmYahooImService.prototype._onEvent =
function(ev, params) {
	DBG.println("ym", "ZmYahooImService.prototype.onEvent: " + this._mapEventToName(ev));
	DBG.dumpObj("ym", params, this._mapEventToName(ev));
	DBG.println("ym", "----------------");

	switch (ev) {
		case YMSGR.CONST.YES_PRELOGIN_DATA: this._onPreloginData(params); break;
		case YMSGR.CONST.YES_BUDDY_LIST: this._onBuddyList(params); break;
		case YMSGR.CONST.YES_LOGGED_IN: this._onLoggedIn(params); break;
		case YMSGR.CONST.YES_BUDDY_INFO: this._onBuddyInfo(params); break;
		case YMSGR.CONST.YES_USER_SEND_MESG: this._onUserSendMessage(params); break;
		case YMSGR.CONST.YES_STATUS_SAVED_MESG: this._onStatusSavedMessage(params); break;
		case YMSGR.CONST.YES_SET_AWAY_STATUS: this._onSetAwayStatus(params); break;
		case YMSGR.CONST.YES_USER_LOGOFF_NOTIFY: this._onUserLogoffNotify(params); break;
		case YMSGR.CONST.YES_USER_LOGOFF_OK: this._onUserLogoffOk(params); break;
		case YMSGR.CONST.YES_CONNECTION_FAILED: this._onConnectionFailed(params); break;
		case YMSGR.CONST.YES_USER_LOGOFF_ERR: this._onUserLogoffError(params); break;
		case YMSGR.CONST.YES_ADD_BUDDY: this._onAddBuddy(params); break;
		case YMSGR.CONST.YES_REMOVE_BUDDY: this._onRemoveBuddy(params); break;
		case YMSGR.CONST.YES_BUDDY_AUTHORIZE_NEW_BUDDYOF: this._onBuddyAuthorizeNewBuddyof(params); break;
	}
};

/**
 * Called to give us some data about the logged in user. The user is not yet logged
 * in when this is called.
 */
ZmYahooImService.prototype._onPreloginData =
function(params) {
	this._userId = params.user_id;
	this._loggedIn = true;
	this._roster.onServiceLoggedIn(this._loginParams);
	this._loginParams = null;
};

/**
 * This is called when the user is fully logged in.
 */
ZmYahooImService.prototype._onLoggedIn =
function(params) {
};

/**
 * Called when we get a typing notification.
 */
ZmYahooImService.prototype._onUserSendMessage =
function(params) {
	if (params.appname == "TYPING") {
		var buddy = this._roster.getRosterItem(params.sender);
		if (buddy) {
			buddy._notifyTyping(params.flag == "1");
		}
	}
};

/**
 * Called when a message is received.
 */
ZmYahooImService.prototype._onStatusSavedMessage =
function(params) {
	var jsonObj = {
		thread	: params.hash,
		from 	: this._getBuddyId(params.sender, params.cloud_id),
		to		: this.getMyAddress(),
		ts		: new Date().getTime(),
		body	: [{ _content: YMSGR.YMLUtil.ymlToHtml(params.msg), html: true }]
	};
	var chatMessage = new ZmChatMessage(jsonObj, false);
	this._roster.onServiceAddChatMessage(chatMessage);
};

/**
 * Called when updated info for a buddy is available.
 */
ZmYahooImService.prototype._onBuddyInfo =
function(params) {
	if (params.buddy_info_list) {
		var records = params.buddy_info_list.records;
		for (var i = 0, count = records.length; i < count; i++) {
			 this._updateBuddy(records[i]);
		}
	}
};

/**
 * Called when a buddy's status changes.
 */
ZmYahooImService.prototype._onSetAwayStatus =
function(params) {
	this._updateBuddy(params);
};

ZmYahooImService.prototype._updateBuddy =
function(params) {
	var id = this._getBuddyId(params.buddy, params.cloud_id);
	var rosterItem = this._roster.getRosterItemList().getByAddr(id);
	if (rosterItem) {
		rosterItem._yahooServiceId = { buddy: params.buddy, cloud: params.cloud_id };
		var show = this._yConstToShow(params.away_status, params.custom_dnd_status);
		this._roster.onServiceSetBuddyPresence(rosterItem, { show: show, status: params.away_msg }, true);
	}
};

/**
 * Called when a buddy logs off.
 */
ZmYahooImService.prototype._onUserLogoffNotify =
function(params) {
	var ri = this._roster.getRosterItemList().getByAddr(params.buddy);
	if (ri) {
		this._roster.onServiceSetBuddyPresence(ri, { show: ZmRosterPresence.SHOW_OFFLINE }, true);
	}
};

ZmYahooImService.prototype._setLoggedOff =
function() {
	this._loggedIn = false;
	this._roster.onServiceLoggedOut();
};

/**
 * Called after the user logs off.
 */
ZmYahooImService.prototype._onUserLogoffOk =
function() {
	this._setLoggedOff();
};

/**
 * This user has been disconnected.
 * Sometimes we get this event instead of _onUserLogoffOk.
 */
ZmYahooImService.prototype._onConnectionFailed =
function() {
	this._setLoggedOff();
};

/**
 * Called when the user logs in from another location.
 */
ZmYahooImService.prototype._onUserLogoffError =
function(params) {
	if (params.error_code == "42") {
		var statusArgs = {
			msg: ZmMsg.imBootedYahoo,
			level: ZmStatusView.LEVEL_CRITICAL,
			transitions: [ ZmToast.FADE_IN, { type: "pause", duration: 4000 }, ZmToast.FADE_OUT ]
		};
		appCtxt.setStatusMsg(statusArgs);
	}
	this._setLoggedOff();
};

/**
 * Called to give us the list of the user's buddies.
 */
ZmYahooImService.prototype._onBuddyList =
function(params) {
	var list = this._roster.getRosterItemList();
	list.removeAllItems();
	var itemMap = {};
	var itemList = [];
	if (params.group_record_list && params.group_record_list.records) {
		var groups = params.group_record_list.records;
		for (var groupIndex = 0, groupCount = groups.length; groupIndex < groupCount; groupIndex++) {
			var group = groups[groupIndex];
			if (group && group.buddy_record_list && group.buddy_record_list.records) {
				for (var recordIndex = 0, recordCount = group.buddy_record_list.records.length; recordIndex < recordCount; recordIndex++) {
					var record = group.buddy_record_list.records[recordIndex];
					var rosterItem = itemMap[record.buddy];
					if (!rosterItem) {
						var id = this._getBuddyId(record.buddy, params.cloud_id);
						rosterItem = new ZmRosterItem(id, list, record.name, new ZmRosterPresence(ZmRosterPresence.SHOW_UNKNOWN), group.buddy_grp_name);
						rosterItem._yahooServiceId = { buddy: record.buddy, cloud: undefined };
						itemMap[record.buddy] = rosterItem;
						itemList.push(rosterItem);
					} else {
						rosterItem.addGroup(record.buddy_grp_name);
					}
				}
			}
		}
	}
	if (itemList.length) {
		list.addItems(itemList);
	}
};

/**
 * Called after a buddy is added.
 */
ZmYahooImService.prototype._onAddBuddy =
function(params) {
	var id = this._getBuddyId(params.buddy, params.cloud_id);
	this._roster.onServiceAddBuddy(id, null, null, params.buddy_grp_name, true);
};

/**
 * Called after a buddy is removed.
 */
ZmYahooImService.prototype._onRemoveBuddy =
function(params) {
	var id = this._getBuddyId(params.buddy, params.cloud_id);
	this._roster.onServiceRemoveBuddy(id, true);
};

/**
 * Called when someone wants to add our user to a buddy list.
 */
ZmYahooImService.prototype._onBuddyAuthorizeNewBuddyof =
function(params) {
	this._roster.onServiceRequestBuddyAuth (params.sender);
};

/**
 * Makes a call to the ym sdk, ensuring the sdk is loaded and logging the call.
 *
 * @param functionName	[String]		Name of function on YMSGR.sdk to call
 * @param params		[Array]			Aray of arguments to the function
 */
ZmYahooImService.prototype._callSdk =
function(functionName, params) {
	// If sdk not loaded, load it, then make this call afterwards.
	if (!this._loaded) {
		this._postLoadCalls = this._postLoadCalls  || [];
		this._postLoadCalls.push({ functionName: functionName, params: params });
		this._load();
	} else {
		DBG.println("ym", "YMSGR.sdk." + functionName + "(" + (params ? AjxStringUtil.htmlEncode(params.join(",")) : "") + ")");
		var result = YMSGR.sdk[functionName].apply(YMSGR.sdk, params);
		if (result) {
			DBG.println("ym", "YMSGR.sdk." + functionName + ": Result");
			DBG.dumpObj("ym", result, functionName + ": Result");
		} else {
			DBG.println("ym", functionName + ": null result");
		}
		return result;
	}
};

ZmYahooImService.prototype._load =
function() {
	if (this._loadTimeoutAction) {
		return;
	}
	AjxDispatcher.require(["YmSdk"]);

	this._loadTimeoutAction = new AjxTimedAction(this, this._loadTimeout);
	AjxTimedAction.scheduleAction(this._loadTimeoutAction, 5000);

	var self = this;
	var appObj = {
		onLoaded: function() { self._onLoaded(); },
		onEvent: function(ev, params) { self._onEvent(ev, params); },
		getPrimaryId: function() { return self._getPrimaryId(); }
	};
	
	DBG.println("ym", "YMSGR.sdk.load({appObj, swfUrl})");
	//TODO: Will this resource always be available?
	YMSGR.sdk.load(appObj, "http://l.yimg.com/us.yimg.com/i/us/pim/dclient/k/img/md5/19e66808f1e211b27c640773d37d9bf7_1.swf");
};

/**
 * This callback is called when the sdk is loaded.
 */
ZmYahooImService.prototype._onLoaded =
function() {
	DBG.println("ym", "called ZmYahooImService.prototype._onLoaded");
	AjxTimedAction.cancelAction(this._loadTimeoutAction);
	if (this._loadCallback) {
		this._loadCallback.run();
	}
	this._loaded = true;
	this._loadTimeoutAction = null;
	if (this._postLoadCalls) {
		for (var i = 0, count = this._postLoadCalls.length; i < count; i++) {
			var postLoadObj = this._postLoadCalls[i];
			this._callSdk(postLoadObj.functionName,  postLoadObj.params);
		}
		delete this._postLoadCalls;
	}
};

/**
 * This callback is called if the sdk takes a long time to load.
 */
ZmYahooImService.prototype._loadTimeout =
function() {
	if (this._loadErrorCallback) {
		this._loadErrorCallback.run();
	}
};

/**
 * This callback returns the user's yahoo id.
 */
ZmYahooImService.prototype._getPrimaryId =
function() {
	return this.getMyAddress();

};


