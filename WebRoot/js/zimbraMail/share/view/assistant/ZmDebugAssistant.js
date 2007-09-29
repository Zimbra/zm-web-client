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

function ZmDebugAssistant(appCtxt) {
	if (arguments.length == 0) return;
	ZmAssistant.call(this, appCtxt, "Debugging Info", ".debug");
};

ZmDebugAssistant.prototype = new ZmAssistant();
ZmDebugAssistant.prototype.constructor = ZmDebugAssistant;

ZmDebugAssistant.prototype.okHandler =
function() {
	if (this._newLevel >= 0) DBG.setDebugLevel(this._newLevel);
	return true;
};

ZmDebugAssistant.prototype.handle =
function(dialog, verb, args) {
	var	match = args.match(/^\s*([0123])\s*$/);
	this._newLevel = match ? parseInt(match[1]) : -1;
	var set = this._newLevel >= 0;
	dialog._setOkButton(AjxMsg.ok, true, set);
	this._setField("Current Level", DBG.getDebugLevel()+"", false, true);
	this._setField("New Level", !set ? "(0 = none, 1 = minimal, 2 = moderate, 3 = anything goes)" : this._newLevel+"", !set, true);
};
