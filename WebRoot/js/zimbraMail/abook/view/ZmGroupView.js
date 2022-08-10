/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016 Synacor, Inc.
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
 * All portions of the code are Copyright (C) 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016 Synacor, Inc. All Rights Reserved.
 * ***** END LICENSE BLOCK *****
 */

/**
 * @overview
 * This file contains the contact group view classes.
 */

/**
 * Creates the group view.
 * @class
 * This class represents the contact group view.
 * 
 * @param	{DwtComposite}	parent		the parent
 * @param	{ZmContactController}		controller		the controller
 *
 * @constructor
 * 
 * @extends		DwtComposite
 */
ZmGroupView = function(parent, controller) {
	if (arguments.length == 0) return;
	DwtComposite.call(this, {parent:parent, className:"ZmContactView", posStyle:DwtControl.ABSOLUTE_STYLE});
	this.setScrollStyle(Dwt.CLIP); //default is clip, for regular group it's fine. (otherwise there's always a scroll for no reason, not sure why). For DL we change in "set"

	this._controller = controller;

	this._view = ZmId.VIEW_GROUP;

	this._tagList = appCtxt.getTagTree();
	this._tagList.addChangeListener(new AjxListener(this, this._tagChangeListener));

	this._changeListener = new AjxListener(this, this._groupChangeListener);
	this._detailedSearch = appCtxt.get(ZmSetting.DETAILED_CONTACT_SEARCH_ENABLED);

	/* following few are used in ZmContactPicker methods we delegate to from here */
	this._ascending = true; 
	this._emailList = new AjxVector();
	this._includeContactsWithNoEmail = true;

	this._groupMemberMods = {};
	this._tabGroup = new DwtTabGroup(this._htmlElId);
	
};

ZmGroupView.prototype = new DwtComposite;
ZmGroupView.prototype.constructor = ZmGroupView;
ZmGroupView.prototype.isZmGroupView = true;


/**
 * Returns a string representation of the object.
 * 
 * @return		{String}		a string representation of the object
 */
ZmGroupView.prototype.toString =
function() {
	return "ZmGroupView";
};

ZmGroupView.DIALOG_X = 50;
ZmGroupView.DIALOG_Y = 100;

ZmGroupView.MAIL_POLICY_ANYONE = "ANYONE";
ZmGroupView.MAIL_POLICY_MEMBERS = "MEMBERS";
ZmGroupView.MAIL_POLICY_INTERNAL = "INTERNAL";
ZmGroupView.MAIL_POLICY_SPECIFIC = "SPECIFIC";

ZmGroupView.GRANTEE_TYPE_USER = "usr";
ZmGroupView.GRANTEE_TYPE_GUEST = "gst"; // an external user. This is returned by GetDistributionListResponse for a non-internal user. Could be a mix of this and "usr"
ZmGroupView.GRANTEE_TYPE_EMAIL = "email"; //this covers both guest and user when setting rights via the setRights op of DistributionListActionRequest
ZmGroupView.GRANTEE_TYPE_GROUP = "grp";
ZmGroupView.GRANTEE_TYPE_ALL = "all";
ZmGroupView.GRANTEE_TYPE_PUBLIC = "pub";

ZmGroupView.GRANTEE_TYPE_TO_MAIL_POLICY_MAP = [];
ZmGroupView.GRANTEE_TYPE_TO_MAIL_POLICY_MAP[ZmGroupView.GRANTEE_TYPE_USER] = ZmGroupView.MAIL_POLICY_SPECIFIC;
ZmGroupView.GRANTEE_TYPE_TO_MAIL_POLICY_MAP[ZmGroupView.GRANTEE_TYPE_GUEST] = ZmGroupView.MAIL_POLICY_SPECIFIC;
ZmGroupView.GRANTEE_TYPE_TO_MAIL_POLICY_MAP[ZmGroupView.GRANTEE_TYPE_GROUP] = ZmGroupView.MAIL_POLICY_MEMBERS;
ZmGroupView.GRANTEE_TYPE_TO_MAIL_POLICY_MAP[ZmGroupView.GRANTEE_TYPE_ALL] = ZmGroupView.MAIL_POLICY_INTERNAL;
ZmGroupView.GRANTEE_TYPE_TO_MAIL_POLICY_MAP[ZmGroupView.GRANTEE_TYPE_PUBLIC] = ZmGroupView.MAIL_POLICY_ANYONE;

//
// Public methods
//

// need this since contact view now derives from list controller
ZmGroupView.prototype.getList = function() { return null; }

/**
 * Gets the contact.
 * 
 * @return	{ZmContact}	the contact
 */
ZmGroupView.prototype.getContact =
function() {
	return this._contact;
};

/**
 * Gets the controller.
 * 
 * @return	{ZmContactController}	the controller
 */
ZmGroupView.prototype.getController =
function() {
	return this._controller;
};

// Following two overrides are a hack to allow this view to pretend it's a list view
ZmGroupView.prototype.getSelection = function() {
	return this.getContact();
};

ZmGroupView.prototype.getSelectionCount = function() {
	return 1;
};

ZmGroupView.prototype.isDistributionList =
function() {
	return this._contact.isDistributionList();
};

ZmGroupView.prototype.set =
function(contact, isDirty) {
	this._attr = {};

	if (this._contact) {
		this._contact.removeChangeListener(this._changeListener);
	}
	contact.addChangeListener(this._changeListener);
	this._contact = this._item = contact;

	if (!this._htmlInitialized) {
		this._createHtml();
		this._addWidgets();
		this._installKeyHandlers();
		this._tabGroup.addMember(this._getTabGroupMembers());
	}
	
	this._setFields();
	this._emailListOffset = 0;
	this._isDirty = isDirty;

	if (contact.isDistributionList()) {
		if (this._usernameEditable) {
			this._groupNameInput.addListener(DwtEvent.ONBLUR, this._controller.updateTabTitle.bind(this._controller));
		}
		if (this._domainEditable) {
			document.getElementById(this._groupNameDomainId).onblur = this._controller.updateTabTitle.bind(this._controller);
		}
	}
	else {
		this._groupNameInput.addListener(DwtEvent.ONBLUR, this._controller.updateTabTitle.bind(this._controller));
	}

	this.search(null, null, true);
};

/**
 * this is called from ZmContactController.prototype._postShowCallback
 */
ZmGroupView.prototype.postShow =
function() {
	if (this._contact.isDistributionList()) {
		this._dlMembersTabView.showMe(); //have to call it now so it's sized correctly.
	}
};

