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
	module("tinymce.ui.ColorButton", {
		setup: function() {
			document.getElementById('view').innerHTML = '';
		},

		teardown: function() {
			tinymce.dom.Event.clean(document.getElementById('view'));
		}
	});

	function createColorButton(settings) {
		return tinymce.ui.Factory.create(tinymce.extend({
			type: 'colorbutton'
		}, settings)).renderTo(document.getElementById('view'));
	}

	test("colorbutton text, size default", function() {
		var colorButton = createColorButton({text: 'X'});

		Utils.nearlyEqualRects(Utils.rect(colorButton), [0, 0, 42, 30], 4);
	});

	test("colorbutton text, size large", function() {
		var colorButton = createColorButton({text: 'X', size: 'large'});

		Utils.nearlyEqualRects(Utils.rect(colorButton), [0, 0, 49, 39], 4);
	});

	test("colorbutton text, size small", function() {
		var colorButton = createColorButton({text: 'X', size: 'small'});

		Utils.nearlyEqualRects(Utils.rect(colorButton), [0, 0, 34, 23], 4);
	});

	test("colorbutton text, width 100, height 100", function() {
		var colorButton = createColorButton({text: 'X', width: 100, height: 100});

		deepEqual(Utils.rect(colorButton), [0, 0, 100, 100]);
		deepEqual(Utils.rect(colorButton.getEl().firstChild), [1, 1, 98, 98]);
	});

	test("colorbutton icon, size default", function() {
		var colorButton = createColorButton({icon: 'test'});

		Utils.nearlyEqualRects(Utils.rect(colorButton), [0, 0, 50, 30], 4);
	});

	test("colorbutton icon, size small", function() {
		var colorButton = createColorButton({icon: 'test', size: 'small'});

		Utils.nearlyEqualRects(Utils.rect(colorButton), [0, 0, 43, 24], 4);
	});

	test("colorbutton icon, size large", function() {
		var colorButton = createColorButton({icon: 'test', size: 'large'});

		Utils.nearlyEqualRects(Utils.rect(colorButton), [0, 0, 54, 40], 4);
	});

	test("colorbutton icon, width 100, height 100", function() {
		var colorButton = createColorButton({icon: 'test', width: 100, height: 100});

		deepEqual(Utils.rect(colorButton), [0, 0, 100, 100]);
		deepEqual(Utils.rect(colorButton.getEl().firstChild), [1, 1, 98, 98]);
	});

	test("colorbutton text & icon, size default", function() {
		var colorButton = createColorButton({text: 'X', icon: 'test'});

		Utils.nearlyEqualRects(Utils.rect(colorButton), [0, 0, 62, 30], 4);
	});

	test("colorbutton text & icon, size large", function() {
		var colorButton = createColorButton({text: 'X', icon: 'test', size: 'large'});

		Utils.nearlyEqualRects(Utils.rect(colorButton), [0, 0, 69, 40], 4);
	});

	test("colorbutton text & icon, size small", function() {
		var colorButton = createColorButton({text: 'X', icon: 'test', size: 'small'});

		Utils.nearlyEqualRects(Utils.rect(colorButton), [0, 0, 53, 24], 4);
	});

	test("colorbutton text & icon, width 100, height 100", function() {
		var colorButton = createColorButton({text: 'X', icon: 'test', width: 100, height: 100});

		deepEqual(Utils.rect(colorButton), [0, 0, 100, 100]);
		deepEqual(Utils.rect(colorButton.getEl().firstChild), [1, 1, 98, 98]);
	});

	test("colorbutton click event", function() {
		var colorButton, clicks = {};

		colorButton = createColorButton({text: 'X', onclick: function() {clicks.a = 'a';}});
		colorButton.renderTo(document.getElementById('view'));
		colorButton.fire('click', {target: colorButton.getEl()});

		deepEqual(clicks, {a: 'a'});
	});
})();