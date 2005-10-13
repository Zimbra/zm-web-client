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
function ZmOrganizer(type, id, name, parent, tree, numUnread, numTotal) {

	if (arguments.length == 0) return;
	
	this.type = type;
	this.id = id;
	this.name = name;
	this.parent = parent;
	this.tree = tree;
	this.numUnread = numUnread || 0;
	this.numTotal = numTotal || 0;

	if (id && tree)
		tree._appCtxt.cacheSet(id, this);

	this.children = new AjxVector();
}

// organizer types
ZmOrganizer.FOLDER	= ZmEvent.S_FOLDER;
ZmOrganizer.TAG		= ZmEvent.S_TAG;
ZmOrganizer.SEARCH	= ZmEvent.S_SEARCH;
ZmOrganizer.CALENDAR = ZmEvent.S_APPT;

// defined in com.zimbra.cs.mailbox.Mailbox
ZmOrganizer.ID_ROOT = 1;
ZmOrganizer.ID_CALENDAR = 10;

ZmOrganizer.SOAP_CMD = new Object();
ZmOrganizer.SOAP_CMD[ZmOrganizer.FOLDER]	= "FolderAction";
ZmOrganizer.SOAP_CMD[ZmOrganizer.TAG]		= "TagAction";
ZmOrganizer.SOAP_CMD[ZmOrganizer.SEARCH]	= "FolderAction";
ZmOrganizer.SOAP_CMD[ZmOrganizer.CALENDAR]	= "FolderAction";

// fields that can be part of a displayed organizer
var i = 1;
ZmOrganizer.F_NAME		= i++;
ZmOrganizer.F_UNREAD	= i++;
ZmOrganizer.F_TOTAL		= i++;
ZmOrganizer.F_PARENT	= i++;
ZmOrganizer.F_COLOR		= i++; // tags only
ZmOrganizer.F_QUERY		= i++; // saved search only
ZmOrganizer.F_SHARES	= i++;

// Following chars invalid in organizer names: " : /
ZmOrganizer.VALID_NAME_CHARS = "[\\w ~`!@#\\$%\\^&\\*\\(\\)\\-\\+=\\{\\}\\[\\];<>,\\.\\?\\|\\\\']";
ZmOrganizer.VALID_PATH_CHARS = "[\\w ~`!@#\\$%\\^&\\*\\(\\)\\-\\+=\\{\\}\\[\\];<>,\\.\\?\\|\\\\'\\/]"; // add /
ZmOrganizer.VALID_NAME_RE = new RegExp("^" + ZmOrganizer.VALID_NAME_CHARS + "+$");

ZmOrganizer.MAX_NAME_LENGTH			= 128;	// max allowed by server
ZmOrganizer.MAX_DISPLAY_NAME_LENGTH	= 30;	// max we will show

// colors - these are the server values
ZmOrganizer.C_ORANGE	= 0;
ZmOrganizer.C_BLUE		= 1;
ZmOrganizer.C_CYAN		= 2;
ZmOrganizer.C_GREEN		= 3;
ZmOrganizer.C_PURPLE	= 4;
ZmOrganizer.C_RED		= 5;
ZmOrganizer.C_YELLOW	= 6;
ZmOrganizer.C_PINK		= 7;
ZmOrganizer.C_GRAY		= 8;
ZmOrganizer.MAX_COLOR	= ZmOrganizer.C_GRAY;
ZmOrganizer.DEFAULT_COLOR = ZmOrganizer.C_ORANGE;

// color names
ZmOrganizer.COLOR_TEXT = new Object();
ZmOrganizer.COLOR_TEXT[ZmOrganizer.C_ORANGE]	= ZmMsg.orange;
ZmOrganizer.COLOR_TEXT[ZmOrganizer.C_BLUE]		= ZmMsg.blue;
ZmOrganizer.COLOR_TEXT[ZmOrganizer.C_CYAN]		= ZmMsg.cyan;
ZmOrganizer.COLOR_TEXT[ZmOrganizer.C_GREEN]		= ZmMsg.green;
ZmOrganizer.COLOR_TEXT[ZmOrganizer.C_PURPLE]	= ZmMsg.purple;
ZmOrganizer.COLOR_TEXT[ZmOrganizer.C_RED]		= ZmMsg.red;
ZmOrganizer.COLOR_TEXT[ZmOrganizer.C_YELLOW]	= ZmMsg.yellow;
ZmOrganizer.COLOR_TEXT[ZmOrganizer.C_PINK]		= ZmMsg.pink;
ZmOrganizer.COLOR_TEXT[ZmOrganizer.C_GRAY]		= ZmMsg.gray;

