function LaNewDomainXWizard (parent, app) {
	this._app=app;
	LaXWizardDialog.call(this, parent, null, LaMsg.NDD_Title, "550px", "300px");

	this.stepChoices = [
		{label:LaMsg.TABT_GeneralPage, value:1},
		{label:LaMsg.TABT_GALMode, value:2},
		{label:LaMsg.TABT_GALonfiguration, value:3}, 
		{label:LaMsg.TABT_GALonfiguration, value:4},		
		{label:LaMsg.TABT_GALonfigSummary, value:5},
		{label:LaMsg.TABT_TestGalConfig, value:6},
		{label:LaMsg.TABT_GalTestResult, value:7},		
		{label:LaMsg.TABT_AuthMode, value:8},				
		{label:LaMsg.TABT_AuthSettings, value:9},						
		{label:LaMsg.TABT_TestAuthSettings, value:10},				
		{label:LaMsg.TABT_AuthTestResult, value:11},
		{label:LaMsg.TABT_DomainConfigComplete, value:12}		
	];
		
	this.GALModes = [
		{label:LaMsg.GALMode_internal, value:LaDomain.GAL_Mode_internal},
		{label:LaMsg.GALMode_external, value:LaDomain.GAL_Mode_external}, 
		{label:LaMsg.GALMode_both, value:LaDomain.GAL_Mode_both}
  	];
  	this.GALServerTypes = [
		{label:LaMsg.GALServerType_ldap, value:LaDomain.GAL_ServerType_ldap},
		{label:LaMsg.GALServerType_ad, value:LaDomain.GAL_ServerType_ad} 
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

LaNewDomainXWizard.prototype = new LaXWizardDialog;
LaNewDomainXWizard.prototype.constructor = LaNewDomainXWizard;

/**
* @method setObject sets the object contained in the view
* @param entry - LaDomain object to display
**/
LaNewDomainXWizard.prototype.setObject =
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
* GAL configuration
**/

LaNewDomainXWizard.prototype.generateGALLDAPUrl = 
function () {
	var ldapURL = "";
	if(this._containedObject.attrs[LaDomain.A_GALUseSSL] == "TRUE") {
		ldapURL +="ldaps://";
	} else {
		ldapURL +="ldap://";
	}
	ldapURL +=this._containedObject.attrs[LaDomain.A_GALServerName];
	ldapURL +=":";
	ldapURL +=this._containedObject.attrs[LaDomain.A_GALServerPort];
	ldapURL +="/";
	this._containedObject.attrs[LaDomain.A_GalLdapURL] = ldapURL;
}

/**
* static change handlers for the form
**/
LaNewDomainXWizard.onGALServerTypeChange =
function (value, event, form) {
	if(value == "ad") {
		form.getInstance().attrs[LaDomain.A_GalLdapFilter] = "ad";
	} else {
		form.getInstance().attrs[LaDomain.A_GalLdapFilter] = "";
	}
	this.setInstanceValue(value);	
}

LaNewDomainXWizard.onGALUseSSLChange =
function (value, event, form) {
	if(value == "TRUE") {
		form.getInstance().attrs[LaDomain.A_GALServerPort] = 636;
	} else {
		form.getInstance().attrs[LaDomain.A_GALServerPort] = 389;
	}
	this.setInstanceValue(value);
	form.parent.generateGALLDAPUrl();
}

LaNewDomainXWizard.onGALServerChange = 
function (value, event, form) {
	form.getInstance().attrs[LaDomain.A_GALServerName] = value;
	this.setInstanceValue(value);
	form.parent.generateGALLDAPUrl();
}

LaNewDomainXWizard.onGALServerPortChange = 
function (value, event, form) {
	form.getInstance().attrs[LaDomain.A_GALServerPort] = value;
	this.setInstanceValue(value);
	form.parent.generateGALLDAPUrl();
}


LaNewDomainXWizard.onGalModeChange = 
function (value, event, form) {
	this.setInstanceValue(value);
	if(value != "liquid") {
		form.getInstance().attrs[LaDomain.A_GalLdapFilter] = "";
		if(!form.getInstance().attrs[LaDomain.A_GALServerType]) {
			form.getInstance().attrs[LaDomain.A_GALServerType] = "ldap";
		}
		if(!form.getInstance().attrs[LaDomain.A_GalLdapURL]) {
			form.getInstance().attrs[LaDomain.A_GALServerPort] = 389;
			form.getInstance().attrs[LaDomain.A_GalLdapURL] = "";			
			form.getInstance().attrs[LaDomain.A_GALUseSSL] = "FALSE";
			form.getInstance().attrs[LaDomain.A_GALServerName] = "";
			form.getInstance().attrs[LaDomain.A_UseBindPassword] = "TRUE";
		}
		if(!form.getInstance().attrs[LaDomain.A_GalLdapSearchBase]) {
			if(form.getInstance().attrs[LaDomain.A_domainName]) {
				var parts = form.getInstance().attrs[LaDomain.A_domainName].split(".");
				var szSearchBase = "";
				var coma = "";
				for(var ix in parts) {
					szSearchBase += coma;
				 	szSearchBase += "dc=";
				 	szSearchBase += parts[ix];
					var coma = ",";
				}
				form.getInstance().attrs[LaDomain.A_GalLdapSearchBase] = szSearchBase;
			}
		}
	}
}

LaNewDomainXWizard.prototype.testGALSettings =
function () {
	var callback = new LsCallback(this, this.checkGALCallBack);
	LaDomain.testGALSettings(this._containedObject, callback, this._containedObject[LaDomain.A_GALSampleQuery]);	
}

/**
* Callback function invoked by Asynchronous CSFE command when "check" call returns
**/
LaNewDomainXWizard.prototype.checkGALCallBack = 
function (arg) {
	if(arg instanceof LsException || arg instanceof LsCsfeException || arg instanceof LsSoapException) {
		this._containedObject[LaDomain.A_GALTestResultCode] = arg.code;
		this._containedObject[LaDomain.A_GALTestMessage] = arg.detail;
	} else {
		this._containedObject[LaDomain.A_GALTestResultCode] = arg.getBody().firstChild.firstChild.firstChild.nodeValue;
		if(this._containedObject[LaDomain.A_GALTestResultCode] != LaDomain.Check_OK) {
			this._containedObject[LaDomain.A_GALTestMessage] = arg.getBody().firstChild.childNodes[1].firstChild.nodeValue;		
		}
	}
	this._button[DwtWizardDialog.NEXT_BUTTON].setEnabled(true);
	this._button[DwtWizardDialog.PREV_BUTTON].setEnabled(true);
	this._button[DwtWizardDialog.FINISH_BUTTON].setEnabled(false);
	this.goPage(7);
}

/**
* Auth config methods
**/
LaNewDomainXWizard.prototype.generateAuthLDAPUrl = 
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


LaNewDomainXWizard.onUseAuthSSLChange =
function (value, event, form) {
	if(value == "TRUE") {
		form.getInstance().attrs[LaDomain.A_GALServerPort] = 636;
	} else {
		form.getInstance().attrs[LaDomain.A_GALServerPort] = 389;
	}
	this.setInstanceValue(value);
	form.parent.generateAuthLDAPUrl();
}

/**
* Eevent handlers for form items
**/
LaNewDomainXWizard.onAuthMechChange = 
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
}

LaNewDomainXWizard.onAuthLDAPUseSSLChange = 
function (value, event, form) {
	//form.getInstance().attrs[LaDomain.A_AuthLDAPUseSSL] = value;
	if(value == "TRUE") {
		form.getInstance().attrs[LaDomain.A_AuthLDAPServerPort] = 636;
	} else {
		form.getInstance().attrs[LaDomain.A_AuthLDAPServerPort] = 389;
	}	
	this.setInstanceValue(value);	
	form.parent.generateAuthLDAPUrl();
}

LaNewDomainXWizard.onAuthLDAPPortChange = 
function (value, event, form) {
	//form.getInstance().attrs[LaDomain.A_AuthLDAPServerPort] = val;
	this.setInstanceValue(value);
	form.parent.generateAuthLDAPUrl();
	
}

LaNewDomainXWizard.onAuthLDAPServerChange = 
function (value, event, form) {
	this.setInstanceValue(value);	
//	form.getInstance().attrs[LaDomain.A_AuthLDAPServerName] = value;
	form.parent.generateAuthLDAPUrl();
}

LaNewDomainXWizard.prototype.testAuthSettings =
function () {
	if(this._containedObject.attrs[LaDomain.A_AuthMech] == LaDomain.AuthMech_ad) {
		this._containedObject.attrs[LaDomain.A_AuthLdapUserDn] = "%u@"+this._containedObject.attrs[LaDomain.A_AuthADDomainName];
	}

	var callback = new LsCallback(this, this.checkAuthCallBack);
	LaDomain.testAuthSettings(this._containedObject, callback);	
}

/**
* Callback function invoked by Asynchronous CSFE command when "check" call returns
**/
LaNewDomainXWizard.prototype.checkAuthCallBack = 
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
	this.goPage(11);
}

