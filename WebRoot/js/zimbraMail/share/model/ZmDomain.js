/*
 * ***** BEGIN LICENSE BLOCK *****
 * 
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2004, 2005, 2006, 2007 Zimbra, Inc.
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

ZmDomain = function(name, parent, headerFlags) {
	
	ZmModel.call(this);

	this.name = name.toLowerCase();
	this.parent = parent;
	this._parseHeaderFlags(headerFlags);
	this._subdomains = {};
}

ZmDomain.prototype = new ZmModel;
ZmDomain.prototype.constructor = ZmDomain;

ZmDomain.sortCompare = 
function(a, b) {
	var check = ZmOrganizer.checkSortArgs(a, b);
	if (check != null) return check;

	if (a.name < b.name) return -1;
	if (a.name > b.name) return 1;
	return 0;
};

ZmDomain.prototype.toString = 
function() {
	return "ZmDomain";
};

ZmDomain.prototype.getSubDomain =
function(name) {
	return this._subdomains[name];
};

ZmDomain.prototype.getSubDomains =
function() {
	return this._subdomains;
};

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

ZmDomain.prototype._parseHeaderFlags =
function(flags) {
	this.hasFrom = (flags.indexOf("f") != -1);
	this.hasTo = (flags.indexOf("t") != -1);
	this.hasCc = (flags.indexOf("c") != -1);
};