ZmOrganizer.COLORS = [];
ZmOrganizer.COLOR_CHOICES = [];
for (var i = 0; i <= ZmOrganizer.MAX_COLOR; i++) {
	var color = ZmOrganizer.COLOR_TEXT[i];
	ZmOrganizer.COLORS.push(color);
	ZmOrganizer.COLOR_CHOICES.push( { value: i, label: color } );
}

// Static methods

ZmOrganizer.prototype._setSharesFromJs = function(obj) {
	if (obj.acl && obj.acl.grant && obj.acl.grant.length > 0) {
		var shares = new Array(obj.acl.grant.length);
		for (var i = 0; i < obj.acl.grant.length; i++) {
			var grant = obj.acl.grant[i];
			shares[i] = ZmOrganizerShare.createFromJs(this, grant);
		}
		this.setShares(shares);
	}
}

// Abstract methods
ZmOrganizer.sortCompare = function(organizerA, organizerB) {}
ZmOrganizer.prototype.create = function() {}

/**
* Checks an organizer (folder or tag) name for validity. Returns an error message if the
* name is invalid and null if the name is valid. Note that a name, rather than a path, is
* checked.
*
* @param name		an organizer name
*/
ZmOrganizer.checkName =
function(name) {
	if (name.length == 0)
		return ZmMsg.nameEmpty;

	if (name.length > ZmOrganizer.MAX_NAME_LENGTH)
		return AjxStringUtil.resolve(ZmMsg.nameTooLong, ZmOrganizer.MAX_NAME_LENGTH);

	if (!ZmOrganizer.VALID_NAME_RE.test(name))
		return AjxStringUtil.resolve(ZmMsg.errorInvalidName, name);

	return null;
}

ZmOrganizer.checkColor =
function(color) {
	return ((color != null) && (color >= 0 && color <= ZmOrganizer.MAX_COLOR)) ? color : ZmOrganizer.DEFAULT_COLOR;
}

// Public methods

ZmOrganizer.prototype.toString = 
function() {
	return "ZmOrganizer";
}

/**
* Returns the name of this organizer.
*
* @param showUnread		whether to display the number of unread items (in parens)
* @param maxLength		length in chars to truncate the name to
* @param noMarkup		if true, don't return any HTML
*/
ZmOrganizer.prototype.getName = 
function(showUnread, maxLength, noMarkup) {
	var name = (maxLength && this.name.length > maxLength) ? this.name.substring(0, maxLength - 3) + "..." : this.name;
	if (!noMarkup)
		name = AjxStringUtil.htmlEncode(name, true);
	if (showUnread && this.numUnread > 0) {
		name = [name, " (", this.numUnread, ")"].join("");
		if (!noMarkup)
			name = ["<b>", name, "</b>"].join("");
	}
	return name;
}

/** NOTE: Does not notify change. */
ZmOrganizer.prototype.setShares = function(shares) {
	this.shares = shares;
}

/** NOTE: Does not notify change. */
ZmOrganizer.prototype.addShare = function(share) {
	if (!this.shares) {
		this.shares = [];
	}
	this.shares.push(share);
}

ZmOrganizer.prototype.getIcon = function() {};

// Actions

/**
* Assigns the organizer a new name.
*/
ZmOrganizer.prototype.rename =
function(name) {
	if (name == this.name) return;
	this._organizerAction("rename", {name: name});
}

ZmOrganizer.prototype.setColor =
function(color) {
	var color = ZmOrganizer.checkColor(color);
	if (this.color == color) return;
	this._organizerAction("color", {color: color});
}

/**
* Assigns the organizer a new parent, moving it within its tree.
*
* @param newParent		the new parent of this organizer
*/
ZmOrganizer.prototype.move =
function(newParent) {
	var newId = (newParent.id > 0) ? newParent.id : ZmOrganizer.ID_ROOT;
	if ((newId == this.id || newId == this.parent.id) ||
		(this.type == ZmOrganizer.FOLDER && newId == ZmFolder.ID_SPAM) ||
		(newParent.isChildOf(this))) {
		return;
	}

	this._organizerAction("move", {l: newId});
}