/**
* Overwritten methods that control wizard's flow (open, go next,go previous, finish)
**/
LaNewDomainXWizard.prototype.popup = 
function (loc) {
	LaXWizardDialog.prototype.popup.call(this, loc);
	this._button[DwtWizardDialog.NEXT_BUTTON].setText(DwtMsg._next);
	this._button[DwtWizardDialog.NEXT_BUTTON].setEnabled(true);
	this._button[DwtWizardDialog.FINISH_BUTTON].setEnabled(false);
	this._button[DwtWizardDialog.PREV_BUTTON].setEnabled(false);	
}

LaNewDomainXWizard.prototype.goPrev =
function () {
	if(this._containedObject[LaModel.currentStep] == 7) {
		//skip 6th step
		this._button[DwtWizardDialog.NEXT_BUTTON].setText(LaMsg.Domain_GALTestSettings);
		this._button[DwtWizardDialog.NEXT_BUTTON].setEnabled(true);
		this._button[DwtWizardDialog.FINISH_BUTTON].setEnabled(false);
		this._button[DwtWizardDialog.PREV_BUTTON].setEnabled(true);		
		this.goPage(5);
	} else if (this._containedObject[LaModel.currentStep] == 8 && this._containedObject.attrs[LaDomain.A_GalMode]==LaDomain.GAL_Mode_internal) {
		this.goPage(2);
		this._button[DwtWizardDialog.PREV_BUTTON].setEnabled(true);		
	} else if (this._containedObject[LaModel.currentStep] == 11) {
		//skip 10th step
		this._button[DwtWizardDialog.NEXT_BUTTON].setText(LaMsg.Domain_GALTestSettings);
		this._button[DwtWizardDialog.NEXT_BUTTON].setEnabled(true);
		this._button[DwtWizardDialog.FINISH_BUTTON].setEnabled(false);
		this._button[DwtWizardDialog.PREV_BUTTON].setEnabled(true);
		this.goPage(9);
	} else if(this._containedObject[LaModel.currentStep] == 12) {
		if(this._containedObject.attrs[LaDomain.A_AuthMech] == LaDomain.AuthMech_liquid) {
			this.goPage(8); //skip all auth configuration
		} else {
			this.goPage(11);
		}
	} else {
		this._button[DwtWizardDialog.NEXT_BUTTON].setText(DwtMsg._next);
		if(this._containedObject[LaModel.currentStep] == 2) {
			//disable PREV button on the first step
			this._button[DwtWizardDialog.PREV_BUTTON].setEnabled(false);
		} else {
			this._button[DwtWizardDialog.PREV_BUTTON].setEnabled(true);
		}
		this.goPage(this._containedObject[LaModel.currentStep]-1);
	}
	this._button[DwtWizardDialog.NEXT_BUTTON].setEnabled(true);	
}

