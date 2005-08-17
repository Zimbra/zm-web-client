/**
* @constructor
* @class LaAccountListController
* @param appCtxt
* @param container
* @param app
* This is a singleton object that controls all the user interaction with the list of LaAccount objects
* @author Roland Schemers
* @author Greg Solovyev
**/
function LaAccountListController(appCtxt, container, app) {
	LaController.call(this, appCtxt, container, app);
	this._evtMgr = new LsEventMgr();			
	this._currentPageNum = 1;
	this._currentQuery = new LaAccountQuery("", false, "");
//	this._searchResult=null;
//	this._totalPages = 1;
	this._currentSortField = LaAccount.A_uid;
	this._currentSortOrder = true;
	this.pages = new Object();
}

LaAccountListController.prototype = new LaController();
LaAccountListController.prototype.constructor = LaAccountListController;

LaAccountListController.ACCOUNT_VIEW = "LaAccountListController.ACCOUNT_VIEW";

LaAccountListController.prototype.show = 
function(searchResult) {
    if (!this._appView) {

		//create accounts list view
		this._contentView = new LaAccountListView(this._container, this._app);
    	//toolbar
    	this._ops = new Array();

   		this._ops.push(new LaOperation(LaOperation.NEW_WIZARD, LaMsg.TBB_New, LaMsg.ACTBB_New_tt, LaImg.I_ACCOUNT, LaImg.I_ACCOUNT, new LsListener(this, LaAccountListController.prototype._newButtonListener)));    	
    	this._ops.push(new LaOperation(LaOperation.EDIT, LaMsg.TBB_Edit, LaMsg.ACTBB_Edit_tt, LaImg.I_PROPERTIES, LaImg.I_PROPERTIES, new LsListener(this, LaAccountListController.prototype._editButtonListener)));
    	this._ops.push(new LaOperation(LaOperation.DELETE, LaMsg.TBB_Delete, LaMsg.ACTBB_Delete_tt, LaImg.I_DELETE, LaImg.I_DELETE, new LsListener(this, LaAccountListController.prototype._deleteButtonListener)));
		this._ops.push(new LaOperation(LaOperation.CHNG_PWD, LaMsg.TBB_ChngPwd, LaMsg.ACTBB_ChngPwd_tt, LaImg.I_PADLOCK, LaImg.I_PADLOCK, new LsListener(this, LaAccountListController.prototype._chngPwdListener)));
		this._ops.push(new LaOperation(LaOperation.VIEW_MAIL, LaMsg.TBB_ViewMail, LaMsg.ACTBB_ViewMail_tt, LaImg.I_PADLOCK, LaImg.I_PADLOCK, new LsListener(this, LaAccountListController.prototype._viewMailListener)));		


		
    	this._actionMenu =  new LaPopupMenu(this._contentView, "ActionMenu", null, this._ops);
    
   		var haveBackup = false;
		var globalConf = this._app.getGlobalConfig();

    	if(globalConf && globalConf.attrs[LaGlobalConfig.A_liquidComponentAvailable_hotbackup])
			this._ops.push(new LaOperation(LaOperation.MAIL_RESTORE, LaMsg.TBB_RestoreMailbox, LaMsg.ACTBB_Restore_tt, LaImg.I_ACCOUNT, LaImg.I_ACCOUNT, new LsListener(this, LaAccountListController.prototype._restoreMailListener)));		
			
		this._ops.push(new LaOperation(LaOperation.PAGE_BACK, LaMsg.Back, LaMsg.PrevPage_tt, LaImg.I_BACK_ARROW, LaImg.ID_BACK_ARROW,  new LsListener(this, LaAccountListController.prototype._prevPageListener)));
		this._ops.push(new LaOperation(LaOperation.PAGE_FORWARD, LaMsg.Forward, LaMsg.NextPage_tt, LaImg.I_FORWARD_ARROW, LaImg.ID_FORWARD_ARROW, new LsListener(this, LaAccountListController.prototype._nextPageListener)));

		this._toolbar = new LaToolBar(this._container, this._ops);    
		

		this._appView = this._app.createView(LaAccountListController.ACCOUNT_VIEW, [this._toolbar,  this._contentView]);

    	//context menu

		if (searchResult && searchResult.list != null) {
			var tmpArr = new Array();
			var cnt = searchResult.list.getArray().length;
			for(var ix = 0; ix < cnt; ix++) {
				tmpArr.push(searchResult.list.getArray()[ix]);
			}
			this._contentView.set(LsVector.fromArray(tmpArr));	
		}
		this._app.pushView(LaAccountListController.ACCOUNT_VIEW);			
		
		//set a selection listener on the account list view
		this._contentView.addSelectionListener(new LsListener(this, this._listSelectionListener));
		this._contentView.addActionListener(new LsListener(this, this._listActionListener));			
		this._removeConfirmMessageDialog = new LaMsgDialog(this._appView.shell, null, [DwtDialog.YES_BUTTON, DwtDialog.NO_BUTTON], this._app);			
		//this.refresh();
	} else {
		if (searchResult && searchResult.list != null) {
			var tmpArr = new Array();
			var cnt = searchResult.list.getArray().length;
			for(var ix = 0; ix < cnt; ix++) {
				tmpArr.push(searchResult.list.getArray()[ix]);
			}
			if(cnt < 1) {
				//if the list is empty - go to the previous page
				
			}
			this._contentView.set(LsVector.fromArray(tmpArr));	
		}
		this._app.pushView(LaAccountListController.ACCOUNT_VIEW);
	}
	this._app.setCurrentController(this);		
	this._removeList = new Array();
	if (searchResult && searchResult.list != null) {
		this.pages[this._currentPageNum] = searchResult;
	}
	this._changeActionsState();

	if(this.pages[this._currentPageNum].numPages <= this._currentPageNum) {
		this._toolbar.enable([LaOperation.PAGE_FORWARD], false);
	} else {
		this._toolbar.enable([LaOperation.PAGE_FORWARD], true);
	}
	if(this._currentPageNum == 1) {
		this._toolbar.enable([LaOperation.PAGE_BACK], false);
	} else {
		this._toolbar.enable([LaOperation.PAGE_BACK], true);
	}
	
	//this._schedule(LaAccountListController.prototype.preloadNextPage);
}

