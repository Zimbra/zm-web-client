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
  var $_1gbwg99ajeo9p5g8 = {
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
  var $_6cc6zs9cjeo9p5gd = {
    setContent: setContent,
    getContent: getContent
  };

  var open = function (editor) {
    var minWidth = $_1gbwg99ajeo9p5g8.getMinWidth(editor);
    var minHeight = $_1gbwg99ajeo9p5g8.getMinHeight(editor);
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
        $_6cc6zs9cjeo9p5gd.setContent(editor, e.data.code);
      }
    });
    win.find('#code').value($_6cc6zs9cjeo9p5gd.getContent(editor));
  };
  var $_9wqccw99jeo9p5g7 = { open: open };

  var register = function (editor) {
    editor.addCommand('mceCodeEditor', function () {
      $_9wqccw99jeo9p5g7.open(editor);
    });
  };
  var $_d84eco98jeo9p5g0 = { register: register };

  var register$1 = function (editor) {
    editor.addButton('code', {
      icon: 'code',
      tooltip: 'Source code',
      onclick: function () {
        $_9wqccw99jeo9p5g7.open(editor);
      }
    });
    editor.addMenuItem('code', {
      icon: 'code',
      text: 'Source code',
      onclick: function () {
        $_9wqccw99jeo9p5g7.open(editor);
      }
    });
  };
  var $_6g39ve9djeo9p5ge = { register: register$1 };

  PluginManager.add('code', function (editor) {
    $_d84eco98jeo9p5g0.register(editor);
    $_6g39ve9djeo9p5ge.register(editor);
    return {};
  });
  function Plugin () {
  }

  return Plugin;

}());
})();
