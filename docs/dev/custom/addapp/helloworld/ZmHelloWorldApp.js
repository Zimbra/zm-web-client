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
 * This file contains a Hello World app that is designed
 * to map out all of the expected settings needed to create
 * an application.
 */

/**
 * Creates and initializes the Hello World app.
 *
 * This is called during initialization time, and only
 * sets up the basic control needed to initalize the
 * application.
 *
 * @class
 * The Hello World app demonstrates the bare functionality needed
 * to drop a new application into the Zimbra Web Client.
 *
 * @param container {DwtControl} the container.
 * @param parentController {ZmController} the parent window controller
 * (set by the child window).
 *
 * @extends ZmApp
 */
ZmHelloWorldApp = function(container, parentController) {
    // All apps inherit from the ZmApp.
    // The HelloWorld app probably doesn't need a parentController,
    // but we'll allow one just in case.
    // The actual definition of ZmApp.HELLOWORLD happens both here and as
    // a ZmId.
    ZmApp.call(this, ZmApp.HELLOWORLD, container, parentController);
};
// Fix potential problems with calls to instanceof operator
ZmHelloWorldApp.prototype = new ZmApp;
ZmHelloWorldApp.prototype.constructor = ZmHelloWorldApp;

//-------------------------------------------------------- Class Methods
/**
 * Called during the settings registration phase of the ZWC.
 * Allows this application to register default application settings with
 * the active ZmSettings object.
 * @param settings {ZmSettings} Settings instance on which to register our
 * app.
 */
ZmHelloWorldApp.registerSettings =
function(settings) {
    settings.registerSetting(ZmSetting.HELLOWORLD_ENABLED, {
        // @TODO set to the corect name for the HelloWorld server side pref
        //name:"zimbraFeatureHelloWorldEnabled",
        type: ZmSetting.T_COS,
        dataType: ZmSetting.D_BOOLEAN,
        defaultValue: true
    });
};


//-------------------------------------------------------- Properties
/**
 * Exact string name of the app class name. Used during
 * construction.
 * @type {string}
 */
ZmHelloWorldApp.prototype.appClassName = "ZmHelloWorldApp";

/**
 * Pointer to the main app controller.
 * @type ZmHelloWorldController
 * @private
 */
ZmHelloWorldApp.prototype._controller = null;

//-------------------------------------------------------- Methods
/**
 * Returns a string representation of the object, and can help in
 * simple type checks.
 *
 * @return {String} a string representation of the object.
 */
ZmHelloWorldApp.prototype.toString =
function() {
	return this.appClassName;
};

/**
 * Called automatically during construction of the application on a call
 * to the parent ZmApp.
 * This is the first function called in a chain of initialization functions.
 */
ZmHelloWorldApp.prototype._defineAPI =
function() {
    // Setup callbacks for the package loads.
    // Packages must be defined in:
    // ZimbraWebClient/WebRoot/js/package/HelloWorldCore.js
    // The Hello world app is so small that we'll load everything in the core.
    // _postLoadCore is inherited from ZmApp and is called automatically
    // when the package is loaded.
	AjxDispatcher.addPackageLoadFunction("HelloWorldCore", new AjxCallback(this, this._postLoadCore));
    // If hello world would be bigger, we would could postpone loading of items
    // 1-n number of other packages. On each package load, we would then be able
    // to call an onload like function that we register with the package.
	//AjxDispatcher.addPackageLoadFunction("HelloWorld", new AjxCallback(this, this._postLoad);
    // This is a good place to register callbacks for the custom event like
    // interface made available through the AjxDispatcher.
    // param1 => the api, or custom event name.
    // param2 => The minimum package required to run this api. (Either a string
    //           or an array of strings for package names.
    // param3 => The method that is subscribed to this "event".
	//AjxDispatcher.registerMethod("GetCalController", "CalendarCore", new AjxCallback(this, this.getCalController));
};

/**
 * Called during construction to register various settings that can allow
 * programmatic control within this app.
 * If an app has no parentController, then this function will be
 * called.
 * Called after _defineAPI.
 * @param [settings=appCtxt.getSettings] {ZmSettings} The over webclient
 * settings object on which we can register more settings specific to the
 * HelloWorld application.
 */
ZmHelloWorldApp.prototype._registerSettings =
function(settings) {
    // If our code had any settings, we would copy the sort of settings
    // that are found in the Briefcase code. Sample below:
    settings = settings || appCtxt.getSettings();
    settings.registerSetting("SPREADSHEET_ENABLED",	{
        name:"zimbraFeatureBriefcaseSpreadsheetEnabled",
        type:ZmSetting.T_COS,
        dataType: ZmSetting.D_BOOLEAN,
        defaultValue:false
    });
};


/**
 * Register operations specific to this application.
 * Called during the app class construction and after _registerSettings.
 */
