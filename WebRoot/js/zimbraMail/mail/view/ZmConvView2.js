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
//	params.className = params.className || "ZmMailMsgView";
	ZmMailItemView.call(this, params);

	this._mode = params.mode;
	this._controller = params.controller;
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
		mode:			this._mode
	}
	var isOdd = true;
	for (var i = 0, len = msgs.length; i < len; i++) {
		var msg = msgs[i];
		params.msg = msg;
		params.isOdd = isOdd;
		var msgView = new ZmMailMsgCapsuleView(params);
		msgView.set(msg);
		isOdd = !isOdd;
	}
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



ZmMailMsgCapsuleView = function(params) {

//	params.className = (params.className || "ZmMailMsgCapsuleView") + " " + (params.isOdd ? "OddMsg" : "EvenMsg");
	params.className = params.className || "ZmMailMsgCapsuleView";
	params.id = ZmId.getViewId(this._viewId, params.msg.id, this._mode);
	this.msg = params.msg;
	ZmMailMsgView.call(this, params);

	this._isOdd = params.isOdd;
	this._mode = params.mode;
	this._controller = params.controller;
	this._container = params.container;
};

ZmMailMsgCapsuleView.prototype = new ZmMailMsgView;
ZmMailMsgCapsuleView.prototype.constructor = ZmMailMsgCapsuleView;

ZmMailMsgCapsuleView.prototype.ZmMailMsgCapsuleView = true;
ZmMailMsgCapsuleView.prototype.toString = function() { return "ZmMailMsgCapsuleView"; };

ZmMailMsgCapsuleView.prototype._getViewId =
function() {
	return ZmId.VIEW_MSG_CAPSULE + this.msg.id;
};

ZmMailMsgCapsuleView.prototype._getContainer =
function() {
	return this._container;
};

ZmMailMsgCapsuleView.prototype._renderMessageHeader =
function(msg, container) {

	var dateFormatter = AjxDateFormat.getDateTimeInstance(AjxDateFormat.LONG, AjxDateFormat.SHORT);
	var dateString = msg.sentDate ? dateFormatter.format(new Date(msg.sentDate)) : dateFormatter.format(new Date(msg.date));
	var subs = {
		id:				this._htmlElId,
		headerClass:	this._isOdd ? "OddMsg" : "EvenMsg",
		unreadClass:	this.msg.isUnread ? "Unread" : "",
		expandIcon:		AjxImg.getImageHtml("NodeCollapsed"),
		from:			msg.getAddress(AjxEmailAddress.FROM).toString(true),
		date:			dateString
	}
	var html = AjxTemplate.expand("mail.Message#Conv2MsgHeader", subs);
	this.getHtmlElement().appendChild(Dwt.parseHtmlFragment(html));
};

ZmMailMsgCapsuleView.prototype._getBodyContent =
function(bodyPart) {
	var chunks =  AjxStringUtil.getTopLevel(bodyPart.content);
	return chunks[0];
};

ZmMailMsgCapsuleView.prototype._setTags =
function(msg) {
};

ZmMailMsgCapsuleView.prototype._getBodyClass =
function() {
	return "MsgBody " + (this._isOdd ? "OddMsg" : "EvenMsg");
};
