function LaApp(appCtxt, container) {
	if (arguments.length == 0) return;
	this._name = LaLiquidAdmin.ADMIN_APP;
	this._appCtxt = appCtxt;
	this._appViewMgr = appCtxt.getAppViewMgr();
	this._container = container;
	this._currentController = null;
	this._cosListChoices = null;//new XFormChoices([], XFormChoices.OBJECT_LIST, "id", "name");	
	this._domainListChoices = null;//new XFormChoices([], XFormChoices.OBJECT_LIST, "name", "name");	
	this._serverChoices = null; 
	this._serverMap = null;
}

LaApp.prototype.constructor = LaApp;

LaApp.prototype.toString = 
function() {
	return "LaApp";
}

LaApp.prototype.launch =
function(appCtxt) {
	this.getStatusViewController().show();
	//this.getAccountListController().show(LaAccount.getAll());
}

LaApp.prototype.setActive =
function(active) {
	if (active) {
		this.getStatusViewController().show();
	}
}

LaApp.prototype.getAppCtxt = 
function() {
	return this._appCtxt;
}

LaApp.prototype.setCurrentController = 
function(ctrlr) {
	this._currentController = ctrlr;
}

LaApp.prototype.getCurrentController = 
function(ctrlr) {
	return this._currentController;
}


/**
* View controllers
**/
LaApp.prototype.getStatusViewController =
function() {
	if (this._statusViewController == null)
		this._statusViewController = new LaStatusViewController(this._appCtxt, this._container, this);
	return this._statusViewController;
}

LaApp.prototype.getServerStatsController =
function() {
	if (this._serverStatsController == null)
		this._serverStatsController = new LaServerStatsController(this._appCtxt, this._container, this);
	return this._serverStatsController;
}

LaApp.prototype.getGlobalStatsController =
function() {
	if (this._globalStatsController == null)
		this._globalStatsController = new LaGlobalStatsController(this._appCtxt, this._container, this);
	return this._globalStatsController;
}

LaApp.prototype.getGlobalConfigViewController =
function() {
	if (this._globalConfigViewController == null)
		this._globalConfigViewController = new LaGlobalConfigViewController(this._appCtxt, this._container, this);
	return this._globalConfigViewController;
}

LaApp.prototype.getAccountListController =
function() {
	if (this._accountListController == null) {
		this._accountListController = new LaAccountListController(this._appCtxt, this._container, this);
		this._accountListController.addAccountRemovalListener(new LsListener(this, LaApp.prototype.handleAccountRemoval));					
		this._accountListController.addAccountRemovalListener(new LsListener(this.getAccountListController(), LaAccountListController.prototype.handleAccountRemoval));							
	}
	return this._accountListController;
}

LaApp.prototype.getAccountViewController =
function() {
	if (this._accountViewController == null) {
		this._accountViewController = new LaAccountViewController(this._appCtxt, this._container, this);
		//since we are creating the account controller now - register all the interested listeners with it
		this._accountViewController.addAccountChangeListener(new LsListener(this.getAccountListController(), LaAccountListController.prototype.handleAccountChange));
		this._accountViewController.addAccountCreationListener(new LsListener(this.getAccountListController(), LaAccountListController.prototype.handleAccountCreation));	
		this._accountViewController.addAccountRemovalListener(new LsListener(this.getAccountListController(), LaAccountListController.prototype.handleAccountRemoval));			
		this._accountViewController.addAccountCreationListener(new LsListener(this, LaApp.prototype.handleAccountCreation));			
		this._accountViewController.addAccountRemovalListener(new LsListener(this, LaApp.prototype.handleAccountRemoval));					
	}
	return this._accountViewController;
}

LaApp.prototype.getNewAccountWizController =
function() {
	if (this._newAccountWizController == null) {
		this._newAccountWizController = new LaNewAccountWizController(this._appCtxt, this._container, this);
		//since we are creating the account controller now - register all the interested listeners with it
		this._newAccountWizController.addAccountCreationListener(new LsListener(this.getAccountListController(), LaAccountListController.prototype.handleAccountCreation));	
		this._newAccountWizController.addAccountCreationListener(new LsListener(this, LaApp.prototype.handleAccountCreation));			
	}
	return this._newAccountWizController;
}


