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

 function ZmPersonasView(parent, appCtxt, controller) {

	DwtTabViewPage.call(this, parent, "ZmPersonasView");

	this._appCtxt = appCtxt;
	this._controller = controller;
	this._prefsController = appCtxt.getApp(ZmZimbraMail.PREFERENCES_APP).getPrefController();
	
	this._title = [ZmMsg.zimbraTitle, ZmMsg.options, ZmPrefView.TAB_NAME[ZmPrefView.PERSONAS]].join(": ");

	this._rendered = false;
	this._hasRendered = false;
};

ZmPersonasView.prototype = new DwtTabViewPage;
ZmPersonasView.prototype.constructor = ZmPersonasView;
 
ZmPersonasView.prototype.toString =
function() {
	return "ZmPersonasView";
};

ZmPersonasView.prototype.showMe =
function() {
	Dwt.setTitle(this._title);
	this._prefsController._resetOperations(this._prefsController._toolbar, ZmPrefView.PERSONAS);
	if (this._hasRendered) return;

	this._createHtml();
	this._hasRendered = true;
};

ZmPersonasView.prototype.getTitle =
function() {
	return this._title;
};

ZmPersonasView.prototype.hasRendered =
function () {
	return this._hasRendered;
};

ZmPersonasView.prototype.getAddButton =
function() {
	return this._addButton;
};

ZmPersonasView.prototype.getRemoveButton =
function() {
	return this._removeButton;
};

ZmPersonasView.prototype.getPersonaListView =
function() {
	return this._personaListView;
};

ZmPersonasView.prototype._createHtml =
function() {
	var html = [];
	var i = 0;
	var listCellId = Dwt.getNextId();
	this._personasCell = Dwt.getNextId();
	var newPersonaButtonCellId = Dwt.getNextId();
	var removePersonaButtonCellId = Dwt.getNextId();
	
	html[i++] = "<table width='100%' height='100%' cellspacing=10><tr><td class='OutsetPanel' width='100px'><table class='ZmPersonasBox'><tr><td id='";
	html[i++] = listCellId;
	html[i++] = "'></td></tr><tr><td><table width='100%'><tr>";
	html[i++] = "<td id='";
	html[i++] = newPersonaButtonCellId;
	html[i++] = "'></td>"
	html[i++] = "<td id='";
	html[i++] = removePersonaButtonCellId;
	html[i++] = "'></td>";
	html[i++] = "</tr></table></td></tr></table></td><td style='vertical-align:top;'>";
	i = this._createInfoBox(html, i, ZmMsg.personaInfoTitle, ZmMsg.personaInfoContent);
	html[i++] = "<div id = '";
	html[i++] = this._personasCell;
	html[i++] = "'></div></td></tr></table>";
	this.getHtmlElement().innerHTML = html.join("");

//Dave: this can be done inline
	this._createTabView();		

	// Create the list of personas.
	this._personaListView = new ZmPersonaListView(this, this._appCtxt);
	var listCell = document.getElementById(listCellId);
	this._personaListView.reparentHtmlElement(listCell);
	this._personaListView.setSize(200, 600);
	
	// Create the Add & remove buttons.
	this._addButton = new DwtButton(this, DwtLabel.ALIGN_CENTER);
	this._addButton.reparentHtmlElement(newPersonaButtonCellId)
	this._addButton.setText(ZmMsg.add);
	this._removeButton = new DwtButton(this, DwtLabel.ALIGN_CENTER);
	this._removeButton.reparentHtmlElement(removePersonaButtonCellId)
	this._removeButton.setText(ZmMsg.remove);
	
	this._controller._setup();
};

ZmPersonasView.prototype._createInfoBox =
function(html, i, title, contents) {
	html[i++] = "<div class='infoBox'><div class='InfoTitle'><div class='infoTitleClose'>";
	html[i++] = ZmMsg.close;
	html[i++] = "</div>";
	html[i++] = title;
	html[i++] = "</div>";
	html[i++] = contents;
	html[i++] = "</div>";
	return i;
};

ZmPersonasView.prototype.showPersona =
function(persona) {
	this._personaNameInput.setValue(persona.name);
	this._personaPage.setPersona(persona);
};

ZmPersonasView.prototype._createTabView =
function() {
	var inputId = Dwt.getNextId();
	
	var cell = document.getElementById(this._personasCell);
	var html = ["<div><table cellspacing=1 cellpadding=1 class='nestedOptionTable'>",
				"<tr><td colspan=2><div class='PanelHead'>", ZmMsg.personasLabel, "</div></td></tr>",
				"<tr><td style='text-align:right;' width='200px'>", 
	            ZmMsg.personaNameLabel, "</td><td id='", inputId, "'></td></tr></table></div>"].join("");
	cell.innerHTML = html;
	
	var inputCell = document.getElementById(inputId);
	var params = { parent: this.parent, type: DwtInputField.STRING, size: 50 };
	this._personaNameInput = new DwtInputField(params);
	this._personaNameInput.setRequired(true);
	this._personaNameInput.reparentHtmlElement(inputCell);

	var tabView = new DwtTabView(this, null, Dwt.STATIC_STYLE);
	tabView.reparentHtmlElement(cell);
	
	this._personaPage = new ZmPersonaPage(this.parent, ZmPersonaPage.SENDING);
	tabView.addTab(ZmMsg.personaOptions, this._personaPage);
	var tab = new ZmPersonaPage(this.parent, ZmPersonaPage.REPLYING);
	tabView.addTab(ZmMsg.personaAdvanced, tab);
};

