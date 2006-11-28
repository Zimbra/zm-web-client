var controller = {
	id : "Options",
	
	afterInit : function(templateId) {
		this.current = data.pop;
		//this.toggleIdentitySection();
		this.toggleIdentityFields(false);
		this.toggleAdvanced(false);
	},
	
	
	// hide the entire identities section (for 'edit')
	toggleIdentitySection : function(newState) {
		this.toggle("form_identity_title_row",newState);
		this.toggle("form_identity_help_row",newState);
		this.toggle("form_identity_create_row",newState);
		this.toggleIdentityFields(newState);
	},
	
	// hide the identity fields dependent on the checkbox
	toggleIdentityFields : function(newState) {
		this.toggle("form_identity_spacer_row",newState);
		this.toggle("form_identity_name_row",newState);
		this.toggle("form_identity_email_row",newState);
		this.toggle("form_identity_use_address_row",newState);
		this.toggle("form_identity_use_folder_row",newState);
	},

	// show advanced options
	toggleAdvanced : function(newState) {
		this.toggle("form_ssl_row",newState);
		this.toggle("form_port_row",newState);
	},
	
	//
	//	generic stuff
	//
	
	
	byId : function(id) {
		var el = id;
		if (typeof id == "string") {
			el = document.getElementById(id);
			if (el == null) el = document.getElementById(this.current.id + "_" + id);
		}
		return el;	
	},
	
	
	toggle : function (el, makeVisible) {
		if (makeVisible == null) makeVisible = (this.getStyle(el, "display") == "none");
		if (makeVisible) this.show(el);
		else this.hide(el);
	},
	
	show : function(el){
		this.setStyle(el, "display", "");
	},

	hide : function(el){
		this.setStyle(el, "display", "none");
	},
	
	getStyle : function(el, styleProp) {
		el = this.byId(el);
		if (!el) return null;
		return el.style[styleProp];
	},

	setStyle : function(el, styleProp, newValue) {
		el = this.byId(el);
		if (!el) return;
		el.style[styleProp] = newValue;
	}
}

var data = {
    id: controller.id,
    general:{},
	mail:{},
	identity:{},
	pop:{},
	filters:{},
	contacts:{},
	calendar:{},
	shortcuts:{},
	zimlets:{}
};

data.pop = {
		id: data.id+"_pop",
		title:"POP Accounts"
};
data.pop.bubble = {
		id: data.pop.id+"_bubble",
		title: ZmMsg.popAccountsInfoHeader, 
		body: ZmMsg.popAccountsInfo
};

data.pop.form = {
		id: data.pop.id+"_form",
		template: "zimbraMail.prefs.templates.Options#PopForm",
		title:"Account Settings",
		
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

