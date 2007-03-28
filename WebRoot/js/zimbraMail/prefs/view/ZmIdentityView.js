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

 function ZmIdentityView(parent, appCtxt, controller) {
	var labels = { 
		infoTitle: ZmMsg.identityInfoTitle, infoContents: ZmMsg.identityInfoContent,
		listHeader: ZmMsg.identities, detailsHeader: ZmMsg.identitiesLabel
	};

	ZmPrefListView.call(this, parent, appCtxt, controller, labels, "ZmIdentityView", DwtControl.STATIC_STYLE);
	this._appCtxt = appCtxt;
	this._controller = controller;
	this._prefsController = appCtxt.getApp(ZmZimbraMail.PREFERENCES_APP).getPrefController();
	
	this._title = [ZmMsg.zimbraTitle, ZmMsg.options, ZmPrefView.TAB_NAME[ZmPrefView.IDENTITY]].join(": ");

	this._identityNameInput = null;
	this._pages = [];

	// Arrays of items that have been added, deleted, modified.
	this._adds = [];
	this._deletes = [];
	this._updates = [];
};

ZmIdentityView.prototype = new ZmPrefListView;
ZmIdentityView.prototype.constructor = ZmIdentityView;
 
ZmIdentityView.prototype.toString =
function() {
	return "ZmIdentityView";
};

ZmIdentityView.prototype.getTitle =
function() {
	return this._title;
};

ZmIdentityView.prototype.isDirty =
function() {
	if (this._identity) {
		this.getChanges();
	}
	return (this._adds.length > 0) || (this._deletes.length > 0) || (this._updates.length > 0);
};

ZmIdentityView.prototype.reset =
function() {
	var listView = this.getList();
	listView.set(this._controller._getListData());
	listView.setSelection(this._appCtxt.getIdentityCollection().defaultIdentity);
	this._clearChanges();
	this.clearAllErrors();
};

ZmIdentityView.prototype._createDetails =
function(parentElement) {
    var id = this._htmlElId;
    parentElement.innerHTML = AjxTemplate.expand("zimbraMail.prefs.templates.Options#IdentityForm", id);
    
    

	var inputId = Dwt.getNextId();


	var inputCell = document.getElementById(inputId);
	var params = { parent: this.parent, type: DwtInputField.STRING, size: 50, validationStyle: DwtInputField.CONTINUAL_VALIDATION };
	this._identityNameInput = new DwtInputField(params);
	this._identityNameInput.setRequired(true);
	this._identityNameInput.setValidatorFunction(this, this._validateIdentityName);
	this._identityNameInput.replaceElement(id + "_name");
	this._identityNameInput.addListener(DwtEvent.ONKEYUP, new AjxListener(this, this._nameChangeHandler));


	var tabView = new DwtTabView(this, null, Dwt.STATIC_STYLE);
	tabView.replaceElement(id + "_tabs");
	
	this._addPage(ZmIdentityPage.OPTIONS, ZmMsg.identityOptions, tabView);
	this._addPage(ZmIdentityPage.SIGNATURE, ZmMsg.signature, tabView);
	this._addPage(ZmIdentityPage.ADVANCED, ZmMsg.identityAdvanced, tabView);

	var identityCollection = this._appCtxt.getIdentityCollection();
	identityCollection.addChangeListener(new AjxListener(this, this._identityChangeListener));
};

ZmIdentityView.prototype._addPage =
function(pageId, title, tabView) {
	var page = new ZmIdentityPage(this, this._appCtxt, pageId, null, DwtControl.STATIC_STYLE);
	tabView.addTab(title, page);
	this._pages.push(page);
};

ZmIdentityView.prototype._nameChangeHandler =
function() {
	var value = AjxStringUtil.trim(this._identityNameInput.getValue());
	this._identity.name = value;
    this.validate();
	this.getList().setUI(); // Redraw the whole list.
};

ZmIdentityView.prototype.showItem =
function(identity) {
	if (this._identity) {
		this.getChanges();
	}
	this._identity = identity;
	this._identityNameInput.setValue(identity.name);
	this._identityNameInput.setEnabled(!identity.isDefault);
	for (var i = 0, count = this._pages.length; i < count; i++) {
		this._pages[i].setIdentity(identity);
	}
	this.getRemoveButton().setEnabled(!identity.isDefault);
};

