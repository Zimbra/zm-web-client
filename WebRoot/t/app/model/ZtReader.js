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
 * This class is a base class for readers that interpret the JSON for items.
 *
 * @author Conrad Damon <cdamon@zimbra.com>
 */
Ext.define('ZCS.model.ZtReader', {

	extend: 'Ext.data.reader.Json',

	/**
	 * Pass along the method name that was set by the writer.
	 *
	 * @param {object}  response    response object
	 */
	getResponseData: function(response) {

		var data = this.callParent(arguments),
			request = response.request,
			requestObj = Ext.getClassName(response.request) ? request : request && request.options &&
							request.options.operation && request.options.operation.getRequest(),
			soapMethod = requestObj && requestObj.soapMethod;

		if (soapMethod) {
			data.soapMethod = soapMethod;
		}

		return data;
	}

	// TODO: parse tags
	// TODO: handle notifications?
});
