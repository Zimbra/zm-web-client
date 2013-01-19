/**
 * This class manages the display and manipulation of a single contact in its panel.
 *
 * @see ZtContact
 */
Ext.define('ZCS.controller.contacts.ZtContactController', {

	extend: 'ZCS.controller.ZtItemController',

	config: {

		models: ['ZCS.model.contacts.ZtContact'],
		stores: ['ZCS.store.contacts.ZtContactStore'],

		refs: {
			// event handlers
			itemPanelToolbar: 'appview #' + ZCS.constant.APP_CONTACTS + 'itempanel titlebar',

			// other
			menuButton: 'appview #' + ZCS.constant.APP_CONTACTS + 'itempanel titlebar button',
			contactView: 'contactview'
		},

		menuData: [
			{label: 'Delete', action: 'DELETE', listener: 'doDelete'}
		]
	},

	/**
	 * Moves the contact to Trash.
	 */
	doDelete: function() {
		console.log("contact controller DELETE");
	},

	/**
	 * Displays the given contact. Changes the toolbar text to the full name of the contact.
	 *
	 * @param {ZtContact}   contact     contact to show
	 */
	showItem: function(contact) {
		console.log("contact controller: show contact " + contact.get('id'));
		this.callParent(arguments);
		this.getItemPanelToolbar().setTitle(contact.get('lastName') + ', ' + contact.get('firstName'));
		var tpl = this.getContactView().getTpl();
		this.getContactView().setHtml(tpl.apply(contact.getData()));
	}
});
