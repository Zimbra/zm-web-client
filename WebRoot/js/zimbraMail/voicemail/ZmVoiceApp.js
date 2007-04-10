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
 * Portions created by Zimbra are Copyright (C) 2006 Zimbra, Inc.
 * All Rights Reserved.
 * 
 * Contributor(s):
 * 
 * ***** END LICENSE BLOCK *****
 */

function ZmVoiceApp(appCtxt, container, parentController) {
	this.phones = [];
	ZmApp.call(this, ZmApp.VOICE, appCtxt, container, parentController);
}

// Organizer and item-related constants
ZmEvent.S_VOICEMAIL				= "VOICEMAIL";
ZmItem.VOICEMAIL				= ZmEvent.S_VOICEMAIL;
ZmEvent.S_CALL					= "CALL";
ZmItem.CALL						= ZmEvent.S_CALL;
ZmOrganizer.VOICE				= ZmEvent.S_VOICEMAIL;

//TODO: Figure out what id to use or should I just use something unique?
ZmOrganizer.ID_VOICEMAIL		= 8675;

// App-related constants
ZmApp.VOICE						= "Voice";
ZmApp.CLASS[ZmApp.VOICE]		= "ZmVoiceApp";
ZmApp.SETTING[ZmApp.VOICE]		= ZmSetting.VOICE_ENABLED;
ZmApp.LOAD_SORT[ZmApp.VOICE]	= 80;
ZmApp.QS_ARG[ZmApp.VOICE]		= "voice";

ZmVoiceApp.SOAP_INFO = {
	method: "SearchVoiceRequest", 
	namespace: "urn:zimbraVoice",
	response: "SearchVoiceResponse"
};

ZmVoiceApp.prototype = new ZmApp;
ZmVoiceApp.prototype.constructor = ZmVoiceApp;

ZmVoiceApp.prototype.toString = 
function() {
	return "ZmVoiceApp";
}

// Construction

ZmVoiceApp.prototype._defineAPI =
function() {
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
						 searchType:	"voicemail",
						 resultsList:	AjxCallback.simpleClosure(function(search) {
											AjxDispatcher.require("Voicemail");
											return new ZmVoiceList(this._appCtxt, ZmItem.VOICEMAIL, search);
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
											return new ZmVoiceList(this._appCtxt, ZmItem.CALL, search);
										}, this)
						});
};

ZmVoiceApp.prototype._registerOperations =
function() {
	ZmOperation.registerOp("AUTO_PLAY", {textKey:"autoPlay", tooltipKey:"autoPlayTooltip", image:"ApptRecur"});
	ZmOperation.registerOp("MARK_HEARD", {textKey:"markAsHeard", image:"ReadMessage"});
	ZmOperation.registerOp("MARK_UNHEARD", {textKey:"markAsUnheard", image:"UnreadMessage"});
	ZmOperation.registerOp("VIEW_BY_DATE", {textKey:"viewByDate"});
};

