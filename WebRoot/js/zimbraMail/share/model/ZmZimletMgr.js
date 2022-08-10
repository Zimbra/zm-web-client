/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2016 Synacor, Inc.
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
 * All portions of the code are Copyright (C) 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2016 Synacor, Inc. All Rights Reserved.
 * ***** END LICENSE BLOCK *****
 */

/**
 * @overview
 * This file contains the Zimlet manager class.
 */

/**
 * Creates the Zimlet manager.
 * @class
 * This class represents the Zimlet manager.
 * 
 */
ZmZimletMgr = function() {
	this._ZIMLETS = [];
	this._ZIMLETS_BY_ID = {};
	this._CONTENT_ZIMLETS = [];
	this._serviceZimlets = [];
	this._requestNotHandledByAnyZimlet = [];
	this.loaded = false;
};

ZmZimletMgr.prototype.constructor = ZmZimletMgr;

/**
 * Returns a string representation of the object.
 * 
 * @return		{String}		a string representation of the object
 */
ZmZimletMgr.prototype.toString =
function() {
	return "ZmZimletMgr";
};

//
// Constants
//

ZmZimletMgr._RE_REMOTE = /^((https?|ftps?):\x2f\x2f|\x2f)/;

/**
* List of Core Zimlets.
* com_zimbra_apptsummary|com_zimbra_date|com_zimbra_dnd|com_zimbra_email|com_zimbra_linkedin|com_zimbra_phone|com_zimbra_webex|com_zimbra_social|com_zimbra_srchhighlighter|com_zimbra_url
*/
ZmZimletMgr.CORE_ZIMLETS = /com_zimbra_apptsummary|com_zimbra_date|com_zimbra_dnd|com_zimbra_email|com_zimbra_linkedin|com_zimbra_phone|com_zimbra_webex|com_zimbra_social|com_zimbra_srchhighlighter|com_zimbra_url/;

/**
 * If the Zimlet's config_template has  hasSensitiveData = true, it will be considered as sensitive Zimlet
 * and such zimlets are disabled (by-default) in mixed-mode.
 * System admin can set: mcf zimbraZimletDataSensitiveInMixedModeDisabled FALSE (instead of TRUE), to enable
 */
ZmZimletMgr.HAS_SENSITIVE_DATA_CONFIG_NAME = "hasSensitiveData";

//
// Public methods
//

/**
 * Checks if the manager is loaded.
 * 
 * @return	{Boolean}	<code>true</code> if loaded; <code>false</code> otherwise
 */
ZmZimletMgr.prototype.isLoaded =
function() {
	return this.loaded;
};

/**
 * Loads the zimlets.
 * 
 * @param	{Array}	zimletArray		an array of {@link ZmZimlet} objects
 * @param	{Array}	userProps		an array of properties
 * @param	{String}	target		the target
 * @param	{AjxCallback}	callback	the callback
 * @param	{Boolean}	sync		<code>true</code> for synchronous
 * 
 * @private
 */
ZmZimletMgr.prototype.loadZimlets =
function(zimletArray, userProps, target, callback, sync) {
	var href = window.location.href.toLowerCase();
	if(href.indexOf("zimlets=none") > 0 || appCtxt.isWebClientOffline()) {
		return;
	} else if(href.indexOf("zimlets=core") > 0) {
		zimletArray = this._getCoreZimlets(zimletArray);
	}
	var isHttp = document.location.protocol == ZmSetting.PROTO_HTTP;
	var isMixedMode = appCtxt.get(ZmSetting.PROTOCOL_MODE) == ZmSetting.PROTO_MIXED;
	var showAllZimlets = href.indexOf("zimlets=all") > 0;
	if(isMixedMode && !appCtxt.isOffline && !showAllZimlets && isHttp
			&& appCtxt.get(ZmSetting.DISABLE_SENSITIVE_ZIMLETS_IN_MIXED_MODE) == "TRUE") {
		zimletArray = this._getNonSensitiveZimlets(zimletArray);
	}
	var packageCallback = callback ? new AjxCallback(this, this._loadZimlets, [zimletArray, userProps, target, callback, sync]) : null;
	AjxPackage.require({ name: "Zimlet", callback: packageCallback });
	if (!callback) {
		this._loadZimlets(zimletArray, userProps, target, callback, sync);
	}
};


/**
 * Returns non-sensitive Zimlets whose config_template.xml file does not contain "hasSensitiveData=true"
 * @param	{Array}	zimletArray	an array of {@link ZmZimlet} objects
 *
 * @private
 */
