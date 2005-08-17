/**
* @class LaCosXFormView
* @contructor
* @param parent
* @param app
* @author Greg Solovyev
**/
function LaCosXFormView (parent, app) {
	LaTabView.call(this, parent, app);	
	
	this.initForm(LaCos.myXModel,this.getMyXForm());
}

LaCosXFormView.prototype = new LaTabView();
LaCosXFormView.prototype.constructor = LaCosXFormView;

/**
* @method setObject sets the object contained in the view
* @param entry - LaDomain object to display
**/
LaCosXFormView.prototype.setObject =
function(entry) {
	this._containedObject = new Object();
	this._containedObject.attrs = new Object();
	if(entry.id)
		this._containedObject.id = entry.id;
		
	for (var a in entry.attrs) {
		this._containedObject.attrs[a] = entry.attrs[a];
	}
	this._containedObject[LaCos.A_liquidMailHostPoolInternal] = entry[LaCos.A_liquidMailHostPoolInternal];
	this._containedObject[LaCos.A_liquidMailAllServersInternal] = this._app.getServerList().getArray();
  	this._containedObject.globalConfig = this._app.getGlobalConfig();
  	
	if(!entry[LaModel.currentTab])
		this._containedObject[LaModel.currentTab] = "1";
	else
		this._containedObject[LaModel.currentTab] = entry[LaModel.currentTab];
		
	this._localXForm.setInstance(this._containedObject);
}


