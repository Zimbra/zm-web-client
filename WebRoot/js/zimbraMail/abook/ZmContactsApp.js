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
 * This file contains the contacts application class.
 */

/**
 * Creates and initializes the contacts application.
 * @class
 * The contacts app manages the creation and display of contacts, which are grouped
 * into address books.
 * 
 * @param	{DwtControl}	container		the container
 * @param	{ZmController}	parentController	the parent controller
 * 
 * @author Conrad Damon
 * 
 * @extends		ZmApp
 */
ZmContactsApp = function(container, parentController) {

	ZmApp.call(this, ZmApp.CONTACTS, container, parentController);

	this.contactsLoaded = {};
	this._contactList = {};		// canonical list by acct ID
	this._initialized = false;

	// contact lookup caches
	this._byEmail	= {};
	this._byIM		= {};
	this._byPhone	= {};

	// cache fetched distribution lists
	this._dlCache	= {};
};

// Organizer and item-related constants
ZmEvent.S_CONTACT				= ZmId.ITEM_CONTACT;
ZmEvent.S_GROUP					= ZmId.ITEM_GROUP;
ZmItem.CONTACT					= ZmEvent.S_CONTACT;
ZmItem.GROUP					= ZmEvent.S_GROUP;
/**
 * Defines the "address book" organizer.
 */
ZmOrganizer.ADDRBOOK			= ZmId.ORG_ADDRBOOK;

// App-related constants
/**
 * Defines the "address book" application.
 */
ZmApp.CONTACTS							= ZmId.APP_CONTACTS;
ZmApp.CLASS[ZmApp.CONTACTS]				= "ZmContactsApp";
ZmApp.SETTING[ZmApp.CONTACTS]			= ZmSetting.CONTACTS_ENABLED;
ZmApp.UPSELL_SETTING[ZmApp.CONTACTS]	= ZmSetting.CONTACTS_UPSELL_ENABLED;
ZmApp.LOAD_SORT[ZmApp.CONTACTS]			= 30;
ZmApp.QS_ARG[ZmApp.CONTACTS]			= "contacts";

// search menu
ZmContactsApp.SEARCHFOR_CONTACTS 	= 1;
ZmContactsApp.SEARCHFOR_GAL 		= 2;
ZmContactsApp.SEARCHFOR_PAS			= 3; // PAS = personal and shared
ZmContactsApp.SEARCHFOR_FOLDERS		= 4;

ZmContactsApp.SEARCHFOR_MAX 		= 50;

ZmContactsApp.prototype = new ZmApp;
ZmContactsApp.prototype.constructor = ZmContactsApp;

/**
 * Returns a string representation of the object.
 * 
 * @return		{String}		a string representation of the object
 */
ZmContactsApp.prototype.toString = 
function() {
	return "ZmContactsApp";
};

// Construction

/**
 * @private
 */
ZmContactsApp.prototype._defineAPI =
function() {
	AjxDispatcher.setPackageLoadFunction("ContactsCore", new AjxCallback(this, this._postLoadCore));
	AjxDispatcher.setPackageLoadFunction("Contacts", new AjxCallback(this, this._postLoad, ZmOrganizer.ADDRBOOK));
	AjxDispatcher.registerMethod("GetContacts", "ContactsCore", new AjxCallback(this, this.getContactList));
	AjxDispatcher.registerMethod("GetContactsForAllAccounts", "ContactsCore", new AjxCallback(this, this.getContactListForAllAccounts));
	AjxDispatcher.registerMethod("GetContactListController", ["ContactsCore", "Contacts"], new AjxCallback(this, this.getContactListController));
	AjxDispatcher.registerMethod("GetContactController", ["ContactsCore", "Contacts"], new AjxCallback(this, this.getContactController));
};

/**
 * @private
 */