LaApp.prototype.getDomainListController =
function() {
	if (this._domainListController == null) {
		this._domainListController = new LaDomainListController(this._appCtxt, this._container, this);
		
		this._domainListController.addDomainCreationListener(new LsListener(this, LaApp.prototype.handleDomainCreation));					
		this._domainListController.addDomainCreationListener(new LsListener(this._appCtxt.getAppController().getOverviewPanelController(), LaOverviewPanelController.prototype.handleDomainCreation));				

		this._domainListController.addDomainRemovalListener(new LsListener(this, LaApp.prototype.handleDomainRemoval));							
		this._domainListController.addDomainRemovalListener(new LsListener(this._appCtxt.getAppController().getOverviewPanelController(), LaOverviewPanelController.prototype.handleDomainRemoval));						
		
	}
	return this._domainListController;
}

LaApp.prototype.getDomainController =
function() {
	if (this._domainController == null) {
		this._domainController = new LaDomainController(this._appCtxt, this._container, this);
		//since we are creating the account controller now - register all the interested listeners with it
		this._domainController.addDomainChangeListener(new LsListener(this.getDomainListController(), LaDomainListController.prototype.handleDomainChange));

		this._domainController.addDomainCreationListener(new LsListener(this, LaApp.prototype.handleDomainCreation));					
		this._domainController.addDomainCreationListener(new LsListener(this.getDomainListController(), LaDomainListController.prototype.handleDomainCreation));	
		this._domainController.addDomainCreationListener(new LsListener(this._appCtxt.getAppController().getOverviewPanelController(), LaOverviewPanelController.prototype.handleDomainCreation));				

		this._domainController.addDomainRemovalListener(new LsListener(this.getDomainListController(), LaDomainListController.prototype.handleDomainRemoval));			
		this._domainController.addDomainRemovalListener(new LsListener(this, LaApp.prototype.handleDomainRemoval));							
		
		this._domainController.addDomainRemovalListener(new LsListener(this._appCtxt.getAppController().getOverviewPanelController(), LaOverviewPanelController.prototype.handleDomainRemoval));						
	}

	return this._domainController;
}

LaApp.prototype.getServerListController =
function() {
	if (this._serverListController == null) {
		this._serverListController = new LaServerListController(this._appCtxt, this._container, this);
		this._serverListController.addServerRemovalListener(new LsListener(this, LaApp.prototype.handleServerRemoval));	
	
	}
	return this._serverListController;
}

LaApp.prototype.getServerController =
function() {
	if (this._serverController == null) {
		this._serverController = new LaServerController(this._appCtxt, this._container, this);
		this._serverController.addServerChangeListener(new LsListener(this, LaApp.prototype.handleServerChange));		
		this._serverController.addServerChangeListener(new LsListener(this.getServerListController(), LaServerListController.prototype.handleServerChange));		
	}
	return this._serverController;
}

LaApp.prototype.getCosListController =
function() {
	if (this._cosListController == null) {
		this._cosListController = new LaCosListController(this._appCtxt, this._container, this);
		this._cosListController.addCosRemovalListener(new LsListener(this, LaApp.prototype.handleCosRemoval));			
	}
	return this._cosListController;
}


LaApp.prototype.getCosController =
function() {
	if (this._cosController == null) {
		this._cosController = new LaCosController(this._appCtxt, this._container, this);
		//since we are creating the COS controller now - register all the interested listeners with it
		this._cosController.addCosChangeListener(new LsListener(this, LaApp.prototype.handleCosChange));			
		this._cosController.addCosChangeListener(new LsListener(this.getCosListController(), LaCosListController.prototype.handleCosChange));

		this._cosController.addCosCreationListener(new LsListener(this.getCosListController(), LaCosListController.prototype.handleCosCreation));	
		this._cosController.addCosCreationListener(new LsListener(this, LaApp.prototype.handleCosCreation));			

		this._cosController.addCosRemovalListener(new LsListener(this, LaApp.prototype.handleCosRemoval));			
		this._cosController.addCosRemovalListener(new LsListener(this.getCosListController(), LaCosListController.prototype.handleCosRemoval));			
	}
	return this._cosController;
}

