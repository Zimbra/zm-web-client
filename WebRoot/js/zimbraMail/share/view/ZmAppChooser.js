/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2005, 2006, 2007, 2008, 2009, 2010 Zimbra, Inc.
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
 * 
 * This file defines the zimbra application chooser.
 *
 */

/**
 * @class
 * This class represents a zimbra application chooser. The chooser is the "tab application" toolbar shown
 * in the Zimbra Web Client. The toolbar buttons are represented as "tabs".
 * 
 * @param	{Hash}	params		a hash of parameters
 * 
 * @extends	ZmToolBar
 */
ZmAppChooser = function(params) {

	params.className = params.className || "ZmAppChooser";
	params.width = appCtxt.getSkinHint("appChooser", "fullWidth") ? "100%" : null;

	ZmToolBar.call(this, params);

    Dwt.setLocation(this.getHtmlElement(), Dwt.LOC_NOWHERE, Dwt.LOC_NOWHERE);

	this.setScrollStyle(Dwt.CLIP);

	this._buttonListener = new AjxListener(this, this._handleButton);

	var buttons = params.buttons;
	for (var i = 0; i < buttons.length; i++) {
		var id = buttons[i];
		if (id == ZmAppChooser.SPACER) {
			this.addSpacer(ZmAppChooser.SPACER_HEIGHT);
		} else {
			this._createButton(id);
		}
	}

	this._createPrecedenceList();
	this._inited = true;
};

ZmAppChooser.prototype = new ZmToolBar;
ZmAppChooser.prototype.constructor = ZmAppChooser;

/**
 * Returns a string representation of the object.
 * 
 * @return		{String}		a string representation of the object
 */
ZmAppChooser.prototype.toString =
function() {
	return "ZmAppChooser";
};

//
// Constants
//

ZmAppChooser.SPACER								= "spacer";
ZmAppChooser.B_HELP								= "Help";
ZmAppChooser.B_LOGOUT							= "Logout";

ZmApp.CHOOSER_SORT[ZmAppChooser.SPACER]			= 160;
ZmApp.CHOOSER_SORT[ZmAppChooser.B_HELP]			= 170;
ZmApp.CHOOSER_SORT[ZmAppChooser.B_LOGOUT]		= 190;

// hard code help/logout since they are not real "apps"
ZmApp.ICON[ZmAppChooser.B_HELP]					= "Help";
ZmApp.ICON[ZmAppChooser.B_LOGOUT]				= "Logoff";
ZmApp.CHOOSER_TOOLTIP[ZmAppChooser.B_HELP]		= "goToHelp";
ZmApp.CHOOSER_TOOLTIP[ZmAppChooser.B_LOGOUT]	= "logOff";

ZmAppChooser.SPACER_HEIGHT = 10;

//
// Data
//

ZmAppChooser.prototype.TEMPLATE = "share.Widgets#ZmAppChooser";
ZmAppChooser.prototype.ITEM_TEMPLATE = "share.Widgets#ZmAppChooserItem";
ZmAppChooser.prototype.SPACER_TEMPLATE = "dwt.Widgets#ZmAppChooserSpacer";

//
// Public methods
//
/**
 * Adds a selection listener.
 * 
 * @param	{AjxListener}	listener	the listener
 */
ZmAppChooser.prototype.addSelectionListener =
function(listener) {
	this.addListener(DwtEvent.SELECTION, listener);
};

/**
 * Adds a button to the toolbar.
 * 
 * @param	{String}	id		the button id
 * @param	{Hash}		params		a hash of parameters
 * @param	{String}	params.text			the text
 * @param	{String}	params.image		the image
 * @param	{int}	params.index		the index
 * @param	{String}	params.tooltip		the tool top
 * @param	{String}	params.textPrecedence	the image precedence
 * @param	{String}	params.imagePrecedence		the image precedence
 * 
 * @return	{ZmAppButton}		the newly created button
 */
ZmAppChooser.prototype.addButton =
function(id, params) {

	var buttonParams = {parent:this, id:ZmId.getButtonId(ZmId.APP, id), text:params.text,
						image:params.image, index:params.index};
    buttonParams.style = params.style ? params.style : DwtLabel.IMAGE_LEFT;
    var button = new ZmAppButton(buttonParams);
	button.setToolTipContent(params.tooltip);
	button.textPrecedence = params.textPrecedence;
	button.imagePrecedence = params.imagePrecedence;
	button.setData(Dwt.KEY_ID, id);
	button.addSelectionListener(this._buttonListener);
	this._buttons[id] = button;

	if (button.textPrecedence || button.imagePrecedence) {
		this._createPrecedenceList();
	}
	this.adjustSize();

	return button;
};

/**
 * Removes a button.
 * 
 * @param	{String}	id		the id of the button to remove
 */
ZmAppChooser.prototype.removeButton =
function(id) {
	var button = this._buttons[id];
	if (button) {
		var index = this.__getButtonIndex(id);
		button.dispose();
		this._buttons[id] = null;
		delete this._buttons[id];
		if (index != null) {
			this._removeItem(this._items[index]);
		}
	}
};

/**
 * Replaces a button.
 * 
 * @param	{String}	oldId		the old button id
 * @param	{String}	newId		the new button id
 * @param	{Hash}		params		a hash of parameters
 * @param	{String}	params.text		the text
 * @param	{String}	params.image	the image
 * @param	{int}	params.index		the index
 * @param	{String}	params.tooltip			the tool tip
 * @param	{String}	params.textPrecedence	the text display precedence
 * @param	{String}	params.imagePrecedence	the image display precedence
 * 
 * @return	{ZmAppButton}		the newly created button
 */
ZmAppChooser.prototype.replaceButton =
function(oldId, newId, params) {
	if (!this._buttons[oldId]) { return; }
	params.index = this.__getButtonIndex(oldId);
	this.removeButton(oldId);
	return this.addButton(newId, params);
};

ZmAppChooser.prototype.getButton =
function(id) {
	return this._buttons[id];
};

/**
 * Sets the specified button as selected.
 * 
 * @param	{String}	id		the button id
 */
ZmAppChooser.prototype.setSelected =
function(id) {
	var oldBtn = this._buttons[this._selectedId];
	if (this._selectedId && oldBtn) {
        this.__markPrevNext(this._selectedId, false);
		oldBtn.setSelected(false);
		oldBtn._noFocus = false;
    }

	var newBtn = this._buttons[id];
	if (newBtn) {
		newBtn.setSelected(true);

		if (newBtn._toggleText != null && newBtn._toggleText != "") {
			// hide text for previously selected button first
			if (oldBtn) {
				oldBtn._toggleText = (oldBtn._toggleText != null && oldBtn._toggleText != "")
					? oldBtn._toggleText : oldBtn.getText();
				oldBtn.setText("");
			}

			// reset original text for  newly selected button
			newBtn.setText(newBtn._toggleText);
			newBtn._toggleText = null;
		}

		newBtn._noFocus = true;
	}

	this._selectedId = id;
};

/**
 * @private
 */
ZmAppChooser.prototype._createButton =
function(id) {
	this.addButton(id, {text:ZmMsg[ZmApp.NAME[id]] || ZmApp.NAME[id], image:ZmApp.ICON[id], tooltip:ZmMsg[ZmApp.CHOOSER_TOOLTIP[id]],
						textPrecedence:ZmApp.TEXT_PRECEDENCE[id], imagePrecedence:ZmApp.IMAGE_PRECEDENCE[id]});
};

/**
 * @private
 */
ZmAppChooser.prototype._handleButton =
function(evt) {
	this.notifyListeners(DwtEvent.SELECTION, evt);
};
