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
 * Creates a new autocomplete list. The list isn't populated or displayed until some
 * autocompletion happens. Takes a data class and loader, so that when data is needed (it's
 * loaded lazily), the loader can be called on the data class.
 * @class
 * This class implements autocomplete functionality. It has two main parts: matching data based
 * on keystroke events, and displaying/managing the list of matches. This class is theoretically
 * neutral concerning the data that gets matched (as long as its class has an <code>autocompleteMatch()</code>
 * method), and the field that it's being called from.
 * <p>
 * The data class's <code>autocompleteMatch()</code> method should returns a list of matches, where each match is
 * an object with the following properties:</p>
 * <table border="1" width="50%">
 * <tr><td width="15%">data</td><td>the object being matched</td></tr>
 * <tr><td>text</td><td>the text to display for this object in the list</td></tr>
 * <tr><td>[key1]</td><td>a string that may be used to replace the typed text</td></tr>
 * <tr><td>[keyN]</td><td>a string that may be used to replace the typed text</td></tr>
 * </table>
 * </p><p>
 * The calling client also specifies the key in the match result for the string that will be used
 * to replace the typed text (also called the "completion string"). For example, the completion 
 * string for matching contacts could be a full address, or just the email.
 * </p><p>
 * The client may provide additional key event handlers in the form of callbacks. If the callback
 * explicitly returns true or false, that's what the event handler will return.
 * </p>
 * 
 * @author Conrad Damon
 *
 * @param {Hash}	params			a hash of parameters
 * @param	{String}	matchValue		the name of field in match result to use for completion
 * @param	{function}	dataClass			the class that has the data loader
 * @param	{function}	dataLoader		a method of dataClass that returns data to match against
 * @param	{DwtComposite}	parent			the control that created this list (defaults to shell)
 * @param	{String}	className			the CSS class
 * @param	{Array}	delims			the list of delimiters (which separate tokens such as addresses)
 * @param	{Array}	delimCodes		the list of delimiter key codes
 * @param	{String}	separator		the separator (gets added to the end of a match)
 * @param	{AjxCallback}	compCallback		the callback into client to notify it that completion happened
 * @param	{AjxCallback}	keyDownCallback	the additional client ONKEYDOWN handler
 * @param	{AjxCallback}	keyPressCallback	the additional client ONKEYPRESS handler
 * @param	{AjxCallback}	keyUpCallback	the additional client ONKEYUP handler
 * @param	{AjxCallback}	enterCallback		the client handler for Enter key
 * @param	{Hash}	options			the additional options for autocompleteMatch() in data class
 * 
 * @extends		DwtComposite
 */
ZmAutocompleteListView = function(params) {

	var className = params.className ? params.className : "ZmAutocompleteListView";
	DwtComposite.call(this, params.parent || appCtxt.getShell(), className, DwtControl.ABSOLUTE_STYLE);

	this._dataClass = this._dataAPI = params.dataClass;
	this._dataLoader = params.dataLoader;
	this._dataLoaded = false;
	this._matchValue = params.matchValue;
	this._delims = params.delims || ZmAutocompleteListView.DELIMS;
	this._delimCodes = params.delimCodes || ZmAutocompleteListView.DELIM_CODES;
	this._isDelim = AjxUtil.arrayAsHash(this._delims);
	this._isDelimCode = AjxUtil.arrayAsHash(this._delimCodes);
	this._separator = (params.separator != null) ? params.separator : AjxEmailAddress.SEPARATOR;
	this._compCallback = params.compCallback;
	this._keyDownCallback = params.keyDownCallback;
	this._keyPressCallback = params.keyPressCallback;
	this._keyUpCallback = params.keyUpCallback;
	this._enterCallback = params.enterCallback;
    this._options = params.options;

    // mouse event handling
	this._setMouseEventHdlrs();
	this.addListener(DwtEvent.ONMOUSEDOWN, new AjxListener(this, this._mouseDownListener));
	this.addListener(DwtEvent.ONMOUSEOVER, new AjxListener(this, this._mouseOverListener));
	this._addSelectionListener(new AjxListener(this, this._listSelectionListener));
	this._outsideListener = new AjxListener(null, ZmAutocompleteListView._outsideMouseDownListener);

	// only trigger matching after a sufficient pause
	this._acInterval = appCtxt.get(ZmSetting.AC_TIMER_INTERVAL);
	this._acAction = new AjxTimedAction(null, this._autocompleteAction);
	this._acActionId = -1;

	// for managing focus on Tab in Firefox
	if (AjxEnv.isGeckoBased) {
		this._focusAction = new AjxTimedAction(null, this._autocompleteFocus);
	}

	this._internalId = AjxCore.assignId(this);
	this._numChars = 0;
	this._done = {};
	this.setVisible(false);
	this.setScrollStyle(Dwt.SCROLL);
};

