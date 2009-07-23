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
//		ondirty: "this.setValue('DEBUG',[arguments[0],this.getDirtyItems().join(', ')].join(' - '))",
		items: [
			// debug
//			{ id: "DEBUG", type: "DwtText", ignore:true },
			// header pseudo-items
			{ id: "FULLNAME", type: "DwtText", className: "contactHeader", 
				ignore: true, getter: this._getFullName },
			// contact attribute fields
			{ id: "IMAGE", type: "ZmEditContactViewImage" },
			{ id: "PREFIX", type: "DwtInputField", cols: 5,  hint: "[prefix]", visible: "get('SHOW_PREFIX')" },
			{ id: "FIRST", type: "DwtInputField", cols: 10, hint: "[first name]" },
			{ id: "MIDDLE", type: "DwtInputField", cols: 10, hint: "[middle name]", visible: "get('SHOW_MIDDLE')" },
			{ id: "MAIDEN", type: "DwtInputField", cols: 15, hint: "[maiden name]", visible: "get('SHOW_MAIDEN')" },
			{ id: "LAST", type: "DwtInputField", cols: 15, hint: "[last name]" },
			{ id: "SUFFIX", type: "DwtInputField", hint: "[suffix]", cols: 5, visible: "get('SHOW_SUFFIX')" },
			{ id: "NICKNAME", type: "DwtInputField", cols: 10, hint: "[nickname]", visible: "get('SHOW_NICKNAME')" },
			{ id: "COMPANY", type: "DwtInputField", cols: 35, hint: "[company]", visible: "get('SHOW_COMPANY')" },
			{ id: "TITLE", type: "DwtInputField", cols: 35, hint: "[job title]", visible: "get('SHOW_TITLE')" },
			{ id: "DEPARTMENT", type: "DwtInputField", cols: 35, hint: "[department]", visible: "get('SHOW_DEPARTMENT')" },
			{ id: "NOTES", type: "DwtInputField", cols: 60, rows:4 },
			// contact list fields
			{ id: "EMAIL", type: "ZmEditContactViewRows", rowitem: {
				type: "DwtInputField", cols: 40, hint: "[email address]" 
			} },
			{ id: "PHONE", type: "ZmEditContactViewRows", rowitem: {
				type: "ZmEditContactViewInputSelect", params: {
					hint: "[phone number]",
					options: [
						{ value: "office", label: "[Office]" },
						{ value: "homePhone", label: "[Home]" },
						{ value: "mobilePhone", label: "[Mobile]" },
						{ value: "workPhone", label: "[Work]" },
						{ value: "homeFax", label: "[Home fax]" },
						{ value: "workFax", label: "[Work fax]" },
						{ value: "pager", label: "[Pager]" },
						{ value: "callbackPhone", label: "[Callback]" },
						{ value: "carPhone", label: "[Car phone]" },
						{ value: "companyPhone", label: "[Company]" },
						{ value: "otherPhone", label: "[Other]" }
					]
				}
			} },
			{ id: "IM", type: "ZmEditContactViewRows", rowitem: {
				type: "ZmEditContactViewIM", params: {
					hint: "[screen name]",
					options: [
						{ value: "local", label: "[Zimbra]" },
						{ value: "yahoo", label: "[Yahoo!]" },
						{ value: "aol", label: "[AOL]" },
						{ value: "msn", label: "[MSN]" },
						{ value: "other", label: "[Other]" }
					]
				}
			} },
			{ id: "ADDRESS", type: "ZmEditContactViewRows",
				rowtemplate: "abook.Contacts#ZmEditContactViewAddressRow",
				rowitem: { type: "ZmEditContactViewAddress", params: {
					options: [
						{ value: "home", label: "[Home]" },
						{ value: "work", label: "[Work]" },
						{ value: "other", label: "[Other]" }
					]
				}
			} },
			{ id: "URL", type: "ZmEditContactViewRows", rowitem: {
				type: "ZmEditContactViewInputSelect", params: {
					cols: 60, hint: "[URL]",  
					options: [
						{ value: "homeURL", label: "[Home]" },
						{ value: "workURL", label: "[Work]" },
						{ value: "otherURL", label: "[Other]" }
					]
				}
			} },
			{ id: "OTHER", type: "ZmEditContactViewRows", rowitem: {
				type: "ZmEditContactViewOther", params: {
					cols: 30, hint: "[enter text]", 
					options: [
						{ value: "birthday", label: "[Birthday]" },
						{ value: "anniversary", label: "[Anniversary]" },
						{ value: "assistant", label: "[Assistant]" },
						{ value: "custom1", label: "[Custom]" }
					]
				}
			} },
			// other controls
			{ id: "DETAILS", type: "DwtButton", label: "\u00BB", ignore:true,  // &raquo;
				className: "ZmEditContactViewDetailsButton",
				template: "abook.Contacts#ZmEditContactViewDetailsButton"
			},
			{ id: "FILE_AS", type: "DwtSelect", items: [
				{ value: ZmContact.FA_LAST_C_FIRST, label: "[Last, First]" },
				{ value: ZmContact.FA_FIRST_LAST, label: "[First Last]" },
				{ value: ZmContact.FA_COMPANY, label: "[Company]" },
				{ value: ZmContact.FA_LAST_C_FIRST_COMPANY, label: "[Last, First (Company)]" },
				{ value: ZmContact.FA_FIRST_LAST_COMPANY, label: "[First Last (Company)]" },
				{ value: ZmContact.FA_COMPANY_LAST_C_FIRST, label: "[Company (Last, First)]" },
				{ value: ZmContact.FA_COMPANY_FIRST_LAST, label: "[Company (First Last)]" }
				// TODO: [Q] ZmContact.FA_CUSTOM ???
			] },
			{ id: "FOLDER", type: "DwtButton", onclick: this._handleFolderButton },
			{ id: "REMOVE_IMAGE", ignore: true, visible: "get('IMAGE')", onclick: "set('IMAGE','')" },
			// pseudo-items
			{ id: "JOB", ignore:true, visible: "get('SHOW_TITLE') && get('SHOW_DEPARTMENT')" },
			{ id: "TITLE_DEPARTMENT_SEP", ignore:true, visible: "get('SHOW_TITLE') && get('SHOW_DEPARTMENT')" }
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

	// init other controls
//	var fullname = this.getControl("FULLNAME");
//	var fullnameEl = fullname && fullname.getTextNode();
//	if (fullnameEl) {
//		fullnameEl.parentNode.style.fontSize = "2em";
//		fullnameEl.parentNode.style.fontWeight = "bold";
//	}

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

ZmEditContactView.prototype.__getDetailsMenu = function() {
	var menu = new DwtMenu({parent:this.getControl("DETAILS"),style:DwtMenu.POPUP_STYLE});
	var ids = ZmEditContactView.SHOW_ID_PREFIXES;
	var labels = ["[Prefix]","[Middle name]","[Maiden name]","[Suffix]","[Nickname]","[Job title]","[Department]","[Company]"];
	var count = 0;
	for (var i = 0; i < ids.length; i++) {
		var id = ids[i];
		if (this.getControl(id)) {
			var menuitem = new DwtMenuItem({parent:menu, style:DwtMenuItem.CHECK_STYLE});
			menuitem.setText(labels[i]);
			var itemId = "SHOW_"+id;
			var listener = new AjxListener(this, this._handleDetailCheck, [itemId]);
			menuitem.addSelectionListener(listener);
			this._registerControl({ id: itemId, control: menuitem, ignore: true });
			count++;
		}
	}
	return count > 0 ? menu : null;
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

ZmEditContactView.ATTRS = {
	FILE_AS: "fileAs", FOLDER: "folderId", 
	IMAGE: "image", PREFIX: "namePrefix", SUFFIX: "nameSuffix", MAIDEN: "maidenName",
	FIRST: "firstName", MIDDLE: "middleName", LAST: "lastName", NICKNAME: "nickname",
	TITLE: "jobTitle", DEPARTMENT: "department", COMPANY: "company", NOTES: "notes"
};

ZmEditContactView.LISTS = {
	ADDRESS: {}, // NOTE: placeholder for custom handling
	EMAIL: {attrs:["email"], addone:{"email":1}, onlyvalue:true},
	PHONE: {attrs:[
		"office","homePhone","mobilePhone","workPhone","homeFax","workFax","otherFax",
		"pager","callbackPhone","carPhone","companyPhone","otherPhone"
	]},
	IM: {attrs:["imAddress"], addone:{"imAddress":1}, onlyvalue:true},
	URL: {attrs:["homeURL","workURL","otherURL"]},
	OTHER: {attrs:["birthday","anniversary","assistant","custom"], addone:{"custom":1}}
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

ZmEditContactView.prototype._getFullName = function() {
	var contact = {
		fileAs: this.getValue("FILE_AS"),
		firstName: this.getValue("FIRST"), lastName: this.getValue("LAST"),
		company: this.getValue("COMPANY")
	};
	return ZmContact.computeFileAs(contact);
};

ZmEditContactView.prototype.set = function(contact, isDirty) {
	// save contact
	this._contact = contact;

	// fill in base fields
	for (var id in ZmEditContactView.ATTRS) {
		var value = contact.getAttr(ZmEditContactView.ATTRS[id]);
		if (id == "FOLDER") {
			this._setFolder(contact.getFolderId());
			continue;
		}
		if (id == "FILE_AS") {
			value = value || ZmContact.FA_LAST_C_FIRST;
		}
		this.setValue(id, value);
	}
	this.setValue("IMAGE", contact.getImageUrl() || "");

	// check show detail items for fields with values
	for (var id in ZmEditContactView.ATTRS) {
		var showId = "SHOW_"+id;
		var control = this.getControl(showId);
		if (control == null) continue;
		var checked = (this.getValue(id) || "") != "";
		this.setValue(showId, checked);
		control.setChecked(checked, true); // skip notify
	}

	// populate sections
	for (var id in ZmEditContactView.LISTS) {
		if (id == "ADDRESS") {
			this.__initRowsAddress(contact);
		}
		else {
			var list = ZmEditContactView.LISTS[id];
			this.__initRowsControl(contact, id, list.attrs, list.addone, list.onlyvalue);
		}
	}

	// mark form as clean and update display
	this.setDirty(false);
	this.update();
};

ZmEditContactView.prototype.__initRowsControl = function(contact,id,prefixes,addone,onlyvalue) {
	var array = [];
	for (var j = 0; j < prefixes.length; j++) {
		var prefix = prefixes[j];
		for (var i = 1; true; i++) {
			var a = (i > 1 || (addone && addone[prefix])) ? prefix+i : prefix;
			var value = contact.getAttr(a);
			if (!value) break;
			array.push(onlyvalue ? value : { type:prefix,value:value });
		}
	}
	this.setValue(id, array);
};

ZmEditContactView.prototype.__initRowsAddress = function(contact) {
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
			}
			if (!address) break;
			address.type = prefix;
			array.push(address);
		}
	}
	this.setValue("ADDRESS", array);
};

