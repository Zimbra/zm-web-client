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
 * This class displays the address field on the contact form.
 *
 * @author Komal Kakani <kkakani@zimbra.com>
 */
Ext.define('ZCS.view.contacts.ZtAddrField', {

	extend: 'ZCS.view.contacts.ZtMultiField',

    xtype: 'addresscontainer',

	config: {
		type: 'address',
		addButtonLabel: ZtMsg.contactFormButtonAddPhysicalAddress
	},

	statics: {
		seq: 0
	},

	getFieldConfig: function(fieldId) {

		var thisClass = Ext.getClass(this),
			// seq = thisClass.seq += 1;
			seq = thisClass.seq;
			thisClass.seq += 1;

		return {
			layout: 'vbox',
			width:  '100%',
			items:  [
				{
					layout: 'hbox',
					items:  [
						{
							xtype:          'textfield',
							placeHolder:    ZtMsg.streetAdd,
							name:           'street' + seq,
							flex:           3
						},
						{
							xtype:      'selectfield',
							name:       'addressType' + seq,
							flex:       1,
							options:    [
								{text: ZtMsg.home,  value: 'home'},
								{text: ZtMsg.work,  value: 'work'},
								{text: ZtMsg.other, value: 'other'}
							],
							cls: 		'contact-form-multifield-select-field'
						}
					].reverse().concat(this.getRemoveConfig(fieldId)).reverse()
				},
				{
					layout: 'hbox',
					items: [
						{
							xtype:          'textfield',
							name:           'city' + seq,
							placeHolder:    ZtMsg.city,
							flex:           1
						},
						{
							xtype:          'textfield',
							name:           'state' + seq,
							placeHolder:    ZtMsg.state,
							flex:           1
						},
						{
							xtype:          'textfield',
							name:           'postalCode' + seq,
							placeHolder:    ZtMsg.postalcode,
							flex:           1
						}
					]
				},
				{
					layout: 'hbox',
					items: [
						{
							xtype:          'textfield',
							name:           'country' + seq,
							placeHolder:    ZtMsg.country,
							flex:           1
						}
					]
				}
			]
		};
	},

	reset: function () {
		Ext.getClass(this).seq = 0;
		this.callParent(arguments);
	}
});
