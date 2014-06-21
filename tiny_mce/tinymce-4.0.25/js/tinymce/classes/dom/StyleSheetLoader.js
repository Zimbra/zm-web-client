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
 * StyleSheetLoader.js
 *
 * Copyright, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * This class handles loading of external stylesheets and fires events when these are loaded.
 *
 * @class tinymce.dom.StyleSheetLoader
 * @private
 */
define("tinymce/dom/StyleSheetLoader", [], function() {
	"use strict";

	return function(document, settings) {
		var idCount = 0, loadedStates = {}, maxLoadTime;

		settings = settings || {};
		maxLoadTime = settings.maxLoadTime || 5000;

		function appendToHead(node) {
			document.getElementsByTagName('head')[0].appendChild(node);
		}

		/**
		 * Loads the specified css style sheet file and call the loadedCallback once it's finished loading.
		 *
		 * @method load
		 * @param {String} url Url to be loaded.
		 * @param {Function} loadedCallback Callback to be executed when loaded.
		 * @param {Function} errorCallback Callback to be executed when failed loading.
		 */
		function load(url, loadedCallback, errorCallback) {
			var link, style, startTime, state;

			function passed() {
				var callbacks = state.passed, i = callbacks.length;

				while (i--) {
					callbacks[i]();
				}

				state.status = 2;
				state.passed = [];
				state.failed = [];
			}

			function failed() {
				var callbacks = state.failed, i = callbacks.length;

				while (i--) {
					callbacks[i]();
				}

				state.status = 3;
				state.passed = [];
				state.failed = [];
			}

			// Sniffs for older WebKit versions that have the link.onload but a broken one
			function isOldWebKit() {
				var webKitChunks = navigator.userAgent.match(/WebKit\/(\d*)/);
				return !!(webKitChunks && webKitChunks[1] < 536);
			}

			// Calls the waitCallback until the test returns true or the timeout occurs
			function wait(testCallback, waitCallback) {
				if (!testCallback()) {
					// Wait for timeout
					if ((new Date().getTime()) - startTime < maxLoadTime) {
						window.setTimeout(waitCallback, 0);
					} else {
						failed();
					}
				}
			}

			// Workaround for WebKit that doesn't properly support the onload event for link elements
			// Or WebKit that fires the onload event before the StyleSheet is added to the document
			function waitForWebKitLinkLoaded() {
				wait(function() {
					var styleSheets = document.styleSheets, styleSheet, i = styleSheets.length, owner;

					while (i--) {
						styleSheet = styleSheets[i];
						owner = styleSheet.ownerNode ? styleSheet.ownerNode : styleSheet.owningElement;
						if (owner && owner.id === link.id) {
							passed();
							return true;
						}
					}
				}, waitForWebKitLinkLoaded);
			}

			// Workaround for older Geckos that doesn't have any onload event for StyleSheets
			function waitForGeckoLinkLoaded() {
				wait(function() {
					try {
						// Accessing the cssRules will throw an exception until the CSS file is loaded
						var cssRules = style.sheet.cssRules;
						passed();
						return !!cssRules;
					} catch (ex) {
						// Ignore
					}
				}, waitForGeckoLinkLoaded);
			}

			if (!loadedStates[url]) {
				state = {
					passed: [],
					failed: []
				};

				loadedStates[url] = state;
			} else {
				state = loadedStates[url];
			}

			if (loadedCallback) {
				state.passed.push(loadedCallback);
			}

			if (errorCallback) {
				state.failed.push(errorCallback);
			}

			// Is loading wait for it to pass
			if (state.status == 1) {
				return;
			}

			// Has finished loading and was success
			if (state.status == 2) {
				passed();
				return;
			}

			// Has finished loading and was a failure
			if (state.status == 3) {
				failed();
				return;
			}

			// Start loading
			state.status = 1;
			link = document.createElement('link');
			link.rel = 'stylesheet';
			link.type = 'text/css';
			link.id = 'u' + (idCount++);
			link.async = false;
			link.defer = false;
			startTime = new Date().getTime();

			// Feature detect onload on link element and sniff older webkits since it has an broken onload event
			if ("onload" in link && !isOldWebKit()) {
				link.onload = waitForWebKitLinkLoaded;
				link.onerror = failed;
			} else {
				// Sniff for old Firefox that doesn't support the onload event on link elements
				// TODO: Remove this in the future when everyone uses modern browsers
				if (navigator.userAgent.indexOf("Firefox") > 0) {
					style = document.createElement('style');
					style.textContent = '@import "' + url + '"';
					waitForGeckoLinkLoaded();
					appendToHead(style);
					return;
				} else {
					// Use the id owner on older webkits
					waitForWebKitLinkLoaded();
				}
			}

			appendToHead(link);
			link.href = url;
		}

		this.load = load;
	};
});