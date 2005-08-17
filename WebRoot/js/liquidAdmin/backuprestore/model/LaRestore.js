/**
* @class LaRestore
* @contructor LaRestore
* @param LaApp app
* this class is a model for doing backup and restore operations
* @author Greg Solovyev
**/
function LaRestore(app) {
	LaItem.call(this, app);
	this[LaModel.currentStep] = 1;
	this.restoreRequest = new Object();
	this.accounts = new Array();
	this.restoreRequest[LaRestore.A_accountName] = "";
	this.restoreRequest[LaRestore.A_accountNames] = new Array();
	this.restoreRequest[LaRestore.A_restoreMethod] = "mb";
	this.restoreRequest[LaRestore.A_includeIncrementals] = "FALSE";	//soap servlet uses 'TRUE'/'FALSE' literal values everywhere else
	this.restoreRequest[LaRestore.A_prefix] = "restored_";		
	this.restoreRequest[LaRestore.A_toServer] = "";	
	this.restoreRequest[LaRestore.A_originalServer] = "";			
	this.restoreRequest[LaRestore.A_target] = "/opt/liquid/backup";				
}

LaRestore.prototype = new LaItem;
LaRestore.prototype.constructor = LaRestore;

LaRestore.MB = "mb";
LaRestore.RA = "ra";
LaRestore.CA = "ca";

LaRestore.RESTORE_CREATE_CHOICES = [{value:LaRestore.MB, label:"Restore mailbox only"}, {value:LaRestore.RA, label:"Restore mailbox and LDAP record"}, {value:LaRestore.CA, label:"Restore mailbox into a new account"}];

LaRestore.A_accountNames = "accountNames";
LaRestore.A_accountName = "accountName";
LaRestore.A_label = "label";
LaRestore.A_prefix = "prefix";
LaRestore.A_target="target";
LaRestore.A_restoreMethod = "method";
LaRestore.A_toServer="toServer";
LaRestore.A_originalServer="originalServer";
LaRestore.A_includeIncrementals = "includeIncrementals";

LaRestore.myXModel = new Object();
LaRestore.myXModel.items = new Array();
LaRestore.myXModel.items.push({id:LaRestore.A_includeIncrementals, ref:"restoreRequest/" + LaRestore.A_includeIncrementals, type:_ENUM_, choices:LaModel.BOOLEAN_CHOICES});
LaRestore.myXModel.items.push({id:LaRestore.A_accountName, ref:"restoreRequest/" + LaRestore.A_accountName, type:_STRING_, pattern:/^([a-zA-Z0-9_\-])+((\.)?([a-zA-Z0-9_\-])+)*@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/});
LaRestore.myXModel.items.push({id:LaRestore.A_accountNames, type:_LIST_, ref:"restoreRequest/" + LaRestore.A_accountNames, listItem:{type:_STRING_}});
LaRestore.myXModel.items.push({id:LaRestore.A_restoreMethod, type:_ENUM_, ref:"restoreRequest/" + LaRestore.A_restoreMethod, choices:LaRestore.RESTORE_CREATE_CHOICES});
LaRestore.myXModel.items.push({id:LaRestore.A_target, type:_STRING_, ref:"restoreRequest/"+LaRestore.A_target});
LaRestore.myXModel.items.push({id:LaRestore.A_prefix, type:_STRING_, ref:"restoreRequest/"+LaRestore.A_prefix});
LaRestore.myXModel.items.push({id:LaRestore.A_label, type:_STRING_, ref:"restoreRequest/"+LaRestore.A_label});
LaRestore.myXModel.items.push({id:LaRestore.A_toServer, type:_STRING_, ref:"restoreRequest/"+LaRestore.A_toServer});
LaRestore.myXModel.items.push({id:LaRestore.A_originalServer, type:_STRING_, ref:"restoreRequest/"+LaRestore.A_originalServer});
LaRestore.myXModel.items.push({id:LaModel.currentStep, type:_NUMBER_, ref:LaModel.currentStep});

/**
* @method static restoreAccount
* @param method:string  - mb/ra/ca
* @param includeIncrementals:booelan 
* @param label:string 
* @param target:string - path to the location of backups
* @param prefix:string 
* @param accounts:Array - array of account names 
* @param serverId:string - liquidId of the server to which the SOAP request will be sent
* @param callback:LsCallback - callback that will be invoked by LsCsfeAsynchCommand
**/
LaRestore.restoreAccount = 
function (method, includeIncrementals, label, target, prefix, accounts, serverId, callback) {
	var soapDoc = LsSoapDoc.create("RestoreRequest", "urn:liquidAdmin", null);
	var restoreEl = soapDoc.set("restore", "");
	if(!method) {
		throw(new LsException("method parameter cannot be null", LsException.INVALID_PARAM, "LaRestore.restoreAccount", LaMsg.ERROR_RESTORE_3));
	}
	if(!accounts) {
		throw(new LsException("accounts parameter cannot be null", LsException.INVALID_PARAM, "LaRestore.restoreAccount", LaMsg.ERROR_RESTORE_2));
	} 
	if(method == LaRestore.CA && (!prefix || prefix.length < 1)) {
		throw(new LsException("accounts parameter cannot be null", LsException.INVALID_PARAM, "LaRestore.restoreAccount", LaMsg.ERROR_RESTORE_1));
	}
	restoreEl.setAttribute("method", method);
	if(label) {
		restoreEl.setAttribute("label", label);
	}
	if(target) {
		restoreEl.setAttribute("target", target);
	}
	if(prefix) {
		restoreEl.setAttribute("prefix", prefix);
	}
	
	if(includeIncrementals == "TRUE") {
		restoreEl.setAttribute("includeIncrementals", "1");
	} else {
		restoreEl.setAttribute("includeIncrementals", "0");
	}
	var cnt = accounts.length;
	var el = null;
	for(var i = 0; i < cnt; i ++) {
		el = soapDoc.set("a", "", restoreEl);
		el.setAttribute("name", accounts[i]);
	}
	var asynCommand = new LsCsfeAsynchCommand();
	asynCommand.addInvokeListener(callback);
	asynCommand.invoke(soapDoc, false, null, serverId, true);	
}