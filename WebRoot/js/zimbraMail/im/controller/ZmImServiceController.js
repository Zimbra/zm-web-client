/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2008, 2009, 2010, 2013, 2014 Zimbra, Inc.
 * 
 * The contents of this file are subject to the Common Public Attribution License Version 1.0 (the "License");
 * you may not use this file except in compliance with the License. 
 * You may obtain a copy of the License at: http://www.zimbra.com/license
 * The License is based on the Mozilla Public License Version 1.1 but Sections 14 and 15 
 * have been added to cover use of software over a computer network and provide for limited attribution 
 * for the Original Developer. In addition, Exhibit A has been modified to be consistent with Exhibit B. 
 * 
 * Software distributed under the License is distributed on an "AS IS" basis, 
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. 
 * See the License for the specific language governing rights and limitations under the License. 
 * The Original Code is Zimbra Open Source Web Client. 
 * The Initial Developer of the Original Code is Zimbra, Inc. 
 * All portions of the code are Copyright (C) 2008, 2009, 2010, 2013, 2014 Zimbra, Inc. All Rights Reserved. 
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
