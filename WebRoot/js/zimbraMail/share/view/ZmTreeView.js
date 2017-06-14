/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016 Synacor, Inc.
 *
 * The contents of this file are subject to the Common Public Attribution License Version 1.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at: https://www.zimbra.com/license
 * The License is based on the Mozilla Public License Version 1.1 but Sections 14 and 15
 * have been added to cover use of software over a computer network and provide for limited attribution
 * for the Original Developer. In addition, Exhibit A has been modified to be consistent with Exhibit B.
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * See the License for the specific language governing rights and limitations under the License.
 * The Original Code is Zimbra Open Source Web Client.
 * The Initial Developer of the Original Code is Zimbra, Inc.  All rights to the Original Code were
 * transferred by Zimbra, Inc. to Synacor, Inc. on September 14, 2015.
 *
 * All portions of the code are Copyright (C) 2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016 Synacor, Inc. All Rights Reserved.
 * ***** END LICENSE BLOCK *****
 */

/**
 * @overview
 */

/**
 * Creates an empty tree view.
 * @class
 * This class displays data in a tree structure.
 *
 * @author Conrad Damon
 * 
 * @param {Hash}	params				the hash of parameters
 * @param {DwtControl}	params.parent				the tree's parent widget
 * @param {constant}	params.type				the organizer type
 * @param {String}	params.className				the CSS class
 * @param {constant}	params.posStyle				the positioning style
 * @param {constant}	params.overviewId			theoverview ID
 * @param {String}	params.headerClass			the CSS class for header item
 * @param {DwtDragSource}	params.dragSrc				the drag source
 * @param {DwtDropTarget}	params.dropTgt				the drop target
 * @param {constant}	params.treeStyle				tree style (see {@link DwtTree})
 * @param {Boolean}	params.isCheckedByDefault	sets the default state of "checked" tree style
 * @param {Hash}	params.allowedTypes			a hash of org types this tree may display
 * @param {Hash}	params.allowedSubTypes		a hash of org types this tree may display below top level
 * @param {boolean}    params.actionSupported     (default to value from Overview if not passed)
 *
 * @extends		DwtTree
 */
ZmTreeView = function(params) {

	if (arguments.length == 0) { return; }

	DwtTree.call(this, {
		parent: params.parent,
		parentElement: params.parentElement,
		style: params.treeStyle,
		isCheckedByDefault: params.isCheckedByDefault,
		className: (params.className || "OverviewTree"),
		posStyle: params.posStyle,
		id: params.id
	});

	this._headerClass = params.headerClass || "overviewHeader";
	this.overviewId = params.overviewId;
	this.type = params.type;
	this.allowedTypes = params.allowedTypes;
	this.allowedSubTypes = params.allowedSubTypes;

	this._overview = appCtxt.getOverviewController().getOverview(this.overviewId);
	
	this._dragSrc = params.dragSrc;
	this._dropTgt = params.dropTgt;

	this.actionSupported = params.actionSupported !== undefined
							? params.actionSupported
							: this._overview.actionSupported;

	this.dynamicWidth = this._overview.dynamicWidth;

	this._dataTree = null;
	this._treeItemHash  = {};	// map organizer to its corresponding tree item by ID
	this._idToOrganizer = {};	// map DwtControl htmlElId to the organizer for external Drag and Drop

};

ZmTreeView.KEY_TYPE	= "_type_";
ZmTreeView.KEY_ID	= "_treeId_";

// compare functions for each type
ZmTreeView.COMPARE_FUNC = {};

ZmTreeView.MAX_ITEMS = 50;

// Static methods

/**
 * Finds the correct position for an organizer within a node, given
 * a sort function.
 *
 * @param {DwtTreeItem}	node			the node under which organizer is to be added
 * @param {ZmOrganizer}	organizer		the organizer
 * @param {function}	sortFunction	the function for comparing two organizers
 * @return	{int}	the index
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

/**
 * Returns a string representation of the object.
 * 
 * @return		{String}		a string representation of the object
 */
ZmTreeView.prototype.toString = 
function() {
	return "ZmTreeView";
};


/**
 * Populates the tree view with the given data and displays it.
 *
 * @param {Hash}	params		a hash of parameters
 * @param   {ZmTree}	params.dataTree		data in tree form
 * @param	{Boolean}	params.showUnread	if <code>true</code>, show unread counts
 * @param	{Hash}	params.omit			a hash of organizer IDs to ignore
 * @param	{Hash}	params.include		a hash of organizer IDs to include
 * @param	{Boolean}	params.omitParents	if <code>true</code>, do NOT insert parent nodes as needed
 * @param	{Hash}	params.searchTypes	the types of saved searches to show
 * @param	{Boolean}	params.noTooltips	if <code>true</code>, don't show tooltips for tree items
 * @param	{Boolean}	params.collapsed		if <code>true</code>, initially leave the root collapsed 
 * @param 	{Hash}          params.optButton        a hash of data for showing a options button in the item: image, tooltip, callback
 */
