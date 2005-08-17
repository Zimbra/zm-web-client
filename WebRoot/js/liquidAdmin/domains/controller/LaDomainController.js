 /**
* @class LaDomainController controls display of a single Domain
* @contructor LaDomainController
* @param appCtxt
* @param container
* @param abApp
**/

function LaDomainController(appCtxt, container, abApp) {
	LaController.call(this, appCtxt, container, abApp);
	this._evtMgr = new LsEventMgr();
	this._UICreated = false;
}

LaDomainController.prototype = new LaController();
LaDomainController.prototype.constructor = LaDomainController;

LaDomainController.VIEW = "LaDomainController.VIEW";

/**
*	@method show
*	@param entry - isntance of LaDomain class
*/

LaDomainController.prototype.show = 
function(entry) {
	this._setView(entry);
	this._app.setCurrentController(this);
}

/**
* public getToolBar
* @return reference to the toolbar
**/
LaDomainController.prototype.getToolBar = 
function () {
	return this._toolBar;	
}

/**
* Adds listener to modifications in the contained LaDomain 
* @param listener
**/
LaDomainController.prototype.addDomainChangeListener = 
function(listener) {
	this._evtMgr.addListener(LaEvent.E_MODIFY, listener);
}

/**
* Removes listener to modifications in the controlled LaDomain 
* @param listener
**/
LaDomainController.prototype.removeDomainChangeListener = 
function(listener) {
	this._evtMgr.removeListener(LaEvent.E_MODIFY, listener);    	
}

/**
* Adds listener to creation of an LaDomain 
* @param listener
**/
LaDomainController.prototype.addDomainCreationListener = 
function(listener) {
	this._evtMgr.addListener(LaEvent.E_CREATE, listener);
}

/**
* Removes listener to creation of an LaDomain 
* @param listener
**/
LaDomainController.prototype.removeDomainCreationListener = 
function(listener) {
	this._evtMgr.removeListener(LaEvent.E_CREATE, listener);    	
}

/**
* Adds listener to removal of an LaDomain 
* @param listener
**/
LaDomainController.prototype.addDomainRemovalListener = 
function(listener) {
	this._evtMgr.addListener(LaEvent.E_REMOVE, listener);
}

/**
* Removes listener to removal of an LaDomain 
* @param listener
**/
LaDomainController.prototype.removeDomainRemovalListener = 
function(listener) {
	this._evtMgr.removeListener(LaEvent.E_REMOVE, listener);    	
}

/**
* @param nextViewCtrlr - the controller of the next view
* Checks if it is safe to leave this view. Displays warning and Information messages if neccesary.
**/
LaDomainController.prototype.switchToNextView = 
function (nextViewCtrlr, func, params) {
	if(this._view.isDirty()) {
		//parameters for the confirmation dialog's callback 
		var args = new Object();		
		args["params"] = params;
		args["obj"] = nextViewCtrlr;
		args["func"] = func;
		//ask if the user wants to save changes			
		this._confirmMessageDialog = new LaMsgDialog(this._view.shell, null, [DwtDialog.YES_BUTTON, DwtDialog.NO_BUTTON, DwtDialog.CANCEL_BUTTON], this._app);					
		this._confirmMessageDialog.setMessage(LaMsg.Q_SAVE_CHANGES, null, DwtMessageDialog.INFO_STYLE);
		this._confirmMessageDialog.registerCallback(DwtDialog.YES_BUTTON, LaDomainController.prototype._saveAndGoAway, this, args);		
		this._confirmMessageDialog.registerCallback(DwtDialog.NO_BUTTON, LaDomainController.prototype._discardAndGoAway, this, args);		
		this._confirmMessageDialog.popup();
	} else {
	
		func.call(nextViewCtrlr, params);
	}

}

LaDomainController.prototype.setDirty = 
function (isD) {
	if(isD)
		this._toolBar.getButton(LaOperation.SAVE).setEnabled(true);
	else
		this._toolBar.getButton(LaOperation.SAVE).setEnabled(false);
}