ZmContactsApp.prototype._registerSettings =
function(settings) {
	var settings = settings || appCtxt.getSettings();
	settings.registerSetting("AUTO_ADD_ADDRESS",				{name: "zimbraPrefAutoAddAddressEnabled", type: ZmSetting.T_PREF, dataType: ZmSetting.D_BOOLEAN, defaultValue: false, isGlobal:true});
	settings.registerSetting("AUTOCOMPLETE_LIMIT",				{name: "zimbraContactAutoCompleteMaxResults", type:ZmSetting.T_COS, dataType:ZmSetting.D_INT, defaultValue:20});
	settings.registerSetting("AUTOCOMPLETE_NO_GROUP_MATCH",		{name: "zimbraPrefContactsDisableAutocompleteOnContactGroupMembers", type:ZmSetting.T_PREF, dataType:ZmSetting.D_BOOLEAN, defaultValue:false});
	settings.registerSetting("AUTOCOMPLETE_ON_COMMA",			{name: "zimbraPrefAutoCompleteQuickCompletionOnComma", type:ZmSetting.T_PREF, dataType:ZmSetting.D_BOOLEAN, defaultValue:true});
	settings.registerSetting("AUTOCOMPLETE_SHARE",				{name: "zimbraPrefShareContactsInAutoComplete", type:ZmSetting.T_PREF, dataType:ZmSetting.D_BOOLEAN, defaultValue:false});
	settings.registerSetting("AUTOCOMPLETE_SHARED_ADDR_BOOKS",	{name: "zimbraPrefSharedAddrBookAutoCompleteEnabled", type: ZmSetting.T_PREF, dataType: ZmSetting.D_BOOLEAN, defaultValue: false});
	settings.registerSetting("EXPORT",							{type: ZmSetting.T_PREF, dataType: ZmSetting.D_NONE});
	settings.registerSetting("GAL_AUTOCOMPLETE",				{name: "zimbraPrefGalAutoCompleteEnabled", type: ZmSetting.T_PREF, dataType: ZmSetting.D_BOOLEAN, defaultValue: false});
	settings.registerSetting("IMPORT",							{type: ZmSetting.T_PREF, dataType: ZmSetting.D_NONE});
	settings.registerSetting("MAX_CONTACTS",					{name: "zimbraContactMaxNumEntries", type: ZmSetting.T_COS, dataType: ZmSetting.D_INT, defaultValue: 0});
	settings.registerSetting("NEW_ADDR_BOOK_ENABLED",			{name: "zimbraFeatureNewAddrBookEnabled", type:ZmSetting.T_COS, dataType:ZmSetting.D_BOOLEAN, defaultValue:true});
};

/**
 * @private
 */
ZmContactsApp.prototype._registerPrefs =
function() {
	var sections = {
		CONTACTS: {
			title: ZmMsg.addressBook,
			icon: "ContactsApp",
			templateId: "prefs.Pages#Contacts",
			priority: 70,
			precondition: ZmSetting.CONTACTS_ENABLED,
			prefs: [
				ZmSetting.AUTO_ADD_ADDRESS,
				ZmSetting.AUTOCOMPLETE_NO_GROUP_MATCH,
				ZmSetting.AUTOCOMPLETE_ON_COMMA,
				ZmSetting.AUTOCOMPLETE_SHARE,
				ZmSetting.AUTOCOMPLETE_SHARED_ADDR_BOOKS,
				ZmSetting.EXPORT,
				ZmSetting.GAL_AUTOCOMPLETE,
				ZmSetting.INITIALLY_SEARCH_GAL,
				ZmSetting.IMPORT
			]
		}
	};
	for (var id in sections) {
		ZmPref.registerPrefSection(id, sections[id]);
	}

	ZmPref.registerPref("AUTO_ADD_ADDRESS", {
		displayName:		ZmMsg.autoAddContacts,
		displayContainer:	ZmPref.TYPE_CHECKBOX
	});

	ZmPref.registerPref("AUTOCOMPLETE_NO_GROUP_MATCH", {
		displayName:		ZmMsg.autocompleteNoGroupMatch,
		displayContainer:	ZmPref.TYPE_CHECKBOX
	});

	ZmPref.registerPref("AUTOCOMPLETE_ON_COMMA", {
		displayName:		ZmMsg.autocompleteOnComma,
		displayContainer:	ZmPref.TYPE_CHECKBOX
	});

	ZmPref.registerPref("AUTOCOMPLETE_SHARE", {
		displayName:		ZmMsg.autocompleteShare,
		displayContainer:	ZmPref.TYPE_CHECKBOX
	});

	ZmPref.registerPref("AUTOCOMPLETE_SHARED_ADDR_BOOKS", {
		displayName:		ZmMsg.autocompleteSharedAddrBooks,
		displayContainer:	ZmPref.TYPE_CHECKBOX
	});

	ZmPref.registerPref("EXPORT", {
		loadFunction:		ZmPref.loadCsvFormats,
		displayContainer:	ZmPref.TYPE_EXPORT
	});

	ZmPref.registerPref("GAL_AUTOCOMPLETE", {
		displayName:		ZmMsg.galAutocomplete,
		displayContainer:	ZmPref.TYPE_CHECKBOX,
		precondition:
			function() {
				return appCtxt.get(ZmSetting.GAL_AUTOCOMPLETE_ENABLED) &&
					   appCtxt.get(ZmSetting.GAL_ENABLED);
			}
	});

	ZmPref.registerPref("IMPORT", {
		displayName:		ZmMsg.importFromCSV,
		displayContainer:	ZmPref.TYPE_IMPORT
	});

	ZmPref.registerPref("INITIALLY_SEARCH_GAL", {
		displayName:		ZmMsg.initiallySearchGal,
		displayContainer:	ZmPref.TYPE_CHECKBOX,
		precondition:
			function() {
				return appCtxt.get(ZmSetting.GAL_ENABLED) &&
					   appCtxt.getActiveAccount().isZimbraAccount;
			}
	});
};

/**
 * @private
 */
