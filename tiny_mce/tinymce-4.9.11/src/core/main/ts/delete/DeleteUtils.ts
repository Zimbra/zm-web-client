/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Option, Options } from '@ephox/katamari';
import { Compare, Element, PredicateFind } from '@ephox/sugar';
import CaretFinder from '../caret/CaretFinder';
import * as ElementType from '../dom/ElementType';
import InlineUtils from '../keyboard/InlineUtils';

const isBeforeRoot = function (rootNode) {
  return function (elm) {
    return Compare.eq(rootNode, Element.fromDom(elm.dom().parentNode));
  };
};

const getParentBlock = function (rootNode, elm) {
  return Compare.contains(rootNode, elm) ? PredicateFind.closest(elm, function (element) {
    return ElementType.isTextBlock(element) || ElementType.isListItem(element);
  }, isBeforeRoot(rootNode)) : Option.none<Element>();
};

const placeCaretInEmptyBody = function (editor) {
  const body = editor.getBody();
  const node = body.firstChild && editor.dom.isBlock(body.firstChild) ? body.firstChild : body;
  editor.selection.setCursorLocation(node, 0);
};

const paddEmptyBody = function (editor) {
  if (editor.dom.isEmpty(editor.getBody())) {
    editor.setContent('');
    placeCaretInEmptyBody(editor);
  }
};

const willDeleteLastPositionInElement = function (forward, fromPos, elm) {
  return Options.lift2(
    CaretFinder.firstPositionIn(elm),
    CaretFinder.lastPositionIn(elm),
    function (firstPos, lastPos) {
      const normalizedFirstPos = InlineUtils.normalizePosition(true, firstPos);
      const normalizedLastPos = InlineUtils.normalizePosition(false, lastPos);
      const normalizedFromPos = InlineUtils.normalizePosition(false, fromPos);

      if (forward) {
        return CaretFinder.nextPosition(elm, normalizedFromPos).map(function (nextPos) {
          return nextPos.isEqual(normalizedLastPos) && fromPos.isEqual(normalizedFirstPos);
        }).getOr(false);
      } else {
        return CaretFinder.prevPosition(elm, normalizedFromPos).map(function (prevPos) {
          return prevPos.isEqual(normalizedFirstPos) && fromPos.isEqual(normalizedLastPos);
        }).getOr(false);
      }
    }
  ).getOr(true);
};

export default {
  getParentBlock,
  paddEmptyBody,
  willDeleteLastPositionInElement
};