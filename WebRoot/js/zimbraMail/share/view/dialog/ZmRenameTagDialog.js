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

function ZmRenameTagDialog(parent, className) {

	ZmDialog.call(this, {parent:parent, className:className, title:ZmMsg.renameTag});

	this._setNameField(this._nameFieldId);
}

ZmRenameTagDialog.prototype = new ZmDialog;
ZmRenameTagDialog.prototype.constructor = ZmRenameTagDialog;

ZmRenameTagDialog.prototype.toString = 
function() {
	return "ZmRenameTagDialog";
}

ZmRenameTagDialog.prototype.popup =
function(tag, source) {
	ZmDialog.prototype.popup.call(this);
	this.setTitle(ZmMsg.renameTag + ': ' + tag.getName(false, ZmOrganizer.MAX_DISPLAY_NAME_LENGTH));
	this._nameField.value = tag.getName(false, null, true);
	this._tag = tag;
}

ZmRenameTagDialog.prototype._contentHtml = 
function() {
	this._nameFieldId = Dwt.getNextId();
	var html = new Array();
	var idx = 0;
	html[idx++] = "<table cellpadding='0' cellspacing='0' border='0'>";
	html[idx++] = "<tr><td class='Label' colspan=2 style='padding: 0px 0px 5px 0px;'>" + ZmMsg.newTagName + ": </td></tr>";
	html[idx++] = "<tr><td>";
    html[idx++] = Dwt.CARET_HACK_BEGIN;
	html[idx++] = "<input type='text' autocomplete='off' class='Field' id='" + this._nameFieldId + "' />"
    html[idx++] = Dwt.CARET_HACK_END;
	html[idx++] = "</td></tr>";
	html[idx++] = "</table>";
	
	return html.join("");
}

ZmRenameTagDialog.prototype._okButtonListener =
function(ev) {
	var results = this._getTagData();
	if (results)
		DwtDialog.prototype._buttonListener.call(this, ev, results);
}

ZmRenameTagDialog.prototype._getTagData =
function() {
	// check name for presence and validity
	var name = AjxStringUtil.trim(this._nameField.value);
	var msg = ZmTag.checkName(name);
	
	// make sure tag name doesn't already exist
	if (!msg) {
		var t = this._appCtxt.getTagTree().getByName(name);
		if (t && (t.id != this._tag.id))
			msg = ZmMsg.tagNameExists;
	}

	return (msg ? this._showError(msg) : [this._tag, name]);
}

ZmRenameTagDialog.prototype._enterListener =
function(ev) {
	var results = this._getTagData();
	if (results)
		this._runEnterCallback(results);
}
