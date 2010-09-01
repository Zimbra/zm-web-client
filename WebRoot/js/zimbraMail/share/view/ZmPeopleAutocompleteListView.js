/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2004, 2005, 2006, 2007, 2008, 2009, 2010 Zimbra, Inc.
 *
 * The contents of this file are subject to the Zimbra Public License
 * Version 1.3 ("License"); you may not use this file except in
 * compliance with the License.  You may obtain a copy of the License at
 * http://www.zimbra.com/license.
 *
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * ***** END LICENSE BLOCK *****
 */

/**
 * Subclass of ZmAutocompleteListView so we can customize the "listview"
 *
 * @param params
 */
ZmPeopleAutocompleteListView = function(params) {
	ZmAutocompleteListView.call(this, params);

	this.addClassName("ZmPeopleAutocompleteListView");
	this.setScrollStyle(DwtControl.CLIP);

	var tbParams = {
		parent: params.parent,
		className: "ZmPeopleSearch-toolbar",
		posStyle: Dwt.ABSOLUTE_STYLE
	};
	this._toolbarDiv = new DwtComposite(tbParams);
	this._toolbarDiv.isToolbar = true;

	this._outsideListener = new AjxListener(null, ZmPeopleAutocompleteListView._outsideMouseDownListener);
};

ZmPeopleAutocompleteListView.prototype = new ZmAutocompleteListView;
ZmPeopleAutocompleteListView.prototype.constructor = ZmPeopleAutocompleteListView;


// Consts

ZmPeopleAutocompleteListView.ACTION_MESSAGE		= "message";
ZmPeopleAutocompleteListView.ACTION_IM			= "IM";
ZmPeopleAutocompleteListView.ACTION_CALL		= "call";
ZmPeopleAutocompleteListView.ACTION_APPT		= "appt";


// Public methods

ZmPeopleAutocompleteListView.prototype.toString =
function() {
	return "ZmPeopleAutocompleteListView";
};

ZmPeopleAutocompleteListView.prototype.show =
function(show, loc) {
	if (!show) {
		this._toolbarDiv.setDisplay(Dwt.DISPLAY_NONE);
	}

	ZmAutocompleteListView.prototype.show.apply(this, arguments);
};


// protected methods

// Creates the list and its member elements based on the matches we have. Each match becomes a
// row. The first match is automatically selected.
ZmPeopleAutocompleteListView.prototype._set =
function(list) {
	var html = [];
	var idx = 0;

	var table = this._getTable();
	this._matches = list;

	for (var i = 0; i < list.length; i++) {
		var match = this._matches[i];
		if (match && (match.text || match.icon)) {
			var rowId = match.id = this._getId("Row", i);
			this._matchHash[rowId] = match;
		}

		var rowId = this._getId("Row", i);
		var contact = list[i].item;
		var email = contact.getEmail();
		var data = {
			id: this._htmlElId,
			rowId: rowId,
			fullName: contact.getFullName(),
			email: email
		};
		var rowHtml = AjxTemplate.expand("share.Widgets#ZmPeopleAutocompleteListView", data);
		var rowEl = table.appendChild(Dwt.parseHtmlFragment(rowHtml, true));
		Dwt.associateElementWithObject(rowEl, contact, "contact");
	}

	AjxTimedAction.scheduleAction(new AjxTimedAction(this,
		function() {
			this._setSelected(this._getId("Row", 0));
		}), 100);
};

ZmPeopleAutocompleteListView.prototype._setSelected =
function(id) {
	if (id == ZmAutocompleteListView.NEXT || id == ZmAutocompleteListView.PREV) {
		var table = document.getElementById(this._tableId);
		var rows = table && table.rows;
		id = this._getRowId(rows, id, rows.length);
		if (!id) { return; }
	}

	var rowEl = document.getElementById(id);
	if (rowEl) {
		var contact = Dwt.getObjectFromElement(rowEl, "contact");

		var canIm;
		if (contact && appCtxt.get(ZmSetting.IM_ENABLED) && ZmImApp.loggedIn()) {
			var imPresence = contact.getImPresence();
			canIm = imPresence && (imPresence.getShow() == ZmRosterPresence.SHOW_ONLINE);
		}

		var data = {
			id: this._htmlElId,
			workPhone: (contact && contact.getAttr(ZmContact.F_workPhone)),
			canIm: canIm,
			rowId: id,
			toolbarId: this._toolbarDiv._htmlElId
		};

		var loc = Dwt.getLocation(rowEl);
		this._toolbarDiv.setDisplay(Dwt.DISPLAY_BLOCK);
		this._toolbarDiv.setLocation(loc.x+40, loc.y+40);
		this._toolbarDiv.getHtmlElement().innerHTML = AjxTemplate.expand("share.Widgets#ZmPeopleAutocompleteListView-toolbar", data);
	}

	ZmAutocompleteListView.prototype._setSelected.apply(this, arguments);
};

