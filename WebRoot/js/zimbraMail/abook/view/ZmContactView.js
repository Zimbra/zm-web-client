/*
 * ***** BEGIN LICENSE BLOCK *****
 * Version: ZPL 1.1
 * 
 * The contents of this file are subject to the Zimbra Public License
 * Version 1.1 ("License"); you may not use this file except in
 * compliance with the License. You may obtain a copy of the License at
 * http://www.zimbra.com/license
 * 
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied. See
 * the License for the specific language governing rights and limitations
 * under the License.
 * 
 * The Original Code is: Zimbra Collaboration Suite.
 * 
 * The Initial Developer of the Original Code is Zimbra, Inc.
 * Portions created by Zimbra are Copyright (C) 2005 Zimbra, Inc.
 * All Rights Reserved.
 * 
 * Contributor(s):
 * 
 * ***** END LICENSE BLOCK *****
 */

function ZmContactView(parent, appCtxt, controller, isReadOnly) {

	DwtComposite.call(this, parent, "ZmContactView", DwtControl.ABSOLUTE_STYLE);

	this._appCtxt = appCtxt;
	this._controller = controller;

	// read only flag is mainly used for printing a single contact
	this._isReadOnly = isReadOnly;
	this.getHtmlElement().style.overflow = "hidden";
	if (!isReadOnly)
		this._changeListener = new AjxListener(this, this._contactChangeListener);
}

ZmContactView.prototype = new DwtComposite;
ZmContactView.prototype.constructor = ZmContactView;

ZmContactView.prototype.toString = 
function() {
	return "ZmContactView";
}

// Consts

ZmContactView.F_contactTitle	= 1;
ZmContactView.F_contactTags		= 2;

ZmContactView.primaryInfoOne = [ZmContact.F_lastName, ZmContact.F_firstName, ZmContact.F_middleName];
ZmContactView.primaryInfoTwo = [ZmContact.F_jobTitle, ZmContact.F_company, ZmContact.F_fileAs];
ZmContactView.emailInfo = [ZmContact.F_email, ZmContact.F_email2, ZmContact.F_email3];
ZmContactView.workAddrInfo = [ZmContact.F_workStreet, ZmContact.F_workCity, ZmContact.F_workState, ZmContact.F_workPostalCode, ZmContact.F_workCountry, ZmContact.F_workURL];
ZmContactView.workPhoneInfo = [ZmContact.F_workPhone, ZmContact.F_workPhone2, ZmContact.F_workFax, ZmContact.F_assistantPhone, ZmContact.F_companyPhone, ZmContact.F_callbackPhone];
ZmContactView.homeAddrInfo = [ZmContact.F_homeStreet, ZmContact.F_homeCity, ZmContact.F_homeState, ZmContact.F_homePostalCode, ZmContact.F_homeCountry, ZmContact.F_homeURL];
ZmContactView.homePhoneInfo = [ZmContact.F_homePhone, ZmContact.F_homePhone2, ZmContact.F_homeFax, ZmContact.F_mobilePhone, ZmContact.F_pager, ZmContact.F_carPhone];
ZmContactView.otherAddrInfo = [ZmContact.F_otherStreet, ZmContact.F_otherCity, ZmContact.F_otherState, ZmContact.F_otherPostalCode, ZmContact.F_otherCountry, ZmContact.F_otherURL];
ZmContactView.otherPhoneInfo = [ZmContact.F_otherPhone, ZmContact.F_otherFax];

ZmContactView._selectFields = { 
	"fileAs": [ 
		{ name: ZmContact._AB_FILE_AS[ZmContact.FA_LAST_C_FIRST], 			selected: true  }, 
		{ name: ZmContact._AB_FILE_AS[ZmContact.FA_FIRST_LAST], 				selected: false },
		{ name: ZmContact._AB_FILE_AS[ZmContact.FA_COMPANY], 				selected: false },
		{ name: ZmContact._AB_FILE_AS[ZmContact.FA_LAST_C_FIRST_COMPANY], 	selected: false },
		{ name: ZmContact._AB_FILE_AS[ZmContact.FA_FIRST_LAST_COMPANY], 		selected: false },
		{ name: ZmContact._AB_FILE_AS[ZmContact.FA_COMPANY_LAST_C_FIRST], 	selected: false },
		{ name: ZmContact._AB_FILE_AS[ZmContact.FA_COMPANY_FIRST_LAST], 		selected: false }
	]
};

