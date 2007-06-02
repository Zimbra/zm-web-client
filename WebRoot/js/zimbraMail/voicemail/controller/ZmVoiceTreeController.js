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

ZmVoiceTreeController = function(appCtxt, type, dropTgt) {
	if (arguments.length == 0) return;

	ZmFolderTreeController.call(this, appCtxt, (type || ZmOrganizer.VOICE), dropTgt);
	this._voiceApp = appCtxt.getApp(ZmApp.VOICE);
}

ZmVoiceTreeController.prototype = new ZmFolderTreeController;
ZmVoiceTreeController.prototype.constructor = ZmVoiceTreeController;


// Public Methods
ZmVoiceTreeController.prototype.toString =
function() {
	return "ZmVoiceTreeController";
};

ZmVoiceTreeController.prototype.getDataTree =
function(phone) {
	phone = phone || this._voiceApp.accordionItem.data.phone;
	var dataTree = this._dataTree[phone.name];
	if (!dataTree) {
		dataTree = this._dataTree[phone.name] = phone.folderTree;
	}
	return dataTree;
};

ZmVoiceTreeController.prototype._createTreeView =
function(params) {
	return new ZmVoiceTreeView(params);
};

ZmVoiceTreeController.prototype._postSetup =
function(overviewId) {
	ZmTreeController.prototype._postSetup.call(this, overviewId);

	// expand all root account folders
	var view = this._treeView[overviewId];
	var app = this._appCtxt.getApp(ZmApp.VOICE);
	for (var i = 0; i < app.phones.length; i++) {
		var root = app.phones[i].folderTree.root;
		var ti = this._treeView[overviewId].getTreeItemById(root.id);
		if (ti) {
			ti.setExpanded(true);
		}
	}

	var startFolder = this._voiceApp.getStartFolder();
	if (startFolder) {
		var treeItem = view.getTreeItemById(startFolder.id);
		view.setSelection(treeItem, true);
	}
};

ZmVoiceTreeController.prototype.resetOperations =
function(parent, type, id) {
	var folder = this._appCtxt.getById(id);
	parent.enable(ZmOperation.EXPAND_ALL, (folder.size() > 0));
};

// Returns a list of desired header action menu operations
ZmVoiceTreeController.prototype._getHeaderActionMenuOps =
function() {
	return [ZmOperation.EXPAND_ALL];
};

// Returns a list of desired action menu operations
ZmVoiceTreeController.prototype._getActionMenuOps =
function() {
	return [ZmOperation.EXPAND_ALL];
};

ZmVoiceTreeController.prototype._getDropTarget =
function(appCtxt) {
	return (new DwtDropTarget(["ZmVoicemail"]));
};

ZmVoiceTreeController.prototype._getAllowedSubTypes =
function() {
	var types = {};
	types[ZmOrganizer.VOICE] = true;
	return types;
};

/*
* Called when a left click occurs (by the tree view listener).
*
* @param folder		ZmVoiceFolder		folder that was clicked
*/
ZmVoiceTreeController.prototype._itemClicked =
function(folder) {
	this._appCtxt.getApp(ZmApp.VOICE).search(folder);
};

