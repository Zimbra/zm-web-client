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

/**
* Creates a phone.
* @constructor
* @class
* This class represents a phone.
*
*/
function ZmPhone() {
	this.name = null; // The internal representation of the phone.
	this.used = null; // Amount of quota used.
	this.limit = null; // Quota size.
}

ZmPhone.prototype = new ZmItem;
ZmPhone.prototype.constructor = ZmPhone;

ZmPhone.prototype.toString = 
function() {
	return "ZmPhone";
}

ZmPhone.calculateDisplay =
function(name) {
	if (name.length == 10) {
		var array = [
			"(",
			name.substring(0, 3),
			") ",
			name.substring(3, 6),
			"-",
			name.substring(6, 10)
		];
		return array.join("");
	} else {
// TODO: How to handle other numbers????	
		return name;
	}
};

ZmPhone.prototype.getDisplay = 
function() {
	if (!this._display) {
		this._display = ZmPhone.calculateDisplay(this.name);
	}
	return this._display;
};

ZmPhone.prototype._loadFromDom = 
function(node) {
	this.name =  node.name;
	if (node.used && node.used.length) this.used =  node.used[0]._content;
	if (this.limit && this.limit.length) this.limit = node.limit[0]._content;
};

