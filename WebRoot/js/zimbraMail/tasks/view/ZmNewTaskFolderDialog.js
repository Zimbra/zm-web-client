/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2007, 2009, 2010, 2013, 2014, 2016 Synacor, Inc.
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
 * All portions of the code are Copyright (C) 2007, 2009, 2010, 2013, 2014, 2016 Synacor, Inc. All Rights Reserved.
 * ***** END LICENSE BLOCK *****
 */

/**
 * @overview
 * This file contains the new task folder dialog.
 * 
 */

/**
 * Creates the new task folder dialog.
 * @class
 * This class represents the new task folder dialog.
 * 
 * @param	{DwtControl}	parent		the parent
 * @param	{String}	className		the class name
 * 
 * @extends		ZmNewOrganizerDialog
 */
ZmNewTaskFolderDialog = function(parent, className) {
	ZmNewOrganizerDialog.call(this, parent, className, ZmMsg.createNewTaskFolder, ZmOrganizer.TASKS);
};

ZmNewTaskFolderDialog.prototype = new ZmNewOrganizerDialog;
ZmNewTaskFolderDialog.prototype.constructor = ZmNewTaskFolderDialog;


// Public methods

/**
 * Returns a string representation of the object.
 * 
 * @return		{String}		a string representation of the object
 */
ZmNewTaskFolderDialog.prototype.toString =
function() {
	return "ZmNewTaskFolderDialog";
};


// Protected methods

// overload since we always want to init the color to grey
ZmNewTaskFolderDialog.prototype._initColorSelect =
function() {
	var option = this._colorSelect.getOptionWithValue(ZmOrganizer.C_ORANGE);
	this._colorSelect.setSelectedOption(option);
};

ZmNewTaskFolderDialog.prototype._getRemoteLabel =
function() {
	return ZmMsg.addRemoteTasks;
};

// overload so we dont show this
ZmNewTaskFolderDialog.prototype._createFolderContentHtml =
function(html, idx) {
	return idx;
};
