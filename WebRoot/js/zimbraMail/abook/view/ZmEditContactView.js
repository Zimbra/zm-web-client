/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2009, 2010 Zimbra, Inc.
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
 * This file contains the edit contact view classes.
 */

/**
 * Creates the edit contact view.
 * @class
 * This class represents the edit contact view.
 * 
 * @param	{DwtComposite}	parent		the parent
 * @param	{ZmContactController}		controller		the controller
 * 
 * @extends		DwtForm
 */
ZmEditContactView = function(parent, controller) {
	if (arguments.length == 0) return;

	var form = {
		ondirty: this._handleDirty,
		items: this.getFormItems()
	};

	var params = {
		id: "editcontactform",
		parent: parent,
		className: "ZmEditContactView",
		posStyle: DwtControl.ABSOLUTE_STYLE,
		form: form
	};
	DwtForm.call(this, params);

	// add details menu, if needed
	var details = this.getControl("DETAILS");
	if (details) {
		var menu = this.__getDetailsMenu();
		if (menu) {
			details.setMenu(menu);
			details.addSelectionListener(new AjxListener(details, details.popup, [menu]));
		}
		else {
			this.setVisible("DETAILS", false);
		}
	}

	// save other state
	this._controller = controller;

	this._tagList = appCtxt.getTagTree();
	this._tagList.addChangeListener(new AjxListener(this, this._tagChangeListener));
	this._changeListener = new AjxListener(this, this._contactChangeListener);

	this.setScrollStyle(Dwt.SCROLL);
};

ZmEditContactView.prototype = new DwtForm;
ZmEditContactView.prototype.constructor = ZmEditContactView;

/**
 * Returns a string representation of the object.
 * 
 * @return		{String}		a string representation of the object
 */
ZmEditContactView.prototype.toString = function() {
	return "ZmEditContactView";
};

// form information that you can override

/**
 * Gets the form items.
 * 
 * @return	{Hash}	a hash of form items
 */
ZmEditContactView.prototype.getFormItems = function() {
	if (!this._formItems) {
		this._formItems = [
			// debug
	//			{ id: "DEBUG", type: "DwtText", ignore:true },
			// header pseudo-items
			{ id: "FULLNAME", type: "DwtText", className: "contactHeader",
				getter: this._getFullName, notab: true, ignore: true },
			// contact attribute fields
			{ id: "IMAGE", type: "ZmEditContactViewImage" },
			{ id: "PREFIX", type: "DwtInputField", cols: 5,  hint: ZmMsg.AB_FIELD_prefix, visible: "get('SHOW_PREFIX')" },
			{ id: "FIRST", type: "DwtInputField", cols: 10, hint: ZmMsg.AB_FIELD_firstName, visible: "get('SHOW_FIRST')" },
			{ id: "MIDDLE", type: "DwtInputField", cols: 10, hint: ZmMsg.AB_FIELD_middleName, visible: "get('SHOW_MIDDLE')" },
			{ id: "MAIDEN", type: "DwtInputField", cols: 15, hint: ZmMsg.AB_FIELD_maidenName, visible: "get('SHOW_MAIDEN')" },
			{ id: "LAST", type: "DwtInputField", cols: 15, hint: ZmMsg.AB_FIELD_lastName, visible: "get('SHOW_LAST')" },
			{ id: "SUFFIX", type: "DwtInputField", hint: ZmMsg.AB_FIELD_suffix, cols: 5, visible: "get('SHOW_SUFFIX')" },
			{ id: "NICKNAME", type: "DwtInputField", cols: 10, hint: ZmMsg.AB_FIELD_nickname, visible: "get('SHOW_NICKNAME')" },
			{ id: "COMPANY", type: "DwtInputField", cols: 35, hint: ZmMsg.AB_FIELD_company, visible: "get('SHOW_COMPANY')" },
			{ id: "TITLE", type: "DwtInputField", cols: 35, hint: ZmMsg.AB_FIELD_jobTitle, visible: "get('SHOW_TITLE')" },
			{ id: "DEPARTMENT", type: "DwtInputField", cols: 35, hint: ZmMsg.AB_FIELD_department, visible: "get('SHOW_DEPARTMENT')" },
			{ id: "NOTES", type: "DwtInputField", cols: (AjxEnv.isMozilla ? 58 : 60), rows:4 },
			// contact list fields
			{ id: "EMAIL", type: "ZmEditContactViewInputSelectRows", rowitem: {
				type: "ZmEditContactViewInputSelect", equals:ZmEditContactViewInputSelect.equals, params: {
					hint: ZmMsg.emailAddrHint, cols: 40, options: this.getEmailOptions()
				}
			} },
			{ id: "PHONE", type: "ZmEditContactViewInputSelectRows", rowitem: {
				type: "ZmEditContactViewInputSelect", equals:ZmEditContactViewInputSelect.equals, params: {
					hint: ZmMsg.phoneNumberHint, cols : 60, options: this.getPhoneOptions()
				}
			} },
			{ id: "IM", type: "ZmEditContactViewInputSelectRows", rowitem: {
				type: "ZmEditContactViewIM", equals: ZmEditContactViewIM.equals, params: {
					hint: ZmMsg.imScreenNameHint, cols: 60, options: this.getIMOptions()
				}
			} },
			{ id: "ADDRESS", type: "ZmEditContactViewInputSelectRows",
				rowtemplate: "abook.Contacts#ZmEditContactViewAddressRow",
				rowitem: { type: "ZmEditContactViewAddress", equals: ZmEditContactViewAddress.equals,
					params: { options: this.getAddressOptions() }
				}
			},
			{ id: "URL", type: "ZmEditContactViewInputSelectRows", rowitem: {
				type: "ZmEditContactViewInputSelect", equals:ZmEditContactViewInputSelect.equals, params: {
					cols: 60, hint: ZmMsg.url, options: this.getURLOptions()
				}
			} },
			{ id: "OTHER", type: "ZmEditContactViewInputSelectRows", rowitem: {
				type: "ZmEditContactViewOther", equals:ZmEditContactViewInputSelect.equals, params: {
					cols: 30, hint: ZmMsg.genericTextHint, options: this.getOtherOptions()
				}
			}, validator: ZmEditContactViewOther.validator },
			// other controls
			{ id: "DETAILS", type: "DwtButton", label: "\u00BB", ignore:true,  // &raquo;
				className: "ZmEditContactViewDetailsButton",
				template: "abook.Contacts#ZmEditContactViewDetailsButton"
			},
			{ id: "FILE_AS", type: "DwtSelect", onchange: this._handleFileAsChange, items: this.getFileAsOptions() },
			{ id: "FOLDER", type: "DwtButton", image: "ContactsFolder",
				enabled: "this._contact && !this._contact.isShared()",
				onclick: this._handleFolderButton
			},
			{ id: "TAG", type: "DwtControl",
				enabled: "this._contact && !this._contact.isShared()",
				visible: "appCtxt.get(ZmSetting.TAGGING_ENABLED)"
			},
			{ id: "ACCOUNT", type: "DwtLabel",
				visible: "appCtxt.multiAccounts"
			},
			// NOTE: Return false onclick to prevent default action
			{ id: "VIEW_IMAGE", ignore: true, onclick: "open(get('IMAGE')) && false", visible: "get('IMAGE')" },
			{ id: "REMOVE_IMAGE", ignore: true, onclick: "set('IMAGE','') && false", visible: "get('IMAGE')" },
			// pseudo-items
			{ id: "JOB", notab: true, ignore:true, visible: "get('SHOW_TITLE') && get('SHOW_DEPARTMENT')" },
			{ id: "TITLE_DEPARTMENT_SEP", notab: true,
				ignore:true, visible: "get('SHOW_TITLE') && get('SHOW_DEPARTMENT')"
			}
		];
	}
	return this._formItems;
};

/**
 * Gets the form item with the given id.
 * <p>
 * <strong>Note:</strong>
 * This method is especially useful as a way to modify the default
 * set of form items without redeclaring the entire form declaration.
 *
 * @param {String}	id        [string] Form item identifier.
 * @param {Array}	[formItems] the list of form items. If not
 *                           specified, the form items array returned
 *                           by {@link #getFormItems} is used.
 *                           
 * @return	{Array}	the form items or <code>null</code> for none
 */
ZmEditContactView.prototype.getFormItemById = function(id, formItems) {
	formItems = formItems || this.getFormItems() || [];
	for (var i = 0; i < formItems.length; i++) {
		var item = formItems[i];
		if (item.id == id) return item;
	}
	return null;
};

/**
 * Gets the email options.
 * 
 * @return	{Object}	returns <code>null</code>
 */
ZmEditContactView.prototype.getEmailOptions = function() {
	return null;
};

/**
 * Gets the phone options.
 * 
 * @return	{Array}	an array of phone options
 */
ZmEditContactView.prototype.getPhoneOptions = function() {
	return [
		{ value: ZmContact.F_mobilePhone, label: ZmMsg.phoneLabelMobile },
		{ value: ZmContact.F_workPhone, label: ZmMsg.phoneLabelWork },
		{ value: ZmContact.F_workFax, label: ZmMsg.phoneLabelWorkFax },
//		{ value: "office", label: ZmMsg.office },
		{ value: ZmContact.F_companyPhone, label: ZmMsg.phoneLabelCompany },
		{ value: ZmContact.F_homePhone, label: ZmMsg.phoneLabelHome },
		{ value: ZmContact.F_homeFax, label: ZmMsg.phoneLabelHomeFax },
		{ value: ZmContact.F_pager, label: ZmMsg.phoneLabelPager },
		{ value: ZmContact.F_callbackPhone, label: ZmMsg.phoneLabelCallback },
		{ value: ZmContact.F_assistantPhone, label: ZmMsg.phoneLabelAssistant },
		{ value: ZmContact.F_carPhone, label: ZmMsg.phoneLabelCar },
		{ value: ZmContact.F_otherPhone, label: ZmMsg.phoneLabelOther },
		{ value: ZmContact.F_otherFax, label: ZmMsg.phoneLabelOtherFax }
	];
};

/**
 * Gets the IM options.
 * 
 * @return	{Array}	an array of IM options
 */
ZmEditContactView.prototype.getIMOptions = function() {
	return [
		{ value: "local", label: ZmMsg.imGateway_xmpp },
		{ value: "yahoo", label: ZmMsg.imGateway_yahoo },
		{ value: "aol", label: ZmMsg.imGateway_aol },
		{ value: "msn", label: ZmMsg.imGateway_msn },
		{ value: "other", label: ZmMsg.other }
	];
};

/**
 * Gets the address options.
 * 
 * @return	{Array}	an array of address options
 */
ZmEditContactView.prototype.getAddressOptions = function() {
	return [
		{ value: "home", label: ZmMsg.home },
		{ value: "work", label: ZmMsg.work },
		{ value: "other", label: ZmMsg.other }
	];
};

