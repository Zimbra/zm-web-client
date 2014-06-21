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
 * Label.js
 *
 * Copyright, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * This class creates a label element. A label is a simple text control
 * that can be bound to other controls.
 *
 * @-x-less Label.less
 * @class tinymce.ui.Label
 * @extends tinymce.ui.Widget
 */
define("tinymce/ui/Label", [
	"tinymce/ui/Widget",
	"tinymce/ui/DomUtils"
], function(Widget, DomUtils) {
	"use strict";

	return Widget.extend({
		/**
		 * Constructs a instance with the specified settings.
		 *
		 * @constructor
		 * @param {Object} settings Name/value object with settings.
		 * @param {Boolean} multiline Multiline label.
		 */
		init: function(settings) {
			var self = this;

			self._super(settings);
			self.addClass('widget');
			self.addClass('label');
			self.canFocus = false;

			if (settings.multiline) {
				self.addClass('autoscroll');
			}

			if (settings.strong) {
				self.addClass('strong');
			}
		},

		/**
		 * Initializes the current controls layout rect.
		 * This will be executed by the layout managers to determine the
		 * default minWidth/minHeight etc.
		 *
		 * @method initLayoutRect
		 * @return {Object} Layout rect instance.
		 */
		initLayoutRect: function() {
			var self = this, layoutRect = self._super();

			if (self.settings.multiline) {
				var size = DomUtils.getSize(self.getEl());

				// Check if the text fits within maxW if not then try word wrapping it
				if (size.width > layoutRect.maxW) {
					layoutRect.minW = layoutRect.maxW;
					self.addClass('multiline');
				}

				self.getEl().style.width = layoutRect.minW + 'px';
				layoutRect.startMinH = layoutRect.h = layoutRect.minH = Math.min(layoutRect.maxH, DomUtils.getSize(self.getEl()).height);
			}

			return layoutRect;
		},

		/**
		 * Repaints the control after a layout operation.
		 *
		 * @method repaint
		 */
		repaint: function() {
			var self = this;

			if (!self.settings.multiline) {
				self.getEl().style.lineHeight = self.layoutRect().h + 'px';
			}

			return self._super();
		},

		/**
		 * Sets/gets the current label text.
		 *
		 * @method text
		 * @param {String} [text] New label text.
		 * @return {String|tinymce.ui.Label} Current text or current label instance.
		 */
		text: function(text) {
			var self = this;

			if (self._rendered && text) {
				this.innerHtml(self.encode(text));
			}

			return self._super(text);
		},

		/**
		 * Renders the control as a HTML string.
		 *
		 * @method renderHtml
		 * @return {String} HTML representing the control.
		 */
		renderHtml: function() {
			var self = this, forId = self.settings.forId;

			return (
				'<label id="' + self._id + '" class="' + self.classes() + '"' + (forId ? ' for="' + forId + '"' : '') + '>' +
					self.encode(self._text) +
				'</label>'
			);
		}
	});
});
