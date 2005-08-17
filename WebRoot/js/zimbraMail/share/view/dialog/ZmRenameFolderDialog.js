function ZmRenameFolderDialog(parent, msgDialog, className, folderTree) {

	ZmDialog.call(this, parent, msgDialog, className, ZmMsg.renameFolder);

	this.setContent(this._contentHtml());
	this._setNameField(this._nameFieldId);
	this._folderTree = folderTree;
}

ZmRenameFolderDialog.prototype = new ZmDialog;
ZmRenameFolderDialog.prototype.constructor = ZmRenameFolderDialog;

ZmRenameFolderDialog.prototype.toString = 
function() {
	return "ZmRenameFolderDialog";
}

ZmRenameFolderDialog.prototype.popup =
function(folder, source, loc) {
	ZmDialog.prototype.popup.call(this, loc);
	var title = (folder.type == ZmOrganizer.SEARCH) ? ZmMsg.renameSearch : ZmMsg.renameFolder;
	this.setTitle(title + ': ' + folder.getName(false, ZmOrganizer.MAX_DISPLAY_NAME_LENGTH));
	this._nameField.value = folder.getName(false);
	this._folder = folder;
}

ZmRenameFolderDialog.prototype._contentHtml = 
function() {
	this._nameFieldId = Dwt.getNextId();
	var html = new Array();
	var idx = 0;
	html[idx++] = "<table cellpadding='0' cellspacing='0' border='0'>";
	html[idx++] = "<tr><td class='Label' colspan=2 style='padding: 0px 0px 5px 0px;'>" + ZmMsg.newName + ": </td></tr>";
	html[idx++] = "<tr><td><input type='text' class='Field' id='" + this._nameFieldId + "' /></td></tr>";
	html[idx++] = "</table>";
	
	return html.join("");
}

ZmRenameFolderDialog.prototype._okButtonListener =
function(ev) {
	var results = this._getFolderData();
	if (results)
		DwtDialog.prototype._buttonListener.call(this, ev, results);
}

ZmRenameFolderDialog.prototype._getFolderData =
function() {
	// check name for presence and validity
	var name = AjxStringUtil.trim(this._nameField.value);
	var msg = ZmFolder.checkName(name);

	// make sure folder with this name doesn't already exist at this level
	if (!msg) {
		var parentFolder = this._folder.parent;
		var f = parentFolder.getByName(name);
		if (f && (f.id != this._folder.id))
			msg = ZmMsg.folderNameExists;
	}

	return (msg ? this._showError(msg) : [this._folder, name]);
}

ZmRenameFolderDialog.prototype._enterListener =
function (ev){
	var results = this._getFolderData();
	if (results)
		this._runEnterCallback(results);
}
