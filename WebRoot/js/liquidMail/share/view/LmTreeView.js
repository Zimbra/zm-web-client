/**
* Creates an empty tree view.
* @constructor
* @class
* This class is the base class for trees that display tree data (tags and folders).
*
* @author Conrad Damon
* @param type		tag or folder
* @param appCtxt	the app context
* @param parent		the tree's parent widget
* @param tree		the tree widget
* @param dragSrc	drag source
* @param dropTgt	drop target
*/
function LmTreeView(type, appCtxt, parent, tree, dragSrc, dropTgt) {

	if (arguments.length == 0) return;

	this.type = type;
	this._appCtxt = appCtxt;
	this._tree = tree;
	this._parent = parent;
	this._dragSrc = dragSrc;
	this._dropTgt = dropTgt;
	this._dataTree = null;
	this._restrictedType = null;
	
	this._treeHash = new Object();
	this._evtMgr = new LsEventMgr();
	tree.addDisposeListener(new LsListener(this, this._treeDisposeListener));
	this._dataChangeListener = new LsListener(this, this._changeListener);
	tree.addSelectionListener(new LsListener(this, this._treeSelectionListener));
}

// compare functions for each type
LmTreeView.COMPARE_FUNC = new Object();
LmTreeView.COMPARE_FUNC[LmOrganizer.FOLDER] = LmFolder.sortCompare;
LmTreeView.COMPARE_FUNC[LmOrganizer.TAG] = LmTag.sortCompare;
LmTreeView.COMPARE_FUNC[LmOrganizer.SEARCH] = LmFolder.sortCompare;

LmTreeView.getSortIndex =
function(node, organizer, sortFunction) {
	if (!sortFunction) return null;
	var cnt = node.getItemCount();
	var children = node.getItems();
	for (var i = 0; i < children.length; i++) {
		if (children[i]._isSeparator) continue;
		var child = children[i].getData(Dwt.KEY_OBJECT);
		if (!child) continue;
		var test = sortFunction(organizer, child);
		if (test == -1)
			return i;
	}
	return i;
}

// Public methods

LmTreeView.prototype.set = function() {};

LmTreeView.prototype._getIcon = function() {}

LmTreeView.prototype.toString = 
function() {
	return "LmTreeView";
}

/**
* Returns the tree item that represents the organizer with the given ID.
*
* @param id		an organizer ID
*/
LmTreeView.prototype.getTreeItemById =
function(id) {
	return this._treeHash[id];
}

LmTreeView.prototype.addSelectionListener = 
function(listener) {
	this._evtMgr.addListener(DwtEvent.SELECTION, listener);
}

LmTreeView.prototype.removeSelectionListener = 
function(listener) {
	this._evtMgr.removeListener(DwtEvent.SELECTION, listener);    	
}

/**
* Returns the selected tree item. There can only be one.
*/
LmTreeView.prototype.getSelected =
function() {
	if (this._tree.getSelectionCount() != 1)
		return null;
	return this._tree.getSelection()[0].getData(Dwt.KEY_OBJECT);
}

/**
* Sets the tree item for the given organizer as selected.
*
* @param organizer		the organizer to select
* @param skipNotify		whether to skip notifications
*/
LmTreeView.prototype.setSelected =
function(organizer, skipNotify) {
	if (!organizer || !this._treeHash[organizer.id]) return;
	this._tree.setSelection(this._treeHash[organizer.id], skipNotify);
}

/**
* Makes this tree view visible (or not).
*/
LmTreeView.prototype.setVisible =
function(visible) {
	this._tree.setVisible(visible);
}

// Private and protected methods

// Draws the children of the given node.
LmTreeView.prototype._render =
function(treeNode, organizer, omit) {
	var children = organizer.children.getArray();
	children.sort(LmTreeView.COMPARE_FUNC[this.type]);
	DBG.println(LsDebug.DBG3, "Render: " + organizer.name + ": " + children.length);
	for (var i = 0; i < children.length; i++) {
		var child = children[i];
		if (omit && omit[child.id])
			continue;
		var type = this._restrictedType;
		if (type) {
			if ((type == LmOrganizer.FOLDER && child.type != LmOrganizer.FOLDER) ||
				(type == LmOrganizer.SEARCH && !child.hasSearch()))
				continue;
		}
		this._addNew(treeNode, child, null);
	}
}

