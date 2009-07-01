/*
 * ***** BEGIN LICENSE BLOCK *****
 * 
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2006, 2007 Zimbra, Inc.
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

ZmUploadConflictDialog = function(shell, className) {
	className = className || "ZmUploadConflictDialog";
	var title = ZmMsg.uploadConflict;
	var standardButtons = [ DwtDialog.OK_BUTTON, DwtDialog.CANCEL_BUTTON ];
	DwtDialog.call(this, {parent:shell, className:className, title:title, standardButtons:standardButtons});
	this.setButtonListener(DwtDialog.OK_BUTTON, new AjxListener(this, this._resolve));

	this._mineId = this._htmlElId+"_mine";
	this._theirsId = this._htmlElId+"_theirs";
	this._viewId = this._htmlElId+"_view";

	this._createUploadHtml();
}
ZmUploadConflictDialog.prototype = new DwtDialog;
ZmUploadConflictDialog.prototype.constructor = ZmUploadConflictDialog;

ZmUploadConflictDialog.prototype.toString = function() {
	return "ZmUploadConflictDialog";
};

// Constants

ZmUploadConflictDialog._MINE = "mine";
ZmUploadConflictDialog._THEIRS = "theirs";

// Data

ZmUploadConflictDialog.prototype._mineId;
ZmUploadConflictDialog.prototype._theirsId;
ZmUploadConflictDialog.prototype._viewId;

ZmUploadConflictDialog.prototype._table;

ZmUploadConflictDialog.prototype._conflicts;
ZmUploadConflictDialog.prototype._conflictCallback;

// Public methods

ZmUploadConflictDialog.prototype.popup = function(folder, conflicts, callback, loc) {
	// save data
	this._uploadFolder = folder;
	this._conflicts = conflicts;
	this._conflictCallback = callback;

	// setup dialog
	var table = this._table;
	for (var i = table.rows.length - 1; i > 0; i--) {
		table.deleteRow(i);
	}

	for (var i = 0; i < conflicts.length; i++) {
		var conflict = conflicts[i];
		this.__addFileRow(table, conflict);
	}

	// show
	DwtDialog.prototype.popup.call(this, loc);
};

ZmUploadConflictDialog.prototype.popdown = function() {
	ZmDialog.prototype.popdown.call(this);
	this._conflictCallback = null;
};

// Protected methods

ZmUploadConflictDialog.prototype._resolve = function(){
	var conflicts = this._conflicts;
	var callback = this._conflictCallback;
	this.popdown();
	if (callback) {
		callback.run(conflicts);
	}
};

ZmUploadConflictDialog.prototype._selectAll = function(mineOrTheirs) {
	var element = this.getHtmlElement();
	var radios = element.getElementsByTagName("INPUT");
	for (var i = 0; i < radios.length; i++) {
		var radio = radios[i];
		if (radio.type != "radio") continue;
		radio.checked = radio.value == mineOrTheirs;
		ZmUploadConflictDialog.__setFileDone(radio);
	}
};

// handlers

ZmUploadConflictDialog._handleMine = function(event) {
	var target = DwtUiEvent.getTarget(event);
	var dialog = Dwt.getObjectFromElement(target);
	dialog._selectAll(ZmUploadConflictDialog._MINE);
};

ZmUploadConflictDialog._handleTheirs = function(event) {
	var target = DwtUiEvent.getTarget(event);
	var dialog = Dwt.getObjectFromElement(target);
	dialog._selectAll(ZmUploadConflictDialog._THEIRS);
};

ZmUploadConflictDialog._handleRadio = function(event) {
	var target = DwtUiEvent.getTarget(event);
	ZmUploadConflictDialog.__setFileDone(target);
};
ZmUploadConflictDialog.__setFileDone = function(radio) {
	var file = Dwt.getObjectFromElement(radio);
	file.done = radio.value == ZmUploadConflictDialog._THEIRS;
};

ZmUploadConflictDialog._handleViewTheirs = function(event) {
	var target = DwtUiEvent.getTarget(event);
	var object = Dwt.getObjectFromElement(target);
	var dialog = object.dialog;
	var file = object.file;

	var winurl = [
		dialog._uploadFolder.getRestUrl(),
		"/",
		AjxStringUtil.urlComponentEncode(file.name)
	].join("");
	var winname = "_new";
	var winfeatures = [
		"width=",(window.outerWidth || 640),",",
		"height=",(window.outerHeight || 480),",",
		"location,menubar,",
		"resizable,scrollbars,status,toolbar"
	].join("");

	var win = open(winurl, winname, winfeatures);
};

ZmUploadConflictDialog._handleLinkOver = function(event) {
	this.style.cursor= "pointer";
};
ZmUploadConflictDialog._handleLinkOut = function(event) {
	this.style.cursor= "default";
};

// view creation

ZmUploadConflictDialog.prototype._createUploadHtml = function() {
	var div = document.createElement("DIV");
	div.innerHTML = ZmMsg.uploadConflictDesc;
	div.style.marginBottom = "0.5em";

	var table = this._table = document.createElement("TABLE");
	table.border = 0;
	table.cellPadding = 0;
	table.cellSpacing = 3;

	var row = table.insertRow(-1);

	var cell = row.insertCell(-1);
	var id = this._mineId;
	var text = ZmMsg.mine;
	var handler = ZmUploadConflictDialog._handleMine;
	cell.appendChild(this.__createLink(id, text, handler));

	var cell = row.insertCell(-1);
	var id = this._theirsId;
	var text = ZmMsg.theirs;
	var handler = ZmUploadConflictDialog._handleTheirs;
	cell.appendChild(this.__createLink(id, text, handler));

	var element = this._getContentDiv();
	element.appendChild(div);
	element.appendChild(table);
};

// Private methods

ZmUploadConflictDialog.prototype.__addFileRow = function(table, file) {
	var handler = ZmUploadConflictDialog._handleRadio;

	var row = table.insertRow(-1);

	var cell = row.insertCell(-1);
	var value = ZmUploadConflictDialog._MINE;
	cell.appendChild(this.__createRadio(file.name, value, true, handler, file));

	var cell = row.insertCell(-1);
	var value = ZmUploadConflictDialog._THEIRS;
	cell.appendChild(this.__createRadio(file.name, value, false, handler, file));

	var cell = row.insertCell(-1);
	cell.style.paddingLeft = "1em";
	cell.innerHTML = AjxStringUtil.htmlEncode(file.name);

	var cell = row.insertCell(-1);
	cell.style.paddingLeft = "2em";
	var id = this._viewId+(table.rows.length-1);
	var text = ZmMsg.viewTheirs;
	var handler = ZmUploadConflictDialog._handleViewTheirs;
	var object = { dialog: this, file: file };
	cell.appendChild(this.__createLink(id, text, handler, object));
};

ZmUploadConflictDialog.prototype.__createRadio =
function(name, value, checked, handler, object) {
	var radio;
	if (AjxEnv.isIE) {
		var html = [];
		var i = 0;
		html[i++] = "<INPUT type=radio name='";
		html[i++] = name;
		html[i++] = "'";
		if (checked) {
			html[i++] = " checked"
		}
		html[i++] = ">";
		radio = document.createElement(html.join(""));
	}
	else {
		radio = document.createElement("INPUT");
		radio.type = 'radio';
		radio.checked = checked;
		radio.name = name;
	}
	radio.value = value;

	if (handler) {
		Dwt.setHandler(radio, DwtEvent.ONCLICK, handler);
		Dwt.associateElementWithObject(radio, object || this);
	}

	return radio;
};

ZmUploadConflictDialog.prototype.__createLink =
function(id, text, handler, object) {
	var element = document.createElement("SPAN");
	element.id = id;
	element.style.color = "blue";
	element.style.textDecoration = "underline";
	element.innerHTML = text;

	Dwt.setHandler(element, DwtEvent.ONMOUSEOVER, ZmUploadConflictDialog._handleLinkOver);
	Dwt.setHandler(element, DwtEvent.ONMOUSEOUT, ZmUploadConflictDialog._handleLinkOut);
	Dwt.setHandler(element, DwtEvent.ONCLICK, handler);
	Dwt.associateElementWithObject(element, object || this);

	return element;
};
