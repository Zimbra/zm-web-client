/**
* @class LaAccountViewController controls display of a single Account
* @contructor LaAccountViewController
* @param appCtxt
* @param container
* @param abApp
* @author Roland Schemers
* @author Greg Solovyev
**/

function LaAccountViewController(appCtxt, container, abApp) {
	LaController.call(this, appCtxt, container, abApp);
	this._evtMgr = new LsEventMgr();
	this._confirmMessageDialog;
	this._UICreated = false;
}

LaAccountViewController.prototype = new LaController();
LaAccountViewController.prototype.constructor = LaAccountViewController;

LaAccountViewController.VIEW = "LaAccountViewController.VIEW";

//public methods

/**
*	@method show
*	@param entry - isntance of LaAccount class
*/

LaAccountViewController.prototype.show = 
function(entry) {
	this._setView(entry);
	this._app.setCurrentController(this);
}

/**
* @param nextViewCtrlr - the controller of the next view
* @param func		   - the method to call on the nextViewCtrlr in order to navigate to the next view
* @param params		   - arguments to pass to the method specified in func parameter
* Checks if it is safe to leave this view. Displays warning and Information messages if neccesary.
**/
LaAccountViewController.prototype.switchToNextView = 
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
		this._confirmMessageDialog.registerCallback(DwtDialog.YES_BUTTON, LaAccountViewController.prototype._saveAndGoAway, this, args);		
		this._confirmMessageDialog.registerCallback(DwtDialog.NO_BUTTON, LaAccountViewController.prototype._discardAndGoAway, this, args);		
		this._confirmMessageDialog.popup();
	} else {
		func.call(nextViewCtrlr, params);
	}
}

/**
* public getToolBar
* @return reference to the toolbar
**/
LaAccountViewController.prototype.getToolBar = 
function () {
	return this._toolBar;	
}

LaAccountViewController.prototype.setDirty = 
function (isD) {
	if(isD)
		this._toolBar.getButton(LaOperation.SAVE).setEnabled(true);
	else
		this._toolBar.getButton(LaOperation.SAVE).setEnabled(false);
}

/**
* Adds listener to modifications in the contained LaAccount 
* @param listener
**/
LaAccountViewController.prototype.addAccountChangeListener = 
function(listener) {
	this._evtMgr.addListener(LaEvent.E_MODIFY, listener);
}

/**
* Removes listener to modifications in the controlled LaAccount 
* @param listener
**/
LaAccountViewController.prototype.removeAccountChangeListener = 
function(listener) {
	this._evtMgr.removeListener(LaEvent.E_MODIFY, listener);    	
}

/**
* Adds listener to creation of an LaAccount 
* @param listener
**/
LaAccountViewController.prototype.addAccountCreationListener = 
function(listener) {
	this._evtMgr.addListener(LaEvent.E_CREATE, listener);
}

/**
* Removes listener to creation of an LaAccount 
* @param listener
**/
LaAccountViewController.prototype.removeAccountCreationListener = 
function(listener) {
	this._evtMgr.removeListener(LaEvent.E_CREATE, listener);    	
}

/**
* Adds listener to removal of an LaAccount 
* @param listener
**/
LaAccountViewController.prototype.addAccountRemovalListener = 
function(listener) {
	this._evtMgr.addListener(LaEvent.E_REMOVE, listener);
}

/**
* Removes listener to removal of an LaAccount 
* @param listener
**/
LaAccountViewController.prototype.removeAccountRemovalListener = 
function(listener) {
	this._evtMgr.removeListener(LaEvent.E_REMOVE, listener);    	
}

//Private/protected methods

