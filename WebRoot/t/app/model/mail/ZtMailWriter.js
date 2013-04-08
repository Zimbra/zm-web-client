/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2013 VMware, Inc.
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
			methodJson.locale = { _content: ZCS.session.getSetting(ZCS.constant.SETTING_LOCALE) };
			methodJson.tz = { id:  ZCS.session.getSetting(ZCS.constant.SETTING_TIMEZONE) };
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
	 * @param {object}              data        item data
	 * @param {string}              method      action request method
	 */
	getActionRequest: function(request, data, method) {

		var json = this.getSoapEnvelope(request, data, method),
		methodJson = json.Body[method + 'Request'];

		Ext.apply(methodJson, {
			action: {
				id: data.id,
				op: data.op
			}
		});

		if (data.l) {
			methodJson.action.l = data.l;
		}

		if (data.tn) {
			methodJson.action.tn = data.tn;
		}

		if (data.tcon) {
			methodJson.action.tcon = data.tcon;
		}

		return json;
	}
});
