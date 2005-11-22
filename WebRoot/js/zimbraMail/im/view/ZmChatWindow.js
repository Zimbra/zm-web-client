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

function ZmChatWindow(parent) {
	if (arguments.length == 0) return;
	DwtComposite.call(this, parent, "ZmChatWindow", DwtControl.ABSOLUTE_STYLE);
	this._appCtxt = this.shell.getData(ZmAppCtxt.LABEL);
    this._doc = this.getDocument();
	this.setScrollStyle(DwtControl.CLIP);
    	this.addControlListener(new AjxListener(this, this._controlListener));
    		
    this._init();	
};

ZmChatWindow.SASH_THRESHHOLD = 1;
ZmChatWindow.MIN_CONTENT_HEIGHT = 50;
ZmChatWindow.MIN_INPUT_HEIGHT = 50;
    
ZmChatWindow.prototype = new DwtComposite;
ZmChatWindow.prototype.constructor = ZmChatWindow;

ZmChatWindow._idToChatWindow = {};

ZmChatWindow.prototype.toString = 
function() {
	return "ZmChatWindow";
};

ZmChatWindow.prototype.setBuddy =
function(buddy) {
    this.buddy = buddy;
    this.setTitle(buddy.getName());
    this.setImage(buddy.getIcon());    
}

ZmChatWindow.prototype._init =
function() {
	this._toolbar = new DwtToolBar(this);
	this._label = new DwtLabel(this._toolbar, DwtLabel.IMAGE_LEFT | DwtLabel.ALIGN_LEFT, "ZmChatWindowLabel");
	this._toolbar.addFiller();
	this._close = new DwtButton(this._toolbar, DwtLabel.IMAGE_LEFT, "TBButton");
	this._close.setImage("Close");
	this._close.setToolTipContent(ZmMsg.close);
	this._content = new DwtComposite(this, "ZmChatWindowChat", Dwt.ABSOLUTE_STYLE);
	this._content.setScrollStyle(DwtControl.SCROLL);
	this._content.getHtmlElement().innerHTML = "<div/>";
	this._sash = new DwtSash(this, DwtSash.VERTICAL_STYLE, "AppSash-vert", ZmChatWindow.SASH_THRESHHOLD, Dwt.ABSOLUTE_STYLE);
	this._input = new DwtComposite(this, "ZmChatWindowInput", Dwt.ABSOLUTE_STYLE);
	this._input.setScrollStyle(DwtControl.CLIP);
	this._inputFieldId = Dwt.getNextId();
	ZmChatWindow._idToChatWindow[this._inputFieldId] = this;
    this._input.getHtmlElement().innerHTML = 	"<textarea wrap='hard' style='width:100%; height:100%;' id='" + this._inputFieldId + "'></textarea>";
    Dwt.setHandler(Dwt.getDomObj(this._doc, this._inputFieldId), DwtEvent.ONKEYUP, ZmChatWindow._inputOnKeyUp);
    this._sash.registerCallback(this._sashCallback, this);
    DwtMovable.init(this._toolbar, this, 1, 1, this._movableCallback, this);    
}

ZmChatWindow.prototype.sendInput =
function(text) {
    var content = this._content.getHtmlElement().firstChild;
    var div = this._doc.createElement("div");
    div.className = "ZmChatWindowChatEntryMe";
    div.innerHTML = "<b>user1: </b>" + AjxStringUtil.htmlEncode(text, true);
    content.appendChild(div);
    
    div = this._doc.createElement("div");
    div.className = "ZmChatWindowChatEntryThem";
    div.innerHTML = "<b>"+AjxStringUtil.htmlEncode(this.buddy.getName())+": </b>" + AjxStringUtil.htmlEncode("whatever", true);
    content.appendChild(div);
    content.parentNode.scrollTop = Dwt.getSize(content).y;
}

ZmChatWindow._inputOnKeyUp =
function(ev) {
	var element = DwtUiEvent.getTarget(ev);

	var charCode = DwtKeyEvent.getCharCode(ev);
	if (charCode == 13 || charCode == 3) {
        	var chatWindow = ZmChatWindow._idToChatWindow[element.id];	
        	if (chatWindow) {
    	        chatWindow.sendInput(element.value);
        		element.value = "";
   		}
	    return false;
	} else {
		return true;
	}
}

ZmChatWindow.prototype.setTitle =
function(text) {
    this._label.setText(text);
};

ZmChatWindow.prototype.setImage =
function(imageInfo) {
    this._label.setImage(imageInfo);
};

ZmChatWindow.prototype.getCloseButton = 
function() {
	return this._close;
};

ZmChatWindow.prototype._sashCallback =
function(delta) {
    if (this._contentH + delta < ZmChatWindow.MIN_CONTENT_HEIGHT || this._inputH - delta < ZmChatWindow.MIN_INPUT_HEIGHT) return 0;
    
    this._contentH += delta;
    this._content.setSize(Dwt.DEFAULT, this._contentH);
    this._inputY += delta;
    this._inputH -= delta;
    this._input.setBounds(Dwt.DEFAULT, this._inputY, Dwt.DEFAULT, this._inputH);
    return delta;
}

ZmChatWindow.prototype._movableCallback =
function(data) {
    switch (data.state) {
    case DwtMovable.STATE_MOVE_START:
    		Dwt.setOpacity(this.getHtmlElement(), 70);
    		break;
    case DwtMovable.STATE_MOVING:
        var newX = data.start.x + data.delta.x;
        var newY = data.start.y + data.delta.y;
        if (newX < 0 || newY < 0) {
            data.delta.x = data.delta.y = 0;
        }
        return data;
        break;
    case DwtMovable.STATE_MOVE_END:
    		Dwt.setOpacity(this.getHtmlElement(), 100);
    		break;
	}
}

ZmChatWindow.prototype._controlListener =
function(ev) {
    if (ev.newHeight == Dwt.DEFAULT || ev.newWidth == Dwt.DEFAULT) return;
    
//	this._toolbar.setSize(ev.newWidth, Dwt.DEFAULT);
    var tbH = this._toolbar.getH();
    var sashH = this._sash.getH();
    var height = ev.newHeight - tbH - sashH;
    var inpH = Math.min(80, Math.floor(height * 0.25));
    var ctH = height - inpH;    

    var ctY = tbH;
    var sashY = ctY + ctH;
    var inpY = sashY + sashH;
    
    this._contentY = ctY+4;
    this._contentH = ctH-10;
    	this._content.setBounds(3, this._contentY, ev.newWidth-10, this._contentH);
    	this._sash.setBounds(0, sashY, ev.newWidth, sashH);
    	this._inputY = inpY+4;
    	this._inputH = inpH-10;
    	this._input.setBounds(3, this._inputY, ev.newWidth-10, this._inputH);
};