LaApp.prototype.getDomainList =
function(refresh) {
	if (refresh || this._domainList == null) {
		this._domainList = LaDomain.getAll();
		EmailAddr_XFormItem.domainChoices.setChoices(this._domainList.getArray());
		EmailAddr_XFormItem.domainChoices.dirtyChoices();
	}
	return this._domainList;	
}

LaApp.prototype.getDomainListChoices =
function(refresh) {
	if (refresh || this._domainList == null) {
		this._domainList = LaDomain.getAll(this);
	}
	if(refresh || this._domainListChoices == null) {
		if(this._domainListChoices == null)
			this._domainListChoices = new XFormChoices([], XFormChoices.OBJECT_LIST, "name", "name");	

		this._domainListChoices.setChoices(this._domainList.getArray());
		this._domainListChoices.dirtyChoices();

	}
	return this._domainListChoices;	
}

LaApp.prototype.getServerByName =
function(serverName) {
	if (this._serverList == null) {
		this._serverList = LaServer.getAll();
	}
	var cnt = this._serverList.getArray().length;
	var myServer = new LaServer(this);
	for(var i = 0; i < cnt; i++) {
		if(this._serverList.getArray()[i].attrs[LaServer.A_ServiceHostname] == serverName)
			return this._serverList.getArray()[i];
	}
	if(i == cnt) {
		myServer = new LaServer();
		myServer.load("name", serverName);
	}
	return myServer;	
}

LaApp.prototype.getServerList =
function(refresh) {
	if (refresh || this._serverList == null) {
		this._serverList = LaServer.getAll();
	}
	return this._serverList;	
}

LaApp.prototype.getServerListChoices =
function(refresh) {
	if (refresh || this._serverList == null) {
		this._serverList = LaServer.getAll();
	}
	if(refresh || this._serverChoices == null) {
		if(this._serverChoices == null) {
			this._serverChoices = new XFormChoices(this._serverList.getArray(), XFormChoices.OBJECT_LIST, "id", "name");
		} else {	
			this._serverChoices.setChoices(this._serverList.getArray());
			this._serverChoices.dirtyChoices();
		}
	}
	return this._serverChoices;	
}

LaApp.prototype.getServerMap =
function(refresh) {
	if(refresh || this._serverList == null) {
		this._serverList = LaServer.getAll();
	}
	if(refresh || this._serverMap == null) {
		this._serverMap = new Object();
		var cnt = this._serverList.getArray().length;
		for (var i = 0; i < cnt; i ++) {
			this._serverMap[this._serverList.getArray()[i].id] = this._serverList.getArray()[i];
		}
	}
	return this._serverMap;
}

LaApp.prototype.getCosList =
function(refresh) {
	if (refresh || this._cosList == null) {
		this._cosList = LaCos.getAll(this);
	}
	return this._cosList;	
}

LaApp.prototype.getCosListChoices =
function(refresh) {
	if (refresh || this._cosList == null) {
		this._cosList = LaCos.getAll(this);
	}
	if(refresh || this._cosListChoices == null) {
		if(this._cosListChoices == null)
			this._cosListChoices = new XFormChoices([], XFormChoices.OBJECT_LIST, "id", "name");	

		this._cosListChoices.setChoices(this._cosList.getArray());
		this._cosListChoices.dirtyChoices();

	}
	return this._cosListChoices;	
}

LaApp.prototype.getStatusList =
function(refresh) {
	if (refresh || this._statusList == null) {
		this._statusList = LaStatus.loadStatusTable();
	}
	return this._statusList;	
}

LaApp.prototype.getAccountList =
function(refresh) {
	if (refresh || this._accountList == null) {
		this._accountList = LaAccount.getAll(this).list;
	}
	return this._accountList;	
}

LaApp.prototype.getGlobalConfig =
function(refresh) {
	if (refresh || this._globalConfig == null) {
		this._globalConfig = new LaGlobalConfig(this);
	}
	return this._globalConfig;	
}


