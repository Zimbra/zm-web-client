function LmContactView(parent, isReadOnly) {
	DwtComposite.call(this, parent, "LmContactView", DwtControl.ABSOLUTE_STYLE);
	this._appCtxt = this.shell.getData(LmAppCtxt.LABEL);
	// read only flag is mainly used for printing a single contact
	this._isReadOnly = isReadOnly;
	this.getHtmlElement().style.overflow = "hidden";
	if (!isReadOnly)
		this._changeListener = new LsListener(this, this._contactChangeListener);
}

LmContactView.prototype = new DwtComposite;
LmContactView.prototype.constructor = LmContactView;

LmContactView.prototype.toString = 
function() {
	return "LmContactView";
}

// Consts

LmContactView.F_contactTitle	= 1;
LmContactView.F_contactTags		= 2;

LmContactView.primaryInfoOne = [LmContact.F_lastName, LmContact.F_firstName, LmContact.F_middleName];
LmContactView.primaryInfoTwo = [LmContact.F_jobTitle, LmContact.F_company, LmContact.F_fileAs];
LmContactView.emailInfo = [LmContact.F_email, LmContact.F_email2, LmContact.F_email3];
LmContactView.workAddrInfo = [LmContact.F_workStreet, LmContact.F_workCity, LmContact.F_workState, LmContact.F_workPostalCode, LmContact.F_workCountry, LmContact.F_workURL];
LmContactView.workPhoneInfo = [LmContact.F_workPhone, LmContact.F_workPhone2, LmContact.F_workFax, LmContact.F_assistantPhone, LmContact.F_companyPhone, LmContact.F_callbackPhone];
LmContactView.homeAddrInfo = [LmContact.F_homeStreet, LmContact.F_homeCity, LmContact.F_homeState, LmContact.F_homePostalCode, LmContact.F_homeCountry, LmContact.F_homeURL];
LmContactView.homePhoneInfo = [LmContact.F_homePhone, LmContact.F_homePhone2, LmContact.F_homeFax, LmContact.F_mobilePhone, LmContact.F_pager, LmContact.F_carPhone];
LmContactView.otherAddrInfo = [LmContact.F_otherStreet, LmContact.F_otherCity, LmContact.F_otherState, LmContact.F_otherPostalCode, LmContact.F_otherCountry, LmContact.F_otherURL];
LmContactView.otherPhoneInfo = [LmContact.F_otherPhone, LmContact.F_otherFax];

LmContactView._selectFields = { 
	"fileAs": [ 
		{ name: LmMsg.AB_FILE_AS[LmContact.FA_LAST_C_FIRST], 			selected: true  }, 
		{ name: LmMsg.AB_FILE_AS[LmContact.FA_FIRST_LAST], 				selected: false },
		{ name: LmMsg.AB_FILE_AS[LmContact.FA_COMPANY], 				selected: false },
		{ name: LmMsg.AB_FILE_AS[LmContact.FA_LAST_C_FIRST_COMPANY], 	selected: false },
		{ name: LmMsg.AB_FILE_AS[LmContact.FA_FIRST_LAST_COMPANY], 		selected: false },
		{ name: LmMsg.AB_FILE_AS[LmContact.FA_COMPANY_LAST_C_FIRST], 	selected: false },
		{ name: LmMsg.AB_FILE_AS[LmContact.FA_COMPANY_FIRST_LAST], 		selected: false }
	]
};

// Message dialog placement
LmContactView.DIALOG_X = 50;
LmContactView.DIALOG_Y = 100;
	
// need this since contact view now derives from list controller
LmContactView.prototype.getList = function() { return null; }

LmContactView.prototype.getContact =
function() {
	return this._contact;
}

LmContactView.prototype.set =
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
	Dwt.setVisible2(contentDiv, true);
	contentDiv.scrollTop = 0; // bug fix #3362
	
	var lastNameInput = Dwt.getDomObj(this.getDocument(), this._fieldIds[LmContact.F_lastName]);
	lastNameInput.focus(); // bug fix #937
	
	this._isDirty = false;
}

