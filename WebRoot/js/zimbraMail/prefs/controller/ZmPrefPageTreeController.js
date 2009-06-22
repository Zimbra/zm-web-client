/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2009 Zimbra, Inc.
 * 
 * The contents of this file are subject to the Yahoo! Public License
 * Version 1.0 ("License"); you may not use this file except in
 * compliance with the License.  You may obtain a copy of the License at
 * http://www.zimbra.com/license.
 * 
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * ***** END LICENSE BLOCK *****
 */

ZmPrefPageTreeController = function() {
	ZmFolderTreeController.apply(this, arguments);
};
ZmPrefPageTreeController.prototype = new ZmTreeController;
ZmPrefPageTreeController.prototype.constructor = ZmPrefPageTreeController;

ZmPrefPageTreeController.prototype.toString =
function() {
	return "ZmPrefPageTreeController";
};

//
// Public methods
//

ZmPrefPageTreeController.prototype.show =
function(params) {
	// populate tree
	var app = appCtxt.getApp(ZmApp.PREFERENCES);
	var view = app.getPrefController().getPrefsView();

	var tree = new ZmTree(ZmOrganizer.PREF_PAGE);
	var root = tree.root = new ZmPrefPage({id:ZmId.getPrefPageId(0), name:"", tree:tree});
	appCtxt.cacheSet(root.id, root);

	// create pseudo-organizers
	var organizers = [];
	var count = view.getNumTabs();
	for (var i = 0; i < count; i++) {
		var tabKey = i+1;
		var name = view.getTabTitle(tabKey);
		var section = view.getSectionForTab(tabKey);

		// for multi-account mbox, child accounts only show a select few pref options
		if (this._showSection(params.account, section.id)) {
			var organizer = ZmPrefPage.createFromSection(section);
			organizer.pageId = tabKey;
			organizer.accountId = params.account && params.account.id;
			organizers.push(organizer);
		}
	}

	// order pages
	for (var i = 0; i < organizers.length; i++) {
		var organizer = organizers[i];
		var section = view.getSectionForTab(organizer.pageId);

		// for multi-account, move the child account prefs under account header
		if (appCtxt.multiAccounts && !params.account.isMain && this._isChildAccountPref(section.id)) {
			section.parentId = null;
		}

		var parent = (section.parentId && tree.getById(ZmId.getPrefPageId(section.parentId))) || root;
		parent.children.add(organizer);

		organizer.parent = parent;
		organizer.icon = section.icon || parent.getIcon();
	}

	appCtxt.setTree(tree.type, tree);

	// setup tree view
	var treeView = ZmTreeController.prototype.show.apply(this, arguments);

	if (!appCtxt.multiAccounts || (appCtxt.multiAccounts && params.account.isMain)) {
		var page1 = root.children.get(0);
		if (page1) {
			treeView.setSelected(page1, true);
		}
	}
	var hi = treeView.getHeaderItem();
	if (hi) {
		hi.setExpanded(true, true);
	}
	treeView.addSelectionListener(new AjxListener(this, this._handleTreeItemSelection, [view, treeView]));

	return treeView;
};

ZmPrefPageTreeController.prototype._showSection =
function(account, sectionId) {
	return (appCtxt.multiAccounts && !account.isMain)
		? this._isChildAccountPref(sectionId) : true;
};

ZmPrefPageTreeController.prototype._isChildAccountPref =
function(sectionId) {
	return (
		sectionId == "SIGNATURES" ||
		sectionId == "ACCOUNTS" ||
		sectionId == "FILTERS" ||
		sectionId == "SHARING"
	);
};

//
// Protected methods
//

// ZmTreeController methods

ZmPrefPageTreeController.prototype._dragListener =
function(ev) {
	ev.operation = Dwt.DND_DROP_NONE;
};

ZmPrefPageTreeController.prototype._dropListener =
function(ev) {
	ev.doIt = false;
};

// handlers

ZmPrefPageTreeController.prototype._handleTreeItemSelection =
function(tabView, treeView, evt) {
	if (evt.detail != DwtTree.ITEM_SELECTED) { return; }

	var organizer = evt.item.getData(Dwt.KEY_OBJECT);
	var pageId = organizer && organizer.pageId;
	if (pageId) {
		tabView.switchToTab(pageId);
	}
};