// Message dialog placement
ZmContactView.DIALOG_X = 50;
ZmContactView.DIALOG_Y = 100;
	
// need this since contact view now derives from list controller
ZmContactView.prototype.getList = function() { return null; }

ZmContactView.prototype.getContact =
function() {
	return this._contact;
}

ZmContactView.prototype.getController =
function() {
	return this._controller;
}

ZmContactView.prototype.set =
function(contact) {

	this._attr = new Object();
	for (var a in contact.getAttrs())
		this._attr[a] = contact.getAttr(a);

	if (!this._htmlInitialized)
		this._createHtml(contact);

	if (this._isReadOnly) return;

	if (this._contact)
		this._contact.removeChangeListener(this._changeListener);
	contact.addChangeListener(this._changeListener);
	this._contact = contact;

	this._setFields();

	var contentDiv = Dwt.getDomObj(this.getDocument(), this._contentId);
	Dwt.setVisibility(contentDiv, true);
	contentDiv.scrollTop = 0; // bug fix #3362
	
	var lastNameInput = Dwt.getDomObj(this.getDocument(), this._fieldIds[ZmContact.F_lastName]);
	lastNameInput.focus(); // bug fix #937
	
	this._isDirty = false;
}

ZmContactView.prototype.getModifiedAttrs =
function() {
	this._getFields();
	var mods = new Object();
	var foundOne = false;
	
	// creating new contact (possibly some fields - but not ID - prepopulated)
	if (this._contact.id == null || this._contact.isGal) {
		for (var a in this._attr) {		
			// bug fix #2982 - convert fileAs value to a String
			var val = a == ZmContact.F_fileAs ? ("" + this._attr[a]) : AjxStringUtil.trim(this._attr[a]);
			if ((val && val.length > 0)) {
				mods[a] = val;
				foundOne = true;
			} else {
				val = AjxStringUtil.trim(this._contact.getAttr(a));
				if (val && val.length > 0) {
					mods[a] = val;
					foundOne = true;
				}
			}
		}
	// modifying existing contact
	} else {
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
	}
	return foundOne ? mods : null;
}

ZmContactView.prototype.enableInputs = 
function(bEnable) {
	for (var i in this._fieldIds) {
		var field = Dwt.getDomObj(this.getDocument(), this._fieldIds[i]);
		if (field)
			field.disabled = !bEnable;
	}
}

// Following two overrides are a hack to allow this view to pretend it's a list view
ZmContactView.prototype.getSelection = 
function() {
	return this._contact;
}

ZmContactView.prototype.getSelectionCount = 
function() {
	return 1;
}

ZmContactView.prototype.isDirty = 
function() {
	return this._isDirty;
}

// Consistent spot to locate various dialogs
ZmContactView.prototype._getDialogXY =
function() {
	var loc = Dwt.toWindow(this.getHtmlElement(), 0, 0);
	return new DwtPoint(loc.x + ZmContactView.DIALOG_X, loc.y + ZmContactView.DIALOG_Y);
}

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

ZmContactView.prototype._sizeChildren = 
function(width, height) {
	var doc = this.getDocument();
	
	var contentDiv = Dwt.getDomObj(doc, this._contentId);
	if (contentDiv)
		Dwt.setSize(contentDiv, width, (height-45));

	var contactHeader = Dwt.getDomObj(doc, this._contactHeaderId);
	if (contactHeader)
		Dwt.setSize(contactHeader, width);

	var contactHeaderDiv = Dwt.getDomObj(doc, this._fieldIds[ZmContactView.F_contactTitle]);
	if (contactHeaderDiv)
		Dwt.setSize(contactHeaderDiv, width-50); // offet by 50px to allow tag icon!
}

ZmContactView.prototype._contactChangeListener =
function(ev) {
	if (ev.type != ZmEvent.S_CONTACT)
		return;
	if (ev.event == ZmEvent.E_TAGS || ev.event == ZmEvent.E_REMOVE_ALL)
		this._setTags(this._contact);
}