ZmAutocompleteListView.prototype = new DwtComposite;
ZmAutocompleteListView.prototype.constructor = ZmAutocompleteListView;

// map of characters that are completion characters
ZmAutocompleteListView.DELIMS		= [';', '\n', '\r', '\t'];	// used when list is not showing
ZmAutocompleteListView.DELIM_CODES	= [59, 186, 3, 13, 9];		// used when list is showing

ZmAutocompleteListView.WAIT_ID = "wait";

// Public static methods

/**
 * Handles the on key down event.
 * 
 * @param	{Event}	event		the event
 */
ZmAutocompleteListView.onKeyDown =
function(ev) {
	ev = DwtUiEvent.getEvent(ev);
	var result = ZmAutocompleteListView._onKeyDown(ev);
	var element = DwtUiEvent.getTargetWithProp(ev, "id");
	var aclv = AjxCore.objectWithId(element._acListViewId);
	if (aclv._keyDownCallback) {
		var cbResult = aclv._keyDownCallback.run(ev, aclv, result);
		result = (cbResult === true || cbResult === false) ? cbResult : result;
	}
	return result;
};

/**
 * Handles the on key press event.
 * 
 * @param	{Event}	event		the event
 */
ZmAutocompleteListView.onKeyPress =
function(ev) {
	DwtKeyEvent.geckoCheck(ev);
	var result = null;
	var element = DwtUiEvent.getTargetWithProp(ev, "id");
	var aclv = AjxCore.objectWithId(element._acListViewId);
	if (aclv._keyPressCallback) {
		var cbResult = aclv._keyPressCallback.run(ev, aclv);
		result = (cbResult === true || cbResult === false) ? cbResult : result;
	}

	return (result != null) ? result : ZmAutocompleteListView._echoKey(true, ev);
};

/**
 * Handles the on key up event.
 * 
 * @param	{Event}	event		the event
 */
ZmAutocompleteListView.onKeyUp =
function(ev) {
	ev = DwtUiEvent.getEvent(ev);
	var result = ZmAutocompleteListView._onKeyUp(ev);
	var element = DwtUiEvent.getTargetWithProp(ev, "id");
	var aclv = AjxCore.objectWithId(element._acListViewId);
	if (aclv._keyUpCallback) {
		var cbResult = aclv._keyUpCallback.run(ev, aclv, result);
		result = (cbResult === true || cbResult === false) ? cbResult : result;
	}
	return result;
};

/**
* "onkeydown" handler for catching Tab and Esc keys. We don't want to let the browser
* handle this event for those (which it will do before we get the keyup event).
*
* @param ev		the key event
* 
* @private
*/
ZmAutocompleteListView._onKeyDown =
function(ev) {
	DBG.println(AjxDebug.DBG3, "onKeyDown");
	var key = DwtKeyEvent.getCharCode(ev);
	// don't echo enter key if list view is visible, since in that case it's
	// just a selection mechanism
	if (key == 3 || key == 13) {
		var element = DwtUiEvent.getTargetWithProp(ev, "id");
		if (!element) {
			return ZmAutocompleteListView._echoKey(true, ev);
		}
		var aclv = AjxCore.objectWithId(element._acListViewId);
		if (aclv && aclv.getVisible()) {
			return ZmAutocompleteListView._echoKey(false, ev);
		}
	}
	if (key == 9 || key == 27) {
		return ZmAutocompleteListView._onKeyUp(ev);
	} else {
		return ZmAutocompleteListView._echoKey(true, ev);
	}
};

