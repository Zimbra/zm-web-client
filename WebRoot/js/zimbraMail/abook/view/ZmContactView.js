/*
 * ***** BEGIN LICENSE BLOCK *****
 * Version: ZPL 1.2
 *
 * The contents of this file are subject to the Zimbra Public License
 * Version 1.2 ("License"); you may not use this file except in
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
 * Portions created by Zimbra are Copyright (C) 2005, 2006 Zimbra, Inc.
 * All Rights Reserved.
 *
 * Contributor(s):
 *
 * ***** END LICENSE BLOCK *****
 */

ZmContactView = function(parent, appCtxt, controller) {
	if (arguments.length == 0) return;

	DwtComposite.call(this, parent, "ZmContactView", DwtControl.ABSOLUTE_STYLE);

	this._appCtxt = appCtxt;
	this._controller = controller;

	this._tagList = appCtxt.getTagTree();
	this._tagList.addChangeListener(new AjxListener(this, this._tagChangeListener));
	this._changeListener = new AjxListener(this, this._contactChangeListener);
	this._dateFormatter = new AjxDateFormat("yyyy-MM-dd");

	this.setScrollStyle(Dwt.CLIP);
};

ZmContactView.prototype = new DwtComposite;
ZmContactView.prototype.constructor = ZmContactView;

// Consts

ZmContactView._selectFields = {
	"fileAs": [
		{ name: ZmContact._AB_FILE_AS[ZmContact.FA_LAST_C_FIRST],				selected: true  },
		{ name: ZmContact._AB_FILE_AS[ZmContact.FA_FIRST_LAST], 				selected: false },
		{ name: ZmContact._AB_FILE_AS[ZmContact.FA_COMPANY],					selected: false },
		{ name: ZmContact._AB_FILE_AS[ZmContact.FA_LAST_C_FIRST_COMPANY],		selected: false },
		{ name: ZmContact._AB_FILE_AS[ZmContact.FA_FIRST_LAST_COMPANY], 		selected: false },
		{ name: ZmContact._AB_FILE_AS[ZmContact.FA_COMPANY_LAST_C_FIRST],		selected: false },
		{ name: ZmContact._AB_FILE_AS[ZmContact.FA_COMPANY_FIRST_LAST], 		selected: false }
	]
};

// Message dialog placement
ZmContactView.DIALOG_X = 50;
ZmContactView.DIALOG_Y = 100;


// Public Methods

ZmContactView.prototype.toString =
function() {
	return "ZmContactView";
};

// need this since contact view now derives from list controller
ZmContactView.prototype.getList = function() { return null; }

ZmContactView.prototype.getContact =
function() {
	return this._contact;
};

ZmContactView.prototype.getController =
function() {
	return this._controller;
};

ZmContactView.prototype.set =
function(contact, isDirty) {

	this._attr = {};
	for (var a in contact.getAttrs()) {
		if (a != "objectClass" && a != "modifyTimeStamp" && a != "createTimeStamp" && a != "zimbraId")
			this._attr[a] = contact.getAttr(a);
	}

	this._createHtml(contact);

	if (this._contact) {
		this._contact.removeChangeListener(this._changeListener);
	}
	contact.addChangeListener(this._changeListener);

	this._contact = contact;
	this._setFields();
	this._isDirty = isDirty;
};

