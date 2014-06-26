/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2014 Zimbra, Inc.
 * 
 * The contents of this file are subject to the Common Public Attribution License Version 1.0 (the "License");
 * you may not use this file except in compliance with the License. 
 * You may obtain a copy of the License at: http://www.zimbra.com/license
 * The License is based on the Mozilla Public License Version 1.1 but Sections 14 and 15 
 * have been added to cover use of software over a computer network and provide for limited attribution 
 * for the Original Developer. In addition, Exhibit A has been modified to be consistent with Exhibit B. 
 * 
 * Software distributed under the License is distributed on an "AS IS" basis, 
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. 
 * See the License for the specific language governing rights and limitations under the License. 
 * The Original Code is Zimbra Open Source Web Client. 
 * The Initial Developer of the Original Code is Zimbra, Inc. 
 * All portions of the code are Copyright (C) 2014 Zimbra, Inc. All Rights Reserved. 
 * ***** END LICENSE BLOCK *****
 */
/**
 * plugin.js
 *
 * Copyright, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/*global tinymce:true */

tinymce.PluginManager.add('save', function(editor) {
	function save() {
		var formObj;

		formObj = tinymce.DOM.getParent(editor.id, 'form');

		if (editor.getParam("save_enablewhendirty", true) && !editor.isDirty()) {
			return;
		}

		tinymce.triggerSave();

		// Use callback instead
		if (editor.getParam("save_onsavecallback")) {
			if (editor.execCallback('save_onsavecallback', editor)) {
				editor.startContent = tinymce.trim(editor.getContent({format: 'raw'}));
				editor.nodeChanged();
			}

			return;
		}

		if (formObj) {
			editor.isNotDirty = true;

			if (!formObj.onsubmit || formObj.onsubmit()) {
				if (typeof(formObj.submit) == "function") {
					formObj.submit();
				} else {
					editor.windowManager.alert("Error: Form submit field collision.");
				}
			}

			editor.nodeChanged();
		} else {
			editor.windowManager.alert("Error: No form element found.");
		}
	}

	function cancel() {
		var h = tinymce.trim(editor.startContent);

		// Use callback instead
		if (editor.getParam("save_oncancelcallback")) {
			editor.execCallback('save_oncancelcallback', editor);
			return;
		}

		editor.setContent(h);
		editor.undoManager.clear();
		editor.nodeChanged();
	}

	function stateToggle() {
		var self = this;

		editor.on('nodeChange', function() {
			self.disabled(editor.getParam("save_enablewhendirty", true) && !editor.isDirty());
		});
	}

	editor.addCommand('mceSave', save);
	editor.addCommand('mceCancel', cancel);

	editor.addButton('save', {
		icon: 'save',
		text: 'Save',
		cmd: 'mceSave',
		disabled: true,
		onPostRender: stateToggle
	});

	editor.addButton('cancel', {
		text: 'Cancel',
		icon: false,
		cmd: 'mceCancel',
		disabled: true,
		onPostRender: stateToggle
	});

	editor.addShortcut('ctrl+s', '', 'mceSave');
});
