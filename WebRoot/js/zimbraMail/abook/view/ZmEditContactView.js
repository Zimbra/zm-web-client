/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2009 Zimbra, Inc.
 * 
 * The contents of this file are subject to the Yahoo! Public License
 * Version 1.0 ("License"); you may not use this file except in
 * compliance with the License.  You may obtain a copy of the License at
 * http://www.zimbra.com/license.
 * 
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * ***** END LICENSE BLOCK *****
 */

ZmEditContactView = function(parent, controller, isMyCardView) {
	if (arguments.length == 0) return;

	var form = {
		ondirty: "this.setValue('DEBUG',this.getDirtyItems().join(', '))",
		items: [
			// debug
//			{ id: "DEBUG", type: "DwtText", ignore:true },
			// header pseudo-items
			{ id: "FULLNAME", type: "DwtText", className: "contactHeader", 
				getter: this._getFullName, notab: true, ignore: true },
			// contact attribute fields
			{ id: "IMAGE", type: "ZmEditContactViewImage" },
			{ id: "PREFIX", type: "DwtInputField", cols: 5,  hint: ZmMsg.AB_FIELD_prefix, visible: "get('SHOW_PREFIX')" },
			{ id: "FIRST", type: "DwtInputField", cols: 10, hint: ZmMsg.AB_FIELD_firstName },
			{ id: "MIDDLE", type: "DwtInputField", cols: 10, hint: ZmMsg.AB_FIELD_middleName, visible: "get('SHOW_MIDDLE')" },
			{ id: "MAIDEN", type: "DwtInputField", cols: 15, hint: ZmMsg.AB_FIELD_maidenName, visible: "get('SHOW_MAIDEN')" },
			{ id: "LAST", type: "DwtInputField", cols: 15, hint: ZmMsg.AB_FIELD_lastName },
			{ id: "SUFFIX", type: "DwtInputField", hint: ZmMsg.AB_FIELD_suffix, cols: 5, visible: "get('SHOW_SUFFIX')" },
			{ id: "NICKNAME", type: "DwtInputField", cols: 10, hint: ZmMsg.AB_FIELD_nickname, visible: "get('SHOW_NICKNAME')" },
			{ id: "COMPANY", type: "DwtInputField", cols: 35, hint: ZmMsg.AB_FIELD_company, visible: "get('SHOW_COMPANY')" },
			{ id: "TITLE", type: "DwtInputField", cols: 35, hint: ZmMsg.AB_FIELD_jobTitle, visible: "get('SHOW_TITLE')" },
			{ id: "DEPARTMENT", type: "DwtInputField", cols: 35, hint: ZmMsg.AB_FIELD_department, visible: "get('SHOW_DEPARTMENT')" },
			{ id: "NOTES", type: "DwtInputField", cols: 60, rows:4 },
			// contact list fields
			{ id: "EMAIL", type: "ZmEditContactViewRows", rowitem: {
				type: "ZmEditContactViewInputSelect", equals:ZmEditContactViewInputSelect.equals, params: {
					hint: ZmMsg.emailAddrHint, cols: 40,
					options: [
						{ value: ZmContact.F_email, label: ZmMsg.home },
						{ value: ZmContact.F_workEmail, label: ZmMsg.work }
					]
				}
			} },
			{ id: "PHONE", type: "ZmEditContactViewRows", rowitem: {
				type: "ZmEditContactViewInputSelect", equals:ZmEditContactViewInputSelect.equals, params: {
					hint: ZmMsg.phoneNumberHint,
					options: [
						{ value: ZmContact.F_mobilePhone, label: ZmMsg.phoneLabelMobile },
						{ value: ZmContact.F_workPhone, label: ZmMsg.phoneLabelWork },
						{ value: ZmContact.F_workFax, label: ZmMsg.phoneLabelWorkFax },
//						{ value: "office", label: ZmMsg.office },
						{ value: ZmContact.F_companyPhone, label: ZmMsg.phoneLabelCompany },
						{ value: ZmContact.F_homePhone, label: ZmMsg.phoneLabelHome },
						{ value: ZmContact.F_homeFax, label: ZmMsg.phoneLabelHomeFax },
						{ value: ZmContact.F_pager, label: ZmMsg.phoneLabelPager },
						{ value: ZmContact.F_callbackPhone, label: ZmMsg.phoneLabelCallback },
						{ value: ZmContact.F_assistantPhone, label: ZmMsg.phoneLabelAssistant },
						{ value: ZmContact.F_carPhone, label: ZmMsg.phoneLabelCar },
						{ value: ZmContact.F_otherPhone, label: ZmMsg.phoneLabelOther }
					]
				}
			} },
			{ id: "IM", type: "ZmEditContactViewRows", rowitem: {
				type: "ZmEditContactViewIM", params: {
					hint: ZmMsg.imScreenNameHint,
					options: [
						{ value: "local", label: ZmMsg.imGateway_xmpp },
						{ value: "yahoo", label: ZmMsg.imGateway_yahoo },
						{ value: "aol", label: ZmMsg.imGateway_aol },
						{ value: "msn", label: ZmMsg.imGateway_msn },
						{ value: "other", label: ZmMsg.other }
					]
				}
			} },
			{ id: "ADDRESS", type: "ZmEditContactViewRows",
				rowtemplate: "abook.Contacts#ZmEditContactViewAddressRow",
				rowitem: { type: "ZmEditContactViewAddress", equals: ZmEditContactViewAddress.equals,
					params: { options: [
						{ value: "home", label: ZmMsg.home },
						{ value: "work", label: ZmMsg.work },
						{ value: "other", label: ZmMsg.other }
					] }
				}
			},
			{ id: "URL", type: "ZmEditContactViewRows", rowitem: {
				type: "ZmEditContactViewInputSelect", equals:ZmEditContactViewInputSelect.equals, params: {
					cols: 60, hint: ZmMsg.url,  
					options: [
						{ value: ZmContact.F_homeURL, label: ZmMsg.home },
						{ value: ZmContact.F_workURL, label: ZmMsg.work },
						{ value: ZmContact.F_otherURL, label: ZmMsg.other }
					]
				}
			} },
			{ id: "OTHER", type: "ZmEditContactViewRows", rowitem: {
				type: "ZmEditContactViewOther", equals:ZmEditContactViewInputSelect.equals, params: {
					cols: 30, hint: ZmMsg.genericTextHint,
					options: [
						{ value: ZmContact.F_birthday, label: ZmMsg.AB_FIELD_birthday },
						{ value: ZmContact.F_anniversary, label: ZmMsg.AB_FIELD_anniversary },
						{ value: "custom", label: ZmMsg.AB_FIELD_custom }
					]
				}
			} },
			// other controls
			{ id: "DETAILS", type: "DwtButton", label: "\u00BB", ignore:true,  // &raquo;
				className: "ZmEditContactViewDetailsButton",
				template: "abook.Contacts#ZmEditContactViewDetailsButton"
			},
			{ id: "FILE_AS", type: "DwtSelect", items: [
				{ value: ZmContact.FA_LAST_C_FIRST, label: ZmMsg.AB_FILE_AS_lastFirst },
				{ value: ZmContact.FA_FIRST_LAST, label: ZmMsg.AB_FILE_AS_firstLast },
				{ value: ZmContact.FA_COMPANY, label: ZmMsg.AB_FILE_AS_company },
				{ value: ZmContact.FA_LAST_C_FIRST_COMPANY, label: ZmMsg.AB_FILE_AS_lastFirstCompany },
				{ value: ZmContact.FA_FIRST_LAST_COMPANY, label: ZmMsg.AB_FILE_AS_firstLastCompany },
				{ value: ZmContact.FA_COMPANY_LAST_C_FIRST, label: ZmMsg.AB_FILE_AS_companyLastFirst },
				{ value: ZmContact.FA_COMPANY_FIRST_LAST, label: ZmMsg.AB_FILE_AS_companyFirstLast }
				// TODO: [Q] ZmContact.FA_CUSTOM ???
			] },
			{ id: "FOLDER", type: "DwtButton", image: "ContactsFolder",
				enabled: "this._contact && !this._contact.isShared()", 
				onclick: this._handleFolderButton
			},
			// NOTE: Return false onclick to prevent default action
			{ id: "VIEW_IMAGE", ignore: true, onclick: "open(get('IMAGE')) && false" },
			{ id: "REMOVE_IMAGE", ignore: true, onclick: "this.setValue('IMAGE','',true) && false",
				visible: "get('IMAGE')" },
			// pseudo-items
			{ id: "JOB", notab: true, ignore:true, visible: "get('SHOW_TITLE') && get('SHOW_DEPARTMENT')" },
			{ id: "TITLE_DEPARTMENT_SEP", notab: true,
				ignore:true, visible: "get('SHOW_TITLE') && get('SHOW_DEPARTMENT')"
			}
		]
	};

	var params = {
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
	this._isMyCardView = isMyCardView;

	this.setScrollStyle(Dwt.SCROLL);
};

ZmEditContactView.prototype = new DwtForm;
ZmEditContactView.prototype.constructor = ZmEditContactView;

ZmEditContactView.prototype.toString = function() {
	return "ZmEditContactView";
};

//
// Constants
//

// Message dialog placement
ZmEditContactView.DIALOG_X = 50;
ZmEditContactView.DIALOG_Y = 100;

ZmEditContactView.SHOW_ID_PREFIXES = [
	"PREFIX","MIDDLE","MAIDEN","SUFFIX","NICKNAME","TITLE","DEPARTMENT","COMPANY"
];
ZmEditContactView.SHOW_ID_LABELS = [
	ZmMsg.AB_FIELD_prefix,
	ZmMsg.AB_FIELD_middleName,
	ZmMsg.AB_FIELD_maidenName,
	ZmMsg.AB_FIELD_suffix,
	ZmMsg.AB_FIELD_nickname,
	ZmMsg.AB_FIELD_jobTitle,
	ZmMsg.AB_FIELD_department,
	ZmMsg.AB_FIELD_company
];

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

ZmEditContactView.LISTS = {
	ADDRESS: {attrs:ZmContact.ADDRESS_FIELDS}, // NOTE: placeholder for custom handling
	EMAIL: {attrs:ZmContact.EMAIL_FIELDS },
	PHONE: {attrs:ZmContact.PHONE_FIELDS},
	IM: {attrs:ZmContact.IM_FIELDS, addone:ZmContact.IS_ADDONE, onlyvalue:true},
	URL: {attrs:ZmContact.URL_FIELDS},
	OTHER: {attrs:ZmContact.OTHER_FIELDS, addone:ZmContact.IS_ADDONE}
};

ZmEditContactView.ADDR_PREFIXES = ["work","home","other"];
ZmEditContactView.ADDR_SUFFIXES = ["Street","City","State","PostalCode","Country"];

//
// Data
//

ZmEditContactView.prototype.TEMPLATE = "abook.Contacts#ZmEditContactView";

//
// Public methods
//

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
	var folderOrId = contact && contact.getAddressBook();
	if (!folderOrId) {
		var overview = appCtxt.getApp(ZmApp.CONTACTS).getOverview();
		folderOrId = overview && overview.getSelected();
	}
	this._setFolder(folderOrId || ZmOrganizer.ID_ADDRBOOK);
	this.setValue("IMAGE", (contact && contact.getImageUrl()) || "", true);

	// check show detail items for fields with values
	for (var id in ZmEditContactView.ATTRS) {
		var showId = "SHOW_"+id;
		var control = this.getControl(showId);
		if (control == null) continue;
		var checked = (this.getValue(id) || "") != "";
		this.setValue(showId, checked);
		control.setChecked(checked, true); // skip notify
	}

	// populate lists
	this._listAttrs = {};
	for (var id in ZmEditContactView.LISTS) {
		switch (id) {
			case "ADDRESS": {
				this.__initRowsAddress(contact, id, this._listAttrs);
				break;
			}
			case "OTHER": {
				var list = ZmEditContactView.LISTS[id];
				this.__initRowsOther(contact, id, list.attrs, list.addone, list.onlyvalue, this._listAttrs);
				break;
			}
			default: {
				var list = ZmEditContactView.LISTS[id];
				this.__initRowsControl(contact, id, list.attrs, list.addone, list.onlyvalue, this._listAttrs);
			}
		}
	}

	// mark form as clean and update display
	if (!isDirty) {
		this.reset(true);
	}

	// listen to changes in the contact
	if (contact) {
		contact.removeChangeListener(this._changeListener);
	}
	contact.addChangeListener(this._changeListener);

	// notify zimlets that a new contact is being shown.
	appCtxt.notifyZimlets("onContactEdit", [this, this._contact, this._htmlElId]);
};