ZmIdentityView.prototype.addNew =
function(identity) {
	this._adds[this._adds.length] = identity;
	this._identityNameInput.focus();
};

ZmIdentityView.prototype.remove =
function(identity) {
	this.clearError(identity);
	var isAdd = false;
	for (var i = 0, count = this._adds.length; i < count; i++) {
		if (identity == this._adds[i]) {
			isAdd = true;
			this._adds.splice(i,1);
			break;
		}
	}
	if (!isAdd) {
		this._deletes[this._deletes.length] = identity;
	}
};

ZmIdentityView.prototype._validateSelectedItem =
function(errors) {
	if (!this._identity) {
		return;
	}

	if (this._identityNameInput.getEnabled() && (this._identityNameInput.isValid() === null)) {
		errors[errors.length] = ZmMsg.identityNameError;
	}
	for (var i = 0, count = this._pages.length; i < count; i++) {
		this._pages[i]._validateSelectedItem(errors);
	}
};

ZmIdentityView.prototype.addCommand =
function(batchCommand) {
	this.getChanges();
	if (!this._adds.length && !this._deletes.length && !this._updates.length) {
		return;
	}

	// Create a default account if there is nothing already defined.
	// This is a little hack until we know the server always creates a default for us.
	if (this._adds.length) {
		var identityCollection = this._appCtxt.getApp(ZmZimbraMail.PREFERENCES_APP).getIdentityCollection();
		if (!identityCollection.getIdentities().length) {
			this._adds[0].isDefault = true;
		}
	}

	this._addCommands(this._deletes, "DeleteIdentityRequest", batchCommand);
	this._addCommands(this._updates, "ModifyIdentityRequest", batchCommand);
	this._addCommands(this._adds, "CreateIdentityRequest", batchCommand);
};

ZmIdentityView.prototype._addCommands =
function(list, op, batchCommand) {
	if (!this._errorCallback) {
		this._errorCallback = new AjxCallback(this, this._handleResponseError);
	}
	if (!this._responseCallback) {
		this._responseCallback = new AjxCallback(this, this._handleResponse);
	}
	
	for (var i = 0, count = list.length; i < count; i++) {
		var identity = list[i];
		identity.createRequest(op, batchCommand, this._responseCallback, this._errorCallback);
	}
};

ZmIdentityView.prototype._handleResponse =
function(identity, request, result) {
	var list;
	switch (request) {
		case "CreateIdentityRequest": list = this._adds; break;
		case "ModifyIdentityRequest": list = this._updates; break;
		case "DeleteIdentityRequest": list = this._deletes; break;
	}
	for (var i = 0, count = list.length; i < count; i++) {
		if (list[i] == identity) {
			list.splice(i,1);
			break;
		}
	}
};

ZmIdentityView.prototype._handleResponseError =
function(identity, request, result) {
	var message;
	if (result.code == ZmCsfeException.IDENTITY_EXISTS) {
	    message = AjxMessageFormat.format(ZmMsg.errorIdentityAlreadyExists, identity.name);
	} else {
		message = ZmCsfeException.getErrorMsg(result.code);
	}
	if (message) {
	    var dialog = this._appCtxt.getMsgDialog();
		dialog.setMessage(message, DwtMessageDialog.CRITICAL_STYLE);
		dialog.popup();
	    return true;
	}
};

ZmIdentityView.prototype._updateList =
function() {
	// Just redraw the whole list.
	var listView = this.getList();
	listView.set(this._controller._getListData());

	// Make sure the correct proxy identity is now selected.
	if (this._identity) {
		var identityCollection = this._appCtxt.getApp(ZmZimbraMail.PREFERENCES_APP).getIdentityCollection();
		var list = this.getList().getList();
		for (var i = 0, count = list.size(); i < count; i++) {
			var identity = list.get(i);
			if (identity.id == this._identity.id) {
				this.getList().setSelection(identity);
				break;
			}
		}
	}
};

ZmIdentityView.prototype._clearChanges =
function() {
	this._adds.length = 0;
	this._deletes.length = 0;
	this._updates.length = 0;
};

