/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2007, 2008, 2009 Zimbra, Inc.
 * 
 * The contents of this file are subject to the Yahoo! Public License
 * Version 1.0 ("License"); you may not use this file except in
 * compliance with the License.  You may obtain a copy of the License at
 * http://www.zimbra.com/license.
 * 
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * ***** END LICENSE BLOCK *****
 */

ZmBriefcaseApp = function(container, parentController) {
	ZmApp.call(this, ZmApp.BRIEFCASE, container, parentController);
};

ZmBriefcaseApp.prototype = new ZmApp;
ZmBriefcaseApp.prototype.constructor = ZmBriefcaseApp;

// Constants

// Organizer and item-related constants
ZmEvent.S_BRIEFCASE_ITEM			= ZmId.ITEM_BRIEFCASE;
ZmItem.BRIEFCASE_ITEM				= ZmEvent.S_BRIEFCASE_ITEM;
ZmItem.BRIEFCASE					= ZmItem.BRIEFCASE_ITEM;	// back-compatibility
ZmOrganizer.BRIEFCASE				= ZmId.ORG_BRIEFCASE;

// App-related constants
ZmApp.BRIEFCASE						= ZmId.APP_BRIEFCASE;
ZmApp.CLASS[ZmApp.BRIEFCASE]		= "ZmBriefcaseApp";
ZmApp.SETTING[ZmApp.BRIEFCASE]		= ZmSetting.BRIEFCASE_ENABLED;
ZmApp.LOAD_SORT[ZmApp.BRIEFCASE]	= 65;
ZmApp.QS_ARG[ZmApp.BRIEFCASE]		= "briefcase";
ZmApp.BUTTON_ID[ZmApp.BRIEFCASE]	= ZmId.BRIEFCASE_APP;


ZmBriefcaseApp.prototype.toString =
function() {
	return "ZmBriefcaseApp";
};

ZmBriefcaseApp.prototype._defineAPI =
function() {
	AjxDispatcher.setPackageLoadFunction("BriefcaseCore", new AjxCallback(this, this._postLoadCore));
	AjxDispatcher.setPackageLoadFunction("Briefcase", new AjxCallback(this, this._postLoad, ZmOrganizer.BRIEFCASE));
	AjxDispatcher.registerMethod("GetBriefcaseController", ["BriefcaseCore", "Briefcase"], new AjxCallback(this, this.getBriefcaseController));
};

ZmBriefcaseApp.prototype._registerOperations =
function() {
	ZmOperation.registerOp(ZmId.OP_NEW_BRIEFCASE, {textKey:"newBriefcase", image:"NewFolder", tooltipKey:"newBriefcaseTooltip", shortcut:ZmKeyMap.NEW_BRIEFCASE});
	ZmOperation.registerOp(ZmId.OP_NEW_FILE, {textKey:"uploadNewFile", tooltipKey:"uploadNewFile", image:"NewPage"});
	ZmOperation.registerOp(ZmId.OP_NEW_PRESENTATION, {textKey:"newPresentationBeta", tooltipKey:"newPresentation", image:"Presentation"});
	ZmOperation.registerOp(ZmId.OP_NEW_SPREADSHEET, {textKey:"newSpreadSheetBeta", tooltipKey:"newSpreadSheet", image:"ZSpreadSheet"});
	ZmOperation.registerOp(ZmId.OP_NEW_DOC, {textKey:"newDocument", tooltipKey:"newDocument", image:"Doc", shortcut:ZmKeyMap.NEW_DOC});
	ZmOperation.registerOp(ZmId.OP_SHARE_BRIEFCASE, {textKey:"shareFolder", image:"SharedMailFolder"}, ZmSetting.SHARING_ENABLED);
	ZmOperation.registerOp(ZmId.OP_MOUNT_BRIEFCASE, {textKey:"mountBriefcase", image:"Notebook"}, ZmSetting.SHARING_ENABLED);
	ZmOperation.registerOp(ZmId.OP_OPEN_FILE, {textKey:"openFile", tooltipKey:"openFileTooltip", image:"NewPage"});
	ZmOperation.registerOp(ZmId.OP_SAVE_FILE, {textKey:"saveFile", tooltipKey:"saveFileTooltip", image:"Save"});
	ZmOperation.registerOp(ZmId.OP_VIEW_FILE_AS_HTML, {textKey:"viewAsHtml", tooltipKey:"viewAsHtml", image:"HtmlDoc"});
	ZmOperation.registerOp(ZmId.OP_SEND_FILE, {textKey:"sendLink", tooltipKey:"sendLink", image:"Send"});
	ZmOperation.registerOp(ZmId.OP_SEND_FILE_AS_ATT, {textKey:"sendAsAttachment", tooltipKey:"sendAsAttachment", image:"Attachment"});
	ZmOperation.registerOp(ZmId.OP_SEND_FILE_MENU, {textKey:"send", image:"Send"});
	ZmOperation.registerOp(ZmId.OP_CREATE_SLIDE_SHOW, {textKey:"createSlideShow", image:"Presentation"});
};

