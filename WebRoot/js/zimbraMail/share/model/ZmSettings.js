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
function LmSettings(appCtxt) {

	LmModel.call(this, true);

	this._appCtxt = appCtxt;
	this._settings = new Object(); // settings by ID
	this._nameToId = new Object(); // map to get from server setting name to setting ID
	this._initialize();
	this._setDefaults();
	this.userSettingsLoaded = false;
	this._evt = new LmEvent(LmEvent.S_SETTING);
}

LmSettings.prototype = new LmModel;
LmSettings.prototype.constructor = LmSettings;

/**
* Static method so that static code can get the default value of a setting if it needs to.
*
* @param id		the numeric ID of the setting
*/
LmSettings.get =
function(id) {
	var args = LmSetting.INIT[id];
	return args ? args[3] : null;
}

/**
* Returns the value of the given setting.
*
* @param id		the numeric ID of the setting
*/
LmSettings.prototype.get =
function(id, key) {
	if (!this._settings[id]) {
		DBG.println(LsDebug.DBG1, "*** missing setting " + id);
		return null;
	}
	return this._settings[id].getValue(key);
}

/**
* Returns the LmSetting object for the given setting.
*
* @param id		the numeric ID of the setting
*/
LmSettings.prototype.getSetting =
function(id) {
	return this._settings[id];
}

LmSettings.prototype.createFromDom = 
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
			DBG.println(LsDebug.DBG1, "*** Unrecognized setting: " + name);
	}
}

/**
* Populates settings values.
*
* @param list		a list of preference or attribute objects
*/
LmSettings.prototype.createFromJs = 
function(list) {
	for (i = 0; i < list.length; i++) {
		var obj = list[i];
		var setting = this._settings[this._nameToId[obj.name]];
		if (setting)
			setting.setValue(obj._content);
		else
			DBG.println(LsDebug.DBG1, "*** Unrecognized setting: " + obj.name);
	}
}

/**
* Retrieves the preferences, COS settings, and metadata for the current user.
* All the data gets stored into the settings collection.
*/ 
LmSettings.prototype.loadUserSettings =
function() {
    var soapDoc = LsSoapDoc.create("GetInfoRequest", "urn:liquidAccount");
	var resp = this._appCtxt.getAppController().sendRequest(soapDoc);
	var obj = resp.GetInfoResponse;
	if (obj.name)
		this._settings[LmSetting.USERNAME].setValue(obj.name);
	if (obj.lifetime)
		this._settings[LmSetting.TOKEN_LIFETIME].setValue(obj.lifetime);
	if (obj.used)
		this._settings[LmSetting.QUOTA_USED].setValue(obj.used);
	if (obj.prefs)
		this.createFromJs(obj.prefs.pref);
	if (obj.attrs)
		this.createFromJs(obj.attrs.attr);

	// handle settings whose values may depend on other settings
	if ((this.get(LmSetting.GROUP_MAIL_BY) == "conversation") && !this.get(LmSetting.CONVERSATIONS_ENABLED))
		this._settings[LmSetting.GROUP_MAIL_BY].setValue("message", null, true);
	this._settings[LmSetting.REPLY_TO_ADDRESS].defaultValue = this.get(LmSetting.USERNAME);
	if (!this.get(LmSetting.SEARCH_ENABLED))
		this._settings[LmSetting.BROWSE_ENABLED].setValue(false, null, true);
	if (this.get(LmSetting.FORCE_CAL_OFF))
		this._settings[LmSetting.CALENDAR_ENABLED].setValue(false, null, true);

	this.userSettingsLoaded = true;
}

/**
* Retrieves the preferences for the current user. No COS settings or user metadata is
* retrieved.
*/
LmSettings.prototype.loadPrefs =
function() {
    var soapDoc = LsSoapDoc.create("GetPrefsRequest", "urn:liquidAccount");
    var resp = this._appCtxt.getAppController().sendRequest(soapDoc).firstChild;
	this.createFromDom(resp);
}

