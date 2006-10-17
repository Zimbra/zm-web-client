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

	ZmPrefListView.call(this, parent, appCtxt, controller, "ZmIdentityView");
	this._appCtxt = appCtxt;
	this._controller = controller;
	this._prefsController = appCtxt.getApp(ZmZimbraMail.PREFERENCES_APP).getPrefController();
	
	this._title = [ZmMsg.zimbraTitle, ZmMsg.options, ZmPrefView.TAB_NAME[ZmPrefView.IDENTITY]].join(": ");

	this._identityNameInput = null;
	this._identityPage = null;
	this._advancedPage = null;

	// Arrays of items that have been added, deleted, modified.
	this._adds = [];
	this._deletes = [];
	this._updates = [];

	this._nameChangeTimedAction = new AjxTimedAction(this, this._nameChangeAction);
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

ZmIdentityView.prototype._createDetails =
function(parentElement) {
	var inputId = Dwt.getNextId();

	var html = ["<div><table cellspacing=1 cellpadding=1 class='nestedOptionTable'>",
				"<tr><td colspan=2><div class='PanelHead'>", ZmMsg.identitiesLabel, "</div></td></tr>",
				"<tr><td style='text-align:right;' width='200px'>", 
	            ZmMsg.identityNameLabel, "</td><td id='", inputId, "'></td></tr></table></div>"].join("");
	parentElement.innerHTML = html;
	
	var inputCell = document.getElementById(inputId);
	var params = { parent: this.parent, type: DwtInputField.STRING, size: 50, validationStyle: DwtInputField.CONTINUAL_VALIDATION };
	this._identityNameInput = new DwtInputField(params);
	this._identityNameInput.setRequired(true);
	this._identityNameInput.reparentHtmlElement(inputCell);
	this._identityNameInput.setHandler(DwtEvent.ONCHANGE, AjxCallback.simpleClosure(this._nameChangeHandler, this));
	this._identityNameInput.setHandler(DwtEvent.ONKEYPRESS, AjxCallback.simpleClosure(this._nameChangeHandler, this));

	var tabView = new DwtTabView(this, null, Dwt.STATIC_STYLE);
	tabView.reparentHtmlElement(parentElement);
	
	this._identityPage = new ZmIdentityPage(this.parent, this._appCtxt, ZmIdentityPage.SENDING);
	tabView.addTab(ZmMsg.identityOptions, this._identityPage);
	this._advancedPage = new ZmIdentityPage(this.parent, this._appCtxt, ZmIdentityPage.REPLYING);
	tabView.addTab(ZmMsg.identityAdvanced, this._advancedPage);
};

ZmIdentityView.prototype._nameChangeHandler =
function() {
	// Change the list contents on a timer...otherwise keypresses don't show up.
	AjxTimedAction.scheduleAction(this._nameChangeTimedAction, 0);
};

ZmIdentityView.prototype._nameChangeAction =
function() {
	var value = AjxStringUtil.trim(this._identityNameInput.getValue());
	if (this._identity.id) {
		// The item in the list is the actual permanent identity. We don't
		// want to change its name right now.
	} else {
		// This is a newly created identity that hasn't been saved to the server yet.
		this._identity.name = value;
		this.getList().setUI(); // Redraw.
	}
};

ZmIdentityView.prototype._getInfoTitle =
function() {
	return ZmMsg.identityInfoTitle;
};

ZmIdentityView.prototype._getInfoContents =
function() {
	return ZmMsg.identityInfoContent;
};

ZmIdentityView.prototype.showItem =
function(identity) {
	if (this._identity) {
		this.getChanges();
	}
	this._identity = identity;
	this._identityNameInput.setValue(identity.name);
	this._identityPage.setIdentity(identity);
	this._advancedPage.setIdentity(identity);
};

ZmIdentityView.prototype.addNew =
function(identity) {
	this._adds[this._adds.length] = identity;
};

ZmIdentityView.prototype.remove =
function(identity) {
	this._deletes[this._deletes.length] = identity;
};

ZmIdentityView.prototype.validate =
function() {
	var errorMessage = '';
	if (!this._identityNameInput.isValid()) {
		errorMessage += "\n" + identityNameError;
	}
	errorMessage += this._identityPage.validate();
	errorMessage += this._advancedPage.validate();
	return errorMessage
};

