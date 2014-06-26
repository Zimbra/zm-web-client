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
	module("tinymce.ui.Window", {
		setup: function() {
			document.getElementById('view').innerHTML = '';
		},

		teardown: function() {
			tinymce.dom.Event.clean(document.getElementById('view'));
			tinymce.DOM.remove(document.getElementById('mce-modal-block'));
		}
	});

	function createWindow(settings) {
		return tinymce.ui.Factory.create(tinymce.extend({
			type: 'window'
		}, settings)).renderTo(document.getElementById('view')).reflow();
	}

	test("window x, y, w, h", function() {
		var win = createWindow({x: 100, y: 120, width: 200, height: 210});

		Utils.nearlyEqualRects(Utils.size(win), [200, 210]);
	});

	test("no title, no buttonbar, autoResize", function() {
		var win = createWindow({
			x: 100,
			y: 120,
			items: [
				{type: 'spacer', classes: 'red'}
			]
		});

		Utils.nearlyEqualRects(Utils.size(win), [22, 22]);
		Utils.nearlyEqualRects(Utils.size(win.find("spacer")[0]), [20, 20]);
	});

	test("title, no buttonbar, autoResize, title is widest", function() {
		var win = createWindow({
			x: 100,
			y: 120,
			title: "XXXXXXXXXXXXXXXXXXXXXX",
			items: [
				{type: 'spacer', classes: 'red', flex: 1}
			]
		});

		Utils.nearlyEqualRects(Utils.size(win), [326, 61], 60);
		Utils.nearlyEqualRects(Utils.size(win.find("spacer")[0]), [324, 20], 60);
	});

	test("buttonbar, autoResize, buttonbar is widest", function() {
		var win = createWindow({
			x: 100,
			y: 120,
			items: [
				{type: 'spacer', classes: 'red', flex: 1}
			],
			buttons: [
				{type: 'spacer', classes: 'green', minWidth: 400}
			]
		});

		Utils.nearlyEqualRects(Utils.size(win), [422, 63]);
		Utils.nearlyEqualRects(Utils.size(win.find("spacer")[0]), [420, 20]);
		Utils.nearlyEqualRects(Utils.size(win.statusbar.find("spacer")[0]), [400, 20]);
	});

	test("buttonbar, title, autoResize, content is widest", function() {
		var win = createWindow({
			x: 100,
			y: 120,
			title: "X",
			items: [
				{type: 'spacer', classes: 'red', minWidth: 400}
			],
			buttons: [
				{type: 'spacer', classes: 'green'}
			]
		});

		Utils.nearlyEqualRects(Utils.size(win), [402, 102]);
		Utils.nearlyEqualRects(Utils.size(win.getEl("head")), [400, 39]);
		Utils.nearlyEqualRects(Utils.size(win.find("spacer")[0]), [400, 20]);
		Utils.nearlyEqualRects(Utils.size(win.statusbar.find("spacer")[0]), [20, 20]);
	});
})();
