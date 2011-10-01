/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2004-2011 Zimbra, Inc.
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
 * This file defines a list controller class.
 *
 */

/**
 * This class is a base class for any controller that manages a list of items such as mail messages
 * or contacts. It can handle alternative views of the same list.
 *
 * @author Conrad Damon
 *
 * @param {DwtControl}					container					the containing shell
 * @param {ZmApp}						app							the containing application
 * @param {constant}					type						type of controller
 * @param {string}						sessionId					the session id
 * @param {ZmSearchResultsController}	searchResultsController		containing controller
 * 
 * @extends		ZmBaseController
 */
ZmListController = function(container, app, type, sessionId, searchResultsController) {

	if (arguments.length == 0) { return; }
	ZmBaseController.apply(this, arguments);

	// hashes keyed by view type
	this._navToolBar = {};			// ZmNavToolBar
	this._listView = this._view;	// ZmListView (back-compatibility for bug 60073)

	this._list = null;				// ZmList
	this._activeSearch = null;
	this._newButton = null;
	this._actionMenu = null;		// ZmActionMenu
	this._actionEv = null;
	
	if (this.supportsDnD()) {
		this._dropTgt = new DwtDropTarget("ZmTag");
		this._dropTgt.markAsMultiple();
		this._dropTgt.addDropListener(this._dropListener.bind(this));
	}

	this._menuPopdownListener = this._menuPopdownActionListener.bind(this);
	
	this._itemCountText = {};
	this._continuation = {count:0, totalItems:0};
};

ZmListController.prototype = new ZmBaseController;
ZmListController.prototype.constructor = ZmListController;

ZmListController.prototype.isZmListController = true;
ZmListController.prototype.toString = function() { return "ZmListController"; };

// When performing a search action (bug 10317) on all items (including those not loaded),
// number of items to load on each search to work through all results. Should be a multiple
// of ZmList.CHUNK_SIZE. Make sure to test if you change these.
ZmListController.CONTINUATION_SEARCH_ITEMS = 500;

// states of the progress dialog
ZmListController.PROGRESS_DIALOG_INIT	= "INIT";
ZmListController.PROGRESS_DIALOG_UPDATE	= "UPDATE";
ZmListController.PROGRESS_DIALOG_CLOSE	= "CLOSE";


/**
 * Performs some setup for displaying the given search results in a list view. Subclasses will need
 * to do the actual display work, typically by calling the list view's {@link #set} method.
 *
 * @param {ZmSearchResult}	searchResults		the search results
 */
ZmListController.prototype.show	=
function(searchResults) {
	
	this._activeSearch = searchResults;
	// save current search for use by replenishment
	if (searchResults) {
		this._currentSearch = searchResults.search;
	}
	this.currentPage = 1;
	this.maxPage = 1;
};

/**
 * Returns the current list view.
 * 
 * @return {ZmListView}	the list view
 */
ZmListController.prototype.getListView =
function() {
	return this._view[this._currentViewId];
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

ZmListController.prototype.getSelection =
function(view) {
    view = view || this.getListView();
    return view ? view.getSelection() : [];
};

ZmListController.prototype.getSelectionCount =
function(view) {
    view = view || this.getListView();
    return view ? view.getSelectionCount() : 0;
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
		if (this._list) {
			this._list.clear();
		}
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
		this._resetNavToolBarButtons();
	}
};

/**
 * Returns a list of the selected items.
 */
ZmListController.prototype.getItems =
function() {
	return this.getSelection();
};

/**
 * Returns the number of selected items.
 */
ZmListController.prototype.getItemCount =
function() {
	return this.getSelectionCount();
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
	var listView = this._view[this._currentViewId];
	var hardDelete = false;

	switch (actionCode) {

		case DwtKeyMap.DBLCLICK:
			return listView.handleKeyAction(actionCode);


		case ZmKeyMap.SHIFT_DEL:
			hardDelete = true;
			//Intentional fall-through to the next case. Watch out not to add something after this. 

		case ZmKeyMap.DEL:
			var tb = this.getCurrentToolbar();
			var button = tb && (tb.getButton(ZmOperation.DELETE) || tb.getButton(ZmOperation.DELETE_MENU));
			if (button && button.getEnabled()) {
				this._doDelete(this.getSelection(), hardDelete);
			}
			break;

		case ZmKeyMap.NEXT_PAGE:
			var ntb = this._navToolBar[this._currentViewId];
			var button = ntb ? ntb.getButton(ZmOperation.PAGE_FORWARD) : null;
			if (button && button.getEnabled()) {
				this._paginate(this._currentViewId, true);
			}
			break;

		case ZmKeyMap.PREV_PAGE:
			var ntb = this._navToolBar[this._currentViewId];
			var button = ntb ? ntb.getButton(ZmOperation.PAGE_BACK) : null;
			if (button && button.getEnabled()) {
				this._paginate(this._currentViewId, false);
			}
			break;

		default:
			return ZmBaseController.prototype.handleKeyAction.call(this, actionCode);
	}
	return true;
};

