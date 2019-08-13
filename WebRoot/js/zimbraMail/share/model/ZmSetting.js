/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016 Synacor, Inc.
 *
 * The contents of this file are subject to the Common Public Attribution License Version 1.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at: https://www.zimbra.com/license
 * The License is based on the Mozilla Public License Version 1.1 but Sections 14 and 15
 * have been added to cover use of software over a computer network and provide for limited attribution
 * for the Original Developer. In addition, Exhibit A has been modified to be consistent with Exhibit B.
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * See the License for the specific language governing rights and limitations under the License.
 * The Original Code is Zimbra Open Source Web Client.
 * The Initial Developer of the Original Code is Zimbra, Inc.  All rights to the Original Code were
 * transferred by Zimbra, Inc. to Synacor, Inc. on September 14, 2015.
 *
 * All portions of the code are Copyright (C) 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016 Synacor, Inc. All Rights Reserved.
 * ***** END LICENSE BLOCK *****
 */

/**
 * @overview
 * This file contains a setting class.
 */

/**
 * Creates a setting.
 * @class
 * This class represents a single setting. A setting's default value never changes; it
 * is available in case the user wishes to restore the current value to the default.
 * Most but not all settings have a corollary on the server side. Settings that don't
 * will depend on the environment or user activity to get their value.
 *
 * @author Conrad Damon
 * 
 * @param {String}	id				a unique ID
 * @param {Hash}	params			a hash of parameters
 * @param {String}	params.name				the name of the pref or attr on the server
 * @param {constant}	params.type			config, pref, or COS (see <code>ZmSetting.T_</code> constants)
 * @param {constant}	params.dataType			string, int, or boolean
 * @param {Object}	params.defaultValue		the default value
 * @param {Boolean}	params.isGlobal			if <code>true</code>, this setting is global across accounts
 * @param {Boolean}	params.isImplicit		if <code>true</code>, this setting is not represented in Preferences
 * 
 * @extends		ZmModel
 */
