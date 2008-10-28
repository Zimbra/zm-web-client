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

ZmImportView = function(params) {
	if (arguments.length == 0) { return; }
	ZmImportExportBaseView.call(this, params);

	this._exportListener = new AjxListener(this, this._handleExport);
	this._folderListener = new AjxListener(this, this._handleFolder);
	this._resolveListener = new AjxListener(this, this._handleResolve);

	// TODO
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
	var type = this.getFormValue("TYPE", ZmImportExportController.TYPE_TGZ);
	var isTGZ = type == ZmImportExportController.TYPE_TGZ;
	var folderId = this.getFormValue("FOLDER","all") != "all" ? this._folderId : null; 
	var params = {
		// required
		form:		this.getFormObject("FILE").form,
		// optional -- ignore if not relevant
		type:		this.isRelevant("TYPE") ? type : null,
		subType:	this.isRelevant("SUBTYPE") ? this.getFormValue("SUBTYPE") : null,
		views:		this.isRelevant("DATA_TYPES") ? this.getFormValue("DATA_TYPES") : null,
		resolve:	this.isRelevant("RESOLVE") && isTGZ ? this.getFormValue("RESOLVE", "ignore") : null,
		folderId:	this.isRelevant("FOLDER") ? folderId : null,
		dataTypes:	this.isRelevant("DATA_TYPES") ? this.getFormValue("DATA_TYPES") : null
	};
	return params;
};

//
// Protected methods
//

ZmImportView.prototype._registerControls = function() {
	ZmImportExportBaseView.prototype._registerControls.apply(this, arguments);
	this._registerControl("FILE", {
		displayContainer:	ZmPref.TYPE_CUSTOM
	});
	this._registerControl("RESOLVE", {
		displayContainer:	ZmPref.TYPE_RADIO_GROUP,
		orientation:        ZmPref.ORIENT_HORIZONTAL,
		displayOptions:		[ZmMsg.resolveDuplicateIgnore, ZmMsg.resolveDuplicateReplace, ZmMsg.resolveDuplicateReset],
		// NOTE: Ignore value should not be sent to server, so we leave blank.
		options:			["", "replace", "reset"]
	});
};

ZmImportView.prototype._setupRadioGroup = function(id, setup, value) {
	var group = ZmImportExportBaseView.prototype._setupRadioGroup.apply(this, arguments);
	if (id == "TYPE") {
		group.addSelectionListener(new AjxListener(this, this._handleTypeChange));
	}
	return group;
};

ZmImportView.prototype._setupCustom = function(id, setup, value) {
	if (id == "FILE") {
		var fileEl = document.getElementById([this._htmlElId,id].join("_"));
		fileEl.name = "file";
		this.setFormObject(id, fileEl);
	}
	return ZmImportExportBaseView.prototype._setupCustom.apply(this, arguments);
};

ZmImportView.prototype._updateControls = function() {
	var type = this.getFormValue("TYPE", ZmImportExportController.TYPE_TGZ);
	var isZimbra = type == ZmImportExportController.TYPE_TGZ;

	var subType = this.getFormObject("SUBTYPE");
	if (subType) {
		subType.setEnabled(subType.getOptionCount() > 1);
	}

	var resolve = this.getFormObject("RESOLVE");
	if (resolve) {
		resolve.setEnabled(isZimbra);
	}

	var advanced = this.getFormObject("ADVANCED");
	if (advanced) {
		if (!isZimbra) {
			advanced.setSelected(false);
		}
		advanced.setEnabled(isZimbra);
	}

	ZmImportExportBaseView.prototype._updateControls.apply(this, arguments);
};

// handlers

ZmImportView.prototype._handleTypeChange = function() {
	var type = this.getFormValue("TYPE", ZmImportExportController.TYPE_TGZ);
	this._initSubType(type);
	this._updateControls();
};
