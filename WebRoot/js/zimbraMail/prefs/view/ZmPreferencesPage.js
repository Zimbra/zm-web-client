/*
 * ***** BEGIN LICENSE BLOCK *****
 * Version: ZPL 1.1
 * 
 * The contents of this file are subject to the Zimbra Public License
 * Version 1.1 ("License"); you may not use this file except in
 * compliance with the License. You may obtain a copy of the License at
 * http://www.zimbra.com/license
 * 
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied. See
 * the License for the specific language governing rights and limitations
 * under the License.
 * 
 * The Original Code is: Zimbra Collaboration Suite.
 * 
 * The Initial Developer of the Original Code is Zimbra, Inc.
 * Portions created by Zimbra are Copyright (C) 2005 Zimbra, Inc.
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
* @author Enrique Del Campo
* @author Conrad Damon
* @param parent				the containing widget
* @param app				the preferences app
* @param view				which page we are (eg mail or contacts)
* @param passwordDialog		a ZmChangePasswordDialog
*/
function ZmPreferencesPage(parent, app, view, passwordDialog) {

	if (arguments.length == 0) return;
	DwtTabViewPage.call(this, parent, "ZmPreferencesPage");
	
	this._appCtxt = app._appCtxt;
	this._view = view; // which preferences page we are
	this._passwordDialog = passwordDialog;
	this._title = [ZmMsg.zimbraTitle, ZmMsg.options, ZmPrefView.TAB_NAME[view]].join(": ");

	this.selects = new Object();
	this._createHtml();
	this._rendered = false;
};

ZmPreferencesPage.prototype = new DwtTabViewPage;
ZmPreferencesPage.prototype.constructor = ZmPreferencesPage;

ZmPreferencesPage.IMPORT_FIELD_NAME = "importUpload";

ZmPreferencesPage.prototype.hasRendered =
function () {
	return this._rendered;
};

/**
* Fills the page with preferences that belong to this page, if that hasn't been done
* already. Note that this is an override of DwtTabViewPage.showMe(), so that it's
* called only when the tab is selected and the page becomes visible.
*/
ZmPreferencesPage.prototype.showMe =
function() {
	Dwt.setTitle(this._title);
	if (this._rendered) return;
	DBG.println(AjxDebug.DBG2, "rendering preferences page " + this._view);

	var prefs = ZmPrefView.PREFS[this._view];
	var settings = this._appCtxt.getSettings();
	for (var i = 0; i < prefs.length; i++) {
		var id = prefs[i];
		var pref = settings.getSetting(id);

		var setup = ZmPref.SETUP[id];
		var pre = setup.precondition;
		if (pre && !(this._appCtxt.get(pre)))
			continue;		

		// save the current value (for checking later if it changed)
		var value = pref.origValue = pref.getValue();
		if (id == ZmSetting.SIGNATURE_STYLE)
			value = (value == ZmSetting.SIG_INTERNET);
		if (id == ZmSetting.POLLING_INTERVAL)
			value = parseInt(value / 60); // setting stored as seconds, displayed as minutes
		if (id == ZmSetting.SHOW_FRAGMENTS && !this._appCtxt.get(ZmSetting.CONVERSATIONS_ENABLED))
			setup.displayName = ZmMsg.showFragmentsMsg;
		DBG.println(AjxDebug.DBG3, "adding pref " + pref.name + " / " + value);

		var type = setup ? setup.displayContainer : null;
		if (type == "select") {
			var div = this._setupSelect(id, setup, value);
			this._createRow(setup.displayName, div, setup.displaySeparator);
		} else {
			var html = new Array();
			var j = 0;
			var buttonId;
			var prefId = ZmPref.KEY_ID + id;
			if (type == "checkbox") {
				var checked = value ? "checked " : "";
				html[j++] = "<input id='";
				html[j++] = prefId;
				html[j++] = "' ";
				html[j++] = checked;
				html[j++] = "type='checkbox'/>";
			} else if (type == "input") {
				html[j++] = "<input id='";
				html[j++] = prefId;
				html[j++] = "' ";
				html[j++] = "type='text' value='";
				html[j++] = value;
				html[j++] = "' size=30></input>";
			} else if (type == "textarea") {
				html[j++] = "<textarea id='";
				html[j++] = prefId;
				html[j++] = "' ";
				html[j++] = "wrap='on' style='width:402' rows='4' cols='60'>";
				html[j++] = value;
				html[j++] = "</textarea>";
			} else if (type == "x_password" || type == "import" || type == "export" || type == "font") {
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
			if (type == "x_password") {
				this._addButton(buttonId, ZmMsg.change, 50,	new AjxListener(this, this._changePasswordListener));
			} else if (type == "import") {
				this._importDiv = document.getElementById(buttonId);
				this._addImportWidgets(this._importDiv);
			} else if (type == "export") {
				this._addButton(buttonId, ZmMsg._export, 65, new AjxListener(this, this._exportContactsListener));
			} else if (type == "font") {	
				this._fontDiv = document.getElementById(buttonId);
				var fontSizeValue = settings.getSetting(ZmSetting.COMPOSE_INIT_FONT_SIZE).getValue();
				this._addFontPrefs(this._fontDiv, id, setup, value, fontSizeValue);
			}
		}
	}
	this._addButton(this._resetId, ZmMsg.restoreDefaults, 100, new AjxListener(this, this._resetListener));
	this._rendered = true;
};

ZmPreferencesPage.prototype.getTitle =
function() {
	return this._title;
}

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
}

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
}

