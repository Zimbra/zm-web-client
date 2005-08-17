/**
* @class LaCosController controls display of a single COS
* @contructor LaCosController
* @param appCtxt
* @param container
* @param abApp
**/

function LaCosController(appCtxt, container, abApp) {
	LaController.call(this, appCtxt, container, abApp);
	this._evtMgr = new LsEventMgr();
	this._confirmMessageDialog;
	this._UICreated = false;	
}

LaCosController.prototype = new LaController();
LaCosController.prototype.constructor = LaCosController;

LaCosController.VIEW = "LaCosController.VIEW";

/**
*	@method show
*	@param entry - isntance of LaCos class
*/

LaCosController.prototype.show = 
function(entry) {
	this._setView(entry);
	this._app.setCurrentController(this);
}



/**
* Adds listener to modifications in the contained LaCos 
* @param listener
**/
LaCosController.prototype.addCosChangeListener = 
function(listener) {
	this._evtMgr.addListener(LaEvent.E_MODIFY, listener);
}

/**
* Removes listener to modifications in the controlled LaCos 
* @param listener
**/
LaCosController.prototype.removeCosChangeListener = 
function(listener) {
	this._evtMgr.removeListener(LaEvent.E_MODIFY, listener);    	
}

/**
* Adds listener to creation of an LaCos 
* @param listener
**/
LaCosController.prototype.addCosCreationListener = 
function(listener) {
	this._evtMgr.addListener(LaEvent.E_CREATE, listener);
}

/**
* Removes listener to creation of an LaCos 
* @param listener
**/
LaCosController.prototype.removeCosCreationListener = 
function(listener) {
	this._evtMgr.removeListener(LaEvent.E_CREATE, listener);    	
}

/**
* Adds listener to removal of an LaCos 
* @param listener
**/
LaCosController.prototype.addCosRemovalListener = 
function(listener) {
	this._evtMgr.addListener(LaEvent.E_REMOVE, listener);
}

/**
* Removes listener to removal of an LaCos 
* @param listener
**/
LaCosController.prototype.removeCosRemovalListener = 
function(listener) {
	this._evtMgr.removeListener(LaEvent.E_REMOVE, listener);    	
}

/**
* @param nextViewCtrlr - the controller of the next view
* @param func		   - the method to call on the nextViewCtrlr in order to navigate to the next view
* @param params		   - arguments to pass to the method specified in func parameter
* Checks if it is safe to leave this view. Displays warning and Information messages if neccesary.
**/
LaCosController.prototype.switchToNextView = 
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
		this._confirmMessageDialog.registerCallback(DwtDialog.YES_BUTTON, LaCosController.prototype._saveAndGoAway, this, args);		
		this._confirmMessageDialog.registerCallback(DwtDialog.NO_BUTTON, LaCosController.prototype._discardAndGoAway, this, args);		
		this._confirmMessageDialog.popup();
	} else {

		func.call(nextViewCtrlr, params);
	}
}

/**
* public getToolBar
* @return reference to the toolbar
**/
LaCosController.prototype.getToolBar = 
function () {
	return this._toolBar;	
}

LaCosController.prototype.setDirty = 
function (isD) {
	if(isD)
		this._toolBar.getButton(LaOperation.SAVE).setEnabled(true);
	else
		this._toolBar.getButton(LaOperation.SAVE).setEnabled(false);
}
/**
*	Private method that notifies listeners to that the controlled LaCos is changed
* 	@param details
*/
LaCosController.prototype._fireCosChangeEvent =
function(details) {
	try {
		if (this._evtMgr.isListenerRegistered(LaEvent.E_MODIFY)) {
			var evt = new LaEvent(LaEvent.S_COS);
			evt.set(LaEvent.E_MODIFY, this);
			evt.setDetails(details);
			this._evtMgr.notifyListeners(LaEvent.E_MODIFY, evt);
		}
	} catch (ex) {
		this._handleException(ex, LaCosController.prototype._fireCosChangeEvent, details, false);
	}
}

/**
*	Private method that notifies listeners that a new LaCos is created
* 	@param details
*/
LaCosController.prototype._fireCosCreationEvent =
function(details) {
	try {
		if (this._evtMgr.isListenerRegistered(LaEvent.E_CREATE)) {
			var evt = new LaEvent(LaEvent.S_COS);
			evt.set(LaEvent.E_CREATE, this);
			evt.setDetails(details);
			this._evtMgr.notifyListeners(LaEvent.E_CREATE, evt);
		}
	} catch (ex) {
		this._handleException(ex, LaCosController.prototype._fireCosCreationEvent, details, false);	
	}
}

