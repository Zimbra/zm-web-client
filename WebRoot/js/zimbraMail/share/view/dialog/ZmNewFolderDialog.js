function ZmNewFolderDialog(parent, msgDialog, className, folderTree) {

	ZmDialog.call(this, parent, msgDialog, className, ZmMsg.createNewFolder);

	this.setContent(this._contentHtml());
	this._setNameField(this._nameFieldId);
	var folders = [ZmFolder.ID_USER];
	var omit = new Object();
	omit[ZmFolder.ID_SPAM] = true;
	omit[ZmFolder.ID_DRAFTS] = true;
	this._setFolderTree(folderTree, folders, this._folderTreeCellId, omit);
}

ZmNewFolderDialog.prototype = new ZmDialog;
ZmNewFolderDialog.prototype.constructor = ZmNewFolderDialog;

ZmNewFolderDialog.prototype.toString = 
function() {
	return "ZmNewFolderDialog";
}

ZmNewFolderDialog.prototype.popup =
function(folder, loc) {
	folder = folder || this._folderTree.getById(ZmFolder.ID_USER);
	if (folder)
		this._folderTreeView.setSelected(folder);
	if (folder.id == ZmFolder.ID_USER) {
		var ti = this._folderTreeView.getTreeItemById(folder.id);
		ti.setExpanded(true);
	}
	ZmDialog.prototype.popup.call(this, loc);
}

ZmNewFolderDialog.prototype._contentHtml = 
function() {
	this._nameFieldId = Dwt.getNextId();
	this._folderTreeCellId = Dwt.getNextId();
	var html = new Array();
	var idx = 0;
	html[idx++] = "<table cellpadding='0' cellspacing='0' border='0'>";
	html[idx++] = "<tr><td class='Label' colspan=2 style='padding: 0px 0px 5px 0px;'>" + ZmMsg.folderName + ": </td></tr>";
	html[idx++] = "<tr><td><input autocomplete=OFF type='text' class='Field' id='" + this._nameFieldId + "' /></td></tr>";
	html[idx++] = "<tr><td>&nbsp;</td></tr>";
	html[idx++] = "<tr><td class='Label' colspan=2>" + ZmMsg.newFolderParent + ":</td></tr>";
	html[idx++] = "<tr><td colspan=2 id='" + this._folderTreeCellId + "'/></tr>";
	html[idx++] = "</table>";
	
	return html.join("");
}

ZmNewFolderDialog.prototype._okButtonListener =
function(ev) {
	var results = this._getFolderData();
	if (results)
		DwtDialog.prototype._buttonListener.call(this, ev, results);
}

ZmNewFolderDialog.prototype._getFolderData =
function() {
	// check name for presence and validity
	var name = AjxStringUtil.trim(this._nameField.value);
	var msg = ZmFolder.checkName(name);

	// make sure a parent was selected
	var parentFolder = this._folderTreeView.getSelected();
	if (!msg && !parentFolder)
		msg = ZmMsg.folderNameNoLocation;

	// make sure parent doesn't already have a child by this name
	if (!msg)
		msg = ZmFolder.checkParent(name, parentFolder);

	return (msg ? this._showError(msg) : [name, parentFolder]);
}

ZmNewFolderDialog.prototype._enterListener =
function(ev) {
	var results = this._getFolderData();
	if (results)
		this._runEnterCallback(results);
}