/**
* "onkeyup" handler for performing autocompletion. The reason it's an "onkeyup" handler is that neither 
* "onkeydown" nor "onkeypress" arrives after the form field has been updated.
*
* @param ev		the key event
* 
* @private
*/
ZmAutocompleteListView._onKeyUp =
function(ev) {
	if (ev.type == "keyup") {
		DBG.println(AjxDebug.DBG3, "onKeyUp");
	}
	this._hasCompleted = false;

	var element = DwtUiEvent.getTargetWithProp(ev, "id");
	if (!element) {
		return ZmAutocompleteListView._echoKey(true, ev);
	}

	var aclv = AjxCore.objectWithId(element._acListViewId);
	
	var id = element.id;
	var key = DwtKeyEvent.getCharCode(ev);
//	DBG.println("ac", ev.type + " char code: " + key);

	// Tab/Esc handled in keydown for IE
	if (AjxEnv.isIE && ev.type == "keyup" && (key == 9 || key == 27)) {
		return ZmAutocompleteListView._echoKey(true, ev);
	}

	var value = element.value;
	DBG.println(AjxDebug.DBG3, ev.type + " event, key = " + key + ", value = " + value);

	// reset timer on any address field key activity
	if (aclv._acActionId != -1 && !DwtKeyMap.IS_MODIFIER[key]) {
		AjxTimedAction.cancelAction(aclv._acActionId);
		aclv._acActionId = -1;
	}
	
	// Figure out what this handler should return. If it returns true, the browser will
	// handle the key event. That usually means it just echoes the typed character, but
	// it could do something like change focus (eg tab). We let the browser handle input
	// characters, and anything weird that we don't want to deal with. The only keys we
	// don't let the browser handle are ones that control the features of the autocomplete
	// list.

	if (DwtKeyMap.IS_MODIFIER[key] || DwtKeyMapMgr.hasModifier(ev)) {
		return ZmAutocompleteListView._echoKey(true, ev);
	}
	// if the field is empty, clear the list
	if (!value) {
		aclv.reset();
		return ZmAutocompleteListView._echoKey(true, ev);
	}
	if (key == 37 || key == 39) { // left/right arrow key
		return ZmAutocompleteListView._echoKey(true, ev);
	}
	// Pass tab/esc through if there's no list
	if ((key == 9 || key == 27) && !aclv.size()) {
		return ZmAutocompleteListView._echoKey(true, ev);
	}

	if (AjxStringUtil.isPrintKey(key) || (key == 3 || key == 9 || key == 13)) {
		aclv._numChars++;
	}
		
	// if the user types a single delimiting character with the list showing, do completion
	var isDelim = (aclv.getVisible() && (aclv._numChars == 1) && (!ev.shiftKey && aclv._isDelimCode[key]));

	DBG.println(AjxDebug.DBG3, "numChars = " + aclv._numChars + ", key = " + key + ", isDelim: " + isDelim);
	if (isDelim || (key == 27 || (aclv.getVisible() && (key == 38 || key == 40)))) {
		aclv.handleAction(key, isDelim);
		// In Firefox, focus shifts on Tab even if we return false (and stop propagation and prevent default),
		// so make sure the focus stays in this element.
		if (AjxEnv.isGeckoBased && key == 9) {
			aclv._focusAction.args = [ element ];
			AjxTimedAction.scheduleAction(aclv._focusAction, 0);
		}
		if ((key == 13 || key == 3) && aclv._enterCallback) {
			var result = aclv._enterCallback.run(ev);
			return (result != null) ? result : ZmAutocompleteListView._echoKey(true, ev);
		}
		return ZmAutocompleteListView._echoKey(false, ev);
	}

	// skip if it's some weird character
	if (!AjxStringUtil.isPrintKey(key) && (key != 3 && key != 13 && key != 9 && key != 8 && key != 46)) {
		return ZmAutocompleteListView._echoKey(true, ev);
	}

	if ((key == 13 || key == 3) && aclv._enterCallback) {
		aclv.reset();
		var result = aclv._enterCallback.run(ev);
		return (result != null) ? result : ZmAutocompleteListView._echoKey(true, ev);
	}

	// regular input, schedule autocomplete
	var ev1 = new DwtKeyEvent();
	DwtKeyEvent.copy(ev1, ev);
	ev1.aclv = aclv;
	ev1.element = element;
	aclv._acAction.obj = aclv;
	aclv._acAction.args = [ ev1 ];
	DBG.println(AjxDebug.DBG2, "scheduling autocomplete");
	aclv._acActionId = AjxTimedAction.scheduleAction(aclv._acAction, aclv._acInterval);
	
	return ZmAutocompleteListView._echoKey(true, ev);
};

