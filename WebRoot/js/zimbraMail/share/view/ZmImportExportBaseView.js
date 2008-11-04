/*
 * ***** BEGIN LICENSE BLOCK *****
 *
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2008 Zimbra, Inc.
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

ZmImportExportBaseView = function(params) {
	if (arguments.length == 0) return;
	DwtComposite.call(this, params);

	this.SETUP = {};
	this._registerControls();

	this._tabScope = {};
	this._tabGroup = new DwtTabGroup(this._htmlElId);
	this._dwtObjects = {};

	this._createHtml();
	this._createControls();
	this._initSubType(ZmImportExportController.TYPE_TGZ);
	this._updateControls();
};
ZmImportExportBaseView.prototype = new DwtComposite;
ZmImportExportBaseView.prototype.constructor = ZmImportExportBaseView;

ZmImportExportBaseView.prototype.toString = function() {
	return "ZmImportExportBaseView";
};

//
// Data
//

ZmImportExportBaseView.prototype._folderId = -1;

//
// Public methods
//

ZmImportExportBaseView.prototype.getFolderId = function() {
	return this._folderId;
};

ZmImportExportBaseView.prototype.setFormObject = function(id, object) {
	this._dwtObjects[id] = object;
};
ZmImportExportBaseView.prototype.getFormObject = function(id) {
	return this._dwtObjects[id];
};

ZmImportExportBaseView.prototype.setFormValue = function(id, value) {
	var object = this.getFormObject(id);
	if (!object) return;

	if (id == "FOLDER_BUTTON") {
		object.setText(value);
		return;
	}

	var setup = this.SETUP[id];
	if (setup) {
		switch (setup.displayContainer) {
			case ZmPref.TYPE_STATIC: {
				object.setText(value);
				return;
			}
			case ZmPref.TYPE_CHECKBOX: {
				object.setSelected(value);
				return;
			}
			case ZmPref.TYPE_INPUT: {
				object.setValue(value);
				return;
			}
			case ZmPref.TYPE_SELECT:
			case ZmPref.TYPE_RADIO_GROUP: {
				object.setSelectedValue(value);
				return;
			}
		}
	}
	if (typeof object.setValue == "function") {
		object.setValue(value);
		return;
	}
	if ("value" in object) {
		// NOTE: Some value properties are read-only (e.g. file inputs)
		try {
			object.value = value;
		}
		catch (e) {
			// ignore
		}
	}
};
ZmImportExportBaseView.prototype.getFormValue = function(id, defaultValue) {
	var object = this.getFormObject(id);
	if (!object) return defaultValue;

	var setup = this.SETUP[id];
	switch (setup && setup.displayContainer) {
		case ZmPref.TYPE_STATIC: return object.getText();
		case ZmPref.TYPE_CHECKBOX: return object.isSelected();
		case ZmPref.TYPE_SELECT:
		case ZmPref.TYPE_INPUT: return object.getValue();
		case ZmPref.TYPE_RADIO_GROUP: return object.getSelectedValue();
	}
	if (typeof object.getValue == "function") {
		return object.getValue();
	}
	if ("value" in object) {
		return object.value;
	}
	return defaultValue;
};

ZmImportExportBaseView.prototype.isRelevant = function(id) {
	var setup = this.SETUP[id];
	return this.getFormValue(setup && setup.rel, true);
};

//
// Protected methods
//

// html

ZmImportExportBaseView.prototype._createHtml = function(templateId) {
	this._createHtmlFromTemplate(templateId, {id:this._htmlElId});
};

ZmImportExportBaseView.prototype._createHtmlFromTemplate =
function(templateId, data) {
	DwtComposite.prototype._createHtmlFromTemplate.call(this, templateId || this.TEMPLATE, data);
};

// register

ZmImportExportBaseView.prototype._registerControls = function() {
	this._registerControl("TYPE", {
		displayContainer:	ZmPref.TYPE_RADIO_GROUP,
		orientation:        ZmPref.ORIENT_HORIZONTAL,
		displayOptions: 	[ZmMsg.importExportTypeTGZ],
		options: 			[ZmImportExportController.TYPE_TGZ]
	});
	if (appCtxt.get(ZmSetting.CALENDAR_ENABLED)) {
		this.SETUP["TYPE"].displayOptions.push(ZmMsg.importExportTypeICS);
		this.SETUP["TYPE"].options.push(ZmImportExportController.TYPE_ICS);
	}
	if (appCtxt.get(ZmSetting.CONTACTS_ENABLED)) {
		this.SETUP["TYPE"].displayOptions.push(ZmMsg.importExportTypeCSV);
		this.SETUP["TYPE"].options.push(ZmImportExportController.TYPE_CSV);
	}
	this._registerControl("TYPE_HINT", {
		displayContainer:	ZmPref.TYPE_STATIC
	});
	this._registerControl("SUBTYPE", {
		displayContainer:	ZmPref.TYPE_SELECT
	});
	this._registerControl("DATA_TYPES", {
		displayContainer:	ZmPref.TYPE_CUSTOM
	});
	this._registerControl("FOLDER", {
		displayContainer:	ZmPref.TYPE_RADIO_GROUP,
		orientation:        ZmPref.ORIENT_VERTICAL,
		displayOptions:		[ZmMsg.importExportFolderAll, ZmMsg.importExportFolderOne],
		options:			["all", "one"]
	});
	this._registerControl("FOLDER_BUTTON", {
		displayName:		ZmMsg.browse,
		displayContainer:	ZmPref.TYPE_CUSTOM
	});
	this._registerControl("ADVANCED", {
		displayName:		ZmMsg.advancedSettings,
		displayContainer:	ZmPref.TYPE_CHECKBOX
	});
};

ZmImportExportBaseView.prototype._registerControl = function(id, setup) {
	setup.id = id;
	this.SETUP[id] = setup;
};

// factory methods

ZmImportExportBaseView.prototype._createControls = function() {
	for (var id in this.SETUP) {
		var setup = this.SETUP[id];

		// no control if no container element
		var elem = document.getElementById([this._htmlElId, id].join("_"));
		if (!elem) { continue; }

		// construct control
		var value = null;
		var control;
		switch (setup.displayContainer) {
			case ZmPref.TYPE_STATIC: {
				control = this._setupStatic(id, setup, value);
				break;
			}
			case ZmPref.TYPE_CHECKBOX: {
				control = this._setupCheckbox(id, setup, value);
				break;
			}
			case ZmPref.TYPE_RADIO_GROUP: {
				control = this._setupRadioGroup(id, setup, value);
				break;
			}
			case ZmPref.TYPE_INPUT: {
				control = this._setupInput(id, setup, value);
				break;
			}
			case ZmPref.TYPE_SELECT: {
				control = this._setupSelect(id, setup, value);
				break;
			}
			case ZmPref.TYPE_CUSTOM: default: {
				control = this._setupCustom(id, setup, value);
				break;
			}
		}
		if (!control) continue;

		// replace it in the HTML
		this.SETUP[id].rel = elem.getAttribute("rel");
		this._replaceControlElement(elem, control);
	}

	// create tab group
	var tabScope = this._getCurrentTabScope();
	var indexes = AjxUtil.keys(tabScope);
	indexes.sort(AjxUtil.byNumber);
	for (var i = 0; i < indexes.length; i++) {
		var control = tabScope[indexes[i]];
		if (control instanceof Array) {
			for (var j = 0; j < control.length; j++) {
				this._tabGroup.addMember(
					control[i] instanceof DwtControl ? control[i].getTabGroupMember() : control[i]
				);
			}
			continue;
		}
		this._tabGroup.addMember(
			control instanceof DwtControl ? control.getTabGroupMember() : control
		);
	}
};

ZmImportExportBaseView.prototype._setupStatic = function(id, setup, value) {
	var text = new DwtText(this);
	this.setFormObject(id, text);
	return text;
};

ZmImportExportBaseView.prototype._setupCheckbox = function(id, setup, value) {
	var checkbox = new DwtCheckbox({parent:this, checked:value});
	checkbox.setText(setup.displayName || "");
	this.setFormObject(id, checkbox);
	if (id == "ADVANCED") {
		checkbox.addSelectionListener(new AjxListener(this, this._handleToggleAdvanced));
	}
	return checkbox;
};

ZmImportExportBaseView.prototype._setupRadioGroup = function(id, setup, value) {
	var group = new ZmImportExportRadioGroup({parent:this,setup:setup});
	this.setFormObject(id, group);
	if (id == "FOLDER") {
		group.addSelectionListener(new AjxListener(this, this._handleFolder));
	}
	return group;
};

ZmImportExportBaseView.__radioGroup_getTabGroupMember =
function(radios) {
	var tg = new DwtTabGroup(this.getHtmlElement().id);
	if (radios) {
		for (var id in radios) {
			tg.addMember(radios[id]);
		}
	}
	return tg;
};

ZmImportExportBaseView.prototype._setupInput = function(id, setup, value) {
	var params = { parent: this };
	var el = document.getElementById([this._htmlElId,id].join("_"));
	if (el) {
		params.size = el.getAttribute("size");
		params.hint = el.getAttribute("hint");
	}
	var input = new DwtInputField(params);
	input.setHint(params.hint);
	this.setFormObject(id, input);
	return input;
};

ZmImportExportBaseView.prototype._setupSelect = function(id, setup, value) {
	var select = new DwtSelect({parent:this});
	var options = setup.options;
	var displayOptions = setup.displayOptions || options;
	if (options) {
		for (var i = 0; i < options.length; i++) {
			select.addOption(displayOptions[i], i == 0, options[i]);
		}
	}
	this.setFormObject(id, select);
	return select;
};

ZmImportExportBaseView.prototype._setupCustom = function(id, setup, value) {
	if (id == "DATA_TYPES") {
		var control = new ZmImportExportDataTypes({parent:this});
		this.setFormObject(id, control);
		return control;
	}
	if (id == "FOLDER_BUTTON") {
		var control = new DwtButton({parent:this});
		control.setText(setup.displayName || "");
		control.addSelectionListener(new AjxListener(this, this._handleFolderButton));
		this.setFormObject(id, control);
		return control;
	}
	return null;
};

// other

ZmImportExportBaseView.prototype._updateControls = function() {
	// show/hide relevent controls
	for (var id in this.SETUP) {
		var control = this.getFormObject(id);
		if (!control) continue;

		var setup = this.SETUP[id];
		if (setup.rel) {
			var relControl = this.getFormObject(setup.rel);
			if (relControl) {
				var relValue = this.getFormValue(setup.rel);
				relValue = relValue != null ? Boolean(relValue) : true;
				control.setEnabled(relValue);

				var relRowEl = document.getElementById([this._htmlElId, id, "row"].join("_"));
				if (relRowEl) {
					Dwt.setVisible(relRowEl, relValue);
				}
			}
		}
	}

	// update type hint
	var type = this.getFormValue("TYPE", ZmImportExportController.TYPE_TGZ);
	this.setFormValue("TYPE_HINT", this.TYPE_HINTS[type]);

	// disable ignore archive if not a zimbra account
	var ignore = this.getFormObject("IGNORE_ARCHIVE");
	if (ignore) {
		// NOTE: We can't just do this check in the template because
		//       it's only expanded once and the user may have multiple
		//       accounts.
		ignore.setEnabled(appCtxt.getById(ZmOrganizer.ID_ARCHIVE) != null);
	}
};

ZmImportExportBaseView.prototype._replaceControlElement =
function(elem, control) {
	if (!control) return;
	this._addControlTabIndex(elem, control);
	if (control instanceof DwtControl) {
		control.replaceElement(elem);
	}
	else {
		control.parentNode.replaceChild(elem, control);
	}
};

ZmImportExportBaseView.prototype._getCurrentTabScope = function() {
	return this._tabScope;
};

ZmImportExportBaseView.prototype._addControlTabIndex =
function(elemOrId, control) {
	// remember control's tab index
	var elem = Dwt.byId(elemOrId);
	var tabIndex = elem && elem.getAttribute("tabindex");
	tabIndex = tabIndex != null ? tabIndex : Number.MAX_VALUE;

	var controls = this._getCurrentTabScope();
	if (!controls[tabIndex]) {
		controls[tabIndex] = control;
		return;
	}
	var entry = controls[tabIndex];
	if (!(entry instanceof Array)) {
		controls[tabIndex] = [entry, control];
		return;
	}
	entry.push(control);
};

// initializers

ZmImportExportBaseView.prototype._initSubType = function(type) {
	var select = this.getFormObject("SUBTYPE");
	if (!select) return;

	var options = this._getSubTypeOptions(type);
	if (!options || options.length == 0) return;

	select.clearOptions();
	for (var i = 0; i < options.length; i++) {
		select.addOption(options[i]);
	}
	select.setSelectedValue(options[0].value);
};

ZmImportExportBaseView.prototype._getSubTypeOptions = function(type) {
	if (!ZmImportExportBaseView.prototype.TGZ_OPTIONS) {
		ZmImportExportBaseView.prototype.TGZ_OPTIONS = [
			{ displayValue: ZmMsg["zimbra-tgz"],			value: "zimbra-tgz" }
		];
		ZmImportExportBaseView.prototype.CSV_OPTIONS = [];
		var setup = this.SETUP["SUBTYPE"];
		var options = setup.options;
		for (var i = 0; i < options.length; i++) {
			ZmImportExportBaseView.prototype.CSV_OPTIONS.push(
				{ displayValue: ZmMsg[options[i]] || options[i], value: setup.displayOptions[i] }
			);
		}
		ZmImportExportBaseView.prototype.ICS_OPTIONS = [
			{ displayValue: ZmMsg["zimbra-ics"],			value: "zimbra-ics" }
		];
	}
	var options;
	switch (type) {
		case ZmImportExportController.TYPE_TGZ: {
			options = this.TGZ_OPTIONS;
			break;
		}
		case ZmImportExportController.TYPE_CSV: {
			options = this.CSV_OPTIONS;
			break;
		}
		case ZmImportExportController.TYPE_ICS: {
			options = this.ICS_OPTIONS;
			break;
		}
	}
	return options;
};

ZmImportExportBaseView.prototype._createHtml = function(templateId) {
	this._createHtmlFromTemplate(templateId || this.TEMPLATE, { id: this._htmlElId });
};

// handlers

ZmImportExportBaseView.prototype._handleFolder = function() {
	if (this.getFormValue("FOLDER", "all") == "all") {
//		this._folderId = -1;
	}
};

ZmImportExportBaseView.prototype._handleFolderButton = function() {
	this.setFormValue("FOLDER", "one");

	if (!this._handleFolderDialogOkCallback) {
		this._handleFolderDialogOkCallback = new AjxCallback(this, this._handleFolderDialogOk);
	}

	var dialog = appCtxt.getChooseFolderDialog();
	dialog.registerCallback(DwtDialog.OK_BUTTON, this._handleFolderDialogOkCallback);
	var params = {
		treeIds:		AjxUtil.keys(ZmOrganizer.VIEWS),
		skipReadOnly:	true,
		omit:			{}
	};
	params.omit[ZmOrganizer.ID_TRASH] = true;
	params.hideNewButton = this instanceof ZmExportView;
	dialog.popup(params);
};

ZmImportExportBaseView.prototype._handleFolderDialogOk = function(folder) {
	appCtxt.getChooseFolderDialog().popdown();
	// NOTE: Selecting a header is the same as "all folders"
	if (folder.id == ZmOrganizer.ID_ROOT) {
		this.setFormValue("FOLDER", "all");
		return false;
	}
	this._folderId = folder.id;
	this.setFormValue("FOLDER_BUTTON", folder.name);
	return true;
};

ZmImportExportBaseView.prototype._handleToggleAdvanced = function() {
	this._updateControls();
};

//
// DwtControl methods
//

ZmImportExportBaseView.prototype.getTabGroupMember = function() {
	return this._tabGroup;
};

//
// Class
//

ZmImportExportDataTypes = function(params) {
	if (arguments.length == 0) return;
	DwtComposite.apply(this, arguments);
	this._tabGroup = new DwtTabGroup(this._htmlElId);
	this._createHtml();
};
ZmImportExportDataTypes.prototype = new DwtComposite;
ZmImportExportDataTypes.prototype.constructor = ZmImportExportDataTypes;

ZmImportExportDataTypes.prototype.toString = function() {
	return "ZmImportExportDataTypes";
};

// Data

ZmImportExportDataTypes.prototype.TEMPLATE = "data.ImportExport#DataTypes";

// Public methods

ZmImportExportDataTypes.prototype.getTabGroupMember = function() {
	return this._tabGroup;
};

ZmImportExportDataTypes.prototype.setValue = function(value) {
	// NOTE: Special case "" as *all* types -- this will include things
	//       like conversations, etc, that are implicitly added if no
	//       data types are specified for import/export.
	if (value == "") {
		var children = this.getChildren();
		for (var i = 0; i < children.length; i++) {
			var checkbox = children[i];
			checkbox.setSelected(true);
		}
		return;
	}

	// return only those types that are checked
	var types = value ? value.split(",") : [];
	var type = {};
	for (var i = 0; i < types.length; i++) {
		type[types[i]] = true;
	}
	var children = this.getChildren();
	for (var i = 0; i < children.length; i++) {
		var checkbox = children[i];
		var selected = true;
		var types = checkbox.getValue().split(",");
		for (var j = 0; j < types.length; j++) {
			if (!type[types[j]]) {
				selected = false;
				break;
			}
		}
		checkbox.setSelected(selected);
	}
};

ZmImportExportDataTypes.prototype.getValue = function() {
	// NOTE: Special case "" as *all* types. 
	if (this.isAllSelected()) {
		return "";
	}

	var types = [];
	var children = this.getChildren();
	for (var i = 0; i < children.length; i++) {
		var checkbox = children[i];
		if (checkbox.isSelected()) {
			types.push(checkbox.getValue());
		}
	}
	return types.join(",");
};

ZmImportExportDataTypes.prototype.isAllSelected = function() {
	var children = this.getChildren();
	for (var i = 0; i < children.length; i++) {
		var checkbox = children[i];
		if (!checkbox.isSelected()) {
			return false;
		}
	}
	return true;
};

ZmImportExportDataTypes.prototype.setEnabled = function(enabled) {
	DwtComposite.prototype.setEnabled.apply(this, arguments);
	var children = this.getChildren();
	for (var i = 0; i < children.length; i++) {
		var checkbox = children[i];
		checkbox.setEnabled(enabled);
	}
};

// Protected methods

ZmImportExportDataTypes.prototype._createHtml = function(templateId) {
	this._createHtmlFromTemplate(templateId || this.TEMPLATE, {id:this._htmlElId});
};

ZmImportExportDataTypes.prototype._createHtmlFromTemplate =
function(templateId, data) {
	// get number of checkboxes
	data.count = 0;
	for (var appName in ZmApp.ORGANIZER) {
		var orgType = ZmApp.ORGANIZER[appName];
		var views = ZmOrganizer.VIEWS[orgType];
		if (!views || views.length == 0) continue;
		data.count++;
	}

	// create cells
	DwtComposite.prototype._createHtmlFromTemplate.call(this, templateId, data);

	// create checkboxes and place in cells
	var i = 0;
	for (var appName in ZmApp.ORGANIZER) {
		var orgType = ZmApp.ORGANIZER[appName];
		var views = ZmOrganizer.VIEWS[orgType];
		if (!views || views.length == 0) continue;

		var checkbox = new ZmImportExportDataTypeCheckbox({parent:this,checked:true});
		checkbox.setImage(ZmApp.ICON[appName]);
		checkbox.setText(ZmMsg[ZmApp.NAME[appName]] || appName);
		// NOTE: I know it's the default join string but I prefer
		//       explicit behavior.
		checkbox.setValue(views.join(","));
		checkbox.replaceElement(data.id+"_cell_"+i);

		this._tabGroup.addMember(checkbox);

		i++;
	}
};

//
// Class
//

ZmImportExportDataTypeCheckbox = function(params) {
	if (arguments.length == 0) return;
	DwtCheckbox.apply(this, arguments);
};
ZmImportExportDataTypeCheckbox.prototype = new DwtCheckbox;
ZmImportExportDataTypeCheckbox.prototype.constructor = ZmImportExportDataTypeCheckbox;

// Data

ZmImportExportDataTypeCheckbox.prototype.TEMPLATE = "data.ImportExport#DataTypeCheckbox";

// Public methods

ZmImportExportDataTypeCheckbox.prototype.setTextPosition = function(position) {
	DwtCheckbox.prototype.setTextPosition.call(this, DwtCheckbox.TEXT_RIGHT);
};

ZmImportExportDataTypeCheckbox.prototype.setImage = function(imageName) {
	if (this._imageEl) {
		this._imageEl.className = AjxImg.getClassForImage(imageName);
	}
};

// Protected methods

ZmImportExportDataTypeCheckbox.prototype._createHtmlFromTemplate =
function(templateId, data) {
	DwtCheckbox.prototype._createHtmlFromTemplate.apply(this, arguments);
	this._imageEl = document.getElementById(data.id+"_image");
};

//
// Class
//

ZmImportExportRadioGroup = function(params) {
	if (arguments.length == 0) return;
	DwtComposite.apply(this, arguments);
	params = Dwt.getParams(arguments, ZmImportExportRadioGroup.PARAMS);

	this._tabGroup = new DwtTabGroup(this._htmlElId);
	this._radios = {};

	var htmlEl = this.getHtmlElement();
	var setup = params.setup;
	var options = setup.options || [];
	var displayOptions = setup.displayOptions || options;
	var selectedId;
	var name = [this._htmlElId, "radio"].join("_");
	for (var i = 0; i < options.length; i++) {
		var radio = new DwtRadioButton({parent:this,name:name,checked:i==0});
		radio.setValue(options[i]);
		radio.setText(displayOptions[i]);
		var inputId = radio.getInputElement().id;
		this._radios[inputId] = radio;
		this._tabGroup.addMember(radio);
		selectedId = selectedId || inputId;
	}

	if (setup.orientation == ZmPref.ORIENT_HORIZONTAL) {
		var table = document.createElement("TABLE");
		table.className = "ZmRadioButtonGroupHoriz";
		table.border = 0;
		table.cellPadding = 0;
		table.cellSpacing = 0;
		htmlEl.appendChild(table);

		var row = table.insertRow(-1);
		for (var inputId in this._radios) {
			var cell = row.insertCell(-1);
			cell.className = "ZmRadioButtonGroupCell";
			this._radios[inputId].appendElement(cell);
		}
	}

	this._group = new DwtRadioButtonGroup(this._radios, selectedId);
};
ZmImportExportRadioGroup.prototype = new DwtComposite;
ZmImportExportRadioGroup.prototype.constructor = ZmImportExportRadioGroup;

ZmImportExportRadioGroup.prototype.toString = function() {
	return "ZmImportExportRadioGroup";
};

// Constants

ZmImportExportRadioGroup.PARAMS = DwtComposite.PARAMS.concat("setup");

// Public methods

ZmImportExportRadioGroup.prototype.getTabGroupMember = function() {
	return this._tabGroup;
};

ZmImportExportRadioGroup.prototype.addSelectionListener = function(listener) {
	this._group.addSelectionListener(listener);
};

ZmImportExportRadioGroup.prototype.setSelectedValue = function(value) {
	this._group.setSelectedValue(value);
};

ZmImportExportRadioGroup.prototype.getSelectedValue = function() {
	return this._group.getSelectedValue();
};

ZmImportExportRadioGroup.prototype.setEnabled = function(enabled) {
	DwtComposite.prototype.setEnabled.apply(this, arguments);
	for (var id in this._radios) {
		this._radios[id].setEnabled(enabled);
	}
};