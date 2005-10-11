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

function ZmCalendar(id, name, parent, tree, link) {
	ZmOrganizer.call(this, ZmOrganizer.CALENDAR, id, name, parent, tree);
	this.link = link;
}

ZmCalendar.prototype = new ZmOrganizer;
ZmCalendar.prototype.constructor = ZmCalendar;

ZmCalendar.createFromJs =
function(parent, obj, tree, link) {
	if (!(obj && obj.id)) return;

	// create calendar, populate, and return
	var calendar = new ZmCalendar(obj.id, obj.name, parent, tree, link);
	if (obj.folder && obj.folder.length) {
		for (var i = 0; i < obj.folder.length; i++) {
			if (obj.folder[i].view == ZmItem.MSG_KEY[ZmItem.APPT]) {
				var childCalendar = ZmCalendar.createFromJs(calendar, obj.folder[i], tree, false);
				calendar.children.add(childCalendar);
			}
		}
	}
	if (obj.link && obj.link.length) {
		for (var i = 0; i < obj.link.length; i++) {
			if (obj.link[i].view == ZmItem.MSG_KEY[ZmItem.APPT]) {
				var childCalendar = ZmCalendar.createFromJs(calendar, obj.link[i], tree, true);
				calendar.children.add(childCalendar);
			}
		}
	}
	return calendar;
}

ZmCalendar.sortCompare = 
function(calA, calB) {
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
}

ZmCalendar.checkName =
function(name) {
	return ZmOrganizer.checkName(name);
}

ZmCalendar.prototype.toString = 
function() {
	return "ZmCalendar";
}

ZmCalendar.prototype.notifyModify =
function(obj) {
	var fields = ZmOrganizer.prototype._getCommonFields.call(this, obj);
	var parentId = obj.l;
	/***
	if ((parentId != null) && this.parent.id != parentId) {
		var newParent = this.tree.getById(parentId);
		this.reparent(newParent);
		fields[ZmOrganizer.F_PARENT] = true;
	}
	/***/
	this._eventNotify(ZmEvent.E_MODIFY, this, {fields: fields});
}

ZmCalendar.prototype.dispose =
function() {
	DBG.println(AjxDebug.DBG1, "disposing: " + this.name + ", ID: " + this.id);
	/***
	var isEmptyOp = (this.id == ZmFolder.ID_SPAM || this.id == ZmFolder.ID_TRASH);
	// make sure we're not deleting a system folder (unless we're emptying SPAM or TRASH)
	if (this.id < ZmFolder.FIRST_USER_ID && !isEmptyOp)
		return;
	
	var action = isEmptyOp ? "empty" : "delete";
	var success = this._organizerAction(action);

	if (success) {
		if (isEmptyOp) {
			// emptied Trash or Spam will have no items
			this.numUnread = this.numTotal = 0;
			this._eventNotify(ZmEvent.E_DELETE);
		} else {
			this.tree.deleteLocal([this]);
			this._eventNotify(ZmEvent.E_DELETE);
		}
	}
	/***/
}

ZmCalendar.prototype.getName = 
function() {
	if (this.id == ZmOrganizer.ID_ROOT) {
		return ZmMsg.calendars;
	} 
	return this.name;
}

ZmCalendar.prototype.getIcon = 
function() {
	if (this.id == ZmOrganizer.ID_ROOT) {
		return null;
	}
	return "CalendarFolder";
}
