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

ZmSharingController = function() {
	ZmController.call(this, null);
};
ZmSharingController.prototype = new ZmController;
ZmSharingController.prototype.constructor = ZmSharingController;

ZmSharingController.prototype.toString = function() { return "ZmSharingController"; };

//
// Constants
//

ZmSharingController.TYPE_USER	= "usr";
ZmSharingController.TYPE_GROUP	= "grp";
ZmSharingController.TYPE_ALL	= "all";

ZmSharingController.prototype.getShares =
function(type, owner, callback) {

	var jsonObj = {GetShareInfoRequest:{_jsns:"urn:zimbraAccount"}};
	var request = jsonObj.GetShareInfoRequest;
	if (type && type != ZmSharingController.TYPE_ALL) {
		request.grantee = {type:type};
	}
	if (owner) {
		request.owner = {by:"name", _content:owner};
	}
	var respCallback = new AjxCallback(this, this._handleGetSharesResponse, [callback]);
	appCtxt.getAppController().sendRequest({jsonObj:jsonObj,
											asyncMode:true,
											callback:respCallback});
};

ZmSharingController.prototype._handleGetSharesResponse =
function(callback, result) {

	var resp = result.getResponse().GetShareInfoResponse;
	if (callback) {
		callback.run(resp.share);
	}
};
