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

function ZmFolderPropsDialog(appCtxt, parent, className) {
	if (arguments.length == 0) return;

	var xformDef = ZmFolderPropsDialog._XFORM_DEF;
	var xmodelDef = ZmFolderPropsDialog._XMODEL_DEF;
	className = className || "ZmFolderPropsDialog";
	var extraButtons  = [
		new DwtDialog_ButtonDescriptor(ZmFolderPropsDialog.ADD_SHARE_BUTTON, ZmMsg.addShare, DwtDialog.ALIGN_LEFT)
	];
	// TODO: i18n
	DwtXFormDialog.call(this, xformDef, xmodelDef, parent, className, "Folder Properties", null, extraButtons);
	this._xform.setController(this);
	
	this.registerCallback(ZmFolderPropsDialog.ADD_SHARE_BUTTON, this._handleAddShareButton, this);
	
	this._appCtxt = appCtxt;
	this._folderChangeListener = new AjxListener(this, this._handleFolderChange);
}
ZmFolderPropsDialog.prototype = new DwtXFormDialog;
ZmFolderPropsDialog.prototype.constructor = ZmFolderPropsDialog;

// Constants

ZmFolderPropsDialog.ADD_SHARE_BUTTON = ++DwtDialog.LAST_BUTTON;

// TODO: i18n
ZmFolderPropsDialog.TYPE_CHOICES = new Object;
ZmFolderPropsDialog.TYPE_CHOICES[ZmOrganizer.FOLDER] = "Mail Folder";
ZmFolderPropsDialog.TYPE_CHOICES[ZmOrganizer.CALENDAR] = "Calendar Folder";

ZmFolderPropsDialog.TYPE_NAMES = new Object;
ZmFolderPropsDialog.TYPE_NAMES[ZmOrganizer.FOLDER] = "conversation";
ZmFolderPropsDialog.TYPE_NAMES[ZmOrganizer.CALENDAR] = "appointment";

ZmFolderPropsDialog._XFORM_DEF = { items: [
	{type:_GROUPER_, label:"Properties", width:"100%", 
		items: [
			// NOTE: user calendar cannot be renamed...
			{type:_OUTPUT_, label:"Name:", ref:"folder_name", width:"200",
				relevant: "get('folder_id') == ZmCalendar.ID_CALENDAR", relevantBehavior: _HIDE_
			},
			{type:_INPUT_, label:"Name:", ref:"folder_name", width:"200",
				relevant: "get('folder_id') != ZmCalendar.ID_CALENDAR", relevantBehavior: _HIDE_
			},
			{type:_SPACER_, height:3},
			{type: _OUTPUT_, ref:"folder_view", label:"Type:", 
				choices: ZmFolderPropsDialog.TYPE_CHOICES
			},
			{type:_SPACER_, height:3},
			{type:_SELECT1_, ref: "folder_color", label:"Color:",
				choices: ZmOrganizer.COLOR_CHOICES
			}
		]
	},


	{type:_GROUPER_, label:"Sharing for this folder", 
		relevant: "get('folder_acl_grant') && get('folder_acl_grant').length > 0", relevantBehavior: _HIDE_,
		items: [
			{type:_REPEAT_, ref:"folder_acl_grant", number: 0, colSpan:2, 
				showAddButton:false, showRemoveButton:false, items: [
					{type:_OUTPUT_, ref:"granteeName", width:140},
					{type:_OUTPUT_, ref:"perm", width:130,
						getDisplayValue: function(value) {
							return ZmShareInfo.ROLES[value];
						}
					},
					{type:_ANCHOR_, label:"Edit...", labelLocation:_NONE_,
						showInNewWindow: false,
						//href: "javascript:void 0;",
						onActivate: function(event) {
							var form = this.getForm();
							var controller = form.getController();
							var share = this.getParentItem().getInstanceValue();
							controller._handleEditShare(share);
						}
					},
					{type:_CELLSPACER_, width:5},
					{type:_ANCHOR_, label:"Remove", labelLocation:_NONE_,
						showInNewWindow: false,
						onActivate: function(event) {
							var form = this.getForm();
							var controller = form.getController();
							var share = this.getParentItem().getInstanceValue();
							controller._handleRemoveShare(share);
						}
					}
				]
			}
		]
	}
]};
ZmFolderPropsDialog._XMODEL_DEF = { items: [
	{ id: "folder_id", ref: "folder/id", type: _STRING_ },
	{ id: "folder_name", ref: "folder/name", type: _STRING_ },
	{ id: "folder_view", ref: "folder/type", type: _ENUM_, choices: [ ZmOrganizer.FOLDER, ZmOrganizer.CALENDAR ] },
	{ id: "folder_color", ref: "folder/color", type: _NUMBER_ },
	{ id: "folder_acl_grant", ref: "folder/shares", type: _LIST_ }
]};

// Data

ZmFolderPropsDialog.prototype._folder;

// Public methods

ZmFolderPropsDialog.prototype.setFolder = function(folder) { 
	if (this._folder) {
		this._folder.removeChangeListener(this._folderChangeListener);
	}
	this._folder = folder;
	if (this._folder) {
		this._folder.addChangeListener(this._folderChangeListener);
	}

	var proxyCtor = new Function();
	proxyCtor.prototype = folder;
	proxyCtor.prototype.constructor = proxyCtor;
	var proxy = new proxyCtor();
	
	var instance = {
		folder: proxy,
		msgLocation: "inbox"
	};
	this.setInstance(instance);
}
ZmFolderPropsDialog.prototype.getFolder = function() {
	return this._folder;
}

