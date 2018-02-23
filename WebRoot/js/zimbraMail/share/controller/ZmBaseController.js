/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2011, 2012, 2013, 2014, 2015, 2016 Synacor, Inc.
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
 * All portions of the code are Copyright (C) 2011, 2012, 2013, 2014, 2015, 2016 Synacor, Inc. All Rights Reserved.
 * ***** END LICENSE BLOCK *****
 */

/**
 * @overview
 * This file defines a base controller class.
 *
 */

/**
 * This class is a base class for any controller that manages items such as messages, contacts,
 * appointments, tasks, etc. It handles operations that can be performed on those items such as
 * move, delete, tag, print, etc.
 *
 * @author Conrad Damon
 *
 * @param {DwtControl}					container					the containing shell
 * @param {ZmApp}						app							the containing application
 * @param {constant}					type						type of controller (typically a view type)				
 * @param {string}						sessionId					the session id
 * @param {ZmSearchResultsController}	searchResultsController		containing controller
 * 
 * @extends		ZmController
 */
ZmBaseController = function(container, app, type, sessionId, searchResultsController) {

	if (arguments.length == 0) { return; }
	ZmController.apply(this, arguments);

	this.setSessionId(sessionId, type || this.getDefaultViewType(), searchResultsController);
	
    //this._refreshQuickCommandsClosure = this._refreshQuickCommands.bind(this);
    //this._quickCommandMenuHandlerClosure = this._quickCommandMenuHandler.bind(this);

	// hashes keyed by view type
	this._view		= {};
	this._toolbar	= {};	// ZmButtonToolbar
	this._tabGroups = {};	// DwtTabGroup

	this._tagList = appCtxt.getTagTree();
	if (this._tagList) {
		this._boundTagChangeListener = this._tagChangeListener.bind(this);
		this._tagList.addChangeListener(this._boundTagChangeListener);
	}

	// create a listener for each operation
	this._listeners = {};
	this._listeners[ZmOperation.NEW_MENU]		= this._newListener.bind(this);
	this._listeners[ZmOperation.TAG_MENU]		= this._tagButtonListener.bind(this);
	this._listeners[ZmOperation.MOVE_MENU]		= this._moveButtonListener.bind(this);
	this._listeners[ZmOperation.ACTIONS_MENU]	= this._actionsButtonListener.bind(this);
	this._listeners[ZmOperation.TAG]			= this._tagListener.bind(this);
	this._listeners[ZmOperation.PRINT]			= this._printListener.bind(this);
	this._listeners[ZmOperation.DELETE]			= this._deleteListener.bind(this);
	this._listeners[ZmOperation.DELETE_WITHOUT_SHORTCUT]			= this._deleteListener.bind(this);
	this._listeners[ZmOperation.CLOSE]			= this._backListener.bind(this);
	this._listeners[ZmOperation.MOVE]			= this._moveListener.bind(this);
	this._listeners[ZmOperation.SEARCH]			= this._searchListener.bind(this);
	this._listeners[ZmOperation.NEW_MESSAGE]	= this._composeListener.bind(this);
	this._listeners[ZmOperation.CONTACT]		= this._contactListener.bind(this);
	this._listeners[ZmOperation.VIEW]			= this._viewMenuItemListener.bind(this);
	this._listeners[ZmOperation.GO_TO_URL]		= this._goToUrlListener.bind(this);

	// TODO: do this better - avoid referencing specific apps
	if (window.ZmImApp) {
		this._listeners[ZmOperation.IM] = ZmImApp.getImMenuItemListener();
	}

	/**
	 * List of toolbar operations to enable on Zero/no selection
	 * - Default is only enable ZmOperation.NEW_MENU
	 */
	this.operationsToEnableOnZeroSelection = [ZmOperation.NEW_MENU];

	/**
	 * List of toolbar operations to enable when multiple items are selected
	 * - Default is to enable: ZmOperation.NEW_MENU, ZmOperation.TAG_MENU, ZmOperation.DELETE, ZmOperation.MOVE,
	 * 						ZmOperation.MOVE_MENU, ZmOperation.FORWARD & ZmOperation.ACTIONS_MENU
	 */
	this.operationsToEnableOnMultiSelection = [ZmOperation.NEW_MENU, ZmOperation.TAG_MENU, ZmOperation.DELETE,
												ZmOperation.MOVE, ZmOperation.MOVE_MENU, ZmOperation.FORWARD,
												ZmOperation.ACTIONS_MENU];
	/**
	 * List of toolbar operations to *disable*
	 * Default is to enable-all
	 */
	this.operationsToDisableOnSingleSelection = [];
};

ZmBaseController.prototype = new ZmController;
ZmBaseController.prototype.constructor = ZmBaseController;

ZmBaseController.prototype.isZmBaseController = true;
ZmBaseController.prototype.toString = function() { return "ZmBaseController"; };



// public methods

/**
 * Sets the session id, view id, and tab id. Notes whether this controller is being
 * used to display search results.
 *
 * @param {string}						sessionId					the session id
 * @param {string}						type						the type
 * @param {ZmSearchResultsController}	searchResultsController		owning controller
 */
ZmBaseController.prototype.setSessionId =
function(sessionId, type, searchResultsController) {

	ZmController.prototype.setSessionId.apply(this, arguments);
	this.searchResultsController = searchResultsController;
	this.isSearchResults = Boolean(searchResultsController);
};

/**
 * Gets the current view object.
 * 
 * @return	{DwtComposite}	the view object
 */
ZmBaseController.prototype.getCurrentView =
function() {
	return this._view[this._currentViewId];
};

/**
 * Returns the view used to display a single item, if any.
 */
ZmBaseController.prototype.getItemView = function() {
	return null;
};

/**
 * Gets the current tool bar.
 * 
 * @return	{ZmButtonToolbar}		the toolbar
 */
ZmBaseController.prototype.getCurrentToolbar =
function() {
	return this._toolbar[this._currentViewId];
};

/**
 * Returns the list of items to be acted upon.
 */
ZmBaseController.prototype.getItems = function() {};

/**
 * Returns the number of items to be acted upon.
 */
ZmBaseController.prototype.getItemCount = function() {};

/**
 * Handles a shortcut.
 * 
 * @param	{constant}	actionCode		the action code
 * @return	{Boolean}	<code>true</code> if the action is handled
 */
