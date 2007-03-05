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

function ZmNewSearchDialog(parent, msgDialog, className) {

	ZmDialog.call(this, parent, msgDialog, className, ZmMsg.saveSearch);

	this._setNameField(this._nameFieldId);
	var omit = new Object();
	omit[ZmFolder.ID_SPAM] = true;
	omit[ZmFolder.ID_DRAFTS] = true;

	this._setOverview(ZmNewSearchDialog._OVERVIEW_ID, this._folderTreeCellId,
					  [ZmOrganizer.FOLDER, ZmOrganizer.SEARCH], omit);
	this._folderTreeView = this._treeView[ZmOrganizer.FOLDER];
	this._searchTreeView = this._treeView[ZmOrganizer.SEARCH];
	this._folderTree = this._appCtxt.getFolderTree();
}

ZmNewSearchDialog._OVERVIEW_ID = "ZmNewSearchDialog";

ZmNewSearchDialog.prototype = new ZmDialog;
ZmNewSearchDialog.prototype.constructor = ZmNewSearchDialog;

ZmNewSearchDialog.prototype.toString = 
function() {
	return "ZmNewSearchDialog";
}

ZmNewSearchDialog.prototype.popup =
function(search) {
	this._search = search;
	this._searchTreeView.setSelected(this._folderTree.root, true);
	ZmDialog.prototype.popup.call(this);
}

ZmNewSearchDialog.prototype._contentHtml = 
function() {
	this._nameFieldId = Dwt.getNextId();
	this._folderTreeCellId = Dwt.getNextId();
	var html = new Array();
	var idx = 0;
	html[idx++] = "<table cellpadding='0' cellspacing='0' border='0'>";
	html[idx++] = "<tr><td class='Label' colspan=2 style='padding: 0px 0px 5px 0px;'>" + ZmMsg.searchName + ": </td></tr>";
	html[idx++] = "<tr><td>";
    html[idx++] = Dwt.CARET_HACK_BEGIN;
    html[idx++] = "<input autocomplete=OFF type='text' class='Field' id='" + this._nameFieldId + "' />";
    html[idx++] = Dwt.CARET_HACK_END;
	html[idx++] = "</td></tr>";
	html[idx++] = "<tr><td>&nbsp;</td></tr>";
	html[idx++] = "<tr><td class='Label' colspan=2>" + ZmMsg.newSearchParent + ":</td></tr>";
	html[idx++] = "<tr><td colspan=2 id='" + this._folderTreeCellId + "'/></tr>";
	html[idx++] = "</table>";
	
	return html.join("");
}

ZmNewSearchDialog.prototype._okButtonListener =
function(ev) {
	var results = this._getSearchData();
	if (results)
		DwtDialog.prototype._buttonListener.call(this, ev, results);
}

ZmNewSearchDialog.prototype._getSearchData =
function() {
	// check name for presence and validity
	var name = AjxStringUtil.trim(this._nameField.value);
	var msg = ZmFolder.checkName(name);

	// make sure a parent was selected
	var parentFolder = this._opc.getSelected(ZmNewSearchDialog._OVERVIEW_ID);
	if (!msg && !parentFolder)
		msg = ZmMsg.searchNameNoLocation;

	// make sure parent doesn't already have a child by this name
	if (!msg && parentFolder.hasChild(name))
		msg = ZmMsg.folderOrSearchNameExists;
		
	// if we're creating a top-level search, check for conflict with top-level folder
	if (!msg && (parentFolder.id == ZmOrganizer.ID_ROOT) && this._folderTree.root.hasChild(name))
		msg = ZmMsg.folderOrSearchNameExists;

	return (msg ? this._showError(msg) : {parent:parentFolder, name:name, search:this._search});
}

ZmNewSearchDialog.prototype._enterListener =
function(ev) {
	var results = this._getSearchData();
	if (results)
		this._runEnterCallback(results);
}
