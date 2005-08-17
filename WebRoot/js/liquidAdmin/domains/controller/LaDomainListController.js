/**
* @constructor
* @class LaDomainListController
* This is a singleton object that controls all the user interaction with the list of LaDomain objects
**/
function LaDomainListController(appCtxt, container, app) {
	LaController.call(this, appCtxt, container, app);
	this._evtMgr = new LsEventMgr();
}

LaDomainListController.prototype = new LaController();
LaDomainListController.prototype.constructor = LaDomainListController;

LaDomainListController.DOMAIN_VIEW = "LaDomainListController.DOMAIN_VIEW";

LaDomainListController.prototype.show = 
function(list) {
    if (!this._appView) {
    	//create toolbar
    	this._ops = new Array();
    	this._ops.push(new LaOperation(LaOperation.NEW, LaMsg.TBB_New, LaMsg.DTBB_New_tt, LaImg.I_DOMAIN, LaImg.I_DOMAIN, new LsListener(this, LaDomainListController.prototype._newButtonListener)));
    	this._ops.push(new LaOperation(LaOperation.EDIT, LaMsg.TBB_Edit, LaMsg.DTBB_Edit_tt, LaImg.I_PROPERTIES, LaImg.I_PROPERTIES,  new LsListener(this, LaDomainListController.prototype._editButtonListener)));    	
    	this._ops.push(new LaOperation(LaOperation.DELETE, LaMsg.TBB_Delete, LaMsg.DTBB_Delete_tt, LaImg.I_DELETE, LaImg.I_DELETE, new LsListener(this, LaDomainListController.prototype._deleteButtonListener)));    	    	
   		this._ops.push(new LaOperation(LaOperation.GAL_WIZARD, LaMsg.DTBB_GAlConfigWiz, LaMsg.DTBB_GAlConfigWiz_tt, LaImg.I_DOMAIN, LaImg.I_DOMAIN, new LsListener(this, LaDomainListController.prototype._galWizButtonListener)));   		
   		this._ops.push(new LaOperation(LaOperation.AUTH_WIZARD, LaMsg.DTBB_AuthConfigWiz, LaMsg.DTBB_AuthConfigWiz_tt, LaImg.I_DOMAIN, LaImg.I_DOMAIN, new LsListener(this, LaDomainListController.prototype._authWizButtonListener)));   		   		

		this._toolbar = new LaToolBar(this._container, this._ops);

		//create Domains list view
		this._contentView = new LaDomainListView(this._container);
		this._appView = this._app.createView(LaDomainListController.DOMAIN_VIEW, [this._toolbar,  this._contentView]);
		if (list != null)
			this._contentView.set(list.getVector());

    	//context menu
    	this._actionMenu =  new LaPopupMenu(this._contentView, "ActionMenu", null, this._ops);

		this._app.pushView(LaDomainListController.DOMAIN_VIEW);			
		
		//set a selection listener on the Domain list view
		this._contentView.addSelectionListener(new LsListener(this, this._listSelectionListener));
		this._contentView.addActionListener(new LsListener(this, this._listActionListener));			
		this._removeConfirmMessageDialog = new LaMsgDialog(this._appView.shell, null, [DwtDialog.YES_BUTTON, DwtDialog.NO_BUTTON], this._app);					
		//this.refresh();
	} else {
		if (list != null)
			this._contentView.set(list.getVector());	
			
		this._app.pushView(LaDomainListController.DOMAIN_VIEW);
	}
	this._app.setCurrentController(this);
	this._removeList = new Array();
	if (list != null)
		this._list = list;
		
	this._changeActionsState();		
}

/**
* @return LaItemList - the list currently displaid in the list view
**/
LaDomainListController.prototype.getList = 
function() {
	return this._list;
}

/*
LaDomainListController.prototype.refresh = 
function() {
	try {
		this._contentView.set(this._app.getDomainList(true).getVector());
	} catch (ex) {
		this._handleException(ex, LaDomainListController.prototype.refresh, null, false);
	}
}
*/

LaDomainListController.prototype.set = 
function(domainList) {
	this.show(domainList);
}

/**
* @param ev
* This listener is invoked by LaAccountViewController or any other controller that can change an LaDomain object
**/
LaDomainListController.prototype.handleDomainChange = 
function (ev) {
	//if any of the data that is currently visible has changed - update the view
	if(ev) {
		var details = ev.getDetails();
		if(details["modFields"] && (details["modFields"][LaDomain.A_description] || details["modFields"][LaDomain.A_domainName])) {
			this._contentView.setUI();
			if(this._app.getCurrentController() == this) {
				this.show();			
			}
		}
	}
}