/**
* saves the changes in the fields, calls modify or create on the current LaAccount
* @return Boolean - indicates if the changes were succesfully saved
**/
LaAccountViewController.prototype._saveChanges =
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
	var newName=null;
	
	//Check the data
	if(tmpObj.attrs == null ) {
		//show error msg
		this._msgDialog.setMessage(LaMsg.ERROR_UNKNOWN, null, DwtMessageDialog.CRITICAL_STYLE, null);
		this._msgDialog.popup();		
		return false;	
	}
	
	//check if need to rename
	if(this._currentObject && tmpObj.name != this._currentObject.name) {
		var emailRegEx = /^([a-zA-Z0-9_\-])+((\.)?([a-zA-Z0-9_\-])+)*@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
		if(!emailRegEx.test(tmpObj.name) ) {
			//show error msg
			this._msgDialog.setMessage(LaMsg.ERROR_ACCOUNT_NAME_INVALID, null, DwtMessageDialog.CRITICAL_STYLE, null);
			this._msgDialog.popup();		
			return false;
		}
		newName = tmpObj.name;
	}
	
	var myCos = null;
	var maxPwdLen = Number.POSITIVE_INFINITY;
	var minPwdLen = 1;	
	
	if(tmpObj.attrs[LaAccount.A_COSId]) {
		myCos = new LaCos(this._app);
		myCos.load("id", tmpObj.attrs[LaAccount.A_COSId]);
		if(myCos.attrs[LaCos.A_liquidMinPwdLength] > 0) {
			minPwdLen = myCos.attrs[LaCos.A_liquidMinPwdLength];
		}
		if(myCos.attrs[LaCos.A_liquidMaxPwdLength] > 0) {
			maxPwdLen = myCos.attrs[LaCos.A_liquidMaxPwdLength];
		}		
	}
	

	var mods = new Object();
	var changeDetails = new Object();
	

	//check if need to rename
	if(newName) {
		changeDetails["newName"] = newName;
		try {
			this._currentObject.rename(newName);
		} catch (ex) {
			if (ex.code == LsCsfeException.SVC_AUTH_EXPIRED || ex.code == LsCsfeException.SVC_AUTH_REQUIRED || ex.code == LsCsfeException.NO_AUTH_TOKEN) {
					this._showLoginDialog();
			} else {
				/*var detailStr = "";
				for (var prop in ex) {
					detailStr = detailStr + prop + " - " + ex[prop] + "\n";				
				}*/
				if(ex.code == LsCsfeException.ACCT_EXISTS) {
					this.popupMsgDialog(LaMsg.FAILED_RENAME_ACCOUNT_1, ex, true);
					/*this._msgDialog.setMessage(LaMsg.FAILED_RENAME_ACCOUNT_1, detailStr, DwtMessageDialog.CRITICAL_STYLE, LaMsg.liquidAdminTitle);
					this._msgDialog.popup();*/
				} else {
					this.popupMsgDialog(LaMsg.FAILED_RENAME_ACCOUNT, ex, true);
				/*
					this._msgDialog.setMessage(LaMsg.FAILED_RENAME_ACCOUNT, detailStr, DwtMessageDialog.CRITICAL_STYLE, LaMsg.liquidAdminTitle);
					this._msgDialog.popup();*/
				}
			}
			return false;
		}
	}

	if(!LaAccount.checkValues(tmpObj, this._app))
		return false;
	
	//change password if new password is provided
	if(tmpObj.attrs[LaAccount.A_password]!=null && tmpObj[LaAccount.A2_confirmPassword]!=null && tmpObj.attrs[LaAccount.A_password].length > 0) {
		try {
			this._currentObject.changePassword(tmpObj.attrs[LaAccount.A_password]);
		} catch (ex) {
			/*var detailStr = "";
			for (var prop in ex) {
				detailStr = detailStr + prop + " - " + ex[prop] + "\n";				
			}
			this._msgDialog.setMessage(LaMsg.FAILED_SAVE_ACCOUNT, detailStr, DwtMessageDialog.CRITICAL_STYLE, LaMsg.liquidAdminTitle);
			this._msgDialog.popup();
			*/
			this.popupMsgDialog(LaMsg.FAILED_SAVE_ACCOUNT, ex, true);
			return false;				
			
		}
	}
	//transfer the fields from the tmpObj to the _currentObject
	for (var a in tmpObj.attrs) {
		if(a == LaAccount.A_password || a==LaAccount.A_liquidMailAlias || a == LaItem.A_objectClass || a==LaAccount.A2_mbxsize || a==LaAccount.A_mail || a == LaItem.A_liquidId) {
			continue;
		}	
		//check if the value has been modified
		if ((this._currentObject.attrs[a] != tmpObj.attrs[a]) && !(this._currentObject.attrs[a] == undefined && tmpObj.attrs[a] == "")) {
			if(a==LaAccount.A_uid) {
				continue; //skip uid, it is changed throw a separate request
			}
			if(tmpObj.attrs[a] instanceof Array) {
				if(tmpObj.attrs[a].join(",").valueOf() !=  this._currentObject.attrs[a].join(",").valueOf()) {
					mods[a] = tmpObj.attrs[a];
				}
			} else {
				mods[a] = tmpObj.attrs[a];
			}				
		}
	}

	//save changed fields
	try {	
		this._currentObject.modify(mods);
	} catch (ex) {
		if (ex.code == LsCsfeException.SVC_AUTH_EXPIRED || ex.code == LsCsfeException.SVC_AUTH_REQUIRED || ex.code == LsCsfeException.NO_AUTH_TOKEN) {
				this._showLoginDialog();
		} else {
/*			var detailStr = "";
			for (var prop in ex) {
				detailStr = detailStr + prop + " - " + ex[prop] + "\n";				
			}
*/			
			if(ex.code == LsCsfeException.ACCT_EXISTS) {
				this.popupMsgDialog(LaMsg.FAILED_CREATE_ACCOUNT_1, ex, true);
	/*			this._msgDialog.setMessage(LaMsg.FAILED_CREATE_ACCOUNT_1, detailStr, DwtMessageDialog.CRITICAL_STYLE, LaMsg.liquidAdminTitle);				
				this._msgDialog.popup();*/
			} else {
				this.popupMsgDialog(LaMsg.FAILED_SAVE_ACCOUNT, ex, true);			
/*				this._msgDialog.setMessage(LaMsg.FAILED_SAVE_ACCOUNT, detailStr, DwtMessageDialog.CRITICAL_STYLE, LaMsg.liquidAdminTitle);
				this._msgDialog.popup();*/
			}
		}
		return false;
	}
	//add-remove aliases
	var tmpObjCnt = -1;
	var currentObjCnt = -1;
	if(tmpObj.attrs[LaAccount.A_liquidMailAlias]) {
		if(typeof tmpObj.attrs[LaAccount.A_liquidMailAlias] == "string") {
			var tmpStr = tmpObj.attrs[LaAccount.A_liquidMailAlias];
			tmpObj.attrs[LaAccount.A_liquidMailAlias] = new Array();
			tmpObj.attrs[LaAccount.A_liquidMailAlias].push(tmpStr);
		}
		tmpObjCnt = tmpObj.attrs[LaAccount.A_liquidMailAlias].length - 1;
	}
	
	if(this._currentObject.attrs[LaAccount.A_liquidMailAlias]) {
		if(typeof this._currentObject.attrs[LaAccount.A_liquidMailAlias] == "string") {
			var tmpStr = this._currentObject.attrs[LaAccount.A_liquidMailAlias];
			this._currentObject.attrs[LaAccount.A_liquidMailAlias] = new Array();
			this._currentObject.attrs[LaAccount.A_liquidMailAlias].push(tmpStr);
		}
		currentObjCnt = this._currentObject.attrs[LaAccount.A_liquidMailAlias].length - 1;
	}

	//diff two arrays
	for(var tmpIx=tmpObjCnt; tmpIx >= 0; tmpIx--) {
		for(var currIx=currentObjCnt; currIx >=0; currIx--) {
			if(tmpObj.attrs[LaAccount.A_liquidMailAlias][tmpIx] == this._currentObject.attrs[LaAccount.A_liquidMailAlias][currIx]) {
				//this alias already exists
				tmpObj.attrs[LaAccount.A_liquidMailAlias].splice(tmpIx,1);
				this._currentObject.attrs[LaAccount.A_liquidMailAlias].splice(currIx,1);
				break;
			}
		}
	}
	//remove the aliases 
	if(currentObjCnt != -1) {
		currentObjCnt = this._currentObject.attrs[LaAccount.A_liquidMailAlias].length;
	} 
	try {
		for(var ix=0; ix < currentObjCnt; ix++) {
			this._currentObject.removeAlias(this._currentObject.attrs[LaAccount.A_liquidMailAlias][ix]);
		}
	} catch (ex) {
		this._handleException(ex, "LaAccountViewController.prototype._saveChanges", null, false);
		return false;
	}
	if(tmpObjCnt != -1) {
		tmpObjCnt = tmpObj.attrs[LaAccount.A_liquidMailAlias].length;
	}
	var failedAliases = "";
	var failedAliasesCnt = 0;
	try {
		for(var ix=0; ix < tmpObjCnt; ix++) {
			try {
				if(tmpObj.attrs[LaAccount.A_liquidMailAlias][ix])
					this._currentObject.addAlias(tmpObj.attrs[LaAccount.A_liquidMailAlias][ix]);
			} catch (ex) {
				if(ex.code == LsCsfeException.ACCT_EXISTS) {
					//if failed because account exists just show a warning
					failedAliases += ("<br>" + tmpObj.attrs[LaAccount.A_liquidMailAlias][ix]);
					failedAliasesCnt++;
				} else {
					//if failed for another reason - jump out
					throw (ex);
				}
			}
		}
		if(failedAliasesCnt == 1) {
			this._msgDialog.setMessage(LaMsg.WARNING_ALIAS_EXISTS + failedAliases, "", DwtMessageDialog.WARNING_STYLE, LaMsg.liquidAdminTitle);
			this._msgDialog.popup();			
		} else if(failedAliasesCnt > 1) {
			this._msgDialog.setMessage(LaMsg.WARNING_ALIASES_EXIST + failedAliases, "", DwtMessageDialog.WARNING_STYLE, LaMsg.liquidAdminTitle);
			this._msgDialog.popup();			
		}
	} catch (ex) {
		/*for (var prop in ex) {
			detailStr = detailStr + prop + " - " + ex[prop] + "\n";				
		}*/
			
		/*this._msgDialog.setMessage(LaMsg.FAILED_ADD_ALIASES, detailStr, DwtMessageDialog.CRITICAL_STYLE, LaMsg.liquidAdminTitle);
		this._msgDialog.popup();
		*/
		this.popupMsgDialog(LaMsg.FAILED_ADD_ALIASES, ex, true);	
		return false;
	}
	return true;
}
/**
*	@method _setView 
*	@param entry - isntance of LaAccount class
*/
LaAccountViewController.prototype._setView =
function(entry) {
	try {

		if(!this._UICreated) {
	   		this._ops = new Array();
	 		this._ops.push(new LaOperation(LaOperation.NEW_WIZARD, LaMsg.TBB_New, LaMsg.ALTBB_New_tt, LaImg.I_ACCOUNT, LaImg.I_ACCOUNT, new LsListener(this, LaAccountViewController.prototype._newButtonListener)));   			    	
   			this._ops.push(new LaOperation(LaOperation.SAVE, LaMsg.TBB_Save, LaMsg.ALTBB_Save_tt, LaImg.I_SAVE, LaImg.ID_SAVE, new LsListener(this, LaAccountViewController.prototype._saveButtonListener)));
   			this._ops.push(new LaOperation(LaOperation.CLOSE, LaMsg.TBB_Close, LaMsg.ALTBB_Close_tt, LaImg.I_UNDO, LaImg.I_UNDO, new LsListener(this, LaAccountViewController.prototype._closeButtonListener)));    	
   			this._ops.push(new LaOperation(LaOperation.DELETE, LaMsg.TBB_Delete, LaMsg.ALTBB_Delete_tt, LaImg.I_DELETE, LaImg.I_DELETE, new LsListener(this, LaAccountViewController.prototype._deleteButtonListener)));    	    	
			this._toolBar = new LaToolBar(this._container, this._ops);
	
	  		//this._view = new LaAccountView(this._container, this._app, entry.id);
	  		this._view = new LaAccountXFormView(this._container, this._app);
	    	this._app.createView(LaAccountViewController.VIEW, [this._toolBar, this._view]);
	    	this._UICreated = true;
  		}
		this._app.pushView(LaAccountViewController.VIEW);
		if(entry.id) {
			try {
				entry.refresh(false);
			} catch (ex) {
				// Data corruption may cause anexception. We should catch it here in order to display the form anyway.
				this._handleException(ex, null, null, false);
			}
		}
		this._toolBar.getButton(LaOperation.SAVE).setEnabled(false);
		if(!entry.id) {
			this._toolBar.getButton(LaOperation.DELETE).setEnabled(false);  			
	//		this._toolBar.getButton(LaOperation.CHNG_PWD).setEnabled(false);  						
		} else {
			this._toolBar.getButton(LaOperation.DELETE).setEnabled(true);  				
//			this._toolBar.getButton(LaOperation.CHNG_PWD).setEnabled(true);  							
		}	
		this._view.setDirty(false);
		entry.attrs[LaAccount.A_password] = null; //get rid of VALUE-BLOCKED
		entry[LaModel.currentTab] = "1"
		this._view.setObject(entry);
//	  	this._view.setObject(entry, this._cosChanged, this._domainsChanged);
		this._currentObject = entry;
	} catch (ex) {
		this._handleException(ex, "LaAccountViewController.prototype._setView", null, false);
	}	
	this._cosChanged = false;
	this._domainsChanged = false;
	
}

