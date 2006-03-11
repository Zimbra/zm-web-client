/*
 * ***** BEGIN LICENSE BLOCK *****
 * Version: ZPL 1.1
 * 
 * The contents of this file are subject to the Zimbra Public License
 * Version 1.1 ("License"); you may not use this file except in
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
 * Portions created by Zimbra are Copyright (C) 2005 Zimbra, Inc.
 * All Rights Reserved.
 * 
 * Contributor(s):
 * 
 * ***** END LICENSE BLOCK *****
 */

/**
* Create a new, empty calendar resources list.
* @constructor
* @class
* This class represents a list of calendar resources. A calendar resource can be a
* location or a piece of equipment. All calendar resource records are stored in the GAL.
*
* @author Conrad Damon
*
* @param appCtxt	[ZmAppCtxt]		the app context
* @param search		[ZmSearch]*		search that generated this list
*/
function ZmResourceList(appCtxt, search) {
	ZmContactList.call(this, appCtxt, search, true, ZmItem.RESOURCE);

	this._emailToResource = {};
};

ZmResourceList.ATTRS =
	["displayName", "mail", "zimbraCalResSite", "zimbraCalResBuilding", "zimbraCalResFloor", "zimbraCalResRoom",
	 "zimbraCalResCapacity", "zimbraCalResContactEmail", "zimbraNotes",
	 "street", "l", "st", "postalCode", "co"];

ZmResourceList.prototype = new ZmContactList;
ZmResourceList.prototype.constructor = ZmResourceList;

ZmResourceList.prototype.load =
function() {
	var conds = [];
	conds.push({attr: "zimbraCalResType", op: "eq", value: ZmResource.TYPE_LOCATION});
	conds.push({attr: "zimbraCalResType", op: "eq", value: ZmResource.TYPE_EQUIPMENT});
	var params = {conds: conds, join: ZmSearch.JOIN_OR, attrs: ZmResource.ATTRS};
	var search = new ZmSearch(this._appCtxt, params);
	
	search.execute({callback: new AjxCallback(this, this._handleResponseLoad)});
};

ZmResourceList.prototype._handleResponseLoad = 
function(result) {
	var resp = result.getResponse();
	this._vector = resp.getResults(ZmItem.RESOURCE).getVector();
	var a = this._vector.getArray();
	for (var i = 0; i < a.length; i++) {
		var resource = a[i];
		var email = resource.getAttr("mail");
		if (email) {
			this._emailToResource[email.toLowerCase()] = resource;
		}
	}
};

/**
* Returns the resource with the given address, if any. Canonical list only.
*
* @param address	[string]	an email address
*/
ZmResourceList.prototype.getResourceByEmail = 
function(address) {
	if (!address || !this.isCanonical) return null;

	return this._emailToResource[address.toLowerCase()];
};
