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
 * This file contains the zimlet class.
 */

/**
 * Creates the zimlet
 * @class
 * This class represents a zimlet.
 * 
 * @param	{String}	id		the id
 * @param	{String}	name	the name
 * @param	{Object}	parent	the parent
 * @param	{ZmTree}	tree	the tree
 * @param	{String}	color	the color
 * @extends		ZmOrganizer
 */
ZmZimlet = function(id, name, parent, tree, color) {
	ZmOrganizer.call(this, {type: ZmOrganizer.ZIMLET, id: id, name: name, parent: parent, tree: tree});
};

ZmZimlet.prototype = new ZmOrganizer();
ZmZimlet.prototype.constructor = ZmZimlet;

// test hack 
ZmZimlet.actionMenus = {};
ZmZimlet.actionMenus["ZmCalViewController"] = [];
ZmZimlet.listeners = {};
ZmZimlet.listeners["ZmCalViewController"] = {};

// Constants
ZmZimlet.ID_ZIMLET = ZmOrganizer.ID_ZIMLET;
ZmZimlet.ID_ZIMLET_ROOT = ZmZimlet.ID_ZIMLET + "_root";

/**
 * Returns a string representation of the object.
 * 
 * @return		{String}		a string representation of the object
 */
ZmZimlet.prototype.toString =
function() {
	return "ZmZimlet - " + this.name;
};

/**
 * Sets the name
 * 
 * @param	{String}	name		the name
 */
ZmZimlet.prototype.setName =
function(name) {
	this.name = name;
};

// Static methods
/**
 * @private
 */
ZmZimlet.createFromJs =
function(parent, obj, tree, link) {
	if (!obj && obj.length < 1) {return null;}

	// create zimlet root
	var zimletRoot = new ZmZimlet(ZmZimlet.ID_ZIMLET_ROOT, ZmMsg.zimlets, parent, tree, null, null);
	if (obj && obj.length) {
		var id = ZmZimlet.ID_ZIMLET;
		for (var i = 0; i < obj.length; i++) {
			var lbl = obj[i].processMessage(obj[i].zimletPanelItem.label);
			// bug fix #23860 - unique-ify zimlet ID's so they dont conflict!
			var zimletId = (++id) + "_z";
			var childZimlet = new ZmZimlet(zimletId, lbl, zimletRoot, tree, null, null);
			zimletRoot.children.add(childZimlet);
			// WARNING: it's a bit unorthodox to do this linkage
			// here, but we really do need these objects know about
			// each other.
			childZimlet._zimletContext = obj[i];
			childZimlet._zimletContext._id = zimletId;
			childZimlet._toolTip = obj[i].zimletPanelItem.toolTipText;
			obj[i]._organizer = childZimlet;
		}
	}
	return zimletRoot;
};

/**
 * Compares and sorts the zimlets by name (case-insensitive).
 * 
 * @param	{ZmZimlet}	zimletA		the zimlet
 * @param	{ZmZimlet}	zimletB		the zimlet
 * @return	{int}	0 if the zimlets match; 1 if "a" is before "b"; -1 if "b" is before "a"
 */
ZmZimlet.sortCompare =
function(zimletA, zimletB) {
	var check = ZmOrganizer.checkSortArgs(zimletA, zimletB);
	if (!check) {return check;}

	// sort by name
	var zimletAName = zimletA.name.toLowerCase();
	var zimletBName = zimletB.name.toLowerCase();
	if (zimletAName < zimletBName) {return -1;}
	if (zimletAName > zimletBName) {return 1;}
	return 0;
};

/**
 * Checks the name.
 * 
 * @param	{String}	name		the name
 * @return	{String}	the name
 * @see		ZmOrganizer.checkName()
 */
ZmZimlet.checkName =
function(name) {
	return ZmOrganizer.checkName(name);
};

// Public methods
/**
 * Resets the names.
 * 
 */
ZmZimlet.prototype.resetNames =
function() {
	var oldName = this.name;
	var oldToolTip = this._toolTip;
	if(this._zimletContext && this._toolTip) {
		this._toolTip = this._zimletContext.processMessage(this._toolTip);
	}
	if(this._zimletContext && this.name) {
		this.name = this._zimletContext.processMessage(this.name);
	}
	// Update only if there was a change
	if((oldName != this.name) || (oldToolTip != this._toolTip)) {
		var fields = {};
		fields[ZmOrganizer.F_NAME] = true;
		var details = {};
		details.fields = fields;
		this._notify(ZmEvent.E_MODIFY, details);
	}
};

/**
 * Sets the tool tip text on the control.
 * 
 * @param	{DwtControl}	control		the control
 */
ZmZimlet.prototype.setToolTipText =
function(control) {
	control.setToolTipContent(this._toolTip);
};

/**
 * Gets the icon.
 * 
 * @return	{String}	the icon
 */
ZmZimlet.prototype.getIcon =
function() {
	return (this.id == ZmZimlet.ID_ZIMLET_ROOT) ? null : this._zimletContext.icon;
};

/**
 * Gets the zimlet context.
 * 
 * @return	{ZmZimletContext}	the context
 */
ZmZimlet.prototype.getZimletContext =
function() {
	return this._zimletContext;
};

/**
 * Checks if the tag supports sharing.
 * 
 * @return	{Boolean}	always returns <code>false</code>. Zimlets cannot be shared.
 */
ZmZimlet.prototype.supportsSharing =
function() {
	// zimlets cannot be shared
	return false;
};
