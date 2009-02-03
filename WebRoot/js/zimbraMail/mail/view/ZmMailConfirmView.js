/*
 * ***** BEGIN LICENSE BLOCK *****
 *
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2004, 2005, 2006, 2007 Zimbra, Inc.
 *
 * The contents of this file are subject to the Yahoo! Public License
 * Version 1.0 ("License"); you may not use this file except in
 * compliance with the License.  You may obtain a copy of the License at
 * http://www.zimbra.com/license.
 *
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied.
 *
 * ***** END LICENSE BLOCK *****
 */

/**
 * Creates a new controller to show mail send confirmation.
 * @class ZmMailConfirmView
 * @constructor
 * @param parent		[DwtControl]		the element that created this view
 * @param controller	[ZmController]		controller managing this view
 */
ZmMailConfirmView = function(parent, controller) {

	this._view = ZmId.VIEW_MAIL_CONFIRM;
	DwtComposite.call(this, {parent:parent, className:"ZmMailConfirmView", posStyle:Dwt.ABSOLUTE_STYLE,
							 id:ZmId.getViewId(this._view)});

	this._controller = controller;
	this._createHtmlFromTemplate("mail.Message#ZmMailConfirmView", { id: this._htmlElId } );
	var buttonArgs = {
		parent: this,
		parentElement: this._htmlElId + "_addButton"
	};
	this._addContactsButton = new DwtButton(buttonArgs);
	this._addContactsButton.setText(ZmMsg.ok);
	this._addContactsButton.addSelectionListener(new AjxListener(this, this._addContactsListener));

	this._summaryFormat = new AjxMessageFormat(ZmMsg.confirmSummary);
};

ZmMailConfirmView.prototype = new DwtComposite;
ZmMailConfirmView.prototype.constructor = ZmMailConfirmView;

ZmMailConfirmView.prototype.toString = function() {
	return "ZmMailConfirmView";
};

/**
 * Adds a listener for the Create Contacts button.
 */
ZmMailConfirmView.prototype.addNewContactsListener =
function(listener) {
	this.addListener(DwtEvent.ACTION, listener);
};

/**
 * Shows confimation that the message was sent.
 *
 * @param msg			[ZmMailMsg]*	the message that was sent
 */
ZmMailConfirmView.prototype.showConfirmation =
function(msg) {
	var newAddresses = [],
		existingContacts = [];
	if (appCtxt.get(ZmSetting.CONTACTS_ENABLED)) {
		this._processAddresses(msg.getAddresses(AjxEmailAddress.TO), newAddresses, existingContacts);
		this._processAddresses(msg.getAddresses(AjxEmailAddress.CC), newAddresses, existingContacts);
	}
	Dwt.byId(this._htmlElId + "_summary").innerHTML = AjxStringUtil.htmlEncode(this._summaryFormat.format(msg.subject));
	this._showNewAddresses(newAddresses);
	this._showExistingContacts(existingContacts);
};

ZmMailConfirmView.prototype._showNewAddresses =
function(newAddresses) {
	Dwt.setVisible(Dwt.byId(this._htmlElId + "_newAddresses"), newAddresses.length);
	this._addContactsButton.setVisible(newAddresses.length);
	if (this._newAddressForms) {
		for (var i = 0, count = this._newAddressForms.length; i < count; i++) {
			this._newAddressForms[i].dispose();
		}
		this._newAddressForms = [];
	}
	this._newAddressForms = [];
	var newAddressBox = Dwt.byId(this._htmlElId + "_newAddressBox");
	for (var i = 0, count = newAddresses.length; i < count; i++) {
		var div = document.createElement("DIV");
		newAddressBox.appendChild(div);
		var address = newAddresses[i],
			first = "",
			last = "";
		var name = address.getName();
		if (name) {
			var index = name.lastIndexOf(" ");
			if (index != -1) {
				first = name.substring(0, index);
				last = name.substring(index + 1);
			} else {
				first = name;
			}
		}
		var args = { parent: this, parentElement: div };
		args.form = {
			items: [
				// default items
				{ id: "CHECKBOX", type: "DwtCheckbox", label: address.getAddress() },
				{ id: "FIRST", type: "DwtInputField", value: first, hint: ZmMsg.AB_FIELD_firstName },
				{ id: "LAST", type: "DwtInputField", value: last, hint: ZmMsg.AB_FIELD_lastName }
			],
			template: "mail.Message#ZmMailConfirmViewNewAddress"
		};
		var form = new DwtForm(args);
		this._newAddressForms.push(form);
	}
};

ZmMailConfirmView.prototype._showExistingContacts =
function(existingContacts) {
	Dwt.setVisible(Dwt.byId(this._htmlElId + "_existingContacts"), existingContacts.length);
	var existingContactBox = Dwt.byId(this._htmlElId + "_existingContactBox");
	existingContactBox.innerHTML = "";
	for (var i = 0, count = existingContacts.length; i < count; i++) {
		var div = document.createElement("DIV");
		existingContactBox.appendChild(div);
		var data = existingContacts[i];
		var display;
		var fullName = data.contact.getFullName();
		if (fullName) {
			display = [fullName, " <", data.address.getAddress(), ">"].join("");
		} else {
			display = data.address.getAddress();
		}
		div.innerHTML = AjxTemplate.expand("mail.Message#ZmMailConfirmViewExistingContact", { text: AjxStringUtil.htmlEncode(display) });
	}
};

ZmMailConfirmView.prototype._processAddresses =
function(addresses, newAddresses, existingContacts) {
	var contactsApp = appCtxt.getApp(ZmId.APP_CONTACTS);
	for (var i = 0, count = addresses.size(); i < count; i++) {
		var address = addresses.get(i);
		var contact = contactsApp.getContactByEmail(address.getAddress());
		if (contact) {
			existingContacts.push({ contact: contact, address: address });
		} else {
			newAddresses.push(address);
		}
	}
};

ZmMailConfirmView.prototype._addContactsListener =
function() {
	var newAddresses = [];
	for (var i = 0, count = this._newAddressForms.length; i < count; i++) {
		var form = this._newAddressForms[i];
		if (form.getValue("CHECKBOX")) {
			var data = {};
			data[ZmContact.F_email] = form.getControl("CHECKBOX").getText();
			data[ZmContact.F_firstName] = form.getValue("FIRST");
			data[ZmContact.F_lastName] = form.getValue("LAST");
			newAddresses.push(data);
		}
	}
	this.notifyListeners(DwtEvent.ACTION, newAddresses);
};
