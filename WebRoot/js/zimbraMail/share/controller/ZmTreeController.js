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
 * This file defines a tree controller.
 *
 */

/**
 * Creates a tree controller.
 * @class
 * This class is a base class for controllers for organizers. Those are
 * represented by trees, both as data and visually. This class uses the support provided by
 * {@link ZmOperation}. Each type of organizer has a singleton tree controller which manages all 
 * the tree views of that type.
 *
 * @author Conrad Damon
 * 
 * @param {constant}	type		the type of organizer we are displaying/controlling
 * 
 * @extends	ZmController
 */
ZmTreeController = function(type) {

	if (arguments.length == 0) { return; }

	ZmController.call(this, null);

	this.type = type;
	this._opc = appCtxt.getOverviewController();
	
	// common listeners
	this._listeners = {};
	this._listeners[ZmOperation.DELETE]			            = this._deleteListener.bind(this);
	this._listeners[ZmOperation.DELETE_WITHOUT_SHORTCUT]    = this._deleteListener.bind(this);
	this._listeners[ZmOperation.MOVE]			            = this._moveListener.bind(this);
	this._listeners[ZmOperation.EXPAND_ALL]		            = this._expandAllListener.bind(this);
	this._listeners[ZmOperation.MARK_ALL_READ]	            = this._markAllReadListener.bind(this);
	this._listeners[ZmOperation.SYNC]			            = this._syncListener.bind(this);
	this._listeners[ZmOperation.SYNC_ALL]		            = this._syncAllListener.bind(this);
	this._listeners[ZmOperation.EDIT_PROPS]		            = this._editPropsListener.bind(this);
	this._listeners[ZmOperation.EMPTY_FOLDER]               = this._emptyListener.bind(this);
	this._listeners[ZmOperation.FIND_SHARES]	            = this._findSharesListener.bind(this);
	this._listeners[ZmOperation.OPEN_IN_TAB]                = this._openInTabListener.bind(this);

	// drag-and-drop
	this._dragSrc = new DwtDragSource(Dwt.DND_DROP_MOVE);
	this._dragSrc.addDragListener(this._dragListener.bind(this));
	this._dropTgt = new DwtDropTarget(ZmTreeController.DROP_SOURCES[type]);
	this._dropTgt.addDropListener(this._dropListener.bind(this));

	this._treeView = {};	// hash of tree views of this type, by overview ID
	this._hideEmpty = {};	// which tree views to hide if they have no data
	this._dataTree = {};	// data tree per account

	this._treeSelectionShortcutDelay = ZmTreeController.TREE_SELECTION_SHORTCUT_DELAY;
};

ZmTreeController.prototype = new ZmController;
ZmTreeController.prototype.constructor = ZmTreeController;

ZmTreeController.COLOR_CLASS = {};
ZmTreeController.COLOR_CLASS[ZmOrganizer.C_ORANGE]	= "OrangeBg";
ZmTreeController.COLOR_CLASS[ZmOrganizer.C_BLUE]	= "BlueBg";
ZmTreeController.COLOR_CLASS[ZmOrganizer.C_CYAN]	= "CyanBg";
ZmTreeController.COLOR_CLASS[ZmOrganizer.C_GREEN]	= "GreenBg";
ZmTreeController.COLOR_CLASS[ZmOrganizer.C_PURPLE]	= "PurpleBg";
ZmTreeController.COLOR_CLASS[ZmOrganizer.C_RED]		= "RedBg";
ZmTreeController.COLOR_CLASS[ZmOrganizer.C_YELLOW]	= "YellowBg";
ZmTreeController.COLOR_CLASS[ZmOrganizer.C_PINK]	= "PinkBg";
ZmTreeController.COLOR_CLASS[ZmOrganizer.C_GRAY]	= "Gray";	// not GrayBg so it doesn't blend in

// time that selection via up/down arrow must remain on an item to trigger a search
ZmTreeController.TREE_SELECTION_SHORTCUT_DELAY = 750;

// valid sources for drop target for different tree controllers
ZmTreeController.DROP_SOURCES = {};

// interval of retrying empty folder (seconds)
ZmTreeController.EMPTY_FOLDER_RETRY_INTERVAL = 5;

// the maximum number of trials of empty folder
ZmTreeController.EMPTY_FOLDER_MAX_TRIALS = 6;

// Abstract protected methods

// Enables/disables operations based on the given organizer ID
ZmTreeController.prototype.resetOperations = function() {};

// Returns a list of desired header action menu operations
ZmTreeController.prototype._getHeaderActionMenuOps = function() {};

// Returns a list of desired action menu operations
ZmTreeController.prototype._getActionMenuOps = function() {};

// Returns the dialog for organizer creation
ZmTreeController.prototype._getNewDialog = function() {};

// Returns the dialog for renaming an organizer
ZmTreeController.prototype._getRenameDialog = function() {};

// Method that is run when a tree item is left-clicked
ZmTreeController.prototype._itemClicked = function() {};

// Method that is run when a tree item is dbl-clicked
ZmTreeController.prototype._itemDblClicked = function() {};

// Handles a drop event
ZmTreeController.prototype._dropListener = function() {};

// Returns an appropriate title for the "Move To" dialog
ZmTreeController.prototype._getMoveDialogTitle = function() {};

/**
 * @private
 */
ZmTreeController.prototype._resetOperation =
function(parent, id, text, image, enabled, visible) {
	var op = parent && parent.getOp(id);
	if (!op) return;

	if (text) op.setText(text);
	if (image) op.setImage(image);
	if (enabled != null) op.setEnabled(enabled);
	if (visible != null) op.setVisible(visible);
};

/**
 * @private
 */
ZmTreeController.prototype._resetButtonPerSetting =
function(parent, op, isSupported) {
	var button = parent.getOp(op);
	if (button) {
		if (isSupported) {
			button.setVisible(true);
			if (appCtxt.isOffline && !appCtxt.getActiveAccount().isZimbraAccount) {
				button.setEnabled(false);
			}
		} else {
			button.setVisible(false);
		}
	}
};

ZmTreeController.prototype._enableRecoverDeleted =
function (parent, isTrash) {
	op = parent.getOp(ZmOperation.RECOVER_DELETED_ITEMS);
	if (!op) {
		return;
	}
	var featureEnabled = appCtxt.get(ZmSetting.DUMPSTER_ENABLED);
	op.setVisible(featureEnabled && isTrash);
	op.setEnabled(isTrash);
};

ZmTreeController.prototype._findSharesListener =
function(ev) {
	var folder = this._getActionedOrganizer(ev);
	var account = folder.getAccount();

	if (appCtxt.multiAccounts && account && account.isZimbraAccount) {
		appCtxt.accountList.setActiveAccount(account);
	}
	var dialog = appCtxt.getShareSearchDialog();
	var addCallback = this._handleAddShare.bind(this);
	dialog.popup(folder.type, addCallback);
};

