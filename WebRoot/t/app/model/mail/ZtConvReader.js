Ext.define('ZCS.model.mail.ZtConvReader', {
	extend: 'Ext.data.reader.Json',
	alias: 'reader.convreader',

	/**
	 * Override this method since there's no easy way to override the generated methods that return the
	 * total, success, and message properties.
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
			i, j, len, node, data, participant;

		if (total > 0) {
//			records = me.extractData(data);
			for (i = 0; i < total; i++) {
				node = root[i];
				data = {};
				data.subject = node.su;
				data.numMsgs = node.n;
				data.isUnread = node.f && (node.f.indexOf('u') !== -1);
				data.fragment = node.fr;
				len = node.e.length;
				for (j = 0; j < len; j++) {
					participant = node.e[j];
					if (participant && participant.t === "f") {
						data.from = participant.p || participant.a;
					}
				}
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
