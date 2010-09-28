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
 * @param {DwtControl}		container	the containing shell
 * @param {ZmApp}		app		the containing application
 * 
 * @extends	ZmListController
 */
ZmContactListController = function(container, contactsApp) {

	if (arguments.length == 0) { return; }
	ZmListController.call(this, container, contactsApp);

	this._viewFactory = {};
	this._viewFactory[ZmId.VIEW_CONTACT_CARDS] = ZmContactCardsView;
	this._viewFactory[ZmId.VIEW_CONTACT_SIMPLE] = ZmContactSplitView;

	this._dragSrc = new DwtDragSource(Dwt.DND_DROP_MOVE);
	this._dragSrc.addDragListener(new AjxListener(this, this._dragListener));

	this._listChangeListener = new AjxListener(this, this._handleListChange);

	this._listeners[ZmOperation.EDIT] = new AjxListener(this, this._editListener);
	this._listeners[ZmOperation.PRINT] = null; // override base class to do nothing
	this._listeners[ZmOperation.PRINT_CONTACT] = new AjxListener(this, this._printContactListener);
	this._listeners[ZmOperation.PRINT_ADDRBOOK] = new AjxListener(this, this._printAddrBookListener);
    this._listeners[ZmOperation.CHECK_MAIL] = new AjxListener(this, this._syncAllListener);

	this._parentView = {};
};

ZmContactListController.prototype = new ZmListController;
ZmContactListController.prototype.constructor = ZmContactListController;

ZmContactListController.ICON = {};
ZmContactListController.ICON[ZmId.VIEW_CONTACT_SIMPLE]		= "ListView";
ZmContactListController.ICON[ZmId.VIEW_CONTACT_CARDS]		= "CardsView";

ZmContactListController.MSG_KEY = {};
ZmContactListController.MSG_KEY[ZmId.VIEW_CONTACT_SIMPLE]	= "contactList";
ZmContactListController.MSG_KEY[ZmId.VIEW_CONTACT_CARDS]	= "detailedCards";

ZmContactListController.SEARCH_TYPE_CANONICAL	= 1 << 0;
ZmContactListController.SEARCH_TYPE_GAL			= 1 << 1;
ZmContactListController.SEARCH_TYPE_NEW			= 1 << 2;
ZmContactListController.SEARCH_TYPE_ANYWHERE	= 1 << 3;

ZmContactListController.VIEWS = [ZmId.VIEW_CONTACT_SIMPLE, ZmId.VIEW_CONTACT_CARDS];

/**
 * Returns a string representation of the object.
 * 
 * @return		{String}		a string representation of the object
 */