ZmBaseController.prototype.handleKeyAction =
function(actionCode, ev) {

	DBG.println(AjxDebug.DBG3, "ZmBaseController.handleKeyAction");
    var isExternalAccount = appCtxt.isExternalAccount();

	switch (actionCode) {

		case ZmKeyMap.MOVE:
            if (isExternalAccount) { break; }
			var items = this.getItems();
			if (items && items.length) {
				this._moveListener();
			}
			break;

		case ZmKeyMap.PRINT:
			if (appCtxt.get(ZmSetting.PRINT_ENABLED) && !appCtxt.isWebClientOffline()) {
				this._printListener();
			}
			break;

		case ZmKeyMap.TAG:
            if (isExternalAccount) { break; }
			var items = this.getItems();
			if (items && items.length && (appCtxt.getTagTree().size() > 0)) {
				var dlg = appCtxt.getPickTagDialog();
				ZmController.showDialog(dlg, new AjxCallback(this, this._tagSelectionCallback, [items, dlg]));
			}
			break;

		case ZmKeyMap.UNTAG:
            if (isExternalAccount) { break; }
			if (appCtxt.get(ZmSetting.TAGGING_ENABLED)) {
				var items = this.getItems();
				if (items && items.length) {
					this._doRemoveAllTags(items);
				}
			}
			break;

		default:
			return ZmController.prototype.handleKeyAction.apply(this, arguments);
	}
	return true;
};

/**
 * Returns true if this controller's view is currently being displayed (possibly within a search results tab)
 */
ZmBaseController.prototype.isCurrent =
function() {
	return (this._currentViewId == appCtxt.getCurrentViewId());
};

ZmBaseController.prototype.supportsDnD =
function() {
	return !appCtxt.isExternalAccount();
};

// abstract protected methods

// Creates the view element
ZmBaseController.prototype._createNewView	 		= function() {};

// Populates the view with data
ZmBaseController.prototype._setViewContents			= function(view) {};

// Returns text for the tag operation
ZmBaseController.prototype._getTagMenuMsg 			= function(num) {};

// Returns text for the move dialog
ZmBaseController.prototype._getMoveDialogTitle		= function(num) {};

// Returns a list of desired toolbar operations
ZmBaseController.prototype._getToolBarOps 			= function() {};

// Returns a list of secondary (non primary) toolbar operations
ZmBaseController.prototype._getSecondaryToolBarOps 	= function() {};

// Returns a list of buttons that align to the right, like view and detach
ZmBaseController.prototype._getRightSideToolBarOps 	= function() {};


// private and protected methods

/**
 * Creates basic elements and sets the toolbar and action menu.
 * 
 * @private
 */
ZmBaseController.prototype._setup =
function(view) {
	this._initialize(view);
	this._resetOperations(this._toolbar[view], 0);
};

/**
 * Creates the basic elements: toolbar, list view, and action menu.
 *
 * @private
 */
ZmBaseController.prototype._initialize =
function(view) {
	this._initializeToolBar(view);
	this._initializeView(view);
	this._initializeTabGroup(view);
};

// Below are functions that return various groups of operations, for cafeteria-style
// operation selection.

/**
 * @private
 */
ZmBaseController.prototype._standardToolBarOps =
function() {
	return [ZmOperation.DELETE, ZmOperation.MOVE_MENU, ZmOperation.PRINT];
};

/**
 * Initializes the toolbar buttons and listeners.
 * 
 * @private
 */
ZmBaseController.prototype._initializeToolBar =
function(view, className) {

	if (this._toolbar[view]) { return; }

	var buttons = this._getToolBarOps();
	var secondaryButtons = this._getSecondaryToolBarOps() || [];
	var rightSideButtons = this._getRightSideToolBarOps() || [];
	if (!(buttons || secondaryButtons)) { return; }

	var tbParams = {
		parent:				this._container,
		buttons:			buttons,
		secondaryButtons:	secondaryButtons,
		rightSideButtons: 	rightSideButtons,
		overrides:          this._getButtonOverrides(buttons.concat(secondaryButtons).concat(rightSideButtons)),
		context:			view,
		controller:			this,
		refElementId:		ZmId.SKIN_APP_TOP_TOOLBAR,
		addTextElement:		true,
		className:			className
	};
	var tb = this._toolbar[view] = new ZmButtonToolBar(tbParams);

	var text = tb.getButton(ZmOperation.TEXT);
	if (text) {
		text.addClassName("itemCountText");
	}

	var button;
	for (var i = 0; i < tb.opList.length; i++) {
		button = tb.opList[i];
		if (this._listeners[button]) {
			tb.addSelectionListener(button, this._listeners[button]);
		}
	}

	button = tb.getButton(ZmOperation.TAG_MENU);
	if (button) {
		button.noMenuBar = true;
		this._setupTagMenu(tb);
	}

	button = tb.getButton(ZmOperation.MOVE_MENU);
	if (button) {
		button.noMenuBar = true;
		this._setupMoveMenu(tb);
	}


	// add the selection listener for when user clicks on the little drop-down arrow (unfortunately we have to do that here separately) It is done for the main button area in a generic way to all toolbar buttons elsewhere
	var actionsButton = tb.getActionsButton();
	if (actionsButton) {
		actionsButton.addDropDownSelectionListener(this._listeners[ZmOperation.ACTIONS_MENU]);
	}

	var actionsMenu = tb.getActionsMenu();
	if (actionsMenu) {
		this._setSearchMenu(actionsMenu, true);
	}	

	appCtxt.notifyZimlets("initializeToolbar", [this._app, tb, this, view], {waitUntilLoaded:true});
};

ZmBaseController.prototype._getButtonOverrides = function(buttons) {};

/**
 * Initializes the view and its listeners.
 * 
 * @private
 */
ZmBaseController.prototype._initializeView =
function(view) {

	if (this._view[view]) { return; }

	this._view[view] = this._createNewView(view);
	this._view[view].addSelectionListener(this._listSelectionListener.bind(this));
	this._view[view].addActionListener(this._listActionListener.bind(this));
};

// back-compatibility (bug 60073)
ZmBaseController.prototype._initializeListView = ZmBaseController.prototype._initializeView;

/**
 * Sets up tab groups (focus ring).
 * 
 * @private
 */
ZmBaseController.prototype._initializeTabGroup = function(view) {

	if (this._tabGroups[view]) {
        return;
    }

	this._tabGroups[view] = this._createTabGroup();
	this._tabGroups[view].newParent(appCtxt.getRootTabGroup());
	this._tabGroups[view].addMember(this._toolbar[view].getTabGroupMember());
    this._tabGroups[view].addMember(this._view[view].getTabGroupMember());
};