/**
 * Gets the URL options.
 * 
 * @return	{Array}	an array of URL options
 */
ZmEditContactView.prototype.getURLOptions = function() {
	return [
		{ value: ZmContact.F_homeURL, label: ZmMsg.home },
		{ value: ZmContact.F_workURL, label: ZmMsg.work },
		{ value: ZmContact.F_otherURL, label: ZmMsg.other }
	];
};

/**
 * Gets the other options.
 * 
 * @return	{Array}	an array of other options
 */
ZmEditContactView.prototype.getOtherOptions = function() {
	return [
		{ value: ZmContact.F_birthday, label: ZmMsg.AB_FIELD_birthday },
		{ value: ZmContact.F_anniversary, label: ZmMsg.AB_FIELD_anniversary },
		{ value: "custom", label: ZmMsg.AB_FIELD_custom }
	];
};

/**
 * Gets the "file as" options.
 * 
 * @return	{Array}	an array of "file as" options
 */
ZmEditContactView.prototype.getFileAsOptions = function() {
	return [
		{ value: ZmContact.FA_LAST_C_FIRST, label: ZmMsg.AB_FILE_AS_lastFirst },
		{ value: ZmContact.FA_FIRST_LAST, label: ZmMsg.AB_FILE_AS_firstLast },
		{ value: ZmContact.FA_COMPANY, label: ZmMsg.AB_FILE_AS_company },
		{ value: ZmContact.FA_LAST_C_FIRST_COMPANY, label: ZmMsg.AB_FILE_AS_lastFirstCompany },
		{ value: ZmContact.FA_FIRST_LAST_COMPANY, label: ZmMsg.AB_FILE_AS_firstLastCompany },
		{ value: ZmContact.FA_COMPANY_LAST_C_FIRST, label: ZmMsg.AB_FILE_AS_companyLastFirst },
		{ value: ZmContact.FA_COMPANY_FIRST_LAST, label: ZmMsg.AB_FILE_AS_companyFirstLast }
		// TODO: [Q] ZmContact.FA_CUSTOM ???
	];
};

//
// Constants
//

// Message dialog placement
ZmEditContactView.DIALOG_X = 50;
ZmEditContactView.DIALOG_Y = 100;

ZmEditContactView.SHOW_ID_PREFIXES = [
	"PREFIX","FIRST","MIDDLE","MAIDEN","LAST","SUFFIX","NICKNAME","TITLE","DEPARTMENT","COMPANY"
];
ZmEditContactView.SHOW_ID_LABELS = [
	ZmMsg.AB_FIELD_prefix,
	ZmMsg.AB_FIELD_firstName,
	ZmMsg.AB_FIELD_middleName,
	ZmMsg.AB_FIELD_maidenName,
	ZmMsg.AB_FIELD_lastName,
	ZmMsg.AB_FIELD_suffix,
	ZmMsg.AB_FIELD_nickname,
	ZmMsg.AB_FIELD_jobTitle,
	ZmMsg.AB_FIELD_department,
	ZmMsg.AB_FIELD_company
];

ZmEditContactView.ALWAYS_SHOW = {
	FIRST: true, LAST: true, TITLE: true, COMPANY: true
};

ZmEditContactView.ATTRS = {
	FILE_AS: ZmContact.F_fileAs,
	FOLDER: ZmContact.F_folderId,
	IMAGE: ZmContact.F_image,
	PREFIX: ZmContact.F_namePrefix,
	SUFFIX: ZmContact.F_nameSuffix,
	MAIDEN: ZmContact.F_maidenName,
	FIRST: ZmContact.F_firstName,
	MIDDLE: ZmContact.F_middleName,
	LAST: ZmContact.F_lastName,
	NICKNAME: ZmContact.F_nickname,
	TITLE: ZmContact.F_jobTitle,
	DEPARTMENT: ZmContact.F_department,
	COMPANY: ZmContact.F_company,
	NOTES: ZmContact.F_notes
};

ZmEditContactView.updateFieldLists = function() {

ZmEditContactView.LISTS = {
	ADDRESS: {attrs:ZmContact.ADDRESS_FIELDS}, // NOTE: placeholder for custom handling
	EMAIL: {attrs:ZmContact.EMAIL_FIELDS, onlyvalue:true},
	PHONE: {attrs:ZmContact.PHONE_FIELDS},
	IM: {attrs:ZmContact.IM_FIELDS, onlyvalue:true},
	URL: {attrs:ZmContact.URL_FIELDS},
	OTHER: {attrs:ZmContact.OTHER_FIELDS}
};

}; // updateFieldLists
ZmEditContactView.updateFieldLists();

ZmEditContactView.ADDR_PREFIXES = ["work","home","other"];
ZmEditContactView.ADDR_SUFFIXES = ["Street","City","State","PostalCode","Country"];

//
// Data
//

ZmEditContactView.prototype.TEMPLATE = "abook.Contacts#ZmEditContactView";

//
// Public methods
//

/**
 * Sets the contact.
 * 
 * @param	{ZmContact}	contact		the contact
 * @param	{Boolean}	isDirty		<code>true</code> if the contact is dirty
 */
ZmEditContactView.prototype.set = function(contact, isDirty) {
	if (typeof arguments[0] == "string") {
		DwtForm.prototype.set.apply(this, arguments);
		return;
	}

	// save contact
	this._contact = contact;

	// fill in base fields
	for (var id in ZmEditContactView.ATTRS) {
		var value = contact.getAttr(ZmEditContactView.ATTRS[id]);
		if (id == "FOLDER") {
			continue;
		}
		if (id == "FILE_AS") {
			value = value || ZmContact.FA_LAST_C_FIRST;
		}
		this.setValue(id, value);
	}
	this.setValue("IMAGE", (contact && contact.getImageUrl()) || "", true);
	
	// fill in folder field
	if (this.getControl("FOLDER")) {
		var folderOrId = contact && contact.getAddressBook();
		if (!folderOrId) {
			var overview = appCtxt.getApp(ZmApp.CONTACTS).getOverview();
			folderOrId = overview && overview.getSelected();
			if (folderOrId && folderOrId.type != ZmOrganizer.ADDRBOOK) {
				folderOrId = null;
			}
		}
		this._setFolder(folderOrId || ZmOrganizer.ID_ADDRBOOK);
	}

	if (this.getControl("TAG"))
		this._setTags(contact);

	// check show detail items for fields with values
	for (var id in ZmEditContactView.ATTRS) {
		var showId = "SHOW_"+id;
		var control = this.getControl(showId);
		if (control == null) continue;
		var checked = id in ZmEditContactView.ALWAYS_SHOW || (this.getValue(id) || "") != "";
		this.setValue(showId, checked);
		control.setChecked(checked, true); // skip notify
	}

	// populate lists
	this._listAttrs = {};
	var nattrs = contact.getNormalizedAttrs();
	for (var id in ZmEditContactView.LISTS) {
		switch (id) {
			case "ADDRESS": {
				this.__initRowsAddress(nattrs, id, this._listAttrs);
				break;
			}
			case "OTHER": {
				var list = ZmEditContactView.LISTS[id];
				this.__initRowsOther(nattrs, id, list.attrs, list.onlyvalue, this._listAttrs);
				break;
			}
			default: {
				var list = ZmEditContactView.LISTS[id];
				this.__initRowsControl(nattrs, id, list.attrs, list.onlyvalue, this._listAttrs);
			}
		}
	}

	// mark form as clean and update display
	if (!isDirty) {
		this.reset(true);
	}
	this._handleDirty();
	this.update();

	// listen to changes in the contact
	if (contact) {
		contact.removeChangeListener(this._changeListener);
	}
	contact.addChangeListener(this._changeListener);

	// notify zimlets that a new contact is being shown.
	appCtxt.notifyZimlets("onContactEdit", [this, this._contact, this._htmlElId]);
};

/**
 * Gets the contact.
 * 
 * @return	{ZmContact}	the contact
 */
ZmEditContactView.prototype.getContact = function() {
	return this._contact;
};

/**
 * Gets the modified attributes.
 * 
 * @return	{Hash}	a hash of attributes
 */
ZmEditContactView.prototype.getModifiedAttrs = function() {
	var itemIds = this.getDirtyItems();
	var counts = {};
	var attributes = {};

	// get list of modified attributes
	for (var i = 0; i < itemIds.length; i++) {
		var id = itemIds[i];
		if (id == "ACCOUNT") { continue; }
		var value = this.getValue(id);
		if (id in ZmEditContactView.LISTS) {
			var items = value;
			for (var j = 0; j < items.length; j++) {
				var item = items[j];
				if (id == "ADDRESS") {
					var prefix = item.type;
					var address = null;
					var needsClear = true;
					for (var p in item) {
						if (p == "type") continue;
						var v = item[p];
						if (!v) continue;
						var a = prefix+p;
						if (!counts[a]) counts[a] = 0;
						var count = ++counts[a];
						a = count > 1 ? a+count : a;
						if (needsClear) {
							ZmEditContactView.__clearAddressAttributes(attributes,prefix,count);
							needsClear = false;
						}
						attributes[a] = v;
					}
				} else {
					var onlyvalue = ZmEditContactView.LISTS[id] && ZmEditContactView.LISTS[id].onlyvalue;
					var v = onlyvalue ? item : item.value;
					if (!v) continue;
					var list = ZmEditContactView.LISTS[id];
					var a = onlyvalue ? list.attrs[0] : item.type;
					if (!counts[a]) counts[a] = 0;
					var count = ++counts[a];
					a = ZmContact.getAttributeName(a, count);
					attributes[a] = v;
				}
			}
		}
		else {
			var a = ZmEditContactView.ATTRS[id];
			attributes[a] = value;
		}
	}

	// compare against existing fields
	var anames = AjxUtil.keys(attributes);
	var listAttrs = this._listAttrs;
	for (var id in listAttrs) {
		if (!this.isDirty(id)) continue;
		var prefixes = AjxUtil.uniq(AjxUtil.map(listAttrs[id], ZmEditContactView.__trimNumber));
		for (var i = 0; i < prefixes.length; i++) {
			// clear fields from original contact from normalized attr names
			var attrs = AjxUtil.keys(this._contact.getAttrs(prefixes[i]));
			var complement = AjxUtil.complement(anames, attrs);
			for (var j = 0; j < complement.length; j++) {
				attributes[complement[j]] = "";
			}
		}
	}

	// was anything modified?
	if (AjxUtil.keys(attributes).length == 0) {
		return null;
	}

	// make sure we set the folder (when new)
	if (!attributes[ZmContact.F_folderId] && !this._contact.isShared()) {
		attributes[ZmContact.F_folderId] = this.getValue("FOLDER");
	}

	// set the value for IMAGE to just the attachment id
	if (attributes[ZmContact.F_image]) {
		var value = this.getValue("IMAGE");
		var m = /aid=(.*)/.exec(value);
		if (m) {
			// NOTE: ZmContact.modify expects the "aid_" prefix.
			attributes[ZmContact.F_image] = "aid_"+m[1];
		}
	}

	// trim everything
	for (var a in attributes) {
		if (AjxUtil.isString(attributes[a])) {
			attributes[a] = AjxStringUtil.trim(attributes[a]);
		}
	}

	return attributes;
};

