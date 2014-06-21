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
 * Checkbox.js
 *
 * Copyright, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * This control creates a custom checkbox.
 *
 * @example
 * // Create and render a checkbox to the body element
 * tinymce.ui.Factory.create({
 *     type: 'checkbox',
 *     checked: true,
 *     text: 'My checkbox'
 * }).renderTo(document.body);
 *
 * @-x-less Checkbox.less
 * @class tinymce.ui.Checkbox
 * @extends tinymce.ui.Widget
 */
define("tinymce/ui/Checkbox", [
	"tinymce/ui/Widget"
], function(Widget) {
	"use strict";

	return Widget.extend({
		Defaults: {
			classes: "checkbox",
			role: "checkbox",
			checked: false
		},

		/**
		 * Constructs a new Checkbox instance with the specified settings.
		 *
		 * @constructor
		 * @param {Object} settings Name/value object with settings.
		 * @setting {Boolean} checked True if the checkbox should be checked by default.
		 */
		init: function(settings) {
			var self = this;

			self._super(settings);

			self.on('click mousedown', function(e) {
				e.preventDefault();
			});

			self.on('click', function(e) {
				e.preventDefault();

				if (!self.disabled()) {
					self.checked(!self.checked());
				}
			});

			self.checked(self.settings.checked);
		},

		/**
		 * Getter/setter function for the checked state.
		 *
		 * @method checked
		 * @param {Boolean} [state] State to be set.
		 * @return {Boolean|tinymce.ui.Checkbox} True/false or checkbox if it's a set operation.
		 */
		checked: function(state) {
			var self = this;

			if (typeof state != "undefined") {
				if (state) {
					self.addClass('checked');
				} else {
					self.removeClass('checked');
				}

				self._checked = state;
				self.aria('checked', state);

				return self;
			}

			return self._checked;
		},

		/**
		 * Getter/setter function for the value state.
		 *
		 * @method value
		 * @param {Boolean} [state] State to be set.
		 * @return {Boolean|tinymce.ui.Checkbox} True/false or checkbox if it's a set operation.
		 */
		value: function(state) {
			return this.checked(state);
		},

		/**
		 * Renders the control as a HTML string.
		 *
		 * @method renderHtml
		 * @return {String} HTML representing the control.
		 */
		renderHtml: function() {
			var self = this, id = self._id, prefix = self.classPrefix;

			return (
				'<div id="' + id + '" class="' + self.classes() + '" unselectable="on" aria-labelledby="' + id + '-al" tabindex="-1">' +
					'<i class="' + prefix + 'ico ' + prefix + 'i-checkbox"></i>' +
					'<span id="' + id + '-al" class="' + prefix + 'label">' + self.encode(self._text) + '</span>' +
				'</div>'
			);
		}
	});
});