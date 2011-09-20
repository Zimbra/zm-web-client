/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2004-2011 Zimbra, Inc.
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
 * @class
 * @constructor 
 * @extends		DwtComposite
 */
ZmSearchResultsToolBar = function(parent, id) {

	DwtComposite.call(this, {parent:parent, className:"ZmSearchResultsToolBar", id:id, posStyle:DwtControl.ABSOLUTE_STYLE});

	this._createHtml();
};

ZmSearchResultsToolBar.prototype = new DwtComposite;
ZmSearchResultsToolBar.prototype.constructor = ZmSearchToolBar;

ZmSearchResultsToolBar.prototype.isZmSearchResultsToolBar = true;
ZmSearchResultsToolBar.prototype.toString = function() { return "ZmSearchResultsToolBar"; };

ZmSearchResultsToolBar.prototype._createHtml =
function() {

	this.getHtmlElement().innerHTML = AjxTemplate.expand("share.Widgets#ZmSearchResultsToolBar", {id:this._htmlElId});

	// add search input field
	var inputFieldId = this._htmlElId + "_inputField";
	var inputField = document.getElementById(inputFieldId);
	if (inputField) {
		this._searchField = new DwtInputField({parent:this, inputId:ZmId.SEARCHRESULTS_INPUTFIELD});
		var inputEl = this._searchField.getInputElement();
		inputEl.className = "search_input";
		this._searchField.reparentHtmlElement(inputFieldId);
	}

	// add search button
	this._searchButton = ZmToolBar.addButton({ parent:		this, 
											   tdId:		"_searchButton",
											   buttonId:	ZmId.getButtonId(ZmId.SEARCHRESULTS, ZmId.SEARCHRESULTS_SEARCH),
											   lbl:			ZmMsg.search,
//											   icon:		"Search",
//											   template: 	"dwt.Widgets#ZImageOnlyButton",
//											   className: 	"ZImageOnlyButton",
											   tooltip:		ZmMsg.searchTooltip });

	// add save search button if saved-searches enabled
	this._saveButton = ZmToolBar.addButton({ parent:	this, 
											 setting:	ZmSetting.SAVED_SEARCHES_ENABLED,
											 tdId:		"_saveButton",
											 buttonId:	ZmId.getButtonId(ZmId.SEARCHRESULTS, ZmId.SEARCHRESULTS_SAVE),
											 lbl:		ZmMsg.save,
//											 icon:		"Save",
//											 type:		"toolbar",
											 tooltip:	ZmMsg.saveSearchTooltip });
};
