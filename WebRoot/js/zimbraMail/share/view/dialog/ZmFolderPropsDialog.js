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

function ZmFolderPropsDialog(appCtxt, parent, className) {
	if (arguments.length == 0) return;

	className = className || "ZmFolderPropsDialog";
	var extraButtons;
	if (appCtxt.get(ZmSetting.SHARING_ENABLED)) {
		extraButtons = [
			new DwtDialog_ButtonDescriptor(ZmFolderPropsDialog.ADD_SHARE_BUTTON, ZmMsg.addShare, DwtDialog.ALIGN_LEFT)
		];
	}
	DwtDialog.call(this, parent, className, ZmMsg.folderProperties, null, extraButtons);
	if (appCtxt.get(ZmSetting.SHARING_ENABLED)) {
		this.registerCallback(ZmFolderPropsDialog.ADD_SHARE_BUTTON, this._handleAddShareButton, this);
	}
	this.setButtonListener(DwtDialog.OK_BUTTON, new AjxListener(this, this._handleOkButton));
	this.setButtonListener(DwtDialog.CANCEL_BUTTON, new AjxListener(this, this._handleCancelButton));

	this._appCtxt = appCtxt;

	this._folderChangeListener = new AjxListener(this, this._handleFolderChange);
	this._colorChangeListener = new AjxListener(this, this._handleColorChange);
	
	var view = this._createView();
	this.setView(view);
}
ZmFolderPropsDialog.prototype = new DwtDialog;
ZmFolderPropsDialog.prototype.constructor = ZmFolderPropsDialog;

// Constants

ZmFolderPropsDialog.ADD_SHARE_BUTTON = ++DwtDialog.LAST_BUTTON;

ZmFolderPropsDialog.TYPE_CHOICES = new Object;
ZmFolderPropsDialog.TYPE_CHOICES[ZmOrganizer.FOLDER] = ZmMsg.mailFolder;
ZmFolderPropsDialog.TYPE_CHOICES[ZmOrganizer.CALENDAR] = ZmMsg.calendarFolder;
ZmFolderPropsDialog.TYPE_CHOICES[ZmOrganizer.NOTEBOOK] = ZmMsg.notebookFolder;

// Data

ZmFolderPropsDialog.prototype._folder;

// Public methods

ZmFolderPropsDialog.prototype.setFolder = function(folder) { 
	this._folder = folder;
	if (this._folder) {
		this._folder = AjxUtil.createProxy(this._folder);
		this._folder.addChangeListener(this._folderChangeListener);
	}
};
ZmFolderPropsDialog.prototype.getFolder = function() {
	return this._folder;
};

ZmFolderPropsDialog.prototype.popup = function(loc) {
	this._handleFolderChange();
	var visible = !this.getFolder().link;
	if (this._appCtxt.get(ZmSetting.SHARING_ENABLED)) {
		this.setButtonVisible(ZmFolderPropsDialog.ADD_SHARE_BUTTON, visible);
	}
	DwtDialog.prototype.popup.call(this, loc);
	this.setButtonEnabled(DwtDialog.OK_BUTTON, false);
	if (this._folder.id != ZmCalendar.ID_CALENDAR &&
		this._folder.id != ZmOrganizer.ID_NOTEBOOK) {
		this._nameInputEl.focus();
	}
};

ZmFolderPropsDialog.prototype.popdown = function() {
	this._folder.removeChangeListener(this._folderChangeListener);
	this._folder = null;
	DwtDialog.prototype.popdown.call(this);
};

// Protected methods

ZmFolderPropsDialog.prototype._getSeparatorTemplate = function() {
	return "";
};

