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
 * Creates a new, empty list controller. It must be initialized before it can be used.
 * @constructor
 * @class
 * This class is a base class for any controller that manages lists of items (eg mail or
 * contacts). It consolidates handling of list functionality (eg selection) and of common
 * operations such as tagging and deletion. Operations may be accessed by the user through
 * either the toolbar or an action menu. The public method show() gets everything going,
 * and then the controller just handles events.
 *
 * <p>Support is also present for handling multiple views (eg contacts).</p>
 *
 *   <p>Controllers for single items may extend this class, since the functionality needed is
 *  virtually the same. An item can be thought of as the degenerate form of a list.</p>
 *
 *  @author Conrad Damon
 *
 * @param container	containing shell
 * @param app		containing app
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
	this._listeners[ZmOperation.IM] = new AjxListener(this, this._participantImListener);
	this._listeners[ZmOperation.CONTACT] = new AjxListener(this, this._participantContactListener);
	this._listeners[ZmOperation.VIEW] = new AjxListener(this, this._viewMenuItemListener);
	this._listeners[ZmOperation.SYNC_OFFLINE] = new AjxListener(this, this._syncOfflineListener);

	this._menuPopdownListener = new AjxListener(this, this._menuPopdownActionListener);

	this._dropTgt = new DwtDropTarget("ZmTag");
	this._dropTgt.markAsMultiple();
	this._dropTgt.addDropListener(new AjxListener(this, this._dropListener));
};

ZmListController.prototype = new ZmController;
ZmListController.prototype.constructor = ZmListController;

// public methods

ZmListController.prototype.toString =
function() {
	return "ZmListController";
};

