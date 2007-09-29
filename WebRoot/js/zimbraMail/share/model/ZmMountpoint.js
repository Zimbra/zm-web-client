/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2006 Zimbra, Inc.
 * 
 * The contents of this file are subject to the Yahoo! Public License
 * Version 1.0 ("License"); you may not use this file except in
 * compliance with the License.  You may obtain a copy of the License at
 * http://www.zimbra.com/license.
 * 
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied.
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

ZmMountpoint.__CREATE_PARAMS = { "l":1, "name":1, "zid":1, "rid":1, "owner":1, "path":1, "view":1, "color":1, "f":1 };

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

	appCtxt.getAppController().sendRequest({soapDoc:soapDoc, asyncMode:true, callback:callback, errorCallback:errorCallback});
};
