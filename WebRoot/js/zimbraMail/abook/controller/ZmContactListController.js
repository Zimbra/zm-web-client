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
 * Creates an empty contact list controller.
 * @constructor
 * @class
 * This class manages list views of contacts. So far there are two different list
 * views, one that shows the contacts in a traditional list format, and the other
 * which shows them as business cards. Since there are two views, we need to keep
 * track of which is the current view.
 *
 * @author Roland Schemers
 * @author Conrad Damon
 * 
 * @param container		containing shell
 * @param contactsApp	containing app
 */
ZmContactListController = function(container, contactsApp) {

	ZmListController.call(this, container, contactsApp);

	this._viewFactory = {};
	this._viewFactory[ZmController.CONTACT_CARDS_VIEW] = ZmContactCardsView;
	this._viewFactory[ZmController.CONTACT_SIMPLE_VIEW] = ZmContactSplitView;

	this._dragSrc = new DwtDragSource(Dwt.DND_DROP_MOVE);
	this._dragSrc.addDragListener(new AjxListener(this, this._dragListener));

	this._listeners[ZmOperation.EDIT] = new AjxListener(this, this._editListener);
	this._listeners[ZmOperation.PRINT] = null; // override base class to do nothing
	this._listeners[ZmOperation.PRINT_CONTACT] = new AjxListener(this, this._printContactListener);
	this._listeners[ZmOperation.PRINT_ADDRBOOK] = new AjxListener(this, this._printAddrBookListener);

	this._parentView = {};
};

ZmContactListController.prototype = new ZmListController;
ZmContactListController.prototype.constructor = ZmContactListController;

ZmContactListController.ICON = {};
ZmContactListController.ICON[ZmController.CONTACT_SIMPLE_VIEW]		= "ListView";
ZmContactListController.ICON[ZmController.CONTACT_CARDS_VIEW]		= "CardsView";

ZmContactListController.MSG_KEY = {};
ZmContactListController.MSG_KEY[ZmController.CONTACT_SIMPLE_VIEW]	= "contactList";
ZmContactListController.MSG_KEY[ZmController.CONTACT_CARDS_VIEW]	= "detailedCards";

ZmContactListController.SEARCH_TYPE_CANONICAL	= 1 << 0;
ZmContactListController.SEARCH_TYPE_GAL			= 1 << 1;
ZmContactListController.SEARCH_TYPE_NEW			= 1 << 2;
ZmContactListController.SEARCH_TYPE_ANYWHERE	= 1 << 3;

ZmContactListController.VIEWS = [ZmController.CONTACT_SIMPLE_VIEW, ZmController.CONTACT_CARDS_VIEW];

ZmContactListController.prototype.toString =
function() {
	return "ZmContactListController";
};

// Public methods

ZmContactListController.prototype.show =
function(searchResult, bIsGalSearch, folderId) {
	this._searchType = bIsGalSearch
		? ZmContactListController.SEARCH_TYPE_GAL
		: ZmContactListController.SEARCH_TYPE_CANONICAL;
	this._folderId = folderId;

	// use toString() here due to flakiness of 'instanceof' for ZmContactList
	if (searchResult instanceof ZmContactList) {
		this._list = searchResult;			// set as canonical list of contacts
		this._list._isShared = false;		// this list is not a search of shared items
		if (!this._currentView)
			this._currentView = this._defaultView();
	} else if (searchResult instanceof ZmSearchResult) {
		this._searchType |= ZmContactListController.SEARCH_TYPE_NEW;
		this._list = searchResult.getResults(ZmItem.CONTACT);

		// HACK - find out if user did a "is:anywhere" search (for printing)
		if (searchResult.search && searchResult.search.isAnywhere)
			this._searchType |= ZmContactListController.SEARCH_TYPE_ANYWHERE;

		if (searchResult.search && searchResult.search.userText && this.getParentView())
			this.getParentView().getAlphabetBar().reset();

		if (bIsGalSearch) {
			if (this._list == null)
				this._list = new ZmContactList(searchResult.search, true);
			this._list._isShared = false;
		} else {
			// find out if we just searched for a shared address book
			var addrbook = folderId ? appCtxt.getById(folderId) : null;
			this._list._isShared = addrbook ? addrbook.link : false;
		}

		this._list.setHasMore(searchResult.getAttribute("more"));

		ZmListController.prototype.show.apply(this, [searchResult, this._currentView]);
	}

	// reset offset if list view has been created
	var view = this._currentView;
	if (this._listView[view])
		this._listView[view].setOffset(0);

	this.switchView(view, true);
};

