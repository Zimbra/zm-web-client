/**
* @class LaServerXFormView
* @contructor
* @param parent
* @param app
* @author Greg Solovyev
**/
function LaServerXFormView (parent, app) {
	LaTabView.call(this, parent, app);	
	this.initForm(LaServer.myXModel,this.getMyXForm());
}

LaServerXFormView.prototype = new LaTabView();
LaServerXFormView.prototype.constructor = LaServerXFormView;

LaServerXFormView.onFormFieldChanged = 
function (value, event, form) {
	form.parent.setDirty(true);
	this.setInstanceValue(value);
	return value;
}

LaServerXFormView.prototype.getMyXForm = function() {	
	var xFormObject = {
		tableCssStyle:"width:100%;position:static;overflow:auto;",
		items: [
			{type:_GROUP_, cssClass:"AdminTitleBar", colSpan: "*", 
				items: [
					{type:_OUTPUT_, ref:LaServer.A_name, label:LaMsg.NAD_Server},
					{type:_OUTPUT_, ref:LaItem.A_liquidId, label:LaMsg.NAD_LiquidID}
				]
			},
			{ type: _DWT_ALERT_,
			  style: DwtAlert.WARNING,
			  iconVisible: false, 
			  content: LaMsg.Alert_ServerDetails
			},
			{type:_TAB_BAR_, ref:LaModel.currentTab,
				choices:[
					{value:1, label:LaMsg.NAD_Tab_General},
					{value:2, label:LaMsg.NAD_Tab_Services},
					{value:3, label:LaMsg.NAD_Tab_MTA},
					{value:4, label:LaMsg.NAD_Tab_IMAP},					
					{value:5, label:LaMsg.NAD_Tab_POP}										
				]
			},
			{type:_SWITCH_, items:[
					{type:_CASE_, relevant:"instance[LaModel.currentTab] == 1", 
						items:[
							{ref:LaServer.A_name, type:_OUTPUT_, label:LaMsg.NAD_DisplayName, labelLocation:_LEFT_},
							{ ref: LaServer.A_description, type:_INPUT_, 
							  label:LaMsg.NAD_Description, width: "30em",
							  onChange:LaServerXFormView.onFormFieldChanged
							},
							{ ref: LaServer.A_ServiceHostname, type:_INPUT_, 
							  label:LaMsg.NAD_ServiceHostname, width: "18em",
							  onChange:LaServerXFormView.onFormFieldChanged
							},
							{ ref: LaServer.A_LmtpAdvertisedName, type:_INPUT_, 
							  label: LaMsg.NAD_LmtpAdvertisedName, width: "18em",
							  onChange: LaServerXFormView.onFormFieldChanged
							},
							{ ref: LaServer.A_LmtpBindAddress, type:_INPUT_, 
							  label:LaMsg.NAD_LmtpBindAddress, width: "18em",
							  onChange:LaServerXFormView.onFormFieldChanged
							},
							/***
							{ref:LaServer.A_LmtpBindPort, type:_INPUT_, label:LaMsg.NAD_LmtpBindPort, labelLocation:_LEFT_, onChange:LaServerXFormView.onFormFieldChanged, autoSaveValue:true},									
							/***/
							{ ref: LaServer.A_notes, type:_TEXTAREA_, 
							  label: LaMsg.NAD_Notes, labelCssStyle: "vertical-align:top", width: "30em",
							  onChange:LaServerXFormView.onFormFieldChanged
						    }
						]
					},
					{type:_CASE_, relevant:"instance[LaModel.currentTab] == 2", 
						items:[
							{ type: _GROUP_, label: LaMsg.NAD_Service_EnabledServices, labelCssStyle: "vertical-align:top",
							  items: [
							  	{ ref: LaServer.A_liquidLdapServiceEnabled, type: _CHECKBOX_,
							  	  relevant: "instance.attrs[LaServer.A_liquidLdapServiceInstalled]", relevantBehavior: _DISABLE_,
							  	  label: LaMsg.NAD_Service_LDAP,
						  	      onChange: LaServerXFormView.onFormFieldChanged
							  	},
							  	{ ref: LaServer.A_liquidMailboxServiceEnabled, type: _CHECKBOX_,
							  	  relevant: "instance.attrs[LaServer.A_liquidMailboxServiceInstalled]", relevantBehavior: _DISABLE_,
							  	  label: LaMsg.NAD_Service_Mailbox,
						  	      onChange: LaServerXFormView.onFormFieldChanged
							  	},
							  	{ ref: LaServer.A_liquidMtaServiceEnabled, type: _CHECKBOX_,
							  	  relevant: "instance.attrs[LaServer.A_liquidMtaServiceInstalled]", relevantBehavior: _DISABLE_,
							  	  label: LaMsg.NAD_Service_MTA,
						  	      onChange: LaServerXFormView.onFormFieldChanged
							  	},
							  	{ ref: LaServer.A_liquidSnmpServiceEnabled, type: _CHECKBOX_,
							  	  relevant: "instance.attrs[LaServer.A_liquidSnmpServiceInstalled]", relevantBehavior: _DISABLE_,
							  	  label: LaMsg.NAD_Service_SNMP,
						  	      onChange: LaServerXFormView.onFormFieldChanged
							  	},
							  	{ ref: LaServer.A_liquidAntiSpamServiceEnabled, type: _CHECKBOX_,
							  	  relevant: "instance.attrs[LaServer.A_liquidAntiSpamServiceInstalled]", relevantBehavior: _DISABLE_,
							  	  label: LaMsg.NAD_Service_AntiSpam,
						  	      onChange: LaServerXFormView.onFormFieldChanged
							  	},
							  	{ ref: LaServer.A_liquidAntiVirusServiceEnabled, type: _CHECKBOX_,
							  	  relevant: "instance.attrs[LaServer.A_liquidAntiVirusServiceInstalled]", relevantBehavior: _DISABLE_,
							  	  label: LaMsg.NAD_Service_AntiVirus,
						  	      onChange: LaServerXFormView.onFormFieldChanged
							  	}
							]}
						]
					}, 
					{ type: _CASE_, relevant: "instance[LaModel.currentTab] == 3",
				      items: [
				        { type: _GROUP_, 
				          label: LaMsg.NAD_MTA_Authentication, labelCssStyle: "vertical-align:top",
				          items: [
					      	{ ref: LaServer.A_liquidMtaAuthEnabled, type: _CHECKBOX_,
					      	  label: LaMsg.NAD_MTA_AuthenticationEnabled,
					      	  trueValue: "TRUE", falseValue: "FALSE",
					      	  onChange: LaServerXFormView.onFormFieldChanged
				      	    },
					      	{ ref: LaServer.A_liquidMtaTlsAuthOnly, type: _CHECKBOX_,
					      	  relevant: "instance.attrs[LaServer.A_liquidMtaAuthEnabled] == 'TRUE'", 
					      	  relevantBehavior: _DISABLE_,
					      	  label: LaMsg.NAD_MTA_TlsAuthenticationOnly,
					      	  trueValue: "TRUE", falseValue: "FALSE",
					      	  onChange: LaServerXFormView.onFormFieldChanged
				      	    }
				      	]},
				      	{ type: _SEPARATOR_, numCols: 2 },
				      	{ type: _GROUP_, numCols: 4,
				      	  label: LaMsg.NAD_MTA_WebMailHostname,
				      	  items: [
							{ ref: LaServer.A_SmtpHostname, type:_INPUT_, 
							  labelPosition: _NONE_, width: "18em",
							  onChange: LaServerXFormView.onFormFieldChanged
							},
							{ ref: LaServer.A_SmtpPort, type:_OUTPUT_, 
							  label: LaMsg.NAD_MTA_WebMailPort, width: "4em"
							}
						]},
						{ ref: LaServer.A_SmtpTimeout, type:_INPUT_, 
						  label: LaMsg.NAD_MTA_WebMailTimeout, width: "4em",
						  onChange: LaServerXFormView.onFormFieldChanged
						},
				      	{ ref: LaServer.A_liquidMtaRelayHost, type: _INPUT_,
				      	  label: LaMsg.NAD_MTA_RelayHostname, width: "18em",
				      	  onChange: LaServerXFormView.onFormFieldChanged
				      	},
				        { type: _GROUP_, label: LaMsg.NAD_MTA_Options, labelCssStyle: "vertical-align:top",
				          items: [
					      	{ ref: LaServer.A_liquidMtaDnsLookupsEnabled, type: _CHECKBOX_,
					      	  label: LaMsg.NAD_MTA_DnsLookups,
					      	  trueValue: "TRUE", falseValue: "FALSE",
					      	  onChange: LaServerXFormView.onFormFieldChanged
				      	    }
				      	]}
				    ]},
					{type:_CASE_, relevant:"instance[LaModel.currentTab] == 4", 
						items:[
							{ type: _DWT_ALERT_,
							  labelLocation: _LEFT_, label: "",
							  style: DwtAlert.WARNING,
							  iconVisible: false, 
							  content: LaMsg.Alert_ServerRestart,
							  alertCssClass: "DwtAlertBare"
							},
							{ type: _GROUP_, numCols: 2,
							  label: LaMsg.NAD_IMAP_Service, labelCssStyle: "vertical-align:top",
							  items: [
								{ ref: LaServer.A_ImapServerEnabled, type:_CHECKBOX_, 
								  label: LaMsg.NAD_IMAP_Enabled, 
								  trueValue: "TRUE", falseValue: "FALSE", 
								  onChange: LaServerXFormView.onFormFieldChanged
							  	}
							  	/***
								{ ref: LaServer.A_ImapBindPort, type:_INPUT_, 
								  relevant: "instance.attrs[LaServer.A_ImapServerEnabled] == 'TRUE'",
								  relevantBehavior: _DISABLE_,
								  label: LaMsg.NAD_IMAP_Port, width: "4em",
								  onChange: LaServerXFormView.onFormFieldChanged
								}
								/***/
							]},
							{ type: _GROUP_, numCols: 2,
							  label: LaMsg.NAD_IMAP_SSLService, labelCssStyle: "vertical-align:top",
							  items: [
								{ ref: LaServer.A_ImapSSLServerEnabled, type:_CHECKBOX_, 
								  relevant: "instance.attrs[LaServer.A_ImapServerEnabled] == 'TRUE'",
								  relevantBehavior: _DISABLE_,
								  label: LaMsg.NAD_IMAP_Enabled, 
								  trueValue: "TRUE", falseValue: "FALSE", 
								  onChange: LaServerXFormView.onFormFieldChanged 
								}
								/***
								{ ref: LaServer.A_ImapSSLBindPort, type:_INPUT_, 
								  relevant: "instance.attrs[LaServer.A_ImapServerEnabled] == 'TRUE' && "+
								  			"instance.attrs[LaServer.A_ImapSSLServerEnabled] == 'TRUE'",
								  relevantBehavior: _DISABLE_,
								  label: LaMsg.NAD_IMAP_Port, width: "4em",
								  onChange: LaServerXFormView.onFormFieldChanged
							  	}
							  	/***/
							]},
							{ type: _GROUP_,
							  label: LaMsg.NAD_IMAP_Options, labelCssStyle: "vertical-align:top",
							  items: [
								{ ref: LaServer.A_ImapCleartextLoginEnabled, type:_CHECKBOX_, 
								  relevant: "instance.attrs[LaServer.A_ImapServerEnabled] == 'TRUE'",
								  relevantBehavior: _DISABLE_,
								  label: LaMsg.NAD_IMAP_CleartextLoginEnabled, 
								  trueValue: "TRUE", falseValue: "FALSE", 
								  onChange: LaServerXFormView.onFormFieldChanged
								}
							]}
						]
					},
					{type:_CASE_, relevant:"instance[LaModel.currentTab] == 5", 
						items:[
							{ type: _DWT_ALERT_,
							  labelLocation: _LEFT_, label: "",
							  style: DwtAlert.WARNING,
							  iconVisible: false, 
							  content: LaMsg.Alert_ServerRestart,
							  alertCssClass: "DwtAlertBare"
							},
							{ type: _GROUP_,
							  label: LaMsg.NAD_POP_Service, labelCssStyle: "vertical-align:top",
							  items: [
								{ ref: LaServer.A_Pop3ServerEnabled, type:_CHECKBOX_, 
								  label: LaMsg.NAD_POP_Enabled, 
								  trueValue: "TRUE", falseValue: "FALSE", 
								  onChange: LaServerXFormView.onFormFieldChanged
							  	}
							]},
							{ type: _GROUP_, numCols: 2,
							  label: LaMsg.NAD_POP_Address,
							  items: [
								{ ref: LaServer.A_Pop3BindAddress, type:_INPUT_, 
								  relevant: "instance.attrs[LaServer.A_Pop3ServerEnabled] == 'TRUE'",
								  relevantBehavior: _DISABLE_,
								  labelPosition: _NONE_, width: "18em",
								  onChange:LaServerXFormView.onFormFieldChanged
							  	}
							  	/***
								{ ref: LaServer.A_Pop3BindPort, type:_INPUT_, 
								  relevant: "instance.attrs[LaServer.A_Pop3ServerEnabled] == 'TRUE'",
								  relevantBehavior: _DISABLE_,
								  label: LaMsg.NAD_POP_Port, width: "4em",
								  onChange:LaServerXFormView.onFormFieldChanged
							  	}
							  	/***/
							]},
							{ ref: LaServer.A_Pop3AdvertisedName, type:_INPUT_, 
							  relevant: "instance.attrs[LaServer.A_Pop3ServerEnabled] == 'TRUE'",
							  relevantBehavior: _DISABLE_,
							  label: LaMsg.NAD_POP_AdvertisedName, width: "18em",
							  onChange: LaServerXFormView.onFormFieldChanged
							},
							{ ref: LaServer.A_Pop3NumThreads, type:_INPUT_, 
							  relevant: "instance.attrs[LaServer.A_Pop3ServerEnabled] == 'TRUE'",
							  relevantBehavior: _DISABLE_,
							  label: LaMsg.NAD_POP_NumThreads, width: "5em",
							  onChange: LaServerXFormView.onFormFieldChanged
							},
							{ type: _GROUP_, numCols: 2,
							  label: LaMsg.NAD_POP_SSL, labelCssStyle: "vertical-align:top",
							  items: [
								{ ref: LaServer.A_Pop3SSLServerEnabled, type:_CHECKBOX_, 
								  relevant: "instance.attrs[LaServer.A_Pop3ServerEnabled] == 'TRUE'",
								  relevantBehavior: _DISABLE_,
								  label: LaMsg.NAD_POP_Enabled, 
								  trueValue: "TRUE", falseValue: "FALSE", 
								  onChange: LaServerXFormView.onFormFieldChanged
								}
								/***
								{ ref: LaServer.A_Pop3SSLBindPort, type:_INPUT_, 
								  relevant: "instance.attrs[LaServer.A_Pop3ServerEnabled] == 'TRUE' && "+
								  			"instance.attrs[LaServer.A_Pop3SSLServerEnabled] == 'TRUE'",
								  relevantBehavior: _DISABLE_,
								  label: LaMsg.NAD_POP_Port, width: "4em",
								  onChange: LaServerXFormView.onFormFieldChanged
							  	}
							  	/***/
							]},
							{ type: _GROUP_,
							  label: LaMsg.NAD_POP_Options, labelCssStyle: "vertical-align:top",
							  items: [
								{ ref: LaServer.A_Pop3CleartextLoginEnabled, type:_CHECKBOX_, 
								  relevant: "instance.attrs[LaServer.A_Pop3ServerEnabled] == 'TRUE'",
								  relevantBehavior: _DISABLE_,
								  label: LaMsg.NAD_POP_CleartextLoginEnabled, 
								  trueValue: "TRUE", falseValue: "FALSE", 
								  onChange: LaServerXFormView.onFormFieldChanged
								}
							]},
						]
					}
					
				]
			}	
		]
	};
	return xFormObject;
};