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
 */
ZmToolBar = function(params) {
	if (arguments.length == 0) return;

	params.posStyle = params.posStyle || DwtControl.ABSOLUTE_STYLE;
	DwtToolBar.call(this, params);
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
 * @param id			[string]		button ID
 * @param text			[string]*		button text
 * @param tooltip		[string]*		button tooltip text
 * @param image			[string]*		icon class for the button
 * @param disImage		[string]*		disabled version of icon
 * @param enabled		[boolean]*		if true, button is enabled
 * @param className		[constant]*		CSS class name
 * @param style			[constant]*		button style
 * @param index			[int]*			position at which to add the button
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
		b.setToolTipContent(params.tooltip);
	}
	b.setEnabled(params.enabled !== false);
	b.setData("_buttonId", id);

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
    return new DwtToolBarButton({parent:this, style:params.style, className:className, index:params.index, id:params.id});
};

ZmToolBar.prototype._buttonId =
function(button) {
	return button.getData("_buttonId");
};

ZmToolBar.prototype.autoAdjustWidth =
function(refElement, reset) {
	var el = this.getHtmlElement();
	if (!el || !refElement) { return; }

	var offset1 = refElement.offsetWidth;
	var offset2 = el.firstChild ? el.firstChild.offsetWidth : offset1;

	if ((offset1 > 0 && offset2 > offset1) || reset) {
		for (var i in this._buttons) {
			var b = this._buttons[i];
			if (!b.getImage() || !b.getVisible()) { continue; }

			if (offset2 > offset1) {
				b._toggleText = (b._toggleText != null && b._toggleText != "")
					? b._toggleText : b.getText();
				b.setText("");
			}
			else if (b._toggleText) {
				b.setText(b._toggleText);
				// after adding back label, check if its bigger then avail space
				if (el.firstChild && el.firstChild.offsetWidth > offset1) {
					b.setText("");	// Nope. Back it out!
					break;			// And bail. Chances are subsequent labels won't fit either
				}
				b._toggleText = null;
			}

			// re-calc firstChild offset since we may have removed its label
			offset2 = el.firstChild ? el.firstChild.offsetWidth : offset1;
		}
	}
};