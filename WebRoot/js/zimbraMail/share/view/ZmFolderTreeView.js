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
			var text = folder ? folder.getName(showUnread) : ZmMsg[ZmFolder.MSG_KEY[id]];
			ti.setText(text);
			if (ZmFolder.IMAGE[id])
				ti.setImage(ZmFolder.IMAGE[id]);
			ti.setData(Dwt.KEY_ID, id);
			// can't drop anything into these folders
			if (id != ZmFolder.ID_CONTACTS && id != ZmFolder.ID_CALENDAR && id != ZmFolder.ID_TAGS)
				ti.setDropTarget(this._dropTgt);
			this._treeHash[id] = ti;
						
			if (folder) {
				this._render(ti, folder, omit);
			} else {
				// create a fake placeholder folder for Tags container, with root folder as parent
				var name = ZmMsg[ZmFolder.MSG_KEY[id]];
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
