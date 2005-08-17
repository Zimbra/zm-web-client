/**
* @class LaAccountXFormView
* @contructor
* @param parent
* @param app
* @author Greg Solovyev
**/
function LaAccountXFormView (parent, app) {
	LaTabView.call(this, parent, app);	
	this.accountStatusChoices = [
		{value:LaAccount.ACCOUNT_STATUS_ACTIVE, label:LaMsg.ACCOUNT_STATUS[LaAccount.ACCOUNT_STATUS_ACTIVE]}, 
		{value:LaAccount.ACCOUNT_STATUS_MAINTENANCE, label:LaMsg.ACCOUNT_STATUS[LaAccount.ACCOUNT_STATUS_MAINTENANCE]}, 
		{value:LaAccount.ACCOUNT_STATUS_LOCKED, label: LaMsg.ACCOUNT_STATUS[LaAccount.ACCOUNT_STATUS_LOCKED]},
		{value:LaAccount.ACCOUNT_STATUS_CLOSED, label:LaMsg.ACCOUNT_STATUS[LaAccount.ACCOUNT_STATUS_CLOSED]}
	];
	this.initForm(LaAccount.myXModel,this.getMyXForm());
}

LaAccountXFormView.prototype = new LaTabView();
LaAccountXFormView.prototype.constructor = LaAccountXFormView;

/**
* @method setObject sets the object contained in the view
* @param entry - LaAccount object to display
**/
LaAccountXFormView.prototype.setObject =
function(entry) {
	this._containedObject = new Object();
	this._containedObject.attrs = new Object();


	for (var a in entry.attrs) {
		if(entry.attrs[a] instanceof Array) {
			this._containedObject.attrs[a] = new Array();
			for(var aa in entry.attrs[a]) {
				this._containedObject.attrs[a][aa] = entry.attrs[a][aa];
			}
		} else {
			this._containedObject.attrs[a] = entry.attrs[a];
		}
	}
	this._containedObject.name = entry.name;
	if(entry.id)
		this._containedObject.id = entry.id;
		
	var cosList = this._app.getCosList().getArray();
	
	/**
	* If this account does not have a COS assigned to it - assign default COS
	**/
	if(!this._containedObject.attrs[LaAccount.A_COSId] || this._containedObject.attrs[LaAccount.A_COSId].length < 1  ) {
		this._containedObject.attrs[LaAccount.A_COSId] = cosList[0].id;
		this._containedObject.cos = cosList[0];
	} else {		
		for(var ix in cosList) {
			/**
			* Find the COS assigned to this account 
			**/
			if(cosList[ix].id == this._containedObject.attrs[LaAccount.A_COSId]) {
				this._containedObject.cos = cosList[ix];
				break;
			}
		}
		if(!this._containedObject.cos) {
			/**
			* We did not find the COS assigned to this account,
			* this means that the COS was deleted, therefore assign default COS to this account
			**/
			this._containedObject.attrs[LaAccount.A_COSId] = cosList[0].id;
			this._containedObject.cos = cosList[0];
		}
	}
	if(!this._containedObject.cos) {
		this._containedObject.cos = cosList[0];
	}	
	this._containedObject[LaAccount.A2_autodisplayname] = entry[LaAccount.A2_autodisplayname];
	this._containedObject[LaAccount.A2_confirmPassword] = entry[LaAccount.A2_confirmPassword];
	
   	this._containedObject.globalConfig = this._app.getGlobalConfig();
   	
			
	if(!entry[LaModel.currentTab])
		this._containedObject[LaModel.currentTab] = "1";
	else
		this._containedObject[LaModel.currentTab] = entry[LaModel.currentTab];
		
	this._localXForm.setInstance(this._containedObject);
}

LaAccountXFormView.generateDisplayName =
function (instance, firstName, lastName, initials) {
	var oldDisplayName = instance.attrs[LaAccount.A_displayname];
	
	if(firstName)
		instance.attrs[LaAccount.A_displayname] = firstName;
	else
		instance.attrs[LaAccount.A_displayname] = "";
		
	if(initials) {
		instance.attrs[LaAccount.A_displayname] += " ";
		instance.attrs[LaAccount.A_displayname] += initials;
		instance.attrs[LaAccount.A_displayname] += ".";
	}
	if(lastName) {
		if(instance.attrs[LaAccount.A_displayname].length > 0)
			instance.attrs[LaAccount.A_displayname] += " ";
			
	    instance.attrs[LaAccount.A_displayname] += lastName;
	} 
	if(instance.attrs[LaAccount.A_displayname] == oldDisplayName) {
		return false;
	} else {
		return true;
	}
}

LaAccountXFormView.onCOSChanged = 
function(value, event, form) {
	var cosList = form.getController().getCosList().getArray();
	var cnt = cosList.length;
	for(var i = 0; i < cnt; i++) {
		if(cosList[i].id == value) {
			form.getInstance().cos = cosList[i];
			break;
		}
	}
	form.parent.setDirty(true);
	this.setInstanceValue(value);
	return value;
}

