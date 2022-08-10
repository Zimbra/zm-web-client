/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2016 Synacor, Inc.
 *
 * The contents of this file are subject to the Common Public Attribution License Version 1.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at: https://www.zimbra.com/license
 * The License is based on the Mozilla Public License Version 1.1 but Sections 14 and 15
 * have been added to cover use of software over a computer network and provide for limited attribution
 * for the Original Developer. In addition, Exhibit A has been modified to be consistent with Exhibit B.
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * See the License for the specific language governing rights and limitations under the License.
 * The Original Code is Zimbra Open Source Web Client.
 * The Initial Developer of the Original Code is Zimbra, Inc.  All rights to the Original Code were
 * transferred by Zimbra, Inc. to Synacor, Inc. on September 14, 2015.
 *
 * All portions of the code are Copyright (C) 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2016 Synacor, Inc. All Rights Reserved.
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

	this._storeprincipal = null;
	ZmApp.call(this, ZmApp.VOICE, container, parentController);
};

// Organizer and item-related constants
ZmEvent.S_VOICEMAIL				= ZmId.APP_VOICE;
ZmItem.VOICEMAIL				= ZmId.ITEM_VOICEMAIL;
ZmEvent.S_CALL					= ZmId.ITEM_CALL;
ZmItem.CALL						= ZmEvent.S_CALL;
ZmOrganizer.VOICE				= ZmEvent.S_VOICEMAIL;

// App-related constants
ZmApp.VOICE							= "Voice";
ZmApp.CLASS[ZmApp.VOICE]			= "ZmVoiceApp";
ZmApp.SETTING[ZmApp.VOICE]			= ZmSetting.VOICE_ENABLED;
ZmApp.UPSELL_SETTING[ZmApp.VOICE]	= ZmSetting.VOICE_UPSELL_ENABLED;
ZmApp.LOAD_SORT[ZmApp.VOICE]		= 80;
ZmApp.QS_ARG[ZmApp.VOICE]			= "voice";

ZmVoiceApp.overviewFallbackApp		= ZmApp.PORTAL;

ZmVoiceApp.prototype = new ZmApp;
ZmVoiceApp.prototype.constructor = ZmVoiceApp;

ZmVoiceApp.prototype.isZmVoiceApp = true;
ZmVoiceApp.prototype.toString = function() { return "ZmVoiceApp"; };


//voice mail formats
ZmVoiceApp.AUDIO_MP3_FORMAT = "audio/mpeg";
ZmVoiceApp.AUDIO_WAV_FORMAT = "audio/wav";

ZmVoiceApp.ERROR_CODE_AUTH = "voice.UNABLE_TO_AUTH"

//default
ZmVoiceApp.audioType =  ZmVoiceApp.AUDIO_MP3_FORMAT;

//Indicates if Voice items can be moved to Trash-folder
ZmVoiceApp.hasTrashFolder = false;


// Construction

ZmVoiceApp.prototype._defineAPI =
function() {
	AjxDispatcher.setPackageLoadFunction("Voicemail", new AjxCallback(this, this._postLoadCore));
	AjxDispatcher.registerMethod("GetVoiceController", "Voicemail", new AjxCallback(this, this.getVoiceController));
	AjxDispatcher.registerMethod("GetCallListController", "Voicemail", new AjxCallback(this, this.getCallListController));
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
	ZmOperation.registerOp(ZmId.OP_CALL_BACK, {textKey:"callBack", image:"CallManager", tooltipKey:"callBackTooltip"});
	ZmOperation.registerOp(ZmId.OP_MARK_HEARD, {textKey:"markAsHeard", image:"MarkAsHeard", shortcut:ZmKeyMap.MARK_HEARD});
	ZmOperation.registerOp(ZmId.OP_MARK_UNHEARD, {textKey:"markAsUnheard", image:"MarkAsUnheard", shortcut:ZmKeyMap.MARK_UNHEARD});
	ZmOperation.registerOp(ZmId.OP_VIEW_BY_DATE, {textKey:"viewByDate"});
	ZmOperation.registerOp(ZmId.OP_REPLY_BY_EMAIL, {textKey:"replyByEmail", tooltipKey:"replyByEmailTooltip", image:"Reply"});
	ZmOperation.registerOp(ZmId.OP_FORWARD_BY_EMAIL, {textKey:"forwardByEmail", tooltipKey:"forwardByEmailTooltip", image:"Forward"});
	ZmOperation.registerOp(ZmId.OP_DOWNLOAD_VOICEMAIL, {textKey: "downloadVoicemail", tooltipKey:"downloadVoicemailTooltip", image:"Save"});
	ZmOperation.registerOp(ZmId.OP_NEW_CALL, {textKey: "newCall", tooltipKey:"newCallTooltip",  shortcut:ZmKeyMap.NEW_CALL, image: "PlacedCalls"});

};