ZmPreferencesPage.prototype._setupSelect = 
function(id, setup, value) {
	var selObj = new DwtSelect(this);
	this.selects[id] = selObj;

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
}

ZmPreferencesPage.prototype._addImportWidgets = 
function(buttonDiv) {
	this._uploadFormId = Dwt.getNextId();
	this._attInputId = Dwt.getNextId();

	var uri = location.protocol + "//" + document.domain + this._appCtxt.get(ZmSetting.CSFE_UPLOAD_URI);
	
	// set up iframe
	var iframe = this._importIframe = document.createElement('iframe');
	iframe.id = this._iframeId = iframe.name = Dwt.getNextId();
	iframe.frameBorder = iframe.vspace = iframe.hspace = iframe.marginWidth = iframe.marginHeight = 0;
	iframe.width = "100%";
	iframe.scrolling = "no";
	iframe.style.overflowX = iframe.style.overflowY = "visible";
	iframe.style.height = "20px";
	buttonDiv.appendChild(iframe);
	
	// set up import button
	this._importBtn = this._addButton(buttonDiv.id, ZmMsg._import, 65, new AjxListener(this, this._importContactsListener));

	// XXX: for some reason idoc is null in Safari :(
	var idoc = Dwt.getIframeDoc(iframe);
	if (idoc) {
		idoc.open();
		var html = new Array();
		var idx = 0;
		html[idx++] = "<html><head></head><body scroll=no bgcolor='#EEEEEE'>";
		html[idx++] = "<form style='margin: 0px; padding: 0px;' method='POST' action='" + uri + "' id='" + this._uploadFormId + "' enctype='multipart/form-data'>";
		html[idx++] = "<input style='font-family:Tahoma; font-size:10px' name='" + ZmPreferencesPage.IMPORT_FIELD_NAME + "' type='file' id='" + this._attInputId + "'>";
		html[idx++] = "</form>";
		html[idx++] = "</body></html>";
		idoc.write(html.join(""));
		idoc.close();
	}
}

ZmPreferencesPage.prototype._addFontPrefs = 
function(fontDiv, id, setup, value, fontSizeValue) {
	var doc = this.getDocument();
	var table = doc.createElement("table");
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
}

// Popup the change password dialog.
ZmPreferencesPage.prototype._changePasswordListener =
function(ev) {
	this._passwordDialog.popup();
}

ZmPreferencesPage.prototype._fontColorListener = 
function(ev) {
	var colorBox = Dwt.getDomObj(this.getDocument(), this._defaultFontColorId);
	if (colorBox) {
		colorBox.style.backgroundColor = ev.detail;
		var fontColorInputId = ZmPref.KEY_ID + ZmSetting.COMPOSE_INIT_FONT_COLOR;
		var input = Dwt.getDomObj(this.getDocument(), fontColorInputId);
		if (input)
			input.value = ev.detail;
	}
}

