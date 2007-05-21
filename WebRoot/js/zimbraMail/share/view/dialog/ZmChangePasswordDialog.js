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

ZmChangePasswordDialog = function(parent, className) {

	DwtDialog.call(this, parent, className, ZmMsg.changePassword);

	this._setContent();
	this.setButtonListener(DwtDialog.OK_BUTTON, new AjxListener(this, this._okButtonListener));
	this._appCtxt = this.shell.getData(ZmAppCtxt.LABEL);
};

ZmChangePasswordDialog.prototype = new DwtDialog;
ZmChangePasswordDialog.prototype.constructor = ZmChangePasswordDialog;

ZmChangePasswordDialog.prototype.toString = 
function() {
	return "ZmChangePasswordDialog";
};

ZmChangePasswordDialog.prototype.popup = 
function() {
	DwtDialog.prototype.popup.call(this);
	this._oldPasswordField.focus();
};

ZmChangePasswordDialog.prototype.showMessageDialog =
function(message, loc, style) {
	if (!loc) {
		var myLoc = this.getLocation();
		loc = new DwtPoint(myLoc.x - 50, myLoc.y + 75);
	}
	var msgDialog = this._appCtxt.getMsgDialog();
	msgDialog.setMessage(message, (style || DwtMessageDialog.CRITICAL_STYLE));
	msgDialog.popup(loc);
};

ZmChangePasswordDialog.prototype._setContent =
function() {
	var oldId = Dwt.getNextId();
	var newId = Dwt.getNextId();
	var confirmId = Dwt.getNextId();

	var html = new Array();
	var idx = 0;

	html[idx++] = "<table border=0 cellpadding=1 cellspacing=1 width=250>";
	idx = this._getPasswordRowHtml(html, idx, oldId, ZmMsg.oldPassword);
	html[idx++] = "<tr height=10><td></td></tr>";
	idx = this._getPasswordRowHtml(html, idx, newId, ZmMsg.newPassword);
	idx = this._getPasswordRowHtml(html, idx, confirmId, ZmMsg.confirm);
	html[idx++] = "</table>";

	this.setContent(html.join(""));

	this._oldPasswordField = document.getElementById(oldId);
	this._newPasswordField = document.getElementById(newId);
	this._confirmPasswordField = document.getElementById(confirmId);
};

ZmChangePasswordDialog.prototype._getPasswordRowHtml =
function(html, idx, id, msg) {
	html[idx++] = "<tr><td class='ZmChangePasswordDialogCell'>";
	html[idx++] = msg;
	html[idx++] = ":</td><td>";
	html[idx++] = Dwt.CARET_HACK_BEGIN;
	html[idx++] = "<input type='password' id=";
	html[idx++] = id;
	html[idx++] = ">";
	html[idx++] = Dwt.CARET_HACK_END;
	html[idx++] = "</td></tr>";

	return idx;
};

ZmChangePasswordDialog.prototype._okButtonListener =
function(ev) {
	var args = this._getPasswordData();
	if (args) {
		DwtDialog.prototype._buttonListener.call(this, ev, args);	
	}
};

ZmChangePasswordDialog.prototype._getPasswordData =
function() {
	// Reset the msg dialog (it is a shared resource)
	var msgDialog = this._appCtxt.getMsgDialog();
	msgDialog.reset();

	// check to see that all input fields have been filled out
	var oldPassword = this._oldPasswordField.value;
	var newPassword = this._newPasswordField.value;
	var confirmPassword = this._confirmPasswordField.value;

	if (!oldPassword || !newPassword || !confirmPassword) {
		this.showMessageDialog(ZmMsg.passwordFieldMissing);
		return null;
	}
	
	// passwords can't start or end with white space
	var trimmed = AjxStringUtil.trim(newPassword);
	if (newPassword.length != trimmed.length) {
		this.showMessageDialog(ZmMsg.newPasswordHasWhitespace);
		return null;
	}

	// check to see that the first and second new passwords match
	if (newPassword != confirmPassword) {
		this.showMessageDialog(ZmMsg.bothNewPasswordsMustMatch);
		return null;
	}

	// check that the length is okay
	var minPwdLength = this._appCtxt.get(ZmSetting.PWD_MIN_LENGTH);
	var maxPwdLength = this._appCtxt.get(ZmSetting.PWD_MAX_LENGTH);

	if (newPassword.length < minPwdLength || newPassword.length > maxPwdLength) {
		this.showMessageDialog(AjxMessageFormat.format(ZmMsg.newPasswordBadLength, [minPwdLength, maxPwdLength]));
		return null;
	}

	return [oldPassword, newPassword];
};

ZmChangePasswordDialog.prototype._getInputFields = 
function() {
	return [this._oldPasswordField, this._newPasswordField, this._confirmPasswordField];
};

ZmChangePasswordDialog.prototype.focus = 
function() {
	this._oldPasswordField.focus();
};
