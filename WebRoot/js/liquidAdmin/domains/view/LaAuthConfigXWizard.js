function LaAuthConfigXWizard (parent, app) {
	LaXWizardDialog.call(this, parent, null, LaMsg.NCD_AuthConfigTitle, "550px", "300px");

	this.stepChoices = [
		{label:LaMsg.TABT_AuthMode, value:1},				
		{label:LaMsg.TABT_AuthSettings, value:2},						
		{label:LaMsg.TABT_TestAuthSettings, value:3},				
		{label:LaMsg.TABT_AuthTestResult, value:4}
	];
	
	this.AuthMechs = [
		{label:LaMsg.AuthMech_liquid, value:LaDomain.AuthMech_liquid},
		{label:LaMsg.AuthMech_ldap, value:LaDomain.AuthMech_ldap},
		{label:LaMsg.AuthMech_ad, value:LaDomain.AuthMech_ad}		
	];

	this.TestResultChoices = [
		{label:LaMsg.AuthTest_check_OK, value:LaDomain.Check_OK},
		{label:LaMsg.AuthTest_check_UNKNOWN_HOST, value:LaDomain.Check_UNKNOWN_HOST},
		{label:LaMsg.AuthTest_check_CONNECTION_REFUSED, value:LaDomain.Check_CONNECTION_REFUSED},
		{label:LaMsg.AuthTest_check_SSL_HANDSHAKE_FAILURE, value:LaDomain.Check_SSL_HANDSHAKE_FAILURE},				
		{label:LaMsg.AuthTest_check_COMMUNICATION_FAILURE, value:LaDomain.Check_COMMUNICATION_FAILURE},
		{label:LaMsg.AuthTest_check_AUTH_FAILED, value:LaDomain.Check_AUTH_FAILED},
		{label:LaMsg.AuthTest_check_AUTH_NOT_SUPPORTED, value:LaDomain.Check_AUTH_NOT_SUPPORTED},
		{label:LaMsg.AuthTest_check_NAME_NOT_FOUND, value:LaDomain.Check_NAME_NOT_FOUND},
		{label:LaMsg.AuthTest_check_INVALID_SEARCH_FILTER, value:LaDomain.Check_INVALID_SEARCH_FILTER},
		{label:LaMsg.AuthTest_check_FAILURE, value:LaDomain.Check_FAILURE}												
	];
	this.initForm(LaDomain.myXModel,this.getMyXForm());		
}

LaAuthConfigXWizard.prototype = new LaXWizardDialog;
LaAuthConfigXWizard.prototype.constructor = LaAuthConfigXWizard;

LaAuthConfigXWizard.prototype.generateLDAPUrl = 
function () {
	var ldapURL = "";
	if(this._containedObject.attrs[LaDomain.A_AuthLDAPUseSSL] == "TRUE") {
		ldapURL +="ldaps://";
	} else {
		ldapURL +="ldap://";
	}
	ldapURL +=this._containedObject.attrs[LaDomain.A_AuthLDAPServerName];
	ldapURL +=":";
	ldapURL +=this._containedObject.attrs[LaDomain.A_AuthLDAPServerPort];
	ldapURL +="/";
	this._containedObject.attrs[LaDomain.A_AuthLdapURL] = ldapURL;
}

LaAuthConfigXWizard.prototype.testSetings =
function () {
	if(this._containedObject.attrs[LaDomain.A_AuthMech] == LaDomain.AuthMech_ad) {
		this._containedObject.attrs[LaDomain.A_AuthLdapUserDn] = "%u@"+this._containedObject.attrs[LaDomain.A_AuthADDomainName];
	}

	var callback = new LsCallback(this, this.checkCallBack);
	LaDomain.testAuthSettings(this._containedObject, callback);	
}