/**
* @param ev
* This listener is invoked by LaDomainController or any other controller that can create an LaDomain object
**/
LaDomainListController.prototype.handleDomainCreation = 
function (ev) {
	if(ev) {
		//add the new LaDomain to the controlled list
		if(ev.getDetails()) {
			this._list.add(ev.getDetails());
			this._contentView.setUI();
			if(this._app.getCurrentController() == this) {
				this.show();			
			}
		}
	}
}

/**
* @param ev
* This listener is invoked by LaDomainController or any other controller that can remove an LaDomain object
**/
LaDomainListController.prototype.handleDomainRemoval = 
function (ev) {
	if(ev) {
		//add the new LaAccount to the controlled list
		if(ev.getDetails()) {
			this._list.remove(ev.getDetails());
			this._contentView.setUI();
			if(this._app.getCurrentController() == this) {
				this.show();			
			}
		}
	}
}

/**
* @param nextViewCtrlr - the controller of the next view
* Checks if it is safe to leave this view. Displays warning and Information messages if neccesary.
**/
LaDomainListController.prototype.switchToNextView = 
function (nextViewCtrlr, func, params) {
	func.call(nextViewCtrlr, params);
}

/**
* public getToolBar
* @return reference to the toolbar
**/
LaDomainListController.prototype.getToolBar = 
function () {
	return this._toolBar;	
}

/**
* Adds listener to removal of an LaDomain 
* @param listener
**/
LaDomainListController.prototype.addDomainRemovalListener = 
function(listener) {
	this._evtMgr.addListener(LaEvent.E_REMOVE, listener);
}

/**
* Adds listener to creation of an LaDomain 
* @param listener
**/
LaDomainListController.prototype.addDomainCreationListener = 
function(listener) {
	this._evtMgr.addListener(LaEvent.E_CREATE, listener);
}

/*
// refresh button was pressed
LaDomainListController.prototype._refreshButtonListener =
function(ev) {
	this.refresh();
}
*/

/**
*	Private method that notifies listeners that a new LaDomain is created
* 	@param details
*/
LaDomainListController.prototype._fireDomainCreationEvent =
function(details) {
	try {
		if (this._evtMgr.isListenerRegistered(LaEvent.E_CREATE)) {
			var evt = new LaEvent(LaEvent.S_DOMAIN);
			evt.set(LaEvent.E_CREATE, this);
			evt.setDetails(details);
			this._evtMgr.notifyListeners(LaEvent.E_CREATE, evt);
		}
	} catch (ex) {
		this._handleException(ex, "LaDomainListController.prototype._fireDomainCreationEvent", details, false);	
	}
}

/**
*	Private method that notifies listeners to that the controlled LaDomain is changed
* 	@param details
*/
LaDomainListController.prototype._fireDomainChangeEvent =
function(details) {
	try {
		if (this._evtMgr.isListenerRegistered(LaEvent.E_MODIFY)) {
			var evt = new LaEvent(LaEvent.S_DOMAIN);
			evt.set(LaEvent.E_MODIFY, this);
			evt.setDetails(details);
			this._evtMgr.notifyListeners(LaEvent.E_MODIFY, evt);
		}
	} catch (ex) {
		this._handleException(ex, "LaDomainListController.prototype._fireDomainChangeEvent", details, false);	
	}
}

/**
*	Private method that notifies listeners to that the controlled LaDomain (are) removed
* 	@param details
*/
LaDomainListController.prototype._fireDomainRemovalEvent =
function(details) {
	try {
		if (this._evtMgr.isListenerRegistered(LaEvent.E_REMOVE)) {
			var evt = new LaEvent(LaEvent.S_DOMAIN);
			evt.set(LaEvent.E_REMOVE, this);
			evt.setDetails(details);
			this._evtMgr.notifyListeners(LaEvent.E_REMOVE, evt);
		}
	} catch (ex) {
		this._handleException(ex, "LaDomainListController.prototype._fireDomainRemovalEvent", details, false);	
	}
}


/**
* This listener is called when the item in the list is double clicked. It call LaDomainController.show method
* in order to display the Domain View
**/
LaDomainListController.prototype._listSelectionListener =
function(ev) {
	if (ev.detail == DwtListView.ITEM_DBL_CLICKED) {
		if(ev.item) {
			//this._selectedItem = ev.item;
			this._app.getDomainController().show(ev.item);
		}
	} else {
		this._changeActionsState();	
	}
}

LaDomainListController.prototype._listActionListener =
function (ev) {
	this._changeActionsState();
	this._actionMenu.popup(0, ev.docX, ev.docY);
}

