/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2004, 2005, 2006, 2007, 2008, 2009, 2010 Zimbra, Inc.
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
 * @overview
 * This file defines the list controller.
 *
 */

/**
 * Creates a new, empty list controller. This controller must be initialized before it can be used.
 * @class
 * This class is a base class for any controller that manages lists of items (for example, mail or
 * contacts). It consolidates handling of list functionality (for example, selection) and of common
 * operations such as tagging and deletion. Operations may be accessed by the user through
 * either the tool bar or an action menu. The public method {@link #show} gets everything going,
 * and then the controller just handles events.
 *
 * <p>Support is also present for handling multiple views (for example, contacts).</p>
 *
 * <p>Controllers for single items may extend this class, since the functionality needed is
 *  virtually the same. An item can be thought of as the degenerate form of a list.</p>
 *
 * @author Conrad Damon
 *
 * @param {DwtControl}		container	the containing shell
 * @param {ZmApp}		app		the containing application
 * 
 * @extends		ZmController
 */
ZmListController = function(container, app) {

	if (arguments.length == 0) { return; }
	ZmController.call(this, container, app);

	this._toolbar = {};			// ZmButtonToolbar (one per view)
	this._navToolBar = {};		// ZmNavToolBar (one per view)
	this._listView = {};		// ZmListView (one per view)
	this._tabGroups = {};		// DwtTabGroup (one per view)
	this._list = null;			// ZmList (the data)
	this._actionMenu = null; 	// ZmActionMenu
	this._actionEv = null;
	this._activeSearch = null;

	this._tagList = appCtxt.getTagTree();
	if (this._tagList) {
		this._tagChangeLstnr = new AjxListener(this, this._tagChangeListener);
		this._tagList.addChangeListener(this._tagChangeLstnr);
	}

	// create a listener for each operation
	this._listeners = {};
	this._listeners[ZmOperation.NEW_MENU] = new AjxListener(this, this._newListener);
	this._listeners[ZmOperation.TAG_MENU] = new AjxListener(this, this._tagButtonListener);
	this._listeners[ZmOperation.TAG] = new AjxListener(this, this._tagListener);
	this._listeners[ZmOperation.PRINT] = new AjxListener(this, this._printListener);
	this._listeners[ZmOperation.DELETE]  = new AjxListener(this, this._deleteListener);
	this._listeners[ZmOperation.CLOSE] = new AjxListener(this, this._backListener);
	this._listeners[ZmOperation.MOVE]  = new AjxListener(this, this._moveListener);
	this._listeners[ZmOperation.SEARCH] = new AjxListener(this, this._participantSearchListener);
	this._listeners[ZmOperation.BROWSE] = new AjxListener(this, this._participantBrowseListener);
	this._listeners[ZmOperation.NEW_MESSAGE] = new AjxListener(this, this._participantComposeListener);
	if (window.ZmImApp) {
		this._listeners[ZmOperation.IM] = ZmImApp.getImMenuItemListener();
	}
	this._listeners[ZmOperation.CONTACT] = new AjxListener(this, this._participantContactListener);
	this._listeners[ZmOperation.VIEW] = new AjxListener(this, this._viewMenuItemListener);

	this._menuPopdownListener = new AjxListener(this, this._menuPopdownActionListener);

	this._dropTgt = new DwtDropTarget("ZmTag");
	this._dropTgt.markAsMultiple();
	this._dropTgt.addDropListener(new AjxListener(this, this._dropListener));

	this._itemCountText = {};
	this._continuation = {count:0, totalItems:0};
};

ZmListController.prototype = new ZmController;
ZmListController.prototype.constructor = ZmListController;

// When performing a search action (bug 10317) on all items (including those not loaded),
// number of items to load on each search to work through all results. Should be a multiple
// of ZmList.CHUNK_SIZE. Make sure to test if you change these.
ZmListController.CONTINUATION_SEARCH_ITEMS = 500;

// public methods

/**
 * Returns a string representation of the object.
 * 
 * @return		{String}		a string representation of the object
 */
ZmListController.prototype.toString =
function() {
	return "ZmListController";
};

/**
 * Performs some setup for displaying the given search results in a list view. Subclasses will need
 * to do the actual display work, typically by calling the list view's {@link #set} method.
 *
 * @param {ZmSearchResult}	searchResults		the search results
 * @param {DwtComposite}		view				the view type to use
 */
ZmListController.prototype.show	=
function(searchResults, view) {
	this._currentView = view || this._defaultView();
	this._activeSearch = searchResults;
	// save current search for use by replenishment
	if (searchResults) {
		this._currentSearch = searchResults.search;
	}
	this.currentPage = 1;
	this.maxPage = 1;
};

/**
 * Gets the search string.
 * 
 * @return	{String}	the search string
 */
ZmListController.prototype.getSearchString =
function() {
	return this._currentSearch ? this._currentSearch.query : "";
};

/**
 * Gets the search string hint.
 * 
 * @return	{String}	the search string hint
 */
ZmListController.prototype.getSearchStringHint =
function() {
	return this._currentSearch ? this._currentSearch.queryHint : "";
};

/**
 * Gets the current view.
 * 
 * @return	{ZmListView}	the view
 */
ZmListController.prototype.getCurrentView =
function() {
	return this._listView[this._currentView];
};

/**
 * Gets the current tool bar.
 * 
 * @return	{ZmButtonToolbar}		the toolbar
 */
ZmListController.prototype.getCurrentToolbar =
function() {
	return this._toolbar[this._currentView];
};

/**
 * Gets the list.
 * 
 * @return	{ZmList}		the list
 */
ZmListController.prototype.getList =
function() {
	return this._list;
};

/**
 * Sets the list.
 * 
 * @param	{ZmList}	newList		the new list
 */
ZmListController.prototype.setList =
function(newList) {
	if (newList != this._list && (newList instanceof ZmList)) {
		// dtor current list if necessary
		if (this._list)
			this._list.clear();
		this._list = newList;
	}
};

/**
 * Sets the "has more" state.
 * 
 * @param	{Boolean}	hasMore		<code>true</code> if has more
 */
ZmListController.prototype.setHasMore =
function(hasMore) {
	// Note: This is a bit of a HACK that is an attempt to overcome an
	// offline issue. The problem is during initial sync when more
	// messages come in: the forward navigation arrow doesn't get enabled.
	
	if (hasMore) {
		// bug: 30546
		this._list.setHasMore(hasMore);
		this._resetNavToolBarButtons(this._currentView);
	}
};

/**
 * Handles the key action.
 * 
 * @param	{constant}	actionCode		the action code
 * @return	{Boolean}	<code>true</code> if the action is handled
 */
