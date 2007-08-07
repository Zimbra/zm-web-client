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
 * Portions created by Zimbra are Copyright (C) 2005, 2006 Zimbra, Inc.
 * All Rights Reserved.
 * 
 * Contributor(s):
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
* @param parent				[DwtControl]				the containing widget
* @param appCtxt			[ZmAppCtxt]					the app context
* @param section			[object]					which page we are
* @param controller			[ZmPrefController]			prefs controller
*/
ZmPreferencesPage = function(parent, appCtxt, section, controller) {
	if (arguments.length == 0) return;
	DwtTabViewPage.call(this, parent, "ZmPreferencesPage");
	
	this._appCtxt = appCtxt;
	this._section = section;
	this._controller = controller;
	this._title = [ZmMsg.zimbraTitle, ZmMsg.options, section.title].join(": ");

	this._dwtObjects = {};
	this._rendered = false;
	this._hasRendered = false;

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
function () {
	return this._hasRendered;
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
	if (this._hasRendered && !dirty) return;

	if (this._hasRendered) {
		this._controller.setDirty(this._section.id, false);
		return;
	}

	// expand template
	DBG.println(AjxDebug.DBG2, "rendering preferences page " + this._section.id);
	var templateId = this._section.templateId;
	var data = {
		id: this._htmlElId, 
		isEnabled: AjxCallback.simpleClosure(this._isEnabled, this, data),
		expandField: AjxCallback.simpleClosure(this._expandField, this, data)
	};
	this._createPageHtml(templateId, data);
	this.setVisible(false); // hide until ready

    // create controls for prefs, if present in template
	this._prefPresent = {};
	var prefs = this._section.prefs || [];
	var settings = this._appCtxt.getSettings();
	for (var i = 0; i < prefs.length; i++) {
		var id = prefs[i];
		if (!id) { continue; }
		var pref = settings.getSetting(id);

		// ignore if there is no container element
		var elem = document.getElementById([this._htmlElId, id].join("_"));
		if (!elem) {
//			console.warn("no such element: ", [this._htmlElId,id].join("_"));
			continue;
		}

		// ignore if doesn't meet pre-condition
        var setup = ZmPref.SETUP[id];
        if (!this._controller.checkPreCondition(setup)) {
			continue;
		}

        // perform load function
		if (setup.loadFunction) {
			setup.loadFunction(this._appCtxt, setup);
            if (setup.options.length <= 1) {
				continue;
			}
		}

		// save the current value (for checking later if it changed)
		pref.origValue = this._getPrefValue(id);
		var value = this._getPrefValue(id, false, true);
		/***
		if (id == ZmSetting.SHOW_FRAGMENTS && !this._appCtxt.get(ZmSetting.CONVERSATIONS_ENABLED)) {
			setup.displayName = ZmMsg.showFragmentsMsg;
		}
		/***/
		// we only show this one if it's false
		if ((id == ZmSetting.GAL_AUTOCOMPLETE_SESSION) && value) {
			continue;
		}

		this._prefPresent[id] = true;
		DBG.println(AjxDebug.DBG3, "adding pref " + pref.name + " / " + value);

		var type = setup ? setup.displayContainer : null;
		if (type == ZmPref.TYPE_CUSTOM) {
			var control = this._setupCustom(id, setup, value);
			control.replaceElement(elem);
			continue;
		}

		if (type == ZmPref.TYPE_SELECT) {
			var select = this._setupSelect(id, setup, value);
			select.replaceElement(elem);
			continue;
		}

		if (type == ZmPref.TYPE_RADIO_GROUP) {
			var radio = this._setupRadioGroup(id, setup, value);
			radio.replaceElement(elem);
			continue;
		}

		if (type == ZmPref.TYPE_CHECKBOX) {
			var checkbox = this._setupCheckbox(id, setup, value);
			checkbox.replaceElement(elem);
			continue;
		}

		if (type == ZmPref.TYPE_INPUT) {
			var input = this._setupInput(id, setup, value);
			input.replaceElement(elem);
			continue;
		}

		if (type == ZmPref.TYPE_COLOR) {
			var control = this._setupColor(id, setup, value);
			control.replaceElement(elem);
			continue;
		}

        if (type == ZmPref.TYPE_LOCALES) {
            var control = this._setupLocales(id, setup, value);
            control.replaceElement(elem);
            continue;
        }

		var html = [];
		var j = 0;
		var buttonId;
		var prefId = ZmPref.KEY_ID + id;
		if (type == ZmPref.TYPE_TEXTAREA) {
			html[j++] = "<textarea id='";
			html[j++] = prefId;
			html[j++] = "' ";
			html[j++] = "wrap='on' style='width:402' rows='4' cols='60'>";
			html[j++] = value;
			html[j++] = "</textarea>";
        }
        else if (type == ZmPref.TYPE_PASSWORD ||
				 type == ZmPref.TYPE_IMPORT ||
				 type == ZmPref.TYPE_EXPORT) {
			buttonId = Dwt.getNextId();
			html[j++] = "<div id='";
			html[j++] = buttonId;
			html[j++] = "'></div>";
		}
		else {
			continue;
		}

		elem.innerHTML = html.join("");

		if (type == ZmPref.TYPE_PASSWORD) {
			this._addButton(buttonId, setup.displayName, 50, new AjxListener(this, this._changePasswordListener));
		}
		else if (type == ZmPref.TYPE_IMPORT) {
			this._importDiv = document.getElementById(buttonId);
			if (this._importDiv) {
				this._addImportWidgets(this._importDiv, id, setup);
			}
		}
		else if (type == ZmPref.TYPE_EXPORT) {
			var label = setup.displayName || ZmMsg._export;
			var btn = this._addButton(buttonId, label, 110, new AjxListener(this, this._exportButtonListener));
			btn.setData(Dwt.KEY_ID, id);
		}
	}

	var elem = document.getElementById([this._htmlElId,"DEFAULTS_RESTORE"].join("_"));
	if (elem) {
		var button = this._addButton(this._resetId, ZmMsg.restoreDefaults, 110, new AjxListener(this, this._resetListener));
		button.replaceElement(elem);
	}

	this.setVisible(true);
	this._hasRendered = true;
};

ZmPreferencesPage.prototype.setFormObject = function(id, object) {
	this._dwtObjects[id] = object;
};

ZmPreferencesPage.prototype.getFormObject = function(id) {
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
	if (type == ZmPref.TYPE_SELECT || type == ZmPref.TYPE_CHECKBOX ||
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
			else {
				value = object.getValue();
			}
		}
		// TODO: user valueFunction
		if (id == ZmSetting.POLLING_INTERVAL) {
			value = value * 60; // convert minutes to seconds
		}
	}
	else {
		var prefId = ZmPref.KEY_ID + id;
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
ZmPreferencesPage.prototype.setFormValue = function(id, value, setup, control) {
	setup = setup || ZmPref.SETUP[id];
	value = setup && setup.displayFunction ? setup.displayFunction(value) : value;
	var type = setup ? setup.displayContainer : null;
	if (type == ZmPref.TYPE_SELECT || type == ZmPref.TYPE_CHECKBOX ||
		type == ZmPref.TYPE_RADIO_GROUP ||
		type == ZmPref.TYPE_COLOR) {
		var object = control || this.getFormObject(id);
		if (!object) return;

		if (type == ZmPref.TYPE_COLOR) {
			object.setColor(value);
		}
		else if (type == ZmPref.TYPE_CHECKBOX) {
			object.setSelected(value);
		}
		else if (type == ZmPref.TYPE_RADIO_GROUP) {
			object.setSelectedValue(value);
		}
		else {
			var curValue = object.getValue();
			if (value != null && (curValue != value))
				object.setSelectedValue(value);
		}
	}
	else if (type == ZmPref.TYPE_INPUT) {
		var object = control || this.getFormObject(id);
		if (!object) return;

		var curValue = object.getValue();
		if (value != null && (curValue != value))
			object.setValue(value);
	}
	else if (type == ZmPref.TYPE_LOCALES) {
		if (this._localeMap) {
			var button = this._dwtObjects[ZmSetting.LOCALE_NAME];
			this._showLocale(value, button);
		}
	}
	else {
		var element = control || document.getElementById((ZmPref.KEY_ID + id));
		if (!element || element.value == value) return;

		element.value = value || "";
	}
};

ZmPreferencesPage.prototype.getTitle =
function() {
	return this._title;
};

/**
* Resets the form fields to the prefs' current values.
*
* @param useDefaults	[boolean]	if true, fields are reset to prefs' default values
*/
ZmPreferencesPage.prototype.reset =
function(useDefaults) {
	var settings = this._appCtxt.getSettings();
	var prefs = this._section.prefs || [];
	for (var i = 0; i < prefs.length; i++) {
		var id = prefs[i];
		if (!id) { continue; }
		var setup = ZmPref.SETUP[id];
		if (!setup) { continue; }
		var type = setup.displayContainer;
		if (type == ZmPref.TYPE_PASSWORD) { continue; } // ignore non-form elements
		var pref = settings.getSetting(id);
		var newValue = this._getPrefValue(id, useDefaults, true);
		this.setFormValue(id, newValue);
	}
};

//
// Protected methods
//

ZmPreferencesPage.prototype._createPageHtml = function(templateId, data) {
	this.getContentHtmlElement().innerHTML = AjxTemplate.expand(templateId, data);
};

/*
* Returns the value of the specified pref, massaging it if necessary.
*
* @param id			[constant]		pref ID
* @param useDefault	[boolean]		if true, use pref's default value
* @param convert	[boolean]		if true, convert value to user-visible form
*/
ZmPreferencesPage.prototype._getPrefValue =
function(id, useDefault, convert) {
	var value = null;
	var pref = this._appCtxt.getSettings().getSetting(id);
	var value = useDefault ? pref.getDefaultValue() : pref.getValue();
	if (convert) {
		// TODO: user displayFunction
		if (id == ZmSetting.POLLING_INTERVAL) {
			value = parseInt(value / 60); // setting stored as seconds, displayed as minutes
		}
	}

	return value;
};

// Add a button to the preferences page
ZmPreferencesPage.prototype._addButton =
function(parentId, text, width, listener) {
	var button = new DwtButton(this);
	button.setSize(width, Dwt.DEFAULT);
	button.setText(text);
	button.addSelectionListener(listener);
	button.appendElement(parentId);
	return button;
};

ZmPreferencesPage.prototype._setupStatic = function(id, setup, value) {
	var text = new DwtText(this);
	this.setFormObject(id, text);
	text.setText(value);
	return text;
};

ZmPreferencesPage.prototype._setupSelect =
function(id, setup, value) {
	if (setup.approximateFunction) {
		value = setup.approximateFunction(value);
	}

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

ZmPreferencesPage.prototype._setupRadioGroup =
function(id, setup, value) {
	if (setup.approximateFunction) {
		value = setup.approximateFunction(value);
	}

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
	var checkbox = new DwtCheckbox(this, null, null, value);
	this.setFormObject(id, checkbox);
	var cboxLabel = ZmPreferencesPage.__formatLabel(setup.displayName, value);
	checkbox.setText(cboxLabel);
	checkbox.setSelected(value);
	return checkbox;
};

ZmPreferencesPage.prototype._setupInput =
function(id, setup, value) {
	var input = new DwtInputField({parent: this, type: DwtInputField.STRING, initialValue: value, size: 40});
	this.setFormObject(id, input);
	return input;
};

ZmPreferencesPage.prototype._addImportWidgets =
function(buttonDiv, settingId, setup) {
	var uri = this._appCtxt.get(ZmSetting.CSFE_UPLOAD_URI);

	var importDivId = this._htmlElId+"_import";
	var isAddrBookImport = settingId == ZmSetting.IMPORT; 
	var data = {
		id: importDivId,
		action: uri,
		name: ZmPreferencesPage.IMPORT_FIELD_NAME,
		label: isAddrBookImport ? ZmMsg.importFromCSVLabel : ZmMsg.importFromICSLabel
	};
	buttonDiv.innerHTML = AjxTemplate.expand("zimbraMail.prefs.templates.Pages#Import", data);

	this._uploadFormId = importDivId+"_form";
	this._attInputId = importDivId+"_input";

	buttonDiv = document.getElementById(importDivId+"_button"); 

	// set up import button
	var btnLabel = setup ? setup.displayName : ZmMsg._import;
	this._importBtn = this._addButton(buttonDiv.id, btnLabel, 100, new AjxListener(this, this._importButtonListener));
	if (settingId) {
		this._importBtn.setData(Dwt.KEY_ID, settingId);
	}
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
	alert("TODO: override ZmPreferences#_setupCustom");
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
    var locales = this._appCtxt.get(ZmSetting.LOCALES);
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

// Popup the change password dialog.
ZmPreferencesPage.prototype._changePasswordListener =
function(ev) {
	var args = "height=465,width=705,location=no,menubar=no,resizable=yes,scrollbars=no,status=yes,toolbar=no";
	var proto = this._appCtxt.get(ZmSetting.PROTOCOL_MODE);
	proto = (proto == ZmSetting.PROTO_MIXED) ? ZmSetting.PROTO_HTTPS : ZmSetting.PROTO_HTTP;
	var url = AjxUtil.formatUrl({protocol:proto, path:"/zimbra/h/changepass", qsReset:true});
	window.open(url, "_blank", args);
};

ZmPreferencesPage.prototype._exportButtonListener =
function(ev) {
	var settingId = ev.dwtObj.getData(Dwt.KEY_ID);

	var dialog = this._appCtxt.getChooseFolderDialog();
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
		AjxDispatcher.require(["CalendarCore", "Calendar"]);
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
		var dialog = this._appCtxt.getChooseFolderDialog();
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
		var um = this._appCtxt.getUploadManager();
		window._uploadManager = um;
		um.execute(callback, document.getElementById(this._uploadFormId));
	}
};

ZmPreferencesPage.prototype._importDoneCallback =
function(folderId, status, aid) {
	var appCtlr = this._appCtxt.getAppController();
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
		this._appCtxt.getAppController().sendRequest({soapDoc:soapDoc, asyncMode:true,
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
	this._appCtxt.getAppController().setStatusMsg(msg);
	this._importBtn.setEnabled(true);
};

ZmPreferencesPage.prototype._handleErrorFinishImport =
function(ex) {
	this._importBtn.setEnabled(true);

	if (ex.code == ZmCsfeException.MAIL_UNABLE_TO_IMPORT_CONTACTS ||
		ex.code == ZmCsfeException.MAIL_UNABLE_TO_IMPORT_APPOINTMENTS)
	{
		var errDialog = this._appCtxt.getErrorDialog();
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
		var uri = [location.protocol, "//", document.domain, portPrefix, "/service/home/~/", folder.name, "?auth=co&fmt=", format].join("");
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
	this._appCtxt.setStatusMsg(ZmMsg.defaultsRestored);
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
		if (this._controller.checkPreCondition(ZmPref.SETUP[prefId])) {
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
ZmPreferencesPage.__formatLabel = function(prefLabel, prefValue) {
	prefLabel = prefLabel || "";
	return prefLabel.match(/\{/) ? AjxMessageFormat.format(prefLabel, prefValue) : prefLabel;
};


