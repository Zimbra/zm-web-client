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

ZmResource = function(id, list, resType) {
	id = id ? id : Dwt.getNextId();
	ZmContact.call(this, id, list, ZmItem.RESOURCE);
	
	this.resType = resType;
};

ZmResource.F_capacity			= "zimbraCalResCapacity";
ZmResource.F_contactMail		= "zimbraCalResContactEmail";
ZmResource.F_locationName		= "zimbraCalResLocationDisplayName";
ZmResource.F_mail				= "mail";
ZmResource.F_name				= "displayName";
ZmResource.F_type				= "zimbraCalResType";

ZmResource.ATTR_LOCATION	= "Location";
ZmResource.ATTR_EQUIPMENT	= "Equipment";

/**
* Creates a resource from an XML node.
*
* @param node		a "calresource" XML node
* @param args		args to pass to the constructor
*/
ZmResource.createFromDom =
function(node, args) {
	var resource = new ZmResource(node.id, args.list);
	resource._loadFromDom(node);
	resource.resType = (resource.getAttr(ZmResource.F_type) == ZmResource.ATTR_LOCATION) ?
						ZmCalItem.LOCATION : ZmCalItem.EQUIPMENT;
	if (!resource.list) {
		var calApp = appCtxt.getApp(ZmApp.CALENDAR);
		resource.list = (resource.resType == ZmCalItem.LOCATION) ? calApp.getLocations() :
																   calApp.getEquipment();
	}
	
	return resource;
};

ZmResource.prototype = new ZmContact;
ZmResource.prototype.constructor = ZmResource;

ZmResource.prototype.toString =
function() {
	return "ZmResource";
};

ZmResource.prototype.isLocation =
function() {
	return (this.resType == ZmCalItem.LOCATION);
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
* @param email	[object]	a AjxEmailAddress, or an email string
*/
ZmResource.prototype.initFromEmail =
function(email) {
	if (email instanceof AjxEmailAddress) {
		this.setAttr(ZmResource.F_mail, email.getAddress());
		this.setAttr(ZmResource.F_name, email.getName());
	} else {
		this.setAttr(ZmResource.F_mail, email);
	}
};