ZmContactView.prototype._addEntryRow =
function(field, html, idx) {
	html[idx++] = "<tr>";
	html[idx++] = "<td style='width:18ex;'>" + AjxStringUtil.htmlEncode(ZmContact._AB_FIELD[field]) + ":" + "</td>";
	if (!this._isReadOnly) {
		var id = this._fieldIds[field] = Dwt.getNextId();
		html[idx++] = "<td><input type='text' size=35 id='" + id + "'></td>";
	} else {
		html[idx++] = "<td>" + (this._attr[field] || "") + "</td>";
	}
	html[idx++] = "</tr>";
	return idx;
}

ZmContactView.prototype._addStreetRow =
function(field, html, idx) {
	html[idx++] = "<tr>";
	html[idx++] = "<td valign=top style='width:18ex;'>" + AjxStringUtil.htmlEncode(ZmContact._AB_FIELD[field]) + ":" + "</td>";
	html[idx++] = "<td align=right>";
	if (!this._isReadOnly) {
		var id = this._fieldIds[field] = Dwt.getNextId();
		var rows = AjxEnv.isIE ? 3 : 2;
		html[idx++] = "<textarea wrap='hard' cols=32 rows=" + rows + " id='" + id + "'></textarea>";
	} else {
		html[idx++] = this._attr[field] ? AjxStringUtil.htmlEncode(this._attr[field]) : "";
	}
	html[idx++] = "</td></tr>";
	return idx;
}

ZmContactView.prototype._addFileAsRow =
function(html, idx) {
	this._fileAsSelectCellId = Dwt.getNextId();
	html[idx++] = "<tr valign='center'>";
	html[idx++] = "<td>" + ZmMsg.fileAs + ":" + "</td>";
	html[idx++] = "<td id='" + this._fileAsSelectCellId + "'></td>";
	html[idx++] = "</tr>";
	return idx;
}

ZmContactView.prototype._addSelectOptions = 
function() {
	if (this._fileAsSelectCellId) {
		// add all the options for file as...
		this._fileAsSelect = new DwtSelect(this);
		var fileAsSelectOptions = ZmContactView._selectFields["fileAs"];
		var count = 0;
		for (var i in fileAsSelectOptions) {
			this._fileAsSelect.addOption(fileAsSelectOptions[i].name, fileAsSelectOptions[i].selected, ++count);
		}
		var selectCell = Dwt.getDomObj(this.getDocument(), this._fileAsSelectCellId);
		selectCell.appendChild(this._fileAsSelect.getHtmlElement());
		
		// add change listener for this select
		this._fileAsSelect.addChangeListener(new AjxListener(this, this._selectChangeListener));
		this._fileAsSelect._cv = this; // add back pointer to compose view
	}
}

ZmContactView.prototype._generateHtml =
function(html, idx, label, colOneInfo, colTwoInfo) {
	// add label
	if (label) {
		html[idx++] = "<tr><td colspan=10 valign=top class='editLabel'>";
		html[idx++] = label + "<hr style='margin:0px' noshade size=1 color='#000000'>";
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
		} else {
			idx = this._addEntryRow(colOneInfo[i], html, idx);
		}
	}
	html[idx++] = "</table>";
	html[idx++] = "</td>";

	if (colTwoInfo) {
		// add phone numbers in second column
		html[idx++] = "<td valign=top>";
		html[idx++] = "<table cellpadding=0 cellspacing=2 border=0>";
		for (var i=0; i<colTwoInfo.length; i++) {
			if (colTwoInfo[i] == ZmContact.F_fileAs) {
				if (!this._isReadOnly)
					idx = this._addFileAsRow(html, idx);
			} else {
				idx = this._addEntryRow(colTwoInfo[i], html, idx);
			}
		}
		html[idx++] = "</table>";
		html[idx++] = "</td>";
	}
	html[idx++] = "</tr>";	
	
	return idx;
}

