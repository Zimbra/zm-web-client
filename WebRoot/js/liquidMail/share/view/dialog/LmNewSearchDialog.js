function LmNewSearchDialog(parent, msgDialog, className, folderTree) {

	LmDialog.call(this, parent, msgDialog, className, LmMsg.saveSearch);

	this.setContent(this._contentHtml());
	this._setNameField(this._nameFieldId);
	var folders = [LmFolder.ID_USER, LmFolder.ID_SEP, LmFolder.ID_SEARCH];
	var omit = new Object();
	omit[LmFolder.ID_SPAM] = true;
	omit[LmFolder.ID_DRAFTS] = true;
	this._setFolderTree(folderTree, folders, this._folderTreeCellId, omit);
}

LmNewSearchDialog.prototype = new LmDialog;
LmNewSearchDialog.prototype.constructor = LmNewSearchDialog;

LmNewSearchDialog.prototype.toString = 
function() {
	return "LmNewSearchDialog";
}

LmNewSearchDialog.prototype.popup =
function(search, loc) {
	this._search = search;
	var folder = this._folderTree.getById(LmFolder.ID_SEARCH);
	this._folderTreeView.setSelected(folder);
	LmDialog.prototype.popup.call(this, loc);
}

LmNewSearchDialog.prototype._contentHtml = 
function() {
	this._nameFieldId = Dwt.getNextId();
	this._folderTreeCellId = Dwt.getNextId();
	var html = new Array();
	var idx = 0;
	html[idx++] = "<table cellpadding='0' cellspacing='0' border='0'>";
	html[idx++] = "<tr><td class='Label' colspan=2 style='padding: 0px 0px 5px 0px;'>" + LmMsg.searchName + ": </td></tr>";
	html[idx++] = "<tr><td><input autocomplete=OFF type='text' class='Field' id='" + this._nameFieldId + "' /></td></tr>";
	html[idx++] = "<tr><td>&nbsp;</td></tr>";
	html[idx++] = "<tr><td class='Label' colspan=2>" + LmMsg.newSearchParent + ":</td></tr>";
	html[idx++] = "<tr><td colspan=2 id='" + this._folderTreeCellId + "'/></tr>";
	html[idx++] = "</table>";
	
	return html.join("");
}

LmNewSearchDialog.prototype._okButtonListener =
function(ev) {
	var results = this._getSearchData();
	if (results)
		DwtDialog.prototype._buttonListener.call(this, ev, results);
}

LmNewSearchDialog.prototype._getSearchData =
function() {
	// check name for presence and validity
	var name = LsStringUtil.trim(this._nameField.value);
	var msg = LmFolder.checkName(name);

	// make sure a parent was selected
	var parentFolder = this._folderTreeView.getSelected();
	if (!msg && !parentFolder)
		msg = LmMsg.searchNameNoLocation;

	// make sure parent doesn't already have a child by this name
	if (!msg)
		msg = LmFolder.checkParent(name, parentFolder);

	return (msg ? this._showError(msg) : [name, parentFolder, this._search]);
}

LmNewSearchDialog.prototype._enterListener =
function(ev) {
	var results = this._getSearchData();
	if (results)
		this._runEnterCallback(results);
}