ZmContactView.prototype.getModifiedAttrs =
function() {
	this._getFields();
	var mods = {};
	var foundOne = false;

	// compute fullName if first/middle/last fields exist
	// otherwise assume fullName is a separate field
	var customFileAs;
	var fullName;
	var first = this._attr[ZmContact.F_firstName];
	var middle = this._attr[ZmContact.F_middleName];
	var last = this._attr[ZmContact.F_lastName];
	if (first || middle || last) {
		var fn = [];
		if (first) fn.push(first);
		if (middle) fn.push(middle);
		if (last) fn.push(last);
		fullName = fn.join(" ");
	} else {
		fullName = this._attr[ZmContact.X_fullName];
		if (fullName) {
			customFileAs = "8:" + fullName;
		}
	}

	// creating new contact (possibly some fields - but not ID - prepopulated)
	if (this._contact.id == null || this._contact.isGal) {
		for (var a in this._attr) {
			if (a == ZmContact.F_fileAs) {
				var val;
				if (customFileAs) {
					mods[ZmContact.F_fileAs] = customFileAs;
					foundOne = true;
					continue;
				} else {
					val = ("" + this._attr[a]); // bug #2982 - convert to String
				}
			} else {
				val = AjxStringUtil.trim(this._attr[a]);
			}

			if (val && val.length > 0) {
				mods[a] = val;
				if (a != ZmContact.F_fileAs)	// bug #4368 - dont save if only FileAs changed
					foundOne = true;
			} else {
				val = AjxStringUtil.trim(this._contact.getAttr(a));
				if (val && val.length > 0) {
					mods[a] = val;
					foundOne = true;
				}
			}
		}

		// always set the folder Id
		mods[ZmContact.F_folderId] = this._folderId;
		// always set the full name for new contacts
		mods[ZmContact.X_fullName] = fullName;
	} else {
		// modifying existing contact
		for (var a in this._attr) {
			var val = this._contact.getAttr(a);
			// do some normalizing
			if (val && AjxUtil.isString(val)) {
				val = AjxStringUtil.trim(val);
				if (a == ZmContact.F_fileAs) {
					this._attr[a] = customFileAs || parseInt(val);
				}
			}

			if (this._attr[a] != val) {
				foundOne = true;
				mods[a] = this._attr[a];
				DBG.println(AjxDebug.DBG2, "DIFF: " + a + " = " + mods[a]);
			}
		}

		// only set the folder Id if changed
		if (this._contact.getFolderId() != this._folderId) {
			mods[ZmContact.F_folderId] = this._folderId;
			foundOne = true;
		}

		// only set the full name if changed
		if (this._contact.getFullName() != fullName) {
			mods[ZmContact.X_fullName] = fullName;
		}
	}

	return foundOne ? mods : null;
};

ZmContactView.prototype.isEmpty =
function() {
	for (var i = 0; i < this._fields.length; i++) {
		var fields = this._fields[i];
		// Make sure at least one form field has a value
		for (var j = 0; j < fields.length; j++) {
			var value = AjxStringUtil.trim(fields[j].value);
			if (value.length) { return false; }
		}
	}
	return true;
};

ZmContactView.prototype.isValid =
function() {
	var bdayId = this._htmlElId + "_birthday";
	var dateField = document.getElementById(bdayId);
	if (dateField) {
		var dateStr = AjxStringUtil.trim(dateField.value);
		if (dateStr.length) {
			var aDate = AjxDateUtil.simpleParseDateStr(dateStr);
			if (isNaN(aDate) || aDate == null)
				throw ZmMsg.errorBirthdayDate;
		}
	}

	return true;
};

ZmContactView.prototype.enableInputs =
function(bEnable) {
	for (var i = 0; i < this._fields.length; i++) {
		var fields = this._fields[i];
		for (var j = 0; j < fields.length; j++) {
			fields[j].disabled = !bEnable;
		}
	}
};

// Following two overrides are a hack to allow this view to pretend it's a list view
ZmContactView.prototype.getSelection =
function() {
	return this._contact;
};

ZmContactView.prototype.getSelectionCount =
function() {
	return 1;
};

ZmContactView.prototype.isDirty =
function() {
	return this._isDirty;
};

ZmContactView.prototype.setSize =
function(width, height) {
	DwtComposite.prototype.setSize.call(this, width, height);
	this._sizeChildren(width, height);
};

ZmContactView.prototype.setBounds =
function(x, y, width, height) {
	DwtComposite.prototype.setBounds.call(this, x, y, width, height);
	this._sizeChildren(width, height);
};

ZmContactView.prototype.getTitle =
function() {
	return [ZmMsg.zimbraTitle, ZmMsg.contact].join(": ");
};

ZmContactView.prototype.cleanup  =
function() {
	// leave empty since set() does this for us
};


// Private / protected methods

// Consistent spot to locate various dialogs
ZmContactView.prototype._getDialogXY =
function() {
	var loc = Dwt.toWindow(this.getHtmlElement(), 0, 0);
	return new DwtPoint(loc.x + ZmContactView.DIALOG_X, loc.y + ZmContactView.DIALOG_Y);
};

ZmContactView.prototype._sizeChildren =
function(width, height) {
	/*
	var contentDiv = document.getElementById(this._contentId);
	if (contentDiv)
		Dwt.setSize(contentDiv, width, (height-45));

	var contactHeader = document.getElementById(this._contactHeaderId);
	if (contactHeader)
		Dwt.setSize(contactHeader, width);

	var contactHeaderDiv = document.getElementById(this._fieldIds[ZmContactView.F_contactTitle]);
	if (contactHeaderDiv)
		Dwt.setSize(contactHeaderDiv, "100%");
*/
};

