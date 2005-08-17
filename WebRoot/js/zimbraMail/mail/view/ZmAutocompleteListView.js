/**
* Creates a new autocomplete list. The list isn't populated or displayed until some
* autocompletion happens. Takes a data class and loader, so that when data is needed (it's
* loaded lazily), the loader can be called on the data class.
* @constructor
* @class
* This class implements autocomplete functionality. It has two main parts: matching data based
* on keystroke events, and displaying/managing the list of matches. This class is theoretically
* neutral concerning the data that gets matched (as long as its class has an autocompleteMatch()
* method), and the field that it's being called from. In practice, it's only been used from the
* compose form address fields to match contacts.
* <p>
* The data class's autocompleteMatch() method should returns a list of matches, where each match is
* an object with the following properties:</p>
* <table border="1">
* <tr><td>data</td><td>the object being matched</td></tr>
* <tr><td>text</td><td>the text to display for this object in the list</td></tr>
* <tr><td>value</td><td>the string that shows up in the element on selection</td></tr>
* </table>
*
* @author Conrad Damon
* @param parent			the element that created this list
* @param className		CSS class
* @param dataClass		the class that has the data loader
* @param dataLoader		a method of dataClass that returns data to match against
* @param locCallback	callback into client to get desired location of autocomplete list
*/
function LmAutocompleteListView(parent, className, dataClass, dataLoader, locCallback) {

	className = className || "LmAutocompleteListView";
	DwtComposite.call(this, parent, className, DwtControl.ABSOLUTE_STYLE);

	this._appCtxt = this.shell.getData(LmAppCtxt.LABEL);
	this._dataClass = dataClass;
	this._dataLoader = dataLoader;
	this._dataLoaded = false;
	this._locCallback = locCallback;

	// mouse event handling
	this._setMouseEventHdlrs();
	this.addListener(DwtEvent.ONMOUSEDOWN, new LsListener(this, this._mouseDownListener));
	this.addListener(DwtEvent.ONMOUSEOVER, new LsListener(this, this._mouseOverListener));
	this._addSelectionListener(new LsListener(this, this._update));

	// only trigger matching after a sufficient pause
	this._acInterval = this._appCtxt.get(LmSetting.AC_TIMER_INTERVAL);
	this._acAction = new LsTimedAction();
	this._acAction.method = this._autocompleteAction;
	this._acActionId = -1;

	// for managing focus on Tab in Firefox
	if (LsEnv.isFirefox) {
		this._focusAction = new LsTimedAction();
		this._focusAction.method = this._focus;
	}

	this._internalId = LsCore.assignId(this);
	this._numChars = 0;
	this._matches = new LsVector();
	this._done = new Object();
	this.setVisible(false);
}

LmAutocompleteListView.prototype = new DwtComposite;
LmAutocompleteListView.prototype.constructor = LmAutocompleteListView;

// map of characters that are completion characters
LmAutocompleteListView.DELIMS = [',', ';', '\n', '\r', '\t'];
LmAutocompleteListView.IS_DELIM = new Object();
for (var i = 0; i < LmAutocompleteListView.DELIMS.length; i++)
	LmAutocompleteListView.IS_DELIM[LmAutocompleteListView.DELIMS[i]] = true;

// Public static methods

/**
* "onkeydown" handler for catching Tab and Esc keys. We don't want to let the browser
* handle this event for those (which it will do before we get the keyup event).
*
* @param ev		the key event
*/
LmAutocompleteListView.onKeyDown =
function(ev) {
	DBG.println(LsDebug.DBG3, "onKeyDown");
	var key = DwtKeyEvent.getCharCode(ev);
	return (key == 9 || key == 27) ? LmAutocompleteListView.onKeyUp(ev) : true;
}