/**
* Callback function invoked by Asynchronous CSFE command when "check" call returns
**/
LaAuthConfigXWizard.prototype.checkCallBack = 
function (arg) {
	if(arg instanceof LsException || arg instanceof LsCsfeException || arg instanceof LsSoapException) {
		this._containedObject[LaDomain.A_AuthTestResultCode] = arg.code;
		this._containedObject[LaDomain.A_AuthTestMessage] = arg.detail;
	} else {
		this._containedObject[LaDomain.A_AuthTestResultCode] = arg.getBody().firstChild.firstChild.firstChild.nodeValue;
		if(this._containedObject[LaDomain.A_AuthTestResultCode] != LaDomain.Check_OK) {
			this._containedObject[LaDomain.A_AuthTestMessage] = arg.getBody().firstChild.childNodes[1].firstChild.nodeValue;		
			this._containedObject[LaDomain.A_AuthComputedBindDn] = arg.getBody().firstChild.lastChild.firstChild.nodeValue;		
		}
	}
	this._button[DwtWizardDialog.NEXT_BUTTON].setEnabled(false);
	this._button[DwtWizardDialog.PREV_BUTTON].setEnabled(true);
	this._button[DwtWizardDialog.FINISH_BUTTON].setEnabled(true);
	this.goPage(4);
}

/**
* Eevent handlers for form items
**/
LaAuthConfigXWizard.onAuthMechChange = 
function (value, event, form) {
	this.setInstanceValue(value);
	if(value == LaDomain.AuthMech_ldap) {
		if(!form.getInstance().attrs[LaDomain.A_AuthLdapUserDn]) {
			form.getInstance().attrs[LaDomain.A_AuthLdapUserDn] = "%u,%D";
		}
	} 
	if(value == LaDomain.AuthMech_ldap || value == LaDomain.AuthMech_ad) {
		form.getInstance().attrs[LaDomain.A_AuthLDAPServerPort] = 389;
		form.getInstance().attrs[LaDomain.A_AuthLDAPUseSSL] = "FALSE";
	}
	if(value == LaDomain.AuthMech_ad) {
		if(!form.getInstance().attrs[LaDomain.A_AuthADDomainName]) {
			form.getInstance().attrs[LaDomain.A_AuthADDomainName] = form.getInstance().attrs[LaDomain.A_domainName];
		}
	}
	if(value == LaDomain.AuthMech_liquid) {
		form.parent._button[DwtWizardDialog.FINISH_BUTTON].setEnabled(true);
		form.parent._button[DwtWizardDialog.NEXT_BUTTON].setEnabled(false);
	} else {
		form.parent._button[DwtWizardDialog.FINISH_BUTTON].setEnabled(false);
		form.parent._button[DwtWizardDialog.NEXT_BUTTON].setEnabled(true);		
	}
}

LaAuthConfigXWizard.onLDAPPortChange = 
function (value, event, form) {
	this.setInstanceValue(value);
	form.parent.generateLDAPUrl();
	
}

LaAuthConfigXWizard.onLDAPServerChange = 
function (value, event, form) {
	this.setInstanceValue(value);	
	form.parent.generateLDAPUrl();
}

LaAuthConfigXWizard.onLDAPUseSSLChange = 
function (value, event, form) {
	if(value == "TRUE") {
		form.getInstance().attrs[LaDomain.A_AuthLDAPServerPort] = 636;
	} else {
		form.getInstance().attrs[LaDomain.A_AuthLDAPServerPort] = 389;
	}	
	this.setInstanceValue(value);	
	form.parent.generateLDAPUrl();
}
/**
* Overwritten methods that control wizard's flow (open, go next,go previous, finish)
**/
LaAuthConfigXWizard.prototype.popup = 
function (loc) {
	LaXWizardDialog.prototype.popup.call(this, loc);
	this._button[DwtWizardDialog.NEXT_BUTTON].setText(DwtMsg._next);
	this._button[DwtWizardDialog.PREV_BUTTON].setEnabled(false);		
	if(this._containedObject.attrs[LaDomain.A_AuthMech] == LaDomain.AuthMech_liquid) {
		this._button[DwtWizardDialog.FINISH_BUTTON].setEnabled(true);
		this._button[DwtWizardDialog.NEXT_BUTTON].setEnabled(false);		
	} else {
		this._button[DwtWizardDialog.FINISH_BUTTON].setEnabled(false);
		this._button[DwtWizardDialog.NEXT_BUTTON].setEnabled(true);				
	}	
}

