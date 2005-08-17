/**
* @class LaServerController controls display of a single Domain
* @contructor LaServerController
* @param appCtxt
* @param container
* @param abApp
**/

function LaServerController(appCtxt, container, abApp) {
	LaController.call(this, appCtxt, container, abApp);
	this._evtMgr = new LsEventMgr();
	this._UICreated = false;
}

LaServerController.prototype = new LaController();
LaServerController.prototype.constructor = LaServerController;

LaServerController.VIEW = "LaServerController.VIEW";

/**
*	@method show
*	@param entry - isntance of LaServer class
*/

LaServerController.prototype.show = 
function(entry) {
	this._setView(entry);
	this._app.setCurrentController(this);
	this.setDirty(false);
}


LaServerController.prototype.setEnabled = 
function(enable) {
	//this._view.setEnabled(enable);
}

/**
* public getToolBar
* @return reference to the toolbar
**/
LaServerController.prototype.getToolBar = 
function () {
	return this._toolBar;	
}

/**
* Adds listener to modifications in the contained LaServer 
* @param listener
**/
LaServerController.prototype.addServerChangeListener = 
function(listener) {
	this._evtMgr.addListener(LaEvent.E_MODIFY, listener);
}

/**
* Removes listener to modifications in the controlled LaServer 
* @param listener
**/
LaServerController.prototype.removeServerChangeListener = 
function(listener) {
	this._evtMgr.removeListener(LaEvent.E_MODIFY, listener);    	
}

LaServerController.prototype.setDirty = 
function (isD) {
	if(isD)
		this._toolBar.getButton(LaOperation.SAVE).setEnabled(true);
	else
		this._toolBar.getButton(LaOperation.SAVE).setEnabled(false);
}


/**
* @param nextViewCtrlr - the controller of the next view
* Checks if it is safe to leave this view. Displays warning and Information messages if neccesary.
**/
LaServerController.prototype.switchToNextView = 
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
		this._confirmMessageDialog.registerCallback(DwtDialog.YES_BUTTON, LaServerController.prototype._saveAndGoAway, this, args);		
		this._confirmMessageDialog.registerCallback(DwtDialog.NO_BUTTON, LaServerController.prototype._discardAndGoAway, this, args);		
		this._confirmMessageDialog.popup();
	} else {
	
		func.call(nextViewCtrlr, params);
	}

}

/**
*	Private method that notifies listeners to that the controlled LaServer is changed
* 	@param details
*/
LaServerController.prototype._fireServerChangeEvent =
function(details) {
	try {
		if (this._evtMgr.isListenerRegistered(LaEvent.E_MODIFY)) {
			var evt = new LaEvent(LaEvent.S_SERVER);
			evt.set(LaEvent.E_MODIFY, this);
			evt.setDetails(details);
			this._evtMgr.notifyListeners(LaEvent.E_MODIFY, evt);
		}
	} catch (ex) {
		this._handleException(ex, "LaServerController.prototype._fireServerChangeEvent", details, false);	
	}
}



/**
*	@method _setView 
*	@param entry - isntance of LaDomain class
*/
LaServerController.prototype._setView =
function(entry) {
	if(!this._UICreated) {
		this._view = new LaServerXFormView(this._container, this._app);
	  	//this._view = new LaServerView(this._container, this._app);
   		this._ops = new Array();
   		this._ops.push(new LaOperation(LaOperation.SAVE, LaMsg.TBB_Save, LaMsg.SERTBB_Save_tt, LaImg.I_SAVE, LaImg.ID_SAVE, new LsListener(this, LaServerController.prototype._saveButtonListener)));
   		this._ops.push(new LaOperation(LaOperation.CLOSE, LaMsg.TBB_Close, LaMsg.SERTBB_Close_tt, LaImg.I_UNDO, LaImg.I_UNDO, new LsListener(this, LaServerController.prototype._closeButtonListener)));    	

		this._toolBar = new LaToolBar(this._container, this._ops);
	    this._app.createView(LaServerController.VIEW, [this._toolBar, this._view]);
		this._UICreated = true;
	} 
	this._app.pushView(LaServerController.VIEW);
	this._view.setDirty(false);
	this._view.setObject(entry); 	//setObject is delayed to be called after pushView in order to avoid jumping of the view	
	this._currentObject = entry;
}

