/*
 * ***** BEGIN LICENSE BLOCK *****
 *
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2005, 2006, 2007 Zimbra, Inc.
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

ZmChatMultiWindowView = function(parent, className, posStyle, controller) {
	if (arguments.length == 0) return;
	className = className ? className : "ZmChatMultiWindowView";
	posStyle = posStyle ? posStyle : Dwt.ABSOLUTE_STYLE;
	ZmChatBaseView.call(this, parent, className, posStyle, controller, ZmId.VIEW_IM_CHAT_TAB);
	var dropTgt = new DwtDropTarget([ "ZmRosterItem" ]);
	this.setDropTarget(dropTgt);
	dropTgt.addDropListener(new AjxListener(this, this._dropListener, [ dropTgt ]));

	this.setScrollStyle(DwtControl.CLIP);
//	this.setScrollStyle(DwtControl.SCROLL);
	this._chatIdToChatWidget = {};
	this._initX = 20;
	this._initY = 20;

	this._setEventHdlrs([DwtEvent.ONMOUSEUP]);

	ZmChatMultiWindowView._INSTANCE = this;
};

ZmChatMultiWindowView.prototype = new ZmChatBaseView;
ZmChatMultiWindowView.prototype.constructor = ZmChatMultiWindowView;

ZmChatMultiWindowView._INSTANCE = null;

// PUBLIC function
ZmChatMultiWindowView.getInstance = function() {
	return ZmChatMultiWindowView._INSTANCE;
};

ZmChatMultiWindowView.prototype.getShellWindowManager = function() {
	if (!this._shellWm) {
		this._shellWm = new ZmChatWindowManager(DwtShell.getShell(window), Dwt.Z_WINDOW_MANAGER);
	}
	return this._shellWm;
};

ZmChatMultiWindowView.prototype.getActiveWM = function() {
	return this.getShellWindowManager();
};

ZmChatMultiWindowView.prototype._rosterItemChangeListener = function(chat, item, fields) {
	var cw = ZmTaskbarController.INSTANCE.getChatWidgetForChat(chat);
	if (cw)
		cw._rosterItemChangeListener(item, fields);
};

ZmChatMultiWindowView.prototype._getChatWidgetForChat = function(chat) {
	return this._chatIdToChatWidget[chat.id];
};

ZmChatMultiWindowView.prototype._dropListener = function(dropTgt, ev) {
	if (!ev.srcData)
		return false;
	if (ev.action == DwtDropEvent.DRAG_ENTER) {
		ev.doIt = dropTgt.isValidTarget(ev.srcData);
	} else if (ev.action == DwtDropEvent.DRAG_DROP) {
        	var srcData = ev.srcData;
		var mouseEv = DwtShell.mouseEvent;
            	mouseEv.setFromDhtmlEvent(ev.uiEvent);
		var pos = this.getLocation();
		var newPos = { x: mouseEv.docX - pos.x,
			       y: mouseEv.docY - pos.y };
		this._nextInitX = newPos.x
            	this._nextInitY = newPos.y;
		if (srcData instanceof ZmRosterItem) {
			this._controller.chatWithRosterItem(srcData);
		}
		// FIXME: not implemented
		// 		if (srcData instanceof ZmRosterTreeGroup) {
		// 			this._controller.chatWithRosterItems(srcData.getRosterItems(), srcData.getName()+" "+ZmMsg.imGroupChat);
		// 		}
	}
};

ZmChatMultiWindowView.prototype.chatInNewTab = function(item, tabs) {
	this.__useTab = tabs;
	this._controller.chatWithRosterItem(item);
};

ZmChatMultiWindowView.prototype.chatWithRosterItem = function(item) {
	this._controller.chatWithRosterItem(item);
};
