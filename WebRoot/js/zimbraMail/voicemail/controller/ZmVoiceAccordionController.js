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
 * Creates the accordion controller.
 * @constructor
 * @class
 * This class controls the accordion in the voice overview.
 *
 * @param type		[constant]		type of organizer we are displaying/controlling
 */
ZmVoiceAccordionController = function(app, accordionId) {
	ZmAccordionController.call(this, accordionId);
	this._app = app;
}

ZmVoiceAccordionController.prototype = new ZmAccordionController;
ZmVoiceAccordionController.prototype.constructor = ZmVoiceAccordionController;

// Public methods

ZmVoiceAccordionController.prototype.toString =
function() {
	return "ZmVoiceAccordionController";
};

ZmVoiceAccordionController.prototype._initAccordion =
function() {
	this._accordion.addSelectionListener(new AjxListener(this, this._accordionSelectionListener));
	this._app.getVoiceInfo(new AjxCallback(this, this._createAccordionItems));
};

ZmVoiceAccordionController.prototype._createAccordionItems =
function() {
	var phones = this._app.phones;
	for (var i = 0; i < phones.length; i++) {
		var data = {lastFolder:null};
		var phone = phones[i];
		data.phone = phone;
		var item = this._accordion.addAccordionItem({title:phone.getDisplay(), data:data});
		if (i == 0) {
			this._activateAccordionItem(item);
		}
	}
};

ZmVoiceAccordionController.prototype._activateAccordionItem =
function(item) {
	this._app._activateAccordionItem(item);
	this._accordion.expandItem(item.id);

	var overviewId = this.getOverviewId(item);
	var overviewController = appCtxt.getOverviewController();
	if (!overviewController.getOverview(overviewId)) {
		var params = this._getOverviewParams();
		params.overviewId = overviewId;
		var overview = overviewController.createOverview(params);
		overview.set(this._app._getOverviewTrees(), null, item.data.account);
		this._accordion.setItemContent(item.id, overview);
	}
};

ZmVoiceAccordionController.prototype.getOverviewId =
function() {
	var accordionItem = this._accordion.getExpandedItem();
	var name = accordionItem.data.phone.name;
	return [this._accordionId, name].join(":");
};

ZmVoiceAccordionController.prototype._accordionSelectionListener =
function(ev) {
	var accordionItem = ev.detail;
	if (accordionItem == this.accordionItem) { return; }

	// Save most recent search.
	if (this.accordionItem) {
		var folder = appCtxt.getCurrentController().getFolder();
		if (folder && folder.phone == this.accordionItem.data.phone) {
			this.accordionItem.data.lastFolder = folder;
		}
	}

	// Run new search inside of accordion item.
	this.accordionItem = accordionItem;
	var folder = this.accordionItem.data.lastFolder;
	if (!folder) {
		var phone = this.accordionItem.data.phone;
		folder = ZmVoiceFolder.get(phone, ZmVoiceFolder.VOICEMAIL_ID);
	}
	if (folder) {
		this.showOverview(accordionItem);
		this._app.search(folder);
	}
	this._app._activateAccordionItem(accordionItem);
};

ZmVoiceAccordionController.prototype._getAllOverviewTrees =
function() {
	return this._app._getOverviewTrees();
};