/**
 * Creates the desired application view.
 *
 * @param params		[hash]			hash of params:
 *        view			[constant]		view ID
 *        elements		[array]			array of view components
 *        controller	[ZmController]	controller responsible for this view
 *        isAppView		[boolean]*		this view is a top-level app view
 *        clear			[boolean]*		if true, clear the hidden stack of views
 *        pushOnly		[boolean]*		if true, don't reset the view's data, just swap the view in
 *        noPush		[boolean]*		if true, don't push the view, just set its contents
 *        isTransient	[boolean]*		this view doesn't go on the hidden stack
 *        stageView		[boolean]*		stage the view rather than push it
 *        tabParams		[hash]*			button params; view is opened in app tab instead of being stacked
 *        
 * @private
 */
ZmBaseController.prototype._setView =
function(params) {

	var view = params.view;
	
	// create the view (if we haven't yet)
	if (!this._appViews[view]) {
		// view management callbacks
		var callbacks = {};
		callbacks[ZmAppViewMgr.CB_PRE_HIDE]		= this._preHideCallback.bind(this);
		callbacks[ZmAppViewMgr.CB_PRE_UNLOAD]	= this._preUnloadCallback.bind(this);
		callbacks[ZmAppViewMgr.CB_POST_HIDE]	= this._postHideCallback.bind(this);
		callbacks[ZmAppViewMgr.CB_POST_REMOVE]	= this._postRemoveCallback.bind(this);
		callbacks[ZmAppViewMgr.CB_PRE_SHOW]		= this._preShowCallback.bind(this);
		callbacks[ZmAppViewMgr.CB_POST_SHOW]	= this._postShowCallback.bind(this);

		params.callbacks = callbacks;
		params.viewId = view;
		params.controller = this;
		this._app.createView(params);
		this._appViews[view] = true;
	}

	// populate the view
	if (!params.pushOnly) {
		this._setViewContents(view);
	}

	// push the view
	if (params.stageView) {
		this._app.stageView(view);
	} else if (!params.noPush) {
		return (params.clear ? this._app.setView(view) : this._app.pushView(view));
	}
};



// Operation listeners

/**
 * Tag button has been pressed. We don't tag anything (since no tag has been selected),
 * we just show the dynamic tag menu.
 * 
 * @private
 */
ZmBaseController.prototype._tagButtonListener =
function(ev) {
	var toolbar = this._toolbar[this._currentViewId];
	if (ev.item.parent == toolbar) {
		this._setTagMenu(toolbar);
	}
};

/**
 * Move button has been pressed. We don't move anything (since no folder has been selected),
 * we just show the dynamic move menu.
 *
 * @private
 */
ZmBaseController.prototype._moveButtonListener =
function(ev, list) {
	this._pendingActionData = list || this.getItems();

	var toolbar = this._toolbar[this._currentViewId];

	var moveButton = toolbar.getOp(ZmOperation.MOVE_MENU);
	if (!moveButton) {
		return;
	}
	if (!this._moveButtonInitialized) {
		this._moveButtonInitialized = true;
		appCtxt.getShell().setBusy(true);
		this._setMoveButton(moveButton);
		appCtxt.getShell().setBusy(false);
	}
	else {
		//need to update this._data so the chooser knows from which folder we are trying to move.
		this._folderChooser.updateData(this._getMoveParams(this._folderChooser).data);
	}
	var newButton = this._folderChooser._getNewButton();
	if (newButton) {
		newButton.setVisible(!appCtxt.isWebClientOffline());
	}
	moveButton.popup();
	moveButton.getMenu().getHtmlElement().style.width = "auto"; //reset the width so it's dynamic. without this it is set to 0, and in any case even if it was set to some other > 0 value, it needs to be dynamic due to collapse/expand (width changes)
	this._folderChooser.focus();
};

/**
 * Actions button has been pressed.
 * @private
 */
ZmBaseController.prototype._actionsButtonListener =
function(ev) {
	var menu = this.getCurrentToolbar().getActionsMenu();
	menu.parent.popup();	
};


/**
 * Tag/untag items.
 * 
 * @private
 */
ZmBaseController.prototype._tagListener =
function(ev, items) {

	if (this.isCurrent()) {
		var menuItem = ev.item;
		var tagEvent = menuItem.getData(ZmTagMenu.KEY_TAG_EVENT);
		var tagAdded = menuItem.getData(ZmTagMenu.KEY_TAG_ADDED);
		items = items || this.getItems();

		if (tagEvent == ZmEvent.E_TAGS && tagAdded) {
			this._doTag(items, menuItem.getData(Dwt.KEY_OBJECT), true);
		} else if (tagEvent == ZmEvent.E_CREATE) {
			this._pendingActionData = items;
			var newTagDialog = appCtxt.getNewTagDialog();
			if (!this._newTagCb) {
				this._newTagCb = new AjxCallback(this, this._newTagCallback);
			}
			ZmController.showDialog(newTagDialog, this._newTagCb);
			newTagDialog.registerCallback(DwtDialog.CANCEL_BUTTON, this._clearDialog, this, newTagDialog);
		} else if (tagEvent == ZmEvent.E_TAGS && !tagAdded) {
			//remove tag
			this._doTag(items, menuItem.getData(Dwt.KEY_OBJECT), false);
		} else if (tagEvent == ZmEvent.E_REMOVE_ALL) {
			// bug fix #607
			this._doRemoveAllTags(items);
		}
	}
};

/**
 * Called after tag selection via dialog.
 * 
 * @private
 */
ZmBaseController.prototype._tagSelectionCallback =
function(items, dialog, tag) {
	if (tag) {
		this._doTag(items, tag, true);
	}
	dialog.popdown();
};

/**
 * overload if you want to print in a different way.
 * 
 * @private
 */
ZmBaseController.prototype._printListener =
function(ev) {
	var items = this.getItems();
    if (items && items[0]) {
	    window.open(items[0].getRestUrl(), "_blank");
	}
};

ZmBaseController.prototype._backListener =
function(ev) {
	this._app.popView();
};

/**
 * Delete one or more items.
 * 
 * @private
 */
ZmBaseController.prototype._deleteListener =
function(ev) {
	this._doDelete(this.getItems(), ev.shiftKey);
};

/**
 * Move button has been pressed, show the dialog.
 * 
 * @private
 */
