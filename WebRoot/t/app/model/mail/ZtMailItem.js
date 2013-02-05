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
 * This class represents a mail item (conversation or message).
 *
 * @author Conrad Damon <cdamon@zimbra.com>
 */
Ext.define('ZCS.model.mail.ZtMailItem', {

	extend: 'ZCS.model.ZtItem',

	config: {
		fields: [
			{ name: 'addresses', type: 'auto' },
			{ name: 'subject', type: 'string' },
			{ name: 'fragment', type: 'string' },
			{ name: 'dateStr', type: 'string' },
			{ name: 'isUnread', type: 'boolean' }
		]
	},

	/**
	 * Add the given address to this mail item.
	 *
	 * @param {ZtEmailAddress}  address     email address
	 */
	addAddress: function(address) {

		var addrs = this.getAddresses();
		if (!addrs) {
			addrs = {};
			this.setAddresses(addrs);
		}

		var	addrType = address.getType(),
			addrsByType = addrs[addrType];

		if (!addrsByType) {
			addrsByType = addrs[addrType] = [];
		}
		addrsByType.push(address);
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
	 * Returns the first address of the given type.
	 *
	 * @param {string}  type        ZCS.constant.TO, etc
	 * @return {ZtEmailAddress}     email address
	 */
	getAddressByType: function(type) {
		return this.getAddressesByType(type)[0];
	},

	handleModifyNotification: function(mod) {

		this.callParent(arguments);

		// flags
		if (mod.f != null) {
			Ext.each(ZCS.constant.ALL_FLAGS, function(flag) {
				var prop = ZCS.constant.FLAG_PROP[flag],
					wasOn = this.get(prop),
					isOn = (mod.f.indexOf(flag) !== -1);

				if (wasOn !== isOn) {
					this.set(prop, isOn);
				}
			}, this);
		}

		// fragment
		if (mod.fr != null) {
			this.set('fragment', mod.fr);
		}
	}
});
