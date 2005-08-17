function LaCosListController(appCtxt, container, app) {
	LaController.call(this, appCtxt, container, app);
	this._evtMgr = new LsEventMgr();		
}

LaCosListController.prototype = new LaController();
LaCosListController.prototype.constructor = LaCosListController;

LaCosListController.COS_VIEW = "LaCosListController.COS_VIEW";

LaCosListController.prototype.show = 
function(list) {
    if (!this._appView) {
    	this._ops = new Array();
    	this._ops.push(new LaOperation(LaOperation.NEW, LaMsg.TBB_New, LaMsg.COSTBB_New_tt, LaImg.I_NEWCOS, LaImg.I_NEWCOS, new LsListener(this, LaCosListController.prototype._newButtonListener)));
    	this._ops.push(new LaOperation(LaOperation.DUPLICATE, LaMsg.TBB_Duplicate, LaMsg.COSTBB_Duplicate_tt, LaImg.I_DUPLCOS, LaImg.I_DUPLCOS, new LsListener(this, LaCosListController.prototype._duplicateButtonListener)));    	    	
    	this._ops.push(new LaOperation(LaOperation.EDIT, LaMsg.TBB_Edit, LaMsg.COSTBB_Edit_tt, LaImg.I_PROPERTIES, LaImg.I_PROPERTIES, new LsListener(this, LaCosListController.prototype._editButtonListener)));    	
    	this._ops.push(new LaOperation(LaOperation.DELETE, LaMsg.TBB_Delete, LaMsg.COSTBB_Delete_tt, LaImg.I_DELETE, LaImg.I_DELETE, new LsListener(this, LaCosListController.prototype._deleteButtonListener)));    	    	
		this._toolbar = new LaToolBar(this._container, this._ops);
    
		this._contentView = new LaCosListView(this._container);
		this._appView = this._app.createView(LaCosListController.COS_VIEW, [this._toolbar,  this._contentView]);
		if (list != null)
			this._contentView.set(list.getVector());

    	this._actionMenu =  new LaPopupMenu(this._contentView, "ActionMenu", null, this._ops);		
		this._app.pushView(LaCosListController.COS_VIEW);
		
		//set a selection listener on the account list view
		this._contentView.addSelectionListener(new LsListener(this, this._listSelectionListener));
		this._contentView.addActionListener(new LsListener(this, this._listActionListener));			
		this._removeConfirmMessageDialog = new LaMsgDialog(this._appView.shell, null, [DwtDialog.YES_BUTTON, DwtDialog.NO_BUTTON], this._app);							
//		this.refresh();
	} else {
		if (list != null)
			this._contentView.set(list.getVector());	

		this._app.pushView(LaCosListController.COS_VIEW);
	}
	this._app.setCurrentController(this);		
	this._removeList = new Array();
	if (list != null)
		this._list = list;
		
	this._changeActionsState();			
}

/**
* @param nextViewCtrlr - the controller of the next view
* Checks if it is safe to leave this view. Displays warning and Information messages if neccesary.
**/
LaCosListController.prototype.switchToNextView = 
function (nextViewCtrlr, func, params) {
	func.call(nextViewCtrlr, params);
}

LaCosListController.prototype.refresh = 
function() {
	/*try {
		this._contentView.set(this._app.getCosList(true).getVector());
	} catch (ex) {
		this._handleException(ex, LaCosListController.prototype.refresh, null, false);
	}*/
}

