/**
 * This class is a base class for parsing mail item JSON into a ZtMailItem.
 */
Ext.define('ZCS.model.mail.ZtMailReader', {

	extend: 'ZCS.model.ZtReader',

	/**
	 * Sets flag-related boolean properties based on the JSON flags string. For example, if the letter 'u'
	 * is present in the flags string, the property 'isUnread' will get set to true.
	 *
	 * @param {object}  node        JSON for the mail item
	 * @param {object}  data        data used to create ZtMailItem
	 */
	parseFlags: function(node, data) {
		Ext.each(ZCS.constant.ALL_FLAGS, function(flag) {
			data[ZCS.constant.FLAG_PROP[flag]] = (node.f && node.f.indexOf(flag) !== -1);
		});
	},

	/**
	 * Returns a summary relative date string (eg '5 minutes ago') for the date in the given JSON node, relative
	 * to the given time, or the current time if no time is provided. The string indicates how many minutes ago,
	 * how many hours ago, or if the difference is more than a day, a short version of the month and day.
	 *
	 * @param {object}  node        JSON for the mail item
	 * @param {int}     nowMs       base time in ms
	 */
	getDateString: function(node, nowMs) {

		var nowMs = nowMs || Ext.Date.now(),
			then = new Date(node.d),
			thenMs = then.getTime(),
			dateDiff = nowMs - thenMs,
			num, unit, dateStr;

		if (dateDiff < ZCS.constant.MSEC_PER_MINUTE) {
			dateStr = 'just a moment ago';
		}
		else if (dateDiff < ZCS.constant.MSEC_PER_HOUR) {
			num = Math.round(dateDiff / ZCS.constant.MSEC_PER_MINUTE);
			unit = num > 1 ? 'minutes' : ' minute';
			dateStr = num + unit + ' ago';
		}
		else if (dateDiff < ZCS.constant.MSEC_PER_DAY) {
			num = Math.round(dateDiff / ZCS.constant.MSEC_PER_HOUR);
			unit = num > 1 ? 'hours' : ' hour';
			dateStr = num + unit + ' ago';
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
	 * @param {hash}    data        model data
	 */
	convertAddresses: function(addrs, data, numSenders) {

		var	addresses = {};

		Ext.each(addrs, function(addr) {
			var emailAddr = ZCS.model.ZtEmailAddress.fromAddressNode(addr),
				type = emailAddr.getType();

			if (!addresses[type]) {
				addresses[type] = [];
			}
			addresses[type].push(emailAddr);
		});

		data.addresses = addresses;
	}
});
