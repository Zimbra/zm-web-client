/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2005, 2006, 2007, 2008, 2009, 2010 Zimbra, Inc.
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
	if (!zimletArray || !zimletArray.length) {
		this.loaded = true;
		this._resetOverviewTree();
		return;
	}
	var packageCallback = callback ? new AjxCallback(this, this._loadZimlets, [zimletArray, userProps, target, callback, sync]) : null;
	AjxPackage.require({ name: "Zimlet", callback: packageCallback });
	if (!callback) {
		this._loadZimlets(zimletArray, userProps, target, callback, sync);
	}
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
 * @private
 */
ZmZimletMgr.prototype.notifyZimlets =
function(event, args) {
	if (args && (!(args instanceof Array))) { args = [args]; }

	for (var i = 0; i < this._ZIMLETS.length; ++i) {
		var z = this._ZIMLETS[i].handlerObject;
		if (z && (z instanceof ZmZimletBase) && z.getEnabled() &&
		    (typeof z[event] == "function"))
		{
			z[event].apply(z, args);
		}
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
	// add remote urls
	var includes = [];
	for (var i = 0; i < zimletArray.length; i++) {
		var zimlet = zimletArray[i].zimlet[0];
		var baseUrl = zimletArray[i].zimletContext[0].baseUrl;
		var isDevZimlet = baseUrl.match("/_dev/");

        var languageId = null;
        var countryId = null;
        if(appCtxt.get(ZmSetting.LOCALE_NAME)) {
            var locale = appCtxt.get(ZmSetting.LOCALE_NAME);
            var index = locale.indexOf("_");
            if (index == -1) {
                languageId = locale;
                } else {
                languageId = locale.substr(0, index);
                countryId = locale.substr(index+1);
            }
        }        
		// add cache killer to each url
		var query = isDevZimlet
			? ("?debug=1&v="+new Date().getTime()+"&")
			: ("?v="+cacheKillerVersion+"&");
        	query += ((languageId ? "language=" + languageId : "")+"&");
        	query += ((countryId ? "country=" + countryId : ""));


		// include messages
		if (appDevMode && isJS) {
			includes.push([appContextPath, "/res/", zimlet.name, ".js", query].join(""));
		}

		// include links
		var links = (isJS ? zimlet.include : zimlet.includeCSS) || [];
		for (var j = 0; j < links.length; j++) {
			var url = links[j]._content;
			if (ZmZimletMgr._RE_REMOTE.test(url)) {
				var fullurl = [ ZmZimletBase.PROXY, AjxStringUtil.urlComponentEncode(url) ].join("");
				includes.push(fullurl);
				continue;
			}
			if (appDevMode || isDevZimlet) {
				includes.push([baseUrl, url, query].join(""));
			}
		}
	}

	// add link to aggregated files
	if (!appDevMode) {
		var extension = (!AjxEnv.isIE || (!AjxEnv.isIE6 && AjxEnv.isIE6up)) ? appExtension : "";
		includes.unshift([
			"/service/zimlet/res/Zimlets-nodev_all",
			(isJS ? (".js" + extension) : ".css"),
			(languageId ? "?language=" + languageId : ""),
			(countryId ? "&country=" + countryId : "")
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
