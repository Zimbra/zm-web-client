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
(function() {
	var LocalStorage = tinymce.util.LocalStorage;

	module("tinymce.util.LocalStorage", {
		setup: function() {
			LocalStorage.clear();
		},

		teardown: function() {
			LocalStorage.clear();
		}
	});

	QUnit.config.reorder = false;

	test('setItem', function() {
		LocalStorage.setItem("a", "1");
		equal(LocalStorage.getItem("a"), "1");
		LocalStorage.setItem("a", "2");
		equal(LocalStorage.getItem("a"), "2");
		LocalStorage.setItem("a", 3);
		equal(LocalStorage.getItem("a"), "3");
		LocalStorage.setItem("a", null);
		equal(LocalStorage.getItem("a"), "null");
		LocalStorage.setItem("a", undefined);
		equal(LocalStorage.getItem("a"), "undefined");
		LocalStorage.setItem("a", new Date(0));
		equal(LocalStorage.getItem("a"), new Date(0).toString());
	});

	test('getItem', function() {
		LocalStorage.setItem("a", "1");
		equal(LocalStorage.getItem("a"), "1");
		LocalStorage.setItem("a", "0");
		equal(LocalStorage.getItem("a"), "0");
		equal(LocalStorage.getItem("b"), null);
	});

	test('removeItem', function() {
		LocalStorage.setItem("a", "1");
		equal(LocalStorage.getItem("a"), "1");
		LocalStorage.removeItem("a");
		equal(LocalStorage.getItem("a"), null);
	});

	test('key', function() {
		LocalStorage.setItem("a", "1");
		equal(LocalStorage.key(0), "a");
		equal(LocalStorage.length, 1);
	});

	test('length', function() {
		equal(LocalStorage.length, 0);
		LocalStorage.setItem("a", "1");
		equal(LocalStorage.length, 1);
	});

	test('clear', function() {
		equal(LocalStorage.length, 0);
		LocalStorage.setItem("a", "1");
		equal(LocalStorage.length, 1);
	});

	test('setItem key and value with commas', function() {
		LocalStorage.setItem("a,1", "1,2");
		LocalStorage.setItem("b,2", "2,3");
		equal(LocalStorage.getItem("a,1"), "1,2");
		equal(LocalStorage.getItem("b,2"), "2,3");
	});

	test('setItem with two large values', function() {
		var data = "";

		for (var i = 0; i < 1024; i++) {
			data += 'x';
		}

		LocalStorage.clear();
		LocalStorage.setItem("a", data + "1");
		LocalStorage.setItem("b", data);
		equal(LocalStorage.getItem("a").length, 1024 + 1);
		equal(LocalStorage.getItem("b").length, 1024);
	});

	test('setItem with two large keys', function() {
		var key = "";

		for (var i = 0; i < 1024; i++) {
			key += 'x';
		}

		LocalStorage.clear();
		LocalStorage.setItem(key + "1", "a");
		LocalStorage.setItem(key + "2", "b");
		equal(LocalStorage.key(0), key + "1");
		equal(LocalStorage.key(1), key + "2");
	});
})();

