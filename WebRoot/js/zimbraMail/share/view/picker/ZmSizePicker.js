/*
 * ***** BEGIN LICENSE BLOCK *****
 * 
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2004, 2005, 2006, 2007 Zimbra, Inc.
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

ZmSizePicker = function(parent) {
	ZmPicker.call(this, parent, ZmPicker.SIZE);
};

ZmSizePicker.prototype = new ZmPicker;
ZmSizePicker.prototype.constructor = ZmSizePicker;

ZmPicker.CTOR[ZmPicker.SIZE] = ZmSizePicker;

ZmSizePicker.OP_SELECT_OPTIONS = [
	{ label: ZmMsg.larger, 	value: "larger", 	selected: true  },
	{ label: ZmMsg.smaller, value: "smaller", 	selected: false }];

ZmSizePicker.UNIT_SELECT_OPTIONS = [
	{ label: ZmMsg.bytes, 		value: "b", 	selected: false },
	{ label: ZmMsg.kilobytes, 	value: "kb", 	selected: true  },
	{ label: ZmMsg.megabytes, 	value: "mb", 	selected: false }];

ZmSizePicker.prototype.toString = 
function() {
	return "ZmSizePicker";
};

ZmSizePicker.prototype._setupPicker =
function(parent) {
	var picker = new DwtComposite(parent);

	var opId = Dwt.getNextId();
	var unitsId = Dwt.getNextId();    
	var fieldId = Dwt.getNextId();

	var html = new Array(21);
	var i = 0;
	html[i++] = "<center><table cellpadding=5 cellspacing=0 border=0>";
	html[i++] = "<tr valign='middle'><td align='right' nowrap>";
	html[i++] = ZmMsg.size;
	html[i++] = ":</td><td align='left' nowrap colspan=1 id='";
	html[i++] = opId;
	html[i++] = "'></td></tr>";
	html[i++] = "<tr valign='middle'><td align='right' nowrap>";
	html[i++] = ZmMsg.value;
	html[i++] = ":</td>";
	html[i++] = "<td align='left' nowrap><div id='";
	html[i++] = fieldId;
	html[i++] = "'></td></tr>";
	html[i++] = "<tr valign='middle'><td align='right' nowrap>";
	html[i++] = ZmMsg.units;
	html[i++] = ":</td><td align='left' nowrap id='";
	html[i++] = unitsId;
	html[i++] = "'></td></tr>";
	html[i++] = "</table></center>";
	picker.getHtmlElement().innerHTML = html.join("");

	// set up DwtSelects
	var selectChangeListener = new AjxListener(this, this._selectChangeListener);
	this._op = new DwtSelect(this);
	this._op.addChangeListener(selectChangeListener);
	for (var i = 0; i < ZmSizePicker.OP_SELECT_OPTIONS.length; i++) {
		var option = ZmSizePicker.OP_SELECT_OPTIONS[i];
		this._op.addOption(option.label, option.selected, option.value);
	}
	this._op.reparentHtmlElement(opId);

	this._units = new DwtSelect(this);
	this._units.addChangeListener(selectChangeListener);
	for (var i = 0; i < ZmSizePicker.UNIT_SELECT_OPTIONS.length; i++) {
		var option = ZmSizePicker.UNIT_SELECT_OPTIONS[i];
		this._units.addOption(option.label, option.selected, option.value);
	}
	this._units.reparentHtmlElement(unitsId);

	// set up input field
	var args = {
		parent: this,
		size: 16,
		type: DwtInputField.INTEGER,
		validator: ZmSizePicker._validateSize,
		validationStyle: DwtInputField.CONTINUAL_VALIDATION
	};
	this._size = new DwtInputField(args);
	this._size.setValidNumberRange(0, null);
	this._size.addListener(DwtEvent.ONKEYUP, new AjxListener(this, this._onKeyUp));
	this._size.replaceElement(fieldId);
	document.getElementById(fieldId);

};

ZmSizePicker.prototype._updateQuery = 
function() {
	var value = this._size.isValid();
	if (value) {
		this.setQuery(this._op.getValue() + ":" + value + this._units.getValue());
	} else {
		this.setQuery("");
	}
};

ZmSizePicker.prototype._selectChangeListener = 
function(ev) {
	this._updateQuery();
	this.execute();
};

ZmSizePicker.prototype._onKeyUp =
function(ev) {
	var charCode = DwtKeyEvent.getCharCode(ev);
	if (charCode == 13 || charCode == 3) {
		this.execute();
	} else {
		this._updateQuery();
	}

};

ZmSizePicker._validateSize =
function(value) {
	if (value && !value.match(/^[1-9][0-9]*$/)) {
		throw ZmMsg.errorInvalidSize;
	}
	return value;
}