LaAccountListController.prototype.preloadNextPage = 
function() {
	if((this._currentPageNum + 1) <= this.pages[this._currentPageNum].numPages && !this.pages[this._currentPageNum+1]) {
		this.pages[this._currentPageNum+1] = LaAccount.searchByQueryHolder(this._currentQuery,this._currentPageNum+1, this._currentSortField, this._currentSortOrder, this._app)
	}		
	this._shell.setBusy(false);
}
/**
* @return LaItemList - the list currently displaid in the list view
**/
LaAccountListController.prototype.getList = 
function() {
	return this.pages[this._currentPageNum];
}


LaAccountListController.prototype.set = 
function(accountList) {
	this.show(accountList);
}

LaAccountListController.prototype.setPageNum = 
function (pgnum) {
	this._currentPageNum = Number(pgnum);
}

LaAccountListController.prototype.getPageNum = 
function () {
	return this._currentPageNum;
}

LaAccountListController.prototype.getTotalPages = 
function () {
	return this.pages[this._currentPageNum].numPages;
}

LaAccountListController.prototype.setQuery = 
function (query) {
	this._currentQuery = query;
}

LaAccountListController.prototype.getQuery = 
function () {
	return this._currentQuery;
}

LaAccountListController.prototype.setSortOrder = 
function (sortOrder) {
	this._currentSortOrder = sortOrder;
}

LaAccountListController.prototype.getSortOrder = 
function () {
	return this._currentSortOrder;
}

LaAccountListController.prototype.setSortField = 
function (sortField) {
	this._currentSortField = sortField;
}

