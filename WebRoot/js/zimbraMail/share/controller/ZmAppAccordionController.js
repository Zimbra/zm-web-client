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
 * Creates the accordion controller. Use ZmAppAccordionController.getInstance instead.
 * @constructor
 * @class
 * This class controls the accordion in the overview of most apps.
 *
 * @param type		[constant]		type of organizer we are displaying/controlling
 */

ZmAppAccordionController = function() {
	ZmAccordionController.call(this, ZmAppAccordionController.ID);
}

ZmAppAccordionController.prototype = new ZmAccordionController;
ZmAppAccordionController.prototype.constructor = ZmAppAccordionController;

ZmAppAccordionController.ID = "DefaultOverviewId";

ZmAppAccordionController.getInstance =
function() {
	if (!ZmAppAccordionController._instance) {
		ZmAppAccordionController._instance = new ZmAppAccordionController();
	}
	return ZmAppAccordionController._instance;
};

// Public methods

ZmAppAccordionController.prototype.toString =
function() {
	return "ZmAppAccordionController";
};

/**
 * Returns the ID of the current ZmOverview, if any.
 */
ZmAppAccordionController.prototype.getOverviewId =
function() {
	var account = appCtxt.getActiveAccount() || appCtxt.getMainAccount(true);
	return ([this._accordionId, account.name].join(":"));
};

ZmAppAccordionController.prototype._createAccordion =
function() {
	this._accordion = appCtxt.getOverviewController().createAccordion({accordionId: this._accordionId});
	this._accordion.addListener(DwtEvent.SELECTION, new AjxListener(this, this._accordionSelectionListener));

	// for now, we only care to show tooltip for offline client
	if (appCtxt.isOffline) {
		this._accordion.addListener(DwtEvent.ONMOUSEOVER, new AjxListener(this, this._accordionMouseoverListener));
	}

	// add an accordion item for each account, and create overview for main account
	var accts = appCtxt.getZimbraAccounts();
	this._overview = {};
	for (var i in accts) {
		var data = {};
		var acct = data.account = accts[i];
		if (acct.visible) {
			var params = {
				title: acct.getTitle(),
				data: data,
				icon: acct.getStatusIcon(),
				hideHeader: (appCtxt.isOffline && appCtxt.numVisibleAccounts == 1) || !appCtxt.multiAccounts	// HACK
			};
			var item = this._accordion.addAccordionItem(params);
			acct.itemId = item.id;
			if (appCtxt.getActiveAccount() == acct) {
				//TODO
				this._activateAccordionItem(item);
			}
		}
	}
};

ZmAppAccordionController.prototype._accordionSelectionListener =
function(ev) {
	// before loading the selected account, "unload" the existing one
	appCtxt.getActiveAccount().unload();

	this._expandAccordionItem(ev.detail, true);
	return true;
};

ZmAppAccordionController.prototype._accordionMouseoverListener =
function(ev) {
	if (ev.detail && ev.item) {
		var account = ev.detail.data.account;
		ev.item.setToolTipContent(account.getToolTip());
	}
	return true;
};

ZmAppAccordionController.prototype._expandAccordionItem =
function(accordionItem, byUser, callback) {
	if (accordionItem == this.currentItem) { return; }

	DBG.println(AjxDebug.DBG1, "Accordion switching to item: " + accordionItem.title);

	// hide and clear advanced search since it may have overviews for previous account
	if (appCtxt.get(ZmSetting.BROWSE_ENABLED)) {
		var searchCtlr = appCtxt.getSearchController();
		var bvc = searchCtlr._browseViewController;
		if (bvc) {
			bvc.removeAllPickers();
			bvc.setBrowseViewVisible(false);
		}
	}

	var activeAcct = accordionItem.data.account;

	// enable/disable app tabs based on whether app supports multi-mbox
	var appChooser = appCtxt.getAppController().getAppChooser();
	for (var i = 0; i < ZmApp.APPS.length; i++) {
		var app = ZmApp.APPS[i];
		var b = appChooser.getButton(app);
		if (!b) { continue; }

		if (activeAcct.isMain) {
			b.setEnabled(true);
		} else {
			b.setEnabled(ZmApp.SUPPORTS_MULTI_MBOX[app]);
		}
	}

	var respCallback = new AjxCallback(this, this._handleSetActiveAccount, [accordionItem, byUser, callback]);
	appCtxt.setActiveAccount(activeAcct, respCallback);
};

ZmAppAccordionController.prototype._handleSetActiveAccount =
function(accordionItem, byUser, callback) {
	if (byUser) {
		// reset unread count for all accordion items
		var accounts = appCtxt.getZimbraAccounts();
		var opc = appCtxt.getOverviewController();
		for (var i in accounts) {
			var acct = accounts[i];
			if (acct.visible) {
				opc.updateAccountTitle(acct.itemId, acct.getTitle());
			}
		}
	}

	var ac = appCtxt.getAppController();
	ac.setUserInfo();
	this._activateAccordionItem(accordionItem);
	appCtxt.getCurrentApp()._setMiniCalForActiveAccount(byUser);

	// reset instant notify every time account changes
	if (appCtxt.isOffline) {
		var interval = (AjxEnv.isFirefox2_0up && !AjxEnv.isFirefox3up) ? 10000 : 100;
		AjxTimedAction.scheduleAction(new AjxTimedAction(ac, ac.setInstantNotify, true), interval);

		if (appCtxt.inStartup) {
			// load settings for all accounts
			var accounts = appCtxt.getZimbraAccounts();
			var unloaded = [];
			for (var i in accounts) {
				var acct = accounts[i];
				if (acct.visible && !acct.loaded) {
					unloaded.push(acct);
				}
			}
			if (unloaded.length > 0) {
				this._loadOfflineAccount(unloaded);
			}
		}
	}
};

ZmAppAccordionController.prototype._loadOfflineAccount =
function(accounts) {
	var acct = accounts.shift();
	if (acct) {
		var callback = new AjxCallback(this, this._loadOfflineAccount, [accounts]);
		acct.load(callback);
	}
};

ZmAppAccordionController.prototype._activateAccordionItem =
function(item) {
	this.showOverview(item);
	var app = appCtxt.getCurrentApp();
	if (app) {
		app._activateAccordionItem(item);
	}
};

ZmAppAccordionController.prototype._getOverviewParams =
function() {
	return {
		overviewId:this._accordionId,
		posStyle:Dwt.ABSOLUTE_STYLE,
		selectionSupported:true,
		actionSupported:true,
		dndSupported:true,
		showUnread:true,
		hideEmpty:this._getHideEmpty(),
		treeIds: this._getAllOverviewTrees()
	};
};

ZmAppAccordionController.prototype._getHideEmpty =
function() {
	var hideEmpty = {};
	hideEmpty[ZmOrganizer.SEARCH] = true;
	hideEmpty[ZmOrganizer.ZIMLET] = true;

	return hideEmpty;
};

ZmAppAccordionController.prototype._getAllOverviewTrees =
function() {
	// Get the sorted list of overview trees.
	var array = [];
	for (var id in ZmOverviewController.CONTROLLER) {
		array.push(id);
	}
	var sortFunc = function(a, b) {
		return (ZmOrganizer.DISPLAY_ORDER[a] || 9999) - (ZmOrganizer.DISPLAY_ORDER[b] || 9999);
	};
	array.sort(sortFunc);
	return array;
};

