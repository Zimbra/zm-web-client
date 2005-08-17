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
* <p>Controllers for single items may extend this class, since the functionality needed is 
* virtually the same. An item can be thought of as the degenerate form of a list.</p>
*
* @author Conrad Damon
* @param appCtxt	app context
* @param container	containing shell
* @param app		containing app
*/
function LmListController(appCtxt, container, app) {

	if (arguments.length == 0) return;
	LmController.call(this, appCtxt, container, app);

	this._toolbar = new Object;		// LmButtonToolbar (one per view)
	this._listView = new Object;	// LmListView (one per view)
	this._list = null;				// LmList (the data)
	this._actionMenu = null; 		// LmActionMenu
	this._actionEv = null;
	
	this._tagList = this._appCtxt.getTagList();
	this._tagList.addChangeListener(new LsListener(this, this._tagChangeListener));
	this._creatingTag = false;
	this._activeSearch = null;
	this._searchString = null;

	// create a listener for each operation
	this._listeners = new Object();
	this._listeners[LmOperation.NEW_MENU] = new LsListener(this, this._newListener);
	this._listeners[LmOperation.TAG_MENU] = new LsListener(this, this._tagButtonListener);
	this._listeners[LmOperation.TAG] = new LsListener(this, this._tagListener);
	this._listeners[LmOperation.PRINT] = new LsListener(this, this._printListener);
	this._listeners[LmOperation.DELETE]  = new LsListener(this, this._deleteListener);
	this._listeners[LmOperation.CLOSE] = new LsListener(this, this._backListener);
	this._listeners[LmOperation.MOVE]  = new LsListener(this, this._moveListener);
	this._listeners[LmOperation.SEARCH] = new LsListener(this, this._participantSearchListener);
	this._listeners[LmOperation.BROWSE] = new LsListener(this, this._participantBrowseListener);
	this._listeners[LmOperation.NEW_MESSAGE] = new LsListener(this, this._participantComposeListener);
	this._listeners[LmOperation.IM] = new LsListener(this, this._participantImListener);
	this._listeners[LmOperation.CONTACT] = new LsListener(this, this._participantContactListener);
	this._listeners[LmOperation.VIEW] = new LsListener(this, this._viewButtonListener);

	this._popdownListener = new LsListener(this, this._popdownActionListener);

	this._dropTgt = new DwtDropTarget(LmTag);
	this._dropTgt.markAsMultiple();
	this._dropTgt.addDropListener(new LsListener(this, this._dropListener));
}

LmListController.prototype = new LmController;
LmListController.prototype.constructor = LmListController;

// abstract public methods

// public methods

LmListController.prototype.toString = 
function() {
	return "LmListController";
}

/**
* Performs some setup for displaying the given search results in a list view. Subclasses will need
* to do the actual display work, typically by calling the list view's set() method.
*
* @param searchResults		a LmSearchResult
* @param searchString		the query string
* @param view				view type to use
*/
LmListController.prototype.show	=
function(searchResults, searchString, view) {
	this._currentView = view ? view : this._defaultView();
	this._activeSearch = searchResults;
	this._searchString = searchString;
	// save current search for use by replenishment
	if (searchResults)
		this._currentSearch = searchResults.search;
	this.currentPage = 1;
	this.maxPage = 1;
	this.pageIsDirty = new Object();
}

LmListController.prototype.getCurrentView = 
function() {
	return this._listView[this._currentView];
}

LmListController.prototype.getList = 
function() {
	return this._list;
}

LmListController.prototype.setList = 
function(newList) {
	if (newList != this._list && (newList instanceof LmList)) {
		// dtor current list if necessary
		if (this._list)
			this._list.clear();
		this._list = newList;
	}
}

// abstract protected methods

// Creates the view element
LmListController.prototype._createNewView	 	= function() {}

// Returns the view ID
LmListController.prototype._getViewType 		= function() {}

// Populates the view with data
LmListController.prototype._setViewContents		= function(view) {}

// Returns text for the tag operation
LmListController.prototype._getTagMenuMsg 		= function(num) {}

// Returns text for the move dialog
LmListController.prototype._getMoveDialogTitle	= function(num) {}

// Returns a list of desired toolbar operations
LmListController.prototype._getToolBarOps 		= function() {}

// Returns a list of desired action menu operations
LmListController.prototype._getActionMenuOps 	= function() {}

// Attempts to process a nav toolbar up/down button click
LmListController.prototype._paginateDouble 		= function(bDoubleForward) {}