ZmBriefcaseApp.prototype._registerSettings =
function(settings) {
	settings = settings || appCtxt.getSettings();
	settings.registerSetting("SPREADSHEET_ENABLED",	{name:"zimbraFeatureBriefcaseSpreadsheetEnabled", type:ZmSetting.T_COS, dataType: ZmSetting.D_BOOLEAN, defaultValue:true});
	settings.registerSetting("SLIDES_ENABLED",		{name:"zimbraFeatureBriefcaseSlidesEnabled", type:ZmSetting.T_COS, dataType: ZmSetting.D_BOOLEAN, defaultValue:true});
	settings.registerSetting("DOCS_ENABLED",		{name:"zimbraFeatureBriefcaseDocsEnabled", type:ZmSetting.T_COS, dataType: ZmSetting.D_BOOLEAN, defaultValue:true});
};

ZmBriefcaseApp.prototype._registerItems =
function() {
	ZmItem.registerItem(ZmItem.BRIEFCASE_ITEM,
						{app:			ZmApp.BRIEFCASE,
						 nameKey:		"document",
						 icon:			"GenericDoc",
						 soapCmd:		"ItemAction",
						 itemClass:		"ZmBriefcaseItem",
						 node:			"doc",
						 organizer:		ZmOrganizer.BRIEFCASE,
						 dropTargets:	[ZmOrganizer.TAG, ZmOrganizer.BRIEFCASE],
						 searchType:	"document",
						 resultsList:
		AjxCallback.simpleClosure(function(search) {
			return new ZmList(ZmItem.BRIEFCASE_ITEM, search);
		}, this)
						});
};

ZmBriefcaseApp.prototype._registerOrganizers =
function() {
	ZmOrganizer.registerOrg(ZmOrganizer.BRIEFCASE,
							{app            : ZmApp.BRIEFCASE,
							 nameKey        : "folders",
							 defaultFolder  : ZmOrganizer.ID_BRIEFCASE,
							 soapCmd        : "FolderAction",
							 firstUserId    : 256,
							 orgClass       : "ZmBriefcase",
							 orgPackage     : "BriefcaseCore",
							 treeController : "ZmBriefcaseTreeController",
							 labelKey       : "folders",
							 itemsKey       : "files",
							 treeType       : ZmOrganizer.FOLDER,
							 views          : ["document"],
							 folderKey      : "briefcase",
							 mountKey       : "mountFolder",
							 createFunc     : "ZmOrganizer.create",
							 compareFunc    : "ZmBriefcase.sortCompare",
							 deferrable     : false,
							 newOp			: ZmOperation.NEW_BRIEFCASE,
							 displayOrder	: 100,
							 hasColor       : true,
							 childWindow    : true
							});
};

ZmBriefcaseApp.prototype._setupSearchToolbar =
function() {
	//TODO:search for page alone
	ZmSearchToolBar.addMenuItem(ZmItem.BRIEFCASE_ITEM,
								{msgKey:		"searchBriefcase",
								 tooltipKey:	"searchForFiles",
								 icon:			"Folder",
								 shareIcon:		"SharedBriefcase",
								 setting:		ZmSetting.BRIEFCASE_ENABLED,
								 id:			ZmId.getMenuItemId(ZmId.SEARCH, ZmId.ITEM_BRIEFCASE)
								});
};

