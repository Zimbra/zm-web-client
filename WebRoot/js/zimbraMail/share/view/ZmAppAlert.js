/*
 * ***** BEGIN LICENSE BLOCK *****
 *
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2008 Zimbra, Inc.
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
 * Alert class that hilites and flashes an app tab.
 *
 * @param app ZmApp
 */
ZmAppAlert = function(app) {
	ZmAlert.call(this);
	this.app = app;
};

ZmAppAlert.prototype = new ZmAlert;
ZmAppAlert.prototype.constructor = ZmAppAlert;

ZmAppAlert.prototype.toString =
function() {
	return "ZmAppAlert";
};

ZmAppAlert.prototype.start =
function() {
	if (!this.app.isActive()) {
		var button = this._getAppButton();
		if (!this._listener) {
			this._listener = new AjxListener(this, this.stop);
			button.addSelectionListener(this._listener);
		}
		this._origImage = button.getImage();
		button.showAlert(true);
		this._startLoop();
	}
};

ZmAppAlert.prototype.stop =
function() {
	this._stopLoop();
	this._getAppButton().showAlert(false);
};

ZmAppAlert.prototype._update =
function(status) {
	this._getAppButton().setImage(status ? "Blank_16" : this._origImage);
};

ZmAppAlert.prototype._getAppButton =
function() {
	return appCtxt.getAppController().getAppChooserButton(this.app.getName());
};

