function ZmFlagPicker(parent) {

	ZmPicker.call(this, parent, ZmPicker.FLAG);
}

ZmFlagPicker.prototype = new ZmPicker;
ZmFlagPicker.prototype.constructor = ZmFlagPicker;

ZmPicker.CTOR[ZmPicker.FLAG] = ZmFlagPicker;

ZmFlagPicker.prototype.toString = 
function() {
	return "ZmFlagPicker";
}

ZmFlagPicker.prototype._setupPicker =
function(parent) {
	var tree = this._tree = new DwtTree(parent, DwtTree.CHECKEDITEM_STYLE);
	tree.addSelectionListener(new AjxListener(this, ZmFlagPicker.prototype._treeListener));
	
	var ti = this._flagged = new DwtTreeItem(tree);
	ti.setText(ZmMsg.flagged);
	ti.setImage(ZmImg.I_FLAG_ON);
	
	ti = this._unflagged = new DwtTreeItem(tree);
	ti.setText(ZmMsg.unflagged);
	ti.setImage(ZmImg.I_FLAG_OFF);
	
	tree.addSeparator();

	ti = this._read = new DwtTreeItem(tree);
	ti.setText(ZmMsg.read);
	ti.setImage(ZmImg.I_READ_MSG);
	
	ti = this._unread = new DwtTreeItem(tree);
	ti.setText(ZmMsg.unread);
	ti.setImage(ZmImg.I_ENVELOPE);	

	tree.addSeparator();

	ti = this._replied = new DwtTreeItem(tree);
	ti.setText(ZmMsg.replied);
	ti.setImage(ZmImg.I_REPLY);
	
	ti = this._forwarded = new DwtTreeItem(tree);
	ti.setText(ZmMsg.forwarded);
	ti.setImage(ZmImg.I_FORWARD);	
}

ZmFlagPicker.prototype._updateQuery = 
function() {
	var query = new Array();

	if (this._flagged.getChecked())
		query.push("is:flagged");
	else if (this._unflagged.getChecked())
		query.push("is:unflagged");

	if (this._read.getChecked())
		query.push("is:read");
	else if (this._unread.getChecked())
		query.push("is:unread");
	
	if (this._replied.getChecked())
		query.push("is:replied");

	if (this._forwarded.getChecked())
		query.push("is:forwarded");

	if (query.length) {
		this.setQuery(query.join(" "));
	} else {
		this.setQuery("");
	}
	this.execute();
}

ZmFlagPicker.prototype._treeListener =
function(ev) {
 	if (ev.detail == DwtTree.ITEM_CHECKED) {
 		var ti = ev.item;
 		var checked = ti.getChecked();
 		if (ti == this._flagged && checked && this._unflagged.getChecked())
 				this._unflagged.setChecked(0);
		else if (ti == this._unflagged && checked && this._flagged.getChecked())
 				this._flagged.setChecked(0);
		else if (ti == this._read && checked && this._unread.getChecked())
 				this._unread.setChecked(0);
		else if (ti == this._unread && checked && this._read.getChecked())
 				this._read.setChecked(0);
		this._updateQuery();
 	}
}
