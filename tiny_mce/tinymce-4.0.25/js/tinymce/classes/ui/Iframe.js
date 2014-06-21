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
 * Iframe.js
 *
 * Copyright, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/*jshint scripturl:true */

/**
 * This class creates an iframe.
 *
 * @setting {String} url Url to open in the iframe.
 *
 * @-x-less Iframe.less
 * @class tinymce.ui.Iframe
 * @extends tinymce.ui.Widget
 */
define("tinymce/ui/Iframe", [
	"tinymce/ui/Widget"
], function(Widget) {
	"use strict";

	return Widget.extend({
		/**
		 * Renders the control as a HTML string.
		 *
		 * @method renderHtml
		 * @return {String} HTML representing the control.
		 */
		renderHtml: function() {
			var self = this;

			self.addClass('iframe');
			self.canFocus = false;

			/*eslint no-script-url:0 */
			return (
				'<iframe id="' + self._id + '" class="' + self.classes() + '" tabindex="-1" src="' +
				(self.settings.url || "javascript:\'\'") + '" frameborder="0"></iframe>'
			);
		},

		/**
		 * Setter for the iframe source.
		 *
		 * @method src
		 * @param {String} src Source URL for iframe.
		 */
		src: function(src) {
			this.getEl().src = src;
		},

		/**
		 * Inner HTML for the iframe.
		 *
		 * @method html
		 * @param {String} html HTML string to set as HTML inside the iframe.
		 * @param {function} callback Optional callback to execute when the iframe body is filled with contents.
		 * @return {tinymce.ui.Iframe} Current iframe control.
		 */
		html: function(html, callback) {
			var self = this, body = this.getEl().contentWindow.document.body;

			// Wait for iframe to initialize IE 10 takes time
			if (!body) {
				setTimeout(function() {
					self.html(html);
				}, 0);
			} else {
				body.innerHTML = html;

				if (callback) {
					callback();
				}
			}

			return this;
		}
	});
});