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
 * Portions created by Zimbra are Copyright (C) 2006 Zimbra, Inc.
 * All Rights Reserved.
 * 
 * Contributor(s):
 * 
 * ***** END LICENSE BLOCK *****
 */

function ZmMixedApp(appCtxt, container) {
	ZmApp.call(this, ZmZimbraMail.MIXED_APP, appCtxt, container);
};

ZmMixedApp.prototype = new ZmApp;
ZmMixedApp.prototype.constructor = ZmMixedApp;

ZmMixedApp.prototype.toString = 
function() {
	return "ZmMixedApp";
};

ZmMixedApp.prototype.launch = function() {}

ZmMixedApp.prototype.getMixedController =
function() {
	if (!this._mixedController)
		this._mixedController = new ZmMixedController(this._appCtxt, this._container, this);
	return this._mixedController;
};

ZmMixedApp.prototype.getComposeController =
function() {
	return this._appCtxt.getApp(ZmZimbraMail.MAIL_APP).getComposeController();
};
