/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2008, 2009, 2010 Zimbra, Inc.
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

/**
 * Creates a preferences page for managing calendar prefs
 * @constructor
 * @class
 * This class adds specialized handling for managing calendar ACLs that control whether
 * events can be added to the user's calendar, and who can see the user's free/busy info.
 *
 * @author Conrad Damon
 *
 * @param {DwtControl}	parent			the containing widget
 * @param {Object}	section			which page we are
 * @param {ZmPrefController}	controller		the prefs controller
 * 
 * @extends		ZmPreferencesPage
 * 
 * @private
 */
ZmCalendarPrefsPage = function(parent, section, controller) {

	ZmPreferencesPage.apply(this, arguments);

	ZmCalendarPrefsPage.TEXTAREA = {};
	ZmCalendarPrefsPage.TEXTAREA[ZmSetting.CAL_FREE_BUSY_ACL]	= ZmSetting.CAL_FREE_BUSY_ACL_USERS;
	ZmCalendarPrefsPage.TEXTAREA[ZmSetting.CAL_INVITE_ACL]		= ZmSetting.CAL_INVITE_ACL_USERS;
	ZmCalendarPrefsPage.SETTINGS	= [ZmSetting.CAL_FREE_BUSY_ACL, ZmSetting.CAL_INVITE_ACL];
	ZmCalendarPrefsPage.RIGHTS		= [ZmSetting.RIGHT_VIEW_FREE_BUSY, ZmSetting.RIGHT_INVITE];

	this._currentSelection = {};
	this._initAutocomplete();
};

ZmCalendarPrefsPage.prototype = new ZmPreferencesPage;
ZmCalendarPrefsPage.prototype.constructor = ZmCalendarPrefsPage;

ZmCalendarPrefsPage.prototype.toString =
function() {
	return "ZmCalendarPrefsPage";
};

ZmCalendarPrefsPage.prototype.reset =
function(useDefaults) {
	ZmPreferencesPage.prototype.reset.apply(this, arguments);
	var settings = ZmCalendarPrefsPage.SETTINGS;
	for (var i = 0; i < settings.length; i++) {
		this._checkPermTextarea(settings[i]);
	}
};

ZmCalendarPrefsPage.prototype.showMe =
function() {
	var active = appCtxt.getActiveAccount();
	this._isAclSupported = !appCtxt.multiAccounts || appCtxt.isFamilyMbox || (!active.isMain && active.isZimbraAccount);

	ZmPreferencesPage.prototype.showMe.call(this);
};

ZmCalendarPrefsPage.prototype._getTemplateData =
function() {
	var data = ZmPreferencesPage.prototype._getTemplateData.call(this);
	data.domain = appCtxt.getUserDomain();
	data.isAclSupported = this._isAclSupported;

	return data;
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
	var settings = ZmCalendarPrefsPage.SETTINGS;
	var rights = ZmCalendarPrefsPage.RIGHTS;
	for (var i = 0; i < settings.length; i++) {
		this._setACLValues(settings[i], rights[i]);
	}
	ZmPreferencesPage.prototype._createControls.apply(this, arguments);
	for (var i = 0; i < settings.length; i++) {
		var textarea = this.getFormObject(ZmCalendarPrefsPage.TEXTAREA[settings[i]]);
		if (textarea) {
			this._acList.handle(textarea.getInputElement());
			this._checkPermTextarea(settings[i]);
		}
	}
};

// Sets values for calendar ACL-related settings.
ZmCalendarPrefsPage.prototype._setACLValues =
function(setting, right) {
	var gt = this._acl.getGranteeType(right);
	this._currentSelection[setting] = gt;

	appCtxt.set(setting, gt);
	var list = this._acl.getGrantees(right);
	appCtxt.set(ZmCalendarPrefsPage.TEXTAREA[setting], list.join("\n"));

	this._acl.getGranteeType(right);
};

