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
* Creates a collection of settings with default values. If no app context is given,
* then this is a skeletal, non-live version of settings which can provide default
* settings and parse SOAP settings.
* @constructor
* @class
* This class is a collection of various sorts of settings: config values, preferences,
* and COS features. Each setting has an ID which can be used to retrieve it.
*
* @author Conrad Damon
* @param appCtxt	[ZmAppCtxt]*	the app context
*/
function ZmSettings(appCtxt) {

	ZmModel.call(this, ZmEvent.S_SETTING);

	this._appCtxt = appCtxt;
	this._settings = {}; // settings by ID
	this._nameToId = {}; // map to get from server setting name to setting ID
	this._initialize();
	this._setDefaults();
	this.userSettingsLoaded = false;
};

ZmSettings.prototype = new ZmModel;
ZmSettings.prototype.constructor = ZmSettings;

/**
* Static method so that static code can get the default value of a setting if it needs to.
*
* @param id		the numeric ID of the setting
*/
ZmSettings.get =
function(id) {
	var args = ZmSetting.INIT[id];
	return args ? args[3] : null;
};

ZmSettings.prototype.toString =
function() {
	return "ZmSettings";
};

/**
* Returns the value of the given setting.
*
* @param id		the numeric ID of the setting
*/
ZmSettings.prototype.get =
function(id, key) {
	if (!this._settings[id]) {
		DBG.println(AjxDebug.DBG1, "*** missing setting " + id);
		return null;
	}
	return this._settings[id].getValue(key);
};

/**
* Returns the ZmSetting object for the given setting.
*
* @param id		the numeric ID of the setting
*/
ZmSettings.prototype.getSetting =
function(id) {
	return this._settings[id];
};

ZmSettings.prototype.createFromDom = 
function(node) {
	var children = node.childNodes;
	for (i = 0; i < children.length; i++) {
		var child = children[i];
		var name = child.getAttribute("name");
		var value = child.firstChild.nodeValue;
		var setting = this._settings[this._nameToId[name]];
		if (setting) {
			setting.setValue(value);
		} else {
			DBG.println(AjxDebug.DBG1, "*** Unrecognized setting: " + name);
		}
	}
};

/**
* Populates settings values.
*
* @param list		a list of preference or attribute objects
* TODO: handle multivalue
*/
ZmSettings.prototype.createFromJs = 
function(list) {
	if (list == null) return;
	for (i = 0; i < list.length; i++) {
		var obj = list[i];
		var setting = this._settings[this._nameToId[obj.name]];
		if (setting) {
			setting.setValue(obj._content);
		} else {
			DBG.println(AjxDebug.DBG1, "*** Unrecognized setting: " + obj.name);
		}
	}
};

/**
* Retrieves the preferences, COS settings, and metadata for the current user.
* All the data gets stored into the settings collection.
*
* @param callback [AjxCallback]		callback to run after response is received
*/
ZmSettings.prototype.loadUserSettings =
function(callback, errorCallback) {
    var soapDoc = AjxSoapDoc.create("GetInfoRequest", "urn:zimbraAccount");
    var respCallback = new AjxCallback(this, this._handleResponseLoadUserSettings, callback);
	this._appCtxt.getAppController().sendRequest({soapDoc: soapDoc, asyncMode: true,
												  callback: respCallback, errorCallback: errorCallback});
};

