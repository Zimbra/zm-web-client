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
	var params = { parent: this.parent, type: DwtInputField.STRING, size: 50 };
	this._identityNameInput = new DwtInputField(params);
	this._identityNameInput.setRequired(true);
	this._identityNameInput.reparentHtmlElement(inputCell);

	var tabView = new DwtTabView(this, null, Dwt.STATIC_STYLE);
	tabView.reparentHtmlElement(parentElement);
	
	this._identityPage = new ZmIdentityPage(this.parent, this._appCtxt, ZmIdentityPage.SENDING);
	tabView.addTab(ZmMsg.identityOptions, this._identityPage);
	this._advancedPage = new ZmIdentityPage(this.parent, this._appCtxt, ZmIdentityPage.REPLYING);
	tabView.addTab(ZmMsg.identityAdvanced, this._advancedPage);
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

ZmIdentityView.prototype.getChanges =
function() {
//	var identity = {};
	var identity = this._identity;
	this._identityPage.getChanges(identity);
	this._advancedPage.getChanges(identity);
	return identity;
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
		this._hasRendered = true;
	}
};

ZmIdentityPage.prototype.setIdentity =
function(identity) {
	this._identity = identity;
	
	for (var field in this._inputs) {
		var input = this._inputs[field];
		var value = identity[field];
		input.setValue(value);
	}

	for (var field in this._selects) {
		var select = this._selects[field];
		var value = identity[field];
		if (value) {
			select.setSelectedValue(value);
		} else {
			select.setSelected(0);
		}
	}

	var doc = document;
	for (var field in this._checkboxIds) {
		var id = this._checkboxIds[field];
		var value = identity[field];
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
		if (this._identity[field] != value) {
			changedIdentity[field] = value;
			dirty = true;
		}
	}

	for (var field in this._selects) {
		var select = this._selects[field];
		var value = select.getValue();
		if (this._identity[field] != value) {
			changedIdentity[field] = value;
			dirty = true;
		}
	}
	
	var doc = document;
	for (var field in this._checkboxIds) {
		var id = this._checkboxIds[field];
		var value = doc.getElementById(id).checked;
		if (this._identity[field] != value) {
			changedIdentity[field] = value;
			dirty = true;
		}
	}
	return dirty;	
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
	whenInFolderCheckboxId = Dwt.getNextId();
	var whenInFolderInputId = Dwt.getNextId();

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
	html[i++] = "'><td>";
	html[i++] = ZmMsg.whenSentTo;
	html[i++] = "<td></tr><tr><td>&nbsp;</td><td id='";
	html[i++] = whenSentToInputId;
	html[i++] = "'></td></tr><tr><td>&nbsp;</td><td class='Hint'>";
	html[i++] = ZmMsg.whenSentToHint;
	html[i++] = "</td></tr>";

	html[i++] = "<tr><td style='text-align:right;'><input type='checkbox' id='";
	html[i++] = whenInFolderCheckboxId;
	html[i++] = "'><td>";
	html[i++] = ZmMsg.whenInFolder;
	html[i++] = "<td></tr><tr><td>&nbsp;</td><td id='";
	html[i++] = whenInFolderInputId;
	html[i++] = "'></td></tr><tr><td>&nbsp;</td><td class='Hint'>";
	html[i++] = ZmMsg.whenInFolderHint;
	html[i++] = "</td></tr>";

	html[i++] = "</table>";
	html[i++] = "</fieldset>";

	this.getHtmlElement().innerHTML = html.join("");

	var params = { parent:this };
	var sendFromName = new DwtInputField(params);
	sendFromName.setRequired(true);
	sendFromName.reparentHtmlElement(sendFromNameId);
	this._inputs["sendFromDisplay"] = sendFromName;
	
	var sendFromAddress = new DwtInputField(params);
	sendFromAddress.setRequired(true);
	sendFromAddress.reparentHtmlElement(sendFromAddressId);
	this._inputs["sendFromAddress"] = sendFromAddress;

	var setReplyToName = new DwtInputField(params);
	setReplyToName.reparentHtmlElement(setReplyToNameId);
	this._inputs["_setReplyToDisplay"] = setReplyToName;
	var setReplyToAddress = new DwtInputField(params);
	setReplyToAddress.reparentHtmlElement(setReplyToAddressId);
	this._inputs["_setReplyToAddress"] = setReplyToAddress;
	this._associateCheckbox(setReplyToCheckboxId, [setReplyToName, setReplyToAddress]);
	this._checkboxIds["_setReplyTo"] = setReplyToCheckboxId;

	var options = [];
	var signatureCollection = this._appCtxt.getApp(ZmZimbraMail.PREFERENCES_APP).getSignatureCollection();
	var signatures = signatureCollection.getSignatures();
	for (var i = 0, count = signatures.length; i < count; i++) {
		var signature = signatures[i];
		options[i] = new DwtSelectOptionData(signature.id, signature.name);
	}
	var useSignatureSelect = new DwtSelect(this, options);
	useSignatureSelect.reparentHtmlElement(useSignatureNameId);
	this._selects["_signature"] = useSignatureSelect;
	this._associateCheckbox(useSignatureCheckboxId, [useSignatureSelect]);
	this._checkboxIds["_useSignature"] = useSignatureCheckboxId;

	params.size = 50;
	var whenSentToInput = new DwtInputField(params);
	whenSentToInput.reparentHtmlElement(whenSentToInputId);
	this._inputs["_whenSentToAddresses"] = whenSentToInput;
	this._associateCheckbox(whenSentToCheckboxId, [whenSentToInput]);
	this._checkboxIds["_useWhenSentTo"] = whenSentToCheckboxId;

	whenInFolderInput = new DwtInputField(params);
	whenInFolderInput.reparentHtmlElement(whenInFolderInputId);
	this._inputs["_whenInFolderIds"] = whenInFolderInput;
	this._associateCheckbox(whenInFolderCheckboxId, [whenInFolderInput]);
	this._checkboxIds["_useWhenInFolder"] = whenInFolderCheckboxId;
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
	this._selects["_composeFormat"] = replyForwardSelect;

	var options = [];
	var i = 0;
	options[i++] = new DwtSelectOptionData(ZmSetting.SIG_OUTLOOK, ZmMsg.aboveQuotedText);
	options[i++] = new DwtSelectOptionData(ZmSetting.SIG_INTERNET, ZmMsg.atBottomOfMessage);
	var signatureStyleSelect = new DwtSelect(this, options);
	signatureStyleSelect.reparentHtmlElement(signatureStyleSelectId);
	this._selects["_signatureStyle"] = signatureStyleSelect;

	var options = [];
	var i = 0;
	options[i++] = new DwtSelectOptionData(">", ">");
	options[i++] = new DwtSelectOptionData("|", "|");
	var prefixSelect = new DwtSelect(this, options);
	prefixSelect.reparentHtmlElement(prefixSelectId);
	this._selects["_prefix"] = prefixSelect;

	var options = [];
	var i = 0;
	options[i++] = new DwtSelectOptionData(ZmSetting.INCLUDE_NONE, ZmMsg.dontInclude);
	options[i++] = new DwtSelectOptionData(ZmSetting.INCLUDE, ZmMsg.includeInBody);
	options[i++] = new DwtSelectOptionData(ZmSetting.INCLUDE_PREFIX, ZmMsg.includePrefix);
	options[i++] = new DwtSelectOptionData(ZmSetting.INCLUDE_ATTACH, ZmMsg.includeAsAttach);
	options[i++] = new DwtSelectOptionData(ZmSetting.INCLUDE_SMART, ZmMsg.smartInclude);
	var replyOptionSelect = new DwtSelect(this, options);
	replyOptionSelect.reparentHtmlElement(replyOptionSelectId);
	this._selects["_replyOption"] = replyOptionSelect;

	var options = [];
	var i = 0;
	options[i++] = new DwtSelectOptionData(ZmSetting.INCLUDE, ZmMsg.includeInBody);
	options[i++] = new DwtSelectOptionData(ZmSetting.INCLUDE_PREFIX, ZmMsg.includePrefix);
	var forwardOptionSelect = new DwtSelect(this, options);
	forwardOptionSelect.reparentHtmlElement(forwardOptionSelectId);
	this._selects["_forwardOption"] = forwardOptionSelect;
	
	this._associateCheckbox(useDefaultsCheckboxId, [replyForwardSelect, signatureStyleSelect, prefixSelect, replyOptionSelect, forwardOptionSelect], true);
};

