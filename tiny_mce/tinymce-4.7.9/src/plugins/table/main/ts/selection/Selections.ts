/**
 * Selections.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import { TableSelection } from '@ephox/darwin';
import Util from '../alien/Util';
import Ephemera from './Ephemera';
import SelectionTypes from './SelectionTypes';

export default function (editor) {
  const get = function () {
    const body = Util.getBody(editor);

    return TableSelection.retrieve(body, Ephemera.selectedSelector()).fold(function () {
      if (editor.selection.getStart() === undefined) {
        return SelectionTypes.none();
      } else {
        return SelectionTypes.single(editor.selection);
      }
    }, function (cells) {
      return SelectionTypes.multiple(cells);
    });
  };

  return {
    get
  };
}