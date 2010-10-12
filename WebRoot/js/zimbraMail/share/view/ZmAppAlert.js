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

/**
 * Returns a string representation of the object.
 * 
 * @return		{String}		a string representation of the object
 */
ZmAppAlert.prototype.toString =
function() {
	return "ZmAppAlert";
};

/**
 * Starts the alert.
 */
ZmAppAlert.prototype.start =
function() {
    var view = appCtxt.getCurrentViewId();
    //flash alert for all tabs but mail tab 
    if(view!=ZmId.VIEW_CONVLIST && view!=ZmId.VIEW_TRAD && view!=ZmId.VIEW_MSG && view!=ZmId.VIEW_CONV){
		this._getAppButton().showAlert(true);
    }
};

/**
 * Stops the alert.
 */
ZmAppAlert.prototype.stop =
function() {
	this._getAppButton().showAlert(false);
};

ZmAppAlert.prototype._getAppButton =
function() {
	return appCtxt.getAppController().getAppChooserButton(this.app.getName());
};

