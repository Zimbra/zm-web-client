/*
 * ***** BEGIN LICENSE BLOCK *****
 * Version: ZPL 1.2
 * 
 * The contents of this file are subject to the Zimbra Public License
 * Version 1.2 ("License"); you may not use this file except in
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
 * Portions created by Zimbra are Copyright (C) 2005, 2006 Zimbra, Inc.
 * All Rights Reserved.
 * 
 * Contributor(s):
 * 
 * ***** END LICENSE BLOCK *****
 */

function ZmFolderPropsDialog(appCtxt, parent, className) {
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
};

ZmFolderPropsDialog.prototype = new DwtDialog;
ZmFolderPropsDialog.prototype.constructor = ZmFolderPropsDialog;

// Constants

ZmFolderPropsDialog.ADD_SHARE_BUTTON = ++DwtDialog.LAST_BUTTON;

ZmFolderPropsDialog.TYPE_CHOICES = new Object;
ZmFolderPropsDialog.TYPE_CHOICES[ZmOrganizer.FOLDER] = ZmMsg.mailFolder;
ZmFolderPropsDialog.TYPE_CHOICES[ZmOrganizer.CALENDAR] = ZmMsg.calendarFolder;
ZmFolderPropsDialog.TYPE_CHOICES[ZmOrganizer.NOTEBOOK] = ZmMsg.notebookFolder;
ZmFolderPropsDialog.TYPE_CHOICES[ZmOrganizer.ADDRBOOK] = ZmMsg.addressBookFolder;

// Public methods

ZmFolderPropsDialog.prototype.popup =
function(organizer, loc) {
	this._organizer = organizer;
	organizer.addChangeListener(this._folderChangeListener);
	this._handleFolderChange();
	if (this._appCtxt.get(ZmSetting.SHARING_ENABLED)) {
		this.setButtonVisible(ZmFolderPropsDialog.ADD_SHARE_BUTTON, !organizer.link);
	}
	DwtDialog.prototype.popup.call(this, loc);
	this.setButtonEnabled(DwtDialog.OK_BUTTON, false);
	if (organizer.id != ZmCalendar.ID_CALENDAR &&
		organizer.id != ZmOrganizer.ID_NOTEBOOK) {
		this._nameInputEl.focus();
	}
};

ZmFolderPropsDialog.prototype.popdown =
function() {
	this._organizer.removeChangeListener(this._folderChangeListener);
	this._organizer = null;
	DwtDialog.prototype.popdown.call(this);
};

// Protected methods

ZmFolderPropsDialog.prototype._getSeparatorTemplate =
function() {
	return "";
};

ZmFolderPropsDialog.prototype._handleEditShare =
function(event) {
	var target = DwtUiEvent.getTarget(event);
	var share = target._share;
	var dialog = target._dialog;
	var sharePropsDialog = dialog._appCtxt.getSharePropsDialog();
	sharePropsDialog.popup(ZmSharePropsDialog.EDIT, share.object, share);
	return false;
};

ZmFolderPropsDialog.prototype._handleRevokeShare =
function(event) {
	var target = DwtUiEvent.getTarget(event);
	var share = target._share;
	var dialog = target._dialog;
	var revokeShareDialog = dialog._appCtxt.getRevokeShareDialog();
	revokeShareDialog.popup(share);
	return false;
};

ZmFolderPropsDialog.prototype._handleResendShare =
function(event) {
	var target = DwtUiEvent.getTarget(event);
	var share = target._share;
	var dialog = target._dialog;

	// create share info
	var tmpShare = new ZmShare({appCtxt: share._appCtxt, object: share.object});
	tmpShare.grantee.id = share.grantee.id;
	tmpShare.grantee.email = share.grantee.name;
	tmpShare.grantee.name = share.grantee.name;
	tmpShare.grantor.id = dialog._appCtxt.get(ZmSetting.USERID);
	tmpShare.grantor.email = dialog._appCtxt.get(ZmSetting.USERNAME);
	tmpShare.grantor.name = dialog._appCtxt.get(ZmSetting.DISPLAY_NAME) || tmpShare.grantor.email;
	tmpShare.link.id = share.object.id;
	tmpShare.link.name = share.object.name;
	tmpShare.link.view = ZmOrganizer.getViewName(share.object.type);
	tmpShare.link.perm = share.link.perm;
	tmpShare.sendMessage(ZmShare.NEW);
	
	share._appCtxt.setStatusMsg(ZmMsg.resentShareMessage);
	
	return false;
};

ZmFolderPropsDialog.prototype._handleAddShareButton =
function(event) {
	var sharePropsDialog = this._appCtxt.getSharePropsDialog();
	sharePropsDialog.popup(ZmSharePropsDialog.NEW, this._organizer, null);
};

