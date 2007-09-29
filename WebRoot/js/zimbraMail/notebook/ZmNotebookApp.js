/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2006 Zimbra, Inc.
 * 
 * The contents of this file are subject to the Yahoo! Public License
 * Version 1.0 ("License"); you may not use this file except in
 * compliance with the License.  You may obtain a copy of the License at
 * http://www.zimbra.com/license.
 * 
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * ***** END LICENSE BLOCK *****
 */

function ZmNotebookApp(appCtxt, container, parentController) {
	ZmApp.call(this, ZmZimbraMail.NOTEBOOK_APP, appCtxt, container, parentController);
	this._controllers = {};
	this._notebookCache = new ZmNotebookCache(appCtxt);
}

ZmNotebookApp.prototype = new ZmApp;
ZmNotebookApp.prototype.constructor = ZmNotebookApp;

ZmNotebookApp.prototype.toString = 
function() {
	return "ZmNotebookApp";
}

// Constants

ZmNotebookApp.PAGE = "page";
ZmNotebookApp.PAGE_EDIT = "page_edit";
ZmNotebookApp.FILE = "file";

ZmNotebookApp.__CONTROLLERS = {};
ZmNotebookApp.__CONTROLLERS[ZmNotebookApp.PAGE]			= ZmNotebookPageController;
ZmNotebookApp.__CONTROLLERS[ZmNotebookApp.PAGE_EDIT]	= ZmPageEditController;
ZmNotebookApp.__CONTROLLERS[ZmNotebookApp.FILE]			= ZmNotebookFileController;

// Data

ZmNotebookApp.prototype._controllers;
ZmNotebookApp.prototype._notebookCache;

// Public methods

ZmNotebookApp.prototype.launch =
function(callback, errorCallback) {
	var notebookController = this.getNotebookController();
	notebookController.show(null, true);

	if (callback) {
		callback.run();
	}
};

ZmNotebookApp.prototype.setActive =
function(active) {
	/***
	if (active) {
		var notebookController = this.getNotebookController();
		notebookController.show();
	}
	/***/
};

ZmNotebookApp.prototype.getController = function(name) {
	name = name || ZmNotebookApp.PAGE;
	if (!this._controllers[name]) {
		var controllerCtor = ZmNotebookApp.__CONTROLLERS[name];
		this._controllers[name] = new controllerCtor(this._appCtxt, this._container, this);
	}
	return this._controllers[name];
};

ZmNotebookApp.prototype.getNotebookController = function() {
	return this.getController(ZmNotebookApp.PAGE);
};

ZmNotebookApp.prototype.getPageEditController = function() {
	return this.getController(ZmNotebookApp.PAGE_EDIT);
};

ZmNotebookApp.prototype.getFileController = function() {
	return this.getController(ZmNotebookApp.FILE);
};

ZmNotebookApp.prototype.getNotebookCache =
function() {
	return this._notebookCache;
};
