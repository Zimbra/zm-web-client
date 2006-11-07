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
	var inputId = Dwt.getNextId();

	var html = ["<table cellspacing=0 cellpadding=0>",
				"<tr><td style='text-align:right;' width='120px'>", 
	            ZmMsg.identityNameLabel, "</td><td id='", inputId, "'></td></tr></table>"].join("");
	parentElement.innerHTML = html;
	
	var inputCell = document.getElementById(inputId);
	var params = { parent: this.parent, type: DwtInputField.STRING, size: 50, validationStyle: DwtInputField.CONTINUAL_VALIDATION };
	this._identityNameInput = new DwtInputField(params);
	this._identityNameInput.setRequired(true);
	this._identityNameInput.reparentHtmlElement(inputCell);
	this._identityNameInput.setHandler(DwtEvent.ONCHANGE, AjxCallback.simpleClosure(this._nameChangeHandler, this));
	this._identityNameInput.setHandler(DwtEvent.ONKEYUP, AjxCallback.simpleClosure(this._nameChangeHandler, this));

	var tabView = new DwtTabView(this, null, Dwt.STATIC_STYLE);
	tabView.reparentHtmlElement(parentElement);
	
	this._addPage(ZmIdentityPage.OPTIONS, ZmMsg.identityOptions, tabView);
	this._addPage(ZmIdentityPage.SIGNATURE, ZmMsg.signature, tabView);
	this._addPage(ZmIdentityPage.ADVANCED, ZmMsg.identityAdvanced, tabView);
	
	var identityCollection = this._appCtxt.getIdentityCollection();
	identityCollection.addChangeListener(new AjxListener(this, this._identityChangeListener));
};

ZmIdentityView.prototype._addPage =
function(pageId, title, tabView) {
	var page = new ZmIdentityPage(this, this._appCtxt, pageId);
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
	this._deletes[this._deletes.length] = identity;
};