LaAccountListController.prototype.getSortField = 
function () {
	return this._currentSortField;
}
/**
* Adds listener to removal of an LaAccount 
* @param listener
**/
LaAccountListController.prototype.addAccountRemovalListener = 
function(listener) {
	this._evtMgr.addListener(LaEvent.E_REMOVE, listener);
}

/**
*	Private method that notifies listeners to that the controlled LaAccount is (are) removed
* 	@param details
*/
LaAccountListController.prototype._fireAccountRemovalEvent =
function(details) {
	try {
		if (this._evtMgr.isListenerRegistered(LaEvent.E_REMOVE)) {
			var evt = new LaEvent(LaEvent.S_ACCOUNT);
			evt.set(LaEvent.E_REMOVE, this);
			evt.setDetails(details);
			this._evtMgr.notifyListeners(LaEvent.E_REMOVE, evt);
		}
	} catch (ex) {
		this._handleException(ex, LaAccountListController.prototype._fireAccountRemovalEvent, details, false);	
	}
}

/**
* @param ev
* This listener is invoked by LaAccountViewController or any other controller that can change an LaAccount object
**/
LaAccountListController.prototype.handleAccountChange = 
function (ev) {
	//if any of the data that is currently visible has changed - update the view
	if(ev) {
		this._contentView.setUI();
		if(this._app.getCurrentController() == this) {
			this.show();			
		}
	}
}

/**
* This listener is invoked by LaAccountViewController or any other controller that can create an LaAccount object
**/
LaAccountListController.prototype.handleAccountCreation = 
function () {
	this.pages=new Object();
	if(this._app.getCurrentController() == this) {
		this.show(LaAccount.searchByQueryHolder(this._currentQuery, this._currentPageNum, this._currentSortField, this._currentSortOrder, this._app));			
	} else {
		var searchResult = LaAccount.searchByQueryHolder(this._currentQuery, this._currentPageNum, this._currentSortField, this._currentSortOrder, this._app);
		if (searchResult && searchResult.list != null) {
			var tmpArr = new Array();
			var cnt = searchResult.list.getArray().length;
			for(var ix = 0; ix < cnt; ix++) {
				tmpArr.push(searchResult.list.getArray()[ix]);
			}
			this._contentView.set(LsVector.fromArray(tmpArr));	
			this.pages[this._currentPageNum] = searchResult;
		}			
	}
}

/**
* @param ev
* This listener is invoked by LaAccountViewController or any other controller that can remove an LaAccount object
**/
LaAccountListController.prototype.handleAccountRemoval = 
function (ev) {
	if(ev) {
		//add the new LaAccount to the controlled list
		if(ev.getDetails()) {
			this.pages=new Object();
			var srchResult = LaAccount.searchByQueryHolder(this._currentQuery, this._currentPageNum, this._currentSortField, this._currentSortOrder, this._app);
			while(this._currentPageNum > 1) { 
				if(srchResult.numPages < this._currentPageNum) {
					this._currentPageNum--;
					srchResult = LaAccount.searchByQueryHolder(this._currentQuery, this._currentPageNum, this._currentSortField, this._currentSortOrder, this._app);
					if(srchResult.numPages >= this._currentPageNum)
						break;
				}
			}
			if(this._app.getCurrentController() == this) {
				this.show(srchResult);			
			} else {
				if (srchResult && srchResult.list != null) {
					var tmpArr = new Array();
					var cnt = srchResult.list.getArray().length;
					for(var ix = 0; ix < cnt; ix++) {
						tmpArr.push(srchResult.list.getArray()[ix]);
					}
					this._contentView.set(LsVector.fromArray(tmpArr));	
					this.pages[this._currentPageNum] = srchResult;
				}					
			}
		}
	}
}

/**
* @param nextViewCtrlr - the controller of the next view
* Checks if it is safe to leave this view. Displays warning and Information messages if neccesary.
**/
LaAccountListController.prototype.switchToNextView = 
function (nextViewCtrlr, func, params) {
	func.call(nextViewCtrlr, params);
}

/**
* public getToolBar
* @return reference to the toolbar
**/
LaAccountListController.prototype.getToolBar = 
function () {
	return this._toolBar;	
}

