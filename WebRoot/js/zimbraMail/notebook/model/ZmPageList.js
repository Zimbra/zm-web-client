/*
 * ***** BEGIN LICENSE BLOCK *****
 * 
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2006, 2007 Zimbra, Inc.
 * 
 * The contents of this file are subject to the Yahoo! Public License
 * Version 1.0 ("License"); you may not use this file except in
 * compliance with the License.  You may obtain a copy of the License at
 * http://www.zimbra.com/license.
 * 
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * 
 * ***** END LICENSE BLOCK *****
 */

ZmPageList = function(search, type) {
	ZmList.call(this, type || ZmItem.PAGE, search);
}

ZmPageList.prototype = new ZmList;
ZmPageList.prototype.constructor = ZmPageList;

ZmPageList.prototype.toString = function() {
	return "ZmPageList";
};

// Public methods

/***
ZmPageList.prototype.addFromDom =
function(node, args) {
	this.type = node._type || this.type;
	return ZmList.prototype.addFromDom.call(this, node, args);
};
/***/
