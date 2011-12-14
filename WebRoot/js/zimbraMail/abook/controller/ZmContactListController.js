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
 * This file contains the contact list controller class.
 */

/**
 * Creates an empty contact list controller.
 * @class
 * This class manages list views of contacts. So far there are two different list
 * views, one that shows the contacts in a traditional list format, and the other
 * which shows them as business cards. Since there are two views, we need to keep
 * track of which is the current view.
 *
 * @author Roland Schemers
 * @author Conrad Damon
 * 
 * @param {DwtControl}					container					the containing shell
 * @param {ZmApp}						app							the containing application
 * @param {constant}					type						type of controller
 * @param {string}						sessionId					the session id
 * @param {ZmSearchResultsController}	searchResultsController		containing controller
 * 
 * @extends	ZmListController
 */
ZmContactListController = function(container, contactsApp, type, sessionId, searchResultsController) {

	if (arguments.length == 0) { return; }
	ZmListController.apply(this, arguments);

	this._viewFactory = {};
	this._viewFactory[ZmId.VIEW_CONTACT_SIMPLE] = ZmContactSplitView;

	if (this.supportsDnD()) {
		this._dragSrc = new DwtDragSource(Dwt.DND_DROP_MOVE);
		this._dragSrc.addDragListener(this._dragListener.bind(this));
	}

	this._listChangeListener = this._handleListChange.bind(this);

	this._listeners[ZmOperation.EDIT]			= this._editListener.bind(this);
	this._listeners[ZmOperation.PRINT]			= null; // override base class to do nothing
	this._listeners[ZmOperation.PRINT_CONTACT]	= this._printListener.bind(this);
	this._listeners[ZmOperation.PRINT_ADDRBOOK]	= this._printAddrBookListener.bind(this);
	this._listeners[ZmOperation.NEW_GROUP]		= this._groupListener.bind(this);

	this._parentView = {};
};

ZmContactListController.prototype = new ZmListController;
ZmContactListController.prototype.constructor = ZmContactListController;

ZmContactListController.prototype.isZmContactListController = true;
ZmContactListController.prototype.toString = function() { return "ZmContactListController"; };

ZmContactListController.ICON = {};
ZmContactListController.ICON[ZmId.VIEW_CONTACT_SIMPLE]		= "ListView";

ZmContactListController.MSG_KEY = {};
ZmContactListController.MSG_KEY[ZmId.VIEW_CONTACT_SIMPLE]	= "contactList";

ZmContactListController.SEARCH_TYPE_CANONICAL	= 1 << 0;
ZmContactListController.SEARCH_TYPE_GAL			= 1 << 1;
ZmContactListController.SEARCH_TYPE_NEW			= 1 << 2;
ZmContactListController.SEARCH_TYPE_ANYWHERE	= 1 << 3;

ZmContactListController.VIEWS = [ZmId.VIEW_CONTACT_SIMPLE];

// Public methods

/**
 * Shows the search results.
 * 
 * @param	{Object}	searchResult		the search results
 * @param	{Boolean}	isGalSearch		<code>true</code> if results from GAL search
 * @param	{String}	folderId		the folder id
 */
ZmContactListController.prototype.show =
function(searchResult, isGalSearch, folderId) {

	this._searchType = isGalSearch
		? ZmContactListController.SEARCH_TYPE_GAL
		: ZmContactListController.SEARCH_TYPE_CANONICAL;

	this._folderId = folderId;
	var selectedContacts;
	
	if (searchResult.isZmContactList) {
		this.setList(searchResult);			// set as canonical list of contacts
		this._list._isShared = false;		// this list is not a search of shared items
		selectedContacts = this._listView[this._currentViewId] && this._listView[this._currentViewId].getSelection();
		this._contactSearchResults = false;
    }
	else if (searchResult.isZmSearchResult) {
		this._searchType |= ZmContactListController.SEARCH_TYPE_NEW;
		this.setList(searchResult.getResults(ZmItem.CONTACT));

		// HACK - find out if user did a "is:anywhere" search (for printing)
		if (searchResult.search && searchResult.search.isAnywhere()) {
			this._searchType |= ZmContactListController.SEARCH_TYPE_ANYWHERE;
		}

		if (searchResult.search && searchResult.search.userText && this.getCurrentView()) {
			this.getCurrentView().getAlphabetBar().reset();
		}

		if (isGalSearch) {
			this._list = this._list || new ZmContactList(searchResult.search, true);
			this._list._isShared = false;
			this._list.isGalPagingSupported = AjxUtil.isSpecified(searchResult.getAttribute("offset"));
		} else {
			// find out if we just searched for a shared address book
			var addrbook = folderId ? appCtxt.getById(folderId) : null;
			this._list._isShared = addrbook ? addrbook.link : false;
		}

		this._list.setHasMore(searchResult.getAttribute("more"));

		selectedContacts = this._listView[this._currentViewId] && this._listView[this._currentViewId].getSelection();
		ZmListController.prototype.show.apply(this, [searchResult, this._currentViewId]);
		this._contactSearchResults = true;
	}

	// reset offset if list view has been created
	var view = this._currentViewId;
	if (this._listView[view]) {
		this._listView[view].offset = 0;
	}
	this.switchView(view, true);

	if (selectedContacts && selectedContacts.length && this._listView[view]) {
		this._listView[view].setSelection(selectedContacts[0]);
	}
};

ZmContactListController.prototype._dragListener =
function(ev) {
	ZmListController.prototype._dragListener.call(this, ev);
	if (ev.srcControl && ev.srcControl && ev.srcControl._folderId && ev.srcControl._folderId == ZmFolder.ID_DLS) {
		return;
	}
};