ZmBriefcaseApp.prototype._registerApp =
function() {
	var newItemOps = {};
	newItemOps[ZmOperation.NEW_FILE]		= "uploadNewFile";
	newItemOps[ZmOperation.NEW_DOC]			= "document";

	var newOrgOps = {};
	newOrgOps[ZmOperation.NEW_BRIEFCASE]	 = "briefcase";

	var actionCodes = {};
	actionCodes[ZmKeyMap.NEW_FILE]			= ZmOperation.NEW_FILE;
	actionCodes[ZmKeyMap.NEW_BRIEFCASE]		= ZmOperation.NEW_BRIEFCASE;
	actionCodes[ZmKeyMap.NEW_PRESENTATION]	= ZmOperation.NEW_PRESENTATION;
	actionCodes[ZmKeyMap.NEW_SPREADSHEET]	= ZmOperation.NEW_SPREADSHEET;
	actionCodes[ZmKeyMap.NEW_DOC]			= ZmOperation.NEW_DOC;

	ZmApp.registerApp(ZmApp.BRIEFCASE,
					 {mainPkg:				"Briefcase",
					  nameKey:				"briefcase",
					  icon:					"Folder",
					  textPrecedence:		30,
					  chooserTooltipKey:	"gotoBriefcase",
					  defaultSearch:		ZmItem.BRIEFCASE_ITEM,
					  organizer:			ZmOrganizer.BRIEFCASE,
					  overviewTrees:		[ZmOrganizer.BRIEFCASE, ZmOrganizer.TAG],
					  searchTypes:			[ZmItem.BRIEFCASE_ITEM],
					  newItemOps:			newItemOps,
					  newOrgOps:			newOrgOps,
					  actionCodes:			actionCodes,
					  gotoActionCode:		ZmKeyMap.GOTO_BRIEFCASE,
					  newActionCode:		ZmKeyMap.NEW_FILE,
					  chooserSort:			70,
					  defaultSort:			60
					  });
};

// App API

/**
 * Checks for the creation of a briefcase or a mount point to one, or of an item
 *
 * @param creates	[hash]		hash of create notifications
 */
ZmBriefcaseApp.prototype.createNotify =
function(creates, force) {

	if (!creates["folder"] && !creates["doc"] && !creates["link"]) { return; }
	if (!force && !this._noDefer && this._deferNotifications("create", creates)) { return; }

	for (var name in creates) {
		var list = creates[name];
		for (var i = 0; i < list.length; i++) {
			var create = list[i];
			if (appCtxt.cacheGet(create.id)) { continue; }

			if (name == "folder") {
				this._handleCreateFolder(create, ZmOrganizer.BRIEFCASE);
			} else if (name == "link") {
				this._handleCreateLink(create, ZmOrganizer.BRIEFCASE);
			} else if (name == "doc") {
				var bc = AjxDispatcher.run("GetBriefcaseController");
				var list = bc.getList();
				if (list) {
					var item = ZmBriefcaseItem.createFromDom(create, {list:list});
					if (list.search && list.search.matches && list.search.matches(item)) {
						list.notifyCreate(create);
					}
				}
			}
		}
	}
};

ZmBriefcaseApp.prototype.handleOp =
function(op) {

	switch (op) {
		case ZmOperation.NEW_FILE: {
			var loadCallback = new AjxCallback(this, this._handleNewItem);
			AjxDispatcher.require(["BriefcaseCore", "Briefcase"], false, loadCallback, null, true);
			break;
		}
		case ZmOperation.NEW_BRIEFCASE: {
			var loadCallback = new AjxCallback(this, this._handleLoadNewBriefcase);
			AjxDispatcher.require(["BriefcaseCore", "Briefcase"], false, loadCallback, null, true);
			break;
		}
		case ZmOperation.NEW_PRESENTATION: {
			var loadCallback = new AjxCallback(this, this.newDoc, [ZmMimeTable.APP_ZIMBRA_SLIDES]);
			AjxDispatcher.require(["BriefcaseCore", "Briefcase"], true, loadCallback, null);
			break;
		}

		 case ZmOperation.NEW_SPREADSHEET: {
			 var newDocCallback = new AjxCallback(this, this.newDoc, [ZmMimeTable.APP_ZIMBRA_SPREADSHEET]);
			 AjxDispatcher.require(["BriefcaseCore", "Briefcase"], true, newDocCallback, null);
			 break;
		}

		 case ZmOperation.NEW_DOC: {
			 var newDocCallback = new AjxCallback(this, this.newDoc, [ZmMimeTable.APP_ZIMBRA_DOC]);
			 AjxDispatcher.require(["BriefcaseCore", "Briefcase"], true, newDocCallback, null);
			 break;
		}
	}
};