ZmContactsApp.prototype._registerOperations =
function() {
	ZmOperation.registerOp(ZmId.OP_CONTACT);	// placeholder
	ZmOperation.registerOp(ZmId.OP_EDIT_CONTACT, {textKey:"AB_EDIT_CONTACT", image:"Edit", shortcut:ZmKeyMap.EDIT});
	ZmOperation.registerOp(ZmId.OP_MOUNT_ADDRBOOK, {textKey:"mountAddrBook", image:"ContactsFolder"});
	ZmOperation.registerOp(ZmId.OP_NEW_ADDRBOOK, {textKey:"newAddrBook", tooltipKey:"newAddrBookTooltip", image:"NewContactsFolder"}, ZmSetting.NEW_ADDR_BOOK_ENABLED);
	ZmOperation.registerOp(ZmId.OP_NEW_CONTACT, {textKey:"newContact", tooltipKey:"newContactTooltip", image:"NewContact", shortcut:ZmKeyMap.NEW_CONTACT}, ZmSetting.CONTACTS_ENABLED);
	ZmOperation.registerOp(ZmId.OP_NEW_GROUP, {textKey:"newGroup", tooltipKey:"newGroupTooltip", image:"NewGroup"}, ZmSetting.CONTACTS_ENABLED);
	ZmOperation.registerOp(ZmId.OP_PRINT_CONTACT, {textKey:"printContact", image:"Print", shortcut:ZmKeyMap.PRINT}, ZmSetting.PRINT_ENABLED);
	ZmOperation.registerOp(ZmId.OP_PRINT_ADDRBOOK, {textKey:"printAddrBook", image:"Print"}, ZmSetting.PRINT_ENABLED);
	ZmOperation.registerOp(ZmId.OP_SHARE_ADDRBOOK, {textKey:"shareAddrBook", image:"SharedContactsFolder"});
	ZmOperation.registerOp(ZmId.OP_SHOW_ONLY_CONTACTS, {textKey:"showOnlyContacts", image:"Contact"}, ZmSetting.MIXED_VIEW_ENABLED);
};

/**
 * @private
 */
ZmContactsApp.prototype._registerItems =
function() {
	ZmItem.registerItem(ZmItem.CONTACT,
						{app:			ZmApp.CONTACTS,
						 nameKey:		"contact",
						 countKey:  	"typeContact",
						 icon:			"Contact",
						 soapCmd:		"ContactAction",
						 itemClass:		"ZmContact",
						 node:			"cn",
						 organizer:		ZmOrganizer.ADDRBOOK,
						 dropTargets:	[ZmOrganizer.TAG, ZmOrganizer.ZIMLET, ZmOrganizer.ADDRBOOK],
						 searchType:	"contact",
						 resultsList:
		AjxCallback.simpleClosure(function(search) {
			AjxDispatcher.require("ContactsCore");
			return new ZmContactList(search, search ? search.isGalSearch || search.isGalAutocompleteSearch : null);
		}, this)
						});

	ZmItem.registerItem(ZmItem.GROUP,
						{nameKey:	"group",
						 countKey:	"typeContactGroup",
						 icon:		"Group",
						 soapCmd:	"ContactAction"
						});
};

/**
 * @private
 */
ZmContactsApp.prototype._registerOrganizers =
function() {
	var orgColor = {};
//	orgColor[ZmFolder.ID_AUTO_ADDED] = ZmOrganizer.C_YELLOW;
	
	ZmOrganizer.registerOrg(ZmOrganizer.ADDRBOOK,
							{app:				ZmApp.CONTACTS,
							 nameKey:			"addressBook",
							 defaultFolder:		ZmOrganizer.ID_ADDRBOOK,
							 soapCmd:			"FolderAction",
							 firstUserId:		256,
							 orgClass:			"ZmAddrBook",
							 orgPackage:		"ContactsCore",
							 treeController:	"ZmAddrBookTreeController",
							 labelKey:			"addressBooks",
							 itemsKey:			"contacts",
							 hasColor:			true,
							 defaultColor:		ZmOrganizer.C_NONE,
							 orgColor:			orgColor,
							 treeType:			ZmOrganizer.FOLDER,
							 dropTargets:		[ZmOrganizer.ADDRBOOK],
							 views:				["contact"],
							 folderKey:			"addressBook",
							 mountKey:			"mountAddrBook",
							 createFunc:		"ZmOrganizer.create",
							 compareFunc:		"ZmAddrBook.sortCompare",
							 displayOrder:		100,
							 newOp:             ZmOperation.NEW_ADDRBOOK,
							 deferrable:		true
							});
};

/**
 * @private
 */
