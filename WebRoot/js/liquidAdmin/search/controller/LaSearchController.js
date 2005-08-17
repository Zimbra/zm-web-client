function LaSearchController(appCtxt, container) {

	LaController.call(this, appCtxt, container);
	this._inited = false;
	this._currentSearch = null;
//	this._searchFor = LaSearchToolBar.FOR_ACCOUNTL_MI;
	this._app = appCtxt.getAppController().getApp(LaLiquidAdmin.ADMIN_APP);
	this._setView();    
}

LaSearchController.prototype = new LaController;
LaSearchController.prototype.constructor = LaSearchController;

LaSearchController._TOOLBAR_SEPARATION = 2;

LaSearchController.prototype.toString = 
function() {
	return "LaSearchController";
}

LaSearchController.prototype.getSearchPanel =
function() {
	return this._searchPanel;
}

LaSearchController.prototype.setSearchField =
function(searchString) {
	this._searchField.setValue(searchString);
}

LaSearchController.prototype.getSearchField =
function() {
	return this._searchToolBar.getSearchField().getValue();
}

LaSearchController.prototype.search =
function(searchString, sortBy, offset, limit) {

	// if the search string starts with "$set:" then it is a command to the client 
	if (searchString.indexOf("$set:") == 0) {
		this._appCtxt.getClientCmdHdlr().execute((searchString.substr(5)).split(" "));
		return;
	}
	
	this._searchField.setValue(searchString);
	this._currentSearch = searchString;
	this._searchField.setEnabled(false);
	this._searchField.setFieldChanged(false);		
	this._schedule(this._doSearch, {sortBy: sortBy, offset: offset, limit: limit});
}

LaSearchController.prototype.setEnabled =
function(enabled) {
	this._searchField.setEnabled(enabled);
}

LaSearchController.prototype._setView =
function() {
    this._searchPanel = new DwtComposite(this._container, "SearchPanel", DwtControl.ABSOLUTE_STYLE);
    
	// Create search toolbar and setup browse tool bar button handlers
	this._searchToolBar = new LaSearchToolBar(this._searchPanel);
	this._searchToolBar.setLocation(0, 0);
	this._searchPanel.setBounds(0, 0, Dwt.DEFAULT, this._searchToolBar.getSize().y);
   	this._createBannerBar();
    
    // Search By tool bar button/menu item handlers
    var searchForListener = new LsListener(this, LaSearchController.prototype._searchForButtonListener);
	// Setup search field handler
	this._searchField = this._searchToolBar.getSearchField();
	this._searchField.registerCallback(LaSearchController.prototype._searchFieldCallback, this);	
	this._searchPanel.zShow(true);
}