ZmTreeController.prototype._handleAddShare = function () {
	var dialog = appCtxt.getShareSearchDialog();
	var shares = dialog.getShares();
	dialog.popdown();
	if (shares.length === 0) {
		return;
	}

	AjxDispatcher.require("Share");
	var requests = [];
	for (var i = 0; i < shares.length; i++) {
		var share = shares[i];
		requests.push({
			_jsns: "urn:zimbraMail",
			link: {
				l: ZmOrganizer.ID_ROOT,
				name: share.defaultMountpointName,
				view: share.view,
				zid: share.ownerId,
				rid: share.folderId
			}
		});
	}

	var params = {
		jsonObj: {
			BatchRequest: {
				_jsns: "urn:zimbra",
				CreateMountpointRequest: requests
			}
		},
		asyncMode: true
	};
	appCtxt.getAppController().sendRequest(params);
};

// Opens a view of the given organizer in a search tab
ZmTreeController.prototype._openInTabListener = function(ev) {
	this._itemClicked(this._getActionedOrganizer(ev), true);
};





// Public methods

/**
 * Returns a string representation of the object.
 * 
 * @return		{String}		a string representation of the object
 */
ZmTreeController.prototype.toString =
function() {
	return "ZmTreeController";
};

/**
 * Displays the tree of this type.
 *
 * @param {Hash}	params		a hash of parameters
 * @param	{constant}	params.overviewId		the overview ID
 * @param	{Boolean}	params.showUnread		if <code>true</code>, unread counts will be shown
 * @param	{Object}	params.omit				a hash of organizer IDs to ignore
 * @param	{Object}	params.include			a hash of organizer IDs to include
 * @param	{Boolean}	params.forceCreate		if <code>true</code>, tree view will be created
 * @param	{String}	params.app				the app that owns the overview
 * @param	{Boolean}	params.hideEmpty		if <code>true</code>, don't show header if there is no data
 * @param	{Boolean}	params.noTooltips	if <code>true</code>, don't show tooltips for tree items
 */
ZmTreeController.prototype.show =
function(params) {
	var id = params.overviewId;
	this._hideEmpty[id] = params.hideEmpty;

	if (!this._treeView[id] || params.forceCreate) {
		this._treeViewCreated = false;
		this._treeView[id] = null;
		this._treeView[id] = this.getTreeView(id, true);
	}

	// bug fix #24241 - for offline, zimlet tree is re-used across accounts
	var isMultiAccountZimlet = (appCtxt.multiAccounts && this.type == ZmOrganizer.ZIMLET);
	var account = isMultiAccountZimlet
		? appCtxt.accountList.mainAccount
		: (this.type == ZmOrganizer.VOICE ? id : params.account); // HACK for voice app
	var dataTree = this.getDataTree(account);

	if (dataTree) {
		params.dataTree = dataTree;
		var setting = ZmOrganizer.OPEN_SETTING[this.type];
		params.collapsed = (!isMultiAccountZimlet && (!(!setting || (appCtxt.get(setting, null, account) !== false)))); // yikes!

		var overview = this._opc.getOverview(id);

		if (overview && overview.showNewButtons && this.type != ZmOrganizer.ZIMLET && this.type != ZmId.ORG_PREF_PAGE ) { 
			this._setupOptButton(params);
		}

		this._treeView[id].set(params);
		this._checkTreeView(id);
	}

	if (!this._treeViewCreated) {
		this._treeViewCreated = true;
		this._postSetup(id, params.account);
	}
	return this._treeView[id];
};

/**
 * Gets the tree view for the given overview.
 *
 * @param {constant}	overviewId	the overview ID
 * @param {Boolean}	force			if <code>true</code>, force tree view creation
 * @return	{ZmTreeView}		the tree view
 */
ZmTreeController.prototype.getTreeView =
function(overviewId, force) {
	// TODO: What side-effects will this have in terms of the _postSetup???
	if (force && !this._treeView[overviewId]) {
		this._treeView[overviewId] = this._setup(overviewId);
	}
	return this._treeView[overviewId];
};

/**
 * Clears the tree view for the given overview.
 *
 * @param {constant}		overviewId		the overview ID
 *
 */
ZmTreeController.prototype.clearTreeView =
function(overviewId) {
	// TODO: remove change listener if last tree view cleared
	if (this._treeView[overviewId]) {
		this._treeView[overviewId].dispose();
		delete this._treeView[overviewId];
	}
};

/**
 * Gets the controller drop target.
 * 
 * @return	{DwtDropTarget}	the drop target
 */
ZmTreeController.prototype.getDropTarget =
function() {
	return this._dropTgt;
};

/**
 * Gets the data tree.
 * 
 * @param	{ZmZimbraAccount}	account		the account
 * @return	{Object}	the data tree
 */
ZmTreeController.prototype.getDataTree =
function(account) {
	account = account || appCtxt.getActiveAccount();
	var dataTree = this._dataTree[account.id];
	if (!dataTree) {
		dataTree = this._dataTree[account.id] = appCtxt.getTree(this.type, account);
		if (dataTree) {
			dataTree.addChangeListener(this._getTreeChangeListener());
		}
	}
	return dataTree;
};

/**
 * Dispose of this controller. Removes the tree change listener.
 * called when ZmComposeController is disposed (new window).
 * If the change listener stayed we would get exceptions since this window will no longer exist.
 *
 */
ZmTreeController.prototype.dispose =
function() {
	var account = appCtxt.getActiveAccount();
	var dataTree = this._dataTree[account.id];
	if (!dataTree) {
		return;
	}
	dataTree.removeChangeListener(this._getTreeChangeListener());
};



ZmTreeController.prototype.setVisibleIfExists =
function(parent, opId, visible) {
	var op = parent.getOp(opId);
	if (!op) {
		return;
	}
	op.setVisible(visible);
};

// Private and protected methods

/**
 * Sets up the params for the new button in the header item
 *
 * @param {Hash}	params		a hash of parameters
 * 
 * @private
 */
ZmTreeController.prototype._setupOptButton =
function(params) {
	var tooltipKey = ZmOperation.getProp(ZmOperation.OPTIONS, "tooltipKey");
	params.optButton = {
		image: ZmOperation.getProp(ZmOperation.OPTIONS, "image"),
		tooltip: tooltipKey ? ZmMsg[tooltipKey] : null,
		callback: new AjxCallback(this, this._dispOpts)
	};
};

/**
 * Shows options for header item
 *
 * @param {Hash}	params		a hash of parameters
 * 
 * @private
 */

ZmTreeController.prototype._dispOpts =
function(ev){

	var treeItem = ev.dwtObj;

       var type = treeItem && treeItem.getData(ZmTreeView.KEY_TYPE);
       if (!type) { return; }

       var actionMenu = this._getHeaderActionMenu(ev);
       if (actionMenu) {
		actionMenu.popup(0, ev.docX, ev.docY);
	}
};