/**
* Deletes an organizer. If it's a folder, the server deletes any contents and/or
* subfolders. If it's Trash or Spam, the server deletes and re-creates the folder.
* In that case, we don't bother to remove it from the UI (and we ignore creates on
* system folders).
*/
ZmOrganizer.prototype._delete =
function() {
	DBG.println(AjxDebug.DBG1, "deleting: " + this.name + ", ID: " + this.id);
	var isEmptyOp = (this.type == ZmOrganizer.FOLDER && (this.id == ZmFolder.ID_SPAM || this.id == ZmFolder.ID_TRASH));
	// make sure we're not deleting a system object (unless we're emptying SPAM or TRASH)
	if (this.id < ZmTree.CLASS[this.type].FIRST_USER_ID && !isEmptyOp)
		return;
	
	this._organizerAction("delete");
}

ZmOrganizer.prototype.markAllRead =
function() {
	this._organizerAction("read", {l: this.id});
}

// Notification handling

ZmOrganizer.prototype.notifyDelete =
function() {
	this.deleteLocal();
	this._eventNotify(ZmEvent.E_DELETE);
}

ZmOrganizer.prototype.notifyCreate = function() {};

/*
* Handle modifications to fields that organizers have in general.
*
* @param obj	[Object]	a "modified" notification
*/
ZmOrganizer.prototype.notifyModify =
function(obj) {
	var doNotify = false;
	var fields = new Object();
	if (obj.name != null && this.name != obj.name) {
		this.name = obj.name;
		fields[ZmOrganizer.F_NAME] = true;
		this.parent.children.sort(ZmTreeView.COMPARE_FUNC[this.type]);
		doNotify = true;
	}
	if (obj.u != null && this.numUnread != obj.u) {
		this.numUnread = obj.u;
		fields[ZmOrganizer.F_UNREAD] = true;
		doNotify = true;
	}
	if (obj.n != null && this.numTotal != obj.n) {
		this.numTotal = obj.n;
		fields[ZmOrganizer.F_TOTAL] = true;
		doNotify = true;
	}
	if (obj.color) {
		var color = ZmOrganizer.checkColor(obj.color);
		if (this.color != color) {
			this.color = color;
			fields[ZmOrganizer.F_COLOR] = true;
		}
		doNotify = true;
	}
	
	if (doNotify)
		this._eventNotify(ZmEvent.E_MODIFY, this, {fields: fields});

	if (obj.l != null && obj.l != this.parent.id) {
		var newParent = this._getNewParent(obj.l);
		this.reparent(newParent);
		this._eventNotify(ZmEvent.E_MOVE);
		// could be moving search between Folders and Searches - make sure
		// it has the correct tree
		this.tree = newParent.tree; 
	}
}

// Local change handling

ZmOrganizer.prototype.deleteLocal =
function() {
	this.children.removeAll();
	this.parent.children.remove(this);
}

/**
* Returns true if this organizer has a child with the given name.
*
* @param name		the name of the organizer to look for
*/
ZmOrganizer.prototype.hasChild =
function(name) {
	name = name.toLowerCase();
	var a = this.children.getArray();
	var sz = this.children.size();
	for (var i = 0; i < sz; i++)
		if (a[i].name && (a[i].name.toLowerCase() == name))
			return true;

	return false;
}

ZmOrganizer.prototype.reparent =
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
ZmOrganizer.prototype.getById =
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
ZmOrganizer.prototype.getByName =
function(name) {
	return this._getByName(name.toLowerCase());
}

/**
* Returns the number of children of this organizer.
*/
ZmOrganizer.prototype.size =
function() {
	return this.children.size();
}

/**
* Returns true if the given organizer is a descendant of this one.
*
* @param organizer		a possible descendant of ours
*/
ZmOrganizer.prototype.isChildOf =
function (organizer) {
	var parent = this.parent;
	while (parent) {
		if (parent == organizer)
			return true;
		parent = parent.parent;
	}
	return false;
}

/*
* Returns the organizer with the given ID. Looks in this organizer's tree.
*
* @param parentId	[int]		ID of the organizer to find
*/
ZmOrganizer.prototype._getNewParent =
function(parentId) {
	return this.tree.getById(parentId);
}

/**
* Returns true is this is a system tag or folder.
*/
ZmOrganizer.prototype.isSystem =
function () {
	return (this.id < ZmTree.CLASS[this.type].FIRST_USER_ID);
}

ZmOrganizer.getSortIndex =
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

// General method for handling the SOAP call. 
// NOTE: exceptions need to be handled by calling method!
ZmOrganizer.prototype._organizerAction =
function(action, attrs) {
	var cmd = ZmOrganizer.SOAP_CMD[this.type];
	var soapDoc = AjxSoapDoc.create(cmd + "Request", "urn:zimbraMail");
	var actionNode = soapDoc.set("action");
	actionNode.setAttribute("op", action);
	actionNode.setAttribute("id", this.id);
	for (var attr in attrs)
		actionNode.setAttribute(attr, attrs[attr]);
	var appCtlr = this.tree._appCtxt.getAppController();
	appCtlr.sendRequest(soapDoc, true);
}