ZmBaseController.prototype._moveListener =
function(ev, list) {

	this._pendingActionData = list || this.getItems();
	var moveToDialog = appCtxt.getChooseFolderDialog();
	if (!this._moveCb) {
		this._moveCb = new AjxCallback(this, this._moveCallback);
	}
	ZmController.showDialog(moveToDialog, this._moveCb, this._getMoveParams(moveToDialog));
	moveToDialog.registerCallback(DwtDialog.CANCEL_BUTTON, this._clearDialog, this, moveToDialog);
};

/**
 * @protected
 */
ZmBaseController.prototype._getMoveParams =
function(dlg) {

	var org = ZmApp.ORGANIZER[this._app._name] || ZmOrganizer.FOLDER;
	return {
		overviewId:		dlg.getOverviewId(this._app._name),
		data:			this._pendingActionData,
		treeIds:		[org],
		title:			this._getMoveDialogTitle(this._pendingActionData.length, this._pendingActionData),
		description:	ZmMsg.targetFolder,
		treeStyle:		DwtTree.SINGLE_STYLE,
		noRootSelect: 	true, //I don't think you can ever use the "move" dialog to move anything to a root folder... am I wrong?
		appName:		this._app._name
	};
};

/**
 * Switch to selected view.
 * 
 * @private
 */
ZmBaseController.prototype._viewMenuItemListener =
function(ev) {
	if (ev.detail == DwtMenuItem.CHECKED || ev.detail == DwtMenuItem.UNCHECKED) {
		this.switchView(ev.item.getData(ZmOperation.MENUITEM_ID));
	}
};


// new organizer callbacks

/**
 * Created a new tag, now apply it.
 * 
 * @private
 */
ZmBaseController.prototype._tagChangeListener =
function(ev) {

	// only process if current view is this view!
	if (this.isCurrent()) {
		if (ev.type == ZmEvent.S_TAG && ev.event == ZmEvent.E_CREATE && this._pendingActionData) {
			var tag = ev.getDetail("organizers")[0];
			this._doTag(this._pendingActionData, tag, true);
			this._pendingActionData = null;
			this._menuPopdownActionListener();
		}
	}
};

/**
 * Move stuff to a new folder.
 * 
 * @private
 */
ZmBaseController.prototype._moveCallback =
function(folder) {
	this._doMove(this._pendingActionData, folder);
	this._clearDialog(appCtxt.getChooseFolderDialog());
	this._pendingActionData = null;
};

/**
 * Move stuff to a new folder. 
 *
 * @private
 */
ZmBaseController.prototype._moveMenuCallback =
function(moveButton, folder) {
	this._doMove(this._pendingActionData, folder);
	moveButton.getMenu().popdown();
	this._pendingActionData = null;
};

// Data handling

// Actions on items are performed through their containing list
ZmBaseController.prototype._getList =
function(items) {

	items = AjxUtil.toArray(items);
	var item = items[0];
	return item && item.list;
};

// callback (closure) to run when an action has completely finished
ZmBaseController.prototype._getAllDoneCallback = function() {};

/**
 * Shows the given summary as status toast.
 *
 * @param {String}		summary						the text that summarizes the recent action
 * @param {ZmAction}	actionLogItem				the logged action for possible undoing
 * @param {boolean}		showToastOnParentWindow		the toast message should be on the parent window (since the child window is being closed)
 */
ZmBaseController.showSummary =
function(summary, actionLogItem, showToastOnParentWindow) {
	
	if (!summary) {
		return;
	}
	var ctxt = showToastOnParentWindow ? parentAppCtxt : appCtxt;
	var actionController = ctxt.getActionController();
	var undoLink = actionLogItem && actionController && actionController.getUndoLink(actionLogItem);
	if (undoLink && actionController) {
		actionController.onPopup();
		ctxt.setStatusMsg({msg: summary + undoLink, transitions: actionController.getStatusTransitions()});
	} else {
		ctxt.setStatusMsg(summary);
	}
};

/**
 * Flag/unflag an item
 * 
 * @private
 */
ZmBaseController.prototype._doFlag =
function(items, on) {

	items = AjxUtil.toArray(items);
	if (!items.length) { return; }

	if (items[0].isZmItem) {
		if (on !== true && on !== false) {
			on = !items[0].isFlagged;
		}
		var items1 = [];
		for (var i = 0; i < items.length; i++) {
			if (items[i].isFlagged != on) {
				items1.push(items[i]);
			}
		}
	} else {
		items1 = items;
	}

	var params = {items:items1, op:"flag", value:on};
    params.actionTextKey = on ? 'actionFlag' : 'actionUnflag';
	var list = params.list = this._getList(params.items);
	this._setupContinuation(this._doFlag, [on], params);
	list.flagItems(params);
};

// TODO: shouldn't this be in ZmMailItemController?
ZmBaseController.prototype._doMsgPriority = 
function(items, on) {
	items = AjxUtil.toArray(items);
	if (!items.length) { return; }

	if (items[0].isZmItem) {
		if (on !== true && on !== false) {
			on = !items[0].isPriority;
		}
		var items1 = [];
		for (var i = 0; i < items.length; i++) {
			if (items[i].isPriority != on) {
				items1.push(items[i]);
			}
		}
	} else {
		items1 = items;
	}

	var params = {items:items1, op:"priority", value:on};
    params.actionTextKey = on ? 'actionMsgPriority' : 'actionUnMsgPriority';
	var list = params.list = this._getList(params.items);
	this._setupContinuation(this._doMsgPriority, [on], params);
	list.flagItems(params);	
};

/**
 * Tag/untag items
 * 
 * @private
 */
ZmBaseController.prototype._doTag =
function(items, tag, doTag) {

	items = AjxUtil.toArray(items);
	if (!items.length) { return; }

	//see bug 79756 as well as this bug, bug 98316.
	for (var i = 0; i < items.length; i++) {
		if (items[i].cloneOf) {
			items[i] = items[i].cloneOf;
		}
	}

	var params = {items:items, tag:tag, doTag:doTag};
	var list = params.list = this._getList(params.items);
	this._setupContinuation(this._doTag, [tag, doTag], params);
	list.tagItems(params);
};

/**
 * Remove all tags for given items
 * 
 * @private
 */
ZmBaseController.prototype._doRemoveAllTags =
function(items) {

	items = AjxUtil.toArray(items);
	if (!items.length) { return; }

	//see bug 79756 as well as this bug.
	for (var i = 0; i < items.length; i++) {
		if (items[i].cloneOf) {
			items[i] = items[i].cloneOf;
		}
	}
	var params = {items:items};
	var list = params.list = this._getList(params.items);
	this._setupContinuation(this._doRemoveAllTags, null, params);
	list.removeAllTags(params);
};

