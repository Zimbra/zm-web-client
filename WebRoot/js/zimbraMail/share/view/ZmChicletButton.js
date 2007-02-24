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
function ZmChicletButton(parent, outerClass, innerClass, text, isLast) {

	if (arguments.length == 0) return;
	DwtControl.call(this, parent, outerClass, DwtControl.RELATIVE_STYLE);

	if (text) {
		this._setHtml(innerClass, text, isLast);
	} else {
		this._innerDiv = document.createElement("div");
		this._innerDiv.style.position = DwtControl.ABSOLUTE_STYLE;
		this._innerDiv.className = AjxImg.getClassForImage(innerClass);
		this.getHtmlElement().appendChild(this._innerDiv);
	}

	this._origClassName = outerClass;
	this._origInnerClass = innerClass;
	this._activatedClassName = this._origClassName + " " + DwtCssStyle.ACTIVATED;
	this._triggeredClassName = this._origClassName + " " + DwtCssStyle.TRIGGERED;

	// add custom mouse handlers to standard ones (borrowed/modified from DwtButton)
	this._setMouseEventHdlrs();
	this.addListener(DwtEvent.ONMOUSEOVER, new AjxListener(this, this._mouseOverListener));
	this.addListener(DwtEvent.ONMOUSEOUT, new AjxListener(this, this._mouseOutListener));
	this.addListener(DwtEvent.ONMOUSEDOWN, new AjxListener(this, this._mouseDownListener));
	this.addListener(DwtEvent.ONMOUSEUP, new AjxListener(this, this._mouseUpListener));

	this._mouseOutAction = new AjxTimedAction(this, this._setMouseOutClassName);
	this._mouseOutActionId = -1;
};

ZmChicletButton.prototype = new DwtControl;
ZmChicletButton.prototype.constructor = ZmChicletButton;

ZmChicletButton.prototype.toString =
function() {
	return "ZmChicletButton";
};



ZmChicletButton.prototype.setOuterImage =
function(className) {
	this._outerDiv.className = className;
};

ZmChicletButton.prototype.setInnerImage = // WARNING: this seems broken, not sure it's any good.
function(className) {
	this._innerDiv.className = AjxImg.getClassForImage(className);
};

ZmChicletButton.prototype.setImage = function(className) {
	if (this._iconDiv)
		this._iconDiv.className = AjxImg.getClassForImage(className);
};

ZmChicletButton.prototype.setActivatedImage =
function(className) {
	this._activatedClassName = className;
};

ZmChicletButton.prototype.setTriggeredImage =
function(className) {
	this._triggeredClassName = className;
};

// from DwtButton...

/**
* Adds a listener to be notified when the button is pressed.
*
* @param listener	a listener
*/
ZmChicletButton.prototype.addSelectionListener =
function(listener) {
	this.addListener(DwtEvent.SELECTION, listener);
};

/**
* Removes a selection listener.
*
* @param listener	the listener to remove
*/
ZmChicletButton.prototype.removeSelectionListener =
function(listener) {
	this.removeListener(DwtEvent.SELECTION, listener);
};

/**
* Removes all the selection listeners.
*/
ZmChicletButton.prototype.removeSelectionListeners =
function() {
	this.removeAllListeners(DwtEvent.SELECTION);
};

/**
* Activates/inactivates the button. A button is activated when the mouse is over it.
*
* @param activated		whether the button is activated
*/
ZmChicletButton.prototype.setActivated =
function(activated) {
	if (this.isSelected) return;

	if (activated)
		this.setClassName(this._activatedClassName);
	else
		this.setClassName(this._origClassName);
};

