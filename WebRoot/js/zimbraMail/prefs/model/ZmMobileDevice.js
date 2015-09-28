/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2009, 2010, 2013, 2014 Zimbra, Inc.
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
 * All portions of the code are Copyright (C) 2009, 2010, 2013, 2014 Zimbra, Inc. All Rights Reserved. 
 * ***** END LICENSE BLOCK *****
 */

/**
 * Creates an empty mobile device object.
 * @constructor
 * @class
 * This class represents  mobile device.
 * 
 * @author Parag Shah
 *
 * @param	{Hash}		params		a hash of parameters
 * @param	{Date}		params.lastPolicyUpdate		the last policy update time
 * @param	{Date}		params.firstReqReceived		the first request received time
 * @param	{Date}		params.remoteWipeAckTime		the remote wipe acknowledged time
 * @param	{Date}		params.remoteWipeReqTime		the remote wipe requested time
 * @param	{constant}	params.status			the status (see <code>ZmMobileDevice.STATUS_</code>)
 */
ZmMobileDevice = function(params) {
	this.lastPolicyUpdate = params.lastPolicyUpdate;
	this.firstReqReceived = params.firstReqReceived;
	this.remoteWipeAckTime = params.remoteWipeAckTime;
	this.remoteWipeReqTime = params.remoteWipeReqTime;
	this.status = params.status;
	this.provisionable = params.provisionable;
	this.protocol = params.protocol;
	this.ua = params.ua;
	this.type = params.type;
	this.id = params.id;
};

ZmOAuthConsumerApp = function(params) {
    this.accessToken = params.accessToken ;
    this.appName = params.appName;
    this.approvedOn = params.approvedOn;
    this.device = params.device;
};


// Consts

/**
 * Defines the "need provision" status.
 */
ZmMobileDevice.STATUS_NEED_PROVISION		= 0;
/**
 * Defines the "OK" status.
 */
ZmMobileDevice.STATUS_OK					= 1;
/**
 * Defines the "suspended" status.
 */
ZmMobileDevice.STATUS_SUSPENDED				= 2;
/**
 * Defines the "remote wipe requested" status.
 */
ZmMobileDevice.STATUS_REMOTE_WIPE_REQUESTED	= 3;
/**
 * Defines the "remote wipe complete" status.
 */
ZmMobileDevice.STATUS_REMOTE_WIPE_COMPLETE	= 4;
/**
 * Defines the "OAuth Consumer App" status.
 */
ZmMobileDevice.TYPE_OAUTH = 'oauth';


// Public methods

ZmMobileDevice.prototype.toString =
function() {
	return "ZmMobileDevice";
};

/**
 * Gets the status.
 * 
 * @return	{constant}	the status (see <code>ZmMobileDevice.STATUS_</code> constants)
 */
ZmMobileDevice.prototype.getStatus =
function() {
	return (!this.provisionable && this.status == ZmMobileDevice.STATUS_NEED_PROVISION)
		? ZmMobileDevice.STATUS_OK : this.status;
};

/**
 * Gets the status string.
 * 
 * @return	{String}	the status string
 */
ZmMobileDevice.prototype.getStatusString =
function() {
	var status = this.getStatus();

	switch (status) {
		case ZmMobileDevice.STATUS_NEED_PROVISION:			return ZmMsg.mobileStatusNeedProvision;
		case ZmMobileDevice.STATUS_OK:						return ZmMsg.mobileStatusOk;
		case ZmMobileDevice.STATUS_SUSPENDED:				return ZmMsg.mobileStatusSuspended;
		case ZmMobileDevice.STATUS_REMOTE_WIPE_REQUESTED:	return ZmMsg.mobileStatusWipe;
		case ZmMobileDevice.STATUS_REMOTE_WIPE_COMPLETE:	return ZmMsg.mobileStatusWipeComplete;
	}
	return "";
};

/**
 * Gets the last policy update time as a string.
 * 
 * @return	{String}	the last policy update string
 */
ZmMobileDevice.prototype.getLastPolicyUpdateString =
function() {
	return this.lastPolicyUpdate ? AjxDateUtil.computeDateTimeString(new Date(this.lastPolicyUpdate*1000)) : "";
};

/**
 * Gets the first request received time as a string.
 * 
 * @return	{String}	the first request received string
 */
ZmMobileDevice.prototype.getFirstReqReceivedString =
function() {
	return this.firstReqReceived ? AjxDateUtil.computeDateTimeString(new Date(this.firstReqReceived*1000)) : "";
};

/**
 * Gets the remote wipe acknowledged time as a string.
 * 
 * @return	{String}	the remote wipe acknowledged string
 */
ZmMobileDevice.prototype.getRemoteWipeAckTimeString =
function() {
	return this.remoteWipeAckTime ? AjxDateUtil.computeDateTimeString(new Date(this.remoteWipeAckTime*1000)) : "";
};

/**
 * Gets the remote wipe requested time as a string.
 * 
 * @return	{String}	the remote wipe requested string
 */
ZmMobileDevice.prototype.getRemoteWipeReqTimeString =
function() {
	return this.remoteWipeReqTime ? AjxDateUtil.computeDateTimeString(new Date(this.remoteWipeReqTime*1000)) : "";
};

ZmMobileDevice.prototype.doAction =
function(id, callback) {
	var request;
	switch (id) {
		case ZmOperation.MOBILE_REMOVE: 		request = "RemoveDeviceRequest"; break;
		case ZmOperation.MOBILE_RESUME_SYNC:	request = "ResumeDeviceRequest"; break;
		case ZmOperation.MOBILE_SUSPEND_SYNC:	request = "SuspendDeviceRequest"; break;
		case ZmOperation.MOBILE_WIPE:			request = "RemoteWipeRequest"; break;
		case ZmOperation.MOBILE_CANCEL_WIPE:	request = "CancelPendingRemoteWipeRequest"; break;
	}

	if (request) {
		var soapDoc = AjxSoapDoc.create(request, "urn:zimbraSync");
		var node = soapDoc.set("device");
		node.setAttribute("id", this.id);

		var respCallback = new AjxCallback(this, this._handleDoAction, callback);
		appCtxt.getAppController().sendRequest({soapDoc:soapDoc, asyncMode:true, callback:respCallback});
	}
};

ZmMobileDevice.prototype._handleDoAction =
function(callback, results) {
	var resp = results.getResponse();
	for (var i in resp) {
		var device = resp[i].device && resp[i].device[0];
		if (device && device.id == this.id) {
			this.status = device.status;
			if (device.lastPolicyUpdate) {
				this.lastPolicyUpdate = device.lastPolicyUpdate;
			}
			if (device.firstReqReceived) {
				this.firstReqReceived = device.firstReqReceived;
			}
			if (device.remoteWipeAckTime) {
				this.remoteWipeAckTime = device.remoteWipeAckTime;
			}
			if (device.remoteWipeReqTime) {
				this.remoteWipeReqTime = device.remoteWipeReqTime;
			}
		}
	}

	if (callback) {
		callback.run();
	}
};
