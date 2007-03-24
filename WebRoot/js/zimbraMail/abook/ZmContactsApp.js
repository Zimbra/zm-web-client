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
* Contact app object
* @constructor
* @class
* Description goes here
*
* @author Conrad Damon
* @param appCtxt			The singleton appCtxt object
* @param container			the element that contains everything but the banner (aka _composite)
* @param parentController	Reference to the parent "uber" controller - populated if this is a child window opened by the parent
*/
function ZmContactsApp(appCtxt, container, parentController) {

	ZmApp.call(this, ZmApp.CONTACTS, appCtxt, container, parentController);

	this._initialized = false;
};

// Organizer and item-related constants
ZmEvent.S_CONTACT				= "CONTACT";
ZmEvent.S_GROUP					= "GROUP";
ZmItem.CONTACT					= ZmEvent.S_CONTACT;
ZmItem.GROUP					= ZmEvent.S_GROUP;
ZmOrganizer.ADDRBOOK			= "ADDRBOOK";

// App-related constants
ZmApp.CONTACTS					= "Contacts";
ZmApp.CLASS[ZmApp.CONTACTS]		= "ZmContactsApp";
ZmApp.SETTING[ZmApp.CONTACTS]	= ZmSetting.CONTACTS_ENABLED;
ZmApp.LOAD_SORT[ZmApp.CONTACTS]	= 30;
ZmApp.QS_ARG[ZmApp.CONTACTS]	= "contacts";

// fields used for autocomplete matching
ZmContactsApp.AC_VALUE_FULL 	= "fullAddress";
ZmContactsApp.AC_VALUE_EMAIL	= "email";
ZmContactsApp.AC_VALUE_NAME		= "name";

ZmContactsApp.SEARCHFOR_CONTACTS 	= 1;
ZmContactsApp.SEARCHFOR_GAL 		= 2;
ZmContactsApp.SEARCHFOR_PAS			= 3; // PAS = personal and shared
ZmContactsApp.SEARCHFOR_MAX 		= 50;

ZmContactsApp.prototype = new ZmApp;
ZmContactsApp.prototype.constructor = ZmContactsApp;

ZmContactsApp.prototype.toString = 
function() {
	return "ZmContactsApp";
};

// Construction

ZmContactsApp.prototype._defineAPI =
function() {
	AjxDispatcher.setPackageLoadFunction("Contacts", new AjxCallback(this, this._postLoad, ZmOrganizer.ADDRBOOK));
	AjxDispatcher.registerMethod("GetContacts", "ContactsCore", new AjxCallback(this, this.getContactList));
	AjxDispatcher.registerMethod("GetContactListController", ["ContactsCore", "Contacts"], new AjxCallback(this, this.getContactListController));
	AjxDispatcher.registerMethod("GetContactController", ["ContactsCore", "Contacts"], new AjxCallback(this, this.getContactController));
};

ZmContactsApp.prototype._registerSettings =
function() {
	var settings = this._appCtxt.getSettings();
	settings.registerSetting("AUTO_ADD_ADDRESS",			{name: "zimbraPrefAutoAddAddressEnabled", type: ZmSetting.T_PREF, dataType: ZmSetting.D_BOOLEAN, defaultValue: false});
	settings.registerSetting("CONTACTS_PER_PAGE",			{name: "zimbraPrefContactsPerPage", type: ZmSetting.T_PREF, dataType: ZmSetting.D_INT, defaultValue: 25});
	settings.registerSetting("CONTACTS_VIEW",				{name: "zimbraPrefContactsInitialView", type: ZmSetting.T_PREF, defaultValue: ZmSetting.CV_LIST});
	settings.registerSetting("EXPORT",						{type: ZmSetting.T_PREF, dataType: ZmSetting.D_NONE});
	settings.registerSetting("GAL_AUTOCOMPLETE",			{name: "zimbraPrefGalAutoCompleteEnabled", type: ZmSetting.T_PREF, dataType: ZmSetting.D_BOOLEAN, defaultValue: false});
	settings.registerSetting("GAL_AUTOCOMPLETE_SESSION",	{type: ZmSetting.T_PREF, dataType: ZmSetting.D_BOOLEAN, defaultValue: true});
	settings.registerSetting("IMPORT",						{type: ZmSetting.T_PREF, dataType: ZmSetting.D_NONE});
	settings.registerSetting("MAX_CONTACTS",				{name: "zimbraContactMaxNumEntries", type: ZmSetting.T_COS, dataType: ZmSetting.D_INT, defaultValue: 0});
};