LaCosXFormView.prototype.getMyXForm = function() {	
	var xFormObject = {
		tableCssStyle:"width:100%;overflow:auto;",
		items: [
			{type:_GROUP_, cssClass:"AdminTitleBar", colSpan: "*", 
				items: [
					{type:_OUTPUT_, ref:LaCos.A_name, label:LaMsg.NAD_ClassOfService+":"},
					{type:_OUTPUT_, ref:LaItem.A_liquidId, label:LaMsg.NAD_LiquidID+":"}
				]
			},
			{type:_TAB_BAR_,  ref:LaModel.currentTab,
				choices:[
					{value:1, label:LaMsg.TABT_GeneralPage},
					{value:2, label:LaMsg.TABT_Features},
					{value:3, label:LaMsg.TABT_Preferences},					
					{value:4, label:LaMsg.TABT_ServerPool},										
					{value:5, label:LaMsg.TABT_Advanced}										
				]
			},
			{type:_SWITCH_, 
				items:[
					{type:_CASE_, relevant:"instance[LaModel.currentTab] == 1", 
						items:[
							{ref:LaCos.A_name, type:_INPUT_, msgName:LaMsg.NAD_DisplayName,label:LaMsg.NAD_DisplayName+":", labelLocation:_LEFT_, cssClass:"admin_xform_name_input", onChange:LaTabView.onFormFieldChanged, required:true, width: "20em"},
							{ref:LaCos.A_description, type:_INPUT_, msgName:LaMsg.NAD_Description,label:LaMsg.NAD_Description+":", labelLocation:_LEFT_, cssClass:"admin_xform_name_input", onChange:LaTabView.onFormFieldChanged, width: "30em"},
							{ref:LaCos.A_liquidNotes, type:_TEXTAREA_, msgName:LaMsg.NAD_Notes,label:LaMsg.NAD_Notes+":", labelLocation:_LEFT_, labelCssStyle:"vertical-align:top", onChange:LaTabView.onFormFieldChanged,width: "30em"}							
						]
					}, 
					{type:_CASE_, relevant:"instance[LaModel.currentTab] == 2",
						items: [
							{ref:LaCos.A_liquidFeatureContactsEnabled, type:_CHECKBOX_, msgName:LaMsg.NAD_FeatureContactsEnabled,label:LaMsg.NAD_FeatureContactsEnabled+":", labelLocation:_LEFT_, trueValue:"TRUE", falseValue:"FALSE", onChange:LaTabView.onFormFieldChanged,labelCssClass:"xform_label", align:_LEFT_},							
							{ref:LaCos.A_liquidFeatureCalendarEnabled, type:_CHECKBOX_, msgName:LaMsg.NAD_FeatureCalendarEnabled,label:LaMsg.NAD_FeatureCalendarEnabled+":", labelLocation:_LEFT_, trueValue:"TRUE", falseValue:"FALSE", onChange:LaTabView.onFormFieldChanged,labelCssClass:"xform_label", align:_LEFT_},														
							{ref:LaCos.A_liquidFeatureTaggingEnabled, type:_CHECKBOX_, msgName:LaMsg.NAD_FeatureTaggingEnabled,label:LaMsg.NAD_FeatureTaggingEnabled+":", labelLocation:_LEFT_, trueValue:"TRUE", falseValue:"FALSE", onChange:LaTabView.onFormFieldChanged,labelCssClass:"xform_label", align:_LEFT_},
							{ref:LaCos.A_liquidFeatureAdvancedSearchEnabled, type:_CHECKBOX_, msgName:LaMsg.NAD_FeatureAdvancedSearchEnabled,label:LaMsg.NAD_FeatureAdvancedSearchEnabled+":", labelLocation:_LEFT_, trueValue:"TRUE", falseValue:"FALSE", onChange:LaTabView.onFormFieldChanged,labelCssClass:"xform_label", align:_LEFT_},
							{ref:LaCos.A_liquidFeatureSavedSearchesEnabled, type:_CHECKBOX_, msgName:LaMsg.NAD_FeatureSavedSearchesEnabled,label:LaMsg.NAD_FeatureSavedSearchesEnabled+":", labelLocation:_LEFT_, trueValue:"TRUE", falseValue:"FALSE", onChange:LaTabView.onFormFieldChanged,labelCssClass:"xform_label", align:_LEFT_},
							{ref:LaCos.A_liquidFeatureConversationsEnabled, type:_CHECKBOX_, msgName:LaMsg.NAD_FeatureConversationsEnabled,label:LaMsg.NAD_FeatureConversationsEnabled+":", labelLocation:_LEFT_, trueValue:"TRUE", falseValue:"FALSE", onChange:LaTabView.onFormFieldChanged,labelCssClass:"xform_label", align:_LEFT_},
							{ref:LaCos.A_liquidFeatureChangePasswordEnabled, type:_CHECKBOX_, msgName:LaMsg.NAD_FeatureChangePasswordEnabled,label:LaMsg.NAD_FeatureChangePasswordEnabled+":", labelLocation:_LEFT_, trueValue:"TRUE", falseValue:"FALSE",labelCssClass:"xform_label", align:_LEFT_},
							{ref:LaCos.A_liquidFeatureInitialSearchPreferenceEnabled, type:_CHECKBOX_, msgName:LaMsg.NAD_FeatureInitialSearchPreferenceEnabled,label:LaMsg.NAD_FeatureInitialSearchPreferenceEnabled+":", labelLocation:_LEFT_, trueValue:"TRUE", falseValue:"FALSE", onChange:LaTabView.onFormFieldChanged,labelCssClass:"xform_label", align:_LEFT_},
							{ref:LaCos.A_liquidFeatureFiltersEnabled, type:_CHECKBOX_, msgName:LaMsg.NAD_FeatureFiltersEnabled,label:LaMsg.NAD_FeatureFiltersEnabled+":", labelLocation:_LEFT_, trueValue:"TRUE", falseValue:"FALSE", onChange:LaTabView.onFormFieldChanged,labelCssClass:"xform_label", align:_LEFT_},
							{ref:LaCos.A_liquidFeatureHtmlComposeEnabled, type:_CHECKBOX_, msgName:LaMsg.NAD_liquidFeatureHtmlComposeEnabled,label:LaMsg.NAD_liquidFeatureHtmlComposeEnabled+":", labelLocation:_LEFT_, trueValue:"TRUE", falseValue:"FALSE", onChange:LaTabView.onFormFieldChanged,labelCssClass:"xform_label", align:_LEFT_},							
							{ref:LaCos.A_liquidFeatureGalEnabled, type:_CHECKBOX_, msgName:LaMsg.NAD_FeatureGalEnabled,label:LaMsg.NAD_FeatureGalEnabled+":", labelLocation:_LEFT_, trueValue:"TRUE", falseValue:"FALSE", onChange:LaTabView.onFormFieldChanged,labelCssClass:"xform_label", align:_LEFT_},							
							{ref:LaCos.A_liquidImapEnabled, type:_CHECKBOX_, msgName:LaMsg.NAD_liquidImapEnabled,label:LaMsg.NAD_liquidImapEnabled+":", labelLocation:_LEFT_, trueValue:"TRUE", falseValue:"FALSE", onChange:LaTabView.onFormFieldChanged,labelCssClass:"xform_label", align:_LEFT_},
							{ref:LaCos.A_liquidPop3Enabled, type:_CHECKBOX_, msgName:LaMsg.NAD_liquidPop3Enabled,label:LaMsg.NAD_liquidPop3Enabled+":", labelLocation:_LEFT_, trueValue:"TRUE", falseValue:"FALSE", onChange:LaTabView.onFormFieldChanged,labelCssClass:"xform_label", align:_LEFT_}														
						]
					},
					{type:_CASE_,relevant:"instance[LaModel.currentTab] == 3",
						items :[
							{ref:LaCos.A_liquidPrefSaveToSent, type:_CHECKBOX_, msgName:LaMsg.NAD_prefSaveToSent,label:LaMsg.NAD_prefSaveToSent+":", labelLocation:_LEFT_, trueValue:"TRUE", falseValue:"FALSE", onChange:LaTabView.onFormFieldChanged,labelCssClass:"xform_label", align:_LEFT_},
							{ref:LaCos.A_liquidPrefMessageViewHtmlPreferred, type:_CHECKBOX_, msgName:LaMsg.NAD_liquidPrefMessageViewHtmlPreferred,label:LaMsg.NAD_liquidPrefMessageViewHtmlPreferred+":", labelLocation:_LEFT_, trueValue:"TRUE", falseValue:"FALSE", onChange:LaTabView.onFormFieldChanged,labelCssClass:"xform_label", align:_LEFT_},
							{ref:LaCos.A_liquidPrefGroupMailBy, type:_OSELECT1_, msgName:LaMsg.NAD_liquidPrefGroupMailBy,label:LaMsg.NAD_liquidPrefGroupMailBy+":", labelLocation:_LEFT_, onChange:LaTabView.onFormFieldChanged},							
							{ref:LaCos.A_liquidPrefComposeInNewWindow, type:_CHECKBOX_, msgName:LaMsg.NAD_liquidPrefComposeInNewWindow,label:LaMsg.NAD_liquidPrefComposeInNewWindow+":", labelLocation:_LEFT_, trueValue:"TRUE", falseValue:"FALSE", onChange:LaTabView.onFormFieldChanged,labelCssClass:"xform_label", align:_LEFT_},							
							{ref:LaCos.A_liquidPrefForwardReplyInOriginalFormat, type:_CHECKBOX_, msgName:LaMsg.NAD_liquidPrefForwardReplyInOriginalFormat,label:LaMsg.NAD_liquidPrefForwardReplyInOriginalFormat+":", labelLocation:_LEFT_, trueValue:"TRUE", falseValue:"FALSE", onChange:LaTabView.onFormFieldChanged,labelCssClass:"xform_label", align:_LEFT_},
							{ref:LaCos.A_liquidPrefComposeFormat, type:_OSELECT1_, msgName:LaMsg.NAD_liquidPrefComposeFormat,label:LaMsg.NAD_liquidPrefComposeFormat+":", labelLocation:_LEFT_, onChange:LaTabView.onFormFieldChanged},
							{ref:LaCos.A_liquidPrefMailSignatureStyle, type:_OSELECT1_, msgName:LaMsg.NAD_liquidPrefMailSignatureStyle,label:LaMsg.NAD_liquidPrefMailSignatureStyle+":", labelLocation:_LEFT_, onChange:LaTabView.onFormFieldChanged},							
							{ref:LaCos.A_liquidPrefAutoAddAddressEnabled, type:_CHECKBOX_, msgName:LaMsg.NAD_liquidPrefAutoAddAddressEnabled,label:LaMsg.NAD_liquidPrefAutoAddAddressEnabled+":", labelLocation:_LEFT_, trueValue:"TRUE", falseValue:"FALSE", onChange:LaTabView.onFormFieldChanged,labelCssClass:"xform_label", align:_LEFT_},
							{type:_SEPARATOR_},	
							{ref:LaCos.A_liquidPrefContactsPerPage, type:_OSELECT1_, msgName:LaMsg.NAD_PrefContactsPerPage,label:LaMsg.NAD_PrefContactsPerPage+":", labelLocation:_LEFT_, onChange:LaTabView.onFormFieldChanged},
							{ref:LaCos.A_liquidPrefMailItemsPerPage, type:_OSELECT1_, msgName:LaMsg.NAD_liquidPrefMailItemsPerPage,label:LaMsg.NAD_liquidPrefMailItemsPerPage+":", labelLocation:_LEFT_, onChange:LaTabView.onFormFieldChanged},
							{ref:LaCos.A_liquidPrefMailInitialSearch, type:_TEXTFIELD_, cssClass:"admin_xform_name_input", msgName:LaMsg.NAD_liquidPrefMailInitialSearch,label:LaMsg.NAD_liquidPrefMailInitialSearch+":", labelLocation:_LEFT_, onChange:LaTabView.onFormFieldChanged},
							{ref:LaCos.A_liquidPrefShowSearchString, type:_CHECKBOX_, msgName:LaMsg.NAD_liquidPrefShowSearchString,label:LaMsg.NAD_liquidPrefShowSearchString+":", labelLocation:_LEFT_, trueValue:"TRUE", falseValue:"FALSE", onChange:LaTabView.onFormFieldChanged,labelCssClass:"xform_label", align:_LEFT_},
							{ref:LaCos.A_liquidPrefUseTimeZoneListInCalendar, type:_CHECKBOX_, msgName:LaMsg.NAD_liquidPrefUseTimeZoneListInCalendar,label:LaMsg.NAD_liquidPrefUseTimeZoneListInCalendar+":", labelLocation:_LEFT_, trueValue:"TRUE", falseValue:"FALSE", onChange:LaTabView.onFormFieldChanged,labelCssClass:"xform_label", align:_LEFT_},
							{ref:LaCos.A_liquidPrefImapSearchFoldersEnabled, type:_CHECKBOX_, msgName:LaMsg.NAD_liquidPrefImapSearchFoldersEnabled,label:LaMsg.NAD_liquidPrefImapSearchFoldersEnabled+":", labelLocation:_LEFT_, trueValue:"TRUE", falseValue:"FALSE", onChange:LaTabView.onFormFieldChanged,labelCssClass:"xform_label", align:_LEFT_}
						]
					},
					{type:_CASE_, relevant:"instance[LaModel.currentTab]==4",
						items: [
							{ sourceRef: LaCos.A_liquidMailAllServersInternal,
					  	  	  ref: LaCos.A_liquidMailHostPoolInternal, type: _DWT_ADD_REMOVE_,
							  listCssClass: "DwtAddRemoveListView LaGlobalAttachExt", sorted: true,
					  	  	  onChange: LaTabView.onFormFieldChanged
					  	  	}
						]
					},
					{type:_CASE_, relevant:"instance[LaModel.currentTab]==5",
						items: [
							{type:_GROUP_, numCols:2,
								items :[
									{ref:LaCos.A_liquidAttachmentsBlocked, type:_CHECKBOX_,  msgName:LaMsg.NAD_RemoveAllAttachments,label:LaMsg.NAD_RemoveAllAttachments+":", labelLocation:_LEFT_, trueValue:"TRUE", falseValue:"FALSE", onChange:LaTabView.onFormFieldChanged,labelCssClass:"xform_label", align:_LEFT_},
									{ref:LaCos.A_liquidAttachmentsViewInHtmlOnly, type:_CHECKBOX_, 
										msgName:LaMsg.NAD_AttachmentsViewInHtmlOnly,label:LaMsg.NAD_AttachmentsViewInHtmlOnly+":", labelLocation:_LEFT_, trueValue:"TRUE", falseValue:"FALSE", onChange:LaTabView.onFormFieldChanged,labelCssClass:"xform_label", align:_LEFT_,
										relevant:"instance.globalConfig.attrs[LaGlobalConfig.A_liquidComponentAvailable_convertd]",
										relevantBehavior:_HIDE_
									},	
									{ref:LaCos.A_liquidAttachmentsIndexingEnabled, type:_CHECKBOX_, msgName:LaMsg.NAD_liquidAttachmentsIndexingEnabled,label:LaMsg.NAD_liquidAttachmentsIndexingEnabled+":", labelLocation:_LEFT_, trueValue:"TRUE", falseValue:"FALSE", onChange:LaTabView.onFormFieldChanged,labelCssClass:"xform_label", align:_LEFT_,
										relevant:"instance.globalConfig.attrs[LaGlobalConfig.A_liquidComponentAvailable_convertd]",
										relevantBehavior:_HIDE_
									},
									{ref:LaCos.A_liquidMailQuota, type:_TEXTFIELD_, msgName:LaMsg.NAD_MailQuota,label:LaMsg.NAD_MailQuota+":", labelLocation:_LEFT_, cssClass:"admin_xform_number_input", onChange:LaTabView.onFormFieldChanged},
									{ref:LaCos.A_liquidContactMaxNumEntries, type:_INPUT_, msgName:LaMsg.NAD_ContactMaxNumEntries,label:LaMsg.NAD_ContactMaxNumEntries+":", labelLocation:_LEFT_, cssClass:"admin_xform_number_input", onChange:LaTabView.onFormFieldChanged},
									{ref:LaCos.A_liquidMinPwdLength, type:_TEXTFIELD_, msgName:LaMsg.NAD_passMinLength,label:LaMsg.NAD_passMinLength+":", labelLocation:_LEFT_, cssClass:"admin_xform_number_input", onChange:LaTabView.onFormFieldChanged},
									{ref:LaCos.A_liquidMaxPwdLength, type:_INPUT_, msgName:LaMsg.NAD_passMaxLength,label:LaMsg.NAD_passMaxLength+":", labelLocation:_LEFT_, cssClass:"admin_xform_number_input", onChange:LaTabView.onFormFieldChanged},
									{ref:LaCos.A_liquidMinPwdAge, type:_INPUT_, msgName:LaMsg.NAD_passMinAge,label:LaMsg.NAD_passMinAge+":", labelLocation:_LEFT_, cssClass:"admin_xform_number_input", onChange:LaTabView.onFormFieldChanged},
									{ref:LaCos.A_liquidMaxPwdAge, type:_INPUT_, msgName:LaMsg.NAD_passMaxAge,label:LaMsg.NAD_passMaxAge+":", labelLocation:_LEFT_, cssClass:"admin_xform_number_input", onChange:LaTabView.onFormFieldChanged},
									{ref:LaCos.A_liquidEnforcePwdHistory, type:_INPUT_, msgName:LaMsg.NAD_passEnforceHistory,label:LaMsg.NAD_passEnforceHistory+":", labelLocation:_LEFT_, cssClass:"admin_xform_number_input", onChange:LaTabView.onFormFieldChanged},
									{ref:LaCos.A_liquidPasswordLocked, type:_CHECKBOX_, msgName:LaMsg.NAD_PwdLocked,label:LaMsg.NAD_PwdLocked+":", labelLocation:_LEFT_, trueValue:"TRUE", falseValue:"FALSE", onChange:LaTabView.onFormFieldChanged,labelCssClass:"xform_label", align:_LEFT_},
									{ref:LaCos.A_liquidAuthTokenLifetime, type:_LIFETIME1_, msgName:LaMsg.NAD_AuthTokenLifetime,label:LaMsg.NAD_AuthTokenLifetime+":",labelLocation:_LEFT_, onChange:LaTabView.onFormFieldChanged},																		
									{ref:LaCos.A_liquidMailMessageLifetime, type:_LIFETIME1_, msgName:LaMsg.NAD_MailMessageLifetime,label:LaMsg.NAD_MailMessageLifetime+":",labelLocation:_LEFT_, onChange:LaTabView.onFormFieldChanged},
									{ref:LaCos.A_liquidMailTrashLifetime, type:_LIFETIME1_, msgName:LaMsg.NAD_MailTrashLifetime,label:LaMsg.NAD_MailTrashLifetime+":", labelLocation:_LEFT_, onChange:LaTabView.onFormFieldChanged},
									{ref:LaCos.A_liquidMailSpamLifetime, type:_LIFETIME1_, msgName:LaMsg.NAD_MailSpamLifetime,label:LaMsg.NAD_MailSpamLifetime+":", labelLocation:_LEFT_, onChange:LaTabView.onFormFieldChanged}
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