/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2011, 2012, 2013, 2014, 2015, 2016 Synacor, Inc.
 *
 * The contents of this file are subject to the Common Public Attribution License Version 1.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at: https://www.zimbra.com/license
 * The License is based on the Mozilla Public License Version 1.1 but Sections 14 and 15
 * have been added to cover use of software over a computer network and provide for limited attribution
 * for the Original Developer. In addition, Exhibit A has been modified to be consistent with Exhibit B.
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * See the License for the specific language governing rights and limitations under the License.
 * The Original Code is Zimbra Open Source Web Client.
 * The Initial Developer of the Original Code is Zimbra, Inc.  All rights to the Original Code were
 * transferred by Zimbra, Inc. to Synacor, Inc. on September 14, 2015.
 *
 * All portions of the code are Copyright (C) 2011, 2012, 2013, 2014, 2015, 2016 Synacor, Inc. All Rights Reserved.
 * ***** END LICENSE BLOCK *****
 */

/**
 * @overview
 */

/**
 * Creates a folder properties view for the folder dialog
 * @class
 * This class represents a folder properties view
 * 
 * @param	{DwtControl}	parent		the parent (dialog)
 * @param	{String}	className		the class name
 * 
 * @extends		DwtDialog
 */
ZmFolderPropertyView = function(dialog, parent) {
    if (arguments.length == 0) return;
    ZmFolderDialogTabView.call(this, parent, "ZmFolderPropertyView");
    this._dialog = dialog;

};

ZmFolderPropertyView.prototype = new ZmFolderDialogTabView;
ZmFolderPropertyView.prototype.constructor = ZmFolderPropertyView;


// Public methods

ZmFolderPropertyView.prototype.toString =
function() {
	return "ZmFolderPropertyView";
};

ZmFolderPropertyView.prototype.getTitle =
function() {
    return ZmMsg.folderTabProperties;
}

ZmFolderPropertyView.prototype.showMe =
function() {
	DwtTabViewPage.prototype.showMe.call(this);
    if (appCtxt.get(ZmSetting.SHARING_ENABLED)) {
        this._dialog.setButtonVisible(ZmFolderPropsDialog.ADD_SHARE_BUTTON, true);
    }

	this.setSize(Dwt.DEFAULT, "100");
    if (Dwt.getVisible(this._nameInputEl)) {
        this._nameInputEl.focus();
    }
};


/**  doSave will be invoked for each tab view.
 *
 * @param	{BatchCommand}	batchCommand	Accumulates updates from all tabs
 * @param	{Object}	    saveState		Accumulates error messages and indication of any update
 */
