/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2005, 2006, 2007, 2008, 2009, 2010 Zimbra, Inc.
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

/**
 * @overview
 */

/**
 * Creates an "decline share" dialog.
 * @class
 * This class represents "decline share" dialog.
 * 
 * @param	{DwtControl}	shell		the parent
 * @param	{String}	className		the class name
 * 
 * @extends		DwtDialog
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

/**
 * Pops-up the dialog.
 * 
 * @param	{ZmShare}		share		the share
 * @param	{String}		fromAddr	the from address
 */
ZmDeclineShareDialog.prototype.popup =
function(share, fromAddr) {
	this._share = share;
	this._fromAddr = fromAddr;
	var message = this._formatter.format([share.grantor.name, share.link.name]);
	this._confirmMsgEl.innerHTML = AjxStringUtil.htmlEncode(message);

	this._reply.setReplyType(ZmShareReply.STANDARD);
	this._reply.setReplyNote("");

	DwtDialog.prototype.popup.call(this);
};

/**
 * Sets the decline listener.
 * 
 * @param	{AjxListener}		listener		the listener
 */
ZmDeclineShareDialog.prototype.setDeclineListener =
function(listener) {
	this.removeAllListeners(ZmShare.DECLINE);
	if (listener) {
		this.addListener(ZmShare.DECLINE, listener);
	}
};

// Protected methods

ZmDeclineShareDialog.prototype._handleYesButton =
function(event) {
	// send mail
	var replyType = this._reply.getReplyType();

	if (replyType != ZmShareReply.NONE) {
		this._share.notes = (replyType == ZmShareReply.QUICK) ? this._reply.getReplyNote(): "";

		if (replyType == ZmShareReply.COMPOSE) {
			this._share.composeMessage(ZmShare.DECLINE, null, this._fromAddr);
		} else {
			this._share.sendMessage(ZmShare.DECLINE, null, this._fromAddr);
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