ZmContactView.prototype._addSelectOptions =
function() {
	var scl = new AjxListener(this, this._selectChangeListener);

	// always test for DOM Id in case it non-existent in template
	var fileAsCell = document.getElementById(this._fileAsSelectCellId);
	if (fileAsCell) {
		// add select widget for user to choose FileAs
		this._fileAsSelect = new DwtSelect(this);
		var fileAsSelectOptions = ZmContactView._selectFields["fileAs"];
		var count = 0;
		for (var i in fileAsSelectOptions) {
			this._fileAsSelect.addOption(fileAsSelectOptions[i].name, fileAsSelectOptions[i].selected, ++count);
		}
		this._fileAsSelect.reparentHtmlElement(this._fileAsSelectCellId);
		this._fileAsSelect.addChangeListener(scl);
		this._fileAsSelect._cv = this;
	}

	// always test for DOM Id in case it non-existent in template
	var folderCell = document.getElementById(this._folderCellId);
	if (folderCell) {
		// add select widget for user to choose folder
		this._folderSelect = new DwtSelect(this);
		this._folderSelect.reparentHtmlElement(this._folderCellId);
		this._folderSelect.addChangeListener(scl);
		this._folderSelect._cv = this;
	}
};

ZmContactView.prototype._addDateCalendars =
function() {
	var dateBtnListener = new AjxListener(this, this._dateButtonListener);
	var dateSelListener = new AjxListener(this, this._dateSelectionListener);
	ZmCalendarApp.createMiniCalButton(this, this._birthdayButtonId, dateBtnListener, dateSelListener, this._appCtxt);
};

ZmContactView.prototype._installOnKeyUpHandler =
function() {
	for (var i = 0; i < this._fields.length; i++) {
		var fields = this._fields[i];
		for (var j = 0; j < fields.length; j++) {
			var e = fields[j];
			// only add onkeyup handlers to input/textarea's
			var tagName = e.tagName.toLowerCase();
			if (tagName == "input" || tagName == "textarea") {
				Dwt.setHandler(e, DwtEvent.ONKEYUP, ZmContactView._onKeyUp);
				Dwt.associateElementWithObject(e, this);
			}
		}
	}
};

ZmContactView.prototype._getValue =
function(field, isDate) {
	var e = document.getElementById(this._fieldIds[field]);
	if (e && e.value != undefined) {
		if (e.value != "") {
			if (isDate) {
				var bdate = AjxDateUtil.simpleParseDateStr(e.value);
				this._attr[field] = this._dateFormatter.format(bdate);
			} else {
				this._attr[field] = e.value;
			}
		} else {
			this._attr[field] = undefined;
		}
	}
};


ZmContactView.prototype._setHeaderInfo =
function() {
	// set the appropriate header color
	var folderId = this._contact.folderId;
	var folder = folderId ? this._appCtxt.getById(folderId) : null;
	var color = folder ? folder.color : ZmOrganizer.DEFAULT_COLOR[ZmOrganizer.ADDRBOOK];
	var bkgdColor = ZmOrganizer.COLOR_TEXT[color] + "Bg";

	// set the header color for all tabs
	var contactHdrRow = document.getElementById(this._headerRowId);
	if (contactHdrRow) {
		contactHdrRow.className = "contactHeaderRow " + bkgdColor;
	}

	// set appropriate icon
	var iconCell = document.getElementById(this._iconCellId);
	if (iconCell) {
		iconCell.innerHTML = AjxImg.getImageHtml(this._contact.getIcon());
	}
};

ZmContactView.prototype._setTitle =
function(title) {
	var div = document.getElementById(this._titleCellId);
	if (div) {
		var fileAs = title || this._contact.getFileAs();
		div.innerHTML = fileAs || (this._contact.id ? "&nbsp;" : ZmMsg.newContact);
	}
};

ZmContactView.prototype._setTags =
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
		var icon = ZmTag.COLOR_MINI_ICON[tag.color];
		html[i++] = AjxImg.getImageSpanHtml(icon, null, null, tag.name);
		html[i++] = "&nbsp;";
	}

	tagCell.innerHTML = html.join("");
};

ZmContactView.prototype._getTagCell =
function() {
	return document.getElementById(this._tagCellId);
};

