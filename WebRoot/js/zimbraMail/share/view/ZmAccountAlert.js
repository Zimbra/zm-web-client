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
 * Alert class that hilites and flashes an account's accordian item..
 *
 * @param app ZmApp
 */
ZmAccountAlert = function(account) {
	ZmAlert.call(this);
	this.account = account;
};

ZmAccountAlert.prototype = new ZmAlert;
ZmAccountAlert.prototype.constructor = ZmAccountAlert;

ZmAccountAlert.prototype.toString =
function() {
	return "ZmAccountAlert";
};

ZmAccountAlert.get =
function(account) {
	ZmAccountAlert.INSTANCES = ZmAccountAlert.INSTANCES || {};
	if (!ZmAccountAlert.INSTANCES[account.id]) {
		ZmAccountAlert.INSTANCES[account.id] = new ZmAccountAlert(account);
	}
	return ZmAccountAlert.INSTANCES[account.id];
};

ZmAccountAlert.prototype.start =
function() {
	if (this.account != appCtxt.getActiveAccount()) {
		this._update(true);
	}
};

ZmAccountAlert.prototype.stop =
function() {
	this._update(false);
};

ZmAccountAlert.prototype._update =
function(status) {
	var item = appCtxt.getOverviewController().getAccordionItem(this.account);
	if (item) {
		item.accordion.showAlert(item.id, status);
	}
}