ZmPreferencesPage.prototype._exportContactsListener = 
function(ev) {
	var uri = location.protocol + "//" + document.domain + this._appCtxt.get(ZmSetting.CSFE_EXPORT_URI);
	window.open(uri, "_blank");
}

ZmPreferencesPage.prototype._importContactsListener =
function(ev) {
	var idoc = Dwt.getIframeDoc(this._importIframe);
	var fileInput = idoc.getElementById(this._attInputId);
	var val = fileInput ? AjxStringUtil.trim(fileInput.value) : null;
	
	// TODO - test val against regex for valid .csv filename
	
	if (val) {
		var callback = new AjxCallback(this, this._importDoneCallback);
		var um = this._appCtxt.getUploadManager();
		window._uploadManager = um;
		um.execute(this._importIframe, callback, this._uploadFormId);
	} else {
		// TODO - show error message in app controller's status window
	}
}

ZmPreferencesPage.prototype._importDoneCallback = 
function(args) {

	var appCtrlr = this._appCtxt.getAppController();
	
	var status = args[0];
	if (status == 200) {
		this._importBtn.setEnabled(false);
		this._importIframe.style.visibility = "hidden";
		appCtrlr.setStatusMsg(ZmMsg.importingContacts);
		// we have to schedule the rest since it freezes the UI (and status never gets set)
		appCtrlr._schedule(ZmPreferencesPage._finishImport, {aid: args[1], prefPage: this});
	} else {
		appCtrlr.setStatusMsg(ZmMsg.errorImporting + " (" + status + ")", ZmStatusView.LEVEL_CRITICAL);
		// always re-render input file widget and its parent IFRAME
		this._importDiv.innerHTML = "";
		this._addImportWidgets(this._importDiv);
	}
}

ZmPreferencesPage._finishImport = 
function(params) {

	var appCtrlr = this._appCtxt.getAppController();

	// send the import request w/ the att Id to the server
	var soapDoc = AjxSoapDoc.create("ImportContactsRequest", "urn:zimbraMail");
	var method = soapDoc.getMethod();
	method.setAttribute("ct", "csv"); // always "csv" for now
	var content = soapDoc.set("content", "");
	content.setAttribute("aid", params.aid);
	
	var resp = appCtrlr.sendRequest(soapDoc).ImportContactsResponse.cn[0];
	
	var msg = resp.n + " " + ZmMsg.contactsImported;
	var msgDlg = this._appCtxt.getMsgDialog();
	msgDlg.setMessage(msg);
	msgDlg.popup();
		
	// always re-render input file widget and its parent IFRAME
	params.prefPage._importDiv.innerHTML = "";
	params.prefPage._addImportWidgets(params.prefPage._importDiv);
}

// Reset the form values to the pref defaults. Note that the pref defaults aren't the
// values that the user last had, they're the values that the prefs have before the
// user ever touches them.
ZmPreferencesPage.prototype._resetListener =
function(ev) {
	var settings = this._appCtxt.getSettings();
	var prefs = ZmPrefView.PREFS[this._view];
	for (var i = 0; i < prefs.length; i++) {
		var id = prefs[i];
		var setup = ZmPref.SETUP[id];
		var type = setup.displayContainer;
		if (type && type.indexOf("x_") == 0) // ignore non-form elements		
			continue;
		var pref = settings.getSetting(id);
		var defValue = pref.defaultValue;
		if (type == "select" || type == "font") {
			var curValue = this.selects[id].getValue();
			if (defValue != null && (curValue != defValue))
				this.selects[id].setSelectedValue(defValue);
		} else {
			var doc = this.getDocument();
			var element = Dwt.getDomObj(doc, (ZmPref.KEY_ID + id));

			if (!element || element.value == defValue)
				continue;

			if (type == "checkbox") {
				element.checked = defValue ? true : false;
			} else {
				if (defValue == null) defValue = "";
				element.value = defValue;
				// XXX: nicer way to do this? do something special for font color
				if (id == ZmSetting.COMPOSE_INIT_FONT_COLOR) {
					var colorBox = Dwt.getDomObj(doc, this._defaultFontColorId);
					if (colorBox)
						colorBox.style.backgroundColor = defValue;
				}
			}
		}
	}
	this._appCtxt.setStatusMsg(ZmMsg.defaultsRestored);
}
