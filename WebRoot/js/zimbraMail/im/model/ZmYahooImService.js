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

ZmYahooImService = function() {
	ZmImService.call(this, true);

	this._visible = false;
	this._userId = null;
	this._loggedIn = false;
	this._load();
};

ZmYahooImService.prototype = new ZmImService;
ZmYahooImService.prototype.constructor = ZmYahooImService;


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
function(cookie, callback) {
	this._loginCallback = callback;

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


ZmYahooImService.prototype.getMyAddress =
function() {
	return this._userId;
};

ZmYahooImService.prototype.getGateways =
function(callback, params) {
	var gateways = [{ type: "YAHOO", domain: "YAHOO" }];
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
function() {
	this.setPresence(ZmRosterPresence.SHOW_ONLINE);
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
	this._callSdk("sendSubscribe", [[addr], true]);
};

ZmYahooImService.prototype.deleteRosterItem =
function(rosterItem, params) {
	this._callSdk("sendSubscribe", [[rosterItem.id], false]);
};

ZmYahooImService.prototype.sendSubscribeAuthorization =
function(accept, add, addr) {
};

ZmYahooImService.prototype.sendMessage =
function(chat, text, html, typing, params) {
	var args = {
		current_id: this._userId,
		target_user: chat.getRosterItem(0).id,
		msg: html || text
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

ZmYahooImService.prototype._send =
function(params, soapDoc, callback) {
};


ZmYahooImService.prototype.mapEventToName =
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
	DBG.println("ym", "ZmYahooImService.prototype.onEvent: " + this.mapEventToName(ev));
	DBG.dumpObj("ym", params, this.mapEventToName(ev));
	DBG.println("ym", "----------------");

	switch (ev) {
	case YMSGR.CONST.YES_PRELOGIN_DATA: {
		this._onPreloginData(params);
		break;
	}
	case YMSGR.CONST.YES_BUDDY_LIST: {
		this._onBuddyList(params);
		break;
	}
	case YMSGR.CONST.YES_LOGGED_IN: {
		break;
	}
	case YMSGR.CONST.YES_PREFERENCE_DATA: {
		break;
	}
	case YMSGR.CONST.YES_BUDDY_INFO: {
		this._onBuddyInfo(params);
		break;
	}
	case YMSGR.CONST.YES_USER_HAS_MAIL: {
		break;
	}
	case YMSGR.CONST.YES_USER_SEND_MESG: {
		this._onUserSendMessage(params);
		break;
	}
	case YMSGR.CONST.YES_STATUS_SAVED_MESG: {
		this._onStatusSavedMessage(params);
		break;
	}
	case YMSGR.CONST.YES_SET_AWAY_STATUS: {
		this._onSetAwayStatus(params);
		break;
	}
	case YMSGR.CONST.YES_USER_LOGOFF_NOTIFY: {
		this._onUserLogoffNotify(params);
		break;
	}
	}
};

ZmYahooImService.prototype._onPreloginData =
function(params) {
//	params = { firstname, lastname, user_id }
	this._loggedIn = true;
	this._userId = params.user_id;
	if (this._loginCallback) {
		this._loginCallback.run();
		this._loginCallback = null;
	}
};

ZmYahooImService.prototype._onUserSendMessage =
function(params) {
//appname: "TYPING",
//flag: "1",
//msg: " ",
//sender: "nameofsender",
//target_user: "myname"
	if (params.appname == "TYPING") {
		var buddy = this._roster.getRosterItem(params.sender);
		if (buddy) {
			buddy._notifyTyping(params.flag == "1");
		}
	}
};

ZmYahooImService.prototype._onStatusSavedMessage =
function(params) {
//Key_63: ";0",
//hash: "BQvdkQRnoAw1TK//5AKdAVIG1ZkGnw==",
//imv_flag: "0",
//msg: "Grrrrrrrr",
//sender: "nameofsender",
//target_user: "myname",
//utf8_flag: "1"
	var jsonObj = {
		thread	: params.hash,
		from 	: params.sender,
		to		: this.getMyAddress(),
		ts		: new Date().getTime(),
		body	: [{ _content: params.msg, html: true }]
	};
	var chatMessage = new ZmChatMessage(jsonObj, false);
	this._roster.addChatMessage(chatMessage);
};

ZmYahooImService.prototype._onBuddyInfo =
function(params) {
//buddy_info_list: {
//	records: [
//		0: {
//		  Key_198: "0",
//		  Key_213: "0",
//		  away_status: "2",
//		  buddy: "buddyId",
//		  capability_matrix: "892703",
//		  custom_dnd_status: "0",
//		  flag: "1",
//		  name: "buddyName"
//		 }
//	]
//}
	if (params.buddy_info_list) {
		var records = params.buddy_info_list.records;
		for (var i = 0, count = records.length; i < count; i++) {
			 this._updateBuddy(records[i]);
		}
	}
};

ZmYahooImService.prototype._onSetAwayStatus =
function(params) {
//away_msg: "Away",
//away_status: "99",  (Seems to always be "0" or "99")
//buddy: "buddyId",
//custom_dnd_status: "1",
//flag: "1",
//name: "buddyName",
//no_idle_time: "1",
//utf8_flag: "1"
	this._updateBuddy(params);
};

ZmYahooImService.prototype._updateBuddy =
function(params) {
//away_msg: "Away",
//away_status: "99",  (Seems to always be "0" or "99")
//buddy: "buddyId",
//custom_dnd_status: "1",
//flag: "1",
//name: "buddyName",
//no_idle_time: "1",
//utf8_flag: "1"
	var ri = this._roster.getRosterItemList().getByAddr(params.buddy);
	if (ri) {
		var show = this._yConstToShow(params.away_status, params.custom_dnd_status);
		this._roster.setRosterItemPresence(ri, { show: show, status: params.away_msg }, true);
	}
};

ZmYahooImService.prototype._onUserLogoffNotify =
function(params) {
//away_status: "-1",
//buddy: "buddyId",
//custom_dnd_status: "2",
//flag: "0",
//name: "buddyName",
//utf8_flag: "1"
	var ri = this._roster.getRosterItemList().getByAddr(params.buddy);
	if (ri) {
		this._roster.setRosterItemPresence(ri, { show: ZmRosterPresence.SHOW_OFFLINE }, true);
	}
};

ZmYahooImService.prototype._onBuddyList =
function(params) {
//		params = {
//			group_record_list {
//		      records: [ { buddy_grp_name: xxx, buddy_record_list: [ { buddy, name, unauth } ] } ]
//		    }
//		    ignored_buddy_record_list: [ { buddy, name } ]

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
						rosterItem = new ZmRosterItem(record.buddy, list, record.name, new ZmRosterPresence(ZmRosterPresence.SHOW_UNKNOWN), group.buddy_grp_name);
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

ZmYahooImService.prototype._callSdk =
function(functionName, params) {
	DBG.println("ym", "YMSGR.sdk." + functionName + "(" + (params ? params.join(",") : "") + ")");
	var result = YMSGR.sdk[functionName].apply(YMSGR.sdk, params);
	if (result) {
		DBG.println("ym", "YMSGR.sdk." + functionName + ": Result");
		DBG.dumpObj("ym", result, functionName + ": Result");
	} else {
		DBG.println("ym", functionName + ": null result");
	}
};

ZmYahooImService.prototype._load =
function() {
	AjxDispatcher.require(["YmSdk"]);

	var self = this;
	var appObj = {
		onLoaded: function() { self._onLoaded(); },
		onEvent: function(ev, params) { self._onEvent(ev, params); },
		getPrimaryId: function() { return self._getPrimaryId(); }
	};
	
	//TODO: Will this resource always be available?
	this._callSdk("load", [appObj, "http://l.yimg.com/us.yimg.com/i/us/pim/dclient/k/img/md5/19e66808f1e211b27c640773d37d9bf7_1.swf"]);
};

/**
 * This callback is called when the sdk is loaded.
 */
ZmYahooImService.prototype._onLoaded =
function() {
	this._loaded = true;
};

/**
 * This callback returns the user's yahoo id.
 */
ZmYahooImService.prototype._getPrimaryId =
function() {
	return this.getMyAddress();

};