// Saves search results so we only fetch them once
LmListController.prototype._cacheList			= function(search) {}

// Returns the type of item in the underlying list
LmListController.prototype._getItemType			= function() {}

// private and protected methods

// Creates basic elements and sets the toolbar and action menu
LmListController.prototype._setup =
function(view) {
	this._initialize(view);
	this._resetOperations(this._toolbar[view], 0);
	this._resetOperations(this._actionMenu, 0);
}

// Creates the basic elements: toolbar, list view, and action menu
LmListController.prototype._initialize =
function(view) {
	this._initializeToolBar(view);
	this._initializeListView(view);
	this._initializeActionMenu();
}

// Below are functions that return various groups of operations, for cafeteria-style
// operation selection.

LmListController.prototype._standardToolBarOps =
function() {
	var list = [LmOperation.NEW_MENU];
	if (this._appCtxt.get(LmSetting.TAGGING_ENABLED))
		list.push(LmOperation.TAG_MENU);
	list.push(LmOperation.SEP);
	if (this._appCtxt.get(LmSetting.PRINT_ENABLED))
		list.push(LmOperation.PRINT);
	list.push(LmOperation.DELETE);
	list.push(LmOperation.MOVE);
	return list;
}

LmListController.prototype._standardActionMenuOps =
function() {
	var list = new Array();
	if (this._appCtxt.get(LmSetting.TAGGING_ENABLED))
		list.push(LmOperation.TAG_MENU);
	list.push(LmOperation.DELETE);
	if (this._appCtxt.get(LmSetting.PRINT_ENABLED))
		list.push(LmOperation.PRINT);
	list.push(LmOperation.MOVE);
	return list;
}

LmListController.prototype._contactOps =
function() {
	var list = new Array();
	if (this._appCtxt.get(LmSetting.SEARCH_ENABLED))
		list.push(LmOperation.SEARCH);
	if (this._appCtxt.get(LmSetting.BROWSE_ENABLED))
		list.push(LmOperation.BROWSE);
	list.push(LmOperation.NEW_MESSAGE);
	if (this._appCtxt.get(LmSetting.IM_ENABLED))
		list.push(LmOperation.IM);
	if (this._appCtxt.get(LmSetting.CONTACTS_ENABLED))
		list.push(LmOperation.CONTACT);
	return list;
}

// toolbar: buttons and listeners
LmListController.prototype._initializeToolBar = 
function(view) {
	if (this._toolbar[view]) return;

	var buttons = this._getToolBarOps();
	if (!buttons) return;
	this._toolbar[view] = new LmButtonToolBar(this._container, buttons, null, Dwt.ABSOLUTE_STYLE, "LmAppToolBar");
	// remove text for Print, Delete, and Move buttons
	var list = [LmOperation.PRINT, LmOperation.DELETE, LmOperation.MOVE];
	for (var i = 0; i < list.length; i++) {
		var button = this._toolbar[view].getButton(list[i]);
		if (button)
			button.setText(null);
	}
	for (var i = 0; i < buttons.length; i++)
		if (buttons[i] > 0 && this._listeners[buttons[i]])
			this._toolbar[view].addSelectionListener(buttons[i], this._listeners[buttons[i]]);
	this._propagateMenuListeners(this._toolbar[view], LmOperation.NEW_MENU);
	if (this._appCtxt.get(LmSetting.TAGGING_ENABLED)) {
		var tagMenuButton = this._toolbar[view].getButton(LmOperation.TAG_MENU);
		if (tagMenuButton) {
			tagMenuButton.noMenuBar = true;
			this._setupTagMenu(this._toolbar[view]);
		}
	}
}

// list view and its listeners
LmListController.prototype._initializeListView = 
function(view) {
	if (this._listView[view]) return;
	
	this._listView[view] = this._createNewView(view);
	this._listView[view].addSelectionListener(new LsListener(this, this._listSelectionListener));
	this._listView[view].addActionListener(new LsListener(this, this._listActionListener));	
}

// action menu: menu items and listeners
LmListController.prototype._initializeActionMenu = 
function() {
	if (this._actionMenu) return;

	var menuItems = this._getActionMenuOps();
	if (!menuItems) return;
	this._actionMenu = new LmActionMenu(this._shell, menuItems);
	for (var i = 0; i < menuItems.length; i++)
		if (menuItems[i] > 0)
			this._actionMenu.addSelectionListener(menuItems[i], this._listeners[menuItems[i]]);
	this._actionMenu.addPopdownListener(this._popdownListener);
	if (this._appCtxt.get(LmSetting.TAGGING_ENABLED))
		this._setupTagMenu(this._actionMenu);
}

