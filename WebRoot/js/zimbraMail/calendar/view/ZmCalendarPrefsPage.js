/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016 Synacor, Inc.
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
 * All portions of the code are Copyright (C) 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016 Synacor, Inc. All Rights Reserved.
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

ZmCalendarPrefsPage.prototype.isZmCalendarPrefsPage = true;
ZmCalendarPrefsPage.prototype.toString = function() { return "ZmCalendarPrefsPage"; };

ZmCalendarPrefsPage.prototype.reset =
function(useDefaults) {
	ZmPreferencesPage.prototype.reset.apply(this, arguments);
	var settings = ZmCalendarPrefsPage.SETTINGS;
	for (var i = 0; i < settings.length; i++) {
		this._checkPermTextarea(settings[i]);
    }
    if(this._workHoursControl) {
        this._workHoursControl.reset();
    }
};

ZmCalendarPrefsPage.prototype.showMe =
function() {
	this._acl = appCtxt.getACL();
	if (this._acl && !this._acl._loaded) {
		var respCallback = this._doShowMe.bind(this);
		this._acl.load(respCallback);
	} else {
		this._doShowMe();
	}
};

ZmCalendarPrefsPage.prototype._doShowMe =
function() {
	var settings = ZmCalendarPrefsPage.SETTINGS;
	var rights = ZmCalendarPrefsPage.RIGHTS;
	for (var i = 0; i < settings.length; i++) {
		this._setACLValues(settings[i], rights[i]);
	}

	var active = appCtxt.getActiveAccount();
	this._isAclSupported = !appCtxt.multiAccounts || appCtxt.isFamilyMbox || (!active.isMain && active.isZimbraAccount);

	ZmPreferencesPage.prototype.showMe.call(this);
};