/**
* Saves one or more settings.
*
* @param list	a list of settings (LmSetting)
*/
LmSettings.prototype.save =
function(list) {
    if (!(list && list.length)) return;
    
    var soapDoc = LsSoapDoc.create("ModifyPrefsRequest", "urn:liquidAccount");
	for (var i = 0; i < list.length; i++) {
		var pref = list[i];
		if (pref.type != LmSetting.T_PREF) {
			DBG.println(LsDebug.DBG1, "*** Attempt to modify non-pref: " + pref.id + " / " + pref.name);
			continue;
		}
		var value = pref.getValue();
		if (pref.dataType == LmSetting.D_BOOLEAN)
			value = value ? "TRUE" : "FALSE";
		var node = soapDoc.set("pref", value);
		node.setAttribute("name", pref.name);
	}

	var resp = this._appCtxt.getAppController().sendRequest(soapDoc);
	
	if (resp.ModifyPrefsResponse) {
		for (var i = 0; i < list.length; i++) {
			var pref = list[i];
			pref.origValue = pref.value;
			pref.notify(LmEvent.E_MODIFY);
		}
	}
}

// Convenience method to convert "group mail by" between server and client versions
LmSettings.prototype.getGroupMailBy =
function() {
	var setting = this.get(LmSetting.GROUP_MAIL_BY);
	if (!setting)
		DBG.println(LsDebug.DBG1, "GROUP_MAIL_BY setting not found!");
	return setting ? LmPref.GROUP_MAIL_BY_ITEM[setting] : LmItem.MSG;
}

// Loads the settings and their default values. See LmSetting for details.
LmSettings.prototype._initialize =
function() {
	for (var id = 1; id <= LmSetting.MAX_INDEX; id++) {
		var args = LmSetting.INIT[id];
		if (!args) {
			DBG.println(LsDebug.DBG1, "*** Uninitialized setting! id = " + id);
			continue;
		}
		var setting = new LmSetting(id, args[0], args[1], args[2], args[3], this);
		this._settings[id] = setting;
		if (args[0])
			this._nameToId[args[0]] = id;
	}
}

// Set defaults which are determined dynamically (which can't be set in static code).
LmSettings.prototype._setDefaults =
function() {
	var value;

	var noPort = (location.port == "" || location.port == "80");
	// CSFE_SERVER_URI
	value = (noPort)? "/service/soap/" : ":" + location.port + "/service/soap/";
	if (location.search && location.search.indexOf("host=") != -1)
		value += location.search;
	this._settings[LmSetting.CSFE_SERVER_URI].setValue(value);

	// CSFE_MSG_FETCHER_URI
	value = (noPort) ? "/service/content/get?" : ":" + location.port + "/service/content/get?";
	this._settings[LmSetting.CSFE_MSG_FETCHER_URI].setValue(value);
	
	// CSFE_UPLOAD_URI
	value = (noPort) ? "/service/upload" : ":" + location.port + "/service/upload";
	this._settings[LmSetting.CSFE_UPLOAD_URI].setValue(value);
	
	// CSFE EXPORT URI
	value = (noPort) ? "/service/csv/contacts.csv" : ":" + location.port + "/service/csv/contacts.csv";
	this._settings[LmSetting.CSFE_EXPORT_URI].setValue(value);
	
	// default sorting preferences
	this._settings[LmSetting.SORTING_PREF].setValue(LmSearch.DATE_DESC, LmController.CONVLIST_VIEW, true);
	this._settings[LmSetting.SORTING_PREF].setValue(LmSearch.DATE_DESC, LmController.CONV_VIEW, true);
	this._settings[LmSetting.SORTING_PREF].setValue(LmSearch.DATE_DESC, LmController.TRAD_VIEW, true);
	this._settings[LmSetting.SORTING_PREF].setValue(LmSearch.NAME_ASC, LmController.CONTACT_SRC_VIEW, true);
	this._settings[LmSetting.SORTING_PREF].setValue(LmSearch.NAME_ASC, LmController.CONTACT_TGT_VIEW, true);
}
