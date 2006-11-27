var data = {
    id: "Options",
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

data.pop.data = {
		id: data.id+"_pop",
		title:"POP Accounts"
};
data.pop.data.bubble = {
		id: data.pop.data.id+"_bubble",
		title: ZmMsg.AboutPopAccountsTitle, 
		body: ZmMsg.AboutPopAccountsBody
};

data.pop.data.form = {
		id: data.pop.data.id+"_form",
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

// Make POP Accounts default page
data.bubble = data.pop.data.bubble;
data.form = data.pop.data.form;