/**
 * Change how contacts are displayed. There are two views: the "simple" view
 * shows a list of contacts on the left and the selected contact on the right;
 * the "cards" view shows contacts as business cards.
 * 
 * @param {constant}	view			the view to show
 * @param {Boolean}	force			if <code>true</code>, render view even if it's the current view
 * @param {Boolean}	initialized		if <code>true</code>, app has been initialized
 * @param {Boolean}	stageView		if <code>true</code>, stage the view but don't push it
 */
ZmContactListController.prototype.switchView =
function(view, force, initialized, stageView) {
	if (view && ((view != this._currentViewId) || force)) {
		this._currentViewId = view;
		DBG.timePt("setting up view", true);
		this._setup(view);
		DBG.timePt("done setting up view");

		var elements = this.getViewElements(view, this._parentView[view]);

		// call initialize before _setView since we havent set the new view yet
		if (!initialized) {
			this._initializeAlphabetBar(view);
		}

		this._setView({ view:		view,
						viewType:	this._currentViewType,
						elements:	elements,
						isAppView:	true,
						stageView:	stageView});
		this._resetNavToolBarButtons();

		// HACK: reset search toolbar icon (its a hack we're willing to live with)
		if (this.isGalSearch() && !this._list.isGalPagingSupported) {
			appCtxt.getSearchController().setDefaultSearchType(ZmId.SEARCH_GAL);
			if (this._list.hasMore()) {
				var d = appCtxt.getMsgDialog();
				d.setMessage(ZmMsg.errorSearchNotExpanded);
				d.popup();
			}
		}

		this._setTabGroup(this._tabGroups[view]);

		if (!initialized) {
			var list = this._listView[view].getList();
			if (list) {
				this._listView[view].setSelection(list.get(0));
			}
		}
	}
};

/**
 * Gets the folder id.
 * 
 * @return	{String}	the folder id
 */
ZmContactListController.prototype.getFolderId =
function() {
	return this._folderId;
};




ZmContactListController.prototype.gatherContactExtraDlStuff =
function(contact, callback) {
	if (contact.dlInfo && contact.dlMembers) {
		callback();
		return;
	}
	var callbackFromGettingInfo = this._handleGetDlInfoResponse.bind(this, contact, callback);
	contact.loadDlInfo(callbackFromGettingInfo);
};

ZmContactListController.prototype._handleGetDlInfoResponse =
function(contact, callback, result) {
	var response = result._data.GetDistributionListResponse;
	var attrs = response.dl[0]._attrs;
	contact.dlInfo = {	isMember: response.isMember, 
						isOwner: response.isOwner,
						subscriptionPolicy: attrs.zimbraDistributionListSubscriptionPolicy,
						unsubscriptionPolicy: attrs.zimbraDistributionListUnsubscriptionPolicy,
						description: attrs.description,
						displayName: attrs.displayName,
						notes: attrs.zimbraNotes,
						hideInGal: attrs.zimbraHideInGal};

	this._resetOperations(this._toolbar[this._currentViewId], 0); // now that we got the dlInfo we can know better how to set the "edit" button.
	var callbackFromGettingMembers = this._handleGetDlMembersResponse.bind(this, contact, callback);
	contact.getAllDLMembers(callbackFromGettingMembers);
};


ZmContactListController.prototype._handleGetDlMembersResponse =
function(contact, callback, result) {
	var list = result.list;
	if (!list) {
		contact.dlMembers = [];
		callback();
		return;
	}
	var members = [];
	for (var i = 0; i < list.length; i++) {
		members.push({type: ZmContact.GROUP_INLINE_REF,
						value: list[i],
						address: list[i]});
	}

	contact.dlMembers =	members;
	callback();
};




/**
 * Checks if the search is a GAL search.
 * 
 * @return	{Boolean}	<code>true</code> if GAL search
 */
ZmContactListController.prototype.isGalSearch =
function() {
	return ((this._searchType & ZmContactListController.SEARCH_TYPE_GAL) != 0);
};

/**
 * Returns the split view.
 * 
 * @return	{ZmContactSplitView}	the split view
 */
ZmContactListController.prototype.getCurrentView =
function() {
	return this._parentView[this._currentViewId];
};
ZmContactListController.prototype.getParentView = ZmContactListController.prototype.getCurrentView;

/**
 * Search the alphabet.
 * 
 * @param	{String}	letter		the letter
 * @param	{String}	endLetter	the end letter
 */
ZmContactListController.prototype.searchAlphabet =
function(letter, endLetter) {
	var folderId = this._folderId || ZmFolder.ID_CONTACTS;
	var folder = appCtxt.getById(folderId);
	var query = folder ? folder.createQuery() : null;

	if (query) {
		var params = {
			query: query,
			types: [ZmItem.CONTACT],
			offset: 0,
			limit: (this._listView[this._currentViewId].getLimit()),
			lastId: 0,
			lastSortVal: letter,
			endSortVal: endLetter
		};
		appCtxt.getSearchController().search(params);
	}
};

/**
 * @private
 */
ZmContactListController.prototype._getMoreSearchParams =
function(params) {
	params.endSortVal = this._activeSearch && this._activeSearch.search && this._activeSearch.search.endSortVal; 
};

ZmContactListController.prototype.getKeyMapName =
function() {
	return "ZmContactListController";
};

ZmContactListController.prototype.handleKeyAction =
function(actionCode) {
	DBG.println(AjxDebug.DBG3, "ZmContactListController.handleKeyAction");

	switch (actionCode) {

		case ZmKeyMap.EDIT:
			this._editListener();
			break;

		case ZmKeyMap.PRINT:
			if (appCtxt.get(ZmSetting.PRINT_ENABLED)) {
				this._printListener();
			}
			break;

		case ZmKeyMap.PRINT_ALL:
			if (appCtxt.get(ZmSetting.PRINT_ENABLED)) {
				this._printAddrBookListener();
			}
			break;

		default:
			return ZmListController.prototype.handleKeyAction.call(this, actionCode);
	}
	return true;
};