/**
* Performs some setup for displaying the given search results in a list view. Subclasses will need
* to do the actual display work, typically by calling the list view's set() method.
*
* @param searchResults		a ZmSearchResult
* @param view				view type to use
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
	this.pageIsDirty = {};
};

ZmListController.prototype.getSearchString =
function() {
	return this._currentSearch.query;
};

ZmListController.prototype.getCurrentView =
function() {
	return this._listView[this._currentView];
};

ZmListController.prototype.getList =
function() {
	return this._list;
};

ZmListController.prototype.setList =
function(newList) {
	if (newList != this._list && (newList instanceof ZmList)) {
		// dtor current list if necessary
		if (this._list)
			this._list.clear();
		this._list = newList;
	}
};

ZmListController.prototype.handleKeyAction =
function(actionCode) {
	DBG.println(AjxDebug.DBG3, "ZmListController.handleKeyAction");
	var listView = this._listView[this._currentView];

	// check for action code with argument, eg MoveToFolder3
	var origActionCode = actionCode;
	var shortcut = ZmShortcut.parseAction("Global", actionCode);
	if (shortcut) {
		actionCode = shortcut.baseAction;
	}

	switch (actionCode) {

		case DwtKeyMap.DBLCLICK:
			return listView.handleKeyAction(actionCode);

		case ZmKeyMap.DEL:
			this._doDelete(listView.getSelection());
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
		case ZmKeyMap.PRINT_ALL:
			if (appCtxt.get(ZmSetting.PRINT_ENABLED)) {
				this._printListener();
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

		case ZmKeyMap.FLAG:
			this._doFlag(listView.getSelection());
			break;

		case ZmKeyMap.TAG:
			var items = listView.getSelection();
			if (items && items.length && shortcut) {
				var tag = appCtxt.getById(shortcut.arg);
				if (tag) {
					this._doTag(items, tag, true);
				}
			}
			break;

		default:
			return ZmController.prototype.handleKeyAction.call(this, origActionCode);
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

// Attempts to process a nav toolbar up/down button click
ZmListController.prototype._paginateDouble 		= function(bDoubleForward) {};

// Returns the type of item in the underlying list
ZmListController.prototype._getItemType			= function() {};

// private and protected methods

// Creates basic elements and sets the toolbar and action menu
ZmListController.prototype._setup =
function(view) {
	this._initialize(view);
	this._resetOperations(this._toolbar[view], 0);
};

// Creates the basic elements: toolbar, list view, and action menu
ZmListController.prototype._initialize =
function(view) {
	this._initializeToolBar(view);
	this._initializeActionMenu();
	this._initializeListView(view);
	this._initializeTabGroup(view);
};

// Below are functions that return various groups of operations, for cafeteria-style
// operation selection.

ZmListController.prototype._standardToolBarOps =
function() {
	return [ZmOperation.NEW_MENU,
			ZmOperation.SEP,
			ZmOperation.DELETE, ZmOperation.MOVE, ZmOperation.PRINT];
};

ZmListController.prototype._standardActionMenuOps =
function() {
	return [ZmOperation.TAG_MENU, ZmOperation.DELETE, ZmOperation.MOVE, ZmOperation.PRINT];
};

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

// toolbar: buttons and listeners
ZmListController.prototype._initializeToolBar =
function(view) {
	if (this._toolbar[view]) { return; }

	var buttons = this._getToolBarOps();
	if (!buttons) return;
	this._toolbar[view] = new ZmButtonToolBar({parent:this._container, buttons:buttons});
	// remove text for Print, Delete, and Move buttons
	var list = [ZmOperation.PRINT, ZmOperation.MOVE];
	for (var i = 0; i < list.length; i++) {
		var button = this._toolbar[view].getButton(list[i]);
		if (button) {
			button.setText(null);
		}
	}
	buttons = this._toolbar[view].opList;
	for (var i = 0; i < buttons.length; i++) {
		var button = buttons[i];
		if (this._listeners[button]) {
			this._toolbar[view].addSelectionListener(button, this._listeners[button]);
		}
	}

	var toolbar = this._toolbar[view];
	var button = toolbar.getButton(ZmOperation.NEW_MENU);
	if (button) {
       	var listener = new AjxListener(toolbar, ZmListController._newDropDownListener);
       	button.addDropDownSelectionListener(listener);
       	toolbar._ZmListController_this = this;
       	toolbar._ZmListController_newDropDownListener = listener;
   	}

	var tagMenuButton = this._toolbar[view].getButton(ZmOperation.TAG_MENU);
	if (tagMenuButton) {
		tagMenuButton.noMenuBar = true;
		this._setupTagMenu(this._toolbar[view]);
	}

	if (appCtxt.zimletsPresent()) {
		appCtxt.getZimletMgr().notifyZimlets("initializeToolbar", this._app, this._toolbar[view]);
	}
};

// list view and its listeners
ZmListController.prototype._initializeListView =
function(view) {
	if (this._listView[view]) { return; }

	this._listView[view] = this._createNewView(view);
	this._listView[view].addSelectionListener(new AjxListener(this, this._listSelectionListener));
	this._listView[view].addActionListener(new AjxListener(this, this._listActionListener));
};

// action menu: menu items and listeners
ZmListController.prototype._initializeActionMenu =
function() {
	if (this._actionMenu) { return; }

	var menuItems = this._getActionMenuOps();
	if (!menuItems) return;
	this._actionMenu = new ZmActionMenu({parent:this._shell, menuItems:menuItems});
	this._addMenuListeners(this._actionMenu);
	if (appCtxt.get(ZmSetting.TAGGING_ENABLED)) {
		this._setupTagMenu(this._actionMenu);
	}
};

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

ZmListController.prototype._initializeTabGroup =
function(view) {
	if (this._tabGroups[view]) return;

	this._tabGroups[view] = this._createTabGroup();
	this._tabGroups[view].newParent(appCtxt.getRootTabGroup());
	this._tabGroups[view].addMember(this._toolbar[view]);
	this._tabGroups[view].addMember(this._listView[view]);
};

/**
 * Creates the desired application view.
 *
 * @param view			view ID
 * @param elements		array of view components
 * @param isAppView		this view is a top-level app view
 * @param clear			if true, clear the hidden stack of views
 * @param pushOnly		don't reset the view's data, just swap the view in
 * @param isTransient	this view doesn't go on the hidden stack
 * @param stageView		stage the view rather than push it
 */
