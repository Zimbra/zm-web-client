/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2004, 2005, 2006, 2007, 2008, 2009, 2010 Zimbra, Inc.
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
 * @overview
 * 
 * This file defines authentication.
 *
 */

/**
 * Constructor. Use {@link execute} to construct the authentication.
 * @class
 * This class represents in-app authentication following the expiration of the session.
 * 
 * @see		#execute
 */
ZmAuthenticate = function() {}

ZmAuthenticate.prototype.isZmAuthenticate = true;
ZmAuthenticate.prototype.toString = function() { return "ZmAuthenticate"; };


ZmAuthenticate._isAdmin = false;

/**
 * Sets the authentication as "admin".
 * 
 * @param	{Boolean}	isAdmin		<code>true</code> if admin
 */
ZmAuthenticate.setAdmin =
function(isAdmin) {
	ZmAuthenticate._isAdmin = isAdmin;
};

/**
 * Executes an authentication.
 * 
 * @param	{String}	uname		the username
 * @param	{String}	pword		the password
 * @param	{AjxCallback}	callback	the callback
 */
ZmAuthenticate.prototype.execute =
function(uname, pword, callback) {
	var command = new ZmCsfeCommand();
	var soapDoc;
	if (!ZmAuthenticate._isAdmin) {
		soapDoc = AjxSoapDoc.create("AuthRequest", "urn:zimbraAccount");
		var el = soapDoc.set("account", uname);
		el.setAttribute("by", "name");
	} else {
		soapDoc = AjxSoapDoc.create("AuthRequest", "urn:zimbraAdmin", null);
		soapDoc.set("name", uname);
	}
	soapDoc.set("virtualHost", location.hostname);	
	soapDoc.set("password", pword);
	var respCallback = new AjxCallback(this, this._handleResponseExecute, callback);
	command.invoke({soapDoc: soapDoc, noAuthToken: true, noSession: true, asyncMode: true, callback: respCallback})
};

/**
 * @private
 */
ZmAuthenticate.prototype._handleResponseExecute =
function(callback, result) {
	if (!result.isException()) {
		ZmCsfeCommand.noAuth = false;
	}

	if (callback) {
		callback.run(result);
	}
};
