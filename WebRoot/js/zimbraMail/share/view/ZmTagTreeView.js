function ZmTagTreeView(appCtxt, parent, tree, dragSrc, dropTgt) {

	ZmTreeView.call(this, ZmOrganizer.TAG, appCtxt, parent, tree, dragSrc, dropTgt);
}

ZmTagTreeView.prototype = new ZmTreeView;
ZmTagTreeView.prototype.constructor = ZmTagTreeView;

// Public methods

ZmTagTreeView.prototype.toString = 
function() {
	return "ZmTagTreeView";
}

/**
* Renders the list of tags. Tags are technically a tree, but they have only one level.
*/
ZmTagTreeView.prototype.set =
function(tagTree, showUnread) {
	if (this._dataTree)
		this._dataTree.removeChangeListener(this._dataChangeListener);
	this._dataTree = tagTree;	
	tagTree.addChangeListener(this._dataChangeListener);
	this._showUnread = showUnread;

	var rootTag = tagTree.root;
	this._treeHash[ZmOrganizer.ID_ROOT] = this._parent;
	this._treeHash[ZmFolder.ID_TAGS] = this._parent;
	
	if (this._parent == this._tree)
		this._tree.clear();
	this._render(this._parent, rootTag);		
}

// Handles tag changes
ZmTagTreeView.prototype._changeListener =
function(ev) {
	ZmTreeView.prototype._changeListener.call(this, ev);
	var fields = ev.getDetail("fields");
	if (ev.event == ZmEvent.E_MODIFY && ((fields && fields[ZmOrganizer.F_COLOR]))) {
		var tag = ev.source;
		var node = this._treeHash[tag.id];
		if (node)
			node.setImage(ZmTag.COLOR_ICON[tag.color]);
	}
}

ZmTagTreeView.prototype._getIcon = 
function(tag) {
	return ZmTag.COLOR_ICON[tag.color];
}
