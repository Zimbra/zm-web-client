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
	module("tinymce.ui.MenuButton", {
		setup: function() {
			document.getElementById('view').innerHTML = '';
		},

		teardown: function() {
			tinymce.dom.Event.clean(document.getElementById('view'));
		}
	});

	function createMenuButton(settings) {
		return tinymce.ui.Factory.create(tinymce.extend({
			type: 'menubutton',
			menu: [
				{text: '1'},
				{text: '2'},
				{text: '3'}
			]
		}, settings)).renderTo(document.getElementById('view'));
	}

	test("menubutton text, size default", function() {
		var menuButton = createMenuButton({text: 'X'});

		Utils.nearlyEqualRects(Utils.rect(menuButton), [0, 0, 46, 30], 4);
	});

	test("menubutton text, size large", function() {
		var menuButton = createMenuButton({text: 'X', size: 'large'});

		Utils.nearlyEqualRects(Utils.rect(menuButton), [0, 0, 53, 39], 4);
	});

	test("menubutton text, size small", function() {
		var menuButton = createMenuButton({text: 'X', size: 'small'});

		Utils.nearlyEqualRects(Utils.rect(menuButton), [0, 0, 30, 23], 4);
	});

	test("menubutton text, width 100, height 100", function() {
		var menuButton = createMenuButton({text: 'X', width: 100, height: 100});

		deepEqual(Utils.rect(menuButton), [0, 0, 100, 100]);
		deepEqual(Utils.rect(menuButton.getEl().firstChild), [1, 1, 98, 98]);
	});

	test("menubutton icon, size default", function() {
		var menuButton = createMenuButton({icon: 'test'});

		Utils.nearlyEqualRects(Utils.rect(menuButton), [0, 0, 52, 30], 4);
	});

	test("menubutton icon, size small", function() {
		var menuButton = createMenuButton({icon: 'test', size: 'small'});

		Utils.nearlyEqualRects(Utils.rect(menuButton), [0, 0, 39, 24], 4);
	});

	test("menubutton icon, size large", function() {
		var menuButton = createMenuButton({icon: 'test', size: 'large'});

		Utils.nearlyEqualRects(Utils.rect(menuButton), [0, 0, 56, 40], 6);
	});

	test("menubutton icon, width 100, height 100", function() {
		var menuButton = createMenuButton({icon: 'test', width: 100, height: 100});

		deepEqual(Utils.rect(menuButton), [0, 0, 100, 100]);
		deepEqual(Utils.rect(menuButton.getEl().firstChild), [1, 1, 98, 98]);
	});

	test("menubutton text & icon, size default", function() {
		var menuButton = createMenuButton({text: 'X', icon: 'test'});

		Utils.nearlyEqualRects(Utils.rect(menuButton), [0, 0, 64, 30], 4);
	});

	test("menubutton text & icon, size large", function() {
		var menuButton = createMenuButton({text: 'X', icon: 'test', size: 'large'});

		Utils.nearlyEqualRects(Utils.rect(menuButton), [0, 0, 71, 40], 4);
	});

	test("menubutton text & icon, size small", function() {
		var menuButton = createMenuButton({text: 'X', icon: 'test', size: 'small'});

		Utils.nearlyEqualRects(Utils.rect(menuButton), [0, 0, 49, 24], 4);
	});

	test("menubutton text & icon, width 100, height 100", function() {
		var menuButton = createMenuButton({text: 'X', icon: 'test', width: 100, height: 100});

		deepEqual(Utils.rect(menuButton), [0, 0, 100, 100]);
		deepEqual(Utils.rect(menuButton.getEl().firstChild), [1, 1, 98, 98]);
	});

	test("menubutton click event", function() {
		var menuButton, clicks = {};

		menuButton = createMenuButton({text: 'X', onclick: function() {clicks.a = 'a';}});
		menuButton.on('click', function() {clicks.b = 'b';});
		menuButton.on('click', function() {clicks.c = 'c';});
		menuButton.fire('click');

		deepEqual(clicks, {a: 'a', b: 'b', c: 'c'});
	});
})();
