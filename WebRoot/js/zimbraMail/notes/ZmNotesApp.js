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

function ZmNotesApp(appCtxt, container, parentController) {
	ZmApp.call(this, ZmZimbraMail.NOTES_APP, appCtxt, container, parentController);
	this._controllers = {};
	this._noteCache = new ZmNoteCache(appCtxt);
}

ZmNotesApp.prototype = new ZmApp;
ZmNotesApp.prototype.constructor = ZmNotesApp;

ZmNotesApp.prototype.toString = 
function() {
	return "ZmNotesApp";
}

// Constants

ZmNotesApp.NOTE = "note";
ZmNotesApp.EDIT = "edit";

ZmNotesApp.__CONTROLLERS = {};
ZmNotesApp.__CONTROLLERS[ZmNotesApp.NOTE] = ZmNoteController;
ZmNotesApp.__CONTROLLERS[ZmNotesApp.EDIT] = ZmNoteEditController;

// Data

ZmNotesApp.prototype._controllers;
ZmNotesApp.prototype._noteCache;

// Public methods

ZmNotesApp.prototype.launch =
function(callback, errorCallback) {
	var noteController = this.getNoteController();
	noteController.show();

	if (callback) {
		callback.run();
	}
};

ZmNotesApp.prototype.setActive =
function(active) {
	/***
	if (active) {
		var noteController = this.getNoteController();
		noteController.show();
	}
	/***/
};

ZmNotesApp.prototype.getController = function(name) {
	name = name || ZmNotesApp.NOTE;
	if (!this._controllers[name]) {
		var controllerCtor = ZmNotesApp.__CONTROLLERS[name];
		this._controllers[name] = new controllerCtor(this._appCtxt, this._container, this);
	}
	return this._controllers[name];
};

ZmNotesApp.prototype.getNoteController = function() {
	return this.getController(ZmNotesApp.NOTE);
};

ZmNotesApp.prototype.getNoteEditController = function() {
	return this.getController(ZmNotesApp.EDIT);
};

ZmNotesApp.prototype.getNoteCache = 
function() {
	return this._noteCache;
};