ZmContactsApp.prototype._registerPrefs =
function() {
	var list = [ZmSetting.AUTO_ADD_ADDRESS, ZmSetting.GAL_AUTOCOMPLETE,
				ZmSetting.GAL_AUTOCOMPLETE_SESSION,
				ZmSetting.CONTACTS_VIEW, ZmSetting.CONTACTS_PER_PAGE,
				ZmSetting.IMPORT, ZmSetting.EXPORT];

	ZmPref.setPrefList("ADDR_BOOK_PREFS", list);
	
	ZmPref.registerPref("AUTO_ADD_ADDRESS", {
		displayName:		ZmMsg.autoAddContacts,
		displayContainer:	ZmPref.TYPE_CHECKBOX
	});
	
	ZmPref.registerPref("CONTACTS_PER_PAGE", {
		displayName:		ZmMsg.contactsPerPage,
	 	displayContainer:	ZmPref.TYPE_SELECT,
		displayOptions:		["10", "25", "50", "100"],
		displaySeparator:	true
	});
	
	ZmPref.registerPref("CONTACTS_VIEW", {
		displayName:		ZmMsg.viewContacts,
	 	displayContainer:	ZmPref.TYPE_SELECT,
		displayOptions:		[ZmMsg.detailedCards, ZmMsg.contactList],
		options:			[ZmSetting.CV_CARDS, ZmSetting.CV_LIST]
	});

	ZmPref.registerPref("EXPORT", {
		displayName:		ZmMsg.exportToCSV,
		displayContainer:	ZmPref.TYPE_EXPORT,
		displaySeparator:	true
	});

	ZmPref.registerPref("GAL_AUTOCOMPLETE", {
		displayName:		ZmMsg.galAutocomplete,
		displayContainer:	ZmPref.TYPE_CHECKBOX,
		precondition:		ZmSetting.GAL_AUTOCOMPLETE_ENABLED
	});
	
	ZmPref.registerPref("GAL_AUTOCOMPLETE_SESSION", {
		displayName:		ZmMsg.galAutocompleteSession,
		displayContainer:	ZmPref.TYPE_CHECKBOX,
		precondition:		ZmSetting.GAL_AUTOCOMPLETE,
		displaySeparator:	true
	});
	
	ZmPref.registerPref("IMPORT", {
		displayName:		ZmMsg.importFromCSV,
		displayContainer:	ZmPref.TYPE_IMPORT,
		displaySeparator:	false
	});
};

ZmContactsApp.prototype._registerOperations =
function() {
	ZmOperation.registerOp("CONTACT");	// placeholder
	ZmOperation.registerOp("EDIT_CONTACT", {textKey:"AB_EDIT_CONTACT", image:"Edit"});
	ZmOperation.registerOp("MOUNT_ADDRBOOK", {textKey:"mountAddrBook", image:"ContactsFolder"}, ZmSetting.SHARING_ENABLED);
	ZmOperation.registerOp("NEW_ADDRBOOK", {textKey:"newAddrBook", tooltipKey:"newAddrBookTooltip", image:"NewContact"});
	ZmOperation.registerOp("NEW_CONTACT", {textKey:"newContact", tooltipKey:"newContactTooltip", image:"NewContact"});
	ZmOperation.registerOp("NEW_GROUP", {textKey:"newGroup", tooltipKey:"newGroupTooltip", image:"NewGroup"});
	ZmOperation.registerOp("PRINT_CONTACTLIST", {textKey:"printAddrBook", image:"Print"}, ZmSetting.PRINT_ENABLED);
	ZmOperation.registerOp("SHARE_ADDRBOOK", {textKey:"shareAddrBook", image:"SharedContactsFolder"}, ZmSetting.SHARING_ENABLED);
	ZmOperation.registerOp("SHOW_ONLY_CONTACTS", {textKey:"showOnlyContacts", image:"Contact"}, ZmSetting.MIXED_VIEW_ENABLED);
};

ZmContactsApp.prototype._registerItems =
function() {
	ZmItem.registerItem(ZmItem.CONTACT,
						{app:			ZmApp.CONTACTS,
						 nameKey:		"contact",
						 icon:			"Contact",
						 soapCmd:		"ContactAction",
						 itemClass:		"ZmContact",
						 node:			"cn",
						 organizer:		ZmOrganizer.ADDRBOOK,
						 searchType:	"contact",
						 resultsList:
		AjxCallback.simpleClosure(function(search) {
			AjxDispatcher.require("ContactsCore");
			return new ZmContactList(this._appCtxt, search, search ? search.isGalSearch : null);
		}, this)
						});

	ZmItem.registerItem(ZmItem.GROUP,
						{nameKey:	"group",
						 icon:		"Group",
						 soapCmd:	"ContactAction"
						});
};

