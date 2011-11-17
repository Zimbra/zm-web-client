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

/**
 * Alerts of an event by playing a sound.
 * @private
 */
ZmSoundAlert = function() {
	this.html5AudioEnabled = ZmSoundAlert.isHtml5AudioEnabled();
	this.enabled = this.html5AudioEnabled || AjxPluginDetector.detectQuickTime() || AjxPluginDetector.detectWindowsMedia();
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

//this tests for wav file support. we might want to refactor it for various file types if needed later
ZmSoundAlert.isHtml5AudioEnabled =
function() {

	try {
		var audio = new Audio("");
		if (!audio.canPlayType) {
			return false;
		}
	}
	catch (e) {
		return false;
	}

	// canPlayType(type) returns: "", "no", "maybe" or "probably"
	var canPlayWav = audio.canPlayType("audio/wav");
	return (canPlayWav !== "no" && canPlayWav !== "");

}

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
	if (!this.enabled) {
		return;
	}

	var time = new Date().getTime();
	if (this._lastTime && ((time - this._lastTime) < 5000)) {
		return;
	}
	this._lastTime = time;

	soundFile = soundFile || "/public/sounds/im/alert.wav";
	var url = appContextPath + soundFile;

	var html;
	if (this.html5AudioEnabled) {
		html = '<audio src="' + url + '" autoplay="yes"></audio>';
	}
	else {
		var embedId = Dwt.getNextId();
		var htmlArr = [
			"<object CLASSID='CLSID:6BF52A52-394A-11d3-B153-00C04F79FAA6' type='audio/wav'>",
			"<param name='url' value='", url, "'>",
			"<param name='autostart' value='true'>",
			"<param name='controller' value='true'>",
			"<embed id='", embedId, "' src='", url, "' controller='false' autostart='true' type='audio/wav'/>",
			"</object>"
		];
		html = htmlArr.join("");
	}
	this._element.innerHTML = html;

	if (!this.html5AudioEnabled && AjxEnv.isFirefox && AjxEnv.isWindows) {
		// The quicktime plugin steals focus and breaks our keyboard nav.
		// The best workaround I've found for this is to blur the embed
		// element, and that only works after the sound plays.
		//
		// Unfortunately it seems that on a slow connection this prevents
		// the sound from playing. I'm hoping this is less bad than killing
		// keyboard focus.
		//
		// Mozilla bug: https://bugzilla.mozilla.org/show_bug.cgi?id=78414
		if (this._blurActionId) {
			AjxTimedAction.cancelAction(this._blurActionId);
			this._blurActionId = null;
		}
		this._blurEmbedTimer(embedId, 0);
	}
};

ZmSoundAlert.prototype._blurEmbedTimer =
function(embedId, tries) {
	var action = new AjxTimedAction(this, this._blurEmbed, [embedId, tries]);
	this._blurActionId = AjxTimedAction.scheduleAction(action, 500);
};

ZmSoundAlert.prototype._blurEmbed =
function(embedId, tries) {
	this._blurActionId = null;

	// Take focus from the embed.
	var embedEl = document.getElementById(embedId);
	if (embedEl && embedEl.blur) {
		embedEl.blur();
	}

	// Force focus to the keyboard manager's focus obj.
	var focusObj = appCtxt.getKeyboardMgr().getFocusObj();
	if (focusObj && focusObj.focus) {
		focusObj.focus();
	}

	// Repeat hack.
	if (tries < 2) {
		this._blurEmbedTimer(embedId, tries + 1);
	}
};
