/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2010, 2011 Zimbra, Inc.
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

	if (params.autocompleteListView) {
		this.setAutocompleteListView(params.autocompleteListView);
	}

    this._bubbleAddedCallback = params.bubbleAddedCallback;
    this._bubbleRemovedCallback = params.bubbleRemovedCallback;

	this._bubbleClassName = "addrBubble";
	this._selectedBubbleClassName = this._bubbleClassName + "-" + DwtCssStyle.SELECTED;

	if (ZmAddressInputField.AUTO_SELECT_TEXT) {
		this._keyDownListener = new AjxListener(this, this._handleKeyDown);
	}
	this._outsideListener = new AjxListener(null, ZmAddressInputField._outsideMouseDownListener);

	this._reset();
};

ZmAddressInputField.prototype = new DwtControl;
ZmAddressInputField.prototype.constructor = ZmAddressInputField;

ZmAddressInputField.prototype.TEMPLATE = "share.Widgets#ZmAddressInputField";

ZmAddressInputField.prototype.toString =
function() {
	return "ZmAddressInputField";
};

ZmAddressInputField.AUTO_SELECT_TEXT = true;
ZmAddressInputField.INPUT_EXTRA = 30;

// tie a bubble SPAN to a widget that can handle clicks
ZmAddressInputField.BUBBLE_OBJ_ID = {};

ZmAddressInputField.prototype.setAutocompleteListView =
function(aclv) {
	this._aclv = aclv;
	this._separator = (aclv._separator) || AjxEmailAddress.SEPARATOR;
	aclv.addCallback(ZmAutocompleteListView.CB_KEYDOWN, new AjxCallback(this, this._keyDownCallback), this._inputId);
	aclv.addCallback(ZmAutocompleteListView.CB_KEYUP, new AjxCallback(this, this._keyUpCallback), this._inputId);
	aclv.addCallback(ZmAutocompleteListView.CB_ADDR_FOUND, new AjxCallback(this, this._addrFoundCallback), this._inputId);
};

/**
 * Creates a bubble for the given address and adds it into the holding area.
 *
 * @param {string}					address		address text to go in the bubble
 * @param {ZmAutocompleteMatch}		match		match object (optional)
 * @param {boolean}					skipNotify  if true, don't call bubbleAddedCallback
 */
ZmAddressInputField.prototype.add =
function(address, match, index, skipNotify) {

	if (!address) { return; }

	// if it's a local group, expand it and add each address separately
	if (match && match.isGroup && match.type == ZmAutocomplete.AC_TYPE_CONTACT) {
		var addrs = AjxEmailAddress.split(address);
		for (var i = 0, len = addrs.length; i < len; i++) {
			this._add(addrs[i].toString(), match, index + i);
		}
	}
	else {
		this._add(address, match, index);
	}

	this._input.value = "";
	this._holder.className = "addrBubbleHolder";

	this._resizeInput();
	this._checkSelectionCount();

	if (this._bubbleAddedCallback && !skipNotify) {
		this._bubbleAddedCallback.run();
	}
};

ZmAddressInputField.prototype._add =
function(address, match, index) {

	var params = {
		address:	address,
		returnSpan:	true,
		className:	this._bubbleClassName,
		canRemove:	true,
		canExpand:	(match && match.isDL) || this._expandable[address],
		dlAddress:	match && match.email,
		separator:	this._separator,
		parentId:	this._htmlElId
	};
	var bubble = ZmAddressInputField.getBubble(params);
	this._expandable[address] = params.canExpand;

	if (this._input.parentNode == this._holder) {
		var refBubble;
		if (index != null) {
			var bubbles = this._getBubbleList();
			refBubble = bubbles[index];
		}
		this._holder.insertBefore(bubble, refBubble || this._input);
	} else {
		this._holder.appendChild(bubble);
	}

	var bubbleId = bubble.id;
	this._bubble[bubbleId] = bubble;
	this._match[bubbleId] = match;
	this._addressHash[address] = true;
	this._bubbleAddress[bubbleId] = address;

	Dwt.setHandler(bubble, DwtEvent.ONCLICK, ZmAddressInputField.onClick);
	Dwt.setHandler(bubble, DwtEvent.ONDBLCLICK, ZmAddressInputField.onDoubleClick);
	this.focus();
};