ZmIdentityView.prototype._identityChangeListener =
function(ev) {
	if ((ev.event == ZmEvent.E_CREATE) || 
		(ev.event == ZmEvent.E_DELETE) ||
		((ev.event == ZmEvent.E_MODIFY) && ev.getDetail("rename")))
	{
		this._updateList();
	}
};

ZmIdentityView.prototype.getChanges =
function() {
	var dirty = false;
	if (!this._identity) {
		return dirty;
	}
	if (this._identity.hasOwnProperty("name")) {
		dirty = true;
	}
	for (var i = 0, count = this._pages.length; i < count; i++) {
		dirty = this._pages[i].getChanges(this._identity) || dirty;
	}
	
	if (dirty && this._identity._object_) {
		var found = false;
		for (var i = 0, count = this._updates.length; i < count; i++) {
			if (this._updates[i].id == this._identity.id) {
				found = true; 
				break;
			}
		}
		if (!found) {
			this._updates[this._updates.length] = this._identity;
		}
	}
	return dirty;
};

ZmIdentityView.prototype._validateIdentityName =
function(originalValue) {
	var value = AjxStringUtil.trim(originalValue);
	if (value == "") {
		throw AjxMsg.valueIsRequired;
	} else if (value.toUpperCase() == ZmIdentity.DEFAULT_NAME.toUpperCase()) {
	    throw AjxMessageFormat.format(ZmMsg.errorDefaultIdentityName, value);
	} else if (!ZmOrganizer.VALID_NAME_RE.test(value)) {
		throw AjxMessageFormat.format(ZmMsg.errorInvalidName, value);
	} else {
		var existing = this._appCtxt.getIdentityCollection().getByName(value);
		if (existing && (existing.id != this._identity.id)) {
	    	throw AjxMessageFormat.format(ZmMsg.errorIdentityAlreadyExists, existing.name);
		}
	}
	return originalValue;
};

/**
* @class
* @constructor
* A page inside of the identities preferences
*/
function ZmIdentityPage(parent, appCtxt, pageId, className, posStyle) {
	DwtTabViewPage.call(this, parent, className, posStyle);
	this._appCtxt = appCtxt;
	this._pageId = pageId;
	this._hasRendered = false;
	
	this._checkboxClosure = AjxCallback.simpleClosure(this._checkboxHandler, this);
	this._changeListenerObj = new AjxListener(this, this._changeListener);
	
	this._inputs = {}; // Map of field name in ZmIdentity to DwtInputField
	this._checkboxIds = {}; // Map of field name in ZmIdentity to checkbox ids
	this._radioGroups = {}; // Map of field name in ZmIdentity to DwtRadioButtonGroup
	this._selects = {}; // Map of field name in ZmIdentity to DwtSelect
	this._arrays = {}; // Map of field name in ZmIdentity to objects with inputs & callbacks
	this._associations = {}; // Map of checkbox ids to the controls they enable/disable
	this._errorMessages = {} // Map of fields to validation error messages
};

ZmIdentityPage.prototype = new DwtTabViewPage;
ZmIdentityPage.prototype.constructor = ZmIdentityPage;

ZmIdentityPage.OPTIONS = 0;
ZmIdentityPage.SIGNATURE = 1;
ZmIdentityPage.ADVANCED = 2;

ZmIdentityPage.toString =
function() {
	return "ZmIdentityPage";
};

ZmIdentityPage.prototype.showMe =
function() {
	if (!this._hasRendered) {
		switch (this._pageId) {
			case ZmIdentityPage.OPTIONS: this._initializeOptions(); break;
			case ZmIdentityPage.SIGNATURE: this._initializeSignature(); break;
			case ZmIdentityPage.ADVANCED: this._initializeAdvanced(); break;
		}
		this._hasRendered = true;
		if (this._identity) {
			// Make all controls up to date with model.
			this.setIdentity(this._identity);
		}
	}
};