/**
* @param params		   - params["params"] - arguments to pass to the method specified in func parameter
* 					     params["obj"] - the controller of the next view
*						 params["func"] - the method to call on the nextViewCtrlr in order to navigate to the next view
* This method saves changes in the current view and calls the method on the controller of the next view
**/
LaAccountViewController.prototype._saveAndGoAway =
function (params) {
	try {
		this._confirmMessageDialog.popdown();			
		if(this._saveChanges()) {
			params["func"].call(params["obj"], params["params"]);	
		}
	} catch (ex) {
		//if exception thrown - don' go away
		if(ex.code == LsCsfeException.ACCT_EXISTS) {
			this._msgDialog.setMessage(LaMsg.ERROR_ACCOUNT_EXISTS, null, DwtMessageDialog.CRITICAL_STYLE, null);
			this._msgDialog.popup();
		} else {
			var mods = null;
			if(ex.mods) {
				mods = ex.mods;
			}
			this._handleException(ex, "LaAccountViewController.prototype._saveAndGoAway", mods, false);
		}
	}
}

/**
* Leaves current view without saving any changes
**/
LaAccountViewController.prototype._discardAndGoAway = 
function (params) {
	this._confirmMessageDialog.popdown();
	params["func"].call(params["obj"], params["params"]);		
}

