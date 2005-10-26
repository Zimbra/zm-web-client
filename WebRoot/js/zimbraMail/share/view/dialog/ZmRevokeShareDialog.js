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
 * The Original Code is: Zimbra Collaboration Suite.
 * 
 * The Initial Developer of the Original Code is Zimbra, Inc.
 * Portions created by Zimbra are Copyright (C) 2005 Zimbra, Inc.
 * All Rights Reserved.
 * 
 * Contributor(s):
 * 
 * ***** END LICENSE BLOCK *****
 */

function ZmRevokeShareDialog(appCtxt, parent, className) {
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
}
ZmRevokeShareDialog.prototype = new DwtDialog;
ZmRevokeShareDialog.prototype.constructor = ZmRevokeShareDialog;

// Constants

// Data

ZmRevokeShareDialog.prototype._confirmMsgEl;
ZmRevokeShareDialog.prototype._reply;

// Public methods

ZmRevokeShareDialog.prototype.setShareInfo = function(organizerShare) { 
	this._shareInfo = AjxUtil.createProxy(organizerShare, 1);
	
	var params = organizerShare.grantee.name;
	var message = this._formatter.format(params);
	this._confirmMsgEl.innerHTML = message;
};

ZmRevokeShareDialog.prototype.popup = function(loc) {
	this._reply.setReply(true);
	this._reply.setReplyType(ZmShareReply.STANDARD);
	this._reply.setReplyNote("");

	DwtDialog.prototype.popup.call(this, loc);
	this.setButtonEnabled(DwtDialog.YES_BUTTON, true);
};

// Protected methods

ZmRevokeShareDialog.prototype._handleYesButton = function(event) {
	var share = this._shareInfo;

	// revoke share
	try {
		share.revoke();
	}
	catch (ex) {
		var message = ZmMsg.unknownError;
		// TODO: handle specific error types
		
		var appController = this._appCtxt.getAppController();
		appController.popupErrorDialog(message, ex);
		return;
	}
	
	// send message
	if (this._reply.getReply()) {
		
		// initialize rest of share information
		share.grantee.email = share.grantee.name;
		share.grantor.id = this._appCtxt.get(ZmSetting.USERID);
		share.grantor.email = this._appCtxt.get(ZmSetting.USERNAME);
		share.grantor.name = this._appCtxt.get(ZmSetting.DISPLAY_NAME);
		share.link.id = share.organizer.id;
		share.link.name = share.organizer.name;
		share.link.view = ZmOrganizer.getViewName(share.organizer.type);

		var replyType = this._reply.getReplyType();
		share.notes = replyType == ZmShareReply.QUICK ? this._reply.getReplyNote() : "";
	
		// compose in new window
		if (replyType == ZmShareReply.COMPOSE) {
			ZmShareInfo.composeMessage(this._appCtxt, ZmShareInfo.DELETE, share);
		}
		// send email
		else {
			ZmShareInfo.sendMessage(this._appCtxt, ZmShareInfo.DELETE, share);
		}
	}

	this.popdown();
};

ZmRevokeShareDialog.prototype._createView = function() {
	var document = this.getDocument();
	
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

ZmRevokeShareDialog.prototype._getSeparatorTemplate = function() {
	return "";
};
