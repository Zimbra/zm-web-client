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
		writeAllFields: false       // may as well try to be efficient; turn back on if signs of trouble
	},

	/**
	 * Returns a SOAP envelope with a Header and Body. The header will have a few fields filled in.
	 *
	 * @return {object}     SOAP envelope
	 */
	getSoapEnvelope: function(request, data, nameSpace) {

		var sessionId = ZCS.session.getSessionId();

		var envelope = {
			Header: {
				_jsns: 'urn:zimbra',
				context: {
					userAgent: {
						name: Ext.browser.userAgent,
						version: Ext.browser.version.version
					},
					session: {
						_content: sessionId,
						id: sessionId
					},
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

		return envelope;
	}
});
