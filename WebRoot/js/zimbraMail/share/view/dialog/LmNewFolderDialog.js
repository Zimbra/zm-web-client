function LmNewFolderDialog(parent, msgDialog, className, folderTree) {

	LmDialog.call(this, parent, msgDialog, className, LmMsg.createNewFolder);

	this.setContent(this._contentHtml());
	this._setNameField(this._nameFieldId);
	var folders = [LmFolder.ID_USER];
	var omit = new Object();
	omit[LmFolder.ID_SPAM] = true;
	omit[LmFolder.ID_DRAFTS] = true;
	this._setFolderTree(folderTree, folders, this._folderTreeCellId, omit);
}

LmNewFolderDialog.prototype = new LmDialog;
LmNewFolderDialog.prototype.constructor = LmNewFolderDialog;

LmNewFolderDialog.prototype.toString = 
function() {
	return "LmNewFolderDialog";
}

LmNewFolderDialog.prototype.popup =
function(folder, loc) {
	folder = folder || this._folderTree.getById(LmFolder.ID_USER);
	if (folder)
		this._folderTreeView.setSelected(folder);
	if (folder.id == LmFolder.ID_USER) {
		var ti = this._folderTreeView.getTreeItemById(folder.id);
		ti.setExpanded(true);
	}
	LmDialog.prototype.popup.call(this, loc);
}

LmNewFolderDialog.prototype._contentHtml = 
function() {
	this._nameFieldId = Dwt.getNextId();
	this._folderTreeCellId = Dwt.getNextId();
	var html = new Array();
	var idx = 0;
	html[idx++] = "<table cellpadding='0' cellspacing='0' border='0'>";
	html[idx++] = "<tr><td class='Label' colspan=2 style='padding: 0px 0px 5px 0px;'>" + LmMsg.folderName + ": </td></tr>";
	html[idx++] = "<tr><td><input autocomplete=OFF type='text' class='Field' id='" + this._nameFieldId + "' /></td></tr>";
	html[idx++] = "<tr><td>&nbsp;</td></tr>";
	html[idx++] = "<tr><td class='Label' colspan=2>" + LmMsg.newFolderParent + ":</td></tr>";
	html[idx++] = "<tr><td colspan=2 id='" + this._folderTreeCellId + "'/></tr>";
	html[idx++] = "</table>";
	
	return html.join("");
}

LmNewFolderDialog.prototype._okButtonListener =
function(ev) {
	var results = this._getFolderData();
	if (results)
		DwtDialog.prototype._buttonListener.call(this, ev, results);
}

LmNewFolderDialog.prototype._getFolderData =
function() {
	// check name for presence and validity
	var name = LsStringUtil.trim(this._nameField.value);
	var msg = LmFolder.checkName(name);

	// make sure a parent was selected
	var parentFolder = this._folderTreeView.getSelected();
	if (!msg && !parentFolder)
		msg = LmMsg.folderNameNoLocation;

	// make sure parent doesn't already have a child by this name
	if (!msg)
		msg = LmFolder.checkParent(name, parentFolder);

	return (msg ? this._showError(msg) : [name, parentFolder]);
}

LmNewFolderDialog.prototype._enterListener =
function(ev) {
	var results = this._getFolderData();
	if (results)
		this._runEnterCallback(results);
}
