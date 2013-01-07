Ext.define('ZCS.model.contacts.ZtContactReader', {

	extend: 'ZCS.model.ZtReader',

	alias: 'reader.contactreader',

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

		var root = (data.Body.GetContactsResponse && data.Body.GetContactsResponse.cn) ||
				   (data.Body.SearchResponse && data.Body.SearchResponse.cn),
			total = root ? root.length : 0,
			success = true,
			message,
			recordCount = 0,
			records = [],
			i, j, len, node, data, attrs;

		if (total > 0) {
			for (i = 0; i < total; i++) {
				node = root[i];
				data = {};
				attrs = node._attrs;
				data.firstName = attrs.firstName;
				data.lastName = attrs.lastName;
				data.email = attrs.email;
				data.company = attrs.company;
				data.fileAs = attrs.fileAs;

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