/**
* "onkeyup" handler for performing autocompletion. The reason it's an "onkeyup" handler is that neither 
* "onkeydown" nor "onkeypress" arrives after the form field has been updated.
*
* @param ev		the key event
*/
LmAutocompleteListView.onKeyUp =
function(ev) {
	ev = DwtUiEvent.getEvent(ev);
	if (ev.type == "keyup")
		DBG.println(LsDebug.DBG3, "onKeyUp");
	var element = DwtUiEvent.getTargetWithProp(ev, "id");
	var aclv = LsCore.objectWithId(element._acListViewId);
	
	var id = element.id;
	var key = DwtKeyEvent.getCharCode(ev);
	// Tab/Esc handled in keydown for IE
	if (LsEnv.isIE && ev.type == "keyup" && (key == 9 || key == 27))
		return true;
	var value = element.value;
	DBG.println(LsDebug.DBG3, ev.type + " event, key = " + key + ", value = " + value);

	// reset timer on any address field key activity
	if (aclv._acActionId != -1) {
		LsTimedAction.cancelAction(aclv._acActionId);
		aclv._acActionId = -1;
	}
	
	// Figure out what this handler should return. If it returns true, the browser will
	// handle the key event. That usually means it just echoes the typed character, but
	// it could do something like change focus (eg tab). We let the browser handle input
	// characters, and anything weird that we don't want to deal with. The only keys we
	// don't let the browser handle are ones that control the features of the autocomplete
	// list.

	if (key == 16 || key == 17 || key == 18) // SHIFT, ALT, or CTRL
		return true;
	if (ev.altKey || ev.ctrlKey) // ALT and CTRL combos
		return true;
	// if the field is empty, clear the list
	if (!value) {
		aclv.reset();
		return true;
	}
	if (key == 37 || key == 39) // left/right arrow key
		return true;
	// Pass tab through if there's no list (will transfer focus)
	if ((key == 9) && !aclv.size())
		return true;

	if (LsStringUtil.isPrintKey(key) || (key == 3 || key == 9 || key == 13))
		aclv._numChars++;

	// if the user types a single delimiting character with the list showing, do completion
	var isDelim = (aclv.getVisible() && (aclv._numChars == 1) && 
				   ((key == 3 || key == 9 || key == 13) || (!ev.shiftKey && (key == 59 || key == 186 || key == 188))));

	DBG.println(LsDebug.DBG3, "numChars = " + aclv._numChars + ", key = " + key + ", isDelim: " + isDelim);
	if (isDelim || (key == 27 || key == 38 || key == 40)) {
		aclv.handleAction(key, isDelim);
		// In Firefox, focus shifts on Tab even if we return false (and stop propagation and prevent default),
		// so make sure the focus stays in this element.
		if (LsEnv.isFirefox && key == 9) {
			aclv._focusAction.params.add(element);
			LsTimedAction.scheduleAction(aclv._focusAction, 0);
		}
		DwtUiEvent.setBehaviour(ev, true, false);
		return false;
	}

	// skip if it's some weird character
	if (!LsStringUtil.isPrintKey(key) && 
		(key != 3 && key != 13 && key != 9 && key != 8 && key != 46))
		return true;

	// regular input, schedule autocomplete
	var ev1 = new DwtKeyEvent();
	DwtKeyEvent.copy(ev1, ev);
	ev1.aclv = aclv;
	ev1.element = element;
	aclv._acAction.params.removeAll();
	aclv._acAction.params.add(ev1);
	aclv._acAction.obj = aclv;
	DBG.println(LsDebug.DBG2, "scheduling autocomplete");
	aclv._acActionId = LsTimedAction.scheduleAction(aclv._acAction, aclv._acInterval);
	
	return true;
}

// Public methods

LmAutocompleteListView.prototype.toString = 
function() {
	return "LmAutocompleteListView";
}

/**
* Adds autocompletion to the given field by setting key event handlers.
*
* @param element		an HTML element
*/
LmAutocompleteListView.prototype.handle =
function(element) {
	element._acListViewId = this._internalId;
	element.onkeydown = LmAutocompleteListView.onKeyDown;
	element.onkeyup = LmAutocompleteListView.onKeyUp;
}

/**
* Autocompletion of addresses. Should be called by a handler for a keyboard event.
*
* @param element	the element (some sort of text field) doing autocomplete
* @param loc		where to popup the list, if appropriate
*/
LmAutocompleteListView.prototype.autocomplete =
function(element, loc) {

	this.reset(); // start fresh
	this._element = element; // for updating element later
	this._loc = loc;
	var text = element.value;

	var info = {text: text, start: 0};
	while (info.start < info.text.length) {
		var chunk = this._nextChunk(info.text, info.start);
		info = this._autocomplete(chunk);
	}
	if (info.text != text)
		this._updateField(info.text);
}