ZmContactView.prototype._setFolder =
function() {
	if (!this._folderSelect) { return; }

	var match;
	if (this._contact.id == null) {
		var clc = AjxDispatcher.run("GetContactListController");
		match = clc._folderId;
	} else {
		match = this._contact.addrbook ? this._contact.addrbook.id : ZmFolder.ID_CONTACTS;
	}

	var folderTree = this._appCtxt.getFolderTree();
	var folders = folderTree ? folderTree.getByType(ZmOrganizer.ADDRBOOK) : [];

	// for now, always re-populate folders DwtSelect
	this._folderSelect.clearOptions();

	for (var i = 0; i < folders.length; i++) {
		var folder = folders[i];
		if (folder.nId == ZmFolder.ID_ROOT ||
			folder.isInTrash() ||
			folder.isReadOnly())
		{
			continue;
		}

		this._folderSelect.addOption(folder.name, folder.id == match, folder.id);
	}
};

ZmContactView.prototype._setValues =
function() {
	// set field values for each tab
	for (var i = 0; i < this._fields.length; i++) {
		var fields = this._fields[i];
		for (var j = 0; j < fields.length; j++) {
			var el = fields[j];
			var field = Dwt.getAttr(el, "_field");
			var value = (this._attr[field]) || "";

			var isDate = (!!(Dwt.getAttr(el, "_isDate")));
			if (isDate) {
				var val = this._dateFormatter.parse(value);
				el.value = val ? AjxDateUtil.simpleComputeDateStr(val) : "";
			} else {
				el.value = value;
			}
		}
	}

	// set file as
	if (this._fileAsSelect) {
		if (this._attr.fileAs) {
			var fa = parseInt(this._attr.fileAs) - 1;
			// do we have a custom file as?
			if (fa >= this._fileAsSelect.size()) {
				// TODO - append to the end of the select list?
			} else {
				this._fileAsSelect.setSelected(fa);
			}
		} else {
			this._fileAsSelect.setSelectedValue(1);
		}
	}
};

ZmContactView.prototype._setFields =
function() {
	this._setHeaderInfo();
	this._setTitle();
	this._setTags();
	this._setFolder();
	this._setValues();
};

ZmContactView.prototype._getFields =
function() {
	this._folderId = this._folderSelect
		? this._folderSelect.getValue()
		: ZmFolder.ID_CONTACTS;

	for (var i = 0; i < this._fields.length; i++) {
		var fields = this._fields[i];
		for (var j = 0; j < fields.length; j++) {
			var el = fields[j];
			var field = Dwt.getAttr(el, "_field");
			var isDate = (!!(Dwt.getAttr(el, "_isDate")));
			if (el.value != "") {
				if (isDate) {
					var bdate = AjxDateUtil.simpleParseDateStr(el.value);
					this._attr[field] = this._dateFormatter.format(bdate);
				} else {
					this._attr[field] = el.value;
				}
			} else {
				this._attr[field] = undefined;
			}
		}
	}
};

ZmContactView.prototype._createHtml =
function(contact) {
	if (this._htmlInitialized) {
		this._contactTabView.switchToTab(1);
		return;
	}

	this.getHtmlElement().innerHTML = AjxTemplate.expand("zimbraMail.abook.templates.Contacts#ZmContactView", {id:this._htmlElId});

	this._contactTabView = new DwtTabView(this);
	this._contactTabView.addStateChangeListener(new AjxListener(this, this._tabStateChangeListener));
	this._contactTabView.reparentHtmlElement(this._htmlElId + "_tabs");

	var params = AjxTemplate.getParams("zimbraMail.abook.templates.Contacts#ZmContactViewTabs");
	var tabStr = params ? params["tabs"] : null;
	this._tabs = tabStr ? tabStr.split(",") : null;

	this._birthdayButtonId	= this._htmlElId + "_birthday_button";
	this._fileAsSelectCellId= this._htmlElId + "_fileAs";
	this._folderCellId 		= this._htmlElId + "_folder";
	this._headerRowId		= this._htmlElId + "_headerRow";
	this._iconCellId		= this._htmlElId + "_icon";
	this._tagCellId			= this._htmlElId + "_tags";
	this._titleCellId		= this._htmlElId + "_title";

	var subs = {
		id: this._htmlElId,
		fileAsSelectId: this._fileAsSelectCellId,
		folderSelectId: this._folderCellId
	};

	this._fields = [];
	for (var i = 0; i < this._tabs.length; i++) {
		var tab = AjxStringUtil.trim(this._tabs[i]);
		var idx = subs.tabIdx = this._contactTabView.addTab(ZmMsg[tab]);
		var view = new DwtTabViewPage(this._contactTabView, "ZmContactEditTabViewPage");
		var template = "zimbraMail.abook.templates.Contacts#ZmContactView_" + tab;
		view.getHtmlElement().innerHTML = AjxTemplate.expand(template, subs);
		this._contactTabView.setTabView(idx, view);
		if (i == 0) {
			view.setVisible(true);
		}

		this._fields.push(document.getElementsByName(this._htmlElId + "_name_" + idx));
	}

	// add widgets
	this._addSelectOptions();
	this._addDateCalendars();

	// add onKeyUp handlers
	this._installOnKeyUpHandler();

	this._htmlInitialized = true;
};

