/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2016 Synacor, Inc.
 *
 * The contents of this file are subject to the Common Public Attribution License Version 1.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at: https://www.zimbra.com/license
 * The License is based on the Mozilla Public License Version 1.1 but Sections 14 and 15
 * have been added to cover use of software over a computer network and provide for limited attribution
 * for the Original Developer. In addition, Exhibit A has been modified to be consistent with Exhibit B.
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * See the License for the specific language governing rights and limitations under the License.
 * The Original Code is Zimbra Open Source Web Client.
 * The Initial Developer of the Original Code is Zimbra, Inc.  All rights to the Original Code were
 * transferred by Zimbra, Inc. to Synacor, Inc. on September 14, 2015.
 *
 * All portions of the code are Copyright (C) 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2016 Synacor, Inc. All Rights Reserved.
 * ***** END LICENSE BLOCK *****
 */

/**
 * Creates the import/export page.
 * @class
 * This class represents the import/export page.
 * 
 * @param {DwtControl}	parent			the containing widget
 * @param {Object}	section			the page
 * @param {ZmPrefController}	controller		the prefs controller
 * 
 * @extends	ZmPreferencesPage
 * 
 * @private
 */
ZmImportExportPage = function(parent, section, controller) {
	ZmPreferencesPage.apply(this, arguments);
};

ZmImportExportPage.prototype = new ZmPreferencesPage;
ZmImportExportPage.prototype.constructor = ZmImportExportPage;

ZmImportExportPage.prototype.toString =
function () {
    return "ZmImportExportPage";
};

//
// ZmPreferencesPage methods
//

ZmImportExportPage.prototype.reset =
function(useDefaults) {
	ZmPreferencesPage.prototype.reset.apply(this, arguments);
	var button = this.getFormObject("IMPORT_BUTTON");
	if (button) {
		button.setEnabled(true);
	}
};

ZmImportExportPage.prototype.hasResetButton =
function() {
	return false;
};

//
// Protected methods
//

ZmImportExportPage.prototype._setupCustom = function(id, setup, value) {
	if (id == "EXPORT_FOLDER") {
		var view = new ZmExportView({parent:this});
		this.setFormObject(id, view);
		return view;
	}
	if (id == "EXPORT_BUTTON") {
		var button = new DwtButton({parent:this, id: id});
		button.setText(setup.displayName);
		button.addSelectionListener(new AjxListener(this, this._handleExportButton));
		this.setFormObject(id, button);
		return button;
	}
	if (id == "IMPORT_FOLDER") {
		var view = new ZmImportView({parent:this});
		this.setFormObject(id, view);
		return view;
	}
	if (id == "IMPORT_BUTTON") {
		var button = new DwtButton({parent:this, id: id});
		button.setText(setup.displayName);
		button.addSelectionListener(new AjxListener(this, this._handleImportButton));
		this.setFormObject(id, button);
		return button;
	}
	return ZmPreferencesPage.prototype._setupCustom.apply(this, arguments);
};

// handlers

ZmImportExportPage.prototype._handleImportButton = function() {
	var button = this.getFormObject("IMPORT_BUTTON");
	if (button) {
		button.setEnabled(false);
	}

	// get import params
	var importView = this.getFormObject("IMPORT_FOLDER");
	var params = {};
    params = importView && importView.getParams();
	params.callback = params.errorCallback = new AjxCallback(this, this._handleImportComplete);

	// import
	var controller = appCtxt.getImportExportController();
	if (controller.importData(params)) {
		var params = {
			msg:	ZmMsg.importStarted,
			level:	ZmStatusView.LEVEL_INFO
		};
		appCtxt.setStatusMsg(params);
	}
	else if (button) {
		button.setEnabled(true);
	}
};

ZmImportExportPage.prototype._handleExportButton = function() {
	// get export params
	var exportView = this.getFormObject("EXPORT_FOLDER");
	var params = exportView.getParams();

	// export
	var controller = appCtxt.getImportExportController();
	controller.exportData(params);
};

ZmImportExportPage.prototype._handleImportComplete = function() {
	var button = this.getFormObject("IMPORT_BUTTON");
	if (button) {
		button.setEnabled(true);
	}
};