/**
*	Private method that notifies listeners to that the controlled LaDomain is changed
* 	@param details
*/
LaDomainController.prototype._fireDomainChangeEvent =
function(details) {
	try {
		if (this._evtMgr.isListenerRegistered(LaEvent.E_MODIFY)) {
			var evt = new LaEvent(LaEvent.S_DOMAIN);
			evt.set(LaEvent.E_MODIFY, this);
			evt.setDetails(details);
			this._evtMgr.notifyListeners(LaEvent.E_MODIFY, evt);
		}
	} catch (ex) {
		this._handleException(ex, "LaDomainController.prototype._fireDomainChangeEvent", details, false);	
	}
}

/**
*	Private method that notifies listeners that a new LaDomain is created
* 	@param details
*/
LaDomainController.prototype._fireDomainCreationEvent =
function(details) {
	try {
		if (this._evtMgr.isListenerRegistered(LaEvent.E_CREATE)) {
			var evt = new LaEvent(LaEvent.S_DOMAIN);
			evt.set(LaEvent.E_CREATE, this);
			evt.setDetails(details);
			this._evtMgr.notifyListeners(LaEvent.E_CREATE, evt);
		}
	} catch (ex) {
		this._handleException(ex, "LaDomainController.prototype._fireDomainCreationEvent", details, false);	
	}
}

/**
*	Private method that notifies listeners to that the controlled LaDomain is removed
* 	@param details
*/
LaDomainController.prototype._fireDomainRemovalEvent =
function(details) {
	try {
		if (this._evtMgr.isListenerRegistered(LaEvent.E_REMOVE)) {
			var evt = new LaEvent(LaEvent.S_DOMAIN);
			evt.set(LaEvent.E_REMOVE, this);
			evt.setDetails(details);
			this._evtMgr.notifyListeners(LaEvent.E_REMOVE, evt);
		}
	} catch (ex) {
		this._handleException(ex, "LaDomainController.prototype._fireDomainRemovalEvent", details, false);	
	}
}

/**
*	@method _setView 
*	@param entry - isntance of LaDomain class
*/
LaDomainController.prototype._setView =
function(entry) {
	if(!this._UICreated) {
		this._view = new LaDomainXFormView(this._container, this._app);
	  	//this._view = new LaDomainView(this._container, this._app);
   		this._ops = new Array();
   		this._ops.push(new LaOperation(LaOperation.NEW, LaMsg.TBB_New, LaMsg.DTBB_New_tt, LaImg.I_DOMAIN, LaImg.I_DOMAIN, new LsListener(this, LaDomainController.prototype._newButtonListener)));
   		this._ops.push(new LaOperation(LaOperation.GAL_WIZARD, LaMsg.DTBB_GAlConfigWiz, LaMsg.DTBB_GAlConfigWiz_tt, LaImg.I_DOMAIN, LaImg.I_DOMAIN, new LsListener(this, LaDomainController.prototype._galWizButtonListener)));   		
   		this._ops.push(new LaOperation(LaOperation.AUTH_WIZARD, LaMsg.DTBB_AuthConfigWiz, LaMsg.DTBB_AuthConfigWiz_tt, LaImg.I_DOMAIN, LaImg.I_DOMAIN, new LsListener(this, LaDomainController.prototype._authWizButtonListener)));   		   		
   		this._ops.push(new LaOperation(LaOperation.SAVE, LaMsg.TBB_Save, LaMsg.DTBB_Save_tt, LaImg.I_SAVE, LaImg.ID_SAVE, new LsListener(this, LaDomainController.prototype._saveButtonListener)));
   		this._ops.push(new LaOperation(LaOperation.CLOSE, LaMsg.TBB_Close, LaMsg.DTBB_Close_tt, LaImg.I_UNDO, LaImg.I_UNDO, new LsListener(this, LaDomainController.prototype._closeButtonListener)));    	
   		this._ops.push(new LaOperation(LaOperation.DELETE, LaMsg.TBB_Delete, LaMsg.DTBB_Delete_tt, LaImg.I_DELETE, LaImg.I_DELETE, new LsListener(this, LaDomainController.prototype._deleteButtonListener)));    	    	
	
		this._toolBar = new LaToolBar(this._container, this._ops);
	    this._app.createView(LaDomainController.VIEW, [this._toolBar, this._view]);
		this._UICreated = true;
	} 
	this._app.pushView(LaDomainController.VIEW);
	this._toolBar.getButton(LaOperation.SAVE).setEnabled(false);  		
	if(!entry.id) {
		this._toolBar.getButton(LaOperation.DELETE).setEnabled(false);  			
	} else {
		this._toolBar.getButton(LaOperation.DELETE).setEnabled(true);  				
	}
	this._view.setDirty(false);
	entry[LaModel.currentTab] = "1"
	this._view.setObject(entry); 	//setObject is delayed to be called after pushView in order to avoid jumping of the view	
	this._currentObject = entry;
}

