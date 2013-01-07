Ext.define('ZCS.controller.contacts.ZtContactController', {

	extend: 'ZCS.controller.ZtItemController',

	config: {
		models: ['ZCS.model.contacts.ZtContact'],
		stores: ['ZCS.store.contacts.ZtContactStore'],
		refs: {
			itemPanel: 'contactpanel',
			itemToolbar: 'contactpanel titlebar',
			menuButton: 'contactpanel titlebar button',
			contactView: 'contactview'
		},
		menuData: [
			{label: 'Delete', action: 'DELETE', listener: 'doDelete'}
		]
	},

	doDelete: function() {
		console.log("contact controller DELETE");
	},

	showItem: function(contact) {
		console.log("contact controller: show contact " + contact.get('id'));
		this.callParent(arguments);
		this.getItemToolbar().setTitle(contact.get('lastName') + ', ' + contact.get('firstName'));
		var tpl = this.getContactView().getTpl();
		this.getContactView().setHtml(tpl.apply(contact.getData()));
	}
});
