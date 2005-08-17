/**
* @constructor
* @class LaServerListController
* This is a singleton object that controls all the user interaction with the list of LaServer objects
**/
function LaServerListController(appCtxt, container, app) {
	LaController.call(this, appCtxt, container, app);
	this._evtMgr = new LsEventMgr();
}

LaServerListController.prototype = new LaController();
LaServerListController.prototype.constructor = LaServerListController;

LaServerListController.SERVER_VIEW = "LaServerListController.SERVER_VIEW";

LaServerListController.prototype.show = 
function(list) {
    if (!this._appView) {
    	//create toolbar
    	this._ops = new Array();
    	this._ops.push(new LaOperation(LaOperation.EDIT, LaMsg.TBB_Edit, LaMsg.SERTBB_Edit_tt, LaImg.I_PROPERTIES, LaImg.I_PROPERTIES, new LsListener(this, LaServerListController.prototype._editButtonListener)));    	
    	this._ops.push(new LaOperation(LaOperation.DELETE, LaMsg.TBB_Delete, LaMsg.SERTBB_Delete_tt, LaImg.I_DELETE, LaImg.I_DELETE, new LsListener(this, LaServerListController.prototype._deleteButtonListener)));    	    	
		this._toolbar = new LaToolBar(this._container, this._ops);    
 	
		//create Servers list view
		this._contentView = new LaServerListView(this._container);
		this._appView = this._app.createView(LaServerListController.SERVER_VIEW, [this._toolbar,  this._contentView]);

    	//context menu
    	this._actionMenu =  new LaPopupMenu(this._contentView, "ActionMenu", null, this._ops);
	
		if (list != null)
			this._contentView.set(list.getVector());

		this._app.pushView(LaServerListController.SERVER_VIEW);			
		
		//set a selection listener on the Server list view
		this._contentView.addSelectionListener(new LsListener(this, this._listSelectionListener));
		this._contentView.addActionListener(new LsListener(this, this._listActionListener));			
		this._removeConfirmMessageDialog = new LaMsgDialog(this._appView.shell, null, [DwtDialog.YES_BUTTON, DwtDialog.NO_BUTTON], this._app);					
		//this.refresh();
	} else {
		if (list != null)
			this._contentView.set(list.getVector());	
			
		this._app.pushView(LaServerListController.SERVER_VIEW);
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
LaServerListController.prototype.getList = 
function() {
	return this._list;
}

/*
LaServerListController.prototype.refresh = 
function() {
	try {
		this._contentView.set(this._app.getServerList(true).getVector());
	} catch (ex) {
		this._handleException(ex, LaServerListController.prototype.refresh, null, false);
	}
}
*/

LaServerListController.prototype.set = 
function(serverList) {
	this.show(serverList);
}

/**
* @param ev
* This listener is invoked by  any controller that can change an LaServer object
**/
LaServerListController.prototype.handleServerChange = 
function (ev) {
	//if any of the data that is currently visible has changed - update the view
	if(ev) {
		var details = ev.getDetails();
		if(details["modFields"] && (details["modFields"][LaServer.A_description] )) {
			this._contentView.setUI();
			if(this._app.getCurrentController() == this) {
				this.show();			
			}
		}
	}
}

/**
* @param ev
* This listener is invoked by LaServerController or any other controller that can create an LaServer object
**/
LaServerListController.prototype.handleServerCreation = 
function (ev) {
	if(ev) {
		//add the new LaServer to the controlled list
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
* This listener is invoked by LaServerController or any other controller that can remove an LaServer object
**/
LaServerListController.prototype.handleServerRemoval = 
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
LaServerListController.prototype.switchToNextView = 
function (nextViewCtrlr, func, params) {
	func.call(nextViewCtrlr, params);
}

/**
* public getToolBar
* @return reference to the toolbar
**/
LaServerListController.prototype.getToolBar = 
function () {
	return this._toolBar;	
}

/**
* Adds listener to removal of an LaServer 
* @param listener
**/
LaServerListController.prototype.addServerRemovalListener = 
function(listener) {
	this._evtMgr.addListener(LaEvent.E_REMOVE, listener);
}

/*
// refresh button was pressed
LaServerListController.prototype._refreshButtonListener =
function(ev) {
	this.refresh();
}
*/

/**
*	Private method that notifies listeners to that the controlled LaServer (are) removed
* 	@param details
*/
LaServerListController.prototype._fireServerRemovalEvent =
function(details) {
	try {
		if (this._evtMgr.isListenerRegistered(LaEvent.E_REMOVE)) {
			var evt = new LaEvent(LaEvent.S_SERVER);
			evt.set(LaEvent.E_REMOVE, this);
			evt.setDetails(details);
			this._evtMgr.notifyListeners(LaEvent.E_REMOVE, evt);
		}
	} catch (ex) {
		this._handleException(ex, LaServerListController.prototype._fireServerRemovalEvent, details, false);	
	}
}


// new button was pressed
LaServerListController.prototype._newButtonListener =
function(ev) {
	var newServer = new LaServer();
	this._app.getServerController().show(newServer);
}

/**
* This listener is called when the item in the list is double clicked. It call LaServerController.show method
* in order to display the Server View
**/
LaServerListController.prototype._listSelectionListener =
function(ev) {
	if (ev.detail == DwtListView.ITEM_DBL_CLICKED) {
		if(ev.item) {
			this._selectedItem = ev.item;
			this._app.getServerController().show(ev.item);
		}
	} else {
		this._changeActionsState();	
	}
}

LaServerListController.prototype._listActionListener =
function (ev) {
	this._changeActionsState();
	this._actionMenu.popup(0, ev.docX, ev.docY);
}
/**
* This listener is called when the Edit button is clicked. 
* It call LaServerController.show method
* in order to display the Server View
**/
LaServerListController.prototype._editButtonListener =
function(ev) {
	if(this._contentView.getSelectedItems() && this._contentView.getSelectedItems().getLast()) {
		var item = DwtListView.prototype.getItemFromElement.call(this, this._contentView.getSelectedItems().getLast());
		this._app.getServerController().show(item);
	}
}

/**
* This listener is called when the Delete button is clicked. 
**/
LaServerListController.prototype._deleteButtonListener =
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
		dlgMsg = LaMsg.Q_DELETE_SERVERS;
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
		this._removeConfirmMessageDialog.setMessage(dlgMsg, null, DwtMessageDialog.INFO_STYLE);
		this._removeConfirmMessageDialog.registerCallback(DwtDialog.YES_BUTTON, LaServerListController.prototype._deleteServersCallback, this);
		this._removeConfirmMessageDialog.registerCallback(DwtDialog.NO_BUTTON, LaServerListController.prototype._donotDeleteServersCallback, this);		
		this._removeConfirmMessageDialog.popup();
	}
}

LaServerListController.prototype._deleteServersCallback = 
function () {
	var successRemList=new Array();
	for(var key in this._removeList) {
		if(this._removeList[key]) {
			try {
				this._removeList[key].remove();
				successRemList.push(this._removeList[key]);					
			} catch (ex) {
				this._removeConfirmMessageDialog.popdown();
				this._handleException(ex, LaServerListController.prototype._deleteServersCallback, null, false);
				return;
			}
		}
		this._list.remove(this._removeList[key]); //remove from the list
	}
	this._fireServerRemovalEvent(successRemList); 		
	this._removeConfirmMessageDialog.popdown();
	this._contentView.setUI();
	this.show();
}

LaServerListController.prototype._donotDeleteServersCallback = 
function () {
	this._removeList = new Array();
	this._removeConfirmMessageDialog.popdown();
}

LaServerListController.prototype._changeActionsState = 
function () {
	var cnt = this._contentView.getSelectionCount();
	if(cnt == 1) {
		var opsArray = [LaOperation.EDIT];
		this._toolbar.enable(opsArray, true);
		this._actionMenu.enable(opsArray, true);
	} else if (cnt > 1){
		var opsArray1 = [LaOperation.EDIT];
		this._toolbar.enable(opsArray1, false);
		this._actionMenu.enable(opsArray1, false);
	} else {
		var opsArray = [LaOperation.EDIT];
		this._toolbar.enable(opsArray, false);
		this._actionMenu.enable(opsArray, false);
	}
}