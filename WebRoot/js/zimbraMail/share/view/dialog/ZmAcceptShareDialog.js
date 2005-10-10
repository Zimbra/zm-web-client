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

// TODO: i18n
ZmAcceptShareDialog._XFORM_DEF = { items: [
	{type:_OUTPUT_, colSpan:2, ref: "msg_header", cssClass:"ZmSubHead", height:23},

	{type:_OUTPUT_, colSpan:2, ref: "msg_details" },
	

	{type:_SPACER_, height:10},

	{type:_RADIO_GROUPER_, label:"What do you want to do?", numCols:2, colSizes:["20","300"], items:[
				{type:_RADIO_, ref:"op", value:"A", label:"Accept the role"},
				{type:_RADIO_, ref:"op", value:"D", label:"Decline the role"},
				{type:_RADIO_, ref:"op", value:"T", label:"Decide later"},

				{type:_GROUP_, colSpan:'*', width:"100%", numCols:2, 
					relevant: "get('op') == 'A'", relevantBehavior: _HIDE_,
					items:[
						{type:_SEPARATOR_, height:11, cssClass:"xform_separator_gray"},
						{type:_INPUT_, label:"Call the folder:", ref:"share_name", width:"100%"},
						{type:_SELECT1_, label:"Color:", ref: "share_color",
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
	{ id: "op", ref: "op", type: _ENUM_, choices: [ 'A', 'D', 'T' ] },
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
		op: "A",
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
	this.setButtonEnabled(ZmDialog.OK_BUTTON, true);
}

// Protected methods

ZmAcceptShareDialog.prototype._handleOkButton = function(event) {
	// create mountpoint
	var soapDoc = AjxSoapDoc.create("CreateMountpointRequest", "urn:zimbraMail");
	
	var linkNode = soapDoc.set("link");
	var instance = this._xform.getInstance();
	linkNode.setAttribute("l", "1"); // place in root folder
	linkNode.setAttribute("name", instance.share.name);
	linkNode.setAttribute("zid", instance.info.grantor.id);
	linkNode.setAttribute("rid", instance.info.link.id);

	var appCtlr = this._appCtxt.getAppController();
	//appCtlr.setActionedIds([this.organizer.id]); // TODO: ???
	var resp = appCtlr.sendRequest(soapDoc)["CreateMountpointResponse"];
	var id = parseInt(resp.action.id);
	// TODO: handle error

	// do default handling
	DwtXFormDialog.prototype._handleOkButton.call(this, event);
}

ZmAcceptShareDialog.prototype._getSeparatorTemplate = function() {
	return "";
}

