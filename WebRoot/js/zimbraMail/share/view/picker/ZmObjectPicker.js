function LmObjectPicker(parent) {

	LmPicker.call(this, parent, LmPicker.OBJECT);
}

LmObjectPicker.prototype = new LmPicker;
LmObjectPicker.prototype.constructor = LmObjectPicker;

LmPicker.CTOR[LmPicker.OBJECT] = LmObjectPicker;

LmObjectPicker.prototype.toString = 
function() {
	return "LmObjectPicker";
}

LmObjectPicker.prototype._addObject =
function(tree, text, imageInfo, type) {
	var ti = this._objects[type] = new DwtTreeItem(tree);
	ti.setText(text);
	ti.setImage(imageInfo);
}

LmObjectPicker.prototype._setupPicker =
function(parent) {
	this._objects = new Object();
	
    var tti, ti;
	var tree = this._tree = new DwtTree(parent, DwtTree.CHECKEDITEM_STYLE);
	tree.addSelectionListener(new LsListener(this, LmObjectPicker.prototype._treeListener));
	
	this._addObject(tree, LmMsg.tracking, LmImg.I_PO, "tracking");
	this._addObject(tree, LmMsg.phoneNumber, LmImg.I_TELEPHONE, "phone");
	this._addObject(tree, LmMsg.po, LmImg.I_PO, "po");
	this._addObject(tree, LmMsg.url, LmImg.I_URL, "url");	
}

LmObjectPicker.prototype._updateQuery = 
function() {
	var types = new Array();
	for (var type in this._objects)
		if (this._objects[type].getChecked())
			types.push(type);
	
	if (types.length) {
		var query = types.join(" OR ");
		if (types.length > 1)
			query = "(" + query + ")";
		this.setQuery("has:" + query);
	} else {
		this.setQuery("");
	}
	this.execute();
}

LmObjectPicker.prototype._treeListener =
function(ev) {
 	if (ev.detail == DwtTree.ITEM_CHECKED)
 		this._updateQuery();
}
