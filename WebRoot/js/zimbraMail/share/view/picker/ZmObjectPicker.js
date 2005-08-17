function ZmObjectPicker(parent) {

	ZmPicker.call(this, parent, ZmPicker.OBJECT);
}

ZmObjectPicker.prototype = new ZmPicker;
ZmObjectPicker.prototype.constructor = ZmObjectPicker;

ZmPicker.CTOR[ZmPicker.OBJECT] = ZmObjectPicker;

ZmObjectPicker.prototype.toString = 
function() {
	return "ZmObjectPicker";
}

ZmObjectPicker.prototype._addObject =
function(tree, text, imageInfo, type) {
	var ti = this._objects[type] = new DwtTreeItem(tree);
	ti.setText(text);
	ti.setImage(imageInfo);
}

ZmObjectPicker.prototype._setupPicker =
function(parent) {
	this._objects = new Object();
	
    var tti, ti;
	var tree = this._tree = new DwtTree(parent, DwtTree.CHECKEDITEM_STYLE);
	tree.addSelectionListener(new AjxListener(this, ZmObjectPicker.prototype._treeListener));
	
	this._addObject(tree, LmMsg.tracking, ZmImg.I_PO, "tracking");
	this._addObject(tree, LmMsg.phoneNumber, ZmImg.I_TELEPHONE, "phone");
	this._addObject(tree, LmMsg.po, ZmImg.I_PO, "po");
	this._addObject(tree, LmMsg.url, ZmImg.I_URL, "url");	
}

ZmObjectPicker.prototype._updateQuery = 
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

ZmObjectPicker.prototype._treeListener =
function(ev) {
 	if (ev.detail == DwtTree.ITEM_CHECKED)
 		this._updateQuery();
}
