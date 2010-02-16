/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2007, 2009, 2010 Zimbra, Inc.
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
 * Creates the new briefcase dialog.
 * @class
 * This class represents the new briefcase dialog.
 * 
 * @param	{ZmControl}	parent		the parent
 * @param	{String}	className		the class name
 * 
 * @extends		ZmNewOrganizerDialog
 */
ZmNewBriefcaseDialog = function(parent, className) {
	var title = ZmMsg.createNewBriefcaseItem;
	var type = ZmOrganizer.BRIEFCASE;
	ZmNewOrganizerDialog.call(this, parent, className, title, type);
}

ZmNewBriefcaseDialog.prototype = new ZmNewOrganizerDialog;
ZmNewBriefcaseDialog.prototype.constructor = ZmNewBriefcaseDialog;

/**
 * Returns a string representation of the object.
 * 
 * @return		{String}		a string representation of the object
 */
ZmNewBriefcaseDialog.prototype.toString = 
function() {
	return "ZmNewBriefcaseDialog";
}

// Protected methods

// NOTE: don't show remote checkbox
ZmNewBriefcaseDialog.prototype._createRemoteContentHtml =
function(html, idx) {
	return idx;
};
