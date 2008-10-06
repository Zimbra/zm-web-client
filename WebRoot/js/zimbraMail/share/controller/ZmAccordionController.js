/*
 * ***** BEGIN LICENSE BLOCK *****
 *
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2004, 2005, 2006, 2007 Zimbra, Inc.
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

/**
 * Creates an accordion controller.
 * @constructor
 * @class
 * This class is a base class for controllers of accordions.
 *
 */
ZmAccordionController = function(accordionId) {
	if (arguments.length == 0) { return; }

	this._accordionId = accordionId;
	this._accordion = null;
}

// Abstract methods

/** Returns the id for the overview in the currently selection accordion item */
ZmAccordionController.prototype.getOverviewId = null;

/** Creates the accordion, and initializes this._accordion */
ZmAccordionController.prototype._createAccordion = null;

/** Returns the list of all tree ids that might apear inside an accordion item */
ZmAccordionController.prototype._getAllOverviewTrees = null;

// Public methods

/**
 * Returns the accordion, creating it if necessary, unless dontCreate is true.
 * @param dontCreate
 */
ZmAccordionController.prototype.getAccordion =
function(dontCreate) {
	if (!this._accordion && !dontCreate) {
		this._createAccordion();
	}
	return this._accordion;
};

/** Resets the contents of the accordion */
ZmAccordionController.prototype.reset =
function() {
	if (this._accordion) {
		var items = this._accordion.getItems();
		for (var i = 0, count = items.length; i < count; i++) {
			var item = items[i];
			if (item && item.control) {
				item.control.clear();
			}
		}
	}
};

/** Displays the overview for the specified accordion item. */
ZmAccordionController.prototype.showOverview =
function(item) {
	var accordion = item.accordion;
	accordion.expandItem(item.id);
	var overviewId = this.getOverviewId();
	var opc = appCtxt.getOverviewController();
	var overview = opc.getOverview(overviewId);
	if (!overview) {
		var params = this._getOverviewParams();
		params.overviewId = overviewId;
		overview = opc.createOverview(params);
		overview.set([], null, item.data.account);
		accordion.setItemContent(item.id, overview);
	}
	var app = appCtxt.getCurrentApp();
	if (app) {
		overview.setVisibleTrees(app._getOverviewTrees());
	}
};

ZmAccordionController.prototype._getOverviewParams =
function() {
	return {
		overviewId:this._accordionId,
		posStyle:Dwt.ABSOLUTE_STYLE,
		selectionSupported:true,
		actionSupported:true,
		dndSupported:true,
		showUnread:true,
		hideEmpty:this._getHideEmpty(),
		treeIds: this._getAllOverviewTrees()
	};
};

ZmAccordionController.prototype._getHideEmpty =
function() {
	var hideEmpty = {};
	hideEmpty[ZmOrganizer.SEARCH] = true;
	hideEmpty[ZmOrganizer.ZIMLET] = true;

	return hideEmpty;
};

