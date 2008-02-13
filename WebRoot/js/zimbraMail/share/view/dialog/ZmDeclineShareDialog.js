/*
 * ***** BEGIN LICENSE BLOCK *****
 * 
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2005, 2006, 2007 Zimbra, Inc.
 * 
 * The contents of this file are subject to the Yahoo! Public License
 * Version 1.0 ("License"); you may not use this file except in
 * compliance with the License.  You may obtain a copy of the License at
 * http://www.zimbra.com/license.
 * 
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * 
 * ***** END LICENSE BLOCK *****
 */

ZmDeclineShareDialog = function(parent, className) {
	className = className || "ZmDeclineShareDialog";
	var title = ZmMsg.declineShare;
	var buttons = [ DwtDialog.YES_BUTTON, DwtDialog.NO_BUTTON ];
	DwtDialog.call(this, {parent:parent, className:className, title:title, standardButtons:buttons});
	this.setButtonListener(DwtDialog.YES_BUTTON, new AjxListener(this, this._handleYesButton));

	// create controls
	this._confirmMsgEl = document.createElement("DIV");
	this._confirmMsgEl.style.fontWeight = "bold";
	this._confirmMsgEl.style.marginBottom = "0.25em";
	this._reply = new ZmShareReply(this);
	
	// create view
	var view = new DwtComposite(this);
	var element = view.getHtmlElement();
	element.appendChild(this._confirmMsgEl);
	element.appendChild(this._reply.getHtmlElement());
	this.setView(view);

	// create formatters
	this._formatter = new AjxMessageFormat(ZmMsg.declineShareConfirm);
};

ZmDeclineShareDialog.prototype = new DwtDialog;
ZmDeclineShareDialog.prototype.constructor = ZmDeclineShareDialog;

// Public methods

ZmDeclineShareDialog.prototype.popup =
function(share) {
	this._share = share;
	var params = [ share.grantee.name, share.link.name ];
	var message = this._formatter.format(params);
	this._confirmMsgEl.innerHTML = AjxStringUtil.htmlEncode(message);
	
	this._reply.setReplyType(ZmShareReply.STANDARD);
	this._reply.setReplyNote("");
	
	DwtDialog.prototype.popup.call(this);
};

ZmDeclineShareDialog.prototype.setDeclineListener =
function(listener) {
	this.removeAllListeners(ZmShare.DECLINE);
	if (listener) this.addListener(ZmShare.DECLINE, listener);
};

// Protected methods

ZmDeclineShareDialog.prototype._handleYesButton =
function(event) {
	// send mail
	var replyType = this._reply.getReplyType();

	if (replyType != ZmShareReply.NONE) {
		this._share.notes = (replyType == ZmShareReply.QUICK) ? this._reply.getReplyNote(): "";

		if (replyType == ZmShareReply.COMPOSE) {
			this._share.composeMessage(ZmShare.DECLINE);
		} else {
			this._share.sendMessage(ZmShare.DECLINE);
		}
	}
	
	// notify decline listener and clear
	this.notifyListeners(ZmShare.DECLINE, event);
	this.setDeclineListener(null);

	this.popdown();
};

ZmDeclineShareDialog.prototype._getSeparatorTemplate =
function() {
	return "";
};
