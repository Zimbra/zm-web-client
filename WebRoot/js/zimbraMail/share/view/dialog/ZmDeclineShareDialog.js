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

function ZmDeclineShareDialog(appCtxt, parent, className) {
	className = className || "ZmDeclineShareDialog";
	var title = ZmMsg.declineShare;
	var buttons = [ DwtDialog.YES_BUTTON, DwtDialog.NO_BUTTON ];
	DwtDialog.call(this, parent, className, title, buttons);
	this.setButtonListener(DwtDialog.YES_BUTTON, new AjxListener(this, this._handleYesButton));

	this._appCtxt = appCtxt;
	
	// create controls
	var document = this.getDocument();
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
}
ZmDeclineShareDialog.prototype = new DwtDialog;
ZmDeclineShareDialog.prototype.constructor = ZmDeclineShareDialog;

// Data

ZmDeclineShareDialog.prototype._confirmMsgEl;
ZmDeclineShareDialog.prototype._reply;

// Public methods

ZmDeclineShareDialog.prototype.setShareInfo = function(shareInfo) {
	this._shareInfo = shareInfo;
}

ZmDeclineShareDialog.prototype.popup = function(loc) {
	var params = [ this._shareInfo.grantee.name, this._shareInfo.link.name ];
	var message = this._formatter.format(params);
	this._confirmMsgEl.innerHTML = AjxStringUtil.htmlEncode(message);
	
	this._reply.setReply(true);
	this._reply.setReplyType(ZmShareReply.STANDARD);
	this._reply.setReplyNote("");
	
	DwtDialog.prototype.popup.call(this, loc);
}

ZmDeclineShareDialog.prototype.setDeclineListener = function(listener) {
	this.removeAllListeners(ZmShareInfo.DECLINE);
	if (listener) this.addListener(ZmShareInfo.DECLINE, listener);
}

// Protected methods

ZmDeclineShareDialog.prototype._handleYesButton = function(event) {
	// send mail
	if (this._reply.getReply()) {
		var replyType = this._reply.getReplyType();

		// create share info proxy
		var proxy = AjxUtil.createProxy(this._shareInfo);
		proxy.notes = replyType == ZmShareReply.QUICK ? this._reply.getReplyNote(): "";

		// compose in new window
		if (replyType == ZmShareReply.COMPOSE) {
			ZmShareInfo.composeMessage(this._appCtxt, ZmShareInfo.DECLINE, proxy);
		}
		// send email
		else {
			ZmShareInfo.sendMessage(this._appCtxt, ZmShareInfo.DECLINE, proxy);
		}
	}
	
	// notify decline listener and clear
	this.notifyListeners(ZmShareInfo.DECLINE, event);
	this.setDeclineListener(null);

	this.popdown();
}

ZmDeclineShareDialog.prototype._getSeparatorTemplate = function() {
	return "";
}