/**
* Creates the desired application view.
*
* @param view			view ID
* @param elements		array of view components
* @param isAppView		this view is a top-level app view
* @param clear			if true, clear the hidden stack of views
* @param pushOnly		don't reset the view's data, just swap the view in
*/
LmListController.prototype._setView =
function(view, elements, isAppView, clear, pushOnly) {

	// create the view (if we haven't yet)
	if (!this._appViews[view]) {
		// view management callbacks
		var callbacks = new Object();
		callbacks[LmAppViewMgr.CB_PRE_HIDE] =
			this._preHideCallback ? new LsCallback(this, this._preHideCallback) : null;
		callbacks[LmAppViewMgr.CB_POST_HIDE] =
			this._postHideCallback ? new LsCallback(this, this._postHideCallback) : null;
		callbacks[LmAppViewMgr.CB_PRE_SHOW] =
			this._preShowCallback ? new LsCallback(this, this._preShowCallback) : null;
		callbacks[LmAppViewMgr.CB_POST_SHOW] =
			this._postShowCallback ? new LsCallback(this, this._postShowCallback) : null;
	
		this._app.createView(view, elements, callbacks, isAppView);
		this._appViews[view] = 1;
	}

	// populate the view
	if (!pushOnly)
		this._setViewContents(view);

	// push the view
	 return (clear ? this._app.setView(view) : this._app.pushView(view));
}

// List listeners

// List selection event - handle flagging if a flag icon was clicked, otherwise reset
// the toolbar based on how many items are selected.
LmListController.prototype._listSelectionListener = 
function(ev) {
	if (ev.field == LmListView.FIELD_PREFIX[LmItem.F_FLAG]) {
		this._schedule(this._doFlag, {items: [ev.item]});
	} else {
		this._resetOperations(this._toolbar[this._currentView], this._listView[this._currentView].getSelectionCount());
	}
}

// List action event - set the dynamic tag menu, and enable operations in the action menu
// based on the number of selected items. Note that the menu is not actually popped up
// here; that's left up to the subclass, which should override this function.
LmListController.prototype._listActionListener = 
function(ev) {
	this._actionEv = ev;
	if (this._appCtxt.get(LmSetting.TAGGING_ENABLED))
		this._setTagMenu(this._actionMenu);
	this._resetOperations(this._actionMenu, this._listView[this._currentView].getSelectionCount());
}

LmListController.prototype._popdownActionListener = 
function(ev) {
	if (!this._pendingActionData)
		this._listView[this._currentView].handleActionPopdown(ev);
}

// Operation listeners

// Create some new thing, via a dialog. If just the button has been pressed (rather than
// a menu item), the action taken depends on the app.
LmListController.prototype._newListener = 
function(ev) {
	var id = ev.item.getData(LmOperation.KEY_ID);
	if (!id || id == LmOperation.NEW_MENU)
		id = this._defaultNewId;
	if (id == LmOperation.NEW_MESSAGE) {
		var inNewWindow = this._appCtxt.get(LmSetting.NEW_WINDOW_COMPOSE) || ev.shiftKey;
		this._appCtxt.getApp(LmLiquidMail.MAIL_APP).getComposeController().doAction(LmOperation.NEW_MESSAGE, inNewWindow);
	} else if (id == LmOperation.NEW_CONTACT) {
		var contact = new LmContact(this._appCtxt);
		this._appCtxt.getApp(LmLiquidMail.CONTACTS_APP).getContactController().show(contact);
	} else if (id == LmOperation.NEW_APPT) {
		var app = this._appCtxt.getApp(LmLiquidMail.CALENDAR_APP);
		var con = app.getCalController();
		con.newAppointment();
	} else if (id == LmOperation.NEW_FOLDER) {
		this._showDialog(this._appCtxt.getNewFolderDialog(), this._newFolderCallback);
	} else if (id == LmOperation.NEW_TAG) {
		this._showDialog(this._appCtxt.getNewTagDialog(), this._newTagCallback, null, null, false);
	}
}

// Tag button has been pressed. We don't tag anything (since no tag has been selected),
// we just show the dynamic tag menu.
LmListController.prototype._tagButtonListener = 
function(ev) {
	this._setTagMenu(this._toolbar[this._currentView]);
}

