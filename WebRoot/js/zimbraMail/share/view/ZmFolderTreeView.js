function LmFolderTreeView(appCtxt, parent, tree, dragSrc, dropTgt) {

	LmTreeView.call(this, LmOrganizer.FOLDER, appCtxt, parent, tree, dragSrc, dropTgt);
}

LmFolderTreeView.prototype = new LmTreeView;
LmFolderTreeView.prototype.constructor = LmFolderTreeView;

// system folder names
LmFolderTreeView.MSG_KEY = new Object();
LmFolderTreeView.MSG_KEY[LmFolder.ID_INBOX]		= "inbox";
LmFolderTreeView.MSG_KEY[LmFolder.ID_TRASH]		= "trash";
LmFolderTreeView.MSG_KEY[LmFolder.ID_SPAM]		= "junk";
LmFolderTreeView.MSG_KEY[LmFolder.ID_SENT]		= "sent";
LmFolderTreeView.MSG_KEY[LmFolder.ID_DRAFTS]	= "drafts";
LmFolderTreeView.MSG_KEY[LmFolder.ID_USER]		= "folders";
LmFolderTreeView.MSG_KEY[LmFolder.ID_CONTACTS]	= "contacts";
LmFolderTreeView.MSG_KEY[LmFolder.ID_CALENDAR]	= "calendar";
LmFolderTreeView.MSG_KEY[LmFolder.ID_TAGS]		= "tags";
LmFolderTreeView.MSG_KEY[LmFolder.ID_SEARCH]	= "searches";

// system folder icons
LmFolderTreeView.IMAGE = new Object();
LmFolderTreeView.IMAGE[LmFolder.ID_INBOX]		= LmImg.I_MAIL_FOLDER;
LmFolderTreeView.IMAGE[LmFolder.ID_TRASH]		= LmImg.I_TRASH;
LmFolderTreeView.IMAGE[LmFolder.ID_SPAM]		= LmImg.I_SPAM_FOLDER;
LmFolderTreeView.IMAGE[LmFolder.ID_SENT]		= LmImg.I_SENT_FOLDER;
LmFolderTreeView.IMAGE[LmFolder.ID_DRAFTS]		= LmImg.I_DRAFT_FOLDER;
//LmFolderTreeView.IMAGE[LmFolder.ID_USER]		= LmImg.I_FOLDER;
LmFolderTreeView.IMAGE[LmFolder.ID_CONTACTS]	= LmImg.I_CONTACT;
LmFolderTreeView.IMAGE[LmFolder.ID_CALENDAR]	= LmImg.I_APPT;
//LmFolderTreeView.IMAGE[LmFolder.ID_TAGS]		= LmImg.I_TAG_FOLDER;
//LmFolderTreeView.IMAGE[LmFolder.ID_SEARCH]		= LmImg.I_SEARCH_FOLDER;

// Public methods

LmFolderTreeView.prototype.toString = 
function() {
	return "LmFolderTreeView";
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
LmFolderTreeView.prototype.set =
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
		} else if (id == LmFolder.ID_SEP) {
			this._parent.addSeparator();
		} else {
			var folder = folderTree.getById(id);
			if (forceType && folder) {
				if ((forceType == LmOrganizer.FOLDER && folder.type != LmOrganizer.FOLDER) ||
					(forceType == LmOrganizer.SEARCH && !folder.hasSearch()))
					continue;
			}
			var inDialog = (this._parent.parent instanceof LmDialog);
			var isContainer = (!inDialog && (id == LmFolder.ID_USER || id == LmFolder.ID_SEARCH || id == LmFolder.ID_TAGS));
			var className = isContainer ? "overviewPanelHeader" : null;
			var ti = new DwtTreeItem(this._parent, null, null, null, null, className);
			if (isContainer)
				ti.enableSelection(false);
			var text = folder ? folder.getName(showUnread) : LmMsg[LmFolderTreeView.MSG_KEY[id]];
			ti.setText(text);
			if (LmFolderTreeView.IMAGE[id])
				ti.setImage(LmFolderTreeView.IMAGE[id]);
			ti.setData(Dwt.KEY_ID, id);
			// can't drop anything into these folders
			if (id != LmFolder.ID_CONTACTS && id != LmFolder.ID_CALENDAR && id != LmFolder.ID_TAGS)
				ti.setDropTarget(this._dropTgt);
			this._treeHash[id] = ti;
						
			if (folder) {
				this._render(ti, folder, omit);
			} else {
				// create a fake placeholder folder for Tags container, with root folder as parent
				var name = LmMsg[LmFolderTreeView.MSG_KEY[id]];
				folder = new LmFolder(id, name, folderTree, folderTree);
				folderTree.root.children.add(folder);
				if (id == LmFolder.ID_TAGS) {
					tagTreeController = new LmTagTreeController(this._appCtxt, ti, this._tree);
					tagTreeController.show(this._appCtxt.getTagList(), showUnread);
				}
			}
			ti.setData(Dwt.KEY_OBJECT, folder);
		}
	}
	return tagTreeController;
}

LmFolderTreeView.prototype._getIcon = 
function(folder) {
	if (LmFolderTreeView.IMAGE[folder.id])
		return LmFolderTreeView.IMAGE[folder.id];
	else
		return (folder.type == LmOrganizer.SEARCH) ? LmImg.I_SEARCH_FOLDER : LmImg.I_FOLDER;
}
