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
			// from server address node <e>
			{ name: 'type',         type: 'string' },   // to|from|cc, etc
			{ name: 'email',        type: 'string' },   // just the address part
			{ name: 'name',         type: 'string' },   // full name
			{ name: 'displayName',  type: 'string' },   // usually the first name

			// long name, eg "Johnathan Smith"
			{
				name: 'longName',
				type: 'string',
				convert: function (v, record) {
					var d = record.data;
					return d.name || d.displayName || d.email || '';
				}
			},

			// short name or nickname, eg "John"
			{
				name: 'shortName',
				type: 'string',
				convert: function (v, record) {
					var d = record.data;
					return d.displayName || d.name || d.email || '';
				}
			}
		]
	},

	statics: {

		/**
		 * The regexes below were adapted from the perl RFC-822 parser at
		 * <a href="http://search.cpan.org/~cwest/Email-Address-1.2/lib/Email/Address.pm">Email::Address</a>.
		 * Yeah, they're ugly, but they work and we shouldn't ever need to change them.
		 */
		addrAngleRegex:         /(\s*<(((\s*([^\x00-\x1F\x7F()<>\[\]:;@\,."\s]+(\.[^\x00-\x1F\x7F()<>\[\]:;@\,."\s]+)*)\s*)|(\s*"(([^\\"])|(\\([^\x0A\x0D])))+"\s*))\@((\s*([^\x00-\x1F\x7F()<>\[\]:;@\,."\s]+(\.[^\x00-\x1F\x7F()<>\[\]:;@\,."\s]+)*)\s*)|(\s*\[(\s*(([^\[\]\\])|(\\([^\x0A\x0D])))+)*\s*\]\s*)))>\s*)/,
		addrAngleQuoteRegex:    /(\s*<'(((\s*([^\x00-\x1F\x7F()<>\[\]:;@\,."\s]+(\.[^\x00-\x1F\x7F()<>\[\]:;@\,."\s]+)*)\s*)|(\s*"(([^\\"])|(\\([^\x0A\x0D])))+"\s*))\@((\s*([^\x00-\x1F\x7F()<>\[\]:;@\,."\s]+(\.[^\x00-\x1F\x7F()<>\[\]:;@\,."\s]+)*)\s*)|(\s*\[(\s*(([^\[\]\\])|(\\([^\x0A\x0D])))+)*\s*\]\s*)))'>\s*)/,
		addrRegex:              /(((\s*([^\x00-\x1F\x7F()<>\[\]:;@\,."\s]+(\.[^\x00-\x1F\x7F()<>\[\]:;@\,."\s]+)*)\s*)|(\s*"(([^\\"])|(\\([^\x0A\x0D])))+"\s*))\@((\s*([^\x00-\x1F\x7F()<>\[\]:;@\,."\s]+(\.[^\x00-\x1F\x7F()<>\[\]:;@\,."\s]+)*)\s*)|(\s*\[(\s*(([^\[\]\\])|(\\([^\x0A\x0D])))+)*\s*\]\s*)))/,
		addr1Regex:             /(^|"|\s)(((\s*([^\x00-\x1F\x7F()<>\[\]:;@\,."\s]+(\.[^\x00-\x1F\x7F()<>\[\]:;@\,."\s]+)*)\s*)|(\s*"(([^\\"])|(\\([^\x0A\x0D])))+"\s*))\@((\s*([^\x00-\x1F\x7F()<>\[\]:;@\,."\s]+(\.[^\x00-\x1F\x7F()<>\[\]:;@\,."\s]+)*)\s*)|(\s*\[(\s*(([^\[\]\\])|(\\([^\x0A\x0D])))+)*\s*\]\s*)))/,
		phraseRegex:            /(((\s*[^\x00-\x1F\x7F()<>\[\]:;@\"\s]+\s*)|(\s*"(([^\\"])|(\\([^\x0A\x0D])))+"\s*))+)/,

		/**
		 * Constructs a ZtEmailAddress from an email string. The given email can be just the
		 * address, or it can also have the personal part (usually in quotes).
		 *
		 * @param {String}  emailStr    email string
		 * @param {String}  type        address type
		 *
		 * @return {ZtEmailAddress}     an email address object, or null if the email string is invalid
		 * @adapts ZCS.model.mail.ZtEmailAddress.parse
		 */
		fromEmail: function(emailStr, type) {

			emailStr = Ext.String.trim(emailStr);

			var atIndex = emailStr.indexOf('@'),
				dotIndex = emailStr.lastIndexOf('.'),
				valid = ((atIndex != -1) && (dotIndex != -1) && (dotIndex > atIndex) && (dotIndex != emailStr.length - 1));

			if (!valid) {
				return null;
			}

			// Note: It would be nice if you could get back the matching parenthesized subexpressions from replace,
			// then we wouldn't have to do both a match and a replace. The parsing works by removing parts after it
			// finds them.

			// First find the address (and remove it)
			var addr, name,
				parts = emailStr.match(ZCS.model.mail.ZtEmailAddress.addrAngleQuoteRegex) ||
						emailStr.match(ZCS.model.mail.ZtEmailAddress.addrAngleRegex);

			if (parts && parts.length) {
				addr = parts[2];
				emailStr = emailStr.replace(ZCS.model.mail.ZtEmailAddress.addrAngleRegex, '');
			}
			else {
				parts = emailStr.match(ZCS.model.mail.ZtEmailAddress.addr1Regex);
				if (parts && parts.length) {
					if (parts[1] === '"') {
						return null;	// unmatched quote
					}
					// addrRegex recognizes the email better than using parts[0] from addrRegex1
					addr = emailStr.match(ZCS.model.mail.ZtEmailAddress.addrRegex);
					addr = (addr && addr.length && addr[0] != '') ? Ext.String.trim(addr[0]) : parts[0];
					if (addr && addr.indexOf('..') !== -1) {
						return null;
					}
					emailStr = emailStr.replace(ZCS.model.mail.ZtEmailAddress.addrRegex, '');
				}
			}
			if (!addr) {
				return null;
			}

			// what remains is the name
			parts = emailStr.match(ZCS.model.mail.ZtEmailAddress.phraseRegex);
			if (parts) {
				name = Ext.String.trim(parts[0]);

				// Trim off leading and trailing quotes, but leave escaped quotes and unescape them
				name = name.replace(/\\"/g, '&quot;');
				name = Ext.String.trim(name.replace(/^"+|"+$/g, ''));
				name = name.replace(/&quot;/g, '"');
			}

			return Ext.create('ZCS.model.mail.ZtEmailAddress', {
				type:   type,
				email:  addr,
				name:   name || ''
			});
		},

		/**
		 * Constructs a ZtEmailAddress from an 'e' object found in a conv or msg node.
		 *
		 * @param {Object}  node    address node
		 * @return {ZtEmailAddress}
		 */
		fromAddressNode: function(node) {

			var type = ZCS.constant.FROM_SOAP_TYPE[node.t];
			return Ext.create('ZCS.model.mail.ZtEmailAddress', {
				type: type,
				email: node.a,
				name: node.p,
				displayName: node.d
			});
		},

		/**
		 * Constructs a ZtEmailAddress from an 'at' or 'or' object found inside the 'inv' part of a msg node.
		 *
		 * @param {Object}  node    attendee or organizer node
		 * @return {ZtEmailAddress}
		 */
		fromInviteNode: function(node) {

			return Ext.create('ZCS.model.mail.ZtEmailAddress', {
				type: node.cutype || ZCS.constant.CUTYPE_INDIVIDUAL,
				email: node.a,
				name: node.d
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
	 *
	 */
	isValid: function () {
		return !!this.get('email').match(ZCS.model.mail.ZtEmailAddress.addrRegex);
	}
});

