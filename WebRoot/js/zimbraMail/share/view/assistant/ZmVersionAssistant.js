/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2006 Zimbra, Inc.
 * 
 * The contents of this file are subject to the Yahoo! Public License
 * Version 1.0 ("License"); you may not use this file except in
 * compliance with the License.  You may obtain a copy of the License at
 * http://www.zimbra.com/license.
 * 
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * ***** END LICENSE BLOCK *****
 */

function ZmVersionAssistant(appCtxt) {
	if (arguments.length == 0) return;
	ZmAssistant.call(this, appCtxt, "Client Version Information", ".version");
};

ZmVersionAssistant.prototype = new ZmAssistant();
ZmVersionAssistant.prototype.constructor = ZmVersionAssistant;

ZmVersionAssistant.prototype.handle =
function(dialog, verb, args) {
	dialog._setOkButton(AjxMsg.ok, true, true);
	this._setField("Version", this._appCtxt.get(ZmSetting.CLIENT_VERSION), false, true);
	this._setField("Release", this._appCtxt.get(ZmSetting.CLIENT_RELEASE), false, true);
	this._setField("Build Date", this._appCtxt.get(ZmSetting.CLIENT_DATETIME), false, true);	
};
