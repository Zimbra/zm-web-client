/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2007, 2009, 2010 Zimbra, Inc.
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
 * Creates an IMAP account.
 * @class
 * This class represents an IMAP account.
 * 
 * @param	{String}	id		the id
 * 
 * @extends		ZmDataSource
 */
ZmImapAccount = function(id) {
	ZmDataSource.call(this, ZmAccount.TYPE_IMAP, id);
};

ZmImapAccount.prototype = new ZmDataSource;
ZmImapAccount.prototype.constructor = ZmImapAccount;


// Constants
/**
 * Defines the "cleartext" port.
 * 
 * @type	int
 */
ZmImapAccount.PORT_CLEAR	= 143;
/**
 * Defines the "ssl" port.
 * 
 * @type	int
 */
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

/**
 * Gets the default port.
 * 
 * @return	{int}		the port
 */
ZmImapAccount.prototype.getDefaultPort =
function() {
	return (this.connectionType == ZmDataSource.CONNECT_SSL)
		? ZmImapAccount.PORT_SSL : ZmImapAccount.PORT_DEFAULT;
};

/**
 * Comparison function for *IMAP* folders. Since IMAP folderId's are *not* well-
 * known, we have to compare their names instead of their ID's.
 * 
 * @param	{ZmFolder}	folderA
 * @param	{ZmFolder}	folderB
 * @return	{int}	0 if the folders are the same; 1 if "a" is before "b"; -1 if "b" is before "a"
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

