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

ZmZimbraImServiceController.prototype.getPresenceOperations =
function() {
	return [
		ZmOperation.IM_PRESENCE_OFFLINE,
		ZmOperation.IM_PRESENCE_ONLINE,
		ZmOperation.IM_PRESENCE_CHAT,
		ZmOperation.IM_PRESENCE_DND,
		ZmOperation.IM_PRESENCE_AWAY,
		ZmOperation.IM_PRESENCE_XA
	];
};
