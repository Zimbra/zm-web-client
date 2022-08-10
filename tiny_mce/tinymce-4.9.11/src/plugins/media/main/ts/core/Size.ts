/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

const trimPx = function (value) {
  return value.replace(/px$/, '');
};

const addPx = function (value) {
  return /^[0-9.]+$/.test(value) ? (value + 'px') : value;
};

const getSize = function (name) {
  return function (elm) {
    return elm ? trimPx(elm.style[name]) : '';
  };
};

const setSize = function (name) {
  return function (elm, value) {
    if (elm) {
      elm.style[name] = addPx(value);
    }
  };
};

export default {
  getMaxWidth: getSize('maxWidth'),
  getMaxHeight: getSize('maxHeight'),
  setMaxWidth: setSize('maxWidth'),
  setMaxHeight: setSize('maxHeight')
};