ZmTreeView.prototype.set =
function(params) {
	this._showUnread = params.showUnread;
	this._dataTree = params.dataTree;
	this._optButton = params.optButton;

	this.clearItems();

	// create header item
	var root = this._dataTree.root;
	var isMultiAcctSubHeader = (appCtxt.multiAccounts && (this.type == ZmOrganizer.SEARCH || this.type == ZmOrganizer.TAG));
	var imageInfo = this._getHeaderTreeItemImage();
	var ti = this._headerItem = new DwtHeaderTreeItem({
		parent:				this,
		className:			isMultiAcctSubHeader ? "DwtTreeItem" : this._headerClass,
		imageInfo:			imageInfo,
		id:					ZmId.getTreeItemId(this.overviewId, null, this.type),
		optButton:			params.optButton,
		dndScrollCallback:	this._overview && this._overview._dndScrollCallback,
		dndScrollId:		this._overview && this._overview._scrollableContainerId
	});
	ti._isHeader = true;
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
	ti.getHtmlElement().style.overflow = "hidden";
	// render the root item's children (ie everything else)
	params.treeNode = ti;
	params.organizer = root;
	this._render(params);
	ti.setExpanded(!params.collapsed, null, true);

	if (!appCtxt.multiAccounts) {
		this.addSeparator();
	}


	if (appCtxt.getSkinHint("noOverviewHeaders") ||
		this._hideHeaderTreeItem())
	{
		ti.setVisible(false, true);
	}
};

/**
 * Gets the tree item that represents the organizer with the given ID.
 *
 * @param {int}		id		an organizer ID
 * @return	{DwtTreeItem}		the item
 */
ZmTreeView.prototype.getTreeItemById =
function(id) {
	return this._treeItemHash[id];
};

/**
 * Gets the tree view's header node.
 * 
 * @return	{DwtHeaderTreeItem}		the item
 */
ZmTreeView.prototype.getHeaderItem =
function() {
	return this._headerItem;
};

/**
 * Gets the currently selected organizer(s). If tree view is checkbox style,
 * return value is an {Array} otherwise, a single {DwtTreeItem} object is returned.
 * 
 * @return	{Array|DwtTreeItem}		the selected item(s)
 */
ZmTreeView.prototype.getSelected =
function() {
	if (this.isCheckedStyle) {
		var selected = [];
		// bug #44805 - iterate thru the entire tree item hash in case there are
		// more than one header items in the tree view (e.g. Imap accounts)
		for (var i in this._treeItemHash) {
			var ti = this._treeItemHash[i];
			if (ti && ti.getChecked()) {
				selected.push(ti.getData(Dwt.KEY_OBJECT));
			}
		}
		return selected;
	} else {
		return (this.getSelectionCount() != 1)
			? null : this.getSelection()[0].getData(Dwt.KEY_OBJECT);
	}
};

/**
 * Selects the tree item for the given organizer.
 *
 * @param {ZmOrganizer}	organizer		the organizer to select, or its ID
 * @param {Boolean}	skipNotify	if <code>true</code>, skip notifications
 * @param {Boolean}	noFocus		if <code>true</code>, select item but don't set focus to it
 */
