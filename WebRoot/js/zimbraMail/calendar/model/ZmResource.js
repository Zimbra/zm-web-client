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

function ZmResource(appCtxt, list) {
	ZmContact.call(this, appCtxt, ZmItem.RESOURCE, null, list);
};

ZmResource.TYPE_LOCATION	= "Location";
ZmResource.TYPE_EQUIPMENT	= "Equipment";

/**
* Creates a resource from an XML node.
*
* @param node		a "calresource" XML node
* @param args		args to pass to the constructor
*/
ZmResource.createFromDom =
function(node, args) {
	var resource = new ZmResource(args.appCtxt, args.list);
	resource._loadFromDom(node);

	return resource;
};

ZmResource.prototype = new ZmContact;
ZmResource.prototype.constructor = ZmResource;

ZmResource.prototype.isLocation =
function() {
	return this.getAttr("zimbraCalResType") == ZmResource.TYPE_LOCATION;
};

ZmResource.prototype.getAddress =
function() {
	return this.getAttr("mail");
};

ZmResource.prototype.getName =
function() {
	return this.getAttr("displayName");
};
