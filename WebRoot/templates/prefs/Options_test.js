/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2006, 2007, 2009, 2010, 2013, 2014, 2016 Synacor, Inc.
 *
 * The contents of this file are subject to the Common Public Attribution License Version 1.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at: https://www.zimbra.com/license
 * The License is based on the Mozilla Public License Version 1.1 but Sections 14 and 15
 * have been added to cover use of software over a computer network and provide for limited attribution
 * for the Original Developer. In addition, Exhibit A has been modified to be consistent with Exhibit B.
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * See the License for the specific language governing rights and limitations under the License.
 * The Original Code is Zimbra Open Source Web Client.
 * The Initial Developer of the Original Code is Zimbra, Inc.  All rights to the Original Code were
 * transferred by Zimbra, Inc. to Synacor, Inc. on September 14, 2015.
 *
 * All portions of the code are Copyright (C) 2006, 2007, 2009, 2010, 2013, 2014, 2016 Synacor, Inc. All Rights Reserved.
 * ***** END LICENSE BLOCK *****
 */
var controller = {
	id : "Options",
	defaultPage : "pop",
	
	
	// set up the initial page
	init : function(templateId) {
		this.masterTemplateId = templateId;
	
		var body = Dwt.byTag("BODY")[0],
			outerTemplate = templateId+"#OptionsOuter"
		;
		AjxTemplate.setContent(body, outerTemplate, controller);

		this.showPage(util.getParamOrCookie("page", this.defaultPage));
	},
	
	
	showPage : function(pageName) {
		AjxCookie.setCookie(document,"page",pageName);
		var pageController = window.pageController = this.pageController = data[pageName];
		
		if (pageController == null) {
			return alert("Page " + pageName + " not found.");
		}

		// select proper tab
		this.selectTab("Options_outer_tabs", pageName);
		
		// set page title
		Dwt.byId(controller.id+"_page_title").innerHTML = pageController._labels.pageHeader;

		// install sub-templates
		pageController.masterTemplateId = templateId;
		this.initSubTemplates(pageController);
		
		// call init on the pageController, if defined
		if (typeof this.pageController.init == "function") this.pageController.init();	
	},
	
	initSubTemplates : function(controller) {
		// instantiate the controller templates, in order
		var templates = controller.templates;
		for (var i = 0; i < templates.length; i++) {
			var template = templates[i],
				elementId = template.elementId,
				templateId = template.templateId
			;
			if (elementId.charAt(0) == "_") {
				elementId = controller.id + elementId;
			}
			if (templateId.charAt(0) == "#") {
				templateId = controller.masterTemplateId + templateId;
			}
			AjxTemplate.setContent(elementId, templateId, controller);
		}
	},
	
	selectTab : function(tabListId, itemToSelectId) {
		var list = Dwt.byId(tabListId);
		itemToSelectId = tabListId + "_" + itemToSelectId;
		
		for (var i = 0; i < list.childNodes.length; i++) {
			var child = list.childNodes[i];
			if (child.tagName == "LI") {
				if (child.id == itemToSelectId) {
					Dwt.addClass(child, "selected");
				} else {
					Dwt.delClass(child, "selected");
				}
			}
		}
	}
}

var data = {
    id: controller.id
};



/////
//
//	Individual forms
//
/////



//
//	Identity form
//


data.identity = {
	controller : "data.identity",	
	id: data.id+"_identity",
	
	defaultPage : "options",
	
	templates : [
		{
			elementId : "Options_page_container",
			templateId : "#ListOptionPage"
		},
		{
			elementId : "_form_container",
			templateId : "#IdentityForm"
		}
	],
	
	_labels : {
		pageHeader: "Mail Identities",
		infoTitle: ZmMsg.identityInfoTitle, 
		infoContents: ZmMsg.identityInfoContent,
		listHeader: ZmMsg.identities, 
		detailsHeader: ZmMsg.identitiesLabel
	},
	
	init : function() {
		var subFormPage = util.getParamOrCookie("IdentitySubPage", this.defaultPage);
		this.showPage(subFormPage);
	},
	
	showPage : function(pageName) {
		AjxCookie.setCookie(document, "IdentitySubPage", pageName);
		controller.selectTab(this.id + "_tabs", pageName);

		AjxTemplate.setContent(this.id + "_subFormContainer",
					this.masterTemplateId + "#IdentityForm_" + pageName,
					this);

		if (pageName == "advanced") {
			this._toggleAdvancedSettings(false);
		}
	},
	
	_advancedEnabled : true,
	_advancedFields : [
		'_replyForwardSelect', 
		'_replyIncludeSelect', 
		'_forwardIncludeSelect',
		'_prefixSelect'
	],
	_advancedLabels : [
		'_replyForwardSelect_label', 
		'_replyIncludeSelect_label', 
		'_forwardIncludeSelect_label',
		'_prefixSelect_label'	
	],
	_toggleAdvancedSettings : function(enable) {
		if (enable == null) {
			enable = !this._advancedEnabled;
		}
		this._advancedEnabled = enable;

		Dwt.byId(this.id + '_useDefaultsCheckbox_default').checked = !enable;
		Dwt.byId(this.id + '_useDefaultsCheckbox_custom').checked = enable;
		
		for (var i = 0, id; id = this._advancedFields[i]; i++) {
			Dwt.byId(this.id + id).disabled = (!enable);
		}
		var addClass = (enable ? null : "ZDisabled");
		for (var i = 0, id; id = this._advancedLabels[i]; i++) {
			Dwt.delClass(Dwt.byId(this.id + id), "ZDisabled", addClass);
		}
	}
	

};