/**
 * Invokes or prevents the browser's default behavior (which is to echo the typed key).
 * 
 * @param {Boolean}	echo	if <code>true</code>, echo the key
 * @param {Event}	ev	the UI event
 * 
 * @private
 */
ZmAutocompleteListView._echoKey =
function(echo, ev) {
	DwtUiEvent.setBehaviour(ev, !echo, echo);
	return echo;
};

/**
 * Hides list if there is a click elsewhere.
 * 
 * @private
 */
ZmAutocompleteListView._outsideMouseDownListener =
function(ev) {
	var curList = ZmAutocompleteListView._activeAcList;
    if (curList.getVisible()) {
		var obj = DwtControl.getTargetControl(ev);
		if (obj != curList) {
			curList.show(false);
			ev._stopPropagation = false;
			ev._returnValue = true;
		}
	}
};

// Public methods

/**
 * Returns a string representation of the object.
 * 
 * @return		{String}		a string representation of the object
 */
ZmAutocompleteListView.prototype.toString = 
function() {
	return "ZmAutocompleteListView";
};

/**
 * Sets the active account.
 * 
 * @param	{ZmAccount}		account		the account
 */
ZmAutocompleteListView.prototype.setActiveAccount =
function(account) {
	this._activeAccount = account;
};

/**
 * Adds autocompletion to the given field by setting key event handlers.
 *
 * @param {Element}	element		an HTML element
 * 
 * @private
 */
ZmAutocompleteListView.prototype.handle =
function(element) {
	element._acListViewId = this._internalId;
	Dwt.setHandler(element, DwtEvent.ONKEYDOWN, ZmAutocompleteListView.onKeyDown);
	Dwt.setHandler(element, DwtEvent.ONKEYPRESS, ZmAutocompleteListView.onKeyPress);
	Dwt.setHandler(element, DwtEvent.ONKEYUP, ZmAutocompleteListView.onKeyUp);
};

/**
 * Autocomplete typed text. Should be called by a handler for a keyboard event.
 *
 * @param {Element}	element	the element (some sort of text field) doing autocomplete
 * @param {Object}	loc		where to popup the list, if appropriate
 * 
 * @private
 */
ZmAutocompleteListView.prototype.autocomplete =
function(info) {
	DBG.println(AjxDebug.DBG3, "ZmAutocompleteListView: autocomplete");
	if (!info || (info.text == "undefined")) { return; }
	if (this._dataLoader && !this._dataLoaded) {
		this._data = this._dataLoader.call(this._dataClass);
		this._dataAPI = this._data;
		this._dataLoaded = true;
	}

	// The callback into ourself emulates a while loop, and is here to support
	// async calls into _autocomplete(), which may result in a server request
	// (for example, when matching against the GAL)
	var callback = new AjxCallback(this, this.autocomplete);
	if (info.start < info.text.length) {
		var chunk = this._nextChunk(info.text, info.start);
		this._autocomplete(chunk, callback);
	} else if (info.change) {
		// quick completion was done
		DBG.println(AjxDebug.DBG2, "autocomplete, new text: " + info.text + "; element: " + this._element.value);
		this._updateField(info.text, info.match);
	}
};

/**
 * Resets the state of the autocomplete list.
 */
ZmAutocompleteListView.prototype.reset =
function() {
	this._matches = null;
	this.show(false);
};

