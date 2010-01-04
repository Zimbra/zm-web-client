/*
 * ***** BEGIN LICENSE BLOCK *****
 * 
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2007 Zimbra, Inc.
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

ZmImGateway = function(obj) {
	this.type = obj.type.toLowerCase();
	this.domain = obj.domain.toLowerCase();
	this.nick = null;
	this.state = ZmImGateway.STATE.UNKNOWN;
	if (obj.registration) {
		for (var i = 0; i < obj.registration.length; ++i) {
			var r = obj.registration[i];
			this.nick = r.name;
			this.state = r.state;
			break;
		}
	}
	this._eventMgr = new AjxEventMgr();
};

ZmImGateway.STATE = {
	UNKNOWN		       : "unknown",
	BAD_AUTH	       : "bad_auth",
	INTENTIONALLY_OFFLINE  : "intentionally_offline",
	ONLINE		       : "online",
	SHUTDOWN	       : "shutdown",
	START		       : "start",
	TRYING_TO_CONNECT      : "trying_to_connect",
	BOOTED_BY_OTHER_LOGIN  : "disabled" // FIXME?
};

ZmImGateway.LOGIN_FORBIDDEN_STATES = {};
ZmImGateway.LOGIN_FORBIDDEN_STATES[ZmImGateway.STATE.ONLINE] = true;
ZmImGateway.LOGIN_FORBIDDEN_STATES[ZmImGateway.STATE.INTENTIONALLY_OFFLINE] = true;
ZmImGateway.LOGIN_FORBIDDEN_STATES[ZmImGateway.STATE.START] = true;
ZmImGateway.LOGIN_FORBIDDEN_STATES[ZmImGateway.STATE.TRYING_TO_CONNECT] = true;

ZmImGateway.EVENT_SET_STATE = "ZmImGateway.setState";

ZmImGateway.prototype.getNick = function() {
	return this.nick;
};

ZmImGateway.prototype.getState = function() {
	return this.state;
};

ZmImGateway.prototype.setState = function(name, state) {
	if (state == "disabled")
		state = ZmImGateway.STATE.BOOTED_BY_OTHER_LOGIN;
	if (name != null)
		this.nick = name;
	this.state = state;
	this._eventMgr.notifyListeners(ZmImGateway.EVENT_SET_STATE, {
					       gw    : this,
					       nick  : name,
					       state : state
				       });
};

ZmImGateway.prototype.isOnline = function() {
	var state = this.getState();
	var nick = this.getNick();
	if (state && nick && ZmImGateway.LOGIN_FORBIDDEN_STATES[state])
		return nick;
	return null;
};

ZmImGateway.prototype.addListener = function(ev, listener) {
	this._eventMgr.addListener(ev, listener);
};

ZmImGateway.prototype.removeListener = function(ev, listener) {
	this._eventMgr.removeListener(ev, listener);
};

ZmImGateway.prototype.reconnect = function() {
	// we don't have an _appCtxt here.  :(
	AjxDispatcher.run("GetRoster").reconnectGateway(this);
};