ZmTreeView.prototype.setSelected =
function(organizer, skipNotify, noFocus) {
	var id = ZmOrganizer.getSystemId((organizer instanceof ZmOrganizer) ? organizer.id : organizer);
	if (!id || !this._treeItemHash[id]) { return; }
	this.setSelection(this._treeItemHash[id], skipNotify, false, noFocus);
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
 * 
 * @private
 */
ZmTreeView.prototype._render =
function(params) {

	params.omit = params.omit || {};
	this._setOmit(params.omit, params.dataTree);

	var org = params.organizer;
	var children = org.children.getArray();
	if (org.isDataSource(ZmAccount.TYPE_IMAP)) {
		children.sort(ZmImapAccount.sortCompare);
	} else if (ZmTreeView.COMPARE_FUNC[this.type]) {
		if (appCtxt.isOffline && this.type == ZmOrganizer.SEARCH) {
			var local = [];
			for (var j = 0; j < children.length; j++) {
				var child = children[j];
				if (child && child.type == ZmOrganizer.SEARCH && !child.isOfflineGlobalSearch) {
					local.push(child);
				}
			}
			children = local;
		}
		// IE loses type info on the children array - the props are there and it can be iterated,
		// but a function call like sort() blows up. So create an array local to child win.
		if (appCtxt.isChildWindow && AjxEnv.isIE) {
			var children1 = [];
			for (var i = 0, len = children.length; i < len; i++) {
				children1.push(children[i]);
			}
			children = children1;
		}
		children.sort(eval(ZmTreeView.COMPARE_FUNC[this.type]));
	}
	DBG.println(AjxDebug.DBG3, "Render: " + org.name + ": " + children.length);
	var addSep = true;
    var addSepForUserFolders = true;
	var numItems = 0;
	var len = children.length;
    if (params.startPos === undefined && params.lastRenderedFolder ){
        for (var i = 0, len = children.length; i < len; i++) {
            if (params.lastRenderedFolder == children[i] ){
               params.startPos = i + 1; // Next to lastRenderedFolder
               break;
            }
        }
        DBG.println(AjxDebug.DBG1, "load remaining folders: " + params.startPos);
    }
	for (var i = params.startPos || 0; i < len; i++) {
		var child = children[i];
		if (!child || (params.omit && params.omit[child.nId])) { continue; }
		if (!(params.include && params.include[child.nId])) {
			if (!this._isAllowed(org, child)) {
				if (params.omitParents) continue;
				var proxy = AjxUtil.createProxy(params);
				proxy.treeNode = null;
				proxy.organizer = child;
				this._render(proxy);
				continue;
			}
		}

		if (child.numTotal == 0 && (child.nId == ZmFolder.ID_SYNC_FAILURES)) {
			continue;
		}

		var parentNode = params.treeNode;
		var account = appCtxt.multiAccounts && child.getAccount();

		// bug: 43067 - reparent calendars for caldav-based accounts
		if (account && account.isCalDavBased() &&
			child.parent.nId == ZmOrganizer.ID_CALENDAR)
		{
			parentNode = parentNode.parent;
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
				var name = AjxMessageFormat.format(ZmMsg.showRemainingFolders, orgs);
				child = new ZmFolder({id:ZmFolder.ID_LOAD_FOLDERS, name:name, parent:org});
				child._tooltip = AjxMessageFormat.format(ZmMsg.showRemainingFoldersTooltip, [(children.length - i), orgs]);
				var ti = this._addNew(parentNode, child);
				ti.enableSelection(true);
				if (this.isCheckedStyle) {
					ti.showCheckBox(false);
				}
                params.lastRenderedFolder  = children[i - 1];
				params.showRemainingFoldersNode = ti;
				child._showFoldersCallback = new AjxCallback(this, this._showRemainingFolders, [params]);
				if (this._dragSrc) {
					// Bug 55763 - expand placeholder on hover; replacing the _dragHover function is the easiest way, if a bit hacky
					ti._dragHover = this._showRemainingFolders.bind(this, params);
				}

				return;
			}
		}

		// NOTE: Separates public and shared folders
		if ((org.nId == ZmOrganizer.ID_ROOT) && child.link && addSep) {
			params.treeNode.addSeparator();
			addSep = false;
		} else if(child.parent.id == ZmOrganizer.ID_ROOT && child.parent.type == ZmOrganizer.FOLDER && !child.link && !child._systemName && addSepForUserFolders) {
            // Add Separator before rendering user folders at root level
            params.treeNode.addSeparator();
            addSepForUserFolders = false;
        }

		this._addNew(parentNode, child, null, params.noTooltips, params.omit);
		numItems++;
	}
};

ZmTreeView.prototype._setOmit =
function(omit, dataTree) {
	for (var id in ZmFolder.HIDE_ID) {
		omit[id] = true;
	}
	//note - the dataTree thing was in the previous code so I keep it, but seems all the ZmFolder.HIDE_NAME code is commented out, so
	//not sure it's still needed.
	dataTree = this.type !== ZmOrganizer.VOICE && dataTree;
	if (!dataTree) {
		return;
	}
	for (var name in ZmFolder.HIDE_NAME) {
		var folder = dataTree.getByName(name);
		if (folder) {
			omit[folder.id] = true;
		}
	}
};