ZmSettings.prototype._handleResponseLoadUserSettings =
function(callback, result) {
	var response = result.getResponse();
	var obj = response.GetInfoResponse;
	if (obj.name) {
		this._settings[ZmSetting.USERNAME].setValue(obj.name);
	}
	if (obj.lifetime) {
		this._settings[ZmSetting.TOKEN_LIFETIME].setValue(obj.lifetime);
	}
	if (obj.used) {
		this._settings[ZmSetting.QUOTA_USED].setValue(obj.used);
	}
	if (obj.prefs && obj.prefs.pref) {
		this.createFromJs(obj.prefs.pref);
	}
	if (obj.attrs && obj.attrs.attr) {
		this.createFromJs(obj.attrs.attr);
	}
	if (obj.license) {
		this._settings[ZmSetting.LICENSE_STATUS].setValue(obj.license.status);
	}
	
	// handle settings whose values may depend on other settings
	this._settings[ZmSetting.GROUP_MAIL_BY].setValue(this.get(ZmSetting.INITIAL_GROUP_MAIL_BY), null, true);
	if ((this.get(ZmSetting.GROUP_MAIL_BY) == ZmSetting.GROUP_BY_CONV) && !this.get(ZmSetting.CONVERSATIONS_ENABLED)) {
		this._settings[ZmSetting.GROUP_MAIL_BY].setValue(ZmSetting.GROUP_BY_MESSAGE, null, true);
	}
	this._settings[ZmSetting.REPLY_TO_ADDRESS].defaultValue = this.get(ZmSetting.USERNAME);
	if (!this.get(ZmSetting.SEARCH_ENABLED)) {
		this._settings[ZmSetting.BROWSE_ENABLED].setValue(false, null, true);
	}
	if (this.get(ZmSetting.FORCE_CAL_OFF)) {
		this._settings[ZmSetting.CALENDAR_ENABLED].setValue(false, null, true);
	}

	// bug fix #6787 - disable HTML compose in Safari until design mode is more stable
	if (AjxEnv.isSafari) {
		this._settings[ZmSetting.HTML_COMPOSE_ENABLED].setValue(false);
	}

	// load Zimlets
	if (obj.zimlets && obj.zimlets.zimlet) {
		DBG.println(AjxDebug.DBG1, "Zimlets - Loading " + obj.zimlets.zimlet.length + " Zimlets");
		AjxDispatcher.require("Zimlet");
		this._appCtxt.getZimletMgr().loadZimlets(obj.zimlets.zimlet, obj.props.prop);
	}

    this.userSettingsLoaded = true;
	
	if (callback) {
		callback.run(result);
	}
};

ZmSettings.prototype.loadAvailableSkins =
function(callback) {
	var soapDoc = AjxSoapDoc.create("GetAvailableSkinsRequest", "urn:zimbraAccount");
	var respCallback = new AjxCallback(this, this._handleResponseLoadAvailableSkins, [callback]);
	this._appCtxt.getAppController().sendRequest({soapDoc: soapDoc, asyncMode: true, callback: respCallback});
};

ZmSettings.prototype._handleResponseLoadAvailableSkins =
function(callback, result) {
	var resp = result.getResponse().GetAvailableSkinsResponse;
	var skins = resp.skin;
	for (var i = 0; i < skins.length; i++) {
		var name = skins[i].name;
		this._settings[ZmSetting.AVAILABLE_SKINS].setValue(name);
	}
	if (callback) {
		callback.run();
	}
};

/**
* Saves one or more settings.
*
* @param list			[array]				a list of ZmSetting
* @param batchCommand	[ZmBatchCommand]	Batch command. Optional
*/
ZmSettings.prototype.save =
function(list, callback, batchCommand) {
    if (!(list && list.length)) return;
    
    var soapDoc = AjxSoapDoc.create("ModifyPrefsRequest", "urn:zimbraAccount");
    var gotOne = false;
	for (var i = 0; i < list.length; i++) {
		var setting = list[i];
		if (setting.type != ZmSetting.T_PREF) {
			DBG.println(AjxDebug.DBG1, "*** Attempt to modify non-pref: " + setting.id + " / " + setting.name);
			continue;
		}
		if (!setting.name) {
			DBG.println(AjxDebug.DBG2, "Modify internal pref: " + setting.id);
			continue;
		}
		var value = setting.getValue();
		if (setting.dataType == ZmSetting.D_BOOLEAN) {
			value = value ? "TRUE" : "FALSE";
		}
		var node = soapDoc.set("pref", value);
		node.setAttribute("name", setting.name);
		gotOne = true;
	}

	if (gotOne) {
		var respCallback = new AjxCallback(this, this._handleResponseSave, [list, callback]);
		if (batchCommand) {
			batchCommand.addNewRequestParams(soapDoc, respCallback, null, "ModifyPrefsRequest");
		} else {
			this._appCtxt.getAppController().sendRequest({soapDoc: soapDoc, asyncMode: true, callback: respCallback});
		}
	}
};

