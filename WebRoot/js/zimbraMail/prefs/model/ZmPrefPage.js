/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2009, 2010, 2013, 2014, 2016 Synacor, Inc.
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
 * All portions of the code are Copyright (C) 2009, 2010, 2013, 2014, 2016 Synacor, Inc. All Rights Reserved.
 * ***** END LICENSE BLOCK *****
 */

/**
 * Creates a preferences section. This is a "pseudo" organizer for
 * the preferences application tree view.
 * @constructor
 * @class
 * This class represents the preference page in the preferences application.
 * 
 * @param {Hash}	params    a hash of parameters
 * @param	{int}	     params.id			the numeric ID
 * @param	{String}	params.name		the name
 * @param	{ZmOrganizer}	params.parent		the parent folder
 * @param	{ZmTree}	params.tree		the tree model that contains this folder
 * @param	{String}	params.pageId		the ID of pref page
 * @param	{String}	params.icon		the icon name
 * @param	{String}	params.tooltip		the tool tip text
 * 
 * @extends		ZmOrganizer
 */
ZmPrefPage = function(params) {
	if (arguments.length == 0) { return; }
	params.type = params.type || ZmOrganizer.PREF_PAGE;
	ZmOrganizer.call(this, params);
	this.pageId = params.pageId;
	this.icon = params.icon;
	this.tooltip = params.tooltip;
};

ZmPrefPage.prototype = new ZmOrganizer;
ZmPrefPage.prototype.constructor = ZmPrefPage;

ZmPrefPage.prototype.toString = function() {
	return "ZmPrefPage";
};

//
// Constants
//

ZmOrganizer.ORG_CLASS[ZmId.ORG_PREF_PAGE] = "ZmPrefPage";

//
// Static functions
//

ZmPrefPage.createFromSection = function(section) {
	var overviewController = appCtxt.getOverviewController(); 
	var treeController = overviewController.getTreeController(ZmOrganizer.PREF_PAGE);
	var params = {
		id: ZmId.getPrefPageId(section.id),
		name: section.title,
		parent: null,
		tree: treeController.getDataTree(),
		icon: section.icon,
		tooltip: section.description
	};
	return new ZmPrefPage(params);
};

//
// Public methods
//

// ZmOrganizer methods

ZmPrefPage.prototype.getIcon = function() {
	//don't show icon for preference tree
	return null;
};

ZmPrefPage.prototype.getToolTip = function(force) {
	return this.tooltip || "";
};

