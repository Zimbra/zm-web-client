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

ZmCallAssistant = function() {
	ZmAssistant.call(this, ZmMsg.call, ZmMsg.ASST_CMD_CALL);
};

ZmCallAssistant.prototype = new ZmAssistant();
ZmCallAssistant.prototype.constructor = ZmCallAssistant;

ZmCallAssistant.prototype.okHandler =
function(dialog) {
	return true;	//override
};

ZmCallAssistant.prototype.handle =
function(dialog, verb, args) {
	dialog._setOkButton(AjxMsg.ok, true, true);
};

// called first time dialog switches to this assistant
ZmCallAssistant.prototype.initialize =
function(dialog) {
	var html = new AjxBuffer();
	html.append("<div>HelloWorld</div>");
	dialog.setAssistantContent(html.toString());
};

// called when dialog switches away from this assistant
ZmCallAssistant.prototype.finish =
function(dialog) {

};
