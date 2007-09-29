/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2005, 2006 Zimbra, Inc.
 * 
 * The contents of this file are subject to the Yahoo! Public License
 * Version 1.0 ("License"); you may not use this file except in
 * compliance with the License.  You may obtain a copy of the License at
 * http://www.zimbra.com/license.
 * 
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * ***** END LICENSE BLOCK *****
 */

function ZmChatWindow(parent, chat) {
	if (arguments.length == 0) return;
	DwtComposite.call(this, parent, "ZmChatWindow", DwtControl.ABSOLUTE_STYLE);
	this._appCtxt = this.shell.getData(ZmAppCtxt.LABEL);
	this.setScrollStyle(DwtControl.CLIP);
    	this.addControlListener(new AjxListener(this, this._controlListener));
    this._init();
    this.setZIndex(ZmChatWindow._nextZ++);
	this._chatChangeListenerListener = new AjxListener(this, this._chatChangeListener);
    this._setChat(chat);
    this.id = Dwt.getNextId();
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
ZmChatWindow._SASH_HEIGHT = 8;
ZmChatWindow._LIST_WIDTH = 100;

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
	this._close = new DwtButton(this._toolbar, DwtLabel.IMAGE_LEFT, "DwtToolbarButton");
	this._close.setImage("Close");
	this._close.setToolTipContent(ZmMsg.imEndChat);
	this._content = new DwtComposite(c, "ZmChatWindowChat", Dwt.ABSOLUTE_STYLE);
	this._content.setScrollStyle(DwtControl.SCROLL);
	this._content.getHtmlElement().innerHTML = "<div/>";
	this._content._setMouseEventHdlrs();    
	this._objectManager = new ZmObjectManager(this._content, this._appCtxt);
	this._objectManager.addHandler(new ZmEmoticonObjectHandler(this._appCtxt));
	this._objectManager.sortHandlers();
	this._sash = new DwtComposite(c, null, Dwt.ABSOLUTE_STYLE);
	this._input = new DwtComposite(c, "ZmChatWindowInput", Dwt.ABSOLUTE_STYLE);
	this._input.setScrollStyle(DwtControl.SCROLL);	
	this._inputFieldId = Dwt.getNextId();
	ZmChatWindow._idToChatWindow[this._inputFieldId] = this;
    this._input.getHtmlElement().innerHTML = 	"<textarea wrap='hard' style='width:100%; height:100%;' id='" + this._inputFieldId + "'></textarea>";
    Dwt.setHandler(document.getElementById(this._inputFieldId), DwtEvent.ONKEYUP, ZmChatWindow._inputOnKeyUp);

    this._gripper = new DwtComposite(c, "DwtResizeGripper", Dwt.ABSOLUTE_STYLE);
    DwtDragTracker.init(this._sash, DwtDragTracker.STYLE_RESIZE_NORTH, 1, 1, this._sashCallback, this, ZmChatWindow._TRACKER_SASH);
    DwtDragTracker.init(this._toolbar, DwtDragTracker.STYLE_MOVE, 5, 5, this._dragTrackerCallback, this, ZmChatWindow._TRACKER_DRAG);
    DwtDragTracker.init(this._label, DwtDragTracker.STYLE_MOVE, 5, 5, this._dragTrackerCallback, this, ZmChatWindow._TRACKER_DRAG);
    DwtDragTracker.init(this._statusLabel, DwtDragTracker.STYLE_MOVE, 5, 5, this._dragTrackerCallback, this, ZmChatWindow._TRACKER_DRAG);        
    DwtDragTracker.init(this._gripper, DwtDragTracker.STYLE_RESIZE_SOUTHEAST, 5, 5, this._dragTrackerCallback, this, ZmChatWindow._TRACKER_RESIZE);

	var dropTgt = new DwtDropTarget(ZmRosterTreeItem);
	this._input.setDropTarget(dropTgt);
	this._content.setDropTarget(dropTgt);
	dropTgt.addDropListener(new AjxListener(this, this._dropListener));
    
    this.setHandler(DwtEvent.ONCLICK, ZmChatWindow._onClickHdlr);
    Dwt.associateElementWithObject(this.getHtmlElement(), this);
    this.getHtmlElement().__zmchatwindow = 1;
}

ZmChatWindow.prototype.dispose =
function() {
	this._close.setToolTipContent(null);
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
   var field = document.getElementById(this._inputFieldId);
   if (field) field.focus();
   var item = this.chat.getRosterItem();   
   if (item.getUnread()) item.setUnread(0);
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
    var item = chat.getRosterItem();
    if (this.chat.getRosterSize() > 1 && this._memberListView == null) {
        this._memberListView = new ZmChatMemberListView(this, this.chat._getRosterItemList());
        this._controlListener();
        this._updateGroupChatTitle();
   }
   chat.addChangeListener(this._chatChangeListenerListener);
   this._rosterItemChangeListener(item, null, true);
    // TODO: clean up this interface!
    for (var i=0; i < chat._messages.length; i++) {
        this.handleMessage(this.chat._messages[i]);
    }
};

ZmChatWindow.prototype._chatChangeListener = 
function(ev, treeView) {
    if (ev.event == ZmEvent.E_MODIFY) {
        var fields = ev.getDetail("fields");
        var doMsg = ZmChat.F_MESSAGE in fields;
        if (doMsg) {
            var msg = fields[ZmChat.F_MESSAGE];
            this.handleMessage(msg);
        }
    }
};