ZmEditContactView.prototype.getContact = function() {
	return this._contact;
};

ZmEditContactView.prototype.getDefaultFocusItem = function() {
	return null;
};

ZmEditContactView.prototype.getModifiedAttrs = function() {
	var itemIds = this.getDirtyItems();
	var counts = {};
	var attributes = {};
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
					var onlyvalue = id == "EMAIL" || id == "IM";
					var v = onlyvalue ? item : item.value;
					if (!v) continue;
					var list = ZmEditContactView.LISTS[id];
					var a = onlyvalue ? list[id].attrs[0] : item.type;
					if (!counts[a]) counts[a] = 0;
					var count = ++counts[a];
					a = (count > 1 || (list.addone && list.addone[id])) ? a+count : a;
					attributes[a] = v;
				}
			}
		}
		else {
			var a = ZmEditContactView.ATTRS[id];
			attributes[a] = value;
		}
	}
//	console.dir(attributes);
	return attributes;
};

ZmEditContactView.__clearAddressAttributes = function(attributes, prefix, count) {
	var suffixes = ZmEditContactView.ADDR_SUFFIXES;
	for (var i = 0; i < suffixes.length; i++) {
		var suffix = suffixes[i];
		var p = [prefix, suffix, count > 1 ? count : ""].join("");
		attributes[p] = "";
	}
};

