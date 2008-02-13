/*
 * ***** BEGIN LICENSE BLOCK *****
 * 
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2005, 2006, 2007 Zimbra, Inc.
 * 
 * The contents of this file are subject to the Yahoo! Public License
 * Version 1.0 ("License"); you may not use this file except in
 * compliance with the License.  You may obtain a copy of the License at
 * http://www.zimbra.com/license.
 * 
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * 
 * ***** END LICENSE BLOCK *****
 */

ZmFolderPropsDialog = function(parent, className) {
	className = className || "ZmFolderPropsDialog";
	var extraButtons;
	if (appCtxt.get(ZmSetting.SHARING_ENABLED) &&
		appCtxt.get(ZmSetting.GROUP_CALENDAR_ENABLED))
	{
		extraButtons = [
			new DwtDialog_ButtonDescriptor(ZmFolderPropsDialog.ADD_SHARE_BUTTON, ZmMsg.addShare, DwtDialog.ALIGN_LEFT)
		];
	}

	DwtDialog.call(this, {parent:parent, className:className, title:ZmMsg.folderProperties, extraButtons:extraButtons});

	if (appCtxt.get(ZmSetting.SHARING_ENABLED) &&
		appCtxt.get(ZmSetting.GROUP_CALENDAR_ENABLED))
	{
		this.registerCallback(ZmFolderPropsDialog.ADD_SHARE_BUTTON, this._handleAddShareButton, this);
	}
	this.setButtonListener(DwtDialog.OK_BUTTON, new AjxListener(this, this._handleOkButton));
	this.setButtonListener(DwtDialog.CANCEL_BUTTON, new AjxListener(this, this._handleCancelButton));

	this._folderChangeListener = new AjxListener(this, this._handleFolderChange);
	
	var view = this._createView();
	this.setView(view);
};

ZmFolderPropsDialog.prototype = new DwtDialog;
ZmFolderPropsDialog.prototype.constructor = ZmFolderPropsDialog;

// Constants

ZmFolderPropsDialog.ADD_SHARE_BUTTON = ++DwtDialog.LAST_BUTTON;

ZmFolderPropsDialog.SHARES_HEIGHT = "9em";

// Public methods

ZmFolderPropsDialog.prototype.toString =
function() {
	return "ZmFolderPropsDialog";
};

