/*
 * ***** BEGIN LICENSE BLOCK *****
 * 
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2005, 2006, 2007 Zimbra, Inc.
 * 
 * The contents of this file are subject to the Yahoo! Public License
 * Version 1.0 ("License"); you may not use this file except in
 * compliance with the License.  You may obtain a copy of the License at
 * http://www.zimbra.com/license.
 * 
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * 
 * ***** END LICENSE BLOCK *****
 */

/**
* Quickly hacked up class to represent a round button that has a background image and a foreground image.
* Should probably be a subclass of DwtButton, since it copied a bunch of the mouse event handling code from
* there. But it doesn't quite fit into being a DwtLabel, with the stacked images and all.
*
* The button has an inner image positioned relative to an outer image, so that it's roughly centered.
*
* - cannot have a menu
* - does not support enabled/disabled
*
* @author Conrad Damon
*/
ZmChicletButton = function(parent, className, icon, text, isLast) {
	if (arguments.length == 0) return;

    var style = DwtLabel.IMAGE_LEFT;
    DwtButton.call(this, {parent:parent, style:style, className:className, posStyle:DwtControl.RELATIVE_STYLE});

    this.setImage(icon);
    this.setText(text);
};

ZmChicletButton.prototype = new DwtButton;
ZmChicletButton.prototype.constructor = ZmChicletButton;

ZmChicletButton.prototype.toString =
function() {
	return "ZmChicletButton";
};

//
// Data
//

ZmChicletButton.prototype.TEMPLATE = "share.Widgets#ZmAppChooserButton";

//
// Public methods
//

ZmChicletButton.prototype.setSelected = function(selected) {
    this.isSelected = selected;
    this.setDisplayState(selected ? DwtControl.SELECTED : DwtControl.NORMAL);
};

ZmChicletButton.prototype.setDisplayState = function(state) {
    if (this.isSelected && state != DwtControl.SELECTED) {
        state = [DwtControl.SELECTED, state].join(" ");
    }
    DwtButton.prototype.setDisplayState.call(this, state);
};

ZmChicletButton.prototype.getKeyMapName =
function() {
	return "ZmChicletButton";
};

ZmChicletButton.prototype.handleKeyAction =
function(actionCode, ev) {
    DBG.println("ZmChicletButton.prototype.handleKeyAction");
	switch (actionCode) {

		case DwtKeyMap.SELECT:
			if (this.isListenerRegistered(DwtEvent.SELECTION)) {
				var selEv = DwtShell.selectionEvent;
				selEv.item = this;
				this.notifyListeners(DwtEvent.SELECTION, selEv);
			}
			break;

		default:
			return false;
	}
	return true;
};

ZmChicletButton.prototype.startFlashing = function() {
	if (!this._favIcon) {
		this._favIcon = appContextPath + "/img/logo/favicon.ico";
		this._blankIcon = appContextPath + "/img/logo/blank.ico"; 
	}
	if (!this.__flashTimer) {
		// don't start twice
		this._origImage = this.getImage();
		this.__flashIconStatus = false;
		this.__flashTimer = setInterval(AjxCallback.simpleClosure(this.__flashIconCallback, this), 333);
	}
};

ZmChicletButton.prototype.stopFlashing = function() {
	if (this.__flashTimer) {
		clearInterval(this.__flashTimer);
		this.__flashTimer = null;
		this.setImage(this._origImage);
		this._origImage = null;
		Dwt.setFavIcon(this._favIcon);
	}
};

ZmChicletButton.prototype.__flashIconCallback = function() {
	this.__flashIconStatus = !this.__flashIconStatus;
	this.setImage(this.__flashIconStatus ? "Blank_16" : this._origImage);

	// Also flash the favicon.
	// (This probably doesn't belong in the chiclet class, but the setInterval is
	// already here, and I just want to see if people start noticing their IMs.) 
	Dwt.setFavIcon(this.__flashIconStatus ? this._blankIcon : this._favIcon);
};