ZmIdentityPage.prototype.setIdentity =
function(identity) {
	this._identity = identity;
	
	var doc = document;
	for (var field in this._checkboxIds) {
		var id = this._checkboxIds[field];
		var value = identity.getField(field);
		var checkbox = doc.getElementById(id);
		checkbox.checked = value ? true : false;
		this._applyCheckbox(checkbox);
	}
	
	for (var field in this._radioGroups) {
		var group = this._radioGroups[field];
		var value = identity.getField(field);
		group.setSelectedValue(value);
	}
	
	for (var field in this._inputs) {
		var input = this._inputs[field];
		var value = identity.getField(field);
		input.setValue(value);
	}

	var selectIdentity = this._pageId == ZmIdentityPage.ADVANCED ? identity.getAdvancedIdentity() : identity;
	this._populateSelects(selectIdentity);

	for (var field in this._arrays) {
		var data = this._arrays[field];
		var arrayValue = identity.getField(field);
		var stringValue = data.toText.call(this, arrayValue);
		data.input.setValue(stringValue);
	}
	
	if ((this._pageId == ZmIdentityPage.ADVANCED) && this._hasRendered) {
		var useDefaultElement = document.getElementById(this._htmlElId + "_useDefaultsRadios");
		if (identity.isDefault) {
			Dwt.setVisible(useDefaultElement, false);
		} else {
			Dwt.setVisible(useDefaultElement, true);
		}
		for (var i in this._selects) {
			var select = this._selects[i];
			select.setEnabled(!identity.useDefaultAdvanced);
		}
	}
};
	
ZmIdentityPage.prototype.getChanges =
function() {
	var dirty = false;
	for (var field in this._inputs) {
		var input = this._inputs[field];
		var value = AjxStringUtil.trim(input.getValue());
		if (this._identity.getField(field) != value) {
			this._identity.setField(field, value);
			dirty = true;
		}
	}

	for (var field in this._selects) {
		var select = this._selects[field];
		if (select.getEnabled()) {
			var value = select.getValue();
			if (this._identity.getField(field) != value) {
				this._identity.setField(field, value);
				dirty = true;
			}
		}
	}
	
	for (var field in this._arrays) {
		var data = this._arrays[field];
		var stringValue = data.input.getValue();
		var arrayValue = data.toArray.call(this, stringValue);
		if (!this._areArraysEqual(this._identity.getField(field), arrayValue)) {
			this._identity.setField(field, arrayValue);
			dirty = true;
		}
	}
	
	for (var field in this._radioGroups) {
		var group = this._radioGroups[field];
		var value = group.getSelectedValue();
		if (this._identity.getField(field) != value) {
			this._identity.setField(field, value);
			dirty = true;
		}
	}
	
	var doc = document;
	for (var field in this._checkboxIds) {
		var id = this._checkboxIds[field];
		var value = doc.getElementById(id).checked;
		if (this._identity.getField(field) != value) {
			this._identity.setField(field, value);
			dirty = true;
		}
	}
	return dirty;	
};

ZmIdentityPage.prototype._populateSelects =
function(identity) {
	for (var field in this._selects) {
		var select = this._selects[field];
		var value = identity.getField(field);
		select.setSelectedValue(value);
	}
};

ZmIdentityPage.prototype._areArraysEqual =
function (a, b) {
	if (a.length != b.length) {
		return false;
	}
	for (var i = 0, count = a.length; i < count; i++) {
		if (a[i] != b[i]) {
			return false;
		}
	};
	return true;
};

ZmIdentityPage.prototype._validateSelectedItem =
function(errors) {
	for (var field in this._inputs) {
		var input = this._inputs[field];
		if (input.getEnabled() && (input.isValid() === null)) {
			errors[errors.length] = this._errorMessages[field];
		}
	}
	for (var field in this._arrays) {
		var input = this._arrays[field].input;
		if (input.getEnabled() && (input.isValid() === null)) {
			errors[errors.length] = this._errorMessages[field];
		}
	}
};