ZmVoiceApp.prototype._registerOrganizers =
function() {
	ZmOrganizer.registerOrg(ZmOrganizer.VOICE,
							{app:				ZmApp.VOICE,
							 nameKey:			"voicemailFolder",
							 defaultFolder:		0,
							 firstUserId:		256,
							 orgClass:			"ZmVoiceFolder",
							 orgPackage:		"Voicemail",
							 treeController:	"ZmVoiceTreeController",
							 labelKey:			"voicemail",
							 itemsKey:			"messages",
							 views:				["voicemail"],
							 createFunc:		"ZmOrganizer.create",
							 compareFunc:		"ZmVoiceFolder.sortCompare",
							 displayOrder:		100,
							 deferrable:		false
							});
};

ZmVoiceApp.prototype._registerApp =
function() {
	var newItemOps = {};
	newItemOps[ZmOperation.NEW_CALL] = "call";
	ZmApp.registerApp(ZmApp.VOICE,
							 {mainPkg:				"Voicemail",
							  nameKey:				"voice",
							  icon:					"VoicemailApp",
							  qsArg:				"voicemail",
							  chooserTooltipKey:	"goToVoice",
							  defaultSearch:		ZmId.SEARCH_MAIL,
							  overviewTrees:		[ZmOrganizer.VOICE],
							  searchTypes:			[ZmItem.VOICEMAIL],
							  gotoActionCode:		ZmKeyMap.GOTO_VOICE,
							  chooserSort:			15,
							  defaultSort:			15,
							  newItemOps: 			newItemOps,
							  upsellUrl:			ZmSetting.VOICE_UPSELL_URL
							  });
};

ZmVoiceApp.prototype._registerPrefs = function() {
};

ZmVoiceApp.prototype._registerSettings =
function(settings) {
	settings = settings || appCtxt.getSettings();
	settings.registerSetting("VOICE_PAGE_SIZE", {name:"zimbraPrefVoiceItemsPerPage", type:ZmSetting.T_PREF, dataType:ZmSetting.D_INT, defaultValue:25});
	settings.registerSetting("VOICE_PAGE_SIZE_MAX", {name:"zimbraMaxVoiceItemsPerPage", type:ZmSetting.T_COS, dataType:ZmSetting.D_INT, defaultValue:100});
};


