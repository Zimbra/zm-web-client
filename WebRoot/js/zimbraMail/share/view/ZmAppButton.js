/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2013, 2014 Zimbra, Inc.
 * 
 * The contents of this file are subject to the Common Public Attribution License Version 1.0 (the "License");
 * you may not use this file except in compliance with the License. 
 * You may obtain a copy of the License at: http://www.zimbra.com/license
 * The License is based on the Mozilla Public License Version 1.1 but Sections 14 and 15 
 * have been added to cover use of software over a computer network and provide for limited attribution 
 * for the Original Developer. In addition, Exhibit A has been modified to be consistent with Exhibit B. 
 * 
 * Software distributed under the License is distributed on an "AS IS" basis, 
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. 
 * See the License for the specific language governing rights and limitations under the License. 
 * The Original Code is Zimbra Open Source Web Client. 
 * The Initial Developer of the Original Code is Zimbra, Inc. 
 * All portions of the code are Copyright (C) 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2013, 2014 Zimbra, Inc. All Rights Reserved. 
 * ***** END LICENSE BLOCK *****
 */

/**
 * @overview
 * This file defines the tab application button.
 *
 */

/**
 * @class
 * This class represents a button that behaves like a "tab" button, designed specifically for the row of
 * applications buttons at the top of the Zimbra Web Client interface.
 * <p>
 * Limitations:
 * <ul>
 * <li>cannot have a menu</li>
 * <li>does not support enabled/disabled</li>
 * </ul>
 * </p>
 * 
 * @author Conrad Damon
 * 
 * @param	{Hash}		params		a hash of parameters
 * 
 * @extends		DwtButton
 */
ZmAppButton = function(params) {

	if (arguments.length == 0) {
		return;
	}

    params.style = params.style ? params.style : DwtLabel.IMAGE_LEFT;
	params.posStyle = DwtControl.RELATIVE_STYLE;
    DwtButton.call(this, params);

	if (params.image) {
		this.setImage(params.image);
	}
	else {
		if (params.leftImage) {
			this.setImage(	params.leftImage, DwtLabel.LEFT);
		}
		if (params.rightImage) {
			this.setImage(params.rightImage, DwtLabel.RIGHT);
		}
	}

	if (params.hoverImage) {
		this.setHoverImage(params.hoverImage);
	}
	else {
		if (params.leftHoverImage) {
			this.setHoverImage(params.leftHoverImage, DwtLabel.LEFT);
		}
		if (params.rightHoverImage) {
			this.setHoverImage(params.rightHoverImage, DwtLabel.RIGHT);
		}
	}
    this.setText(params.text);
};

ZmAppButton.prototype = new DwtButton;
ZmAppButton.prototype.constructor = ZmAppButton;
ZmAppButton.prototype.role = "tab";

/**
 * Returns a string representation of the object.
 * 
 * @return		{String}		a string representation of the object
 */
ZmAppButton.prototype.toString =
function() {
	return "ZmAppButton";
};

//
// Data
//

ZmAppButton.prototype.TEMPLATE = "share.Widgets#ZmAppChooserButton";

//
// Public methods
//
ZmAppButton.prototype.setSelected =
function(selected) {
    this.isSelected = selected;
    this.setDisplayState(selected ? DwtControl.SELECTED : DwtControl.NORMAL);
};

/**
 * Sets the display state.
 * 
 * @param	{String}	state		the display state
 * @see		DwtControl
 */
ZmAppButton.prototype.setDisplayState =
function(state) {
    if (this.isSelected && state != DwtControl.SELECTED) {
        state = [DwtControl.SELECTED, state].join(" ");
    }
    DwtButton.prototype.setDisplayState.call(this, state);
};

ZmAppButton.prototype.handleKeyAction =
function(actionCode, ev) {

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
