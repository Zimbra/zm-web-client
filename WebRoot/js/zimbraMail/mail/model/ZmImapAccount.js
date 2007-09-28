/*
 * ***** BEGIN LICENSE BLOCK *****
 * 
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2007 Zimbra, Inc.
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

ZmImapAccount = function(id, list) {
	ZmDataSource.call(this, ZmAccount.IMAP, id, list);
};
ZmImapAccount.prototype = new ZmDataSource;
ZmImapAccount.prototype.constructor = ZmImapAccount;

ZmImapAccount.prototype.toString = function() {
	return "ZmImapAccount";
};

//
// Constants
//

ZmAccount.IMAP = "IMAP";

ZmImapAccount.PORT_CLEAR = 143;
ZmImapAccount.PORT_SSL = 993;
ZmImapAccount.PORT_DEFAULT = ZmImapAccount.PORT_CLEAR;

//
// Data
//

ZmImapAccount.prototype.ELEMENT_NAME = "imap";

// advanced settings

ZmImapAccount.prototype.port = ZmImapAccount.PORT_DEFAULT;

//
// Public methods
//

ZmImapAccount.prototype.getDefaultPort = function() {
	var isSsl = this.connectionType == ZmDataSource.CONNECT_SSL;
	return isSsl ? ZmImapAccount.PORT_SSL : ZmImapAccount.PORT_DEFAULT;
};
