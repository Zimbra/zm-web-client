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
(function() {
	module("tinymce.plugins.ImportCSS", {
		setupModule: function() {
			QUnit.stop();

			tinymce.init({
				selector: "textarea",
				add_unload_trigger: false,
				skin: false,
				plugins: 'importcss',
				init_instance_callback: function(ed) {
					window.editor = ed;
					QUnit.start();
				}
			});
		},

		teardown: function() {
			editor.contentCSS = [];
			delete editor.settings.importcss_file_filter;
			delete editor.settings.importcss_merge_classes;
			delete editor.settings.importcss_append;
			delete editor.settings.importcss_selector_filter;
			delete editor.settings.importcss_groups;
		}
	});

	function fireFormatsMenuEvent(styleSheets, items) {
		return editor.fire('renderFormatsMenu', {
			control: tinymce.ui.Factory.create('menu', {items: items}).renderTo(document.getElementById('view')),
			doc: {
				styleSheets: styleSheets
			}
		});
	}

	function getMenuItemFormat(item) {
		return editor.formatter.get(item.settings.format)[0];
	}

	test("Import content_css files", function() {
		editor.contentCSS.push("test1.css");
		editor.contentCSS.push("test2.css");

		var evt = fireFormatsMenuEvent([
			{
				href: 'test1.css',
				cssRules: [
					{selectorText: '.a'},
					{selectorText: 'p.b'},
					{selectorText: 'img.c'}
				]
			},

			{href: 'test2.css', cssRules: [{selectorText: '.d'}]},
			{href: 'test3.css',	cssRules: [{selectorText: '.e'}]}
		]);

		equal(evt.control.items().length, 4);

		equal(evt.control.items()[0].text(), 'a');
		equal(getMenuItemFormat(evt.control.items()[0]).classes, 'a');

		equal(evt.control.items()[1].text(), 'p.b');
		equal(getMenuItemFormat(evt.control.items()[1]).block, 'p');
		equal(getMenuItemFormat(evt.control.items()[1]).classes, 'b');

		equal(evt.control.items()[2].text(), 'img.c');
		equal(getMenuItemFormat(evt.control.items()[2]).selector, 'img');
		equal(getMenuItemFormat(evt.control.items()[2]).classes, 'c');

		equal(evt.control.items()[3].text(), 'd');
	});

	test("Import custom importcss_merge_classes: false", function() {
		editor.contentCSS.push("test.css");
		editor.settings.importcss_merge_classes = false;

		var evt = fireFormatsMenuEvent([
			{href: 'test.css', cssRules: [{selectorText: '.a'}]}
		]);

		equal(evt.control.items().length, 1);
		deepEqual(getMenuItemFormat(evt.control.items()[0]).attributes, {"class": "a"});
	});

	test("Import custom importcss_append: true", function() {
		editor.contentCSS.push("test.css");
		editor.settings.importcss_append = true;

		var evt = fireFormatsMenuEvent([
			{href: 'test.css', cssRules: [{selectorText: '.b'}]}
		], {text: 'a'});

		equal(evt.control.items().length, 2);
		equal(evt.control.items()[0].text(), 'a');
		equal(evt.control.items()[1].text(), 'b');
	});

	test("Import custom importcss_selector_filter (string)", function() {
		editor.contentCSS.push("test1.css");
		editor.settings.importcss_selector_filter = ".a";

		var evt = fireFormatsMenuEvent([
			{href: 'test1.css', cssRules: [
				{selectorText: '.a'},
				{selectorText: '.b'}
			]},
		]);

		equal(evt.control.items().length, 1);
		equal(evt.control.items()[0].text(), 'a');
	});

	test("Import custom importcss_selector_filter (function)", function() {
		editor.contentCSS.push("test1.css");
		editor.settings.importcss_selector_filter = function(selector) {
			return selector === ".a";
		};

		var evt = fireFormatsMenuEvent([
			{href: 'test1.css', cssRules: [
				{selectorText: '.a'},
				{selectorText: '.b'}
			]},
		]);

		equal(evt.control.items().length, 1);
		equal(evt.control.items()[0].text(), 'a');
	});

	test("Import custom importcss_selector_filter (regexp)", function() {
		editor.contentCSS.push("test1.css");
		editor.settings.importcss_selector_filter = /a/;

		var evt = fireFormatsMenuEvent([
			{href: 'test1.css', cssRules: [
				{selectorText: '.a'},
				{selectorText: '.b'}
			]},
		]);

		equal(evt.control.items().length, 1);
		equal(evt.control.items()[0].text(), 'a');
	});

	test("Import custom importcss_groups", function() {
		editor.contentCSS.push("test1.css");
		editor.settings.importcss_groups = [
			{title: 'g1', filter: /a/},
			{title: 'g2', filter: /b/},
			{title: 'g3'}
		];

		var evt = fireFormatsMenuEvent([
			{href: 'test1.css', cssRules: [
				{selectorText: '.a'},
				{selectorText: '.b'},
				{selectorText: '.c'}
			]},
		]);

		equal(evt.control.items().length, 3);
		equal(evt.control.items()[0].text(), 'g1');
		equal(evt.control.items()[0].settings.menu[0].text, 'a');
		equal(evt.control.items()[1].text(), 'g2');
		equal(evt.control.items()[1].settings.menu[0].text, 'b');
		equal(evt.control.items()[2].text(), 'g3');
		equal(evt.control.items()[2].settings.menu[0].text, 'c');
	});

	test("Import custom importcss_file_filter (string)", function() {
		editor.contentCSS.push("test1.css");
		editor.settings.importcss_file_filter = "test2.css";

		var evt = fireFormatsMenuEvent([
			{href: 'test1.css', cssRules: [{selectorText: '.a'}]},
			{href: 'test2.css', cssRules: [{selectorText: '.b'}]}
		]);

		equal(evt.control.items().length, 1);
		equal(evt.control.items()[0].text(), 'b');
	});

	test("Import custom importcss_file_filter (function)", function() {
		editor.contentCSS.push("test1.css");
		editor.settings.importcss_file_filter = function(href) {
			return href === "test2.css";
		};

		var evt = fireFormatsMenuEvent([
			{href: 'test1.css', cssRules: [{selectorText: '.a'}]},
			{href: 'test2.css', cssRules: [{selectorText: '.b'}]}
		]);

		equal(evt.control.items().length, 1);
		equal(evt.control.items()[0].text(), 'b');
	});

	test("Import custom importcss_file_filter (regexp)", function() {
		editor.contentCSS.push("test1.css");
		editor.settings.importcss_file_filter = /test2\.css/;

		var evt = fireFormatsMenuEvent([
			{href: 'test1.css', cssRules: [{selectorText: '.a'}]},
			{href: 'test2.css', cssRules: [{selectorText: '.b'}]}
		]);

		equal(evt.control.items().length, 1);
		equal(evt.control.items()[0].text(), 'b');
	});
})();