ZmFolderPropertyView.prototype.doSave =
function(batchCommand, saveState) {
	if (!this._handleErrorCallback) {
        this._handleErrorCallback = this._handleError.bind(this);
		this._handleRenameErrorCallback = this._handleRenameError.bind(this);
	}

	// rename folder followed by attribute processing
	var organizer = this._organizer;

    if (!organizer.isSystem() && !organizer.isDataSource()) {
		var name = this._nameInputEl.value;
		if (organizer.name != name) {
			var error = ZmOrganizer.checkName(name);
			if (error) {
                saveState.errorMessage.push(error);
                // Only error checking for now.  If additional, should not return here
				return;
			}
            batchCommand.add(new AjxCallback(organizer, organizer.rename, [name, null, this._handleRenameErrorCallback]));
            saveState.commandCount++;
		}
	}

    if (!organizer.isDataSource() && appCtxt.isWebClientOfflineSupported) {
        var webOfflineSyncDays = $('#folderOfflineLblId').val() || 0;
		if (organizer.webOfflineSyncDays != webOfflineSyncDays) {
			var error = ZmOrganizer.checkWebOfflineSyncDays(webOfflineSyncDays);
			if (error) {
                saveState.errorMessage.push(error);
                // Only error checking for now.  If additional, should not return here
				return;
			}
            batchCommand.add(new AjxCallback(organizer, organizer.setOfflineSyncInterval, [webOfflineSyncDays, null, this._handleErrorCallback]));
            saveState.commandCount++;
		}
	}

	var color = this._color.getValue() || ZmOrganizer.DEFAULT_COLOR[organizer.type];
	if (organizer.isColorChanged(color, organizer.color, organizer.rgb)) {
		if (ZmOrganizer.getStandardColorNumber(color) === -1) {
            batchCommand.add(new AjxCallback(organizer, organizer.setRGB, [color, null, this._handleErrorCallback]));
		}
		else {
            batchCommand.add(new AjxCallback(organizer, organizer.setColor, [color, null, this._handleErrorCallback]));
		}
        saveState.commandCount++;
	}

    if (Dwt.getVisible(this._excludeFbEl) && organizer.setFreeBusy) {
        var excludeFreeBusy = this._excludeFbCheckbox.checked;
		if (organizer.excludeFreeBusy != excludeFreeBusy) {
            batchCommand.add(new AjxCallback(organizer, organizer.setFreeBusy, [excludeFreeBusy, null, this._handleErrorCallback]));
            saveState.commandCount++;
		}
    }

    // Mail Folders only
    if (Dwt.getVisible(this._globalMarkReadEl) && organizer.globalMarkRead) {
        var globalMarkRead = this._globalMarkReadCheckbox.checked;
        if (organizer.globalMarkRead != globalMarkRead) {
            batchCommand.add(new AjxCallback(organizer, organizer.setGlobalMarkRead, [globalMarkRead, null, this._handleErrorCallback]));
            saveState.commandCount++;
        }
    }

	// Saved searches
	if (Dwt.getVisible(this._queryInputEl) && organizer.type === ZmOrganizer.SEARCH) {
		var query = this._queryInputEl.value;
		if (organizer.search.query !== query) {
			batchCommand.add(new AjxCallback(organizer, organizer.setQuery, [query, null, this._handleErrorCallback]));
			saveState.commandCount++;
		}
	}
};