// Adds a tree item node to the tree, and then adds its children.
LmTreeView.prototype._addNew =
function(parentNode, newOrganizer, index) {
	var tn = new DwtTreeItem(parentNode, index, newOrganizer.getName(this._showUnread), this._getIcon(newOrganizer));
	tn.setData(Dwt.KEY_ID, newOrganizer.id);
	tn.setData(Dwt.KEY_OBJECT, newOrganizer);
	if (this._dragSrc)
		tn.setDragSource(this._dragSrc);
	if (this._dropTgt)
		tn.setDropTarget(this._dropTgt);
	this._treeHash[newOrganizer.id] = tn;
	if (newOrganizer.addSep)
		parentNode.addSeparator();
	if (newOrganizer.children && newOrganizer.children.size())
		this._render(tn, newOrganizer);
}

// Cleans up when this tree is deleted.
LmTreeView.prototype._treeDisposeListener =
function(ev) {
	// Remove the listener on the model
	if (this._folderTree)
		this._folderTree.removeChangeListener(this._dataChangeListener);
}

// Handles changes to the underlying model.
LmTreeView.prototype._changeListener =
function(ev) {
	if (ev.type != this.type)
		return;
	var organizers = ev.getDetail("organizers");
	if (!organizers && ev.source)
		organizers = [ev.source];
	for (var i = 0; i < organizers.length; i++) {
		var organizer = organizers[i];
		// ignore changes for type not allowed in this tree
		if (this._restrictedType && (organizer.type != this._restrictedType))
			return;
		var id = organizer.id;
		if (id == LmOrganizer.ID_ROOT) // ignore changes to root element, it doesn't appear in tree view
			return;
		var node = this._treeHash[id];
		var parentNode;
		if (organizer.parent)
			parentNode = this._treeHash[organizer.parent.id];
		else
			parentNode = this._parent || this._tree;
		var fields = ev.getDetail("fields");
		if (ev.event == LmEvent.E_FLAGS) {
			var flag = ev.getDetail("flag");
			var state = ev.getDetail("state");
			// handle "Mark All As Read"
			if (node && (flag == LmItem.FLAG_UNREAD) && !state)
				node.setText(organizer.getName(false));
		} else if (ev.event == LmEvent.E_RENAME) {
			if (node) {
				if (parentNode.getNumChildren() == 1) {
					node.setText(organizer.getName(true));
				} else {
					node.dispose();
					var idx = LmTreeView.getSortIndex(parentNode, organizer, LmTreeView.COMPARE_FUNC[organizer.type]);
					this._addNew(parentNode, organizer, idx);
				}
			}
		} else if (ev.event == LmEvent.E_DELETE) {
			if (node) {
				if (id == LmFolder.ID_TRASH || id == LmFolder.ID_SPAM)
					node.setText(organizer.getName(false));
				else
					node.dispose();
			}
		} else if (ev.event == LmEvent.E_CREATE || ev.event == LmEvent.E_MOVE ||
				   (ev.event == LmEvent.E_MODIFY && (fields && fields[LmOrganizer.F_PARENT]))) {
			if (node && (ev.event != LmEvent.E_CREATE))
				node.dispose(); // remove from current parent
			if (parentNode) {
				var idx = LmTreeView.getSortIndex(parentNode, organizer, LmTreeView.COMPARE_FUNC[organizer.type]);
				this._addNew(parentNode, organizer, idx);
				if (parentNode != this._tree)
					parentNode.setExpanded(true);
			}
		} else if (ev.event == LmEvent.E_MODIFY) {
			if (node) {
				if ((fields && fields[LmOrganizer.F_NAME]) || (fields && fields[LmOrganizer.F_UNREAD]) ||
					((id == LmFolder.ID_DRAFTS) && (fields && fields[LmOrganizer.F_TOTAL])))
					node.setText(organizer.getName(true));
				if (parentNode && (parentNode != this._tree))
					parentNode.setExpanded(true);
			}
		}
	}
}

// Handles selection events (both left and right mouse clicks).
LmTreeView.prototype._treeSelectionListener =
function(ev) {
	// Only notify if the node is one of our nodes
	if (ev.item instanceof DwtTreeItem && ev.item.getData(Dwt.KEY_OBJECT))
		this._evtMgr.notifyListeners(DwtEvent.SELECTION, ev);
}
