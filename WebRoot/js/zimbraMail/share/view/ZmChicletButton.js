/**
* Quickly hacked up class to represent a round button that has a background image and a foreground image.
* Should probably be a subclass of DwtButton, since it copied a bunch of the mouse event handling code from
* there. But it doesn't quite fit into being a DwtLabel, with the stacked images and all.
*
* The button has an inner image positioned relative to an outer image, so that it's roughly centered.
*
* - cannot have a menu
* - does not support enabled/disabled
*/
function LmChicletButton(parent, outerClass, innerClass) {

	if (arguments.length == 0) return;
	DwtControl.call(this, parent, outerClass, DwtControl.RELATIVE_STYLE);

	this._innerDiv = this.getDocument().createElement("div");
	this._innerDiv.className = innerClass;
	this._innerDiv.style.position = DwtControl.ABSOLUTE_STYLE;
	this.getHtmlElement().appendChild(this._innerDiv);
	// center the inner image
	var outerSz = this.getSize();
	var innerSz = Dwt.getSize(this._innerDiv);
	Dwt.setLocation(this._innerDiv, Math.ceil((outerSz.x - innerSz.x) / 2), Math.ceil((outerSz.y - innerSz.y) / 2));
	
	this._origClassName = outerClass;
	this._activatedClassName = this._origClassName + " " + DwtCssStyle.ACTIVATED;
	this._triggeredClassName = this._origClassName + " " + DwtCssStyle.TRIGGERED;

	// borrowed/modified from DwtButton...
	
	// add custom mouse handlers to standard ones
	this._setMouseEventHdlrs();
	this._setKeyEventHdlrs();
	this.addListener(DwtEvent.ONMOUSEOVER, new LsListener(this, this._mouseOverListener));
	this.addListener(DwtEvent.ONMOUSEOUT, new LsListener(this, this._mouseOutListener));
	this.addListener(DwtEvent.ONMOUSEDOWN, new LsListener(this, this._mouseDownListener));
	this.addListener(DwtEvent.ONMOUSEUP, new LsListener(this, this._mouseUpListener));

	this._mouseOutAction = new LsTimedAction();
	this._mouseOutAction.method = this._setMouseOutClassName;
	this._mouseOutAction.obj = this;
	this._mouseOutActionId = -1;
}

LmChicletButton.prototype = new DwtControl;
LmChicletButton.prototype.constructor = LmChicletButton;

LmChicletButton.prototype.toString =
function() {
	return "LmChicletButton";
}



LmChicletButton.prototype.setOuterImage =
function(className) {
	this._outerDiv.className = className;
}

LmChicletButton.prototype.setInnerImage =
function(className) {
	this._innerDiv.className = className;
}

LmChicletButton.prototype.setActivatedImage =
function(className) {
	this._activatedClassName = className;
}

LmChicletButton.prototype.setTriggeredImage =
function(className) {
	this._triggeredClassName = className;
}

// from DwtButton...

/**
* Adds a listener to be notified when the button is pressed.
*
* @param listener	a listener
*/
LmChicletButton.prototype.addSelectionListener = 
function(listener) {
	this.addListener(DwtEvent.SELECTION, listener);
}

/**
* Removes a selection listener.
*
* @param listener	the listener to remove
*/
LmChicletButton.prototype.removeSelectionListener = 
function(listener) { 
	this.removeListener(DwtEvent.SELECTION, listener);
}

/**
* Removes all the selection listeners.
*/
LmChicletButton.prototype.removeSelectionListeners = 
function() { 
	this.removeAllListeners(DwtEvent.SELECTION);
}

/**
* Returns the button display to normal (not activated or triggered).
*/
LmChicletButton.prototype.resetClassName = 
function() {
	this.setClassName(this._origClassName);	
}

/**
* Activates/inactivates the button. A button is activated when the mouse is over it.
*
* @param activated		whether the button is activated
*/
LmChicletButton.prototype.setActivated =
function(activated) {
	if (activated)
		this.setClassName(this._activatedClassName);
	else
		this.setClassName(this._origClassName);
}

// Activates the button.
LmChicletButton.prototype._mouseOverListener = 
function(ev) {
	if (this._mouseOutActionId != -1) {
		LsTimedAction.cancelAction(this._mouseOutActionId);
		this._mouseOutActionId = -1;
	}
    this.setClassName(this._activatedClassName);
    ev._stopPropagation = true;
}

// Triggers the button.
LmChicletButton.prototype._mouseDownListener = 
function(ev) {
	this.trigger();
}

LmChicletButton.prototype.trigger =
function() {
	this.setClassName(this._triggeredClassName);
	this.isTriggered = true;	
}

// Button has been pressed, notify selection listeners.
LmChicletButton.prototype._mouseUpListener = 
function(ev) {
    var el = this.getHtmlElement();
	if (this.isTriggered) {
		this.setClassName(this._activatedClassName);
		if (this.isListenerRegistered(DwtEvent.SELECTION)) {
			var selEv = DwtShell.selectionEvent;
			DwtUiEvent.copy(selEv, ev);
			selEv.item = this;
			selEv.detail = 0;
			this.notifyListeners(DwtEvent.SELECTION, selEv);
		}
	}
	el.className = this._origClassName;	
}

LmChicletButton.prototype._setMouseOutClassName =
function() {
	this._mouseOutActionId = -1;
    this.setClassName(this._origClassName);
    this.isTriggered = false;
}

// Button no longer activated/triggered.
LmChicletButton.prototype._mouseOutListener = 
function(ev) {
	if (LsEnv.isIE){
		this._mouseOutActionId = 
 		   LsTimedAction.scheduleAction(this._mouseOutAction, 6);
	} else {
		this._setMouseOutClassName();
	}
}
