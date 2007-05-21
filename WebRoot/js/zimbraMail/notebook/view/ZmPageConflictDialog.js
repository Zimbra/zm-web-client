/*
 * ***** BEGIN LICENSE BLOCK *****
 * Version: ZPL 1.2
 *
 * The contents of this file are subject to the Zimbra Public License
 * Version 1.2 ("License"); you may not use this file except in
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
 * Portions created by Zimbra are Copyright (C) 2006 Zimbra, Inc.
 * All Rights Reserved.
 *
 * Contributor(s):
 *
 * ***** END LICENSE BLOCK *****
 */

ZmPageConflictDialog = function(appCtxt, shell, className) {
	className = className || "ZmPageConflictDialog";
	var title = ZmMsg.saveConflict;
	var standardButtons = [ DwtDialog.CANCEL_BUTTON ];
	DwtDialog.call(this, shell, className, title, standardButtons);
	this._appCtxt = appCtxt;

	this._createContentHtml();
}
ZmPageConflictDialog.prototype = new DwtDialog;
ZmPageConflictDialog.prototype.constructor = ZmPageConflictDialog;

ZmPageConflictDialog.prototype.toString = function() {
	return "ZmPageConflictDialog";
};

// Constants

ZmPageConflictDialog.KEEP_MINE = "mine";
ZmPageConflictDialog.KEEP_THEIRS = "theirs";

// Data

ZmPageConflictDialog.prototype._conflict;
ZmPageConflictDialog.prototype._conflictCallback;

ZmPageConflictDialog.prototype._viewTheirsCallback;
ZmPageConflictDialog.prototype._keepMineCallback;
ZmPageConflictDialog.prototype._keepTheirsCallback;

// Public methods

ZmPageConflictDialog.prototype.popup = function(conflict, callback, loc) {
	// save data
	this._conflict = conflict;
	this._conflictCallback = callback;

	// setup controls
	if (!this._formatter) {
		this._formatter = new AjxMessageFormat(ZmMsg.saveConflictDesc);
	}
	this._messageDiv.innerHTML = this._formatter.format(conflict.page.name);

	// show
	DwtDialog.prototype.popup.call(this, loc);
};

ZmPageConflictDialog.prototype.popdown = function() {
	ZmDialog.prototype.popdown.call(this);
	this._conflict = null;
	this._conflictCallback = null;
};

// Protected methods

ZmPageConflictDialog.prototype._viewTheirsListener = function(event) {
	var winurl = this._conflict.page.getRestUrl();
	var winname = "_new";
	var winfeatures = [
		"width=",(window.outerWidth || 640),",",
		"height=",(window.outerHeight || 480),",",
		"location,menubar,",
		"resizable,scrollbars,status,toolbar"
	].join("");

	var win = open(winurl, winname, winfeatures);
};

ZmPageConflictDialog.prototype._keepMineListener = function(event) {
	var conflict = this._conflict;
	var callback = this._conflictCallback;
	this.popdown();
	if (callback) {
		callback.run(ZmPageConflictDialog.KEEP_MINE, conflict);
	}
};

ZmPageConflictDialog.prototype._keepTheirsListener = function(event) {
	var conflict = this._conflict;
	var callback = this._conflictCallback;
	this.popdown();
	if (callback) {
		callback.run(ZmPageConflictDialog.KEEP_THEIRS, conflict);
	}
};

// view creation

ZmPageConflictDialog.prototype._createContentHtml = function() {
	var viewTheirs = new DwtButton(this);
	var keepMine = new DwtButton(this);
	var keepTheirs = new DwtButton(this);

	viewTheirs.setText(ZmMsg.saveConflictViewTheirs);
	keepMine.setText(ZmMsg.saveConflictKeepMine);
	keepTheirs.setText(ZmMsg.saveConflictKeepTheirs);

	viewTheirs.addSelectionListener(new AjxListener(this, this._viewTheirsListener));
	keepMine.addSelectionListener(new AjxListener(this, this._keepMineListener));
	keepTheirs.addSelectionListener(new AjxListener(this, this._keepTheirsListener));

	var msgDiv = this._messageDiv = document.createElement("DIV");
	msgDiv.style.marginBottom = ".5em";

	var table = document.createElement("TABLE");
	table.border = 0;
	table.cellPadding = 4;
	table.cellSpacing = 0;

	var row = table.insertRow(-1);
	var cell = row.insertCell(-1);
	cell.appendChild(viewTheirs.getHtmlElement());
	var cell = row.insertCell(-1);
	cell.innerHTML = ZmMsg.saveConflictViewTheirsDesc;

	var row = table.insertRow(-1);
	var cell = row.insertCell(-1);
	cell.appendChild(keepMine.getHtmlElement());
	var cell = row.insertCell(-1);
	cell.innerHTML = ZmMsg.saveConflictKeepMineDesc;

	var row = table.insertRow(-1);
	var cell = row.insertCell(-1);
	cell.appendChild(keepTheirs.getHtmlElement());
	var cell = row.insertCell(-1);
	cell.innerHTML = ZmMsg.saveConflictKeepTheirsDesc;

	var element = this._getContentDiv();
	element.appendChild(msgDiv);
	element.appendChild(table);
};