/**
* Deletes one or more items from the list.
*
* @param items			[Array]			list of items to delete
* @param hardDelete		[boolean]*		if true, physically delete items
* @param attrs			[Object]*		additional attrs for SOAP command
* @param confirmDelete  [Boolean]       user already confirmed hard delete (see ZmBriefcaseController.prototype._doDelete and ZmBriefcaseController.prototype._doDelete2) 
* 
* @private
*/
ZmBaseController.prototype._doDelete =
function(items, hardDelete, attrs, confirmDelete) {

	items = AjxUtil.toArray(items);
	if (!items.length) { return; }

	// If the initial set of deletion items is incomplete (we will be using continuation) then if its deletion
	// from the trash folder mark it as a hardDelete.  Otherwise, upon continuation the items will be moved
	// (Trash to Trash) instead of deleted.
	var folder = this._getSearchFolder();
	var inTrashFolder = (folder && folder.nId == ZmFolder.ID_TRASH);
	if (inTrashFolder) {
		hardDelete = true;
	}

	var params = {
		items:			items,
		hardDelete:		hardDelete,
		attrs:			attrs,
		childWin:		appCtxt.isChildWindow && window,
		closeChildWin:	appCtxt.isChildWindow,
		confirmDelete:	confirmDelete
	};
	var allDoneCallback = this._getAllDoneCallback();
	var list = params.list = this._getList(params.items);
	this._setupContinuation(this._doDelete, [hardDelete, attrs, true], params, allDoneCallback);
	
	if (!hardDelete) {
		var anyScheduled = false;
		for (var i=0, cnt=items.length; i<cnt; i++) {
			if (items[i] && items[i].isScheduled) {
				anyScheduled = true;
				break;
			}
		}
		if (anyScheduled) {
			params.noUndo = true;
			this._popupScheduledWarningDialog(list.deleteItems.bind(list, params));
		} else {
			list.deleteItems(params);
		}
	} else {
		list.deleteItems(params);
	}
};

/**
 * Moves a list of items to the given folder. Any item already in that folder is excluded.
 *
 * @param {Array}	items		a list of items to move
 * @param {ZmFolder}	folder		the destination folder
 * @param {Object}	attrs		the additional attrs for SOAP command
 * @param {Boolean}		isShiftKey	<code>true</code> if forcing a copy action
 * @param {Boolean}		noUndo	<code>true</code> undo not allowed
 * @private
 */
ZmBaseController.prototype._doMove =
function(items, folder, attrs, isShiftKey, noUndo) {

	items = AjxUtil.toArray(items);
	if (!items.length) { return; }

	var move = [];
	var copy = [];
	if (items[0].isZmItem) {
		for (var i = 0; i < items.length; i++) {
			var item = items[i];
			if (!item.folderId || (item.folderId != folder.id || (attrs && attrs.op == "recover"))) {
				if (!this._isItemMovable(item, isShiftKey, folder)) {
					copy.push(item);
				} else {
					move.push(item);
				}
			}
		}
	} else {
		move = items;
	}

	var params = {folder:folder, attrs:attrs, noUndo: noUndo};
    params.errorCallback = this._actionErrorCallback.bind(this);

	var allDoneCallback = this._getAllDoneCallback();
	if (move.length) {
		params.items = move;
		var list = params.list = this._getList(params.items);
		this._setupContinuation(this._doMove, [folder, attrs, isShiftKey], params, allDoneCallback);

		if (folder.isInTrash()) {
			var anyScheduled = false;
			var mItems = AjxUtil.toArray(move);
			for (var i=0, cnt=mItems.length; i<cnt; i++) {
				if (mItems[i] && mItems[i].isScheduled) {
					anyScheduled = true;
					break;
				}
			}
			if (anyScheduled) {
				params.noUndo = true;
				this._popupScheduledWarningDialog(list.moveItems.bind(list, params));
			} else {
				list.moveItems(params);
			}
		}
		else if (folder.id == appCtxt.get(ZmSetting.MAIL_ACTIVITYSTREAM_FOLDER) && items.length == 1) { 
			list.moveItems(params);
			var activityStreamDialog = appCtxt.getActivityStreamFilterDialog();
			activityStreamDialog.setFields(items[0]);
			activityStreamDialog.popup();
		}
		else if (items.length == 1 && folder.id == ZmFolder.ID_INBOX) {
			list.moveItems(params);
			var fromFolder = appCtxt.getById(items[0].folderId);
			if (fromFolder && fromFolder.id == appCtxt.get(ZmSetting.MAIL_ACTIVITYSTREAM_FOLDER)) { 
				var activityStreamDialog = appCtxt.getActivityToInboxFilterDialog();
				activityStreamDialog.setFields(items[0]);
				activityStreamDialog.popup();
			}
		}
		else {
			list.moveItems(params);
		}
	}

	if (copy.length) {
		params.items = copy;
		var list = params.list = this._getList(params.items);
		this._setupContinuation(this._doMove, [folder, attrs, isShiftKey], params, allDoneCallback, true);
		list.copyItems(params);
	}
};

ZmBaseController.prototype._actionErrorCallback =
function(ex){
    return false;
};

ZmBaseController.prototype._popupScheduledWarningDialog =
function(callback) {
	var dialog = appCtxt.getOkCancelMsgDialog();
	dialog.reset();
	dialog.setMessage(ZmMsg.moveScheduledMessageWarning, DwtMessageDialog.WARNING_STYLE);
	dialog.registerCallback(DwtDialog.OK_BUTTON, this._scheduledWarningDialogListener.bind(this, callback, dialog));
	dialog.associateEnterWithButton(DwtDialog.OK_BUTTON);
	dialog.popup(null, DwtDialog.OK_BUTTON);
};

ZmBaseController.prototype._scheduledWarningDialogListener =
function(callback, dialog) {
	dialog.popdown()
	callback();
};

/**
 * Decides whether an item is movable
 *
 * @param {Object}	item			the item to be checked
 * @param {Boolean}		isShiftKey	<code>true</code> if forcing a copy (not a move)
 * @param {ZmFolder}	folder		the folder this item belongs under
 * 
 * @private
 */
ZmBaseController.prototype._isItemMovable =
function(item, isShiftKey, folder) {
	return (!isShiftKey && !item.isReadOnly() && !folder.isReadOnly());
};

/**
 * Modify an item.
 * 
 * @private
 */
ZmBaseController.prototype._doModify =
function(item, mods) {
	var list = this._getList(item);
	list.modifyItem(item, mods);
};

