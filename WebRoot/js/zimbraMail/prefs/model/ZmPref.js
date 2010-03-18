/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2005, 2006, 2007, 2008, 2009, 2010 Zimbra, Inc.
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

ZmPref = function(id, name, dataType) {

	ZmSetting.call(this, id, name, ZmSetting.T_PREF, dataType);

	this.origValue = null;
	this.isDirty = false;
};

ZmPref.prototype = new ZmSetting;
ZmPref.prototype.constructor = ZmPref;

ZmPref.KEY_ID				= "prefId_";

ZmPref.TYPE_STATIC			= "STATIC"; // static text
ZmPref.TYPE_INPUT			= "INPUT";
ZmPref.TYPE_CHECKBOX		= "CHECKBOX";
ZmPref.TYPE_COLOR			= "COLOR";
ZmPref.TYPE_RADIO_GROUP		= "RADIO_GROUP";
ZmPref.TYPE_SELECT			= "SELECT";
ZmPref.TYPE_COMBOBOX		= "COMBOBOX";
ZmPref.TYPE_TEXTAREA		= "TEXTAREA";
ZmPref.TYPE_PASSWORD		= "PASSWORD";
ZmPref.TYPE_IMPORT			= "IMPORT";
ZmPref.TYPE_EXPORT			= "EXPORT";
ZmPref.TYPE_SHORTCUTS		= "SHORTCUTS";
ZmPref.TYPE_CUSTOM			= "CUSTOM";
ZmPref.TYPE_LOCALES			= "LOCALES";

ZmPref.ORIENT_VERTICAL		= "vertical";
ZmPref.ORIENT_HORIZONTAL	= "horizontal";

// custom functions for loading and validation

ZmPref.loadSkins =
function(setup) {
	var skins = appCtxt.get(ZmSetting.AVAILABLE_SKINS);
	setup.options = []; // re-init otherwise we could possibly have dupes.
	for (var i = 0; i < skins.length; i++) {
		var skin = skins[i];
		setup.options.push(skin);
		var text = ZmMsg['theme-' + skin] || skin.substr(0, 1).toUpperCase() + skin.substr(1);
		setup.displayOptions.push(text);
	}
};

ZmPref.loadCsvFormats =
function(setup){
    var formats = appCtxt.get(ZmSetting.AVAILABLE_CSVFORMATS);
	if (!formats._options) {
		var options = formats._options = [];
		var displayOptions = formats._displayOptions = [];
		for(var i=0; i<formats.length; i++){
			options.push(formats[i]);
		}
		options.sort(ZmPref.__BY_CSVFORMAT);
		for(var i=0; i < options.length; i++){
			displayOptions.push((ZmMsg[options[i]] || options[i]));
		}
	}
	setup.options = formats._options;
	setup.displayOptions = formats._displayOptions;
};
ZmPref.__BY_CSVFORMAT = function(a, b) {
	if (a.match(/^zimbra/)) return -1;
	if (b.match(/^zimbra/)) return  1;
	if (a.match(/^yahoo/))  return -1;
	if (b.match(/^yahoo/))  return  1;
	return a.localeCompare(b);
};

ZmPref.loadPageSizes =
function(setup) {
	var max = (setup.maxSetting && appCtxt.get(setup.maxSetting)) || 100;
	var list = [];
	for (var i = 0; i < ZmPref.PAGE_SIZES.length; i++) {
		var num = parseInt(ZmPref.PAGE_SIZES[i]);
		if (num <= max) {
			list.push(ZmPref.PAGE_SIZES[i]);
		}
	}
	if (max > ZmPref.PAGE_SIZES[ZmPref.PAGE_SIZES.length - 1]) {
		list.push(String(max));
	}
	setup.displayOptions = setup.options = list;
};
ZmPref.PAGE_SIZES = ["10", "25", "50", "100", "250", "500", "1000"];

ZmPref.validateEmail =
function(emailStr) {
	if (emailStr) {
		// NOTE: Handle localhost for development purposes
		return emailStr.match(/\@localhost$/i) || AjxEmailAddress.parse(emailStr) != null;
	}
	return true;
};

ZmPref.validateEmailList =
function(emailStrArray) {
    for(var i in emailStrArray) {
        if(!ZmPref.validateEmail(emailStrArray[i])) return false;
    }
    return true;
};