ZmCalendarPrefsPage.prototype._setupCustom = function (id, setup, value) {
    switch(id) {
        case "CAL_WORKING_HOURS":
            var el = document.getElementById([this._htmlElId, id].join("_"));
            if(el) {
                this._workHoursControl = new ZmWorkHours(this, id, value, "WorkHours");
                this._workHoursControl.reparentHtmlElement(el);
            }
            this.setFormObject(id, this._workHoursControl);
            break;
    }
    
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
	ZmPreferencesPage.prototype._createControls.apply(this, arguments);

	var settings = ZmCalendarPrefsPage.SETTINGS;

	for (var i = 0; i < settings.length; i++) {
		var textarea = this.getFormObject(ZmCalendarPrefsPage.TEXTAREA[settings[i]]);
		if (textarea && this._acList) {
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
	var textDisplay = list.join("\n");
	appCtxt.set(ZmCalendarPrefsPage.TEXTAREA[setting], textDisplay);

	this._acl.getGranteeType(right);
	// Set up the preference initial value (derived from ACL data) so that the
	// pref is not incorrectly detected as dirty in the _checkSection call.
	var pref = appCtxt.getSettings().getSetting(setting);
	pref.origValue = this._currentSelection[setting];
	pref = appCtxt.getSettings().getSetting(ZmCalendarPrefsPage.TEXTAREA[setting]);
	pref.origValue = textDisplay;
};

/**
 * ZmPrefView.getChangedPrefs() doesn't quite work for performing a dirty check on this page since
 * it only returns true if a changed setting is stored in LDAP (has a 'name' property in its ZmSetting
 * object). This override checks the ACL-related settings to see if they changed.
 */
ZmCalendarPrefsPage.prototype.isDirty =
function(section, list, errors) {
	var dirty = this._controller.getPrefsView()._checkSection(section, this, true, true, list, errors);
    if(!dirty && this._workHoursControl) {
        dirty = this._workHoursControl.isDirty();
    }
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

ZmCalendarPrefsPage.prototype.getPostSaveCallback =
function() {
	return new AjxCallback(this, this._postSave);
};

ZmCalendarPrefsPage.prototype._postSave =
function(callback) {
    var settings = appCtxt.getSettings();
    var workHoursSetting = settings.getSetting(ZmSetting.CAL_WORKING_HOURS);
    workHoursSetting._notify(ZmEvent.E_MODIFY);
	if (this._workHoursControl) {
		this._workHoursControl.reloadWorkHours(this._workHoursControl.getValue());
	}

    /**
     * Post save, restore the value of pref zimbraPrefCalendarApptReminderWarningTimevalue
     * for 'never' and 'at time of event'. In function ZmCalendarApp.setDefaultReminderTimePrefValueOnSave,
     * if the user has chosen 'never' or 'at time of event' option in default reminder select option,
     * then on save we make value of never to 0 and 'at time of event' to -1, we are undoing that change here.
     **/

    var defaultWarningTime = settings.getSetting(ZmSetting.CAL_REMINDER_WARNING_TIME).getValue();
    if (defaultWarningTime === -1 || defaultWarningTime === 0) { // never or 'at time of event' was chosen in defaultreminderpref dropdown
        defaultWarningTime === -1 ? (defaultWarningTime = 0) : (defaultWarningTime = -1);
        settings.getSetting(ZmSetting.CAL_REMINDER_WARNING_TIME).setValue(defaultWarningTime);
        appCtxt.getSettings().getSetting('CAL_REMINDER_WARNING_TIME').origValue = defaultWarningTime;
    }
    if (callback instanceof AjxCallback) {
		callback.run();
	}
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
        revokes = revokes.concat(this._acl.getACLByGranteeType(right, ZmSetting.ACL_DOMAIN));
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

        revokes = revokes.concat(this._acl.getACLByGranteeType(right, ZmSetting.ACL_DOMAIN));
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
        revokes = revokes.concat(this._acl.getACLByGranteeType(right, ZmSetting.ACL_DOMAIN));
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
        revokes = revokes.concat(this._acl.getACLByGranteeType(right, ZmSetting.ACL_DOMAIN));
		revokes = revokes.concat(this._acl.getACLByGranteeType(right, ZmSetting.ACL_GROUP));
		revokes = revokes.concat(this._acl.getACLByGranteeType(right, ZmSetting.ACL_PUBLIC));
	}

    if (radioGroupChanged && (newType == ZmSetting.ACL_DOMAIN)) {
		grants = [];
		revokes = [];

		//grant all
		var ace = new ZmAccessControlEntry({granteeType: ZmSetting.ACL_DOMAIN, right:right, grantee:appCtxt.getUserDomain()});
		grants.push(ace);

		//revoke all other aces
		revokes = this._acl.getACLByGranteeType(right, ZmSetting.ACL_USER);
        revokes = revokes.concat(this._acl.getACLByGranteeType(right, ZmSetting.ACL_GROUP));
		revokes = revokes.concat(this._acl.getACLByGranteeType(right, ZmSetting.ACL_AUTH));
		revokes = revokes.concat(this._acl.getACLByGranteeType(right, ZmSetting.ACL_PUBLIC));
	}

	return {grants:grants, revokes:revokes};
};

ZmCalendarPrefsPage.prototype.addCommand =
function(batchCmd) {
    if (this._isAclSupported) {
        var respCallback = new AjxCallback(this, this._handleResponseACLChange);
        if (this._revokes.length) {
            this._acl.revoke(this._revokes, respCallback, batchCmd);
        }
        if (this._grants.length) {
            this._acl.grant(this._grants, respCallback, batchCmd);
        }
    }

	var workHoursControl = this._workHoursControl;
    if(workHoursControl) {
        if(workHoursControl.isValid() && workHoursControl.isDirty()) {
            var value = this._workHoursControl.getValue(),
                    soapDoc = AjxSoapDoc.create("ModifyPrefsRequest", "urn:zimbraAccount"),
                    node = soapDoc.set("pref", value),
                    respCallback = new AjxCallback(this, this._postSaveBatchCmd, [value]);
            node.setAttribute("name", "zimbraPrefCalendarWorkingHours");
            batchCmd.addNewRequestParams(soapDoc, respCallback);
        }
        if (!workHoursControl.isValid()) {
            throw new AjxException(ZmMsg.calendarWorkHoursInvalid);
        }
    }
};

ZmCalendarPrefsPage.prototype._postSaveBatchCmd =
function(value) {
    appCtxt.set(ZmSetting.CAL_WORKING_HOURS, value);
    var firstDayOfWeek = appCtxt.get(ZmSetting.CAL_FIRST_DAY_OF_WEEK) || 0;

    if(this._workHoursControl) {
        // Check if either work days have changed or first day of week has changed.
        // Need to reload the browser either way to show the correct changes.
        if(this._workHoursControl.getDaysChanged() ||
                parseInt(this._workHoursControl._workDaysCheckBox[0].getValue()) != firstDayOfWeek) {
            this._workHoursControl.setDaysChanged(false);
            var cd = appCtxt.getYesNoMsgDialog();
            cd.reset();
            cd.registerCallback(DwtDialog.YES_BUTTON, this._newWorkHoursYesCallback, this, [skin, cd]);
            cd.setMessage(ZmMsg.workingDaysRestart, DwtMessageDialog.WARNING_STYLE);
            cd.popup();
        }
    }
};

ZmCalendarPrefsPage.prototype._newWorkHoursYesCallback =
function(skin, dialog) {
	dialog.popdown();
	window.onbeforeunload = null;
	var url = AjxUtil.formatUrl();
	DBG.println(AjxDebug.DBG1, "Working days change, redirect to: " + url);
	ZmZimbraMail.sendRedirect(url); // redirect to self to force reload
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
			dataClass:	appCtxt.getAutocompleter(),
			separator:	";",
			matchValue:	ZmAutocomplete.AC_VALUE_EMAIL,
			options:	{galOnly:true},
			contextId:	this.toString()
		};
		this._acList = new ZmAutocompleteListView(params);
	}
};

