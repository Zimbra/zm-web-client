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
 * LegacyInput.js
 *
 * Copyright, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

define("tinymce/LegacyInput", [
	"tinymce/EditorManager",
	"tinymce/util/Tools"
], function(EditorManager, Tools) {
	var each = Tools.each, explode = Tools.explode;

	EditorManager.on('AddEditor', function(e) {
		var editor = e.editor;

		editor.on('preInit', function() {
			var filters, fontSizes, dom, settings = editor.settings;

			function replaceWithSpan(node, styles) {
				each(styles, function(value, name) {
					if (value) {
						dom.setStyle(node, name, value);
					}
				});

				dom.rename(node, 'span');
			}

			function convert(e) {
				dom = editor.dom;

				if (settings.convert_fonts_to_spans) {
					each(dom.select('font,u,strike', e.node), function(node) {
						filters[node.nodeName.toLowerCase()](dom, node);
					});
				}
			}

			if (settings.inline_styles) {
				fontSizes = explode(settings.font_size_legacy_values);

				filters = {
					font: function(dom, node) {
						replaceWithSpan(node, {
							backgroundColor: node.style.backgroundColor,
							color: node.color,
							fontFamily: node.face,
							fontSize: fontSizes[parseInt(node.size, 10) - 1]
						});
					},

					u: function(dom, node) {
						replaceWithSpan(node, {
							textDecoration: 'underline'
						});
					},

					strike: function(dom, node) {
						replaceWithSpan(node, {
							textDecoration: 'line-through'
						});
					}
				};

				editor.on('PreProcess SetContent', convert);
			}
		});
	});
});