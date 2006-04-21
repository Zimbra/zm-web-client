/*
 * ***** BEGIN LICENSE BLOCK *****
 * Version: ZPL 1.1
 * 
 * The contents of this file are subject to the Zimbra Public License
 * Version 1.1 ("License"); you may not use this file except in
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

function ZmNotebookApp(appCtxt, container, parentController) {
	ZmApp.call(this, ZmZimbraMail.NOTEBOOK_APP, appCtxt, container, parentController);
	this._controllers = {};
	this._noteCache = new ZmNotebookCache(appCtxt);
}

ZmNotebookApp.prototype = new ZmApp;
ZmNotebookApp.prototype.constructor = ZmNotebookApp;

ZmNotebookApp.prototype.toString = 
function() {
	return "ZmNotebookApp";
}

// Constants

ZmNotebookApp.NOTEBOOK = "notebook";
ZmNotebookApp.PAGE_EDIT = "page_edit";

ZmNotebookApp.__CONTROLLERS = {};
ZmNotebookApp.__CONTROLLERS[ZmNotebookApp.NOTEBOOK] = ZmNotebookController;
ZmNotebookApp.__CONTROLLERS[ZmNotebookApp.PAGE_EDIT] = ZmPageEditController;

// Data

ZmNotebookApp.prototype._controllers;
ZmNotebookApp.prototype._noteCache;

// Public methods

ZmNotebookApp.prototype.launch =
function(callback, errorCallback) {
	var noteController = this.getNoteController();
	noteController.show();

	if (callback) {
		callback.run();
	}
};

ZmNotebookApp.prototype.setActive =
function(active) {
	/***
	if (active) {
		var noteController = this.getNoteController();
		noteController.show();
	}
	/***/
};

ZmNotebookApp.prototype.getController = function(name) {
	name = name || ZmNotebookApp.NOTEBOOK;
	if (!this._controllers[name]) {
		var controllerCtor = ZmNotebookApp.__CONTROLLERS[name];
		this._controllers[name] = new controllerCtor(this._appCtxt, this._container, this);
	}
	return this._controllers[name];
};

ZmNotebookApp.prototype.getNoteController = function() {
	return this.getController(ZmNotebookApp.NOTEBOOK);
};

ZmNotebookApp.prototype.getNoteEditController = function() {
	return this.getController(ZmNotebookApp.PAGE_EDIT);
};

ZmNotebookApp.prototype.getNoteCache = 
function() {
	return this._noteCache;
};
