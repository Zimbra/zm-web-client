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
	AjxDispatcher.require(["YmSdk"]);

	//TODO: Will this resource always be available?
	YMSGR.sdk.load(this, "http://l.yimg.com/us.yimg.com/i/us/pim/dclient/k/img/md5/19e66808f1e211b27c640773d37d9bf7_1.swf");
}

ZmYahooImService.prototype = new ZmImService;
ZmYahooImService.prototype.constructor = ZmYahooImService;


// Public methods

ZmYahooImService.prototype.toString =
function() {
	return "ZmYahooImService";
};

ZmYahooImService.prototype.getMyAddress =
function() {
	return "dgctest";
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

ZmYahooImService.prototype.setPresence =
function(show, priority, customStatusMsg, batchCommand) {
	if (!this._loaded) {
		return;
	}
	if (customStatusMsg) {
		YMSGR.sdk.setCustomStatus(0, 0, customStatusMsg);
	} else {
		var ymStatus;
		switch (show) {
		case ZmRosterPresence.SHOW_OFFLINE: ymStatus = YMSGR.CONST.YMSG_Busy; break;
		default: ymStatus = YMSGR.CONST.YMSG_Available; break;
		}
		YMSGR.sdk.setStatus(ymStatus, false);
	}
};

ZmYahooImService.prototype.setIdle =
function(idle, idleTime) {
};

ZmYahooImService.prototype._handleResponseGetRoster =
function(callback, response) {
};

ZmYahooImService.prototype.createRosterItem =
function(addr, name, groups, params) {
	YMSGR.sdk.sendSubscribe([addr], true);
};

ZmYahooImService.prototype.deleteRosterItem =
function(rosterItem, params) {
	YMSGR.sdk.sendSubscribe([rosterItem.id], false);
};

ZmYahooImService.prototype.sendSubscribeAuthorization =
function(accept, add, addr) {
};

ZmYahooImService.prototype.sendMessage =
function(chat, text, html, typing, params) {
	//TODO....
	if (typing) {
		return;
	}

	var args = {
		current_id: "dgctest",
		target_user: chat.getRosterItem(0).id,
		msg: html || text
	};
	if (typing) {
		args.appname = "TYPING";
		args.flag = "0";
	}
	var payload = YMSGR.j2x(args);
	var type = typing ? "typingIndicator" : "im";
	YMSGR.sdk.send(type, payload);
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

/**
 * This callback is called when an event is sent to the sdk.
 */
ZmYahooImService.prototype.onEvent =
function(ev, params) {
	DBG.println("ym", "ZmYahooImService.prototype.onEvent: " + this.mapEventToName(ev));
	DBG.dumpObj("ym", params);
	DBG.println("ym", "----------------");

	switch (ev) {
	case YMSGR.CONST.YES_PRELOGIN_DATA: {
//		params = { firstname, lastname, user_id }
		break;
	}
	case YMSGR.CONST.YES_BUDDY_LIST: {
//		params = {
//			group_record_list {
//		      records: [ { buddy_grp_name: xxx, buddy_record_list: [ { buddy, name, unauth } ] } ]
//		    }
//		    ignored_buddy_record_list: [ { buddy, name } ]

		var list = this._roster.getRosterItemList();
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
							rosterItem = new ZmRosterItem(record.buddy, list, record.name, null, group.buddy_grp_name);
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


		break;
	}
	case YMSGR.CONST.YES_LOGGED_IN: {
		break;
	}
	case YMSGR.CONST.YES_PREFERENCE_DATA: {
		break;
	}
	case YMSGR.CONST.YES_BUDDY_INFO: {
		break;
	}
	case YMSGR.CONST.YES_USER_HAS_MAIL: {
		break;
	}
	}
};

/**
 * This callback is called when the sdk is loaded.
 */
ZmYahooImService.prototype.onLoaded =
function() {
	this._loaded = true;

// TODO: Clean up all these params....	
	var params = {
//		servers: [{host: "webcs.msg.yahoo.com", port: 5050}, {host: "httpcs.msg.yahoo.com", port: 80}],
		cookie: "Y=v=1&n=bja0geghk49rg&l=362j4ij/o&p=m272s2v012000000&r=jl&lg=en-US&intl=us; T=z=Mxh/IBMFJEJBS7w9UUk0DufNDU0BjQyMTIzMzQxTzQ-&a=QAE&sk=DAAyHwyz5.2/zi&ks=EAAAFaoIZvMCdMGPsBajCR3Cw--~C&d=c2wBTXpJekFUTTFOalUwTkRNMk9ETS0BYQFRQUUBZwFFT0lRNTdHUUg1WElaR1M1VldWSlZHQzZYWQF0aXABUlBvUHhCAXp6AU14aC9JQkE3RQ--",
//		userId: null,
		vendorId: 415
//		countryCode: "us",
//		weight: 6,
//		visible: true
	};

	YMSGR.sdk.login(params);
};

/**
 * This callback returns the user's yahoo id.
 */
ZmYahooImService.prototype.getPrimaryId =
function() {
	return this.getMyAddress();

};