ZmContactsApp.prototype._registerOrganizers =
function() {
	var orgColor = {};
	orgColor[ZmFolder.ID_AUTO_ADDED] = ZmOrganizer.C_YELLOW;
	
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
							 hasColor:			true,
							 defaultColor:		ZmOrganizer.C_GRAY,
							 orgColor:			orgColor,
							 views:				["contact"],
							 folderKey:			"addressBookFolder",
							 mountKey:			"mountAddrBook",
							 createFunc:		"ZmOrganizer.create",
							 compareFunc:		"ZmAddrBook.sortCompare",
							 deferrable:		true
							});
};

ZmContactsApp.prototype._setupSearchToolbar =
function() {
	ZmSearchToolBar.addMenuItem(ZmItem.CONTACT,
								{msgKey:		"searchContacts",
								 tooltipKey:	"searchPersonalContacts",
								 icon:			"SearchContacts"
								});

	ZmSearchToolBar.FOR_PAS_MI 	= "FOR PAS";
	ZmSearchToolBar.addMenuItem(ZmSearchToolBar.FOR_PAS_MI,
								{msgKey:		"searchPersonalAndShared",
								 tooltipKey:	"searchPersonalAndShared",
								 icon:			"SearchSharedContacts",
								 setting:		ZmSetting.SHARING_ENABLED
								});

	ZmSearchToolBar.FOR_GAL_MI 	= "FOR GAL";
	ZmSearchToolBar.addMenuItem(ZmSearchToolBar.FOR_GAL_MI,
								{msgKey:		"searchGALContacts",
								 tooltipKey:	"searchGALContacts",
								 icon:			"SearchGAL",
								 setting:		ZmSetting.GAL_ENABLED
								});
};

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
							  chooserTooltipKey:	"goToContacts",
							  viewTooltipKey:		"displayContacts",
							  defaultSearch:		ZmItem.CONTACT,
							  organizer:			ZmOrganizer.ADDRBOOK,
							  overviewTrees:		[ZmOrganizer.ADDRBOOK, ZmOrganizer.SEARCH, ZmOrganizer.TAG],
							  showZimlets:			true,
							  assistants:			{"ZmContactAssistant":"Contacts"},
							  searchTypes:			[ZmItem.CONTACT],
							  newItemOps:			newItemOps,
							  newOrgOps:			newOrgOps,
							  actionCodes:			actionCodes,
							  gotoActionCode:		ZmKeyMap.GOTO_CONTACTS,
							  newActionCode:		ZmKeyMap.NEW_CONTACT,
							  trashViewOp:			ZmOperation.SHOW_ONLY_CONTACTS,
							  chooserSort:			20,
							  defaultSort:			40
							  });
};


// App API

ZmContactsApp.prototype.startup =
function(result) {
	AjxDispatcher.run("GetContacts");
};

/**
 * Checks for the creation of an address book or a mount point to one. Regular
 * contact creates are handed to the canonical list.
 * 
 * @param list	[array]		list of create notifications
 */
ZmContactsApp.prototype.createNotify =
function(list, force) {
	if (!force && this._deferNotifications("create", list)) { return; }
	for (var i = 0; i < list.length; i++) {
		var create = list[i];
		var name = create._name;
		if (this._appCtxt.cacheGet(create.id)) { continue; }

		if (name == "folder") {
			this._handleCreateFolder(create, ZmOrganizer.ADDRBOOK);
		} else if (name == "link") {
			this._handleCreateLink(create, ZmOrganizer.ADDRBOOK);
		} else if (name == "cn") {
			DBG.println(AjxDebug.DBG1, "ZmContactsApp: handling CREATE for node: " + name);
			AjxDispatcher.run("GetContacts").notifyCreate(create);
			create._handled = true;
		}
	}
};

