function ZmChangePasswordDialog(parent, msgDialog, className) {

	DwtDialog.call(this, parent, className, ZmMsg.changePassword);

	this._msgDialog = msgDialog;

	this._oldPasswordId = Dwt.getNextId();
	this._newPasswordId = Dwt.getNextId();
	this._confirmPasswordId = Dwt.getNextId();	

	this.setContent(this._contentHtml());

	var doc = this.getDocument();
	this._oldPasswordField = Dwt.getDomObj(doc, this._oldPasswordId);
	this._newPasswordField = Dwt.getDomObj(doc, this._newPasswordId);
	this._confirmPasswordField = Dwt.getDomObj(doc, this._confirmPasswordId);

	this.setButtonListener(DwtDialog.OK_BUTTON, new AjxListener(this, this._okButtonListener));
	this.setTabOrder([this._oldPasswordId, this._newPasswordId, 
					  this._confirmPasswordId]);
	this.addEnterListener(this._enterListener);
}

ZmChangePasswordDialog.prototype = new DwtDialog;
ZmChangePasswordDialog.prototype.constructor = ZmChangePasswordDialog;

ZmChangePasswordDialog.prototype.toString = 
function() {
	return "ZmChangePasswordDialog";
}

ZmChangePasswordDialog.prototype.popup = 
function(loc) {
	DwtDialog.prototype.popup.call(this, loc);
	this._oldPasswordField.focus();
}

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
}

ZmChangePasswordDialog.prototype.showMessageDialog = 
function (message, loc, style){
	if (!loc) {
		var myLoc = this.getLocation();
		loc = new DwtPoint(myLoc.x - 50, myLoc.y + 75);
	}
	var mStyle = style? style : DwtMessageDialog.CRITICAL_STYLE;
	this._msgDialog.setMessage(message, null, mStyle);
	this._msgDialog.popup(loc);
}

ZmChangePasswordDialog.prototype._okButtonListener =
function(ev) {
	var args = this._getPasswordData();
	if (args) {
		DwtDialog.prototype._buttonListener.call(this, ev, args);	
	}
};

ZmChangePasswordDialog.leadingWhitespaceRegex = /\s+[^\s]*/g;
ZmChangePasswordDialog.trailingWhitespaceRegex = /\s*[^\s]*\s+/g;
ZmChangePasswordDialog.prototype._hasWhiteSpace = function (field){
	if ((field.search(ZmChangePasswordDialog.trailingWhitespaceRegex) != -1) ||
		(field.search(ZmChangePasswordDialog.leadingWhitespaceRegex) != -1) ){
		return true;
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
	
	if (this._hasWhiteSpace(oldPassword)){
		this.showMessageDialog(ZmMsg.oldPasswordHasWhitespace);
		return null;
	}
	if (this._hasWhiteSpace(newPassword)){
		this.showMessageDialog(ZmMsg.newPasswordHasWhitespace);
		return null;
	}
	if (this._hasWhiteSpace(confirmPassword)){
		this.showMessageDialog(ZmMsg.confirmPasswordHasWhitespace);
		return null;
	}

	// check to see that the first and second new passwords match
	if (newPassword != confirmPassword) {
		this.showMessageDialog(ZmMsg.bothNewPasswordsMustMatch);
		return null;
	}

	// check that the length is at least 6 characters
	if (newPassword.length < 6) {
		this.showMessageDialog(ZmMsg.newPasswordTooShort);
		return null;
	}

	return  [oldPassword, newPassword];
}

ZmChangePasswordDialog.prototype._getInputFields = 
function() {
	return [this._oldPasswordField, this._newPasswordField, this._confirmPasswordField];
}

ZmChangePasswordDialog.prototype._enterListener =
function (ev){
	var args = this._getPasswordData();
	if (args) {
		this._runEnterCallback(args);
	}
};

ZmChangePasswordDialog.prototype.focus = function () {
	this._oldPasswordField.focus();
};
