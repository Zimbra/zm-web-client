/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2006, 2007, 2008, 2009, 2010 Zimbra, Inc.
 * 
 * The contents of this file are subject to the Zimbra Public License
 * Version 1.3 ("License"); you may not use this file except in
 * compliance with the License.  You may obtain a copy of the License at
 * http://www.zimbra.com/license.
 * 
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * ***** END LICENSE BLOCK *****
 */

/**
 * Creates a resource.
 * @class
 * This class represents a resource.
 * 
 * @param	{String}	id		the id
 * @param	{ZmList}	list	the list
 * @param	{constant}	resType		the resource type
 * 
 * @extends		ZmContact
 * @see		ZmCalBaseItem
 */
ZmResource = function(id, list, resType) {
	id = id ? id : Dwt.getNextId();
	ZmContact.call(this, id, list, ZmItem.RESOURCE);
	
	this.resType = resType;
};

ZmResource.F_capacity			= "zimbraCalResCapacity";
ZmResource.F_contactMail		= "zimbraCalResContactEmail";
ZmResource.F_locationName		= "zimbraCalResLocationDisplayName";
ZmResource.F_mail			= "email";
ZmResource.F_name			= "fullName";
ZmResource.F_type			= "zimbraCalResType";
ZmResource.F_description		= "notes";

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
						ZmCalBaseItem.LOCATION : ZmCalBaseItem.EQUIPMENT;
	if (!resource.list) {
		var calApp = appCtxt.getApp(ZmApp.CALENDAR);
		resource.list = (resource.resType == ZmCalBaseItem.LOCATION) ? calApp.getLocations() :
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

/**
 * Checks if the resource is a location.
 * 
 * @return	{Boolean}	<code>true</code> if is location
 */
ZmResource.prototype.isLocation =
function() {
	return (this.resType == ZmCalBaseItem.LOCATION);
};

/**
 * Gets the resource email.
 * 
 * @return	{String}	the email
 */
ZmResource.prototype.getEmail =
function() {
	var attr = this.getAttr(ZmResource.F_mail);
	return attr instanceof Array ? attr[0] : attr;
};

/**
 * Gets the resource full name.
 * 
 * @return	{String}	the full name
 */
ZmResource.prototype.getFullName =
function() {
	return this.getAttr(ZmResource.F_name);
};

/**
 * Initializes from an email address.
 *
 * @param {AjxEmailAddress|String}	email	an email address object an email string
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
