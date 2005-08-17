function LmRenameFolderDialog(parent, msgDialog, className, folderTree) {

	LmDialog.call(this, parent, msgDialog, className, LmMsg.renameFolder);

	this.setContent(this._contentHtml());
	this._setNameField(this._nameFieldId);
	this._folderTree = folderTree;
}

LmRenameFolderDialog.prototype = new LmDialog;
LmRenameFolderDialog.prototype.constructor = LmRenameFolderDialog;

LmRenameFolderDialog.prototype.toString = 
function() {
	return "LmRenameFolderDialog";
}

LmRenameFolderDialog.prototype.popup =
function(folder, source, loc) {
	LmDialog.prototype.popup.call(this, loc);
	var title = (folder.type == LmOrganizer.SEARCH) ? LmMsg.renameSearch : LmMsg.renameFolder;
	this.setTitle(title + ': ' + folder.getName(false, LmOrganizer.MAX_DISPLAY_NAME_LENGTH));
	this._nameField.value = folder.getName(false);
	this._folder = folder;
}

LmRenameFolderDialog.prototype._contentHtml = 
function() {
	this._nameFieldId = Dwt.getNextId();
	var html = new Array();
	var idx = 0;
	html[idx++] = "<table cellpadding='0' cellspacing='0' border='0'>";
	html[idx++] = "<tr><td class='Label' colspan=2 style='padding: 0px 0px 5px 0px;'>" + LmMsg.newName + ": </td></tr>";
	html[idx++] = "<tr><td><input type='text' class='Field' id='" + this._nameFieldId + "' /></td></tr>";
	html[idx++] = "</table>";
	
	return html.join("");
}

LmRenameFolderDialog.prototype._okButtonListener =
function(ev) {
	var results = this._getFolderData();
	if (results)
		DwtDialog.prototype._buttonListener.call(this, ev, results);
}

LmRenameFolderDialog.prototype._getFolderData =
function() {
	// check name for presence and validity
	var name = LsStringUtil.trim(this._nameField.value);
	var msg = LmFolder.checkName(name);

	// make sure folder with this name doesn't already exist at this level
	if (!msg) {
		var parentFolder = this._folder.parent;
		var f = parentFolder.getByName(name);
		if (f && (f.id != this._folder.id))
			msg = LmMsg.folderNameExists;
	}

	return (msg ? this._showError(msg) : [this._folder, name]);
}

LmRenameFolderDialog.prototype._enterListener =
function (ev){
	var results = this._getFolderData();
	if (results)
		this._runEnterCallback(results);
}
