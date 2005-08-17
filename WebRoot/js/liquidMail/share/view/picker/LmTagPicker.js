function LmTagPicker(parent) {

	LmPicker.call(this, parent, LmPicker.TAG);

    this._checkedItems = new Object();
}

LmTagPicker.prototype = new LmPicker;
LmTagPicker.prototype.constructor = LmTagPicker;

LmPicker.CTOR[LmPicker.TAG] = LmTagPicker;

LmTagPicker.prototype.toString = 
function() {
	return "LmTagPicker";
}

LmTagPicker.prototype._setupPicker =
function(parent) {
	var tree = this._tree = new DwtTree(parent, DwtTree.CHECKEDITEM_STYLE);
	var appCtxt = this.shell.getData(LmAppCtxt.LABEL);
	tree.addSelectionListener(new LsListener(this, LmTagPicker.prototype._treeListener));
	this._tagTreeView = new LmTagTreeView(appCtxt, this._tree, this._tree);
	this._tagTreeView.set(appCtxt.getTagList());
}

LmTagPicker.prototype._updateQuery = 
function() {
	var tags = new Array();
	for (var tag in this._checkedItems)
		tags.push('"' + tag + '"');
		
	var num = tags.length;
	if (num) {
		var query = tags.join(" OR ");
		if (num > 1)
			query = "(" + query + ")";
		this.setQuery("tag:" + query);
	} else {
		this.setQuery("");
	}
	this.execute();
}

LmTagPicker.prototype._treeListener =
function(ev) {
 	if (ev.detail == DwtTree.ITEM_CHECKED) {
 		var ti = ev.item;
 		var checked = ti.getChecked();
 		var tag = ti.getData(Dwt.KEY_OBJECT).getName(false);
 		if (ti.getChecked()) {
			this._checkedItems[tag] = true;
 		} else {
			delete this._checkedItems[tag];
 		}
		this._updateQuery();
 	}
}
