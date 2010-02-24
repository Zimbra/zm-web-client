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
 */

/**
 * Creates a generic quick add dialog (which basically mean it has different 
 * than regular dialogs). Dialogs always hang off the main shell since their stacking order
 * is managed through z-index. See "dwt.Widgets#DwtSemiModalDialog" template.
 * @class
 * This class represents a modal dialog which has at least a title and the 
 * standard buttons (OK/Cancel) and widgets (i.e. buttons, etc) as necessary.
 * 
 * @author Parag Shah
 * 
 * @param {DwtComposite}	parent				the parent widget (the shell)
 * @param {String}	title				a title for the dialog
 * @param {Array}	standardButtons		a list of standard button IDs (default is [{@link DwtDialog.OK_BUTTON}, {@link DwtDialog.CANCEL_BUTTON}])
 * @param {Array}	extraButtons 		any extra buttons to be added in addition to the standard ones
 * @param {Object}	loc				where to popup (optional)
 * 
 * @extends		DwtDialog
 */
ZmQuickAddDialog = function(parent, title, standardButtons, extraButtons, loc) {
	if (arguments.length == 0) return;

	DwtDialog.call(this, {parent:parent, title:title, standardButtons:standardButtons,
						  extraButtons:extraButtons, loc:loc});
};

ZmQuickAddDialog.prototype = new DwtDialog;
ZmQuickAddDialog.prototype.constructor = ZmQuickAddDialog;

ZmQuickAddDialog.prototype.toString =
function() {
	return "ZmQuickAddDialog";
};

//
// Data
//

ZmQuickAddDialog.prototype.TEMPLATE = "dwt.Widgets#DwtSemiModalDialog";

//
// Public methods
//

/**
 * Adds a selection listener.
 * 
 * @param	{String}		buttonId		the button id
 * @param	{AjxListener}	listener		the listener
 */
ZmQuickAddDialog.prototype.addSelectionListener = 
function(buttonId, listener) {
	this._button[buttonId].addSelectionListener(listener);
};