ZmIdentityPage.prototype._initializeOptions =
function() {
	var id = this._htmlElId;
	this.getHtmlElement().innerHTML = AjxTemplate.expand("zimbraMail.prefs.templates.Options#IdentityForm_options", id);

	var inputSizeInChars = 30;
	var inputSizeInPixels = 167;
	var params = { parent:this, size: inputSizeInChars, validationStyle: DwtInputField.CONTINUAL_VALIDATION };
	params.hint = ZmMsg.nameHint;
	var sendFromName = new DwtInputField(params);
	this._errorMessages[ZmIdentity.SEND_FROM_DISPLAY] = ZmMsg.sendFromError;
	sendFromName.addListener(DwtEvent.ONKEYUP, this._changeListenerObj);
	this._replaceInput(sendFromName, id + "_sendFromName");
	this._inputs[ZmIdentity.SEND_FROM_DISPLAY] = sendFromName;

	var allowAnyFromAddress = this._appCtxt.get(ZmSetting.ALLOW_ANY_FROM_ADDRESS);
	if (allowAnyFromAddress) {
		params.hint = ZmMsg.addressHint;
		var sendFromAddress = new DwtInputField(params);
		sendFromAddress.setRequired(true);
		sendFromAddress.addListener(DwtEvent.ONKEYUP, this._changeListenerObj);
		sendFromAddress.setValidatorFunction(null, ZmIdentityPage._validateEmailAddress);
		this._errorMessages[ZmIdentity.SEND_FROM_ADDRESS] = ZmMsg.sendFromAddressError;
		sendFromAddress.replaceElement(id + "_sendFromAddress");
		this._inputs[ZmIdentity.SEND_FROM_ADDRESS] = sendFromAddress;
	} else {
		var accountAddress = this._appCtxt.get(ZmSetting.USERNAME);
		var options = [new DwtSelectOptionData(accountAddress, accountAddress)];
		var addresses = this._appCtxt.get(ZmSetting.ALLOW_FROM_ADDRESSES);
		for (var i = 0, count = addresses.length; i < count; i++) {
			options.push(new DwtSelectOptionData(addresses[i], addresses[i]));
		}
		var aliases = this._appCtxt.get(ZmSetting.MAIL_ALIASES);
		for (var i = 0, count = aliases.length; i < count; i++) {
			options.push(new DwtSelectOptionData(aliases[i], aliases[i]));
		}
		var sendFromAddress = new DwtSelect(this, options);
		sendFromAddress.getButton().getHtmlElement().style.minWidth = inputSizeInPixels;
		sendFromAddress.replaceElement(id + "_sendFromAddress");
		this._selects[ZmIdentity.SEND_FROM_ADDRESS] = sendFromAddress;
	}
	
	params.hint = ZmMsg.nameHint;
	var setReplyToName = new DwtInputField(params);
	setReplyToName.setRequired(true);
	this._errorMessages[ZmIdentity.SET_REPLY_TO_DISPLAY] = ZmMsg.replyToError;
	setReplyToName.addListener(DwtEvent.ONKEYUP, this._changeListenerObj);
	this._replaceInput(setReplyToName, id + "_setReplyToName");
	this._inputs[ZmIdentity.SET_REPLY_TO_DISPLAY] = setReplyToName;
	params.hint = ZmMsg.addressHint;
	var setReplyToAddress = new DwtInputField(params);
	setReplyToAddress.addListener(DwtEvent.ONKEYUP, this._changeListenerObj);
	setReplyToAddress.setValidatorFunction(null, ZmIdentityPage._validateEmailAddress);
	this._errorMessages[ZmIdentity.SET_REPLY_TO_ADDRESS] = ZmMsg.replyToAddressError;
	setReplyToAddress.addListener(DwtEvent.ONKEYUP, this._changeListenerObj);
	setReplyToAddress.replaceElement(id + "_setReplyToAddress");
	this._inputs[ZmIdentity.SET_REPLY_TO_ADDRESS] = setReplyToAddress;
	var setReplyToCheckboxId = id + "_setReplyToCheckbox";
	this._associateCheckbox(setReplyToCheckboxId, [setReplyToName, setReplyToAddress]);
	this._checkboxIds[ZmIdentity.SET_REPLY_TO] = setReplyToCheckboxId;
	if (!allowAnyFromAddress) {
		// Make this input a variable size, to align it with the From select.
		setReplyToAddress.getInputElement().style.width='100%';
	}

	params.size = 70;
	params.hint = null;
	var whenSentToInput = new DwtInputField(params);
	whenSentToInput.setValidatorFunction(null, ZmIdentityPage._validateEmailList);
	this._errorMessages[ZmIdentity.WHEN_SENT_TO_ADDRESSES] = ZmMsg.whenSentToError;
	whenSentToInput.addListener(DwtEvent.ONKEYUP, this._changeListenerObj);
	this._replaceInput(whenSentToInput, id + "_whenSentToInput");
	this._arrays[ZmIdentity.WHEN_SENT_TO_ADDRESSES] = { input: whenSentToInput, toArray: this._stringToArray, toText: this._arrayToString };
	var whenSentToCheckboxId = id + "_whenSentToCheckbox";
	this._associateCheckbox(whenSentToCheckboxId, [whenSentToInput]);
	this._checkboxIds[ZmIdentity.USE_WHEN_SENT_TO] = whenSentToCheckboxId;

	whenInFolderInput = new DwtInputField(params);
	whenInFolderInput.setValidatorFunction(this, this._validateFolderList);
	this._errorMessages[ZmIdentity.WHEN_IN_FOLDERIDS] = ZmMsg.whenInFolderError;
	whenInFolderInput.addListener(DwtEvent.ONKEYUP, this._changeListenerObj);
	this._replaceInput(whenInFolderInput, id + "_whenInFolderInput");
	this._arrays[ZmIdentity.WHEN_IN_FOLDERIDS] = { input: whenInFolderInput, toArray: this._stringToFolderArray, toText: this._folderArrayToString };
	var folderBrowseButton = new DwtButton(this);
	folderBrowseButton.replaceElement(id + "_folderBrowseButton");
	folderBrowseButton.setImage("Folder");
	folderBrowseButton.setToolTipContent(ZmMsg.chooseFolder);
	folderBrowseButton.addSelectionListener(new AjxListener(this, this._folderBrowseListener, whenInFolderInput));
	var whenInFolderCheckboxId = id + "_whenInFolderCheckbox";
	this._associateCheckbox(whenInFolderCheckboxId, [whenInFolderInput, folderBrowseButton]);
	this._checkboxIds[ZmIdentity.USE_WHEN_IN_FOLDER] = whenInFolderCheckboxId;
};

