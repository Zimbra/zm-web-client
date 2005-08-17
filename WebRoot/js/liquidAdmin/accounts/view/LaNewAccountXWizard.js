function LaNewAccountXWizard (parent, app) {
	LaXWizardDialog.call(this, parent, null, LaMsg.NCD_NewAccTitle, "550px", "300px");
	this._app = app;
	this.accountStatusChoices = [LaAccount.ACCOUNT_STATUS_ACTIVE, LaAccount.ACCOUNT_STATUS_MAINTENANCE, LaAccount.ACCOUNT_STATUS_LOCKED, LaAccount.ACCOUNT_STATUS_CLOSED];		
	this.stepChoices = [
		{label:LaMsg.TABT_GeneralPage, value:1},
		{label:LaMsg.TABT_ContactInfo, value:2}, 
		{label:LaMsg.TABT_Features, value:3},
		{label:LaMsg.TABT_Preferences, value:4},
		{label:LaMsg.TABT_Aliases, value:5},		
		{label:LaMsg.TABT_Forwarding, value:6},				
		{label:LaMsg.TABT_Advanced, value:7}						
	];
	this.initForm(LaAccount.myXModel,this.getMyXForm());	
	this._localXForm.setController(this._app);	
}

LaNewAccountXWizard.prototype = new LaXWizardDialog;
LaNewAccountXWizard.prototype.constructor = LaNewAccountXWizard;


LaNewAccountXWizard.onNameFieldChanged = 
function (value, event, form) {
	if(value && value.length > 0) {
		form.parent._button[DwtWizardDialog.FINISH_BUTTON].setEnabled(true);
	} else {
		form.parent._button[DwtWizardDialog.FINISH_BUTTON].setEnabled(false);
	}
	this.setInstanceValue(value);
	return value;
}

/**
* Overwritten methods that control wizard's flow (open, go next,go previous, finish)
**/
LaNewAccountXWizard.prototype.popup = 
function (loc) {
	LaXWizardDialog.prototype.popup.call(this, loc);
	this._button[DwtWizardDialog.NEXT_BUTTON].setEnabled(true);
	this._button[DwtWizardDialog.FINISH_BUTTON].setEnabled(false);
	this._button[DwtWizardDialog.PREV_BUTTON].setEnabled(false);	
}

LaNewAccountXWizard.prototype.finishWizard = 
function() {
	try {
		
		if(!LaAccount.checkValues(this._containedObject, this._app)) {
			return false;
		}
		var account = LaAccount.create(this._containedObject, this._app);
		if(account != null) {
			//if creation took place - fire an DomainChangeEvent
			this._app.getAccountViewController()._fireAccountCreationEvent(account);
			this.popdown();		
		}
	} catch (ex) {
		this._app.getCurrentController()._handleException(ex, "LaNewAccountXWizard.prototype.finishWizard", null, false);
	}
}

LaNewAccountXWizard.prototype.goNext = 
function() {
	if (this._containedObject[LaModel.currentStep] == 1) {
		//check if passwords match
		if(this._containedObject.attrs[LaAccount.A_password]) {
			if(this._containedObject.attrs[LaAccount.A_password] != this._containedObject[LaAccount.A2_confirmPassword]) {
				this._app.getCurrentController().popupMsgDialog(LaMsg.ERROR_PASSWORD_MISMATCH);
				return false;
			}
		}
		this._button[DwtWizardDialog.PREV_BUTTON].setEnabled(true);
		
	} else if(this._containedObject[LaModel.currentStep] == 6) {
		this._button[DwtWizardDialog.NEXT_BUTTON].setEnabled(false);
	}
	this.goPage(this._containedObject[LaModel.currentStep] + 1);
}

LaNewAccountXWizard.prototype.goPrev = 
function() {
	if (this._containedObject[LaModel.currentStep] == 2) {
		this._button[DwtWizardDialog.PREV_BUTTON].setEnabled(false);
	} else if(this._containedObject[LaModel.currentStep] == 7) {
		this._button[DwtWizardDialog.NEXT_BUTTON].setEnabled(true);
	}
	this.goPage(this._containedObject[LaModel.currentStep] - 1);
}

