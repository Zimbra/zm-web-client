function LmSavedSearchPicker(parent) {

	LmPicker.call(this, parent, LmPicker.SEARCH);

    this._checkedItems = new LsVector();
}

LmSavedSearchPicker.prototype = new LmPicker;
LmSavedSearchPicker.prototype.constructor = LmSavedSearchPicker;

LmPicker.CTOR[LmPicker.SEARCH] = LmSavedSearchPicker;

LmSavedSearchPicker.prototype.toString = 
function() {
	return "LmSavedSearchPicker";
}

LmSavedSearchPicker.prototype._setupPicker =
function(parent) {
	var tree = this._tree = new DwtTree(parent, DwtTree.CHECKEDITEM_STYLE);
	var appCtxt = this.shell.getData(LmAppCtxt.LABEL);
	tree.addSelectionListener(new LsListener(this, this._treeListener));
	this._folderTreeView = new LmFolderTreeView(appCtxt, this._tree, this._tree);
	this._folderTreeView._restrictedType = LmOrganizer.SEARCH;
	var folders = [LmFolder.ID_USER, LmFolder.ID_SEP, LmFolder.ID_SEARCH];
	this._folderTreeView.set(appCtxt.getFolderTree(), folders, false);
	this._twiddle(folders);
}

LmSavedSearchPicker.prototype._updateQuery = 
function() {
	var searches = new Array();
	var num = this._checkedItems.size();
	for (var i = 0; i < num; i++) {
		var search = this._checkedItems.get(i);
		searches.push("(" + search.query + ")");
	}
	var query = "";
	if (searches.length) {
		if (query.length)
			query += " OR ";
		var searchStr = searches.join(" OR ");
		if (searches.length > 1)
			searchStr = "(" + searchStr + ")";
		query += searchStr;
	}
	this.setQuery(query);
	this.execute();
}

LmSavedSearchPicker.prototype._treeListener =
function(ev) {
 	if (ev.detail == DwtTree.ITEM_CHECKED) {
 		var ti = ev.item;
 		var checked = ti.getChecked();
 		var search = ti.getData(Dwt.KEY_OBJECT);
 		if (ti.getChecked()) {
			this._checkedItems.add(search);
 		} else {
			this._checkedItems.remove(search);
 		}
		this._updateQuery();
 	}
}

// Take the checkboxes away from folders, and make sure saved searches are visible
LmSavedSearchPicker.prototype._twiddle =
function(folders) {
	// expand everything at the top level recursively
	for (var i = 0; i < folders.length; i++) {
		var id = folders[i];
		var ti = this._folderTreeView._treeHash[id];
		if (ti) {
			ti.setExpanded(true, true);
			ti.setVisible(false, true);
		}
	}
	// take the checkbox away from anything that's not a saved search
	for (var id in this._folderTreeView._treeHash) {
		var ti = this._folderTreeView._treeHash[id];
		var organizer = ti.getData(Dwt.KEY_OBJECT);
		if (organizer.type != LmOrganizer.SEARCH || id < 0)
			if (ti._checkBoxCell)
				Dwt.setVisible(ti._checkBoxCell, false);
	}
}