ZmChicletButton.prototype.setSelected =
function(selected) {
	if (selected) {
		this._tempOrigClassName = this._origClassName;
		this._origClassName = this._triggeredClassName;
		this.setClassName(this._triggeredClassName);
	} else {
		this._origClassName = this._tempOrigClassName;
		this.setClassName(this._origClassName);
	}

	// for chiclet buttons that are made w/ images:
	var left = document.getElementById(this._leftBtnImgId);
	if (left) left.className = selected ? "ImgSkin_Tab_Selected_L" : "ImgSkin_Tab_Normal_L";

	var middle = document.getElementById(this._middleBtnImgId);
	if (middle) middle.className = selected ? "ImgSkin_Tab_Selected__H" : "ImgSkin_Tab_Normal__H";

	var right = document.getElementById(this._rightBtnImgId);
	if (right) right.className = selected ? "ImgSkin_Tab_Selected_R" : "ImgSkin_Tab_Normal_R";

	this.isSelected = selected;
};

ZmChicletButton.prototype._setHtml =
function(innerClass, text, isLast) {
	this._leftBtnImgId = this._htmlElId + "_leftBtn";
	this._middleBtnImgId = this._htmlElId + "_middleBtn";
	this._rightBtnImgId = this._htmlElId + "_rightBtn";

	var subs = { id:this._htmlElId, innerClass:innerClass, text:text, isLast:isLast };
	var template = skin.hints && skin.hints.app_chooser.fullWidth ? "ChicletButtonEx" : "ChicletButton";
	this.getHtmlElement().innerHTML = AjxTemplate.expand("zimbraMail.share.templates.App#" + template, subs);

	this._innerDiv = document.getElementById(this._htmlElId+"_inner");
	this._iconDiv = document.getElementById(this._htmlElId + "_icon");
};

// Activates the button.
ZmChicletButton.prototype._mouseOverListener =
function(ev) {
	if (this.isSelected) return;

	if (this._mouseOutActionId != -1) {
		AjxTimedAction.cancelAction(this._mouseOutActionId);
		this._mouseOutActionId = -1;
	}
    this.setClassName(this._activatedClassName);
    ev._stopPropagation = true;
};

// Triggers the button.
ZmChicletButton.prototype._mouseDownListener =
function(ev) {
	this.trigger();
};

ZmChicletButton.prototype.trigger =
function() {
	this.setClassName(this._triggeredClassName);
	this.isTriggered = true;
};

// Button has been pressed, notify selection listeners.
ZmChicletButton.prototype._mouseUpListener =
function(ev) {
    var el = this.getHtmlElement();
	if (this.isTriggered) {
		this.setClassName(this._activatedClassName);
		if (this.isListenerRegistered(DwtEvent.SELECTION)) {
			var selEv = DwtShell.selectionEvent;
			DwtUiEvent.copy(selEv, ev);
			selEv.item = this;
			this.notifyListeners(DwtEvent.SELECTION, selEv);
		}
	}
	el.className = this._origClassName;
};

ZmChicletButton.prototype._setMouseOutClassName =
function() {
	this._mouseOutActionId = -1;
    this.setClassName(this._origClassName);
    this.isTriggered = false;
};

// Button no longer activated/triggered.
ZmChicletButton.prototype._mouseOutListener =
function(ev) {
	if (this.isSelected) return;

	if (AjxEnv.isIE) {
		this._mouseOutActionId =
 		   AjxTimedAction.scheduleAction(this._mouseOutAction, 6);
	} else {
		this._setMouseOutClassName();
	}
};

ZmChicletButton.prototype._focus =
function() {
	this.setActivated(true);
};

ZmChicletButton.prototype._blur =
function() {
	this.setActivated(false);
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
		this.__flashIconStatus = false;
		this.__flashTimer = setInterval(AjxCallback.simpleClosure(this.__flashIconCallback, this), 333);
	}
};

ZmChicletButton.prototype.stopFlashing = function() {
	if (this.__flashTimer) {
		clearInterval(this.__flashTimer);
		this.__flashTimer = null;
		this.setImage(this._origInnerClass);
	}
};

ZmChicletButton.prototype.__flashIconCallback = function() {
	this.__flashIconStatus = !this.__flashIconStatus;
	this.setImage(this.__flashIconStatus ? "Blank_16" : this._origInnerClass);
};