ZmPeopleAutocompleteListView.prototype._removeAll =
function() {
	var table = this._getTable();
	for (var i = table.rows.length - 1; i >= 0; i--) {
		var row = table.rows[i];
		var contact = Dwt.getObjectFromElement(row, "contact");
		Dwt.disassociateElementFromObject(row, contact, "contact");
	}

	ZmAutocompleteListView.prototype._removeAll.apply(this, arguments);
};

ZmPeopleAutocompleteListView.doAction =
function(action, rowId, toolbarId) {
	var rowEl = document.getElementById(rowId);
	var contact = rowEl && Dwt.getObjectFromElement(rowEl, "contact");
	if (contact) {
		// hide the autocomplete listview
		var curList = ZmAutocompleteListView._activeAcList;
		if (curList) {
			curList.show(false);
		}

		// then do the action
		switch (action) {
			case ZmPeopleAutocompleteListView.ACTION_MESSAGE:
				var params = {action:ZmOperation.NEW_MESSAGE, toOverride: contact.getEmail()};
				AjxDispatcher.run("Compose", params);
				break;

			case ZmPeopleAutocompleteListView.ACTION_IM:
				AjxDispatcher.require(["IMCore", "IM"]);
				var buddy = contact.getBuddy();
				if (buddy && contact.getImPresence().getShow() == ZmRosterPresence.SHOW_ONLINE) {
					ZmTaskbarController.INSTANCE.chatWithRosterItem(buddy);
				}
				break;

			case ZmPeopleAutocompleteListView.ACTION_CALL:
				var workPhone = contact.getAttr(ZmContact.F_workPhone);
				var phone = Com_Zimbra_Phone.getCallToLink(workPhone);
				Com_Zimbra_Phone.unsetOnbeforeunload();
				window.location = phone;
				break;

			case ZmPeopleAutocompleteListView.ACTION_APPT:
				AjxDispatcher.require(["CalendarCore", "Calendar", "CalendarAppt"]);
				var cc = AjxDispatcher.run("GetCalController");
				var appt = cc.newApptObject((new Date()));
				appt.setAttendees([contact.getEmail()], ZmCalBaseItem.PERSON);
				cc.newAppointment(appt);
				break;
		}
	}
};

ZmPeopleAutocompleteListView._outsideMouseDownListener =
function(ev) {
	var obj = DwtControl.getTargetControl(ev);
	if (obj.isToolbar) { return; }

	var curList = ZmAutocompleteListView._activeAcList;
	if (curList && curList._toolbarDiv) {
		curList._toolbarDiv.setDisplay(Dwt.DISPLAY_NONE);
	}

	ZmAutocompleteListView._outsideMouseDownListener(ev);
};

ZmPeopleAutocompleteListView.prototype._addMouseDownListener =
function() {
	DwtEventManager.addListener(DwtEvent.ONMOUSEDOWN, ZmPeopleAutocompleteListView._outsideMouseDownListener);
	this.shell._setEventHdlrs([DwtEvent.ONMOUSEDOWN]);
	this.shell.addListener(DwtEvent.ONMOUSEDOWN, this._outsideListener);
};

ZmPeopleAutocompleteListView.prototype._removeMouseDownListener =
function() {
	DwtEventManager.removeListener(DwtEvent.ONMOUSEDOWN, ZmPeopleAutocompleteListView._outsideMouseDownListener);
	this.shell._setEventHdlrs([DwtEvent.ONMOUSEDOWN], true);
	this.shell.removeListener(DwtEvent.ONMOUSEDOWN, this._outsideListener);
};

