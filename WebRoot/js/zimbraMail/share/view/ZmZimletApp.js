/*
 * ***** BEGIN LICENSE BLOCK *****
 *
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2006, 2007 Zimbra, Inc.
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

ZmZimletApp = function(name, zimlet, container) {
	ZmApp.call(this, name, container);
	this._zimlet = zimlet;
};
ZmZimletApp.prototype = new ZmApp;
ZmZimletApp.prototype.constructor = ZmZimletApp;

ZmZimletApp.prototype.toString = function() {
	return "ZmZimletApp";
};

//
// Public methods
//

ZmZimletApp.prototype.getController = function() {
	if (!this._controller) {
		this._controller = new ZmZimletAppController(this.getName(), this._container, this);
	}
	return this._controller;
};

// convenience methods

ZmZimletApp.prototype.setContent = function(html) {
	this.getController().getView().setContent(html);
};

ZmZimletApp.prototype.setView = function(view) {
	this.getController().getView().setView(view);
};

// ZmApp methods

ZmZimletApp.prototype.launch = function(params, callback) {
	this.getController().show();
	ZmApp.prototype.launch.apply(this, arguments);
	if (this._zimlet.appLaunch) {
		this._zimlet.appLaunch(this.getName(), params);
	}
};

ZmZimletApp.prototype.activate = function(active) {
	ZmApp.prototype.activate.apply(this, arguments);
	if (this._zimlet.appActive) {
		this._zimlet.appActive(this.getName(), active);
	}
};