ZmTreeController.prototype._getTreeChangeListener =
function() {
	if (!this._dataChangeListener) {
		this._dataChangeListener = appCtxt.isChildWindow ? AjxCallback.simpleClosure(this._treeChangeListener, this) : new AjxListener(this, this._treeChangeListener);
	}
	return this._dataChangeListener;
};

/**
 * Performs initialization.
 *
 * @param overviewId		[constant]	overview ID
 */
ZmTreeController.prototype._setup =
function(overviewId) {
	var treeView = this._initializeTreeView(overviewId);
	if (this._opc.getOverview(overviewId).actionSupported) {
		this._initializeActionMenus();
	}
	return treeView;
};

/**
 * Performs any little fixups after the tree view is first created
 * and shown.
 *
 * @param {constant}	overviewId		the overview ID
 * @param {ZmZimbraAccount}	account			the current account
 * 
 * @private
 */
ZmTreeController.prototype._postSetup =
function(overviewId, account) {

	var treeView = this.getTreeView(overviewId);
	if (!treeView.isCheckedStyle && !ZmOrganizer.HAS_COLOR[this.type]) { return; }

	var rootId = ZmOrganizer.getSystemId(ZmOrganizer.ID_ROOT, account);
	var rootTreeItem = treeView.getTreeItemById(rootId);
	if (!rootTreeItem) { return; }
	if (treeView.isCheckedStyle) {
		rootTreeItem.showCheckBox(false);
	}
	var treeItems = rootTreeItem.getItems();
	for (var i = 0; i < treeItems.length; i++) {
		this._fixupTreeNode(treeItems[i], null, treeView, true);
	}
};

/**
 * Takes care of the tree item's color and/or checkbox.
 *
 * @param {DwtTreeItem}	treeItem	the tree item
 * @param {ZmOrganizer}	organizer	the organizer it represents
 * @param {ZmTreeView}	treeView	the tree view this organizer belongs to
 * 
 * @private
 */
ZmTreeController.prototype._fixupTreeNode =
function(treeItem, organizer, treeView, skipNotify) {
	if (treeItem._isSeparator) { return; }
	organizer = organizer || treeItem.getData(Dwt.KEY_OBJECT);
	if (organizer) {
		if (ZmOrganizer.HAS_COLOR[this.type]) {
			this._setTreeItemColor(treeItem, organizer);
		}
		if (treeView.isCheckedStyle) {
			if ((organizer.type == this.type && treeView.isCheckedStyle) ||
                organizer.nId == ZmOrganizer.ID_TRASH || organizer.nId == ZmOrganizer.ID_DRAFTS) {
				treeItem.setChecked(organizer.isChecked, true);
			} else {
				treeItem.showCheckBox(false);
				treeItem.enableSelection(true);
			}
		}

		// set expand state per user's prefs
		this._expandTreeItem(treeItem, skipNotify);
	}
    var treeItems = treeItem.getItems();
    for (var i = 0; i < treeItems.length; i++) {
        this._fixupTreeNode(treeItems[i], null, treeView, skipNotify);
    }
};

ZmTreeController.prototype._expandTreeItem =
function(treeItem, skipNotify) {
    var expanded = appCtxt.get(ZmSetting.FOLDERS_EXPANDED);
	var folderId = treeItem.getData(Dwt.KEY_ID);
	var parentTi = treeItem.parent;

	// only expand if the parent is also expanded
	if (expanded[folderId] &&
		parentTi && (parentTi instanceof DwtTreeItem) && parentTi.getExpanded())
	{
		treeItem.setExpanded(true, null, skipNotify);
	}
};

ZmTreeController.prototype._expandTreeItems =
function(treeItem) {
	if (treeItem._isSeparator) { return; }

	this._expandTreeItem(treeItem);

	// recurse!
	var treeItems = treeItem.getItems();
	for (var i = 0; i < treeItems.length; i++) {
		this._expandTreeItems(treeItems[i]);
	}
};

/**
 * Sets the background color of the tree item.
 *
 * @param treeItem	[DwtTreeItem]		tree item
 * @param organizer	[ZmOrganizer]		organizer it represents
 */
ZmTreeController.prototype._setTreeItemColor =
function(treeItem, organizer) {
	treeItem.setImage(organizer.getIconWithColor());
};

ZmTreeController.prototype._getTreeItemColorClassName =
function(treeItem, organizer) {
	if (!treeItem || !organizer) { return null; }
	if (organizer.isInTrash()) { return null; }

	// a color value of 0 means DEFAULT
	var color = organizer.color
		? organizer.color
		: ZmOrganizer.DEFAULT_COLOR[organizer.type];

	return (color && (color != ZmOrganizer.C_NONE))
		? ZmTreeController.COLOR_CLASS[color] : "";
};

/**
 * Lazily creates a tree view of this type, using options from the overview.
 *
 * @param {constant}	overviewId		the overview ID
 * 
 * @private
 */
ZmTreeController.prototype._initializeTreeView =
function(overviewId) {
	var overview = this._opc.getOverview(overviewId);
	var params = {
		parent: overview,
		parentElement: overview.getTreeParent(this.type),
		overviewId: overviewId,
		type: this.type,
		headerClass: overview.headerClass,
		dragSrc: (overview.dndSupported ? this._dragSrc : null),
		dropTgt: (overview.dndSupported ? this._dropTgt : null),
		treeStyle: overview.treeStyle,
		isCheckedByDefault: overview.isCheckedByDefault,
		allowedTypes: this._getAllowedTypes(),
		allowedSubTypes: this._getAllowedSubTypes()
	};
	params.id = ZmId.getTreeId(overviewId, params.type);
	if (params.type && params.type.match(/TASK|ADDRBOOK|FOLDER|BRIEFCASE|CALENDAR|PREF_PAGE/) && 
			(!params.headerClass || params.headerClass == "overviewHeader")){
		params.headerClass = "FirstOverviewHeader overviewHeader";
	}
	var treeView = this._createTreeView(params);
	treeView.addSelectionListener(new AjxListener(this, this._treeViewListener));
	treeView.addTreeListener(new AjxListener(this, this._treeListener));

	return treeView;
};

/**
 * @private
 */
ZmTreeController.prototype._createTreeView =
function(params) {
	return new ZmTreeView(params);
};

/**
 * Creates up to two action menus, one for the tree view's header item, and
 * one for the rest of the items. Note that each of these two menus is a
 * singleton, shared among the tree views of this type.
 * 
 * @private
 */
ZmTreeController.prototype._initializeActionMenus =
function() {
	var obj = this;
	var func = this._createActionMenu;

	var ops = this._getHeaderActionMenuOps();
	if (!this._headerActionMenu && ops) {
		var args = [this._shell, ops];
		this._headerActionMenu = new AjxCallback(obj, func, args);
	}
	var ops = this._getActionMenuOps();
	if (!this._actionMenu && ops) {
		var args = [this._shell, ops];
		this._actionMenu = new AjxCallback(obj, func, args);
	}
};

/**
 * Instantiates the header action menu if necessary.
 * 
 * @private
 */
