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
	DwtDialog.call(this, shell, className, title);
	this.setButtonListener(DwtDialog.OK_BUTTON, new AjxListener(this, this._handleOkButton));

	// create auto-completer
	if (appCtxt.get(ZmSetting.CONTACTS_ENABLED)) {
		var dataClass = appCtxt.getApp(ZmApp.CONTACTS);
		var dataLoader = dataClass.getContactList;
		var locCallback = new AjxCallback(this, this._getNewAutocompleteLocation, [this]);
		var compCallback = new AjxCallback(this, this._handleCompletionData, [this]);
		var params = {parent: this, dataClass: dataClass, dataLoader: dataLoader,
					  matchValue: ZmContactsApp.AC_VALUE_EMAIL, locCallback: locCallback,
					  compCallback: compCallback,
					  keyUpCallback: new AjxCallback(this, this._acKeyUpListener) };
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
	ZmMountFolderDialog._enableFieldsOnEdit(this);
};

// Auto-complete methods

ZmMountFolderDialog.prototype._acKeyUpListener =
function(event, aclv, result) {
	ZmMountFolderDialog._handleOtherKeyUp(event);
};

ZmMountFolderDialog.prototype._handleCompletionData =
function (control, text, element) {
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
function(cv, ev) {
	var element = ev.element;
	var id = element.id;

	var viewEl = this.getHtmlElement();
	var location = Dwt.toWindow(element, 0, 0, viewEl);
	var size = Dwt.getSize(element);
	return new DwtPoint((location.x), (location.y + size.y) );
};

// Protected functions

ZmMountFolderDialog._handleOtherKeyUp =
function(event) {
	var value = ZmMountFolderDialog._handleKeyUp(event);

	var target = DwtUiEvent.getTarget(event);
	var inputField = Dwt.getObjectFromElement(target);
	var dialog = inputField.parent.parent;

	if (!dialog._nameInputDirty) {
		var user = dialog._userInput.getValue();
		var path = dialog._pathInput.getValue();

		if (user != "" && path != "") {
			if (!dialog._nameFormatter) {
				dialog._nameFormatter = new AjxMessageFormat(ZmMsg.shareNameDefault);
			}

			user = user.replace(/@.*/,"");
			user = user.substr(0,1).toUpperCase() + user.substr(1);

			path = path.replace(/\/$/,"");
			path = path.replace(/^.*\//,"");

			var args = [user, path];
			dialog._nameInput.setValue(dialog._nameFormatter.format(args));
		}
	}

	return value;
};

ZmMountFolderDialog._handleNameKeyUp =
function(event) {
	var target = DwtUiEvent.getTarget(event);
	var inputField = Dwt.getObjectFromElement(target);
	var dialog = inputField.parent.parent;

	dialog._nameInputDirty = true;

	return ZmMountFolderDialog._handleKeyUp(event);
};

ZmMountFolderDialog._handleKeyUp =
function(event) {
	if (DwtInputField._keyUpHdlr(event)) {
		var target = DwtUiEvent.getTarget(event);
		var inputField = Dwt.getObjectFromElement(target);
		var dialog = inputField.parent.parent;
		return ZmMountFolderDialog._enableFieldsOnEdit(dialog);
	}
	return false;
};

ZmMountFolderDialog._enableFieldsOnEdit =
function(dialog) {
	var user = dialog._userInput.getValue();
	var path = dialog._pathInput.getValue();
	var name = dialog._nameInput.getValue();
	var enabled = user.length > 0 && user.match(/\S/) &&
				  path.length > 0 && path.match(/\S/) && !path.match(/^\/+$/) &&
				  name.length > 0 && name.match(/\S/);
	dialog.setButtonEnabled(DwtDialog.OK_BUTTON, enabled);
};

// Protected methods

ZmMountFolderDialog.prototype._handleOkButton =
function(event) {
	var params = {
		"l": this._folderId,
		"name": this._nameInput.getValue(),
		"owner": this._userInput.getValue(),
		"path": this._pathInput.getValue(),
		"view": ZmOrganizer.VIEWS[this._organizerType][0] || ZmOrganizer.VIEWS[ZmOrganizer.FOLDER][0],
		"color": this._colorSelect.getValue()
	};
	if (appCtxt.get(ZmSetting.CALENDAR_ENABLED)) {
		if (this._organizerType == ZmOrganizer.CALENDAR) {
			params.f = ZmOrganizer.FLAG_CHECKED;
		}
	}
	var callback = new AjxCallback(this, this.popdown);
	var errorCallback = new AjxCallback(this, this._handleCreateError);

	ZmMountpoint.create(params, callback, errorCallback)
};

ZmMountFolderDialog.prototype._handleCreateError =
function(response) {
	var code = response.code;
	if (code == ZmCsfeException.SVC_PERM_DENIED ||
		code == ZmCsfeException.MAIL_NO_SUCH_FOLDER) {
		var msg = ZmCsfeException.getErrorMsg(code);

		var controller = appCtxt.getAppController();
		controller.popupErrorDialog(msg, null, null, true);

		return true;
	}
};

ZmMountFolderDialog.prototype._createMountHtml =
function() {
	// create instructional elements
	var instructEl1 = document.createElement("DIV");
	instructEl1.innerHTML = ZmMsg.mountInstructions1;
	instructEl1.style.width = "30em";
	instructEl1.style.marginBottom = "0.5em";

	var instructEl2 = document.createElement("DIV");
	instructEl2.innerHTML = ZmMsg.mountInstructions2;
	instructEl2.style.marginTop = "0.5em";
	instructEl2.style.marginBottom = "0.5em";

	// create components
	var props1 = new DwtPropertySheet(this);
	var props2 = new DwtPropertySheet(this);

	var params = { parent: props1, required: true };
	this._userInput = new DwtInputField(params);
	this._pathInput = new DwtInputField(params);

	var params = { parent: props2, required: true };
	this._nameInput = new DwtInputField(params);

	this._colorSelect = new DwtSelect(props1);
	for (var i = 0; i < ZmOrganizer.COLOR_CHOICES.length; i++) {
		var choice = ZmOrganizer.COLOR_CHOICES[i];
		this._colorSelect.addOption(choice.label, i == 0, choice.value);
	}

	// setup property sheets
	props1.addProperty(ZmMsg.emailLabel, this._userInput);
	props1.addProperty(ZmMsg.pathLabel, this._pathInput);

	props2.addProperty(ZmMsg.nameLabel, this._nameInput);
	props2.addProperty(ZmMsg.colorLabel, this._colorSelect);

	var propsEl1 = props1.getHtmlElement();
	var propsEl2 = props2.getHtmlElement();

	propsEl1.style.marginLeft = "1em";
	propsEl2.style.marginLeft = "1em";

	// setup input fields
	var inputEl = this._userInput.getInputElement();
	inputEl.style.width = "25em";
	if (this._acAddrSelectList) {
		this._acAddrSelectList.handle(inputEl);
	}
	else {
		Dwt.setHandler(inputEl, DwtEvent.ONKEYUP, ZmMountFolderDialog._handleOtherKeyUp);
	}

	var inputEl = this._pathInput.getInputElement();
	inputEl.style.width = "25em";
	Dwt.setHandler(inputEl, DwtEvent.ONKEYUP, ZmMountFolderDialog._handleOtherKeyUp);

	var inputEl = this._nameInput.getInputElement();
	inputEl.style.width = "20em";
	Dwt.setHandler(inputEl, DwtEvent.ONKEYUP, ZmMountFolderDialog._handleNameKeyUp);

	// add to dialog
	var element = this._getContentDiv();
	element.appendChild(instructEl1);
	element.appendChild(propsEl1);
	element.appendChild(instructEl2);
	element.appendChild(propsEl2);
};
