(function(){
	var util = comcast.access.util;

	skin.override.append('ZmZimbraMail.prototype.setQuotaInfo', function() {
		var quotafield = this._usedQuotaField.getHtmlElement(),
			tables = quotafield.getElementsByTagName('table');
		for (var i = 0; i < tables.length; tables++) {
			util.setElementRole(tables[i], 'presentation');
		}
	});

	skin.override("ZmZimbraMail.prototype._setupTabGroups", function() {

		// Save all existing members at this point (usually just the main listview), for injection later (see below)
		var rootTg = appCtxt.getRootTabGroup(),
			focusMember = rootTg.__currFocusMember || appCtxt.getKeyboardMgr().getFocusObj(),
			existing = rootTg.__members.clone();

		rootTg.removeAllMembers();

		// Header
		var headerTabGroup = new DwtTabGroup("header"),
		header = Dwt.byId("xcnavbar");
		if (header) {
			var iframes = Dwt.byTag("iframe", header);
			util.makeFocusable(iframes);
			headerTabGroup.addMember(iframes);
		}
		rootTg.addMember(headerTabGroup);

		// Search
		if (appCtxt.get(ZmSetting.SEARCH_ENABLED)) {
			rootTg.addMember(appCtxt.getSearchController().getTabGroup());
		}
		this._components[ZmAppViewMgr.C_APP_CHOOSER].noFocus = true;

		// Chooser
		rootTg.addMember(appCtxt.getAppChooser().getTabGroupMember());

		// Refresh button
		rootTg.addMember(appCtxt.refreshButton);

		// New button
		rootTg.addMember(appCtxt.getAppController().getNewButton());

		// Overview
		var curApp = appCtxt.getCurrentApp(),
			ovId = curApp && curApp.getOverviewId(),
			overview = ovId && appCtxt.getOverviewController().getOverview(ovId);
		if (overview) {
			rootTg.addMember(overview.getTabGroupMember());
			ZmController._currentOverview = overview;
		}
	

		// Main
		// Inject previous members here
		var mainTabGroup = this.getMainTabGroup();
		rootTg.addMember(mainTabGroup);
		rootTg.mainMember = mainTabGroup;
		mainTabGroup.addMember(existing.getArray());

		rootTg.setFocusMember(focusMember);

		// Footer in footer.js
		
		appCtxt.getKeyboardMgr().setTabGroup(rootTg);

		this._tabGroupCreated = true;
	});

	skin.override("ZmZimbraMail.prototype.isTabGroupCreated", function(){
		return this._tabGroupCreated;
	});
	skin.override("ZmZimbraMail.prototype.getMainTabGroup", function() {
		if (!this._mainTabGroup) {
			this._mainTabGroup = new DwtTabGroup("main");
		}
		return this._mainTabGroup;
	});

})();
