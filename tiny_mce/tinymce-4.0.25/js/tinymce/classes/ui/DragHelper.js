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
 * DragHelper.js
 *
 * Copyright, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * Drag/drop helper class.
 *
 * @example
 * var dragHelper = new tinymce.ui.DragHelper('mydiv', {
 *     start: function(evt) {
 *     },
 *
 *     drag: function(evt) {
 *     },
 *
 *     end: function(evt) {
 *     }
 * });
 *
 * @class tinymce.ui.DragHelper
 */
define("tinymce/ui/DragHelper", [
	"tinymce/ui/DomUtils"
], function(DomUtils) {
	"use strict";

	function getDocumentSize() {
		var doc = document, documentElement, body, scrollWidth, clientWidth;
		var offsetWidth, scrollHeight, clientHeight, offsetHeight, max = Math.max;

		documentElement = doc.documentElement;
		body = doc.body;

		scrollWidth = max(documentElement.scrollWidth, body.scrollWidth);
		clientWidth = max(documentElement.clientWidth, body.clientWidth);
		offsetWidth = max(documentElement.offsetWidth, body.offsetWidth);

		scrollHeight = max(documentElement.scrollHeight, body.scrollHeight);
		clientHeight = max(documentElement.clientHeight, body.clientHeight);
		offsetHeight = max(documentElement.offsetHeight, body.offsetHeight);

		return {
			width: scrollWidth < offsetWidth ? clientWidth : scrollWidth,
			height: scrollHeight < offsetHeight ? clientHeight : scrollHeight
		};
	}

	return function(id, settings) {
		var eventOverlayElm, doc = document, downButton, start, stop, drag, startX, startY;

		settings = settings || {};

		function getHandleElm() {
			return doc.getElementById(settings.handle || id);
		}

		start = function(e) {
			var docSize = getDocumentSize(), handleElm, cursor;

			e.preventDefault();
			downButton = e.button;
			handleElm = getHandleElm();
			startX = e.screenX;
			startY = e.screenY;

			// Grab cursor from handle
			if (window.getComputedStyle) {
				cursor = window.getComputedStyle(handleElm, null).getPropertyValue("cursor");
			} else {
				cursor = handleElm.runtimeStyle.cursor;
			}

			// Create event overlay and add it to document
			eventOverlayElm = doc.createElement('div');
			DomUtils.css(eventOverlayElm, {
				position: "absolute",
				top: 0, left: 0,
				width: docSize.width,
				height: docSize.height,
				zIndex: 0x7FFFFFFF,
				opacity: 0.0001,
				background: 'red',
				cursor: cursor
			});

			doc.body.appendChild(eventOverlayElm);

			// Bind mouse events
			DomUtils.on(doc, 'mousemove', drag);
			DomUtils.on(doc, 'mouseup', stop);

			// Begin drag
			settings.start(e);
		};

		drag = function(e) {
			if (e.button !== downButton) {
				return stop(e);
			}

			e.deltaX = e.screenX - startX;
			e.deltaY = e.screenY - startY;

			e.preventDefault();
			settings.drag(e);
		};

		stop = function(e) {
			DomUtils.off(doc, 'mousemove', drag);
			DomUtils.off(doc, 'mouseup', stop);

			eventOverlayElm.parentNode.removeChild(eventOverlayElm);

			if (settings.stop) {
				settings.stop(e);
			}
		};

		/**
		 * Destroys the drag/drop helper instance.
		 *
		 * @method destroy
		 */
		this.destroy = function() {
			DomUtils.off(getHandleElm());
		};

		DomUtils.on(getHandleElm(), 'mousedown', start);
	};
});