/**
*	Private method that notifies listeners to that the controlled LaCos is removed
* 	@param details
*/
LaCosController.prototype._fireCosRemovalEvent =
function(details) {
	try {
		if (this._evtMgr.isListenerRegistered(LaEvent.E_REMOVE)) {
			var evt = new LaEvent(LaEvent.S_COS);
			evt.set(LaEvent.E_REMOVE, this);
			evt.setDetails(details);
			this._evtMgr.notifyListeners(LaEvent.E_REMOVE, evt);
		}
	} catch (ex) {
		this._handleException(ex, LaCosController.prototype._fireCosRemovalEvent, details, false);	
	}
}

/**
*	@method _setView 
*	@param entry - isntance of LaCos class
*/
LaCosController.prototype._setView =
function(entry) {
	try {
	   	//create toolbar
		if(!this._UICreated) {
		   	this._ops = new Array();
	   		this._ops.push(new LaOperation(LaOperation.NEW, LaMsg.TBB_New, LaMsg.COSTBB_New_tt, LaImg.I_NEWCOS, LaImg.I_NEWCOS, new LsListener(this, LaCosController.prototype._newButtonListener)));
	   		this._ops.push(new LaOperation(LaOperation.SAVE, LaMsg.TBB_Save, LaMsg.COSTBB_Save_tt, LaImg.I_SAVE, LaImg.ID_SAVE, new LsListener(this, LaCosController.prototype._saveButtonListener)));
	   		this._ops.push(new LaOperation(LaOperation.CLOSE, LaMsg.TBB_Close, LaMsg.COSTBB_Close_tt, LaImg.I_UNDO, LaImg.I_UNDO, new LsListener(this, LaCosController.prototype._closeButtonListener)));    	
	   		this._ops.push(new LaOperation(LaOperation.DELETE, LaMsg.TBB_Delete, LaMsg.COSTBB_Delete_tt, LaImg.I_DELETE, LaImg.I_DELETE, new LsListener(this, LaCosController.prototype._deleteButtonListener)));    	    	
			this._toolBar = new LaToolBar(this._container, this._ops);
	
		  	//this._view = new LaCosView(this._container, this._app, entry.id);
		  	this._view = new LaCosXFormView(this._container, this._app, entry.id);
		    this._app.createView(LaCosController.VIEW, [this._toolBar, this._view]);  	
		    this._UICreated = true;
	  	}
	
		this._app.pushView(LaCosController.VIEW);
		this._toolBar.getButton(LaOperation.SAVE).setEnabled(false);
		if(!entry.id) {
			this._toolBar.getButton(LaOperation.DELETE).setEnabled(false);  			
		} else {
			this._toolBar.getButton(LaOperation.DELETE).setEnabled(true);  				
		}	
		this._view.setDirty(false);
		entry[LaModel.currentTab] = "1"
	  	this._view.setObject(entry);

	} catch (ex) {
		this._handleException(ex, LaCosController.prototype._setView, null, false);	
	}
	this._currentObject = entry;
}

