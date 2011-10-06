/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011 Zimbra, Inc.
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
 * 
 * The data class's <code>autocompleteMatch()</code> method should returns a list of matches, where each match is
 * an object with the following properties:
 * <table border="1" width="50%">
 * <tr><td width="15%">data</td><td>the object being matched</td></tr>
 * <tr><td>text</td><td>the text to display for this object in the list</td></tr>
 * <tr><td>[key1]</td><td>a string that may be used to replace the typed text</td></tr>
 * <tr><td>[keyN]</td><td>a string that may be used to replace the typed text</td></tr>
 * </table>
 * 
 * The calling client also specifies the key in the match result for the string that will be used
 * to replace the typed text (also called the "completion string"). For example, the completion 
 * string for matching contacts could be a full address, or just the email.
 * 
 * The client may provide additional key event handlers in the form of callbacks. If the callback
 * explicitly returns true or false, that's what the event handler will return.
 * 
 * A single autocomplete list view may handle several related input fields. With the "quick complete" feature, there
 * may be multiple outstanding autocomplete requests to the server. Each request is managed through a context which
 * has all the information needed to make the request and handle its results.
 * 
 * 
 * 
 * Using Autocomplete
 * 
 * Autocomplete kicks in after there is a pause in the typing (that pause has to be at least 300ms by default). Let's say that
 * you are entering addresses into the To: field while composing an email. You type a few characters and then pause:
 * 
 * 	dav
 * 
 * ZCS will ask the user for people whose name or email address matches "dav", and display the matches in a list that pops up.
 * The matches will be sorted with the people you email the most at the top. When you select a match, that person's address
 * will replace the search string ("dav") in the To: field. Typically the address will be in a bubble.
 * 
 * 	Davey Jones x
 * 
 * Quick Complete
 * 
 * Many times you will know which address you're looking for, and you will type enough characters so that they will appear at
 * the top of the matches, and then you type semicolon or a return to select them once the list has come up. If you know that
 * the address you want will appear at the top of the matches based on what you've typed, then there's a way to select it 
 * without waiting for the list to come up: just type a semicolon. For example, let's assume that I email Davey Jones a lot,
 * and I know that if I type "dav" he will be the first match. I can just type
 * 
 * 	dav;
 * 
 * and continue, whether that's adding more addresses, or moving on to the subject and body (done easily via the Tab key).
 * Autocompletion will happen in the background, and will automatically replace "dav;" with the first match from the list. If 
 * no matches are found, nothing changes. One way to think of the Quick Complete feature is as the autocomplete version of 
 * Google's "I'm Feeling Lucky", though in this case you have a much better idea of what the results are going to be. You 
 * don't have to wait for the list to appear in order to add the bubble. It gets added for you.
 * 
 * You can type in multiple Quick Complete strings, and they will all be handled. For example, I could type
 * 
 * 	dav;pb;ann;x;
 * 
 * and see bubbles pop up for Davey Jones, Phil Bates, Ann Miller, and Xavier Gold without any more action on my part. I could
 * even type "dav;" into the To: field, hit Tab to go to the Cc: field, type "pb;" there, and then Tab to the Subject: field,
 * and start writing my message.
 * 
 * One small limitation of Quick Complete is that the bubbles will pop up within a field in the order that the results come 
 * back, which may not match the order of the strings you typed in. You can drag the bubbles to rearrange them if you want.
 * 
 * Special Keys
 * 
 * There are a number of keys that have special meanings when you are working with an input field that supports autocomplete. 
 * Most of them apply while the list of matches is showing, and are used to control selection of the match you want:
 * 
 * Return		Adds the selected address
 * Tab		Adds the selected address
 * ;		Adds the selected address
 * ,		Adds the selected address (if enabled in Preferences/Address Book/Autocomplete)
 * DownArrow	Selects the next address (hold to repeat)
 * UpArrow		Selects the previous address (hold to repeat)
 * Esc		Hides the list
 * 
 * A few keys have special meanings while the list is not showing:
 * 
 * Return		If the input contains an email address, turn it into a bubble
 * Tab		Go to the next field
 * Esc		If requests are pending (it will say "Autocompleting…"), cancel them. If not, cancel compose.
 * 
 * 
 * 
 * @author Conrad Damon
 *
 * @param {Hash}	params			a hash of parameters:
 * @param	{String}		matchValue			the name of field in match result to use for completion
 * @param	{function}		dataClass			the class that has the data loader
 * @param	{function}		dataLoader			a method of dataClass that returns data to match against
 * @param	{DwtComposite}	parent				the control that created this list (defaults to shell)
 * @param	{String}		className			the CSS class
 * @param	{Array}			delims				the list of delimiters (which separate tokens such as addresses)
 * @param	{Array}			delimCodes			the list of delimiter key codes
 * @param	{String}		separator			the separator (gets added to the end of a match)
 * @param	{AjxCallback}	compCallback		the callback into client to notify it that completion happened
 * @param	{AjxCallback}	keyDownCallback		the additional client ONKEYDOWN handler
 * @param	{AjxCallback}	keyPressCallback	the additional client ONKEYPRESS handler
 * @param	{AjxCallback}	keyUpCallback		the additional client ONKEYUP handler
 * @param	{string}		contextId			ID from parent
 * @param	{Hash}			options				the additional options for the data class
 * @param	{function}		locationCallback	used to customize list location (optional)
 * 
 * @extends		DwtComposite
 */
