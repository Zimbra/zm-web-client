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
ZmPref.TYPE_COLOR		= "COLOR";
ZmPref.TYPE_RADIO_GROUP	= "RADIO_GROUP";
ZmPref.TYPE_SELECT		= "SELECT";
ZmPref.TYPE_TEXTAREA	= "TEXTAREA";
ZmPref.TYPE_PASSWORD	= "PASSWORD";
ZmPref.TYPE_IMPORT		= "IMPORT";
ZmPref.TYPE_EXPORT		= "EXPORT";
ZmPref.TYPE_SHORTCUTS	= "SHORTCUTS";
ZmPref.TYPE_CUSTOM		= "CUSTOM";

ZmPref.ORIENT_VERTICAL      = "vertical";
ZmPref.ORIENT_HORIZONTAL    = "horizontal";

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

ZmPref.loadLocales =
function(appCtxt, setup) {
	var locales = appCtxt.get(ZmSetting.LOCALES);
	for (var i = 0; i < locales.length; i++) {
		var locale = locales[i];
		setup.options.push(locale.id);
		setup.displayOptions.push(locale.name);
		var country = locale.id.substring(locale.id.length - 2);
		setup.images.push("Flag" + country);
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

ZmPref.approximateInterval =
function(value) {
	// get sorted copy of options
	var values = [].concat(ZmPref.SETUP["POLLING_INTERVAL"].options);
	values.sort(ZmPref.__BY_NUMBER);

	// find closest value
	for (var i = 0; i < values.length + 1; i++) {
		var a = values[i];
		var b = values[i+1];
		if (value < b) {
			var da = value - a;
			var db = b - value;
			return da < db ? a : b;
		}
	}

	return value;
};
ZmPref.__BY_NUMBER = function(a, b) {
	return Number(a) - Number(b);
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
 *                                  "zimbraMail.prefs.templates.Pages#".
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
        templateId = ["zimbraMail.prefs.templates.Pages",templateId].join("#");
    }
    params.templateId = templateId;
    params.id = id;

    // save section
    ZmPref._prefSectionMap[id] = params;
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

// Make sure the pref sections are init'd
ZmPref.clearPrefSections();

//
// Private functions
//

ZmPref.__BY_PRIORITY = function(a, b) {
    return Number(a.priority) - Number(b.priority);
};