ZmContactView.prototype._getTabGroupMembers =
function() {
	return this._fields[0];
};

ZmContactView.prototype._getDefaultFocusItem =
function() {
	return this._fields[0][0];
};


// Listeners

ZmContactView.prototype._contactChangeListener =
function(ev) {
	if (ev.type != ZmEvent.S_CONTACT)
		return;

	if (ev.event == ZmEvent.E_TAGS || ev.event == ZmEvent.E_REMOVE_ALL)
		this._setTags(this._contact);
};

ZmContactView.prototype._tabStateChangeListener =
function(ev) {
	if (!this._htmlInitialized) { return; }

	var tabIdx = this._contactTabView.getCurrentTab();
	var fields = this._fields[tabIdx-1];

	// always set focus to the first input-type element in the tab
	fields[0].focus();
};

ZmContactView.prototype._tagChangeListener =
function(ev) {
	if (ev.type != ZmEvent.S_TAG)
		return;

	var fields = ev.getDetail("fields");
	var changed = fields && (fields[ZmOrganizer.F_COLOR] || fields[ZmOrganizer.F_NAME]);
	if ((ev.event == ZmEvent.E_MODIFY && changed) ||
		ev.event == ZmEvent.E_DELETE ||
		ev.event == ZmEvent.MODIFY)
	{
		this._setTags();
	}
};

ZmContactView.prototype._selectChangeListener =
function(ev) {
	var selectObj = ev._args.selectObj;
	var newValue = ev._args.newValue;
	var cv = selectObj ? selectObj._cv : null;

	if (cv) {
		if (selectObj == cv._fileAsSelect) {
			cv._attr[ZmContact.F_fileAs] = newValue;
			cv._setTitle(ZmContact.computeFileAs(cv._attr));
			cv._isDirty = true;
		} else if (selectObj == cv._folderSelect) {
			cv._attr[ZmContact.F_folderId] = newValue;
			cv._isDirty = true;
		}
	}
};

ZmContactView.prototype._dateButtonListener =
function(ev) {
	var bdayId = this._htmlElId + "_birthday";
	var dateField = document.getElementById(bdayId);
	var aDate = dateField ? AjxDateUtil.simpleParseDateStr(dateField.value) : null;

	// if date was input by user and its fubar, reset to today's date
	if (isNaN(aDate) || aDate == null) {
		aDate = new Date();
	}

	// always reset the date to current field's date
	var cal = ev.item.getMenu().getItem(0);
	cal.setDate(aDate, true);
	ev.item.popup();
};

ZmContactView.prototype._dateSelectionListener =
function(ev) {
	var bdayId = this._htmlElId + "_birthday";
	var dateField = document.getElementById(bdayId);
	dateField.value = AjxDateUtil.simpleComputeDateStr(ev.detail);
};



// Static methods

ZmContactView._onKeyUp =
function(ev) {
	ev = DwtUiEvent.getEvent(ev);

	var key = DwtKeyEvent.getCharCode(ev);
	if (ev.metaKey || ev.altKey || ev.ctrlKey ||
		DwtKeyMapMgr.isModifier(key) ||
		key == DwtKeyMapMgr.TAB_KEYCODE)
	{
		return;
	}

	var e = DwtUiEvent.getTarget(ev);
	if (e) {
		var view = Dwt.getObjectFromElement(e);
		view._isDirty = true;

		var field = Dwt.getAttr(e, "_field");
		if (field == ZmContact.F_firstName ||
			field == ZmContact.F_lastName ||
			field == ZmContact.F_company)
		{
			view._attr[field] = e.value;
			view._setTitle(ZmContact.computeFileAs(view._attr));
		}
	}
	return true;
};

ZmContactView.getPrintHtml =
function(contact, abridged, appCtxt) {
	var html;
	// make sure it's a real ZmContact
	var real = contact.list._realizeContact(contact);

	if (abridged) {
		html = AjxTemplate.expand("zimbraMail.abook.templates.Contacts#PrintCardContact", {contact:real});
	} else {
		// TODO
	}

	return html;
};
