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

function ZmExternalGatewayDlg(parent, appCtxt) {
	DwtDialog.call(this, parent, null, ZmMsg.imGatewayLogin,
		       [ DwtDialog.OK_BUTTON,
			 DwtDialog.CANCEL_BUTTON ]
		      );
	var id = this._baseId = Dwt.getNextId();
	this.setContent(AjxTemplate.expand("zimbraMail.im.templates.Chat#GatewayLoginDlg", { id: id }));
	this.__initWidgets();
};

ZmExternalGatewayDlg.prototype = new DwtDialog;
ZmExternalGatewayDlg.prototype.constructor = ZmExternalGatewayDlg;

ZmExternalGatewayDlg.prototype.__initWidgets = function() {
	var gws = AjxDispatcher.run("GetRoster").getGateways();
	var options = [];
	// FIXME: skipping XMPP for now
	for (var i = 1; i < gws.length; ++i) {
		options.push(new DwtSelectOption(gws[i].type, i == 0, gws[i].type));
	}
	var select = new DwtSelect(this, options);
	select.reparentHtmlElement(this._baseId + "_gatewayLayout");
	this.setButtonListener(DwtDialog.OK_BUTTON, new AjxListener(this, this._okButtonListener));
	this._gwSelect = select;

	var input = new DwtInputField({ parent	       : this,
					type	       : DwtInputField.STRING,
					size	       : 20,
					errorIconStyle : DwtInputField.ERROR_ICON_RIGHT,
					required       : true
				      });
	input.reparentHtmlElement(this._baseId + "_screenNameLayout");
	this._screenNameInput = input;

	var input = new DwtInputField({ parent	       : this,
					type	       : DwtInputField.PASSWORD,
					size	       : 20,
					errorIconStyle : DwtInputField.ERROR_ICON_RIGHT,
					required       : true
				      });
	input.reparentHtmlElement(this._baseId + "_passwordLayout");
	this._passwordInput = input;
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
};
