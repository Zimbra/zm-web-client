function LmTagTreeView(appCtxt, parent, tree, dragSrc, dropTgt) {

	LmTreeView.call(this, LmOrganizer.TAG, appCtxt, parent, tree, dragSrc, dropTgt);
}

LmTagTreeView.prototype = new LmTreeView;
LmTagTreeView.prototype.constructor = LmTagTreeView;

// Public methods

LmTagTreeView.prototype.toString = 
function() {
	return "LmTagTreeView";
}

/**
* Renders the list of tags. Tags are technically a tree, but they have only one level.
*/
LmTagTreeView.prototype.set =
function(tagTree, showUnread) {
	if (this._dataTree)
		this._dataTree.removeChangeListener(this._dataChangeListener);
	this._dataTree = tagTree;	
	tagTree.addChangeListener(this._dataChangeListener);
	this._showUnread = showUnread;

	var rootTag = tagTree.root;
	this._treeHash[LmOrganizer.ID_ROOT] = this._parent;
	this._treeHash[LmFolder.ID_TAGS] = this._parent;
	
	if (this._parent == this._tree)
		this._tree.clear();
	this._render(this._parent, rootTag);		
}

// Handles tag changes
LmTagTreeView.prototype._changeListener =
function(ev) {
	LmTreeView.prototype._changeListener.call(this, ev);
	var fields = ev.getDetail("fields");
	if (ev.event == LmEvent.E_MODIFY && ((fields && fields[LmOrganizer.F_COLOR]))) {
		var tag = ev.source;
		var node = this._treeHash[tag.id];
		if (node)
			node.setImage(LmTag.COLOR_ICON[tag.color]);
	}
}

LmTagTreeView.prototype._getIcon = 
function(tag) {
	return LmTag.COLOR_ICON[tag.color];
}
