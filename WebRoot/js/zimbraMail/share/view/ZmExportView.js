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
 * This class represents the export view.
 * 
 * @extends		ZmImportExportBaseView
 * @class
 * @private
 */
ZmExportView = function(params) {
	if (arguments.length == 0) { return; }
	// setup form
	params.form = {
		items: [
			// default items
			{ id: "TYPE", type: "DwtRadioButtonGroup", value: ZmImportExportController.TYPE_TGZ,
				items: [
					{ id: "TYPE_TGZ", label: ZmMsg.importExportTypeTGZ, value: ZmImportExportController.TYPE_TGZ },
					{ id: "TYPE_ICS", label: ZmMsg.importExportTypeICS, value: ZmImportExportController.TYPE_ICS },
					{ id: "TYPE_CSV", label: ZmMsg.importExportTypeCSV, value: ZmImportExportController.TYPE_CSV }
				],
				onclick: this._type_onclick
			},
			{ id: "TYPE_HINT", type: "DwtText" },
			{ id: "SUBTYPE", type: "DwtSelect",
				visible: "get('TYPE') == ZmImportExportController.TYPE_CSV"
			},
			{ id: "FOLDER_BUTTON", type: "DwtButton", label: ZmMsg.browse,
				onclick: this._folderButton_onclick
			},
			{ id: "ADVANCED", type: "DwtCheckbox", label: ZmMsg.advancedSettings,
				visible: "get('TYPE') == ZmImportExportController.TYPE_TGZ"
			},
			// advanced
			{ id: "DATA_TYPES", type: "ZmImportExportDataTypes",
				visible: "get('ADVANCED')"
			},
			{ id: "SEARCH_FILTER", type: "DwtInputField", hint: ZmMsg.searchFilterHint,
				visible: "get('ADVANCED')"
			},
			{ id: "SKIP_META", type: "DwtCheckbox", label: ZmMsg.exportSkipMeta,
				visible: "get('ADVANCED')"
			}
		]
	};
	ZmImportExportBaseView.call(this, params);
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
		folderId:		this._folderId,
		searchFilter:	this.isRelevant("SEARCH_FILTER") ? this.getValue("SEARCH_FILTER") : null,
		skipMeta:       this.isRelevant("SKIP_META") ? this.getValue("SKIP_META") : null
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

	return params;
};

//
// Protected methods
//

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
	ZmImportExportBaseView.prototype.update.apply(this, arguments);
};

// handlers
ZmExportView.prototype._folder_onclick = function() {
	var isAll = this.getValue("FOLDER") == "all";
	var type = isAll ? ZmImportExportController.TYPE_TGZ : null;
	type = type || this._getTypeFromFolder(appCtxt.getById(this._folderId));
	this.setValue("TYPE", type);
	this._initSubType(type);
	this.update();
};
