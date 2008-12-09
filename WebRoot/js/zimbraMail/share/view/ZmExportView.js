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
	// setup form
	params.form = {
		items: [
			// default items
			{ id: "TYPE", value: ZmImportExportController.TYPE_TGZ },
			{ id: "TYPE_HINT", type: "DwtText" },
			{ id: "SUBTYPE", type: "DwtSelect", value: ZmImportExportController.SUBTYPE_ZIMBRA_TGZ,
				enabled: "get('TYPE') != ZmImportExportController.TYPE_TGZ"
			},
			{ id: "FOLDER", type: "DwtRadioButtonGroup", value: "all",
				items: [
					{ id: "FOLDER_ALL", label: ZmMsg.importExportFolderAll, value: "all" },
					{ id: "FOLDER_ONE", label: ZmMsg.importExportFolderOne, value: "one" }
				],
				onclick: this._folder_onclick
			},
			{ id: "FOLDER_BUTTON", type: "DwtButton", label: ZmMsg.browse },
			{ id: "IGNORE_ARCHIVE", type: "DwtCheckbox", label: ZmMsg.exportIgnoreArchive,
				enabled: "get('TYPE') == ZmImportExportController.TYPE_TGZ"
			},
			{ id: "ADVANCED", type: "DwtCheckbox", label: ZmMsg.advancedSettings,
				enabled: "get('SUBTYPE') == ZmImportExportController.SUBTYPE_ZIMBRA_TGZ"
			},
			// advanced
			{ id: "DATA_TYPES", type: "ZmImportExportDataTypes",
				visible: "get('ADVANCED')"
			},
			{ id: "SEARCH_FILTER", type: "DwtInputField", hint: ZmMsg.searchFilterHint,
				visible: "get('ADVANCED')"
			}
		]
	};
	ZmImportExportBaseView.call(this, params);

	// connect handlers
	var subtype = this.getControl("SUBTYPE");
	if (subtype) {
		subtype.addChangeListener(new AjxListener(this, this._handleSubTypeSelect));
	}
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
		type:			this.getValue("TYPE", ZmImportExportController.TYPE_TGZ),
		subType:		this.getValue("SUBTYPE"),
		// optional -- ignore if not relevant
		views:			this.isRelevant("DATA_TYPES") ? this.getValue("DATA_TYPES") : null,
		folderId:		this.isRelevant("FOLDER") ? (this.getValue("FOLDER","all") != "all" ? this._folderId : null) : null,
		searchFilter:	this.isRelevant("SEARCH_FILTER") ? this.getValue("SEARCH_FILTER") : null
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
	var ignoreArchive = this.isRelevant("IGNORE_ARCHIVE") ? this.getValue("IGNORE_ARCHIVE") : false;
	if (ignoreArchive) {
		var ignoreFilter = "not under:(Local Folders)";
		params.searchFilter = params.searchFilter ? [params.searchFilter, ignoreFilter].join(" and ") : ignoreFilter;
	}
	return params;
};

ZmExportView.prototype.getValue = function(id, defaultValue) {
	if (id == "TYPE") {
		var defaultValue = ZmImportExportController.TYPE_TGZ;
		var parts = this.getValue("SUBTYPE", defaultValue).split("-");
		var type = parts[parts.length-1];
		return type;
	}
	return ZmImportExportBaseView.prototype.getValue.apply(this, arguments);
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

ZmExportView.prototype._getSubTypeOptions = function(type) {
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

ZmExportView.prototype.update = function() {
	var type = this.getValue("TYPE", ZmImportExportController.TYPE_TGZ);
	var isTGZ = type == ZmImportExportController.TYPE_TGZ;
	var advanced = this.getControl("ADVANCED");
	if (advanced) {
		advanced.setEnabled(isTGZ);
		if (!isTGZ) {
			this.setValue("ADVANCED", false);
		}
	}

	var subType = this.getControl("SUBTYPE");
	if (subType) {
		subType.setEnabled(subType.getOptionCount() > 1);
	}

	ZmImportExportBaseView.prototype.update.apply(this, arguments);

	var ignoreArchive = this.getControl("IGNORE_ARCHIVE");
	if (ignoreArchive) {
		ignoreArchive.setVisible(this.isRelevant("IGNORE_ARCHIVE"));
		ignoreArchive.setEnabled(this.getValue("FOLDER") == "all");
	}
};

// handlers
ZmExportView.prototype._folder_onclick = function() {
	var isAll = this.getValue("FOLDER") == "all";
	var type = isAll ? ZmImportExportController.TYPE_TGZ : null;
	type = type || this._getTypeFromFolder(appCtxt.getById(this._folderId));
	this.setValue("TYPE", type);
	if (!isAll) {
		this.setValue("IGNORE_ARCHIVE", false);
	}
	this._initSubType(type);
	this.update();
};

ZmExportView.prototype._handleFolderDialogOk = function(folder) {
	if (ZmImportExportBaseView.prototype._handleFolderDialogOk.apply(this, arguments)) {
		var type = this._getTypeFromFolder(folder);
		this.setValue("TYPE", type);
		this._initSubType(type);
		this.update();
	}
};

ZmExportView.prototype._handleSubTypeSelect = function() {
//	var select = this.getControl("SUBTYPE");
//	var isZimbra = select.getSelectedValue() == ZmImportExportController;
	this.update();
};

ZmExportView.prototype._getTypeFromFolder = function(folder) {
	switch (folder && folder.type) {
		case ZmOrganizer.ADDRBOOK: return ZmImportExportController.TYPE_CSV;
		case ZmOrganizer.CALENDAR: return ZmImportExportController.TYPE_ICS;
	}
	return ZmImportExportController.TYPE_TGZ;
};