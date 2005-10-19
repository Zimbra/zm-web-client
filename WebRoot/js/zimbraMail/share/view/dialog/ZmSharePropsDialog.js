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

function ZmSharePropsDialog(appCtxt, shell, className) {
	var xformDef = ZmSharePropsDialog._XFORM_DEF;
	var xmodelDef = ZmSharePropsDialog._XMODEL_DEF;
	className = className || "ZmSharePropsDialog";
	
	DwtXFormDialog.call(this, xformDef, xmodelDef, shell, className, ZmMsg.shareProperties);
	this._xform.setController(this);
	this._xform.itemChanged = ZmSharePropsDialog.__xformItemChanged;
	
	this._appCtxt = appCtxt;
}
ZmSharePropsDialog.prototype = new DwtXFormDialog;
ZmSharePropsDialog.prototype.constructor = ZmSharePropsDialog;

// Constants

ZmSharePropsDialog.NEW = ZmShareInfo.NEW;
ZmSharePropsDialog.EDIT= ZmShareInfo.EDIT;

ZmSharePropsDialog._MAIL_STANDARD = 'S';
ZmSharePropsDialog._MAIL_QUICK = 'Q';
ZmSharePropsDialog._MAIL_COMPOSE = 'C';

ZmSharePropsDialog._XFORM_DEF = { items: [
	{type:_OUTPUT_, label: ZmMsg.folderLabel, ref:"folder_name", width:"100%", 
		relevant:"get('folder_type') != ZmOrganizer.CALENDAR",relevantBehavior:_HIDE_
	},
	{type:_OUTPUT_, label: ZmMsg.calendarLabel, ref:"folder_name", width:"100%", 
		relevant:"get('folder_type') == ZmOrganizer.CALENDAR",relevantBehavior:_HIDE_
	},
	{type:_GROUP_, label: ZmMsg.shareWithLabel, width:"100%", numCols:3, useParentTable: false, items:[
			{type:_OUTPUT_, ref:"share_grantee_name", width:"250", relevant:"get('type')!=ZmSharePropsDialog.NEW",relevantBehavior:_HIDE_},
			{type:_GROUP_, //useParentTable: false, 
			relevant:"get('type') == ZmSharePropsDialog.NEW", relevantBehavior:_HIDE_, items:[
				{type:_INPUT_, ref:"share_grantee_name", width:"250"}
				/***
				{type:_BUTTON_, label:"Search...", cssStyle:"margin-left:10px", 
					relevant:"get('type') == ZmSharePropsDialog.NEW", relevantBehavior:_HIDE_,
					onActivate: function() {
						this.getForm().getController()._popupUserPicker();
					}
				}
				/***/
			]}
		]
	},
	{type:_RADIO_GROUPER_, label: ZmMsg.roleLabel, numCols:3, colSizes:[25,60,'*'], items: [
			{type:_RADIO_, ref:"share_rights", value:ZmShareInfo.ROLE_NONE, label:"<b>"+ZmShareInfo.ROLES[ZmShareInfo.ROLE_NONE]+"</b>"},
			{type:_OUTPUT_, value:ZmShareInfo.ACTIONS[ZmShareInfo.ROLE_NONE]},
			{type:_RADIO_, ref:"share_rights", value:ZmShareInfo.ROLE_VIEWER, label:"<b>"+ZmShareInfo.ROLES[ZmShareInfo.ROLE_VIEWER]+"</b>"},
			{type:_OUTPUT_, value:ZmShareInfo.ACTIONS[ZmShareInfo.ROLE_VIEWER]},
			{type:_RADIO_, ref:"share_rights", value:ZmShareInfo.ROLE_MANAGER, label:"<b>"+ZmShareInfo.ROLES[ZmShareInfo.ROLE_MANAGER]+"</b>"},
			{type:_OUTPUT_, value:ZmShareInfo.ACTIONS[ZmShareInfo.ROLE_MANAGER]}
		]
	},
	{type:_GROUP_, colSpan:'*', width:"100%", numCols:2, colSizes:[35,'*'], items:[
			{type:_CHECKBOX_, ref:"sendMail", trueValue:true, falseValue:false, label: ZmMsg.sendMailAboutShare },
			{type:_SPACER_, height:3, relevant:"get('sendMail')"},
			{type:_DWT_SELECT_, ref:"mailType", relevant:"get('sendMail')", label:"", choices: [
				{value: ZmSharePropsDialog._MAIL_STANDARD, label: ZmMsg.sendStandardMailAboutShare },
				{value: ZmSharePropsDialog._MAIL_QUICK, label: ZmMsg.sendStandardMailAboutSharePlusNote },
				{value: ZmSharePropsDialog._MAIL_COMPOSE, label: ZmMsg.sendComposedMailAboutShare }
			]},
			{type:_OUTPUT_, label: "", //width: "250",
				value: ZmMsg.sendMailAboutShareNote,
				relevant: "get('sendMail') && (get('mailType') == ZmSharePropsDialog._MAIL_STANDARD || get('mailType') == ZmSharePropsDialog._MAIL_QUICK)", revelantBehavior: _HIDE_
			},
			{type:_TEXTAREA_, ref:"quickReply", relevant:"get('sendMail') && get('mailType') == ZmSharePropsDialog._MAIL_QUICK", width:"95%", height:50, label:""}
		]
	}
]};
ZmSharePropsDialog._XMODEL_DEF = { items: [
	{ id: "folder_name", ref: "folder/name", type: _STRING_ },
	{ id: "folder_type", ref: "folder/type", type: _STRING_ },
	{ id: "share_grantee_name", ref: "share/grantee/name", type: _STRING_, required: true },
	{ id: "share_rights", ref: "share/link/perm", type: _STRING_ },
	//{ id: "share_showPrivate", ref: "share/showPrivate", type: _ENUM_, choices: [true, false] },
	//{ id: "share_sendNotices", ref: "share/sendNotices", type: _ENUM_, choices: [true, false] },
	//{ id: "share_proxy", ref: "share/proxy", type: _ENUM_, choices: [true, false] },
	{ id: "sendMail", type: _ENUM_, choices: [true, false] },
	{ id: "mailType", type: _ENUM_, choices: [
		ZmSharePropsDialog._MAIL_STANDARD,
		ZmSharePropsDialog._MAIL_QUICK,
		ZmSharePropsDialog._MAIL_COMPOSE
	] },
	{ id: "quickReply", type: _STRING_ }
]};

