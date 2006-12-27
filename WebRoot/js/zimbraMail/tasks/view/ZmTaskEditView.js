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
 * Portions created by Zimbra are Copyright (C) 2004, 2005, 2006 Zimbra, Inc.
 * All Rights Reserved.
 *
 * Contributor(s):
 *
 * ***** END LICENSE BLOCK *****
 */

function ZmTaskEditView(parent, appCtxt, controller, isReadOnly) {

	if (arguments.length == 0) return;

	DwtComposite.call(this, parent, "ZmTaskEditView", DwtControl.ABSOLUTE_STYLE);

	this._appCtxt = appCtxt;
	this._controller = controller;

	this._tagList = this._appCtxt.getTree(ZmOrganizer.TAG);
	this._tagList.addChangeListener(new AjxListener(this, this._tagChangeListener));

	// read only flag is mainly used for printing a single contact
	this._isReadOnly = isReadOnly;
	if (!isReadOnly)
		this._changeListener = new AjxListener(this, this._contactChangeListener);
};

ZmTaskEditView.prototype = new DwtComposite;
ZmTaskEditView.prototype.constructor = ZmTaskEditView;


// Public Methods

ZmTaskEditView.prototype.toString =
function() {
	return "ZmTaskEditView";
};

ZmTaskEditView.prototype.set =
function(task) {
	this.getHtmlElement().innerHTML = "TODO";
};

ZmTaskEditView.prototype.isValid =
function() {
	// TODO
};

ZmTaskEditView.prototype.cleanup =
function() {
	// TODO
};

ZmTaskEditView.prototype.enableInputs =
function() {
	// TODO
};

ZmTaskEditView.prototype.getController =
function() {
	return this._controller;
};

// Following two overrides are a hack to allow this view to pretend it's a list view
ZmTaskEditView.prototype.getSelection =
function() {
	return this._task;
};

ZmTaskEditView.prototype.getSelectionCount =
function() {
	return 1;
};

ZmTaskEditView.prototype.getTitle =
function() {
	return [ZmMsg.zimbraTitle, ZmMsg.task].join(": ");
};


// Private/protected Methods

ZmTaskEditView.prototype._getDefaultFocusItem =
function() {
	// TODO
};


// Static Methods

ZmTaskEditView.getPrintHtml =
function(task, appCtxt) {
	// TODO
};
