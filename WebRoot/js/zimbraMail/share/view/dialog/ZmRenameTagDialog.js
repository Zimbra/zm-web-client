function ZmRenameTagDialog(parent, msgDialog, className) {

	ZmDialog.call(this, parent, msgDialog, className, LmMsg.renameTag);

	this.setContent(this._contentHtml());
	this._setNameField(this._nameFieldId);
}

ZmRenameTagDialog.prototype = new ZmDialog;
ZmRenameTagDialog.prototype.constructor = ZmRenameTagDialog;

ZmRenameTagDialog.prototype.toString = 
function() {
	return "ZmRenameTagDialog";
}

ZmRenameTagDialog.prototype.popup =
function(tag, source, loc) {
	ZmDialog.prototype.popup.call(this, loc);
	this.setTitle(LmMsg.renameTag + ': ' + tag.getName(false, ZmOrganizer.MAX_DISPLAY_NAME_LENGTH));
	this._nameField.value = tag.getName(false);
	this._tag = tag;
}

ZmRenameTagDialog.prototype._contentHtml = 
function() {
	this._nameFieldId = Dwt.getNextId();
	var html = new Array();
	var idx = 0;
	html[idx++] = "<table cellpadding='0' cellspacing='0' border='0'>";
	html[idx++] = "<tr><td class='Label' colspan=2 style='padding: 0px 0px 5px 0px;'>" + LmMsg.newTagName + ": </td></tr>";
	html[idx++] = "<tr><td><input type='text' class='Field' id='" + this._nameFieldId + "' /></td></tr>";
	html[idx++] = "</table>";
	
	return html.join("");
}

ZmRenameTagDialog.prototype._okButtonListener =
function(ev) {
	var results = this._getTagData();
	if (results)
		DwtDialog.prototype._buttonListener.call(this, ev, results);
}

ZmRenameTagDialog.prototype._getTagData =
function() {
	// check name for presence and validity
	var name = AjxStringUtil.trim(this._nameField.value);
	var msg = ZmTag.checkName(name);
	
	// make sure tag name doesn't already exist
	if (!msg) {
		var t = this._appCtxt.getTagList().getByName(name);
		if (t && (t.id != this._tag.id))
			msg = LmMsg.tagNameExists;
	}

	return (msg ? this._showError(msg) : [this._tag, name]);
}

ZmRenameTagDialog.prototype._enterListener =
function(ev) {
	var results = this._getTagData();
	if (results)
		this._runEnterCallback(results);
}