/**
* deletes current LaAccount and leaves the view
**/
LaAccountViewController.prototype._deleteAndGoAway = 
function () {
	try {
		if(this._currentObject.id) {
			this._currentObject.remove();
			this._fireAccountRemovalEvent(this._currentObject);
		}
		this._app.getAccountListController().show();
		this._confirmMessageDialog.popdown();	

	} catch (ex) {
		this._confirmMessageDialog.popdown();	
		if(ex.code == LsCsfeException.SVC_WRONG_HOST) {
			var szMsg = LaMsg.ERROR_WRONG_HOST;
			if(ex.detail) {
				szMsg +="<br>Details:<br>";
				szMsg += ex.detail;
			}
			this._msgDialog.setMessage(szMsg, null, DwtMessageDialog.CRITICAL_STYLE, null);
			this._msgDialog.popup();					
		} else {
			this._handleException(ex, "LaAccountViewController.prototype._deleteAndGoAway", null, false);				
		}	
	}
}


LaAccountViewController.prototype._closeCnfrmDlg = 
function () {
	this._confirmMessageDialog.popdown();	
}

//toolbar button listeners 

/**
* @param 	ev event object
* This method handles "save" button click
**/
LaAccountViewController.prototype._saveButtonListener =
function(ev) {
	try {
		if(this._saveChanges()) {
			this._view.setDirty(false);
			if(this._toolBar)
				this._toolBar.getButton(LaOperation.SAVE).setEnabled(false);		
		
			this._currentObject.refresh(false);	
			this._view.setObject(this._currentObject);			
			this._fireAccountChangeEvent();			
		}
	} catch (ex) {
		this._handleException(ex, "LaAccountViewController.prototype._saveButtonListener", null, false);
	}
	return;
}