/**
* @param ev
* This listener is invoked by LaAccountController or any other controller that can create an LaAccount object
**/
LaCosListController.prototype.handleCosCreation = 
function (ev) {
	if(ev) {
		//add the new LaAccount to the controlled list
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
* This listener is invoked by LaCosController or any other controller that can remove an LaCos object
**/
LaCosListController.prototype.handleCosRemoval = 
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

LaCosListController.prototype.handleCosChange =
function (ev) {
	//if any of the data that is currently visible has changed - update the view
	if(ev) {
		var details = ev.getDetails();
		if(details["mods"][LaCos.A_name] || details["mods"][LaCos.A_description]) {
			this._contentView.setUI();
			if(this._app.getCurrentController() == this) {
				this.show();			
			}
		}
	}
}

/**
* Adds listener to removal of an LaCos 
* @param listener
**/
LaCosListController.prototype.addCosRemovalListener = 
function(listener) {
	this._evtMgr.addListener(LaEvent.E_REMOVE, listener);
}

/**
*	Private method that notifies listeners to that the controlled LaCos is (are) removed
* 	@param details
*/
LaCosListController.prototype._fireCOSRemovalEvent =
function(details) {
	try {
		if (this._evtMgr.isListenerRegistered(LaEvent.E_REMOVE)) {
			var evt = new LaEvent(LaEvent.S_COS);
			evt.set(LaEvent.E_REMOVE, this);
			evt.setDetails(details);
			this._evtMgr.notifyListeners(LaEvent.E_REMOVE, evt);
		}
	} catch (ex) {
		this._handleException(ex, LaCosListController.prototype._fireCOSRemovalEvent, details, false);	
	}
}

// refresh button was pressed
LaCosListController.prototype._refreshButtonListener =
function(ev) {
	this.refresh();
}


// duplicate button was pressed
LaCosListController.prototype._duplicateButtonListener =
function(ev) {
	var newCos = new LaCos(this._app); //new COS
	if(this._contentView.getSelectedItems() && this._contentView.getSelectedItems().getLast()) {
		var item = DwtListView.prototype.getItemFromElement.call(this, this._contentView.getSelectedItems().getLast());
		if(item && item.attrs) { //copy the attributes from the selected COS to the new COS
			for(var aname in item.attrs) {
				if( (aname == LaItem.A_objectClass) || (aname == LaItem.A_liquidId) || (aname == LaCos.A_name) || (aname == LaCos.A_description) || (aname == LaCos.A_notes) )
					continue;			
				newCos.attrs[aname] = item.attrs[aname];
			}
		}
	}	
	this._app.getCosController().show(newCos);
}

// new button was pressed
LaCosListController.prototype._newButtonListener =
function(ev) {
	var newCos = new LaCos(this._app);
	//load default COS
	var defCos = new LaCos(this._app);
	defCos.load("name", "default");
	//copy values from default cos to the new cos
	for(var aname in defCos.attrs) {
		if( (aname == LaItem.A_objectClass) || (aname == LaItem.A_liquidId) || (aname == LaCos.A_name) || (aname == LaCos.A_description) || (aname == LaCos.A_notes) )
			continue;			
		newCos.attrs[aname] = defCos.attrs[aname];
	}
	
	this._app.getCosController().show(newCos);
}

/**
* This listener is called when the item in the list is double clicked. It call LaCosController.show method
* in order to display the Cos View
**/
LaCosListController.prototype._listSelectionListener =
function(ev) {
	if (ev.detail == DwtListView.ITEM_DBL_CLICKED) {
		if(ev.item) {
			//this._selectedItem = ev.item;
			this._app.getCosController().show(ev.item);
		}
	} else {
		this._changeActionsState();	
	}
}


LaCosListController.prototype._listActionListener =
function (ev) {
	this._changeActionsState();
	this._actionMenu.popup(0, ev.docX, ev.docY);
}

/**
* This listener is called when the Edit button is clicked. 
* It call LaCosListController.show method
* in order to display the COS View
**/
LaCosListController.prototype._editButtonListener =
function(ev) {
	if(this._contentView.getSelectedItems() && this._contentView.getSelectedItems().getLast()) {
		var item = DwtListView.prototype.getItemFromElement.call(this, this._contentView.getSelectedItems().getLast());
		this._app.getCosController().show(item);
	}
}

/**
* This listener is called when the Delete button is clicked. 
**/
LaCosListController.prototype._deleteButtonListener =
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
		dlgMsg = LaMsg.Q_DELETE_COS;
		dlgMsg +=  "<br><ul>";
		var i=0;
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
		this._removeConfirmMessageDialog.registerCallback(DwtDialog.YES_BUTTON, LaCosListController.prototype._deleteCosCallback, this);
		this._removeConfirmMessageDialog.registerCallback(DwtDialog.NO_BUTTON, LaCosListController.prototype._donotDeleteCosCallback, this);		
		this._removeConfirmMessageDialog.popup();
	}
}

LaCosListController.prototype._deleteCosCallback = 
function () {
	var successRemList=new Array();
	for(var key in this._removeList) {
		if(this._removeList[key]) {
			try {
				this._removeList[key].remove();
				successRemList.push(this._removeList[key]);				
			} catch (ex) {
				this._removeConfirmMessageDialog.popdown();
				this._handleException(ex, LaCosListController.prototype._deleteCosCallback, null, false);
				return;
			}
		}
		this._list.remove(this._removeList[key]); //remove from the list
	}
	this._fireCOSRemovalEvent(successRemList); 	
	this._removeConfirmMessageDialog.popdown();
	this._contentView.setUI();
	this.show();
}

LaCosListController.prototype._donotDeleteCosCallback = 
function () {
	this._removeList = new Array();
	this._removeConfirmMessageDialog.popdown();
}

LaCosListController.prototype._changeActionsState = 
function () {
	var cnt = this._contentView.getSelectionCount();
	var hasDefault = false;
	if(cnt >= 1) {
		var arrDivs = this._contentView.getSelectedItems().getArray();
		for(var key in arrDivs) {
			var item = DwtListView.prototype.getItemFromElement.call(this, arrDivs[key]);
			if(item) {
				if(item.name == "default") {
					hasDefault = true;
					break;
				}		
			}
		}
	}
		
	if(cnt == 1) {
		var opsArray = [LaOperation.EDIT, LaOperation.DUPLICATE];
		if(!hasDefault) {
        	opsArray.push(LaOperation.DELETE);
		} else {
			var opsArray2 = [LaOperation.DELETE];
			this._toolbar.enable(opsArray2, false);
			this._actionMenu.enable(opsArray2, false);
		}

		this._toolbar.enable(opsArray, true);
		this._actionMenu.enable(opsArray, true);
	} else if (cnt > 1){
		var opsArray1 = [LaOperation.EDIT, LaOperation.DUPLICATE];
		this._toolbar.enable(opsArray1, false);
		this._actionMenu.enable(opsArray1, false);

		var opsArray2 = [LaOperation.DELETE];
		if(!hasDefault) {
			this._toolbar.enable(opsArray2, true);
			this._actionMenu.enable(opsArray2, true);
		} else {
			this._toolbar.enable(opsArray2, false);
			this._actionMenu.enable(opsArray2, false);
		}
	} else {
		var opsArray = [LaOperation.EDIT, LaOperation.DELETE, LaOperation.DUPLICATE];
		this._toolbar.enable(opsArray, false);
		this._actionMenu.enable(opsArray, false);
	}
}