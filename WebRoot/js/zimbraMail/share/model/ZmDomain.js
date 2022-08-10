/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2004, 2005, 2006, 2007, 2008, 2009, 2010, 2013, 2014, 2016 Synacor, Inc.
 *
 * The contents of this file are subject to the Common Public Attribution License Version 1.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at: https://www.zimbra.com/license
 * The License is based on the Mozilla Public License Version 1.1 but Sections 14 and 15
 * have been added to cover use of software over a computer network and provide for limited attribution
 * for the Original Developer. In addition, Exhibit A has been modified to be consistent with Exhibit B.
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * See the License for the specific language governing rights and limitations under the License.
 * The Original Code is Zimbra Open Source Web Client.
 * The Initial Developer of the Original Code is Zimbra, Inc.  All rights to the Original Code were
 * transferred by Zimbra, Inc. to Synacor, Inc. on September 14, 2015.
 *
 * All portions of the code are Copyright (C) 2004, 2005, 2006, 2007, 2008, 2009, 2010, 2013, 2014, 2016 Synacor, Inc. All Rights Reserved.
 * ***** END LICENSE BLOCK *****
 */

/**
 * @overview
 * 
 * This file defines a domain.
 *
 */

/**
 * Creates a domain
 * @class
 * This class represents a domain.
 * 
 * @param	{String}	name	the name
 * @param	{Object}	parent	the parent
 * @param	{String}	headerFlags		header flags
 * 
 * @extends	ZmModel
 */
ZmDomain = function(name, parent, headerFlags) {
	
	ZmModel.call(this);

	this.name = name.toLowerCase();
	this.parent = parent;
	this._parseHeaderFlags(headerFlags);
	this._subdomains = {};
}

ZmDomain.prototype = new ZmModel;
ZmDomain.prototype.constructor = ZmDomain;

/**
 * Compares two domains by name.
 * 
 * @param	{ZmDomain}	a		the first domain
 * @param	{ZmDomain}	b		the second domain
 * @return	{int}	0 if the domains match; 1 if "a" is before "b"; -1 if "b" is before "a"
 */
ZmDomain.sortCompare = 
function(a, b) {
	var check = ZmOrganizer.checkSortArgs(a, b);
	if (check != null) return check;

	if (a.name < b.name) return -1;
	if (a.name > b.name) return 1;
	return 0;
};

/**
 * Returns a string representation of the object.
 * 
 * @return		{String}		a string representation of the object
 */
ZmDomain.prototype.toString = 
function() {
	return "ZmDomain";
};

/**
 * Gets the sub-domain.
 * 
 * @param	{String}	name		the name
 * @return	{ZmDomain}	the sub-domain
 */
ZmDomain.prototype.getSubDomain =
function(name) {
	return this._subdomains[name];
};

/**
 * Gets the sub-domains.
 * 
 * 
 */
ZmDomain.prototype.getSubDomains =
function() {
	return this._subdomains;
};

/**
 * Gets the sub-domains.
 * 
 * @return	{Array}	an array of {@link ZmDomain} objects (sorted)
 */
ZmDomain.prototype.getSortedSubDomains = 
function() {
	if (this._sorted) {
		return this._sorted;
	}
	this._sorted = [];
	for (var d in this._subdomains) {
		this._sorted.push(this._subdomains[d]);
	}
	this._sorted.sort(ZmDomain.sortCompare);
	return this._sorted;
};

/**
 * Adds the sub-domain.
 * 
 * @param	{String}	name		the name
 * @param	{String}	headerFlags		the header flags
 * @return	{ZmDomain}	the newly created sub-domain
 */
ZmDomain.prototype.addSubDomain =
function(name, headerFlags) {
	name = name.toLowerCase();
	var sd = this._subdomains[name];
	if (sd) {
		return sd;
	}
		
	sd = new ZmDomain(name, this, headerFlags);
	this._subdomains[name] = sd;

	if (this._sorted) {
		delete this._sorted;
	}

	return sd;
};

/**
 * @private
 */
ZmDomain.prototype._parseHeaderFlags =
function(flags) {
	this.hasFrom = (flags.indexOf("f") != -1);
	this.hasTo = (flags.indexOf("t") != -1);
	this.hasCc = (flags.indexOf("c") != -1);
};
