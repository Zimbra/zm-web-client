/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2007, 2009, 2010, 2013, 2014, 2016 Synacor, Inc.
 *
 * The contents of this file are subject to the Common Public Attribution License Version 1.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at: https://www.zimbra.com/license
 * The License is based on the Mozilla Public License Version 1.1 but Sections 14 and 15
 * have been added to cover use of software over a computer network and provide for limited attribution
 * for the Original Developer. In addition, Exhibit A has been modified to be consistent with Exhibit B.
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * See the License for the specific language governing rights and limitations under the License.
 * The Original Code is Zimbra Open Source Web Client.
 * The Initial Developer of the Original Code is Zimbra, Inc.  All rights to the Original Code were
 * transferred by Zimbra, Inc. to Synacor, Inc. on September 14, 2015.
 *
 * All portions of the code are Copyright (C) 2007, 2009, 2010, 2013, 2014, 2016 Synacor, Inc. All Rights Reserved.
 * ***** END LICENSE BLOCK *****
 */

ZmVoiceTreeController = function() {

	ZmFolderTreeController.call(this, ZmOrganizer.VOICE);
	this._voiceApp = appCtxt.getApp(ZmApp.VOICE);
};

ZmVoiceTreeController.prototype = new ZmFolderTreeController;
ZmVoiceTreeController.prototype.constructor = ZmVoiceTreeController;


// Public Methods
ZmVoiceTreeController.prototype.toString =
function() {
	return "ZmVoiceTreeController";
};

ZmVoiceTreeController.prototype.getDataTree =
function(overviewId) {
	var phone = (overviewId instanceof ZmPhone)
		? overviewId : this._opc.getOverview(overviewId).phone;
	if (phone) {
		var dataTree = this._dataTree[phone.name];
		if (!dataTree) {
			dataTree = this._dataTree[phone.name] = phone.folderTree;
			dataTree.addChangeListener(this._getTreeChangeListener());
		}
		return dataTree;
	}
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
	var app = appCtxt.getApp(ZmApp.VOICE);
	for (var i = 0; i < app.phones.length; i++) {
		var root = app.phones[i].folderTree.root;
		var ti = this._treeView[overviewId].getTreeItemById(root.id);
		if (ti) {
			ti.setExpanded(true);
		}
	}

	// show start folder as selected
	var parts = overviewId.split(":");
	if (parts && (parts.length == 2)) {
		var startFolder = this._voiceApp.getStartFolder(parts[1]);
		if (startFolder) {
			var treeItem = view.getTreeItemById(startFolder.id);
			if (treeItem) {
				view.setSelection(treeItem, true);
			}
		}
	}
};

ZmVoiceTreeController.prototype.resetOperations =
function(parent, type, id) {
	var folder = appCtxt.getById(id);
	parent.enable(ZmOperation.EXPAND_ALL, (folder.size() > 0));
};

// Returns a list of desired header action menu operations
ZmVoiceTreeController.prototype._getHeaderActionMenuOps =
function() {
	return null;
};

ZmVoiceTreeController.prototype._getActionMenu =
function(ev) {
	var folder = ev.item.getData(Dwt.KEY_OBJECT);
	if ((folder instanceof ZmVoiceFolder) && (folder.callType == ZmVoiceFolder.TRASH)) {
		return ZmTreeController.prototype._getActionMenu.call(this, ev);
	}

	return null;
};

// Returns a list of desired action menu operations
ZmVoiceTreeController.prototype._getActionMenuOps =
function() {
	return [ZmOperation.EMPTY_FOLDER];
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
	appCtxt.getApp(ZmApp.VOICE).search(folder);
};
