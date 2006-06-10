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
* @param view				[constant]					which page we are
* @param controller			[ZmPrefController]			prefs controller
* @param passwordDialog		[ZmChangePasswordDialog]	change password dialog
*/
function ZmPreferencesPage(parent, appCtxt, view, controller, passwordDialog) {

	DwtTabViewPage.call(this, parent, "ZmPreferencesPage");
	
	this._appCtxt = appCtxt;
	this._view = view; // which preferences page we are
	this._controller = controller;
	this._passwordDialog = passwordDialog;
	this._title = [ZmMsg.zimbraTitle, ZmMsg.options, ZmPrefView.TAB_NAME[view]].join(": ");

	this._dwtObjects = {};
	this._createHtml();
	this._rendered = false;
	this._hasRendered = false;
};

ZmPreferencesPage.prototype = new DwtTabViewPage;
ZmPreferencesPage.prototype.constructor = ZmPreferencesPage;

ZmPreferencesPage.IMPORT_FIELD_NAME = "importUpload";
ZmPreferencesPage.IMPORT_TIMEOUT = 300;

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
	this._controller._resetOperations(this._controller._toolbar, this._view);
	if (this._hasRendered) return;

	DBG.println(AjxDebug.DBG2, "rendering preferences page " + this._view);

	var prefs = ZmPrefView.PREFS[this._view];
	var settings = this._appCtxt.getSettings();
	for (var i = 0; i < prefs.length; i++) {
		var id = prefs[i];
		var pref = settings.getSetting(id);

		var setup = ZmPref.SETUP[id];
		var pre = setup.precondition;
		if (pre && !(this._appCtxt.get(pre))) continue;
		
		if (setup.loadFunction) {
			setup.loadFunction(this._appCtxt, setup);
			if (setup.options.length <= 1) {
				continue;
			}
		}

		// save the current value (for checking later if it changed)
		pref.origValue = this._getPrefValue(id);
		var value = this._getPrefValue(id, false, true);
		if (id == ZmSetting.SHOW_FRAGMENTS && !this._appCtxt.get(ZmSetting.CONVERSATIONS_ENABLED))
			setup.displayName = ZmMsg.showFragmentsMsg;
		// bug fix #4519 - only show html font settings if html compose is enabled
		if (id == ZmSetting.COMPOSE_INIT_FONT_FAMILY && !this._appCtxt.get(ZmSetting.HTML_COMPOSE_ENABLED))
			continue;
		DBG.println(AjxDebug.DBG3, "adding pref " + pref.name + " / " + value);

		var type = setup ? setup.displayContainer : null;
		if (type == ZmPref.TYPE_SELECT) {
			var div = this._setupSelect(id, setup, value);
			this._createRow(setup.displayName, div, setup.displaySeparator);
		} else if (type == ZmPref.TYPE_INPUT) {
			var div = this._setupInput(id, setup, value);
			this._createRow(setup.displayName, div, setup.displaySeparator);
		} else {
			var html = [];
			var j = 0;
			var buttonId;
			var prefId = ZmPref.KEY_ID + id;
			if (type == ZmPref.TYPE_CHECKBOX) {
				var checked = value ? "checked " : "";
				html[j++] = "<input id='";
				html[j++] = prefId;
				html[j++] = "' ";
				html[j++] = checked;
				html[j++] = "type='checkbox'/>";
			} else if (type == ZmPref.TYPE_TEXTAREA) {
				html[j++] = "<textarea id='";
				html[j++] = prefId;
				html[j++] = "' ";
				html[j++] = "wrap='on' style='width:402' rows='4' cols='60'>";
				html[j++] = value;
				html[j++] = "</textarea>";
			} else if (type == ZmPref.TYPE_PASSWORD || type == ZmPref.TYPE_FONT ||
					   type == ZmPref.TYPE_IMPORT || type == ZmPref.TYPE_EXPORT) {
				if (id == ZmSetting.COMPOSE_INIT_FONT_SIZE)
					continue;
				buttonId = Dwt.getNextId();
				html[j++] = "<div id='";
				html[j++] = buttonId;
				html[j++] = "'></div>";
			} else {
				continue;
			}
			this._createRow(setup.displayName, html.join(""), setup.displaySeparator);
			if (type == ZmPref.TYPE_PASSWORD) {
				this._addButton(buttonId, ZmMsg.change, 50,	new AjxListener(this, this._changePasswordListener));
			} else if (type == ZmPref.TYPE_IMPORT) {
				this._importDiv = document.getElementById(buttonId);
				this._addImportWidgets(this._importDiv);
			} else if (type == ZmPref.TYPE_EXPORT) {
				this._addButton(buttonId, ZmMsg._export, 65, new AjxListener(this, this._exportContactsListener));
			} else if (type == ZmPref.TYPE_FONT && this._appCtxt.get(ZmSetting.HTML_COMPOSE_ENABLED)) {	
				this._fontDiv = document.getElementById(buttonId);
				var fontSizeValue = settings.getSetting(ZmSetting.COMPOSE_INIT_FONT_SIZE).getValue();
				this._addFontPrefs(this._fontDiv, id, setup, value, fontSizeValue);
			}
		}
	}
	this._addButton(this._resetId, ZmMsg.restoreDefaults, 100, new AjxListener(this, this._resetListener));
	this._hasRendered = true;
};

