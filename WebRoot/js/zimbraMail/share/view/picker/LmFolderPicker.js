function LmFolderPicker(parent) {

	LmPicker.call(this, parent, LmPicker.FOLDER);

    this._checkedItems = new LsVector();
}

LmFolderPicker.prototype = new LmPicker;
LmFolderPicker.prototype.constructor = LmFolderPicker;

LmPicker.CTOR[LmPicker.FOLDER] = LmFolderPicker;

LmFolderPicker.prototype.toString = 
function() {
	return "LmFolderPicker";
}

LmFolderPicker.prototype._setupPicker =
function(parent) {
	var tree = this._tree = new DwtTree(parent, DwtTree.CHECKEDITEM_STYLE);
	var appCtxt = this.shell.getData(LmAppCtxt.LABEL);
	tree.addSelectionListener(new LsListener(this, this._treeListener));
	this._folderTreeView = new LmFolderTreeView(appCtxt, this._tree, this._tree);
	this._folderTreeView._restrictedType = LmOrganizer.FOLDER;
	var folders = [LmFolder.ID_USER];
	this._folderTreeView.set(appCtxt.getFolderTree(), folders, false);
	// Remove the checkbox for My Folders, and expand it
	if (appCtxt.get(LmSetting.USER_FOLDERS_ENABLED)) {
		var ti = this._folderTreeView.getTreeItemById(LmFolder.ID_USER);
		Dwt.setVisible(ti._checkBoxCell, false);
		ti.setExpanded(true);
		ti.setVisible(false, true);
	}
}

LmFolderPicker.prototype._updateQuery = 
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

LmFolderPicker.prototype._treeListener =
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