/**
* saves the changes in the fields, calls modify or create on the current LaCos
* @return Boolean - indicates if the changes were succesfully saved
**/
LaCosController.prototype._saveChanges =
function () {

	//check if the XForm has any errors
	if(this._view.getMyForm().hasErrors()) {
		var errItems = this._view.getMyForm().getItemsInErrorState();
		var dlgMsg = LaMsg.CORRECT_ERRORS;
		dlgMsg +=  "<br><ul>";
		var i = 0;
		for(var key in errItems) {
			if(i > 19) {
				dlgMsg += "<li>...</li>";
				break;
			}
			if(key == "size") continue;
			var label = errItems[key].getInheritedProperty("msgName");
			if(!label && errItems[key].getParentItem()) { //this might be a part of a composite
				label = errItems[key].getParentItem().getInheritedProperty("msgName");
			}
			if(label) {
				dlgMsg += "<li>";
				dlgMsg +=label;			
				dlgMsg += "</li>";
			}
			i++;
		}
		dlgMsg += "</ul>";
		this.popupMsgDialog(dlgMsg, null, true);
		return false;
	}
	
	//check if the data is copmlete 
	var tmpObj = this._view.getObject();
	var isNew = false;
	//Check the data
	if(tmpObj.attrs == null) {
		//show error msg
		this._msgDialog.setMessage(LaMsg.ERROR_UNKNOWN, null, DwtMessageDialog.CRITICAL_STYLE, null);
		this._msgDialog.popup();		
		return false;	
	}

	//name
	if(tmpObj.attrs[LaCos.A_name] == null || tmpObj.attrs[LaCos.A_name].length < 1 ) {
		//show error msg
		this._msgDialog.setMessage(LaMsg.ERROR_NAME_REQUIRED, null, DwtMessageDialog.CRITICAL_STYLE, null);
		this._msgDialog.popup();		
		return false;
	} else {
		tmpObj.name = tmpObj.attrs[LaCos.A_name];
	}

	if(tmpObj.name.length > 256 || tmpObj.attrs[LaCos.A_name].length > 256) {
		//show error msg
		this._msgDialog.setMessage(LaMsg.ERROR_COS_NAME_TOOLONG, null, DwtMessageDialog.CRITICAL_STYLE, null);
		this._msgDialog.popup();		
		return false;
	}
	
	/**
	* check values
	**/
	
	if(!LsUtil.isNonNegativeInteger(tmpObj.attrs[LaCos.A_liquidMailQuota])) {
		//show error msg
		this._msgDialog.setMessage(LaMsg.ERROR_INVALID_VALUE + ": " + LaMsg.NAD_MailQuota + " ! ", null, DwtMessageDialog.CRITICAL_STYLE, null);
		this._msgDialog.popup();		
		return false;
	}

	if(!LsUtil.isNonNegativeInteger(tmpObj.attrs[LaCos.A_liquidContactMaxNumEntries])) {
		//show error msg
		this._msgDialog.setMessage(LaMsg.ERROR_INVALID_VALUE + ": " + LaMsg.NAD_ContactMaxNumEntries + " ! ", null, DwtMessageDialog.CRITICAL_STYLE, null);
		this._msgDialog.popup();		
		return false;
	}
	
	if(!LsUtil.isNonNegativeInteger(tmpObj.attrs[LaCos.A_liquidMinPwdLength])) {
		//show error msg
		this._msgDialog.setMessage(LaMsg.ERROR_INVALID_VALUE + ": " + LaMsg.NAD_passMinLength + " ! ", null, DwtMessageDialog.CRITICAL_STYLE, null);
		this._msgDialog.popup();		
		return false;
	}
	
	if(!LsUtil.isNonNegativeInteger(tmpObj.attrs[LaCos.A_liquidMaxPwdLength])) {
		//show error msg
		this._msgDialog.setMessage(LaMsg.ERROR_INVALID_VALUE + ": " + LaMsg.NAD_passMaxLength + " ! ", null, DwtMessageDialog.CRITICAL_STYLE, null);
		this._msgDialog.popup();		
		return false;
	}	
	
	if(parseInt(tmpObj.attrs[LaCos.A_liquidMaxPwdLength]) < parseInt(tmpObj.attrs[LaCos.A_liquidMinPwdLength]) && parseInt(tmpObj.attrs[LaCos.A_liquidMaxPwdLength]) > 0) {
		//show error msg
		this._msgDialog.setMessage(LaMsg.ERROR_MAX_MIN_PWDLENGTH, null, DwtMessageDialog.CRITICAL_STYLE, null);
		this._msgDialog.popup();		
		return false;
	}	

	if(!LsUtil.isNonNegativeInteger(tmpObj.attrs[LaCos.A_liquidMinPwdAge])) {
		//show error msg
		this._msgDialog.setMessage(LaMsg.ERROR_INVALID_VALUE + ": " + LaMsg.NAD_passMinAge + " ! ", null, DwtMessageDialog.CRITICAL_STYLE, null);
		this._msgDialog.popup();		
		return false;
	}		
	
	if(!LsUtil.isNonNegativeInteger(tmpObj.attrs[LaCos.A_liquidMaxPwdAge])) {
		//show error msg
		this._msgDialog.setMessage(LaMsg.ERROR_INVALID_VALUE + ": " + LaMsg.NAD_passMaxAge + " ! ", null, DwtMessageDialog.CRITICAL_STYLE, null);
		this._msgDialog.popup();		
		return false;
	}		
	
	if(parseInt(tmpObj.attrs[LaCos.A_liquidMaxPwdAge]) < parseInt(tmpObj.attrs[LaCos.A_liquidMinPwdAge]) && parseInt(tmpObj.attrs[LaCos.A_liquidMaxPwdAge]) > 0) {
		//show error msg
		this._msgDialog.setMessage(LaMsg.ERROR_MAX_MIN_PWDAGE, null, DwtMessageDialog.CRITICAL_STYLE, null);
		this._msgDialog.popup();		
		return false;
	}
		
	if(!LsUtil.isLifeTime(tmpObj.attrs[LaCos.A_liquidAuthTokenLifetime])) {
		//show error msg
		this._msgDialog.setMessage(LaMsg.ERROR_INVALID_VALUE + ": " + LaMsg.NAD_AuthTokenLifetime + " ! ", null, DwtMessageDialog.CRITICAL_STYLE, null);
		this._msgDialog.popup();		
		return false;
	}

	if(!LsUtil.isLifeTime(tmpObj.attrs[LaCos.A_liquidAdminAuthTokenLifetime])) {
		//show error msg
		this._msgDialog.setMessage(LaMsg.ERROR_INVALID_VALUE + ": " + LaMsg.NAD_AdminAuthTokenLifetime + " ! ", null, DwtMessageDialog.CRITICAL_STYLE, null);
		this._msgDialog.popup();		
		return false;
	}		
	
	if(!LsUtil.isLifeTime(tmpObj.attrs[LaCos.A_liquidMailMessageLifetime])) {
		//show error msg
		this._msgDialog.setMessage(LaMsg.ERROR_INVALID_VALUE + ": " + LaMsg.NAD_MailMessageLifetime + " ! ", null, DwtMessageDialog.CRITICAL_STYLE, null);
		this._msgDialog.popup();		
		return false;
	}			

	if(!LsUtil.isLifeTime(tmpObj.attrs[LaCos.A_liquidMailTrashLifetime])) {
		//show error msg
		this._msgDialog.setMessage(LaMsg.ERROR_INVALID_VALUE + ": " + LaMsg.NAD_MailTrashLifetime + " ! ", null, DwtMessageDialog.CRITICAL_STYLE, null);
		this._msgDialog.popup();		
		return false;
	}	
	
	if(!LsUtil.isLifeTime(tmpObj.attrs[LaCos.A_liquidMailSpamLifetime])) {
		//show error msg
		this._msgDialog.setMessage(LaMsg.ERROR_INVALID_VALUE + ": " + LaMsg.NAD_MailSpamLifetime + " ! ", null, DwtMessageDialog.CRITICAL_STYLE, null);
		this._msgDialog.popup();		
		return false;
	}		
	
	if(!LsUtil.isNonNegativeInteger(tmpObj.attrs[LaCos.A_liquidPrefContactsPerPage])) {
		//show error msg
		this._msgDialog.setMessage(LaMsg.ERROR_INVALID_VALUE + ": " + LaMsg.NAD_PrefContactsPerPage + " ! ", null, DwtMessageDialog.CRITICAL_STYLE, null);
		this._msgDialog.popup();		
		return false;
	}	
	if(!LsUtil.isNonNegativeInteger(tmpObj.attrs[LaCos.A_liquidEnforcePwdHistory])) {
		//show error msg
		this._msgDialog.setMessage(LaMsg.ERROR_INVALID_VALUE + ": " + LaMsg.NAD_passEnforceHistory + " ! ", null, DwtMessageDialog.CRITICAL_STYLE, null);
		this._msgDialog.popup();		
		return false;
	}	
		
	var mods = new Object();
	var changeDetails = new Object();
	if(!tmpObj.id)
		isNew = true;
		
	//transfer the fields from the tmpObj to the _currentObject
	for (var a in tmpObj.attrs) {
		if( (a == LaItem.A_objectClass) || (a == LaItem.A_liquidId) || (a == LaCos.A_liquidMailHostPool))
			continue;
		//check if the value has been modified or the object is new
		if (isNew || (this._currentObject.attrs[a] != tmpObj.attrs[a]) ) {
			mods[a] = tmpObj.attrs[a];
		}
	}
	//check if host pool has been changed
	var poolServerIds = new Array();
	if(tmpObj[LaCos.A_liquidMailHostPoolInternal]) {
		var cnt = tmpObj[LaCos.A_liquidMailHostPoolInternal].length;
		for(var i = 0; i < cnt; i ++) {
			poolServerIds.push(tmpObj[LaCos.A_liquidMailHostPoolInternal][i].id);
		}
		if(poolServerIds.toString() != this._currentObject[LaCos.A_liquidMailHostPoolInternal].toString()) {
			mods[LaCos.A_liquidMailHostPool] = poolServerIds;
		}
	}
	
	//check if need to rename
	if(!isNew) {
		if(tmpObj.name != this._currentObject.name) {
			newName=tmpObj.name;
			changeDetails["newName"] = newName;
			try {
				this._currentObject.rename(newName);
			} catch (ex) {
				if (ex.code == LsCsfeException.SVC_AUTH_EXPIRED || ex.code == LsCsfeException.SVC_AUTH_REQUIRED || ex.code == LsCsfeException.NO_AUTH_TOKEN) {
						this._showLoginDialog();
				} else {
					var detailStr = "";
					for (var prop in ex) {
						detailStr = detailStr + prop + " - " + ex[prop] + "\n";				
					}
					if(ex.code == LsCsfeException.COS_EXISTS) {
						this._msgDialog.setMessage(LaMsg.FAILED_RENAME_COS_1, detailStr, DwtMessageDialog.CRITICAL_STYLE, LaMsg.liquidAdminTitle);
						this._msgDialog.popup();
					} else {
						this._msgDialog.setMessage(LaMsg.FAILED_RENAME_COS, detailStr, DwtMessageDialog.CRITICAL_STYLE, LaMsg.liquidAdminTitle);
						this._msgDialog.popup();
					}
				}
				return false;
			}
		}
	}
	//save changed fields
	try {	
		if(isNew) {
			this._currentObject.create(tmpObj.name, mods);
			//if creation took place - fire an CosChangeEvent
			this._fireCosCreationEvent(this._currentObject);
			this._toolBar.getButton(LaOperation.DELETE).setEnabled(true);	
		} else {
			this._currentObject.modify(mods);
			//if modification took place - fire an CosChangeEvent
			changeDetails["obj"] = this._currentObject;
			changeDetails["mods"] = mods;
			this._fireCosChangeEvent(changeDetails);
		}
	} catch (ex) {
		if (ex.code == LsCsfeException.SVC_AUTH_EXPIRED || ex.code == LsCsfeException.SVC_AUTH_REQUIRED || ex.code == LsCsfeException.NO_AUTH_TOKEN) {
				this._showLoginDialog();
		} else {
			var detailStr = "";
			for (var prop in ex) {
				detailStr = detailStr + prop + " - " + ex[prop] + "\n";				
			}
			if(ex.code == LsCsfeException.COS_EXISTS) {
				this._msgDialog.setMessage(LaMsg.FAILED_CREATE_COS_1, detailStr, DwtMessageDialog.CRITICAL_STYLE, LaMsg.liquidAdminTitle);				
				this._msgDialog.popup();
			} else {
				if(isNew) {
					this._msgDialog.setMessage(LaMsg.FAILED_CREATE_COS, detailStr, DwtMessageDialog.CRITICAL_STYLE, LaMsg.liquidAdminTitle);
				} else {
					this._msgDialog.setMessage(LaMsg.FAILED_SAVE_COS, detailStr, DwtMessageDialog.CRITICAL_STYLE, LaMsg.liquidAdminTitle);
				}
				this._msgDialog.popup();
			}
		}
		return false;
	}
	return true;
	
}
/**
* @param params		   - params["params"] - arguments to pass to the method specified in func parameter
* 					     params["obj"] - the controller of the next view
*						 params["func"] - the method to call on the nextViewCtrlr in order to navigate to the next view
* This method saves changes in the current view and calls the method on the controller of the next view
**/
LaCosController.prototype._saveAndGoAway =
function (params) {
	this._confirmMessageDialog.popdown();			
	try {
		if(this._saveChanges()) {
			params["func"].call(params["obj"], params["params"]);	

		}
	} catch (ex) {
		this._handleException(ex, LaCosController.prototype._saveAndGoAway, null, false);
	}
}

