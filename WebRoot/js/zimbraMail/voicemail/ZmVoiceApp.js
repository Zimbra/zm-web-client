/*
 * ***** BEGIN LICENSE BLOCK *****
 * 
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2007 Zimbra, Inc.
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

ZmVoiceApp = function(container, parentController) {
	this.phones = [];
	this._nameToPhone = {};
	this.accordionItem = null; // Currently selected accordion item.
	this.soapInfo = {
		method: "SearchVoiceRequest",
		namespace: "urn:zimbraVoice",
		response: "SearchVoiceResponse",
		additional: null
	};

	this._storePrinciple = null;
	ZmApp.call(this, ZmApp.VOICE, container, parentController);
}

// Organizer and item-related constants
ZmEvent.S_VOICEMAIL				= "VOICEMAIL";
ZmItem.VOICEMAIL				= ZmEvent.S_VOICEMAIL;
ZmEvent.S_CALL					= "CALL";
ZmItem.CALL						= ZmEvent.S_CALL;
ZmOrganizer.VOICE				= ZmEvent.S_VOICEMAIL;

// App-related constants
ZmApp.VOICE							= "Voice";
ZmApp.CLASS[ZmApp.VOICE]			= "ZmVoiceApp";
ZmApp.SETTING[ZmApp.VOICE]			= ZmSetting.VOICE_ENABLED;
ZmApp.UPSELL_SETTING[ZmApp.VOICE]	= ZmSetting.VOICE_UPSELL_ENABLED;
ZmApp.LOAD_SORT[ZmApp.VOICE]		= 80;
ZmApp.QS_ARG[ZmApp.VOICE]			= "voice";

ZmVoiceApp.prototype = new ZmApp;
ZmVoiceApp.prototype.constructor = ZmVoiceApp;

ZmVoiceApp.prototype.toString = 
function() {
	return "ZmVoiceApp";
}

// Construction

ZmVoiceApp.prototype._defineAPI =
function() {
	AjxDispatcher.setPackageLoadFunction("Voicemail", new AjxCallback(this, this._postLoadCore));
	AjxDispatcher.registerMethod("GetVoiceController", "Voicemail", new AjxCallback(this, this.getVoiceController));
	AjxDispatcher.registerMethod("GetCallListController", "Voicemail", new AjxCallback(this, this.getCallListController));
	AjxDispatcher.registerMethod("GetVoicePrefsController", ["PreferencesCore", "Preferences", "Voicemail"], new AjxCallback(this, this.GetVoicePrefsController));
};

ZmVoiceApp.prototype._registerItems =
function() {
	ZmItem.registerItem(ZmItem.VOICEMAIL,
						{app:			ZmApp.VOICE,
						 nameKey:		"voicemail",
						 icon:			"Voicemail",
						 soapCmd:		"VoiceMsgAction",
						 itemClass:		"ZmVoicemail",
						 node:			"vm",
						 organizer:		ZmOrganizer.VOICE,
						 dropTargets:	[ZmOrganizer.VOICE],
						 searchType:	"voicemail",
						 resultsList:	AjxCallback.simpleClosure(function(search) {
											AjxDispatcher.require("Voicemail");
											return new ZmVoiceList(ZmItem.VOICEMAIL, search);
										}, this)

						});
	ZmItem.registerItem(ZmItem.CALL,
						{app:			ZmApp.VOICE,
						 nameKey:		"call",
						 icon:			"Voicemail",
						 soapCmd:		"VoiceMsgAction",
						 itemClass:		"ZmCall",
						 node:			"cl",
						 organizer:		ZmOrganizer.VOICE,
						 searchType:	"calllog",
						 resultsList:	AjxCallback.simpleClosure(function(search) {
											AjxDispatcher.require("Voicemail");
											return new ZmVoiceList(ZmItem.CALL, search);
										}, this)
						});
};

ZmVoiceApp.prototype._registerOperations =
function() {
	ZmOperation.registerOp("CHECK_VOICEMAIL", {textKey:"checkVoicemail", tooltipKey:"checkVoicemailTooltip"});
	ZmOperation.registerOp("CHECK_CALLS", {textKey:"checkCalls", tooltipKey:"checkCallsTooltip"});
	ZmOperation.registerOp("CALL_MANAGER", {textKey:"callManager", tooltipKey:"callManagerTooltip", image:"CallManager"});
	ZmOperation.registerOp("MARK_HEARD", {textKey:"markAsHeard", image:"MarkAsHeard"});
	ZmOperation.registerOp("MARK_UNHEARD", {textKey:"markAsUnheard", image:"MarkAsUnheard"});
	ZmOperation.registerOp("VIEW_BY_DATE", {textKey:"viewByDate"});
	ZmOperation.registerOp("REPLY_BY_EMAIL", {textKey:"replyByEmail", tooltipKey:"replyByEmailTooltip", image:"Reply"});
	ZmOperation.registerOp("FORWARD_BY_EMAIL", {textKey:"forwardByEmail", tooltipKey:"forwardByEmailTooltip", image:"Forward"});
	ZmOperation.registerOp("DOWNLOAD_VOICEMAIL", {textKey: "downloadVoicemail", tooltipKey:"downloadVoicemailTooltip", image:"Save"});
};

ZmVoiceApp.prototype._registerOrganizers =
function() {
	ZmOrganizer.registerOrg(ZmOrganizer.VOICE,
							{app:				ZmApp.VOICE,
							 nameKey:			"voicemailFolder",
							 defaultFolder:		0,
							 firstUserId:		256,
							 orgClass:			"ZmVoiceFolder",
							 orgPackage:		"VoicemailCore",
							 treeController:	"ZmVoiceTreeController",
							 labelKey:			"voicemail",
							 itemsKey:			"messages",
							 views:				["voicemail"],
							 createFunc:		"ZmOrganizer.create",
							 compareFunc:		"ZmVoiceFolder.sortCompare",
							 deferrable:		false
							});
};

ZmVoiceApp.prototype._registerApp =
function() {
	ZmApp.registerApp(ZmApp.VOICE,
							 {mainPkg:				"Voicemail",
							  nameKey:				"voice",
							  icon:					"VoicemailApp",
							  qsArg:				"voicemail",
							  chooserTooltipKey:	"goToVoice",
							  defaultSearch:		ZmSearchToolBar.FOR_MAIL_MI,
							  overviewTrees:		[ZmOrganizer.VOICE],
							  showZimlets:			true,
							  searchTypes:			[ZmItem.VOICEMAIL],
							  gotoActionCode:		ZmKeyMap.GOTO_VOICE,
							  chooserSort:			15,
							  defaultSort:			15,
							  upsellUrl:			ZmSetting.VOICE_UPSELL_URL
							  });
};

ZmVoiceApp.prototype._registerPrefs = function() {
    var sections = {
        VOICE: {
            title: ZmMsg.callManager,
            templateId: "prefs.Pages#Voice",
            priority: 40,
            precondition: ZmSetting.VOICE_ENABLED,
            prefs: [
                ZmSetting.VOICE_ACCOUNTS 
            ],
            manageDirty: true,
            createView: function(parent, section, controller) {
                return AjxDispatcher.run("GetVoicePrefsController").getListView();
            }
        }
    };
    for (var id in sections) {
        ZmPref.registerPrefSection(id, sections[id]);
    }
};

ZmVoiceApp.prototype._registerSettings =
function(settings) {
	settings = settings || appCtxt.getSettings();
	settings.registerSetting("VOICE_PAGE_SIZE", {name:"zimbraPrefVoiceItemsPerPage", type:ZmSetting.T_PREF, dataType:ZmSetting.D_INT, defaultValue:25});
};

// Public methods

ZmVoiceApp.prototype.deleteNotify =
function(ids) {
	this._handleDeletes(ids);
};

ZmVoiceApp.prototype.createNotify =
function(creates) {
	this._handleCreates(creates);
};

ZmVoiceApp.prototype.modifyNotify =
function(modifies) {
	this._handleModifies(modifies);
};

ZmVoiceApp.prototype.getOverviewPanelContent =
function() {
	if (this._overviewPanelContent) {
		return this._overviewPanelContent;
	}

	// create accordion
	var accordionId = this._name;
	var opc = appCtxt.getOverviewController();
	var params = {accordionId:accordionId};
	this._overviewPanelContent = opc.createAccordion(params);
	this._overviewPanelContent.addSelectionListener(new AjxListener(this, this._accordionSelectionListener));

	if (!this.phones.length) {
		// GetVoiceInfo hasn't been called yet.
		var currentApp = appCtxt.getCurrentApp();
		this.getVoiceInfo(new AjxCallback(this, this._handleResponseGetOverviewPanelContent, [currentApp]));
	} else {
		this._createAccordionItems();
	}
	return this._overviewPanelContent;
};


ZmVoiceApp.prototype._handleResponseGetOverviewPanelContent =
function(currentApp) {
	this._createAccordionItems();
};

ZmVoiceApp.prototype.getOverviewId =
function() {
	var name = this.accordionItem ? this.accordionItem.data.phone.name : "";
	return [this.getOverviewPanelContentId(), name].join(":");
};

ZmVoiceApp.prototype.getVoiceInfo =
function(callback, errorCallback, noBusyOverlay) {
	if (!this.phones.length) {
		if (!this._gettingVoiceInfo) {
			var soapDoc = AjxSoapDoc.create("GetVoiceInfoRequest", "urn:zimbraVoice");
			var respCallback = new AjxCallback(this, this._handleResponseVoiceInfo);
			var respErrorCallback = new AjxCallback(this, this._handleErrorResponseVoiceInfo);
			var params = {
				soapDoc: soapDoc,
				asyncMode: true,
				noBusyOverlay: noBusyOverlay,
				callback: respCallback,
				errorCallback: respErrorCallback
			};
			appCtxt.getAppController().sendRequest(params);
			this._gettingVoiceInfo = true;
		}
		if (callback) {
			this._voiceInfoCallbacks = this._voiceInfoCallbacks || [];
			this._voiceInfoCallbacks.push(callback);
		}
		if (errorCallback) {
			this._voiceInfoErrorCallbacks = this._voiceInfoErrorCallbacks || [];
			this._voiceInfoErrorCallbacks.push(errorCallback);
		}
	} else if (callback) {
		callback.run();
	}
};

ZmVoiceApp.prototype._handleResponseVoiceInfo =
function(response) {
	var callback = new AjxCallback(this, this._handleResponseVoiceInfo2, [response]);
	AjxPackage.require({ name: "Voicemail", callback: callback });
};

ZmVoiceApp.prototype._handleResponseVoiceInfo2 =
function(response) {
	var voiceInfo = response._data.GetVoiceInfoResponse;
	var storePrinciple = voiceInfo.storeprincipal[0];
	this._storePrinciple = { name: storePrinciple.name, id: storePrinciple.id };
	this.soapInfo.additional = { storeprinciple: this._storePrinciple };
	var phones = voiceInfo.phone;
	for (var i = 0, count = phones.length; i < count; i++) {
		var obj = phones[i];
		var phone = new ZmPhone();
		phone._loadFromDom(obj);
		this.phones.push(phone);
		this._nameToPhone[phone.name] = phone;

		if (obj.folder && obj.folder.length) {
			phone.folderTree = new ZmVoiceFolderTree();
			phone.folderTree.loadFromJs(obj.folder[0], phone);
		}
	}
	if (this._voiceInfoCallbacks) {
		for (i = 0, count = this._voiceInfoCallbacks.length; i < count; i++) {
			this._voiceInfoCallbacks[i].run(response);
		}
	}
	this._voiceInfoCallbacks = null;
	this._voiceInfoErrorCallbacks = null;
	this._gettingVoiceInfo = false;
};

ZmVoiceApp.prototype._handleErrorResponseVoiceInfo =
function(response) {
	var returnValue = false;
	if (this._voiceInfoErrorCallbacks) {
		for (var i = 0, count = this._voiceInfoErrorCallbacks.length; i < count; i++) {
			returnValue = this._voiceInfoErrorCallbacks[i].run(response) || returnValue;
		}
	}
	this._voiceInfoCallbacks = null;
	this._voiceInfoErrorCallbacks = null;
	this._gettingVoiceInfo = false;
	return returnValue;
};

ZmVoiceApp.prototype.refreshFolders =
function(callback, errorCallback) {
	if (this.phones.length) {
	    var soapDoc = AjxSoapDoc.create("GetVoiceFolderRequest", "urn:zimbraVoice");
		this.setStorePrincipal(soapDoc);
		var respCallback = new AjxCallback(this, this._handleResponseUpdateFolders, [callback]);
	    var params = {
	    	soapDoc: soapDoc,
	    	asyncMode: true,
			callback: respCallback,
			errorCallback: errorCallback
		};
		appCtxt.getAppController().sendRequest(params);
	} else if (callback) {
		callback.run();
	}
};

ZmVoiceApp.prototype._handleResponseUpdateFolders =
function(callback, response) {
	var phones = response._data.GetVoiceFolderResponse.phone;
	for (var i = 0, count = phones.length; i < count; i++) {
		var obj = phones[i]; 
		var phone = this._nameToPhone[obj.name];
		if (phone) {
			this._updateFolders(phone, obj.folder[0].folder);
		}
	}
	if (callback) {
		callback.run();
	}
};

ZmVoiceApp.prototype._updateFolders =
function(phone, foldersObj) {
	var folderTree = phone.folderTree;
	for (var i = 0, count = foldersObj.length; i < count; i++) {
		var folderObj = foldersObj[i];
		var folder = folderTree.getByName(folderObj.name);
		if (folder) {
			folder.notifyModify(folderObj);
		}
	}
};

ZmVoiceApp.prototype._createAccordionItems =
function() {
	for (var i = 0; i < this.phones.length; i++) {
		var data = {lastFolder:null, appName:this._name};
		var phone = this.phones[i];
		data.phone = phone;
		var item = this._overviewPanelContent.addAccordionItem({title:phone.getDisplay(), data:data});
		if (i == 0) {
			this._activateAccordionItem(item);
		}
	}
};

ZmVoiceApp.prototype._accordionSelectionListener =
function(ev) {
	var accordionItem = ev.detail;
	if (accordionItem == this.accordionItem) { return; }
	if (accordionItem.data.appName != this._name) { return; }

	// Save most recent search.
	if (this.accordionItem) {
		var folder = appCtxt.getCurrentController().getFolder();
		if (folder && folder.phone == this.accordionItem.data.phone) {
			this.accordionItem.data.lastFolder = folder;
		}
	}

	// Run new search inside of accordion item.
	this.accordionItem = accordionItem;
	var folder = this.accordionItem.data.lastFolder;
	var phone = this.accordionItem.data.phone;
	if (!folder) {
		folder = ZmVoiceFolder.get(phone, ZmVoiceFolder.VOICEMAIL_ID);
	}
	if (folder) {
		// Highlight the folder.
		var overview = this._opc.getOverview(this.getOverviewId());
		if (overview) {
			var treeView = overview.getTreeView(ZmOrganizer.VOICE);
			var treeItem = treeView.getTreeItemById(folder.id);
			treeView.setSelection(treeItem, true);
		}
		
		// Run search.
		this.search(folder);
	}
	this._activateAccordionItem(accordionItem);
};

ZmVoiceApp.prototype.search =
function(folder, callback, sortBy) {
	if (!sortBy) {
		var viewType = (folder.getSearchType() == ZmItem.VOICEMAIL) ? ZmController.VOICEMAIL_VIEW : ZmController.CALLLIST_VIEW;
		sortBy = appCtxt.get(ZmSetting.SORTING_PREF, viewType);
	}
	var searchParams = {
		soapInfo: this.soapInfo,
		types: AjxVector.fromArray([folder.getSearchType()]),
		sortBy: sortBy,
		query: folder.getSearchQuery(),
		limit: appCtxt.get(ZmSetting.VOICE_PAGE_SIZE)
	};
	var search = new ZmSearch(searchParams);	
	var responseCallback = new AjxCallback(this, this._handleResponseSearch, [folder, callback]);
	search.execute({ callback: responseCallback });
};

ZmVoiceApp.prototype._handleResponseSearch =
function(folder, callback, response) {
	var searchResult = response._data;
	var list = searchResult.getResults(folder.getSearchType());
	list.folder = folder;
	var voiceController;
	if (folder.getSearchType() == ZmItem.VOICEMAIL) {
		voiceController = AjxDispatcher.run("GetVoiceController");
	} else {
		voiceController = AjxDispatcher.run("GetCallListController");
	}
	voiceController.show(searchResult, folder);

	// Update numUnread & numUnheard in folder.
	var folderInfo = searchResult.getAttribute("vfi");
	if (folderInfo) {
		folder.notifyModify(folderInfo[0]);
	}

	if (callback) {
		callback.run(searchResult);
	}
};

ZmVoiceApp.prototype.markItemsHeard =
function(items, heard, callback) {
	var op = heard ? "read" : "!read";
	this._performAction(items, op, null, callback);
};

ZmVoiceApp.prototype._performAction =
function(items, op, attributes, callback) {
	if (!items.length) {
		if (callback) {
			callback.run(items);
		}
		return;
	}
	var ids = [];	
    for (var i = 0, count = items.length; i < count; i++) {
    	ids[i] = items[i].id;
    }
    var soapDoc = AjxSoapDoc.create("VoiceMsgActionRequest", "urn:zimbraVoice");
	this.setStorePrincipal(soapDoc);
	var node = soapDoc.set("action");
    node.setAttribute("op", op);
    node.setAttribute("id", ids.join(","));
    node.setAttribute("phone", items[0].getPhone().name);
    for (var i in attributes) {
	    node.setAttribute(i, attributes[i]); 
	}
    var params = {
    	soapDoc: soapDoc, 
    	asyncMode: true,
		callback: callback
	};
	appCtxt.getAppController().sendRequest(params);
};

ZmVoiceApp.prototype.launch =
function(params, callback) {
	var loadCallback = new AjxCallback(this, this._handleLoadLaunch, [callback]);
	AjxDispatcher.require("Voicemail", true, loadCallback, null, true);
};

ZmVoiceApp.prototype._handleLoadLaunch =
function(callback) {
    var respCallback = new AjxCallback(this, this._handleResponseLoadLaunchGotInfo, callback);
    this.getVoiceInfo(respCallback);
};

ZmVoiceApp.prototype._handleResponseLoadLaunchGotInfo =
function(callback, response) {
	var startFolder = this.getStartFolder();
	if (startFolder) {
		this.search(startFolder, callback);
	} else if (callback) {
		callback.run();
	}
};

ZmVoiceApp.prototype.getStartFolder =
function(name) {
	var which = 0;
	if (name) {
		for (var i = 0; i < this.phones.length; i++) {
			var phone = this.phones[i];
			if (phone.name == name) {
				which = i;
			}
		}
	}
	return this.phones[which].folderTree.getByName(ZmVoiceFolder.VOICEMAIL);
};

ZmVoiceApp.prototype.getVoiceController =
function() {
	if (!this._voiceController) {
		this._voiceController = new ZmVoicemailListController(this._container, this);
	}
	return this._voiceController;
};

ZmVoiceApp.prototype.getCallListController =
function() {
	if (!this._callListController) {
		this._callListController = new ZmCallListController(this._container, this);
	}
	return this._callListController;
};

ZmVoiceApp.prototype.GetVoicePrefsController =
function() {
	if (!this._voicePrefsController) {
        var prefsView = AjxDispatcher.run("GetPrefController").getPrefsView();
        var prefsApp = appCtxt.getApp(ZmApp.PREFERENCES);
        this._voicePrefsController = new ZmVoicePrefsController(this._container, prefsApp, prefsView);
	}
	return this._voicePrefsController;
};

ZmVoiceApp.prototype.setStorePrincipal =
function(soapDoc) {
	var node = soapDoc.set("storeprincipal");
	node.setAttribute("id", this._storePrinciple.id);
	node.setAttribute("name", this._storePrinciple.name);
};

ZmVoiceApp.prototype.redoSearch =
function() {
	var view = appCtxt.getAppViewMgr().getAppView(ZmApp.VOICE);
	if (view) {
		var controller;
		if (view == ZmController.VOICEMAIL_VIEW) {
			controller = AjxDispatcher.run("GetVoiceController");
		} else if (view == ZmController.CALLLIST_VIEW) {
			controller = AjxDispatcher.run("GetCallListController");
		}
		if (controller) {
			this.search(controller.getFolder());
		}
	}
};

ZmVoiceApp.prototype._handleDeletes =
function(ids) {
};

ZmVoiceApp.prototype._handleCreates =
function(creates) {
};

ZmVoiceApp.prototype._handleModifies =
function(list) {
};

