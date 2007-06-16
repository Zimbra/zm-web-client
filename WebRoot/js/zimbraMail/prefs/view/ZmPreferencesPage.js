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

	DwtTabViewPage.call(this, parent, "ZmPreferencesPage");
	
	this._appCtxt = appCtxt;
	this._section = section;
	this._controller = controller;
	this._title = [ZmMsg.zimbraTitle, ZmMsg.options, section.title].join(": ");

	this._dwtObjects = {};
	this._createHtml();
	this._rendered = false;
	this._hasRendered = false;
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
	var data = { id: this._htmlElId };
	data.isEnabled = AjxCallback.simpleClosure(this._isEnabled, this, data);
	data.expandField = AjxCallback.simpleClosure(this._expandField, this, data);

	this.getContentHtmlElement().innerHTML = AjxTemplate.expand(templateId, data);

    // create controls for prefs, if present in template
	this._prefPresent = {};
	var prefs = this._section.prefs || [];
	var settings = this._appCtxt.getSettings();
	for (var i = 0; i < prefs.length; i++) {
		var id = prefs[i];
		var pref = settings.getSetting(id);

		// ignore if there is no container element
		var elem = document.getElementById([this._htmlElId, id].join("_"));
		if (!elem) {
//			console.warn("no such element: ", [this._htmlElId,id].join("_"));
			continue;
		}

		// ignore if doesn't meet pre-condition
        var setup = ZmPref.SETUP[id];
        if (!this.parent._checkPreCondition(setup.precondition)) {
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
		if (id == ZmSetting.SHOW_FRAGMENTS && !this._appCtxt.get(ZmSetting.CONVERSATIONS_ENABLED)) {
			setup.displayName = ZmMsg.showFragmentsMsg;
		}
		// we only show this one if it's false
		if ((id == ZmSetting.GAL_AUTOCOMPLETE_SESSION) && value) {
			continue;
		}

		this._prefPresent[id] = true;
		DBG.println(AjxDebug.DBG3, "adding pref " + pref.name + " / " + value);

		var type = setup ? setup.displayContainer : null;
		if (type == ZmPref.TYPE_SELECT) {
			var select = this._setupSelect(id, setup, value);
			select.replaceElement(elem);
		}
		else if (type == ZmPref.TYPE_RADIO_GROUP) {
			var radio = this._setupRadioGroup(id, setup, value);
			radio.replaceElement(elem);
		}
		else if (type == ZmPref.TYPE_CHECKBOX) {
			var checkbox = this._setupCheckbox(id, setup, value);
			checkbox.replaceElement(elem);
		}
		else if (type == ZmPref.TYPE_INPUT) {
			var input = this._setupInput(id, setup, value);
			input.replaceElement(elem);
		}
		else if (type == ZmPref.TYPE_COLOR) {
			var control = this._setupColor(id, setup, value);
			control.replaceElement(elem);
		}
		else {
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
				var btn = this._addButton(buttonId, label, 65, new AjxListener(this, this._exportButtonListener));
				btn.setData(Dwt.KEY_ID, id);
			}
		}
	}

	var elem = document.getElementById([this._htmlElId,"DEFAULTS_RESTORE"].join("_"));
	if (elem) {
		var button = this._addButton(this._resetId, ZmMsg.restoreDefaults, 100, new AjxListener(this, this._resetListener));
		button.replaceElement(elem);
	}

	this._hasRendered = true;
};

