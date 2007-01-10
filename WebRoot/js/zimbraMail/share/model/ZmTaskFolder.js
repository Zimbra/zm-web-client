/*
 * ***** BEGIN LICENSE BLOCK *****
 * Version: ZPL 1.2
 *
 * The contents of this file are subject to the Zimbra Public License
 * Version 1.2 ("License"); you may not use this file except in
 * compliance with the License. You may obtain a copy of the License at
 * http://www.zimbra.com/license
 *
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied. See
 * the License for the specific language governing rights and limitations
 * under the License.
 *
 * The Original Code is: Zimbra Collaboration Suite Web Client
 *
 * The Initial Developer of the Original Code is Zimbra, Inc.
 * Portions created by Zimbra are Copyright (C) 2005, 2006 Zimbra, Inc.
 * All Rights Reserved.
 *
 * Contributor(s):
 *
 * ***** END LICENSE BLOCK *****
 */

/**
*
* @constructor
* @class
*
* @author Parag Shah
*
* @param id			[int]			numeric ID
* @param name		[string]		name
* @param parent		[ZmOrganizer]	parent organizer
* @param tree		[ZmTree]		tree model that contains this organizer
* @param color
* @param url		[string]*		URL for this organizer's feed
* @param owner
* @param zid		[string]*		Zimbra id of owner, if remote share
* @param rid		[string]*		Remote id of organizer, if remote share
* @param restUrl	[string]*		The REST URL of this organizer.
*/
function ZmTaskFolder(id, name, parent, tree, color, url, owner, zid, rid, restUrl) {
	ZmOrganizer.call(this, ZmOrganizer.TASKS, id, name, parent, tree, null, null, url, owner, zid, rid, restUrl);
	this.color = color || ZmOrganizer.DEFAULT_COLOR;
}

ZmTaskFolder.prototype = new ZmOrganizer;
ZmTaskFolder.prototype.constructor = ZmTaskFolder;


// Consts
ZmTaskFolder.DEFAULT_COLOR = ZmOrganizer.C_GRAY;


// Public methods

ZmTaskFolder.prototype.toString =
function() {
	return "ZmTaskFolder";
};

/**
 * Creates a new calendar. The color and flags will be set later in response
 * to the create notification.
 */
ZmTaskFolder.prototype.create =
function(name, color, url, excludeFreeBusy) {
	var soapDoc = AjxSoapDoc.create("CreateFolderRequest", "urn:zimbraMail");
	var folderNode = soapDoc.set("folder");
	folderNode.setAttribute("name", AjxEnv.isSafari ? AjxStringUtil.xmlEncode(name) : name);
	folderNode.setAttribute("l", this.id);
	folderNode.setAttribute("color", color || ZmOrganizer.DEFAULT_COLOR);
	folderNode.setAttribute("view", ZmOrganizer.VIEWS[ZmOrganizer.TASKS]);
	folderNode.setAttribute("f", excludeFreeBusy ? "b#" : "#");
	if (url) folderNode.setAttribute("url", url);

	var errorCallback = new AjxCallback(this, this._handleErrorCreate, [url, name]);
	var appController = this.tree._appCtxt.getAppController();
	appController.sendRequest({soapDoc:soapDoc, asyncMode:true, errorCallback:errorCallback});
};

ZmTaskFolder.prototype._handleErrorCreate =
function(url, name, ex) {
	if (!url && !name) return false;

	var msgDialog = this.tree._appCtxt.getMsgDialog();
	var msg;
	if (name && (ex.code == ZmCsfeException.MAIL_ALREADY_EXISTS)) {
		msg = AjxMessageFormat.format(ZmMsg.errorAlreadyExists, [name]);
	} else if (url) {
		// XXX: change to reflect TASKS not APPOINTMENTS!
		var errorMsg = (ex.code == ZmCsfeException.SVC_PARSE_ERROR) ? ZmMsg.calFeedInvalid : ZmMsg.feedUnreachable;
		msg = AjxMessageFormat.format(errorMsg, url);
	}

	if (msg) {
		msgDialog.reset();
		msgDialog.setMessage(msg, DwtMessageDialog.CRITICAL_STYLE);
		msgDialog.popup();
	}

	return true;
};

