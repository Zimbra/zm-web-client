
/**
 * Creates a password update dialog.
 * @class
 * This class represents a password update dialog.
 *
 * @param	{DwtComposite}	parent		the parent
 * @param	{String}	className		the class name
 *
 * @extends		ZmDialog
 */
ZmPasswordUpdateDialog = function(parent, className) {

	ZmDialog.call(this, {parent:parent, className:className, title:ZmMsg.changePassword, id:"PasswdChangeDialog"});
	this._setNameField(this._nameFieldId);
    this._createControls();
};

ZmPasswordUpdateDialog.prototype = new ZmDialog;
ZmPasswordUpdateDialog.prototype.constructor = ZmPasswordUpdateDialog;

ZmPasswordUpdateDialog.prototype.toString =
function() {
	return "ZmPasswordUpdateDialog";
};

/**
 * Pops-up the dialog.
 */
ZmPasswordUpdateDialog.prototype.popup =
function(acct) {
   	ZmDialog.prototype.popup.call(this);
    this.acct = acct;
    var desc  = document.getElementById(this._htmlElId + "_desc");
    this._toggleOKButton(false);
    desc.innerHTML = AjxMessageFormat.format(ZmMsg.offlinePasswordUpdate, this.acct.name);
    var acctTd  = document.getElementById(this._htmlElId + "_acct");
    acctTd.innerHTML = this.acct.name;
	this._nameField.value = "";
};

ZmPasswordUpdateDialog.prototype._createControls =
function() {
    this.setTitle(ZmMsg.offlineAccountAuth);
    this._toggleOKButton(false);
    var cancelBtn = this.getButton(DwtDialog.CANCEL_BUTTON);
    cancelBtn.setText(ZmMsg.dismiss);
    var okBtn = this.getButton(DwtDialog.OK_BUTTON);
	okBtn.setText(ZmMsg.save);
    this._nameField._dlgEl = this._htmlElId;
    Dwt.setHandler(this._nameField, DwtEvent.ONKEYUP, this._handleKeyUp);

};


ZmPasswordUpdateDialog.prototype._contentHtml =
function() {
	this._nameFieldId = this._htmlElId + "_name";
	var subs = {id:this._htmlElId, labelAcct:ZmMsg.account, labelPasswd:ZmMsg.password};
	return AjxTemplate.expand("share.Dialogs#ZmPasswordUpdateDialog", subs);
};

ZmPasswordUpdateDialog.prototype._okButtonListener =
function(ev) {
    var pwd = AjxStringUtil.trim(this._nameField.value);
    if (pwd && pwd.length > 0 ) {
        var soapDoc = AjxSoapDoc.create("ChangePasswordRequest", "urn:zimbraOffline");
        soapDoc.setMethodAttribute("id", this.acct.id);
        soapDoc.set("password", pwd);

        appCtxt.getAppController().sendRequest({
            soapDoc:soapDoc,
            asyncMode:true,
            noBusyOverlay:true,
            callback: new AjxCallback(this, this._handlePasswordUpdateResult),
            accountName:this.name
        });
    }
};


/**
 *  Updates password for specified account
 *
 */

ZmPasswordUpdateDialog.prototype._handlePasswordUpdateResult =
function(result) {
    var resp = result.getResponse();
    resp = resp.ChangePasswordResponse;
    if (resp && resp.status == "success") {
        this.popdown();
        var msg = AjxMessageFormat.format(ZmMsg.offlinePasswordUpdateSuccess, this.acct.name);
        appCtxt.setStatusMsg(msg, ZmStatusView.LEVEL_INFO);
    } else {
        appCtxt.setStatusMsg(ZmMsg.offlinePasswordUpdateFailure, ZmStatusView.LEVEL_WARNING);
        this._nameField.value = "";
        this._toggleOKButton(false);
    }
};

ZmPasswordUpdateDialog.prototype._enterListener =
function(ev) {
	var pwd = AjxStringUtil.trim(this._nameField.value);
    if (pwd && pwd.length > 0 ) {
	    this._okButtonListener();
	}
};

ZmPasswordUpdateDialog.prototype._handleKeyUp =
function(ev) {

    var key = DwtKeyEvent.getCharCode(ev);
	if (key == 9) {
		return;
	}
    var el = DwtUiEvent.getTarget(ev);
    var val = el && el.value;
    var dlgEl  = el && el._dlgEl && DwtControl.ALL_BY_ID[el._dlgEl];
    dlgEl._toggleOKButton(val.length > 0);
};

ZmPasswordUpdateDialog.prototype._toggleOKButton =
function(enable) {
    var okBtn = this.getButton(DwtDialog.OK_BUTTON);
	okBtn.setEnabled(enable);
};