ZmPreferencesPage.prototype.getFormValue =
function(id) {
	var value = null;
	var setup = ZmPref.SETUP[id];
	var type = setup ? setup.displayContainer : null;
	if (type == ZmPref.TYPE_SELECT || type == ZmPref.TYPE_CHECKBOX ||
		type == ZmPref.TYPE_RADIO_GROUP ||
		type == ZmPref.TYPE_INPUT) {
		var object = this._dwtObjects[id];
		if (object) {
			if (id == ZmSetting.COMPOSE_INIT_FONT_COLOR) {
				value = object.getColor();
			}
			else if (type == ZmPref.TYPE_CHECKBOX) {
				value = object.isSelected();
			}
			else if (type == ZmPref.TYPE_RADIO_GROUP) {
				value = object.getSelectedValue();
			}
			else {
				value = object.getValue();
			}
		}
		if (id == ZmSetting.POLLING_INTERVAL) {
			value = value * 60; // convert minutes to seconds
		}
	} else {
		var prefId = ZmPref.KEY_ID + id;
		var element = document.getElementById(prefId);
		if (!element) return null;
		value = element.value;
	}
	return value;
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
		var setup = ZmPref.SETUP[id];
		var type = setup.displayContainer;
		if (type == ZmPref.TYPE_PASSWORD) continue; // ignore non-form elements
		var pref = settings.getSetting(id);
		var newValue = this._getPrefValue(id, useDefaults, true);
		if (type == ZmPref.TYPE_SELECT || type == ZmPref.TYPE_CHECKBOX ||
			type == ZmPref.TYPE_RADIO_GROUP ||
			type == ZmPref.TYPE_COLOR) {
			var obj = this._dwtObjects[id];
			if (!obj) continue;

			if (id == ZmSetting.COMPOSE_INIT_FONT_COLOR) {
				obj.setColor(newValue);
			}
			else if (type == ZmPref.TYPE_CHECKBOX) {
				obj.setSelected(newValue);
			}
			else if (type == ZmPref.TYPE_RADIO_GROUP) {
				obj.setSelectedValue(newValue);
			}
			else {
				var curValue = obj.getValue();
				if (newValue != null && (curValue != newValue))
					obj.setSelectedValue(newValue);
			}
		} else if (type == ZmPref.TYPE_INPUT) {
			var input = this._dwtObjects[id];
			if (!input) continue;

			var curValue = this._dwtObjects[id].getValue();
			if (newValue != null && (curValue != newValue))
				this._dwtObjects[id].setValue(newValue);
		} else {
			var element = document.getElementById((ZmPref.KEY_ID + id));
			if (!element || element.value == newValue) continue;
			if (newValue == null) newValue = "";
			element.value = newValue;
		}
	}
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
		if (id == ZmSetting.SIGNATURE_STYLE) {
			value = (value == ZmSetting.SIG_INTERNET);
		} else if (id == ZmSetting.POLLING_INTERVAL) {
			value = parseInt(value / 60); // setting stored as seconds, displayed as minutes
		}
	}

	return value;
};

