/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { HTMLElement } from '@ephox/dom-globals';
import Actions from '../core/Actions';
import CharMap from '../core/CharMap';
import GridHtml from './GridHtml';

const getParentTd = function (elm) {
  while (elm) {
    if (elm.nodeName === 'TD') {
      return elm;
    }

    elm = elm.parentNode;
  }
};

const open = function (editor) {
  let win;

  const handleMouseOver = function (e) {
    const td = getParentTd(e.target);

    if (td && td.firstChild) {
      win.find('#preview').text(td.firstChild.firstChild.data);
      win.find('#previewTitle').text(td.title);
    } else {
      win.find('#preview').text(' ');
      win.find('#previewTitle').text(' ');
    }
  };

  const charMapPanel = {
    type: 'container',
    html: GridHtml.getHtml(CharMap.getCharMap(editor)),
    onclick (e) {
      const target = e.target;

      if (/^(TD|DIV)$/.test(target.nodeName)) {
        const charDiv = getParentTd(target).firstChild;
        if (charDiv && charDiv.hasAttribute('data-chr')) {
          const charCodeString = charDiv.getAttribute('data-chr');
          const charCode = parseInt(charCodeString, 10);

          if (!isNaN(charCode)) {
            Actions.insertChar(editor, String.fromCharCode(charCode));
          }

          if (!e.ctrlKey) {
            win.close();
          }
        }
      }
    },

    onkeyDown(e) {
      const chars = Array.from(this.$el.context.querySelectorAll('div'));
      const totalChars = chars.length;
      const currentCharIndex = chars.indexOf(e.target);
      let nextCharIndex = null;

      if (e.keyCode === 37 || e.keyCode === 39 || e.keyCode === 9) {
        nextCharIndex = currentCharIndex;
      } else if (e.keyCode === 38 || e.keyCode === 40) {
        nextCharIndex =
          e.keyCode === 38
            ? totalChars + currentCharIndex - 24
            : currentCharIndex + 24;
      }

      if (nextCharIndex) {
        const nextChar = chars[nextCharIndex % totalChars];
        e.target.blur();
        (nextChar as HTMLElement).focus();
        handleMouseOver(e);
      }
    },

    onmouseover: handleMouseOver,
  };

  win = editor.windowManager.open({
    title: 'Special character',
    spacing: 10,
    padding: 10,
    items: [
      charMapPanel,
      {
        type: 'container',
        layout: 'flex',
        direction: 'column',
        align: 'center',
        spacing: 5,
        minWidth: 160,
        minHeight: 160,
        items: [
          {
            type: 'label',
            name: 'preview',
            text: ' ',
            style: 'font-size: 40px; text-align: center',
            border: 1,
            minWidth: 140,
            minHeight: 80
          },
          {
            type: 'spacer',
            minHeight: 20
          },
          {
            type: 'label',
            name: 'previewTitle',
            text: ' ',
            style: 'white-space: pre-wrap;',
            border: 1,
            minWidth: 140
          }
        ]
      }
    ],
    buttons: [
      {
        text: 'Close', onclick () {
          win.close();
        }
      }
    ]
  });
};

export default {
  open
};