/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2009, 2010 Zimbra, Inc.
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

ZmTaskbarPopup = function(params) {
	if (arguments.length == 0) return;

	DwtComposite.call(this, params);
	this.taskbar = params.taskbar;
	this.taskbarItem = params.taskbarItem;
};

ZmTaskbarPopup.prototype = new DwtComposite;
ZmTaskbarPopup.prototype.constructor = ZmTaskbarPopup;

ZmTaskbarPopup.prototype.toString =
function() {
	return "ZmTaskbarPopup";
};

ZmTaskbarPopup.prototype.dispose =
function() {
	this._popKeyHandlers();
	DwtComposite.prototype.dispose.call(this);
};

ZmTaskbarPopup.prototype.setTitle =
function(title) {
	var titleEl = Dwt.byId(this._htmlElId + "_title");
	if (titleEl) {
		titleEl.innerHTML = title;
	}
};

ZmTaskbarPopup.prototype.popup =
function(background) {
	if (!background) {
		this._pushKeyHandlers();
	}
};

ZmTaskbarPopup.prototype.popdown =
function() {
	this._popKeyHandlers();
};

ZmTaskbarPopup.prototype.getTabGroupMember =
function() {
	return this._tabGroup;
};

ZmTaskbarPopup.prototype.handleKeyEvent =
function(ev) {
	switch (ev.charCode) {
		case 27: { // ESC
			this._doPopdown();
			return true;
		}
		case 13: { // ENTER
			this._onEnter();
			return true;
		}
		default: {
			return false;
		}
	}
};

/** Creates a basic html for the popup with a title and conent area. Returns the content element. */
ZmTaskbarPopup.prototype._createPopupHtml =
function(title) {
	var templateArgs = {
		id: this._htmlElId,
		title: title
	};
	this._createHtmlFromTemplate("im.Chat#ZmTaskbarPopup", templateArgs);
	return Dwt.byId(this._htmlElId + "_content");
};

ZmTaskbarPopup.prototype._pushKeyHandlers =
function() {
	if (!this._handlingKeyboard) {
		var kbMgr = this.shell.getKeyboardMgr();
		kbMgr.pushDefaultHandler(this);
		if (this._tabGroup) {
			kbMgr.pushTabGroup(this._tabGroup);
		}
		this._handlingKeyboard = true;
	}
};

ZmTaskbarPopup.prototype._popKeyHandlers =
function() {
	if (this._handlingKeyboard) {
		var kbMgr = this.shell.getKeyboardMgr();
		kbMgr.popDefaultHandler();
		if (this._tabGroup) {
			kbMgr.popTabGroup(this._tabGroup);
		}
		this._handlingKeyboard = false;
	}
};

ZmTaskbarPopup.prototype._createTabGroupMember =
function() {
	return this._tabGroup = new DwtTabGroup(this.toString());
};

ZmTaskbarPopup.prototype._setFocusMember =
function(member) {
	this._tabGroup.setFocusMember(member);
};

ZmTaskbarPopup.prototype._doPopdown =
function() {
	this.taskbar.expandItem(this.parent, false);
};

ZmTaskbarPopup.prototype._doDispose =
function() {
	this._doPopdown();
	this.parent.dispose();
};

ZmTaskbarPopup.prototype._onEnter =
function() {
};

ZmTaskbarPopup.prototype._showError =
function(msg, loc) {
	var msgDialog = appCtxt.getMsgDialog();
	msgDialog.reset();
	loc = loc ? loc : new DwtPoint(this.getLocation().x + 50, this.getLocation().y + 100);
	msgDialog.setMessage(msg, DwtMessageDialog.CRITICAL_STYLE);
	msgDialog.popup(loc);
	return null;
};