LaServerController.prototype._saveChanges =
function (obj) {
//	var tmpObj = this._view.getObject();
	var isNew = false;
	if(obj.attrs == null) {
		//show error msg
		this._msgDialog.setMessage(LaMsg.ERROR_UNKNOWN, null, DwtMessageDialog.CRITICAL_STYLE, null);
		this._msgDialog.popup();		
		return false;	
	}

	// update liquidServiceEnabled
	if (obj.attrs[LaServer.A_liquidServiceInstalled]) {
		// get list of actually enabled fields
		var enabled = [];
		for (var i = 0; i < obj.attrs[LaServer.A_liquidServiceInstalled].length; i++) {
			var service = obj.attrs[LaServer.A_liquidServiceInstalled][i];
			if (obj.attrs["_"+LaServer.A_liquidServiceEnabled+"_"+service]) {
				enabled.push(service);
			}			
		}
		
		// see if list of actually enabled fields is same as before
		var dirty = enabled.length > 0;
		if (obj.attrs[LaServer.A_liquidServiceEnabled]) {
			var prevEnabled = LsUtil.isString(obj.attrs[LaServer.A_liquidServiceEnabled])
							? [ obj.attrs[LaServer.A_liquidServiceEnabled] ]
							: obj.attrs[LaServer.A_liquidServiceEnabled];
			dirty = enabled.length != prevEnabled.length;		
			if (!dirty) {
				for (var i = 0; i < prevEnabled.length; i++) {
					var service = prevEnabled[i];
					if (!obj.attrs["_"+LaServer.A_liquidServiceEnabled+"_"+service]) {
						dirty = true;
						break;
					}
				}
			}
		}
		
		// save new list of enabled fields
		if (dirty) {
			obj.attrs[LaServer.A_liquidServiceEnabled] = enabled;
		}
	}

	//transfer the fields from the tmpObj to the _currentObject, since _currentObject is an instance of LaDomain
	var mods = new Object();
	for (var a in obj.attrs) {
		if(a == LaItem.A_objectClass || /^_/.test(a))
			continue;
		if (this._currentObject.attrs[a] != obj.attrs[a] ) {
			mods[a] = obj.attrs[a];
		}
	}

	//save the model
	var changeDetails = new Object();
	this._currentObject.modify(mods);
	//if modification took place - fire an ServerChangeEvent
	changeDetails["obj"] = this._currentObject;
	changeDetails["modFields"] = mods;
	this._fireServerChangeEvent(changeDetails);

	return true;
}

LaServerController.prototype._saveChangesCallback = 
function (obj) {
	if(this._saveChanges(obj)) {
		this._view.setDirty(false);		
		//this._toolBar.getButton(LaOperation.SAVE).setEnabled(false); 
		this._confirmMessageDialog.popdown();
	}
}
/**
* @param params		   - params["params"] - arguments to pass to the method specified in func parameter
* 					     params["obj"] - the controller of the next view
*						 params["func"] - the method to call on the nextViewCtrlr in order to navigate to the next view
* This method saves changes in the current view and calls the method on the controller of the next view
**/
LaServerController.prototype._saveAndGoAway =
function (params) {
	try {
		var tmpObj = this._view.getObject();
		if(this._saveChanges(tmpObj)) {
			this._confirmMessageDialog.popdown();	
			params["func"].call(params["obj"], params["params"]);	
				
		}
	} catch (ex) {
		//if exception thrown - don't go away
		this._handleException(ex, "LaServerController.prototype._saveAndGoAway", null, false);
	}
}

/**
* Leaves current view without saving any changes
**/
LaServerController.prototype._discardAndGoAway = 
function (params) {
	this._confirmMessageDialog.popdown();
	params["func"].call(params["obj"], params["params"]);		

}

/**
* handles "save" button click
* calls modify or create on the current LaDomain
**/
LaServerController.prototype._saveButtonListener =
function(ev) {
	try {
		var tmpObj = this._view.getObject();
		//check if disabling email service
		if((this._currentObject.attrs[LaServer.A_liquidUserServicesEnabled]=="TRUE") && (tmpObj.attrs[LaServer.A_liquidUserServicesEnabled]=="FALSE")) {
			//ask if the user wants to save changes		
			this._confirmMessageDialog = new LaMsgDialog(this._view.shell, null, [DwtDialog.YES_BUTTON, DwtDialog.CANCEL_BUTTON], this._app);								
			this._confirmMessageDialog.setMessage(LaMsg.NAD_Dialog_ShutdownEmailService, null, DwtMessageDialog.WARNING_STYLE);
			this._confirmMessageDialog.registerCallback(DwtDialog.YES_BUTTON, LaServerController.prototype._saveChangesCallback, this, tmpObj);		
			this._confirmMessageDialog.popup();
		
		} else {
			if(this._saveChanges(tmpObj)) {
				this._view.setDirty(false);		
			}
		}
	} catch (ex) {
		//if exception thrown - don' go away
		this._handleException(ex, "LaServerController.prototype._saveButtonListener", null, false);
	}
}

/**
* handles the Close button click. Returns to the list view.
**/ 
LaServerController.prototype._closeButtonListener =
function(ev) {
	//prompt if the user wants to save the changes
	if(this._view.isDirty()) {
		//parameters for the confirmation dialog's callback 
		var args = new Object();		
		args["params"] = null;
		args["obj"] = this._app.getServerListController();
		args["func"] = LaServerListController.prototype.show;
		//ask if the user wants to save changes		
		this._confirmMessageDialog = new LaMsgDialog(this._view.shell, null, [DwtDialog.YES_BUTTON, DwtDialog.NO_BUTTON, DwtDialog.CANCEL_BUTTON], this._app);								
		this._confirmMessageDialog.setMessage(LaMsg.NAD_Dialog_SaveChanges, null, DwtMessageDialog.INFO_STYLE);
		this._confirmMessageDialog.registerCallback(DwtDialog.YES_BUTTON, LaServerController.prototype._saveAndGoAway, this, args);		
		this._confirmMessageDialog.registerCallback(DwtDialog.NO_BUTTON, LaServerController.prototype._discardAndGoAway, this, args);		
		this._confirmMessageDialog.popup();
	} else {
		
		this._app.getServerListController().show();
	}	
}



LaServerController.prototype._closeCnfrmDlg = 
function () {
	this._confirmMessageDialog.popdown();	
}