/*
* ZmPersonaListView
*/
function ZmPersonaListView(parent, appCtxt) {
	var headerList = [new DwtListHeaderItem(ZmPersonaListView.COLUMN, ZmMsg.personas, null, ZmPersonaListView.COLUMN_WIDTH)];
	DwtListView.call(this, parent, "ZmPersonaListView", null, headerList);	

	this._appCtxt = appCtxt;
	
	this.setMultiSelect(false);
};

ZmPersonaListView.COLUMN	= 1;
ZmPersonaListView.COLUMN_WIDTH = 40;

ZmPersonaListView.prototype = new DwtListView;
ZmPersonaListView.prototype.constructor = ZmPersonaListView;

ZmPersonaListView.prototype.toString = 
function() {
	return "ZmPersonaListView";
};

ZmPersonaListView.prototype._createItemHtml =
function(persona) {
	var	div = document.createElement("div");
	var base = "Row";
	div[DwtListView._STYLE_CLASS] = base;
	div[DwtListView._SELECTED_STYLE_CLASS] = [base, DwtCssStyle.SELECTED].join("-");	// Row-selected
	div.className = div[DwtListView._STYLE_CLASS];
	div.innerHTML = AjxStringUtil.htmlEncode(persona.name, true);

	this.associateItemWithElement(persona, div, DwtListView.TYPE_LIST_ITEM);

	return div;
};

/**
* @class
* @constructor
* A page inside of the personas preferences
*/
function ZmPersonaPage(parent, page, className, posStyle) {
	DwtTabViewPage.call(this, parent, className, posStyle);
	this._page = page;
	this._hasRendered = false;
};

ZmPersonaPage.prototype = new DwtTabViewPage;
ZmPersonaPage.prototype.constructor = ZmPersonaPage;

ZmPersonaPage.SENDING = 0;
ZmPersonaPage.REPLYING = 1;

ZmPersonaPage.toString =
function() {
	return "ZmPersonaPage";
};

ZmPersonaPage.prototype.showMe =
function() {
	if (!this._hasRendered) {
		switch (this._page) {
			case ZmPersonaPage.SENDING: this._initializeSending(); break;
			case ZmPersonaPage.REPLYING: this._initializeReplying(); break;
		}
		this._hasRendered = true;
	}
};

ZmPersonaPage.prototype.setPersona =
function(persona) {
	this._persona = persona;
	this._sendFromName.setValue(persona.sendFromDisplay);
	this._sendFromAddress.setValue(persona.sendFromAddress);

	var doc = document;
	var whenSentToCheckbox = doc.getElementById(this._whenSentToCheckboxId);
	whenSentToCheckbox.checked = persona.useWhenSentTo();
	this._whenSentToInput.setValue(persona.getWhenSentToAddresses().join("; "));

	var whenInFolderCheckbox = doc.getElementById(this._whenInFolderCheckboxId);
	whenInFolderCheckbox.checked = persona.useWhenInFolder();
	this._whenInFolderInput.setValue(persona.getWhenInFolderIds().join("; "));

	var setReplyToCheckbox = doc.getElementById(this._setReplyToCheckboxId);
	var useSignatureCheckbox = doc.getElementById(this._useSignatureCheckboxId);

	this._applyCheckbox(setReplyToCheckbox, [this._setReplyToName, this._setReplyToAddress]);
	this._applyCheckbox(useSignatureCheckbox, [this._useSignatureSelect]);
	this._applyCheckbox(whenSentToCheckbox, [this._whenSentToInput]);
	this._applyCheckbox(whenInFolderCheckbox, [this._whenInFolderInput]);
};

ZmPersonaPage.prototype.getPersona =
function(persona) {
};