/**
 * Generates HTML content for an address bubble and returns either HTML, or the bubble
 * itself (a SPAN).
 *
 * @param {hash}		params		a hash of params:
 *
 * @param {string}		id			element ID for the bubble (optional)
 * @param {string}		className	CSS class for the bubble (optional)
 * @param {string}		address		email address to display in the bubble
 * @param {boolean}		canRemove	if true, an x will be provided to remove the address bubble
 * @param {boolean}		canExpand	if true, a + will be provided to expand the DL address
 * @param {boolean}		returnSpan	if true, return SPAN element rather than HTML
 * @param {string}		separator	address separator - hidden, present for copy of text (optional)
 *
 * @return {Element|string}	SPAN element or HTML string
 */
ZmAddressInputField.getBubble =
function(params) {

	params = params || {};
	var id = params.id || Dwt.getNextId();
	var className = params.className || "addrBubble";
	var address = AjxStringUtil.htmlEncode(params.address);

	var expandLinkText = "", removeLinkText = "";
	var style = "display:inline-block;cursor:pointer;";
	if (AjxEnv.isIE) {
		// hack - IE won't display block elements inline via inline-block
		style = style + "*display:inline;zoom:1;";
	}

	if (params.canRemove) {
		var removeLinkId = id + "_remove";
		var removeLink = 'ZmAddressInputField.removeBubble("' + id + '");';
		var removeLinkText = AjxImg.getImageHtml("BubbleDelete", style, "id='" + removeLinkId + "' onclick='" + removeLink + "'");
	}

	if (params.canExpand) {
		var addr = params.dlAddress || params.address;
		var expandLinkId = id + "_expand";
		var expandLink = 'ZmAddressInputField.expandBubble("' + id + '","' + addr + '");';
		var expStyle = style + "margin-right:3px;";
		var expandLinkText = AjxImg.getImageHtml("BubbleExpand", expStyle, "id='" + expandLinkId + "' onclick='" + expandLink + "'");
	}

	if (params.separator) {
		var sep = AjxStringUtil.trim(params.separator);
		var separator = "<span style='visibility:hidden'>" + sep + "</span>";
	}

	var content = expandLinkText + address + separator + removeLinkText;
	if (params.returnSpan) {
		var bubble = document.createElement("span");
		bubble.id = id;
		if (params.parentId) {
			bubble._aifId = params.parentId;
		}
		bubble.className = className;
		bubble.innerHTML = content;
		return bubble;
	} else {
		if (params.parentId) {
			ZmAddressInputField.BUBBLE_OBJ_ID[id] = params.parentId;
		}
		var html = [], idx = 0;
		html[idx++] = "<span class='" + className + "' id='" + id + "'>";
		html[idx++] = content;
		html[idx++] = "</span>";
		return html.join("");
	}
};

/**
 * Removes the bubble with the given ID from the holding area.
 *
 * @param {string}	bubbleId	ID of bubble to remove
 * @param {boolean}	skipNotify	if true, don't call bubbleRemovedCallback
 */
ZmAddressInputField.prototype.removeBubble =
function(bubbleId, skipNotify) {

	var bubble = document.getElementById(bubbleId);
	if (bubble) {
		bubble.parentNode.removeChild(bubble);
	}

	var addr = this._bubbleAddress[bubbleId];
	delete this._bubbleAddress[bubbleId];
	this._bubble[bubbleId] = null;
	delete this._bubble[bubbleId];
	delete this._selected[bubbleId];
	delete this._match[bubbleId];
	delete this._addressHash[addr];

	if (this._holder.childNodes.length <= 1) {
		this._holder.className = "addrBubbleHolder-empty";
	}

	this._resizeInput();
	this._checkSelectionCount();

	if (this._bubbleRemovedCallback && !skipNotify) {
		this._bubbleRemovedCallback.run();
	}
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
	var list = [].concat(this.getAddresses());
	if (this._input.value) {
		list.push(this._input.value);
	}
	return list.join(this._separator);
};