ZmBriefcaseApp.prototype.newDoc =
function(contentType, name, winName) {
	var overviewController = appCtxt.getOverviewController();
	var treeController = overviewController.getTreeController(ZmOrganizer.BRIEFCASE);
	var folderId = ZmOrganizer.ID_BRIEFCASE;
	if (treeController) {
		var treeView = treeController.getTreeView(this.getOverviewId());
		var briefcase = treeView ? treeView.getSelected() : null;
		folderId = briefcase ? briefcase.id : ZmOrganizer.ID_BRIEFCASE;
	}

	var url = this.getEditURLForContentType(contentType) + "?" + (name ?"name=" + name + "&" : "") + "l="+folderId + (window.isTinyMCE ? "&editor=tinymce" : "");
	var winname = winName || name;
	window.open(url, winname, ZmBriefcaseApp.getDocWindowFeatures());
};

ZmBriefcaseApp.getDocWindowFeatures =
function() {
    return [
        "width=",(screen.width || 640),",",
        "height=",(screen.height || 480),",",
        "fullscreen=yes"
    ].join("");
};

ZmBriefcaseApp.addEditorParam =
function(restUrl) {
    if(restUrl && window.isTinyMCE) {
        restUrl += (restUrl.match(/\?/) ?  "&editor=tinymce" : "?editor=tinymce");
    }
    return restUrl;
};

ZmBriefcaseApp.prototype.getEditURLForContentType =
function(contentType) {
	AjxDispatcher.require("Startup1_1");
	var editPage = "Slides.jsp";
	switch(contentType) {
		case ZmMimeTable.APP_ZIMBRA_SLIDES:			editPage = "Slides.jsp"; break;
		case ZmMimeTable.APP_ZIMBRA_SPREADSHEET:	editPage = "SpreadsheetDoc.jsp"; break;
		case ZmMimeTable.APP_ZIMBRA_DOC:			editPage = "Docs.jsp"; break;
		default: return null;
	};
	return (appContextPath + "/public/" + editPage);
};

ZmBriefcaseApp.prototype.isDoclet =
function(item) {
	var contentType = item.getContentType();
	switch(contentType) {
		case ZmMimeTable.APP_ZIMBRA_SLIDES: return true;
		default: return false;
	}
};

ZmBriefcaseApp.prototype._handleNewItem =
function() {
	appCtxt.getAppViewMgr().popView(true, ZmId.VIEW_LOADING);	// pop "Loading..." page
	this.getBriefcaseController().__popupUploadDialog(null, ZmMsg.uploadFileToBriefcase);
};

ZmBriefcaseApp.prototype._handleLoadNewBriefcase =
function() {
	appCtxt.getAppViewMgr().popView(true, ZmId.VIEW_LOADING); // pop "Loading..." page

	if (!this._newBriefcaseCb) {
		this._newBriefcaseCb = new AjxCallback(this, this._newBriefcaseCallback);
	}
	ZmController.showDialog(appCtxt.getNewBriefcaseDialog(), this._newBriefcaseCb);
};


// Public methods

ZmBriefcaseApp.prototype.launch =
function(params, callback) {
	var loadCallback = new AjxCallback(this, this._handleLoadLaunch, [callback]);
	AjxDispatcher.require(["BriefcaseCore","Briefcase"], true, loadCallback, null, true);
};

ZmBriefcaseApp.prototype._handleLoadLaunch =
function(callback) {
	this.search();
	if (callback) { callback.run(); }
};

ZmBriefcaseApp.prototype.search =
function(folderId, callback, accountName, noRender) {

	var folder = appCtxt.getById(folderId || ZmOrganizer.ID_BRIEFCASE);
	var params = {
		query:			folder.createQuery(),
		types:			[ZmItem.BRIEFCASE_ITEM],
		limit:			this.getLimit(),
		searchFor:		ZmId.ITEM_BRIEFCASE,
		callback:		callback,
		accountName:	(accountName || (folder && folder.account && folder.account.name)),
		noRender:		noRender
	};
	var sc = appCtxt.getSearchController();
	sc.searchAllAccounts = false;
	sc.search(params);
};

ZmBriefcaseApp.prototype.showSearchResults =
function(results, callback) {
	var loadCallback = new AjxCallback(this, this._handleLoadShowSearchResults, [results, callback]);
	AjxDispatcher.require(["BriefcaseCore", "Briefcase"], false, loadCallback, null, true);
};

ZmBriefcaseApp.prototype._handleLoadShowSearchResults =
function(results, callback) {
	var folderId = results && results.search && results.search.folderId;
	this.getBriefcaseController().show(results, folderId);
	if (callback) { callback.run(); }
};