// Tag/untag items.
LmListController.prototype._tagListener = 
function(item) {
	if (this._app.getAppViewMgr().getCurrentView() == this._getViewType()) {
		var tagEvent = item.getData(LmTagMenu.KEY_TAG_EVENT);
		var tagAdded = item.getData(LmTagMenu.KEY_TAG_ADDED);
		var items = this._listView[this._currentView].getSelection();
		if (tagEvent == LmEvent.E_TAGS && tagAdded) {
			this._schedule(this._doTag, {items: items, tag: item.getData(Dwt.KEY_OBJECT), bTag: true});
		} else if (tagEvent == LmEvent.E_CREATE) {
			this._pendingActionData = this._listView[this._currentView].getSelection();
			var newTagDialog = this._appCtxt.getNewTagDialog();
			this._showDialog(newTagDialog, this._newTagCallback, null, null, true);
			newTagDialog.registerCallback(DwtDialog.CANCEL_BUTTON, this._clearDialog, this, newTagDialog);
		} else if (tagEvent == LmEvent.E_TAGS && !tagAdded) {
			this._schedule(this._doTag, {items: items, tag: item.getData(Dwt.KEY_OBJECT), bTag: false});
		} else if (tagEvent == LmEvent.E_REMOVE_ALL) {
			// XXX: remove this once bug 607 is fixed
			if (this instanceof LmConvListController) {
				var tagList = item.getData(Dwt.KEY_OBJECT);
				for (var i = 0; i < tagList.length; i++)
					this._schedule(this._doTag, {items: items, tag: this._tagList.getById(tagList[i]), bTag: false});
			} else {
				this._schedule(this._doRemoveAllTags, items);
			}
		}
	}
}

LmListController.prototype._printListener = 
function(ev) {
	var items = this._listView[this._currentView].getSelection();
	var item = (items instanceof Array) ? items[0] : items;
	if (!this._printView)
		this._printView = new LmPrintView(this._appCtxt);
	
	this._printView.render(item);
}

LmListController.prototype._backListener = 
function(ev) {
	this._app.popView();
}

// Delete one or more items.
LmListController.prototype._deleteListener = 
function(ev) {
	var items = this._listView[this._currentView].getSelection();
	this._schedule(this._doDelete, {items: items});
}

// Move button has been pressed, show the dialog.
LmListController.prototype._moveListener = 
function(ev) {
	this._pendingActionData = this._listView[this._currentView].getSelection();
	var moveToDialog = this._appCtxt.getMoveToDialog();
	this._showDialog(moveToDialog, this._moveCallback, this._pendingActionData);
	moveToDialog.registerCallback(DwtDialog.CANCEL_BUTTON, this._clearDialog, this, moveToDialog);
	moveToDialog.setTitle(this._getMoveDialogTitle(this._pendingActionData.length));
}

// Switch to selected view.
LmListController.prototype._viewButtonListener =
function(ev) {
	this.switchView(ev.item.getData(LmOperation.MENUITEM_ID));
}

// Navbar listeners

LmListController.prototype._navBarListener = 
function(ev) {
	// skip listener for non-current views
	if (this._appCtxt.getAppViewMgr().getCurrentView() != this._getViewType())
		return;
	
	var op = ev.item.getData(LmOperation.KEY_ID);
	
	try {
		if (op == LmOperation.PAGE_BACK || op == LmOperation.PAGE_FORWARD) 
		{
			this._paginate(this._currentView, (op == LmOperation.PAGE_FORWARD));
		} 
		else if (op == LmOperation.PAGE_DBL_BACK || op == LmOperation.PAGE_DBL_FORW) 
		{
			this._paginateDouble(op == LmOperation.PAGE_DBL_FORW);
		}
	} catch (ex) {
		this._handleException(ex, this._navBarListener, ev, false);
	}
}

// Participant listeners

// Search based on email address
LmListController.prototype._participantSearchListener = 
function(ev) {
	var name = this._actionEv.address.getAddress();
	this._appCtxt.getSearchController().fromSearch(name);
}

// Browse based on email address
LmListController.prototype._participantBrowseListener = 
function(ev) {
	var name = this._actionEv.address.getAddress();
	this._appCtxt.getSearchController().fromBrowse(name);
}

