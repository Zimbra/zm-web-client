function ZmNewTagDialog(parent, msgDialog, className) {

	ZmDialog.call(this, parent, msgDialog, className, ZmMsg.createNewTag);

	this.setContent(this._contentHtml());
	this._setNameField(this._nameFieldId);
	this._setTagColorMenu(this._tagColorButtonCellId);
}

ZmNewTagDialog.prototype = new ZmDialog;
ZmNewTagDialog.prototype.constructor = ZmNewTagDialog;

ZmNewTagDialog.prototype.toString = 
function() {
	return "ZmNewTagDialog";
}

ZmNewTagDialog.prototype.cleanup =
function(bPoppedUp) {
	DwtDialog.prototype.cleanup.call(this, bPoppedUp);
    var color = ZmTag.DEFAULT_COLOR;
 	this._setColorButton(color, ZmTag.COLOR_TEXT[color], ZmTag.COLOR_ICON[color]);
}

ZmNewTagDialog.prototype._colorListener = 
function(ev) {
	var color = ev.item.getData(ZmOperation.MENUITEM_ID);
	this._setColorButton(color, ZmTag.COLOR_TEXT[color], ZmTag.COLOR_ICON[color]);
} 

ZmNewTagDialog.prototype._setTagColorMenu =
function(fieldId) {
    this._colorButton = new DwtButton(this, null, "ColorButton");
    this._colorButton.noMenuBar = true;
 	Dwt.getDomObj(this._doc, fieldId).appendChild(this._colorButton.getHtmlElement());
	ZmOperation.addColorMenu(this._colorButton, this);
    this._tagColorListener = new AjxListener(this, this._colorListener);
    var color = ZmTag.DEFAULT_COLOR;
 	this._setColorButton(color, ZmTag.COLOR_TEXT[color], ZmTag.COLOR_ICON[color]);
	var menu = this._colorButton.getMenu();
	var items = menu.getItems();
	for (var i = 0; i < items.length; i++)
		items[i].addSelectionListener(this._tagColorListener);
}

ZmNewTagDialog.prototype._setColorButton =
function(color, text, image) {
	this._colorButton.setData(ZmOperation.MENUITEM_ID, color);
	this._colorButton.setText(text);
	this._colorButton.setImage(image);
} 

ZmNewTagDialog.prototype._contentHtml = 
function() {
	this._nameFieldId = Dwt.getNextId();
	this._tagColorButtonCellId = Dwt.getNextId();
	return "<table cellpadding=2 cellspacing=2 border=0>" +
			"<tr><td class='Zabel' colspan=2>" + ZmMsg.tagName + ": </td></tr>" +
			"<tr><td><input type=text autocomplete=OFF class='Field' id='" + this._nameFieldId + "' /></td>" +
		    "<td id='" + this._tagColorButtonCellId + "' /></tr>" +
			"</table>";

}

ZmNewTagDialog.prototype._okButtonListener =
function(ev) {
	var results = this._getTagData();
	if (results)
		DwtDialog.prototype._buttonListener.call(this, ev, results);
}

ZmNewTagDialog.prototype._getTagData =
function() {
	// check name for presence and validity
	var name = AjxStringUtil.trim(this._nameField.value);
	var msg = ZmTag.checkName(name);

	// make sure tag doesn't already exist
	if (!msg && (this._appCtxt.getTagList().getByName(name)))
		msg = ZmMsg.tagNameExists

	return (msg ? this._showError(msg) : [name, this._colorButton.getData(ZmOperation.MENUITEM_ID)]);
}

ZmNewTagDialog.prototype._enterListener =
function (ev){
	var results = this._getTagData();
	if (results)
		this._runEnterCallback(results);
}
