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
 * Portions created by Zimbra are Copyright (C) 2007 Zimbra, Inc.
 * All Rights Reserved.
 *
 * Contributor(s):
 *
 * ***** END LICENSE BLOCK *****
 */

ZmAccount = function(appCtxt, type, id, name, list) {
	if (arguments.length == 0) return;

	this._appCtxt = appCtxt;
	this.id = id;
	this.name = name;
	this.type = type;
};

ZmAccount.prototype.toString =
function() {
	return "ZmAccount";
};

//
// Public methods
//

ZmAccount.prototype.setName =
function(name) {
	this.name = name;
};

ZmAccount.prototype.getName =
function() {
	return this.name;
};

// sub-classes MUST override these methods

ZmAccount.prototype.setEmail =
function(email) {
	throw this.toString()+"#setEmail";
};

ZmAccount.prototype.getEmail =
function() {
	throw this.toString()+"#getEmail";
};

ZmAccount.prototype.getIdentity =
function() {
	throw this.toString()+"#getIdentity";
};