// Creates a table that we can later add preference rows to, and a placeholder DIV for
// the reset button.
ZmPreferencesPage.prototype._createHtml =
function() {
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

ZmPreferencesPage.prototype._setupSelect =
function(id, setup, value) {
	/*** TODO
	if (id == ZmSetting.LOCALE_NAME) {
		var selObj = new ZmLocaleSelect(this, setup.choices);
		this._dwtObjects[id] = selObj;
		selObj.setSelectedValue(value);
		return selObj;
	}
	/***/

	if (setup.approximateFunction) {
		value = setup.approximateFunction(value);
	}

	var selObj = new DwtSelect(this);
	this._dwtObjects[id] = selObj;

	var options = setup.options || setup.displayOptions || setup.choices;
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

	var radioIds = {};
	var selectedId;
	for (var i = 0; i < options.length; i++) {
		var optValue = isChoices ? options[i].value : options[i];
		var optLabel = isChoices ? options[i].label : setup.displayOptions[i];
		optLabel = ZmPreferencesPage.__formatLabel(optLabel, optValue);
		var isSelected = value == optValue; 

		var radioBtn = new DwtRadioButton(container, null, id, isSelected);
		radioBtn.setText(optLabel);
		radioBtn.setValue(optValue);

		var radioId = radioBtn.getInputElement().id;
		radioIds[radioId] = optValue;
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
	this._dwtObjects[id] = new DwtRadioButtonGroup(radioIds, selectedId);

	return container;
};

ZmPreferencesPage.prototype._setupCheckbox =
function(id, setup, value) {
	var checkbox = new DwtCheckbox(this, null, null, value);
	this._dwtObjects[id] = checkbox;
	var cboxLabel = ZmPreferencesPage.__formatLabel(setup.displayName, value);
	checkbox.setText(cboxLabel);
	checkbox.setSelected(value);
	return checkbox;
};

ZmPreferencesPage.prototype._setupInput =
function(id, setup, value) {
	var input = new DwtInputField({parent: this, type: DwtInputField.STRING, initialValue: value, size: 40});
	this._dwtObjects[id] = input;
	return input;
};

ZmPreferencesPage.prototype._addImportWidgets =
function(buttonDiv, settingId, setup) {
	var uri = location.protocol + "//" + document.domain + this._appCtxt.get(ZmSetting.CSFE_UPLOAD_URI);

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
	this._importBtn = this._addButton(buttonDiv.id, btnLabel, 65, new AjxListener(this, this._importButtonListener));
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

	this._dwtObjects[id] = picker;

	return picker;
};

// Popup the change password dialog.
ZmPreferencesPage.prototype._changePasswordListener =
function(ev) {
	var passwordDialog = this._appCtxt.getChangePasswordDialog();
	passwordDialog.registerCallback(DwtDialog.OK_BUTTON, this._controller._changePassword, this._controller);
	passwordDialog.popup();
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
	var rootId = ZmOrganizer.getSystemId(this._appCtxt, ZmOrganizer.ID_ROOT);
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
	var rootId = ZmOrganizer.getSystemId(this._appCtxt, ZmOrganizer.ID_ROOT);
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
ZmPreferencesPage.prototype._isEnabled = function(data, prefId1 /* ..., prefIdN */) {
	for (var i = 1; i < arguments.length; i++) {
		var prefId = arguments[i];
		var pref = ZmPref.SETUP[prefId];
		if (!pref || this.parent._checkPreCondition(pref.precondition)) {
			return true;
		}
	}
	return false;
};

ZmPreferencesPage.prototype._expandField = function(data, prefId) {
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

/*** TODO ***
//
// Classes
//

ZmLocaleSelect = function(parent) {
	DwtButton.prototype.call(this, parent);

	// initialize global langs
	if (!ZmLocaleSelect._initialized) {
		ZmLocaleSelect._initialized = true;

		// gather hierarchy of locales
		var regex = new RegExp("_.*", "g");
		var locales = ZmAppCtxt.getFromShell(DwtShell.getShell(window)).get(ZmSetting.LOCALES);
		for (var i = 0; i < locales.length; i++) {
			var locale = locales[i];
			var id = locale.id;
			var name = locale.name;
			var lang = id.replace(regex,"");
			if (!ZmLocaleSelect._locales[lang]) {
				ZmLocaleSelect._locales[lang] = [];
			}
			ZmLocaleSelect._locales[lang].push(locale);
			ZmLocaleSelect._localeIdMap[id] = locale;
			ZmLocaleSelect._localeNameMap[name] = locale;
		}

		// collapse single item languages and sort
		var langlist = [];
		for (var lang in ZmLocaleSelect._locales) {
			var locales = ZmLocaleSelect._locales[lang];
			if (locales.length == 1) {
				ZmLocaleSelect._locales[lang] = locales[0];
				continue;
			}

		}
		ZmLocaleSelect._locales.sort(ZmLocaleSelect.__BY_NAME);

		// TODO
		// create menu
//		for (var i = 0; i < langlist.length; i++) {
//			var countries =
//		}
	}

	// set menu
	this.setMenu(ZmLocaleSelect._menu);
}
ZmLocaleSelect.prototype = new DwtButton;
ZmLocaleSelect.prototype.constructor = ZmLocaleSelect;

ZmLocaleSelect.prototype.toString = function() {
	return "ZmLocaleSelect";
};

// Constants

ZmLocaleSelect._locales = [];
ZmLocaleSelect._localeIdMap = {};
ZmLocaleSelect._localeNameMap = {};

// Data

ZmLocaleSelect.prototype.TEMPLATE = "DwtSelect";

// Public methods

ZmLocaleSelect.getNameFromId = function(id) {
	return ZmLocaleSelect._localeIdMap && ZmLocaleSelect._localeIdMap[id].name;
};

ZmLocaleSelect.getIdFromName = function(name) {
	return ZmLocaleSelect._localeNameMap && ZmLocaleSelect._localeNameMap[name].id;
};

ZmLocaleSelect.prototype.setSelectedValue = function(id) {
	var name = ZmLocaleSelect.getNameFromId(id);
	this.setText(name);
};

ZmLocaleSelect.prototype.getSelectedValue = function() {
	var name = this.getText();
	return ZmLocaleSelect.getIdFromName(name);
};

ZmLocaleSelect.__BY_NAME = function(a, b) {
	var aname = a.name;
	var bname = b.name;
	if (aname == bname) return 0;
	return aname < bname ? -1 : 1;
};
/***/