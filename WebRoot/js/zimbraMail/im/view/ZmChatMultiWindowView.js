/*
 * ***** BEGIN LICENSE BLOCK *****
 * Version: ZPL 1.1
 * 
 * The contents of this file are subject to the Zimbra Public License
 * Version 1.1 ("License"); you may not use this file except in
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
 * Portions created by Zimbra are Copyright (C) 2005 Zimbra, Inc.
 * All Rights Reserved.
 * 
 * Contributor(s):
 * 
 * ***** END LICENSE BLOCK *****
 */

function ZmChatMultiWindowView(parent, className, posStyle, controller) {
	if (arguments.length == 0) return;
	className = className ? className : "ZmChatMultiWindowView";
	posStyle = posStyle ? posStyle : Dwt.ABSOLUTE_STYLE;
	ZmChatBaseView.call(this, parent, className, posStyle, controller, ZmController.IM_CHAT_TAB_VIEW);
	this.setScrollStyle(DwtControl.CLIP);
	this._chatWindows = {};
	this._chatIdToChatWindow = {};
	this._windowCloseButtonListener = new AjxListener(this, this._windowCloseListener);
	this._initX = 20;
	this._initY = 20;	
	this._incrX = 20;
	this._incrY = 20;	
};

ZmChatMultiWindowView.prototype = new ZmChatBaseView;
ZmChatMultiWindowView.prototype.constructor = ZmChatMultiWindowView;

ZmChatMultiWindowView.prototype._createHtml =
function() {
   // this._content = new DwtComposite(this, "ZmChatMultiWindow", Dwt.RELATIVE_STYLE);
    //this.getHtmlElement().innerHTML = "<div id='"+this._contentId+"'></div>";
};

/**
* change listener for the chat list
*/
ZmChatMultiWindowView.prototype._changeListener =
function(ev) {
    if (ev.event == ZmEvent.E_CREATE) {
        var chat = ev._details.items[0];
        	var cw = new ZmChatWindow(this, chat);

        var size = this.getSize();

        	if (this._initX > size.x - 50) this._initX = 20;
        	if (this._initY > size.y - 50) this._initY = 20;
        	
      	cw.setBounds(this._initX, this._initY, 400,300);
       	this._initX += this._incrX;
        	this._initY += this._incrY;        	
        this._addChatWindow(cw, chat);
        cw.select();
    } else if (ev.event == ZmEvent.E_DELETE) {
        var chat = ev._details.items[0];    
        var cw = this._getChatWindowForChat(chat);
        if (cw) {
            this._removeChatWindow(cw);
            cw.dispose();
        }
    }
};

ZmChatMultiWindowView.prototype.selectChat =
function(chat) {
    var cw = this._getChatWindowForChat(chat);
    if (cw) cw.select();
};

ZmChatMultiWindowView.prototype._buddyChangeListener =
function(chat, buddy, fields) {
    var cw = this._getChatWindowForChat(chat);
    if (cw) cw._buddyChangeListener(buddy, fields);
}

ZmChatMultiWindowView.prototype._getChatWindowForChat =
function(chat) {
    return this._chatIdToChatWindow[chat.id];
};

ZmChatMultiWindowView.KEY_CHAT = "zcmwv_chat";

ZmChatMultiWindowView.prototype._addChatWindow =
function(chatWindow, chat) {
    	this._chatWindows[chatWindow.id] = chatWindow;
    	this._chatIdToChatWindow[chat.id] = chatWindow;
    	var cb = chatWindow.getCloseButton();
    	cb.setData(ZmChatMultiWindowView.KEY_CHAT, chat);
    cb.addSelectionListener(this._windowCloseButtonListener);
};

ZmChatMultiWindowView.prototype._removeChatWindow =
function(chatWindow) {
    	var cb = chatWindow.getCloseButton();
    cb.removeSelectionListener(this._windowCloseButtonListener);
    delete this._chatIdToChatWindow[chatWindow.chat.id];    
    delete this._chatWindows[chatWindow.id];
};

ZmChatMultiWindowView.prototype._windowCloseListener =
function(ev) {
    var b = ev.item;
    var chat = b.getData(ZmChatMultiWindowView.KEY_CHAT);
    this._controller.endChat(chat);
};
