/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2011, 2012, 2013, 2014 Zimbra, Inc.
 *
 * The contents of this file are subject to the Common Public Attribution License Version 1.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at: http://www.zimbra.com/license
 * The License is based on the Mozilla Public License Version 1.1 but Sections 14 and 15
 * have been added to cover use of software over a computer network and provide for limited attribution
 * for the Original Developer. In addition, Exhibit A has been modified to be consistent with Exhibit B.
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * See the License for the specific language governing rights and limitations under the License.
 * The Original Code is Zimbra Open Source Web Client.
 * The Initial Developer of the Original Code is Zimbra, Inc.
 * All portions of the code are Copyright (C) 2011, 2012, 2013, 2014 Zimbra, Inc. All Rights Reserved.
 * ***** END LICENSE BLOCK *****
 */

ZmChatApp = function(container) {
    ZmApp.call(this, ZmApp.CHAT, container);
};

ZmChatApp.prototype = new ZmApp;
ZmChatApp.prototype.constructor = ZmChatApp;

ZmChatApp.prototype.toString = function() {    return "ZmChatApp"; };

ZmChatApp.prototype.isChatEnabled = true;

ZmApp.CHAT = ZmId.APP_CHAT;
ZmApp.CLASS[ZmApp.CHAT] = "ZmChatApp";

ZmChatApp.prototype._defineAPI =
function() {
    // TODO
    AjxDispatcher.registerMethod("GetRoster", "ConverseJS", new AjxCallback(this, this.getRoster));
};

ZmChatApp.prototype.getRoster =
function() {
    // TODO - Just a stub.
    return this._roster;
};

ZmChatApp.CONVERSE_PATH = "/js/ajax/3rdparty/converse";

ZmChatApp.prototype.login =
function() {
    // Stub for login
};

ZmChatApp.prototype._init = function() {
    if (appCtxt.get(ZmSetting.CHAT_ENABLED)) {
        var jsonObj = {GetBOSHSessionRequest:{_jsns:"urn:zimbraMail"}};
        //chain UI initialization to SOAP response via a callback
        var callback = new AjxCallback(this, this.initChatUI);
        //Call prebind
        appCtxt.getAppController().sendRequest({jsonObj:jsonObj, asyncMode:true, errorCallback:callback, callback:callback});
    }
};

ZmChatApp.prototype.initChatUI = function(response) {
    //TODO - find a better way to append it to z_shell
    var newDiv = document.getElementById("z_shell").appendChild(document.createElement('div'));
    newDiv.style.display = "block";
    newDiv.style.zIndex = 9000;
    newDiv.id = "conversejs";
    appCtxt.getAppViewMgr().fitAll();

    var resp = response.getResponse();
    var jid = resp.GetBOSHSessionResponse.XMPPSession.jid;
    var rid = resp.GetBOSHSessionResponse.XMPPSession.rid;
    var sid = resp.GetBOSHSessionResponse.XMPPSession.sid;
    var url = resp.GetBOSHSessionResponse.XMPPSession.url;

    converse.initialize({
        auto_list_rooms:false,
        auto_subscribe:false,
        hide_muc_server:false,
        i18n:locales.en,
        keepalive:true,
        bosh_service_url:url,
        prebind:true,
        show_controlbox_by_default:true,
        roster_groups:true,
        play_sounds:appCtxt.get(ZmSetting.CHAT_PLAY_SOUND),
        sid: sid,
        jid:jid,
        rid:rid
    });
};

ZmChatApp.prototype.launch =
function(params, callback) {
    this._setLaunchTime(this.toString(), new Date());
    var loadCallback = this._handleLoadLaunch.bind(this, callback);
    AjxDispatcher.require(["ConverseJS"], true, loadCallback, null, true);
};

ZmChatApp.prototype._handleLoadLaunch =
function(params, callback) {
    this._setLoadedTime(this.toString(), new Date());
    if (callback) {
        callback.run();
    }
    this._init();
};

ZmChatApp.prototype.setPlaySoundSetting =
function(value) {
    if (appCtxt.get(ZmSetting.CHAT_FEATURE_STATUS)) {
        converse.settings.set('play_sounds', value);
    }
};