/**
* @param ev
* This listener is invoked by any controller that can create an LaDomain object
**/
LaApp.prototype.handleDomainCreation = 
function (ev) {
	if(ev) {
		//add the new LaDomain to the controlled list
		if(ev.getDetails()) {
			if(!this._domainList) {
				this._domainList=LaDomain.getAll();
			}
			this._domainList.add(ev.getDetails());
			EmailAddr_XFormItem.domainChoices.setChoices(this._domainList.getArray());
			EmailAddr_XFormItem.domainChoices.dirtyChoices();	
			if(this._domainListChoices == null) {
				this._domainListChoices = new XFormChoices(this._domainList.getArray(), XFormChoices.OBJECT_LIST, "name", "name");	
			} else {
				this._domainListChoices.setChoices(this._domainList.getArray());
				this._domainListChoices.dirtyChoices();			
			}					
		}
	}
}

/**
* @param ev
* This listener is invoked by any controller that can create an LaCos object
**/
LaApp.prototype.handleCosCreation = 
function (ev) {
	if(ev) {
		//add the new LaCos to the controlled list
		if(ev.getDetails()) {
			if(!this._cosList) {
				this._cosList=LaCos.getAll(this);
			} else {
				this._cosList.add(ev.getDetails());
			}
			if(this._cosListChoices == null) {
				this._cosListChoices = new XFormChoices(this._cosList.getArray(), XFormChoices.OBJECT_LIST, "id", "name");	
			} else {
				this._cosListChoices.setChoices(this._cosList.getArray());
				this._cosListChoices.dirtyChoices();			
			}
		}
	}
}

/**
* @param ev
* This listener is invoked by any controller that can change an LaCos object
**/
LaApp.prototype.handleCosChange = 
function (ev) {
	if(ev) {
		//add the new LaCos to the controlled list
		if(ev.getDetails()) {
			if(!this._cosList) {
				this._cosList=LaCos.getAll(this);
			} else {
				//find the modified COS 
				var cnt = this._cosList.getArray().length;
				for(var i = 0; i < cnt; i ++) {
					if(this._cosList.getArray()[i].id == ev.getDetails()["obj"].id) {
						this._cosList.getArray()[i] = ev.getDetails()["obj"];
						break;
					}
				}
			}
			
			if(this._cosListChoices == null) {
				this._cosListChoices = new XFormChoices(this._cosList.getArray(), XFormChoices.OBJECT_LIST, "id", "name");	
			} else {
				this._cosListChoices.setChoices(this._cosList.getArray());
				this._cosListChoices.dirtyChoices();			
			}
		}
	}
}
/**
* @param ev
* This listener is invoked by any controller that can create an LaAccount object
**/
LaApp.prototype.handleAccountCreation = 
function (ev) {
	if(ev) {
		//add the new LaAccount to the controlled list
		if(ev.getDetails()) {
			if(!this._accountList) {
				this._accountList=LaAccount.getAll().list;
			} else {
				this._accountList.add(ev.getDetails());
			}
		}
	}
}

/**
* @param ev
* This listener is invoked by LaAccountViewController or any other controller that can remove an LaAccount object
**/
LaApp.prototype.handleAccountRemoval = 
function (ev) {
	if(ev) {
		if(!this._accountList) {
			this._accountList=LaAccount.getAll().list;
		} else {
			//remove the LaAccount from the controlled list
			var detls = ev.getDetails();
			if(detls && (detls instanceof Array)) {
				for (var key in detls) {
					this._accountList.remove(detls[key]);
				}
			} else if(detls && (detls instanceof LaAccount)) {
				this._accountList.remove(ev.getDetails());
			}
		}
	}
}

/**
* @param ev
* This listener is invoked by LaCosController or any other controller that can remove an LaCos object
**/
LaApp.prototype.handleCosRemoval = 
function (ev) {
	if(ev) {
		if(!this._cosList) {
			this._cosList=LaCos.getAll(this);
		} else {
			//remove the LaCos from the controlled list
			var detls = ev.getDetails();
			if(detls && (detls instanceof Array)) {
				for (var key in detls) {
					this._cosList.remove(detls[key]);
				}
			} else if(detls && (detls instanceof LaCos)) {
				this._cosList.remove(ev.getDetails());
			}
		}
		if(this._cosListChoices == null) {
			this._cosListChoices = new XFormChoices(this._cosList.getArray(), XFormChoices.OBJECT_LIST, "id", "name");	
		} else {
			this._cosListChoices.setChoices(this._cosList.getArray());
			this._cosListChoices.dirtyChoices();			
		}
	}
}