ZmPref.downloadSinceDisplay =
function(dateStr) {
	if (dateStr == "") return 0;
	if (dateStr == appCtxt.get(ZmSetting.POP_DOWNLOAD_SINCE)) return 1;
	return 2;
};
ZmPref.downloadSinceValue =
function(value) {
	if (value == 0) return "";
	if (value == 1) return appCtxt.get(ZmSetting.POP_DOWNLOAD_SINCE);
	var date = new Date();
	date.setMinutes(date.getMinutes() + date.getTimezoneOffset());
	return AjxDateFormat.format("yyyyMMddHHmmss'Z'", date);
};

ZmPref.validatePollingInterval =
function(interval) {
	var minimum = appCtxt.get(ZmSetting.MIN_POLLING_INTERVAL);
	if (interval && minimum && interval >= minimum) {
		return true;
	} else {
		var min = minimum / 60;
		ZmPref.SETUP[ZmSetting.POLLING_INTERVAL].errorMessage = AjxMessageFormat.format(ZmMsg.invalidPollingInterval, min);
		return false;
	}
};

ZmPref.pollingIntervalDisplay =
function(seconds) {
	return seconds / 60;
};

ZmPref.pollingIntervalValue =
function(minutes) {
	return minutes * 60;
};

ZmPref.dateLocal2GMT =
function(value) {
	if (!value) { return ""; }

	var yr, mo, da, hr, mi, se; // really smart parsing.
	yr = parseInt(value.substr(0,  4), 10);
	mo = parseInt(value.substr(4,  2), 10);
	da = parseInt(value.substr(6,  2), 10);
	hr = parseInt(value.substr(8,  2), 10);
	mi = parseInt(value.substr(10, 2), 10);
	se = parseInt(value.substr(12, 2), 10);
	var date = new Date(yr, mo - 1, da, hr, mi, se, 0);
	yr = date.getUTCFullYear();
	mo = date.getUTCMonth() + 1;
	da = date.getUTCDate();
	hr = date.getUTCHours();
	mi = date.getUTCMinutes();
	se = date.getUTCSeconds();
	var a = [ yr, mo, da, hr, mi, se ];
	for (var i = a.length; --i > 0;) {
		var n = a[i];
		if (n < 10)
			a[i] = "0" + n;
	}
	return (a.join("") + "Z");
};

ZmPref.dateGMT2Local =
function(value) {
	if (!value) { return ""; }

	var yr, mo, da, hr, mi, se; // really smart parsing.
	yr = parseInt(value.substr(0,  4), 10);
	mo = parseInt(value.substr(4,  2), 10);
	da = parseInt(value.substr(6,  2), 10);
	hr = parseInt(value.substr(8,  2), 10);
	mi = parseInt(value.substr(10, 2), 10);
	se = parseInt(value.substr(12, 2), 10);
	var date = new Date();
	date.setUTCMilliseconds(0);
	date.setUTCSeconds(se);
	date.setUTCMinutes(mi);
	date.setUTCHours(hr);
	date.setUTCDate(da);
	date.setUTCMonth(mo - 1);
	date.setUTCFullYear(yr);
	yr = date.getFullYear();
	mo = date.getMonth() + 1;
	da = date.getDate();
	hr = date.getHours();
	mi = date.getMinutes();
	se = date.getSeconds();
	var a = [yr, mo, da, hr, mi, se];
	for (var i = a.length; --i > 0;) {
		var n = a[i];
		if (n < 10)
			a[i] = "0" + n;
	}
	return (a.join("") + "Z");
};

ZmPref.int2DurationDay =
function(intValue) {
	return intValue != null && intValue != 0 ? intValue + "d" : intValue;
};

ZmPref.string2EmailList =
function(value) {
    var emailList = [];
    var addr,addrs = AjxEmailAddress.split(value);
    if (addrs && addrs.length) {
        for (var i = 0; i < addrs.length; i++) {
            addr = addrs[i];
            var email = AjxEmailAddress.parse(addr);
            if(email) {
                addr = email.getAddress();
            }
            if(addr) emailList.push(addr);
        }
    }
	return emailList;
};

ZmPref.durationDay2Int =
function(durValue) {
	return parseInt(durValue, 10); // NOTE: parseInt ignores non-digits
};

