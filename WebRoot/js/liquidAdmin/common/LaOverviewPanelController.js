// TODO: Make sure current app is highlighted
/**
* @class LaOverviewPanelController
* @contructor LaOverviewPanelController
* Controls the navigation tree.
* @author Roland Schemers
* @author Greg Solovyev
**/
function LaOverviewPanelController(appCtxt, container) {
	LaController.call(this, appCtxt, container);
	this._accountsTi = null;
	this._statusTi = null;
	this._domainsMap = new Object();
	this._serversMap = new Object();	
	this._app = appCtxt.getAppController().getApp(LaLiquidAdmin.ADMIN_APP);
	this._setView();
	this._currentDomain = "";	
	this._currentServer = new Object();		
}

LaOverviewPanelController.prototype = new LaController;
LaOverviewPanelController.prototype.constructor = LaOverviewPanelController;

LaOverviewPanelController._ACCOUNTS = 1;
LaOverviewPanelController._DOMAINS = 2;
LaOverviewPanelController._COS = 3;
LaOverviewPanelController._STATUS = 4;
LaOverviewPanelController._SERVERS = 5;
LaOverviewPanelController._GLOBAL_SETTINGS = 6;
LaOverviewPanelController._STATISTICS = 7;

LaOverviewPanelController._ACCOUNTS_SUB_TREE = 1000;
LaOverviewPanelController._STATISTICS_SUB_TREE = 10000;

LaOverviewPanelController._TID = "TID";
LaOverviewPanelController._OBJ_ID = "OBJ_ID";

LaOverviewPanelController.prototype.toString = 
function() {
	return "LaOverviewPanelController";
}

LaOverviewPanelController.prototype.getOverviewPanel =
function() {
	return this._overviewPanel;
}

/**
* @param nextViewCtrlr - the controller of the next view
* Checks if it is safe to leave this view. Displays warning and Information messages if neccesary.
**/
LaOverviewPanelController.prototype.switchToNextView = 
function (nextViewCtrlr, func, params) {
	func.call(nextViewCtrlr, params);
}

/**
* @param ev
* This listener is invoked by any controller that can create an LaDomain object
**/
LaOverviewPanelController.prototype.handleDomainCreation = 
function (ev) {
	if(ev) {
		//add the new LaDomain to the controlled list
		if(ev.getDetails()) {
			var newDomain = ev.getDetails();
			var ti1 = new DwtTreeItem(this._accountsTi);			
			ti1.setText(newDomain.name);	
			ti1.setImage(LaImg.I_DOMAIN);
			ti1.setData(LaOverviewPanelController._TID, LaOverviewPanelController._ACCOUNTS_SUB_TREE);
			ti1.setData(LaOverviewPanelController._OBJ_ID, newDomain.name);
			this._domainsMap[newDomain.name] = ti1;
		}
	}
}

/**
* @param ev
* This listener is invoked by LaDomainController or any other controller that can remove an LaDomain object
**/
LaOverviewPanelController.prototype.handleDomainRemoval = 
function (ev) {
	if(ev) {
		//add the new LaDomain to the controlled list
		var detls = ev.getDetails();		
		if(detls) {
			if(detls instanceof Array) {
				for (var key in detls) {
					if((detls[key] instanceof LaDomain) && this._domainsMap[detls[key].name]) {
						this._accountsTi._removeChild(this._domainsMap[detls[key].name]);		
					}
				}
			} else if(detls instanceof LaDomain) {
				if(this._domainsMap[detls.name]) {
					this._accountsTi._removeChild(this._domainsMap[detls.name]);		
				}
			}
		}
	}
}


LaOverviewPanelController.prototype.setCurrentDomain = 
function (newDomain) {
	this._currentDomain = newDomain;
}

LaOverviewPanelController.prototype.setCurrentServer =
function (newServer) {
	this._currentServer = newServer;
}

LaOverviewPanelController.prototype.getCurrentDomain = 
function () {
	return this._currentDomain;
}

LaOverviewPanelController.prototype.getCurrentServer = 
function () {
	return this._currentServer;
}

LaOverviewPanelController.prototype._setView =
function() {
	this._overviewPanel = new LaOverviewPanel(this._container, "OverviewPanel", DwtControl.ABSOLUTE_STYLE);
	this._buildFolderTree();
	//this._overviewPanel.getFolderTree().setSelection(this._inboxTreeItem);
	this._overviewPanel.zShow(true);
}

