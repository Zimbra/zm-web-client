function ZmFolderPicker(parent) {

	ZmPicker.call(this, parent, ZmPicker.FOLDER);

    this._checkedItems = new AjxVector();
}

ZmFolderPicker.prototype = new ZmPicker;
ZmFolderPicker.prototype.constructor = ZmFolderPicker;

ZmPicker.CTOR[ZmPicker.FOLDER] = ZmFolderPicker;

ZmFolderPicker.prototype.toString = 
function() {
	return "ZmFolderPicker";
}

ZmFolderPicker.prototype._setupPicker =
function(parent) {
	var tree = this._tree = new DwtTree(parent, DwtTree.CHECKEDITEM_STYLE);
	var appCtxt = this.shell.getData(ZmAppCtxt.LABEL);
	tree.addSelectionListener(new AjxListener(this, this._treeListener));
	this._folderTreeView = new ZmFolderTreeView(appCtxt, this._tree, this._tree);
	this._folderTreeView._restrictedType = ZmOrganizer.FOLDER;
	var folders = [ZmFolder.ID_USER];
	this._folderTreeView.set(appCtxt.getFolderTree(), folders, false);
	// Remove the checkbox for My Folders, and expand it
	if (appCtxt.get(ZmSetting.USER_FOLDERS_ENABLED)) {
		var ti = this._folderTreeView.getTreeItemById(ZmFolder.ID_USER);
		Dwt.setVisible(ti._checkBoxCell, false);
		ti.setExpanded(true);
		ti.setVisible(false, true);
	}
}

ZmFolderPicker.prototype._updateQuery = 
function() {
	var folders = new Array();
	var num = this._checkedItems.size();
	for (var i = 0; i < num; i++) {
		var folder = this._checkedItems.get(i);
		folders.push(folder.createQuery(true));
	}
	var query = "";
	if (folders.length) {
		var folderStr = folders.join(" OR ");
		if (folders.length > 1)
			folderStr = "(" + folderStr + ")";
		query += "in:" + folderStr;
	}
	this.setQuery(query);
	this.execute();
}

ZmFolderPicker.prototype._treeListener =
function(ev) {
 	if (ev.detail == DwtTree.ITEM_CHECKED) {
 		var ti = ev.item;
 		var checked = ti.getChecked();
 		var folder = ti.getData(Dwt.KEY_OBJECT);
 		if (ti.getChecked()) {
			this._checkedItems.add(folder);
 		} else {
			this._checkedItems.remove(folder);
 		}
		this._updateQuery();
 	}
}
