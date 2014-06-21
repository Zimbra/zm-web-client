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

tinymce.PluginManager.add('emoticons', function(editor, url) {
	var emoticons = [
		["cool", "cry", "embarassed", "foot-in-mouth"],
		["frown", "innocent", "kiss", "laughing"],
		["money-mouth", "sealed", "smile", "surprised"],
		["tongue-out", "undecided", "wink", "yell"]
	];

	function getHtml() {
		var emoticonsHtml;

		emoticonsHtml = '<table role="list" class="mce-grid">';

		tinymce.each(emoticons, function(row) {
			emoticonsHtml += '<tr>';

			tinymce.each(row, function(icon) {
				var emoticonUrl = url + '/img/smiley-' + icon + '.gif';

				emoticonsHtml += '<td><a href="#" data-mce-url="' + emoticonUrl + '" data-mce-alt="' + icon + '" tabindex="-1" ' +
					'role="option" aria-label="' + icon + '"><img src="' +
					emoticonUrl + '" style="width: 18px; height: 18px" role="presentation" /></a></td>';
			});

			emoticonsHtml += '</tr>';
		});

		emoticonsHtml += '</table>';

		return emoticonsHtml;
	}

	editor.addButton('emoticons', {
		type: 'panelbutton',
		panel: {
			role: 'application',
			autohide: true,
			html: getHtml,
			onclick: function(e) {
				var linkElm = editor.dom.getParent(e.target, 'a');

				if (linkElm) {
					editor.insertContent(
						'<img src="' + linkElm.getAttribute('data-mce-url') + '" alt="' + linkElm.getAttribute('data-mce-alt') + '" />'
					);

					this.hide();
				}
			}
		},
		tooltip: 'Emoticons'
	});
});
