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
        var emoticon_map = [
         0x1F603,0x1F605,0x1F609,0x1F60A,0x1F60B,0x1F60D,0x1F62D,
         0x1F61E,0x1F620,0x1F621,0x1F622,0x1F637,0x1F635,0x1F61C,
         0x1F44D,0x1F44E,0x1F44F,0x2764,0x1F496,0x1F498,0x1F494,
         0x2708,0x1F680,0x1F684,0x1F687,0x1F68C,0x1F697,0x1F6A2,
         0x1F6B2,0x1F6B6,0x2705,0x2615,0x1F355,0x1F389,0x1F3C1
        ];
              
        while (emoticon_map.length) {
          emoticonsHtml.push('<tr>');
          var row = emoticon_map.splice(0, 7);

          for (var i = 0; i < row.length; i++) {
              var icon = row[i];
              var emoticonUrl = '#';

              emoticonsHtml.push('<td><a style="font-size:24px;text-decoration:none; color:#666666" href="#" data-mce-url="');
              emoticonsHtml.push(String.fromCodePoint(icon));
              emoticonsHtml.push('" tabindex="-1">');
              emoticonsHtml.push(String.fromCodePoint(icon));
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
                    editor.insertContent(linkElm.getAttribute('data-mce-url'));
                    this.hide();
                }
            }
        },
        icon: 'emoticons',
        tooltip: 'Emoticons'
    });
});
