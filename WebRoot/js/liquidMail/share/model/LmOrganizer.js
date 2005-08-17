/**
* Creates an empty organizer.
* @constructor
* @class
* This class represents an "organizer", which is something used to classify or contain
* items. So far, that's either a tag or a folder. Tags and folders are represented as
* a tree structure, though tags are flat and have only one level below the root. Folders
* can be nested.
*
* @author Conrad Damon
* @param type		folder or tag
* @param id			numeric ID
* @param name		name
* @param parent		parent organizer
* @param tree		tree model that contains this organizer
* @param numUnread	number of unread items for this organizer
* @param numTotal	number of items for this organizer
*/
function LmOrganizer(type, id, name, parent, tree, numUnread, numTotal) {

	if (arguments.length == 0) return;
	
	this.type = type;
	this.id = id;
	this.name = name;
	this.parent = parent;
	this.tree = tree;
	this.numUnread = numUnread || 0;
	this.numTotal = numTotal || 0;

	this.children = new LsVector();
}

// organizer types
LmOrganizer.FOLDER	= LmEvent.S_FOLDER;
LmOrganizer.TAG		= LmEvent.S_TAG;
LmOrganizer.SEARCH	= LmEvent.S_SEARCH;

LmOrganizer.ID_ROOT = 1;

LmOrganizer.SOAP_CMD = new Object();
LmOrganizer.SOAP_CMD[LmOrganizer.FOLDER]	= "FolderAction";
LmOrganizer.SOAP_CMD[LmOrganizer.TAG]		= "TagAction";
LmOrganizer.SOAP_CMD[LmOrganizer.SEARCH]	= "FolderAction";

// fields that can be part of a displayed organizer
var i = 1;
LmOrganizer.F_NAME		= i++;
LmOrganizer.F_UNREAD	= i++;
LmOrganizer.F_TOTAL		= i++;
LmOrganizer.F_PARENT	= i++;
LmOrganizer.F_COLOR		= i++; // tags only
LmOrganizer.F_QUERY		= i++; // saved search only

// Following chars invalid in organizer names: " : /
LmOrganizer.VALID_NAME_CHARS = "[\\w ~`!@#\\$%\\^&\\*\\(\\)\\-\\+=\\{\\}\\[\\];<>,\\.\\?\\|\\\\']";
LmOrganizer.VALID_PATH_CHARS = "[\\w ~`!@#\\$%\\^&\\*\\(\\)\\-\\+=\\{\\}\\[\\];<>,\\.\\?\\|\\\\'\\/]"; // add /
LmOrganizer.VALID_NAME_RE = new RegExp("^" + LmOrganizer.VALID_NAME_CHARS + "+$");

LmOrganizer.MAX_NAME_LENGTH			= 128;	// max allowed by server
LmOrganizer.MAX_DISPLAY_NAME_LENGTH	= 30;	// max we will show

// Abstract methods
LmOrganizer.sortCompare = function(organizerA, organizerB) {}
LmOrganizer.prototype.create = function() {}

/**
* Checks an organizer (folder or tag) name for validity. Returns an error message if the
* name is invalid and null if the name is valid. Note that a name, rather than a path, is
* checked.
*
* @param name		an organizer name
*/
LmOrganizer.checkName =
function(name) {
	if (name.length == 0)
		return LmMsg.nameEmpty;

	if (name.length > LmOrganizer.MAX_NAME_LENGTH)
		return LsStringUtil.resolve(LmMsg.nameTooLong, LmOrganizer.MAX_NAME_LENGTH);

	if (!LmOrganizer.VALID_NAME_RE.test(name))
		return LsStringUtil.resolve(LmMsg.errorInvalidName, name);

	return null;
}

// Public methods

LmOrganizer.prototype.toString = 
function() {
	return "LmOrganizer";
}

