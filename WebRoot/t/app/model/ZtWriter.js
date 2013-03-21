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
 * This is a base class for our request writers, and creates the SOAP envelope then fills in
 * some header fields.
 *
 * @author Conrad Damon <cdamon@zimbra.com>
 */
Ext.define('ZCS.model.ZtWriter', {

	extend: 'Ext.data.writer.Json',

	config: {
		writeAllFields: false       // may as well try to be efficient; remove if signs of trouble
	},

	/**
	 * Override so that we can log the request.
	 */
	write: function(request) {
		this.callParent(arguments);
		Ext.Logger.force('--- ' + request.soapMethod);
		Ext.Logger.force(JSON.stringify(request.getJsonData(), null, 4));
		return request;
	},

	/**
	 * Returns a SOAP envelope with a Header and a Body.
	 *
	 * @param {Ext.data.Request}    request     request object
	 * @param {object}              data        record data
	 * @param {string}              method      SOAP method (without 'Request' at end)
	 * @param {object}              options     additional options
	 *
	 * @return {object}     SOAP envelope
	 */
	getSoapEnvelope: function(request, data, method, options) {

		options = options || {};

		var sessionId = ZCS.session.getSessionId(),
			session = !sessionId ? {} : {
				_content: sessionId,
				id: sessionId
			};

		var json = {
			Header: {
				context: {
					_jsns: 'urn:zimbra',
					userAgent: {
						name: Ext.browser.userAgent,
						version: Ext.browser.version.version
					},
					session: session,
					notify: {
						seq: ZCS.session.getNotifySeq()
					},
					account: {
						_content: ZCS.session.getAccountName(),
						by: 'name'
					}
				}
			},
			Body: {}
		};

		var methodName = method + 'Request';
		json.Body[methodName] = {
			_jsns: options.namespace || 'urn:zimbraMail'
		};

		if (request) {
			request.soapMethod = method;
			request.setUrl(ZCS.constant.SERVICE_URL_BASE + methodName);
		}

		return json;
	}
});