ZmGroupView.prototype.getModifiedAttrs =
function() {
	if (!this.isDirty()) return null;

	var mods = this._attr = [];

	// get field values
	var groupName = this._getGroupName();
	var folderId = this._getFolderId();

	if (this.isDistributionList()) {
		var dlInfo = this._contact.dlInfo;
		if (groupName != this._contact.getEmail()) {
			mods[ZmContact.F_email] = groupName;
		}
		if (dlInfo.displayName != this._getDlDisplayName()) {
			mods[ZmContact.F_dlDisplayName] = this._getDlDisplayName();
		}
		if (dlInfo.description != this._getDlDesc()) {
			mods[ZmContact.F_dlDesc] = this._getDlDesc();
		}
		if (dlInfo.hideInGal != this._getDlHideInGal()) {
			mods[ZmContact.F_dlHideInGal] = this._getDlHideInGal() ? "TRUE" : "FALSE";
		}
		if (dlInfo.notes != this._getDlNotes()) {
			mods[ZmContact.F_dlNotes] = this._getDlNotes();
		}
		if (dlInfo.subscriptionPolicy != this._getDlSubscriptionPolicy()) {
			mods[ZmContact.F_dlSubscriptionPolicy] = this._getDlSubscriptionPolicy();
		}
		if (dlInfo.unsubscriptionPolicy != this._getDlUnsubscriptionPolicy()) {
			mods[ZmContact.F_dlUnsubscriptionPolicy] = this._getDlUnsubscriptionPolicy();
		}
		if (!AjxUtil.arrayCompare(dlInfo.owners, this._getDlOwners())) {
			mods[ZmContact.F_dlListOwners] = this._getDlOwners();
		}
		if (dlInfo.mailPolicy != this._getDlMailPolicy()
				|| (this._getDlMailPolicy() == ZmGroupView.MAIL_POLICY_SPECIFIC
					&& !AjxUtil.arrayCompare(dlInfo.mailPolicySpecificMailers, this._getDlSpecificMailers()))) {
			mods[ZmContact.F_dlMailPolicy] = this._getDlMailPolicy();
			mods[ZmContact.F_dlMailPolicySpecificMailers] = this._getDlSpecificMailers();
		}

		if (this._groupMemberMods) {
			mods[ZmContact.F_groups] = this._getModifiedMembers();
			this._groupMemberMods = {}; //empty the mods
		}

		return mods;
	}

	// creating new contact (possibly some fields - but not ID - prepopulated)
	if (this._contact.id == null || (this._contact.isGal && !this.isDistributionList())) {
		mods[ZmContact.F_folderId] = folderId;
		mods[ZmContact.F_fileAs] = ZmContact.computeCustomFileAs(groupName);
		mods[ZmContact.F_nickname] = groupName;
		mods[ZmContact.F_groups] = this._getGroupMembers();
		mods[ZmContact.F_type] = "group";
	}
	else {
		// modifying existing contact
		if (!this.isDistributionList() && this._contact.getFileAs() != groupName) {
			mods[ZmContact.F_fileAs] = ZmContact.computeCustomFileAs(groupName);
			mods[ZmContact.F_nickname] = groupName;
		}

		if (this._groupMemberMods) {
			mods[ZmContact.F_groups] = this._getModifiedMembers();
			this._groupMemberMods = {}; //empty the mods
		} 
		
		var oldFolderId = this._contact.addrbook ? this._contact.addrbook.id : ZmFolder.ID_CONTACTS;
		if (folderId != oldFolderId) {
			mods[ZmContact.F_folderId] = folderId;
		}
	}

	return mods;
};

ZmGroupView.prototype._getModifiedMembers =
function() {
	var modifiedMembers = [];
	for (var id in this._groupMemberMods) {
		if (this._groupMemberMods[id].op) {
			modifiedMembers.push(this._groupMemberMods[id]);
		}
	}
	return modifiedMembers;
};


ZmGroupView.prototype._getFullName =
function() {
	return this._getGroupName();
};

ZmGroupView.prototype._getGroupDomainName =
function() {
	if (this.isDistributionList()) {
		return this._domainEditable
			? AjxStringUtil.trim(document.getElementById(this._groupNameDomainId).value)
			: this._emailDomain;
	}
	return AjxStringUtil.trim(document.getElementById(this._groupNameDomainId).value);
};

ZmGroupView.prototype._getGroupName =
function() {
	if (this.isDistributionList()) {
		var username = this._getDlAddressLocalPart();
		return username + "@" + this._getGroupDomainName();
	}
	return AjxStringUtil.trim(this._groupNameInput.getValue());
};

ZmGroupView.prototype._getDlAddressLocalPart =
function() {
	return this._usernameEditable ? AjxStringUtil.trim(this._groupNameInput.getValue()) : this._emailUsername;
};

ZmGroupView.prototype._getDlDisplayName =
function() {
	return AjxStringUtil.trim(document.getElementById(this._dlDisplayNameId).value);
};

ZmGroupView.prototype._getDlDesc =
function() {
	return AjxStringUtil.trim(document.getElementById(this._dlDescId).value);
};

ZmGroupView.prototype._getDlNotes =
function() {
	return AjxStringUtil.trim(document.getElementById(this._dlNotesId).value);
};

ZmGroupView.prototype._getDlHideInGal =
function() {
	return document.getElementById(this._dlHideInGalId).checked;
};

ZmGroupView.prototype._getDlSpecificMailers =
function() {
	return this._getUserList(this._dlListSpecificMailersId);
};

ZmGroupView.prototype._getDlOwners =
function() {
	return this._getUserList(this._dlListOwnersId);
};

ZmGroupView.prototype._getUserList =
function(fldId) {
	var users = AjxStringUtil.trim(document.getElementById(fldId).value).split(";");
	var retUsers = [];
	for (var i = 0; i < users.length; i++) {
		var user = AjxStringUtil.trim(users[i]);
		if (user != "") {
			retUsers.push(user);
		}
	}
	return retUsers;
};


ZmGroupView.prototype._getDlSubscriptionPolicy =
function() {
	return this._getDlPolicy(this._dlSubscriptionPolicyId, this._subsPolicyOpts);
};

ZmGroupView.prototype._getDlUnsubscriptionPolicy =
function() {
	return this._getDlPolicy(this._dlUnsubscriptionPolicyId, this._subsPolicyOpts);
};

ZmGroupView.prototype._getDlMailPolicy =
function() {
	return this._getDlPolicy(this._dlMailPolicyId, this._mailPolicyOpts);
};

ZmGroupView.prototype._getDlPolicy =
function(fldId, opts) {
	for (var i = 0; i < opts.length; i++) {
		var opt = opts[i];
		if (document.getElementById(fldId[opt]).checked) {
			return opt;
		}
	}
};


ZmGroupView.prototype.isEmpty =
function(checkEither) {
	var groupName = this._getGroupName();
	var members = ( this._groupMembersListView.getList() && this._groupMembersListView.getList().size() > 0 );

	return checkEither
		? (groupName == "" || !members )
		: (groupName == "" && !members );
};


ZmGroupView.prototype.isValidDlName =
function() {
	if (!this.isDistributionList()) {
		return true;
	}
	if (!this._usernameEditable) {
		return true; //to be on the safe and clear side. no need to check.
	}
	var account = this._getDlAddressLocalPart();
	return AjxEmailAddress.accountPat.test(account);
};

ZmGroupView.prototype.isValidDlDomainName =
function() {
	if (!this.isDistributionList()) {
		return true;
	}
	if (!this._domainEditable) {
		return true; //this takes care of a "vanilla" owner with no create rights.
	}

	var domain = this._getGroupDomainName();
	return this._allowedDomains[domain];
};

ZmGroupView.prototype.isValidOwners =
function() {
	if (!this.isDistributionList()) {
		return true;
	}
	return this._getDlOwners().length > 0
};


ZmGroupView.prototype.isValidMailPolicy =
function() {
	if (!this.isDistributionList()) {
		return true;
	}
	return this._getDlMailPolicy() != ZmGroupView.MAIL_POLICY_SPECIFIC || this._getDlSpecificMailers().length > 0;
};



ZmGroupView.prototype.isValid =
function() {
	// check for required group name
	if (this.isDirty() && this.isEmpty(true)) {
		return false;
	}
	if (!this.isValidDlName()) {
		return false;
	}
	if (!this.isValidDlDomainName()) {
		return false;
	}
	if (!this.isValidOwners()) {
		return false;
	}
	if (!this.isValidMailPolicy()) {
		return false;
	}
	return true;
};

//todo - really not sure why this way of having 3 methods with parallel values conditions is used here this way. I just continued to build on what was there, but should check if it can be simplified.
ZmGroupView.prototype.getInvalidItems =
function() {
	if (this.isValid()) {
		return [];
	}
	var items = [];
	if (!this.isValidDlName()) {
		items.push("dlName");
	}
	if (this.isEmpty(true)) {
		items.push("members");
	}
	if (!this.isValidDlDomainName()) {
		items.push("dlDomainName");
	}
	if (!this.isValidOwners()) {
		items.push("owners");
	}
	if (!this.isValidMailPolicy()) {
		items.push("mailPolicy");
	}
	return items;
};

ZmGroupView.prototype.getErrorMessage = function(id) {
	if (this.isValid()) {
		return null;
	}
	if (id == "members") {
		return this.isDistributionList() ? ZmMsg.errorMissingDlMembers : ZmMsg.errorMissingGroup;
	}
	if (id == "dlName") { 
		return ZmMsg.dlInvalidName; 
	}
	if (id == "dlDomainName") {
		return ZmMsg.dlInvalidDomainName; 
	}
	if (id == "owners") {
		return ZmMsg.dlInvalidOwners; 
	}
	if (id == "mailPolicy") {
		return ZmMsg.dlInvalidMailPolicy;
	}

};