// Compose message to participant
LmListController.prototype._participantComposeListener = 
function(ev) {
	var name = this._actionEv.address.toString() + LmEmailAddress.SEPARATOR;
	var inNewWindow = this._appCtxt.get(LmSetting.NEW_WINDOW_COMPOSE) || ev.shiftKey;
	var cc = this._appCtxt.getApp(LmLiquidMail.MAIL_APP).getComposeController();
	cc.doAction(LmOperation.NEW_MESSAGE, inNewWindow, null, name);
}

// IM the participant (if enabled via config)
LmListController.prototype._participantImListener =
function(ev) {
	// get the first selected message
	var msg = this._listView[this._currentView].getSelection()[0];
	var screenName = msg._contact._fullName;
	if (!this._newImDialog)
		this._newImDialog = new LmNewImDialog(this._shell, null, screenName);
	else
		this._newImDialog.setScreenName(screenName);
	this._newImDialog.popup();
}

// If there's a contact for the participant, edit it, otherwise add it.
LmListController.prototype._participantContactListener = 
function(ev) {
	var cc = this._appCtxt.getApp(LmLiquidMail.CONTACTS_APP).getContactController();	
	if (this._actionEv.contact) {
		cc.show(this._actionEv.contact);
	} else {
		var contact = new LmContact(this._appCtxt);
		contact.initFromEmail(this._actionEv.address);
		cc.show(contact);
	}
}

// Drag and drop listeners

LmListController.prototype._dragListener =
function(ev) {
	if (ev.action == DwtDragEvent.SET_DATA) {
		ev.srcData = {data: ev.srcControl.getDnDSelection(), controller: this};
	} else if (ev.action == DwtDragEvent.DRAG_END) {
		this._checkReplenish();
	}
}

// The list view as a whole is the drop target, since it's the lowest-level widget. Still, we
// need to find out which item got dropped onto, so we get that from the original UI event 
// (a mouseup). The header is within the list view, but not an item, so it's not a valid drop
// target. One drawback of having the list view be the drop target is that we can't exercise
// fine-grained control on what's a valid drop target. If you enter via an item and then drag to
// the header, it will appear to be valid.
LmListController.prototype._dropListener =
function(ev) {
	var div, item;
	div = DwtUiEvent.getTargetWithProp(ev.uiEvent, "_itemIndex");
	var view = this._listView[this._currentView];
	if (div) {
		item = view.getItemFromElement(div);
	}
	// only tags can be dropped on us
	if (ev.action == DwtDropEvent.DRAG_ENTER) {
		ev.doIt = (item && this._dropTgt.isValidTarget(ev.srcData));
		DBG.println(LsDebug.DBG3, "DRAG_ENTER: doIt = " + ev.doIt);
		if (item && (item.type == LmItem.CONTACT) && item.isGal)
			ev.doIt = false; // can't tag a GAL contact
	    view.dragSelect(div);
	} else if (ev.action == DwtDropEvent.DRAG_DROP) {
	    view.dragDeselect(div);
		var items = [item];
		var sel = view.getSelection();
		if (sel.length) {
			var vec = LsVector.fromArray(sel);
			if (vec.contains(item))
				items = sel;
		}
		var tag = ev.srcData;
		this._schedule(this._doTag, {items: items, tag: tag, bTag: true});
	} else if (ev.action == DwtDropEvent.DRAG_LEAVE) {
		view.dragDeselect(div);
	} else if (ev.action == DwtDropEvent.DRAG_OP_CHANGED) {
	}
}

// Dialog callbacks

// Created a new tag, now apply it.
LmListController.prototype._tagChangeListener = 
function(ev) {
	// only process if current view is this view!
	if (this._app.getAppViewMgr().getCurrentView() == this._getViewType()) {
		if (ev.type == LmEvent.S_TAG && ev.event == LmEvent.E_CREATE && this._creatingTag) {
			this._schedule(this._doTag, {items: this._pendingActionData, tag: ev.source, bTag: true});
			this._creatingTag = false;
			this._pendingActionData = null;
			this._popdownActionListener();
		}
	}
}

// Create a folder.
LmListController.prototype._newFolderCallback =
function(args) {
	this._appCtxt.getNewFolderDialog().popdown();
	var ftc = this._appCtxt.getOverviewPanelController().getFolderTreeController();
	this._schedule(ftc._doCreate, {name: args[0], parent: args[1]});
}

// Create a tag.
LmListController.prototype._newTagCallback =
function(args) {
	this._appCtxt.getNewTagDialog().popdown();
	var ttc = this._appCtxt.getOverviewPanelController().getTagTreeController();
	this._schedule(ttc._doCreate, {name: args[1], color: args[2]});
	this._creatingTag = args[0];
}

