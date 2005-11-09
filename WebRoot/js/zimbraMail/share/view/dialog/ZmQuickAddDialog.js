/*
 * ***** BEGIN LICENSE BLOCK *****
 * Version: ZAPL 1.1
 * 
 * The contents of this file are subject to the Zimbra AJAX Public
 * License Version 1.1 ("License"); you may not use this file except in
 * compliance with the License. You may obtain a copy of the License at
 * http://www.zimbra.com/license
 * 
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied. See
 * the License for the specific language governing rights and limitations
 * under the License.
 * 
 * The Original Code is: Zimbra Collaboration Suite Web Client
 * 
 * The Initial Developer of the Original Code is Zimbra, Inc.
 * Portions created by Zimbra are Copyright (C) 2005 Zimbra, Inc.
 * All Rights Reserved.
 * 
 * Contributor(s):
 * 
 * ***** END LICENSE BLOCK *****
 */

/**
* Creates a generic quick add dialog (which basically mean it has different 
* than regular dialogs). See "SemiModalDialog" in DwtBorder for cosmetics.
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
function ZmQuickAddDialog(parent, title, standardButtons, extraButtons, loc) {
	if (arguments.length == 0) return;

	DwtDialog.call(this, parent, null, title, standardButtons, extraButtons, null, null, loc);
};

ZmQuickAddDialog.prototype = new DwtDialog;
ZmQuickAddDialog.prototype.constructor = ZmQuickAddDialog;


// Public

ZmQuickAddDialog.prototype.toString = 
function() {
	return "ZmQuickAddDialog";
};

ZmQuickAddDialog.prototype.setContent =
function(text) {
	this._contentDiv.innerHTML = text;
};

ZmQuickAddDialog.prototype.setTitle =
function(title) {
	this._titleCell.innerHTML = title;
};

ZmQuickAddDialog.prototype.addSelectionListener = 
function(buttonId, listener) {
	this._button[buttonId].addSelectionListener(listener);
};


// Private / protected methods
ZmQuickAddDialog.prototype._createHtml =
function() {
	this._contentId = Dwt.getNextId();
	this._titleId = Dwt.getNextId();

	var html = new Array();
	var idx = 0;

	html[idx++] = DwtBorder.getBorderStartHtml("SemiModalDialog", {id:this._titleId});
	html[idx++] = this._getContentHtml();
	html[idx++] = DwtBorder.getBorderEndHtml("SemiModalDialog");

	this.getHtmlElement().innerHTML = html.join("");

	var doc = this.getDocument();
	this._contentDiv = Dwt.getDomObj(doc, this._contentId);
	this._titleCellId = this._titleId + "_title";
};
