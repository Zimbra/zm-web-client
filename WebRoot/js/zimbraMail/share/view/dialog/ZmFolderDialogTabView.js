/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2011, 2012, 2013, 2014, 2016 Synacor, Inc.
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
 * All portions of the code are Copyright (C) 2011, 2012, 2013, 2014, 2016 Synacor, Inc. All Rights Reserved.
 * ***** END LICENSE BLOCK *****
 */

/**
 * @overview
 */

/**
 * Creates a folder properties view for the folder dialog
 * @class
 * This class represents a dialog tab view displayed by a tabToolbar
 * 
 * @param	{DwtControl}	parent		    the parent (dialog)
 * @param	{String}	    className		the class name
 * 
 * @extends		DwtComposite
 */
ZmFolderDialogTabView = function(parent, className) {
    if (arguments.length == 0) return;

    DwtTabViewPage.call(this, parent, className, Dwt.RELATIVE_STYLE);

    this._createView();
};

ZmFolderDialogTabView.prototype = new DwtTabViewPage;
ZmFolderDialogTabView.prototype.constructor = ZmFolderDialogTabView;



ZmFolderDialogTabView.prototype.toString =
function() {
	return "ZmDialogTabView";
};

ZmFolderDialogTabView.prototype.setOrganizer =
function(organizer) {
    this._organizer = organizer;
}

/**  doSave will be invoked for each tab view.
 *
 * @param	{BatchCommand}	batchCommand	Accumulates updates from all tabs
 * @param	{Object}	    saveState		Accumulates error messages and indication of any update
 */
ZmFolderDialogTabView.prototype.doSave =
function(batchCommand, saveState) { };


ZmFolderDialogTabView.prototype._handleFolderChange =
function(event) { }

ZmFolderDialogTabView.prototype._handleError =
function(response) {
	// Returned 'not handled' so that the batch command will preform the default
	// ZmController._handleException
	return false;
};

ZmFolderDialogTabView.prototype._createCheckboxItem =
function(name, label) {
    var checkboxName  = "_" + name + "Checkbox"
    var containerName = "_" + name + "El"

    this[checkboxName] = document.createElement("INPUT");
    this[checkboxName].type = "checkbox";
    this[checkboxName]._dialog = this;
    this[checkboxName].id = checkboxName;

    this[containerName] = document.createElement("DIV");
    this[containerName].style.display = "none";
    this[containerName].appendChild(this[checkboxName]);
    var lbl = document.createElement("label");
    lbl.innerHTML = label;
    lbl.htmlFor = checkboxName;
    this[containerName].appendChild(lbl);

    return this[containerName];
}

ZmFolderDialogTabView.prototype._createBusyOverlay =
function(htmlElement) {
    this._busyOverlay = document.createElement("div");
    this._busyOverlay.className = "ZmDialogTabViewBusy";
    this._busyOverlay.style.position = "absolute";
    this._busyOverlay.innerHTML = "<table cellspacing=0 cellpadding=0 style='width:100%; height:100%'><tr><td>&nbsp;</td></tr></table>";
    htmlElement.appendChild(this._busyOverlay);
    Dwt.setBounds(this._busyOverlay, 0, 0, "100%", "100%")
    Dwt.setZIndex(this._busyOverlay, Dwt.Z_VEIL);
	Dwt.setVisible(this._busyOverlay, false);

    this._setBusyFlag = false;
}

ZmFolderDialogTabView.prototype._setBusy =
function(busy) {
    if (!this._setBusyFlag) {
		// transition from non-busy to busy state
		Dwt.setCursor(this._busyOverlay, "wait");
    	Dwt.setVisible(this._busyOverlay, true);
    	this._setBusyFlag = this._blockInput = true;
    } else if (this._setBusy) {
		// transition from busy to non-busy state
	    Dwt.setCursor(this._busyOverlay, "default");
	    Dwt.setVisible(this._busyOverlay, false);
	    this._setBusyFlag = this._blockInput = false;
	}
}