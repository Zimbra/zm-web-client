/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2004, 2005, 2006, 2007, 2008, 2009, 2010 Zimbra, Inc.
 * 
 * The contents of this file are subject to the Zimbra Public License
 * Version 1.3 ("License"); you may not use this file except in
 * compliance with the License.  You may obtain a copy of the License at
 * http://www.zimbra.com/license.
 * 
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * ***** END LICENSE BLOCK *****
 */
ZmConvView2 = function(params) {

	params.className = params.className || "ZmConvView2";
	ZmMailItemView.call(this, params);

	this._mode = params.mode;
	this._controller = params.controller;

	// A single action menu is shared by the msgs in this conv
	var opList = this._controller._getActionMenuOps();
	var menu = this._actionsMenu = new ZmActionMenu({parent:appCtxt.getShell(), menuItems: opList, context: this._mode});
	for (var i = 0; i < opList.length; i++) {
		var menuItem = opList[i];
		if (this._controller._listeners[menuItem]) {
			var listener = this._listenerProxy.bind(this, this._controller._listeners[menuItem], menu.getOp(menuItem));
			menu.addSelectionListener(menuItem, listener, 0);
		}
	}
};

ZmConvView2.prototype = new ZmMailItemView;
ZmConvView2.prototype.constructor = ZmConvView2;

ZmConvView2.prototype.isZmConvView2 = true;
ZmConvView2.prototype.toString = function() { return "ZmConvView2"; };

ZmConvView2.prototype.reset =
function() {
	this._conv = null;
	this.getHtmlElement().innerHTML = "";
};

ZmConvView2.prototype.set =
function(conv, force) {

	if (!force && this._conv && conv && (this._conv.id == conv.id)) { return; }

	var oldConv = this._conv;
	this.reset();
	this._conv = conv;
	
	if (!conv) {
		this.getHtmlElement().innerHTML = AjxTemplate.expand("mail.Message#viewMessage");
		this.noTab = true;
		return;
	}
	this._renderConv(conv, this._handleResponseSet.bind(this, conv, oldConv));
};

ZmConvView2.prototype._handleResponseSet =
function(conv, oldConv) {

};

ZmConvView2.prototype._renderConv =
function(conv, callback) {

	this._messagesDivId = Dwt.getNextId();
	this._replyDivId = Dwt.getNextId();
	var subs = {
		messagesDivId:	this._messagesDivId,
		replyDivId:		this._replyDivId
	}
	var html = AjxTemplate.expand("mail.Message#Conv2View", subs);
	var el = this.getHtmlElement();
	el.appendChild(Dwt.parseHtmlFragment(html));
		
	var messagesDiv = document.getElementById(this._messagesDivId);
	this._renderMessages(conv, messagesDiv);
	
	// We want the messages container DIV to scroll independently of the header DIV above
	// it and the reply DIV below it.
	var replyDiv = document.getElementById(this._replyDivId);
	var replyHeight = Dwt.getSize(replyDiv).y;
	var myHeight = this.getSize().y;
	Dwt.setSize(messagesDiv, Dwt.DEFAULT, myHeight - replyHeight);
	
	if (callback) {
		callback();
	}
};

ZmConvView2.prototype._renderMessages =
function(conv, container) {

	var msgs = conv.getMsgList();
	var params = {
		parent:			this,
		parentElement:	container,
		controller:		this._controller,
		mode:			this._mode,
		isSolo:			(msgs.length == 1)
	}
	var isOdd = true;
	for (var i = 0, len = msgs.length; i < len; i++) {
		var msg = msgs[i];
		params.msgId = msg.id;
		params.isOdd = isOdd;
		params.actionsMenu = this._actionsMenu;
		var msgView = new ZmMailMsgCapsuleView(params);
		msgView.set(msg);
		isOdd = !isOdd;
	}
};

ZmConvView2.prototype._listenerProxy =
function(listener, item, ev) {
	this._controller._mailListView._selectedMsg = this.msg;
	var retVal = listener.handleEvent ? listener.handleEvent(ev) : listener(ev);
	this._controller._mailListView._selectedMsg = null;
	return retVal;
};

