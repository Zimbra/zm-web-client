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
	this._phones = [];
	ZmApp.call(this, ZmApp.VOICEMAIL, appCtxt, container, parentController);
}

// Organizer and item-related constants
ZmEvent.S_VOICEMAIL				= "VOICEMAIL";
ZmItem.VOICEMAIL				= ZmEvent.S_VOICEMAIL;
ZmEvent.S_CALL					= "CALL";
ZmItem.CALL						= ZmEvent.S_CALL;
ZmOrganizer.VOICEMAIL			= ZmEvent.S_VOICEMAIL;

//TODO: Figure out what id to use or should I just use something unique?
ZmOrganizer.ID_VOICEMAIL		= 8675;

// App-related constants
ZmApp.VOICEMAIL						= "Voicemail";
ZmApp.CLASS[ZmApp.VOICEMAIL]		= "ZmVoiceApp";
ZmApp.SETTING[ZmApp.VOICEMAIL]		= ZmSetting.VOICEMAIL_ENABLED;
ZmApp.LOAD_SORT[ZmApp.VOICEMAIL]	= 80;
ZmApp.QS_ARG[ZmApp.VOICEMAIL]		= "voicemail";

ZmVoiceApp.prototype = new ZmApp;
ZmVoiceApp.prototype.constructor = ZmVoiceApp;

ZmVoiceApp.prototype.toString = 
function() {
	return "ZmVoiceApp";
}

// Construction

ZmVoiceApp.prototype._defineAPI =
function() {
	AjxDispatcher.registerMethod("GetVoicemailController", "Voicemail", new AjxCallback(this, this.getVoicemailController));
};

ZmVoiceApp.prototype._registerItems =
function() {
	var listCreator = AjxCallback.simpleClosure(this._createList, this);
	ZmItem.registerItem(ZmItem.VOICEMAIL,
						{app:			ZmApp.VOICEMAIL,
						 nameKey:		"voicemail",
						 icon:			"Voicemail",
						 soapCmd:		"VoicemailAction",
						 itemClass:		"ZmVoicemail",
						 node:			"m",
						 organizer:		ZmOrganizer.VOICEMAIL,
						 searchType:	"voicemail",
						 resultsList:	listCreator
						});
	ZmItem.registerItem(ZmItem.CALL,
						{app:			ZmApp.VOICEMAIL,
						 nameKey:		"call",
						 icon:			"Voicemail",
						 soapCmd:		"VoicemailAction",
						 itemClass:		"ZmCall",
						 node:			"m",
						 organizer:		ZmOrganizer.VOICEMAIL,
//TODO: mapping of call to trash......						 
						 searchType:	"trash",
						 resultsList:	listCreator
						});
};

ZmVoiceApp.prototype._createList =
function(search) {
	AjxDispatcher.require("Voicemail");
	return new ZmVoiceList(this._appCtxt, search);
};

ZmVoiceApp.prototype._registerOperations =
function() {
	ZmOperation.registerOp("AUTO_PLAY", {textKey:"autoPlay", tooltipKey:"autoPlayTooltip", image:"ApptRecur"});
};