ZmGroupView.prototype.enableInputs =
function(bEnable) {
	if (this.isDistributionList()) {
		if (this._usernameEditable) {
			document.getElementById(this._groupNameId).disabled = !bEnable;
		}
		if (this._domainEditable) {
			document.getElementById(this._groupNameDomainId).disabled = !bEnable;
		}
		document.getElementById(this._dlDisplayNameId).disabled = !bEnable;
		document.getElementById(this._dlDescId).disabled = !bEnable;
		document.getElementById(this._dlHideInGalId).disabled = !bEnable;
		document.getElementById(this._dlNotesId).disabled = !bEnable;
		for (var i = 0; i < this._subsPolicyOpts.length; i++) {
			var opt = this._subsPolicyOpts[i];
			document.getElementById(this._dlSubscriptionPolicyId[opt]).disabled = !bEnable;
			document.getElementById(this._dlUnsubscriptionPolicyId[opt]).disabled = !bEnable;
		}
		document.getElementById(this._dlListOwnersId).disabled = !bEnable;
	}
	else {
		document.getElementById(this._groupNameId).disabled = !bEnable;
	}
	if (!this._noManualEntry) {
		this._groupMembers.disabled = !bEnable;
	}
	for (var fieldId in this._searchField) {
		this._searchField[fieldId].disabled = !bEnable;
	}
};

ZmGroupView.prototype.isDirty =
function() {
	return this._isDirty;
};

ZmGroupView.prototype.getTitle =
function() {
	return [ZmMsg.zimbraTitle, this.isDistributionList() ? ZmMsg.distributionList : ZmMsg.group].join(": ");
};

ZmGroupView.prototype.setSize =
function(width, height) {
	// overloaded since base class calls sizeChildren which we dont care about
	DwtComposite.prototype.setSize.call(this, width, height);
};

ZmGroupView.prototype.setBounds =
function(x, y, width, height) {
	DwtComposite.prototype.setBounds.call(this, x, y, width, height);
	if(this._addNewField){
		Dwt.setSize(this._addNewField, Dwt.DEFAULT, 50);
	}
	this._groupMembersListView.setSize(Dwt.DEFAULT, height-150);

	var headerTableHeight = Dwt.getSize(this._headerRow).y;
	var tabBarHeight = this._tabBar ? Dwt.getSize(this._tabBar).y : 0; //only DL
	var searchFieldsRowHeight = Dwt.getSize(this._searchFieldsRow).y;
	var manualAddRowHeight = Dwt.getSize(this._manualAddRow).y;
	var navButtonsRowHeight = Dwt.getSize(this._navButtonsRow).y;
	var listHeight = height - headerTableHeight - tabBarHeight - searchFieldsRowHeight - manualAddRowHeight - navButtonsRowHeight - 40;
	this._listview.setSize(Dwt.DEFAULT, listHeight);
};

ZmGroupView.prototype.cleanup  =
function() {
	for (var fieldId in this._searchField) {
		this._searchField[fieldId].value = "";
	}
	this._listview.removeAll(true);
	this._groupMembersListView.removeAll(true);
	this._addButton.setEnabled(false);
	this._addAllButton.setEnabled(false);
	this._prevButton.setEnabled(false);
	this._nextButton.setEnabled(false);
	if (this._addNewField) {
		this._addNewField.value = '';
	}
};


// Private methods

ZmGroupView.prototype._setFields =
function() {
	// bug fix #35059 - always reset search-in select since non-zimbra accounts don't support GAL
	if (appCtxt.isOffline && appCtxt.accountList.size() > 1 && this._searchInSelect) {
		this._searchInSelect.clearOptions();
		this._resetSearchInSelect();
	}

	this._setGroupName();
	if (this.isDistributionList()) {
		this._setDlFields();
	}
	this._setGroupMembers();
	this._setTags();
};

ZmGroupView.prototype._setTitle =
function(title) {
	var div = document.getElementById(this._titleId);
	var fileAs = title || this._contact.getFileAs();
	div.innerHTML = AjxStringUtil.htmlEncode(fileAs) || (this._contact.id ? "&nbsp;" : ZmMsg.newGroup);
};

ZmGroupView.prototype._getTagCell =
function() {
	return document.getElementById(this._tagsId);
};

ZmGroupView.prototype.getSearchFieldValue =
function(fieldId) {
	if (!fieldId && !this._detailedSearch) {
		fieldId = ZmContactPicker.SEARCH_BASIC;
	}
	var field = this._searchField[fieldId];
	return field && AjxStringUtil.trim(field.value) || "";
};

ZmGroupView.prototype._createHtml =
function() {
	this._headerRowId = 		this._htmlElId + "_headerRow";
	this._titleId = 			this._htmlElId + "_title";
	this._tagsId = 				this._htmlElId + "_tags";
	this._groupNameId = 		this._htmlElId + "_groupName";
	
	if (this.isDistributionList()) {
		this._groupNameDomainId = 		this._htmlElId + "_groupNameDomain";
		this._allowedDomains = appCtxt.createDistListAllowedDomainsMap;
		this._emailDomain = appCtxt.createDistListAllowedDomains[0];
		this._emailUsername = "";
		var email = this._contact.getEmail();
		if (email) {
			var temp = email.split("@");
			this._emailUsername = temp[0];
			this._emailDomain = temp[1];
		}
		var isCreatingNew = !email;
		var domainCount = appCtxt.createDistListAllowedDomains.length;
		this._domainEditable = (domainCount > 1) && (isCreatingNew || this._allowedDomains[this._emailDomain]); //since a rename from one domain to another is like deleting on one and creating on other, both require createDistList right on the domains
		this._usernameEditable = isCreatingNew || this._allowedDomains[this._emailDomain];

		this._dlDisplayNameId = 	this._htmlElId + "_dlDisplayName";
		this._dlDescId = 			this._htmlElId + "_dlDesc";
		this._dlHideInGalId = 	this._htmlElId + "_dlHideInGal";
		this._dlNotesId = 			this._htmlElId + "_dlNotes";
		this._subsPolicyOpts = [ZmContactSplitView.SUBSCRIPTION_POLICY_ACCEPT,
							ZmContactSplitView.SUBSCRIPTION_POLICY_APPROVAL,
							ZmContactSplitView.SUBSCRIPTION_POLICY_REJECT];
		this._dlSubscriptionPolicyId = {};
		this._dlUnsubscriptionPolicyId = {};
		for (var i = 0; i < this._subsPolicyOpts.length; i++) {
			var opt = this._subsPolicyOpts[i];
			this._dlSubscriptionPolicyId[opt] = this._htmlElId + "_dlSubscriptionPolicy" + opt; //_dlSubscriptionPolicyACCEPT / APPROVAL / REJECT
			this._dlUnsubscriptionPolicyId[opt] = this._htmlElId + "_dlUnsubscriptionPolicy" + opt; //_dlUnsubscriptionPolicyACCEPT / APPROVAL / REJECT
		}
		this._mailPolicyOpts = [ZmGroupView.MAIL_POLICY_ANYONE,
								ZmGroupView.MAIL_POLICY_MEMBERS,
								ZmGroupView.MAIL_POLICY_INTERNAL,
								ZmGroupView.MAIL_POLICY_SPECIFIC];
		this._dlMailPolicyId = {};
		for (i = 0; i < this._mailPolicyOpts.length; i++) {
			opt = this._mailPolicyOpts[i];
			this._dlMailPolicyId[opt] = this._htmlElId + "_dlMailPolicy" + opt; //_dlMailPolicyANYONE / etc
		}
		this._dlListSpecificMailersId = 	this._htmlElId + "_dlListSpecificMailers";

		this._dlListOwnersId = 	this._htmlElId + "_dlListOwners";

		// create auto-completer
		var params = {
			dataClass:		appCtxt.getAutocompleter(),
			matchValue:		ZmAutocomplete.AC_VALUE_EMAIL,
			keyUpCallback:	ZmGroupView._onKeyUp, 
			contextId:		this.toString()
		};
		this._acAddrSelectList = new ZmAutocompleteListView(params);
		if (appCtxt.multiAccounts) {
			var acct = object.account || appCtxt.accountList.mainAccount;
			this._acAddrSelectList.setActiveAccount(acct);
		}
	}
	this._searchFieldId = 		this._htmlElId + "_searchField";

	var showSearchIn = false;
	if (appCtxt.get(ZmSetting.CONTACTS_ENABLED)) {
		if (appCtxt.get(ZmSetting.GAL_ENABLED) || appCtxt.get(ZmSetting.SHARING_ENABLED))
			showSearchIn = true;
	}
	var params = this._templateParams = {
		id: this._htmlElId,
		showSearchIn: showSearchIn,
		detailed: this._detailedSearch,
		contact: this._contact,
		isEdit: true,
		usernameEditable: this._usernameEditable,
		domainEditable: this._domainEditable,
		username: this._emailUsername,
		domain: this._emailDomain,
		addrbook: this._contact.getAddressBook()
	};

	if (this.isDistributionList()) {
		this.getHtmlElement().innerHTML = AjxTemplate.expand("abook.Contacts#DlView", params);
		this._tabViewContainerId = this._htmlElId + "_tabViewContainer";
		var tabViewContainer = document.getElementById(this._tabViewContainerId);
		this._tabView = new DwtTabView({parent: this, posStyle: Dwt.STATIC_STYLE, id: this._htmlElId + "_tabView"});
		this._tabView.reparentHtmlElement(tabViewContainer);
		this._dlMembersTabView = new ZmDlMembersTabView(this);
		this._tabView.addTab(ZmMsg.dlMembers, this._dlMembersTabView);
		this._dlPropertiesTabView = new ZmDlPropertiesTabView(this);
		this._tabView.addTab(ZmMsg.dlProperties, this._dlPropertiesTabView);
	}
	else {
		this.getHtmlElement().innerHTML = AjxTemplate.expand("abook.Contacts#GroupView", params);
	}

	this._headerRow = document.getElementById(this._headerRowId);
	this._tabBar = document.getElementById(this._htmlElId + "_tabView_tabbar"); //only for DLs
	this._searchFieldsRow = document.getElementById(this._htmlElId + "_searchFieldsRow");
	this._manualAddRow = document.getElementById(this._htmlElId + "_manualAddRow");
	this._navButtonsRow = document.getElementById(this._htmlElId + "_navButtonsRow");

	this._htmlInitialized = true;
};