/**
 * a bit complicated and hard to explain - We should only allow (render on this view)
 * a child of an "allowedSubTypes", if all its ancestors are allowed all the way to the root ("Folders"), meaning
 * it has an ancestor that is of the allowedTypes (but is not the root)
 * e.g.
 * allowed:
 * Folders-->folder1--->searchFolder1
 * Folders--->folder1--->folder2--->folder3--->searchFolder1
 *
 * not allowed:
 * Folders-->searchFolder1
 * Folders-->searchFolder1--->searchFolder2
 *
 * @param org
 * @param child
 * @returns {*}
 * @private
 */
ZmTreeView.prototype._isAllowed =
function(org, child) {

	if (!org) { //could happen, for example the Zimlets root doesn't have a parent.
		return true; //seems returning true in this case works... what a mess.
	}

	// Within the Searches tree, only show saved searches that return a type that belongs to this app
	if (this.type === ZmOrganizer.SEARCH && child.type === ZmOrganizer.SEARCH && this._overview.appName) {
		var searchTypes = child.search.types && child.search.types.getArray();
		if (!searchTypes || searchTypes.length === 0) {
			searchTypes = [ ZmItem.MSG ];   // search with no types defaults to "message"
		}
		var common = AjxUtil.intersection(searchTypes,
			ZmApp.SEARCH_TYPES[this._overview.appName] ||  ZmApp.SEARCH_TYPES[appCtxt.getCurrentAppName()]);
		if (common.length === 0) {
			return false;
		}
	}

	if (org.nId == ZmOrganizer.ID_ROOT) {
		return this.allowedTypes[child.type];
	}

	//org is not root
	if (this.allowedTypes[child.type]) {
		return true; //optimization, end the recursion if we find a non root allowed ancestor.
	}

	if (this.allowedSubTypes[child.type]) {
		return this._isAllowed(org.parent, org); //go up parent to see if eventually it's allowed.
	}

	return false;
};

/**
 * Adds a tree item node for the given organizer to the tree, and then adds its children.
 *
 * @param parentNode	[DwtTreeItem]	node under which to add the new one
 * @param organizer		[ZmOrganizer]	organizer for the new node
 * @param index			[int]*			position at which to add the new node
 * @param noTooltips	[boolean]*		if true, don't show tooltips for tree items
 * @param omit			[Object]*		hash of system folder IDs to ignore
 * 
 * @private
 */