/**
 * Creates the WorkHours custom control
 * 
 * @constructor
 * @param parent
 * @param id
 * @param value work hours string
 * @param templateId
 */
ZmWorkHours = function(parent, id, value, templateId) {
	DwtComposite.call(this, {parent:parent, id: Dwt.getNextId(id)});


    this._workDaysCheckBox = [];
    this._startTimeSelect = null;
    this._endTimeSelect = null;
    this._customDlg = null;
    this._customBtn = null;
    this.reloadWorkHours(value);
    this._radioNormal = null;
    this._radioCustom = null;
    this._daysChanged = false;
    this._setContent(templateId);
};

ZmWorkHours.STR_DAY_SEP = ",";
ZmWorkHours.STR_TIME_SEP = ":";

ZmWorkHours.prototype = new DwtComposite;
ZmWorkHours.prototype.constructor = ZmWorkHours;

ZmWorkHours.prototype.toString =
function() {
	return "ZmWorkHours";
};

ZmWorkHours.prototype.getTabGroup = ZmWorkHours.prototype.getTabGroupMember;

ZmWorkHours.prototype.reloadWorkHours =
function(value) {
    value = value || appCtxt.get(ZmSetting.CAL_WORKING_HOURS);
    var workHours = this._workHours = this.decodeWorkingHours(value),
        dayIdx = new Date().getDay();
    this._startTime = new Date();
    this._endTime = new Date();
    this._startTime.setHours(workHours[dayIdx].startTime/100, workHours[dayIdx].startTime%100, 0);
    this._endTime.setHours(workHours[dayIdx].endTime/100, workHours[dayIdx].endTime%100, 0);
    this._isCustom = this._isCustomTimeSet();
    if(this._customDlg) {
        this._customDlg.reloadWorkHours(workHours);
    }
};

ZmWorkHours.prototype.reset =
function() {
    if (!this.isDirty()) { return; }
    var i,
        workHours = this._workHours;

    this._startTimeSelect.set(this._startTime);
    this._endTimeSelect.set(this._endTime);

    for (i=0;i<AjxDateUtil.WEEKDAY_MEDIUM.length; i++) {
        this._workDaysCheckBox[i].setSelected(workHours[i].isWorkingDay);
    }

	this._radioGroup.setSelectedId(this._isCustom ? this._radioCustomId : this._radioNormalId);

    // Reset the custom work hours dialog as well
    if (this._customDlg) {
        this._customDlg.reset();
    }
};