ZmGroupView.prototype._addWidgets =
function() {
	if (!this.isDistributionList() || this._usernameEditable) {
		this._groupNameInput = new DwtInputField({parent:this, size: this.isDistributionList() ? 20: 40, inputId: this._htmlElId + "_groupName"});
		this._groupNameInput.setHint(this.isDistributionList() ? ZmMsg.distributionList : ZmMsg.groupNameLabel);
		this._groupNameInput.reparentHtmlElement(this._htmlElId + "_groupNameParent");
	}
	
	this._groupMembers = document.getElementById(this._htmlElId + "_groupMembers");
	this._noManualEntry = this._groupMembers.disabled; // see bug 23858

	// add select menu
	var selectId = this._htmlElId + "_listSelect";
	var selectCell = document.getElementById(selectId);
	if (selectCell) {
		this._searchInSelect = new DwtSelect({parent:this});
		this._resetSearchInSelect();
		this._searchInSelect.reparentHtmlElement(selectId);
		this._searchInSelect.addChangeListener(new AjxListener(this, this._searchTypeListener));
	}

	// add "Search" button
	this._searchButton = new DwtButton({parent:this, parentElement:(this._htmlElId + "_searchButton")});
	this._searchButton.setText(ZmMsg.search);
	this._searchButton.addSelectionListener(new AjxListener(this, this._searchButtonListener));

	// add list view for search results
	this._listview = new ZmGroupListView(this);
	this._listview.reparentHtmlElement(this._htmlElId + "_listView");
	this._listview.addSelectionListener(new AjxListener(this, this._selectionListener));
	this._listview.setUI(null, true); // renders headers and empty list
	this._listview._initialized = true;

	// add list view for group memebers
	this._groupMembersListView = new ZmGroupMembersListView(this);
	this._groupMembersListView.reparentHtmlElement(this._htmlElId + "_groupMembers");
	this._groupMembersListView.addSelectionListener(new AjxListener(this, this._groupMembersSelectionListener));
	this._groupMembersListView.setUI(null, true);
	this._groupMembersListView._initialized = true;
			
	var addListener = new AjxListener(this, this._addListener);
	// add "Add" button
	this._addButton = new DwtButton({parent:this, parentElement:(this._htmlElId + "_addButton")});
	this._addButton.setText(ZmMsg.add);
	this._addButton.addSelectionListener(addListener);
	this._addButton.setEnabled(false);
	this._addButton.setImage("LeftArrow");

	// add "Add All" button
	this._addAllButton = new DwtButton({parent:this, parentElement:(this._htmlElId + "_addAllButton")});
	this._addAllButton.setText(ZmMsg.addAll);
	this._addAllButton.addSelectionListener(addListener);
	this._addAllButton.setEnabled(false);
	this._addAllButton.setImage("LeftArrow");

	var pageListener = new AjxListener(this, this._pageListener);
	// add paging buttons
	this._prevButton = new DwtButton({parent:this, parentElement:(this._htmlElId + "_prevButton")});
	this._prevButton.setImage("LeftArrow");
	this._prevButton.addSelectionListener(pageListener);
	this._prevButton.setEnabled(false);

	this._nextButton = new DwtButton({parent:this, parentElement:(this._htmlElId + "_nextButton")});
	this._nextButton.setImage("RightArrow");
	this._nextButton.addSelectionListener(pageListener);
	this._nextButton.setEnabled(false);

	this._locationButton = new DwtButton({parent:this, parentElement: (this._htmlElId + "_LOCATION_FOLDER")});
	this._locationButton.setImage("ContactsFolder");
	this._locationButton.setEnabled(this._contact && !this._contact.isShared() && !this._contact.isDistributionList());
	this._locationButton.addSelectionListener(new AjxListener(this, this._handleFolderButton));
	var folderOrId = this._contact && this._contact.getAddressBook();
	if (!folderOrId) {
		var overview = appCtxt.getApp(ZmApp.CONTACTS).getOverview();
		folderOrId = overview && overview.getSelected();
		if (folderOrId && folderOrId.type != ZmOrganizer.ADDRBOOK) {
			folderOrId = null;
		}
		if (!this.isDistributionList() && folderOrId && folderOrId.id && folderOrId.id == ZmFolder.ID_DLS) { //can't create under Distribution Lists virtual folder
			folderOrId = null;
		}
	}

	this._setLocationFolder(folderOrId);
	
	
	// add New Button
	this._addNewField = document.getElementById(this._htmlElId + "_addNewField");
	if (this._addNewField) {
		this._addNewButton = new DwtButton({parent:this, parentElement:(this._htmlElId + "_addNewButton")});
		this._addNewButton.setText(ZmMsg.add);
		this._addNewButton.addSelectionListener(new AjxListener(this, this._addNewListener));
		this._addNewButton.setImage("LeftArrow");
	}

	var fieldMap = {};
	var rowMap = {};
	ZmContactPicker.prototype.mapFields.call(this, fieldMap, rowMap);

	this._searchField = {};
	for (var fieldId in fieldMap) {
		var field = Dwt.byId(fieldMap[fieldId]);
		if (field) this._searchField[fieldId] = field;
	}
	
	this._searchRow = {};
	for (var rowId in rowMap) {
		row = Dwt.byId(rowMap[rowId]);
		if (row) this._searchRow[rowId] = row;
	}
	this._updateSearchRows(this._searchInSelect && this._searchInSelect.getValue() || ZmContactsApp.SEARCHFOR_CONTACTS);
};

