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
 * Alerts of an event by playing a sound.
 */
ZmSoundAlert = function() {
	this._element = document.createElement("DIV");
	document.body.appendChild(this._element);
};

ZmSoundAlert.prototype.toString =
function() {
	return "ZmSoundAlert";
};

ZmSoundAlert.getInstance =
function() {
	return ZmSoundAlert.INSTANCE = ZmSoundAlert.INSTANCE || new ZmSoundAlert();
};

ZmSoundAlert.prototype.start =
function(soundFile) {
	var time = new Date().getTime();
	if (!this._lastTime || ((time - this._lastTime) > 5000)) {
		var url = appContextPath + soundFile;
		var htmlArr = ["<embed src='", url, "' hidden=true autostart=true loop=false>"];
		this._element.innerHTML = htmlArr.join("");
		this._lastTime = time;
	}
};
