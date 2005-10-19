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
	var xformDef = ZmRevokeShareDialog._XFORM_DEF;
	var xmodelDef = ZmRevokeShareDialog._XMODEL_DEF;
	className = className || "ZmRevokeShareDialog";
	var title = ZmMsg.revokeShare;
	var buttons = [ DwtDialog.YES_BUTTON, DwtDialog.NO_BUTTON ];
	DwtXFormDialog.call(this, xformDef, xmodelDef, parent, className, title, buttons);
	
	this._appCtxt = appCtxt;

	// create formatters
	this._formatter = new AjxMessageFormat(ZmMsg.revokeShareConfirm);
}
ZmRevokeShareDialog.prototype = new DwtXFormDialog;
ZmRevokeShareDialog.prototype.constructor = ZmRevokeShareDialog;

// Constants

ZmRevokeShareDialog._MAIL_STANDARD = 'S';
ZmRevokeShareDialog._MAIL_QUICK = 'Q';
ZmRevokeShareDialog._MAIL_COMPOSE = 'C';

ZmRevokeShareDialog._XFORM_DEF = { items: [
	{ type: _OUTPUT_, labelLocation: _NONE_, ref: "msg", numCols: 2, colSpan: "*" },
	{ type: _SEPARATOR_ },
	{type:_GROUP_, colSpan:'*', width:"100%", numCols:2, colSizes:[35,'*'], items:[
			{type:_CHECKBOX_, ref:"sendMail", trueValue:true, falseValue:false, label: ZmMsg.sendMailAboutShare },
			{type:_SPACER_, height:3, relevant:"get('sendMail')"},
			{type:_DWT_SELECT_, ref:"mailType", relevant:"get('sendMail')", label:"", choices: [
				{value: ZmRevokeShareDialog._MAIL_STANDARD, label: ZmMsg.sendStandardMailAboutShare },
				{value: ZmRevokeShareDialog._MAIL_QUICK, label: ZmMsg.sendStandardMailAboutSharePlusNote },
				{value: ZmRevokeShareDialog._MAIL_COMPOSE, label: ZmMsg.sendComposedMailAboutShare }
			]},
			{type:_OUTPUT_, label: "", //width: "250",
				value: ZmMsg.sendMailAboutShareNote,
				relevant: "get('sendMail') && (get('mailType') == ZmRevokeShareDialog._MAIL_STANDARD || get('mailType') == ZmRevokeShareDialog._MAIL_QUICK)", revelantBehavior: _HIDE_
			},
			{type:_TEXTAREA_, ref:"quickReply", relevant:"get('sendMail') && get('mailType') == ZmRevokeShareDialog._MAIL_QUICK", width:"95%", height:50, label:""}
		]
	}
]};
ZmRevokeShareDialog._XMODEL_DEF = { items: [
	{ id: "msg", ref: "msg", type: _STRING_ },
	{ id: "sendMail", ref: "sendMail", type: _ENUM_, choices: [ true, false ] },
	{ id: "mailType", ref: "mailType", type: _ENUM_, choices: [ 
		ZmRevokeShareDialog._MAIL_STANDARD, ZmRevokeShareDialog._MAIL_QUICK, ZmRevokeShareDialog._MAIL_COMPOSE
	] },
	{ id: "quickReply", ref: "quickReply", type: _STRING_ }
]};

// Public methods

ZmRevokeShareDialog.prototype.setShareInfo = function(organizerShare) { 
	var instance = {
		msg: "<b>" + this._formatter.format(organizerShare.grantee.name) + "</b>",
		share: organizerShare,
		sendMail: true,
		mailType: ZmRevokeShareDialog._MAIL_STANDARD,
		quickReply: ''
	};
	this.setInstance(instance);
}

ZmRevokeShareDialog.prototype.popup = function(loc) {
	DwtXFormDialog.prototype.popup.call(this, loc);
	this.setButtonEnabled(DwtDialog.YES_BUTTON, true);
}

// Protected methods

ZmRevokeShareDialog.prototype._handleYesButton = function(event) {
	var instance = this._xform.getInstance();
	var share = instance.share;

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
	
	// hide this dialog
	this.popdown();

	// send message
	if (instance.sendMail) {
		// initialize rest of share information
		share.grantor.id = this._appCtxt.get(ZmSetting.USERID);
		share.grantor.name = this._appCtxt.get(ZmSetting.DISPLAY_NAME);
		share.link.id = share.organizer.id;
		share.link.name = share.organizer.name;
		share.link.view = ZmOrganizer.getViewName(share.organizer.type);
		if (instance.mailType == ZmRevokeShareDialog._MAIL_QUICK) {
			share.notes =  instance.quickReply;
		}
	
		// compose in new window
		if (instance.mailType == ZmRevokeShareDialog._MAIL_COMPOSE) {
			ZmShareInfo.composeMessage(this._appCtxt, ZmShareInfo.DELETE, share);
		}
		// send email
		else {
			ZmShareInfo.sendMessage(this._appCtxt, ZmShareInfo.DELETE, share);
		}
	}

	// default processing
	DwtXFormDialog.prototype._handleYesButton.call(this, event);
}

ZmRevokeShareDialog.prototype._getSeparatorTemplate = function() {
	return "";
}
