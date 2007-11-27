function ZmSkin(hints) {
    this.hints = this.mergeObjects({
        // info
        name:       "@SkinName@",
        version:    "@SkinVersion@",
        logo:       { url: "@LogoURL@" },

        banner:		{ position:"static"},
        userInfo:	{ position:"static"},
        search:		{ position:"static"},
        quota:      { position:"static" },
        
        // specific components
        appChooser:    { style: "tabs", direction: "LR" },
        helpButton:    { style: "link", container: "quota" },
        logoutButton:  { style: "link", container: "quota" },
        toast:          { location: "N", transitions: [
            { type: "fade-in", step: 10, duration: 200 },
            { type: "pause", duration: 1000 },
            { type: "fade-out", step: -10, duration: 500 }
        ] },
        
        // skin regions
        skin:           { containers: "skin_outer" },
        tree:			{ minWidth:150, maxWidth:300, containers: ["skin_td_outer_tree", "skin_outer_tree", "skin_col_tree_inner", "skin_col_tree"] },
        searchBuilder:  { containers: [ "skin_container_search_builder_outer", "skin_td_search_builder" ] },
        topToolbar:     { containers: [ "skin_tr_top_toolbar", "!skin_tr_top_toolbar_shim" ] },
        bottomToolbar:  { containers: [ "skin_tr_bottom_toolbar", "!skin_tr_bottom_toolbar_shim" ] },
        treeFooter:     { containers: [ "skin_tr_tree_footer_sep", "skin_tr_tree_footer"] },
		topAd:			{ containers: [ "skin_tr_top_ad"] },
		sidebarAd:		{ containers: [ "skin_td_sidebar_ad"] },
		
        fullScreen:     {
            containers: [
                "skin_tr_toolbar_full", "skin_tr_main_full",
                "!skin_tr_toolbar", "!skin_tr_main", "!skin_tr_status"
            ]
        }
    }, hints);
}

// create "BaseSkin" as an alias to ZmSkin (for backwards compatibility)
window.BaseSkin = ZmSkin;



//
//	set up the ZmSkin prototype with methods common to all skins
//
ZmSkin.prototype = {

	//
	// Public methods
	//
	show : function(name, state) {
		var containers = this.hints[name] && this.hints[name].containers;
		if (containers) {
			if (typeof containers == "function") {
				containers(this, state);
				skin._reflowApp();
				return;
			}
			if (typeof containers == "string") {
				containers = [ containers ];
			}
			for (var i = 0; i < containers.length; i++) {
				var ocontainer = containers[i];
				var ncontainer = ocontainer.replace(/^!/,"");
				var inverse = ocontainer != ncontainer;
				this._showEl(ncontainer, inverse ? !state : state);
			}
			skin._reflowApp();
		}
		if (name == "fullScreen") {
			this._showFullScreen(state);
		}
	},

	hide : function(name) {
	    this.show(name, false);
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
		skin._showEl("skin_tr_top_ad", state);
		skin._reflowApp();
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
		skin._showEl(id);
		skin._reflowApp();
	},
	hideSidebarAd : function() {
		var id = "skin_td_sidebar_ad";
		skin._hideEl(id);
		skin._reflowApp();
	},
	getSidebarAdContainer : function() {
		return this._getEl("skin_container_sidebar_ad");
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
			if (tagName == "TD" && document.all == null)		value = "table-cell";
			else if (tagName == "TR" && document.all == null) 	value = "table-row";
			else value = "block";
		}
		el.style.display = value;
	},
	
	_hideEl : function(id) {
		this._showEl(id, false);
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
		var containers = this.hints[containerName].containers;
		for (var i = 0; i < containers.length; i++) {
			this._setSize(containers[i], width, null);
		}
	},
	
	_reflowApp : function () {
		if (window._zimbraMail) {
			window._zimbraMail.getAppViewMgr().fitAll();
		}
	},
	
	_showFullScreen : function(state) {
		var componentId = "skin_container_app_top_toolbar";
		var show = state == null || state;
		var containerId = show ? "skin_border_app_top_toolbar_full" : "skin_td_app_top_toolbar";
		this._reparentEl(componentId, containerId);
	
		// HACK: IE doesn't seem to hide the container DIV for full screen just even
		// though its parent row is set to display:none
		if (AjxEnv.isIE) {
			var containerDiv = document.getElementById("skin_container_app_main_full");
			if (containerDiv) {
				Dwt.setVisible(containerDiv, show);
			}
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