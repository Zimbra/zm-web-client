/*
 * ***** BEGIN LICENSE BLOCK *****
 *
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2008 Zimbra, Inc.
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

ZmImGatewayControl = function(params) {
	params.className = params.className || "ZmImGatewayControl";
	DwtComposite.apply(this, arguments);
	this._setGateway(params.gateway)
	this._createHtml();
};

ZmImGatewayControl.prototype = new DwtComposite;
ZmImGatewayControl.prototype.constructor = ZmImGatewayControl;

ZmImGatewayControl.prototype.toString = function() {
	return "ZmImGatewayControl";
};


ZmImGatewayControl.prototype.TEMPLATE = 'im.Chat#ZmImGatewayControl'

/** Changes the gateway that this controls displays. */
ZmImGatewayControl.prototype.setGateway =
function(gateway) {
	this._setGateway(gateway)
	this.reset();
};

/** Resets the control to show the current values of its gateway. */
ZmImGatewayControl.prototype.reset =
function() {
	if (this._gateway.isOnline()) {
		this._initialName = this._gateway.nick;
		this._initialPassword = "*****";
	} else {
		this._initialName = this._initialPassword = "";
	}
	this._nameInput.setValue(this._initialName);
	this._passwordInput.setValue(this._initialPassword);
};

ZmImGatewayControl.prototype.isDirty =
function() {
	return (this._nameInput.getValue() != this._initialName) ||
		   (this._passwordInput.getValue() != this._initialPassword);
};

ZmImGatewayControl.prototype.getName =
function() {
	return this._nameInput.getValue();
};

ZmImGatewayControl.prototype.getPassword =
function() {
   return this._passwordInput.getValue();
};

ZmImGatewayControl.prototype._gatewayListener =
function() {
	this.reset();
};

ZmImGatewayControl.prototype._setGateway =
function(gateway) {
	this._gateway = gateway;
	gateway.addListener(ZmImGateway.EVENT_SET_STATE, new AjxListener(this, this._gatewayListener));
}

ZmImGatewayControl.prototype._clearButtonListener =
function() {
	this._nameInput.setValue("");
	this._passwordInput.setValue("");
};

ZmImGatewayControl.prototype._createHtml =
function(templateId) {
    var data = {
		id: this._htmlElId,
		name: AjxStringUtil.capitalize(this._gateway.type),
		nameLower: this._gateway.type 
	};
    this._createHtmlFromTemplate(templateId || this.TEMPLATE, data);

	this._nameInput = new DwtInputField({
		parent: this,
		parentElement: this._htmlElId + "_nameField",
		size: 30
	});
	this._passwordInput = new DwtInputField({
		parent: this,
		parentElement: this._htmlElId + "_passwordField",
		size: 30,
		type: DwtInputField.PASSWORD
	});

	this._clearButton = new DwtButton({ parent: this, parentElement: this._htmlElId + "_clearButton" });
	this._clearButton.setText(ZmMsg.clear);
	this._clearButton.addSelectionListener(new AjxListener(this, this._clearButtonListener));

	this.tabGroup = new DwtTabGroup(this._gateway.type);
	this.tabGroup.addMember(this._nameInput);
	this.tabGroup.addMember(this._passwordInput);
	this.tabGroup.addMember(this._clearButton);
};



