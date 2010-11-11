/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2005, 2006, 2007, 2008, 2009, 2010 Zimbra, Inc.
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
 * Creates an address input field that shows addresses as bubbles.
 * @constructor
 * @class
 * This class creates and manages a control for entering email addresses and displaying
 * them in bubbles. An address's surrounding bubble can be used to remove it, or, if the
 * address is a distribution list, expand it.
 *
 * It is not a DwtInputField. If you don't want bubbles, use that instead.
 *
 * @author Conrad Damon
 *
 * @param {ZmAutocompleteListView}	autocompleteListView
 * @param {string}      			params.inputId			an explicit ID to use for the control's INPUT element
 */
ZmAddressInputField = function(params) {

	params.parent = params.parent || appCtxt.getShell();
	params.className = params.className || "addrBubbleContainer";
	DwtControl.call(this, params);

	this._initialize(params);

	this._aclv = params.autocompleteListView;
	this._separator = (this._aclv && this._aclv._separator) || AjxEmailAddress.SEPARATOR;
	this._bubbleClassName = "addrBubble";
	this._selectedBubbleClassName = this._bubbleClassName + "-" + DwtCssStyle.SELECTED;

	this._reset();
};

ZmAddressInputField.prototype = new DwtControl;
ZmAddressInputField.prototype.constructor = ZmAddressInputField;

ZmAddressInputField.prototype.TEMPLATE = "share.Widgets#ZmAddressInputField";

ZmAddressInputField.prototype.toString =
function() {
	return "DwtAddressInputField";
};

/**
 * Creates a bubble for the given address and adds it into the holding area.
 *
 * @param {string}					address		address text to go in the bubble
 * @param {ZmAutocompleteMatch}		match		match object
 */
ZmAddressInputField.prototype.add =
function(address, match) {

	if (!address) { return; }

	this._input.value = "";
	var bubble = document.createElement("span");
	var bubbleId = bubble.id = Dwt.getNextId();
	bubble._aifId = this._htmlElId;
	bubble.className = this._bubbleClassName;

	this._bubble[bubbleId] = bubble;
	this._addresses.push(address);
	this._addressHash[address] = true;
	this._bubbleAddress[bubbleId] = address;

	var expandLinkText = "";
	var style = "display:inline-block;cursor:pointer;";
	if (AjxEnv.isIE) {
		// hack - IE won't display block elements inline via inline-block
		style = style + "*display:inline;zoom:1;";
	}
	if (match && match.isDL) {
		this._dlAddress[bubbleId] = match.email;
		var expandLinkId = bubbleId + "_expand";
		var expandLink = 'ZmAddressInputField.expandBubble("' + bubbleId + '");';
		var expStyle = style + "margin-right:3px;";
		var expandLinkText = AjxImg.getImageHtml("BubbleExpand", expStyle, "id='" + expandLinkId + "' onclick='" + expandLink + "'");
	}

	var removeLinkId = bubbleId + "_remove";
	var removeLink = 'ZmAddressInputField.removeBubble("' + bubbleId + '");';
	var removeLinkText = AjxImg.getImageHtml("BubbleDelete", style, "id='" + removeLinkId + "' onclick='" + removeLink + "'");
	var sep = AjxStringUtil.trim(this._separator);
	var separator = "<span style='visibility:hidden'>" + sep + "</span>";
	bubble.innerHTML = expandLinkText + AjxStringUtil.htmlEncode(address) + separator + removeLinkText;
	this._holder.appendChild(bubble);
	Dwt.setHandler(bubble, DwtEvent.ONCLICK, ZmAddressInputField.onClick);
	appCtxt.getKeyboardMgr().grabFocus(this._inputId);
};

/**
 * Removes all bubbles from the holding area.
 */
ZmAddressInputField.prototype.clear =
function() {

	for (var id in this._bubble) {
		this.removeBubble(id);
	}
	this._reset();
};

/**
 * Returns a string of concatenated bubble addresses.
 */
ZmAddressInputField.prototype.getValue =
function() {

	var list = [].concat(this._addresses);
	if (this._input.value) {
		list.push(this._input.value);
	}
	return list.join(this._separator);
};

/**
 * Parses the given text into email addresses, and adds a bubble for each one
 * that we don't already have. Any part that doesn't parse is left in the input.
 *
 * @param {string}	text	email addresses
 */
ZmAddressInputField.prototype.setValue =
function(text) {

	var parsed = AjxEmailAddress.parseEmailString(text);
	var addrs = parsed.good.getArray();
	for (var i = 0, len = addrs.length; i < len; i++) {
		var addr = addrs[i].toString();
		if (!this._addressHash[addr]) {
			this.add(addr);
		}
	}
	if (parsed.bad && parsed.bad.size()) {
		this._input.value = parsed.bad.toString(AjxEmailAddress.SEPARATOR);
	}
	else {
		this._input.value = "";
	}
};

/**
 * Removes the selected bubble. If none are selected, selects the last one.
 */
ZmAddressInputField.prototype.handleDelete =
function() {

	if (this._selectedBubbleId) {
		ZmAddressInputField.removeBubble(this._selectedBubbleId);
	}
	else {
		var bubble = this._holder.lastChild;
		if (bubble) {
			this.setSelected(bubble.id);
		}
	}
};

/**
 * Selects the bubble with the given ID.
 *
 * @param {string}	bubbleId	ID of bubble to select
 */