ZmSetting = function(id, params) {

	if (arguments.length == 0) return;
	ZmModel.call(this, ZmEvent.S_SETTING);
	
	this.id = id;
	this.name = params.name;
	this.type = params.type;
	this.dataType = params.dataType || ZmSetting.D_STRING;
	this.defaultValue = params.defaultValue;
	this.canPreset = params.canPreset;
	if (this.type == ZmSetting.T_METADATA) {
		this.section = params.section;
	}
	if (params.isGlobal) {
		ZmSetting.IS_GLOBAL[id] = true;
	}
	if (params.isImplicit) {
		ZmSetting.IS_IMPLICIT[id] = true;
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

    this.dontSaveDefault = params.dontSaveDefault;
};

ZmSetting.prototype = new ZmModel;
ZmSetting.prototype.constructor = ZmSetting;

// setting types
/**
 * Defines the "config" type.
 */
ZmSetting.T_CONFIG		= "config";
/**
 * Defines the "COS" type.
 */
ZmSetting.T_COS			= "cos";
/**
 * Defines the "domain" type.
 */
ZmSetting.T_DOMAIN		= "domain";
/**
 * Defines the "meta-data" type.
 */
ZmSetting.T_METADATA	= "meta";
/**
 * Defines the "pref" type.
 */
ZmSetting.T_PREF		= "pref";
/**
 * Defines the "pseudo" type.
 */
ZmSetting.T_PSEUDO		= "pseudo";

// metadata sections
ZmSetting.M_IMPLICIT	= "implicit";
ZmSetting.M_OFFLINE		= "offline";
ZmSetting.M_ZIMLET		= "zimlet";

// setting data types
ZmSetting.D_STRING		= "string"; // default type
ZmSetting.D_INT			= "int";
ZmSetting.D_BOOLEAN		= "boolean";
ZmSetting.D_LDAP_TIME 	= "ldap_time";
ZmSetting.D_HASH 		= "hash";
ZmSetting.D_LIST		= "list";
ZmSetting.D_NONE		= "NONE";	// placeholder setting

// constants used as setting values
// TODO: these should be defined in their respective apps
/**
 * Defines the "all" ACL grantee type.
 * @type String
 */
ZmSetting.ACL_AUTH				= "all";
/**
 * Defines the "group" ACL grantee type.
 * @type String
 */
ZmSetting.ACL_GROUP				= "grp";
/**
 * Defines the "none" ACL grantee type.
 * @type String
 */
ZmSetting.ACL_NONE				= "none";
/**
 * Defines the "public" ACL grantee type.
 * @type String
 */
ZmSetting.ACL_PUBLIC			= "pub";
/**
 * Defines the "domain" ACL grantee type.
 * @type String
 */
ZmSetting.ACL_DOMAIN			= "dom";
/**
 * Defines the "user" ACL grantee type.
 * @type String
 */
ZmSetting.ACL_USER				= "usr";
ZmSetting.CAL_DAY				= "day";
ZmSetting.CAL_LIST				= "list";
ZmSetting.CAL_MONTH				= "month";
ZmSetting.CAL_WEEK				= "week";
ZmSetting.CAL_WORK_WEEK			= "workWeek";
ZmSetting.CAL_VISIBILITY_PRIV	= "private";
ZmSetting.CAL_VISIBILITY_PUB	= "public";
ZmSetting.CLIENT_ADVANCED		= "advanced";				// zimbraPrefClientType
ZmSetting.CLIENT_STANDARD		= "standard";
ZmSetting.COMPOSE_FONT_COLOR	= "#000000";	 			// zimbraPrefHtmlEditorDefaultFontColor
ZmSetting.COMPOSE_FONT_FAM 		= "arial,helvetica,sans-serif";		// zimbraPrefHtmlEditorDefaultFontFamily
ZmSetting.COMPOSE_FONT_SIZE 	= AjxMessageFormat.format(ZmMsg.pt,"12"); 			// zimbraPrefHtmlEditorDefaultFontSize
ZmSetting.LTR                   = "LTR";
ZmSetting.RTL                   = "RTL";
ZmSetting.COMPOSE_TEXT 			= "text";					// zimbraPrefComposeFormat
ZmSetting.COMPOSE_HTML 			= "html";
ZmSetting.CV_CARDS				= "cards"; 					// zimbraPrefContactsInitialView
ZmSetting.CV_LIST				= "list";
ZmSetting.DEDUPE_NONE			= "dedupeNone";				// zimbraPrefDedupeMessagesSentToSelf
ZmSetting.DEDUPE_SECOND			= "secondCopyifOnToOrCC";
ZmSetting.DEDUPE_INBOX			= "moveSentMessageToInbox";
ZmSetting.DEDUPE_ALL			= "dedupeAll";
ZmSetting.DELETE_SELECT_NEXT	= "next";					// zimbraPrefMailSelectAfterDelete
ZmSetting.DELETE_SELECT_PREV	= "previous";
ZmSetting.DELETE_SELECT_ADAPT	= "adaptive";
ZmSetting.GROUP_BY_CONV			= "conversation";			// zimbraPrefGroupMailBy
ZmSetting.GROUP_BY_MESSAGE		= "message";
ZmSetting.HTTP_DEFAULT_PORT		= 80;
ZmSetting.HTTPS_DEFAULT_PORT	= 443;
ZmSetting.INC_NONE				= "includeNone";			// zimbraPrefReplyIncludeOriginalText / zimbraPrefForwardIncludeOriginalText
ZmSetting.INC_ATTACH			= "includeAsAttachment";
ZmSetting.INC_BODY				= "includeBody";				// deprecated - same as includeBodyAndHeaders
ZmSetting.INC_BODY_ONLY			= "includeBodyOnly";
ZmSetting.INC_BODY_PRE			= "includeBodyWithPrefix";
ZmSetting.INC_BODY_HDR			= "includeBodyAndHeaders";
ZmSetting.INC_BODY_PRE_HDR		= "includeBodyAndHeadersWithPrefix";
ZmSetting.INC_SMART				= "includeSmart";
ZmSetting.INC_SMART_PRE			= "includeSmartWithPrefix";
ZmSetting.INC_SMART_HDR			= "includeSmartAndHeaders";
ZmSetting.INC_SMART_PRE_HDR		= "includeSmartAndHeadersWithPrefix";
ZmSetting.MARK_READ_NONE		= -1;						// zimbraPrefMarkMsgRead
ZmSetting.MARK_READ_NOW			= 0;						// zimbraPrefMarkMsgRead
ZmSetting.MARK_READ_TIME		= 1;						// zimbraPrefMarkMsgRead
ZmSetting.PRINT_FONT_SIZE 	    = AjxMessageFormat.format(ZmMsg.pt,"12"); 			// zimbraPrefDefaultPrintFontSize
ZmSetting.PROTO_HTTP			= "http:";
ZmSetting.PROTO_HTTPS			= "https:";
ZmSetting.PROTO_MIXED			= "mixed:";
ZmSetting.RIGHT_VIEW_FREE_BUSY	= "viewFreeBusy";
ZmSetting.RIGHT_INVITE			= "invite";
ZmSetting.RP_BOTTOM				= "bottom";					// zimbraPrefReadingPaneLocation / zimbraPrefConvReadingPaneLocation / zimbraPrefTasksReadingPaneLocation / zimbraPrefBriefcaseReadingPaneLocation
ZmSetting.RP_OFF				= "off";
ZmSetting.RP_RIGHT				= "right";
ZmSetting.SIG_INTERNET			= "internet";				// zimbraPrefMailSignatureStyle
ZmSetting.SIG_OUTLOOK			= "outlook";

// values for the 'fetch' param of SearchConvRequest
ZmSetting.CONV_FETCH_NONE                       = "0";
ZmSetting.CONV_FETCH_FIRST_MATCHING             = "1";
ZmSetting.CONV_FETCH_FIRST                      = "!";
ZmSetting.CONV_FETCH_UNREAD                     = "u";
ZmSetting.CONV_FETCH_UNREAD_OR_FIRST_MATCHING   = "u1";
ZmSetting.CONV_FETCH_UNREAD_OR_FIRST            = "u!";
ZmSetting.CONV_FETCH_UNREAD_OR_BOTH_FIRST       = "u1!";
ZmSetting.CONV_FETCH_MATCHES                    = "hits";
ZmSetting.CONV_FETCH_MATCHES_OR_FIRST           = "hits!";
ZmSetting.CONV_FETCH_ALL                        = "all";

// License status (network only)
ZmSetting.LICENSE_GOOD			= "OK";
ZmSetting.LICENSE_NOT_INSTALLED = "NOT_INSTALLED";
ZmSetting.LICENSE_NOT_ACTIVATED = "NOT_ACTIVATED";
ZmSetting.LICENSE_FUTURE		= "IN_FUTURE";
ZmSetting.LICENSE_EXPIRED		= "EXPIRED";
ZmSetting.LICENSE_BAD			= "INVALID";
ZmSetting.LICENSE_GRACE			= "LICENSE_GRACE_PERIOD";
ZmSetting.LICENSE_ACTIV_GRACE	= "ACTIVATION_GRACE_PERIOD";

// warning messages for bad license statuses
ZmSetting.LICENSE_MSG									= {};
ZmSetting.LICENSE_MSG[ZmSetting.LICENSE_NOT_INSTALLED]	= ZmMsg.licenseNotInstalled;
ZmSetting.LICENSE_MSG[ZmSetting.LICENSE_NOT_ACTIVATED]	= ZmMsg.licenseNotActivated;
ZmSetting.LICENSE_MSG[ZmSetting.LICENSE_FUTURE]			= ZmMsg.licenseExpired;
ZmSetting.LICENSE_MSG[ZmSetting.LICENSE_EXPIRED]		= ZmMsg.licenseExpired;
ZmSetting.LICENSE_MSG[ZmSetting.LICENSE_BAD]			= ZmMsg.licenseExpired;

// we need these IDs available when the app classes are parsed
ZmSetting.LOCALE_NAME			= "LOCALE_NAME";
ZmSetting.COMPOSE_INIT_DIRECTION= "COMPOSE_INIT_DIRECTION";
ZmSetting.SHOW_COMPOSE_DIRECTION_BUTTONS = "SHOW_COMPOSE_DIRECTION_BUTTONS";
ZmSetting.FONT_NAME				= "FONT_NAME";
ZmSetting.FONT_SIZE				= "FONT_SIZE";
ZmSetting.SKIN_NAME				= "SKIN_NAME";

ZmSetting.BRIEFCASE_ENABLED		= "BRIEFCASE_ENABLED";
ZmSetting.CALENDAR_ENABLED		= "CALENDAR_ENABLED";
ZmSetting.CONTACTS_ENABLED		= "CONTACTS_ENABLED";
ZmSetting.MAIL_ENABLED			= "MAIL_ENABLED";
ZmSetting.OPTIONS_ENABLED		= "OPTIONS_ENABLED";
ZmSetting.PORTAL_ENABLED		= "PORTAL_ENABLED";
ZmSetting.SEARCH_ENABLED		= "SEARCH_ENABLED";
ZmSetting.SOCIAL_ENABLED		= "SOCIAL_ENABLED";
ZmSetting.TASKS_ENABLED			= "TASKS_ENABLED";
ZmSetting.VOICE_ENABLED			= "VOICE_ENABLED";
ZmSetting.TAGGING_ENABLED		= "TAGGING_ENABLED";
ZmSetting.CHAT_FEATURE_ENABLED  = "CHAT_FEATURE_ENABLED";
ZmSetting.CHAT_ENABLED          = "CHAT_ENABLED";
ZmSetting.CHAT_PLAY_SOUND       = "CHAT_PLAY_SOUND";

ZmSetting.CALENDAR_UPSELL_ENABLED	= "CALENDAR_UPSELL_ENABLED";
ZmSetting.CONTACTS_UPSELL_ENABLED	= "CONTACTS_UPSELL_ENABLED";
ZmSetting.MAIL_UPSELL_ENABLED		= "MAIL_UPSELL_ENABLED";
ZmSetting.SOCIAL_EXTERNAL_ENABLED   = "SOCIAL_EXTERNAL_ENABLED";
ZmSetting.SOCIAL_EXTERNAL_URL	    = "SOCIAL_EXTERNAL_URL";
ZmSetting.VOICE_UPSELL_ENABLED		= "VOICE_UPSELL_ENABLED";
ZmSetting.SHARING_ENABLED			= "SHARING_ENABLED";

//user selected font
ZmSetting.FONT_CLASSIC	= "classic";
ZmSetting.FONT_MODERN	= "modern";
ZmSetting.FONT_WIDE		= "wide";
ZmSetting.FONT_SYSTEM	= "system";

//user selected font size
ZmSetting.FONT_SIZE_SMALL = "small";
ZmSetting.FONT_SIZE_NORMAL = "normal";
ZmSetting.FONT_SIZE_LARGE = "large";
ZmSetting.FONT_SIZE_LARGER = "larger";


// name for dynamic CSS class created from user font prefs
ZmSetting.USER_FONT_CLASS = "userFontPrefs";

//task filterby setting
ZmSetting.TASK_FILTER_ALL = "";
ZmSetting.TASK_FILTER_TODO = "TODO";
ZmSetting.TASK_FILTER_COMPLETED = "COMPLETED";
ZmSetting.TASK_FILTER_WAITING = "WAITING";
ZmSetting.TASK_FILTER_DEFERRED = "DEFERRED";
ZmSetting.TASK_FILTER_INPROGRESS = "INPROGRESS";
ZmSetting.TASK_FILTER_NOTSTARTED = "NOTSTARTED";

// hash of global settings
ZmSetting.IS_GLOBAL = {};

// hash of implicit settings
ZmSetting.IS_IMPLICIT = {};

// hash of implicit settings that have been changed during the current session
ZmSetting.CHANGED_IMPLICIT = {};

// Send As and Send On Behalf Of settings
ZmSetting.SEND_AS = "sendAs";
ZmSetting.SEND_ON_BEHALF_OF = "sendOnBehalfOf";

/**
 * Returns a string representation of the object.
 * 
 * @return		{String}		a string representation of the object
 */
ZmSetting.prototype.toString =
function() {
	return this.name + ": " + this.value;
};

/**
 * Gets the current value of this setting.
 *
 * @param {String}	key			the optional key for use by hash table data type
 * @param {Boolean}	serialize		if <code>true</code>, serialize non-string value into string
 * @return	{Object}	the value
 */
ZmSetting.prototype.getValue =
function(key, serialize) {

	var value = null;
	if (this.value != null) {
		value = key ? this.value[key] : this.value;
	} else if (this.defaultValue != null) {
		value = key ? this.defaultValue[key] : this.defaultValue;
	} else {
		return null;
	}

    if(this.dontSaveDefault && serialize && !key){
        value = this.getRefinedValue(value);
    }

	return serialize ? ZmSetting.serialize(value, this.dataType) : value;
};

ZmSetting.prototype.getRefinedValue =
function(value){
    if(this.dataType == ZmSetting.D_HASH){
        var refinedValue = {}, dValue = this.defaultValue;
        for(var key in value){
             refinedValue[key] = (dValue[key] != value[key]) ? value[key] : "";
        }
        return refinedValue;
    }
    return value;
};

/**
 * Gets the original value of this setting.
 *
 * @param {String}	key			the optional key for use by hash table data type
 * @param {Boolean}	serialize		if <code>true</code>, serialize non-string value into string
 * @return	{Object}	the value
 */
ZmSetting.prototype.getOrigValue =
function(key, serialize) {

	var origValue = null;
	if (this.origValue != null) {
		origValue = key ? this.origValue[key] : this.origValue;
	} else if (this.defaultValue != null) {
		origValue = key ? this.defaultValue[key] : this.defaultValue;
	} else {
		return null;
	}

	return serialize ? ZmSetting.serialize(origValue, this.dataType) : origValue;
};

/**
 * Gets the default value of this setting.
 *
 * @param {String}	key 			the optional key for use by hash table data type
 * @return	{Object}	the value
 */
ZmSetting.prototype.getDefaultValue =
function(key, serialize) {
	var value = key ? this.defaultValue[key] : this.defaultValue;
	return serialize ? ZmSetting.serialize(value, this.dataType) : value;
};

/**
 * Sets the current value of this setting, performing any necessary data type conversion.
 *
 * @param {Object}	value			the new value for the setting
 * @param {String}	key 			optional key for use by hash table data type
 * @param {Boolean}	setDefault		if <code>true</code>, also set the default value
 * @param {Boolean}	skipNotify		if <code>true</code>, do not notify listeners
 * @param {Boolean}	skipImplicit		if <code>true</code>, do not check for change to implicit pref
 */
ZmSetting.prototype.setValue =
function(value, key, setDefault, skipNotify, skipImplicit) {

	var newValue = value;
	var changed = Boolean(newValue != this.value);
	if (this.dataType == ZmSetting.D_STRING) {
		this.value = newValue;
	} else if (this.dataType == ZmSetting.D_INT) {
		newValue = parseInt(value);
		if (isNaN(newValue)) { // revert to string if NaN
			newValue = value;
		}
		changed = Boolean(newValue != this.value);
		this.value = newValue;
	} else if (this.dataType == ZmSetting.D_BOOLEAN) {
		if (typeof(newValue) == "string") {
			newValue = (newValue.toLowerCase() === "true");
		}
		changed = Boolean(newValue != this.value);
		this.value = newValue;
	} else if (this.dataType == ZmSetting.D_LDAP_TIME) {
		var lastChar = (newValue.toLowerCase) ? lastChar = (newValue.toLowerCase()).charAt(newValue.length-1) : null;
		var num = parseInt(newValue);
		// convert to seconds
		if (lastChar == 'd') {
			newValue = num * 24 * 60 * 60;
		} else if (lastChar == 'h') {
			newValue = num * 60 * 60;
		} else if (lastChar == 'm') {
			newValue = num * 60;
		} else {
			newValue = num;	// default
		}
		changed = Boolean(newValue != this.value);
		this.value = newValue;
	} else if (this.dataType == ZmSetting.D_HASH) {
		changed = true;
        if (key) {
			if (newValue) {
                changed = Boolean(newValue != this.value[key]);
				this.value[key] = newValue;
			} else {
				delete this.value[key];
			}
		} else {
			this.value = newValue;
		}
	} else if (this.dataType == ZmSetting.D_LIST) {
		if (newValue instanceof Array) {
			this.value = newValue;
		} else {
			this.value.push(newValue);
		}
		changed = true;
	}

	if (setDefault) {
		if (key) {
			this.defaultValue[key] = this.value[key];
		} else {
			this.defaultValue = this.value;
		}
	}
	
	if (ZmSetting.IS_IMPLICIT[this.id] && changed && !skipImplicit) {
		if (skipNotify) {
			ZmSetting.CHANGED_IMPLICIT[this.id] = true;
		} else {
			this._notify(ZmEvent.E_MODIFY, key);
			return;
		}
	}

	// Setting an internal pref is equivalent to saving it, so we should notify
	if (!this.name && !skipNotify) {
		this._notify(ZmEvent.E_MODIFY, key);
	}
};

/**
 * Handles modify notification.
 * 
 * @param	{Object}	obj		the object
 */
ZmSetting.prototype.notifyModify = 
function(obj) {
	if (this.id == ZmSetting.QUOTA_USED && obj._name == "mbx" && obj.s != null) {
		this.setValue(obj.s);
		this._notify(ZmEvent.E_MODIFY, {account:obj.account});
	}
};

ZmSetting.prototype.copyValue =
function() {

	if (this.dataType == ZmSetting.D_HASH) {
		return AjxUtil.hashCopy(this.value);
	} else if (this.dataType == ZmSetting.D_LIST) {
		return this.value.concat();
	} else {
		return this.value;
	}
};

ZmSetting.serialize =
function(value, dataType) {

	if (dataType == ZmSetting.D_BOOLEAN) {
		value = value ? "TRUE" : "FALSE";
	} else if (dataType == ZmSetting.D_HASH) {
		var keys = [];
		for (var key in value) {
			keys.push(key);
		}
		keys.sort();
		var pairs = [];
		for (var j = 0; j < keys.length; j++) {
			var key = keys[j];
			pairs.push([key, value[key]].join(":"));
		}
		value = pairs.join(",");
	} else if (dataType == ZmSetting.D_LIST) {
		value = value.join(",");
	}

	return value;
};
