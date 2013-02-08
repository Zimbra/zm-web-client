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
* @class ZCS.view.contacts.ZtContactField
*
* This class allows a user to perform type ahead search on contacts,
* and then add multiple contacts to this field.
*
*/
Ext.define('ZCS.view.contacts.ZtContactField', {
	extend: 'ZCS.view.ux.ZtBubbleDropdown',
	alias: 'widget.contactfield',
	config: {
		menuStore: null,
		//TODO: change this to use the remote options on the taggable dropdown.
		filterFunction: function (searchValue, record) {
			var firstName = record.get('firstName'),
				lastName = record.get('lastName'),
				email = record.get('email');

			searchValue = ".*" + searchValue + ".*";

			if (firstName && firstName.match(searchValue)) {
				return true;
			} else if (lastName && lastName.match(searchValue)) {
				return true;
			} else if (email && email.match(searchValue)) {
				return true;
			}

			return false;
		},
		//TODO: if a contact model is no longer used, return perhaps an email model.
		getBubbleModelFromInput: function (input) {
			var emailObject = Ext.create('ZCS.model.mail.ZtEmailAddress', {
					email: input 
				});

			if (emailObject.isValid()){
				return Ext.create('ZCS.model.contacts.ZtContact', {
					'email': input
				});
			} else {
				return false;
			}
		},
		//TODO: if a contact model is no longer used, change this
		bubbleDisplayField: 'displayName',
		//TODO: if a contact model is no longer used, change this
		dropdownDisplayField: 'displayName',
		//TODO: change this to use the remote options on the taggable dropdown.
		stores: ['ZCS.store.contacts.ZtContactStore']
	},
	initialize: function () {
		//TODO: change this to use the remote options on the taggable dropdown.
		var contactStore = Ext.getStore(ZCS.util.getStoreShortName(this));

		this.setMenuStore(contactStore);
	},
	/**
	 * Called by default EXT form functionality to retrieve the value of this form input.
	 * 
	 * TODO, Implement this properly whem message writer can accept objects
	 */
	getValue: function () {
		var bubbles = this.getBubbles(),
			returnBubbles = [];

		//TODO, remove this when what is in the store is the desired ZtEmailAddress.
		Ext.each(bubbles, function (bubbleModel) {
			returnBubbles.push(Ext.create('ZCS.model.mail.ZtEmailAddress', {
				name: bubbleModel.get('firstName') + ' ' + bubbleModel.get('lastName'),
				email: bubbleModel.get('email')
 			}));
		});

		return returnBubbles;
	}
})