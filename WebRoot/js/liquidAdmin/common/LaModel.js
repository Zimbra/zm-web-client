// LaModel is data with a change listener.
function LaModel(init) {
 	if (arguments.length == 0) return;

	this._evtMgr = new LsEventMgr();
}

LaModel.prototype.toString = 
function() {
	return "LaModel";
}

LaModel.prototype.addChangeListener = 
function(listener) {
	return this._evtMgr.addListener(LaEvent.L_MODIFY, listener);
}

LaModel.prototype.removeChangeListener = 
function(listener) {
	return this._evtMgr.removeListener(LaEvent.L_MODIFY, listener);    	
}

LaModel.BOOLEAN_CHOICES= [{value:"TRUE", label:"Yes"}, {value:"FALSE", label:"No"}, {value:null, label:"No"}];
LaModel.BOOLEAN_CHOICES1= [{value:1, label:"Yes"}, {value:0, label:"No"}, {value:null, label:"No"}];

LaModel.COMPOSE_FORMAT_CHOICES = [{value:"text", label:"Text"}, {value:"html", label:"HTML"}];
LaModel.GROUP_MAIL_BY_CHOICES = [{value:"conversation", label:"Conversation"}, {value:"message", label:"Message"}];
LaModel.SIGNATURE_STYLE_CHOICES = [{value:"outlook", label:"Outlook"}, {value:"internet", label:"Internet"}];
LaModel.ErrorCode = "code";
LaModel.ErrorMessage = "error_message";
LaModel.currentStep = "currentStep";
LaModel.currentTab = "currentTab";