/**
* Leaves current view without saving any changes
**/
LaCosController.prototype._discardAndGoAway = 
function (params) {
	this._confirmMessageDialog.popdown();
	try {
		params["func"].call(params["obj"], params["params"]);		

	} catch (ex) {
		this._handleException(ex, LaCosController.prototype._discardAndGoAway, null, false);
	}
}
/**
* @param 	ev event object
* This method handles "save" button click
**/
LaCosController.prototype._saveButtonListener =
function(ev) {
	try {
		if(this._saveChanges()) {
			this._view.setDirty(false);	
			this._toolBar.getButton(LaOperation.SAVE).setEnabled(false);					
			this._view.setObject(this._currentObject, true);				
		}
	} catch (ex) {
		this._handleException(ex, LaCosController.prototype._saveButtonListener, null, false);
	}
}

/**
* handles the Close button click. Returns to the list view.
**/ 
LaCosController.prototype._closeButtonListener =
function(ev) {
	//prompt if the user wants to save the changes
	if(this._view.isDirty()) {
		//parameters for the confirmation dialog's callback 
		var args = new Object();		
		args["params"] = null;
		args["obj"] = this._app.getCosListController();
		args["func"] = LaCosListController.prototype.show;
		//ask if the user wants to save changes		
		this._confirmMessageDialog = new LaMsgDialog(this._view.shell, null, [DwtDialog.YES_BUTTON, DwtDialog.NO_BUTTON, DwtDialog.CANCEL_BUTTON], this._app);								
		this._confirmMessageDialog.setMessage("Do you want so save current changes?", null, DwtMessageDialog.INFO_STYLE);
		this._confirmMessageDialog.registerCallback(DwtDialog.YES_BUTTON, LaCosController.prototype._saveAndGoAway, this, args);		
		this._confirmMessageDialog.registerCallback(DwtDialog.NO_BUTTON, LaCosController.prototype._discardAndGoAway, this, args);		
		this._confirmMessageDialog.popup();
	} else {

		this._app.getCosListController().show();
	}	
}

