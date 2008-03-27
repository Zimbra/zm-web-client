/*
 * ***** BEGIN LICENSE BLOCK *****
 * 
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2005, 2006, 2007 Zimbra, Inc.
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

/**
* Creates a setting.
* @constructor
* @class
* This class represents a single setting. A setting's default value never changes; it
* is available in case the user wishes to restore the current value to the default.
* Most but not all settings have a corollary on the server side. Settings that don't
* will depend on the environment or user activity to get their value.
*
* @author Conrad Damon
* 
* @param id				a unique ID
* @param params			hash:
*        name			the name of the pref or attr on the server
*        type			config, pref, or COS
*        dataType		string, int, or boolean
*        defaultValue	default value
*        isGlobal		whether this setting is global across accounts
*/
ZmSetting = function(id, params) {

	if (arguments.length == 0) return;
	ZmModel.call(this, ZmEvent.S_SETTING);
	
	this.id = id;
	this.name = params.name;
	this.type = params.type;
	this.dataType = params.dataType || ZmSetting.D_STRING;
	this.defaultValue = params.defaultValue;
	if (params.isGlobal) {
		ZmSetting.IS_GLOBAL[id] = true;
	}
	
	if (this.dataType == ZmSetting.D_HASH) {
		this.value = {};
		this.defaultValue = {};
	} else if (this.dataType == ZmSetting.D_LIST) {
		this.value = [];
		this.defaultValue = [];
	} else {
		this.value = null;
	}
}

ZmSetting.prototype = new ZmModel;
ZmSetting.prototype.constructor = ZmSetting;

// setting types
ZmSetting.T_CONFIG		= "config";
ZmSetting.T_PREF		= "pref";
ZmSetting.T_COS			= "cos";
ZmSetting.T_PSEUDO		= "pseudo";

// setting data types
ZmSetting.D_STRING		= "string"; // default type
ZmSetting.D_INT			= "int";
ZmSetting.D_BOOLEAN		= "boolean";
ZmSetting.D_LDAP_TIME 	= "ldap_time";
ZmSetting.D_HASH 		= "hash";
ZmSetting.D_LIST		= "list";
ZmSetting.D_NONE		= "NONE";	// placeholder setting

// constants used as setting values
ZmSetting.CAL_DAY			= "day";
ZmSetting.CAL_MONTH			= "month";
ZmSetting.CAL_WEEK			= "week";
ZmSetting.CAL_WORK_WEEK		= "workWeek";
ZmSetting.CAL_SCHEDULE		= "schedule";
ZmSetting.CLIENT_ADVANCED	= "advanced";				// zimbraPrefClientType
ZmSetting.CLIENT_STANDARD	= "standard";
ZmSetting.COMPOSE_FONT_COLOR= "#000000";	 			// zimbraPrefHtmlEditorDefaultFontColor
ZmSetting.COMPOSE_FONT_FAM 	= "Times New Roman";		// zimbraPrefHtmlEditorDefaultFontFamily
ZmSetting.COMPOSE_FONT_SIZE = "12pt"; 					// zimbraPrefHtmlEditorDefaultFontSize
ZmSetting.COMPOSE_TEXT 		= "text";					// zimbraPrefComposeFormat
ZmSetting.COMPOSE_HTML 		= "html";
ZmSetting.CV_CARDS			= "cards"; 					// zimbraPrefContactsInitialView
ZmSetting.CV_LIST			= "list";
ZmSetting.DEDUPE_NONE		= "dedupeNone";				// zimbraPrefDedupeMessagesSentToSelf
ZmSetting.DEDUPE_SECOND		= "secondCopyifOnToOrCC";
ZmSetting.DEDUPE_INBOX		= "moveSentMessageToInbox";
ZmSetting.DEDUPE_ALL		= "dedupeAll";
ZmSetting.GROUP_BY_CONV		= "conversation";			// zimbraPrefGroupMailBy
ZmSetting.GROUP_BY_MESSAGE	= "message";
ZmSetting.INCLUDE_NONE		= "includeNone";			// zimbraPrefForwardIncludeOriginalText
ZmSetting.INCLUDE			= "includeBody";
ZmSetting.INCLUDE_PREFIX	= "includeBodyWithPrefix";
ZmSetting.INCLUDE_ATTACH	= "includeAsAttachment";
ZmSetting.INCLUDE_SMART		= "includeSmart";
ZmSetting.LICENSE_BAD		= "bad";					// license status (network only)
ZmSetting.LICENSE_GOOD		= "good";
ZmSetting.LICENSE_GRACE		= "inGracePeriod";
ZmSetting.PROTO_HTTP		= "http:";
ZmSetting.PROTO_HTTPS		= "https:";
ZmSetting.PROTO_MIXED		= "mixed";
ZmSetting.SIG_INTERNET		= "internet";				// zimbraPrefMailSignatureStyle
ZmSetting.SIG_OUTLOOK		= "outlook";

// we need these IDs available when the app classes are parsed
ZmSetting.LOCALE_NAME			= "LOCALE_NAME";
ZmSetting.SKIN_NAME				= "SKIN_NAME";

