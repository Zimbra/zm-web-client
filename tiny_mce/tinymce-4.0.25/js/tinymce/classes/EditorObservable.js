/*
 * ***** BEGIN LICENSE BLOCK *****
 * 
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2014 Zimbra, Inc.
 * 
 * The contents of this file are subject to the Common Public Attribution License Version 1.0 (the “License”);
 * you may not use this file except in compliance with the License. 
 * You may obtain a copy of the License at: http://www.zimbra.com/license
 * The License is based on the Mozilla Public License Version 1.1 but Sections 14 and 15 
 * have been added to cover use of software over a computer network and provide for limited attribution 
 * for the Original Developer. In addition, Exhibit A has been modified to be consistent with Exhibit B. 
 * 
 * Software distributed under the License is distributed on an “AS IS” basis, 
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. 
 * See the License for the specific language governing rights and limitations under the License. 
 * The Original Code is Zimbra Open Source Web Client. 
 * The Initial Developer of the Original Code is Zimbra, Inc. 
 * All portions of the code are Copyright (C) 2014 Zimbra, Inc. All Rights Reserved. 
 * 
 * ***** END LICENSE BLOCK *****
 */
/**
 * EditorObservable.js
 *
 * Copyright, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * This mixin contains the event logic for the tinymce.Editor class.
 *
 * @mixin tinymce.EditorObservable
 * @extends tinymce.util.Observable
 */
define("tinymce/EditorObservable", [
	"tinymce/util/Observable",
	"tinymce/dom/DOMUtils",
	"tinymce/util/Tools"
], function(Observable, DOMUtils, Tools) {
	var DOM = DOMUtils.DOM;

	function getEventTarget(editor, eventName) {
		if (eventName == 'selectionchange') {
			return editor.getDoc();
		}

		// Need to bind mousedown/mouseup etc to document not body in iframe mode
		// Since the user might click on the HTML element not the BODY
		if (!editor.inline && /^mouse|click|contextmenu|drop/.test(eventName)) {
			return editor.getDoc();
		}

		return editor.getBody();
	}

	function bindEventDelegate(editor, name) {
		var eventRootSelector = editor.settings.event_root, editorManager = editor.editorManager;
		var eventRootElm = editorManager.eventRootElm || getEventTarget(editor, name);

		if (eventRootSelector) {
			if (!editorManager.rootEvents) {
				editorManager.rootEvents = {};

				editorManager.on('RemoveEditor', function() {
					if (!editorManager.activeEditor) {
						DOM.unbind(eventRootElm);
						delete editorManager.rootEvents;
					}
				});
			}

			if (editorManager.rootEvents[name]) {
				return;
			}

			if (eventRootElm == editor.getBody()) {
				eventRootElm = DOM.select(eventRootSelector)[0];
				editorManager.eventRootElm = eventRootElm;
			}

			editorManager.rootEvents[name] = true;

			DOM.bind(eventRootElm, name, function(e) {
				var target = e.target, editors = editorManager.editors, i = editors.length;

				while (i--) {
					var body = editors[i].getBody();

					if (body === target || DOM.isChildOf(target, body)) {
						if (!editors[i].hidden) {
							editors[i].fire(name, e);
						}
					}
				}
			});
		} else {
			editor.dom.bind(eventRootElm, name, function(e) {
				if (!editor.hidden) {
					editor.fire(name, e);
				}
			});
		}
	}

	var EditorObservable = {
		bindPendingEventDelegates: function() {
			var self = this;

			Tools.each(self._pendingNativeEvents, function(name) {
				bindEventDelegate(self, name);
			});
		},

		toggleNativeEvent: function(name, state) {
			var self = this;

			if (self.settings.readonly) {
				return;
			}

			// Never bind focus/blur since the FocusManager fakes those
			if (name == "focus" || name == "blur") {
				return;
			}

			if (state) {
				if (self.initialized) {
					bindEventDelegate(self, name);
				} else {
					if (!self._pendingNativeEvents) {
						self._pendingNativeEvents = [name];
					} else {
						self._pendingNativeEvents.push(name);
					}
				}
			} else if (self.initialized) {
				self.dom.unbind(getEventTarget(self, name), name);
			}
		}
	};

	EditorObservable = Tools.extend({}, Observable, EditorObservable);

	return EditorObservable;
});