/**
* This listener is called when the Delete button is clicked. 
**/
LaCosController.prototype._deleteButtonListener =
function(ev) {
	if(this._currentObject.id) {
		this._confirmMessageDialog = new LaMsgDialog(this._view.shell, null, [DwtDialog.YES_BUTTON, DwtDialog.NO_BUTTON], this._app);						
		this._confirmMessageDialog.setMessage("Are you sure you want to delete this COS?", null, DwtMessageDialog.INFO_STYLE);
		this._confirmMessageDialog.registerCallback(DwtDialog.YES_BUTTON, LaCosController.prototype._deleteAndGoAway, this, null);		
		this._confirmMessageDialog.registerCallback(DwtDialog.NO_BUTTON, LaCosController.prototype._closeCnfrmDlg, this, null);				
		this._confirmMessageDialog.popup();
	} else {
		this._app.getCosListController().show();
	}
}

LaCosController.prototype._deleteAndGoAway = 
function () {
	try {
		if(this._currentObject.id) {
			this._currentObject.remove();
			this._fireCosRemovalEvent(this._currentObject);
		}
		this._app.getCosListController().show();
		this._confirmMessageDialog.popdown();	

	} catch (ex) {
		this._confirmMessageDialog.popdown();	
		this._handleException(ex, LaCosController.prototype._deleteAndGoAway, null, false);				
	}
}