/**
* Returns the name of this organizer.
*
* @param showUnread		whether to display the number of unread items (in parens)
* @param maxLength		length in chars to truncate the name to
* @param noMarkup		if true, don't return any HTML
*/
LmOrganizer.prototype.getName = 
function(showUnread, maxLength, noMarkup) {
	var name = (maxLength && this.name.length > maxLength) ? this.name.substring(0, maxLength - 3) + "..." : this.name;
	if (!noMarkup)
		name = LsStringUtil.htmlEncode(name, true);
	if (showUnread && this.numUnread > 0) {
		name = [name, " (", this.numUnread, ")"].join("");
		if (!noMarkup)
			name = ["<b>", name, "</b>"].join("");
	}
	return name;
}

/**
* Assigns the organizer a new name.
*/
LmOrganizer.prototype.rename =
function(name) {
	if (name == this.name) return;
	var success = this._organizerAction("rename", {name: name});
	if (success) {
		this.name = name;
		this._eventNotify(LmEvent.E_RENAME);
	}
}

/**
* Assigns the organizer a new parent, moving it within its tree.
*
* @param newParent		the new parent of this organizer
*/
LmOrganizer.prototype.move =
function(newParent) {
	var newId = (newParent.id > 0) ? newParent.id : LmOrganizer.ID_ROOT;
	if ((newId == this.id || newId == this.parent.id) ||
		(this.type == LmOrganizer.FOLDER && newId == LmFolder.ID_SPAM) ||
		(newParent.isChildOf(this))) {
		return;
	}

	var success = this._organizerAction("move", {l: newId});
	if (success) {
		this.reparent(newParent);
		this._eventNotify(LmEvent.E_MOVE);
		// moving a folder to Trash marks its contents as read
		if (this.type == LmOrganizer.FOLDER && newParent.id == LmFolder.ID_TRASH) {
			this.numUnread = 0;
			this._eventNotify(LmEvent.E_FLAGS, null, {item: this, flag: LmItem.FLAG_UNREAD, state: false});
		}
	}
}

/**
* Deletes an organizer. If it's a folder, the server deletes any contents and/or
* subfolders. If it's Trash or Spam, the server deletes and re-creates the folder.
* In that case, we don't bother to remove it from the UI (and we ignore creates on
* system folders).
*/
LmOrganizer.prototype.dispose =
function() {
	DBG.println(LsDebug.DBG1, "disposing: " + this.name + ", ID: " + this.id);
	var isEmptyOp = (this.type == LmOrganizer.FOLDER && (this.id == LmFolder.ID_SPAM || this.id == LmFolder.ID_TRASH));
	// make sure we're not deleting a system object (unless we're emptying SPAM or TRASH)
	if (this.id < LmTree.CLASS[this.type].FIRST_USER_ID && !isEmptyOp)
		return;
	
	this._organizerAction("delete");
	if (!isEmptyOp) {
		this.tree.deleteLocal([this]);
		this._eventNotify(LmEvent.E_DELETE);
	}
}

LmOrganizer.prototype.markAllRead =
function() {
	var success = this._organizerAction("read", {l: this.id});
	if (success) {
		this.numUnread = 0;
		this._eventNotify(LmEvent.E_FLAGS, null, {item: this, flag: LmItem.FLAG_UNREAD, state: false});
	}
}

/**
* Returns true if this organizer has a child with the given name.
*
* @param name		the name of the organizer to look for
*/
LmOrganizer.prototype.hasChild =
function(name) {
	name = name.toLowerCase();
	var a = this.children.getArray();
	var sz = this.children.size();
	for (var i = 0; i < sz; i++)
		if (a[i].name && (a[i].name.toLowerCase() == name))
			return true;

	return false;
}

LmOrganizer.prototype.reparent =
function(newParent) {
	this.parent.children.remove(this);
	newParent.children.add(this);
	this.parent = newParent;
}