ZmGroupView.prototype._installKeyHandlers =
function() {

	if (this.isDistributionList()) {
		if (this._usernameEditable) {
			var groupName = document.getElementById(this._groupNameId);
			Dwt.setHandler(groupName, DwtEvent.ONKEYUP, ZmGroupView._onKeyUp);
			Dwt.associateElementWithObject(groupName, this);
		}
		if (this._domainEditable) {
			var groupNameDomain = document.getElementById(this._groupNameDomainId);
			Dwt.setHandler(groupNameDomain, DwtEvent.ONKEYUP, ZmGroupView._onKeyUp);
			Dwt.associateElementWithObject(groupNameDomain, this);
		}

		var dlDisplayName = document.getElementById(this._dlDisplayNameId);
		Dwt.setHandler(dlDisplayName, DwtEvent.ONKEYUP, ZmGroupView._onKeyUp);
		Dwt.associateElementWithObject(dlDisplayName, this);

		var dlDesc = document.getElementById(this._dlDescId);
		Dwt.setHandler(dlDesc, DwtEvent.ONKEYUP, ZmGroupView._onKeyUp);
		Dwt.associateElementWithObject(dlDesc, this);

		var dlHideInGal = document.getElementById(this._dlHideInGalId);
		Dwt.setHandler(dlHideInGal, DwtEvent.ONCHANGE, ZmGroupView._onChange);
		Dwt.associateElementWithObject(dlHideInGal, this);

		var dlNotes = document.getElementById(this._dlNotesId);
		Dwt.setHandler(dlNotes, DwtEvent.ONKEYUP, ZmGroupView._onKeyUp);
		Dwt.associateElementWithObject(dlNotes, this);

		for (var i = 0; i < this._subsPolicyOpts.length; i++) {
			var opt =  this._subsPolicyOpts[i];
			var policy = document.getElementById(this._dlSubscriptionPolicyId[opt]);
			Dwt.setHandler(policy, DwtEvent.ONCHANGE, ZmGroupView._onChange);
			Dwt.associateElementWithObject(policy, this);

			policy = document.getElementById(this._dlUnsubscriptionPolicyId[opt]);
			Dwt.setHandler(policy, DwtEvent.ONCHANGE, ZmGroupView._onChange);
			Dwt.associateElementWithObject(policy, this);
		}

		var dlListOwners = document.getElementById(this._dlListOwnersId);
		Dwt.associateElementWithObject(dlListOwners, this);
		if (this._acAddrSelectList) {
			this._acAddrSelectList.handle(dlListOwners);
		}
		else {
			Dwt.setHandler(dlListOwners, DwtEvent.ONKEYUP, ZmGroupView._onKeyUp);
		}

		for (i = 0; i < this._mailPolicyOpts.length; i++) {
			opt =  this._mailPolicyOpts[i];
			policy = document.getElementById(this._dlMailPolicyId[opt]);
			Dwt.setHandler(policy, DwtEvent.ONCHANGE, ZmGroupView._onChange);
			Dwt.associateElementWithObject(policy, this);
		}
		var dlListSpecificMailers = document.getElementById(this._dlListSpecificMailersId);
		Dwt.associateElementWithObject(dlListSpecificMailers, this);
		if (this._acAddrSelectList) {
			this._acAddrSelectList.handle(dlListSpecificMailers);
		}
		else {
			Dwt.setHandler(dlListSpecificMailers, DwtEvent.ONKEYUP, ZmGroupView._onKeyUp);
		}

	}
	else {
		var groupName = document.getElementById(this._groupNameId);
		Dwt.setHandler(groupName, DwtEvent.ONKEYUP, ZmGroupView._onKeyUp);
		Dwt.associateElementWithObject(groupName, this);
	}

	if (!this._noManualEntry) {
		Dwt.setHandler(this._groupMembers, DwtEvent.ONKEYUP, ZmGroupView._onKeyUp);
		Dwt.associateElementWithObject(this._groupMembers, this);
	}

	for (var fieldId in this._searchField) {
		var searchField = this._searchField[fieldId];
		Dwt.setHandler(searchField, DwtEvent.ONKEYPRESS, ZmGroupView._keyPressHdlr);
		Dwt.associateElementWithObject(searchField, this);
	}
};

/**
 * very important method to have in order for the tab group (and tabbing) to be set up correctly (called from ZmBaseController.prototype._initializeTabGroup)
 */
ZmGroupView.prototype.getTabGroupMember = function() {
	return this._tabGroup;
};

ZmGroupView.prototype._getTabGroupMembers =
function() {
	var fields = [];
	if (this.isDistributionList()) {
		if (this._usernameEditable) {
			fields.push(document.getElementById(this._groupNameId));
		}
		if (this._domainEditable) {
			fields.push(document.getElementById(this._groupNameDomainId));
		}
		fields.push(document.getElementById(this._dlDisplayNameId));
		fields.push(document.getElementById(this._dlDescId));
		fields.push(document.getElementById(this._dlHideInGalId));
		for (var i = 0; i < this._mailPolicyOpts.length; i++) {
			var opt = this._mailPolicyOpts[i];
			fields.push(document.getElementById(this._dlMailPolicyId[opt]));
		}

		for (var i = 0; i < this._subsPolicyOpts.length; i++) {
			var opt = this._subsPolicyOpts[i];
			fields.push(document.getElementById(this._dlSubscriptionPolicyId[opt]));
		}
		for (i = 0; i < this._subsPolicyOpts.length; i++) {
			opt = this._subsPolicyOpts[i];
			fields.push(document.getElementById(this._dlUnsubscriptionPolicyId[opt]));
		}
		fields.push(document.getElementById(this._dlNotesId));
	}
	else {
		fields.push(document.getElementById(this._groupNameId));
	}
	if (!this._noManualEntry) {
		fields.push(this._groupMembers);
	}
	for (var fieldId in this._searchField) {
		fields.push(this._searchField[fieldId]);
	}
	fields.push(this._searchButton);
	fields.push(this._searchInSelect);

	return fields;
};

ZmGroupView.prototype._getDefaultFocusItem =
function() {
	if (this.isDistributionList()) {
		if (this._usernameEditable) {
			return document.getElementById(this._groupNameId);
		}
		if (this._domainEditable) {
			return document.getElementById(this._groupNameDomainId);
		}
		return document.getElementById(this._dlDisplayNameId);
	}
	return document.getElementById(this._groupNameId);
};

ZmGroupView.prototype._getGroupMembers =
function() {
	return this._groupMembersListView.getList().getArray();
};

ZmGroupView.prototype._getFolderId =
function() {
	return this._folderId || ZmFolder.ID_CONTACTS;
};

ZmGroupView.prototype._setGroupMembers =
function() {
	var members = this._contact.getAllGroupMembers();
	if (!members) {
		return;
	}
	this._groupMembersListView.set(AjxVector.fromArray(members)); //todo?
};

ZmGroupView.prototype._setGroupName =
function() {
	if (this.isDistributionList()) {
		if (this._domainEditable) {
			var groupNameDomain = document.getElementById(this._groupNameDomainId);
			groupNameDomain.value = this._emailDomain;
		}
		if (this._usernameEditable) {
			this._groupNameInput.setValue(this._emailUsername);
		}
		return;
	}
	var groupName = document.getElementById(this._groupNameId);
	if (!groupName) {
		return;
	}

	this._groupNameInput.setValue(this._contact.getFileAs());
};

