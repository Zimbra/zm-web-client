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
    this.setZIndex(ZmChatWindow._nextZ++);

};

ZmChatWindow.SASH_THRESHHOLD = 1;
ZmChatWindow.MIN_CONTENT_HEIGHT = 50;
ZmChatWindow.MIN_INPUT_HEIGHT = 50;

ZmChatWindow._nextZ = 1;
    
ZmChatWindow.prototype = new DwtComposite;
ZmChatWindow.prototype.constructor = ZmChatWindow;

ZmChatWindow._TRACKER_RESIZE = 1;
ZmChatWindow._TRACKER_DRAG = 2;

ZmChatWindow._idToChatWindow = {};

ZmChatWindow.prototype.toString = 
function() {
	return "ZmChatWindow";
};


ZmChatWindow._selected = null;

ZmChatWindow.prototype.dispose =
function() {
    DwtControl.prototype.dispose.call(this);
    if (ZmChatWindow._selected == this) ZmChatWindow._selected = null;
}

ZmChatWindow.prototype.select =
function() {
   if (ZmChatWindow._selected && ZmChatWindow._selected != this) ZmChatWindow._selected.getHtmlElement().className = "ZmChatWindow";
   ZmChatWindow._selected = this;
   this.getHtmlElement().className = "ZmChatWindow-selected";
}

ZmChatWindow.prototype.raise =
function() {
    if (this.getZIndex() != ZmChatWindow._nextZ-1) {
        if (!this._origZ)
            this._origZ = this.getZIndex();
        this.setZIndex(ZmChatWindow._nextZ++);
    }
}

ZmChatWindow.prototype.lower =
function() {
    if (this._origZ) {
        this.setZIndex(this._origZ);
    }
}

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
	this._content._setMouseEventHdlrs();    
    	this._objectManager = new ZmObjectManager(this._content, this._appCtxt);
	this._sash = new DwtSash(this, DwtSash.VERTICAL_STYLE, "AppSash-vert", ZmChatWindow.SASH_THRESHHOLD, Dwt.ABSOLUTE_STYLE);
	this._input = new DwtComposite(this, "ZmChatWindowInput", Dwt.ABSOLUTE_STYLE);
	this._input.setScrollStyle(DwtControl.CLIP);
	this._inputFieldId = Dwt.getNextId();
	ZmChatWindow._idToChatWindow[this._inputFieldId] = this;
    this._input.getHtmlElement().innerHTML = 	"<textarea wrap='hard' style='width:100%; height:100%;' id='" + this._inputFieldId + "'></textarea>";
    Dwt.setHandler(Dwt.getDomObj(this._doc, this._inputFieldId), DwtEvent.ONKEYUP, ZmChatWindow._inputOnKeyUp);
    this._sash.registerCallback(this._sashCallback, this);
    this._gripper = new DwtComposite(this, "DwtResizeGripper", Dwt.ABSOLUTE_STYLE);
    DwtDragTracker.init(this._toolbar, DwtDragTracker.STYLE_MOVE, 1, 1, this._dragTrackerCallback, this, ZmChatWindow._TRACKER_DRAG);
    DwtDragTracker.init(this._gripper, DwtDragTracker.STYLE_RESIZE_SOUTHEAST, 1, 1, this._dragTrackerCallback, this, ZmChatWindow._TRACKER_RESIZE);
}

ZmChatWindow.prototype.sendInput =
function(text) {
    var content = this._content.getHtmlElement().firstChild;
    var div = this._doc.createElement("div");
    div.className = "ZmChatWindowChatEntryMe";
//    div.innerHTML = "<b>user1: </b>" + AjxStringUtil.htmlEncode(text, true);
    div.innerHTML = "<b>user1: </b>" + this._objectManager.findObjects(text, true);    
    content.appendChild(div);
    
    div = this._doc.createElement("div");
    // div.className = "ZmChatWindowChatEntryThem";
    div.innerHTML = "<span class='ZmChatWindowChatEntryThem'><b>"+AjxStringUtil.htmlEncode(this.buddy.getName())+": </b></span>" + AjxStringUtil.htmlEncode("whatever", true);
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

ZmChatWindow.prototype._dragTrackerCallback =
function(data) {
    switch (data.state) {
    case DwtDragTracker.STATE_START:
    		this.raise();
    		this.select();
    		data.start = (data.userData == ZmChatWindow._TRACKER_RESIZE) ? this.getSize() : this.getLocation();
    		break;
    case DwtDragTracker.STATE_DRAGGING:
        if (data.prevState == DwtDragTracker.STATE_START)
        		Dwt.setOpacity(this.getHtmlElement(), 70);
        var newX = data.start.x + data.delta.x;
        var newY = data.start.y + data.delta.y;        		
        if (data.userData == ZmChatWindow._TRACKER_RESIZE) {
            if (newX >= 200 && newY >= 150)
                this.setSize(newX, newY);
        } else {
            if (newX >= 0 && newY >= 0)
                this.setLocation(newX, newY);
        }
        break;
    case DwtDragTracker.STATE_END:
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

    var yFudge = 8;
    var hFudge = 16;
    var wFudge = 16;    
    var xFudge = 5;

    this._contentY = ctY + yFudge;
    this._contentH = ctH - hFudge;
    	this._content.setBounds(xFudge, this._contentY, ev.newWidth - wFudge, this._contentH);
    	this._sash.setBounds(0, sashY, ev.newWidth, sashH);
    	this._inputY = inpY + yFudge;
    	this._inputH = inpH - hFudge;
    	this._input.setBounds(xFudge, this._inputY, ev.newWidth - wFudge, this._inputH);
    this._gripper.setLocation(ev.newWidth-15, ev.newHeight-15);
};
