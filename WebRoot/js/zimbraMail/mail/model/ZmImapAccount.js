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

