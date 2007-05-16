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

function ZmImGateway(obj) {
	this.type = obj.type.toLowerCase();
	this.domain = obj.domain.toLowerCase();
	var cs = this.connect_state = {};
	if (obj.registration) {
		for (var i = 0; i < obj.registration.length; ++i) {
			var r = obj.registration[i];
			// cs[r.name] = r;
			cs["-"] = r;
		}
	}
};

ZmImGateway.STATE = {
	UNKNOWN		       : "unknown",
	BAD_AUTH	       : "bad_auth",
	INTENTIONALLY_OFFLINE  : "intentionally_offline",
	ONLINE		       : "online",
	SHUTDOWN	       : "shutdown",
	START		       : "start",
	TRYING_TO_CONNECT      : "trying_to_connect",
	BOOTED_BY_OTHER_LOGIN  : "booted_by_other_login"
};

ZmImGateway.LOGIN_FORBIDDEN_STATES = {};
ZmImGateway.LOGIN_FORBIDDEN_STATES[ZmImGateway.STATE.ONLINE] = true;
ZmImGateway.LOGIN_FORBIDDEN_STATES[ZmImGateway.STATE.INTENTIONALLY_OFFLINE] = true;
ZmImGateway.LOGIN_FORBIDDEN_STATES[ZmImGateway.STATE.START] = true;
ZmImGateway.LOGIN_FORBIDDEN_STATES[ZmImGateway.STATE.TRYING_TO_CONNECT] = true;

ZmImGateway.prototype.getState = function(name) {
	if (name) {
		var s = this.connect_state[name];
		return s ? s.state : null;
	}
	return this.connect_state;
};

ZmImGateway.prototype.setState = function(name, state) {
	var s = this.connect_state[name];
	if (s == null)
		s = this.connect_state[name] = {};
	s.state = state;
};