ZmAddressInputField.prototype.setSelected =
function(bubbleId) {

	var bubble = this._bubble[bubbleId];
	if (!bubble) { return; }
	var curSel = this._selectedBubbleId;
	if (curSel == bubbleId) {
		bubble.className = this._bubbleClassName;
		this._selectedBubbleId = null;
	}
	else {
		bubble.className = this._selectedBubbleClassName;
		var curBubble = curSel && document.getElementById(curSel);
		if (curBubble) {
			curBubble.className = this._bubbleClassName;
		}
		this._selectedBubbleId = bubbleId;
	}
};

/**
 * Clicking a bubble toggles its selection.
 * 
 * @param ev
 */
ZmAddressInputField.onClick =
function(ev) {

	var bubble = DwtUiEvent.getTarget(ev);
	var addrInput = bubble && DwtControl.ALL_BY_ID[bubble._aifId];
	if (addrInput) {
		addrInput.setSelected(bubble.id);
	}
};

ZmAddressInputField.onPaste =
function(ev) {

	var input = DwtUiEvent.getTarget(ev);
	var addrInput = input && DwtControl.ALL_BY_ID[input._aifId];
	if (addrInput) {
		// give browser time to update input - easier than dealing with clipboard
		AjxTimedAction.scheduleAction(new AjxTimedAction(addrInput, addrInput.handlePaste), 100);
	}
};

ZmAddressInputField.prototype.handlePaste =
function() {

	var text = this._input.value;
	if (text) {
		this.setValue(text);
	}
};

// focus input when holder div is clicked
ZmAddressInputField.onHolderClick =
function(ev) {

	var holder = DwtUiEvent.getTarget(ev);
	var addrInput = holder && DwtControl.ALL_BY_ID[holder._aifId];
	if (addrInput) {
		appCtxt.getKeyboardMgr().grabFocus(addrInput._inputId);
	}
};

/**
 * Removes the bubble with the given ID from the holding area.
 *
 * @param {string}	bubbleId	ID of bubble to select
 */
ZmAddressInputField.prototype.removeBubble =
function(bubbleId) {

	var bubble = document.getElementById(bubbleId);
	if (bubble) {
		bubble.parentNode.removeChild(bubble);
	}

	var addr = this._bubbleAddress[bubbleId];
	AjxUtil.arrayRemove(this._addresses, addr);
	delete this._bubbleAddress[bubbleId];
	this._bubble[bubbleId] = null;
	delete this._bubble[bubbleId];
	delete this._addressHash[addr];
	if (bubbleId == this._selectedBubbleId) {
		this._selectedBubbleId = null;
	}
};

/**
 * Removes the bubble with the given ID from the holding area.
 *
 * @param {string}	bubbleId	ID of bubble to select
 */
ZmAddressInputField.removeBubble =
function(bubbleId) {

	var bubble = document.getElementById(bubbleId);
	var addrInput = bubble && DwtControl.ALL_BY_ID[bubble._aifId];
	if (addrInput) {
		addrInput.removeBubble(bubbleId);
	}
};

/**
 * Expands the distribution list address of the bubble with the given ID.
 *
 * @param {string}	bubbleId	ID of bubble to select
 */
ZmAddressInputField.prototype.expandBubble =
function(bubbleId, email) {

	var bubble = document.getElementById(bubbleId);
	if (bubble) {
		var loc = Dwt.getLocation(bubble);
		loc.y += Dwt.getSize(bubble).y + 2;
		var email = this._dlAddress[bubble.id];
		this._aclv.expandDL(email, bubble.id, null, null, loc);
	}
};

/**
 * Expands the distribution list address of the bubble with the given ID.
 *
 * @param {string}	bubbleId	ID of bubble to select
 */
ZmAddressInputField.expandBubble =
function(bubbleId, email) {

	var bubble = document.getElementById(bubbleId);
	var addrInput = bubble && DwtControl.ALL_BY_ID[bubble._aifId];
	if (addrInput) {
		addrInput.expandBubble(bubbleId, email);
	}
};

ZmAddressInputField.prototype.getInputElement =
function() {

	return this._input;
};

ZmAddressInputField.prototype.setEnabled =
function(enabled) {

	DwtControl.prototype.setEnabled.call(this, enabled);
	this._input.disabled = !enabled;
};

ZmAddressInputField.prototype._initialize =
function(params) {

	this._holderId = Dwt.getNextId();
	this._inputId = params.inputId || Dwt.getNextId();
	var data = {
		holderId:	this._holderId,
		inputId:	this._inputId
	};
	this._createHtmlFromTemplate(params.templateId || this.TEMPLATE, data);

	this._holder = document.getElementById(this._holderId);
	this._holder._aifId = this._htmlElId;
	this._input = document.getElementById(this._inputId);

	Dwt.setHandler(this._holder, DwtEvent.ONCLICK, ZmAddressInputField.onHolderClick);
	Dwt.setHandler(this._input, DwtEvent.ONPASTE, ZmAddressInputField.onPaste);
};

ZmAddressInputField.prototype._reset =
function() {

	this._bubble		= {};	// bubbles by bubble ID
	this._addresses		= [];	// ordered address list
	this._addressHash	= {};	// used addresses, so we can check for dupes
	this._bubbleAddress	= {};	// addresses by bubble ID
	this._dlAddress		= {};	// DL addresses by bubble ID, for expanding
};
