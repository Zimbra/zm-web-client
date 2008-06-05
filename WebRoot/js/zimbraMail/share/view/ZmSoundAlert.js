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
	this.enabled = AjxPluginDetector.detectQuickTime() || AjxPluginDetector.detectWindowsMedia();
	if (this.enabled) {
		var element = this._element = document.createElement("DIV");
		element.style.position = 'relative';
		element.style.top = '-1000px';
		element.style.left = '-1000px';
		document.body.appendChild(this._element);
	} else {
		DBG.println("No QuickTime or Windows Media plugin detected. Sound alerts are disabled.")
	}
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
	if (this.enabled) {
		var time = new Date().getTime();
		if (!this._lastTime || ((time - this._lastTime) > 5000)) {
			soundFile = soundFile || "/public/sounds/im/alert.wav";
			var url = appContextPath + soundFile;
			var htmlArr = [
				"<object CLASSID='CLSID:6BF52A52-394A-11d3-B153-00C04F79FAA6' type='audio/wav'>",
				"<param name='url' value='", url, "'>",
				"<param name='autostart' value='true'>",
				"<param name='controller' value='true'>",
				"<embed src='", url, "' controller='true' autostart='true' type='audio/wav' />",
				"</object>"
			 ];
			this._element.innerHTML = htmlArr.join("");
			this._lastTime = time;
		}
	}
};
