function LaGALConfigXWizard (parent, app) {
	this._app=app;
	LaXWizardDialog.call(this, parent, null, LaMsg.NCD_GALConfigTitle, "550px", "300px");
	this.stepChoices = [
		{label:LaMsg.TABT_GALMode, value:1},
		{label:LaMsg.TABT_GALonfiguration, value:2}, 
		{label:LaMsg.TABT_GALonfiguration, value:3},		
		{label:LaMsg.TABT_GALonfigSummary, value:4},
		{label:LaMsg.TABT_TestGalConfig, value:5},
		{label:LaMsg.TABT_GalTestResult, value:6}	
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
	this.initForm(LaDomain.myXModel,this.getMyXForm());		
}

LaGALConfigXWizard.prototype = new LaXWizardDialog;
LaGALConfigXWizard.prototype.constructor = LaGALConfigXWizard;

/**
* @method setObject sets the object contained in the view
* @param entry - LaDomain object to display
**/
LaGALConfigXWizard.prototype.setObject =
function(entry) {
	this._containedObject = new Object();
	this._containedObject.attrs = new Object();

	for (var a in entry.attrs) {
		this._containedObject.attrs[a] = entry.attrs[a];
	}
	
	this._containedObject[LaModel.currentStep] = 1;
	this._localXForm.setInstance(this._containedObject);	
}


LaGALConfigXWizard.prototype.generateLDAPUrl = 
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
LaGALConfigXWizard.onGALServerTypeChange =
function (value, event, form) {
	if(value == "ad") {
		form.getInstance().attrs[LaDomain.A_GalLdapFilter] = "ad";
	} else {
		form.getInstance().attrs[LaDomain.A_GalLdapFilter] = "";
	}
	this.setInstanceValue(value);	
}

LaGALConfigXWizard.onUseSSLChange =
function (value, event, form) {
	if(value == "TRUE") {
		form.getInstance().attrs[LaDomain.A_GALServerPort] = 636;
	} else {
		form.getInstance().attrs[LaDomain.A_GALServerPort] = 389;
	}
	this.setInstanceValue(value);
	form.parent.generateLDAPUrl();
}


LaGALConfigXWizard.onGALServerChange = 
function (value, event, form) {
//	form.getInstance().attrs[LaDomain.A_GALServerName] = value;
	this.setInstanceValue(value);
	form.parent.generateLDAPUrl();
}

LaGALConfigXWizard.onGALServerPortChange = 
function (value, event, form) {
//	form.getInstance().attrs[LaDomain.A_GALServerPort] = value;
	this.setInstanceValue(value);
	form.parent.generateLDAPUrl();
}


LaGALConfigXWizard.onGalModeChange = 
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

LaGALConfigXWizard.prototype.testSetings =
function () {
	var callback = new LsCallback(this, this.checkCallBack);
	LaDomain.testGALSettings(this._containedObject, callback, this._containedObject[LaDomain.A_GALSampleQuery]);	
}
/**
* Callback function invoked by Asynchronous CSFE command when "check" call returns
**/
LaGALConfigXWizard.prototype.checkCallBack = 
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
	this._button[DwtWizardDialog.NEXT_BUTTON].setEnabled(false);
	this._button[DwtWizardDialog.PREV_BUTTON].setEnabled(true);
	this._button[DwtWizardDialog.FINISH_BUTTON].setEnabled(true);
	this.goPage(6);
}

/**
* Overwritten methods that control wizard's flow (open, go next,go previous, finish)
**/
LaGALConfigXWizard.prototype.popup = 
function (loc) {
	LaXWizardDialog.prototype.popup.call(this, loc);
	this._button[DwtWizardDialog.NEXT_BUTTON].setText(DwtMsg._next);
	this._button[DwtWizardDialog.NEXT_BUTTON].setEnabled(true);
	this._button[DwtWizardDialog.FINISH_BUTTON].setEnabled(false);
	this._button[DwtWizardDialog.PREV_BUTTON].setEnabled(false);	
}