LaApp.prototype.handleServerChange = 
function (ev) {
	if(ev) {
		if(this._serverList) {
			this._serverList=LaServer.getAll();
			if(this._serverChoices == null) {
				this._serverChoices = new XFormChoices(this._serverList.getArray(), XFormChoices.OBJECT_LIST, "id", "name");
			} else {	
				this._serverChoices.setChoices(this._serverList.getArray());
				this._serverChoices.dirtyChoices();
			}

			this._serverMap = new Object();
			var cnt = this._serverList.getArray().length;
			for (var i = 0; i < cnt; i ++) {
				this._serverMap[this._serverList.getArray()[i].id] = this._serverList.getArray()[i];
			}						
		} 
	}
}

/**
* @param ev
* This listener is invoked by any controller that can remove an LaServer object
**/
LaApp.prototype.handleServerRemoval = 
function (ev) {
	if(ev) {
		if(!this._serverList) {
			this._serverList=LaServer.getAll();
		} else {
			//remove the LaCos from the controlled list
			var detls = ev.getDetails();
			if(detls && (detls instanceof Array)) {
				for (var key in detls) {
					this._serverList.remove(detls[key]);
				}
			} else if(detls && (detls instanceof LaServer)) {
				this._serverList.remove(ev.getDetails());
			}
		}
		if(this._serverChoices == null) {
			this._serverChoices = new XFormChoices(this._serverList.getArray(), XFormChoices.OBJECT_LIST, "id", "name");
		} else {	
			this._serverChoices.setChoices(this._serverList.getArray());
			this._serverChoices.dirtyChoices();
		}
		
		
		this._serverMap = new Object();
		var cnt = this._serverList.getArray().length;
		for (var i = 0; i < cnt; i ++) {
			this._serverMap[this._serverList.getArray()[i].id] = this._serverList.getArray()[i];
		}		
	}
}
/**
* @param ev
* This listener is invoked by LaDomainController or any other controller that can remove an LaDomain object
**/
LaApp.prototype.handleDomainRemoval = 
function (ev) {
	if(ev) {
		if(!this._domainList) {
			this._domainList=LaDomain.getAll();
		} else {
			//remove the LaDomain from the controlled list
			var detls = ev.getDetails();
			if(detls && (detls instanceof Array)) {
				for (var key in detls) {
					this._domainList.remove(detls[key]);
				}
			} else if(detls && (detls instanceof LaDomain)) {
				this._domainList.remove(ev.getDetails());
			}
		}
		EmailAddr_XFormItem.domainChoices.setChoices(this._domainList.getArray());
		EmailAddr_XFormItem.domainChoices.dirtyChoices();		
		if(this._domainListChoices == null) {
			this._domainListChoices = new XFormChoices(this._domainList.getArray(), XFormChoices.OBJECT_LIST, "name", "name");	
		} else {
			this._domainListChoices.setChoices(this._domainList.getArray());
			this._domainListChoices.dirtyChoices();			
		}			
	}
}

/**
* Returns the app's name.
*/
LaApp.prototype.getName =
function() {
	return this._name;
}

/**
* Returns the app view manager.
*/
LaApp.prototype.getAppViewMgr = 
function() {
	return this._appViewMgr;
}

// Convenience functions that call through to app view manager. See LaAppViewMgr for details.

LaApp.prototype.setAppView =
function(view) {
	this._appViewMgr.setAppView(this._name, view);
}

LaApp.prototype.createView =
function(viewName, elements, popCallback, style, isVolatile, isAppView) {
	return this._appViewMgr.createView(viewName, this._name, elements, popCallback, style, isVolatile, isAppView);
}

LaApp.prototype.pushView =
function(name, force) {
	return this._appViewMgr.pushView(name, force);
}
/*
LaApp.prototype.popView =
function(force) {
	return this._appViewMgr.popView(force);
}
*/
LaApp.prototype.setView =
function(name, force) {
	return this._appViewMgr.setView(name, force);
}

// Abstract methods

/**
* Run when the activation state of an app changes.
*/
LaApp.prototype.activate =
function(active) {
}

/**
* Clears an app's state.
*/
LaApp.prototype.reset =
function(active) {
}
