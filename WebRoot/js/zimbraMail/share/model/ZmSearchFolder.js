/*
 * ***** BEGIN LICENSE BLOCK *****
 * Version: ZPL 1.1
 * 
 * The contents of this file are subject to the Zimbra Public License
 * Version 1.1 ("License"); you may not use this file except in
 * compliance with the License. You may obtain a copy of the License at
 * http://www.zimbra.com/license
 * 
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied. See
 * the License for the specific language governing rights and limitations
 * under the License.
 * 
 * The Original Code is: Zimbra Collaboration Suite.
 * 
 * The Initial Developer of the Original Code is Zimbra, Inc.
 * Portions created by Zimbra are Copyright (C) 2005 Zimbra, Inc.
 * All Rights Reserved.
 * 
 * Contributor(s):
 * 
 * ***** END LICENSE BLOCK *****
 */

function ZmSearchFolder(id, name, parent, tree, numUnread, query, types, sortBy) {

	ZmFolder.call(this, id, name, parent, tree, numUnread);
	
	this.type = ZmOrganizer.SEARCH;
	this.query = query;
}

ZmSearchFolder.prototype = new ZmFolder;
ZmSearchFolder.prototype.constructor = ZmSearchFolder;

ZmSearchFolder.ID_ROOT = ZmOrganizer.ID_ROOT;

ZmSearchFolder.createFromJs =
function(parent, obj, tree) {
	if (!(obj && obj.id)) return;
	
	// check ID - can't be lower than root, or in tag range
	if (obj.id < ZmFolder.ID_ROOT || (obj.id > ZmFolder.LAST_SYSTEM_ID && obj.id < ZmFolder.FIRST_USER_ID)) return;

	var types = obj.types ? obj.types.split(",") : null;
	var folder = new ZmSearchFolder(obj.id, obj.name, parent, tree, obj.u, obj.query, types, obj.sortBy);

	// a search may only contain other searches
	if (obj.search && obj.search.length) {
		for (var i = 0; i < obj.search.length; i++) {
			var childFolder = ZmSearchFolder.createFromJs(folder, obj.search[i], tree);
			if (childFolder)
				folder.children.add(childFolder);
		}
	}

	return folder;
}

ZmSearchFolder.prototype.getName = 
function(showUnread, maxLength, noMarkup) {
	if (this.id == ZmOrganizer.ID_ROOT) {
		return ZmMsg.searches;
	} else {
		return ZmOrganizer.prototype.getName.call(this, showUnread, maxLength, noMarkup);
	}
}