ZmFolderPropertyView.prototype._handleFolderChange =
function(event) {
	var organizer = this._organizer;

    var colorCode = 0;
    if (this._color) {
        var icon = organizer.getIcon();
        this._color.setImage(icon);

		var colorCode = organizer.isColorCustom ? organizer.rgb : organizer.color;
		
        var defaultColorCode = ZmOrganizer.DEFAULT_COLOR[organizer.type],
            defaultColor = ZmOrganizer.COLOR_VALUES[defaultColorCode],
            colorMenu = this._color.getMenu(),
            moreColorMenu;
        if (colorMenu) {
            moreColorMenu = (colorMenu.toString() == "ZmMoreColorMenu") ? colorMenu : colorMenu._getMoreColorMenu();
            if (moreColorMenu) {
				moreColorMenu.setDefaultColor(defaultColor);
			}
        }
        this._color.setValue(colorCode);
		var folderId = organizer.getSystemEquivalentFolderId() || organizer.id;
		this._color.setEnabled(folderId != ZmFolder.ID_DRAFTS);
		var isVisible = (organizer.type != ZmOrganizer.FOLDER ||
						 (organizer.type == ZmOrganizer.FOLDER && appCtxt.get(ZmSetting.MAIL_FOLDER_COLORS_ENABLED)));
		this._props.setPropertyVisible(this._colorId, isVisible);
    }

	if (organizer.isSystem() || organizer.isDataSource()) {
		Dwt.setVisible(this._nameInputEl,  true);
		this._nameInputEl.value = organizer.name;
		this._nameInputEl.disabled = true;
		this._nameInputEl.style.cursor = "not-allowed";
	}
	else {
		this._nameInputEl.value = organizer.name;
		this._nameInputEl.disabled = false;
		Dwt.setVisible(this._nameInputEl,  true);
		this._nameInputEl.style.cursor = "text";
	}

	var hasFolderInfo = !!organizer.getToolTip();
	if (hasFolderInfo) {
		var unreadProp = this._props.getProperty(this._unreadId),
			unreadLabel = unreadProp && document.getElementById(unreadProp.labelId);
		if (unreadLabel) {
			unreadLabel.innerHTML = AjxMessageFormat.format(ZmMsg.makeLabel, organizer._getUnreadLabel());
		}
		this._unreadEl.innerHTML = organizer.numUnread;
		var totalProp = this._props.getProperty(this._totalId),
			totalLabel = totalProp && document.getElementById(totalProp.labelId);
		if (totalLabel) {
			totalLabel.innerHTML = AjxMessageFormat.format(ZmMsg.makeLabel, organizer._getItemsText());
		}
		this._totalEl.innerHTML = organizer.numTotal;
		this._sizeEl.innerHTML = AjxUtil.formatSize(organizer.sizeTotal);
	}
	this._props.setPropertyVisible(this._unreadId, hasFolderInfo && organizer.numUnread);
	this._props.setPropertyVisible(this._totalId, hasFolderInfo);
	this._props.setPropertyVisible(this._sizeId, hasFolderInfo && organizer.sizeTotal);

	if (organizer.type === ZmOrganizer.SEARCH) {
		this._queryInputEl.value = organizer.search.query;
		this._props.setPropertyVisible(this._queryId, true);
	}
	else {
		this._props.setPropertyVisible(this._queryId, false);
	}

	this._ownerEl.innerHTML = AjxStringUtil.htmlEncode(organizer.owner);
	this._typeEl.innerHTML = ZmMsg[ZmOrganizer.FOLDER_KEY[organizer.type]] || ZmMsg.folder;

    this._excludeFbCheckbox.checked = organizer.excludeFreeBusy;

	var showPerm = organizer.isMountpoint;
	if (showPerm) {
		AjxDispatcher.require("Share");
		var share = ZmShare.getShareFromLink(organizer);
		var role = share && share.link && share.link.role;
		this._permEl.innerHTML = ZmShare.getRoleActions(role);
	}

    var url = organizer.url ? AjxStringUtil.htmlEncode(organizer.url).replace(/&amp;/g,'%26') : null;
	var urlDisplayString = url;
	if (urlDisplayString) {
		urlDisplayString = [ '<a target=_new href="',url,'">', AjxStringUtil.clipByLength(urlDisplayString, 50), '</a>' ].join("");
	}

    this._urlEl.innerHTML = urlDisplayString || "";

	this._props.setPropertyVisible(this._ownerId, organizer.owner != null);

	this._props.setPropertyVisible(this._urlId, organizer.url);
	this._props.setPropertyVisible(this._permId, showPerm);
    $('#folderOfflineLblId').val(organizer.webOfflineSyncDays || 0)

	Dwt.setVisible(this._excludeFbEl, !organizer.link && (organizer.type == ZmOrganizer.CALENDAR));
	// TODO: False until server handling of the flag is added
	//Dwt.setVisible(this._globalMarkReadEl, organizer.type == ZmOrganizer.FOLDER);
    Dwt.setVisible(this._globalMarkReadEl, false);

	if (this._offlineId) {
		var enabled = false;
		if (!organizer.isMountpoint) {
			enabled = (this._organizer.type == ZmOrganizer.FOLDER);
		}
		this._props.setPropertyVisible(this._offlineId, enabled);
	}
};


ZmFolderPropertyView.prototype._handleRenameError =
function(response) {
	var value = this._nameInputEl.value;
    var type = appCtxt.getFolderTree(appCtxt.getActiveAccount()).getFolderTypeByName(value);
	var msg;
	var noDetails = false;
	if (response.code == ZmCsfeException.MAIL_ALREADY_EXISTS) {
		msg = AjxMessageFormat.format(ZmMsg.errorAlreadyExists, [value,ZmMsg[type.toLowerCase()]]);
	} else if (response.code == ZmCsfeException.MAIL_IMMUTABLE) {
		msg = AjxMessageFormat.format(ZmMsg.errorCannotRename, [value]);
	} else if (response.code == ZmCsfeException.SVC_INVALID_REQUEST) {
		msg = response.msg; // triggered on an empty name
	} else if (response.code == ZmCsfeException.MAIL_INVALID_NAME) {
		//I add this here despite checking upfront using ZmOrganizer.checkName, since there might be more restrictions for different types of organizers. so just in case the server still returns an error in the name.
		msg = AjxMessageFormat.format(ZmMsg.invalidName, [AjxStringUtil.htmlEncode(value)]);
		noDetails = true;
	}
	appCtxt.getAppController().popupErrorDialog(msg, noDetails ? null : response.msg, null, true);
	return true;
};

