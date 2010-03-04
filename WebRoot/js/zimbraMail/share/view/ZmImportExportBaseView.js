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
 * This class represents the export base view.
 * 
 * @extends		DwtForm
 */
ZmImportExportBaseView = function(params) {
	if (arguments.length == 0) return;
	DwtForm.call(this, params);
	this._initSubType(ZmImportExportController.TYPE_TGZ);
	this._setFolderButton(appCtxt.getById(ZmOrganizer.ID_ROOT));
};
ZmImportExportBaseView.prototype = new DwtForm;
ZmImportExportBaseView.prototype.constructor = ZmImportExportBaseView;

ZmImportExportBaseView.prototype.toString = function() {
	return "ZmImportExportBaseView";
};

//
// Data
//

ZmImportExportBaseView.prototype._folderId = -1;

//
// Public methods
//

ZmImportExportBaseView.prototype.getFolderId = function() {
	return this._folderId;
};

// DwtForm methods

ZmImportExportBaseView.prototype.update = function() {
	DwtForm.prototype.update.apply(this, arguments);

	// update type hint
	var type = this.getValue("TYPE", ZmImportExportController.TYPE_TGZ);
	this.setValue("TYPE_HINT", this.TYPE_HINTS[type]);
};

ZmImportExportBaseView.prototype.setValue = function(name, value) {
	DwtForm.prototype.setValue.apply(this, arguments);
	if (name == "TYPE") {
		var type = value;
		this._initSubType(type);
		var isTgz = type == ZmImportExportController.TYPE_TGZ;
		this.setEnabled("ADVANCED", isTgz);
		if (this.getValue("ADVANCED") && !isTgz) {
			this.setValue("ADVANCED", false);
			this.update();
		}
		var folder;
		switch (type) {
			case ZmImportExportController.TYPE_CSV: {
				// TODO: Does this work for child accounts w/ fully-qualified ids?
				folder = appCtxt.getById(ZmOrganizer.ID_ADDRBOOK);
				break;
			}
			case ZmImportExportController.TYPE_ICS: {
				folder = appCtxt.getById(ZmOrganizer.ID_CALENDAR);
				break;
			}
			case ZmImportExportController.TYPE_TGZ: {
				folder = appCtxt.getById(ZmOrganizer.ID_ROOT);
				break;
			}
		}
		this._setFolderButton(folder);
	}
};

//
// Protected methods
//

// initializers

ZmImportExportBaseView.prototype._initSubType = function(type) {
	var select = this.getControl("SUBTYPE");
	if (!select) return;

	var options = this._getSubTypeOptions(type);
	if (!options || options.length == 0) return;

	select.clearOptions();
	for (var i = 0; i < options.length; i++) {
		select.addOption(options[i]);
	}
	select.setSelectedValue(options[0].value);
};

ZmImportExportBaseView.prototype._getSubTypeOptions = function(type) {
	if (!ZmImportExportBaseView.prototype.TGZ_OPTIONS) {
		ZmImportExportBaseView.prototype.TGZ_OPTIONS = [
			{ displayValue: ZmMsg["zimbra-tgz"],			value: "zimbra-tgz" }
		];
		ZmImportExportBaseView.prototype.CSV_OPTIONS = [];
		var formats = appCtxt.get(ZmSetting.AVAILABLE_CSVFORMATS);
		var options = formats._options;
		var displayOptions = formats._displayOptions;
		for (var i = 0; i < options.length; i++) {
			ZmImportExportBaseView.prototype.CSV_OPTIONS.push(
				{ displayValue: displayOptions[i], value: options[i] }
			);
		}
		ZmImportExportBaseView.prototype.ICS_OPTIONS = [
			{ displayValue: ZmMsg["zimbra-ics"],			value: "zimbra-ics" }
		];
	}
	var options;
	switch (type) {
		case ZmImportExportController.TYPE_TGZ: {
			options = this.TGZ_OPTIONS;
			break;
		}
		case ZmImportExportController.TYPE_CSV: {
			options = this.CSV_OPTIONS;
			break;
		}
		case ZmImportExportController.TYPE_ICS: {
			options = this.ICS_OPTIONS;
			break;
		}
	}
	return options;
};

