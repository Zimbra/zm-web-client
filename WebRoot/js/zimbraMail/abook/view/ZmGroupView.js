/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2006, 2007, 2008, 2009, 2010 Zimbra, Inc.
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
 * @extends		DwtComposite
 */
ZmGroupView = function(parent, controller) {
	if (arguments.length == 0) return;
	DwtComposite.call(this, {parent:parent, className:"ZmContactView", posStyle:DwtControl.ABSOLUTE_STYLE});
	this.setScrollStyle(Dwt.CLIP); //default is clip, for regular group it's fine. (otherwise there's always a scroll for no reason, not sure why). For DL we change in "set"

	this._searchRespCallback = new AjxCallback(this, this._handleResponseSearch);

	this._controller = controller;

	this._offset = 0;
	this._defaultQuery = ".";
	this._view = ZmId.VIEW_GROUP;

	this._tagList = appCtxt.getTagTree();
	this._tagList.addChangeListener(new AjxListener(this, this._tagChangeListener));

	this._changeListener = new AjxListener(this, this._groupChangeListener);
	this._detailedSearch = appCtxt.get(ZmSetting.DETAILED_CONTACT_SEARCH_ENABLED);
	this._groupMemberMods = {};
};

ZmGroupView.prototype = new DwtComposite;
ZmGroupView.prototype.constructor = ZmGroupView;

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

ZmGroupView.SEARCH_BASIC = "search";
ZmGroupView.SEARCH_NAME = "name";
ZmGroupView.SEARCH_EMAIL = "email";
ZmGroupView.SEARCH_DEPT = "dept";
ZmGroupView.SEARCH_PHONETIC = "phonetic";

ZmGroupView.SHOW_ON_GAL = [ZmGroupView.SEARCH_BASIC, ZmGroupView.SEARCH_NAME, ZmGroupView.SEARCH_EMAIL, ZmGroupView.SEARCH_DEPT];
ZmGroupView.SHOW_ON_NONGAL = [ZmGroupView.SEARCH_BASIC, ZmGroupView.SEARCH_NAME, ZmGroupView.SEARCH_PHONETIC, ZmGroupView.SEARCH_EMAIL];

ZmGroupView.MAIL_POLICY_ANYONE = "ANYONE";
ZmGroupView.MAIL_POLICY_MEMBERS = "MEMBERS";
ZmGroupView.MAIL_POLICY_INTERNAL = "INTERNAL";
ZmGroupView.MAIL_POLICY_SPECIFIC = "SPECIFIC";

ZmGroupView.GRANTEE_TYPE_USER = "usr";
ZmGroupView.GRANTEE_TYPE_GROUP = "grp";
ZmGroupView.GRANTEE_TYPE_ALL = "all";
ZmGroupView.GRANTEE_TYPE_PUBLIC = "pub";

ZmGroupView.GRANTEE_TYPE_TO_MAIL_POLICY_MAP = [];
ZmGroupView.GRANTEE_TYPE_TO_MAIL_POLICY_MAP[ZmGroupView.GRANTEE_TYPE_USER] = ZmGroupView.MAIL_POLICY_SPECIFIC;
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

ZmGroupView.prototype.set =
function(contact, isDirty) {
	this._attr = {};

	if (this._contact) {
		this._contact.removeChangeListener(this._changeListener);
	}
	contact.addChangeListener(this._changeListener);
	this._contact = contact;
	if (this._contact.isDistributionList()) {
		this.setScrollStyle(Dwt.SCROLL);
	}

	if (!this._htmlInitialized) {
		this._createHtml();
		this._addWidgets();
		this._installKeyHandlers();
	}
	
	this._setFields();
	this._offset = 0;
	this._isDirty = isDirty;

	document.getElementById(this._groupNameId).onblur = this._controller.updateTabTitle.bind(this._controller);
	if (contact.isDistributionList()) {
		document.getElementById(this._groupNameDomainId).onblur = this._controller.updateTabTitle.bind(this._controller);
	}

	this.search();
};