/**
 * @private
 */
ZmEditContactView.__trimNumber = function(s) {
	return s.replace(/\d+$/,"");
};

/**
 * Checks if the view is empty.
 * 
 * @return	{Boolean}	<code>true</code> if the view is empty
 */
ZmEditContactView.prototype.isEmpty = function(items) {
	items = items || this._items;
	for (var id in items) {
		var item = items[id];
		if (this.isIgnore(id) || id == "FILE_AS") continue;
		var value = this.getValue(id);
		if (value) {
			if (!AjxUtil.isArray(value)) {
				if (id == "FOLDER") {
					if (value != item.ovalue) return false;
				} else {
					if (value !== "") return false;
				}
			} else {
				for (var i=0; i<value.length; i++) {
					var valueitem = value[i];
					if (valueitem) {
						if (id=="ADDRESS") {
							if (!ZmEditContactViewAddress.equals(valueitem, {type: valueitem.type})) return false;
						} else {
							if (!(valueitem.value==="" || valueitem==="")) return false;
						}
					}
				}
			}
		}
	}
	return true;
};

/**
 * @private
 */
ZmEditContactView.prototype.enableInputs = function(bEnable) {
	// ignore
};

/**
 * Cleanup the view.
 * 
 */
ZmEditContactView.prototype.cleanup = function() {
	this._contact = null;
};

ZmEditContactView.prototype._setTags =
function(contactOrTagIds) {
	var tagControl = this.getControl("TAG");
	if (tagControl) {
		if (contactOrTagIds === undefined) // contactOrTagIds can also be an empty array, so just checking for a falsy value should not happen here
			contactOrTagIds = this._contact;
		var tagIds = (contactOrTagIds instanceof ZmContact) ? contactOrTagIds.tags : contactOrTagIds;

		tagControl.clearContent();
		if (tagIds && tagIds.length) {
			tagControl.setContent(this._getTagHtml(tagIds));
			tagControl.setVisible(true);
		} else {
			tagControl.setVisible(false);
		}
	}
};

ZmEditContactView.prototype._getTagHtml =
function(tagIds) {
	var html = [];
	var idx = 0;
	var tagCellId = this.getControl("TAG").getHTMLElId();

	// get sorted list of tags for this msg
	var tags = [];
	for (var i = 0; i < tagIds.length; i++) {
		tags.push(appCtxt.getById(tagIds[i]));
	}
	tags.sort(ZmTag.sortCompare);

	for (var j = 0; j < tags.length; j++) {
		var tag = tags[j];
		if (!tag) { continue; }
		var icon = ZmTag.COLOR_ICON[tag.color];
		var attr = ["id='", tagCellId, tag.id, "'"].join("");
		// XXX: set proper class name for link once defined!
		html[idx++] = "<a href='javascript:;' class='' onclick='ZmEditContactView._tagClicked(";
		html[idx++] = '"';
		html[idx++] = tag.id;
		html[idx++] = '"';
		html[idx++] = "); return false;'>";
		html[idx++] = AjxImg.getImageSpanHtml(icon, null, attr, tag.name);
		html[idx++] = "</a>&nbsp;";
	}
	return html.join("");
};

ZmEditContactView._tagClicked =
function() {
	ZmContactSplitView._tagClicked.apply(this, arguments);
};

//
// ZmListController methods
//

/**
 * Gets the list.
 * 
 * @return	{ZmContactList}	the list	
 */
ZmEditContactView.prototype.getList = function() { return null; };

/**
 * Gets the controller.
 * 
 * @return	{ZmContactController}	the controller
 */
ZmEditContactView.prototype.getController = function() {
	return this._controller;
};

// Following two overrides are a hack to allow this view to pretend it's a list view
ZmEditContactView.prototype.getSelection = function() {
	return this.getContact();
};

ZmEditContactView.prototype.getSelectionCount = function() {
	return 1;
};

/**
 * Gets the title.
 * 
 * @return	{String}	the title
 */
ZmEditContactView.prototype.getTitle = function() {
	return [ZmMsg.zimbraTitle, ZmMsg.contact].join(": ");
};

//
// ZmListView methods
//

ZmEditContactView.prototype._checkItemCount = function() {};
ZmEditContactView.prototype._handleResponseCheckReplenish = function() {};

//
// Protected methods
//

/**
 * @private
 */
ZmEditContactView.prototype._getFullName = function() {
	var contact = {
		fileAs: this.getValue("FILE_AS"),
		firstName: this.getValue("FIRST"), lastName: this.getValue("LAST"),
		company: this.getValue("COMPANY")
	};
	return ZmContact.computeFileAs(contact) || ZmMsg.noName;
};

/**
 * @private
 */
ZmEditContactView.prototype._getDefaultFocusItem = function() {
	return this.getControl("FIRST");
};

/**
 * @private
 */
ZmEditContactView.prototype._setFolder = function(organizerOrId) {
	var organizer = organizerOrId instanceof ZmOrganizer ? organizerOrId : appCtxt.getById(organizerOrId);
	this.setLabel("FOLDER", organizer.getName());
	this.setValue("FOLDER", organizer.id);
	if (appCtxt.multiAccounts) {
		this.setValue("ACCOUNT", organizer.getAccount().getDisplayName());
	}
};

/**
 * @private
 */
ZmEditContactView.prototype._getDialogXY =
function() {
	var loc = Dwt.toWindow(this.getHtmlElement(), 0, 0, null, true);
	return new DwtPoint(loc.x + ZmEditContactView.DIALOG_X, loc.y + ZmEditContactView.DIALOG_Y);
};

// listeners

/**
 * @private
 */
ZmEditContactView.prototype._handleDirty = function() {
	var items = this.getDirtyItems();
	// toggle save
	var toolbar = this._controller && this._controller.getCurrentToolbar();
	if (toolbar) {
		var dirty = items.length > 0 ? items.length > 1 || items[0] != "IMAGE" || this._contact.id : false;

		// Creating a new contact with only the folder set should not be saveable until at least one other field has a value
		var needitems = AjxUtil.hashCopy(this._items);
		delete needitems["FOLDER"];
		var empty = this.isEmpty(needitems); // false if one or more fields are set, excluding the folder field

		toolbar.enable(ZmOperation.SAVE, dirty && !empty);
	}
	// debug information
	this.setValue('DEBUG', items.join(', '));
};

/**
 * @private
 */
ZmEditContactView.prototype._handleDetailCheck = function(itemId, id) {
	this.setValue(itemId, !this.getValue(itemId));
	this.update();
	var control = this.getControl(id);
	if (control) {
		control.focus();
	}
};

/**
 * @private
 */
ZmEditContactView.prototype._handleFileAsChange = function() {
	var fa = this.getValue("FILE_AS");
	var showCompany =
        ZmEditContactView.ALWAYS_SHOW["COMPANY"] ||
		fa == ZmContact.FA_COMPANY ||
		fa == ZmContact.FA_LAST_C_FIRST_COMPANY ||
		fa == ZmContact.FA_FIRST_LAST_COMPANY ||
		fa == ZmContact.FA_COMPANY_LAST_C_FIRST ||
		fa == ZmContact.FA_COMPANY_FIRST_LAST
	;
	var company = this.getValue("COMPANY");
	if (showCompany) {
		this.setValue("SHOW_COMPANY", true);
		this.setVisible("COMPANY", true);
	}
	else if (!company) {
		this.setValue("SHOW_COMPANY", false);
		this.setVisible("COMPANY", false);
	}
};

/**
 * @private
 */
ZmEditContactView.prototype._handleFolderButton = function(ev) {
	var dialog = appCtxt.getChooseFolderDialog();
	dialog.registerCallback(DwtDialog.OK_BUTTON, new AjxCallback(this, this._handleChooseFolder));
	var params = {
		overviewId:		dialog.getOverviewId(ZmApp.CONTACTS),
		title:			ZmMsg.chooseAddrBook,
		treeIds:		[ZmOrganizer.ADDRBOOK],
		skipReadOnly:	true,
		skipRemote:		true,
		noRootSelect:	true,
		appName:		ZmApp.CONTACTS
	};
	params.omit = {};
	params.omit[ZmFolder.ID_TRASH] = true;
	params.omit[ZmOrganizer.ID_AUTO_ADDED] = true;
	dialog.popup(params);
};

/**
 * @private
 */
ZmEditContactView.prototype._handleChooseFolder = function(organizer) {
	var dialog = appCtxt.getChooseFolderDialog();
	dialog.popdown();
	this._setFolder(organizer);
};

/**
 * @private
 */
ZmEditContactView.prototype._contactChangeListener = function(ev) {
	if (ev.type != ZmEvent.S_CONTACT) return;
	if (ev.event == ZmEvent.E_TAGS || ev.event == ZmEvent.E_REMOVE_ALL) {
		this._setTags(this._contact);
	}
};

/**
 * @private
 */
ZmEditContactView.prototype._tagChangeListener = function(ev) {
	if (ev.type != ZmEvent.S_TAG) { return; }

	var fields = ev.getDetail("fields");
	var changed = fields && (fields[ZmOrganizer.F_COLOR] || fields[ZmOrganizer.F_NAME]);
	if ((ev.event == ZmEvent.E_MODIFY && changed) || ev.event == ZmEvent.E_DELETE || ev.event == ZmEvent.MODIFY) {
		this._setTags(this._contact);
	}
};

//
// Private methods
//

/**
 * @private
 */
ZmEditContactView.prototype.__getDetailsMenu = function() {
	var menu = new DwtMenu({parent:this.getControl("DETAILS"),style:DwtMenu.POPUP_STYLE});
	var ids = ZmEditContactView.SHOW_ID_PREFIXES;
	var labels = ZmEditContactView.SHOW_ID_LABELS;
	var count = 0;
	for (var i = 0; i < ids.length; i++) {
		var id = ids[i];
		if (this.getControl(id)) {
			var menuitem = new DwtMenuItem({parent:menu, style:DwtMenuItem.CHECK_STYLE});
			menuitem.setText(labels[i]);
			// NOTE: Always show first and last but don't allow to change
			if (id in ZmEditContactView.ALWAYS_SHOW) {
				menuitem.setChecked(true, true);
				menuitem.setEnabled(false);
			}
			var itemId = "SHOW_"+id;
			var listener = new AjxListener(this, this._handleDetailCheck, [itemId, id]);
			menuitem.addSelectionListener(listener);
			this._registerControl({ id: itemId, control: menuitem, ignore: true });
			count++;
		}
	}
	return count > 2 ? menu : null;
};

/**
 * @private
 */
