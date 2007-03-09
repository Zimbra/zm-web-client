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

function ZmVoicemailTreeController(appCtxt, type, dropTgt) {
	if (arguments.length == 0) return;

	ZmFolderTreeController.call(this, appCtxt, (type || ZmOrganizer.VOICEMAIL), dropTgt);
}

ZmVoicemailTreeController.prototype = new ZmFolderTreeController;
ZmVoicemailTreeController.prototype.constructor = ZmVoicemailTreeController;


// Public Methods
ZmVoicemailTreeController.prototype.toString =
function() {
	return "ZmVoicemailTreeController";
};

ZmVoicemailTreeController.prototype._createView =
function(params) {
	return new ZmVoicemailTreeView(params);
};

ZmVoicemailTreeController.prototype._getAllowedSubTypes =
function(overviewType) {
	var types = {};
	types[ZmOrganizer.VOICEMAIL] = true;
	return types;
};

ZmVoicemailTreeController.prototype._postSetup =
function(overviewId) {
	ZmTreeController.prototype._postSetup.call(this, overviewId);
	
	// Expand the default account.
	var app = this._appCtxt.getApp(ZmApp.VOICEMAIL);
	if (app.startFolder) {
		var view = this._treeView[overviewId];
		var parentItem = view.getTreeItemById(app.startFolder.parent.id);
		parentItem.setExpanded(true, false);
//TODO: Select the start item here...
	}
};

ZmVoicemailTreeController.prototype.resetOperations =
function(parent, type, id) {
	var folder = this._appCtxt.getById(id);
	parent.enable(ZmOperation.EXPAND_ALL, (folder.size() > 0));
};

// Returns a list of desired header action menu operations
ZmVoicemailTreeController.prototype._getHeaderActionMenuOps =
function() {
	return [ZmOperation.EXPAND_ALL];
};

// Returns a list of desired action menu operations
ZmVoicemailTreeController.prototype._getActionMenuOps =
function() {
	return [ZmOperation.EXPAND_ALL];
};

ZmVoicemailTreeController.prototype._getDropTarget =
function(appCtxt) {
	return (new DwtDropTarget(["ZmVoicemail"]));
};


// Listeners

ZmVoicemailTreeController.prototype._changeListener =
function(ev, treeView, overviewId) {
	ZmFolderTreeController.prototype._changeListener.call(this, ev, treeView, overviewId);

	if (ev.type != this.type) return;

	var organizers = ev.getDetail("organizers");
	if (!organizers && ev.source)
		organizers = [ev.source];

	for (var i = 0; i < organizers.length; i++) {
		var organizer = organizers[i];
		var id = organizer.id;
		var node = treeView.getTreeItemById(id);
		if (!node) continue;

		var fields = ev.getDetail("fields");
//TODO: make changes here....
	}
};

/*
* Called when a left click occurs (by the tree view listener).
*
* @param folder		ZmVoicemailFolder		folder that was clicked
*/
ZmVoicemailTreeController.prototype._itemClicked =
function(folder) {
	this._appCtxt.getApp(ZmApp.VOICEMAIL).search(folder);
};

