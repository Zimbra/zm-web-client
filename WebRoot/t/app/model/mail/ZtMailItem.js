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

	requires: [
		'ZCS.model.mail.ZtEmailAddress'
	],

	config: {
		fields: [
			{ name: 'addresses', type: 'auto' },
			{ name: 'subject', type: 'string' },
			{ name: 'fragment', type: 'string' },
			{ name: 'dateStr', type: 'string' },

			// flags
			{ name: 'hasAttach', type: 'boolean' },
			{ name: 'isFlagged', type: 'boolean' },
			{ name: 'isForwarded', type: 'boolean' },
			{ name: 'isDraft', type: 'boolean' },
			{ name: 'isSent', type: 'boolean' },
			{ name: 'isReplied', type: 'boolean' },
			{ name: 'isUnread', type: 'boolean' }
		]
	},

	statics: {

		/**
		 * Returns a summary relative date string (eg '5 minutes ago') for the date in the given JSON node, relative
		 * to the given time, or the current time if no time is provided. The string indicates how many minutes ago,
		 * how many hours ago, or if the difference is more than a day, a short version of the month and day.
		 *
		 * @param {int}     date        date in ms
		 * @param {int}     nowMs       base time in ms
		 */
		getDateString: function(date, nowMs) {

			if (date == null) {
				return '';
			}

			var nowMs = nowMs || Ext.Date.now(),
				then = new Date(date),
				thenMs = then.getTime(),
				dateDiff = nowMs - thenMs,
				num, unit, dateStr;

			if (dateDiff < ZCS.constant.MSEC_PER_MINUTE) {
				dateStr = ZtMsg.receivedNow;
			}
			else if (dateDiff < ZCS.constant.MSEC_PER_DAY) {
				if (dateDiff < ZCS.constant.MSEC_PER_HOUR) {
					num = Math.round(dateDiff / ZCS.constant.MSEC_PER_MINUTE);
					unit = num > 1 ? ZtMsg.minutes : ZtMsg.minute;
				}
				else {
					num = Math.round(dateDiff / ZCS.constant.MSEC_PER_HOUR);
					unit = num > 1 ? ZtMsg.hours : ZtMsg.hour;
				}
				dateStr = Ext.String.format(ZtMsg.receivedRecently, num, unit);
			}
			else {
				dateStr = Ext.Date.format(then, 'M j');
			}

			return dateStr;
		},

		/**
		 * Convert JSON objects into address objects.
		 *
		 * @param {array}   addrs       list of address nodes
		 * @return {object}     hash of addresses by type
		 */
		convertAddresses: function(addrs) {

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

		stripSubjectPrefixes: function(subj) {
			var regex = ZCS.constant.REGEX_SUBJ_PREFIX;
			while (regex.test(subj)) {
				subj = subj.replace(regex, '');
			}
			return subj;
		}
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

		var	addrType = address.get('type'),
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
	 * Returns the ZtEmailAddress object that matches the parameterized field
	 *
	 * @param {String} email Email address
	 *
	 * @return {ZCS.model.mail.ZtEmailAddress}
	 */
	getAddressObject: function (field, fieldValue) {
		var addrs = this.get('addresses'),
			found = false,
			to = addrs[ZCS.constant.TO],
			cc = addrs[ZCS.constant.CC],
			from = addrs[ZCS.constant.FROM],
			sender = addrs[ZCS.constant.SENDER],
			replyTo = addrs[ZCS.constant.REPLY_TO],
			bcc = addrs[ZCS.constant.BCC];

		Ext.Object.each(addrs, function (addrType, addrList) {
			Ext.each(addrList, function (addr) {
				if (addr.get(field) === fieldValue) {
					found = addr;
					return false;
				}
			});

			if (found) {
				return false;
			}
		});

		return found;
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
			this.set('dateStr', ZCS.model.mail.ZtMailItem.getDateString(modify.d));
		}

		// fragment
		if (modify.fr) {
			this.set('fragment', modify.fr);
		}
	}
});
