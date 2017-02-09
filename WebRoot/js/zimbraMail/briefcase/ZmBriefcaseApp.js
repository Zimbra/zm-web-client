/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016 Synacor, Inc.
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
 * All portions of the code are Copyright (C) 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016 Synacor, Inc. All Rights Reserved.
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

ZmBriefcaseApp.prototype.isZmBriefcaseApp = true;
ZmBriefcaseApp.prototype.toString = function() { return "ZmBriefcaseApp"; };


// Constants

// Organizer and item-related constants
ZmEvent.S_BRIEFCASE_ITEM			= ZmId.ITEM_BRIEFCASE;
ZmItem.BRIEFCASE_ITEM				= ZmEvent.S_BRIEFCASE_ITEM;
ZmItem.BRIEFCASE					= ZmItem.BRIEFCASE_ITEM;	// back-compatibility

ZmEvent.S_BRIEFCASE_REVISION_ITEM			= ZmId.ITEM_BRIEFCASE_REV;
ZmItem.BRIEFCASE_REVISION_ITEM				= ZmEvent.S_BRIEFCASE_REVISION_ITEM;
ZmItem.BRIEFCASE_REVISION					= ZmItem.BRIEFCASE_REVISION_ITEM;	// back-compatibility

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


ZmBriefcaseApp.prototype._defineAPI =
function() {
	AjxDispatcher.setPackageLoadFunction("BriefcaseCore", new AjxCallback(this, this._postLoadCore));
	AjxDispatcher.setPackageLoadFunction("Briefcase", new AjxCallback(this, this._postLoad, ZmOrganizer.BRIEFCASE));
	AjxDispatcher.registerMethod("GetBriefcaseController", ["BriefcaseCore", "Briefcase"], new AjxCallback(this, this.getBriefcaseController));
};

ZmBriefcaseApp.prototype._registerOperations =
function() {
	ZmOperation.registerOp(ZmId.OP_NEW_BRIEFCASE, {textKey:"newBriefcase", image:"NewFolder", tooltipKey:"newBriefcaseTooltip", shortcut:ZmKeyMap.NEW_BRIEFCASE});
	ZmOperation.registerOp(ZmId.OP_NEW_FILE, {textKey:"uploadNewFile", tooltipKey:"uploadNewFile", textPrecedence:70, showImageInToolbar:true, showTextInToolbar:true});
	ZmOperation.registerOp(ZmId.OP_NEW_DOC, {textKey:"newDocument", tooltipKey:"newDocument", image:"NewDoc", shortcut:ZmKeyMap.NEW_DOC, textPrecedence:12});
	ZmOperation.registerOp(ZmId.OP_SHARE_BRIEFCASE, {textKey:"shareFolder", image:"SharedMailFolder"}, ZmSetting.SHARING_ENABLED);
	ZmOperation.registerOp(ZmId.OP_OPEN_FILE, {textKey:"openFile", tooltipKey:"openFileTooltip", image:"NewDoc"});
	ZmOperation.registerOp(ZmId.OP_SAVE_FILE, {textKey:"saveFile", tooltipKey:"saveFileTooltip", image:"DownArrow"});
	ZmOperation.registerOp(ZmId.OP_VIEW_FILE_AS_HTML, {textKey:"viewFileAsHtml", tooltipKey:"viewAsHtml", image:"HtmlDoc"});
	ZmOperation.registerOp(ZmId.OP_SEND_FILE, {textKey:"sendLink", tooltipKey:"sendLink", image:"Send"});
	ZmOperation.registerOp(ZmId.OP_SEND_FILE_AS_ATT, {textKey:"sendAsAttachment", tooltipKey:"sendAsAttachment", image:"Attachment"});
	ZmOperation.registerOp(ZmId.OP_SEND_FILE_MENU, {textKey:"send", image:"Send", textPrecedence:75});
    ZmOperation.registerOp(ZmId.OP_EDIT_FILE, {textKey: "edit", image:"Edit"});
    ZmOperation.registerOp(ZmId.OP_RENAME_FILE, {textKey: "rename", image:"FileRename"});
    ZmOperation.registerOp(ZmId.OP_CHECKIN, {textKey: "checkInFile", image:"Checkin"});
    ZmOperation.registerOp(ZmId.OP_CHECKOUT, {textKey: "checkOutFile", image:"Checkout"});
    ZmOperation.registerOp(ZmId.OP_DISCARD_CHECKOUT, {textKey: "checkOutFileDiscard", image:"DiscardCheckout"});    
    ZmOperation.registerOp(ZmId.OP_VERSION_HISTORY, {textKey: "versionHistory", image:"VersionHistory"});
    ZmOperation.registerOp(ZmId.OP_RESTORE_VERSION, {textKey: "restoreCurrentVersion", image:"RestoreVersion"});
    ZmOperation.registerOp(ZmId.OP_DELETE_VERSION, {textKey: "deleteVersion", image:"Delete"});
};