LaDomainController.prototype._saveChanges = 
function () {
	var tmpObj = this._view.getObject();
	var mods = new Object();
	var haveSmth = false;
	if(tmpObj.attrs[LaDomain.A_notes] != this._currentObject.attrs[LaDomain.A_notes]) {
		mods[LaDomain.A_notes] = tmpObj.attrs[LaDomain.A_notes] ;
		haveSmth = true;
	}
	if(tmpObj.attrs[LaDomain.A_description] != this._currentObject.attrs[LaDomain.A_description]) {
		mods[LaDomain.A_description] = tmpObj.attrs[LaDomain.A_description] ;
		haveSmth = true;
	}
	if(!haveSmth)
		return true;
	
	 
	this._currentObject.modify(mods);
	
	return true;
}

/**
* @param params		   - params["params"] - arguments to pass to the method specified in func parameter
* 					     params["obj"] - the controller of the next view
*						 params["func"] - the method to call on the nextViewCtrlr in order to navigate to the next view
* This method saves changes in the current view and calls the method on the controller of the next view
**/
LaDomainController.prototype._saveAndGoAway =
function (params) {
	try {
		this._confirmMessageDialog.popdown();		
		if(this._saveChanges()) {
			
			params["func"].call(params["obj"], params["params"]);	
		}
	} catch (ex) {
		//if exception thrown - don' go away
		if(ex.code == LsCsfeException.DOMAIN_EXISTS) {
			this._msgDialog.setMessage(LaMsg.ERROR_DOMAIN_EXISTS, null, DwtMessageDialog.CRITICAL_STYLE, null);
			this._msgDialog.popup(this._getDialogXY());
		} else {
			this._handleException(ex, "LaDomainController.prototype._saveAndGoAway", null, false);
		}
	}
}

/**
* Leaves current view without saving any changes
**/
LaDomainController.prototype._discardAndGoAway = 
function (params) {
	this._confirmMessageDialog.popdown();

	params["func"].call(params["obj"], params["params"]);		
}



/**
* handles "save" button click
* calls modify or create on the current LaDomain
**/
LaDomainController.prototype._saveButtonListener =
function(ev) {
	try {
		if(this._saveChanges()) {
			this._view.setDirty(false);		
			this._toolBar.getButton(LaOperation.SAVE).setEnabled(false); 
			this._view.setObject(this._currentObject, true);
		}
	} catch (ex) {
		//if exception thrown - don' go away
		if(ex.code == LsCsfeException.DOMAIN_EXISTS) {
			this._msgDialog.setMessage(LaMsg.ERROR_DOMAIN_EXISTS, null, DwtMessageDialog.CRITICAL_STYLE, null);
			this._msgDialog.popup(this._getDialogXY());
		} else {
			this._handleException(ex, "LaDomainController.prototype._saveButtonListener", null, false);
		}
	}
}

