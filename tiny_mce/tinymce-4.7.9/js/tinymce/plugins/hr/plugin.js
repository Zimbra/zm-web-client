(function () {
var hr = (function () {
  'use strict';

  var PluginManager = tinymce.util.Tools.resolve('tinymce.PluginManager');

  var register = function (editor) {
    editor.addCommand('InsertHorizontalRule', function () {
      editor.execCommand('mceInsertContent', false, '<hr />');
    });
  };
  var $_g0vz5nbsjeo9p5zl = { register: register };

  var register$1 = function (editor) {
    editor.addButton('hr', {
      icon: 'hr',
      tooltip: 'Horizontal line',
      cmd: 'InsertHorizontalRule'
    });
    editor.addMenuItem('hr', {
      icon: 'hr',
      text: 'Horizontal line',
      cmd: 'InsertHorizontalRule',
      context: 'insert'
    });
  };
  var $_4m7mf9btjeo9p5zm = { register: register$1 };

  PluginManager.add('hr', function (editor) {
    $_g0vz5nbsjeo9p5zl.register(editor);
    $_4m7mf9btjeo9p5zm.register(editor);
  });
  function Plugin () {
  }

  return Plugin;

}());
})();