ZmBriefcaseApp.prototype._registerSettings =
function(settings) {
	settings = settings || appCtxt.getSettings();
	settings.registerSetting("DOCS_ENABLED",		{name:"zimbraFeatureBriefcaseDocsEnabled", type:ZmSetting.T_COS, dataType: ZmSetting.D_BOOLEAN, defaultValue:true});
    settings.registerSetting("PREVIEW_ENABLED",		{ type:ZmSetting.T_COS, dataType: ZmSetting.D_BOOLEAN, defaultValue:false});
	settings.registerSetting("READING_PANE_LOCATION_BRIEFCASE",		{name:"zimbraPrefBriefcaseReadingPaneLocation", type:ZmSetting.T_PREF, dataType:ZmSetting.D_STRING, defaultValue:ZmSetting.RP_BOTTOM, isImplicit:true});
};

ZmBriefcaseApp.prototype._registerItems =
function() {
	ZmItem.registerItem(ZmItem.BRIEFCASE_ITEM,
						{app:			ZmApp.BRIEFCASE,
						 nameKey:		"file",
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
							 nameKey        : "folder",
							 defaultFolder  : ZmOrganizer.ID_BRIEFCASE,
							 soapCmd        : "FolderAction",
							 firstUserId    : 256,
							 orgClass       : "ZmBriefcase",
							 orgPackage     : "BriefcaseCore",
							 treeController : "ZmBriefcaseTreeController",
							 labelKey       : "briefcaseFolders",
							 itemsKey       : "files",
							 treeType       : ZmOrganizer.FOLDER,
							 views          : ["document"],
							 folderKey      : "briefcase",                                                      
							 mountKey       : "mountFolder",
							 createFunc     : "ZmOrganizer.create",
							 compareFunc    : "ZmFolder.sortCompareNonMail",
							 deferrable     : true,
							 newOp			: ZmOperation.NEW_BRIEFCASE,
							 displayOrder	: 100,
							 hasColor       : true,
							 defaultColor	: ZmOrganizer.C_NONE,
							 childWindow    : true
							});
};

ZmBriefcaseApp.prototype._setupSearchToolbar =
function() {
	//TODO:search for page alone
	ZmSearchToolBar.addMenuItem(ZmItem.BRIEFCASE_ITEM,
								{msgKey:		"files",
								 tooltipKey:	"searchForFiles",
								 icon:			"Doc",
								 shareIcon:		null, // the following doesn't work now, so keep the regular icon. doesn't really matter in my opinion --> "SharedBriefcase",
								 setting:		ZmSetting.BRIEFCASE_ENABLED,
								 id:			ZmId.getMenuItemId(ZmId.SEARCH, ZmId.ITEM_BRIEFCASE),
								 disableOffline:true
								});
};