ZmVoiceApp.prototype._registerOrganizers =
function() {
	ZmOrganizer.registerOrg(ZmOrganizer.VOICE,
							{app:				ZmApp.VOICE,
							 nameKey:			"voicemailFolder",
							 defaultFolder:		ZmOrganizer.ID_VOICEMAIL,
							 firstUserId:		256,
							 orgClass:			"ZmVoiceFolder",
							 orgPackage:		"VoicemailCore",
							 treeController:	"ZmVoiceTreeController",
							 labelKey:			"voicemail",
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
							  defaultSearch:		ZmSearchToolBar.FOR_ANY_MI,
							  overviewTrees:		[ZmOrganizer.VOICE],
							  showZimlets:			true,
							  searchTypes:			[ZmItem.VOICEMAIL],
							  gotoActionCode:		ZmKeyMap.GOTO_VOICEMAIL,
							  chooserSort:			15,
							  defaultSort:			15
							  });
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

ZmVoiceApp.prototype.getVoiceInfo =
function(callback) {
	if (!this.phones.length) {
	    var soapDoc = AjxSoapDoc.create("GetVoiceInfoRequest", "urn:zimbraVoice");
	    var respCallback = new AjxCallback(this, this._handleResponseVoiceInfo, callback);
	    var params = {
	    	soapDoc: soapDoc, 
	    	asyncMode: true,
			callback: respCallback
		};
		this._appCtxt.getAppController().sendRequest(params);
	} else if (callback) {
		callback.run();
	}
};

ZmVoiceApp.prototype._handleResponseVoiceInfo =
function(callback, response) {
	var folderTree = this._appCtxt.getFolderTree();
	var phones = response._data.GetVoiceInfoResponse.phone;
	for (var i = 0, count = phones.length; i < count; i++) {
		var obj = phones[i];
		var phone = new ZmPhone(this._appCtxt);
		phone._loadFromDom(obj);
		this.phones.push(phone);
		if (obj.folder && obj.folder.length) {
			this._createFolder(folderTree.root, phone, obj.folder[0]);
		}
	}
	if (callback) {
		callback.run();
	}
};

ZmVoiceApp.prototype.search =
function(folder, callback, sortBy) {
	var searchParams = {
		soapInfo: ZmVoiceApp.SOAP_INFO,
		types: AjxVector.fromArray([folder.getSearchType()]),
		sortBy: sortBy,
		query: folder.getSearchQuery()
	};
	var search = new ZmSearch(this._appCtxt, searchParams);	
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
	this._appCtxt.getAppController().sendRequest(params);
};

ZmVoiceApp.prototype.launch =
function(callback) {
	var loadCallback = new AjxCallback(this, this._handleLoadLaunch, [callback]);
	AjxDispatcher.require("Voicemail", false, loadCallback, null, true);
};

ZmVoiceApp.prototype._handleLoadLaunch =
function(callback) {
    var respCallback = new AjxCallback(this, this._handleResponseLoadLaunchGotInfo, callback);
    this.getVoiceInfo(respCallback);
};

ZmVoiceApp.prototype._handleResponseLoadLaunchGotInfo =
function(callback, response) {
	if (this.startFolder) {
		this.search(this.startFolder, callback);
	} else if (callback) {
		callback.run();
	}
};

ZmVoiceApp.prototype._createFolder =
function(parent, phone, obj) {
	var params = { 
		id: obj.id,
		name: obj.name,
		phone: phone,
		callType: obj.name || ZmVoiceFolder.ACCOUNT,
		view: obj.view,
		numUnread: obj.u,
		parent: parent,
		tree: parent.tree
	}		
	var folder = new ZmVoiceFolder(params);
	parent.children.add(folder);
	if (!this.startFolder && (folder.callType == ZmVoiceFolder.VOICEMAIL)) {
		this.startFolder = folder;
	}
	if (obj.folder) {
		for (var i = 0, count = obj.folder.length; i < count; i++) {
			this._createFolder(folder, phone, obj.folder[i]);
		}
	}
	return folder;
};

ZmVoiceApp.prototype.activate =
function(active, view) {
};

ZmVoiceApp.prototype.getVoiceController =
function() {
	if (!this._voiceController) {
		this._voiceController = new ZmVoicemailListController(this._appCtxt, this._container, this);
	}
	return this._voiceController;
};

ZmVoiceApp.prototype.getCallListController =
function() {
	if (!this._callListController) {
		this._callListController = new ZmCallListController(this._appCtxt, this._container, this);
	}
	return this._callListController;
};

ZmVoiceApp.prototype.GetVoicePrefsController =
function() {
	if (!this._voicePrefsController) {
        var prefsView = AjxDispatcher.run("GetPrefController").getPrefsView();
        var prefsApp = this._appCtxt.getApp(ZmApp.PREFERENCES);
        this._voicePrefsController = new ZmVoicePrefsController(this._appCtxt, this._container, prefsApp, prefsView);
	}
	return this._voicePrefsController;
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