/**
 * @private
 */
ZmContactListController.prototype.mapSupported =
function(map) {
	return (map == "list");
};


// Private and protected methods


/**
 * @private
 */
ZmContactListController.prototype._getToolBarOps =
function() {
    var toolbarOps =  [];
    toolbarOps.push(ZmOperation.EDIT,
            ZmOperation.SEP,
            ZmOperation.DELETE, ZmOperation.SEP,
			ZmOperation.MOVE_MENU, ZmOperation.TAG_MENU, ZmOperation.SEP,
			ZmOperation.PRINT);
    return toolbarOps;
};

/**
 * @private
 */
ZmContactListController.prototype._getSecondaryToolBarOps =
function() {
	var list = [ZmOperation.SEARCH_MENU];

	if (appCtxt.get(ZmSetting.MAIL_ENABLED)) {
		list.push(ZmOperation.NEW_MESSAGE);
	}

	if (appCtxt.get(ZmSetting.IM_ENABLED)) {
		list.push(ZmOperation.IM);
	}

	list.push(ZmOperation.SEP, ZmOperation.CONTACTGROUP_MENU);
    list.push(ZmOperation.QUICK_COMMANDS);

	return list;
};

/**
 * @private
 */
ZmContactListController.prototype._getActionMenuOps =
function() {
	var list = this._participantOps();
	list.push(ZmOperation.SEP,
				ZmOperation.CONTACTGROUP_MENU,
				ZmOperation.TAG_MENU,
				ZmOperation.DELETE,
				ZmOperation.MOVE,
				ZmOperation.PRINT_CONTACT);
    list.push(ZmOperation.QUICK_COMMANDS);

	return list;
};

ZmContactListController.getDefaultViewType =
function() {
	return ZmId.VIEW_CONTACT_SIMPLE;
};
ZmContactListController.prototype.getDefaultViewType = ZmContactListController.getDefaultViewType;

/**
 * @private
 */
ZmContactListController.prototype._createNewView =
function(view) {
	var params = {parent:this._container, posStyle:Dwt.ABSOLUTE_STYLE,
				  controller:this, dropTgt:this._dropTgt};
	var viewType = this.getCurrentViewType();
	this._parentView[view] = new this._viewFactory[viewType](params);
	var listView = this._parentView[view].getListView();
	if (this._dragSrc) {
		listView.setDragSource(this._dragSrc);
	}

	return listView;
};

/**
 * @private
 */
ZmContactListController.prototype._getTagMenuMsg =
function(num) {
	return AjxMessageFormat.format(ZmMsg.AB_TAG_CONTACTS, num);
};

/**
 * @private
 */
ZmContactListController.prototype._getMoveDialogTitle =
function(num) {
	return AjxMessageFormat.format(ZmMsg.AB_MOVE_CONTACTS, num);
};

/**
 * @private
 */
ZmContactListController.prototype._getMoveParams =
function(dlg) {
	var params = ZmListController.prototype._getMoveParams.apply(this, arguments);
    params.hideNewButton = !appCtxt.get(ZmSetting.NEW_ADDR_BOOK_ENABLED);
    var omit = {};
	var folderTree = appCtxt.getFolderTree();
	if (!folderTree) { return params; }
	var folders = folderTree.getByType(ZmOrganizer.ADDRBOOK);
	for (var i = 0; i < folders.length; i++) {
		var folder = folders[i];
		if (folder.link && folder.isReadOnly()) {
			omit[folder.id] = true;
		}
	}
	params.omit = omit;
	params.description = ZmMsg.targetAddressBook;

	return params;
};

/**
 * @private
 */
ZmContactListController.prototype._getSearchFolderId = 
function() {
	return this._folderId;
};

/**
 * @private
 */
ZmContactListController.prototype._initializeToolBar =
function(view) {
	if (!this._toolbar[view]) {
		ZmListController.prototype._initializeToolBar.call(this, view);
		var tb = this._toolbar[view];
//		this._setupViewMenu(view, true);
		this._setNewButtonProps(view, ZmMsg.newContact, ZmMsg.createNewContact, "NewContact", "NewContactDis", ZmOperation.NEW_CONTACT);
		this._setupPrintMenu(view);
		tb.addFiller();
		this._initializeNavToolBar(view);
		this._setupContactGroupMenu(tb);
		appCtxt.notifyZimlets("initializeToolbar", [this._app, this._toolbar[view], this, view], {waitUntilLoaded:true});
	} else {
//		this._setupViewMenu(view, false);
	}
};

/**
 * @private
 */
ZmContactListController.prototype._initializeNavToolBar =
function(view) {
	this._toolbar[view].addOp(ZmOperation.TEXT);
	var text = this._itemCountText[view] = this._toolbar[view].getButton(ZmOperation.TEXT);
	text.addClassName("itemCountText");
};

/**
 * @private
 */
ZmContactListController.prototype._initializeActionMenu =
function(view) {
	ZmListController.prototype._initializeActionMenu.call(this);

	var mi = this._actionMenu.getItemById(ZmOperation.KEY_ID, ZmOperation.PRINT_CONTACT);
	if (mi) {
		mi.setText(ZmMsg.print);
	}

	ZmOperation.setOperation(this._actionMenu, ZmOperation.CONTACT, ZmOperation.EDIT_CONTACT);
	this._setupContactGroupMenu(this._actionMenu);

};

ZmContactListController.prototype.getSearchFromText =
function() {
	return ZmMsg.findEmailFromContact;
};

ZmContactListController.prototype.getSearchToText =
function() {
	return ZmMsg.findEmailToContact;
};

/**
 * @private
 */
