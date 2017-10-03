/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016 Synacor, Inc.
 *
 * The contents of this file are subject to the Common Public Attribution License Version 1.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at: https://www.zimbra.com/license
 * The License is based on the Mozilla Public License Version 1.1 but Sections 14 and 15
 * have been added to cover use of software over a computer network and provide for limited attribution
 * for the Original Developer. In addition, Exhibit A has been modified to be consistent with Exhibit B.
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * See the License for the specific language governing rights and limitations under the License.
 * The Original Code is Zimbra Open Source Web Client.
 * The Initial Developer of the Original Code is Zimbra, Inc.  All rights to the Original Code were
 * transferred by Zimbra, Inc. to Synacor, Inc. on September 14, 2015.
 *
 * All portions of the code are Copyright (C) 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016 Synacor, Inc. All Rights Reserved.
 * ***** END LICENSE BLOCK *****
 */

/**
 * Creates an empty preferences page of the given type.
 * @constructor
 * @class
 * This class represents a single page of preferences available by selecting one of the
 * preference tabs. During construction, skeletal HTML is created. The preferences
 * are not added until the page becomes visible.
 *
 * @author Conrad Damon
 *
 * @param {DwtControl}	parent			the containing widget
 * @param {object}	section			the page
 * @param {ZmPrefController}	controller		the prefs controller
 *
 * @extends		DwtTabViewPage
 */
