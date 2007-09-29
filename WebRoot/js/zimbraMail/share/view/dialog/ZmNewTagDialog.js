/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2004, 2005, 2006 Zimbra, Inc.
 * 
 * The contents of this file are subject to the Yahoo! Public License
 * Version 1.0 ("License"); you may not use this file except in
 * compliance with the License.  You may obtain a copy of the License at
 * http://www.zimbra.com/license.
 * 
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * ***** END LICENSE BLOCK *****
 */

function ZmNewTagDialog(parent, msgDialog, className) {
	ZmDialog.call(this, parent, msgDialog, className, ZmMsg.createNewTag);

	this._setNameField(this._nameFieldId);
	this._setTagColorMenu(this._tagColorButtonCellId);
	DBG.timePt("set content");
};

ZmNewTagDialog.prototype = new ZmDialog;
ZmNewTagDialog.prototype.constructor = ZmNewTagDialog;

ZmNewTagDialog.prototype.toString = 
function() {
	return "ZmNewTagDialog";
};

ZmNewTagDialog.prototype.cleanup =
function(bPoppedUp) {
	DwtDialog.prototype.cleanup.call(this, bPoppedUp);
    var color = this._getNextColor();
 	this._setColorButton(color, ZmOrganizer.COLOR_TEXT[color], ZmTag.COLOR_ICON[color]);
};

ZmNewTagDialog.prototype._colorListener = 
function(ev) {
	var color = ev.item.getData(ZmOperation.MENUITEM_ID);
	this._setColorButton(color, ZmOrganizer.COLOR_TEXT[color], ZmTag.COLOR_ICON[color]);
};

ZmNewTagDialog.prototype._setTagColorMenu =
function(fieldId) {
    this._colorButton = new DwtButton(this, null, "DwtSelect");
    this._colorButton.setHtmlElementId("ZmTagColorMenu");
    this._colorButton.noMenuBar = true;
 	document.getElementById(fieldId).appendChild(this._colorButton.getHtmlElement());
	ZmOperation.addColorMenu(this._colorButton, this);
    this._tagColorListener = new AjxListener(this, this._colorListener);
    var color = ZmTag.DEFAULT_COLOR;
 	this._setColorButton(color, ZmOrganizer.COLOR_TEXT[color], ZmTag.COLOR_ICON[color]);
	var menu = this._colorButton.getMenu();
	var items = menu.getItems();
	for (var i = 0; i < items.length; i++)
		items[i].addSelectionListener(this._tagColorListener);
};

ZmNewTagDialog.prototype._setColorButton =
function(color, text, image) {
	this._colorButton.setData(ZmOperation.MENUITEM_ID, color);
	this._colorButton.setText(text);
	this._colorButton.setImage(image);
};

ZmNewTagDialog.prototype._contentHtml = 
function() {
	this._nameFieldId = Dwt.getNextId();
	this._tagColorButtonCellId = Dwt.getNextId();
	return ["<table cellpadding=2 cellspacing=2 border=0>",
			"<tr><td class='Label' colspan=2>", ZmMsg.tagName, ": </td></tr>",
			"<tr><td>", Dwt.CARET_HACK_BEGIN, "<input type=text autocomplete=OFF class='Field' id='", this._nameFieldId, "' />", Dwt.CARET_HACK_END, "</td>",
		    "<td id='", this._tagColorButtonCellId, "' /></tr>",
			"</table>"].join("");

};

ZmNewTagDialog.prototype._okButtonListener =
function(ev) {
	var results = this._getTagData();
	if (results)
		DwtDialog.prototype._buttonListener.call(this, ev, results);
};

ZmNewTagDialog.prototype._getTagData =
function() {
	// check name for presence and validity
	var name = AjxStringUtil.trim(this._nameField.value);
	var msg = ZmTag.checkName(name);

	// make sure tag doesn't already exist
	if (!msg && (this._appCtxt.getTree(ZmOrganizer.TAG).getByName(name)))
		msg = ZmMsg.tagNameExists

	return (msg ? this._showError(msg) : [name, this._colorButton.getData(ZmOperation.MENUITEM_ID)]);
};

ZmNewTagDialog.prototype._enterListener =
function(ev) {
	var results = this._getTagData();
	if (results)
		this._runEnterCallback(results);
};

ZmNewTagDialog.prototype._getNextColor =
function() {
	var colorUsed = new Object();
	var tags = this._appCtxt.getTree(ZmOrganizer.TAG).root.children.getArray();
	if (!(tags && tags.length))
		return ZmTag.DEFAULT_COLOR;
	for (var i = 0; i < tags.length; i++)
		colorUsed[tags[i].color] = true;
	for (var i = 0; i < ZmTagTree.COLOR_LIST.length; i++) {
		var color = ZmTagTree.COLOR_LIST[i];
		if (!colorUsed[color])
			return color;
	}
	return ZmTag.DEFAULT_COLOR;
};

ZmNewTagDialog.prototype._getTabGroupMembers =
function() {
	return [this._nameField, this._colorButton];
};