ZmContactListController.prototype._initializeAlphabetBar =
function(view) {
	if (view == this._currentViewId) { return; }

	var pv = this._parentView[this._currentViewId];
	var alphaBar = pv ? pv.getAlphabetBar() : null;
	var current = alphaBar ? alphaBar.getCurrent() : null;
	var idx = current ? current.getAttribute("_idx") : null;
	if (idx) {
		var newAlphaBar = this._parentView[view].getAlphabetBar();
		if (newAlphaBar)
			newAlphaBar.setButtonByIndex(idx);
	}
};

/**
 * Load contacts into the given view and perform layout.
 * 
 * @private
 */
ZmContactListController.prototype._setViewContents =
function(view) {
	DBG.timePt("setting list");
	this._list.removeChangeListener(this._listChangeListener);
	this._list.addChangeListener(this._listChangeListener);
	this._listView[view].set(this._list, null, this._folderId);
	DBG.timePt("done setting list");
};

ZmContactListController.prototype._handleSyncAll =
function() {
	//doesn't do anything now after I removed the appCtxt.get(ZmSetting.GET_MAIL_ACTION) == ZmSetting.GETMAIL_ACTION_DEFAULT preference stuff
};

ZmContactListController.prototype._syncAllListener =
function(view) {
    var callback = new AjxCallback(this, this._handleSyncAll);
    appCtxt.accountList.syncAll(callback);
};

ZmContactListController.prototype.runRefresh =
function() {
	
	if (!appCtxt.isOffline) {
		return;
	}
	//should only happen in ZD

	this._syncAllListener();
};


ZmContactListController.prototype._sendReceiveListener =
function(ev) {
    var account = appCtxt.accountList.getAccount(ev.item.getData(ZmOperation.MENUITEM_ID));
    if (account) {
        account.sync();
    }
};

ZmContactListController.prototype._handleListChange =
function(ev) {
	if (ev.event == ZmEvent.E_MODIFY || ev.event == ZmEvent.E_CREATE) {
		var item = ev && ev._details && ev._details.items && ev._details.items.length && ev._details.items[0];
		if (item instanceof ZmContact && this._currentViewType == ZmId.VIEW_CONTACT_SIMPLE && item.folderId == this._folderId) {
			var alphaBar = this._parentView[this._currentViewId].getAlphabetBar();
			//only set the view if the contact is in the list
			if(!alphaBar || alphaBar.isItemInAlphabetLetter(item)) {
				this._parentView[this._currentViewId].setContact(item, this.isGalSearch());
			}
		}
	}
};

/**
 * Create menu for View button and add listeners.
 * 
 * @private
 */
ZmContactListController.prototype._setupViewMenu =
function(view, firstTime) {
	var btn;

	if (firstTime) {
		btn = this._toolbar[view].getButton(ZmOperation.VIEW_MENU);
		var menu = btn.getMenu();
		if (!menu) {
			menu = new ZmPopupMenu(btn);
			btn.setMenu(menu);
			for (var i = 0; i < ZmContactListController.VIEWS.length; i++) {
				var id = ZmContactListController.VIEWS[i];
				var mi = menu.createMenuItem(id, {image:ZmContactListController.ICON[id],
													text:ZmMsg[ZmContactListController.MSG_KEY[id]],
													style:DwtMenuItem.RADIO_STYLE});
				mi.setData(ZmOperation.MENUITEM_ID, id);
				mi.addSelectionListener(this._listeners[ZmOperation.VIEW]);
				if (id == view)
					mi.setChecked(true, true);
			}
		}
	} else {
		// always set the switched view to be the checked menu item
		btn = this._toolbar[view].getButton(ZmOperation.VIEW_MENU);
		var menu = btn ? btn.getMenu() : null;
		var mi = menu ? menu.getItemById(ZmOperation.MENUITEM_ID, view) : null;
		if (mi) { mi.setChecked(true, true); }
	}

	// always reset the view menu button icon to reflect the current view
	btn.setImage(ZmContactListController.ICON[view]);
};

/**
 * @private
 */
ZmContactListController.prototype._setupPrintMenu =
function(view) {
	var printButton = this._toolbar[view].getButton(ZmOperation.PRINT);
	if (!printButton) { return; }

	printButton.setToolTipContent(ZmMsg.printMultiTooltip);
	printButton.noMenuBar = true;
	var menu = new ZmPopupMenu(printButton);
	printButton.setMenu(menu);

	var id = ZmOperation.PRINT_CONTACT;
	var mi = menu.createMenuItem(id, {image:ZmOperation.getProp(id, "image"), text:ZmMsg[ZmOperation.getProp(id, "textKey")]});
	mi.setData(ZmOperation.MENUITEM_ID, id);
	mi.addSelectionListener(this._listeners[ZmOperation.PRINT_CONTACT]);

	id = ZmOperation.PRINT_ADDRBOOK;
	mi = menu.createMenuItem(id, {image:ZmOperation.getProp(id, "image"), text:ZmMsg[ZmOperation.getProp(id, "textKey")]});
	mi.setData(ZmOperation.MENUITEM_ID, id);
	mi.addSelectionListener(this._listeners[ZmOperation.PRINT_ADDRBOOK]);
};

/**
 * Resets the available options on a toolbar or action menu.
 * 
 * @private
 */
