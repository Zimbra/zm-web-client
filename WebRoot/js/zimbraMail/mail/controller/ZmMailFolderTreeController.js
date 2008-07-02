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

ZmMailFolderTreeController = function() {
	ZmFolderTreeController.apply(this, arguments);
};
ZmMailFolderTreeController.prototype = new ZmFolderTreeController;
ZmMailFolderTreeController.prototype.constructor = ZmMailFolderTreeController;

ZmMailFolderTreeController.prototype.toString = function() {
	return "ZmMailFolderTreeController";
};

//
// ZmFolderTreeController methods
//

ZmMailFolderTreeController.prototype._deleteListener = function(ev) {
	// check for associated data source
	if (appCtxt.get(ZmSetting.POP_ACCOUNTS_ENABLED)) {
		var organizer = this._getActionedOrganizer(ev);
		if (organizer.isDataSource()) {
			var accounts = appCtxt.getDataSourceCollection().getPopAccountsFor(organizer.id);
			var args = [ organizer.getName(), accounts[0].getName() ];
			var message = AjxMessageFormat.format(ZmMsg.errorDeletePopFolder, args);

			var dialog = appCtxt.getMsgDialog();
			dialog.setMessage(message);
			dialog.popup();
			return;
		}
	}

	// perform default action
	ZmFolderTreeController.prototype._deleteListener.apply(this, arguments);
};

ZmMailFolderTreeController.prototype._dropListener = function(ev) {
	// check for associated data source
	if (appCtxt.get(ZmSetting.POP_ACCOUNTS_ENABLED) && ev.action == DwtDropEvent.DRAG_DROP) {
		var organizer = ev.srcData.data;
		if (organizer.isDataSource()) {
			var accounts = appCtxt.getDataSourceCollection().getPopAccountsFor(organizer.id);
			var args = [ organizer.getName(), accounts[0].getName() ];
			var message = AjxMessageFormat.format(ZmMsg.errorMovePopFolder, args);

			var dialog = appCtxt.getMsgDialog();
			dialog.setMessage(message);
			dialog.popup();
			return;
		}
	}

	// perform default action
	ZmFolderTreeController.prototype._dropListener.apply(this, arguments);
};

ZmMailFolderTreeController.prototype.resetOperations =
function(parent, type, id) {
	// perform default action
	ZmFolderTreeController.prototype.resetOperations.apply(this, arguments);

	// disable move for folders with POP accounts
	if (appCtxt.get(ZmSetting.POP_ACCOUNTS_ENABLED)) {
		var organizer = appCtxt.getById(id);
		if (organizer.isDataSource()) {
			parent.enable(ZmOperation.MOVE, false);
		}
	}
};
