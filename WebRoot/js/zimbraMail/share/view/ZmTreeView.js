/*
 * ***** BEGIN LICENSE BLOCK *****
 * 
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2004, 2005, 2006, 2007 Zimbra, Inc.
 * 
 * The contents of this file are subject to the Yahoo! Public License
 * Version 1.0 ("License"); you may not use this file except in
 * compliance with the License.  You may obtain a copy of the License at
 * http://www.zimbra.com/license.
 * 
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied.
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
 * 
 * @param params			[hash]				hash of params:
 *        parent			[DwtControl]		the tree's parent widget
 *        type				[constant]			organizer type
 *        className			[string]*			CSS class
 *        posStyle			[constant]*			positioning style
 *        overviewId		[constant]*			overview ID
 *        headerClass		[string]*			CSS class for header item
 *        dragSrc			[DwtDragSource]*	drag source
 *        dropTgt			[DwtDropTarget]*	drop target
 *        treeStyle			[constant]*			tree style (see DwtTree)
 *        allowedTypes		[hash]*				org types this tree may display
 *        allowedSubTypes	[hash]*				org types this tree may display below top level
 */
ZmTreeView = function(params) {

	if (arguments.length == 0) { return; }

	var className = params.className || "OverviewTree";
	var treeStyle = params.treeStyle || DwtTree.SINGLE_STYLE;
	DwtTree.call(this, {parent:params.parent, style:treeStyle, className:className,
						posStyle:params.posStyle, id:params.id});

	this._headerClass = params.headerClass ? params.headerClass : "overviewHeader";
	this.overviewId = params.overviewId;
	this.type = params.type;
	this.allowedTypes = params.allowedTypes;
	this.allowedSubTypes = params.allowedSubTypes;
	
	this._dragSrc = params.dragSrc;
	this._dropTgt = params.dropTgt;

	this._dataTree = null;
	this._treeItemHash = {};	// map organizer to its corresponding tree item by ID
};

ZmTreeView.KEY_TYPE	= "_type_";
ZmTreeView.KEY_ID	= "_treeId_";

// compare functions for each type
ZmTreeView.COMPARE_FUNC = {};

// add space after the following items
ZmTreeView.ADD_SEP = {};
ZmTreeView.ADD_SEP[ZmFolder.ID_TRASH] = true;

ZmTreeView.MAX_ITEMS = 50;

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
		if (test == -1) {
			return i;
		}
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
 * @param params		[hash]			hash of params:
 *        dataTree		[ZmTree]		data in tree form
 *        showUnread	[boolean]*		if true, show unread counts
 *        omit			[object]*		hash of organizer IDs to ignore
 *        include		[object]*		hash of organizer IDs to include
 *        searchTypes	[hash]*			types of saved searches to show
 *        noTooltips	[boolean]*		if true, don't show tooltips for tree items
 *        collapsed		[boolean]*		if true, initially leave the root collapsed
 */
ZmTreeView.prototype.set =
function(params) {
	this._showUnread = params.showUnread;
	this._dataTree = params.dataTree;

	this.clear();

	// create header item
	var root = this._dataTree.root;
	var treeItemId = ZmId.getTreeItemId(this.overviewId, null, this.type);
	var ti = this._headerItem = new DwtTreeItem({parent:this, className:this._headerClass, id:treeItemId});
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
	this._treeItemHash[root.id] = ti;
	
	// render the root item's children (ie everything else)
	params.treeNode = ti;
	params.organizer = root;
	this._render(params);
	ti.setExpanded(!params.collapsed);
	this.addSeparator();
	if (appCtxt.get(ZmSetting.SKIN_HINTS, "noOverviewHeaders")) {
		ti.setVisible(false, true);
	}
};

/**
 * Returns the tree item that represents the organizer with the given ID.
 *
 * @param id		[int]	an organizer ID
 */
ZmTreeView.prototype.getTreeItemById =
function(id) {
	return this._treeItemHash[id];
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
	if (this.getSelectionCount() != 1) { return null; }
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
	var id = (organizer instanceof ZmOrganizer)
		? (ZmOrganizer.getSystemId(organizer.id)) : organizer;
	if (!id || !this._treeItemHash[id]) return;
	this.setSelection(this._treeItemHash[id], skipNotify);
};

/**
 * Shows/hides checkboxes if treeview is checkbox style
 * 
 * @param show	[boolean]	if true, show checkboxes
 */