ZmWorkHours.prototype.isDirty =
function() {
	var i,
        isDirty = false,
        workHours = this._workHours,
        tf = new AjxDateFormat("HHmm"),
        startInputTime = tf.format(this._startTimeSelect.getValue()),
        endInputTime = tf.format(this._endTimeSelect.getValue()),
        isCustom = this._radioCustom.isSelected();


    if(!isCustom) {
        for (i=0;i<AjxDateUtil.WEEKDAY_MEDIUM.length; i++) {
            if(this._workDaysCheckBox[i].isSelected() != workHours[i].isWorkingDay) {
                this.setDaysChanged(true);
                isDirty = true;
                break;
            }
        }

        if(startInputTime != workHours[0].startTime || endInputTime != workHours[0].endTime) {
            isDirty = true;
        }
    }
    else if(this._customDlg) {
        isDirty = this._customDlg.isDirty();
    }

    if (!isCustom && this._isCustom) { //switching to normal should trigger dirty anyway.
        isDirty = true;
    }

	return isDirty;
};

ZmWorkHours.prototype.setDaysChanged =
function(value) {
    var isCustom = this._radioCustom.isSelected();
    if(isCustom && this._customDlg) {
        this._customDlg.setDaysChanged(value);
    }
    else {
        this._daysChanged = value;
    }
};

ZmWorkHours.prototype.getDaysChanged =
function() {
    var isCustom = this._radioCustom.isSelected();
    if(isCustom && this._customDlg) {
        return this._customDlg.getDaysChanged();
    }
    else {
        return this._daysChanged;
    }
};

ZmWorkHours.prototype.isValid =
function() {
    var tf = new AjxDateFormat("HHmm"),
        startInputTime = tf.format(this._startTimeSelect.getValue()),
        endInputTime = tf.format(this._endTimeSelect.getValue());
    if(this._radioCustom.isSelected() && this._customDlg) {
        return this._customDlg.isValid();        
    }
    return startInputTime < endInputTime ? true : false;
};

ZmWorkHours.prototype.decodeWorkingHours =
function(wHrsString) {
    if(wHrsString === 0) {
        return [];
    }
	var wHrsPerDay = wHrsString.split(ZmWorkHours.STR_DAY_SEP),
        i,
        wHrs = [],
        wDay,
        w,
        idx;

    for(i=0; i<wHrsPerDay.length; i++) {
        wDay = wHrsPerDay[i].split(ZmWorkHours.STR_TIME_SEP);
        w = {};
		w.dayOfWeek = wDay[0] - 1;
		w.isWorkingDay = (wDay[1] === "Y");
        w.startTime = wDay[2];
        w.endTime = wDay[3];

		wHrs[i] = w;
    }
    return wHrs;
};

ZmWorkHours.prototype.encodeWorkingHours =
function() {
    var i,
        tf = new AjxDateFormat("HHmm"),
        startInputTime = tf.format(this._startTimeSelect.getValue()),
        endInputTime = tf.format(this._endTimeSelect.getValue()),
        dayStr,
        wDaysStr = [];

    for (i=0;i<AjxDateUtil.WEEKDAY_MEDIUM.length; i++) {
        dayStr = [];
		dayStr.push(parseInt(this._workDaysCheckBox[i].getValue()) + 1);
		if(this._workDaysCheckBox[i].isSelected()) {
            dayStr.push("Y");
        }
        else {
            dayStr.push("N");
        }
        dayStr.push(startInputTime);
        dayStr.push(endInputTime);
        wDaysStr.push(dayStr.join(ZmWorkHours.STR_TIME_SEP));
    }
    return wDaysStr.join(ZmWorkHours.STR_DAY_SEP);
};

ZmWorkHours.prototype._isCustomTimeSet =
function() {
    var i,
        w = this._workHours;
    for (i=1;i<AjxDateUtil.WEEKDAY_MEDIUM.length; i++) {
        if(w[i].startTime != w[i-1].startTime || w[i].endTime != w[i-1].endTime) {
            return true;
        }
    }
    return false;
};

ZmWorkHours.prototype._closeCustomDialog =
function(value) {
    this._customDlg.popdown();
};

ZmWorkHours.prototype._closeCancelCustomDialog = function(value) {
    if (this._customDlg.isDirty()) {
        this._customDlg.reset();
    }
    this._customDlg.popdown();
};