ZmContactsApp.prototype._setupSearchToolbar =
function() {
	ZmSearchToolBar.addMenuItem(ZmItem.CONTACT,
								{msgKey:		"searchContacts",
								 tooltipKey:	"searchPersonalContacts",
								 icon:			"ContactsFolder",
								 shareIcon:		"SharedContactsFolder",
								 id:			ZmId.getMenuItemId(ZmId.SEARCH, ZmId.ITEM_CONTACT)
								});

	ZmSearchToolBar.addMenuItem(ZmId.SEARCH_GAL,
								{msgKey:		"searchGALContacts",
								 tooltipKey:	"searchGALContacts",
								 icon:			"GAL",
								 setting:		ZmSetting.GAL_ENABLED,
								 id:			ZmId.getMenuItemId(ZmId.SEARCH, ZmId.SEARCH_GAL)
								});
};

/**
 * @private
 */
ZmContactsApp.prototype._registerApp =
function() {
	var newItemOps = {};
	newItemOps[ZmOperation.NEW_CONTACT]	= "contact";
	newItemOps[ZmOperation.NEW_GROUP]	= "group";

	var newOrgOps = {};
	newOrgOps[ZmOperation.NEW_ADDRBOOK] = "addressBook";

	var actionCodes = {};
	actionCodes[ZmKeyMap.NEW_CONTACT] = ZmOperation.NEW_CONTACT;

	ZmApp.registerApp(ZmApp.CONTACTS,
							 {mainPkg:				"Contacts",
							  nameKey:				"addressBook",
							  icon:					"ContactsApp",
							  textPrecedence:		40,
							  chooserTooltipKey:	"goToContacts",
							  viewTooltipKey:		"displayContacts",
							  defaultSearch:		ZmItem.CONTACT,
							  organizer:			ZmOrganizer.ADDRBOOK,
							  overviewTrees:		[ZmOrganizer.ADDRBOOK, ZmOrganizer.SEARCH, ZmOrganizer.TAG],
							  assistants:			{"ZmContactAssistant":["ContactsCore", "Contacts"]},
							  searchTypes:			[ZmItem.CONTACT],
							  newItemOps:			newItemOps,
							  newOrgOps:			newOrgOps,
							  actionCodes:			actionCodes,
							  gotoActionCode:		ZmKeyMap.GOTO_CONTACTS,
							  newActionCode:		ZmKeyMap.NEW_CONTACT,
							  trashViewOp:			ZmOperation.SHOW_ONLY_CONTACTS,
							  chooserSort:			20,
							  defaultSort:			40,
							  upsellUrl:			ZmSetting.CONTACTS_UPSELL_URL
							  });
};


// App API

/**
 * Checks for the creation of an address book or a mount point to one. Regular
 * contact creates are handed to the canonical list.
 * 
 * @param {Hash}	creates	a hash of create notifications
 * 
 * @private
 */
ZmContactsApp.prototype.createNotify =
function(creates, force) {
	if (!creates["folder"] && !creates["cn"] && !creates["link"]) { return; }
	if (!force && !this._noDefer && this._deferNotifications("create", creates)) { return; }

	for (var name in creates) {
		var list = creates[name];
		if (list && list.length) {
			for (var i = 0; i < list.length; i++) {
				var create = list[i];
				if (appCtxt.cacheGet(create.id)) { continue; }

				if (name == "folder") {
					this._handleCreateFolder(create, ZmOrganizer.ADDRBOOK);
				} else if (name == "link") {
					this._handleCreateLink(create, ZmOrganizer.ADDRBOOK);
				} else if (name == "cn") {
					var clc = AjxDispatcher.run("GetContactListController");
					var clcList = (clc && clc.getFolderId()) ? clc.getList() : new ZmContactList(null);
					if (appCtxt.multiAccounts && clcList.search && clcList.search.folderId != create.l) {
						continue;
					}
					clcList.notifyCreate(create);
					var context = window.parentAppCtxt || window.appCtxt;
					context.clearAutocompleteCache(ZmAutocomplete.AC_TYPE_CONTACT);
					create._handled = true;
				}
			}
		}
	}
};

ZmContactsApp.prototype.modifyNotify =
function(modifies, force) {
	if (!modifies["cn"]) { return; }
	if (!force && !this._noDefer && this._deferNotifications("modify", modifies)) { return; }

	this._batchNotify(modifies["cn"]);
};

/**
 * @private
 */
ZmContactsApp.prototype.postNotify =
function(notify) {
	if (this._checkReplenishListView) {
		this._checkReplenishListView._checkReplenish();
		this._checkReplenishListView = null;
	}
};

/**
 * @private
 */
ZmContactsApp.prototype.handleOp =
function(op) {
	switch (op) {
		case ZmOperation.NEW_CONTACT:
		case ZmOperation.NEW_GROUP: {
			var type = (op == ZmOperation.NEW_GROUP) ? ZmItem.GROUP : null;
			var loadCallback = new AjxCallback(this, this._handleLoadNewItem, [type]);
			AjxDispatcher.require(["ContactsCore", "Contacts"], false, loadCallback, null, true);
			break;
		}
		case ZmOperation.NEW_ADDRBOOK: {
			var loadCallback = new AjxCallback(this, this._handleLoadNewAddrBook);
			AjxDispatcher.require(["ContactsCore", "Contacts"], false, loadCallback, null, true);
			break;
		}
	}
};

