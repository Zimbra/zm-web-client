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
function ZmSkin(hints) {
    this.hints = this.mergeObjects(ZmSkin.hints, hints);
}


// default hints for all skins
ZmSkin.hints = {
	// info
	name:			"@SkinName@",
	version:		"@SkinVersion@",
	
	// skin regions
	skin:		  	{ containers: "skin_outer" },
	banner:			{ position:"static", url: "@LogoURL@"},		// == "logo"
	userInfo:		{ position:"static"},
	search:		  	{ position:"static" },
	quota:		  	{ position:"static" },
	presence:	  	{ width:"40px", height: "24px" },
	appView:		{ position:"static" },

	searchResultsToolbar:	{ containers: ["skin_tr_search_results_toolbar"] },
	
	newButton:		{ containers: ["skin_td_new_button"] },
	tree:			{ minWidth:parseInt("@TreeMinWidth@"), maxWidth:parseInt("@TreeMaxWidth@"), 
					  containers: ["skin_td_tree","skin_td_tree_app_sash"],
					  resizeContainers : ["skin_td_tree"]
					},
	
	topToolbar:	 	{ containers: "skin_spacing_app_top_toolbar" },

	treeFooter:	 	{ containers: "skin_tr_tree_footer" },

	topAd:			{ containers: "skin_tr_top_ad" },
	sidebarAd:		{ containers: "skin_td_sidebar_ad" },
	bottomAd:		{ containers: "skin_tr_bottom_ad" },
	treeTopAd:		{ containers: "skin_tr_tree_top_ad" },
	treeBottomAd:	{ containers: "skin_tr_tree_bottom_ad" },
	
	// specific components
	helpButton:		{ style: "link", container: "quota", url: "@HelpAdvancedURL@" },		/*** TODO: this 'container' should be removed ??? ***/
	logoutButton: 	{ style: "link", container: "quota" },		/*** TODO: this 'container' should be removed ??? ***/
	appChooser:		{ position:"static", direction: "LR" },
	toast:		 	{ location: "N", 
					  transitions: [
							{ type: "fade-in", step: 5, duration: 50 },
              				{ type: "pause", duration: 5000 },
              				{ type: "fade-out", step: -10, duration: 500 }
						] 
					},
	
	allAds :		{ containers: ["skin_tr_top_ad", "skin_td_sidebar_ad", "skin_tr_bottom_ad", "skin_tr_tree_top_ad", "skin_tr_tree_bottom_ad"] },

	hideSearchInCompose : true

};


// create "BaseSkin" as an alias to ZmSkin (for backwards compatibility)
window.BaseSkin = ZmSkin;


