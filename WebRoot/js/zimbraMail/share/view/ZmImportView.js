/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2008, 2009, 2010, 2011, 2013, 2014, 2016 Synacor, Inc.
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
 * All portions of the code are Copyright (C) 2008, 2009, 2010, 2011, 2013, 2014, 2016 Synacor, Inc. All Rights Reserved.
 * ***** END LICENSE BLOCK *****
 */

/**
 * This class represents the import view.
 * 
 * @extends		ZmImportExportBaseView
 * @private
 */
ZmImportView = function(params) {
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
				visible: "get('TYPE') == ZmImportExportController.TYPE_CSV && String(get('FILE')).match(/\\.csv$/i)"
			},
			{ id: "FOLDER_BUTTON", type: "DwtButton", label: ZmMsg.browse,
				enabled: "get('FILE')",
				onclick: this._folderButton_onclick
			},
			{ id: "FORM" },
			{ id: "FILE",
				setter: new Function() // no-op -- can't set a file value
			},
			{ id: "RESOLVE", type: "DwtRadioButtonGroup", value: "ignore",
				items: [
					{ id: "RESOLVE_IGNORE", label: ZmMsg.resolveDuplicateIgnore, value: "ignore" },
					{ id: "RESOLVE_MODIFY", label: ZmMsg.resolveDuplicateModify, value: "modify" },
					{ id: "RESOLVE_REPLACE", label: ZmMsg.resolveDuplicateReplace, value: "replace" },
					{ id: "RESOLVE_RESET", label: ZmMsg.resolveDuplicateReset, value: "reset" }
				],
				visible: "get('FILE') && get('TYPE') == ZmImportExportController.TYPE_TGZ"
			},
			{ id: "ADVANCED", type: "DwtCheckbox", label: ZmMsg.advancedSettings,
				visible: "get('FILE') && get('TYPE') == ZmImportExportController.TYPE_TGZ"
			},
			// advanced
			{ id: "DATA_TYPES", type: "ZmImportExportDataTypes",
				visible: "get('ADVANCED')"
			}
		]
	};
	params.id = "ZmImportView";
	ZmImportExportBaseView.call(this, params);

	// add change listener to file input
	var form = this.getControl("FORM");
	var file = form && form.elements["file"];
	if (file) {
		file.onchange = AjxCallback.simpleClosure(this._handleFileChange, this, file);
	}
};
ZmImportView.prototype = new ZmImportExportBaseView;
ZmImportView.prototype.constructor = ZmImportView;

ZmImportView.prototype.toString = function() {
	return "ZmImportView";
};

//
// Constants
//

ZmImportView.prototype.TYPE_HINTS = {};
ZmImportView.prototype.TYPE_HINTS[ZmImportExportController.TYPE_CSV] = ZmMsg.importFromCSVHint;
ZmImportView.prototype.TYPE_HINTS[ZmImportExportController.TYPE_ICS] = ZmMsg.importFromICSHint;
ZmImportView.prototype.TYPE_HINTS[ZmImportExportController.TYPE_TGZ] = ZmMsg.importFromTGZHint;

//
// Data
//

ZmImportView.prototype.TEMPLATE = "data.ImportExport#ImportView";

//
// Public methods
//

/**
 * Returns a params object that can be used to directly call
 * ZmImportExportController#exportData.
 */
ZmImportView.prototype.getParams = function() {
	var form = this.getControl("FORM");
	var filename = form && form.elements["file"].value;
	var ext = filename && filename.replace(/^.*\./,"").toLowerCase();
	var type = ext || this.getValue("TYPE") || ZmImportExportController.TYPE_TGZ;
	var isTGZ = type == ZmImportExportController.TYPE_TGZ;
	var params = {
		// required
		form:		form,
		// optional -- ignore if not relevant
		type:		type,
		subType:	this.isRelevant("SUBTYPE") ? this.getValue("SUBTYPE") : null,
		views:		this.isRelevant("DATA_TYPES") ? this.getValue("DATA_TYPES") : null,
		resolve:	this.isRelevant("RESOLVE") && isTGZ ? this.getValue("RESOLVE") : null,
		folderId:	this._folderId,
		dataTypes:	this.isRelevant("DATA_TYPES") ? this.getValue("DATA_TYPES") : null
	};
	if (params.resolve == "ignore") {
		delete params.resolve;
	}
	return params;
};

//
// Protected methods
//

ZmImportView.prototype._getSubTypeOptions = function(type) {
	var options = ZmImportExportBaseView.prototype._getSubTypeOptions.apply(this, arguments);
	if (type == ZmImportExportController.TYPE_CSV) {
		options = [].concat({ displayValue: ZmMsg.importAutoDetect, value: "" }, options);
	}
	return options;
};

ZmImportView.prototype._handleFileChange = function(file) {
	var filename = file.value;
	var ext = filename.replace(/^.*\./,"").toLowerCase();
	var type = ZmImportExportController.EXTS_TYPE[ext];
	if (type) {
		this.set("TYPE", type);
	}
};
