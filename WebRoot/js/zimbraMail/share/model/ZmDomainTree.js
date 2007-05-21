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
 * Portions created by Zimbra are Copyright (C) 2005, 2006 Zimbra, Inc.
 * All Rights Reserved.
 * 
 * Contributor(s):
 * 
 * ***** END LICENSE BLOCK *****
 */

ZmDomainTree = function(appCtxt) {
	ZmModel.call(this);
	this._appCtxt = appCtxt;
};

ZmDomainTree.prototype = new ZmModel;
ZmDomainTree.prototype.constructor = ZmDomainTree;

ZmDomainTree.prototype.toString = 
function() {
	return "ZmDomainTree";
};

ZmDomainTree.prototype.getRootDomain =
function() {
	return this._rootDomain;
};

ZmDomainTree.prototype.load =
function(callback) {
	this._rootDomain = new ZmDomain(".", null, "");

	var soapDoc = AjxSoapDoc.create("BrowseRequest", "urn:zimbraMail", null);
	soapDoc.getMethod().setAttribute("browseBy", "domains");

	var respCallback = new AjxCallback(this, this._handleResponseLoad, callback);
	this._appCtxt.getAppController().sendRequest({soapDoc: soapDoc, asyncMode: true, callback: respCallback});
};

ZmDomainTree.prototype._handleResponseLoad =
function(callback, result) {
	var domains = result.getResponse().BrowseResponse.bd;
	if (domains)
		for (var i = 0; i < domains.length; i++)
			this._rootDomain.addSubDomain(domains[i]._content, domains[i].h);

	if (callback) callback.run(result);
};
