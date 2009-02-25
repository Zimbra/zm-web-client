/*
 * ***** BEGIN LICENSE BLOCK *****
 *
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2008 Zimbra, Inc.
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

ZmPrefPageTreeController = function() {
	ZmFolderTreeController.apply(this, arguments);
};
ZmPrefPageTreeController.prototype = new ZmTreeController;
ZmPrefPageTreeController.prototype.constructor = ZmPrefPageTreeController;

ZmPrefPageTreeController.prototype.toString = function() {
	return "ZmPrefPageTreeController";
};

//
// Public methods
//

ZmPrefPageTreeController.prototype.show = function(params) {
	var treeView = ZmTreeController.prototype.show.apply(this, arguments);

	// populate tree
	var app = appCtxt.getApp(ZmApp.PREFERENCES);
	var controller = app.getPrefController();
	var view = controller.getPrefsView();

	var tree = new ZmTree(ZmOrganizer.PREF_PAGE);
	var root = tree.root = new ZmPrefPage( { id:ZmId.getPrefPageId(0), name:"", tree:tree } );
	appCtxt.cacheSet(root.id, root);

	// create pseudo-organizers
	var organizers = [];
	var count = view.getNumTabs();
	for (var i = 0; i < count; i++) {
		var tabKey = i+1;
		var name = view.getTabTitle(tabKey);
		var id = ZmId.getPrefPageId(tabKey);
		var section = view.getSectionForTab(tabKey);

		var organizer = new ZmPrefPage({
			id:id, name:name, parent:root, tree:tree, pageId:tabKey,
			icon:section.icon, tooltip: section.description 
		});
		organizers.push(organizer);
	}

	// order pages
	for (var i = 0; i < count; i++) {
		var organizer = organizers[i];
		var section = view.getSectionForTab(organizer.pageId);
		var tabKey = section.parentId && view.getTabForSection(section.parentId);
		var id = tabKey && ZmId.getPrefPageId(tabKey);

		var parent = id ? appCtxt.getById(id) : root;
		parent.children.add(organizer);

		organizer.parent = parent;
		organizer.icon = section.icon || parent.getIcon();
	}

	// setup tree view
	var params = { dataTree:tree, omitParents:true };
	treeView.set(params);

	var page1 = root.children.get(0); 
	if (page1) {
		treeView.setSelected(page1, true);
	}

	// add listeners
	var args = [view, treeView];
	view.addStateChangeListener(new AjxListener(this, this._handleTabStateChange, args));
	treeView.addSelectionListener(new AjxListener(this, this._handleTreeItemSelection, args));

	return treeView;
};

//
// Protected methods
//

// ZmTreeController methods

ZmPrefPageTreeController.prototype._dragListener = function(ev) {
	ev.operation = Dwt.DND_DROP_NONE;
};

ZmPrefPageTreeController.prototype._dropListener = function(ev) {
	ev.doIt = false;
};

// handlers

ZmPrefPageTreeController.prototype._handleTabStateChange = function(tabView, treeView, evt) {
	var tabKey = tabView.getCurrentTab();
	var id = ZmId.getPrefPageId(tabKey);
	var organizer = appCtxt.getById(id);
	if (organizer) {
		treeView.setSelected(organizer, true);
	}
};

ZmPrefPageTreeController.prototype._handleTreeItemSelection = function(tabView, treeView, evt) {
	var organizer = evt.item.getData(Dwt.KEY_OBJECT);
	var pageId = organizer && organizer.pageId;
	if (pageId) {
		tabView.switchToTab(pageId);
	}
};