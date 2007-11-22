/*
 * ***** BEGIN LICENSE BLOCK *****
 * 
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2005, 2006, 2007 Zimbra, Inc.
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

/**
 * Creates an empty preferences page of the given type.
 * @constructor
 * @class
 * This class represents a single page of preferences available by selecting one of the
 * preference tabs. During construction, skeletal HTML is created. The preferences
 * aren't added until the page becomes visible.
 *
 * @author Conrad Damon
 * 
 * @param parent			[DwtControl]				the containing widget
 * @param section			[object]					which page we are
 * @param controller		[ZmPrefController]			prefs controller
 */
ZmPreferencesPage = function(parent, section, controller) {
	if (arguments.length == 0) return;
	DwtTabViewPage.call(this, parent, "ZmPreferencesPage");
	
	this._section = section;
	this._controller = controller;
	this._title = [ZmMsg.zimbraTitle, controller.getApp().getDisplayName(), section.title].join(": ");

	this._dwtObjects = {};
	this._tabGroup = new DwtTabGroup(section.id);
	this._rendered = false;

    // Map of ids to locales.
    this._localeMap = null;

    // Map whose keys are language ids, and whose values are objects with name and array of locale.
    this._languageMap = null;
};

ZmPreferencesPage.prototype = new DwtTabViewPage;
ZmPreferencesPage.prototype.constructor = ZmPreferencesPage;

ZmPreferencesPage.prototype.toString =
function () {
    return "ZmPreferencesPage";
};

//
// Constants
//

ZmPreferencesPage.IMPORT_FIELD_NAME = "importUpload";
ZmPreferencesPage.IMPORT_TIMEOUT = 300;

//
// Public methods
//

ZmPreferencesPage.prototype.hasRendered =
function(account) {
	var acct = account || appCtxt.getActiveAccount();
	return (this._hasRendered == acct.name);
};

ZmPreferencesPage.prototype._replaceControlElement = function(elemOrId, control) {
	this._addControlTabIndex(elemOrId, control);
	control.replaceElement(elemOrId);
};

ZmPreferencesPage.prototype._enterTabScope = function() {
	if (!this._tabScopeStack) {
		this._tabScopeStack = [];
	}
	var scope = {};
	this._tabScopeStack.push(scope);
	return scope;
};

ZmPreferencesPage.prototype._getCurrentTabScope = function() {
	var stack = this._tabScopeStack;
	return stack && stack[stack.length - 1];
};

ZmPreferencesPage.prototype._exitTabScope = function() {
	var stack = this._tabScopeStack;
	return stack && stack.pop();
};