/**
* Checks the given key to see if it's used to control the autocomplete list in some way.
* If it does, the action is taken and the key won't be echoed into the input area.
*
* The following keys are action keys:
*	38 40		up/down arrows (list selection)
*	27			escape (hide list)
*
* The following keys are delimiters (trigger completion):
*	3 13		return
*	9			tab
*	59 186		semicolon
*	188			comma
*
* @param key		a numeric key code
* @param isDelim	true if a single delimiter key was typed
* 
* @private
*/
ZmAutocompleteListView.prototype.handleAction =
function(key, isDelim) {
	DBG.println(AjxDebug.DBG2, "autocomplete handleAction for key " + key + " / " + isDelim);

	if (isDelim) {
		this._update(true);
	} else if (key == 38 || key == 40) {
		// handle up and down arrow keys
		var idx = this._getSelectedIndex();
		var size = this.size();
		if (size <= 1) return;
		var newIdx;
		if (key == 40 && (idx < size - 1)) {
			newIdx = idx + 1;
			this._setSelected(newIdx);
		} else if (key == 38 && (idx > 0)) {
			newIdx = idx - 1;
			this._setSelected(newIdx);
		}
	} else if (key == 27) {
		this.reset(); // ESC hides the list
	}
};

/**
 * Sets the waiting status.
 * 
 * @param	{Boolean}	on		if <code>true</code>, turn waiting "on"
 * 
 */
ZmAutocompleteListView.prototype.setWaiting =
function(on) {
	if (on) {
		if (!this.size()) {
			// make sure we're visible if "waiting" row is the only one
			this.show(true);
		}
		var div = this._getDiv(ZmAutocompleteListView.WAIT_ID);
		this._waitDivId = div.id;
		this._addRow(div, ZmMsg.autocompleteWaiting, "DwtWait16Icon");
		this.getHtmlElement().appendChild(div);
	} else {
		var ta = new AjxTimedAction(this, this._clearWaiting);
		AjxTimedAction.scheduleAction(ta, 1000);
	}
};

// Private methods

/**
 * Called as a timed action, after a sufficient pause in typing within an address field.
 * 
 * @private
 */
ZmAutocompleteListView.prototype._autocompleteAction =
function(ev) {
	DBG.println(AjxDebug.DBG2, "performing autocomplete");
	var element = ev.element;
	var aclv = ev.aclv;
	aclv._acActionId = -1; // so we don't try to cancel
	aclv._numChars = 0;

	aclv.reset();				// start fresh
	aclv._element = element;	// for updating element later
	
	var info = {text: element.value, start: 0};
	
	aclv.autocomplete(info);
};

/**
 * Displays the current matches in a popup list, selecting the first.
 *
 * @param {Boolean}	show	if <code>true</code>, display the list
 * @param {String}	loc		where to display the list
 * 
 */
ZmAutocompleteListView.prototype.show =
function(show, loc) {
	DBG.println(AjxDebug.DBG3, "autocomplete show: " + show);
	if (show) {
		this._popup(loc);
	} else {
		this._hasCompleted = false;
		this._popdown();
	}
};

// Private methods

/*
 * Finds the next chunk of text in a string that we should try to autocomplete, by reading
 * until it hits some sort of address delimiter (or runs out of text). If the chunk is a
 * valid email address, it's skipped since there's no point in trying to autocomplete it.
 * 
 * @param text	[string]	text to scan
 * @param start	[int]		index to start at
 */
ZmAutocompleteListView.prototype._nextChunk =
function(text, start) {
	while (text.charAt(start) == ' ') {	// ignore leading space
		start++;
	}
	var insideQuotes = false;
	for (var i = start; i < text.length; i++) {
		var c = text.charAt(i);
		if (c == '"') {
			// skip text and delimiters that are quoted
			c = text.charAt(++i);
			while (i < text.length && c != '"') {
				c = text.charAt(++i);
			}
		}
		if (this._isDelim[c]) {
			var chunk = text.substring(start, i);
			if (this._dataAPI.isComplete && this._dataAPI.isComplete(chunk)) {
				DBG.println(AjxDebug.DBG3, "skipping completed chunk: " + chunk);
				start = i + 1;
				while (text.charAt(start) == ' ') {	// ignore leading space
					start++;
				}
			} else {
				return {text: text, str: chunk, start: start, end: i, delim: true};
			}
		}
	}
	var chunk = text.substring(start, i);
	if (AjxEmailAddress.isValid(chunk)) {
		start = i;
		chunk = text.substring(start, i);
	}
	return {text: text, str: chunk, start: start, end: i, delim: false};
};

