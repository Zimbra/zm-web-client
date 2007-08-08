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
 * @param parent			[DwtComposite]		the containing widget
 * @param buttons			[array]*			a list of operation IDs
 * @param posStyle			[constant]*			positioning style
 * @param className			[string]*			CSS class name
 * @param buttonClassName	[string]*			CSS class name for buttons
 * @param overrides			[hash]*				hash of overrides by op ID
 */
ZmButtonToolBar = function(params) {
	if (arguments.length == 0) return;

    var className = params.className || "ZToolbar";
    ZmToolBar.call(this, params.parent, className, params.posStyle);
	
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
 * @param text			[string]*		button text
 * @param tooltip		[string]*		button tooltip text
 * @param image			[string]*		icon class for the button
 * @param disImage		[string]*		disabled version of icon
 * @param enabled		[boolean]*		if true, button is enabled
 * @param className		[constant]*		CSS class name
 * @param style			[constant]*		button style
 * @param index			[int]*			position at which to add the button
 */
ZmButtonToolBar.prototype.createOp =
function(id, params) {
	params.className = this._buttonStyle;
	var b = (id == ZmOperation.TEXT)
		? (new DwtText(this, "ZWidgetTitle"))
		: this.createButton(id, params);
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