ZmPreferencesPage.prototype._addControlTabIndex = function(elemOrId, control) {
	// remember control's tab index
	var elem = Dwt.byId(elemOrId);
	var tabIndex = elem.getAttribute("tabindex");
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

ZmPreferencesPage.prototype._addTabLinks = function(elemOrId) {
	var elem = Dwt.byId(elemOrId);
	if (!elem) return;

	var links = elem.getElementsByTagName("A");
	for (var i = 0; i < links.length; i++) {
		var link = links[i];
		if (!link.href) continue;
		this._addControlTabIndex(link, link);
	}
};

/**
* Fills the page with preferences that belong to this page, if that hasn't been done
* already. Note that this is an override of DwtTabViewPage.showMe(), so that it's
* called only when the tab is selected and the page becomes visible.
*/
ZmPreferencesPage.prototype.showMe =
function() {
	Dwt.setTitle(this._title);
	this._controller._resetOperations(this._controller._toolbar, this._section.id);
	var dirty = this._controller.isDirty(this._section.id);
	var activeAcct = appCtxt.getActiveAccount().name;
	if (this._hasRendered == activeAcct && !dirty) { return; }

	if (this._hasRendered == activeAcct) {
		this._controller.setDirty(this._section.id, false);
		return;
	}

	this._createPageTemplate();
	this._createControls();
}

ZmPreferencesPage.prototype._createPageTemplate = function() {
	// expand template
	DBG.println(AjxDebug.DBG2, "rendering preferences page " + this._section.id);
	var templateId = this._section.templateId;
	var data = {
		id: this._htmlElId,
		isMultiAccount: (appCtxt.numAccounts > 1)
	};
	data.isEnabled = AjxCallback.simpleClosure(this._isEnabled, this, data);
	data.expandField = AjxCallback.simpleClosure(this._expandField, this, data);
	this._createPageHtml(templateId, data);
	this.setVisible(false); // hide until ready
};

ZmPreferencesPage.prototype._createControls = function() {
	// create controls for prefs, if present in template
	this._prefPresent = {};
	this._enterTabScope();
	try {
		// add links to tab control list
		this._addTabLinks(this.getHtmlElement());

		// add preference controls
		var prefs = this._section.prefs || [];
		var settings = appCtxt.getSettings();
		for (var i = 0; i < prefs.length; i++) {
			var id = prefs[i];
			if (!id) { continue; }
			var pref = settings.getSetting(id);

			// ignore if there is no container element
			var elem = document.getElementById([this._htmlElId, id].join("_"));
			if (!elem) { continue; }

			// ignore if doesn't meet pre-condition
			var setup = ZmPref.SETUP[id];
			if (!this._controller.checkPreCondition(setup)) { continue; }

			// perform load function
			if (setup.loadFunction) {
				setup.loadFunction(setup);
				if (setup.options.length <= 1) { continue; }
			}

			// save the current value (for checking later if it changed)
			pref.origValue = this._getPrefValue(id);
			var value = this._getPrefValue(id, false);

			// we only show this one if it's false
			if ((id == ZmSetting.GAL_AUTOCOMPLETE_SESSION) && value) { continue; }

			this._prefPresent[id] = true;
			DBG.println(AjxDebug.DBG3, "adding pref " + pref.name + " / " + value);

			// create form controls
			var control = null;
			var type = setup ? setup.displayContainer : null;
			if (type == ZmPref.TYPE_CUSTOM) {
				control = this._setupCustom(id, setup, value);
			}
			else if (type == ZmPref.TYPE_SELECT) {
				control = this._setupSelect(id, setup, value);
			}
			else if (type == ZmPref.TYPE_COMBOBOX) {
				control = this._setupComboBox(id, setup, value);
			}
			else if (type == ZmPref.TYPE_RADIO_GROUP) {
				control = this._setupRadioGroup(id, setup, value);
			}
			else if (type == ZmPref.TYPE_CHECKBOX) {
				control = this._setupCheckbox(id, setup, value);
			}
			else if (type == ZmPref.TYPE_INPUT || type == ZmPref.TYPE_TEXTAREA) {
				if (type == ZmPref.TYPE_TEXTAREA) {
					setup.rows = elem.getAttribute("rows") || setup.rows || 4;
					setup.cols = elem.getAttribute("cols") || setup.cols || 60;
					setup.wrap = elem.getAttribute("wrap") || setup.wrap || "on";
				}
				control = this._setupInput(id, setup, value);
			}
			else if (type == ZmPref.TYPE_COLOR) {
				control = this._setupColor(id, setup, value);
			}
			else if (type == ZmPref.TYPE_LOCALES) {
				control = this._setupLocales(id, setup, value);
			}
			else if (type == ZmPref.TYPE_PASSWORD) {
				this._addButton(elem, setup.displayName, 50, new AjxListener(this, this._changePasswordListener));
				continue;
			}
			else if (type == ZmPref.TYPE_IMPORT) {
				this._addImportWidgets(elem, id, setup);
				continue;
			}
			else if (type == ZmPref.TYPE_EXPORT) {
				this._addExportWidgets(elem, id, setup);
				continue;
			}

			// add control to form
			if (control) {
				this._replaceControlElement(elem, control);
			}
		}

		// create special page buttons
		var defaultsRestore = document.getElementById([this._htmlElId,"DEFAULTS_RESTORE"].join("_"));
		if (defaultsRestore) {
			this._addButton(defaultsRestore, ZmMsg.restoreDefaults, 110, new AjxListener(this, this._resetListener));
		}

		var revertPage = document.getElementById([this._htmlElId,"REVERT_PAGE"].join("_"));
		if (revertPage) {
			this._addButton(revertPage, ZmMsg.restorePage, 110, new AjxListener(this, this._resetPageListener));
		}

		// create tab-group for all controls on the page
		this._addControlsToTabGroup(this._tabGroup);
	}
	finally {
		this._exitTabScope();
	}

	// finish setup
	this.setVisible(true);
	this._hasRendered = appCtxt.getActiveAccount().name;
};

ZmPreferencesPage.prototype._addControlsToTabGroup = function(tabGroup) {
	var scope = this._getCurrentTabScope();
	var keys = AjxUtil.keys(scope).sort(AjxUtil.byNumber);
	for (var i = 0; i < keys.length; i++) {
		var entry = scope[keys[i]];
		var controls = entry instanceof Array ? entry : [entry];
		for (var j = 0; j < controls.length; j++) {
			var control = controls[j];
			var member = (control.getTabGroupMember && control.getTabGroupMember()) || control;
			tabGroup.addMember(member);
		}
	}
};

ZmPreferencesPage.prototype.setFormObject =
function(id, object) {
	this._dwtObjects[id] = object;
};

ZmPreferencesPage.prototype.getFormObject =
function(id) {
	return this._dwtObjects[id]; 
};

/**
 * Returns the value of the preference control.
 *
 * @param id		[string]		The preference identifier.
 * @param setup		[object]		(Optional) The preference descriptor.
 * @param control	[DwtControl|*]	(Optional) The preference control.
 */
ZmPreferencesPage.prototype.getFormValue =
function(id, setup, control) {
	setup = setup || ZmPref.SETUP[id];
	var value = null;
	var type = setup ? setup.displayContainer : null;
	if (type == ZmPref.TYPE_SELECT || type == ZmPref.TYPE_COMBOBOX ||
		type == ZmPref.TYPE_CHECKBOX ||
		type == ZmPref.TYPE_RADIO_GROUP || type == ZmPref.TYPE_COLOR ||
		type == ZmPref.TYPE_INPUT || type == ZmPref.TYPE_LOCALES) {
		var object = control || this.getFormObject(id);
		if (object) {
			if (type == ZmPref.TYPE_COLOR) {
				value = object.getColor();
			}
			else if (type == ZmPref.TYPE_CHECKBOX) {
				value = object.isSelected();
				if (setup.options) {
					value = setup.options[Number(value)];
				}
			}
			else if (type == ZmPref.TYPE_RADIO_GROUP) {
				value = object.getSelectedValue();
			}
			else if (type == ZmPref.TYPE_LOCALES) {
				value = object._localeId;
			}
			else if (type == ZmPref.TYPE_COMBOBOX) {
				value = object.getValue() || object.getText();
			}
			else {
				value = object.getValue();
			}
		}
	}
	else {
		var prefId = [this._htmlElId, id].join("_");
		var element = document.getElementById(prefId);
		if (!element) return null;
		value = element.value;
	}
	return setup && setup.valueFunction ? setup.valueFunction(value) : value;
};

/**
 * Returns the value of the preference control.
 *
 * @param id		[string]		The preference identifier.
 * @param value		[ANY]			The preference value.
 * @param setup		[object]		(Optional) The preference descriptor.
 * @param control	[DwtControl|*]	(Optional) The preference control.
 */
ZmPreferencesPage.prototype.setFormValue =
function(id, value, setup, control) {
	setup = setup || ZmPref.SETUP[id];
	if (setup && setup.displayFunction) {
		value = setup.displayFunction(value);
	}
	if (setup && setup.approximateFunction) {
		value = setup.approximateFunction(value);
	}
	var type = setup ? setup.displayContainer : null;
	if (type == ZmPref.TYPE_SELECT || type == ZmPref.TYPE_COMBOBOX ||
		type == ZmPref.TYPE_CHECKBOX ||
		type == ZmPref.TYPE_RADIO_GROUP ||
		type == ZmPref.TYPE_COLOR) {
		var object = control || this.getFormObject(id);
		if (!object) { return; }

		if (type == ZmPref.TYPE_COLOR) {
			object.setColor(value);
		} else if (type == ZmPref.TYPE_CHECKBOX) {
			object.setSelected(value);
		} else if (type == ZmPref.TYPE_RADIO_GROUP) {
			object.setSelectedValue(value);
		} else if (type == ZmPref.TYPE_COMBOBOX) {
			object.setValue(value);
		} else {
			var curValue = object.getValue();
			if (value != null && (curValue != value)) {
				object.setSelectedValue(value);
			}
		}
	} else if (type == ZmPref.TYPE_INPUT) {
		var object = control || this.getFormObject(id);
		if (!object) { return; }

		var curValue = object.getValue();
		if (value != null && (curValue != value)) {
			object.setValue(value);
		}
	} else if (type == ZmPref.TYPE_LOCALES) {
		if (this._localeMap) {
			var button = this._dwtObjects[ZmSetting.LOCALE_NAME];
			this._showLocale(value, button);
		}
	} else {
		var prefId = [this._htmlElId, id].join("_");
		var element = control || document.getElementById(prefId);
		if (!element || element.value == value) { return; }

		element.value = value || "";
	}
};

ZmPreferencesPage.prototype.getTitle =
function() {
	return this._title;
};

ZmPreferencesPage.prototype.getTabGroupMember = function() {
	return this._tabGroup;
};

/**
* Resets the form fields to the prefs' current values.
*
* @param useDefaults	[boolean]	if true, fields are reset to prefs' default values
*/
ZmPreferencesPage.prototype.reset =
function(useDefaults) {
	var settings = appCtxt.getSettings();
	var prefs = this._section.prefs || [];
	for (var i = 0; i < prefs.length; i++) {
		var id = prefs[i];
		if (!id) { continue; }
		var setup = ZmPref.SETUP[id];
		if (!setup) { continue; }
		var type = setup.displayContainer;
		if (type == ZmPref.TYPE_PASSWORD) { continue; } // ignore non-form elements
		var pref = settings.getSetting(id);
		var newValue = this._getPrefValue(id, useDefaults);
		this.setFormValue(id, newValue);
	}
};

//
// Protected methods
//

ZmPreferencesPage.prototype._createPageHtml =
function(templateId, data) {
	this.getContentHtmlElement().innerHTML = AjxTemplate.expand(templateId, data);
};

/*
* Returns the value of the specified pref, massaging it if necessary.
*
* @param id			[constant]		pref ID
* @param useDefault	[boolean]		if true, use pref's default value
*/
ZmPreferencesPage.prototype._getPrefValue =
function(id, useDefault) {
	var pref = appCtxt.getSettings().getSetting(id);
	return useDefault ? pref.getDefaultValue() : pref.getValue();
};

// Add a button to the preferences page
ZmPreferencesPage.prototype._addButton =
function(parentIdOrElem, text, width, listener) {
	var button = new DwtButton(this);
	button.setSize(width, Dwt.DEFAULT);
	button.setText(text);
	button.addSelectionListener(listener);
	this._replaceControlElement(parentIdOrElem, button);
	return button;
};

ZmPreferencesPage.prototype._prepareValue = function(id, setup, value) {
	if (setup.displayFunction) {
		value = setup.displayFunction(value);
	}
	if (setup.approximateFunction) {
		value = setup.approximateFunction(value);
	}
	return value;
};

ZmPreferencesPage.prototype._setupStatic =
function(id, setup, value) {
	var text = new DwtText(this);
	this.setFormObject(id, text);
	text.setText(value);
	return text;
};

ZmPreferencesPage.prototype._setupSelect =
function(id, setup, value) {
	value = this._prepareValue(id, setup, value);

	var selObj = new DwtSelect(this);
	this.setFormObject(id, selObj);

	var options = setup.options || setup.displayOptions || setup.choices || [];
	var isChoices = Boolean(setup.choices);
	for (var j = 0; j < options.length; j++) {
		var optValue = isChoices ? options[j].value : options[j];
		var optLabel = isChoices ? options[j].label : setup.displayOptions[j];
		optLabel = ZmPreferencesPage.__formatLabel(optLabel, optValue);
		var optImage = setup.images ? setup.images[j] : null;
		var data = new DwtSelectOptionData(optValue, optLabel, false, null, optImage);
		selObj.addOption(data);
	}

	selObj.setName(id);
	selObj.setSelectedValue(value);

	return selObj;
};

ZmPreferencesPage.prototype._setupComboBox = function(id, setup, value) {
	value = this._prepareValue(id, setup, value);

	var cboxObj = new DwtComboBox(this);
	this.setFormObject(id, cboxObj);

	var options = setup.options || setup.displayOptions || setup.choices || [];
	var isChoices = Boolean(setup.choices);
	for (var j = 0; j < options.length; j++) {
		var optValue = isChoices ? options[j].value : options[j];
		var optLabel = isChoices ? options[j].label : setup.displayOptions[j];
		optLabel = ZmPreferencesPage.__formatLabel(optLabel, optValue);
		cboxObj.add(optLabel, optValue, optValue == value);
	}

	cboxObj.setValue(value);

	return cboxObj;
};

ZmPreferencesPage.prototype._setupRadioGroup =
function(id, setup, value) {
	value = this._prepareValue(id, setup, value);

	// TODO: Make DwtRadioButtonGroup an instance of DwtComposite
	var container = new DwtComposite(this);

	// build horizontally-oriented radio group, if needed
	var orient = setup.orientation || ZmPref.ORIENT_VERTICAL;
	var isHoriz = orient == ZmPref.ORIENT_HORIZONTAL;
	if (isHoriz) {
		var table, row, cell;

		table = document.createElement("TABLE");
		table.className = "ZmRadioButtonGroupHoriz";
		table.border = 0;
		table.cellPadding = 0;
		table.cellSpacing = 0;
		container.getHtmlElement().appendChild(table);

		row = table.insertRow(-1);
	}

	// add options
	var options = setup.options || setup.displayOptions || setup.choices;
	var isChoices = setup.choices;
	var isDisplayString = AjxUtil.isString(setup.displayOptions);

	var radioIds = {};
	var selectedId;
	for (var i = 0; i < options.length; i++) {
		var optValue = isChoices ? options[i].value : options[i];
		var optLabel = isChoices ? options[i].label : (isDisplayString ? setup.displayOptions : setup.displayOptions[i]);
		optLabel = ZmPreferencesPage.__formatLabel(optLabel, optValue);
		var isSelected = value == optValue; 

		var radioBtn = new DwtRadioButton(container, null, id, isSelected);
		radioBtn.setText(optLabel);
		radioBtn.setValue(optValue);

		var radioId = radioBtn.getInputElement().id;
		radioIds[radioId] = radioBtn;
		if (isSelected) {
			radioBtn.setSelected(true);
            selectedId = radioId;
		}

		if (setup.validationFunction) {
			var valueToCheck = setup.valueFunction ? setup.valueFunction(optValue) : optValue;
			if (!setup.validationFunction(valueToCheck)) {
				radioBtn.setEnabled(false);
			}
		}

		if (isHoriz) {
			cell = row.insertCell(-1);
			cell.className = "ZmRadioButtonGroupCell";
			radioBtn.appendElement(cell);
		}
	}

	// store radio button group
	this.setFormObject(id, new DwtRadioButtonGroup(radioIds, selectedId));

	var func = ZmPreferencesPage.__radioGroup_getTabGroupMember; 
	container.getTabGroupMember = AjxCallback.simpleClosure(func, container, radioIds);
	return container;
};

ZmPreferencesPage.__radioGroup_getTabGroupMember = function(radioIds) {
	var tg = new DwtTabGroup(this.toString());
	if (radioIds) {
		for (var id in radioIds) {
			tg.addMember(document.getElementById(id));
		}
	}
	return tg;
};

ZmPreferencesPage.prototype._setupCheckbox =
function(id, setup, value) {
	var checkbox = new DwtCheckbox(this, null, null, value);
	this.setFormObject(id, checkbox);
	var cboxLabel = ZmPreferencesPage.__formatLabel(setup.displayName, value);
	checkbox.setText(cboxLabel);
	checkbox.setSelected(value);
	// TODO: Factor this out
	if (id == ZmSetting.MAIL_LOCAL_DELIVERY_DISABLED) {
		this._handleDontKeepCopyChange();
		checkbox.addSelectionListener(new AjxListener(this, this._handleDontKeepCopyChange));
	}
	return checkbox;
};

ZmPreferencesPage.prototype._setupInput =
function(id, setup, value) {
    value = this._prepareValue(id, setup, value);
    var params = {
		parent: this, type: setup.type ? setup.type : DwtInputField.STRING, initialValue: value, size: setup.cols || 40,
		rows: setup.rows, wrap: setup.wrap, maxLen:setup.maxLen
	};
	var input = new DwtInputField(params);
	this.setFormObject(id, input);
	// TODO: Factor this out
	if (id == ZmSetting.MAIL_LOCAL_DELIVERY_DISABLED) {
		this._handleDontKeepCopyChange();
	}
	return input;
};

ZmPreferencesPage.prototype._addImportWidgets =
function(containerDiv, settingId, setup) {
	var uri = appCtxt.get(ZmSetting.CSFE_UPLOAD_URI);

	var importDivId = this._htmlElId+"_import";
	var isAddrBookImport = settingId == ZmSetting.IMPORT; 
	var data = {
		id: importDivId,
		action: uri,
		name: ZmPreferencesPage.IMPORT_FIELD_NAME,
		label: isAddrBookImport ? ZmMsg.importFromCSVLabel : ZmMsg.importFromICSLabel
	};
	containerDiv.innerHTML = AjxTemplate.expand("prefs.Pages#Import", data);

	this._uploadFormId = importDivId+"_form";
	this._attInputId = importDivId+"_input";

	// setup pseudo tab group
	this._enterTabScope();
	var tabGroup = new DwtTabGroup(importDivId+"_x-tabgroup");
	try {
		// set up import button
		var buttonDiv = document.getElementById(importDivId+"_button");
		var btnLabel = setup ? setup.displayName : ZmMsg._import;
		this._importBtn = this._addButton(buttonDiv, btnLabel, 100, new AjxListener(this, this._importButtonListener));
		if (settingId) {
			this._importBtn.setData(Dwt.KEY_ID, settingId);
		}

		// add other controls
		var inputEl = document.getElementById(this._attInputId);
		if (inputEl) {
			this._addControlTabIndex(inputEl, inputEl);
		}
		this._addTabLinks(containerDiv);

		// add pseudo tab group
		this._addControlsToTabGroup(tabGroup);
	}
	finally {
		this._exitTabScope();
		this._addControlTabIndex(containerDiv, new ZmPreferencesPage.__hack_TabGroupControl(tabGroup));
	}
};

ZmPreferencesPage.__hack_TabGroupControl = function(tabGroup) {
	this.getTabGroupMember = function() { return tabGroup; }
};

ZmPreferencesPage.prototype._addExportWidgets =
function(containerDiv, settingId, setup) {
	var exportDivId = this._htmlElId+"_export";
	containerDiv.innerHTML = AjxTemplate.expand("prefs.Pages#Export", exportDivId);

	var buttonDiv = document.getElementById(exportDivId+"_button");
	buttonDiv.setAttribute("tabindex", containerDiv.getAttribute("tabindex"));

	var btnLabel = setup.displayName || ZmMsg._export;
	var btn = this._addButton(buttonDiv, btnLabel, 110, new AjxListener(this, this._exportButtonListener));
	btn.setData(Dwt.KEY_ID, settingId);
};

ZmPreferencesPage.prototype._setupColor =
function(id, setup, value) {
	var picker = new DwtButtonColorPicker(this);
	picker.setImage("FontColor");
	picker.showColorDisplay(true);
	picker.setToolTipContent(ZmMsg.fontColor);
	picker.setColor(value);

	this.setFormObject(id, picker);

	return picker;
};

ZmPreferencesPage.prototype._setupCustom =
function(id, setup, value) {
	DBG.println("TODO: override ZmPreferences#_setupCustom");
};

ZmPreferencesPage.prototype._setupLocales =
function(id, setup, value) {
    this._createLocaleData(setup);
    var button = new DwtButton(this);
    button.setSize(60, Dwt.DEFAULT);
    button.setMenu(new AjxListener(this, this._createLocalesMenu, [setup]));
    this._showLocale(value, button);

    this._dwtObjects[id] = button;

	return button;
};

ZmPreferencesPage.prototype._showLocale =
function(localeId, button) {
    var locale = this._localeMap[localeId];
    button.setImage(locale.image);
    button.setText(locale.name);
    button._localeId = localeId;
};

ZmPreferencesPage.prototype._createLocaleData =
function(setup) {
    if (this._localeMap) {
        return;
    }

    this._localeMap = {};
    this._languageMap = {};
    var locales = appCtxt.get(ZmSetting.LOCALES);
    for (var i = 0; i < locales.length; i++) {
        var locale = locales[i];
        var id = locale.id;
        var index = id.indexOf("_");
        var languageId;
        if (index == -1) {
            languageId = id;
        } else {
            languageId = id.substr(0, index);
        }
        if (!this._languageMap[languageId]) {
            this._languageMap[languageId] = { name: "", locales: [] };
        }
        if (index != -1) {
            var country = id.substring(id.length - 2);
            var localeObj = {
                id: id,
                name: locale.name,
                image: "Flag" + country
            };
            this._languageMap[languageId].locales.push(localeObj);
            this._localeMap[id] = localeObj;
        } else {
            this._languageMap[languageId].name = locale.name;
        }
    }
};

ZmPreferencesPage.prototype._createLocalesMenu =
function(setup) {

    var button = this._dwtObjects[ZmSetting.LOCALE_NAME];
    var result = new DwtMenu(button);

    for (var language in this._languageMap) {
        var array = this._languageMap[language].locales;
        if (array && array.length == 1) {
            this._createLocaleItem(result, array[0]);
        } else if (array.length > 1) {
            var menuItem = new DwtMenuItem(result, DwtMenuItem.CASCADE_STYLE);
            menuItem.setText(this._languageMap[language].name)
            var subMenu = new DwtMenu(result, DwtMenu.DROPDOWN_STYLE);
            menuItem.setMenu(subMenu);
            for (var i = 0, count = array.length; i < count; i++) {
                this._createLocaleItem(subMenu, array[i]);
            }
        }
    }
    return result;
};

ZmPreferencesPage.prototype._createLocaleItem =
function(parent, obj) {
    var result = new DwtMenuItem(parent);
    result.setText(obj.name);
    result.setImage(obj.image);
    result._localeId = obj.id;
    result.addSelectionListener(new AjxListener(this, this._localeSelectionListener));
    return result;
};

ZmPreferencesPage.prototype._localeSelectionListener =
function(ev) {
    var item = ev.dwtObj;
    var button = this._dwtObjects[ZmSetting.LOCALE_NAME];
    this._showLocale(item._localeId, button);
};

ZmPreferencesPage.prototype._handleDontKeepCopyChange = function(ev) {
	var input = this.getFormObject(ZmSetting.MAIL_FORWARDING_ADDRESS);
	var checkbox = this.getFormObject(ZmSetting.MAIL_LOCAL_DELIVERY_DISABLED);
	if (input && checkbox) {
		input.setRequired(checkbox.isSelected());
	}
};

// Popup the change password dialog.
ZmPreferencesPage.prototype._changePasswordListener =
function(ev) {
	var args = "height=465,width=705,location=no,menubar=no,resizable=yes,scrollbars=no,status=yes,toolbar=no";
	var proto = appCtxt.get(ZmSetting.PROTOCOL_MODE);
	proto = (proto == ZmSetting.PROTO_MIXED) ? ZmSetting.PROTO_HTTPS : ZmSetting.PROTO_HTTP;
	var url = AjxUtil.formatUrl({protocol:proto, path:"/zimbra/h/changepass", qsReset:true});
	window.open(url, "_blank", args);
};

ZmPreferencesPage.prototype._exportButtonListener =
function(ev) {
	var settingId = ev.dwtObj.getData(Dwt.KEY_ID);

	var dialog = appCtxt.getChooseFolderDialog();
	dialog.reset();
	dialog.registerCallback(DwtDialog.OK_BUTTON, this._exportOkCallback, this, [dialog, settingId]);

	var omit = {};
	omit[ZmFolder.ID_TRASH] = true;

	var overviewId = [this.toString, settingId].join("-");
	if (settingId == ZmSetting.EXPORT) {
		AjxDispatcher.require(["ContactsCore", "Contacts"]);
		dialog.popup({treeIds:[ZmOrganizer.ADDRBOOK],
					  overviewId:overviewId,
					  omit:omit,
					  title:ZmMsg.chooseAddrBook,
					  hideNewButton:true,
					  description:ZmMsg.chooseAddrBookToExport});
	} else {
		AjxDispatcher.require(["CalendarCore", "Calendar", "CalendarAppt"]);
		dialog.popup({treeIds:[ZmOrganizer.CALENDAR],
					  overviewId:overviewId,
					  omit:omit,
					  title:ZmMsg.chooseCalendar,
					  hideNewButton:true,
					  description:ZmMsg.chooseCalendarToExport});
	}
};

ZmPreferencesPage.prototype._importButtonListener =
function(ev) {
	var settingId = this._importBtn.getData(Dwt.KEY_ID);
	var fileInput = document.getElementById(this._attInputId);
	var val = fileInput ? AjxStringUtil.trim(fileInput.value) : null;

	if (val) {
		var dialog = appCtxt.getChooseFolderDialog();
		dialog.reset();
		dialog.setTitle(ZmMsg._import);
		dialog.registerCallback(DwtDialog.OK_BUTTON, this._importOkCallback, this, dialog);

		if (settingId == ZmSetting.IMPORT) {
			AjxDispatcher.require(["ContactsCore", "Contacts"]);
			dialog.popup({treeIds:[ZmOrganizer.ADDRBOOK], title:ZmMsg.chooseAddrBook, description:ZmMsg.chooseAddrBookToImport, skipReadOnly:true});
		} else {
			AjxDispatcher.require(["CalendarCore", "Calendar"]);
			dialog.popup({treeIds:[ZmOrganizer.CALENDAR], title:ZmMsg.chooseCalendar, description:ZmMsg.chooseCalendarToImport, skipReadOnly:true});
		}
	}
};

ZmPreferencesPage.prototype._importOkCallback =
function(dialog, folder) {
	var rootId = ZmOrganizer.getSystemId(ZmOrganizer.ID_ROOT);
	if (folder && folder.id && folder.id != rootId) {
		dialog.popdown();
		this._importBtn.setEnabled(false);

		var callback = new AjxCallback(this, this._importDoneCallback, folder.id);
		var um = appCtxt.getUploadManager();
		window._uploadManager = um;
		try {
			um.execute(callback, document.getElementById(this._uploadFormId));
		} catch (ex) {
			if (ex.msg) {
				var d = appCtxt.getMsgDialog();
				d.setMessage(ex.msg, DwtMessageDialog.CRITICAL_STYLE);
				d.popup();
			}

			this._importBtn.setEnabled(true);
			return true;
		}
	}
};

ZmPreferencesPage.prototype._importDoneCallback =
function(folderId, status, aid) {
	var appCtlr = appCtxt.getAppController();
	var settingId = this._importBtn.getData(Dwt.KEY_ID);

	if (status == 200) {
		appCtlr.setStatusMsg(ZmMsg.importingContacts);

		// send the import request w/ the att Id to the server per import setting
		if (settingId == ZmSetting.IMPORT)
		{
			var soapDoc = AjxSoapDoc.create("ImportContactsRequest", "urn:zimbraMail");
			var method = soapDoc.getMethod();
			method.setAttribute("ct", "csv"); // always "csv" for now
			method.setAttribute("l", folderId);
			var content = soapDoc.set("content", "");
			content.setAttribute("aid", aid);
		} else {
			var soapDoc = AjxSoapDoc.create("ImportAppointmentsRequest", "urn:zimbraMail");
			var method = soapDoc.getMethod();
			method.setAttribute("ct", "ics");
			method.setAttribute("l", folderId);
			var content = soapDoc.set("content", "");
			content.setAttribute("aid", aid);
		}
		var respCallback = new AjxCallback(this, this._handleResponseFinishImport, [aid, settingId]);
		var errorCallback = new AjxCallback(this, this._handleErrorFinishImport);
		appCtxt.getAppController().sendRequest({soapDoc:soapDoc, asyncMode:true,
													  callback:respCallback, errorCallback:errorCallback,
													  timeout:ZmPreferencesPage.IMPORT_TIMEOUT});
	} else {
        var msg = AjxMessageFormat.format(ZmMsg.errorImportStatus, status);
        appCtlr.setStatusMsg(msg, ZmStatusView.LEVEL_CRITICAL);
		this._importBtn.setEnabled(true);
	}
};

ZmPreferencesPage.prototype._handleResponseFinishImport =
function(aid, settingId, result) {
	var msg;
	if (settingId == ZmSetting.IMPORT) {
		var resp = result.getResponse().ImportContactsResponse.cn[0];
		msg = AjxMessageFormat.format(ZmMsg.contactsImportedResult, Number(resp.n));
	} else {
		var resp = result.getResponse().ImportAppointmentsResponse.appt[0];
		msg = AjxMessageFormat.format(ZmMsg.apptsImportedResult, Number(resp.n));
	}
	appCtxt.getAppController().setStatusMsg(msg);
	this._importBtn.setEnabled(true);
};

ZmPreferencesPage.prototype._handleErrorFinishImport =
function(ex) {
	this._importBtn.setEnabled(true);

	if (ex.code == ZmCsfeException.MAIL_UNABLE_TO_IMPORT_CONTACTS ||
		ex.code == ZmCsfeException.MAIL_UNABLE_TO_IMPORT_APPOINTMENTS)
	{
		var errDialog = appCtxt.getErrorDialog();
		errDialog.setMessage(ex.getErrorMsg(), ex.msg, DwtMessageDialog.WARNING_STYLE);
		errDialog.popup();
		return true;
	}
	return false;
};

ZmPreferencesPage.prototype._exportOkCallback =
function(dialog, settingId, folder) {
	var rootId = ZmOrganizer.getSystemId(ZmOrganizer.ID_ROOT);
	if (folder && folder.id && folder.id != rootId) {
		var portPrefix = (location.port == "" || location.port == "80")
			? ""
			: (":" + location.port);
		var format = (settingId == ZmSetting.IMPORT || settingId == ZmSetting.EXPORT) ? "csv" : "ics";
		var folderName = folder._systemName || folder.name;
		var uri = [location.protocol, "//", document.domain, portPrefix, "/service/home/~/", folderName, "?auth=co&fmt=", format].join("");
		window.open(uri, "_blank");

		dialog.popdown();
	}
};

// Reset the form values to the pref defaults. Note that the pref defaults aren't the
// values that the user last had, they're the values that the prefs have before the
// user ever touches them.
ZmPreferencesPage.prototype._resetListener =
function(ev) {
	this.reset(true);
	appCtxt.setStatusMsg(ZmMsg.defaultsRestored);
};

/** Reset the form values to the last save. */
ZmPreferencesPage.prototype._resetPageListener = function(ev) {
	this.reset(false);
	this._controller.setDirty(this._section.id, false);
	appCtxt.setStatusMsg(ZmMsg.defaultsPageRestore);
};

/**
 * Returns true if any of the specified prefs are enabled (or have no
 * preconditions).
 */
ZmPreferencesPage.prototype._isEnabled =
function(data, prefId1 /* ..., prefIdN */) {
	for (var i = 1; i < arguments.length; i++) {
		var prefId = arguments[i];
		if (!prefId) { return false; }	// setting not created (its app is disabled)
		if (this._controller.checkPreCondition(ZmPref.SETUP[prefId], prefId)) {
			return true;
		}
	}
	return false;
};

ZmPreferencesPage.prototype._expandField =
function(data, prefId) {
	var templateId = this._section.templateId.replace(/#.*$/, "#"+prefId);
	return AjxTemplate.expand(templateId, data);
};

//
// Private functions
//

/**
 * Formats a label. If the label contains a replacement parameter (e.g. {0}),
 * then it is formatted using AjxMessageFormat with the current value for this
 * label.
 */
ZmPreferencesPage.__formatLabel =
function(prefLabel, prefValue) {
	prefLabel = prefLabel || "";
	return prefLabel.match(/\{/) ? AjxMessageFormat.format(prefLabel, prefValue) : prefLabel;
};
