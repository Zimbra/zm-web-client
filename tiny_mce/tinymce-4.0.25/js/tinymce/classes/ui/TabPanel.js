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
 * TabPanel.js
 *
 * Copyright, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * Creates a tab panel control.
 *
 * @-x-less TabPanel.less
 * @class tinymce.ui.TabPanel
 * @extends tinymce.ui.Panel
 *
 * @setting {Number} activeTab Active tab index.
 */
define("tinymce/ui/TabPanel", [
	"tinymce/ui/Panel",
	"tinymce/ui/DomUtils"
], function(Panel, DomUtils) {
	"use strict";

	return Panel.extend({
		lastIdx: 0,

		Defaults: {
			layout: 'absolute',
			defaults: {
				type: 'panel'
			}
		},

		/**
		 * Activates the specified tab by index.
		 *
		 * @method activateTab
		 * @param {Number} idx Index of the tab to activate.
		 */
		activateTab: function(idx) {
			var activeTabElm;

			if (this.activeTabId) {
				activeTabElm = this.getEl(this.activeTabId);
				DomUtils.removeClass(activeTabElm, this.classPrefix + 'active');
				activeTabElm.setAttribute('aria-selected', "false");
			}

			this.activeTabId = 't' + idx;

			activeTabElm = this.getEl('t' + idx);
			activeTabElm.setAttribute('aria-selected', "true");
			DomUtils.addClass(activeTabElm, this.classPrefix + 'active');

			if (idx != this.lastIdx) {
				this.items()[this.lastIdx].hide();
				this.lastIdx = idx;
			}

			this.items()[idx].show().fire('showtab');
			this.reflow();
		},

		/**
		 * Renders the control as a HTML string.
		 *
		 * @method renderHtml
		 * @return {String} HTML representing the control.
		 */
		renderHtml: function() {
			var self = this, layout = self._layout, tabsHtml = '', prefix = self.classPrefix;

			self.preRender();
			layout.preRender(self);

			self.items().each(function(ctrl, i) {
				var id = self._id + '-t' + i;

				ctrl.aria('role', 'tabpanel');
				ctrl.aria('labelledby', id);

				tabsHtml += (
					'<div id="' + id + '" class="' + prefix + 'tab" ' +
						'unselectable="on" role="tab" aria-controls="' + ctrl._id + '" aria-selected="false" tabIndex="-1">' +
						self.encode(ctrl.settings.title) +
					'</div>'
				);
			});

			return (
				'<div id="' + self._id + '" class="' + self.classes() + '" hidefocus="1" tabindex="-1">' +
					'<div id="' + self._id + '-head" class="' + prefix + 'tabs" role="tablist">' +
						tabsHtml +
					'</div>' +
					'<div id="' + self._id + '-body" class="' + self.classes('body') + '">' +
						layout.renderHtml(self) +
					'</div>' +
				'</div>'
			);
		},

		/**
		 * Called after the control has been rendered.
		 *
		 * @method postRender
		 */
		postRender: function() {
			var self = this;

			self._super();

			self.settings.activeTab = self.settings.activeTab || 0;
			self.activateTab(self.settings.activeTab);

			this.on('click', function(e) {
				var targetParent = e.target.parentNode;

				if (e.target.parentNode.id == self._id + '-head') {
					var i = targetParent.childNodes.length;

					while (i--) {
						if (targetParent.childNodes[i] == e.target) {
							self.activateTab(i);
						}
					}
				}
			});
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
			var self = this, rect, minW, minH;

			minW = DomUtils.getSize(self.getEl('head')).width;
			minW = minW < 0 ? 0 : minW;
			minH = 0;
			self.items().each(function(item, i) {
				minW = Math.max(minW, item.layoutRect().minW);
				minH = Math.max(minH, item.layoutRect().minH);
				if (self.settings.activeTab != i) {
					item.hide();
				}
			});

			self.items().each(function(ctrl) {
				ctrl.settings.x = 0;
				ctrl.settings.y = 0;
				ctrl.settings.w = minW;
				ctrl.settings.h = minH;

				ctrl.layoutRect({
					x: 0,
					y: 0,
					w: minW,
					h: minH
				});
			});

			var headH = DomUtils.getSize(self.getEl('head')).height;

			self.settings.minWidth = minW;
			self.settings.minHeight = minH + headH;

			rect = self._super();
			rect.deltaH += headH;
			rect.innerH = rect.h - rect.deltaH;

			return rect;
		}
	});
});