ZmGroupView.prototype._setDlFields =
function() {
	var displayName = document.getElementById(this._dlDisplayNameId);
	var dlInfo = this._contact.dlInfo;
	displayName.value = dlInfo.displayName || "";

	var desc = document.getElementById(this._dlDescId);
	desc.value = dlInfo.description || "";

	var hideInGal = document.getElementById(this._dlHideInGalId);
	hideInGal.checked = dlInfo.hideInGal;

	//set the default only in temporary var so it will be saved later as modification, even if user doesn't change.
	//this is for the new DL case
	var subsPolicy = dlInfo.subscriptionPolicy || ZmContactSplitView.SUBSCRIPTION_POLICY_ACCEPT;
	var unsubsPolicy = dlInfo.unsubscriptionPolicy || ZmContactSplitView.SUBSCRIPTION_POLICY_ACCEPT;
	for (var i = 0; i < this._subsPolicyOpts.length; i++) {
		var opt = this._subsPolicyOpts[i];
		var subsPolicyOpt = document.getElementById(this._dlSubscriptionPolicyId[opt]);
		subsPolicyOpt.checked = subsPolicy == opt;

		var unsubsPolicyOpt = document.getElementById(this._dlUnsubscriptionPolicyId[opt]);
		unsubsPolicyOpt.checked = unsubsPolicy == opt;
	}
	var mailPolicy = dlInfo.mailPolicy || ZmGroupView.MAIL_POLICY_ANYONE;
	for (i = 0; i < this._mailPolicyOpts.length; i++) {
		opt = this._mailPolicyOpts[i];
		var mailPolicyOpt = document.getElementById(this._dlMailPolicyId[opt]);
		mailPolicyOpt.checked = mailPolicy == opt;
	}
	if (dlInfo.mailPolicy == ZmGroupView.MAIL_POLICY_SPECIFIC) {
		var listSpecificMailers = document.getElementById(this._dlListSpecificMailersId);
		listSpecificMailers.value = dlInfo.mailPolicySpecificMailers.join("; ");
		if (listSpecificMailers.value.length > 0) {
			listSpecificMailers.value += ";"; //so it's ready to add more by user.
		}
	}

	var listOwners = document.getElementById(this._dlListOwnersId);
	listOwners.value = dlInfo.owners.join("; ");
	if (listOwners.value.length > 0) {
		listOwners.value += ";"; //so it's ready to add more by user.
	}

	var notes = document.getElementById(this._dlNotesId);
	notes.value = dlInfo.notes || "";

};


ZmGroupView.prototype._resetSearchInSelect =
function() {
	this._searchInSelect.addOption(ZmMsg.contacts, true, ZmContactsApp.SEARCHFOR_CONTACTS);
	if (appCtxt.get(ZmSetting.SHARING_ENABLED)) {
		this._searchInSelect.addOption(ZmMsg.searchPersonalSharedContacts, false, ZmContactsApp.SEARCHFOR_PAS);
	}
	if (appCtxt.get(ZmSetting.GAL_ENABLED) && appCtxt.getActiveAccount().isZimbraAccount) {
		this._searchInSelect.addOption(ZmMsg.GAL, true, ZmContactsApp.SEARCHFOR_GAL);
	}
	if (!appCtxt.get(ZmSetting.INITIALLY_SEARCH_GAL) || !appCtxt.get(ZmSetting.GAL_ENABLED)) {
		this._searchInSelect.setSelectedValue(ZmContactsApp.SEARCHFOR_CONTACTS);
	}
};

ZmGroupView.prototype._setLocationFolder = function(organizerOrId) {
	if (organizerOrId) {
		var organizer = organizerOrId instanceof ZmOrganizer ? organizerOrId : appCtxt.getById(organizerOrId);
	}
	if (!organizer || organizer.isReadOnly()) {
		//default to the main contacts folder
		organizer = appCtxt.getById(ZmOrganizer.ID_ADDRBOOK);
	}

	this._locationButton.setText(organizer.getName());
	this._folderId = organizer.id;
};

ZmGroupView.prototype._handleFolderButton = function(ev) {
	var dialog = appCtxt.getChooseFolderDialog();
	dialog.registerCallback(DwtDialog.OK_BUTTON, new AjxCallback(this, this._handleChooseFolder));
	var params = {
		overviewId:		dialog.getOverviewId(ZmApp.CONTACTS),
		title:			ZmMsg.chooseAddrBook,
		treeIds:		[ZmOrganizer.ADDRBOOK],
		skipReadOnly:	true,
		skipRemote:		false,
		noRootSelect:	true,
		appName:		ZmApp.CONTACTS
	};
	params.omit = {};
	params.omit[ZmFolder.ID_TRASH] = true;
	dialog.popup(params);
};

/**
 * @private
 */
ZmGroupView.prototype._handleChooseFolder = function(organizer) {
	var dialog = appCtxt.getChooseFolderDialog();
	dialog.popdown();
	this._isDirty = true;
	this._setLocationFolder(organizer);
};

ZmGroupView.prototype._setTags =
function() {
	var tagCell = this._getTagCell();
	if (!tagCell) { return; }

	tagCell.innerHTML = ZmTagsHelper.getTagsHtml(this._contact, this);
};

// Consistent spot to locate various dialogs
ZmGroupView.prototype._getDialogXY =
function() {
	if (this.isDistributionList()) {
		// the scrolling messes up the calculation of Dwt.toWindow. This however seems to work fine, the dialog is just a little higher than other cases
		return new DwtPoint(ZmGroupView.DIALOG_X, ZmGroupView.DIALOG_Y);
	}
	var loc = Dwt.toWindow(this.getHtmlElement(), 0, 0);
	return new DwtPoint(loc.x + ZmGroupView.DIALOG_X, loc.y + ZmGroupView.DIALOG_Y);
};

// Listeners

ZmGroupView.prototype._groupMembersSelectionListener =
function(ev){
	var selection = this._groupMembersListView.getSelection();
	if (ev && ev.target && this._groupMembersListView.delButtons[ev.target.id]) {
		this._delListener(ev);	
	}
	else if (ev && ev.target && this._groupMembersListView.quickAddButtons[ev.target.id]) {
		if (AjxUtil.isArray(selection)) {
			var address = selection[0].address || selection[0];
			this.quickAddContact(address);
		}
	}
		
};

ZmGroupView.prototype._selectionListener =
function(ev) {
	var selection = this._listview.getSelection();

	if (ev.detail == DwtListView.ITEM_DBL_CLICKED) {
		this._addItems(selection);
	} else {
		this._addButton.setEnabled(selection.length > 0);
	}
};

ZmGroupView.prototype._selectChangeListener =
function(ev) {
	this._attr[ZmContact.F_folderId] = ev._args.newValue;
	this._isDirty = true;
};

ZmGroupView.prototype._searchTypeListener =
function(ev) {
	var oldValue = ev._args.oldValue;
	var newValue = ev._args.newValue;

	if (oldValue != newValue) {
		this._updateSearchRows(newValue);
		this._searchButtonListener();
	}
};

ZmGroupView.prototype._delListener =
function(ev){

	var items = this._groupMembersListView.getSelection();
	var selectedDomItems = this._groupMembersListView.getSelectedItems();

	while (selectedDomItems.get(0)) {
		this._groupMembersListView.removeItem(selectedDomItems.get(0));
	}

	for (var i = 0;  i < items.length; i++) {
		var item = items[i];
		this._groupMembersListView.getList().remove(item);
		var contact = item.__contact;
		var type = item.type;
		var value = item.groupRefValue || item.value;

		//var value = item.value || (contact ? contact.getId(!contact.isGal) : item);

		if (!this._groupMemberMods[value]) {
			this._groupMemberMods[value] = {op : "-", value : value, email: item.address, type : type};
		}
		else {
			this._groupMemberMods[value] = {};
		}
	}

	this._groupMembersSelectionListener();
	this._isDirty = true;
};

ZmGroupView.prototype._addNewListener =
function(ev){
	var emailStr = this._addNewField.value;
	if (!emailStr || emailStr == '') { return; }

	var allArray = AjxEmailAddress.parseEmailString(emailStr).all.getArray(); //in bug 38907 it was changed to "all" instead of "good". No idea why. So we can now add bad email addresses. Is that on purpose?
	var addrs = [];
	for (var i = 0; i < allArray.length; i++) {
		addrs.push(ZmContactsHelper._wrapInlineContact(allArray[i].address)); //might be better way to do this, we recreate the AjxEmailAddress just to add the "value" and "type" and maybe "id" attributes.
	}

	addrs = ZmGroupView._dedupe(addrs, this._groupMembersListView.getList().getArray());
	this._addToMembers(addrs);

	this._addNewField.value = '';
};

ZmGroupView.prototype._addListener =
function(ev) {
	var list = (ev.dwtObj == this._addButton)
		? this._listview.getSelection()
		: this._listview.getList().getArray();

	this._addItems(list);
};

