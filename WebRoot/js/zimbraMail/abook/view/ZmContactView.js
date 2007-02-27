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

function ZmContactView(parent, appCtxt, controller, isReadOnly) {

	if (arguments.length == 0) return;

	DwtComposite.call(this, parent, "ZmContactView", DwtControl.ABSOLUTE_STYLE);

	this._appCtxt = appCtxt;
	this._controller = controller;

	this._tagList = this._appCtxt.getTree(ZmOrganizer.TAG);
	this._tagList.addChangeListener(new AjxListener(this, this._tagChangeListener));

	// read only flag is mainly used for printing a single contact
	this._isReadOnly = isReadOnly;
	this.getHtmlElement().style.overflow = "hidden";
	if (!isReadOnly)
		this._changeListener = new AjxListener(this, this._contactChangeListener);

	this._bdateFormatter = new AjxDateFormat("yyyy-MM-dd");
};

ZmContactView.prototype = new DwtComposite;
ZmContactView.prototype.constructor = ZmContactView;

// Consts

ZmContactView.F_contactTitle	= 1;
ZmContactView.F_contactTags		= 2;

ZmContactView.primaryInfoOne	= [ZmContact.F_lastName, ZmContact.F_firstName, ZmContact.F_middleName, ZmContact.F_fileAs];
ZmContactView.primaryInfoTwo	= [ZmContact.F_jobTitle, ZmContact.F_company, ZmContact.F_folderId];
ZmContactView.emailInfo			= [ZmContact.F_email, ZmContact.F_email2, ZmContact.F_email3];
ZmContactView.workAddrInfo		= [ZmContact.F_workStreet, ZmContact.F_workCity, ZmContact.F_workState, ZmContact.F_workPostalCode, ZmContact.F_workCountry, ZmContact.F_workURL];
ZmContactView.workPhoneInfo		= [ZmContact.F_workPhone, ZmContact.F_workPhone2, ZmContact.F_workFax, ZmContact.F_assistantPhone, ZmContact.F_companyPhone, ZmContact.F_callbackPhone];
ZmContactView.homeAddrInfo		= [ZmContact.F_homeStreet, ZmContact.F_homeCity, ZmContact.F_homeState, ZmContact.F_homePostalCode, ZmContact.F_homeCountry, ZmContact.F_homeURL];
ZmContactView.homePhoneInfo		= [ZmContact.F_homePhone, ZmContact.F_homePhone2, ZmContact.F_homeFax, ZmContact.F_mobilePhone, ZmContact.F_pager, ZmContact.F_carPhone];
ZmContactView.otherAddrInfo		= [ZmContact.F_otherStreet, ZmContact.F_otherCity, ZmContact.F_otherState, ZmContact.F_otherPostalCode, ZmContact.F_otherCountry, ZmContact.F_otherURL];
ZmContactView.otherPhoneInfo	= [ZmContact.F_otherPhone, ZmContact.F_otherFax];
ZmContactView.miscInfo			= [ZmContact.F_birthday];

ZmContactView.BIRTHDAY_ID		= "--b";

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

	this._attr = new Object();
	for (var a in contact.getAttrs()) {
		this._attr[a] = contact.getAttr(a);
	}

	if (!this._htmlInitialized) {
		this._createHtml(contact);
	}

	if (this._isReadOnly) return;

	if (this._contact) {
		this._contact.removeChangeListener(this._changeListener);
	}
	contact.addChangeListener(this._changeListener);
	this._contact = contact;

	this._setFields();

	var contentDiv = document.getElementById(this._contentId);
	Dwt.setVisibility(contentDiv, true);
	contentDiv.scrollTop = 0; // bug fix #3362

	this._isDirty = isDirty;
};