LaGALConfigXWizard.prototype.goPrev =
function () {
	if(this._containedObject[LaModel.currentStep] == 6) {
		//skip 5th step
		this._button[DwtWizardDialog.NEXT_BUTTON].setText(LaMsg.Domain_GALTestSettings);
		this._button[DwtWizardDialog.NEXT_BUTTON].setEnabled(true);
		this._button[DwtWizardDialog.FINISH_BUTTON].setEnabled(false);
		this.goPage(4);
	} else {
		this._button[DwtWizardDialog.NEXT_BUTTON].setText(DwtMsg._next);
		this._button[DwtWizardDialog.NEXT_BUTTON].setEnabled(true);
		if(this._containedObject[LaModel.currentStep] == 2) {
			//disable PREV button on the first step
			this._button[DwtWizardDialog.PREV_BUTTON].setEnabled(false);
		}
		this.goPage(this._containedObject[LaModel.currentStep]-1);
	}
}

LaGALConfigXWizard.prototype.goNext = 
function() {
	if(this._containedObject[LaModel.currentStep] == 1 && this._containedObject.attrs[LaDomain.A_GalMode]==LaDomain.GAL_Mode_internal) {
		this._button[DwtWizardDialog.NEXT_BUTTON].setEnabled(false);
		this._button[DwtWizardDialog.PREV_BUTTON].setEnabled(true);
		this._button[DwtWizardDialog.FINISH_BUTTON].setEnabled(true);
		this.goPage(this._containedObject[LaModel.currentStep] + 1);
	} else if(this._containedObject[LaModel.currentStep] == 3) {
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
		this._button[DwtWizardDialog.FINISH_BUTTON].setEnabled(false);
		this.goPage(4);
	} else if(this._containedObject[LaModel.currentStep] == 4) {
 		this.testSetings();
		this.goPage(5);
		this._button[DwtWizardDialog.NEXT_BUTTON].setText(DwtMsg._next);
		this._button[DwtWizardDialog.NEXT_BUTTON].setEnabled(false);
		this._button[DwtWizardDialog.PREV_BUTTON].setEnabled(false);
		this._button[DwtWizardDialog.FINISH_BUTTON].setEnabled(false);
	} else {
		this.goPage(this._containedObject[LaModel.currentStep] + 1);
		this._button[DwtWizardDialog.PREV_BUTTON].setEnabled(true);
	}
}
LaGALConfigXWizard.prototype.getMyXForm = 
function () {
	var xFormObject = {
		items: [
			{type:_OUTPUT_, colSpan:2, align:_CENTER_, valign:_TOP_, ref:LaModel.currentStep, choices:this.stepChoices},
			{type:_SEPARATOR_, align:_CENTER_, valign:_TOP_},
			{type:_SPACER_,  align:_CENTER_, valign:_TOP_},				
			{type: _SWITCH_,
				items: [
					{type:_CASE_, relevant:"instance[LaModel.currentStep] == 1", relevantBehaviorBehavior:_HIDE_,
						items: [
							{ref:LaDomain.A_GalMode, type:_OSELECT1_, label:LaMsg.Domain_GalMode, labelLocation:_LEFT_, choices:this.GALModes, onChange:LaGALConfigXWizard.onGalModeChange},
							{ref:LaDomain.A_GalMaxResults, type:_INPUT_, label:LaMsg.NAD_GalMaxResults, labelLocation:_LEFT_}					
						]
					},
					{type:_CASE_, relevant:"instance[LaModel.currentStep] == 2 && instance.attrs[LaDomain.A_GalMode]!=LaDomain.GAL_Mode_internal", relevantBehavior:_HIDE_,
						items: [
							{ref:LaDomain.A_GALServerType, type:_OSELECT1_, label:LaMsg.Domain_GALServerType, labelLocation:_LEFT_, choices:this.GALServerTypes, onChange:LaGALConfigXWizard.onGALServerTypeChange},
							{ref:LaDomain.A_GALServerName, type:_INPUT_, label:LaMsg.Domain_GALServerName, labelLocation:_LEFT_, onChange:LaGALConfigXWizard.onGALServerChange},					
							{ref:LaDomain.A_GALServerPort, type:_INPUT_, label:LaMsg.Domain_GALServerPort, labelLocation:_LEFT_,onChange:LaGALConfigXWizard.onGALServerPortChange},
							{ref:LaDomain.A_GALUseSSL, type:_CHECKBOX_, label:LaMsg.Domain_GALUseSSL, labelLocation:_LEFT_,trueValue:"TRUE", falseValue:"FALSE", onChange:LaGALConfigXWizard.onUseSSLChange,labelCssClass:"xform_label", align:_LEFT_},
							{ref:LaDomain.A_GalLdapFilter, type:_TEXTAREA_, width:380, height:100, label:LaMsg.Domain_GalLdapFilter, labelLocation:_LEFT_, textWrapping:"soft", relevant:"instance.attrs[LaDomain.A_GALServerType] == 'ldap'", relevantBehavior:_DISABLE_},
							{ref:LaDomain.A_GalLdapSearchBase, type:_TEXTAREA_, width:380, height:50, label:LaMsg.Domain_GalLdapSearchBase, labelLocation:_LEFT_, textWrapping:"soft"}
						]
					},
					{type:_CASE_, relevant:"instance[LaModel.currentStep] == 3 && instance.attrs[LaDomain.A_GalMode]!=LaDomain.GAL_Mode_internal", relevantBehavior:_HIDE_,
						items: [
							{ref:LaDomain.A_UseBindPassword, type:_CHECKBOX_, label:LaMsg.Domain_UseBindPassword, labelLocation:_LEFT_,trueValue:"TRUE", falseValue:"FALSE",labelCssClass:"xform_label", align:_LEFT_},
							{ref:LaDomain.A_GalLdapBindDn, type:_INPUT_, label:LaMsg.Domain_GalLdapBindDn, labelLocation:_LEFT_, relevant:"instance.attrs[LaDomain.A_UseBindPassword] == 'TRUE'", relevantBehavior:_DISABLE_},
							{ref:LaDomain.A_GalLdapBindPassword, type:_SECRET_, label:LaMsg.Domain_GalLdapBindPassword, labelLocation:_LEFT_, relevant:"instance.attrs[LaDomain.A_UseBindPassword] == 'TRUE'", relevantBehavior:_DISABLE_},
							{ref:LaDomain.A_GalLdapBindPasswordConfirm, type:_SECRET_, label:LaMsg.Domain_GalLdapBindPasswordConfirm, labelLocation:_LEFT_, relevant:"instance.attrs[LaDomain.A_UseBindPassword] == 'TRUE'", relevantBehavior:_DISABLE_}							
						]			
					},				
					{type:_CASE_, relevant:"(instance[LaModel.currentStep] == 2 && instance.attrs[LaDomain.A_GalMode]==LaDomain.GAL_Mode_internal)", relevantBehavior:_HIDE_,
						items: [
							{type:_OUTPUT_, value:LaMsg.Domain_GAL_Config_Complete}
						]
					}, 
					{type:_CASE_, relevant:"instance[LaModel.currentStep] == 4", relevantBehavior:_HIDE_,
						items: [
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
//											{ref:LaDomain.A_GalLdapBindPassword, type:_OUTPUT_, label:LaMsg.Domain_GalLdapBindPassword, labelLocation:_LEFT_, relevant:"instance.attrs[LaDomain.A_UseBindPassword] == 'TRUE'", relevantBehavior:_HIDE_},
											{ref:LaDomain.A_GALSampleQuery, type:_INPUT_, label:LaMsg.Domain_GALSampleSearchName, labelLocation:_LEFT_, labelWrap:true, cssStyle:"width:100px;"}
										]
									}
								]
							}					
						]
					},
					{type:_CASE_, relevant:"instance[LaModel.currentStep] == 5", relevantBehavior:_HIDE_,
						items: [
							{type:_OUTPUT_, value:LaMsg.Domain_GALTestingInProgress}
						]	
					}, 
					{type:_CASE_, relevant:"instance[LaModel.currentStep] == 6", relevantBehavior:_HIDE_,
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
					}
				]	
			}
	
		]
	};
	return xFormObject;
};