ZmListController.prototype.handleKeyAction =
function(actionCode) {
	DBG.println(AjxDebug.DBG3, "ZmListController.handleKeyAction");
	var listView = this._listView[this._currentView];

	switch (actionCode) {

		case DwtKeyMap.DBLCLICK:
			return listView.handleKeyAction(actionCode);

		case ZmKeyMap.DEL:
			var tb = this._toolbar[this._currentView];
			var button = tb && (tb.getButton(ZmOperation.DELETE) || tb.getButton(ZmOperation.DELETE_MENU));
			if (button && button.getEnabled()) {
				this._doDelete(this._listView[this._currentView].getSelection());
			}
			break;

		case ZmKeyMap.FLAG:
			this._doFlag(listView.getSelection());
			break;

		case ZmKeyMap.MOVE:
			this._moveListener.call(this);
			break;

		case ZmKeyMap.NEXT_PAGE:
			var ntb = this._navToolBar[this._currentView];
			var button = ntb ? ntb.getButton(ZmOperation.PAGE_FORWARD) : null;
			if (button && button.getEnabled()) {
				this._paginate(this._currentView, true);
			}
			break;

		case ZmKeyMap.PREV_PAGE:
			var ntb = this._navToolBar[this._currentView];
			var button = ntb ? ntb.getButton(ZmOperation.PAGE_BACK) : null;
			if (button && button.getEnabled()) {
				this._paginate(this._currentView, false);
			}
			break;

		case ZmKeyMap.PRINT:
			if (appCtxt.get(ZmSetting.PRINT_ENABLED)) {
				this._printListener();
			}
			break;

		case ZmKeyMap.TAG:
			var items = listView.getSelection();
			if (items && items.length && (appCtxt.getTagTree().size() > 0)) {
				var dlg = appCtxt.getPickTagDialog();
				ZmController.showDialog(dlg, new AjxCallback(this, this._tagSelectionCallback, [items, dlg]));
			}
			break;

		case ZmKeyMap.UNTAG:
			if (appCtxt.get(ZmSetting.TAGGING_ENABLED)) {
				var items = listView.getSelection();
				if (items && items.length) {
					this._doRemoveAllTags(items);
				}
			}
			break;

		default:
			return ZmController.prototype.handleKeyAction.call(this, actionCode);
	}
	return true;
};

// abstract protected methods

// Creates the view element
ZmListController.prototype._createNewView	 	= function() {};

// Returns the view ID
ZmListController.prototype._getViewType 		= function() {};
ZmListController.prototype._defaultView 		= function() { return this._getViewType(); };

// Populates the view with data
ZmListController.prototype._setViewContents		= function(view) {};

// Returns text for the tag operation
ZmListController.prototype._getTagMenuMsg 		= function(num) {};

// Returns text for the move dialog
ZmListController.prototype._getMoveDialogTitle	= function(num) {};

// Returns a list of desired toolbar operations
ZmListController.prototype._getToolBarOps 		= function() {};

// Returns a list of desired action menu operations
ZmListController.prototype._getActionMenuOps 	= function() {};

// private and protected methods

/**
 * Creates basic elements and sets the toolbar and action menu.
 * 
 * @private
 */
ZmListController.prototype._setup =
function(view) {
	this._initialize(view);
	this._resetOperations(this._toolbar[view], 0);
};

/**
 * Creates the basic elements: toolbar, list view, and action menu.
 *
 * @private
 */
ZmListController.prototype._initialize =
function(view) {
	this._initializeToolBar(view);
	this._initializeListView(view);
	this._initializeTabGroup(view);
};

// Below are functions that return various groups of operations, for cafeteria-style
// operation selection.

/**
 * @private
 */
ZmListController.prototype._standardToolBarOps =
function() {
	return [ZmOperation.NEW_MENU,
			ZmOperation.SEP,
			ZmOperation.DELETE, ZmOperation.MOVE, ZmOperation.PRINT];
};

/**
 * @private
 */
ZmListController.prototype._standardActionMenuOps =
function() {
	return [ZmOperation.TAG_MENU, ZmOperation.DELETE, ZmOperation.MOVE, ZmOperation.PRINT];
};

/**
 * @private
 */
ZmListController.prototype._participantOps =
function() {
	var ops = [ZmOperation.SEARCH, ZmOperation.BROWSE];

	if (ZmSetting.MAIL_ENABLED) {
		ops.push(ZmOperation.NEW_MESSAGE);
	}

	if (ZmSetting.IM_ENABLED) {
		ops.push(ZmOperation.IM);
	}

	if (ZmSetting.CONTACTS_ENABLED) {
		ops.push(ZmOperation.CONTACT);
	}

	return ops;
};

/**
 * Initializes the toolbar buttons and listeners.
 * 
 * @private
 */
ZmListController.prototype._initializeToolBar =
function(view) {
	if (this._toolbar[view]) { return; }

	var buttons = this._getToolBarOps();
	if (!buttons) { return; }

	var tb = this._toolbar[view] = new ZmButtonToolBar({parent:this._container, buttons:buttons, context:view, controller:this,
														refElementId:ZmId.SKIN_APP_TOP_TOOLBAR});

	var button;
	for (var i = 0; i < tb.opList.length; i++) {
		button = tb.opList[i];
		if (this._listeners[button]) {
			tb.addSelectionListener(button, this._listeners[button]);
		}
	}

	button = tb.getButton(ZmOperation.PRINT);
	if (button) {
		button.setText(null);
	}

	button = tb.getButton(ZmOperation.MOVE);
	if (button) {
		button.setText(null);
	}

	button = tb.getButton(ZmOperation.NEW_MENU);
	if (button) {
		var listener = new AjxListener(tb, ZmListController._newDropDownListener);
		button.addDropDownSelectionListener(listener);
		tb._ZmListController_this = this;
		tb._ZmListController_newDropDownListener = listener;
	}

	button = tb.getButton(ZmOperation.TAG_MENU);
	if (button) {
		button.noMenuBar = true;
		this._setupTagMenu(tb);
	}

	appCtxt.notifyZimlets("initializeToolbar", [this._app, tb, this, view], {waitUntilLoaded:true});
};

/**
 * Initializes list view and its listeners.
 * 
 * @private
 */
ZmListController.prototype._initializeListView =
function(view) {
	if (this._listView[view]) { return; }

	this._listView[view] = this._createNewView(view);
	this._listView[view].addSelectionListener(new AjxListener(this, this._listSelectionListener));
	this._listView[view].addActionListener(new AjxListener(this, this._listActionListener));
};

/**
 * Initializes action menu: menu items and listeners
 * 
 * @private
 */
ZmListController.prototype._initializeActionMenu =
function() {
	if (this._actionMenu) { return; }

	var menuItems = this._getActionMenuOps();
	if (!menuItems) return;
	this._actionMenu = new ZmActionMenu({parent:this._shell, menuItems:menuItems, context:this._getMenuContext(),
										 controller:this});
	this._addMenuListeners(this._actionMenu);
	if (appCtxt.get(ZmSetting.TAGGING_ENABLED)) {
		this._setupTagMenu(this._actionMenu);
	}
};

/**
 * @private
 */
ZmListController.prototype._addMenuListeners =
function(menu) {
	var menuItems = menu.opList;
	for (var i = 0; i < menuItems.length; i++) {
		var menuItem = menuItems[i];
		if (this._listeners[menuItem]) {
			menu.addSelectionListener(menuItem, this._listeners[menuItem], 0);
		}
	}
	menu.addPopdownListener(this._menuPopdownListener);
};

/**
 * @private
 */
