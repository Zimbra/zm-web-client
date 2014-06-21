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
module("tinymce.util.JSON");

test('serialize', 2, function() {
	equal(
		tinymce.util.JSON.serialize({
			arr1 : [1, 2, 3, [1, 2, 3]],
			bool1 : true,
			float1: 3.14,
			int1 : 123,
			null1 : null,
			obj1 : {key1 : "val1", key2 : "val2"}, str1 : '\"\'abc\u00C5123\\'}
		),
		'{"arr1":[1,2,3,[1,2,3]],"bool1":true,"float1":3.14,"int1":123,"null1":null,"obj1":{"key1":"val1","key2":"val2"},"str1":"\\"\'abc\\u00c5123\\\\"}'
	);

	equal(
		tinymce.util.JSON.serialize({
			arr1 : [1, 2, 3, [1, 2, 3]],
			bool1 : true,
			float1: 3.14,
			int1 : 123,
			null1 : null,
			obj1 : {key1 : "val1", key2 : "val2"}, str1 : '\"\'abc\u00C5123'}, "'"
		),
		"{'arr1':[1,2,3,[1,2,3]],'bool1':true,'float1':3.14,'int1':123,'null1':null,'obj1':{'key1':'val1','key2':'val2'},'str1':'\\\"\\'abc\\u00c5123'}"
	);
});

test('parse', 1, function() {
	equal(tinymce.util.JSON.parse('{"arr1":[1,2,3,[1,2,3]],"bool1":true,"float1":3.14,"int1":123,"null1":null,"obj1":{"key1":"val1","key2":"val2"},"str1":"abc\\u00c5123"}').str1, 'abc\u00c5123');
});