// new button was pressed
LaAccountListController.prototype._newButtonListener =
function(ev) {
	try {
		var newAccount = new LaAccount(this._app);
		this._newAccountWizard = new LaNewAccountXWizard(this._container, this._app);	
//		this._newAccountWizard.registerCallback(DwtWizardDialog.FINISH_BUTTON, LaAccountListController.prototype._finishNewButtonListener, this, null);			
		this._newAccountWizard.setObject(newAccount);
		this._newAccountWizard.popup();
	} catch (ex) {
		this._handleException(ex, "LaAccountListController.prototype._newButtonListener", null, false);
	}
}

/**
* This listener is called when the item in the list is double clicked. It call LaAccountViewController.show method
* in order to display the Account View
**/
LaAccountListController.prototype._listSelectionListener =
function(ev) {
	if (ev.detail == DwtListView.ITEM_DBL_CLICKED) {
		if(ev.item) {
			//this._selectedItem = ev.item;
			this._app.getAccountViewController().show(ev.item);
		}
	} else {
		this._changeActionsState();
	}
}

LaAccountListController.prototype._listActionListener =
function (ev) {
	this._changeActionsState();
	this._actionMenu.popup(0, ev.docX, ev.docY);
}

/**
* This listener is called when the Edit button is clicked. 
* It call LaAccountViewController.show method
* in order to display the Account View
**/
LaAccountListController.prototype._editButtonListener =
function(ev) {
	if(this._contentView.getSelectedItems() && this._contentView.getSelectedItems().getLast()){
		var item = DwtListView.prototype.getItemFromElement.call(this, this._contentView.getSelectedItems().getLast());
		this._app.getAccountViewController().show(item);
	}
}


/**
* This listener is called when the Change Password button is clicked. 
**/
LaAccountListController.prototype._chngPwdListener =
function(ev) {
	if(this._contentView.getSelectedItems() && this._contentView.getSelectedItems().getLast()) {
		this._chngPwdDlg = new LaAccChangePwdDlg(this._appView.shell, this._app);
		var item = DwtListView.prototype.getItemFromElement.call(this, this._contentView.getSelectedItems().getLast());
		this._chngPwdDlg.registerCallback(DwtDialog.OK_BUTTON, LaAccountListController._changePwdOKCallback, this, item);				
		this._chngPwdDlg.popup(item.attrs[LaAccount.A_liquidPasswordMustChange]);
	}
}
LaAccountListController.launch = 
function (delegateToken, tokenLifetime, mailServer) {
	var form = this.document.createElement('form');
	form.style.display = 'none';
	this.document.body.appendChild(form);
	var html = new Array();
	var i = 0;
	if(!delegateToken)
		alert("Error! Failed to acquire authenticaiton token!");
			
	lifetime = tokenLifetime ? tokenLifetime : 300000;
					
	html[i++] = "<input type='hidden' name='authToken' value='" + delegateToken + "'>";
			
	if (tokenLifetime) {
		html[i++] = "<input type='hidden' name='atl' value='" + tokenLifetime + "'>";
	}
			
	form.innerHTML = html.join('');
		
				
	form.action = mailServer;
	form.method = 'post';
	form.submit();		
}