// Test the name of this organizer and then descendants against the given name, case insensitively
ZmOrganizer.prototype._getByName =
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

ZmOrganizer.prototype.addChangeListener = function(listener) {
	this.tree.addChangeListener(listener);
}
ZmOrganizer.prototype.removeChangeListener = function(listener) {
	this.tree.removeChangeListener(listener);
}

// Notify our listeners.
ZmOrganizer.prototype._eventNotify =
function(event, organizer, details) {
	organizer = organizer || this;
	if (this.tree._evtMgr.isListenerRegistered(ZmEvent.L_MODIFY)) {
		this.tree._evt.set(event, organizer);
		this.tree._evt.setDetails(details);
		this.tree._evtMgr.notifyListeners(ZmEvent.L_MODIFY, this.tree._evt);
	}
}

//
// ZmOrganizerShare
//

function ZmOrganizerShare(organizer, granteeType, granteeId, granteeName, perm, inherit) {
	this.organizer = organizer;
	this.granteeType = granteeType;
	this.granteeId = granteeId;
	this.granteeName = granteeName;
	this.perm = perm;
	this.inherit = inherit;
}

// Static methods

ZmOrganizerShare.createFromJs = function(parent, grant) {
	return new ZmOrganizerShare(parent, grant.gt, grant.zid, grant.d, grant.perm, grant.inh);
}

// Public methods

ZmOrganizerShare.prototype.setPermissions = function(perm) {
	if (this.perm == perm) return;
	var success = this._organizerShareAction("grant", null, {perm: perm});
	if (success) {
		this.perm = perm;
		var fields = new Object();
		fields[ZmOrganizer.F_SHARES] = true;
		this.organizer._eventNotify(ZmEvent.E_MODIFY, this.organizer, {fields: fields});
	}
}

ZmOrganizerShare.prototype.isRead = function() {
	return this.perm.indexOf('r') != -1;
}
ZmOrganizerShare.prototype.isWrite = function() {
	return this.perm.indexOf('w') != -1;
}
ZmOrganizerShare.prototype.isInsert = function() {
	return this.perm.indexOf('i') != -1;
}
ZmOrganizerShare.prototype.isDelete = function() {
	return this.perm.indexOf('d') != -1;
}
ZmOrganizerShare.prototype.isAdminister = function() {
	return this.perm.indexOf('a') != -1;
}
ZmOrganizerShare.prototype.isWorkflow = function() {
	return this.perm.indexOf('x') != -1;
}

ZmOrganizerShare.prototype.revoke = function() {
	var success = this._organizerShareAction("!grant", { zid: this.granteeId } );
	if (success) {
		var index = this._indexOf(this.granteeName);
		this.organizer.shares.splice(index,1);
	
		var fields = new Object();
		fields[ZmOrganizer.F_SHARES] = true;
		this.organizer._eventNotify(ZmEvent.E_MODIFY, this.organizer, {fields: fields});
	}
}

// Protected methods

ZmOrganizerShare.prototype._indexOf = function(granteeName) {
	for (var i = 0; i < this.organizer.shares.length; i++) {
		if (this.organizer.shares[i].granteeName == granteeName) {
			return i;
		}
	}
	return -1;
}

/**
 * General method for handling the SOAP call. 
 * <p>
 * <strong>Note:</strong>
 * Exceptions need to be handled by calling method.
 */
ZmOrganizerShare.prototype._organizerShareAction =
function(operation, actionAttrs, grantAttrs) {
	var soapDoc = AjxSoapDoc.create("FolderActionRequest", "urn:zimbraMail");
	
	var actionNode = soapDoc.set("action");
	actionNode.setAttribute("op", operation);
	actionNode.setAttribute("id", this.organizer.id);
	for (var attr in actionAttrs) {
		actionNode.setAttribute(attr, actionAttrs[attr]);
	}
	
	var shareNode = soapDoc.set("grant", null, actionNode);
	shareNode.setAttribute("gt", this.granteeType);
	shareNode.setAttribute("d", this.granteeName);
	for (var attr in grantAttrs) {
		shareNode.setAttribute(attr, grantAttrs[attr]);
	}
	
	var appCtlr = this.organizer.tree._appCtxt.getAppController();
	var resp = appCtlr.sendRequest(soapDoc)["FolderActionResponse"];
	
	var id = parseInt(resp.action.id);
	return (id == this.organizer.id);
}
