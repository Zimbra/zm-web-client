function LmNewTagDialog(parent, msgDialog, className) {

	LmDialog.call(this, parent, msgDialog, className, LmMsg.createNewTag);

	this.setContent(this._contentHtml());
	this._setNameField(this._nameFieldId);
	this._setTagColorMenu(this._tagColorButtonCellId);
}

LmNewTagDialog.prototype = new LmDialog;
LmNewTagDialog.prototype.constructor = LmNewTagDialog;

LmNewTagDialog.prototype.toString = 
function() {
	return "LmNewTagDialog";
}

LmNewTagDialog.prototype.cleanup =
function(bPoppedUp) {
	DwtDialog.prototype.cleanup.call(this, bPoppedUp);
    var color = LmTag.DEFAULT_COLOR;
 	this._setColorButton(color, LmTag.COLOR_TEXT[color], LmTag.COLOR_ICON[color]);
}

LmNewTagDialog.prototype._colorListener = 
function(ev) {
	var color = ev.item.getData(LmOperation.MENUITEM_ID);
	this._setColorButton(color, LmTag.COLOR_TEXT[color], LmTag.COLOR_ICON[color]);
} 

LmNewTagDialog.prototype._setTagColorMenu =
function(fieldId) {
    this._colorButton = new DwtButton(this, null, "ColorButton");
    this._colorButton.noMenuBar = true;
 	Dwt.getDomObj(this._doc, fieldId).appendChild(this._colorButton.getHtmlElement());
	LmOperation.addColorMenu(this._colorButton, this);
    this._tagColorListener = new LsListener(this, this._colorListener);
    var color = LmTag.DEFAULT_COLOR;
 	this._setColorButton(color, LmTag.COLOR_TEXT[color], LmTag.COLOR_ICON[color]);
	var menu = this._colorButton.getMenu();
	var items = menu.getItems();
	for (var i = 0; i < items.length; i++)
		items[i].addSelectionListener(this._tagColorListener);
}

LmNewTagDialog.prototype._setColorButton =
function(color, text, image) {
	this._colorButton.setData(LmOperation.MENUITEM_ID, color);
	this._colorButton.setText(text);
	this._colorButton.setImage(image);
} 

LmNewTagDialog.prototype._contentHtml = 
function() {
	this._nameFieldId = Dwt.getNextId();
	this._tagColorButtonCellId = Dwt.getNextId();
	return "<table cellpadding=2 cellspacing=2 border=0>" +
			"<tr><td class='Label' colspan=2>" + LmMsg.tagName + ": </td></tr>" +
			"<tr><td><input type=text autocomplete=OFF class='Field' id='" + this._nameFieldId + "' /></td>" +
		    "<td id='" + this._tagColorButtonCellId + "' /></tr>" +
			"</table>";

}

LmNewTagDialog.prototype._okButtonListener =
function(ev) {
	var results = this._getTagData();
	if (results)
		DwtDialog.prototype._buttonListener.call(this, ev, results);
}

LmNewTagDialog.prototype._getTagData =
function() {
	// check name for presence and validity
	var name = LsStringUtil.trim(this._nameField.value);
	var msg = LmTag.checkName(name);

	// make sure tag doesn't already exist
	if (!msg && (this._appCtxt.getTagList().getByName(name)))
		msg = LmMsg.tagNameExists

	return (msg ? this._showError(msg) : [name, this._colorButton.getData(LmOperation.MENUITEM_ID)]);
}

LmNewTagDialog.prototype._enterListener =
function (ev){
	var results = this._getTagData();
	if (results)
		this._runEnterCallback(results);
}
