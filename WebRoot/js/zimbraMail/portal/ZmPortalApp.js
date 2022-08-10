/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2007, 2008, 2009, 2010, 2011, 2013, 2014, 2016 Synacor, Inc.
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
 * All portions of the code are Copyright (C) 2007, 2008, 2009, 2010, 2011, 2013, 2014, 2016 Synacor, Inc. All Rights Reserved.
 * ***** END LICENSE BLOCK *****
 */

/**
 * Creates the portal application.
 * @class
 * This class represents the portal application.
 * 
 * @param	{DwtControl}	container		the container
 * @param	{ZmPortalController}	parentController		the controller
 * 
 * @extends		ZmApp
 */
ZmPortalApp = function(container, parentController) {
	ZmApp.call(this, ZmApp.PORTAL, container, parentController);
}

ZmPortalApp.prototype = new ZmApp;
ZmPortalApp.prototype.constructor = ZmPortalApp;

/**
 * Returns a string representation of the object.
 * 
 * @return		{String}		a string representation of the object
 */
ZmPortalApp.prototype.toString = function() {
	return "ZmPortalApp";
};

// Construction

ZmPortalApp.prototype._registerApp = function() {
    ZmApp.registerApp(ZmApp.PORTAL, {
        nameKey: "portal",
        icon: "Globe",
        chooserTooltipKey:	"goToPortal",
        button: ZmAppChooser.B_PORTAL,
        chooserSort: 1,
        defaultSort: 1
	});
};

//
// Constants
//

/**
 * Defines the "portal" application.
 */
ZmApp.PORTAL                    = ZmId.APP_PORTAL;
ZmApp.CLASS[ZmApp.PORTAL]		= "ZmPortalApp";
ZmApp.SETTING[ZmApp.PORTAL]		= ZmSetting.PORTAL_ENABLED;
ZmApp.LOAD_SORT[ZmApp.PORTAL]	= 1;
ZmApp.QS_ARG[ZmApp.PORTAL]		= "home";

ZmEvent.S_PORTLET   = "PORTLET";
ZmItem.PORTLET      = ZmEvent.S_PORTLET;

ZmPortalApp.__PORTLET_ID = 0;

//
// Public methods
//

/**
 * Refreshes the portlets.
 * 
 */
ZmPortalApp.prototype.refreshPortlets = function() {
    var mgr = this.getPortletMgr();
    var portlets = mgr.getPortlets();
    for (var id in portlets) {
        portlets[id].refresh();
    }
};

ZmPortalApp.prototype.launch =
function(params, callback) {
    var loadCallback = new AjxCallback(this, this._handleLoadLaunch, [params, callback]);
	AjxDispatcher.require("Portal", true, loadCallback, null, true);
};

ZmPortalApp.prototype._handleLoadLaunch = function(params, callback) {
	var controller = this.getPortalController();
	controller.show();
    ZmApp.prototype.launch.call(this, params, callback);
};

ZmPortalApp.prototype.activate = function(active) {
	var controller = this.getPortalController();
	controller.setPaused(!active);
	ZmApp.prototype.activate.call(this, active);
};

/**
 * Gets the portal manifest.
 * 
 * @param	{AjxCallback}		callback		the callback to call after the manifest is loaded
 * @return	{Object}		the manifest
 */
ZmPortalApp.prototype.getManifest = function(callback) {
    if (!this._manifest) {
        // load the portal manifest
        var portalName = appCtxt.get(ZmSetting.PORTAL_NAME);
        if (portalName) {
            var timestamp = new Date().getTime(); 
            var params = {
                url: [ window.appContextPath,"/portals/",portalName,"/manifest.xml?v=",timestamp ].join(""),
                callback: callback ? new AjxCallback(this, this._handleLoadManifest, [callback]) : null
            };
            var req = AjxLoader.load(params);
            if (!callback) {
                this._handleLoadManifest(callback, req);
            }
        }
    }
	else if (callback) {
		callback.run(this._manifest);
	}
	return this._manifest;
};

ZmPortalApp.prototype._handleLoadManifest = function(callback, req) {
    var e;
    if (req.status == 200 && req.responseXML) {
        try {
            // serialize manifest into JSON and evaluate
            var json = new AjxJsonSerializer(true).serialize(req.responseXML);
			this._manifest = JSON.parse(json);

            // further minimize the object structure
            var portalDef = this._manifest.portal ;
            var portletsDef = portalDef && portalDef.portlets;
            if (portletsDef && !(portletsDef.portlet instanceof Array)) {
                portletsDef.portlet = [ portletsDef.portlet ];
            }
            portalDef.portlets = portletsDef.portlet;

            if (portalDef.portlets) {
                for (var i = 0; i < portalDef.portlets.length; i++) {
                    var portletDef = portalDef.portlets[i];
                    var propertyDef = portletDef.property;
                    if (propertyDef && !(propertyDef instanceof Array)) {
                        propertyDef = [ propertyDef ];
                    }
                    portletDef.properties = propertyDef;
                    delete portletDef.property;
                }
            }
        }
        catch (e) {
            DBG.println(e);
        }
    }
    else {
        e = ""
    }

    if (!this._manifest) {
        this._manifest = { error: e };
    }
    
    // callback
    if (callback) {
        callback.run(this._manifest);
    }
};

/**
 * Gets the portal controller.
 * 
 * @return	{ZmPortalController}	the controller
 */
ZmPortalApp.prototype.getPortalController = function() {
	AjxDispatcher.require("Portal");
	if (!this._portalController) {
		this._portalController = new ZmPortalController(this._container, this);
	}
	return this._portalController;
};

/**
 * Gets the portlet manager.
 * 
 * @return	{ZmPortletMgr}		the portlet manager
 */
ZmPortalApp.prototype.getPortletMgr = function() {
	AjxDispatcher.require("Portal");
    if (!this._portletMgr) {
        this._portletMgr = new ZmPortletMgr();
    }
    return this._portletMgr;
};

//
// Protected functions
//

ZmPortalApp.prototype._getOverviewTrees =
function() {
	return this._getOverviewApp()._getOverviewTrees();
};

//ZmPortalApp.prototype.getAccordionController =
//function() {
//	return this._getOverviewApp().getAccordionController();
//};

ZmPortalApp.prototype._getOverviewApp =
function() {
	if (!this._overviewApp) {
		var apps = [];
		for (var name in ZmApp.CHOOSER_SORT) {
			apps.push({ name: name, sort: ZmApp.CHOOSER_SORT[name] });
		}
		apps.sort(ZmPortalApp.__BY_SORT);

		var appName = null;
		for (var i = 0; i < apps.length; i++) {
			var app = apps[i];
			if (app.name == this._name) { continue; }
			if (appCtxt.getApp(app.name).isIframe) { continue; }

			appName = app.name;
			break;
		}
		this._overviewApp = appCtxt.getApp(appName);
	}
	return this._overviewApp;
};

//
// Private functions
//

ZmPortalApp.__BY_SORT = function(a, b) {
	return a.sort - b.sort;
};
