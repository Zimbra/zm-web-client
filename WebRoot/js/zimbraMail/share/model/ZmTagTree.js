function ZmTagTree(appCtxt) {

	ZmTree.call(this, ZmOrganizer.TAG, appCtxt);

	this._evt = new ZmEvent(ZmEvent.S_TAG);
}

ZmTagTree.prototype = new ZmTree;
ZmTagTree.prototype.constructor = ZmTagTree;

// ordered list of colors
ZmTagTree.COLOR_LIST = [ZmTag.C_CYAN, ZmTag.C_BLUE, ZmTag.C_PURPLE, ZmTag.C_RED,
						ZmTag.C_ORANGE, ZmTag.C_YELLOW, ZmTag.C_GREEN];

ZmTagTree.prototype.toString = 
function() {
	return "ZmTagTree";
}

ZmTagTree.prototype.loadFromJs =
function(tagsObj) {
	if (!tagsObj || !tagsObj.tag || !tagsObj.tag.length) return;

	this.createRoot();
	for (var i = 0; i < tagsObj.tag.length; i++)
		ZmTag.createFromJs(this.root, tagsObj.tag[i], this);
	var children = this.root.children.getArray();
	if (children.length)
		children.sort(ZmTag.sortCompare);
}

ZmTagTree.prototype.createRoot =
function() {
	if (!this.root)
		this.root = new ZmTag(ZmTag.ID_ROOT, null, null, null, this);
}