ZmZimletMgr.prototype._getNonSensitiveZimlets =
function(zimletArray) {
	if (!zimletArray || !zimletArray.length) {
		return;
	}
	var nonSensitiveZimlets = [];
	var len = zimletArray.length;
	for(var i = 0; i < len; i++) {
		var configProps = [];
		var zimletObj = zimletArray[i];
		var isSensitiveZimlet = false;
		var zimletName = zimletObj.zimlet && zimletObj.zimlet[0] ? zimletObj.zimlet[0].name : "";
		var zimletConfig = zimletObj.zimletConfig;

		if(zimletConfig)  {
			if(zimletConfig[0]
					&& zimletConfig[0].global
					&& zimletConfig[0].global[0]
					&& zimletConfig[0].global[0].property) {

				configProps = zimletConfig[0].global[0].property;
				for(var j = 0; j < configProps.length; j++) {
					var property = configProps[j];
					if(property.name == ZmZimletMgr.HAS_SENSITIVE_DATA_CONFIG_NAME && property._content == "true") {
						isSensitiveZimlet = true;
						break;
					}
				}
			}
		}
		if(!isSensitiveZimlet) {
			nonSensitiveZimlets.push(zimletObj);
		}
	}
	return nonSensitiveZimlets;
};

/**
 * Returng an array with only core-Zimlets. This is used when we want to debug with only core-zimlets (?zimlets=core)
 * @param	{Array}	zimletArray		an array of {@link ZmZimlet} objects
 *
 * @private
 */
ZmZimletMgr.prototype._getCoreZimlets =
function(zimletArray) {
	if (!zimletArray || !zimletArray.length) {
		return;
	}
	var coreZimlets = [];
	var len = zimletArray.length;
	for(var i = 0; i < len; i++) {			
		var zimletObj = zimletArray[i].zimlet;
		var zimletName = zimletObj && zimletObj[0] ? zimletObj[0].name : "";
		if(ZmZimletMgr.CORE_ZIMLETS.test(zimletName)) {
			coreZimlets.push(zimletArray[i]);
		}		
	}
	return coreZimlets;
};

/**
 * @private
 */
ZmZimletMgr.prototype._loadZimlets =
function(zimletArray, userProps, target, callback, sync) {
	var z;
	var loadZimletArray = [];
	var targetRe = new RegExp("\\b"+(target || "main")+"\\b");
	for (var i=0; i < zimletArray.length; i++) {
		var zimletObj = zimletArray[i];
		var zimlet0 = zimletObj.zimlet[0];
		// NOTE: Only instantiate zimlet context for specified target
		if (!targetRe.test(zimlet0.target || "main")) { continue; }
		z = new ZmZimletContext(i, zimletObj);
		this._ZIMLETS_BY_ID[z.name] = z;
		this._ZIMLETS.push(z);
		loadZimletArray.push(zimletObj);
	}
	if (userProps) {
		for (i = 0; i < userProps.length; ++i) {
			var p = userProps[i];
			z = this._ZIMLETS_BY_ID[p.zimlet];
			if (z) {
				z.setPropValue(p.name, p._content);
			}
		}
	}
	if (!appCtxt.isChildWindow) {
		var panelZimlets = this.getPanelZimlets();
		if (panelZimlets && panelZimlets.length > 0) {
			var zimletTree = appCtxt.getZimletTree();
			if (!zimletTree) {
				zimletTree = new ZmFolderTree(ZmOrganizer.ZIMLET);
				var account = appCtxt.multiAccounts && appCtxt.accountList.mainAccount;
				appCtxt.setTree(ZmOrganizer.ZIMLET, zimletTree, account);
			}
			zimletTree.reset();
			zimletTree.loadFromJs(panelZimlets, "zimlet");
		} else { // reset overview tree accordingly
			this._resetOverviewTree();
		}
	}

	// load zimlet code/CSS
	var zimletNames = this._getZimletNames(loadZimletArray);
	this._loadIncludes(loadZimletArray, zimletNames, (sync ? callback : null) );
	this._loadStyles(loadZimletArray, zimletNames);

	if (callback && !sync) {
		callback.run();
	}
};

/**
 * @private
 */
ZmZimletMgr.prototype._resetOverviewTree =
function() {
	var zimletTree = appCtxt.getZimletTree();
	if (zimletTree) {
		var panelZimlets = this.getPanelZimlets();
		zimletTree.loadFromJs(panelZimlets, "zimlet");
		var overview = appCtxt.getCurrentApp().getOverview();
		if (overview) {
			var treeView =  overview.getTreeView(ZmOrganizer.ZIMLET);
			if (treeView && (!panelZimlets || !panelZimlets.length)) {
				treeView.clear(); //Clear the tree if thr are no panel zimlets
			}
		}
	}
};