ZmContactListController.prototype.toString =
function() {
	return "ZmContactListController";
};

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
	
	if (searchResult instanceof ZmContactList) {
		this._list = searchResult;			// set as canonical list of contacts
		this._list._isShared = false;		// this list is not a search of shared items
		if (!this._currentView) {
			this._currentView = this._defaultView();
		}
		selectedContacts = this._listView[this._currentView] && this._listView[this._currentView].getSelection();
		this._contactSearchResults = false;
    } else if (searchResult instanceof ZmSearchResult) {
		this._searchType |= ZmContactListController.SEARCH_TYPE_NEW;
		this._list = searchResult.getResults(ZmItem.CONTACT);

		// HACK - find out if user did a "is:anywhere" search (for printing)
		if (searchResult.search && searchResult.search.isAnywhere) {
			this._searchType |= ZmContactListController.SEARCH_TYPE_ANYWHERE;
		}

		if (searchResult.search && searchResult.search.userText && this.getParentView()) {
			this.getParentView().getAlphabetBar().reset();
		}

		if (isGalSearch) {
			if (this._list == null) {
				this._list = new ZmContactList(searchResult.search, true);
			}
			this._list._isShared = false;
			this._list.isGalPagingSupported = AjxUtil.isSpecified(searchResult.getAttribute("offset"));
		} else {
			// find out if we just searched for a shared address book
			var addrbook = folderId ? appCtxt.getById(folderId) : null;
			this._list._isShared = addrbook ? addrbook.link : false;
		}

		this._list.setHasMore(searchResult.getAttribute("more"));

		selectedContacts = this._listView[this._currentView] && this._listView[this._currentView].getSelection();
		ZmListController.prototype.show.apply(this, [searchResult, this._currentView]);
		this._contactSearchResults = true;
	}

	// reset offset if list view has been created
	var view = this._currentView;
	if (this._listView[view]) {
		this._listView[view].offset = 0;
	}
	this.switchView(view, true);

	if (selectedContacts && selectedContacts.length && this._listView[view]) {
		this._listView[view].setSelection(selectedContacts[0]);
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
	if (view && ((view != this._currentView) || force)) {
		this._currentView = view;
		DBG.timePt("setting up view", true);
		this._setup(view);
		DBG.timePt("done setting up view");

		var elements = {};
		elements[ZmAppViewMgr.C_TOOLBAR_TOP] = this._toolbar[view];
		elements[ZmAppViewMgr.C_APP_CONTENT] = this._parentView[view];

		// call initialize before _setView since we havent set the new view yet
		if (!initialized) {
			this._initializeAlphabetBar(view);
		}

		this._setView({view:view, elements:elements, isAppView:true, stageView:stageView});
		this._resetNavToolBarButtons(view);

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
 * Gets the parent view.
 * 
 * @return	{DwtComposite}	the view
 */
ZmContactListController.prototype.getParentView =
function() {
	return this._parentView[this._currentView];
};

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
			limit: (this._listView[this._currentView].getLimit()),
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
				this._printContactListener();
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
    var toolbarOps =  [ZmOperation.NEW_MENU, ZmOperation.SEP];
    if(appCtxt.isOffline) {
        /* Add a send/recieve button *only* for ZD */
        toolbarOps.push(ZmOperation.CHECK_MAIL, ZmOperation.SEP);
    }
    toolbarOps.push(ZmOperation.EDIT,
            ZmOperation.SEP,
            ZmOperation.DELETE, ZmOperation.MOVE, ZmOperation.PRINT,
            ZmOperation.SEP,
            ZmOperation.TAG_MENU);
    return toolbarOps;
};

/**
 * @private
 */
ZmContactListController.prototype._getActionMenuOps =
function() {
	var list = this._participantOps();
	list.push(ZmOperation.SEP,
				ZmOperation.TAG_MENU,
				ZmOperation.DELETE,
				ZmOperation.MOVE,
				ZmOperation.PRINT_CONTACT);
	return list;
};

/**
 * @private
 */
ZmContactListController.prototype._getViewType =
function() {
	return this._currentView;
};

/**
 * @private
 */
ZmContactListController.prototype._defaultView =
function() {
	return (appCtxt.get(ZmSetting.CONTACTS_VIEW) == "cards")
		? ZmId.VIEW_CONTACT_CARDS
		: ZmId.VIEW_CONTACT_SIMPLE;
};

/**
 * @private
 */
ZmContactListController.prototype._createNewView =
function(view) {
	var params = {parent:this._container, posStyle:Dwt.ABSOLUTE_STYLE,
				  controller:this, dropTgt:this._dropTgt};
	this._parentView[view] = new this._viewFactory[view](params);
	var listView = this._parentView[view].getListView();
	listView.setDragSource(this._dragSrc);

	return listView;
};

/**
 * @private
 */
ZmContactListController.prototype._getTagMenuMsg =
function(num) {
	return (num == 1) ? ZmMsg.AB_TAG_CONTACT : ZmMsg.AB_TAG_CONTACTS;
};

/**
 * @private
 */
ZmContactListController.prototype._getMoveDialogTitle =
function(num) {
	return (num == 1) ? ZmMsg.AB_MOVE_CONTACT : ZmMsg.AB_MOVE_CONTACTS;
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
//		this._setupViewMenu(view, true);
		this._setNewButtonProps(view, ZmMsg.createNewContact, "NewContact", "NewContactDis", ZmOperation.NEW_CONTACT);
        if(appCtxt.isOffline) {
            this._setupSendRecieveButton(view);
            if (appCtxt.accountList.size() > 2) {
                this._setupSendReceiveMenu(view);
            }
        }
		this._setupPrintMenu(view);
		this._toolbar[view].addFiller();
		this._initializeNavToolBar(view);
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
};

/**
 * @private
 */
ZmContactListController.prototype._initializeAlphabetBar =
function(view) {
	if (view == this._currentView) { return; }

	var pv = this._parentView[this._currentView];
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

/**
 *  Create a Send/Recieve Button and add listeners
 *  *only* for ZD
 *  @private
 */
ZmContactListController.prototype._setupSendRecieveButton =
function(view) {
    var checkMailBtn = this._toolbar[view].getButton(ZmOperation.CHECK_MAIL);
    var checkMailMsg = appCtxt.isOffline ? ZmMsg.sendReceive : ZmMsg.checkMail;
    checkMailBtn.setText(checkMailMsg);

    var tooltip;
    if (appCtxt.isOffline) {
        tooltip = ZmMsg.sendReceive;
    } else {
        tooltip = (appCtxt.get(ZmSetting.GET_MAIL_ACTION) == ZmSetting.GETMAIL_ACTION_DEFAULT)
                ? ZmMsg.checkMailPrefDefault : ZmMsg.checkMailPrefUpdate;
    }
    checkMailBtn.setToolTipContent(tooltip);
};

ZmContactListController.prototype._handleSyncAll =
function() {
    if (appCtxt.get(ZmSetting.OFFLINE_SHOW_ALL_MAILBOXES) &&
        appCtxt.get(ZmSetting.GET_MAIL_ACTION) == ZmSetting.GETMAIL_ACTION_DEFAULT)
    {
        this._app.getOverviewContainer().highlightAllMboxes();
    }
};

ZmContactListController.prototype._syncAllListener =
function(view) {
    var callback = new AjxCallback(this, this._handleSyncAll);
    appCtxt.accountList.syncAll(callback);
};

/**
 *  Create menu for Send/Recieve button and add listeners
 *  *only* for ZD
 *  @private
 */

ZmContactListController.prototype._setupSendReceiveMenu =
function(view) {
    var btn = this._toolbar[view].getButton(ZmOperation.CHECK_MAIL);
    if (!btn) { return; }
    btn.setMenu(new AjxCallback(this, this._setupSendReceiveMenuItems, [this._toolbar, btn]));
};

ZmContactListController.prototype._setupSendReceiveMenuItems =
function(toolbar, btn) {
    var menu = new ZmPopupMenu(btn, null, null, this);
    btn.setMenu(menu);

    var listener = new AjxListener(this, this._sendReceiveListener);
    var list = appCtxt.accountList.visibleAccounts;
    for (var i = 0; i < list.length; i++) {
        var acct = list[i];
        if (acct.isMain) { continue; }

        var id = [ZmOperation.CHECK_MAIL, acct.id].join("-");
        var mi = menu.createMenuItem(id, {image:acct.getIcon(), text:acct.getDisplayName()});
        mi.setData(ZmOperation.MENUITEM_ID, acct.id);
        mi.addSelectionListener(listener);
    }

    return menu;
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
		if (item instanceof ZmContact && this._currentView == ZmId.VIEW_CONTACT_SIMPLE) {
			this._parentView[this._currentView].setContact(item, this.isGalSearch());
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

	if (!this.isGalSearch()) {
		parent.enable([ZmOperation.SEARCH, ZmOperation.BROWSE, ZmOperation.NEW_MENU, ZmOperation.VIEW_MENU], true);
		parent.enable(printOp, num > 0);

		// a valid folderId means user clicked on an addrbook
		if (this._folderId) {
			var folder = appCtxt.getById(this._folderId);
			var isShare = folder && folder.link;
			var isInTrash = folder && folder.isInTrash();
			var canEdit = (folder == null || !folder.isReadOnly());

			parent.enable([ZmOperation.TAG_MENU], (!isShare && num > 0));
			parent.enable([ZmOperation.DELETE, ZmOperation.MOVE], canEdit && num > 0);
			parent.enable([ZmOperation.EDIT, ZmOperation.CONTACT], canEdit && num == 1 && !isInTrash);

			if (printMenuItem) {
				var text = isShare ? ZmMsg.printResults : ZmMsg.printAddrBook;
				printMenuItem.setText(text);
			}
		} else {
			// otherwise, must be a search
			var contact = this._listView[this._currentView].getSelection()[0];
			var canEdit = (num == 1 && !contact.isReadOnly() && !ZmContact.isInTrash(contact));
			parent.enable([ZmOperation.DELETE, ZmOperation.MOVE, ZmOperation.TAG_MENU], num > 0);
			parent.enable([ZmOperation.EDIT, ZmOperation.CONTACT], canEdit);
		}
	} else {
		// gal contacts cannot be tagged/moved/deleted
		parent.enableAll(false);
		parent.enable([ZmOperation.SEARCH, ZmOperation.BROWSE, ZmOperation.NEW_MENU, ZmOperation.VIEW_MENU], true);
		parent.enable([ZmOperation.NEW_MESSAGE, printOp], num > 0);
		parent.enable(ZmOperation.CONTACT, num == 1);
	}
};


// List listeners

/**
 * @private
 */
ZmContactListController.prototype._participantSearchListener = function(ev) {
	var addresses = this._actionEv.contact.getEmails();
	appCtxt.getSearchController().fromSearch(addresses);
};

/**
 * Double click displays a contact.
 * 
 * @private
 */
ZmContactListController.prototype._listSelectionListener =
function(ev) {
	ZmListController.prototype._listSelectionListener.call(this, ev);

	if (ev.detail == DwtListView.ITEM_SELECTED)	{
		this._resetNavToolBarButtons(this._currentView);
		if (this._currentView == ZmId.VIEW_CONTACT_SIMPLE) {
			this._parentView[this._currentView].setContact(ev.item, this.isGalSearch());
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

    var selection = this._listView[this._currentView].getSelection();
    if (selection.length == 0 && this._actionEv) {
        selection.push(this._actionEv.contact);
    }
    var name = '', contact, email;
    for(var i=0; i<selection.length; i++){
        contact = selection[i];
        email   = contact.isGroup() ? contact.getGroupMembers().good : contact.getEmail();
        if(email){
            email   = contact.isGroup() ? email : new AjxEmailAddress(email);
            email   = email.toString(AjxEmailAddress.SEPARATOR) + AjxEmailAddress.SEPARATOR;
            name   += email;
        }
    }

	AjxDispatcher.run("Compose", {action: ZmOperation.NEW_MESSAGE, inNewWindow: this._app._inNewWindow(ev),
								  toOverride: name});
};

/**
 * Get info on selected contact to provide context for action menu.
 * 
 * @private
 */
ZmContactListController.prototype._listActionListener =
function(ev) {
	ZmListController.prototype._listActionListener.call(this, ev);
	var contact = this._actionEv.contact = ev.item;
	var email = contact.isGroup()
		? contact.getGroupMembers().good : contact.getEmail();
	this._actionEv.address = contact.isGroup()
		? email : new AjxEmailAddress(email);
	// enable/disable New Email menu item per valid email found for this contact
	var enableNewEmail = email != null && this._listView[this._currentView].getSelectionCount() == 1;
	var actionMenu = this.getActionMenu();
	actionMenu.enable([ZmOperation.SEARCH, ZmOperation.BROWSE], enableNewEmail);

	if (contact.isGroup()) {
		actionMenu.enable([ZmOperation.SEARCH, ZmOperation.BROWSE], false);
		ZmOperation.setOperation(actionMenu, ZmOperation.CONTACT, ZmOperation.EDIT_CONTACT, ZmMsg.AB_EDIT_GROUP);
	} else {
		this._setContactText(!this.isGalSearch());
		if (appCtxt.get(ZmSetting.IM_ENABLED)) {
			var imItem = actionMenu.getOp(ZmOperation.IM);
			ZmImApp.updateImMenuItemByContact(imItem, contact);
		}
	}
	ZmOperation.setOperation(actionMenu, ZmOperation.TAG_MENU, ZmOperation.TAG_MENU, contact.isGroup() ? ZmMsg.AB_TAG_GROUP : ZmMsg.AB_TAG_CONTACT);

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
	var view = this._listView[this._currentView];
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
	var contact = this._listView[this._currentView].getSelection()[0];
	AjxDispatcher.run("GetContactController").show(contact, false);
};

/**
 * @private
 */
ZmContactListController.prototype._printContactListener =
function(ev) {
	var contacts = this._listView[this._currentView].getSelection();
	var ids = [];
	for (var i = 0; i < contacts.length; i++) {
		ids.push(contacts[i].id);
	}
	var url = "/h/printcontacts?id=" + ids.join(",");
    if(this.isGalSearch()) {
        url = "/h/printcontacts?id=" + ids.join("&id=");
        url = url + "&st=gal";
    }
    if (appCtxt.isOffline) {
        var folderId = this._folderId || ZmFolder.ID_CONTACTS;
	    var acctName = appCtxt.getById(folderId).getAccount().name;
        url+="&acct=" + acctName ;
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
		url = "/h/printcontacts?id=" + ids.join(",");
        if(this.isGalSearch()) {
            url = "/h/printcontacts?id=" + ids.join("&id=");
        }
	}
    if(this.isGalSearch()) {
        url = url + "&st=gal";
    }
    if (appCtxt.isOffline) {
        var folderId = this._folderId || ZmFolder.ID_CONTACTS;
        var acctName = appCtxt.getById(folderId).getAccount().name;
        url+="&acct=" + acctName ;
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

    var allDoneCallback = new AjxCallback(this, this._checkItemCount);
	if (move.length) {
        var params = {items:move, folder:folder, attrs:attrs, outOfTrash:outOfTrash};
        var list = this._setupContinuation(this._doMove, [folder, attrs, isShiftKey], params, allDoneCallback);
        list = outOfTrash ? this._list : list;
		list.moveItems(params);
	}

	if (copy.length) {
        var params = {items:copy, folder:folder, attrs:attrs};
        var list = this._setupContinuation(this._doMove, [folder, attrs, isShiftKey], params, allDoneCallback);
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

	// if more contacts to show,
	var size = this._listView[this._currentView].getSelectedItems().size();
	if (size == 0) {
		// and if in split view allow split view to clear
		if (this._currentView == ZmId.VIEW_CONTACT_SIMPLE)
			this._listView[this._currentView].parent.clear();

		this._resetOperations(this._toolbar[this._currentView], 0);
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
	var lv = this._listView[this._currentView];
	lv.set(this._list);
	lv._setNextSelection();
};