ZmFolderPropsDialog.prototype._handleEditShare = function(event) {
	event = event || window.event;
	var target = DwtUiEvent.getTarget(event);
	var share = target._share;
	var dialog = target._dialog;
	var sharePropsDialog = dialog._appCtxt.getSharePropsDialog();
	sharePropsDialog.setDialogType(ZmSharePropsDialog.EDIT);
	sharePropsDialog.setFolder(share.organizer);
	sharePropsDialog.setShareInfo(share);
	sharePropsDialog.popup();
	return false;
};
ZmFolderPropsDialog.prototype._handleRevokeShare = function(event) {
	event = event || window.event;
	var target = DwtUiEvent.getTarget(event);
	var share = target._share;
	var dialog = target._dialog;
	var revokeShareDialog = dialog._appCtxt.getRevokeShareDialog();
	revokeShareDialog.setShareInfo(share);
	revokeShareDialog.popup();
	return false;
};
ZmFolderPropsDialog.prototype._handleResendShare = function(event) {
	event = event || window.event;
	var target = DwtUiEvent.getTarget(event);
	var share = target._share;
	var dialog = target._dialog;
	// create share info
	var shareInfo = new ZmShareInfo();
	shareInfo.grantee.id = share.grantee.id;
	shareInfo.grantee.email = share.grantee.name;
	shareInfo.grantee.name = share.grantee.name;
	shareInfo.grantor.id = dialog._appCtxt.get(ZmSetting.USERID);
	shareInfo.grantor.email = dialog._appCtxt.get(ZmSetting.USERNAME);
	shareInfo.grantor.name = dialog._appCtxt.get(ZmSetting.DISPLAY_NAME) || shareInfo.grantor.email;
	shareInfo.link.id = share.organizer.id;
	shareInfo.link.name = share.organizer.name;
	shareInfo.link.view = ZmOrganizer.getViewName(share.organizer.type);
	shareInfo.link.perm = share.link.perm;
	
	// send message
	ZmShareInfo.sendMessage(dialog._appCtxt, ZmShareInfo.NEW, shareInfo);
	return false;
};

ZmFolderPropsDialog.prototype._handleAddShareButton = function(event) {
	var sharePropsDialog = this._appCtxt.getSharePropsDialog();
	sharePropsDialog.setDialogType(ZmSharePropsDialog.NEW);
	sharePropsDialog.setFolder(this._folder);
	sharePropsDialog.setShareInfo(null);
	sharePropsDialog.popup();
};

ZmFolderPropsDialog.prototype._handleOkButton = function(event) {
	var folder = this._folder;
	if (folder.hasOwnProperty("color")) {
		folder._object_.setColor(folder.color);
	}
	if (folder.hasOwnProperty("name")) {
		folder._object_.rename(folder.name);
	}
	if (folder.hasOwnProperty("excludeFreeBusy")) {
		folder._object_.setFreeBusy(folder.excludeFreeBusy);
	}
	this.popdown();
};

ZmFolderPropsDialog.prototype._handleCancelButton = function(event) {
	this.popdown();
};

ZmFolderPropsDialog.prototype._handleFolderChange = function(event) {
	if (this._folder == null) return;
	
	if (this._folder.id == ZmCalendar.ID_CALENDAR || 
		this._folder.id == ZmOrganizer.ID_NOTEBOOK) {
		this._nameOutputEl.innerHTML = AjxStringUtil.htmlEncode(this._folder.name);
		this._nameOutputEl.style.display = "block";
		this._nameInputEl.style.display = "none";
	}
	else {
		this._nameInputEl.value = this._folder.name;
		this._nameInputEl.style.display = "block";
		this._nameOutputEl.style.display = "none";
	}
	this._ownerEl.innerHTML = AjxStringUtil.htmlEncode(this._folder.owner);
	this._typeEl.innerHTML = ZmFolderPropsDialog.TYPE_CHOICES[this._folder.type] || ZmMsg.folder;
	this._urlEl.innerHTML = this._folder.url ? this._folder.url : "";
	this._color.setSelectedValue(this._folder.color);
	this._excludeFbCheckbox.checked = this._folder.excludeFreeBusy;
	
	if (this._appCtxt.get(ZmSetting.SHARING_ENABLED)) {
		this._populateShares();
	}

	this._props.setPropertyVisible(this._ownerId, this._folder.owner != null);
	this._props.setPropertyVisible(this._urlId, this._folder.url != null);

	Dwt.setVisible(this._excludeFbEl, !this._folder.link && this._folder.type == ZmOrganizer.CALENDAR);
};

ZmFolderPropsDialog.prototype._populateShares = function() {
	this._sharesGroup.setContent("");

	var link = this._folder.link;
	var shares = this._folder.shares;
	var visible = !link && shares && shares.length > 0;
	if (visible) {
		var table = document.createElement("TABLE");
		table.border = 0;
		table.cellSpacing = 0;
		table.cellPadding = 3;
		for (var i = 0; i < shares.length; i++) {
			var share = shares[i];
			var row = table.insertRow(table.rows.length);

			var nameEl = row.insertCell(row.cells.length);
			nameEl.style.paddingRight = "15px";
			nameEl.innerHTML = AjxStringUtil.htmlEncode(share.grantee.name);

			var roleEl = row.insertCell(row.cells.length);
			roleEl.style.paddingRight = "15px";
			roleEl.innerHTML = ZmShareInfo.getRoleName(share.link.perm);

			var cmdsEl = row.insertCell(row.cells.length);
			cmdsEl.style.whiteSpace = "nowrap";
			this.__createCmdLinks(cmdsEl, share);
		}
		this._sharesGroup.setElement(table);
	}

	this._sharesGroup.setVisible(visible);
};

