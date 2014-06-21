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

tinymce.PluginManager.add('visualchars', function(editor) {
	var self = this, state;

	function toggleVisualChars(addBookmark) {
		var node, nodeList, i, body = editor.getBody(), nodeValue, selection = editor.selection, div, bookmark;

		state = !state;
		self.state = state;
		editor.fire('VisualChars', {state: state});

		if (addBookmark) {
			bookmark = selection.getBookmark();
		}

		if (state) {
			nodeList = [];
			tinymce.walk(body, function(n) {
				if (n.nodeType == 3 && n.nodeValue && n.nodeValue.indexOf('\u00a0') != -1) {
					nodeList.push(n);
				}
			}, 'childNodes');

			for (i = 0; i < nodeList.length; i++) {
				nodeValue = nodeList[i].nodeValue;
				nodeValue = nodeValue.replace(/(\u00a0)/g, '<span data-mce-bogus="1" class="mce-nbsp">$1</span>');

				div = editor.dom.create('div', null, nodeValue);
				while ((node = div.lastChild)) {
					editor.dom.insertAfter(node, nodeList[i]);
				}

				editor.dom.remove(nodeList[i]);
			}
		} else {
			nodeList = editor.dom.select('span.mce-nbsp', body);

			for (i = nodeList.length - 1; i >= 0; i--) {
				editor.dom.remove(nodeList[i], 1);
			}
		}

		selection.moveToBookmark(bookmark);
	}

	function toggleActiveState() {
		var self = this;

		editor.on('VisualChars', function(e) {
			self.active(e.state);
		});
	}

	editor.addCommand('mceVisualChars', toggleVisualChars);

	editor.addButton('visualchars', {
		title: 'Show invisible characters',
		cmd: 'mceVisualChars',
		onPostRender: toggleActiveState
	});

	editor.addMenuItem('visualchars', {
		text: 'Show invisible characters',
		cmd: 'mceVisualChars',
		onPostRender: toggleActiveState,
		selectable: true,
		context: 'view',
		prependToContext: true
	});

	editor.on('beforegetcontent', function(e) {
		if (state && e.format != 'raw' && !e.draft) {
			state = true;
			toggleVisualChars(false);
		}
	});
});
