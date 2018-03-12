(function () {
var print = (function () {
  'use strict';

  var PluginManager = tinymce.util.Tools.resolve('tinymce.PluginManager');

  var register = function (editor) {
    editor.addCommand('mcePrint', function () {
      editor.getWin().print();
    });
  };
  var $_fbv2tjicjeo9p7he = { register: register };

  var register$1 = function (editor) {
    editor.addButton('print', {
      title: 'Print',
      cmd: 'mcePrint'
    });
    editor.addMenuItem('print', {
      text: 'Print',
      cmd: 'mcePrint',
      icon: 'print'
    });
  };
  var $_e989h0idjeo9p7hf = { register: register$1 };

  PluginManager.add('print', function (editor) {
    $_fbv2tjicjeo9p7he.register(editor);
    $_e989h0idjeo9p7hf.register(editor);
    editor.addShortcut('Meta+P', '', 'mcePrint');
  });
  function Plugin () {
  }

  return Plugin;

}());
})();
