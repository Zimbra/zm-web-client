/*
 * ***** BEGIN LICENSE BLOCK *****
 * 
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2006, 2007 Zimbra, Inc.
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

ZmMountFolderDialog = function(shell, className) {
	className = className || "ZmMountFolderDialog";
	var title = ZmMsg[ZmOrganizer.MOUNT_KEY[ZmOrganizer.FOLDER]];
	DwtDialog.call(this, {parent:shell, className:className, title:title});

	this.setButtonListener(DwtDialog.OK_BUTTON, new AjxListener(this, this._handleOkButton));

	// create auto-complete
	if (appCtxt.get(ZmSetting.CONTACTS_ENABLED)) {
		var dataClass = appCtxt.getApp(ZmApp.CONTACTS);
		var params = {
			parent: this,
			dataClass: dataClass,
			dataLoader: dataClass.getContactList,
			matchValue: ZmContactsApp.AC_VALUE_EMAIL,
			locCallback: (new AjxCallback(this, this._getNewAutocompleteLocation)),
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

ZmMountFolderDialog.prototype.popup =
function(organizerType, folderId, user, path) {
	// remember values
	this._organizerType = organizerType;
	this._folderId = folderId || ZmOrganizer.ID_ROOT;

	// set title
	this.setTitle(ZmMsg[ZmOrganizer.MOUNT_KEY[organizerType]] || ZmMsg[ZmOrganizer.MOUNT_KEY[ZmOrganizer.FOLDER]]);

	// reset input fields
	this._userInput.setValue(user || "");
	this._pathInput.setValue(path || "");
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

ZmMountFolderDialog.prototype._getNewAutocompleteLocation =
function(ev) {
	var element = ev.element;
	var location = Dwt.toWindow(element, 0, 0, this.getHtmlElement());
	var size = Dwt.getSize(element);
	return (new DwtPoint((location.x), (location.y + size.y)));
};

// Protected functions

ZmMountFolderDialog.prototype._handleOtherKeyUp =
function(ev) {
	var value = this._handleKeyUp(ev);

	if (!this._nameInputDirty) {
		var user = this._userInput.getValue();
		var path = this._pathInput.getValue();

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
	var path = this._pathInput.getValue();
	var name = this._nameInput.getValue();
	var enabled = user.length > 0 && user.match(/\S/) &&
				  path.length > 0 && path.match(/\S/) && !path.match(/^\/+$/) &&
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
		"path": this._pathInput.getValue(),
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

	ZmMountpoint.create(params, callback, errorCallback)
};

ZmMountFolderDialog.prototype._handleCreateError =
function(response) {
	var code = response.code;
	if (code == ZmCsfeException.SVC_PERM_DENIED ||
		code == ZmCsfeException.MAIL_NO_SUCH_FOLDER)
	{
		var msg = ZmCsfeException.getErrorMsg(code);
		appCtxt.getAppController().popupErrorDialog(msg, null, null, true);
		return true;
	}
};

ZmMountFolderDialog.prototype._createMountHtml =
function() {

	this._getContentDiv().innerHTML = AjxTemplate.expand("share.Dialogs#ZmMountFolderDialog", {id: this._htmlElId})

	var params = {parent:this, required:true};
	this._userInput = new DwtInputField(params);
	this._userInput.reparentHtmlElement(this._htmlElId + "_email");
	this._pathInput = new DwtInputField(params);
	this._pathInput.reparentHtmlElement(this._htmlElId + "_path");
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

	inputEl = this._pathInput.getInputElement();
	inputEl.style.width = "25em";
	inputEl.onkeyup = AjxCallback.simpleClosure(this._handleOtherKeyUp, this);

	inputEl = this._nameInput.getInputElement();
	inputEl.style.width = "25em";
	inputEl.onkeyup = AjxCallback.simpleClosure(this._handleNameKeyUp, this);
};