// TODO: This seems awkward. Should use a template.
ZmFolderPropertyView.prototype._createView = function() {

	// create html elements
	this._nameInputEl = document.createElement("INPUT");
	this._nameInputEl.setAttribute("type", "text");
	Dwt.addClass(this._nameInputEl, "Field");
	this._nameInputEl._dialog = this;
	var nameElement = this._nameInputEl;

	this._queryInputEl = document.createElement("INPUT");
	this._queryInputEl.setAttribute("type", "text");
	Dwt.addClass(this._queryInputEl, "Field");
	this._queryInputEl._dialog = this;
	var queryElement = this._queryInputEl;

	this._ownerEl = document.createElement("DIV");
	this._typeEl = document.createElement("DIV");
	this._urlEl = document.createElement("DIV");
	this._permEl = document.createElement("DIV");

	this._unreadEl = document.createElement("SPAN");
	this._totalEl = document.createElement("SPAN");
	this._sizeEl = document.createElement("SPAN");

	var nameEl = document.createElement("DIV");
	nameEl.appendChild(nameElement);

	var queryEl = document.createElement("DIV");
	queryEl.appendChild(queryElement);

	var excludeFbEl      = this._createCheckboxItem("excludeFb",        ZmMsg.excludeFromFreeBusy);
	var globalMarkReadEl = this._createCheckboxItem("globalMarkRead",   ZmMsg.globalMarkRead);

	this._props = new DwtPropertySheet(this);
	this._color = new ZmColorButton({parent:this});

	var namePropId = this._props.addProperty(ZmMsg.nameLabel, nameEl);
	this._props.addProperty(ZmMsg.typeLabel, this._typeEl);
	this._queryId = this._props.addProperty(ZmMsg.queryLabel, queryEl);
	this._ownerId = this._props.addProperty(ZmMsg.ownerLabel,  this._ownerEl);
	this._urlId   = this._props.addProperty(ZmMsg.urlLabel,    this._urlEl);
	this._permId  = this._props.addProperty(ZmMsg.permissions, this._permEl);
	this._colorId = this._props.addProperty(ZmMsg.colorLabel,  this._color);
	this._totalId = this._props.addProperty(AjxMessageFormat.format(ZmMsg.makeLabel, ZmMsg.messages),  this._totalEl);
	this._unreadId = this._props.addProperty(AjxMessageFormat.format(ZmMsg.makeLabel, ZmMsg.unread),  this._unreadEl);
	this._sizeId = this._props.addProperty(ZmMsg.sizeLabel,  this._sizeEl);

    if (appCtxt.isWebClientOfflineSupported) {
        this._offlineEl = document.createElement("DIV");
		this._offlineEl.style.whiteSpace = "nowrap";
		this._offlineEl.innerHTML = AjxMessageFormat.format(ZmMsg.offlineFolderSyncInterval, '<input id="folderOfflineLblId" class="ZmOfflineSyncInterval" type="number" min="0" max="30">');
        this._offlineId = this._props.addProperty(ZmMsg.offlineLabel,  this._offlineEl);
    }

    var container = this.getHtmlElement();
	container.appendChild(this._props.getHtmlElement());
	container.appendChild(excludeFbEl);
	container.appendChild(globalMarkReadEl);
	this._contentEl = container;

	this._tabGroup.addMember(this._props.getTabGroupMember());
};
