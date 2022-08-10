/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2008, 2009, 2010, 2011, 2013, 2014, 2015, 2016 Synacor, Inc.
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
 * All portions of the code are Copyright (C) 2008, 2009, 2010, 2011, 2013, 2014, 2015, 2016 Synacor, Inc. All Rights Reserved.
 * ***** END LICENSE BLOCK *****
 */

ZmMailFolderTreeController = function(type, dropTgt) {
    if (arguments.length == 0) return;
	ZmFolderTreeController.apply(this, arguments);
};
ZmMailFolderTreeController.prototype = new ZmFolderTreeController;
ZmMailFolderTreeController.prototype.constructor = ZmMailFolderTreeController;

ZmMailFolderTreeController.prototype.toString =
function() {
	return "ZmMailFolderTreeController";
};

//
// ZmFolderTreeController methods
//

ZmMailFolderTreeController.prototype._updateOverview = function(params) {

	ZmTreeController.prototype._updateOverview.call(this, params);

	// for multi-account allow account header to update based on Inbox's unread count
	var org = params.organizer, fields = params.fields;
	if (appCtxt.multiAccounts && (fields[ZmOrganizer.F_UNREAD] && org.isSystem()) ||
		(fields[ZmOrganizer.F_TOTAL] && (org.nId == ZmFolder.ID_DRAFTS || org.nId == ZmOrganizer.ID_OUTBOX))) {

		var ovc = appCtxt.getApp(ZmApp.MAIL).getOverviewContainer(true);
		if (ovc) {
			ovc.updateLabel(org);
		}
	}
};

ZmMailFolderTreeController.prototype._deleteListener =
function(ev) {
	// check for associated data source
	if (appCtxt.get(ZmSetting.POP_ACCOUNTS_ENABLED)) {
		var organizer = this._getActionedOrganizer(ev);
		if (organizer.isDataSource()) {
			var accounts = appCtxt.getDataSourceCollection().getPopAccountsFor(organizer.id);
			var args = [ organizer.getName(), AjxStringUtil.htmlEncode(accounts[0].getName(), true)];
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

ZmMailFolderTreeController.prototype._dropListener =
function(ev) {
	// check for associated data source
	if ((appCtxt.get(ZmSetting.POP_ACCOUNTS_ENABLED) || appCtxt.get(ZmSetting.IMAP_ACCOUNTS_ENABLED)) && ev.action == DwtDropEvent.DRAG_DROP) {
		var item = ev.srcData.data;
		var organizer = item instanceof ZmOrganizer ? item : null;
		if (organizer && organizer.isDataSource()) {
			var datasources = appCtxt.getDataSourceCollection();
			var popAccounts = appCtxt.get(ZmSetting.POP_ACCOUNTS_ENABLED) ? datasources.getPopAccountsFor(organizer.id) : [];
			var imapAccounts = appCtxt.get(ZmSetting.IMAP_ACCOUNTS_ENABLED) ? datasources.getImapAccountsFor(organizer.id) : [];
		
			if (popAccounts.length || imapAccounts.length) {
				var args = [ organizer.getName(), popAccounts.length ? popAccounts[0].getName() : imapAccounts[0].getName() ];
				var message = AjxMessageFormat.format(popAccounts.length ? ZmMsg.errorMovePopFolder : ZmMsg.errorMoveImapFolder, args);

				var dialog = appCtxt.getMsgDialog();
				dialog.setMessage(message);
				dialog.popup();
				return;
			}
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
			parent.enable(ZmOperation.MOVE_MENU, false)
		}
	}
};

ZmMailFolderTreeController.prototype._doMarkAllRead =
function(organizer) {
	// we're not guaranteed mark-all will succeed, so this is a tiny bit risky
	if (appCtxt.isOffline) {
		appCtxt.getApp(ZmApp.MAIL).clearNewMailBadge();
	}

	ZmTreeController.prototype._doMarkAllRead.apply(this, arguments);
};
