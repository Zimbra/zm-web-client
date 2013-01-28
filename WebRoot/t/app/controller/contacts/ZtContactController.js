/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2013 Zimbra, Inc.
 *
 * The contents of this file are subject to the Zimbra Public License
 * Version 1.3 ("License"); you may not use this file except in
 * compliance with the License.  You may obtain a copy of the License at
 * http://www.zimbra.com/license.
 *
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * ***** END LICENSE BLOCK *****
 */

/**
 * This class manages the display and manipulation of a single contact in its panel.
 *
 * @see ZtContact
 * @author Conrad Damon <cdamon@zimbra.com>
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
			contactView: ZCS.constant.APP_CONTACTS + 'itemview'
		},

		menuData: [
			{label: 'Delete', action: 'DELETE', listener: 'doDelete'}
		]
	},

	/**
	 * Moves the contact to Trash.
	 */
	doDelete: function() {
		Ext.Logger.warn("TODO: contact controller DELETE");
	},

	/**
	 * Displays the given contact. Changes the toolbar text to the full name of the contact.
	 *
	 * @param {ZtContact}   contact     contact to show
	 */
	showItem: function(contact) {
		Ext.Logger.info("contact controller: show contact " + contact.get('id'));
		this.callParent(arguments);
		this.getItemPanelToolbar().setTitle(contact.get('lastName') + ', ' + contact.get('firstName'));
		var tpl = this.getContactView().getTpl();
		this.getContactView().setHtml(tpl.apply(contact.getData()));
	}
});
