Ext.define('ZCS.model.mail.ZtConvReader', {
	extend: 'Ext.data.reader.Json',
	alias: 'reader.convreader',

	/**
	 * Override this method since there's no easy way to override the generated methods that return the
	 * total, success, and message properties. Note that we have not created a ZtConv yet, so we can't
	 * directly add values to it. All we can do is set up the 'data' object, which is then used to transfer
	 * properties into a newly created ZtConv in Operation::processRead.
	 *
	 * @param data
	 */
	readRecords: function(data) {

		var me  = this;
		me.rawData = data;

		var root = data.Body.SearchResponse.c,
			total = root ? root.length : 0,
			success = true,
			message,
			recordCount = 0,
			records = [],
			i, j, len, node, data, senders;

		if (total > 0) {
			for (i = 0; i < total; i++) {
				node = root[i];
				data = {};
				data.subject = node.su;
				data.numMsgs = node.n;
				data.isUnread = node.f && (node.f.indexOf('u') !== -1);
				data.fragment = node.fr;

				// converted to ZtEmailAddress objects and added to conv in ZtConvStore 'load' listener
				data.rawAddresses = node.e;

				records.push({
					clientId: null,
					id: node.id,
					data: data,
					node: node
				});
			}
			recordCount = total;
		}

		return new Ext.data.ResultSet({
			total  : total,
			count  : recordCount,
			records: records,
			success: success,
			message: message
		});
	}
});