// Fixes layout issues in IE by taking the width from the template element and applying it
// to the input inside of the DwtInputField
ZmIdentityPage.prototype._replaceInput =
function(input, id) {
	if (AjxEnv.isIE) {
		var width = document.getElementById(id).style.width;
		input.replaceElement(id);
		input.getInputElement().style.width = width;
	} else {
		input.replaceElement(id);
	}
};

ZmIdentityPage.prototype._stringToArray =
function(value) {
	if (!value) {
		return [];
	}
	var result = value.split(",");
	for (var i = 0, count = result.length; i < count; i++) {
		result[i] = AjxStringUtil.trim(result[i]);
	}
	return result;
};

ZmIdentityPage.prototype._arrayToString =
function(value) {
//TODO: get rid of check. It's there because of my bad test data...	
	return value.join ? value.join(", ") : "";
};

ZmIdentityPage.prototype._stringToFolderArray =
function(value) {
	var result = [];
// TODO : fix data, remove this line.....	
	if (!value.split) return[]; 
	var names = value.split(",");
	if (names.length) {
		var tree = this._appCtxt.getTree(ZmOrganizer.FOLDER);
		for (var i = 0, count = names.length; i < count; i++) {
			var path = AjxStringUtil.trim(names[i]);
			if (path) {
				var folder = tree.root.getChildByPath(path);
				if (folder) {
					result[result.length] = folder.id;
				}
			}
		}
	}
	return result;
};

// Returns the name of an invalid folder, or null if all is good.
ZmIdentityPage.prototype._containsInvalidFolders =
function(value) {
	var names = value.split(",");
	if (names.length) {
		var tree = this._appCtxt.getTree(ZmOrganizer.FOLDER);
		for (var i = 0, count = names.length; i < count; i++) {
			var path = AjxStringUtil.trim(names[i]);
			if (path) {
				var folder = tree.root.getChildByPath(path);
				if (!folder) {
					return path;
				}
			}
		}
	}
	return null;
};

ZmIdentityPage.prototype._folderArrayToString =
function(value) {
	var result = [];
	if (value.length) {
		var tree = this._appCtxt.getTree(ZmOrganizer.FOLDER);
		for (var i = 0, count = value.length; i < count; i++) {
			var folder = tree.getById(value[i]);
			if (folder) {
				result[result.length] = folder.getPath(false, false, null, true, true);
			}
		}
	}
	return result.join(", ");
};