ZmConvView2.prototype.addInviteReplyListener =
function(listener) {
//	this.addListener(ZmInviteMsgView.REPLY_INVITE_EVENT, listener);
};

ZmConvView2.prototype.addShareListener =
function(listener) {
//	this.addListener(ZmMailMsgView.SHARE_EVENT, listener);
};

ZmConvView2.prototype.getConv =
function() {
	return this._conv;
};

ZmConvView2.prototype.resetMsg =
function(newMsg) {
};


/**
 * 
 * 
 * @param params
 */
ZmMailMsgCapsuleView = function(params) {

	params.className = params.className || "ZmMailMsgCapsuleView";
	this._msgId = params.msgId;
	params.id = this._getViewId();
	ZmMailMsgView.call(this, params);

	this._isOdd = params.isOdd;
	this._mode = params.mode;
	this._controller = params.controller;
	this._container = params.container;
	this._isSolo = params.isSolo;
	this._actionsMenu = params.actionsMenu;
};

ZmMailMsgCapsuleView.prototype = new ZmMailMsgView;
ZmMailMsgCapsuleView.prototype.constructor = ZmMailMsgCapsuleView;

ZmMailMsgCapsuleView.prototype.ZmMailMsgCapsuleView = true;
ZmMailMsgCapsuleView.prototype.toString = function() { return "ZmMailMsgCapsuleView"; };

ZmMailMsgCapsuleView.prototype._getViewId =
function() {
	return ZmId.VIEW_MSG_CAPSULE + this._msgId;
};

ZmMailMsgCapsuleView.prototype._getContainer =
function() {
	return this._container;
};

ZmMailMsgCapsuleView.prototype.set =
function(msg, force) {
	this._expanded = this._isSolo || msg.isUnread;
	ZmMailMsgView.prototype.set.apply(this, arguments);
};

ZmMailMsgCapsuleView.prototype._renderMessage =
function(msg, container, callback) {
	
	if (this._expanded) {
		this._renderMessageHeader(msg, container);
		this._renderMessageBody(msg, container, callback);
		this._renderMessageFooter(msg, container);
	}
	else {
		this._renderMessageHeader(msg, container);
	}
};

ZmMailMsgCapsuleView.prototype._renderMessageHeader =
function(msg, container) {

	this._tableRowId = Dwt.getNextId();
	this._expandIconId = Dwt.getNextId();

	var expandIcon = AjxImg.getImageHtml("NodeCollapsed", null, ["id='", this._expandIconId, "'"].join(""));
	var dateFormatter = AjxDateFormat.getDateTimeInstance(AjxDateFormat.LONG, AjxDateFormat.SHORT);
	var dateString = msg.sentDate ? dateFormatter.format(new Date(msg.sentDate)) : dateFormatter.format(new Date(msg.date));

	this._headerId = ZmId.getViewId(this._viewId, ZmId.MV_MSG_HEADER, this._mode);
	
	var subs = {
		headerId:		this._headerId,
		parityClass:	this._isOdd ? "OddMsg" : "EvenMsg",
		tableRowId:		this._tableRowId,
		unreadClass:	this._msg.isUnread ? "Unread" : "",
		expandIcon:		expandIcon,
		from:			msg.getAddress(AjxEmailAddress.FROM).toString(true),
		date:			dateString
	}
	var html = AjxTemplate.expand("mail.Message#Conv2MsgHeader", subs);
	this.getHtmlElement().appendChild(Dwt.parseHtmlFragment(html));
	
	var expandIcon = document.getElementById(this._expandIconId);
	if (expandIcon) {
		expandIcon.onclick = this._toggleExpansion.bind(this);
	}
};

ZmMailMsgCapsuleView.prototype._getBodyContent =
function(bodyPart) {
	var chunks =  AjxStringUtil.getTopLevel(bodyPart.content);
	return chunks[0];
};