/**
 * @private
 */
ZmContactsApp.prototype._handleLoadNewItem =
function(type) {
	var contact = new ZmContact(null, null, type);
	AjxDispatcher.run("GetContactController").show(contact);
};

/**
 * @private
 */
ZmContactsApp.prototype._handleLoadNewAddrBook =
function() {
	appCtxt.getAppViewMgr().popView(true, ZmId.VIEW_LOADING);	// pop "Loading..." page
	var dialog = appCtxt.getNewAddrBookDialog();
	if (!this._newAddrBookCb) {
		this._newAddrBookCb = new AjxCallback(this, this._newAddrBookCallback);
	}
	ZmController.showDialog(dialog, this._newAddrBookCb);
};

// Public methods

/**
 * Activates the application.
 * 
 * @param	{Object}	active 	(not used)
 * 
 */
ZmContactsApp.prototype.activate =
function(active) {
	ZmApp.prototype.activate.apply(this, arguments);
};

/**
 * Launches the application.
 * 
 * @param	{Object}	params		(not used)
 * @param	{AjxCallback}	callback	the callback
 */
ZmContactsApp.prototype.launch =
function(params, callback) {
	this._contactsSearch("in:contacts", callback);
};

/**
 * @private
 */
ZmContactsApp.prototype._contactsSearch =
function(query, callback) {
	var params = {
		searchFor:	ZmId.ITEM_CONTACT,
		query:		query,
		limit:		this.getLimit(),
		types:		[ZmId.ITEM_CONTACT],
		callback:	callback
	};
	var sc = appCtxt.getSearchController();
	sc.searchAllAccounts = false;
	sc.search(params);
};

/**
 * Gets the limit for the search triggered by the application launch or an overview click.
 * 
 * @param	{Boolean}	offset	if <code>true</code> app has offset
 * @return	{int}	the limit
 */
ZmContactsApp.prototype.getLimit =
function(offset) {
	// return enough for us to get a scroll bar since we are pageless
	var limit = appCtxt.get(ZmSetting.PAGE_SIZE);
	return offset ? limit : 2 * limit;
};

/**
 * Gets the initial search type.
 * 
 * @return	{constant}	the search (see {@link ZmId}<code>.SEARCH_</code> constants)
 */
ZmContactsApp.prototype.getInitialSearchType =
function() {
	var list = appCtxt.getCurrentList();
	return (list && (list instanceof ZmContactList) && list.isGal)
		? ZmId.SEARCH_GAL : null;
};

/**
 * Shows the search results.
 * 
 * @param	{Object}	results	the results
 * @param	{AjxCallback}	callback		the callback
 */
ZmContactsApp.prototype.showSearchResults =
function(results, callback) {
	var loadCallback = new AjxCallback(this, this._handleLoadShowSearchResults, [results, callback]);
	AjxDispatcher.require("Contacts", false, loadCallback, null, true);
};

/**
 * @private
 */
ZmContactsApp.prototype._handleLoadShowSearchResults =
function(results, callback) {
	var search = results && results.search;
	var folderId = search && search.singleTerm && search.folderId;
	var isInGal = search && (search.contactSource == ZmId.SEARCH_GAL);
	this.getContactListController().show(results, isInGal, folderId);
	if (callback) {
		callback.run();
	}
};

/**
 * Sets the app as active.
 * 
 * @param	{Boolean}	active	if <code>true</code> active and shows application
 */
ZmContactsApp.prototype.setActive =
function(active) {
	if (active) {
		var clc = AjxDispatcher.run("GetContactListController");
		clc.show();
	}
};

/**
 * Checks if the contact list is loaded for the specified account.
 * 
 * @param	{String}	acctId	the account id
 * @return	{Boolean}	<code>true</code> if contact list is loaded
 */
ZmContactsApp.prototype.isContactListLoaded =
function(acctId) {
	var aid = (acctId || appCtxt.getActiveAccount().id);
	return (this._contactList[aid] && this._contactList[aid].isLoaded);
};

/**
 * Gets the contact with the given address, if any. If it's not in our cache
 * and we are given a callback, we do a search. If a search is performed then any
 * addresses in the Address Lookup Group are also searched for.
 *
 * @param {String}	address			an email address
 * @param {AjxCallback}	callback	the callback to run
 * @return	{ZmContact}	the contact
 * 
 * @see		#setAddrLookupGroup
 */