/**
* @method setObject sets the object contained in the view
* @param entry - LaAccount object to display
**/
LaNewAccountXWizard.prototype.setObject =
function(entry) {
	this._containedObject = new Object();
	this._containedObject.attrs = new Object();

	for (var a in entry.attrs) {
		this._containedObject.attrs[a] = entry.attrs[a];
	}
	this._containedObject.name = "";

	this._containedObject.id = null;
		
	var cosList = this._app.getCosList().getArray();
	for(var ix in cosList) {
		if(cosList[ix].name == "default") {
			this._containedObject.attrs[LaAccount.A_COSId] = cosList[ix].id;
			this._containedObject.cos = cosList[ix];
			break;
		}
	}

	if(!this._containedObject.cos) {
		this._containedObject.cos = cosList[0];
		this._containedObject.attrs[LaAccount.A_COSId] = cosList[0].id;
	}	
	this._containedObject.attrs[LaAccount.A_accountStatus] = LaAccount.ACCOUNT_STATUS_ACTIVE;
	this._containedObject[LaAccount.A2_autodisplayname] = "TRUE";
	this._containedObject[LaAccount.A2_confirmPassword] = null;
	this._containedObject[LaModel.currentStep] = 1;
	this._containedObject.attrs[LaAccount.A_liquidMailAlias] = new Array();
	var domainName = this._app._appCtxt.getAppController().getOverviewPanelController().getCurrentDomain();
	if(!domainName) {
		domainName = this._app.getDomainList().getArray()[0].name;
	}
	this._containedObject[LaAccount.A_name] = "@" + domainName;
	this._localXForm.setInstance(this._containedObject);
}

LaNewAccountXWizard.onCOSChanged = 
function(value, event, form) {
	var cosList = form.getController().getCosList().getArray();
	var cnt = cosList.length;
	for(var i = 0; i < cnt; i++) {
		if(cosList[i].id == value) {
			form.getInstance().cos = cosList[i];
			break;
		}
	}
	this.setInstanceValue(value);
	return value;
}