ZmPref.approximateInterval =
function(value) {
	var values = [].concat(ZmPref.SETUP["POLLING_INTERVAL"].options);
	values.sort(ZmPref.__BY_NUMBER);
	return ZmPref.approximateValue(values, value);
};

ZmPref.approximateValue =
function(sortedValues, value) {
	// find closest value
	for (var i = 0; i < sortedValues.length + 1; i++) {
		var a = sortedValues[i];
		var b = sortedValues[i+1];
		if (value < b) {
			var da = value - a;
			var db = b - value;
			return da < db ? a : b;
		}
	}
	return sortedValues[sortedValues.length - 1];
};

ZmPref.validateLifetime =
function(value) {
	var globalValue = appCtxt.get(ZmSetting.MAIL_LIFETIME_GLOBAL);
	if (globalValue == "0") return true;
	return ZmPref.__BY_DURATION(value, globalValue) <= 0;
};

ZmPref.validateLifetimeJunk =
function(value) {
	var globalValue = appCtxt.get(ZmSetting.MAIL_LIFETIME_JUNK_GLOBAL);
	if (globalValue == "0") return true;
	return ZmPref.__BY_DURATION(value, globalValue) <= 0 && ZmPref.validateLifetime(value);
};

ZmPref.validateLifetimeTrash =
function(value) {
	var globalValue = appCtxt.get(ZmSetting.MAIL_LIFETIME_TRASH_GLOBAL);
	if (globalValue == "0") return true;
	return ZmPref.__BY_DURATION(value, globalValue) <= 0 && ZmPref.validateLifetime(value);
};

ZmPref.approximateLifetimeInboxRead =
function(value) {
	return ZmPref.approximateLifetime("MAIL_LIFETIME_INBOX_READ", value, ZmPref.validateLifetime);
};

ZmPref.approximateLifetimeInboxUnread =
function(value) {
	return ZmPref.approximateLifetime("MAIL_LIFETIME_INBOX_UNREAD", value, ZmPref.validateLifetime);
};

ZmPref.approximateLifetimeJunk =
function(value) {
	return ZmPref.approximateLifetime("MAIL_LIFETIME_JUNK", value, ZmPref.validateLifetimeJunk, ZmPref.validateLifetime);
};

ZmPref.approximateLifetimeSent =
function(value) {
	return ZmPref.approximateLifetime("MAIL_LIFETIME_SENT", value, ZmPref.validateLifetime);
};

ZmPref.approximateLifetimeTrash =
function(value) {
	return ZmPref.approximateLifetime("MAIL_LIFETIME_TRASH", value, ZmPref.validateLifetimeTrash, ZmPref.validateLifetime);
};

ZmPref.approximateLifetime =
function(prefId, duration, validateFunc1/*, ..., validateFuncN*/) {
	// convert durations to seconds
	var values = [].concat(ZmPref.SETUP[prefId].options);
	for (var i = 0; i < values.length; i++) {
		var value = values[i];
		values[i] = ZmPref.__DUR2SECS(value != "0" ? value+"d" : value);
	}
	values.sort(ZmPref.__BY_NUMBER);

	// remove invalid options
	valuesLoop: for (var i = values.length - 1; i >= 0; i--) {
		for (var j = 2; j < arguments.length; j++) {
			var validateFunc = arguments[j];
			var value = ZmPref.__SECS2DUR(values[i]);
			if (!validateFunc(value)) {
				values.pop();
				continue valuesLoop;
			}
		}
		break;
	}

	// if zero, the closest match is the greatest
	var seconds;
	if (duration == "0") {
		seconds = values[values.length - 1];
	}

	// approximate to closest number of seconds
	else {
		seconds = ZmPref.approximateValue(values, ZmPref.__DUR2SECS(duration+"d"));
	}

	// convert back to duration
	duration = ZmPref.__SECS2DUR(seconds);
	return duration != "0"  ? parseInt(duration, 10) : 0;
};

ZmPref.markMsgReadDisplay =
function(value) {
	return (value > 0) ? 1 : value;
};

ZmPref.markMsgReadValue =
function(value) {
	if (value == ZmSetting.MARK_READ_TIME) {
		var input = Dwt.byId(DwtId._makeId(ZmId.WIDGET_INPUT, ZmId.OP_MARK_READ));
		if (input) {
			return input.value;
		}
	}
	return value;
};

