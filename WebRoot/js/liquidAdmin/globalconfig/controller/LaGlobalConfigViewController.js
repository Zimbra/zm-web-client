/**
* @class LaGlobalConfigViewController 
* @contructor LaGlobalConfigViewController
* @param appCtxt
* @param container
* @param app
* @author Greg Solovyev
**/
function LaGlobalConfigViewController(appCtxt, container, app) {
	LaController.call(this, appCtxt, container, app);
	this._evtMgr = new LsEventMgr();
	this._UICreated = false;
	this._confirmMessageDialog;	
}

LaGlobalConfigViewController.prototype = new LaController();
LaGlobalConfigViewController.prototype.constructor = LaGlobalConfigViewController;

LaGlobalConfigViewController.STATUS_VIEW = "LaGlobalConfigViewController.STATUS_VIEW";

LaGlobalConfigViewController.prototype.show = 
function(item) {

	if(!this._UICreated) {
  		this._ops = new Array();
		this._ops.push(new LaOperation(LaOperation.SAVE, LaMsg.TBB_Save, LaMsg.ALTBB_Save_tt, LaImg.I_SAVE, LaImg.ID_SAVE, new LsListener(this, LaGlobalConfigViewController.prototype._saveButtonListener)));
		this._toolBar = new LaToolBar(this._container, this._ops);
	
//		this._view = new LaGlobalConfigView(this._container, this._app);
		this._view = new GlobalConfigXFormView(this._container, this._app);
		this._appView = this._app.createView(LaGlobalConfigViewController.STATUS_VIEW, [this._toolBar, this._view]);
		this._UICreated = true;		
	}
	this._app.pushView(LaGlobalConfigViewController.STATUS_VIEW);
	this._toolBar.getButton(LaOperation.SAVE).setEnabled(false);  	
	this._app.setCurrentController(this);
	try {		
		item[LaModel.currentTab] = "1"
		this._view.setDirty(false);
		this._view.setObject(item);
	} catch (ex) {
		this._handleException(ex, "LaGlobalConfigViewController.prototype.show", null, false);
	}
	this._currentObject = item;		
}


LaGlobalConfigViewController.prototype.setEnabled = 
function(enable) {
	this._view.setEnabled(enable);
}

/**
* @param nextViewCtrlr - the controller of the next view
* Checks if it is safe to leave this view. Displays warning and Information messages if neccesary.
**/
LaGlobalConfigViewController.prototype.switchToNextView = 
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
LaGlobalConfigViewController.prototype.getToolBar = 
function () {
	return this._toolBar;	
}

LaGlobalConfigViewController.prototype.setDirty = 
function (isD) {
	if(isD)
		this._toolBar.getButton(LaOperation.SAVE).setEnabled(true);
	else
		this._toolBar.getButton(LaOperation.SAVE).setEnabled(false);
}

/**
* @param params		   - params["params"] - arguments to pass to the method specified in func parameter
* 					     params["obj"] - the controller of the next view
*						 params["func"] - the method to call on the nextViewCtrlr in order to navigate to the next view
* This method saves changes in the current view and calls the method on the controller of the next view
**/
LaGlobalConfigViewController.prototype._saveAndGoAway =
function (params) {
	this._confirmMessageDialog.popdown();			
	try {
		if(this._saveChanges()) {
			params["func"].call(params["obj"], params["params"]);	
		}
	} catch (ex) {
		this._handleException(ex, "LaGlobalConfigViewController.prototype._saveAndGoAway", null, false);
	}
}

/**
* Leaves current view without saving any changes
**/
LaGlobalConfigViewController.prototype._discardAndGoAway = 
function (params) {
	this._confirmMessageDialog.popdown();
	try {
		params["func"].call(params["obj"], params["params"]);		
	} catch (ex) {
		this._handleException(ex, "LaGlobalConfigViewController.prototype._discardAndGoAway", null, false);
	}
}

LaGlobalConfigViewController.prototype._saveButtonListener = 
function (ev) {
	try {
		if(this._saveChanges()) {
			this._view.setDirty(false);		
			this._toolBar.getButton(LaOperation.SAVE).setEnabled(false); 
		}
	} catch (ex) {
		this._handleException(ex, "LaGlobalConfigViewController.prototype._saveButtonListener", null, false);
	}
}

