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


function ZmChatWindow(parent, chat) {
	if (arguments.length == 0) return;
	DwtComposite.call(this, parent, "ZmChatWindow", DwtControl.ABSOLUTE_STYLE);
	this._appCtxt = this.shell.getData(ZmAppCtxt.LABEL);
    this._doc = this.getDocument();
	this.setScrollStyle(DwtControl.CLIP);
    	this.addControlListener(new AjxListener(this, this._controlListener));
    this._init();
    this.setZIndex(ZmChatWindow._nextZ++);
    this._setChat(chat);
};

ZmChatWindow.SASH_THRESHHOLD = 1;
ZmChatWindow.MIN_CONTENT_HEIGHT = 50;
ZmChatWindow.MIN_INPUT_HEIGHT = 50;

ZmChatWindow._nextZ = 1;
    
ZmChatWindow.prototype = new DwtComposite;
ZmChatWindow.prototype.constructor = ZmChatWindow;

ZmChatWindow._TRACKER_RESIZE = 1;
ZmChatWindow._TRACKER_DRAG = 2;
ZmChatWindow._TRACKER_SASH = 3;

ZmChatWindow._idToChatWindow = {};

ZmChatWindow._DEFAULT_INPUT_HEIGHT = 70;
ZmChatWindow._SASH_HEIGHT = 10;

ZmChatWindow.prototype.toString = 
function() {
	return "ZmChatWindow";
};

ZmChatWindow._selected = null;

ZmChatWindow.prototype._init =
function() {
	var c = this._container = new DwtComposite(this, "ZmChatWindowContainer");
	c.setScrollStyle(Dwt.SCROLL);
//    var c = this;
	this._toolbar = new DwtToolBar(c);
	this._label = new DwtLabel(this._toolbar, DwtLabel.IMAGE_LEFT | DwtLabel.ALIGN_LEFT, "ZmChatWindowLabel");
	this._statusLabel = new DwtLabel(this._toolbar, DwtLabel.IMAGE_LEFT | DwtLabel.ALIGN_LEFT, "ZmChatWindowStatusLabel");	
	this._toolbar.addFiller();
	this._close = new DwtButton(this._toolbar, DwtLabel.IMAGE_LEFT, "TBButton");
	this._close.setImage("Close");
	this._close.setToolTipContent(ZmMsg.close);
	this._content = new DwtComposite(c, "ZmChatWindowChat", Dwt.ABSOLUTE_STYLE);
	this._content.setScrollStyle(DwtControl.SCROLL);
	this._content.getHtmlElement().innerHTML = "<div/>";
	this._content._setMouseEventHdlrs();    
    	this._objectManager = new ZmObjectManager(this._content, this._appCtxt);
    	this._objectManager.addHandler(new ZmEmoticonObjectHandler(this._appCtxt));
	this._sash = new DwtComposite(c, null, Dwt.ABSOLUTE_STYLE);
	this._input = new DwtComposite(c, "ZmChatWindowInput", Dwt.ABSOLUTE_STYLE);
	this._input.setScrollStyle(DwtControl.SCROLL);	
	this._inputFieldId = Dwt.getNextId();
	ZmChatWindow._idToChatWindow[this._inputFieldId] = this;
    this._input.getHtmlElement().innerHTML = 	"<textarea wrap='hard' style='width:100%; height:100%;' id='" + this._inputFieldId + "'></textarea>";
    Dwt.setHandler(Dwt.getDomObj(this._doc, this._inputFieldId), DwtEvent.ONKEYUP, ZmChatWindow._inputOnKeyUp);

    this._gripper = new DwtComposite(c, "DwtResizeGripper", Dwt.ABSOLUTE_STYLE);
    DwtDragTracker.init(this._sash, DwtDragTracker.STYLE_RESIZE_NORTH, 1, 1, this._sashCallback, this, ZmChatWindow._TRACKER_SASH);
    DwtDragTracker.init(this._toolbar, DwtDragTracker.STYLE_MOVE, 5, 5, this._dragTrackerCallback, this, ZmChatWindow._TRACKER_DRAG);
    DwtDragTracker.init(this._label, DwtDragTracker.STYLE_MOVE, 5, 5, this._dragTrackerCallback, this, ZmChatWindow._TRACKER_DRAG);
    DwtDragTracker.init(this._statusLabel, DwtDragTracker.STYLE_MOVE, 5, 5, this._dragTrackerCallback, this, ZmChatWindow._TRACKER_DRAG);        
    DwtDragTracker.init(this._gripper, DwtDragTracker.STYLE_RESIZE_SOUTHEAST, 5, 5, this._dragTrackerCallback, this, ZmChatWindow._TRACKER_RESIZE);
    
    this.setHandler(DwtEvent.ONCLICK, ZmChatWindow._onClickHdlr);
    Dwt.associateElementWithObject(this.getHtmlElement(), this);
    this.getHtmlElement().__zmchatwindow = 1;
}

ZmChatWindow.prototype.dispose =
function() {
    DwtControl.prototype.dispose.call(this);
    Dwt.disassociateElementFromObject(this.getHtmlElement(), this);
    if (ZmChatWindow._selected == this) ZmChatWindow._selected = null;
};

ZmChatWindow._onClickHdlr =
function(ev) {
    var cw = DwtUiEvent.getDwtObjWithProp(ev, "__zmchatwindow");
    if (cw) cw.select();
};

