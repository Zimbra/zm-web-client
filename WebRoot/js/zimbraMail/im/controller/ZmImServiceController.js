/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2008, 2009 Zimbra, Inc.
 * 
 * The contents of this file are subject to the Zimbra Public License
 * Version 1.2 ("License"); you may not use this file except in
 * compliance with the License.  You may obtain a copy of the License at
 * http://www.zimbra.com/license.
 * 
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * ***** END LICENSE BLOCK *****
 */

/**
 * Creates an IM service controller.
 * @constructor
 * @class ZmImServiceController
 * This class is a base class for IM service controllers.
 *
 */
ZmImServiceController = function(roster, capabilities) {
	if (arguments.length == 0) { return; }

	this._roster = roster;

	/** Service model object.
	 * @type ZmImService 
	 */
	this.service = null;

	/** Hash of supported capabilities. Capabilities are defined as constants on ZmImServiceController. */
	this.capabilities = {};
	for (var i = 0, count = capabilities ? capabilities.length : 0; i < count; i++) {
		this.capabilities[capabilities[i]] = true;
	}
};

/** true if the service supports multiple accounts (aka gateways) */
ZmImServiceController.ACCOUNTS = "ACCOUNTS";

/** true if the service supports conferences */
ZmImServiceController.CONFERENCES = "INSTANT_NOTIFY";

/** true if the service supports a preference for auto login */
ZmImServiceController.AUTO_LOGIN_PREF = "AUTO_LOGIN_PREF";

/** true if the service allows the users to change instant notify */
ZmImServiceController.INSTANT_NOTIFY = "INSTANT_NOTIFY";

/**
 * Logs in to the im service.
 *
 * @param params		[hash]					hash of params:
 *        callback		[AjxCallback] 			Callback to run after login. Optional
 *        presence		[hash]					{ show, customStatusMsg }
 *        auto			[Boolean]				true if this is auto login on startup
 */
ZmImServiceController.prototype.login =
function(params) {
	alert('Not implemented');
};

/**
 * Returns the tooltip to show over the app's presence button.
 *
 * @param showText		[String]				Text for the current presence
 */
ZmImServiceController.prototype.getMyPresenceTooltip =
function(showText) {
	alert('Not implemented');
};

/**
 * Defines the contents of the presence menu.
 */
ZmImServiceController.prototype.defineStatusMenu =
function() {
	alert('Not implemented');
};
