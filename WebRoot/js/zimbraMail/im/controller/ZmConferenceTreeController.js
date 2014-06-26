/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2008, 2009, 2010, 2013, 2014 Zimbra, Inc.
 * 
 * The contents of this file are subject to the Common Public Attribution License Version 1.0 (the "License");
 * you may not use this file except in compliance with the License. 
 * You may obtain a copy of the License at: http://www.zimbra.com/license
 * The License is based on the Mozilla Public License Version 1.1 but Sections 14 and 15 
 * have been added to cover use of software over a computer network and provide for limited attribution 
 * for the Original Developer. In addition, Exhibit A has been modified to be consistent with Exhibit B. 
 * 
 * Software distributed under the License is distributed on an "AS IS" basis, 
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. 
 * See the License for the specific language governing rights and limitations under the License. 
 * The Original Code is Zimbra Open Source Web Client. 
 * The Initial Developer of the Original Code is Zimbra, Inc. 
 * All portions of the code are Copyright (C) 2008, 2009, 2010, 2013, 2014 Zimbra, Inc. All Rights Reserved. 
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