ZmWorkHours.prototype._openCustomizeDlg =
function() {
    if(!this._customDlg) {
        this._customDlg = new ZmCustomWorkHoursDlg(appCtxt.getShell(), "CustomWorkHoursDlg", this._workHours);
        this._customDlg.initialize(this._workHours);
        this._customDlg.setButtonListener(DwtDialog.OK_BUTTON, new AjxListener(this, this._closeCustomDialog, [true]));
        this._customDlg.setButtonListener(DwtDialog.CANCEL_BUTTON, new AjxListener(this, this._closeCancelCustomDialog, [false]));
    }
    this._customDlg.popup();
};

ZmWorkHours.prototype.getValue =
function() {
    if(this._radioCustom.isSelected()) { 
        if(this._customDlg) {
            return this._customDlg.getValue();
        }
        else {
            this._radioNormal.setSelected(true);
            this._radioCustom.setSelected(false);
            this._toggleNormalCustom();
        }
    }
    return this.encodeWorkingHours();
};

ZmWorkHours.prototype._toggleNormalCustom =
function() {
    var i;
    if(this._radioNormal.isSelected()) {
        this._startTimeSelect.setEnabled(true);
        this._endTimeSelect.setEnabled(true);
        for (i=0;i<AjxDateUtil.WEEKDAY_MEDIUM.length; i++) {
            this._workDaysCheckBox[i].setEnabled(true);
        }
        this._customBtn.setEnabled(false);
    }
    else {
        for (i=0;i<AjxDateUtil.WEEKDAY_MEDIUM.length; i++) {
            this._workDaysCheckBox[i].setEnabled(false);
        }
        this._startTimeSelect.setEnabled(false);
        this._endTimeSelect.setEnabled(false);
        this._customBtn.setEnabled(true);
    }
};

ZmWorkHours.prototype._setContent =
function(templateId) {
	var i,
        el,
        checkbox,
        customBtn,
        workHours = this._workHours,
        startTimeSelect,
        endTimeSelect,
        radioNormal,
        radioCustom,
        radioGroup,
        selectedRadioId,
        radioIds = {},
        radioName = this._htmlElId + "_normalCustom",
        isCustom = this._isCustom;

    this.getHtmlElement().innerHTML = AjxTemplate.expand("prefs.Pages#"+templateId, {id:this._htmlElId});
    //fill the containers for the work days and work time
    var firstDayOfWeek = appCtxt.get(ZmSetting.CAL_FIRST_DAY_OF_WEEK) || 0;

	// Figure out where in the workHours array the info for firstDayOfWeek is located.
	// The first item in array is associated with the first day of the week that has been set.
	// This determines how the checkboxes will be displayed for work week days. Getting
	// the correct position in the array for first day of week will allow the correct
	// workHours[].isworkingDay value to be set.
	var startingIndex = 0;
	for (i = 0; i < AjxDateUtil.DAYS_PER_WEEK; i++) {
		if (workHours[i].dayOfWeek == firstDayOfWeek) {
			startingIndex = i;
			break;
		}
	}

	for (i = 0; i < AjxDateUtil.DAYS_PER_WEEK; i++) {
		var dayIndex = (i + startingIndex) % AjxDateUtil.DAYS_PER_WEEK;
		var dayOfWeek = (i + firstDayOfWeek) % AjxDateUtil.DAYS_PER_WEEK;

        checkbox = new DwtCheckbox({parent:this, parentElement:(this._htmlElId + "_CAL_WORKING_DAY_" + i)});
		checkbox.setText(AjxDateUtil.WEEKDAY_MEDIUM[dayOfWeek]);
		checkbox.setToolTipContent(AjxDateUtil.WEEKDAY_LONG[dayOfWeek]);
		checkbox.setValue(dayOfWeek);
		checkbox.setSelected(workHours[dayIndex].isWorkingDay);
		checkbox.setEnabled(!isCustom)
        this._workDaysCheckBox.push(checkbox);
    }

    radioNormal = new DwtRadioButton({parent:this, name:radioName, parentElement:(this._htmlElId + "_CAL_WORKING_HOURS_NORMAL")});
    radioNormal.setSelected(!isCustom);
    var radioNormalId = radioNormal.getInputElement().id;
    radioIds[radioNormalId] = radioNormal;
    this._radioNormal = radioNormal;
    this._radioNormalId = radioNormalId;

    el = document.getElementById(this._htmlElId + "_CAL_WORKING_START_TIME");
    startTimeSelect = new DwtTimeInput(this, DwtTimeInput.START, el);
    startTimeSelect.set(this._startTime);
    startTimeSelect.setEnabled(!isCustom);
    this._startTimeSelect = startTimeSelect;

    el = document.getElementById(this._htmlElId + "_CAL_WORKING_END_TIME");
    endTimeSelect = new DwtTimeInput(this, DwtTimeInput.END, el);
    endTimeSelect.set(this._endTime);
    endTimeSelect.setEnabled(!isCustom);
    this._endTimeSelect = endTimeSelect;

    radioCustom = new DwtRadioButton({parent:this, name:radioName, parentElement:(this._htmlElId + "_CAL_WORKING_HOURS_CUSTOM")});
    radioCustom.setSelected(isCustom);
    var radioCustomId = radioCustom.getInputElement().id;
    radioIds[radioCustomId] = radioCustom;
    this._radioCustom = radioCustom;
    this._radioCustomId = radioCustomId;

    radioGroup = new DwtRadioButtonGroup(radioIds, isCustom ? radioCustomId : radioNormalId);

    radioGroup.addSelectionListener(new AjxListener(this, this._toggleNormalCustom));
    this._radioGroup = radioGroup;

    customBtn = new DwtButton({parent:this, parentElement:(this._htmlElId + "_CAL_CUSTOM_WORK_HOURS")});
    customBtn.setText(ZmMsg.calendarCustomBtnTitle);
    customBtn.addSelectionListener(new AjxListener(this, this._openCustomizeDlg));
    customBtn.setEnabled(isCustom);
    this._customBtn = customBtn;
};

