/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2006, 2007, 2009, 2010, 2012, 2013, 2014, 2016 Synacor, Inc.
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
 * All portions of the code are Copyright (C) 2006, 2007, 2009, 2010, 2012, 2013, 2014, 2016 Synacor, Inc. All Rights Reserved.
 * ***** END LICENSE BLOCK *****
 */

/**
 * @overview
 * This file defines a mountpoint organizer class.
 */

/**
 * Creates a mountpoint organizer.
 * @class
 * This class represents a mountpoint organizer. This class can be used to represent generic
 * mountpoints in an overview tree but is mostly used as a utility to create mountpoints.
 * 
 * @param	{Hash}	params		a hash of parameters
 * 
 * @extends		ZmOrganizer
 */
ZmMountpoint = function(params) {
	params.type = ZmOrganizer.MOUNTPOINT;
	ZmOrganizer.call(this, params);
	this.view = params.view;
}

ZmMountpoint.prototype = new ZmOrganizer;
ZmMountpoint.prototype.constructor = ZmMountpoint;

// Constants
ZmMountpoint.__CREATE_PARAMS = AjxUtil.arrayAsHash(["l", "name", "zid", "rid", "owner", "path", "view", "color", "rgb", "f"]);


// Public Methods

/**
 * Returns a string representation of the object.
 * 
 * @return		{String}		a string representation of the object
 */
ZmMountpoint.prototype.toString =
function() {
	return "ZmMountpoint";
};

/**
 * Creates the mountpoint.
 * 
 * @param {Hash}	params		a hash of parameters
 * @param	{String}	params.name		the name
 */
ZmMountpoint.create =
function(params, callback) {
	var soapDoc = AjxSoapDoc.create("CreateMountpointRequest", "urn:zimbraMail");

	var linkNode = soapDoc.set("link");
	for (var p in params) {
		if (!(p in ZmMountpoint.__CREATE_PARAMS)) continue;
		linkNode.setAttribute(p, params[p]);
	}

	var errorCallback = new AjxCallback(null, ZmMountpoint._handleCreateError, params.name);
	appCtxt.getAppController().sendRequest({soapDoc:soapDoc,
											asyncMode:true,
											callback:callback,
											errorCallback:errorCallback});
};

/**
 * @private
 */
ZmMountpoint._handleCreateError =
function(name, response) {

	var msg;
	if (response.code == ZmCsfeException.SVC_PERM_DENIED || response.code == ZmCsfeException.MAIL_NO_SUCH_FOLDER) {
		msg = ZmCsfeException.getErrorMsg(response.code);
	} else if (response.code == ZmCsfeException.MAIL_ALREADY_EXISTS) {
        var type = appCtxt.getFolderTree(appCtxt.getActiveAccount()).getFolderTypeByName(name);
		msg = AjxMessageFormat.format(ZmMsg.errorAlreadyExists, [name,type.toLowerCase()]);
	}
	if (msg) {
		appCtxt.getAppController().popupErrorDialog(msg, null, null, true);
		return true;
	}
};
