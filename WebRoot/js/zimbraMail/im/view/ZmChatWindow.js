/*
 * ***** BEGIN LICENSE BLOCK *****
 * Version: ZPL 1.2
 *
 * The contents of this file are subject to the Zimbra Public License
 * Version 1.2 ("License"); you may not use this file except in
 * compliance with the License. You may obtain a copy of the License at
 * http://www.zimbra.com/license
 *
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied. See
 * the License for the specific language governing rights and limitations
 * under the License.
 *
 * The Original Code is: Zimbra Collaboration Suite Web Client
 *
 * The Initial Developer of the Original Code is Zimbra, Inc.
 * Portions created by Zimbra are Copyright (C) 2005, 2006 Zimbra, Inc.
 * All Rights Reserved.
 *
 * Contributor(s):
 *
 * ***** END LICENSE BLOCK *****
 */

function ZmChatWindow(parent, chat) {
	if (arguments.length == 0) return;
	DwtResizableWindow.call(this, parent);
	this._appCtxt = this.shell.getData(ZmAppCtxt.LABEL);
	this._init(chat);
};

ZmChatWindow.prototype = new DwtResizableWindow;
ZmChatWindow.prototype.constructor = ZmChatWindow;

ZmChatWindow.prototype._init = function(chat) {
	var tabs = this._tabs = new ZmChatTabs(this);
	this.setView(tabs);
	this.chat = chat;
	tabs.addTab(chat);
	this.setSize(400, 300);
	this.setMinSize(200, 100);
	this.setMinPos(0, 0);
	tabs = null;
	this.addSelectionListener(new AjxListener(this, this.__onActivation));
	this.addFocusListener(new AjxListener(this, function() {
		this._tabs.getCurrentChatWidget().focus();
	}));
};

ZmChatWindow.prototype.select = function() {
	return this.setActive(true);
};

ZmChatWindow.prototype._rosterItemChangeListener = function(item, fields, setAll) {
	return this._tabs.getCurrentChatWidget()._rosterItemChangeListener(item, fields, setAll);
};

ZmChatWindow.prototype.getCloseButton = function() {
	return this._tabs.getCurrentChatWidget().getCloseButton();
};

ZmChatWindow.prototype.__onActivation = function(ev) {
	if (ev.detail) {
		this._tabs.getCurrentChatWidget().focus();
	}
};