ZmContactListController.prototype._resetOperations =
function(parent, num) {

	ZmBaseController.prototype._resetOperations.call(this, parent, num);

	var printMenuItem;
	if (parent instanceof ZmButtonToolBar) {
		var printButton = parent.getButton(ZmOperation.PRINT);
		var printMenu = printButton && printButton.getMenu();
		if (printMenu) {
			printMenuItem = printMenu.getItem(1);
			printMenuItem.setText(ZmMsg.printResults);
		}
	}

	var printOp = (parent instanceof ZmActionMenu) ? ZmOperation.PRINT_CONTACT : ZmOperation.PRINT;


	var printEnabled = true;
	if (this._folderId  == ZmFolder.ID_DLS ||
			num == 1 && this._listView[this._currentViewId].getSelection()[0].isDistributionList()) {
		printEnabled = false;
	}
	
	parent.enable(printOp, printEnabled);

	if (!this.isGalSearch()) {
		parent.enable([ZmOperation.SEARCH_MENU, ZmOperation.BROWSE, ZmOperation.NEW_MENU, ZmOperation.VIEW_MENU], true);
        appCtxt.notifyZimlets("resetToolbarOperations",[parent, num]);

		// a valid folderId means user clicked on an addrbook
		if (this._folderId) {
			var folder = appCtxt.getById(this._folderId);
			var isShare = folder && folder.link;
			var isInTrash = folder && folder.isInTrash();
			var canEdit = (folder == null || !folder.isReadOnly());

			parent.enable([ZmOperation.CONTACTGROUP_MENU], (num > 0));
			parent.enable([ZmOperation.TAG_MENU], (!isShare && num > 0));
			parent.enable([ZmOperation.DELETE, ZmOperation.MOVE, ZmOperation.MOVE_MENU], canEdit && num > 0);
			parent.enable([ZmOperation.EDIT, ZmOperation.CONTACT], canEdit && num == 1 && !isInTrash);


			if (printMenuItem) {
				var text = isShare ? ZmMsg.printResults : ZmMsg.printAddrBook;
				printMenuItem.setText(text);
			}
		} else {
			// otherwise, must be a search
			var contact = this._listView[this._currentViewId].getSelection()[0];
			var canEdit = (num == 1 && !contact.isReadOnly() && !ZmContact.isInTrash(contact));
			parent.enable([ZmOperation.DELETE, ZmOperation.MOVE, ZmOperation.MOVE_MENU, ZmOperation.TAG_MENU], num > 0);
			parent.enable([ZmOperation.EDIT, ZmOperation.CONTACT], canEdit);
			parent.enable([ZmOperation.CONTACTGROUP_MENU], (num > 0));
		}
	} else {
		// gal contacts cannot be tagged/moved/deleted
		parent.enableAll(false);
		parent.enable([ZmOperation.CONTACTGROUP_MENU], (num > 0));
		parent.enable([ZmOperation.SEARCH_MENU, ZmOperation.BROWSE, ZmOperation.NEW_MENU, ZmOperation.VIEW_MENU], true);
		parent.enable(ZmOperation.NEW_MESSAGE, num > 0);
		parent.enable(ZmOperation.CONTACT, num == 1);
		var contact = this._listView[this._currentViewId].getSelection()[0];
		var isDL = contact && contact.isDistributionList();
		var isOwner = isDL && contact.dlInfo && contact.dlInfo.isOwner;
		parent.enable([ZmOperation.EDIT], isOwner);
	};

    this._resetQuickCommandOperations(parent);

	var selection = this._listView[this._currentViewId].getSelection();
	var contact = (selection.length == 1) ? selection[0] : null;
	parent.enable([ZmOperation.SEARCH_MENU, ZmOperation.BROWSE], num == 1);

	if (num == 1 && contact.isGroup()) {
		parent.enable([ZmOperation.SEARCH_MENU, ZmOperation.BROWSE], false);
		if (parent instanceof ZmPopupMenu) {
			ZmOperation.setOperation(parent, ZmOperation.CONTACT, ZmOperation.EDIT_CONTACT, ZmMsg.AB_EDIT_GROUP);
		}
	}
	else {
		if (parent instanceof ZmPopupMenu) {
			this._setContactText(!this.isGalSearch());
			if (appCtxt.get(ZmSetting.IM_ENABLED)) {
				var imItem = parent.getOp(ZmOperation.IM);
				ZmImApp.updateImMenuItemByContact(imItem, contact);
			}
		}
	}
	if (parent instanceof ZmPopupMenu) {
		parent.getMenuItem(ZmOperation.TAG_MENU).setText(contact && contact.isGroup() ? ZmMsg.AB_TAG_GROUP : ZmMsg.AB_TAG_CONTACT);
	}
	this._setContactGroupMenu(parent);


};


// List listeners


/**
 * @private
 * return the contact for which to do the action
 * @param {Boolean} isToolbar - true if the action is from the toolbar.  false/null if it's from right-click action
 */
ZmContactListController.prototype._getActionContact = function(isToolbar) {

	/*
	if you read this and don't understand why I don't do the same as in _participantComposeListener. It's because
	in DwtListView.prototype.getSelection, the _rightSelItem is not set for a submenu, so the right clicked item is not the selection returned.
	This approach of specifically specifying if it's from the toolbar (isToolbar) is more explicit, less fragile and works.
	 */
	if (isToolbar) {
		var selection = this._listView[this._currentViewId].getSelection();
		if (selection.length != 1) {
			return null;
		}
		return selection[0];
	}
	if (this._actionEv) {
		return this._actionEv.contact;
	}
};


/**
 * From Search based on email address
 *
 * @private
 */
ZmContactListController.prototype._participantSearchListener = function(isToolbar, ev) {

	var contact = this._getActionContact(isToolbar);
	if (!contact) {
		return;
	}

	var addresses = contact.getEmails();
	appCtxt.getSearchController().fromSearch(addresses);
};

/**
 * To Search based on email address.
 *
 * @private
 */
ZmContactListController.prototype._participantSearchToListener =
function(isToolbar, ev) {
	var contact = this._getActionContact(isToolbar);
	if (!contact) {
		return;
	}

	var addresses = contact.getEmails();
	appCtxt.getSearchController().toSearch(addresses);
};

/**
 * Double click displays a contact.
 * 
 * @private
 */