/**
 * Gets the panel zimlets.
 * 
 * @return	{Array}	an array of objects
 */
ZmZimletMgr.prototype.getPanelZimlets =
function() {
	var panelZimlets = [];
	for (var i = 0; i < this._ZIMLETS.length; i++) {
		if (this._ZIMLETS[i].zimletPanelItem) {
			DBG.println(AjxDebug.DBG2, "Zimlets - add to panel " + this._ZIMLETS[i].name);
			panelZimlets.push(this._ZIMLETS[i]);
		}
	}
	return panelZimlets;
};

/**
 * Gets the indexed zimlets.
 * 
 * @return	{Array}	an array of objects
 */
ZmZimletMgr.prototype.getIndexedZimlets =
function() {
	var indexedZimlets = [];
	for (var i=0; i < this._ZIMLETS.length; i++) {
		if (this._ZIMLETS[i].keyword) {
			DBG.println(AjxDebug.DBG2, "Zimlets - add to indexed " + this._ZIMLETS[i].name);
			indexedZimlets.push(this._ZIMLETS[i]);
		}
	}
	return indexedZimlets;
};

/**
 * Gets the portlet zimlets.
 * 
 * @return	{Array}	an array of objects
 */
ZmZimletMgr.prototype.getPortletZimlets =
function() {
	if (!this._portletArray) {
		this._portletArray = [];
		this._portletMap = {};
		for (var i = 0; i < this._ZIMLETS.length; i++) {
			var zimlet = this._ZIMLETS[i];
			if (zimlet.portlet) {
				this._portletArray.push(zimlet);
				this._portletMap[zimlet.name] = zimlet;
			}
		}
	}
	return this._portletArray;
};

/**
 * Gets the portlets hash.
 * 
 * @return	{Hash}	the portlets hash
 */
ZmZimletMgr.prototype.getPortletZimletsHash =
function() {
	this.getPortletZimlets();
	return this._portletMap;
};

/**
 * Registers the content zimlet.
 * 
 * @param	{ZmZimlet}	zimletObj		the zimlet
 * @param	{constant}	type			the type
 * @param	{constant}	priority		the priority
 * 
 * @private
 */
ZmZimletMgr.prototype.registerContentZimlet =
function(zimletObj, type, priority) {
	var i = this._CONTENT_ZIMLETS.length;
	this._CONTENT_ZIMLETS[i] = zimletObj;
	this._CONTENT_ZIMLETS[i].type = type;
	this._CONTENT_ZIMLETS[i].prio = priority;
	DBG.println(AjxDebug.DBG2, "Zimlets - registerContentZimlet(): " + this._CONTENT_ZIMLETS[i]._zimletContext.name);
};

/**
 * Gets the content zimlets.
 * 
 * @return	{Array}	an array of objects
 */
ZmZimletMgr.prototype.getContentZimlets =
function() {
	return this._CONTENT_ZIMLETS;
};

/**
 * Gets the zimlets.
 * 
 * @return	{Array}	an array of {@link ZmZimletContext} objects
 */
ZmZimletMgr.prototype.getZimlets =
function() {
	return this._ZIMLETS;
};

/**
 * Gets the zimlets hash.
 * 
 * @return	{Hash}	as hash of zimlets
 */
ZmZimletMgr.prototype.getZimletsHash =
function() {
	return this._ZIMLETS_BY_ID;
};

/**
 * Checks if the zimlet exists.
 * 
 * @param	{String}	name		the name
 * @return	{ZmZimletContext}	the zimlet or <code>null</code> if not found
 */
ZmZimletMgr.prototype.zimletExists =
function(name) {
	return this._ZIMLETS_BY_ID[name];
};

/**
 * Gets the zimlet.
 * 
 * @param	{String}	name		the name
 * @return	{ZmZimletContext}	the zimlet or <code>null</code> if not found
 */
ZmZimletMgr.prototype.getZimletByName =
function(name) {
	for (var i = 0; i < this._ZIMLETS.length; i++) {
		var z = this._ZIMLETS[i];
		if (z && (z.name == name))
		{
			return z;
		}
	}
    return null;
};

/**
 * Handles zimlet notification.
 * 
 * @param	{Object}	event	the event
 * @param	{Object}	args	the arguments
 * 
 * @return true if any zimlet handled the notification
 * 
 * @private
 */
