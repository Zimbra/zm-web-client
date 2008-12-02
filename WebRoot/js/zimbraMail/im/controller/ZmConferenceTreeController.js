/*
 * ***** BEGIN LICENSE BLOCK *****
 *
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2008 Zimbra, Inc.
 *
 * The contents of this file are subject to the Yahoo! Public License
 * Version 1.0 ("License"); you may not use this file except in
 * compliance with the License.  You may obtain a copy of the License at
 * http://www.zimbra.com/license.
 *
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied.
 *
 * ***** END LICENSE BLOCK *****
 */

ZmConferenceTreeController = function() {

	ZmTreeController.call(this, ZmOrganizer.CONFERENCE_ITEM);
};

ZmConferenceTreeController.prototype = new ZmTreeController;
ZmConferenceTreeController.prototype.constructor = ZmConferenceTreeController;


// Public Methods
ZmConferenceTreeController.prototype.toString =
function() {
	return "ZmConferenceTreeController";
};

ZmConferenceTreeController.prototype.getDataTree =
function() {
	var result = ZmImApp.INSTANCE.getRoster().getConferenceTree();
	if (!this._dataChangeListener) {
		result.addChangeListener(this._getTreeChangeListener());
	}
	return result;
};

ZmConferenceTreeController.prototype.resetOperations =
function(parent, type, id) {
	var folder = appCtxt.getById(id);
	parent.enable(ZmOperation.EXPAND_ALL, (folder.size() > 0));
};

ZmConferenceTreeController.prototype._treeListener =
function(ev) {
	ZmTreeController.prototype._treeListener.apply(this, arguments);

	if (ev.detail == DwtTree.ITEM_EXPANDED) {
		var organizer = ev && ev.item && ev.item.getData(Dwt.KEY_OBJECT);
		if ((organizer instanceof ZmConferenceService) && !organizer.roomsLoaded) {
			organizer.getRooms();
		}
	}
};

// Returns a list of desired header action menu operations
ZmConferenceTreeController.prototype._getHeaderActionMenuOps =
function() {
	return null;
};

ZmConferenceTreeController.prototype._getActionMenu =
function(ev) {
	return null;
};

ZmConferenceTreeController.prototype._itemDblClicked =
function() {
	var organizer = ev && ev.item && ev.item.getData(Dwt.KEY_OBJECT);
	if (organizer instanceof ZmConferenceRoom) {
		alert('Come on in...');
	}
};
