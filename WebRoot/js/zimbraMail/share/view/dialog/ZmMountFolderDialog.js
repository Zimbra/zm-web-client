/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2006, 2007, 2008, 2009, 2010 Zimbra, Inc.
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
 * Creates a mount folder dialog.
 * @class
 * This class represents a mount folder dialog.
 * 
 * @param	{DwtControl}	shell		the parent
 * @param	{String}	className		the class name
 * 
 * @extends		DwtDialog
 */
ZmMountFolderDialog = function(shell, className) {
	className = className || "ZmMountFolderDialog";
	var title = ZmMsg[ZmOrganizer.MOUNT_KEY[ZmOrganizer.FOLDER]];
	DwtDialog.call(this, {parent:shell, className:className, title:title});

	this.setButtonListener(DwtDialog.OK_BUTTON, new AjxListener(this, this._handleOkButton));

	// create auto-complete
	if (appCtxt.get(ZmSetting.CONTACTS_ENABLED) || appCtxt.get(ZmSetting.GAL_ENABLED)) {
		var params = {
			dataClass: appCtxt.getAutocompleter(),
			matchValue: ZmAutocomplete.AC_VALUE_EMAIL,
			compCallback: (new AjxCallback(this, this._handleCompletionData)),
			keyUpCallback: (new AjxCallback(this, this._acKeyUpListener))
		};
		this._acAddrSelectList = new ZmAutocompleteListView(params);
	}

	// setup view
	this._createMountHtml();
}
ZmMountFolderDialog.prototype = new DwtDialog;
ZmMountFolderDialog.prototype.constructor = ZmMountFolderDialog;


// Public methods

/**
 * Pops-up the dialog.
 * 
 * @param	{constant}	organizerType	the organizer type
 * @param	{constant}	folderId		the organizer id
 * @param	{String}	user			the user
 * @param	{String}	path		the folder mount path
 */
ZmMountFolderDialog.prototype.popup =
function(organizerType, folderId, user, path) {
	// remember values
	this._organizerType = organizerType;
	this._folderId = folderId || ZmOrganizer.ID_ROOT;

	// set title
	this.setTitle(ZmMsg[ZmOrganizer.MOUNT_KEY[organizerType]] || ZmMsg[ZmOrganizer.MOUNT_KEY[ZmOrganizer.FOLDER]]);

    // clear prev options and insert default
	this._folderSelect.clearOptions();
    this._folderSelect.addOption(ZmMsg.calendar, true);
    // reset input fields
	this._userInput.setValue(user || "");
	this._nameInput.setValue("");
	this._nameInputDirty = false;

	// dont allow "None" option in color picker
	if (organizerType == ZmOrganizer.FOLDER) {
		this._colorSelect.getMenu().getItem(0).setEnabled(true);
		this._colorSelect.setSelectedValue(0);
	} else {
		this._colorSelect.getMenu().getItem(0).setEnabled(false);
		this._colorSelect.setSelectedValue(1);
	}

	// show
	DwtDialog.prototype.popup.call(this);

	this._enableFieldsOnEdit();
};

// Auto-complete methods

ZmMountFolderDialog.prototype._acKeyUpListener =
function(ev, aclv, result) {
	this._handleOtherKeyUp(ev);
};

ZmMountFolderDialog.prototype._handleCompletionData =
function(text, element, match) {
	element.value = text.replace(/;\s*/g,"");
	try {
		if (element.fireEvent) {
			element.fireEvent("onchange");
		} else if (document.createEvent) {
			var ev = document.createEvent("UIEvents");
			ev.initUIEvent("change", false, window, 1);
			element.dispatchEvent(ev);
		}
	}
	catch (ex) {
		// ignore -- TODO: what to do with this error?
	}
};

// Protected functions

