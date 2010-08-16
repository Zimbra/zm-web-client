/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2007, 2008, 2009, 2010 Zimbra, Inc.
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
 * This file contains the briefcase application class.
 */

/**
 * Creates and initializes the briefcase application.
 * @class
 * The briefcase application manages the creation and display of briefcase items.
 * 
 * @param	{DwtControl}	container		the container
 * @param	{ZmController}	parentController	the parent controller
 * 
 * @author Conrad Damon
 * 
 * @extends		ZmApp
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
/**
 * Defines the "briefcase" organizer.
 */
ZmOrganizer.BRIEFCASE				= ZmId.ORG_BRIEFCASE;

// App-related constants
/**
 * Defines the "briefcase" application.
 */
ZmApp.BRIEFCASE						= ZmId.APP_BRIEFCASE;
ZmApp.CLASS[ZmApp.BRIEFCASE]		= "ZmBriefcaseApp";
ZmApp.SETTING[ZmApp.BRIEFCASE]		= ZmSetting.BRIEFCASE_ENABLED;
ZmApp.LOAD_SORT[ZmApp.BRIEFCASE]	= 65;
ZmApp.QS_ARG[ZmApp.BRIEFCASE]		= "briefcase";
ZmApp.BUTTON_ID[ZmApp.BRIEFCASE]	= ZmId.BRIEFCASE_APP;

/**
 * Returns a string representation of the object.
 * 
 * @return		{String}		a string representation of the object
 */
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
	ZmOperation.registerOp(ZmId.OP_NEW_FILE, {textKey:"uploadNewFile", tooltipKey:"uploadNewFile", image:"Upload", textPrecedence:70});
	ZmOperation.registerOp(ZmId.OP_NEW_PRESENTATION, {textKey:"newPresentationBeta", tooltipKey:"newPresentation", image:"Presentation", textPrecedence:10});
	ZmOperation.registerOp(ZmId.OP_NEW_SPREADSHEET, {textKey:"newSpreadSheetBeta", tooltipKey:"newSpreadSheet", image:"ZSpreadSheet", textPrecedence:11});
	ZmOperation.registerOp(ZmId.OP_NEW_DOC, {textKey:"newDocument", tooltipKey:"newDocument", image:"Doc", shortcut:ZmKeyMap.NEW_DOC, textPrecedence:12});
	ZmOperation.registerOp(ZmId.OP_SHARE_BRIEFCASE, {textKey:"shareFolder", image:"SharedMailFolder"}, ZmSetting.SHARING_ENABLED);
	ZmOperation.registerOp(ZmId.OP_MOUNT_BRIEFCASE, {textKey:"mountBriefcase", image:"Notebook"}, ZmSetting.SHARING_ENABLED);
	ZmOperation.registerOp(ZmId.OP_OPEN_FILE, {textKey:"openFile", tooltipKey:"openFileTooltip", image:"NewPage"});
	ZmOperation.registerOp(ZmId.OP_SAVE_FILE, {textKey:"saveFile", tooltipKey:"saveFileTooltip", image:"Save"});
	ZmOperation.registerOp(ZmId.OP_VIEW_FILE_AS_HTML, {textKey:"viewFileAsHtml", tooltipKey:"viewAsHtml", image:"HtmlDoc"});
	ZmOperation.registerOp(ZmId.OP_SEND_FILE, {textKey:"sendLink", tooltipKey:"sendLink", image:"Send"});
	ZmOperation.registerOp(ZmId.OP_SEND_FILE_AS_ATT, {textKey:"sendAsAttachment", tooltipKey:"sendAsAttachment", image:"Attachment"});
	ZmOperation.registerOp(ZmId.OP_SEND_FILE_MENU, {textKey:"send", image:"Send", textPrecedence:75});
	ZmOperation.registerOp(ZmId.OP_CREATE_SLIDE_SHOW, {textKey:"createSlideShow", image:"Presentation"});
    ZmOperation.registerOp(ZmId.OP_EDIT, {textKey: "edit", image:"Edit"});
};

