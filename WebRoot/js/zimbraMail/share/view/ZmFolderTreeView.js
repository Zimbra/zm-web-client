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

function ZmFolderTreeView(appCtxt, parent, tree, dragSrc, dropTgt) {

	ZmTreeView.call(this, ZmOrganizer.FOLDER, appCtxt, parent, tree, dragSrc, dropTgt);
}

ZmFolderTreeView.prototype = new ZmTreeView;
ZmFolderTreeView.prototype.constructor = ZmFolderTreeView;

// system folder names
ZmFolderTreeView.MSG_KEY = new Object();
ZmFolderTreeView.MSG_KEY[ZmFolder.ID_INBOX]		= "inbox";
ZmFolderTreeView.MSG_KEY[ZmFolder.ID_TRASH]		= "trash";
ZmFolderTreeView.MSG_KEY[ZmFolder.ID_SPAM]		= "junk";
ZmFolderTreeView.MSG_KEY[ZmFolder.ID_SENT]		= "sent";
ZmFolderTreeView.MSG_KEY[ZmFolder.ID_DRAFTS]	= "drafts";
ZmFolderTreeView.MSG_KEY[ZmFolder.ID_USER]		= "folders";
ZmFolderTreeView.MSG_KEY[ZmFolder.ID_CONTACTS]	= "contacts";
ZmFolderTreeView.MSG_KEY[ZmFolder.ID_CALENDAR]	= "calendar";
ZmFolderTreeView.MSG_KEY[ZmFolder.ID_TAGS]		= "tags";
ZmFolderTreeView.MSG_KEY[ZmFolder.ID_SEARCH]	= "searches";

// system folder icons
ZmFolderTreeView.IMAGE = new Object();
ZmFolderTreeView.IMAGE[ZmFolder.ID_INBOX]		= "Inbox";
ZmFolderTreeView.IMAGE[ZmFolder.ID_TRASH]		= "Trash";
ZmFolderTreeView.IMAGE[ZmFolder.ID_SPAM]		= "SpamFolder";
ZmFolderTreeView.IMAGE[ZmFolder.ID_SENT]		= "SentFolder";
ZmFolderTreeView.IMAGE[ZmFolder.ID_DRAFTS]		= "DraftFolder";
//ZmFolderTreeView.IMAGE[ZmFolder.ID_USER]		= "Group";
ZmFolderTreeView.IMAGE[ZmFolder.ID_CONTACTS]	= "ContactsFolder";
ZmFolderTreeView.IMAGE[ZmFolder.ID_CALENDAR]	= "CalendarFolder";
//ZmFolderTreeView.IMAGE[ZmFolder.ID_TAGS]		= "TagFolder";
//ZmFolderTreeView.IMAGE[ZmFolder.ID_SEARCH]		= "SearchFolder";

// Public methods

ZmFolderTreeView.prototype.toString = 
function() {
	return "ZmFolderTreeView";
}

/**
* Renders the given list of folders (and any separators). Nodes for subfolders will be
* created, but not displayed until the parent node is expanded. If there is no folder 
* with a given ID, a folder is created. The tags folder will trigger the creation of the
* tag tree controller.
*
* @param folderTree		the tree of folders from the back end
* @param folders		a list of top-level folder IDs to display
* @param showUnread		display the unread count, if any
* @param omit			hash of folder IDs to skip
*/
ZmFolderTreeView.prototype.set =
function(folderTree, folders, showUnread, omit) {
	if (this._dataTree)
		this._dataTree.removeChangeListener(this._dataChangeListener);
	this._dataTree = folderTree;
	this._dataTree.addChangeListener(this._dataChangeListener);
	this._showUnread = showUnread;

	var tagTreeController = null;
	var forceType = this._restrictedType;
	if (this._parent == this._tree)
		this._tree.clear();
	for (var i = 0; i < folders.length; i++) {
		var id = folders[i];
		if (omit && omit[id]) {
			continue;
		} else if (id == ZmFolder.ID_SEP) {
			this._parent.addSeparator();
		} else {
			var folder = folderTree.getById(id);
			if (forceType && folder) {
				if ((forceType == ZmOrganizer.FOLDER && folder.type != ZmOrganizer.FOLDER) ||
					(forceType == ZmOrganizer.SEARCH && !folder.hasSearch()))
					continue;
			}
			var inDialog = (this._parent.parent instanceof ZmDialog);
			var isContainer = (!inDialog && (id == ZmFolder.ID_USER || id == ZmFolder.ID_SEARCH || id == ZmFolder.ID_TAGS));
			var className = isContainer ? "overviewPanelHeader" : null;
			var ti = new DwtTreeItem(this._parent, null, null, null, null, className);
			if (isContainer)
				ti.enableSelection(false);
			var text = folder ? folder.getName(showUnread) : ZmMsg[ZmFolderTreeView.MSG_KEY[id]];
			ti.setText(text);
			if (ZmFolderTreeView.IMAGE[id])
				ti.setImage(ZmFolderTreeView.IMAGE[id]);
			ti.setData(Dwt.KEY_ID, id);
			// can't drop anything into these folders
			if (id != ZmFolder.ID_CONTACTS && id != ZmFolder.ID_CALENDAR && id != ZmFolder.ID_TAGS)
				ti.setDropTarget(this._dropTgt);
			this._treeHash[id] = ti;
						
			if (folder) {
				this._render(ti, folder, omit);
			} else {
				// create a fake placeholder folder for Tags container, with root folder as parent
				var name = ZmMsg[ZmFolderTreeView.MSG_KEY[id]];
				folder = new ZmFolder(id, name, folderTree, folderTree);
				folderTree.root.children.add(folder);
				if (id == ZmFolder.ID_TAGS) {
					tagTreeController = new ZmTagTreeController(this._appCtxt, ti, this._tree);
					tagTreeController.show(this._appCtxt.getTagList(), showUnread);
				}
			}
			ti.setData(Dwt.KEY_OBJECT, folder);
		}
	}
	return tagTreeController;
}

ZmFolderTreeView.prototype._getIcon = 
function(folder) {
	if (ZmFolderTreeView.IMAGE[folder.id])
		return ZmFolderTreeView.IMAGE[folder.id];
	else
		return (folder.type == ZmOrganizer.SEARCH) ? "SearchFolder": "Folder";
}
