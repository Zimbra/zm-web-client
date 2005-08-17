function LmTagTree(appCtxt) {

	LmTree.call(this, LmOrganizer.TAG, appCtxt);

	this._evt = new LmEvent(LmEvent.S_TAG);
}

LmTagTree.prototype = new LmTree;
LmTagTree.prototype.constructor = LmTagTree;

// ordered list of colors
LmTagTree.COLOR_LIST = [LmTag.C_CYAN, LmTag.C_BLUE, LmTag.C_PURPLE, LmTag.C_RED,
						LmTag.C_ORANGE, LmTag.C_YELLOW, LmTag.C_GREEN];

LmTagTree.prototype.toString = 
function() {
	return "LmTagTree";
}

LmTagTree.prototype.loadFromJs =
function(tagsObj) {
	if (!tagsObj || !tagsObj.tag || !tagsObj.tag.length) return;

	this.createRoot();
	for (var i = 0; i < tagsObj.tag.length; i++)
		LmTag.createFromJs(this.root, tagsObj.tag[i], this);
	var children = this.root.children.getArray();
	if (children.length)
		children.sort(LmTag.sortCompare);
}

LmTagTree.prototype.createRoot =
function() {
	if (!this.root)
		this.root = new LmTag(LmTag.ID_ROOT, null, null, null, this);
}
