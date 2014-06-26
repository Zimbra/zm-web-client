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
 * Layout.js
 *
 * Copyright, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * Base layout manager class.
 *
 * @class tinymce.ui.Layout
 */
define("tinymce/ui/Layout", [
	"tinymce/util/Class",
	"tinymce/util/Tools"
], function(Class, Tools) {
	"use strict";

	return Class.extend({
		Defaults: {
			firstControlClass: 'first',
			lastControlClass: 'last'
		},

		/**
		 * Constructs a layout instance with the specified settings.
		 *
		 * @constructor
		 * @param {Object} settings Name/value object with settings.
		 */
		init: function(settings) {
			this.settings = Tools.extend({}, this.Defaults, settings);
		},

		/**
		 * This method gets invoked before the layout renders the controls.
		 *
		 * @method preRender
		 * @param {tinymce.ui.Container} container Container instance to preRender.
		 */
		preRender: function(container) {
			container.addClass(this.settings.containerClass, 'body');
		},

		/**
		 * Applies layout classes to the container.
		 *
		 * @private
		 */
		applyClasses: function(container) {
			var self = this, settings = self.settings, items, firstClass, lastClass;

			items = container.items().filter(':visible');
			firstClass = settings.firstControlClass;
			lastClass = settings.lastControlClass;

			items.each(function(item) {
				item.removeClass(firstClass).removeClass(lastClass);

				if (settings.controlClass) {
					item.addClass(settings.controlClass);
				}
			});

			items.eq(0).addClass(firstClass);
			items.eq(-1).addClass(lastClass);
		},

		/**
		 * Renders the specified container and any layout specific HTML.
		 *
		 * @method renderHtml
		 * @param {tinymce.ui.Container} container Container to render HTML for.
		 */
		renderHtml: function(container) {
			var self = this, settings = self.settings, items, html = '';

			items = container.items();
			items.eq(0).addClass(settings.firstControlClass);
			items.eq(-1).addClass(settings.lastControlClass);

			items.each(function(item) {
				if (settings.controlClass) {
					item.addClass(settings.controlClass);
				}

				html += item.renderHtml();
			});

			return html;
		},

		/**
		 * Recalculates the positions of the controls in the specified container.
		 *
		 * @method recalc
		 * @param {tinymce.ui.Container} container Container instance to recalc.
		 */
		recalc: function() {
		},

		/**
		 * This method gets invoked after the layout renders the controls.
		 *
		 * @method postRender
		 * @param {tinymce.ui.Container} container Container instance to postRender.
		 */
		postRender: function() {
		}
	});
});