ZmTaskFolder.prototype.getName =
function(showUnread, maxLength, noMarkup) {
    if (this.id == ZmOrganizer.ID_ROOT) return ZmMsg.tasks;
    if (this.path) return [this.path, this.name].join("/");
    return this.name;
};

ZmTaskFolder.prototype.getIcon =
function() {
	return this.id == ZmOrganizer.ID_ROOT
		? null
		: (this.link ? "GroupSchedule" : "Task");
};

ZmTaskFolder.prototype.setFreeBusy =
function(exclude, callback, errorCallback) {
	if (this.excludeFreeBusy == exclude) return;
	// NOTE: Don't need to store the value since the response will
	//       report that the object was modified.
	this._organizerAction({action: "fb", attrs: {excludeFreeBusy: exclude ? "1" : "0"}, callback: callback, errorCallback: errorCallback});
};

ZmTaskFolder.prototype.setChecked =
function(checked, batchCmd) {
	if (this.isChecked == checked) return;
	var action = checked ? "check" : "!check";
	this._organizerAction({action: action, batchCmd: batchCmd});
};


// Callbacks

ZmTaskFolder.prototype.notifyCreate =
function(obj) {
	var t = ZmTaskFolder.createFromJs(this, obj, this.tree);
	var i = ZmOrganizer.getSortIndex(t, ZmTaskFolder.sortCompare);
	this.children.add(t, i);
	t._notify(ZmEvent.E_CREATE);
};

ZmTaskFolder.prototype.notifyModify =
function(obj) {
	ZmOrganizer.prototype.notifyModify.call(this, obj);

	var doNotify = false;
	var fields = {};
	if (obj.f != null) {
		this._parseFlags(obj.f);
		// TODO: Should a F_EXCLUDE_FB property be added to ZmOrganizer?
		//       It doesn't make sense to require the base class to know about
		//       all the possible fields in sub-classes. So I'm just using the
		//       modified property name as the key.
		fields["excludeFreeBusy"] = true;
		doNotify = true;
	}

	if (doNotify)
		this._notify(ZmEvent.E_MODIFY, {fields: fields});
};


// Static methods

ZmTaskFolder.createFromJs =
function(parent, obj, tree, path) {
	if (!(obj && obj.id)) return;

	// create calendar, populate, and return
	var tf = new ZmTaskFolder(obj.id, obj.name, parent, tree, obj.color, obj.url, obj.owner, obj.zid, obj.rid, obj.rest);
    if (path) {
        tf.path = path.join("/");
    }
    if (obj.f) {
		tf._parseFlags(obj.f);
	}
    ZmTaskFolder.__traverse(tf, parent, obj, tree, path || []);

    // set shares
	tf._setSharesFromJs(obj);

	return tf;
};

ZmTaskFolder.__traverse =
function(tf, parent, obj, tree, path) {
    var isRoot = obj.id == ZmOrganizer.ID_ROOT;
    if (obj.folder && obj.folder.length) {
        if (!isRoot) path.push(obj.name);
        for (var i = 0; i < obj.folder.length; i++) {
            var folder = obj.folder[i];
            if (folder.view == ZmOrganizer.VIEWS[ZmOrganizer.TASKS]) {
                var childTf = ZmTaskFolder.createFromJs(tf, folder, tree, path);
                tf.children.add(childTf);
            }
            ZmTaskFolder.__traverse(tf, parent, folder, tree, path);
        }
        if (!isRoot) path.pop();
    }
    if (obj.link && obj.link.length) {
        for (var i = 0; i < obj.link.length; i++) {
            var link = obj.link[i];
            if (link.view == ZmOrganizer.VIEWS[ZmOrganizer.TASKS]) {
                var childTf = ZmTaskFolder.createFromJs(tf, link, tree, path);
                tf.children.add(childTf);
            }
        }
    }
};

ZmTaskFolder.checkName =
function(name) {
	return ZmOrganizer.checkName(name);
};

ZmTaskFolder.sortCompare =
function(calA, calB) {
	var check = ZmOrganizer.checkSortArgs(calA, calB);
	if (check != null) return check;

	// links appear after personal calendars
	if (calA.link != calB.link) {
		return calA.link ? 1 : -1;
	}

	// sort by calendar name
	var calAName = calA.name.toLowerCase();
	var calBName = calB.name.toLowerCase();
	if (calAName < calBName) return -1;
	if (calAName > calBName) return 1;
	return 0;
};
