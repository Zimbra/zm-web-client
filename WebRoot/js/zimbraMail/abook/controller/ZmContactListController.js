/*
 * ***** BEGIN LICENSE BLOCK *****
 * Version: ZPL 1.1
 * 
 * The contents of this file are subject to the Zimbra Public License
 * Version 1.1 ("License"); you may not use this file except in
 * compliance with the License. You may obtain a copy of the License at
 * http://www.zimbra.com/license
 * 
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied. See
 * the License for the specific language governing rights and limitations
 * under the License.
 * 
 * The Original Code is: Zimbra Collaboration Suite.
 * 
 * The Initial Developer of the Original Code is Zimbra, Inc.
 * Portions created by Zimbra are Copyright (C) 2005 Zimbra, Inc.
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

	this._viewFactory = new Object();
	this._viewFactory[ZmController.CONTACT_CARDS_VIEW] = ZmContactCardsView;
	this._viewFactory[ZmController.CONTACT_SIMPLE_VIEW] = ZmContactSplitView;
	
	this._dragSrc = new DwtDragSource(Dwt.DND_DROP_MOVE);
	this._dragSrc.addDragListener(new AjxListener(this, this._dragListener));
	
	this._listeners[ZmOperation.EDIT] = new AjxListener(this, this._editListener);
	this._listeners[ZmOperation.PRINT_MENU] = new AjxListener(this, this._printContactListener);

	this._appCtxt.getSettings().addChangeListener(new AjxListener(this, this._changeListener));
	this._isGalSearch = false;
	this._parentView = new Object();
}

ZmContactListController.prototype = new ZmListController;
ZmContactListController.prototype.constructor = ZmContactListController;

ZmContactListController.ICON = new Object();
ZmContactListController.ICON[ZmController.CONTACT_SIMPLE_VIEW]		= "ListView";
ZmContactListController.ICON[ZmController.CONTACT_CARDS_VIEW]		= "CardsView";

ZmContactListController.MSG_KEY = new Object();
ZmContactListController.MSG_KEY[ZmController.CONTACT_SIMPLE_VIEW]	= "contactList";
ZmContactListController.MSG_KEY[ZmController.CONTACT_CARDS_VIEW]	= "detailedCards";

ZmContactListController.VIEWS = [ZmController.CONTACT_SIMPLE_VIEW, ZmController.CONTACT_CARDS_VIEW];

ZmContactListController.prototype.toString = 
function() {
	return "ZmContactListController";
}

// Public methods

ZmContactListController.prototype.show =
function(search, searchString, bIsGalSearch) {
	try {
		this._isGalSearch = bIsGalSearch;
		var bForce = false;
		
		if (search instanceof ZmList) {
			// show canonical list of contacts
			this._list = search;
			bForce = true; // always force display
		} else if (search instanceof ZmSearchResult) {
			this._isNewSearch = bForce = true;
			this._list = search.getResults(ZmItem.CONTACT);
			if (bIsGalSearch && (this._list == null))
				this._list = new ZmContactList(this._appCtxt, search.search, bIsGalSearch);
			this._activeSearch = search;
			this._searchString = searchString;
		}
		
		var view = this._currentView || this._defaultView();
		
		// reset offset if list view has been created
		if (this._listView[view])
			this._listView[view].setOffset(0);

		this.switchView(view, bForce);
	} catch (ex) {
		this._handleException(ex, this.show, {search:search, searchString:searchString, bIsGalSearch:bIsGalSearch}, false);
	}
}

ZmContactListController.prototype.switchView = 
function(view, force) {
	if (view != this._currentView || force) {
		this._setup(view);
		this._resetNavToolBarButtons(view);
		var elements = new Object();
		elements[ZmAppViewMgr.C_TOOLBAR_TOP] = this._toolbar[view];
		elements[ZmAppViewMgr.C_APP_CONTENT] = this._parentView[view];
		var ok = this._setView(view, elements, true);
		this._currentView = view;
		if (ok)
			this._setViewMenu(view);

		// HACK: reset search toolbar icon (its a hack we're willing to live with)
		if (this._isGalSearch)
			this._appCtxt.getSearchController().setDefaultSearchType(ZmSearchToolBar.FOR_GAL_MI, true);

		// get the first selected item if applicable
		var item = this._listView[view].getSelection()[0];
		var list = this._listView[view].getList();
		// find the first non-trash contact
		if (!item && list)
			item = this._listView[view].getFirstValid(list);

		// reset selection since we wiped the canvas
		if (item)
			this._listView[view].setSelection(item);
	}
}

ZmContactListController.prototype._preShowCallback =
function(view) {
	if (this._isNewSearch) {
		this._isNewSearch = false;
	} else {
		this._resetNavToolBarButtons(view);
	}

	return true;
}

// Private and protected methods

ZmContactListController.prototype._standardToolBarOps =
function() {
	var list = [ZmOperation.NEW_MENU];
	if (this._appCtxt.get(ZmSetting.TAGGING_ENABLED))
		list.push(ZmOperation.TAG_MENU);
	list.push(ZmOperation.SEP);
	if (this._appCtxt.get(ZmSetting.PRINT_ENABLED))
		list.push(ZmOperation.PRINT_MENU);
	list.push(ZmOperation.DELETE, ZmOperation.MOVE);
	return list;
}

ZmContactListController.prototype._getToolBarOps =
function() {
	var list = this._standardToolBarOps();
	list.push(ZmOperation.SEP);
	list.push(ZmOperation.EDIT);
	return list;
}

ZmContactListController.prototype._getActionMenuOps =
function() {
	var list = this._contactOps();
	list.push(ZmOperation.SEP);
	list = list.concat(this._standardActionMenuOps());
	return list;
}

ZmContactListController.prototype._getViewType = 
function() {
	return this._currentView;
}

ZmContactListController.prototype._defaultView =
function() {
	return (this._appCtxt.get(ZmSetting.CONTACTS_VIEW) == "cards") ? ZmController.CONTACT_CARDS_VIEW : ZmController.CONTACT_SIMPLE_VIEW;
}

ZmContactListController.prototype._createNewView = 
function(view) {
	this._parentView[view] = new this._viewFactory[view](this._container, this._dropTgt, Dwt.ABSOLUTE_STYLE, this);
	var listView = this._parentView[view].getListView();
	listView.setDragSource(this._dragSrc);

	return listView;
}

ZmContactListController.prototype._getTagMenuMsg = 
function(num) {
	return (num == 1) ? ZmMsg.AB_TAG_CONTACT : ZmMsg.AB_TAG_CONTACTS;
}

ZmContactListController.prototype._getMoveDialogTitle = 
function(num) {
	return (num == 1) ? ZmMsg.AB_MOVE_CONTACT : ZmMsg.AB_MOVE_CONTACTS;
}

ZmContactListController.prototype._initializeToolBar = 
function(view) {
	if (this._toolbar[view]) return;

	ZmListController.prototype._initializeToolBar.call(this, view);
	this._setupViewMenu(view);
	this._setNewButtonProps(view, ZmMsg.createNewContact, "NewContact", "NewContactDis", ZmOperation.NEW_CONTACT);
	this._setupPrintMenu(view);
	this._toolbar[view].addFiller();
	var tb = new ZmNavToolBar(this._toolbar[view], DwtControl.STATIC_STYLE, null, ZmNavToolBar.SINGLE_ARROWS, true);
	this._setNavToolBar(tb);
}

ZmContactListController.prototype._initializeActionMenu = 
function(view) {
	if (this._actionMenu) return;

	ZmListController.prototype._initializeActionMenu.call(this);
	ZmOperation.setOperation(this._actionMenu, ZmOperation.CONTACT, ZmOperation.EDIT_CONTACT);
}

// Load contacts into the given view and perform layout.
ZmContactListController.prototype._setViewContents =
function(view) {
	this._listView[view].set(this._list);
}

// List listeners

// Double click displays a contact.
ZmContactListController.prototype._listSelectionListener =
function(ev) {
	ZmListController.prototype._listSelectionListener.call(this, ev);
	
	if (ev.detail == DwtListView.ITEM_SELECTED && 
		this._currentView == ZmController.CONTACT_SIMPLE_VIEW)
	{
		this._resetNavToolBarButtons(this._currentView);
		this._parentView[this._currentView].setContact(ev.item, this._isGalSearch);
	} 
	else if (ev.detail == DwtListView.ITEM_DBL_CLICKED) 
	{
		if (!this._isGalSearch)
			this._app.getContactController().show(ev.item);
	}
}

// Get info on selected contact to provide context for action menu.
ZmContactListController.prototype._listActionListener =
function(ev) {
	ZmListController.prototype._listActionListener.call(this, ev);
	this._actionEv.contact = ev.item;
	var email = ev.item.getAttr([ZmContact.F_email]) || ev.item.getAttr([ZmContact.F_email2]) || ev.item.getAttr([ZmContact.F_email3]);
	this._actionEv.address = new ZmEmailAddress(email);
	// enable/disable New Email menu item per valid email found for this contact
	var enableNewEmail = email != null && this._listView[this._currentView].getSelectionCount() == 1;
	this._actionMenu.enable([ZmOperation.SEARCH, ZmOperation.BROWSE, ZmOperation.NEW_MESSAGE], enableNewEmail);
	this._setContactText(!this._isGalSearch);
	this._actionMenu.popup(0, ev.docX, ev.docY);
}

ZmContactListController.prototype._editListener =
function(ev) {
	var contact = this._listView[this._currentView].getSelection()[0];
	this._app.getContactController().show(contact, false);
}

ZmContactListController.prototype._changeListener = 
function(ev) {
	if (ev.type != ZmEvent.S_SETTING) return;
	
	var setting = ev.source;
	if (setting.id == ZmSetting.CONTACTS_PER_PAGE)
		this._isNewSearch = true; // mark flag for relayout
}

// Miscellaneous

ZmContactListController.prototype._paginate =
function(view, bPageForward) {
	this._listView[view].paginate(this._list, bPageForward);
	this._resetNavToolBarButtons(view);
}

ZmContactListController.prototype._doDelete = 
function(params) {
	ZmListController.prototype._doDelete.call(this, params);
	// if more contacts to show, 
	var size = this._listView[this._currentView].getSelectedItems().size();
	if (size == 0) {
		// and if in split view allow split view to clear
		if (this._currentView == ZmController.CONTACT_SIMPLE_VIEW)
			this._listView[this._currentView].parent.clear();

		this._resetOperations(this._toolbar[this._currentView], 0);
	}
}

ZmContactListController.prototype._checkReplenish = 
function() {
	// lets not allow replenishment for contacts since they all get loaded at once
}

// Create menu for View button and add listeners.
ZmContactListController.prototype._setupViewMenu =
function(view) {
	var appToolbar = this._appCtxt.getCurrentAppToolbar();
	var menu = appToolbar.getViewMenu(view);
	if (!menu) {
		var menu = new ZmPopupMenu(appToolbar.getViewButton());
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
}

ZmContactListController.prototype._setupPrintMenu = 
function(view) {
	var printButton = this._toolbar[view].getButton(ZmOperation.PRINT_MENU);
	var menu = new ZmPopupMenu(printButton);
	printButton.setMenu(menu);
	
	var mi = menu.createMenuItem(ZmOperation.PRINT_CONTACTLIST, ZmOperation.IMAGE[ZmOperation.PRINT_CONTACTLIST], ZmMsg[ZmOperation.MSG_KEY[ZmOperation.PRINT_CONTACTLIST]]);
	mi.setData(ZmOperation.MENUITEM_ID, ZmOperation.PRINT_CONTACTLIST);
	mi.addSelectionListener(this._listeners[ZmOperation.PRINT]);
}

// Resets the available options on a toolbar or action menu.
ZmContactListController.prototype._resetOperations = 
function(parent, num) {
	if (!this._isGalSearch) {
		ZmListController.prototype._resetOperations.call(this, parent, num);
		parent.enable(ZmOperation.EDIT, num==1);
	} else {
		// gal contacts cannot be tagged/moved/deleted
		parent.enableAll(false);
		parent.enable([ZmOperation.SEARCH, ZmOperation.BROWSE, ZmOperation.NEW_MENU, ZmOperation.VIEW], true);
		parent.enable([ZmOperation.CONTACT, ZmOperation.NEW_MESSAGE, ZmOperation.PRINT], num>0);
	}
}

ZmContactListController.prototype._resetNavToolBarButtons = 
function(view) {
	ZmListController.prototype._resetNavToolBarButtons.call(this, view);
	
	var offset = this._listView[view].getOffset();
	this._navToolBar.enable(ZmOperation.PAGE_BACK, offset > 0);
	
	var evenMore = this._list ? (offset + this._listView[view].getLimit()) < this._list.size() : false;
	this._navToolBar.enable(ZmOperation.PAGE_FORWARD, evenMore);
	
	this._navToolBar.setToolTip(ZmOperation.PAGE_BACK, ZmMsg.previous + " " + ZmMsg.page);
	this._navToolBar.setToolTip(ZmOperation.PAGE_FORWARD, ZmMsg.next + " " + ZmMsg.page);

	this._showListRange(view);
}

ZmContactListController.prototype._printListener = 
function(ev) {
	if (!this._printView)
		this._printView = new ZmPrintView(this._appCtxt);
	
	this._printView.render(this._list);
}

ZmContactListController.prototype._printContactListener = 
function(ev) {
	if (!this._printView)
		this._printView = new ZmPrintView(this._appCtxt);
	
	var contact = this._listView[this._currentView].getSelection()[0];
	if (contact)
		this._printView.render(contact);
}
