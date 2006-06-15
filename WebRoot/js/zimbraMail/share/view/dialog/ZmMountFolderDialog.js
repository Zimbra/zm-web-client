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
 * Portions created by Zimbra are Copyright (C) 2006 Zimbra, Inc.
 * All Rights Reserved.
 *
 * Contributor(s):
 *
 * ***** END LICENSE BLOCK *****
 */

function ZmMountFolderDialog(appCtxt, shell, className) {
	className = className || "ZmMountFolderDialog";
	var title = ZmMsg.mountFolder;
	DwtDialog.call(this, shell, className, title);
	this.setButtonListener(DwtDialog.OK_BUTTON, new AjxListener(this, this._handleOkButton));
	this._appCtxt = appCtxt;

	// create auto-completer
	if (this._appCtxt.get(ZmSetting.CONTACTS_ENABLED)) {
		var dataClass = this._appCtxt.getApp(ZmZimbraMail.CONTACTS_APP);
		var dataLoader = dataClass.getContactList;
		var locCallback = new AjxCallback(this, this._getNewAutocompleteLocation, [this]);
		var compCallback = new AjxCallback(this, this._handleCompletionData, [this]);
		var params = {parent: this, dataClass: dataClass, dataLoader: dataLoader,
					  matchValue: ZmContactList.AC_VALUE_EMAIL, locCallback: locCallback,
					  compCallback: compCallback,
					  keyUpCallback: new AjxCallback(this, this._acKeyUpListener) };
		this._acAddrSelectList = new ZmAutocompleteListView(params);
	}

	// setup view
	this._createMountHtml();
}
ZmMountFolderDialog.prototype = new DwtDialog;
ZmMountFolderDialog.prototype.constructor = ZmMountFolderDialog;

// Constants

ZmMountFolderDialog.DEFAULT_FOLDER_ID = ZmOrganizer.ID_ROOT;

ZmMountFolderDialog.DEFAULT_TITLE = ZmMsg.mountFolder;

// Data

ZmMountFolderDialog.prototype._folderId;

ZmMountFolderDialog.prototype._nameInput;
ZmMountFolderDialog.prototype._userInput;
ZmMountFolderDialog.prototype._pathInput;

// Public methods

ZmMountFolderDialog.prototype.popup =
function(title, folderId, user, path, loc) {
	// remember destination folderId
	this._folderId = folderId || ZmMountFolderDialog.DEFAULT_FOLDER_ID;

	// set title
	this.setTitle(title || ZmMountFolderDialog.DEFAULT_TITLE);

	// reset input fields
	this._nameInput.setValue("");
	this._userInput.setValue(user || "");
	this._pathInput.setValue(path || "");

	// show
	DwtDialog.prototype.popup.call(this, loc);
	ZmMountFolderDialog._enableFieldsOnEdit(this);
};

// Auto-complete methods

ZmMountFolderDialog.prototype._acKeyUpListener =
function(event, aclv, result) {
	var dialog = aclv.parent;
	ZmMountFolderDialog._enableFieldsOnEdit(dialog);
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

ZmMountFolderDialog._handleKeyUp = function(event){
	if (DwtInputField._keyUpHdlr(event)) {
		var target = DwtUiEvent.getTarget(event);
		var inputField = Dwt.getObjectFromElement(target);
		var dialog = inputField.parent.parent;
		return ZmMountFolderDialog._enableFieldsOnEdit(dialog);
	}
	return false;
};

ZmMountFolderDialog._enableFieldsOnEdit = function(dialog) {
	var name = dialog._nameInput.getValue();
	var user = dialog._userInput.getValue();
	var path = dialog._pathInput.getValue();
	var enabled = name.length > 0 && name.match(/\S/) &&
				  user.length > 0 && user.match(/\S/) &&
				  path.length > 0 && path.match(/\S/);
	dialog.setButtonEnabled(DwtDialog.OK_BUTTON, enabled);
};

// Protected methods

ZmMountFolderDialog.prototype._handleOkButton = function(event) {
	alert("TODO: create mountpoint");
	this.popdown();
};

ZmMountFolderDialog.prototype._createMountHtml = function() {
	// create components
	var props = new DwtPropertySheet(this);
	var params = { parent: props, required: true };
	this._nameInput = new DwtInputField(params);
	this._userInput = new DwtInputField(params);
	this._pathInput = new DwtInputField(params);

	// setup property sheet
	props.addProperty(ZmMsg.nameLabel, this._nameInput);
	props.addProperty(ZmMsg.userLabel, this._userInput);
	props.addProperty(ZmMsg.pathLabel, this._pathInput);

	// setup input fields
	var inputEl = this._nameInput.getInputElement();
	inputEl.style.width = "25em";
	Dwt.setHandler(inputEl, DwtEvent.ONKEYUP, ZmMountFolderDialog._handleKeyUp);

	var inputEl = this._userInput.getInputElement();
	inputEl.style.width = "25em";
	if (this._acAddrSelectList) {
		this._acAddrSelectList.handle(inputEl);
	}
	else {
		Dwt.setHandler(inputEl, DwtEvent.ONKEYUP, ZmMountFolderDialog._handleKeyUp);
	}

	var inputEl = this._pathInput.getInputElement();
	inputEl.style.width = "25em";
	Dwt.setHandler(inputEl, DwtEvent.ONKEYUP, ZmMountFolderDialog._handleKeyUp);

	// add to dialog
	var element = this._getContentDiv();
	element.appendChild(props.getHtmlElement());
};