ZmContactListController.prototype._listSelectionListener =
function(ev) {
	Dwt.setLoadingTime("ZmContactItem", new Date());
	ZmListController.prototype._listSelectionListener.call(this, ev);

	if (ev.detail == DwtListView.ITEM_SELECTED)	{
		this._resetNavToolBarButtons();
		if (this._currentViewType == ZmId.VIEW_CONTACT_SIMPLE) {
			this._parentView[this._currentViewId].setContact(ev.item, this.isGalSearch());
		}
	} else if (ev.detail == DwtListView.ITEM_DBL_CLICKED) {
		var folder = appCtxt.getById(ev.item.folderId);
		if (!this.isGalSearch() && (!folder || (!folder.isReadOnly() && !folder.isInTrash()))) {
			AjxDispatcher.run("GetContactController").show(ev.item);
		}
	}
};

/**
 * @private
 */
ZmContactListController.prototype._newListener =
function(ev, op, params) {
	if (!ev && !op) { return; }
	op = op || ev.item.getData(ZmOperation.KEY_ID);
	if (op == ZmOperation.NEW_MESSAGE) {
		this._participantComposeListener(ev);
	}else{
        ZmListController.prototype._newListener.call(this, ev, op, params);
    }
};

/**
 * Compose message to participant.
 * 
 * @private
 */
ZmContactListController.prototype._participantComposeListener =
function(ev) {

    var selection = this._listView[this._currentViewId].getSelection();
    if (selection.length == 0 && this._actionEv) {
        selection.push(this._actionEv.contact);
    }
    var emailStr = '', contact, email;
    for (var i = 0; i < selection.length; i++){
        contact = selection[i];
		if (contact.isGroup()) {
			var members = contact.getGroupMembers().good;
			if (members.size()) {
				emailStr += members.toString(AjxEmailAddress.SEPARATOR) + AjxEmailAddress.SEPARATOR;
			}
		}
		else {
			var addr = new AjxEmailAddress(contact.getEmail(), AjxEmailAddress.TO, contact.getFullName());
			emailStr += addr.toString() + AjxEmailAddress.SEPARATOR;
		}
    }

	AjxDispatcher.run("Compose", {action: ZmOperation.NEW_MESSAGE, inNewWindow: this._app._inNewWindow(ev),
								  toOverride: emailStr});
};

/**
 * Get info on selected contact to provide context for action menu.
 * 
 * @private
 */
ZmContactListController.prototype._listActionListener =
function(ev) {
	ZmListController.prototype._listActionListener.call(this, ev);
	this._actionEv.contact = ev.item;
	var actionMenu = this.getActionMenu();
	actionMenu.popup(0, ev.docX, ev.docY);
	if (ev.ersatz) {
		// menu popped up via keyboard nav
		actionMenu.setSelectedItem(0);
	}
};

/**
 * @private
 */
ZmContactListController.prototype._dropListener =
function(ev) {
	var view = this._listView[this._currentViewId];
	var item = view.getTargetItem(ev);

	// only tags can be dropped on us
	if (ev.action == DwtDropEvent.DRAG_ENTER) {
		if (item && (item.type == ZmItem.CONTACT) && (item.isGal || item.isShared())) {
			ev.doIt = false; // can't tag a GAL or shared contact
			view.dragSelect(div);
			return;
		}
	}
	ZmListController.prototype._dropListener.call(this, ev);
};

/**
 * @private
 */
ZmContactListController.prototype._editListener =
function(ev) {
	var contact = this._listView[this._currentViewId].getSelection()[0];
	AjxDispatcher.run("GetContactController").show(contact, false);
};

/**
 * @private
 */
ZmContactListController.prototype._printListener =
function(ev) {
	var contacts = this._listView[this._currentViewId].getSelection();
	var ids = [];
	for (var i = 0; i < contacts.length; i++) {
		ids.push(contacts[i].id);
	}
	var url = "/h/printcontacts?id=" + ids.join(",");
	if (this.isGalSearch()) {
		url = "/h/printcontacts?id=" + ids.join("&id=");
		url = url + "&st=gal";
		var query = this._currentSearch && this._currentSearch.query;
		if (query && contacts.length > 1)
			url += "&sq="+query;
        else if(contacts.length==1)
            url += "&sq=" + contacts[0].getFileAs();
	}
	if (appCtxt.isOffline) {
		var folderId = this._folderId || ZmFolder.ID_CONTACTS;
		var acctName = appCtxt.getById(folderId).getAccount().name;
		url += "&acct=" + acctName ;
	}
	window.open(appContextPath+url, "_blank");
};

/**
 * @private
 */
ZmContactListController.prototype._printAddrBookListener =
function(ev) {
	var url;
	if (this._folderId && !this._list._isShared) {
		url = "/h/printcontacts?sfi=" + this._folderId;
	} else {
		var contacts = ((this._searchType & ZmContactListController.SEARCH_TYPE_ANYWHERE) != 0)
			? AjxDispatcher.run("GetContacts")
			: this._list;

		var ids = [];
		var list = contacts.getArray();
		for (var i = 0; i < list.length; i++) {
			ids.push(list[i].id);
		}
		// XXX: won't this run into GET limits for large addrbooks? would be better to have
		// URL that prints all contacts (maybe "id=all")
		url = "/h/printcontacts";
		if (this.isGalSearch()) {
			url += "?id=" + ids.join("&id=");
		} else {
			url += "?id=" + ids.join(",");
		}
	}
	if (this.isGalSearch()) {
		url = url + "&st=gal";
		var query = this._currentSearch && this._currentSearch.query;
		if (query && list && list.length > 1)
			url += "&sq="+query;
        else if (list && list.length == 1)
            url += "&sq="+list[0].getFileAs();
	}
	if (appCtxt.isOffline) {
		var folderId = this._folderId || ZmFolder.ID_CONTACTS;
		var acctName = appCtxt.getById(folderId).getAccount().name;
		url += "&acct=" + acctName ;
	}
	window.open(appContextPath+url, "_blank");
};


