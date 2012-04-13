/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2007, 2008, 2009, 2010 Zimbra, Inc.
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
 * Creates a (singleton) Flash audio player. It plays  This is used by ZmVoicemailListView
 * @class
 *
 * @author Raja Rao DV
 *
 * @extends		DwtComposite
 */
ZmFlashAudioPlayer = function() {
    //singleton
    if (appCtxt._ZmFlashAudioPlayer) {
        return appCtxt._ZmFlashAudioPlayer;
    }
    className = "ZmFlashAudioPlayer";
    DwtComposite.call(this, {
        parent: appCtxt.getShell(),
        className: className
    });
    appCtxt._ZmFlashAudioPlayer = this;
    this.hasFlash = this._alertIfFlashNotInstalledOrIsOlderVersion();
};

ZmFlashAudioPlayer.prototype = new DwtComposite;
ZmFlashAudioPlayer.prototype.constructor = ZmFlashAudioPlayer;

ZmFlashAudioPlayer.MINIMUM_FLASH_VERSION = 9;

ZmFlashAudioPlayer.prototype.toString =
function() {
    return "ZmFlashAudioPlayer";
};

/**
 * Checks for Flash plugin and its version. If its not available or less than v9,
 * it throws an alert asking people to install the plugin.
 *
 * @returns <code>false<code> if plugin is not installed or less than v9

 */
ZmFlashAudioPlayer.prototype._alertIfFlashNotInstalledOrIsOlderVersion =
function() {
	var flashVersion = AjxPluginDetector.getFlashVersion();
    var majorVersion = flashVersion.split(',').shift();
    if (majorVersion < ZmFlashAudioPlayer.MINIMUM_FLASH_VERSION) {
        var dlg = appCtxt.getMsgDialog();
        dlg.reset();
        dlg.setMessage(ZmMsg.missingOrOldFlashPlugin, DwtMessageDialog.CRITICAL_STYLE);
        dlg.popup();
        return false;
    }
    return true;
};

/**
 * This creates a Flash player and moves it to Duration("du") column of the Voice Mail
 *
 * @param dwtPoint {DwtPoint} A DwtPoint with x & y co-ordinates that shows where to display this player
 * @param voicemail {ZmVoiceMail} A Voicemail object
 * @param autoPlay {Boolean} If <code>true</code>, automatically starts playing voicemail
 */
ZmFlashAudioPlayer.prototype.playAt =
function(dwtPoint, voicemail, autoPlay) {
    this._embedPlayer(voicemail.soundUrl, autoPlay);
    var el = this.getHtmlElement();
    el.style.position = "absolute";
    el.style.zIndex = "300";
    Dwt.setLocation(el, dwtPoint.x, dwtPoint.y);
};

ZmFlashAudioPlayer.prototype.hide =
function() {
    this.getHtmlElement().innerHTML = "";
    this.getHtmlElement().style.zIndex = "100";
};

ZmFlashAudioPlayer.prototype._embedPlayer =
function(soundUrl, autoPlay) {
    if (!soundUrl) {
        return;
    }
    var autoPlayStr = autoPlay ? "&amp;autoplay=1": "";
    var html = ["<object id= 'zm_flash_player' type=\"application/x-shockwave-flash\" ",
    "data=" + appContextPath + "\"/public/flash/player_mp3_maxi.swf\" ",
    "width=\"200\" height=\"17\">",
    "<param name=\"movie\" ",
    "value=" + appContextPath + "\"/public/flash/player_mp3_maxi.swf\" />",
    "<param name=\"bgcolor\" value=\"#ffffff\" />",
    "<param name=\"FlashVars\" value=\"mp3=",
    AjxStringUtil.urlComponentEncode(soundUrl),
    , "&amp;showvolume=1&amp;height=17",
    autoPlayStr,
    "\" />",
    "</object>"];

    this.getHtmlElement().innerHTML = html.join("");
};