/**
* handles the Close button click. Returns to the list view.
**/ 
LaAccountViewController.prototype._closeButtonListener =
function(ev) {
	//prompt if the user wants to save the changes
	if(this._view.isDirty()) {
		//parameters for the confirmation dialog's callback 
		var args = new Object();		
		args["params"] = null;
		args["obj"] = this._app.getAccountListController();
		args["func"] = LaAccountListController.prototype.show;
		//ask if the user wants to save changes		
		this._confirmMessageDialog = new LaMsgDialog(this._view.shell, null, [DwtDialog.YES_BUTTON, DwtDialog.NO_BUTTON, DwtDialog.CANCEL_BUTTON], this._app);								
		this._confirmMessageDialog.setMessage("Do you want so save current changes?", null, DwtMessageDialog.INFO_STYLE);
		this._confirmMessageDialog.registerCallback(DwtDialog.YES_BUTTON, LaAccountViewController.prototype._saveAndGoAway, this, args);		
		this._confirmMessageDialog.registerCallback(DwtDialog.NO_BUTTON, LaAccountViewController.prototype._discardAndGoAway, this, args);		
		this._confirmMessageDialog.popup();
	} else {
		this._app.getAccountListController().show();

	}	
}

/**
* This listener is called when the Delete button is clicked. 
**/
LaAccountViewController.prototype._deleteButtonListener =
function(ev) {
	if(this._currentObject.id) {
		this._confirmMessageDialog = new LaMsgDialog(this._view.shell, null, [DwtDialog.YES_BUTTON, DwtDialog.NO_BUTTON], this._app);						
		this._confirmMessageDialog.setMessage("Are you sure you want to delete this account?", null, DwtMessageDialog.INFO_STYLE);
		this._confirmMessageDialog.registerCallback(DwtDialog.YES_BUTTON, LaAccountViewController.prototype._deleteAndGoAway, this, null);		
		this._confirmMessageDialog.registerCallback(DwtDialog.NO_BUTTON, LaAccountViewController.prototype._closeCnfrmDlg, this, null);				
		this._confirmMessageDialog.popup();
	} else {
		this._app.getAccountListController().show();
	}
}


