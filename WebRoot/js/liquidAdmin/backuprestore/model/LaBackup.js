/**
* @class LaBackup
* @contructor LaBackup
* @param LaApp app
* this class is a model for doing backup and restore operations
* @author Greg Solovyev
**/
function LaBackup(app) {
	LaItem.call(this, app);
	this.label = "";
	this.server = "";
	this.accounts = null;
	this.live=0;
	this[LaModel.currentStep] = 1;
}

LaBackup.prototype = new LaItem;
LaBackup.prototype.constructor = LaBackup;

LaBackup.prototype.initFromDom = 
function (node) {
	this.accounts = new Array();
	var queryNode = node.firstChild;
	var accountsList = queryNode.getAttribute("accounts");
	if (accountsList) {
		if(accountsList.indexOf(",") > 0) {
			this.accounts = accountsList.split(",");
		} else {
			this.accounts.push(accountsList);
		}
	}
	this.label = queryNode.getAttribute("label");
	this.live = parseInt(queryNode.getAttribute("live"));
}

/**
* @method static queryBackups
* @param serverId:string - liquidId of the server to which the SOAP request will be sent
* @param target:string - path to the location of backups
* @param label:string
* @param fromDate:timestamp
* @param verbose:Boolean
* @param callback:LsCallback - callback that will be invoked by LsCsfeAsynchCommand
**/
LaBackup.queryBackups = 
function (serverId, target, label, fromDate, verbose, callback) {
	var soapDoc = LsSoapDoc.create("BackupQueryRequest", "urn:liquidAdmin", null);
	var queryEl = soapDoc.set("query", "");
	if(target) {
		queryEl.setAttribute("target", target);
	}
	if(label) {
		queryEl.setAttribute("label", label);
	}
	if(fromDate) {
		queryEl.setAttribute("list", fromDate);
	}
	if(verbose) {
		queryEl.setAttribute("verbose", verbose);
	}
	var asynCommand = new LsCsfeAsynchCommand();
	asynCommand.addInvokeListener(callback);
	asynCommand.invoke(soapDoc, false, null, serverId, true);	
}

/**
* @method static queryAccountBackup
* @param serverId:string - liquidId of the server to which the SOAP request will be sent
* @param target:string - path to the location of backups
* @param accounts:Array - array of account names 
* @param callback:LsCallback - callback that will be invoked by LsCsfeAsynchCommand
**/
LaBackup.queryAccountBackup = 
function (serverId, target, accounts, callback) {
	var soapDoc = LsSoapDoc.create("BackupAccountQueryRequest", "urn:liquidAdmin", null);
	var queryEl = soapDoc.set("query", "");
	if(target) {
		queryEl.setAttribute("target", target);
	}
	if(!accounts) {
		throw(new LsException("accounts parameter cannot be null", LsException.INVALID_PARAM, "LaBackup.queryAccountBackup", LaMsg.ERROR_BACKUP_1));
	} 
	var cnt = accounts.length;
	for(var i = 0; i < cnt; i ++) {
		var accEl = soapDoc.set("a", "", queryEl);
		accEl.setAttribute("name", accounts[i]);
	}
	var asynCommand = new LsCsfeAsynchCommand();
	asynCommand.addInvokeListener(callback);
	asynCommand.invoke(soapDoc, false, null, serverId, true);	
}

