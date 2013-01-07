Ext.define('ZCS.model.mail.ZtMailReader', {

	extend: 'ZCS.model.ZtReader',

	parseFlags: function(node, data) {
		Ext.each(ZCS.constant.ALL_FLAGS, function(flag) {
			data[ZCS.constant.FLAG_PROP[flag]] = (node.f && node.f.indexOf(flag) !== -1);
		});
	},

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
			unit = num > 1 ? Ext.util.Inflector.pluralize(' minute') : ' minute';
			dateStr = num + unit + ' ago';
		}
		else if (dateDiff < ZCS.constant.MSEC_PER_DAY) {
			num = Math.round(dateDiff / ZCS.constant.MSEC_PER_HOUR);
			unit = num > 1 ? Ext.util.Inflector.pluralize(' hour') : ' hour';
			dateStr = num + unit + ' ago';
		}
		else {
			dateStr = Ext.Date.format(then, 'M j');
		}

		return dateStr;
	}
});
