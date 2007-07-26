function BaseSkin(hints) {
    ZmSkin.call(this, ZmSkin.merge(hints, {
        // specific components
        app_chooser:    { style: "tabs", direction: "LR" },
        help_button:    { style: "link", container: "quota" },
        logout_button:  { style: "link", container: "quota" },
        toast:          { location: "N", transitions: [
            { type: "fade-in", step: 10, duration: 200 },
            { type: "pause", duration: 1000 },
            { type: "fade-out", step: -10, duration: 500 }
        ] },
        // skin regions
        skin:           { containers: "skin_outer" },
        quota:          { containers: [ "skin_td_quota_spacer", "skin_td_quota" ] },
        searchBuilder:  { containers: [ "skin_container_search_builder_outer", "skin_td_search_builder" ] },
        topToolbar:     { containers: [ "skin_tr_top_toolbar", "!skin_tr_top_toolbar_shim" ] },
        bottomToolbar:  { containers: [ "skin_tr_bottom_toolbar", "!skin_tr_bottom_toolbar_shim" ] },
        treeFooter:     { containers: [ "skin_tr_tree_footer_sep", "skin_tr_tree_footer"] },
        fullScreen:     {
            containers: [
                "skin_tr_toolbar_full", "skin_tr_main_full",
                "!skin_tr_toolbar", "!skin_tr_main", "!skin_tr_status"
            ]
        }
    }));    
}
BaseSkin.prototype = new ZmSkin;
BaseSkin.prototype.constructor = BaseSkin;

//
// Public methods
//

BaseSkin.prototype.show = function(name, state) {
    ZmSkin.prototype.show.call(this, name, state);
    if (name == "fullScreen") {
        this._showFullScreen(state);
    }
};

BaseSkin.prototype.gotoApp = function(appId, callback) {
	var appCtxt = this._getAppCtxt();
	var appController = appCtxt.getAppController();
	appController.activateApp(appId, null, callback);
};

BaseSkin.prototype.gotoPrefs = function(prefPageId) {
	var appCtxt = this._getAppCtxt();
	if (appCtxt.getCurrentAppName() != ZmApp.PREFERENCES) {
		var callback = new AjxCallback(this, this._gotoPrefPage, [prefPageId]);
		this.gotoApp(ZmApp.PREFERENCES, callback);
	}
	else {
		this._gotoPrefPage(prefPageId);
	}
};

//
// Protected methods
//

BaseSkin.prototype._showFullScreen = function(state) {
    var componentId = "skin_container_app_top_toolbar";
    var containerId = state == null || state ? "skin_border_app_top_toolbar_full" : "skin_border_app_top_toolbar";
    this._reparentEl(componentId, containerId);
};

BaseSkin.prototype._gotoPrefPage = function(pageId) {
	if (pageId == null) return;

	var app = this._getAppCtxt().getApp(ZmApp.PREFERENCES);
	var controller = app.getPrefController();
	var view = controller.getPrefsView();
	view.selectSection(pageId);
};

BaseSkin.prototype._getAppCtxt = function() {
	if (!this._appCtxt) {
		this._appCtxt = ZmAppCtxt.getFromShell(DwtShell.getShell(window));
	}
	return this._appCtxt;
};
