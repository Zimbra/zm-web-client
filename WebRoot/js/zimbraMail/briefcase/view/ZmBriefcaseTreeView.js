/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2007, 2008, 2009, 2010, 2011, 2012, 2013 Zimbra Software, LLC.
 * 
 * The contents of this file are subject to the Zimbra Public License
 * Version 1.4 ("License"); you may not use this file except in
 * compliance with the License.  You may obtain a copy of the License at
 * http://www.zimbra.com/license.
 * 
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * ***** END LICENSE BLOCK *****
 */

/**
 * @overview
 * This file contains the briefcase tree view class.
 *
 */

/**
 * Creates the briefcase tree view.
 * @class
 * This class is a view for the tree view used by the briefcase application, supporting external DnD
 *
 * @param	params		params passed to create TreeView
 *
 * @author Vince Bellows
 *
 * @extends		ZmTreeView
 */
ZmBriefcaseTreeView = function(params) {

	ZmTreeView.call(this,  params);
};

ZmBriefcaseTreeView.prototype = new ZmTreeView;
ZmBriefcaseTreeView.prototype.constructor = ZmBriefcaseTreeView;

/**
 * Returns a string representation of the object.
 *
 * @return		{String}		a string representation of the object
 */
ZmBriefcaseTreeView.prototype.toString = function() {
	return "ZmBriefcaseTreeView";
};

ZmBriefcaseTreeView.prototype._submitMyComputerAttachments = function(files, node, isInline, ev) {
	var el = ev.target;
	var folderId;
	if (el != null) {
		// Walk up the parents and find one that has an associated folder id (if any)
		while ((el != null) && !folderId) {
			if (el.id) {
				folderId = this._idToOrganizer[el.id];
			}
			el = el.parentNode;
		}
	}
	if (folderId) {
		var briefcaseApp = appCtxt.getApp(ZmApp.BRIEFCASE);
		briefcaseApp.initExternalDndUpload(files, null, isInline, null, folderId);
	}
};