// Callbacks

/**
 * @private
 */
ZmContactListController.prototype._preShowCallback =
function(view) {
	if ((this._searchType & ZmContactListController.SEARCH_TYPE_NEW) != 0) {
		this._searchType &= ~ZmContactListController.SEARCH_TYPE_NEW;
	} else {
		this._resetNavToolBarButtons(view);
	}

	return true;
};

/**
 * @private
 */
ZmContactListController.prototype._doMove =
function(items, folder, attrs, isShiftKey) {

	items = AjxUtil.toArray(items);

	var move = [];
	var copy = [];
	var moveFromGal = [];
	for (var i = 0; i < items.length; i++) {
		var item = items[i];
		if (item.isGal) {
			moveFromGal.push(item);
		} else if (!item.folderId || item.folderId != folder.id) {
			if (!this._isItemMovable(item, isShiftKey, folder)) {
				copy.push(item);
			} else {
				move.push(item);
			}
		}
	}

	var moveOutFolder = appCtxt.getById(this.getFolderId());
	var outOfTrash = (moveOutFolder && moveOutFolder.isInTrash() && !folder.isInTrash());

    var allDoneCallback = this._getAllDoneCallback();
	if (move.length) {
        var params = {items:move, folder:folder, attrs:attrs, outOfTrash:outOfTrash};
		var list = params.list = this._getList(params.items);
        this._setupContinuation(this._doMove, [folder, attrs, isShiftKey], params, allDoneCallback);
        list = outOfTrash ? this._list : list;
		list.moveItems(params);
	}

	if (copy.length) {
        var params = {items:copy, folder:folder, attrs:attrs};
		var list = params.list = this._getList(params.items);
        this._setupContinuation(this._doMove, [folder, attrs, isShiftKey], params, allDoneCallback);
        list = outOfTrash ? this._list : list;
		list.copyItems(params);
	}

	if (moveFromGal.length) {
		var batchCmd = new ZmBatchCommand(true, null, true);
		for (var j = 0; j < moveFromGal.length; j++) {
			var contact = moveFromGal[j];
			contact.attr[ZmContact.F_folderId] = folder.id;
			batchCmd.add(new AjxCallback(contact, contact.create, [contact.attr]));
		}
		batchCmd.run(new AjxCallback(this, this._handleMoveFromGal));
	}
};

/**
 * @private
 */
ZmContactListController.prototype._handleMoveFromGal =
function(result) {
	var resp = result.getResponse().BatchResponse.CreateContactResponse;
	if (resp != null && resp.length > 0) {
		var msg = AjxMessageFormat.format(ZmMsg.itemCopied, resp.length);
		appCtxt.getAppController().setStatusMsg(msg);
	}
};

/**
 * @private
 */
ZmContactListController.prototype._doDelete =
function(items, hardDelete, attrs) {
	ZmListController.prototype._doDelete.call(this, items, hardDelete, attrs);
	for (var i=0; i<items.length; i++) {
		appCtxt.getApp(ZmApp.CONTACTS).updateIdHash(items[i], true);
	}
	// if more contacts to show,
	var size = this._listView[this._currentViewId].getSelectedItems().size();
	if (size == 0) {
		// and if in split view allow split view to clear
		if (this._currentViewType == ZmId.VIEW_CONTACT_SIMPLE)
			this._listView[this._currentViewId].parent.clear();

		this._resetOperations(this._toolbar[this._currentViewId], 0);
	}
};

/**
 * @private
 */
ZmContactListController.prototype._moveListener =
function(ev) {
	ZmListController.prototype._moveListener.call(this, ev);
};

/**
 * @private
 */
ZmContactListController.prototype._checkReplenish =
function() {
	// reset the listview
	var lv = this._listView[this._currentViewId];
	lv.set(this._list);
	lv._setNextSelection();
};


ZmContactListController.prototype._getContactGroupMenu =
function(parent) {
	var menu = parent instanceof ZmButtonToolBar ? parent.getActionsMenu() : parent;
	return menu.getContactGroupMenu();
};


ZmContactListController.prototype._setContactGroupMenu =
function(parent) {
	if (!parent) { return; }

	var groupMenu = this._getContactGroupMenu(parent);
	if (!groupMenu) {
		return;
	}
	var items = this.getItems();
	items = AjxUtil.toArray(items);
	var contacts = this._getContactsFromCache();
	var contactGroups = this._filterGroups(contacts);
	var sortedGroups = this._sortContactGroups(contactGroups);
	groupMenu.set(items, sortedGroups);
};

ZmContactListController.prototype._setupContactGroupMenu =
function(parent) {
	if (!parent) return;
	var groupMenu = this._getContactGroupMenu(parent);
	if (groupMenu) {
		groupMenu.addSelectionListener(this._listeners[ZmOperation.NEW_GROUP]);
	}
};

/**
 * handles updating the group item data
 * @param ev
 */
ZmContactListController.prototype._contactListChange =
function(ev) {
	if (ev && ev.source && ev.type == ZmId.ITEM_CONTACT) {
			var item = ev.source;
			var id = DwtId.WIDGET_ITEM + "__" + this._currentViewId + "__" + ev.source.id;
			var view = this._listView[this._currentViewId];
			view._setItemData(null, "item", item, id);
	}


};

