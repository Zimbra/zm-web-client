function LmSizePicker(parent) {

	LmPicker.call(this, parent, LmPicker.SIZE);
}

LmSizePicker.prototype = new LmPicker;
LmSizePicker.prototype.constructor = LmSizePicker;

LmPicker.CTOR[LmPicker.SIZE] = LmSizePicker;

LmSizePicker.prototype.toString = 
function() {
	return "LmSizePicker";
}

LmSizePicker.prototype._setupPicker =
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
	html[i++] = "<td align='right' nowrap>" + LmMsg.size + ":</td>";
	html[i++] = "<td align='left' nowrap colspan='1'>";
	html[i++] = "<select id='" + opId + "'>";
	html[i++] = "<option value='larger'>" + LmMsg.larger + "</option>";
	html[i++] = "<option value='smaller'>" + LmMsg.smaller + "</option>";
	html[i++] = "</select>";
	html[i++] = "</td>";
	html[i++] = "</tr>";
	html[i++] = "<tr valign='middle'>";
	html[i++] = "<td align='right' nowrap>" + LmMsg.value + ":</td>";
	html[i++] = "<td align='left' nowrap><input type='text' nowrap size='" + size + "' id='" + fieldId + "'/></td>";
	html[i++] = "</tr>";
	html[i++] = "<tr valign='middle'>";
	html[i++] = "<td align='right' nowrap>" + LmMsg.units + ":</td>";
	html[i++] = "<td align='left' nowrap>";
	html[i++] = "<select id='" + unitsId + "'>";
	html[i++] = "<option value='b'>" + LmMsg.bytes + "</option>";
	html[i++] = "<option value='kb' selected>" + LmMsg.kb + "</option>";
	html[i++] = "<option value='mb'>" + LmMsg.mb + "</option>";
	html[i++] = "<option value='gb'>" + LmMsg.gb + "</option>";
	html[i++] = "</select>";
	html[i++] = "</td>";
	html[i++] = "</tr>";
	html[i++] = "</table></center>";
	picker.getHtmlElement().innerHTML = html.join("");

	this._op = this._setupField(opId);
	this._size = this._setupSizeField(fieldId);
	this._units = this._setupField(unitsId);
}

LmSizePicker.prototype._setupField = 
function(id) {
	var f = Dwt.getDomObj(this.getDocument(), id);
	f.onchange = LmSizePicker._onChange;
	f._picker = this;
	return f;
}

LmSizePicker.prototype._setupSizeField = 
function(id) {
	var f = Dwt.getDomObj(this.getDocument(), id);
	f.onkeyup = LmSizePicker._onKeyUp;
	f._picker = this;
	return f;
}

LmSizePicker._onChange =
function(ev) {
	var element = DwtUiEvent.getTarget(ev);
	var picker = element._picker;
	picker._updateQuery();
	picker.execute();
}

LmSizePicker._onKeyUp =
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

LmSizePicker.prototype._updateQuery = 
function() {
	if (this._size.value && this._size.value.match(/^[1-9][0-9]*$/)) {
		this.setQuery(this._op.value + ":" + this._size.value + this._units.value);
	} else {
		this.setQuery("");
	}
}