LaAccountListController.prototype._viewMailListener =
function(ev) {
	try {
		var el = this._contentView.getSelectedItems().getLast();
		if(el) {
			var account = DwtListView.prototype.getItemFromElement.call(this, el);
			if(account) {
				var obj = LaAccount.getViewMailLink(account.id);
				var win = window.open("about:blank", "_blank");
				var ms = account.attrs[LaAccount.A_mailHost] ? account.attrs[LaAccount.A_mailHost] : location.hostname;
				//find my server
				var servers = this._app.getServerList().getArray();
				var cnt = servers.length;
				var mailPort = 80;
				var mailProtocol = "http";
				
				for (var i = 0; i < cnt; i++) {
					if(servers[i].attrs[LaServer.A_ServiceHostname] == ms) {
						if(servers[i].attrs[LaServer.A_liquidMailSSLPort] && parseInt(servers[i].attrs[LaServer.A_liquidMailSSLPort]) > 0) { //if there is SSL, use SSL
							mailPort = servers[i].attrs[LaServer.A_liquidMailSSLPort];
							mailProtocol = "https";
						} else if (servers[i].attrs[LaServer.A_liquidMailPort] && parseInt(servers[i].attrs[LaServer.A_liquidMailPort]) > 0) { //otherwize use HTTP
							mailPort = servers[i].attrs[LaServer.A_liquidMailPort];
							mailProtocol = "http";
						}
						break;
					}
				}
				//TODO: get the port and hostname from liquidServer object
				var mServer = mailProtocol + "://" + ms + ":" + mailPort + "/liquid/auth/" + window.location.search;
	
				if(!obj.authToken || !obj.lifetime || !mServer)
					throw new LsException("Failed to acquire credentials from the server", LsException.UNKNOWN, "LaAccountListController.prototype._viewMailListener");
					
				LaAccountListController.launch.call(win, obj.authToken, obj.lifetime, mServer);
			}
		}
	} catch (ex) {
		this._handleException(ex, "LaAccountListController.prototype._viewMailListener", null, false);			
	}
}


LaAccountListController.prototype._nextPageListener = 
function (ev) {
	if(this._currentPageNum < this.pages[this._currentPageNum].numPages) {
		this._currentPageNum++;
		if(this.pages[this._currentPageNum]) {
			this.show(this.pages[this._currentPageNum])
		} else {
			this.show(LaAccount.searchByQueryHolder(this._currentQuery,this._currentPageNum, this._currentSortField, this._currentSortOrder, this._app));	
		}
	} 
}

LaAccountListController.prototype._prevPageListener = 
function (ev) {
	if(this._currentPageNum > 1) {
		this._currentPageNum--;
		if(this.pages[this._currentPageNum]) {
			this.show(this.pages[this._currentPageNum])
		} else {
			this.show(LaAccount.searchByQueryHolder(this._currentQuery,this._currentPageNum, this._currentSortField, this._currentSortOrder, this._app));
		}
/*		if(this._currentQuery.isByDomain) {
			this.show(LaAccount.searchByDomain(_currentQuery.byWhatAttr,_currentQuery.byValAttr,--this._currentPageNum, this._currentSortField, this._currentSortOrder));	
		} else {
			this.show(LaAccount.search(this._currentQuery.queryString, --this._currentPageNum, this._currentSortField, this._currentSortOrder));
		}*/
	} 
	
}

/**
* This listener is called when the Delete button is clicked. 
**/
LaAccountListController.prototype._deleteButtonListener =
function(ev) {
	this._removeList = new Array();
	if(this._contentView.getSelectedItems() && this._contentView.getSelectedItems().getArray()) {
		var arrDivs = this._contentView.getSelectedItems().getArray();
		var item = null;
		for(var key in arrDivs) {
			item = DwtListView.prototype.getItemFromElement.call(this, arrDivs[key]);
			if(item) {
				this._removeList.push(item);
			}
		}
	}
	if(this._removeList.length) {
		var dlgMsg = LaMsg.Q_DELETE_ACCOUNTS;
		dlgMsg +=  "<br><ul>";
		var i=0;
		for(var key in this._removeList) {
			if(i > 19) {
				dlgMsg += "<li>...</li>";
				break;
			}
			dlgMsg += "<li>";
			var szAccName = this._removeList[key].attrs[LaAccount.A_displayname] ? this._removeList[key].attrs[LaAccount.A_displayname] : this._removeList[key].name;
			if(szAccName.length > 50) {
				//split it
				var endIx = 49;
				var beginIx = 0; //
				while(endIx < szAccName.length) { //
					dlgMsg +=  szAccName.slice(beginIx, endIx); //
					beginIx = endIx + 1; //
					if(beginIx >= (szAccName.length) ) //
						break;
					
					endIx = ( szAccName.length <= (endIx + 50) ) ? szAccName.length-1 : (endIx + 50);
					dlgMsg +=  "<br>";	
				}
			} else {
				dlgMsg += szAccName;
			}
			dlgMsg += "</li>";
			i++;
		}
		dlgMsg += "</ul>";
		this._removeConfirmMessageDialog.setMessage(dlgMsg, null, DwtMessageDialog.INFO_STYLE);
		this._removeConfirmMessageDialog.registerCallback(DwtDialog.YES_BUTTON, LaAccountListController.prototype._deleteAccountsCallback, this);
		this._removeConfirmMessageDialog.registerCallback(DwtDialog.NO_BUTTON, LaAccountListController.prototype._donotDeleteAccountsCallback, this);		
		this._removeConfirmMessageDialog.popup();
	}
}