ZmBriefcaseApp.prototype.setActive =
function(active) {
};

// return enough for us to get a scroll bar since we are pageless
ZmBriefcaseApp.prototype.getLimit =
function(offset) {
	var limit = appCtxt.get(ZmSetting.PAGE_SIZE);
	return offset ? limit : 2 * limit;
};

ZmBriefcaseApp.prototype._newBriefcaseCallback =
function(parent, name, color) {
	appCtxt.getNewBriefcaseDialog().popdown();
	var oc = appCtxt.getOverviewController();
	oc.getTreeController(ZmOrganizer.BRIEFCASE)._doCreate(parent, name, color);
};

ZmBriefcaseApp.prototype.getBriefcaseController =
function() {
	if (!this._briefcaseController) {
		this._briefcaseController = new ZmBriefcaseController(this._container, this);
	}
	return this._briefcaseController;
};

ZmBriefcaseApp.prototype.createFromAttachment =
function(msgId, partId,name) {
	var loadCallback = new AjxCallback(this, this._handleCreateFromAttachment, [msgId, partId, name]);
	AjxDispatcher.require(["BriefcaseCore","Briefcase"], false, loadCallback);
};

ZmBriefcaseApp.prototype._handleCreateFromAttachment =
function(msgId, partId, name) {
	if (this._deferredFolders.length != 0) {
		this._createDeferredFolders(ZmApp.BRIEFCASE);
	}
	var dlg = this._copyToDialog = appCtxt.getChooseFolderDialog();
	var chooseCb = new AjxCallback(this, this._chooserCallback, [msgId, partId, name]);
	ZmController.showDialog(dlg, chooseCb, this._getCopyParams(dlg, msgId, partId));
};

ZmBriefcaseApp.prototype._getCopyParams =
function(dlg, msgId, partId) {
	return {
		data:			{msgId:msgId,partId:partId},
		treeIds:		[ZmOrganizer.BRIEFCASE],
		overviewId:		dlg.getOverviewId(this._name),
		title:			ZmMsg.addToBriefcaseTitle,
		description:	ZmMsg.targetFolder,
		appName:		ZmApp.BRIEFCASE
	};
};

ZmBriefcaseApp.prototype._chooserCallback =
function(msgId, partId, name, folder) {
	var callback = new AjxCallback(this, this.handleDuplicateCheck, [msgId, partId, name, folder.id]);
	this.search(folder, callback);
//	this.getBriefcaseController().getItemsInFolder(folder.id, callback);
};

ZmBriefcaseApp.prototype.handleDuplicateCheck =
function(msgId, partId, name, folderId,items) {
	var bController = this.getBriefcaseController();
	if (bController.isReadOnly(folderId)) {
		ZmOrganizer._showErrorMsg(ZmMsg.errorPermission);
		return;
	}

	if (bController.isShared(folderId)) {
		if (msgId.indexOf(":") < 0) { // for shared folder, use fully qualified msg id if it is not already
		   msgId = appCtxt.getActiveAccount().id + ":" + msgId;
		}
	}

	var itemFound = false;

	if (items instanceof ZmList) {
		items = items.getArray();
	}

	for (var i in items) {
		var item = items[i];
		if (item.name == name) {
			itemFound = true;
			break;
		}
	}

	if (!itemFound) {
		var srcData = new ZmBriefcaseItem();
		srcData.createFromAttachment(msgId, partId, name, folderId);
	} else {
		var	msg = AjxMessageFormat.format(ZmMsg.errorFileAlreadyExists, name);
		ZmOrganizer._showErrorMsg(msg);
	}
};

ZmBriefcaseApp.prototype.fixCrossDomainReference =
function(url, restUrlAuthority) {
	var urlParts = AjxStringUtil.parseURL(url);
	if (urlParts.authority != window.location.host) {
		if ((restUrlAuthority && url.indexOf(restUrlAuthority) >=0) || !restUrlAuthority) {
			var oldRef = urlParts.protocol + "://" + urlParts.authority;
			var newRef = window.location.protocol + "//" + window.location.host;
			url = url.replace(oldRef, newRef);
		}
	}
	return url;
};

//Make sure we load BriefcaseCore before calling _creatDeferredFolders() from child window.
ZmBriefcaseApp.prototype._createDeferredFolders =
function(type) {
	AjxPackage.require("BriefcaseCore");
	ZmApp.prototype._createDeferredFolders.call(this, type);
};
