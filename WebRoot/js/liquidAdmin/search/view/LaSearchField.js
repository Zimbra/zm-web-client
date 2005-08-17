function LaSearchField(parent, className, size, posStyle) {

	DwtComposite.call(this, parent, className, posStyle);

	size = (size == null) ? 16 : size;
	this._setMouseEventHdlrs(true);
	var fieldId = Dwt.getNextId();
	var buttonColId = Dwt.getNextId();

	var doc = this.getDocument();
	this.getHtmlElement().innerHTML = this._createHtml(size, fieldId, buttonColId); 
	this._searchField = Dwt.getDomObj(doc, fieldId);
	this._searchField.onkeypress = LaSearchField._keyPressHdlr;
	
	this._searchButton = new DwtButton(this, null, "TBButton");
	this._searchButton.setToolTipContent(LaMsg.searchForAccounts);
    this._searchButton.setImage(LaImg.I_SEARCH);
    this._searchButton.setText(LaMsg.search);
    this._searchButton.setData("me", this);
    this._searchButton.addSelectionListener(new LsListener(this, LaSearchField.prototype._invokeCallback));
    this._changed = false;
    Dwt.getDomObj(doc, buttonColId).appendChild(this._searchButton.getHtmlElement());
}

LaSearchField.prototype = new DwtComposite;
LaSearchField.prototype.constructor = LaSearchField;

LaSearchField.prototype.toString = 
function() {
	return "LaSearchField";
}

LaSearchField.UNICODE_CHAR_RE = /\S/;

LaSearchField.prototype.registerCallback =
function(callbackFunc, obj) {
	this._callbackFunc = callbackFunc;
	this._callbackObj = obj;
}

LaSearchField.prototype.focus =
function() {
	this._searchField.focus();
}

LaSearchField.prototype.setEnabled =
function(enable) {
	this._searchField.disabled = !enable;
	this._searchButton.setEnabled(enable);
}

LaSearchField.prototype.setValue =
function(value) {
//	if (value != this._searchField.value) {
		this._searchField.value = value;
		this.setFieldChanged(true);
//	}
}

LaSearchField.prototype.getValue =
function() {
	return this._searchField.value;
}

LaSearchField.prototype.setFieldChanged =
function(changed) {
	if (this._changed != changed) {
		this._changed = changed;
		//this._searchButton.setActivated(changed);
		if (changed)
			this._searchButton.setImage(LaImg.I_UNDO);
		else	
			this._searchButton.setImage(LaImg.I_SEARCH);
	}
}

LaSearchField.prototype._createHtml =
function(size, fieldId, buttonColId) {
	return "<table cellpadding='0' cellspacing='0' border='0' style='padding:2px;'>" +
		"<tr valign='middle'>" +
			"<td valign='middle' nowrap>" +
			LsImg.getImageHtml(LaImg.M_BANNER) +
			"</td>" +
			"<td valign='middle' nowrap><input type='text' nowrap size='" + size + "' id='" + fieldId + "' class='Field'/></td>" + 
			"<td valign='middle' style='padding-left:2px' id='" + buttonColId + "'></td>" +
		"</tr>" + 
	"</table>";
}

LaSearchField.prototype._invokeCallback =
function(evt) {
//	if (this._searchField.value.search(LaSearchField.UNICODE_CHAR_		return;
	if (this._callbackFunc != null) {
		if (this._callbackObj != null)
			this._callbackFunc.call(this._callbackObj, this, this._searchField.value);
		else 
			this._callbackFunc(this, this._searchField.value);
	}
}

LaSearchField.prototype._addChild =
function(child) {
    this._children.add(child);
}

LaSearchField._keyPressHdlr =
function(ev) {
    var obj = DwtUiEvent.getDwtObjFromEvent(ev);
    obj.setFieldChanged(true);
	var charCode = DwtKeyEvent.getCharCode(ev);
	if (charCode == 13 || charCode == 3) {
	    obj._invokeCallback();
	    return false;
	}
	return true;
}


