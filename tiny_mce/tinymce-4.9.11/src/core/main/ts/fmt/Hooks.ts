/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import ArrUtils from '../util/ArrUtils';
import NodeType from '../dom/NodeType';
import $ from '../api/dom/DomQuery';

/**
 * Internal class for overriding formatting.
 *
 * @private
 * @class tinymce.fmt.Hooks
 */

const postProcessHooks = {}, filter = ArrUtils.filter, each = ArrUtils.each;

const addPostProcessHook = function (name, hook) {
  let hooks = postProcessHooks[name];

  if (!hooks) {
    postProcessHooks[name] = hooks = [];
  }

  postProcessHooks[name].push(hook);
};

const postProcess = function (name, editor) {
  each(postProcessHooks[name], function (hook) {
    hook(editor);
  });
};

addPostProcessHook('pre', function (editor) {
  const rng = editor.selection.getRng();
  let isPre, blocks;

  const hasPreSibling = function (pre) {
    return isPre(pre.previousSibling) && ArrUtils.indexOf(blocks, pre.previousSibling) !== -1;
  };

  const joinPre = function (pre1, pre2) {
    $(pre2).remove();
    $(pre1).append('<br><br>').append(pre2.childNodes);
  };

  isPre = NodeType.matchNodeNames('pre');

  if (!rng.collapsed) {
    blocks = editor.selection.getSelectedBlocks();

    each(filter(filter(blocks, isPre), hasPreSibling), function (pre) {
      joinPre(pre.previousSibling, pre);
    });
  }
});

export default {
  postProcess
};