ZmAutocompleteListView = function(params) {

	if (arguments.length == 0) { return; }

	params.parent = params.parent || appCtxt.getShell();
	params.className = params.className || "ZmAutocompleteListView";
	params.posStyle = DwtControl.ABSOLUTE_STYLE;
	params.id = params.contextId ? DwtId.makeId(ZmId.WIDGET_AUTOCOMPLETE, params.contextId) :
								   this._htmlElId || Dwt.getNextId("ZmAutocompleteListView_");
	DBG.println("acid", "ID: " + params.id);
	DwtComposite.call(this, params);

	this._dataClass = this._dataAPI = params.dataClass;
	this._dataLoader = params.dataLoader;
	this._dataLoaded = false;
	this._matchValue = params.matchValue;
	this._separator = (params.separator != null) ? params.separator : AjxEmailAddress.SEPARATOR;
    this._options = params.options || {};
	this._locationCallback = params.locationCallback;

	this._callbacks = {};
	for (var i = 0; i < ZmAutocompleteListView.CALLBACKS.length; i++) {
		this._setCallbacks(ZmAutocompleteListView.CALLBACKS[i], params);
	}

	this._isDelim = AjxUtil.arrayAsHash(params.delims || ZmAutocompleteListView.DELIMS);
	this._isDelimCode = AjxUtil.arrayAsHash(params.delimCodes || ZmAutocompleteListView.DELIM_CODES);
	if (!params.delims && !params.delimCodes) {
		this._isDelim[','] = this._isDelimCode[188] = appCtxt.get(ZmSetting.AUTOCOMPLETE_ON_COMMA); 
		var listener = new AjxListener(this, this._settingChangeListener);
		var aoc = appCtxt.getSettings().getSetting(ZmSetting.AUTOCOMPLETE_ON_COMMA);
		if (aoc) {
			aoc.addChangeListener(listener);
		}
	}

    // mouse event handling
	this._setMouseEventHdlrs();
	this.addListener(DwtEvent.ONMOUSEDOWN, new AjxListener(this, this._mouseDownListener));
	this.addListener(DwtEvent.ONMOUSEOVER, new AjxListener(this, this._mouseOverListener));
	this._addSelectionListener(new AjxListener(this, this._listSelectionListener));
	this._outsideListener = new AjxListener(null, ZmAutocompleteListView._outsideMouseDownListener);

	// only trigger matching after a sufficient pause
	this._acInterval = appCtxt.get(ZmSetting.AC_TIMER_INTERVAL);
	this._acActionId = {};	// per element

	// for managing focus on Tab in Firefox
	if (AjxEnv.isGeckoBased) {
		this._focusAction = new AjxTimedAction(null, this._autocompleteFocus);
	}

	this._origClass = "acRow";
	this._selClass = "acRow-selected";
	this._showLinkTextClass = "LinkText";
	this._hideLinkTextClass = "LinkText-hide";
	this._hideSelLinkTextClass = "LinkText-hide-selected";

	this._contexts 			= {};	// key is element ID
	this._inputLength		= {};	// key is element ID
	
	this.setVisible(false);
	this.setScrollStyle(Dwt.SCROLL);
	this.reset();
};

ZmAutocompleteListView.prototype = new DwtComposite;
ZmAutocompleteListView.prototype.constructor = ZmAutocompleteListView;
ZmAutocompleteListView.prototype.toString = function() { return "ZmAutocompleteListView"; };

ZmAutocompleteListView.CB_ADDR_FOUND	= "addrFound";
ZmAutocompleteListView.CB_COMPLETION	= "comp";
ZmAutocompleteListView.CB_KEYDOWN		= "keyDown";
ZmAutocompleteListView.CB_KEYPRESS		= "keyPress";
ZmAutocompleteListView.CB_KEYUP			= "keyUp";
ZmAutocompleteListView.CALLBACKS = [
		ZmAutocompleteListView.CB_ADDR_FOUND,
		ZmAutocompleteListView.CB_COMPLETION,
		ZmAutocompleteListView.CB_KEYDOWN,
		ZmAutocompleteListView.CB_KEYPRESS,
		ZmAutocompleteListView.CB_KEYUP
];

// map of characters that are completion characters
ZmAutocompleteListView.DELIMS			= [',', ';', '\n', '\r', '\t'];	// used when list is not showing
ZmAutocompleteListView.DELIM_CODES		= [188, 59, 186, 3, 13, 9];		// used when list is showing

ZmAutocompleteListView.WAIT_ID = "wait";

// for list selection with up/down arrows
ZmAutocompleteListView.NEXT = -1;
ZmAutocompleteListView.PREV = -2;

// possible states of an autocomplete context
ZmAutocompleteListView.STATE_NEW		= "NEW";
ZmAutocompleteListView.STATE_REQUEST	= "REQUEST";
ZmAutocompleteListView.STATE_RESPONSE	= "RESPONSE";
ZmAutocompleteListView.STATE_DONE		= "DONE";




/**
 * Handles the on key down event.
 * 
 * @param	{Event}	event		the event
 */
ZmAutocompleteListView.onKeyDown =
function(ev) {

	ev = DwtUiEvent.getEvent(ev);
	var key = DwtKeyEvent.getCharCode(ev);
	var result = true;
	var element = DwtUiEvent.getTargetWithProp(ev, "_aclvId");
	DBG.println("ac", ev.type.toUpperCase() + " in " + element.id + ": " + key);
	var aclv = element && DwtControl.ALL_BY_ID[element._aclvId];
	if (aclv) {
		// if the user types a single delimiting character with the list showing, do completion
		var isDelim = (!ev.shiftKey && aclv._isDelimCode[key]);
		var visible = aclv.getVisible();
		aclv._actionHandled = false;
		// DBG.println("ac", "key = " + key + ", isDelim: " + isDelim);
		if ((isDelim && visible) || (key == 27 || (visible && (key == 38 || key == 40)))) {
			DBG.println("ac", "handle action for key " + key);
			if (aclv.handleAction(key, isDelim, element)) {
				aclv._actionHandled = true;
//				return ZmAutocompleteListView._echoKey(false, ev);
				result = false;
			}
		}
		aclv._inputLength[element.id] = element.value.length;
		var cbResult = aclv._runCallbacks(ZmAutocompleteListView.CB_KEYDOWN, element && element.id, [ev, aclv, result, element]);
		// DBG.println("ac", ev.type.toUpperCase() + " cbResult: " + cbResult);
		result = (cbResult === true || cbResult === false) ? cbResult : result;
	}
	return ZmAutocompleteListView._echoKey(result, ev);
};

/**
 * Handles the on key press event.
 * 
 * @param	{Event}	event		the event
 */