ZmIdentityView.prototype._validateSelectedItem =
function(errors) {
	if (!this._identity) {
		return;
	}
	if (!this._identityNameInput.isValid()) {
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

	this._addCommands(this._adds, "CreateIdentityRequest", batchCommand);
	this._addCommands(this._updates, "ModifyIdentityRequest", batchCommand);
	this._addCommands(this._deletes, "DeleteIdentityRequest", batchCommand);
    var callback = new AjxCallback(this, this._handleAction);
	batchCommand.addCallback(callback);
};

ZmIdentityView.prototype._addCommands =
function(list, op, batchCommand) {
	for (var i = 0, count = list.length; i < count; i++) {
		var identity = list[i];
		identity.createRequest(op, batchCommand);
	}
};

ZmIdentityView.prototype._handleAction =
function(result) {
	this._clearChanges();
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
	var name = AjxStringUtil.trim(this._identityNameInput.getValue());
	if (this._identity.name != name) {
		identity.name = name;
		dirty = true;
	}
	for (var i = 0, count = this._pages.length; i < count; i++) {
		dirty = this._pages[i].getChanges(this._identity) || dirty;
	}
	
	if (dirty && this._identity.id) {
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
	
	for (var field in this._inputs) {
		var input = this._inputs[field];
		var value = identity.getField(field);
		input.setValue(value);
	}

	for (var field in this._selects) {
		var select = this._selects[field];
		var value = identity.getField(field);
		if (value) {
			select.setSelectedValue(value);
		} else {
			select.setSelected(0);
		}
	}

	for (var field in this._arrays) {
		var data = this._arrays[field];
		var arrayValue = identity.getField(field);
		var stringValue = data.toText.call(this, arrayValue);
		data.input.setValue(stringValue);
	}
	
	if ((this._pageId == ZmIdentityPage.ADVANCED) && this._hasRendered) {
		var checkbox = document.getElementById(this._useDefaultsCheckboxId);
		if (identity.isDefault) {
			checkbox.checked = false;
			Dwt.setVisibility(checkbox.parentNode, false);
			this._applyCheckbox(checkbox, this._associations[this._useDefaultsCheckboxId]);
		} else {
			Dwt.setVisibility(checkbox.parentNode, true);
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
		var value = select.getValue();
		if (this._identity.getField(field) != value) {
			this._identity.setField(field, value);
			dirty = true;
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
	var sendFromNameId = Dwt.getNextId();
	var sendFromAddressId = Dwt.getNextId();
	var setReplyToCheckboxId = Dwt.getNextId();
	var setReplyToNameId = Dwt.getNextId();
	var setReplyToAddressId = Dwt.getNextId();
	var whenSentToCheckboxId = Dwt.getNextId();
	var whenSentToInputId = Dwt.getNextId();
	var whenInFolderCheckboxId = Dwt.getNextId();
	var whenInFolderInputId = Dwt.getNextId();
	var folderBrowseButtonId = Dwt.getNextId();
	var sendBCCToCheckboxId = Dwt.getNextId();
	var sendBCCToNameId = Dwt.getNextId();

	var html = [];
	var i = 0;
	html[i++] = "<fieldset class='ZmFieldset'><legend class='ZmLegend'>";
	html[i++] = ZmMsg.sendWithIdentity;
	html[i++] = "</legend>";
	html[i++] = "<table style='width:100%'>";

	html[i++] = "<tr><td class='Label'>";
	html[i++] = ZmMsg.sendFrom;
	html[i++] = "</td><td id='";
	html[i++] = sendFromNameId;
	html[i++] = "'></td><td id='";
	html[i++] = sendFromAddressId;
	html[i++] = "'></td></tr>";

	html[i++] = "<tr><td><input type='checkbox' id='";
	html[i++] = setReplyToCheckboxId;
	html[i++] = "'>";
	html[i++] = ZmMsg.setReplyTo;
	html[i++] = "</td><td id='";
	html[i++] = setReplyToNameId;
	html[i++] = "'></td><td id='";
	html[i++] = setReplyToAddressId;
	html[i++] = "'></td></tr>";

	html[i++] = "</table>";
	html[i++] = "</fieldset>";
	html[i++] = "<fieldset class='ZmFieldset'><legend class='ZmLegend'>";
	html[i++] = ZmMsg.selectIdentityWhen;
	html[i++] = "</legend>";
	html[i++] = "<table style='width:100%'>";

	html[i++] = "<tr><td style='text-align:right;'><input type='checkbox' id='";
	html[i++] = whenSentToCheckboxId;
	html[i++] = "'></td><td>";
	html[i++] = ZmMsg.whenSentTo;
	html[i++] = "</td></tr><tr><td>&nbsp;</td><td id='";
	html[i++] = whenSentToInputId;
	html[i++] = "'></td></tr><tr><td>&nbsp;</td><td class='Hint'>";
	html[i++] = ZmMsg.whenSentToHint;
	html[i++] = "</td></tr>";

	html[i++] = "<tr><td style='text-align:right;'><input type='checkbox' id='";
	html[i++] = whenInFolderCheckboxId;
	html[i++] = "'></td><td>";
	html[i++] = ZmMsg.whenInFolder;
	html[i++] = "</td></tr><tr><td>&nbsp;</td><td><table cellspacing=0 cellpadding=0><tr><td id='";
	html[i++] = whenInFolderInputId;
	html[i++] = "'></td><td style='padding-left:5px' id='";
	html[i++] = folderBrowseButtonId;
	html[i++] = "'></td></tr></table></td></tr><tr><td>&nbsp;</td><td class='Hint'>";
	html[i++] = ZmMsg.whenInFolderHint;
	html[i++] = "</td></tr>";

	html[i++] = "</table>";
	html[i++] = "</fieldset>";

	this.getHtmlElement().innerHTML = html.join("");

	var inputSizeInChars = 30;
	var inputSizeInPixels = 167;
	var params = { parent:this, size: inputSizeInChars, validationStyle: DwtInputField.CONTINUAL_VALIDATION };
	params.hint = ZmMsg.nameHint;
	var sendFromName = new DwtInputField(params);
	sendFromName.setRequired(true);
	this._errorMessages[ZmIdentity.SEND_FROM_DISPLAY] = ZmMsg.sendFromError;
	sendFromName.addListener(DwtEvent.ONKEYUP, this._changeListenerObj);
	sendFromName.reparentHtmlElement(sendFromNameId);
	this._inputs[ZmIdentity.SEND_FROM_DISPLAY] = sendFromName;

	var allowAnyFromAddress = this._appCtxt.get(ZmSetting.ALLOW_ANY_FROM_ADDRESS);
	if (allowAnyFromAddress) {
		params.hint = ZmMsg.addressHint;
		var sendFromAddress = new DwtInputField(params);
		sendFromAddress.setRequired(true);
		sendFromAddress.addListener(DwtEvent.ONKEYUP, this._changeListenerObj);
		sendFromAddress.setValidatorFunction(null, ZmIdentityPage._validateEmailAddress);
		this._errorMessages[ZmIdentity.SEND_FROM_ADDRESS] = ZmMsg.sendFromAddressError;
		sendFromAddress.reparentHtmlElement(sendFromAddressId);
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
		sendFromAddress.reparentHtmlElement(sendFromAddressId);
		this._selects[ZmIdentity.SEND_FROM_ADDRESS] = sendFromAddress;
	}
	
	params.hint = ZmMsg.nameHint;
	var setReplyToName = new DwtInputField(params);
	setReplyToName.setRequired(true);
	this._errorMessages[ZmIdentity.SET_REPLY_TO_DISPLAY] = ZmMsg.replyToError;
	setReplyToName.addListener(DwtEvent.ONKEYUP, this._changeListenerObj);
	setReplyToName.reparentHtmlElement(setReplyToNameId);
	this._inputs[ZmIdentity.SET_REPLY_TO_DISPLAY] = setReplyToName;
	params.hint = ZmMsg.addressHint;
	var setReplyToAddress = new DwtInputField(params);
	setReplyToAddress.addListener(DwtEvent.ONKEYUP, this._changeListenerObj);
	setReplyToAddress.setValidatorFunction(null, ZmIdentityPage._validateEmailAddress);
	this._errorMessages[ZmIdentity.SET_REPLY_TO_ADDRESS] = ZmMsg.replyToAddressError;
	setReplyToAddress.addListener(DwtEvent.ONKEYUP, this._changeListenerObj);
	setReplyToAddress.reparentHtmlElement(setReplyToAddressId);
	this._inputs[ZmIdentity.SET_REPLY_TO_ADDRESS] = setReplyToAddress;
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
	whenSentToInput.reparentHtmlElement(whenSentToInputId);
	this._arrays[ZmIdentity.WHEN_SENT_TO_ADDRESSES] = { input: whenSentToInput, toArray: this._stringToArray, toText: this._arrayToString };
	this._associateCheckbox(whenSentToCheckboxId, [whenSentToInput]);
	this._checkboxIds[ZmIdentity.USE_WHEN_SENT_TO] = whenSentToCheckboxId;

	whenInFolderInput = new DwtInputField(params);
	whenInFolderInput.setValidatorFunction(this, this._validateFolderList);
	this._errorMessages[ZmIdentity.WHEN_IN_FOLDERIDS] = ZmMsg.whenInFolderError;
	whenInFolderInput.addListener(DwtEvent.ONKEYUP, this._changeListenerObj);
	whenInFolderInput.reparentHtmlElement(whenInFolderInputId);
	this._arrays[ZmIdentity.WHEN_IN_FOLDERIDS] = { input: whenInFolderInput, toArray: this._stringToFolderArray, toText: this._folderArrayToString };
	var folderBrowseButton = new DwtButton(this);
	folderBrowseButton.reparentHtmlElement(folderBrowseButtonId);
	folderBrowseButton.setImage("Folder");
	folderBrowseButton.setToolTipContent(ZmMsg.chooseFolder);
	folderBrowseButton.addSelectionListener(new AjxListener(this, this._folderBrowseListener, whenInFolderInput));
	this._associateCheckbox(whenInFolderCheckboxId, [whenInFolderInput, folderBrowseButton]);
	this._checkboxIds[ZmIdentity.USE_WHEN_IN_FOLDER] = whenInFolderCheckboxId;
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
			var folder = tree.root.getChildByPath(path);
			if (folder) {
				result[result.length] = folder.id;
			} // else we just don't show the folder.
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
			var folder = tree.root.getChildByPath(path);
			if (!folder) {
				return path;
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
function(checkboxId, controls, checkedIsDisabled) {
	this._associations[checkboxId] = { controls: controls, checkedIsDisabled: checkedIsDisabled };
	var checkbox = document.getElementById(checkboxId);
	this._applyCheckbox(checkbox, controls);
	Dwt.setHandler(checkbox, DwtEvent.ONCLICK, this._checkboxClosure);
};

ZmIdentityPage.prototype._applyCheckbox =
function(checkbox) {
	var data = this._associations[checkbox.id];
	var isChecked = checkbox.checked;
	var enabled = data.checkedIsDisabled ? !isChecked : isChecked;
	for (var i = 0, count = data.controls.length; i < count; i++) {
		var control = data.controls[i];
		control.setEnabled(enabled);
	}
};

ZmIdentityPage.prototype._checkboxHandler =
function(event) {
	var checkbox = event.target;
	this._applyCheckbox(checkbox);
    this.parent.validate();
};

ZmIdentityPage.prototype._initializeAdvanced =
function() {
	
	this._useDefaultsCheckboxId = Dwt.getNextId();
	
	var replyForwardSelectId = Dwt.getNextId();
	var prefixSelectId = Dwt.getNextId();
	var replyOptionSelectId = Dwt.getNextId();
	var forwardOptionSelectId = Dwt.getNextId();
	
	var html = [];
	var i = 0;
	html[i++] = "<div><input type='checkbox' id='";
	html[i++] = this._useDefaultsCheckboxId;
	html[i++] = "'>";
	html[i++] = ZmMsg.identitiesUseDefault;
	html[i++] = "</div>";
	html[i++] = "<fieldset class='ZmFieldset'><legend class='ZmLegend'>";
	html[i++] = ZmMsg.replyWithIdentity;
	html[i++] = "</legend>";
	html[i++] = "<table style='width:100%'>";

	html[i++] = "<tr><td>";
	html[i++] = ZmMsg.replyForwardFormat;
	html[i++] = "</td><td id='";
	html[i++] = replyForwardSelectId;
	html[i++] = "'></td></tr>";
	
	html[i++] = "<tr><td>";
	html[i++] = ZmMsg.prefixTextWith;
	html[i++] = "</td><td id='";
	html[i++] = prefixSelectId;
	html[i++] = "'></td></tr>";
	
	html[i++] = "<tr><td>";
	html[i++] = ZmMsg.whenReplying;
	html[i++] = "</td><td id='";
	html[i++] = replyOptionSelectId;
	html[i++] = "'></td></tr>";
	
	html[i++] = "<tr><td>";
	html[i++] = ZmMsg.whenForwarding;
	html[i++] = "</td><td id='";
	html[i++] = forwardOptionSelectId;
	html[i++] = "'></td></tr>";
	
	html[i++] = "</table>";
	html[i++] = "</fieldset>";
	this.getHtmlElement().innerHTML = html.join("");

	var options = [];
	var i = 0;
	options[i++] = new DwtSelectOptionData(ZmIdentity.COMPOSE_SAME, ZmMsg.originalFormat);
	options[i++] = new DwtSelectOptionData(ZmIdentity.COMPOSE_TEXT, ZmMsg.text);
	options[i++] = new DwtSelectOptionData(ZmIdentity.COMPOSE_HTML, ZmMsg.htmlDocument);
	var replyForwardSelect = new DwtSelect(this, options);
	replyForwardSelect.reparentHtmlElement(replyForwardSelectId);
	this._selects[ZmIdentity.COMPOSE_FORMAT] = replyForwardSelect;

	var options = [];
	var i = 0;
	options[i++] = new DwtSelectOptionData(">", ">");
	options[i++] = new DwtSelectOptionData("|", "|");
	var prefixSelect = new DwtSelect(this, options);
	prefixSelect.reparentHtmlElement(prefixSelectId);
	this._selects[ZmIdentity.PREFIX] = prefixSelect;

	var options = [];
	var i = 0;
	options[i++] = new DwtSelectOptionData(ZmSetting.INCLUDE_NONE, ZmMsg.dontInclude);
	options[i++] = new DwtSelectOptionData(ZmSetting.INCLUDE, ZmMsg.includeInBody);
	options[i++] = new DwtSelectOptionData(ZmSetting.INCLUDE_PREFIX, ZmMsg.includePrefix);
	options[i++] = new DwtSelectOptionData(ZmSetting.INCLUDE_ATTACH, ZmMsg.includeAsAttach);
	options[i++] = new DwtSelectOptionData(ZmSetting.INCLUDE_SMART, ZmMsg.smartInclude);
	var replyOptionSelect = new DwtSelect(this, options);
	replyOptionSelect.reparentHtmlElement(replyOptionSelectId);
	this._selects[ZmIdentity.REPLY_OPTION] = replyOptionSelect;

	var options = [];
	var i = 0;
	options[i++] = new DwtSelectOptionData(ZmSetting.INCLUDE, ZmMsg.includeInBody);
	options[i++] = new DwtSelectOptionData(ZmSetting.INCLUDE_PREFIX, ZmMsg.includePrefix);
	var forwardOptionSelect = new DwtSelect(this, options);
	forwardOptionSelect.reparentHtmlElement(forwardOptionSelectId);
	this._selects[ZmIdentity.FORWARD_OPTION] = forwardOptionSelect;
	
	this._checkboxIds[ZmIdentity.USE_DEFAULT_ADVANCED] = this._useDefaultsCheckboxId;
	this._associateCheckbox(this._useDefaultsCheckboxId, [replyForwardSelect, prefixSelect, replyOptionSelect, forwardOptionSelect], true);
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
	var signatureStyleSelectId = Dwt.getNextId();
	var signatureId = Dwt.getNextId();

	var html = [];
	var i = 0;
	html[i++] = "<table><tr><td>";
	html[i++] = ZmMsg.placeSignature;
	html[i++] = "</td><td id='";
	html[i++] = signatureStyleSelectId;
	html[i++] = "'></td></tr></table>";
	html[i++] = "<div id='";
	html[i++] = signatureId;
	html[i++] = "'></div>";

	this.getHtmlElement().innerHTML = html.join("");
	
	var options = [];
	var i = 0;
	options[i++] = new DwtSelectOptionData(ZmSetting.SIG_OUTLOOK, ZmMsg.aboveQuotedText);
	options[i++] = new DwtSelectOptionData(ZmSetting.SIG_INTERNET, ZmMsg.atBottomOfMessage);
	var signatureStyleSelect = new DwtSelect(this, options);
	signatureStyleSelect.reparentHtmlElement(signatureStyleSelectId);
	this._selects[ZmIdentity.SIGNATURE_STYLE] = signatureStyleSelect;

	var params = { parent: this, type: DwtInputField.STRING, size: 80, rows:12 };
	var input = new DwtInputField(params);
	input.reparentHtmlElement(signatureId);
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

