/**
* @class GlobalConfigXFormView
* @contructor
* @param parent
* @param app
* @author Greg Solovyev
**/
function GlobalConfigXFormView (parent, app) {
	LaTabView.call(this, parent, app);	
	this.initForm(LaGlobalConfig.myXModel,this.getMyXForm());
}

GlobalConfigXFormView.prototype = new LaTabView();
GlobalConfigXFormView.prototype.constructor = GlobalConfigXFormView;

GlobalConfigXFormView.prototype.getMyXForm = function() {	
	var xFormObject = {
		tableCssStyle:"width:100%;position:static;overflow:auto;",
		items: [
			{ type: _DWT_ALERT_,
			  style: DwtAlert.WARNING,
			  iconVisible: false, 
			  content: LaMsg.Alert_GlobalConfig
			},
			{type:_TAB_BAR_,  ref:LaModel.currentTab,
				choices:[
					{value:1, label:LaMsg.NAD_Tab_General},
					{value:2, label:LaMsg.NAD_Tab_Attachments},
					{value:3, label:LaMsg.NAD_Tab_MTA},
					{value:4, label:LaMsg.NAD_Tab_POP},
					{value:5, label:LaMsg.NAD_Tab_IMAP},
					{value:6, label:LaMsg.NAD_Tab_AntiSpam},
					{value:7, label:LaMsg.NAD_Tab_AntiVirus}
				]
			},
			{type:_SWITCH_, items:[
					{type:_CASE_, relevant:"instance[LaModel.currentTab] == 1", items:[
							{ ref: LaGlobalConfig.A_liquidGalMaxResults, type:_INPUT_, 
							  label: LaMsg.NAD_GalMaxResults, width: "5em",
							  onChange:LaTabView.onFormFieldChanged
							},
							{ ref: LaGlobalConfig.A_liquidDefaultDomainName, type:_OSELECT1_, 
							  label: LaMsg.NAD_DefaultDomainName, //width: "10em",
							  choices: this._app.getDomainListChoices(), 
							  onChange:LaTabView.onFormFieldChanged
							}
						]
					},
					{type:_CASE_, relevant:"instance[LaModel.currentTab] == 2", items:[
					  	{ type: _GROUP_, 
					  	  label: LaMsg.NAD_Attach_IncomingAttachments, labelCssStyle: "vertical-align:top",
					  	  items: [
							{ ref: LaGlobalConfig.A_liquidAttachmentsBlocked, type: _CHECKBOX_, 
							  label: LaMsg.NAD_Attach_RemoveAllAttachments,
							  trueValue: "TRUE", falseValue: "FALSE", 
							  onChange: LaTabView.onFormFieldChanged
					    	},
					    	{ type: _GROUP_, useParentTable: true, 
							  relevant: "instance.attrs[LaGlobalConfig.A_liquidComponentAvailable_convertd]", 
							  relevantBehavior: _HIDE_,
					    	  items: [
								{ ref: LaGlobalConfig.A_liquidAttachmentsViewInHtmlOnly, type: _CHECKBOX_, 
								  relevant: "instance.attrs[LaGlobalConfig.A_liquidAttachmentsBlocked] == 'FALSE'", 
								  relevantBehavior: _DISABLE_,
								  label: LaMsg.NAD_Attach_ViewInHtml,
								  trueValue:"TRUE", falseValue:"FALSE", 
								  onChange: LaTabView.onFormFieldChanged
								}
					    	]}
				    	]},
					  	{ type: _GROUP_, 
					  	  label: "", labelCssStyle: "vertical-align:top",
					  	  items: [
					  	  	{ type: _SEPARATOR_, colSpan: "*" },
					  	    { type: _OUTPUT_, labelLocation: _NONE_,
					  	      value: LaMsg.NAD_Attach_RemoveAttachmentsByExt, colSpan: "*"
				  	      	},
					  	  	{ sourceRef: LaGlobalConfig.A_liquidMtaCommonBlockedExtension,
					  	  	  ref: LaGlobalConfig.A_liquidMtaBlockedExtension, type: _DWT_ADD_REMOVE_,
					  	  	  listCssClass: "DwtAddRemoveListView LaGlobalAttachExt", sorted: true,
					  	  	  id: "addremove_"+LaGlobalConfig.A_liquidMtaBlockedExtension,
					  	  	  onChange: LaTabView.onFormFieldChanged
					  	  	}
				    	]},
				    	{ type: _GROUP_, label: "", labelCssStyle: "vertical-align:top",
				    	  useParentTable: false, numCols: 3, 
				    	  items: [
				    	  	{ ref: LaGlobalConfig.A_liquidNewExtension, type: _INPUT_,
					  	  	  id: "input_"+LaGlobalConfig.A_liquidMtaBlockedExtension,
				    	  	  label: LaMsg.NAD_Attach_NewExtension
				    	  	},
				    	  	{ type: _DWT_BUTTON_, label: LaMsg.NAD_Attach_AddExtension,
				    	  	  onActivate: function() {
				    	  	  	var form = this.getForm();
				    	  	  	form.onCloseForm(); // HACK
				    	  	  	var value = form.get(LaGlobalConfig.A_liquidNewExtension);
				    	  	  	if (!value) {
				    	  	  		return;
			    	  	  		}
				    	  	  	value = value.replace(/^\s+/,"").replace(/\s+$/,"");
				    	  	  	if (value == "") {
				    	  	  		return;
				    	  	  	}
				    	  	  	
								// NOTE: The id property is needed by the list view
				    	  	  	value = new String(value);
				    	  	  	value.id = "id_"+value;
				    	  	  	
				    	  	  	// NOTE: form item's id is prefixed with form's id + underscore
				    	  	  	var addRemoveId = form.getId()+"_addremove_"+LaGlobalConfig.A_liquidMtaBlockedExtension;
				    	  	  	var addRemoveFormItem = form.getItemById(addRemoveId);
				    	  	  	var addRemoveWidget = addRemoveFormItem .getWidget();
				    	  	  	addRemoveWidget.addTargetItem(value);
				    	  	  	
				    	  	  	var newExtId = form.getId()+"_input_"+LaGlobalConfig.A_liquidMtaBlockedExtension;
				    	  	  	var newExtFormItem =form.getItemById(newExtId);
				    	  	  	newExtFormItem.setInstanceValue("");
				    	  	  	form.refresh();
				    	  	  }
				    	  	}
				    	]}
					]},
					{type:_CASE_, relevant:"instance[LaModel.currentTab] == 3", items:[
						{ type: _GROUP_, label: LaMsg.NAD_MTA_Authentication, labelCssStyle: "vertical-align:top",
						  items: [
						  	{ ref: LaGlobalConfig.A_liquidMtaAuthEnabled, type: _CHECKBOX_,
						   	  label: LaMsg.NAD_MTA_AuthenticationEnabled,
						   	  trueValue: "TRUE", falseValue: "FALSE",
						   	  onChange: LaTabView.onFormFieldChanged
					   	    },
					   	    { ref: LaGlobalConfig.A_liquidMtaTlsAuthOnly, type: _CHECKBOX_,
					   	      relevant: "instance.attrs[LaGlobalConfig.A_liquidMtaAuthEnabled] == 'TRUE'", relevantBehavior: _DISABLE_,
					   	      label: LaMsg.NAD_MTA_TlsAuthenticationOnly,
					   	      trueValue: "TRUE", falseValue: "FALSE",
						   	  onChange: LaTabView.onFormFieldChanged
						   	}
					   	]},
						{ type: _SEPARATOR_, numCols: 2 },
						{ type: _COMPOSITE_, useParentTable: false,
						  label: LaMsg.NAD_MTA_WebMailHostname, labelCssStyle: "vertical-align:top",
						  items: [
							{ ref: LaGlobalConfig.A_liquidSmtpHostname, type: _INPUT_, 
							  labelLocation: _NONE_, width: "18em",
							  onChange:LaTabView.onFormFieldChanged
							},
							{ ref: LaGlobalConfig.A_liquidSmtpPort, type: _OUTPUT_, 
							  label: LaMsg.NAD_MTA_WebMailPort, labelLocation: _LEFT_, width: "4em"
						    }
						]},
						{ ref: LaGlobalConfig.A_liquidMtaRelayHost, type: _INPUT_,
						  label: LaMsg.NAD_MTA_RelayHostname, width: "18em",
						  onChange:LaTabView.onFormFieldChanged
						},
						{ ref: LaGlobalConfig.A_liquidMtaMaxMessageSize, type: _INPUT_, 
						  label: LaMsg.NAD_MTA_MaxMsgSize, width: "6em",
						  onChange:LaTabView.onFormFieldChanged
  						},
						{ type: _GROUP_, label: LaMsg.NAD_MTA_Options, labelCssStyle: "vertical-align:top",
						  items: [
						  	{ ref: LaGlobalConfig.A_liquidMtaDnsLookupsEnabled, type: _CHECKBOX_,
						  	  label: LaMsg.NAD_MTA_DnsLookups, labelLocation: _RIGHT_,
						  	  trueValue: "TRUE", falseValue: "FALSE",
							  onChange:LaTabView.onFormFieldChanged
						  	}
						]},
						{ type: _SEPARATOR_, numCols: 2 },
						{ type: _GROUP_, label: LaMsg.NAD_MTA_ProtocolChecks, labelCssStyle: "vertical-align:top",
						  items: [
						  	{ ref: LaGlobalConfig.A_liquidMtaRejectInvalidHostname, type: _CHECKBOX_,
						  	  label: LaMsg.NAD_MTA_reject_invalid_hostname,
							  onChange: LaTabView.onFormFieldChanged
							  
						  	},
						  	{ ref: LaGlobalConfig.A_liquidMtaRejectNonFqdnHostname, type: _CHECKBOX_,
						  	  label: LaMsg.NAD_MTA_reject_non_fqdn_hostname,
							  onChange: LaTabView.onFormFieldChanged
						  	},
						  	{ ref: LaGlobalConfig.A_liquidMtaRejectNonFqdnSender, type: _CHECKBOX_,
						  	  label: LaMsg.NAD_MTA_reject_non_fqdn_sender,
							  onChange: LaTabView.onFormFieldChanged
						  	}
						]},
						{ type: _GROUP_, label: LaMsg.NAD_MTA_DnsChecks, labelCssStyle: "vertical-align:top",
						  items: [
						  	{ ref: LaGlobalConfig.A_liquidMtaRejectUnknownClient, type: _CHECKBOX_,
						  	  label: LaMsg.NAD_MTA_reject_unknown_client,
							  onChange: LaTabView.onFormFieldChanged
						  	},
						  	{ ref: LaGlobalConfig.A_liquidMtaRejectUnknownHostname, type: _CHECKBOX_,
						  	  label: LaMsg.NAD_MTA_reject_unknown_hostname,
							  onChange: LaTabView.onFormFieldChanged
						  	},
						  	{ ref: LaGlobalConfig.A_liquidMtaRejectUnknownSenderDomain, type: _CHECKBOX_,
						  	  label: LaMsg.NAD_MTA_reject_unknown_sender_domain,
							  onChange: LaTabView.onFormFieldChanged
						  	}
						]}
						/***
						// Checks if client is listed in DNS Block Lists. We do not support or 
						// endorse these lists. Here for convenience only. May require subscriptions 
						// or be capped.
						{ type: _GROUP_, label: "DNSBL Checks:", labelCssStyle: "vertical-align:top",
						  items: [
						  	{ type: _CHECKBOX_,
						  	  label: "NJABL (reject_rbl_client dnsbl.njabl.org)"
						  	},
						  	{ type: _CHECKBOX_,
						  	  label: "Blitzed (reject_rbl_client opm.blitzed.org)"
						  	},
						  	{ type: _CHECKBOX_,
						  	  label: "ORDB (reject_rbl_client relays.ordb.org)"
						  	},
						  	{ type: _CHECKBOX_,
						  	  label: "CBL (reject_rbl_client cbl.abuseat.org)"
						  	},
						  	{ type: _CHECKBOX_,
						  	  label: "SpamCop (reject_rbl_client bl.spamcop.net)"
						  	},
						  	{ type: _CHECKBOX_,
						  	  label: "SORBS (reject_rbl_client dnsbl.sorbs.net)"
						  	},
						  	{ type: _CHECKBOX_,
						  	  label: "Spamhaus SBL (reject_rbl_client sbl.spamhaus.org)"
						  	},
						  	{ type: _CHECKBOX_,
						  	  label: "MAPS RBL (reject_rbl_client relays.mail-abuse.org)"
						  	}
						]}
						/***/
					]},
					{type:_CASE_, relevant:"instance[LaModel.currentTab] == 4", 
						items: [
							{ type: _GROUP_, numCols: 2,
							  label: LaMsg.NAD_POP_Service, labelCssStyle: "vertical-align:top",
							  items: [
								{ ref: LaGlobalConfig.A_liquidPop3ServerEnabled, type: _CHECKBOX_, 
								  label: LaMsg.NAD_POP_Enabled,
								  trueValue: "TRUE", falseValue: "FALSE", 
								  onChange: LaTabView.onFormFieldChanged
							  	}
							  	/***
						  	  	{ ref: LaGlobalConfig.A_liquidPop3BindPort, type: _INPUT_, 
						  	  	  relevant: "instance.attrs[LaGlobalConfig.A_liquidPop3ServerEnabled] == 'TRUE'", 
						  	  	  relevantBehavior: _DISABLE_,
						  	  	  label: LaMsg.NAD_POP_Port, width: "4em",
						  	  	  onChange: LaTabView.onFormFieldChanged
					  	  	  	}
					  	  	  	/***/
							]},
							{ type: _GROUP_, numCols: 2,
							  label: LaMsg.NAD_POP_SSL, labelCssStyle: "vertical-align:top",
							  items: [
								{ ref: LaGlobalConfig.A_liquidPop3SSLServerEnabled, type: _CHECKBOX_, 
						  	  	  relevant: "instance.attrs[LaGlobalConfig.A_liquidPop3ServerEnabled] == 'TRUE'", 
						  	  	  relevantBehavior: _DISABLE_,
								  label: LaMsg.NAD_POP_Enabled,
								  trueValue: "TRUE", falseValue: "FALSE", 
								  onChange: LaTabView.onFormFieldChanged
							  	}
							  	/***
								{ ref: LaGlobalConfig.A_liquidPop3SSLBindPort, type:_INPUT_, 
						  	  	  relevant: "instance.attrs[LaGlobalConfig.A_liquidPop3ServerEnabled] == 'TRUE' && "+
						  	  	  			"instance.attrs[LaGlobalConfig.A_liquidPop3SSLServerEnabled] == 'TRUE'", 
			  	  	  			  relevantBehavior: _DISABLE_,
								  label: LaMsg.NAD_POP_Port, width: "4em",
								  onChange: LaTabView.onFormFieldChanged
							  	}
							  	/***/
							]},
							{ type: _GROUP_, label: LaMsg.NAD_POP_Options, labelCssStyle: "vertical-align:top",
							  items: [
							  	{ ref: LaGlobalConfig.A_liquidPop3CleartextLoginEnabled, type: _CHECKBOX_, 
						  	  	  relevant: "instance.attrs[LaGlobalConfig.A_liquidPop3ServerEnabled] == 'TRUE'", 
						  	  	  relevantBehavior: _DISABLE_,
							  	  label: LaMsg.NAD_POP_CleartextLoginEnabled,
							  	  trueValue: "TRUE", falseValue: "FALSE", 
							  	  onChange: LaTabView.onFormFieldChanged
						  	  	}
							]}
						]
					},
					{type:_CASE_, relevant:"instance[LaModel.currentTab] == 5",
						items: [
							{ type: _GROUP_, numCols: 2,
							  label: LaMsg.NAD_IMAP_Service, labelCssStyle: "vertical-align:top",
							  items: [
								{ ref: LaGlobalConfig.A_liquidImapServerEnabled, type:_CHECKBOX_, 
								  label: LaMsg.NAD_IMAP_Enabled, 
								  trueValue:"TRUE", falseValue:"FALSE", 
								  onChange:LaTabView.onFormFieldChanged
  							  	}
  							  	/***
						  	  	{ ref: LaGlobalConfig.A_liquidImapBindPort, type: _INPUT_, 
						  	  	  relevant: "instance.attrs[LaGlobalConfig.A_liquidImapServerEnabled] == 'TRUE'", 
						  	  	  relevantBehavior: _DISABLE_,
						  	  	  label: LaMsg.NAD_POP_Port, width: "4em",
						  	  	  onChange:LaTabView.onFormFieldChanged
					  	  	  	}
					  	  	  	/***/
				  	  	  	]},
							{ type: _GROUP_, numCols: 2,
							  label: LaMsg.NAD_IMAP_SSLService, labelCssStyle: "vertical-align:top",
							  items: [
							  	{ ref: LaGlobalConfig.A_liquidImapSSLServerEnabled, type:_CHECKBOX_, 
						  	  	  relevant: "instance.attrs[LaGlobalConfig.A_liquidImapServerEnabled] == 'TRUE'", 
						  	  	  relevantBehavior: _DISABLE_,
							  	  label: LaMsg.NAD_IMAP_Enabled, 
							  	  trueValue:"TRUE", falseValue:"FALSE", 
							  	  onChange:LaTabView.onFormFieldChanged
						  	  	}
						  	  	/***
								{ ref: LaGlobalConfig.A_liquidImapSSLBindPort, type:_INPUT_, 
						  	  	  relevant: "instance.attrs[LaGlobalConfig.A_liquidImapServerEnabled] == 'TRUE' && "+
						  	  	  			"instance.attrs[LaGlobalConfig.A_liquidImapSSLServerEnabled] == 'TRUE'",
			  	  	  			  relevantBehavior: _DISABLE_,
						  	  	  label: LaMsg.NAD_POP_Port, width: "4em",
								  onChange:LaTabView.onFormFieldChanged
							  	}
							  	/***/
						  	]},
						  	{ type: _GROUP_, label: LaMsg.NAD_IMAP_Options, labelCssStyle: "vertical-align:top",
						  	  items: [
								{ ref: LaGlobalConfig.A_liquidImapCleartextLoginEnabled, type:_CHECKBOX_, 
						  	  	  relevant: "instance.attrs[LaGlobalConfig.A_liquidImapServerEnabled] == 'TRUE'", 
						  	  	  relevantBehavior: _DISABLE_,
								  label: LaMsg.NAD_IMAP_CleartextLoginEnabled, 
								  trueValue:"TRUE", falseValue:"FALSE", 
								  onChange:LaTabView.onFormFieldChanged
							  	}
						  	]}
						]
					},
					// anti-spam
					{ type: _CASE_, relevant: "instance[LaModel.currentTab] == 6", 
					  items: [
					  	{ type: _GROUP_, label: LaMsg.NAD_Spam_Checking, items: [
						  	{ ref: LaGlobalConfig.A_liquidSpamCheckEnabled, type: _CHECKBOX_,
						  	  label: LaMsg.NAD_Spam_CheckingEnabled,
							  trueValue:"TRUE", falseValue:"FALSE", 
							  onChange: LaTabView.onFormFieldChanged
					  	    }
				  	    ]},
					  	{ ref: LaGlobalConfig.A_liquidSpamKillPercent, type: _INPUT_,
				   	      relevant: "instance.attrs[LaGlobalConfig.A_liquidSpamCheckEnabled] == 'TRUE'", relevantBehavior: _DISABLE_,
					  	  label: LaMsg.NAD_Spam_KillPercent, width: "4em",
						  onChange: LaTabView.onFormFieldChanged
					  	},
					  	{ ref: LaGlobalConfig.A_liquidSpamTagPercent, type: _INPUT_,
				   	      relevant: "instance.attrs[LaGlobalConfig.A_liquidSpamCheckEnabled] == 'TRUE'", relevantBehavior: _DISABLE_,
					  	  label: LaMsg.NAD_Spam_TagPercent, width: "4em",
						  onChange: LaTabView.onFormFieldChanged
					  	},
					  	{ ref: LaGlobalConfig.A_liquidSpamSubjectTag, type: _INPUT_,
				   	      relevant: "instance.attrs[LaGlobalConfig.A_liquidSpamCheckEnabled] == 'TRUE'", relevantBehavior: _DISABLE_,
					  	  label: LaMsg.NAD_Spam_SubjectPrefix, width: "20em",
						  onChange: LaTabView.onFormFieldChanged
					  	}
					]},
					// security: anti-virus
					{ type: _CASE_, relevant: "instance[LaModel.currentTab] == 7", 
					  items: [
					  	{ type: _GROUP_, label: LaMsg.NAD_Virus_Checking, items: [
						  	{ ref: LaGlobalConfig.A_liquidVirusCheckEnabled, type: _CHECKBOX_,
						  	  label: LaMsg.NAD_Virus_CheckingEnabled,
							  trueValue:"TRUE", falseValue:"FALSE", 
							  onChange: LaTabView.onFormFieldChanged
					  	    }
				  	    ]},
				  	    { ref: LaGlobalConfig.A_liquidVirusDefinitionsUpdateFrequency, type: _INPUT_,
				   	      relevant: "instance.attrs[LaGlobalConfig.A_liquidVirusCheckEnabled] == 'TRUE'", relevantBehavior: _DISABLE_,
				  	      label: LaMsg.NAD_Virus_DefUpdateFreq, width: "3em",
				  	      getDisplayValue: function(value) { return parseInt(value); },
				  	      elementChanged: function(elementValue, instanceValue, event) {
						    instanceValue = elementValue+"h";
						    this.getForm().itemChanged(this.getParentItem(), instanceValue, event);
						  },
						  onChange: LaTabView.onFormFieldChanged
				  	    },
				  	    { type: _GROUP_, label: LaMsg.NAD_Virus_Options, labelCssStyle: "vertical-align:top", items: [
					  	    { ref: LaGlobalConfig.A_liquidVirusBlockEncryptedArchive, type: _CHECKBOX_,
					   	      relevant: "instance.attrs[LaGlobalConfig.A_liquidVirusCheckEnabled] == 'TRUE'", relevantBehavior: _DISABLE_,
					  	      label: LaMsg.NAD_Virus_BlockEncrypted,
							  trueValue:"TRUE", falseValue:"FALSE", 
							  onChange: LaTabView.onFormFieldChanged
					  	    },
					  	    /***
						  	{ ref: LaGlobalConfig.A_liquidVirusWarnAdmin, type: _CHECKBOX_,
					   	      relevant: "instance.attrs[LaGlobalConfig.A_liquidVirusCheckEnabled] == 'TRUE'", relevantBehavior: _DISABLE_,
						  	  label: LaMsg.NAD_Virus_NotifyAdmin,
							  trueValue:"TRUE", falseValue:"FALSE", 
							  onChange: LaTabView.onFormFieldChanged
						  	},
						  	/***/
						  	{ ref: LaGlobalConfig.A_liquidVirusWarnRecipient, type: _CHECKBOX_,
					   	      relevant: "instance.attrs[LaGlobalConfig.A_liquidVirusCheckEnabled] == 'TRUE'", relevantBehavior: _DISABLE_,
						  	  label: LaMsg.NAD_Virus_NotifyRecipient,
							  trueValue:"TRUE", falseValue:"FALSE", 
							  onChange: LaTabView.onFormFieldChanged
						  	}
					  	]}
					]}
					
				]
			}	
		]
	};
	return xFormObject;
};
