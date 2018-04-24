(function () {
var save = (function () {
  'use strict';

  var PluginManager = tinymce.util.Tools.resolve('tinymce.PluginManager');

  var DOMUtils = tinymce.util.Tools.resolve('tinymce.dom.DOMUtils');

  var Tools = tinymce.util.Tools.resolve('tinymce.util.Tools');

  var enableWhenDirty = function (editor) {
    return editor.getParam('save_enablewhendirty', true);
  };
  var hasOnSaveCallback = function (editor) {
    return !!editor.getParam('save_onsavecallback');
  };
  var hasOnCancelCallback = function (editor) {
    return !!editor.getParam('save_oncancelcallback');
  };
  var $_1y2pmhikjepc6nmy = {
    enableWhenDirty: enableWhenDirty,
    hasOnSaveCallback: hasOnSaveCallback,
    hasOnCancelCallback: hasOnCancelCallback
  };

  var displayErrorMessage = function (editor, message) {
    editor.notificationManager.open({
      text: editor.translate(message),
      type: 'error'
    });
  };
  var save = function (editor) {
    var formObj;
    formObj = DOMUtils.DOM.getParent(editor.id, 'form');
    if ($_1y2pmhikjepc6nmy.enableWhenDirty(editor) && !editor.isDirty()) {
      return;
    }
    editor.save();
    if ($_1y2pmhikjepc6nmy.hasOnSaveCallback(editor)) {
      editor.execCallback('save_onsavecallback', editor);
      editor.nodeChanged();
      return;
    }
    if (formObj) {
      editor.setDirty(false);
      if (!formObj.onsubmit || formObj.onsubmit()) {
        if (typeof formObj.submit === 'function') {
          formObj.submit();
        } else {
          displayErrorMessage(editor, 'Error: Form submit field collision.');
        }
      }
      editor.nodeChanged();
    } else {
      displayErrorMessage(editor, 'Error: No form element found.');
    }
  };
  var cancel = function (editor) {
    var h = Tools.trim(editor.startContent);
    if ($_1y2pmhikjepc6nmy.hasOnCancelCallback(editor)) {
      editor.execCallback('save_oncancelcallback', editor);
      return;
    }
    editor.setContent(h);
    editor.undoManager.clear();
    editor.nodeChanged();
  };
  var $_chb8o3ihjepc6nmp = {
    save: save,
    cancel: cancel
  };

  var register = function (editor) {
    editor.addCommand('mceSave', function () {
      $_chb8o3ihjepc6nmp.save(editor);
    });
    editor.addCommand('mceCancel', function () {
      $_chb8o3ihjepc6nmp.cancel(editor);
    });
  };
  var $_dpwhptigjepc6nmn = { register: register };

  var stateToggle = function (editor) {
    return function (e) {
      var ctrl = e.control;
      editor.on('nodeChange dirty', function () {
        ctrl.disabled($_1y2pmhikjepc6nmy.enableWhenDirty(editor) && !editor.isDirty());
      });
    };
  };
  var register$1 = function (editor) {
    editor.addButton('save', {
      icon: 'save',
      text: 'Save',
      cmd: 'mceSave',
      disabled: true,
      onPostRender: stateToggle(editor)
    });
    editor.addButton('cancel', {
      text: 'Cancel',
      icon: false,
      cmd: 'mceCancel',
      disabled: true,
      onPostRender: stateToggle(editor)
    });
    editor.addShortcut('Meta+S', '', 'mceSave');
  };
  var $_fwt3w1iljepc6nn3 = { register: register$1 };

  PluginManager.add('save', function (editor) {
    $_fwt3w1iljepc6nn3.register(editor);
    $_dpwhptigjepc6nmn.register(editor);
  });
  function Plugin () {
  }

  return Plugin;

}());
})();