ZmGroupView.prototype._addItems =
function(list) {
	if (list.length == 0) { return; }

	// we have to walk the results in case we hit a group which needs to be split
	var items = [];
	for (var i = 0; i < list.length; i++) {
		var item = list[i];
		var contact = item.__contact;
		if (item.isGroup && !contact.isDistributionList()) {
			var groupMembers = contact.attr[ZmContact.F_groups];
			for (var j = 0; j < groupMembers.length; j++) {
				var value = groupMembers[j].value;
				var memberContact = ZmContact.getContactFromCache(value);
				var obj;
				if (memberContact) {
					obj = ZmContactsHelper._wrapContact(memberContact);
				}
				else {
					obj = ZmContactsHelper._wrapInlineContact(value);
				}
				if (obj) {
					items.push(obj);
				}
			}
		}
		else {
			items.push(list[i]);
            if (contact.isGal) {
                appCtxt.cacheSet(contact.ref, contact); //not sure why we do this. just seems like maybe we should do this elsewhere in more consistent way. 
            }
		}
	}

	items = ZmGroupView._dedupe(items, this._groupMembersListView.getList().getArray());
	if (items.length > 0) {
		this._addToMembers(items);
	}
};

ZmGroupView.prototype._addToMembers =
function(items){
	var userZid = appCtxt.accountList.mainAccount.id;
	for (var i = 0; i < items.length; i++) {
		var item = items[i];
		var type = item.type;
		var value = item.value;
		var email = item.address;
		var obj = this._groupMemberMods[value];
		if (!obj) {
			if (type === ZmContact.GROUP_CONTACT_REF && value && value.indexOf(":") === -1 ) {
				value = userZid + ":" + value;
			}
			this._groupMemberMods[value] = {op : "+", value : value, type : type, email: email};
		}
		else if (obj.op == "-") {
			//contact is already in the group, clear the value
			this._groupMemberMods[value] = {};
		}
	}
	var membersList = this._groupMembersListView.getList();
	items = items.concat(membersList ? membersList.getArray() : []);
	this._isDirty = true;

	this._groupMembersListView.set(AjxVector.fromArray(items));
};

/**
 * Returns the items from newItems that are not in list, and also not duplicates within newItems (i.e. returns one of each)
 *
 * @param newItems {Array} array of items to be added to the target list
 * @param list {Array} the target list as an array of items
 * @return {Array} uniqueNewItems the unique new items (items that are not in the list or duplicates in the newItems)
 * @private
 */
ZmGroupView._dedupe =
function(newItems, list) {

	AjxUtil.dedup(newItems, function(item) {
		return item.type + "$" + item.value;
	});

	var uniqueNewItems = [];

	for (var i = 0; i < newItems.length; i++) {
		var newItem = newItems[i];
		var found = false;
		for (var j = 0; j < list.length; j++) {
			var item = list[j];
			if (newItem.type == item.type && newItem.value == item.value) {
				found = true;
				break;
			}
		}
		if (!found) {
			uniqueNewItems.push(newItem);
		}
	}

	return uniqueNewItems;
};

ZmGroupView.prototype._setGroupMemberValue =
function(value, append) {
	if (this._noManualEntry) {
		this._groupMembers.disabled = false;
	}

	if (append) {
		this._groupMembers.value += value;
	} else {
		this._groupMembers.value = value;
	}

	if (this._noManualEntry) {
		this._groupMembers.disabled = true;
	}
};


/**
 * called from ZmContactPicker.prototype._showResults
 * @param list
 */
ZmGroupView.prototype._setResultsInView =
function(list) {
	var arr = list.getArray();
	this._listview.setItems(arr);
	this._addButton.setEnabled(arr.length > 0);
	this._addAllButton.setEnabled(arr.length > 0);
};

/**
 * called from ZmContactPicker.prototype._showResults
 */
ZmGroupView.prototype._setNoResultsHtml =
function(list) {
	//no need to do anything here. the setItems called from _setResultsInView sets the "no results found" if list is empty. (via call to addItems)
};

/**
 * reuse functions from ZmContactPicker, some called from ZmContactPicker code we re-use here.
 */
ZmGroupView.prototype.search = ZmContactPicker.prototype.search;
ZmGroupView.prototype._handleResponseSearch = ZmContactPicker.prototype._handleResponseSearch;
ZmGroupView.prototype._resetResults = ZmContactPicker.prototype._resetResults;
ZmGroupView.prototype._searchButtonListener = ZmContactPicker.prototype._searchButtonListener;
ZmGroupView.prototype._pageListener = ZmContactPicker.prototype._pageListener;
ZmGroupView.prototype._showResults = ZmContactPicker.prototype._showResults;
ZmGroupView.prototype.getSubList = ZmContactPicker.prototype.getSubList;


ZmGroupView.prototype._tagChangeListener = function(ev) {
	if (ev.type != ZmEvent.S_TAG) { return; }

	var fields = ev.getDetail("fields");
	var changed = fields && (fields[ZmOrganizer.F_COLOR] || fields[ZmOrganizer.F_NAME]);
	if ((ev.event == ZmEvent.E_MODIFY && changed) || ev.event == ZmEvent.E_DELETE || ev.event == ZmEvent.MODIFY) {
		this._setTags();
	}
};

ZmGroupView.prototype._groupChangeListener = function(ev) {
	if (ev.type != ZmEvent.S_CONTACT) return;
	if (ev.event == ZmEvent.E_TAGS || ev.event == ZmEvent.E_REMOVE_ALL) {
		this._setTags();
	}
};

ZmGroupView.prototype._updateSearchRows =
function(searchFor) {
	var fieldIds = (searchFor == ZmContactsApp.SEARCHFOR_GAL) ? ZmContactPicker.SHOW_ON_GAL : ZmContactPicker.SHOW_ON_NONGAL;
	for (var fieldId in this._searchRow) {
		Dwt.setVisible(this._searchRow[fieldId], AjxUtil.indexOf(fieldIds, fieldId)!=-1);
	}
};

ZmGroupView.prototype._resetSearchColHeaders =
function() {
	var lv = this._listview;
	lv.headerColCreated = false;
	var isGal = this._searchInSelect && (this._searchInSelect.getValue() == ZmContactsApp.SEARCHFOR_GAL);

	for (var i = 0; i < lv._headerList.length; i++) {
		var field = lv._headerList[i]._field;
		if (field == ZmItem.F_DEPARTMENT) {
			lv._headerList[i]._visible = isGal && this._detailedSearch;
		}
	}

	var sortable = isGal ? null : ZmItem.F_NAME;
	lv.createHeaderHtml(sortable);
};

ZmGroupView.prototype._checkItemCount =
function() {
	this._listview._checkItemCount();
};

ZmGroupView.prototype._handleResponseCheckReplenish =
function(skipSelection) {
	this._listview._handleResponseCheckReplenish(skipSelection);
};

// Static methods

ZmGroupView._onKeyUp =
function(ev) {
	ev = DwtUiEvent.getEvent(ev);

	var key = DwtKeyEvent.getCharCode(ev);
	if (DwtKeyMapMgr.hasModifier(ev) || DwtKeyMap.IS_MODIFIER[key] ||	key === DwtKeyEvent.KEY_TAB) { return; }

	var e = DwtUiEvent.getTarget(ev);
	var view = e ? Dwt.getObjectFromElement(e) : null;
	if (view) {
		view._isDirty = true;
	}

	return true;
};

ZmGroupView._onChange =
function(ev) {
	ev = DwtUiEvent.getEvent(ev);

	var e = DwtUiEvent.getTarget(ev);
	var view = e ? Dwt.getObjectFromElement(e) : null;
	if (view) {
		view._isDirty = true;
	}

	return true;
};

ZmGroupView._keyPressHdlr =
function(ev) {
	ev = DwtUiEvent.getEvent(ev);
	if (DwtKeyMapMgr.hasModifier(ev)) { return; }

	var e = DwtUiEvent.getTarget(ev);
	var view = e ? Dwt.getObjectFromElement(e) : null;
	if (view) {
		var charCode = DwtKeyEvent.getCharCode(ev);
		if (charCode == 13 || charCode == 3) {
			view._searchButtonListener(ev);
			return false;
		}
	}
	return true;
};