/**
* This listener is called when the Edit button is clicked. 
* It call LaDomainController.show method
* in order to display the Domain View
**/
LaDomainListController.prototype._editButtonListener =
function(ev) {
	if(this._contentView.getSelectedItems() && this._contentView.getSelectedItems().getLast()) {
		var item = DwtListView.prototype.getItemFromElement.call(this, this._contentView.getSelectedItems().getLast());
		this._app.getDomainController().show(item);
	}
}

// new button was pressed
LaDomainListController.prototype._newButtonListener =
function(ev) {
	try {
		var domain = new LaDomain(this._app);
		this._newDomainWizard = new LaNewDomainXWizard(this._container, this._app);	
		this._newDomainWizard.registerCallback(DwtWizardDialog.FINISH_BUTTON, LaDomainListController.prototype._finishNewButtonListener, this, null);			
		this._newDomainWizard.setObject(domain);
		this._newDomainWizard.popup();
	} catch (ex) {
		this._handleException(ex, "LaDomainListController.prototype._newButtonListener", null, false);
	}
}


LaDomainListController.prototype._galWizButtonListener =
function(ev) {
	try {
		if(this._contentView.getSelectedItems() && this._contentView.getSelectedItems().getLast()) {
			var item = DwtListView.prototype.getItemFromElement.call(this, this._contentView.getSelectedItems().getLast());
			this._currentObject = item;
			this._galWizard = new LaGALConfigXWizard(this._container, this._app);	
			this._galWizard.registerCallback(DwtWizardDialog.FINISH_BUTTON, LaDomainListController.prototype._finishGalButtonListener, this, null);			
			this._galWizard.setObject(item);
			this._galWizard.popup();
		}
	} catch (ex) {
		this._handleException(ex, "LaDomainListController.prototype._showGalWizard", null, false);
	}
}


LaDomainListController.prototype._authWizButtonListener =
function(ev) {
	try {
		if(this._contentView.getSelectedItems() && this._contentView.getSelectedItems().getLast()) {
			var item = DwtListView.prototype.getItemFromElement.call(this, this._contentView.getSelectedItems().getLast());
			this._currentObject = item;
			this._authWizard = new LaAuthConfigXWizard(this._container, this._app);	
			this._authWizard.registerCallback(DwtWizardDialog.FINISH_BUTTON, LaDomainListController.prototype._finishAuthButtonListener, this, null);			
			this._authWizard.setObject(item);
			this._authWizard.popup();
		}
	} catch (ex) {
		this._handleException(ex, "LaDomainListController.prototype._showAuthWizard", null, false);
	}
}
/**
* This listener is called when the Delete button is clicked. 
**/
LaDomainListController.prototype._deleteButtonListener =
function(ev) {
	this._removeList = new Array();
	if(this._contentView.getSelectedItems() && this._contentView.getSelectedItems().getArray()) {
		var arrDivs = this._contentView.getSelectedItems().getArray();
		for(var key in arrDivs) {
			var item = DwtListView.prototype.getItemFromElement.call(this, arrDivs[key]);
			if(item) {
				this._removeList.push(item);		
			}
		}
	}
	if(this._removeList.length) {
		dlgMsg = LaMsg.Q_DELETE_DOMAINS;
		dlgMsg += "<br>";
		for(var key in this._removeList) {
			if(i > 19) {
				dlgMsg += "<li>...</li>";
				break;
			}
			dlgMsg += "<li>";
			if(this._removeList[key].name.length > 50) {
				//split it
				var endIx = 49;
				var beginIx = 0; //
				while(endIx < this._removeList[key].name.length) { //
					dlgMsg +=  this._removeList[key].name.slice(beginIx, endIx); //
					beginIx = endIx + 1; //
					if(beginIx >= (this._removeList[key].name.length) ) //
						break;
					
					endIx = ( this._removeList[key].name.length <= (endIx + 50) ) ? this._removeList[key].name.length-1 : (endIx + 50);
					dlgMsg +=  "<br>";	
				}
			} else {
				dlgMsg += this._removeList[key].name;
			}
			dlgMsg += "</li>";
			i++;
		}
		dlgMsg += "</ul>";
		this._removeConfirmMessageDialog.setMessage(dlgMsg, null, DwtMessageDialog.INFO_STYLE);
		this._removeConfirmMessageDialog.registerCallback(DwtDialog.YES_BUTTON, LaDomainListController.prototype._deleteDomainsCallback, this);
		this._removeConfirmMessageDialog.registerCallback(DwtDialog.NO_BUTTON, LaDomainListController.prototype._donotDeleteDomainsCallback, this);		
		this._removeConfirmMessageDialog.popup();
	}
}

