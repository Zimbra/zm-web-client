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
 * This class represents a mail item (conversation or message).
 *
 * @author Conrad Damon <cdamon@zimbra.com>
 */
Ext.define('ZCS.model.mail.ZtMailItem', {

	extend: 'ZCS.model.ZtItem',

	requires: [
		'ZCS.model.mail.ZtEmailAddress'
	],

	config: {
		fields: [
			{ name: 'addresses',        type: 'auto' },
			{ name: 'subject',          type: 'string' },
			{ name: 'fragment',         type: 'string' },
			{ name: 'dateStr',          type: 'string' },

			// flags
			{ name: 'hasAttachment',    type: 'boolean' },
			{ name: 'isFlagged',        type: 'boolean' },
			{ name: 'isForwarded',      type: 'boolean' },
			{ name: 'isDraft',          type: 'boolean' },
			{ name: 'isSent',           type: 'boolean' },
			{ name: 'isReplied',        type: 'boolean' },
			{ name: 'isUnread',         type: 'boolean' },
			{ name: 'isInvite',         type: 'boolean' }
		]
	},

	statics: {

		/**
		 * Convert JSON objects into address objects.
		 *
		 * @param {array}   addrs       list of address nodes
		 * @return {object}     hash of addresses by type
		 */
		convertAddressJsonToModel: function(addrs) {

			var	addresses = {};

			Ext.each(addrs, function(addr) {
				var emailAddr = ZCS.model.mail.ZtEmailAddress.fromAddressNode(addr),
					type = emailAddr.get('type');

				if (!addresses[type]) {
					addresses[type] = [];
				}
				addresses[type].push(emailAddr);
			});

			return addresses;
		},

		/**
		 * Converts ZtEmailAddress models into anonymous objects with useful address-related properties.
		 *
		 * @param {Array|Object|ZtEmailAddress}     addrs   addresses to convert
		 * @return {Object}    the provided data with addresses as anonymous objects
		 */
		convertAddressModelToObject: function(addrs) {

			// if we got an array, convert it and return the result
			if (Array.isArray(addrs)) {
				if (addrs.length > 0) {
					return Ext.Array.map(addrs,
						function (addr) {
							var	addrData = {
									address:    addr.get('email'),
									name:       ZCS.mailutil.getDisplayName(addr),
									addrObj:    addr
								};
							addrData.id = ZCS.util.getUniqueId(addrData);
							return addrData;
						}
					);
				}
			}
			// convert a single ZtEmailAddress via an array
			else if (addrs instanceof ZCS.model.mail.ZtEmailAddress) {
				return ZCS.model.mail.ZtMailItem.convertAddressModelToObject([addrs])[0];
			}
			// assume a string is an email
			else if (Ext.isString(addrs)) {
				var addr = ZCS.model.mail.ZtEmailAddress.fromEmail(addrs);
				return addr ? ZCS.model.mail.ZtMailItem.convertAddressModelToObject([addr])[0] : null;
			}
			// handle hash of address array by address type
			else if (Ext.isObject(addrs)) {
				var results = {};
				Ext.Object.each(addrs, function(type) {
					results[type] = ZCS.model.mail.ZtMailItem.convertAddressModelToObject(addrs[type]);
				});
				return results;
			}
			else {
				return null;
			}
		}
	},

	/**
	 * Add the given addresses to this mail item.
	 *
	 * @param {array}  addresses     list of ZtEmailAddress
	 */
	addAddresses: function(addresses) {

		addresses = Array.isArray(addresses) ? addresses : [addresses];

		var addrs = this.get('addresses');
		if (!addrs) {
			addrs = {};
			this.set('addresses', addrs);
		}

		var ln = addresses.length, i;
		for (i = 0; i < ln; i++) {
			var address = addresses[i],
				addrType = address.get('type'),
				addrsByType = addrs[addrType];

			if (!addrsByType) {
				addrsByType = addrs[addrType] = [];
			}
			addrsByType.push(address);
		}
	},

	/**
	 * Returns a list of email addresses of the given type (to, from, etc).
	 *
	 * @param {string}  type        ZCS.constant.TO, etc
	 * @return {array}      list of email addresses
	 */
	getAddressesByType: function(type) {
		type = type || ZCS.constant.FROM;
		var addrs = this.get('addresses');
		return (addrs && addrs[type]) || [];
	},


	/**
	 * Returns the ZtEmailAddress object that matches the parameterized field
	 *
	 * @param {String}  field   field in a ZtEmailAddress
	 * @param {String}  value   value to look for
	 *
	 * @return {ZCS.model.mail.ZtEmailAddress}
	 */
	getAddressObject: function (field, value) {

		var addrs = this.get('addresses'),
			found = false;

		Ext.Object.each(addrs, function (addrType, addrList) {
			Ext.each(addrList, function (addr) {
				if (addr.get(field) === value) {
					found = addr;
					return false;
				}
			});
			if (found) {
				return false;
			}
		});

		// if not found, assume it was an email address
		return found || ZCS.model.mail.ZtEmailAddress.fromEmail(value);
	},

	/**
	 * Returns the first address of the given type.
	 *
	 * @param {string}  type        ZCS.constant.TO, etc
	 * @return {ZtEmailAddress}     email address
	 */
	getAddressByType: function(type) {
		return this.getAddressesByType(type)[0];
	},

	handleModifyNotification: function(modify) {

		this.callParent(arguments);

		// flags
		if (modify.f != null) {
			Ext.each(ZCS.constant.ALL_FLAGS, function(flag) {
				var prop = ZCS.constant.FLAG_PROP[flag],
					wasOn = this.get(prop),
					isOn = (modify.f.indexOf(flag) !== -1);

				if (wasOn !== isOn) {
					this.set(prop, isOn);
				}
			}, this);
		}

		// date
		if (modify.d) {
			this.set('dateStr', ZCS.util.getRelativeDateString(modify.d));
		}

		// fragment
		if (modify.fr) {
			this.set('fragment', Ext.String.htmlEncode(modify.fr));
		}
	}
});