// Looks for matches for a string and either displays them in a list, or does the completion
// immediately (if the string was followed by a delimiter). The chunk object that we get has
// information that allows us to do the replacement if we are performing completion.
ZmAutocompleteListView.prototype._autocomplete =
function(chunk, callback) {
	DBG.println(AjxDebug.DBG3, "ZmAutocompleteListView: _autocomplete");

	if (!chunk || !(this._dataAPI && this._dataAPI.autocompleteMatch)) { return; }
	var str = AjxStringUtil.trim(chunk.str);

	// if string is empty or already a delimited address, no reason to look for matches
	if (!(str && str.length) || (this._done[str])) {
		if (callback) {
			callback.run({text: chunk.text, start: chunk.end + 1});
			return;
		} else {
			return {text: chunk.text, start: chunk.end + 1};
		}
	}

	this._start = chunk.start;
	this._end = chunk.end;

	var text = chunk.text;
	var start = chunk.end; // move beyond the current chunk

	// do matching
	this._removeAll();

	var respCallback = new AjxCallback(this, this._handleResponseAutocomplete, [str, chunk, text, start, callback]);
	this._dataAPI.autocompleteMatch(str, respCallback, this, this._options, this._activeAccount);
};

ZmAutocompleteListView.prototype._handleResponseAutocomplete =
function(str, chunk, text, start, callback, list) {

	var retValue;
	var change = false;

	if (!retValue) {
		if (list && list.length) {
			var len = list.length;
			DBG.println(AjxDebug.DBG2, "matches found: " + len);
			// done now in case of quick complete
			this._set(list); // populate the list view
		}

		// if text ends in a delimiter, complete immediately without showing the list
		var match;
		if (chunk && chunk.delim && (chunk.end == chunk.text.length - 1)) {
			DBG.println(AjxDebug.DBG2, "performing quick completion");
			var result = this._complete(text, str, true);
			if (result) {
				text = result.text;
				start = result.start;
				match = result.match;
				change = true;
			}
		} else if (list && list.length) {
			// show the list, unless this is not the first time we're displaying results for
			// this autocomplete string (eg GAL), and the user selected a result from the
			// first time we showed the list (bug 28886)
			if (!this._hasCompleted) {
				this.show(true);
			}
		}
	
		retValue = {text: text, start: start, match: match, change: change};
	}
	
	if (callback) {
		callback.run(retValue);
	}
};

/**
 * Replaces the current chunk of text with the selected match (even if the list
 * is not visible), or with replacement text returned by the data class. If the
 * given text ends with a delimiter, "quick complete" is triggered, which does
 * the replacement without showing the list.
 * 
 * @param text		[string]		current input text
 * @param str		[string]*		current chunk
 * @param hasDelim	[boolean]*		current chunk ends with a delimiter
 */
ZmAutocompleteListView.prototype._complete =
function(text, str, hasDelim) {
	DBG.println(AjxDebug.DBG3, "ZmAutocompleteListView: _complete: selected is " + this._selected);
	var match = this._getSelected();
	if (!match && str && hasDelim && this._dataAPI.quickComplete) {
		match = this._dataAPI.quickComplete(str);
	}
	if (!match)	{ return; }

	var start = this._start;
	var end = hasDelim ? this._end + 1 : this._end;
	DBG.println(AjxDebug.DBG2, "update replace range: " + start + " - " + end);
	var value = "";
	if (this._matchValue instanceof Array) {
		for (var i = 0, len = this._matchValue.length; i < len; i++) {
			if (match[this._matchValue[i]]) {
				value = match[this._matchValue[i]];
				break;
			}
		}
	} else {
		value = match[this._matchValue] || "";
	}
	var newText = [text.substring(0, start), value, this._separator, text.substring(end, text.length)].join("");
	if (value) {
		this._done[value] = true;
	}
	DBG.display(AjxDebug.DBG2, newText);
	return {text: newText, start: start + value.length + this._separator.length, match: match};
};

// Resets the value of an element to the given text.
ZmAutocompleteListView.prototype._updateField =
function(text, match) {
	var el = this._element;
	el.value = text;
	el.focus();
	Dwt.setSelectionRange(el, text.length, text.length);

	this.reset();
	this._hasCompleted = true;
	if (this._compCallback) {
		this._compCallback.run(text, el, match);
	}
};