ZmListController.prototype._initializeTabGroup =
function(view) {
	if (this._tabGroups[view]) return;

	this._tabGroups[view] = this._createTabGroup();
	this._tabGroups[view].newParent(appCtxt.getRootTabGroup());
	this._toolbar[view].noFocus = true;
	this._tabGroups[view].addMember(this._listView[view].getTabGroupMember());
};

/**
 * Creates the desired application view.
 *
 * @param params		[hash]			hash of params:
 *        view			[constant]		view ID
 *        elements		[array]			array of view components
 *        isAppView		[boolean]*		this view is a top-level app view
 *        clear			[boolean]*		if true, clear the hidden stack of views
 *        pushOnly		[boolean]*		don't reset the view's data, just swap the view in
 *        isTransient	[boolean]*		this view doesn't go on the hidden stack
 *        stageView		[boolean]*		stage the view rather than push it
 *        tabParams		[hash]*			button params; view is opened in app tab instead of being stacked
 *        
 * @private
 */
ZmListController.prototype._setView =
function(params) {

	var view = params.view;

	// create the view (if we haven't yet)
	if (!this._appViews[view]) {
		// view management callbacks
		var callbacks = {};
		callbacks[ZmAppViewMgr.CB_PRE_HIDE]		= this._preHideCallback ? new AjxCallback(this, this._preHideCallback) : null;
		callbacks[ZmAppViewMgr.CB_PRE_UNLOAD]	= this._preUnloadCallback ? new AjxCallback(this, this._preUnloadCallback) : null;
		callbacks[ZmAppViewMgr.CB_POST_HIDE]	= this._postHideCallback ? new AjxCallback(this, this._postHideCallback) : null;
		callbacks[ZmAppViewMgr.CB_PRE_SHOW]		= this._preShowCallback ? new AjxCallback(this, this._preShowCallback) : null;
		callbacks[ZmAppViewMgr.CB_POST_SHOW]	= this._postShowCallback ? new AjxCallback(this, this._postShowCallback) : null;

		params.callbacks = callbacks;
		params.viewId = view;
		this._app.createView(params);
		this._appViews[view] = 1;
	}

	// populate the view
	if (!params.pushOnly) {
		this._setViewContents(view);
	}

	// push the view
	if (params.stageView) {
		this._app.stageView(view);
	} else {
		return (params.clear ? this._app.setView(view) : this._app.pushView(view));
	}
};


// List listeners

/**
 * List selection event - handle flagging if a flag icon was clicked, otherwise
 * reset the toolbar based on how many items are selected.
 * 
 * @private
 */
ZmListController.prototype._listSelectionListener =
function(ev) {
	if (ev.field == ZmItem.F_FLAG) {
		this._doFlag([ev.item]);
	} else {
		var lv = this._listView[this._currentView];

		if (appCtxt.get(ZmSetting.SHOW_SELECTION_CHECKBOX)) {
			if (!ev.ctrlKey) {
				lv.setSelectionHdrCbox(false);
			}
		}

		this._resetOperations(this._toolbar[this._currentView], lv.getSelectionCount());
	}
};

/**
 * List action event - set the dynamic tag menu, and enable operations in the
 * action menu based on the number of selected items. Note that the menu is not
 * actually popped up here; that's left up to the subclass, which should
 * override this function.
 * 
 * @private
 */
ZmListController.prototype._listActionListener =
function(ev) {
	this._actionEv = ev;
	var actionMenu = this.getActionMenu();
	if (appCtxt.get(ZmSetting.TAGGING_ENABLED)) {
		this._setTagMenu(actionMenu);
	}
	this._resetOperations(actionMenu, this._listView[this._currentView].getSelectionCount());
};

ZmListController.prototype._menuPopdownActionListener =
function() {
	if (!this._pendingActionData) {
		this._listView[this._currentView].handleActionPopdown();
	}
};

// Operation listeners

/**
 * Create some new thing, via a dialog. If just the button has been pressed (rather than
 * a menu item), the action taken depends on the app.
 *
 * @param {DwtUiEvent}	ev		the ui event
 * @param {constant}	op		the operation ID
 * @param {Boolean}		newWin	<code>true</code> if in a separate window
 * 
 * @private
 */
ZmListController.prototype._newListener =
function(ev, op, params) {
	if (!ev && !op) { return; }
	op = op || ev.item.getData(ZmOperation.KEY_ID);
	if (!op || op == ZmOperation.NEW_MENU) {
		op = this._defaultNewId;
	}

	var app = ZmApp.OPS_R[op];
	if (app) {
		params = params || {};
		params.ev = ev;
		appCtxt.getApp(app).handleOp(op, params);
	} else {
		ZmController.prototype._newListener.call(this, ev, op);
	}
};

/**
 * Tag button has been pressed. We don't tag anything (since no tag has been selected),
 * we just show the dynamic tag menu.
 * 
 * @private
 */
ZmListController.prototype._tagButtonListener =
function(ev) {
	var toolbar = this._toolbar[this._currentView];
	if (ev.item.parent == toolbar) {
		this._setTagMenu(toolbar);
	}
};

/**
 * Tag/untag items.
 * 
 * @private
 */
