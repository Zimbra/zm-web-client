/*
 * ***** BEGIN LICENSE BLOCK *****
 * Version: ZPL 1.2
 *
 * The contents of this file are subject to the Zimbra Public License
 * Version 1.2 ("License"); you may not use this file except in
 * compliance with the License. You may obtain a copy of the License at
 * http://www.zimbra.com/license
 *
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied. See
 * the License for the specific language governing rights and limitations
 * under the License.
 *
 * The Original Code is: Zimbra Collaboration Suite Web Client
 *
 * The Initial Developer of the Original Code is Zimbra, Inc.
 * Portions created by Zimbra are Copyright (C) 2005, 2006 Zimbra, Inc.
 * All Rights Reserved.
 *
 * Contributor(s):
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
function ZmChicletButton(parent, className, icon, text, isLast) {
	if (arguments.length == 0) return;

    var style = DwtLabel.IMAGE_LEFT;
    DwtButton.call(this, parent, style, className, DwtControl.RELATIVE_STYLE);

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

ZmChicletButton.prototype.TEMPLATE = "zimbraMail.share.templates.Widgets#ZmAppChooserButton";

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
	}
};

ZmChicletButton.prototype.__flashIconCallback = function() {
	this.__flashIconStatus = !this.__flashIconStatus;
	this.setImage(this.__flashIconStatus ? "Blank_16" : this._origImage);
};
