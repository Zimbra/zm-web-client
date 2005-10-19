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
	DwtXFormDialog.call(this, xformDef, xmodelDef, parent, className, ZmMsg.folderProperties, null, extraButtons);
	this._xform.setController(this);
	
	this.registerCallback(ZmFolderPropsDialog.ADD_SHARE_BUTTON, this._handleAddShareButton, this);
	
	this._appCtxt = appCtxt;
	this._folderChangeListener = new AjxListener(this, this._handleFolderChange);
}
ZmFolderPropsDialog.prototype = new DwtXFormDialog;
ZmFolderPropsDialog.prototype.constructor = ZmFolderPropsDialog;

// Constants

ZmFolderPropsDialog.ADD_SHARE_BUTTON = ++DwtDialog.LAST_BUTTON;

ZmFolderPropsDialog.TYPE_CHOICES = new Object;
ZmFolderPropsDialog.TYPE_CHOICES[ZmOrganizer.FOLDER] = ZmMsg.mailFolder;
ZmFolderPropsDialog.TYPE_CHOICES[ZmOrganizer.CALENDAR] = ZmMsg.calendarFolder;

ZmFolderPropsDialog._XFORM_DEF = { items: [
	{type:_GROUPER_, label:ZmMsg.properties, width:"100%", 
		items: [
			// NOTE: user calendar cannot be renamed...
			{type:_OUTPUT_, label: ZmMsg.nameLabel, ref:"folder_name", //width:"200",
				relevant: "get('folder_id') == ZmCalendar.ID_CALENDAR", relevantBehavior: _HIDE_
			},
			{type:_INPUT_, label: ZmMsg.nameLabel, ref:"folder_name", //width:"200",
				relevant: "get('folder_id') != ZmCalendar.ID_CALENDAR", relevantBehavior: _HIDE_
			},
			{type: _OUTPUT_, ref:"folder_view", label: ZmMsg.typeLabel, 
				choices: ZmFolderPropsDialog.TYPE_CHOICES
			},
			{type:_DWT_SELECT_, ref: "folder_color", label: ZmMsg.colorLabel,
				choices: ZmOrganizer.COLOR_CHOICES
			}
		]
	},


	{type:_GROUPER_, label: ZmMsg.folderSharing, 
		relevant: "get('folder_acl_grant') && get('folder_acl_grant').length > 0", relevantBehavior: _HIDE_,
		items: [
			{type:_REPEAT_, ref:"folder_acl_grant", number: 0, colSpan:3, 
				showAddButton:false, showRemoveButton:false, items: [
					{type:_OUTPUT_, ref:"grantee/name"},//, width:140},
					{type:_OUTPUT_, ref:"link/perm", width:80,
						getDisplayValue: function(value) {
							return ZmShareInfo.getRoleName(value);
						}
					},
					{type:_ANCHOR_, label: ZmMsg.editAction, labelLocation:_NONE_,
						showInNewWindow: false,
						onActivate: function(event) {
							var form = this.getForm();
							var controller = form.getController();
							var share = this.getParentItem().getInstanceValue();
							controller._handleEditShare(share);
						}
					},
					{type:_CELLSPACER_, width:5},
					{type:_ANCHOR_, label: ZmMsg.remove, labelLocation:_NONE_,
						showInNewWindow: false,
						onActivate: function(event) {
							var form = this.getForm();
							var controller = form.getController();
							var share = this.getParentItem().getInstanceValue();
							controller._handleRemoveShare(share);
						}
					},
					{type:_CELLSPACER_, width:5},
					{type:_ANCHOR_, label: ZmMsg.resend, labelLocation:_NONE_,
						showInNewWindow: false,
						onActivate: function(event) {
							var form = this.getForm();
							var controller = form.getController();
							var share = this.getParentItem().getInstanceValue();
							controller._handleResendShare(share);
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
	sharePropsDialog.setShareInfo(shareItem);
	sharePropsDialog.popup();
}

ZmFolderPropsDialog.prototype._handleRemoveShare = function(share) {
	var revokeShareDialog = this._appCtxt.getRevokeShareDialog();
	revokeShareDialog.setShareInfo(share);
	revokeShareDialog.popup();
}
ZmFolderPropsDialog.prototype._handleResendShare = function(share) {
	// create share info
	var shareInfo = new ZmShareInfo();
	shareInfo.grantee.id = share.grantee.id;
	shareInfo.grantee.name = share.grantee.name;
	shareInfo.grantor.id = this._appCtxt.get(ZmSetting.USERID);
	shareInfo.grantor.name = this._appCtxt.get(ZmSetting.DISPLAY_NAME);
	shareInfo.link.id = share.organizer.id;
	shareInfo.link.name = share.organizer.name;
	shareInfo.link.view = ZmOrganizer.getViewName(share.organizer.type);
	shareInfo.link.perm = share.link.perm;
	
	// send message
	ZmShareInfo.sendMessage(this._appCtxt, ZmShareInfo.NEW, shareInfo);
}

ZmFolderPropsDialog.prototype._handleAddShareButton = function(event) {
	var sharePropsDialog = this._appCtxt.getSharePropsDialog();
	sharePropsDialog.setDialogType(ZmSharePropsDialog.NEW);
	sharePropsDialog.setFolder(this._folder);
	sharePropsDialog.setShareInfo(null);
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