// Sets up a relationship where the controls' enabledness is toggled by the checkbox
ZmIdentityPage.prototype._associateCheckbox =
function(checkboxId, controls) {
	this._associations[checkboxId] = controls;
	var checkbox = document.getElementById(checkboxId);
	this._applyCheckbox(checkbox, controls);
	Dwt.setHandler(checkbox, DwtEvent.ONCLICK, this._checkboxClosure);
};

ZmIdentityPage.prototype._applyCheckbox =
function(checkbox) {
	var controls = this._associations[checkbox.id];
	if (controls) {
		var enabled = checkbox.checked;
		for (var i = 0, count = controls.length; i < count; i++) {
			var control = controls[i];
			control.setEnabled(enabled);
		}
	}
};

ZmIdentityPage.prototype._checkboxHandler =
function(event) {
	var checkbox = DwtUiEvent.getTarget(event);
	this._applyCheckbox(checkbox);
    this.parent.validate();
};

ZmIdentityPage.prototype._initializeAdvanced =
function() {
	var id = this._htmlElId;
	this._useDefaultsCheckboxId = Dwt.getNextId();
	
	var params = { id: id, controller: "ZmIdentityPage" }; // controller is used for onclick handler in template, but we use our own handler
	this.getHtmlElement().innerHTML = AjxTemplate.expand("zimbraMail.prefs.templates.Options#IdentityForm_advanced", params);
	
	var radios = {};
	radios[id + "_useDefaultsCheckbox_default"] = true;
	radios[id + "_useDefaultsCheckbox_custom"] = false;
	var group = new DwtRadioButtonGroup(radios);
	group.setSelectedId(id + "_useDefaultsCheckbox_custom");
	group.addSelectionListener(new AjxListener(this, this._radioListener));
	this._radioGroups[ZmIdentity.USE_DEFAULT_ADVANCED] = group;

	var options = [];
	var i = 0;
	options[i++] = new DwtSelectOptionData(ZmIdentity.COMPOSE_SAME, ZmMsg.originalFormat);
	options[i++] = new DwtSelectOptionData(ZmIdentity.COMPOSE_TEXT, ZmMsg.text);
	options[i++] = new DwtSelectOptionData(ZmIdentity.COMPOSE_HTML, ZmMsg.htmlDocument);
	var replyForwardSelect = new DwtSelect(this, options);
	replyForwardSelect.replaceElement(id + "_replyForwardSelect");
	this._selects[ZmIdentity.COMPOSE_FORMAT] = replyForwardSelect;

	var options = [];
	var i = 0;
	options[i++] = new DwtSelectOptionData(">", ">");
	options[i++] = new DwtSelectOptionData("|", "|");
	var prefixSelect = new DwtSelect(this, options);
	prefixSelect.replaceElement(id + "_prefixSelect");
	this._selects[ZmIdentity.PREFIX] = prefixSelect;

	var options = [];
	var i = 0;
	options[i++] = new DwtSelectOptionData(ZmSetting.INCLUDE_NONE, ZmMsg.dontIncludeMessage);
	options[i++] = new DwtSelectOptionData(ZmSetting.INCLUDE, ZmMsg.includeInBody);
	options[i++] = new DwtSelectOptionData(ZmSetting.INCLUDE_PREFIX, ZmMsg.includePrefix);
	options[i++] = new DwtSelectOptionData(ZmSetting.INCLUDE_ATTACH, ZmMsg.includeOriginalAsAttach);
	options[i++] = new DwtSelectOptionData(ZmSetting.INCLUDE_SMART, ZmMsg.smartInclude);
	var replyOptionSelect = new DwtSelect(this, options);
	replyOptionSelect.replaceElement(id + "_replyIncludeSelect");
	this._selects[ZmIdentity.REPLY_OPTION] = replyOptionSelect;

	var options = [];
	var i = 0;
	options[i++] = new DwtSelectOptionData(ZmSetting.INCLUDE, ZmMsg.includeInBody);
	options[i++] = new DwtSelectOptionData(ZmSetting.INCLUDE_PREFIX, ZmMsg.includePrefix);
	options[i++] = new DwtSelectOptionData(ZmSetting.INCLUDE_ATTACH, ZmMsg.includeOriginalAsAttach);
	var forwardOptionSelect = new DwtSelect(this, options);
	forwardOptionSelect.replaceElement(id + "_forwardIncludeSelect");
	this._selects[ZmIdentity.FORWARD_OPTION] = forwardOptionSelect;
};

