/**
 * This class translates JSON for a message into a ZtMsg.
 */
Ext.define('ZCS.model.mail.ZtMsgReader', {

	extend: 'ZCS.model.mail.ZtMailReader',

	alias: 'reader.msgreader',

	/**
	 * Override this method since there's no easy way to override the generated methods that return the
	 * total, success, and message properties. Also, we need to do some more in-depth processing of
	 * non-trivial fields such as addresses.
	 */
	readRecords: function(data) {

		var me  = this;
		me.rawData = data;

		var root = (data.Body.SearchConvResponse && data.Body.SearchConvResponse.m) ||
				   (data.Body.SendMsgResponse && data.Body.SendMsgResponse.m),
			total = root.length,
			success = true,
			message,
			recordCount = 0,
			records = [],
			i, j, len, node, data, participant;

		if (root && total) {
			for (i = 0; i < total; i++) {
				node = root[i];
				data = {};
//				data.fragment = node.fr;
				data.content = (node.mp && node.mp[0] && node.mp[0].content) || node.fr;
				data.convId = node.cid;
				this.parseFlags(node, data);

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
