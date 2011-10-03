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
 * Creates a folder properties view for the folder dialog
 * @class
 * This class represents a folder properties view
 * 
 * @param	{DwtControl}	parent		the parent (dialog)
 * @param	{String}	className		the class name
 * 
 * @extends		DwtDialog
 */
ZmFolderPropertyView = function(parent) {
    if (arguments.length == 0) return;
    ZmFolderDialogTabView.call(this, parent, "ZmFolderPropertyView");
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

	this.setSize(Dwt.DEFAULT, "200");
    if (Dwt.getVisible(this._nameInputEl)) {
        this._nameInputEl.focus();
    }
};


/*  doSave will be invoked for each tab view.
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

	var color = this._color.getValue() || ZmOrganizer.DEFAULT_COLOR[organizer.type];
	if (organizer.color != color) {
		if (String(color).match(/^#/)) {
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

    // Shared Calendars only
    if (Dwt.getVisible(this._calendarReminderEl)) {
        var reminder = this._calendarReminderCheckbox.checked;
        if (organizer.reminder != reminder) {
            organizer.setSharedReminder(reminder, null, this._handleErrorCallback, batchCommand);
            batchCommand.add(new AjxCallback(organizer, organizer.setSharedReminder, [reminder, null, this._handleErrorCallback]));
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
        if(ZmOrganizer.COLOR_VALUES[organizer.color] && (organizer.rgb != ZmOrganizer.COLOR_VALUES[organizer.color])) {
            colorCode = organizer.rgb;
        } else {
            colorCode = organizer.color;
        }
        var defaultColorCode = ZmOrganizer.DEFAULT_COLOR[organizer.type],
            defaultColor = ZmOrganizer.COLOR_VALUES[defaultColorCode],
            colorMenu = this._color.getMenu(),
            moreColorMenu;
        if(colorMenu) {
            moreColorMenu = (colorMenu.toString() == "ZmMoreColorMenu") ? colorMenu : colorMenu._getMoreColorMenu();
            if(moreColorMenu) moreColorMenu.setDefaultColor(defaultColor);
        }
        this._color.setValue(colorCode);
        this._color.setEnabled(organizer.id != ZmFolder.ID_DRAFTS);
    }

	if (organizer.isSystem() || organizer.isDataSource()) {
		this._nameOutputEl.innerHTML = AjxStringUtil.htmlEncode(organizer.name);
        Dwt.setVisible(this._nameOutputEl, true);
        Dwt.setVisible(this._nameInputEl,  false);
	}
	else {
		this._nameInputEl.value = organizer.name;
        Dwt.setVisible(this._nameOutputEl, false);
        Dwt.setVisible(this._nameInputEl,  true);
	}
	this._ownerEl.innerHTML = AjxStringUtil.htmlEncode(organizer.owner);
	this._typeEl.innerHTML = ZmMsg[ZmOrganizer.FOLDER_KEY[organizer.type]] || ZmMsg.folder;

	if (this._color) {
		var colorCode = 0;
		if(ZmOrganizer.COLOR_VALUES[organizer.color] && (organizer.rgb != ZmOrganizer.COLOR_VALUES[organizer.color])) {
			colorCode = organizer.rgb;
		} else {
			colorCode = organizer.color;
		}
		this._color.setValue(colorCode);
		var isVisible = (organizer.type != ZmOrganizer.FOLDER ||
						 (organizer.type == ZmOrganizer.FOLDER && appCtxt.get(ZmSetting.MAIL_FOLDER_COLORS_ENABLED)));
		this._props.setPropertyVisible(this._colorId, isVisible);
	}
    this._excludeFbCheckbox.checked = organizer.excludeFreeBusy;
    this._calendarReminderCheckbox.checked = organizer.reminder;

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
        urlDisplayString = AjxStringUtil.clipByLength(urlDisplayString,50);
    }

    if(urlDisplayString){
        urlDisplayString = ['<a target=_new href="',url,'">',urlDisplayString,'</a>'].join("");
    }

    this._urlEl.innerHTML = urlDisplayString || "";

	this._props.setPropertyVisible(this._ownerId, organizer.owner != null);

	this._props.setPropertyVisible(this._urlId, organizer.url);
	this._props.setPropertyVisible(this._permId, showPerm);

	Dwt.setVisible(this._excludeFbEl, !organizer.link && (organizer.type == ZmOrganizer.CALENDAR));
	// TODO: False until server handling of the flag is added
	//Dwt.setVisible(this._globalMarkReadEl, organizer.type == ZmOrganizer.FOLDER);
    Dwt.setVisible(this._globalMarkReadEl, false);

    Dwt.setVisible(this._calendarReminderEl, (organizer.type == ZmOrganizer.CALENDAR) && organizer.link);

};


ZmFolderPropertyView.prototype._handleRenameError =
function(response) {
	var value = this._nameInputEl.value;
	var msg;
	var noDetails = false;
	if (response.code == ZmCsfeException.MAIL_ALREADY_EXISTS) {
		msg = AjxMessageFormat.format(ZmMsg.errorAlreadyExists, [value]);
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


ZmFolderPropertyView.prototype._createView =
function() {
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

	var excludeFbEl      = this._createCheckboxItem("excludeFb",        ZmMsg.excludeFromFreeBusy);
	var globalMarkReadEl = this._createCheckboxItem("globalMarkRead",   ZmMsg.globalMarkRead);
	var calReminderEl    = this._createCheckboxItem("calendarReminder", ZmMsg.sharedCalendarReminder);

	this._props = new DwtPropertySheet(this);
	this._color = new ZmColorButton({parent:this});

	this._props.addProperty(ZmMsg.nameLabel, nameEl);
	this._props.addProperty(ZmMsg.typeLabel, this._typeEl);
	this._ownerId = this._props.addProperty(ZmMsg.ownerLabel,  this._ownerEl);
	this._urlId   = this._props.addProperty(ZmMsg.urlLabel,    this._urlEl);
	this._permId  = this._props.addProperty(ZmMsg.permissions, this._permEl);
	this._colorId = this._props.addProperty(ZmMsg.colorLabel,  this._color);

    var container = this.getHtmlElement();
	container.appendChild(this._props.getHtmlElement());
	container.appendChild(excludeFbEl);
	container.appendChild(globalMarkReadEl);
	container.appendChild(calReminderEl);

    this._contentEl = container;

};