/**
* Resets the state of the autocomplete list.
*/
LmAutocompleteListView.prototype.reset =
function() {
	this._matches.removeAll();
	this.show(false);
}

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
*/
LmAutocompleteListView.prototype.handleAction =
function(key, isDelim) {
	DBG.println(LsDebug.DBG2, "autocomplete handleAction for key " + key + " / " + isDelim);

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
}

// Private methods

// Called as a timed action, after a sufficient pause in typing within an address field.
LmAutocompleteListView.prototype._autocompleteAction =
function(ev, key) {
	try {
		DBG.println(LsDebug.DBG2, "performing autocomplete");
		var element = ev.element;
		var aclv = ev.aclv;
		aclv._acActionId = -1; // so we don't try to cancel
		aclv._numChars = 0;
	
		var loc = this._locCallback.run(ev);
		aclv.autocomplete(element, loc, key);
	} catch (ex) {
		DBG.println("Session expired? No controller to handle exception. Cannot autocomplete w/o contact list.");
	}
}

/**
* Displays the current matches in a popup list, selecting the first.
*
* @param show	whether to display the list
* @param loc	where to display the list
*/
LmAutocompleteListView.prototype.show =
function(show, loc) {
	DBG.println(LsDebug.DBG3, "autocomplete show: " + show);
	if (show) {
		this._popup(loc);
	} else {
		this._popdown();
	}
}

// Private methods

// Finds the next chunk of text in a string that we should try to autocomplete, by reading
// until it hits some sort of address delimiter (or runs out of text)
LmAutocompleteListView.prototype._nextChunk =
function(text, start) {
	while (text.charAt(start) == ' ')	// ignore leading space
		start++;
	for (var i = start; i < text.length; i++) {
		var c = text.charAt(i);
		if (LmAutocompleteListView.IS_DELIM[c])
			return {text: text, str: text.substring(start, i), start: start, end: i, delim: true};
	}
	return {text: text, str: text.substring(start, i), start: start, end: i, delim: false};
}

// Looks for matches for a string and either displays them in a list, or does the completion
// immediately (if the string was followed by a delimiter). The chunk object that we get has
// information that allows us to do the replacement if we are performing completion.
LmAutocompleteListView.prototype._autocomplete =
function(chunk) {

	var str = chunk.str;

	// if string is empty or already a delimited address, no reason to look for matches
	if (!(str && str.length) || (this._done[str]))
		return {text: chunk.text, start: chunk.end + 1};

	this._start = chunk.start;
	this._end = chunk.end;	
	
	var text = chunk.text;
	var start = chunk.end; // move beyond the current chunk

	// do matching
	this._removeAll();
	var list = this._getMatches(str);
	if (list && list.length > 0) {
		var len = list.length;
		DBG.println(LsDebug.DBG2, "found " + len + " match" + len > 1 ? "es" : "");
		for (var i = 0; i < len; i++) {
			var match = list[i];
			this._append(match);
		}
	} else {
		return {text: text, start: start};
	}
	
	this._set(); // populate the list view

	// if the current segment ends in a delimiter, complete immediately without showing the list
	if (chunk.delim) {
		var result = this._complete(text, true);
		text = result.text;
		start = result.start;
	}
	// show the list (unless we're doing completion)
	this.show(!chunk.delim, this._loc);
	
	return {text: text, start: start};
}

// Replaces a string within some text with the selected address match.
LmAutocompleteListView.prototype._complete =
function(text, hasDelim) {
	DBG.println(LsDebug.DBG3, "complete: selected is " + this._selected);
	var match = this._getSelected();
	if (!match)	return;

	var start = this._start;
	var end = hasDelim ? this._end + 1 : this._end;
	DBG.println(LsDebug.DBG2, "update replace range: " + start + " - " + end);
	var newText = [text.substring(0, start), match.value, LmEmailAddress.SEPARATOR, text.substring(end, text.length)].join("");
	this._done[match.value] = true;
	DBG.display(LsDebug.DBG2, newText);
	return {text: newText, start: start + match.value.length + LmEmailAddress.SEPARATOR.length};
}

// Resets the value of an element to the given text.
LmAutocompleteListView.prototype._updateField =
function(text) {
	this._element.value = text;
	this._element.focus();
	this.reset();
}

// Updates the element with the currently selected match.
LmAutocompleteListView.prototype._update =
function(hasDelim) {
	var result = this._complete(this._element.value, hasDelim);
	this._updateField(result.text);
}

