/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2004, 2005, 2006, 2007, 2008, 2009, 2010 Zimbra, Inc.
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
 * Creates a new controller to show mail send confirmation.
 * @class
 * 
 * @param {DwtControl}	parent		the element that created this view
 * @param {ZmController}	controller	the controller managing this view
 * 
 * @extends		DwtComposite
 * 
 * @private
 */
ZmMailConfirmView = function(parent, controller) {

	this._view = ZmId.VIEW_MAIL_CONFIRM + controller.sessionId;
	DwtComposite.call(this, {parent:parent, className:"ZmMailConfirmView", posStyle:Dwt.ABSOLUTE_STYLE,
							 id:ZmId.getViewId(this._view)});

	this.setVisible(false);
	this._controller = controller;
	this._tabGroup = new DwtTabGroup(this._htmlElId);
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
 * 
 * @param	{AjxListener}	listener		the listener
 */
ZmMailConfirmView.prototype.addNewContactsListener =
function(listener) {
	this.addListener(DwtEvent.ACTION, listener);
};

/**
 * Shows confirmation that the message was sent.
 *
 * @param {ZmMailMsg}	msg			the message that was sent
 */
ZmMailConfirmView.prototype.showConfirmation =
function(msg) {
	this._tabGroup.removeAllMembers();
	
	this._showLoading(true);
	var addresses = msg.getAddresses(AjxEmailAddress.TO).getArray().concat(msg.getAddresses(AjxEmailAddress.CC).getArray());

	if (!appCtxt.get(ZmSetting.CONTACTS_ENABLED) || appCtxt.get(ZmSetting.AUTO_ADD_ADDRESS)) {
		this._setView(msg, [], [], addresses);
	} else {
		var callback = new AjxCallback(this, this._handleResponseGetContacts, [msg]);
		appCtxt.getApp(ZmId.APP_CONTACTS).getContactsByEmails(addresses, callback);
	}

	appCtxt.notifyZimlets("onMailConfirm", [this, msg, Dwt.byId(this._htmlElId + "_ad")]);
};

ZmMailConfirmView.prototype.getController =
function() {
	return this._controller;
};

ZmMailConfirmView.prototype.getTitle =
function() {
	return [ZmMsg.zimbraTitle, ZmMsg.messageSent].join(": ");
};

ZmMailConfirmView.prototype.getTabGroupMember = function() {
	return this._tabGroup;
};

ZmMailConfirmView.prototype.getDefaultFocusItem =
function() {
	return this._addContactsButton;
};

ZmMailConfirmView.prototype._handleResponseGetContacts =
function(msg, contacts) {
	var newAddresses = [],
		existingContacts = [];
	for (var i = 0, count = contacts.length; i < count; i++) {
		if (contacts[i].contact) {
			existingContacts.push(contacts[i]);
		} else {
			newAddresses.push(contacts[i].address);
		}
	}
	this._setView(msg, newAddresses, existingContacts, []);
};

ZmMailConfirmView.prototype._setView =
function(msg, newAddresses, existingContacts, displayAddresses) {
	this._showLoading(false);
	Dwt.byId(this._htmlElId + "_summary").innerHTML = AjxStringUtil.htmlEncode(this._summaryFormat.format(msg.subject));
	this._showNewAddresses(newAddresses);
	this._showExistingContacts(existingContacts);
	this._showDisplayAddresses(displayAddresses);
};

ZmMailConfirmView.prototype._showLoading =
function(loading) {
	Dwt.setVisible(Dwt.byId(this._htmlElId + "_loading"), loading);
	Dwt.setVisible(Dwt.byId(this._htmlElId + "_notLoading"), !loading);
	this.setVisible(true);	
};

ZmMailConfirmView.prototype._showNewAddresses =
function(newAddresses) {
	var visible = newAddresses.length;
	Dwt.setVisible(Dwt.byId(this._htmlElId + "_newAddresses"), visible);
	this._addContactsButton.setVisible(visible);
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
		this._tabGroup.addMember(form.getTabGroupMember());
	}
	if (visible) {
		this._tabGroup.addMember(this._addContactsButton);
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

ZmMailConfirmView.prototype._showDisplayAddresses =
function(displayAddresses) {
	Dwt.setVisible(Dwt.byId(this._htmlElId + "_displayAddresses"), displayAddresses.length);
	var displayAddressBox = Dwt.byId(this._htmlElId + "_displayAddressBox");
	displayAddressBox.innerHTML = "";
	for (var i = 0, count = displayAddresses.length; i < count; i++) {
		var div = document.createElement("DIV");
		displayAddressBox.appendChild(div);
		var address = displayAddresses[i].toString();
		div.innerHTML = AjxTemplate.expand("mail.Message#ZmMailConfirmViewExistingContact", { text: AjxStringUtil.htmlEncode(address) });
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

ZmMailConfirmView.prototype.deactivate =
function() {
	this._controller.inactive = true;
};