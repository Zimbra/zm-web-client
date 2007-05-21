/*
 * ***** BEGIN LICENSE BLOCK *****
 * Version: ZPL 1.2
 * 
 * The contents of this file are subject to the Zimbra Public License
 * Version 1.2 ("License"); you may not use this file except in
 * compliance with the License. You may obtain a copy of the License at
 * http://www.zimbra.com/license
 * 
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied. See
 * the License for the specific language governing rights and limitations
 * under the License.
 * 
 * The Original Code is: Zimbra Collaboration Suite Web Client
 * 
 * The Initial Developer of the Original Code is Zimbra, Inc.
 * Portions created by Zimbra are Copyright (C) 2005, 2006 Zimbra, Inc.
 * All Rights Reserved.
 * 
 * Contributor(s):
 * 
 * ***** END LICENSE BLOCK *****
 */

/**
* Creates an empty tree view.
* @constructor
* @class
* This class displays data in a tree structure.
*
* @author Conrad Damon
* @param parent				[DwtControl]		the tree's parent widget
* @param type				[constant]			organizer type
* @param className			[string]*			CSS class
* @param posStyle			[constant]*			positioning style
* @param overviewId			[constant]*			overview ID
* @param headerClass		[string]*			CSS class for header item
* @param dragSrc			[DwtDragSource]*	drag source
* @param dropTgt			[DwtDropTarget]*	drop target
* @param treeStyle			[constant]*			tree style (see DwtTree)
* @param allowedTypes		[hash]*				org types this tree may display
* @param allowedSubTypes	[hash]*				org types this tree may display below top level
*/
ZmTreeView = function(params) {

	if (arguments.length == 0) return;

	var className = params.className ? params.className : "OverviewTree";
	var treeStyle = params.treeStyle ? params.treeStyle : DwtTree.SINGLE_STYLE;
	DwtTree.call(this, params.parent, treeStyle, className, params.posStyle);

	this._headerClass = params.headerClass ? params.headerClass : "overviewHeader";
	this.overviewId = params.overviewId;
	this.type = params.type;
	this.allowedTypes = params.allowedTypes;
	this.allowedSubTypes = params.allowedSubTypes;
	
	this._dragSrc = params.dragSrc;
	this._dropTgt = params.dropTgt;

	this._dataTree = null;
	this._treeHash = {};
};

ZmTreeView.KEY_TYPE	= "_type_";
ZmTreeView.KEY_ID	= "_treeId_";

// compare functions for each type
ZmTreeView.COMPARE_FUNC = new Object();
ZmTreeView.COMPARE_FUNC[ZmOrganizer.FOLDER]				= ZmFolder.sortCompare;
ZmTreeView.COMPARE_FUNC[ZmOrganizer.TAG]				= ZmTag.sortCompare;
ZmTreeView.COMPARE_FUNC[ZmOrganizer.SEARCH]				= ZmFolder.sortCompare;

// add space after the following items
ZmTreeView.ADD_SEP = new Object();
ZmTreeView.ADD_SEP[ZmFolder.ID_TRASH] = true;

// Static methods

/**
* Finds the correct position for an organizer within a node, given
* a sort function.
*
* @param node			[DwtTreeItem]	node under which organizer is to be added
* @param organizer		[ZmOrganizer]	organizer
* @param sortFunction	[method]		method for comparing two organizers
*/
ZmTreeView.getSortIndex =
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
};

ZmTreeView.prototype = new DwtTree;
ZmTreeView.prototype.constructor = ZmTreeView;

// Public methods

ZmTreeView.prototype.toString = 
function() {
	return "ZmTreeView";
};

/**
* Populates the tree view with the given data and displays it.
*
* @param dataTree		[ZmTree]		data in tree form
* @param showUnread		[boolean]*		if true, show unread counts
* @param omit			[object]*		hash of organizer IDs to ignore
* @param include		[object]*		hash of organizer IDs to include
* @param searchTypes	[hash]*			types of saved searches to show
*/
ZmTreeView.prototype.set =
function(params) {
	this._showUnread = params.showUnread;
	this._dataTree = params.dataTree;
	var root = this._dataTree.root;
	this._treeHash[ZmOrganizer.ID_ROOT] = root;
	
	this.clear();

	// create header item
	var ti = this._headerItem = new DwtTreeItem(this, null, null, null, null, this._headerClass);
	ti.enableSelection(false); // by default, disallow selection
	var name = ZmMsg[ZmOrganizer.LABEL[this.type]];
	if (name) {
		ti.setText(name);
	}
	ti.setData(Dwt.KEY_ID, root.id);
	ti.setData(Dwt.KEY_OBJECT, root);
	ti.setData(ZmTreeView.KEY_ID, this.overviewId);
	ti.setData(ZmTreeView.KEY_TYPE, this.type);
	if (this._dropTgt) {
		ti.setDropTarget(this._dropTgt);
	}
	this._treeHash[root.id] = ti;
	
	// render the root item's children (ie everything else)
	params.treeNode = ti;
	params.organizer = root;
	this._render(params);
	ti.setExpanded(true);
};

