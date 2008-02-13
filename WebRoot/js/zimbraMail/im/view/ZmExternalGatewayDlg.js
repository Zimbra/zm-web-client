/*
 * ***** BEGIN LICENSE BLOCK *****
 * 
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2007 Zimbra, Inc.
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

ZmExternalGatewayDlg = function(parent) {
	var logoutBtn = new DwtDialog_ButtonDescriptor(ZmExternalGatewayDlg.LOGOUT_BUTTON,
						       ZmMsg.logOff,
						       DwtDialog.ALIGN_LEFT);
	DwtDialog.call(this, {parent:parent, title:ZmMsg.imGatewayLogin,
		       standardButtons:[ DwtDialog.OK_BUTTON,
			 DwtDialog.CANCEL_BUTTON ],
		       extraButtons:[ logoutBtn ]
			});
	var id = this._baseId = Dwt.getNextId();
	this.setContent(AjxTemplate.expand("im.Chat#GatewayLoginDlg", { id: id }));
	this.__initWidgets();
};

ZmExternalGatewayDlg.LOGOUT_BUTTON = ++DwtDialog.LAST_BUTTON;

ZmExternalGatewayDlg.prototype = new DwtDialog;
ZmExternalGatewayDlg.prototype.constructor = ZmExternalGatewayDlg;

ZmExternalGatewayDlg.prototype.__initWidgets = function() {
	var gws = AjxDispatcher.run("GetRoster").getGateways();
	var options = [];
	// FIXME: skipping XMPP for now
	for (var i = 1; i < gws.length; ++i) {
		options.push(new DwtSelectOption(gws[i].type, i == 0, gws[i].type));
	}
	var select = new DwtSelect({parent:this, options:options});
	select.reparentHtmlElement(this._baseId + "_gatewayLayout");
	this.setButtonListener(DwtDialog.OK_BUTTON, new AjxListener(this, this._okButtonListener));
	this.setButtonListener(ZmExternalGatewayDlg.LOGOUT_BUTTON, new AjxListener(this, this._logoutButtonListener));
	this._gwSelect = select;
	select.addChangeListener(new AjxListener(this, this._updateForRegisteredGw));

	this._tabGroup.addMember(select);

	var input = new DwtInputField({ parent	       : this,
					type	       : DwtInputField.STRING,
					size	       : 20,
					errorIconStyle : DwtInputField.ERROR_ICON_RIGHT,
					required       : true
				      });
	input.reparentHtmlElement(this._baseId + "_screenNameLayout");
	this._screenNameInput = input;

	this._tabGroup.addMember(input);

	var input = new DwtInputField({ parent	       : this,
					type	       : DwtInputField.PASSWORD,
					size	       : 20,
					errorIconStyle : DwtInputField.ERROR_ICON_RIGHT,
					required       : true
				      });
	input.reparentHtmlElement(this._baseId + "_passwordLayout");
	this._passwordInput = input;

	this._tabGroup.addMember(input);
};

ZmExternalGatewayDlg.prototype.selectGwType = function(type) {
	this._gwSelect.setSelectedValue(type);
};

ZmExternalGatewayDlg.prototype._logoutButtonListener = function() {
	AjxDispatcher.run("GetRoster").unregisterGateway(this._gwSelect.getValue());
	this.popdown();
};

ZmExternalGatewayDlg.prototype._okButtonListener = function(ev) {
	var results = this._getDialogData();
	if (results)
		this._buttonListener(ev, results); // see DwtDialog
};

ZmExternalGatewayDlg.prototype._getDialogData = function() {
	var ok =
		this._screenNameInput.validate() &&
		this._passwordInput.validate();
	return ok && [ this._gwSelect.getValue(),
		       this._screenNameInput.getValue(),
		       this._passwordInput.getValue() ];
};

ZmExternalGatewayDlg.prototype.reset = function() {
	DwtDialog.prototype.reset.call(this);
	this._screenNameInput.setValue("");
	this._passwordInput.setValue("");
	this._updateForRegisteredGw();
};

ZmExternalGatewayDlg.prototype._updateForRegisteredGw = function() {
	var service = this._gwSelect.getValue();
	if (service) {
		var gw = AjxDispatcher.run("GetRoster").getGatewayByType(service);
		if (gw) {
			var nick = gw.isOnline();
			if (nick) {
				this._screenNameInput.setValue(nick);
				this._screenNameInput.setEnabled(false);
				this._passwordInput.setEnabled(false);
				this.getButton(ZmExternalGatewayDlg.LOGOUT_BUTTON).setEnabled(true);
				this.getButton(DwtDialog.OK_BUTTON).setEnabled(false);
				return;
			}
		}
	}
	this._screenNameInput.setEnabled(true);
	this._passwordInput.setEnabled(true);
	this.getButton(ZmExternalGatewayDlg.LOGOUT_BUTTON).setEnabled(false);
	this.getButton(DwtDialog.OK_BUTTON).setEnabled(true);
};

ZmExternalGatewayDlg.prototype.popup = function() {
	DwtDialog.prototype.popup.call(this);
	this._gwSelect.focus();
};