ZmEditContactView.prototype.__initRowsControl =
function(nattrs,id,prefixes,onlyvalue,listAttrs,skipSetValue) {
	var array = [];
	for (var j = 0; j < prefixes.length; j++) {
		var prefix = prefixes[j];
		for (var i = 1; true; i++) {
			var a = ZmContact.getAttributeName(prefix, i);
			if (a != prefix && AjxUtil.indexOf(prefixes, a) != -1) break;
			var value = nattrs[a];
			if (!value) break;
			array.push(onlyvalue ? value : { type:prefix,value:value });
			if (!listAttrs[id]) listAttrs[id] = [];
			listAttrs[id].push(a);
		}
	}
	if (!skipSetValue) {
		this.setValue(id, array);
	}
	return array;
};

/**
 * @private
 */
ZmEditContactView.prototype.__initRowsOther =
function(nattrs,id,prefixes,onlyvalue,listAttrs) {
	var array = this.__initRowsControl.call(this,nattrs,id,prefixes,onlyvalue,listAttrs,true);

	// gather attributes we know about
	var attributes = {};
	for (var attrId in ZmEditContactView.ATTRS) {
		attributes[ZmEditContactView.ATTRS[attrId]] = true;
	}
	for (var listId in ZmEditContactView.LISTS) {
		var list = ZmEditContactView.LISTS[listId];
		if (!list.attrs) continue;
		for (var i = 0; i < list.attrs.length; i++) {
			attributes[list.attrs[i]] = true;
		}
	}
	for (var i = 0; i < ZmEditContactView.ADDR_PREFIXES.length; i++) {
		var prefix = ZmEditContactView.ADDR_PREFIXES[i];
		for (var j = 0; j < ZmEditContactView.ADDR_SUFFIXES.length; j++) {
			var suffix = ZmEditContactView.ADDR_SUFFIXES[j];
			attributes[prefix+suffix] = true;
		}
	}

	// add attributes on contact that we don't know about
	for (var aname in nattrs) {
		aname = aname.replace(/\d+$/,"");
		if (ZmContact.IS_IGNORE[aname]) continue;
		if (!(aname in attributes)) {
			array.push({type:aname,value:nattrs[aname]});
			if (!listAttrs[id]) listAttrs[id] = [];
			listAttrs[id].push(aname);
		}
	}

	this.setValue(id, array);
};

/**
 * @private
 */
ZmEditContactView.prototype.__initRowsAddress = function(nattrs,id,listAttrs) {
	var array = [];
	var prefixes = ZmEditContactView.ADDR_PREFIXES;
	var suffixes = ZmEditContactView.ADDR_SUFFIXES;
	for (var k = 0; k < prefixes.length; k++) {
		var prefix = prefixes[k];
		for (var j = 1; true; j++) {
			var address = null;
			for (var i = 0; i < suffixes.length; i++) {
				var suffix = suffixes[i];
				var a = ZmContact.getAttributeName(prefix+suffix, j);
				var value = nattrs[a];
				if (!value) continue;
				if (!address) address = {};
				address[suffix] = value;
				if (!listAttrs[id]) listAttrs[id] = [];
				listAttrs[id].push(a);
			}
			if (!address) break;
			address.type = prefix;
			array.push(address);
		}
	}
	this.setValue("ADDRESS", array);
};

// functions

/**
 * @private
 */
ZmEditContactView.__clearAddressAttributes = function(attributes, prefix, count) {
	var suffixes = ZmEditContactView.ADDR_SUFFIXES;
	for (var i = 0; i < suffixes.length; i++) {
		var suffix = suffixes[i];
		var p = [prefix, suffix, count > 1 ? count : ""].join("");
		attributes[p] = "";
	}
};

//
// Class: ZmEditContactViewImage
//
/**
 * Creates the contact view image.
 * @class
 * This class represents a contact view image.
 * 
 * @param	{Hash}	params		a hash of parameters
 * 
 * @extends		DwtControl
 * 
 * @private
 */
ZmEditContactViewImage = function(params) {
	if (arguments.length == 0) return;
	params.className = params.className || "ZmEditContactViewImage";
	params.posStyle = Dwt.RELATIVE_STYLE;
	params.id = params.parent.getHTMLElId()+"_IMAGE";
	DwtControl.apply(this, arguments);

	var el = this.getHtmlElement();
	el.innerHTML = [
		"<div style='width:48;height:48'>",
			"<img id='",this._htmlElId,"_img' width='48' height='48'>",
		"</div>",
		"<div id='",this._htmlElId,"_badge' style='position:absolute;"
        ,"bottom:",(AjxEnv.isMozilla ? -4 : 0), ";right:", (AjxEnv.isMozilla ? 3 : 0),"px'>"
	].join("");
	el.style.cursor = "pointer";

	this._src = "";
	this._imgEl = document.getElementById(this._htmlElId+"_img");
	this._imgEl.onload = AjxCallback.simpleClosure(this._imageLoaded, this);
	this._badgeEl = document.getElementById(this._htmlElId+"_badge");

	this._setMouseEvents();

	this.addListener(DwtEvent.ONMOUSEOVER, new AjxListener(Dwt.addClass, [el,DwtControl.HOVER]));
	this.addListener(DwtEvent.ONMOUSEOUT, new AjxListener(Dwt.delClass, [el,DwtControl.HOVER]));
	this.addListener(DwtEvent.ONMOUSEUP, new AjxListener(this, this._chooseImage));

	this.setToolTipContent(ZmMsg.addImg);
};
ZmEditContactViewImage.prototype = new DwtControl;
ZmEditContactViewImage.prototype.constructor = ZmEditContactViewImage;

/**
 * Returns a string representation of the object.
 * 
 * @return		{String}		a string representation of the object
 * @private
 */
ZmEditContactViewImage.prototype.toString = function() {
	return "ZmEditContactViewImage";
};

// Constants

ZmEditContactViewImage.NO_IMAGE_URL = appContextPath + "/img/large/ImgPerson_48.gif";
ZmEditContactViewImage.IMAGE_URL = "/service/content/proxy?aid=@aid@";

// Public methods

/**
 * Sets the image value.
 * 
 * @param	{String}	value	the image src value
 * @private
 */
ZmEditContactViewImage.prototype.setValue = function(value) {
	this._src = value;
	if (!value) {
		this._imgEl.src = ZmEditContactViewImage.NO_IMAGE_URL;
		this._badgeEl.className = "ImgAdd";
        
	}
	else {
		this._imgEl.src = value;
		this._badgeEl.className = "ImgEditBadge";
        this.setToolTipContent(ZmMsg.editImg);
	}
	this.parent.setDirty("IMAGE", true);
};

/**
 * Gets the value.
 * 
 * @return	{String}	the image src value
 * @private
 */
ZmEditContactViewImage.prototype.getValue = function() {
	return this._src;
};

// Protected methods

ZmEditContactViewImage.prototype._focus = function() {
    Dwt.addClass(this.getHtmlElement(), DwtControl.FOCUSED);
};
ZmEditContactViewImage.prototype._blur = function() {
    Dwt.delClass(this.getHtmlElement(), DwtControl.FOCUSED);
};

/**
 * @private
 */
ZmEditContactViewImage.prototype._imageLoaded = function() {
	this._imgEl.removeAttribute("width");
	this._imgEl.removeAttribute("height");
	var w = this._imgEl.width;
	var h = this._imgEl.height;
    this._imgEl.setAttribute(w>h ? 'width' : 'height', 48);
};

/**
 * @private
 */
ZmEditContactViewImage.prototype._chooseImage = function() {
	var dialog = appCtxt.getUploadDialog();
	dialog.setAllowedExtensions(["png","jpg","jpeg","gif"]);
	var folder = null;
	var callback = new AjxCallback(this, this._handleImageSaved);
	var title = ZmMsg.uploadImage;
	var location = null;
	var oneFileOnly = true;
	var noResolveAction = true;
	dialog.popup(folder, callback, title, location, oneFileOnly, noResolveAction);
};

/**
 * @private
 */
ZmEditContactViewImage.prototype._handleImageSaved = function(folder, filenames, files) {
	var dialog = appCtxt.getUploadDialog();
	dialog.popdown();
	this.setValue(ZmEditContactViewImage.IMAGE_URL.replace(/@aid@/, files[0].guid));
	this.parent.update();
};

/**
 * @private
 */
ZmEditContactViewImage.prototype._createElement = function() {
	return document.createElement("FIELDSET");
};

//
// Class: ZmEditContactViewRows
//

/**
 * Creates the contact view rows.
 * @class
 * This class represents the contact view rows.
 * 
 * @param	{Hash}	params		a hash of parameters
 * 
 * @extends		DwtFormRows
 * 
 * @private
 */
ZmEditContactViewRows = function(params) {
	if (arguments.length == 0) return;
	if (!params.formItemDef) params.formItemDef = {};
	// keep track of maximums
	var rowitem = params.formItemDef.rowitem;
	var rowparams = rowitem && rowitem.params;
	var rowoptions = this._options = (rowparams && rowparams.options) || [];
	for (var i = 0; i < rowoptions.length; i++) {
		var option = rowoptions[i];
		if (option.max) {
			if (!this._maximums) this._maximums = {};
			this._maximums[option.value] = { max: option.max, count: 0 };
		}
	}
	// create rows control
	params.formItemDef.id = params.formItemDef.id || Dwt.getNextId();
	params.formItemDef.onremoverow = "this.setDirty(true)";
	params.className = params.className || "ZmEditContactViewRows";
	params.id = [params.parent.getHTMLElId(),params.formItemDef.id].join("_");
	DwtFormRows.apply(this, arguments);
};
ZmEditContactViewRows.prototype = new DwtFormRows;
ZmEditContactViewRows.prototype.constructor = ZmEditContactViewRows;

/**
 * Returns a string representation of the object.
 * 
 * @return		{String}		a string representation of the object
 * @private
 */
ZmEditContactViewRows.prototype.toString = function() {
	return "ZmEditContactViewRows";
};

// Public methods

ZmEditContactViewRows.prototype.setDirty = function() {
	DwtFormRows.prototype.setDirty.apply(this, arguments);
	this.parent.setDirty(this._itemDef.id, this.isDirty());
};

/**
 * Checks if the row of the given type is at maximum.
 * 
 * @param	{constant}	type		the type
 * @return	{Boolean}	<code>true</code> if at maximum
 * @private
 */
ZmEditContactViewRows.prototype.isMaxedOut = function(type) {
	var maximums = this._maximums && this._maximums[type];
	return maximums != null && maximums.count >= maximums.max;
};

/**
 * Checks if all rows are at maximum.
 * 
 * @return	{Boolean}	<code>true</code> if at maximum
 * @private
 */
ZmEditContactViewRows.prototype.isAllMaxedOut = function() {
	if (!this._options || this._options.length == 0) return false;
	// determine which ones are maxed out
	var count = 0;
	for (var i = 0; i < this._options.length; i++) {
		var type = this._options[i].value;
		count += this.isMaxedOut(type) ? 1 : 0;
	}
	// are all of the options maxed out?
	return count >= this._options.length;
};

