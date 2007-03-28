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
* Creates a toolbar.
* @const
* @class
* This class represents a basic toolbar which can add buttons, manage listeners, and
* enable/disabled its buttons.
*
* @author Conrad Damon
*
* @param parent			[DwtComposite]		the containing widget
* @param className		[string]*			CSS class
* @param posStyle		[constant]*			positioning style
*/
function ZmToolBar(parent, className, posStyle) {

	if (arguments.length == 0) return;
	className = className ? className : "ZmToolBar";
	posStyle = posStyle ? posStyle : DwtControl.ABSOLUTE_STYLE;
		
	DwtToolBar.call(this, parent, className, posStyle);
	this._buttons = {};
};

ZmToolBar.prototype = new DwtToolBar;
ZmToolBar.prototype.constructor = ZmToolBar;

ZmToolBar.prototype.toString = 
function() {
	return "ZmToolBar";
};

ZmToolBar.prototype.addSelectionListener =
function(buttonId, listener) {
	this._buttons[buttonId].addSelectionListener(listener);
};

ZmToolBar.prototype.removeSelectionListener =
function(buttonId, listener) {
	this._buttons[buttonId].removeSelectionListener(listener);
};

ZmToolBar.prototype.getButton =
function(buttonId) {
	return this._buttons[buttonId];
};

ZmToolBar.prototype.setData = 
function(buttonId, key, data) {
	this._buttons[buttonId].setData(key, data);
};

/**
* Enables/disables buttons.
*
* @param ids		a list of button IDs
* @param enabled	whether to enable the buttons
*/
ZmToolBar.prototype.enable =
function(ids, enabled) {
	ids = (ids instanceof Array) ? ids : [ids];
	for (var i = 0; i < ids.length; i++) {
		if (this._buttons[ids[i]]) {
			this._buttons[ids[i]].setEnabled(enabled);
		}
	}
};

ZmToolBar.prototype.enableAll =
function(enabled) {
	for (var i in this._buttons) {
		this._buttons[i].setEnabled(enabled);
	}
};

ZmToolBar.prototype._createButton =
function(buttonId, imageInfo, text, disImageInfo, toolTip, enabled, style, align, index) {
	if (!style) {
		style = "DwtToolbarButton";
	}
	var b = this._buttons[buttonId] = new DwtButton(this, align, style, null, null, null, index);
	if (imageInfo) {
		b.setImage(imageInfo);
	}
	if (text) {
		b.setText(text);
	}
	if (toolTip) {
		b.setToolTipContent(toolTip);
	}
	if (disImageInfo) {
		b.setDisabledImage(disImageInfo);
	}
	b.setEnabled((enabled) ? true : false);
	b.setData("_buttonId", buttonId);

	return b;
};

ZmToolBar.prototype._createSeparator =
function() {
	new DwtControl(this, "vertSep");
};

ZmToolBar.prototype._buttonId =
function(button) {
	return button.getData("_buttonId");
};
