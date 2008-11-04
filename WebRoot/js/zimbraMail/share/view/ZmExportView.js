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
		folderId:		this.isRelevant("FOLDER") ? (this.getFormValue("FOLDER","all") != "all" ? this._folderId : null) : null,
		searchFilter:	this.isRelevant("SEARCH_FILTER") ? this.getFormValue("SEARCH_FILTER") : null
	};

	// generate filename
	params.filename = [
		params.folderId ? appCtxt.getById(params.folderId).name : ZmMsg.exportFilenamePrefixAllFolders,
		"-",
		AjxDateFormat.format("yyyy-MM-dd-HHmmss", new Date()),
		".",
		params.type
	].join("");

	// modify search filter
	var ignoreArchive = this.isRelevant("IGNORE_ARCHIVE") ? this.getFormValue("IGNORE_ARCHIVE") : false;
	if (ignoreArchive) {
		var ignoreFilter = "not under:(Local Folders)";
		params.searchFilter = params.searchFilter ? [params.searchFilter, ignoreFilter].join(" and ") : ignoreFilter;
	}
	return params;
};

ZmExportView.prototype.setFormValue = function(id, value) {
	if (id == "TYPE") {
//		this._type = value;
		return;
	}
	ZmImportExportBaseView.prototype.setFormValue.apply(this, arguments);
};

ZmExportView.prototype.getFormValue = function(id, defaultValue) {
	if (id == "TYPE") {
		var defaultValue = ZmImportExportController.TYPE_TGZ;
		var parts = this.getFormValue("SUBTYPE", defaultValue).split("-");
		var type = parts[parts.length-1];
		return type;
	}
	return ZmImportExportBaseView.prototype.getFormValue.apply(this, arguments);
};

ZmExportView.prototype.isRelevant = function(id) {
	if (id == "IGNORE_ARCHIVE") {
		return appCtxt.get(ZmSetting.OFFLINE_ENABLED) && appCtxt.getById(ZmOrganizer.ID_ARCHIVE) != null;
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
};

ZmExportView.prototype._getSubTypeOptions = function(type) {
	var setup = this.SETUP["SUBTYPE"];
	if (!setup.options) {
		setup.options = ZmPref.SETUP["EXPORT_FOLDER"].options || [];
		setup.displayOptions = ZmPref.SETUP["EXPORT_FOLDER"].displayOptions || [];
	}
	var options = ZmImportExportBaseView.prototype._getSubTypeOptions.apply(this, arguments);
	if (type != ZmImportExportController.TYPE_TGZ) {
		options = this.TGZ_OPTIONS.concat(options);
	}
	return options;
};

ZmExportView.prototype._setupSelect = function(id, setup, value) {
	var select = ZmImportExportBaseView.prototype._setupSelect.apply(this, arguments);
	if (id == "SUBTYPE") {
		select.addChangeListener(new AjxListener(this, this._handleSubTypeSelect));
	}
	return select;
};

ZmExportView.prototype._updateControls = function() {
	var type = this.getFormValue("TYPE", ZmImportExportController.TYPE_TGZ);
	var isTGZ = type == ZmImportExportController.TYPE_TGZ;
	var advanced = this.getFormObject("ADVANCED");
	if (advanced) {
		advanced.setEnabled(isTGZ);
		if (!isTGZ) {
			this.setFormValue("ADVANCED", false);
		}
	}

	var subType = this.getFormObject("SUBTYPE");
	if (subType) {
		subType.setEnabled(subType.getOptionCount() > 1);
	}

	ZmImportExportBaseView.prototype._updateControls.apply(this, arguments);

	var ignoreArchive = this.getFormObject("IGNORE_ARCHIVE");
	if (ignoreArchive) {
		ignoreArchive.setVisible(this.isRelevant("IGNORE_ARCHIVE"));
		ignoreArchive.setEnabled(this.getFormValue("FOLDER") == "all");
	}
};

// handlers
ZmExportView.prototype._handleFolder = function() {
	var isAll = this.getFormValue("FOLDER", "all") == "all";
	var type = isAll ? ZmImportExportController.TYPE_TGZ : null;
	type = type || this._getTypeFromFolder(appCtxt.getById(this._folderId));
	this.setFormValue("TYPE", type);
	if (!isAll) {
		this.setFormValue("IGNORE_ARCHIVE", false);
	}
	this._initSubType(type);
	this._updateControls();
};

ZmExportView.prototype._handleFolderDialogOk = function(folder) {
	if (ZmImportExportBaseView.prototype._handleFolderDialogOk.apply(this, arguments)) {
		var type = this._getTypeFromFolder(folder);
		this.setFormValue("TYPE", type);
		this._initSubType(type);
		this._updateControls();
	}
};

ZmExportView.prototype._handleSubTypeSelect = function() {
//	var select = this.getFormObject("SUBTYPE");
//	var isZimbra = select.getSelectedValue() == ZmImportExportController;
	this._updateControls();
};

ZmExportView.prototype._getTypeFromFolder = function(folder) {
	switch (folder && folder.type) {
		case ZmOrganizer.ADDRBOOK: return ZmImportExportController.TYPE_CSV;
		case ZmOrganizer.CALENDAR: return ZmImportExportController.TYPE_ICS;
	}
	return ZmImportExportController.TYPE_TGZ;
};