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
* @param passwordDialog		a LmChangePasswordDialog
*/
function LmPreferencesPage(parent, app, view, passwordDialog) {

	if (arguments.length == 0) return;
	DwtTabViewPage.call(this, parent, "LmPreferencesPage");
	
	this._appCtxt = app._appCtxt;
	this._view = view; // which preferences page we are
	this._passwordDialog = passwordDialog;
	this._title = [LmMsg.zimbraTitle, LmMsg.options, LmPrefView.TAB_NAME[view]].join(": ");

	this.selects = new Object();
	this._createHtml();
	this._rendered = false;
};

LmPreferencesPage.prototype = new DwtTabViewPage;
LmPreferencesPage.prototype.constructor = LmPreferencesPage;

LmPreferencesPage.IMPORT_FIELD_NAME = "importUpload";

LmPreferencesPage.prototype.hasRendered =
function () {
	return this._rendered;
};

/**
* Fills the page with preferences that belong to this page, if that hasn't been done
* already. Note that this is an override of DwtTabViewPage.showMe(), so that it's
* called only when the tab is selected and the page becomes visible.
*/
LmPreferencesPage.prototype.showMe =
function() {
	Dwt.setTitle(this._title);
	if (this._rendered) return;
	DBG.println(LsDebug.DBG2, "rendering preferences page " + this._view);

	var prefs = LmPrefView.PREFS[this._view];
	var settings = this._appCtxt.getSettings();
	for (var i = 0; i < prefs.length; i++) {
		var id = prefs[i];
		var pref = settings.getSetting(id);
		// make sure editing the pref is supported
		if ((id == LmSetting.INITIAL_SEARCH && (!this._appCtxt.get(LmSetting.INITIAL_SEARCH_ENABLED))) ||
			(id == LmSetting.PASSWORD && (!this._appCtxt.get(LmSetting.CHANGE_PASSWORD_ENABLED))) ||
			(id == LmSetting.SEARCH_INCLUDES_SPAM && (!this._appCtxt.get(LmSetting.SPAM_ENABLED)))) {
			continue;
		}
		// save the current value (for checking later if it changed)
		var value = pref.origValue = pref.getValue();
		if (id == LmSetting.SIGNATURE_STYLE)
			value = (value == LmSetting.SIG_INTERNET);		
		var prefId = LmPref.KEY_ID + id;
		DBG.println(LsDebug.DBG3, "adding pref " + pref.name + " / " + value);

		var setup = LmPref.SETUP[id];
		var type = setup.displayContainer;
		if (type == "select") {
			var selObj = new DwtSelect(this);
			this.selects[id] = selObj;

			var options;
			if (setup.options || setup.displayOptions){
				options = setup.options ? setup.options : setup.displayOptions;
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
			div.className = "leftPad";
			div.appendChild(selObj.getHtmlElement());
			this._createRow(setup.displayName, div, setup.displaySeparator);
		} else {
			var html = new Array();
			var j = 0;
			var buttonId;
			if (type == "checkbox") {
				var checked = value ? "checked " : "";
				html[j++] = "<div style='padding: 0px 0px 0px 1px'><input id='";
				html[j++] = prefId;
				html[j++] = "' ";
				html[j++] = checked;
				html[j++] = "type='checkbox'/></div>";
			} else if (type == "input") {
				html[j++] = "<div class='leftPad'><input id='";
				html[j++] = prefId;
				html[j++] = "' ";
				html[j++] = "type='text' value='";
				html[j++] = value;
				html[j++] = "' size=30></input></div>";
			} else if (type == "textarea") {
				html[j++] = "<div class='leftPad'><textarea id='";
				html[j++] = prefId;
				html[j++] = "' ";
				html[j++] = "wrap='on' style='width:402' rows='4' cols='60'>";
				html[j++] = value;
				html[j++] = "</textarea></div>";
			} else if (type == "x_password" || type == "import" || type == "export") {
				buttonId = Dwt.getNextId();
				html[j++] = "<div class='leftPad'><div id='";
				html[j++] = buttonId;
				html[j++] = "'></div></div>";
			}
			this._createRow(setup.displayName, html.join(""), setup.displaySeparator);
			if (type == "x_password") {
				this._addButton(buttonId, LmMsg.change, 50,
								new LsListener(this, this._changePasswordListener));
			} else if (type == "import") {
				this._importDiv = document.getElementById(buttonId);
				this._addImportWidgets(this._importDiv);
			} else if (type == "export") {
				this._addButton(buttonId, LmMsg._export, 65,
								new LsListener(this, this._exportContactsListener));
			}
		}
	}
	this._addButton(this._resetId, LmMsg.restoreDefaults, 100,
					new LsListener(this, this._resetListener));
	this._rendered = true;
};

LmPreferencesPage.prototype.getTitle =
function() {
	return this._title;
}

// Creates a table that we can later add preference rows to, and a placeholder DIV for
// the reset button.
LmPreferencesPage.prototype._createHtml =
function() {
	var html = new Array();
	var i = 0;
	var tableId = Dwt.getNextId();
	this._resetId = Dwt.getNextId();
	
	html[i++] = "<div class='TitleBar'>";
	html[i++] = "<table id='" + tableId + "' cellpadding=0 cellspacing=5 class='prefTable'>";
	html[i++] = "<colgroup><col class='prefLabel'></col><col class='prefContent'></col><col></col></colgroup>";
	html[i++] = "</table></div>";
	html[i++] = "<div id='" + this._resetId + "' class='leftPad'></div>";
	this.getHtmlElement().innerHTML = html.join("");
	
	this._table = document.getElementById(tableId);
};

// Add a row to the table for the given preference.
LmPreferencesPage.prototype._createRow =
function(label, content, addSep) {
	var tr = this._table.insertRow(-1);
	tr.id = Dwt.getNextId();
	tr.valign = "top";
	var cell1 = tr.insertCell(0);
//	cell1.className = "prefLabel";
	cell1.innerHTML = LsStringUtil.htmlEncode(label + ":");

	var cell2 = tr.insertCell(1);
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
LmPreferencesPage.prototype._addButton =
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

LmPreferencesPage.prototype._addImportWidgets = 
function(buttonDiv) {
	
	this._uploadFormId = Dwt.getNextId();
	this._attInputId = Dwt.getNextId();

	var uri = location.protocol + "//" + document.domain + this._appCtxt.get(LmSetting.CSFE_UPLOAD_URI);
	
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
	this._importBtn = this._addButton(buttonDiv.id, LmMsg._import, 65, new LsListener(this, this._importContactsListener));

	var idoc = Dwt.getIframeDoc(iframe);
	idoc.open();
	var html = new Array();
	var idx = 0;
	html[idx++] = "<html><head></head><body scroll=no bgcolor='#EEEEEE'>";
	html[idx++] = "<form method='POST' action='" + uri + "' id='" + this._uploadFormId + "' enctype='multipart/form-data'>";
	html[idx++] = "<input style='font-family:Tahoma; font-size:10px' name='" + LmPreferencesPage.IMPORT_FIELD_NAME + "' type='file' id='" + this._attInputId + "'>";
	html[idx++] = "</form>";
	html[idx++] = "</body></html>";
	idoc.write(html.join(""));
	idoc.close();
}

// Popup the change password dialog.
LmPreferencesPage.prototype._changePasswordListener =
function(ev) {
	this._passwordDialog.popup();
}

LmPreferencesPage.prototype._exportContactsListener = 
function(ev) {
	var uri = location.protocol + "//" + document.domain + this._appCtxt.get(LmSetting.CSFE_EXPORT_URI);
	window.open(uri, "_blank");
}

LmPreferencesPage.prototype._importContactsListener =
function(ev) {
	var idoc = Dwt.getIframeDoc(this._importIframe);
	var fileInput = idoc.getElementById(this._attInputId);
	var val = fileInput ? LsStringUtil.trim(fileInput.value) : null;
	
	// TODO - test val against regex for valid .csv filename
	
	if (val) {
		var callback = new LsCallback(this, this._importDoneCallback);
		var um = this._appCtxt.getUploadManager();
		window._uploadManager = um;
		um.execute(this._importIframe, callback, this._uploadFormId);
	} else {
		// TODO - show error message in app controller's status window
	}
}

LmPreferencesPage.prototype._importDoneCallback = 
function(args) {

	var appCtrlr = this._appCtxt.getAppController();
	
	var status = args[0];
	if (status == 200) {
		this._importBtn.setEnabled(false);
		this._importIframe.style.visibility = "hidden";
		appCtrlr.setStatusMsg(LmMsg.importingContacts);
		// we have to schedule the rest since it freezes the UI (and status never gets set)
		appCtrlr._schedule(LmPreferencesPage._finishImport, {aid: args[1], prefPage: this});
	} else {
		appCtrlr.setStatusMsg(LmMsg.errorImporting + " (" + status + ")");
		// always re-render input file widget and its parent IFRAME
		this._importDiv.innerHTML = "";
		this._addImportWidgets(this._importDiv);
	}
}

LmPreferencesPage._finishImport = 
function(params) {

	var appCtrlr = this._appCtxt.getAppController();

	// send the import request w/ the att Id to the server
	var soapDoc = LsSoapDoc.create("ImportContactsRequest", "urn:liquidMail");
	var method = soapDoc.getMethod();
	method.setAttribute("ct", "csv"); // always "csv" for now
	var content = soapDoc.set("content", "");
	content.setAttribute("aid", params.aid);
	
	var resp = appCtrlr.sendRequest(soapDoc).ImportContactsResponse.cn[0];
	
	var msg = resp.n + " " + LmMsg.contactsImported;
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
LmPreferencesPage.prototype._resetListener =
function(ev) {
	var settings = this._appCtxt.getSettings();
	var prefs = LmPrefView.PREFS[this._view];
	for (var i = 0; i < prefs.length; i++) {
		var id = prefs[i];
		var setup = LmPref.SETUP[id];
		var type = setup.displayContainer;
		if (type.indexOf("x_") == 0) // ignore non-form elements			
			continue;
		var pref = settings.getSetting(id);
		var defValue = pref.defaultValue;
		if (type == "select") {
			var curValue = this.selects[id].getValue();
			if (defValue != null && (curValue != defValue))
				this.selects[id].setSelectedValue(defValue);
		} else {
			var prefId = LmPref.KEY_ID + id;
			var element = document.getElementById(prefId);
			if (!element || element.value == defValue) continue;
			if (type == "checkbox") {
				element.checked = defValue ? true : false;
			} else {
				if (defValue == null) defValue = "";
				element.value = defValue;
			}
		}
	}
	this._appCtxt.getAppController().setStatusMsg(LmMsg.defaultsRestored);
}
