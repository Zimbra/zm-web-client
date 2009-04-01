/*
 * ***** BEGIN LICENSE BLOCK *****
 *
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2008 Zimbra, Inc.
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

/**
 * Singleton alert class that alerts the user by flashing
 * the favicon and document title. 
 */
ZmBrowserAlert = function() {
	ZmAlert.call(this);

	this._originalTitle = null;
	this.altTitle = null;   // Title to show when flashing.

	// Keep track of focus on the app.
	var focusListener = new AjxListener(this, this._focusListener);
	DwtShell.getShell(window).addFocusListener(focusListener);
	DwtShell.getShell(window).addBlurListener(focusListener);

	// Use key & mouse down events to handle focus.
	var globalEventListener = new AjxListener(this, this._globalEventListener);
	DwtEventManager.addListener(DwtEvent.ONMOUSEDOWN, globalEventListener);
	DwtEventManager.addListener(DwtEvent.ONKEYDOWN, globalEventListener);
};

ZmBrowserAlert.prototype = new ZmAlert;
ZmBrowserAlert.prototype.constructor = ZmBrowserAlert;

ZmBrowserAlert.prototype.toString =
function() {
	return "ZmBrowserAlert";
};

ZmBrowserAlert.getInstance =
function() {
	return ZmBrowserAlert.INSTANCE = ZmBrowserAlert.INSTANCE || new ZmBrowserAlert();
};

ZmBrowserAlert.prototype.start =
function(altTitle) {
	if (this._isLooping) {
		return;
	}
	this.altTitle = altTitle || ZmMsg.newMessage;
	if (!this._clientHasFocus) {
		if (!this._favIcon) {
			this._favIcon = appContextPath + "/img/logo/favicon.ico";
			this._blankIcon = appContextPath + "/img/logo/blank.ico";
		}
		this._startLoop();
	}
};

ZmBrowserAlert.prototype.stop =
function() {
	this._stopLoop();
};

ZmBrowserAlert.prototype._update =
function(status) {
	// Update the favicon.
	Dwt.setFavIcon(status ? this._blankIcon : this._favIcon);

	// Update the title.
	var doc = document;
	if (status) {
		this._origTitle = doc.title;
		doc.title = this.altTitle;
	} else {
		if (doc.title == this.altTitle) {
			doc.title = this._origTitle;
		}
		// else if someone else changed the title, just leave it.
	}
};

ZmBrowserAlert.prototype._focusListener =
function(ev) {
	this._clientHasFocus = ev.state == DwtFocusEvent.FOCUS;
	if (this._clientHasFocus) {
		this.stop();
	}
};

ZmBrowserAlert.prototype._globalEventListener =
function() {
	this._clientHasFocus = true;
	this.stop();
};
