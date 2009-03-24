/*
 * ***** BEGIN LICENSE BLOCK *****
 * 
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2007 Zimbra, Inc.
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

ZmImapAccount = function(id, list) {
	ZmDataSource.call(this, ZmAccount.IMAP, id, list);
};

ZmImapAccount.prototype = new ZmDataSource;
ZmImapAccount.prototype.constructor = ZmImapAccount;


// Constants
ZmAccount.IMAP				= "IMAP";
ZmImapAccount.PORT_CLEAR	= 143;
ZmImapAccount.PORT_SSL		= 993;
ZmImapAccount.PORT_DEFAULT	= ZmImapAccount.PORT_CLEAR;


// advanced settings
ZmImapAccount.prototype.ELEMENT_NAME = "imap";
ZmImapAccount.prototype.port = ZmImapAccount.PORT_DEFAULT;


// Public methods

ZmImapAccount.prototype.toString =
function() {
	return "ZmImapAccount";
};

ZmImapAccount.prototype.getDefaultPort =
function() {
	return (this.connectionType == ZmDataSource.CONNECT_SSL)
		? ZmImapAccount.PORT_SSL : ZmImapAccount.PORT_DEFAULT;
};

/**
* Comparison function for *IMAP* folders. Since IMAP folderId's are *not* well-
* known, we have to compare their names instead of their ID's.
*/
ZmImapAccount.sortCompare =
function(folderA, folderB) {
	var check = ZmOrganizer.checkSortArgs(folderA, folderB);
	if (check != null) { return check; }

	var aId = ZmFolder.getIdForName(folderA.name);
	var bId = ZmFolder.getIdForName(folderB.name);

	if (ZmFolder.SORT_ORDER[aId] && ZmFolder.SORT_ORDER[bId]) {
		return (ZmFolder.SORT_ORDER[aId] - ZmFolder.SORT_ORDER[bId]);
	}
	if (!ZmFolder.SORT_ORDER[aId] && ZmFolder.SORT_ORDER[bId]) { return 1; }
	if (ZmFolder.SORT_ORDER[aId] && !ZmFolder.SORT_ORDER[bId]) { return -1; }
	if (folderA.name.toLowerCase() > folderB.name.toLowerCase()) { return 1; }
	if (folderA.name.toLowerCase() < folderB.name.toLowerCase()) { return -1; }
	return 0;
};