ZmVoiceApp.prototype._registerOrganizers =
function() {
	ZmOrganizer.registerOrg(ZmOrganizer.VOICEMAIL,
							{app:				ZmApp.VOICEMAIL,
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
	ZmApp.registerApp(ZmApp.VOICEMAIL,
							 {mainPkg:				"Voicemail",
							  nameKey:				"voicemail",
							  icon:					"VoicemailApp",
							  qsArg:				"voicemail",
							  chooserTooltipKey:	"goToVoicemail",
							  defaultSearch:		ZmSearchToolBar.FOR_ANY_MI,
							  overviewTrees:		[ZmOrganizer.VOICEMAIL],
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
function(list) {
	this._handleCreates(list);
};

ZmVoiceApp.prototype.modifyNotify =
function(list) {
	this._handleModifies(list);
};

ZmVoiceApp.prototype.search =
function(folder, callback) {
	var soapInfo = {
		method: "SearchVoiceRequest", 
		namespace: "urn:zimbraVoice",
		response: "SearchVoiceResponse"
	};
	var searchParams = {
		soapInfo: soapInfo,
		types: AjxVector.fromArray([folder.getSearchType()]),
		query: "phone:" + folder.phone.name,
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
	var voicemailController = AjxDispatcher.run("GetVoicemailController");
	voicemailController.show(searchResult, folder);
	if (callback) {
		callback.run(searchResult);
	}
};

ZmVoiceApp.prototype.deleteItems =
function(items, callback) {
	
	if (!items[0].isInTrash()) {
		this._moveItems(items, ZmVoiceFolder.TRASH_ID, callback);
	} else {
//TODO: this undeletes. Should really be hard delete.	
		this._moveItems(items, ZmVoiceFolder.VOICEMAIL_ID, callback);
	}
};

ZmVoiceApp.prototype._moveItems =
function(items, destination, callback) {
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
    node.setAttribute("op", "move");
    node.setAttribute("id", ids.join(","));
    node.setAttribute("phone", items[0].getPhone().name);
    node.setAttribute("l", destination); 

    var respCallback = new AjxCallback(this, this._handleResponseMoveItems, [items, callback]);
    var params = {
    	soapDoc: soapDoc, 
    	asyncMode: true,
		callback: respCallback
	};
	this._appCtxt.getAppController().sendRequest(params);
};

ZmVoiceApp.prototype._handleResponseMoveItems =
function(items, callback, response) {
	if (callback) {
		callback.run(items);
	}
};

ZmVoiceApp.prototype.launch =
function(callback) {
	var loadCallback = new AjxCallback(this, this._handleLoadLaunch, [callback]);
	AjxDispatcher.require("Voicemail", false, loadCallback, null, true);
};

ZmVoiceApp.prototype._handleLoadLaunch =
function(callback) {
    var soapDoc = AjxSoapDoc.create("GetVoiceInfoRequest", "urn:zimbraVoice");
    var respCallback = new AjxCallback(this, this._handleResponseVoiceInfo, callback);
    var params = {
    	soapDoc: soapDoc, 
    	asyncMode: true,
		callback: respCallback
	};
	this._appCtxt.getAppController().sendRequest(params);
};

ZmVoiceApp.prototype._handleResponseVoiceInfo =
function(callback, response) {
	var folderTree = this._appCtxt.getFolderTree();
	var phones = response._data.GetVoiceInfoResponse.phone;
	for (var i = 0, count = phones.length; i < count; i++) {
		var obj = phones[i];
		var phone = new ZmPhone();
		phone._loadFromDom(obj);
		this._phones.push(phone);
	}
	if (this._phones.length) {
		this._getFolders(callback);
	} else {
		if (callback) {
			callback.run();
		}
	}
};

ZmVoiceApp.prototype._getFolders =
function(callback) {
    var soapDoc = AjxSoapDoc.create("GetVoiceFolderRequest", "urn:zimbraVoice");
    for (var i = 0, count = this._phones.length; i < count; i++) {
	    var node = soapDoc.set("phone");
	    node.setAttribute("name", this._phones[i].name);
    }
    var respCallback = new AjxCallback(this, this._handleResponseGetFolder, [callback]);
    var params = {
    	soapDoc: soapDoc, 
    	asyncMode: true,
		callback: respCallback
	};
	this._appCtxt.getAppController().sendRequest(params);
};

ZmVoiceApp.prototype._handleResponseGetFolder =
function(callback, response) {
	var folderTree = this._appCtxt.getFolderTree();
	var array = response._data.GetVoiceFolderResponse.phone
	for (var i = 0, count = array.length; i < count; i++) {
		this._createFolder(folderTree.root, this._phones[i], array[i].folder[0]);
	}
	if (this.startFolder) {
		this.search(this.startFolder, callback);
	}
};

ZmVoiceApp.prototype._createFolder =
function(parent, phone, obj) {
	var params = { 
		id: phone.name + obj.name,
		name: obj.name,
		phone: phone,
		callType: obj.name || ZmVoiceFolder.ACCOUNT,
		view: obj.view,
		parent: parent,
		tree: parent.tree,
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

ZmVoiceApp.prototype.getVoicemailController = function() {
	if (!this._voicemailController) {
		this._voicemailController = new ZmVoiceListController(this._appCtxt, this._container, this);
	}
	return this._voicemailController;
};

ZmVoiceApp.prototype._handleDeletes =
function(ids) {
};

ZmVoiceApp.prototype._handleCreates =
function(list) {
};

ZmVoiceApp.prototype._handleModifies =
function(list) {
};