ZmGroupView.prototype.quickAddContact = 
function(email) {
	var quickAdd = appCtxt.getContactQuickAddDialog();
	quickAdd.setFields(email);
	var saveCallback = new AjxCallback(this, this._handleQuickAddContact);
	quickAdd.popup(saveCallback);
};

ZmGroupView.prototype._handleQuickAddContact = 
function(result) {
	var resp = AjxUtil.get(result, "_data", "BatchResponse", "CreateContactResponse");
	var contact = resp ? ZmContact.createFromDom(resp[0].cn[0], {}) : null;
	if (!contact) {
		return;
	}
	var selection = this._groupMembersListView.getSelection();
	var selectedItem = selection[0];
	var value = selectedItem.value;
	if (!this._groupMemberMods[value]) {
		this._groupMemberMods[value] = {op : "-", value : value, type : selectedItem.type};
	}
	else {
		this._groupMemberMods[value] = {};
	}
	var domList = this._groupMembersListView.getSelectedItems();
	this._groupMembersListView.removeItem(domList.get(0));
	this._groupMembersListView.getList().remove(selectedItem);

	var obj = ZmContactsHelper._wrapContact(contact);
	if (obj) {
		this._addItems([obj]);
	}
};

/**
 * Creates a group list view for search results
 * @constructor
 * @class
 *
 * @param {ZmGroupView}		parent			containing widget
 * 
 * @extends		DwtListView
 * 
 * @private
*/
ZmGroupListView = function(parent) {
	if (arguments.length == 0) { return; }
	DwtListView.call(this, {parent:parent, className:"DwtChooserListView ZmEditGroupContact",
							headerList:this._getHeaderList(parent), view:this._view, posStyle: Dwt.RELATIVE_STYLE});
	Dwt.setScrollStyle(this._elRef, Dwt.CLIP);
};

ZmGroupListView.prototype = new DwtListView;
ZmGroupListView.prototype.constructor = ZmGroupListView;

ZmGroupListView.prototype.setItems =
function(items) {
	this._resetList();
	this.addItems(items);
	var list = this.getList();
	if (list && list.size() > 0) {
		this.setSelection(list.get(0));
	}
};

ZmGroupListView.prototype._getHeaderList =
function() {
	return [
		(new DwtListHeaderItem({field:ZmItem.F_TYPE,	icon:"Contact",		width:ZmMsg.COLUMN_WIDTH_TYPE_CN})),
		(new DwtListHeaderItem({field:ZmItem.F_NAME,	text:ZmMsg._name,	width:ZmMsg.COLUMN_WIDTH_NAME_CN, resizeable: true})),
		(new DwtListHeaderItem({field:ZmItem.F_EMAIL,	text:ZmMsg.email}))
	];
};

ZmGroupListView.prototype._getCellContents =
function(html, idx, item, field, colIdx, params) {
	return ZmContactsHelper._getEmailField(html, idx, item, field, colIdx, params);
};

ZmGroupListView.prototype._itemClicked =
function(clickedEl, ev) {
	// Ignore right-clicks, we don't support action menus
	if (!ev.shiftKey && !ev.ctrlKey && ev.button == DwtMouseEvent.RIGHT) { return; }

	DwtListView.prototype._itemClicked.call(this, clickedEl, ev);
};

ZmGroupListView.prototype._mouseDownAction =
function(ev, div) {
	return !Dwt.ffScrollbarCheck(ev);
};

ZmGroupListView.prototype._mouseUpAction =
function(ev, div) {
	return !Dwt.ffScrollbarCheck(ev);
};

//stub method
ZmGroupListView.prototype._checkItemCount =
function() {
	return true;
};

//stub method
ZmGroupListView.prototype._handleResponseCheckReplenish =
function() {
	return true;
};

/**
 * Creates a group members list view
 * @constructor
 * @class
 *
 * @param {ZmGroupView}	parent			containing widget
 * 
 * @extends		ZmGroupListView
 * 
 * 
 * @private
 */
ZmGroupMembersListView = function (parent) {
	if (arguments.length == 0) { return; }
	ZmGroupListView.call(this, parent);
	this._list = new AjxVector();
	// hash of delete icon IDs
	this.delButtons = {};
	this.quickAddButtons = {};
};

ZmGroupMembersListView.prototype = new ZmGroupListView;
ZmGroupMembersListView.prototype.constructor = ZmGroupMembersListView;

ZmGroupMembersListView.prototype._getHeaderList =
function() {
	return [(new DwtListHeaderItem({field:ZmItem.F_EMAIL, text:ZmMsg.membersLabel, view:this._view}))];
};

ZmGroupMembersListView.prototype._getCellContents =
function(html, idx, item, field, colIdx, params) {
	if (field == ZmItem.F_EMAIL) {
		var data = {};
		data.isEdit = true;
		data.delButtonId = Dwt.getNextId("DelContact_");
		this.delButtons[data.delButtonId] = true;
		var contact = item.__contact;
		var addr = item.address;

		if (contact && !this.parent.isDistributionList()) {
			data.imageUrl = contact.getImageUrl();
			data.email = AjxStringUtil.htmlEncode(contact.getEmail());
			data.title = AjxStringUtil.htmlEncode(contact.getAttr(ZmContact.F_jobTitle));
			data.phone = AjxStringUtil.htmlEncode(contact.getPhone());
			data.imgClassName = contact.getIconLarge(); 
			var isPhonetic  = appCtxt.get(ZmSetting.PHONETIC_CONTACT_FIELDS);
			var fullnameHtml= contact.getFullNameForDisplay(isPhonetic);
			if (!isPhonetic) {
				fullnameHtml = AjxStringUtil.htmlEncode(fullnameHtml);
			}
			data.fullName = fullnameHtml;
		}
		else {
			data.imgClassName = "PersonInline_48";
			data.email = AjxStringUtil.htmlEncode(addr);
			if (!this.parent.isDistributionList()) {
				data.isInline = true;
				data.quickAddId = Dwt.getNextId("QuickAdd_");
				this.quickAddButtons[data.quickAddId] = true;
			}
		}
		html[idx++] = AjxTemplate.expand("abook.Contacts#SplitView_group", data);

	}
	return idx;
};


// override from base class since it is handled differently
ZmGroupMembersListView.prototype._getItemId =
function(item) {
	return (item && item.id) ? item.id : Dwt.getNextId();
};

/**
 * @class
 *
 * @param	{DwtControl}	parent		    the parent (dialog)
 * @param	{String}	    className		the class name
 *
 * @extends		DwtTabViewPage
 */
ZmDlPropertiesTabView = function(parent, className) {
    if (arguments.length == 0) return;

    DwtTabViewPage.call(this, parent, className, Dwt.ABSOLUTE_STYLE);

	this.setScrollStyle(Dwt.SCROLL);

	var htmlEl = this.getHtmlElement();
	htmlEl.style.top = this.parent._tabView.getY() + this.parent._tabView._tabBar.getH() + "px";
	htmlEl.style.bottom = 0;

};

ZmDlPropertiesTabView.prototype = new DwtTabViewPage;

ZmDlPropertiesTabView.prototype.toString = function() {
	return "ZmDlPropertiesTabView";
};

ZmDlPropertiesTabView.prototype._createHtml =
function () {
	DwtTabViewPage.prototype._createHtml.call(this);
	this.getHtmlElement().innerHTML = AjxTemplate.expand("abook.Contacts#DlPropertiesView", this.parent._templateParams);
};

/**
 * @class
 *
 * @param	{DwtControl}	parent		    the parent (dialog)
 * @param	{String}	    className		the class name
 *
 * @extends		DwtTabViewPage
 */
ZmDlMembersTabView = function(parent, className) {
    if (arguments.length == 0) return;

    DwtTabViewPage.call(this, parent, className, Dwt.RELATIVE_STYLE);

};

ZmDlMembersTabView.prototype = new DwtTabViewPage;

ZmDlMembersTabView.prototype.toString = function() {
	return "ZmDlMembersTabView";
};

ZmDlMembersTabView.prototype._createHtml =
function () {
	DwtTabViewPage.prototype._createHtml.call(this);
	this.getHtmlElement().innerHTML = AjxTemplate.expand("abook.Contacts#GroupViewMembers", this.parent._templateParams);
};