ZmContactView.prototype._createNotesHtml =
function(html, idx) {
	// add label
	html[idx++] = "<tr><td colspan=10 valign=top class='editLabel'>";
	html[idx++] = "Notes<hr style='margin:0px' noshade size=1 color='#000000'>";
	html[idx++] = "</td></tr>";

	// add textarea
	html[idx++] = "<tr><td valign=top colspan=10>";
	if (!this._isReadOnly) {
		var notesId = this._fieldIds[ZmContact.F_notes] = Dwt.getNextId();
		html[idx++] = "<textarea wrap='hard' rows=8 style='width:100%;' id='" + notesId + "'></textarea>";
	}
	else
		html[idx++] = this._attr[ZmContact.F_notes];
	html[idx++] = "</td></tr>";

	return idx;
}

ZmContactView.prototype._installOnKeyUpHandler = 
function(field) {
	var e = Dwt.getDomObj(this.getDocument(), this._fieldIds[field]);
	if (e) {
		// only add onkeyup handlers to input/textarea's
		var tagName = e.tagName.toLowerCase();
		if (tagName == "input" || tagName == "textarea") {
			Dwt.setHandler(e, DwtEvent.ONKEYUP, ZmContactView._onKeyUp); 
			// TODO circular reference
			e._view = this;
			e._field = field;
		}
	}
}

ZmContactView._onKeyUp =
function(ev) {

	var e = DwtUiEvent.getTarget(ev);
	if (e) {
		e._view._isDirty = true;
		
		if (e._field == ZmContact.F_firstName ||
		  	e._field == ZmContact.F_lastName ||
			e._field == ZmContact.F_company)
		{
			e._view._attr[e._field] = e.value;
			e._view._setTitle(ZmContact.computeFileAs(e._view._attr));
		}
	}
	return true;
}

ZmContactView.prototype._selectChangeListener = 
function(ev) {
	var selectObj = ev._args.selectObj;
	var newValue = ev._args.newValue;
	var cv = selectObj ? selectObj._cv : null;
	
	if (cv) {
		if (selectObj == this._fileAsSelect) {
			cv._attr[ZmContact.F_fileAs] = newValue;
			cv._setTitle(ZmContact.computeFileAs(cv._attr));
			cv._isDirty = true;
		}
	}
}

ZmContactView.prototype._setValue =
function(field) {
	var value = this._attr[field];
	var e = Dwt.getDomObj(this.getDocument(), this._fieldIds[field]);
	if (e != null)
		e.value = value || "";
}

ZmContactView.prototype._getValue =
function(field) {
	var e =  Dwt.getDomObj(this.getDocument(), this._fieldIds[field]);
	if (e && e.value != undefined)
		this._attr[field] = e.value != "" ? e.value : undefined;
}

ZmContactView.prototype._setTitle =
function(title) {
	var div =  Dwt.getDomObj(this.getDocument(), this._fieldIds[ZmContactView.F_contactTitle]);
	var fileAs = title != null ? title : this._contact.getFileAs();
	div.innerHTML = fileAs ? fileAs : this._contact.id ? "&nbsp;" : ZmMsg.newContact;
}

ZmContactView.prototype._setTags =
function() {
	var img =  Dwt.getDomObj(this.getDocument(), this._fieldIds[ZmContactView.F_contactTags]);
	AjxImg.setImage(img, this._contact.getTagImageInfo());
}

ZmContactView.prototype._setFields =
function() {
	this._setTitle();
	this._setTags();

	// set primary info (minus fileas)
	var primaryInfo = ZmContactView.primaryInfoOne.concat(ZmContactView.primaryInfoTwo);
	for (var i=0; i<primaryInfo.length-1; i++)
		this._setValue(primaryInfo[i]);

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

	// set file as
	if (this._attr.fileAs) {
		var fa = parseInt(this._attr.fileAs) - 1;
		// do we have a custom file as?
		if (fa >= this._fileAsSelect.size()) {
			// TODO - append to the end of the select list?
		} else {
			this._fileAsSelect.setSelected(fa);
		}
	}

	// set notes
	this._setValue(ZmContact.F_notes);
}

ZmContactView.prototype._getFields =
function() {
	// get primary info (minus fileas)
	var primaryInfo = ZmContactView.primaryInfoOne.concat(ZmContactView.primaryInfoTwo);
	for (var i=0; i<primaryInfo.length-1; i++)
		this._getValue(primaryInfo[i]);

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

	// get notes
	this._getValue(ZmContact.F_notes);
}

