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

/**
 * Creates an IM service controller.
 * @constructor
 * @class ZmImServiceController
 * This class is a base class for IM service controllers.
 *
 */
ZmImServiceController = function(roster) {
	if (arguments.length == 0) { return; }

	this._roster = roster;
};

/**
 * Logs in to the im service.
 *
 * @param params		[hash]					hash of params:
 *        callback		[AjxCallback] 			Callback to run after login. Optional
 *        presence		[hash]					{ show, customStatusMsg }
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
 * Create the presnece menu
 *
 * @param parent		[DwtControl]			Parent control
 */
ZmImServiceController.prototype.createPresenceMenu =
function(parent) {
	alert('Not implemented');
};

/**
 * Returns true if the service supports multiple accounts (aka gsateways)
 */
ZmImServiceController.prototype.getSupportsAccounts =
function() {
	alert('Not implemented');
};