ZmTreeView.prototype._addNew =
function(parentNode, organizer, index, noTooltips, omit) {
	var ti;
	var parentControlId;
	// check if we're adding a datasource folder
	var dsColl = (organizer.type == ZmOrganizer.FOLDER) && appCtxt.getDataSourceCollection();
	var dss = dsColl && dsColl.getByFolderId(organizer.nId);
	var ds = (dss && dss.length > 0) ? dss[0] : null;

	if (ds && ds.type == ZmAccount.TYPE_IMAP) {
		var cname = appCtxt.isFamilyMbox ? null : this._headerClass;
		ti = new DwtHeaderTreeItem({
			parent:this,
			text:organizer.getName(),
			className:cname
		});
	} else {
		// create parent chain
		if (!parentNode) {
			var stack = [];
			var parentOrganizer = organizer.parent;
			if (parentOrganizer) {
				while ((parentNode = this.getTreeItemById(parentOrganizer.id)) == null) {
					stack.push(parentOrganizer);
					parentOrganizer = parentOrganizer.parent;
				}
			}
			while (parentOrganizer = stack.pop()) {
				parentNode = this.getTreeItemById(parentOrganizer.parent.id);
				parentControlId = ZmId.getTreeItemId(this.overviewId, parentOrganizer.id);
				parentNode = new DwtTreeItem({
					parent:					parentNode,
					text:					parentOrganizer.getName(),
					imageInfo:				parentOrganizer.getIconWithColor(),
					forceNotifySelection:	true,
					arrowDisabled:			!this.actionSupported,
					dynamicWidth:			this.dynamicWidth,
					dndScrollCallback:		this._overview && this._overview._dndScrollCallback,
					dndScrollId:			this._overview && this._overview._scrollableContainerId,
					id:						parentControlId
				});
				parentNode.setData(Dwt.KEY_ID, parentOrganizer.id);
				parentNode.setData(Dwt.KEY_OBJECT, parentOrganizer);
				parentNode.setData(ZmTreeView.KEY_ID, this.overviewId);
				parentNode.setData(ZmTreeView.KEY_TYPE, parentOrganizer.type);
				this._treeItemHash[parentOrganizer.id] = parentNode;
				this._idToOrganizer[parentControlId] = parentOrganizer.id;
			}
		}
		var params = {
			parent:				parentNode,
			index:				index,
			text:				organizer.getName(this._showUnread),
			arrowDisabled:		!this.actionSupported,
			dynamicWidth:		this.dynamicWidth,
			dndScrollCallback:	this._overview && this._overview._dndScrollCallback,
			dndScrollId:		this._overview && this._overview._scrollableContainerId,
			imageInfo:			organizer.getIconWithColor(),
			id:					ZmId.getTreeItemId(this.overviewId, organizer.id)
		};
		// now add item
		ti = new DwtTreeItem(params);
		this._idToOrganizer[params.id] = organizer.id;
	}

	if (appCtxt.multiAccounts &&
		(organizer.type == ZmOrganizer.SEARCH ||
		 organizer.type == ZmOrganizer.TAG))
	{
		ti.addClassName("DwtTreeItemChildDiv");
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

	// recursively add children
	if (organizer.children && organizer.children.size()) {
		this._render({treeNode:ti, organizer:organizer, omit:omit});
	}

	if (ds && ds.type == ZmAccount.TYPE_IMAP) {
		ti.setExpanded(!appCtxt.get(ZmSetting.COLLAPSE_IMAP_TREES));
	}

	return ti;
};


/**
 * Gets the data (an organizer) from the tree item nearest the one
 * associated with the given ID.
 *
 * @param {int}	id	an organizer ID
 * @return	{Object}	the data or <code>null</code> for none
 */
ZmTreeView.prototype.getNextData =
function(id) {
	var treeItem = this.getTreeItemById(id);
	if(!treeItem || !treeItem.parent) { return null; }

	while (treeItem && treeItem.parent) {
		var parentN = treeItem.parent;
		if (!(parentN instanceof DwtTreeItem)) {
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
function(treeItem, treeItems, i) {
	for (var j = i + 1; j < treeItems.length; j++) {
		var next = treeItems[j];
		if (next && next.getData) {
			return next.getData(Dwt.KEY_OBJECT);
		}
	}
	return null;
};

ZmTreeView.prototype.findPrev =
function(treeItem, treeItems, i) {
	for (var j = i - 1; j >= 0; j--) {
		var prev = treeItems[j];
		if (prev && prev.getData) {
			return prev.getData(Dwt.KEY_OBJECT);
		}
	}
	return null;
};

/**
 * Renders a chunk of tree items, using a timer so that the browser doesn't get overloaded.
 * 
 * @param params	[hash]		hash of params (see _render)
 * 
 * @private
 */
ZmTreeView.prototype._showRemainingFolders =
function(params) {

	if (params.showRemainingFoldersNode){
		params.showRemainingFoldersNode.dispose();
	}

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

ZmTreeView.prototype._getNextTreeItem =
function(next) {
	var nextItem = DwtTree.prototype._getNextTreeItem.apply(this, arguments);
	return nextItem || (this._overview && this._overview._getNextTreeItem(next, this));
};

ZmTreeView.prototype._getFirstTreeItem =
function() {
	if (!this._overview) {
		return DwtTree.prototype._getFirstTreeItem.call(tree);
	}

	var treeids = this._overview.getTreeViews();
	var tree = this._overview.getTreeView(treeids[0]);
	return tree && DwtTree.prototype._getFirstTreeItem.call(tree);
};

ZmTreeView.prototype._getLastTreeItem =
function() {
	if (!this._overview) {
		return DwtTree.prototype._getLastTreeItem.call(tree);
	}

	var treeids = this._overview.getTreeViews();
	var tree = this._overview.getTreeView(treeids[treeids.length - 1]);
	return tree && DwtTree.prototype._getLastTreeItem.call(tree);
};

ZmTreeView.prototype._hideHeaderTreeItem =
function() {
	return (appCtxt.multiAccounts && appCtxt.accountList.size() > 1 &&
			(this.type == ZmOrganizer.FOLDER ||
			 this.type == ZmOrganizer.ADDRBOOK ||
			 this.type == ZmOrganizer.CALENDAR ||
			 this.type == ZmOrganizer.TASKS ||
			 this.type == ZmOrganizer.BRIEFCASE ||
			 this.type == ZmOrganizer.PREF_PAGE ||
			 this.type == ZmOrganizer.ZIMLET));
};

ZmTreeView.prototype._getHeaderTreeItemImage =
function() {
	if (appCtxt.multiAccounts) {
		if (this.type == ZmOrganizer.SEARCH)	{ return "SearchFolder"; }
		if (this.type == ZmOrganizer.TAG)		{ return "TagStack"; }
	}
	return null;
};