/**
 * Create an item. We need to be passed a list since we may not have one.
 * 
 * @private
 */
ZmBaseController.prototype._doCreate =
function(list, args) {
	list.create(args);
};

// Miscellaneous


/**
 * Add listener to tag menu
 * 
 * @private
 */
ZmBaseController.prototype._setupTagMenu =
function(parent, listener) {
	if (!parent) return;
	var tagMenu = parent.getTagMenu();
	listener = listener || this._listeners[ZmOperation.TAG];
	if (tagMenu) {
		tagMenu.addSelectionListener(listener);
	}
	if (parent.isZmButtonToolBar) {
		var tagButton = parent.getOp(ZmOperation.TAG_MENU);
		if (tagButton) {
			tagButton.addDropDownSelectionListener(this._listeners[ZmOperation.TAG_MENU]);
		}
	}
};

/**
 * setup the move menu
 *
 * @private
 */
ZmBaseController.prototype._setupMoveMenu =
function(parent) {
	if (!parent) {
		return;
	}
	if (!parent.isZmButtonToolBar) {
		return;
	}
	var moveButton = parent.getOp(ZmOperation.MOVE_MENU);
	if (moveButton) {
		moveButton.addDropDownSelectionListener(this._listeners[ZmOperation.MOVE_MENU]);
	}
};

/**
 * Dynamically build the tag menu based on selected items and their tags.
 * 
 * @private
 */
ZmBaseController.prototype._setTagMenu =
function(parent, items) {

	if (!parent) { return; }

	var tagOp = parent.getOp(ZmOperation.TAG_MENU);
	if (tagOp) {
		var tagMenu = parent.getTagMenu();
		if (!tagMenu) { return; }

		// dynamically build tag menu add/remove lists
		items = items || AjxUtil.toArray(this.getItems());

		for (var i=0; i<items.length; i++) {
			if (items[i].cloneOf) {
				items[i] = items[i].cloneOf;
			}
		}

		var account = (appCtxt.multiAccounts && items.length == 1) ? items[0].getAccount() : null;

		// fetch tag tree from appctxt (not cache) for multi-account case
		tagMenu.set(items, appCtxt.getTagTree(account));
		if (parent.isZmActionMenu) {
			tagOp.setText(this._getTagMenuMsg(items.length, items));
		}
		else {
			tagMenu.parent.popup();

			// bug #17584 - we currently don't support creating new tags in new window
			if (appCtxt.isChildWindow || appCtxt.isWebClientOffline()) {
				var mi = tagMenu.getMenuItem(ZmTagMenu.MENU_ITEM_ADD_ID);
				if (mi) {
					mi.setVisible(false);
				}
			}
		}
	}
};

/**
 * copied some from ZmCalendarApp.createMiniCalButton
 * initializes the move button with {@link ZmFolderChooser} as the menu.
 *
 * @param	{DwtButton}	the button
 */
ZmBaseController.prototype._setMoveButton =
function(moveButton) {

	// create menu for button
	var moveMenu = new DwtMenu({parent: moveButton, style:DwtMenu.CALENDAR_PICKER_STYLE, id: "ZmMoveButton_" + this.getCurrentViewId()});
	moveMenu.getHtmlElement().style.width = "auto"; //make it dynamic  (so expanding long named sub-folders would expand width. (plus right now it sets it to 0 due to some styles)
	moveButton.setMenu(moveMenu, true);

	var chooser = this._folderChooser = new ZmFolderChooser({parent:moveMenu});
	var moveParams = this._getMoveParams(chooser);
	moveParams.overviewId += this._currentViewId; //so it works when switching views (cuz the tree has a listener and the tree is shared unless it's different ID). maybe there's a different way to solve this.
	chooser.setupFolderChooser(moveParams, this._moveMenuCallback.bind(this, moveButton));

	return moveButton;
};

/**
 * Resets the available operations on a toolbar or action menu.
 * 
 * @param {DwtControl}	parent		toolbar or action menu
 * @param {number}		num			number of items selected currently
 * @private
 */
ZmBaseController.prototype._resetOperations =
function(parent, num) {

	if (!parent) { return; }

	if (num == 0) {
		parent.enableAll(false);
		parent.enable(this.operationsToEnableOnZeroSelection, true);
	} else if (num == 1) {
		parent.enableAll(true);
		parent.enable(this.operationsToDisableOnSingleSelection, false);
	} else if (num > 1) {
		parent.enableAll(false);
		parent.enable(this.operationsToEnableOnMultiSelection, true);
    }

	// bug: 41758 - don't allow shared items to be tagged
	var folder = (num > 0) && this._getSearchFolder();
	if (folder && folder.isReadOnly()) {
		parent.enable(ZmOperation.TAG_MENU, false);
	}
    //this._resetQuickCommandOperations(parent);
};

/**
 * Resets a single operation on a toolbar or action menu.
 * 
 * @param {DwtControl}	parent		toolbar or action menu
 * @param {number}		num			number of items selected currently
 * @param {constant}	op			operation
 * @private
 */
ZmBaseController.prototype._resetOperation = function(parent, num, op) {};

/**
 * Resets the available options on the toolbar.
 * 
 * @private
 */
ZmBaseController.prototype._resetToolbarOperations =
function() {
	this._resetOperations(this._toolbar[this._currentViewId], this.getItemCount());
};


/**
 * @private
 */
ZmBaseController.prototype._getDefaultFocusItem =
function() {
	return this.getCurrentView();
};

/**
 * Sets a callback that shows a summary of what was done. The first three arguments are
 * provided for overriding classes that want to apply an action to an extended list of
 * items (retrieved via successive search, for example).
 *
 * @param {function}	actionMethod		the controller action method
 * @param {Array}		args				an arg list for above (except for items arg)
 * @param {Hash}		params				the params that will be passed to list action method
 * @param {closure}		allDoneCallback		the callback to run after all items processed
 * 
 * @private
 */
ZmBaseController.prototype._setupContinuation =
function(actionMethod, args, params, allDoneCallback) {
	params.finalCallback = this._continueAction.bind(this, {allDoneCallback:allDoneCallback});
};

/**
 * Runs the "all done" callback and shows a summary of what was done.
 *
 * @param {Hash}		params				a hash of parameters
 * @param {closure}	 	allDoneCallback		the callback to run when we're all done
 * 
 * @private
 */
ZmBaseController.prototype._continueAction =
function(params) {

	if (params.allDoneCallback) {
		params.allDoneCallback();
	}
	ZmBaseController.showSummary(params.actionSummary, params.actionLogItem, params.closeChildWin);
};



