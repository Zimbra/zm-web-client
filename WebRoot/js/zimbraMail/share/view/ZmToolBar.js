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
* @param parent			[DwtComposite]		the containing widget
* @param className		[string]*			CSS class
* @param posStyle		[constant]*			positioning style
*/
ZmToolBar = function(parent, className, posStyle) {
	if (arguments.length == 0) return;

	DwtToolBar.call(this, parent, className, (posStyle || DwtControl.ABSOLUTE_STYLE));
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
    return new DwtToolBarButton({parent:this, style:params.style, className:className, index:params.index});
};

ZmToolBar.prototype._buttonId =
function(button) {
	return button.getData("_buttonId");
};

ZmToolBar.prototype.autoAdjustWidth =
function(refElement) {
	if (!refElement) { return; }
    var el = this.getHtmlElement();
	if (!el) { return; }
    var off1 = refElement.offsetWidth;
    var off2 = el.firstChild ? el.firstChild.offsetWidth : offset1;
    if(off2 > off1) {
        for (var i in this._buttons) {
            var offset1 = refElement.offsetWidth;
            var offset2 = el.firstChild ? el.firstChild.offsetWidth : offset1;
            if (this._buttons[i].getImage() != null ) {
                if (offset2 > offset1){
                    this._buttons[i]._toggleText = (this._buttons[i]._toggleText != null && this._buttons[i]._toggleText != "") ? this._buttons[i]._toggleText : this._buttons[i].getText();
                    this._buttons[i].setText("");
                }
                else if(this._buttons[i]._toggleText) {
                    this._buttons[i].setText(this._buttons[i]._toggleText);
                    this._buttons[i]._toggleText = null;
                }
            }
        }
    } 
};