//
// Class: ZmEditContactViewInputSelectRows
//

/**
 * Creates the input select rows.
 * @class
 * This class represents the input select rows for the contact view.
 * 
 * @param	{Hash}	params		a hash of parameters
 * 
 * @extends		ZmEditContactViewRows
 * 
 * @private
 */
ZmEditContactViewInputSelectRows = function(params) {
	if (arguments.length == 0) return;
	ZmEditContactViewRows.apply(this, arguments);
};
ZmEditContactViewInputSelectRows.prototype = new ZmEditContactViewRows;
ZmEditContactViewInputSelectRows.prototype.constructor = ZmEditContactViewInputSelectRows;

/**
 * Returns a string representation of the object.
 * 
 * @return		{String}		a string representation of the object
 * @private
 */
ZmEditContactViewInputSelectRows.prototype.toString = function() {
	return "ZmEditContactViewInputSelectRows";
};

// DwtFormRows methods

/**
 * Gets the max rows.
 * 
 * @return	{int}	the maximum rows
 * @private
 */
ZmEditContactViewInputSelectRows.prototype.getMaxRows = function() {
	return this.isAllMaxedOut() ? this.getRowCount() : ZmEditContactViewRows.prototype.getMaxRows.call(this);
};

/**
 * Sets the value.
 * 
 * @param	{Array|String}		array		an array of {String} values
 * @private
 */
ZmEditContactViewInputSelectRows.prototype.setValue = function(array) {
	if (arguments[0] instanceof Array) {
		DwtFormRows.prototype.setValue.apply(this, arguments);
		this._resetMaximums();
	}
	else {
		var id = String(arguments[0]);
		var adjust1 = id && this._subtract(id);
		DwtFormRows.prototype.setValue.apply(this, arguments);
		var adjust2 = id && this._add(id);
		if (adjust1 || adjust2) this._adjustMaximums();
	}
};

/**
 * Adds a row.
 * 
 * @param		{ZmItem}	itemDef		the item definition (not used)
 * @param	{int}	index		the index to add the row at
 * @private
 */
ZmEditContactViewInputSelectRows.prototype.addRow = function(itemDef, index) {
	DwtFormRows.prototype.addRow.apply(this, arguments);
	index = index != null ? index : this.getRowCount() - 1;
	var adjust = this._add(index);
	if (adjust) this._adjustMaximums();
	var value = this.getValue(index);
	// select first one that is not maxed out
	if (value && this.isMaxedOut(value.type) && this._options.length > 0 && 
	    this._maximums[value.type].count > this._maximums[value.type].max) {
		var options = this._options;
		for (var i = 0; i < options.length; i++) {
			var option = options[i];
			if (!this.isMaxedOut(option.value)) {
				value.type = option.value;
				this.setValue(index, value);
				break;
			}
		}
	}
	
	if (this._rowCount >= this._maxRows) {
		for (var i = 0; i < this._rowCount; i++) {
			this.setVisible(this._items[i]._addId, false);
		}
	}
	if (AjxEnv.isFirefox) this._updateLayout();
};

/**
 * Removes a row.
 * 
 * @param	{String}		indexOrId	the row index or item id
 * @private
 */
ZmEditContactViewInputSelectRows.prototype.removeRow = function(indexOrId) {
	var adjust = this._subtract(indexOrId);
	DwtFormRows.prototype.removeRow.apply(this, arguments);
	if (adjust) this._adjustMaximums();
	if (AjxEnv.isFirefox) this._updateLayout();
};

/**
 * @private
 */
ZmEditContactViewInputSelectRows.prototype._setControlIds = function(rowId, index) {
	DwtFormRows.prototype._setControlIds.call(this, rowId, index);
	var item = this._items[rowId];
	var control = item && item.control;
	if (control && control._setControlIds) {
		control._setControlIds(rowId, index);
	}
};

// Protected methods

/**
 * @private
 */
ZmEditContactViewInputSelectRows.prototype._subtract = function(indexOrId) {
	var value = this.getValue(indexOrId);
	return this._subtractType(value && value.type);
};
ZmEditContactViewInputSelectRows.prototype._subtractType = function(type) {
	if (!this._maximums || !this._maximums[type]) return false;
	this._maximums[type].count--;
	return true;
};
ZmEditContactViewInputSelectRows.prototype._add = function(indexOrId) {
	var value = this.getValue(indexOrId);
	return this._addType(value && value.type);
};
ZmEditContactViewInputSelectRows.prototype._addType = function(type) {
	if (!this._maximums || !this._maximums[type]) return false;
	this._maximums[type].count++;
	return true;
};

ZmEditContactViewInputSelectRows.prototype._adjustMaximums = function() {
	if (!this._maximums || !this._options) return;
	// determine which ones are maxed out
	var enabled = {};
	var count = 0;
	for (var i = 0; i < this._options.length; i++) {
		var type = this._options[i].value;
		var maxed = this.isMaxedOut(type);
		enabled[type] = !maxed;
		count += maxed ? 1 : 0;
	}
	// are all of the options maxed out?
	var allMaxed = count == this._options.length;
	// en/disable controls as needed
	var rowCount = this.getRowCount();
	for (var i = 0; i < rowCount; i++) {
		var control = this.getControl(i);
		if (control.enableOptions) {
			control.enableOptions(enabled);
		}
		// TODO: Will this override the max rows add button visibility?
		this.setVisible(this._items[i]._addId, !allMaxed);
	}
};

// TODO: This is a hack to avoid bad counting error. Should
// TODO: really find the cause of the error.
ZmEditContactViewInputSelectRows.prototype._resetMaximums = function() {
	if (!this._maximums) return;
	for (var type in this._maximums) {
		this._maximums[type].count = 0;
	}
	var rowCount = this.getRowCount();
	for (var i = 0; i < rowCount; i++) {
		var value = this.getValue(i);
		var maximum = this._maximums[value && value.type];
		if (maximum) {
			maximum.count++;
		}
	}
};

// On FF, the selects are sometimes rendered incorrectly.
ZmEditContactViewInputSelectRows.prototype._updateLayout = function() {
	for (var i = 0, cnt = this.getRowCount(); i < cnt; i++) {
		this.getControl(i).reRenderSelect();
		this.getControl(i).reRenderInput();
	}
};

//
// Class: ZmEditContactViewInputSelect
//

/**
 * Creates the contact view input select.
 * @class
 * This class represents an input select.
 * 
 * @param	{Hash}	params		a hash of parameters
 * 
 * @extends		DwtComposite
 * 
 * @private
 */
ZmEditContactViewInputSelect = function(params) {
	if (arguments.length == 0) return;
	this._formItemId = params.formItemDef.id;
	this._options = params.options || [];
	this._cols = params.cols;
	this._rows = params.rows;
	this._hint = params.hint;
	DwtComposite.apply(this, arguments);
	this._tabGroup = new DwtTabGroup(this._htmlElId);
	this._createHtml(params.template);
};
ZmEditContactViewInputSelect.prototype = new DwtComposite;
ZmEditContactViewInputSelect.prototype.constructor = ZmEditContactViewInputSelect;

/**
 * Returns a string representation of the object.
 * 
 * @return		{String}		a string representation of the object
 * @private
 */
ZmEditContactViewInputSelect.prototype.toString = function() {
	return "ZmEditContactViewInputSelect";
};

// Data

ZmEditContactViewInputSelect.prototype.TEMPLATE = "abook.Contacts#ZmEditContactViewInputSelect";

// Public methods

/**
 * Sets the value.
 * 
 * @param	{Object}	value		the value
 * @private
 */
ZmEditContactViewInputSelect.prototype.setValue = function(value) {
	var hasOptions = this._options.length > 0;
	var inputValue = hasOptions ? value && value.value : value;
	if (hasOptions && this._select) {
		this._select.setSelectedValue((value && value.type) || this._options[0].value);
	}
	if (this._input) {
		if (this._select)
			this._input.setEnabled(this._select.getValue() != "_NONE");
		this._input.setValue(inputValue || "");
	}
};

/**
 * Gets the value.
 * 
 * @return	{Object}		the value
 * @private
 */
ZmEditContactViewInputSelect.prototype.getValue = function() {
	var hasOptions = this._options.length > 0;
	var inputValue = this._input ? this._input.getValue() : "";
	return hasOptions ? {
		type:  this._select ? this._select.getValue() : "",
		value: inputValue
	} : inputValue;
};

/**
 * Sets the dirty flag.
 * 
 * @param	{Boolean}	dirty		(not used)
 * @private
 */
ZmEditContactViewInputSelect.prototype.setDirty = function(dirty) {
	if (this.parent instanceof DwtForm) {
		this.parent.setDirty(true);
	}
};

/**
 * Checks if the two items are equal.
 * 
 * @param	{Object}	a		item a
 * @param	{Object}	b		item b
 * 
 * @private
 */
ZmEditContactViewInputSelect.equals = function(a, b) {
	if (a === b) return true;
	if (!a || !b) return false;
	var hasOptions = this._options.length > 0;
	return hasOptions ? a.type == b.type && a.value == b.value : a == b;
};

// Hooks

ZmEditContactViewInputSelect.prototype.enableOptions = function(enabled) {
	if (!this._select || !this._select.enableOption) return;
	var type = this.getValue().type;
	for (var id in enabled) {
		this._select.enableOption(id, id == type || enabled[id]);
	}
};

// Protected methods

ZmEditContactViewInputSelect.prototype._setControlIds = function(rowId, index) {
	var id = this.getHTMLElId();
	this._setControlId(this, id+"_value");
	this._setControlId(this._input, id);
	this._setControlId(this._select, id+"_select");
};

ZmEditContactViewInputSelect.prototype._setControlId = DwtFormRows.prototype._setControlId;

ZmEditContactViewInputSelect.prototype._createHtml = function(templateId) {
	var tabIndexes = this._tabIndexes = [];
	this._createHtmlFromTemplate(templateId || this.TEMPLATE, {id:this._htmlElId});
	tabIndexes.sort(DwtForm.__byTabIndex);
	for (var i = 0; i < tabIndexes.length; i++) {
		var control = tabIndexes[i].control;
		this._tabGroup.addMember(control.getTabGroupMember() || control);
	}
};

