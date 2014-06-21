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
/**
 * plugin.js
 *
 * Copyright, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/*global tinymce:true */

tinymce.PluginManager.add('contextmenu', function(editor) {
	var menu, contextmenuNeverUseNative = editor.settings.contextmenu_never_use_native;

	editor.on('contextmenu', function(e) {
		var contextmenu;

		// Block TinyMCE menu on ctrlKey
		if (e.ctrlKey && !contextmenuNeverUseNative) {
			return;
		}

		e.preventDefault();

		contextmenu = editor.settings.contextmenu || 'link image inserttable | cell row column deletetable';

		// Render menu
		if (!menu) {
			var items = [];

			tinymce.each(contextmenu.split(/[ ,]/), function(name) {
				var item = editor.menuItems[name];

				if (name == '|') {
					item = {text: name};
				}

				if (item) {
					item.shortcut = ''; // Hide shortcuts
					items.push(item);
				}
			});

			for (var i = 0; i < items.length; i++) {
				if (items[i].text == '|') {
					if (i === 0 || i == items.length - 1) {
						items.splice(i, 1);
					}
				}
			}

			menu = new tinymce.ui.Menu({
				items: items,
				context: 'contextmenu'
			}).addClass('contextmenu').renderTo();

			editor.on('remove', function() {
				menu.remove();
				menu = null;
			});
		} else {
			menu.show();
		}

		// Position menu
		var pos = {x: e.pageX, y: e.pageY};

		if (!editor.inline) {
			pos = tinymce.DOM.getPos(editor.getContentAreaContainer());
			pos.x += e.clientX;
			pos.y += e.clientY;
		}

		menu.moveTo(pos.x, pos.y);
	});
});