/*
 * ***** BEGIN LICENSE BLOCK *****
 * 
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2004, 2005, 2006, 2007 Zimbra, Inc.
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

ZmTradView = function(params) {

	params.className = params.className || "ZmTradView";
	params.mode = ZmController.TRAD_VIEW;
	params.msgViewId = ZmId.TV_MSG;
	ZmDoublePaneView.call(this, params);
}

ZmTradView.prototype = new ZmDoublePaneView;
ZmTradView.prototype.constructor = ZmTradView;

ZmTradView.prototype.toString = 
function() {
	return "ZmTradView";
};

ZmTradView.prototype._createMailListView =
function(params) {
	params.id = ZmId.TV_LIST;
	return ZmDoublePaneView.prototype._createMailListView.apply(this, arguments);
};