ZmEditContactViewInputSelect.prototype._createHtmlFromTemplate = function(templateId, data) {
	DwtComposite.prototype._createHtmlFromTemplate.apply(this, arguments);

	var tabIndexes = this._tabIndexes;
	var inputEl = document.getElementById(data.id+"_input");
	if (inputEl) {
		this._input = this._createInput();
		this._input.replaceElement(inputEl);
		if (inputEl.getAttribute("notab") != "true") {
			tabIndexes.push({
				tabindex: inputEl.getAttribute("tabindex") || Number.MAX_VALUE,
				control: this._input
			});
		}
	}

	var selectEl = document.getElementById(data.id+"_select");
	var hasOptions = this._options.length > 0;
	if (hasOptions && selectEl) {
		this._select = this._createSelect(this._options);
		this._select.addChangeListener(new AjxListener(this, this._handleSelectChange));
		this._select.replaceElement(selectEl);
		if (selectEl.getAttribute("notab") != "true") {
			tabIndexes.push({
				tabindex: selectEl.getAttribute("tabindex") || Number.MAX_VALUE,
				control: this._select
			});
		}
		this._select.setVisible(this._options.length > 1);
		if (this._input)
			this._input.setEnabled(this._select.getValue() != "_NONE");
	}
};

ZmEditContactViewInputSelect.prototype._createInput = function() {
	var input = new DwtInputField({parent:this,size:this._cols,rows:this._rows});
	input.setHint(this._hint);
	input.setHandler(DwtEvent.ONKEYDOWN, AjxCallback.simpleClosure(this._handleInputKeyDown, this, input));
	input.setHandler(DwtEvent.ONKEYUP, AjxCallback.simpleClosure(this._handleInputKeyUp, this, input));
	return input;
};

ZmEditContactViewInputSelect.prototype._createSelect = function(options) {
	var id = [this.getHTMLElId(),"select"].join("_");
	var select = new DwtSelect({parent:this,id:id});
	for (var i = 0; i < options.length; i++) {
		var option = options[i];
		var maxedOut = this.parent.isMaxedOut(option.value);
		select.addOption(option.label || option.value, i == 0 && !maxedOut, option.value);
		if (maxedOut) {
			select.enableOption(option.value, false);
		}
	}
	return select;
};

ZmEditContactViewInputSelect.prototype.reRenderSelect = function() {
	if (this._select && this._select.updateRendering)
		this._select.updateRendering();
};

ZmEditContactViewInputSelect.prototype.reRenderInput = function() {
	if (this._input) {
		var value = this._input.getValue();
		if (value && value != "") {
			this._input.setValue(value+" ");
			this._input.setValue(value);
		}
	}
};

ZmEditContactViewInputSelect.prototype._handleInputKeyDown = function(input, evt) {
	var value = input.getValue();
	input.setData("OLD_VALUE", value);
	return true;
};

ZmEditContactViewInputSelect.prototype._handleInputKeyUp = function(input, evt) {
	var ovalue = input.getData("OLD_VALUE");
	var nvalue = input.getValue();
	if (ovalue != null && ovalue != nvalue) {
		this.setDirty(true);
	}
	return true;
};

ZmEditContactViewInputSelect.prototype._handleSelectChange = function(evt, skipFocus) {
	var args = evt._args;
	var adjust1 = this.parent._subtractType(args.oldValue);
	var adjust2 = this.parent._addType(args.newValue);
	if (adjust1 || adjust2) {
		this.parent._adjustMaximums();
	}
	this.setDirty(true);
	if (this._input && this._select) {
		var enabled = this._select.getValue() != "_NONE";
		this._input.setEnabled(enabled);
		if (enabled && !skipFocus)
			this._input.focus();
	}
};

// DwtControl methods

ZmEditContactViewInputSelect.prototype.getTabGroupMember = function() {
	return this._tabGroup;
};

/**
 * Creates the input select rows.
 * @class
 * This class represents the input double select rows for the contact view.
 * 
 * @param	{Hash}	params		a hash of parameters
 * 
 * @extends		ZmEditContactViewRows
 * 
 * @private
 */
ZmEditContactViewInputDoubleSelectRows = function(params) {
	if (arguments.length == 0) return;
	ZmEditContactViewInputSelectRows.apply(this, arguments);

	var rowitem = params.formItemDef.rowitem;
	var rowparams = rowitem && rowitem.params;
	var rowoptions2 = this._options2 = (rowparams && rowparams.options2) || [];
	for (var i = 0; i < rowoptions2.length; i++) {
		var option = rowoptions2[i];
		if (option.max) {
			if (!this._maximums2) this._maximums2 = {};
			this._maximums2[option.value] = { max: option.max, count: 0 };
		}
	}

};
ZmEditContactViewInputDoubleSelectRows.prototype = new ZmEditContactViewInputSelectRows;
ZmEditContactViewInputDoubleSelectRows.prototype.constructor = ZmEditContactViewInputDoubleSelectRows;

/**
 * Returns a string representation of the object.
 * 
 * @return		{String}		a string representation of the object
 * @private
 */
ZmEditContactViewInputDoubleSelectRows.prototype.toString = function() {
	return "ZmEditContactViewInputDoubleSelectRows";
};

ZmEditContactViewInputDoubleSelectRows.prototype._subtract = function(indexOrId) {
	var value = this.getValue(indexOrId);
	var a = this._subtractType(value && value.type);
	var b = this._subtractType2(value && value.type2);
	return a && b;
};
ZmEditContactViewInputDoubleSelectRows.prototype._subtractType2 = function(type) {
	if (!this._maximums2 || !this._maximums2[type]) return false;
	this._maximums2[type].count--;
	return true;
};
ZmEditContactViewInputDoubleSelectRows.prototype._add = function(indexOrId) {
	var value = this.getValue(indexOrId);
	var a = this._addType(value && value.type);
	var b = this._addType2(value && value.type2);
	return a || b;
};
ZmEditContactViewInputDoubleSelectRows.prototype._addType2 = function(type) {
	if (!this._maximums2 || !this._maximums2[type]) return false;
	this._maximums2[type].count++;
	return true;
};

ZmEditContactViewInputDoubleSelectRows.prototype._adjustMaximums = function() {
	ZmEditContactViewInputSelectRows.prototype._adjustMaximums.call(this);
	if (!this._maximums2 || !this._options2) return;
	// determine which ones are maxed out
	var enabled = {};
	var count = 0;
	for (var i = 0; i < this._options2.length; i++) {
		var type = this._options2[i].value;
		var maxed = this.isMaxedOut2(type);
		enabled[type] = !maxed;
		count += maxed ? 1 : 0;
	}
	// are all of the options maxed out?
	var allMaxed = count == this._options2.length;
	// en/disable controls as needed
	var rowCount = this.getRowCount();
	for (var i = 0; i < rowCount; i++) {
		var control = this.getControl(i);
		if (control.enableOptions) {
			control.enableOptions(enabled);
		}
		// TODO: Will this override the max rows add button visibility?
		this.setVisible(this._items[i]._addId, !allMaxed);
	}
};

// TODO: This is a hack to avoid bad counting error. Should
// TODO: really find the cause of the error.
ZmEditContactViewInputDoubleSelectRows.prototype._resetMaximums = function() {
	ZmEditContactViewInputSelectRows.prototype._resetMaximums.call(this);
	if (!this._maximums2) return;
	for (var type in this._maximums2) {
		this._maximums2[type].count = 0;
	}
	var rowCount = this.getRowCount();
	for (var i = 0; i < rowCount; i++) {
		var value = this.getValue(i);
		var maximum = this._maximums2[value && value.type2];
		if (maximum) {
			maximum.count++;
		}
	}
};

ZmEditContactViewInputDoubleSelectRows.prototype.addRow = function(itemDef, index) {
	DwtFormRows.prototype.addRow.apply(this, arguments);
	index = index != null ? index : this.getRowCount() - 1;
	var adjust = this._add(index);
	if (adjust) this._adjustMaximums();
	var value = this.getValue(index);
	// select first one that is not maxed out

	var typeChanged = false;
	if (value && this.isMaxedOut(value.type) && this._options.length > 0 && 
	    this._maximums[value.type].count > this._maximums[value.type].max) {
		var options = this._options;
		for (var i = 0; i < options.length; i++) {
			var option = options[i];
			if (!this.isMaxedOut(option.value)) {
				value.type = option.value;
				typeChanged = true;
				break;
			}
		}
	}

	if (value && this.isMaxedOut2(value.type2) && this._options2.length > 0 && 
	    this._maximums2[value.type2].count > this._maximums2[value.type2].max) {
		var options = this._options2;
		for (var i = 0; i < options.length; i++) {
			var option = options[i];
			if (!this.isMaxedOut2(option.value)) {
				value.type2 = option.value;
				typeChanged = true;
				break;
			}
		}
	}
	if (typeChanged)
		this.setValue(index, value);

	if (this._rowCount >= this._maxRows) {
		for (var i = 0; i < this._rowCount; i++) {
			this.setVisible(this._items[i]._addId, false);
		}
	}
};

ZmEditContactViewInputDoubleSelectRows.prototype.isMaxedOut2 = function(type) {
	var maximums = this._maximums2 && this._maximums2[type];
	return maximums != null && maximums.count >= maximums.max;
};

/**
 * Checks if all rows are at maximum.
 * 
 * @return	{Boolean}	<code>true</code> if at maximum
 * @private
 */
ZmEditContactViewInputDoubleSelectRows.prototype.isAllMaxedOut = function() {
	if (ZmEditContactViewInputSelectRows.prototype.isAllMaxedOut.call(this)) return true;
	if (!this._options2 || this._options2.length == 0) return false;
	// determine which ones are maxed out
	var count = 0;
	for (var i = 0; i < this._options2.length; i++) {
		var type = this._options2[i].value;
		count += this.isMaxedOut2(type) ? 1 : 0;
	}
	// are all of the options maxed out?
	return count >= this._options2.length;
};

//
// Class: ZmEditContactViewInputDoubleSelect
//

/**
 * Creates the contact view input double select.
 * @class
 * This class represents an input with two selects.
 * 
 * @param	{Hash}	params		a hash of parameters
 * 
 * @extends		ZmEditContactViewInputSelect
 * 
 * @private
 */

ZmEditContactViewInputDoubleSelect = function(params) {
	if (arguments.length == 0) return;
	this._options2 = params.options2 || [];
	ZmEditContactViewInputSelect.apply(this, arguments);
};
ZmEditContactViewInputDoubleSelect.prototype = new ZmEditContactViewInputSelect;
ZmEditContactViewInputDoubleSelect.prototype.constructor = ZmEditContactViewInputDoubleSelect;

/**
 * Returns a string representation of the object.
 * 
 * @return		{String}		a string representation of the object
 * @private
 */
ZmEditContactViewInputDoubleSelect.prototype.toString = function() {
	return "ZmEditContactViewInputDoubleSelect";
};

// Data

ZmEditContactViewInputDoubleSelect.prototype.TEMPLATE = "abook.Contacts#ZmEditContactViewInputDoubleSelect";

// Public methods

/**
 * Sets the value.
 * 
 * @param	{Object}	value		the value
 * @private
 */
