/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import Direction from '../core/Direction';

const register = function (editor) {
  editor.addCommand('mceDirectionLTR', function () {
    Direction.setDir(editor, 'ltr');
  });

  editor.addCommand('mceDirectionRTL', function () {
    Direction.setDir(editor, 'rtl');
  });
};

export default {
  register
};