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
 * This class displays the phone field on the contact form.
 *
 * @author Komal Kakani <kkakani@zimbra.com>
 */
Ext.define('ZCS.view.contacts.ZtPhoneField', {

	extend: 'ZCS.view.contacts.ZtMultiField',

	xtype: 'phonecontainer',

	config: {
		type: 'phone'
	},

	getFieldConfig: function(fieldId) {

		return {
			layout: 'hbox',
			width: '80%',
			items: [
				{
					xtype:          'textfield',
					component:      { type: 'tel' },
					placeHolder:    ZtMsg.phone,
					name:           'phone',
					flex:           1
				},
				{
					xtype:      'selectfield',
					name:       'phoneType',
					flex:       0,
					options:    [
						{text: ZtMsg.mobile,    value: 'mobile'},
						{text: ZtMsg.home,      value: 'home'},
						{text: ZtMsg.work,      value: 'work'},
						{text: ZtMsg.other,     value: 'other'}
					]
				}
			].concat(this.getAddRemoveConfig(fieldId))
		};
	}
});