ZmTreeController.prototype._getHeaderActionMenu =
function(ev) {
	if (this._headerActionMenu instanceof AjxCallback) {
		var callback = this._headerActionMenu;
		this._headerActionMenu = callback.run();
	}
	return this._headerActionMenu;
};

/**
 * Instantiates the action menu if necessary.
 * 
 * @private
 */
ZmTreeController.prototype._getActionMenu =
function(ev, item) {
    var controller = this;

    // special case - search folder. might have moved under a regular folder  
    if (item && item.type == ZmOrganizer.SEARCH) {
        controller = this._opc.getTreeController(ZmOrganizer.SEARCH);
    }

	if (controller._actionMenu instanceof AjxCallback) {
		var callback = controller._actionMenu;
		controller._actionMenu = callback.run();
	}
	return controller._actionMenu;
};

/**
 * Creates and returns an action menu, and sets its listeners.
 *
 * @param {DwtControl}	parent		the menu parent widget
 * @param {Array}	menuItems		the list of menu items
 * 
 * @private
 */
ZmTreeController.prototype._createActionMenu =
function(parent, menuItems) {
	if (!menuItems) return;

	var map = appCtxt.getCurrentController() && appCtxt.getCurrentController().getKeyMapName();
	var id = map ? ("ZmActionMenu_" + map):Dwt.getNextId("ZmActionMenu_")
	id = (map && this.type) ? id + "_" + this.type : id;
	var actionMenu = new ZmActionMenu({parent:parent, menuItems:menuItems, id: id});

	menuItems = actionMenu.opList;
	for (var i = 0; i < menuItems.length; i++) {
		var menuItem = menuItems[i];
		if (this._listeners[menuItem]) {
			actionMenu.addSelectionListener(menuItem, this._listeners[menuItem]);
		}
	}
	actionMenu.addPopdownListener(new AjxListener(this, this._menuPopdownActionListener));

	return actionMenu;
};

/**
 * Determines which types of organizer may be displayed at the top level. By default,
 * the tree shows its own type.
 * 
 * @private
 */
ZmTreeController.prototype._getAllowedTypes =
function() {
	var types = {};
	types[this.type] = true;
	return types;
};

/**
 * Determines which types of organizer may be displayed below the top level. By default,
 * the tree shows its own type.
 * 
 * @private
 */
ZmTreeController.prototype._getAllowedSubTypes =
function() {
	var types = {};
	types[this.type] = true;
	return types;
};

// Actions

/**
 * Creates a new organizer and adds it to the tree of that type.
 *
 * @param {Hash}	params	a hash of parameters
 * @param {constant}	params.type		the type of organizer
 * @param {ZmOrganizer}	params.parent	parent of the new organizer
 * @param {String}	params.name		the name of the new organizer
 *        
 * @private
 */
ZmTreeController.prototype._doCreate =
function(params) {
	params.type = this.type;
	var funcName = ZmOrganizer.CREATE_FUNC[this.type];
	if (funcName) {
		var func = eval(funcName);
		return func(params);
	}
};

/**
 * Deletes an organizer and removes it from the tree.
 *
 * @param {ZmOrganizer}	organizer		the organizer to delete
 */
ZmTreeController.prototype._doDelete =
function(organizer) {
	organizer._delete();
};

/**
 * 
 * @param {ZmOrganizer}	organizer		the organizer
 * @param {int}	trialCounter		the number of trials of empty folder
 * @param {AjxException}	ex		the exception
 *
 * @private
 */
ZmTreeController.prototype._doEmpty =
function(organizer, trialCounter, ex) {
	var recursive = false;
	var timeout = ZmTreeController.EMPTY_FOLDER_RETRY_INTERVAL;
	var noBusyOverlay = true;
	if (!trialCounter) {
		trialCounter = 1;
	}
	var errorCallback = this._doEmptyErrorHandler.bind(this, organizer, trialCounter);
	organizer.empty(recursive, null, this._doEmptyHandler.bind(this, organizer), timeout, errorCallback, noBusyOverlay);
};

/**
 *
 * @param {ZmOrganizer}	organizer		the organizer
 * @param {int}	trialCounter		the number of trials of empty folder
 * @param {AjxException}	ex		the exception
 *
 * @private
 */
ZmTreeController.prototype._doEmptyErrorHandler =
function(organizer, trialCounter, ex) {
	if (ex) {
		if (ex.code == ZmCsfeException.SVC_ALREADY_IN_PROGRESS) {
			appCtxt.setStatusMsg(ZmMsg.emptyFolderAlreadyInProgress);
			return true;
		} else if(ex.code != AjxException.CANCELED) {
			return false;
		}
	}

	if (trialCounter > ZmTreeController.EMPTY_FOLDER_MAX_TRIALS -1){
		appCtxt.setStatusMsg(ZmMsg.emptyFolderNoResponse, ZmStatusView.LEVEL_CRITICAL);
		return true;
	}
	trialCounter++;
	this._doEmpty(organizer, trialCounter);
};

ZmTreeController.prototype._doEmptyHandler =
function(organizer) {
	appCtxt.setStatusMsg({msg: AjxMessageFormat.format(ZmMsg.folderEmptied, organizer.getName())});
	var ctlr = appCtxt.getCurrentController();
	if (!ctlr || !ctlr._getSearchFolderId || !ctlr.getListView) {
		return;
	}
	var folderId = ctlr._getSearchFolderId();
	if (folderId !== organizer.id) {
		return;
	}
	var view = ctlr.getListView();
	view._resetList();
	view._setNoResultsHtml();
};

/**
 * Renames an organizer.
 *
 * @param {ZmOrganizer}	organizer	the organizer to rename
 * @param {String}	name		the new name of the organizer
 * 
 * @private
 */
ZmTreeController.prototype._doRename =
function(organizer, name) {
	organizer.rename(name);
};

/**
 * Moves an organizer to a new folder.
 *
 * @param {ZmOrganizer}	organizer	the organizer to move
 * @param {ZmFolder}	folder		the target folder
 * 
 * @private
 */
ZmTreeController.prototype._doMove =
function(organizer, folder) {
	organizer.move(folder);
};

/**
 * Marks an organizer's items as read.
 *
 * @param {ZmOrganizer}	organizer	the organizer
 * 
 * @private
 */
ZmTreeController.prototype._doMarkAllRead =
function(organizer) {
	organizer.markAllRead();
};

/**
 * Syncs an organizer to its feed (URL).
 *
 *  @param {ZmOrganizer}	organizer	the organizer
 *  
 *  @private
 */
ZmTreeController.prototype._doSync =
function(organizer) {
	organizer.sync();
};

// Listeners

/**
 * Handles left and right mouse clicks. A left click generates a selection event.
 * If selection is supported for the overview, some action (typically a search)
 * will be performed. A right click generates an action event, which pops up an
 * action menu if supported.
 *
 * @param {DwtUiEvent}	ev		the UI event
 * 
 * @private
 */
