/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Element, Selectors } from '@ephox/sugar';
import Settings from '../api/Settings';
import NewLineUtils from './NewLineUtils';

const matchesSelector = function (editor, selector) {
  return NewLineUtils.getParentBlock(editor).filter(function (parentBlock) {
    return selector.length > 0 && Selectors.is(Element.fromDom(parentBlock), selector);
  }).isSome();
};

const shouldInsertBr = function (editor) {
  return matchesSelector(editor, Settings.getBrNewLineSelector(editor));
};

const shouldBlockNewLine = function (editor) {
  return matchesSelector(editor, Settings.getNoNewLineSelector(editor));
};

export default {
  shouldInsertBr,
  shouldBlockNewLine
};