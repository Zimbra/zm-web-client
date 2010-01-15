/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2009 Zimbra, Inc.
 * 
 * The contents of this file are subject to the Zimbra Public License
 * Version 1.2 ("License"); you may not use this file except in
 * compliance with the License.  You may obtain a copy of the License at
 * http://www.zimbra.com/license.
 * 
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * ***** END LICENSE BLOCK *****
 */

/**
 * Creates a preferences section. This is a "pseudo" organizer for
 * the preferences app's tree view.
 * @constructor
 * @class
 *
 * @param params    [object]    Construction parameters:
 *      id			[int]			numeric ID
 *      name		[string]		name
 *      parent		[ZmOrganizer]	parent folder
 *      tree		[ZmTree]		tree model that contains this folder
 *      pageId		[string]		ID of pref page
 *      icon		[string]		Icon name.
 *      tooltip		[string]		Tooltip text.
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
	return this.icon || "Preferences";
};

ZmPrefPage.prototype.getToolTip = function(force) {
	return this.tooltip || "";
};

