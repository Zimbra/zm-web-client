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

ZmPref = function(id, name, dataType) {

	ZmSetting.call(this, id, name, ZmSetting.T_PREF, dataType);

	this.origValue = null;
	this.isDirty = false;
};

ZmPref.prototype = new ZmSetting;
ZmPref.prototype.constructor = ZmPref;

ZmPref.KEY_ID = "prefId_";

ZmPref.TYPE_STATIC		= "STATIC"; // static text
ZmPref.TYPE_INPUT		= "INPUT";
ZmPref.TYPE_CHECKBOX	= "CHECKBOX";
ZmPref.TYPE_COLOR		= "COLOR";
ZmPref.TYPE_RADIO_GROUP	= "RADIO_GROUP";
ZmPref.TYPE_SELECT		= "SELECT";
ZmPref.TYPE_COMBOBOX	= "COMBOBOX";
ZmPref.TYPE_TEXTAREA	= "TEXTAREA";
ZmPref.TYPE_PASSWORD	= "PASSWORD";
ZmPref.TYPE_IMPORT		= "IMPORT";
ZmPref.TYPE_EXPORT		= "EXPORT";
ZmPref.TYPE_SHORTCUTS	= "SHORTCUTS";
ZmPref.TYPE_CUSTOM		= "CUSTOM";
ZmPref.TYPE_LOCALES     = "LOCALES";

ZmPref.ORIENT_VERTICAL      = "vertical";
ZmPref.ORIENT_HORIZONTAL    = "horizontal";

// custom functions for loading and validation

ZmPref.loadSkins =
function(setup) {
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
	var minimum = appCtxt.get(ZmSetting.MIN_POLLING_INTERVAL);
	if (interval && minimum && interval >= minimum) {
		return true;
	} else {
		var min = minimum / 60;
		ZmPref.SETUP[ZmSetting.POLLING_INTERVAL].errorMessage = AjxMessageFormat.format(ZmMsg.invalidPollingInterval, min);
		return false;
	}
};

ZmPref.pollingIntervalDisplay = function(seconds) {
	return seconds / 60;
};
ZmPref.pollingIntervalValue = function(minutes) {
	return minutes * 60;
}

ZmPref.int2DurationDay = function(intValue) {
	return intValue != null && intValue != 0 ? intValue + "d" : intValue;
};

ZmPref.durationDay2Int = function(durValue) {
	return parseInt(durValue, 10); // NOTE: parseInt ignores non-digits
};

ZmPref.approximateInterval = function(value) {
	var values = [].concat(ZmPref.SETUP["POLLING_INTERVAL"].options);
	values.sort(ZmPref.__BY_NUMBER);
	return ZmPref.approximateValue(values, value);
};

