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
	module("tinymce.ui.SplitButton", {
		setup: function() {
			document.getElementById('view').innerHTML = '';
		},

		teardown: function() {
			tinymce.dom.Event.clean(document.getElementById('view'));
		}
	});

	function createSplitButton(settings) {
		return tinymce.ui.Factory.create(tinymce.extend({
			type: 'splitbutton'
		}, settings)).renderTo(document.getElementById('view'));
	}

	test("splitbutton text, size default", function() {
		var splitButton = createSplitButton({text: 'X'});

		Utils.nearlyEqualRects(Utils.rect(splitButton), [0, 0, 42, 30], 4);
	});

	test("splitbutton text, size large", function() {
		var splitButton = createSplitButton({text: 'X', size: 'large'});

		Utils.nearlyEqualRects(Utils.rect(splitButton), [0, 0, 49, 39], 4);
	});

	test("splitbutton text, size small", function() {
		var splitButton = createSplitButton({text: 'X', size: 'small'});

		Utils.nearlyEqualRects(Utils.rect(splitButton), [0, 0, 36, 23], 4);
	});

	test("splitbutton text, width 100, height 100", function() {
		var splitButton = createSplitButton({text: 'X', width: 100, height: 100});

		deepEqual(Utils.rect(splitButton), [0, 0, 100, 100]);
		deepEqual(Utils.rect(splitButton.getEl().firstChild), [1, 1, 82, 98]);
	});

	test("splitbutton icon, size default", function() {
		var splitButton = createSplitButton({icon: 'test'});

		Utils.nearlyEqualRects(Utils.rect(splitButton), [0, 0, 50, 30], 4);
	});

	test("splitbutton icon, size small", function() {
		var splitButton = createSplitButton({icon: 'test', size: 'small'});

		Utils.nearlyEqualRects(Utils.rect(splitButton), [0, 0, 45, 24], 4);
	});

	test("splitbutton icon, size large", function() {
		var splitButton = createSplitButton({icon: 'test', size: 'large'});

		Utils.nearlyEqualRects(Utils.rect(splitButton), [0, 0, 54, 40], 4);
	});

	test("splitbutton icon, width 100, height 100", function() {
		var splitButton = createSplitButton({icon: 'test', width: 100, height: 100});

		deepEqual(Utils.rect(splitButton), [0, 0, 100, 100]);
		deepEqual(Utils.rect(splitButton.getEl().firstChild), [1, 1, 82, 98]);
	});

	test("splitbutton text & icon, size default", function() {
		var splitButton = createSplitButton({text: 'X', icon: 'test'});

		Utils.nearlyEqualRects(Utils.rect(splitButton), [0, 0, 62, 30], 4);
	});

	test("splitbutton text & icon, size large", function() {
		var splitButton = createSplitButton({text: 'X', icon: 'test', size: 'large'});

		Utils.nearlyEqualRects(Utils.rect(splitButton), [0, 0, 69, 40], 4);
	});

	test("splitbutton text & icon, size small", function() {
		var splitButton = createSplitButton({text: 'X', icon: 'test', size: 'small'});

		Utils.nearlyEqualRects(Utils.rect(splitButton), [0, 0, 55, 24], 4);
	});

	test("splitbutton text & icon, width 100, height 100", function() {
		var splitButton = createSplitButton({text: 'X', icon: 'test', width: 100, height: 100});

		deepEqual(Utils.rect(splitButton), [0, 0, 100, 100]);
		deepEqual(Utils.rect(splitButton.getEl().firstChild), [1, 1, 82, 98]);
	});

	test("splitbutton click event", function() {
		var splitButton, clicks = {};

		splitButton = createSplitButton({text: 'X', onclick: function() {clicks.a = 'a';}});
		splitButton.fire('click', {target: splitButton.getEl().firstChild});

		deepEqual(clicks, {a: 'a'});
	});
})();

