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
 * This class represents a search toolbar that shows up above search results. It can be
 * used to refine the search results. Each search term is contained within a bubble that
 * can easily be removed.
 * 
 * @param {hash}			params		a hash of parameters:
 * @param {DwtComposite}	parent		the parent widget
 * @param {string}			id			an explicit ID to use for the control's HTML element
 * 
 * @extends		ZmSearchToolBar
 * 
 * @author Conrad Damon
 */
ZmSearchResultsToolBar = function(params) {

	params.posStyle = Dwt.ABSOLUTE_STYLE;
	params.className = "ZmSearchResultsToolBar";
	ZmSearchToolBar.apply(this, arguments);
	
	this.initAutocomplete();
};

ZmSearchResultsToolBar.prototype = new ZmSearchToolBar;
ZmSearchResultsToolBar.prototype.constructor = ZmSearchResultsToolBar;

ZmSearchResultsToolBar.prototype.isZmSearchResultsToolBar = true;
ZmSearchResultsToolBar.prototype.toString = function() { return "ZmSearchResultsToolBar"; };


ZmSearchResultsToolBar.prototype.TEMPLATE = "share.Widgets#ZmSearchResultsToolBar";

ZmSearchResultsToolBar.prototype._createHtml =
function() {

	this.getHtmlElement().innerHTML = AjxTemplate.expand(this.TEMPLATE, {id:this._htmlElId});

	// add search input field
	var inputFieldId = this._htmlElId + "_inputField";
	var inputField = document.getElementById(inputFieldId);
	if (inputField) {
		this._searchField = new DwtInputField({parent:this, inputId:ZmId.SEARCHRESULTS_INPUTFIELD});
		var inputEl = this._searchField.getInputElement();
		inputEl.className = "search_results_input";
		this._searchField.reparentHtmlElement(inputFieldId);
	}

	// add search button
	this._button[ZmSearchToolBar.SEARCH_BUTTON] = ZmToolBar.addButton({
				parent:		this, 
				tdId:		"_searchButton",
				buttonId:	ZmId.getButtonId(ZmId.SEARCHRESULTS, ZmId.SEARCHRESULTS_SEARCH),
				lbl:		ZmMsg.search,
				tooltip:	ZmMsg.searchTooltip
			});

	// add save search button if saved-searches enabled
	this._button[ZmSearchToolBar.SAVE_BUTTON] = ZmToolBar.addButton({
				parent:		this, 
				setting:	ZmSetting.SAVED_SEARCHES_ENABLED,
				tdId:		"_saveButton",
				buttonId:	ZmId.getButtonId(ZmId.SEARCHRESULTS, ZmId.SEARCHRESULTS_SAVE),
				lbl:		ZmMsg.save,
				tooltip:	ZmMsg.saveSearchTooltip
			});
};

// use the main search toolbar's autocomplete list
ZmSearchResultsToolBar.prototype.initAutocomplete =
function() {
	var mainSearchToolbar = appCtxt.getSearchController().getSearchToolbar();
	var aclv = mainSearchToolbar.getAutocompleteListView();
	var input = this.getSearchField();
	aclv.handle(input);
	aclv.addCallback(ZmAutocompleteListView.CB_KEYDOWN, new AjxCallback(this, this._handleKeyDown), input.id);
};
