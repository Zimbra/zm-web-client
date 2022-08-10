/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016 Synacor, Inc.
 *
 * The contents of this file are subject to the Common Public Attribution License Version 1.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at: https://www.zimbra.com/license
 * The License is based on the Mozilla Public License Version 1.1 but Sections 14 and 15
 * have been added to cover use of software over a computer network and provide for limited attribution
 * for the Original Developer. In addition, Exhibit A has been modified to be consistent with Exhibit B.
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * See the License for the specific language governing rights and limitations under the License.
 * The Original Code is Zimbra Open Source Web Client.
 * The Initial Developer of the Original Code is Zimbra, Inc.  All rights to the Original Code were
 * transferred by Zimbra, Inc. to Synacor, Inc. on September 14, 2015.
 *
 * All portions of the code are Copyright (C) 2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016 Synacor, Inc. All Rights Reserved.
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
		this._keyMap = this._controller.getKeyMapName();
	}

	this._refElementId = params.refElementId;
	this._buttons = {};
};

ZmToolBar.prototype = new DwtToolBar;
ZmToolBar.prototype.constructor = ZmToolBar;

ZmToolBar.prototype.isZmToolBar = true;
ZmToolBar.prototype.toString = function() { return "ZmToolBar"; };

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
 * sets an item visibility. finds the button by id. 
 *
 * @param	{String}	buttonId	the button id
 * @param	{Boolean}	visible
 */
ZmToolBar.prototype.setItemVisible =
function(buttonId, visible) {
	var button = this.getButton(buttonId);
	if (!button) {
		return;
	}
	button.setVisible(visible);
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

ZmToolBar.prototype.setSelected =
function(id) {
    var oldButton = this._selectedId ? this._buttons[this._selectedId] : null;
    var newButton = id ? this._buttons[id] : null;
    if (oldButton) {
        oldButton.setSelected(false);
    }
    if (newButton) {
        newButton.setSelected(true);
        this._selectedId = id;
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
 *
 * @param {Object}	params.whatToShow		if exists, determines what to show as follows: (for usage, see ZmToolBar.prototype._createButton and DwtButton.prototype.setImage and DwtButton.prototype.setText
 * @param {Boolean}	params.whatToShow.showImage		if <code>true</code>, display image
 * @param {Boolean}	params.whatToShow.showText		if <code>true</code>, display text
 *
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
		b.setToolTipContent(ZmOperation.getToolTip(id, this._keyMap) || params.tooltip, true);
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
	button.whatToShow = params.whatToShow;

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
	if (sz && (width != sz.x || height != sz.y)) {
		DwtToolBar.prototype.setSize.apply(this, arguments);
	}
};

ZmToolBar.prototype.adjustSize =
function() {
	if (!this._refElementId || !this._inited) { return; }
    if (!this._refElement) {
        this._refElement = document.getElementById(this._refElementId);
    }
    var container = this._refElement && this._refElement.parentNode;
    var offsetWidth;
    if (container && ((offsetWidth = container.offsetWidth) >= 30)) {
        var style = this._refElement.style;
		style.maxWidth = style.width =  (offsetWidth - 30) + "px";
        style.overflow = "hidden";
    }
}

/**
 * Adds a button to the element with the given ID. Designed to handle non-ZmToolBar toolbars.
 * 
 * @param params	[hash]			hash of params:
 * 		  parent	[DwtControl]	parent control
 *        setting	[const]			setting that must be true for this button to be added
 *        tdId		[string]		ID of TD that is to contain this button
 *        buttonId	[string]*		ID of the button
 *        style		[const]*		button style
 *        type		[string]*		used to differentiate between regular and toolbar buttons
 *        lbl		[string]*		button text
 *        icon		[string]*		button icon
 *        tooltip	[string]*		button tooltip
 */
ZmToolBar.addButton =
function(params) {

	if (params.setting && !appCtxt.get(params.setting)) { return; }

	var button;
	var tdId = params.parent._htmlElId + (params.tdId || params.buttonId);
	var buttonEl = document.getElementById(tdId);
	if (buttonEl) {
		var btnParams = {parent:params.parent, index: params.index, style:params.style, id:params.buttonId, template: params.template, className: params.className};
		button = (params.type && params.type == "toolbar") ? (new DwtToolBarButton(btnParams)) : (new DwtButton(btnParams));
		var hint = Dwt.getAttr(buttonEl, "hint");
		ZmToolBar._setButtonStyle(button, hint, params.lbl, params.icon);
		if (params.tooltip) {
			button.setToolTipContent(params.tooltip, true);
		}
		button.reparentHtmlElement(tdId);
	}

	return button;
};

ZmToolBar._setButtonStyle =
function(button, hint, text, image) {
	if (hint == "text") {
		button.whatToShow = { showText: true };
	} else if (hint == "icon") {
		button.whatToShow = { showImage: true };
	} else { // add icon and text if no hint (or unsupported hint) provided
		button.whatToShow = { showImage: true, showText: true };
	}

	button.setText(text);
	button.setImage(image);
};
