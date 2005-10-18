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
	DwtXFormDialog.call(this, xformDef, xmodelDef, parent, className);
	
	this.setTitle(ZmMsg.revokeShare);
	
	this._appCtxt = appCtxt;
	
	// create formatters
	this._textFormatter = new AjxMessageFormat(ZmMsg.shareRevokedText);
	this._htmlFormatter = new AjxMessageFormat(ZmMsg.shareRevokedHtml);
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

ZmRevokeShareDialog.prototype.setShareInfo = function(shareInfo) { 
	if (!this._formatter) {
		this._formatter = new AjxMessageFormat(ZmMsg.revokeShareConfirm);
	}
	var message = "<b>" + this._formatter.format(shareInfo.granteeName) + "</b>";
	
	var instance = {
		msg: message,
		share: shareInfo,
		sendMail: true,
		mailType: ZmRevokeShareDialog._MAIL_STANDARD,
		quickReply: ''
	};
	this.setInstance(instance);
}

ZmRevokeShareDialog.prototype.popup = function(loc) {
	DwtXFormDialog.prototype.popup.call(this, loc);
	this.setButtonEnabled(DwtDialog.OK_BUTTON, true);
}

// Protected methods

ZmRevokeShareDialog.prototype._handleOkButton = function(event) {
	var instance = this._xform.getInstance();
	var share = instance.share;

	// revoke share
	try {
		share.revoke();
	}
	catch (ex) {
		var message = Ajx.unknownError;
		// TODO: handle specific error types
		
		var appController = this._appCtxt.getAppController();
		appController.popupErrorDialog(message, ex);
		return;
	}
	
	// hide this dialog
	this.popdown();

	// is there anything to do?
	if (!instance.sendMail) {
		return;
	}

	// generate message
	var textPart = this._generateTextPart(share);
	var htmlPart = this._generateHtmlPart(share);
	var xmlPart = this._generateXmlPart(share);
	
	var top = new ZmMimePart();
	top.setContentType(ZmMimeTable.MULTI_ALT);
	top.children.add(textPart);
	top.children.add(htmlPart);
	top.children.add(xmlPart);
	
	var msg = new ZmMailMsg(this._appCtxt);
	msg.setAddress(ZmEmailAddress.TO, new ZmEmailAddress(share.granteeName));
	msg.setSubject(ZmMsg.shareRevokedSubject);

	// compose in new window
	if (instance.mailType == ZmRevokeShareDialog._MAIL_COMPOSE) {
		// initialize compose message
		var action = ZmOperation.SHARE;
		var inNewWindow = true;
		var toOverride = null;
		var subjOverride = null;
		var extraBodyText = null;
	
		var mailApp = this._appCtxt.getApp(ZmZimbraMail.MAIL_APP);
		var composeController = mailApp.getComposeController();

		msg.setBodyParts([ textPart.node, htmlPart.node, xmlPart.node ]);
		composeController.doAction(action, inNewWindow, msg, toOverride, subjOverride, extraBodyText);
	}
	
	// send email
	else {
		var contactsApp = this._appCtxt.getApp(ZmZimbraMail.CONTACTS_APP);
		var contactList = contactsApp.getContactList();

		msg.setTopPart(top);
		msg.send(contactList);
	}
}

ZmRevokeShareDialog.prototype._generateContent = function(formatter, share) {
	var folderType = share.organizer.view 
					? "(" + ZmFolderPropsDialog.TYPE_CHOICES[share.organizer.view] + ")"
					: "";
	var userName = this._appCtxt.getSettings().get(ZmSetting.DISPLAY_NAME);

	var params = [ share.organizer.name, folderType, userName, share.granteeName ];
	var content = formatter.format(params);
	
	return content;
}

ZmRevokeShareDialog.prototype._generateTextPart = function(share) {
	var content = this._generateContent(this._textFormatter, share);

	var instance = this._xform.getInstance();
	if (instance.mailType == ZmRevokeShareDialog._MAIL_COMPOSE ||
		(instance.quickReply && !instance.quickReply.match(/^\s*$/))) {
		content += ZmAppt.NOTES_SEPARATOR
		if (instance.quickReply) {
			content += instance.quickReply;
		}
	}

	var mimePart = new ZmMimePart();
	mimePart.setContentType(ZmMimeTable.TEXT_PLAIN);
	mimePart.setContent(content);
	return mimePart;
}
ZmRevokeShareDialog.prototype._generateHtmlPart = function(share) {
	var content = this._generateContent(this._htmlFormatter, share);
	
	var instance = this._xform.getInstance();
	if (instance.mailType == ZmRevokeShareDialog._MAIL_COMPOSE ||
		(instance.quickReply && !instance.quickReply.match(/^\s*$/))) {
		if (!this._htmlNoteFormatter) {
			this._htmlNoteFormatter = new AjxMessageFormat(ZmMsg.shareNotesHtml);
		}
		content += this._htmlNoteFormatter.format(instance.quickReply);
	}

	var mimePart = new ZmMimePart();
	mimePart.setContentType(ZmMimeTable.TEXT_HTML);
	mimePart.setContent(content);
	return mimePart;
}
ZmRevokeShareDialog.prototype._generateXmlPart = function(share) {
	var settings = this._appCtxt.getSettings();
	var granteeId = share.granteeId;
	var granteeName = share.granteeName;
	var grantorId = settings.get(ZmSetting.USERID);
	var grantorName = AjxStringUtil.xmlAttrEncode(settings.get(ZmSetting.DISPLAY_NAME));
	var remoteId = share.organizer.id;
	var remoteName = AjxStringUtil.xmlAttrEncode(share.organizer.name);
	var defaultType = ZmFolderPropsDialog.TYPE_NAMES[share.organizer.type];
	
	var content = [
		"<share xmlns='"+ZmShareInfo.URI+"' version='"+ZmShareInfo.VERSION+"' action='"+ZmShareInfo.DELETE+"'>",
		"  <grantee id='"+granteeId+"' name='"+granteeName+"' />",
		"  <grantor id='"+grantorId+"' name='"+grantorName+"' />",
		"  <link id='"+remoteId+"' name='"+remoteName+"' view='"+defaultType+"' />",
		"</share>"
	].join("\n");

	var mimePart = new ZmMimePart();
	mimePart.setContentType(ZmMimeTable.XML_ZIMBRA_SHARE);
	mimePart.setContent(content);
	return mimePart;
}

ZmRevokeShareDialog.prototype._getSeparatorTemplate = function() {
	return "";
}

