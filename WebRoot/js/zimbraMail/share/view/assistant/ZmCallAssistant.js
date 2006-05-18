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

function ZmCallAssistant(appCtxt) {
	if (arguments.length == 0) return;
	ZmAssistant.call(this, appCtxt, ZmMsg.call, ZmMsg.ASST_CMD_CALL);
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
