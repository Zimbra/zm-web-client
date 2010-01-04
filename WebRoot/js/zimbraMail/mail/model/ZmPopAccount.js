/*
 * ***** BEGIN LICENSE BLOCK *****
 * 
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2006, 2007 Zimbra, Inc.
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

ZmPopAccount = function(id, list) {
	ZmDataSource.call(this, ZmAccount.POP, id, list);
};
ZmPopAccount.prototype = new ZmDataSource;
ZmPopAccount.prototype.constructor = ZmPopAccount;

// Constants
ZmAccount.POP 				= "POP";
ZmPopAccount.PORT_CLEAR 	= 110;
ZmPopAccount.PORT_SSL 		= 995;
ZmPopAccount.PORT_DEFAULT	= ZmPopAccount.PORT_CLEAR;

// advanced settings
ZmPopAccount.prototype.ELEMENT_NAME = "pop3";
ZmPopAccount.prototype.port = ZmPopAccount.PORT_DEFAULT;


// Public methods

ZmPopAccount.prototype.toString =
function() {
	return "ZmPopAccount";
};

ZmPopAccount.prototype.getDefaultPort =
function() {
	return (this.connectionType == ZmDataSource.CONNECT_SSL)
		? ZmPopAccount.PORT_SSL : ZmPopAccount.PORT_DEFAULT;
};
