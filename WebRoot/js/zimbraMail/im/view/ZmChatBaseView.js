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
 * Portions created by Zimbra are Copyright (C) 2005, 2006, 2007 Zimbra, Inc.
 * All Rights Reserved.
 * 
 * Contributor(s):
 * 
 * ***** END LICENSE BLOCK *****
 */

ZmChatBaseView = function(parent, className, posStyle, controller, view) {
	if (arguments.length == 0) return;

	DwtComposite.call(this, parent, className, posStyle, view);

//	this._setMouseEventHdlrs();
	this.setCursor("default");
	
	this._controller = controller;
	this.view = view;	
	this._evtMgr = new AjxEventMgr();	 
	this._listChangeListener = new AjxListener(this, this._changeListener);	
	this._createHtml();
}

ZmChatBaseView.prototype = new DwtComposite;
ZmChatBaseView.prototype.constructor = ZmChatBaseView;

ZmChatBaseView.prototype.getController =
function() {
	return this._controller;
}

ZmChatBaseView.prototype.getChatList = 
function() {
	return this._list;
}

ZmChatBaseView.prototype.set = 
function(list) {
	this._list = list;
	if (list instanceof ZmList) {
		list.addChangeListener(this._listChangeListener);
	}
	this._postSet();
}

//override
ZmChatBaseView.prototype._postSet = function() { }

ZmChatBaseView.prototype.associateItemWithElement =
function (item, element, type, optionalId) {
	element.id = optionalId ? optionalId : this._getItemId(item);
	element._itemIndex = AjxCore.assignId(item);
	element._type = type;
}

ZmChatBaseView.prototype.getTitle = 
function() {
	return ZmMsg.zimbraTitle + ": "+  ZmMsg.im;
}

// override
ZmChatBaseView.prototype._createHtml =
function() {}

// override
ZmChatBaseView.prototype._changeListener =
function(ev) {}

// override
ZmChatBaseView.prototype.selectChat =
function(chat) {}

// override
ZmChatBaseView.prototype._rosterItemChangeListener =
function(chat, item, fields) {}
