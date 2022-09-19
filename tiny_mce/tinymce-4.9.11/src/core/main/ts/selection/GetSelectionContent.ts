/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Option } from '@ephox/katamari';
import { Element } from '@ephox/sugar';
import { GetContentArgs } from '../content/GetContent';
import EventProcessRanges from './EventProcessRanges';
import FragmentReader from './FragmentReader';
import MultiRange from './MultiRange';
import Zwsp from '../text/Zwsp';
import { Editor } from '../api/Editor';

export interface GetSelectionContentArgs extends GetContentArgs {
  selection?: boolean;
  contextual?: boolean;
}

const getTextContent = (editor: Editor): string => {
  return Option.from(editor.selection.getRng()).map((rng) => {
    const bin = editor.dom.add(editor.getBody(), 'div', {
      'data-mce-bogus': 'all',
      'style': 'overflow: hidden; opacity: 0;'
    }, rng.cloneContents());

    const text = Zwsp.trim(bin.innerText);
    editor.dom.remove(bin);
    return text;
  }).getOr('');
};

const getHtmlContent = (editor: Editor, args: GetSelectionContentArgs): string => {
  const rng = editor.selection.getRng(), tmpElm = editor.dom.create('body');
  const sel = editor.selection.getSel();
  let fragment;
  const ranges = EventProcessRanges.processRanges(editor, MultiRange.getRanges(sel));

  fragment = args.contextual ? FragmentReader.read(Element.fromDom(editor.getBody()), ranges).dom() : rng.cloneContents();
  if (fragment) {
    tmpElm.appendChild(fragment);
  }

  return editor.selection.serializer.serialize(tmpElm, args);
};

const getContent = (editor: Editor, args: GetSelectionContentArgs = {}): string => {
  args.get = true;
  args.format = args.format || 'html';
  args.selection = true;

  args = editor.fire('BeforeGetContent', args);
  if (args.isDefaultPrevented()) {
    editor.fire('GetContent', args);
    return args.content;
  }

  if (args.format === 'text') {
    return getTextContent(editor);
  } else {
    args.getInner = true;
    const content = getHtmlContent(editor, args);

    if (args.format === 'tree') {
      return content;
    } else {
      args.content = editor.selection.isCollapsed() ? '' : content;
      editor.fire('GetContent', args);
      return args.content;
    }
  }
};

export default {
  getContent
};