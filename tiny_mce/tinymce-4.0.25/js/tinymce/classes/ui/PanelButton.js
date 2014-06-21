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
 * PanelButton.js
 *
 * Copyright, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * Creates a new panel button.
 *
 * @class tinymce.ui.PanelButton
 * @extends tinymce.ui.Button
 */
define("tinymce/ui/PanelButton", [
	"tinymce/ui/Button",
	"tinymce/ui/FloatPanel"
], function(Button, FloatPanel) {
	"use strict";

	return Button.extend({
		/**
		 * Shows the panel for the button.
		 *
		 * @method showPanel
		 */
		showPanel: function() {
			var self = this, settings = self.settings;

			self.active(true);

			if (!self.panel) {
				var panelSettings = settings.panel;

				// Wrap panel in grid layout if type if specified
				// This makes it possible to add forms or other containers directly in the panel option
				if (panelSettings.type) {
					panelSettings = {
						layout: 'grid',
						items: panelSettings
					};
				}

				panelSettings.role = panelSettings.role || 'dialog';
				panelSettings.popover = true;
				panelSettings.autohide = true;
				panelSettings.ariaRoot = true;

				self.panel = new FloatPanel(panelSettings).on('hide', function() {
					self.active(false);
				}).on('cancel', function(e) {
					e.stopPropagation();
					self.focus();
					self.hidePanel();
				}).parent(self).renderTo(self.getContainerElm());

				self.panel.fire('show');
				self.panel.reflow();
			} else {
				self.panel.show();
			}

			self.panel.moveRel(self.getEl(), settings.popoverAlign || (self.isRtl() ? ['bc-tr', 'bc-tc'] : ['bc-tl', 'bc-tc']));
		},

		/**
		 * Hides the panel for the button.
		 *
		 * @method hidePanel
		 */
		hidePanel: function() {
			var self = this;

			if (self.panel) {
				self.panel.hide();
			}
		},

		/**
		 * Called after the control has been rendered.
		 *
		 * @method postRender
		 */
		postRender: function() {
			var self = this;

			self.aria('haspopup', true);

			self.on('click', function(e) {
				if (e.control === self) {
					if (self.panel && self.panel.visible()) {
						self.hidePanel();
					} else {
						self.showPanel();
						self.panel.focus(!!e.aria);
					}
				}
			});

			return self._super();
		}
	});
});