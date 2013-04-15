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
 * This class is a base class for readers that interpret the JSON for items.
 *
 * @author Conrad Damon <cdamon@zimbra.com>
 */
Ext.define('ZCS.model.ZtReader', {

	extend: 'Ext.data.reader.Json',

	/**
	 * Override so we can pass along the method name that was set by the writer. We override
	 * this method because it has access to the Request object; we then copy the SOAP method
	 * from there to the data, which readRecords() receives as an argument.
	 *
	 * @param {object}  response    response object
	 */
	getResponseData: function(response) {

		var data = this.callParent(arguments),
			request = response.request,
			// see if we have a Request, or if we need to go digging in the Operation for it
			requestObj = Ext.getClassName(response.request) ? request : request && request.options &&
							request.options.operation && request.options.operation.getRequest(),
			soapMethod = requestObj && requestObj.soapMethod;

		if (soapMethod) {
			data.soapMethod = soapMethod;
		}

		// copy header to response object so ZtSoapProxy can check for notifications, etc
		response.soapHeader = data.Header;

		return data;
	},

	/**
	 * Override this method since there's no easy way to override the generated methods that return the
	 * total, success, and message properties. Note that we have not created an item yet, so we can't
	 * directly add values to it. All we can do is set up the 'data' object, which is then used to transfer
	 * properties into a newly created item in Operation::processRead.
	 *
	 * @param data
	 */
	readRecords: function(data) {

		this.rawData = data;

		var Model = this.getModel(),
			className = Ext.getClassName(Model),
			type = ZCS.constant.TYPE_FOR_CLASS[className],
			nodeName = ZCS.constant.ITEM_NODE[type],
			total,
			root = this.getRoot(data, nodeName),
			body = this.getResponseBody(data);

		//If the server gives us feedback in regards to paging, lets compute
		//the total intelligently.
		if (body.more && body.offset !== undefined && root) {
			//Since ext wants to know the total, and all the server tells us is that there is more, we
			//Need to set a fake total.
			total = body.more ? body.offset + (root.length * 3) : body.offset + root.length;
			count = root.length;
		} else {
			total = root ? root.length : 0;
			count = root ? root.length : 0;
		}


		return new Ext.data.ResultSet({
			total  : total,
			count  : count,
			records: this.getRecords(root),
			success: true,
			message: ''
		});
	},

	/**
	 * Returns a list of JSON-encoded items from a server response.
	 *
	 * @param {object}      data        response data
	 * @param {string}      nodeName    name of node that contains list of results (eg 'm' for messages)
	 */
	getRoot: function(data, nodeName) {
		var responseObj = this.getResponseBody(data);

		return responseObj ? responseObj[nodeName] : null;
	},

	getResponseBody: function (data) {
		var responseMethod = data.soapMethod + 'Response';

		return data.Body[responseMethod];
	},

	/**
	 * Converts a list of JSON nodes into a list of records.
	 *
	 * @param {array}   root        list of JSON nodes
	 * @return {array}  list of records
	 */
	getRecords: function(root) {

		var records = [];

		Ext.each(root, function(node) {
			records.push({
				clientId: null,
				id: node.id,
				data: this.getDataFromNode(node),
				node: node
			});
		}, this);

		return records;
	},

	/**
	 * Returns a data object with populated fields for the model, based on the given
	 * JSON node.
	 *
	 * @param {object}  node        JSON node representing model instance
	 */
	getDataFromNode: function(node) {
		return node;
	}
});
