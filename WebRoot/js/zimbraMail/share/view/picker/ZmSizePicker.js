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

function ZmSizePicker(parent) {

	ZmPicker.call(this, parent, ZmPicker.SIZE);
}

ZmSizePicker.prototype = new ZmPicker;
ZmSizePicker.prototype.constructor = ZmSizePicker;

ZmPicker.CTOR[ZmPicker.SIZE] = ZmSizePicker;

ZmSizePicker.prototype.toString = 
function() {
	return "ZmSizePicker";
}

ZmSizePicker.prototype._setupPicker =
function(parent) {
	var picker = new DwtComposite(parent);

    var size = 16;
	var opId = Dwt.getNextId();
	var unitsId = Dwt.getNextId();    
	var fieldId = Dwt.getNextId();

	var html = new Array(40);
	var i = 0;
	html[i++] = "<center><table cellpadding='5' cellspacing='0' border='0'>";
	html[i++] = "<tr valign='middle'>";
	html[i++] = "<td align='right' nowrap>" + ZmMsg.size + ":</td>";
	html[i++] = "<td align='left' nowrap colspan='1'>";
	html[i++] = "<select id='" + opId + "'>";
	html[i++] = "<option value='larger'>" + ZmMsg.larger + "</option>";
	html[i++] = "<option value='smaller'>" + ZmMsg.smaller + "</option>";
	html[i++] = "</select>";
	html[i++] = "</td>";
	html[i++] = "</tr>";
	html[i++] = "<tr valign='middle'>";
	html[i++] = "<td align='right' nowrap>" + ZmMsg.value + ":</td>";
	html[i++] = "<td align='left' nowrap><input type='text' nowrap size='" + size + "' id='" + fieldId + "'/></td>";
	html[i++] = "</tr>";
	html[i++] = "<tr valign='middle'>";
	html[i++] = "<td align='right' nowrap>" + ZmMsg.units + ":</td>";
	html[i++] = "<td align='left' nowrap>";
	html[i++] = "<select id='" + unitsId + "'>";
	html[i++] = "<option value='b'>" + ZmMsg.bytes + "</option>";
	html[i++] = "<option value='kb' selected>" + ZmMsg.kb + "</option>";
	html[i++] = "<option value='mb'>" + ZmMsg.mb + "</option>";
	html[i++] = "<option value='gb'>" + ZmMsg.gb + "</option>";
	html[i++] = "</select>";
	html[i++] = "</td>";
	html[i++] = "</tr>";
	html[i++] = "</table></center>";
	picker.getHtmlElement().innerHTML = html.join("");

	this._op = this._setupField(opId);
	this._size = this._setupSizeField(fieldId);
	this._units = this._setupField(unitsId);
}

ZmSizePicker.prototype._setupField = 
function(id) {
	var f = Dwt.getDomObj(this.getDocument(), id);
	Dwt.setHandler(f, DwtEvent.ONCHANGE, ZmSizePicker._onChange);
	f._picker = this;
	return f;
}

ZmSizePicker.prototype._setupSizeField = 
function(id) {
	var f = Dwt.getDomObj(this.getDocument(), id);
	Dwt.setHandler(f, DwtEvent.ONKEYUP, ZmSizePicker._onKeyUp);
	f._picker = this;
	return f;
}

ZmSizePicker._onChange =
function(ev) {
	var element = DwtUiEvent.getTarget(ev);
	var picker = element._picker;
	picker._updateQuery();
	picker.execute();
}

ZmSizePicker._onKeyUp =
function(ev) {
	var element = DwtUiEvent.getTarget(ev);
	var picker = element._picker;
	var charCode = DwtKeyEvent.getCharCode(ev);
	if (charCode == 13 || charCode == 3) {
		picker.execute();
	    return false;
	} else {
		picker._updateQuery();
		return true;
	}

}

ZmSizePicker.prototype._updateQuery = 
function() {
	if (this._size.value && this._size.value.match(/^[1-9][0-9]*$/)) {
		this.setQuery(this._op.value + ":" + this._size.value + this._units.value);
	} else {
		this.setQuery("");
	}
}
