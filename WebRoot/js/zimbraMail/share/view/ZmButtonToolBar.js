/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2004, 2005, 2006, 2007, 2008, 2009, 2010 Zimbra, Inc.
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
 */

/**
 * Creates a toolbar with the given buttons.
 * @class
 * This class represents a toolbar that contains buttons.
 * It can be easily created using a set of standard operations, and/or custom buttons
 * can be provided. This class is designed for use with items ({@link ZmItem}), so it can for
 * example contain a button with a tab submenu. See also {@link ZmActionMenu}.
 *
 * @author Conrad Damon
 *
 * @param {Hash}	params			a hash of parameters
 * @param	       {DwtComposite}	params.parent		the containing widget
 * @param	{Array}	params.buttons			a list of operation IDs
 * @param	{constant}	params.posStyle			the positioning style
 * @param	{String}	params.className			the CSS class name
 * @param	{Stirng}	params.buttonClassName	the CSS class name for buttons
 * @param	{Hash}	params.overrides			a hash of overrides by op ID
 * @param	{constant}	params.context			the vcontextID (used to generate button IDs)
 * @param	{constant}	params.toolbarType		the toolbar type (used to generate button IDs)
 * @param	{ZmController}	params.controller		the owning controller
 * 
 * @extends		ZmToolBar
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
	/**
	 * The operation list property.
	 * @type Array
	 */
	this.opList = ZmOperation.filterOperations(buttons);
	this._buttons = ZmOperation.createOperations(this, this.opList, params.overrides);

	this._createPrecedenceList();
	
	this._inited = true;
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
 * @param {String}	id			the name of the operation
 * @param {Hash}	params		a hash of parameters
 * @param {String}	params.text			a button text
 * @param {String}	params.tooltip		a button tooltip text
 * @param {String}	params.image			a icon class for the button
 * @param {String}	params.disImage		a disabled version of icon
 * @param {Boolean}	params.enabled		if <code>true</code>, button is enabled
 * @param {String}	params.className		the CSS class name
 * @param {String}	params.style			thebutton style
 * @param {int} params.index			the position at which to add the button
 */
ZmButtonToolBar.prototype.createOp =
function(id, params) {
	params.className = this._buttonStyle;
	var b;
	if (id == ZmOperation.TEXT) {
		var id;
		if (this._context) {
			var context = this._toolbarType ? [this._context, this._toolbarType].join("_") : this._context;
			id = [ZmId.WIDGET, AjxStringUtil.toMixed(context, "_", true), AjxStringUtil.toMixed(id, "_")].join("");
		}
		params.textClassName = params.textClassName || "ZWidgetTitle";
		b = new DwtText({parent:this, className:params.textClassName, id:id});
	} else {
		params.id = this._context ? ZmId.getButtonId(this._context, id, this._toolbarType) : null;
		params.textPrecedence = ZmOperation.getProp(id, "textPrecedence");
		params.iconPrecedence = ZmOperation.getProp(id, "iconPrecedence");
		b = this.createButton(id, params);
	}
	b.setData(ZmOperation.KEY_ID, id);

	return b;
};

/**
 * Adds the operation.
 * 
 * @param	{String}	id		the id
 * @param	{int}		index	the index
 */
ZmButtonToolBar.prototype.addOp =
function(id, index) {
	ZmOperation.addOperation(this, id, this._buttons, index);
	AjxUtil.arrayAdd(this.opList, id, index);
};

/**
 * Removes the operation.
 * 
 * @param	{String}	id		the id
 * 
 * @see ZmOperation
 */
ZmButtonToolBar.prototype.removeOp =
function(id) {
	ZmOperation.removeOperation(this, id, this._buttons);
	AjxUtil.arrayRemove(this.opList, id);
};

/**
 * Gets the button.
 *
 * @param {constant}	id		the button
 * @return	{DwtButton}	the button
 * 
 * @see ZmOperation
 */
ZmButtonToolBar.prototype.getOp =
function(id) {
	return this.getButton(id);
};

/**
 * Gets the menu tag sub-menu (if any).
 * 
 * @return	{ZmTagMenu}		the menu
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