ZmFolderPropsDialog.prototype.popup =
function(organizer) {
	this._organizer = organizer;
	organizer.addChangeListener(this._folderChangeListener);
	this._handleFolderChange();
	if (appCtxt.get(ZmSetting.SHARING_ENABLED) &&
		appCtxt.get(ZmSetting.GROUP_CALENDAR_ENABLED))
	{
		this.setButtonVisible(ZmFolderPropsDialog.ADD_SHARE_BUTTON, !organizer.link);
	}

	// only mail folders are allowed to unset their folder color
	this._color.getMenu().getItem(0).setEnabled(organizer.type == ZmOrganizer.FOLDER);

	DwtDialog.prototype.popup.call(this);

	if (organizer.id != ZmOrganizer.ID_CALENDAR &&
		organizer.id != ZmOrganizer.ID_NOTEBOOK &&
		organizer.id != ZmOrganizer.ID_ADDRBOOK &&
		organizer.id != ZmOrganizer.ID_TASKS &&
		organizer.id != ZmOrganizer.ID_AUTO_ADDED &&
		organizer.id != ZmOrganizer.ID_INBOX && 
		organizer.id != ZmOrganizer.ID_OUTBOX &&
		organizer.id != ZmOrganizer.ID_CHATS &&
		organizer.id != ZmOrganizer.ID_TASKS && 
		organizer.id != ZmOrganizer.ID_BRIEFCASE )
	{
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
	var share = Dwt.getObjectFromElement(target);
	var dialog = appCtxt.getFolderPropsDialog();
	var sharePropsDialog = appCtxt.getSharePropsDialog();
	sharePropsDialog.popup(ZmSharePropsDialog.EDIT, share.object, share);
	return false;
};

ZmFolderPropsDialog.prototype._handleRevokeShare =
function(event) {
	var target = DwtUiEvent.getTarget(event);
	var share = Dwt.getObjectFromElement(target);
	var dialog = appCtxt.getFolderPropsDialog();
	var revokeShareDialog = appCtxt.getRevokeShareDialog();
	revokeShareDialog.popup(share);
	return false;
};

ZmFolderPropsDialog.prototype._handleResendShare =
function(event) {
	AjxDispatcher.require("Share");
	var target = DwtUiEvent.getTarget(event);
	var share = Dwt.getObjectFromElement(target);
	var dialog = appCtxt.getFolderPropsDialog();

	// create share info
	var tmpShare = new ZmShare({object:share.object});
	tmpShare.grantee.id = share.grantee.id;
	tmpShare.grantee.email = (share.grantee.type == "guest")? share.grantee.id : share.grantee.name;
	tmpShare.grantee.name = share.grantee.name;
	tmpShare.grantor.id = appCtxt.get(ZmSetting.USERID);
	tmpShare.grantor.email = appCtxt.get(ZmSetting.USERNAME);
	tmpShare.grantor.name = appCtxt.get(ZmSetting.DISPLAY_NAME) || tmpShare.grantor.email;
	tmpShare.link.id = share.object.id;
	tmpShare.link.name = share.object.name;
	tmpShare.link.view = ZmOrganizer.getViewName(share.object.type);
	tmpShare.link.perm = share.link.perm;

	if(share.grantee.type == "guest") {	
		if (!this._guestFormatter) {
			this._guestFormatter = new AjxMessageFormat(ZmMsg.shareWithGuestNotes);
		}
		var url = share.object.getRestUrl();
		var username = tmpShare.grantee.email;
		var password = share.link.pw;
		
		if(password && username) {
			var args = [ url, username, password ];
			var notes = this._guestFormatter.format(args);
			tmpShare.notes = notes;
		}
	}

	tmpShare.sendMessage(ZmShare.NEW);	
	appCtxt.setStatusMsg(ZmMsg.resentShareMessage);
	
	return false;
};

ZmFolderPropsDialog.prototype._handleAddShareButton =
function(event) {
	var sharePropsDialog = appCtxt.getSharePropsDialog();
	sharePropsDialog.popup(ZmSharePropsDialog.NEW, this._organizer, null);
};

ZmFolderPropsDialog.prototype._handleOkButton =
function(event) {
	if (!this._handleErrorCallback) {
		this._handleErrorCallback = new AjxCallback(this, this._handleError);
		this._handleRenameErrorCallback = new AjxCallback(this, this._handleRenameError);
	}

	// rename folder
	var callback = new AjxCallback(this, this._handleColor);
	var organizer = this._organizer;
	if (!organizer.isSystem()) {
		var name = this._nameInputEl.value;
		if (organizer.name != name) {
			organizer.rename(name, callback, this._handleRenameErrorCallback);
			return;
		}
	}

	// else, start by changing color
	callback.run(null);
};

ZmFolderPropsDialog.prototype._handleColor =
function(response) {
	// change color
	var callback = new AjxCallback(this, this._handleFreeBusy);
	var organizer = this._organizer;
	var color = this._color.getValue();
	if (organizer.color != color) {
		organizer.setColor(color, callback, this._handleErrorCallback);
		return;
	}

	// else, change free/busy
	callback.run(response);
};

ZmFolderPropsDialog.prototype._handleFreeBusy =
function(response) {
	// set free/busy
	var callback = new AjxCallback(this, this.popdown);
	var organizer = this._organizer;
	if (Dwt.getVisible(this._excludeFbEl) && organizer.setFreeBusy) {
		var excludeFreeBusy = this._excludeFbCheckbox.checked;
		if (organizer.excludeFreeBusy != excludeFreeBusy) {
			organizer.setFreeBusy(excludeFreeBusy, callback, this._handleErrorCallback);
			return;
		}
	}

	// else, popdown
	callback.run(response);
};

ZmFolderPropsDialog.prototype._handleError =
function(response) {
	// TODO: Default handling?
};

ZmFolderPropsDialog.prototype._handleRenameError =
function(response) {
	var value = this._nameInputEl.value;
	var msg, detail;
	if (response.code == ZmCsfeException.MAIL_ALREADY_EXISTS) {
		msg = AjxMessageFormat.format(ZmMsg.errorAlreadyExists, [value]);
	} else if (response.code == ZmCsfeException.MAIL_IMMUTABLE) {
		msg = AjxMessageFormat.format(ZmMsg.errorCannotRename, [value]);
	}
	appCtxt.getAppController().popupErrorDialog(msg, response.msg, null, true);
	return true;
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
		organizer = organizers ? organizers[0] : null;
		if(organizer.id != this._organizer.id){
			return;
		}
	} else {
		organizer = this._organizer;
	}
	if (!organizer) { return; }
	
	if (organizer.isSystem()) {
		this._nameOutputEl.innerHTML = AjxStringUtil.htmlEncode(organizer.name);
		this._nameOutputEl.style.display = "block";
		this._nameInputEl.style.display = "none";
	}
	else {
		this._nameInputEl.value = organizer.name;
		this._nameInputEl.style.display = "block";
		this._nameOutputEl.style.display = "none";
	}
	this._ownerEl.innerHTML = AjxStringUtil.htmlEncode(organizer.owner);
	this._typeEl.innerHTML = ZmMsg[ZmOrganizer.FOLDER_KEY[organizer.type]] || ZmMsg.folder;
	this._urlEl.innerHTML = organizer.url || "";
	this._color.setSelectedValue(organizer.color);
	this._excludeFbCheckbox.checked = organizer.excludeFreeBusy;

	var showPerm = organizer.link && organizer.shares && organizer.shares.length > 0;
	if (showPerm) {
		AjxDispatcher.require("Share");
		this._permEl.innerHTML = ZmShare.getRoleActions(organizer.shares[0].link.perm);
	}

	if (appCtxt.get(ZmSetting.SHARING_ENABLED) &&
		appCtxt.get(ZmSetting.GROUP_CALENDAR_ENABLED))
	{
		this._populateShares(organizer);
	}

	this._props.setPropertyVisible(this._ownerId, organizer.owner != null);
	this._props.setPropertyVisible(this._urlId, organizer.url != null);
	this._props.setPropertyVisible(this._permId, showPerm);

	Dwt.setVisible(this._excludeFbEl, !organizer.link && (organizer.type == ZmOrganizer.CALENDAR));
};