ZmGroupView.prototype.getModifiedAttrs =
function() {
	if (!this.isDirty()) return null;

	var mods = this._attr = [];

	// get field values
	var groupName = this._getGroupName();
	var folderId = this._getFolderId();

	if (this._contact.isDistributionList()) {
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
			mods[ZmContact.F_dlHideInGal] = this._getDlHideInGal();
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
	if (this._contact.id == null || (this._contact.isGal && !this._contact.isDistributionList())) {
		mods[ZmContact.F_folderId] = folderId;
		mods[ZmContact.F_fileAs] = ZmContact.computeCustomFileAs(groupName);
		mods[ZmContact.F_nickname] = groupName;
		mods[ZmContact.F_groups] = this._getGroupMembers();
		mods[ZmContact.F_type] = "group";
	}
	else {
		// modifying existing contact
		if (!this._contact.isDistributionList() && this._contact.getFileAs() != groupName) {
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
	return AjxStringUtil.trim(document.getElementById(this._groupNameDomainId).value);
};

ZmGroupView.prototype._getGroupName =
function() {
	var name = AjxStringUtil.trim(document.getElementById(this._groupNameId).value);
	if (this._contact.isDistributionList()) {
		name += "@" + this._getGroupDomainName();
	}
	return name;
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
	return document.getElementById(this._dlHideInGalId).checked ? "TRUE" : "FALSE";
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
	var members = ( this._groupListView.getList() && this._groupListView.getList().size() > 0 );

	return checkEither
		? (groupName == "" || !members )
		: (groupName == "" && !members );
};


ZmGroupView.prototype.isValidDlName =
function() {
	if (!this._contact.isDistributionList()) {
		return true;
	}
	var groupName = this._getGroupName();
	return AjxEmailAddress.isValid(groupName);
};

ZmGroupView.prototype.isValidDlDomainName =
function() {
	if (!this._contact.isDistributionList()) {
		return true;
	}
	var domain = this._getGroupDomainName();
	var legalDomains = this._legalDomains;
	for (var i = 0; i < legalDomains.length; i++) {
		if (legalDomains[i] == domain) {
			return true;
		}
	}
	return false;
};

ZmGroupView.prototype.isValidOwners =
function() {
	if (!this._contact.isDistributionList()) {
		return true;
	}
	return this._getDlOwners().length > 0
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
	return true;
};

//todo - really not sure why this way of having 3 methods with parallel values conditions is used here this way. I just continued to build on what was there, but should check if it can be simplified.
ZmGroupView.prototype.getInvalidItems =
function() {
	if (this.isValid()) {
		return [];
	}
	var items = [];
	if (this.isEmpty(true)) {
		items.push("members");
	}
	if (!this.isValidDlName()) {
		items.push("dlName");
	}
	if (!this.isValidDlDomainName()) {
		items.push("dlDomainName");
	}
	if (!this.isValidOwners()) {
		items.push("owners");
	}
	return items;
};

ZmGroupView.prototype.getErrorMessage = function(id) {
	if (this.isValid()) {
		return null;
	}
	if (id == "members") {
		return ZmMsg.errorMissingGroup;
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

};

ZmGroupView.prototype.enableInputs =
function(bEnable) {
	document.getElementById(this._groupNameId).disabled = !bEnable;
	if (this._contact.isDistributionList()) {
		document.getElementById(this._groupNameDomainId).disabled = !bEnable || this._legalDomains.length == 1;
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
	return [ZmMsg.zimbraTitle, ZmMsg.group].join(": ");
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
	this._groupListView.setSize(Dwt.DEFAULT, height-150);
	var fudge = (appCtxt.get(ZmSetting.GAL_ENABLED) || appCtxt.get(ZmSetting.SHARING_ENABLED))
		? 185 : 160;
	this._listview.setSize(Dwt.DEFAULT, height-fudge-(this._addNewField? 100 : 0));
};

ZmGroupView.prototype.cleanup  =
function() {
	for (var fieldId in this._searchField) {
		this._searchField[fieldId].value = "";
	}
	this._listview.removeAll(true);
	this._groupListView.removeAll(true);
	this._addButton.setEnabled(false);
	this._addAllButton.setEnabled(false);
	this._prevButton.setEnabled(false);
	this._nextButton.setEnabled(false);
	if (this._addNewField) {
		this._addNewField.value = '';
	}
};

ZmGroupView.prototype.search =
function() {
	var query;
	var queryHint = [];
	var conds = [];
	if (this._detailedSearch) {
		var nameQuery = this.getSearchFieldValue(ZmGroupView.SEARCH_NAME);
		var emailQuery = this.getSearchFieldValue(ZmGroupView.SEARCH_EMAIL);
		var deptQuery = this.getSearchFieldValue(ZmGroupView.SEARCH_DEPT);
		var phoneticQuery = this.getSearchFieldValue(ZmGroupView.SEARCH_PHONETIC);
		var isGal = this._searchInSelect && (this._searchInSelect.getValue() == ZmContactsApp.SEARCHFOR_GAL);
		query = nameQuery || "";
		if (emailQuery) {
			if (isGal) {
				conds.push([{attr:ZmContact.F_email, op:"has", value: emailQuery},
				{attr:ZmContact.F_email2, op:"has", value: emailQuery},
				{attr:ZmContact.F_email3, op:"has", value: emailQuery}]);
			} else {
				queryHint.push("to:"+emailQuery+"*");
			}
		}
		if (deptQuery && isGal) {
			conds.push({attr:ZmContact.F_department, op:"has", value: deptQuery});
		}
		if (phoneticQuery && !isGal) {
			var condArr = [];
			var phoneticQueryPieces = phoneticQuery.split(/\s+/);
			for (var i=0; i<phoneticQueryPieces.length; i++) {
				condArr.push("#"+ZmContact.F_phoneticFirstName + ":" + phoneticQueryPieces[i]);
				condArr.push("#"+ZmContact.F_phoneticLastName + ":" + phoneticQueryPieces[i]);
			}
			queryHint.push(condArr.join(" || "));
		}
	} else {
		query = this.getSearchFieldValue(ZmGroupView.SEARCH_BASIC);
	}

	if (this._searchInSelect) {
		var searchFor = this._searchInSelect.getValue();
		this._contactSource = (searchFor == ZmContactsApp.SEARCHFOR_CONTACTS || searchFor == ZmContactsApp.SEARCHFOR_PAS)
			? ZmItem.CONTACT
			: ZmId.SEARCH_GAL;
		if (searchFor == ZmContactsApp.SEARCHFOR_PAS) {
			queryHint.push(ZmSearchController.generateQueryForShares([ZmId.ITEM_CONTACT]) || "is:local");
		} else if (searchFor == ZmContactsApp.SEARCHFOR_CONTACTS) {
			queryHint.push("is:local");
		}
	} else {
		this._contactSource = appCtxt.get(ZmSetting.CONTACTS_ENABLED)
			? ZmItem.CONTACT
			: ZmId.SEARCH_GAL;

		if (this._contactSource == ZmItem.CONTACT) {
			queryHint.push("is:local");
		}
	}


    if (!query.length && this._contactSource == ZmId.SEARCH_GAL) {
		query = this._defaultQuery;
	}

    if (this._contactSource == ZmItem.CONTACT) {
        query = query.replace(/\"/g, '\\"');
        query = query ? "\"" + query + "\"":"";
    }

	var params = {
		obj: this,
		ascending: true,
		query: query,
		queryHint: queryHint.join(" "),
		conds: conds,
		offset: this._offset,
		respCallback: this._searchRespCallback
	};
	ZmContactsHelper.search(params);
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
	if (this._contact.isDistributionList()) {
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
	if (!fieldId && !this._detailedSearch)
		fieldId = ZmGroupView.SEARCH_BASIC;
	var field = this._searchField[fieldId];
	return field && AjxStringUtil.trim(field.value) || "";
};

ZmGroupView.prototype._createHtml =
function() {
	this._headerRowId = 		this._htmlElId + "_headerRow";
	this._titleId = 			this._htmlElId + "_title";
	this._tagsId = 				this._htmlElId + "_tags";
	this._groupNameId = 		this._htmlElId + "_groupName";
	if (this._contact.isDistributionList()) {
		this._groupNameDomainId = 		this._htmlElId + "_groupNameDomain";
		var email = this._contact.getEmail();
		this._legalDomains = [];
		var domain = null;
		if (email) {
			//this is editing an existing DL case
			var temp = email.split("@");
			domain = temp[1];
			this._legalDomains.push(domain);
		}
		var domains = appCtxt.createDistListAllowedDomains;
		for (var i = 0; i < domains.length; i++) {
			if (domains[i] == domain) {
				continue;
			}
			this._legalDomains.push(domains[i]);
		}

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
	var params = {
		id: this._htmlElId,
		showSearchIn: showSearchIn,
		detailed: this._detailedSearch,
		contact: this._contact,
		isEdit: true,
		addrbook: this._contact.getAddressBook()
	};
	this.getHtmlElement().innerHTML = AjxTemplate.expand("abook.Contacts#GroupView", params);
	this._htmlInitialized = true;
};

ZmGroupView.prototype._addWidgets =
function() {
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
	this._groupListView = new ZmGroupMembersListView(this);
	this._groupListView.reparentHtmlElement(this._htmlElId + "_groupMembers");
	this._groupListView.addSelectionListener(new AjxListener(this, this._groupMembersSelectionListener));
	this._groupListView.setUI(null, true);
	this._groupListView._initialized = true;
			
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
	this._locationButton.setEnabled(this._contact && !this._contact.isShared());
	this._locationButton.addSelectionListener(new AjxListener(this, this._handleFolderButton));
	var folderOrId = this._contact && this._contact.getAddressBook();
	if (!folderOrId) {
		var overview = appCtxt.getApp(ZmApp.CONTACTS).getOverview();
		folderOrId = overview && overview.getSelected();
		if (folderOrId && folderOrId.type != ZmOrganizer.ADDRBOOK) {
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

	this._searchField = {};
	this._searchRow = {};
	var fieldMap = {}, field, rowMap = {};
	if (this._detailedSearch) {
		fieldMap[ZmGroupView.SEARCH_NAME] = this._htmlElId + "_searchNameField";
		fieldMap[ZmGroupView.SEARCH_EMAIL] = this._htmlElId + "_searchEmailField";
		fieldMap[ZmGroupView.SEARCH_DEPT] = this._htmlElId + "_searchDepartmentField";
		fieldMap[ZmGroupView.SEARCH_PHONETIC] = this._htmlElId + "_searchPhoneticField";
		rowMap[ZmGroupView.SEARCH_NAME] = this._htmlElId + "_searchNameRow";
		rowMap[ZmGroupView.SEARCH_EMAIL] = this._htmlElId + "_searchEmailRow";
		rowMap[ZmGroupView.SEARCH_DEPT] = this._htmlElId + "_searchDepartmentRow";
		rowMap[ZmGroupView.SEARCH_PHONETIC] = this._htmlElId + "_searchPhoneticRow";
	} else {
		fieldMap[ZmGroupView.SEARCH_BASIC] = this._htmlElId + "_searchField";
		rowMap[ZmGroupView.SEARCH_BASIC] = this._htmlElId + "_searchRow";
	}
	for (var fieldId in fieldMap) {
		field = Dwt.byId(fieldMap[fieldId]);
		if (field) this._searchField[fieldId] = field;
	}
	for (var rowId in rowMap) {
		row = Dwt.byId(rowMap[rowId]);
		if (row) this._searchRow[rowId] = row;
	}
	this._updateSearchRows(this._searchInSelect && this._searchInSelect.getValue() || ZmContactsApp.SEARCHFOR_CONTACTS);
};

ZmGroupView.prototype._installKeyHandlers =
function() {
	var groupName = document.getElementById(this._groupNameId);
	Dwt.setHandler(groupName, DwtEvent.ONKEYUP, ZmGroupView._onKeyUp);
	Dwt.associateElementWithObject(groupName, this);

	if (this._contact.isDistributionList()) {
		var groupNameDomain = document.getElementById(this._groupNameDomainId);
		Dwt.setHandler(groupNameDomain, DwtEvent.ONKEYUP, ZmGroupView._onKeyUp);
		Dwt.associateElementWithObject(groupNameDomain, this);

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

ZmGroupView.prototype._getTabGroupMembers =
function() {
	var fields = [];
	fields.push(document.getElementById(this._groupNameId));
	if (this._contact.isDistributionList()) {
		fields.push(document.getElementById(this._groupNameDomainId));
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
	if (!this._noManualEntry) {
		fields.push(this._groupMembers);
	}
	for (var fieldId in this._searchField) {
		fields.push(this._searchField[fieldId]);
	}
	return fields;
};

ZmGroupView.prototype._getDefaultFocusItem =
function() {
	return document.getElementById(this._groupNameId);
};

ZmGroupView.prototype._getGroupMembers =
function() {
	var addrs = [];
	var data = this._groupListView._data;
	if (data) {
		for (var key in data) {
			var contact = data[key];
			if (contact && contact.type == DwtListView.TYPE_LIST_ITEM) {
			  if (contact.item.__contact && contact.item .__contact.isGal) {
			    addrs.push({type : ZmContact.GROUP_GAL_REF, value : contact.item.__contact.ref});		  
			  }
			  else if (contact.item.__contact && contact.item.__contact.id) {
				  addrs.push({type : ZmContact.GROUP_CONTACT_REF, value : contact.item.__contact.id});
			  }
			  else if (contact.item) {
				  addrs.push({type : ZmContact.GROUP_INLINE_REF, value : contact.item});
			  }
			}
			
		}
	}
	
	return addrs.length > 0 ? addrs : null;
};

ZmGroupView.prototype._getFolderId =
function() {
	return this._folderId || ZmFolder.ID_CONTACTS;
};

ZmGroupView.prototype._setGroupMembers =
function() {
	var members = this._contact.getGroupMembersObj();
	if (members) {
		var membersList = [];
		for (var i=0; i<members.length; i++) {
			var arr = AjxEmailAddress.parseEmailString(members[i].emailAddr);
			if (arr && arr.good.getArray()) {
				membersList.push(members[i]);
			}
		}

		this._setGroupMembersListView(membersList, false);
	}
};

ZmGroupView.prototype._setGroupName =
function() {
	var groupName = document.getElementById(this._groupNameId);
	if (groupName) {
		if (this._contact.isDistributionList()) {
			var domains = this._legalDomains;
			var email = this._contact.getEmail() || "@" + domains[0];
			var groupNameDomain = document.getElementById(this._groupNameDomainId);
			var temp = email.split("@");
			var emailUserName = temp[0];
			var emailDomainName = temp[1];
			groupName.value = emailUserName;
			groupNameDomain.value = emailDomainName;
			groupNameDomain.disabled = domains.length == 1
		}
		else {
			groupName.value = this._contact.getFileAs() || "";
		}
	}
};

ZmGroupView.prototype._setDlFields =
function() {
	var displayName = document.getElementById(this._dlDisplayNameId);
	var dlInfo = this._contact.dlInfo;
	displayName.value = dlInfo.displayName || "";

	var desc = document.getElementById(this._dlDescId);
	desc.value = dlInfo.description || "";

	var hideInGal = document.getElementById(this._dlHideInGalId);
	hideInGal.checked = dlInfo.hideInGal == "TRUE";

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
	if (!organizer || organizer.isReadOnly() || organizer.id == ZmFolder.ID_DLS) {
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

	// get sorted list of tags for this msg
	var ta = [];
	for (var i = 0; i < this._contact.tags.length; i++)
		ta.push(this._tagList.getById(this._contact.tags[i]));
	ta.sort(ZmTag.sortCompare);

	var html = [];
	var i = 0;
	for (var j = 0; j < ta.length; j++) {
		var tag = ta[j];
		if (!tag) continue;
		var icon = tag.getIconWithColor();
		html[i++] = AjxImg.getImageSpanHtml(icon, null, null, AjxStringUtil.htmlEncode(tag.name));
		html[i++] = "&nbsp;";
	}

	tagCell.innerHTML = html.join("");
};

// Consistent spot to locate various dialogs
ZmGroupView.prototype._getDialogXY =
function() {
	var loc = Dwt.toWindow(this.getHtmlElement(), 0, 0);
	return new DwtPoint(loc.x + ZmGroupView.DIALOG_X, loc.y + ZmGroupView.DIALOG_Y);
};

// Listeners

ZmGroupView.prototype._searchButtonListener =
function(ev) {
	this._offset = 0;
	this.search();
};


ZmGroupView.prototype._groupMembersSelectionListener =
function(ev){
	var selection = this._groupListView.getSelection();
	if (ev && ev.target && this._groupListView.delButtons[ev.target.id]) {
		this._delListener(ev);	
	}
	else if (ev && ev.target && this._groupListView.quickAddButtons[ev.target.id]) {
		if (AjxUtil.isArray(selection)) {
			var value = selection[0].value || selection[0];
			this.quickAddContact(value);
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

ZmGroupView.prototype._pageListener =
function(ev) {
	if (ev.item == this._prevButton) {
		this._offset -= ZmContactsApp.SEARCHFOR_MAX;
	} else {
		this._offset += ZmContactsApp.SEARCHFOR_MAX;
	}

	this.search();
};

ZmGroupView.prototype._delListener =
function(ev){

	if (ev.dwtObj) {
		var items = this._groupListView.getSelection();
		var list = this._groupListView.getSelectedItems();

		while (list.get(0)) {
			this._groupListView.removeItem(list.get(0));
			list = this._groupListView.getSelectedItems();
		}

		for (var i = 0;  i < items.length; i++) {
			this._groupListView.getList().remove(items[i]);
			var type = items[i].type;
			var value = items[i].value;
			if (type != ZmContact.GROUP_INLINE_REF && type != ZmContact.GROUP_CONTACT_REF && type != ZmContact.GROUP_GAL_REF) {
				if (items[i].__contact) {
					type = items[i].__contact.isGal ? ZmContact.GROUP_GAL_REF : ZmContact.GROUP_CONTACT_REF;
				}
				else {
					type = ZmContact.GROUP_INLINE_REF;
				}	
			} 
			
			if (items[i].value && !this._groupMemberMods[items[i].value]) {
				this._groupMemberMods[items[i].value] = {op : "-", value : items[i].value, email: items[i].address, type : type};
			}
			else {
				//contact added but not yet saved
				if (items[i].__contact) {
					value = items[i].__contact.getId(!items[i].__contact.isGal);		
				}
				else {
					value = items[i]; //inline added but then deleted
				}
				this._groupMemberMods[value] = {};
			}
			
		}
	} else {
		this._groupMemberMods = {}; //clear the mods since we are removing all and reload it
		var list = this._groupListView.getList().getArray();
		for (var i=0; i< list.length; i++) {
			var type = list[i].type;
			if (type != ZmContact.GROUP_INLINE_REF && type != ZmContact.GROUP_CONTACT_REF && type != ZmContact.GROUP_GAL_REF) {
				if (list[i].__contact) {
					type = list[i].__contact.isGal ? ZmContact.GROUP_GAL_REF : ZmContact.GROUP_CONTACT_REF;	
				}
				else {
					type = ZmContact.GROUP_INLINE_REF;
				}
			}
			this._groupMemberMods[list[i].value] = {op : "-", value : list[i].value, type : type};		
		}
		this._groupListView.removeAll(true);
		this._groupListView.getList().removeAll();
	}

	this._groupMembersSelectionListener();
	this._isDirty = true;
};

ZmGroupView.prototype._addNewListener =
function(ev){
	var emailStr = this._addNewField.value;
	if (!emailStr || emailStr == '') { return; }

	var addrs = AjxEmailAddress.parseEmailString(emailStr);
	if (addrs && addrs.all) {
		var goodArry = addrs.all.getArray();
		var goodAddr = [];
		for (var i = 0; i < goodArry.length; i++) {
			goodAddr[i] = goodArry[i].toString();
		}
		ZmGroupView._dedupe(goodAddr, this._groupListView.getList().getArray());
		this._setGroupMembersListView(goodAddr, true);
	}

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
		if (list[i].isGroup) {
			if (list[i].__contact) {
				var groups = list[i].__contact.attr[ZmContact.F_groups];
				if (groups && groups.length > 0) {
					for (var j=0; j < groups.length; j++) {
						var id = groups[j].value;
						var contact = ZmContact.getContactFromCache(id);
						if (contact) {
							var obj = {__contact : contact};							
						}
						else {
							var obj = id;
						}
						items.push(obj);
					}	
				}
				else {
					var contact = list[i].__contact;
					var obj = {};
					obj.__contact = contact;
					obj.address = list[i].address;
					items.push(obj);
				}
			}	
		} else {
			items.push(list[i]);
		}
	}

	ZmGroupView._dedupe(items, this._groupListView.getList().getArray());
	if (items.length > 0) {
		this._setGroupMembersListView(items, true);
	}
};

ZmGroupView.prototype._setGroupMembersListView =
function(list, append){
	if (append) {
		for (var i=0; i<list.length; i++) {
			if (list[i] && list[i].__contact) {
				var type = list[i].__contact.isGal ? ZmContact.GROUP_GAL_REF : ZmContact.GROUP_CONTACT_REF;
				var id = type == ZmContact.GROUP_CONTACT_REF ? list[i].__contact.getId(true) : list[i].__contact.ref;
				var email = list[i].address;
				if (!this._groupMemberMods[id]) {
					this._groupMemberMods[id] = {op : "+", value : id, type : type, email: email};
				}
				else {
					var obj = this._groupMemberMods[id];
					if (obj.op == "-") {
						//contact is already in the group, clear the value
						this._groupMemberMods[id] = {};
					}
				}
			}
			else {
				//inline member
				this._groupMemberMods[list[i]] = {op : "+", value : list[i], email: list[i], type : ZmContact.GROUP_INLINE_REF};
			}
		}
		var membersList = this._groupListView.getList();
		list = list.concat( membersList ? membersList.getArray() : [] );
	}
	this._groupListView.set(AjxVector.fromArray(list));
	this._isDirty = true;
};

/**
 * Removes members from items if the are found to be duplicate of addrs.  Dedupes inline, local and gal contacts
 * @param items {Array} array of items to be added to the target list 
 * @param addrs {Array} the target list as an array of items
 * @private
 */
ZmGroupView._dedupe =
function(items, addrs) {
	if (addrs) {
		var i = 0;
		while (true) {
			var found = false;
			for (var j = 0; j < addrs.length; j++) {
				var value = addrs[j].value || addrs[j];
				var type = addrs[j].type || ZmContact.GROUP_INLINE_REF;
				if (addrs[j].__contact) {
					type = addrs[j].__contact.isGal ? ZmContact.GROUP_GAL_REF : ZmContact.GROUP_CONTACT_REF;
					value = addrs[j].__contact.getId(type == ZmContact.GROUP_CONTACT_REF);
				}
				if (type != ZmContact.GROUP_INLINE_REF && value == (items[i].__contact && items[i].__contact.getId(type == ZmContact.GROUP_CONTACT_REF))) {
					items.splice(i, 1);
					found = true;
					break;
				}
				else if (type == ZmContact.GROUP_INLINE_REF && value == items[i]) {
					items.splice(i, 1);
					found = true;
					break;
				}
			}
			if (!found) i++;
			if (i == items.length) break;
		}
	}
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

ZmGroupView.prototype._handleResponseSearch =
function(result) {
	var resp = result.getResponse();

	var more = resp.getAttribute("more");
	this._prevButton.setEnabled(this._offset > 0);
	this._nextButton.setEnabled(more);

	var list = ZmContactsHelper._processSearchResponse(resp);
	this._listview.setItems(list);
	this._resetSearchColHeaders();

	this._addButton.setEnabled(list.length > 0);
	this._addAllButton.setEnabled(list.length > 0);

	this._searchButton.setEnabled(true);
};

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
	var fieldIds = (searchFor == ZmContactsApp.SEARCHFOR_GAL) ? ZmGroupView.SHOW_ON_GAL : ZmGroupView.SHOW_ON_NONGAL;
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
	if (DwtKeyMapMgr.hasModifier(ev) || DwtKeyMap.IS_MODIFIER[key] ||	key == DwtKeyMapMgr.TAB_KEYCODE) { return; }

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
	if (contact) {
		var selection = this._groupListView.getSelection();
		if (AjxUtil.isArray(selection)) {
			var value = selection[0].value || selection[0];
			if (!this._groupMemberMods[value]) {
				this._groupMemberMods[value] = {op : "-", value : value, type : ZmContact.GROUP_INLINE_REF};
			}
			else {
				this._groupMemberMods[value] = {};
			}
			var list = this._groupListView.getSelectedItems();
			this._groupListView.removeItem(list.get(0));
			this._groupListView.getList().remove(selection[0]);
		}
		var obj = {};
		obj.__contact = contact;
		obj.address = contact.getEmail();
		obj.type = ZmContact.GROUP_CONTACT_REF;
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
							headerList:this._getHeaderList(parent), view:parent._view});
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
		(new DwtListHeaderItem({field:ZmItem.F_NAME,	text:ZmMsg._name,	width:ZmMsg.COLUMN_WIDTH_NAME_CN})),
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
		var addr = item.address ? item.address : item;
		if ((item.__contact && item.__contact instanceof ZmContact) || (item.type == ZmContact.GROUP_GAL_REF || item.type == ZmContact.GROUP_CONTACT_REF)) {
			var contact = item.__contact || ZmContact.getContactFromCache(item.value);
			if (!contact) {
				data.email = AjxStringUtil.htmlEncode(addr);
				html[idx++] = AjxTemplate.expand("abook.Contacts#SplitView_group", data);
				return idx;
			}
			data.imageUrl = contact.getImageUrl();
			data.email = AjxStringUtil.htmlEncode(contact.getEmail());
			data.title = contact.getAttr(ZmContact.F_jobTitle);
			data.phone = contact.getPhone();
			data.imgClassName = "Person_48";
			var isPhonetic  = appCtxt.get(ZmSetting.PHONETIC_CONTACT_FIELDS);
			var fullnameHtml= contact.getFullNameForDisplay(isPhonetic);
			if (!isPhonetic) {
				fullnameHtml = AjxStringUtil.htmlEncode(fullnameHtml);
			}
			data.fullName = fullnameHtml;
			html[idx++] = AjxTemplate.expand("abook.Contacts#SplitView_group", data);
		}
		else {
			data.imgClassName = "PersonInline_48";
			data.email = AjxStringUtil.htmlEncode(addr);
			data.isInline = true;
			data.quickAddId = Dwt.getNextId("QuickAdd_");
			this.quickAddButtons[data.quickAddId] = true;
			html[idx++] = AjxTemplate.expand("abook.Contacts#SplitView_group", data);
		}
		
	}
	return idx;
};


// override from base class since it is handled differently
ZmGroupMembersListView.prototype._getItemId =
function(item) {
	return (item && item.id) ? item.id : Dwt.getNextId();
};
