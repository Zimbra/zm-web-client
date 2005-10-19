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

function ZmDeclineShareDialog(appCtxt, parent, className) {
	var xformDef = ZmDeclineShareDialog._XFORM_DEF;
	var xmodelDef = ZmDeclineShareDialog._XMODEL_DEF;
	className = className || "ZmDeclineShareDialog";
	var title = ZmMsg.declineShare;
	var buttons = [ DwtDialog.YES_BUTTON, DwtDialog.NO_BUTTON ];
	DwtXFormDialog.call(this, xformDef, xmodelDef, parent, className, title, buttons);

	this._appCtxt = appCtxt;
	
	// create formatters
	this._formatter = new AjxMessageFormat(ZmMsg.declineShareConfirm);
}
ZmDeclineShareDialog.prototype = new DwtXFormDialog;
ZmDeclineShareDialog.prototype.constructor = ZmDeclineShareDialog;

// Constants

ZmDeclineShareDialog.DECLINE = "decline";

ZmDeclineShareDialog._MAIL_STANDARD = 'S';
ZmDeclineShareDialog._MAIL_QUICK = 'Q';
ZmDeclineShareDialog._MAIL_COMPOSE = 'C';

ZmDeclineShareDialog._XFORM_DEF = { items: [
	{ type: _OUTPUT_, labelLocation: _NONE_, ref: "msg", numCols: 2, colSpan: "*" },
	{ type: _SEPARATOR_ },
	{type:_GROUP_, colSpan:'*', width:"100%", numCols:2, colSizes:[35,'*'], items:[
			{type:_CHECKBOX_, ref:"sendMail", trueValue:true, falseValue:false, label: ZmMsg.sendMailAboutShareDecline },
			{type:_SPACER_, height:3, relevant:"get('sendMail')"},
			{type:_DWT_SELECT_, ref:"mailType", relevant:"get('sendMail')", label:"", choices: [
				{value: ZmDeclineShareDialog._MAIL_STANDARD, label: ZmMsg.sendStandardMailAboutShare },
				{value: ZmDeclineShareDialog._MAIL_QUICK, label: ZmMsg.sendStandardMailAboutSharePlusNote },
				{value: ZmDeclineShareDialog._MAIL_COMPOSE, label: ZmMsg.sendComposedMailAboutShare }
			]},
			{type:_OUTPUT_, label: "", //width: "250",
				value: ZmMsg.sendMailAboutShareNote,
				relevant: "get('sendMail') && (get('mailType') == ZmRevokeShareDialog._MAIL_STANDARD || get('mailType') == ZmRevokeShareDialog._MAIL_QUICK)", revelantBehavior: _HIDE_
			},
			{type:_TEXTAREA_, ref:"quickReply", relevant:"get('sendMail') && get('mailType') == ZmDeclineShareDialog._MAIL_QUICK", width:"95%", height:50, label:""}
		]
	}
]};
ZmDeclineShareDialog._XMODEL_DEF = { items: [
	{ id: "msg", ref: "msg", type: _STRING_ },
	{ id: "sendMail", ref: "sendMail", type: _ENUM_, choices: [ true, false ] },
	{ id: "mailType", ref: "mailType", type: _ENUM_, choices: [ 
		ZmDeclineShareDialog._MAIL_STANDARD, ZmDeclineShareDialog._MAIL_QUICK, ZmDeclineShareDialog._MAIL_COMPOSE
	] },
	{ id: "quickReply", ref: "quickReply", type: _STRING_ }
]};

// Public methods

ZmDeclineShareDialog.prototype.setShareInfo = function(shareInfo) { 
	var params = [ shareInfo.grantee.name, shareInfo.link.name ];
	var message = "<b>" + this._formatter.format(params) + "</b>";
	
	var instance = {
		msg: message,
		share: shareInfo,
		sendMail: true,
		mailType: ZmRevokeShareDialog._MAIL_STANDARD,
		quickReply: ''
	};
	this.setInstance(instance);
}

ZmDeclineShareDialog.prototype.popup = function(loc) {
	DwtXFormDialog.prototype.popup.call(this, loc);
	this.setButtonEnabled(DwtDialog.YES_BUTTON, true);
}

ZmDeclineShareDialog.prototype.setDeclineListener = function(listener) {
	this.removeAllListeners(ZmDeclineShareDialog.DECLINE);
	if (listener) this.addListener(ZmDeclineShareDialog.DECLINE, listener);
}

// Protected methods

ZmDeclineShareDialog.prototype._handleYesButton = function(event) {
	var instance = this._xform.getInstance();

	// send mail
	if (instance.sendMail) {
		var share = instance.share;

		// compose in new window
		if (instance.mailType == ZmDeclineShareDialog._MAIL_COMPOSE) {
			ZmShareInfo.composeMessage(this._appCtxt, ZmShareInfo.DECLINE, share);
		}
		// send email
		else {
			ZmShareInfo.sendMessage(this._appCtxt, ZmShareInfo.DECLINE, share);
		}
	}
	
	// notify decline listener and clear
	this.notifyListeners(ZmDeclineShareDialog.DECLINE, event);
	this.setDeclineListener(null);

	// default processing
	DwtXFormDialog.prototype._handleYesButton.call(this, event);
}

ZmDeclineShareDialog.prototype._getSeparatorTemplate = function() {
	return "";
}
