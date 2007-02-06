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

	AjxDispatcher.registerMethod("GetContacts", "ContactsCore", new AjxCallback(this, this.getContactList));
	AjxDispatcher.registerMethod("GetContactListController", ["ContactsCore", "Contacts"], new AjxCallback(this, this.getContactListController));
	AjxDispatcher.registerMethod("GetContactController", ["ContactsCore", "Contacts"], new AjxCallback(this, this.getContactController));

	ZmItem.registerItem(ZmItem.CONTACT,
						{app:			ZmApp.CONTACTS,
						 nameKey:		"contact",
						 icon:			"Contact",
						 soapCmd:		"ContactAction",
						 itemClass:		"ZmContact",
						 node:			"cn",
						 organizer:		ZmOrganizer.ADDRBOOK,
						 searchType:	"contact",
						 stbNameKey:	"searchContacts",
						 stbTooltipKey:	"searchPersonalContacts",
						 stbIcon:		"SearchContacts",
						 resultsList:
		AjxCallback.simpleClosure(function(search) {
			AjxDispatcher.require("ContactsCore");
			return new ZmContactList(this._appCtxt, search, false);
		}, this)
						});

	ZmItem.registerItem(ZmItem.GROUP,
						{nameKey:	"group",
						 icon:		"Group",
						 soapCmd:	"ContactAction"
						});

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
							 defaultColor:		ZmOrganizer.C_GRAY,
							 views:				["contact"],
							 folderKey:			"addressBookFolder",
							 mountKey:			"mountAddrBook",
							 createFunc:		"ZmOrganizer.create",
							 compareFunc:		"ZmAddrBook.sortCompare",
							 deferrable:		true
							});

	ZmApp.registerApp(ZmApp.CONTACTS,
							 {nameKey:				"addressBook",
							  icon:					"ContactsApp",
							  chooserTooltipKey:	"goToContacts",
							  viewTooltipKey:		"displayContacts",
							  defaultSearch:		ZmItem.CONTACT,
							  overviewTrees:		[ZmOrganizer.ADDRBOOK, ZmOrganizer.SEARCH, ZmOrganizer.TAG],
							  showZimlets:			true,
							  assistants:			{"ZmContactAssistant":"Contacts"},
							  searchTypes:			[ZmItem.CONTACT],
							  actionCode:			ZmKeyMap.GOTO_CONTACTS,
							  trashViewOp:			ZmOperation.SHOW_ONLY_CONTACTS,
							  chooserSort:			20,
							  defaultSort:			40
							  });

	ZmSearchToolBar.FOR_PAS_MI 	= "FOR PAS";
	ZmSearchToolBar.FOR_GAL_MI	= "FOR GAL";
	ZmSearchToolBar.SETTING[ZmSearchToolBar.FOR_PAS_MI]		= ZmSetting.SHARING_ENABLED;
	ZmSearchToolBar.SETTING[ZmSearchToolBar.FOR_GAL_MI]		= ZmSetting.GAL_ENABLED;
	ZmSearchToolBar.MSG_KEY[ZmSearchToolBar.FOR_PAS_MI]		= "searchPersonalAndShared";
	ZmSearchToolBar.MSG_KEY[ZmSearchToolBar.FOR_GAL_MI]		= "searchGALContacts";
	ZmSearchToolBar.TT_MSG_KEY[ZmSearchToolBar.FOR_PAS_MI]	= "searchPersonalAndShared";
	ZmSearchToolBar.TT_MSG_KEY[ZmSearchToolBar.FOR_GAL_MI]	= "searchGALContacts";
	ZmSearchToolBar.ICON[ZmSearchToolBar.FOR_PAS_MI]		= "SearchSharedContacts";
	ZmSearchToolBar.ICON[ZmSearchToolBar.FOR_GAL_MI]		= "SearchGAL";
	ZmSearchToolBar.MENU_ITEMS.push(ZmItem.CONTACT);
	ZmSearchToolBar.MENU_ITEMS.push(ZmSearchToolBar.FOR_PAS_MI);
	ZmSearchToolBar.MENU_ITEMS.push(ZmSearchToolBar.FOR_GAL_MI);

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

ZmContactsApp.prototype.startup =
function(result) {
	AjxDispatcher.run("GetContacts");
};

ZmContactsApp.prototype.createNotify =
function(list) {
	this._handleCreates(list);
};

ZmContactsApp.prototype.launch =
function(callback) {
	var loadCallback = new AjxCallback(this, this._handleLoadLaunch, [callback]);
	AjxDispatcher.require("Contacts", false, loadCallback, null, true);
};

ZmContactsApp.prototype._handleLoadLaunch =
function(callback) {
	this._createDeferredFolders();
	AjxDispatcher.run("GetContacts");	// contacts should already be loaded
	var clc = AjxDispatcher.run("GetContactListController");
	if (!this._initialized) {
		// set search toolbar field manually
		if (this._appCtxt.get(ZmSetting.SHOW_SEARCH_STRING)) {
			var folder = this._appCtxt.getTree(ZmOrganizer.ADDRBOOK).getById(ZmFolder.ID_CONTACTS);
			var stb = this._appCtxt.getSearchController().getSearchToolbar();
			stb.setSearchFieldValue(folder.createQuery());
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
	var folders = this._appCtxt.getTree(ZmOrganizer.ADDRBOOK).asList();
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

/**
 * Checks for the creation of an address book or a mount point to one. Regular
 * contact creates are handed to the canonical list.
 * 
 * @param list	[array]		list of create notifications
 */
ZmContactsApp.prototype._handleCreates =
function(list) {
	for (var i = 0; i < list.length; i++) {
		var create = list[i];
		var name = create._name;
		if (this._appCtxt.cacheGet(create.id)) { continue; }

		if (name == "folder") {
			var parentId = create.l;
			var parent;
			var addrBookTree = this._appCtxt.getTree(ZmOrganizer.ADDRBOOK);
			if (parentId == ZmOrganizer.ID_ROOT) {
				if (create.view == ZmOrganizer.VIEWS[ZmOrganizer.ADDRBOOK][0]) {
					parent = addrBookTree.getById(parentId);
				}
			} else {
				parent = addrBookTree.getById(parentId);
			}
			if (parent) {
				DBG.println(AjxDebug.DBG1, "ZmContactsApp: handling CREATE for node: " + name);
				parent.notifyCreate(create);
				create._handled = true;
			}
		} else if (name == "link") {
			var parentId = create.l;
			var parent, share;
			if (create.view == ZmOrganizer.VIEWS[ZmOrganizer.ADDRBOOK][0]) {
				var addrbookTree = this._appCtxt.getTree(ZmOrganizer.ADDRBOOK);
				parent = addrbookTree.getById(parentId);
				share = ZmOrganizer.ADDRBOOK;
			}
			if (parent) {
				DBG.println(AjxDebug.DBG1, "ZmContactsApp: handling CREATE for node: " + name);
				parent.notifyCreate(create, true);
				// XXX: once bug #4434 is fixed, check if this call is still needed
				this._appCtxt.getRequestMgr().getFolderPermissions([share]);
				create._handled = true;
			}
		} else if (name == "cn") {
			DBG.println(AjxDebug.DBG1, "ZmContactsApp: handling CREATE for node: " + name);
			AjxDispatcher.run("GetContacts").notifyCreate(create, true);
			create._handled = true;
		}
	}
};
