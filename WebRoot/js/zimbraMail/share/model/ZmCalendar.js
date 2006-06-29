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
* @author Andy Clark
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
function ZmCalendar(id, name, parent, tree, color, url, owner, zid, rid, restUrl) {
	ZmOrganizer.call(this, ZmOrganizer.CALENDAR, id, name, parent, tree, null, null, url, owner, zid, rid, restUrl);
	this.color = color || ZmOrganizer.DEFAULT_COLOR;
}

ZmCalendar.prototype = new ZmOrganizer;
ZmCalendar.prototype.constructor = ZmCalendar;


// Consts

ZmCalendar.ID_CALENDAR = ZmOrganizer.ID_CALENDAR;

// Public methods

ZmCalendar.prototype.toString = 
function() {
	return "ZmCalendar";
};

/**
 * Creates a new calendar. The color and flags will be set later in response
 * to the create notification.
 */
ZmCalendar.prototype.create =
function(name, color, url, excludeFreeBusy) {
	var soapDoc = AjxSoapDoc.create("CreateFolderRequest", "urn:zimbraMail");
	var folderNode = soapDoc.set("folder");
	folderNode.setAttribute("name", name);
	folderNode.setAttribute("l", this.id);
	folderNode.setAttribute("view", ZmOrganizer.VIEWS[ZmOrganizer.CALENDAR]);
	if (url) folderNode.setAttribute("url", url);

	var errorCallback = new AjxCallback(this, this._handleErrorCreate, [url, name]);
	var appController = this.tree._appCtxt.getAppController();
	appController.sendRequest({soapDoc: soapDoc, asyncMode: true, errorCallback: errorCallback});

	ZmOrganizer._pending[name] = {};
	ZmOrganizer._pending[name].color = color;
	ZmOrganizer._pending[name].excludeFreeBusy = excludeFreeBusy;
};

ZmCalendar.prototype._handleErrorCreate =
function(url, name, ex) {
	if (!url && !name) return false;
	
	var msgDialog = this.tree._appCtxt.getMsgDialog();
	var msg;
	if (name && (ex.code == ZmCsfeException.MAIL_ALREADY_EXISTS)) {
		msg = AjxMessageFormat.format(ZmMsg.errorAlreadyExists, [ZmMsg.folderLc, name]);
	} else if (url) {
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

ZmCalendar.prototype.getName = 
function() {
	return this.id == ZmOrganizer.ID_ROOT ? ZmMsg.calendars : this.name;
};

ZmCalendar.prototype.getIcon = 
function() {
	return this.id == ZmOrganizer.ID_ROOT 
		? null
		: (this.link ? "GroupSchedule" : "CalendarFolder");
};

ZmCalendar.prototype.setFreeBusy = 
function(exclude) {
	if (this.excludeFreeBusy == exclude) return;
	// NOTE: Don't need to store the value since the response will
	//       report that the object was modified.
	this._organizerAction({action: "fb", attrs: {excludeFreeBusy: exclude ? "1" : "0"}});
};

ZmCalendar.prototype.setChecked = 
function(checked, batchCmd) {
	if (this.isChecked == checked) return;
	var action = checked ? "check" : "!check";
	this._organizerAction({action: action, batchCmd: batchCmd});
};

// Callbacks

ZmCalendar.prototype.notifyCreate =
function(obj) {
	var calendar = ZmCalendar.createFromJs(this, obj, this.tree);
	var index = ZmOrganizer.getSortIndex(calendar, ZmCalendar.sortCompare);
	this.children.add(calendar, index);
	var pending = ZmOrganizer._pending[calendar.name];
	if (pending) {
		calendar.color = pending.color;
		calendar.excludeFreeBusy = pending.excludeFreeBusy;
		var flags = calendar._setFlags();
		calendar.update({f: flags, color: calendar.color});
	}
	delete ZmOrganizer._pending[calendar.name];
	calendar._notify(ZmEvent.E_CREATE);
};

ZmCalendar.prototype.notifyModify =
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

ZmCalendar.createFromJs =
function(parent, obj, tree) {
	if (!(obj && obj.id)) return;

	// create calendar, populate, and return
	var calendar = new ZmCalendar(obj.id, obj.name, parent, tree, obj.color, obj.url, obj.d, obj.zid, obj.rid, obj.rest);
	if (obj.f) {
		calendar._parseFlags(obj.f);
	}
	if (obj.folder && obj.folder.length) {
		for (var i = 0; i < obj.folder.length; i++) {
			var folder = obj.folder[i];
			if (folder.view == ZmOrganizer.VIEWS[ZmOrganizer.CALENDAR]) {
				var childCalendar = ZmCalendar.createFromJs(calendar, folder, tree);
				calendar.children.add(childCalendar);
			}
		}
	}
	if (obj.link && obj.link.length) {
		for (var i = 0; i < obj.link.length; i++) {
			var link = obj.link[i];
			if (link.view == ZmOrganizer.VIEWS[ZmOrganizer.CALENDAR]) {
				var childCalendar = ZmCalendar.createFromJs(calendar, link, tree);
				calendar.children.add(childCalendar);
			}
		}
	}
	
	// set shares
	calendar._setSharesFromJs(obj);
	
	return calendar;
};

ZmCalendar.checkName =
function(name) {
	return ZmOrganizer.checkName(name);
};

ZmCalendar.sortCompare = 
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
