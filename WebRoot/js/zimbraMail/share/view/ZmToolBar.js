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
 * This file defines a toolbar.
 */

/**
 * Creates a toolbar.
 * @class
 * This class represents a basic toolbar which can add buttons, manage listeners, and
 * enable/disabled its buttons.
 *
 * @author Conrad Damon
 *
 * @param {Hash}	params		a hash of parameters
 * @param	{DwtComposite}	params.parent		the containing widget
 * @param	{String}	params.className	the CSS class
 * @param	{constant}	params.posStyle		the positioning style
 * @param	{String}	params.id			an explicit ID to use for the control's HTML element
 * @param	{ZmController}	params.controller	the owning controller
 * @param	{String}	params.refElementId	the id of element that contains toolbar
 *        
 * @extends	DwtToolBar
 */
ZmToolBar = function(params) {
	if (arguments.length == 0) return;

	params.posStyle = params.posStyle || DwtControl.ABSOLUTE_STYLE;
	DwtToolBar.call(this, params);

	var controller = params.controller || appCtxt.getCurrentController();
	if (controller) {
		this._controller = controller;
		this._keyMap = ZmKeyMap.MAP_NAME_R[this._controller.getKeyMapName()];
	}

	this._refElementId = params.refElementId;
	this._buttons = {};
};

ZmToolBar.prototype = new DwtToolBar;
ZmToolBar.prototype.constructor = ZmToolBar;

/**
 * Returns a string representation of the object.
 * 
 * @return		{String}		a string representation of the object
 */
ZmToolBar.prototype.toString = 
function() {
	return "ZmToolBar";
};

/**
 * Adds a selection listener.
 * 
 * @param	{String}	buttonId	the button id
 * @param	{AjxListener}	listener	the listener
 */
ZmToolBar.prototype.addSelectionListener =
function(buttonId, listener) {
	var button = this._buttons[buttonId];
	if (button) {
		button.addSelectionListener(listener);
	}
};

/**
 * Removes a selection listener.
 * 
 * @param	{String}	buttonId	the button id
 * @param	{AjxListener}	listener	the listener
 */
ZmToolBar.prototype.removeSelectionListener =
function(buttonId, listener) {
	var button = this._buttons[buttonId];
	if (button) {
		button.removeSelectionListener(listener);
	}
};

/**
 * Gets the button.
 * 
 * @param	{String}	buttonId	the button id
 * @return	{ZmAppButton}	the button
 */
ZmToolBar.prototype.getButton =
function(buttonId) {
	return this._buttons[buttonId];
};

/**
 * Sets the data.
 * 
 * @param	{String}	buttonId	the button id
 * @param	{String}	key		the data key
 * @param	{Object}	data	the data
 */
ZmToolBar.prototype.setData = 
function(buttonId, key, data) {
	this._buttons[buttonId].setData(key, data);
};

/**
 * Enables or disables the specified buttons.
 *
 * @param {Array}	ids		a list of button ids
 * @param {Boolean}	enabled	if <code>true</code>, enable the buttons
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

/**
 * Enables or disables all buttons.
 * 
 * @param {Boolean}	enabled			if <code>true</code>, enable the buttons
 */
ZmToolBar.prototype.enableAll =
function(enabled) {
	for (var i in this._buttons) {
		this._buttons[i].setEnabled(enabled);
	}
};

/**
 * Creates a button and adds the button to this toolbar.
 *
 * @param {String}	id			the button id
 * @param {Hash}	params		a hash of parameters:
 * @param {function}	params.constructor	the constructor for button object (default is {@link DwtToolBarButton})
 * @param {String}	params.template		the button template
 * @param {String}	params.text			the button text
 * @param {String}	params.tooltip		the button tooltip text
 * @param {String}	params.image		the icon class for the button
 * @param {String}	params.disImage	the disabled version of icon
 * @param {Boolean}	params.enabled		if <code>true</code>, button is enabled
 * @param {String}	params.className	the CSS class name
 * @param {String}	params.style		the button style
 * @param {int}	params.index			the position at which to add the button
 * @param {constant}	params.shortcut		the shortcut id (from {@link ZmKeyMap}) for showing hint
 * @param {AjxCallback|DwtMenu}	params.menu				the menu creation callback (recommended) or menu
 * @param {Boolean}	params.menuAbove	if <code>true</code>, popup menu above the button.
 */
ZmToolBar.prototype.createButton =
function(id, params) {
	var b = this._buttons[id] = this._createButton(params);
	if (params.image) {
		b.setImage(params.image);
	}
	if (params.text) {
		b.setText(params.text);
	}
	if (params.tooltip) {
		b.setToolTipContent(ZmOperation.getToolTip(id, this._keyMap) || params.tooltip);
	}
	b.setEnabled(params.enabled !== false);
	b.setData("_buttonId", id);
	if (params.menu) {
		b.setMenu(params.menu, false, null, params.menuAbove);
	}

	return b;
};