ZmListController.prototype._setView =
function(view, elements, isAppView, clear, pushOnly, isTransient, stageView) {

	// create the view (if we haven't yet)
	if (!this._appViews[view]) {
		// view management callbacks
		var callbacks = {};
		callbacks[ZmAppViewMgr.CB_PRE_HIDE] = this._preHideCallback ? new AjxCallback(this, this._preHideCallback) : null;
		callbacks[ZmAppViewMgr.CB_PRE_UNLOAD] = this._preUnloadCallback ? new AjxCallback(this, this._preUnloadCallback) : null;
		callbacks[ZmAppViewMgr.CB_POST_HIDE]= this._postHideCallback ? new AjxCallback(this, this._postHideCallback) : null;
		callbacks[ZmAppViewMgr.CB_PRE_SHOW]	= this._preShowCallback ? new AjxCallback(this, this._preShowCallback) : null;
		callbacks[ZmAppViewMgr.CB_POST_SHOW]= this._postShowCallback ? new AjxCallback(this, this._postShowCallback) : null;

		this._app.createView(view, elements, callbacks, isAppView, isTransient);
		this._appViews[view] = 1;
	}

	// populate the view
	if (!pushOnly) {
		this._setViewContents(view);
	}

	// push the view
	if (stageView) {
		this._app.stageView(view);
	} else {
		return (clear ? this._app.setView(view) : this._app.pushView(view));
	}
};

// List listeners

// List selection event - handle flagging if a flag icon was clicked, otherwise
// reset the toolbar based on how many items are selected.
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

// List action event - set the dynamic tag menu, and enable operations in the
// action menu based on the number of selected items. Note that the menu is not
// actually popped up here; that's left up to the subclass, which should
// override this function.
ZmListController.prototype._listActionListener =
function(ev) {
	this._actionEv = ev;
	var actionMenu = this.getActionMenu();
	if (appCtxt.get(ZmSetting.TAGGING_ENABLED))
		this._setTagMenu(actionMenu);
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
 * @param ev		[DwtUiEvent]	UI event
 * @param op		[constant]		operation ID
 * @param newWin	[boolean]		true if we're in a separate window
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
		ZmController.prototype._newListener.apply(this, arguments);
	}
};

// Tag button has been pressed. We don't tag anything (since no tag has been selected),
// we just show the dynamic tag menu.
ZmListController.prototype._tagButtonListener =
function(ev) {
	var toolbar = this._toolbar[this._currentView];
	if (ev.dwtObj.parent == toolbar) {
		this._setTagMenu(toolbar);
	}
};

// Tag/untag items.
ZmListController.prototype._tagListener =
function(item) {
	if (appCtxt.getAppViewMgr().getCurrentViewId() == this._getViewType()) {
		var tagEvent = item.getData(ZmTagMenu.KEY_TAG_EVENT);
		var tagAdded = item.getData(ZmTagMenu.KEY_TAG_ADDED);
		var items = this._listView[this._currentView].getSelection();
		if (tagEvent == ZmEvent.E_TAGS && tagAdded) {
			this._doTag(items, item.getData(Dwt.KEY_OBJECT), true);
		} else if (tagEvent == ZmEvent.E_CREATE) {
			this._pendingActionData = this._listView[this._currentView].getSelection();
			var newTagDialog = appCtxt.getNewTagDialog();
			if (!this._newTagCb) {
				this._newTagCb = new AjxCallback(this, this._newTagCallback);
			}
			ZmController.showDialog(newTagDialog, this._newTagCb);
			newTagDialog.registerCallback(DwtDialog.CANCEL_BUTTON, this._clearDialog, this, newTagDialog);
		} else if (tagEvent == ZmEvent.E_TAGS && !tagAdded) {
			this._doTag(items, item.getData(Dwt.KEY_OBJECT), false);
		} else if (tagEvent == ZmEvent.E_REMOVE_ALL) {
			// bug fix #607
			this._doRemoveAllTags(items);
		}
	}
};

ZmListController.prototype._printListener =
function(ev) {
	var listView = this._listView[this._currentView];
	var items = listView.getSelection();
	var item = (items instanceof Array) ? items[0] : items;
	appCtxt.getPrintView().render(item);
	this._restoreFocus(listView);
};

ZmListController.prototype._backListener =
function(ev) {
	this._app.popView();
};

// Delete one or more items.
ZmListController.prototype._deleteListener =
function(ev) {
	this._doDelete(this._listView[this._currentView].getSelection());
};