/**
 * Parses the given text into email addresses, and adds a bubble for each one
 * that we don't already have. Any part that doesn't parse is left in the input.
 *
 * @param {string}	text		email addresses
 * @param {boolean}	add			if true, control is not cleared first
 * @param {boolean}	skipNotify	if true, don't call bubbleAddedCallback
 */
ZmAddressInputField.prototype.setValue =
function(text, add, skipNotify) {

	if (!add) {
		this.clear();
	}
	if (!text) { return; }
	
	var parsed = AjxEmailAddress.parseEmailString(text);
	var addrs = parsed.good.getArray();
	for (var i = 0, len = addrs.length; i < len; i++) {
		var addr = addrs[i].toString();
		if (!this._addressHash[addr]) {
			this.add(addr, null, skipNotify);
		}
	}
	if (parsed.bad && parsed.bad.size()) {
		this._input.value = parsed.bad.toString(AjxEmailAddress.SEPARATOR);
	}
	else {
		this._input.value = "";
	}
	this._resizeInput();
};

/**
 * Removes the selected bubble. If none are selected, selects the last one.
 */
ZmAddressInputField.prototype.handleDelete =
function() {

	var sel = this.getSelection();
	if (sel.length) {
		for (var i = 0, len = sel.length; i < len; i++) {
			this.removeBubble(sel[i].id);
		}
		this.focus();
	}
	else {
		var index = this._getInputIndex();
		var bubble = (index > 0) && this._holder.childNodes[index - 1];
		if (bubble) {
			this.setSelected(bubble, true);
		}
	}
};

/**
 * Sets selection of the given bubble.
 *
 * @param {Element}	bubble		bubble to select
 * @param {boolean} selected	if true, select the bubble, otherwise deselect it
 */
ZmAddressInputField.prototype.setSelected =
function(bubble, selected) {

	if (!bubble) { return; }
	if (selected == this._selected[bubble.id]) { return; }

	this._selected[bubble.id] = selected;
	bubble.className = selected ? this._selectedBubbleClassName : this._bubbleClassName;
};

ZmAddressInputField.prototype.getSelection =
function() {

	var sel = [];
	for (var id in this._selected) {
		if (this._selected[id]) {
			sel.push(this._bubble[id]);
		}
	}
	return sel;
};

ZmAddressInputField.prototype.getSelectionCount =
function() {
	return this.getSelection().length;
};

ZmAddressInputField.prototype.deselectAll =
function() {
	var sel = this.getSelection();
	for (var i = 0, len = sel.length; i < len; i++) {
		this.setSelected(sel[i], false);
	}
};

ZmAddressInputField.prototype.preventSelection =
function(targetEl) {
	return !(this._bubble[targetEl.id] || this.__isInputEl(targetEl));
};

/**
 * Clicking a bubble toggles its selection.
 * 
 * @param ev
 */
ZmAddressInputField.onClick =
function(ev) {
	var addrInput = ZmAddressInputField._getAddrInputFromEvent(ev);
	if (addrInput) {
		var mouseEv = DwtShell.mouseEvent;
		mouseEv.setFromDhtmlEvent(ev);
		addrInput._itemClicked(mouseEv, DwtUiEvent.getTarget(ev));
	}
};

ZmAddressInputField.onDoubleClick =
function(ev) {
	var addrInput = ZmAddressInputField._getAddrInputFromEvent(ev);
	if (addrInput) {
		var mouseEv = DwtShell.mouseEvent;
		mouseEv.setFromDhtmlEvent(ev);
		addrInput._itemDoubleClicked(mouseEv, DwtUiEvent.getTarget(ev));
	}
};

/**
 * Makes bubbles out of addresses in pasted text.
 *
 * @param ev
 */