ZmMountFolderDialog.prototype._handleOtherKeyUp =
function(ev) {
	var value = this._handleKeyUp(ev);

	if (!this._nameInputDirty) {
		var user = this._userInput.getValue();
		var path = this._folderSelect.getValue();

		if (user != "" && path != "") {
			if (!this._nameFormatter) {
				this._nameFormatter = new AjxMessageFormat(ZmMsg.shareNameDefault);
			}

			user = user.replace(/@.*/,"");
			user = user.substr(0,1).toUpperCase() + user.substr(1);
			path = path.replace(/\/$/,"");
			path = path.replace(/^.*\//,"");

			var args = [user, path];
			this._nameInput.setValue(this._nameFormatter.format(args));
		}
	}

	return value;
};

ZmMountFolderDialog.prototype._handleNameKeyUp =
function(ev) {
	this._nameInputDirty = true;
	return this._handleKeyUp(ev);
};

ZmMountFolderDialog.prototype._handleKeyUp =
function(ev) {
	return (DwtInputField._keyUpHdlr(ev)) ? this._enableFieldsOnEdit() : false;
};

ZmMountFolderDialog.prototype._enableFieldsOnEdit =
function() {
	var user = this._userInput.getValue();
//	var path = this._folderSelect.getValue();
	var name = this._nameInput.getValue();
	var enabled = user.length > 0 && user.match(/\S/) &&
//				  path.length > 0 && path.match(/\S/) && !path.match(/^\/+$/) &&
//                  folder.length > 0 &&
				  name.length > 0 && name.match(/\S/);
	this.setButtonEnabled(DwtDialog.OK_BUTTON, enabled);
};

// Protected methods

ZmMountFolderDialog.prototype._handleOkButton =
function(ev) {
	var params = {
		"l": this._folderId,
		"name": this._nameInput.getValue(),
		"owner": this._userInput.getValue(),
		"path": this._folderSelect.getValue(),
		"view": (ZmOrganizer.VIEWS[this._organizerType][0] || ZmOrganizer.VIEWS[ZmOrganizer.FOLDER][0]),
		"color": this._colorSelect.getValue()
	};

	if (appCtxt.get(ZmSetting.CALENDAR_ENABLED) &&
		this._organizerType == ZmOrganizer.CALENDAR)
	{
		params.f = ZmOrganizer.FLAG_CHECKED;
	}

	var callback = new AjxCallback(this, this.popdown);
	var errorCallback = new AjxCallback(this, this._handleCreateError);

	ZmMountpoint.create(params, callback);
};

ZmMountFolderDialog.prototype._createMountHtml =
function() {

	this._getContentDiv().innerHTML = AjxTemplate.expand("share.Dialogs#ZmMountFolderDialog", {id: this._htmlElId})

	var params = {parent:this, required:true};
	this._userInput = new DwtInputField(params);
	this._userInput.reparentHtmlElement(this._htmlElId + "_email");
    this._folderSelect = new DwtSelect({parent:this});
	this._folderSelect.reparentHtmlElement(this._htmlElId + "_folder");
    var selectChangeListener = new AjxListener(this, this._handleOtherKeyUp);
    this._folderSelect.addChangeListener(selectChangeListener);

	this._nameInput = new DwtInputField(params);
	this._nameInput.reparentHtmlElement(this._htmlElId + "_name");

	this._colorSelect = new DwtSelect({parent:this});
	for (var i = 0; i < ZmOrganizer.COLOR_CHOICES.length; i++) {
		var choice = ZmOrganizer.COLOR_CHOICES[i];
		this._colorSelect.addOption(choice.label, i == 0, choice.value);
	}
	this._colorSelect.reparentHtmlElement(this._htmlElId + "_color");

	// setup input fields
	var inputEl = this._userInput.getInputElement();
	inputEl.style.width = "25em";
	if (this._acAddrSelectList) {
		this._acAddrSelectList.handle(inputEl);
	} else {
		inputEl.onkeyup = AjxCallback.simpleClosure(this._handleOtherKeyUp, this);
	}
    inputEl.onkeydown = AjxCallback.simpleClosure(this._onKeyDown, this);

	inputEl = this._nameInput.getInputElement();
	inputEl.style.width = "25em";
	inputEl.onkeyup = AjxCallback.simpleClosure(this._handleNameKeyUp, this);
};

ZmMountFolderDialog.prototype._onKeyDown =
function(ev) {
    ev = ev || window.event;
    var el = DwtUiEvent.getTarget(ev);
    var key = DwtKeyEvent.getCharCode(ev);
    if(key == DwtKeyEvent.KEY_ENTER){
        var email = this._userInput.getValue();
        var respCallback = new AjxCallback(this, this.showSharedCalendars);
        var shares = this.getShares(null, email, respCallback);
    }
};

ZmMountFolderDialog.prototype.getShares =
function(type, owner, callback) {

	var jsonObj = {GetShareInfoRequest:{_jsns:"urn:zimbraAccount"}};
	var request = jsonObj.GetShareInfoRequest;
	if (type && type != ZmShare.TYPE_ALL) {
		request.grantee = {type:type};
	}
	if (owner) {
		request.owner = {by:"name", _content:owner};
	}
	var respCallback = new AjxCallback(this, this._handleGetSharesResponse, [callback]);
	appCtxt.getAppController().sendRequest({jsonObj:	jsonObj,
											asyncMode:	true,
											callback:	respCallback});
};

ZmMountFolderDialog.prototype._handleGetSharesResponse =
function(callback, result) {

	var resp = result.getResponse().GetShareInfoResponse;
	if (callback) {
		callback.run(resp.share);
	}
};

ZmMountFolderDialog.prototype.showSharedCalendars =
function(shares) {
    this._folderSelect.clearOptions();
    if (shares && shares.length) {
        for (var i = 0; i < shares.length; i++) {
            var folderPath = shares[i].folderPath;
            var folderName = folderPath.replace(/\/$/,"");
            folderName = folderName.replace(/^.*\//,"");
            this._folderSelect.addOption(folderName, i == 0, folderPath);
        }
    }
};