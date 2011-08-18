/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2005, 2006, 2007, 2008, 2009, 2010 Zimbra, Inc.
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
	//get address books
	var addrBooks = this._getAddressBooks();
	var options = [];
	for (var i=0; i<addrBooks.length; i++) {
		options.push({id: "ADDRBOOK_" + addrBooks[i].nId, value: addrBooks[i].nId, label: addrBooks[i].name});	
	}
	var params = {};
	params.parent = this;
	params.template = "abook.Contacts#QuickAddPrompt";
	params.id = "ZmContactQuickAddDialog";
	params.form = {
		items: [
			{ id: "FIRST_NAME", type: "DwtInputField", label: "First Name", value: "", cols: 35},
			{ id: "LAST_NAME", type: "DwtInputField", label: "Last Name", value: "", cols: 35},
			{ id: "EMAIL", type: "DwtInputField", label: "Email", value: "", cols: 35},
			{ id: "ADDR_BOOK", type: "DwtSelect", items: options}
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
	return addrBooks;
};

ZmContactQuickAddDialog.prototype._updateAddressBooks = 
function() {
	var select = this._quickAddForm.getControl("ADDR_BOOK");
	select.clearOptions();
	
	var addrBooks = this._getAddressBooks();
	for (var i=0; i<addrBooks.length; i++) {
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
