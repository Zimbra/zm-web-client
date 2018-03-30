(function () {
var hr = (function () {
  'use strict';

  var PluginManager = tinymce.util.Tools.resolve('tinymce.PluginManager');

  var register = function (editor) {
    editor.addCommand('InsertHorizontalRule', function () {
      editor.execCommand('mceInsertContent', false, '<hr />');
    });
  };
  var $_8jsw1bbsjepc6jr7 = { register: register };

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
  var $_8t4x1kbtjepc6jre = { register: register$1 };

  PluginManager.add('hr', function (editor) {
    $_8jsw1bbsjepc6jr7.register(editor);
    $_8t4x1kbtjepc6jre.register(editor);
  });
  function Plugin () {
  }

  return Plugin;

}());
})();