ZmZimletMgr.prototype.notifyZimlets =
function(event, args) {
	
	args = AjxUtil.toArray(args);

	var handled = false;
	for (var i = 0; i < this._ZIMLETS.length; ++i) {
		var z = this._ZIMLETS[i].handlerObject;
		if (z && z.isZmObjectHandler && z.getEnabled() && (typeof z[event] == "function")) {
			var result = args ? z[event].apply(z, args) : z[event].apply(z);	// IE cannot handle empty args
			handled = handled || result;
		}
	}
	
	return handled;
};

ZmZimletMgr.prototype.notifyZimlet =
function(zimletName, event, args) {
	var zimlet = this.getZimletByName(zimletName);
	var z = zimlet && zimlet.handlerObject;
	if (z && z.isZmObjectHandler && z.getEnabled() && (typeof z[event] == "function")) {
		return (args ? z[event].apply(z, args) : z[event].apply(z));	// IE cannot handle empty args
	}
};

/**
 * Processes a request (from core-zcs to zimlets) and returns value of the
 * first zimlet that serves the request.
 * PS: 
 * - Requestor must handle 'null' value
 * - stores/caches the zimlet for a given request to improve performance.
 * - also stores _requestNotHandledByAnyZimlet if no zimlet handles this
 *	request(in the current session), again to improve performance.
 * e.g: appCtxt.getZimletMgr().processARequest("getMailCellStyle", item, field)
 * 
 * @private
 */
ZmZimletMgr.prototype.processARequest =
function(request) {
	if (this._requestNotHandledByAnyZimlet[request]) { return null; }

	var args = new Array(arguments.length - 1);
	for (var i = 0; i < args.length;) {
		args[i] = arguments[++i];
	}
	var sz = this._serviceZimlets[request];
	if (sz) { // if we already know a zimlet that serves this request, use it.
		return sz[request].apply(sz, args);
	}

	var a = this._ZIMLETS;
	for (var i = 0; i < a.length; ++i) {
		var z = a[i].handlerObject;
		if (z && (z instanceof ZmZimletBase) && z.getEnabled() &&
			(typeof z[request] == "function"))
		{
			 this._serviceZimlets[request] = z;//store 
			 return z[request].apply(z, args);
		}
	}
	if (this.isLoaded()) { // add to an array to indicate that no zimlet implements this request
		this._requestNotHandledByAnyZimlet[request]=request;
	}
	return null;
};

//
// Protected methods
//

/**
 * @private
 */
ZmZimletMgr.prototype._getZimletNames =
function(zimletArray) {
	var array = new Array(zimletArray ? zimletArray.length : 0);
	for (var i = 0; i < zimletArray.length; i++) {
		array[i] = zimletArray[i].zimlet[0].name;
	}
	return array;
};

/**
 * @private
 */
ZmZimletMgr.prototype._loadIncludes =
function(zimletArray, zimletNames, callback) {
	var includes = this.__getIncludes(zimletArray, zimletNames, true);
	var includesCallback = new AjxCallback(this, this._finished_loadIncludes, [zimletNames, callback]);

	AjxInclude(includes, null, includesCallback, ZmZimletBase.PROXY);
};

/**
 * @private
 */
ZmZimletMgr.prototype._finished_loadIncludes =
function(zimletNames, callback) {
	if (!appCtxt.isChildWindow) {
		this.renameZimletsLabel();
	}
	this.loaded = true;
	var zimlets = this.getZimletsHash();
	for (var i = 0; i < zimletNames.length; i++) {
		var showedDialog = false;
		var name = zimletNames[i];
		try {
			zimlets[name]._finished_loadIncludes();
		} catch (e) {
			if (!showedDialog) {
				var dialog = appCtxt.getErrorDialog();
				var message = AjxMessageFormat.format(ZmMsg.zimletInitError, name);
				dialog.setMessage(message, e.toString(), DwtMessageDialog.CRITICAL_STYLE);
				dialog.popup();
				showedDialog = true;
			}
			DBG.println(AjxDebug.DBG1, "Error initializing zimlet '" + name + "': " + e);
		}
	}
	if (appCtxt.get(ZmSetting.PORTAL_ENABLED) && !appCtxt.isChildWindow) {
		var params = {
			name: "Portal",
			callback: (new AjxCallback(this, this._finished_loadIncludes2, [callback]))
		};
		AjxPackage.require(params);
	} else {
		this._finished_loadIncludes2(callback);
	}
};

/**
 * @private
 */
ZmZimletMgr.prototype._finished_loadIncludes2 =
function(callback) {
	appCtxt.allZimletsLoaded();

	if (callback) {
		callback.run();
	}
};

/**
 * @private
 */