ZmMailMsgCapsuleView.prototype._renderMessageFooter =
function(msg, container) {
	
	this._buttonCellId = Dwt.getNextId();
	var replyLinkId = Dwt.getNextId();
	this._footerId = ZmId.getViewId(this._viewId, ZmId.MV_MSG_FOOTER, this._mode);

	var subs = {
		footerId:		this._footerId,
		parityClass:	this._isOdd ? "OddMsg" : "EvenMsg",
		replyLinkId:	replyLinkId,
		buttonCellId:	this._buttonCellId
	}
	var html = AjxTemplate.expand("mail.Message#Conv2MsgFooter", subs);
	this.getHtmlElement().appendChild(Dwt.parseHtmlFragment(html));
	
	var replyLink = document.getElementById(replyLinkId);
	if (replyLink) {
		replyLink.onclick = this._handleReplyLink.bind(this);
	}
	
	var buttonId = ZmId.getButtonId(this._mode, this._msg.id, ZmId.OP_ACTIONS_MENU);
	var ab = this._actionsButton = new DwtButton({parent:this, id:buttonId});
	ab.setImage("Preferences");
	ab.setMenu(this._actionsMenu);
	ab.reparentHtmlElement(this._buttonCellId);
	ab.addDropDownSelectionListener(this._setActionMenu.bind(this));
	
	this._resetOperations();
};

ZmMailMsgCapsuleView.prototype._setActionMenu =
function(ev) {
	this._actionsMenu.parent = this._actionsButton;
	this._actionsButton._toggleMenu();
};

/**
 * Expand the msg view by hiding/showing the body and footer. If the msg hasn't
 * been rendered, we need to render it to expand it.
 */
ZmMailMsgCapsuleView.prototype._toggleExpansion =
function() {
	
	var body = document.getElementById(this._msgBodyDivId);
	var footer = document.getElementById(this._footerId);
	if (this._expanded) {
		Dwt.setVisible(body, false);
		Dwt.setVisible(footer, false);
	}
	else {
		if (body && footer) {
			Dwt.setVisible(body, true);
			Dwt.setVisible(footer, true);
		}
		else {
			this.getHtmlElement().innerHTML = "";
			this._renderMessage(this._msg);
		}
	}
	this._expanded = !this._expanded;
};

ZmMailMsgCapsuleView.prototype._setTags =
function(msg) {
};

ZmMailMsgCapsuleView.prototype._getBodyClass =
function() {
	return "MsgBody " + (this._isOdd ? "OddMsg" : "EvenMsg");
};

ZmMailMsgCapsuleView.prototype._handleReplyLink =
function(listener, item, ev) {
	this._controller._mailListView._selectedMsg = this._msg;
	this._controller._doAction({action:ZmOperation.REPLY});
	this._controller._mailListView._selectedMsg = null;
};

ZmMailMsgCapsuleView.prototype._msgChangeListener =
function(ev) {

	if (ev.type != ZmEvent.S_MSG) { return; }

	if (ev.event == ZmEvent.E_DELETE || ev.event == ZmEvent.E_MOVE) {
		
	}
	else if (ev.event == ZmEvent.E_FLAGS) {
		var flags = ev.getDetail("flags");
		for (var j = 0; j < flags.length; j++) {
			var flag = flags[j];
			if (flag == ZmItem.FLAG_UNREAD) {
				var row = document.getElementById(this._tableRowId);
				if (row) {
					var on = this._msg[ZmItem.FLAG_PROP[flag]];
					row.className = on ? "Unread" : "";
				}
			}
		}
	}
	else {
		ZmMailMsgView.prototype._msgChangeListener.apply(this, arguments);
	}

	this._resetOperations();
};

ZmMailMsgCapsuleView.prototype._resetOperations =
function() {
	this._controller._mailListView._selectedMsg = this._msg;
	this._controller._resetOperations(this._actionsMenu, 1);
	this._actionsMenu.enable(ZmOperation.MARK_READ, this._msg.isUnread);
	this._actionsMenu.enable(ZmOperation.MARK_UNREAD, !this._msg.isUnread);
	this._controller._mailListView._selectedMsg = null;
};
