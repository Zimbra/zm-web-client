Ext.define('ZCS.controller.contacts.ZtContactController', {

	extend: 'ZCS.controller.ZtBaseController',

	requires: [
		'ZCS.common.ZtMenu'
	],

	config: {
		models: ['ZCS.model.contacts.ZtContact'],
		stores: ['ZCS.store.contacts.ZtContactStore'],
		refs: {
			contactPanel: 'contactpanel',
			contactToolbar: 'contactpanel titlebar',
			contactMenuButton: 'contactpanel titlebar button',
			contactView: 'contactview'
		},
		control: {
			contactPanel: {
				showContactMenu: 'onShowContactMenu'
			}
		},
		contact: null
	},

	onShowContactMenu: function() {
		console.log("Contact menu event caught");

		if (!this.contactMenu) {
			this.contactMenu = Ext.create('ZCS.common.ZtMenu', {
				referenceComponent: this.getContactMenuButton()
			});
		}
		this.contactMenu.setMenuItems([
			{label: 'Delete', action: 'DELETE', listener: this.doDelete}
		], this);
		this.contactMenu.popup();
	},

	doDelete: function() {
		console.log("contact controller DELETE");
	},

	clear: function() {
		this.getContactToolbar().setTitle('');
		this.getContactMenuButton().hide();
	},

	showContact: function(contact) {
		console.log("contact controller: show contact " + contact.get('id'));
		this.clear();
		this.setContact(contact);
		this.getContactToolbar().setTitle(contact.get('lastName') + ', ' + contact.get('firstName'));
		this.getContactMenuButton().show();
		var tpl = this.getContactView().getTpl();
		this.getContactView().setHtml(tpl.apply(contact.getData()));
	}
});