ZmFolderPropsDialog.prototype._handleOkButton =
function(event) {
	var organizer = this._organizer;
	if (organizer.hasOwnProperty("color")) {
		organizer._object_.setColor(organizer.color);
	}
	if (organizer.hasOwnProperty("name")) {
		organizer._object_.rename(organizer.name);
	}
	if (organizer.hasOwnProperty("excludeFreeBusy")) {
		organizer._object_.setFreeBusy(organizer.excludeFreeBusy);
	}
	this.popdown();
};

ZmFolderPropsDialog.prototype._handleCancelButton =
function(event) {
	this.popdown();
};

ZmFolderPropsDialog.prototype._handleFolderChange =
function(event) {
	
	var organizer;
	if (event) {
		var organizers = event.getDetail("organizers");
		var organizer = organizers ? organizers[0] : null;
	} else {
		organizer = this._organizer;
	}
	if (!organizer) return;
	
	if (organizer.id == ZmCalendar.ID_CALENDAR || organizer.id == ZmOrganizer.ID_NOTEBOOK) {
		this._nameOutputEl.innerHTML = AjxStringUtil.htmlEncode(organizer.name);
		this._nameOutputEl.style.display = "block";
		this._nameInputEl.style.display = "none";
	} else {
		this._nameInputEl.value = organizer.name;
		this._nameInputEl.style.display = "block";
		this._nameOutputEl.style.display = "none";
	}
	this._ownerEl.innerHTML = AjxStringUtil.htmlEncode(organizer.owner);
	this._typeEl.innerHTML = ZmFolderPropsDialog.TYPE_CHOICES[organizer.type] || ZmMsg.folder;
	this._urlEl.innerHTML = organizer.url || "";
	this._color.setSelectedValue(organizer.color);
	this._excludeFbCheckbox.checked = organizer.excludeFreeBusy;
	
	if (this._appCtxt.get(ZmSetting.SHARING_ENABLED)) {
		this._populateShares(organizer);
	}

	this._props.setPropertyVisible(this._ownerId, organizer.owner != null);
	this._props.setPropertyVisible(this._urlId, organizer.url != null);

	Dwt.setVisible(this._excludeFbEl, !organizer.link && (organizer.type == ZmOrganizer.CALENDAR));
};

ZmFolderPropsDialog.prototype._populateShares =
function(organizer) {
	this._sharesGroup.setContent("");

	var link = organizer.link;
	var shares = organizer.shares;
	var visible = (!link && shares && shares.length > 0);
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
			nameEl.innerHTML = AjxStringUtil.htmlEncode(share.isPublic() ? ZmMsg.shareWithAll : share.grantee.name);

			var roleEl = row.insertCell(row.cells.length);
			roleEl.style.paddingRight = "15px";
			roleEl.innerHTML = ZmShare.getRoleName(share.link.perm);

			var cmdsEl = row.insertCell(row.cells.length);
			cmdsEl.style.whiteSpace = "nowrap";
			this.__createCmdLinks(cmdsEl, share);
		}
		this._sharesGroup.setElement(table);
	}

	this._sharesGroup.setVisible(visible);
};

ZmFolderPropsDialog.prototype.__createCmdLinks =
function(parent, share) {
	var labels = [ ZmMsg.edit, ZmMsg.revoke, ZmMsg.resend ];
	var actions = [ 
		this._handleEditShare, this._handleRevokeShare, this._handleResendShare
	];
	for (var i = 0; i < labels.length; i++) {
		var action = actions[i];
		// public shares have no editable fields, and sent no mail
		if (share.isPublic() && (action == this._handleEditShare ||
								 action == this._handleResendShare)) continue;

		var link = document.createElement("A");
		link.href = "#";
		link._dialog = this;
		link._share = share;
		link.onclick = action;
		link.innerHTML = labels[i];
		
		parent.appendChild(link);
		parent.appendChild(document.createTextNode(" "));
	}
};

ZmFolderPropsDialog.prototype._createView =
function() {
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

ZmFolderPropsDialog.prototype._handleNameChange =
function(event) {
	event = event || window.event;
	var target = DwtUiEvent.getTarget(event);
	var dialog = target._dialog;
	if (dialog._organizer) {
		dialog._organizer.name = target.value;
	}
	dialog.setButtonEnabled(DwtDialog.OK_BUTTON, true);
};

ZmFolderPropsDialog.prototype._handleColorChange =
function(event) {
	this._organizer.color = this._color.getValue();
	this.setButtonEnabled(DwtDialog.OK_BUTTON, true);
};

ZmFolderPropsDialog.prototype._handleFreeBusyChange =
function(event) {
	event = event || window.event;
	var target = DwtUiEvent.getTarget(event);
	var dialog = target._dialog;
	if (this._organizer) {
		dialog._organizer.excludeFreeBusy = target.checked;
	}
	dialog.setButtonEnabled(DwtDialog.OK_BUTTON, true);
};
