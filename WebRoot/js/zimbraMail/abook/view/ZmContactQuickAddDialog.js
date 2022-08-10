/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2011, 2012, 2013, 2014, 2016 Synacor, Inc.
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
 * All portions of the code are Copyright (C) 2011, 2012, 2013, 2014, 2016 Synacor, Inc. All Rights Reserved.
 * ***** END LICENSE BLOCK *****
 */

ZmContactQuickAddDialog = function() {
	ZmDialog.call(this, {parent:appCtxt.getShell(), className:"ZmContactQuickAddDialog", title:ZmMsg.quickAddContact,
						  standardButtons:[DwtDialog.OK_BUTTON, DwtDialog.CANCEL_BUTTON]});

	// set content
	this.setContent(this._contentHtml());
	this._initialize();
	
	this.setButtonListener(DwtDialog.OK_BUTTON, new AjxListener(this, this._saveListener));
};

ZmContactQuickAddDialog.prototype = new ZmDialog;
ZmContactQuickAddDialog.prototype.constructor = ZmContactQuickAddDialog;

ZmContactQuickAddDialog.prototype._contentHtml = 
function() {   
	var html = "<div style='width: 350px' id='CONTACT_QUICKADD_FORM'></div>";	
	return html;			
};

ZmContactQuickAddDialog.prototype._initialize = 
function() {
	var params = {};
	params.parent = this;
	params.template = "abook.Contacts#QuickAddPrompt";
	params.id = "ZmContactQuickAddDialog";
	params.form = {
		items: [
			{ id: "FIRST_NAME", type: "DwtInputField", label: "First Name", value: "", cols: 35},
			{ id: "LAST_NAME", type: "DwtInputField", label: "Last Name", value: "", cols: 35},
			{ id: "EMAIL", type: "DwtInputField", label: "Email", value: "", cols: 35},
			{ id: "ADDR_BOOK", type: "DwtSelect", items: []}
		]
	};
	this._quickAddForm = new DwtForm(params);
	var quickAddForm = document.getElementById("CONTACT_QUICKADD_FORM");
	this._quickAddForm.appendElement(quickAddForm);
	
};

/**
 * Popup quick add dialog
 */
ZmContactQuickAddDialog.prototype.popup = 
function(saveCallback) {
	this._saveCallback = saveCallback;
	this._updateAddressBooks();
	ZmDialog.prototype.popup.call(this);
	this._quickAddForm.getControl("FIRST_NAME").focus();
};


ZmContactQuickAddDialog.prototype.setFields = 
function(email) {
	if (this._quickAddForm) {
		var emailField = this._quickAddForm.getControl("EMAIL");
		emailField.setValue(email);
		
		var fnameField = this._quickAddForm.getControl("FIRST_NAME");
		fnameField.setValue("");
		
		var lnameField = this._quickAddForm.getControl("LAST_NAME");
		lnameField.setValue("");
	}
};

ZmContactQuickAddDialog.prototype._saveListener =
function() {
	var firstName = this._quickAddForm.getControl("FIRST_NAME");
	var lastName = this._quickAddForm.getControl("LAST_NAME");
	var email = this._quickAddForm.getControl("EMAIL");
	var addrBook = this._quickAddForm.getControl("ADDR_BOOK");
	
	var contact = new ZmContact(null, null, ZmItem.CONTACT);
	var attr = {};
	attr[ZmContact.F_firstName] = firstName.getValue();
	attr[ZmContact.F_lastName] = lastName.getValue();
	attr[ZmContact.F_email] = email.getValue();
	attr[ZmContact.F_folderId] = addrBook.getValue();
	var batchCommand = new ZmBatchCommand(false, null, true);
	batchCommand.add(new AjxCallback(contact, contact.create, [attr]));
	if (this._saveCallback) {
		batchCommand.run(this._saveCallback, [contact]);
	}
	this.popdown();
};

ZmContactQuickAddDialog.prototype._getAddressBooks = 
function() {
	var folderTree = appCtxt.getFolderTree();
	var addrBooks = folderTree.getByType(ZmOrganizer.ADDRBOOK);
	for (var i=0; i<addrBooks.length; i++) {
		if (addrBooks[i].isReadOnly()) {
			addrBooks.splice(i,1); //if addrBook is read only do not add it to list
		}
	}
	return addrBooks;
};

ZmContactQuickAddDialog.prototype._updateAddressBooks = 
function() {
	var select = this._quickAddForm.getControl("ADDR_BOOK");
	select.clearOptions();
	
	var addrBooks = this._getAddressBooks();
	for (var i=0; i<addrBooks.length; i++) {
		if (addrBooks[i].id == ZmFolder.ID_DLS) {
			continue;
		}
		var selectOption = new DwtSelectOption(addrBooks[i].nId, false, addrBooks[i].name);
		select.addOption(selectOption);	
	}
};

ZmContactQuickAddDialog.prototype._getTabGroupMembers =
function() {
	var firstName = this._quickAddForm.getControl("FIRST_NAME");
	var lastName = this._quickAddForm.getControl("LAST_NAME");
	var email = this._quickAddForm.getControl("EMAIL");
	var addrBook = this._quickAddForm.getControl("ADDR_BOOK");
	return [firstName, lastName, email, addrBook];
};