ZmBaseController.prototype._bubbleSelectionListener = function(ev) {

	this._actionEv = ev;
	var bubble = ev.item;
	if (ev.detail === DwtEvent.ONDBLCLICK) {
		this._actionEv.bubble = bubble;
		this._actionEv.address = bubble.addrObj || bubble.address;
		this._composeListener(ev);
	}
	else {
		var view = this.getItemView(),
			bubbleList = view && view._bubbleList;

		if (bubbleList && bubbleList.selectAddressText) {
			bubbleList.selectAddressText();
		}
	}
};

ZmBaseController.prototype._bubbleActionListener = function(ev, addr) {

	this._actionEv = ev;
	var bubble = this._actionEv.bubble = ev.item,
		address = this._actionEv.address = addr || bubble.addrObj || bubble.address,
		menu = this._getBubbleActionMenu();

	if (menu) {
		menu.enable(
			[
				ZmOperation.CONTACT,
				ZmOperation.ADD_TO_FILTER_RULE
			],
			!appCtxt.isWebClientOffline()
		);
		this._loadContactForMenu(menu, address, ev);
	}
};

ZmBaseController.prototype._getBubbleActionMenu = function() {

	if (this._bubbleActionMenu) {
		return this._bubbleActionMenu;
	}

	var menuItems = this._getBubbleActionMenuOps();
	var menu = this._bubbleActionMenu = new ZmActionMenu({
		parent:     this._shell,
		menuItems:  menuItems,
		controller: this,
		id:         ZmId.create({
			componentType:  ZmId.WIDGET_MENU,
			componentName:  this._currentViewId,
			app:            this._app
		})
	});

	if (appCtxt.get(ZmSetting.SEARCH_ENABLED)) {
		this._setSearchMenu(menu, false);
	}

	if (appCtxt.get(ZmSetting.FILTERS_ENABLED) && this._setAddToFilterMenu) {
		this._setAddToFilterMenu(menu);
	}

	menu.addPopdownListener(this._bubbleMenuPopdownListener.bind(this));

	for (var i = 0; i < menuItems.length; i++) {
		var menuItem = menuItems[i];
		if (this._listeners[menuItem]) {
			menu.addSelectionListener(menuItem, this._listeners[menuItem]);
		}
	}

	menu.setVisible(true);
	var clipboard = appCtxt.getClipboard();
	if (clipboard) {
		clipboard.init(menu.getOp(ZmOperation.COPY), {
			onMouseDown:    this._clipCopy.bind(this),
			onComplete:     this._clipCopyComplete.bind(this)
		});
	}

	return menu;
};

ZmBaseController.prototype._getBubbleActionMenuOps = function() {

	var ops = [];
	if (AjxClipboard.isSupported()) {
		// we use Zero Clipboard (a Flash hack) to copy address
		ops.push(ZmOperation.COPY);
	}
	ops.push(ZmOperation.SEARCH_MENU);
	ops.push(ZmOperation.NEW_MESSAGE);
	ops.push(ZmOperation.CONTACT);
	ops.push(ZmOperation.GO_TO_URL);

	if (appCtxt.get(ZmSetting.FILTERS_ENABLED) && this._filterListener) {
		ops.push(ZmOperation.ADD_TO_FILTER_RULE);
	}

	return ops;
};

// Copies address text from the active bubble to the clipboard.
ZmBaseController.prototype._clipCopy = function(clip) {
	clip.setText(this._actionEv.address + AjxEmailAddress.SEPARATOR);
};

ZmBaseController.prototype._clipCopyComplete = function(clip) {
	this._bubbleActionMenu.popdown();
};

// This will get called before the menu item listener. If that causes issues,
// we can run this function on a timer.
ZmBaseController.prototype._bubbleMenuPopdownListener = function() {

	var itemView = this.getItemView(),
		bubbleList = itemView && itemView._bubbleList,
		bubble = this._actionEv && this._actionEv.bubble;

	if (bubbleList) {
		bubbleList.clearRightSelection();
		if (bubble) {
			bubble.setClassName(bubbleList._normalClass);
		}
	}
	this._actionEv.bubble = null;
};

// handle click on an address (or "Select All") in popup DL expansion list
ZmBaseController.prototype._dlAddrSelected = function(match, ev) {
	this._actionEv.address = match;
	this._composeListener(ev);
};

ZmBaseController.prototype._loadContactForMenu = function(menu, address, ev, imItem) {

	var ac = window.parentAppCtxt || appCtxt;
	var contactsApp = ac.getApp(ZmApp.CONTACTS),
		address = address.isAjxEmailAddress ? address : new AjxEmailAddress(address),
		email = address.getAddress();

	if (!email) {
		return;
	}

	email = AjxStringUtil.parseMailtoLink(email).to;
	// first check if contact is cached, and no server call is needed
	var contact = contactsApp.getContactByEmail(email);
	if (contact) {
		address.setAddress(AjxStringUtil.parseMailtoLink(address.getAddress()).to);
		this._handleResponseGetContact(menu, address, ev, imItem, contact);
		return;
	}

	var op = menu.getOp(ZmOperation.CONTACT);
	if (op) {
		op.setText(ZmMsg.loading);
	}
	if (imItem) {
		if (ZmImApp.updateImMenuItemByAddress(imItem, address, false)) {
			imItem.setText(ZmMsg.loading);
		}
		else {
			imItem = null;	// done updating item, didn't need server call
		}
	}
	menu.popup(0, ev.docX || ev.item.getXW(), ev.docY || ev.item.getYH());
	var respCallback = this._handleResponseGetContact.bind(this, menu, address, ev, imItem);
	contactsApp.getContactByEmail(email, respCallback);
};

ZmBaseController.prototype._handleResponseGetContact = function(menu, address, ev, imItem, contact) {

	this._actionEv.contact = contact;
	this._setContactText(contact, menu);

	if (imItem) {
		if (contact) {
			ZmImApp.updateImMenuItemByContact(imItem, contact, address);
		}
		else {
			ZmImApp.handleResponseGetContact(imItem, address, true);
		}
	}
	menu.popup(0, ev.docX || ev.item.getXW(), ev.docY || ev.item.getYH());
};

/**
 * Sets text to "add" or "edit" based on whether a participant is a contact or not.
 * contact - the contact (or null)
 * extraMenu - see ZmMailListController.prototype._setContactText
 *
 * @private
 */
ZmBaseController.prototype._setContactText = function(contact, menu) {
	ZmBaseController.setContactTextOnMenu(contact, menu || this._actionMenu);
};

