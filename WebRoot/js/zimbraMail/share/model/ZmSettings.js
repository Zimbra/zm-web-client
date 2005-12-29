/*
 * ***** BEGIN LICENSE BLOCK *****
 * Version: ZPL 1.1
 * 
 * The contents of this file are subject to the Zimbra Public License
 * Version 1.1 ("License"); you may not use this file except in
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
 * Portions created by Zimbra are Copyright (C) 2005 Zimbra, Inc.
 * All Rights Reserved.
 * 
 * Contributor(s):
 * 
 * ***** END LICENSE BLOCK *****
 */

/**
* Creates a collection of settings with defaults values.
* @constructor
* @class
* This class is a collection of various sorts of settings: config values, preferences,
* and COS features. Each setting has an ID which can be used to retrieve it.
*
* @author Conrad Damon
* @param appCtxt	the app context
*/
function ZmSettings(appCtxt) {

	ZmModel.call(this, ZmEvent.S_SETTING);

	this._appCtxt = appCtxt;
	this._settings = new Object(); // settings by ID
	this._nameToId = new Object(); // map to get from server setting name to setting ID
	this._initialize();
	this._setDefaults();
	this.userSettingsLoaded = false;
	this._zmm = new ZmZimletMgr(appCtxt);
}

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
}

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
}

/**
* Returns the ZmSetting object for the given setting.
*
* @param id		the numeric ID of the setting
*/
ZmSettings.prototype.getSetting =
function(id) {
	return this._settings[id];
}

ZmSettings.prototype.createFromDom = 
function(node) {
	var children = node.childNodes;
	for (i = 0; i < children.length; i++) {
		var child = children[i];
		var name = child.getAttribute("name");
		var value = child.firstChild.nodeValue;
		var setting = this._settings[this._nameToId[name]];
		if (setting)
			setting.setValue(value);
		else
			DBG.println(AjxDebug.DBG1, "*** Unrecognized setting: " + name);
	}
}

/**
* Populates settings values.
*
* @param list		a list of preference or attribute objects
*/
ZmSettings.prototype.createFromJs = 
function(list) {
	for (i = 0; i < list.length; i++) {
		var obj = list[i];
		var setting = this._settings[this._nameToId[obj.name]];
		if (setting)
			setting.setValue(obj._content);
		else
			DBG.println(AjxDebug.DBG1, "*** Unrecognized setting: " + obj.name);
	}
}

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
	this._appCtxt.getAppController().sendRequest(soapDoc, true, respCallback, errorCallback);
}

ZmSettings.prototype._handleResponseLoadUserSettings =
function(callback, result) {
	var response = result.getResponse();
	var obj = response.GetInfoResponse;
	if (obj.name)
		this._settings[ZmSetting.USERNAME].setValue(obj.name);
	if (obj.lifetime)
		this._settings[ZmSetting.TOKEN_LIFETIME].setValue(obj.lifetime);
	if (obj.used)
		this._settings[ZmSetting.QUOTA_USED].setValue(obj.used);
	if (obj.prefs)
		this.createFromJs(obj.prefs.pref);
	if (obj.attrs)
		this.createFromJs(obj.attrs.attr);

	// handle settings whose values may depend on other settings
	if ((this.get(ZmSetting.GROUP_MAIL_BY) == "conversation") && !this.get(ZmSetting.CONVERSATIONS_ENABLED))
		this._settings[ZmSetting.GROUP_MAIL_BY].setValue("message", null, true);
	this._settings[ZmSetting.REPLY_TO_ADDRESS].defaultValue = this.get(ZmSetting.USERNAME);
	if (!this.get(ZmSetting.SEARCH_ENABLED))
		this._settings[ZmSetting.BROWSE_ENABLED].setValue(false, null, true);
	if (this.get(ZmSetting.FORCE_CAL_OFF))
		this._settings[ZmSetting.CALENDAR_ENABLED].setValue(false, null, true);
		
	// load Zimlets
	if(obj.zimlets && obj.zimlets.zimlet) {
		DBG.println(AjxDebug.DBG1, "Zimlets - Got " + (obj.zimlets.zimlet.length+1) + " Zimlets");
		this._zmm.loadZimlets(obj.zimlets.zimlet, obj.props.prop);
	 	var panelZimlets = this._zmm.getPanelZimlets();
	 	if(panelZimlets && panelZimlets.length > 0) {
			var zimletTree = this._appCtxt.getTree(ZmOrganizer.ZIMLET);
		 	if (!zimletTree) {
		 		zimletTree = new ZmFolderTree(this._appCtxt, ZmOrganizer.ZIMLET);
		 		this._appCtxt.setTree(ZmOrganizer.ZIMLET, zimletTree);
		 	}
		 	var zimletString = zimletTree.asString();
		 	zimletTree.reset();
		 	zimletTree.loadFromJs(panelZimlets);
	 	}
	 }

	this.userSettingsLoaded = true;
	
	if (callback)
		callback.run();
};