LaAuthConfigXWizard.prototype.goPrev =
function () {
	if(this._containedObject[LaModel.currentStep] == 4) {
		//skip 3rd step
		this._button[DwtWizardDialog.NEXT_BUTTON].setText(LaMsg.Domain_AuthTestSettings);
		this._button[DwtWizardDialog.NEXT_BUTTON].setEnabled(true);
		this._button[DwtWizardDialog.FINISH_BUTTON].setEnabled(false);
		this.goPage(2);
	} else {
		this._button[DwtWizardDialog.NEXT_BUTTON].setText(DwtMsg._next);
		if(this._containedObject[LaModel.currentStep] == 2) {
			this._button[DwtWizardDialog.PREV_BUTTON].setEnabled(false);
		}
		this.goPage(this._containedObject[LaModel.currentStep]-1);
	}
}

LaAuthConfigXWizard.prototype.goNext = 
function() {
	if(this._containedObject[LaModel.currentStep] == 1) {
		//change next button to "test"
		this._button[DwtWizardDialog.NEXT_BUTTON].setText(LaMsg.Domain_AuthTestSettings);
		this._button[DwtWizardDialog.PREV_BUTTON].setEnabled(true);
		this._button[DwtWizardDialog.FINISH_BUTTON].setEnabled(false);
		this.goPage(2);
	} else if(this._containedObject[LaModel.currentStep] == 2) {
 		this.testSetings();
		this.goPage(3);
		this._button[DwtWizardDialog.NEXT_BUTTON].setText(DwtMsg._next);
		this._button[DwtWizardDialog.NEXT_BUTTON].setEnabled(false);
		this._button[DwtWizardDialog.PREV_BUTTON].setEnabled(false);
		this._button[DwtWizardDialog.FINISH_BUTTON].setEnabled(false);
	} 
}

/**
* @method setObject sets the object contained in the view
* @param entry - LaDomain object to display
**/
LaAuthConfigXWizard.prototype.setObject =
function(entry) {
	this._containedObject = new Object();
	this._containedObject.attrs = new Object();

	for (var a in entry.attrs) {
		this._containedObject.attrs[a] = entry.attrs[a];
	}
	
	this._containedObject[LaModel.currentStep] = 1;
	this._localXForm.setInstance(this._containedObject);	
}

