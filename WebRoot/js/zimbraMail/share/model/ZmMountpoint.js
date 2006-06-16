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
 * Portions created by Zimbra are Copyright (C) 2006 Zimbra, Inc.
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
function ZmMountpoint(id, name, parent, tree, color, view) {
	ZmOrganizer.call(ZmOrganizer.MOUNTPOINT, id, name, parent, tree);
	this.color = color || ZmOrganizer.DEFAULT_COLOR;
	this.view = view;
}
ZmMountpoint.prototype = new ZmOrganizer;
ZmMountpoint.prototype.constructor = ZmMountpoint;

ZmMountpoint.prototype.toString = function() {
	return "ZmMountpoint";
};

//
// Constants
//

ZmMountpoint.__CREATE_PARAMS = { "l":1, "name":1, "zid":1, "rid":1, "d":1, "path":1, "view":1 };

//
// Data
//

ZmMountpoint.prototype.color;
ZmMountpoint.prototype.view;

//
// Public functions
//

/**
 * @param params		[Object]		A hash of the request attributes and values.
 */
ZmMountpoint.create =
function(appCtxt, params, callback, errorCallback) {
	var soapDoc = AjxSoapDoc.create("CreateMountpointRequest", "urn:zimbraMail");

	var linkNode = soapDoc.set("link");
	for (var p in params) {
		if (!(p in ZmMountpoint.__CREATE_PARAMS)) continue;
		linkNode.setAttribute(p, params[p]);
	}

	var args = [appCtxt, params, callback, errorCallback];
	var respCallback = callback ? new AjxCallback(null, ZmMountpoint._setColor, args) : null;
	var params = {
		soapDoc: soapDoc,
		asyncMode: Boolean(callback),
		callback: respCallback,
		errorCallback: errorCallback
	};

	var controller = appCtxt.getAppController();
	var response = controller.sendRequest(params);

	if (!callback) {
		args.push(response);
		return ZmMountpoint._setColor.apply(window, args);
	}
};

ZmMountpoint._setColor =
function(appCtxt, params, callback, errorCallback, response) {
	// TODO: error handling
	var resp = response._data && response._data.CreateMountpointResponse;
	var mountpointId = resp.link[0].id;

	var args = [mountpointId, callback];
	var color = params.color;
	if (color != null) {
		var soapDoc = AjxSoapDoc.create("FolderActionRequest", "urn:zimbraMail");

		var actionNode = soapDoc.set("action");
		actionNode.setAttribute("id", mountpointId);
		actionNode.setAttribute("op", "color");
		actionNode.setAttribute("color", color);

		var respCallback = callback ? new AjxCallback(null, ZmMountpoint._finish, args) : null;
		var params = {
			soapDoc: soapDoc,
			asyncMode: Boolean(callback),
			callback: respCallback,
			errorCallback: errorCallback
		};

		var controller = appCtxt.getAppController();
		response = controller.sendRequest(params);
	}

	if (color == null || !callback) {
		args.push(response);
		return ZmMountpoint._finish.apply(window, args);
	}
};

ZmMountpoint._finish =
function(mountpointId, callback, response) {
	if (callback) {
		callback.run(mountpointId);
	}
};