ZmAddressInputField.onPaste =
function(ev) {
	var addrInput = ZmAddressInputField._getAddrInputFromEvent(ev);
	if (addrInput) {
		// give browser time to update input - easier than dealing with clipboard
		// will also resize the INPUT
		AjxTimedAction.scheduleAction(new AjxTimedAction(addrInput, addrInput._checkInput), 100);
	}
};

ZmAddressInputField.onCut =
function(ev) {
	var addrInput = ZmAddressInputField._getAddrInputFromEvent(ev);
	if (addrInput) {
		addrInput._resizeInput();
	}
};

// looks for valid addresses in the input, and converts them to bubbles
ZmAddressInputField.prototype._checkInput =
function() {
	var text = this._input.value;
	if (text) {
		this.setValue(text, true);
	}
};

// focus input when holder div is clicked
ZmAddressInputField.onHolderClick =
function(ev) {
	var addrInput = ZmAddressInputField._getAddrInputFromEvent(ev);
	if (addrInput) {
		addrInput.focus();
	}
};

/**
 * Removes the bubble with the given ID from the holding area.
 *
 * @param {string}	bubbleId	ID of bubble to remove
 * @param {boolean}	skipNotify	if true, don't call bubbleRemovedCallback
 *
 */
ZmAddressInputField.removeBubble =
function(bubbleId, skipNotify) {

	var bubble = document.getElementById(bubbleId);
	var parentId = bubble._aifId || ZmAddressInputField.BUBBLE_OBJ_ID[bubbleId];
	var addrInput = bubble && DwtControl.ALL_BY_ID[parentId];
	if (addrInput && addrInput.getEnabled()) {
		addrInput.removeBubble(bubbleId, skipNotify);
		addrInput.focus();
	}
};

/**
 * Expands the distribution list address of the bubble with the given ID.
 *
 * @param {string}	bubbleId	ID of bubble
 * @param {string}	email		address to expand
 */
ZmAddressInputField.prototype.expandBubble =
function(bubbleId, email) {

	var bubble = document.getElementById(bubbleId);
	if (bubble) {
		var loc = Dwt.getLocation(bubble);
		loc.y += Dwt.getSize(bubble).y + 2;
		this._aclv.expandDL(email, bubble.id, null, null, loc, this._input);
	}
};

/**
 * Expands the distribution list address of the bubble with the given ID.
 *
 * @param {string}	bubbleId	ID of bubble
 * @param {string}	email		address to expand
 */
