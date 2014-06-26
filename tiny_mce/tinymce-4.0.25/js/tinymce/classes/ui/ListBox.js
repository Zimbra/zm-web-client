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
 * ListBox.js
 *
 * Copyright, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * Creates a new list box control.
 *
 * @-x-less ListBox.less
 * @class tinymce.ui.ListBox
 * @extends tinymce.ui.MenuButton
 */
define("tinymce/ui/ListBox", [
	"tinymce/ui/MenuButton"
], function(MenuButton) {
	"use strict";

	return MenuButton.extend({
		/**
		 * Constructs a instance with the specified settings.
		 *
		 * @constructor
		 * @param {Object} settings Name/value object with settings.
		 * @setting {Array} values Array with values to add to list box.
		 */
		init: function(settings) {
			var self = this, values, i, selected, selectedText, lastItemCtrl;

			self._values = values = settings.values;
			if (values) {
				for (i = 0; i < values.length; i++) {
					selected = values[i].selected || settings.value === values[i].value;

					if (selected) {
						selectedText = selectedText || values[i].text;
						self._value = values[i].value;
						break;
					}
				}

				// Default with first item
				if (!selected && values.length > 0) {
					selectedText = values[0].text;
					self._value = values[0].value;
				}

				settings.menu = values;
			}

			settings.text = settings.text || selectedText || values[0].text;

			self._super(settings);
			self.addClass('listbox');

			self.on('select', function(e) {
				var ctrl = e.control;

				if (lastItemCtrl) {
					e.lastControl = lastItemCtrl;
				}

				if (settings.multiple) {
					ctrl.active(!ctrl.active());
				} else {
					self.value(e.control.settings.value);
				}

				lastItemCtrl = ctrl;
			});
		},

		/**
		 * Getter/setter function for the control value.
		 *
		 * @method value
		 * @param {String} [value] Value to be set.
		 * @return {Boolean/tinymce.ui.ListBox} Value or self if it's a set operation.
		 */
		value: function(value) {
			var self = this, active, selectedText, menu, i;

			function activateByValue(menu, value) {
				menu.items().each(function(ctrl) {
					active = ctrl.value() === value;

					if (active) {
						selectedText = selectedText || ctrl.text();
					}

					ctrl.active(active);

					if (ctrl.menu) {
						activateByValue(ctrl.menu, value);
					}
				});
			}

			if (typeof(value) != "undefined") {
				if (self.menu) {
					activateByValue(self.menu, value);
				} else {
					menu = self.settings.menu;
					for (i = 0; i < menu.length; i++) {
						active = menu[i].value == value;

						if (active) {
							selectedText = selectedText || menu[i].text;
						}

						menu[i].active = active;
					}
				}

				self.text(selectedText || this.settings.text);
			}

			return self._super(value);
		}
	});
});