LaAccountListController.prototype._deleteAccountsCallback = 
function () {
	var successRemList=new Array();
	for(var key in this._removeList) {
		if(this._removeList[key]) {
			try {
				this._removeList[key].remove();
				successRemList.push(this._removeList[key]);
			} catch (ex) {
				this._removeConfirmMessageDialog.popdown();
				if(ex.code == LsCsfeException.SVC_WRONG_HOST) {
					var szMsg = LaMsg.ERROR_WRONG_HOST;
					if(ex.detail) {
						szMsg +="<br>Details:<br>";
						szMsg += ex.detail;
					}
					this._msgDialog.setMessage(szMsg, null, DwtMessageDialog.CRITICAL_STYLE, null);
					this._msgDialog.popup();					
				} else {
					this._handleException(ex, "LaAccountListController.prototype._deleteAccountsCallback", null, false);
				}
				return;
			}
		}
	}
	this._fireAccountRemovalEvent(successRemList); 
	this._removeConfirmMessageDialog.popdown();
	this.show(LaAccount.searchByQueryHolder(this._currentQuery, this._currentPageNum, this._currentSortField, this._currentSortOrder, this._app));			
}

LaAccountListController.prototype._donotDeleteAccountsCallback = 
function () {
	this._removeList = new Array();
	this._removeConfirmMessageDialog.popdown();
}

