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

ZmRevokeShareDialog = function(appCtxt, parent, className) {
	className = className || "ZmRevokeShareDialog";
	var title = ZmMsg.revokeShare;
	var buttons = [ DwtDialog.YES_BUTTON, DwtDialog.NO_BUTTON ];
	DwtDialog.call(this, parent, className, title, buttons);
	this.setButtonListener(DwtDialog.YES_BUTTON, new AjxListener(this, this._handleYesButton));
	
	this._appCtxt = appCtxt;

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
		share.grantor.id = this._appCtxt.get(ZmSetting.USERID);
		share.grantor.email = this._appCtxt.get(ZmSetting.USERNAME);
		share.grantor.name = this._appCtxt.get(ZmSetting.DISPLAY_NAME) || share.grantor.email;
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