//
//	set up the ZmSkin prototype with methods common to all skins
//
ZmSkin.prototype = {

	//
	// Public methods
	//
	show : function(name, state, noReflow) {
		var containers = this.hints[name] && this.hints[name].containers;
		if (containers) {
			if (typeof containers == "function") {
				containers.apply(this, [state != false]);
				skin._reflowApp();
				return;
			}
			if (typeof containers == "string") {
				containers = [ containers ];
			}
			var changed = false;
			for (var i = 0; i < containers.length; i++) {
				var ocontainer = containers[i];
				var ncontainer = ocontainer.replace(/^!/,"");
				var inverse = ocontainer != ncontainer;
				if (this._showEl(ncontainer, inverse ? !state : state)) {
					changed = true;
				}
			}
			if (changed && !noReflow) {
				skin._reflowApp();
			}
		}
	},

	hide : function(name, noReflow) {
	    this.show(name, false, noReflow);
	},

	gotoApp : function(appId, callback) {
		appCtxt.getAppController().activateApp(appId, null, callback);
	},
	
	gotoPrefs : function(prefPageId) {
		if (appCtxt.getCurrentAppName() != ZmApp.PREFERENCES) {
			var callback = new AjxCallback(this, this._gotoPrefPage, [prefPageId]);
			this.gotoApp(ZmApp.PREFERENCES, callback);
		}
		else {
			this._gotoPrefPage(prefPageId);
		}
	},
	
	mergeObjects : function(dest, src1 /*, ..., srcN */) {
		if (dest == null) dest = {};
	
		// merge all source properties into destination object
		for (var i = 1; i < arguments.length; i++) {
			var src = arguments[i];
			for (var pname in src) {
				// recurse through properties
				var prop = dest[pname];
				if (typeof prop == "object" && !(prop instanceof Array)) {
					this.mergeObjects(dest[pname], src[pname]);
					continue;
				}
	
				// insert missing property
				if (!dest[pname]) {
					dest[pname] = src[pname];
				}
			}
		}
	
		return dest;
	},
	
	getTreeWidth : function() {
		return Dwt.getSize(this._getEl(this.hints.tree.containers[0])).x;
	},
	
	setTreeWidth : function(width) {
		this._setContainerSizes("tree", width, null);
	},
	
	
	
	showTopAd : function(state) {
		if (skin._showEl("skin_tr_top_ad", state)) {
			skin._reflowApp();
		}
	},
	hideTopAd : function() {	
		skin.showTopAd(false);	
	},
	getTopAdContainer : function() {
		return skin._getEl("skin_container_top_ad");
	},
	
	showSidebarAd : function(width) {
		var id = "skin_td_sidebar_ad";
		if (width != null) skin._setSize(id, width);
		if (skin._showEl(id)) {
			skin._reflowApp();
		}
	},
	hideSidebarAd : function() {
		var id = "skin_td_sidebar_ad";
		if (skin._hideEl(id)) {
			skin._reflowApp();
		}
	},
	getSidebarAdContainer : function() {
		return this._getEl("skin_container_sidebar_ad");
	},

	handleNotification : function(event, args) {
		/*
			Override me in individual skins
			@param [String] event		The event type, e.g. "onAction", "onSelectApp", "initializeToolbar", ...
										basically anything that would get passed into appCtxt.notifyZimlets()
			@param [Array]	args		Array of the arguments that get passed to appCtxt.notifyZimlets()
		*/
	},

	
	//
	// Protected methods
	//
	
	_getEl : function(id) {
		return (typeof id == "string" ? document.getElementById(id) : id);
	},
	
	_showEl : function(id, state) {
		var el = this._getEl(id);
		if (!el) return;
	
		var value;
		if (state == false) {
			value = "none";
		}
		else {
			var tagName = el.tagName;
			if (tagName == "TD" && !document.all)		value = "table-cell";
			else if (tagName == "TR" && !document.all) 	value = "table-row";
			else value = "block";
		}
		if (value != el.style.display) {
			el.style.display = value;
			return true;
		}
		else {
			return false;
		}
	},
	
	_hideEl : function(id) {
		return this._showEl(id, false);
	},
	
	_reparentEl : function(id, containerId) {
		var containerEl = this._getEl(containerId);
		var el = containerEl && this._getEl(id);
		if (el) {
			containerEl.appendChild(el);
		}
	},
	
	_setSize : function(id, width, height) {
		var el = this._getEl(id);
		if (!el) return;
		if (width != null) el.style.width = width;
		if (height != null) el.style.height = height;
	},
	
	_setContainerSizes : function(containerName, width, height) {
		var containers = this.hints[containerName].resizeContainers || this.hints[containerName].containers;
		for (var i = 0; i < containers.length; i++) {
			this._setSize(containers[i], width, null);
		}
	},
	
	_reflowApp : function() {
		if (window._zimbraMail) {
			window._zimbraMail.getAppViewMgr().fitAll();
		}
	},
	
	_gotoPrefPage : function(pageId) {
		if (pageId == null) { return; }
	
		var app = appCtxt.getApp(ZmApp.PREFERENCES);
		var controller = app.getPrefController();
		var view = controller.getPrefsView();
		view.selectSection(pageId);
	}
};


//
//	create an instance as "skin" -- some skins may create another one that overrides this
//
window.skin = new ZmSkin();