ZmFolderPropsDialog.prototype._populateShares =
function(organizer) {
	this._sharesGroup.setContent("");

	var link = organizer.link;
	var shares = organizer.shares;
	var visible = (!link && shares && shares.length > 0);
	if (visible) {
		AjxDispatcher.require("Share");
		var table = document.createElement("TABLE");
		table.border = 0;
		table.cellSpacing = 0;
		table.cellPadding = 3;
		for (var i = 0; i < shares.length; i++) {
			var share = shares[i];
			var row = table.insertRow(-1);

			var nameEl = row.insertCell(-1);
			nameEl.style.paddingRight = "15px";
			var nameText = share.grantee.name || share.grantee.id;
			if (share.isAll()) nameText = ZmMsg.shareWithAll;
			else if (share.isPublic()) nameText = ZmMsg.shareWithPublic;
			nameEl.innerHTML = AjxStringUtil.htmlEncode(nameText);

			var roleEl = row.insertCell(-1);
			roleEl.style.paddingRight = "15px";
			roleEl.innerHTML = ZmShare.getRoleName(share.link.perm);

			this.__createCmdCells(row, share);
		}
		this._sharesGroup.setElement(table);

		var width = Dwt.DEFAULT;
		var height = shares.length > 5 ? ZmFolderPropsDialog.SHARES_HEIGHT : Dwt.CLEAR;

		var insetElement = this._sharesGroup.getInsetHtmlElement();
		Dwt.setScrollStyle(insetElement, Dwt.SCROLL);
		Dwt.setSize(insetElement, width, height);
	}

	this._sharesGroup.setVisible(visible);
};