/**
 * Create the custom work hours dialog box
 * @param parent
 * @param templateId
 * @param workHours the work hours parsed array
 */
ZmCustomWorkHoursDlg = function (parent, templateId, workHours) {
    DwtDialog.call(this, {parent:parent});
    this._workHours = workHours;
    this._startTimeSelect = [];
    this._endTimeSelect = [];
    this._workDaysCheckBox = [];
    var contentHtml = AjxTemplate.expand("prefs.Pages#"+templateId, {id:this._htmlElId});
    this.setContent(contentHtml);
	this.setTitle(ZmMsg.calendarCustomDlgTitle);
    this._daysChanged = false;
};

ZmCustomWorkHoursDlg.prototype = new DwtDialog;
ZmCustomWorkHoursDlg.prototype.constructor = ZmCustomWorkHoursDlg;

ZmCustomWorkHoursDlg.prototype.initialize = function(workHours) {
    var i,
        el,
        checkbox,
        startTimeSelect,
        endTimeSelect,
        inputTime;

    workHours = workHours || this._workHours;

    for (i=0;i<AjxDateUtil.WEEKDAY_MEDIUM.length; i++) {
        //fill the containers for the work days and work time
        el = document.getElementById(this._htmlElId + "_CAL_WORKING_START_TIME_"+i);
        startTimeSelect = new DwtTimeInput(this, DwtTimeInput.START, el);
        inputTime = new Date();
        inputTime.setHours(workHours[i].startTime/100, workHours[i].startTime%100, 0);
        startTimeSelect.set(inputTime);
        startTimeSelect.setEnabled(workHours[i].isWorkingDay);
        this._startTimeSelect.push(startTimeSelect);


        inputTime = new Date();
        inputTime.setHours(workHours[i].endTime/100, workHours[i].endTime%100, 0);
        el = document.getElementById(this._htmlElId + "_CAL_WORKING_END_TIME_"+i);
        endTimeSelect = new DwtTimeInput(this, DwtTimeInput.END, el);
        endTimeSelect.set(inputTime);
        endTimeSelect.setEnabled(workHours[i].isWorkingDay);
        this._endTimeSelect.push(endTimeSelect);


        checkbox = new DwtCheckbox({parent:this, parentElement:(this._htmlElId + "_CAL_WORKING_DAY_" + i)});
        checkbox.setText(AjxDateUtil.WEEKDAY_MEDIUM[i]);
	    checkbox.setSelected(workHours[i].isWorkingDay);
        checkbox.addSelectionListener(new AjxListener(this, this._setTimeInputEnabled, [i, checkbox]));
        this._workDaysCheckBox.push(checkbox);
    }
};

