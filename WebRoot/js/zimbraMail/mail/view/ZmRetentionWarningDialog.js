/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2011, 2013, 2014, 2016 Synacor, Inc.
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
 * All portions of the code are Copyright (C) 2011, 2013, 2014, 2016 Synacor, Inc. All Rights Reserved.
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
 * Creates an retention warning can have a "Delete All", "Delete Valid" or Cancel buttons
 * "Delete All"   will delete all the messages that the user chose for deletion.
 * "Delete Valid" will delete those messages of the ones chosen that are unaffected by the
 *                retention policy (i.e. they are older than now - retention_policy_keep_period, or
 *                are in a folder that does not have a retention policy).
 *
 * @param	{Object}	parent		the parent
 *
 * @extends DwtMessageDialog
 */

ZmRetentionWarningDialog = function(parent) {

	var deleteAllButton   = new DwtDialog_ButtonDescriptor(ZmRetentionWarningDialog.DELETE_ALL_BUTTON,   ZmMsg.retentionDeleteAll,   DwtDialog.ALIGN_LEFT);
    var deleteValidButton = new DwtDialog_ButtonDescriptor(ZmRetentionWarningDialog.DELETE_VALID_BUTTON, ZmMsg.retentionDeleteValid, DwtDialog.ALIGN_LEFT);
	DwtMessageDialog.call(this, {parent:parent, buttons:[DwtDialog.CANCEL_BUTTON],
                          extraButtons:[deleteAllButton, deleteValidButton], id:"RetentionWarningDialog"});
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

ZmRetentionWarningDialog.DELETE_ALL_BUTTON   = "RetentionDeleteAll";
ZmRetentionWarningDialog.DELETE_VALID_BUTTON = "RetentionDeleteValid";

