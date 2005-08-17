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
function LmContactListController(appCtxt, container, contactsApp) {

	LmListController.call(this, appCtxt, container, contactsApp);

	this._viewFactory = new Object();
	this._viewFactory[LmController.CONTACT_CARDS_VIEW] = LmContactCardsView;
	this._viewFactory[LmController.CONTACT_SIMPLE_VIEW] = LmContactSplitView;
	
	this._dragSrc = new DwtDragSource(Dwt.DND_DROP_MOVE);
	this._dragSrc.addDragListener(new LsListener(this, this._dragListener));
	
	this._listeners[LmOperation.EDIT] = new LsListener(this, this._editListener);

	this._appCtxt.getSettings().addChangeListener(new LsListener(this, this._changeListener));
	this._isGalSearch = false;
	this._parentView = new Object();
}

LmContactListController.prototype = new LmListController;
LmContactListController.prototype.constructor = LmContactListController;

LmContactListController.ICON = new Object();
LmContactListController.ICON[LmController.CONTACT_SIMPLE_VIEW]		= LmImg.I_LIST;
LmContactListController.ICON[LmController.CONTACT_CARDS_VIEW]		= LmImg.I_CONTACT;

LmContactListController.MSG_KEY = new Object();
LmContactListController.MSG_KEY[LmController.CONTACT_SIMPLE_VIEW]	= "contactList";
LmContactListController.MSG_KEY[LmController.CONTACT_CARDS_VIEW]	= "detailedCards";

LmContactListController.VIEWS = [LmController.CONTACT_SIMPLE_VIEW, LmController.CONTACT_CARDS_VIEW];

LmContactListController.prototype.toString = 
function() {
	return "LmContactListController";
}

// Public methods