ZmCustomWorkHoursDlg.prototype.reset =
function() {
    var i,
    inputTime;

    for (i = 0; i < AjxDateUtil.WEEKDAY_MEDIUM.length; i++) {
        inputTime = new Date();
        inputTime.setHours(this._workHours[i].startTime/100, this._workHours[i].startTime%100, 0);
        this._startTimeSelect[i].set(inputTime);
        this._startTimeSelect[i].setEnabled(this._workHours[i].isWorkingDay);

        inputTime = new Date();
        inputTime.setHours(this._workHours[i].endTime/100, this._workHours[i].endTime%100, 0);
        this._endTimeSelect[i].set(inputTime);
        this._endTimeSelect[i].setEnabled(this._workHours[i].isWorkingDay);

        this._workDaysCheckBox[i].setSelected(this._workHours[i].isWorkingDay);
    }
}

ZmCustomWorkHoursDlg.prototype.reloadWorkHours =
function(workHours) {
    workHours = workHours || appCtxt.get(ZmSetting.CAL_WORKING_HOURS);
    this._workHours = workHours;
};

ZmCustomWorkHoursDlg.prototype._setTimeInputEnabled =
function(idx, checkbox) {
    this._startTimeSelect[idx].setEnabled(checkbox.isSelected());
    this._endTimeSelect[idx].setEnabled(checkbox.isSelected());
};

ZmCustomWorkHoursDlg.prototype.isDirty =
function() {
    var i,
        workHours = this._workHours,
        tf = new AjxDateFormat("HHmm"),
        startInputTime,
        endInputTime;

    for (i=0;i<AjxDateUtil.WEEKDAY_MEDIUM.length; i++) {
        if(this._workDaysCheckBox[i].isSelected() != workHours[i].isWorkingDay) {
            this.setDaysChanged(true);
            return true;
        }
    }
    for (i=0;i<AjxDateUtil.WEEKDAY_MEDIUM.length; i++) {
        startInputTime = tf.format(this._startTimeSelect[i].getValue());
        endInputTime = tf.format(this._endTimeSelect[i].getValue());
        
        if(startInputTime != workHours[i].startTime
        || endInputTime != workHours[i].endTime
        || this._workDaysCheckBox[i].isSelected() != workHours[i].isWorkingDay) {
            return true;
        }
    }
    return false;
};

ZmCustomWorkHoursDlg.prototype.popup =
function() {
	DwtDialog.prototype.popup.call(this);
};

ZmCustomWorkHoursDlg.prototype.isValid =
function() {
    var i,
        tf = new AjxDateFormat("HHmm"),
        startInputTime,
        endInputTime;

    for (i=0;i<AjxDateUtil.WEEKDAY_MEDIUM.length; i++) {
        if(this._workDaysCheckBox[i].isSelected()) {
            startInputTime = tf.format(this._startTimeSelect[i].getValue());
            endInputTime = tf.format(this._endTimeSelect[i].getValue());

            if(startInputTime > endInputTime) {
                return false;
            }
        }
    }
    return true;

};

ZmCustomWorkHoursDlg.prototype.getValue =
function() {
    var i,
        tf = new AjxDateFormat("HHmm"),
        startInputTime,
        endInputTime,
        dayStr,
        wDaysStr = [];

    for (i=0;i<AjxDateUtil.WEEKDAY_MEDIUM.length; i++) {
        startInputTime = tf.format(this._startTimeSelect[i].getValue());
        endInputTime = tf.format(this._endTimeSelect[i].getValue());
        dayStr = [];
        dayStr.push(i+1);
        if(this._workDaysCheckBox[i].isSelected()) {
            dayStr.push("Y");
        }
        else {
            dayStr.push("N");
        }
        dayStr.push(startInputTime);
        dayStr.push(endInputTime);
        wDaysStr.push(dayStr.join(ZmWorkHours.STR_TIME_SEP));
    }
    return wDaysStr.join(ZmWorkHours.STR_DAY_SEP);
};

ZmCustomWorkHoursDlg.prototype.setDaysChanged =
function(value) {
    this._daysChanged = value;
};

ZmCustomWorkHoursDlg.prototype.getDaysChanged =
function() {
    return this._daysChanged;
};


