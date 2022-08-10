/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2009, 2010, 2011, 2012, 2013, 2014, 2016 Synacor, Inc.
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
 * All portions of the code are Copyright (C) 2009, 2010, 2011, 2012, 2013, 2014, 2016 Synacor, Inc. All Rights Reserved.
 * ***** END LICENSE BLOCK *****
 */

/**
 * Creates an overview container for the voice app.
 * @constructor
 * @class
 * Creates a header tree item for a phone number. For each phone, a ZmOverview 
 * is added as a child. 
 *
 * @author Parag Shah
 */
ZmVoiceOverviewContainer = function(params) {
	if (arguments.length == 0) { return; }

	params.className = "ZmVoiceOverviewContainer";
	ZmOverviewContainer.call(this, params);

	this.initialized = false;
};

ZmVoiceOverviewContainer.prototype = new ZmOverviewContainer;
ZmVoiceOverviewContainer.prototype.constructor = ZmVoiceOverviewContainer;


// Public methods

ZmVoiceOverviewContainer.prototype.toString = 
function() {
	return "ZmVoiceOverviewContainer";
};

ZmVoiceOverviewContainer.prototype.initialize =
function(params) {
	if (this.initialized) { return; }

	var deskPhone = false;
	var phones = params.phones;
	
	for (var i=0; i<phones.length; i++) {
		if (phones[i].phoneType == "DeskPhone") {
			deskPhone = phones[i];
		}
	}
	for (var i = 0; i < phones.length; i++) {
		var phone = phones[i];
		if(!phone.hasVoiceMail) {
			continue;
		}
		// create a top-level section header
		var headerLabel = deskPhone && deskPhone.name != phone.name ? deskPhone.getDisplay() : phone.getDisplay();
		var headerParams = {
			parent: this,
			text: headerLabel,
			className: "overviewHeader",
			imageInfo: "VoiceMailApp"
		};

		var header = this._headerItems[phone.id] = new DwtTreeItem(headerParams);
		header.setData(Dwt.KEY_ID, phone.id);
		header.setScrollStyle(Dwt.CLIP);
		header._initialize(null, true);

		// reset some params for child overviews
		var overviewId = appCtxt.getOverviewId([this.containerId, headerLabel].join(""));
		var overviewParams = {
			overviewId: overviewId,
			id: ZmId.getOverviewId(overviewId),
			parent: header,
			scroll: Dwt.CLIP,
			posStyle: Dwt.STATIC_STYLE,
			selectionSupported: true,
			actionSupported: true,
			dndSupported: true,
			showUnread: true
		};

		// next, create an overview for this account and add it to the account header
		var ov = this._controller._overview[overviewParams.overviewId] =
				 this._overview[overviewParams.overviewId] =
				 new ZmOverview(overviewParams, this._controller);

		ov.phone = ov.account = phone; // this is important! otherwise we can't differentiate overviews

		header._addItem(ov, null, true);
		header.addNodeIconListeners();
		header.setExpanded(true);

		// finally set treeviews for this overview
		ov.set(params.overviewTrees);
	}

	this.initialized = true;
};
