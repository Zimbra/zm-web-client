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
 * This class displays the url field on the contact form.
 *
 * @author Komal Kakani <kkakani@zimbra.com>
 */
Ext.define('ZCS.view.contacts.ZtUrlField', {

	extend: 'ZCS.view.contacts.ZtMultiField',

	xtype: 'URLcontainer',

	config: {
		type: 'URL',
		addButtonLabel: ZtMsg.contactFormButtonAddWebsiteURL
	},

	getFieldConfig: function(fieldId) {
		return {
			layout: 'hbox',
			width: '100%',
			items: [
				{
					xtype:          'urlfield',
					placeHolder:    ZtMsg.url,
					name:           'URL',
					flex:           3
				},
				{
					xtype:      'selectfield',
					name:       'URLType',
					flex:       1,
					options:    [
						{text: ZtMsg.home,  value: 'home'},
						{text: ZtMsg.work,  value: 'work'},
						{text: ZtMsg.other, value: 'other'}
					],
					cls: 		'contact-form-multifield-select-field'
				}
			].reverse().concat(this.getRemoveConfig(fieldId)).reverse()
		};
	}
});
