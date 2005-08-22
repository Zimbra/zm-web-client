/*
***** BEGIN LICENSE BLOCK *****
Version: ZPL 1.1

The contents of this file are subject to the Zimbra Public License Version 1.1 ("License");
You may not use this file except in compliance with the License. You may obtain a copy of
the License at http://www.zimbra.com/license

Software distributed under the License is distributed on an "AS IS" basis, WITHOUT WARRANTY
OF ANY KIND, either express or implied. See the License for the specific language governing
rights and limitations under the License.

The Original Code is: Zimbra Collaboration Suite.

The Initial Developer of the Original Code is Zimbra, Inc.
Portions created by Zimbra are Copyright (C) 2005 Zimbra, Inc.
All Rights Reserved.
Contributor(s): ______________________________________.

***** END LICENSE BLOCK *****
*/

function ZmRenameFolderDialog(parent, msgDialog, className, folderTree) {

	ZmDialog.call(this, parent, msgDialog, className, ZmMsg.renameFolder);

	this.setContent(this._contentHtml());
	this._setNameField(this._nameFieldId);
	this._folderTree = folderTree;
}

ZmRenameFolderDialog.prototype = new ZmDialog;
ZmRenameFolderDialog.prototype.constructor = ZmRenameFolderDialog;

ZmRenameFolderDialog.prototype.toString = 
function() {
	return "ZmRenameFolderDialog";
}

ZmRenameFolderDialog.prototype.popup =
function(folder, source, loc) {
	ZmDialog.prototype.popup.call(this, loc);
	var title = (folder.type == ZmOrganizer.SEARCH) ? ZmMsg.renameSearch : ZmMsg.renameFolder;
	this.setTitle(title + ': ' + folder.getName(false, ZmOrganizer.MAX_DISPLAY_NAME_LENGTH));
	this._nameField.value = folder.getName(false);
	this._folder = folder;
}

ZmRenameFolderDialog.prototype._contentHtml = 
function() {
	this._nameFieldId = Dwt.getNextId();
	var html = new Array();
	var idx = 0;
	html[idx++] = "<table cellpadding='0' cellspacing='0' border='0'>";
	html[idx++] = "<tr><td class='Label' colspan=2 style='padding: 0px 0px 5px 0px;'>" + ZmMsg.newName + ": </td></tr>";
	html[idx++] = "<tr><td><input type='text' class='Field' id='" + this._nameFieldId + "' /></td></tr>";
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

	// make sure folder with this name doesn't already exist at this level
	if (!msg) {
		var parentFolder = this._folder.parent;
		var f = parentFolder.getByName(name);
		if (f && (f.id != this._folder.id))
			msg = ZmMsg.folderNameExists;
	}

	return (msg ? this._showError(msg) : [this._folder, name]);
}

ZmRenameFolderDialog.prototype._enterListener =
function (ev){
	var results = this._getFolderData();
	if (results)
		this._runEnterCallback(results);
}
