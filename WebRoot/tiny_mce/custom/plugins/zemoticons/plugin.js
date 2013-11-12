/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2013 Zimbra Software, LLC.
 * 
 * The contents of this file are subject to the Zimbra Public License
 * Version 1.4 ("License"); you may not use this file except in
 * compliance with the License.  You may obtain a copy of the License at
 * http://www.zimbra.com/license.
 * 
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied.
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

        var emoticons = AjxUtil.getHashKeys(tinyMCE.emoticon_map);

        while (emoticons.length) {
            emoticonsHtml.push('<tr>');

            AjxUtil.foreach(emoticons.splice(0, 4), function(icon) {
                var emoticonUrl = tinyMCE.emoticon_map[icon];

                emoticonsHtml.push('<td><a href="#" data-mce-url="');
                emoticonsHtml.push(emoticonUrl);
                emoticonsHtml.push('" tabindex="-1"><img src="');
                emoticonsHtml.push(emoticonUrl);
                emoticonsHtml.push('" style="width: 18px; height: 18px" alt="');
                emoticonsHtml.push(icon);
                emoticonsHtml.push('">');
                emoticonsHtml.push('</a></td>');
            });

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
                    editor.insertContent('<img src="' + linkElm.getAttribute('data-mce-url') + '" />');
                    this.hide();
                }
            }
        },
        icon: 'emoticons',
        tooltip: 'Emoticons'
    });
});
