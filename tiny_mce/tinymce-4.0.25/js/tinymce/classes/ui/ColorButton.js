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
 * ColorButton.js
 *
 * Copyright, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * This class creates a color button control. This is a split button in which the main
 * button has a visual representation of the currently selected color. When clicked 
 * the caret button displays a color picker, allowing the user to select a new color.
 *
 * @-x-less ColorButton.less
 * @class tinymce.ui.ColorButton
 * @extends tinymce.ui.PanelButton
 */
define("tinymce/ui/ColorButton", [
	"tinymce/ui/PanelButton",
	"tinymce/dom/DOMUtils"
], function(PanelButton, DomUtils) {
	"use strict";
	
	var DOM = DomUtils.DOM;

	return PanelButton.extend({
		/**
		 * Constructs a new ColorButton instance with the specified settings.
		 *
		 * @constructor
		 * @param {Object} settings Name/value object with settings.
		 */
		init: function(settings) {
			this._super(settings);
			this.addClass('colorbutton');
		},

		/**
		 * Getter/setter for the current color.
		 *
		 * @method color
		 * @param {String} [color] Color to set.
		 * @return {String|tinymce.ui.ColorButton} Current color or current instance.
		 */
		color: function(color) {
			if (color) {
				this._color = color;
				this.getEl('preview').style.backgroundColor = color;
				return this;
			}

			return this._color;
		},

		/**
		 * Renders the control as a HTML string.
		 *
		 * @method renderHtml
		 * @return {String} HTML representing the control.
		 */
		renderHtml: function() {
			var self = this, id = self._id, prefix = self.classPrefix;
			var icon = self.settings.icon ? prefix + 'ico ' + prefix + 'i-' + self.settings.icon : '';
			var image = self.settings.image ? ' style="background-image: url(\'' + self.settings.image + '\')"' : '';

			return (
				'<div id="' + id + '" class="' + self.classes() + '" role="button" tabindex="-1" aria-haspopup="true">' +
					'<button role="presentation" hidefocus="1" type="button" tabindex="-1">' +
						(icon ? '<i class="' + icon + '"' + image + '></i>' : '') +
						'<span id="' + id + '-preview" class="' + prefix + 'preview"></span>' +
						(self._text ? (icon ? ' ' : '') + (self._text) : '') +
					'</button>' +
					'<button type="button" class="' + prefix + 'open" hidefocus="1" tabindex="-1">' +
						' <i class="' + prefix + 'caret"></i>' +
					'</button>' +
				'</div>'
			);
		},
		
		/**
		 * Called after the control has been rendered.
		 *
		 * @method postRender
		 */
		postRender: function() {
			var self = this, onClickHandler = self.settings.onclick;

			self.on('click', function(e) {
				if (e.aria && e.aria.key == 'down') {
					return;
				}

				if (e.control == self && !DOM.getParent(e.target, '.' + self.classPrefix + 'open')) {
					e.stopImmediatePropagation();
					onClickHandler.call(self, e);
				}
			});

			delete self.settings.onclick;

			return self._super();
		}
		
	});
});
