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
 * @overview
 *
 */

/**
 * Creates a new autocomplete list.
 * @class
 * This class shows the members of an expanded distribution list (DL).
 *
 * @author Conrad Damon
 *
 * @param {Hash}	params			a hash of parameters:
 * @param	{ZmAutocompleteListView}		parent autocomplete list view
 *
 * @extends		ZmAutocompleteListView
 */
ZmDLAutocompleteListView = function(params) {
	ZmAutocompleteListView.call(this, params);
	this._parentAclv = params.parentAclv;
	this._dlScrollDiv = this.getHtmlElement();
	Dwt.setHandler(this._dlScrollDiv, DwtEvent.ONSCROLL, ZmDLAutocompleteListView.handleDLScroll);
};

ZmDLAutocompleteListView.prototype = new ZmAutocompleteListView;
ZmDLAutocompleteListView.prototype.constructor = ZmDLAutocompleteListView;

ZmDLAutocompleteListView.prototype.toString =
function() {
	return "ZmDLAutocompleteListView";
};

ZmDLAutocompleteListView.prototype._set =
function(list, contact) {

	this._matches = [];
	this._addMembers(list);

	// add row for selecting all at top of list
	var dl = appCtxt.getApp(ZmApp.CONTACTS).getDL(contact.getEmail());
	var numMembers = dl.total;
	if (numMembers != 1) {
		var table = this._getTable();
		var row = table.insertRow(0);
		row.className = this._origClass;
		row.id = this._selectAllRowId = this._getId("Row", "selectAll");
		var cell = row.insertCell(-1);
		cell.className = "Icon";
		cell.innerHTML = AjxImg.getImageHtml("Blank16");
		cell = row.insertCell(-1);
		var text = numMembers ? ZmMsg.selectAllMembers : ZmMsg.noMembers;
		cell.innerHTML = AjxMessageFormat.format(text, [dl.total]);
	}

	// autoselect first real row
	AjxTimedAction.scheduleAction(new AjxTimedAction(this,
		function() {
			this._setSelected(this._getId("Row", 1));
		}), 100);
};

ZmDLAutocompleteListView.prototype._addMembers =
function(list) {

	var table = this._getTable();
	var len = list.length;
	for (var i = 0; i < len; i++) {
		var match = list[i];
		this._matches.push(match);
		var rowId = match.id = this._getId("Row", this._matches.length);
		this._addRow(table, match, rowId);
	}
};

ZmDLAutocompleteListView.prototype._addRow =
function(table, match, rowId) {

	if (match && (match.text || match.icon)) {
		this._matchHash[rowId] = match;
		var row = table.insertRow(-1);
		row.className = this._origClass;
		row.id = rowId;
		var cell = row.insertCell(-1);
		cell.className = "Icon";
		if (match.icon) {
			cell.innerHTML = (match.icon.indexOf('Dwt') != -1) ? ["<div class='", match.icon, "'></div>"].join("") :
																  AjxImg.getImageHtml(match.icon);
		} else {
			cell.innerHTML = "&nbsp;";
		}
		cell = row.insertCell(-1);
		cell.innerHTML = match.text || "&nbsp;";
	}
};

ZmDLAutocompleteListView.prototype._update =
function(hasDelim, match, ev) {

	if (this._selected == this._selectAllRowId) {
		if (!this._matchHash[this._selectAllRowId]) {
			var callback = new AjxCallback(this, this._handleResponseGetAllDLMembers, [hasDelim, ev]);
			this._dlContact.getAllDLMembers(callback);
		}
	} else {
		this._doUpdate(hasDelim, ev);
		this.reset(true);
	}
};

ZmDLAutocompleteListView.prototype._handleResponseGetAllDLMembers =
function(hasDelim, ev, result) {

	var mv = this._parentAclv._matchValue;
	var field = (mv instanceof Array) ? mv[0] : mv;
	if (result.list && result.list.length) {
		// see if client wants addresses joined, or one at a time
		if (this._parentAclv._options.massDLComplete) {
			var match = this._matchHash[this._selectAllRowId] = new ZmAutocompleteMatch();
			match[field] = result.list.join(this._parentAclv._separator);
			match.multipleAddresses = true;
			this._doUpdate(hasDelim, ev);
		}
		else {
			for (var i = 0, len = result.list.length; i < len; i++) {
				var match = this._matchHash[this._selectAllRowId] = new ZmAutocompleteMatch();
				match[field] = result.list[i];
				this._doUpdate(hasDelim, ev);
			}
		}
	}
	this.reset(true);
};

ZmDLAutocompleteListView.prototype._doUpdate =
function(hasDelim, ev) {
	var sel = this._matchHash[this._selected];
	this._parentAclv._update(hasDelim, sel, ev);
};

ZmDLAutocompleteListView.handleDLScroll =
function(ev) {

	var target = DwtUiEvent.getTarget(ev);
	var view = DwtControl.findControl(target);
	var div = view._dlScrollDiv;
	if (div.clientHeight == div.scrollHeight) { return; }
	var contactDL = appCtxt.getApp(ZmApp.CONTACTS).getDL(view._dlContact.getEmail());
	var listSize = view.getDLSize();
	if (contactDL && (contactDL.more || (listSize < contactDL.list.length))) {
		var params = {scrollDiv:	div,
					  rowHeight:	view._rowHeight,
					  threshold:	10,
					  limit:		ZmContact.DL_PAGE_SIZE,
					  listSize:		listSize};
		var needed = ZmListView.getRowsNeeded(params);
		DBG.println("dl", "scroll, items needed: " + needed);
		if (needed) {
			DBG.println("dl", "new offset: " + listSize);
			var respCallback = new AjxCallback(null, ZmDLAutocompleteListView._handleResponseDLScroll, [view]);
			view._parentAclv._dataAPI.expandDL(view._dlContact, listSize, respCallback);
		}
	}
};

ZmDLAutocompleteListView._handleResponseDLScroll =
function(view, matches) {
	view._addMembers(matches);
};

ZmDLAutocompleteListView.prototype.getDLSize =
function() {
	return this.size() - 1;
};

// optionally removes the DL address bubble
ZmDLAutocompleteListView.prototype.reset =
function(clearDL) {

	if (clearDL) {
		var dlBubble = document.getElementById(this._dlBubbleId);
		if (dlBubble) {
			var addrInput = DwtControl.ALL_BY_ID[dlBubble._aifId];
			if (addrInput) {
				addrInput.removeBubble(this._dlBubbleId);
				this._dlBubbleId = null;
			}
		}
	}
	ZmAutocompleteListView.prototype.reset.call(this);
};

ZmDLAutocompleteListView.prototype._popup =
function(loc) {

	if (this.getVisible()) { return; }

	loc = loc || this._getDefaultLoc();
	var x = loc.x;
	var windowSize = this.shell.getSize();
	this.setVisible(true);
	var curSize = this.getSize();
	this.setVisible(false);
	var newX = (x + curSize.x >= windowSize.x) ? windowSize.x - curSize.x : x;
	if (newX != x) {
		var parentSize = this._parentAclv.getSize();
		this._parentAclv.setLocation(windowSize.x - (curSize.x + parentSize.x + 2), Dwt.DEFAULT);
		loc.x = newX;
	}
	ZmAutocompleteListView.prototype._popup.call(this, loc);
};

ZmDLAutocompleteListView.prototype._popdown =
function() {
	if (this._parentAclv) {
		this._parentAclv._curExpanded = null;
	}
	ZmAutocompleteListView.prototype._popdown.call(this);
};
