/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2008, 2009, 2010, 2013, 2014, 2016 Synacor, Inc.
 *
 * The contents of this file are subject to the Common Public Attribution License Version 1.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at: https://www.zimbra.com/license
 * The License is based on the Mozilla Public License Version 1.1 but Sections 14 and 15
 * have been added to cover use of software over a computer network and provide for limited attribution
 * for the Original Developer. In addition, Exhibit A has been modified to be consistent with Exhibit B.
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * See the License for the specific language governing rights and limitations under the License.
 * The Original Code is Zimbra Open Source Web Client.
 * The Initial Developer of the Original Code is Zimbra, Inc.  All rights to the Original Code were
 * transferred by Zimbra, Inc. to Synacor, Inc. on September 14, 2015.
 *
 * All portions of the code are Copyright (C) 2008, 2009, 2010, 2013, 2014, 2016 Synacor, Inc. All Rights Reserved.
 * ***** END LICENSE BLOCK *****
 */

/**
 * Abstract base class of flashing alerts.
 * @class
 * This is an abstract base class of flashing alerts.
 * 
 */
ZmAlert = function() {
	this._isLooping = false;
};

// Abstract methods.
ZmAlert.prototype.start = null; // function ()
ZmAlert.prototype.stop = null; // function ()
ZmAlert.prototype._update = null; // function(status)

ZmAlert.prototype._startLoop =
function() {
	if (!ZmAlertLoop.INSTANCE) {
		ZmAlertLoop.INSTANCE = new ZmAlertLoop();
	}
	ZmAlertLoop.INSTANCE._add(this);
	this._isLooping = true;
};

ZmAlert.prototype._stopLoop =
function() {
	//no need to do anything if already not looping
	if (!this._isLooping) {
		return;
	}
	if (ZmAlertLoop.INSTANCE) {
		ZmAlertLoop.INSTANCE._remove(this);
	}
	this._isLooping = false;
	this._update(false);
};

///////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////

/**
 * Private class only used by ZmAlert.
 * Manages an interval that tells alerts when to flash icons and titles and such.
 * @class
 * @private 
 */
ZmAlertLoop = function() {
	this._alerts = new AjxVector();
	this._flashOn = false;
	if (appCtxt.multiAccounts) {
		appCtxt.accountList.addActiveAcountListener(new AjxListener(this, this._accountChangeListener), 0);
	}
};

ZmAlertLoop.prototype._add =
function(alert) {
	this._alerts.add(alert, 0, true);
	if (!this._alertInterval) {
		this._alertInterval = setInterval(AjxCallback.simpleClosure(this._alertTimerCallback, this), 1500);
	}
};

ZmAlertLoop.prototype._remove =
function(alert) {
	this._alerts.remove(alert);
	if (this._alertInterval && !this._alerts.size()) {
		clearInterval(this._alertInterval);
		this._alertInterval = 0;
	}
};

ZmAlertLoop.prototype._alertTimerCallback =
function() {
	this._flashOn = !this._flashOn;
	for (var i = 0, count = this._alerts.size(); i < count; i++) {
	    this._alerts.get(i)._update(this._flashOn);
	}
};

ZmAlertLoop.prototype._accountChangeListener =
function() {
	// Stop all flashing alerts.
	var array = this._alerts.getArray();
	var alert;
	while (alert = array.unshift()) {
		alert.stop();
	}
};