LmContactView.prototype.getModifiedAttrs =
function() {
	this._getFields();
	var mods = new Object();
	var foundOne = false;
	
	// creating new contact (possibly some fields - but not ID - prepopulated)
	if (this._contact.id == null || this._contact.isGal) {
		for (var a in this._attr) {		
			var val = LsStringUtil.trim(this._attr[a]);
			if (val && val.length > 0) {
				mods[a] = val;
				foundOne = true;
			} else {
				val = LsStringUtil.trim(this._contact.getAttr(a));
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
			if (val) {
				val = LsStringUtil.trim(val);
				// fileAs is an Int!
				if (a == LmContact.F_fileAs && LsUtil.isString(val))
					val = parseInt(val);
			}
			
			if (this._attr[a] != val) {
				foundOne = true;
				mods[a] = this._attr[a];
				DBG.println(LsDebug.DBG2, "DIFF: " + a + " = " + mods[a]);
			}
		}
	}
	return foundOne ? mods : null;
}

LmContactView.prototype.enableInputs = 
function(bEnable) {
	for (var i in this._fieldIds) {
		var field = Dwt.getDomObj(this.getDocument(), this._fieldIds[i]);
		if (field)
			field.disabled = !bEnable;
	}
}

// Following two overrides are a hack to allow this view to pretend it's a list view
LmContactView.prototype.getSelection = 
function() {
	return this._contact;
}

LmContactView.prototype.getSelectionCount = 
function() {
	return 1;
}

LmContactView.prototype.isDirty = 
function() {
	return this._isDirty;
}

// Consistent spot to locate various dialogs
LmContactView.prototype._getDialogXY =
function() {
	var loc = Dwt.toWindow(this.getHtmlElement(), 0, 0);
	return new DwtPoint(loc.x + LmContactView.DIALOG_X, loc.y + LmContactView.DIALOG_Y);
}

LmContactView.prototype.setSize = 
function(width, height) {
	DwtComposite.prototype.setSize.call(this, width, height);
	this._sizeChildren(width, height);
};

LmContactView.prototype.setBounds = 
function(x, y, width, height) {
	DwtComposite.prototype.setBounds.call(this, x, y, width, height);
	this._sizeChildren(width, height);
};

LmContactView.prototype._sizeChildren = 
function(width, height) {
	var doc = this.getDocument();
	
	var contentDiv = Dwt.getDomObj(doc, this._contentId);
	if (contentDiv)
		Dwt.setSize(contentDiv, width, (height-45));

	var contactHeader = Dwt.getDomObj(doc, this._contactHeaderId);
	if (contactHeader)
		Dwt.setSize(contactHeader, width);
}

LmContactView.prototype._contactChangeListener =
function(ev) {
	if (ev.type != LmEvent.S_CONTACT)
		return;
	if (ev.event == LmEvent.E_TAGS || ev.event == LmEvent.E_REMOVE_ALL)
		this._setTags(this._contact);
}

LmContactView.prototype._addEntryRow =
function(field, html, idx) {
	html[idx++] = "<tr>";
	html[idx++] = "<td style='width:18ex;'>" + LsStringUtil.htmlEncode(LmMsg.AB_FIELD[field]) + ":" + "</td>";
	if (!this._isReadOnly) {
		var id = this._fieldIds[field] = Dwt.getNextId();
		html[idx++] = "<td><input type='text' size=35 id='" + id + "'></td>";
	} else {
		html[idx++] = "<td>" + (this._attr[field] || "") + "</td>";
	}
	html[idx++] = "</tr>";
	return idx;
}

LmContactView.prototype._addStreetRow =
function(field, html, idx) {
	html[idx++] = "<tr>";
	html[idx++] = "<td valign=top style='width:18ex;'>" + LsStringUtil.htmlEncode(LmMsg.AB_FIELD[field]) + ":" + "</td>";
	html[idx++] = "<td align=right>";
	if (!this._isReadOnly) {
		var id = this._fieldIds[field] = Dwt.getNextId();
		var rows = LsEnv.isIE ? 3 : 2;
		html[idx++] = "<textarea wrap='hard' cols=32 rows=" + rows + " id='" + id + "'></textarea>";
	} else {
		html[idx++] = this._attr[field] ? LsStringUtil.htmlEncode(this._attr[field]) : "";
	}
	html[idx++] = "</td></tr>";
	return idx;
}

LmContactView.prototype._addFileAsRow =
function(html, idx) {
	this._fileAsSelectCellId = Dwt.getNextId();
	html[idx++] = "<tr valign='center'>";
	html[idx++] = "<td>" + LmMsg.fileAs + ":" + "</td>";
	html[idx++] = "<td id='" + this._fileAsSelectCellId + "'></td>";
	html[idx++] = "</tr>";
	return idx;
}

LmContactView.prototype._addSelectOptions = 
function() {
	if (this._fileAsSelectCellId) {
		// add all the options for file as...
		this._fileAsSelect = new DwtSelect(this);
		var fileAsSelectOptions = LmContactView._selectFields["fileAs"];
		var count = 0;
		for (var i in fileAsSelectOptions) {
			this._fileAsSelect.addOption(fileAsSelectOptions[i].name, fileAsSelectOptions[i].selected, ++count);
		}
		var selectCell = Dwt.getDomObj(this.getDocument(), this._fileAsSelectCellId);
		selectCell.appendChild(this._fileAsSelect.getHtmlElement());
		
		// add change listener for this select
		this._fileAsSelect.addChangeListener(new LsListener(this, this._selectChangeListener));
		this._fileAsSelect._cv = this; // add back pointer to compose view
	}
}

LmContactView.prototype._generateHtml =
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
		if (colOneInfo[i] == LmContact.F_workStreet || 
			colOneInfo[i] == LmContact.F_homeStreet || 
			colOneInfo[i] == LmContact.F_otherStreet) {
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
			if (colTwoInfo[i] == LmContact.F_fileAs) {
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

LmContactView.prototype._createNotesHtml =
function(html, idx) {
	// add label
	html[idx++] = "<tr><td colspan=10 valign=top class='editLabel'>";
	html[idx++] = "Notes<hr style='margin:0px' noshade size=1 color='#000000'>";
	html[idx++] = "</td></tr>";

	// add textarea
	html[idx++] = "<tr><td valign=top colspan=10>";
	if (!this._isReadOnly) {
		var notesId = this._fieldIds[LmContact.F_notes] = Dwt.getNextId();
		html[idx++] = "<textarea wrap='hard' rows=8 style='width:100%;' id='" + notesId + "'></textarea>";
	}
	else
		html[idx++] = this._attr[LmContact.F_notes];
	html[idx++] = "</td></tr>";

	return idx;
}

LmContactView.prototype._installOnKeyUpHandler = 
function(field) {
	var e = Dwt.getDomObj(this.getDocument(), this._fieldIds[field]);
	if (e) {
		// only add onkeyup handlers to input/textarea's
		var tagName = e.tagName.toLowerCase();
		if (tagName == "input" || tagName == "textarea") {
			e.onkeyup = LmContactView._onKeyUp;
			// TODO circular reference
			e._view = this;
			e._field = field;
		}
	}
}

LmContactView._onKeyUp =
function(ev) {

	var e = DwtUiEvent.getTarget(ev);
	if (e) {
		e._view._isDirty = true;
		
		if (e._field == LmContact.F_firstName ||
		  	e._field == LmContact.F_lastName ||
			e._field == LmContact.F_company)
		{
			e._view._attr[e._field] = e.value;
			e._view._setTitle(LmContact.computeFileAs(e._view._attr));
		}
	}
	return true;
}

LmContactView.prototype._selectChangeListener = 
function(ev) {
	var selectObj = ev._args.selectObj;
	var newValue = ev._args.newValue;
	var cv = selectObj ? selectObj._cv : null;
	
	if (cv) {
		if (selectObj == this._fileAsSelect) {
			cv._attr[LmContact.F_fileAs] = newValue;
			cv._setTitle(LmContact.computeFileAs(cv._attr));
			cv._isDirty = true;
		}
	}
}

LmContactView.prototype._setValue =
function(field) {
	var value = this._attr[field];
	var e = Dwt.getDomObj(this.getDocument(), this._fieldIds[field]);
	if (e != null)
		e.value = value || "";
}

LmContactView.prototype._getValue =
function(field) {
	var e =  Dwt.getDomObj(this.getDocument(), this._fieldIds[field]);
	if (e && e.value != undefined)
		this._attr[field] = e.value != "" ? e.value : undefined;
}

LmContactView.prototype._setTitle =
function(title) {
	var div =  Dwt.getDomObj(this.getDocument(), this._fieldIds[LmContactView.F_contactTitle]);
	var fileAs = title != null ? title : this._contact.getFileAs();
	div.innerHTML = fileAs ? fileAs : this._contact.id ? "&nbsp;" : LmMsg.newContact;
}

LmContactView.prototype._setTags =
function() {
	var img =  Dwt.getDomObj(this.getDocument(), this._fieldIds[LmContactView.F_contactTags]);
	LsImg.setImage(img, this._contact.getTagImageInfo());
}

LmContactView.prototype._setFields =
function() {
	this._setTitle();
	this._setTags();

	// set primary info (minus fileas)
	var primaryInfo = LmContactView.primaryInfoOne.concat(LmContactView.primaryInfoTwo);
	for (var i=0; i<primaryInfo.length-1; i++)
		this._setValue(primaryInfo[i]);

	// set email info
	for (var i=0; i<LmContactView.emailInfo.length; i++)
		this._setValue(LmContactView.emailInfo[i]);

	// set work address fields
	for (var i=0; i<LmContactView.workAddrInfo.length; i++)
		this._setValue(LmContactView.workAddrInfo[i]);

	// set work phone numbers
	for (var i=0; i<LmContactView.workPhoneInfo.length; i++)
		this._setValue(LmContactView.workPhoneInfo[i]);

	// set home address fields
	for (var i=0; i<LmContactView.homeAddrInfo.length; i++)
		this._setValue(LmContactView.homeAddrInfo[i]);

	// set home phone numbers
	for (var i=0; i<LmContactView.homePhoneInfo.length; i++)
		this._setValue(LmContactView.homePhoneInfo[i]);

	// set other address fields
	for (var i=0; i<LmContactView.otherAddrInfo.length; i++)
		this._setValue(LmContactView.otherAddrInfo[i]);

	// set other phone numbers
	for (var i=0; i<LmContactView.otherPhoneInfo.length; i++)
		this._setValue(LmContactView.otherPhoneInfo[i]);

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
	this._setValue(LmContact.F_notes);
}

LmContactView.prototype._getFields =
function() {
	// get primary info (minus fileas)
	var primaryInfo = LmContactView.primaryInfoOne.concat(LmContactView.primaryInfoTwo);
	for (var i=0; i<primaryInfo.length-1; i++)
		this._getValue(primaryInfo[i]);

	// get email info
	for (var i=0; i<LmContactView.emailInfo.length; i++)
		this._getValue(LmContactView.emailInfo[i]);

	// get work address fields
	for (var i=0; i<LmContactView.workAddrInfo.length; i++)
		this._getValue(LmContactView.workAddrInfo[i]);

	// get work phone numbers
	for (var i=0; i<LmContactView.workPhoneInfo.length; i++)
		this._getValue(LmContactView.workPhoneInfo[i]);

	// get home address fields
	for (var i=0; i<LmContactView.homeAddrInfo.length; i++)
		this._getValue(LmContactView.homeAddrInfo[i]);

	// get home phone numbers
	for (var i=0; i<LmContactView.homePhoneInfo.length; i++)
		this._getValue(LmContactView.homePhoneInfo[i]);

	// get other address fields
	for (var i=0; i<LmContactView.otherAddrInfo.length; i++)
		this._getValue(LmContactView.otherAddrInfo[i]);

	// get other phone numbers
	for (var i=0; i<LmContactView.otherPhoneInfo.length; i++)
		this._getValue(LmContactView.otherPhoneInfo[i]);

	// get notes
	this._getValue(LmContact.F_notes);
}

LmContactView.prototype._createHtml =
function(contact) {
	if (!this._isReadOnly) {
		this._fieldIds = new Object();
	
		var titleId = Dwt.getNextId();
		this._fieldIds[LmContactView.F_contactTitle] = titleId;
	
		var tagsId = Dwt.getNextId();
		this._fieldIds[LmContactView.F_contactTags] = tagsId;
		
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
		html[idx++] = "<td width=20 align='right' id='" + tagsId + "'></td>";
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

	idx = this._generateHtml(html, idx, null, LmContactView.primaryInfoOne, LmContactView.primaryInfoTwo);
	idx = this._generateHtml(html, idx, "Email", LmContactView.emailInfo);
	idx = this._generateHtml(html, idx, "Work", LmContactView.workAddrInfo, LmContactView.workPhoneInfo);
	idx = this._generateHtml(html, idx, "Home", LmContactView.homeAddrInfo, LmContactView.homePhoneInfo);
	idx = this._generateHtml(html, idx, "Other", LmContactView.otherAddrInfo, LmContactView.otherPhoneInfo);
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

LmContactView.getPrintHtml = 
function(contact, abridged, appCtxt) {

	var html = new Array();
	var idx = 0;

	if (abridged) {
		var fields = [LmContact.F_jobTitle, LmContact.F_company, LmContact.F_workPhone, LmContact.F_mobilePhone, LmContact.F_email, LmContact.F_email2, LmContact.F_email3];

		html[idx++] = "<table border=0 cellpadding=2 cellspacing=2 width=100%>";
		html[idx++] = "<tr><td colspan=2 class='LmContactField' style='font-weight: bold; background-color: #DDDDDD'>" + contact.getFileAs() + "</td></tr>";
		html[idx++] = "<tr><td valign=top>Full Name:</td><td style='overflow: hidden'>" + contact.getFullName() + "</td></tr>";
		
		for (var i = 0; i < fields.length; i++) {
			var value = LsStringUtil.htmlEncode(contact.getAttr(fields[i]));
			if (value) {
				html[idx++] = "<tr><td valign=top>" + LsStringUtil.htmlEncode(LmMsg.AB_FIELD[fields[i]]) + ":</td>";
				html[idx++] = "<td valign=top style='overflow: hidden'>" + LsStringUtil.htmlEncode(value) + "</td>";
				html[idx++] = "</tr>";
			}
		}
		html[idx++] = "</table>";
	} else {
		var cc = appCtxt.getApp(LmLiquidMail.CONTACTS_APP).getContactController();
		var printView = new LmContactView(cc.getCurrentView(), true);
		printView.setLocation(Dwt.LOC_NOWHERE, Dwt.LOC_NOWHERE);
		printView.zShow(false);
		printView.set(contact);
		
		html[idx++] = "<div class='LmContactView'>";
		html[idx++] = printView.getHtmlElement().innerHTML;
		html[idx++] = "</div>";
	}
	
	return html.join("");
}