ZmZimletMgr.prototype._loadStyles =
function(zimletArray, zimletNames) {
	var head = document.getElementsByTagName("head")[0];
	var includes = this.__getIncludes(zimletArray, zimletNames, false);
	for (var i = 0; i < includes.length; i++) {
		var style = document.createElement("link");
		style.type = "text/css";
		style.rel = "stylesheet";
		style.href = includes[i];

		head.appendChild(style);

		// XXX: say what?!
		style.disabled = true;
		style.disabled = false;
	}
};

//
// Private methods
//

/**
 * @private
 */
ZmZimletMgr.prototype.__getIncludes =
function(zimletArray, zimletNames, isJS) {
    // get language info
    var languageId = null;
    var countryId = null;
    if (appCtxt.get(ZmSetting.LOCALE_NAME)) {
        var locale = appCtxt.get(ZmSetting.LOCALE_NAME) || "";
        var parts = locale.split("_");
        languageId = parts[0];
        countryId = parts[1];
    }
    var locid = "";
    if (languageId) locid += "&language="+languageId;
    if (countryId) locid += "&country="+countryId;

    // add cache killer to each url
    var query = [
        "?v=", window.cacheKillerVersion
//        window.appDevMode ? new Date().getTime() : window.cacheKillerVersion
    ].join("");

    // add messages for all zimlets
    var includes = [];
    if (window.appDevMode && isJS) {
        var zimlets = appCtxt.get(ZmSetting.ZIMLETS) || [];
        if(appCtxt.isChildWindow) {
            var winOpener = window.opener || window;
            zimlets = winOpener.appCtxt.get(ZmSetting.ZIMLETS) || []
        }
        for (var i = 0; i < zimlets.length; i++) {
            var zimlet = zimlets[i].zimlet[0];
            includes.push([appContextPath, "/res/", zimlet.name, ".js", query, locid].join(""));
        }
    }

	// add remote urls
	for (var i = 0; i < zimletArray.length; i++) {
		var zimlet = zimletArray[i].zimlet[0];
		var baseUrl = zimletArray[i].zimletContext[0].baseUrl;
		var isDevZimlet = baseUrl.match("/_dev/");

		// include links
		var links = (isJS ? zimlet.include : zimlet.includeCSS) || [];
		for (var j = 0; j < links.length; j++) {
			var url = links[j]._content;
			if (ZmZimletMgr._RE_REMOTE.test(url)) {
				var fullurl = [ ZmZimletBase.PROXY, AjxStringUtil.urlComponentEncode(url) ].join("");
				includes.push(fullurl);
				continue;
			}
			if (window.appDevMode || isDevZimlet) {
                var debug = isDevZimlet ? "&debug=1" : "";
				includes.push([baseUrl, url, query, locid, debug].join(""));
			}
		}
	}

	// add link to aggregated files
	if (!window.appDevMode) {
		var cosId = null;
		if (appCtxt.getSettings() && appCtxt.getSettings().getInfoResponse && appCtxt.getSettings().getInfoResponse.cos) {
			cosId = appCtxt.getSettings().getInfoResponse.cos.id;
		}
		includes.unshift([
			"/service/zimlet/res/Zimlets-nodev_all",
			(isJS ? (".js" + appExtension) : ".css"),
			(languageId ? "?language=" + languageId : ""),
			(countryId ? "&country=" + countryId : ""),
			(cosId ? "&cosId=" + cosId : "")  // For an explanation of why we add cosId here, please see bug #58979
		].join(""));
	}

	return includes;
};

/**
 * Renames the zimlets label.
 * 
 * @private
 */
ZmZimletMgr.prototype.renameZimletsLabel =
function() {
	var treeController = appCtxt.getOverviewController().getTreeController("ZIMLET");
	var treeView = (treeController) ? treeController.getTreeView("Mail") : null;
	var root = (treeView) ? treeView.getItems()[0] : null;
	if (root) {
		var items = root.getItems();
		for (var i = 0; i < items.length; i++) {
			this.changeZimletLabel(items[i]);
		}
	}
};

/**
 * Changes the zimlet label.
 * 
 * @param	{Object}	item		the item
 */
ZmZimletMgr.prototype.changeZimletLabel =
function(item) {
	var zimlet = item.getData(Dwt.KEY_OBJECT);
	if (zimlet) {
		var currentLabel = zimlet.getName();
		var regEx = /\$/;
		if (currentLabel.match(regEx)) {
			var replaceLabel = currentLabel.replace(/\${msg./,'').replace(/}/,'');
			var zimletContextName = zimlet.getZimletContext().name;
			if (window[zimletContextName]) {
				var str = window[zimletContextName][replaceLabel];
				if (str) {
					item.setText(str);
					zimlet.setName(str);
				}
			}
		}
	}
};
