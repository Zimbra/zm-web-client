/*
 * ***** BEGIN LICENSE BLOCK *****
 * Version: ZPL 1.1
 * 
 * The contents of this file are subject to the Zimbra Public License
 * Version 1.1 ("License"); you may not use this file except in
 * compliance with the License. You may obtain a copy of the License at
 * http://www.zimbra.com/license
 * 
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied. See
 * the License for the specific language governing rights and limitations
 * under the License.
 * 
 * The Original Code is: Zimbra Collaboration Suite.
 * 
 * The Initial Developer of the Original Code is Zimbra, Inc.
 * Portions created by Zimbra are Copyright (C) 2005 Zimbra, Inc.
 * All Rights Reserved.
 * 
 * Contributor(s):
 * 
 * ***** END LICENSE BLOCK *****
 */

function ZmOverviewPanelController(appCtxt, container) {

	ZmController.call(this, appCtxt, container);
}

ZmOverviewPanelController.prototype = new ZmController;
ZmOverviewPanelController.prototype.constructor = ZmOverviewPanelController;

ZmOverviewPanelController.DEFAULT_FOLDER_ID = ZmFolder.ID_INBOX;

ZmOverviewPanelController.prototype.toString = 
function() {
	return "ZmOverviewPanelController";
}

ZmOverviewPanelController.prototype.getOverviewPanel =
function() {
	return this._overviewPanel;
}

ZmOverviewPanelController.prototype.getTagTreeController =
function() {
	return this._tagTreeController;
}

ZmOverviewPanelController.prototype.getFolderTreeController =
function() {
	return this._folderTreeController;
}

ZmOverviewPanelController.prototype.setView =
function() {
	if (this._overviewPanel) {
		this._overviewPanel.reset();
	} else {
		this._overviewPanel = new ZmOverviewPanel(this._container, "OverviewPanel", DwtControl.ABSOLUTE_STYLE, this._appCtxt);
	}
	this._buildFolderTree();
	var id = ZmOverviewPanelController.DEFAULT_FOLDER_ID;
	var folder = this._appCtxt.getFolderTree().getById(id);
	this._folderTreeController.getTreeView().setSelected(folder, true);
}

ZmOverviewPanelController.prototype._buildFolderTree =
function() {
	var tree = this._overviewPanel.getFolderTree();
	
	var folders = [ZmFolder.ID_USER];
	if (this._appCtxt.get(ZmSetting.SAVED_SEARCHES_ENABLED))
		folders.push(ZmFolder.ID_SEP, ZmFolder.ID_SEARCH);
	if (this._appCtxt.get(ZmSetting.TAGGING_ENABLED))
		folders.push(ZmFolder.ID_SEP, ZmFolder.ID_TAGS);
	this._folderTreeController = new ZmFolderTreeController(this._appCtxt, tree);
	var ttc = this._folderTreeController.show(folders, true);
	if (ttc)
		this._tagTreeController = ttc;
	this._setExpanded(ZmFolder.ID_USER);
	if (this._appCtxt.get(ZmSetting.TAGGING_ENABLED))
		this._setExpanded(ZmFolder.ID_TAGS);
	if (this._appCtxt.get(ZmSetting.SAVED_SEARCHES_ENABLED))
		this._setExpanded(ZmFolder.ID_SEARCH);
}

ZmOverviewPanelController.prototype._setExpanded =
function(id, recurse) {
	var node = this._folderTreeController.getTreeView().getTreeItemById(id);
	node.setExpanded(true, recurse);
}
