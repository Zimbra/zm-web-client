/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2012, 2013 Zimbra Software, LLC.
 * 
 * The contents of this file are subject to the Zimbra Public License
 * Version 1.4 ("License"); you may not use this file except in
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
		//<debug>
        Ext.Logger.force('--- ' + request.soapMethod);
		Ext.Logger.force(JSON.stringify(request.getJsonData(), null, 4));
        //</debug>
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
			},
			notifySeq = ZCS.session.getNotifySeq();

		var json = {
			Header: {
				context: {
					_jsns: 'urn:zimbra',
					session: session,
					account: {
						_content: ZCS.session.getAccountName(),
						by: 'name'
					}
				}
			},
			Body: {}
		};

		if (notifySeq > 0) {
			json.Header.context.notify = { seq: notifySeq };
		}

		if (method !== 'NoOp') {
			json.Header.context.userAgent = {
				name: Ext.browser.userAgent,
				version: Ext.browser.version.version
			};
		}

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