LaGlobalConfigViewController.prototype._saveChanges =
function () {
	var tmpObj = this._view.getObject();
	var isNew = false;
	if(tmpObj.attrs == null) {
		//show error msg
		this._msgDialog.setMessage(LaMsg.ERROR_UNKNOWN, null, DwtMessageDialog.CRITICAL_STYLE, null);
		this._msgDialog.popup();		
		return false;	
	}

	//check values
	if(!LsUtil.isNonNegativeInteger(tmpObj.attrs[LaGlobalConfig.A_liquidSmtpPort])) {
		//show error msg
		this._msgDialog.setMessage(LaMsg.ERROR_INVALID_VALUE + ": " + LaMsg.NAD_SmtpPort + " ! ", null, DwtMessageDialog.CRITICAL_STYLE, null);
		this._msgDialog.popup();		
		return false;
	}
		
	if(!LsUtil.isNonNegativeInteger(tmpObj.attrs[LaGlobalConfig.A_liquidGalMaxResults])) {
		//show error msg
		this._msgDialog.setMessage(LaMsg.ERROR_INVALID_VALUE + ": " + LaMsg.NAD_GalMaxResults + " ! ", null, DwtMessageDialog.CRITICAL_STYLE, null);
		this._msgDialog.popup();		
		return false;
	}		
	
	// update liquidMtaRestriction
	var restrictions = [];
	for (var i = 0; i < LaGlobalConfig.MTA_RESTRICTIONS.length; i++) {
		var restriction = LaGlobalConfig.MTA_RESTRICTIONS[i];
		if (tmpObj.attrs["_"+LaGlobalConfig.A_liquidMtaRestriction+"_"+restriction]) {
			restrictions.push(restriction);
		}			
	}
	var dirty = restrictions.length > 0;
	if (tmpObj.attrs[LaGlobalConfig.A_liquidMtaRestriction]) {
		var prevRestrictions = LsUtil.isString(tmpObj.attrs[LaGlobalConfig.A_liquidMtaRestriction])
		                     ? [ tmpObj.attrs[LaGlobalConfig.A_liquidMtaRestriction] ]
		                     : tmpObj.attrs[LaGlobalConfig.A_liquidMtaRestriction];
		dirty = restrictions.length != prevRestrictions.length;
		if (!dirty) {
			for (var i = 0; i < prevRestrictions.length; i++) {
				var restriction = prevRestrictions[i];
				if (!tmpObj.attrs["_"+LaGlobalConfig.A_liquidMtaRestriction+"_"+restriction]) {
					dirty = true;
					break;
				}
			}
		}
	}
	if (dirty) {
		tmpObj.attrs[LaGlobalConfig.A_liquidMtaRestriction] = restrictions;
	}

	//transfer the fields from the tmpObj to the _currentObject, since _currentObject is an instance of LaDomain
	var mods = new Object();
	for (var a in tmpObj.attrs) {
		if(a == LaItem.A_objectClass || a == LaGlobalConfig.A_liquidAccountClientAttr || 
		a == LaGlobalConfig.A_liquidServerInheritedAttr || a == LaGlobalConfig.A_liquidDomainInheritedAttr ||
		a == LaGlobalConfig.A_liquidCOSInheritedAttr || a == LaGlobalConfig.A_liquidGalLdapAttrMap || 
		a == LaGlobalConfig.A_liquidGalLdapFilterDef || /^_/.test(a))
			continue;

		if (this._currentObject.attrs[a] != tmpObj.attrs[a] ) {
			mods[a] = tmpObj.attrs[a];
		}
	}
	//save the model
	var changeDetails = new Object();
	this._currentObject.modify(mods);
	//if modification took place - fire an DomainChangeEvent
	changeDetails["obj"] = this._currentObject;
	changeDetails["modFields"] = mods;
	this._fireSettingsChangeEvent(changeDetails);
	return true;
}

/**
*	Private method that notifies listeners to that the settings are changed
* 	@param details
*/
LaGlobalConfigViewController.prototype._fireSettingsChangeEvent =
function(details) {
	try {
		if (this._evtMgr.isListenerRegistered(LaEvent.E_MODIFY)) {
			var evt = new LaEvent(LaEvent.S_GLOBALCONFIG);
			evt.set(LaEvent.E_MODIFY, this);
			evt.setDetails(details);
			this._evtMgr.notifyListeners(LaEvent.E_MODIFY, evt);
		}
	} catch (ex) {
		this._handleException(ex, "LaGlobalConfigViewController.prototype._fireSettingsChangeEvent", details, false);	
	}
}