ZmTreeController.prototype._treeViewListener = function(ev) {

	if (ev.detail !== DwtTree.ITEM_ACTIONED && ev.detail !== DwtTree.ITEM_SELECTED && ev.detail !== DwtTree.ITEM_DBL_CLICKED) {
		return;
	}

	var treeItem = ev.item;

	var type = treeItem.getData(ZmTreeView.KEY_TYPE);
	if (!type) {
        return;
    }

	var item = treeItem.getData(Dwt.KEY_OBJECT);
	if (item) {
		this._actionedOrganizer = item;
		if (item.noSuchFolder) {
			var folderTree = appCtxt.getFolderTree();
			if (folderTree) {
				folderTree.handleDeleteNoSuchFolder(item);
			}
			return;
		}
        if (item && item.type === ZmOrganizer.SEARCH) {
            var controller = this._opc.getTreeController(ZmOrganizer.SEARCH);
            if (controller) {
                controller._actionedOrganizer = item;
                controller._actionedOverviewId = treeItem.getData(ZmTreeView.KEY_ID);
            }
        }
	}

	var id = treeItem.getData(Dwt.KEY_ID);
	var overviewId = this._actionedOverviewId = treeItem.getData(ZmTreeView.KEY_ID);
	var overview = this._opc.getOverview(overviewId);
	if (!overview) {
        return;
    }

	if (ev.detail === DwtTree.ITEM_ACTIONED) {
		// right click
		if (overview.actionSupported) {
			var actionMenu = this.getItemActionMenu(ev, item);
			if (actionMenu) {
				this.resetOperations(actionMenu, type, id);
				actionMenu.popup(0, ev.docX, ev.docY);
			}
		}
	}
    else if ((ev.detail === DwtTree.ITEM_SELECTED) && item) {
		if (appCtxt.multiAccounts && (item instanceof ZmOrganizer)) {
			this._handleMultiAccountItemSelection(ev, overview, treeItem, item);
		}
        else {
			this._handleItemSelection(ev, overview, treeItem, item);
		}
	}
    else if ((ev.detail === DwtTree.ITEM_DBL_CLICKED) && item) {
		this._itemDblClicked(item);
	}
};

ZmTreeController.prototype.getItemActionMenu = function(ev, item) {
	var actionMenu = (item.nId == ZmOrganizer.ID_ROOT || item.isDataSource(ZmAccount.TYPE_IMAP))
		? this._getHeaderActionMenu(ev)
		: this._getActionMenu(ev, item);
	return actionMenu;
}

/**
 * @private
 */
ZmTreeController.prototype._handleItemSelection =
function(ev, overview, treeItem, item) {
	// left click or selection via shortcut
	overview.itemSelected(treeItem);

	if (ev.kbNavEvent) {
		Dwt.scrollIntoView(treeItem._itemDiv, overview.getHtmlElement());
		ZmController.noFocus = true;
	}

	if (overview._treeSelectionShortcutDelayActionId) {
		AjxTimedAction.cancelAction(overview._treeSelectionShortcutDelayActionId);
	}

	if ((overview.selectionSupported || item._showFoldersCallback) && !treeItem._isHeader) {
		if (ev.kbNavEvent) {
			// for shortcuts, process selection via Enter immediately; selection via up/down keys
			// is delayed (or can be disabled by setting the delay to 0)
			if (ev.enter || this._treeSelectionShortcutDelay) {
				var action = new AjxTimedAction(this, ZmTreeController.prototype._treeSelectionTimedAction, [item, overview]);
				overview._treeSelectionShortcutDelayActionId = AjxTimedAction.scheduleAction(action, this._treeSelectionShortcutDelay);
			}
		} else {
			if ((appCtxt.multiAccounts && (item instanceof ZmOrganizer)) ||
				(item.type == ZmOrganizer.VOICE))
			{
				appCtxt.getCurrentApp().getOverviewContainer().deselectAll(overview);

				// set the active account based on the item clicked
				var account = item.account || appCtxt.accountList.mainAccount;
				appCtxt.accountList.setActiveAccount(account);
			}

			this._itemSelected(item);
		}
	}
};

/**
 * @private
 */
ZmTreeController.prototype._itemSelected =
function(item) {
	if (item && item._showFoldersCallback) {
		item._showFoldersCallback.run();
	} else {
		this._itemClicked(item);
	}

};

/**
 * Allows subclass to overload in case something needs to be done before
 * processing tree item selection in a multi-account environment. Otherwise,
 * do the normal tree item selection.
 * 
 * @private
 */
ZmTreeController.prototype._handleMultiAccountItemSelection =
function(ev, overview, treeItem, item) {
	this._handleItemSelection(ev, overview, treeItem, item);
};

/**
 * @private
 */
ZmTreeController.prototype._treeSelectionTimedAction =
function(item, overview) {
	if (overview._treeSelectionShortcutDelayActionId) {
		AjxTimedAction.cancelAction(overview._treeSelectionShortcutDelayActionId);
	}
	this._itemSelected(item);
};

/**
 * Propagates a change in tree state to other trees of the same type in app overviews.
 * 
 * @param {ZmTreeEvent}	ev		a tree event
 * 
 * @private
 */
ZmTreeController.prototype._treeListener =
function(ev) {
	var treeItem = ev && ev.item;
	var overviewId = treeItem && treeItem._tree && treeItem._tree.overviewId;
    var overview = appCtxt.getOverviewController().getOverview(overviewId);
    var acct = overview.account;
    if (appCtxt.multiAccounts && acct) {
        appCtxt.accountList.setActiveAccount(acct);
    }

	// persist expand/collapse state for folders
	var isExpand = ev.detail == DwtTree.ITEM_EXPANDED;
	var folderId = (ev.detail == DwtTree.ITEM_COLLAPSED || isExpand)
		? treeItem.getData(Dwt.KEY_ID) : null;

	if (folderId && !treeItem._isHeader) {
		var setExpanded = appCtxt.get(ZmSetting.FOLDERS_EXPANDED, folderId) || false; //I think it's set as undefined if "false" in ZmSetting.prototype.setValue)
		if (typeof(setExpanded) == "string") {//I can't figure out why it becomes a string sometimes. That's nasty.
			setExpanded = (setExpanded === "true");
		}
		//setting in case of skipImplicit is still causing problems (the fix to bug 72590 was not good enough), since even if this "set" is not persisting,
		//future ones (collapse/expand in the mail tab) would cause it to save implicitly, which is not what we want.
		//so I simply do not call "set" in case of skipImplicit. Might want to change the name of this variable slightly, but not sure to what.
		if (!overview.skipImplicit && setExpanded !== isExpand) { //set only if changed (ZmSetting.prototype.setValue is supposed to not send a request if no change, but it might have bugs)
			appCtxt.set(ZmSetting.FOLDERS_EXPANDED, isExpand, folderId);
		}

		// check if any of this treeItem's children need to be expanded as well
		if (isExpand) {
			this._expandTreeItems(treeItem);
		}
	}

	// only handle events that come from headers in app overviews
	if (!(ev && ev.detail && overview && overview.isAppOverview && treeItem._isHeader)) { return; }

	var settings = appCtxt.getSettings(acct);
	var setting = settings.getSetting(ZmOrganizer.OPEN_SETTING[this.type]);
	if (setting) {
		setting.setValue(ev.detail == DwtTree.ITEM_EXPANDED);
	}
};

