/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2009, 2010 Zimbra, Inc.
 * 
 * The contents of this file are subject to the Zimbra Public License
 * Version 1.3 ("License"); you may not use this file except in
 * compliance with the License.  You may obtain a copy of the License at
 * http://www.zimbra.com/license.
 * 
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * ***** END LICENSE BLOCK *****
 */

/**
 * Creates a preferences page tree controller.
 * @class
 * This class represents the preferences page tree controller.
 * 
 * @extends		ZmTreeController
 */
ZmPrefPageTreeController = function() {
	ZmTreeController.apply(this, arguments);
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

	if (appCtxt.multiAccounts && !this._currentAccount) {
		this._currentAccount = account;
	}

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
		if (!account || this._showSection(account, section.id)) {
			// for multi-account mbox, child accounts only show a select few pref options
			var organizer = ZmPrefPage.createFromSection(section);
			organizer.pageId = tabKey;
			organizer.account = account;
			organizers.push(organizer);
		}
	}

	// order pages
	for (var i = 0; i < organizers.length; i++) {
		var organizer = organizers[i];
		var section = view.getSectionForTab(organizer.pageId);
		var parentId = section.parentId;
		if (appCtxt.isOffline &&
			(section.id == "SIGNATURES" ||
			 section.id == "ACCOUNTS" ||
			 section.id == "COMPOSING" ||
			 section.id == "FILTERS"))
		{
			parentId = null;
		}
		var parent = (parentId && tree.getById(ZmId.getPrefPageId(parentId))) || root;
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
	if (!appCtxt.isOffline) {
		var hi = treeView.getHeaderItem();
		if (hi) {
			hi.setExpanded(true, true);
		}
	}
	treeView.addSelectionListener(new AjxListener(this, this._handleTreeItemSelection, view));

	return treeView;
};

ZmPrefPageTreeController.prototype._showSection =
function(account, sectionId) {

	if (appCtxt.isOffline) {
		if (sectionId == "MOBILE") {
			return false;
		}

		if (account.isMain) {
			if (sectionId == "FILTERS" ||
				sectionId == "SHARING" ||
				sectionId == "SIGNATURES" ||
				sectionId == "ACCOUNTS")
			{
				return false;
			}
		}
		else {
			if (sectionId == "COMPOSING") {
				return false;
			}
			if (!account.isZimbraAccount &&
				(sectionId == "MAIL" ||
				 sectionId == "SHARING" ||
				 sectionId == "CALENDAR"))
			{
				return false;
			}
		}
	}

	return (account.isMain ||
			(!account.isMain && (sectionId != "GENERAL" &&
								 sectionId != "SHORTCUTS" &&
								 sectionId != "PREF_ZIMLETS" &&
								 sectionId != "COMPOSING")
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
function(tabView, ev) {
	if (ev.detail != DwtTree.ITEM_SELECTED || ev.handled) { return; }

	var organizer = ev.item.getData(Dwt.KEY_OBJECT);
	tabView.switchToTab(organizer && organizer.pageId);
};

ZmPrefPageTreeController.prototype._handleMultiAccountItemSelection =
function(ev, overview, treeItem, item) {
	if (this._currentAccount != item.account) {
		var prefsController = appCtxt.getApp(ZmApp.PREFERENCES).getPrefController();
		var prefsView = prefsController.getPrefsView();

		this._currentAccount = prefsController._activeAccount = item.account;

		if (prefsView.getChangedPrefs(true, true)) {
			ev.handled = true;

			var dialog = appCtxt.getYesNoCancelMsgDialog();
			var args = [ev, overview, treeItem, item, prefsController, dialog];
			var yesCallback = new AjxCallback(this, this._savePrefsYes, args);
			var noCallback = new AjxCallback(this, this._savePrefsNo, args);
			var cancelCallback = new AjxCallback(this, this._savePrefsCancel, dialog);

			dialog.reset();
			dialog.setMessage(ZmMsg.confirmExitPreferencesChangeAcct, DwtMessageDialog.WARNING_STYLE);
			dialog.registerCallback(DwtDialog.YES_BUTTON, yesCallback, this);
			dialog.registerCallback(DwtDialog.NO_BUTTON, noCallback, this);
			dialog.registerCallback(DwtDialog.CANCEL_BUTTON, cancelCallback, this);
			dialog.popup();
			return;
		}
		else {
			prefsView.resetOnAccountChange();
		}
	}

	ev.handled = false;
	this._handleItemSelection(ev, overview, treeItem, item);
};

ZmPrefPageTreeController.prototype._savePrefsYes =
function(ev, overview, treeItem, item, prefsController, dialog) {
	dialog.popdown();

	var callback = new AjxCallback(this, this._continueTreeItemSelection, [ev, overview, treeItem, item, prefsController]);
	prefsController.save(callback, true);
};

ZmPrefPageTreeController.prototype._savePrefsNo =
function(ev, overview, treeItem, item, prefsController, dialog) {
	dialog.popdown();

	prefsController.getPrefsView().reset();
	this._continueTreeItemSelection(ev, overview, treeItem, item, prefsController);
};

ZmPrefPageTreeController.prototype._savePrefsCancel =
function(dialog) {
	dialog.popdown();
};

ZmPrefPageTreeController.prototype._continueTreeItemSelection =
function(ev, overview, treeItem, item, prefsController) {
	prefsController.getPrefsView().resetOnAccountChange();

	this._handleItemSelection(ev, overview, treeItem, item);
	prefsController.getPrefsView().switchToTab(item.pageId);
};