ZmContactsApp.prototype.handleOp =
function(op) {
	switch (op) {
		case ZmOperation.NEW_CONTACT:
		case ZmOperation.NEW_GROUP: {
			var type = (op == ZmOperation.NEW_GROUP) ? ZmItem.GROUP : null;
			var contact = new ZmContact(this._appCtxt, null, null, type);
			var loadCallback = new AjxCallback(this, this._handleLoadNewItem, [contact]);
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

ZmContactsApp.prototype._handleLoadNewItem =
function(contact) {
	AjxDispatcher.run("GetContactController").show(contact);
};

ZmContactsApp.prototype._handleLoadNewAddrBook =
function() {
	this._appCtxt.getAppViewMgr().popView(true, ZmController.LOADING_VIEW);	// pop "Loading..." page
	var dialog = this._appCtxt.getNewAddrBookDialog();
	if (!this._newAddrBookCb) {
		this._newAddrBookCb = new AjxCallback(this, this._newAddrBookCallback);
	}
	ZmController.showDialog(dialog, this._newAddrBookCb);
};

// Public methods

ZmContactsApp.prototype.launch =
function(callback) {
	var loadCallback = new AjxCallback(this, this._handleLoadLaunch, [callback]);
	AjxDispatcher.require(["ContactsCore", "Contacts"], false, loadCallback, null, true);
};

ZmContactsApp.prototype._handleLoadLaunch =
function(callback) {
	AjxDispatcher.run("GetContacts");	// contacts should already be loaded
	var clc = AjxDispatcher.run("GetContactListController");
	if (!this._initialized) {
		// set search toolbar field manually
		if (this._appCtxt.get(ZmSetting.SHOW_SEARCH_STRING)) {
			var folder = this._appCtxt.getById(ZmFolder.ID_CONTACTS);
			if (folder) {
				this.currentQuery = folder.createQuery();
			}
		}
		// create contact view for the first time
		clc.show(this._contactList, null, ZmOrganizer.ID_ADDRBOOK);
	} else {
		// just push the view so it looks the same as last you saw it
		clc.switchView(clc._getViewType(), true, this._initialized);
	}

	if (callback)
		callback.run();

	this._initialized = true;
};

ZmContactsApp.prototype.showSearchResults =
function(results, callback, isInGal, folderId) {
	var loadCallback = new AjxCallback(this, this._handleLoadShowSearchResults, [results, callback, isInGal, folderId]);
	AjxDispatcher.require("Contacts", false, loadCallback, null, true);
};

ZmContactsApp.prototype._handleLoadShowSearchResults =
function(results, callback, isInGal, folderId) {
	this.getContactListController().show(results, isInGal, folderId);
	if (callback) {
		callback.run();
	}
};

ZmContactsApp.prototype.showFolder = 
function(folder) {
	// we manually set search bar's field since contacts dont always make search requests
	if (this._appCtxt.get(ZmSetting.SHOW_SEARCH_STRING)) {
		var query = folder.createQuery();
		this._appCtxt.getSearchController().getSearchToolbar().setSearchFieldValue(query);
	}
	var clc = AjxDispatcher.run("GetContactListController");
	clc.show(this._contactList, null, folder.id);
};

ZmContactsApp.prototype.setActive =
function(active) {
	if (active) {
		var clc = AjxDispatcher.run("GetContactListController");
		clc.show();
	}
};

ZmContactsApp.prototype.getContactList =
function(callback, errorCallback) {
	if (!this._contactList) {
		try {
			// check if a parent controller exists and ask it for the contact list
			if (this._parentController) {
				this._contactList = this._parentController.getApp(ZmApp.CONTACTS).getContactList();
			} else {
				this._contactList = new ZmContactList(this._appCtxt);
				var respCallback = new AjxCallback(this, this._handleResponseGetContactList, callback);
				this._contactList.load(respCallback, errorCallback);
			}
			return this._contactList;
		} catch (ex) {
			this._contactList = null;
			throw ex;
		}
	} else {
		if (callback && callback.run) {
			callback.run(this._contactList);
		} else {
			return this._contactList;
		}
	}
};

ZmContactsApp.prototype._handleResponseGetContactList =
function(callback) {
	if (callback && callback.run) callback.run(this._contactList);
};

// NOTE: calling method should handle exceptions!
ZmContactsApp.prototype.getGalContactList =
function() {
	if (!this._galContactList) {
		try {
			this._galContactList = new ZmContactList(this._appCtxt, null, true);
			this._galContactList.load();
		} catch (ex) {
			this._galContactList = null;
			throw ex;
		}
	}
	return this._galContactList;
};

// returns array of all addrbooks (incl. shared but excl. root and Trash)
ZmContactsApp.prototype.getAddrbookList =
function() {
	var addrbookList = [];
	var folders = this._appCtxt.getFolderTree().asList();
	for (var i = 0; i < folders.length; i++) {
		if (folders[i].id == ZmFolder.ID_ROOT || folders[i].isInTrash())
			continue;
		addrbookList.push(folders[i].createQuery());
	}
	return addrbookList;
};

ZmContactsApp.prototype.createFromVCard =
function(msgId, vcardPartId) {
	var contact = new ZmContact(this._appCtxt);
	contact.createFromVCard(msgId, vcardPartId);
};

ZmContactsApp.prototype.getContactListController =
function() {
	if (!this._contactListController)
		this._contactListController = new ZmContactListController(this._appCtxt, this._container, this);
	return this._contactListController;
};

ZmContactsApp.prototype.getContactController =
function() {
	if (this._contactController == null)
		this._contactController = new ZmContactController(this._appCtxt, this._container, this);
	return this._contactController;
};

ZmContactsApp.prototype._newAddrBookCallback =
function(parent, name, color) {
	// REVISIT: Do we really want to close the dialog before we
	//          know if the create succeeds or fails?
	var dialog = this._appCtxt.getNewAddrBookDialog();
	dialog.popdown();

	var oc = this._appCtxt.getOverviewController();
	oc.getTreeController(ZmOrganizer.ADDRBOOK)._doCreate(parent, name, color);
};