ZmPref.setIncludeOrig =
function(pref, value, list) {

	pref.setValue(value);
    pref.origValue = pref.copyValue();
	var settings = [ZmSetting.REPLY_INCLUDE_WHAT, ZmSetting.REPLY_USE_PREFIX, ZmSetting.REPLY_INCLUDE_HEADERS];
	var settingsHash = AjxUtil.arrayAsHash(settings);
	var mainSetting = ZmSetting.REPLY_INCLUDE_ORIG;
	if (!settingsHash[pref.id]) {
		settings = [ZmSetting.FORWARD_INCLUDE_WHAT, ZmSetting.FORWARD_USE_PREFIX, ZmSetting.FORWARD_INCLUDE_HEADERS];
		mainSetting = ZmSetting.FORWARD_INCLUDE_ORIG;
	}

	var values = AjxUtil.map(settings, function(setting) { return appCtxt.get(setting); });
	var key = values.join("|");
	var newValue = ZmMailApp.INC_MAP_REV[key];
	var prefToChange = appCtxt.getSettings().getSetting(mainSetting);
	prefToChange.setValue(newValue);
	list.push(prefToChange);
};

ZmPref.onChangeIncludeWhat =
function(ev) {
	var nv = ev._args.newValue;
	var ov = ev._args.oldValue;
	var newAllowOptions = (nv == ZmSetting.INC_BODY || nv == ZmSetting.INC_SMART);
	var oldAllowOptions = (ov == ZmSetting.INC_BODY || ov == ZmSetting.INC_SMART);
	if (newAllowOptions != oldAllowOptions) {
		var select = ev._args.selectObj;
		var optionIds = (select._name == ZmSetting.REPLY_INCLUDE_WHAT) ?
							[ZmSetting.REPLY_USE_PREFIX, ZmSetting.REPLY_INCLUDE_HEADERS] :
							[ZmSetting.FORWARD_USE_PREFIX, ZmSetting.FORWARD_INCLUDE_HEADERS];
		for (var i = 0; i < optionIds.length; i++) {
			var cbox = select.parent._dwtObjects[optionIds[i]];
			if (cbox) {
				cbox.setVisible(newAllowOptions);
			}
		}
	}
};

// Comparators

ZmPref.__BY_NUMBER =
function(a, b) {
	if (a == b) return 0;
	if (a == Math.POSITIVE_INFINITY || b == Math.NEGATIVE_INFINITY) return 1;
	if (b == Math.POSITIVE_INFINITY || a == Math.NEGATIVE_INFINITY) return -1;
	return Number(a) - Number(b);
};

ZmPref.__BY_DURATION =
function(a, b) {
	if (a == b) return 0;
	if (a == "0") return 1;
	if (b == "0") return -1;
	var asecs = ZmPref.__DUR2SECS(a);
	var bsecs = ZmPref.__DUR2SECS(b);
	return asecs - bsecs;
};

// Converters

ZmPref.__DURMULT = { "s": 1, "m": 60, "h": 3600, "d": 86400/*, "w": 604800*/ };
ZmPref.__DURDIV = { /*604800: "w",*/ 86400: "d", 3600: "h", 60: "m", 1: "s" };

ZmPref.__DUR2SECS =
function(duration) {
	if (duration == "0") return Number.POSITIVE_INFINITY;

	var type = duration.substring(duration.length - 1).toLowerCase();
	return parseInt(duration, 10) * ZmPref.__DURMULT[type];
};

