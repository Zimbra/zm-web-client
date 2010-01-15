/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2008, 2009 Zimbra, Inc.
 * 
 * The contents of this file are subject to the Zimbra Public License
 * Version 1.2 ("License"); you may not use this file except in
 * compliance with the License.  You may obtain a copy of the License at
 * http://www.zimbra.com/license.
 * 
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * ***** END LICENSE BLOCK *****
 */


/**
 * Alert class that hilites and flashes an app tab.
 *
 * @param app ZmApp
 */
ZmAppAlert = function(app) {
	this.app = app;
};

ZmAppAlert.prototype.toString =
function() {
	return "ZmAppAlert";
};

ZmAppAlert.prototype.start =
function() {
	if (!this.app.isActive()) {
		this._getAppButton().showAlert(true);
	}
};

ZmAppAlert.prototype.stop =
function() {
	this._getAppButton().showAlert(false);
};

ZmAppAlert.prototype._getAppButton =
function() {
	return appCtxt.getAppController().getAppChooserButton(this.app.getName());
};

