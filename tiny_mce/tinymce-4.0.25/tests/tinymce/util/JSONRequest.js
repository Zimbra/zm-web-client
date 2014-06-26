/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2014 Zimbra, Inc.
 * 
 * The contents of this file are subject to the Common Public Attribution License Version 1.0 (the "License");
 * you may not use this file except in compliance with the License. 
 * You may obtain a copy of the License at: http://www.zimbra.com/license
 * The License is based on the Mozilla Public License Version 1.1 but Sections 14 and 15 
 * have been added to cover use of software over a computer network and provide for limited attribution 
 * for the Original Developer. In addition, Exhibit A has been modified to be consistent with Exhibit B. 
 * 
 * Software distributed under the License is distributed on an "AS IS" basis, 
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. 
 * See the License for the specific language governing rights and limitations under the License. 
 * The Original Code is Zimbra Open Source Web Client. 
 * The Initial Developer of the Original Code is Zimbra, Inc. 
 * All portions of the code are Copyright (C) 2014 Zimbra, Inc. All Rights Reserved. 
 * ***** END LICENSE BLOCK *****
 */
if (location.protocol != "file:") {
	module("tinymce.util.JSONRequest");

	asyncTest("Successful request - send method", function() {
		expect(1);

		new tinymce.util.JSONRequest({}).send({
			type : 'GET',
			url : 'tinymce/util/json_rpc_ok.js',
			success: function(data) {
				equal(data, 'Hello JSON-RPC');
				start();
			}
		});
	});

	asyncTest("Successful request - sendRPC static method", function() {
		expect(1);

		tinymce.util.JSONRequest.sendRPC({
			type : 'GET',
			url : 'tinymce/util/json_rpc_ok.js',
			success: function(data) {
				equal(data, 'Hello JSON-RPC');
				start();
			}
		});
	});

	asyncTest("Error request - send method", function() {
		expect(1);

		new tinymce.util.JSONRequest({}).send({
			type : 'GET',
			url : 'tinymce/util/json_rpc_error.js',
			error: function(error) {
				equal(error.code, 42);
				start();
			}
		});
	});

	asyncTest("Error request - sendRPC static method", function() {
		expect(1);

		tinymce.util.JSONRequest.sendRPC({
			type : 'GET',
			url : 'tinymce/util/json_rpc_error.js',
			error: function(error) {
				equal(error.code, 42);
				start();
			}
		});
	});
}