ZmPref.approximateValue = function(sortedValues, value) {
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

ZmPref.validateLifetime = function(value) {
	var globalValue = appCtxt.get(ZmSetting.MAIL_LIFETIME_GLOBAL);
	if (globalValue == "0") return true;
	return ZmPref.__BY_DURATION(value, globalValue) <= 0;
};
ZmPref.validateLifetimeJunk = function(value) {
	var globalValue = appCtxt.get(ZmSetting.MAIL_LIFETIME_JUNK_GLOBAL);
	if (globalValue == "0") return true;
	return ZmPref.__BY_DURATION(value, globalValue) <= 0 && ZmPref.validateLifetime(value);
};
ZmPref.validateLifetimeTrash = function(value) {
	var globalValue = appCtxt.get(ZmSetting.MAIL_LIFETIME_TRASH_GLOBAL);
	if (globalValue == "0") return true;
	return ZmPref.__BY_DURATION(value, globalValue) <= 0 && ZmPref.validateLifetime(value);
};

ZmPref.approximateLifetimeInboxRead = function(value) {
	return ZmPref.approximateLifetime("MAIL_LIFETIME_INBOX_READ", value, ZmPref.validateLifetime);
};
ZmPref.approximateLifetimeInboxUnread = function(value) {
	return ZmPref.approximateLifetime("MAIL_LIFETIME_INBOX_UNREAD", value, ZmPref.validateLifetime);
};
ZmPref.approximateLifetimeJunk = function(value) {
	return ZmPref.approximateLifetime("MAIL_LIFETIME_JUNK", value, ZmPref.validateLifetimeJunk, ZmPref.validateLifetime);
};
ZmPref.approximateLifetimeSent = function(value) {
	return ZmPref.approximateLifetime("MAIL_LIFETIME_SENT", value, ZmPref.validateLifetime);
};
ZmPref.approximateLifetimeTrash = function(value) {
	return ZmPref.approximateLifetime("MAIL_LIFETIME_TRASH", value, ZmPref.validateLifetimeTrash, ZmPref.validateLifetime);
};

ZmPref.approximateLifetime = function(prefId, duration, validateFunc1/*, ..., validateFuncN*/) {
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

// Comparators

ZmPref.__BY_NUMBER = function(a, b) {
	if (a == b) return 0;
	if (a == Math.POSITIVE_INFINITY || b == Math.NEGATIVE_INFINITY) return 1;
	if (b == Math.POSITIVE_INFINITY || a == Math.NEGATIVE_INFINITY) return -1;
	return Number(a) - Number(b);
};
ZmPref.__BY_DURATION = function(a, b) {
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

ZmPref.__DUR2SECS = function(duration) {
	if (duration == "0") return Number.POSITIVE_INFINITY;

	var type = duration.substring(duration.length - 1).toLowerCase();
	return parseInt(duration, 10) * ZmPref.__DURMULT[type];
};

ZmPref.__SECS2DUR = function(seconds, type) {
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
 * displayContainer		type of form input: checkbox, select, input, or textarea
 * options				values for a select input
 * displayOptions		text for the select input's values
 * validationFunction	function to validate the value
 * errorMessage			message to show if validation fails
 * displaySeparator		if true, a line will be drawn below this pref
 * precondition			pref will not be displayed unless precondition is true
 */
ZmPref.SETUP = {};

ZmPref.registerPref = function(id, params) {
	ZmPref.SETUP[id] = params;
};
/** Clears all of the preference sections. */
ZmPref.clearPrefSections = function() {
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
ZmPref.registerPrefSection = function(id, params) {
    if (!id || !params) return;

    // set template for section
    var templateId = params.templateId || id;
    if (!templateId.match(/#/)) {
        templateId = ["prefs.Pages",templateId].join("#");
    }
    params.templateId = templateId;
    params.id = id;

    // save section
    ZmPref._prefSectionMap[id] = params;
    ZmPref._prefSectionArray = null;
};

ZmPref.unregisterPrefSection = function(id) {
	delete ZmPref._prefSectionMap[id];
	ZmPref._prefSectionArray = null;
};

/** Returns the pref sections map. */
ZmPref.getPrefSectionMap = function() {
    return ZmPref._prefSectionMap;
};

/** Returns a sorted array of pref sections (based on priority). */
ZmPref.getPrefSectionArray = function() {
    if (!ZmPref._prefSectionArray) {
        ZmPref._prefSectionArray = [];
        for (var id in ZmPref._prefSectionMap) {
            ZmPref._prefSectionArray.push(ZmPref._prefSectionMap[id]);
        }
        ZmPref._prefSectionArray.sort(ZmPref.__BY_PRIORITY);
    }
    return ZmPref._prefSectionArray;
};

/** Returns the section that contains the specified pref. */
ZmPref.getPrefSectionWithPref = function(prefId) {
    for (var sectionId in ZmPref._prefSectionMap) {
        var section = ZmPref._prefSectionMap[sectionId];
        if (!section.prefs) continue;

        for (var i = 0; i < section.prefs.length; i++) {
            if (section.prefs[i] == prefId) {
                return section;
            }
        }
    }
    return null;
};

/** Returns true if <em>all</em> of the preconditions pass. */
ZmPref.requireAllPreConditions = function(pre1 /* ..., preN */) {
	var app = appCtxt.getApp(ZmApp.PREFERENCES);
	var controller = app.getPrefController();

	for (var i = 0; i < arguments.length; i++) {
		if (!controller.checkPreCondition({}, arguments[i])) {
			return false;
		}
	}
	return true;
}

// Make sure the pref sections are init'd
ZmPref.clearPrefSections();

//
// Private functions
//

ZmPref.__BY_PRIORITY = function(a, b) {
    return Number(a.priority) - Number(b.priority);
};

