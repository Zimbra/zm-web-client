function LmFolderTree(appCtxt) {
	
	LmTree.call(this, LmOrganizer.FOLDER, appCtxt);
	
	this._evt = new LmEvent(LmEvent.S_FOLDER);
}

LmFolderTree.prototype = new LmTree;
LmFolderTree.prototype.constructor = LmFolderTree;

LmFolderTree.prototype.toString = 
function() {
	return "LmFolderTree";
}

LmFolderTree.prototype.loadFromJs =
function(rootFolderObj) {
	this.root = LmFolder.createFromJs(null, rootFolderObj, this);
	this._moveUserFolders();
}

LmFolderTree.prototype.getByPath =
function(path) {
	return this.root ? this.root.getByPath(path) : null;
}

LmFolderTree.prototype._moveUserFolders =
function() {
	var userTop = new Array();
	var searchTop = new Array();
	var children = this.root.children.getArray();
	var addedSep = false;
	for (var i = 0; i < children.length; i++) {
		var child = children[i];
		if (child.id > LmFolder.ID_ROOT && child.id <= LmFolder.LAST_SYSTEM_ID) {
			userTop.push(child);
			if (child.id == LmFolder.ID_TRASH)
				child.addSep = true; // add some space below the last system folder
		} else if (child.id >= LmFolder.FIRST_USER_ID) {
			if (child.type == LmOrganizer.FOLDER)
				userTop.push(child);
			else if (child.type == LmOrganizer.SEARCH)
				searchTop.push(child);
		}
	}

	var name = LmMsg[LmFolderTreeView.MSG_KEY[LmFolder.ID_USER]];
	this.userRoot = new LmFolder(LmFolder.ID_USER, name, this.root, this);
	this.root.children.add(this.userRoot);
	for (var i = 0; i < userTop.length; i++) {
		var userFolder = userTop[i];
		this.root.children.remove(userFolder);
		this.userRoot.children.add(userFolder);
		userFolder.parent = this.userRoot;
	}

	name = LmMsg[LmFolderTreeView.MSG_KEY[LmFolder.ID_SEARCH]];
	this.searchRoot = new LmSearchFolder(LmFolder.ID_SEARCH, name, this.root, this);
	this.root.children.add(this.searchRoot);
	for (var i = 0; i < searchTop.length; i++) {
		var searchFolder = searchTop[i];
		this.root.children.remove(searchFolder);
		this.searchRoot.children.add(searchFolder);
		searchFolder.parent = this.searchRoot;
	}
}

LmFolderTree.prototype._sortFolder =
function(folder) {
	var children = folder.children;
	if (children && children.length) {
		children.sort(LmFolder.sortCompare);
		for (var i = 0; i < children.length; i++)
			this._sortFolder(children[i]);
	}
}