ZmAddressInputField.expandBubble =
function(bubbleId, email) {

	var bubble = document.getElementById(bubbleId);
	var parentId = bubble._aifId || ZmAddressInputField.BUBBLE_OBJ_ID[bubbleId];
	var addrInput = bubble && DwtControl.ALL_BY_ID[parentId];
	if (addrInput && addrInput.getEnabled()) {
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
	Dwt.setHandler(this._input, DwtEvent.ONCUT, ZmAddressInputField.onCut);
	Dwt.setHandler(this._input, DwtEvent.ONPASTE, ZmAddressInputField.onPaste);
};

ZmAddressInputField.prototype._reset =
function() {
	this._bubble		= {};	// bubbles by bubble ID
	this._addressHash	= {};	// used addresses, so we can check for dupes
	this._bubbleAddress	= {};	// addresses by bubble ID
	this._selected		= {};	// which bubbles are selected
	this._match			= {};	// match object by bubble ID
	this._expandable	= {};	// whether an addr is an expandable DL addr
	this._input.value	= "";
};

/**
 * Focuses on this control.
 */
ZmAddressInputField.prototype.focus =
function() {
	if (this.getEnabled()) {
		this._hasFocus = true;
		this._input.focus();
	}
};

/**
 * Blurs this control.
 */
ZmAddressInputField.prototype.blur =
function() {
	this._input.blur();
};

// Check for Esc while in edit mode
ZmAddressInputField.prototype._keyDownCallback =
function(ev, aclv) {

	ev = DwtUiEvent.getEvent(ev);
	var key = DwtKeyEvent.getCharCode(ev);
	var propagate = true;
	if (key == 27 && this._editMode) {
		this._leaveEditMode(true);
		propagate = false;	// eat the event - eg don't let compose view catch Esc and pop the view
	}
	else if (key == 9) {	// TAB
		this._checkInput();
	}
	DwtUiEvent.setBehaviour(ev, !propagate, propagate);
	return propagate;
};

// need to do this on keyup, after character has appeared in the INPUT
ZmAddressInputField.prototype._keyUpCallback =
function(ev, aclv) {
	this._resizeInput();
};

ZmAddressInputField.prototype._addrFoundCallback =
function(aclv, addr, delim) {
	this.add(addr, null, this._editModeIndex, true);
	this._leaveEditMode();
	return true;
};

ZmAddressInputField.prototype._itemClicked =
function(ev, bubble) {

	if (ev.shiftKey) {
		if (this._lastSelected) {
			var select = false;
			var bubbles = this._getBubbleList();
			for (var i = 0, len = bubbles.length; i < len; i++) {
				var b = bubbles[i];
				if (b == bubble || b == this._lastSelected) {
					if (select) {
						this.setSelected(b, true);
						select = false;
						continue;
					}
					select = !select;
				}
				this.setSelected(b, select);
			}
		}
	}
	else if (ev.ctrlKey) {
		this.setSelected(bubble, !this._selected[bubble.id]);
		if (this._selected[bubble.id]) {
			this._lastSelected = bubble;
		}
	}
	else {
		var wasOnlyOneSelected = ((this.getSelectionCount() == 1) && this._selected[bubble.id]);
		this.deselectAll();
		this.setSelected(bubble, !wasOnlyOneSelected);
		this._lastSelected = wasOnlyOneSelected ? null : bubble;
	}

	this._checkSelectionCount();

	if (ZmAddressInputField.AUTO_SELECT_TEXT) {
		AjxTimedAction.scheduleAction(new AjxTimedAction(this,
			function() {
				Dwt.deselectText();
				var sel = this.getSelection();
				for (var i = 0, len = sel.length; i < len; i++) {
					Dwt.selectText(sel[i]);
				}
				if (sel.length > 0) {
					this.blur();	// make text selection work in FF
				}
			}), 10);
	}
};

// Double-clicking a bubble moves it into edit mode. It is replaced by the
// INPUT, which is moved to the bubble's position. The bubble's address fills
// the input and is selected.
ZmAddressInputField.prototype._itemDoubleClicked =
function(ev, bubble) {
	this._checkInput();
	this._enterEditMode(bubble);
};

ZmAddressInputField.prototype._enterEditMode =
function(bubble) {

	if (this._editMode) {
		this._leaveEditMode();
	}

	this._editModeIndex = this._getBubbleIndex(bubble);
	this._holder.insertBefore(this._input, bubble);
	this._input.value = this._editModeAddress = this._bubbleAddress[bubble.id];
	this.removeBubble(bubble.id, true);	// also resizes input
	this._editMode = true;
	// Chrome triggers BLUR after DBLCLICK, so use a timer to make sure select works
	AjxTimedAction.scheduleAction(new AjxTimedAction(this,
		function() {
			this.focus();
			this._input.select();
		}), 10);
};

ZmAddressInputField.prototype._leaveEditMode =
function(restore) {

	if (!this._editMode) { return; }

	if (restore) {
		this._input.value = this._editModeAddress;
		this._checkInput();
	}
	if (this._holder.lastChild != this._input) {
		this._holder.appendChild(this._input);
	}
	this._resizeInput();
	this.focus();

	this._editMode = false;
	this._editModeIndex = this._editModeAddress = null;
};

ZmAddressInputField.prototype._checkSelectionCount =
function() {

	var count = this.getSelectionCount();
	if (!this._selectionMode && count > 0) {
		if (ZmAddressInputField.AUTO_SELECT_TEXT) {
			appCtxt.getKeyboardMgr().addListener(DwtEvent.ONKEYDOWN, this._keyDownListener);
		}
		var omem = appCtxt.getOutsideMouseEventMgr();
		var omemParams = {
			id:					"ZmAddressInputField",
			obj:				this,
			outsideListener:	this._outsideListener
		}
		omem.startListening(omemParams);
		this._selectionMode = true;
	}
	else if (this._selectionMode && count == 0) {
		if (ZmAddressInputField.AUTO_SELECT_TEXT) {
			appCtxt.getKeyboardMgr().removeListener(DwtEvent.ONKEYDOWN, this._keyDownListener);
		}
		var omem = appCtxt.getOutsideMouseEventMgr();
		omem.stopListening("ZmAddressInputField");
		this._selectionMode = false;
	}
};

// size the input to a bit more than its current content
ZmAddressInputField.prototype._resizeInput =
function() {

	var val = AjxStringUtil.htmlEncode(this._input.value);
	var holderWidth = Dwt.getSize(this._holder).x;
	var strW = AjxStringUtil.getWidth(val);
	if (AjxEnv.isWindows && AjxEnv.isFirefox) {
		// FF/Win: fudge factor since string is longer in INPUT than when measured in SPAN
		strW = strW * 1.2;
	}
	var inputWidth = Math.min(strW, holderWidth) + ZmAddressInputField.INPUT_EXTRA;
	Dwt.setSize(this._input, inputWidth, Dwt.DEFAULT);

	if (AjxEnv.isIE) {
		// TODO: make the INPUT line up with the SPANs vertically
	}
};

/**
 * Handle delete key when one or more bubbles is selected. We can't do it the normal way through
 * a keyboard shortcut, since that requires browser focus to be set to the hidden keyboard input
 * field, which would undo the text selection.
 *
 * @private
 */
ZmAddressInputField.prototype._handleKeyDown =
function(ev) {

	ev = DwtUiEvent.getEvent(ev);
	var propagate = true;
	var key = DwtKeyEvent.getCharCode(ev);
	if (key == 8 && this.getSelectionCount()) {
		this.handleDelete();
		propagate = false;	// don't let the browser catch it and interpret it as Back
	}
	DwtUiEvent.setBehaviour(ev, !propagate, propagate);
	return propagate;
};

// Returns an ordered list of bubbles
ZmAddressInputField.prototype._getBubbleList =
function(id) {

	var list = [];
	var children = this._holder.childNodes;
	for (var i = 0; i < children.length; i++) {
		var node = children[i];
		if (node && node.tagName && node.tagName.toLowerCase() == "span") {
			list.push(node);
		}
	}
	return list;
};

ZmAddressInputField.prototype._getBubbleIndex =
function(bubble) {
	return AjxUtil.indexOf(this._holder.childNodes, bubble);
};

ZmAddressInputField.prototype._getInputIndex =
function() {
	return AjxUtil.indexOf(this._holder.childNodes, this._input);
};


/**
 * Returns an ordered list of bubble addresses.
 *
 * @param {boolean}	asObjects	if true, return list of AjxEmailAddress
 */
ZmAddressInputField.prototype.getAddresses =
function(asObjects) {

	var addrs = [];
	var bubbles = this._getBubbleList();
	for (var i = 0; i < bubbles.length; i++) {
		var bubbleId = bubbles[i].id;
		var addr = this._bubbleAddress[bubbleId];
		if (asObjects) {
			var addrObj = AjxEmailAddress.parse(addr);
			var match = this._match[bubbleId];
			if (match && match.isDL) {
				addrObj.isGroup = true;
				addrObj.canExpand = true;
			}
			addrs.push(addrObj);
		}
		else {
			addrs.push(addr);
		}
	}
	return addrs;
};

ZmAddressInputField._outsideMouseDownListener =
function(ev, context) {
	var aif = context && context.obj;
	if (aif) {
		aif.deselectAll();
	}
};

ZmAddressInputField._getAddrInputFromEvent =
function(ev) {
	var target = DwtUiEvent.getTarget(ev);
	return target && DwtControl.ALL_BY_ID[target._aifId];
};
