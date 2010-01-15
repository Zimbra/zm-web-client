/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2008, 2009, 2010 Zimbra, Inc.
 * 
 * The contents of this file are subject to the Zimbra Public License
 * Version 1.3 ("License"); you may not use this file except in
 * compliance with the License.  You may obtain a copy of the License at
 * http://www.zimbra.com/license.
 * 
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * ***** END LICENSE BLOCK *****
 */

ZmSlide = 	function(el) {
	this._content = "";
	this._index = 0;
	this._element = el;
};

ZmSlide.prototype.constructor = ZmSlide;

ZmSlide.prototype.setContent = function(content) {
	this._content = content;
}

ZmSlide.prototype.getContent = function() {
	return this._content;
}

ZmSlide.prototype.setIndex = function(index) {
	this._index = index;
}

ZmSlide.prototype.getIndex = function() {
	return this._index;
}

ZmSlide.prototype.getHtmlElement = function() {
	return this._element;
}