/**
 * Handles changes to the underlying model. The change is propagated to
 * all the tree views known to this controller.
 *
 * @param {ZmEvent}	ev		a change event
 * 
 * @private
 */
ZmTreeController.prototype._treeChangeListener =
function(ev) {
	this._evHandled = {};
	for (var overviewId in this._treeView) {
		this._changeListener(ev, this._treeView[overviewId], overviewId);
	}
};

/**
 * Handles a change event for one tree view.
 *
 * @param {ZmEvent}	ev				a change event
 * @param {ZmTreeView}	treeView		a tree view
 * @param {constant}	overviewId		overview ID
 * 
 * @private
 */
ZmTreeController.prototype._changeListener =
function(ev, treeView, overviewId) {
	if (this._evHandled[overviewId]) { return; }
	if (!treeView.allowedTypes[ev.type] && !treeView.allowedSubTypes[ev.type]) { return; }

	var organizers = ev.getDetail("organizers");
	if (!organizers && ev.source) {
		organizers = [ev.source];
	}

	// handle one organizer at a time
	for (var i = 0; i < organizers.length; i++) {
		var organizer = organizers[i];

		var node = treeView.getTreeItemById(organizer.id);
		// Note: source tree handles moves - it will have node
		if (!node && (ev.event != ZmEvent.E_CREATE)) { continue; }

		var fields = ev.getDetail("fields");
		if (ev.event == ZmEvent.E_DELETE) {
			if (organizer.nId == ZmFolder.ID_TRASH || organizer.nId == ZmFolder.ID_SPAM) {
				node.setText(organizer.getName(false));	// empty Trash or Junk
			} else {
				node.dispose();
			}
            this._checkTreeView(overviewId);
			this._evHandled[overviewId] = true;
		} else if (ev.event == ZmEvent.E_CREATE || ev.event == ZmEvent.E_MOVE) {
			// for multi-account, make sure this organizer applies to the given overview
			if (appCtxt.multiAccounts) {
				var overview = this._opc.getOverview(overviewId);
				if (overview && overview.account != organizer.getAccount()) {
					continue;
				}
			}
			var parentNode = this._getParentNode(organizer, ev, overviewId);
			var idx = parentNode ? ZmTreeView.getSortIndex(parentNode, organizer, eval(ZmTreeView.COMPARE_FUNC[organizer.type])) : null;
			if (parentNode && (ev.event == ZmEvent.E_CREATE)) {
				// parent's tree controller should handle creates - root is shared by all folder types
				var type = ((organizer.parent.nId == ZmOrganizer.ID_ROOT) || organizer.parent.isRemoteRoot()) ? ev.type : organizer.parent.type;
				if (type !== this.type || !treeView._isAllowed(organizer.parent, organizer)) {
					continue;
				}
				if (organizer.isOfflineGlobalSearch) {
					appCtxt.getApp(ZmApp.MAIL).getOverviewContainer().addSearchFolder(organizer);
					return;
				} else {
					node = this._addNew(treeView, parentNode, organizer, idx); // add to new parent
				}
                this.createDataSource(organizer);
			} else if (ev.event == ZmEvent.E_MOVE) {
				var selectedItem = treeView.getSelected();
				if (AjxUtil.isArray1(selectedItem)) { //make sure this tree is not a checked style one (no idea where we have that, but see the getSelected code
					selectedItem = null;
				}
				node.dispose();
				if (parentNode) {
					node = this._addNew(treeView, parentNode, organizer, idx); // add to new parent
				}
				//highlight the current chosen one again, in case it was moved, thus losing selection
				if (!treeView.getSelected() && selectedItem) { //if item was selected but now it is not
					treeView.setSelected(selectedItem.id, true, true);
				}
			}
			if (parentNode) {
				parentNode.setExpanded(true); // so that new node is visible

				this._fixupTreeNode(node, organizer, treeView);
			}
			this._checkTreeView(overviewId);
			this._evHandled[overviewId] = true;
		} else if (ev.event == ZmEvent.E_MODIFY) {
			if (!fields) { return; }
			if (fields[ZmOrganizer.F_TOTAL] || fields[ZmOrganizer.F_SIZE] || fields[ZmOrganizer.F_UNREAD] || fields[ZmOrganizer.F_NAME]) {
				node.setToolTipContent(organizer.getToolTip(true));
				if (appCtxt.multiAccounts && organizer.type == ZmOrganizer.FOLDER) {
					appCtxt.getApp(ZmApp.MAIL).getOverviewContainer().updateTooltip(organizer.nId);
				}
			}

			if (fields[ZmOrganizer.F_NAME] ||
				fields[ZmOrganizer.F_UNREAD] ||
				fields[ZmOrganizer.F_FLAGS] ||
				fields[ZmOrganizer.F_COLOR] ||
				((organizer.nId == ZmFolder.ID_DRAFTS || organizer.rid == ZmFolder.ID_DRAFTS ||
				  organizer.nId == ZmOrganizer.ID_OUTBOX) && fields[ZmOrganizer.F_TOTAL]))
			{
				this._updateOverview({
					organizer:  organizer,
					node:       node,
					fields:     fields,
					treeView:   treeView,
					overviewId: overviewId,
					ev:         ev
				});

				this._evHandled[overviewId] = true;
			}
		}
	}
};

/**
 * Handle an organizer change by updating the tree view. For example, a name change requires sorting.
 *
 * @param   params      hash            hash of params:
 *
 *          organizer   ZmOrganizer     organizer that changed
 *          node        DwtTreeItem     organizer node in tree view
 *          fields      hash            changed fields
 *          treeView    ZmTreeView      tree view for this organizer type
 *          overviewId  string          ID of containing overview
 *          ev          ZmEvent         change event
 *
 * @private
 */
