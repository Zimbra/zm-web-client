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
 * Portions created by Zimbra are Copyright (C) 2005, 2006 Zimbra, Inc.
 * All Rights Reserved.
 *
 * Contributor(s):
 *
 * ***** END LICENSE BLOCK *****
 */

ZmZimletMgr = function(appCtxt) {
	this._appCtxt = appCtxt;
	this._ZIMLETS = [];
	this._ZIMLETS_BY_ID = {};
	this._CONTENT_ZIMLETS = [];
}

ZmZimletMgr.prototype.constructor = ZmZimletMgr;

ZmZimletMgr.prototype.toString = function() {
	return "ZmZimletMgr";
};

//
// Constants
//

ZmZimletMgr._RE_REMOTE = /^((https?|ftps?):\x2f\x2f|\x2f)/;

//
// Public methods
//

ZmZimletMgr.prototype.isLoaded = function() {
    return this.loaded;
};

ZmZimletMgr.prototype.loadZimlets =
function(zimletArray, userProps) {
	if(!zimletArray || !zimletArray.length) {
        this.loaded = true;
        return;
    }

    for (var i = 0; i < zimletArray.length; i++)
		this._ZIMLETS_BY_ID[zimletArray[i].zimlet[0].name] = true;
	for(var i=0; i < zimletArray.length; i++) {
		var z = new ZmZimletContext(i, zimletArray[i], this._appCtxt);
		this._ZIMLETS[i] = this._ZIMLETS_BY_ID[z.name] = z;
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
	var panelZimlets = this.getPanelZimlets();
 	if(panelZimlets && panelZimlets.length > 0) {
		var zimletTree = this._appCtxt.getZimletTree();
	 	if (!zimletTree) {
	 		zimletTree = new ZmFolderTree(this._appCtxt, ZmOrganizer.ZIMLET);
	 		this._appCtxt.setTree(ZmOrganizer.ZIMLET, zimletTree);
	 	}
	 	zimletTree.reset();
	 	zimletTree.loadFromJs(panelZimlets, "zimlet");
 	}

    // load zimlet code/CSS
    var zimletNames = this._getZimletNames(zimletArray);
    this._loadIncludes(zimletArray, zimletNames);
    this._loadStyles(zimletArray, zimletNames);
};

ZmZimletMgr.prototype.getPanelZimlets =
function() {
	var panelZimlets = [];
	var j=0;
	for(var i=0; i < this._ZIMLETS.length; i++) {
		if(this._ZIMLETS[i].zimletPanelItem) {
			DBG.println(AjxDebug.DBG2, "Zimlets - add to panel " + this._ZIMLETS[i].name);
			panelZimlets[j++] = this._ZIMLETS[i];
		}
	}
	return panelZimlets;
};

ZmZimletMgr.prototype.getIndexedZimlets =
function() {
	var indexedZimlets = [];
	var j=0;
	for(var i=0; i < this._ZIMLETS.length; i++) {
		if(this._ZIMLETS[i].keyword) {
			DBG.println(AjxDebug.DBG2, "Zimlets - add to indexed " + this._ZIMLETS[i].name);
			indexedZimlets[j++] = this._ZIMLETS[i];
		}
	}
	return indexedZimlets;
};

ZmZimletMgr.prototype.getPortletZimlets =
function() {
    if (!this._portletArray) {
        this._portletArray = [];
        this._portletMap = {};
        var j = 0;
        for (var i = 0; i < this._ZIMLETS.length; i++) {
            var zimlet = this._ZIMLETS[i];
            if (zimlet.portlet) {
                this._portletArray[j++] = zimlet;
                this._portletMap[zimlet.name] = zimlet;
            }
        }
    }
    return this._portletArray;
};
ZmZimletMgr.prototype.getPortletZimletsHash =
function() {
    this.getPortletZimlets();
    return this._portletMap;
};

ZmZimletMgr.prototype.registerContentZimlet =
function(zimletObj, type, priority) {
	var i = this._CONTENT_ZIMLETS.length;
	this._CONTENT_ZIMLETS[i] = zimletObj;
	this._CONTENT_ZIMLETS[i].type = type;
	this._CONTENT_ZIMLETS[i].prio = priority;
	DBG.println(AjxDebug.DBG2, "Zimlets - registerContentZimlet(): " + this._CONTENT_ZIMLETS[i]._zimletContext.name);
};

ZmZimletMgr.prototype.getContentZimlets =
function() {
	return this._CONTENT_ZIMLETS;
};

ZmZimletMgr.prototype.getZimlets =
function() {
	return this._ZIMLETS;
};

ZmZimletMgr.prototype.getZimletsHash =
function() {
	return this._ZIMLETS_BY_ID;
};

ZmZimletMgr.prototype.zimletExists =
function(name) {
	return this._ZIMLETS_BY_ID[name];
};

ZmZimletMgr.prototype.notifyZimlets = function(event) {
	var args = new Array(arguments.length - 1);
	for (var i = 0; i < args.length;)
		args[i] = arguments[++i];
	var a = this._ZIMLETS;
	for (var i = 0; i < a.length; ++i) {
		var z = a[i].handlerObject;
		if (z
		    && z instanceof ZmZimletBase // we might get here even if Zimlets were not initialized
		    && z.getEnabled()		 // avoid calling any hooks on disabled Zimlets
		    && typeof z[event] == "function")
			z[event].apply(z, args);
	}
};

//
// Protected methods
//

ZmZimletMgr.prototype._getZimletNames = function(zimletArray) {
    var array = new Array(zimletArray ? zimletArray.length : 0);
    for (var i = 0; i < zimletArray.length; i++) {
        array[i] = zimletArray[i].zimlet[0].name;
    }
    return array;
};

ZmZimletMgr.prototype._loadIncludes = function(zimletArray, zimletNames) {
    var includes = this.__getIncludes(zimletArray, zimletNames, true);
    var baseUrl = null;
    var callback = new AjxCallback(this, this._finished_loadIncludes, [zimletNames] );
    var proxy = ZmZimletBase.PROXY;
    
    AjxInclude(includes, baseUrl, callback, proxy);
};

ZmZimletMgr.prototype._finished_loadIncludes = function(zimletNames) {
    this.loaded = true;
    var zimlets = this.getZimletsHash();
    for (var i = 0; i < zimletNames.length; i++) {
        var name = zimletNames[i];
        zimlets[name]._finished_loadIncludes();
    }
};

ZmZimletMgr.prototype._loadStyles = function(zimletArray, zimletNames) {
    var head = document.getElementsByTagName("head")[0];
    var includes = this.__getIncludes(zimletArray, zimletNames, false);
    for (var i = 0; i < includes.length; i++) {
        var style = document.createElement("link");
        style.type = "text/css";
        style.rel = "stylesheet";
        style.href = includes[i];

        head.appendChild(style);

        // TODO: What does this do?
        style.disabled = true;
        style.disabled = false;
    }
};

//
// Private methods
//

ZmZimletMgr.prototype.__getIncludes = function(zimletArray, zimletNames, isJS) {
	// add remote urls
	var includes = [];
	for (var i = 0; i < zimletArray.length; i++) {
		var zimlet = zimletArray[i].zimlet[0];
		// include messages
		if (appDevMode) {
			if (isJS) {
				includes.push([appContextPath, "/js/msgs/", zimlet.name, ".js"].join(""));
			}
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
			if (appDevMode) {
				includes.push(["/service/zimlet/", zimlet.name, "/", url].join(""));
			}
		}
	}

	// add link to aggregated files
	if (!appDevMode) {
		includes.push( [
			"/service/zimlet/res/zimlet", isJS ? ".js"+appExtension : ".css"
		].join("") );
	}

	// add cache killer to each url
	for (var i = 0; i < includes.length; i++) {
		includes[i] = [ includes[i], "?v=", cacheKillerVersion ].join("");
	}

	return includes;
};