ZmVoiceApp.prototype.handleOp =
function(op) {
	switch (op) {
		case ZmOperation.NEW_CALL: {
			this.displayClickToCallDlg();
			break;
		} default: {
			//do nothing
		}
	}
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

ZmVoiceApp.prototype.getOverviewId =
function() {
	var name = this.accordionItem ? this.accordionItem.data.phone.name : "";
	return [this._name, name].join(":");
};

ZmVoiceApp.prototype.getOverviewContainer =
function() {
	if (!this._overviewContainer) {
		var containerId = [ZmApp.OVERVIEW_ID, this._name].join("_");
		var containerParams = {
			appName: this._name,
			containerId: containerId,
			posStyle: Dwt.ABSOLUTE_STYLE,
			parent: appCtxt.getShell(),
			controller: appCtxt.getOverviewController()
		};

		containerParams.id = ZmId.getOverviewContainerId(containerId);

		// the overview container will create overviews for each account
		this._overviewContainer = appCtxt.getOverviewController()._overviewContainer[containerId] =
			new ZmVoiceOverviewContainer(containerParams);
	}

	return this._overviewContainer;
};

ZmVoiceApp.prototype.getNewButtonProps =
function() {
	return {
		text:		ZmMsg.newCall,
		tooltip:	ZmMsg.newCallTooltip,
		icon:		"PlacedCalls",
		iconDis:	"PlacedCallsDis",
		defaultId:	ZmOperation.NEW_CALL
	};
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
	this._storeprincipal = voiceInfo.storeprincipal[0];
	this._setAudioType(voiceInfo);
	this.soapInfo.additional = { storeprincipal: this._storeprincipal };
	var phones = voiceInfo.phone;
	for (var i = 0, count = phones.length; i < count; i++) {
		var obj = phones[i];
		var phone = new ZmPhone();
		phone._loadFromDom(obj);
		this.phones.push(phone);
		this._nameToPhone[phone.name] = phone;

		if (obj.folder && obj.folder.length) {
			phone.folderTree = new ZmVoiceFolderTree();
			if(i == 0) {
				this._setHasTrashFolder(obj.folder[0].folder);
			}
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

ZmVoiceApp.prototype._setAudioType =
function(voiceInfo) {
	if(voiceInfo.audioType && voiceInfo.audioType[0] && voiceInfo.audioType[0]._content) {
		ZmVoiceApp.audioType = voiceInfo.audioType[0]._content;
	}
};

ZmVoiceApp.prototype._setHasTrashFolder =
function(folders) {
	if (folders && folders.length)  {
		var len = folders.length;
		for(var i = 0; i < len; i++) {
			if(folders[i].id.indexOf(ZmVoiceFolder.TRASH_ID) == 0) {
				ZmVoiceApp.hasTrashFolder = true;
				return;
			}
		}
	}
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
    if (!returnValue){
        this.processErrors(response);
    }
	//return returnValue;
    return true;  // Mark error handled
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

ZmVoiceApp.prototype.search =
function(folder, callback, sortBy) {
	var viewType = (folder.getSearchType() == ZmItem.VOICEMAIL) ? ZmId.VIEW_VOICEMAIL : ZmId.VIEW_CALL_LIST;
	if ((viewType == ZmId.VIEW_VOICEMAIL) && !folder.phone.hasVoiceMail) {
		AjxDispatcher.run("GetVoiceController").show(null, folder);
		this._setupOverviewContainer();
		if (callback) {
			callback.run(null);
		}
	} else {
		if (!sortBy) {
			sortBy = appCtxt.get(ZmSetting.SORTING_PREF, viewType);
		}
		var searchParams = {
			soapInfo:	this.soapInfo,
			types:		AjxVector.fromArray([folder.getSearchType()]),
			sortBy:		sortBy,
			query:		folder.getSearchQuery(),
			limit:		this.getLimit()
		};
		var search = new ZmSearch(searchParams);
		var responseCallback = new AjxCallback(this, this._handleResponseSearch, [folder, callback]);
		search.execute({ callback: responseCallback });
	}
};

ZmVoiceApp.prototype._handleResponseSearch =
function(folder, callback, response) {
	var searchResult = response._data;
	var list = searchResult.getResults(folder.getSearchType());
	list.folder = folder;
	var vc = (folder.getSearchType() == ZmItem.VOICEMAIL)
		? AjxDispatcher.run("GetVoiceController")
		: AjxDispatcher.run("GetCallListController");
	vc.show(searchResult, folder);

	// setup the overview container now that the app has been activated
	this._setupOverviewContainer();

	this.selectFolderInOverview(folder);

	// Update numUnread & numUnheard in folder.
	var folderInfo = searchResult.getAttribute("vfi");
	if (folderInfo) {
		folder.notifyModify(folderInfo[0]);
	}

	if (this._paramId) {
		var voiceList = vc.getList();
		var item = voiceList.getById(this._paramId);
		if (item) {
			var view = vc.getListView();
			view.setSelection(item, true);
			view.setPlaying(item);
		}
	}

	if (callback) {
		callback.run(searchResult);
	}
};

ZmVoiceApp.prototype._setupOverviewContainer =
function() {
	this.getOverviewContainer();
	if (!this._overviewContainer.initialized) {
		var overviewParams = this._getOverviewParams();
		overviewParams.overviewTrees = this._getOverviewTrees();
		overviewParams.phones = this.phones;
		this._overviewContainer.initialize(overviewParams);
	}
}

ZmVoiceApp.prototype.markItemsHeard =
function(items, heard, callback, errorCallback) {
	var op = heard ? "read" : "!read";
	this._performAction(items, op, null, callback, errorCallback);
};

ZmVoiceApp.prototype._performAction =
function(items, op, attributes, callback, errorCallback) {
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
		callback: callback,
		errorCallback: errorCallback
	};
	appCtxt.getAppController().sendRequest(params);
};

ZmVoiceApp.prototype.launch =
function(params, callback) {
	this._showApp(params, callback);
};

ZmVoiceApp.prototype._showApp =
function(params, callback) {
    this._paramId = (params.qsParams ? params.qsParams.id : null);
    var loadCallback = new AjxCallback(this, this._handleLoadLaunch, [callback]);
    AjxDispatcher.require("Voicemail", true, loadCallback, null, true);
};

ZmVoiceApp.prototype._handleLoadLaunch =
function(callback) {
    var respCallback = new AjxCallback(this, this._handleResponseLoadLaunchGotInfo, callback);
    var errorCallback = new AjxCallback(this, this._handleErrorLoadLaunchGotInfo, callback);
    this.getVoiceInfo(respCallback, errorCallback);
};

ZmVoiceApp.prototype._handleErrorLoadLaunchGotInfo =
function(callback, ex) {
	var returnValue;
	this._loadError = true;
	switch (ex.code) {
		case "voice.SECONDARY_NOT_ALLOWED":
		case "voice.ACCOUNT_NOT_CPNI_COMPLIANT":
		case "voice.ACCOUNT_CPNI_NOT_AVAILABLE":
			this._showUpsellMessage(ex.code);
			returnValue = true;
			break;
		case "voice.UNABLE_TO_RETRIEVE_PROFILE_SUMMARY":
		default:
			var fallbackApp = appCtxt.getApp(ZmVoiceApp.overviewFallbackApp);
			if (fallbackApp) {
				fallbackApp.launch();
			}
			returnValue = false;
			break;
	}
	this.setOverviewPanelContent(false);
	if (callback instanceof AjxCallback)
		callback.run();
	return returnValue;
};

ZmVoiceApp.prototype._showUpsellMessage =
function(voice_code) {
	if (!this._showingSecondaryMessage) {
		this._showingSecondaryMessage = true;
		var view = new DwtControl({parent:appCtxt.getShell(), posStyle:Dwt.ABSOLUTE_STYLE});
		view.setScrollStyle(DwtControl.SCROLL);
		// voice.ACCOUNT_NOT_CPNI_COMPLIANT_PREFS or voice.ACCOUNT_CPNI_NOT_AVAILABLE_PREFS
		var propval = null;
		if (voice_code == "voice.ACCOUNT_NOT_CPNI_COMPLIANT" || voice_code == "voice.ACCOUNT_CPNI_NOT_AVAILABLE") {
			propval = ZMsg[voice_code + "_PREFS"];
		}
		view.getHtmlElement().innerHTML =  propval || ZMsg["voice.SECONDARY_NOT_ALLOWED_VOICE"];
		var elements = {};
		elements[ZmAppViewMgr.C_APP_CONTENT] = view;
		var hide = [ ZmAppViewMgr.C_TREE, ZmAppViewMgr.C_TREE_FOOTER, ZmAppViewMgr.C_TOOLBAR_TOP,
					  ZmAppViewMgr.C_SASH];
		var viewName = "VoiceMessage";
		this.createView({	viewId:			viewName,
							appName:		this._name,
							controller:		appCtxt.getAppController(),
							elements:		elements,
							hide:			hide,
							isFullScreen:	true,
							isAppView:		true});
		this.pushView(viewName, true);
	}
}

ZmVoiceApp.prototype._handleResponseLoadLaunchGotInfo =
function(callback, response) {
	this._loadError = false;
	var startFolder = this.getStartFolder();
	if (startFolder) {
		this.search(startFolder, callback);
	} else if (callback) {
		callback.run();
	}
};

ZmVoiceApp.prototype.setStartPhone =
function(name, updateView) {
	this._startPhone = name;
	if (updateView) {
		var folder = this.getStartFolder()
		if (this.view != ZmId.VIEW_VOICEMAIL)
			this.pushView(ZmId.VIEW_VOICEMAIL);
		if (this.getVoiceController().getFolder() != folder) {
			this.search(folder);
			this.getVoiceController().setFolder(folder, true);
		}
		this.selectFolderInOverview(folder);
	}
};

ZmVoiceApp.prototype.getStartFolder =
function(name) {
	var which = 0;
    var i = 0;
	var startPhone = name || this._startPhone;
	if (startPhone) {
		for (i = 0; i < this.phones.length; i++) {
			var phone = this.phones[i];
			if (phone.name == startPhone) {
				which = i;
			}
		}
	}
    else {
        for (i = 0; i < this.phones.length; i++) {
            var phone = this.phones[i];
            if (phone.hasVoiceMail) {
                which = i;
                break;
            }
        }
    }
	return this.phones[which].folderTree.getByName(ZmVoiceFolder.VOICEMAIL);
};

ZmVoiceApp.prototype.selectFolderInOverview =
function(folder) {
	// Select the folder in the phone's overview (and deselect for all others)
	var overviews = this.getOverviewContainer().getOverviews();
	for (id in overviews) {
		var overview = overviews[id];
		if (overview.phone == folder.phone) {
			overview.setSelected(folder.id, "Voice");
		} else {
			overview.itemSelected(null);
		}
	}
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

ZmVoiceApp.prototype.setStorePrincipal =
function(soapDoc) {
	var node = soapDoc.set("storeprincipal");
	for (var i in this._storeprincipal) {
		node.setAttribute(i, this._storeprincipal[i]);
	}
};

ZmVoiceApp.prototype.setOverviewPanelContent = function(reset) {
	if ((this._showingSecondaryMessage || this._loadError) && ZmVoiceApp.overviewFallbackApp) { // We should display the overview of the fallback app (usually PORTAL) when showing the upsell message
		var fallbackApp = appCtxt.getApp(ZmVoiceApp.overviewFallbackApp);
		if (fallbackApp)
			return fallbackApp.setOverviewPanelContent(reset);
	}
	return ZmApp.prototype.setOverviewPanelContent.call(this, reset);
}

ZmVoiceApp.prototype.redoSearch =
function() {
	var view = appCtxt.getAppViewMgr().getAppView(ZmApp.VOICE);
	if (view) {
		var controller;
		if (view == ZmId.VIEW_VOICEMAIL) {
			controller = AjxDispatcher.run("GetVoiceController");
		} else if (view == ZmId.VIEW_CALL_LIST) {
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

ZmVoiceApp.prototype._getOverviewTrees =
function() {
	return [ZmOrganizer.VOICE];
};

ZmVoiceApp.prototype.registerUCProvider =
    function(UCProvider) {
          this._UCProvider = UCProvider;
    }

/*
// todo - Voice app shouldn't know about click2call

ZmVoiceApp.prototype.displayClickToCallDlg =
function(toPhoneNumber) {
	if(!this._click2CallZimlet) {
		var zimletContext = appCtxt.getZimletMgr().getZimletByName("com_zimbra_click2call");
		if(zimletContext && zimletContext.handlerObject) {
			this._click2CallZimlet = zimletContext.handlerObject;
		} else {
			var dialog = appCtxt.getErrorDialog();
			dialog.setMessage(ZmMsg.click2callZimletNotFound, ZmMsg.click2callZimletNotFound, DwtMessageDialog.CRITICAL_STYLE);
			dialog.popup();
			return;
		}
	}
	this._click2CallZimlet.display(toPhoneNumber);
};
*/

ZmVoiceApp.prototype.displayClickToCallDlg =
    function(toPhoneNumber) {
        if(this._UCProvider) {
            this._UCProvider.display(toPhoneNumber);
        }
    };

// todo - Move the vendor specific code out

ZmVoiceApp.prototype.processErrors =
    function(ex) {
        var errorMessage = ZmMsg.voicemailErrorUnknown;
        if (!ex.code){
            return;
        }

        if (ex.code == ZmVoiceApp.ERROR_CODE_AUTH) {
            errorMessage = ZmMsg.voicemailErrorAuthFailure;
        }

        if (this._UCProvider) {
            errorMessage = this._UCProvider.getErrorDescription(ex) || errorMessage;
        }
        var dialog = appCtxt.getErrorDialog();
        dialog.setMessage(errorMessage, errorMessage, DwtMessageDialog.CRITICAL_STYLE);
        dialog.popup();
        return;
    }

ZmVoiceApp.prototype.hasVoicePIN =
    function(ex) {
        if (this._UCProvider) {
            return this._UCProvider.hasVoicePIN();
        }
        return true;
    }
