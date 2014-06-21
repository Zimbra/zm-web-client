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
	module("tinymce.ui.AbsoluteLayout", {
		setup: function() {
			document.getElementById('view').innerHTML = '';
		},

		teardown: function() {
			tinymce.dom.Event.clean(document.getElementById('view'));
		}
	});

	function createPanel(settings) {
		return tinymce.ui.Factory.create(tinymce.extend({
			type: 'panel',
			layout: 'absolute',
			width: 200,
			height: 200
		}, settings)).renderTo(document.getElementById('view')).reflow();
	}

	test("spacer x:10, y:20, minWidth: 100, minHeight: 100", function() {
		var panel = createPanel({
			items: [
				{type: 'spacer', x: 10, y: 20, w: 100, h: 120, classes: 'red'}
			]
		});

		deepEqual(Utils.rect(panel), [0, 0, 200, 200]);
		deepEqual(Utils.rect(panel.find('spacer')[0]), [10, 20, 100, 120]);
	});
})();