/**
 * ZmPrefView.getChangedPrefs() doesn't quite work for performing a dirty check on this page since
 * it only returns true if a changed setting is stored in LDAP (has a 'name' property in its ZmSetting
 * object). This override checks the ACL-related settings to see if they changed.
 */
ZmCalendarPrefsPage.prototype.isDirty =
function(section, list, errors) {
	var dirty = this._controller.getPrefsView()._checkSection(section, this, true, true, list, errors);
	if (!dirty && this._isAclSupported) {
		this._findACLChanges();
		dirty = (this._grants.length || this._revokes.length);
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
	if (this._isAclSupported) {
		this._findACLChanges();
	}
	if (callback) {
		callback.run();
	}
};

ZmCalendarPrefsPage.prototype._findACLChanges =
function() {
	var settings = ZmCalendarPrefsPage.SETTINGS;
	var rights = ZmCalendarPrefsPage.RIGHTS;
	this._grants = [];
	this._revokes = [];
	for (var i = 0; i < settings.length; i++) {
		var result = this._getACLChanges(settings[i], rights[i]);
		this._grants = this._grants.concat(result.grants);
		this._revokes = this._revokes.concat(result.revokes);
	}
};

ZmCalendarPrefsPage.prototype._getACLChanges =
function(setting, right) {

	var curType = appCtxt.get(setting);
	var curUsers = (curType == ZmSetting.ACL_USER) ? this._acl.getGrantees(right) : [];
	var curUsersInfo = (curType == ZmSetting.ACL_USER) ? this._acl.getGranteesInfo(right) : [];
	var zidHash = {};
	for (var i = 0; i < curUsersInfo.length; i++) {
		zidHash[curUsersInfo[i].grantee] = curUsersInfo[i].zid;
	}
	var curHash = AjxUtil.arrayAsHash(curUsers);

	var radioGroup = this.getFormObject(setting);
		var newType = radioGroup.getValue();
	var radioGroupChanged = (newType != this._currentSelection[setting]);

	var newUsers = [];
	if (newType == ZmSetting.ACL_USER) {
		var textarea = this.getFormObject(ZmCalendarPrefsPage.TEXTAREA[setting]);
		var val = textarea.getValue();
		var users = val.split(/[\n,;]/);
		for (var i = 0; i < users.length; i++) {
			var user = AjxStringUtil.trim(users[i]);
			if (!user) { continue; }
			if (zidHash[user] != user) {
				user = (user.indexOf('@') == -1) ? [user, appCtxt.getUserDomain()].join('@') : user;
			}
			newUsers.push(user);
		}
		newUsers.sort();
	}
	var newHash = AjxUtil.arrayAsHash(newUsers);

	var contacts = AjxDispatcher.run("GetContacts");
	var grants = [];
	var revokes = [];
	if (newUsers.length > 0) {
		for (var i = 0; i < newUsers.length; i++) {
			var user = newUsers[i];
			if (!curHash[user]) {
				var contact = contacts.getContactByEmail(user);
				var gt = (contact && contact.isGroup()) ? ZmSetting.ACL_GROUP : ZmSetting.ACL_USER;
				var ace = new ZmAccessControlEntry({grantee:user, granteeType:gt, right:right});
				grants.push(ace);
			}
		}
	}
	if (curUsers.length > 0) {
		for (var i = 0; i < curUsers.length; i++) {
			var user = curUsers[i];
			var zid = (curUsersInfo[i]) ? curUsersInfo[i].zid : null;
			if (!newHash[user]) {
				var contact = contacts.getContactByEmail(user);
				var gt = (contact && contact.isGroup()) ? ZmSetting.ACL_GROUP : ZmSetting.ACL_USER;
				var ace = new ZmAccessControlEntry({grantee: (user!=zid) ? user : null, granteeType:gt, right:right, zid: zid});
				revokes.push(ace);
			}
		}
	}

	var userAdded = (grants.length > 0);
	var userRemoved = (revokes.length > 0);

	var denyAll = (radioGroupChanged && (newType == ZmSetting.ACL_NONE));

	if ((newType == ZmSetting.ACL_USER) && (userAdded || userRemoved || radioGroupChanged)) {
		revokes = revokes.concat(this._acl.getACLByGranteeType(right, ZmSetting.ACL_AUTH));
		revokes = revokes.concat(this._acl.getACLByGranteeType(right, ZmSetting.ACL_PUBLIC));
		
		if (newUsers.length == 0) {
			denyAll = true;
		}
	}

	// deny all
	if (denyAll) {
		revokes = [];
		grants = [];

		revokes = revokes.concat(this._acl.getACLByGranteeType(right, ZmSetting.ACL_USER));
		revokes = revokes.concat(this._acl.getACLByGranteeType(right, ZmSetting.ACL_GROUP));
		revokes = revokes.concat(this._acl.getACLByGranteeType(right, ZmSetting.ACL_PUBLIC));

		//deny all
		var ace = new ZmAccessControlEntry({granteeType: ZmSetting.ACL_AUTH, right:right, negative: true});
		grants.push(ace);
	}

	//allow all users
	if (radioGroupChanged && (newType == ZmSetting.ACL_PUBLIC)) {
		grants = [];
		revokes = [];

		//grant all
		var ace = new ZmAccessControlEntry({granteeType: ZmSetting.ACL_PUBLIC, right:right});
		grants.push(ace);

		//revoke all other aces
		revokes = this._acl.getACLByGranteeType(right, ZmSetting.ACL_USER);
		revokes = revokes.concat(this._acl.getACLByGranteeType(right, ZmSetting.ACL_GROUP));
		revokes = revokes.concat(this._acl.getACLByGranteeType(right, ZmSetting.ACL_AUTH));
	}

	if (radioGroupChanged && (newType == ZmSetting.ACL_AUTH)) {
		grants = [];
		revokes = [];

		//grant all
		var ace = new ZmAccessControlEntry({granteeType: ZmSetting.ACL_AUTH, right:right});
		grants.push(ace);

		//revoke all other aces
		revokes = this._acl.getACLByGranteeType(right, ZmSetting.ACL_USER);
		revokes = revokes.concat(this._acl.getACLByGranteeType(right, ZmSetting.ACL_GROUP));
		revokes = revokes.concat(this._acl.getACLByGranteeType(right, ZmSetting.ACL_PUBLIC));
	}

	return {grants:grants, revokes:revokes};
};

ZmCalendarPrefsPage.prototype.addCommand =
function(batchCmd) {
	if (!this._isAclSupported) { return; }

	var respCallback = new AjxCallback(this, this._handleResponseACLChange);
	if (this._revokes.length) {
		this._acl.revoke(this._revokes, respCallback, batchCmd);
	}
	if (this._grants.length) {
		this._acl.grant(this._grants, respCallback, batchCmd);
	}
};

ZmCalendarPrefsPage.prototype._handleResponseACLChange =
function(aces) {
	if (aces && !(aces instanceof Array)) { aces = [aces]; }

	if (aces && aces.length) {
		for (var i = 0; i < aces.length; i++) {
			var ace = aces[i];
			var setting = (ace.right == ZmSetting.RIGHT_INVITE) ? ZmSetting.CAL_INVITE_ACL : ZmSetting.CAL_FREE_BUSY_ACL;
			this._setACLValues(setting, ace.right);
		}
	}
};

ZmCalendarPrefsPage.prototype._initAutocomplete =
function() {
	if (appCtxt.get(ZmSetting.CONTACTS_ENABLED) && appCtxt.get(ZmSetting.GAL_AUTOCOMPLETE_ENABLED)) {
		var contactsClass = appCtxt.getApp(ZmApp.CONTACTS);
		var contactsLoader = contactsClass.getContactList;
		var params = {
			dataClass:appCtxt.getAutocompleter(),
			separator:"",
			matchValue:ZmAutocomplete.AC_VALUE_EMAIL,
			options:{galOnly:true}
		};
		this._acList = new ZmAutocompleteListView(params);
	}
};