LaAccountXFormView.onRepeatRemove = 
function (index, form) {
	var list = this.getInstanceValue();
	if (list == null || typeof(list) == "string" || index >= list.length || index<0) return;
	list.splice(index, 1);
	form.parent.setDirty(true);
}

LaAccountXFormView.prototype.getMyXForm = function() {	
	var domainName = this._app._appCtxt.getAppController().getOverviewPanelController().getCurrentDomain();
	if(!domainName) {
		domainName = this._app.getDomainList().getArray()[0].name;
	}
	var emptyAlias = " @" + domainName;
	var xFormObject = {
		tableCssStyle:"width:100%;overflow:auto;",
		items: [
			{type:_GROUP_, cssClass:"AdminTitleBar", colSpan: "*", 
				items: [
					{type:_OUTPUT_, ref:LaAccount.A_displayname, label:LaMsg.NAD_Account},
					{type:_OUTPUT_, ref:LaItem.A_liquidId, label:LaMsg.NAD_LiquidID},
					{type:_GROUP_, colSpan: "*", numCols:4, 
						items: [
							{type:_OUTPUT_, ref:LaAccount.A2_mbxsize, label:LaMsg.usedQuota+":",
								getDisplayValue:function() {
									var val = this.getInstanceValue();
									if(!val) 
										val = "0 MB";
									else {
										val = Number(val / 1048576).toFixed(3) + " MB";
									}
									return val;
								}
							},
							{type:_OUTPUT_, ref:LaAccount.A2_quota, label:LaMsg.Of},								
						]
					}
				]
			},
			{type:_TAB_BAR_,  ref:LaModel.currentTab,
				choices:[
					{value:1, label:LaMsg.TABT_GeneralPage},
					{value:2, label:LaMsg.TABT_ContactInfo},					
					{value:3, label:LaMsg.TABT_Features},
					{value:4, label:LaMsg.TABT_Preferences},					
					{value:5, label:LaMsg.TABT_Aliases},										
					{value:6, label:LaMsg.TABT_Forwarding},															
					{value:7, label:LaMsg.TABT_Advanced}									
				]
			},
			{type:_SWITCH_, align:_LEFT_, valign:_TOP_, 
				items:[
					{type:_CASE_,  relevant:"instance[LaModel.currentTab] == 1", height:"400px", align:_LEFT_, valign:_TOP_, 
						items:[
							{ref:LaAccount.A_name, type:_EMAILADDR_, msgName:LaMsg.NAD_AccountName,label:LaMsg.NAD_AccountName+":", labelLocation:_LEFT_,onChange:LaTabView.onFormFieldChanged,forceUpdate:true},
							{ref:LaAccount.A_COSId, type:_OSELECT1_, msgName:LaMsg.NAD_ClassOfService+":",label:LaMsg.NAD_ClassOfService+":", labelLocation:_LEFT_, choices:this._app.getCosListChoices(), onChange:LaAccountXFormView.onCOSChanged},
							{ref:LaAccount.A_password, type:_SECRET_, msgName:LaMsg.NAD_Password,label:LaMsg.NAD_Password+":", labelLocation:_LEFT_, cssClass:"admin_xform_name_input", onChange:LaTabView.onFormFieldChanged},														
							{ref:LaAccount.A2_confirmPassword, type:_SECRET_, msgName:LaMsg.NAD_ConfirmPassword,label:LaMsg.NAD_ConfirmPassword+":", labelLocation:_LEFT_, cssClass:"admin_xform_name_input", onChange:LaTabView.onFormFieldChanged},
							{ref:LaAccount.A_firstName, type:_TEXTFIELD_, msgName:LaMsg.NAD_FirstName,label:LaMsg.NAD_FirstName+":", labelLocation:_LEFT_, cssClass:"admin_xform_name_input", width:150, onChange:LaTabView.onFormFieldChanged,
								elementChanged: function(elementValue,instanceValue, event) {
									if(this.getInstance()[LaAccount.A2_autodisplayname]=="TRUE") {
										LaAccountXFormView.generateDisplayName(this.getInstance(), elementValue, this.getInstance().attrs[LaAccount.A_lastName],this.getInstance().attrs[LaAccount.A_initials] );
									}
									this.getForm().itemChanged(this, elementValue, event);
								}
							},
							{ref:LaAccount.A_initials, type:_TEXTFIELD_, msgName:LaMsg.NAD_Initials,label:LaMsg.NAD_Initials+":", labelLocation:_LEFT_, cssClass:"admin_xform_name_input", width:50,  onChange:LaTabView.onFormFieldChanged,
								elementChanged: function(elementValue,instanceValue, event) {
									if(this.getInstance()[LaAccount.A2_autodisplayname]=="TRUE") {
										LaAccountXFormView.generateDisplayName(this.getInstance(), this.getInstance().attrs[LaAccount.A_firstName], this.getInstance().attrs[LaAccount.A_lastName],elementValue);
									}
									this.getForm().itemChanged(this, elementValue, event);
								}
							},	
							{ref:LaAccount.A_lastName, type:_TEXTFIELD_, msgName:LaMsg.NAD_LastName,label:LaMsg.NAD_LastName+":", labelLocation:_LEFT_, cssClass:"admin_xform_name_input", width:150, onChange:LaTabView.onFormFieldChanged,
								elementChanged: function(elementValue,instanceValue, event) {
									if(this.getInstance()[LaAccount.A2_autodisplayname]=="TRUE") {
										LaAccountXFormView.generateDisplayName(this.getInstance(), this.getInstance().attrs[LaAccount.A_firstName], elementValue ,this.getInstance().attrs[LaAccount.A_initials]);
									}
									this.getForm().itemChanged(this, elementValue, event);
								}
							},
							{type:_GROUP_, numCols:3, nowrap:true, width:200, msgName:LaMsg.NAD_DisplayName,label:LaMsg.NAD_DisplayName+":", labelLocation:_LEFT_, 
								items: [
									{ref:LaAccount.A_displayname, type:_TEXTFIELD_, label:null,	cssClass:"admin_xform_name_input", width:150, onChange:LaTabView.onFormFieldChanged, 
										relevant:"instance[LaAccount.A2_autodisplayname] == \"FALSE\"",
										relevantBehavior:_DISABLE_
									},
									{ref:LaAccount.A2_autodisplayname, type:_CHECKBOX_, msgName:LaMsg.NAD_Auto,label:LaMsg.NAD_Auto,labelLocation:_RIGHT_,trueValue:"TRUE", falseValue:"FALSE",
										elementChanged: function(elementValue,instanceValue, event) {
											if(elementValue=="TRUE") {
												if(LaAccountXFormView.generateDisplayName(this.getInstance(), this.getInstance().attrs[LaAccount.A_firstName], this.getInstance().attrs[LaAccount.A_lastName],this.getInstance().attrs[LaAccount.A_initials])) {
												//	this.getForm().itemChanged(this, elementValue, event);
													this.getForm().parent.setDirty(true);
												}
											}
											this.getForm().itemChanged(this, elementValue, event);
										}
									}
								]
							},
							{ref:LaAccount.A_accountStatus, type:_OSELECT1_, msgName:LaMsg.NAD_AccountStatus,label:LaMsg.NAD_AccountStatus+":", labelLocation:_LEFT_, choices:this.accountStatusChoices, onChange:LaTabView.onFormFieldChanged},
							{ref:LaAccount.A_description, type:_INPUT_, msgName:LaMsg.NAD_Description,label:LaMsg.NAD_Description+":", labelLocation:_LEFT_, cssClass:"admin_xform_name_input", onChange:LaTabView.onFormFieldChanged},
							{ref:LaAccount.A_notes, type:_TEXTAREA_, msgName:LaMsg.NAD_Notes,label:LaMsg.NAD_Notes+":", labelLocation:_LEFT_, labelCssStyle:"vertical-align:top", onChange:LaTabView.onFormFieldChanged, width:"30em"},
						]
					}, 
					{type:_CASE_, numCols:1, relevant:"instance[LaModel.currentTab] == 2",
						items: [
							{ref:LaAccount.A_telephoneNumber, type:_TEXTFIELD_, msgName:LaMsg.NAD_telephoneNumber,label:LaMsg.NAD_telephoneNumber+":", labelLocation:_LEFT_, onChange:LaTabView.onFormFieldChanged, width:150},
							{ref:LaAccount.A_company, type:_TEXTFIELD_, msgName:LaMsg.NAD_company,label:LaMsg.NAD_company+":", labelLocation:_LEFT_, onChange:LaTabView.onFormFieldChanged, width:150},
							{ref:LaAccount.A_orgUnit, type:_TEXTFIELD_, msgName:LaMsg.NAD_orgUnit,label:LaMsg.NAD_orgUnit+":", labelLocation:_LEFT_, onChange:LaTabView.onFormFieldChanged, width:150},														
							{ref:LaAccount.A_office, type:_TEXTFIELD_, msgName:LaMsg.NAD_office,label:LaMsg.NAD_office+":", labelLocation:_LEFT_, onChange:LaTabView.onFormFieldChanged, width:150},
							{ref:LaAccount.A_postalAddress, type:_TEXTFIELD_, msgName:LaMsg.NAD_postalAddress,label:LaMsg.NAD_postalAddress+":", labelLocation:_LEFT_, onChange:LaTabView.onFormFieldChanged, width:150},
							{ref:LaAccount.A_city, type:_TEXTFIELD_, msgName:LaMsg.NAD_city,label:LaMsg.NAD_city+":", labelLocation:_LEFT_, onChange:LaTabView.onFormFieldChanged, width:150},
							{ref:LaAccount.A_state, type:_TEXTFIELD_, msgName:LaMsg.NAD_state,label:LaMsg.NAD_state+":", labelLocation:_LEFT_, onChange:LaTabView.onFormFieldChanged, width:150},
							{ref:LaAccount.A_zip, type:_TEXTFIELD_, msgName:LaMsg.NAD_zip,label:LaMsg.NAD_zip+":", labelLocation:_LEFT_, onChange:LaTabView.onFormFieldChanged, width:150},
							{ref:LaAccount.A_country, type:_TEXTFIELD_, msgName:LaMsg.NAD_country,label:LaMsg.NAD_country+":", labelLocation:_LEFT_, onChange:LaTabView.onFormFieldChanged, width:150}
						]
					},
					{type:_CASE_, numCols:1, relevant:"instance[LaModel.currentTab] == 3",
						items: [
							{ref:LaAccount.A_liquidFeatureContactsEnabled, type:_COS_CHECKBOX_, checkBoxLabel:LaMsg.NAD_OverrideCOS, msgName:LaMsg.NAD_FeatureContactsEnabled,label:LaMsg.NAD_FeatureContactsEnabled+":", labelLocation:_LEFT_, trueValue:"TRUE", falseValue:"FALSE", onChange:LaTabView.onFormFieldChanged},							
							{ref:LaAccount.A_liquidFeatureCalendarEnabled, type:_COS_CHECKBOX_, checkBoxLabel:LaMsg.NAD_OverrideCOS, msgName:LaMsg.NAD_FeatureCalendarEnabled,label:LaMsg.NAD_FeatureCalendarEnabled+":", labelLocation:_LEFT_, trueValue:"TRUE", falseValue:"FALSE", onChange:LaTabView.onFormFieldChanged},														
							{ref:LaAccount.A_liquidFeatureTaggingEnabled, type:_COS_CHECKBOX_, checkBoxLabel:LaMsg.NAD_OverrideCOS, msgName:LaMsg.NAD_FeatureTaggingEnabled,label:LaMsg.NAD_FeatureTaggingEnabled+":", labelLocation:_LEFT_, trueValue:"TRUE", falseValue:"FALSE", onChange:LaTabView.onFormFieldChanged},
							{ref:LaAccount.A_liquidFeatureAdvancedSearchEnabled, type:_COS_CHECKBOX_, checkBoxLabel:LaMsg.NAD_OverrideCOS, msgName:LaMsg.NAD_FeatureAdvancedSearchEnabled,label:LaMsg.NAD_FeatureAdvancedSearchEnabled+":", labelLocation:_LEFT_, trueValue:"TRUE", falseValue:"FALSE", onChange:LaTabView.onFormFieldChanged},
							{ref:LaAccount.A_liquidFeatureSavedSearchesEnabled, type:_COS_CHECKBOX_, checkBoxLabel:LaMsg.NAD_OverrideCOS, msgName:LaMsg.NAD_FeatureSavedSearchesEnabled,label:LaMsg.NAD_FeatureSavedSearchesEnabled+":", labelLocation:_LEFT_, trueValue:"TRUE", falseValue:"FALSE", onChange:LaTabView.onFormFieldChanged},
							{ref:LaAccount.A_liquidFeatureConversationsEnabled, type:_COS_CHECKBOX_, checkBoxLabel:LaMsg.NAD_OverrideCOS, msgName:LaMsg.NAD_FeatureConversationsEnabled,label:LaMsg.NAD_FeatureConversationsEnabled+":", labelLocation:_LEFT_, trueValue:"TRUE", falseValue:"FALSE", onChange:LaTabView.onFormFieldChanged},
							{ref:LaAccount.A_liquidFeatureChangePasswordEnabled, type:_COS_CHECKBOX_, checkBoxLabel:LaMsg.NAD_OverrideCOS, msgName:LaMsg.NAD_FeatureChangePasswordEnabled,label:LaMsg.NAD_FeatureChangePasswordEnabled+":", labelLocation:_LEFT_, trueValue:"TRUE", falseValue:"FALSE"},
							{ref:LaAccount.A_liquidFeatureInitialSearchPreferenceEnabled, type:_COS_CHECKBOX_, checkBoxLabel:LaMsg.NAD_OverrideCOS, msgName:LaMsg.NAD_FeatureInitialSearchPreferenceEnabled,label:LaMsg.NAD_FeatureInitialSearchPreferenceEnabled+":", labelLocation:_LEFT_, trueValue:"TRUE", falseValue:"FALSE", onChange:LaTabView.onFormFieldChanged},
							{ref:LaAccount.A_liquidFeatureFiltersEnabled, type:_COS_CHECKBOX_, checkBoxLabel:LaMsg.NAD_OverrideCOS, msgName:LaMsg.NAD_FeatureFiltersEnabled,label:LaMsg.NAD_FeatureFiltersEnabled+":", labelLocation:_LEFT_, trueValue:"TRUE", falseValue:"FALSE", onChange:LaTabView.onFormFieldChanged},
							{ref:LaAccount.A_liquidFeatureHtmlComposeEnabled, type:_COS_CHECKBOX_, checkBoxLabel:LaMsg.NAD_OverrideCOS, msgName:LaMsg.NAD_liquidFeatureHtmlComposeEnabled,label:LaMsg.NAD_liquidFeatureHtmlComposeEnabled+":", labelLocation:_LEFT_, trueValue:"TRUE", falseValue:"FALSE", onChange:LaTabView.onFormFieldChanged},							
							{ref:LaAccount.A_liquidFeatureGalEnabled, type:_COS_CHECKBOX_, checkBoxLabel:LaMsg.NAD_OverrideCOS, msgName:LaMsg.NAD_FeatureGalEnabled,label:LaMsg.NAD_FeatureGalEnabled+":", labelLocation:_LEFT_, trueValue:"TRUE", falseValue:"FALSE", onChange:LaTabView.onFormFieldChanged},
							{ref:LaAccount.A_liquidImapEnabled, type:_COS_CHECKBOX_, checkBoxLabel:LaMsg.NAD_OverrideCOS, msgName:LaMsg.NAD_liquidImapEnabled,label:LaMsg.NAD_liquidImapEnabled+":", labelLocation:_LEFT_, trueValue:"TRUE", falseValue:"FALSE", onChange:LaTabView.onFormFieldChanged},
							{ref:LaAccount.A_liquidPop3Enabled, type:_COS_CHECKBOX_, checkBoxLabel:LaMsg.NAD_OverrideCOS, msgName:LaMsg.NAD_liquidPop3Enabled,label:LaMsg.NAD_liquidPop3Enabled+":", labelLocation:_LEFT_, trueValue:"TRUE", falseValue:"FALSE", onChange:LaTabView.onFormFieldChanged}								
						]
					},
					{type:_CASE_, numCols:1,relevant:"instance[LaModel.currentTab] == 4",
						items :[
							{ref:LaAccount.A_prefSaveToSent, type:_COS_CHECKBOX_, checkBoxLabel:LaMsg.NAD_OverrideCOS, msgName:LaMsg.NAD_prefSaveToSent,label:LaMsg.NAD_prefSaveToSent+":", labelLocation:_LEFT_, trueValue:"TRUE", falseValue:"FALSE",onChange:LaTabView.onFormFieldChanged},
							{ref:LaAccount.A_liquidPrefMessageViewHtmlPreferred, type:_COS_CHECKBOX_, checkBoxLabel:LaMsg.NAD_OverrideCOS, msgName:LaMsg.NAD_liquidPrefMessageViewHtmlPreferred,label:LaMsg.NAD_liquidPrefMessageViewHtmlPreferred+":", labelLocation:_LEFT_, trueValue:"TRUE", falseValue:"FALSE",onChange:LaTabView.onFormFieldChanged},
							{ref:LaAccount.A_liquidPrefComposeInNewWindow, type:_COS_CHECKBOX_, checkBoxLabel:LaMsg.NAD_OverrideCOS, msgName:LaMsg.NAD_liquidPrefComposeInNewWindow,label:LaMsg.NAD_liquidPrefComposeInNewWindow+":", labelLocation:_LEFT_, trueValue:"TRUE", falseValue:"FALSE",onChange:LaTabView.onFormFieldChanged},							
							{ref:LaAccount.A_liquidPrefForwardReplyInOriginalFormat, type:_COS_CHECKBOX_, checkBoxLabel:LaMsg.NAD_OverrideCOS, msgName:LaMsg.NAD_liquidPrefForwardReplyInOriginalFormat,label:LaMsg.NAD_liquidPrefForwardReplyInOriginalFormat+":", labelLocation:_LEFT_, trueValue:"TRUE", falseValue:"FALSE",onChange:LaTabView.onFormFieldChanged},														
							{ref:LaAccount.A_liquidPrefComposeFormat, type:_COS_SELECT1_, checkBoxLabel:LaMsg.NAD_OverrideCOS, msgName:LaMsg.NAD_liquidPrefComposeFormat,label:LaMsg.NAD_liquidPrefComposeFormat+":", labelLocation:_LEFT_, onChange:LaTabView.onFormFieldChanged},							
							{ref:LaAccount.A_liquidPrefAutoAddAddressEnabled, type:_COS_CHECKBOX_, checkBoxLabel:LaMsg.NAD_OverrideCOS, msgName:LaMsg.NAD_liquidPrefAutoAddAddressEnabled,label:LaMsg.NAD_liquidPrefAutoAddAddressEnabled+":", labelLocation:_LEFT_, trueValue:"TRUE", falseValue:"FALSE",onChange:LaTabView.onFormFieldChanged},							
							{type:_SEPARATOR_},
							{ref:LaAccount.A_liquidPrefGroupMailBy, type:_COS_SELECT1_, checkBoxLabel:LaMsg.NAD_OverrideCOS, msgName:LaMsg.NAD_liquidPrefGroupMailBy,label:LaMsg.NAD_liquidPrefGroupMailBy+":", labelLocation:_LEFT_, onChange:LaTabView.onFormFieldChanged},							
							{ref:LaAccount.A_liquidPrefContactsPerPage, type:_COS_SELECT1_, msgName:LaMsg.NAD_PrefContactsPerPage,label:LaMsg.NAD_PrefContactsPerPage+":", labelLocation:_LEFT_, checkBoxLabel:LaMsg.NAD_OverrideCOS, valueLabel:null,onChange:LaTabView.onFormFieldChanged},							
							{ref:LaAccount.A_liquidPrefMailItemsPerPage, type:_COS_SELECT1_, msgName:LaMsg.NAD_liquidPrefMailItemsPerPage,label:LaMsg.NAD_liquidPrefMailItemsPerPage+":", labelLocation:_LEFT_, checkBoxLabel:LaMsg.NAD_OverrideCOS, valueLabel:null,onChange:LaTabView.onFormFieldChanged},
							{ref:LaAccount.A_liquidPrefMailInitialSearch, type:_COS_TEXTFIELD_, msgName:LaMsg.NAD_liquidPrefMailInitialSearch,label:LaMsg.NAD_liquidPrefMailInitialSearch+":", labelLocation:_LEFT_, checkBoxLabel:LaMsg.NAD_OverrideCOS, cssClass:"admin_xform_name_input", valueLabel:null,onChange:LaTabView.onFormFieldChanged},
							{ref:LaAccount.A_liquidPrefShowSearchString, type:_COS_CHECKBOX_, checkBoxLabel:LaMsg.NAD_OverrideCOS, msgName:LaMsg.NAD_liquidPrefShowSearchString,label:LaMsg.NAD_liquidPrefShowSearchString+":", labelLocation:_LEFT_, trueValue:"TRUE", falseValue:"FALSE",onChange:LaTabView.onFormFieldChanged},
							{ref:LaAccount.A_liquidPrefUseTimeZoneListInCalendar, type:_COS_CHECKBOX_, checkBoxLabel:LaMsg.NAD_OverrideCOS, msgName:LaMsg.NAD_liquidPrefUseTimeZoneListInCalendar,label:LaMsg.NAD_liquidPrefUseTimeZoneListInCalendar+":", labelLocation:_LEFT_, trueValue:"TRUE", falseValue:"FALSE",onChange:LaTabView.onFormFieldChanged},							
							{ref:LaAccount.A_liquidPrefImapSearchFoldersEnabled, type:_COS_CHECKBOX_, checkBoxLabel:LaMsg.NAD_OverrideCOS, msgName:LaMsg.NAD_liquidPrefImapSearchFoldersEnabled,label:LaMsg.NAD_liquidPrefImapSearchFoldersEnabled+":", labelLocation:_LEFT_, trueValue:"TRUE", falseValue:"FALSE",onChange:LaTabView.onFormFieldChanged},														
							{type:_SEPARATOR_},							
							{ref:LaAccount.A_liquidPrefNewMailNotificationEnabled, type:_CHECKBOX_, msgName:LaMsg.NAD_liquidPrefNewMailNotificationEnabled,label:LaMsg.NAD_liquidPrefNewMailNotificationEnabled+":", labelLocation:_LEFT_, trueValue:"TRUE", falseValue:"FALSE",onChange:LaTabView.onFormFieldChanged,labelCssClass:"xform_label", align:_LEFT_},
							{ref:LaAccount.A_liquidPrefNewMailNotificationAddress, type:_TEXTFIELD_, msgName:LaMsg.NAD_liquidPrefNewMailNotificationAddress,label:LaMsg.NAD_liquidPrefNewMailNotificationAddress+":", labelLocation:_LEFT_, cssClass:"admin_xform_name_input", onChange:LaTabView.onFormFieldChanged},							
							{type:_SEPARATOR_},
							{ref:LaAccount.A_prefMailSignatureEnabled, type:_CHECKBOX_, msgName:LaMsg.NAD_prefMailSignatureEnabled,label:LaMsg.NAD_prefMailSignatureEnabled+":", labelLocation:_LEFT_, trueValue:"TRUE", falseValue:"FALSE",onChange:LaTabView.onFormFieldChanged,labelCssClass:"xform_label", align:_LEFT_},
							{ref:LaAccount.A_liquidPrefMailSignatureStyle, type:_COS_SELECT1_, checkBoxLabel:LaMsg.NAD_OverrideCOS, msgName:LaMsg.NAD_liquidPrefMailSignatureStyle,label:LaMsg.NAD_liquidPrefMailSignatureStyle+":", labelLocation:_LEFT_, onChange:LaTabView.onFormFieldChanged},
							{ref:LaAccount.A_prefMailSignature, type:_TEXTAREA_, msgName:LaMsg.NAD_prefMailSignature,label:LaMsg.NAD_prefMailSignature+":", labelLocation:_LEFT_, labelCssStyle:"vertical-align:top", onChange:LaTabView.onFormFieldChanged, colSpan:3, width:"30em"},
							{type:_SEPARATOR_},
							{ref:LaAccount.A_liquidPrefOutOfOfficeReplyEnabled, type:_CHECKBOX_, msgName:LaMsg.NAD_liquidPrefOutOfOfficeReplyEnabled,label:LaMsg.NAD_liquidPrefOutOfOfficeReplyEnabled+":", labelLocation:_LEFT_, trueValue:"TRUE", falseValue:"FALSE",onChange:LaTabView.onFormFieldChanged,labelCssClass:"xform_label", align:_LEFT_},
							{ref:LaAccount.A_liquidPrefOutOfOfficeReply, type:_TEXTAREA_, msgName:LaMsg.NAD_liquidPrefOutOfOfficeReply,label:LaMsg.NAD_liquidPrefOutOfOfficeReply+":", labelLocation:_LEFT_, labelCssStyle:"vertical-align:top", onChange:LaTabView.onFormFieldChanged, colSpan:3, width:"30em"}							
						]
					},
					{type:_CASE_, numCols:1, relevant:"instance[LaModel.currentTab] == 5",
						items: [
							{type:_OUTPUT_, value:"Edit aliases for this account:"},
							{ref:LaAccount.A_liquidMailAlias, type:_REPEAT_, label:null, repeatInstance:emptyAlias, showAddButton:true, showRemoveButton:true,  
								items: [
									{ref:".", type:_EMAILADDR_, label:null, onChange:LaTabView.onFormFieldChanged}
								],
								onRemove:LaAccountXFormView.onRepeatRemove
							}
						]
					},
					{type:_CASE_, numCols:1, relevant:"instance[LaModel.currentTab] == 6", 
						items: [
							{type:_OUTPUT_, value:"Edit forwarding addresses for this account:"},
							{ref:LaAccount.A_liquidMailForwardingAddress, type:_REPEAT_, label:null, repeatInstance:emptyAlias, showAddButton:true, showRemoveButton:true, 
								items: [
									{ref:".", type:_TEXTFIELD_, label:null, onChange:LaTabView.onFormFieldChanged}
								],
								onRemove:LaAccountXFormView.onRepeatRemove
							}
						]
					},
					{type:_CASE_, numCols:1, relevant:"instance[LaModel.currentTab] ==7",
						items: [
							{type:_GROUP_, numCols:2,
								items :[
									{ref:LaAccount.A_liquidAttachmentsBlocked, type:_COS_CHECKBOX_, checkBoxLabel:LaMsg.NAD_OverrideCOS, msgName:LaMsg.NAD_RemoveAllAttachments,label:LaMsg.NAD_RemoveAllAttachments+":", labelLocation:_LEFT_, trueValue:"TRUE", falseValue:"FALSE", onChange:LaTabView.onFormFieldChanged},
									{ref:LaAccount.A_liquidAttachmentsViewInHtmlOnly, type:_COS_CHECKBOX_, 
										checkBoxLabel:LaMsg.NAD_OverrideCOS, msgName:LaMsg.NAD_AttachmentsViewInHtmlOnly,label:LaMsg.NAD_AttachmentsViewInHtmlOnly+":", labelLocation:_LEFT_, 
										trueValue:"TRUE", falseValue:"FALSE", onChange:LaTabView.onFormFieldChanged,
										relevant:"instance.globalConfig.attrs[LaGlobalConfig.A_liquidComponentAvailable_convertd]",
										relevantBehavior:_HIDE_
									},	
									{ref:LaAccount.A_liquidAttachmentsIndexingEnabled, type:_COS_CHECKBOX_, 
										checkBoxLabel:LaMsg.NAD_OverrideCOS, msgName:LaMsg.NAD_liquidAttachmentsIndexingEnabled,label:LaMsg.NAD_liquidAttachmentsIndexingEnabled+":", labelLocation:_LEFT_, 
										trueValue:"TRUE", falseValue:"FALSE", onChange:LaTabView.onFormFieldChanged,									
										relevant:"instance.globalConfig.attrs[LaGlobalConfig.A_liquidComponentAvailable_convertd]",
										relevantBehavior:_HIDE_
									}
								]
							},
							{type:_SEPARATOR_},
							{type:_GROUP_, numCols:2, 
								items: [
									{ref:LaAccount.A_liquidMailQuota, type:_COS_TEXTFIELD_, checkBoxLabel:LaMsg.NAD_OverrideCOS, msgName:LaMsg.NAD_MailQuota,label:LaMsg.NAD_MailQuota+":", msgName:LaMsg.NAD_MailQuota,labelLocation:_LEFT_, cssClass:"admin_xform_number_input", onChange:LaTabView.onFormFieldChanged, checkBoxLabel:LaMsg.NAD_OverrideCOS},
									{ref:LaAccount.A_liquidContactMaxNumEntries, type:_COS_TEXTFIELD_, checkBoxLabel:LaMsg.NAD_OverrideCOS, msgName:LaMsg.NAD_ContactMaxNumEntries,label:LaMsg.NAD_ContactMaxNumEntries+":", labelLocation:_LEFT_, cssClass:"admin_xform_number_input", onChange:LaTabView.onFormFieldChanged}
								]
							},
							{type:_SEPARATOR_},
							{type:_GROUP_, numCols:2, 
								items: [
									{ref:LaAccount.A_liquidMinPwdLength, type:_COS_TEXTFIELD_, checkBoxLabel:LaMsg.NAD_OverrideCOS, msgName:LaMsg.NAD_passMinLength,label:LaMsg.NAD_passMinLength+":", labelLocation:_LEFT_, cssClass:"admin_xform_number_input", onChange:LaTabView.onFormFieldChanged},
									{ref:LaAccount.A_liquidMaxPwdLength, type:_COS_TEXTFIELD_, checkBoxLabel:LaMsg.NAD_OverrideCOS, msgName:LaMsg.NAD_passMaxLength,label:LaMsg.NAD_passMaxLength+":", labelLocation:_LEFT_, cssClass:"admin_xform_number_input", onChange:LaTabView.onFormFieldChanged},
									{ref:LaAccount.A_liquidMinPwdAge, type:_COS_TEXTFIELD_, checkBoxLabel:LaMsg.NAD_OverrideCOS, msgName:LaMsg.NAD_passMinAge,label:LaMsg.NAD_passMinAge+":", labelLocation:_LEFT_, cssClass:"admin_xform_number_input", onChange:LaTabView.onFormFieldChanged},
									{ref:LaAccount.A_liquidMaxPwdAge, type:_COS_TEXTFIELD_, checkBoxLabel:LaMsg.NAD_OverrideCOS, msgName:LaMsg.NAD_passMaxAge,label:LaMsg.NAD_passMaxAge+":", labelLocation:_LEFT_, cssClass:"admin_xform_number_input", onChange:LaTabView.onFormFieldChanged},
									{ref:LaAccount.A_liquidEnforcePwdHistory, type:_COS_TEXTFIELD_, checkBoxLabel:LaMsg.NAD_OverrideCOS, msgName:LaMsg.NAD_passEnforceHistory,label:LaMsg.NAD_passEnforceHistory+":", labelLocation:_LEFT_, cssClass:"admin_xform_number_input", onChange:LaTabView.onFormFieldChanged},
									{ref:LaAccount.A_liquidPasswordLocked, type:_COS_CHECKBOX_, checkBoxLabel:LaMsg.NAD_OverrideCOS, msgName:LaMsg.NAD_PwdLocked,label:LaMsg.NAD_PwdLocked+":", labelLocation:_LEFT_, trueValue:"TRUE", falseValue:"FALSE", onChange:LaTabView.onFormFieldChanged}
								]
							},
							{type:_SEPARATOR_},							
							{type:_GROUP_, numCols:2, 
								items: [
									{ref:LaAccount.A_liquidAuthTokenLifetime, type:_COS_LIFETIME_, checkBoxLabel:LaMsg.NAD_OverrideCOS, msgName:LaMsg.NAD_AuthTokenLifetime,label:LaMsg.NAD_AuthTokenLifetime+":",labelLocation:_LEFT_, onChange:LaTabView.onFormFieldChanged},								
									{ref:LaAccount.A_liquidMailMessageLifetime, type:_COS_LIFETIME1_, checkBoxLabel:LaMsg.NAD_OverrideCOS, msgName:LaMsg.NAD_MailMessageLifetime,label:LaMsg.NAD_MailMessageLifetime+":",labelLocation:_LEFT_, onChange:LaTabView.onFormFieldChanged},
									{ref:LaAccount.A_liquidMailTrashLifetime, type:_COS_LIFETIME1_, checkBoxLabel:LaMsg.NAD_OverrideCOS, msgName:LaMsg.NAD_MailTrashLifetime,label:LaMsg.NAD_MailTrashLifetime+":", labelLocation:_LEFT_, onChange:LaTabView.onFormFieldChanged},
									{ref:LaAccount.A_liquidMailSpamLifetime, type:_COS_LIFETIME1_, checkBoxLabel:LaMsg.NAD_OverrideCOS, msgName:LaMsg.NAD_MailSpamLifetime,label:LaMsg.NAD_MailSpamLifetime+":", labelLocation:_LEFT_, onChange:LaTabView.onFormFieldChanged}
								]
							},
							{type:_SEPARATOR_},
							{type:_GROUP_, numCols:2, 
								items: [
									{ref:LaAccount.A_isAdminAccount, type:_CHECKBOX_, msgName:LaMsg.NAD_IsAdmin,label:LaMsg.NAD_IsAdmin+":",labelLocation:_LEFT_, trueValue:"TRUE", falseValue:"FALSE", onChange:LaTabView.onFormFieldChanged,labelCssClass:"xform_label"},								
									{ref:LaAccount.A_liquidPasswordMustChange, type:_CHECKBOX_,  msgName:LaMsg.NAD_MustChangePwd,label:LaMsg.NAD_MustChangePwd+":",labelLocation:_LEFT_, trueValue:"TRUE", falseValue:"FALSE", onChange:LaTabView.onFormFieldChanged,labelCssClass:"xform_label"}
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