ZmAutocompleteListView.onKeyPress =
function(ev) {
	ev = DwtUiEvent.getEvent(ev);
	DwtKeyEvent.geckoCheck(ev);
	var result = true;
	var key = DwtKeyEvent.getCharCode(ev);
	var element = DwtUiEvent.getTargetWithProp(ev, "_aclvId");
	DBG.println("ac", ev.type.toUpperCase() + " in " + element.id + ": " + key);
	var aclv = element && DwtControl.ALL_BY_ID[element._aclvId];
	if (aclv) {
		if (aclv._actionHandled) {
			result = false;
		}
		var cbResult = aclv._runCallbacks(ZmAutocompleteListView.CB_KEYPRESS, element && element.id, [ev, aclv, result, element]);
		DBG.println("ac", ev.type.toUpperCase() + " cbResult: " + cbResult);
		result = (cbResult === true || cbResult === false) ? cbResult : true;
	}

	return ZmAutocompleteListView._echoKey(result, ev);
};

/**
 * Handles the on key up event.
 * 
 * @param	{Event}	event		the event
 */
ZmAutocompleteListView.onKeyUp =
function(ev) {
	ev = DwtUiEvent.getEvent(ev);
	var result = true;
	var key = DwtKeyEvent.getCharCode(ev);
	var element = DwtUiEvent.getTargetWithProp(ev, "_aclvId");
	DBG.println("ac", ev.type.toUpperCase() + " in " + element.id + ": " + key);
	var aclv = element && DwtControl.ALL_BY_ID[element._aclvId];
	if (aclv) {
		if (aclv._actionHandled) {
			result = false;
		}
		var result = ZmAutocompleteListView._onKeyUp(ev);
		var cbResult = aclv._runCallbacks(ZmAutocompleteListView.CB_KEYUP, element && element.id, [ev, aclv, result, element]);
		DBG.println("ac", ev.type.toUpperCase() + " cbResult: " + cbResult);
		result = (cbResult === true || cbResult === false) ? cbResult : result;
	}
	return ZmAutocompleteListView._echoKey(result, ev);
};

/**
 * "onkeyup" handler for performing autocompletion. The reason it's an "onkeyup" handler is that it's the only one
 * that arrives after the input has been updated.
 *
 * @param ev		the key event
 * 
 * @private
 */