// Move button has been pressed, show the dialog.
ZmListController.prototype._moveListener =
function(ev) {
	this._pendingActionData = this._listView[this._currentView].getSelection();
	var moveToDialog = appCtxt.getChooseFolderDialog();
	if (!this._moveCb) {
		this._moveCb = new AjxCallback(this, this._moveCallback);
	}
	ZmController.showDialog(moveToDialog, this._moveCb, this._getMoveParams());
	moveToDialog.registerCallback(DwtDialog.CANCEL_BUTTON, this._clearDialog, this, moveToDialog);
};

ZmListController.prototype._getMoveParams =
function() {
	var org = ZmApp.ORGANIZER[this._app._name] || ZmOrganizer.FOLDER;
	var title = this._getMoveDialogTitle(this._pendingActionData.length);
	return {data:this._pendingActionData, treeIds:[org], overviewId:"ZmListController",
			title:title, description:ZmMsg.targetFolder};
};

// Switch to selected view.
ZmListController.prototype._viewMenuItemListener =
function(ev) {
	if (ev.detail == DwtMenuItem.CHECKED ||
		ev.detail == DwtMenuItem.UNCHECKED)
	{
		this.switchView(ev.item.getData(ZmOperation.MENUITEM_ID));
	}
};

ZmListController.prototype._syncOfflineListener =
function(ev) {
	appCtxt.getAppController().sendSync();
};

// Navbar listeners

ZmListController.prototype._navBarListener =
function(ev) {
	// skip listener for non-current views
	if (appCtxt.getAppViewMgr().getCurrentViewId() != this._getViewType())
		return;

	var op = ev.item.getData(ZmOperation.KEY_ID);

	if (op == ZmOperation.PAGE_BACK || op == ZmOperation.PAGE_FORWARD) {
		this._paginate(this._currentView, (op == ZmOperation.PAGE_FORWARD));
	} else if (op == ZmOperation.PAGE_DBL_BACK || op == ZmOperation.PAGE_DBL_FORW) {
		this._paginateDouble(op == ZmOperation.PAGE_DBL_FORW);
	}
};

// Participant listeners

// Search based on email address
ZmListController.prototype._participantSearchListener =
function(ev) {
	var name = this._actionEv.address.getAddress();
	appCtxt.getSearchController().fromSearch(name);
};

// Browse based on email address
ZmListController.prototype._participantBrowseListener =
function(ev) {
	var name = this._actionEv.address.getAddress();
	appCtxt.getSearchController().fromBrowse(name);
};

// Compose message to participant
ZmListController.prototype._participantComposeListener =
function(ev) {
	var name = this._actionEv.address.toString(AjxEmailAddress.SEPARATOR) + AjxEmailAddress.SEPARATOR;
	AjxDispatcher.run("Compose", {action: ZmOperation.NEW_MESSAGE, inNewWindow: this._app._inNewWindow(ev),
								  toOverride: name});
};

// IM the participant (if enabled via config)
ZmListController.prototype._participantImListener =
function(ev) {
	// get the first selected message
	var msg = this._listView[this._currentView].getSelection()[0];

	// FIXME: this code should be some place else; definitely not here.
	var contacts;
	if (msg instanceof ZmMailItem) {
		var emails = msg.getEmails();
		contacts = AjxDispatcher.run("GetContacts");
		contacts = emails.map(contacts.getContactByEmail, contacts);
	} else if (msg instanceof ZmContact) {
		contacts = AjxVector.fromArray([ msg ]);
	}
	var buddies = contacts.map("getBuddy");
	var seen = [];
	buddies.foreach(function(b) {
		if (b && !seen[b.getAddress()]) {
			seen[b.getAddress()] = true;
			AjxDispatcher.run("GetChatListController").chatWithRosterItem(b);
		}
	});
};

// If there's a contact for the participant, edit it, otherwise add it.
ZmListController.prototype._participantContactListener =
function(ev) {
	var loadCallback = new AjxCallback(this, this._handleLoadParticipantContactListener);
	AjxDispatcher.require(["ContactsCore", "Contacts"], false, loadCallback, null, true);
};

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