ZmTreeController.prototype._updateOverview = function(params) {

	var org = params.organizer,
		node = params.node,
		parentNode = this._getParentNode(org, params.ev, params.overviewId);

	node.setText(org.getName(params.treeView._showUnread));

	// If the name changed, re-sort the containing list
	if (params.fields && params.fields[ZmOrganizer.F_NAME]) {
		if (parentNode && (parentNode.getNumChildren() > 1)) {
			var nodeSelected = node._selected;
			// remove and re-insert the node (if parent has more than one child)
			node.dispose();
			var idx = ZmTreeView.getSortIndex(parentNode, org, eval(ZmTreeView.COMPARE_FUNC[org.type]));
			node = params.treeView._addNew(parentNode, org, idx);
			if (nodeSelected) {
				//if it was selected, re-select it so it is highlighted. No need for notifications.
				params.treeView.setSelected(org, true);
			}
		} else {
			node.setDndText(org.getName());
		}
		appCtxt.getAppViewMgr().updateTitle();
	}

	// A folder aggregates unread status of its descendents, so propagate up parent chain
	if (params.fields[ZmOrganizer.F_UNREAD]) {
		var parent = org.parent;
		while (parent && parentNode && parent.nId != ZmOrganizer.ID_ROOT) {
			parentNode.setText(parent.getName(params.treeView._showUnread));
			parentNode = this._getParentNode(parent, params.ev, params.overviewId);
			parent = parent.parent;
		}
	}

	// Miscellaneous cleanup (color, selection)
	this._fixupTreeNode(node, org, params.treeView);
};

ZmTreeController.prototype._getParentNode = function(organizer, ev, overviewId) {

	if (organizer.parent) {
		// if node being moved to root, we assume new parent must be the container of its type
		var type = (organizer.parent.nId == ZmOrganizer.ID_ROOT) ? ev.type : null;
		return this._opc.getOverview(overviewId).getTreeItemById(organizer.parent.id, type);
	}
};

/**
 * Makes a request to add a new item to the tree, returning true if the item was
 * actually added, or false if it was omitted.
 *
 * @param {ZmTreeView}	treeView		the tree view
 * @param {DwtTreeItem}	parentNode	the node under which to add the new one
 * @param {ZmOrganizer}	organizer		the organizer for the new node
 * @param {int}	idx			the position at which to add the new node
 * 
 * @private
 */
ZmTreeController.prototype._addNew =
function(treeView, parentNode, organizer, idx) {
	return treeView._addNew(parentNode, organizer, idx);
};

/**
 * Pops up the appropriate "New ..." dialog.
 *
 * @param {DwtUiEvent}	ev		the UI event
 * @param {ZmZimbraAccount}	account	used by multi-account mailbox (optional)
 * 
 * @private
 */
ZmTreeController.prototype._newListener =
function(ev, account) {
	this._pendingActionData = this._getActionedOrganizer(ev);
	var newDialog = this._getNewDialog();
	if (!this._newCb) {
		this._newCb = new AjxCallback(this, this._newCallback);
	}
	if (this._pendingActionData && !appCtxt.getById(this._pendingActionData.id)) {
		this._pendingActionData = appCtxt.getFolderTree(account).root;
	}

	if (!account && appCtxt.multiAccounts) {
		var ov = this._opc.getOverview(this._actionedOverviewId);
		account = ov && ov.account;
	}

	ZmController.showDialog(newDialog, this._newCb, this._pendingActionData, account);
	newDialog.registerCallback(DwtDialog.CANCEL_BUTTON, this._clearDialog, this, newDialog);
};

ZmTreeController.prototype.createDataSource =
function(organizer) {
    //override
};

/**
 * Pops up the appropriate "Rename ..." dialog.
 *
 * @param {DwtUiEvent}	ev		the UI event
 * 
 * @private
 */
ZmTreeController.prototype._renameListener =
function(ev) {
	this._pendingActionData = this._getActionedOrganizer(ev);
	var renameDialog = this._getRenameDialog();
	if (!this._renameCb) {
		this._renameCb = new AjxCallback(this, this._renameCallback);
	}
	ZmController.showDialog(renameDialog, this._renameCb, this._pendingActionData);
	renameDialog.registerCallback(DwtDialog.CANCEL_BUTTON, this._clearDialog, this, renameDialog);
};

/**
 * Deletes an organizer.
 *
 * @param {DwtUiEvent}	ev		the UI event
 * 
 * @private
 */
ZmTreeController.prototype._deleteListener =
function(ev) {
	this._doDelete(this._getActionedOrganizer(ev));
};

/**
 * @private
 */
ZmTreeController.prototype._emptyListener =
function(ev) {
	this._doEmpty(this._getActionedOrganizer(ev));
};

/**
 * Moves an organizer into another folder.
 *
 * @param {DwtUiEvent}	ev		the UI event
 * 
 * @private
 */
ZmTreeController.prototype._moveListener =
function(ev) {
	this._pendingActionData = this._getActionedOrganizer(ev);
	var moveToDialog = appCtxt.getChooseFolderDialog();
	if (!this._moveCb) {
		this._moveCb = new AjxCallback(this, this._moveCallback);
	}
	ZmController.showDialog(moveToDialog, this._moveCb, this._getMoveParams(moveToDialog));
	moveToDialog.registerCallback(DwtDialog.CANCEL_BUTTON, this._clearDialog, this, moveToDialog);
};

/**
 * @private
 */
ZmTreeController.prototype._getMoveParams =
function(dlg) {
	var omit = {};
	omit[ZmFolder.ID_SPAM] = true;
	return {
		data:			this._pendingActionData,
		treeIds:		[this.type],
		overviewId:		dlg.getOverviewId(appCtxt.getCurrentAppName() + '_' + this.type),
		omit:			omit,
		title:			AjxStringUtil.htmlEncode(this._getMoveDialogTitle()),
		description:	ZmMsg.targetFolder,
		appName:		ZmOrganizer.APP[this.type]
	};
};

/**
 * Expands the tree below the action'd node.
 *
 * @param {DwtUiEvent}	ev		the UI event
 * 
 * @private
 */
ZmTreeController.prototype._expandAllListener =
function(ev) {
	var organizer = this._getActionedOrganizer(ev);
	var treeView = this.getTreeView(this._actionedOverviewId);
	var ti = treeView.getTreeItemById(organizer.id);
	window.duringExpandAll = true;
	ti.setExpanded(true, true);
	window.duringExpandAll = false;
	if (window.afterExpandAllCallback) {
		window.afterExpandAllCallback(); //save the explicit setting now after all was expanded - so only one request instead of many
		window.afterExpandAllCallback  = null;
	}
};

/**
 * Mark's an organizer's contents as read.
 *
 * @param {DwtUiEvent}	ev		the UI event
 * 
 * @private
 */
ZmTreeController.prototype._markAllReadListener =
function(ev) {
	this._doMarkAllRead(this._getActionedOrganizer(ev));
};

/**
 * Syncs all the organizers to its feed (URL).
 *
 * @param {DwtUiEvent}	ev		the UI event
 * 
 * @private
 */
ZmTreeController.prototype._syncAllListener =
function(ev) {
	// Loop over all the TreeViews
	for (var overviewId in this._treeView) {
		var treeView = this.getTreeView(overviewId);
		var rootId = ZmOrganizer.getSystemId(ZmOrganizer.ID_ROOT, appCtxt.getActiveAccount());
		var rootTreeItem = treeView.getTreeItemById(rootId);
		var treeItems = rootTreeItem && rootTreeItem.getItems();
		if (treeItems) {
			for (var i = 0; i < treeItems.length; i++) {
				var ti = treeItems[i];
				var folder = ti && ti.getData && ti.getData(Dwt.KEY_OBJECT);
				if (folder && (folder.isFeed() || folder.hasFeeds())) {
					this._syncFeeds(folder);
				}
			}
		}
	}
};