/**
* Returns the organizer with the given ID, wherever it is.
*
* @param id		the ID to search for
*/
LmOrganizer.prototype.getById =
function(id) {
	if (this.id == id)
		return this;
	
	var organizer;
	var a = this.children.getArray();
	var sz = this.children.size();
	for (var i = 0; i < sz; i++) {
		if (organizer = a[i].getById(id))
			return organizer;
	}
	return null;	
}

/**
* Returns the first organizer found with the given name, starting from the root.
*
* @param name		the name to search for
*/
LmOrganizer.prototype.getByName =
function(name) {
	return this._getByName(name.toLowerCase());
}

/**
* Returns the number of children of this organizer.
*/
LmOrganizer.prototype.size =
function() {
	return this.children.size();
}

/**
* Returns true if the given organizer is a descendant of this one.
*
* @param organizer		a possible descendant of ours
*/
LmOrganizer.prototype.isChildOf =
function (organizer) {
	var parent = this.parent;
	while (parent) {
		if (parent == organizer)
			return true;
		parent = parent.parent;
	}
	return false;
}

/**
* Returns true is this is a system tag or folder.
*/
LmOrganizer.prototype.isSystem =
function () {
	return (this.id < LmTree.CLASS[this.type].FIRST_USER_ID);
}

LmOrganizer.getSortIndex =
function(child, sortFunction) {
	if (!sortFunction) return null;
	var children = child.parent.children.getArray();
	for (var i = 0; i < children.length; i++) {
		var test = sortFunction(child, children[i]);
		if (test == -1)
			return i;
	}
	return i;
}

LmOrganizer.prototype._getCommonFields =
function(obj) {
	var name = obj.name;
	var numUnread = obj.u;
	var numTotal = obj.n;
	var fields = new Object();
	if ((name != null) && this.name != name) {
		this.name = name;
		fields[LmOrganizer.F_NAME] = true;
	}
	if ((numUnread != null) && this.numUnread != numUnread) {
		this.numUnread = numUnread;
		fields[LmOrganizer.F_UNREAD] = true;
	}
	if ((numTotal != null) && this.numTotal != numTotal) {
		this.numTotal = numTotal;
		fields[LmOrganizer.F_TOTAL] = true;
	}
	return fields;
}

// General method for handling the SOAP call. 
// NOTE: exceptions need to be handled by calling method!
LmOrganizer.prototype._organizerAction =
function(action, attrs) {
	var cmd = LmOrganizer.SOAP_CMD[this.type];
	var soapDoc = LsSoapDoc.create(cmd + "Request", "urn:liquidMail");
	var actionNode = soapDoc.set("action");
	actionNode.setAttribute("op", action);
	actionNode.setAttribute("id", this.id);
	for (var attr in attrs)
		actionNode.setAttribute(attr, attrs[attr]);
	var appCtlr = this.tree._appCtxt.getAppController();
	appCtlr.setActionedIds([this.id]);
	var resp = appCtlr.sendRequest(soapDoc)[cmd + "Response"];
	var id = parseInt(resp.action.id);
	return id == this.id;
}

// Test the name of this organizer and then descendants against the given name, case insensitively
LmOrganizer.prototype._getByName =
function(name) {
	if (this.name && name == this.name.toLowerCase())
		return this;
		
	var organizer;
	var a = this.children.getArray();
	var sz = this.children.size();
	for (var i = 0; i < sz; i++) {
		if (organizer = a[i]._getByName(name))
			return organizer;
	}
	return null;	
}

// Notify our listeners.
LmOrganizer.prototype._eventNotify =
function(event, organizer, details) {
	organizer = organizer || this;
	if (this.tree._evtMgr.isListenerRegistered(LmEvent.L_MODIFY)) {
		this.tree._evt.set(event, organizer);
		this.tree._evt.setDetails(details);
		this.tree._evtMgr.notifyListeners(LmEvent.L_MODIFY, this.tree._evt);
	}
}