ZmEditContactView.prototype.isEmpty = function() {
	// TODO
	return true;
};

ZmEditContactView.prototype.enableInputs = function(bEnable) {
	// TODO
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

ZmEditContactView.prototype._handleDetailCheck = function(id) {
	this.setValue(id, !this.getValue(id));
	this.update();
};

//ZmEditContactView.prototype._supportsPhoto = function() {
//	return true;
//};
//
//ZmEditContactView.prototype._updateImage = function(status, attId) {
//	if (!this._supportsPhoto()) { return; }
////	this._image.setAttribute("src", ["/service/content/proxy?aid=",attId].join(""));
////	this._imageInput.setAttribute("_aid", attId);
//};
//
//ZmEditContactView.prototype._uploadImage = function() {
//	if (this._imageInput.value == "") { return; }
//
//        if (!/\.(jpe?g|png|gif|bmp|tiff?)$/i.test(this._imageInput.value)) {
//                var dlg = appCtxt.getErrorDialog();
//                dlg.reset();
//                dlg.setMessage(ZmMsg.errorNotImageFile, null, DwtMessageDialog.WARNING_STYLE, ZmMsg.errorCap);
//                dlg.popup(null, true);
//                return;
//        }
//
//	var formEl = document.getElementById(this._imageCellId + "_form");
//	if (!formEl) { return; }
//
//	this._controller.enableToolbar(false);
//
//	var callback = new AjxCallback(this, this._updateImage);
//	var ajxCallback = new AjxCallback(this, this._uploadImageDone, [callback]);
//	var um = appCtxt.getUploadManager();
//	window._uploadManager = um;
//
//	try {
//		um.execute(ajxCallback, formEl);
//	} catch (ex) {
//		ajxCallback.run();
//		this._um = null;
//	}
//};
//
//ZmEditContactView.prototype._uploadImageDone = function(callback, status, attId) {
//	this._controller.enableToolbar(true);
//
//	if (status == AjxPost.SC_OK) {
//		this._isDirty = true;
//		if (callback) {
//			callback.run(status, attId);
//		}
//	} else if (status == AjxPost.SC_UNAUTHORIZED) {
//		// auth failed during att upload - let user relogin, continue with compose action
//		var ex = new AjxException("401 response during attachment upload", ZmCsfeException.SVC_AUTH_EXPIRED);
//		appCtxt.getAppController()._handleException(ex);
//	} else {
//		// bug fix #2131 - handle errors during attachment upload.
//		var msg = AjxMessageFormat.format(ZmMsg.errorAttachment, (status || AjxPost.SC_NO_CONTENT));
//
//		switch (status) {
//			// add other error codes/message here as necessary
//			case AjxPost.SC_REQUEST_ENTITY_TOO_LARGE: 	msg += " " + ZmMsg.errorAttachmentTooBig + "<br><br>"; break;
//			default: 									msg += " "; break;
//		}
//		var dialog = appCtxt.getMsgDialog();
//		dialog.setMessage(msg,DwtMessageDialog.CRITICAL_STYLE,this._title);
//		dialog.popup();
//	}
//};

// listeners

ZmEditContactView.prototype._handleFolderButton = function(ev) {
	var dialog = appCtxt.getChooseFolderDialog();
	dialog.registerCallback(DwtDialog.OK_BUTTON, new AjxCallback(this, this._handleChooseFolder));
	var params = {
		title: "[Choose Address Book]",
//		data: appCtxt.getById(this.getValue("FOLDER")),
		treeIds: [ZmOrganizer.ADDRBOOK], 
		skipReadOnly: true, skipRemote: true, noRootSelect: true
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
		"<img id='",this._htmlElId,"_img'>",
		"<div id='",this._htmlElId,"_badge' style='position:absolute;bottom:0;right:0'>"
	].join("");
//	el.style.width = 52;
//	el.style.height = 52;
	el.style.cursor = "pointer";

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
	if (!value) {
		this._imgEl.src = ZmEditContactViewImage.NO_IMAGE_URL;
		this._badgeEl.className = "ImgAdd";
	}
	else {
		this._imgEl.src = value;
		this._badgeEl.className = "ImgEdit";
	}
};

ZmEditContactViewImage.prototype.getValue = function() {
	var value = this._imgEl.src;
	return value != ZmEditContactViewImage.NO_IMAGE_URL ? value : "";
};

// Protected methods

ZmEditContactViewImage.prototype._imageLoaded = function() {
	var w = this._imgEl.width;
	var h = this._imgEl.height;
	this._imgEl.setAttribute("width", w > h ? 48 : "");
	this._imgEl.setAttribute("height", w > h ? "" : 48);
};

ZmEditContactViewImage.prototype._chooseImage = function() {
	var dialog = appCtxt.getUploadDialog();
	var folder = null;
	var callback = new AjxCallback(this, this._handleImageSaved);
	var title = "[Upload Image]";
	var location = null;
	var oneFileOnly = true;
	dialog.popup(folder, callback, title, location, oneFileOnly);
};

ZmEditContactViewImage.prototype._handleImageSaved = function(folder, filenames, files) {
	var dialog = appCtxt.getUploadDialog();
	dialog.popdown();
	this.setValue(ZmEditContactViewImage.IMAGE_URL.replace(/@aid@/, files[0].guid));
};

ZmEditContactViewImage.prototype._createElement = function() {
	return document.createElement("FIELDSET")
};

//
// Class: ZmEditContactViewRows
//

ZmEditContactViewRows = function(params) {
	if (arguments.length == 0) return;
	if (!params.itemDef) params.itemDef = {};
	params.itemDef.onremoverow = "this.setDirty(true)";
	params.className = params.className || "ZmEditContactViewRows";
	DwtFormRows.apply(this, arguments);
};
ZmEditContactViewRows.prototype = new DwtFormRows;
ZmEditContactViewRows.prototype.constructor = ZmEditContactViewRows;

ZmEditContactViewRows.prototype.toString = function() {
	return "ZmEditContactViewRows";
};

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

// Protected methods

ZmEditContactViewInputSelect.prototype._createHtml = function(templateId) {
	this._createHtmlFromTemplate(templateId || this.TEMPLATE, {id:this._htmlElId});
};

ZmEditContactViewInputSelect.prototype._createHtmlFromTemplate = function(templateId, data) {
	DwtComposite.prototype._createHtmlFromTemplate.apply(this, arguments);

	var inputEl = document.getElementById(data.id+"_input");
	if (inputEl) {
		this._input = this._createInput();
		this._input.replaceElement(inputEl);
	}

	var selectEl = document.getElementById(data.id+"_select");
	if (selectEl) {
		this._select = this._createSelect(this._options);
		this._select.addChangeListener(new AjxListener(this, this._handleSelectChange));
		this._select.replaceElement(selectEl);
	}
};

ZmEditContactViewInputSelect.prototype._createInput = function() {
	var input = new DwtInputField({parent:this,size:this._cols});
	input.setHint(this._hint);
	input.setHandler(DwtEvent.ONKEYDOWN, AjxCallback.simpleClosure(this.setDirty, this, true));
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

ZmEditContactViewInputSelect.prototype._handleSelectChange = function(evt) {
//	console.log("ZmEditContactViewInputSelect._handleSelectChange");
	this.setDirty(true);
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

ZmEditContactViewOther.prototype.TEMPLATE = "abook.Contacts#ZmEditContactViewOther";

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

ZmEditContactViewOther.prototype._createHtmlFromTemplate = function(templateId, data) {
	ZmEditContactViewInputSelect.prototype._createHtmlFromTemplate.apply(this, arguments);

	var pickerEl = document.getElementById(data.id+"_picker");
	if (pickerEl) {
		this._picker = new DwtButton({parent:this});
		this._picker.setImage("Calendar");
		var menu = new DwtMenu({parent:this._picker,style:DwtMenu.CALENDAR_PICKER_STYLE});
		this._picker.setMenu(menu);
		this._picker.replaceElement(pickerEl);
	}
};

ZmEditContactViewOther.prototype._createSelect = function() {
	var select = new DwtComboBox({parent:this});
	var options = this._options || [];
	for (var i = 0; i < options.length; i++) {
		var option = options[i];
		select.add(option.label || option.value, i == 0, option.value);
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

// Public methods

ZmEditContactViewIM.prototype.setValue = function(value) {
	var m = ZmEditContactViewIM.exec(value);
	value = m ? { type:m[1],value:m[2] } : { type:"zimbra",value:"" };
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

// Constants

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
//	this._input.setDirty(false);
//	this._input.update();
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

// Protected methods

ZmEditContactViewAddress.prototype._createInput = function() {
	var form = {
		template: "abook.Contacts#ZmEditContactViewAddress",
		ondirty: "this.parent.setDirty(true)",
		items: [
			{ id: "STREET", type: "DwtInputField", cols: 40, rows: 2, hint: "[Street]",
				onchange: "this.setDirty(true)"
			},
			{ id: "CITY", type: "DwtInputField", cols: 20, hint: "[City]",
				onchange: "this.setDirty(true)"
			},
			{ id: "STATE", type: "DwtInputField", cols: 10, hint: "[State]",
				onchange: "this.setDirty(true)"
			},
			{ id: "ZIP", type: "DwtInputField", cols: 10, hint: "[ZIP]",
				onchange: "this.setDirty(true)"
			},
			{ id: "COUNTRY", type: "DwtInputField", cols: 20, hint: "[Country]",
				onchange: "this.setDirty(true)"
			}
		]
	};
	return new DwtForm({parent:this,form:form});
};