ZmListController.prototype._tagListener =
function(ev) {
	if (appCtxt.getAppViewMgr().getCurrentViewId() == this._getViewType()) {
		var tagEvent = ev.getData(ZmTagMenu.KEY_TAG_EVENT);
		var tagAdded = ev.getData(ZmTagMenu.KEY_TAG_ADDED);
		var items = this._listView[this._currentView].getSelection();
		if (tagEvent == ZmEvent.E_TAGS && tagAdded) {
			this._doTag(items, ev.getData(Dwt.KEY_OBJECT), true);
		} else if (tagEvent == ZmEvent.E_CREATE) {
			this._pendingActionData = items;
			var newTagDialog = appCtxt.getNewTagDialog();
			if (!this._newTagCb) {
				this._newTagCb = new AjxCallback(this, this._newTagCallback);
			}
			ZmController.showDialog(newTagDialog, this._newTagCb);
			newTagDialog.registerCallback(DwtDialog.CANCEL_BUTTON, this._clearDialog, this, newTagDialog);
		} else if (tagEvent == ZmEvent.E_TAGS && !tagAdded) {
			this._doTag(items, ev.getData(Dwt.KEY_OBJECT), false);
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
ZmListController.prototype._tagSelectionCallback =
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
ZmListController.prototype._printListener =
function(ev) {
	var listView = this._listView[this._currentView];
	var items = listView.getSelection();
	var item = (items instanceof Array) ? items[0] : items;
	window.open(item.getRestUrl(), "_blank");
};

ZmListController.prototype._backListener =
function(ev) {
	this._app.popView();
};

/**
 * Delete one or more items.
 * 
 * @private
 */
ZmListController.prototype._deleteListener =
function(ev) {
	this._doDelete(this._listView[this._currentView].getSelection());
};

/**
 * Move button has been pressed, show the dialog.
 * 
 * @private
 */
ZmListController.prototype._moveListener =
function(ev, list) {
	this._pendingActionData = list || (this._listView[this._currentView].getSelection());
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
ZmListController.prototype._getMoveParams =
function(dlg) {
	var org = ZmApp.ORGANIZER[this._app._name] || ZmOrganizer.FOLDER;
	return {
		overviewId:		dlg.getOverviewId(this._app._name),
		data:			this._pendingActionData,
		treeIds:		[org],
		title:			this._getMoveDialogTitle(this._pendingActionData.length),
		description:	ZmMsg.targetFolder,
		treeStyle:		DwtTree.SINGLE_STYLE,
		appName:		this._app._name
	};
};

/**
 * Switch to selected view.
 * 
 * @private
 */
ZmListController.prototype._viewMenuItemListener =
function(ev) {
	if (ev.detail == DwtMenuItem.CHECKED ||
		ev.detail == DwtMenuItem.UNCHECKED)
	{
		this.switchView(ev.item.getData(ZmOperation.MENUITEM_ID));
	}
};

// Navbar listeners

/**
 * @private
 */
ZmListController.prototype._navBarListener =
function(ev) {
	// skip listener for non-current views
	if (appCtxt.getAppViewMgr().getCurrentViewId() != this._getViewType()) { return; }

	var op = ev.item.getData(ZmOperation.KEY_ID);

	if (op == ZmOperation.PAGE_BACK || op == ZmOperation.PAGE_FORWARD) {
		this._paginate(this._currentView, (op == ZmOperation.PAGE_FORWARD));
	}
};

// Participant listeners

/**
 * Search based on email address.
 * 
 * @private
 */
ZmListController.prototype._participantSearchListener =
function(ev) {
	var name = this._actionEv.address.getAddress();
	appCtxt.getSearchController().fromSearch(name);
};

/**
 * Browse based on email address.
 * 
 * @private
 */
ZmListController.prototype._participantBrowseListener =
function(ev) {
	var name = this._actionEv.address.getAddress();
	appCtxt.getSearchController().fromBrowse(name);
};

/**
 * Compose message to participant.
 * 
 * @private
 */
ZmListController.prototype._participantComposeListener =
function(ev) {
	var name = this._actionEv.address.toString(AjxEmailAddress.SEPARATOR) + AjxEmailAddress.SEPARATOR;
	AjxDispatcher.run("Compose", {action: ZmOperation.NEW_MESSAGE, inNewWindow: this._app._inNewWindow(ev),
								  toOverride: name});
};

/**
 * If there's a contact for the participant, edit it, otherwise add it.
 * 
 * @private
 */
ZmListController.prototype._participantContactListener =
function(ev) {
	var loadCallback = new AjxCallback(this, this._handleLoadParticipantContactListener);
	AjxDispatcher.require(["ContactsCore", "Contacts"], false, loadCallback, null, true);
};

/**
 * @private
 */
ZmListController.prototype._handleLoadParticipantContactListener =
function() {
	var cc = AjxDispatcher.run("GetContactController");
	if (this._actionEv.contact) {
		if (this._actionEv.contact.isLoaded) {
			cc.show(this._actionEv.contact);
		} else {
			var callback = new AjxCallback(this, this._loadContactCallback);
			this._actionEv.contact.load(callback);
		}
	} else {
		var contact = this._createNewContact(this._actionEv);
		cc.show(contact, true);
	}
};

/**
 * @private
 */
ZmListController.prototype._createNewContact =
function(ev) {
	var contact = new ZmContact(null);
	contact.initFromEmail(ev.address);
	return contact;
};

/**
 * @private
 */
ZmListController.prototype._loadContactCallback =
function(resp, contact) {
	AjxDispatcher.run("GetContactController").show(contact);
};

// Drag and drop listeners

/**
 * @private
 */
ZmListController.prototype._dragListener =
function(ev) {
	if (ev.action == DwtDragEvent.SET_DATA) {
		ev.srcData = {data: ev.srcControl.getDnDSelection(), controller: this};
	}
};

/**
 * The list view as a whole is the drop target, since it's the lowest-level widget. Still, we
 * need to find out which item got dropped onto, so we get that from the original UI event
 * (a mouseup). The header is within the list view, but not an item, so it's not a valid drop
 * target. One drawback of having the list view be the drop target is that we can't exercise
 * fine-grained control on what's a valid drop target. If you enter via an item and then drag to
 * the header, it will appear to be valid.
 * 
 * @private
 */
ZmListController.prototype._dropListener =
function(ev) {
	var view = this._listView[this._currentView];
	var div = view.getTargetItemDiv(ev.uiEvent);
	var item = view.getItemFromElement(div);

	// only tags can be dropped on us
	var data = ev.srcData.data;
	if (ev.action == DwtDropEvent.DRAG_ENTER) {
		ev.doIt = (item && (item instanceof ZmItem) && !item.isShared() && this._dropTgt.isValidTarget(data));
		DBG.println(AjxDebug.DBG3, "DRAG_ENTER: doIt = " + ev.doIt);
		view.dragSelect(div);
	} else if (ev.action == DwtDropEvent.DRAG_DROP) {
		view.dragDeselect(div);
		var items = [item];
		var sel = view.getSelection();
		if (sel.length) {
			var vec = AjxVector.fromArray(sel);
			if (vec.contains(item))
				items = sel;
		}
		this._doTag(items, data, true);
	} else if (ev.action == DwtDropEvent.DRAG_LEAVE) {
		view.dragDeselect(div);
	} else if (ev.action == DwtDropEvent.DRAG_OP_CHANGED) {
		// nothing
	}
};

// Dialog callbacks

/**
 * Created a new tag, now apply it.
 * 
 * @private
 */
ZmListController.prototype._tagChangeListener =
function(ev) {
	// only process if current view is this view!
	if (appCtxt.getAppViewMgr().getCurrentViewId() == this._getViewType()) {
		if (ev.type == ZmEvent.S_TAG && ev.event == ZmEvent.E_CREATE && this._pendingActionData) {
			var tag = ev.getDetail("organizers")[0];
			this._doTag(this._pendingActionData, tag, true);
			this._pendingActionData = null;
			this._menuPopdownActionListener();
		}
	}
};

// new organizer callbacks

/**
 * Move stuff to a new folder.
 * 
 * @private
 */
ZmListController.prototype._moveCallback =
function(folder) {
	this._doMove(this._pendingActionData, folder);
	this._clearDialog(appCtxt.getChooseFolderDialog());
	this._pendingActionData = null;
};

// Data handling

/**
 * Flag/unflag an item
 * 
 * @private
 */
ZmListController.prototype._doFlag =
function(items, on) {

	items = AjxUtil.toArray(items);
	if (!items.length) { return; }

	if (items[0] instanceof ZmItem) {
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
    params.actionText = on ? ZmMsg.actionFlag : ZmMsg.actionUnflag;
	var list = this._setupContinuation(this._doFlag, [on], params);
	list.flagItems(params);
};

/**
 * Tag/untag items
 * 
 * @private
 */
ZmListController.prototype._doTag =
function(items, tag, doTag) {

	items = AjxUtil.toArray(items);
	if (!items.length) { return; }

	var params = {items:items, tag:tag, doTag:doTag};
	var list = this._setupContinuation(this._doTag, [tag, doTag], params);
	list.tagItems(params);
};

/**
 * Remove all tags for given items
 * 
 * @private
 */
ZmListController.prototype._doRemoveAllTags =
function(items) {

	items = AjxUtil.toArray(items);
	if (!items.length) { return; }

	var params = {items:items};
	var list = this._setupContinuation(this._doRemoveAllTags, null, params);
	list.removeAllTags(params);
};

/**
* Deletes one or more items from the list.
*
* @param items			[Array]			list of items to delete
* @param hardDelete		[boolean]*		if true, physically delete items
* @param attrs			[Object]*		additional attrs for SOAP command
* 
* @private
*/
ZmListController.prototype._doDelete =
function(items, hardDelete, attrs) {

	items = AjxUtil.toArray(items);
	if (!items.length) { return; }

	var params = {items:items, hardDelete:hardDelete, attrs:attrs, childWin:appCtxt.isChildWindow && window};
	var allDoneCallback = new AjxCallback(this, this._doneDelete);
	var list = this._setupContinuation(this._doDelete, [hardDelete, attrs], params, allDoneCallback);
	list.deleteItems(params);
};

ZmListController.prototype._doneDelete =
function() {
	this._checkItemCount();
}

/**
 * Moves a list of items to the given folder. Any item already in that folder is excluded.
 *
 * @param {Array}	items		a list of items to move
 * @param {ZmFolder}	folder		the destination folder
 * @param {Object}	attrs		the additional attrs for SOAP command
 * @param {Boolean}		isShiftKey	<code>true</code> if forcing a copy action
 * @private
 */
ZmListController.prototype._doMove =
function(items, folder, attrs, isShiftKey) {

	items = AjxUtil.toArray(items);
	if (!items.length) { return; }

	var move = [];
	var copy = [];
	if (items[0] instanceof ZmItem) {
		for (var i = 0; i < items.length; i++) {
			var item = items[i];
			if (!item.folderId || item.folderId != folder.id) {
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

	var params = {folder:folder, attrs:attrs};
	var allDoneCallback = new AjxCallback(this, this._doneMove);
	if (move.length) {
		params.items = move;
		var list = this._setupContinuation(this._doMove, [folder, attrs, isShiftKey], params, allDoneCallback);
		list.moveItems(params);
	}

	if (copy.length) {
		params.items = copy;
		var list = this._setupContinuation(this._doMove, [folder, attrs, isShiftKey], params, allDoneCallback);
		list.copyItems(params);
	}
};

ZmListController.prototype._doneMove =
function() {
	this._checkItemCount();
}

/**
 * Decides whether an item is movable
 *
 * @param {Object}	item			the item to be checked
 * @param {Boolean}		isShiftKey	<code>true</code> if forcing a copy (not a move)
 * @param {ZmFolder}	folder		the folder this item belongs under
 * 
 * @private
 */
ZmListController.prototype._isItemMovable =
function(item, isShiftKey, folder) {
	return (!isShiftKey && !item.isReadOnly() && !folder.isReadOnly());
};

/**
 * Modify an item.
 * 
 * @private
 */
ZmListController.prototype._doModify =
function(item, mods) {
	var list = item.list || this._list;
	list.modifyItem(item, mods);
};

/**
 * Create an item. We need to be passed a list since we may not have one.
 * 
 * @private
 */
ZmListController.prototype._doCreate =
function(list, args) {
	list.create(args);
};

// Miscellaneous

/**
 * Adds the same listener to all of the items in a button or menu item's submenu.
 * By default, propagates the listener for the given operation.
 *
 * @param {DwtControl}	parent		the parent toolbar or menu
 * @param {constant}	op			the operation (button or menu item)
 * @param {AjxListener}	listener	the listener to propagate
 * @private
 */
ZmListController.prototype._propagateMenuListeners =
function(parent, op, listener) {
	if (!parent) { return; }
	listener = listener || this._listeners[op];
	var opWidget = parent.getOp(op);
	if (opWidget) {
		var menu = opWidget.getMenu();
	    var items = menu.getItems();
		var cnt = menu.getItemCount();
		for (var i = 0; i < cnt; i++) {
			items[i].addSelectionListener(listener);
		}
	}
};

/**
 * Add listener to tag menu
 * 
 * @private
 */
ZmListController.prototype._setupTagMenu =
function(parent) {
	if (!parent) return;
	var tagMenu = parent.getTagMenu();
	if (tagMenu)
		tagMenu.addSelectionListener(this._listeners[ZmOperation.TAG]);
	if (parent instanceof ZmButtonToolBar) {
		var tagButton = parent.getOp(ZmOperation.TAG_MENU);
		if (tagButton)
			tagButton.addDropDownSelectionListener(this._listeners[ZmOperation.TAG_MENU]);
	}
};

/**
 * Dynamically build the tag menu based on selected items and their tags.
 * 
 * @private
 */
ZmListController.prototype._setTagMenu =
function(parent) {
	if (!parent) return;
	var tagOp = parent.getOp(ZmOperation.TAG_MENU);
	if (tagOp) {
		var tagMenu = parent.getTagMenu();

		// dynamically build tag menu add/remove lists
		var items = this._listView[this._currentView].getSelection();
		items = AjxUtil.toArray(items);

		var account = (appCtxt.multiAccounts && items.length == 1) ? items[0].account : null;

		// fetch tag tree from appctxt (not cache) for multi-account case
		tagMenu.set(items, appCtxt.getTagTree(account));
		if (parent instanceof ZmActionMenu)
			tagOp.setText(this._getTagMenuMsg(items.length));
		else {
			tagMenu.parent.popup();

			// bug #17584 - we currently don't support creating new tags in new window
			if (appCtxt.isChildWindow) {
				var mi = tagMenu.getMenuItem(ZmTagMenu.MENU_ITEM_ADD_ID);
				if (mi) {
					mi.setVisible(false);
				}
			}
		}
	}
};

/**
 * Set up the New button based on the current app.
 * 
 * @private
 */
ZmListController.prototype._setNewButtonProps =
function(view, toolTip, enabledIconId, disabledIconId, defaultId) {
	var newButton = this._toolbar[view].getButton(ZmOperation.NEW_MENU);
	if (newButton) {
		newButton.setToolTipContent(toolTip);
		newButton.setImage(enabledIconId);
		this._defaultNewId = defaultId;
	}
};

/**
 * Sets text to "add" or "edit" based on whether a participant is a contact or not.
 * 
 * @private
 */
ZmListController.prototype._setContactText =
function(isContact) {
	var newOp = isContact ? ZmOperation.EDIT_CONTACT : ZmOperation.NEW_CONTACT;
	var newText = isContact ? null : ZmMsg.AB_ADD_CONTACT;
	ZmOperation.setOperation(this._toolbar[this._currentView], ZmOperation.CONTACT, newOp, ZmMsg.AB_ADD_CONTACT);
	ZmOperation.setOperation(this.getActionMenu(), ZmOperation.CONTACT, newOp, newText);
};

/**
 * Resets the available options on a toolbar or action menu.
 * 
 * @private
 */
ZmListController.prototype._resetOperations =
function(parent, num) {
	if (!parent) return;
	if (num == 0) {
		parent.enableAll(false);
		parent.enable(ZmOperation.NEW_MENU, true);
	} else if (num == 1) {
		parent.enableAll(true);
	} else if (num > 1) {
		// enable only the tag and delete operations
		parent.enableAll(false);
		parent.enable([ZmOperation.NEW_MENU, ZmOperation.TAG_MENU, ZmOperation.DELETE, ZmOperation.MOVE, ZmOperation.FORWARD], true);
    }

	// bug: 41758 - don't allow shared items to be tagged
	var folderId = (num > 0) && this._getSearchFolderId();
	var folder = folderId && appCtxt.getById(folderId);
	if (folder && folder.isRemote()) {
		parent.enable(ZmOperation.TAG_MENU, false);
	}
};

/**
 * Resets the available options on the toolbar.
 * 
 * @private
 */
ZmListController.prototype._resetToolbarOperations =
function() {
	this._resetOperations(this._toolbar[this._currentView], this._listView[this._currentView].getSelectionCount());
};

/**
 * This method gets overloaded if folder id is retrieved another way
 * 
 * @private
 */
ZmListController.prototype._getSearchFolderId =
function() {
	return (this._activeSearch && this._activeSearch.search) ? this._activeSearch.search.folderId : null;
};

// Pagination

/**
 * @private
 */
ZmListController.prototype._cacheList =
function(search, offset) {

	if (this._list) {
		var newList = search.getResults().getVector();
		offset = offset ? offset : parseInt(search.getAttribute("offset"));
		this._list.cache(offset, newList);
	} else {
		this._list = search.getResults(type);
	}
};

/**
 * @private
 */
ZmListController.prototype._search =
function(view, offset, limit, callback, isCurrent, lastId, lastSortVal) {
	var params = {
		query: this.getSearchString(),
		queryHint: this.getSearchStringHint(),
		types: ((this._activeSearch && this._activeSearch.search) ? this._activeSearch.search.types : []), // use types from original search 
		sortBy: appCtxt.get(ZmSetting.SORTING_PREF, view), 
		offset: offset,
		limit: limit,
		lastId: lastId,
		lastSortVal: lastSortVal
	};
	// add any additional params...
	this._getMoreSearchParams(params);

	var search = new ZmSearch(params);
	if (isCurrent) {
		this._currentSearch = search;
	}

	appCtxt.getSearchController().redoSearch(search, true, null, callback);
};

/**
 * Gets next or previous page of items. The set of items may come from the
 * cached list, or from the server (using the current search as a base).
 * <p>
 * The loadIndex is the index'd item w/in the list that needs to be loaded -
 * initiated only when user is in CV and pages a conversation that has not
 * been loaded yet.</p>
 * <p>
 * Note that this method returns a value even though it may make an
 * asynchronous SOAP request. That's possible as long as no caller
 * depends on the results of that request. Currently, the only caller that
 * looks at the return value acts on it only if no request was made.</p>
 *
 * @param {constant}	view		the current view
 * @param {Boolean}	forward		if <code>true</code>, get next page rather than previous
 * @param {int}		loadIndex	the index of item to show
 * @param {int}	limit		the number of items to fetch
 * 
 * @private
 */
ZmListController.prototype._paginate =
function(view, forward, loadIndex, limit) {

	var needMore = false;
	var lv = this._listView[view];
	var offset, max;
	if (lv._isPageless) {
		offset = this._list.size();
		needMore = true;
	} else {
		offset = lv.getNewOffset(forward);
		needMore = (offset + limit > this._list.size());
		this.currentPage = this.currentPage + (forward ? 1 : -1);
		this.maxPage = Math.max(this.maxPage, this.currentPage);
	}
	limit = limit || lv.getLimit(offset);

	// see if we're out of items and the server has more
	if (needMore && this._list.hasMore()) {
		lv.offset = offset; // cache new offset
		if (lv._isPageless) {
			max = limit;
		} else {
			// figure out how many items we need to fetch
			var delta = (offset + limit) - this._list.size();
			max = delta < limit && delta > 0 ? delta : limit;
			if (max < limit) {
				offset = ((offset + limit) - max) + 1;
			}
		}

		// handle race condition - user has paged quickly and we don't want
		// to do second fetch while one is pending
		if (this._searchPending) { return false;	}

		// figure out if this requires cursor-based paging
		var list = lv.getList();
		var lastItem = list && list.getLast();
		var lastSortVal = (lastItem && lastItem.id) ? lastItem.sf : null;
		var lastId = lastSortVal ? lastItem.id : null;

		this._setItemCountText(ZmMsg.loading);

		// get next page of items from server; note that callback may be overridden
		this._searchPending = true;
		var respCallback = new AjxCallback(this, this._handleResponsePaginate, [view, false, loadIndex, offset]);
		this._search(view, offset, max, respCallback, true, lastId, lastSortVal);
		return false;
	} else if (!lv._isPageless) {
		lv.offset = offset; // cache new offset
		this._resetOperations(this._toolbar[view], 0);
		this._resetNavToolBarButtons(view);
		this._setViewContents(view);
		this._resetSelection();
		return true;
	}
};

/**
 * Updates the list and the view after a new page of items has been retrieved.
 *
 * @param {constant}	view				the current view
 * @param {Boolean}	saveSelection			if <code>true</code>, maintain current selection
 * @param {int}	loadIndex				the index of item to show
 * @param {ZmCsfeResult}	result			the result of SOAP request
 * @param {Boolean}	ignoreResetSelection	if <code>true</code>, do not reset selection
 * 
 * @private
 */
ZmListController.prototype._handleResponsePaginate =
function(view, saveSelection, loadIndex, offset, result, ignoreResetSelection) {

	var searchResult = result.getResponse();

	// update "more" flag
	this._list.setHasMore(searchResult.getAttribute("more"));

	this._cacheList(searchResult, offset);

	var lv = this._listView[this._currentView];
	var num = lv._isPageless ? lv.getSelectionCount() : 0;
	this._resetOperations(this._toolbar[view], num);

	// remember selected index if told to
	var selItem = saveSelection ? lv.getSelection()[0] : null;
	var selectedIdx = selItem ? lv.getItemIndex(selItem) : -1;

	var items = searchResult && searchResult.getResults().getArray();
	if (lv._isPageless && items && items.length) {
		lv._itemsToAdd = items;
	} else {
		lv._itemsToAdd = null;
	}
	var wasEmpty = (lv._isPageless && (lv.size() == 0));

	this._setViewContents(view);

	// add new items to selection if all results selected, in a way that doesn't call deselectAll()
	if (lv.allSelected) {
		for (var i = 0, len = items.length; i < len; i++) {
			lv.selectItem(items[i], true);
			lv.setSelectionCbox(items[i], false);
		}
		lv.setSelectionHdrCbox(true);
		DBG.println("scr", "pagination - selected more items: " + items.length);
		DBG.println("scr", "items selected: " + lv.getSelection().length);
	}
	this._resetNavToolBarButtons(view);

	// bug fix #5134 - some views may not want to reset the current selection
	if (!ignoreResetSelection && !lv._isPageless) {
		this._resetSelection(selectedIdx);
	} else if (wasEmpty) {
		lv._setNextSelection();
	}

	if (!appCtxt.isChildWindow) {
		appCtxt.getAppController().focusContentPane();
	}
	this._searchPending = false;
};

/**
 * @private
 */
ZmListController.prototype._getMoreSearchParams =
function(params) {
	// overload me if more params are needed for SearchRequest
};

/**
 * @private
 */
ZmListController.prototype._checkReplenish =
function(callback) {
	var view = this._listView[this._currentView];
	var list = view.getList();
	// don't bother if the view doesn't really have a list
	var replenishmentDone = false;
	if (list) {
		var replCount = view.getLimit() - view.size();
		if (replCount > view.getReplenishThreshold()) {
			this._replenishList(this._currentView, replCount, callback);
			replenishmentDone = true;
		}
	}
	if (callback && !replenishmentDone) {
		callback.run();
	}
};

/**
 * All items in the list view are gone - show "No Results".
 * 
 * @private
 */
ZmListController.prototype._handleEmptyList =
function(listView) {
	if (this.currentPage > 1) {
		this._paginate(this._currentView, false, 0);
	} else {
		listView.removeAll(true);
		listView._setNoResultsHtml();
		this._resetNavToolBarButtons(this._currentView);
		listView._checkItemCount();
	}
};

/**
 * @private
 */
ZmListController.prototype._replenishList =
function(view, replCount, callback) {
	// determine if there are any more items to replenish with
	var idxStart = this._listView[view].offset + this._listView[view].size();
	var totalCount = this._list.size();

	if (idxStart < totalCount) {
		// replenish from cache
		var idxEnd = (idxEnd > totalCount) ? totalCount : (idxStart + replCount);
		var list = this._list.getVector().getArray();
		var sublist = list.slice(idxStart, idxEnd);
		var subVector = AjxVector.fromArray(sublist);
		this._listView[view].replenish(subVector);
		if (callback) callback.run();
	} else {
		// replenish from server request
		this._getMoreToReplenish(view, replCount, callback);
	}
};

/**
 * @private
 */
ZmListController.prototype._resetSelection =
function(idx) {
	var list = this._listView[this._currentView].getList();
	if (list) {
		var selIdx = idx >= 0 ? idx : 0;
		var first = list.get(selIdx);
		this._listView[this._currentView].setSelection(first, false);
	}
};

/**
 * Requests replCount items from the server to replenish current listview.
 *
 * @param {constant}	view		the current view to replenish
 * @param {int}	replCount 	the number of items to replenish
 * @param {AjxCallback}	callback	the async callback
 * 
 * @private
 */
ZmListController.prototype._getMoreToReplenish =
function(view, replCount, callback) {
	if (this._list.hasMore()) {
		// use a cursor if we can
		var list = this._listView[view].getList();
		var lastItem = list.getLast();
		var lastSortVal = (lastItem && lastItem.id) ? lastItem.sf : null;
		var lastId = lastSortVal ? lastItem.id : null;
		var respCallback = new AjxCallback(this, this._handleResponseGetMoreToReplenish, [view, callback]);
		this._search(view, this._list.size(), replCount, respCallback, false, lastId, lastSortVal);
	} else {
		if (callback) {
			callback.run();
		}
	}
};

/**
 * @private
 */
ZmListController.prototype._handleResponseGetMoreToReplenish =
function(view, callback, result) {
	var searchResult = result.getResponse();

	// set updated has more flag
	var more = searchResult.getAttribute("more");
	this._list.setHasMore(more);

	// cache search results into internal list
	this._cacheList(searchResult);

	// update view w/ replenished items
	var list = searchResult.getResults().getVector();
	this._listView[view].replenish(list);

	// reset forward pagination button only
	this._toolbar[view].enable(ZmOperation.PAGE_FORWARD, more);

	if (callback)
		callback.run(result);
};

ZmListController.prototype._initializeNavToolBar =
function(view) {
	var tb = new ZmNavToolBar({parent:this._toolbar[view], context:view});
	this._setNavToolBar(tb, view);
};

ZmListController.prototype._setNavToolBar =
function(toolbar, view) {
	this._navToolBar[view] = toolbar;
	if (this._navToolBar[view]) {
		var navBarListener = new AjxListener(this, this._navBarListener);
		this._navToolBar[view].addSelectionListener(ZmOperation.PAGE_BACK, navBarListener);
		this._navToolBar[view].addSelectionListener(ZmOperation.PAGE_FORWARD, navBarListener);
	}
};

/**
 * @private
 */
ZmListController.prototype._resetNavToolBarButtons =
function(view) {

	var lv = this._listView[view];
	if (!lv) { return; }

	if (lv._isPageless) {
		this._setItemCountText();
	}

	if (!this._navToolBar[view]) { return; }

	this._navToolBar[view].enable(ZmOperation.PAGE_BACK, lv.offset > 0);

	// determine if we have more cached items to show (in case hasMore is wrong)
	var hasMore = false;
	if (this._list) {
		hasMore = this._list.hasMore();
		if (!hasMore && ((lv.offset + lv.getLimit()) < this._list.size())) {
			hasMore = true;
		}
	}

	this._navToolBar[view].enable(ZmOperation.PAGE_FORWARD, hasMore);

	this._navToolBar[view].setText(this._getNavText(view));
};

/**
 * @private
 */
ZmListController.prototype.enablePagination =
function(enabled, view) {
	if (!this._navToolBar[view]) { return; }

	if (enabled) {
		this._resetNavToolBarButtons(view);
	} else {
		this._navToolBar[view].enable([ZmOperation.PAGE_BACK, ZmOperation.PAGE_FORWARD], false);
	}
};

/**
 * @private
 */
ZmListController.prototype._getNavText =
function(view) {
	var se = this._getNavStartEnd(view);
	if (!se) { return ""; }

	var total = this._getNumTotal();
	var msgText = total ? ZmMsg.navText2 : ZmMsg.navText1;
	return AjxMessageFormat.format(msgText, [se.start, se.end, total]);
};

/**
 * @private
 */
ZmListController.prototype._getNavStartEnd =
function(view) {
	var lv = this._listView[view];
	var limit = lv.getLimit();
	var size = this._list ? this._list.size() : 0;

	var start, end;
	if (size > 0) {
		start = lv.offset + 1;
		end = Math.min(lv.offset + limit, size);
	}

	return (start && end) ? {start:start, end:end} : null;
};

/**
 * @private
 */
ZmListController.prototype._getNumTotal =
function() {
	var folderId = this._getSearchFolderId();
	if (folderId && (folderId != ZmFolder.ID_TRASH)) {
		var folder = appCtxt.getById(folderId);
		if (folder) {
			return folder.numTotal;
		}
	}
	return null;
};

/**
 * Creates the New menu's drop down menu the first time the drop down arrow is used,
 * then removes itself as a listener.
 * 
 * @private
 */
ZmListController._newDropDownListener =
function(event) {
	var toolbar = this;

	var controller = toolbar._ZmListController_this;
	controller._propagateMenuListeners(toolbar, ZmOperation.NEW_MENU);

	var button = toolbar.getButton(ZmOperation.NEW_MENU);
	var listener = toolbar._ZmListController_newDropDownListener;
	button.removeDropDownSelectionListener(listener);
	//Called explicitly as its a selection listener. Refer DwtButton._dropDownCellMouseDownHdlr()
	button.popup();

	delete toolbar._ZmListController_this;
	delete toolbar._ZmListController_newDropDownListener;
};

/**
 * @private
 */
ZmListController.prototype._getDefaultFocusItem =
function() {
	return this._listView[this._currentView];
};

/**
 * @private
 */
ZmListController.prototype.getActionMenu =
function() {
	if (!this._actionMenu) {
		this._initializeActionMenu();
		//DBG.timePt("_initializeActionMenu");
		this._resetOperations(this._actionMenu, 0);
		//DBG.timePt("this._resetOperation(actionMenu)");
	}
	return this._actionMenu;
};

/**
 * Returns the context for the action menu created by this controller (used to create
 * an ID for the menu).
 * 
 * @private
 */
ZmListController.prototype._getMenuContext =
function() {
	return this._app && this._app._name;
};

/**
 * @private
 */
ZmListController.prototype._getItemCountText =
function() {

	var lv = this._listView[this._currentView];
	var list = lv && lv._list;
	if (!list) { return ""; }
	var type = lv._getItemCountType();
	var size = list.size();
	var total = this._getNumTotal();
	var num = total || size;
    var typeText = AjxMessageFormat.format(ZmMsg[ZmItem.COUNT_KEY[type]], num);
	if (total && (num != total)) {
		return AjxMessageFormat.format(ZmMsg.itemCount1, [size, total, typeText]);
	} else {
		var sizeText = list.size() + (this._list.hasMore() ? "+" : "");
		return AjxMessageFormat.format(ZmMsg.itemCount, [sizeText, typeText]);
	}
};

/**
 * Sets the text that shows the number of items, if we are pageless.
 * 
 * @private
 */
ZmListController.prototype._setItemCountText =
function(text) {

	text = text || this._getItemCountText();
	var field = this._itemCountText[this._currentView];
	if (field) {
		field.setText(text);
	}
};

/**
 * Records total items and last item before we do any more searches. Adds a couple
 * params to the args for the list action method.
 *
 * @param {function}	actionMethod		the controller action method
 * @param {Array}		args				an arg list for above (except for items arg)
 * @param {Hash}		params				the params that will be passed to list action method
 * @param {AjxCallback}	allDoneCallback		the callback to run after all items processed
 * 
 * @private
 */
ZmListController.prototype._setupContinuation =
function(actionMethod, args, params, allDoneCallback) {

	var actionCallback = new AjxCallback(this, actionMethod, args);
	params.finalCallback = new AjxCallback(this, this._continueAction,
										  {actionCallback:actionCallback, allDoneCallback:allDoneCallback});
	params.count = this._continuation.count;
	params.idsOnly = true;

	var items = params.items;
	var list = (items && (items instanceof Array) && items.length && items[0].list) || this._list;
	if (!this._continuation.lastItem) {
		this._continuation.lastItem = list.getVector().getLast();
		this._continuation.totalItems = list.size();
	}

	return list;
};

/**
 * See if we are performing an action on all items, including ones that match the current search
 * but have not yet been retrieved. If so, keep doing searches and performing the action on the
 * results, until there are no more results.
 *
 * The arguments in the action callback should be those after the initial 'items' argument. The
 * array of items retrieved by the search is prepended to the callback's argument list before it
 * is run.
 *
 * @param {Hash}	params			a hash of parameters
 * @param {AjxCallback}	actionCallback		the callback with action to be performed on search results
 * @param {AjxCallback} allDoneCallback		the callback to run when we're all done
 * @param {Hash}	actionParams		the params from <code>ZmList._itemAction</code>, added when this is called
 * 
 * @private
 */
ZmListController.prototype._continueAction =
function(params, actionParams) {

	var lv = this._listView[this._currentView];
	var cancelled = actionParams && actionParams.cancelled;
	var contResult = this._continuation.result;
	var hasMore = contResult ? contResult.getAttribute("more") : this._list.hasMore();
	DBG.println("sa", "lv.allSelected: " + lv.allSelected + ", hasMore: " + hasMore);
	if (lv.allSelected && hasMore && !cancelled) {
		var cs = this._currentSearch;
		var limit = ZmListController.CONTINUATION_SEARCH_ITEMS;
		var searchParams = {
			query:		this.getSearchString(),
			queryHint:	this.getSearchStringHint(),
			types:		cs.types,
			sortBy:		cs.sortBy,
			limit:		limit,
			idsOnly:	true
		};

		var list = contResult ? contResult.getResults() : this._list.getArray();
		var lastItem = this._continuation.lastItem;
		if (!lastItem) {
			lastItem = list && list[list.length - 1];
		}
		if (lastItem) {
			searchParams.lastId = lastItem.id;
			searchParams.lastSortVal = lastItem.sf;
			DBG.println("sa", "***** continuation search: " + searchParams.query + " --- " + [lastItem.id, lastItem.sf].join("/"));
		} else {
			searchParams.offset = limit + (this._continuation.search ? this._continuation.search.offset : 0);
		}

		this._continuation.count = actionParams.numItems;
		if (!this._continuation.totalItems) {
			this._continuation.totalItems = list.length;
		}

		this._continuation.search = new ZmSearch(searchParams);
		var respCallback = new AjxCallback(this, this._handleResponseContinueAction, [params.actionCallback]);
		appCtxt.getSearchController().redoSearch(this._continuation.search, true, null, respCallback);
	} else {
		DBG.println("sa", "end of continuation");
		if (contResult) {
			if (lv.allSelected) {
				// items beyond page were acted on, give user a total count
				actionParams.actionSummary = ZmList.getActionSummary(actionParams.actionText, this._continuation.totalItems, contResult.type, actionParams.actionArg);
				lv.deselectAll();
			}
			this._continuation = {count:0, totalItems:0};
		}
		if (params.allDoneCallback) {
			params.allDoneCallback.run();
		}
		// TODO: Remove this comment if ZmList.killProgressDialog really should be gone
		// ZmList.killProgressDialog(actionParams.actionSummary);
	}
};

/**
 * @private
 */
ZmListController.prototype._handleResponseContinueAction =
function(actionCallback, result) {

	this._continuation.result = result.getResponse();
	var items = this._continuation.result.getResults();
	DBG.println("sa", "continuation search results: " + items.length);
	if (items.length) {
		this._continuation.lastItem = items[items.length - 1];
		this._continuation.totalItems += items.length;
		DBG.println("sa", "continuation last item: " + this._continuation.lastItem.id);
		actionCallback.args = actionCallback.args || [];
		actionCallback.args.unshift(items);
		DBG.println("sa", "calling continuation action on search results");
		actionCallback.run();
	} else {
		DBG.println(AjxDebug.DBG1, "Continuation with empty search results!");
	}
};

/**
 * @private
 */
ZmListController.prototype._checkItemCount =
function() {
	var lv = this._listView[this._currentView];
	lv._checkItemCount();
	lv._handleResponseCheckReplenish();
};