/**
 * Syncs an organizer to its feed (URL).
 *
 * @param {DwtUiEvent}	ev		the UI event
 * 
 * @private
 */
ZmTreeController.prototype._syncListener =
function(ev) {
	this._syncFeeds(this._getActionedOrganizer(ev));
};

/**
 * @private
 */
ZmTreeController.prototype._syncFeeds =
function(f) {
	if (f.isFeed()) {
		this._doSync(f);
	} else if (f.hasFeeds()) {
		var a = f.children.getArray();
		var sz = f.children.size();
		for (var i = 0; i < sz; i++) {
			if (a[i].isFeed() || (a[i].hasFeeds && a[i].hasFeeds())) {
				this._syncFeeds(a[i]);
			}
		}
	}
};

/**
 * Brings up a dialog for editing organizer properties.
 *
 * @param {DwtUiEvent}	ev		the UI event
 * 
 * @private
 */
ZmTreeController.prototype._editPropsListener = 
function(ev) {
	var folderPropsDialog = appCtxt.getFolderPropsDialog();
	folderPropsDialog.popup(this._getActionedOrganizer(ev));
};

/**
 * Handles a drag event by setting the source data.
 *
 * @param {DwtDragEvent}	ev		a drag event
 * 
 * @private
 */
ZmTreeController.prototype._dragListener =
function(ev) {
	switch (ev.action) {
		case DwtDragEvent.SET_DATA:
			ev.srcData = {data:ev.srcControl.getData(Dwt.KEY_OBJECT), controller:this};
			break;
	}
};

/**
 * Called when a dialog we opened is closed. Sets the style of the actioned
 * tree item from "actioned" back to its normal state.
 * 
 * @private
 */
ZmTreeController.prototype._menuPopdownActionListener = 
function() {
	if (this._pendingActionData) { return; }

	var treeView = this.getTreeView(this._actionedOverviewId);
	if (this._actionedOrganizer && (treeView.getSelected() != this._actionedOrganizer)) {
		var ti = treeView.getTreeItemById(this._actionedOrganizer.id);
		if (ti) {
			ti._setActioned(false);
		}
	}
};

// Callbacks

/**
 * Called when a "New ..." dialog is submitted to create the organizer.
 *
 * @param {Hash}	params	a hash of parameters
 * @param {ZmOrganizer}	params.organizer	the parent organizer
 * @param {String}  params.name	the name of the new organizer
 * 
 * @private
 */
ZmTreeController.prototype._newCallback =
function(params) {
	this._doCreate(params);
	this._clearDialog(this._getNewDialog());
};

/**
 * Called when a "Rename ..." dialog is submitted to rename the organizer.
 *
 * @param {ZmOrganizer}	organizer		the organizer
 * @param {String}	name		the new name of the organizer
 * 
 * @private
 */
ZmTreeController.prototype._renameCallback =
function(organizer, name) {
	this._doRename(organizer, name);
	this._clearDialog(this._getRenameDialog());
};

/**
 * Called when a "Move To ..." dialog is submitted to move the organizer.
 *
 * @param {ZmFolder}	folder		the target folder
 * 
 * @private
 */
ZmTreeController.prototype._moveCallback =
function(folder) {
	this._doMove(this._pendingActionData, folder);
	this._clearDialog(appCtxt.getChooseFolderDialog());
};

/**
 * Called if a user has agreed to go ahead and delete an organizer.
 *
 * @param {ZmOrganizer}	organizer	the organizer to delete
 * 
 * @private
 */
ZmTreeController.prototype._deleteShieldYesCallback =
function(organizer) {
	this._doDelete(organizer);
	this._clearDialog(this._deleteShield);
};

/**
 * @private
 */
ZmTreeController.prototype._emptyShieldYesCallback = 
function(organizer) {
	this._doEmpty(organizer);
	this._clearDialog(this._emptyShield);
};

/**
 * Prompts user before folder is emptied.
 *
 * @param {DwtUiEvent}		ev		the UI event
 *
 * @private
 */

ZmTreeController.prototype._getEmptyShieldWarning =
function(ev) {
    var organizer = this._pendingActionData = this._getActionedOrganizer(ev);
	var ds = this._emptyShield = appCtxt.getOkCancelMsgDialog();
	ds.reset();
	ds.registerCallback(DwtDialog.OK_BUTTON, this._emptyShieldYesCallback, this, organizer);
	ds.registerCallback(DwtDialog.CANCEL_BUTTON, this._clearDialog, this, this._emptyShield);
	var msg = (organizer.nId != ZmFolder.ID_TRASH)
		? (AjxMessageFormat.format(ZmMsg.confirmEmptyFolder, organizer.getName()))
		: ZmMsg.confirmEmptyTrashFolder;
	ds.setMessage(msg, DwtMessageDialog.WARNING_STYLE);

	var focusButtonId = (organizer.nId == ZmFolder.ID_TRASH || organizer.nId == ZmFolder.ID_SPAM) ?  DwtDialog.OK_BUTTON : DwtDialog.CANCEL_BUTTON;
	ds.associateEnterWithButton(focusButtonId);
	ds.popup(null, focusButtonId);

	if (!(organizer.nId == ZmFolder.ID_SPAM || organizer.isInTrash())) {
		var cancelButton = ds.getButton(DwtDialog.CANCEL_BUTTON);
		cancelButton.focus();
	}
};

// Miscellaneous private methods

/**
 * Returns the organizer that's currently selected for action (via right-click).
 * Note: going up the object tree to find the actioned organizer will only work 
 * for tree item events; it won't work for action menu item events, since action
 * menus are children of the shell.
 *
 * @param {DwtUiEvent}	ev		the UI event
 * 
 * @private
 */
ZmTreeController.prototype._getActionedOrganizer =
function(ev) {
	if (this._actionedOrganizer) {
		return this._actionedOrganizer;
	}
		
	var obj = ev.item;
	while (obj) {
		var data = obj.getData(Dwt.KEY_OBJECT);
		if (data instanceof ZmOrganizer) {
			this._actionedOrganizer = data;
			return this._actionedOrganizer;
		}
		obj = obj.parent;
	}
	return null;
};

/**
 * Shows or hides the tree view. It is hidden only if there is no data, and we
 * have been told to hide empty tree views of this type.
 * 
 * @param {constant}	overviewId		the overview ID
 * 
 * @private
 */
ZmTreeController.prototype._checkTreeView =
function(overviewId) {
	if (!overviewId || !this._treeView[overviewId]) { return; }

	var account = this._opc.getOverview(overviewId).account;
	var dataTree = this.getDataTree(account);
	var hide = (ZmOrganizer.HIDE_EMPTY[this.type] && dataTree && (dataTree.size() == 0));
	this._treeView[overviewId].setVisible(!hide);
};
