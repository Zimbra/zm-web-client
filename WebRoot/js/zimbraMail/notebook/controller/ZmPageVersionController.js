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

ZmPageVersionController = function(container, app) {
	if (arguments.length == 0) return;
	ZmNotebookPageController.call(this, container, app);
	
	this._listeners[ZmOperation.REVERT_PAGE] = new AjxListener(this, this._pageRevertListener);
}

ZmPageVersionController.prototype = new ZmNotebookPageController;
ZmPageVersionController.prototype.constructor = ZmPageVersionController;

ZmPageVersionController.prototype.toString = function() {
	return "ZmPageVersionController";
};

ZmPageVersionController.prototype.loadVersion = 
function(page) {
	var elements;
	this._object = page;
	this._page = page;
	if (!this._currentView) {
		this._currentView = this._defaultView();
		this._setup(this._currentView);

		elements = new Object();
		elements[ZmAppViewMgr.C_TOOLBAR_TOP] = this._toolbar[this._currentView];
		elements[ZmAppViewMgr.C_APP_CONTENT] = this._listView[this._currentView];
	}
	this._resetOperations(this._toolbar[this._currentView], 1); // enable all buttons
	this._setView(this._currentView, elements, false, false, false, true);	
};

ZmPageVersionController.prototype._defaultView =
function() {
	return ZmController.NOTEBOOK_PAGE_VERSION_VIEW;
};

// Data

ZmPageVersionController.prototype._getToolBarOps =
function() {
	var list = [];
	list.push(
		ZmOperation.REVERT_PAGE, ZmOperation.CLOSE
	);

	return list;
};

ZmPageVersionController.prototype._resetOperations =
function(toolbarOrActionMenu, num) {
	if (!toolbarOrActionMenu) return;
	ZmNotebookController.prototype._resetOperations.call(this, toolbarOrActionMenu, num);
};

ZmPageVersionController.prototype._createNewView =
function(view) {
	if (!this._pageVersionView) {
		this._pageVersionView = new ZmPageVersionView(this._container, this);
	}
	return this._pageVersionView;
};

ZmPageVersionController.prototype._setView =
function(view, elements, isAppView, clear, pushOnly, isTransient) {
	ZmListController.prototype._setView.apply(this, arguments);
};

ZmPageVersionController.prototype._setViewContents =
function(view) {
	this._listView[view].set(this._object);
};

ZmPageVersionController.prototype._initializeToolBar =
function(view) {
	if (this._toolbar[view]) return;
	
	ZmNotebookController.prototype._initializeToolBar.call(this, view);
	this._setNewButtonProps(view, ZmMsg.createNewPage, "NewPage", "NewPageDis", ZmOperation.NEW_PAGE);	
};

ZmPageVersionController.prototype._pageRevertListener = 
function(event) {
	AjxDispatcher.run("GetPageEditController").show(this._object);
};

ZmPageVersionController.prototype.enableRevertButton =
function(enable){
	if(this._toolbar[this._currentView]) {
		this._toolbar[this._currentView].enable([ZmOperation.REVERT_PAGE],enable);
	}
};