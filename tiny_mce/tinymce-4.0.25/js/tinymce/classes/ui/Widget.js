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
 * Widget.js
 *
 * Copyright, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * Widget base class a widget is a control that has a tooltip and some basic states.
 *
 * @class tinymce.ui.Widget
 * @extends tinymce.ui.Control
 */
define("tinymce/ui/Widget", [
	"tinymce/ui/Control",
	"tinymce/ui/Tooltip"
], function(Control, Tooltip) {
	"use strict";

	var tooltip;

	var Widget = Control.extend({
		/**
		 * Constructs a instance with the specified settings.
		 *
		 * @constructor
		 * @param {Object} settings Name/value object with settings.
		 * @setting {String} tooltip Tooltip text to display when hovering.
		 * @setting {Boolean} autofocus True if the control should be focused when rendered.
		 * @setting {String} text Text to display inside widget.
		 */
		init: function(settings) {
			var self = this;

			self._super(settings);
			settings = self.settings;
			self.canFocus = true;

			if (settings.tooltip && Widget.tooltips !== false) {
				self.on('mouseenter', function(e) {
					var tooltip = self.tooltip().moveTo(-0xFFFF);

					if (e.control == self) {
						var rel = tooltip.text(settings.tooltip).show().testMoveRel(self.getEl(), ['bc-tc', 'bc-tl', 'bc-tr']);

						tooltip.toggleClass('tooltip-n', rel == 'bc-tc');
						tooltip.toggleClass('tooltip-nw', rel == 'bc-tl');
						tooltip.toggleClass('tooltip-ne', rel == 'bc-tr');

						tooltip.moveRel(self.getEl(), rel);
					} else {
						tooltip.hide();
					}
				});

				self.on('mouseleave mousedown click', function() {
					self.tooltip().hide();
				});
			}

			self.aria('label', settings.ariaLabel || settings.tooltip);
		},

		/**
		 * Returns the current tooltip instance.
		 *
		 * @method tooltip
		 * @return {tinymce.ui.Tooltip} Tooltip instance.
		 */
		tooltip: function() {
			if (!tooltip) {
				tooltip = new Tooltip({type: 'tooltip'});
				tooltip.renderTo();
			}

			return tooltip;
		},

		/**
		 * Sets/gets the active state of the widget.
		 *
		 * @method active
		 * @param {Boolean} [state] State if the control is active.
		 * @return {Boolean|tinymce.ui.Widget} True/false or current widget instance.
		 */
		active: function(state) {
			var self = this, undef;

			if (state !== undef) {
				self.aria('pressed', state);
				self.toggleClass('active', state);
			}

			return self._super(state);
		},

		/**
		 * Sets/gets the disabled state of the widget.
		 *
		 * @method disabled
		 * @param {Boolean} [state] State if the control is disabled.
		 * @return {Boolean|tinymce.ui.Widget} True/false or current widget instance.
		 */
		disabled: function(state) {
			var self = this, undef;

			if (state !== undef) {
				self.aria('disabled', state);
				self.toggleClass('disabled', state);
			}

			return self._super(state);
		},

		/**
		 * Called after the control has been rendered.
		 *
		 * @method postRender
		 */
		postRender: function() {
			var self = this, settings = self.settings;

			self._rendered = true;

			self._super();

			if (!self.parent() && (settings.width || settings.height)) {
				self.initLayoutRect();
				self.repaint();
			}

			if (settings.autofocus) {
				self.focus();
			}
		},

		/**
		 * Removes the current control from DOM and from UI collections.
		 *
		 * @method remove
		 * @return {tinymce.ui.Control} Current control instance.
		 */
		remove: function() {
			this._super();

			if (tooltip) {
				tooltip.remove();
				tooltip = null;
			}
		}
	});

	return Widget;
});