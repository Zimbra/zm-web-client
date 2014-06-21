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
 * Movable.js
 *
 * Copyright, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * Movable mixin. Makes controls movable absolute and relative to other elements.
 *
 * @mixin tinymce.ui.Movable
 */
define("tinymce/ui/Movable", [
	"tinymce/ui/DomUtils"
], function(DomUtils) {
	"use strict";

	function calculateRelativePosition(ctrl, targetElm, rel) {
		var ctrlElm, pos, x, y, selfW, selfH, targetW, targetH, viewport, size;

		viewport = DomUtils.getViewPort();

		// Get pos of target
		pos = DomUtils.getPos(targetElm);
		x = pos.x;
		y = pos.y;

		if (ctrl._fixed) {
			x -= viewport.x;
			y -= viewport.y;
		}

		// Get size of self
		ctrlElm = ctrl.getEl();
		size = DomUtils.getSize(ctrlElm);
		selfW = size.width;
		selfH = size.height;

		// Get size of target
		size = DomUtils.getSize(targetElm);
		targetW = size.width;
		targetH = size.height;

		// Parse align string
		rel = (rel || '').split('');

		// Target corners
		if (rel[0] === 'b') {
			y += targetH;
		}

		if (rel[1] === 'r') {
			x += targetW;
		}

		if (rel[0] === 'c') {
			y += Math.round(targetH / 2);
		}

		if (rel[1] === 'c') {
			x += Math.round(targetW / 2);
		}

		// Self corners
		if (rel[3] === 'b') {
			y -= selfH;
		}

		if (rel[4] === 'r') {
			x -= selfW;
		}

		if (rel[3] === 'c') {
			y -= Math.round(selfH / 2);
		}

		if (rel[4] === 'c') {
			x -= Math.round(selfW / 2);
		}

		return {
			x: x,
			y: y,
			w: selfW,
			h: selfH
		};
	}

	return {
		/**
		 * Tests various positions to get the most suitable one.
		 *
		 * @method testMoveRel
		 * @param {DOMElement} elm Element to position against.
		 * @param {Array} rels Array with relative positions.
		 * @return {String} Best suitable relative position.
		 */
		testMoveRel: function(elm, rels) {
			var viewPortRect = DomUtils.getViewPort();

			for (var i = 0; i < rels.length; i++) {
				var pos = calculateRelativePosition(this, elm, rels[i]);

				if (this._fixed) {
					if (pos.x > 0 && pos.x + pos.w < viewPortRect.w && pos.y > 0 && pos.y + pos.h < viewPortRect.h) {
						return rels[i];
					}
				} else {
					if (pos.x > viewPortRect.x && pos.x + pos.w < viewPortRect.w + viewPortRect.x &&
						pos.y > viewPortRect.y && pos.y + pos.h < viewPortRect.h + viewPortRect.y) {
						return rels[i];
					}
				}
			}

			return rels[0];
		},

		/**
		 * Move relative to the specified element.
		 *
		 * @method moveRel
		 * @param {Element} elm Element to move relative to.
		 * @param {String} rel Relative mode. For example: br-tl.
		 * @return {tinymce.ui.Control} Current control instance.
		 */
		moveRel: function(elm, rel) {
			if (typeof(rel) != 'string') {
				rel = this.testMoveRel(elm, rel);
			}

			var pos = calculateRelativePosition(this, elm, rel);
			return this.moveTo(pos.x, pos.y);
		},

		/**
		 * Move by a relative x, y values.
		 *
		 * @method moveBy
		 * @param {Number} dx Relative x position.
		 * @param {Number} dy Relative y position.
		 * @return {tinymce.ui.Control} Current control instance.
		 */
		moveBy: function(dx, dy) {
			var self = this, rect = self.layoutRect();

			self.moveTo(rect.x + dx, rect.y + dy);

			return self;
		},

		/**
		 * Move to absolute position.
		 *
		 * @method moveTo
		 * @param {Number} x Absolute x position.
		 * @param {Number} y Absolute y position.
		 * @return {tinymce.ui.Control} Current control instance.
		 */
		moveTo: function(x, y) {
			var self = this;

			// TODO: Move this to some global class
			function contrain(value, max, size) {
				if (value < 0) {
					return 0;
				}

				if (value + size > max) {
					value = max - size;
					return value < 0 ? 0 : value;
				}

				return value;
			}

			if (self.settings.constrainToViewport) {
				var viewPortRect = DomUtils.getViewPort(window);
				var layoutRect = self.layoutRect();

				x = contrain(x, viewPortRect.w + viewPortRect.x, layoutRect.w);
				y = contrain(y, viewPortRect.h + viewPortRect.y, layoutRect.h);
			}

			if (self._rendered) {
				self.layoutRect({x: x, y: y}).repaint();
			} else {
				self.settings.x = x;
				self.settings.y = y;
			}

			self.fire('move', {x: x, y: y});

			return self;
		}
	};
});