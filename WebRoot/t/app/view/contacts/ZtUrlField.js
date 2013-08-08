/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2013 Zimbra Software, LLC.
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
 * This class displays the url field on the contact form.
 *
 * @author Komal Kakani <kkakani@zimbra.com>
 */
Ext.define('ZCS.view.contacts.ZtUrlField', {

	extend: 'ZCS.view.contacts.ZtMultiField',

	xtype: 'urlcontainer',

	config: {
		type: 'url'
	},

	getFieldConfig: function(fieldId) {

		return {
			layout: 'hbox',
			width: '80%',
			items: [
				{
					xtype:          'urlfield',
					placeHolder:    ZtMsg.url,
					name:           'url',
					flex:           1
				},
				{
					xtype:      'selectfield',
					name:       'urlType',
					flex:       0,
					options:    [
						{text: ZtMsg.home,  value: 'home'},
						{text: ZtMsg.work,  value: 'work'},
						{text: ZtMsg.other, value: 'other'}
					]
				}
			].concat(this.getAddRemoveConfig(fieldId))
		};
	}
});