ZmContactView.prototype._createHtml =
function(contact) {
	if (!this._isReadOnly) {
		this._fieldIds = new Object();
	
		var titleId = Dwt.getNextId();
		this._fieldIds[ZmContactView.F_contactTitle] = titleId;
	
		var tagsId = Dwt.getNextId();
		this._fieldIds[ZmContactView.F_contactTags] = tagsId;
		
		this._contactHeaderId = Dwt.getNextId();
	}
	
	var idx = 0;
	var html = new Array(50);

	// Title bar
	html[idx++] = "<table id='" + this._contactHeaderId + "' bgcolor='#CCCCCC'><tr>";
	if (this._isReadOnly) {
		html[idx++] = "<td><div class='contactHeader'>" + contact.getFileAs() + "</div></td>";
	} else {
		html[idx++] = "<td><div class='contactHeader' id='" + titleId + "'></div></td>";
		html[idx++] = "<td align='right' id='" + tagsId + "'></td>";
	}
	html[idx++] = "</tr></table>";

	// Primary contact info	
	html[idx++] = "<div style='overflow:auto;'";
	if (!this._isReadOnly) {
		this._contentId = Dwt.getNextId();
		html[idx++] = " visibility:hidden;' id='" + this._contentId + "'";
	}
	html[idx++] = ">";
	html[idx++] = "<table cellpadding=0 cellspacing=10 border=0>";

	idx = this._generateHtml(html, idx, null, ZmContactView.primaryInfoOne, ZmContactView.primaryInfoTwo);
	idx = this._generateHtml(html, idx, "Email", ZmContactView.emailInfo);
	idx = this._generateHtml(html, idx, "Work", ZmContactView.workAddrInfo, ZmContactView.workPhoneInfo);
	idx = this._generateHtml(html, idx, "Home", ZmContactView.homeAddrInfo, ZmContactView.homePhoneInfo);
	idx = this._generateHtml(html, idx, "Other", ZmContactView.otherAddrInfo, ZmContactView.otherPhoneInfo);
	idx = this._createNotesHtml(html, idx);

	html[idx++] = "</table>";
	html[idx++] = "</div>";

	this.getHtmlElement().innerHTML = html.join("");

	if (this._isReadOnly) return;			// dont bother w/ rest if read only

	this._addSelectOptions(); 				// add DwtSelect's	

	for (var i in this._fieldIds) 			// add onKeyUp handlers
		this._installOnKeyUpHandler(i);

	this._htmlInitialized = true;
}

ZmContactView.getPrintHtml = 
function(contact, abridged, appCtxt) {

	var html = new Array();
	var idx = 0;

	if (abridged) {
		var fields = [ZmContact.F_jobTitle, ZmContact.F_company, ZmContact.F_workPhone, ZmContact.F_mobilePhone, ZmContact.F_email, ZmContact.F_email2, ZmContact.F_email3];

		html[idx++] = "<table border=0 cellpadding=2 cellspacing=2 width=100%>";
		html[idx++] = "<tr><td colspan=2 class='ZmContactField' style='font-weight: bold; background-color: #DDDDDD'>" + contact.getFileAs() + "</td></tr>";
		html[idx++] = "<tr><td valign=top>Full Name:</td><td style='overflow: hidden'>" + contact.getFullName() + "</td></tr>";
		
		for (var i = 0; i < fields.length; i++) {
			var value = AjxStringUtil.htmlEncode(contact.getAttr(fields[i]));
			if (value) {
				html[idx++] = "<tr><td valign=top>" + AjxStringUtil.htmlEncode(ZmContact._AB_FIELD[fields[i]]) + ":</td>";
				html[idx++] = "<td valign=top style='overflow: hidden'>" + AjxStringUtil.htmlEncode(value) + "</td>";
				html[idx++] = "</tr>";
			}
		}
		html[idx++] = "</table>";
	} else {
		var cc = appCtxt.getApp(ZmZimbraMail.CONTACTS_APP).getContactController();
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
}
