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

ZmYahooImServiceController = function() {
	ZmImServiceController.call(this, true);

	// Create the service model object.
	new ZmYahooImService();
}

ZmYahooImServiceController.prototype = new ZmImServiceController;
ZmYahooImServiceController.prototype.constructor = ZmYahooImServiceController;


// Public methods

ZmYahooImServiceController.prototype.toString =
function() {
	return "ZmYahooImServiceController";
};

ZmYahooImServiceController.prototype.getPresenceOperations =
function() {
	return [
		ZmOperation.IM_PRESENCE_OFFLINE,
		ZmOperation.IM_PRESENCE_ONLINE,
		ZmOperation.IM_PRESENCE_DND
	];
};
