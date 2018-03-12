/**
 * RangeNormalizer.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import CaretFinder from '../caret/CaretFinder';
import CaretPosition from '../caret/CaretPosition';
import * as CaretUtils from '../caret/CaretUtils';

const createRange = function (sc, so, ec, eo) {
  const rng = document.createRange();
  rng.setStart(sc, so);
  rng.setEnd(ec, eo);
  return rng;
};

// If you triple click a paragraph in this case:
//   <blockquote><p>a</p></blockquote><p>b</p>
// It would become this range in webkit:
//   <blockquote><p>[a</p></blockquote><p>]b</p>
// We would want it to be:
//   <blockquote><p>[a]</p></blockquote><p>b</p>
// Since it would otherwise produces spans out of thin air on insertContent for example.
const normalizeBlockSelectionRange = function (rng) {
  const startPos = CaretPosition.fromRangeStart(rng);
  const endPos = CaretPosition.fromRangeEnd(rng);
  const rootNode = rng.commonAncestorContainer;

  return CaretFinder.fromPosition(false, rootNode, endPos)
    .map(function (newEndPos) {
      if (!CaretUtils.isInSameBlock(startPos, endPos, rootNode) && CaretUtils.isInSameBlock(startPos, newEndPos, rootNode)) {
        return createRange(startPos.container(), startPos.offset(), newEndPos.container(), newEndPos.offset());
      } else {
        return rng;
      }
    }).getOr(rng);
};

const normalizeBlockSelection = function (rng) {
  return rng.collapsed ? rng : normalizeBlockSelectionRange(rng);
};

const normalize = function (rng) {
  return normalizeBlockSelection(rng);
};

export default {
  normalize
};