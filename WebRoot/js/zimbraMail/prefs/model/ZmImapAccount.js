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
