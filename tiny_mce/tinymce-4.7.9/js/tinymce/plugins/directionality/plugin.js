(function () {
var directionality = (function () {
  'use strict';

  var PluginManager = tinymce.util.Tools.resolve('tinymce.PluginManager');

  var Tools = tinymce.util.Tools.resolve('tinymce.util.Tools');

  var setDir = function (editor, dir) {
    var dom = editor.dom;
    var curDir;
    var blocks = editor.selection.getSelectedBlocks();
    if (blocks.length) {
      curDir = dom.getAttrib(blocks[0], 'dir');
      Tools.each(blocks, function (block) {
        if (!dom.getParent(block.parentNode, '*[dir="' + dir + '"]', dom.getRoot())) {
          dom.setAttrib(block, 'dir', curDir !== dir ? dir : null);
        }
      });
      editor.nodeChanged();
    }
  };
  var $_bhmmmzabjeo9p5nk = { setDir: setDir };

  var register = function (editor) {
    editor.addCommand('mceDirectionLTR', function () {
      $_bhmmmzabjeo9p5nk.setDir(editor, 'ltr');
    });
    editor.addCommand('mceDirectionRTL', function () {
      $_bhmmmzabjeo9p5nk.setDir(editor, 'rtl');
    });
  };
  var $_uxo6qaajeo9p5nj = { register: register };

  var generateSelector = function (dir) {
    var selector = [];
    Tools.each('h1 h2 h3 h4 h5 h6 div p'.split(' '), function (name) {
      selector.push(name + '[dir=' + dir + ']');
    });
    return selector.join(',');
  };
  var register$1 = function (editor) {
    editor.addButton('ltr', {
      title: 'Left to right',
      cmd: 'mceDirectionLTR',
      stateSelector: generateSelector('ltr')
    });
    editor.addButton('rtl', {
      title: 'Right to left',
      cmd: 'mceDirectionRTL',
      stateSelector: generateSelector('rtl')
    });
  };
  var $_cae2mkadjeo9p5nn = { register: register$1 };

  PluginManager.add('directionality', function (editor) {
    $_uxo6qaajeo9p5nj.register(editor);
    $_cae2mkadjeo9p5nn.register(editor);
  });
  function Plugin () {
  }

  return Plugin;

}());
})();