ZmFolderPropsDialog.prototype.__createCmdCells =
function(row, share) {
	var type = share.grantee.type;
	if (type == ZmShare.TYPE_ALL || type == ZmShare.TYPE_DOMAIN || !ZmShare.ROLES[share.link.perm]) {
		var cell = row.insertCell(-1);
		cell.colSpan = 3;
		cell.innerHTML = ZmMsg.configureWithAdmin;
		return;
	}

	var labels = [ ZmMsg.edit, ZmMsg.revoke, ZmMsg.resend ];
	var actions = [
		this._handleEditShare, this._handleRevokeShare, this._handleResendShare
	];
	for (var i = 0; i < labels.length; i++) {
		var cell = row.insertCell(-1);

		var action = actions[i];
		// public shares have no editable fields, and sent no mail
		if (share.isPublic() && (action == this._handleEditShare ||
								 action == this._handleResendShare)) continue;

		// Guest share need to have an "resend" options, thus commented.						 
		//if (share.isGuest() && (action == this._handleResendShare)) continue;

		var link = document.createElement("A");
		link.href = "#";
		link.innerHTML = labels[i];

		Dwt.setHandler(link, DwtEvent.ONCLICK, action);
		Dwt.associateElementWithObject(link, share);

		cell.appendChild(link);
	}
};

ZmFolderPropsDialog.prototype._createView =
function() {
	var view = new DwtComposite(this);

	// create html elements
	var doc = document;
	this._nameOutputEl = doc.createElement("SPAN");
	this._nameInputEl = doc.createElement("INPUT");
	this._nameInputEl.style.width = "20em";
	this._nameInputEl._dialog = this;
	var nameElement = this._nameInputEl;
	if (Dwt.CARET_HACK_ENABLED) {
		nameElement = doc.createElement("DIV");
		nameElement.style.overflow = "auto";
		nameElement.appendChild(this._nameInputEl);
	}
	
	this._ownerEl = doc.createElement("DIV");
	this._typeEl = doc.createElement("DIV");
	this._urlEl = doc.createElement("DIV");
	this._permEl = doc.createElement("DIV");

	var nameEl = doc.createElement("DIV");
	nameEl.appendChild(this._nameOutputEl);
	nameEl.appendChild(nameElement);

	this._excludeFbCheckbox = doc.createElement("INPUT");
	this._excludeFbCheckbox.type = "checkbox";
	this._excludeFbCheckbox._dialog = this;
	
	this._excludeFbEl = doc.createElement("DIV");
	this._excludeFbEl.style.display = "none";
	this._excludeFbEl.appendChild(this._excludeFbCheckbox);
	this._excludeFbEl.appendChild(doc.createTextNode(ZmMsg.excludeFromFreeBusy));

	// setup properties group
	var propsGroup = new DwtGrouper(view);
	propsGroup.setLabel(ZmMsg.properties);

	this._props = new DwtPropertySheet(propsGroup);
	this._color = new DwtSelect({parent:this._props});
	for (var i = 0; i < ZmOrganizer.COLOR_CHOICES.length; i++) {
		var color = ZmOrganizer.COLOR_CHOICES[i];
		this._color.addOption(color.label, false, color.value);
	}

	this._props.addProperty(ZmMsg.nameLabel, nameEl);
	this._props.addProperty(ZmMsg.typeLabel, this._typeEl);
	this._ownerId = this._props.addProperty(ZmMsg.ownerLabel, this._ownerEl);
	this._urlId = this._props.addProperty(ZmMsg.urlLabel, this._urlEl);
	this._permId = this._props.addProperty(ZmMsg.permissions, this._permEl)
	this._props.addProperty(ZmMsg.colorLabel, this._color);

	var propsContainer = doc.createElement("DIV");
	propsContainer.appendChild(this._props.getHtmlElement());
	propsContainer.appendChild(this._excludeFbEl);
	
	propsGroup.setElement(propsContainer);

	// setup shares group
	if (appCtxt.get(ZmSetting.SHARING_ENABLED) &&
		appCtxt.get(ZmSetting.GROUP_CALENDAR_ENABLED))
	{
		this._sharesGroup = new DwtGrouper(view);
		this._sharesGroup.setLabel(ZmMsg.folderSharing);
		this._sharesGroup.setVisible(false);
		this._sharesGroup.setScrollStyle(Dwt.SCROLL);
	}

	// add everything to view and return
	var element = view.getHtmlElement();
	element.appendChild(propsGroup.getHtmlElement());
	if (appCtxt.get(ZmSetting.SHARING_ENABLED) &&
		appCtxt.get(ZmSetting.GROUP_CALENDAR_ENABLED))
	{
		element.appendChild(this._sharesGroup.getHtmlElement());
	}

	return view;
};
