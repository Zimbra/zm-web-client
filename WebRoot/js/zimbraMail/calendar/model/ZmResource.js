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

function ZmResource(appCtxt, id, list) {
	ZmContact.call(this, appCtxt, id, list, ZmItem.RESOURCE);
};

ZmResource.TYPE_LOCATION	= "Location";
ZmResource.TYPE_EQUIPMENT	= "Equipment";

ZmResource.F_capacity			= "zimbraCalResCapacity";
ZmResource.F_contactMail		= "zimbraCalResContactEmail";
ZmResource.F_locationName		= "zimbraCalResLocationDisplayName";
ZmResource.F_mail				= "mail";
ZmResource.F_name				= "displayName";
ZmResource.F_type				= "zimbraCalResType";

/**
* Creates a resource from an XML node.
*
* @param node		a "calresource" XML node
* @param args		args to pass to the constructor
*/
ZmResource.createFromDom =
function(node, args) {
	var resource = new ZmResource(args.appCtxt, node.id, args.list);
	resource._loadFromDom(node);

	return resource;
};

ZmResource.prototype = new ZmContact;
ZmResource.prototype.constructor = ZmResource;

ZmResource.prototype.isLocation =
function() {
	return this.getAttr(ZmResource.F_type) == ZmResource.TYPE_LOCATION;
};

ZmResource.prototype.getEmail =
function() {
	return this.getAttr(ZmResource.F_mail);
};

ZmResource.prototype.getFullName =
function() {
	return this.getAttr(ZmResource.F_name);
};

/**
* 
*
* @param email		an ZmEmailAddress, or an email string
*/
ZmResource.prototype.initFromEmail =
function(email) {
	if (email instanceof ZmEmailAddress) {
		this.setAttr(ZmResource.F_mail, email.getAddress());
		this.setAttr(ZmResource.F_name, email.getName());
	} else {
		this.setAttr(ZmResource.F_mail, email.getAddress());
	}
};
