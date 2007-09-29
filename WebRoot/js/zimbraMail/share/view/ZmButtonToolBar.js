/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2004, 2005, 2006 Zimbra, Inc.
 * 
 * The contents of this file are subject to the Yahoo! Public License
 * Version 1.0 ("License"); you may not use this file except in
 * compliance with the License.  You may obtain a copy of the License at
 * http://www.zimbra.com/license.
 * 
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * ***** END LICENSE BLOCK *****
 */

/**
* Creates a toolbar with the given buttons.
* @constructor
* @class
* This class represents a toolbar that contains just buttons.
* It can be easily created using a set of standard operations, and/or custom buttons
* can be provided. This class is designed for use with items (ZmItem), so it can for
* example contain a button with a tab submenu. See also ZmActionMenu.
*
* @author Conrad Damon
*
* @param parent					[DwtComposite]		the containing widget
* @param standardButtons		[array]*			a list of operation IDs
* @param extraButtons			[array]*			a list of operation descriptors
* @param posStyle				[constant]*			positioning style
* @param className				[string]*			CSS class name
*/
function ZmButtonToolBar(parent, standardButtons, extraButtons, posStyle, className, buttonClassName) {

	if (arguments.length == 0) return;
	ZmToolBar.call(this, parent, className, posStyle);
	
	buttonClassName = buttonClassName ? buttonClassName : "DwtToolbarButton";
	this._buttonStyle = buttonClassName;

	this._appCtxt = this.shell.getData(ZmAppCtxt.LABEL);

	// standard buttons default to New/Tag/Print/Delete
	if (!standardButtons) {
		standardButtons = [ZmOperation.NEW_MENU];
		if (this._appCtxt.get(ZmSetting.TAGGING_ENABLED)) {
			standardButtons.push(ZmOperation.TAG_MENU);
		}
		if (this._appCtxt.get(ZmSetting.PRINT_ENABLED)) {
			standardButtons.push(ZmOperation.PRINT);
		}
		standardButtons.push(ZmOperation.DELETE);
	} else if (standardButtons == ZmOperation.NONE) {
		standardButtons = null;
	}
	this._buttons = ZmOperation.createOperations(this, standardButtons, extraButtons);
};

ZmButtonToolBar.prototype = new ZmToolBar;
ZmButtonToolBar.prototype.constructor = ZmButtonToolBar;

// Public methods

ZmButtonToolBar.prototype.toString = 
function() {
	return "ZmButtonToolBar";
};

/**
* Creates a button and adds its operation ID as data.
*/
ZmButtonToolBar.prototype.createOp =
function(buttonId, text, imageInfo, disImageInfo, enabled, toolTip, index) {
	var b;
	if (buttonId == ZmOperation.TEXT) {
		b = new DwtText(this);
	} else {
		b = this._createButton(buttonId, imageInfo, text, disImageInfo, toolTip, enabled, this._buttonStyle, null, index);
	}
	b.setData(ZmOperation.KEY_ID, buttonId);

	return b;
};

/**
* Creates a separator. Added because ZmToolBar defines _createSeparator().
*/
ZmButtonToolBar.prototype.createSeparator =
function(index) {
	this.addSeparator("vertSep", index);
};

ZmButtonToolBar.prototype.addOp =
function(id, index) {
	ZmOperation.addOperation(this, id, this._buttons, index);
};

ZmButtonToolBar.prototype.removeOp =
function(id) {
	ZmOperation.removeOperation(this, id, this._buttons);
};

/**
* Returns the button with the given ID.
*
* @param id		an operation ID
*/
ZmButtonToolBar.prototype.getOp =
function(id) {
	return this.getButton(id);
};

/**
* Returns the menu's tag submenu, if any.
*/
ZmButtonToolBar.prototype.getTagMenu =
function() {
	var button = this.getButton(ZmOperation.TAG_MENU);
	if (button) {
		return button.getMenu();
	}
};

// Private methods

// Returns the ID for the given button.
ZmButtonToolBar.prototype._buttonId =
function(button) {
	return button.getData(ZmOperation.KEY_ID);
};
