/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2009, 2010, 2013, 2014 Zimbra, Inc.
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
 * All portions of the code are Copyright (C) 2009, 2010, 2013, 2014 Zimbra, Inc. All Rights Reserved. 
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

