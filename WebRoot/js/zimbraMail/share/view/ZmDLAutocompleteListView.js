/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2010, 2011, 2012, 2013, 2014, 2015, 2016 Synacor, Inc.
 *
 * The contents of this file are subject to the Common Public Attribution License Version 1.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at: https://www.zimbra.com/license
 * The License is based on the Mozilla Public License Version 1.1 but Sections 14 and 15
 * have been added to cover use of software over a computer network and provide for limited attribution
 * for the Original Developer. In addition, Exhibit A has been modified to be consistent with Exhibit B.
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * See the License for the specific language governing rights and limitations under the License.
 * The Original Code is Zimbra Open Source Web Client.
 * The Initial Developer of the Original Code is Zimbra, Inc.  All rights to the Original Code were
 * transferred by Zimbra, Inc. to Synacor, Inc. on September 14, 2015.
 *
 * All portions of the code are Copyright (C) 2010, 2011, 2012, 2013, 2014, 2015, 2016 Synacor, Inc. All Rights Reserved.
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
 * @param	{AjxCallback}	selectionCallback	the callback into client to notify it that selection from extended DL happened (passed from email.js, and accessed from ZmDLAutocompleteListView.prototype._doUpdate)
 *
 * @extends		ZmAutocompleteListView
 */
ZmDLAutocompleteListView = function(params) {
	params.isFocusable = true;
	ZmAutocompleteListView.call(this, params);
	this._parentAclv = params.parentAclv;
	this._dlScrollDiv = this.getHtmlElement();
	this._selectionCallback = params.selectionCallback;
	this._expandTextId = params.expandTextId;
	Dwt.setHandler(this._dlScrollDiv, DwtEvent.ONSCROLL, ZmDLAutocompleteListView.handleDLScroll);
};

ZmDLAutocompleteListView.prototype = new ZmAutocompleteListView;
ZmDLAutocompleteListView.prototype.constructor = ZmDLAutocompleteListView;

ZmDLAutocompleteListView.prototype.toString =
function() {
	return "ZmDLAutocompleteListView";
};


ZmDLAutocompleteListView.prototype.getKeyMapName = function() {
	return ZmKeyMap.MAP_DL_ADDRESS_LIST;
};

ZmDLAutocompleteListView.prototype.handleKeyAction = function(actionCode, ev) {
	DBG.println("aif", "handle shortcut: " + actionCode);

	switch (actionCode) {
		case DwtKeyMap.SELECT_NEXT:	this._setSelected(ZmAutocompleteListView.NEXT); break;
		case DwtKeyMap.SELECT_PREV:	this._setSelected(ZmAutocompleteListView.PREV); break;
		case DwtKeyMap.ENTER:		this._update();  break;
		case DwtKeyMap.CANCEL:		if (this._parentAclv && this._expandTextId) {
										this._parentAclv._setExpandText(this._expandTextId, false);
									}
									this._popdown();
									break;
		default: return false;
	}
	return true;
};


ZmDLAutocompleteListView.prototype._set =
function(list, contact) {

	this._removeAll();
	this._matches = [];
	this._addMembers(list);

	// add row for selecting all at top of list
	var dl = appCtxt.getApp(ZmApp.CONTACTS).getDL(contact.getEmail());
	var numMembers = dl ? dl.total : list.length;
	var selectId = this._getId("Row", 1);
	if (numMembers != 1) {
		var table = this._getTable();
		var row = table.insertRow(0);
		row.className = this._origClass;
		selectId = row.id = this._selectAllRowId = this._getId("Row", "selectAll");
		var cell = row.insertCell(-1);
		cell.className = "AutocompleteMatchIcon";
		cell.innerHTML = AjxImg.getImageHtml("Blank16");
		cell = row.insertCell(-1);
		var text = numMembers ? ZmMsg.selectAllMembers : ZmMsg.noMembers;
		cell.innerHTML = AjxMessageFormat.format(text, [numMembers]);
	}

	AjxTimedAction.scheduleAction(new AjxTimedAction(this,
		function() {
			this._setSelected(selectId);
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
		cell.className = "AutocompleteMatchIcon";
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
function(context, match, ev) {
	
	if (this._selected == this._selectAllRowId) {
		if (!this._matchHash[this._selectAllRowId]) {
			var callback = this._handleResponseGetAllDLMembers.bind(this, ev);
			this._dlContact.getAllDLMembers(callback);
		}
	} else {
		this._doUpdate();
		this.reset(true);
	}
};

ZmDLAutocompleteListView.prototype._handleResponseGetAllDLMembers =
function(ev, result) {

	var mv = this._parentAclv._matchValue;
	var field = (mv instanceof Array) ? mv[0] : mv;
	if (result.list && result.list.length) {
		// see if client wants addresses joined, or one at a time
		if (this._parentAclv._options.massDLComplete) {
			var match = this._matchHash[this._selectAllRowId] = new ZmAutocompleteMatch();
			match[field] = result.list.join(this._parentAclv._separator);
			match.multipleAddresses = true;
			this._doUpdate();
		}
		else {
			var match = new ZmAutocompleteMatch();
			for (var i = 0, len = result.list.length; i < len; i++) {
				match[field] = result.list[i];
				this._doUpdate(match);
			}
		}
	}
	this.reset(true);
};

ZmDLAutocompleteListView.prototype._doUpdate =
function(match) {

	var context = null;
	// so that address will be taken from match
	if (this._parentAclv && this._parentAclv._currentContext) {
		context = this._parentAclv._currentContext;
		context.address = null;
	}
	match = match || this._matchHash[this._selected];
	if (!match) {
		return;
	}

	if (this._selectionCallback) {
		this._selectionCallback(match.fullAddress);
		return;
	}

	var dlBubble = document.getElementById(this._dlBubbleId);
	if (dlBubble && dlBubble._aifId && (!context || context.element._aifId != dlBubble._aifId)) {
		//this is the special case the DL was pre-created with the view. In this case we might have no context.
		// Another possible bug this fixes is if the current context is not in the same input field as the DL we are selecting from.
		var addrInputFld = DwtControl.ALL_BY_ID[dlBubble._aifId];
		if (addrInputFld){ 
			var bubbleParams = {
				address:	match.fullAddress,
				match:		match,
				noFocus:	false,
				addClass:	null,
				noParse:	false
			};
			addrInputFld.addBubble(bubbleParams);
			return;
		}
	}

	this._parentAclv._update(null, match);
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
			var respCallback = ZmDLAutocompleteListView._handleResponseDLScroll.bind(null, view);
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
			if (addrInput && addrInput.removeBubble) { //it's not always really addrInput - from msg/conv view it's the msg or conv view, (unlike compose view where it's really address input
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
	this.focus();
};

ZmDLAutocompleteListView.prototype._popdown =
function() {
	if (this._parentAclv) {
		this._parentAclv._curExpanded = null;
	}
	ZmAutocompleteListView.prototype._popdown.call(this);
};
