/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2009 Zimbra, Inc.
 * 
 * The contents of this file are subject to the Zimbra Public License
 * Version 1.2 ("License"); you may not use this file except in
 * compliance with the License.  You may obtain a copy of the License at
 * http://www.zimbra.com/license.
 * 
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * ***** END LICENSE BLOCK *****
 */

ZmChatPopup = function(params) {
	ZmTaskbarPopup.call(this, params);
	this._chat = params.data.chat;

	var args = {
		parent: this,
		posStyle: Dwt.STATIC_STYLE
	};
	this.chatWidget = new ZmChatWidget(args);
	this.chatWidget.addCloseListener(params.data.closeListener);
	this.chatWidget.addMinimizeListener(params.data.minimizeListener);
	this.chatWidget.addStatusListener(params.data.statusListener);
	this.chatWidget._setChat(this._chat);
};

ZmChatPopup.prototype = new ZmTaskbarPopup;
ZmChatPopup.prototype.constructor = ZmChatPopup;

ZmChatPopup.prototype.toString =
function() {
	return "ZmChatPopup";
};

ZmChatPopup.prototype.popup =
function(background) {
	ZmTaskbarPopup.prototype.popup.apply(this, arguments);
	if (!background) {
		this.chatWidget.focus();
	}
};