LaDomainListController.prototype._deleteDomainsCallback = 
function () {
	var successRemList=new Array();
	for(var key in this._removeList) {
		if(this._removeList[key]) {
			try {
				this._removeList[key].remove();
				successRemList.push(this._removeList[key]);					
			} catch (ex) {
				this._removeConfirmMessageDialog.popdown();
				if(ex.code == LsCsfeException.DOMAIN_NOT_EMPTY) {
					this._msgDialog.setMessage(LaMsg.ERROR_DOMAIN_NOT_EMPTY, null, DwtMessageDialog.CRITICAL_STYLE, null);
					this._msgDialog.popup();			
				} else {
					this._handleException(ex, "LaDomainListController.prototype._deleteDomainsCallback", null, false);				
				}
				return;
			}
		}
		this._list.remove(this._removeList[key]); //remove from the list
	}
	this._fireDomainRemovalEvent(successRemList); 		
	this._removeConfirmMessageDialog.popdown();
	this._contentView.setUI();
	this.show();
}

LaDomainListController.prototype._donotDeleteDomainsCallback = 
function () {
	this._removeList = new Array();
	this._removeConfirmMessageDialog.popdown();
}

LaDomainListController.prototype._changeActionsState = 
function () {
	var cnt = this._contentView.getSelectionCount();
	if(cnt == 1) {
		var opsArray = [LaOperation.EDIT, LaOperation.DELETE, LaOperation.AUTH_WIZARD, LaOperation.GAL_WIZARD];
		this._toolbar.enable(opsArray, true);
		this._actionMenu.enable(opsArray, true);
	} else if (cnt > 1){
		var opsArray1 = [LaOperation.EDIT, LaOperation.AUTH_WIZARD, LaOperation.GAL_WIZARD];
		this._toolbar.enable(opsArray1, false);
		this._actionMenu.enable(opsArray1, false);

		var opsArray2 = [LaOperation.DELETE];
		this._toolbar.enable(opsArray2, true);
		this._actionMenu.enable(opsArray2, true);
	} else {
		var opsArray = [LaOperation.EDIT, LaOperation.DELETE, LaOperation.AUTH_WIZARD, LaOperation.GAL_WIZARD];
		this._toolbar.enable(opsArray, false);
		this._actionMenu.enable(opsArray, false);
	}
}

LaDomainListController.prototype._finishNewButtonListener =
function(ev) {
	try {
		var domain = LaDomain.create(this._newDomainWizard.getObject(), this._app);
		if(domain != null) {
			//if creation took place - fire an DomainChangeEvent
			this._fireDomainCreationEvent(domain);
			
			var evt = new LaEvent(LaEvent.S_DOMAIN);
			evt.set(LaEvent.E_CREATE, this);
			evt.setDetails(domain);
			this.handleDomainCreation(evt);
			
			this._newDomainWizard.popdown();		
		}
	} catch (ex) {
		if(ex.code == LsCsfeException.DOMAIN_EXISTS) {
			this.popupMsgDialog(LaMsg.ERROR_DOMAIN_EXISTS, ex);
//			this._msgDialog.setMessage(LaMsg.ERROR_DOMAIN_EXISTS, null, DwtMessageDialog.CRITICAL_STYLE, null);
	//		this._msgDialog.popup();
		} else {
			this._handleException(ex, "LaDomainListController.prototype._finishNewButtonListener", null, false);
		}
	}
	return;
}

LaDomainListController.prototype._finishAuthButtonListener =
function(ev) {
	try {
		LaDomain.modifyAuthSettings(this._authWizard.getObject(), this._currentObject);
		var changeDetails = new Object();
		//if a modification took place - fire an DomainChangeEvent
		changeDetails["obj"] = this._currentObject;
		this._fireDomainChangeEvent(changeDetails);
		this._authWizard.popdown();
	} catch (ex) {
		this._handleException(ex, "LaDomainListController.prototype._finishAuthButtonListener", null, false);
	}
	return;
}

LaDomainListController.prototype._finishGalButtonListener =
function(ev) {
	try {
		var changeDetails = new Object();
		LaDomain.modifyGalSettings(this._galWizard.getObject(),this._currentObject); 
		//if a modification took place - fire an DomainChangeEvent
		changeDetails["obj"] = this._currentObject;
		this._fireDomainChangeEvent(changeDetails);
		this._galWizard.popdown();
	} catch (ex) {
		this._handleException(ex, "LaDomainListController.prototype._finishGalButtonListener", null, false);
	}
	return;
}
