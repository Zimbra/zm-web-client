/**
* @class LaDomainXFormView
* @contructor
* @param parent
* @param app
* @author Greg Solovyev
**/
function LaDomainXFormView (parent, app) {
	LaTabView.call(this, parent, app);	
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
	
	this.initForm(LaDomain.myXModel,this.getMyXForm());
}

LaDomainXFormView.prototype = new LaTabView();
LaDomainXFormView.prototype.constructor = LaDomainXFormView;

/**
* @method setObject sets the object contained in the view
* @param entry - LaDomain object to display
**/
LaDomainXFormView.prototype.setObject =
function(entry) {
	this._containedObject = new Object();
	this._containedObject.attrs = new Object();

	for (var a in entry.attrs) {
		this._containedObject.attrs[a] = entry.attrs[a];
	}

	if(!entry[LaModel.currentTab])
		this._containedObject[LaModel.currentTab] = "1";
	else
		this._containedObject[LaModel.currentTab] = entry[LaModel.currentTab];
		
	this._localXForm.setInstance(this._containedObject);
}

LaDomainXFormView.prototype.getMyXForm = function() {	
	var xFormObject = {
		tableCssStyle:"width:100%;overflow:auto;",
		items: [
			{type:_GROUP_, cssClass:"AdminTitleBar", colSpan: "*", 
				items: [
					{type:_OUTPUT_, ref:LaDomain.A_domainName, label:LaMsg.NAD_Domain},
					{type:_OUTPUT_, ref:LaItem.A_liquidId, label:LaMsg.NAD_LiquidID}
				]
			},
			{type:_TAB_BAR_,  ref:LaModel.currentTab,
				choices:[
					{value:1, label:LaMsg.Domain_Tab_General},
					{value:2, label:LaMsg.Domain_Tab_GAL},
					{value:3, label:LaMsg.Domain_Tab_Authentication}
				]
			},
			{type:_SWITCH_, items:[
					{type:_CASE_, relevant:"instance[LaModel.currentTab] == 1", 
					items:[
							{ ref: LaDomain.A_domainName, type:_OUTPUT_, 
							  label:LaMsg.Domain_DomainName
							},
							{ ref: LaDomain.A_description, type:_INPUT_, 
							  label:LaMsg.NAD_Description+":", width: "30em",
							  onChange:LaTabView.onFormFieldChanged
						  	},
							{ ref: LaDomain.A_notes, type:_TEXTAREA_, 
							  label:LaMsg.NAD_Notes+":", labelCssStyle:"vertical-align:top", width: "30em",
							  onChange:LaTabView.onFormFieldChanged
							}
						]
					},
					{type:_CASE_, relevant:"instance[LaModel.currentTab] == 2", 
						items: [
							{ref:LaDomain.A_GalMode, type:_OUTPUT_, label:LaMsg.Domain_GalMode, choices:this.GALModes},
							{ref:LaDomain.A_GalMaxResults, type:_OUTPUT_, label:LaMsg.NAD_GalMaxResults, autoSaveValue:true},
							{type:_GROUP_, relevant:"instance.attrs[LaDomain.A_GalMode]!=LaDomain.GAL_Mode_internal", relevantBehavior:_HIDE_,useParentTable:true, colSpan:"*",
								items: [
									{ref:LaDomain.A_GALServerType, type:_OUTPUT_, label:LaMsg.Domain_GALServerType, choices:this.GALServerTypes, labelLocation:_LEFT_},
									{ref:LaDomain.A_GalLdapFilter, type:_OUTPUT_, label:LaMsg.Domain_GalLdapFilter, labelLocation:_LEFT_, relevant:"instance[LaDomain.A_GALServerType] == 'ldap'", relevantBehavior:_HIDE_},
									{ref:LaDomain.A_GalLdapSearchBase, type:_OUTPUT_, label:LaMsg.Domain_GalLdapSearchBase, labelLocation:_LEFT_},
									{ref:LaDomain.A_GalLdapURL, type:_OUTPUT_, label:LaMsg.Domain_GalLdapURL, labelLocation:_LEFT_},
									{ref:LaDomain.A_GalLdapBindDn, type:_OUTPUT_, label:LaMsg.Domain_GalLdapBindDn, labelLocation:_LEFT_, relevant:"instance[LaDomain.A_UseBindPassword] == 'TRUE'", relevantBehavior:_DISABLE_}
								]
							}
						]						
					}, 
					{type:_CASE_, relevant:"instance[LaModel.currentTab] == 3", 
						items: [
							{ref:LaDomain.A_AuthMech, type:_OUTPUT_, label:LaMsg.Domain_AuthMech, choices:this.AuthMechs},
							{type:_SWITCH_,useParentTable:true, colSpan:"*",
								items: [
									{type:_CASE_,useParentTable:true, colSpan:"*", relevant:"instance.attrs[LaDomain.A_AuthMech]==LaDomain.AuthMech_ad",
										items:[
											{ref:LaDomain.A_AuthLdapUserDn, type:_OUTPUT_, label:LaMsg.Domain_AuthLdapUserDn, labelLocation:_LEFT_},
											{ref:LaDomain.A_AuthLdapURL, type:_OUTPUT_, label:LaMsg.Domain_AuthLdapURL, labelLocation:_LEFT_}
										]
									},
									{type:_CASE_,useParentTable:true, colSpan:"*", relevant:"instance.attrs[LaDomain.A_AuthMech]==LaDomain.AuthMech_ldap",
										items:[
											{ref:LaDomain.A_AuthLdapUserDn, type:_OUTPUT_, label:LaMsg.Domain_AuthLdapUserDn, labelLocation:_LEFT_},
											{ref:LaDomain.A_AuthLdapURL, type:_OUTPUT_, label:LaMsg.Domain_AuthLdapURL, labelLocation:_LEFT_}
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