// Move stuff to a new folder.
LmListController.prototype._moveCallback =
function(args) {
	this._schedule(this._doMove, {items: this._pendingActionData, folder: args[0]});
	this._clearDialog(this._appCtxt.getMoveToDialog());
}

// Data handling

// Flag/unflag an item
LmListController.prototype._doFlag =
function(params) {
	try {
		this._list.flagItems(params.items, "flag", !params.items[0].isFlagged);
	} catch (ex) {
		this._handleException(ex, this._doFlag, params, false);
	}
}

// Tag/untag items
LmListController.prototype._doTag =
function(params) {
	try {
		this._list.tagItems(params.items, params.tag.id, params.bTag);
	} catch (ex) {
		this._handleException(ex, this._doTag, params, false);
	}
}

// Remove all tags for given items
LmListController.prototype._doRemoveAllTags = 
function(items) {
	try {
		this._list.removeAllTags(items);
	} catch (ex) {
		this._handleException(ex, this._doRemoveAllTags, items, false);
	}
}

// Delete items - moves them to Trash unless hardDelete is set, in which case they are
// physically deleted
LmListController.prototype._doDelete =
function(params) {
	try {
		this._list.deleteItems(params.items, params.hardDelete);
		this._checkReplenish();
	} catch (ex) {
		this._handleException(ex, this._doDelete, params, false);
	}
}

// Move items to a different folder
LmListController.prototype._doMove =
function(params) {
	try {
		this._list.moveItems(params.items, params.folder);
		this._checkReplenish();
	} catch (ex) {
		this._handleException(ex, this._doMove, params, false);
	}
}

// Modify an item
LmListController.prototype._doModify =
function(params) {
	try {
		this._list.modifyItems(params.items, params.mods);
	} catch (ex) {
		this._handleException(ex, this._doModify, params, false);
	}
}

// Create an item. We need to be passed a list since we may not have one.
LmListController.prototype._doCreate =
function(params) {
	try {
		params.list.create(params.args);
	} catch (ex) {
		this._handleException(ex, this._doCreate, params, false);
	}
}

// Miscellaneous

// Adds the same listener to all of a menu's items
LmListController.prototype._propagateMenuListeners =
function(parent, op, listener) {
	if (!parent) return;
	listener = listener || this._listeners[op];
	var opWidget = parent.getOp(op);
	if (opWidget) {
		var menu = opWidget.getMenu();
	    var items = menu.getItems();
		var cnt = menu.getItemCount();
		for (var i = 0; i < cnt; i++)
			items[i].addSelectionListener(listener);
	}
}

// Add listener to tag menu
LmListController.prototype._setupTagMenu =
function(parent) {
	if (!parent) return;
	var tagMenu = parent.getTagMenu();
	if (tagMenu)
		tagMenu.addSelectionListener(this._listeners[LmOperation.TAG]);
	if (parent instanceof LmButtonToolBar) {
		var tagButton = parent.getOp(LmOperation.TAG_MENU);
		if (tagButton)
			tagButton.addDropDownSelectionListener(this._listeners[LmOperation.TAG_MENU]);
	}
}

// Dynamically build the tag menu based on selected items and their tags.
LmListController.prototype._setTagMenu =
function(parent) {
	if (!parent) return;
	var tagOp = parent.getOp(LmOperation.TAG_MENU);
	if (tagOp) {
		var tagMenu = parent.getTagMenu();
		// dynamically build tag menu add/remove lists
		var items = this._listView[this._currentView].getSelection();
		if (items instanceof LmItem)
			items = [items];
		tagMenu.set(items, this._tagList);
		if (parent instanceof LmActionMenu)
			tagOp.setText(this._getTagMenuMsg(items.length));
		else
			tagMenu.popup();
	}
}

// Set the view menu's icon, and make sure the appropriate list item is checked
LmListController.prototype._setViewMenu =
function(view) {
	var appToolbar = this._appCtxt.getCurrentAppToolbar();
	appToolbar.showViewMenu(view);
    var menu = appToolbar.getViewButton().getMenu();
    var mi = menu.getItemById(LmOperation.MENUITEM_ID, view);
    if (mi)
		mi.setChecked(true, true);
}

// Set up the New button based on the current app.
LmListController.prototype._setNewButtonProps =
function(view, toolTip, enabledIconId, disabledIconId, defaultId) {
	var newButton = this._toolbar[view].getButton(LmOperation.NEW_MENU);
	if (newButton) {
		newButton.setToolTipContent(toolTip);
		newButton.setImage(enabledIconId);
		newButton.setDisabledImage(disabledIconId);
		this._defaultNewId = defaultId;
	}
}

