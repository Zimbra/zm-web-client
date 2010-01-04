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

ZmRevokeShareDialog = function(parent, className) {
	className = className || "ZmRevokeShareDialog";
	var title = ZmMsg.revokeShare;
	var buttons = [ DwtDialog.YES_BUTTON, DwtDialog.NO_BUTTON ];
	DwtDialog.call(this, {parent:parent, className:className, title:title, standardButtons:buttons});
	this.setButtonListener(DwtDialog.YES_BUTTON, new AjxListener(this, this._handleYesButton));
	
	var view = this._createView();
	this.setView(view);

	// create formatters
	this._formatter = new AjxMessageFormat(ZmMsg.revokeShareConfirm);
};

ZmRevokeShareDialog.prototype = new DwtDialog;
ZmRevokeShareDialog.prototype.constructor = ZmRevokeShareDialog;

// Public methods

ZmRevokeShareDialog.prototype.popup =
function(share) {
	this._share = share;

	var isPubShare = share.isPublic();

	var params = isPubShare ? ZmMsg.shareWithPublic : (share.grantee.name || share.grantee.id);
	var message = this._formatter.format(params);
	this._confirmMsgEl.innerHTML = message;

	this._reply.setReplyType(ZmShareReply.STANDARD);
	this._reply.setReplyNote("");
	this._reply.setVisible(!isPubShare);

	DwtDialog.prototype.popup.call(this);
	this.setButtonEnabled(DwtDialog.YES_BUTTON, true);
};

// Protected methods

ZmRevokeShareDialog.prototype._handleYesButton =
function() {
	var callback = new AjxCallback(this, this._yesButtonCallback);
	this._share.revoke(callback);
};

ZmRevokeShareDialog.prototype._yesButtonCallback =
function() {
	var share = this._share;
	var replyType = this._reply.getReplyType();
	var sendMail = !(share.isAll() || share.isPublic()); 
	if (replyType != ZmShareReply.NONE && sendMail) {
		// initialize rest of share information
		share.grantee.email = share.grantee.name || share.grantee.id;
		share.grantor.id = appCtxt.get(ZmSetting.USERID);
		share.grantor.email = appCtxt.get(ZmSetting.USERNAME);
		share.grantor.name = appCtxt.get(ZmSetting.DISPLAY_NAME) || share.grantor.email;
		share.link.id = share.object.id;
		share.link.name = share.object.name;
		share.link.view = ZmOrganizer.getViewName(share.object.type);

		share.notes = (replyType == ZmShareReply.QUICK) ? this._reply.getReplyNote() : "";
	
		if (replyType == ZmShareReply.COMPOSE) {
			share.composeMessage(ZmShare.DELETE);
		} else {
			share.sendMessage(ZmShare.DELETE);
		}
	}

	this.popdown();
};

ZmRevokeShareDialog.prototype._createView =
function() {
	this._confirmMsgEl = document.createElement("DIV");
	this._confirmMsgEl.style.fontWeight = "bold";
	this._confirmMsgEl.style.marginBottom = "0.25em";
	
	var view = new DwtComposite(this);
	this._reply = new ZmShareReply(view);
	
	var element = view.getHtmlElement();
	element.appendChild(this._confirmMsgEl);
	element.appendChild(this._reply.getHtmlElement());

	return view;
};

ZmRevokeShareDialog.prototype._getSeparatorTemplate =
function() {
	return "";
};