/**
 * Change how contacts are displayed. There are two views: the "simple" view
 * shows a list of contacts on the left and the selected contact on the right;
 * the "cards" view shows contacts as business cards.
 * 
 * @param view			[constant]		view to show
 * @param force			[boolean]*		if true, render view even if it's the current view
 * @param initialized	[boolean]*		if true, app has been initialized
 * @param stageView		[boolean]*		if true, stage the view but don't push it
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

		this._setView(view, elements, true, false, false, false, stageView);
		this._resetNavToolBarButtons(view);

		// HACK: reset search toolbar icon (its a hack we're willing to live with)
		if (this.isGalSearch()) {
			appCtxt.getSearchController().setDefaultSearchType(ZmSearchToolBar.FOR_GAL_MI);
		}

		this._setTabGroup(this._tabGroups[view]);
		this._restoreFocus();

		if (!initialized) {
			var list = this._listView[view].getList();
			if (list) {
				this._listView[view].setSelection(list.get(0));
			}
		}
	}
};

ZmContactListController.prototype.getFolderId =
function() {
	return this._folderId;
};

ZmContactListController.prototype.isGalSearch =
function() {
	return ((this._searchType & ZmContactListController.SEARCH_TYPE_GAL) != 0);
};

ZmContactListController.prototype.getParentView =
function() {
	return this._parentView[this._currentView];
};

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

		default:
			return ZmListController.prototype.handleKeyAction.call(this, actionCode);
	}
	return true;
};


// Private and protected methods


ZmContactListController.prototype._getToolBarOps =
function() {
	return [ZmOperation.NEW_MENU,
			ZmOperation.SEP,
			ZmOperation.EDIT,
			ZmOperation.SEP,
			ZmOperation.DELETE, ZmOperation.MOVE, ZmOperation.PRINT,
			ZmOperation.SEP,
			ZmOperation.TAG_MENU,
			ZmOperation.SEP,
			ZmOperation.VIEW_MENU];
};

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

ZmContactListController.prototype._getViewType =
function() {
	return this._currentView;
};

ZmContactListController.prototype._defaultView =
function() {
	return (appCtxt.get(ZmSetting.CONTACTS_VIEW) == "cards")
		? ZmController.CONTACT_CARDS_VIEW
		: ZmController.CONTACT_SIMPLE_VIEW;
};

ZmContactListController.prototype._createNewView =
function(view) {
	this._parentView[view] = new this._viewFactory[view](this._container, null, Dwt.ABSOLUTE_STYLE, this, this._dropTgt);
	var listView = this._parentView[view].getListView();
	listView.setDragSource(this._dragSrc);

	return listView;
};

ZmContactListController.prototype._getTagMenuMsg =
function(num) {
	return (num == 1) ? ZmMsg.AB_TAG_CONTACT : ZmMsg.AB_TAG_CONTACTS;
};

ZmContactListController.prototype._getMoveDialogTitle =
function(num) {
	return (num == 1) ? ZmMsg.AB_MOVE_CONTACT : ZmMsg.AB_MOVE_CONTACTS;
};

ZmContactListController.prototype._getMoveParams =
function() {
	var params = ZmListController.prototype._getMoveParams.call(this);
	var omit = {};
	var folderTree = appCtxt.getFolderTree();
	if (!folderTree) { return params; }
	var folders = folderTree.getByType(ZmOrganizer.ADDRBOOK);
	for (var i = 0; i < folders.length; i++) {
		var folder = folders[i];
		if ((folder.link && folder.isReadOnly()) || (folder.id == ZmOrganizer.ID_MY_CARD)) {
			omit[folder.id] = true;
		}
	}
	params.omit = omit;
	params.overviewId = "ZmContactListController";
	return params;
};

ZmContactListController.prototype._getSearchFolderId = 
function() {
	return this._folderId;
};

ZmContactListController.prototype._initializeToolBar =
function(view) {
	if (!this._toolbar[view]) {
		ZmListController.prototype._initializeToolBar.call(this, view);
		this._setupViewMenu(view, true);
		this._setNewButtonProps(view, ZmMsg.createNewContact, "NewContact", "NewContactDis", ZmOperation.NEW_CONTACT);
		this._setupPrintMenu(view);
		this._toolbar[view].addFiller();
		var tb = new ZmNavToolBar(this._toolbar[view], DwtControl.STATIC_STYLE, null, ZmNavToolBar.SINGLE_ARROWS, true);
		this._setNavToolBar(tb, view);
	} else {
		this._setupViewMenu(view, false);
	}
};

ZmContactListController.prototype._initializeActionMenu =
function(view) {
	ZmListController.prototype._initializeActionMenu.call(this);

	var mi = this._actionMenu.getItemById(ZmOperation.KEY_ID, ZmOperation.PRINT_CONTACT);
	if (mi) {
		mi.setText(ZmMsg.print);
	}

	ZmOperation.setOperation(this._actionMenu, ZmOperation.CONTACT, ZmOperation.EDIT_CONTACT);
};

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

// Load contacts into the given view and perform layout.
ZmContactListController.prototype._setViewContents =
function(view) {
	DBG.timePt("setting list");
	this._listView[view].set(this._list, null, this._folderId);
	DBG.timePt("done setting list");
};

// Create menu for View button and add listeners.
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

ZmContactListController.prototype._setupPrintMenu =
function(view) {
	var printButton = this._toolbar[view].getButton(ZmOperation.PRINT);
	if (!printButton) { return; }

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

// Resets the available options on a toolbar or action menu.
ZmContactListController.prototype._resetOperations =
function(parent, num) {
	var printMenuItem;
	if (parent instanceof ZmButtonToolBar) {
		var printButton = parent.getButton(ZmOperation.PRINT);
		if (printButton) {
			printMenuItem = printButton.getMenu().getItem(1);
			printMenuItem.setText(ZmMsg.printResults);
		}
	}

	var printOp = (parent instanceof ZmActionMenu)
		? ZmOperation.PRINT_CONTACT : ZmOperation.PRINT;

	if (!this.isGalSearch()) {
		parent.enable([ZmOperation.SEARCH, ZmOperation.BROWSE, ZmOperation.NEW_MENU, ZmOperation.VIEW_MENU], true);
		parent.enable(printOp, num > 0);

		var isParent = appCtxt.getActiveAccount().isMain;
		// a valid folderId means user clicked on an addrbook
		if (this._folderId) {
			var folder = appCtxt.getById(this._folderId);
			var isShare = folder && folder.link;
			var canEdit = (folder == null || !folder.isReadOnly());

			parent.enable([ZmOperation.TAG_MENU], (isParent && !isShare && num > 0));
			parent.enable([ZmOperation.DELETE, ZmOperation.MOVE], canEdit && num > 0);
			parent.enable([ZmOperation.EDIT, ZmOperation.CONTACT], canEdit && num == 1 && !folder.isInTrash());

			if (printMenuItem) {
				var text = isShare ? ZmMsg.printResults : ZmMsg.printAddrBook;
				printMenuItem.setText(text);
			}
		} else {
			// otherwise, must be a search
			var contact = this._listView[this._currentView].getSelection()[0];
			var canEdit = (num == 1 && !contact.isReadOnly() && !ZmContact.isInTrash(contact));
			parent.enable(ZmOperation.TAG_MENU, (isParent && num > 0));
			parent.enable([ZmOperation.DELETE, ZmOperation.MOVE], num > 0);
			parent.enable([ZmOperation.EDIT, ZmOperation.CONTACT], canEdit);
		}
	} else {
		// gal contacts cannot be tagged/moved/deleted
		parent.enableAll(false);
		parent.enable([ZmOperation.SEARCH, ZmOperation.BROWSE, ZmOperation.NEW_MENU, ZmOperation.VIEW_MENU], true);
		parent.enable([ZmOperation.CONTACT, ZmOperation.NEW_MESSAGE, printOp], num > 0);
	}
};

ZmContactListController.prototype._resetNavToolBarButtons =
function(view) {
	ZmListController.prototype._resetNavToolBarButtons.call(this, view);

	if (this._list.isCanonical) {
		this._navToolBar[view].enable(ZmOperation.PAGE_FORWARD, this._list.hasMore());
	}

	this._navToolBar[view].setToolTip(ZmOperation.PAGE_BACK, ZmMsg.previous + " " + ZmMsg.page);
	this._navToolBar[view].setToolTip(ZmOperation.PAGE_FORWARD, ZmMsg.next + " " + ZmMsg.page);
};

ZmContactListController.prototype._getNavStartEnd =
function(view) {
	var offset = this._listView[view].getOffset();
	var list = this._listView[view].getList();
	var size = list ? list.size() : null;

	var start, end;
	if (size && size > 0) {
		start = offset + 1;
		end = offset + size;
	}

	return (start && end) ? {start:start, end:end} : null;
};

ZmContactListController.prototype._getNumTotal =
function() {
	return (this._list && this._list.isCanonical)
		? (ZmListController.prototype._getNumTotal.call(this)) 
		: null;
};


// List listeners

// Double click displays a contact.
ZmContactListController.prototype._listSelectionListener =
function(ev) {
	ZmListController.prototype._listSelectionListener.call(this, ev);

	if (ev.detail == DwtListView.ITEM_SELECTED)	{
		this._resetNavToolBarButtons(this._currentView);
		if (this._currentView == ZmController.CONTACT_SIMPLE_VIEW)
			this._parentView[this._currentView].setContact(ev.item, this.isGalSearch());
	} else if (ev.detail == DwtListView.ITEM_DBL_CLICKED) {
		var folder = appCtxt.getById(ev.item.folderId);
		if (!this.isGalSearch() &&
			(!folder || (!folder.isReadOnly() && !folder.isInTrash())))
		{
			AjxDispatcher.run("GetContactController").show(ev.item);
		}
	}
};

// Get info on selected contact to provide context for action menu.
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
	actionMenu.enable([ZmOperation.SEARCH, ZmOperation.BROWSE, ZmOperation.NEW_MESSAGE], enableNewEmail);

	if (contact.isGroup()) {
		actionMenu.enable([ZmOperation.SEARCH, ZmOperation.BROWSE], false);
		ZmOperation.setOperation(actionMenu, ZmOperation.CONTACT, ZmOperation.EDIT_CONTACT, ZmMsg.AB_EDIT_GROUP);
	} else {
		this._setContactText(!this.isGalSearch());
		if (appCtxt.get(ZmSetting.IM_ENABLED)) {
			var buddy = contact.getBuddy();
			actionMenu.getOp(ZmOperation.IM).setEnabled(buddy != null);
			if (buddy) {
				actionMenu.getOp(ZmOperation.IM).setImage(buddy.getPresence().getIcon());
			}
		}
	}
	ZmOperation.setOperation(actionMenu, ZmOperation.TAG_MENU, ZmOperation.TAG_MENU, contact.isGroup() ? ZmMsg.AB_TAG_GROUP : ZmMsg.AB_TAG_CONTACT);

	actionMenu.popup(0, ev.docX, ev.docY);
	if (ev.ersatz) {
		// menu popped up via keyboard nav
		actionMenu.setSelectedItem(0);
	}
};

ZmContactListController.prototype._dropListener =
function(ev) {
	var view = this._listView[this._currentView];
	var div = Dwt.getAttr(ev.uiEvent.target, "_itemIndex", true);
	var item = div ? view.getItemFromElement(div) : null

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

ZmContactListController.prototype._editListener =
function(ev) {
	var contact = this._listView[this._currentView].getSelection()[0];
	AjxDispatcher.run("GetContactController").show(contact, false);
};

ZmContactListController.prototype._printContactListener =
function(ev) {
	var printView = appCtxt.getPrintView();
	var contacts = this._listView[this._currentView].getSelection();
	if (contacts.length == 1) {
		var contact = contacts[0];
		if (contact) {
			if (contact.isLoaded) {
				printView.render(contact);
			} else {
				var callback = new AjxCallback(this, this._handleResponsePrintLoad);
				contact.load(callback);
			}
		}
	} else {
		var html = ZmContactCardsView.getPrintHtml(AjxVector.fromArray(contacts));
		printView.renderHtml(html);
	}
};

ZmContactListController.prototype._printAddrBookListener =
function(ev) {
	var printView = appCtxt.getPrintView();
	if (this._folderId && !this._list._isShared) {
		var subList = this._list.getSubList(0, null, this._folderId);
		printView.renderHtml(ZmContactCardsView.getPrintHtml(subList));
	} else if ((this._searchType & ZmContactListController.SEARCH_TYPE_ANYWHERE) != 0) {
		printView.render(AjxDispatcher.run("GetContacts"));
	} else {
		printView.render(this._list);
	}
};

ZmContactListController.prototype._handleResponsePrintLoad =
function(result, contact) {
	appCtxt.getPrintView().render(contact);
};

// Returns the type of item in the underlying list
ZmContactListController.prototype._getItemType =
function() {
	return ZmItem.CONTACT;
};


// Callbacks

ZmContactListController.prototype._preShowCallback =
function(view) {
	if ((this._searchType & ZmContactListController.SEARCH_TYPE_NEW) != 0) {
		this._searchType &= ~ZmContactListController.SEARCH_TYPE_NEW;
	} else {
		this._resetNavToolBarButtons(view);
	}

	return true;
};

ZmContactListController.prototype._paginate =
function(view, bPageForward) {
	if (this._list.isCanonical) {
		this._listView[view].paginate(this._list, bPageForward);
		this._resetNavToolBarButtons(view);
	} else {
		ZmListController.prototype._paginate.call(this, view, bPageForward);
	}
};

ZmContactListController.prototype._doDelete =
function(items, hardDelete, attrs) {
	// Disallow my card delete.
	for (var i = 0, count = items.length; i < count; i++) {
		if (items[i].isMyCard()) {
			appCtxt.setStatusMsg(ZmMsg.errorMyCardDelete, ZmStatusView.LEVEL_WARNING);
			return;
		}
	}

	ZmListController.prototype._doDelete.call(this, items, hardDelete, attrs);

	// if more contacts to show,
	var size = this._listView[this._currentView].getSelectedItems().size();
	if (size == 0) {
		// and if in split view allow split view to clear
		if (this._currentView == ZmController.CONTACT_SIMPLE_VIEW)
			this._listView[this._currentView].parent.clear();

		this._resetOperations(this._toolbar[this._currentView], 0);
	}
};

ZmContactListController.prototype._moveListener =
function(ev) {
	// Disallow my card move.
	var items = this._listView[this._currentView].getSelection();
	for (var i = 0, count = items.length; i < count; i++) {
		if (items[i].isMyCard()) {
			appCtxt.setStatusMsg(ZmMsg.errorMyCardMove, ZmStatusView.LEVEL_WARNING);
			return;
		}
	}

	ZmListController.prototype._moveListener.call(this, ev);
};

ZmContactListController.prototype._checkReplenish =
function() {
	// reset the listview
	var lv = this._listView[this._currentView];
	lv.set(this._list);
	lv._setNextSelection();
};

