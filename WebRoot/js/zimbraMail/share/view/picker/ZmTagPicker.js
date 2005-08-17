function ZmTagPicker(parent) {

	ZmPicker.call(this, parent, ZmPicker.TAG);

    this._checkedItems = new Object();
}

ZmTagPicker.prototype = new ZmPicker;
ZmTagPicker.prototype.constructor = ZmTagPicker;

ZmPicker.CTOR[ZmPicker.TAG] = ZmTagPicker;

ZmTagPicker.prototype.toString = 
function() {
	return "ZmTagPicker";
}

ZmTagPicker.prototype._setupPicker =
function(parent) {
	var tree = this._tree = new DwtTree(parent, DwtTree.CHECKEDITEM_STYLE);
	var appCtxt = this.shell.getData(ZmAppCtxt.LABEL);
	tree.addSelectionListener(new AjxListener(this, ZmTagPicker.prototype._treeListener));
	this._tagTreeView = new ZmTagTreeView(appCtxt, this._tree, this._tree);
	this._tagTreeView.set(appCtxt.getTagList());
}

ZmTagPicker.prototype._updateQuery = 
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

ZmTagPicker.prototype._treeListener =
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