/**
* handles the Close button click. Returns to the list view.
**/ 
LaDomainController.prototype._closeButtonListener =
function(ev) {
	//prompt if the user wants to save the changes
	if(this._view.isDirty()) {
		//parameters for the confirmation dialog's callback 
		var args = new Object();		
		args["params"] = null;
		args["obj"] = this._app.getDomainListController();
		args["func"] = LaDomainListController.prototype.show;
		//ask if the user wants to save changes		
		this._confirmMessageDialog = new LaMsgDialog(this._view.shell, null, [DwtDialog.YES_BUTTON, DwtDialog.NO_BUTTON, DwtDialog.CANCEL_BUTTON], this._app);								
		this._confirmMessageDialog.setMessage("Do you want so save current changes?", null, DwtMessageDialog.INFO_STYLE);
		this._confirmMessageDialog.registerCallback(DwtDialog.YES_BUTTON, LaDomainController.prototype._saveAndGoAway, this, args);		
		this._confirmMessageDialog.registerCallback(DwtDialog.NO_BUTTON, LaDomainController.prototype._discardAndGoAway, this, args);		
		this._confirmMessageDialog.popup();
	} else {

		this._app.getDomainListController().show();
	}	
}

/**
* This listener is called when the Delete button is clicked. 
**/
LaDomainController.prototype._deleteButtonListener =
function(ev) {
	if(this._currentObject.id) {
		this._confirmMessageDialog = new LaMsgDialog(this._view.shell, null, [DwtDialog.YES_BUTTON, DwtDialog.NO_BUTTON], this._app);						
		this._confirmMessageDialog.setMessage("Are you sure you want to delete this Domain?", null, DwtMessageDialog.INFO_STYLE);
		this._confirmMessageDialog.registerCallback(DwtDialog.YES_BUTTON, LaDomainController.prototype._deleteAndGoAway, this, null);		
		this._confirmMessageDialog.registerCallback(DwtDialog.NO_BUTTON, LaDomainController.prototype._closeCnfrmDlg, this, null);				
		this._confirmMessageDialog.popup();
	} else {
		return;
	}
}

LaDomainController.prototype._deleteAndGoAway = 
function () {
	try {
		if(this._currentObject.id) {
			this._currentObject.remove();
			this._fireDomainRemovalEvent(this._currentObject);
		}
		this._app.getDomainListController().show();
		this._confirmMessageDialog.popdown();	
			
	} catch (ex) {
		this._confirmMessageDialog.popdown();	
		if(ex.code == LsCsfeException.DOMAIN_NOT_EMPTY) {
			this._msgDialog.setMessage(LaMsg.ERROR_DOMAIN_NOT_EMPTY, null, DwtMessageDialog.CRITICAL_STYLE, null);
			this._msgDialog.popup();			
		} else {
			this._handleException(ex, "LaDomainController.prototype._deleteAndGoAway", null, false);				
		}
	}
}

LaDomainController.prototype._closeCnfrmDlg = 
function () {
	this._confirmMessageDialog.popdown();	
}

LaDomainController.prototype.newDomain = 
function () {
	this._currentObject = new LaDomain();
	this._showNewDomainWizard();
}

LaDomainController.prototype._showNewDomainWizard = 
function () {
	try {
		this._newDomainWizard = new LaNewDomainXWizard(this._container, this._app);	
		this._newDomainWizard.registerCallback(DwtWizardDialog.FINISH_BUTTON, LaDomainController.prototype._finishNewButtonListener, this, null);			
		this._newDomainWizard.setObject(this._currentObject);
		this._newDomainWizard.popup();
	} catch (ex) {
			this._handleException(ex, "LaDomainController.prototype._showNewDomainWizard", null, false);
	}
}

