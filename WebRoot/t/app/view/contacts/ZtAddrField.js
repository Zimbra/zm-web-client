/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2013 VMware, Inc.
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
 * This class displays the address field on the contact form.
 *
 * @author Komal Kakani <kkakani@zimbra.com>
 */
Ext.define('ZCS.view.contacts.ZtAddrField', {

	extend: 'ZCS.view.contacts.ZtMultiField',

    xtype: 'addresscontainer',

	config: {
		type: 'address'
	},

	statics: {
		seq: 0
	},

	getFieldConfig: function(fieldId) {

		var thisClass = Ext.getClass(this),
			seq = thisClass.seq++;

		return {
			layout: 'vbox',
			width:  '80%',
			items:  [
				{
					layout: 'hbox',
					items:  [
						{
							xtype:          'textfield',
							placeHolder:    ZtMsg.streetAdd,
							name:           'street' + seq,
							flex:           1
						},
						{
							xtype:      'selectfield',
							name:       'addressType' + seq,
							flex:       0,
							options:    [
								{text: ZtMsg.home,  value: 'home'},
								{text: ZtMsg.work,  value: 'work'},
								{text: ZtMsg.other, value: 'other'}
							]
						}
					].concat(this.getAddRemoveConfig(fieldId))
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

	reset: function() {
		Ext.getClass(this).seq = 0;
		this.callParent(arguments);
	}
});