ZmContactsApp.prototype.getContactByEmail =
function(address, callback) {
	if (!address) { return null; }
	var addr = address.toLowerCase();
	var contact = this._byEmail[addr];

	// if we have a failed search for this address, or have loaded all contacts,
	// don't bother doing a search
	if (!contact && this._notFound(addr)) {
		this._removeAddrFromLookupGroup(addr);
		if (callback) { callback.run(null); }
		return null;
	}

	// found a cached contact, return it
	if (contact) {
		this._removeAddrFromLookupGroup(addr);
		contact = this._realizeContact(contact);
		contact._lookupEmail = address;	// so caller knows which address matched
		if (callback) { callback.run(contact); }
		return contact;
	}

	// search for contact
	if (callback) {
		var search = null,
			isGroupSearch = false,
			lookupAddrs = [];
		if (this._addrLookupHash && this._addrLookupHash[addr]) {
			if (this._addrLookupList) {
				for (var i = 0; i < this._addrLookupList.length; i++) {
					lookupAddrs.push(this._addrLookupList[i]);
				}
				search = this._getSearchForAddresses(this._addrLookupList);
				isGroupSearch = true;
				this._addrLookupList = null;
			}
			this._addrLookupHash[addr].push(callback);
		} else {
			search = this._getSearchForAddresses([address]);
		}

		if (search) {
			var respCallback = new AjxCallback(this, this._handleResponseSearch, [isGroupSearch ? lookupAddrs : addr, isGroupSearch, callback]);
			search.execute({callback:respCallback, noBusyOverlay:true});
		}
	}
};

/**
 * @private
 */
ZmContactsApp.prototype._handleResponseSearch =
function(addr, isGroupSearch, callback, result) {
	var resp = result.getResponse();
	var contactList = resp && resp.getResults(ZmItem.CONTACT);
	if (isGroupSearch) {
		var list = contactList.getArray();
		for (var i = 0; i < list.length; i++) {
			this._updateLookupCache(list[i]);
		}
		for (var i = 0; i < addr.length; i++) {
			var a = addr[i];
			if (!this._byEmail[a]) {
				this._updateLookupCache(null, a); // Make sure there's a null entry in the map for the address.	
			}
			var callbacks = this._addrLookupHash[a];
			if (callbacks && callbacks.length) {
				for (var j = 0; j < callbacks.length; j++) {
					callbacks[j].run(this._byEmail[a]);
				}
			}
			this._removeAddrFromLookupGroup(a);
		}
	} else {
		var contact = contactList ? contactList.get(0) : null;	// return null if not found
		this._updateLookupCache(contact, addr);
		this._byEmail[addr] = contact;
		callback.run(contact);
	}
};

/**
 * Gets the contacts with the given addresses, if any. If there are addresses not in our cache
 * and we are given a callback, we do a search. Unlike {@link #getContactByEmail}, this method does not
 * use or modify the Address Lookup Group.
 *
 * @param {Array}	addresses	an array of {@link AjxEmailAddress} objects
 * @param {AjxCallback}	callback	the callback to run
 * @return	{Array}	an array of [{@link AjxEmailAddress}, {@link ZmContact}] pairs.
 * 
 * @see		#setAddrLookupGroup
 */
ZmContactsApp.prototype.getContactsByEmails =
function(addresses, callback) {
	// Go through the addresses, separating known ones from unknown.
	var resultArray = [],
		searchAddresses = null,
		searchAddressStrings = null;
	for (var i = 0, count = addresses.length; i < count; i++) {
		var address = addresses[i];
		var contact = this.getContactByEmail(address.getAddress());
		if (contact || contact === null) {
			resultArray.push({ address: address, contact: contact });
		} else {
			searchAddresses = searchAddresses || [];
			searchAddressStrings = searchAddressStrings || [];
			searchAddresses.push(address);
			searchAddressStrings.push(address.getAddress());
		}
	}

	// See if we can exit without performing a search.
	if (!callback) {
		return resultArray;
	}
	if (!searchAddresses) {
		callback.run(resultArray);
		return resultArray;
	}

	// Perform the search.
	var search = this._getSearchForAddresses(searchAddressStrings);
	var respCallback = new AjxCallback(this, this._handleResponseSearchByEmails, [searchAddresses, resultArray, callback]);
	search.execute({callback:respCallback});
};

/**
 * @private
 */
ZmContactsApp.prototype._handleResponseSearchByEmails =
function(addresses, resultArray, callback, result) {
	// get contact list
	var resp = result.getResponse();
	var list = resp && resp.getResults(ZmItem.CONTACT);
	if (!list) callback.run(resultArray);

	// get contact emails
	for (var index = 0, count = list.size(); index < count; index++) {
		var contact = list.get(index);
		for (var i = 1; true; i++) {
			var aname = ZmContact.getAttributeName(ZmContact.F_email, i);
			var avalue = contact.getAttr(aname);
			if (!avalue) break;
			this._byEmail[avalue] = contact;
		}
	}

	// Fill in the results.
	for (var i = 0, count = addresses.length; i < count; i++) {
		var address = addresses[i];
		var contact = this.getContactByEmail(address.getAddress());
		resultArray.push({ address: address, contact: contact });
	}
	callback.run(resultArray);
};