ZmSettings.prototype._handleResponseSave =
function(list, callback, result) {
	var resp = result.getResponse();
	if (resp.ModifyPrefsResponse) {
		// notify each changed setting's listeners
		for (var i = 0; i < list.length; i++) {
			var setting = list[i];
			setting.origValue = setting.value;
			if (setting.id == ZmSetting.SKIN_NAME) {
				ZmLogin.setCookie(ZmLogin.SKIN_COOKIE, setting.getValue());
			}
			setting._notify(ZmEvent.E_MODIFY);
		}
	}
	
	if (callback) callback.run(result);
};

// Loads the settings and their default values. See ZmSetting for details.
ZmSettings.prototype._initialize =
function() {
	for (var id = 1; id <= ZmSetting.MAX_INDEX; id++) {
		var args = ZmSetting.INIT[id];
		if (!args) {
			DBG.println(AjxDebug.DBG1, "*** Uninitialized setting! id = " + id);
			continue;
		}
		this._settings[id] = new ZmSetting(id, args[0], args[1], args[2], args[3], this);
		if (args[0])
			this._nameToId[args[0]] = id;
	}
};

// Set defaults which are determined dynamically (which can't be set in static code).
ZmSettings.prototype._setDefaults =
function() {
	var value;

	var noPort = (location.port == "" || location.port == "80");
    var portPrefix = noPort ? "" : ":" + location.port;

	// CSFE_SERVER_URI
	value = portPrefix + "/service/soap/";
	if (location.search && location.search.indexOf("host=") != -1)
		value += location.search;
	this._settings[ZmSetting.CSFE_SERVER_URI].setValue(value, null, false, true);

	// CSFE_MSG_FETCHER_URI
	value = portPrefix + "/service/home/~/?auth=co&";
	this._settings[ZmSetting.CSFE_MSG_FETCHER_URI].setValue(value, null, false, true);
	
	// CSFE_UPLOAD_URI
	value = portPrefix + "/service/upload";
	this._settings[ZmSetting.CSFE_UPLOAD_URI].setValue(value, null, false, true);
	
	// CSFE EXPORT URI
	value = portPrefix + "/service/home/~/?auth=co&id={0}&fmt=csv";
	this._settings[ZmSetting.CSFE_EXPORT_URI].setValue(value, null, false, true);
	
	// default sorting preferences
	if (this._appCtxt) {
		this._settings[ZmSetting.SORTING_PREF].setValue(ZmSearch.DATE_DESC, ZmController.CONVLIST_VIEW, true, true);
		this._settings[ZmSetting.SORTING_PREF].setValue(ZmSearch.DATE_DESC, ZmController.CONV_VIEW, true, true);
		this._settings[ZmSetting.SORTING_PREF].setValue(ZmSearch.DATE_DESC, ZmController.TRAD_VIEW, true, true);
		this._settings[ZmSetting.SORTING_PREF].setValue(ZmSearch.NAME_ASC, ZmController.CONTACT_SRC_VIEW, true, true);
		this._settings[ZmSetting.SORTING_PREF].setValue(ZmSearch.NAME_ASC, ZmController.CONTACT_TGT_VIEW, true, true);
		this._settings[ZmSetting.SORTING_PREF].setValue(ZmSearch.NAME_ASC, ZmController.CONTACT_SIMPLE_VIEW, true, true);
		this._settings[ZmSetting.SORTING_PREF].setValue(ZmSearch.NAME_ASC, ZmController.CONTACT_CARDS_VIEW, true, true);
	}
};

/**
 * Loads the user's custom shortcuts, which consist of key bindings for organizers
 * that has aliases. Note that we don't check to see if KB nav is enabled, since it
 * gets disabled during a SOAP request (we don't want to process KB input while the
 * busy veil is up).
 */
ZmSettings.prototype._loadShortcuts =
function() {
	var kbm = this._appCtxt.getKeyboardMgr();
	var maps = {};
	var kmm = kbm.__keyMapMgr;
	var scString = this.get(ZmSetting.SHORTCUTS);
	if (!scString || !kmm) { return; }
	var shortcuts = scString.split('|');
	var len = shortcuts.length;
	for (var i = 0; i < len; i++) {
		var sc = ZmShortcut.parse(shortcuts[i]);
		kmm.setMapping(sc.mapName, sc.keySequence, sc.action);
		kmm.setArg(sc.mapName, sc.action, sc.arg);
		maps[sc.mapName] = true;
	}
	for (var map in maps) {
		kmm.reloadMap(map);
	}
};
