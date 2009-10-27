/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2004, 2005, 2006, 2007, 2008, 2009 Zimbra, Inc.
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
 * Creates a toolbar.
 * @const
 * @class
 * This class represents a basic toolbar which can add buttons, manage listeners, and
 * enable/disabled its buttons.
 *
 * @author Conrad Damon
 *
 * @param params		[hash]				hash of params:
 *        parent		[DwtComposite]		the containing widget
 *        className		[string]*			CSS class
 *        posStyle		[constant]*			positioning style
 *        id			[string]*			an explicit ID to use for the control's HTML element
 *        controller	[ZmController]*		owning controller
 *        refElementId	[string]*			ID of element that contains toolbar
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

ZmToolBar.prototype.toString = 
function() {
	return "ZmToolBar";
};

ZmToolBar.prototype.addSelectionListener =
function(buttonId, listener) {
	var button = this._buttons[buttonId];
	if (button) {
		button.addSelectionListener(listener);
	}
};

ZmToolBar.prototype.removeSelectionListener =
function(buttonId, listener) {
	var button = this._buttons[buttonId];
	if (button) {
		button.removeSelectionListener(listener);
	}
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

/**
 * Adds a button to this toolbar.
 *
 * @param params		[hash]			hash of params:
 *        id			[string]		button ID
 *        constructor	[function]*		Constructor for button object (default is DwtToolBarButton)
 *        template		[string]*		button template
 *        text			[string]*		button text
 *        tooltip		[string]*		button tooltip text
 *        image			[string]*		icon class for the button
 *        disImage		[string]*		disabled version of icon
 *        enabled		[boolean]*		if true, button is enabled
 *        className		[constant]*		CSS class name
 *        style			[constant]*		button style
 *        index			[int]*			position at which to add the button
 *        shortcut		[constant]*		shortcut ID (from ZmKeyMap) for showing hint
 *        menu			[AjxCallback or DwtMenu]*	Menu creation callback (recommended) or menu
 *        menuAbove		[boolean]*		true to popup menu above the button.
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

ZmToolBar.prototype._buttonId =
function(button) {
	return button.getData("_buttonId");
};

/**
 * Creates an ordered list of which bits of text or images get removed when
 * we need space.
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
 * Checks this toolbar's width and compares it to the width of its container to see if it fits.
 * If it does not, we remove text and/or images in the specified order until the toolbar fits.
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

// setSize() is called by the app view manager's fitToContainer(), which happens during
// initial layout as well as in response to the user changing the browser size.
ZmToolBar.prototype.setSize =
function(width, height) {
	DBG.println("tb", "------ setSize " + width + " x " + height);
	var sz = this.getSize();
	if (width != sz.x || height != sz.y) {
		DwtToolBar.prototype.setSize.apply(this, arguments);
		this.adjustSize();
	}
};

ZmToolBar.prototype._addItem =
function(type, element, index) {
	DwtToolBar.prototype._addItem.apply(this, arguments);
	this.adjustSize();
};

ZmToolBar.prototype._removeItem =
function(type, element, index) {
	DwtToolBar.prototype._removeItem.apply(this, arguments);
	this.adjustSize();
};
