/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2013 Zimbra Software, LLC.
 *
 * The contents of this file are subject to the Zimbra Public License
 * Version 1.4 ("License"); you may not use this file except in
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

		getBubbleModelFromInput: function (input) {
			var emailObject = Ext.create('ZCS.model.mail.ZtEmailAddress', {
					email: input
				});

			if (emailObject.isValid()){
				return Ext.create('ZCS.model.address.ZtAutoComplete', {
					'email': input
				});
			} else {
				return false;
			}
		},
		bubbleDisplayField: 'longName',

		menuItemTpl: ZCS.template.AutocompleteMatch,

		remoteFilter: true,

		menuWidth: Ext.os.deviceType === "Phone" ? 200 : 300,

		addressType: ''
	},

	configureStore: function (value, store) {
		store.getProxy().setExtraParams({
			'name': value
		});
	},

	initialize: function () {
		var store = Ext.create('ZCS.store.address.ZtAutoCompleteStore');

		this.setMenuStore(store);
	},
	/**
	 * Called by default EXT form functionality to retrieve the value of this form input.
	 */
	getValue: function () {
		var bubbles = this.getBubbles(),
			returnBubbles = [];

		//TODO, remove this when what is in the store is the desired ZtEmailAddress.
		Ext.each(bubbles, function (bubbleModel) {
			returnBubbles.push(Ext.create('ZCS.model.mail.ZtEmailAddress', {
				type: this.getAddressType(),
				name: bubbleModel.get('name'),
				email: bubbleModel.get('email')
 			}));
		}, this);

		return returnBubbles;
	},

	// override ZCS.view.ux.ZtBubbleArea::addBubble()
	addBubble: function(){
		this.callParent(arguments);
		// resize the inner input field after bubble changes
		this.resizeInternalInput();
	},

	// override ZCS.view.ux.ZtBubbleArea::removeBubble()
	removeBubble: function(){
		this.callParent(arguments);
		// resize the inner input field after bubble changes
		this.resizeInternalInput();
	},

	resizeInternalInput: function(){
		// get inner width of the bubble container (excluding field label)
		// actually we have to deduct el.getBorderWidth() as well
		// but it can be ignored as this el has no border in this case
		var fieldWidth = this.element.down('.bubble-main-contents').down('.x-inner').getWidth() 
						- this.element.down('.bubble-main-contents').down('.x-inner').getPadding("lr");

		var bubbles = this.element.dom.getElementsByClassName("bubble-comp");
		var inputWidth = fieldWidth;

		for (var i=0;i<bubbles.length;i++){
			var bubbleWidth = bubbles[i].offsetWidth;
			inputWidth -= bubbleWidth;

			// this bubble should be put in a new line, so we use this to "reset" the inputWidth
			if (inputWidth<0){
				inputWidth = fieldWidth - bubbleWidth;
			}

			// if the inputWidth is "too small", we shift it onto the next line
			if (inputWidth<30){
				inputWidth = fieldWidth;
			}

			// this is just a hack for safety, which ensures the input is not thrown onto a new line
			// because of float values rounding after above calculations
			inputWidth -= 5;
		}

		// set absolute width for the component which embraces the internal input field
		this.element.down('.input-comp').dom.style.cssText="width:"+inputWidth+"px !important;";

		// finally set the input width to fit its parent
		this.element.down('input').dom.style.width="100%";
	}
});