// handlers

ZmImportExportBaseView.prototype._type_onclick = function(radioId, groupId) {
	// enable advanced options
	var type = this.getValue("TYPE");
	this.setValue("TYPE", type);
};

ZmImportExportBaseView.prototype._folderButton_onclick = function() {
	// init state
	if (!this._handleFolderDialogOkCallback) {
		this._handleFolderDialogOkCallback = new AjxCallback(this, this._handleFolderDialogOk);
	}

	if (!this._TREES) {
		this._TREES = {};
		this._TREES[ZmImportExportController.TYPE_TGZ] = AjxUtil.keys(ZmOrganizer.VIEWS);
		this._TREES[ZmImportExportController.TYPE_CSV] = [ZmOrganizer.ADDRBOOK];
		this._TREES[ZmImportExportController.TYPE_ICS] = [ZmOrganizer.CALENDAR];
	}

	// pop-up dialog
	var dialog = appCtxt.getChooseFolderDialog();
	dialog.registerCallback(DwtDialog.OK_BUTTON, this._handleFolderDialogOkCallback);
	var type = this.getValue("TYPE") || ZmImportExportController.TYPE_TGZ;
	var acctName = appCtxt.multiAccounts ? appCtxt.getActiveAccount().name : "";
	var params = {
		treeIds:		this._TREES[type],
		overviewId:		dialog.getOverviewId([this.toString(), type, acctName].join("_")),
		description:	"",
		skipReadOnly:	true,
		omit:			{},
		forceSingle:	true,
		hideNewButton:	(this instanceof ZmExportView)
	};
	params.omit[ZmOrganizer.ID_TRASH] = true;
	dialog.popup(params);
};

ZmImportExportBaseView.prototype._handleFolderDialogOk = function(folder) {
	appCtxt.getChooseFolderDialog().popdown();
	this._setFolderButton(folder);
	return true;
};

ZmImportExportBaseView.prototype._setFolderButton = function(folder) {
	// NOTE: Selecting a header is the same as "all folders"
	this._folderId = folder ? folder.id : -1;
	if (folder) {
		var isRoot = folder.nId == ZmOrganizer.ID_ROOT;
		this.setLabel("FOLDER_BUTTON", isRoot ? ZmMsg.allFolders : folder.name);
	}
	else {
		this.setLabel("FOLDER_BUTTON", ZmMsg.browse);
	}
};

//
// Class
//

ZmImportExportDataTypes = function(params) {
	if (arguments.length == 0) return;
	DwtComposite.apply(this, arguments);
	this._tabGroup = new DwtTabGroup(this._htmlElId);
	this._createHtml();
};
ZmImportExportDataTypes.prototype = new DwtComposite;
ZmImportExportDataTypes.prototype.constructor = ZmImportExportDataTypes;

ZmImportExportDataTypes.prototype.toString = function() {
	return "ZmImportExportDataTypes";
};

// Data

ZmImportExportDataTypes.prototype.TEMPLATE = "data.ImportExport#DataTypes";

// Public methods

ZmImportExportDataTypes.prototype.getTabGroupMember = function() {
	return this._tabGroup;
};

ZmImportExportDataTypes.prototype.setValue = function(value) {
	// NOTE: Special case "" as *all* types -- this will include things
	//       like conversations, etc, that are implicitly added if no
	//       data types are specified for import/export.
	if (value == "") {
		var children = this.getChildren();
		for (var i = 0; i < children.length; i++) {
			var checkbox = children[i];
			checkbox.setSelected(true);
		}
		return;
	}

	// return only those types that are checked
	var types = value ? value.split(",") : [];
	var type = {};
	for (var i = 0; i < types.length; i++) {
		type[types[i]] = true;
	}
	var children = this.getChildren();
	for (var i = 0; i < children.length; i++) {
		var checkbox = children[i];
		var selected = true;
		var types = checkbox.getValue().split(",");
		for (var j = 0; j < types.length; j++) {
			if (!type[types[j]]) {
				selected = false;
				break;
			}
		}
		checkbox.setSelected(selected);
	}
};