/**
* Retrieves the preferences for the current user. No COS settings or user metadata is
* retrieved.
*/
ZmSettings.prototype.loadPrefs =
function() {
    var soapDoc = AjxSoapDoc.create("GetPrefsRequest", "urn:zimbraAccount");
	var respCallback = new AjxCallback(this, this._handleResponseLoadPrefs);
    this._appCtxt.getAppController().sendRequest(soapDoc, true, respCallback);
};

ZmSettings.prototype._handleResponseLoadPrefs =
function(result) {
    var resp = result.getResponse().firstChild;
	this.createFromDom(resp);
};

/**
* Saves one or more settings.
*
* @param list	a list of settings (ZmSetting)
*/
ZmSettings.prototype.save =
function(list, callback) {
    if (!(list && list.length)) return;
    
    var soapDoc = AjxSoapDoc.create("ModifyPrefsRequest", "urn:zimbraAccount");
	for (var i = 0; i < list.length; i++) {
		var pref = list[i];
		if (pref.type != ZmSetting.T_PREF) {
			DBG.println(AjxDebug.DBG1, "*** Attempt to modify non-pref: " + pref.id + " / " + pref.name);
			continue;
		}
		var value = pref.getValue();
		if (pref.dataType == ZmSetting.D_BOOLEAN)
			value = value ? "TRUE" : "FALSE";
		var node = soapDoc.set("pref", value);
		node.setAttribute("name", pref.name);
	}

	var respCallback = new AjxCallback(this, this._handleResponseSave, [list, callback]);
	this._appCtxt.getAppController().sendRequest(soapDoc, true, respCallback);
}

ZmSettings.prototype._handleResponseSave =
function(list, callback, result) {
	var resp = result.getResponse();
	if (resp.ModifyPrefsResponse) {
		for (var i = 0; i < list.length; i++) {
			var pref = list[i];
			pref.origValue = pref.value;
			pref._notify(ZmEvent.E_MODIFY);
		}
	}
	
	if (callback) callback.run(result);
}	

// Convenience method to convert "group mail by" between server and client versions
ZmSettings.prototype.getGroupMailBy =
function() {
	var setting = this.get(ZmSetting.GROUP_MAIL_BY);
	if (!setting)
		DBG.println(AjxDebug.DBG1, "GROUP_MAIL_BY setting not found!");
	return setting ? ZmPref.GROUP_MAIL_BY_ITEM[setting] : ZmItem.MSG;
}

// Loads the settings and their default values. See ZmSetting for details.
ZmSettings.prototype._initialize =
function() {
	for (var id = 1; id <= ZmSetting.MAX_INDEX; id++) {
		var args = ZmSetting.INIT[id];
		if (!args) {
			DBG.println(AjxDebug.DBG1, "*** Uninitialized setting! id = " + id);
			continue;
		}
		var setting = new ZmSetting(id, args[0], args[1], args[2], args[3], this);
		this._settings[id] = setting;
		if (args[0])
			this._nameToId[args[0]] = id;
	}
}

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
	this._settings[ZmSetting.CSFE_SERVER_URI].setValue(value);

	// CSFE_MSG_FETCHER_URI
	value = portPrefix + "/service/home/~/?";
	this._settings[ZmSetting.CSFE_MSG_FETCHER_URI].setValue(value);
	
	// CSFE_UPLOAD_URI
	value = portPrefix + "/service/upload";
	this._settings[ZmSetting.CSFE_UPLOAD_URI].setValue(value);
	
	// CSFE EXPORT URI
	value = portPrefix + "/service/home/~/?id=7&fmt=csv";
	this._settings[ZmSetting.CSFE_EXPORT_URI].setValue(value);
	
	// default sorting preferences
	this._settings[ZmSetting.SORTING_PREF].setValue(ZmSearch.DATE_DESC, ZmController.CONVLIST_VIEW, true);
	this._settings[ZmSetting.SORTING_PREF].setValue(ZmSearch.DATE_DESC, ZmController.CONV_VIEW, true);
	this._settings[ZmSetting.SORTING_PREF].setValue(ZmSearch.DATE_DESC, ZmController.TRAD_VIEW, true);
	this._settings[ZmSetting.SORTING_PREF].setValue(ZmSearch.NAME_ASC, ZmController.CONTACT_SRC_VIEW, true);
	this._settings[ZmSetting.SORTING_PREF].setValue(ZmSearch.NAME_ASC, ZmController.CONTACT_TGT_VIEW, true);
}
