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
 * Portions created by Zimbra are Copyright (C) 2005, 2006 Zimbra, Inc.
 * All Rights Reserved.
 * 
 * Contributor(s):
 * 
 * ***** END LICENSE BLOCK *****
 */

/**
 * 
 */
ZmPref = function(id, name, dataType) {

	ZmSetting.call(this, id, name, ZmSetting.T_PREF, dataType);
	
	this.origValue = null;
	this.isDirty = false;
};

ZmPref.prototype = new ZmSetting;
ZmPref.prototype.constructor = ZmPref;

ZmPref.KEY_ID = "prefId_";

ZmPref.TYPE_INPUT		= "INPUT";
ZmPref.TYPE_CHECKBOX	= "CHECKBOX";
ZmPref.TYPE_SELECT		= "SELECT";
ZmPref.TYPE_TEXTAREA	= "TEXTAREA";
ZmPref.TYPE_PASSWORD	= "PASSWORD";
ZmPref.TYPE_FONT		= "FONT";
ZmPref.TYPE_IMPORT		= "IMPORT";
ZmPref.TYPE_EXPORT		= "EXPORT";
ZmPref.TYPE_SHORTCUTS	= "SHORTCUTS";

// custom functions for loading and validation

ZmPref.loadSkins =
function(appCtxt, setup) {
	var skins = appCtxt.get(ZmSetting.AVAILABLE_SKINS);
	for (var i = 0; i < skins.length; i++) {
		var skin = skins[i];
		setup.options.push(skin);
		var skin1 = skin.substr(0, 1).toUpperCase() + skin.substr(1);
		var text = ZmMsg['skin' + skin1];
		text = text ? text : skin1;
		setup.displayOptions.push(text);
	}
};

ZmPref.validateEmail = 
function(emailStr) {
	if (emailStr) {
		var match = AjxEmailAddress.parse(emailStr);
		return (match != null);
	}
	return true;
};

ZmPref.validatePollingInterval = 
function(interval) {
	var minimum = window._zimbraMail._appCtxt.get(ZmSetting.MIN_POLLING_INTERVAL);
	if (interval && minimum && interval >= minimum) {
		return true;
	} else {
		var min = minimum / 60;
		ZmPref.SETUP[ZmSetting.POLLING_INTERVAL].errorMessage = AjxMessageFormat.format(ZmMsg.invalidPollingInterval, min);
		return false;
	}
};

// maximum value lengths
ZmPref.MAX_LENGTH = {};
ZmPref.MAX_LENGTH[ZmSetting.INITIAL_SEARCH]	= 512;
ZmPref.MAX_LENGTH[ZmSetting.SIGNATURE]		= 1024;
ZmPref.MAX_LENGTH[ZmSetting.AWAY_MESSAGE]	= 8192;

ZmPref.setPrefList =
function(prefsId, list) {
	ZmPref[prefsId] = list;
};

/** The SETUP object for a pref gets translated into a form input. Available properties are:
 * 
 * displayName			descriptive text
 * displayContainer		type of form input: checkbox, select, input, or textarea
 * options				values for a select input
 * displayOptions		text for the select input's values
 * validationFunction	function to validate the value
 * errorMessage			message to show if validation fails
 * displaySeparator		if true, a line will be drawn below this pref
 * precondition			pref will not be displayed unless precondition is true
 */

ZmPref.SETUP = {};
ZmPref.registerPref =
function(id, params) {
	ZmPref.SETUP[id] = params;
};