ZmBriefcaseApp.prototype._registerSettings =
function(settings) {
	settings = settings || appCtxt.getSettings();
	settings.registerSetting("SPREADSHEET_ENABLED",	{name:"zimbraFeatureBriefcaseSpreadsheetEnabled", type:ZmSetting.T_COS, dataType: ZmSetting.D_BOOLEAN, defaultValue:true});
	settings.registerSetting("SLIDES_ENABLED",		{name:"zimbraFeatureBriefcaseSlidesEnabled", type:ZmSetting.T_COS, dataType: ZmSetting.D_BOOLEAN, defaultValue:true});
	settings.registerSetting("DOCS_ENABLED",		{name:"zimbraFeatureBriefcaseDocsEnabled", type:ZmSetting.T_COS, dataType: ZmSetting.D_BOOLEAN, defaultValue:true});
    settings.registerSetting("PREVIEW_ENABLED",		{ type:ZmSetting.T_COS, dataType: ZmSetting.D_BOOLEAN, defaultValue:false});
};

ZmBriefcaseApp.prototype._registerItems =
function() {
	ZmItem.registerItem(ZmItem.BRIEFCASE_ITEM,
						{app:			ZmApp.BRIEFCASE,
						 nameKey:		"file",
                         countKey:      "typeFile",
						 icon:			"GenericDoc",
						 soapCmd:		"ItemAction",
						 itemClass:		"ZmBriefcaseItem",
						 node:			"doc",
						 organizer:		ZmOrganizer.BRIEFCASE,
						 dropTargets:	[ZmOrganizer.TAG, ZmOrganizer.BRIEFCASE],
						 searchType:	"document",
						 resultsList:
		AjxCallback.simpleClosure(function(search) {
            AjxDispatcher.require("BriefcaseCore");
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
								 icon:			"Briefcase",
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
					  icon:					"Briefcase",
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
 * @param {Hash}	creates		a hash of create notifications
 * 
 * @private
 */
ZmBriefcaseApp.prototype.createNotify =
function(creates, force) {

	if (!creates["folder"] && !creates["doc"] && !creates["link"]) { return; }
	if (!force && !this._noDefer && this._deferNotifications("create", creates)) { return; }

	for (var name in creates) {
		var clist = creates[name];
		for (var i = 0; (clist != null) && i < clist.length; i++) {
			var create = clist[i];
			if (appCtxt.cacheGet(create.id)) { continue; }

			if (name == "folder") {
				this._handleCreateFolder(create, ZmOrganizer.BRIEFCASE);
			} else if (name == "link") {
				this._handleCreateLink(create, ZmOrganizer.BRIEFCASE);
			} else if (name == "doc") {
				var bc = AjxDispatcher.run("GetBriefcaseController");
                bc.handleCreateNotify(create);
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

/**
 * Creates a new document.
 * 
 * @param	{String}	contentType		the content type
 * @param	{String}	new				the document name
 * @param	{String}	winName			the name of the popup doc window
 */
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

    if(this.getBriefcaseController().chkFolderPermission(folderId)) {
        var url = this.getEditURLForContentType(contentType) + "?" + (name ?"name=" + name + "&" : "") + "l="+folderId + (window.isTinyMCE ? "&editor=tinymce" : "") + "&skin=" + appCurrentSkin + "&localeId=" + AjxEnv.DEFAULT_LOCALE;
        var winname = winName || name || (new Date()).getTime().toString();
        window.open(url, winname); //bug:44324 removed new launching window
    }
};

/**
 * Gets the popup doc window features.
 * 
 * @return	{String}	 the window features
 */
ZmBriefcaseApp.getDocWindowFeatures =
function() {
    return [
        "width=",(screen.width || 640),",",
        "height=",(screen.height || 480),",",
        "fullscreen=yes"
    ].join("");
};

/**
 * Adds the editor parameter to the REST URL.
 * 
 * @param	{String}	restUrl		the REST URL
 * @return	{String}	the resulting REST URL
 * @private
 */
ZmBriefcaseApp.addEditorParam =
function(restUrl) {
    if(restUrl && window.isTinyMCE) {
        restUrl += (restUrl.match(/\?/) ?  "&editor=tinymce" : "?editor=tinymce");
    }
    return restUrl;
};

/**
 * Gets the edit URL.
 * 
 * @param	{String}	contentType		the content type
 * 
 * @return	{String}	the URL
 */
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

/**
 * Checks if the item is a doclet.
 * 
 * @param	{ZmBriefcaseItem}	item		the item
 * @return	{Boolean}	<code>true</code> if the item is a doclet
 */
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

/**
 * Performs a search.
 * 
 * @param {Hash}	params			a hash of parameters
 * @param {String}	params.folderId			the ID of briefcase folder to search in
 * @param {String}	[params.query]				the query to send (overrides folderId)
 * @param {AjxCallback}	[params.callback]			the callback
 * @param {String}	[params.accountName]		the account name
 * @param {Boolean}	[params.noRender]			if <code>true</code>, do not display results
 * @param {Boolean}	[params.noClear]			if <code>true</code>, do not destroy previous search results
 */
ZmBriefcaseApp.prototype.search =
function(params) {

	params = params || {};
	var folder = appCtxt.getById(params.folderId || ZmOrganizer.ID_BRIEFCASE);
	var searchParams = {
		query:			params.query || folder.createQuery(),
		types:			[ZmItem.BRIEFCASE_ITEM],
		limit:			this.getLimit(),
		searchFor:		ZmId.ITEM_BRIEFCASE,
		callback:		params.callback,
		accountName:	params.accountName,
		noRender:		params.noRender,
		noClear:		params.noClear
	};
	var sc = appCtxt.getSearchController();
	sc.searchAllAccounts = false;
	sc.search(searchParams);
};

/**
 * Shows the search results.
 * 
 * @param	{Object}	results	the results
 * @param	{AjxCallback}	callback		the callback
 */
ZmBriefcaseApp.prototype.showSearchResults =
function(results, callback) {
	var loadCallback = new AjxCallback(this, this._handleLoadShowSearchResults, [results, callback]);
	AjxDispatcher.require(["BriefcaseCore", "Briefcase"], false, loadCallback, null, true);
};

ZmBriefcaseApp.prototype._handleLoadShowSearchResults =
function(results, callback) {
	this.getBriefcaseController().show(results);
	if (callback) { callback.run(); }
};

ZmBriefcaseApp.prototype.setActive =
function(active) {
};

// return enough for us to get a scroll bar since we are pageless
/**
 * Gets the limit for the search triggered by the application launch or an overview click.
 * 
 * @param	{Boolean}	offset	if <code>true</code> app has offset
 * @return	{int}	the limit
 */
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
	var params = {
		data:			{msgId:msgId,partId:partId},
		treeIds:		[ZmOrganizer.BRIEFCASE],
		overviewId:		dlg.getOverviewId(this._name),
		title:			ZmMsg.addToBriefcaseTitle,
		description:	ZmMsg.targetFolder,
		appName:		ZmApp.BRIEFCASE
	};
    params.omit = {};
    params.omit[ZmFolder.ID_TRASH] = true;
    return params;
};

ZmBriefcaseApp.prototype._chooserCallback =
function(msgId, partId, name, folder) {
    //TODO: Avoid using search, instead try renaming on failure
	var callback = new AjxCallback(this, this.handleDuplicateCheck, [msgId, partId, name, folder]);
	this.search({query:folder.createQuery(), noRender:true, callback:callback, accountName:(folder && folder.account && folder.account.name) || undefined});
};

ZmBriefcaseApp.prototype.handleDuplicateCheck =
function(msgId, partId, name, folder, results) {

	var msg = appCtxt.getById(msgId);

	var briefcase = folder;
	if (briefcase.isReadOnly(folder.id)) {
		ZmOrganizer._showErrorMsg(ZmMsg.errorPermission);
		return;
	}

	if (msgId.indexOf(":") < 0) {
		msgId = msg.getAccount().id + ":" + msg.id;
	}


	var searchResult = results.getResponse();
	var items = searchResult && searchResult.getResults(ZmItem.BRIEFCASE_ITEM);
	if (items instanceof ZmList) {
		items = items.getArray();
	}

    var itemFound = false;
	for (var i = 0, len = items.length; i < len; i++) {
		if (items[i].name == name) {
			itemFound = items[i];
			break;
		}
	}

    var folderId = (!folder.account || folder.account == appCtxt.getActiveAccount() || (folder.id.indexOf(":") != -1)) ? folder.id : [folder.account.id, folder.id].join(":");	
    if(itemFound){
       var dlg = appCtxt.getYesNoMsgDialog();
        dlg.registerCallback(DwtDialog.YES_BUTTON, this._createFromAttachment, this, [msgId, partId, name, folderId, itemFound, dlg]);
		dlg.setMessage(AjxMessageFormat.format(ZmMsg.errorFileAlreadyExistsReplace, name), DwtMessageDialog.WARNING_STYLE);
		dlg.popup();
    }else{
       this._createFromAttachment(msgId, partId, name, folderId); 
    }
};

ZmBriefcaseApp.prototype._createFromAttachment =
function(msgId, partId, name, folderId, replaceItem, dlg){
    var srcData = new ZmBriefcaseItem();
    srcData.createFromAttachment(msgId, partId, name, folderId, replaceItem);
    if(dlg)
        dlg.popdown();
};

/**
 * @private
 */
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
