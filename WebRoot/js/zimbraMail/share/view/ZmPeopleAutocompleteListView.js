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
	}
	this._toolbarDiv = new DwtComposite(tbParams);
};

ZmPeopleAutocompleteListView.prototype = new ZmAutocompleteListView;
ZmPeopleAutocompleteListView.prototype.constructor = ZmPeopleAutocompleteListView;


ZmPeopleAutocompleteListView.prototype.toString =
function() {
	return "ZmPeopleAutocompleteListView";
};

// Creates the list and its member elements based on the matches we have. Each match becomes a
// row. The first match is automatically selected.
ZmPeopleAutocompleteListView.prototype._set =
function(list) {
	var html = [];
	var idx = 0;

	var table = this._getTable();

	for (var i = 0; i < list.length; i++) {
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
		var data = {
			id: this._htmlElId,
			workPhone: (contact && contact.getAttr(ZmContact.F_workPhone))
		}
		var loc = Dwt.getLocation(rowEl);
		this._toolbarDiv.setDisplay(Dwt.DISPLAY_BLOCK);
		this._toolbarDiv.setLocation(loc.x+40, loc.y+40);
		this._toolbarDiv.getHtmlElement().innerHTML = AjxTemplate.expand("share.Widgets#ZmPeopleAutocompleteListView-toolbar", data);
	}

	ZmAutocompleteListView.prototype._setSelected.apply(this, arguments);
};

ZmPeopleAutocompleteListView.prototype._popdown =
function() {
	this._toolbarDiv.setDisplay(Dwt.DISPLAY_NONE);

	ZmAutocompleteListView.prototype._popdown.apply(this, arguments);
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

