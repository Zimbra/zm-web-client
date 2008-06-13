/*
 * ***** BEGIN LICENSE BLOCK *****
 *
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2004, 2005, 2006, 2007 Zimbra, Inc.
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

ZmCalendarPrefsPage = function(parent, section, controller) {
	ZmPreferencesPage.apply(this, arguments);

	ZmCalendarPrefsPage.TEXTAREA = {};
	ZmCalendarPrefsPage.TEXTAREA[ZmSetting.CAL_FREE_BUSY_ACL]	= ZmSetting.CAL_FREE_BUSY_ACL_USERS;
	ZmCalendarPrefsPage.TEXTAREA[ZmSetting.CAL_INVITE_ACL]		= ZmSetting.CAL_INVITE_ACL_USERS;
};

ZmCalendarPrefsPage.prototype = new ZmPreferencesPage;
ZmCalendarPrefsPage.prototype.constructor = ZmCalendarPrefsPage;

ZmCalendarPrefsPage.prototype.toString = function() {
	return "ZmCalendarPrefsPage";
};

ZmCalendarPrefsPage.prototype.reset =
function(useDefaults) {
	ZmPreferencesPage.prototype.reset.apply(this, arguments);
	this._checkPermTextarea(ZmSetting.CAL_FREE_BUSY_ACL);
	this._checkPermTextarea(ZmSetting.CAL_INVITE_ACL);
};

ZmCalendarPrefsPage.prototype._createControls =
function() {
	// First, load the user's ACL
	this._acl = appCtxt.getACL();
	var respCallback = new AjxCallback(this, this._handleResponseLoadACL);
	if (this._acl && !this._acl._loaded) {
		this._acl.load(respCallback);
	}
};

ZmCalendarPrefsPage.prototype._handleResponseLoadACL =
function() {
	// Set values for calendar ACL-related settings
	this._setACLValues(ZmSetting.CAL_FREE_BUSY_ACL, ZmSetting.RIGHT_VIEW_FREE_BUSY);
	this._setACLValues(ZmSetting.CAL_INVITE_ACL, ZmSetting.RIGHT_INVITE);
	
	ZmPreferencesPage.prototype._createControls.apply(this, arguments);
	this._checkPermTextarea(ZmSetting.CAL_FREE_BUSY_ACL);
	this._checkPermTextarea(ZmSetting.CAL_INVITE_ACL);
};

ZmCalendarPrefsPage.prototype._setACLValues =
function(setting, right) {
	appCtxt.set(setting, this._acl.getGranteeType(right));
	var list = this._acl.getGrantees(right);
	appCtxt.set(ZmCalendarPrefsPage.TEXTAREA[setting], list.join("\n"));
};

/**
 * ZmPrefView.getChangedPrefs() doesn't quite work for performing a dirty check on this page since
 * it only returns true if a changed setting is stored in LDAP (has a 'name' property in its ZmSetting
 * object). This override checks the ACL-related settings to see if they changed. The only real difference
 * is that the final check is (!unchanged) rather than (addToList).
 */
ZmCalendarPrefsPage.prototype.isDirty =
function(section, list, errors) {
	var dirty = this._controller.getPrefsView()._checkSection(section, this, true, true, list, errors);
	if (!dirty) {
		var settings = appCtxt.getSettings();
		var prefs = [ZmSetting.CAL_FREE_BUSY_ACL, ZmSetting.CAL_FREE_BUSY_ACL_USERS,
					 ZmSetting.CAL_INVITE_ACL, ZmSetting.CAL_INVITE_ACL_USERS];
		for (var i = 0; i < prefs.length; i++) {
			var id = prefs[i];
			var value = this.getFormValue(id);
			var pref = settings.getSetting(id);
			var origValue = pref.origValue;
			var unchanged = (value == origValue);
			// null and "" are the same string for our purposes
			if (pref.dataType == ZmSetting.D_STRING) {
				unchanged = unchanged || ((value == null || value == "") &&
										  (origValue == null ||
										   origValue == ""));
			}
	
			if (!unchanged) {
				return true;
			}
		}
	}
	return dirty;
};

ZmCalendarPrefsPage.prototype._checkPermTextarea =
function(setting) {
	var radioGroup = this.getFormObject(setting);
	var val = radioGroup && radioGroup.getValue();
	var textarea = this.getFormObject(ZmCalendarPrefsPage.TEXTAREA[setting]);
	if (textarea && val) {
		textarea.setEnabled(val == ZmSetting.ACL_USER);
	}
};

ZmCalendarPrefsPage.prototype._setupRadioGroup =
function(id, setup, value) {
	var control = ZmPreferencesPage.prototype._setupRadioGroup.apply(this, arguments);
	var radioGroup = this.getFormObject(id);
	if (id == ZmSetting.CAL_FREE_BUSY_ACL || id == ZmSetting.CAL_INVITE_ACL) {
		radioGroup.addSelectionListener(new AjxListener(this, this._checkPermTextarea, [id]));
	}
	return control;
};

ZmCalendarPrefsPage.prototype.getPreSaveCallback =
function() {
	return new AjxCallback(this, this._preSave);
};

ZmCalendarPrefsPage.prototype._preSave =
function(callback) {
	var result = this._getACLChanges(ZmSetting.CAL_FREE_BUSY_ACL, ZmSetting.RIGHT_VIEW_FREE_BUSY);
	this._grants = result.grants;
	this._revokes = result.revokes;
	result = this._getACLChanges(ZmSetting.CAL_INVITE_ACL, ZmSetting.RIGHT_INVITE);
	this._grants = this._grants.concat(result.grants);
	this._revokes = this._revokes.concat(result.revokes);

	if (callback) {
		callback.run();
	}
};

ZmCalendarPrefsPage.prototype._getACLChanges =
function(setting, right) {

	var curType = appCtxt.get(setting);
	var curUsers = (curType == ZmSetting.ACL_USER) ? this._acl.getGrantees(right) : [];
	var curHash = AjxUtil.arrayAsHash(curUsers);
	
	var radioGroup = this.getFormObject(setting);
	var newType = radioGroup.getValue();
	var newUsers = [];
	if (newType == ZmSetting.ACL_USER) {
		var textarea = this.getFormObject(ZmCalendarPrefsPage.TEXTAREA[setting]);
		var val = textarea.getValue();
		newUsers = val.split("\n");
		newUsers.sort();
	}
	var newHash = AjxUtil.arrayAsHash(newUsers);
	
	var grants = [];
	var revokes = [];
	if (newUsers.length > 0) {
		for (var i = 0; i < newUsers.length; i++) {
			var user = newUsers[i];
			if (!curHash[user]) {
				var ace = new ZmAccessControlEntry({grantee:user, granteeType:ZmSetting.ACL_USER, right:right});
				grants.push(ace);
			}
		}
	}
	if (curUsers.length > 0) {
		for (var i = 0; i < curUsers.length; i++) {
			var user = curUsers[i];
			if (!newHash[user]) {
				var ace = new ZmAccessControlEntry({grantee:user, granteeType:ZmSetting.ACL_USER, right:right});
				revokes.push(ace);
			}
		}
	}
	
	return {grants:grants, revokes:revokes};
};

ZmCalendarPrefsPage.prototype.addCommand =
function(batchCmd) {
	if (this._grants.length) {
		this._acl.grant(this._grants, null, batchCmd);
	}
	if (this._revokes.length) {
		this._acl.revoke(this._revokes, null, batchCmd);
	}
};