ZmPersonaPage.prototype._initializeSending =
function() {
	var sendFromNameId = Dwt.getNextId();
	var sendFromAddressId = Dwt.getNextId();
	this._setReplyToCheckboxId = Dwt.getNextId();
	var setReplyToNameId = Dwt.getNextId();
	var setReplyToAddressId = Dwt.getNextId();
	this._useSignatureCheckboxId = Dwt.getNextId();
	var useSignatureNameId = Dwt.getNextId();
	this._whenSentToCheckboxId = Dwt.getNextId();
	var whenSentToInputId = Dwt.getNextId();
	this._whenInFolderCheckboxId = Dwt.getNextId();
	var whenInFolderInputId = Dwt.getNextId();

	var sendBCCToCheckboxId = Dwt.getNextId();
	var sendBCCToNameId = Dwt.getNextId();

	var html = [];
	var i = 0;
	html[i++] = "<fieldset class='ZmFieldset'><legend class='ZmLegend'>";
	html[i++] = ZmMsg.sendWithPersona;
	html[i++] = "</legend>";
	html[i++] = "<table width='100%'>";

	html[i++] = "<tr><td class='Label'>";
	html[i++] = ZmMsg.sendFrom;
	html[i++] = "</td><td id='";
	html[i++] = sendFromNameId;
	html[i++] = "'></td><td id='";
	html[i++] = sendFromAddressId;
	html[i++] = "'></td></tr>";

	html[i++] = "<tr><td><input type='checkbox' id='";
	html[i++] = this._setReplyToCheckboxId;
	html[i++] = "'>";
	html[i++] = ZmMsg.setReplyTo;
	html[i++] = "</td><td id='";
	html[i++] = setReplyToNameId;
	html[i++] = "'></td><td id='";
	html[i++] = setReplyToAddressId;
	html[i++] = "'></td></tr>";

	html[i++] = "<tr><td><input type='checkbox' id='"
	html[i++] = this._useSignatureCheckboxId;
	html[i++] = "'>";
	html[i++] = ZmMsg.useSignature;
	html[i++] = "</td><td colspan=2 id='";
	html[i++] = useSignatureNameId;
	html[i++] = "'></td>";
	html[i++] = "</tr>";

	html[i++] = "</table>";
	html[i++] = "</fieldset>";
	html[i++] = "<fieldset class='ZmFieldset'><legend class='ZmLegend'>";
	html[i++] = ZmMsg.selectPersonaWhen;
	html[i++] = "</legend>";
	html[i++] = "<table width='100%'>";

	html[i++] = "<tr><td style='text-align:right;'><input type='checkbox' id='";
	html[i++] = this._whenSentToCheckboxId;
	html[i++] = "'><td>";
	html[i++] = ZmMsg.whenSentTo;
	html[i++] = "<td></tr><tr><td>&nbsp;</td><td id='";
	html[i++] = whenSentToInputId;
	html[i++] = "'></td></tr><tr><td>&nbsp;</td><td class='Hint'>";
	html[i++] = ZmMsg.whenSentToHint;
	html[i++] = "</td></tr>";

	html[i++] = "<tr><td style='text-align:right;'><input type='checkbox' id='";
	html[i++] = this._whenInFolderCheckboxId;
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
	this._sendFromName = new DwtInputField(params);
	this._sendFromName.setRequired(true);
	this._sendFromName.reparentHtmlElement(sendFromNameId);
	this._sendFromAddress = new DwtInputField(params);
	this._sendFromAddress.setRequired(true);
	this._sendFromAddress.reparentHtmlElement(sendFromAddressId);

	this._setReplyToName = new DwtInputField(params);
	this._setReplyToName.reparentHtmlElement(setReplyToNameId);
	this._setReplyToAddress = new DwtInputField(params);
	this._setReplyToAddress.reparentHtmlElement(setReplyToAddressId);
	this._associateCheckbox(this._setReplyToCheckboxId, [this._setReplyToName, this._setReplyToAddress]);

	this._useSignatureSelect = new DwtSelect(this);
	this._useSignatureSelect.reparentHtmlElement(useSignatureNameId);
	this._useSignatureSelect.addOption(new DwtSelectOptionData("Personal", "Personal", true));
	this._useSignatureSelect.addOption(new DwtSelectOptionData("Professional", "Professional", true));
	this._useSignatureSelect.addOption(new DwtSelectOptionData("Random", "Random", false));
	this._associateCheckbox(this._useSignatureCheckboxId, [this._useSignatureSelect]);

	params.size = 50;
	this._whenSentToInput = new DwtInputField(params);
	this._whenSentToInput.reparentHtmlElement(whenSentToInputId);
	this._associateCheckbox(this._whenSentToCheckboxId, [this._whenSentToInput]);

	this._whenInFolderInput = new DwtInputField(params);
	this._whenInFolderInput.reparentHtmlElement(whenInFolderInputId);
	this._associateCheckbox(this._whenInFolderCheckboxId, [this._whenInFolderInput]);
};


ZmPersonaPage.prototype._associateCheckbox =
function(checkboxId, controls) {
	var checkbox = document.getElementById(checkboxId);
	this._applyCheckbox(checkbox, controls);
	var handler = AjxCallback.simpleClosure(this._checkboxHandler, this, controls);
	Dwt.setHandler(checkbox, DwtEvent.ONCLICK, handler);
};

ZmPersonaPage.prototype._applyCheckbox =
function(checkbox, controls) {
	var isChecked = checkbox.checked;
	for (var i = 0, count = controls.length; i < count; i++) {
		var control = controls[i];
		control.setEnabled(isChecked);
	}
};

ZmPersonaPage.prototype._checkboxHandler =
function(controls, event) {
	var checkbox = event.target;
	this._applyCheckbox(checkbox, controls);
};

ZmPersonaPage.prototype._initializeReplying =
function() {
	this.getHtmlElement().innerHTML = "" + this._page;
};

ZmPersonaPage.prototype._initializeSelection =
function() {
	this.getHtmlElement().innerHTML = "" + this._page;
};

