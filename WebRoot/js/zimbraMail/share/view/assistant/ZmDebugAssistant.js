/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2006, 2007, 2009, 2010, 2011 Zimbra, Inc.
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
 */

/**
 * Creates the debug assistant.
 * @class
 * This class represents a debug assistant.
 * 
 * @extends		ZmAssistant
 */
ZmDebugAssistant = function() {
	ZmAssistant.call(this, "Debugging Info", ".debug");
	this._dbg = window.DBG;	// trick to fool minimizer regex
};

ZmDebugAssistant.prototype = new ZmAssistant();
ZmDebugAssistant.prototype.constructor = ZmDebugAssistant;

ZmDebugAssistant.prototype.okHandler =
function() {
	if (this._newLevel >= 0) {
		this._dbg.setDebugLevel(this._newLevel);
	}
	return true;
};

ZmDebugAssistant.__RE_handleNumber = new RegExp(["^",ZmAssistant.SPACES,"([0123])",ZmAssistant.SPACES,"$"].join(""));

ZmDebugAssistant.prototype.handle =
function(dialog, verb, args) {
	var	match = args.match(ZmDebugAssistant.__RE_handleNumber);
	this._newLevel = match ? parseInt(match[1]) : -1;
	var set = this._newLevel >= 0;
	dialog._setOkButton(AjxMsg.ok, true, set);
	this._setField("Current Level", this._dbg.getDebugLevel()+"", false, true);
	this._setField("New Level", !set ? "(0 = none, 1 = minimal, 2 = moderate, 3 = anything goes)" : this._newLevel+"", !set, true);
};