ZmHelloWorldApp.prototype._registerOperations =
function() {
    // The Hello world app doesn't have any special user operations.
    // Below is an example taken from the briefcase code for reference.
//	ZmOperation.registerOp(ZmId.OP_NEW_BRIEFCASE, {
//        textKey:"newBriefcase",
//        image:"NewFolder",
//        tooltipKey:"newBriefcaseTooltip",
//        shortcut:ZmKeyMap.NEW_BRIEFCASE
//    });
};

/**
 * Called during the app class construction and after _registerOperations.
 */
ZmHelloWorldApp.prototype._registerItems =
function() {
    // An item is defined by ZmItem.
    // Below is an example that is used by the ZmBriefCase
//	ZmItem.registerItem(ZmItem.BRIEFCASE_ITEM,
//                {app:			ZmApp.BRIEFCASE,
//                 nameKey:		"file",
//                 countKey:      "typeFile",
//                 icon:			"GenericDoc",
//                 soapCmd:		"ItemAction",
//                 itemClass:		"ZmBriefcaseItem",
//                 node:			"doc",
//                 organizer:		ZmOrganizer.BRIEFCASE,
//                 dropTargets:	[ZmOrganizer.TAG, ZmOrganizer.BRIEFCASE],
//                 searchType:  "document",
//                 resultsList: AjxCallback.simpleClosure(function(search) {
//                        AjxDispatcher.require("BriefcaseCore");
//                        return new ZmList(ZmItem.BRIEFCASE_ITEM, search);
//                    }, this)
//                });
};


/**
 * Sets up organizers (another name for folders) that are used within
 * this application.
 * Called during the app class construction and after _registerItems.
 */
ZmHelloWorldApp.prototype._registerOrganizers =
function() {
    // We don't need any organizers for our hello world application.
    // If we did, we would register a new organizer.
    // An example of an organizer used for the briefcase can be
    // found below.
//	ZmOrganizer.registerOrg(ZmOrganizer.BRIEFCASE,
//							{app            : ZmApp.BRIEFCASE,
//							 nameKey        : "folder",
//							 defaultFolder  : ZmOrganizer.ID_BRIEFCASE,
//							 soapCmd        : "FolderAction",
//							 firstUserId    : 256,
//							 orgClass       : "ZmBriefcase",
//							 orgPackage     : "BriefcaseCore",
//							 treeController : "ZmBriefcaseTreeController",
//							 labelKey       : "folders",
//							 itemsKey       : "files",
//							 treeType       : ZmOrganizer.FOLDER,
//							 views          : ["document"],
//							 folderKey      : "briefcase",
//							 mountKey       : "mountFolder",
//							 createFunc     : "ZmOrganizer.create",
//							 compareFunc    : "ZmBriefcase.sortCompare",
//							 deferrable     : true,
//							 newOp			: ZmOperation.NEW_BRIEFCASE,
//							 displayOrder	: 100,
//							 hasColor       : true,
//							 childWindow    : true
//							});
};


/**
 * If the page does not have a parentContainer, set up the search
 * bar to be used on the page.
 * Called during the app class construction and after _registerOrganizers.
 */
ZmHelloWorldApp.prototype._setupSearchToolbar =
function() {
    // The hello world app is simple and does not require the search
    // bar.
    // If it did require a search bar, the following would be
    // code that we could use, were this a briefcase app.
//	ZmSearchToolBar.addMenuItem(ZmItem.BRIEFCASE_ITEM,
//                                {msgKey:		"searchBriefcase",
//                                 tooltipKey:	"searchForFiles",
//                                 icon:			"Doc",
//                                 shareIcon:		"SharedBriefcase",
//                                 setting:		ZmSetting.BRIEFCASE_ENABLED,
//                                 id:			ZmId.getMenuItemId(ZmId.SEARCH, ZmId.ITEM_BRIEFCASE)
//                                });
};


/**
 * This function registers the application inside of the overall
 * web client.
 * Called during the app class construction and after _setupSearchToolbar.
 * This is the final function called in the chain of functions called
 * during app construction.
 */