ZmBriefcaseApp.prototype._registerApp =
function() {
	var newItemOps = {};
	newItemOps[ZmOperation.NEW_DOC]			= "document";

	var newOrgOps = {};
	newOrgOps[ZmOperation.NEW_BRIEFCASE]	 = "briefcase";

	var actionCodes = {};
	actionCodes[ZmKeyMap.NEW_FILE]			= ZmOperation.NEW_FILE;
	actionCodes[ZmKeyMap.NEW_BRIEFCASE]		= ZmOperation.NEW_BRIEFCASE;
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
					  newActionCode:		ZmKeyMap.NEW_DOC,
					  chooserSort:			70,
					  defaultSort:			60,
					  searchResultsTab:		true
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

ZmBriefcaseApp.prototype.modifyNotify =
function(modifies, force) {
    if (!modifies["doc"]) { return; }
	var bc = AjxDispatcher.run("GetBriefcaseController");
    bc.handleModifyNotify(modifies);
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

    if (AjxDispatcher.run("GetBriefcaseController").chkFolderPermission(folderId)) {
        if (contentType == ZmMimeTable.APP_ZIMBRA_DOC) {
            var win = appCtxt.getNewWindow(false, null, null, winName);
	        if (win) {
	            win.command = "documentEdit";
	            win.params = { name: name, folderId: folderId };
	        }
        }
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
        "scrollbars=yes,",
        "resizable=yes"
    ].join("");
};

ZmBriefcaseApp.prototype._handleNewItem =
function() {
	appCtxt.getAppViewMgr().popView(true, ZmId.VIEW_LOADING);	// pop "Loading..." page
	AjxDispatcher.run("GetBriefcaseController").__popupUploadDialog(ZmMsg.uploadFileToBriefcase);
};

ZmBriefcaseApp.prototype._handleLoadNewBriefcase =
function() {
	appCtxt.getAppViewMgr().popView(true, ZmId.VIEW_LOADING); // pop "Loading..." page

	if (!this._newBriefcaseCb) {
		this._newBriefcaseCb = this._newBriefcaseCallback.bind(this);
	}
	ZmController.showDialog(appCtxt.getNewBriefcaseDialog(), this._newBriefcaseCb);
};


// Public methods

ZmBriefcaseApp.prototype.launch =
function(params, callback) {
	this._setLaunchTime(this.toString(), new Date());
	var loadCallback = this._handleLoadLaunch.bind(this, callback);
	AjxDispatcher.require(["BriefcaseCore","Briefcase"], true, loadCallback, null, true);

    // In case of external sharing we replace drop down button options with New Document button
    if (appCtxt.isExternalAccount()) {
        var newButton = appCtxt.getAppController().getNewButton();
        newButton.removePullDownMenuOptions();
    }
};

ZmBriefcaseApp.prototype._handleLoadLaunch =
function(callback) {
	this.search();
	if (callback) { callback.run(); }
};

ZmBriefcaseApp.prototype.getNewButtonProps =
function() {
	return {
		text:		ZmMsg.newDocument,
		tooltip:	ZmMsg.newDocument,
		icon:		"NewDoc",
		iconDis:	"NewDocDis",
		defaultId:	ZmOperation.NEW_DOC,
        disabled:	!this.containsWritableFolder()
	};
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
 */
ZmBriefcaseApp.prototype.search =
function(params) {

	params = params || {};
    var folderId = params.folderId || (appCtxt.isExternalAccount() ? this.getDefaultFolderId() : ZmOrganizer.ID_BRIEFCASE);
	var folder = appCtxt.getById(folderId);

	var searchParams = {
		query:			params.query || folder.createQuery(),
		types:			[ZmItem.BRIEFCASE_ITEM],
		limit:			this.getLimit(),
		searchFor:		ZmId.ITEM_BRIEFCASE,
		callback:		params.callback,
		accountName:	params.accountName,
		noRender:		params.noRender
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
function(results, callback, searchResultsController) {
	var loadCallback = this._handleLoadShowSearchResults.bind(this, results, callback, searchResultsController);
	AjxDispatcher.require(["BriefcaseCore", "Briefcase"], false, loadCallback, null, true);
};

ZmBriefcaseApp.prototype._handleLoadShowSearchResults =
function(results, callback, searchResultsController) {
	var sessionId = searchResultsController ? searchResultsController.getCurrentViewId() : ZmApp.MAIN_SESSION;
	var controller = AjxDispatcher.run("GetBriefcaseController", sessionId, searchResultsController);
	controller.show(results);
	this._setLoadedTime(this.toString(), new Date());
	if (callback) {
		callback.run(controller);
	}
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
function(sessionId, searchResultsController) {
	return this.getSessionController({controllerClass:			"ZmBriefcaseController",
									  sessionId:				sessionId || ZmApp.MAIN_SESSION,
									  searchResultsController:	searchResultsController});
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
    AjxDispatcher.run("GetBriefcaseController").createFromAttachment(msgId, partId, name);
};


//Make sure we load BriefcaseCore before calling _creatDeferredFolders() from child window.
ZmBriefcaseApp.prototype._createDeferredFolders =
function(type) {
	AjxPackage.require("BriefcaseCore");
	ZmApp.prototype._createDeferredFolders.call(this, type);
};



// --- Briefcase External DnD upload initiation

ZmBriefcaseApp.prototype.initExternalDndUpload = function(files, node, isInline, selectionCallback, folderId) {
	var name = "";

	if (!AjxEnv.supportsHTML5File) {
		// IE, FF 3.5 and lower - use the File browser
		if (selectionCallback) {
			selectionCallback.run();
		}
		return;
	}

	if (!files) {
		files = node.files;
	}

	var size = 0;
	if (files) {
		var file;
		var docFiles = [];
		var errors   = {};
		var aCtxt    = ZmAppCtxt.handleWindowOpener();
		var maxSize  = aCtxt.get(ZmSetting.DOCUMENT_SIZE_LIMIT);
		var briefcaseController = AjxDispatcher.run("GetBriefcaseController");

		if (!folderId) {
			if (briefcaseController) {
				folderId = briefcaseController.getFolderId();
			}
			if(!folderId || folderId == ZmOrganizer.ID_TRASH) {
				folderId = ZmOrganizer.ID_BRIEFCASE;
			}
		}

		if(this.chkFolderPermission(folderId)){
			var cFolder = appCtxt.getById(folderId);
			var uploadManager = appCtxt.getZmUploadManager();

			var errors = [];
			for (var i = 0; i < files.length; i++){
				var newError = uploadManager.getErrors(files[i], maxSize);
				if (newError) {
					errors.push(newError);
				}
			}
			if (errors.length > 0) {
				var errorMsg = uploadManager.createUploadErrorMsg(errors, maxSize, "<br>");
				var msgDlg = appCtxt.getMsgDialog();
				msgDlg.setMessage(errorMsg, DwtMessageDialog.WARNING_STYLE);
				msgDlg.popup();
			} else {
				var params = {
					attachment:              false,
					uploadFolder:            cFolder,
					files:                   files,
					notes:                   "",
					allResponses:            null,
					start:                   0,
					curView:                 null,
					preAllCallback:          null,
					initOneUploadCallback:   null,
					progressCallback:        null,
					errorCallback:           null,
					completeOneCallback:     null,
					completeAllCallback:     this.uploadSaveDocs.bind(this),
					completeDocSaveCallback: this._finishUpload.bind(this, null)
				}
				uploadManager.upload(params);
			}
		}
	}
};

ZmBriefcaseApp.prototype.chkFolderPermission = function(folderId){
	var briefcase = appCtxt.getById(folderId);
	if(briefcase.isRemote() && briefcase.isReadOnly()){
		var dialog = appCtxt.getMsgDialog();
		dialog.setMessage(ZmMsg.errorPermissionCreate, DwtMessageDialog.WARNING_STYLE);
		dialog.popup();
		return false;
	}
	return true;
};

// --- Briefcase Upload Completion - SaveDocuments and Conflict resolution ------

/**
 * uploadSaveDocs performs SaveDocument calls, creating a document with an associated uploadId.  If the file
 * already exists, conflict resolution is performed.
 *
 * @param	{object}	params		params to customize the upload flow:
 *      uploadFolder                Folder to save associated document into
 *      files:                      raw File object from the external HTML5 drag and drop
 *      notes:                      Notes associated with each of the files being added
 *      allResponses:               All the server responses.  Contains the uploadId (guid) for a file
 *      errorCallback:              Run upon an error
 *      conflictAction			    If specified, the action used to resolve a file conflict
 *      preResolveConflictCallback: Standard processing (SaveDocument), Run prior to conflict resolution
 *      completeDocSaveCallback:    Standard processing (SaveDocument), Run when all documents have been saved
 *
 */
ZmBriefcaseApp.prototype.uploadSaveDocs = function(allResponses, params, status, guids) {
	if (status != AjxPost.SC_OK) {
		var errorMessage = appCtxt.getAppController().createErrorMessage(ZmItem.BRIEFCASE, status);
		this._popupErrorDialog(errorMessage, params.errorCallback);
	} else {
		var docFiles;
		if (allResponses) {
			// External DnD files
		    docFiles = [];
			var files    = params.files;
			if (allResponses.length === files.length) {
				for (var i = 0; i < files.length; i++){
					var file = files[i];
					var response = allResponses[i];
					var aid = (response && response.aid);
					docFiles.push(
						{name:     file.name,
						 fullname: file.name,
						 notes:    params.notes,
						 version:  file.version,
						 id:	   file.id,
						 guid:     aid,
						 preventDuplicate: file.preventDuplicate});
				}
				params.docFiles = docFiles;
			}
		} else {
			// AjxPost callback, providing the guids separately
			docFiles = params.docFiles;
			if (guids) {
				guids = guids.split(",");
				for (var i = 0; i < docFiles.length; i++) {
					DBG.println("guids[" + i + "]: " + guids[i] + ", files[" + i + "]: " + docFiles[i]);
					docFiles[i].guid = guids[i];
				}
			}
		}
		if (params.uploadFolder) {
			this._uploadSaveDocs2(params);
		} else {
			this._completeUpload(params);
		}
	}
};

ZmBriefcaseApp.prototype._popupErrorDialog = function(message, errorCallback) {
	if (errorCallback) {
		errorCallback.run();
	}
	var dialog = appCtxt.getMsgDialog();
	dialog.setMessage(message, DwtMessageDialog.CRITICAL_STYLE);
	dialog.popup();
};

ZmBriefcaseApp.prototype._uploadSaveDocs2 = function(params) {

	// create document wrappers
	var request = [];
	var foundOne = false;
	var docFiles = params.docFiles;
	for (var i = 0; i < docFiles.length; i++) {
		var file = docFiles[i];
		if (file.done) {
			continue;
		}
		foundOne = true;

		var SaveDocumentRequest = { _jsns: "urn:zimbraMail", requestId: i, doc: {}}
		var doc = SaveDocumentRequest.doc;
		if (file.id) {
			doc.id = file.id;
			doc.ver = file.version;
		} else {
			doc.l = params.uploadFolder.id;
		}
		if (file.notes) {
			doc.desc = file.notes;
		}
		doc.upload = {
			id: file.guid
		}
		request.push(SaveDocumentRequest);
	}

	if (foundOne) {
		var json = {
			BatchRequest: {
				_jsns: "urn:zimbra",
				onerror: "continue",
				SaveDocumentRequest: ( (request.length == 1) ? request[0] : request )
			}
		};
		var callback = this._uploadSaveDocsResponse.bind(this, params);
		var saveDocParams = {
			jsonObj:  json,
			asyncMode:true,
			callback: callback
		};
		var appController = appCtxt.getAppController();
		appController.sendRequest(saveDocParams);
	}
	else {
		// This calls the callback of the client - e.g. ZmHtmlEditor.prototype._imageUploaded since
		// _uploadSaveDocsResponse is not called in this case, we still need the client callback since the
		// user chose the "old" version of the image
		this._completeUpload(params);
	}
};

ZmBriefcaseApp.prototype._uploadSaveDocsResponse = function(params, response) {
	var resp = response && response._data && response._data.BatchResponse;
	var docFiles = params.docFiles;

	// mark successful uploads
	if (resp && resp.SaveDocumentResponse) {
		for (var i = 0; i < resp.SaveDocumentResponse.length; i++) {
			var saveDocResp = resp.SaveDocumentResponse[i];
			docFiles[saveDocResp.requestId].done    = true;
			docFiles[saveDocResp.requestId].name    = saveDocResp.doc[0].name;
			docFiles[saveDocResp.requestId].id      = saveDocResp.doc[0].id;
			docFiles[saveDocResp.requestId].ver     = saveDocResp.doc[0].ver;
			docFiles[saveDocResp.requestId].version = saveDocResp.doc[0].ver;
		}
	}

	// check for conflicts
	var mailboxQuotaExceeded = false;
	var alreadyExists = false;
	var uploadRejected = false;
	var isItemLocked = false;
	var code = 0;
	var conflicts = [];
	if (resp && resp.Fault) {
		var errors = [];
		var uploadRejected = false, rejectedFile = "Unknown", rejectedReason = "Unknown";
		for (var i = 0; i < resp.Fault.length; i++) {
			var fault = resp.Fault[i];
			var error = fault.Detail.Error;
			code = error.Code;
			var attrs = error.a;
			isItemLocked = (code == ZmCsfeException.LOCKED);
			var file = docFiles[fault.requestId];
			if ((code == ZmCsfeException.MAIL_ALREADY_EXISTS) && file.preventDuplicate) {
				alreadyExists = true;
			} else if (code == ZmCsfeException.MAIL_ALREADY_EXISTS ||
				code == ZmCsfeException.MODIFY_CONFLICT) {
				for (var p in attrs) {
					var attr = attrs[p];
					switch (attr.n) {
						case "itemId" : { file.id      = attr._content; break }
						case "id":      { file.id      = attr._content; break; }
						case "ver":     { file.version = attr._content; break; }
						case "name":    { file.name    = attr._content; break; }
					}
				}
				file.version = file.version || 1;
				conflicts.push(file);
			}else {
				DBG.println("Unknown error occurred: " + code);
				if (code == ZmCsfeException.MAIL_QUOTA_EXCEEDED) {
					mailboxQuotaExceeded = true;
				}  else if (code === ZmCsfeException.UPLOAD_REJECTED) {
					uploadRejected = true;
					for (var p in attrs) {
						var attr = attrs[p];
						switch (attr.n) {
							case "reason" : rejectedReason = attr._content; break;
							case "name":    rejectedFile   = attr._content; break;
						}
					}
				}

				errors[fault.requestId] = fault;
			}
		}
	}

	// dismiss dialog/enable the upload button
	if (params.preResolveConflictCallback) {
		params.preResolveConflictCallback.run();
	}

	// TODO: What to do about other errors?
	// TODO: This should handle reporting several errors at once
	if (mailboxQuotaExceeded) {
		this._popupErrorDialog(ZmMsg.errorQuotaExceeded, params.errorCallback);
		return;
	} else 	if (alreadyExists) {
		this._popupErrorDialog(AjxMessageFormat.format(ZmMsg.itemWithFileNameExits, file.name), params.errorCallback);
		return;
	} else if (isItemLocked) {
		this._popupErrorDialog(ZmMsg.errorItemLocked, params.errorCallback);
		return;
	} else if (uploadRejected) {
		var rejectedMsg = AjxMessageFormat.format(ZmMsg.uploadRejectedError, [ rejectedFile, rejectedReason ] );
		this._popupErrorDialog(rejectedMsg, params.errorCallback);
		return;
	}
	else if (code == ZmCsfeException.SVC_PERM_DENIED) {
		this._popupErrorDialog(ZmMsg.errorPermissionDenied, params.errorCallback);
		return;
	}

	// resolve conflicts
	var conflictCount = conflicts.length;

	var action = params.conflictAction || ZmBriefcaseApp.ACTION_KEEP_MINE;
	if (conflictCount > 0 && action == ZmBriefcaseApp.ACTION_ASK) {
		var dialog = appCtxt.getUploadConflictDialog();
		dialog.popup(params.uploadFolder, conflicts, this._uploadSaveDocs2.bind(this, params));
	} else if (conflictCount > 0 && action == ZmBriefcaseApp.ACTION_KEEP_MINE) {
		if (params.conflictAction) {
			this._shieldSaveDocs(params);
		} else {
			this._uploadSaveDocs2(params);
		}
	} else {
		this._completeUpload(params);
	}
};

ZmBriefcaseApp.prototype._shieldSaveDocs = function(params) {
	var dlg = appCtxt.getYesNoMsgDialog();
	dlg.reset();
	dlg.setButtonListener(DwtDialog.YES_BUTTON, new AjxListener(this, this._shieldSaveDocsYesCallback, [dlg, params]));
	dlg.setMessage(ZmMsg.uploadConflictShield, DwtMessageDialog.WARNING_STYLE, ZmMsg.uploadConflict);
	dlg.popup();
};

ZmBriefcaseApp.prototype._shieldSaveDocsYesCallback = function(dlg, params) {
	this._uploadSaveDocs2(params);
	dlg.popdown();
};

ZmBriefcaseApp.prototype._completeUpload = function(params) {
	if (params.completeDocSaveCallback) {
		params.completeDocSaveCallback.run(params.docFiles, params.uploadFolder);
	}
};

ZmBriefcaseApp.prototype._finishUpload = function(finishCallback, docFiles, uploadFolder) {
	var filenames = [];
	for (var i in docFiles) {
		var name = docFiles[i].name;
		filenames.push(name);
	}
	this._handlePostUpload(uploadFolder, filenames, docFiles);

	if (finishCallback) {
		finishCallback(docFiles);
	}
};

ZmBriefcaseApp.prototype._handlePostUpload = function(folder, filenames, files) {
	var msg = ZmMsg.successfullyUploaded;
	if(files.length > 1){
		msg = AjxMessageFormat.format(ZmMsg.successfullyUploadedFiles, files.length);
	}
	appCtxt.setStatusMsg(msg, ZmStatusView.LEVEL_INFO);
	// Remove the previous selection(s)
	var briefcaseController = AjxDispatcher.run("GetBriefcaseController");
	briefcaseController.resetSelection();
};



ZmBriefcaseApp.ACTION_KEEP_MINE = "mine";
ZmBriefcaseApp.ACTION_KEEP_THEIRS = "theirs";
ZmBriefcaseApp.ACTION_ASK = "ask";