// Returns a list of desired action menu operations
ZmListController.prototype._getActionMenuOps = function() {};

/**
 * @private
 */
ZmListController.prototype._standardActionMenuOps =
function() {
	return [ZmOperation.TAG_MENU, ZmOperation.MOVE, ZmOperation.PRINT];
};

/**
 * @private
 */
ZmListController.prototype._participantOps =
function() {
	var ops = [ZmOperation.SEARCH_MENU];

	if (appCtxt.get(ZmSetting.MAIL_ENABLED)) {
		ops.push(ZmOperation.NEW_MESSAGE);
	}

	if (appCtxt.get(ZmSetting.IM_ENABLED)) {
		ops.push(ZmOperation.IM);
	}

	if (appCtxt.get(ZmSetting.CONTACTS_ENABLED)) {
		ops.push(ZmOperation.CONTACT);
	}

	return ops;
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
	if (!menuItems) { return; }

	var menuParams = {parent:this._shell,
		menuItems:	menuItems,
		context:	this._getMenuContext(),
		controller:	this
	};
	this._actionMenu = new ZmActionMenu(menuParams);
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

ZmListController.prototype._menuPopdownActionListener =
function(ev) {
	if (!this._pendingActionData) {
		var view = this.getCurrentView();
		if (view && view.handleActionPopdown) {
			view.handleActionPopdown(ev);
		}
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
	} 
	else if (ev.field == ZmItem.F_MSG_PRIORITY) {
		this._doMsgPriority([ev.item]);
	}
	else {
		var lv = this._listView[this._currentViewId];
		if (lv) {
			if (appCtxt.get(ZmSetting.SHOW_SELECTION_CHECKBOX)) {
				if (!ev.ctrlKey && lv.setSelectionHdrCbox) {
					lv.setSelectionHdrCbox(false);
				}
			}
			this._resetOperations(this.getCurrentToolbar(), lv.getSelectionCount());
		}
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

    if (appCtxt.get(ZmSetting.SEARCH_ENABLED)) {
        this._setSearchMenu(actionMenu);
    }
	this._resetOperations(actionMenu, this.getSelectionCount());
};

/**
 * override to override the text from "received from sender"
 */
ZmBaseController.prototype.getSearchFromText =
function() {
	return null;
};

/**
 * override to override the text from "sent to sender"
 */
ZmBaseController.prototype.getSearchToText =
function() {
	return null;
};


/**
 * Add listener to search menu
 *
 * @param parent
 */
ZmListController.prototype._setSearchMenu =
function(parent, isToolbar) {
	if (!parent) return;
	var searchMenu = parent.getSearchMenu();
	if (!searchMenu) {
		return;
	}
	searchMenu.addSelectionListener(ZmOperation.SEARCH, this._participantSearchListener.bind(this, isToolbar));
	searchMenu.addSelectionListener(ZmOperation.SEARCH_TO, this._participantSearchToListener.bind(this, isToolbar));

	if (this.getSearchFromText()) {
		searchMenu.getMenuItem(ZmOperation.SEARCH).setText(this.getSearchFromText());
	}
	if (this.getSearchToText()) {
		searchMenu.getMenuItem(ZmOperation.SEARCH_TO).setText(this.getSearchToText());
	}
};


// Navbar listeners

/**
 * @private
 */
ZmListController.prototype._navBarListener =
function(ev) {

	// skip listener for non-current views
	if (!this.isCurrent()) { return; }

	var op = ev.item.getData(ZmOperation.KEY_ID);

	if (op == ZmOperation.PAGE_BACK || op == ZmOperation.PAGE_FORWARD) {
		this._paginate(this._currentViewId, (op == ZmOperation.PAGE_FORWARD));
	}
};

// Participant listeners

/**
 * From Search based on email address.
 * 
 * @private
 */
ZmListController.prototype._participantSearchListener =
function(ev) {

    var folder = this._getSearchFolder();
    if (folder && (folder.nId == ZmFolder.ID_SENT || folder.nId == ZmFolder.ID_DRAFTS)) {
        /* sent/drafts search from all recipients */
        var ccAddrs = this._actionEv.item.getAddresses(AjxEmailAddress.CC).getArray();
        var toAddrs = this._actionEv.item.getAddresses(AjxEmailAddress.TO).getArray();
        var name = toAddrs.concat(ccAddrs);
        appCtxt.getSearchController().fromSearch(name);
    }
    else{
	    var name = this._actionEv.address.getAddress();
        appCtxt.getSearchController().fromSearch(name);
    }
};

// Participant listeners

/**
 * To Search based on email address.
 *
 * @private
 */
ZmListController.prototype._participantSearchToListener =
function(ev) {

	var folder = this._getSearchFolder();
    if (folder && (folder.nId == ZmFolder.ID_SENT || folder.nId == ZmFolder.ID_DRAFTS)) {
        /* sent/drafts search to all recipients */
        var toAddrs = this._actionEv.item.getAddresses(AjxEmailAddress.TO).getArray();
        var ccAddrs = this._actionEv.item.getAddresses(AjxEmailAddress.CC).getArray();
        var name = toAddrs.concat(ccAddrs).concat(ccAddrs);
        appCtxt.getSearchController().toSearch(name);
    }
    else{
	    var name = this._actionEv.address.getAddress();
        appCtxt.getSearchController().toSearch(name);
    }
};

/**
 * Compose message to participant.
 * 
 * @private
 */
ZmListController.prototype._participantComposeListener =
function(ev) {
	var name = this._actionEv.address.toString() + AjxEmailAddress.SEPARATOR;
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
	var loadCallback = this._handleLoadParticipantContactListener.bind(this);
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
			var isDirty = this._actionEv.contact.isGal;
			cc.show(this._actionEv.contact, isDirty);
		} else {
			var callback = this._loadContactCallback.bind(this);
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
 * @protected
 */
ZmListController.prototype._dropListener =
function(ev) {

	var view = this._view[this._currentViewId];
	var div = view.getTargetItemDiv(ev.uiEvent);
	var item = view.getItemFromElement(div);

	// only tags can be dropped on us
	var data = ev.srcData.data;
	if (ev.action == DwtDropEvent.DRAG_ENTER) {
		ev.doIt = (item && (item instanceof ZmItem) && !item.isShared() && this._dropTgt.isValidTarget(data));
        // Bug: 44488 - Don't allow dropping tag of one account to other account's item
        if (appCtxt.multiAccounts) {
           var listAcctId = item ? item.getAccount().id : null;
           var tagAcctId = (data.account && data.account.id) || data[0].account.id;
           if (listAcctId != tagAcctId) {
               ev.doIt = false;
           }
        }
		DBG.println(AjxDebug.DBG3, "DRAG_ENTER: doIt = " + ev.doIt);
		if (ev.doIt) {
			view.dragSelect(div);
		}
	} else if (ev.action == DwtDropEvent.DRAG_DROP) {
		view.dragDeselect(div);
		var items = [item];
		var sel = this.getSelection();
		if (sel.length) {
			var vec = AjxVector.fromArray(sel);
			if (vec.contains(item)) {
				items = sel;
			}
		}
		this._doTag(items, data, true);
	} else if (ev.action == DwtDropEvent.DRAG_LEAVE) {
		view.dragDeselect(div);
	} else if (ev.action == DwtDropEvent.DRAG_OP_CHANGED) {
		// nothing
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
	ZmOperation.setOperation(this.getCurrentToolbar(), ZmOperation.CONTACT, newOp, ZmMsg.AB_ADD_CONTACT);
	ZmOperation.setOperation(this.getActionMenu(), ZmOperation.CONTACT, newOp, newText);
};

/**
 * This method gets overloaded if folder id is retrieved another way
 * 
 * @private
 */
ZmListController.prototype._getSearchFolderId =
function() {
	var s = this._activeSearch && this._activeSearch.search;
	return s && s.singleTerm && s.folderId;
};

/**
 * @private
 */
ZmListController.prototype._getSearchFolder =
function() {
	var id = this._getSearchFolderId();
	return id && appCtxt.getById(id);
};

/**
 * returns true if the search folder is drafts
 */
ZmListController.prototype.isDraftsFolder =
function() {
	var folder = this._getSearchFolder();
	if (!folder) {
		return false;
	}
	return folder.nId ==  ZmFolder.ID_DRAFTS;
};

/**
 * returns true if the search folder is sync failures
 */
ZmListController.prototype.isSyncFailuresFolder =
function() {
	var folder = this._getSearchFolder();
	if (!folder) {
		return false;
	}
	return folder.nId ==  ZmFolder.ID_SYNC_FAILURES;
};


// Actions on items are performed through their containing list
ZmListController.prototype._getList =
function(items) {

	var list = ZmBaseController.prototype._getList.apply(this, arguments);
	if (!list) {
		list = this._list;
	}

	return list;
};

// if items were removed, see if we need to fetch more
ZmListController.prototype._getAllDoneCallback =
function() {
	return this._checkItemCount.bind(this);
};

/**
 * Manages the progress dialog that appears when an action is performed on a large number of items.
 * The arguments include a state and any arguments relative to that state. The state is one of:
 * 
 * 			ZmListController.PROGRESS_DIALOG_INIT
 *			ZmListController.PROGRESS_DIALOG_UPDATE
 *			ZmListController.PROGRESS_DIALOG_CLOSE
 *  
 * @param {hash}		params		a hash of params:
 * @param {constant}	state		state of the dialog
 * @param {AjxCallback}	callback	cancel callback (INIT)
 * @param {string}		summary		summary text (UPDATE)
 */
ZmListController.handleProgress =
function(params) {

	var dialog = appCtxt.getCancelMsgDialog();
	if (params.state == ZmListController.PROGRESS_DIALOG_INIT) {
		dialog.reset();
		dialog.registerCallback(DwtDialog.CANCEL_BUTTON, params.callback);
		ZmListController.progressDialogReady = true;
	}
	else if (params.state == ZmListController.PROGRESS_DIALOG_UPDATE && ZmListController.progressDialogReady) {
		dialog.setMessage(params.summary, DwtMessageDialog.INFO_STYLE, AjxMessageFormat.format(ZmMsg.inProgress));
		if (!dialog.isPoppedUp()) {
			dialog.popup();
		}
	}
	else if (params.state == ZmListController.PROGRESS_DIALOG_CLOSE) {
		dialog.unregisterCallback(DwtDialog.CANCEL_BUTTON);
		dialog.popdown();
		ZmListController.progressDialogReady = false;
	}
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
		query:			this.getSearchString(),
		queryHint:		this.getSearchStringHint(),
		types:			((this._activeSearch && this._activeSearch.search) ? this._activeSearch.search.types : []), // use types from original search 
		sortBy:			appCtxt.get(ZmSetting.SORTING_PREF, view), 
		offset:			offset,
		limit:			limit,
		lastId:			lastId,
		lastSortVal:	lastSortVal
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
	var lv = this._view[view];
	var offset, max;

    limit = limit || lv.getLimit(offset);

	if (lv._isPageless) {
		offset = this._list.size();
		needMore = true;
	} else {
		offset = lv.getNewOffset(forward);
		needMore = (offset + limit > this._list.size());
		this.currentPage = this.currentPage + (forward ? 1 : -1);
		this.maxPage = Math.max(this.maxPage, this.currentPage);
	}

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
		var respCallback = this._handleResponsePaginate.bind(this, view, false, loadIndex, offset);
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

	var lv = this._view[this._currentViewId];
	var num = lv._isPageless ? this.getSelectionCount() : 0;
	this._resetOperations(this._toolbar[view], num);

	// remember selected index if told to
	var selItem = saveSelection ? this.getSelection()[0] : null;
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
		DBG.println("scr", "items selected: " + this.getSelectionCount());
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

	var view = this.getListView();
	var list = view.getList();
	// don't bother if the view doesn't really have a list
	var replenishmentDone = false;
	if (list) {
		var replCount = view.getLimit() - view.size();
		if (replCount > view.getReplenishThreshold()) {
			this._replenishList(this._currentViewId, replCount, callback);
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
		this._paginate(this._currentViewId, false, 0);
	} else {
		listView.removeAll(true);
		listView._setNoResultsHtml();
		this._resetNavToolBarButtons();
		listView._checkItemCount();
	}
};

/**
 * @private
 */
ZmListController.prototype._replenishList =
function(view, replCount, callback) {

	// determine if there are any more items to replenish with
	var idxStart = this._view[view].offset + this._view[view].size();
	var totalCount = this._list.size();

	if (idxStart < totalCount) {
		// replenish from cache
		var idxEnd = (idxEnd > totalCount) ? totalCount : (idxStart + replCount);
		var list = this._list.getVector().getArray();
		var sublist = list.slice(idxStart, idxEnd);
		var subVector = AjxVector.fromArray(sublist);
		this._view[view].replenish(subVector);
		if (callback) {
			callback.run();
		}
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
	var list = this.getListView().getList();
	if (list) {
		var selIdx = idx >= 0 ? idx : 0;
		var first = list.get(selIdx);
		this._view[this._currentViewId].setSelection(first, false);
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
		var list = this._view[view].getList();
		var lastItem = list.getLast();
		var lastSortVal = (lastItem && lastItem.id) ? lastItem.sf : null;
		var lastId = lastSortVal ? lastItem.id : null;
		var respCallback = this._handleResponseGetMoreToReplenish.bind(this, view, callback);
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
	this._view[view].replenish(list);

	// reset forward pagination button only
	this._toolbar[view].enable(ZmOperation.PAGE_FORWARD, more);

	if (callback) {
		callback.run(result);
	}
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
		var navBarListener = this._navBarListener.bind(this);
		this._navToolBar[view].addSelectionListener(ZmOperation.PAGE_BACK, navBarListener);
		this._navToolBar[view].addSelectionListener(ZmOperation.PAGE_FORWARD, navBarListener);
	}
};

/**
 * @private
 */
ZmListController.prototype._resetNavToolBarButtons =
function(view) {

	view = view || this.getCurrentViewId();
	var lv = this._view[view];
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

	var lv = this._view[view];
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

	var size = this._getItemCount();
	if (size == null) { return ""; }
	var lv = this._view[this._currentViewId];
	var list = lv && lv._list;
	var type = lv._getItemCountType();
	var total = this._getNumTotal();
	var num = total || size;
    var typeText = type ? AjxMessageFormat.format(ZmMsg[ZmItem.COUNT_KEY[type]], num) : "";
	if (total && (size != total)) {
		return AjxMessageFormat.format(ZmMsg.itemCount1, [size, total, typeText]);
	} else {
		var sizeText = size + (this._list.hasMore() ? "+" : "");
		return AjxMessageFormat.format(ZmMsg.itemCount, [sizeText, typeText]);
	}
};

ZmListController.prototype._getItemCount =
function() {
	var lv = this.getListView();
	var list = lv && lv._list;
	if (!list) { return null; }
	return list.size();
};

/**
 * Sets the text that shows the number of items, if we are pageless.
 * 
 * @private
 */
ZmListController.prototype._setItemCountText =
function(text) {

	text = text || this._getItemCountText();
	var field = this._itemCountText[this._currentViewId];
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
 * @param {closure}		allDoneCallback		the callback to run after all items processed
 * 
 * @private
 */
ZmListController.prototype._setupContinuation =
function(actionMethod, args, params, allDoneCallback) {

	// need to use AjxCallback here so we can prepend items arg when calling it
	var actionCallback = new AjxCallback(this, actionMethod, args);
	params.finalCallback = this._continueAction.bind(this, {actionCallback:actionCallback, allDoneCallback:allDoneCallback});
	
	params.count = this._continuation.count;
	params.idsOnly = true;

	if (!this._continuation.lastItem) {
		this._continuation.lastItem = params.list.getVector().getLast();
		this._continuation.totalItems = params.list.size();
	}
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
 * @param {Hash}		params				a hash of parameters
 * @param {AjxCallback}	actionCallback		the callback with action to be performed on search results
 * @param {closure} 	allDoneCallback		the callback to run when we're all done
 * @param {Hash}		actionParams		the params from <code>ZmList._itemAction</code>, added when this is called
 * 
 * @private
 */
ZmListController.prototype._continueAction =
function(params, actionParams) {

	var lv = this._view[this._currentViewId];
	var cancelled = actionParams && actionParams.cancelled;
	var contResult = this._continuation.result;
	var hasMore = contResult ? contResult.getAttribute("more") : (this._list ? this._list.hasMore() : false);
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
		var respCallback = this._handleResponseContinueAction.bind(this, params.actionCallback);
		appCtxt.getSearchController().redoSearch(this._continuation.search, true, null, respCallback);
	} else {
		DBG.println("sa", "end of continuation");
		if (contResult) {
			if (lv.allSelected) {
				// items beyond page were acted on, give user a total count
				if (actionParams.actionText) {
					actionParams.actionSummary = ZmList.getActionSummary(actionParams.actionText, this._continuation.totalItems, contResult.type, actionParams.actionArg);
				}
				lv.deselectAll();
			}
			this._continuation = {count:0, totalItems:0};
		}
		if (params.allDoneCallback) {
			params.allDoneCallback();
		}

		ZmListController.handleProgress({state:ZmListController.PROGRESS_DIALOG_CLOSE});
		ZmBaseController.showSummary(actionParams.actionSummary, actionParams.actionLogItem, actionParams.closeChildWin);
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
	var lv = this._view[this._currentViewId];
	lv._checkItemCount();
	lv._handleResponseCheckReplenish(true);
};