LaOverviewPanelController.prototype._buildFolderTree =
function() {
	var tree = this._overviewPanel.getFolderTree();
	var l = new LsListener(this, this._overviewTreeListener);
	tree.addSelectionListener(l);

	var ti;

	this._statusTi = new DwtTreeItem(tree);
	this._statusTi.setText(LaMsg.OVP_status);
	this._statusTi.setImage(LaImg.I_STATUS);
	this._statusTi.setData(LaOverviewPanelController._TID, LaOverviewPanelController._STATUS);

	this.statisticsTi = new DwtTreeItem(tree);
	this.statisticsTi.setText(LaMsg.OVP_statistics);
	this.statisticsTi.setImage(LaImg.I_STATS);
	this.statisticsTi.setData(LaOverviewPanelController._TID, LaOverviewPanelController._STATISTICS);
	
	try {
		//add server nodes
		var serverList = this._app.getServerList().getArray();
		if(serverList && serverList.length) {
			var cnt = serverList.length;
			for(var ix=0; ix< cnt; ix++) {
				var ti1 = new DwtTreeItem(this.statisticsTi);			
				ti1.setText(serverList[ix].name);	
				ti1.setImage(LaImg.I_STATSBYSERVER);
				ti1.setData(LaOverviewPanelController._TID, LaOverviewPanelController._STATISTICS_SUB_TREE);
				ti1.setData(LaOverviewPanelController._OBJ_ID, serverList[ix].id);
				this._serversMap[serverList[ix].id] = ti1;
			}
		}
	} catch (ex) {
		this._handleException(ex, "LaOverviewPanelController.prototype._buildFolderTree", null, false);
	}

	
	this._accountsTi = new DwtTreeItem(tree);
	this._accountsTi.setText(LaMsg.OVP_accounts);
	this._accountsTi.setImage(LaImg.I_ACCOUNT);
	this._accountsTi.setData(LaOverviewPanelController._TID, LaOverviewPanelController._ACCOUNTS);

	try {
		//add domain nodes
		var domainList = this._app.getDomainList().getArray();
		if(domainList && domainList.length) {
			var cnt = domainList.length;
			for(var ix=0; ix< cnt; ix++) {
				var ti1 = new DwtTreeItem(this._accountsTi);			
				ti1.setText(domainList[ix].name);	
				ti1.setImage(LaImg.I_ACCOUNTBYDOMAIN);
				ti1.setData(LaOverviewPanelController._TID, LaOverviewPanelController._ACCOUNTS_SUB_TREE);
				ti1.setData(LaOverviewPanelController._OBJ_ID, domainList[ix].name);
				this._domainsMap[domainList[ix].name] = ti1;
			}
		}
	} catch (ex) {
		this._handleException(ex, "LaOverviewPanelController.prototype._buildFolderTree", null, false);
	}

	ti = new DwtTreeItem(tree);
	ti.setText(LaMsg.OVP_cos);
	ti.setImage(LaImg.I_COS);
	ti.setData(LaOverviewPanelController._TID, LaOverviewPanelController._COS);
	
	ti = new DwtTreeItem(tree);
	ti.setText(LaMsg.OVP_domains);
	ti.setImage(LaImg.I_DOMAIN);
	ti.setData(LaOverviewPanelController._TID, LaOverviewPanelController._DOMAINS);

	
	ti = new DwtTreeItem(tree);
	ti.setText(LaMsg.OVP_servers);
	ti.setImage(LaImg.I_SERVER);
	ti.setData(LaOverviewPanelController._TID, LaOverviewPanelController._SERVERS);
	
	ti = new DwtTreeItem(tree);
	ti.setText(LaMsg.OVP_global);
	ti.setImage(LaImg.I_GLOBALSETTINGS);
	ti.setData(LaOverviewPanelController._TID, LaOverviewPanelController._GLOBAL_SETTINGS);	
	
	tree.setSelection(this._statusTi, true);
}

