/*
 * ***** BEGIN LICENSE BLOCK *****
 * 
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2007 Zimbra, Inc.
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
* Creates an empty tree view.
* @constructor
* @class
* This class displays voicemail data in a tree structure. It overrides some of the rendering
* done in the base class, drawing the top-level account items as headers.
*
*/
ZmVoiceTreeView = function(params) {
	if (arguments.length == 0) return;

	params.headerClass = params.headerClass || "ZmVoiceTreeHeader";
	ZmTreeView.call(this, params);
};

ZmVoiceTreeView.prototype = new ZmTreeView;
ZmVoiceTreeView.prototype.constructor = ZmVoiceTreeView;

ZmTreeView.COMPARE_FUNC[ZmOrganizer.VOICE] = ZmVoiceFolder.sortCompare;

// Public methods

ZmVoiceTreeView.prototype.toString = 
function() {
	return "ZmVoiceTreeView";
};

// Creates a tree item for the organizer, and recurslively renders its children.
ZmVoiceTreeView.prototype._addNew =
function(parentNode, organizer, index) {
	if (organizer.callType == ZmVoiceFolder.ACCOUNT) {
		var item = this._createAccountItem(organizer, organizer.getName());
		this._render({treeNode:item, organizer:organizer});
	} else {
		ZmTreeView.prototype._addNew.call(this, parentNode, organizer, index);
	}
};

ZmVoiceTreeView.prototype._createAccountItem =
function(organizer) {
	var item = new DwtTreeItem({parent:this, className:"overviewHeader"});
	item.enableSelection(false);
	item.showExpansionIcon(false);
	item.setData(Dwt.KEY_ID, organizer.id);
	item.setData(Dwt.KEY_OBJECT, organizer);
	item.setData(ZmTreeView.KEY_ID, this.overviewId);
	item.setData(ZmTreeView.KEY_TYPE, this.type);

	// DwtAccordion voodoo
	var overview = appCtxt.getOverviewController().getOverview(ZmZimbraMail._OVERVIEW_ID);
	item.reparentHtmlElement(overview.getBody(organizer.accordionItemId));

	this._treeItemHash[organizer.id] = item;
	return item;
};
