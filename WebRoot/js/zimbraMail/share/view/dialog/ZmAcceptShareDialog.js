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

function ZmAcceptShareDialog(appCtxt, parent, className) {
	var xformDef = ZmAcceptShareDialog._XFORM_DEF;
	var xmodelDef = ZmAcceptShareDialog._XMODEL_DEF;
	className = className || "ZmAcceptShareDialog";
	var title = ZmMsg.acceptShare;
	var buttons = [ DwtDialog.YES_BUTTON, DwtDialog.NO_BUTTON ];
	DwtXFormDialog.call(this, xformDef, xmodelDef, parent, className, title, buttons);
	
	this._appCtxt = appCtxt;
	
	// create formatters
	this._headerFormatter = new AjxMessageFormat(ZmMsg.acceptShareHeader);
	this._detailsFormatter = new AjxMessageFormat(ZmMsg.acceptShareDetails);
	this._defaultNameFormatter = new AjxMessageFormat(ZmMsg.shareNameDefault);
}
ZmAcceptShareDialog.prototype = new DwtXFormDialog;
ZmAcceptShareDialog.prototype.constructor = ZmAcceptShareDialog;

// Constants

ZmAcceptShareDialog._ACTIONS = {};
ZmAcceptShareDialog._ACTIONS[ZmShareInfo.ROLE_NONE] = ZmMsg.acceptShareDetailsNone;
ZmAcceptShareDialog._ACTIONS[ZmShareInfo.ROLE_VIEWER] = ZmMsg.acceptShareDetailsViewer;
ZmAcceptShareDialog._ACTIONS[ZmShareInfo.ROLE_MANAGER] = ZmMsg.acceptShareDetailsManager;

ZmAcceptShareDialog._XFORM_DEF = { items: [
	{type:_OUTPUT_, colSpan:2, ref: "msg_header" },
	{type:_OUTPUT_, colSpan:2, ref: "msg_details" },
	{type:_SPACER_, height:3},
	{type:_SEPARATOR_ },
	{type:_SPACER_, height:3},
	{type: _OUTPUT_, colSpan:2, ref: "msg_question" },
	{type:_SPACER_, height:5},
	{type:_INPUT_, label: ZmMsg.shareNameLabel, ref:"share_name", width:"100%"},
	{type:_DWT_SELECT_, label: ZmMsg.colorLabel, ref: "share_color", choices: ZmOrganizer.COLOR_CHOICES	}
	
	/*** TODO
	{type:_RADIO_GROUPER_, label:"When calendar messages arrive for this folder:", colSizes:["25","300"], 
		relevant: "get('link_view') == 'appointment'", relevantBehavior: _HIDE_,
		items: [
			{type:_RADIO_, ref:"msgLocation", value:"inbox", label:"Place them in my <b>Inbox</b>"},
			{type:_RADIO_, ref:"msgLocation", value:"special", label:"Place them in the folder <b>Delegated Appointments</b>"},
			{type:_RADIO_, ref:"msgLocation", value:"trash", label:"Place them in the <b>Trash</b>"},
		]
	}
	/***/
]};
ZmAcceptShareDialog._XMODEL_DEF = { items: [
	{ id: "msg_header", ref: "msgs/header", type: _STRING_ },
	{ id: "msg_details", ref: "msgs/details", type: _STRING_ },
	{ id: "msg_question", ref: "msgs/question", type: _STRING_ },
	{ id: "op", ref: "op", type: _ENUM_, choices: [ 
		ZmAcceptShareDialog.ACCEPT, ZmAcceptShareDialog.DECLINE, ZmAcceptShareDialog.LATER 
	]},
	{ id: "grantor_id", ref: "info/grantor/id", type: _STRING_ },
	{ id: "grantor_name", ref: "info/grantor/name", type: _STRING_ },
	{ id: "link_id", ref: "info/link/id", type: _NUMBER_ },
	{ id: "link_name", ref: "info/link/name", type: _STRING_ },
	{ id: "link_view", ref: "info/link/view", type: _STRING_ },
	{ id: "link_perm", ref: "info/link/perm", type: _STRING_ },
	{ id: "share_name", ref: "share/name", type: _STRING_ },
	{ id: "share_color", ref: "share/color", type: _NUMBER_ }
]};

