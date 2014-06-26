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
	module("tinymce.ui.GridLayout", {
		setup: function() {
			document.getElementById('view').innerHTML = '';
		},

		teardown: function() {
			tinymce.dom.Event.clean(document.getElementById('view'));
		}
	});

	function renderGridPanel(settings) {
		var panel = tinymce.ui.Factory.create(tinymce.extend({
			type: "panel",
			layout: "grid",
			defaults: {type: 'spacer'}
		}, settings)).renderTo(document.getElementById('view')).reflow();

		Utils.resetScroll(panel.getEl('body'));

		return panel;
	}

	test("automatic grid size 2x2", function() {
		var panel = renderGridPanel({
			items: [
				{classes: 'red'}, {classes: 'green'},
				{classes: 'blue'}, {classes: 'cyan'}
			]
		});

		deepEqual(Utils.rect(panel), [0, 0, 40, 40]);
		deepEqual(Utils.rect(panel.find('spacer')[0]), [0, 0, 20, 20]);
		deepEqual(Utils.rect(panel.find('spacer')[1]), [20, 0, 20, 20]);
		deepEqual(Utils.rect(panel.find('spacer')[2]), [0, 20,  20, 20]);
		deepEqual(Utils.rect(panel.find('spacer')[3]), [20, 20, 20, 20]);
	});

	/*
	test("fixed pixel size, automatic grid size 2x2", function() {
		panel = renderGridPanel({
			width: 100, height: 100,
			align: "center",
			items: [
				{classes: 'red'}, {classes: 'green'},
				{classes: 'blue'}, {classes: 'cyan'}
			]
		});

		deepEqual(Utils.rect(panel), [0, 0, 200, 200]);
		deepEqual(Utils.rect(panel.find('spacer')[0]), [0, 0, 17, 22]);
		deepEqual(Utils.rect(panel.find('spacer')[1]), [17, 0, 17, 22]);
		deepEqual(Utils.rect(panel.find('spacer')[2]), [0, 22, 16, 22]);
		deepEqual(Utils.rect(panel.find('spacer')[3]), [17, 22, 17, 22]);
	});
	*/

	test("spacing: 3, automatic grid size 2x2", function() {
		var panel = renderGridPanel({
			spacing: 3,
			items: [
				{classes: 'red'}, {classes: 'green'},
				{classes: 'blue'}, {classes: 'cyan'}
			]
		});

		deepEqual(Utils.rect(panel), [0, 0, 43, 43]);
		deepEqual(Utils.rect(panel.find('spacer')[0]), [0, 0, 20, 20]);
		deepEqual(Utils.rect(panel.find('spacer')[1]), [23, 0, 20, 20]);
		deepEqual(Utils.rect(panel.find('spacer')[2]), [0, 23, 20, 20]);
		deepEqual(Utils.rect(panel.find('spacer')[3]), [23, 23, 20, 20]);
	});

	test("padding: 3, automatic grid size 2x2", function() {
		var panel = renderGridPanel({
			padding: 3,
			items: [
				{classes: 'red'}, {classes: 'green'},
				{classes: 'blue'}, {classes: 'cyan'}
			]
		});

		deepEqual(Utils.rect(panel), [0, 0, 46, 46]);
		deepEqual(Utils.rect(panel.find('spacer')[0]), [3, 3, 20, 20]);
		deepEqual(Utils.rect(panel.find('spacer')[1]), [23, 3, 20, 20]);
		deepEqual(Utils.rect(panel.find('spacer')[2]), [3, 23, 20, 20]);
		deepEqual(Utils.rect(panel.find('spacer')[3]), [23, 23, 20, 20]);
	});

	test("spacing: 3, padding: 3, automatic grid size 2x2", function() {
		var panel = renderGridPanel({
			padding: 3,
			spacing: 3,
			items: [
				{classes: 'red'}, {classes: 'green'},
				{classes: 'blue'}, {classes: 'cyan'}
			]
		});

		deepEqual(Utils.rect(panel), [0, 0, 49, 49]);
		deepEqual(Utils.rect(panel.find('spacer')[0]), [3, 3, 20, 20]);
		deepEqual(Utils.rect(panel.find('spacer')[1]), [26, 3, 20, 20]);
		deepEqual(Utils.rect(panel.find('spacer')[2]), [3, 26, 20, 20]);
		deepEqual(Utils.rect(panel.find('spacer')[3]), [26, 26, 20, 20]);
	});

	test("inner elements 100x100 maxWidth/maxHeight: 118 (overflow W+H)", function() {
		var panel = renderGridPanel({
			autoResize: true,
			autoScroll: true,
			maxWidth: 118,
			maxHeight: 118,
			defaults: {
				type: 'spacer',
				minWidth: 100,
				minHeight: 100
			},
			items: [
				{classes: 'red dotted'}, {classes: 'green dotted'},
				{classes: 'blue dotted'}, {classes: 'cyan dotted'}
			]
		});

		deepEqual(Utils.rect(panel), [0, 0, 118, 118]);
		deepEqual(Utils.rect(panel.find('spacer')[0]), [0, 0, 100, 100]);
		deepEqual(Utils.rect(panel.find('spacer')[1]), [100, 0, 100, 100]);
		deepEqual(Utils.rect(panel.find('spacer')[2]), [0, 100, 100, 100]);
		deepEqual(Utils.rect(panel.find('spacer')[3]), [100, 100, 100, 100]);
		equal(panel.layoutRect().w, 118);
		equal(panel.layoutRect().h, 118);
		equal(panel.layoutRect().contentW, 200);
		equal(panel.layoutRect().contentH, 200);
	});

	test("inner elements: 100x100, padding: 20, spacing: 10, maxWidth/maxHeight: 118 (overflow W+H)", function() {
		var panel = renderGridPanel({
			autoResize: true,
			autoScroll: true,
			maxWidth: 118,
			maxHeight: 118,
			padding: 20,
			spacing: 10,
			defaults: {
				type: 'spacer',
				minWidth: 100,
				minHeight: 100
			},
			items: [
				{classes: 'red dotted'}, {classes: 'green dotted'},
				{classes: 'blue dotted'}, {classes: 'cyan dotted'}
			]
		});

		deepEqual(Utils.rect(panel), [0, 0, 118, 118]);
		deepEqual(Utils.rect(panel.find('spacer')[0]), [20, 20, 100, 100]);
		deepEqual(Utils.rect(panel.find('spacer')[1]), [130, 20, 100, 100]);
		deepEqual(Utils.rect(panel.find('spacer')[2]), [20, 130, 100, 100]);
		deepEqual(Utils.rect(panel.find('spacer')[3]), [130, 130, 100, 100]);
		equal(panel.layoutRect().w, 118);
		equal(panel.layoutRect().h, 118);
		equal(panel.layoutRect().contentW, 20 + 200 + 10 + 20);
		equal(panel.layoutRect().contentH, 20 + 200 + 10 + 20);
	});

	test("inner elements 100x100 maxWidth: 118 (overflow W)", function() {
		var panel = renderGridPanel({
			autoResize: true,
			autoScroll: true,
			maxWidth: 100,
			defaults: {
				type: 'spacer',
				minWidth: 100,
				minHeight: 100
			},
			items: [
				{classes: 'red dotted'}, {classes: 'green dotted'},
				{classes: 'blue dotted'}, {classes: 'cyan dotted'}
			]
		});

		deepEqual(Utils.rect(panel.find('spacer')[0]), [0, 0, 100, 100]);
		deepEqual(Utils.rect(panel.find('spacer')[1]), [100, 0, 100, 100]);
		deepEqual(Utils.rect(panel.find('spacer')[2]), [0, 100, 100, 100]);
		deepEqual(Utils.rect(panel.find('spacer')[3]), [100, 100, 100, 100]);
		equal(panel.layoutRect().contentW, 200);
		equal(panel.layoutRect().contentH, 200);
	});

	test("inner elements 100x100 maxHeight: 118 (overflow H)", function() {
		var panel = renderGridPanel({
			autoResize: true,
			autoScroll: true,
			maxHeight: 100,
			defaults: {
				type: 'spacer',
				minWidth: 100,
				minHeight: 100
			},
			items: [
				{classes: 'red dotted'}, {classes: 'green dotted'},
				{classes: 'blue dotted'}, {classes: 'cyan dotted'}
			]
		});

		deepEqual(Utils.rect(panel.find('spacer')[0]), [0, 0, 100, 100]);
		deepEqual(Utils.rect(panel.find('spacer')[1]), [100, 0, 100, 100]);
		deepEqual(Utils.rect(panel.find('spacer')[2]), [0, 100, 100, 100]);
		deepEqual(Utils.rect(panel.find('spacer')[3]), [100, 100, 100, 100]);
		equal(panel.layoutRect().contentW, 200);
		equal(panel.layoutRect().contentH, 200);
	});
})();
