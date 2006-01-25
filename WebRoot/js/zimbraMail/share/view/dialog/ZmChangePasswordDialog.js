/*
 * ***** BEGIN LICENSE BLOCK *****
 * Version: ZPL 1.1
 * 
 * The contents of this file are subject to the Zimbra Public License
 * Version 1.1 ("License"); you may not use this file except in
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
 * Portions created by Zimbra are Copyright (C) 2005 Zimbra, Inc.
 * All Rights Reserved.
 * 
 * Contributor(s):
 * 
 * ***** END LICENSE BLOCK *****
 */

function ZmChangePasswordDialog(parent, msgDialog, className) {

	DwtDialog.call(this, parent, className, ZmMsg.changePassword);

	this._msgDialog = msgDialog;

	this._oldPasswordId = Dwt.getNextId();
	this._newPasswordId = Dwt.getNextId();
	this._confirmPasswordId = Dwt.getNextId();	

	this.setContent(this._contentHtml());

	this._oldPasswordField = document.getElementById(this._oldPasswordId);
	this._newPasswordField = document.getElementById(this._newPasswordId);
	this._confirmPasswordField = document.getElementById(this._confirmPasswordId);

	this.setButtonListener(DwtDialog.OK_BUTTON, new AjxListener(this, this._okButtonListener));
	this.setTabOrder([this._oldPasswordId, this._newPasswordId, this._confirmPasswordId]);
	
	this._appCtxt = this.shell.getData(ZmAppCtxt.LABEL);
	this._minPwdLength = this._appCtxt.get(ZmSetting.PWD_MIN_LENGTH);
	this._maxPwdLength = this._appCtxt.get(ZmSetting.PWD_MAX_LENGTH);
};

ZmChangePasswordDialog.prototype = new DwtDialog;
ZmChangePasswordDialog.prototype.constructor = ZmChangePasswordDialog;

ZmChangePasswordDialog.prototype.toString = 
function() {
	return "ZmChangePasswordDialog";
};

ZmChangePasswordDialog.prototype.popup = 
function(loc) {
	DwtDialog.prototype.popup.call(this, loc);
	this._oldPasswordField.focus();
};

ZmChangePasswordDialog.prototype._contentHtml = 
function() {
	var html = new Array();
	var idx = 0;
    html[idx++] = "<div style='width: 250px'>";
    html[idx++] = "<div>" + ZmMsg.oldPassword + ":</div>";
    html[idx++] = "<div><input class='ZmChangePasswordDialogInput' id=";
	html[idx++] = this._oldPasswordId + " type='password'/></div><br>";
    html[idx++] = "<div>" + ZmMsg.newPassword + ":</div>";
    html[idx++] = "<div><input class='ZmChangePasswordDialogInput' id=";
	html[idx++] = this._newPasswordId + " type='password'/></div><br>";
    html[idx++] = "<div>" + ZmMsg.confirmPassword + ":</div>";
    html[idx++] = "<div><input class='ZmChangePasswordDialogInput' id="; 
	html[idx++] = this._confirmPasswordId + " type='password'/></div>";
    html[idx++] = "</div>";
	
	return html.join("");
};

ZmChangePasswordDialog.prototype.showMessageDialog = 
function(message, loc, style) {
	if (!loc) {
		var myLoc = this.getLocation();
		loc = new DwtPoint(myLoc.x - 50, myLoc.y + 75);
	}
	this._msgDialog.setMessage(message, (style || DwtMessageDialog.CRITICAL_STYLE));
	this._msgDialog.popup(loc);
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
	this._msgDialog.reset();

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
	if (newPassword.length < this._minPwdLength || newPassword.length > this._maxPwdLength) {
		this.showMessageDialog(AjxMessageFormat.format(ZmMsg.newPasswordBadLength, [this._minPwdLength, this._maxPwdLength]));
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