// Public methods

ZmAcceptShareDialog.prototype.setShareInfo = function(shareInfo) { 
	var params = [ shareInfo.grantor.name, shareInfo.link.name ];
	var header = this._headerFormatter.format(params);

	var params = [ 
		ZmShareInfo.getRoleName(shareInfo.link.perm),
		// TODO: Be able to generate custom perms list
		ZmAcceptShareDialog._ACTIONS[shareInfo.link.perm]
	];
	var details = this._detailsFormatter.format(params);
	
	var question = "<b>" + ZmMsg.acceptShareQuestion + "</b>";

	var params = [ shareInfo.grantor.name, shareInfo.link.name ];
	var shareName = this._defaultNameFormatter.format(params);
	
	var instance = {
		msgs: {
			header: header,				
			details: details,
			question: question
		},
		info: shareInfo,
		share: { 
			name: shareName,
			color: ZmOrganizer.DEFAULT_COLOR 
		}
	};
	this.setInstance(instance);
}

ZmAcceptShareDialog.prototype.popup = function(loc) {
	DwtXFormDialog.prototype.popup.call(this, loc);
	this.setButtonEnabled(DwtDialog.YES_BUTTON, true);
}

ZmAcceptShareDialog.prototype.setAcceptListener = function(listener) {
	this.removeAllListeners(ZmAcceptShareDialog.ACCEPT);
	if (listener) this.addListener(ZmAcceptShareDialog.ACCEPT, listener);
}
// Protected methods

ZmAcceptShareDialog.prototype._handleYesButton = function(event) {
	var instance = this._xform.getInstance();

	// create mountpoint
	var soapDoc = AjxSoapDoc.create("CreateMountpointRequest", "urn:zimbraMail");

	var share = instance.share;
	var info = instance.info;
	
	var linkNode = soapDoc.set("link");
	linkNode.setAttribute("l", "1"); // place in root folder
	linkNode.setAttribute("name", share.name);
	linkNode.setAttribute("zid", info.grantor.id);
	linkNode.setAttribute("rid", info.link.id);
	if (info.link.view) {
		linkNode.setAttribute("view", info.link.view);
	}

	var appCtlr = this._appCtxt.getAppController();
	//appCtlr.setActionedIds([this.organizer.id]); // TODO: ???
	var mountpointId;
	try {
		var resp = appCtlr.sendRequest(soapDoc)["CreateMountpointResponse"];
		mountpointId = parseInt(resp.link[0].id);
	}
	catch (ex) {
		var message = Ajx.unknownError;
		if (ex instanceof ZmCsfeException && ex.code == "mail.ALREADY_EXISTS") {
			message = Ajx.folderNameExists;
			// NOTE: This prevents details from being shown
			ex = null;
		}
		
		appCtlr.popupErrorDialog(message, ex);
		return;
	}
	
	// set color
	var soapDoc = AjxSoapDoc.create("FolderActionRequest", "urn:zimbraMail");
	
	var actionNode = soapDoc.set("action");
	actionNode.setAttribute("id", mountpointId);
	actionNode.setAttribute("op", "color");
	actionNode.setAttribute("color", share.color);

	try {
		var resp = appCtlr.sendRequest(soapDoc)["FolderActionResponse"];
	}
	catch (ex) {
		// TODO: handle error
		var message = null;
		appCtlr.popupErrorDialog(message, ex);
	}

	// notify accept listener and clear
	this.notifyListeners(ZmAcceptShareDialog.ACCEPT, event);
	this.setAcceptListener(null);

	// do default handling
	DwtXFormDialog.prototype._handleOkButton.call(this, event);
}

ZmAcceptShareDialog.prototype._getSeparatorTemplate = function() {
	return "";
}