ZmImportExportDataTypes.prototype.getValue = function() {
	// NOTE: Special case "" as *all* types. 
	if (this.isAllSelected()) {
		return "";
	}

	var types = [];
	var children = this.getChildren();
	for (var i = 0; i < children.length; i++) {
		var checkbox = children[i];
		if (checkbox.isSelected()) {
			types.push(checkbox.getValue());
		}
	}
	return types.join(",");
};

/**
 * Checks if "all" is selected.
 * 
 * @return	{Boolean}	<code>true</code> if all is selected
 */
ZmImportExportDataTypes.prototype.isAllSelected = function() {
	var children = this.getChildren();
	for (var i = 0; i < children.length; i++) {
		var checkbox = children[i];
		if (!checkbox.isSelected()) {
			return false;
		}
	}
	return true;
};

ZmImportExportDataTypes.prototype.setEnabled = function(enabled) {
	DwtComposite.prototype.setEnabled.apply(this, arguments);
	var children = this.getChildren();
	for (var i = 0; i < children.length; i++) {
		var checkbox = children[i];
		checkbox.setEnabled(enabled);
	}
};

// Protected methods

ZmImportExportDataTypes.prototype._createHtml = function(templateId) {
	this._createHtmlFromTemplate(templateId || this.TEMPLATE, {id:this._htmlElId});
};

ZmImportExportDataTypes.prototype._createHtmlFromTemplate =
function(templateId, data) {
	// get number of checkboxes
	data.count = 0;
	for (var appName in ZmApp.ORGANIZER) {
		var orgType = ZmApp.ORGANIZER[appName];
		var views = ZmOrganizer.VIEWS[orgType];
		if (!views || views.length == 0) continue;
		data.count++;
	}

	// create cells
	DwtComposite.prototype._createHtmlFromTemplate.call(this, templateId, data);

	// create checkboxes and place in cells
	var i = 0;
	for (var appName in ZmApp.ORGANIZER) {
		var orgType = ZmApp.ORGANIZER[appName];
		var views = ZmOrganizer.VIEWS[orgType];
		if (!views || views.length == 0) continue;

		var checkbox = new ZmImportExportDataTypeCheckbox({parent:this,checked:true});
		checkbox.setImage(ZmApp.ICON[appName]);
		checkbox.setText(ZmMsg[ZmApp.NAME[appName]] || appName);
		// NOTE: I know it's the default join string but I prefer
		//       explicit behavior.
		checkbox.setValue(views.join(","));
		checkbox.replaceElement(data.id+"_cell_"+i);

		this._tabGroup.addMember(checkbox);

		i++;
	}
};

//
// Class
//

ZmImportExportDataTypeCheckbox = function(params) {
	if (arguments.length == 0) return;
	DwtCheckbox.apply(this, arguments);
};
ZmImportExportDataTypeCheckbox.prototype = new DwtCheckbox;
ZmImportExportDataTypeCheckbox.prototype.constructor = ZmImportExportDataTypeCheckbox;

// Data

ZmImportExportDataTypeCheckbox.prototype.TEMPLATE = "data.ImportExport#DataTypeCheckbox";

// Public methods

ZmImportExportDataTypeCheckbox.prototype.setTextPosition = function(position) {
	DwtCheckbox.prototype.setTextPosition.call(this, DwtCheckbox.TEXT_RIGHT);
};

ZmImportExportDataTypeCheckbox.prototype.setImage = function(imageName) {
	if (this._imageEl) {
		this._imageEl.className = AjxImg.getClassForImage(imageName);
	}
};

// Protected methods

ZmImportExportDataTypeCheckbox.prototype._createHtmlFromTemplate =
function(templateId, data) {
	DwtCheckbox.prototype._createHtmlFromTemplate.apply(this, arguments);
	this._imageEl = document.getElementById(data.id+"_image");
};