// Listeners

// Mouse down selects a match and performs an update
LmAutocompleteListView.prototype._mouseDownListener = 
function(ev) {
	ev = DwtUiEvent.getEvent(ev);
	var div = DwtUiEvent.getTarget(ev);
	if (!div || div._pos == null)
		return;
	if (ev.button == DwtMouseEvent.LEFT) {
		this._setSelected(div._pos);
		if (this.isListenerRegistered(DwtEvent.SELECTION)) {
	    	var selEv = DwtShell.selectionEvent;
	    	DwtUiEvent.copy(selEv, ev);
	    	selEv.item = this;
	    	selEv.detail = 0;
	    	this.notifyListeners(DwtEvent.SELECTION, selEv);
	    	return true;
	    }		
	}
}

// Mouse over selects a match
LmAutocompleteListView.prototype._mouseOverListener = 
function(ev) {
	ev = DwtUiEvent.getEvent(ev);
	var div = DwtUiEvent.getTarget(ev);
	if (!div || div._pos == null)
		return;
	this._setSelected(div._pos);
}

// Seems like DwtComposite should define this method
LmAutocompleteListView.prototype._addSelectionListener = 
function(listener) {
	this._eventMgr.addListener(DwtEvent.SELECTION, listener);
}

// Layout

// Creates the list and its member elements based on the matches we have. Each match becomes a 
// DIV. The first match is automatically selected.
LmAutocompleteListView.prototype._set =
function(sel) {
	var thisHtmlElement = this.getHtmlElement();
	thisHtmlElement.innerHTML = "";
	var len = this._matches.size();
	for (var i = 0; i < len; i++) {
		var div = this.getDocument().createElement("div");
		var match = this._matches.get(i);
		div._item = match;
		div._pos = i;
		div._styleClass = "Row";
		div._selectedStyleClass = div._styleClass + "-" + DwtCssStyle.SELECTED;
		div.className = div._styleClass;
		div.innerHTML = match.text;
		thisHtmlElement.appendChild(div);
	}
	this._selected = sel || 0;
	this._setSelected(this._selected);
}

// Displays the list
LmAutocompleteListView.prototype._popup = 
function(loc) {
	this.setLocation(loc.x, loc.y);
	this.setVisible(true);
}

// Hides the list
LmAutocompleteListView.prototype._popdown = 
function() {
	this.setVisible(false);
}

// Selects a match by changing its CSS class
LmAutocompleteListView.prototype._setSelected =
function(sel) {
	DBG.println(LsDebug.DBG3, "setting selected index to " + sel);
	var children = this.getHtmlElement().childNodes;
	if (!children) return;

	var len = children.length;
	for (var i = 0; i < len; i++) {
		var div = children[i];
		var curStyle = div.className;
		if (i == sel && curStyle != div._selectedStyleClass) {
			div.className = div._selectedStyleClass;
		} else if (curStyle != div._styleClass) {
			div.className = div._styleClass;
		}
	}
	this._selected = sel;
}

// Miscellaneous

// Adds a match to the internal list of matches
LmAutocompleteListView.prototype._append =
function(match) {
	this._matches.add(match);
}

// Clears the internal list of matches
LmAutocompleteListView.prototype._removeAll =
function() {
	this._matches.removeAll();
	var htmlElement = this.getHtmlElement();
	while (htmlElement.hasChildNodes())
		htmlElement.removeChild(htmlElement.firstChild);
}

// Returns the number of matches
LmAutocompleteListView.prototype.size =
function() {
	return this._matches.size();
}

// Returns the index of the currently selected match
LmAutocompleteListView.prototype._getSelectedIndex =
function() {
	return this._selected;
}

// Returns the currently selected match
LmAutocompleteListView.prototype._getSelected =
function() {
	return this._matches.get(this._selected);
}

// Calls the data class's matching function to get a list of matches for the given string. The data
// is loaded lazily here.
LmAutocompleteListView.prototype._getMatches =
function(str) {
	if (!this._dataLoaded) {
		this._data = this._dataLoader.call(this._dataClass);
		this._dataLoaded = true;
	}
	return this._data.autocompleteMatch(str);
}

// Force the focus to the element in args[0]
LmAutocompleteListView.prototype._focus =
function(args) {
	args[0].focus();
}