ZmPreferencesPage = function(parent, section, controller, id) {
	if (arguments.length == 0) return;

	id = id || ("Prefs_Pages_" + section.id);
	DwtTabViewPage.call(this, parent, "ZmPreferencesPage", null, id);

	this._section = section;
	this._controller = controller;

	this.setScrollStyle(Dwt.SCROLL_Y);

	this._title = [ZmMsg.zimbraTitle, controller.getApp().getDisplayName(), section.title].join(": ");

	this._dwtObjects = {};
	this._tabGroup = new DwtTabGroup(id);
	this._rendered = false; // used by DwtTabViewPage
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

ZmPreferencesPage.prototype._replaceControlElement =
function(elemOrId, control) {
	control.replaceElement(elemOrId);
};

ZmPreferencesPage.prototype._enterTabScope =
function() {
	if (!this._tabScopeStack) {
		this._tabScopeStack = [];
	}
	var scope = {};
	this._tabScopeStack.push(scope);
	return scope;
};

ZmPreferencesPage.prototype._getCurrentTabScope =
function() {
	var stack = this._tabScopeStack;
	return stack && stack[stack.length - 1];
};

ZmPreferencesPage.prototype._exitTabScope =
function() {
	var stack = this._tabScopeStack;
	return stack && stack.pop();
};

ZmPreferencesPage.prototype._addControlTabIndex =
function(elemOrId, control) {
};

ZmPreferencesPage.prototype._addTabLinks =
function(elemOrId) {
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
 * Fills the page with preferences that belong to this page, if that has not been done
 * already. Note this method is only called when the tab
 * is selected and the page becomes visible.
 *
 */
ZmPreferencesPage.prototype.showMe =
function() {
	DwtTabViewPage.prototype.showMe.call(this);

	Dwt.setTitle(this._title);
	this._controller._resetOperations(this._controller._toolbar, this._section.id);

	if (this.hasRendered) {
		if (this._controller.isDirty(this._section.id)) {
			this._controller.setDirty(this._section.id, false);
		}
		return;
	}

	this._dwtObjects = {}; // always reset in case account has changed
	this._createPageTemplate();
	this._createControls();

	// find option headers and sections
	var elements = this.getHtmlElement().children;

	AjxUtil.foreach(elements, function(el) {
		if (Dwt.hasClass(el, 'prefHeader')) {
			var header = el;
			header.setAttribute('role', 'heading');
			header.setAttribute('aria-level', 1);
			header.id = Dwt.getNextId('prefHeader')
		} else if (Dwt.hasClass(el, 'ZOptionsSectionTable')) {
			var sectiontable = el;
			var header = Dwt.getPreviousElementSibling(sectiontable);
			var sections = Dwt.byClassName('ZOptionsSectionMain', sectiontable);

			if (!Dwt.hasClass(header, 'prefHeader')) {
				DBG.println(AjxDebug.DBG1, "pref section has no prefHeader:\n" +
				            sectiontable.outerHTML);
				return;
			}

			// we only expect one section, but iterate over them, just in case
			AjxUtil.foreach(sections, function(section) {
				section.setAttribute('aria-labelledby', header.id);
				section.setAttribute('role', 'region');
			});
		}
	});

	// find option fields
	var fields = Dwt.byClassName('ZOptionsField', this.getHtmlElement());

	AjxUtil.foreach(fields, function(field) {
		field.setAttribute('role', 'group');

		// find the label corresponding to this item and assign it as an ARIA
		// label
		var label = Dwt.getPreviousElementSibling(field);

		if (!label) {
			DBG.println(AjxDebug.DBG1, "option field has no label " + Dwt.getId(field));
			return;
		}

		label.setAttribute('role', 'heading');
		label.setAttribute('aria-level', 2);

		field.setAttribute('aria-labelledby',
		                   Dwt.getId(label, 'ZOptionsLabel'));
	});

	// find focusable children -- i.e. links and widgets -- but in the DOM
	// order, not in the order they were added as children
	var selector = [
		'[parentid="',
		this.getHTMLElId(),
		'"],',
		'A'
	].join('');
	var elements = this.getHtmlElement().querySelectorAll(selector);

	for (var i = 0; i < elements.length; i++) {
		var element = elements[i];
		var control = DwtControl.fromElement(element);

		// add the child to our tab group
		if (control && control.parent == this) {
			this._tabGroup.addMember(control.getTabGroupMember());
		} else if (DwtControl.findControl(element) === this) {
			this._makeFocusable(element);
			this._tabGroup.addMember(element);
		}

		// find the ZOptionsField corresponding to this item and assign it as
		// an ARIA label
		var ancestors = Dwt.getAncestors(element, this.getHtmlElement());
		var field = null, label = null;

		for (var j = 0; j < ancestors.length; j++) {
			var ancestor = ancestors[j];
			var ancestorSibling = Dwt.getPreviousElementSibling(ancestor);

			// are we looking at an option field with a corresponding label?
			// please note that labels can have multiple classes, all of them
			// starting with ZOptionsLabel
			if (Dwt.hasClass(ancestor, 'ZOptionsField')) {
				field = ancestor;
			}
		}

		if (!field) {
			DBG.println(AjxDebug.DBG1, "no field found for:\n" +
						element.outerHTML);
			continue;
		}

		var label = Dwt.getPreviousElementSibling(field);

		if (!label || !label.className.match(/\bZOptionsLabel/)) {
			DBG.println(AjxDebug.DBG1, "option field has no label:\n" +
						field.outerHTML);
			continue;
		}

		if (!label.id) {
			label.id = Dwt.getNextId();
		}

		label.setAttribute('role', 'heading');
		label.setAttribute('aria-level', 2);
	}
};

ZmPreferencesPage.prototype._createPageTemplate =
function() {
	// expand template
	DBG.println(AjxDebug.DBG2, "rendering preferences page " + this._section.id);
	var templateId = this._section.templateId;
	this._createPageHtml(templateId, this._getTemplateData());
	this.setVisible(false); // hide until ready
};

ZmPreferencesPage.prototype._getTemplateData =
function() {
	var data = {
		id: this._htmlElId,
		isEnabled: AjxCallback.simpleClosure(this._isEnabled, this),
		activeAccount: appCtxt.getActiveAccount()
	};
	data.expandField = AjxCallback.simpleClosure(this._expandField, this, data);

	return data;
};

ZmPreferencesPage.prototype._createControls =
function() {
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

			if (!setup || !appCtxt.checkPrecondition(setup.precondition, setup.preconditionAny)) {
				continue;
			}

			// perform load function
			if (setup.loadFunction) {
				setup.loadFunction(setup);
				if (setup.options.length <= 1) { continue; }
			}

			// save the current value (for checking later if it changed)
			pref.origValue = this._getPrefValue(id);
			var value = this._getPrefValue(id, false);

			this._prefPresent[id] = true;
			DBG.println(AjxDebug.DBG3, "adding pref " + pref.name + " / " + value);

			// create form controls
			this._initControl(id, setup, value);

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
			else if (type == ZmPref.TYPE_STATIC) {
				control = this._setupStatic(id, setup, value);
			}
			else if (type == ZmPref.TYPE_COLOR) {
				control = this._setupColor(id, setup, value);
			}
			else if (type == ZmPref.TYPE_LOCALES) {
                //Fix for bug# 80762 - Based on multiple locale availability set the view as dropdown or label
                if(ZmLocale.hasChoices()) {
                    control = this._setupLocales(id, setup, value);
                }
                else {
                    //Part of bug# 80762. Sets view for a single locale and displays as a label
                    control = this._setupLocaleLabel(id, setup, value);
                }
			}
			else if (type == ZmPref.TYPE_FONT) {
				control = this._setupMenuButton(id, value, ZmPreferencesPage.fontMap);
			}
			else if (type == ZmPref.TYPE_FONT_SIZE) {
				control = this._setupMenuButton(id, value, ZmPreferencesPage.fontSizeMap);
			}
			else if (type == ZmPref.TYPE_PASSWORD) {
				this._addButton(elem, setup.displayName, Dwt.DEFAULT, new AjxListener(this, this._changePasswordListener), "CHANGE_PASSWORD", "ZInlineButton");
			}
			else if (type == ZmPref.TYPE_IMPORT) {
				this._addImportWidgets(elem, id, setup);
			}
			else if (type == ZmPref.TYPE_EXPORT) {
				this._addExportWidgets(elem, id, setup);
			}

			if (!control) {
				control = this.getFormObject(id);
			}

			// add control to form
			if (control && control.isDwtControl) {
				this._replaceControlElement(elem, control);
				if (setup.initFunction) {
					setup.initFunction(control, value);
				}
				if (setup.changeFunction) {
					if (control.addChangeListener) {
						control.addChangeListener(setup.changeFunction);
					} else if (control.addSelectionListener) {
						control.addSelectionListener(setup.changeFunction);
					}
				}
			}
		}

		// create special page buttons
		var defaultsRestore = document.getElementById([this._htmlElId,"DEFAULTS_RESTORE"].join("_"));
		if (defaultsRestore) {
			this._addButton(defaultsRestore, ZmMsg.restoreDefaults, 110, new AjxListener(this, this._resetListener));
		}

		// create tab-group for all controls on the page
		this._addControlsToTabGroup(this._tabGroup);
	}
	finally {
		this._exitTabScope();
	}

	// finish setup
	this.setVisible(true);
	this.hasRendered = true;
};