LaNewAccountXWizard.prototype.getMyXForm = function() {	
	var domainName = this._app._appCtxt.getAppController().getOverviewPanelController().getCurrentDomain();
	if(!domainName) {
		domainName = this._app.getDomainList().getArray()[0].name;
	}
	var emptyAlias = "@" + domainName;
	var xFormObject = {
		items: [
			{type:_OUTPUT_, colSpan:2, align:_CENTER_, valign:_TOP_, ref:LaModel.currentStep, choices:this.stepChoices},
			{type:_SEPARATOR_, align:_CENTER_, valign:_TOP_},
			{type:_SPACER_,  align:_CENTER_, valign:_TOP_},
			{type:_SWITCH_, width:450, align:_LEFT_, valign:_TOP_, 
				items:[
					{type:_CASE_, numCols:1, relevant:"instance[LaModel.currentStep] == 1", align:_LEFT_, valign:_TOP_, 
						items:[
							{ref:LaAccount.A_name, type:_EMAILADDR_, msgName:LaMsg.NAD_AccountName,label:LaMsg.NAD_AccountName+":", labelLocation:_LEFT_, onChange:LaNewAccountXWizard.onNameFieldChanged},
							{ref:LaAccount.A_COSId, type:_OSELECT1_, msgName:LaMsg.NAD_ClassOfService+":",label:LaMsg.NAD_ClassOfService+":", labelLocation:_LEFT_, choices:this._app.getCosListChoices(), onChange:LaNewAccountXWizard.onCOSChanged},
							{ref:LaAccount.A_password, type:_SECRET_, msgName:LaMsg.NAD_Password,label:LaMsg.NAD_Password+":", labelLocation:_LEFT_, cssClass:"admin_xform_name_input"},														
							{ref:LaAccount.A2_confirmPassword, type:_SECRET_, msgName:LaMsg.NAD_ConfirmPassword,label:LaMsg.NAD_ConfirmPassword+":", labelLocation:_LEFT_, cssClass:"admin_xform_name_input"},
							{ref:LaAccount.A_firstName, type:_TEXTFIELD_, msgName:LaMsg.NAD_FirstName,label:LaMsg.NAD_FirstName+":", labelLocation:_LEFT_, cssClass:"admin_xform_name_input",
								elementChanged: function(elementValue,instanceValue, event) {
									if(this.getInstance()[LaAccount.A2_autodisplayname]=="TRUE") {
										LaAccountXFormView.generateDisplayName(this.getInstance(), elementValue, this.getInstance().attrs[LaAccount.A_lastName],this.getInstance().attrs[LaAccount.A_initials] );
									}
									this.getForm().itemChanged(this, elementValue, event);
								}
							},
							{ref:LaAccount.A_initials, type:_TEXTFIELD_, msgName:LaMsg.NAD_Initials,label:LaMsg.NAD_Initials+":", labelLocation:_LEFT_, cssClass:"admin_xform_name_input",
								elementChanged: function(elementValue,instanceValue, event) {
									if(this.getInstance()[LaAccount.A2_autodisplayname]=="TRUE") {
										LaAccountXFormView.generateDisplayName(this.getInstance(), this.getInstance().attrs[LaAccount.A_firstName], this.getInstance().attrs[LaAccount.A_lastName],elementValue);
									}
									this.getForm().itemChanged(this, elementValue, event);
								}
							},	
							{ref:LaAccount.A_lastName, type:_TEXTFIELD_, msgName:LaMsg.NAD_LastName,label:LaMsg.NAD_LastName+":", labelLocation:_LEFT_, required:true, cssClass:"admin_xform_name_input",
								elementChanged: function(elementValue,instanceValue, event) {
									if(this.getInstance()[LaAccount.A2_autodisplayname]=="TRUE") {
										LaAccountXFormView.generateDisplayName(this.getInstance(), this.getInstance().attrs[LaAccount.A_firstName], elementValue ,this.getInstance().attrs[LaAccount.A_initials]);
									}
									this.getForm().itemChanged(this, elementValue, event);
								}
							},
							{type:_GROUP_, numCols:3, nowrap:true,  msgName:LaMsg.NAD_DisplayName,label:LaMsg.NAD_DisplayName+":", labelLocation:_LEFT_,
								items: [
									{ref:LaAccount.A_displayname, type:_TEXTFIELD_,	cssClass:"admin_xform_name_input",  label:null,
										relevant:"instance[LaAccount.A2_autodisplayname] == \"FALSE\"",
										relevantBehavior:_DISABLE_
									},
									{ref:LaAccount.A2_autodisplayname, type:_CHECKBOX_, msgName:LaMsg.NAD_Auto,label:LaMsg.NAD_Auto,labelLocation:_RIGHT_,trueValue:"TRUE", falseValue:"FALSE",
										elementChanged: function(elementValue,instanceValue, event) {
											if(elementValue=="TRUE") {
												if(LaAccountXFormView.generateDisplayName(this.getInstance(), this.getInstance().attrs[LaAccount.A_firstName], this.getInstance().attrs[LaAccount.A_lastName],this.getInstance().attrs[LaAccount.A_initials])) {
													this.getForm().itemChanged(this, elementValue, event);
												}
											}
											this.getForm().itemChanged(this, elementValue, event);
										}
									}
								]
							},
							{ref:LaAccount.A_accountStatus, type:_OSELECT1_, msgName:LaMsg.NAD_AccountStatus,label:LaMsg.NAD_AccountStatus+":", labelLocation:_LEFT_, choices:this.accountStatusChoices},
							{ref:LaAccount.A_description, type:_INPUT_, msgName:LaMsg.NAD_Description,label:LaMsg.NAD_Description+":", labelLocation:_LEFT_, cssClass:"admin_xform_name_input"}
						]
					}, 
					{type:_CASE_, numCols:1, relevant:"instance[LaModel.currentStep] == 2",
						items: [
							{ref:LaAccount.A_telephoneNumber, type:_TEXTFIELD_, msgName:LaMsg.NAD_telephoneNumber,label:LaMsg.NAD_telephoneNumber+":", labelLocation:_LEFT_, width:150},
							{ref:LaAccount.A_company, type:_TEXTFIELD_, msgName:LaMsg.NAD_company,label:LaMsg.NAD_company+":", labelLocation:_LEFT_, width:150},
							{ref:LaAccount.A_orgUnit, type:_TEXTFIELD_, msgName:LaMsg.NAD_orgUnit,label:LaMsg.NAD_orgUnit+":", labelLocation:_LEFT_, width:150},														
							{ref:LaAccount.A_office, type:_TEXTFIELD_, msgName:LaMsg.NAD_office,label:LaMsg.NAD_office+":", labelLocation:_LEFT_, width:150},
							{ref:LaAccount.A_postalAddress, type:_TEXTFIELD_, msgName:LaMsg.NAD_postalAddress,label:LaMsg.NAD_postalAddress+":", labelLocation:_LEFT_, width:150},
							{ref:LaAccount.A_city, type:_TEXTFIELD_, msgName:LaMsg.NAD_city,label:LaMsg.NAD_city+":", labelLocation:_LEFT_, width:150},
							{ref:LaAccount.A_state, type:_TEXTFIELD_, msgName:LaMsg.NAD_state,label:LaMsg.NAD_state+":", labelLocation:_LEFT_, width:150},
							{ref:LaAccount.A_zip, type:_TEXTFIELD_, msgName:LaMsg.NAD_zip,label:LaMsg.NAD_zip+":", labelLocation:_LEFT_, width:150},
							{ref:LaAccount.A_country, type:_TEXTFIELD_, msgName:LaMsg.NAD_country,label:LaMsg.NAD_country+":", labelLocation:_LEFT_, width:150}
						]
					},
					{type:_CASE_, numCols:1, relevant:"instance[LaModel.currentStep] == 3", 
						items: [
							{ref:LaAccount.A_liquidFeatureContactsEnabled, type:_COS_CHECKBOX_, checkBoxLabel:LaMsg.NAD_OverrideCOS, msgName:LaMsg.NAD_FeatureContactsEnabled,label:LaMsg.NAD_FeatureContactsEnabled+":", labelLocation:_LEFT_, trueValue:"TRUE", falseValue:"FALSE"},							
							{ref:LaAccount.A_liquidFeatureCalendarEnabled, type:_COS_CHECKBOX_, checkBoxLabel:LaMsg.NAD_OverrideCOS, msgName:LaMsg.NAD_FeatureCalendarEnabled,label:LaMsg.NAD_FeatureCalendarEnabled+":", labelLocation:_LEFT_, trueValue:"TRUE", falseValue:"FALSE"},														
							{ref:LaAccount.A_liquidFeatureTaggingEnabled, type:_COS_CHECKBOX_, checkBoxLabel:LaMsg.NAD_OverrideCOS, msgName:LaMsg.NAD_FeatureTaggingEnabled,label:LaMsg.NAD_FeatureTaggingEnabled+":", labelLocation:_LEFT_, trueValue:"TRUE", falseValue:"FALSE"},
							{ref:LaAccount.A_liquidFeatureAdvancedSearchEnabled, type:_COS_CHECKBOX_, checkBoxLabel:LaMsg.NAD_OverrideCOS, msgName:LaMsg.NAD_FeatureAdvancedSearchEnabled,label:LaMsg.NAD_FeatureAdvancedSearchEnabled+":", labelLocation:_LEFT_, trueValue:"TRUE", falseValue:"FALSE"},
							{ref:LaAccount.A_liquidFeatureSavedSearchesEnabled, type:_COS_CHECKBOX_, checkBoxLabel:LaMsg.NAD_OverrideCOS, msgName:LaMsg.NAD_FeatureSavedSearchesEnabled,label:LaMsg.NAD_FeatureSavedSearchesEnabled+":", labelLocation:_LEFT_, trueValue:"TRUE", falseValue:"FALSE"},
							{ref:LaAccount.A_liquidFeatureConversationsEnabled, type:_COS_CHECKBOX_, checkBoxLabel:LaMsg.NAD_OverrideCOS, msgName:LaMsg.NAD_FeatureConversationsEnabled,label:LaMsg.NAD_FeatureConversationsEnabled+":", labelLocation:_LEFT_, trueValue:"TRUE", falseValue:"FALSE"},
							{ref:LaAccount.A_liquidFeatureChangePasswordEnabled, type:_COS_CHECKBOX_, checkBoxLabel:LaMsg.NAD_OverrideCOS, msgName:LaMsg.NAD_FeatureChangePasswordEnabled,label:LaMsg.NAD_FeatureChangePasswordEnabled+":", labelLocation:_LEFT_, trueValue:"TRUE", falseValue:"FALSE"},
							{ref:LaAccount.A_liquidFeatureInitialSearchPreferenceEnabled, type:_COS_CHECKBOX_, checkBoxLabel:LaMsg.NAD_OverrideCOS, msgName:LaMsg.NAD_FeatureInitialSearchPreferenceEnabled,label:LaMsg.NAD_FeatureInitialSearchPreferenceEnabled+":", labelLocation:_LEFT_, trueValue:"TRUE"},
							{ref:LaAccount.A_liquidFeatureFiltersEnabled, type:_COS_CHECKBOX_, checkBoxLabel:LaMsg.NAD_OverrideCOS, msgName:LaMsg.NAD_FeatureFiltersEnabled,label:LaMsg.NAD_FeatureFiltersEnabled+":", labelLocation:_LEFT_, trueValue:"TRUE", falseValue:"FALSE"},
							{ref:LaAccount.A_liquidFeatureHtmlComposeEnabled, type:_COS_CHECKBOX_, checkBoxLabel:LaMsg.NAD_OverrideCOS, msgName:LaMsg.NAD_liquidFeatureHtmlComposeEnabled,label:LaMsg.NAD_liquidFeatureHtmlComposeEnabled+":", labelLocation:_LEFT_, trueValue:"TRUE", falseValue:"FALSE"},							
							{ref:LaAccount.A_liquidFeatureGalEnabled, type:_COS_CHECKBOX_, checkBoxLabel:LaMsg.NAD_OverrideCOS, msgName:LaMsg.NAD_FeatureGalEnabled,label:LaMsg.NAD_FeatureGalEnabled+":", labelLocation:_LEFT_, trueValue:"TRUE", falseValue:"FALSE"},
							{ref:LaAccount.A_liquidImapEnabled, type:_COS_CHECKBOX_, checkBoxLabel:LaMsg.NAD_OverrideCOS, msgName:LaMsg.NAD_liquidImapEnabled,label:LaMsg.NAD_liquidImapEnabled+":", labelLocation:_LEFT_, trueValue:"TRUE", falseValue:"FALSE"},
							{ref:LaAccount.A_liquidPop3Enabled, type:_COS_CHECKBOX_, checkBoxLabel:LaMsg.NAD_OverrideCOS, msgName:LaMsg.NAD_liquidPop3Enabled,label:LaMsg.NAD_liquidPop3Enabled+":", labelLocation:_LEFT_, trueValue:"TRUE", falseValue:"FALSE"}								
						]
					},
					{type:_CASE_, numCols:1,relevant:"instance[LaModel.currentStep] == 4", 
						items :[
							{ref:LaAccount.A_prefSaveToSent, type:_COS_CHECKBOX_, checkBoxLabel:LaMsg.NAD_OverrideCOS, msgName:LaMsg.NAD_prefSaveToSent,label:LaMsg.NAD_prefSaveToSent+":", labelLocation:_LEFT_, trueValue:"TRUE", falseValue:"FALSE"},
							{ref:LaAccount.A_liquidPrefMessageViewHtmlPreferred, type:_COS_CHECKBOX_, checkBoxLabel:LaMsg.NAD_OverrideCOS, msgName:LaMsg.NAD_liquidPrefMessageViewHtmlPreferred,label:LaMsg.NAD_liquidPrefMessageViewHtmlPreferred+":", labelLocation:_LEFT_, trueValue:"TRUE", falseValue:"FALSE"},
							{ref:LaAccount.A_liquidPrefComposeInNewWindow, type:_COS_CHECKBOX_, checkBoxLabel:LaMsg.NAD_OverrideCOS, msgName:LaMsg.NAD_liquidPrefComposeInNewWindow,label:LaMsg.NAD_liquidPrefComposeInNewWindow+":", labelLocation:_LEFT_, trueValue:"TRUE", falseValue:"FALSE"},							
							{ref:LaAccount.A_liquidPrefForwardReplyInOriginalFormat, type:_COS_CHECKBOX_, checkBoxLabel:LaMsg.NAD_OverrideCOS, msgName:LaMsg.NAD_liquidPrefForwardReplyInOriginalFormat,label:LaMsg.NAD_liquidPrefForwardReplyInOriginalFormat+":", labelLocation:_LEFT_, trueValue:"TRUE", falseValue:"FALSE"},														
							{ref:LaAccount.A_liquidPrefComposeFormat, type:_COS_SELECT1_, checkBoxLabel:LaMsg.NAD_OverrideCOS, msgName:LaMsg.NAD_liquidPrefComposeFormat,label:LaMsg.NAD_liquidPrefComposeFormat+":", labelLocation:_LEFT_},							
							{ref:LaAccount.A_liquidPrefAutoAddAddressEnabled, type:_COS_CHECKBOX_, checkBoxLabel:LaMsg.NAD_OverrideCOS, msgName:LaMsg.NAD_liquidPrefAutoAddAddressEnabled,label:LaMsg.NAD_liquidPrefAutoAddAddressEnabled+":", labelLocation:_LEFT_, trueValue:"TRUE", falseValue:"FALSE"},							
							{type:_SEPARATOR_},
							{ref:LaAccount.A_liquidPrefGroupMailBy, type:_COS_SELECT1_, checkBoxLabel:LaMsg.NAD_OverrideCOS, msgName:LaMsg.NAD_liquidPrefGroupMailBy,label:LaMsg.NAD_liquidPrefGroupMailBy+":", labelLocation:_LEFT_},							
							{ref:LaAccount.A_liquidPrefContactsPerPage, type:_COS_TEXTFIELD_, msgName:LaMsg.NAD_PrefContactsPerPage,label:LaMsg.NAD_PrefContactsPerPage+":", labelLocation:_LEFT_, checkBoxLabel:LaMsg.NAD_OverrideCOS, cssClass:"admin_xform_number_input", valueLabel:null},							
							{ref:LaAccount.A_liquidPrefMailItemsPerPage, type:_COS_TEXTFIELD_, msgName:LaMsg.NAD_liquidPrefMailItemsPerPage,label:LaMsg.NAD_liquidPrefMailItemsPerPage+":", labelLocation:_LEFT_, checkBoxLabel:LaMsg.NAD_OverrideCOS, cssClass:"admin_xform_number_input", valueLabel:null},
							{ref:LaAccount.A_liquidPrefMailInitialSearch, type:_COS_TEXTFIELD_, msgName:LaMsg.NAD_liquidPrefMailInitialSearch,label:LaMsg.NAD_liquidPrefMailInitialSearch+":", labelLocation:_LEFT_, checkBoxLabel:LaMsg.NAD_OverrideCOS, cssClass:"admin_xform_name_input", valueLabel:null},
							{ref:LaAccount.A_liquidPrefShowSearchString, type:_COS_CHECKBOX_, checkBoxLabel:LaMsg.NAD_OverrideCOS, msgName:LaMsg.NAD_liquidPrefShowSearchString,label:LaMsg.NAD_liquidPrefShowSearchString+":", labelLocation:_LEFT_, trueValue:"TRUE", falseValue:"FALSE"},
							{type:_SEPARATOR_},							
							{ref:LaAccount.A_liquidPrefNewMailNotificationEnabled, type:_CHECKBOX_, msgName:LaMsg.NAD_liquidPrefNewMailNotificationEnabled,label:LaMsg.NAD_liquidPrefNewMailNotificationEnabled+":", labelLocation:_LEFT_, trueValue:"TRUE", falseValue:"FALSE",labelCssClass:"xform_label", align:_LEFT_},
							{ref:LaAccount.A_liquidPrefNewMailNotificationAddress, type:_TEXTFIELD_, msgName:LaMsg.NAD_liquidPrefNewMailNotificationAddress,label:LaMsg.NAD_liquidPrefNewMailNotificationAddress+":", labelLocation:_LEFT_, cssClass:"admin_xform_name_input"},							
							{type:_SEPARATOR_},
							{ref:LaAccount.A_prefMailSignatureEnabled, type:_CHECKBOX_, msgName:LaMsg.NAD_prefMailSignatureEnabled,label:LaMsg.NAD_prefMailSignatureEnabled+":", labelLocation:_LEFT_, trueValue:"TRUE", falseValue:"FALSE",labelCssClass:"xform_label", align:_LEFT_},
							{ref:LaAccount.A_liquidPrefMailSignatureStyle, type:_COS_SELECT1_, checkBoxLabel:LaMsg.NAD_OverrideCOS, msgName:LaMsg.NAD_liquidPrefMailSignatureStyle,label:LaMsg.NAD_liquidPrefMailSignatureStyle+":", labelLocation:_LEFT_},
							{ref:LaAccount.A_prefMailSignature, type:_TEXTAREA_, msgName:LaMsg.NAD_prefMailSignature,label:LaMsg.NAD_prefMailSignature+":", labelLocation:_LEFT_, labelCssStyle: "vertical-align:top"},
							{type:_SEPARATOR_},
							{ref:LaAccount.A_liquidPrefOutOfOfficeReplyEnabled, type:_CHECKBOX_, msgName:LaMsg.NAD_liquidPrefOutOfOfficeReplyEnabled,label:LaMsg.NAD_liquidPrefOutOfOfficeReplyEnabled+":", labelLocation:_LEFT_, trueValue:"TRUE", falseValue:"FALSE",labelCssClass:"xform_label", align:_LEFT_},
							{ref:LaAccount.A_liquidPrefOutOfOfficeReply, type:_TEXTAREA_, msgName:LaMsg.NAD_liquidPrefOutOfOfficeReply,label:LaMsg.NAD_liquidPrefOutOfOfficeReply+":", labelLocation:_LEFT_, labelCssStyle:"vertical-align:top"}
						]
					},
					{type:_CASE_, numCols:1, relevant:"instance[LaModel.currentStep] == 5",
						items: [
							{type:_OUTPUT_, value:LaMsg.NAD_AccountAliases},
							{ref:LaAccount.A_liquidMailAlias, type:_REPEAT_, label:null, repeatInstance:emptyAlias, showAddButton:true, showRemoveButton:true, 
								items: [
									{ref:".", type:_EMAILADDR_, label:null}
								]
							}
						]
					},
					{type:_CASE_, numCols:1, relevant:"instance[LaModel.currentStep] == 6",
						items: [
							{type:_OUTPUT_, value:LaMsg.NAD_AccountForwarding},
							{ref:LaAccount.A_liquidMailForwardingAddress, type:_REPEAT_, label:null, repeatInstance:emptyAlias, showAddButton:true, showRemoveButton:true, 
								items: [
									{ref:".", type:_TEXTFIELD_, label:null}
								]
							}
						]
					},
					{type:_CASE_, numCols:1, relevant:"instance[LaModel.currentStep]==7", 
						items: [
							{type:_GROUP_, numCols:2,
								items :[
									{ref:LaAccount.A_liquidAttachmentsBlocked, type:_COS_CHECKBOX_, checkBoxLabel:LaMsg.NAD_OverrideCOS, msgName:LaMsg.NAD_RemoveAllAttachments,label:LaMsg.NAD_RemoveAllAttachments+":", labelLocation:_LEFT_, trueValue:"TRUE", falseValue:"FALSE"},
									{ref:LaAccount.A_liquidAttachmentsViewInHtmlOnly, type:_COS_CHECKBOX_, checkBoxLabel:LaMsg.NAD_OverrideCOS, msgName:LaMsg.NAD_AttachmentsViewInHtmlOnly,label:LaMsg.NAD_AttachmentsViewInHtmlOnly+":", labelLocation:_LEFT_, trueValue:"TRUE", falseValue:"FALSE"},	
									{ref:LaAccount.A_liquidAttachmentsIndexingEnabled, type:_COS_CHECKBOX_, checkBoxLabel:LaMsg.NAD_OverrideCOS, msgName:LaMsg.NAD_liquidAttachmentsIndexingEnabled,label:LaMsg.NAD_liquidAttachmentsIndexingEnabled+":", labelLocation:_LEFT_, trueValue:"TRUE", falseValue:"FALSE"}
								]
							},
							{type:_SEPARATOR_},
							{type:_GROUP_, numCols:2, 
								items: [
									{ref:LaAccount.A_liquidMailQuota, type:_COS_TEXTFIELD_, checkBoxLabel:LaMsg.NAD_OverrideCOS, msgName:LaMsg.NAD_MailQuota,label:LaMsg.NAD_MailQuota+":", labelLocation:_LEFT_, cssClass:"admin_xform_number_input", checkBoxLabel:LaMsg.NAD_OverrideCOS},
									{ref:LaAccount.A_liquidContactMaxNumEntries, type:_COS_TEXTFIELD_, checkBoxLabel:LaMsg.NAD_OverrideCOS, msgName:LaMsg.NAD_ContactMaxNumEntries,label:LaMsg.NAD_ContactMaxNumEntries+":", labelLocation:_LEFT_, cssClass:"admin_xform_number_input"}
								]
							},
							{type:_SEPARATOR_},
							{type:_GROUP_, numCols:2, 
								items: [
									{ref:LaAccount.A_liquidMinPwdLength, type:_COS_TEXTFIELD_, checkBoxLabel:LaMsg.NAD_OverrideCOS, msgName:LaMsg.NAD_passMinLength,label:LaMsg.NAD_passMinLength+":", labelLocation:_LEFT_, cssClass:"admin_xform_number_input"},
									{ref:LaAccount.A_liquidMaxPwdLength, type:_COS_TEXTFIELD_, checkBoxLabel:LaMsg.NAD_OverrideCOS, msgName:LaMsg.NAD_passMaxLength,label:LaMsg.NAD_passMaxLength+":", labelLocation:_LEFT_, cssClass:"admin_xform_number_input"},
									{ref:LaAccount.A_liquidMinPwdAge, type:_COS_TEXTFIELD_, checkBoxLabel:LaMsg.NAD_OverrideCOS, msgName:LaMsg.NAD_passMinAge,label:LaMsg.NAD_passMinAge+":", labelLocation:_LEFT_, cssClass:"admin_xform_number_input"},
									{ref:LaAccount.A_liquidMaxPwdAge, type:_COS_TEXTFIELD_, checkBoxLabel:LaMsg.NAD_OverrideCOS, msgName:LaMsg.NAD_passMaxAge,label:LaMsg.NAD_passMaxAge+":", labelLocation:_LEFT_, cssClass:"admin_xform_number_input"},
									{ref:LaAccount.A_liquidEnforcePwdHistory, type:_COS_TEXTFIELD_, checkBoxLabel:LaMsg.NAD_OverrideCOS, msgName:LaMsg.NAD_passEnforceHistory,label:LaMsg.NAD_passEnforceHistory+":", labelLocation:_LEFT_, cssClass:"admin_xform_number_input"},
									{ref:LaAccount.A_liquidPasswordLocked, type:_COS_CHECKBOX_, checkBoxLabel:LaMsg.NAD_OverrideCOS, msgName:LaMsg.NAD_PwdLocked,label:LaMsg.NAD_PwdLocked+":", labelLocation:_LEFT_, trueValue:"TRUE", falseValue:"FALSE"}
								]
							},
							{type:_SEPARATOR_},							
							{type:_GROUP_, numCols:2, 
								items: [
									{ref:LaAccount.A_liquidAuthTokenLifetime, type:_COS_LIFETIME_, checkBoxLabel:LaMsg.NAD_OverrideCOS, msgName:LaMsg.NAD_AuthTokenLifetime,label:LaMsg.NAD_AuthTokenLifetime+":",labelLocation:_LEFT_},								
									{ref:LaAccount.A_liquidMailMessageLifetime, type:_COS_LIFETIME1_, checkBoxLabel:LaMsg.NAD_OverrideCOS, msgName:LaMsg.NAD_MailMessageLifetime,label:LaMsg.NAD_MailMessageLifetime+":",labelLocation:_LEFT_},
									{ref:LaAccount.A_liquidMailTrashLifetime, type:_COS_LIFETIME1_, checkBoxLabel:LaMsg.NAD_OverrideCOS, msgName:LaMsg.NAD_MailTrashLifetime,label:LaMsg.NAD_MailTrashLifetime+":", labelLocation:_LEFT_},
									{ref:LaAccount.A_liquidMailSpamLifetime, type:_COS_LIFETIME1_, checkBoxLabel:LaMsg.NAD_OverrideCOS, msgName:LaMsg.NAD_MailSpamLifetime,label:LaMsg.NAD_MailSpamLifetime+":", labelLocation:_LEFT_}
								]
							},
							{type:_SEPARATOR_},
							{type:_GROUP_, numCols:2, 
								items: [
									{ref:LaAccount.A_isAdminAccount, type:_CHECKBOX_, msgName:LaMsg.NAD_IsAdmin,label:LaMsg.NAD_IsAdmin+":",labelLocation:_LEFT_, trueValue:"TRUE", falseValue:"FALSE",labelCssClass:"xform_label"},								
									{ref:LaAccount.A_liquidPasswordMustChange, type:_CHECKBOX_,  msgName:LaMsg.NAD_MustChangePwd,label:LaMsg.NAD_MustChangePwd+":",labelLocation:_LEFT_, trueValue:"TRUE", falseValue:"FALSE",labelCssClass:"xform_label"}
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