function ZmNewSearchDialog(parent, msgDialog, className, folderTree) {

	ZmDialog.call(this, parent, msgDialog, className, ZmMsg.saveSearch);

	this.setContent(this._contentHtml());
	this._setNameField(this._nameFieldId);
	var folders = [ZmFolder.ID_USER, ZmFolder.ID_SEP, ZmFolder.ID_SEARCH];
	var omit = new Object();
	omit[ZmFolder.ID_SPAM] = true;
	omit[ZmFolder.ID_DRAFTS] = true;
	this._setFolderTree(folderTree, folders, this._folderTreeCellId, omit);
}

ZmNewSearchDialog.prototype = new ZmDialog;
ZmNewSearchDialog.prototype.constructor = ZmNewSearchDialog;

ZmNewSearchDialog.prototype.toString = 
function() {
	return "ZmNewSearchDialog";
}

ZmNewSearchDialog.prototype.popup =
function(search, loc) {
	this._search = search;
	var folder = this._folderTree.getById(ZmFolder.ID_SEARCH);
	this._folderTreeView.setSelected(folder);
	ZmDialog.prototype.popup.call(this, loc);
}

ZmNewSearchDialog.prototype._contentHtml = 
function() {
	this._nameFieldId = Dwt.getNextId();
	this._folderTreeCellId = Dwt.getNextId();
	var html = new Array();
	var idx = 0;
	html[idx++] = "<table cellpadding='0' cellspacing='0' border='0'>";
	html[idx++] = "<tr><td class='Label' colspan=2 style='padding: 0px 0px 5px 0px;'>" + ZmMsg.searchName + ": </td></tr>";
	html[idx++] = "<tr><td><input autocomplete=OFF type='text' class='Field' id='" + this._nameFieldId + "' /></td></tr>";
	html[idx++] = "<tr><td>&nbsp;</td></tr>";
	html[idx++] = "<tr><td class='Label' colspan=2>" + ZmMsg.newSearchParent + ":</td></tr>";
	html[idx++] = "<tr><td colspan=2 id='" + this._folderTreeCellId + "'/></tr>";
	html[idx++] = "</table>";
	
	return html.join("");
}

ZmNewSearchDialog.prototype._okButtonListener =
function(ev) {
	var results = this._getSearchData();
	if (results)
		DwtDialog.prototype._buttonListener.call(this, ev, results);
}

ZmNewSearchDialog.prototype._getSearchData =
function() {
	// check name for presence and validity
	var name = AjxStringUtil.trim(this._nameField.value);
	var msg = ZmFolder.checkName(name);

	// make sure a parent was selected
	var parentFolder = this._folderTreeView.getSelected();
	if (!msg && !parentFolder)
		msg = ZmMsg.searchNameNoLocation;

	// make sure parent doesn't already have a child by this name
	if (!msg)
		msg = ZmFolder.checkParent(name, parentFolder);

	return (msg ? this._showError(msg) : [name, parentFolder, this._search]);
}

ZmNewSearchDialog.prototype._enterListener =
function(ev) {
	var results = this._getSearchData();
	if (results)
		this._runEnterCallback(results);
}
