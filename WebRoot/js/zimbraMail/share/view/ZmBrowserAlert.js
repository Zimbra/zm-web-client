/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2008, 2009, 2010, 2011, 2013, 2014, 2016 Synacor, Inc.
 *
 * The contents of this file are subject to the Common Public Attribution License Version 1.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at: https://www.zimbra.com/license
 * The License is based on the Mozilla Public License Version 1.1 but Sections 14 and 15
 * have been added to cover use of software over a computer network and provide for limited attribution
 * for the Original Developer. In addition, Exhibit A has been modified to be consistent with Exhibit B.
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * See the License for the specific language governing rights and limitations under the License.
 * The Original Code is Zimbra Open Source Web Client.
 * The Initial Developer of the Original Code is Zimbra, Inc.  All rights to the Original Code were
 * transferred by Zimbra, Inc. to Synacor, Inc. on September 14, 2015.
 *
 * All portions of the code are Copyright (C) 2008, 2009, 2010, 2011, 2013, 2014, 2016 Synacor, Inc. All Rights Reserved.
 * ***** END LICENSE BLOCK *****
 */

/**
 * Creates the browser alert.
 * @class
 * Singleton alert class that alerts the user by flashing the favicon and document title.
 * 
 * @extends		ZmAlert
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

/**
 * Gets an instance of the browser alert.
 * 
 * @return	{ZmBrowserAlert}	the browser alert
 */
ZmBrowserAlert.getInstance =
function() {
	return ZmBrowserAlert.INSTANCE = ZmBrowserAlert.INSTANCE || new ZmBrowserAlert();
};

/**
 * Starts the alert.
 * 
 * @param	{String}	altTitle		the alternate title
 */
ZmBrowserAlert.prototype.start =
function(altTitle) {
	if (this._isLooping) {
		return;
	}
	this.altTitle = altTitle || ZmMsg.newMessage;
	if (!this._clientHasFocus) {
		if (!this._favIcon) {
			this._favIcon = window.appContextPath + "/img/logo/favicon.ico";
			this._blankIcon = window.appContextPath + "/img/logo/blank.ico";
		}
		this._startLoop();
	}
};

/**
 * Stops the alert.
 * 
 */
ZmBrowserAlert.prototype.stop =
function() {
	this._stopLoop();
};

ZmBrowserAlert.prototype._update =
function(status) {
	// Update the favicon.
    // bug: 52080 - disable flashing of favicon
	//Dwt.setFavIcon(status ? this._blankIcon : this._favIcon);

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