/**
 * @private
 */
ZmContactsApp.prototype._getSearchForAddresses =
function(addrs) {
	var buffer;
	if (addrs.length == 1) {
		buffer = ["to:", addrs[0], " not #type:group"];
	} else {
		buffer = ["("];
		for (var i = 0, count = addrs.length; i < count; i++) {
			if (i > 0) {
				buffer.push(" OR ");
			}
			buffer.push("to:");
			buffer.push(addrs[i]);
		}
		buffer.push(") not #type:group");
	}
	var params = {
		query: buffer.join(""),
		limit: addrs.length * 2,
		types: AjxVector.fromArray([ZmItem.CONTACT])
	};
	return new ZmSearch(params);
};

ZmContactsApp.prototype._notFound =
function(contact) {
	return (contact === null || Boolean(this._contactList[appCtxt.getActiveAccount().id]));
};

/**
 * Sets up a list of email addresses to use to find their contacts with a single search. The addresses passed
 * in can either be raw email addresses (strings), or {@link AjxEmailAddress} objects. A list of the addresses is kept
 * so that it can later be used to create a single search query. Each address will also keep track of the
 * callbacks that will need to be run with its search result (it's a list of callbacks since the same address
 * may be used in more than one context).
 * <p>
 * One example of this group approach is in rendering a message header, where each email address in the header
 * is rendered based on whether it maps to a contact. The group approach lets us do a single search rather than
 * several.
 * </p>
 *
 * @param {Array}	addrs		a list of email addresses to look up
 */
ZmContactsApp.prototype.setAddrLookupGroup =
function(addrs) {
	this._addrLookupList = [];
	this._addrLookupHash = {};
	if (addrs && addrs.length) {
		for (var i = 0; i < addrs.length; i++) {
			if (addrs[i]) {
				var addr = addrs[i].address || addrs[i];
				addr = (addr && AjxUtil.isString(addr)) ? addr.toLowerCase() : null;
				if (addr && !this._addrLookupHash[addr]) {
					this._addrLookupList.push(addr);
					this._addrLookupHash[addr] = [];
				}
			}
		}
	}
};

/**
 * @private
 */
ZmContactsApp.prototype._removeAddrFromLookupGroup =
function(addr) {
	if (!(this._addrLookupList && this._addrLookupList.length)) { return; }
	AjxUtil.arrayRemove(this._addrLookupList, addr);
	delete this._addrLookupHash[addr];
};

/**
 * @private
 */
ZmContactsApp.prototype._updateLookupCache =
function(contact, addr) {
	if (addr) {
		this._byEmail[addr] = contact;
	}
	if (contact) {
		for (var i = 1; true; i++) {
			var aname = ZmContact.getAttributeName(ZmContact.F_email, i);
			var avalue = contact.getAttr(aname);
			if (!avalue) break;
			this._byEmail[avalue.toLowerCase()] = contact;
		}
	}
};

/**
 * Gets the contact by IM address.
 * 
 * @param	{String}	addr	the IM address
 * @return	{ZmContact}	the contact
 */
ZmContactsApp.prototype.getContactByIMAddress =
function(addr) {
	if (!addr) { return null; }
	var contact = this._byIM[addr.toLowerCase()];
	return this._realizeContact(contact);
};

/**
 * Gets information about the contact with the given phone number, if any.
 * Canonical list only.
 *
 * @param {String}	phone	the phone number
 * @return	{Object}	an object with contact = the contact & field = the field with the matching phone number
 */
ZmContactsApp.prototype.getContactByPhone =
function(phone) {
	if (!phone) { return null; }
	var digits = phone.replace(/[^\d]/g, '');
	var data = this._phoneToContact[digits];
	if (data) {
		data.contact = this._realizeContact(data.contact);
	}
	return data;
};

/**
 * @private
 */
ZmContactsApp.prototype._realizeContact =
function(contact) {
	var acctId = appCtxt.getActiveAccount().id;
	var cl = this._contactList[acctId];
	return cl ? cl._realizeContact(contact) : contact;
};

/**
 * @private
 */
ZmContactsApp.prototype.updateCache =
function(contact, doAdd) {

	this._updateHash(contact, doAdd, ZmContact.EMAIL_FIELDS, this._byEmail);
	if (appCtxt.get(ZmSetting.VOICE_ENABLED)) {
		this._updateHash(contact, doAdd, ZmContact.PHONE_FIELDS, this._byPhone, true, true);
	}
	if (appCtxt.get(ZmSetting.IM_ENABLED)) {
		this._updateHash(contact, doAdd, ZmContact.IM_FIELDS, this._byIM);
	}
};

/**
 * @private
 */