// Updates the element with the currently selected match.
ZmAutocompleteListView.prototype._update =
function(hasDelim) {
	var result = this._complete(this._element.value, null, hasDelim);
	if (result) {
		this._updateField(result.text, result.match);
	}
};

// Listeners

// MOUSE_DOWN selects a match and performs an update. Note that we don't wait for
// a corresponding MOUSE_UP event.
ZmAutocompleteListView.prototype._mouseDownListener = 
function(ev) {
	ev = DwtUiEvent.getEvent(ev);
	var div = DwtUiEvent.getTargetWithProp(ev, "_pos");	// target could be DIV or B
	if (!div || div._pos == null)
		return;
	if (ev.button == DwtMouseEvent.LEFT) {
		this._setSelected(div._pos);
		if (this.isListenerRegistered(DwtEvent.SELECTION)) {
	    	var selEv = DwtShell.selectionEvent;
	    	DwtUiEvent.copy(selEv, ev);
	    	selEv.match = div._match;
	    	selEv.detail = 0;
	    	this.notifyListeners(DwtEvent.SELECTION, selEv);
	    	return true;
	    }		
	}
};

// Mouse over selects a match
ZmAutocompleteListView.prototype._mouseOverListener = 
function(ev) {
	ev = DwtUiEvent.getEvent(ev);
	var div = DwtUiEvent.getTarget(ev);
	div = Dwt.findAncestor(div, "_pos");
	if (div) {
		this._setSelected(div._pos);
	}
	return true;
};

// Seems like DwtComposite should define this method
ZmAutocompleteListView.prototype._addSelectionListener = 
function(listener) {
	this._eventMgr.addListener(DwtEvent.SELECTION, listener);
};

ZmAutocompleteListView.prototype._listSelectionListener = 
function(ev) {
	this._update(true);
};

// Layout

// Creates the list and its member elements based on the matches we have. Each match becomes a 
// DIV. The first match is automatically selected.
ZmAutocompleteListView.prototype._set =
function(list, sel) {
	var thisHtmlElement = this.getHtmlElement();
	thisHtmlElement.innerHTML = "";
	this._matches = list;
	var len = this._matches.length;
	for (var i = 0; i < len; i++) {
		var match = this._matches[i];
		if (match && (match.text || match.icon)) {
			var div = this._getDiv(i);
			div._pos = i;
			this._addRow(div, match.text, match.icon);
			thisHtmlElement.appendChild(div);
		}
	}
	AjxTimedAction.scheduleAction(new AjxTimedAction(this,
		function() {
			this._setSelected(sel || 0);
		}), 100);
};

ZmAutocompleteListView.prototype._getDiv = 
function(id) {
	var div = document.createElement("div");
	div[DwtListView._STYLE_CLASS] = "Row";
	// MOW: make class name for selected:  "Row Row-selected" instead of just "Row-selected"
	div[DwtListView._SELECTED_STYLE_CLASS] = div[DwtListView._STYLE_CLASS] + " " + div[DwtListView._STYLE_CLASS] + "-" + DwtCssStyle.SELECTED;
	div.className = div[DwtListView._STYLE_CLASS];
	div.id = "AutoCompleteListViewDiv_" + id;
	return div;
};

// Adds a row with text and possibly an icon for the left column
ZmAutocompleteListView.prototype._addRow = 
function(div, text, icon) {
	if (icon) {
		var html = [];
		var idx = 0;
		html[idx++] = "<table cellpadding=0 cellspacing=0 border=0>";
		html[idx++] = "<tr>";
		html[idx++] = "<td style='width:";
		html[idx++] = 20;
		html[idx++] = "' class='Icon'>";
		if (icon.indexOf('Dwt') != -1) {
			html[idx++] = ["<div class='", icon, "'></div>"].join("");
		} else {
			html[idx++] = AjxImg.getImageHtml(icon);
		}
		html[idx++] = "</td>";
		html[idx++] = "<td>";
		html[idx++] = text;
		html[idx++] = "</td></tr></table>";
		div.innerHTML = html.join("");
	} else {
		div.innerHTML = text;
	}
};

