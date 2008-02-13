/*
 * ***** BEGIN LICENSE BLOCK *****
 * 
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2005, 2006, 2007 Zimbra, Inc.
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
* Creates a generic quick add dialog (which basically mean it has different 
* than regular dialogs). See "DwtSemiModalDialog" in Ajax widgets templates
* for cosmetics.
* @constructor
* @class
* This class represents a modal dialog which has at least a title and the 
* standard buttons (OK/Cancel).
* widgets (i.e. buttons, etc) as necessary.
* <p>
* Dialogs always hang off the main shell since their stacking order is managed 
* through z-index.
*
* @author Parag Shah
* @param parent				parent widget (the shell)
* @param title				a title for the dialog
* @param standardButtons	a list of standard button IDs (OK/Cancel is default)
* @param extraButtons 		any extra buttons to be added in addition to the standard ones
* @param loc				where to popup (optional)
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

ZmQuickAddDialog.prototype.addSelectionListener = 
function(buttonId, listener) {
	this._button[buttonId].addSelectionListener(listener);
};
