/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2014, 2015, 2016 Synacor, Inc.
 *
 * The contents of this file are subject to the Common Public Attribution License Version 1.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at: https://www.zimbra.com/license
 * The License is based on the Mozilla Public License Version 1.1 but Sections 14 and 15
 * have been added to cover use of software over a computer network and provide for limited attribution
 * for the Original Developer. In addition, Exhibit A has been modified to be consistent with Exhibit B.
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * See the License for the specific language governing rights and limitations under the License.
 * The Original Code is Zimbra Open Source Web Client.
 * The Initial Developer of the Original Code is Zimbra, Inc.  All rights to the Original Code were
 * transferred by Zimbra, Inc. to Synacor, Inc. on September 14, 2015.
 *
 * All portions of the code are Copyright (C) 2014, 2015, 2016 Synacor, Inc. All Rights Reserved.
 * ***** END LICENSE BLOCK *****
 */

/**
 * TinyMCE plugin that renders emoticons as Data URIs rather than URLs on the
 * server.
 *
 * Based on the 'emoticons' plugin in TinyMCE, but modified to obtain the list
 * of emoticons as well their sources from 'tinyMCE.emoticon_map', which we
 * generate at build time and insert into the TinyMCE package.
 *
 * One additional change is that we add an ALT attribute to the IMG tag.
 *
 * @author dan@cabo.dk
 */

tinymce.PluginManager.add('zemoticons', function(editor, url) {
    function getHtml() {
        var emoticonsHtml;

        emoticonsHtml = ['<table role="presentation" class="mce-grid">'];

        var emoticons = [];
        for (var icon in tinyMCE.emoticon_map)
            emoticons.push(icon);

        while (emoticons.length) {
            emoticonsHtml.push('<tr>');

            var row = emoticons.splice(0, 4);

            for (var i = 0; i < row.length; i++) {
                var icon = row[i];
                var emoticonUrl = tinyMCE.emoticon_map[icon];

                emoticonsHtml.push('<td><a href="#" data-mce-url="');
                emoticonsHtml.push(emoticonUrl);
                emoticonsHtml.push('" tabindex="-1"><img src="');
                emoticonsHtml.push(emoticonUrl);
                emoticonsHtml.push('" style="width: 18px; height: 18px" alt="');
                emoticonsHtml.push(icon);
                emoticonsHtml.push('">');
                emoticonsHtml.push('</a></td>');
            };

            emoticonsHtml.push('</tr>');
        }

        emoticonsHtml.push('</table>');

        return emoticonsHtml.join('');
    }

    editor.addButton('zemoticons', {
        type: 'panelbutton',
        panel: {
            autohide: true,
            html: getHtml,
            onclick: function(e) {
                var linkElm = editor.dom.getParent(e.target, 'a');
                if (linkElm) {
					var orig = editor.settings.paste_data_images;
					editor.settings.paste_data_images = true;
                    editor.insertContent('<img src="' + linkElm.getAttribute('data-mce-url') + '" />');
					editor.settings.paste_data_images = orig;
                    this.hide();
                }
            }
        },
        icon: 'emoticons',
        tooltip: 'Emoticons'
    });
});