ZmIdentityView.prototype.sendChanges =
function() {
	this.getChanges();
	if (!this._adds.length && !this._deletes.length && !this._updates.length) {
		return;
	}

	var batchCommand = new ZmBatchCommand(this._appCtxt);
	this._addCommands(this._adds, "create", batchCommand);
	this._addCommands(this._updates, "update", batchCommand);
	this._addCommands(this._deletes, "delete", batchCommand);
    var callback = new AjxCallback(this, this._handleAction);
	batchCommand.run(callback);
};

ZmIdentityView.prototype._addCommands =
function(list, op, batchCommand) {
	for (var i = 0, count = list.length; i < count; i++) {
		var identity = list[i];
		var command = new AjxCallback(identity, identity.createRequest, [op]);
		batchCommand.add(command);
	}
};

ZmIdentityView.prototype._handleAction =
function(result) {
// Dumb approach.
	var listView = this.getList();
	listView.set(this._controller._getListData());
	
	this._adds.length = 0;
	this._deletes.length = 0;
	this._updates.length = 0;
};
	
ZmIdentityView.prototype._handleActionError =
function(a, b, c) {
//	debugger;
};

ZmIdentityView.prototype.getChanges =
function() {
	var dirty = false;
	if (!this._identity) {
		return dirty;
	}
	var identity = null;
	for (var i = 0, count = this._adds.length; i < count && !identity; i++) {
		if (this._adds[i] == this._identity) {
			identity = this._identity;
		}
	}
	for (var i = 0, count = this._deletes.length; i < count && !identity; i++) {
		if (this._deletes[i] == this._identity) {
			identity = this._identity;
		}
	}
	for (var i = 0, count = this._updates.length; i < count && !identity; i++) {
		if (this._updates[i].id == this._identity.id) {
			identity = this._identity;
		}
	}
	var newModify = !identity;
	if (newModify) {
		identity = new ZmIdentity();
		identity._appCtxt = this._appCtxt;
		identity.id = this._identity.id;
	}
	var name = AjxStringUtil.trim(this._identityNameInput.getValue());
	if (this._identity.name != name) {
		identity.name = name;
		dirty = true;
	}
	dirty = this._identityPage.getChanges(identity) || dirty;
	dirty = this._advancedPage.getChanges(identity) || dirty;
	if (newModify && dirty) {
		this._updates[this._updates.length] = identity;
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
	
	this._inputs = {}; // Map of field name in ZmIdentity to DwtInputField
	this._checkboxIds = {}; // Map of field name in ZmIdentity to checkbox ids
	this._selects = {}; // Map of field name in ZmIdentity to DwtSelect
	this._associations = {}; // Map of checkbox ids to the controls they enable/disable
	this._errorMessages = {} // Map of fields to validation error messages
};

ZmIdentityPage.prototype = new DwtTabViewPage;
ZmIdentityPage.prototype.constructor = ZmIdentityPage;

ZmIdentityPage.SENDING = 0;
ZmIdentityPage.REPLYING = 1;

ZmIdentityPage.toString =
function() {
	return "ZmIdentityPage";
};

ZmIdentityPage.prototype.showMe =
function() {
	if (!this._hasRendered) {
		switch (this._pageId) {
			case ZmIdentityPage.SENDING: this._initializeSending(); break;
			case ZmIdentityPage.REPLYING: this._initializeReplying(); break;
		}
		if (this._identity) {
			this.setIdentity(this._identity);
		}
		this._hasRendered = true;
	}
};

ZmIdentityPage.prototype.setIdentity =
function(identity) {
	this._identity = identity;
	
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

	var doc = document;
	for (var field in this._checkboxIds) {
		var id = this._checkboxIds[field];
		var value = identity.getField(field);
		var checkbox = doc.getElementById(id);
		checkbox.checked = value ? true : false;
		this._applyCheckbox(checkbox);
	}
};
	
ZmIdentityPage.prototype.getChanges =
function(changedIdentity) {
	var dirty = false;
	for (var field in this._inputs) {
		var input = this._inputs[field];
		var value = AjxStringUtil.trim(input.getValue());
		if (this._identity.getField(field) != value) {
			changedIdentity.setField(field, value);
			dirty = true;
		}
	}

	for (var field in this._selects) {
		var select = this._selects[field];
		var value = select.getValue();
		if (this._identity.getField(field) != value) {
			changedIdentity.setField(field, value);
			dirty = true;
		}
	}
	
	var doc = document;
	for (var field in this._checkboxIds) {
		var id = this._checkboxIds[field];
		var value = doc.getElementById(id).checked;
		if (this._identity.getField(field) != value) {
			changedIdentity.setField(field, value);
			dirty = true;
		}
	}
	return dirty;	
};

ZmIdentityPage.prototype.validate =
function() {
	var errorMessage = "";
	for (var field in this._inputs) {
		var input = this._inputs[field];
		if (input.getEnabled() && !input.isValid()) {
			errorMessage += "\n" + this._errorMessages[field];
		}
	}
	return errorMessage;
};

ZmIdentityPage.prototype._initializeSending =
function() {
	var sendFromNameId = Dwt.getNextId();
	var sendFromAddressId = Dwt.getNextId();
	var setReplyToCheckboxId = Dwt.getNextId();
	var setReplyToNameId = Dwt.getNextId();
	var setReplyToAddressId = Dwt.getNextId();
	var useSignatureCheckboxId = Dwt.getNextId();
	var useSignatureNameId = Dwt.getNextId();
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

	html[i++] = "<tr><td><input type='checkbox' id='"
	html[i++] = useSignatureCheckboxId;
	html[i++] = "'>";
	html[i++] = ZmMsg.useSignature;
	html[i++] = "</td><td colspan=2 id='";
	html[i++] = useSignatureNameId;
	html[i++] = "'></td>";
	html[i++] = "</tr>";

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
	html[i++] = "</td></tr><tr><td>&nbsp;</td><td><div id='";
	html[i++] = whenInFolderInputId;
	html[i++] = "'></div><div id='";
	html[i++] = folderBrowseButtonId;
	html[i++] = "'></div></td></tr><tr><td>&nbsp;</td><td class='Hint'>";
	html[i++] = ZmMsg.whenInFolderHint;
	html[i++] = "</td></tr>";

	html[i++] = "</table>";
	html[i++] = "</fieldset>";

	this.getHtmlElement().innerHTML = html.join("");

	var params = { parent:this, validationStyle: DwtInputField.CONTINUAL_VALIDATION };
	var sendFromName = new DwtInputField(params);
	sendFromName.setRequired(true);
	sendFromName.reparentHtmlElement(sendFromNameId);
	this._inputs[ZmIdentity.SEND_FROM_DISPLAY] = sendFromName;
	this._errorMessages[ZmIdentity.SEND_FROM_DISPLAY] = ZmMsg.sendFromError;

	var sendFromAddress = new DwtInputField(params);
	sendFromAddress.setRequired(true);
	sendFromAddress.setValidatorFunction(null, ZmIdentityPage._validateEmailAddress);
	sendFromAddress.reparentHtmlElement(sendFromAddressId);
	this._inputs[ZmIdentity.SEND_FROM_ADDRESS] = sendFromAddress;
	this._errorMessages[ZmIdentity.SEND_FROM_ADDRESS] = ZmMsg.sendFromAddressError;

	var setReplyToName = new DwtInputField(params);
	setReplyToName.reparentHtmlElement(setReplyToNameId);
	this._inputs[ZmIdentity.SET_REPLY_TO_DISPLAY] = setReplyToName;
	var setReplyToAddress = new DwtInputField(params);
	setReplyToAddress.reparentHtmlElement(setReplyToAddressId);
	this._inputs[ZmIdentity.SET_REPLY_TO_ADDRESS] = setReplyToAddress;
	this._associateCheckbox(setReplyToCheckboxId, [setReplyToName, setReplyToAddress]);
	this._checkboxIds[ZmIdentity.SET_REPLY_TO] = setReplyToCheckboxId;

	var options = [];
	var signatureCollection = this._appCtxt.getApp(ZmZimbraMail.PREFERENCES_APP).getSignatureCollection();
	var signatures = signatureCollection.getSignatures();
	for (var i = 0, count = signatures.length; i < count; i++) {
		var signature = signatures[i];
		options[i] = new DwtSelectOptionData(signature.id, signature.name);
	}
	var useSignatureSelect = new DwtSelect(this, options);
	useSignatureSelect.reparentHtmlElement(useSignatureNameId);
	this._selects[ZmIdentity.SIGNATURE] = useSignatureSelect;
	this._associateCheckbox(useSignatureCheckboxId, [useSignatureSelect]);
	this._checkboxIds[ZmIdentity.USE_SIGNATURE] = useSignatureCheckboxId;

	params.size = 50;
	var whenSentToInput = new DwtInputField(params);
	whenSentToInput.reparentHtmlElement(whenSentToInputId);
	this._inputs[ZmIdentity.WHEN_SENT_TO_ADDRESSES] = whenSentToInput;
	this._associateCheckbox(whenSentToCheckboxId, [whenSentToInput]);
	this._checkboxIds[ZmIdentity.USE_WHEN_SENT_TO] = whenSentToCheckboxId;

	whenInFolderInput = new DwtInputField(params);
	whenInFolderInput.reparentHtmlElement(whenInFolderInputId);
	this._inputs[ZmIdentity.WHEN_IN_FOLDERIDS] = whenInFolderInput;
	var folderBrowseButton = new DwtButton(this);
	folderBrowseButton.reparentHtmlElement(folderBrowseButtonId);
	folderBrowseButton.setImage("Folder");
	folderBrowseButton.setToolTipContent(ZmMsg.chooseFolder);
	folderBrowseButton.addSelectionListener(new AjxListener(this, this._folderBrowseListener, whenInFolderInput));
	this._associateCheckbox(whenInFolderCheckboxId, [whenInFolderInput, folderBrowseButton]);
	this._checkboxIds[ZmIdentity.USE_WHEN_IN_FOLDER] = whenInFolderCheckboxId;
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
};

ZmIdentityPage.prototype._initializeReplying =
function() {
	
	var useDefaultsCheckboxId = Dwt.getNextId();
	
	var replyForwardSelectId = Dwt.getNextId();
	var signatureStyleSelectId = Dwt.getNextId();
	var prefixSelectId = Dwt.getNextId();
	var replyOptionSelectId = Dwt.getNextId();
	var forwardOptionSelectId = Dwt.getNextId();
	
	var html = [];
	var i = 0;
	html[i++] = "<input type='checkbox' id='";
	html[i++] = useDefaultsCheckboxId;
	html[i++] = "'>";
	html[i++] = ZmMsg.identitiesUseDefault;
	html[i++] = "<fieldset class='ZmFieldset'><legend class='ZmLegend'>";
	html[i++] = ZmMsg.sendWithIdentity;
	html[i++] = "</legend>";
	html[i++] = "</fieldset>";
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
	html[i++] = ZmMsg.placeSignature;
	html[i++] = "</td><td id='";
	html[i++] = signatureStyleSelectId;
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
	options[i++] = new DwtSelectOptionData(ZmSetting.SIG_OUTLOOK, ZmMsg.aboveQuotedText);
	options[i++] = new DwtSelectOptionData(ZmSetting.SIG_INTERNET, ZmMsg.atBottomOfMessage);
	var signatureStyleSelect = new DwtSelect(this, options);
	signatureStyleSelect.reparentHtmlElement(signatureStyleSelectId);
	this._selects[ZmIdentity.SIGNATURE_STYLE] = signatureStyleSelect;

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
	
	this._checkboxIds[ZmIdentity.USE_DEFAULT_ADVANCED] = useDefaultsCheckboxId;
	this._associateCheckbox(useDefaultsCheckboxId, [replyForwardSelect, signatureStyleSelect, prefixSelect, replyOptionSelect, forwardOptionSelect], true);
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
		if (AjxStringUtil.trim(value)) {
			folderInput.setValue([value, folder.name].join(", "));
		} else {
			folderInput.setValue(folder.name);
		}
		dialog.popdown();
	}
};

ZmIdentityPage._validateEmailAddress =
function(value) {
	if (value == "") {
		throw AjxMsg.valueIsRequired;
	} else if (!ZmEmailAddress.isValid(value)) {
		throw AjxMessageFormat.format(ZmMsg.errorInvalidEmail);
	}
	return value;
};