ZmChatWindow.prototype.addRosterItem =
function(item) {
    var forceTitle = false;
    if (this.chat.getRosterSize() > 0 && this._memberListView == null) {
        if (!this.chat.isGroupChat()) {
            this.chat.setName(ZmMsg.imGroupChat);
            forceTitle = true;
        }
        this._memberListView = new ZmChatMemberListView(this, this.chat._getRosterItemList());
        this._controlListener();
   }
   this.chat.addRosterItem(item);
   this._updateGroupChatTitle(forceTitle);
};

ZmChatWindow.prototype._updateGroupChatTitle =
function(force) {
    if (!this._groupStaticTitle || force) {
        this.setTitle(this.chat.getName());
        this.setImage("ImGroup");
        this._groupStaticTitle = true;
    }
    this.setStatusTitle("("+this.chat.getRosterSize()+")");
};

ZmChatWindow.prototype._rosterItemChangeListener =
function(item, fields, setAll) {
    var doShow = setAll || (ZmRosterItem.F_PRESENCE in fields);
    var doUnread = setAll || (ZmRosterItem.F_UNREAD in fields);
    var doName = setAll || (ZmRosterItem.F_NAME in fields);

    if (this._memberListView && fields) this._memberListView._rosterItemChangeListener(item, fields);

    if (this.chat.getRosterSize() == 1) {
        if (doShow) this.setImage(item.getPresence().getIcon());
        if (doShow || doUnread) {
            var title = new AjxBuffer();
            title.append("(", item.getPresence().getShowText());
            if (item.getUnread()) {
                title.append(", ", item.getUnread(), " ", ZmMsg.unread.toLowerCase());        
            }
            title.append(")");
            this.setStatusTitle(title.toString());
        }
        if (doName) {
            this.setTitle(item.getDisplayName());
        }
    }        
};

ZmChatWindow.prototype.handleMessage =
function(msg) {
    var content = this._content.getHtmlElement().firstChild;
    div = document.createElement("div");   
    div.innerHTML = msg.toHtml(this._objectManager, this.chat);
    content.appendChild(div);
    content.parentNode.scrollTop = Dwt.getSize(content).y;
};

ZmChatWindow.prototype.sendInput =
function(text) {
    if (text.substring(0,1) == "$") {
        if (text.substring(1, 2) == "p") {
            this.chat.getRosterItem().__setShow(AjxStringUtil.trim(text.substring(3)));
        } else if (text.substring(1, 3) == "et") {
            text = ">:) :) =)) =(( :(( <:-P :O)";
        } else if (text.substring(1, 2) == "u") {
            this.chat.getRosterItem().setUnread(parseInt(text.substring(2)));
        }
    }
    this.chat.sendMessage(text);
};

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

ZmChatWindow.prototype._dropListener =
function(ev) {
	if (ev.action == DwtDropEvent.DRAG_ENTER) {
		var srcData = ev.srcData;
        	ev.doIt = (srcData instanceof ZmRosterTreeItem) && !this.chat.hasRosterAddr(srcData.getRosterItem().getAddress());
	} else if (ev.action == DwtDropEvent.DRAG_DROP) {
        	var srcData = ev.srcData;
		if ((srcData instanceof ZmRosterTreeItem)) {
		     this.addRosterItem(srcData.getRosterItem());
        }
	}
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
    		data.startLoc = this.getLocation();    		
    		data.startSize = this.getSize();    		
    		data.parentSize = this.parent.getSize();
    		break;
    case DwtDragTracker.STATE_DRAGGING:
        if (data.prevState == DwtDragTracker.STATE_START)
        		Dwt.setOpacity(this.getHtmlElement(), 70);
        if (data.userData == ZmChatWindow._TRACKER_RESIZE) {
            var newX = data.startSize.x + data.delta.x;
            var newY = data.startSize.y + data.delta.y;        		
            if (newX >= 200 && newY >= 150)
                this.setSize(newX, newY);
        } else {
            var newX = data.startLoc.x + data.delta.x;
            var newY = data.startLoc.y + data.delta.y;
            if (newX >= 0 && newY >= 0) {
                //newY < (data.parentSize.y - data.startSize.y) && 
                //newX < (data.parentSize.x - data.startSize.x)) {
                this.setLocation(newX, newY);
            }
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
    
    this._toolbar.setSize(size.x - 5, Dwt.DEFAULT);

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

    var yFudge = 4;
    var hFudge = 4;
    var wFudge = 12;    
    var xFudge = 5;

    this._contentY = ctY + yFudge;
    this._contentH = ctH - hFudge;

    var contentW = size.x - wFudge - 4;
    
    if (this._memberListView != null) {
        contentW -= ZmChatWindow._LIST_WIDTH;
        this._memberListView.setBounds(xFudge + contentW, this._contentY, ZmChatWindow._LIST_WIDTH, this._contentH);
        contentW -= 5;
        
    }

    this._content.setBounds(xFudge, this._contentY, contentW, this._contentH);

    this._sash.setBounds(0, this._sashY, size.x, sashH);
    this._inputY = inpY;
    this._inputH = inpH - yFudge - hFudge;
    this._input.setBounds(xFudge, this._inputY, size.x - wFudge, this._inputH);
    var field = document.getElementById(this._inputFieldId);
    Dwt.setSize(field, size.x - wFudge - 2 , this._inputH - 2);
        
    this._gripper.setLocation(size.x-18, size.y-18);
    this._minSashY = this._contentY + ZmChatWindow.MIN_CONTENT_HEIGHT;
    this._maxSashY = size.y - ZmChatWindow.MIN_INPUT_HEIGHT;
};