// new button was pressed
LaAccountViewController.prototype._newButtonListener =
function(ev) {
	try {
		var newAccount = new LaAccount(this._app);
		this._newAccountWizard = new LaNewAccountXWizard(this._container, this._app);	
		this._newAccountWizard.setObject(newAccount);
		this._newAccountWizard.popup();
	} catch (ex) {
		this._handleException(ex, "LaAccountViewController.prototype._newButtonListener", null, false);
	}
}

//event notifiers

/**
*	Private method that notifies listeners to that the controlled LaAccount is changed
* 	@param details
*/
LaAccountViewController.prototype._fireAccountChangeEvent =
function() {
	try {
		if (this._evtMgr.isListenerRegistered(LaEvent.E_MODIFY)) {
			var evt = new LaEvent(LaEvent.S_ACCOUNT);
			evt.set(LaEvent.E_MODIFY, this);
			this._evtMgr.notifyListeners(LaEvent.E_MODIFY, evt);
		}
	} catch (ex) {
		this._handleException(ex, "LaAccountViewController.prototype._fireAccountChangeEvent", null, false);	
	}
		
}

/**
*	Private method that notifies listeners to that the controlled LaAccount is removed
* 	@param details
*/
LaAccountViewController.prototype._fireAccountRemovalEvent =
function(details) {
	try {
		if (this._evtMgr.isListenerRegistered(LaEvent.E_REMOVE)) {
			var evt = new LaEvent(LaEvent.S_ACCOUNT);
			evt.set(LaEvent.E_REMOVE, this);
			evt.setDetails(details);
			this._evtMgr.notifyListeners(LaEvent.E_REMOVE, evt);
		}
	} catch (ex) {
		this._handleException(ex, "LaAccountViewController.prototype._fireAccountRemovalEvent", details, false);	
	}
}

/**
*	Private method that notifies listeners that a new LaAccount is created
* 	@param details
*/
LaAccountViewController.prototype._fireAccountCreationEvent =
function(details) {
	try {
		if (this._evtMgr.isListenerRegistered(LaEvent.E_CREATE)) {
			var evt = new LaEvent(LaEvent.S_ACCOUNT);
			evt.set(LaEvent.E_CREATE, this);
			if(details)
				evt.setDetails(details);
				
			this._evtMgr.notifyListeners(LaEvent.E_CREATE, evt);
		}
	} catch (ex) {
		this._handleException(ex, "LaAccountViewController.prototype.__fireAccountCreationEvent", details, false);	
	}

}

