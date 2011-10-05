/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2005, 2006, 2007, 2008, 2009, 2010 Zimbra, Inc.
 *
 * The contents of this file are subject to the Zimbra Public License
 * Version 1.3 ("License"); you may not use this file except in
 * compliance with the License.  You may obtain a copy of the License at
 * http://www.zimbra.com/license.
 *
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * ***** END LICENSE BLOCK *****
 */

/**
 * @overview
 * This file defines the Zimbra Retention Warning dialog, when attempting to delete
 * items that a retention policy specifies should be kept.
 *
 */

/**
 * Creates a retention warning dialog.
 * @class
 * Creates an retention warning can have a "Delete All", "Delete Old" or Cancel buttons
 * "Delete All" will delete all the messages that the user chose for deletion.
 * "Delete Old" will delete those messages of the ones chosen that are unaffectted by the
 * retention policy (i.e. they are older than now - retention_policy_keep_period).
 *
 * @param	{Object}	parent		the parent
 * @param	{Function}	deleteAllCallback   callback to execute for Delete All button
 * @param	{Function}	deleteOlfCallback   callback to execute for Delete Old button
 *
 * @extends DwtMessageDialog
 */

ZmRetentionWarningDialog = function(parent) {

	var deleteAllButton = new DwtDialog_ButtonDescriptor(ZmRetentionWarningDialog.DELETE_ALL_BUTTON, ZmMsg.retentionDeleteAll, DwtDialog.ALIGN_LEFT);
    var deleteOldButton = new DwtDialog_ButtonDescriptor(ZmRetentionWarningDialog.DELETE_OLD_BUTTON, ZmMsg.retentionDeleteOld, DwtDialog.ALIGN_LEFT);
	DwtMessageDialog.call(this, {parent:parent, buttons:[DwtDialog.CANCEL_BUTTON],
                          extraButtons:[deleteAllButton, deleteOldButton], id:"RetentionWarningDialog"});
};

ZmRetentionWarningDialog.prototype = new DwtMessageDialog;
ZmRetentionWarningDialog.prototype.constructor = ZmRetentionWarningDialog;

ZmRetentionWarningDialog.prototype.toString =
function() {
	return "ZmRetentionWarningDialog";
};

//
// Consts
//

ZmRetentionWarningDialog.DELETE_ALL_BUTTON = "RetentionDeleteAll";
ZmRetentionWarningDialog.DELETE_OLD_BUTTON = "RetentionDeleteOld";