LmContactListController.prototype.show =
function(search, searchString, bIsGalSearch) {
	try {
		this._isGalSearch = bIsGalSearch;
		var bForce = false;
		
		if (search instanceof LmList) {
			// show canonical list of contacts
			this._list = search;
			bForce = true; // always force display
		} else if (search instanceof LmSearchResult) {
			this._isNewSearch = bForce = true;
			this._list = search.getResults(LmItem.CONTACT);
			if (bIsGalSearch && (this._list == null))
				this._list = new LmContactList(this._appCtxt, bIsGalSearch);
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

LmContactListController.prototype.switchView = 
function(view, force) {
	if (view != this._currentView || force) {
		this._setup(view);
		this._resetNavToolBarButtons(view);
		var elements = new Object();
		elements[LmAppViewMgr.C_TOOLBAR_TOP] = this._toolbar[view];
		elements[LmAppViewMgr.C_APP_CONTENT] = this._parentView[view];
		var ok = this._setView(view, elements, true);
		this._currentView = view;
		if (ok)
			this._setViewMenu(view);

		// HACK: reset search toolbar icon (its a hack we're willing to live with)
		if (this._isGalSearch)
			this._appCtxt.getSearchController().setDefaultSearchType(LmSearchToolBar.FOR_GAL_MI, true);

		// get the first selected item if applicable
		var item = this._listView[view].getSelection()[0];
		var list = this._listView[view].getList();
		if (!item && list) {
			// find the first non-trash contact
			var folderTree = this._appCtxt.getFolderTree();
			for (var i=0; i<list.size(); i++) {
				var folder = folderTree.getById(list.get(i).folderId);
				if (!folder || !folder.isInTrash()) {
					item = list.get(i);
					break;
				}
			}
		}

		// reset selection since we wiped the canvas
		if (item)
			this._listView[view].setSelection(item);
	}
}

LmContactListController.prototype._preShowCallback =
function(view) {
	if (this._isNewSearch) {
		this._isNewSearch = false;
	} else {
		this._resetNavToolBarButtons(view);
	}

	return true;
}

// Private and protected methods

LmContactListController.prototype._getToolBarOps =
function() {
	var list = this._standardToolBarOps();
	list.push(LmOperation.SEP);
	list.push(LmOperation.EDIT);
	return list;
}

LmContactListController.prototype._getActionMenuOps =
function() {
	var list = this._contactOps();
	list.push(LmOperation.SEP);
	list = list.concat(this._standardActionMenuOps());
	return list;
}

LmContactListController.prototype._getViewType = 
function() {
	return this._currentView;
}

LmContactListController.prototype._defaultView =
function() {
	return (this._appCtxt.get(LmSetting.CONTACTS_VIEW) == "cards") ? LmController.CONTACT_CARDS_VIEW : LmController.CONTACT_SIMPLE_VIEW;
}

LmContactListController.prototype._createNewView = 
function(view) {
	this._parentView[view] = new this._viewFactory[view](this._container, this._dropTgt, Dwt.ABSOLUTE_STYLE, this);
	var listView = this._parentView[view].getListView();
	listView.setDragSource(this._dragSrc);

	return listView;
}

LmContactListController.prototype._getTagMenuMsg = 
function(num) {
	return (num == 1) ? LmMsg.AB_TAG_CONTACT : LmMsg.AB_TAG_CONTACTS;
}

LmContactListController.prototype._getMoveDialogTitle = 
function(num) {
	return (num == 1) ? LmMsg.AB_MOVE_CONTACT : LmMsg.AB_MOVE_CONTACTS;
}

LmContactListController.prototype._initializeToolBar = 
function(view) {
	if (this._toolbar[view]) return;

	LmListController.prototype._initializeToolBar.call(this, view);
	this._setupViewMenu(view);
	this._setNewButtonProps(view, LmMsg.createNewContact, LmImg.I_CONTACT, LmImg.ID_CONTACT, LmOperation.NEW_CONTACT);
	this._toolbar[view].addFiller();
	var tb = new LmNavToolBar(this._toolbar[view], DwtControl.STATIC_STYLE, null, LmNavToolBar.SINGLE_ARROWS, true);
	this._setNavToolBar(tb);
}

LmContactListController.prototype._initializeActionMenu = 
function(view) {
	if (this._actionMenu) return;

	LmListController.prototype._initializeActionMenu.call(this);
	LmOperation.setOperation(this._actionMenu, LmOperation.CONTACT, LmOperation.EDIT_CONTACT);
}

// Load contacts into the given view and perform layout.
LmContactListController.prototype._setViewContents =
function(view) {
	this._listView[view].set(this._list);
}

// List listeners

// Double click displays a contact.
LmContactListController.prototype._listSelectionListener =
function(ev) {
	LmListController.prototype._listSelectionListener.call(this, ev);
	
	if (ev.detail == DwtListView.ITEM_SELECTED && 
		this._currentView == LmController.CONTACT_SIMPLE_VIEW)
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
LmContactListController.prototype._listActionListener =
function(ev) {
	LmListController.prototype._listActionListener.call(this, ev);
	this._actionEv.contact = ev.item;
	var email = ev.item.getAttr([LmContact.F_email]) || ev.item.getAttr([LmContact.F_email2]) || ev.item.getAttr([LmContact.F_email3]);
	this._actionEv.address = new LmEmailAddress(email);
	// enable/disable New Email menu item per valid email found for this contact
	var enableNewEmail = email != null && this._listView[this._currentView].getSelectionCount() == 1;
	this._actionMenu.enable([LmOperation.SEARCH, LmOperation.BROWSE, LmOperation.NEW_MESSAGE], enableNewEmail);
	this._setContactText(!this._isGalSearch);
	this._actionMenu.popup(0, ev.docX, ev.docY);
}

LmContactListController.prototype._editListener =
function(ev) {
	var contact = this._listView[this._currentView].getSelection()[0];
	this._app.getContactController().show(contact, false);
}

LmContactListController.prototype._changeListener = 
function(ev) {
	if (ev.type != LmEvent.S_SETTING) return;
	
	var setting = ev.source;
	if (setting.id == LmSetting.CONTACTS_PER_PAGE)
		this._isNewSearch = true; // mark flag for relayout
}

// Miscellaneous

LmContactListController.prototype._paginate =
function(view, bPageForward) {
	this._listView[view].paginate(this._list, bPageForward);
	this._resetNavToolBarButtons(view);
}

LmContactListController.prototype._doDelete = 
function(params) {
	LmListController.prototype._doDelete.call(this, params);
	// if more contacts to show, 
	var size = this._listView[this._currentView].getSelectedItems().size();
	if (size == 0) {
		// and if in split view allow split view to clear
		if (this._currentView == LmController.CONTACT_SIMPLE_VIEW)
			this._listView[this._currentView].parent.clear();

		this._resetOperations(this._toolbar[this._currentView], 0);
	}
}

LmContactListController.prototype._checkReplenish = 
function() {
	// lets not allow replenishment for contacts since they all get loaded at once
}

// Create menu for View button and add listeners.
LmContactListController.prototype._setupViewMenu =
function(view) {
	var appToolbar = this._appCtxt.getCurrentAppToolbar();
	var menu = appToolbar.getViewMenu(view);
	if (!menu) {
		var menu = new LmPopupMenu(appToolbar.getViewButton());
		for (var i = 0; i < LmContactListController.VIEWS.length; i++) {
			var id = LmContactListController.VIEWS[i];
			var mi = menu.createMenuItem(id, LmContactListController.ICON[id], LmMsg[LmContactListController.MSG_KEY[id]], null, true, DwtMenuItem.RADIO_STYLE);
			mi.setData(LmOperation.MENUITEM_ID, id);
			mi.addSelectionListener(this._listeners[LmOperation.VIEW]);
			if (id == view)
				mi.setChecked(true, true);
		}
		appToolbar.setViewMenu(view, menu);
	}
	return menu;
}

// Resets the available options on a toolbar or action menu.
LmContactListController.prototype._resetOperations = 
function(parent, num) {
	if (!this._isGalSearch) {
		LmListController.prototype._resetOperations.call(this, parent, num);
		parent.enable(LmOperation.EDIT, num==1);
	} else {
		// gal contacts cannot be tagged/moved/deleted
		parent.enableAll(false);
		parent.enable([LmOperation.SEARCH, LmOperation.BROWSE, LmOperation.NEW_MENU, LmOperation.VIEW], true);
		parent.enable([LmOperation.CONTACT, LmOperation.NEW_MESSAGE, LmOperation.PRINT], num>0);
	}
}

LmContactListController.prototype._resetNavToolBarButtons = 
function(view) {
	LmListController.prototype._resetNavToolBarButtons.call(this, view);
	
	var offset = this._listView[view].getOffset();
	this._navToolBar.enable(LmOperation.PAGE_BACK, offset > 0);
	
	var evenMore = this._list ? (offset + this._listView[view].getLimit()) < this._list.size() : false;
	this._navToolBar.enable(LmOperation.PAGE_FORWARD, evenMore);
	
	this._navToolBar.setToolTip(LmOperation.PAGE_BACK, LmMsg.previous + " " + LmMsg.page);
	this._navToolBar.setToolTip(LmOperation.PAGE_FORWARD, LmMsg.next + " " + LmMsg.page);

	this._showListRange(view);
}

LmContactListController.prototype._printListener = 
function(ev) {
	if (!this._printView)
		this._printView = new LmPrintView(this._appCtxt);
	
	this._printView.render(this._list);
}