ZmAutocompleteListView._onKeyUp =
function(ev) {

	var element = DwtUiEvent.getTargetWithProp(ev, "_aclvId");
	if (!element) {
		return ZmAutocompleteListView._echoKey(true, ev);
	}

	var aclv = DwtControl.ALL_BY_ID[element._aclvId];
	var key = DwtKeyEvent.getCharCode(ev);
	var value = element.value;
	var elId = element.id;
	DBG.println("ac", ev.type + " event, key = " + key + ", value = " + value);
	ev.inputLengthChanged = (value.length != aclv._inputLength[elId]);

	// reset timer on any address field key activity
	if (aclv._acActionId[elId] != -1 && !DwtKeyMap.IS_MODIFIER[key] && key != 9) {
		DBG.println("ac", "canceling autocomplete");
		AjxTimedAction.cancelAction(aclv._acActionId[elId]);
		aclv._acActionId[elId] = -1;
	}

	// ignore modifier keys (including Shift), or a key with a modifier that makes it nonprintable
	if (DwtKeyMap.IS_MODIFIER[key] || DwtKeyMapMgr.hasModifier(ev)) {
		return true;
	}

	// if the input is empty, clear the list (if it's for this input)
	if (!value && aclv._currentContext && element == aclv._currentContext.element) {
		aclv.reset(element);
		return true;
	}

	// a Return following an address turns it into a bubble
	if (key == 13 || key == 3) {
		if (aclv._dataAPI.isComplete && aclv._dataAPI.isComplete(value)) {
			DBG.println("ac", "got a Return, found an addr: " + value);
			var result = aclv._parseInput(element)[0];
			var context = {
				element:	element,
				str:		result.str,
				isAddress:	true,
				isComplete:	result.isComplete,
				key:		aclv._getKey(result)
			}
			aclv._update(context);
			aclv.reset(element);
			return false;
		}
	}

	// skip if it's some weird character that didn't change the input
	if (!ev.inputLengthChanged) {
		return true;
	}

	// regular input, schedule autocomplete
	var ev1 = new DwtKeyEvent();
	DwtKeyEvent.copy(ev1, ev);
	ev1.aclv = aclv;
	ev1.element = element;
	DBG.println("ac", "scheduling autocomplete for: " + elId);

	var acAction = new AjxTimedAction(aclv, aclv._autocompleteAction, [ev1]);
	aclv._acActionId[elId] = AjxTimedAction.scheduleAction(acAction, aclv._acInterval);
	
	return true;
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
function(ev, context) {

	var curList = context && context.obj;
	if (curList) {
		DBG.println("out", "outside listener, cur " + curList.toString() + ": " + curList._htmlElId);
		curList.show(false);
		curList.setWaiting(false);
	}
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
 * @param {Element}	element			an HTML element
 * @param {string}	addrInputId		ID of ZmAddressInputField (for addr bubbles)
 * 
 * @private
 */
ZmAutocompleteListView.prototype.handle =
function(element, addrInputId) {
	
	var elId = element.id = element.id || Dwt.getNextId();
	DBG.println("ac", "HANDLE " + elId);
	// TODO: use el id instead of expando
	element._aclvId = this._htmlElId;
	if (addrInputId) {
		element._aifId = addrInputId;
	}
	this._contexts[elId] = {};
	this._acActionId[elId] = -1;
	Dwt.setHandler(element, DwtEvent.ONKEYDOWN, ZmAutocompleteListView.onKeyDown);
	Dwt.setHandler(element, DwtEvent.ONKEYPRESS, ZmAutocompleteListView.onKeyPress);
	Dwt.setHandler(element, DwtEvent.ONKEYUP, ZmAutocompleteListView.onKeyUp);
	this.isActive = true;
};

ZmAutocompleteListView.prototype.unhandle =
function(element) {
	DBG.println("ac", "UNHANDLE " + element.id);
	Dwt.clearHandler(element, DwtEvent.ONKEYDOWN);
	Dwt.clearHandler(element, DwtEvent.ONKEYPRESS);
	Dwt.clearHandler(element, DwtEvent.ONKEYUP);
	this.isActive = false;
};

// Kicks off an autocomplete cycle, which scans the content of the given input and then
// handles the strings it finds, possible making requests to the data provider.
ZmAutocompleteListView.prototype.autocomplete =
function(element) {

	if (this._dataLoader && !this._dataLoaded) {
		this._data = this._dataLoader.call(this._dataClass);
		this._dataAPI = this._data;
		this._dataLoaded = true;
	}

	var results = this._parseInput(element);
	this._process(results, element);
};

// Parses the content of the given input by splitting the text at delimiters. Returns a list of
// objects with information about each string it found.
ZmAutocompleteListView.prototype._parseInput =
function(element) {

	DBG.println("ac", "parse input for element: " + element.id); 
	var results = [];
	var text = element && element.value;
	if (!text) {
		return results;
	}
	DBG.println("ac", "PARSE: " + text);
	var str = "";
	for (var i = 0; i < text.length; i++) {
		var c = text.charAt(i);
		if (c == ' ' && !str) { continue; }	// ignore leading space
		var isDelim = this._isDelim[c];
		if (isDelim || (this._options.addrBubbles && c == ' ')) {
			// space counts as delim if bubbles are on and the space follows an address
			if (this._dataAPI.isComplete && this._dataAPI.isComplete(str)) {
				DBG.println("ac", "parse input found address: " + str);
				results.push({element:element, str:str, isComplete:true, isAddress:true});
				str = "";
			}
			else if (c == ";") {
				// semicolon triggers Quick Complete
				results.push({element:element, str:str, isComplete:true});
				str = "";
			}
			else {
				// space typed, but not after an address so no special meaning
				str += c;
			}
		}
		else {
			str += c;
		}
	}
	if (str) {
		results.push({str:str, isComplete:false});
	}

	return results;
};

/**
 * Look through the parsed contents of the input and make any needed autocomplete requests. If there is a 
 * delimited email address, go ahead and handle it now. Also, make sure to cancel any requests that no
 * longer match the contents of the input. This function will run only after a pause in the user's typing
 * (via a setTimeout call), so existing contexts will be in either the REQUEST state or the DONE state.
 */
ZmAutocompleteListView.prototype._process =
function(results, element) {

	// for convenience, create a hash of current keys for this input
	var resultsHash = {};
	for (var i = 0; i < results.length; i++) {
		var key = this._getKey(results[i]);
		resultsHash[key] = true;
	}
	
	// cancel any outstanding requests for strings that are no longer in the input
	var pendingContextHash = {};
	var oldContexts = this._contexts[element.id];
	if (oldContexts && oldContexts.length) {
		for (var i = 0; i < oldContexts.length; i++) {
			var context = oldContexts[i];
			var key = context.key;
			if (key && context.reqId && context.state == ZmAutocompleteListView.STATE_REQUEST && !resultsHash[key]) {
				DBG.println("ac", "request for '" + context.str + "' no longer current, canceling req " + context.reqId);
				appCtxt.getAppController().cancelRequest(context.reqId);
				context.state = ZmAutocompleteListView.STATE_DONE;
				if (context.str == this._waitingStr) {
					this.setWaiting(false);
				}
			}
			else if (context.state == ZmAutocompleteListView.STATE_REQUEST) {
				pendingContextHash[context.key] = context;
			}
		}
	}
	
	// process the parsed content
	var newContexts = [];
	for (var i = 0; i < results.length; i++) {
		var result = results[i];
		var str = result.str;
		var key = this._getKey(result);
		var pendingContext = pendingContextHash[key];
		// see if we already have a pending request for this result; if so, leave it alone
		if (pendingContext) {
			DBG.println("ac", "PROCESS: propagate pending context for '" + str + "'");
			newContexts.push(pendingContext);
		}
		else {
			// add a new context
			DBG.println("ac", "PROCESS: add new context for '" + str + "', isComplete: " + result.isComplete);
			var context = {
				element:	element,
				str:		str,
				isComplete:	result.isComplete,
				key:		key,
				isAddress:	result.isAddress,
				state:		ZmAutocompleteListView.STATE_NEW
			}
			newContexts.push(context);
			if (result.isAddress && this._options.addrBubbles) {
				// handle a completed email address now
				this._update(context);
			}
			else {
				// go get autocomplete results from the data provider
				this._autocomplete(context);
			}
		}
	}
	this._contexts[element.id] = newContexts;
};

// Returns a key that combines the string with whether it's subject to Quick Complete
ZmAutocompleteListView.prototype._getKey =
function(context) {
	return context.str + (context.isComplete ? this._separator : "");
};

/**
 * Resets the visible state of the autocomplete list. The state-related properties are not
 * per-element because there can only be one visible autocomplete list.
 */
ZmAutocompleteListView.prototype.reset =
function(element) {

	DBG.println("ac", "RESET");
	this._matches = null;
	this._selected = null;

	this._matchHash			= {};
	this._forgetLink		= {};
	this._expandLink		= {};

	this.show(false);
	if (this._memberListView) {
		this._memberListView.show(false);
	}
	this.setWaiting(false);
	
	if (element) {
		this._removeDoneRequests(element);
	}
};

/**
 * Checks the given key to see if it's used to control the autocomplete list in some way.
 * If it does, the action is taken and the key won't be echoed into the input area.
 *
 * The following keys are action keys:
 *	38 40		up/down arrows (list selection)
 *	27			escape (hide list)
 *
 * The following keys are delimiters (trigger completion when list is up):
 *	3 13		return
 *	9			tab
 *	59 186		semicolon
 *	188			comma (depends on user pref)
 *
 * @param {int}		key			a numeric key code
 * @param {boolean}	isDelim		true if a single delimiter key was typed
 * @param {Element}	element		element key event happened in 
 * 
 * @private
 */
ZmAutocompleteListView.prototype.handleAction =
function(key, isDelim, element) {

	DBG.println("ac", "autocomplete handleAction for key " + key + " / " + isDelim);

	if (isDelim) {
		this._update();
	} else if (key == 38 || key == 40) {
		// handle up and down arrow keys
		if (this.size() <= 1) { return; }
		if (key == 40) {
			this._setSelected(ZmAutocompleteListView.NEXT);
		} else if (key == 38) {
			this._setSelected(ZmAutocompleteListView.PREV);
		}
	} else if (key == 27) {
		if (this.getVisible()) {
			this.reset(element); // ESC hides the list
		}
		else if (!this._cancelPendingRequests(element)) {
			return false;
		}
	}
	return true;
};

// Cancels the XHR of any context in the REQUEST state.
ZmAutocompleteListView.prototype._cancelPendingRequests =
function(element) {

	var foundOne = false;
	var contexts = this._contexts[element.id];
	if (contexts && contexts.length) {
		for (var i = 0; i < contexts.length; i++) {
			var context = contexts[i];
			if (context.state == ZmAutocompleteListView.STATE_REQUEST) {
				DBG.println("ac", "user-initiated cancel of request for '" + context.str + "', " + context.reqId);
				appCtxt.getAppController().cancelRequest(context.reqId);
				context.state = ZmAutocompleteListView.STATE_DONE;
				foundOne = true;
			}
		}
	}
	this.setWaiting(false);
	
	return foundOne;
};

// Clean up contexts we are done with
ZmAutocompleteListView.prototype._removeDoneRequests =
function(element) {

	var contexts = this._contexts[element.id];
	var newContexts = [];
	if (contexts && contexts.length) {
		for (var i = 0; i < contexts.length; i++) {
			var context = contexts[i];
			if (context.state == ZmAutocompleteListView.STATE_DONE) {
				newContexts.push(context);
			}
		}
	}
	this._contexts[element.id] = newContexts;
};

/**
 * Sets the waiting status.
 * 
 * @param	{Boolean}	on		if <code>true</code>, turn waiting "on"
 * @param	{string}	str		string that pending request is for
 * 
 */
ZmAutocompleteListView.prototype.setWaiting =
function(on, str) {

	if (!on && !this._waitingDiv) { return; }

	var div = this._waitingDiv;
	if (!div) {
		div = this._waitingDiv = document.createElement("div");
		div.className = "acWaiting";
		var html = [], idx = 0;
		html[idx++] = "<table cellpadding=0 cellspacing=0 border=0>";
		html[idx++] = "<tr>";
		html[idx++] = "<td><div class='ImgSpinner'></div></td>";
		html[idx++] = "<td>" + ZmMsg.autocompleteWaiting + "</td>";
		html[idx++] = "</tr>";
		html[idx++] = "</table>";
		div.innerHTML = html.join("");
		Dwt.setPosition(div, Dwt.ABSOLUTE_STYLE);
		appCtxt.getShell().getHtmlElement().appendChild(div);
	}

	if (on) {
		this._popdown();
		var loc = this._getDefaultLoc();
		Dwt.setLocation(div, loc.x, loc.y);
	}
	this._waitingStr = on ? str : "";

	Dwt.setZIndex(div, on ? Dwt.Z_DIALOG_MENU : Dwt.Z_HIDDEN);
	Dwt.setVisible(div, on);
};

// Private methods

/**
 * Called as a timed action, after a sufficient pause in typing within an address field.
 * 
 * @private
 */
ZmAutocompleteListView.prototype._autocompleteAction =
function(ev) {
	var aclv = ev.aclv;
	aclv._acActionId[ev.element.id] = -1; // so we don't try to cancel
	aclv.autocomplete(ev.element);
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

	if (show) {
		this.setWaiting(false);
		this._popup(loc);
	} else {
		this._popdown();
	}
};

// Makes an autocomplete request to the data provider.
ZmAutocompleteListView.prototype._autocomplete =
function(context) {

	var str = AjxStringUtil.trim(context.str);
	if (!str || !(this._dataAPI && this._dataAPI.autocompleteMatch)) { return; }
	DBG.println("ac", "autocomplete: " + context.str);
	
	this._currentContext = context;	// so we can figure out where to pop up the "waiting" indicator
	var respCallback = this._handleResponseAutocomplete.bind(this, context);
	context.state = ZmAutocompleteListView.STATE_REQUEST;
	context.reqId = this._dataAPI.autocompleteMatch(str, respCallback, this, this._options, this._activeAccount);
	DBG.println("ac", "Request ID for " + context.element.id + " / '" + context.str + "': " + context.reqId);
};

ZmAutocompleteListView.prototype._handleResponseAutocomplete =
function(context, list) {

	context.state = ZmAutocompleteListView.STATE_RESPONSE;

	if (list && list.length) {
		DBG.println("ac", "matches found for '" + context.str + "': " + list.length);
		context.list = list;
		if (context.isComplete) {
			// doing Quick Complete, go ahead and update with the first match
			DBG.println("ac", "performing quick completion for: " + context.str);
			this._update(context, list[0]);
		} else {
			// pop up the list of matches
			this._set(list, context);
			this._currentContext = context;
			this.show(true);
		}
	} else if (!context.isComplete) {
		this._popdown();
		this._showNoResults();
	}
};

// Returns the field in the match that we show the user.
ZmAutocompleteListView.prototype._getCompletionValue =
function(match) {
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
	return value;
};

// Updates the content of the input with the given match. If bubbles are enabled, adds a bubble, otherwise just
// adds the text version of the address.
ZmAutocompleteListView.prototype._update =
function(context, match) {

	context = context || this._currentContext;
	if (!context) { return; }
	match = match || this._matchHash[this._selected];
	
	var newText = "";
	var address = context.address = context.address || (context.isAddress && context.str) || (match && this._getCompletionValue(match));
	DBG.println("ac", "UPDATE: result for '" + context.str + "' is " + AjxStringUtil.htmlEncode(address));

	// add bubble now if appropriate
	if (this._options.addrBubbles) {
		this._addBubble(context, match, context.isComplete);
	}
	else {
		newText = address + this._separator;
	}

	// figure out what the content of the input should now be
	var el = context.element;
	if (el) {
		// context.add means don't change the content (used by DL selection)
		if (!context.add) {
			// Parse the input again so we know what to replace. There is a race condition here, since the user
			// may have altered the content during the request. In that case, the altered content will not match
			// and get replaced, which is fine. Reparsing the input seems like a better option than trying to use
			// regexes.
			var results = this._parseInput(el);
			var newValue = "";
			for (var i = 0; i < results.length; i++) {
				var result = results[i];
				var key = this._getKey(result);
				if (context.key == key) {
					newValue += newText;
				}
				else {
					newValue += key;
				}
			}
			el.value = newValue;
		}
		
		if (!context.isComplete) {
			// match was selected from visible list, refocus the input and clear the list
			el.focus();
			this.reset(el);
		}
	}
	context.state = ZmAutocompleteListView.STATE_DONE;

	this._runCallbacks(ZmAutocompleteListView.CB_COMPLETION, el && el.id, [address, el, match]);
};

// Adds a bubble. If we are adding it via Quick Complete, we don't want the input field to set
// focus since the user may have tabbed into another input field.
ZmAutocompleteListView.prototype._addBubble =
function(context, match, noFocus) {

	var el = context.element;
	var addrInput = el && el._aifId && DwtControl.ALL_BY_ID[el._aifId];
	if (addrInput) {
		if (match && match.multipleAddresses) {
			// mass complete (add all) from a DL
			addrInput.addValue(context.address);
		}
		else {
			addrInput.addBubble({address:context.address, match:match, noFocus:noFocus});
		}
		el = addrInput._input;
		// Input field loses focus along the way. Restore it when the stack is finished
		if (AjxEnv.isIE) {
			AjxTimedAction.scheduleAction(new AjxTimedAction(addrInput, addrInput.focus), 0);
		}
	}
};

// Listeners

// MOUSE_DOWN selects a match and performs an update. Note that we don't wait for
// a corresponding MOUSE_UP event.
ZmAutocompleteListView.prototype._mouseDownListener = 
function(ev) {
	ev = DwtUiEvent.getEvent(ev);
	var row = DwtUiEvent.getTargetWithProp(ev, "id");
	if (!row || !row.id || row.id.indexOf("Row") == -1) { return; }
	if (ev.button == DwtMouseEvent.LEFT) {
		this._setSelected(row.id);
		if (this.isListenerRegistered(DwtEvent.SELECTION)) {
	    	var selEv = DwtShell.selectionEvent;
	    	DwtUiEvent.copy(selEv, ev);
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
	var row = Dwt.findAncestor(DwtUiEvent.getTarget(ev), "id");
	if (row) {
		this._setSelected(row.id);
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
	this._update();
};

// Layout

// Lazily create main table, since we may need it to show "Waiting..." row before
// a call to _set() is made.
ZmAutocompleteListView.prototype._getTable =
function() {

	var table = this._tableId && document.getElementById(this._tableId);
	if (!table) {
		var html = [], idx = 0;
		this._tableId = Dwt.getNextId();
		html[idx++] = "<table id='" + this._tableId + "' cellpadding=0 cellspacing=0 border=0>";
		html[idx++] = "</table>";
		this.getHtmlElement().innerHTML = html.join("");
		table = document.getElementById(this._tableId);
	}
	return table;
};

// Creates the list and its member elements based on the matches we have. Each match becomes a
// row. The first match is automatically selected.
ZmAutocompleteListView.prototype._set =
function(list, context) {

	this._removeAll();
	var table = this._getTable();
	this._matches = list;
	var forgetEnabled = (this._options.supportForget !== false);
	var expandEnabled = (this._options.supportExpand !== false);
	var len = this._matches.length;
	for (var i = 0; i < len; i++) {
		var match = this._matches[i];
		if (match && (match.text || match.icon)) {
			var rowId = match.id = this._getId("Row", i);
			this._matchHash[rowId] = match;
			var row = table.insertRow(-1);
			row.className = this._origClass;
			row.id = rowId;
			var html = [], idx = 0;
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
			if (forgetEnabled) {
				this._insertLinkCell(this._forgetLink, row, rowId, this._getId("Forget", i), (match.score > 0));
			}
			if (expandEnabled) {
				this._insertLinkCell(this._expandLink, row, rowId, this._getId("Expand", i), match.canExpand);
			}
		}
	}
	if (forgetEnabled) {
		this._forgetText = {};
		this._addLinks(this._forgetText, "Forget", ZmMsg.forget, ZmMsg.forgetTooltip, this._handleForgetLink, context);
	}
	if (expandEnabled) {
		this._expandText = {};
		this._addLinks(this._expandText, "Expand", ZmMsg.expand, ZmMsg.expandTooltip, this.expandDL, context);
	}

	AjxTimedAction.scheduleAction(new AjxTimedAction(this,
		function() {
			this._setSelected(this._getId("Row", 0));
		}), 100);
};

ZmAutocompleteListView.prototype._showNoResults =
function() {
	// do nothing. Overload to show something.
};

ZmAutocompleteListView.prototype._insertLinkCell =
function(hash, row, rowId, linkId, addLink) {
	hash[rowId] = addLink ? linkId : null;
	var cell = row.insertCell(-1);
	cell.className = "Link";
	cell.innerHTML = addLink ? "<a id='" + linkId + "'></a>" : "";
};

ZmAutocompleteListView.prototype._getId =
function(type, num) {
	return [this._htmlElId, "ac" + type, num].join("_");
};

// Add a DwtText to the link so it can have a tooltip.
ZmAutocompleteListView.prototype._addLinks =
function(textHash, idLabel, label, tooltip, handler, context) {

	var len = this._matches.length;
	for (var i = 0; i < len; i++) {
		var match = this._matches[i];
		var rowId = match.id = this._getId("Row", i);
		var linkId = this._getId(idLabel, i);
		var link = document.getElementById(linkId);
		if (link) {
			var textId = this._getId(idLabel + "Text", i);
			var text = new DwtText({parent:this, className:this._hideLinkTextClass, id:textId});
			textHash[rowId] = text;
			text.isLinkText = true;
			text.setText(label);
			text.setToolTipContent(tooltip);
			var listener = handler.bind(this, {email:match.email, textId:textId, rowId:rowId, element:context.element});
			text.addListener(DwtEvent.ONMOUSEDOWN, listener);
			text.reparentHtmlElement(link);
		}
	}
};

ZmAutocompleteListView.prototype._showLink =
function(hash, textHash, rowId, show) {
	var text = textHash && textHash[rowId];
	if (text) {
		text.setClassName(!show ? this._hideLinkTextClass :
			hash[rowId] ? this._showLinkTextClass : this._hideSelLinkTextClass);
	}
};

// Displays the list
ZmAutocompleteListView.prototype._popup =
function(loc) {

	if (this.getVisible()) { return; }

	loc = loc || this._getDefaultLoc();
	var x = loc.x;
	var y = loc.y;

	var windowSize = this.shell.getSize();
	var availHeight = windowSize.y - y;
	var fullHeight = this.size() * this._getRowHeight();
	this.setLocation(Dwt.LOC_NOWHERE, Dwt.LOC_NOWHERE);
	this.setVisible(true);
	var curSize = this.getSize();
	if (availHeight < fullHeight) {
	  //we are short add text to alert user to keep typing
      this._showMoreResultsText(availHeight);
      // if we don't fit, resize so we are scrollable
      this.setSize(Dwt.DEFAULT, availHeight - (AjxEnv.isIE ? 30 : 10));
	   // see if we need to account for width of vertical scrollbar
	  var div = this.getHtmlElement();
	  if (div.clientWidth != div.scrollWidth) {
			this.setSize(curSize.x + Dwt.SCROLLBAR_WIDTH, Dwt.DEFAULT);
	  }
      
	} else if (curSize.y < fullHeight) {
		this.setSize(Dwt.CLEAR, fullHeight);
	} else {
		this.setSize(Dwt.CLEAR, Dwt.CLEAR);	// set back to auto-sizing
	}

	var newX = (x + curSize.x >= windowSize.x) ? windowSize.x - curSize.x : x;

	DBG.println("ac", this.toString() + " popup at: " + newX + "," + y);
    this.setLocation(newX, y);
	this.setVisible(true);
	this.setZIndex(Dwt.Z_DIALOG_MENU);

	var omem = appCtxt.getOutsideMouseEventMgr();
	var omemParams = {
		id:					"ZmAutocompleteListView",
		obj:				this,
		outsideListener:	this._outsideListener,
		noWindowBlur:		appCtxt.get(ZmSetting.IS_DEV_SERVER)
	}
	omem.startListening(omemParams);
};

// returns a point with a location just below the input field
ZmAutocompleteListView.prototype._getDefaultLoc = 
function() {

	if (this._locationCallback) {
		return this._locationCallback();
	}
	
	var el = this._currentContext && this._currentContext.element;
	if (!el) { return {}; }
	
	var elLoc = Dwt.getLocation(el);
	var elSize = Dwt.getSize(el);
	var x = elLoc.x;
	var y = elLoc.y + elSize.y;
	if (this._options.addrBubbles) {
		y += 3;
	}
	DwtPoint.tmp.set(x, y);
	return DwtPoint.tmp;
};

// Hides the list
ZmAutocompleteListView.prototype._popdown = 
function() {

	if (!this.getVisible()) { return; }
	DBG.println("out", "popdown " + this.toString() + ": " + this._htmlElId);

	if (this._memberListView) {
		this._memberListView._popdown();
	}
	
	this.setZIndex(Dwt.Z_HIDDEN);
	this.setVisible(false);
	this._removeAll();
	this._selected = null;

	var omem = appCtxt.getOutsideMouseEventMgr();
	omem.stopListening({id:"ZmAutocompleteListView", obj:this});
};

/*
    Display message to user that more results are available than fit in the current display
    @param {int}    availHeight available height of display
 */
ZmAutocompleteListView.prototype._showMoreResultsText =
function (availHeight){
    //over load for implementation
};

/**
 * Selects a match by changing its CSS class.
 *
 * @param	{string}	id		ID of row to select, or NEXT / PREV
 */
ZmAutocompleteListView.prototype._setSelected =
function(id) {

	if (id == this._selected) { return; }

	DBG.println("ac", "setting selected id to " + id);
	var table = document.getElementById(this._tableId);
	var rows = table && table.rows;
	if (!(rows && rows.length)) { return; }

	var len = rows.length;

	// handle selection of next/prev via arrow keys
	if (id == ZmAutocompleteListView.NEXT || id == ZmAutocompleteListView.PREV) {
		id = this._getRowId(rows, id, len);
		if (!id) { return; }
	}

	// make sure the ID matches one of our rows
	var found = false;
	for (var i = 0; i < len; i++) {
		if (rows[i].id == id) {
			found = true;
			break;
		}
	}
	if (!found) { return; }
	
	// select one row, deselect the rest
	for (var i = 0; i < len; i++) {
		var row = rows[i];
		var curStyle = row.className;
		if (row.id == id) {
			row.className = this._selClass;
		} else if (curStyle != this._origClass) {
			row.className = this._origClass;
		}
	}

	// links only shown for selected row
	this._showLink(this._forgetLink, this._forgetText, this._selected, false);
	this._showLink(this._forgetLink, this._forgetText, id, true);

	this._showLink(this._expandLink, this._expandText, this._selected, false);
	this._showLink(this._expandLink, this._expandText, id, true);

	this._selected = id;
};

ZmAutocompleteListView.prototype._getRowId =
function(rows, id, len) {

	if (len <= 1) { return; }

	var idx = -1;
	for (var i = 0; i < len; i++) {
		if (rows[i].id == this._selected) {
			idx = i;
			break;
		}
	}
	var newIdx = (id == ZmAutocompleteListView.PREV) ? idx - 1 : idx + 1;
	if (newIdx == -1) {
		newIdx = len - 1;
	}
	if (newIdx == len) {
		newIdx = 0;
	}
	
	if (newIdx >= 0 && newIdx < len) {
		Dwt.scrollIntoView(rows[newIdx], this.getHtmlElement());
		return rows[newIdx].id;
	}
	return null;
};

ZmAutocompleteListView.prototype._getRowHeight =
function() {
	if (!this._rowHeight) {
		if (!this.getVisible()) {
			this.setLocation(Dwt.LOC_NOWHERE, Dwt.LOC_NOWHERE);
			this.setVisible(true);
		}
		var row = this._getTable().rows[0];
		this._rowHeight = row && Dwt.getSize(row).y;
	}
	return this._rowHeight || 18;
};



// Miscellaneous

// Clears the internal list of matches
ZmAutocompleteListView.prototype._removeAll =
function() {
	this._matches = null;
	var table = this._getTable();
	for (var i = table.rows.length - 1; i >= 0; i--) {
		var row = table.rows[i];
		if (row != this._waitingRow) {
			table.deleteRow(i);
		}
	}
	this._removeLinks(this._forgetText);
	this._removeLinks(this._expandText);
};

ZmAutocompleteListView.prototype._removeLinks =
function(textHash) {
	if (!textHash) { return; }
	for (var id in textHash) {
		var textCtrl = textHash[id];
		if (textCtrl) {
			textCtrl.dispose();
		}
	}
};

// Returns the number of matches
ZmAutocompleteListView.prototype.size =
function() {
	return this._getTable().rows.length;
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

ZmAutocompleteListView.prototype._settingChangeListener =
function(ev) {
	if (ev.type != ZmEvent.S_SETTING) { return; }
	if (ev.source.id == ZmSetting.AUTOCOMPLETE_ON_COMMA) {
		this._isDelim[','] = this._isDelimCode[188] = appCtxt.get(ZmSetting.AUTOCOMPLETE_ON_COMMA);
	}
};

ZmAutocompleteListView.prototype._handleForgetLink =
function(params) {
	if (this._dataAPI.forget) {
		this._dataAPI.forget(params.email, this._handleResponseForget.bind(this, params.email, params.rowId));
	}
};

ZmAutocompleteListView.prototype._handleResponseForget =
function(email, rowId) {
	var row = document.getElementById(rowId);
	if (row) {
		row.parentNode.removeChild(row);
		var msg = AjxMessageFormat.format(ZmMsg.forgetSummary, [email]);
		appCtxt.setStatusMsg(msg);
	}
	appCtxt.clearAutocompleteCache(ZmAutocomplete.AC_TYPE_CONTACT);
};

/**
 * Displays a second popup list with the members of the given distribution list.
 *
 * @param {hash}			params				hash of params:
 * @param {string}			params.email		address of a distribution list
 * @param {string}			params.textId		ID of link text
 * @param {string}			params.rowId		ID or list view row
 * @param {DwtMouseEvent}	params.ev			mouse event
 * @param {DwtPoint}		params.loc			location to popup at; default is right of parent ACLV
 * @param {Element}			params.element		input element
 */
ZmAutocompleteListView.prototype.expandDL =
function(params) {

	if (!this._dataAPI.expandDL) { return; }

	var mlv = this._memberListView;
	if (mlv && mlv.getVisible() && params.textId && this._curExpanded == params.textId) {
		// User has clicked "Collapse" link
		mlv.show(false);
		this._curExpanded = null;
		this._setExpandText(params.textId, false);
	} else {
		// User has clicked "Expand" link
		if (mlv && mlv.getVisible()) {
			// expanding a DL while another one is showing
			this._setExpandText(this._curExpanded, false);
			mlv.show(false);
		}
		var contactsApp = appCtxt.getApp(ZmApp.CONTACTS);
		var contact = contactsApp.getContactByEmail(params.email);
		if (!contact) {
			contact = new ZmContact(null);
			contact.initFromEmail(params.email);	// don't cache, since it's not a real contact (no ID)
		}
		contact.isDL = true;
		if (params.textId && params.rowId) {
			this._curExpanded = params.textId;
			this._setExpandText(params.textId, true);
		}
		this._dataAPI.expandDL(contact, 0, this._handleResponseExpandDL.bind(this, contact, params));
	}
	if (params.element) {
		params.element.focus();
	}
};

ZmAutocompleteListView.prototype._handleResponseExpandDL =
function(contact, params, matches) {

	var mlv = this._memberListView;
	if (!mlv) {
		mlv = this._memberListView = new ZmDLAutocompleteListView({parent:appCtxt.getShell(), parentAclv:this});
	}
	mlv._dlContact = contact;
	mlv._dlBubbleId = params.textId;
	mlv._set(matches, contact);

	// default position is just to right of parent ac list
	var loc = params.loc;
	if (this.getVisible()) {
		loc = this.getLocation();
		loc.x += this.getSize().x;
	}

	mlv.show(true, loc);
	if (!mlv._rowHeight) {
		var table = document.getElementById(mlv._tableId);
		if (table) {
			mlv._rowHeight = Dwt.getSize(table.rows[0]).y;
		}
	}
};

ZmAutocompleteListView.prototype._setExpandText =
function(textId, expanded) {
	var textCtrl = DwtControl.fromElementId(textId);
	if (textCtrl) {
		textCtrl.setText(expanded ? ZmMsg.collapse : ZmMsg.expand);
	}
};

ZmAutocompleteListView.prototype._setCallbacks =
function(type, params) {

	var cbKey = type + "Callback";
	var list = this._callbacks[type] = [];
	if (params[cbKey]) {
		list.push({callback:params[cbKey]});
	}
};

/**
 * Adds a callback of the given type. In an input ID is provided, then the callback
 * will only be run if the event happened in that input.
 *
 * @param {constant}	type		autocomplete callback type (ZmAutocompleteListView.CB_*)
 * @param {AjxCallback}	callback	callback to add - must be an AjxCallback
 * @param {string}		inputId		DOM ID of an input element (optional)
 */
ZmAutocompleteListView.prototype.addCallback =
function(type, callback, inputId) {
	this._callbacks[type].push({callback:callback, inputId:inputId});
};

// TODO: callback must be AjxCallback do to marshalling of args - fix so bound func can be used
ZmAutocompleteListView.prototype._runCallbacks =
function(type, inputId, args) {

	var result = null;
	var list = this._callbacks[type];
	if (list && list.length) {
		for (var i = 0; i < list.length; i++) {
			var cbObj = list[i];
			if (inputId && cbObj.inputId && (inputId != cbObj.inputId)) { continue; }
			var r = AjxCallback.prototype.run.apply(cbObj.callback, args);
			if (r === true || r === false) {
				result = (result == null) ? r : result && r;
			}
		}
	}
	return result;
};