/**
* Returns the tree item that represents the organizer with the given ID.
*
* @param id		[int]	an organizer ID
*/
ZmTreeView.prototype.getTreeItemById =
function(id) {
	return this._treeHash[id];
};

/**
* Returns the tree view's header node
*/
ZmTreeView.prototype.getHeaderItem =
function() {
	return this._headerItem;
};

/**
* Returns the currently selected organizer. There can only be one.
*/
ZmTreeView.prototype.getSelected =
function() {
	if (this.getSelectionCount() != 1)
		return null;
	return this.getSelection()[0].getData(Dwt.KEY_OBJECT);
};

/**
* Selects the tree item for the given organizer.
*
* @param organizer		[ZmOrganizer]	the organizer to select, or its ID
* @param skipNotify		[boolean]*		whether to skip notifications
*/
ZmTreeView.prototype.setSelected =
function(organizer, skipNotify) {
	var id = (organizer instanceof ZmOrganizer) ? organizer.id : organizer;
	if (!id || !this._treeHash[id]) return;
	this.setSelection(this._treeHash[id], skipNotify);
};

// shows/hides checkboxes if treeview is checkbox style
ZmTreeView.prototype.showCheckboxes =
function(show) {
	if (!this._isCheckedStyle())
		return;

	var treeItems = this.getHeaderItem().getItems();
	if (treeItems && treeItems.length) {
		for (var i = 0; i < treeItems.length; i++) {
			var ti = treeItems[i];
			if (ti._isSeparator) continue;
			ti.showCheckBox(show);
			ti.enableSelection(!show);
		}
	}
};


// Private and protected methods

/*
* Draws the children of the given node.
*
* @param treeNode		[DwtTreeItem]	current node
* @param organizer		[ZmOrganizer]	its organizer
* @param omit			[Object]*		hash of organizer IDs to ignore	
* @param include		[object]*		hash of organizer IDs to include
* @param showOrphans	[boolean]*		if true, show parent chain of any
* 										folder of this type, as well as the folder
* @param searchTypes	[hash]*			types of saved searches to show
* 
* TODO: Add logic to support display of folders that are not normally allowed in
* 		this tree, but that have children (orphans) of an allowed type
* TODO: Only sort folders we're showing (requires two passes).
*/
ZmTreeView.prototype._render =
function(params) {
	var org = params.organizer;
	var children = org.children.getArray();
	children.sort(eval(ZmTreeView.COMPARE_FUNC[this.type]));
	DBG.println(AjxDebug.DBG3, "Render: " + org.name + ": " + children.length);
	var addSep = true;
	for (var i = 0; i < children.length; i++) {
		var child = children[i];
		if (params.omit && params.omit[child.id]) { continue; }
		if (!(params.include && params.include[child.id])) {
			var allowed = ((org.id == ZmOrganizer.ID_ROOT) && this.allowedTypes[child.type]) ||
						  ((org.id != ZmOrganizer.ID_ROOT) && this.allowedSubTypes[child.type]);
			if (!allowed) { continue; }
			// if this is a tree view of saved searches, make sure to only show saved searches
			// that are for one of the given types
			if ((child.type == ZmOrganizer.SEARCH) && params.searchTypes && !child._typeMatch(params.searchTypes)) {
				continue;
			}
			if (this._allowedTypes && !this._allowedTypes[child.type]) { continue; }
		}
		// NOTE: Separates public and shared folders
		if (org.id == ZmOrganizer.ID_ROOT && child.link && addSep) {
			params.treeNode.addSeparator();
			addSep = false;
		}
		this._addNew(params.treeNode, child);
	}
};

/*
* Adds a tree item node for the given organizer to the tree, and then adds its children.
*
* @param parentNode	[DwtTreeItem]	node under which to add the new one
* @param organizer	[ZmOrganizer]	organizer for the new node
* @param index		[int]*			position at which to add the new node
*/
ZmTreeView.prototype._addNew =
function(parentNode, organizer, index) {
	var ti = new DwtTreeItem(parentNode, index, organizer.getName(this._showUnread), organizer.getIcon());
	ti.setDndText(organizer.getName());
	ti.setData(Dwt.KEY_ID, organizer.id);
	ti.setData(Dwt.KEY_OBJECT, organizer);
	ti.setData(ZmTreeView.KEY_ID, this.overviewId);
	ti.setData(ZmTreeView.KEY_TYPE, organizer.type);
	var tooltip = organizer.getToolTip();
	if (tooltip) {
		ti.setToolTipContent(tooltip);
	}
	if (this._dragSrc) {
		ti.setDragSource(this._dragSrc);
	}
	if (this._dropTgt) {
		ti.setDropTarget(this._dropTgt);
	}
	this._treeHash[organizer.id] = ti;

	if (ZmTreeView.ADD_SEP[organizer.id]) {
		parentNode.addSeparator();
	}
	// recursively add children
	if (organizer.children && organizer.children.size()) {
		this._render({treeNode:ti, organizer:organizer});
	}

	return ti;
};
