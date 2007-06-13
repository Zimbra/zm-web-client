/*
 * ***** BEGIN LICENSE BLOCK *****
 * Version: ZPL 1.2
 *
 * The contents of this file are subject to the Zimbra Public License
 * Version 1.2 ("License"); you may not use this file except in
 * compliance with the License. You may obtain a copy of the License at
 * http://www.zimbra.com/license
 *
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied. See
 * the License for the specific language governing rights and limitations
 * under the License.
 *
 * The Original Code is: Zimbra Collaboration Suite Web Client
 *
 * The Initial Developer of the Original Code is Zimbra, Inc.
 * Portions created by Zimbra are Copyright (C) 2004, 2005, 2006 Zimbra, Inc.
 * All Rights Reserved.
 *
 * Contributor(s):
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
* @param appCtxt		app context
* @param container		containing shell
* @param contactsApp	containing app
*/
function ZmContactListController(appCtxt, container, contactsApp) {

	ZmListController.call(this, appCtxt, container, contactsApp);

	this._viewFactory = {};
	this._viewFactory[ZmController.CONTACT_CARDS_VIEW] = ZmContactCardsView;
	this._viewFactory[ZmController.CONTACT_SIMPLE_VIEW] = ZmContactSplitView;

	this._dragSrc = new DwtDragSource(Dwt.DND_DROP_MOVE);
	this._dragSrc.addDragListener(new AjxListener(this, this._dragListener));

	this._listeners[ZmOperation.EDIT] = new AjxListener(this, this._editListener);
	this._listeners[ZmOperation.PRINT_MENU] = new AjxListener(this, this._printContactListener);

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

	if (searchResult instanceof ZmList) {
		this._list = searchResult;			// set as canonical list of contacts
		this._list._isShared = false;		// this list is not a search of shared items
		if (!this._currentView)
			this._currentView = this._defaultView();
	} else if (searchResult instanceof ZmSearchResult) {
		this._searchType |= ZmContactListController.SEARCH_TYPE_NEW;
		this._list = searchResult.getResults(ZmItem.CONTACT);

		// HACK - find out if user did a "is:anywhere" search (for printing)
		if (searchResult.search.isAnywhere)
			this._searchType |= ZmContactListController.SEARCH_TYPE_ANYWHERE;

		if (searchResult.search.userText && this.getParentView())
			this.getParentView().getAlphabetBar().reset();

		if (bIsGalSearch) {
			if (this._list == null)
				this._list = new ZmContactList(this._appCtxt, searchResult.search, true);
			this._list._isShared = false;
		} else {
			// find out if we just searched for a shared address book
			var addrbookTree = folderId ? this._appCtxt.getTree(ZmOrganizer.ADDRBOOK) : null;
			var addrbook = addrbookTree ? addrbookTree.getById(folderId) : null;
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

ZmContactListController.prototype.switchView =
function(view, force, initialized) {
	if (view != this._currentView || force) {
		this._currentView = view;
		DBG.timePt("setting up view", true);
		this._setup(view);
		DBG.timePt("done setting up view");

		var elements = {};
		elements[ZmAppViewMgr.C_TOOLBAR_TOP] = this._toolbar[view];
		elements[ZmAppViewMgr.C_APP_CONTENT] = this._parentView[view];

		// call initialize before _setView since we havent set the new view yet
		if (!initialized)
			this._initializeAlphabetBar(view);

		this._setView(view, elements, true);

		this._resetNavToolBarButtons(view);

		// HACK: reset search toolbar icon (its a hack we're willing to live with)
		if (this.isGalSearch())
			this._appCtxt.getSearchController().setDefaultSearchType(ZmSearchToolBar.FOR_GAL_MI, true);

		this._setTabGroup(this._tabGroups[view]);
		this._restoreFocus();

		if (!initialized) {
			var list = this._listView[view].getList();
			if (list)
				this._listView[view].setSelection(list.get(0));
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
	var folder = this._appCtxt.getTree(ZmOrganizer.ADDRBOOK).getById(folderId);
	var query = folder ? folder.createQuery() : null;

	if (query) {
		var limit = this._listView[this._currentView].getLimit();
		var params = {query:query, offset:0, limit:limit, lastId:0, lastSortVal:letter, endSortVal:endLetter};
		var sc = this._appCtxt.getSearchController();
		sc.search(params);
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
			if (this._appCtxt.get(ZmSetting.PRINT_ENABLED)) {
				this._printContactListener();
			}
			break;

		default:
			return ZmListController.prototype.handleKeyAction.call(this, actionCode);
	}
	return true;
};


// Private and protected methods


ZmContactListController.prototype._standardToolBarOps =
function() {
	var list = [ZmOperation.NEW_MENU];
	if (this._appCtxt.get(ZmSetting.TAGGING_ENABLED))
		list.push(ZmOperation.TAG_MENU);
	list.push(ZmOperation.SEP);
	list.push(ZmOperation.DELETE, ZmOperation.MOVE);
	if (this._appCtxt.get(ZmSetting.PRINT_ENABLED))
		list.push(ZmOperation.PRINT_MENU);
	return list;
};

ZmContactListController.prototype._getToolBarOps =
function() {
	var list = this._standardToolBarOps();
	list.push(ZmOperation.SEP);
	list.push(ZmOperation.EDIT);
	return list;
};

ZmContactListController.prototype._getActionMenuOps =
function() {
	var list = this._contactOps();
	list.push(ZmOperation.SEP);
	list = list.concat(this._standardActionMenuOps());
	return list;
};

ZmContactListController.prototype._getViewType =
function() {
	return this._currentView;
};

ZmContactListController.prototype._defaultView =
function() {
	return (this._appCtxt.get(ZmSetting.CONTACTS_VIEW) == "cards") ? ZmController.CONTACT_CARDS_VIEW : ZmController.CONTACT_SIMPLE_VIEW;
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

ZmContactListController.prototype._initializeToolBar =
function(view) {
	if (this._toolbar[view]) return;

	ZmListController.prototype._initializeToolBar.call(this, view);
	this._setupViewMenu(view);
	if (this._appCtxt.get(ZmSetting.CONTACTS_ENABLED))
		this._setNewButtonProps(view, ZmMsg.createNewContact, "NewContact", "NewContactDis", ZmOperation.NEW_CONTACT);
	this._setupPrintMenu(view);
	this._toolbar[view].addFiller();
	var tb = new ZmNavToolBar(this._toolbar[view], DwtControl.STATIC_STYLE, null, ZmNavToolBar.SINGLE_ARROWS, true);
	this._setNavToolBar(tb, view);
};

ZmContactListController.prototype._initializeActionMenu =
function(view) {
	ZmListController.prototype._initializeActionMenu.call(this);

	// reset the default listener for print action in action menu
	var actionMenu = this._actionMenu;
	actionMenu.removeSelectionListener(ZmOperation.PRINT, this._listeners[ZmOperation.PRINT]);
	actionMenu.addSelectionListener(ZmOperation.PRINT, this._listeners[ZmOperation.PRINT_MENU]);

	ZmOperation.setOperation(actionMenu, ZmOperation.CONTACT, ZmOperation.EDIT_CONTACT);
};

ZmContactListController.prototype._initializeAlphabetBar =
function(view) {
	if (view == this._currentView)
		return;

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
function(view) {
	var appToolbar = this._appCtxt.getCurrentAppToolbar();
	var menu = appToolbar.getViewMenu(view);
	if (!menu) {
		menu = new ZmPopupMenu(appToolbar.getViewButton());
		for (var i = 0; i < ZmContactListController.VIEWS.length; i++) {
			var id = ZmContactListController.VIEWS[i];
			var mi = menu.createMenuItem(id, ZmContactListController.ICON[id], ZmMsg[ZmContactListController.MSG_KEY[id]], null, true, DwtMenuItem.RADIO_STYLE);
			mi.setData(ZmOperation.MENUITEM_ID, id);
			mi.addSelectionListener(this._listeners[ZmOperation.VIEW]);
			if (id == view)
				mi.setChecked(true, true);
		}
		appToolbar.setViewMenu(view, menu);
	}
	return menu;
};

ZmContactListController.prototype._setupPrintMenu =
function(view) {
	var printButton = this._toolbar[view].getButton(ZmOperation.PRINT_MENU);
	var menu = new ZmPopupMenu(printButton);
	printButton.setMenu(menu);

	var id = ZmOperation.PRINT_CONTACTLIST;
	var mi = menu.createMenuItem(id, ZmOperation.getProp(id, "image"), ZmMsg[ZmOperation.getProp(id, "textKey")]);
	mi.setData(ZmOperation.MENUITEM_ID, id);
	mi.addSelectionListener(this._listeners[ZmOperation.PRINT]);
};

// Resets the available options on a toolbar or action menu.
ZmContactListController.prototype._resetOperations =
function(parent, num) {
	var printMenuItem;
	if (parent instanceof ZmButtonToolBar) {
		printMenuItem = parent.getButton(ZmOperation.PRINT_MENU).getMenu().getItem(0);
		printMenuItem.setText(ZmMsg.printResults);
	}

	if (!this.isGalSearch()) {
		parent.enable([ZmOperation.SEARCH, ZmOperation.BROWSE, ZmOperation.NEW_MENU, ZmOperation.VIEW], true);
		parent.enable(ZmOperation.PRINT_MENU, num > 0);
		if (parent instanceof ZmActionMenu)
			parent.enable(ZmOperation.PRINT, num == 1);

		// a valid folderId means user clicked on an addrbook
		if (this._folderId) {
			var folder = this._appCtxt.getTree(ZmOrganizer.ADDRBOOK).getById(this._folderId);
			var isShare = folder && folder.link;
			var canEdit = (folder == null || !folder.isReadOnly());

			parent.enable([ZmOperation.TAG_MENU], !isShare && num > 0);
			parent.enable([ZmOperation.DELETE, ZmOperation.MOVE], canEdit && num > 0);
			parent.enable([ZmOperation.EDIT, ZmOperation.CONTACT], canEdit && num == 1);

			if (printMenuItem) {
				var text = isShare ? ZmMsg.printResults : ZmMsg.printAddrBook;
				printMenuItem.setText(text);
			}
		} else {
			// otherwise, must be a search
			var contact = this._listView[this._currentView].getSelection()[0];
			parent.enable([ZmOperation.TAG_MENU, ZmOperation.DELETE, ZmOperation.MOVE], num > 0);
			parent.enable([ZmOperation.EDIT, ZmOperation.CONTACT], num == 1 && !contact.isReadOnly());
		}
	} else {
		// gal contacts cannot be tagged/moved/deleted
		parent.enableAll(false);
		parent.enable([ZmOperation.SEARCH, ZmOperation.BROWSE, ZmOperation.NEW_MENU, ZmOperation.VIEW], true);
		parent.enable([ZmOperation.CONTACT, ZmOperation.NEW_MESSAGE, ZmOperation.PRINT_MENU], num > 0);
	}
};

ZmContactListController.prototype._resetNavToolBarButtons =
function(view) {
	ZmListController.prototype._resetNavToolBarButtons.call(this, view);

	if (this._list.isCanonical)
		this._navToolBar[view].enable(ZmOperation.PAGE_FORWARD, this._list.hasMore());

	this._navToolBar[view].setToolTip(ZmOperation.PAGE_BACK, ZmMsg.previous + " " + ZmMsg.page);
	this._navToolBar[view].setToolTip(ZmOperation.PAGE_FORWARD, ZmMsg.next + " " + ZmMsg.page);

	this._showListRange(view);
};

ZmContactListController.prototype._showListRange =
function(view) {
	var offset = this._listView[view].getOffset();
	var list = this._listView[view].getList();
	var size = list ? list.size() : null;

	var text = "";
	if (size && size > 0) {
		var start = offset + 1;
		var end = offset + size;
		text = start + " - " + end;
	}
	this._navToolBar[view].setText(text);
};



// List listeners

// Double click displays a contact.
ZmContactListController.prototype._listSelectionListener =
function(ev) {
	ZmListController.prototype._listSelectionListener.call(this, ev);

	if (ev.detail == DwtListView.ITEM_SELECTED)
	{
		this._resetNavToolBarButtons(this._currentView);
		if (this._currentView == ZmController.CONTACT_SIMPLE_VIEW)
			this._parentView[this._currentView].setContact(ev.item, this.isGalSearch());
	}
	else if (ev.detail == DwtListView.ITEM_DBL_CLICKED)
	{
		var folder = this._appCtxt.getTree(ZmOrganizer.ADDRBOOK).getById(ev.item.folderId);
		if (!this.isGalSearch() && (folder == null || !folder.isReadOnly()))
			this._app.getContactController().show(ev.item);
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
		? email : new ZmEmailAddress(email);
	// enable/disable New Email menu item per valid email found for this contact
	var enableNewEmail = email != null && this._listView[this._currentView].getSelectionCount() == 1;
	var actionMenu = this.getActionMenu();
	actionMenu.enable([ZmOperation.SEARCH, ZmOperation.BROWSE, ZmOperation.NEW_MESSAGE], enableNewEmail);

	if (contact.isGroup()) {
		actionMenu.enable([ZmOperation.SEARCH, ZmOperation.BROWSE], false);
		ZmOperation.setOperation(actionMenu, ZmOperation.CONTACT, ZmOperation.EDIT_CONTACT, ZmMsg.AB_EDIT_GROUP);
	} else {
		this._setContactText(!this.isGalSearch());
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
	this._app.getContactController().show(contact, false);
};

ZmContactListController.prototype._printListener =
function(ev) {
	if (!this._printView)
		this._printView = new ZmPrintView(this._appCtxt);

	if (this._folderId && !this._list._isShared) {
		var subList = this._list.getSubList(0, null, this._folderId);
		this._printView.renderType(ZmItem.CONTACT, subList);
	} else if ((this._searchType & ZmContactListController.SEARCH_TYPE_ANYWHERE) != 0) {
		var canonicalList = this._appCtxt.getApp(ZmZimbraMail.CONTACTS_APP).getContactList();
		this._printView.render(canonicalList);
	} else {
		this._printView.render(this._list);
	}
};

ZmContactListController.prototype._printContactListener =
function(ev) {
	if (!this._printView)
		this._printView = new ZmPrintView(this._appCtxt);

	var contacts = this._listView[this._currentView].getSelection();
	if (contacts.length == 1) {
		var contact = contacts[0];
		if (contact) {
			if (contact.isLoaded()) {
				this._printView.render(contact);
			} else {
				var callback = new AjxCallback(this, this._handleResponsePrintLoad);
				contact.load(callback);
			}
		}
	} else {
		this._printView.renderType(ZmItem.CONTACT, contacts);
	}
};

ZmContactListController.prototype._handleResponsePrintLoad =
function(result, contact) {
	this._printView.render(contact);
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

ZmContactListController.prototype._checkReplenish =
function() {
	// reset the listview
	var listview = this._listView[this._currentView];
	listview.set(this._list);
	// reset the selection to the first item
	var list = listview.getList();
	listview.setSelection(list.get(0));
};