ZmTreeView.prototype.showCheckboxes =
function(show) {
	if (!this._isCheckedStyle()) { return; }

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

/**
 * Draws the children of the given node.
 *
 * @param params		[hash]			hash of params:
 *        treeNode		[DwtTreeItem]	current node
 *        organizer		[ZmOrganizer]	its organizer
 *        omit			[Object]*		hash of system folder IDs to ignore	
 *        include		[object]*		hash of system folder IDs to include
 *        showOrphans	[boolean]*		if true, show parent chain of any
 * 										folder of this type, as well as the folder
 *        searchTypes	[hash]*			types of saved searches to show
 *        noTooltips	[boolean]*		if true, don't show tooltips for tree items
 *        startPos		[int]*			start rendering this far into list of children
 * 
 * TODO: Add logic to support display of folders that are not normally allowed in
 * 		this tree, but that have children (orphans) of an allowed type
 * TODO: Only sort folders we're showing (requires two passes).
 */
ZmTreeView.prototype._render =
function(params) {
	var org = params.organizer;
	var children = org.children.getArray();
    if (org.isDataSource(ZmAccount.IMAP)) {
		children.sort(ZmImapAccount.sortCompare);
	} else {
		children.sort(eval(ZmTreeView.COMPARE_FUNC[this.type]));
	}
	DBG.println(AjxDebug.DBG3, "Render: " + org.name + ": " + children.length);
	var addSep = true;
	var numItems = 0;
	var len = children.length;
	for (var i = params.startPos || 0; i < len; i++) {
		var child = children[i];
		if (!child || (params.omit && params.omit[child.nId])) { continue; }
		if (!(params.include && params.include[child.nId])) {
			var allowed = ((org.nId == ZmOrganizer.ID_ROOT) && this.allowedTypes[child.type]) ||
						  ((org.nId != ZmOrganizer.ID_ROOT) && this.allowedSubTypes[child.type]);
			if (!allowed) { continue; }
			// if this is a tree view of saved searches, make sure to only show saved searches
			// that are for one of the given types
			if ((child.type == ZmOrganizer.SEARCH) && params.searchTypes && !child._typeMatch(params.searchTypes)) {
				continue;
			}
			if (this._allowedTypes && !this._allowedTypes[child.type]) { continue; }
		}
		
		// if there's a large number of folders to display, make user click on special placeholder
		// to display remainder; we then display them MAX_ITEMS at a time
		if (numItems >= ZmTreeView.MAX_ITEMS) {
			if (params.startPos) {
				// render next chunk
				params.startPos = i;
				params.len = (params.startPos + ZmTreeView.MAX_ITEMS >= len) ? len : 0;	// hint that we're done
				this._showRemainingFolders(params);
				return;
			} else if (numItems >= ZmTreeView.MAX_ITEMS * 2) {
				// add placeholder tree item "Show remaining folders"
				var orgs = ZmMsg[ZmOrganizer.LABEL[this.type]].toLowerCase();
				child = new ZmFolder({id:ZmFolder.ID_LOAD_FOLDERS, name:AjxMessageFormat.format(ZmMsg.showRemainingFolders, orgs)});
				child._tooltip = AjxMessageFormat.format(ZmMsg.showRemainingFoldersTooltip, [(children.length - i), orgs]);
				this._addNew(params.treeNode, child);
				params.startPos = i + 1;
				child._showFoldersCallback = new AjxCallback(this, this._showRemainingFolders, [params]);
				return;
			}
		}
		
		// NOTE: Separates public and shared folders
		if ((org.nId == ZmOrganizer.ID_ROOT) && child.link && addSep) {
			params.treeNode.addSeparator();
			addSep = false;
		}
		this._addNew(params.treeNode, child, null, params.noTooltips);
		numItems++;
	}
};

/**
 * Adds a tree item node for the given organizer to the tree, and then adds its children.
 *
 * @param parentNode	[DwtTreeItem]	node under which to add the new one
 * @param organizer		[ZmOrganizer]	organizer for the new node
 * @param index			[int]*			position at which to add the new node
 * @param noTooltips	[boolean]*		if true, don't show tooltips for tree items
 */
ZmTreeView.prototype._addNew =
function(parentNode, organizer, index, noTooltips) {
	var ti;
	// check if we're adding a datasource folder
	var dss = (organizer.type == ZmOrganizer.FOLDER)
		? appCtxt.getDataSourceCollection().getByFolderId(organizer.nId)
		: null;
	var ds = (dss && dss.length > 0) ? dss[0] : null;

	if (ds && ds.type == ZmAccount.IMAP) {
		ti = new DwtTreeItem({parent:this, text:organizer.getName(), className:this._headerClass});
		ti.enableSelection(false);
	} else {
		ti = new DwtTreeItem({parent:parentNode, index:index, text:organizer.getName(this._showUnread),
							  imageInfo:organizer.getIcon(), id:ZmId.getTreeItemId(this.overviewId, organizer.id)});
	}

	ti.setDndText(organizer.getName());
	ti.setData(Dwt.KEY_ID, organizer.id);
	ti.setData(Dwt.KEY_OBJECT, organizer);
	ti.setData(ZmTreeView.KEY_ID, this.overviewId);
	ti.setData(ZmTreeView.KEY_TYPE, organizer.type);
	if (!noTooltips) {
		var tooltip = organizer.getToolTip();
		if (tooltip) {
			ti.setToolTipContent(tooltip);
		}
	}
	if (this._dragSrc) {
		ti.setDragSource(this._dragSrc);
	}
	if (this._dropTgt) {
		ti.setDropTarget(this._dropTgt);
	}
	this._treeItemHash[organizer.id] = ti;

	if (ZmTreeView.ADD_SEP[organizer.nId]) {
		parentNode.addSeparator();
	}

	// recursively add children
	if (organizer.children && organizer.children.size()) {
		this._render({treeNode:ti, organizer:organizer});
	}

	if (ds && ds.type == ZmAccount.IMAP) {
		ti.setExpanded(true);
	}

	return ti;
};


/**
 * Returns the data (an organizer) from the tree item nearest the one
 * associated with the given ID.
 *
 * @param id	[int]	an organizer ID
 */
ZmTreeView.prototype.getNextData =
function(id) {
	var treeItem = this.getTreeItemById(id);
	if(!treeItem || !treeItem.parent) {	return null; }
	
	while (treeItem && treeItem.parent) {
		var parentN = treeItem.parent;
		if(!(parentN instanceof DwtTreeItem)){
			return null;
		}		
		var treeItems = parentN.getItems();
		var result = null;
		if (treeItems && treeItems.length > 1) {
			for(var i = 0; i < treeItems.length; i++) { 
			    var tmp = treeItems[i]; 
			    if (tmp == treeItem) { 
			    	var nextData = this.findNext(treeItem, treeItems, i);
			    	if (nextData) { return nextData; }
			    	var prevData = this.findPrev(treeItem, treeItems, i);
					if (prevData) {	return prevData; }		    	
				}
			}		
		}
		treeItem = treeItem.parent;
	}
	return null;
};

ZmTreeView.prototype.findNext =
function(treeItem,treeItems,i) {
	for (var j = i + 1; j < treeItems.length; j++){
		var next = treeItems[j];
		if (next && next.getData){		    		
			return next.getData(Dwt.KEY_OBJECT);   		
		}
   	}
	return null;
};

ZmTreeView.prototype.findPrev =
function(treeItem, treeItems, i) {
	for (var j = i - 1; j >= 0; j--) {
		var prev = treeItems[j];
		if (prev && prev.getData){		    		
			return prev.getData(Dwt.KEY_OBJECT);   		
		}
   	}
	return null;
};

/**
 * Renders a chunk of tree items, using a timer so that the browser doesn't get overloaded.
 * 
 * @param params	[hash]		hash of params (see _render)
 */
ZmTreeView.prototype._showRemainingFolders =
function(params) {
	var ti = this.getTreeItemById(ZmFolder.ID_LOAD_FOLDERS);
	if (ti) {
		ti.dispose();
	}
	DBG.println(AjxDebug.DBG1, "load remaining folders: " + params.startPos);
	AjxTimedAction.scheduleAction(new AjxTimedAction(this,
		function() {
			this._render(params);
			if (params.len) {
				var orgs = ZmMsg[ZmOrganizer.LABEL[this.type]].toLowerCase();
				appCtxt.setStatusMsg(AjxMessageFormat.format(ZmMsg.foldersShown, [params.len, orgs]));
				params.len = 0;
			}
		}), 100);
};
