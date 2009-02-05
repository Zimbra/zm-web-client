/*
 * ***** BEGIN LICENSE BLOCK *****
 *
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2009 Zimbra, Inc.
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

ZmTaskbarPopup = function(params) {
	if (arguments.length == 0) return;

	DwtComposite.call(this, params);
	this.tabGroup = new DwtTabGroup();
	this.taskbar = params.taskbar;
	this.taskbarItem = params.taskbarItem;
};

ZmTaskbarPopup.prototype = new DwtComposite;
ZmTaskbarPopup.prototype.constructor = ZmTaskbarPopup;

ZmTaskbarPopup.prototype.toString =
function() {
	return "ZmTaskbarPopup";
};

ZmTaskbarPopup.prototype.popup =
function() {
};

ZmTaskbarPopup.prototype.popdown =
function() {
};

ZmTaskbarPopup.prototype._doPopdown =
function() {
	this.taskbar.expandItem(this.parent, false);
};

ZmTaskbarPopup.prototype._showError = function(msg, loc) {
	var msgDialog = appCtxt.getMsgDialog();
	msgDialog.reset();
	loc = loc ? loc : new DwtPoint(this.getLocation().x + 50, this.getLocation().y + 100);
	msgDialog.setMessage(msg, DwtMessageDialog.CRITICAL_STYLE);
	msgDialog.popup(loc);
	return null;
};


/*---- Temp class to help introduce the popup -----------*/

ZmTaskbarPopup1 = function(params) {
	ZmTaskbarPopup.call(this, params);
	params.callback.run(this, this.getHtmlElement());
};

ZmTaskbarPopup1.prototype = new ZmTaskbarPopup;
ZmTaskbarPopup1.prototype.constructor = ZmTaskbarPopup1;

ZmTaskbarPopup1.prototype.toString =
function() {
	return "ZmTaskbarPopup1";
};
