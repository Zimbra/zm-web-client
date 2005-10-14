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
	DwtXFormDialog.call(this, xformDef, xmodelDef, parent, className);
	
	// TODO: i18n
	this.setTitle("Accept Share");
	
	this._appCtxt = appCtxt;
}
ZmAcceptShareDialog.prototype = new DwtXFormDialog;
ZmAcceptShareDialog.prototype.constructor = ZmAcceptShareDialog;

// Constants

ZmAcceptShareDialog.ACCEPT = "accept";
ZmAcceptShareDialog.DECLINE = "decline";
ZmAcceptShareDialog.LATER = "later";

// TODO: i18n
ZmAcceptShareDialog._XFORM_DEF = { items: [
	{type:_OUTPUT_, colSpan:2, ref: "msg_header", cssClass:"ZmSubHead", height:23},

	{type:_OUTPUT_, colSpan:2, ref: "msg_details" },
	

	{type:_SPACER_, height:10},

	{type:_RADIO_GROUPER_, label:"What do you want to do?", numCols:2, colSizes:["20","300"], items:[
				{type:_RADIO_, ref:"op", value:ZmAcceptShareDialog.ACCEPT, label:"Accept the role"},
				{type:_RADIO_, ref:"op", value:ZmAcceptShareDialog.DECLINE, label:"Decline the role"},
				{type:_RADIO_, ref:"op", value:ZmAcceptShareDialog.LATER, label:"Decide later"},

				{type:_GROUP_, colSpan:'*', width:"100%", numCols:2, 
					relevant: "get('op') == ZmAcceptShareDialog.ACCEPT", relevantBehavior: _HIDE_,
					items:[
						{type:_SEPARATOR_, height:11, cssClass:"xform_separator_gray"},
						{type:_INPUT_, label:"Call the folder:", ref:"share_name", width:"100%"},
						{type:_DWT_SELECT_, label:"Color:", ref: "share_color",
							choices: ZmOrganizer.COLOR_CHOICES
						}
						/***
						{type:_RADIO_GROUPER_, label:"When calendar messages arrive for this folder:", colSizes:["25","300"], 
							relevant: "get('link_view') == 'appointment'", relevantBehavior: _HIDE_,
							items: [
								{type:_RADIO_, ref:"msgLocation", value:"inbox", label:"Place them in my <b>Inbox</b>"},
								{type:_RADIO_, ref:"msgLocation", value:"special", label:"Place them in the folder <b>Delegated Appointments</b>"},
								{type:_RADIO_, ref:"msgLocation", value:"trash", label:"Place them in the <b>Trash</b>"},
							]
						}
						/***/
					]
				},

				{type:_GROUP_, colSpan:'*', width:"100%", numCols:2, relevant:"get('status') == 'D'",items:[
						{type:_SEPARATOR_, height:11, cssClass:"xform_separator_gray"},
						{type:_CHECKBOX_, ref:"sendMail", trueValue:'T', falseValue:'F', label:"Send mail explaining why I decline this role"},
					]
				}
			]
		}
]};
ZmAcceptShareDialog._XMODEL_DEF = { items: [
	{ id: "msg_header", ref: "msgs/header", type: _STRING_ },
	{ id: "msg_details", ref: "msgs/details", type: _STRING_ },
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
	var settings = this._appCtxt.getSettings();
	var userName = settings.get(ZmSetting.DISPLAY_NAME);
	
	// TODO: i18n
	// REVISIT: generation of details message
	var header = [
		shareInfo.grantor.name," has shared their '",shareInfo.link.name,"' folder with you."
	].join("");
	
	var details = [
		"They have granted you the <b>",ZmShareInfo.ROLES[shareInfo.link.perm],"</b> role, which means:",
		"<div style='margin-left:15px;margin-bottom:3px;margin-top:3px;'>"
	];
	if (shareInfo.isRead()) {
		if (shareInfo.isWrite()) {
			details.push("<li>You can <b>View</b> and <b>Edit</b> items in the folder.</li>");
		}
		else {
			details.push("<li>You can <b>View</b> items in the folder.</li>");
		}
	}
	else if (shareInfo.isWrite()) {
		details.push("<li>You can <b>Edit</b> items in the folder.</li>");
	}
	if (shareInfo.isInsert()) {
		if (shareInfo.isDelete()) {
			details.push("<li>You can <b>Add</b> and <b>Remove</b> items to/from the folder.</li>");
		}
		else {
			details.push("<li>You can <b>Add</b> items to the folder.</li>");
		}
	}
	else if (shareInfo.isDelete()) {
		details.push("<li>You can <b>Remove</b> items from the folder.</li>");
	}
	if (shareInfo.isAdmin()) {
		// TODO
	}
	if (shareInfo.isWorkflow()) {
		details.push("<li>You can <b>Accept</b> and <b>Decline</b> workflow actions for the folder.</li>");
	}
	details.push("</div>");
	details = details.join("");
	
	var shareName = [
		shareInfo.grantor.name,"'s ",shareInfo.link.name," Folder"
	].join("");
	
	var instance = {
		msgs: {
			header: header,				
			details: details
				/***
				"When you take action on their behalf, messages will appear: <br><b>&nbsp;&nbsp;&nbsp;&nbsp;from: "+
				userName+" acting for "+shareInfo.grantor.name+"</b>"
				/***/
		},
		op: ZmAcceptShareDialog.ACCEPT,
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
	this.setButtonEnabled(DwtDialog.OK_BUTTON, true);
}

ZmAcceptShareDialog.prototype.setAcceptListener = function(listener) {
	this.removeAllListeners(ZmAcceptShareDialog.ACCEPT);
	if (listener) this.addListener(ZmAcceptShareDialog.ACCEPT, listener);
}
ZmAcceptShareDialog.prototype.setDeclineListener = function(listener) {
	this.removeAllListeners(ZmAcceptShareDialog.DECLINE);
	if (listener) this.addListener(ZmAcceptShareDialog.DECLINE, listener);
}

// Protected methods

ZmAcceptShareDialog.prototype._handleOkButton = function(event) {
	var instance = this._xform.getInstance();

	// create mountpoint
	if (instance.op == ZmAcceptShareDialog.ACCEPT) {
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
			var msg;
			if (ex instanceof ZmCsfeException) {
				switch (ex.code) {
					case "mail.ALREADY_EXISTS": {
						msg = "A folder with that name already exists.\n"+
							"Please select a different name.";
						break;
					}
					default: msg = ex.msg;
				}
			}
			else {
				msg = "Uknown error: "+ex;
			}
			alert(msg);
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
			alert(String(ex));
		}

		// notify accept listener
		this.notifyListeners(ZmAcceptShareDialog.ACCEPT, event);
	}
	
	// notify decline listener
	else if (instance.op == ZmAcceptShareDialog.DECLINE) {
		this.notifyListeners(ZmAcceptShareDialog.DECLINE, event);
	}

	// clear listeners
	this.setAcceptListener(null);
	this.setDeclineListener(null);

	// do default handling
	DwtXFormDialog.prototype._handleOkButton.call(this, event);
}

ZmAcceptShareDialog.prototype._getSeparatorTemplate = function() {
	return "";
}

