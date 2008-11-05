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

ZmZimbraImServiceController = function() {
	ZmImServiceController.call(this, true);

	// Create the service model object.
	new ZmZimbraImService();
}

ZmZimbraImServiceController.prototype = new ZmImServiceController;
ZmZimbraImServiceController.prototype.constructor = ZmZimbraImServiceController;


// Public methods

ZmZimbraImServiceController.prototype.toString =
function() {
	return "ZmZimbraImServiceController";
};

ZmZimbraImServiceController.prototype.login =
function(callback) {
	// Login is a no-op since we're aloready connected to the zimbra server.
	if (callback) {
		callback.run();
	}
};

ZmZimbraImServiceController.prototype.getMyPresenceTooltip =
function(showText) {
	this._presenceTooltipFormat = this._presenceTooltipFormat || new AjxMessageFormat(ZmMsg.presenceTooltip);
	return this._presenceTooltipFormat.format(showText);
};

ZmZimbraImServiceController.prototype.createPresenceMenu =
function(parent) {
	var statuses = [
		ZmOperation.IM_PRESENCE_OFFLINE,
		ZmOperation.IM_PRESENCE_ONLINE,
		ZmOperation.IM_PRESENCE_CHAT,
		ZmOperation.IM_PRESENCE_DND,
		ZmOperation.IM_PRESENCE_AWAY,
		ZmOperation.IM_PRESENCE_XA
	];
	return new ZmPresenceMenu(parent, statuses);
};

ZmZimbraImServiceController.prototype.getSupportsAccounts =
function() {
	return true;
};


