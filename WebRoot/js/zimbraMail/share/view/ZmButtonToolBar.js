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
 * @param	{Array}	params.secondaryButtons		a list of operation IDs
 * @param	{Array}	params.rightSideButtons		a list of operation IDs
 * @param	{constant}	params.context			the vcontextID (used to generate button IDs)
 * @param	{constant}	params.toolbarType		the toolbar type (used to generate button IDs)
 * @param	{Boolean}	params.addTextElement		if true, add a text "button" (element) at the end (but before the view button, if any). This can be used for message counts etc
 * @param	{ZmController}	params.controller		the owning controller
 *
 * @extends		ZmToolBar
 */
ZmButtonToolBar = function(params) {
	if (arguments.length == 0) return;

	if (!params.className && (params.controller && params.controller._elementsToHide == ZmAppViewMgr.LEFT_NAV)) {
		params.className = "ZToolbar itemToolbar";
	}
    params.className = params.className || "ZToolbar";
    params.id = params.context ? ZmId.getToolbarId(params.context, params.toolbarType) : null;
    ZmToolBar.call(this, params);
	
	this._context = params.context;
	this._toolbarType = params.toolbarType;
	this._buttonStyle = params.buttonClassName;

	// standard buttons default to New/Tag/Print/Delete
	var buttonOps = params.buttons;
	if (!buttonOps) {
		buttonOps = [ZmOperation.NEW_MENU, ZmOperation.TAG_MENU, ZmOperation.PRINT, ZmOperation.DELETE];
	} else if (buttonOps == ZmOperation.NONE) {
		buttonOps = null;
	}
	// weed out disabled ops, save list of ones that make it
	/**
	 * The operation list property.
	 * @type Array
	 */
	this.opList = ZmOperation.filterOperations(buttonOps);

	this._zimletButtonLocation = this.opList.length;

	var secondaryOpList = ZmOperation.filterOperations(params.secondaryButtons);

	if (secondaryOpList && secondaryOpList.length) {
		this.opList.push(ZmOperation.SEP, ZmOperation.ACTIONS_MENU);
	}

	var rightSideOpList = ZmOperation.filterOperations(params.rightSideButtons);

	if (rightSideOpList.length > 0 || params.addTextElement) {
		this.opList.push(ZmOperation.FILLER);
	}
	
	if (params.addTextElement) {
		this.opList.push(ZmOperation.TEXT);
	}

	if (rightSideOpList.length > 0) {
		this.opList = this.opList.concat(rightSideOpList);
	}

	this._buttons = ZmOperation.createOperations(this, this.opList, params.overrides);

	if (secondaryOpList && secondaryOpList.length) {
		var actionsButton =  this._secondaryButton = this.getButton(ZmOperation.ACTIONS_MENU);

		actionsButton.noMenuBar = true;

		var secondaryMenu = this._secondaryButtonMenu = new ZmActionMenu({parent: actionsButton, menuItems: ZmOperation.NONE, context: this._context, controller: params.controller});
		var secondaryButtons  = ZmOperation.createOperations(secondaryMenu, secondaryOpList, params.overrides);
		actionsButton.setMenu(secondaryMenu);

		//add secondary buttons to buttons list as I believe from now on it shouldn't matter if they are primary or under the secondary "actions" menu.
		//that way we don't need to operate on 2 different collections when enabling/disabling, adding listeners, etc.
		//var secondaryButtons = secondaryMenu._menuItems;
		for (var id in secondaryButtons) {
			this._buttons[id] = secondaryButtons[id];
		}
		//same as buttons, with opList.
		this.opList = this.opList.concat(secondaryOpList);

	}

	//todo - I guess in the new UI a button (primary) will have either text or image. not both. Think of whether this precedence is still required then.
	this._createPrecedenceList(); //this is only done to the primary, not the secondary buttons (since the secondary are in a drop-down so removing one's image or text won't make sense.)
	
	this._inited = true;
};

ZmButtonToolBar.prototype = new ZmToolBar;
ZmButtonToolBar.prototype.constructor = ZmButtonToolBar;

ZmButtonToolBar.prototype.isZmButtonToolBar = true;
ZmButtonToolBar.prototype.toString = function() { return "ZmButtonToolBar"; };


// Public methods


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
 * @param {Boolean}	params.showImageInToolbar	if <code>true</code>, the button should show image (default is false)
 * @param {Boolean}	params.showTextInToolbar	if <code>true</code>, the button should show text (default is !params.showImageInToolbar)
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
		params.textClassName = params.textClassName || "DwtText ZWidgetTitle";
		b = new DwtText({parent:this, className:params.textClassName, id:id});
	} else {
		params.id = params.domId || (this._context ? ZmId.getButtonId(this._context, id, this._toolbarType) : null);
		params.textPrecedence = ZmOperation.getProp(id, "textPrecedence");
		params.iconPrecedence = ZmOperation.getProp(id, "iconPrecedence");
		var showImage = params.showImageInToolbar || false; //default to false;
		var showText = !showImage || params.showTextInToolbar;
		showImage = showImage || !params.text; //no text? gotta show image
		showText = showText || !params.image; //no image? gotta show text
		params.image = showImage && params.image;
		params.whatToShow = {showImage: showImage, showText: showText}
		b = this.createButton(id, params);
	}
	b.setData(ZmOperation.KEY_ID, id);

	return b;
};

/**
 * Creates a zimlet button and adds its operation ID as data. This method selects the best location for the zimlet, so zimlets don't have to do it and it's consistent.
 *
 * for parameters see createOp
 */
ZmButtonToolBar.prototype.createZimletOp =
function(id, params) {
	params.index = this._zimletButtonLocation;
	return this.createOp(id, params);
};


/**
 * Adds the operation.
 * 
 * @param	{String}	id		the id
 * @param	{int}		index	the index
 */
ZmButtonToolBar.prototype.addOp =
function(id, index) {
	if(this.getOp(id)) {
		return;
	}
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

/**
 * gets the secondary menu (the "Actions" menu in the toolbar)
 */
ZmButtonToolBar.prototype.getActionsMenu =
function() {
	return this._secondaryButtonMenu;
};

/**
 * gets the secondary button (the "Actions" button in the toolbar)
 */
ZmButtonToolBar.prototype.getActionsButton =
function() {
	return this._secondaryButton;
};


//
// Private methods
//

// Returns the ID for the given button.
ZmButtonToolBar.prototype._buttonId =
function(button) {
	return button.getData(ZmOperation.KEY_ID);
};