ZmPreferencesPage.prototype._addControlsToTabGroup =
function(tabGroup) {
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
 * Gets the value of the preference control.
 *
 * @param {String}		id		the preference id
 * @param {Object}	[setup]		the preference descriptor
 * @param {DwtControl}	[control]	the preference control
 * @return	{String}	the value
 */
ZmPreferencesPage.prototype.getFormValue =
function(id, setup, control) {
	setup = setup || ZmPref.SETUP[id];
	var value = null;
	var type = setup ? setup.displayContainer : null;
	if (type == ZmPref.TYPE_SELECT || type == ZmPref.TYPE_COMBOBOX ||
		type == ZmPref.TYPE_CHECKBOX ||
		type == ZmPref.TYPE_RADIO_GROUP || type == ZmPref.TYPE_COLOR ||
		type == ZmPref.TYPE_INPUT || type == ZmPref.TYPE_LOCALES ||
		type === ZmPref.TYPE_FONT || type === ZmPref.TYPE_FONT_SIZE) {
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
				if (value == "true" || value == "false") {
					value = (value == "true");
				}
			}
			else if (type == ZmPref.TYPE_LOCALES) {
				value = object._localeId;
			}
			else if (type === ZmPref.TYPE_FONT || type === ZmPref.TYPE_FONT_SIZE) {
				value = object._itemId;
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
 * Sets the value of the preference control.
 *
 * @param {String}	id		the preference id
 * @param {Object}	value		the preference value
 * @param {Object}	[setup]		the preference descriptor
 * @param {DwtControl}	[control]	the preference control
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
		if (!object) { return value; }

		if (type == ZmPref.TYPE_COLOR) {
			object.setColor(value);
		} else if (type == ZmPref.TYPE_CHECKBOX) {
			if (id == ZmSetting.OFFLINE_IS_MAILTO_HANDLER) {
				try { // add try/catch - see bug #33870
					if (window.platform && !window.platform.isRegisteredProtocolHandler("mailto")) {
						object.setSelected(false);

						// this pref might have been set to true before. so we must set origValue = false
						// so that when user selects the checkbox, it will be considered "dirty"
						var setting = appCtxt.getSettings(appCtxt.accountList.mainAccount).getSetting(id);
						setting.origValue = false;
					} else {
						object.setSelected(true);
					}
					object.setEnabled(true);
				} catch(ex) {
					object.setEnabled(false);
					object.setSelected(false);
				}
			} else {
				object.setSelected(value);
			}
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
		if (!object) { return value; }

		var curValue = object.getValue();
		if (value != null && (curValue != value)) {
			object.setValue(value);
		}
	} else if (type == ZmPref.TYPE_LOCALES) {
		var object = this._dwtObjects[ZmSetting.LOCALE_NAME];
		if (!object) { return value; }
		this._showLocale(value, object);
	} else if (type == ZmPref.TYPE_FONT) {
		var object = this._dwtObjects[ZmSetting.FONT_NAME];
		if (!object) { return value; }
		this._showItem(value, ZmPreferencesPage.fontMap, object);
	} else if (type == ZmPref.TYPE_FONT_SIZE) {
		var object = this._dwtObjects[ZmSetting.FONT_SIZE];
		if (!object) { return value; }
		this._showItem(value, ZmPreferencesPage.fontSizeMap, object);
	} else {
		var prefId = [this._htmlElId, id].join("_");
		var element = control || document.getElementById(prefId);
		if (!element || element.value == value) { return value; }

		element.value = value || "";
	}
    return value;
};

/**
 * Gets the title.
 *
 * @return	{String}	the title
 */
ZmPreferencesPage.prototype.getTitle =
function() {
	return this._title;
};

ZmPreferencesPage.prototype.hasResetButton =
function() {
	return true;
};


ZmPreferencesPage.prototype.getTabGroupMember =
function() {
	return this._tabGroup;
};

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

	if (!useDefaults) {
		this._controller.setDirty(this._section.id, false);
	}
};

ZmPreferencesPage.prototype.resetOnAccountChange =
function() {
	this.hasRendered = false;
};

/**
 * Checks if the data is dirty.
 *
 * @return	{Boolean}	<code>true</code> if the data is dirty
 */
ZmPreferencesPage.prototype.isDirty = function() { return false; };
ZmPreferencesPage.prototype.validate = function() {	return true; };

/**
 * Adds the modify command to the given batch command.
 *
 * @param	{ZmBatchCommand}		batchCmd		the batch command
 */
ZmPreferencesPage.prototype.addCommand = function(batchCmd) {};

//
// Protected methods
//

ZmPreferencesPage.prototype._createPageHtml =
function(templateId, data) {
	if (AjxTemplate.require(templateId)) {
		this.getContentHtmlElement().innerHTML = AjxTemplate.expand(templateId, data);
	}
};

/**
 * Returns the value of the specified pref, massaging it if necessary.
 *
 * @param id			[constant]		pref ID
 * @param useDefault	[boolean]		if true, use pref's default value
 *
 * @private
 */
ZmPreferencesPage.prototype._getPrefValue =
function(id, useDefault) {
	var pref = appCtxt.getSettings().getSetting(id);
	return useDefault ? pref.getDefaultValue() : pref.getValue();
};

// Add a button to the preferences page
ZmPreferencesPage.prototype._addButton =
function(parentIdOrElem, text, width, listener, id, className) {
	var params = {parent: this};
	if (id) {
		params.id = id;
	}
	var button = new DwtButton(params);
	button.setSize(width, Dwt.DEFAULT);
	button.setText(text);
	button.addSelectionListener(listener);
	this._replaceControlElement(parentIdOrElem, button);
	if (className) {
		button.addClassName(className);
	}
	return button;
};

ZmPreferencesPage.prototype._prepareValue =
function(id, setup, value) {
	if (setup.displayFunction) {
		value = setup.displayFunction(value);
	}
	if (setup.approximateFunction) {
		value = setup.approximateFunction(value);
	}
	return value;
};

ZmPreferencesPage.prototype._initControl =
function(id, setup, value) {
	// sub-classes can override this to provide initialization
	// code *before* the actual control is constructed.
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

	var params = {parent: this, id: "Prefs_Select_" + id};
	for (var p in setup.displayParams) {
		params[p] = setup.displayParams[p];
	}
	var selObj = new DwtSelect(params);
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
    selObj.dynamicButtonWidth();

	return selObj;
};

ZmPreferencesPage.prototype._setupComboBox =
function(id, setup, value) {
	value = this._prepareValue(id, setup, value);

	var params = {parent: this, id: "Prefs_ComboBox_" + id};

	var cboxObj = new DwtComboBox(params);
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

	var params = {parent: this, id: "Prefs_RadioGroup_" + id};
	var container = new DwtComposite(params);

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
	var inputId = setup.inputId;
	
	var radioIds = {};
	var selectedId;
	var name = Dwt.getNextId();
	for (var i = 0; i < options.length; i++) {
		var optValue = isChoices ? options[i].value : options[i];
		var optLabel = isChoices ? options[i].label : (isDisplayString ? setup.displayOptions : setup.displayOptions[i]);
		optLabel = ZmPreferencesPage.__formatLabel(optLabel, optValue);
		var isSelected = value == optValue;

		var automationId  = AjxUtil.isArray(inputId) && inputId[i] ? inputId[i] : Dwt.getNextId();
		var radioBtn = new DwtRadioButton({parent:container, name:name, checked:isSelected, id: automationId});
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

	return container;
};

ZmPreferencesPage.prototype._setupCheckbox =
function(id, setup, value) {
	var params = {parent: this, checked: value, id: "Prefs_Checkbox_" + id};
	var checkbox = new DwtCheckbox(params);
	this.setFormObject(id, checkbox);
	var text = setup.displayFunc ? setup.displayFunc() : setup.displayName;
	var cboxLabel = ZmPreferencesPage.__formatLabel(text, value);
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
		parent: this,
		type: setup.type || DwtInputField.STRING,
		initialValue: value,
		size: setup.cols || 40,
		rows: setup.rows,
		wrap: setup.wrap,
		maxLen:setup.maxLen,
		hint: setup.hint,
		label: setup.label,
		id: "Prefs_Input_" + id,
		className: (setup.className || "ZmPrefInputField") + " DwtInputField" 
	};
	var input = new DwtInputField(params);
	this.setFormObject(id, input);
	// TODO: Factor this out
	if (id == ZmSetting.MAIL_FORWARDING_ADDRESS) {
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

ZmPreferencesPage.__hack_TabGroupControl =
function(tabGroup) {
	this.getTabGroupMember = function() { return tabGroup; };
};

ZmPreferencesPage.prototype._setupColor =
function(id, setup, value) {

	var params = {parent: this, id: "Prefs_ColorPicker_" + id};
	var picker = new DwtButtonColorPicker(params);
	picker.setImage("FontColor");
	picker.showColorDisplay(true);
	picker.setToolTipContent(ZmMsg.fontColor);
	picker.setColor(value);

	this.setFormObject(id, picker);

	return picker;
};

ZmPreferencesPage.prototype._addExportWidgets =
function(containerDiv, settingId, setup) {
	var exportDivId = this._htmlElId+"_export";
	containerDiv.innerHTML = AjxTemplate.expand("prefs.Pages#Export", exportDivId);

    //Export Options
	var format = settingId == "CAL_EXPORT" ? "ics" : "csv";
    var selFormat = null;
    var optionsDiv = document.getElementById(exportDivId+"_options");
    if(optionsDiv && (setup.options && setup.options.length > 0) ) {
        var selFormat = this._setupSelect(settingId, setup);
        this._replaceControlElement(optionsDiv, selFormat);
    }

    //Export Button
	var buttonDiv = document.getElementById(exportDivId+"_button");
	buttonDiv.setAttribute("tabindex", containerDiv.getAttribute("tabindex"));

	var btnLabel = setup.displayName || ZmMsg._export;
	var btn = this._addButton(buttonDiv, btnLabel, 110, new AjxListener(this, this._exportButtonListener, [format, selFormat]));
	btn.setData(Dwt.KEY_ID, settingId);
};

ZmPreferencesPage.prototype._setupCustom =
function(id, setup, value) {
	DBG.println("TODO: override ZmPreferences#_setupCustom");
};

ZmPreferencesPage.prototype._setupLocales =
function(id, setup, value) {
	var params = {parent: this, id: "Prefs_Locale_" + id};
	var button = new DwtButton(params);
	button.setSize(60, Dwt.DEFAULT);
	button.setMenu(new AjxListener(this, this._createLocalesMenu, [setup]));
	button.addClassName("ZSelect"); //this will show drop-button like select control
	this._showLocale(value, button);

	this._dwtObjects[id] = button;

	return button;
};

//Part of bug# 80762 - Display the single locale item as a read-only label
ZmPreferencesPage.prototype._setupLocaleLabel =
function(id, setup, value) {
    var label = new DwtLabel({parent:this});
    label.setSize(60, Dwt.DEFAULT);
    this._showLocale(value, label);
    this._dwtObjects[id] = label;
    return label;
};

ZmPreferencesPage.prototype._setupMenuButton =
function(id, value, itemMap) {
	var button = new DwtButton({parent:this});
	button.setSize(60, Dwt.DEFAULT);
	button.setMenu(new AjxListener(this, this._createMenu, [button, itemMap]));
	button.addClassName("ZSelect"); //this will show drop-button like select control
	this._showItem(value, itemMap, button);

	this._dwtObjects[id] = button;

	return button;
};

ZmPreferencesPage.prototype._showLocale =
function(localeId, button) {
	var locale = ZmLocale.localeMap[localeId] || ZmLocale.localeMap[localeId.substr(0, 2)];
	button.setImage(locale ? locale.getImage() : null);
	button.setText(locale ? locale.getNativeAndLocalName() : "");
	button._localeId = localeId;
};

ZmPreferencesPage.prototype._createMenu =
function(button, itemMap) {

	var menu = new DwtMenu({parent:button});

	var listener = this._itemSelectionListener.bind(this, button, itemMap);

	for (var id in itemMap) {
		var item = itemMap[id];
		this._createMenuItem(menu, item.id, item.name, listener);
	}
	return menu;
};

ZmPreferencesPage.prototype._createLocalesMenu =
function(setup) {

	var button = this._dwtObjects[ZmSetting.LOCALE_NAME];
	var result = new DwtMenu({parent:button});

	var listener = new AjxListener(this, this._localeSelectionListener);
	for (var language in ZmLocale.languageMap) {
		var languageObj = ZmLocale.languageMap[language];
		var locales = languageObj.locales;
		if (!locales) {
			this._createLocaleItem(result, languageObj, listener);
		}
		else if (locales.length > 0) {
			/* show submenu even if just one item, for cases such as Portugeuse (Brasil), since we want country (locale) specific items in the submenu level */
			var menuItem = new DwtMenuItem({parent:result, style:DwtMenuItem.CASCADE_STYLE});
			menuItem.setText(ZmLocale.languageMap[language].getNativeAndLocalName());
			var subMenu = new DwtMenu({parent:result, style:DwtMenu.DROPDOWN_STYLE});
			menuItem.setMenu(subMenu);
			for (var i = 0, count = locales.length; i < count; i++) {
				this._createLocaleItem(subMenu, locales[i], listener);
			}
		}
	}
	return result;
};

ZmPreferencesPage.prototype._createMenuItem =
function(parent, id, text, listener) {
	var item = new DwtMenuItem({parent:parent});
	item.setText(text);
	item._itemId = id;
	item.addSelectionListener(listener);
	return item;
};

ZmPreferencesPage.prototype._createLocaleItem =
function(parent, locale, listener) {
	var result = new DwtMenuItem({parent:parent});
	result.setText(locale.getNativeAndLocalName());
	if (locale.getImage()) {
		result.setImage(locale.getImage());
	}
	result._localeId = locale.id;
	result.addSelectionListener(listener);
	return result;
};

ZmPreferencesPage.prototype._showItem =
function(itemId, itemMap, button) {
	var item = itemMap[itemId];
	button.setImage(item && item.image || null);
	button.setText(item && item.name || "");
	button._itemId = itemId;
};

ZmPreferencesPage.prototype._itemSelectionListener =
function(button, itemMap, ev) {
	var item = ev.dwtObj;
	this._showItem(item._itemId, itemMap, button);
};

ZmPreferencesPage.prototype._localeSelectionListener =
function(ev) {
	var item = ev.dwtObj;
	var button = this._dwtObjects[ZmSetting.LOCALE_NAME];
	this._showLocale(item._localeId, button);
    this._showComposeDirection(item._localeId);
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
	appCtxt.getChangePasswordWindow(ev);
};

ZmPreferencesPage.prototype._exportButtonListener =
function(format, formatSelectObj, ev) {
	var settingId = ev.dwtObj.getData(Dwt.KEY_ID);

	//Get Format
	var subFormat = formatSelectObj? formatSelectObj.getValue() : null;

	var dialog = appCtxt.getChooseFolderDialog();
	dialog.reset();
	dialog.registerCallback(DwtDialog.OK_BUTTON, this._exportOkCallback, this, [dialog, format, subFormat]);

	var omit = {};
	omit[ZmFolder.ID_TRASH] = true;
	var overviewId = dialog.getOverviewId(settingId);

	if (settingId == ZmSetting.EXPORT) {
		AjxDispatcher.require(["ContactsCore", "Contacts"]);
		dialog.popup({treeIds:			[ZmOrganizer.ADDRBOOK],
					  overviewId:		overviewId,
					  omit:				omit,
					  title:			ZmMsg.chooseAddrBook,
					  hideNewButton:	true,
					  appName:			ZmApp.CONTACTS,
					  description:		ZmMsg.chooseAddrBookToExport});
	} else {
		AjxDispatcher.require(["MailCore", "CalendarCore", "Calendar", "CalendarAppt"]);
		dialog.popup({treeIds:			[ZmOrganizer.CALENDAR],
					  overviewId:		overviewId,
					  omit:				omit,
					  title:			ZmMsg.chooseCalendar,
					  hideNewButton:	true,
					  appName:			ZmApp.CALENDAR,
					  description:		ZmMsg.chooseCalendarToExport});
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

		var overviewId = [this.toString(), settingId].join("-");
		if (settingId == ZmSetting.IMPORT) {
			AjxDispatcher.require(["ContactsCore", "Contacts"]);
			var noNew = !appCtxt.get(ZmSetting.NEW_ADDR_BOOK_ENABLED);
			var omit = {};
			omit[ZmFolder.ID_TRASH] = true;
			dialog.popup({treeIds:[ZmOrganizer.ADDRBOOK], title:ZmMsg.chooseAddrBook, overviewId: overviewId,
						  description:ZmMsg.chooseAddrBookToImport, skipReadOnly:true, hideNewButton:noNew, omit:omit});
		} else {
			AjxDispatcher.require(["MailCore", "CalendarCore", "Calendar"]);
			dialog.popup({treeIds:[ZmOrganizer.CALENDAR], title:ZmMsg.chooseCalendar, overviewId: overviewId, description:ZmMsg.chooseCalendarToImport, skipReadOnly:true});
		}
	}
	else {
		var params = {
			msg:	ZmMsg.importErrorMissingFile,
			level:	ZmStatusView.LEVEL_CRITICAL
		};
		appCtxt.setStatusMsg(params);
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
		var msg = (status == AjxPost.SC_NO_CONTENT)
			? ZmMsg.errorImportNoContent
			: (AjxMessageFormat.format(ZmMsg.errorImportStatus, status));
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
function(dialog, format, subFormat, folder) {
	var rootId = ZmOrganizer.getSystemId(ZmOrganizer.ID_ROOT);
	if (folder && folder.id && folder.id != rootId) {
		var portPrefix = (location.port == "" || location.port == "80")
			? ""
			: (":" + location.port);
		var folderName = folder._systemName || AjxStringUtil.urlEncode(folder.getPath());
		var username = appCtxt.multiAccounts ? (AjxStringUtil.urlComponentEncode(appCtxt.get(ZmSetting.USERNAME))) : "~";
		var uri = [
			location.protocol, "//", location.hostname, portPrefix, "/service/home/",
			username, "/", folderName,
			"?auth=co&fmt=", format,
			subFormat ? "&"+format+"fmt="+subFormat : "" // e.g. csvfmt=zimbra-csv
		].join("");
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

/**
 * Returns true if any of the specified prefs are enabled (or have no preconditions).
 */
ZmPreferencesPage.prototype._isEnabled = function(prefId1 /* ..., prefIdN */) {

	for (var i = 0; i < arguments.length; i++) {
		var prefId = arguments[i];

		// setting not created (its app is disabled)
		if (!prefId) { return false; }

		if (!appCtxt.getActiveAccount().isMain && ZmSetting.IS_GLOBAL[prefId]) {
			return false;
		}

		var setup = ZmPref.SETUP[prefId],
			prefPrecondition = setup && setup.precondition;
		if (appCtxt.checkPrecondition(prefPrecondition  || prefId, prefPrecondition && setup.preconditionAny)) {
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

ZmPreferencesPage.prototype._showComposeDirection =
function(localeId) {
    var button = this._dwtObjects[ZmSetting.COMPOSE_INIT_DIRECTION];
    var checkbox = this._dwtObjects[ZmSetting.SHOW_COMPOSE_DIRECTION_BUTTONS];
    if ( ZmLocale.RTLLANGUAGES.hasOwnProperty(localeId) ){
        button.setSelectedValue(ZmSetting.RTL);
        checkbox.setSelected(true);
    }
    else {
        button.setSelectedValue(ZmSetting.LTR);
        checkbox.setSelected(false);
    }
};
//
// Private functions
//

/**
 * Formats a label. If the label contains a replacement parameter (e.g. {0}),
 * then it is formatted using AjxMessageFormat with the current value for this
 * label.
 *
 * @private
 */
ZmPreferencesPage.__formatLabel =
function(prefLabel, prefValue) {
	prefLabel = prefLabel || "";
	return prefLabel.match(/\{/) ? AjxMessageFormat.format(prefLabel, prefValue) : prefLabel;
};

ZmPreferencesPage.fontMap = {};

ZmPreferencesPage._createMenuItem =
function(id, name, itemMap) {
	return itemMap[id] = {id: id, name: name};
};

ZmPreferencesPage._createMenuItem(ZmSetting.FONT_SYSTEM, ZmMsg.fontSystem, ZmPreferencesPage.fontMap);
ZmPreferencesPage._createMenuItem(ZmSetting.FONT_MODERN, ZmMsg.fontModern, ZmPreferencesPage.fontMap);
ZmPreferencesPage._createMenuItem(ZmSetting.FONT_CLASSIC, ZmMsg.fontClassic, ZmPreferencesPage.fontMap);
ZmPreferencesPage._createMenuItem(ZmSetting.FONT_WIDE, ZmMsg.fontWide, ZmPreferencesPage.fontMap);

ZmPreferencesPage.fontSizeMap = {};

ZmPreferencesPage._createMenuItem(ZmSetting.FONT_SIZE_SMALL, ZmMsg.fontSizeSmall, ZmPreferencesPage.fontSizeMap);
ZmPreferencesPage._createMenuItem(ZmSetting.FONT_SIZE_NORMAL, ZmMsg.fontSizeNormal, ZmPreferencesPage.fontSizeMap);
ZmPreferencesPage._createMenuItem(ZmSetting.FONT_SIZE_LARGE, ZmMsg.fontSizeLarge, ZmPreferencesPage.fontSizeMap);
ZmPreferencesPage._createMenuItem(ZmSetting.FONT_SIZE_LARGER, ZmMsg.fontSizeExtraLarge, ZmPreferencesPage.fontSizeMap);
