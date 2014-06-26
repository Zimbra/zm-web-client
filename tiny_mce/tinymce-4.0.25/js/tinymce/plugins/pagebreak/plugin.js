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

tinymce.PluginManager.add('pagebreak', function(editor) {
	var pageBreakClass = 'mce-pagebreak', separatorHtml = editor.getParam('pagebreak_separator', '<!-- pagebreak -->');

	var pageBreakSeparatorRegExp = new RegExp(separatorHtml.replace(/[\?\.\*\[\]\(\)\{\}\+\^\$\:]/g, function(a) {
		return '\\' + a;
	}), 'gi');

	var pageBreakPlaceHolderHtml = '<img src="' + tinymce.Env.transparentSrc + '" class="' +
		pageBreakClass + '" data-mce-resize="false" />';

	// Register commands
	editor.addCommand('mcePageBreak', function() {
		if (editor.settings.pagebreak_split_block) {
			editor.insertContent('<p>' + pageBreakPlaceHolderHtml + '</p>');
		} else {
			editor.insertContent(pageBreakPlaceHolderHtml);
		}
	});

	// Register buttons
	editor.addButton('pagebreak', {
		title: 'Page break',
		cmd: 'mcePageBreak'
	});

	editor.addMenuItem('pagebreak', {
		text: 'Page break',
		icon: 'pagebreak',
		cmd: 'mcePageBreak',
		context: 'insert'
	});

	editor.on('ResolveName', function(e) {
		if (e.target.nodeName == 'IMG' && editor.dom.hasClass(e.target, pageBreakClass)) {
			e.name = 'pagebreak';
		}
	});

	editor.on('click', function(e) {
		e = e.target;

		if (e.nodeName === 'IMG' && editor.dom.hasClass(e, pageBreakClass)) {
			editor.selection.select(e);
		}
	});

	editor.on('BeforeSetContent', function(e) {
		e.content = e.content.replace(pageBreakSeparatorRegExp, pageBreakPlaceHolderHtml);
	});

	editor.on('PreInit', function() {
		editor.serializer.addNodeFilter('img', function(nodes) {
			var i = nodes.length, node, className;

			while (i--) {
				node = nodes[i];
				className = node.attr('class');
				if (className && className.indexOf('mce-pagebreak') !== -1) {
					// Replace parent block node if pagebreak_split_block is enabled
					var parentNode = node.parent;
					if (editor.schema.getBlockElements()[parentNode.name] && editor.settings.pagebreak_split_block) {
						parentNode.type = 3;
						parentNode.value = separatorHtml;
						parentNode.raw = true;
						node.remove();
						continue;
					}

					node.type = 3;
					node.value = separatorHtml;
					node.raw = true;
				}
			}
		});
	});
});