ZmIdentityPage.prototype._radioListener =
function(event) {
	var useDefault = event.detail.value;
	var identity = useDefault ? this._appCtxt.getIdentityCollection().defaultIdentity : this._identity;
	this._populateSelects(identity);
		
	for (var i in this._selects) {
		var select = this._selects[i];
		select.setEnabled(!useDefault);
	}
};

ZmIdentityPage.prototype._folderBrowseListener =
function(folderInput) {
	var dialog = this._appCtxt.getChooseFolderDialog();
	dialog.reset();
	dialog.registerCallback(DwtDialog.OK_BUTTON, this._chooseFolderOkCallback, this, [dialog, folderInput]);
	var omit = {};
	dialog.popup([ZmOrganizer.FOLDER], omit, false, ZmMsg.chooseFolder);
};

ZmIdentityPage.prototype._chooseFolderOkCallback =
function(dialog, folderInput, folder) {
	if (folder && folder.id) {
		var value = folderInput.getValue();
		var path = folder.getPath(false, false, null, true, true);
		if (AjxStringUtil.trim(value)) {
			folderInput.setValue([value, path].join(", "));
		} else {
			folderInput.setValue(path);
		}
	    this.parent.validate();
		dialog.popdown();
	}
};

ZmIdentityPage.prototype._initializeSignature =
function() {
	var id = this._htmlElId;
	this.getHtmlElement().innerHTML = AjxTemplate.expand("zimbraMail.prefs.templates.Options#IdentityForm_signature", id);

	var options = [];
	var i = 0;
	options[i++] = new DwtSelectOptionData(ZmSetting.SIG_OUTLOOK, ZmMsg.aboveQuotedText);
	options[i++] = new DwtSelectOptionData(ZmSetting.SIG_INTERNET, ZmMsg.atBottomOfMessage);
	var signatureStyleSelect = new DwtSelect(this, options);
	signatureStyleSelect.replaceElement(id + "_signatureStyleSelect");
	this._selects[ZmIdentity.SIGNATURE_STYLE] = signatureStyleSelect;

	var options = [];
	var i = 0;
	options[i++] = new DwtSelectOptionData(true, ZmMsg.automaticSignature);
	options[i++] = new DwtSelectOptionData(false, ZmMsg.manualSignature);
	var signatureEnabledSelect = new DwtSelect(this, options);
	signatureEnabledSelect.replaceElement(id + "_signatureEnabledSelect");
	this._selects[ZmIdentity.SIGNATURE_ENABLED] = signatureEnabledSelect;

	var params = { parent: this, type: DwtInputField.STRING, size: 80, rows:12 };
	var input = new DwtInputField(params);
	input.replaceElement(id + "_signature");
	this._inputs[ZmIdentity.SIGNATURE] = input;
};

ZmIdentityPage._validateEmailAddress =
function(value) {
	if (value == "") {
		throw AjxMsg.valueIsRequired;
	} else if (!ZmEmailAddress.isValid(value)) {
		throw ZmMsg.errorInvalidEmail;
	}
	return value;
};

ZmIdentityPage._validateEmailList =
function(value) {
	if (value == "") {
		throw AjxMsg.valueIsRequired;
	} else {
		var addresses = ZmEmailAddress.split(value);
		for (var i = 0, count = addresses.length; i < count; i++) {
			if (!ZmEmailAddress.isValid(addresses[i])) {
				throw AjxMessageFormat.format(ZmMsg.errorInvalidEmail, addresses[i]);
			}
		}
	}
	return value;
};

ZmIdentityPage.prototype._validateFolderList =
function(value) {
	if (value == "") {
		throw AjxMsg.valueIsRequired;
	} else {
		var invalid = this._containsInvalidFolders(value)
		if (invalid) {
			throw AjxMessageFormat.format(ZmMsg.errorInvalidFolder, invalid);
		}
	}	
	return value;
};

ZmIdentityPage.prototype._changeListener =
function(evt) {
    this.parent.validate();
};