ZmEditContactView.prototype.getContact = function() {
	return this._contact;
};

ZmEditContactView.prototype.getModifiedAttrs = function() {
	var itemIds = this.getDirtyItems();
	var counts = {};
	var attributes = {};

	// get list of modified attributes
	for (var i = 0; i < itemIds.length; i++) {
		var id = itemIds[i];
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
				}
				else {
					var onlyvalue = id == "IM";
					var v = onlyvalue ? item : item.value;
					if (!v) continue;
					var list = ZmEditContactView.LISTS[id];
					var a = onlyvalue ? list.attrs[0] : item.type;
					if (!counts[a]) counts[a] = 0;
					var count = ++counts[a];
					a = (count > 1 || (list.addone && list.addone[a])) ? a+count : a;
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
	var listAttrs = this._listAttrs;
	for (var id in listAttrs) {
		if (!this.isDirty(id)) continue;
		var attrs = listAttrs[id];
		for (var i = 0; i < attrs.length; i++) {
			var aname = attrs[i];
			// clear attribute if no longer has a value
			if (!(aname in attributes)) {
				attributes[aname] = "";
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
		console.log("image was modified: value=",value);
		var m = /aid=(.*)/.exec(value);
		if (m) {
			console.log("setting attachment id to ",m[1]);
			// NOTE: ZmContact.modify expects the "aid_" prefix.
			attributes[ZmContact.F_image] = "aid_"+m[1];
		}
	}

	return attributes;
};

ZmEditContactView.prototype.isEmpty = function() {
	for (var id in this._items) {
		var item = this._items[id];
		if (this.isIgnore(id)) continue;
		if (this.getValue(id)) return false;
	}
	return true;
};

ZmEditContactView.prototype.enableInputs = function(bEnable) {
	// ignore
};

ZmEditContactView.prototype.cleanup = function() {
	this._contact = null;
};

//
// ZmListController methods
//

ZmEditContactView.prototype.getList = function() { return null; };

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

ZmEditContactView.prototype.getTitle = function() {
	return [ZmMsg.zimbraTitle, ZmMsg.contact].join(": ");
};

//
// Protected methods
//

ZmEditContactView.prototype._getFullName = function() {
	var contact = {
		fileAs: this.getValue("FILE_AS"),
		firstName: this.getValue("FIRST"), lastName: this.getValue("LAST"),
		company: this.getValue("COMPANY")
	};
	return ZmContact.computeFileAs(contact);
};

ZmEditContactView.prototype._getDefaultFocusItem = function() {
	return this.getControl("FIRST");
};

ZmEditContactView.prototype._setFolder = function(organizerOrId) {
	var organizer = organizerOrId instanceof ZmOrganizer ? organizerOrId : appCtxt.getById(organizerOrId);
	this.setLabel("FOLDER", organizer.getName());
	this.setValue("FOLDER", organizer.id);
};

ZmEditContactView.prototype._getDialogXY =
function() {
	var loc = Dwt.toWindow(this.getHtmlElement(), 0, 0);
	return new DwtPoint(loc.x + ZmEditContactView.DIALOG_X, loc.y + ZmEditContactView.DIALOG_Y);
};

// listeners

ZmEditContactView.prototype._handleDetailCheck = function(itemId, id) {
	this.setValue(itemId, !this.getValue(itemId));
	this.update();
	var control = this.getControl(id);
	if (control) {
		control.focus();
	}
};

ZmEditContactView.prototype._handleFolderButton = function(ev) {
	var dialog = appCtxt.getChooseFolderDialog();
	dialog.registerCallback(DwtDialog.OK_BUTTON, new AjxCallback(this, this._handleChooseFolder));
	var params = {
		overviewId:		dialog.getOverviewId(ZmApp.CONTACTS),
		title:			ZmMsg.chooseAddrBook,
		treeIds:		[ZmOrganizer.ADDRBOOK],
		skipReadOnly:	true,
		skipRemote:		true,
		noRootSelect:	true
	};
	params.omit = {};
	params.omit[ZmFolder.ID_TRASH] = true;
	params.omit[ZmOrganizer.ID_AUTO_ADDED] = true;
	dialog.popup(params);
};

ZmEditContactView.prototype._handleChooseFolder = function(organizer) {
	var dialog = appCtxt.getChooseFolderDialog();
	dialog.popdown();
	this._setFolder(organizer);
};

ZmEditContactView.prototype._contactChangeListener = function(ev) {
	if (ev.type != ZmEvent.S_CONTACT) return;
	if (ev.event == ZmEvent.E_TAGS || ev.event == ZmEvent.E_REMOVE_ALL) {
		// TODO
//		this._setTags(this._contact);
	}
};

ZmEditContactView.prototype._tagChangeListener = function(ev) {
	if (ev.type != ZmEvent.S_TAG) { return; }

	var fields = ev.getDetail("fields");
	var changed = fields && (fields[ZmOrganizer.F_COLOR] || fields[ZmOrganizer.F_NAME]);
	if ((ev.event == ZmEvent.E_MODIFY && changed) ||
		ev.event == ZmEvent.E_DELETE ||
		ev.event == ZmEvent.MODIFY)
	{
		// TODO
//		this._setTags();
	}
};

//
// Private methods
//

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
			var itemId = "SHOW_"+id;
			var listener = new AjxListener(this, this._handleDetailCheck, [itemId, id]);
			menuitem.addSelectionListener(listener);
			this._registerControl({ id: itemId, control: menuitem, ignore: true });
			count++;
		}
	}
	return count > 0 ? menu : null;
};