LaCosController.prototype._closeCnfrmDlg = 
function () {
	this._confirmMessageDialog.popdown();	
}

LaCosController.prototype.newCos = 
function () {
	var newCos = new LaCos(this._app);
	this._setView(newCos);
}

// new button was pressed
LaCosController.prototype._newButtonListener =
function(ev) {
	if(this._view.isDirty()) {
		//parameters for the confirmation dialog's callback 
		var args = new Object();		
		args["params"] = null;
		args["obj"] = this._app.getCosController();
		args["func"] = LaCosController.prototype.newCos;
		//ask if the user wants to save changes		
		this._confirmMessageDialog = new LaMsgDialog(this._view.shell, null, [DwtDialog.YES_BUTTON, DwtDialog.NO_BUTTON, DwtDialog.CANCEL_BUTTON], this._app);								
		this._confirmMessageDialog.setMessage("Do you want so save current changes?", null, DwtMessageDialog.INFO_STYLE);
		this._confirmMessageDialog.registerCallback(DwtDialog.YES_BUTTON, LaCosController.prototype._saveAndGoAway, this, args);		
		this._confirmMessageDialog.registerCallback(DwtDialog.NO_BUTTON, LaCosController.prototype._discardAndGoAway, this, args);		
		this._confirmMessageDialog.popup();
	} else {
		this.newCos();
	}	
}