// Creates buttons for general non app-related functions and puts them on the banner.
LaSearchController.prototype._createBannerBar =
function() {

	this.bannerBar = new DwtComposite(this._searchPanel, "BannerBar", DwtControl.RELATIVE_STYLE);
	
	this._bannerTableId = Dwt.getNextId();
	
	this.bannerBar._migrationId = Dwt.getNextId();
	this.bannerBar._helpId = Dwt.getNextId();
	this.bannerBar._pdfHelpId = Dwt.getNextId();	
	this.bannerBar._logOffId = Dwt.getNextId();
	
	this.bannerBar._migrationId2 = Dwt.getNextId();
	this.bannerBar._helpId2 = Dwt.getNextId();
	this.bannerBar._pdfHelpId2 = Dwt.getNextId();	
	this.bannerBar._logOffId2 = Dwt.getNextId();
	
	var html = new Array();
	var i = 0;
	
	html[i++] = "<table align='right' id='" + this._bannerTableId + "'><tr><td>&nbsp;";
	html[i++] = "</td></tr></table>";
	this.bannerBar.getHtmlElement().innerHTML = html.join("");
	var doc = this.bannerBar.getDocument();
	var t = Dwt.getDomObj(doc, this._bannerTableId);
	this.bannerBar.app = this._app;	
	Dwt.associateElementWithObject(t, this.bannerBar);		

	this.createBannerBarHtml();
}
LaSearchController.prototype.createBannerBarHtml =
function () {

	if(!this.bannerBar || !this.bannerBar._helpId ||  !this.bannerBar._pdfHelpId || !this.bannerBar._logOffId || !this.bannerBar._helpId2 ||  !this.bannerBar._pdfHelpId2 || !this.bannerBar._logOffId2)
		return;
		
	var html = new Array();
	var i = 0;

	html[i++] = "<table align='right' id='" + this._bannerTableId + "'><tr>";
	html[i++] = "<td><a id='" + this.bannerBar._migrationId + "'  target=\"_blank\" href=\"/liquidAdmin/migrationwizard/MigrationWizard.exe\">";
	html[i++] = LsImg.getImageHtml(LaImg.I_MIGRATIONWIZ, "cursor:hand");
	html[i++] = "</a></td>";
	html[i++] = "<td><a id='" + this.bannerBar._migrationId2 + "' style='cursor: hand' target=\"_blank\" href=\"/liquidAdmin/migrationwizard/MigrationWizard.exe\">";
	html[i++] = LaMsg.migrationWiz + "</a></td>";	
	html[i++] = "<td><a id='" + this.bannerBar._helpId + "'>";
	html[i++] = LsImg.getImageHtml(LaImg.I_HELP, "cursor:hand");
	html[i++] = "</a></td>";
	html[i++] = "<td><a id='" + this.bannerBar._helpId2 + "'>";
	html[i++] = LaMsg.help + "</a></td>";		
	html[i++] = "<td><a id='" + this.bannerBar._pdfHelpId + "' target=\"_blank\" href=\"/liquidAdmin/adminhelp/pdf/admin.pdf\">";
	html[i++] = LsImg.getImageHtml(LaImg.I_PDF, "cursor:hand");
	html[i++] = "</a></td>";	
	html[i++] = "<td><a id='" + this.bannerBar._pdfHelpId2 + "' target=\"_blank\" href=\"/liquidAdmin/adminhelp/pdf/admin.pdf\">";
	html[i++] = LaMsg.adminGuide + "</a></td>";	
	html[i++] = "<td><a id='" + this.bannerBar._logOffId + "'>";
	html[i++] = LsImg.getImageHtml(LaImg.I_LOGOFF, "cursor:hand");		
	html[i++] = "</a></td>";
	html[i++] = "<td><a id='" + this.bannerBar._logOffId2 + "'>";		
	html[i++] = LaMsg.logOff + "</a></td></tr></table>";
	this.bannerBar.getHtmlElement().innerHTML = html.join("");
	var doc = this.bannerBar.getDocument();
	var t = Dwt.getDomObj(doc, this._bannerTableId);
	this.bannerBar.app = this._app;	
	Dwt.associateElementWithObject(t, this.bannerBar);	

	var a;
	/*a = Dwt.getDomObj(doc, this.bannerBar._migrationId);
	if(a) {
		a.href = "javascript: void LaLiquidAdmin._bannerBarHdlr(" + LaLiquidAdmin._MIGRATION_ID + ",'" + this._bannerTableId + "');";
		a.onmouseover = a.onmouseout = LaLiquidAdmin._bannerBarMouseHdlr;
	}
	
	a = Dwt.getDomObj(doc, this.bannerBar._migrationId2);
	if(a) {
		a.href = "javascript: void LaLiquidAdmin._bannerBarHdlr(" + LaLiquidAdmin._MIGRATION_ID + ",'" + this._bannerTableId + "');";
	}*/		
	var a = Dwt.getDomObj(doc, this.bannerBar._helpId);
	if(a) {
		a.href = "javascript: void LaLiquidAdmin._bannerBarHdlr(" + LaLiquidAdmin._HELP_ID + ",'" + this._bannerTableId + "');";
		a.onmouseover = a.onmouseout = LaLiquidAdmin._bannerBarMouseHdlr;
	}
	
	a = Dwt.getDomObj(doc, this.bannerBar._helpId2);
	if(a) {
		a.href = "javascript: void LaLiquidAdmin._bannerBarHdlr(" + LaLiquidAdmin._HELP_ID + ",'" + this._bannerTableId + "');";
	}	
			
	a = Dwt.getDomObj(doc, this.bannerBar._logOffId);
	if(a) {
		a.href = "javascript: void LaLiquidAdmin._bannerBarHdlr(" + LaLiquidAdmin._LOGOFF_ID + ",'" + this._bannerTableId + "');";
		a.onmouseover = a.onmouseout = LaLiquidAdmin._bannerBarMouseHdlr;
	}

	a = Dwt.getDomObj(doc, this.bannerBar._logOffId2);
	if(a) {
		a.href = "javascript: void LaLiquidAdmin._bannerBarHdlr(" + LaLiquidAdmin._LOGOFF_ID + ",'" + this._bannerTableId + "');";
	}
}
LaSearchController.prototype._doSearch =
function(params) {
DBG.dumpObj(params);
	try {
		this._inited = true;
		this._searchField.setEnabled(true);	
		//
		var szQuery = LaAccount.getSearchByNameQuery(this._currentSearch);
		this._app.getAccountListController().setPageNum(1);					
		if(this._app.getCurrentController()) {
			this._app.getCurrentController().switchToNextView(this._app.getAccountListController(), LaAccountListController.prototype.show,LaAccount.search(szQuery, "1", LaAccount.A_uid, true, this._app));
		} else {					
			this._app.getAccountListController().show(LaAccount.search(szQuery, "1", LaAccount.A_uid, true, this._app));
		}
		var curQuery = new LaAccountQuery(szQuery, false, "");							
		this._app.getAccountListController().setQuery(curQuery);	
	} catch (ex) {
		// Only restart on error if we are not initialized and it isn't a parse error
		if (ex.code != LsCsfeException.MAIL_QUERY_PARSE_ERROR) {
			this._handleException(ex, LaSearchController.prototype._doSearch, null, (this._inited) ? false : true);
		} else {
			this.popupMsgDialog(LaMsg.queryParseError, ex);
			this._searchField.setEnabled(true);	
		}
	}
}


/*********** Search Field Callback */

LaSearchController.prototype._searchFieldCallback =
function(searchField, queryString) {
	this.search(queryString);
}

/*********** Search Bar Callbacks */

// needed for LaAppViewMgr
LaSearchController.prototype.getBrowseView =
function() {
	return null;
}