ZmChatWindow.prototype.select =
function() {
   if (ZmChatWindow._selected && ZmChatWindow._selected != this) ZmChatWindow._selected.getHtmlElement().className = "ZmChatWindow";
   ZmChatWindow._selected = this;
   this.getHtmlElement().className = "ZmChatWindow-selected";
   this.raise();
   var field = Dwt.getDomObj(this.getDocument(), this._inputFieldId);
   if (field) field.focus();
};

ZmChatWindow.prototype.raise =
function() {
    if (this.getZIndex() != ZmChatWindow._nextZ-1) {
        if (!this._origZ) this._origZ = this.getZIndex();
        this.setZIndex(ZmChatWindow._nextZ++);
    }
};

ZmChatWindow.prototype.lower =
function() {
    if (this._origZ) {
        this.setZIndex(this._origZ);
    }
};

ZmChatWindow.prototype._setChat =
function(chat) {
    this.chat = chat;
    var buddy = chat.getBuddy();
    this._buddyChangeListener(buddy, null, true);
//    this.setTitle(buddy.getName());
//    this.setImage(buddy.getIcon());    
};

ZmChatWindow.prototype._buddyChangeListener =
function(buddy, fields, setAll) {
    if (setAll || fields[ZmBuddy.F_STATUS] != null) {
        this.setImage(buddy.getIcon());
        this.setStatusTitle("("+buddy.getStatusText()+")");
    }
    if (setAll || fields[ZmBuddy.F_NAME] != null) {
        this.setTitle(buddy.getName());
    }
};

ZmChatWindow.prototype.sendInput =
function(text) {
    if (text.substring(0,1) == "$") {
        if (text.substring(1, 2) == "a") {
            this.chat.getBuddy().setStatus(ZmBuddy.STATUS_AVAILABLE);
        } else if (text.substring(1, 2) == "u") {
            this.chat.getBuddy().setStatus(ZmBuddy.STATUS_UNAVAILABLE);
        } else if (text.substring(1, 2) == "o") {
            this.chat.getBuddy().setStatus(ZmBuddy.STATUS_OFFLINE);
        } else if (text.substring(1, 3) == "st") {
            text = ">:) :) =)) =(( :(( <:-P :O)";
        }
    }
    
    var content = this._content.getHtmlElement().firstChild;
    var div = this._doc.createElement("div");
    div.className = "ZmChatWindowChatEntryMe";
//    div.innerHTML = "<b>user1: </b>" + AjxStringUtil.htmlEncode(text, true);
    div.innerHTML = "<b>user1: </b>" + this._objectManager.findObjects(text, true);    
    content.appendChild(div);
    
    div = this._doc.createElement("div");
    // div.className = "ZmChatWindowChatEntryThem";
    div.innerHTML = "<span class='ZmChatWindowChatEntryThem'><b>"+AjxStringUtil.htmlEncode(this.chat.getBuddy().getName())+": </b></span>" + AjxStringUtil.htmlEncode("whatever", true);
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

ZmChatWindow.prototype.setStatusTitle =
function(text) {
    this._statusLabel.setText(text);
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
function(data) {
    switch (data.state) {
    case DwtDragTracker.STATE_START:
        data.start = this._sashY;
    	break;
    case DwtDragTracker.STATE_DRAGGING:
	var newY = data.start + data.delta.y;
	if (newY < this._minSashY || newY > this._maxSashY) return;
        this._sashY = newY;
        this._controlListener();
        break;
     }
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

    if (ev) {
        if (ev.newHeight == Dwt.DEFAULT && ev.newWidth == Dwt.DEFAULT) return;
        if (this._sashY) {
            if (ev.newHeight != Dwt.DEFAULT && ev.oldHeight != Dwt.DEFAULT && ev.newHeight != ev.oldHeight) {
                this._sashY += (ev.newHeight - ev.oldHeight);
            }
        }
    }
   
    var size = this.getSize();
   this._container.setSize(size.x+10, size.y+10);

    var tbH = this._toolbar.getH();
    
    this._toolbar.setSize(size.x - 2, Dwt.DEFAULT);

    var sashH = ZmChatWindow._SASH_HEIGHT;
    if (this._sashY == null) {
        this._sashY = (size.y - ZmChatWindow._DEFAULT_INPUT_HEIGHT - sashH);
    }

    var inpH = size.y - (this._sashY + sashH);
    
    var ctH = size.y - inpH - tbH - sashH;
    if (ctH < ZmChatWindow.MIN_CONTENT_HEIGHT) {
        var diff = ZmChatWindow.MIN_CONTENT_HEIGHT - ctH;
        inpH -= diff;
        this._sashY += diff;
        ctH += diff;
    }

    var ctY = tbH;
    var inpY = this._sashY + sashH;

    var yFudge = 8;
    var hFudge = 8;
    var wFudge = 16;    
    var xFudge = 5;

    this._contentY = ctY + yFudge;
    this._contentH = ctH - hFudge;


        
    this._content.setBounds(xFudge, this._contentY, size.x - wFudge, this._contentH);
    this._sash.setBounds(0, this._sashY, size.x, sashH);
    this._inputY = inpY;
    this._inputH = inpH - yFudge - hFudge;
    this._input.setBounds(xFudge, this._inputY, size.x - wFudge, this._inputH);
    var field = Dwt.getDomObj(this.getDocument(), this._inputFieldId);
    Dwt.setSize(field, size.x - wFudge - 2 , this._inputH - 2);
        
    this._gripper.setLocation(size.x-20, size.y-20);
    this._minSashY = this._contentY + ZmChatWindow.MIN_CONTENT_HEIGHT;
    this._maxSashY = size.y - ZmChatWindow.MIN_INPUT_HEIGHT;
};