ZmListController.prototype._createNewContact =
function(ev) {
	var contact = new ZmContact(null);
	contact.initFromEmail(ev.address);
	return contact;
};

ZmListController.prototype._loadContactCallback =
function(resp, contact) {
	AjxDispatcher.run("GetContactController").show(contact);
};

// Drag and drop listeners

ZmListController.prototype._dragListener =
function(ev) {
	if (ev.action == DwtDragEvent.SET_DATA) {
		ev.srcData = {data: ev.srcControl.getDnDSelection(), controller: this};
	}
};

// The list view as a whole is the drop target, since it's the lowest-level widget. Still, we
// need to find out which item got dropped onto, so we get that from the original UI event
// (a mouseup). The header is within the list view, but not an item, so it's not a valid drop
// target. One drawback of having the list view be the drop target is that we can't exercise
// fine-grained control on what's a valid drop target. If you enter via an item and then drag to
// the header, it will appear to be valid.
ZmListController.prototype._dropListener =
function(ev) {
	var view = this._listView[this._currentView];
	var div = Dwt.getAttr(ev.uiEvent.target, "_itemIndex", true);
	var item = div ? view.getItemFromElement(div) : null

	// only tags can be dropped on us
	var data = ev.srcData.data;
	if (ev.action == DwtDropEvent.DRAG_ENTER) {
		ev.doIt = (item && !item.isShared() && this._dropTgt.isValidTarget(data));
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

// Created a new tag, now apply it.
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

// Move stuff to a new folder.
ZmListController.prototype._moveCallback =
function(folder) {
	this._doMove(this._pendingActionData, folder, null, true);
	this._clearDialog(appCtxt.getChooseFolderDialog());
	this._pendingActionData = null;
};

// Data handling

// Flag/unflag an item
ZmListController.prototype._doFlag =
function(items, on) {
	if (on !== true && on !== false) {
		on = !items[0].isFlagged;
	}
	var items1 = [];
	for (var i = 0; i < items.length; i++) {
		if (items[i].isFlagged != on) {
			items1.push(items[i]);
		}
	}
//	this._list.flagItems(items1, "flag", on);
	var list = items[0].list || this._list;
	list.flagItems(items1, "flag", on);
};

// Tag/untag items
ZmListController.prototype._doTag =
function(items, tag, doTag) {
	if (!(items instanceof Array)) items = [items];

	var list = items[0].list || this._list;
	list.tagItems(items, tag.id, doTag);
};

// Remove all tags for given items
ZmListController.prototype._doRemoveAllTags =
function(items) {
	if (!(items instanceof Array)) items = [items];

	var list = items[0].list || this._list;
	list.removeAllTags(items);
};

/*
* Deletes one or more items from the list.
*
* @param items			[Array]			list of items to delete
* @param hardDelete		[boolean]*		if true, physically delete items
* @param attrs			[Object]*		additional attrs for SOAP command
*/
ZmListController.prototype._doDelete =
function(items, hardDelete, attrs) {
	if (!(items instanceof Array)) items = [items];

	var list = items[0].list || this._list;
	list.deleteItems(items, hardDelete, attrs);
};

/**
* Moves a list of items to the given folder. Any item already in that folder is excluded.
*
* @param items		[Array]			a list of items to move
* @param folder		[ZmFolder]		destination folder
* @param attrs		[Object]		additional attrs for SOAP command
@ @param force		[boolean]		true if forcing a move request (no copy)
*/
ZmListController.prototype._doMove =
function(items, folder, attrs, force) {
	if (!(items instanceof Array)) items = [items];

	var move = [];
	var copy = [];
	for (var i = 0; i < items.length; i++) {
		var item = items[i];
		if (!item.folderId || item.folderId != folder.id) {
			if (!force && (item.isShared() || item.isReadOnly() || folder.isRemote()))
				copy.push(item);
			else
				move.push(item);
		}
	}

	var list = items[0].list || this._list;
	if (move.length) {
		list.moveItems(move, folder, attrs);
	}

	if (copy.length) {
		list.copyItems(copy, folder, attrs);
	}
};

// Modify an item
ZmListController.prototype._doModify =
function(item, mods) {
	var list = item.list || this._list;
	list.modifyItem(item, mods);
};

// Create an item. We need to be passed a list since we may not have one.
ZmListController.prototype._doCreate =
function(list, args) {
	list.create(args);
};

// Miscellaneous

/*
* Adds the same listener to all of the items in a button or menu item's submenu.
* By default, propagates the listener for the given operation.
*
* @param parent		[DwtControl]		parent toolbar or menu
* @param op			[constant]			operation (button or menu item)
* @param listener	[AjxListener]*		listener to propagate
*/
ZmListController.prototype._propagateMenuListeners =
function(parent, op, listener) {
	if (!parent) return;
	listener = listener ? listener : this._listeners[op];
	var opWidget = parent.getOp(op);
	if (opWidget) {
		var menu = opWidget.getMenu();
	    var items = menu.getItems();
		var cnt = menu.getItemCount();
		for (var i = 0; i < cnt; i++)
			items[i].addSelectionListener(listener);
	}
};

// Add listener to tag menu
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

// Dynamically build the tag menu based on selected items and their tags.
ZmListController.prototype._setTagMenu =
function(parent) {
	if (!parent) return;
	var tagOp = parent.getOp(ZmOperation.TAG_MENU);
	if (tagOp) {
		var tagMenu = parent.getTagMenu();
		// dynamically build tag menu add/remove lists
		var items = this._listView[this._currentView].getSelection();
		if (items instanceof ZmItem)
			items = [items];
		tagMenu.set(items, this._tagList);
		if (parent instanceof ZmActionMenu)
			tagOp.setText(this._getTagMenuMsg(items.length));
		else {
			tagMenu.parent.popup();
		}
	}
};

// Set up the New button based on the current app.
ZmListController.prototype._setNewButtonProps =
function(view, toolTip, enabledIconId, disabledIconId, defaultId) {
	var newButton = this._toolbar[view].getButton(ZmOperation.NEW_MENU);
	if (newButton) {
		newButton.setToolTipContent(toolTip);
		newButton.setImage(enabledIconId);
		this._defaultNewId = defaultId;
	}
};

// Sets text to "add" or "edit" based on whether a participant is a contact or not.
ZmListController.prototype._setContactText =
function(isContact) {
	var newOp = isContact ? ZmOperation.EDIT_CONTACT : ZmOperation.NEW_CONTACT;
	var newText = isContact ? null : ZmMsg.AB_ADD_CONTACT;
	ZmOperation.setOperation(this._toolbar[this._currentView], ZmOperation.CONTACT, newOp, ZmMsg.AB_ADD_CONTACT);
	ZmOperation.setOperation(this.getActionMenu(), ZmOperation.CONTACT, newOp, newText);
};

// Resets the available options on a toolbar or action menu.
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
};

// Resets the available options on the toolbar
ZmListController.prototype._resetToolbarOperations =
function() {
	this._resetOperations(this._toolbar[this._currentView], this._listView[this._currentView].getSelectionCount());
};

// this method gets overloaded if folder id is retrieved another way
ZmListController.prototype._getSearchFolderId =
function() {
	return (this._activeSearch && this._activeSearch.search) ? this._activeSearch.search.folderId : null;
};

// Pagination

ZmListController.prototype._cacheList =
function(search, offset) {
	var type = this._getItemType();
	if (this._list) {
		var newList = search.getResults(type).getVector();
		offset = offset ? offset : parseInt(search.getAttribute("offset"));
		this._list.cache(offset, newList);
	} else {
		this._list = search.getResults(type);
	}
};

ZmListController.prototype._search =
function(view, offset, limit, callback, isCurrent, lastId, lastSortVal) {
	var sortBy = appCtxt.get(ZmSetting.SORTING_PREF, view);
	// use types from original search
	var types = (this._activeSearch && this._activeSearch.search) ? this._activeSearch.search.types : [];
	var sc = appCtxt.getSearchController();
	var params = {query: this.getSearchString(), types: types, sortBy: sortBy, offset: offset, limit: limit,
				  lastId: lastId, lastSortVal: lastSortVal};
	// add any additional params...
	this._getMoreSearchParams(params);

	var search = new ZmSearch(params);
	if (isCurrent) {
		this._currentSearch = search;
	}

	appCtxt.getSearchController().redoSearch(search, true, null, callback);
};

/*
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
* @param view		[constant]		current view
* @param forward	[boolean]		if true, get next page rather than previous
* @param loadIndex	[int]			index of item to show
*/
ZmListController.prototype._paginate =
function(view, forward, loadIndex) {
	var offset = this._listView[view].getNewOffset(forward);
	var limit = this._listView[view].getLimit();
	forward ? this.currentPage++ : this.currentPage--;
	this.maxPage = Math.max(this.maxPage, this.currentPage);

	this._listView[view].setOffset(offset);

	// see if we're out of items and the server has more
	if ((offset + limit > this._list.size() && this._list.hasMore()) || this.pageIsDirty[this.currentPage]) {
		// figure out how many items we need to fetch
		var delta = (offset + limit) - this._list.size();
		var max = delta < limit && delta > 0 ? delta : limit;
		if (max < limit)
			offset = ((offset + limit) - max) + 1;

		// figure out if this requires cursor-based paging
		var list = this._listView[this._currentView].getList();
		var lastItem = list.getLast();
		var lastSortVal = (lastItem && lastItem.id) ? lastItem.sf : null;
		var lastId = lastSortVal ? lastItem.id : null;

		// get next page of items from server; note that callback may be overridden
		var respCallback = new AjxCallback(this, this._handleResponsePaginate, [view, false, loadIndex, offset]);
		this._search(view, offset, max, respCallback, true, lastId, lastSortVal);
		return false;
	} else {
		this._resetOperations(this._toolbar[view], 0);
		this._resetNavToolBarButtons(view);
		this._setViewContents(view);
		this._resetSelection();
		return true;
	}
};

/*
* Updates the list and the view after a new page of items has been retrieved.
*
* @param view					[constant]		current view
* @param saveSelection			[boolean]		if true, maintain current selection
* @param loadIndex				[int]			index of item to show
* @param result					[ZmCsfeResult]	result of SOAP request
* @param ignoreResetSelection	[boolean] 		if true, dont reset selection
*/
ZmListController.prototype._handleResponsePaginate =
function(view, saveSelection, loadIndex, offset, result, ignoreResetSelection) {
	var searchResult = result.getResponse();

	// update "more" flag
	this._list.setHasMore(searchResult.getAttribute("more"));

	// cache search results into internal list
	this._cacheList(searchResult, offset);

	this._resetOperations(this._toolbar[view], 0);
	this._resetNavToolBarButtons(view);

	// remember selected index if told to
	var selItem = saveSelection ? this._listView[this._currentView].getSelection()[0] : null;
	var selectedIdx = selItem ? this._listView[this._currentView]._getItemIndex(selItem) : -1;

	this._setViewContents(view);
	this.pageIsDirty[this.currentPage] = false;

	// bug fix #5134 - some views may not want to reset the current selection
	if (!ignoreResetSelection) {
		this._resetSelection(selectedIdx);
	}
};

ZmListController.prototype._getMoreSearchParams =
function(params) {
	// overload me if more params are needed for SearchRequest
};

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

// All items in the list view are gone - show "No Results"
ZmListController.prototype._handleEmptyList =
function(listView) {
	if (this.currentPage > 1) {
		this._paginate(this._currentView, false, 0);
	} else {
		listView.removeAll(true);
		listView._setNoResultsHtml();
	}
};

ZmListController.prototype._replenishList =
function(view, replCount, callback) {
	// determine if there are any more items to replenish with
	var idxStart = this._listView[view].getOffset() + this._listView[view].size();
	var totalCount = this._list.size();

	if (idxStart < totalCount) {
		// replenish from cache
		var idxEnd = idxStart + replCount;
		if (idxEnd > totalCount) {
			idxEnd = totalCount;
		}
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

ZmListController.prototype._resetSelection =
function(idx) {
	var list = this._listView[this._currentView].getList();
	if (list) {
		var selIdx = idx >= 0 ? idx : 0;
		var first = list.get(selIdx);
		this._listView[this._currentView].setSelection(first, false);
	}
};

/*
* Requests replCount items from the server to replenish current listview
*
* @param view		[constant]		current view to replenish
* @param replCount 	[int]			number of items to replenish
* @param callback	[AjxCallback]	async callback
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

ZmListController.prototype._handleResponseGetMoreToReplenish =
function(view, callback, result) {
	var searchResult = result.getResponse();

	// set updated has more flag
	var more = searchResult.getAttribute("more");
	this._list.setHasMore(more);

	// cache search results into internal list
	this._cacheList(searchResult);

	// update view w/ replenished items
	var list = searchResult.getResults(this._getItemType()).getVector();
	this._listView[view].replenish(list);

	// reset forward pagination button only
	this._toolbar[view].enable(ZmOperation.PAGE_FORWARD, more);

	if (callback)
		callback.run(result);
};

ZmListController.prototype._setNavToolBar =
function(toolbar, view) {
	this._navToolBar[view] = toolbar;
	if (this._navToolBar[view]) {
		var navBarListener = new AjxListener(this, this._navBarListener);
		if (this._navToolBar[view].hasSingleArrows) {
			this._navToolBar[view].addSelectionListener(ZmOperation.PAGE_BACK, navBarListener);
			this._navToolBar[view].addSelectionListener(ZmOperation.PAGE_FORWARD, navBarListener);
		}
		if (this._navToolBar[view].hasDoubleArrows) {
			this._navToolBar[view].addSelectionListener(ZmOperation.PAGE_DBL_BACK, navBarListener);
			this._navToolBar[view].addSelectionListener(ZmOperation.PAGE_DBL_FORW, navBarListener);
		}
	}
};

ZmListController.prototype._resetNavToolBarButtons =
function(view) {
	if (!this._navToolBar[view]) return;

	if (this._navToolBar[view].hasDoubleArrows) {
		this._navToolBar[view].enable([ZmOperation.PAGE_DBL_BACK, ZmOperation.PAGE_DBL_FORW], false);
	}

	if (this._navToolBar[view].hasSingleArrows) {
		var offset = this._listView[view].getOffset();
		this._navToolBar[view].enable(ZmOperation.PAGE_BACK, offset > 0);

		// determine if we have more cached items to show (in case hasMore is wrong)
		var hasMore = false;
		if (this._list) {
			hasMore = this._list.hasMore();
			if (!hasMore && ((offset + this._listView[view].getLimit()) < this._list.size())) {
				hasMore = true;
			}
		}

		this._navToolBar[view].enable(ZmOperation.PAGE_FORWARD, hasMore);
	}

	this._navToolBar[view].setText(this._getNavText(view));
};

ZmListController.prototype.enablePagination =
function(enabled, view) {
	if (!this._navToolBar[view]) return;

	if (enabled) {
		this._resetNavToolBarButtons(view);
	} else {
		if (this._navToolBar[view].hasDoubleArrows)
			this._navToolBar[view].enable([ZmOperation.PAGE_DBL_BACK, ZmOperation.PAGE_DBL_FORW], false);
		if (this._navToolBar[view].hasSingleArrows)
			this._navToolBar[view].enable([ZmOperation.PAGE_BACK, ZmOperation.PAGE_FORWARD], false);
	}
};

ZmListController.prototype._getNavText =
function(view) {
	var se = this._getNavStartEnd(view);
	if (!se) { return ""; }

	var total = this._getNumTotal();
	var msgText = total ? ZmMsg.navText2 : ZmMsg.navText1;
	return AjxMessageFormat.format(msgText, [se.start, se.end, total]);
};

ZmListController.prototype._getNavStartEnd =
function(view) {
	var offset = this._listView[view].getOffset();
	var limit = this._listView[view].getLimit();
	var size = this._list.size();

	var start, end;
	if (size > 0) {
		start = offset + 1;
		end = Math.min(offset + limit, size);
	}

	return (start && end) ? {start:start, end:end} : null;
};

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

// default callback before a view is shown - enable/disable nav buttons
ZmListController.prototype._preShowCallback =
function(view, viewPushed) {
	this._resetNavToolBarButtons(view);
	return true;
};

/*
* Creates the New menu's drop down menu the first time the drop down arrow is used,
* then removes itself as a listener.
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

ZmListController.prototype._getDefaultFocusItem =
function() {
	return this._listView[this._currentView];
};

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