// Sets text to "add" or "edit" based on whether a participant is a contact or not.
LmListController.prototype._setContactText =
function(isContact) {
	var newOp = isContact ? LmOperation.EDIT_CONTACT : LmOperation.NEW_CONTACT;
	var newText = isContact ? null : LmMsg.AB_ADD_CONTACT;
	LmOperation.setOperation(this._toolbar[this._currentView], LmOperation.CONTACT, newOp, LmMsg.AB_ADD_CONTACT);
	LmOperation.setOperation(this._actionMenu, LmOperation.CONTACT, newOp, newText);
}

// Resets the available options on a toolbar or action menu.
LmListController.prototype._resetOperations = 
function(parent, num) {
	if (!parent) return;
	if (num == 0) {
		parent.enableAll(false);
		parent.enable(LmOperation.NEW_MENU, true);
	} else if (num == 1) {
		parent.enableAll(true);
	} else if (num > 1) {
		// enable only the tag and delete operations
		parent.enableAll(false);
		parent.enable([LmOperation.NEW_MENU, LmOperation.TAG_MENU, LmOperation.DELETE, LmOperation.MOVE], true);
	}
}

// Pagination

LmListController.prototype._search = 
function(view, offset, limit, callback, isCurrent) {
	var sortBy = this._appCtxt.get(LmSetting.SORTING_PREF, view);
	var type = this._getItemType();
	var types = LsVector.fromArray([type]);
	var sc = this._appCtxt.getSearchController();
	var search = new LmSearch(this._appCtxt, this._searchString, types, sortBy, offset, limit);
	if (isCurrent)
		this._currentSearch = search;
	var obj = {"searchFieldAction": LmSearchController.LEAVE_SEARCH_TXT};
	sc.redoSearch(search, callback, obj);
}

// Get next or previous page of mail items, using last search as base.
// loadIndex is the index'd item w/in the list that needs to be loaded - 
// initiated only when user is in CV and pages a conversation that has not 
// been loaded yet. Also added a return value indicating whether the page was 
// cached or not to allow calling method to react accordingly.
LmListController.prototype._paginate = 
function(view, bPageForward, loadIndex) {
	var offset = this._listView[view].getNewOffset(bPageForward);
	var limit = this._listView[view].getLimit();
	bPageForward ? this.currentPage++ : this.currentPage--;
	this.maxPage = Math.max(this.maxPage, this.currentPage);
	DBG.println(LsDebug.DBG2, "current page is now: " + this.currentPage);

	this._listView[view].setOffset(offset);
	
	// if offset + limit has not been cached and more convs are available to d/l, 
	if ((offset + limit > this._list.size() && this._list.hasMore()) || this.pageIsDirty[this.currentPage]) {

		// attempt to fetch the remaining page that needs fetching 
		// (i.e. if user deleted a conv on the previous page)
		var delta = offset + limit - this._list.size();
		// set max to fetch only up to what we need
		var max = delta < limit && delta > 0 ? delta : limit;
		
		if (max < limit)
			offset = ((offset + limit) - max) + 1;

		// get remainder convs from server
		var callback = new LsCallback(this, this._paginateCallback, [view, loadIndex, false]);
		this._search(view, offset, max, callback, true);
		return false; // means page was not cached
	} 
	
	this._resetOperations(this._toolbar[view], 0);
	this._resetNavToolBarButtons(view);
	this._setViewContents(view);
	this._resetSelection();
	return true; // means page was cached
}

LmListController.prototype._paginateCallback = 
function(args) {
	var view = args[0];
	var bSaveSelection = args[2];
	var searchResult = args[3];
	
	// update more flag
	this._list.setHasMore(searchResult.getAttribute("more"));
	
	// cache search results into internal list
	this._cacheList(searchResult);
	
	this._resetOperations(this._toolbar[view], 0);
	this._resetNavToolBarButtons(view);

	// save selection if need be...
	var selItem = bSaveSelection === true ? this._listView[this._currentView].getSelection()[0] : null;
	var selectedIdx = selItem ? this._listView[this._currentView]._getItemIndex(selItem) : -1;
	
	this._setViewContents(view);
	this.pageIsDirty[this.currentPage] = false;
	this._resetSelection(selectedIdx);
}


