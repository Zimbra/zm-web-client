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

function ZmLoginDialog(parent, appCtxt, className) { 
	this._appCtxt = appCtxt;
    className = className || "ZmLoginDialog";
	DwtDialog.call(this, parent, className, ZmMsg.login, DwtDialog.NO_BUTTONS);

	var self = this;
	var params = {
		showForm: true,
		showUserField: true,
		showPasswordField: true,
		showLicenseMsg: true,
		showRememberMeCheckbox: false,
		showLogOff: true,
		logOffAction: "ZmLoginDialog._loginDiffListener()",
		loginAction: "ZmLoginDialog._loginListener(this)",
		showButton: true
	};
	var html = ZLoginFactory.getLoginDialogHTML(params);
	this.setContent(html);
}

ZmLoginDialog.prototype = new ZmDialog;
ZmLoginDialog.prototype.constructor = ZmLoginDialog;

ZmLoginDialog.prototype.toString = 
function() {
	return "ZmLoginDialog";
}

ZmLoginDialog.prototype.registerCallback =
function(func, obj) {
	this._callback = new AjxCallback(obj, func);
}

ZmLoginDialog.prototype.clearAll =
function() {
	ZLoginFactory.get(ZLoginFactory.USER_ID).value = "";
	ZLoginFactory.get(ZLoginFactory.PASSWORD_ID).value = "";
}

ZmLoginDialog.prototype.clearPassword =
function() {
	ZLoginFactory.get(ZLoginFactory.PASSWORD_ID).value = "";
}

ZmLoginDialog.prototype.setError =
function(errorStr) {
	ZLoginFactory.showErrorMsg(errorStr);
}

ZmLoginDialog.prototype.setFocus =
function(username, bReloginMode) {
	ZLoginFactory.showUserField(username);
	setReloginMode(username && username.length && bReloginMode);
 }

ZmLoginDialog.prototype.setVisible = 
function(visible, transparentBg) {
	if (!!visible == this.isPoppedUp()) {
		return;
	}
	
	if (visible) {
		this.popup();
	} else {
		this.popdown();
	}
	for (var i = 0; i < ZLoginFactory.TAB_ORDER.length; i++) {
		var element = document.getElementById(ZLoginFactory.TAB_ORDER[i]);
		if (visible) {
			Dwt.associateElementWithObject(element, this);
		} else {
			Dwt.disassociateElementFromObject(null, this);
		}
	}

	Dwt.setHandler(this._getContentDiv(), DwtEvent.ONKEYDOWN, ZLoginFactory.handleKeyPress);
}

ZmLoginDialog.prototype.addChild =
function(child, childHtmlElement) {
    this._children.add(child);
}

ZmLoginDialog.prototype.setReloginMode = 
function(bReloginMode, app, obj) {
	if (bReloginMode) {
		ZLoginFactory.showLogOff();
	} else {
		ZLoginFactory.hideLogOff();
	}
	ZLoginFactory.get(ZLoginFactory.USER_ID).disabled = true;
}

ZmLoginDialog.prototype._loginSelListener =
function() {
	this.setCursor("wait");
	var username = ZLoginFactory.get(ZLoginFactory.USER_ID).value;
	if (!(username && username.length)) {
		this.setError(ZmMsg.enterUsername);
		return;
	}
	if (this._callback) {
		var password = ZLoginFactory.get(ZLoginFactory.PASSWORD_ID).value;
		var rememberMe = this._appCtxt.rememberMe();
		this._callback.run(username, password, rememberMe);		
	}
}

ZmLoginDialog._loginListener =
function(target) {
	var loginDialogInstance = Dwt.getObjectFromElement(target);
	loginDialogInstance._loginSelListener();
};

ZmLoginDialog._loginDiffListener =
function(ev) {
	ZmZimbraMail.logOff();
};
