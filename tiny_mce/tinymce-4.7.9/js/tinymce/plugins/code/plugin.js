(function () {
var code = (function () {
  'use strict';

  var PluginManager = tinymce.util.Tools.resolve('tinymce.PluginManager');

  var DOMUtils = tinymce.util.Tools.resolve('tinymce.dom.DOMUtils');

  var getMinWidth = function (editor) {
    return editor.getParam('code_dialog_width', 600);
  };
  var getMinHeight = function (editor) {
    return editor.getParam('code_dialog_height', Math.min(DOMUtils.DOM.getViewPort().h - 200, 500));
  };
  var $_cs05ys9ajepc6irg = {
    getMinWidth: getMinWidth,
    getMinHeight: getMinHeight
  };

  var setContent = function (editor, html) {
    editor.focus();
    editor.undoManager.transact(function () {
      editor.setContent(html);
    });
    editor.selection.setCursorLocation();
    editor.nodeChanged();
  };
  var getContent = function (editor) {
    return editor.getContent({ source_view: true });
  };
  var $_elujsy9cjepc6irj = {
    setContent: setContent,
    getContent: getContent
  };

  var open = function (editor) {
    var minWidth = $_cs05ys9ajepc6irg.getMinWidth(editor);
    var minHeight = $_cs05ys9ajepc6irg.getMinHeight(editor);
    var win = editor.windowManager.open({
      title: 'Source code',
      body: {
        type: 'textbox',
        name: 'code',
        multiline: true,
        minWidth: minWidth,
        minHeight: minHeight,
        spellcheck: false,
        style: 'direction: ltr; text-align: left'
      },
      onSubmit: function (e) {
        $_elujsy9cjepc6irj.setContent(editor, e.data.code);
      }
    });
    win.find('#code').value($_elujsy9cjepc6irj.getContent(editor));
  };
  var $_cnsayh99jepc6ire = { open: open };

  var register = function (editor) {
    editor.addCommand('mceCodeEditor', function () {
      $_cnsayh99jepc6ire.open(editor);
    });
  };
  var $_361x7x98jepc6ird = { register: register };

  var register$1 = function (editor) {
    editor.addButton('code', {
      icon: 'code',
      tooltip: 'Source code',
      onclick: function () {
        $_cnsayh99jepc6ire.open(editor);
      }
    });
    editor.addMenuItem('code', {
      icon: 'code',
      text: 'Source code',
      onclick: function () {
        $_cnsayh99jepc6ire.open(editor);
      }
    });
  };
  var $_5ldz7t9djepc6irk = { register: register$1 };

  PluginManager.add('code', function (editor) {
    $_361x7x98jepc6ird.register(editor);
    $_5ldz7t9djepc6irk.register(editor);
    return {};
  });
  function Plugin () {
  }

  return Plugin;

}());
})();