ZmPreferencesPage.prototype.getFormValue =
function(id) {
	var value = null;
	var setup = ZmPref.SETUP[id];
	var type = setup ? setup.displayContainer : null;
	if (type == ZmPref.TYPE_SELECT || type == ZmPref.TYPE_INPUT || type == ZmPref.TYPE_FONT) {
		var object = this._dwtObjects[id];
		if (object)
			value = object.getValue();
		if (id == ZmSetting.POLLING_INTERVAL)
			value = value * 60; // convert minutes to seconds
	} else {
		var prefId = ZmPref.KEY_ID + id;
		var element = document.getElementById(prefId);
		if (!element) return null;
		if (type == ZmPref.TYPE_CHECKBOX) {
			value = element.checked;
			if (id == ZmSetting.SIGNATURE_STYLE)
				value = value ? ZmSetting.SIG_INTERNET : ZmSetting.SIG_OUTLOOK;
		} else {
			value = element.value;
		}
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
	var prefs = ZmPrefView.PREFS[this._view];
	for (var i = 0; i < prefs.length; i++) {
		var id = prefs[i];
		var setup = ZmPref.SETUP[id];
		var type = setup.displayContainer;
		if (type == ZmPref.TYPE_PASSWORD) continue; // ignore non-form elements
		var pref = settings.getSetting(id);
		var newValue = this._getPrefValue(id, useDefaults, true);
		if (type == ZmPref.TYPE_SELECT || type == ZmPref.TYPE_FONT) {
			var input = this._dwtObjects[id];
			if (!input) continue;
			
			var curValue = input.getValue();
			if (newValue != null && (curValue != newValue))
				this._dwtObjects[id].setSelectedValue(newValue);
		} else if (type == ZmPref.TYPE_INPUT) {
			var input = this._dwtObjects[id];
			if (!input) continue;
			
			var curValue = this._dwtObjects[id].getValue();
			if (newValue != null && (curValue != newValue))
				this._dwtObjects[id].setValue(newValue);
		} else {
			var element = document.getElementById((ZmPref.KEY_ID + id));
			if (!element || element.value == newValue) continue;

			if (type == ZmPref.TYPE_CHECKBOX) {
				element.checked = newValue ? true : false;
			} else {
				if (newValue == null) newValue = "";
				element.value = newValue;
				// XXX: nicer way to do this? do something special for font color
				if (id == ZmSetting.COMPOSE_INIT_FONT_COLOR) {
					var colorBox = document.getElementById(this._defaultFontColorId);
					if (colorBox)
						colorBox.style.backgroundColor = newValue;
				}
			}
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
		if (id == ZmSetting.SIGNATURE_STYLE)
			value = (value == ZmSetting.SIG_INTERNET);
		if (id == ZmSetting.POLLING_INTERVAL)
			value = parseInt(value / 60); // setting stored as seconds, displayed as minutes
	}

	return value;
};

// Creates a table that we can later add preference rows to, and a placeholder DIV for
// the reset button.
ZmPreferencesPage.prototype._createHtml =
function() {
	var html = new Array();
	var i = 0;
	var tableId = Dwt.getNextId();
	this._resetId = Dwt.getNextId();
	
	html[i++] = "<div class='TitleBar'>";
	html[i++] = "<table id='" + tableId + "' cellpadding=0 cellspacing=5 class='prefTable'>";
	html[i++] = "</table></div>";
	html[i++] = "<div id='" + this._resetId + "' style='padding-left:5px'></div>";
	this.getHtmlElement().innerHTML = html.join("");
	
	this._table = document.getElementById(tableId);
};

// Add a row to the table for the given preference.
ZmPreferencesPage.prototype._createRow =
function(label, content, addSep) {
	var tr = this._table.insertRow(-1);
	tr.id = Dwt.getNextId();
	tr.valign = "top";
	var cell1 = tr.insertCell(0);
	cell1.className = "prefLabel";
	cell1.innerHTML = AjxStringUtil.htmlEncode(label + ":");

	var cell2 = tr.insertCell(1);
	cell2.className = "prefContent";
	if (typeof (content) == 'string'){
		cell2.innerHTML = content;
	} else if (typeof (content) == 'object'){
		cell2.appendChild(content);
	}

	var cell3 = tr.insertCell(2);
	cell3.innerHTML = "<div>&nbsp;</div>";
    
	if (addSep) {
		var sepTr = this._table.insertRow(-1);
		var sepCell = sepTr.insertCell(0);
		sepCell.colSpan = "3";
		sepCell.innerHTML = "<div class='horizSep'></div>";
	}

	return tr;
};

// Add a button to the preferences page
ZmPreferencesPage.prototype._addButton =
function(parentId, text, width, listener) {
	var button = new DwtButton(this);
	button.setSize(width, Dwt.DEFAULT);
	button.setText(text);
	button.addSelectionListener(listener);
	var element = button.getHtmlElement();
	element.parentNode.removeChild(element);
	var parent = document.getElementById(parentId);
	parent.appendChild(element);
	return button;
};

ZmPreferencesPage.prototype._setupSelect = 
function(id, setup, value) {
	var selObj = new DwtSelect(this);
	this._dwtObjects[id] = selObj;

	var options;
	if (setup.options || setup.displayOptions) {
		options = setup.options || setup.displayOptions;
		for (var j = 0; j < options.length; j++) {
			var data = new DwtSelectOptionData(options[j], setup.displayOptions[j], false);
			selObj.addOption(data);
		}
	} else {
		options = setup.choices;
		for (var j = 0; j < options.length; j++) {
			var data = new DwtSelectOptionData(options[j].value, options[j].label, false);
			selObj.addOption(data);
		}
	}

	selObj.setName(id);
	selObj.setSelectedValue(value);
	
	var div = document.createElement("div");
	div.appendChild(selObj.getHtmlElement());
	
	return div;
};

ZmPreferencesPage.prototype._setupInput = 
function(id, setup, value) {
	var input = new DwtInputField({parent: this, type: DwtInputField.STRING, initialValue: value, size: 40});
	this._dwtObjects[id] = input;

	var div = document.createElement("div");
	div.appendChild(input.getHtmlElement());
	
	return div;
};

ZmPreferencesPage.prototype._addImportWidgets = 
function(buttonDiv) {
	this._uploadFormId = Dwt.getNextId();
	this._attInputId = Dwt.getNextId();

	var uri = location.protocol + "//" + document.domain + this._appCtxt.get(ZmSetting.CSFE_UPLOAD_URI);
	
	var html = new Array();
	var idx = 0;
	html[idx++] = "<form style='margin: 0px; padding: 0px;' method='POST' action='" + uri + "' id='" + this._uploadFormId + "' enctype='multipart/form-data'>";
	html[idx++] = "<input style='font-family:Tahoma; font-size:10px' name='" + ZmPreferencesPage.IMPORT_FIELD_NAME + "' type='file' id='" + this._attInputId + "'>";
	html[idx++] = "</form>";

	var div = document.createElement("div");
	div.innerHTML = html.join("");

	buttonDiv.appendChild(div);
	
	// set up import button
	this._importBtn = this._addButton(buttonDiv.id, ZmMsg._import, 65, new AjxListener(this, this._importContactsListener));
};

ZmPreferencesPage.prototype._addFontPrefs = 
function(fontDiv, id, setup, value, fontSizeValue) {
	var table = document.createElement("table");
	table.border = table.cellPadding = table.cellSpacing = 0;
	var row = table.insertRow(-1);
	
	var fontFamilyCell = row.insertCell(-1);
	var sepCell1 = row.insertCell(-1);
	var fontSizeCell = row.insertCell(-1);
	var sepCell2 = row.insertCell(-1);
	var fontColorPickerCell = row.insertCell(-1);
	var sepCell3 = row.insertCell(-1);
	var fontColorCell = row.insertCell(-1);

	// get the Select options for font family
	var div = this._setupSelect(id, setup, value);
	fontFamilyCell.appendChild(div);

	// get the Select options for font size
	id = ZmSetting.COMPOSE_INIT_FONT_SIZE;
	setup = ZmPref.SETUP[id];
	var div = this._setupSelect(id, setup, fontSizeValue);
	fontSizeCell.appendChild(div);
	
	// add color picker
	var b = new DwtButton(this, null, "DwtSelect");
	b.setImage("FontColor");
	b.setToolTipContent(ZmMsg.fontColor);
	var m = new DwtMenu(b, DwtMenu.COLOR_PICKER_STYLE);
	var cp = new DwtColorPicker(m);
	cp.addSelectionListener(new AjxListener(this, this._fontColorListener));
	b.setMenu(m);
	fontColorPickerCell.style.width = "40px";
	fontColorPickerCell.appendChild(b.getHtmlElement());

	// add color box showing current color
	var defaultColor = this._appCtxt.get(ZmSetting.COMPOSE_INIT_FONT_COLOR);
	this._defaultFontColorId = Dwt.getNextId();
	fontColorCell.style.verticalAlign = "bottom";
	var html = new Array();
	var i = 0;
	html[i++] = "<div class='colorBox' id='";
	html[i++] = this._defaultFontColorId;
	html[i++] = "' style='background-color:";
	html[i++] = defaultColor;
	html[i++] = ";'></div>";
	html[i++] = "<input type='hidden' id='";
	html[i++] = ZmPref.KEY_ID + ZmSetting.COMPOSE_INIT_FONT_COLOR;
	html[i++] = "' value='";
	html[i++] = defaultColor
	html[i++] = "'>";
	fontColorCell.innerHTML = html.join("");
	
	// add separators
	sepCell1.innerHTML = sepCell2.innerHTML = sepCell3.innerHTML = "&nbsp;";

	fontDiv.appendChild(table);	
};

// Popup the change password dialog.
ZmPreferencesPage.prototype._changePasswordListener =
function(ev) {
	this._passwordDialog.popup();
};

ZmPreferencesPage.prototype._fontColorListener = 
function(ev) {
	var colorBox = document.getElementById(this._defaultFontColorId);
	if (colorBox) {
		colorBox.style.backgroundColor = ev.detail;
		var fontColorInputId = ZmPref.KEY_ID + ZmSetting.COMPOSE_INIT_FONT_COLOR;
		var input = document.getElementById(fontColorInputId);
		if (input)
			input.value = ev.detail;
	}
};

ZmPreferencesPage.prototype._exportContactsListener = 
function(ev) {
	var dialog = this._appCtxt.getChooseFolderDialog();
	dialog.reset();
	dialog.registerCallback(DwtDialog.OK_BUTTON, this._exportOkCallback, this, dialog);

	var omit = {};
	omit[ZmFolder.ID_TRASH] = true;

	dialog.popup([ZmOrganizer.ADDRBOOK], omit, ZmMsg.chooseFolderToExport);
};

ZmPreferencesPage.prototype._importContactsListener =
function(ev) {
	var fileInput = document.getElementById(this._attInputId);
	var val = fileInput ? AjxStringUtil.trim(fileInput.value) : null;

	if (val) {
		var callback = new AjxCallback(this, this._importDoneCallback);
		var um = this._appCtxt.getUploadManager();
		window._uploadManager = um;
		um.execute(callback, document.getElementById(this._uploadFormId));
	}
};

ZmPreferencesPage.prototype._importDoneCallback = 
function(status, aid) {

	var appCtlr = this._appCtxt.getAppController();
	
	if (status == 200) {
		this._importBtn.setEnabled(false);
		appCtlr.setStatusMsg(ZmMsg.importingContacts);
		this._finishImport(aid);
	} else {
		appCtlr.setStatusMsg(ZmMsg.errorImporting + " (" + status + ")", ZmStatusView.LEVEL_CRITICAL);
		// always re-render input file widget and its parent IFRAME
		this._importDiv.innerHTML = "";
		this._addImportWidgets(this._importDiv);
	}
};

ZmPreferencesPage.prototype._finishImport = 
function(aid) {
	// send the import request w/ the att Id to the server
	var soapDoc = AjxSoapDoc.create("ImportContactsRequest", "urn:zimbraMail");
	var method = soapDoc.getMethod();
	method.setAttribute("ct", "csv"); // always "csv" for now
	var content = soapDoc.set("content", "");
	content.setAttribute("aid", aid);
	
	var respCallback = new AjxCallback(this, this._handleResponseFinishImport, [aid]);
	var errorCallback = new AjxCallback(this, this._handleErrorFinishImport);
	this._appCtxt.getAppController().sendRequest({soapDoc:soapDoc, asyncMode:true,
												  callback:respCallback, errorCallback:errorCallback, 
												  timeout:ZmPreferencesPage.IMPORT_TIMEOUT});
};

ZmPreferencesPage.prototype._handleResponseFinishImport =
function(aid, result) {
	var resp = result.getResponse().ImportContactsResponse.cn[0];
	
	var msg = resp.n + " " + ZmMsg.contactsImported;
	var appCtlr = this._appCtxt.getAppController();
	appCtlr.setStatusMsg(msg);
		
	// always re-render input file widget and its parent IFRAME
	this._importDiv.innerHTML = "";
	this._addImportWidgets(this._importDiv);
};

ZmPreferencesPage.prototype._handleErrorFinishImport = 
function(ex) {
	this._importBtn.setEnabled(true);

	if (ex.code == ZmCsfeException.MAIL_UNABLE_TO_IMPORT_CONTACTS) {
		var errDialog = this._appCtxt.getErrorDialog();
		errDialog.setMessage(ex.getErrorMsg(), ex.msg, DwtMessageDialog.WARNING_STYLE);
		errDialog.popup();
		return true;
	}
	return false;
};

ZmPreferencesPage.prototype._exportOkCallback =
function(dialog, folder) {
	if (folder && folder.id) {
		var exportUrl = AjxMessageFormat.format(this._appCtxt.get(ZmSetting.CSFE_EXPORT_URI), folder.id);
		var uri = location.protocol + "//" + document.domain + exportUrl;
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