ZmFolderPropsDialog.prototype.__createCmdLinks = function(parent, share) {
	var labels = [ ZmMsg.edit, ZmMsg.revoke, ZmMsg.resend ];
	var actions = [ 
		this._handleEditShare, this._handleRevokeShare, this._handleResendShare
	];
	for (var i = 0; i < labels.length; i++) {
		var link = document.createElement("A");
		link.href = "#";
		link._dialog = this;
		link._share = share;
		link.onclick = actions[i];
		link.innerHTML = labels[i];
		
		parent.appendChild(link);
		parent.appendChild(document.createTextNode(" "));
	}
};

ZmFolderPropsDialog.prototype._createView = function() {
	var view = new DwtComposite(this);

	// create html elements
	this._nameOutputEl = document.createElement("SPAN");
	this._nameInputEl = document.createElement("INPUT");
	this._nameInputEl.style.width = "20em";
	this._nameInputEl._dialog = this;
	Dwt.setHandler(this._nameInputEl, DwtEvent.ONKEYUP, this._handleNameChange);
	this._ownerEl = document.createElement("DIV");
	this._typeEl = document.createElement("DIV");
	this._urlEl = document.createElement("DIV");

	var nameEl = document.createElement("DIV");
	nameEl.appendChild(this._nameOutputEl);
	nameEl.appendChild(this._nameInputEl);

	this._excludeFbCheckbox = document.createElement("INPUT");
	this._excludeFbCheckbox.type = "checkbox";
	this._excludeFbCheckbox._dialog = this;
	this._excludeFbCheckbox.onclick = this._handleFreeBusyChange;
	
	this._excludeFbEl = document.createElement("DIV");
	this._excludeFbEl.style.display = "none";
	this._excludeFbEl.appendChild(this._excludeFbCheckbox);
	this._excludeFbEl.appendChild(document.createTextNode(ZmMsg.excludeFromFreeBusy));

	// setup properties group
	var propsGroup = new DwtGrouper(view);
	propsGroup.setLabel(ZmMsg.properties);

	this._props = new DwtPropertySheet(propsGroup);
	this._color = new DwtSelect(this._props);
	for (var i = 0; i < ZmOrganizer.COLOR_CHOICES.length; i++) {
		var color = ZmOrganizer.COLOR_CHOICES[i];
		this._color.addOption(color.label, false, color.value);
	}
	this._color.addChangeListener(this._colorChangeListener);

	this._nameId = this._props.addProperty(ZmMsg.nameLabel, nameEl);
	this._typeId = this._props.addProperty(ZmMsg.typeLabel, this._typeEl);
	this._ownerId = this._props.addProperty(ZmMsg.ownerLabel, this._ownerEl);
	this._urlId = this._props.addProperty(ZmMsg.urlLabel, this._urlEl);
	this._props.addProperty(ZmMsg.colorLabel, this._color);

	var propsContainer = document.createElement("DIV");
	propsContainer.appendChild(this._props.getHtmlElement());
	propsContainer.appendChild(this._excludeFbEl);
	
	propsGroup.setElement(propsContainer);

	// setup shares group
	if (this._appCtxt.get(ZmSetting.SHARING_ENABLED)) {
		this._sharesGroup = new DwtGrouper(view);
		this._sharesGroup.setLabel(ZmMsg.folderSharing);
		this._sharesGroup.setVisible(false);
	}

	// add everything to view and return
	var element = view.getHtmlElement();
	element.appendChild(propsGroup.getHtmlElement());
	if (this._appCtxt.get(ZmSetting.SHARING_ENABLED)) {
		element.appendChild(this._sharesGroup.getHtmlElement());
	}

	return view;
};

ZmFolderPropsDialog.prototype._handleNameChange = function(event) {
	event = event || window.event;
	var target = DwtUiEvent.getTarget(event);
	var dialog = target._dialog;
	if (dialog._folder) {
		dialog._folder.name = target.value;
	}
	dialog.setButtonEnabled(DwtDialog.OK_BUTTON, true);
};
ZmFolderPropsDialog.prototype._handleColorChange = function(event) {
	this._folder.color = this._color.getValue();
	this.setButtonEnabled(DwtDialog.OK_BUTTON, true);
};
ZmFolderPropsDialog.prototype._handleFreeBusyChange = function(event) {
	event = event || window.event;
	var target = DwtUiEvent.getTarget(event);
	var dialog = target._dialog;
	if (this._folder) {
		dialog._folder.excludeFreeBusy = target.checked;
	}
	dialog.setButtonEnabled(DwtDialog.OK_BUTTON, true);
};