// new button was pressed
LaDomainController.prototype._newButtonListener =
function(ev) {
	if(this._view.isDirty()) {
		//parameters for the confirmation dialog's callback 
		var args = new Object();		
		args["params"] = null;
		args["obj"] = this._app.getDomainController();
		args["func"] = LaDomainController.prototype.newDomain;
		//ask if the user wants to save changes		
		this._confirmMessageDialog = new LaMsgDialog(this._view.shell, null, [DwtDialog.YES_BUTTON, DwtDialog.NO_BUTTON, DwtDialog.CANCEL_BUTTON], this._app);								
		this._confirmMessageDialog.setMessage("Do you want so save current changes?", null, DwtMessageDialog.INFO_STYLE);
		this._confirmMessageDialog.registerCallback(DwtDialog.YES_BUTTON, LaDomainController.prototype._saveAndGoAway, this, args);		
		this._confirmMessageDialog.registerCallback(DwtDialog.NO_BUTTON, LaDomainController.prototype._discardAndGoAway, this, args);		
		this._confirmMessageDialog.popup();
	} else {
		this.newDomain();
	}	
}


LaDomainController.prototype._galWizButtonListener =
function(ev) {
	try {
		this._galWizard = new LaGALConfigXWizard(this._container, this._app);	
		this._galWizard.registerCallback(DwtWizardDialog.FINISH_BUTTON, LaDomainController.prototype._finishGalButtonListener, this, null);			
		this._galWizard.setObject(this._currentObject);
		this._galWizard.popup();
	} catch (ex) {
			this._handleException(ex, "LaDomainController.prototype._showGalWizard", null, false);
	}
}


LaDomainController.prototype._authWizButtonListener =
function(ev) {
	try {
		this._authWizard = new LaAuthConfigXWizard(this._container, this._app);	
		this._authWizard.registerCallback(DwtWizardDialog.FINISH_BUTTON, LaDomainController.prototype._finishAuthButtonListener, this, null);			
		this._authWizard.setObject(this._currentObject);
		this._authWizard.popup();
	} catch (ex) {
			this._handleException(ex, "LaDomainController.prototype._showAuthWizard", null, false);
	}
}

LaDomainController.prototype._finishGalButtonListener =
function(ev) {
	try {
		var changeDetails = new Object();
		LaDomain.modifyGalSettings(this._galWizard.getObject(),this._currentObject); 
		//if a modification took place - fire an DomainChangeEvent
		changeDetails["obj"] = this._currentObject;
		this._fireDomainChangeEvent(changeDetails);
		this._view.setObject(this._currentObject);		
		this._galWizard.popdown();
	} catch (ex) {
		this._handleException(ex, "LaDomainController.prototype._finishGalButtonListener", null, false);
	}
	return;
}

LaDomainController.prototype._finishAuthButtonListener =
function(ev) {
	try {
		LaDomain.modifyAuthSettings(this._authWizard.getObject(), this._currentObject);
		var changeDetails = new Object();
		//if a modification took place - fire an DomainChangeEvent
		changeDetails["obj"] = this._currentObject;
	
		this._fireDomainChangeEvent(changeDetails);
		this._view.setObject(this._currentObject);
		this._authWizard.popdown();
	} catch (ex) {
		this._handleException(ex, "LaDomainController.prototype._finishAuthButtonListener", null, false);
	}
	return;
}

/**
* @param 	ev event object
* This method handles "finish" button click in "New Domain" dialog
**/

LaDomainController.prototype._finishNewButtonListener =
function(ev) {
	try {
		var domain = LaDomain.create(this._newDomainWizard.getObject(), this._app);
		if(domain != null) {
			//if creation took place - fire an DomainChangeEvent
			this._fireDomainCreationEvent(domain);
			this._toolBar.getButton(LaOperation.DELETE).setEnabled(true);	
			this._newDomainWizard.popdown();		
		}
	} catch (ex) {
		if(ex.code == LsCsfeException.DOMAIN_EXISTS) {
			this.popupMsgDialog(LaMsg.ERROR_DOMAIN_EXISTS, ex);		
//			this._msgDialog.setMessage(LaMsg.ERROR_DOMAIN_EXISTS, null, DwtMessageDialog.CRITICAL_STYLE, null);
	//		this._msgDialog.popup(this._getDialogXY());
		} else {
			this._handleException(ex, "LaDomainController.prototype._finishNewButtonListener", null, false);
		}
	}
	return;
}