ZmContactView.prototype.getModifiedAttrs =
function() {
	this._getFields();
	var mods = {};
	var foundOne = false;

	// bug fix #648 - always re-compute the full name and add to mods list
	var fn = [];
	var first = this._attr[ZmContact.F_firstName];
	var middle = this._attr[ZmContact.F_middleName];
	var last = this._attr[ZmContact.F_lastName];
	if (first) fn.push(first);
	if (middle) fn.push(middle);
	if (last) fn.push(last);
	var fullName = fn.join(" ");

	// creating new contact (possibly some fields - but not ID - prepopulated)
	if (this._contact.id == null || this._contact.isGal) {
		for (var a in this._attr) {
			// bug fix #2982 - convert fileAs value to a String
			var val = a == ZmContact.F_fileAs ? ("" + this._attr[a]) : AjxStringUtil.trim(this._attr[a]);
			if ((val && val.length > 0)) {
				mods[a] = val;
				// bug fix #4368 - dont bother saving contact if only field changed was FileAs
				if (a != ZmContact.F_fileAs)
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
				if (a == ZmContact.F_fileAs)
					val = parseInt(val);
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
		if (this._contact.getFullName() != fullName)
			mods[ZmContact.X_fullName] = fullName;
	}

	return foundOne ? mods : null;
};

ZmContactView.prototype.isEmpty =
function() {
	// Make sure at least one form field has a value (otherwise,
	// delete the contact). NOTE: getModifiedAttrs() populates
	// _attrs with form field values.
	for (var i in this._attr) {
		if (i == ZmContact.F_fileAs || i == ZmContact.X_fullName) continue;
		if (this._attr[i]) return false;
	}
	return true;
};

ZmContactView.prototype.isValid =
function() {
	var dateField = document.getElementById(this._fieldIds[ZmContact.F_birthday]);
	var dateStr = AjxStringUtil.trim(dateField.value);
	if (dateStr.length) {
		var aDate = AjxDateUtil.simpleParseDateStr(dateStr);
		if (isNaN(aDate) || aDate == null)
			throw ZmMsg.errorBirthdayDate;
	}

	return true;
};

ZmContactView.prototype.enableInputs =
function(bEnable) {
	for (var i in this._fieldIds) {
		var field = document.getElementById(this._fieldIds[i]);
		if (field)
			field.disabled = !bEnable;
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
	var contentDiv = document.getElementById(this._contentId);
	if (contentDiv)
		Dwt.setSize(contentDiv, width, (height-45));

	var contactHeader = document.getElementById(this._contactHeaderId);
	if (contactHeader)
		Dwt.setSize(contactHeader, width);

	var contactHeaderDiv = document.getElementById(this._fieldIds[ZmContactView.F_contactTitle]);
	if (contactHeaderDiv)
		Dwt.setSize(contactHeaderDiv, "100%");
};

ZmContactView.prototype._addEntryRow =
function(field, html, idx) {
	html[idx++] = "<tr>";
	html[idx++] = "<td class='editLabel' style='width:18em;'>";
	html[idx++] = AjxStringUtil.htmlEncode(ZmContact._AB_FIELD[field]);
	html[idx++] = ":</td>";
	if (!this._isReadOnly) {
		var id = this._fieldIds[field] = Dwt.getNextId();
		html[idx++] = "<td><input type='text' autocomplete='off' size=35 id='";
		html[idx++] = id;
		html[idx++] = "'></td>";
	} else {
		html[idx++] = "<td class='contactOutput'>";
		html[idx++] = (this._attr[field] || "");
		html[idx++] = "</td>";
	}
	html[idx++] = "</tr>";
	return idx;
};

ZmContactView.prototype._addDateRow =
function(field, html, idx) {
	html[idx++] = "<tr>";
	html[idx++] = "<td class='editLabel' style='width:18em;'>";
	html[idx++] = AjxStringUtil.htmlEncode(ZmContact._AB_FIELD[field]);
	html[idx++] = ":</td>";
	if (!this._isReadOnly) {
		var id = this._fieldIds[field] = Dwt.getNextId();
		html[idx++] = "<td><table border=0 cellpadding=0 cellspacing=0><tr><td><input type='text' autocomplete='off' size=8 id='";
		html[idx++] = id;
		html[idx++] = "'></td><td id='";
		html[idx++] = id;
		html[idx++] = ZmContactView.BIRTHDAY_ID;
		html[idx++] = "'></td></tr></table></td>";
	} else {
		html[idx++] = "<td class='contactOutput'>";
		html[idx++] = (this._attr[field] || "");
		html[idx++] = "</td>";
	}
	html[idx++] = "</tr>";
	return idx;
};

ZmContactView.prototype._addStreetRow =
function(field, html, idx) {
	html[idx++] = "<tr>";
	html[idx++] = "<td class='editLabel' valign=top style='width:18em;'>";
	html[idx++] = AjxStringUtil.htmlEncode(ZmContact._AB_FIELD[field]);
	html[idx++] = ":</td>";
	html[idx++] = "<td";
	html[idx++] = this._isReadOnly ? ">" : " align=right>";

	if (!this._isReadOnly) {
		var id = this._fieldIds[field] = Dwt.getNextId();
		var rows = AjxEnv.isIE ? 3 : 2;
		html[idx++] = "<textarea wrap='hard' cols=32 rows=";
		html[idx++] = rows;
		html[idx++] = " id='";
		html[idx++] = id;
		html[idx++] = "'></textarea>";
	} else {
		html[idx++] = this._attr[field] ? AjxStringUtil.convertToHtml(this._attr[field]) : "";
	}
	html[idx++] = "</td></tr>";
	return idx;
};

ZmContactView.prototype._addFileAsRow =
function(html, idx) {
	this._fileAsSelectCellId = Dwt.getNextId();
	html[idx++] = "<tr valign='center'><td class='editLabel'>";
	html[idx++] = ZmMsg.fileAs;
	html[idx++] = ":</td><td id='";
	html[idx++] = this._fileAsSelectCellId;
	html[idx++] = "'></td></tr>";
	return idx;
};

ZmContactView.prototype._addFolderRow =
function(html, idx) {
	this._folderCellId = Dwt.getNextId();
	html[idx++] = "<tr valign='center'><td class='editLabel'>";
	html[idx++] = ZmMsg.addressBook;
	html[idx++] = ":</td><td id='";
	html[idx++] = this._folderCellId;
	html[idx++] = "'></td></tr>";
	return idx;
};

ZmContactView.prototype._addSelectOptions =
function() {
	var scl = new AjxListener(this, this._selectChangeListener);
	if (this._fileAsSelectCellId) {
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

	if (this._folderCellId) {
		// add select widget for user to choose folder
		this._folderSelect = new DwtSelect(this);
		this._folderSelect.reparentHtmlElement(this._folderCellId);
		this._folderSelect.addChangeListener(scl);
		this._folderSelect._cv = this;
	}
};

ZmContactView.prototype._addDateCalendars =
function() {
	var id = this._fieldIds[ZmContact.F_birthday] + ZmContactView.BIRTHDAY_ID;
	var dateBtnListener = new AjxListener(this, this._dateButtonListener);
	var dateSelListener = new AjxListener(this, this._dateSelectionListener);
	ZmCalendarApp.createMiniCalButton(this, id, dateBtnListener, dateSelListener, this._appCtxt);
};

ZmContactView.prototype._generateHtml =
function(html, idx, label, colOneInfo, colTwoInfo, miscInfo) {
	// add label
	if (label) {
		html[idx++] = "<tr><td colspan=10 valign=top class='sectionLabel'>";
		html[idx++] = label;
		html[idx++] = "</td></tr>";
	}

	// add address info in first column
	html[idx++] = "<tr><td valign=top>";
	html[idx++] = "<table cellpadding=0 cellspacing=2 border=0>";
	for (var i=0; i<colOneInfo.length; i++) {
		if (colOneInfo[i] == ZmContact.F_workStreet ||
			colOneInfo[i] == ZmContact.F_homeStreet ||
			colOneInfo[i] == ZmContact.F_otherStreet) {
			idx = this._addStreetRow(colOneInfo[i], html, idx);
		} else if (colOneInfo[i] == ZmContact.F_fileAs) {
			if (!this._isReadOnly)
				idx = this._addFileAsRow(html, idx);
		} else {
			idx = this._addEntryRow(colOneInfo[i], html, idx);
		}
	}
	html[idx++] = "</table>";
	html[idx++] = "</td>";

	if (colTwoInfo || miscInfo) {
		// add phone numbers in second column
		html[idx++] = "<td valign=top>";
		html[idx++] = "<table cellpadding=0 cellspacing=2 border=0>";
		if (colTwoInfo) {
			for (var i=0; i<colTwoInfo.length; i++) {
				if (colTwoInfo[i] == ZmContact.F_folderId) {
					if (!this._isReadOnly)
						idx = this._addFolderRow(html, idx);
				} else {
					idx = this._addEntryRow(colTwoInfo[i], html, idx);
				}
			}
		}
		if (miscInfo) {
			for (var i=0; i<miscInfo.length; i++) {
				idx = miscInfo[i] == ZmContact.F_birthday
					? this._addDateRow(miscInfo[i], html, idx)
					: this._addEntryRow(miscInfo[i], html, idx);
			}
		}
		html[idx++] = "</table>";
		html[idx++] = "</td>";
	}
	html[idx++] = "</tr>";

	return idx;
};

ZmContactView.prototype._createNotesHtml =
function(html, idx) {
	// add label
	html[idx++] = "<tr><td colspan=10 valign=top class='sectionLabel'>";
	html[idx++] = ZmMsg.notes;
	html[idx++] = "</td></tr>";

	// add textarea
	html[idx++] = "<tr><td valign=top colspan=10>";
	if (!this._isReadOnly) {
		var notesId = this._fieldIds[ZmContact.F_notes] = Dwt.getNextId();
		html[idx++] = "<textarea wrap='hard' rows=8 style='width:100%;' id='";
		html[idx++] = notesId;
		html[idx++] = "'></textarea>";
	}
	else {
		html[idx++] = AjxStringUtil.convertToHtml(this._attr[ZmContact.F_notes]);
	}
	html[idx++] = "</td></tr>";

	return idx;
};

ZmContactView.prototype._installOnKeyUpHandler =
function(field) {
	var e = document.getElementById(this._fieldIds[field]);
	if (e) {
		// only add onkeyup handlers to input/textarea's
		var tagName = e.tagName.toLowerCase();
		if (tagName == "input" || tagName == "textarea") {
			Dwt.setHandler(e, DwtEvent.ONKEYUP, ZmContactView._onKeyUp);
			Dwt.associateElementWithObject(e, this);
			e._field = field;
		}
	}
};

ZmContactView.prototype._setValue =
function(field, isDate) {
	var value = (this._attr[field]) || "";
	var e = document.getElementById(this._fieldIds[field]);
	if (e != null) {
		if (isDate && value && value != "") {
			var val = this._bdateFormatter.parse(value);
			e.value = val ? AjxDateUtil.simpleComputeDateStr(val) : "";
		} else {
			e.value = value;
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
				this._attr[field] = this._bdateFormatter.format(bdate);
			} else {
				this._attr[field] = e.value;
			}
		} else {
			this._attr[field] = undefined;
		}
	}
};


ZmContactView.prototype._setHeaderColor =
function() {
	// set the appropriate header color
	var folderId = this._contact.folderId;
	var folder = folderId ? this._appCtxt.getTree(ZmOrganizer.ADDRBOOK).getById(folderId) : null;
	var color = folder ? folder.color : ZmOrganizer.DEFAULT_COLOR[ZmOrganizer.ADDRBOOK];
	var bkgdColor = ZmOrganizer.COLOR_TEXT[color] + "Bg";
	var contactHdrRow = document.getElementById(this._contactHeaderRowId);
	contactHdrRow.className = "contactHeaderRow " + bkgdColor;
};

ZmContactView.prototype._setTitle =
function(title) {
	var div =  document.getElementById(this._fieldIds[ZmContactView.F_contactTitle]);
	var fileAs = title != null ? title : this._contact.getFileAs();
	div.innerHTML = fileAs ? fileAs : this._contact.id ? "&nbsp;" : ZmMsg.newContact;
};

ZmContactView.prototype._setTags =
function() {
	// get sorted list of tags for this msg
	var ta = new Array();
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

	this._getTagCell().innerHTML = html.join("");
};

ZmContactView.prototype._getTagCell =
function() {
	return document.getElementById(this._fieldIds[ZmContactView.F_contactTags]);
};

ZmContactView.prototype._setFields =
function() {
	this._setHeaderColor();
	this._setTitle();
	this._setTags();

	// set primary info (minus fileas)
	var primaryInfo = ZmContactView.primaryInfoOne.concat(ZmContactView.primaryInfoTwo);
	for (var i=0; i<primaryInfo.length; i++) {
		if (primaryInfo[i] == ZmContact.F_fileAs)
			continue;
		this._setValue(primaryInfo[i]);
	}

	// set email info
	for (var i=0; i<ZmContactView.emailInfo.length; i++)
		this._setValue(ZmContactView.emailInfo[i]);

	// set work address fields
	for (var i=0; i<ZmContactView.workAddrInfo.length; i++)
		this._setValue(ZmContactView.workAddrInfo[i]);

	// set work phone numbers
	for (var i=0; i<ZmContactView.workPhoneInfo.length; i++)
		this._setValue(ZmContactView.workPhoneInfo[i]);

	// set home address fields
	for (var i=0; i<ZmContactView.homeAddrInfo.length; i++)
		this._setValue(ZmContactView.homeAddrInfo[i]);

	// set home phone numbers
	for (var i=0; i<ZmContactView.homePhoneInfo.length; i++)
		this._setValue(ZmContactView.homePhoneInfo[i]);

	// set other address fields
	for (var i=0; i<ZmContactView.otherAddrInfo.length; i++)
		this._setValue(ZmContactView.otherAddrInfo[i]);

	// set other phone numbers
	for (var i=0; i<ZmContactView.otherPhoneInfo.length; i++)
		this._setValue(ZmContactView.otherPhoneInfo[i]);

	// set misc. info
	for (var i=0; i<ZmContactView.miscInfo.length; i++)
		this._setValue(ZmContactView.miscInfo[i], true);

	// set file as
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

	// set folder drop down
	this._setFolder();

	// set notes
	this._setValue(ZmContact.F_notes);
};

ZmContactView.prototype._getFields =
function() {
	// get primary info (minus fileas)
	var primaryInfo = ZmContactView.primaryInfoOne.concat(ZmContactView.primaryInfoTwo);
	for (var i=0; i<primaryInfo.length; i++) {
		if (primaryInfo[i] == ZmContact.F_fileAs)
			continue;
		if (primaryInfo[i] == ZmContact.F_folderId)
			this._folderId = this._folderSelect.getValue();
		else
			this._getValue(primaryInfo[i]);
	}

	// get email info
	for (var i=0; i<ZmContactView.emailInfo.length; i++)
		this._getValue(ZmContactView.emailInfo[i]);

	// get work address fields
	for (var i=0; i<ZmContactView.workAddrInfo.length; i++)
		this._getValue(ZmContactView.workAddrInfo[i]);

	// get work phone numbers
	for (var i=0; i<ZmContactView.workPhoneInfo.length; i++)
		this._getValue(ZmContactView.workPhoneInfo[i]);

	// get home address fields
	for (var i=0; i<ZmContactView.homeAddrInfo.length; i++)
		this._getValue(ZmContactView.homeAddrInfo[i]);

	// get home phone numbers
	for (var i=0; i<ZmContactView.homePhoneInfo.length; i++)
		this._getValue(ZmContactView.homePhoneInfo[i]);

	// get other address fields
	for (var i=0; i<ZmContactView.otherAddrInfo.length; i++)
		this._getValue(ZmContactView.otherAddrInfo[i]);

	// get other phone numbers
	for (var i=0; i<ZmContactView.otherPhoneInfo.length; i++)
		this._getValue(ZmContactView.otherPhoneInfo[i]);

	// get dates
	for (var i=0; i<ZmContactView.miscInfo.length; i++)
		this._getValue(ZmContactView.miscInfo[i], true);

	// get notes
	this._getValue(ZmContact.F_notes);
};

ZmContactView.prototype._createHtml =
function(contact) {
	if (!this._isReadOnly) {
		this._fieldIds = new Object();

		var titleId = Dwt.getNextId();
		this._fieldIds[ZmContactView.F_contactTitle] = titleId;

		var tagsId = Dwt.getNextId();
		this._fieldIds[ZmContactView.F_contactTags] = tagsId;

		this._contactHeaderId = Dwt.getNextId();
		this._contactHeaderRowId = Dwt.getNextId();
	}

	var idx = 0;
	var html = new Array(50);

	// Title bar
	html[idx++] = "<table id='";
	html[idx++] = this._contactHeaderId;
	html[idx++] = "' cellspacing=0 cellpadding=0><tr class='contactHeaderRow' id='";
	html[idx++] = this._contactHeaderRowId;
	html[idx++] = "'><td width=20><center>";
	html[idx++] = AjxImg.getImageHtml(contact.getIcon());
	html[idx++] = "</center></td>";
	if (this._isReadOnly) {
		html[idx++] = "<td><div>";
		html[idx++] = contact.getFileAs();
		html[idx++] = "</div></td>";
	} else {
		html[idx++] = "<td><div id='";
		html[idx++] = titleId;
		html[idx++] = "' class='contactHeader'></div></td>";
		html[idx++] = "<td align='right' id='";
		html[idx++] = tagsId;
		html[idx++] = "'></td>";
	}
	html[idx++] = "</tr></table>";

	// Primary contact info
	html[idx++] = "<div style='overflow:auto;";
	if (!this._isReadOnly) {
		this._contentId = Dwt.getNextId();
		html[idx++] = " visibility:hidden;' id='";
		html[idx++] = this._contentId;
		html[idx++] = "'>";
	} else {
		html[idx++] = "'>";
	}
	html[idx++] = "<table cellpadding=0 cellspacing=10 border=0>";

	idx = this._generateHtml(html, idx, null, ZmContactView.primaryInfoOne, ZmContactView.primaryInfoTwo);
	idx = this._generateHtml(html, idx, ZmMsg.email, ZmContactView.emailInfo);
	idx = this._generateHtml(html, idx, ZmMsg.work, ZmContactView.workAddrInfo, ZmContactView.workPhoneInfo);
	idx = this._generateHtml(html, idx, ZmMsg.home, ZmContactView.homeAddrInfo, ZmContactView.homePhoneInfo);
	idx = this._generateHtml(html, idx, ZmMsg.other, ZmContactView.otherAddrInfo, ZmContactView.otherPhoneInfo, ZmContactView.miscInfo);
	idx = this._createNotesHtml(html, idx);

	html[idx++] = "</table>";
	html[idx++] = "</div>";

	this.getHtmlElement().innerHTML = html.join("");

	if (this._isReadOnly) return;			// dont bother w/ rest if read only

	this._addSelectOptions(); 				// add DwtSelect's
	this._addDateCalendars();

	for (var i in this._fieldIds) 			// add onKeyUp handlers
		this._installOnKeyUpHandler(i);

	this._htmlInitialized = true;
};

ZmContactView.prototype._getTabGroupMembers =
function() {
	var ids = [];
	ids = ids.concat(ZmContactView.primaryInfoOne, ZmContactView.primaryInfoTwo, ZmContactView.emailInfo,
					 ZmContactView.workAddrInfo, ZmContactView.workPhoneInfo, ZmContactView.homeAddrInfo,
					 ZmContactView.homePhoneInfo, ZmContactView.otherAddrInfo, ZmContactView.otherPhoneInfo,
					 ZmContact.F_birthday, ZmContact.F_notes);
	var fields = [];
	for (var i = 0; i < ids.length; i++) {
		var field = document.getElementById(this._fieldIds[ids[i]]);
		if (field) {
			fields.push(field);
		}
	}

	return fields;
};

ZmContactView.prototype._getDefaultFocusItem =
function() {
	return document.getElementById(this._fieldIds[ZmContact.F_lastName]);
};

ZmContactView.prototype._setFolder =
function() {
	var match;
	if (this._contact.id == null) {
		var clc = AjxDispatcher.run("GetContactListController");
		match = clc._folderId;
	} else {
		match = this._contact.addrbook ? this._contact.addrbook.id : ZmFolder.ID_CONTACTS;
	}

	var folders = this._appCtxt.getFolderTree().getByType(ZmOrganizer.ADDRBOOK);

	// for now, always re-populate folders DwtSelect
	this._folderSelect.clearOptions();

	for (var i = 0; i < folders.length; i++) {
		var folder = folders[i];
		if (folder.id == ZmFolder.ID_ROOT ||
			folder.isInTrash() ||
			folder.isReadOnly())
		{
			continue;
		}

		this._folderSelect.addOption(folder.name, folder.id == match, folder.id);
	}
};


// Listeners

ZmContactView.prototype._contactChangeListener =
function(ev) {
	if (ev.type != ZmEvent.S_CONTACT)
		return;

	if (ev.event == ZmEvent.E_TAGS || ev.event == ZmEvent.E_REMOVE_ALL)
		this._setTags(this._contact);
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
	var dateField = document.getElementById(this._fieldIds[ZmContact.F_birthday]);
	var aDate = AjxDateUtil.simpleParseDateStr(dateField.value);

	// if date was input by user and its fubar, reset to today's date
	if (isNaN(aDate) || aDate == null) {
		aDate = new Date();
	}

	// always reset the date to current field's date
	var menu = ev.item.getMenu();
	var cal = menu.getItem(0);
	cal.setDate(aDate, true);
	ev.item.popup();
};

ZmContactView.prototype._dateSelectionListener =
function(ev) {
	var dateField = document.getElementById(this._fieldIds[ZmContact.F_birthday]);
	dateField.value = AjxDateUtil.simpleComputeDateStr(ev.detail);
};



// Static methods

ZmContactView._onKeyUp =
function(ev) {

	ev = DwtUiEvent.getEvent(ev);

	var key = DwtKeyEvent.getCharCode(ev);
	if (ev.metaKey || ev.altKey || ev.ctrlKey || DwtKeyMapMgr.isModifier(key) || key == DwtKeyMapMgr.TAB_KEYCODE)
		return;

	var e = DwtUiEvent.getTarget(ev);
	if (e) {
		var view = Dwt.getObjectFromElement(e);
		view._isDirty = true;

		if (e._field == ZmContact.F_firstName ||
			e._field == ZmContact.F_lastName ||
			e._field == ZmContact.F_company)
		{
			view._attr[e._field] = e.value;
			view._setTitle(ZmContact.computeFileAs(view._attr));
		}
	}
	return true;
};

ZmContactView.getPrintHtml =
function(contact, abridged, appCtxt) {

	contact = contact.list._realizeContact(contact); // make sure it's a real ZmContact

	var html = new Array();
	var idx = 0;

	if (abridged) {
		var fields = [ZmContact.F_jobTitle, ZmContact.F_company, ZmContact.F_workPhone, ZmContact.F_mobilePhone, ZmContact.F_email, ZmContact.F_email2, ZmContact.F_email3];

		html[idx++] = "<table border=0 cellpadding=2 cellspacing=2 width=100%>";
		html[idx++] = "<tr><td colspan=2 style='font-family:Arial; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; font-weight:bold; background-color:#DDDDDD'>";
		html[idx++] = contact.getFileAs();
		html[idx++] = "</td></tr>";
		html[idx++] = "<tr><td valign=top style='font-family:Arial; font-size:12px; white-space:nowrap; overflow:hidden;'>";
		html[idx++] = ZmMsg.AB_FIELD_fullName;
		html[idx++] = ":</td>";
		html[idx++] = "<td style='font-family:Arial; font-size:12px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;'>";
		html[idx++] = contact.getFullName();
		html[idx++] = "</td></tr>";

		for (var i = 0; i < fields.length; i++) {
			var value = AjxStringUtil.htmlEncode(contact.getAttr(fields[i]));
			if (value) {
				html[idx++] = "<tr><td valign=top style='font-family:Arial; font-size:12px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;'>";
				html[idx++] = AjxStringUtil.htmlEncode(ZmContact._AB_FIELD[fields[i]]);
				html[idx++] = ":</td>";
				html[idx++] = "<td valign=top style='font-family:Arial; font-size:12px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;'>";
				html[idx++] = AjxStringUtil.htmlEncode(value);
				html[idx++] = "</td></tr>";
			}
		}
		html[idx++] = "</table>";
	} else {
		var cc = AjxDispatcher.run("GetContactController");
		var printView = new ZmContactView(cc._container, appCtxt, this._controller, true);
		printView.setLocation(Dwt.LOC_NOWHERE, Dwt.LOC_NOWHERE);
		printView.zShow(false);
		printView.set(contact);

		html[idx++] = "<div class='ZmContactView'>";
		html[idx++] = printView.getHtmlElement().innerHTML;
		html[idx++] = "</div>";

		// cleanup
		cc._container.getHtmlElement().removeChild(printView.getHtmlElement());
	}

	return html.join("");
};