ZmPref.__SECS2DUR =
function(seconds, type) {
	if (seconds == Number.POSITIVE_INFINITY) return "0";

	var divisors = ZmPref.__DURDIV;
	if (type) {
		type = {};
		type[ ZmPref.__DURMULT[type] ] = type;
	}
	for (var divisor in divisors) {
		var result = Math.floor(seconds / divisor);
		if (result > 0) {
			return [ result, divisors[divisor] ].join("");
		}
	}

	return "0"+type;
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

/**
 * The SETUP object for a pref gets translated into a form input.
 * Available properties are:
 *
 * displayName			descriptive text
 * displayFunc			A function that returns the descriptive text. Only implemented for checkboxes.
 * displayContainer		type of form input: checkbox, select, input, or textarea
 * options				values for a select input
 * displayOptions		text for the select input's values
 * validationFunction	function to validate the value
 * errorMessage			message to show if validation fails
 * precondition			pref will not be displayed unless precondition is true
 */
ZmPref.SETUP = {};

ZmPref.registerPref =
function(id, params) {
	ZmPref.SETUP[id] = params;
};

/** Clears all of the preference sections. */
ZmPref.clearPrefSections =
function() {
	ZmPref._prefSectionMap = {};
	ZmPref._prefSectionArray = null;
};

/**
 * Registers a preferences section ("tab").
 * <p>
 * The <code>params</code> argument can have the following properties:
 *
 * @param title         [string]    The section title.
 * @param templateId    [string]    (Optional) The template associated to this
 *                                  section. If not specified, the id is used.
 *                                  Note: The default template base is:
 *                                  "prefs.Pages#".
 * @param priority      [int]       The section priority used when determining
 *                                  the order of the sections.
 * @param precondition  [any]       (Optional) Specifies the precondition
 *                                  under which this section is shown. If this
 *                                  parameter is a function, it returns a
 *                                  boolean signifying that this section is
 *                                  present -- true to show this section. If
 *                                  this parameter is <em>not</em> a function,
 *                                  then it is considered a setting identifier
 *                                  that determines the presence of this
 *                                  section.
 * @param prefs         [Array]     List of preferences that appear in this
 *                                  section.
 * @param manageChanges [boolean]   Determines whether this section manages
 *                                  its own pref changes. If true, then
 *                                  ZmPrefView#getChangedPrefs will not query
 *                                  the section for changes.
 * @param manageDirty   [boolean]   Determines whether this section manages
 *                                  its "dirty" state (i.e. whether any prefs
 *                                  have changed values). If true, then
 *                                  ZmPrefView#getChangedPrefs will call
 *                                  isDirty() on the section view.
 */
ZmPref.registerPrefSection =
function(id, params) {
	if (!id || !params) { return; }

	// set template for section
	var templateId = params.templateId || id;
	if (!templateId.match(/#/)) {
		templateId = ["prefs.Pages",templateId].join("#");
	}
	params.templateId = templateId;
	params.id = id;

	// save section
	appCtxt.set(ZmSetting.PREF_SECTIONS, params, id);
	ZmPref._prefSectionArray = null;
};

ZmPref.unregisterPrefSection =
function(id) {
	appCtxt.set(ZmSetting.PREF_SECTIONS, null, id);
	ZmPref._prefSectionArray = null;
};

/** Returns the pref sections map. */
ZmPref.getPrefSectionMap =
function() {
	return appCtxt.get(ZmSetting.PREF_SECTIONS);
};

/** Returns a sorted array of pref sections (based on priority). */
ZmPref.getPrefSectionArray =
function() {
	if (!ZmPref._prefSectionArray) {
		ZmPref._prefSectionArray = [];
		var prefSectionMap = appCtxt.get(ZmSetting.PREF_SECTIONS);
		for (var id in prefSectionMap) {
			ZmPref._prefSectionArray.push(prefSectionMap[id]);
		}
		ZmPref._prefSectionArray.sort(ZmPref.__BY_PRIORITY);
	}
	return ZmPref._prefSectionArray;
};

/** Returns the section that contains the specified pref. */
ZmPref.getPrefSectionWithPref =
function(prefId) {
	var prefSectionMap = appCtxt.get(ZmSetting.PREF_SECTIONS);
	for (var sectionId in prefSectionMap) {
		var section = prefSectionMap[sectionId];
		if (section.prefs == null) continue;

		for (var i = 0; i < section.prefs.length; i++) {
			if (section.prefs[i] == prefId) {
				return section;
			}
		}
	}
	return null;
};

/** Returns true if <em>all</em> of the preconditions pass. */
ZmPref.requireAllPreConditions =
function(pre1 /* ..., preN */) {
	var app = appCtxt.getApp(ZmApp.PREFERENCES);
	var controller = app.getPrefController();

	for (var i = 0; i < arguments.length; i++) {
		if (!controller.checkPreCondition( null, arguments[i])) {
			return false;
		}
	}
	return true;
};

// Make sure the pref sections are init'd
ZmPref.clearPrefSections();

//
// Private functions
//

ZmPref.__BY_PRIORITY =
function(a, b) {
	return Number(a.priority) - Number(b.priority);
};
