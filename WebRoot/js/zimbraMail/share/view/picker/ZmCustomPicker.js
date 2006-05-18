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

function ZmCustomPicker(parent) {

	ZmPicker.call(this, parent);

    this.setTitle(ZmMsg.search);
    this.setImage("Search");
}

ZmCustomPicker.prototype = new ZmPicker;
ZmCustomPicker.prototype.constructor = ZmCustomPicker;

ZmPicker.CTOR[ZmPicker.CUSTOM] = ZmCustomPicker;

ZmCustomPicker.prototype.toString = 
function() {
	return "ZmCustomPicker";
}

ZmCustomPicker.prototype._setupPicker =
function(parent) {
	var picker = new DwtComposite(parent);
	var size = 24;
	var fieldId = Dwt.getNextId();
	var html = new Array(20);
	var i = 0;
	html[i++] = "<p>" + ZmMsg.addSearch + "</p>";
	html[i++] = "<center><table cellpadding='2' cellspacing='0' border='0'>";
	html[i++] = "<tr valign='middle'>";
	html[i++] = "<td align='right' nowrap>" + ZmMsg.search + ":</td>";
	html[i++] = "<td align='left' nowrap><input type='text' autocomplete='off' nowrap size='" + size + "' id='" + fieldId + "'/></td>";
	html[i++] = "</tr>";
	html[i++] = "</table></center>";
	picker.getHtmlElement().innerHTML = html.join("");

	var field = this._field = document.getElementById(fieldId);
	Dwt.setHandler(field, DwtEvent.ONCHANGE, ZmCustomPicker._onChange);
	field._picker = this;
}

ZmCustomPicker._onChange = 
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

ZmCustomPicker.prototype._updateQuery = 
function() {
	var val = this._field.value;
	if (val)
		this.setQuery("(" + this._field.value + ")");
	else
		this.setQuery("");
}