ZmContactsApp.prototype._updateHash =
function(contact, doAdd, fields, hash, includeField, isNumeric) {

	for (var index = 0; index < fields.length; index++) {
		var field = fields[index];
		for (var i = 1; true; i++) {
			var aname = ZmContact.getAttributeName(field, i);
			var avalue = ZmContact.getAttr(contact, aname);
			if (!avalue) break;
			avalue = isNumeric ? avalue.replace(/[^\d]/g, '') : avalue.toLowerCase();
			if (doAdd) {
				hash[avalue] = includeField ? {contact:contact, field:aname} : contact;
			} else {
				delete hash[avalue];
			}
		}
	}
};

/**
 * Used in multi-account to load contacts for all of user's accounts.
 * 
 * @private
 */
ZmContactsApp.prototype.getContactListForAllAccounts =
function() {
	var enabled = [];
	var list = appCtxt.accountList.visibleAccounts;
	for (var i = 0; i < list.length; i++) {
		if (appCtxt.get(ZmSetting.CONTACTS_ENABLED, null, list[i])) {
			enabled.push(list[i]);
		}
	}

	if (enabled.length > 0) {
		this._loadContactsForAccount(enabled);
	}
};

/**
 * @private
 */
ZmContactsApp.prototype._loadContactsForAccount =
function(accounts) {
	var acct = accounts.shift();
	if (acct) {
		var callback = new AjxCallback(this, this._loadContactsForAccount, [accounts]);
		this.getContactList(callback, null, acct);
	}
};

/**
 * Gets a {@link ZmContactList} with all of the user's local contacts. If that's a
 * large number, performance may be slow.
 * 
 * @param {AjxCallback}	callback			the callback to trigger after contact list loaded
 * @param {AjxCallback}	errorCallback		the callback to trigger in the event of an error
 * @param {ZmZimbraAccount}	account		the account to fetch contacts for
 * @return	{ZmContactList}	the contact list
 */
ZmContactsApp.prototype.getContactList =
function(callback, errorCallback, account) {
	var acctId = (account && account.id) || appCtxt.getActiveAccount().id;
	if (!this._contactList[acctId]) {
		try {
			// check if a parent controller exists and ask it for the contact list
			if (this._parentController) {
				this._contactList[acctId] = this._parentController.getApp(ZmApp.CONTACTS).getContactList();
			} else {
				this._contactList[acctId] = new ZmContactList(null);
				var respCallback = new AjxCallback(this, this._handleResponseGetContactList, [callback]);
				var accountName = (account && account.getEmail());
				this._contactList[acctId].load(respCallback, errorCallback, accountName);
			}
			return this._contactList[acctId];
		} catch (ex) {
			this._contactList[acctId] = null;
			throw ex;
		}
	} else {
		if (callback && callback.run) {
			callback.run(this._contactList[acctId]);
		}
		return this._contactList[acctId];
	}
};

/**
 * @private
 */
ZmContactsApp.prototype._handleResponseGetContactList =
function(callback) {
	var acctId = appCtxt.getActiveAccount().id;
	this.contactsLoaded[acctId] = true;

	if (callback && callback.run) {
		callback.run(this._contactList[acctId]);
	}
};

/**
 * Gets the GAL contact list. NOTE: calling method should handle exceptions.
 * 
 * @return	{ZmContactList}	the contact list
 */
ZmContactsApp.prototype.getGalContactList =
function() {
	if (!this._galContactList) {
		try {
			this._galContactList = new ZmContactList(null, true);
			this._galContactList.load();
		} catch (ex) {
			this._galContactList = null;
			throw ex;
		}
	}
	return this._galContactList;
};

/**
 * @private
 */
ZmContactsApp.prototype.createFromVCard =
function(msgId, vcardPartId) {
	var contact = new ZmContact(null);
	contact.createFromVCard(msgId, vcardPartId);
};

/**
 * Gets the contact list controller.
 * 
 * @return	{ZmContactListController}	the controller
 */
ZmContactsApp.prototype.getContactListController =
function() {
	if (!this._contactListController) {
		this._contactListController = new ZmContactListController(this._container, this);
	}
	return this._contactListController;
};

/**
 * Gets the contact controller.
 * 
 * @return	{ZmContactController}	the controller
 */
ZmContactsApp.prototype.getContactController =
function() {
	AjxDispatcher.require(["ContactsCore", "Contacts"]);

	if (this._contactController == null) {
		this._contactController = new ZmContactController(this._container, this);
	}
	return this._contactController;
};

/**
 * @private
 */
ZmContactsApp.prototype._newAddrBookCallback =
function(parent, name, color) {
	// REVISIT: Do we really want to close the dialog before we
	//          know if the create succeeds or fails?
	var dialog = appCtxt.getNewAddrBookDialog();
	dialog.popdown();

	var oc = appCtxt.getOverviewController();
	oc.getTreeController(ZmOrganizer.ADDRBOOK)._doCreate(parent, name, color);
};

ZmContactsApp.prototype.getDL =
function(addr) {
	return this._dlCache[addr];
};

ZmContactsApp.prototype.cacheDL =
function(addr, dl) {
	this._dlCache[addr] = dl;
};
