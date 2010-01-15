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

ZmExportView = function(params) {
	if (arguments.length == 0) { return; }
	ZmImportExportBaseView.call(this, params);

	this._folderListener = new AjxListener(this, this._handleFolder);
	this._chooseFolderCallback = new AjxCallback(this, this._handleChooseFolder);
};
ZmExportView.prototype = new ZmImportExportBaseView;
ZmExportView.prototype.constructor = ZmExportView;

ZmExportView.prototype.toString = function() {
	return "ZmExportView";
};

//
// Data
//

ZmExportView.prototype.TYPE_HINTS = {};
ZmExportView.prototype.TYPE_HINTS[ZmImportExportController.TYPE_CSV] = ZmMsg.exportToCSVHint;
ZmExportView.prototype.TYPE_HINTS[ZmImportExportController.TYPE_ICS] = ZmMsg.exportToICSHint;
ZmExportView.prototype.TYPE_HINTS[ZmImportExportController.TYPE_TGZ] = ZmMsg.exportToTGZHint;

ZmExportView.prototype.TEMPLATE = "data.ImportExport#ExportView";

//
// Data
//

ZmExportView.prototype._type = ZmImportExportController.TYPE_TGZ;

//
// Public methods
//

/**
 * Returns a params object that can be used to directly call
 * ZmImportExportController#exportData.
 */
ZmExportView.prototype.getParams = function() {
	// export parameters
	var params = {
		// required
		type:			this.getFormValue("TYPE", ZmImportExportController.TYPE_TGZ),
		subType:		this.getFormValue("SUBTYPE"),
		// optional -- ignore if not relevant
		views:			this.isRelevant("DATA_TYPES") ? this.getFormValue("DATA_TYPES") : null,
		folderId:		this._folderId,
		searchFilter:	this.isRelevant("SEARCH_FILTER") ? this.getFormValue("SEARCH_FILTER") : null,
		skipMeta:       this.isRelevant("SKIP_META") ? this.getFormValue("SKIP_META") : null
	};

	// generate filename
	if (this._folderId != -1) {
		var folder = appCtxt.getById(params.folderId);
		var isRoot = folder && folder.nId == ZmOrganizer.ID_ROOT;
		params.filename = [
			isRoot ? ZmMsg.exportFilenamePrefixAllFolders : folder.name,
			"-",
			AjxDateFormat.format("yyyy-MM-dd-HHmmss", new Date())
		].join("");
	}

	// modify search filter
	var ignoreArchive = this.isRelevant("IGNORE_ARCHIVE") ? this.getFormValue("IGNORE_ARCHIVE") : false;
	if (ignoreArchive) {
		var ignoreFilter = "not under:(Local Folders)";
		params.searchFilter = params.searchFilter ? [params.searchFilter, ignoreFilter].join(" and ") : ignoreFilter;
	}
	return params;
};

ZmExportView.prototype.isRelevant = function(id) {
	if (id == "IGNORE_ARCHIVE") {
		return appCtxt.get(ZmSetting.OFFLINE_ENABLED) &&
		       appCtxt.getById([appCtxt.get(ZmSetting.USERID),ZmOrganizer.ID_ARCHIVE].join(":")) != null;
	}
	return ZmImportExportBaseView.prototype.isRelevant.apply(this, arguments);
};
//
// Protected methods
//

ZmExportView.prototype._registerControls = function() {
	ZmImportExportBaseView.prototype._registerControls.apply(this, arguments);
	this._registerControl("SEARCH_FILTER", {
		displayContainer:	ZmPref.TYPE_INPUT
	});
	this._registerControl("IGNORE_ARCHIVE", {
		displayContainer:	ZmPref.TYPE_CHECKBOX,
		displayName:		ZmMsg.exportIgnoreArchive
	});
	this._registerControl("SKIP_META", {
		displayContainer:	ZmPref.TYPE_CHECKBOX,
		displayName:		ZmMsg.exportSkipMeta
	});
};

ZmExportView.prototype._getSubTypeOptions = function(type) {
	var setup = this.SETUP["SUBTYPE"];
	if (!setup.options) {
		setup.options = ZmPref.SETUP["EXPORT_FOLDER"].options || [];
		setup.displayOptions = ZmPref.SETUP["EXPORT_FOLDER"].displayOptions || [];
	}
	return ZmImportExportBaseView.prototype._getSubTypeOptions.apply(this, arguments);
};

ZmExportView.prototype._setupSelect = function(id, setup, value) {
	var select = ZmImportExportBaseView.prototype._setupSelect.apply(this, arguments);
	if (id == "SUBTYPE") {
		select.addChangeListener(new AjxListener(this, this._handleSubTypeSelect));
	}
	return select;
};

ZmExportView.prototype._updateControls = function() {
	ZmImportExportBaseView.prototype._updateControls.apply(this, arguments);
	this.setControlVisible("IGNORE_ARCHIVE", this.isRelevant("IGNORE_ARCHIVE"));
};

// handlers

ZmExportView.prototype._handleFolderDialogOk = function(folder) {
	var retValue = ZmImportExportBaseView.prototype._handleFolderDialogOk.apply(this, arguments);
	var folder = appCtxt.getById(this._folderId);
	var isAll = folder && folder.nId == ZmOrganizer.ID_ROOT;
	this.setControlEnabled("IGNORE_ARCHIVE", isAll);
	if (!isAll) {
		this.setFormValue("IGNORE_ARCHIVE", false);
	}
	this._updateControls();
	return retValue;
};
