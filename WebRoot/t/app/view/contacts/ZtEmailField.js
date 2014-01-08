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
 * This class displays the email field on the contact form.
 *
 * @author Komal Kakani <kkakani@zimbra.com>
 */
Ext.define('ZCS.view.contacts.ZtEmailField', {

    extend: 'ZCS.view.contacts.ZtMultiField',

    xtype: 'emailcontainer',

	config: {
		type: 'email',
		addButtonLabel: ZtMsg.contactFormButtonAddEmailAddress
	},	

	getFieldConfig: function(fieldId) {
		return {
			layout: 'hbox',
			width: '100%',
			items: [
				{
					xtype:          'emailfield',
					placeHolder:    ZtMsg.email,
					name:           'email',
					flex:           1
				}
			].concat(this.getRemoveConfig(fieldId)).reverse()
		};
	}
});