ZmFolderPropsDialog.prototype.popup = function(loc) {
	var visible = !this.getFolder().link;
	this.setButtonVisible(ZmFolderPropsDialog.ADD_SHARE_BUTTON, visible);
	DwtXFormDialog.prototype.popup.call(this, loc);
}

// Protected methods

ZmFolderPropsDialog.prototype._getSeparatorTemplate = function() {
	return "";
}

ZmFolderPropsDialog.prototype._handleEditShare = function(shareItem) {
	var sharePropsDialog = this._appCtxt.getSharePropsDialog();
	sharePropsDialog.setDialogType(ZmSharePropsDialog.EDIT);
	sharePropsDialog.setFolder(shareItem.organizer);
	sharePropsDialog.setShareItem(shareItem);
	sharePropsDialog.popup();
}

ZmFolderPropsDialog._TEXT_CONTENT = [
	"The following share has been revoked:",
	"",
	"Shared item: {0} {1}",
	"Owner: {2}",
	"",
	"Revokee: {3}"
].join("\n");
ZmFolderPropsDialog._HTML_CONTENT = [
	"<h3>The following share has been revoked:</h3>",
	"<p>",
	"<table border='0'>",
	"<tr><th align='left'>Shared item:</th><td>{0} {1}</td></tr>",
	"<tr><th align='left'>Owner:</th><td>{2}</td></tr>",
	"</table>",
	"<p>",
	"<table border='0'>",
	"<tr><th align='left'>Revokee:</th><td>{3}</td></tr>",
	"</table>"
].join("\n");

ZmFolderPropsDialog.prototype._generateContent = function(template, share) {
	var folderType = share.organizer.view 
					? "(" + ZmFolderPropsDialog.TYPE_CHOICES[share.organizer.view] + ")"
					: "";
	var userName = this._appCtxt.getSettings().get(ZmSetting.DISPLAY_NAME);

	// REVISIT
	var content = template;
	content = content.replace(/\{0}/g, share.organizer.name);
	content = content.replace(/\{1}/g, folderType);
	content = content.replace(/\{2}/g, userName);
	content = content.replace(/\{3}/g, share.granteeName);
	
	return content;
}

ZmFolderPropsDialog.prototype._generateTextPart = function(share) {
	var content = this._generateContent(ZmFolderPropsDialog._TEXT_CONTENT, share);

	var mimePart = new ZmMimePart();
	mimePart.setContentType(ZmMimeTable.TEXT_PLAIN);
	mimePart.setContent(content);
	return mimePart;
}
ZmFolderPropsDialog.prototype._generateHtmlPart = function(share) {
	var content = this._generateContent(ZmFolderPropsDialog._HTML_CONTENT, share);

	var mimePart = new ZmMimePart();
	mimePart.setContentType(ZmMimeTable.TEXT_PLAIN);
	mimePart.setContent(content);
	return mimePart;
}
ZmFolderPropsDialog.prototype._generateXmlPart = function(share) {
	var settings = this._appCtxt.getSettings();
	var grantorId = settings.get(ZmSetting.USERID);
	var grantorName = AjxStringUtil.xmlAttrEncode(settings.get(ZmSetting.DISPLAY_NAME));
	var remoteId = share.organizer.id;
	var remoteName = AjxStringUtil.xmlAttrEncode(share.organizer.name);
	var defaultType = ZmFolderPropsDialog.TYPE_NAMES[share.organizer.type];
	
	var content = [
		"<share xmlns='"+ZmShareInfo.URI+"' version='"+ZmShareInfo.VERSION+"' action='"+ZmShareInfo.DELETE+"'>",
		"  <grantor id='"+grantorId+"' name='"+grantorName+"' />",
		"  <link id='"+remoteId+"' name='"+remoteName+"' view='"+defaultType+"' />",
		"</share>"
	].join("\n");

	var mimePart = new ZmMimePart();
	mimePart.setContentType(ZmMimeTable.XML_ZIMBRA_SHARE);
	mimePart.setContent(content);
	return mimePart;
}

ZmFolderPropsDialog.prototype._handleRemoveShare = function(share) {
	// TODO: Implement confirmation dialog to allow sending message
	if (confirm("Are you sure you want to revoke access for "+share.granteeName+"?")) {
		share.revoke();
		
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
		msg.setSubject("Share Revoked");
		msg.setTopPart(top);

		var contactsApp = this._appCtxt.getApp(ZmZimbraMail.CONTACTS_APP);
		var contactList = contactsApp.getContactList();
		msg.send(contactList);
	}
}

ZmFolderPropsDialog.prototype._handleAddShareButton = function(event) {
	var sharePropsDialog = this._appCtxt.getSharePropsDialog();
	sharePropsDialog.setDialogType(ZmSharePropsDialog.NEW);
	sharePropsDialog.setFolder(this._folder);
	sharePropsDialog.setShareItem(null);
	sharePropsDialog.popup();
}

ZmFolderPropsDialog.prototype._handleOkButton = function(event) {
	var folder = this.getInstance().folder;
	if (folder.hasOwnProperty("color")) {
		this._folder.setColor(folder.color);
	}
	if (folder.hasOwnProperty("name")) {
		this._folder.rename(folder.name);
	}
	this._folder = null;
	DwtXFormDialog.prototype._handleOkButton.call(this, event);
}

ZmFolderPropsDialog.prototype._handleCancelButton = function(event) {
	this._folder = null;
	DwtXFormDialog.prototype._handleCancelButton.call(this, event);
}

ZmFolderPropsDialog.prototype._handleFolderChange = function(event) {
	this._xform.refresh();
}