LaAccountListController._changePwdOKCallback = 
function (item) {
	//check the passwords, if they are ok then save the password, else show error
	if(this._chngPwdDlg) {
		try {
			if(!this._chngPwdDlg.getPassword() || this._chngPwdDlg.getPassword().length < 1) {
				this._chngPwdDlg.popdown();	//close the dialog
				this._errorMsgDlg = new LaMsgDialog(this._appView.shell, null, [DwtDialog.OK_BUTTON], this._app);							
				this._errorMsgDlg.setMessage(LaMsg.ERROR_PASSWORD_REQUIRED, null, DwtMessageDialog.CRITICAL_STYLE);
				this._errorMsgDlg.popup();				
			} else if(this._chngPwdDlg.getPassword() != this._chngPwdDlg.getConfirmPassword()) {
				this._chngPwdDlg.popdown();	//close the dialog
				this._errorMsgDlg = new LaMsgDialog(this._appView.shell, null, [DwtDialog.OK_BUTTON], this._app);							
				this._errorMsgDlg.setMessage(LaMsg.ERROR_PASSWORD_MISMATCH, null, DwtMessageDialog.CRITICAL_STYLE);
				this._errorMsgDlg.popup();				
			} else {
				//check password
				var myCos = null;
				var maxPwdLen = Number.POSITIVE_INFINITY;
				var minPwdLen = 1;	
				
				if(item.attrs[LaAccount.A_COSId]) {
					myCos = new LaCos(this._app);
					myCos.load("id", item.attrs[LaAccount.A_COSId]);
					if(myCos.attrs[LaCos.A_minPwdLength] > 0) {
						minPwdLen = myCos.attrs[LaCos.A_minPwdLength];
					}
					if(myCos.attrs[LaCos.A_maxPwdLength] > 0) {
						maxPwdLen = myCos.attrs[LaCos.A_maxPwdLength];
					}		
				}			
				var szPwd = this._chngPwdDlg.getPassword();
				if(szPwd.length < minPwdLen || LsStringUtil.trim(szPwd).length < minPwdLen) { 
					//show error msg
					this._chngPwdDlg.popdown();
					this._errorMsgDlg = new LaMsgDialog(this._appView.shell, null, [DwtDialog.OK_BUTTON], this._app);												
					this._errorMsgDlg.setMessage(LaMsg.ERROR_PASSWORD_TOOSHORT + "<br>" + LaMsg.NAD_passMinLength + ": " + minPwdLen, null, DwtMessageDialog.CRITICAL_STYLE, null);
					this._errorMsgDlg.popup();
				} else if(LsStringUtil.trim(szPwd).length > maxPwdLen) { 
					//show error msg
					this._chngPwdDlg.popdown();
					this._errorMsgDlg = new LaMsgDialog(this._appView.shell, null, [DwtDialog.OK_BUTTON], this._app);																	
					this._errorMsgDlg.setMessage(LaMsg.ERROR_PASSWORD_TOOLONG+ "<br>" + LaMsg.NAD_passMaxLength + ": " + maxPwdLen, null, DwtMessageDialog.CRITICAL_STYLE, null);
					this._errorMsgDlg.popup();
				} else {		
					item.changePassword(szPwd);
					this._chngPwdDlg.popdown();	//close the dialog
				}
			}
			if (this._chngPwdDlg.getMustChangePassword()) {
				//item.attrs[LaAccount.A_liquidPasswordMustChange] = "TRUE";
				var mods = new Object();
				mods[LaAccount.A_liquidPasswordMustChange] = "TRUE";
				item.modify(mods);
			}

		} catch (ex) {
			this._chngPwdDlg.popdown();
			if(ex.code == LsCsfeException.INVALID_PASSWORD ) {
				var szMsg = LaMsg.ERROR_PASSWORD_INVALID;
				if(ex.detail) {
					szMsg +="<br>Details:<br>";
					szMsg += ex.detail;
				}
				this._msgDialog.setMessage(szMsg, null, DwtMessageDialog.CRITICAL_STYLE, null);
				this._msgDialog.popup();
			} else {
				this._handleException(ex, "LaAccountListController._changePwdOKCallback", null, false);			
			}
			return;
		}
	}
}

LaAccountListController.prototype._changeActionsState = 
function () {
	var cnt = this._contentView.getSelectionCount();
	if(cnt == 1) {
		var opsArray = [LaOperation.EDIT, LaOperation.DELETE, LaOperation.CHNG_PWD, LaOperation.VIEW_MAIL];
		this._toolbar.enable(opsArray, true);
		this._actionMenu.enable(opsArray, true);
	} else if (cnt > 1){
		var opsArray1 = [LaOperation.EDIT, LaOperation.CHNG_PWD, LaOperation.VIEW_MAIL];
		this._toolbar.enable(opsArray1, false);
		this._actionMenu.enable(opsArray1, false);

		var opsArray2 = [LaOperation.DELETE];
		this._toolbar.enable(opsArray2, true);
		this._actionMenu.enable(opsArray2, true);
	} else {
		var opsArray = [LaOperation.EDIT, LaOperation.DELETE, LaOperation.CHNG_PWD, LaOperation.VIEW_MAIL];
		this._toolbar.enable(opsArray, false);
		this._actionMenu.enable(opsArray, false);
	}
}


LaAccountListController.prototype._restoreMailListener = 
function (ev) {
	try {
		this._newSingleAccountRestoreWizard = new SingleAccountRestoreXWizard(this._container, this._app);		
		var restore = new LaRestore(this._app);
		this._newSingleAccountRestoreWizard.setObject(restore);		
		this._newSingleAccountRestoreWizard.popup();
//		var serverId = this._app.getServerList().getArray()[0].id;
	//	LaBackup.queryBackups(serverId, null, null, null, "1");
	} catch (ex) {
		this._handleException(ex, "LaAccountListController.prototype._restoreMailListener", null, false);
	}
	return;
}