//
//	Pop account form
//

data.pop = {
	controller : "data.pop",
	id: data.id+"_pop",

	templates : [
		{
			elementId : "Options_page_container",
			templateId : "#ListOptionPage"
		},
		{
			elementId : "_form_container",
			templateId : "#PopForm"
		}
	],

	_labels : {
		pageHeader: "POP Email Accounts",
		infoTitle: ZmMsg.popAccountsInfoHeader, 
		infoContents: ZmMsg.popAccountsInfo,
		listHeader: ZmMsg.popAccounts, 
		detailsHeader: ZmMsg.popAccountSettings
	},

	
	init : function() {
		//this.toggleIdentitySection();
		this.toggleIdentityFields(false);
//		this.toggleAdvanced(false);	
	},
	

	_toggleInfoBoxHandler : function() {
		Dwt.toggle(this.id + "_infoBox_container");
	},
	
	// hide the entire identities section (for 'edit')
	toggleIdentitySection : function(newState) {
		Dwt.toggle(this.id + "_identity_title_row",newState);
		Dwt.toggle(this.id + "_identity_help_row",newState);
		Dwt.toggle(this.id + "_identity_create_row",newState);
		this.toggleIdentityFields(newState);
	},
	
	// hide the identity fields dependent on the checkbox
	toggleIdentityFields : function(newState) {
		Dwt.toggle(this.id + "_identity_spacer_row",newState);
		Dwt.toggle(this.id + "_identity_name_row",newState);
		Dwt.toggle(this.id + "_identity_email_row",newState);
		Dwt.toggle(this.id + "_identity_use_address_row",newState);
		Dwt.toggle(this.id + "_identity_use_folder_row",newState);
	},
	
	// show advanced options
	toggleAdvanced : function(newState) {
		Dwt.toggle(this.id + "_ssl_row",newState);
		Dwt.toggle(this.id + "_port_row",newState);
	}
		
};


/* NOT CURRENTLY BEING USED 

data.pop.form = {
	// list of required fields
	required : ["name", "username","password"],

	// map of 'item:relevantCondition(s)' for the form
	//		(note: item may be a field, or might be a div/td/etc)
	relevant: {
		"identity_sub_form" : {field:"create_identity", test:"==true", behavior:"hide"},
		"password_text" : {field:"show_password", test:"==true", behavior:"hide"},
		"password_pass" : {field:"show_password", test:"==false", behavior:"hide"}
	},
	

	// map of 'item:scripts' for the form
	//	(item == field, script is script to execute when item changes)
	changeHandlers: {
		"ssl" 		: "form.setValue('port', newValue ? '995' : '110');",
		"name" 		: "form.setValue('identity_name', newValue);",
		"server" 	: "form.setValue('email', form.getValue('username') + '@' + form.getValue('server'));",
		"username"	: "form.setValue('email', form.getValue('username') + '@' + form.getValue('server'));"
	},
	
	// default values for items not in our data model or for a new instance
	defaults: {
		port				: 110,
		show_password		: false,
		create_identity 	: false,
		location			: "Inbox",
		identity_use_address: true,
		identity_use_folder	: true
	}
};
*/



//
//	General options form
//

data.general = {
	controller: "data.general",
	id: data.id + "_general",
	_labels : {
		pageHeader: "General Options",
	},
	
	templates: [
		{
			elementId: "Options_page_container",
			templateId: "#GeneralForm"
		}
	]
}