// Data

ZmSharePropsDialog.prototype._dialogType = ZmSharePropsDialog.NEW;

ZmSharePropsDialog.prototype._folder;
ZmSharePropsDialog.prototype._shareInfo;

ZmSharePropsDialog.prototype._userPicker;

// Public methods

ZmSharePropsDialog.prototype.setDialogType = function(type) {
	this._dialogType = type;
}

ZmSharePropsDialog.prototype.setFolder = function(folder) {
	this._folder = folder;
}

ZmSharePropsDialog.prototype.setShareInfo = function(shareInfo) { 
	if (shareInfo == null) {
		shareInfo = new ZmShareInfo();
		shareInfo.grantee.name = "";
		shareInfo.link.perm = ZmShareInfo.ROLE_VIEWER;
	}

	var proxyCtor = new Function;
	proxyCtor.prototype = shareInfo;
	proxyCtor.constructor = proxyCtor;
	var proxy = new proxyCtor;
	
	var instance = {
		type: this._dialogType,
		folder: this._folder,
		share: proxy,
		sendMail: true,
		mailType: ZmSharePropsDialog._MAIL_STANDARD,
		quickReply: ''		
	};
	
	this._shareInfo = shareInfo;
	this.setInstance(instance);
}

// Private methods

ZmSharePropsDialog.__xformItemChanged = function(id, value, event) {
	var item = this.getItemById(id);
	if (item.refPath == "sendMail" || item.refPath == "mailType" || item.refPath == "quickReply") {
		// HACK: This is done to avoid marking the form as "dirty"
		item.setInstanceValue(value);
		this.refresh();
	}
	else {
		XForm.prototype.itemChanged.call(this, id, value, event);
	}
}

// Protected methods

ZmSharePropsDialog.prototype._popupUserPicker = function() {
	this._userPicker.popup();
}

ZmSharePropsDialog.prototype._handleOkButton = function(event) {

	// execute grant operation
	var folder = this._folder;
	var instance = this._xform.getInstance();
	var share = instance.share;
	try {
		share.grantee.id = this._executeGrantAction(folder, share);
	}
	catch (ex) {
		var message = Ajx.unknownError;
		if (ex instanceof ZmCsfeException && ex.code == "account.NO_SUCH_ACCOUNT") {
			if (!this._unknownUserFormatter) {
				this._unknownUserFormatter = new AjxMessageFormat(ZmMsg.unknownUser);
			}
			message = this._unknownUserFormatter.format(share.grantee.name);
			// NOTE: This prevents details from being shown
			ex = null;
		}
		
		var appController = this._appCtxt.getAppController();
		appController.popupErrorDialog(message, ex);
		return;
	}

	// send mail
	if (instance.sendMail) {
		// initialize rest of share information
		share.grantor.id = this._appCtxt.get(ZmSetting.USERID);
		share.grantor.name = this._appCtxt.get(ZmSetting.DISPLAY_NAME);
		share.link.id = folder.id;
		share.link.name = folder.name;
		share.link.view = ZmOrganizer.getViewName(folder.type);
		if (instance.mailType == ZmSharePropsDialog._MAIL_QUICK) {
			share.notes =  instance.quickReply;
		}
	
		// compose in new window
		if (instance.mailType == ZmSharePropsDialog._MAIL_COMPOSE) {
			ZmShareInfo.composeMessage(this._appCtxt, this._dialogType, share);
		}
		// send email
		else {
			ZmShareInfo.sendMessage(this._appCtxt, this._dialogType, share);
		}
	}

	// default processing
	DwtXFormDialog.prototype._handleOkButton.call(this, event);
}

/** Note: Caller is responsible to catch exceptions. */
ZmSharePropsDialog.prototype._executeGrantAction = function(folder, share) {
	// Note: We need the user's zid from the result
	var soapDoc = AjxSoapDoc.create("FolderActionRequest", "urn:zimbraMail");
	
	var actionNode = soapDoc.set("action");
	actionNode.setAttribute("op", "grant");
	actionNode.setAttribute("id", folder.id);
	
	var shareNode = soapDoc.set("grant", null, actionNode);
	shareNode.setAttribute("gt", "usr");
	shareNode.setAttribute("d", share.grantee.name);
	shareNode.setAttribute("perm", share.link.perm);
	
	var appCtlr = this._appCtxt.getAppController();
	var resp = appCtlr.sendRequest(soapDoc)["FolderActionResponse"];
	
	return resp.action.zid;
}

ZmSharePropsDialog.prototype._getSeparatorTemplate = function() {
	return "";
}
