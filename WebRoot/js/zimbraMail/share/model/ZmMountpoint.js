/*
 * ***** BEGIN LICENSE BLOCK *****
 * Version: ZPL 1.2
 *
 * The contents of this file are subject to the Zimbra Public License
 * Version 1.2 ("License"); you may not use this file except in
 * compliance with the License. You may obtain a copy of the License at
 * http://www.zimbra.com/license
 *
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied. See
 * the License for the specific language governing rights and limitations
 * under the License.
 *
 * The Original Code is: Zimbra Collaboration Suite Web Client
 *
 * The Initial Developer of the Original Code is Zimbra, Inc.
 * Portions created by Zimbra are Copyright (C) 2006, 2007 Zimbra, Inc.
 * All Rights Reserved.
 *
 * Contributor(s):
 *
 * ***** END LICENSE BLOCK *****
 */

/**
 * A mountpoint organizer. This class can be used to represent generic
 * mountpoints in an overview tree but is mostly used as a utility to
 * create mountpoints.
 */
ZmMountpoint = function(params) {
	params.type = ZmOrganizer.MOUNTPOINT;
	ZmOrganizer.call(this, params);
	this.view = params.view;
}

ZmMountpoint.prototype = new ZmOrganizer;
ZmMountpoint.prototype.constructor = ZmMountpoint;

// Constants
ZmMountpoint.__CREATE_PARAMS = { "l":1, "name":1, "zid":1, "rid":1, "owner":1, "path":1, "view":1, "color":1, "f":1 };


// Public Methods

ZmMountpoint.prototype.toString =
function() {
	return "ZmMountpoint";
};

/**
 * @param params		[Object]		A hash of the request attributes and values.
 */
ZmMountpoint.create =
function(params, callback, errorCallback) {
	var soapDoc = AjxSoapDoc.create("CreateMountpointRequest", "urn:zimbraMail");

	var linkNode = soapDoc.set("link");
	for (var p in params) {
		if (!(p in ZmMountpoint.__CREATE_PARAMS)) continue;
		linkNode.setAttribute(p, params[p]);
	}

	appCtxt.getAppController().sendRequest({soapDoc:soapDoc,
											asyncMode:true,
											callback:callback,
											errorCallback:errorCallback});
};