/**
* XForm definition
**/
LaAuthConfigXWizard.prototype.getMyXForm = 
function () {
	var xFormObject = {
		items:[
			{type:_OUTPUT_, colSpan:2, align:_CENTER_, valign:_TOP_, ref:LaModel.currentStep, choices:this.stepChoices},
			{type:_SEPARATOR_, align:_CENTER_, valign:_TOP_},
			{type:_SPACER_,  align:_CENTER_, valign:_TOP_},				
			{type:_SWITCH_,
				items:[
					{type:_CASE_, relevant:"instance[LaModel.currentStep] == 1", relevantBehavior:_HIDE_,
						items:[
							{type:_OSELECT1_, label:LaMsg.Domain_AuthMech, choices:this.AuthMechs, ref:LaDomain.A_AuthMech, onChange:LaAuthConfigXWizard.onAuthMechChange},
							{type:_SWITCH_,
								items: [
									{type:_CASE_, relevant:"instance.attrs[LaDomain.A_AuthMech]==LaDomain.AuthMech_ad",
										items:[
											{ref:LaDomain.A_AuthLDAPServerName, type:_INPUT_, label:LaMsg.Domain_AuthADServerName, labelLocation:_LEFT_, onChange:LaAuthConfigXWizard.onLDAPServerChange},
											{ref:LaDomain.A_AuthADDomainName, type:_INPUT_, label:LaMsg.Domain_AuthADDomainName, labelLocation:_LEFT_},
											{ref:LaDomain.A_AuthLDAPServerPort, type:_INPUT_, label:LaMsg.Domain_AuthADServerPort, labelLocation:_LEFT_, onChange:LaAuthConfigXWizard.onLDAPPortChange},
											{ref:LaDomain.A_AuthLDAPUseSSL, type:_CHECKBOX_, label:LaMsg.Domain_AuthADUseSSL, labelLocation:_LEFT_,trueValue:"TRUE", falseValue:"FALSE", onChange:LaAuthConfigXWizard.onLDAPUseSSLChange,labelCssClass:"xform_label", align:_LEFT_}
										]
									},
									{type:_CASE_, relevant:"instance.attrs[LaDomain.A_AuthMech]==LaDomain.AuthMech_ldap",
										items:[
											{ref:LaDomain.A_AuthLDAPServerName, type:_INPUT_, label:LaMsg.Domain_AuthLDAPServerName, labelLocation:_LEFT_, onChange:LaAuthConfigXWizard.onLDAPServerChange},
											{ref:LaDomain.A_AuthLDAPServerPort, type:_INPUT_, label:LaMsg.Domain_AuthLDAPServerPort, labelLocation:_LEFT_, onChange:LaAuthConfigXWizard.onLDAPServerChange},							
											{ref:LaDomain.A_AuthLDAPUseSSL, type:_CHECKBOX_, label:LaMsg.Domain_AuthLDAPUseSSL, labelLocation:_LEFT_,trueValue:"TRUE", falseValue:"FALSE", onChange:LaAuthConfigXWizard.onLDAPUseSSLChange,labelCssClass:"xform_label", align:_LEFT_},
											{ref:LaDomain.A_AuthLdapUserDn, type:_INPUT_, label:LaMsg.Domain_AuthLdapUserDn, labelLocation:_LEFT_},
//											{ref:LaDomain.A_AuthLdapURL, type:_OUTPUT_, label:LaMsg.Domain_AuthLdapURL, labelLocation:_LEFT_},
											{type:_OUTPUT_, value:LaMsg.NAD_DomainsAuthStr, colSpan:2},												
											
										]
									},
									{type:_CASE_, relevant:"instance.attrs[LaDomain.A_AuthMech]==LaDomain.AuthMech_liquid",
										items:[
											{type:_OUTPUT_, value:LaMsg.Domain_Auth_Config_Complete}
										]
									}
								]
							}
						]
					},
					{type:_CASE_, numCols:2, relevant:"instance[LaModel.currentStep] == 2 && instance.attrs[LaDomain.A_AuthMech]!=LaDomain.AuthMech_liquid", relevantBehavior:_HIDE_,
						items: [
							{type:_OUTPUT_, value:LaMsg.Domain_Auth_ConfigSummary, align:_CENTER_, colSpan:"*"}, 
							{type:_SPACER_, height:10},
							{ref:LaDomain.A_AuthMech, type:_OUTPUT_, label:LaMsg.Domain_AuthMech, choices:this.AuthMechs, alignment:_LEFT_},
							{type:_SWITCH_, useParentTable:true,
								items: [
									{type:_CASE_, relevant:"instance.attrs[LaDomain.A_AuthMech]==LaDomain.AuthMech_ad", useParentTable:true,
										items:[
											{ref:LaDomain.A_AuthLDAPServerName, type:_OUTPUT_, label:LaMsg.Domain_AuthADServerName, labelCssClass:"xform_label_left"},
											{ref:LaDomain.A_AuthADDomainName, type:_OUTPUT_, label:LaMsg.Domain_AuthADDomainName, labelLocation:_LEFT_},
											{ref:LaDomain.A_AuthLDAPServerPort, type:_OUTPUT_, label:LaMsg.Domain_AuthADServerPort, labelLocation:_LEFT_},
											{ref:LaDomain.A_AuthLDAPUseSSL, type:_OUTPUT_, label:LaMsg.Domain_AuthADUseSSL, labelWrap:true, labelLocation:_LEFT_,choices:LaModel.BOOLEAN_CHOICES}
										]
									},
									{type:_CASE_, relevant:"instance.attrs[LaDomain.A_AuthMech]==LaDomain.AuthMech_ldap", useParentTable:true,
										items:[
											{ref:LaDomain.A_AuthLDAPServerName, type:_OUTPUT_, label:LaMsg.Domain_AuthLDAPServerName, labelLocation:_LEFT_},
											{ref:LaDomain.A_AuthLDAPServerPort, type:_OUTPUT_, label:LaMsg.Domain_AuthLDAPServerPort, labelLocation:_LEFT_},							
											{ref:LaDomain.A_AuthLDAPUseSSL, type:_OUTPUT_, label:LaMsg.Domain_AuthLDAPUseSSL, labelLocation:_LEFT_,choices:LaModel.BOOLEAN_CHOICES},
											{ref:LaDomain.A_AuthLdapUserDn, type:_OUTPUT_, label:LaMsg.Domain_AuthLdapUserDn, labelLocation:_LEFT_},
										]
									}
								]
							},
							{type:_SPACER_, height:10},
							{type:_OUTPUT_,value:LaMsg.Domain_AuthProvideLoginPwd, align:_CENTER_, colSpan:"*"},
							{type:_INPUT_, label:LaMsg.Domain_AuthTestUserName, ref:LaDomain.A_AuthTestUserName, alignment:_LEFT_},
							{type:_SECRET_, label:LaMsg.Domain_AuthTestPassword, ref:LaDomain.A_AuthTestPassword, alignment:_LEFT_}
						]
					},
					{type:_CASE_, relevant:"instance[LaModel.currentStep] == 3 && instance.attrs[LaDomain.A_AuthMech]!=LaDomain.AuthMech_liquid", relevantBehavior:_HIDE_,
						items: [
							{type:_OUTPUT_,value:LaMsg.Domain_AuthTestingInProgress}
						]
					},
					{type:_CASE_,  numCols:1, relevant:"instance[LaModel.currentStep] == 4 && instance.attrs[LaDomain.A_AuthMech]!=LaDomain.AuthMech_liquid", relevantBehavior:_HIDE_,
						items: [
							{type:_OUTPUT_,value:LaMsg.Domain_AuthTestResults, alignment:_CENTER_},
							{type:_SWITCH_,
								items: [
									{type:_CASE_, relevant:"instance[LaDomain.A_AuthTestResultCode] == LaDomain.Check_OK",
										items: [
											{type:_OUTPUT_, value:LaMsg.Domain_AuthTestSuccessful, alignment:_CENTER_}
										]
									},
									{type:_CASE_, relevant:	"instance[LaDomain.A_AuthTestResultCode] != LaDomain.Check_OK",
										items: [
											{type:_OUTPUT_, value:LaMsg.Domain_AuthTestFailed, alignment:_CENTER_},
											{type:_OUTPUT_, ref:LaDomain.A_AuthTestResultCode, label:LaMsg.Domain_AuthTestResultCode, choices:this.TestResultChoices, alignment:_LEFT_},
											{type:_OUTPUT_, ref:LaDomain.A_AuthComputedBindDn, label:LaMsg.Domain_AuthComputedBindDn, alignment:_LEFT_},
											{type:_TEXTAREA_, ref:LaDomain.A_AuthTestMessage, label:LaMsg.Domain_AuthTestMessage, height:150, width:200, alignment:_LEFT_}
										]
									}
								]
							}
						]
					}
				]
			}
		]
	};
	return xFormObject;
};