ZmEditContactViewInputDoubleSelect.prototype.setValue = function(value) {
	var hasOptions = this._options.length > 0;
	var hasOptions2 = this._options2.length > 0;
	var inputValue = hasOptions || hasOptions2 ? value && value.value : value;
	if (hasOptions && this._select) {
		this._select.setSelectedValue((value && value.type) || this._options[0].value);
	}
	if (hasOptions2 && this._select2) {
		this._select2.setSelectedValue((value && value.type2) || this._options2[0].value);
	}
	if (this._input) {
		if (this._select || this._select2)
			this._input.setEnabled((this._select && this._select.getValue() != "_NONE") && (this._select2 && this._select2.getValue() != "_NONE"));
		this._input.setValue(inputValue || "");
	}
};

/**
 * Gets the value.
 * 
 * @return	{Object}		the value
 * @private
 */
ZmEditContactViewInputDoubleSelect.prototype.getValue = function() {
	var hasOptions = this._options.length > 0;
	var hasOptions2 = this._options2.length > 0;
	var inputValue = this._input ? this._input.getValue() : "";
	return hasOptions || hasOptions2 ? {
		type: this._select ? this._select.getValue() : "",
		type2: this._select2 ? this._select2.getValue() : "",
		value: inputValue
	} : inputValue;
};

/**
 * Checks if the two items are equal.
 * 
 * @param	{Object}	a		item a
 * @param	{Object}	b		item b
 * 
 * @private
 */
ZmEditContactViewInputDoubleSelect.equals = function(a, b) {
	if (a === b) return true;
	if (!a || !b) return false;
	var hasOptions = this._options.length > 0;
	var hasOptions2 = this._options2.length > 0;
	if (hasOptions) {
		if (a.type != b.type || a.value != b.value)
			return false;
	}
	if (hasOptions2) {
		if (a.type2 != b.type2 || a.value != b.value)
			return false;
	}
	if (!hasOptions && !hasOptions2)
		if (a != b)
			return false;
	return true;
};

// Hooks

ZmEditContactViewInputDoubleSelect.prototype.enableOptions = function(enabled, enabled2) {
	if (this._select && this._select.enableOption) {
		var type = this.getValue().type;
		for (var id in enabled) {
			this._select.enableOption(id, id == type || enabled[id]);
		}
	}
	if (this._select2 && this._select2.enableOption) {
		var type = this.getValue().type2;
		for (var id in enabled2) {
			this._select2.enableOption(id, id == type || enabled2[id]);
		}
	}
};

// Protected methods

ZmEditContactViewInputDoubleSelect.prototype._setControlIds = function(rowId, index) {
	var id = this.getHTMLElId();
	this._setControlId(this, id+"_value");
	this._setControlId(this._input, id);
	this._setControlId(this._select, id+"_select");
	this._setControlId(this._select2, id+"_select2");
};

ZmEditContactViewInputDoubleSelect.prototype._setControlId = DwtFormRows.prototype._setControlId;


ZmEditContactViewInputDoubleSelect.prototype._createHtmlFromTemplate = function(templateId, data) {
	DwtComposite.prototype._createHtmlFromTemplate.apply(this, arguments);

	var tabIndexes = this._tabIndexes;
	var inputEl = document.getElementById(data.id+"_input");
	if (inputEl) {
		this._input = this._createInput();
		this._input.replaceElement(inputEl);
		if (inputEl.getAttribute("notab") != "true") {
			tabIndexes.push({
				tabindex: inputEl.getAttribute("tabindex") || Number.MAX_VALUE,
				control: this._input
			});
		}
	}

	var selectEl = document.getElementById(data.id+"_select");
	var hasOptions = this._options.length > 0;
	if (hasOptions && selectEl) {
		this._select = this._createSelect(this._options);
		this._select.addChangeListener(new AjxListener(this, this._handleSelectChange));
		this._select.replaceElement(selectEl);
		if (selectEl.getAttribute("notab") != "true") {
			tabIndexes.push({
				tabindex: selectEl.getAttribute("tabindex") || Number.MAX_VALUE,
				control: this._select
			});
		}
		this._select.setVisible(this._options.length > 1);
	}

	var selectEl2 = document.getElementById(data.id+"_select2");
	var hasOptions2 = this._options2.length > 0;
	if (hasOptions2 && selectEl2) {
		this._select2 = this._createSelect2(this._options2);
		this._select2.addChangeListener(new AjxListener(this, this._handleSelectChange2));
		this._select2.replaceElement(selectEl2);
		if (selectEl2.getAttribute("notab") != "true") {
			tabIndexes.push({
				tabindex: selectEl.getAttribute("tabindex") || Number.MAX_VALUE,
				control: this._select2
			});
		}
		this._select2.setVisible(this._options2.length > 1);
	}

	if (this._input) {
		if (this._select || this._select2)
			this._input.setEnabled((this._select && this._select.getValue() != "_NONE") && (this._select2 && this._select2.getValue() != "_NONE"));
	}
};

ZmEditContactViewInputDoubleSelect.prototype._createSelect2 = function(options) {
	var id = [this.getHTMLElId(),"select2"].join("_");
	var select = new DwtSelect({parent:this,id:id});
	for (var i = 0; i < options.length; i++) {
		var option = options[i];
		select.addOption(option.label || option.value, i == 0, option.value);
	}
	return select;
};

ZmEditContactViewInputDoubleSelect.prototype.reRenderSelect = function() {
	ZmEditContactViewInputSelect.prototype.reRenderSelect.call(this);
	this._select2.updateRendering();
};

ZmEditContactViewInputDoubleSelect.prototype._handleSelectChange = function(evt, skipFocus) {
	var args = evt._args;
	var adjust1 = this.parent._subtractType(args.oldValue);
	var adjust2 = this.parent._addType(args.newValue);
	if (adjust1 || adjust2) {
		this.parent._adjustMaximums();
	}
	this.setDirty(true);
	if (this._input) {
		var enabled = this._select.getValue() != "_NONE" && this._select2.getValue() != "_NONE";
		this._input.setEnabled(enabled);
		if (enabled && !skipFocus)
			this._input.focus();
	}
};

ZmEditContactViewInputDoubleSelect.prototype._handleSelectChange2 = function(evt, skipFocus) {
	var args = evt._args;
	var adjust1 = this.parent._subtractType2(args.oldValue);
	var adjust2 = this.parent._addType2(args.newValue);
	if (adjust1 || adjust2) {
		this.parent._adjustMaximums();
	}
	this.setDirty(true);
	if (this._input) {
		var enabled = this._select.getValue() != "_NONE" && this._select2.getValue() != "_NONE";
		this._input.setEnabled(enabled);
		if (enabled && !skipFocus)
			this._input.focus();
	}
};

//
// Class: ZmEditContactViewOther
//

/**
 * Creates the contact view other.
 * @class
 * This class represents the contact view other field.
 * 
 * @param	{Hash}	params		a hash of parameters
 * 
 * @extends		ZmEditContactViewInputSelect
 * 
 * @private
 */
ZmEditContactViewOther = function(params) {
	if (arguments.length == 0) return;
	ZmEditContactViewInputSelect.apply(this, arguments);
	var option = params.options && params.options[0];
	this.setValue({type:option && option.value});
};
ZmEditContactViewOther.prototype = new ZmEditContactViewInputSelect;
ZmEditContactViewOther.prototype.constructor = ZmEditContactViewOther;

/**
 * Returns a string representation of the object.
 * 
 * @return		{String}		a string representation of the object
 * @private
 */
ZmEditContactViewOther.prototype.toString = function() {
	return "ZmEditContactViewOther";
};

// Data

ZmEditContactViewOther.prototype.TEMPLATE = "abook.Contacts#ZmEditContactViewOther";

ZmEditContactViewOther.prototype.DATE_ATTRS = { "birthday": true, "anniversary": true };

ZmEditContactViewOther.validator = function(item) {
	if (AjxUtil.isArray(item)) {
		if (!item.length) return true;
		var result = [];
		for (var i=0; i<item.length; i++) {
			var value = ZmEditContactViewOther.validator(item[i]);
			if (value || value==="")
				result.push({type: item[i].type, value: value});
			else
				return false;
		}
		return result;
	} else {
		if (item.type in ZmEditContactViewOther.prototype.DATE_ATTRS || item.type.replace(/^other/,"").toLowerCase() in ZmEditContactViewOther.prototype.DATE_ATTRS) {
			var dateStr = AjxStringUtil.trim(item.value);
			if (dateStr.length) {
                var aDate = ZmEditContactViewOther.parseDate(dateStr);
				if (isNaN(aDate) || aDate == null) {
					throw ZmMsg.errorDate;
				}
                var formatter = ZmEditContactViewOther._getDateFormatter();
				return formatter.format(aDate);
			}
			return dateStr;
		}
		return item.value;
	}
};

// Public methods

/**
 * Sets the value.
 * 
 * @param	{Object}	value		the value
 * @private
 */
ZmEditContactViewOther.prototype.setValue = function(value) {
	ZmEditContactViewInputSelect.prototype.setValue.apply(this, arguments);
	this._resetPicker();
};

/**
 * Gets the value.
 * 
 * @return	{Object}	the value
 * @private
 */
ZmEditContactViewOther.prototype.getValue = function() {
	return {
		type: this._select.getValue() || this._select.getText(),
		value: this._input.getValue()
	};
};

// Protected methods

ZmEditContactViewOther.prototype._setControlIds = function(rowId, index) {
	var id = this.getHTMLElId();
	ZmEditContactViewInputSelect.prototype._setControlIds.apply(this, arguments);
	this._setControlId(this._picker, id+"_picker");
};

ZmEditContactViewOther.prototype._createHtmlFromTemplate = function(templateId, data) {
	ZmEditContactViewInputSelect.prototype._createHtmlFromTemplate.apply(this, arguments);

	var tabIndexes = this._tabIndexes;
	var pickerEl = document.getElementById(data.id+"_picker");
	if (pickerEl) {
		var id = [this.getHTMLElId(),"picker"].join("_");
		this._picker = new DwtButton({parent:this,id:id});
		this._picker.setImage("CalendarApp");
		var menu = new DwtMenu({parent:this._picker,style:DwtMenu.CALENDAR_PICKER_STYLE});
		menu.setSize("150");
		menu._table.width = "100%";
		this._picker.setMenu(menu);
		this._picker.replaceElement(pickerEl);
        var listener = new AjxListener(this, this._handleDropDown);
        this._picker.addSelectionListener(listener);
        this._picker.addDropDownSelectionListener(listener);
		var calendar = new DwtCalendar({parent:menu});
		calendar.setDate(new Date());
		calendar.setFirstDayOfWeek(appCtxt.get(ZmSetting.CAL_FIRST_DAY_OF_WEEK) || 0);
		calendar.addSelectionListener(new AjxListener(this,this._handleDateSelection,[calendar]));
		tabIndexes.push({
			tabindex: pickerEl.getAttribute("tabindex") || Number.MAX_VALUE,
			control: this._picker
		});
        this._calendar = calendar;
	}                                                        
};