LmListController.prototype._checkReplenish = 
function() {
	var view = this._listView[this._currentView];
	var list = view.getList();
	// dont bother if the view doesnt really have a list
	if (list) {
		var replCount = view.getLimit() - view.size();
		if (replCount > view.getReplenishThreshold())
			this._replenishList(this._currentView, replCount);
	}
}

LmListController.prototype._replenishList = 
function(view, replCount) {
	// determine if there are any more items to replenish with
	var idxStart = this._listView[view].getOffset() + this._listView[view].size();
	var totalCount = this._list.size();
	
	if (idxStart < totalCount) {
		// replenish from cache
		var idxEnd = idxStart + replCount;
		if (idxEnd > totalCount)
			idxEnd = totalCount;
		var list = this._list.getVector().getArray();
		var sublist = list.slice(idxStart, idxEnd);
		var subVector = LsVector.fromArray(sublist);
		this._listView[view].replenish(subVector);
	} else {
		// replenish from server request
		this._getMoreToReplenish(view, replCount);
	}
}

LmListController.prototype._resetSelection = 
function(idx) {
	var list = this._listView[this._currentView].getList();
	if (list) {
		var selIdx = idx >= 0 ? idx : 0;
		var first = list.get(selIdx);
		this._listView[this._currentView].setSelection(first, false, true);
	}
}

/**
* Requests replCount items from the server to replenish current listview
*
* @param view		current view to replenish
* @param replCount 	number of items to replenish
*/
LmListController.prototype._getMoreToReplenish = 
function(view, replCount) {
	if (this._list.hasMore()) {
		var offset = this._list.size();
		var callback = new LsCallback(this, this._replenishCallback, view);
		this._search(view, offset, replCount, callback);
	} else {
		if (this._listView[view].size() == 0)
			this._listView[view]._setNoResultsHtml();
	}
}

LmListController.prototype._replenishCallback = 
function(args) {
	var view = args[0];
	var searchResult = args[1];
	
	// set updated has more flag
	var more = searchResult.getAttribute("more");
	this._list.setHasMore(more);
	
	// cache search results into internal list
	this._cacheList(searchResult);

	// update view w/ replenished items
	var list = searchResult.getResults(this._getItemType()).getVector();
	this._listView[view].replenish(list);

	// reset forward pagination button only
	this._toolbar[view].enable(LmOperation.PAGE_FORWARD, more);
}

LmListController.prototype._setNavToolBar = 
function(toolbar) {
	this._navToolBar = toolbar;
	if (this._navToolBar) {
		var navBarListener = new LsListener(this, this._navBarListener);
		if (this._navToolBar.hasSingleArrows) {
			this._navToolBar.addSelectionListener(LmOperation.PAGE_BACK, navBarListener);
			this._navToolBar.addSelectionListener(LmOperation.PAGE_FORWARD, navBarListener);
		}
		if (this._navToolBar.hasDoubleArrows) {
			this._navToolBar.addSelectionListener(LmOperation.PAGE_DBL_BACK, navBarListener);
			this._navToolBar.addSelectionListener(LmOperation.PAGE_DBL_FORW, navBarListener);
		}
	}
}

LmListController.prototype._resetNavToolBarButtons = 
function(view) {
	if (!this._navToolBar) return;

	if (this._navToolBar.hasDoubleArrows)
		this._navToolBar.enable([LmOperation.PAGE_DBL_BACK, LmOperation.PAGE_DBL_FORW], false);

	if (this._navToolBar.hasSingleArrows) {
		var offset = this._listView[view].getOffset();
		this._navToolBar.enable(LmOperation.PAGE_BACK, offset > 0);
	
		// determine also if we have more cached conv to show (in case more is wrong)
		var hasMore = this._list ? this._list.hasMore() : false;
		var evenMore = this._list ? (offset + this._listView[view].getLimit()) < this._list.size() : false;
	
		this._navToolBar.enable(LmOperation.PAGE_FORWARD, (hasMore || evenMore));
	}
}

LmListController.prototype._showListRange = 
function(view) {
	var offset = this._listView[view].getOffset();
	var limit = this._listView[view].getLimit();
	var size = this._list.size();
	var start = offset + 1;
	var end = Math.min(offset + limit, size);
	this._navToolBar.setText(start + " - " + end);	
}

// default callback before a view is shown - enable/disable nav buttons
LmListController.prototype._preShowCallback =
function(view, viewPushed) {
	this._resetNavToolBarButtons(view);
	return true;
}
