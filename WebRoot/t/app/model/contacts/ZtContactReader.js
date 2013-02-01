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
 * This class parses JSON contact data into ZtContact objects.
 *
 * @author Conrad Damon <cdamon@zimbra.com>
 */
Ext.define('ZCS.model.contacts.ZtContactReader', {

	extend: 'ZCS.model.ZtReader',

	alias: 'reader.contactreader',

	/**
	 * Override this method since there's no easy way to override the generated methods that return the
	 * total, success, and message properties. Note that we have not created a ZtContact yet, so we can't
	 * directly add values to it. All we can do is set up the 'data' object, which is then used to transfer
	 * properties into a newly created ZtContact in Operation::processRead.
	 *
	 * @param data
	 */
	readRecords: function(data) {

		var me  = this;
		me.rawData = data;

		var root = this.getRoot(data, 'cn'),
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
				Ext.copyTo(data, attrs, [
					'firstName',
					'lastName',
					'email',
					'company',
					'fileAs'
				]);

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
