/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2008, 2009, 2010 Zimbra, Inc.
 * 
 * The contents of this file are subject to the Zimbra Public License
 * Version 1.3 ("License"); you may not use this file except in
 * compliance with the License.  You may obtain a copy of the License at
 * http://www.zimbra.com/license.
 * 
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * ***** END LICENSE BLOCK *****
 */


/**
 * This class represents an alert that highlights and flashes an application tab.
 *
 * @param {ZmApp}		app 		the application
 * @class
 * @private
 */
ZmAppAlert = function(app) {
	this.app = app;
};

ZmAppAlert.prototype.isZmAppAlert = true;
ZmAppAlert.prototype.toString = function() { return "ZmAppAlert"; };

/**
 * Starts the alert.
 */
ZmAppAlert.prototype.start =
function() {
	var appButton = this._getAppButton();
	if (!appButton) { return; }
	
    if (!appButton.isSelected) {
		appButton.showAlert(true);
        //add a stop alert listener
        if (!this._stopAlertListenerObj) {
           this._stopAlertListenerObj = new AjxListener(this, this.stop);
           appButton.addSelectionListener(this._stopAlertListenerObj);
        }
    }
};

/**
 * Stops the alert.
 */
ZmAppAlert.prototype.stop =
function() {
	var appButton = this._getAppButton();
	if (!appButton) { return; }
    if (appButton.isSelected) {
        appButton.showAlert(false);
    }
};

ZmAppAlert.prototype._getAppButton =
function() {
	return appCtxt.getAppController().getAppChooserButton(this.app.getName());
};

