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
 * This is a base class for writing a JSON SOAP request for a mail item.
 *
 * @author Conrad Damon <cdamon@zimbra.com>
 */
Ext.define('ZCS.model.mail.ZtMailWriter', {

	extend: 'ZCS.model.ZtWriter',

	getSoapEnvelope: function(request, data, method, options) {

		options = options || {};

		var json = this.callParent(arguments),
			methodJson = json.Body[method + 'Request'];

		if (options.addHeaders) {
			methodJson.header = ZCS.constant.ADDITIONAL_MAIL_HEADERS;
		}

		if (options.isSearch) {
			methodJson.locale = ZCS.session.getSetting(ZCS.constant.SETTING_LOCALE);
			methodJson.tz = ZCS.session.getSetting(ZCS.constant.SETTING_TIMEZONE);
			if (ZCS.session.getSetting(ZCS.constant.SETTING_MARK_READ) === 0) {
				methodJson.read = 1;
			}
			methodJson.html = 1;
		}

		return json;
	},

	/**
	 * Fills in the JSON for an action request
	 *
	 * @param {Ext.data.Request}    request     request object
	 * @param {object}              data        record data
	 * @param {string}              method      action request method
	 */
	getActionRequest: function(request, data, method) {

		var json = this.getSoapEnvelope(request, data, method),
		methodJson = json.Body[method + 'Request'];

		var	item = data[0];

		Ext.apply(methodJson, {
			action: {
				id: item.id,
				op: item.op
			}
		});

		if (item.l) {
			methodJson.action.l = item.l;
		}

		if (item.tn) {
			methodJson.action.tn = item.tn;
		}

		return json;
	},

	/**
	 * The data to pass along when writing by a piece of mail
	 */
	getRecordData: function(record) {
		return {
			id: record.get('id'),
			op: record.get('op'),
			l: record.get('l'),
			tn: record.get('tn')
		};
	}
});
