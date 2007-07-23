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
 * Portions created by Zimbra are Copyright (C) 2006-2007 Zimbra, Inc.
 * All Rights Reserved.
 * 
 * Contributor(s):
 * 
 * ***** END LICENSE BLOCK *****
 */

ZmPopAccount = function(appCtxt, id, list) {
	if (arguments.length == 0) return;
	ZmDataSource.call(this, appCtxt, ZmAccount.POP, id, list);
};
ZmPopAccount.prototype = new ZmDataSource;
ZmPopAccount.prototype.constructor = ZmPopAccount;

ZmPopAccount.prototype.toString =
function() {
	return "ZmPopAccount";
};

//
// Constants
//

ZmAccount.POP = "POP";

ZmPopAccount.PORT_CLEAR = 110;
ZmPopAccount.PORT_SSL = 995;
ZmPopAccount.PORT_DEFAULT = ZmPopAccount.PORT_CLEAR;

//
// Data
//

ZmPopAccount.prototype.ELEMENT_NAME = "pop3";

// advanced settings

ZmPopAccount.prototype.port = ZmPopAccount.PORT_DEFAULT;

//
// Public methods
//

ZmPopAccount.prototype.getDefaultPort = function() {
	var isSsl = this.connectionType == ZmDataSource.CONNECT_SSL;
	return isSsl ? ZmPopAccount.PORT_SSL : ZmPopAccount.PORT_DEFAULT;
};