ZmSetting.BRIEFCASE_ENABLED		= "BRIEFCASE_ENABLED";
ZmSetting.CALENDAR_ENABLED		= "CALENDAR_ENABLED";
ZmSetting.CONTACTS_ENABLED		= "CONTACTS_ENABLED";
ZmSetting.IM_ENABLED			= "IM_ENABLED";
ZmSetting.MAIL_ENABLED			= "MAIL_ENABLED";
ZmSetting.MIXED_VIEW_ENABLED	= "MIXED_VIEW_ENABLED";
ZmSetting.NOTEBOOK_ENABLED		= "NOTEBOOK_ENABLED";
ZmSetting.OPTIONS_ENABLED		= "OPTIONS_ENABLED";
ZmSetting.PORTAL_ENABLED		= "PORTAL_ENABLED";
ZmSetting.TASKS_ENABLED			= "TASKS_ENABLED";
ZmSetting.VOICE_ENABLED			= "VOICE_ENABLED";

ZmSetting.CALENDAR_UPSELL_ENABLED	= "CALENDAR_UPSELL_ENABLED";
ZmSetting.CONTACTS_UPSELL_ENABLED	= "CONTACTS_UPSELL_ENABLED";
ZmSetting.MAIL_UPSELL_ENABLED		= "MAIL_UPSELL_ENABLED";
ZmSetting.VOICE_UPSELL_ENABLED		= "VOICE_UPSELL_ENABLED";

// remove this block when offline.jsp upgrades
ZmSetting.APPS_COOKIE			= "ZM_APPS";
ZmSetting.APP_LETTER = {};
ZmSetting.APP_LETTER[ZmSetting.PORTAL_ENABLED]		= "p";
ZmSetting.APP_LETTER[ZmSetting.MAIL_ENABLED]		= "m";
ZmSetting.APP_LETTER[ZmSetting.CALENDAR_ENABLED]	= "c";
ZmSetting.APP_LETTER[ZmSetting.CONTACTS_ENABLED]	= "a";
ZmSetting.APP_LETTER[ZmSetting.OPTIONS_ENABLED]	    = "o";
ZmSetting.APP_LETTER[ZmSetting.IM_ENABLED]			= "i";
ZmSetting.APP_LETTER[ZmSetting.NOTEBOOK_ENABLED]	= "n";
ZmSetting.APP_LETTER[ZmSetting.BRIEFCASE_ENABLED]	= "b";
ZmSetting.APP_LETTER[ZmSetting.TASKS_ENABLED]		= "t";
ZmSetting.APP_LETTER[ZmSetting.MIXED_VIEW_ENABLED]	= "x";
ZmSetting.APP_LETTER[ZmSetting.VOICE_ENABLED]		= "v";

// hash of global settings
ZmSetting.IS_GLOBAL = {};

ZmSetting.prototype.toString =
function() {
	return this.name + ": " + this.value;
};

/**
* Returns the current value of this setting.
*
* @param key 			optional key for use by hash table data type
*/
ZmSetting.prototype.getValue =
function(key) {
	if (this.value != null) {
		return key ? this.value[key] : this.value;
	} else if (this.defaultValue != null) {
		return key ? this.defaultValue[key] : this.defaultValue;
	} else {
		return null;
	}
};

/**
* Returns the default value of this setting.
*
* @param key 			optional key for use by hash table data type
*/
ZmSetting.prototype.getDefaultValue =
function(key) {
	return key ? this.defaultValue[key] : this.defaultValue;
};

/**
* Sets the current value of this setting, performing any necessary data type conversion.
*
* @param value			the new value for the setting
* @param key 			optional key for use by hash table data type
* @param setDefault		if true, also set the default value
* @param skipNotify		if true, don't notify listeners
*/
ZmSetting.prototype.setValue =
function(value, key, setDefault, skipNotify) {
	if (this.dataType == ZmSetting.D_STRING) {
		this.value = value;
	} else if (this.dataType == ZmSetting.D_INT) {
		this.value = parseInt(value);
		if (isNaN(this.value)) { // revert to string if NaN
			this.value = value;
		}
	} else if (this.dataType == ZmSetting.D_BOOLEAN) {
		if (typeof(value) == "string") {
			this.value = (value.toLowerCase() == "true");
		} else {
			this.value = value;
		}
	} else if (this.dataType == ZmSetting.D_LDAP_TIME) {
		var lastChar = (value.toLowerCase) ? lastChar = (value.toLowerCase()).charAt(value.length-1) : null;
		var num = parseInt(value);
		// convert to seconds
		if (lastChar == 'd') {
			this.value = num * 24 * 60 * 60;
		} else if (lastChar == 'h') {
			this.value = num * 60 * 60;
		} else if (lastChar == 'm') {
			this.value = num * 60;
		} else {
			this.value = num;	// default
		}
	} else if (this.dataType == ZmSetting.D_HASH) {
		if (key) {
			this.value[key] = value;
		}
		else {
			this.value = value;
		}
	} else if (this.dataType == ZmSetting.D_LIST) {
		if (value instanceof Array) {
			this.value = value;
		} else {
			this.value.push(value);
		}
	}

	if (setDefault) {
		if (key)
			this.defaultValue[key] = this.value[key];
		else
			this.defaultValue = this.value;
	}
	
	// Setting an internal pref is equivalent to saving it, so we should notify
	if (!this.name && !skipNotify) {
		this._notify(ZmEvent.E_MODIFY);
	}
};

ZmSetting.prototype.notifyModify = 
function(obj) {
	if (this.id == ZmSetting.QUOTA_USED && obj._name == "mbx" && obj.s != null) {
		this.setValue(obj.s);
		this._notify(ZmEvent.E_MODIFY);
	}
};