LaNewDomainXWizard.prototype.goNext = 
function() {
	if (this._containedObject[LaModel.currentStep] == 1) {
		this._containedObject.attrs[LaDomain.A_AuthADDomainName] = this._containedObject.attrs[LaDomain.A_domainName];
		this._button[DwtWizardDialog.PREV_BUTTON].setEnabled(true);
		this.goPage(2);		
	} else if(this._containedObject[LaModel.currentStep] == 2 && this._containedObject.attrs[LaDomain.A_GalMode]==LaDomain.GAL_Mode_internal) {
		this.goPage(8);
	} else if(this._containedObject[LaModel.currentStep] == 4) {
		//clear the password if the checkbox is unchecked
		if(this._containedObject.attrs[LaDomain.A_UseBindPassword]=="FALSE") {
			this._containedObject.attrs[LaDomain.A_GalLdapBindPassword] = null;
			this._containedObject.attrs[LaDomain.A_GalLdapBindPasswordConfirm] = null;
			this._containedObject.attrs[LaDomain.A_GalLdapBindDn] = null;
		}
		//check that passwords match
		if(this._containedObject.attrs[LaDomain.A_GalLdapBindPassword]!=this._containedObject.attrs[LaDomain.A_GalLdapBindPasswordConfirm]) {
			this._app.getCurrentController().popupMsgDialog(LaMsg.ERROR_PASSWORD_MISMATCH);
			return false;
		}
		//change next button to "test"
		this._button[DwtWizardDialog.NEXT_BUTTON].setText(LaMsg.Domain_GALTestSettings);
		this._button[DwtWizardDialog.PREV_BUTTON].setEnabled(true);
		this._button[DwtWizardDialog.NEXT_BUTTON].setEnabled(true);
		this._button[DwtWizardDialog.FINISH_BUTTON].setEnabled(false);
		this.goPage(this._containedObject[LaModel.currentStep]+1);
	} else if(this._containedObject[LaModel.currentStep] == 5) {
		this.goPage(6);
 		this.testGALSettings();
		this._button[DwtWizardDialog.NEXT_BUTTON].setText(DwtMsg._next);
		this._button[DwtWizardDialog.NEXT_BUTTON].setEnabled(false);
		this._button[DwtWizardDialog.PREV_BUTTON].setEnabled(false);
		this._button[DwtWizardDialog.FINISH_BUTTON].setEnabled(false);
	} else if (this._containedObject[LaModel.currentStep] == 8) {
		this._button[DwtWizardDialog.PREV_BUTTON].setEnabled(true);
		if(this._containedObject.attrs[LaDomain.A_AuthMech]==LaDomain.AuthMech_liquid) {
			this._button[DwtWizardDialog.NEXT_BUTTON].setText(DwtMsg._next);
			this._button[DwtWizardDialog.NEXT_BUTTON].setEnabled(false);
			this._button[DwtWizardDialog.FINISH_BUTTON].setEnabled(true);
			this.goPage(12);		
		} else {
			this._button[DwtWizardDialog.NEXT_BUTTON].setText(LaMsg.Domain_GALTestSettings);
			this._button[DwtWizardDialog.NEXT_BUTTON].setEnabled(true);
			this._button[DwtWizardDialog.FINISH_BUTTON].setEnabled(false);
			this.goPage(9);
		}
	} else if(this._containedObject[LaModel.currentStep] == 9) {
		this.goPage(10);
 		this.testAuthSettings();
		this._button[DwtWizardDialog.NEXT_BUTTON].setText(DwtMsg._next);
		this._button[DwtWizardDialog.NEXT_BUTTON].setEnabled(false);
		this._button[DwtWizardDialog.PREV_BUTTON].setEnabled(false);
		this._button[DwtWizardDialog.FINISH_BUTTON].setEnabled(false);
	} else {
		this.goPage(this._containedObject[LaModel.currentStep] + 1);
		this._button[DwtWizardDialog.PREV_BUTTON].setEnabled(true);
	}
}
LaNewDomainXWizard.prototype.getMyXForm = 
function () {
	var xFormObject = {
		items: [
			{type:_OUTPUT_, colSpan:2, align:_CENTER_, valign:_TOP_, ref:LaModel.currentStep, choices:this.stepChoices},
			{type:_SEPARATOR_, align:_CENTER_, valign:_TOP_},
			{type:_SPACER_,  align:_CENTER_, valign:_TOP_},		
			{type: _SWITCH_,
				items: [
					{type:_CASE_, relevant:"instance[LaModel.currentStep] == 1", relevantBehavior:_HIDE_,
						items: [
							{ref:LaDomain.A_domainName, type:_TEXTFIELD_, label:LaMsg.Domain_DomainName,labelLocation:_LEFT_},
							{ref:LaDomain.A_description, type:_TEXTFIELD_, label:LaMsg.NAD_Description, labelLocation:_LEFT_},
							{ref:LaDomain.A_notes, type:_TEXTAREA_, label:LaMsg.NAD_Notes, labelLocation:_LEFT_, labelCssStyle:"vertical-align:top"}
						]
					},
					{type:_CASE_, relevant:"instance[LaModel.currentStep] == 2", relevantBehavior:_HIDE_,
						items: [
							{ref:LaDomain.A_GalMode, type:_OSELECT1_, label:LaMsg.Domain_GalMode, labelLocation:_LEFT_, choices:this.GALModes, onChange:LaNewDomainXWizard.onGalModeChange},
							{ref:LaDomain.A_GalMaxResults, type:_TEXTFIELD_, label:LaMsg.NAD_GalMaxResults, labelLocation:_LEFT_}					
						]
					},
					{type:_CASE_, numCols:2, relevant:"instance[LaModel.currentStep] == 3 && instance.attrs[LaDomain.A_GalMode]!=LaDomain.GAL_Mode_internal", relevantBehavior:_HIDE_,
						items: [
							{ref:LaDomain.A_GALServerType, type:_OSELECT1_, label:LaMsg.Domain_GALServerType, labelLocation:_LEFT_, choices:this.GALServerTypes, onChange:LaNewDomainXWizard.onGALServerTypeChange},
							{ref:LaDomain.A_GALServerName, type:_TEXTFIELD_, label:LaMsg.Domain_GALServerName, labelLocation:_LEFT_, onChange:LaNewDomainXWizard.onGALServerChange},					
							{ref:LaDomain.A_GALServerPort, type:_TEXTFIELD_, label:LaMsg.Domain_GALServerPort, labelLocation:_LEFT_,onChange:LaNewDomainXWizard.onGALServerPortChange},
							{ref:LaDomain.A_GALUseSSL, type:_CHECKBOX_, label:LaMsg.Domain_GALUseSSL, labelLocation:_LEFT_,trueValue:"TRUE", falseValue:"FALSE", onChange:LaNewDomainXWizard.onGALUseSSLChange,labelCssClass:"xform_label", align:_LEFT_},
							{ref:LaDomain.A_GalLdapFilter, type:_TEXTFIELD_, label:LaMsg.Domain_GalLdapFilter, labelLocation:_LEFT_, relevant:"instance.attrs[LaDomain.A_GALServerType] == 'ldap'", relevantBehavior:_DISABLE_, width:"200px"},
							{ref:LaDomain.A_GalLdapSearchBase, type:_TEXTFIELD_, label:LaMsg.Domain_GalLdapSearchBase, labelLocation:_LEFT_, width:"200px"}
						]
					},
					{type:_CASE_, relevant:"instance[LaModel.currentStep] == 4 && instance.attrs[LaDomain.A_GalMode]!=LaDomain.GAL_Mode_internal", relevantBehavior:_HIDE_,
						items: [
							{ref:LaDomain.A_UseBindPassword, type:_CHECKBOX_, label:LaMsg.Domain_UseBindPassword, labelLocation:_LEFT_,trueValue:"TRUE", falseValue:"FALSE",labelCssClass:"xform_label", align:_LEFT_},
							{ref:LaDomain.A_GalLdapBindDn, type:_TEXTFIELD_, label:LaMsg.Domain_GalLdapBindDn, labelLocation:_LEFT_, relevant:"instance.attrs[LaDomain.A_UseBindPassword] == 'TRUE'", relevantBehavior:_DISABLE_},
							{ref:LaDomain.A_GalLdapBindPassword, type:_SECRET_, label:LaMsg.Domain_GalLdapBindPassword, labelLocation:_LEFT_, relevant:"instance.attrs[LaDomain.A_UseBindPassword] == 'TRUE'", relevantBehavior:_DISABLE_},
							{ref:LaDomain.A_GalLdapBindPasswordConfirm, type:_SECRET_, label:LaMsg.Domain_GalLdapBindPasswordConfirm, labelLocation:_LEFT_, relevant:"instance.attrs[LaDomain.A_UseBindPassword] == 'TRUE'", relevantBehavior:_DISABLE_}														
						]			
					}, 
					{type:_CASE_, relevant:"instance[LaModel.currentStep] == 5", relevantBehavior:_HIDE_,
						items: [
							{type:_OUTPUT_, value:LaMsg.Domain_GAL_ConfigSummary}, 
							{ref:LaDomain.A_GalMode, type:_OUTPUT_, label:LaMsg.Domain_GalMode, choices:this.GALModes},
							{ref:LaDomain.A_GalMaxResults, type:_OUTPUT_, label:LaMsg.NAD_GalMaxResults},
							{type:_SWITCH_, 
								items: [
									{type:_CASE_, relevant:"instance.attrs[LaDomain.A_GalMode]!=LaDomain.GAL_Mode_internal", relevantBehavior:_HIDE_,
										items: [
											{ref:LaDomain.A_GALServerType, type:_OUTPUT_, label:LaMsg.Domain_GALServerType, choices:this.GALServerTypes, labelLocation:_LEFT_},
											{ref:LaDomain.A_GALServerName, type:_OUTPUT_, label:LaMsg.Domain_GALServerName, labelLocation:_LEFT_},					
											{ref:LaDomain.A_GALServerPort, type:_OUTPUT_, label:LaMsg.Domain_GALServerPort, labelLocation:_LEFT_},
											{ref:LaDomain.A_GALUseSSL, type:_OUTPUT_, label:LaMsg.Domain_GALUseSSL, labelLocation:_LEFT_},
											{ref:LaDomain.A_GalLdapFilter, type:_OUTPUT_, label:LaMsg.Domain_GalLdapFilter, labelLocation:_LEFT_, relevant:"instance.attrs[LaDomain.A_GALServerType] == 'ldap'", relevantBehavior:_HIDE_},
											{ref:LaDomain.A_GalLdapSearchBase, type:_OUTPUT_, label:LaMsg.Domain_GalLdapSearchBase, labelLocation:_LEFT_},
											{ref:LaDomain.A_GalLdapURL, type:_OUTPUT_, label:LaMsg.Domain_GalLdapURL, labelLocation:_LEFT_},
											{ref:LaDomain.A_UseBindPassword, type:_OUTPUT_, label:LaMsg.Domain_UseBindPassword, labelLocation:_LEFT_,trueValue:"TRUE", falseValue:"FALSE"},
											{ref:LaDomain.A_GalLdapBindDn, type:_OUTPUT_, label:LaMsg.Domain_GalLdapBindDn, labelLocation:_LEFT_, relevant:"instance.attrs[LaDomain.A_UseBindPassword] == 'TRUE'", relevantBehavior:_HIDE_},
										//	{ref:LaDomain.A_GalLdapBindPassword, type:_OUTPUT_, label:LaMsg.Domain_GalLdapBindPassword, labelLocation:_LEFT_, relevant:"instance.attrs[LaDomain.A_UseBindPassword] == 'TRUE'", relevantBehavior:_DISABLE_},
											{ref:LaDomain.A_GALSampleQuery, type:_TEXTFIELD_, label:LaMsg.Domain_GALSampleSearchName, labelLocation:_LEFT_, labelWrap:true, cssStyle:"width:100px;"}
										]
									}
								]
							}					
						]
					},
					{type:_CASE_, relevant:"instance[LaModel.currentStep] == 6", relevantBehavior:_HIDE_,
						items: [
							{type:_OUTPUT_, value:LaMsg.Domain_GALTestingInProgress}
						]	
					}, 
					{type:_CASE_, relevant:"instance[LaModel.currentStep] == 7", relevantBehavior:_HIDE_,
						items: [
							{type:_OUTPUT_,value:LaMsg.Domain_GALTestResults},
							{type:_SWITCH_,
								items: [
									{type:_CASE_, relevant:"instance[LaDomain.A_GALTestResultCode] == LaDomain.Check_OK",
										items: [
											{type:_OUTPUT_, value:LaMsg.Domain_GALTestSuccessful}
										]
									},
									{type:_CASE_, relevant:	"instance[LaDomain.A_GALTestResultCode] != LaDomain.Check_OK",
										items: [
											{type:_OUTPUT_, value:LaMsg.Domain_GALTestFailed},
											{type:_OUTPUT_, ref:LaDomain.A_GALTestResultCode, label:LaMsg.Domain_GALTestResult, choices:this.TestResultChoices},
											{type:_TEXTAREA_, ref:LaDomain.A_GALTestMessage, label:LaMsg.Domain_GALTestMessage, height:100}
										]
									}
								]
							}
						]
					},
					{type:_CASE_, relevant:"instance[LaModel.currentStep] == 8", relevantBehavior:_HIDE_,
						items:[
							{type:_OSELECT1_, label:LaMsg.Domain_AuthMech, choices:this.AuthMechs, ref:LaDomain.A_AuthMech, onChange:LaNewDomainXWizard.onAuthMechChange},
							{type:_SWITCH_,
								items: [
									{type:_CASE_, relevant:"instance.attrs[LaDomain.A_AuthMech]==LaDomain.AuthMech_ad",
										items:[
											{ref:LaDomain.A_AuthLDAPServerName, type:_INPUT_, label:LaMsg.Domain_AuthADServerName, labelLocation:_LEFT_, onChange:LaNewDomainXWizard.onAuthLDAPServerChange},
											{ref:LaDomain.A_AuthADDomainName, type:_INPUT_, label:LaMsg.Domain_AuthADDomainName, labelLocation:_LEFT_},
											{ref:LaDomain.A_AuthLDAPServerPort, type:_INPUT_, label:LaMsg.Domain_AuthADServerPort, labelLocation:_LEFT_, onChange:LaNewDomainXWizard.onAuthLDAPPortChange},
											{ref:LaDomain.A_AuthLDAPUseSSL, type:_CHECKBOX_, label:LaMsg.Domain_AuthADUseSSL, labelLocation:_LEFT_,trueValue:"TRUE", falseValue:"FALSE", onChange:LaNewDomainXWizard.onAuthLDAPUseSSLChange,labelCssClass:"xform_label", align:_LEFT_}
										]
									},
									{type:_CASE_, relevant:"instance.attrs[LaDomain.A_AuthMech]==LaDomain.AuthMech_ldap",
										items:[
											{ref:LaDomain.A_AuthLDAPServerName, type:_INPUT_, label:LaMsg.Domain_AuthLDAPServerName, labelLocation:_LEFT_, onChange:LaNewDomainXWizard.onAuthLDAPServerChange},
											{ref:LaDomain.A_AuthLDAPServerPort, type:_INPUT_, label:LaMsg.Domain_AuthLDAPServerPort, labelLocation:_LEFT_, onChange:LaNewDomainXWizard.onAuthLDAPPortChange},							
											{ref:LaDomain.A_AuthLDAPUseSSL, type:_CHECKBOX_, label:LaMsg.Domain_AuthLDAPUseSSL, labelLocation:_LEFT_,trueValue:"TRUE", falseValue:"FALSE", onChange:LaNewDomainXWizard.onAuthLDAPUseSSLChange,labelCssClass:"xform_label", align:_LEFT_},
											{ref:LaDomain.A_AuthLdapUserDn, type:_INPUT_, label:LaMsg.Domain_AuthLdapUserDn, labelLocation:_LEFT_},
//											{ref:LaDomain.A_AuthLdapURL, type:_OUTPUT_, label:LaMsg.Domain_AuthLdapURL, labelLocation:_LEFT_},
											{type:_OUTPUT_, value:LaMsg.NAD_DomainsAuthStr, colSpan:2},												
											
										]
									}
								]
							}
						]
					},
					{type:_CASE_, relevant:"instance[LaModel.currentStep] == 9", relevantBehavior:_HIDE_,
						items: [
							{ref:LaDomain.A_AuthMech, type:_OUTPUT_, label:LaMsg.Domain_AuthMech, choices:this.AuthMechs},
							{type:_SWITCH_,
								items: [
									{type:_CASE_, relevant:"instance.attrs[LaDomain.A_AuthMech]==LaDomain.AuthMech_ad",
										items:[
											{ref:LaDomain.A_AuthLDAPServerName, type:_OUTPUT_, label:LaMsg.Domain_AuthADServerName, labelLocation:_LEFT_},
											{ref:LaDomain.A_AuthADDomainName, type:_OUTPUT_, label:LaMsg.Domain_AuthADDomainName, labelLocation:_LEFT_},
											{ref:LaDomain.A_AuthLDAPServerPort, type:_OUTPUT_, label:LaMsg.Domain_AuthADServerPort, labelLocation:_LEFT_},
											{ref:LaDomain.A_AuthLDAPUseSSL, type:_OUTPUT_, label:LaMsg.Domain_AuthADUseSSL, labelLocation:_LEFT_,choices:LaModel.BOOLEAN_CHOICES}
										]
									},
									{type:_CASE_, relevant:"instance.attrs[LaDomain.A_AuthMech]==LaDomain.AuthMech_ldap",
										items:[
											{ref:LaDomain.A_AuthLDAPServerName, type:_OUTPUT_, label:LaMsg.Domain_AuthLDAPServerName, labelLocation:_LEFT_},
											{ref:LaDomain.A_AuthLDAPServerPort, type:_OUTPUT_, label:LaMsg.Domain_AuthLDAPServerPort, labelLocation:_LEFT_},							
											{ref:LaDomain.A_AuthLDAPUseSSL, type:_OUTPUT_, label:LaMsg.Domain_AuthLDAPUseSSL, labelLocation:_LEFT_,choices:LaModel.BOOLEAN_CHOICES},
											{ref:LaDomain.A_AuthLdapUserDn, type:_OUTPUT_, label:LaMsg.Domain_AuthLdapUserDn, labelLocation:_LEFT_},
										]
									}
								]
							},
							{type:_OUTPUT_,value:LaMsg.Domain_AuthProvideLoginPwd, colSpan:2},
							{type:_INPUT_, label:LaMsg.Domain_AuthTestUserName, ref:LaDomain.A_AuthTestUserName},
							{type:_SECRET_, label:LaMsg.Domain_AuthTestPassword, ref:LaDomain.A_AuthTestPassword}
						]
					},
					{type:_CASE_, relevant:"instance[LaModel.currentStep] == 10", relevantBehavior:_HIDE_,
						items: [
							{type:_OUTPUT_,value:LaMsg.Domain_AuthTestingInProgress}
						]
					},
					{type:_CASE_, relevant:"instance[LaModel.currentStep] == 11", relevantBehavior:_HIDE_,
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
					},
					{type:_CASE_, relevant:"instance[LaModel.currentStep] == 12", relevantBehavior:_HIDE_,
						items: [
							{type:_OUTPUT_, value:LaMsg.Domain_Config_Complete}
						]
					}										
				]	
			}
	
		]
	};
	return xFormObject;
};

