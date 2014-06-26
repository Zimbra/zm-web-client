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
 * Resizable.js
 *
 * Copyright, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * Resizable mixin. Enables controls to be resized.
 *
 * @mixin tinymce.ui.Resizable
 */
define("tinymce/ui/Resizable", [
	"tinymce/ui/DomUtils"
], function(DomUtils) {
	"use strict";

	return {
		/** 
		 * Resizes the control to contents.
		 *
		 * @method resizeToContent
		 */
		resizeToContent: function() {
			this._layoutRect.autoResize = true;
			this._lastRect = null;
			this.reflow();
		},

		/** 
		 * Resizes the control to a specific width/height.
		 *
		 * @method resizeTo
		 * @param {Number} w Control width.
		 * @param {Number} h Control height.
		 * @return {tinymce.ui.Control} Current control instance.
		 */
		resizeTo: function(w, h) {
			// TODO: Fix hack
			if (w <= 1 || h <= 1) {
				var rect = DomUtils.getWindowSize();

				w = w <= 1 ? w * rect.w : w;
				h = h <= 1 ? h * rect.h : h;
			}

			this._layoutRect.autoResize = false;
			return this.layoutRect({minW: w, minH: h, w: w, h: h}).reflow();
		},

		/** 
		 * Resizes the control to a specific relative width/height.
		 *
		 * @method resizeBy
		 * @param {Number} dw Relative control width.
		 * @param {Number} dh Relative control height.
		 * @return {tinymce.ui.Control} Current control instance.
		 */
		resizeBy: function(dw, dh) {
			var self = this, rect = self.layoutRect();

			return self.resizeTo(rect.w + dw, rect.h + dh);
		}
	};
});