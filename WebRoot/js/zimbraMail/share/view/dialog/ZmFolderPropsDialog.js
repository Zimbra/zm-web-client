/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2005, 2006, 2007, 2008, 2009, 2010 Zimbra, Inc.
 * 
 * The contents of this file are subject to the Zimbra Public License
 * Version 1.3 ("License"); you may not use this file except in
 * compliance with the License.  You may obtain a copy of the License at
 * http://www.zimbra.com/license.
 * 
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * ***** END LICENSE BLOCK *****
 */

/**
 * @overview
 */

/**
 * Creates a folder properties dialog.
 * @class
 * This class represents a folder properties dialog.
 * 
 * @param	{DwtControl}	parent		the parent
 * @param	{String}	className		the class name
 * 
 * @extends		DwtDialog
 */
ZmFolderPropsDialog = function(parent, className) {
	className = className || "ZmFolderPropsDialog";
	var extraButtons;
	if (appCtxt.get(ZmSetting.SHARING_ENABLED))	{
		extraButtons = [
			new DwtDialog_ButtonDescriptor(ZmFolderPropsDialog.ADD_SHARE_BUTTON, ZmMsg.addShare, DwtDialog.ALIGN_LEFT)
		];
	}

	DwtDialog.call(this, {parent:parent, className:className, title:ZmMsg.folderProperties, extraButtons:extraButtons});

	if (appCtxt.get(ZmSetting.SHARING_ENABLED))	{
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

/**
 * Pops-up the properties dialog.
 * 
 * @param	{ZmOrganizer}	organizer		the organizer
 */
ZmFolderPropsDialog.prototype.popup =
function(organizer) {
	this._organizer = organizer;
	organizer.addChangeListener(this._folderChangeListener);

	if (this._color) {
        var icon = organizer.getIcon(); 
        this._color.setImage(icon);
        this._color.setValue(organizer.rgb);
	}

	this._handleFolderChange();
	if (appCtxt.get(ZmSetting.SHARING_ENABLED))	{
		var isVisible = (!organizer.link || organizer.isAdmin());
		this.setButtonVisible(ZmFolderPropsDialog.ADD_SHARE_BUTTON, isVisible);
	}

	DwtDialog.prototype.popup.call(this);

	if (this._nameInputEl.style.display != "none") {
		this._nameInputEl.focus();
	}
};

ZmFolderPropsDialog.prototype.popdown =
function() {
	if (this._organizer) {
		this._organizer.removeChangeListener(this._folderChangeListener);
		this._organizer = null;
	}
	DwtDialog.prototype.popdown.call(this);
};

// Protected methods

ZmFolderPropsDialog.prototype._getSeparatorTemplate =
function() {
	return "";
};

ZmFolderPropsDialog.prototype._handleEditShare =
function(event, share) {
	share = share || Dwt.getObjectFromElement(DwtUiEvent.getTarget(event));
	var sharePropsDialog = appCtxt.getSharePropsDialog();
	sharePropsDialog.popup(ZmSharePropsDialog.EDIT, share.object, share);
	return false;
};

ZmFolderPropsDialog.prototype._handleRevokeShare =
function(event, share) {
	share = share || Dwt.getObjectFromElement(DwtUiEvent.getTarget(event));
	var revokeShareDialog = appCtxt.getRevokeShareDialog();
	revokeShareDialog.popup(share);
	return false;
};

ZmFolderPropsDialog.prototype._handleResendShare =
function(event, share) {

	AjxDispatcher.require("Share");
	share = share || Dwt.getObjectFromElement(DwtUiEvent.getTarget(event));

	// create share info
	var tmpShare = new ZmShare({object:share.object});
	tmpShare.grantee.id = share.grantee.id;
	tmpShare.grantee.email = (share.grantee.type == "guest") ? share.grantee.id : share.grantee.name;
	tmpShare.grantee.name = share.grantee.name;
    if (tmpShare.object.isRemote()) {
		tmpShare.grantor.id = tmpShare.object.zid;
		tmpShare.grantor.email = tmpShare.object.owner;
		tmpShare.grantor.name = tmpShare.grantor.email;
		tmpShare.link.id = tmpShare.object.rid;
	} else {
		tmpShare.grantor.id = appCtxt.get(ZmSetting.USERID);
		tmpShare.grantor.email = appCtxt.get(ZmSetting.USERNAME);
		tmpShare.grantor.name = appCtxt.get(ZmSetting.DISPLAY_NAME) || tmpShare.grantor.email;
		tmpShare.link.id = tmpShare.object.id;
	}

	tmpShare.link.name = share.object.name;
	tmpShare.link.view = ZmOrganizer.getViewName(share.object.type);
	tmpShare.link.perm = share.link.perm;

	if (share.grantee.type == "guest") {
		if (!this._guestFormatter) {
			this._guestFormatter = new AjxMessageFormat(ZmMsg.shareWithGuestNotes);
		}
		var url = share.object.getRestUrl();
		var username = tmpShare.grantee.email;
		var password = share.link.pw;

		if (password && username) {
			tmpShare.notes = this._guestFormatter.format([url, username, password]);
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
	if (!organizer.isSystem() && !organizer.isDataSource()) {
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
	var color = this._color.getValue() || ZmOrganizer.DEFAULT_COLOR[organizer.type];
	if (organizer.color != color) {
        if (String(color).match(/^#/)) {
            organizer.setRGB(color, callback, this._handleErrorCallback);
        }
        else {
            organizer.setColor(color, callback, this._handleErrorCallback);
        }
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
	} else if (response.code == ZmCsfeException.SVC_INVALID_REQUEST) { 
		msg = response.msg; // triggered on an empty name
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
	var organizer = this._organizer;
	
	if (organizer.isSystem() || organizer.isDataSource()) {
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
	if (this._color) {
		this._color.setValue(organizer.rgb || ZmOrganizer.COLOR_VALUES[organizer.color]);
		var isVisible = (organizer.type != ZmOrganizer.FOLDER ||
						 (organizer.type == ZmOrganizer.FOLDER && appCtxt.get(ZmSetting.MAIL_FOLDER_COLORS_ENABLED)));
		this._props.setPropertyVisible(this._colorId, isVisible);
	}
	this._excludeFbCheckbox.checked = organizer.excludeFreeBusy;

	var showPerm = organizer.isMountpoint;
	if (showPerm) {
		AjxDispatcher.require("Share");
		var share = ZmShare.getShareFromLink(organizer);
		var role = share && share.link && share.link.role;
		this._permEl.innerHTML = ZmShare.getRoleActions(role);
	}

	if (appCtxt.get(ZmSetting.SHARING_ENABLED))	{
		this._populateShares(organizer);
	}

	this._props.setPropertyVisible(this._ownerId, organizer.owner != null);
	this._props.setPropertyVisible(this._urlId, organizer.url);
	this._props.setPropertyVisible(this._permId, showPerm);

	Dwt.setVisible(this._excludeFbEl, !organizer.link && (organizer.type == ZmOrganizer.CALENDAR));
};

ZmFolderPropsDialog.prototype._populateShares =
function(organizer) {

	this._sharesGroup.setContent("");

	var displayShares = this._getDisplayShares(organizer);

	var getFolder = false;
	if (displayShares.length) {
		for (var i = 0; i < displayShares.length; i++) {
			var share = displayShares[i];
			if (!(share.grantee && share.grantee.name)) {
				getFolder = true;
			}
		}
	}

	if (getFolder) {
		var respCallback = new AjxCallback(this, this._handleResponseGetFolder, [displayShares]);
		organizer.getFolder(respCallback);
	} else {
		this._handleResponseGetFolder(displayShares);
	}


	this._sharesGroup.setVisible(displayShares.length > 0);
};

ZmFolderPropsDialog.prototype._getDisplayShares =
function(organizer) {

	var shares = organizer.shares;
	var displayShares = [];
	if ((!organizer.link || organizer.isAdmin()) && shares && shares.length > 0) {
		AjxDispatcher.require("Share");
		var userZid = appCtxt.accountList.mainAccount.id;
		// if a folder was shared with us with admin rights, a share is created since we could share it;
		// don't show any share that's for us in the list
		for (var i = 0; i < shares.length; i++) {
			var share = shares[i];
			if (share.grantee) {
				var granteeId = share.grantee.id;
				if ((share.grantee.type != ZmShare.TYPE_USER) || (share.grantee.id != userZid)) {
					displayShares.push(share);
				}
			}
		}
	}

	return displayShares;
};

ZmFolderPropsDialog.prototype._handleResponseGetFolder =
function(displayShares, organizer) {

	if (organizer) {
		displayShares = this._getDisplayShares(organizer);
	}

	if (displayShares.length) {
		var table = document.createElement("TABLE");
		table.border = 0;
		table.cellSpacing = 0;
		table.cellPadding = 3;
		for (var i = 0; i < displayShares.length; i++) {
			var share = displayShares[i];
			var row = table.insertRow(-1);
			var nameEl = row.insertCell(-1);
			nameEl.style.paddingRight = "15px";
			var nameText = share.grantee && share.grantee.name;
			if (share.isAll()) {
				nameText = ZmMsg.shareWithAll;
			} else if (share.isPublic()) {
				nameText = ZmMsg.shareWithPublic;
			} else if (share.isGuest()){
                nameText = nameText || (share.grantee && share.grantee.id);
			}
			nameEl.innerHTML = AjxStringUtil.htmlEncode(nameText);

			var roleEl = row.insertCell(-1);
			roleEl.style.paddingRight = "15px";
			roleEl.innerHTML = ZmShare.getRoleName(share.link.role);

			this.__createCmdCells(row, share);
		}
		this._sharesGroup.setElement(table);

		var width = Dwt.DEFAULT;
		var height = displayShares.length > 5 ? ZmFolderPropsDialog.SHARES_HEIGHT : Dwt.CLEAR;

		var insetElement = this._sharesGroup.getInsetHtmlElement();
		Dwt.setScrollStyle(insetElement, Dwt.SCROLL);
		Dwt.setSize(insetElement, width, height);
	}

	this._sharesGroup.setVisible(displayShares.length > 0);
};

ZmFolderPropsDialog.prototype.__createCmdCells =
function(row, share) {
	var type = share.grantee.type;
	if (type == ZmShare.TYPE_DOMAIN || !share.link.role) {
		var cell = row.insertCell(-1);
		cell.colSpan = 3;
		cell.innerHTML = ZmMsg.configureWithAdmin;
		return;
	}

	var actions = [ZmShare.EDIT, ZmShare.REVOKE, ZmShare.RESEND];
	var handlers = [this._handleEditShare, this._handleRevokeShare, this._handleResendShare];

	for (var i = 0; i < actions.length; i++) {
		var action = actions[i];
		var cell = row.insertCell(-1);

		// public shares have no editable fields, and sent no mail
		var isAllShare = share.grantee && (share.grantee.type == ZmShare.TYPE_ALL);
		if ((isAllShare || share.isPublic()) && (action == ZmShare.EDIT || action == ZmShare.RESEND)) { continue; }

		var link = document.createElement("A");
		link.href = "#";
		link.innerHTML = ZmShare.ACTION_LABEL[action];

		Dwt.setHandler(link, DwtEvent.ONCLICK, handlers[i]);
		Dwt.associateElementWithObject(link, share);

		cell.appendChild(link);
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
	var nameElement = this._nameInputEl;

	this._ownerEl = document.createElement("DIV");
	this._typeEl = document.createElement("DIV");
	this._urlEl = document.createElement("DIV");
	this._permEl = document.createElement("DIV");

	var nameEl = document.createElement("DIV");
	nameEl.appendChild(this._nameOutputEl);
	nameEl.appendChild(nameElement);

	this._excludeFbCheckbox = document.createElement("INPUT");
	this._excludeFbCheckbox.type = "checkbox";
	this._excludeFbCheckbox._dialog = this;

	this._excludeFbEl = document.createElement("DIV");
	this._excludeFbEl.style.display = "none";
	this._excludeFbEl.appendChild(this._excludeFbCheckbox);
	this._excludeFbEl.appendChild(document.createTextNode(ZmMsg.excludeFromFreeBusy));

	// setup properties group
	var propsGroup = new DwtGrouper(view);
	propsGroup.setLabel(ZmMsg.properties);

	this._props = new DwtPropertySheet(propsGroup);
	this._color = new ZmColorButton({parent:this});

	this._props.addProperty(ZmMsg.nameLabel, nameEl);
	this._props.addProperty(ZmMsg.typeLabel, this._typeEl);
	this._ownerId = this._props.addProperty(ZmMsg.ownerLabel, this._ownerEl);
	this._urlId = this._props.addProperty(ZmMsg.urlLabel, this._urlEl);
	this._permId = this._props.addProperty(ZmMsg.permissions, this._permEl);
	this._colorId = this._props.addProperty(ZmMsg.colorLabel, this._color);

	var propsContainer = document.createElement("DIV");
	propsContainer.appendChild(this._props.getHtmlElement());
	propsContainer.appendChild(this._excludeFbEl);
	
	propsGroup.setElement(propsContainer);

	// setup shares group
	if (appCtxt.get(ZmSetting.SHARING_ENABLED))	{
		this._sharesGroup = new DwtGrouper(view);
		this._sharesGroup.setLabel(ZmMsg.folderSharing);
		this._sharesGroup.setVisible(false);
		this._sharesGroup.setScrollStyle(Dwt.SCROLL);
	}

	// add everything to view and return
	var element = view.getHtmlElement();
	element.appendChild(propsGroup.getHtmlElement());
	if (appCtxt.get(ZmSetting.SHARING_ENABLED))	{
		element.appendChild(this._sharesGroup.getHtmlElement());
	}

	return view;
};
