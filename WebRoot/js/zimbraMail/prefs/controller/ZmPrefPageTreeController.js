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
	var account = params.account;
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

		if (this._showSection(account, section.id)) {
			// for multi-account mbox, child accounts only show a select few pref options
			var organizer = ZmPrefPage.createFromSection(section);
			organizer.pageId = tabKey;
			organizer.accountId = account && account.id;
			organizers.push(organizer);
		}
	}

	// order pages
	for (var i = 0; i < organizers.length; i++) {
		var organizer = organizers[i];
		var section = view.getSectionForTab(organizer.pageId);

		var parent = (section.parentId && tree.getById(ZmId.getPrefPageId(section.parentId))) || root;
		parent.children.add(organizer);

		organizer.parent = parent;
		organizer.icon = section.icon || parent.getIcon();
	}

	appCtxt.setTree(tree.type, tree, account);

	// setup tree view
	var treeView = ZmTreeController.prototype.show.apply(this, arguments);

	if (!appCtxt.multiAccounts || (appCtxt.multiAccounts && account.isMain)) {
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
	if (appCtxt.isOffline) {
		if (account.isMain && (sectionId == "FILTERS")) {
			return false;
		}
	}

	return (account.isMain ||
			(!account.isMain && (sectionId != "GENERAL" &&
								 sectionId != "SHORTCUTS" &&
								 sectionId != "PREF_ZIMLETS" &&
								 sectionId != "IMPORT_EXPORT")
			));
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