LaOverviewPanelController.prototype._overviewTreeListener =
function(ev) {

	if (ev.detail == DwtTree.ITEM_SELECTED) {
	//DBG.dumpObj(ev);	
		var treeItemType = ev.item.getData(LaOverviewPanelController._TID);
		//DBG.println("ti = "+treeItemType);
		try {
			if (treeItemType != null) {
				switch (treeItemType) {
					case LaOverviewPanelController._COS:
						DBG.println("cos");
						if(this._app.getCurrentController()) {
							this._app.getCurrentController().switchToNextView(this._app.getCosListController(), LaCosListController.prototype.show, LaCos.getAll(this._app));
						} else {
							this._app.getCosListController().show(LaCos.getAll(this._app));
						}
						break;
					case LaOverviewPanelController._ACCOUNTS:
						DBG.println("accounts");
						this._app.getAccountListController().setPageNum(1);					
						if(this._app.getCurrentController()) {
							this._app.getCurrentController().switchToNextView(this._app.getAccountListController(), LaAccountListController.prototype.show,LaAccount.getAll(this._app));
						} else {					
							this._app.getAccountListController().show(LaAccount.getAll(this._app));
						}
						var curQuery = new LaAccountQuery("", false, "");							
						this._app.getAccountListController().setQuery(curQuery);	
						break;					
					case LaOverviewPanelController._DOMAINS:
						DBG.println("domains");				
						if(this._app.getCurrentController()) {
							this._app.getCurrentController().switchToNextView(this._app.getDomainListController(), LaDomainListController.prototype.show, LaDomain.getAll());
						} else {					
							this._app.getDomainListController().show(LaDomain.getAll());
						}
						//this._app.getDomainListController().show(LaDomain.getAll());
						break;			
					case LaOverviewPanelController._SERVERS:
						DBG.println("servers");				
						if(this._app.getCurrentController()) {
							this._app.getCurrentController().switchToNextView(this._app.getServerListController(), LaServerListController.prototype.show, LaServer.getAll());
						} else {					
							this._app.getServerListController().show(LaServer.getAll());
						}
						//this._app.getDomainListController().show(LaDomain.getAll());
						break;									
					case LaOverviewPanelController._STATUS:
						DBG.println("status");
						if(this._app.getCurrentController()) {
							this._app.getCurrentController().switchToNextView(this._app.getStatusViewController(),LaStatusViewController.prototype.show, null);
						} else {					
							this._app.getStatusViewController().show();
						}
						break;		
					case LaOverviewPanelController._STATISTICS:
						DBG.println("statistics");
						if(this._app.getCurrentController()) {
							this._app.getCurrentController().switchToNextView(this._app.getGlobalStatsController(),LaGlobalStatsController.prototype.show, null);
						} else {					
							this._app.getGlobalStatsController().show();
						}
						break;		
					case LaOverviewPanelController._GLOBAL_SETTINGS:
						DBG.println("globalsettings");
						if(this._app.getCurrentController()) {
							this._app.getCurrentController().switchToNextView(this._app.getGlobalConfigViewController(),LaGlobalConfigViewController.prototype.show, this._app.getGlobalConfig());
						} else {					
							this._app.getGlobalConfigViewController().show(this._app.getGlobalConfig());
						}
						break;		
					case LaOverviewPanelController._ACCOUNTS_SUB_TREE:
						DBG.println("accounts by domain");
						this.setCurrentDomain(ev.item.getData(LaOverviewPanelController._OBJ_ID));
						this._app.getAccountListController().setPageNum(1);	
						if(this._app.getCurrentController()) {
							this._app.getCurrentController().switchToNextView(this._app.getAccountListController(), LaAccountListController.prototype.show,LaAccount.searchByDomain(this._currentDomain, 1, LaAccount.A_uid, true, this._app));
						} else {					
							this._app.getAccountListController().show(LaAccount.searchByDomain(this._currentDomain, 1, LaAccount.A_uid, true, this._app));
						}
						var curQuery = new LaAccountQuery("", true,this._currentDomain);							
						this._app.getAccountListController().setQuery(curQuery);
						break;		
					case LaOverviewPanelController._STATISTICS_SUB_TREE:
						DBG.println("statistics by server");
						this.setCurrentServer(this._app.getServerList().getItemById(ev.item.getData(LaOverviewPanelController._OBJ_ID)));
						if(this._app.getCurrentController()) {
							this._app.getCurrentController().switchToNextView(this._app.getServerStatsController(), LaServerStatsController.prototype.show,this._currentServer);
						} else {					
							this._app.getServerStatsController().show(this._currentServer);
						}

						break;							
				}
			}
		} catch (ex) {
			if(!ex) {
				ex = new LsCsfeException("Unknown error", LsException.UNKNOWN_ERROR, "LaOverviewPanelController.prototype._overviewTreeListener", "Unknown error")
			}
			this._handleException(ex, "LaOverviewPanelController.prototype._overviewTreeListener", null, false);
		}
	}
}
