/*
 * ***** BEGIN LICENSE BLOCK *****
 * 
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2004, 2005, 2006, 2007 Zimbra, Inc.
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
 * @param params			[hash]				hash of params:
 *        parent			[DwtComposite]		the containing widget
 *        buttons			[array]*			a list of operation IDs
 *        posStyle			[constant]*			positioning style
 *        className			[string]*			CSS class name
 *        buttonClassName	[string]*			CSS class name for buttons
 *        overrides			[hash]*				hash of overrides by op ID
 *        context			[const]*			vcontextID (used to generate button IDs)
 *        toolbarType		[const]*			toolbar type (used to generate button IDs)
 */
ZmButtonToolBar = function(params) {
	if (arguments.length == 0) return;

    params.className = params.className || "ZToolbar";
    params.id = params.context ? ZmId.getToolbarId(params.context, params.toolbarType) : null;
    ZmToolBar.call(this, params);
	
	this._context = params.context;
	this._toolbarType = params.toolbarType;
	this._buttonStyle = params.buttonClassName;

	// standard buttons default to New/Tag/Print/Delete
	var buttons = params.buttons;
	if (!buttons) {
		buttons = [ZmOperation.NEW_MENU, ZmOperation.TAG_MENU, ZmOperation.PRINT, ZmOperation.DELETE];
	} else if (buttons == ZmOperation.NONE) {
		buttons = null;
	}
	// weed out disabled ops, save list of ones that make it
	this.opList = ZmOperation.filterOperations(buttons);
	this._buttons = ZmOperation.createOperations(this, this.opList, params.overrides);
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
 * 
 * @param id			[string]		name of the operation
 * @param params		[hash]			hash of params:
 *        text			[string]*		button text
 *        tooltip		[string]*		button tooltip text
 *        image			[string]*		icon class for the button
 *        disImage		[string]*		disabled version of icon
 *        enabled		[boolean]*		if true, button is enabled
 *        className		[constant]*		CSS class name
 *        style			[constant]*		button style
 *        index			[int]*			position at which to add the button
 */
ZmButtonToolBar.prototype.createOp =
function(id, params) {
	params.className = this._buttonStyle;
	var b;
	if (id == ZmOperation.TEXT) {
		var context = this._toolbarType ? [this._context, this._toolbarType].join("_") : this._context;
		var id = [ZmId.WIDGET, AjxStringUtil.toMixed(context, "_", true), AjxStringUtil.toMixed(id, "_")].join("");
		params.textClassName = params.textClassName || "ZWidgetTitle";
		b = new DwtText({parent:this, className:params.textClassName, id:id});
	} else {
		params.id = ZmId.getToolbarButtonId(this._context, id, this._toolbarType);
		b = this.createButton(id, params);
	}
	b.setData(ZmOperation.KEY_ID, id);

	return b;
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

//
// Private methods
//

// Returns the ID for the given button.
ZmButtonToolBar.prototype._buttonId =
function(button) {
	return button.getData(ZmOperation.KEY_ID);
};
