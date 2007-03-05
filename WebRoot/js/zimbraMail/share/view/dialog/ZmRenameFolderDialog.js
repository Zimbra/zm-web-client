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

function ZmRenameFolderDialog(parent, msgDialog, className) {

	ZmDialog.call(this, parent, msgDialog, className, ZmMsg.renameFolder);

	this._setNameField(this._nameFieldId);
	this._folderTree = this._appCtxt.getFolderTree();
}

ZmRenameFolderDialog.prototype = new ZmDialog;
ZmRenameFolderDialog.prototype.constructor = ZmRenameFolderDialog;

ZmRenameFolderDialog.prototype.toString = 
function() {
	return "ZmRenameFolderDialog";
}

ZmRenameFolderDialog.prototype.popup =
function(folder, source) {
	ZmDialog.prototype.popup.call(this);
	var title = (folder.type == ZmOrganizer.SEARCH) ? ZmMsg.renameSearch : ZmMsg.renameFolder;
	this.setTitle(title + ': ' + folder.getName(false, ZmOrganizer.MAX_DISPLAY_NAME_LENGTH));
	this._nameField.value = folder.getName(false, null, true);
	this._folder = folder;
}

ZmRenameFolderDialog.prototype._contentHtml = 
function() {
	this._nameFieldId = Dwt.getNextId();
	var html = new Array();
	var idx = 0;
	html[idx++] = "<table cellpadding='0' cellspacing='0' border='0'>";
	html[idx++] = "<tr><td class='Label' colspan=2 style='padding: 0px 0px 5px 0px;'>" + ZmMsg.newName + ": </td></tr>";
	html[idx++] = "<tr><td>";
    html[idx++] = Dwt.CARET_HACK_BEGIN;
	html[idx++] = "<input type='text' autocomplete='off' class='Field' id='" + this._nameFieldId + "' />"
    html[idx++] = Dwt.CARET_HACK_END;
	html[idx++] = "</td></tr>";
	html[idx++] = "</table>";
	
	return html.join("");
}

ZmRenameFolderDialog.prototype._okButtonListener =
function(ev) {
	var results = this._getFolderData();
	if (results)
		DwtDialog.prototype._buttonListener.call(this, ev, results);
}

ZmRenameFolderDialog.prototype._getFolderData =
function() {
	// check name for presence and validity
	var name = AjxStringUtil.trim(this._nameField.value);
	var msg = ZmFolder.checkName(name);

	// make sure another folder with this name doesn't already exist at this level
	if (!msg) {
		var folder = this._folder.parent.getByName(name);
		if (folder && (folder.id != this._folder.id)) {
			msg = ZmMsg.folderOrSearchNameExists;
		}
	}

	return (msg ? this._showError(msg) : [this._folder, name]);
}

ZmRenameFolderDialog.prototype._enterListener =
function (ev){
	var results = this._getFolderData();
	if (results)
		this._runEnterCallback(results);
}