ZmContactListController.prototype._groupListener =
function(ev, items) {

	if (this.isCurrent()) {
		var groupEvent = ev.getData(ZmContactGroupMenu.KEY_GROUP_EVENT);
		var groupAdded = ev.getData(ZmContactGroupMenu.KEY_GROUP_ADDED);
		items = items || this.getItems();
		if (groupEvent == ZmEvent.E_MODIFY) {
			var mods = {};
			var groupId = ev.getData(Dwt.KEY_OBJECT).id;
			var group = appCtxt.getApp(ZmApp.CONTACTS).getContactList().getById(groupId);
			if (group) {
				group.addChangeListener(this._contactListChange.bind(this), 0);//update the group data
				var modifiedGroups = this._getGroupMembers(items, group);
				if (modifiedGroups) {
					mods[ZmContact.F_groups] = modifiedGroups;
				}
				this._doModify(group, mods);
				this._menuPopdownActionListener();
				var idx = this._list.getIndexById(group.id);
				if (idx != null) {
					this._resetSelection(idx);
				}
			}
		}
		else if (groupEvent == ZmEvent.E_CREATE) {
			this._pendingActionData = items;
			var newContactGroupDialog = appCtxt.getNewContactGroupDialog();
			if (!this._newContactGroupCb) {
				this._newContactGroupCb = new AjxCallback(this, this._newContactGroupCallback);
			}
			ZmController.showDialog(newContactGroupDialog, this._newContactGroupCb);
			newContactGroupDialog.registerCallback(DwtDialog.CANCEL_BUTTON, this._clearDialog, this, newContactGroupDialog);
		}
	}
};

ZmContactListController.prototype._newContactGroupCallback =
function(params) {
	var groupName = params.name;
	appCtxt.getNewContactGroupDialog().popdown();
	var items = this.getItems();
	var mods = {};
	mods[ZmContact.F_groups] = this._getGroupMembers(items);
	mods[ZmContact.F_folderId] = this._folderId;
	mods[ZmContact.F_fileAs] = ZmContact.computeCustomFileAs(groupName);
	mods[ZmContact.F_nickname] = groupName;
	mods[ZmContact.F_type] = "group";
	this._doCreate(this._list, mods);
	this._pendingActionData = null;
	this._menuPopdownActionListener();
};

//methods for dealing with contact groups
ZmContactListController.prototype._getGroupMembers =
function(items, group) {
	var mods = {};
	var newMembers = {};
	var groupId = [];
	var memberType;
	var obj = {};
	var id, contact;
	
	for (var i=0; i<items.length; i++) {
		if (!items[i].isGroup()) {
			obj = this._createContactRefObj(items[i], group);
			if (obj.value) {
				newMembers[obj.value] = obj;
			}		
		}
		else {
			var groups = items[i].attr[ZmContact.F_groups];  //getAttr only returns first value in array
			if (!groups) {
				obj = this._createContactRefObj(items[i], group);
				if (obj.value) {
					newMembers[obj.value] = obj;
				}
			}
			else {
				for (var j=0; j <groups.length; j++) {
					id = groups[j].value;
					contact = ZmContact.getContactFromCache(id);
					if (contact) {
						memberType = contact.isGal ? ZmContact.GROUP_GAL_REF : ZmContact.GROUP_CONTACT_REF;
						obj = {value : contact.isGal ? contact.ref : id, type : memberType};
						if (group) {
							obj.op = "+";
						} 
						newMembers[id] = obj;
					}
					else if (groups[j].type == ZmContact.GROUP_INLINE_REF) {
						obj = {value: groups[j].value, type : ZmContact.GROUP_INLINE_REF};
						if (group) {
							obj.op = "+";
						}
						newMembers[id] = obj;				
					}
				}
			}
		}
	}
	var newMembersArr = [];
	for (var id in newMembers) {
		newMembersArr.push(newMembers[id]);
	}
	if (group) {
		//handle potential duplicates
		var groupArr = group.attr[ZmContact.F_groups];
		var noDups = [];
		var found = false;
		for (var i=0; i<newMembersArr.length; i++) {
			found = false;
			for (var j=0; j<groupArr.length && !found; j++) {				
				if (newMembersArr[i].value == groupArr[j].value) {
					found = true;	
				}
			}
			if (!found) {
				noDups.push(newMembersArr[i]);
			}
		}
		return noDups;
	}
	else {
		return newMembersArr;
	}
};

ZmContactListController.prototype._createContactRefObj = 
function(contactToAdd, group) {
	var obj = {};
	var memberType = contactToAdd.isGal ? ZmContact.GROUP_GAL_REF : ZmContact.GROUP_CONTACT_REF;
	var id = memberType == ZmContact.GROUP_CONTACT_REF ? contactToAdd.getId(true) : contactToAdd.ref;
	if (id) {
		var obj = {value: id, type: memberType};
		if (group) {
			obj.op = "+"; //modifying group with new member	
		}
	}
	return obj;
	
};

ZmContactListController.prototype._getContactsFromCache =
function() {
	var contactList = appCtxt.getApp(ZmApp.CONTACTS).getContactList();
	if (contactList){
		return contactList.getIdHash();
	}
	return {};
};

ZmContactListController.prototype._sortContactGroups =
function(contactGroups) {
	var sortByNickname = function(a, b) {
		var aNickname = ZmContact.getAttr(a, "nickname");
		var bNickname = ZmContact.getAttr(b, "nickname");

		if (!aNickname || !bNickname) {
			return 0;
		}

		if (aNickname.toLowerCase() > bNickname.toLowerCase())
			return 1;
		if (aNickname.toLowerCase() < bNickname.toLowerCase())
			return -1;

		return 0;
	};

	return contactGroups.sort(sortByNickname);
};

ZmContactListController.prototype._filterGroups =
function(contacts) {
	var groups = [];
	for (var id in contacts) {
		var typeAttr = ZmContact.getAttr(contacts[id], "type");
		if (typeAttr && typeAttr.toUpperCase() == ZmItem.GROUP.toUpperCase()) {
			groups.push(contacts[id]);
		}
	}
	return groups;
};
