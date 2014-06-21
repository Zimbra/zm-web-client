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
	module("tinymce.ui.TabPanel", {
		setup: function() {
			document.getElementById('view').innerHTML = '';
		},

		teardown: function() {
			tinymce.dom.Event.clean(document.getElementById('view'));
		}
	});

	function createTabPanel(settings) {
		return tinymce.ui.Factory.create(tinymce.extend({
			type: 'tabpanel',
			items: [
				{title: 'a', type: 'spacer', classes: 'red'},
				{title: 'b', type: 'spacer', classes: 'green'},
				{title: 'c', type: 'spacer', classes: 'blue'}
			]
		}, settings)).renderTo(document.getElementById('view')).reflow();
	}

	test("panel width: 100, height: 100", function() {
		var panel = createTabPanel({
			width: 100,
			height: 100,
			layout: 'fit'
		});

		deepEqual(Utils.rect(panel), [0, 0, 100, 100]);
		Utils.nearlyEqualRects(Utils.rect(panel.items()[0]), [0, 31, 100, 69], 4);
	});

	test("panel width: 100, height: 100, border: 1", function() {
		var panel = createTabPanel({
			width: 100,
			height: 100,
			border: 1,
			layout: 'fit'
		});

		deepEqual(Utils.rect(panel), [0, 0, 100, 100]);
		Utils.nearlyEqualRects(Utils.rect(panel.items()[0]), [0, 31, 100, 69], 4);
	});

	test("panel width: 100, height: 100, activeTab: 1", function() {
		var panel = createTabPanel({
			width: 100,
			height: 100,
			activeTab: 1,
			layout: 'fit'
		});

		deepEqual(Utils.rect(panel), [0, 0, 100, 100]);
		Utils.nearlyEqualRects(Utils.rect(panel.items()[1]), [0, 31, 100, 69], 4);
	});

	test("panel width: auto, height: auto, mixed sized widgets", function() {
		var panel = createTabPanel({
			items: [
				{title: 'a', type: 'spacer', classes: 'red', style: 'width: 100px; height: 100px'},
				{title: 'b', type: 'spacer', classes: 'green', style: 'width: 70px; height: 70px'},
				{title: 'c', type: 'spacer', classes: 'blue', style: 'width: 120px; height: 120px'}
			]
		});

		Utils.nearlyEqualRects(Utils.rect(panel), [0, 0, 120, 151], 4);
		Utils.nearlyEqualRects(Utils.rect(panel.items()[0]), [0, 31, 120, 120], 4);

		panel.activateTab(1);
		Utils.nearlyEqualRects(Utils.rect(panel.items()[1]), [0, 31, 120, 120], 4);

		panel.activateTab(2);
		Utils.nearlyEqualRects(Utils.rect(panel.items()[2]), [0, 31, 120, 120], 4);
	});

	test("panel width: auto, height: auto, mixed sized containers", function() {
		var panel = createTabPanel({
			items: [
				{
					title: 'a',
					type: 'panel',
					layout: 'flex',
					align: 'stretch',
					items: {
						type: 'spacer',
						classes: 'red',
						flex: 1,
						minWidth: 100,
						minHeight: 100
					}
				},

				{
					title: 'b',
					type: 'panel',
					layout: 'flex',
					align: 'stretch',
					items: {
						type: 'spacer',
						flex: 1,
						classes: 'green',
						minWidth: 70,
						minHeight: 70
					}
				},

				{
					title: 'c',
					type: 'panel',
					layout: 'flex',
					align: 'stretch',
					items: {
						type: 'spacer',
						classes: 'blue',
						flex: 1,
						minWidth: 120,
						minHeight: 120
					}
				}
			]
		});

		Utils.nearlyEqualRects(Utils.rect(panel), [0, 0, 120, 151], 4);
		Utils.nearlyEqualRects(Utils.rect(panel.items()[0]), [0, 31, 120, 120], 4);

		panel.activateTab(1);
		Utils.nearlyEqualRects(Utils.rect(panel.items()[1]), [0, 31, 120, 120], 4);

		panel.activateTab(2);
		Utils.nearlyEqualRects(Utils.rect(panel.items()[2]), [0, 31, 120, 120], 4);
	});
})();
