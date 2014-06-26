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
 * XHR.js
 *
 * Copyright, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * This class enables you to send XMLHTTPRequests cross browser.
 * @class tinymce.util.XHR
 * @static
 * @example
 * // Sends a low level Ajax request
 * tinymce.util.XHR.send({
 *    url: 'someurl',
 *    success: function(text) {
 *       console.debug(text);
 *    }
 * });
 */
define("tinymce/util/XHR", [], function() {
	return {
		/**
		 * Sends a XMLHTTPRequest.
		 * Consult the Wiki for details on what settings this method takes.
		 *
		 * @method send
		 * @param {Object} settings Object will target URL, callbacks and other info needed to make the request.
		 */
		send: function(settings) {
			var xhr, count = 0;

			function ready() {
				if (!settings.async || xhr.readyState == 4 || count++ > 10000) {
					if (settings.success && count < 10000 && xhr.status == 200) {
						settings.success.call(settings.success_scope, '' + xhr.responseText, xhr, settings);
					} else if (settings.error) {
						settings.error.call(settings.error_scope, count > 10000 ? 'TIMED_OUT' : 'GENERAL', xhr, settings);
					}

					xhr = null;
				} else {
					setTimeout(ready, 10);
				}
			}

			// Default settings
			settings.scope = settings.scope || this;
			settings.success_scope = settings.success_scope || settings.scope;
			settings.error_scope = settings.error_scope || settings.scope;
			settings.async = settings.async === false ? false : true;
			settings.data = settings.data || '';

			xhr = new XMLHttpRequest();

			if (xhr) {
				if (xhr.overrideMimeType) {
					xhr.overrideMimeType(settings.content_type);
				}

				xhr.open(settings.type || (settings.data ? 'POST' : 'GET'), settings.url, settings.async);

				if (settings.content_type) {
					xhr.setRequestHeader('Content-Type', settings.content_type);
				}

				xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');

				xhr.send(settings.data);

				// Syncronous request
				if (!settings.async) {
					return ready();
				}

				// Wait for response, onReadyStateChange can not be used since it leaks memory in IE
				setTimeout(ready, 10);
			}
		}
	};
});
