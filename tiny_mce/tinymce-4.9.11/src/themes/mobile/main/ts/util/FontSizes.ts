/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Arr, Fun, Option } from '@ephox/katamari';
import { Compare, Css, Element, Node, Traverse, PredicateFind } from '@ephox/sugar';

const candidates = [ '9px', '10px', '11px', '12px', '14px', '16px', '18px', '20px', '24px', '32px', '36px' ];

const defaultSize = 'medium';
const defaultIndex = 2;

const indexToSize = function (index) {
  return Option.from(candidates[index]);
};

const sizeToIndex = function (size) {
  return Arr.findIndex(candidates, function (v) {
    return v === size;
  });
};

const getRawOrComputed = function (isRoot, rawStart) {
  const optStart = Node.isElement(rawStart) ? Option.some(rawStart) : Traverse.parent(rawStart).filter(Node.isElement);
  return optStart.map(function (start) {
    const inline = PredicateFind.closest(start, (elem) => Css.getRaw(elem, 'font-size').isSome(), isRoot)
      .bind((elem) => Css.getRaw(elem, 'font-size'));

    return inline.getOrThunk(function () {
      return Css.get(start, 'font-size');
    });
  }).getOr('');
};

const getSize = function (editor) {
  // This was taken from the tinymce approach (FontInfo is unlikely to be global)
  const node = editor.selection.getStart();
  const elem = Element.fromDom(node);
  const root = Element.fromDom(editor.getBody());

  const isRoot = function (e) {
    return Compare.eq(root, e);
  };

  const elemSize = getRawOrComputed(isRoot, elem);
  return Arr.find(candidates, function (size) {
    return elemSize === size;
  }).getOr(defaultSize);
};

const applySize = function (editor, value) {
  const currentValue = getSize(editor);
  if (currentValue !== value) {
    editor.execCommand('fontSize', false, value);
  }
};

const get = function (editor) {
  const size = getSize(editor);
  return sizeToIndex(size).getOr(defaultIndex);
};

const apply = function (editor, index) {
  indexToSize(index).each(function (size) {
    applySize(editor, size);
  });
};

export default {
  candidates: Fun.constant(candidates),
  get,
  apply
};