ZmHelloWorldApp.prototype._registerApp =
function() {
    // If this application has the concept of creating a new item,
    // register the operation here.
	var newItemOps = {};
    //newItemOps[ZmOperation.NEW_DOC]			= "document";

    // If this application has the concept of creating new organizational
    // operations, register them here.
	var newOrgOps = {};
    //newOrgOps[ZmOperation.NEW_BRIEFCASE]	 = "briefcase";

    // Map any short cut keys for this application here.
	var actionCodes = {};
	//actionCodes[ZmKeyMap.NEW_FILE]			= ZmOperation.NEW_FILE;
	//actionCodes[ZmKeyMap.NEW_BRIEFCASE]		= ZmOperation.NEW_BRIEFCASE;
	//actionCodes[ZmKeyMap.NEW_PRESENTATION]	= ZmOperation.NEW_PRESENTATION;
	//actionCodes[ZmKeyMap.NEW_SPREADSHEET]	= ZmOperation.NEW_SPREADSHEET;
	//actionCodes[ZmKeyMap.NEW_DOC]			= ZmOperation.NEW_DOC;

    // This registration is required. This is where we define the
    // definition of the tab for the application.
	ZmApp.registerApp(
            // Unique ID of our application.
            ZmApp.HELLOWORLD,
            {
                // ZmApp.registerApp for a description of the various
                // parameters that can be used to customize the app.
                // Our main pkg for this application
                // Since our application only has one package, we don't
                // need this setting.
                //mainPkg:			"HelloWorld",
                nameKey:			"helloworld",
                // We'll steal an Icon from the IM folder
                // Another option would be the "Prefences" icon.
                // This string is concatenated with "Img" and placed
                // in the class name of the button to get access to the sprite
                // for the button.
                icon:				"HappyEmoticon",
                textPrecedence:		80,
                // Points to the ZmMsg* setting for the tool tip
                // that gets displayed when we mouse over the app tab.
                chooserTooltipKey:	"gotoHelloWorld",
                newItemOps:			newItemOps,
                newOrgOps:			newOrgOps,
                actionCodes:		actionCodes,
                //gotoActionCode:   ZmKeyMap.GOTO_HELLOWORLD,
                chooserSort:		70,
                defaultSort:		60
            }
    );
};

/**
 * Called during a ZmZimbraMail.prototype.activateApp, which is essentially
 * when the application tab is clicked on.
 * @param params {object} Appears to be the last search performed before
 * opening this app.
 * @param callback {AjxCallback} Callback to be called after all required
 * libraries have been loaded.
 */
ZmHelloWorldApp.prototype.launch =
function(params, callback) {
    // We will be passed a callback that we might need to run after
    // the HelloWorld app is called.
	var loadCallback = new AjxCallback(this, this._handleLoadLaunch, [callback]);
    // What additional packages are required to load this application and
    // make it usable. For us, none, but we'll make sure it's loaded anyway.
	AjxDispatcher.require("HelloWorldCore", true, loadCallback, null, true);
};

/**
 * Called after the call to launch, once we have confirmed that our package
 * libraries are available.
 * We will potentially be passed a callback from the launch function that
 * we need to make sure gets called.
 * @param [callback] {function} Optionally from the initial call to launch.
 */
ZmHelloWorldApp.prototype._handleLoadLaunch =
function(callback) {
    // Under this all, this creates the main view.
    this.getController().show();

	if (callback) {
        callback.run();
    }
};


/**
 * Gets the HelloWorld controller.
 *
 * @return	{ZmHelloWorldController} The main app controller.
 */
ZmHelloWorldApp.prototype.getController =
function() {
	if (!this._controller) {
        this._controller = new ZmHelloWorldController(this._container, this);
    }
    return this._controller;
};

/*
 * Defines the "Hello world application" settings and constants.
 * NOTE: It is assumed that the static classes/objects referenced here have
 * been loaded and are accessible.
 */
/**
 * Defines the "Hello World" application.
 * This string must be unique across all ids in the code.
 * @type String
 * @static
 */
ZmId.APP_HELLOWORLD = "HelloWorld";
/**
 * Defines the default HelloWorld view.
 * @type String
 * @static
 */
ZmId.VIEW_HELLOWORLD = "HELLOWORLD";
/**
 * Setting for our enabled application.
 * (This seems extraordinarily circular).
 * @type string
 */
ZmSetting.HELLOWORLD_ENABLED    = "HELLOWORLD_ENABLED";
/**
 * Local reference to the ZmId.APP_HELLOWORLD id.
 * Various settings are each application are hashed against the code
 * the unique string id of the
 * @type string
 * @static
 */
ZmApp.HELLOWORLD                    = ZmId.APP_HELLOWORLD;
// The name of our application class. Used to initialize our application class
// when it is loaded.
ZmApp.CLASS[ZmApp.HELLOWORLD]       = ZmHelloWorldApp.prototype.appClassName;
// Allow the app to be shown when the app is enabled, and hidden when the
// app is disabled.
ZmApp.SETTING[ZmApp.HELLOWORLD]	    = ZmSetting.HELLOWORLD_ENABLED;
// Control the order in which the applications are instantiated.
// Higher number == instantiated later.
ZmApp.LOAD_SORT[ZmApp.HELLOWORLD]   = 99;
// According to the notes in ZmApp:
// arg for 'app' var in URL querystring to jump to app, e.g.:
// http:localhost:7070/zimbra/?app=helloworld
ZmApp.QS_ARG[ZmApp.HELLOWORLD]      = "helloworld";
// ID for app button on app chooser toolbar.
ZmApp.BUTTON_ID[ZmApp.HELLOWORLD]   = ZmApp.HELLOWORLD;
