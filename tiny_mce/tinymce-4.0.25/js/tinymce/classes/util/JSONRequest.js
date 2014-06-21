/*
 * ***** BEGIN LICENSE BLOCK *****
 * 
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2014 Zimbra, Inc.
 * 
 * The contents of this file are subject to the Common Public Attribution License Version 1.0 (the “License”);
 * you may not use this file except in compliance with the License. 
 * You may obtain a copy of the License at: http://www.zimbra.com/license
 * The License is based on the Mozilla Public License Version 1.1 but Sections 14 and 15 
 * have been added to cover use of software over a computer network and provide for limited attribution 
 * for the Original Developer. In addition, Exhibit A has been modified to be consistent with Exhibit B. 
 * 
 * Software distributed under the License is distributed on an “AS IS” basis, 
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. 
 * See the License for the specific language governing rights and limitations under the License. 
 * The Original Code is Zimbra Open Source Web Client. 
 * The Initial Developer of the Original Code is Zimbra, Inc. 
 * All portions of the code are Copyright (C) 2014 Zimbra, Inc. All Rights Reserved. 
 * 
 * ***** END LICENSE BLOCK *****
 */
/**
 * JSONRequest.js
 *
 * Copyright, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * This class enables you to use JSON-RPC to call backend methods.
 *
 * @class tinymce.util.JSONRequest
 * @example
 * var json = new tinymce.util.JSONRequest({
 *     url: 'somebackend.php'
 * });
 *
 * // Send RPC call 1
 * json.send({
 *     method: 'someMethod1',
 *     params: ['a', 'b'],
 *     success: function(result) {
 *         console.dir(result);
 *     }
 * });
 *
 * // Send RPC call 2
 * json.send({
 *     method: 'someMethod2',
 *     params: ['a', 'b'],
 *     success: function(result) {
 *         console.dir(result);
 *     }
 * });
 */
define("tinymce/util/JSONRequest", [
	"tinymce/util/JSON",
	"tinymce/util/XHR",
	"tinymce/util/Tools"
], function(JSON, XHR, Tools) {
	var extend = Tools.extend;

	function JSONRequest(settings) {
		this.settings = extend({}, settings);
		this.count = 0;
	}

	/**
	 * Simple helper function to send a JSON-RPC request without the need to initialize an object.
	 * Consult the Wiki API documentation for more details on what you can pass to this function.
	 *
	 * @method sendRPC
	 * @static
	 * @param {Object} o Call object where there are three field id, method and params this object should also contain callbacks etc.
	 */
	JSONRequest.sendRPC = function(o) {
		return new JSONRequest().send(o);
	};

	JSONRequest.prototype = {
		/**
		 * Sends a JSON-RPC call. Consult the Wiki API documentation for more details on what you can pass to this function.
		 *
		 * @method send
		 * @param {Object} args Call object where there are three field id, method and params this object should also contain callbacks etc.
		 */
		send: function(args) {
			var ecb = args.error, scb = args.success;

			args = extend(this.settings, args);

			args.success = function(c, x) {
				c = JSON.parse(c);

				if (typeof(c) == 'undefined') {
					c = {
						error : 'JSON Parse error.'
					};
				}

				if (c.error) {
					ecb.call(args.error_scope || args.scope, c.error, x);
				} else {
					scb.call(args.success_scope || args.scope, c.result);
				}
			};

			args.error = function(ty, x) {
				if (ecb) {
					ecb.call(args.error_scope || args.scope, ty, x);
				}
			};

			args.data = JSON.serialize({
				id: args.id || 'c' + (this.count++),
				method: args.method,
				params: args.params
			});

			// JSON content type for Ruby on rails. Bug: #1883287
			args.content_type = 'application/json';

			XHR.send(args);
		}
	};

	return JSONRequest;
});