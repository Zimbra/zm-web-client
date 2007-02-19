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
	this.chat = chat;
	var view = new ZmChatWidget(this);
	this.setView(view);
	this._cw = view;
	view._setChat(chat);
	this.setSize(400, 300);
	this.setMinSize(200, 100);
	this.setMinPos(0, 0);
	this.addSelectionListener(new AjxListener(this, this.__onActivation));
};

ZmChatWindow.prototype.select = function() {
	return this.setActive(true);
};

ZmChatWindow.prototype._rosterItemChangeListener = function(item, fields, setAll) {
	return this._cw._rosterItemChangeListener(item, fields, setAll);
};

ZmChatWindow.prototype.getCloseButton = function() {
	return this._cw.getCloseButton();
};

ZmChatWindow.prototype.__onActivation = function(ev) {
	if (ev.detail) {
		this._cw._getElement("input").focus();
	}
};


/*** widget ***/

function ZmChatWidget(parent) {
	if (arguments.length == 0) return;
	DwtComposite.call(this, parent, "ZmChatWidget", Dwt.RELATIVE_STYLE);
	this._appCtxt = this.shell.getData(ZmAppCtxt.LABEL);
	this._chatChangeListenerListener = new AjxListener(this, this._chatChangeListener);
	this._init();
};

ZmChatWidget.prototype = new DwtComposite;
ZmChatWidget.prototype.constructor = ZmChatWidget;

ZmChatWidget.prototype._setChat = function(chat) {
	this.chat = chat;
	var item = chat.getRosterItem();
// 	if (this.chat.getRosterSize() > 1 && this._memberListView == null) {
// 		this._memberListView = new ZmChatMemberListView(this, this.chat._getRosterItemList());
// 		this._controlListener();
// 		this._updateGroupChatTitle();
// 	}
	chat.addChangeListener(this._chatChangeListenerListener);
	this._rosterItemChangeListener(item, null, true);
	// TODO: clean up this interface!
	for (var i = 0; i < chat._messages.length; i++) {
		this.handleMessage(this.chat._messages[i]);
	}
};

ZmChatWidget.prototype._rosterItemChangeListener = function(item, fields, setAll) {
	var doShow = setAll || (ZmRosterItem.F_PRESENCE in fields);
	var doUnread = setAll || (ZmRosterItem.F_UNREAD in fields);
	var doName = setAll || (ZmRosterItem.F_NAME in fields);

// 	if (this._memberListView && fields)
// 		this._memberListView._rosterItemChangeListener(item, fields);

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

ZmChatWidget.prototype._chatChangeListener = function(ev, treeView) {
	if (ev.event == ZmEvent.E_MODIFY) {
		var fields = ev.getDetail("fields");
		var msg = fields[ZmChat.F_MESSAGE];
		if (msg)
			this.handleMessage(msg);
	}
};

ZmChatWidget.prototype.handleMessage = function(msg) {
	var content = this._content.getHtmlElement();
	div = document.createElement("div");
	div.innerHTML = msg.toHtml(this._objectManager, this.chat, this.__lastFrom);
	this.__lastFrom = msg.from;
	content.appendChild(div);
	content.scrollTop = div.offsetTop;
};

ZmChatWidget.prototype.setImage = function(imageInfo) {
	this._label.setImage(imageInfo);
};

ZmChatWidget.prototype.setTitle = function(text) {
	this._label.setText(text);
};

ZmChatWidget.prototype.setStatusTitle = function(text) {
	// this._statusLabel.setText(text);
};

ZmChatWidget.prototype.getCloseButton = function() {
	return this._close;
};

ZmChatWidget.prototype.addRosterItem = function(item) {
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

ZmChatWidget.prototype.sendInput = function(text) {
	if (text == "")
		return;		// don't send empty strings
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

ZmChatWidget.prototype._updateGroupChatTitle = function(force) {
	if (!this._groupStaticTitle || force) {
		this.setTitle(this.chat.getName());
		this.setImage("ImGroup");
		this._groupStaticTitle = true;
	}
	this.setStatusTitle("("+this.chat.getRosterSize()+")");
};


ZmChatWidget.IDS = [
	"toolbarLayout",
	"convLayout",
	"inputLayout",
	"input"
];

ZmChatWidget.prototype._init = function() {
	var base_id = Dwt.getNextId();
	this._ids = {};
	for (var i = ZmChatWidget.IDS.length; --i >= 0;) {
		var id = ZmChatWidget.IDS[i];
		this._ids[id] = base_id + "_" + id;
	}
	this.setContent(AjxTemplate.expand("zimbraMail.im.templates.Chat#ChatWidget", { id: base_id }));

	this._toolbar = new DwtToolBar(this, null, Dwt.ABSOLUTE_STYLE);

	this._close = new DwtButton(this._toolbar, null, "DwtToolbarButton");
	this._close.setImage("Close");
	this._close.setToolTipContent(ZmMsg.imEndChat);

	this._label = new DwtLabel(this._toolbar, DwtLabel.IMAGE_LEFT | DwtLabel.ALIGN_LEFT, "ZmChatWindowLabel");
	this._label.setText("Chat title here");

	this._content = new DwtComposite(this, "ZmChatWindowChat", Dwt.ABSOLUTE_STYLE);
	this._content.setScrollStyle(Dwt.SCROLL);

	this._objectManager = new ZmObjectManager(this._content, this._appCtxt);
	this._objectManager.addHandler(new ZmEmoticonObjectHandler(this._appCtxt));
	this._objectManager.sortHandlers();

	this.parent.enableMoveWithElement(this._toolbar);

	this.addControlListener(new AjxListener(this, this.__onResize));

	this._getElement("input")[ AjxEnv.isIE ? "onkeydown" : "onkeypress" ] =
		ZmChatWidget._inputKeyPress;
};

// "this" is here the input field.
ZmChatWidget._inputKeyPress = function(ev) {
	if (AjxEnv.isIE)
		ev = window.event;
	var keyEvent = DwtShell.keyEvent;
	keyEvent.setFromDhtmlEvent(ev);
	if (keyEvent.charCode == 13 && !keyEvent.shiftKey) {
		var self = DwtUiEvent.getDwtObjFromEvent(keyEvent);
        	if (self) {
    			self.sendInput(this.value);
        		this.value = "";
   		}
	}
};

ZmChatWidget.prototype._getElement = function(id) {
	return document.getElementById(this._ids[id]);
};

ZmChatWidget.prototype._doResize = function() {
	var self_pos = this.getLocation();
	var self = this;

	function placeElement(widget, cont, fuzz) {
		cont = self._getElement(cont);
		var p1 = Dwt.getLocation(cont);
		var x = p1.x - self_pos.x;
		var y = p1.y - self_pos.y;

		var left = x + "px";
		var top = y + "px";
		var w = cont.offsetWidth;
		var h = cont.offsetHeight;
		if (!AjxEnv.isIE && fuzz) {
			w -= fuzz; // FIXME!! manually substracting padding/border!  Track CSS changes.
			h -= fuzz;
		}
		// not working in IE.  crap.
		var width = w + "px";
		var height = h + "px";
		widget.setBounds(left, top, width, height);
	};

	placeElement(this._toolbar, "toolbarLayout");
	placeElement(this._content, "convLayout", 4);
};

ZmChatWidget.prototype.__onResize = function(ev) {
	this._doResize();
};