//
// Data
//

ZmToolBar.prototype.SEPARATOR_TEMPLATE = "share.Widgets#ZmToolBarSeparator";

//
// Protected methods
//

/**
 * @private
 */
ZmToolBar.prototype._createButton =
function(params, className) {
	var ctor = params.ctor || DwtToolBarButton;
    var button = new ctor({
		parent:this,
		style:params.style,
		className:className,
		index:params.index,
		id:params.id,
		template: params.template
	});
	button.textPrecedence = params.textPrecedence;
	button.imagePrecedence = params.imagePrecedence;

	return button;
};

/**
 * @private
 */
ZmToolBar.prototype._buttonId =
function(button) {
	return button.getData("_buttonId");
};

/**
 * Creates an ordered list of which bits of text or images get removed when we need space.
 * 
 * @private
 */
ZmToolBar.prototype._createPrecedenceList =
function() {
	this._precedenceList = [];
	for (var id in this._buttons) {
		if (ZmOperation.isSep(id)) { continue; }
		var b = this._buttons[id];
		var tp = b.textPrecedence;
		if (tp) {
			this._precedenceList.push({id:id, type:"text", precedence:tp});
		}
		var ip = b.imagePrecedence;
		if (ip) {
			this._precedenceList.push({id:id, type:"image", precedence:ip});
		}
	}
	this._precedenceList.sort(function(a, b) {
		return (a.precedence > b.precedence) ? 1 : (a.precedence < b.precedence) ? -1 : 0;
	});
};

/**
 * Adjusts the toolbar size. Checks the toolbar width and compares the width of the container to see if it fits.
 * If it does not, we remove text and/or images in the specified order until the toolbar fits.
 * 
 */
ZmToolBar.prototype.adjustSize =
function() {

	if (!this._refElementId || !this._inited) { return; }
	
	var el = this.getHtmlElement();
	if (!this._refElement) {
		this._refElement = document.getElementById(this._refElementId);
	}
	if (!el || !this._refElement) { return; }

	var offset1 = this._refElement.offsetWidth;
	var offset2 = el.firstChild ? el.firstChild.offsetWidth : offset1;

	DBG.println("tb", "-------------- checking width -------------");
	DBG.println("tb", "tb width: " + offset2 + ", container width: " + offset1);

	// restore all button text and images first
	for (var i = 0; i < this._precedenceList.length; i++) {
		var p = this._precedenceList[i];
		var b = this._buttons[p.id];
		if (!b) { continue; }
		if (p.type == "text" && b._toggleText) {
			b.setText(b._toggleText);
			b._toggleText = null;
		} else if (p.type == "image" && b._toggleimage) {
			b.setImage(b._toggleimage);
			b._toggleimage = null;
		}
	}
	offset2 = el.firstChild ? el.firstChild.offsetWidth : offset1;

	if (offset1 > 0 && offset2 > offset1) {

		 // now remove button labels as needed
		for (var i = 0; i < this._precedenceList.length; i++) {

			var p = this._precedenceList[i];
			var b = this._buttons[p.id];
			if (!b || !b.getVisible()) { continue; }

			var text = b.getText();
			var image = b.getImage();
			var hasText = Boolean(text || b._toggleText);
			var hasimage = Boolean(image || b._toggleimage);
			if (hasText && hasimage && (offset2 > offset1)) {
				if (p.type == "text") {
					b._toggleText = text;
					DBG.println("tb", "removed text: " + text);
					b.setText("");
				} else if (p.type == "image") {
					b._toggleimage = image;
					DBG.println("tb", "removed image: " + image);
					b.setImage("");
				}
			}

			offset2 = el.firstChild ? el.firstChild.offsetWidth : offset1;
		}
	}
};

// The following overrides are so that we check our width after a call to a function that
// may affect our size.

/**
 * Sets the size. This method is called by the application view manager <code>fitToContainer()</code>,
 * which happens during initial layout as well as in response to the user changing the browser size.
 * 
 * @param	{int}	width	the width (in pixels)
 * @param	{int}	height	the height (in pixels)
 */
ZmToolBar.prototype.setSize =
function(width, height) {
	DBG.println("tb", "------ setSize " + width + " x " + height);
	var sz = this.getSize();
	if (width != sz.x || height != sz.y) {
		DwtToolBar.prototype.setSize.apply(this, arguments);
		this.adjustSize();
	}
};

/**
 * @private
 */
ZmToolBar.prototype._addItem =
function(type, element, index) {
	DwtToolBar.prototype._addItem.apply(this, arguments);
	this.adjustSize();
};

/**
 * @private
 */
ZmToolBar.prototype._removeItem =
function(type, element, index) {
	DwtToolBar.prototype._removeItem.apply(this, arguments);
	this.adjustSize();
};