/**
 * Sets text to "add" or "edit" based on whether a participant is a contact or not.
 * contact - the contact (or null)
 * menus - array of one or more menus
 *
 * @private
 */
ZmBaseController.setContactTextOnMenu = function(contact, menu) {

	if (!menu) {
		return;
	}

	var newOp = ZmOperation.EDIT_CONTACT;
	var newText = null; //no change ("edit contact")

	if (contact && contact.isDistributionList()) {
		newText = ZmMsg.AB_EDIT_DL;
	}
	else if (contact && contact.isGroup()) {
		newText = ZmMsg.AB_EDIT_GROUP;
	}
	else if (!contact || contact.isGal) {
		// if there's no contact, or it's a GAL contact - there's no "edit" - just "add".
		newText = ZmMsg.AB_ADD_CONTACT;
		newOp = ZmOperation.NEW_CONTACT;
	}

	ZmOperation.setOperation(menu, ZmOperation.CONTACT, newOp, newText);

	if (appCtxt.isWebClientOffline()) {
		menu.enable(ZmOperation.CONTACT, false);
	}
};

/**
 * Add listener to search menu
 *
 * @param parent
 */
ZmBaseController.prototype._setSearchMenu = function(parent, isToolbar) {

	var searchMenu = parent && parent.getSearchMenu && parent.getSearchMenu();
	if (!searchMenu) {
		return;
	}
	searchMenu.addSelectionListener(ZmOperation.SEARCH, this._searchListener.bind(this, AjxEmailAddress.FROM, isToolbar));
	searchMenu.addSelectionListener(ZmOperation.SEARCH_TO, this._searchListener.bind(this, AjxEmailAddress.TO, isToolbar));

	if (this.getSearchFromText()) {
		searchMenu.getMenuItem(ZmOperation.SEARCH).setText(this.getSearchFromText());
	}
	if (this.getSearchToText()) {
		searchMenu.getMenuItem(ZmOperation.SEARCH_TO).setText(this.getSearchToText());
	}
};

/**
 * From Search based on email address.
 *
 * @private
 */
ZmBaseController.prototype._searchListener = function(addrType, isToolbar, ev) {

	var folder = this._getSearchFolder(),
		item = this._actionEv.item,
		address = this._actionEv.address,
		name;

	if (item && item.isZmMailMsg && folder && folder.isOutbound()) {
		/* sent/drafts search from all recipients */
		var toAddrs = item.getAddresses(AjxEmailAddress.TO).getArray(),
			ccAddrs = item.getAddresses(AjxEmailAddress.CC).getArray();

		name = toAddrs.concat(ccAddrs);
	}
	else if (address) {
		name = address.isAjxEmailAddress ? address.getAddress() : address;
	}

	if (name) {
		name = AjxStringUtil.parseMailtoLink(name).to;
		var ac = window.parentAppCtxt || window.appCtxt;
		var srchCtlr = ac.getSearchController();
		if (addrType === AjxEmailAddress.FROM) {
			srchCtlr.fromSearch(name);
		}
		else if (addrType === AjxEmailAddress.TO) {
			srchCtlr.toSearch(name);
		}
	}
};

/**
 * Compose message to participant.
 *
 * @private
 */
ZmBaseController.prototype._composeListener = function(ev, addr) {

	var addr = addr || (this._actionEv && this._actionEv.address),
		email = addr && addr.toString();

	if (email) {
		email = AjxStringUtil.parseMailtoLink(email).to;
		AjxDispatcher.run("Compose", {
			action:         ZmOperation.NEW_MESSAGE,
			inNewWindow:    this._app._inNewWindow(ev),
			toOverride:     email + AjxEmailAddress.SEPARATOR
		});
	}
};

/**
 * If there's a contact for the participant, edit it, otherwise add it.
 *
 * @private
 */
ZmBaseController.prototype._contactListener = function(ev) {
	var loadCallback = this._handleLoadContactListener.bind(this);
	AjxDispatcher.require(["ContactsCore", "Contacts"], false, loadCallback, null, true);
};

/**
 * @private
 */
ZmBaseController.prototype._handleLoadContactListener = function() {

	var cc = appCtxt.isChildWindow ? window.parentAppCtxt.getApp(ZmApp.CONTACTS).getContactController() :
									AjxDispatcher.run("GetContactController");
	var contact = this._actionEv.contact;
	if (contact) {
		if (contact.isDistributionList()) {
			this._editListener(this._actionEv, contact);
			return;
		}
		if (contact.isLoaded) {
			var isDirty = contact.isGal;
			cc.show(contact, isDirty);
		} else {
			var callback = this._loadContactCallback.bind(this);
			contact.load(callback);
		}
	} else {
		var contact = cc._createNewContact(this._actionEv);
		contact.setAttr(ZmContact.F_email, AjxStringUtil.parseMailtoLink(contact.getAttr(ZmContact.F_email)).to);
		cc.show(contact, true);
	}
	if (appCtxt.isChildWindow) {
		window.close();
	}
};

ZmBaseController.prototype.getSearchFromText = function() {
	return null;
};

ZmBaseController.prototype.getSearchToText = function() {
	return null;
};

ZmBaseController.prototype._createNewContact = function(ev) {
	var contact = new ZmContact(null);
	contact.initFromEmail(ev.address);
	return contact;
};

ZmBaseController.prototype._loadContactCallback = function(resp, contact) {
	AjxDispatcher.run("GetContactController").show(contact);
};

ZmBaseController.prototype._getSearchFolder = function() {
	var id = this._getSearchFolderId();
	return id && appCtxt.getById(id);
};

/**
 * This method gets overridden if folder id is retrieved another way
 *
 * @param {boolean}		allowComplex	if true, search can have other terms aside from the folder term
 * @private
 */
ZmBaseController.prototype._getSearchFolderId = function(allowComplex) {
	var s = this._activeSearch && this._activeSearch.search;
	return s && (allowComplex || s.isSimple()) && s.folderId;
};

ZmBaseController.prototype._goToUrlListener = function(ev) {
	var addr = this._getAddress(this._actionEv.address);
	var parts = addr.split("@");
	if (!parts.length) {
		return;
	}
	var domain = parts[1];
	var pieces = domain.split(".");
	var url = "http://" + (pieces.length <= 2 ? "www." + domain : domain);
	window.open(url, "_blank");

};

ZmBaseController.prototype._getAddress = function(obj) {
	return obj.isAjxEmailAddress ? obj.address : obj;
};