// Displays the list
ZmAutocompleteListView.prototype._popup = 
function(loc) {

	var shellHeight = this.shell.getSize().y;
	var elLoc = Dwt.getLocation(this._element);
	var elSize = Dwt.getSize(this._element);
	var x = elLoc.x;
	var y = elLoc.y + elSize.y;
	this.setLocation(Dwt.LOC_NOWHERE, Dwt.LOC_NOWHERE);
	this.setVisible(true);
	var myHeight = this.getSize().y;
	var newHeight;
	if (y + myHeight > shellHeight) {
		// If not enough vertical space, set height and let it scroll
		newHeight = (shellHeight - y) - (10 + (AjxEnv.isIE ? 20 : 0));
		if (newHeight < 40) {
			// if we can't show at least a couple rows, position it above the input
			newHeight = null;
			y = elLoc.y - myHeight;
			if (y < 0) {
				// need to scroll
				y = 0;
				newHeight = shellHeight - elLoc.y;
			}
		}
	}
	this.setSize(Dwt.DEFAULT, newHeight ? newHeight : Dwt.CLEAR);

    this.setLocation(x, y);
	this.setZIndex(Dwt.Z_DIALOG_MENU);
	ZmAutocompleteListView._activeAcList = this;
	DwtEventManager.addListener(DwtEvent.ONMOUSEDOWN, ZmAutocompleteListView._outsideMouseDownListener);
	this.shell._setEventHdlrs([DwtEvent.ONMOUSEDOWN]);
	this.shell.addListener(DwtEvent.ONMOUSEDOWN, this._outsideListener);
};

// Hides the list
ZmAutocompleteListView.prototype._popdown = 
function() {
	this.setZIndex(Dwt.Z_HIDDEN);
	this.setVisible(false);
	ZmAutocompleteListView._activeAcList = null;
	DwtEventManager.removeListener(DwtEvent.ONMOUSEDOWN, ZmAutocompleteListView._outsideMouseDownListener);
	this.shell._setEventHdlrs([DwtEvent.ONMOUSEDOWN], true);
	this.shell.removeListener(DwtEvent.ONMOUSEDOWN, this._outsideListener);
};

// Selects a match by changing its CSS class
ZmAutocompleteListView.prototype._setSelected =
function(sel) {
	DBG.println(AjxDebug.DBG3, "setting selected index to " + sel);
	var children = this.getHtmlElement().childNodes;
	if (!children) { return; }

	var len = children.length;
	for (var i = 0; i < len; i++) {
		var div = children[i];
		var curStyle = div.className;
		if (i == sel) {
			div.className = div[DwtListView._SELECTED_STYLE_CLASS];
		} else if (curStyle != div[DwtListView._STYLE_CLASS]) {
			div.className = div[DwtListView._STYLE_CLASS];
		}
	}
	this._selected = sel;
};

// Miscellaneous

// Clears the internal list of matches
ZmAutocompleteListView.prototype._removeAll =
function() {
	this._matches = null;
	var htmlElement = this.getHtmlElement();
	while (htmlElement.hasChildNodes()) {
		htmlElement.removeChild(htmlElement.firstChild);
	}
};

// Returns the number of matches
ZmAutocompleteListView.prototype.size =
function() {
	return this._matches ? this._matches.length : 0;
};

// Returns the index of the currently selected match
ZmAutocompleteListView.prototype._getSelectedIndex =
function() {
	return this._selected;
};

// Returns the currently selected match
ZmAutocompleteListView.prototype._getSelected =
function() {
	if (this._matches && this._matches.length) {
		var selected = this._selected || 0;
		return this._matches[selected];
	} else {
		return null;
	}
};

// Force focus to the input element (handle Tab in Firefox)
ZmAutocompleteListView.prototype._autocompleteFocus =
function(htmlEl) {
	htmlEl.focus();
};

ZmAutocompleteListView.prototype._getAcListLoc =
function(ev) {
	var element = ev.element;
	var loc = Dwt.getLocation(element);
	var height = Dwt.getSize(element).y;
	return (new DwtPoint(loc.x, loc.y + height));
};

ZmAutocompleteListView.prototype._clearWaiting =
function() {
	var div = document.getElementById(this._waitDivId);
	if (div) {
		this.getHtmlElement().removeChild(div);
	}
	if (!this.size()) {
		// hide if "waiting" row was only one
		this.show(false);
	}
};