ZmEditContactView.prototype.__initRowsControl =
function(contact,id,prefixes,addone,onlyvalue,listAttrs,skipSetValue) {
	var array = [];
	for (var j = 0; j < prefixes.length; j++) {
		var prefix = prefixes[j];
		for (var i = 1; true; i++) {
			var a = (i > 1 || (addone && addone[prefix])) ? prefix+i : prefix;
			var value = contact.getAttr(a);
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

ZmEditContactView.prototype.__initRowsOther =
function(contact,id,prefixes,addone,onlyvalue,listAttrs) {
	var array = this.__initRowsControl.call(this,contact,id,prefixes,addone,onlyvalue,listAttrs,true);

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
	var attrs = contact.getAttrs();
	for (var aname in attrs) {
		aname = aname.replace(/\d+$/,"");
		if (ZmContact.IS_IGNORE[aname]) continue;
		if (!(aname in attributes)) {
			array.push({type:aname,value:attrs[aname]});
			if (!listAttrs[id]) listAttrs[id] = [];
			listAttrs[id].push(aname);
		}
	}

	this.setValue(id, array);
};

ZmEditContactView.prototype.__initRowsAddress = function(contact,id,listAttrs) {
	var array = [];
	var prefixes = ZmEditContactView.ADDR_PREFIXES;
	var suffixes = ZmEditContactView.ADDR_SUFFIXES;
	for (var k = 0; k < prefixes.length; k++) {
		var prefix = prefixes[k];
		for (var j = 1; true; j++) {
			var address = null;
			for (var i = 0; i < suffixes.length; i++) {
				var suffix = suffixes[i];
				var a = [prefix,suffix,j>1?j:""].join("");
				var value = contact.getAttr(a);
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

ZmEditContactViewImage = function(params) {
	if (arguments.length == 0) return;
	params.className = params.className || "ZmEditContactViewImage";
	params.posStyle = Dwt.RELATIVE_STYLE;
	DwtControl.apply(this, arguments);

	var el = this.getHtmlElement();
	el.innerHTML = [
		"<div style='width:48;height:48'>",
			"<img id='",this._htmlElId,"_img' width=48 height=48>",
		"</div>",
		"<div id='",this._htmlElId,"_badge' style='position:absolute;bottom:0;right:8'>"
	].join("");
//	el.style.width = 52;
//	el.style.height = 52;
	el.style.cursor = "pointer";

	this._src = "";
	this._imgEl = document.getElementById(this._htmlElId+"_img");
	this._imgEl.onload = AjxCallback.simpleClosure(this._imageLoaded, this);
	this._badgeEl = document.getElementById(this._htmlElId+"_badge");

	this._setMouseEvents();

	this.addListener(DwtEvent.ONMOUSEOVER, new AjxListener(Dwt.addClass, [el,DwtControl.HOVER]));
	this.addListener(DwtEvent.ONMOUSEOUT, new AjxListener(Dwt.delClass, [el,DwtControl.HOVER]));
	this.addListener(DwtEvent.ONMOUSEUP, new AjxListener(this, this._chooseImage));
};
ZmEditContactViewImage.prototype = new DwtControl;
ZmEditContactViewImage.prototype.constructor = ZmEditContactViewImage;

ZmEditContactViewImage.prototype.toString = function() {
	return "ZmEditContactViewImage";
};

// Constants

ZmEditContactViewImage.NO_IMAGE_URL = appContextPath + "/img/large/ImgPerson_48.gif";
ZmEditContactViewImage.IMAGE_URL = "/service/content/proxy?aid=@aid@";

// Public methods

ZmEditContactViewImage.prototype.setValue = function(value) {
	this._src = value;
	if (!value) {
		this._imgEl.src = ZmEditContactViewImage.NO_IMAGE_URL;
		this._badgeEl.className = "ImgAdd";
	}
	else {
		this._imgEl.src = value;
		this._badgeEl.className = "ImgEdit";
	}
	this.parent.setDirty("IMAGE", true);
};

ZmEditContactViewImage.prototype.getValue = function() {
	return this._src;
};

// Protected methods

ZmEditContactViewImage.prototype._imageLoaded = function() {
	this._imgEl.setAttribute("width", "");
	this._imgEl.setAttribute("height", "");
	var w = this._imgEl.width;
	var h = this._imgEl.height;
	this._imgEl.setAttribute("width", w > h ? 48 : "");
	this._imgEl.setAttribute("height", w > h ? "" : 48);
};

ZmEditContactViewImage.prototype._chooseImage = function() {
	var dialog = appCtxt.getUploadDialog();
	var folder = null;
	var callback = new AjxCallback(this, this._handleImageSaved);
	var title = ZmMsg.uploadImage;
	var location = null;
	var oneFileOnly = true;
	var noResolveAction = true;
	dialog.popup(folder, callback, title, location, oneFileOnly, noResolveAction);
};

ZmEditContactViewImage.prototype._handleImageSaved = function(folder, filenames, files) {
	var dialog = appCtxt.getUploadDialog();
	dialog.popdown();
	this.setValue(ZmEditContactViewImage.IMAGE_URL.replace(/@aid@/, files[0].guid));
	this.parent.update();
};

ZmEditContactViewImage.prototype._createElement = function() {
	return document.createElement("FIELDSET");
};

//
// Class: ZmEditContactViewRows
//

ZmEditContactViewRows = function(params) {
	if (arguments.length == 0) return;
	if (!params.formItemDef) params.formItemDef = {};
	params.formItemDef.onremoverow = "this.setDirty(true)";
	params.className = params.className || "ZmEditContactViewRows";
	DwtFormRows.apply(this, arguments);
};
ZmEditContactViewRows.prototype = new DwtFormRows;
ZmEditContactViewRows.prototype.constructor = ZmEditContactViewRows;

ZmEditContactViewRows.prototype.toString = function() {
	return "ZmEditContactViewRows";
};

// Public methods

ZmEditContactViewRows.prototype.setDirty = function() {
	DwtFormRows.prototype.setDirty.apply(this, arguments);
	this.parent.setDirty(this._itemDef.id, this.isDirty());
};

//
// Class: ZmEditContactViewInputSelect
//

ZmEditContactViewInputSelect = function(params) {
	if (arguments.length == 0) return;
	this._formItemId = params.formItemDef.id;
	this._options = params.options || [];
	this._cols = params.cols;
	this._hint = params.hint;
	DwtComposite.apply(this, arguments);
	this._tabGroup = new DwtTabGroup(this._htmlElId);
	this._createHtml(params.template);
};
ZmEditContactViewInputSelect.prototype = new DwtComposite;
ZmEditContactViewInputSelect.prototype.constructor = ZmEditContactViewInputSelect;

ZmEditContactViewInputSelect.prototype.toString = function() {
	return "ZmEditContactViewInputSelect";
};

// Data

ZmEditContactViewInputSelect.prototype.TEMPLATE = "abook.Contacts#ZmEditContactViewInputSelect";

// Public methods

ZmEditContactViewInputSelect.prototype.setValue = function(value) {
	if (this._input) {
		this._input.setValue((value && value.value) || "");
	}
	if (this._select) {
		this._select.setSelectedValue((value && value.type) || this._options[0].value);
	}
};
ZmEditContactViewInputSelect.prototype.getValue = function() {
	return {
		type:  this._select ? this._select.getValue() : "",
		value: this._input  ? this._input.getValue()  : "" 
	};
};

ZmEditContactViewInputSelect.prototype.setDirty = function(dirty) {
	if (this.parent instanceof DwtForm) {
		this.parent.setDirty(true);
	}
};

ZmEditContactViewInputSelect.equals = function(a, b) {
//	console.log("ZmEditContactViewInputSelect.equals[a=",a,"][b=",b,"]");
	if (a === b) return true;
	if (!a || !b) return false;
	return a.type == b.type && a.value == b.value;
};

// Protected methods

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
	if (selectEl) {
		this._select = this._createSelect(this._options);
		this._select.addChangeListener(new AjxListener(this, this._handleSelectChange));
		this._select.replaceElement(selectEl);
		if (selectEl.getAttribute("notab") != "true") {
			tabIndexes.push({
				tabindex: selectEl.getAttribute("tabindex") || Number.MAX_VALUE,
				control: this._select
			});
		}
	}
};

ZmEditContactViewInputSelect.prototype._createInput = function() {
	var input = new DwtInputField({parent:this,size:this._cols});
	input.setHint(this._hint);
	input.setHandler(DwtEvent.ONKEYDOWN, AjxCallback.simpleClosure(this._handleInputKeyDown, this, input));
	input.setHandler(DwtEvent.ONKEYUP, AjxCallback.simpleClosure(this._handleInputKeyUp, this, input));
	return input;
};

ZmEditContactViewInputSelect.prototype._createSelect = function(options) {
	var select = new DwtSelect({parent:this});
	for (var i = 0; i < options.length; i++) {
		var option = options[i];
		select.addOption(option.label || option.value, i == 0, option.value);
	}
	return select;
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

ZmEditContactViewInputSelect.prototype._handleSelectChange = function(input, evt) {
	this.setDirty(true);
};

// DwtControl methods

ZmEditContactViewInputSelect.prototype.getTabGroupMember = function() {
	return this._tabGroup;
};

//
// Class: ZmEditContactViewOther
//

ZmEditContactViewOther = function(params) {
	if (arguments.length == 0) return;
	ZmEditContactViewInputSelect.apply(this, arguments);
	var option = params.options && params.options[0];
	this.setValue({type:option && option.value});
};
ZmEditContactViewOther.prototype = new ZmEditContactViewInputSelect;
ZmEditContactViewOther.prototype.constructor = ZmEditContactViewOther;

ZmEditContactViewOther.prototype.toString = function() {
	return "ZmEditContactViewOther";
};

// Data

ZmEditContactViewOther.prototype.TEMPLATE = "abook.Contacts#ZmEditContactViewOther";

// Public methods

ZmEditContactViewOther.prototype.setValue = function(value) {
	ZmEditContactViewInputSelect.prototype.setValue.apply(this, arguments);
	this._resetPicker();
};
ZmEditContactViewOther.prototype.getValue = function() {
	return {
		type: this._select.getValue() || this._select.getText(),
		value: this._input.getValue()
	};
};

// Protected methods

ZmEditContactViewOther.prototype._createHtmlFromTemplate = function(templateId, data) {
	ZmEditContactViewInputSelect.prototype._createHtmlFromTemplate.apply(this, arguments);

	var tabIndexes = this._tabIndexes;
	var pickerEl = document.getElementById(data.id+"_picker");
	if (pickerEl) {
		this._picker = new DwtButton({parent:this});
		this._picker.setImage("CalendarApp");
		var menu = new DwtMenu({parent:this._picker,style:DwtMenu.CALENDAR_PICKER_STYLE});
		this._picker.setMenu(menu);
		this._picker.replaceElement(pickerEl);
		var calendar = new DwtCalendar({parent:menu});
		calendar.setDate(new Date());
		calendar.setFirstDayOfWeek(appCtxt.get(ZmSetting.CAL_FIRST_DAY_OF_WEEK) || 0);
		calendar.addSelectionListener(new AjxListener(this,this._handleDateSelection,[calendar]));
		tabIndexes.push({
			tabindex: pickerEl.getAttribute("tabindex") || Number.MAX_VALUE,
			control: this._picker
		});
	}
};

ZmEditContactViewOther.prototype._createSelect = function() {
	var select = new DwtComboBox({parent:this,inputParams:{size:14}});
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
		this._picker.setVisible(type == "birthday" || type == "anniversary");
	}
};

ZmEditContactViewOther.prototype._handleDateSelection = function(calendar) {
	var value = this.getValue();
	if (!this._formatter) {
		var pattern = AjxDateFormat.getDateInstance(AjxDateFormat.SHORT).toPattern();
		this._formatter = new AjxDateFormat(pattern);
		var segments = this._formatter.getSegments();
		for (var i = 0; i < segments.length; i++) {
			if (segments[i] instanceof AjxDateFormat.YearSegment) {
				segments[i] = new AjxDateFormat.YearSegment(this._formatter,"yyyy");
			}
		}
	}
	value.value = this._formatter.format(calendar.getDate());
	this.setValue(value);
};

//
// Class: ZmEditContactViewIM
//

ZmEditContactViewIM = function(params) {
	if (arguments.length == 0) return;
	ZmEditContactViewInputSelect.apply(this, arguments);
};
ZmEditContactViewIM.prototype = new ZmEditContactViewInputSelect;
ZmEditContactViewIM.prototype.constructor = ZmEditContactViewIM;

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
	return [value.type, value.value].join("://");
};

//
// Class: ZmEditContactViewAddress
//

ZmEditContactViewAddress = function(params) {
	if (arguments.length == 0) return;
	ZmEditContactViewInputSelect.call(this, params);
};
ZmEditContactViewAddress.prototype = new ZmEditContactViewInputSelect;
ZmEditContactViewAddress.prototype.constructor = ZmEditContactViewAddress;

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
	this._input.setValue("STREET", value.Street);
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
		Street: this._input.getValue("STREET"),
		City: this._input.getValue("CITY"),
		State: this._input.getValue("STATE"),
		PostalCode: this._input.getValue("ZIP"),
		Country: this._input.getValue("COUNTRY")
	};
};

ZmEditContactViewAddress.equals = function(a,b) {
//	console.log("ZmEditContactViewAddress.equals[a=",a,"][b=",b,"]");
	if (a === b) return true;
	if (!a || !b) return false;
	return a.type == b.type &&
           a.Street == b.Street && a.City == b.City && a.State == b.State &&
           a.PostalCode == b.PostalCode && a.Country == b.Country;
};

// Protected methods

ZmEditContactViewAddress.prototype._createInput = function() {
	var form = {
		template: "abook.Contacts#ZmEditContactViewAddress",
		// NOTE: The parent is a ZmEditContactViewInputSelect which knows
		// NOTE: its item ID and will set the dirty state on the main
		// NOTE: form appropriately.
		ondirty: "this.parent._handleDirty()",
		items: [
			{ id: "STREET", type: "DwtInputField", cols: 40, rows: 1,
				hint: ZmMsg.AB_FIELD_street, params: { forceMultiRow: true }
			},
			{ id: "CITY", type: "DwtInputField", cols: 20, hint: ZmMsg.AB_FIELD_city },
			{ id: "STATE", type: "DwtInputField", cols: 10, hint: ZmMsg.AB_FIELD_state },
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