ZmEditContactViewOther.prototype._createSelect = function() {
	var id = [this.getHTMLElId(),"select"].join("_");
	var select = new DwtComboBox({parent:this,inputParams:{size:14},id:id});
	var options = this._options || [];
	for (var i = 0; i < options.length; i++) {
		var option = options[i];
		select.add(option.label || option.value, option.value, i == 0);
	}
	select.addChangeListener(new AjxListener(this, this._resetPicker));
	// HACK: Make it look like a DwtSelect.
	select.setSelectedValue = select.setValue;
	return select;
};

ZmEditContactViewOther.prototype._resetPicker = function() {
	if (this._picker) {
		var type = this.getValue().type;
		this._picker.setVisible(type in this.DATE_ATTRS);
	}
};

ZmEditContactViewOther.parseDate = function(dateStr) {
    // NOTE: Still try to parse date string in locale-specific
    // NOTE: format for backwards compatibility.
    var aDate = AjxDateUtil.simpleParseDateStr(dateStr);
    if (isNaN(aDate) || aDate == null) {
        var formatter = ZmEditContactViewOther._getDateFormatter();
        aDate = formatter.parse(dateStr);
    }
    return aDate;
};

ZmEditContactViewOther._getDateFormatter = function() {
    if (!ZmEditContactViewOther._formatter) {
        ZmEditContactViewOther._formatter = new AjxDateFormat("yyyy-MM-dd");
    }
    return ZmEditContactViewOther._formatter;
};

ZmEditContactViewOther.prototype._handleDropDown = function(evt) {
    var formatter = ZmEditContactViewOther._getDateFormatter();
    var value = this.getValue().value;
    var date = formatter.parse(value) || new Date;
    this._calendar.setDate(date);
    this._picker.popup();
};

ZmEditContactViewOther.prototype._handleDateSelection = function(calendar) {
	if (!calendar) calendar = this._calendar;
	var formatter = ZmEditContactViewOther._getDateFormatter();
	var value = this.getValue();
	value.value = formatter.format(calendar.getDate());
	this.setValue(value);
	this.parent.setDirty(true);
};

ZmEditContactViewOther.prototype._handleSelectChange = function(evt) {
    ZmEditContactViewInputSelect.prototype._handleSelectChange.call(this, evt, true);
};

//
// Class: ZmEditContactViewIM
//
/**
 * Creates the contact view IM field.
 * @class
 * This class represents the contact view IM field.
 * 
 * @param	{Hash}	params		a hash of parameters
 * 
 * @extends		ZmEditContactViewInputSelect
 * 
 * @private
 */
ZmEditContactViewIM = function(params) {
	if (arguments.length == 0) return;
	ZmEditContactViewInputSelect.apply(this, arguments);
};
ZmEditContactViewIM.prototype = new ZmEditContactViewInputSelect;
ZmEditContactViewIM.prototype.constructor = ZmEditContactViewIM;

/**
 * Returns a string representation of the object.
 * 
 * @return		{String}		a string representation of the object
 * @private
 */
ZmEditContactViewIM.prototype.toString = function() {
	return "ZmEditContactViewIM";
};

// constants

ZmEditContactViewIM.RE_VALUE = /^(.*?):\/\/(.*)$/;

// Public methods

ZmEditContactViewIM.prototype.setValue = function(value) {
	var m = ZmEditContactViewIM.RE_VALUE.exec(value);
	value = m ? { type:m[1],value:m[2] } : { type:"other",value:value };
	ZmEditContactViewInputSelect.prototype.setValue.call(this, value);
};
ZmEditContactViewIM.prototype.getValue = function() {
	var value = ZmEditContactViewInputSelect.prototype.getValue.call(this);
	return value.value ? [value.type, value.value].join("://") : "";
};

//
// Class: ZmEditContactViewIMDouble
//
/**
 * Creates the contact view IM field.
 * @class
 * This class represents the contact view IM field.
 * 
 * @param	{Hash}	params		a hash of parameters
 * 
 * @extends		ZmEditContactViewInputSelect
 * 
 * @private
 */
ZmEditContactViewIMDouble = function(params) {
	if (arguments.length == 0) return;
	ZmEditContactViewInputDoubleSelect.apply(this, arguments);
};
ZmEditContactViewIMDouble.prototype = new ZmEditContactViewInputDoubleSelect;
ZmEditContactViewIMDouble.prototype.constructor = ZmEditContactViewIMDouble;

/**
 * Returns a string representation of the object.
 * 
 * @return		{String}		a string representation of the object
 * @private
 */
ZmEditContactViewIMDouble.prototype.toString = function() {
	return "ZmEditContactViewIMDouble";
};

// constants

ZmEditContactViewIMDouble.RE_VALUE = /^(.*?):\/\/(.*)$/;

// Public methods

ZmEditContactViewIMDouble.prototype.setValue = function(value) {
	var obj;
	if (!value || value == "") {
		obj = { type2:"_NONE", value:"", type: null };
	} else {
		var url = value.type ? value.value : value;
		var m = ZmEditContactViewIMDouble.RE_VALUE.exec(url);
		obj = m ? { type2:m[1], value:m[2], type: value.type?value.type:null } : { type2: value.type2 || "other", value: url, type: value.type ? value.type : null };
	}
	ZmEditContactViewInputDoubleSelect.prototype.setValue.call(this, obj);
};

ZmEditContactViewIMDouble.prototype.getValue = function() {
	var value = ZmEditContactViewInputDoubleSelect.prototype.getValue.call(this);
	var url = (value.type2=="_NONE" || value.value=="") ? "" : [value.type2, value.value].join("://");
	var obj = value.type2 ? {
		type: value.type,
		type2: value.type2,
		value: url
	} : url;
	return obj;
};

ZmEditContactViewIMDouble.equals = function(a,b) {
	if (a === b) return true;
	if (!a || !b) return false;
	return a.type == b.type &&
           a.type2 == b.type2 &&
           a.value == b.value;
};

//
// Class: ZmEditContactViewAddress
//
/**
 * Creates the contact view address input field.
 * @class
 * This class represents the address input field.
 * 
 * @param	{Hash}	params		a hash of parameters
 * 
 * @extends		ZmEditContactViewInputSelect
 * 
 * @private
 */
ZmEditContactViewAddress = function(params) {
	if (arguments.length == 0) return;
	ZmEditContactViewInputSelect.call(this, params);
};
ZmEditContactViewAddress.prototype = new ZmEditContactViewInputSelect;
ZmEditContactViewAddress.prototype.constructor = ZmEditContactViewAddress;

/**
 * Returns a string representation of the object.
 * 
 * @return		{String}		a string representation of the object
 * @private
 */
ZmEditContactViewAddress.prototype.toString = function() {
	return "ZmEditContactViewAddress";  
};

// Data

ZmEditContactViewAddress.prototype.TEMPLATE = "abook.Contacts#ZmEditContactViewAddressSelect";

// Public methods

ZmEditContactViewAddress.prototype.setValue = function(value) {
	ZmEditContactViewInputSelect.prototype.setValue.apply(this, arguments);
	value = value || {};
	this._select.setSelectedValue(value.type);
	this._setStreet(value.Street);
	this._input.setValue("CITY", value.City);
	this._input.setValue("STATE", value.State);
	this._input.setValue("ZIP", value.PostalCode);
	this._input.setValue("COUNTRY", value.Country);
	this._input.setDirty(false);
	this._input.update();
};

ZmEditContactViewAddress.prototype.getValue = function() {
	return {
		type: this._select.getValue(),
		Street: this._getStreet(),
		City: this._input.getValue("CITY"),
		State: this._input.getValue("STATE"),
		PostalCode: this._input.getValue("ZIP"),
		Country: this._input.getValue("COUNTRY")
	};
};

ZmEditContactViewAddress.equals = function(a,b) {
	if (a === b) return true;
	if (!a || !b) return false;
	return a.type == b.type &&
           a.Street == b.Street && a.City == b.City && a.State == b.State &&
           a.PostalCode == b.PostalCode && a.Country == b.Country;
};

// Protected methods

ZmEditContactViewAddress.prototype._setControlIds = function(rowId, index) {
	var id = this.getHTMLElId();
	ZmEditContactViewInputSelect.prototype._setControlIds.apply(this, arguments);
	var fieldIds = ["STREET", "STREET1", "STREET2", "CITY", "STATE", "ZIP", "COUNTRY"];
	for (var i = 0; i < fieldIds.length; i++) {
		var fieldId = fieldIds[i];
		var form = this._input.getControl(fieldId);
		this._setControlId.call(form, form, [id,fieldId].join("_"));
	}
};

ZmEditContactViewAddress.prototype._setStreet = function(value) {
	var street1 = this._input.getControl("STREET1");
	if (street1) {
		var lines = value.split("\n");
		this._input.setValue("STREET1", lines[0]);
		this._input.setValue("STREET2", lines.slice(1).join(" "));
	}
	else {
		this._input.setValue("STREET", value);
	}
};
ZmEditContactViewAddress.prototype._getStreet = function() {
	var street1 = this._input.getControl("STREET1");
	if (street1) {
		var value1 = this._input.getValue("STREET1");
		var value2 = this._input.getControl("STREET1") ? this._input.getValue("STREET2") : null;
		return value2 ? [value1,value2].join("\n") : value1;  
	}
	return this._input.getValue("STREET");
};

ZmEditContactViewAddress.prototype._createInput = function() {
	var form = {
		template: "abook.Contacts#ZmEditContactViewAddress",
		// NOTE: The parent is a ZmEditContactViewInputSelect which knows
		// NOTE: its item ID and will set the dirty state on the main
		// NOTE: form appropriately.
		ondirty: "this.parent._handleDirty()",
		items: [
			{ id: "STREET", type: "DwtInputField", cols: (AjxEnv.isMozilla ? 56 : 58), rows: 2,
				hint: ZmMsg.AB_FIELD_street, params: { forceMultiRow: true }
			},
			{ id: "STREET1", type: "DwtInputField", cols: (AjxEnv.isMozilla ? 56 : 58), hint: ZmMsg.AB_FIELD_street },
			{ id: "STREET2", type: "DwtInputField", cols: (AjxEnv.isMozilla ? 56 : 58), hint: ZmMsg.AB_FIELD_street },
			{ id: "CITY", type: "DwtInputField", cols: 20, hint: ZmMsg.AB_FIELD_city },
			{ id: "STATE", type: "DwtInputField", cols: 12, hint: ZmMsg.AB_FIELD_state },
			{ id: "ZIP", type: "DwtInputField", cols: 10, hint: ZmMsg.AB_FIELD_postalCode },
			{ id: "COUNTRY", type: "DwtInputField", cols: 20, hint: ZmMsg.AB_FIELD_country }
		]
	};
	return new DwtForm({parent:this,form:form});
};

ZmEditContactViewAddress.prototype._handleDirty = function() {
	if (this._input && this._input.isDirty()) {
		this.parent.setDirty(true);
	}
};
