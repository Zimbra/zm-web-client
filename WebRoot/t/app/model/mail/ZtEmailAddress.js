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
 * This class represents an email address. It will have at least an email, and may also have
 * a type, a name, and a display name (short version of name).
 *
 * @author Conrad Damon <cdamon@zimbra.com>
 * @adapts AjxEmailAddress
 */
Ext.define('ZCS.model.mail.ZtEmailAddress', {
	extend: 'Ext.data.Model',
	config: {
		fields: [
			{name: 'type', type: 'string'},
			{name: 'email', type: 'string'},
			{name: 'name', type: 'string'},
			{name: 'displayName', type: 'string'}
		]
	},

	statics: {
		fromAddressNode: function(node) {
			var type = ZCS.constant.FROM_SOAP_TYPE[node.t];
			return Ext.create('ZCS.model.mail.ZtEmailAddress', {
				type: type,
				email: node.a,
				name: node.p,
				displayName: node.d
			});
		}
	},

	/**
	 * Returns a full email address string. If a name is available, it will be quoted and the email
	 * will be in angle brackets.
	 */
	getFullEmail: function() {

		var name = this.get('name'),
			email = this.get('email');

		if (name) {
			name = name.replace(/\\+"/g, '"');  // unescape double quotes (avoid double-escaping)
			name = name.replace(/"/g,'\\"');    // escape quotes
			return ['"', name, '" <', email, '>'].join('');
		}
		else {
			return email;
		}
	},

	/**
	 * Returns a full email string, with name and email parts.
	 * @return {string}     email string
	 */
	toString: function() {
		return this.getFullEmail();
	},

	/**
	 * TODO: make this a robust email regular expression checker
	 *
	 */
	isValid: function () {
		return true;
	}
});

